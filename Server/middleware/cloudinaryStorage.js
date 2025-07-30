// Replace your entire file with this corrected version:

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const handleAttachmentUpload = (req, res, next) => {

    attachmentParser.array('attachements', 10)(req, res, (err) => {
        if (err) {
            console.error("=== MULTER ERROR ===");
            console.error("Error name:", err.name);
            console.error("Error message:", err.message);
            console.error("Error code:", err.code);
            console.error("==================");

            // Handle specific multer errors
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'File too large. Maximum size is 5MB per file.' });
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).json({ error: 'Too many files. Maximum is 10 files.' });
            }
            if (err.message && err.message.includes('Invalid file type')) {
                return res.status(400).json({ error: err.message });
            }

            return res.status(500).json({ 
                error: 'File upload error', 
                details: err.message 
            });
        }

        
        next();
    });
};
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'projects-avatars',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill' }]
  },
});

// Storage for project attachments
const attachmentStorage = new CloudinaryStorage({
 cloudinary: cloudinary,
  params: (req, file) => {
    // Determine resource type based on file mimetype
    let resourceType;
    
    if (file.mimetype.startsWith('image/')) {
      resourceType = 'image'; // Images go to image/upload
    } else if (file.mimetype.startsWith('video/')) {
      resourceType = 'video'; // Videos go to video/upload
    } else {
      resourceType = 'raw'; // Everything else (PDFs, ZIPs, DOCs) goes to raw/upload
    }
    
    
    return {
      folder: 'project-attachments',
      resource_type: resourceType,
      access_mode: 'public',
      type: 'upload'
    };
  },
});

// Avatar parser
const parser = multer({ 
  storage: storage,
  limits: {
    fileSize: 1 * 1024 * 1024 // max size 1MB
  }
});

// Attachment parser with better error handling
const attachmentParser = multer({
  storage: attachmentStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 10 // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    

    const allowedTypes = [
       'application/pdf', 
  'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'application/vnd.ms-excel', // XLS
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX ✨ THIS MUST BE HERE
  'image/jpeg', 
  'image/jpg', 
  'image/png', 
  'application/zip',
  'application/x-zip-compressed',
  'text/plain'
    ];
    
   
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      console.log('❌ File type rejected:', file.mimetype);
      console.log('Available types:', allowedTypes.join(', '));
      cb(new Error(`Invalid file type: ${file.mimetype}. Supported formats: PDF, Word (DOC/DOCX), Excel (XLS/XLSX), Images (JPG/PNG), ZIP, TXT`), false);
    }
  }
});

module.exports = { 
  parser, 
  attachmentParser,
  handleAttachmentUpload
};