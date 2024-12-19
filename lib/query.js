// lib/query.js

import { logError, logSuccess } from "../logger/logger.js";
import { getTableFilePath, readJSON, writeJSON } from "./storage.js";

/**
 * @module query
 * @description Parses and executes SQL queries
 */

/**
 * Inserts a row into a table
 * @param {string} query - SQL query to insert data
 */
export function insertInto(query) {
  //TODO: add more fine grain regex
  //TODO: queries not case insensitive
  const match = query.match(/INSERT INTO (\w+) \((.+)\) VALUES \((.+)\)/i);
  if (!match) {
    logError("Invalid INSERT INTO query");
    throw new Error("Invalid INSERT INTO query");
  }

  const tableName = match[1];
  const columns = match[2].split(",").map((col) => col.trim());
  const values = match[3].split(",").map((val) => val.trim().replace(/'/g, "").replace(/"/g, ""));
  const schema = readJSON(getTableFilePath(tableName, "schema"));
  const data = readJSON(getTableFilePath(tableName, "data"));

  if (!schema || !data) {
    logError(`Table "${tableName}" does not exist`);
    throw new Error(`Table "${tableName}" does not exist`);
  }

  const row = {};
  columns.forEach((col, index) => {
    if (!schema[col]) {
      logError(`Column "${col}" does not exist in table "${tableName}"`);
      throw new Error(`Column "${col}" does not exist in table "${tableName}"`);
    }
    // TODO: add other types
    // if it's an int, covert to int
    row[col] = schema[col] === "INT" ? parseInt(values[index], 10) : values[index];
  });
  data.push(row);
  writeJSON(getTableFilePath(tableName, "data"), data);
  logSuccess(`Row inserted into table "${tableName}"!`);
}

// TODO: add JOINS
/**
 * Selects rows from a table based on a query
 * @param {string} query - SQL query to select data
 * @returns {Array<object>} result array
 */
export function select(query) {
  try {
    const parsedQuery = parseSelectQuery(query);
    const data = readJSON(getTableFilePath(parsedQuery.tableName, "data"));
    if (!data) {
      throw new Error(`Table "${parsedQuery.tableName}" does not exist.`);
    }

    let result = [];

    if (parsedQuery.aggregations.length === 0) {
      // No aggregation, perform a regular SELECT
      result = data
        .filter((row) => evaluateWhereClause(row, parsedQuery.whereClause))
        .map((row) => {
          if (parsedQuery.columns.includes("*")) {
            return row;
          }
          const selectedRow = {};
          parsedQuery.columns.forEach((col) => {
            selectedRow[col] = row[col];
          });
          return selectedRow;
        });
    } else {
      // Perform aggregations
      const aggregationResults = {};
      parsedQuery.aggregations.forEach((agg) => {
        if (agg.type === "COUNT") {
          if (agg.column === "*") {
            aggregationResults[agg.alias] = data.length;
          } else {
            aggregationResults[agg.alias] = data.filter(
              (row) => row[agg.column] !== undefined && row[agg.column] !== null,
            ).length;
          }
        } else if (agg.type === "AVG") {
          const filteredData = parsedQuery.whereClause
            ? data.filter((row) => evaluateWhereClause(row, parsedQuery.whereClause))
            : data;

          const numericData = filteredData
            .filter((row) => typeof row[agg.column] === "number")
            .map((row) => row[agg.column]);

          const sum = numericData.reduce((acc, val) => acc + val, 0);
          aggregationResults[agg.alias] = numericData.length > 0 ? sum / numericData.length : 0;
        }
      });
      result.push(aggregationResults);
    }

    console.table(result);
    logSuccess("SELECT Query executed successfully");
    return result;
  } catch (error) {
    logError("SELECT Query failed", error);
    throw error;
  }
}

/**
 * Parses a SELECT query to extract table name, columns, aggregations
 * @param {string} query - SQL query to select data
 */
function parseSelectQuery(query) {
  const selectRegex = /SELECT\s+(.+)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?/i;
  const match = query.match(selectRegex);
  if (!match) {
    console.error("No match");
  }
  const columnsPart = match[1].trim();
  const tableName = match[2].trim();
  const whereClause = match[3] ? match[3].trim() : null;
  const columns = [];
  const aggregations = [];

  const columnsSplit = columnsPart.split(",").map((col) => col.trim());
  columnsSplit.forEach((col) => {
    // match COUNT(word) AS word
    const countMatch = col.match(/^COUNT\((\w+|\*)\)(?:\s+AS\s+(\w+))?$/i);
    const avgMatch = col.match(/^AVG\((\w+)\)(?:\s+AS\s+(\w+))?$/i);

    if (countMatch) {
      aggregations.push({
        type: "COUNT",
        column: countMatch[1],
        alias: countMatch[2] || "COUNT",
      });
    } else if (avgMatch) {
      aggregations.push({
        type: "AVG",
        column: countMatch[1],
        alias: countMatch[2] || "AVG",
      });
    } else {
      columns.push(col);
    }
  });
  return {
    tableName,
    columns,
    aggregations,
    whereClause,
  };
}

function evaluateWhereClause(row, whereClause) {
  if (!whereClause) {
    return true;
  }
  const condition = whereClause.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g, "row.$&");
  try {
    const func = new Function("row", `return ${condition}`);
    return func(row);
  } catch (error) {
    return false;
  }
}
