const os = require("os");
const logger = require("./logger");

class ResourceMonitor {
  constructor() {
    this.startTime = Date.now();
    this.scrapeCount = 0;
    this.errorCount = 0;
    this.lastMemoryUsage = 0;
  }

  trackScrape(success = true) {
    this.scrapeCount++;
    if (!success) this.errorCount++;
    this.checkResources();
  }

  checkResources() {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = os.loadavg()[0]; // 1 minute load average
    const memoryUsagePercent =
      (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

    // Log if memory usage increased significantly
    if (memoryUsage.heapUsed - this.lastMemoryUsage > 50 * 1024 * 1024) {
      // 50MB increase
      logger.warn("Significant memory increase detected", {
        previousUsage: this.formatBytes(this.lastMemoryUsage),
        currentUsage: this.formatBytes(memoryUsage.heapUsed),
        increase: this.formatBytes(memoryUsage.heapUsed - this.lastMemoryUsage),
      });
    }

    // Update last memory usage
    this.lastMemoryUsage = memoryUsage.heapUsed;

    // Log current stats
    logger.info("Resource usage stats", {
      uptime: this.formatUptime(Date.now() - this.startTime),
      scrapeCount: this.scrapeCount,
      errorCount: this.errorCount,
      successRate: `${(
        ((this.scrapeCount - this.errorCount) / this.scrapeCount) *
        100
      ).toFixed(2)}%`,
      memoryUsage: {
        used: this.formatBytes(memoryUsage.heapUsed),
        total: this.formatBytes(memoryUsage.heapTotal),
        percentage: `${memoryUsagePercent.toFixed(2)}%`,
      },
      cpuLoad: `${(cpuUsage * 100).toFixed(2)}%`,
    });

    // Alert if resources are getting high
    if (memoryUsagePercent > 80 || cpuUsage > 0.8) {
      logger.error("Resource usage critical", {
        memoryUsagePercent,
        cpuUsage,
      });
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  }
}

module.exports = new ResourceMonitor();
