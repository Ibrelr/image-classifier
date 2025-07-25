# classifier.py
import pytesseract
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
from transformers import CLIPProcessor, CLIPModel, pipeline
from PIL import Image
import torch
import numpy as np
import re

print("Loading CLIP model...")
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
print("CLIP model loaded successfully!")

# Improved category descriptions (prompts)
category_descriptions = {
    "Vehicles": [
        "a photo of a car", "a motor vehicle", "a red sports car", "a BMW car", "an automobile", "a truck", "a bus", "a van", "a vehicle in motion"
    ],
    "Brands": [
        "a brand logo", "a famous fast food brand logo", "company logo", "Burger King logo", "a logo on white background", "brand mark", "restaurant logo", "logo with text"
    ],
    "Buildings": [
        "a house exterior", "a residential building", "a modern house", "a commercial building", "real estate photo", "apartment building", "architecture", "a photo of a building"
    ],
    "Furniture": [
        "wooden garden furniture", "a planter box", "outdoor planter", "flower box", "garden decor", "wooden furniture with plants"
    ],
    "Medical": [
        "a medical image", "an X-ray image", "chest X-ray", "medical scan", "hospital image", "radiograph", "MRI scan", "CT scan", "ultrasound image"
    ],
    "Cartoon": [
        "a cartoon character", "an animated character", "a drawing", "a comic", "a cartoon car", "a cartoon animal", "a cartoon person", "a cartoon image", "an animation"
    ],
    "Documents": [
        "a document", "a scanned document", "a page of text", "a receipt", "a form", "a contract", "a letter", "a printed page", "a book page"
    ],
    "Food": [
        "a photo of food", "a restaurant meal", "something edible", "a burger", "a pizza", "a fast food meal", "a Burger King meal", "a sandwich", "a plate of food", "a food item"
    ],
    "People": [
        "a photo of a person", "a human face", "people", "a portrait", "a group of people", "a selfie", "a man", "a woman", "a child", "a crowd"
    ],
    "Nature": [
        "a photo of nature", "landscape", "outdoor scenery", "mountains", "forest", "beach", "river", "lake", "desert", "sunset"
    ],
    "Animals": [
        "a photo of an animal", "a pet", "wildlife", "a dog", "a cat", "a bird", "a horse", "a fish", "a lion", "an elephant"
    ],
    "Text": [
        "an image with text", "a text image", "a quote image", "a meme with text", "a logo with text", "a sign with text", "a document with text"
    ],
    "Other": [
        "a miscellaneous photo", "an object", "something else", "an unknown image", "an abstract image", "a random image"
    ]
}

categories = list(category_descriptions.keys())

# ImageNet fallback and OCR fallback remain unchanged
imagenet_classifier = None
ocr_keywords = {
    'burger king': 'Brands', 'bmw': 'Vehicles', 'mcdonald': 'Brands', 'logo': 'Brands', 'receipt': 'Documents', 'invoice': 'Documents', 'contract': 'Documents', 'scan': 'Documents', 'x-ray': 'Medical', 'radiograph': 'Medical', 'meme': 'Cartoon', 'cartoon': 'Cartoon', 'sketch': 'Cartoon', 'art': 'Cartoon', 'painting': 'Cartoon', 'screenshot': 'Documents', 'quote': 'Text', 'text': 'Text', 'sign': 'Text', 'food': 'Food', 'pizza': 'Food', 'burger': 'Food', 'car': 'Vehicles', 'vehicle': 'Vehicles', 'animal': 'Animals', 'dog': 'Animals', 'cat': 'Animals', 'nature': 'Nature', 'building': 'Buildings', 'house': 'Buildings', 'person': 'People', 'man': 'People', 'woman': 'People', 'child': 'People', 'face': 'People'
}

def classify_with_imagenet(pil_image, debug=False):
    global imagenet_classifier
    if imagenet_classifier is None:
        imagenet_classifier = pipeline("image-classification", model="google/vit-base-patch16-224")
    results = imagenet_classifier(pil_image)
    class_mappings = {
        'sports_car': 'Vehicles', 'convertible': 'Vehicles', 'limousine': 'Vehicles', 'car_wheel': 'Vehicles', 'car': 'Vehicles', 'jeep': 'Vehicles', 'cab': 'Vehicles', 'minivan': 'Vehicles', 'race_car': 'Vehicles', 'truck': 'Vehicles', 'bus': 'Vehicles', 'motor_scooter': 'Vehicles', 'motorcycle': 'Vehicles', 'bicycle': 'Vehicles', 'ambulance': 'Vehicles', 'fire_engine': 'Vehicles', 'police_van': 'Vehicles', 'taxi': 'Vehicles', 'wagon': 'Vehicles', 'pickup': 'Vehicles', 'SUV': 'Vehicles', 'van': 'Vehicles', 'sedan': 'Vehicles', 'coupe': 'Vehicles', 'convertible': 'Vehicles', 'food': 'Food', 'restaurant': 'Food', 'hamburger': 'Food', 'pizza': 'Food', 'logo': 'Brands', 'person': 'People', 'man': 'People', 'woman': 'People', 'dog': 'Animals', 'cat': 'Animals', 'building': 'Buildings', 'house': 'Buildings', 'nature': 'Nature', 'tree': 'Nature', 'flower': 'Nature', 'plant': 'Nature', 'x-ray': 'Medical', 'radiograph': 'Medical', 'hospital': 'Medical', 'cartoon': 'Cartoon', 'comic': 'Cartoon', 'drawing': 'Cartoon', 'sketch': 'Cartoon', 'art': 'Cartoon', 'painting': 'Cartoon', 'meme': 'Cartoon', 'screenshot': 'Documents', 'document': 'Documents', 'text': 'Text', 'quote': 'Text', 'abstract': 'Other', 'random': 'Other', 'unknown': 'Other'
    }
    top_result = results[0]
    if debug:
        print(f"[ImageNet pipeline] Top label: {top_result['label']} ({top_result['score']:.2f})")
    for keyword, category in class_mappings.items():
        if keyword in top_result['label'].lower():
            if debug:
                print(f"[ImageNet pipeline] Mapped to: {category}")
            return category, top_result['score']
    return 'Other', top_result['score']

def classify_with_ocr(pil_image, debug=False):
    try:
        text = pytesseract.image_to_string(pil_image)
        if debug:
            print(f"[OCR] Detected text: {text.strip()}")
        text_lower = text.lower()
        for keyword, category in ocr_keywords.items():
            if keyword in text_lower:
                if debug:
                    print(f"[OCR] Mapped to: {category}")
                return category, 0.95
        return None, 0.0
    except Exception as e:
        if debug:
            print(f"[OCR] Error: {e}")
        return None, 0.0

def classify_image_pil(pil_image, debug=False):
    try:
        image = pil_image.convert("RGB")
        all_scores = []
        # CLIP scoring with improved prompts
        for cat in categories:
            prompts = category_descriptions[cat]
            scores = []
            for prompt in prompts:
                inputs = processor(text=[prompt], images=image, return_tensors="pt", padding=True)
                with torch.no_grad():
                    outputs = model(**inputs)
                    similarity = outputs.logits_per_image[0][0].item()
                    scores.append(similarity)
            avg_score = np.mean(scores)
            all_scores.append(avg_score)
        # Top-3 output
        scores_tensor = torch.tensor(all_scores)
        top_probs, top_indices = torch.topk(scores_tensor, 3)
        if debug:
            print("=== CLIP Top-3 Categories ===")
            for i in range(3):
                print(f"{categories[top_indices[i]]}: {top_probs[i].item():.2f}")
            print("=============================")
        best_idx = torch.argmax(scores_tensor).item()
        best_category = categories[best_idx]
        best_score = scores_tensor[best_idx].item()
        # Vehicle-specific boost (optional, can be removed if not needed)
        vehicle_indicators = [
            "a red sports car", "a car on the road", "an automobile", "a vehicle in motion", "transportation"
        ]
        vehicle_scores = []
        for prompt in vehicle_indicators:
            inputs = processor(text=[prompt], images=image, return_tensors="pt", padding=True)
            with torch.no_grad():
                outputs = model(**inputs)
                score = outputs.logits_per_image[0][0].item()
                vehicle_scores.append(score)
        max_vehicle_score = max(vehicle_scores)
        if debug:
            print(f"Vehicle indicator max score: {max_vehicle_score:.3f}")
        if max_vehicle_score > 15:
            best_category = 'Vehicles'
            best_score = max_vehicle_score + 5
            if debug:
                print(f"[BOOST] Vehicle detected, force Vehicles with score {best_score:.3f}")
        # OCR fallback for logo/text/meme/document
        ocr_category, ocr_conf = classify_with_ocr(image, debug=debug)
        if ocr_category:
            if debug:
                print(f"[OCR] Overriding to: {ocr_category}")
            return ocr_category, ocr_conf
        # Fallback to ImageNet pipeline if CLIP fails
        if best_category == "Other" or best_score < 10:
            print("⚠️ CLIP usikker, prøver ImageNet pipeline...")
            imagenet_category, imagenet_conf = classify_with_imagenet(image, debug=debug)
            if imagenet_category != 'Other':
                return imagenet_category, imagenet_conf
        # Heuristics: filnavn
        if hasattr(pil_image, 'filename'):
            fname = pil_image.filename.lower()
            for keyword, category in ocr_keywords.items():
                if keyword in fname:
                    if debug:
                        print(f"[Heuristic] Filename match: {keyword} -> {category}")
                    return category, 0.90
        # Always return a category
        confidence = min(max((best_score + 30) / 40, 0.0), 1.0)
        if debug:
            print(f"[FAILSAFE] Returning: {best_category} ({confidence:.2f})")
        return best_category, confidence
    except Exception as e:
        print(f"Classification error: {e}")
        return "Other", 0.0

def classify_image_path(image_path, debug=False):
    try:
        pil_image = Image.open(image_path)
        pil_image.filename = image_path
        return classify_image_pil(pil_image, debug=debug)
    except Exception as e:
        print(f"Error loading image from path {image_path}: {e}")
        return "Other", 0.0

def test_classification():
    test_image = Image.new('RGB', (224, 224), color='blue')
    result = classify_image_pil(test_image, debug=True)
    print(f"Test result: {result}")
    return result

if __name__ == "__main__":
    print("Testing improved CLIP classifier with better prompts and Top-3 output...")
    test_classification()