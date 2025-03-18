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

## Deployment to Render (Free Tier)

### Prerequisites

- A GitHub account
- Your code pushed to a GitHub repository
- A Render account (sign up at https://render.com)

### Steps to Deploy

1. **Connect Your Repository**
   - Log in to Render
   - Go to Dashboard
   - Click "New +"
   - Select "Background Worker"
   - Connect your GitHub repository

2. **Configure Your Service**
   - Name: recipe-scraper
   - Environment: Node
   - Region: Choose closest to you
   - Branch: main (or your preferred branch)
   - Build Command: `npm install`
   - Start Command: `node index.js`

3. **Set Environment Variables**
   - Click on "Environment" tab
   - Add the following variables:
     ```
     NODE_ENV=production
     DB_SSL=true
     ```
   - The database variables (DB_HOST, DB_USER, etc.) will be automatically set by Render

4. **Create Database**
   - Go to Dashboard
   - Click "New +"
   - Select "PostgreSQL"
   - Choose Free plan
   - Note down the database credentials

5. **Initialize Database**
   - Go to your worker service
   - Click "Shell"
   - Run:
     ```bash
     npm run init-db
     ```

### Project Structure

```
recipe-scraper/
├── db/
│   ├── db.js           # Database connection
│   └── db-init.js      # Database initialization
├── scripts/
│   └── init-db.js      # Database initialization script
├── .env                # Environment variables (local)
├── .gitignore         # Git ignore file
├── index.js           # Main application file
├── package.json       # Project dependencies
├── README.md         # This file
└── render.yaml       # Render configuration
```

### Environment Variables

| Variable    | Description              | Default Value |
|-------------|-------------------------|---------------|
| DB_HOST     | Database host           | localhost     |
| DB_PORT     | Database port           | 5432         |
| DB_NAME     | Database name           | recipe_db    |
| DB_USER     | Database user           | -            |
| DB_PASSWORD | Database password       | -            |
| NODE_ENV    | Environment             | development  |
| DB_SSL      | SSL connection          | false        |

### Monitoring on Render

1. **View Logs**
   - Go to your worker service
   - Click "Logs" tab
   - View real-time logs

2. **Monitor Status**
   - Dashboard shows service status
   - Set up notifications for failures

### Troubleshooting

1. **Database Connection Issues**
   - Verify environment variables
   - Check if database is running
   - Verify SSL settings

2. **Scraping Issues**
   - Check logs for errors
   - Verify target website accessibility
   - Check memory usage in Render dashboard

3. **Deployment Issues**
   - Verify Node.js version compatibility
   - Check build logs
   - Ensure all dependencies are listed in package.json

### Free Tier Limitations

Render's free tier includes:
- 750 hours per month
- 512 MB RAM
- Shared CPU
- PostgreSQL with 1GB storage
- Automatic sleep after 15 minutes of inactivity

## Support

For issues and feature requests, please create an issue in the repository.
