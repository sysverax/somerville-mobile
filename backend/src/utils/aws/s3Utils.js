const { randomUUID } = require("crypto");

const s3 = require("../../config/aws/s3");
const { AWS_CONFIG } = require("../../config/envConfig");
const appError = require("../errors/errors");

const AWS_S3_BUCKET = AWS_CONFIG.S3_BUCKET;

const ensureS3BucketConfigured = () => {
  if (!AWS_S3_BUCKET) {
    throw new appError.InternalServerError(
      "S3 bucket is not configured",
      "Missing AWS_S3_BUCKET environment variable.",
      "Set AWS_S3_BUCKET in your backend environment variables.",
    );
  }
};

const parseBase64Image = (base64Image) => {
  if (!base64Image || typeof base64Image !== "string") {
    throw new appError.BadRequestError(
      "Invalid image payload",
      "Image payload must be a non-empty base64 string.",
      "Provide an image as a valid base64 string.",
    );
  }

  const dataUriRegex = /^data:(.+);base64,(.+)$/;
  const matches = base64Image.match(dataUriRegex);

  if (!matches) {
    throw new appError.BadRequestError(
      "Invalid image format",
      "Image must be a base64 data URI (data:<mime>;base64,<payload>).",
      "Send the image in base64 data URI format.",
    );
  }

  const contentType = matches[1];
  const encodedBody = matches[2];
  const body = Buffer.from(encodedBody, "base64");

  return {
    contentType,
    body,
  };
};

const getFileExtension = (contentType) => {
  const knownMimeTypes = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
  };

  return knownMimeTypes[contentType] || "bin";
};

const uploadImageToS3 = async ({ base64Image, folder = "brands" }) => {
  ensureS3BucketConfigured();

  const { contentType, body } = parseBase64Image(base64Image);
  const extension = getFileExtension(contentType);
  const key = `${folder}/${Date.now()}-${randomUUID()}.${extension}`;

  const uploadResult = await s3
    .upload({
      Bucket: AWS_S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
    .promise();

  return {
    key,
    url: uploadResult.Location,
  };
};

const uploadFileToS3 = async ({ file, folder = "brands" }) => {
  ensureS3BucketConfigured();

  if (!file || !file.buffer || !file.mimetype) {
    throw new appError.BadRequestError(
      "Invalid file upload",
      "Uploaded file is missing required metadata.",
      "Upload a valid image file and try again.",
    );
  }

  const extension = getFileExtension(file.mimetype);
  const key = `${folder}/${Date.now()}-${randomUUID()}.${extension}`;

  const uploadResult = await s3
    .upload({
      Bucket: AWS_S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
    .promise();

  return {
    key,
    url: uploadResult.Location,
  };
};

const getS3KeyFromUrl = (url) => {
  if (!url || typeof url !== "string") {
    return null;
  }

  try {
    const parsedUrl = new URL(url);
    return decodeURIComponent(parsedUrl.pathname.replace(/^\//, ""));
  } catch (_error) {
    return null;
  }
};

const deleteImageFromS3 = async (url) => {
  if (!AWS_S3_BUCKET) {
    return;
  }

  const key = getS3KeyFromUrl(url);
  if (!key) {
    return;
  }

  await s3
    .deleteObject({
      Bucket: AWS_S3_BUCKET,
      Key: key,
    })
    .promise();
};

module.exports = {
  uploadImageToS3,
  uploadFileToS3,
  deleteImageFromS3,
};
