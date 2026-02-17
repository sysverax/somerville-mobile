const { SQSClient } = require("@aws-sdk/client-sqs");
const { AWS_CONFIG } = require("../envConfig");

const SQS = new SQSClient({
  region: AWS_CONFIG.REGION,
  credentials: {
    accessKeyId: AWS_CONFIG.ACCESS_KEY_ID,
    secretAccessKey: AWS_CONFIG.SECRET_ACCESS_KEY,
  },
});

module.exports = SQS;
