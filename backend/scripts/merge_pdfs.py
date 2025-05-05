import os
from pathlib import Path
from pypdf import PdfWriter, PdfReader

# Directory containing the PDFs
pdf_root = Path(__file__).resolve().parent.parent / "sop_pdfs"
output_path = Path(__file__).resolve().parent / "merged_output.pdf"

# Collect all PDF paths recursively
pdf_files = sorted(pdf_root.rglob("*.pdf"))

if not pdf_files:
    print("No PDF files found.")
    exit()

print(f"Found {len(pdf_files)} PDF files to merge.")

writer = PdfWriter()
skipped_files = []

for pdf_path in pdf_files:
    try:
        reader = PdfReader(str(pdf_path))
        for page in reader.pages:
            writer.add_page(page)
        print(f"Merged: {pdf_path}")
    except Exception as e:
        print(f"Skipped: {pdf_path} (Error: {e})")
        skipped_files.append((pdf_path, str(e)))

# Write the merged output
with open(output_path, "wb") as f:
    writer.write(f)

print(f"\n✅ Successfully saved merged PDF to: {output_path}")

# Optional: Log skipped files
if skipped_files:
    error_log_path = Path(__file__).resolve().parent / "merge_errors.log"
    with open(error_log_path, "w") as log:
        for pdf, error in skipped_files:
            log.write(f"{pdf}: {error}\n")
    print(f"⚠️ Some PDFs were skipped. See details in: {error_log_path}")
