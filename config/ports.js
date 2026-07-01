/**
 * Central port configuration for MoMech v2
 * Override via environment variables or .env file
 */
require('../scripts/load-env');

const CLIENT_PORT = Number(process.env.CLIENT_PORT) || 3020;
const SERVER_PORT = Number(process.env.PORT) || 3021;
const HOST = process.env.HOST || 'localhost';

const ports = {
  CLIENT_PORT,
  SERVER_PORT,
  HOST,
  CLIENT_URL: `http://${HOST}:${CLIENT_PORT}`,
  SERVER_URL: `http://${HOST}:${SERVER_PORT}`,
  API_BASE: `http://${HOST}:${SERVER_PORT}/api/v1`,
};

module.exports = ports;
