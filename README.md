# Recipe Scraper Service

A service for scraping recipe ingredients and categorizing them as shipped or not shipped with meal kits.

## Prerequisites

- Node.js >= 18.0.0
- Docker and Docker Compose (for local development)
- AWS Account with Free Tier access
- AWS CLI configured

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

3. Create `.env` file for local development:

```bash
cp .env.example .env
```

4. Start the application with Docker:

```bash
docker-compose up --build
```

## AWS Deployment (Free Tier)

### 1. AWS Setup

1. Create an AWS account if you haven't already
2. Install AWS CLI:

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

3. Configure AWS CLI:

```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter your default region (e.g., us-east-1)
```

### 2. Database Setup (RDS)

1. Create a PostgreSQL RDS instance (Free Tier):

```bash
aws rds create-db-instance \
    --db-instance-identifier recipe-db \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --allocated-storage 20 \
    --master-username postgres \
    --master-user-password your_secure_password
```

2. Note down the endpoint URL when the instance is ready

### 3. EC2 Setup

1. Create a security group:

```bash
aws ec2 create-security-group \
    --group-name recipe-scraper-sg \
    --description "Security group for recipe scraper"

# Add inbound rules for SSH
aws ec2 authorize-security-group-ingress \
    --group-name recipe-scraper-sg \
    --protocol tcp \
    --port 22 \
    --cidr 0.0.0.0/0
```

2. Create an EC2 instance (Free Tier):

```bash
aws ec2 run-instances \
    --image-id ami-0cff7528ff583bf9a \
    --instance-type t2.micro \
    --key-name your-key-pair \
    --security-group-ids your-security-group-id
```

### 4. Deployment

1. Copy your project to EC2:

```bash
scp -i your-key.pem -r ./* ec2-user@your-ec2-ip:~/recipe-scraper/
```

2. SSH into your EC2 instance:

```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
```

3. Create production environment file:

```bash
cd recipe-scraper
cp .env.production .env
```

4. Update the .env file with your RDS details:

```
DB_HOST=your-db.xxxxx.region.rds.amazonaws.com
DB_PORT=5432
DB_NAME=recipe_db
DB_USER=postgres
DB_PASSWORD=your_secure_password
```

5. Run the deployment script:

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### 5. Monitoring

The deployment automatically sets up:

- CloudWatch alarms for CPU, Memory, and Disk usage
- Application-level resource monitoring
- Health check cron job

To view monitoring:

1. CloudWatch Metrics:

   - AWS Console → CloudWatch → Metrics
   - Look for metrics under "AWS/EC2" and "System/Linux"

2. Application Logs:

```bash
docker-compose -f docker-compose.prod.yml logs -f
```

3. Resource Monitor Stats:
   - Check CloudWatch Logs for resource usage statistics
   - Memory usage
   - CPU load
   - Scraping success rate

### 6. Maintenance

1. Check application status:

```bash
docker ps
```

2. Restart the application:

```bash
docker-compose -f docker-compose.prod.yml restart
```

3. View logs:

```bash
docker-compose -f docker-compose.prod.yml logs -f
```

4. Update the application:

```bash
git pull
./scripts/deploy.sh
```

### 7. Cost Management (Free Tier)

To stay within AWS Free Tier limits:

- RDS: Using db.t3.micro with 20GB storage
- EC2: Using t2.micro instance
- CloudWatch: Basic monitoring metrics

Monitor your AWS Billing Dashboard regularly to ensure you stay within Free Tier limits.

## Environment Variables

Required environment variables:

- `DB_HOST`: Database host
- `DB_PORT`: Database port (default: 5432)
- `DB_NAME`: Database name
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `NODE_ENV`: Environment (development/production)
- `DB_SSL`: SSL connection (true/false)

## Troubleshooting

1. If deployment fails:

   - Check EC2 instance status
   - Verify RDS connection
   - Check CloudWatch logs

2. If scraping fails:

   - Check application logs
   - Verify memory usage
   - Check network connectivity

3. If monitoring fails:
   - Verify CloudWatch agent installation
   - Check IAM permissions
   - Verify metric namespaces

## Support

For issues and feature requests, please create an issue in the repository.
