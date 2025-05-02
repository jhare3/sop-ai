import os
import json
from pdf2image import convert_from_path
import pytesseract
from PIL import Image

# Path setup
BASE_DIR = os.path.dirname(__file__)
input_folder = os.path.join(BASE_DIR, "sop_pdfs", "01 POS & Front End")
temp_image_folder = os.path.join(BASE_DIR, "temp_images")
output_json = os.path.join(BASE_DIR, "..", "frontend", "src", "sops.json")

# Create temp image folder if it doesn't exist
if not os.path.exists(temp_image_folder):
    os.makedirs(temp_image_folder)

def extract_text_from_pdf(pdf_path):
    try:
        images = convert_from_path(pdf_path)
    except Exception as e:
        print(f"❌ Failed to process {os.path.basename(pdf_path)}: {e}")
        return None

    text = ""
    for i, image in enumerate(images):
        image_path = os.path.join(temp_image_folder, f"page_{i}.png")
        image.save(image_path, "PNG")
        text += pytesseract.image_to_string(Image.open(image_path)) + "\n"
    return text.strip()

def process_pdfs():
    sops_data = []

    if not os.path.exists(input_folder):
        print(f"❌ Input folder not found: {input_folder}")
        return

    files = [f for f in os.listdir(input_folder) if f.lower().endswith('.pdf')]

    for pdf_file in files:
        pdf_path = os.path.join(input_folder, pdf_file)
        print(f"📄 Converting PDF to images: {pdf_file}")
        extracted_text = extract_text_from_pdf(pdf_path)
        if extracted_text:
            sops_data.append({
                "title": os.path.splitext(pdf_file)[0],
                "content": extracted_text
            })

    try:
        with open(output_json, "w") as json_file:
            json.dump(sops_data, json_file, indent=2)
        print(f"✅ Successfully wrote data to {output_json}")
    except Exception as e:
        print(f"❌ Failed to write JSON file: {e}")

if __name__ == "__main__":
    process_pdfs()
