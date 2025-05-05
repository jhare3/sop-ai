const fs = require('fs');
const path = require('path');
const PDFLib = require('pdf-lib');

// Function to recursively find all PDF files in a directory and subdirectories
function getAllPDFs(dirPath) {
  let pdfFiles = [];
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // If it's a directory, recursively search inside it
      pdfFiles = pdfFiles.concat(getAllPDFs(fullPath));
    } else if (stat.isFile() && file.endsWith('.pdf')) {
      // If it's a PDF file, add it to the array
      pdfFiles.push(fullPath);
    }
  });

  return pdfFiles;
}

async function mergePDFs() {
  const pdfsDirectory = path.join(__dirname, '..', 'sop_pdfs');
  const pdfFiles = getAllPDFs(pdfsDirectory);  // Get all PDFs in the directory and subdirectories

  if (pdfFiles.length === 0) {
    console.log('No PDF files found to merge.');
    return;
  }

  console.log(`Found ${pdfFiles.length} PDF files to merge.`);

  // Create a new PDF document
  const mergedPdf = await PDFLib.PDFDocument.create();

  for (const pdfFile of pdfFiles) {
    const existingPdfBytes = fs.readFileSync(pdfFile);
    
    // Load the PDF and ignore encryption if present
    const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes, { ignoreEncryption: true });
    
    const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPages().map((_, index) => index));
    pages.forEach(page => mergedPdf.addPage(page));
  }

  // Save the merged PDF to a file
  const mergedPdfBytes = await mergedPdf.save();
  const outputFilePath = path.join(__dirname, 'merged_output.pdf');
  fs.writeFileSync(outputFilePath, mergedPdfBytes);

  console.log(`Successfully merged ${pdfFiles.length} PDFs into one. Output saved at: ${outputFilePath}`);
}

mergePDFs().catch(err => console.error('Error merging PDFs:', err));
