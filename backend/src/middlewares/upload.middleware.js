const multer = require("multer");

const appError = require("../utils/errors/errors");

const MAX_FILE_SIZE = 5 * 1024 * 1024;  // 5MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
//   "image/gif",
  "image/svg+xml",
];

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new appError.BadRequestError(
        "Unsupported file type",
        `The file '${file.originalname}' has unsupported type '${file.mimetype}'.`,
        "Upload only jpeg, png, webp, or svg image files.",
      ),
    );
  }

  return cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
});

const multerErrorHandler = (err, req, res, next) => {
  if (!err) {
    return next();
  }

  if (err instanceof appError.AppError) {
    return next(err);
  }

  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    return next(
      new appError.BadRequestError(
        "File too large",
        "Uploaded file size exceeds the allowed limit of 5MB.",
        "Upload a smaller image file and try again.",
      ),
    );
  }

  return next(
    new appError.BadRequestError(
      "Invalid upload request",
      err.message || "The upload request is invalid.",
      "Check the upload payload and try again.",
    ),
  );
};

const uploadBrandImages = (req, res, next) => {
  const handler = upload.fields([
    { name: "iconImage", maxCount: 1 },
    { name: "bannerImage", maxCount: 1 },
  ]);

  handler(req, res, (err) => multerErrorHandler(err, req, res, next));
};

const uploadCategoryImages = (req, res, next) => {
  const handler = upload.fields([
    { name: "iconImage", maxCount: 1 },
  ]);

  handler(req, res, (err) => multerErrorHandler(err, req, res, next));
};

module.exports = {
  uploadBrandImages,
  uploadCategoryImages,
};
