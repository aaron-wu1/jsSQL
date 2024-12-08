// lib/schema.js

import { logError, logSuccess } from "../logger/logger.js";
import { getTableFilePath, writeJSON } from "./storage.js";

/**
 * @module schema
 * @description Handles table schema management and validation
 */

/**
 * Creates a new table schema and initialises the data file
 * @param {string} query - SQL query to create a table
 */
export function createTable(query) {
  // match create table syntax
  const match = query.match(/CREATE TABLE (\w+) \((.+)\)/i);

  if (!match) {
    logError("Invalid CREATE TABLE query");
    throw new Error("Invalid CREATE TABLE query");
  }
  const tableName = match[1];
  if (tableName.toLowerCase() === "tables") {
    logError("Cannot create a table named 'tables'");
    throw new Error("Cannot create a table named 'tables");
  }
  if (tableName.toLowerCase() === "columns") {
    logError("Cannot create a table named 'columns'");
    throw new Error("Cannot create a table named 'columns'");
  }

  const columns = match[2].split(",").map((col) => col.trim());
  const schema = columns.reduce((acc, col) => {
    const [name, type] = col.split(" ");
    if (!name || !type) {
      logError("Invalid column definition");
      throw new Error("Invalid column defintion");
    }
    acc[name] = type.toUpperCase();
    return acc;
    // start value {}, accumulates key value pairs
  }, {});

  const schemaPath = getTableFilePath(tableName, "schema");
  const dataPath = getTableFilePath(tableName, "data");
  writeJSON(schemaPath, schema);
  writeJSON(dataPath, []);
  logSuccess(`Table '${tableName}' created successfully!`);
}

// createTable("my table users(id Integer)");
// createTable("CREATE TABLE users(id Integer)");
// createTable("CREATE TABLE users (id Integer, name Text)");
// createTable("CREATE TABLE users ( Integer , name TEXT)");
