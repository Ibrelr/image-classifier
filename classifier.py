# classifier.py

from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import torch

# Last inn én gang (delt ressurs)
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# Kategorier
categories = {
    'People': "a photo of a person",
    'Food': "a photo of food",
    'Animals': "a photo of an animal",
    'Plants': "a photo of a plant",
    'Nature': "a photo of a landscape",
    'Buildings': "a photo of a building",
    'Vehicles': "a photo of a vehicle",
    'Other': "a miscellaneous photo"
}

def classify_image_pil(pil_image):
    """For Flask – tar PIL.Image"""
    image = pil_image.convert("RGB").resize((224, 224))
    text_inputs = list(categories.values())
    inputs = processor(text=text_inputs, images=image, return_tensors="pt", padding=True)
    outputs = model(**inputs)
    probs = outputs.logits_per_image.softmax(dim=1).squeeze()
    best_idx = torch.argmax(probs).item()
    category = list(categories.keys())[best_idx]
    return category, probs[best_idx].item()

def classify_image_path(image_path):
    """For Tkinter – tar bildefilens path"""
    pil_image = Image.open(image_path)
    return classify_image_pil(pil_image)
