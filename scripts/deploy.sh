#!/bin/bash

# Exit on any error
set -e

# Load environment variables
source .env.production

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "AWS CLI is not installed. Installing..."
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    sudo ./aws/install
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Installing..."
    sudo yum update -y
    sudo amazon-linux-extras install docker -y
    sudo service docker start
    sudo usermod -a -G docker ec2-user
fi

# Install CloudWatch agent
sudo yum install -y amazon-cloudwatch-agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c ssm:AmazonCloudWatch-Config

# Build the Docker image
echo "Building Docker image..."
docker build -t recipe-scraper .

# Start the application with production compose file
echo "Starting application..."
docker-compose -f docker-compose.prod.yml up -d

# Set up monitoring
echo "Setting up monitoring..."
chmod +x scripts/setup-monitoring.sh
./scripts/setup-monitoring.sh

# Add cron job to check application health
echo "Setting up health check cron job..."
(crontab -l 2>/dev/null; echo "*/5 * * * * docker ps | grep recipe-scraper > /dev/null || docker-compose -f /home/ec2-user/recipe-scraper/docker-compose.prod.yml up -d") | crontab -

echo "Deployment completed successfully!"
echo "To view logs: docker-compose -f docker-compose.prod.yml logs -f" 