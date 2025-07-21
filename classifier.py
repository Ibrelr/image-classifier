# classifier.py

from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import torch
import numpy as np

# Last inn én gang (delt ressurs)
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# Forbedrede kategorier med bedre text prompts
categories = {
    'People': "a photo of a person, human face, people",
    'Food': "a photo of food, meal, restaurant dish, snack",
    'Animals': "a photo of an animal, pet, wildlife, dog, cat, bird",
    'Plants': "a photo of a plant, flower, tree, garden, vegetation",
    'Nature': "a photo of nature, landscape, outdoor scenery, mountains, forest, beach",
    'Buildings': "a photo of a building, architecture, house, construction, city",
    'Vehicles': "a photo of a vehicle, car, truck, motorcycle, bicycle, transportation",
    'Brands': "a photo of a logo, brand, company sign, advertisement",
    'Other': "a miscellaneous photo, object, item"
}

def classify_image_pil(pil_image, debug=False):
    """For Flask – tar PIL.Image"""
    try:
        # Proper image preprocessing
        image = pil_image.convert("RGB")
        
        if debug:
            print(f"Original image size: {image.size}")
            print(f"Image mode: {image.mode}")
        
        # Don't resize manually - let CLIP processor handle it
        text_inputs = list(categories.values())
        
        # Proper CLIP preprocessing
        inputs = processor(
            text=text_inputs, 
            images=image, 
            return_tensors="pt", 
            padding=True,
            truncation=True
        )
        
        if debug:
            print(f"Preprocessed image tensor shape: {inputs.pixel_values.shape}")
            print(f"Text tokens shape: {inputs.input_ids.shape}")
        
        with torch.no_grad():
            outputs = model(**inputs)
            
            # Get similarity scores
            logits_per_image = outputs.logits_per_image  # [1, num_categories]
            probs = logits_per_image.softmax(dim=1).squeeze()
            
            if debug:
                print(f"Raw logits: {logits_per_image}")
                print(f"Probabilities: {probs}")
                
                # Show all categories with scores
                category_names = list(categories.keys())
                for i, (cat, prob) in enumerate(zip(category_names, probs)):
                    print(f"{cat}: {prob:.3f} ({prob*100:.1f}%)")
            
            best_idx = torch.argmax(probs).item()
            category = list(categories.keys())[best_idx]
            confidence = probs[best_idx].item()
            
            # Minimum confidence threshold
            if confidence < 0.3:
                category = "Other"
                confidence = confidence * 0.8  # Reduce confidence for uncertain predictions
            
            if debug:
                print(f"Final prediction: {category} ({confidence:.3f})")
            
            return category, confidence
            
    except Exception as e:
        print(f"Classification error: {e}")
        return "Error", 0.0

def classify_image_path(image_path, debug=False):
    """For Tkinter – tar bildefilens path"""
    try:
        pil_image = Image.open(image_path)
        return classify_image_pil(pil_image, debug=debug)
    except Exception as e:
        print(f"Error loading image from path {image_path}: {e}")
        return "Error", 0.0

# Test function for debugging
def test_classification():
    """Test function to verify CLIP model works correctly"""
    # Create a simple test image
    test_image = Image.new('RGB', (224, 224), color='red')
    result = classify_image_pil(test_image, debug=True)
    print(f"Test result: {result}")
    return result

if __name__ == "__main__":
    print("Testing CLIP classifier...")
    test_classification()
