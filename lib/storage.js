// lib/storage.js
/**
 * @module storage
 * @description Handles file-based storage operations
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import { logError, logInfo } from "../logger/logger.js";

// set path as env var if exists else "./database"
export const DATABASE_PATH = process.env.SQL_DB_PATH || "./database";

// checks if database folder has been created
if (!fs.existsSync(DATABASE_PATH)) {
  fs.mkdirSync(DATABASE_PATH, { recursive: true });
  logInfo(`Database directory created: ${DATABASE_PATH}`);
}

/**
 * Gets the file path for a table's schema or data file
 * @param {string} tableName - The name of table
 * @param {string} fileType - The type of file (schema or data)
 * @returns {string} - The file path
 */
export function getTableFilePath(tableName, fileType = "data") {
  return path.join(DATABASE_PATH, `${tableName}.${fileType}.json`);
}

/**
 * Reads a JSON file and returns its contents
 * @param {string} filePath - Path to the JSON file
 * @returns {object | null} - Parsed JSON content or null if the file doesn't exist
 */
export function readJSON(filePath) {
  // parse JSON db if exists
  const parsedData = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath)) : null;
  if (!parsedData) {
    logError(`File not found: ${filePath}`);
  }
  return parsedData;
}

/**
 * Writes data to a JSON file
 * @param {string} filePath - Path to the JSON file
 * @param {object} data - Data to write
 */
export function writeJSON(filePath, data) {
  if (!isValidFilePath(filePath)) {
    return;
  }
  if (!isFileExists(filePath)) {
    logInfo(`File at ${filePath} does not exist. Creating file at ${filePath}`);
  }
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    logError(error);
  }
}

/**
 * Checks if the filePath is a valid file path
 * @param {string} filePath
 * @returns {boolean} - Whether or not the file path is valid
 */
function isValidFilePath(filePath) {
  try {
    path.parse(filePath);
    return true;
  } catch (error) {
    logError(error);
    return false;
  }
}

/**
 * Checks if the filePath leads to a file
 * @param {string} filePath
 * @returns {boolean} - Whether or not the filePath has an existing file
 */
function isFileExists(filePath) {
  try {
    fs.accessSync(filePath);
    return true;
  } catch (error) {
    return false;
  }
}
