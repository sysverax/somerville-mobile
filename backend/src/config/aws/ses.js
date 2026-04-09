const { SESClient } = require("@aws-sdk/client-ses");

const { AWS_CONFIG } = require("../envConfig");

const sesConfig = {
  region: AWS_CONFIG.REGION,
};

if (AWS_CONFIG.ACCESS_KEY_ID && AWS_CONFIG.SECRET_ACCESS_KEY) {
  sesConfig.credentials = {
    accessKeyId: AWS_CONFIG.ACCESS_KEY_ID,
    secretAccessKey: AWS_CONFIG.SECRET_ACCESS_KEY,
  };
}

const ses = new SESClient(sesConfig);

module.exports = ses;
