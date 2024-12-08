import { insertInto } from "../lib/query.js";
import { createTable } from "../lib/schema.js";
import { logger } from "../logger/logger.js";
import pc from "picocolors";

function testCreateTableV1() {
  const createTableQuery = "CREATE TABLE users (id int, name txt, age int, student boolean)";
  try {
    createTable(createTableQuery);
    logger("[TEST]", pc.magenta, console.info, "Table creation test passed\n");
  } catch (error) {
    logger("[TEST]", pc.red, console.error, "Table creation test failed\n", error);
  }
}

function testCreateTableV2() {
  const createTableQuery = "CREATE TABLE  (id int, name txt, age int, student boolean)";
  try {
    createTable(createTableQuery);
    logger("[TEST]", pc.magenta, console.info, "Table creation test passed\n");
  } catch (error) {
    logger("[TEST]", pc.red, console.error, "Table creation test failed\n", error);
  }
}

function testInsertIntoV1() {
  const insertIntoQuery1 =
    "INSERT INTO users (id, name, age, student) VALUES (101, 'ALICE', 22, true)";
  const insertIntoQuery2 =
    "INSERT INTO users (id, name, age, student) VALUES (102, 'Bob', 25, false)";
  const insertIntoQuery3 =
    "INSERT INTO users (id, name, age, student) VALUES (103, 'John', 32, true)";
  const insertIntoQuery4 =
    "INSERT INTO users (id, name, age, student) VALUES (104, 'Tom', 28, true)";
  const insertIntoQuery5 =
    "INSERT INTO users (id, name, age, student) VALUES (105, 'Peter', 10, false)";
  try {
    insertInto(insertIntoQuery1);
    insertInto(insertIntoQuery2);
    insertInto(insertIntoQuery3);
    insertInto(insertIntoQuery4);
    insertInto(insertIntoQuery5);
    logger("[TEST]", pc.magenta, console.info, "Insert Into test passed\n");
  } catch (error) {
    logger("[TEST]", pc.red, console.error, "Insert Into test failed\n", error);
  }
}

function main() {
  testCreateTableV1();
  testCreateTableV2();
  testInsertIntoV1();
}

main();
