# Recipe Scraper Service

A service for scraping recipe ingredients and categorizing them as shipped or not shipped with meal kits.

## Prerequisites

- Node.js >= 18.0.0
- PostgreSQL (for local development)
- Git

## Local Development

1. Clone the repository:

```bash
git clone <your-repository-url>
cd recipe-scraper
```

2. Install dependencies:

```bash
npm install
```

3. Set up your local PostgreSQL database

4. Create `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=recipe_db
DB_USER=your_username
DB_PASSWORD=your_password
NODE_ENV=development
DB_SSL=false
```

5. Initialize the database:

```bash
npm run init-db
```

6. Start the application:

```bash
npm start
```

## AWS Deployment

### Prerequisites

- AWS Account
- AWS CLI installed and configured
- SSH key pair for EC2 instance

### 1. Create RDS Instance (PostgreSQL)

1. Go to AWS RDS Console
2. Click "Create database"
3. Choose PostgreSQL
4. Select "Free tier" if eligible
5. Configure:
   - DB instance identifier: `recipe-db`
   - Master username: (note this down)
   - Master password: (note this down)
   - VPC: Default VPC
   - Public access: Yes (for development, configure security properly for production)
6. Create database
7. Note down the endpoint URL

### 2. Create EC2 Instance

1. Go to AWS EC2 Console
2. Launch a new instance:
   - Name: `recipe-scraper`
   - AMI: Ubuntu Server 22.04 LTS
   - Instance type: t2.micro (free tier)
   - Key pair: Create or select existing
   - Network: Default VPC
   - Security group: Create new with:
     - SSH (port 22) from your IP
     - PostgreSQL (port 5432) from the instance's security group
3. Launch instance
4. Note down the public IP address

### 3. Configure Security Groups

1. RDS Security Group:

   - Allow inbound PostgreSQL (5432) from EC2 security group

2. EC2 Security Group:
   - Allow inbound SSH (22) from your IP
   - Allow outbound to all

### 4. Deploy Application

1. SSH into your EC2 instance:

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

2. Clone your repository:

```bash
git clone <your-repository-url>
cd recipe-scraper
```

3. Create `.env` file:

```bash
cat > .env << EOL
DB_HOST=your-rds-endpoint
DB_PORT=5432
DB_NAME=recipe_db
DB_USER=your-rds-username
DB_PASSWORD=your-rds-password
NODE_ENV=production
DB_SSL=true
EOL
```

4. Run the deployment script:

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### 5. Monitor Application

1. Check application status:

```bash
pm2 status
```

2. View logs:

```bash
pm2 logs recipe-scraper
```

3. Monitor memory usage:

```bash
pm2 monit
```

### 6. Common Operations

1. Restart application:

```bash
pm2 restart recipe-scraper
```

2. Update application:

```bash
git pull
pm2 restart recipe-scraper
```

3. View error logs:

```bash
pm2 logs recipe-scraper --err
```

### Troubleshooting

1. If Chrome fails to start:

```bash
sudo apt-get update
sudo apt-get install -y google-chrome-stable
```

2. If database connection fails:

- Check RDS security group settings
- Verify environment variables
- Test connection: `psql -h your-rds-endpoint -U your-username -d recipe_db`

3. If PM2 issues occur:

```bash
pm2 delete all
pm2 start ecosystem.config.js
```

## Project Structure

```
recipe-scraper/
├── db/
│   ├── db.js           # Database connection
│   └── db-init.js      # Database initialization
├── scripts/
│   ├── init-db.js      # Database initialization script
│   └── deploy.sh       # AWS deployment script
├── .env                # Environment variables (local)
├── .gitignore         # Git ignore file
├── index.js           # Main application file
├── package.json       # Project dependencies
├── README.md         # This file
└── ecosystem.config.js # PM2 configuration
```

## Support

For issues and feature requests, please create an issue in the repository.
