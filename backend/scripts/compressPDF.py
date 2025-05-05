import fitz  # PyMuPDF
from PIL import Image
import io

def compress_pdf(input_path, output_path, quality=75):
    # Open the original PDF
    pdf = fitz.open(input_path)

    # Iterate through each page in the document
    for page_num in range(pdf.page_count):
        page = pdf.load_page(page_num)
        images = page.get_images(full=True)

        for img in images:
            xref = img[0]
            base_image = pdf.extract_image(xref)
            pix = fitz.Pixmap(pdf, xref)

            # If the image has an alpha channel, convert it to RGB
            if pix.n > 4:  # CMYK image or image with alpha
                pix = fitz.Pixmap(fitz.csRGB, pix)

            # Convert to RGB and remove alpha channel if present
            if pix.alpha:
                pix = fitz.Pixmap(fitz.csRGB, pix)

            # Convert to PNG bytes
            img_bytes = pix.tobytes("png")
            img = Image.open(io.BytesIO(img_bytes))

            # Ensure the image is in RGB mode
            img = img.convert("RGB")

            # Compress the image and save to a temporary file
            output_img_io = io.BytesIO()
            img.save(output_img_io, format="PNG", quality=quality)
            output_img_io.seek(0)

            # Save the image to a temporary file
            temp_img_path = f"temp_image_{xref}.png"
            with open(temp_img_path, 'wb') as f:
                f.write(output_img_io.read())

            # Replace the image in the page with the compressed version
            page.insert_image(page.rect, filename=temp_img_path, overlay=True)

            # Clean up the pixmap object
            pix = None

    # Save the modified (compressed) PDF
    pdf.save(output_path, garbage=4, deflate=True, clean=True)
    pdf.close()
    print(f"✅ Compressed PDF saved to {output_path}")

# Compress the merged PDF
input_pdf = "backend/merged_output.pdf"  # Path to your original merged PDF
output_pdf = "backend/merged_output_compressed.pdf"  # Path to save the compressed PDF
compress_pdf(input_pdf, output_pdf)
