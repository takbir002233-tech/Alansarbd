const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// POST /api/upload - Accepts base64 encoded image data or binary
router.post('/', (req, res) => {
  try {
    const { image, filename } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, message: 'No image data provided.' });
    }

    // Match base64 prefix
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let extension = '.jpg';
    let buffer;

    if (matches && matches.length === 3) {
      const mimeType = matches[1];
      if (mimeType.includes('png')) extension = '.png';
      else if (mimeType.includes('webp')) extension = '.webp';
      else if (mimeType.includes('svg')) extension = '.svg';
      else if (mimeType.includes('gif')) extension = '.gif';
      
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(image, 'base64');
    }

    const cleanName = (filename || 'photo')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 20);
    const uniqueFileName = `${cleanName}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}${extension}`;
    const filePath = path.join(UPLOADS_DIR, uniqueFileName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFileName}`;

    return res.status(201).json({
      success: true,
      message: 'Photo uploaded successfully!',
      url: publicUrl,
      filename: uniqueFileName
    });
  } catch (err) {
    console.error('Error uploading photo:', err);
    return res.status(500).json({ success: false, message: 'Server error saving uploaded photo.' });
  }
});

module.exports = router;
