const fs = require('fs');
const code = fs.readFileSync('src/components/ExtensionViewer.tsx', 'utf8');
const match = code.match(/popupJs: \{[\s\S]*?code: `([\s\S]*?)`,\n\s*\}/);
if (match) {
  const popupJsCode = match[1];
  fs.writeFileSync('extracted_popup.js', popupJsCode);
  console.log("Extracted popup.js successfully.");
} else {
  console.log("Not found");
}
