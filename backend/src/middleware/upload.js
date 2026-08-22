const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder and subfolders exist
const uploadDir = path.join(__dirname, '../../uploads');
const avatarDir = path.join(uploadDir, 'avatars');
const docDir = path.join(uploadDir, 'documents');

[uploadDir, avatarDir, docDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'avatar') {
      cb(null, avatarDir);
    } else {
      cb(null, docDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter for safety
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|webp|gif/;
  const allowedDocTypes = /pdf|doc|docx|txt|xls|xlsx|png|jpg|jpeg/;

  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const mime = file.mimetype;

  if (file.fieldname === 'avatar') {
    if (allowedImageTypes.test(ext) && (mime.startsWith('image/') || allowedImageTypes.test(mime))) {
      return cb(null, true);
    }
    return cb(new Error('Only image files (JPEG, PNG, WEBP, GIF) are allowed for avatar!'));
  }

  if (allowedDocTypes.test(ext)) {
    return cb(null, true);
  }

  return cb(new Error('Invalid file format. Allowed formats: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG'));
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter,
});

module.exports = upload;
