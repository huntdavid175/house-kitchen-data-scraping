module.exports = {
  apps: [
    {
      name: "recipe-scraper",
      script: "index.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "600M",
      node_args: "--max-old-space-size=512 --expose-gc",
      kill_timeout: 3000,
      wait_ready: true,
      env: {
        NODE_ENV: "production",
        PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: "true",
        DB_HOST: process.env.DB_HOST,
        DB_PORT: process.env.DB_PORT,
        DB_NAME: process.env.DB_NAME,
        DB_USER: process.env.DB_USER,
        DB_PASSWORD: process.env.DB_PASSWORD,
        DB_SSL: "true",
      },
    },
  ],
};
