const { SESClient } = require("@aws-sdk/client-ses");

const { AWS_CONFIG } = require("../envConfig");

const ses = new SESClient({
  region: AWS_CONFIG.REGION,
  credentials: {
    accessKeyId: AWS_CONFIG.ACCESS_KEY_ID,
    secretAccessKey: AWS_CONFIG.SECRET_ACCESS_KEY,
  },
});

module.exports = ses;
