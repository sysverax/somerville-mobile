
# Admin portal
npm install -g serve
pm2 start serve --name "admin" -- -s dist -l 4000

# Customer Portal
pm2 start npm --name "customer" -- run start