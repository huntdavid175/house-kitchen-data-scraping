# Recipe Scraper Service

A service for scraping recipe ingredients and categorizing them as shipped or not shipped with meal kits.

## Prerequisites

- Node.js >= 18.0.0
- Docker and Docker Compose
- AWS Account
- PostgreSQL database (RDS recommended)
- AWS CLI configured

## Local Development with Docker

1. Build and start the containers:

```bash
docker-compose up --build
```

2. Stop the containers:

```bash
docker-compose down
```

3. View logs:

```bash
docker-compose logs -f app
```

## AWS Deployment with Docker

### 1. Database Setup

1. Create an RDS PostgreSQL instance in AWS
2. Configure security groups to allow access from your application
3. Update the database credentials in `.env`

### 2. ECS Setup

1. Create an ECS cluster:

   - Go to AWS ECS console
   - Create a new cluster
   - Choose Fargate (serverless) or EC2 launch type

2. Create a task definition:

   - Define container image
   - Set environment variables
   - Configure memory and CPU requirements

3. Create a service:
   - Link to your task definition
   - Configure desired number of tasks
   - Set up load balancer if needed

### 3. Deploy to ECS

1. Build and push Docker image to Amazon ECR:

```bash
# Login to ECR
aws ecr get-login-password --region your-region | docker login --username AWS --password-stdin your-account.dkr.ecr.your-region.amazonaws.com

# Build image
docker build -t recipe-scraper .

# Tag image
docker tag recipe-scraper:latest your-account.dkr.ecr.your-region.amazonaws.com/recipe-scraper:latest

# Push image
docker push your-account.dkr.ecr.your-region.amazonaws.com/recipe-scraper:latest
```

2. Update ECS service to use new image:
   - Go to ECS console
   - Select your service
   - Update task definition
   - Force new deployment

### 4. Monitoring

- View container logs in CloudWatch Logs
- Monitor ECS service metrics
- Set up CloudWatch alarms if needed

## Environment Variables

Required environment variables:

- `DB_HOST`: Database host
- `DB_PORT`: Database port
- `DB_NAME`: Database name
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password
- `AWS_REGION`: AWS region
- `LOG_LEVEL`: Logging level (default: info)
- `NODE_ENV`: Environment (development/production)

## Development

To run locally without Docker:

```bash
npm install
npm start
```
