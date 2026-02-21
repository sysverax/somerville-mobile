#!/bin/bash

EC2_USER="ubuntu"
EC2_HOST="15.207.96.68"
PEM_FILE="/d/sysverax-projects/somerville-mobile/deploy/somerville-mobile-ssh.pem"
LOCAL_PATH="./frontend/customer-v1"
REMOTE_PATH="/home/ubuntu/apps/customer-v1"
APP_NAME="customer-v1"

echo "🚀 Starting deployment..."

cd "$LOCAL_PATH" || exit 1
# npm install
# npm run build

ssh -i "$PEM_FILE" "$EC2_USER@$EC2_HOST" "mkdir -p $REMOTE_PATH && rm -rf $REMOTE_PATH/*"

scp -i "$PEM_FILE" -r package.json package-lock.json .next public "$EC2_USER@$EC2_HOST:$REMOTE_PATH"

ssh -i "$PEM_FILE" "$EC2_USER@$EC2_HOST" "
cd $REMOTE_PATH
npm install --production
pm2 restart $APP_NAME || pm2 start npm --name $APP_NAME -- start
pm2 save
"

echo "🎉 Deployment completed!"
