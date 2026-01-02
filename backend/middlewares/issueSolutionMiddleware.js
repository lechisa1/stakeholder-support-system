const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Allowed file types (you can adjust if needed)
const allowedTypes = [
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];

// Directory for solution uploads
const solutionUploadDir = path.join(__dirname, "../public/uploads/solutions");
if (!fs.existsSync(solutionUploadDir)) {
  fs.mkdirSync(solutionUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, solutionUploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "_")
      .replace(/[^\w\-]/g, "");
    cb(null, `${uniqueSuffix}_${baseName}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error(`Unsupported file format: ${file.originalname}`), false);
};

const uploadSolution = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
});

module.exports = uploadSolution;
