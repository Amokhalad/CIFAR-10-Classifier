import json
import torch
import numpy as np
import os

from torchvision import datasets, transforms
from PIL import Image
from resnet import model

# Constants for image normalization
NORMALIZE_MEAN = (0.5, 0.5, 0.5)
NORMALIZE_STD = (0.5, 0.5, 0.5)
NUM_IMAGES = 10_000 

# CIFAR-10 class names
CLASS_NAMES = [
    'airplane', 'automobile', 'bird', 'cat', 'deer', 'dog',
    'frog', 'horse', 'ship', 'truck'
]

# Directory to save images
IMAGE_DIR = './images/'
os.makedirs(IMAGE_DIR, exist_ok=True)

# Load the CIFAR-10 dataset
transform_test = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize(NORMALIZE_MEAN, NORMALIZE_STD)
])

testset = datasets.CIFAR10(root='./data', train=False, download=True, transform=transform_test)

def get_prediction(image):
    model.eval()
    with torch.no_grad():
        outputs = model(image.unsqueeze(0))
        _, predicted = torch.max(outputs.data, 1)
    return CLASS_NAMES[predicted.item()]

def save_image(image_tensor, index):
    image = image_tensor.permute(1, 2, 0)  # Change the order of dimensions
    image = image * torch.tensor(NORMALIZE_STD) + torch.tensor(NORMALIZE_MEAN)  # Denormalize
    image = (image * 255).numpy().astype(np.uint8)  # Convert to uint8
    pil_img = Image.fromarray(image)
    image_path = os.path.join(IMAGE_DIR, f'image_{index}.png')
    pil_img.save(image_path)
    return image_path

data = []

for i in range(NUM_IMAGES):
    image, label = testset[i]
    image_path = save_image(image, i)
    prediction = get_prediction(image)
    label_name = CLASS_NAMES[label]
    data.append({
        'index': i,
        'image_path': image_path,
        'prediction': prediction,
        'label': label_name
    })

with open('static_data.json', 'w') as f:
    json.dump(data, f)
