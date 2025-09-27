import json
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np
from tqdm import tqdm

safety_data = json.load(open('data/safety_trust_data.json'))

posts = safety_data['posts_for_safety_check']
users = {u["user_id"]: u for u in safety_data["user_safety_scores"]}

numeric_features = []
target_feature = []
texts = []


for post in tqdm(posts[:1], desc="Collecting user feature: "):
    user = users.get(post["user_id"], None)
    if not user:
        continue

    texts.append(post['content'])

    user_features = {
        float(post['is_duplicate']),
        user["reputation"],
        user["safety_score"],
        user["posts_created"]
    }

    numeric_features.append(user_features)
    target_feature.append(post['risk_level'])

vectorizer = TfidfVectorizer(max_features=100)
text_features = vectorizer.fit_transform(texts).toarray()

numeric_features = np.array(numeric_features)

print(numeric_features.shape)
print(text_features.shape)

X = np.concatenate([text_features, np.expand_dims(numeric_features, axis=1)], axis=1)


