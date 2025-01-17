# jsSQL

File-based SQL database in JS. Uses SQL syntax for querying and managing data.

## Quickstart

### Install package

`npm install @aaron-wu/jssql`

### Usage

Check out [query.js](./lib/query.js) for a list of all the supported queries

Here's a little code sample:

```js
import {
  createTable,
  insertInto,
  select,
  createIndex,
  searchWithIndex,
  backupDatabase,
  restoreDatabase,
} from '@aaron-wu/jssql';

// DDL

// Create the 'users' table
createTable('CREATE TABLE users (id int, name txt, age int, student boolean)');

// Create the 'products' table
createTable('CREATE TABLE products (id int, name txt, user_id int, cost int)');

// Insert users into the 'users' table
insertInto(
  'INSERT INTO users (id, name, age, student) VALUES (101, "ALICE", 22, true)'
);
insertInto(
  'INSERT INTO users (id, name, age, student) VALUES (102, "Bob", 25, false)'
);
insertInto(
  'INSERT INTO users (id, name, age, student) VALUES (103, "John", 32, true)'
);
insertInto(
  'INSERT INTO users (id, name, age, student) VALUES (104, "Tom", 28, true)'
);
insertInto(
  'INSERT INTO users (id, name, age, student) VALUES (105, "Peter", 10, false)'
);

// Insert products into the 'products' table
insertInto(
  "INSERT INTO products (id, name, user_id, cost) VALUES (1, 'pencil', 101, 5)"
);
insertInto(
  "INSERT INTO products (id, name, user_id, cost) VALUES (2, 'sparkling water', 102, 10)"
);
insertInto(
  "INSERT INTO products (id, name, user_id, cost) VALUES (3, 'cereal', 102, 15)"
);
insertInto(
  "INSERT INTO products (id, name, user_id, cost) VALUES (4, 'tablet', 101, 150)"
);
insertInto(
  "INSERT INTO products (id, name, user_id, cost) VALUES (5, 'keyboard', 101, 100)"
);
insertInto(
  "INSERT INTO products (id, name, user_id, cost) VALUES (6, 'unicorn', 200, 1000)"
);

// SELECT

// Select all products from the 'products' table
select('SELECT * FROM products');

// Select products with id 1 from the 'products' table
select('SELECT * FROM products WHERE id = 1');

// Select the name of all products from the 'products' table
select('SELECT name FROM products');

// Select products with cost greater than 30 from the 'products' table
select('SELECT * FROM products WHERE cost > 30');

// JOINS

// Select all users and their products using INNER JOIN
select(
  'SELECT * FROM users INNER JOIN products ON users.id = products.user_id'
);

// Select all products and their users using LEFT JOIN
select('SELECT * FROM products LEFT JOIN users ON users.id = products.user_id');

// Select all products and their users using RIGHT JOIN
select(
  'SELECT * FROM products RIGHT JOIN users ON users.id = products.user_id'
);

// Select all products and their users using FULL OUTER JOIN
select(
  'SELECT * FROM products FULL OUTER JOIN users ON users.id = products.user_id'
);

// INDEXING

// Create an index on the 'name' column of the 'users' table
createIndex('users', 'name');

// Search for users with the name 'John' using the index
searchWithIndex('users', 'name', 'John');

// AGGREGATIONS

// Select the average age of users from the 'users' table
select('SELECT AVG(age) AS average_age FROM users');

// Select the total number of users from the 'users' table
select('SELECT COUNT(*) AS total_users FROM users');

// Backup the database
backupDatabase('backup');

// Restore the database from the backup
restoreDatabase('./backup');
```

## Setup

Create a `.env` file at root  
Add `SQL_DB_PATH="./database/"` in .env file or set your own desired path  
Run `npm install`  

## Tests

For additional examples of functionality, run tests with:

```bash
node test/test_db.js
```

Example output:

```bash
[Dec 28, 2024, 16:45:44.941] [SUCCESS] Table 'users' created successfully!
[Dec 28, 2024, 16:45:44.974] [TEST] Table creation test passed

[Dec 28, 2024, 16:45:44.975] [SUCCESS] Row inserted into table "users"!
[Dec 28, 2024, 16:45:44.975] [SUCCESS] Row inserted into table "users"!
[Dec 28, 2024, 16:45:44.975] [SUCCESS] Row inserted into table "users"!
[Dec 28, 2024, 16:45:44.975] [SUCCESS] Row inserted into table "users"!
[Dec 28, 2024, 16:45:44.976] [SUCCESS] Row inserted into table "users"!
[Dec 28, 2024, 16:45:44.976] [TEST] Insert Into test passed

┌─────────┬─────┐
│ (index) │ id  │
├─────────┼─────┤
│    0    │ 101 │
│    1    │ 102 │
│    2    │ 103 │
│    3    │ 104 │
│    4    │ 105 │
└─────────┴─────┘
[Dec 28, 2024, 16:45:44.977] [SUCCESS] SELECT Query executed successfully
[Dec 28, 2024, 16:45:44.978] [TEST] Select test passed
┌─────────┬─────┬─────────┐
│ (index) │ id  │  name   │
├─────────┼─────┼─────────┤
│    0    │ 101 │ 'ALICE' │
│    1    │ 102 │  'Bob'  │
│    2    │ 103 │ 'John'  │
│    3    │ 104 │  'Tom'  │
│    4    │ 105 │ 'Peter' │
└─────────┴─────┴─────────┘
[Dec 28, 2024, 16:45:44.979] [SUCCESS] SELECT Query executed successfully
[Dec 28, 2024, 16:45:44.979] [TEST] Select test passed
┌─────────┬─────┬─────────┬─────┬─────────┐
│ (index) │ id  │  name   │ age │ student │
├─────────┼─────┼─────────┼─────┼─────────┤
│    0    │ 101 │ 'ALICE' │ 22  │ 'true'  │
│    1    │ 102 │  'Bob'  │ 25  │ 'false' │
│    2    │ 103 │ 'John'  │ 32  │ 'true'  │
│    3    │ 104 │  'Tom'  │ 28  │ 'true'  │
│    4    │ 105 │ 'Peter' │ 10  │ 'false' │
└─────────┴─────┴─────────┴─────┴─────────┘
[Dec 28, 2024, 16:45:44.980] [SUCCESS] SELECT Query executed successfully
[Dec 28, 2024, 16:45:44.980] [TEST] Select test passed
┌─────────┬─────┬────────┬─────┬─────────┐
│ (index) │ id  │  name  │ age │ student │
├─────────┼─────┼────────┼─────┼─────────┤
│    0    │ 103 │ 'John' │ 32  │ 'true'  │
└─────────┴─────┴────────┴─────┴─────────┘
[Dec 28, 2024, 16:45:44.980] [SUCCESS] SELECT Query executed successfully
[Dec 28, 2024, 16:45:44.980] [TEST] Select test passed
[Dec 28, 2024, 16:45:44.981] [SUCCESS] Index created on column: "name" of table: "users"
[Dec 28, 2024, 16:45:44.981] [SUCCESS] Index created on column: "age" of table: "users"
[Dec 28, 2024, 16:45:44.981] [TEST] Create Index test passed

[Dec 28, 2024, 16:45:44.981] [INFO] Found matching rows for "John" in table "users":  [ { id: 103, name: 'John', age: 32, student: 'true' } ]
[Dec 28, 2024, 16:45:44.982] [TEST] Search Index test passed

[Dec 28, 2024, 16:45:44.985] [SUCCESS] Database backup completed successfully! Available at: backup
[Dec 28, 2024, 16:45:44.985] [TEST] Backup test passed

[Dec 28, 2024, 16:45:44.986] [SUCCESS] Database restored successfully from ./backup to ./database
[Dec 28, 2024, 16:45:44.986] [TEST] Restore test passed

[Dec 28, 2024, 16:45:44.986] [INFO] [Lock] Mutex created for table "users"
[Dec 28, 2024, 16:45:44.986] [DEBUG] [Mutex] Lock acquired
[Dec 28, 2024, 16:45:44.986] [DEBUG] [Mutex] Lock busy, request queued
[Dec 28, 2024, 16:45:44.987] [INFO] [Lock] Lock acquired for table "users
[Dec 28, 2024, 16:45:44.987] [INFO] [Lock] Perofrming operation on table "users
[Dec 28, 2024, 16:45:44.987] [TEST] Task 1 started
[Dec 28, 2024, 16:45:44.987] [SUCCESS] Row inserted into table "users"!
[Dec 28, 2024, 16:45:49.989] [TEST] Task 1 completed
[Dec 28, 2024, 16:45:49.990] [DEBUG] [MUTEX] Passing the lock to the next function in the queue
[Dec 28, 2024, 16:45:49.991] [DEBUG] [Mutex] Lock acquired
[Dec 28, 2024, 16:45:49.991] [INFO] [Lock] released for table "users"
[Dec 28, 2024, 16:45:49.991] [INFO] [Lock] Lock acquired for table "users
[Dec 28, 2024, 16:45:49.991] [INFO] [Lock] Perofrming operation on table "users
[Dec 28, 2024, 16:45:49.992] [TEST] Task 2 started
[Dec 28, 2024, 16:45:49.993] [SUCCESS] Row inserted into table "users"!
[Dec 28, 2024, 16:45:54.994] [TEST] Task 2 completed
[Dec 28, 2024, 16:45:54.996] [DEBUG] [MUTEX] Lock released
[Dec 28, 2024, 16:45:54.999] [INFO] [Lock] released for table "users"
[Dec 28, 2024, 16:45:54.999] [TEST] Locks test passed

[Dec 28, 2024, 16:45:55.003] [SUCCESS] Table 'products' created successfully!
[Dec 28, 2024, 16:45:55.003] [TEST] Table creation test passed

[Dec 28, 2024, 16:45:55.005] [SUCCESS] Row inserted into table "products"!
[Dec 28, 2024, 16:45:55.006] [SUCCESS] Row inserted into table "products"!
[Dec 28, 2024, 16:45:55.007] [SUCCESS] Row inserted into table "products"!
[Dec 28, 2024, 16:45:55.009] [SUCCESS] Row inserted into table "products"!
[Dec 28, 2024, 16:45:55.011] [SUCCESS] Row inserted into table "products"!
[Dec 28, 2024, 16:45:55.011] [SUCCESS] Row inserted into table "products"!
[Dec 28, 2024, 16:45:55.012] [TEST] Insert Into test passed

┌─────────┬─────┬─────────┬─────────┬──────────┬─────────────┬────────────┬───────────────────┐
│ (index) │ age │ student │ user_id │ users.id │ products.id │ users.name │   products.name   │
├─────────┼─────┼─────────┼─────────┼──────────┼─────────────┼────────────┼───────────────────┤
│    0    │ 22  │ 'true'  │   101   │   101    │      1      │  'ALICE'   │     'pencil'      │
│    1    │ 22  │ 'true'  │   101   │   101    │      4      │  'ALICE'   │     'tablet'      │
│    2    │ 22  │ 'true'  │   101   │   101    │      5      │  'ALICE'   │    'keyboard'     │
│    3    │ 25  │ 'false' │   102   │   102    │      2      │   'Bob'    │ 'sparkling water' │
│    4    │ 25  │ 'false' │   102   │   102    │      3      │   'Bob'    │     'cereal'      │
└─────────┴─────┴─────────┴─────────┴──────────┴─────────────┴────────────┴───────────────────┘
[Dec 28, 2024, 16:45:55.015] [SUCCESS] SELECT Query executed successfully
[Dec 28, 2024, 16:45:55.016] [TEST] Inner join test passed
┌─────────┬─────────┬─────┬─────────┬─────────────┬──────────┬───────────────────┬────────────┐
│ (index) │ user_id │ age │ student │ products.id │ users.id │   products.name   │ users.name │
├─────────┼─────────┼─────┼─────────┼─────────────┼──────────┼───────────────────┼────────────┤
│    0    │   101   │ 22  │ 'true'  │      1      │   101    │     'pencil'      │  'ALICE'   │
│    1    │   102   │ 25  │ 'false' │      2      │   102    │ 'sparkling water' │   'Bob'    │
│    2    │   102   │ 25  │ 'false' │      3      │   102    │     'cereal'      │   'Bob'    │
│    3    │   101   │ 22  │ 'true'  │      4      │   101    │     'tablet'      │  'ALICE'   │
│    4    │   101   │ 22  │ 'true'  │      5      │   101    │    'keyboard'     │  'ALICE'   │
└─────────┴─────────┴─────┴─────────┴─────────────┴──────────┴───────────────────┴────────────┘
[Dec 28, 2024, 16:45:55.020] [SUCCESS] SELECT Query executed successfully
[Dec 28, 2024, 16:45:55.020] [TEST] Inner join (flipped cond) test passed
┌─────────┬─────────┬───────────┬───────────┬─────────────┬───────────┬───────────────────┬────────────┐
│ (index) │ user_id │    age    │  student  │ products.id │ users.id  │   products.name   │ users.name │
├─────────┼─────────┼───────────┼───────────┼─────────────┼───────────┼───────────────────┼────────────┤
│    0    │   101   │    22     │  'true'   │      1      │    101    │     'pencil'      │  'ALICE'   │
│    1    │   102   │    25     │  'false'  │      2      │    102    │ 'sparkling water' │   'Bob'    │
│    2    │   102   │    25     │  'false'  │      3      │    102    │     'cereal'      │   'Bob'    │
│    3    │   101   │    22     │  'true'   │      4      │    101    │     'tablet'      │  'ALICE'   │
│    4    │   101   │    22     │  'true'   │      5      │    101    │    'keyboard'     │  'ALICE'   │
│    5    │   200   │ undefined │ undefined │      6      │ undefined │     'unicorn'     │ undefined  │
└─────────┴─────────┴───────────┴───────────┴─────────────┴───────────┴───────────────────┴────────────┘
[Dec 28, 2024, 16:45:55.023] [SUCCESS] SELECT Query executed successfully
[Dec 28, 2024, 16:45:55.023] [TEST] Left join test passed
┌─────────┬───────────┬─────┬─────────┬─────────────┬──────────┬───────────────────┬────────────┐
│ (index) │  user_id  │ age │ student │ products.id │ users.id │   products.name   │ users.name │
├─────────┼───────────┼─────┼─────────┼─────────────┼──────────┼───────────────────┼────────────┤
│    0    │    101    │ 22  │ 'true'  │      1      │   101    │     'pencil'      │  'ALICE'   │
│    1    │    102    │ 25  │ 'false' │      2      │   102    │ 'sparkling water' │   'Bob'    │
│    2    │    102    │ 25  │ 'false' │      3      │   102    │     'cereal'      │   'Bob'    │
│    3    │    101    │ 22  │ 'true'  │      4      │   101    │     'tablet'      │  'ALICE'   │
│    4    │    101    │ 22  │ 'true'  │      5      │   101    │    'keyboard'     │  'ALICE'   │
│    5    │ undefined │ 32  │ 'true'  │  undefined  │   103    │     undefined     │   'John'   │
│    6    │ undefined │ 28  │ 'true'  │  undefined  │   104    │     undefined     │   'Tom'    │
│    7    │ undefined │ 10  │ 'false' │  undefined  │   105    │     undefined     │  'Peter'   │
│    8    │ undefined │ 23  │ 'true'  │  undefined  │   106    │     undefined     │   'Eve'    │
│    9    │ undefined │ 29  │ 'false' │  undefined  │   107    │     undefined     │   'Josh'   │
└─────────┴───────────┴─────┴─────────┴─────────────┴──────────┴───────────────────┴────────────┘
[Dec 28, 2024, 16:45:55.025] [SUCCESS] SELECT Query executed successfully
[Dec 28, 2024, 16:45:55.025] [TEST] Right join test passed
┌─────────┬───────────┬───────────┬───────────┬─────────────┬───────────┬───────────────────┬────────────┐
│ (index) │  user_id  │    age    │  student  │ products.id │ users.id  │   products.name   │ users.name │
├─────────┼───────────┼───────────┼───────────┼─────────────┼───────────┼───────────────────┼────────────┤
│    0    │    101    │    22     │  'true'   │      1      │    101    │     'pencil'      │  'ALICE'   │
│    1    │    102    │    25     │  'false'  │      2      │    102    │ 'sparkling water' │   'Bob'    │
│    2    │    102    │    25     │  'false'  │      3      │    102    │     'cereal'      │   'Bob'    │
│    3    │    101    │    22     │  'true'   │      4      │    101    │     'tablet'      │  'ALICE'   │
│    4    │    101    │    22     │  'true'   │      5      │    101    │    'keyboard'     │  'ALICE'   │
│    5    │    200    │ undefined │ undefined │      6      │ undefined │     'unicorn'     │ undefined  │
│    6    │ undefined │    32     │  'true'   │  undefined  │    103    │     undefined     │   'John'   │
│    7    │ undefined │    28     │  'true'   │  undefined  │    104    │     undefined     │   'Tom'    │
│    8    │ undefined │    10     │  'false'  │  undefined  │    105    │     undefined     │  'Peter'   │
│    9    │ undefined │    23     │  'true'   │  undefined  │    106    │     undefined     │   'Eve'    │
│   10    │ undefined │    29     │  'false'  │  undefined  │    107    │     undefined     │   'Josh'   │
└─────────┴───────────┴───────────┴───────────┴─────────────┴───────────┴───────────────────┴────────────┘
[Dec 28, 2024, 16:45:55.029] [SUCCESS] SELECT Query executed successfully
[Dec 28, 2024, 16:45:55.029] [TEST] Full outer join test passed
┌─────────┬────────────────────┐
│ (index) │    average_age     │
├─────────┼────────────────────┤
│    0    │ 24.142857142857142 │
└─────────┴────────────────────┘
[Dec 28, 2024, 16:45:55.030] [SUCCESS] SELECT Query executed successfully
[Dec 28, 2024, 16:45:55.030] [TEST] Average aggregation test passed
┌─────────┬─────────────┐
│ (index) │ total_users │
├─────────┼─────────────┤
│    0    │      7      │
└─────────┴─────────────┘
[Dec 28, 2024, 16:45:55.031] [SUCCESS] SELECT Query executed successfully
[Dec 28, 2024, 16:45:55.031] [TEST] Count aggregation test passed
```
## TODO
- [ ] Add B+ tree indexing

## Acknowledgements

[utk09](https://github.com/utk09) for providing a starting point through MLH dataweek!
