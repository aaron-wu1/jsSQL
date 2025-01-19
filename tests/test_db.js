import { insertInto, select } from "../lib/query.js";
import { createTable } from "../lib/schema.js";
import { logger } from "../logger/logger.js";
import { createIndex, searchWithIndex } from "../lib/indexing.js";
import pc from "picocolors";
import { backupDatabase, restoreDatabase } from "../lib/backup.js";
import { performWithLock } from "../lib/locks.js";

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
function testCreateTableV3() {
  const createTableQuery = "CREATE TABLE products (id int, name txt, user_id int)";
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
  const insertIntoQuery6 =
    "INSERT INTO users (id, name, age, student) VALUES (106, 'John', 32, true)";
  try {
    insertInto(insertIntoQuery1);
    insertInto(insertIntoQuery2);
    insertInto(insertIntoQuery3);
    insertInto(insertIntoQuery4);
    insertInto(insertIntoQuery5);
    insertInto(insertIntoQuery6);
    logger("[TEST]", pc.magenta, console.info, "Insert Into test passed\n");
  } catch (error) {
    logger("[TEST]", pc.red, console.error, "Insert Into test failed\n", error);
  }
}

function testInsertIntoV2() {
  const insertIntoQuery1 = "INSERT INTO products (id, name, user_id) VALUES (1, 'pencil', 101)";
  const insertIntoQuery2 =
    "INSERT INTO products (id, name, user_id) VALUES (2, 'sparkling water', 102)";
  const insertIntoQuery3 = "INSERT INTO products (id, name, user_id) VALUES (3, 'cereal', 102)";
  const insertIntoQuery4 = "INSERT INTO products (id, name, user_id) VALUES (4, 'tablet', 101)";
  const insertIntoQuery5 = "INSERT INTO products (id, name, user_id) VALUES (5, 'keyboard', 101)";
  const insertIntoQuery6 = "INSERT INTO products (id, name, user_id) VALUES (6, 'unicorn', 200)";
  try {
    insertInto(insertIntoQuery1);
    insertInto(insertIntoQuery2);
    insertInto(insertIntoQuery3);
    insertInto(insertIntoQuery4);
    insertInto(insertIntoQuery5);
    insertInto(insertIntoQuery6);
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
  const selectQuery4 = "SELECT * FROM users WHERE age > 30";
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
    // createIndex("users", "age");
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

async function testLocksV1() {
  try {
    const insertIntoQueries = [
      "INSERT INTO users (id, name, age, student) VALUES (106, 'Eve', 23, true)",
      "INSERT INTO users (id, name, age, student) VALUES (107, 'Josh', 29, false)",
    ];
    // NOTE: async functions always returns a promise
    // returns performWithLock (a promise) when await is done
    // without return => undefined => allSettled can't resolve
    const performInsert = (query, taskName) =>
      performWithLock("users", async () => {
        logger("[TEST]", pc.magenta, console.info, `${taskName} started`);
        insertInto(query);

        // test delay
        await new Promise((res) => setTimeout(res, 5000));
        logger("[TEST]", pc.magenta, console.info, `${taskName} completed`);
      });

    const promises = [
      performInsert(insertIntoQueries[0], "Task 1"),
      performInsert(insertIntoQueries[1], "Task 2"),
    ];

    // check if all promises are resolved
    await Promise.allSettled(promises);

    logger("[TEST]", pc.magenta, console.info, "Locks test passed\n");
  } catch (error) {
    logger("[TEST]", pc.red, console.error, "Locks test failed\n", error);
  }
}

async function testJoinsV1() {
  const selectQuery4 = "SELECT * FROM users INNER JOIN products ON users.id = products.user_id";
  try {
    select(selectQuery4);
    logger("[TEST]", pc.magenta, console.info, "Inner join test passed");
  } catch (error) {
    select[selectQuery4];
    logger("[TEST]", pc.red, console.error, "Inner join test failed", error);
  }
}
async function testJoinsV2() {
  const selectQuery4 = "SELECT * FROM products INNER JOIN users ON users.id = products.user_id";
  try {
    select(selectQuery4);
    logger("[TEST]", pc.magenta, console.info, "Inner join (flipped cond) test passed");
  } catch (error) {
    select[selectQuery4];
    logger("[TEST]", pc.red, console.error, "Inner join (flipped cond) test failed", error);
  }
}
async function testJoinsV3() {
  const selectQuery4 = "SELECT * FROM products LEFT JOIN users ON users.id = products.user_id";
  try {
    select(selectQuery4);
    logger("[TEST]", pc.magenta, console.info, "Left join test passed");
  } catch (error) {
    select[selectQuery4];
    logger("[TEST]", pc.red, console.error, "Left join test failed", error);
  }
}
async function testJoinsV4() {
  const selectQuery4 = "SELECT * FROM products RIGHT JOIN users ON users.id = products.user_id";
  try {
    select(selectQuery4);
    logger("[TEST]", pc.magenta, console.info, "Right join test passed");
  } catch (error) {
    select[selectQuery4];
    logger("[TEST]", pc.red, console.error, "Right join test failed", error);
  }
}

async function testJoinsV5() {
  const selectQuery4 =
    "SELECT * FROM products FULL OUTER JOIN users ON users.id = products.user_id";
  try {
    select(selectQuery4);
    logger("[TEST]", pc.magenta, console.info, "Full outer join test passed");
  } catch (error) {
    select[selectQuery4];
    logger("[TEST]", pc.red, console.error, "Full outer join failed", error);
  }
}

async function testAggregationsV1() {
  // const selectQuery4 = "SELECT COUNT(*) AS total_users FROM users";
  const selectQuery4 = "SELECT AVG(age) AS average_age FROM users";
  try {
    select(selectQuery4);
    logger("[TEST]", pc.magenta, console.info, "Average aggregation test passed");
  } catch (error) {
    select[selectQuery4];
    logger("[TEST]", pc.red, console.error, "Average aggregation failed", error);
  }
}
async function testAggregationsV2() {
  const selectQuery4 = "SELECT COUNT(*) AS total_users FROM users";
  try {
    select(selectQuery4);
    logger("[TEST]", pc.magenta, console.info, "Count aggregation test passed");
  } catch (error) {
    select[selectQuery4];
    logger("[TEST]", pc.red, console.error, "Count aggregation failed", error);
  }
}

async function main() {
  testCreateTableV1();
  testCreateTableV2();
  testInsertIntoV1();
  testSelectV1();
  testSelectV2();
  testSelectV3();
  testSelectV4();
  testCreateIndexV1();
  testSearchWithIndexV1();
  testBackupDatabaseV1();
  testRestoreDatabaseV1();
  await testLocksV1();
  testCreateTableV3();
  testInsertIntoV2();
  testJoinsV1();
  testJoinsV2();
  testJoinsV3();
  testJoinsV4();
  testJoinsV5();
  testAggregationsV1();
  testAggregationsV2();
}

main();
