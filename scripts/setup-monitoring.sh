#!/bin/bash

# Get instance ID and region from metadata
INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/region)

# Set up CPU Usage Alarm
aws cloudwatch put-metric-alarm \
    --alarm-name "CPU-Usage-${INSTANCE_ID}" \
    --alarm-description "Alarm when CPU exceeds 80%" \
    --metric-name CPUUtilization \
    --namespace AWS/EC2 \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 2 \
    --dimensions Name=InstanceId,Value=${INSTANCE_ID} \
    --region ${REGION}

# Set up Memory Usage Alarm
aws cloudwatch put-metric-alarm \
    --alarm-name "Memory-Usage-${INSTANCE_ID}" \
    --alarm-description "Alarm when Memory exceeds 80%" \
    --metric-name MemoryUtilization \
    --namespace System/Linux \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 2 \
    --dimensions Name=InstanceId,Value=${INSTANCE_ID} \
    --region ${REGION}

# Set up Disk Usage Alarm
aws cloudwatch put-metric-alarm \
    --alarm-name "Disk-Usage-${INSTANCE_ID}" \
    --alarm-description "Alarm when Disk usage exceeds 80%" \
    --metric-name DiskSpaceUtilization \
    --namespace System/Linux \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 2 \
    --dimensions Name=InstanceId,Value=${INSTANCE_ID},Name=Filesystem,Value=/dev/xvda1,Name=MountPath,Value=/ \
    --region ${REGION}

echo "CloudWatch alarms have been set up successfully!" 