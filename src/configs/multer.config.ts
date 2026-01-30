import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';

// Temporary upload directory
const TEMP_UPLOAD_DIR = 'uploads/temp';

// Ensure temp directory exists
if (!fs.existsSync(TEMP_UPLOAD_DIR)) {
  fs.mkdirSync(TEMP_UPLOAD_DIR, { recursive: true, mode: 0o755 });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save to temp directory first
    cb(null, TEMP_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Generate temporary filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `temp_${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed MIME types
  const allowedMimeTypes = [
    // PDF
    'application/pdf',
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    // Word documents
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // Excel spreadsheets
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  // Allowed extensions
  const allowedExtensions = [
    '.pdf',           // PDF
    '.jpg', '.jpeg', '.png', '.gif', '.webp',  // Images
    '.doc', '.docx',  // Word
    '.xls', '.xlsx'   // Excel
  ];
  
  const ext = path.extname(file.originalname).toLowerCase();

  // Check MIME type and extension
  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Allowed types: PDF, Images (JPG, PNG, GIF, WEBP), Word (DOC, DOCX), Excel (XLS, XLSX)`));
  }
};

// Multer configuration for single file upload
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 1 // Only one file at a time
  }
});

// Multer configuration for multiple file uploads
export const uploadMultiple = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max per file
    files: 10 // Maximum 10 files per request
  }
});

// Export configuration for use in routes
export default upload;
