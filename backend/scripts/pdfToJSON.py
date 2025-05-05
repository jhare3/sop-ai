import pdfplumber
import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io
import json
import os

# ==== PATH CONFIGURATION ====
# Use relative paths from the scripts/ directory
pdf_path = os.path.join("..", "merged_output.pdf")
image_output_dir = "pdf_images"
output_json_path = "pdf_output.json"

# Create output directory for images if it doesn't exist
os.makedirs(image_output_dir, exist_ok=True)

# Final structured output list
combined_output = []

# ==== OPEN PDF FILE ====
print("Opening PDF...")
pdf_text = pdfplumber.open(pdf_path)
pdf_images = fitz.open(pdf_path)

# ==== PROCESS EACH PAGE ====
for i, (text_page, image_page) in enumerate(zip(pdf_text.pages, pdf_images)):
    print(f"Processing page {i + 1}...")

    # Extract text and tables using pdfplumber
    extracted_text = text_page.extract_text()
    extracted_tables = text_page.extract_tables()

    # If no text found, use OCR via Tesseract
    if not extracted_text or not extracted_text.strip():
        pix = image_page.get_pixmap(dpi=300)
        img = Image.open(io.BytesIO(pix.tobytes("png")))
        extracted_text = pytesseract.image_to_string(img)

    # Extract embedded images using PyMuPDF
    image_paths = []
    for img_index, img in enumerate(image_page.get_images(full=True)):
        xref = img[0]
        base_image = pdf_images.extract_image(xref)
        image_bytes = base_image["image"]
        image_ext = base_image["ext"]
        image_filename = f"page_{i + 1}_img_{img_index + 1}.{image_ext}"
        image_path = os.path.join(image_output_dir, image_filename)
        with open(image_path, "wb") as f:
            f.write(image_bytes)
        image_paths.append(image_path)

    # Build page output
    page_output = {
        "page": i + 1,
        "text": extracted_text.strip() if extracted_text else "",
        "tables": extracted_tables,
        "images": image_paths
    }

    combined_output.append(page_output)

# ==== SAVE TO JSON ====
print(f"Saving output to {output_json_path}...")
with open(output_json_path, "w", encoding="utf-8") as f:
    json.dump(combined_output, f, ensure_ascii=False, indent=2)

print("✅ Done! JSON and image files have been saved.")
