/**
 * SQLite Database Connection and Management
 * Handles database initialization, migrations, and connection management
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs').promises;
const config = require('../../config/app');
const logger = require('../utils/logger');

class DatabaseConnection {
  constructor() {
    this.db = null;
    this.dbPath = path.resolve(config.DATABASE.PATH);
    this.migrationPath = path.join(__dirname, 'migrations');
    this.seedPath = path.join(__dirname, 'seeds');
    this.isInitialized = false;
  }

  /**
   * Initialize database connection and setup
   */
  async initialize() {
    try {
      // Ensure database directory exists
      const dbDir = path.dirname(this.dbPath);
      await fs.mkdir(dbDir, { recursive: true });

      // Create database connection
      await this.connect();

      // Configure database
      await this.configure();

      // Run migrations
      await this.runMigrations();

      // Seed database if in development
      if (config.ENVIRONMENT === 'development') {
        await this.runSeeds();
      }

      this.isInitialized = true;
      logger.info('Database initialized successfully');

    } catch (error) {
      logger.error('Database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Create database connection
   */
  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          logger.error('Failed to connect to database:', err);
          reject(err);
        } else {
          logger.info(`Connected to SQLite database: ${this.dbPath}`);
          resolve();
        }
      });
    });
  }

  /**
   * Configure database settings
   */
  async configure() {
    const configurations = [
      // Enable foreign key constraints
      config.DATABASE.ENABLE_FOREIGN_KEYS ? 'PRAGMA foreign_keys = ON' : null,
      
      // Enable WAL mode for better performance
      config.DATABASE.ENABLE_WAL_MODE ? 'PRAGMA journal_mode = WAL' : null,
      
      // Set synchronous mode for better performance
      'PRAGMA synchronous = NORMAL',
      
      // Set cache size
      'PRAGMA cache_size = -64000', // 64MB cache
      
      // Set timeout
      `PRAGMA busy_timeout = ${config.DATABASE.TIMEOUT}`,
      
      // Enable auto vacuum
      'PRAGMA auto_vacuum = INCREMENTAL',
    ].filter(Boolean);

    for (const sql of configurations) {
      await this.run(sql);
    }

    logger.info('Database configured successfully');
  }

  /**
   * Run database migrations
   */
  async runMigrations() {
    try {
      // Create migrations table if it doesn't exist
      await this.run(`
        CREATE TABLE IF NOT EXISTS migrations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          filename TEXT NOT NULL UNIQUE,
          executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Get executed migrations
      const executedMigrations = await this.all(
        'SELECT filename FROM migrations ORDER BY id'
      );
      const executedFiles = executedMigrations.map(m => m.filename);

      // Get migration files
      let migrationFiles = [];
      try {
        const files = await fs.readdir(this.migrationPath);
        migrationFiles = files
          .filter(file => file.endsWith('.sql'))
          .sort();
      } catch (error) {
        logger.warn('No migration directory found, skipping migrations');
        return;
      }

      // Execute pending migrations
      for (const filename of migrationFiles) {
        if (!executedFiles.includes(filename)) {
          await this.executeMigration(filename);
        }
      }

      logger.info(`Migrations completed. Total: ${migrationFiles.length}, Executed: ${migrationFiles.length - executedFiles.length}`);

    } catch (error) {
      logger.error('Migration failed:', error);
      throw error;
    }
  }

  /**
   * Execute a single migration
   */
  async executeMigration(filename) {
    try {
      const filePath = path.join(this.migrationPath, filename);
      const sql = await fs.readFile(filePath, 'utf8');

      // Execute migration in a transaction
      await this.run('BEGIN TRANSACTION');
      
      // Split and execute multiple statements
      const statements = sql.split(';').filter(stmt => stmt.trim());
      for (const statement of statements) {
        if (statement.trim()) {
          await this.run(statement);
        }
      }

      // Record migration
      await this.run(
        'INSERT INTO migrations (filename) VALUES (?)',
        [filename]
      );

      await this.run('COMMIT');
      logger.info(`Migration executed: ${filename}`);

    } catch (error) {
      await this.run('ROLLBACK');
      logger.error(`Migration failed: ${filename}`, error);
      throw error;
    }
  }

  /**
   * Run database seeds
   */
  async runSeeds() {
    try {
      let seedFiles = [];
      try {
        const files = await fs.readdir(this.seedPath);
        seedFiles = files
          .filter(file => file.endsWith('.sql'))
          .sort();
      } catch (error) {
        logger.warn('No seed directory found, skipping seeds');
        return;
      }

      for (const filename of seedFiles) {
        await this.executeSeed(filename);
      }

      logger.info(`Seeds completed. Total: ${seedFiles.length}`);

    } catch (error) {
      logger.error('Seeding failed:', error);
      // Don't throw error for seeds in development
      if (config.ENVIRONMENT !== 'development') {
        throw error;
      }
    }
  }

  /**
   * Execute a single seed file
   */
  async executeSeed(filename) {
    try {
      const filePath = path.join(this.seedPath, filename);
      const sql = await fs.readFile(filePath, 'utf8');

      // Execute seed statements
      const statements = sql.split(';').filter(stmt => stmt.trim());
      for (const statement of statements) {
        if (statement.trim()) {
          await this.run(statement);
        }
      }

      logger.info(`Seed executed: ${filename}`);

    } catch (error) {
      logger.error(`Seed failed: ${filename}`, error);
      throw error;
    }
  }

  /**
   * Execute a SQL statement
   */
  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ 
            lastID: this.lastID, 
            changes: this.changes 
          });
        }
      });
    });
  }

  /**
   * Execute a SELECT query and return first row
   */
  async get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  /**
   * Execute a SELECT query and return all rows
   */
  async all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  /**
   * Execute multiple statements in a transaction
   */
  async transaction(statements) {
    try {
      await this.run('BEGIN TRANSACTION');
      
      const results = [];
      for (const { sql, params } of statements) {
        const result = await this.run(sql, params);
        results.push(result);
      }
      
      await this.run('COMMIT');
      return results;
    } catch (error) {
      await this.run('ROLLBACK');
      throw error;
    }
  }

  /**
   * Create a backup of the database
   */
  async backup(backupPath = null) {
    if (!backupPath) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      backupPath = path.join(
        config.BACKUP.BACKUP_LOCATION,
        `momech-backup-${timestamp}.db`
      );
    }

    try {
      // Ensure backup directory exists
      const backupDir = path.dirname(backupPath);
      await fs.mkdir(backupDir, { recursive: true });

      // Create backup
      await fs.copyFile(this.dbPath, backupPath);
      
      logger.info(`Database backup created: ${backupPath}`);
      return backupPath;
    } catch (error) {
      logger.error('Database backup failed:', error);
      throw error;
    }
  }

  /**
   * Get database statistics
   */
  async getStats() {
    try {
      const tables = await this.all(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `);

      const stats = {
        tables: {},
        totalSize: 0
      };

      for (const table of tables) {
        const count = await this.get(`SELECT COUNT(*) as count FROM ${table.name}`);
        stats.tables[table.name] = count.count;
      }

      // Get database file size
      try {
        const stat = await fs.stat(this.dbPath);
        stats.totalSize = stat.size;
      } catch (error) {
        stats.totalSize = 0;
      }

      return stats;
    } catch (error) {
      logger.error('Failed to get database stats:', error);
      throw error;
    }
  }

  /**
   * Optimize database (vacuum)
   */
  async optimize() {
    try {
      await this.run('VACUUM');
      await this.run('PRAGMA optimize');
      logger.info('Database optimized');
    } catch (error) {
      logger.error('Database optimization failed:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  async close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            logger.error('Failed to close database:', err);
            reject(err);
          } else {
            logger.info('Database connection closed');
            this.db = null;
            this.isInitialized = false;
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Check if database is connected and initialized
   */
  isReady() {
    return this.db !== null && this.isInitialized;
  }
}

// Create singleton instance
const dbConnection = new DatabaseConnection();

module.exports = dbConnection;
