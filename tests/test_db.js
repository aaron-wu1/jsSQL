import { insertInto, select } from "../lib/query.js";
import { createTable } from "../lib/schema.js";
import { logger } from "../logger/logger.js";
import { createIndex, searchWithIndex } from "../lib/indexing.js";
import pc from "picocolors";
import { backupDatabase, restoreDatabase } from "../lib/backup.js";

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

function testSelectV1() {
  const selectQuery1 = "SELECT id from users";
  try {
    select(selectQuery1);
    logger("[TEST]", pc.magenta, console.info, "Select test passed");
  } catch (error) {
    select[selectQuery1];
    logger("[TEST]", pc.red, console.error, "Select test failed", error);
  }
}

function testSelectV2() {
  const selectQuery2 = "SELECT id, name from users";
  try {
    select(selectQuery2);
    logger("[TEST]", pc.magenta, console.info, "Select test passed");
  } catch (error) {
    select[selectQuery1];
    logger("[TEST]", pc.red, console.error, "Select test failed", error);
  }
}

function testSelectV3() {
  const selectQuery3 = "SELECT * from users";
  try {
    select(selectQuery3);
    logger("[TEST]", pc.magenta, console.info, "Select test passed");
  } catch (error) {
    select[selectQuery1];
    logger("[TEST]", pc.red, console.error, "Select test failed", error);
  }
}
function testSelectV4() {
  const selectQuery4 = "SELECT * FROM users WHERE id <3 ";
  try {
    select(selectQuery4);
    logger("[TEST]", pc.magenta, console.info, "Select test passed");
  } catch (error) {
    select[selectQuery4];
    logger("[TEST]", pc.red, console.error, "Select test failed", error);
  }
}

function testCreateIndexV1() {
  try {
    createIndex("users", "name");
    createIndex("users", "age");
    logger("[TEST]", pc.magenta, console.info, "Create Index test passed\n");
  } catch (error) {
    logger("[TEST]", pc.red, console.error, "Create Index test failed\n", error);
  }
}

function testSearchWithIndexV1() {
  try {
    searchWithIndex("users", "name", "John");
    logger("[TEST]", pc.magenta, console.info, "Search Index test passed\n");
  } catch (error) {
    logger("[TEST]", pc.red, console.error, "Search Index test failed\n", error);
  }
}

function testBackupDatabaseV1() {
  try {
    backupDatabase("backup");
    logger("[TEST]", pc.magenta, console.info, "Backup test passed\n");
  } catch (error) {
    logger("[TEST]", pc.red, console.error, "Backup test failed\n", error);
  }
}

function testRestoreDatabaseV1() {
  try {
    restoreDatabase("./backup");
    logger("[TEST]", pc.magenta, console.info, "Restore test passed\n");
  } catch (error) {
    logger("[TEST]", pc.red, console.error, "Restore test failed\n", error);
  }
}

function main() {
  testCreateTableV1();
  testCreateTableV2();
  testInsertIntoV1();
  testSelectV1();
  testSelectV2();
  testSelectV3();
  // testSelectV4();
  testCreateIndexV1();
  testSearchWithIndexV1();
  testBackupDatabaseV1();
  testRestoreDatabaseV1();
}

main();
