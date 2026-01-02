const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create uploads folder if not exists
const uploadDir = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "_")
      .replace(/[^\w\-]/g, "");

    cb(null, `${uniqueSuffix}_${baseName}${ext}`);
  },
});

// Allowed MIME types and if any other format we can add here
const allowedTypes = [
  "audio/mpeg",   
  "audio/wav",        
  "audio/ogg",        
  "application/pdf", 
  "application/vnd.ms-excel", 
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
  "text/csv",     
  "application/msword", 
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document" // .docx
];

const fileFilter = (req, file, cb) => {
  console.log("File received:", file.mimetype);

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file format: ${file.originalname}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, 
  },
});

module.exports = upload;
