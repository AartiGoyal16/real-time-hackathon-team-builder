const fs = require('fs');
const PDFDocument = require('pdfkit');

const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('test_resume.pdf'));
doc.text('This is a test resume for John Doe. Skills: React, Node.js, Next.js');
doc.end();
