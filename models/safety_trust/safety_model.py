import os
import json
import torch
import numpy as np
import torch.nn as nn
from tqdm import tqdm
from torch.optim import AdamW
from collections import Counter
import torch.nn.functional as F
import matplotlib.pyplot as plt
from imblearn.over_sampling import SMOTE
from sklearn.preprocessing import LabelEncoder, RobustScaler
from sklearn.model_selection import train_test_split
from imblearn.pipeline import Pipeline as ImbPipeline
from torch.utils.data import TensorDataset, DataLoader, WeightedRandomSampler
from imblearn.under_sampling import RandomUnderSampler
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.utils.class_weight import compute_class_weight
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report, f1_score
import warnings
warnings.filterwarnings('ignore')

torch.manual_seed(42)
np.random.seed(42)

safety_data = json.load(open('data/sim_data/safety_trust_data.json'))
posts = safety_data['posts_for_safety_check']
users = {u["user_id"]: u for u in safety_data["user_safety_scores"]}

numeric_features = []
target_feature = []
texts = []

for post in tqdm(posts, desc="Collecting features"):
    user = users.get(post["user_id"], None)
    if not user:
        continue

    texts.append(post['content'])
    
    user_features = [
        float(post['is_duplicate']),
        user["reputation"],
        user["safety_score"],
        user["posts_created"]
    ]
    
    numeric_features.append(user_features)
    target_feature.append(post['risk_level'])

print("Original class distribution:", Counter(target_feature))

vectorizer = TfidfVectorizer(
    max_features=500,  
    stop_words='english',
    ngram_range=(1, 3),
    min_df=2,
    max_df=0.95,
    sublinear_tf=True,
    norm='l2'
)
text_features = vectorizer.fit_transform(texts).toarray()

numeric_features = np.array(numeric_features)
scaler = RobustScaler() 
numeric_features_scaled = scaler.fit_transform(numeric_features)


X = np.concatenate([text_features, numeric_features_scaled], axis=1)

le = LabelEncoder()
target_encoded = le.fit_transform(target_feature)

over_sampler = SMOTE(sampling_strategy={'HIGH': 300, 'MEDIUM': 1200}, random_state=42, k_neighbors=3)
under_sampler = RandomUnderSampler(sampling_strategy={'LOW': 1800}, random_state=42)

sampling_pipeline = ImbPipeline([
    ('over', over_sampler),
    ('under', under_sampler)
])

target_strings = np.array(target_feature)
X_resampled, target_resampled = sampling_pipeline.fit_resample(X, target_strings)
target_encoded_resampled = le.transform(target_resampled)

print("Resampled class distribution:", Counter(target_feature))

X_temp, X_test, y_temp, y_test = train_test_split(
    X_resampled, target_encoded_resampled, 
    test_size=0.2, random_state=42, stratify=target_encoded_resampled
)

X_train, X_val, y_train, y_val = train_test_split(
    X_temp, y_temp, 
    test_size=0.25, random_state=42, stratify=y_temp
)

print(f"Train size: {len(X_train)}, Val size: {len(X_val)}, Test size: {len(X_test)}")

X_train_tensor = torch.tensor(X_train, dtype=torch.float32)
X_val_tensor = torch.tensor(X_val, dtype=torch.float32)
X_test_tensor = torch.tensor(X_test, dtype=torch.float32)
y_train_tensor = torch.tensor(y_train, dtype=torch.long)
y_val_tensor = torch.tensor(y_val, dtype=torch.long)
y_test_tensor = torch.tensor(y_test, dtype=torch.long)

train_dataset = TensorDataset(X_train_tensor, y_train_tensor)
val_dataset = TensorDataset(X_val_tensor, y_val_tensor)
test_dataset = TensorDataset(X_test_tensor, y_test_tensor)

class_sample_count = np.array([len(np.where(y_train == t)[0]) for t in np.unique(y_train)])
weight = 1. / class_sample_count
samples_weight = np.array([weight[t] for t in y_train])
samples_weight = torch.from_numpy(samples_weight).double()
sampler = WeightedRandomSampler(samples_weight, len(samples_weight))

train_loader = DataLoader(train_dataset, batch_size=64, sampler=sampler)  
val_loader = DataLoader(val_dataset, batch_size=64, shuffle=False)
test_loader = DataLoader(test_dataset, batch_size=64, shuffle=False)


class RiskModel(nn.Module):
    def __init__(self, input_dim, output_dim, dropout=0.3):
        super(RiskModel, self).__init__()
    
        self.text_features_dim = len(vectorizer.get_feature_names_out())
        self.numeric_features_dim = numeric_features.shape[1]
        
        self.text_bn1 = nn.BatchNorm1d(self.text_features_dim)
        self.text_fc1 = nn.Linear(self.text_features_dim, 256)
        self.text_bn2 = nn.BatchNorm1d(256)
        self.text_fc2 = nn.Linear(256, 128)
        
        self.numeric_bn1 = nn.BatchNorm1d(self.numeric_features_dim)
        self.numeric_fc1 = nn.Linear(self.numeric_features_dim, 32)
        self.numeric_bn2 = nn.BatchNorm1d(32)
        self.numeric_fc2 = nn.Linear(32, 16)
        
        combined_dim = 128 + 16
        self.combined_bn = nn.BatchNorm1d(combined_dim)
        self.fc1 = nn.Linear(combined_dim, 256)
        self.bn1 = nn.BatchNorm1d(256)
        self.fc2 = nn.Linear(256, 128)
        self.bn2 = nn.BatchNorm1d(128)
        self.fc3 = nn.Linear(128, 64)
        self.bn3 = nn.BatchNorm1d(64)
        self.output = nn.Linear(64, output_dim)
        
        self.dropout = nn.Dropout(p=dropout)
        self.activation = nn.LeakyReLU(0.1)
        
    def forward(self, x):
        text_features = x[:, :self.text_features_dim]
        numeric_features = x[:, self.text_features_dim:]
        
        text_out = self.text_bn1(text_features)
        text_out = self.activation(self.text_fc1(text_out))
        text_out = self.dropout(text_out)
        text_out = self.text_bn2(text_out)
        text_out = self.activation(self.text_fc2(text_out))
        text_out = self.dropout(text_out)
        
        numeric_out = self.numeric_bn1(numeric_features)
        numeric_out = self.activation(self.numeric_fc1(numeric_out))
        numeric_out = self.dropout(numeric_out)
        numeric_out = self.numeric_bn2(numeric_out)
        numeric_out = self.activation(self.numeric_fc2(numeric_out))
        
        combined = torch.cat([text_out, numeric_out], dim=1)
        combined = self.combined_bn(combined)
        
        x = self.activation(self.fc1(combined))
        x = self.bn1(x)
        x = self.dropout(x)
        
        x = self.activation(self.fc2(x))
        x = self.bn2(x)
        x = self.dropout(x)
        
        x = self.activation(self.fc3(x))
        x = self.bn3(x)
        x = self.dropout(x)
        
        x = self.output(x)
        return x

model = RiskModel(input_dim=X_train.shape[1], output_dim=len(le.classes_))


train_dataset = TensorDataset(X_train_tensor, y_train_tensor)
val_dataset = TensorDataset(X_val_tensor, y_val_tensor)
test_dataset = TensorDataset(X_test_tensor, y_test_tensor)

train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=64, shuffle=False)
test_loader = DataLoader(test_dataset, batch_size=64, shuffle=False)

optimizer = AdamW(model.parameters(), lr=0.001, weight_decay=1e-4, betas=(0.9, 0.999))
scheduler = torch.optim.lr_scheduler.CosineAnnealingWarmRestarts(optimizer, T_0=10, T_mult=2, eta_min=1e-6)

class_weights = compute_class_weight('balanced', classes=np.unique(y_train), y=y_train)
class_weights_tensor = torch.tensor(class_weights, dtype=torch.float32)
print(f"Class weights: {dict(zip(le.classes_[np.unique(y_train)], class_weights))}")


loss_func = nn.CrossEntropyLoss(weight=class_weights_tensor)

EPOCHS = 100
train_losses = []
val_losses = []
val_accuracies = []
val_f1_scores = []
best_val_f1 = 0
patience = 25
patience_counter = 0

print("Starting training...\n")

for epoch in range(EPOCHS):
    # Training phase
    model.train()
    total_train_loss = 0.0
    train_predictions = []
    train_targets = []
    
    for batch_x, batch_y in train_loader:
        optimizer.zero_grad()
        outputs = model(batch_x)
        loss = loss_func(outputs, batch_y)
        loss.backward()
        nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        optimizer.step()
        
        total_train_loss += loss.item()
        
        _, predicted = torch.max(outputs.data, 1)
        train_predictions.extend(predicted.cpu().numpy())
        train_targets.extend(batch_y.cpu().numpy())
    
    scheduler.step()
    avg_train_loss = total_train_loss / len(train_loader)
    train_losses.append(avg_train_loss)
    

    model.eval()
    total_val_loss = 0.0
    val_predictions = []
    val_targets = []
    
    with torch.no_grad():
        for batch_x, batch_y in val_loader:
            outputs = model(batch_x)
            loss = loss_func(outputs, batch_y)
            total_val_loss += loss.item()
            
            _, predicted = torch.max(outputs.data, 1)
            val_predictions.extend(predicted.cpu().numpy())
            val_targets.extend(batch_y.cpu().numpy())
    
    avg_val_loss = total_val_loss / len(val_loader)
    val_accuracy = accuracy_score(val_targets, val_predictions)
    val_f1 = f1_score(val_targets, val_predictions, average='macro')
    train_f1 = f1_score(train_targets, train_predictions, average='macro')
    
    val_losses.append(avg_val_loss)
    val_accuracies.append(val_accuracy)
    val_f1_scores.append(val_f1)
    
    if val_f1 > best_val_f1:
        best_val_f1 = val_f1
        patience_counter = 0
        if not os.path.exists("models/safety_trust/"):
            os.makedirs("models/safety_trust/")
        torch.save({
            'model_state_dict': model.state_dict(),
            'optimizer_state_dict': optimizer.state_dict(),
            'vectorizer': vectorizer,
            'label_encoder': le,
            'best_f1': best_val_f1,
            'epoch': epoch
        }, 'models/safety_trust/best_risk_model.pth')
    else:
        patience_counter += 1
    
    if (epoch + 1) % 10 == 0:
        current_lr = scheduler.get_last_lr()[0]
        print(f"Epoch {epoch+1}/{EPOCHS} | LR: {current_lr:.2e}")
        print(f"  Train Loss: {avg_train_loss:.4f} | Train F1: {train_f1:.4f}")
        print(f"  Val Loss: {avg_val_loss:.4f} | Val Acc: {val_accuracy:.4f} | Val F1: {val_f1:.4f}")
        print(f"  Best Val F1: {best_val_f1:.4f}")
    
    if patience_counter >= patience:
        print(f"Early stopping at epoch {epoch+1}")
        break

checkpoint = torch.load('models/safety_trust/best_risk_model.pth', weights_only=False)
model.load_state_dict(checkpoint['model_state_dict'])

print("=" * 50)
print("Training completed ✅")
print("=" * 50)

model.eval()
test_predictions = []
test_targets = []
test_probabilities = []

with torch.no_grad():
    for batch_x, batch_y in test_loader:
        outputs = model(batch_x)
        probabilities = F.softmax(outputs, dim=1)
        _, predicted = torch.max(outputs.data, 1)
        
        test_predictions.extend(predicted.cpu().numpy())
        test_targets.extend(batch_y.cpu().numpy())
        test_probabilities.extend(probabilities.cpu().numpy())

test_accuracy = accuracy_score(test_targets, test_predictions)
test_f1_macro = f1_score(test_targets, test_predictions, average='macro')
test_f1_weighted = f1_score(test_targets, test_predictions, average='weighted')

print(f"Final Test Results:")
print(f"  Accuracy: {test_accuracy:.4f}")
print(f"  F1-Score (Macro): {test_f1_macro:.4f}")
print(f"  F1-Score (Weighted): {test_f1_weighted:.4f}")
print(f"  Best Validation F1: {best_val_f1:.4f}")

print("\nDetailed Classification Report:")
target_names = le.classes_ 
print(classification_report(test_targets, test_predictions, target_names=target_names, zero_division=0))

print("\nConfusion Matrix:")
cm = confusion_matrix(test_targets, test_predictions)
print("Labels:", target_names)
print(cm)

plt.figure(figsize=(10, 5))

plt.subplot(2, 3, 1)
plt.plot(train_losses[:len(val_losses)], label='Training Loss', alpha=0.7)
plt.plot(val_losses, label='Validation Loss', alpha=0.7)
plt.title('Training and Validation Loss')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.legend()
plt.grid(True, alpha=0.3)

plt.subplot(2, 3, 2)
plt.plot(val_accuracies, label='Validation Accuracy', color='green', alpha=0.7)
plt.title('Validation Accuracy')
plt.xlabel('Epoch')
plt.ylabel('Accuracy')
plt.legend()
plt.grid(True, alpha=0.3)

plt.subplot(2, 3, 3)
plt.plot(val_f1_scores, label='Validation F1-Score (Macro)', color='red', alpha=0.7)
plt.title('Validation F1-Score')
plt.xlabel('Epoch')
plt.ylabel('F1-Score')
plt.legend()
plt.grid(True, alpha=0.3)

plt.subplot(2, 3, 4)
import seaborn as sns
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=target_names, yticklabels=target_names)
plt.title('Confusion Matrix')
plt.xlabel('Predicted')
plt.ylabel('Actual')

plt.subplot(2, 3, 5)
feature_names = vectorizer.get_feature_names_out()
if hasattr(model, 'text_fc1'):
    text_layer_weights = model.text_fc1.weight.data.cpu().numpy()
    text_importance = np.abs(text_layer_weights).mean(axis=0)
    top_indices = np.argsort(text_importance)[-15:]
    
    top_features = [feature_names[idx] for idx in top_indices]
    top_scores = text_importance[top_indices]
    
    plt.barh(range(len(top_features)), top_scores)
    plt.yticks(range(len(top_features)), top_features)
    plt.title('Top 15 Text Features (Importance)')
    plt.xlabel('Importance Score')

plt.subplot(2, 3, 6)
original_counts = [Counter(target_feature)[cls] for cls in le.classes_]
resampled_counts = [Counter(target_resampled)[cls] for cls in le.classes_]

x = np.arange(len(le.classes_))
width = 0.35

plt.bar(x - width/2, original_counts, width, label='Original', alpha=0.7)
plt.bar(x + width/2, resampled_counts, width, label='Resampled', alpha=0.7)
plt.xlabel('Risk Level')
plt.ylabel('Count')
plt.title('Class Distribution')
plt.xticks(x, le.classes_)
plt.legend()
plt.yscale('log')

plt.tight_layout()
plt.show()

print("\nTop 15 TF-IDF features by importance:")
if hasattr(model, 'text_fc1'):
    text_layer_weights = model.text_fc1.weight.data.cpu().numpy()
    text_importance = np.abs(text_layer_weights).mean(axis=0)
    top_indices = np.argsort(text_importance)[-15:]
    
    for idx in reversed(top_indices):
        print(f"  {feature_names[idx]}: {text_importance[idx]:.4f}")

print(f"Best validation F1-score: {best_val_f1:.4f}")
print(f"Total parameters: {sum(p.numel() for p in model.parameters()):,}")
print(f"Trainable parameters: {sum(p.numel() for p in model.parameters() if p.requires_grad):,}")

