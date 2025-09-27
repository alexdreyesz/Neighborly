import json
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.utils.class_weight import compute_class_weight
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report, f1_score
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import TensorDataset, DataLoader
import torch.nn.functional as F
from tqdm import tqdm
from torch.optim import Adam
import matplotlib.pyplot as plt
from collections import Counter
from imblearn.over_sampling import SMOTE
from imblearn.under_sampling import RandomUnderSampler
from imblearn.pipeline import Pipeline as ImbPipeline

safety_data = json.load(open('data/safety_trust_data.json'))
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

vectorizer = TfidfVectorizer(max_features=100, stop_words='english', ngram_range=(1,2))
text_features = vectorizer.fit_transform(texts).toarray()

numeric_features = np.array(numeric_features)
#numeric_features_scaled = scaler.fit_transform(numeric_features)

X = np.concatenate([text_features, numeric_features], axis=1)

le = LabelEncoder()
target_encoded = le.fit_transform(target_feature)

over_sampler = SMOTE(sampling_strategy={'HIGH': 200, 'MEDIUM': 1000}, random_state=42)
under_sampler = RandomUnderSampler(sampling_strategy={'LOW': 2000}, random_state=42)

sampling_pipeline = ImbPipeline([
    ('over', over_sampler),
    ('under', under_sampler)
])

target_strings = np.array(target_feature)
X_resampled, target_resampled = sampling_pipeline.fit_resample(X, target_strings)

target_encoded_resampled = le.transform(target_resampled)

print("Resampled class distribution:", Counter(target_resampled))

X_temp, X_test, y_temp, y_test = train_test_split(X_resampled, target_encoded_resampled, test_size=0.2, random_state=42, stratify=target_encoded_resampled)

X_train, X_val, y_train, y_val = train_test_split(X_temp, y_temp, test_size=0.25, random_state=42, stratify=y_temp)

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

train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=32, shuffle=False)
test_loader = DataLoader(test_dataset, batch_size=32, shuffle=False)

class RiskModel(nn.Module):
    def __init__(self, input_dim, output_dim, dropout_rate=0.3):
        super(RiskModel, self).__init__()
        self.fc1 = nn.Linear(input_dim, 128)
        self.fc2 = nn.Linear(128, 64)
        self.fc3 = nn.Linear(64, 32)
        self.output = nn.Linear(32, output_dim)
        self.dropout = nn.Dropout(dropout_rate)
        self.batch_norm1 = nn.BatchNorm1d(128)
        self.batch_norm2 = nn.BatchNorm1d(64)
        self.batch_norm3 = nn.BatchNorm1d(32)
        
    def forward(self, x):
        x = F.leaky_relu(self.batch_norm1(self.fc1(x)))
        x = self.dropout(x)
        x = F.leaky_relu(self.batch_norm2(self.fc2(x)))
        x = self.dropout(x)
        x = F.leaky_relu(self.batch_norm3(self.fc3(x)))
        x = self.dropout(x)
        x = self.output(x)
        return x

model = RiskModel(input_dim=X_train.shape[1], output_dim=len(le.classes_))
optimizer = Adam(model.parameters(), lr=0.001, weight_decay=1e-4)

class_weights = compute_class_weight('balanced', classes=np.unique(y_train), y=y_train)
class_weights_tensor = torch.tensor(class_weights, dtype=torch.float32)
print(f"Corrected class weights: {dict(zip(le.classes_[np.unique(y_train)], class_weights))}")

class FocalLoss(nn.Module):
    def __init__(self, alpha=class_weights_tensor, gamma=2.0):
        super(FocalLoss, self).__init__()
        self.alpha = alpha
        self.gamma = gamma
        
    def forward(self, inputs, targets):
        ce_loss = F.cross_entropy(inputs, targets, weight=self.alpha, reduction='none')
        pt = torch.exp(-ce_loss)
        focal_loss = ((1 - pt) ** self.gamma) * ce_loss
        return focal_loss.mean()

#loss_func = FocalLoss()
loss_func = nn.CrossEntropyLoss(weight=class_weights_tensor)


EPOCHS = 100
train_losses = []
val_losses = []
val_accuracies = []
val_f1_scores = []
best_val_f1 = 0
patience = 15
patience_counter = 0

print("Starting trianing")
for epoch in range(EPOCHS):
    model.train()
    total_train_loss = 0.0
    
    for batch_x, batch_y in train_loader:
        optimizer.zero_grad()
        outputs = model(batch_x)
        loss = loss_func(outputs, batch_y)
        loss.backward()
        optimizer.step()
        total_train_loss += loss.item()
    
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
    
    val_losses.append(avg_val_loss)
    val_accuracies.append(val_accuracy)
    val_f1_scores.append(val_f1)
    
    if val_f1 > best_val_f1:
        best_val_f1 = val_f1
        patience_counter = 0
        torch.save(model.state_dict(), 'best_safety_model.pth')
    else:
        patience_counter += 1
    
    if (epoch + 1) % 10 == 0:
        print(f"Epoch {epoch+1}/{EPOCHS}")
        print(f"  Train Loss: {avg_train_loss:.4f}")
        print(f"  Val Loss: {avg_val_loss:.4f}")
        print(f"  Val Accuracy: {val_accuracy:.4f}")
        print(f"  Val F1-Score: {val_f1:.4f}")
    
    if patience_counter >= patience:
        print(f"Early stopping at epoch {epoch+1}")
        break



model.load_state_dict(torch.load('best_safety_model.pth'))

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

print("\nDetailed Classification Report:")
target_names = le.classes_
print(classification_report(test_targets, test_predictions, target_names=target_names, zero_division=0))

print("\nConfusion Matrix:")
cm = confusion_matrix(test_targets, test_predictions)
print("Predicted:  ", "  ".join(f"{cls:>6}" for cls in target_names))
for i, (true_cls, row) in enumerate(zip(target_names, cm)):
    print(f"True {true_cls:>4}: {row}")

plt.figure(figsize=(15, 5))

plt.subplot(1, 3, 1)
plt.plot(train_losses[:len(val_losses)], label='Training Loss')
plt.plot(val_losses, label='Validation Loss')
plt.title('Training and Validation Loss')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.legend()

plt.subplot(1, 3, 2)
plt.plot(val_accuracies, label='Validation Accuracy')
plt.title('Validation Accuracy')
plt.xlabel('Epoch')
plt.ylabel('Accuracy')
plt.legend()

plt.subplot(1, 3, 3)
plt.plot(val_f1_scores, label='Validation F1-Score (Macro)')
plt.title('Validation F1-Score')
plt.xlabel('Epoch')
plt.ylabel('F1-Score')
plt.legend()

plt.tight_layout()
plt.show()

print("\nTop TF-IDF features:")
feature_names = vectorizer.get_feature_names_out()
if hasattr(model, 'fc1'):
    first_layer_weights = model.fc1.weight.data.numpy()
    text_importance = np.abs(first_layer_weights[:, :len(feature_names)]).mean(axis=0)
    top_indices = np.argsort(text_importance)[-10:]
    
    for idx in reversed(top_indices):
        print(f"  {feature_names[idx]}: {text_importance[idx]:.4f}")

print(f"\nModel saved as 'best_safety_model.pth'")
print(f"Best validation F1-score: {best_val_f1:.4f}")