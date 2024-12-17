// lib/backup.js
/**
 * @module backup
 * @description Handles backup and restore functionality
 */

import fs from "fs";
import path from "path";
import { DATABASE_PATH } from "./storage.js";
import { logError, logSuccess } from "../logger/logger.js";

/**
 * Backs up the entire database folder to another specified directory
 * @param {string} backupPath - The directory to save the backup
 */
export function backupDatabase(backupPath) {
  if (!fs.existsSync(backupPath)) {
    fs.mkdirSync(backupPath, { recursive: true });
  }
  const files = fs.readdirSync(DATABASE_PATH);

  // copies database files over to backup dest
  files.forEach((file) => {
    const source = path.join(DATABASE_PATH, file);
    const destination = path.join(backupPath, file);
    fs.copyFileSync(source, destination);
  });

  logSuccess(`Database backup completed successfully! Available at: ${backupPath}`);
}

/**
 * Restores the database from a backup directory
 * @param {string} backupPath - The directory containing the backup files
 */
export function restoreDatabase(backupPath) {
  if (!fs.existsSync(backupPath)) {
    logError("Backup directory does not exist");
    throw new Error("Backup directory does not exist");
  }

  const files = fs.readdirSync(backupPath);

  files.forEach((file) => {
    const source = path.join(backupPath, file);
    const destination = path.join(DATABASE_PATH, file);
    fs.copyFileSync(source, destination);
  });
  logSuccess(`Database restored successfully from ${backupPath} to ${DATABASE_PATH}`);
}
