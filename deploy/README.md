# 🚀 Somerville Mobile – Customer Frontend Deployment Guide

This guide explains how to:

- Build Next.js locally
- Transfer files to EC2
- Run with PM2
- Avoid EC2 crashing during build

---

# 📁 Project Structure

```
backend/
frontend/
   customer-v1/
deploy/
   somerville-mobile-ssh.pem
   customer.sh
```

---

# ⚙️ Server Details

- EC2 IP: `15.207.96.68`
- Username: `ubuntu`
- Remote Path:
  ```
  /home/ubuntu/somerville-mobile/frontend/customer-v1
  ```

---

# ✅ Why We Build Locally

Next.js build consumes high RAM.

Small EC2 instances (t2.micro / t3.micro) may crash during:

```
npm run build
```

So we:

1. Build locally
2. Transfer files
3. Install production dependencies on EC2
4. Restart PM2

---

# 🧰 Prerequisites

## On Local Machine

- Node.js installed
- Git Bash installed (Windows)
- rsync available (comes with Git Bash)

## On EC2 (Run Once)

```bash
sudo apt update
sudo apt install nodejs npm -y
sudo npm install -g pm2
```

---

# 🔐 Prepare SSH Key

Inside `deploy` folder:

```bash
chmod 400 somerville-mobile-ssh.pem
```

---

# 🛠 customer.sh Script

Create file:

```
deploy/customer.sh
```

Make it executable:

```bash
chmod +x customer.sh
```

---

# 🚀 How Deployment Works

### Step 1: Go to deploy folder

```bash
cd deploy
```

### Step 2: Run deployment

```bash
./customer.sh
```

---

# 📦 What customer.sh Does

1. Builds project locally
2. Transfers files using rsync
3. Installs production dependencies on EC2
4. Restarts PM2
5. Saves PM2 process

---

# 🔍 Useful PM2 Commands (On EC2)

```bash
pm2 list
pm2 logs
pm2 restart customer-v1
pm2 stop customer-v1
pm2 delete customer-v1
pm2 save
```

---

# 🔄 If App Not Running

SSH into server:

```bash
ssh -i deploy/somerville-mobile-ssh.pem ubuntu@15.207.96.68
```

Then:

```bash
cd /home/ubuntu/somerville-mobile/frontend/customer-v1
pm2 start npm --name "customer-v1" -- start
pm2 save
```

---

# 🌍 Access Application

After deployment:

```
http://15.207.96.68:3000
```

If using Nginx reverse proxy:

```
http://15.207.96.68
```

---

# 🔥 Production Recommendations

Minimum EC2 size:

```
t3.small (2GB RAM)
```

For better performance:

```
t3.medium (4GB RAM)
```

---

# 🛡 Best Practice Architecture

Recommended Production Setup:

```
Nginx → PM2 (Next.js) → Node
```

Optional:

- Enable HTTPS (Let's Encrypt)
- Use CloudFront if scaling
- Use RDS for backend database

---

# 🧯 Troubleshooting

### EC2 crashes during build

Do NOT build on EC2.
Build locally only.

---

### Permission denied (SSH key)

Run:

```bash
chmod 400 somerville-mobile-ssh.pem
```

---

### PM2 not found

Install:

```bash
sudo npm install -g pm2
```

---

# ✅ Deployment Flow Summary

```
Local Build → rsync → npm install --production → PM2 restart
```

---

# 🎯 Done

You now have a clean production deployment setup for:

Somerville Mobile – Customer Frontend 🚀

pm2 start npm --name "customer" -- start
