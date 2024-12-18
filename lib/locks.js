// lib/locks.js
/**
 * @module locks
 * @description Implements table-level locking with queuing to prevent concurrent modifications
 */

import { logError, logInfo } from "../logger/logger.js";
import Mutex from "./mutex.js";

const tableLocks = new Map();

/**
 * Acquires lock for a tabel
 * @param {string} tableName - Name of the table to lock
 * @returns {Promise<Function>} - Promise that resolves to an unlock function
 */
export async function lockTable(tableName) {
  if (!tableLocks.has(tableName)) {
    tableLocks.set(tableName, new Mutex());
    logInfo(`[Lock] Mutex created for table "${tableName}"`);
  }

  const mutex = tableLocks.get(tableName);
  const unlock = await mutex.lock();
  logInfo(`[Lock] Lock acquired for table "${tableName}`);
  return unlock;
}

/** Execute a callback function with a table lock
 * @param {string} tableName - Name of table to perform op
 * @param {Function} callback - The operation to execute when table is locked
 */
export async function performWithLock(tableName, callback) {
  const unlock = await lockTable(tableName);
  try {
    logInfo(`[Lock] Perofrming operation on table "${tableName}`);
    await callback();
  } catch (error) {
    logError(`[Lock] Error during operation on table "${tableName}`, error);
    throw error;
    // eventually release lock
  } finally {
    unlock();
    logInfo(`[Lock] released for table "${tableName}"`);
  }
}

// /**
//  * locks given table
//  * @param {string} tableName
//  */
// export async function lockTable(tableName) {
//   if (!locks.has(tableName)) {
//     locks.set(tableName, []);
//     return;
//   }
//   return new Promise((resolve) => {
//     locks.get(tableName).push(resolve);
//   });
// }

// export function unlockTable(tableName) {
//   const queue = locks.get(tableName);

//   if (!queue || queue.length === 0) {
//     locks.delete(tableName);
//   } else {
//     const next = queue.shift();
//     next();
//   }
// }

// export async function performWithLock(tableName, callback) {
//   // waiting to aquire lock
//   await lockTable(tableName);

//   try {
//     await callback();

//     //  make sure to unlock table
//   } finally {
//     unlockTable(tableName);
//   }
// }
