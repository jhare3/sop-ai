const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const CHATPDF_API_KEY = process.env.CHATPDF_API_KEY;
const mergedPDFPath = path.join(__dirname, '..', 'merged_output.pdf');
const outputJsonPath = path.join(__dirname, '..', 'sourceIds.json');

const uploadPDF = async (filePath) => {
  const fileName = path.basename(filePath);
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));

  try {
    const response = await fetch('https://api.chatpdf.com/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CHATPDF_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload ${fileName}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`✅ Successfully uploaded ${fileName}`);
    return result;

  } catch (error) {
    console.error(`❌ Error uploading ${fileName}:`, error.message);
    return null;
  }
};

fs.access(mergedPDFPath, fs.constants.F_OK, async (err) => {
  if (err) {
    console.error('❌ Merged PDF not found at path:', mergedPDFPath);
    return;
  }

  console.log('📤 Uploading merged PDF...');
  const result = await uploadPDF(mergedPDFPath);

  if (result && result.sourceId) {
    const sourceMap = {
      [mergedPDFPath]: result.sourceId,
    };

    fs.writeFileSync(outputJsonPath, JSON.stringify(sourceMap, null, 2));
    console.log(`💾 Saved sourceId to ${outputJsonPath}`);
  } else {
    console.error('❌ Upload failed or sourceId not returned.');
  }
});
