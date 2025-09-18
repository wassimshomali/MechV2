/**
 * Logging utility for MoMech
 * Provides structured logging with different levels and outputs
 */

const fs = require('fs');
const path = require('path');
const config = require('../../config/app');

class Logger {
  constructor() {
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
    
    this.currentLevel = this.levels[config.LOGGING.LEVEL] || this.levels.info;
    this.logDir = path.dirname(config.LOGGING.FILE_PATH);
    
    // Ensure log directory exists
    this.ensureLogDirectory();
  }

  /**
   * Ensure log directory exists
   */
  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Format log message
   */
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...meta
    };

    return JSON.stringify(logEntry);
  }

  /**
   * Get console color for log level
   */
  getConsoleColor(level) {
    const colors = {
      error: '\x1b[31m', // Red
      warn: '\x1b[33m',  // Yellow
      info: '\x1b[36m',  // Cyan
      debug: '\x1b[37m'  // White
    };
    return colors[level] || '\x1b[37m';
  }

  /**
   * Write log to file
   */
  writeToFile(formattedMessage) {
    if (config.LOGGING.ENABLE_FILE) {
      try {
        const logFile = config.LOGGING.FILE_PATH;
        fs.appendFileSync(logFile, formattedMessage + '\n');
      } catch (error) {
        console.error('Failed to write to log file:', error);
      }
    }
  }

  /**
   * Write log to console
   */
  writeToConsole(level, message, meta = {}) {
    if (config.LOGGING.ENABLE_CONSOLE) {
      const color = this.getConsoleColor(level);
      const reset = '\x1b[0m';
      const timestamp = new Date().toISOString();
      
      let output = `${color}[${timestamp}] ${level.toUpperCase()}: ${message}${reset}`;
      
      if (Object.keys(meta).length > 0) {
        output += `\n${color}${JSON.stringify(meta, null, 2)}${reset}`;
      }
      
      console.log(output);
    }
  }

  /**
   * Log message at specified level
   */
  log(level, message, meta = {}) {
    if (this.levels[level] <= this.currentLevel) {
      const formattedMessage = this.formatMessage(level, message, meta);
      
      this.writeToConsole(level, message, meta);
      this.writeToFile(formattedMessage);
    }
  }

  /**
   * Log error message
   */
  error(message, meta = {}) {
    // If meta is an Error object, extract useful information
    if (meta instanceof Error) {
      meta = {
        name: meta.name,
        message: meta.message,
        stack: meta.stack,
        ...meta
      };
    }
    
    this.log('error', message, meta);
  }

  /**
   * Log warning message
   */
  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  /**
   * Log info message
   */
  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  /**
   * Log debug message
   */
  debug(message, meta = {}) {
    this.log('debug', message, meta);
  }

  /**
   * Log HTTP request
   */
  request(req, res, responseTime) {
    const meta = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    };

    if (res.statusCode >= 400) {
      this.error(`HTTP ${res.statusCode} ${req.method} ${req.url}`, meta);
    } else {
      this.info(`HTTP ${res.statusCode} ${req.method} ${req.url}`, meta);
    }
  }

  /**
   * Log database query
   */
  query(sql, params, executionTime) {
    if (config.ENVIRONMENT === 'development' && config.DEBUG) {
      this.debug('Database Query', {
        sql: sql.replace(/\s+/g, ' ').trim(),
        params,
        executionTime: `${executionTime}ms`
      });
    }
  }

  /**
   * Log authentication events
   */
  auth(event, userId, meta = {}) {
    this.info(`Auth: ${event}`, {
      userId,
      timestamp: new Date().toISOString(),
      ...meta
    });
  }

  /**
   * Log business events
   */
  business(event, data = {}) {
    this.info(`Business: ${event}`, {
      timestamp: new Date().toISOString(),
      ...data
    });
  }

  /**
   * Log security events
   */
  security(event, data = {}) {
    this.warn(`Security: ${event}`, {
      timestamp: new Date().toISOString(),
      ...data
    });
  }

  /**
   * Log performance metrics
   */
  performance(metric, value, unit = 'ms') {
    if (config.MONITORING.ENABLE_PERFORMANCE_MONITORING) {
      this.info(`Performance: ${metric}`, {
        value,
        unit,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Create child logger with default metadata
   */
  child(defaultMeta = {}) {
    const parentLogger = this;
    
    return {
      error: (message, meta = {}) => parentLogger.error(message, { ...defaultMeta, ...meta }),
      warn: (message, meta = {}) => parentLogger.warn(message, { ...defaultMeta, ...meta }),
      info: (message, meta = {}) => parentLogger.info(message, { ...defaultMeta, ...meta }),
      debug: (message, meta = {}) => parentLogger.debug(message, { ...defaultMeta, ...meta }),
      request: (req, res, responseTime) => parentLogger.request(req, res, responseTime),
      query: (sql, params, executionTime) => parentLogger.query(sql, params, executionTime),
      auth: (event, userId, meta = {}) => parentLogger.auth(event, userId, { ...defaultMeta, ...meta }),
      business: (event, data = {}) => parentLogger.business(event, { ...defaultMeta, ...data }),
      security: (event, data = {}) => parentLogger.security(event, { ...defaultMeta, ...data }),
      performance: (metric, value, unit) => parentLogger.performance(metric, value, unit)
    };
  }

  /**
   * Clean up old log files
   */
  cleanup() {
    try {
      const logFile = config.LOGGING.FILE_PATH;
      const stats = fs.statSync(logFile);
      const fileSizeInMB = stats.size / (1024 * 1024);
      
      // If log file is larger than max size, rotate it
      if (fileSizeInMB > parseInt(config.LOGGING.MAX_SIZE)) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const rotatedFile = logFile.replace('.log', `-${timestamp}.log`);
        
        fs.renameSync(logFile, rotatedFile);
        this.info(`Log file rotated: ${rotatedFile}`);
      }
    } catch (error) {
      // Ignore errors during cleanup
    }
  }

  /**
   * Set log level dynamically
   */
  setLevel(level) {
    if (this.levels[level] !== undefined) {
      this.currentLevel = this.levels[level];
      this.info(`Log level set to: ${level}`);
    } else {
      this.warn(`Invalid log level: ${level}`);
    }
  }

  /**
   * Get current log level
   */
  getLevel() {
    return Object.keys(this.levels).find(
      key => this.levels[key] === this.currentLevel
    );
  }
}

// Create singleton instance
const logger = new Logger();

// Set up periodic cleanup
if (config.LOGGING.ENABLE_FILE) {
  setInterval(() => {
    logger.cleanup();
  }, 24 * 60 * 60 * 1000); // Daily cleanup
}

module.exports = logger;
