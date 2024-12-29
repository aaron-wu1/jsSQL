// lib/query.js

import { join } from "path";
import { logError, logSuccess } from "../logger/logger.js";
import { getTableFilePath, readJSON, writeJSON } from "./storage.js";
import { table } from "console";

const Joins = {
  INNER_JOIN: "inner join",
  LEFT_OUTER_JOIN: "left join",
  RIGHT_OUTER_JOIN: "right join",
  FULL_JOIN: "full outer join",
};

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

/**
 * Selects rows from a table based on a query
 * @param {string} query - SQL query to select data
 * @returns {Array<object>} result array
 */
export function select(query) {
  try {
    const parsedQuery = parseSelectQuery(query);
    let data = readJSON(getTableFilePath(parsedQuery.tableName, "data"));
    if (!data) {
      throw new Error(`Table "${parsedQuery.tableName}" does not exist.`);
    }
    let joinTableData = [];
    if (parsedQuery.joinTable) {
      joinTableData = readJSON(getTableFilePath(parsedQuery.joinTable, "data"));
      if (!joinTableData) {
        throw new Error(`Join table "${parsedQuery.tableName}" does not exist.`);
      }
    }

    let joinedData = [];
    let result = [];
    if (parsedQuery.joinTable != "") {
      const condRegex = /(\w+)?(?:.(\w+))\s*=\s*(\w+)?(?:.(\w+))/;
      const table1 = parsedQuery.joinCond.match(condRegex)[1];
      const column1 = parsedQuery.joinCond.match(condRegex)[2];
      const column2 = parsedQuery.joinCond.match(condRegex)[4];
      let foundTable1 = new Set();
      let foundTable2 = new Set();
      for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < joinTableData.length; j++) {
          if (table1 === parsedQuery.tableName) {
            if (data[i][column1] == joinTableData[j][column2]) {
              if (
                parsedQuery.joinType == Joins.LEFT_OUTER_JOIN ||
                parsedQuery.joinType == Joins.FULL_JOIN
              ) {
                foundTable1.add(i);
              }
              if (
                parsedQuery.joinType == Joins.RIGHT_OUTER_JOIN ||
                parsedQuery.joinType == Joins.FULL_JOIN
              ) {
                foundTable2.add(j);
              }
              joinedData.push(
                mergeTuples(
                  parsedQuery.tableName,
                  parsedQuery.joinTable,
                  data[i],
                  joinTableData[j],
                  Joins.INNER_JOIN,
                ),
              );
            }
          } else {
            if (data[i][column2] == joinTableData[j][column1]) {
              if (
                parsedQuery.joinType == Joins.LEFT_OUTER_JOIN ||
                parsedQuery.joinType == Joins.FULL_JOIN
              ) {
                foundTable1.add(i);
              }
              if (
                parsedQuery.joinType == Joins.RIGHT_OUTER_JOIN ||
                parsedQuery.joinType == Joins.FULL_JOIN
              ) {
                foundTable2.add(j);
              }
              joinedData.push(
                mergeTuples(
                  parsedQuery.tableName,
                  parsedQuery.joinTable,
                  data[i],
                  joinTableData[j],
                  Joins.INNER_JOIN,
                ),
              );
            }
          }
        }
        if (
          (parsedQuery.joinType == Joins.LEFT_OUTER_JOIN ||
            parsedQuery.joinType == Joins.FULL_JOIN) &&
          foundTable1.has(i) == false
        ) {
          joinedData.push(
            mergeTuples(
              parsedQuery.tableName,
              parsedQuery.joinTable,
              data[i],
              joinTableData[0],
              Joins.LEFT_OUTER_JOIN,
            ),
          );
        }
      }
      if (
        parsedQuery.joinType == Joins.RIGHT_OUTER_JOIN ||
        parsedQuery.joinType == Joins.FULL_JOIN
      ) {
        for (let j = 0; j < joinTableData.length; j++) {
          if (foundTable2.has(j) == false) {
            joinedData.push(
              mergeTuples(
                parsedQuery.tableName,
                parsedQuery.joinTable,
                data[0],
                joinTableData[j],
                Joins.RIGHT_OUTER_JOIN,
              ),
            );
          }
        }
      }
      data = joinedData;
    }

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
  // const selectRegex = /SELECT\s+(.+)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?/i;
  const selectRegex =
    /SELECT\s+(.+)\s+FROM\s+(\w+)(?:\s+?(INNER JOIN|FULL OUTER JOIN|LEFT JOIN|RIGHT JOIN)\s+(\w+)\s+ON\s+(.+))?(?:(\s+WHERE\s+)(.+))?/i;
  const match = query.match(selectRegex);
  if (!match) {
    console.error("No match");
  }
  const columnsPart = match[1].trim();
  const tableName = match[2].trim();
  // search for inner join
  const innerJoinIdx = match.findIndex((value, i) =>
    value && i > 0 ? value.toLowerCase().includes(Joins.INNER_JOIN) : false,
  );
  const leftJoinIdx = match.findIndex((value, i) =>
    value && i > 0 ? value.toLowerCase().includes(Joins.LEFT_OUTER_JOIN) : false,
  );
  const rightJoinIdx = match.findIndex((value, i) =>
    value && i > 0 ? value.toLowerCase().includes(Joins.RIGHT_OUTER_JOIN) : false,
  );
  const fullJoinIdx = match.findIndex((value, i) =>
    value && i > 0 ? value.toLowerCase().includes(Joins.FULL_JOIN) : false,
  );
  let joinTable = "";
  let joinCond = "";
  let joinType = "";
  if (innerJoinIdx > -1) {
    joinType = Joins.INNER_JOIN;
    joinTable = innerJoinIdx > -1 ? match[innerJoinIdx + 1].trim() : null;
    joinCond = innerJoinIdx > -1 ? match[innerJoinIdx + 2].trim() : null;
  } else if (leftJoinIdx > -1) {
    joinType = Joins.LEFT_OUTER_JOIN;
    joinTable = leftJoinIdx > -1 ? match[leftJoinIdx + 1].trim() : null;
    joinCond = leftJoinIdx > -1 ? match[leftJoinIdx + 2].trim() : null;
  } else if (rightJoinIdx > -1) {
    joinType = Joins.RIGHT_OUTER_JOIN;
    joinTable = rightJoinIdx > -1 ? match[rightJoinIdx + 1].trim() : null;
    joinCond = rightJoinIdx > -1 ? match[rightJoinIdx + 2].trim() : null;
  } else if (fullJoinIdx > -1) {
    joinType = Joins.FULL_JOIN;
    joinTable = fullJoinIdx > -1 ? match[fullJoinIdx + 1].trim() : null;
    joinCond = fullJoinIdx > -1 ? match[fullJoinIdx + 2].trim() : null;
  }

  // search for where clause
  const whereIdx = match.findIndex((value, i) =>
    value && i > 0 ? value.toLowerCase().includes("where") : false,
  );

  const whereClause = whereIdx > -1 ? match[whereIdx + 1].trim() : null;
  const columns = [];
  const aggregations = [];

  const columnsSplit = columnsPart.split(",").map((col) => col.trim());
  columnsSplit.forEach((col) => {
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
        column: avgMatch[1],
        alias: avgMatch[2] || "AVG",
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
    joinType,
    joinTable,
    joinCond,
  };
}

/**
 * Evaluates a row against a given WHERE clause condition.
 *
 * @param {Object} row - The row object to be evaluated.
 * @param {string} whereClause - The WHERE clause condition as a string.
 * @returns {boolean} - Returns true if the row satisfies the WHERE clause condition, otherwise false.
 */
function evaluateWhereClause(row, whereClause) {
  if (!whereClause) {
    return true;
  }
  const condition = whereClause.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g, "row.$&");
  try {
    // TODO: need a safe way to parse text to logic, jsep?
    const func = new Function("row", `return ${condition}`);
    return func(row);
  } catch (error) {
    return false;
  }
}

/**
 * Merges two tuples (objects) based on the specified join type.
 *
 * @param {string} table1 - The name of the first table.
 * @param {string} table2 - The name of the second table.
 * @param {Object} tuple1 - The first tuple (object) to merge.
 * @param {Object} tuple2 - The second tuple (object) to merge.
 * @param {string} joinType - The type of join to perform (e.g., INNER_JOIN, LEFT_OUTER_JOIN, RIGHT_OUTER_JOIN, FULL OUTER JOIN).
 * @returns {Object} The merged tuple (object) containing keys and values from both tuples based on the join type.
 */
function mergeTuples(table1, table2, tuple1, tuple2, joinType) {
  return {
    ...Object.fromEntries(
      Object.entries(tuple1)
        .filter(([key]) => !(key in tuple2))
        .map(([key, val]) => (joinType == Joins.RIGHT_OUTER_JOIN ? [key, undefined] : [key, val])), // Keep unique keys from obj2
      //  // Keep unique keys from obj1
    ),
    ...Object.fromEntries(
      Object.entries(tuple2)
        .filter(([key]) => !(key in tuple1))
        .map(([key, val]) => (joinType == Joins.LEFT_OUTER_JOIN ? [key, undefined] : [key, val])), // Keep unique keys from obj2
    ),
    ...Object.fromEntries(
      Object.keys(tuple1)
        .filter((key) => key in tuple2) // Find shared keys
        .flatMap((key) => [
          joinType == Joins.RIGHT_OUTER_JOIN
            ? [`${table1}.${key}`, undefined]
            : [`${table1}.${key}`, tuple1[key]], // Add `obj1.key`
          joinType == Joins.LEFT_OUTER_JOIN
            ? [`${table2}.${key}`, undefined]
            : [`${table2}.${key}`, tuple2[key]], // Add `obj2.key`
          // [`${table2}.${key}`, tuple2[key]], // Add `obj2.key`
        ]),
    ),
  };
}
