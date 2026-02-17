const AWS = require("aws-sdk");

const { AWS_CONFIG } = require("../envConfig");

AWS.config.update({
  accessKeyId: AWS_CONFIG.ACCESS_KEY_ID,
  secretAccessKey: AWS_CONFIG.SECRET_ACCESS_KEY,
  region: AWS_CONFIG.REGION,
});

const s3 = new AWS.S3({
  signatureVersion: "v4",
});

module.exports = s3;
