const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Automatically converts base64 image strings to saved static files in /uploads/
 * If already a URL or path, returns it unchanged.
 */
function saveBase64Image(dataUriOrBase64, prefix = 'photo') {
  if (!dataUriOrBase64 || typeof dataUriOrBase64 !== 'string') {
    return dataUriOrBase64;
  }

  // Already a URL or file path
  if (!dataUriOrBase64.startsWith('data:image/') && dataUriOrBase64.length < 500) {
    return dataUriOrBase64;
  }

  try {
    let extension = '.jpg';
    let base64Content = dataUriOrBase64;

    const matches = dataUriOrBase64.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const mime = matches[1].toLowerCase();
      if (mime.includes('png')) extension = '.png';
      else if (mime.includes('webp')) extension = '.webp';
      else if (mime.includes('svg')) extension = '.svg';
      else if (mime.includes('gif')) extension = '.gif';
      else extension = '.jpg';

      base64Content = matches[2];
    } else if (dataUriOrBase64.length > 500 && !dataUriOrBase64.startsWith('http') && !dataUriOrBase64.startsWith('/')) {
      base64Content = dataUriOrBase64;
      extension = '.jpg';
    } else {
      return dataUriOrBase64;
    }

    const buffer = Buffer.from(base64Content, 'base64');
    const cleanPrefix = (prefix || 'photo').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
    const uniqueFileName = `${cleanPrefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}${extension}`;
    const filePath = path.join(UPLOADS_DIR, uniqueFileName);

    fs.writeFileSync(filePath, buffer);
    return `/uploads/${uniqueFileName}`;
  } catch (err) {
    console.error('Failed to save base64 image:', err);
    return dataUriOrBase64;
  }
}

/**
 * Cleans an object by converting any base64 photo fields to file URLs
 */
function sanitizePhotoFields(obj, prefix = 'img') {
  if (!obj || typeof obj !== 'object') return obj;
  const photoKeys = ['nid_front_photo', 'nid_back_photo', 'user_photo', 'thumbnail'];
  const sanitized = { ...obj };

  for (const key of photoKeys) {
    if (sanitized[key]) {
      sanitized[key] = saveBase64Image(sanitized[key], `${prefix}_${key}`);
    }
  }

  if (Array.isArray(sanitized.images)) {
    sanitized.images = sanitized.images.map((img, idx) => saveBase64Image(img, `${prefix}_slide_${idx}`));
  }

  return sanitized;
}

module.exports = {
  saveBase64Image,
  sanitizePhotoFields
};
