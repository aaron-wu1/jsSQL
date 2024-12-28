# jsSQL

File-based SQL database in JS. Uses SQL syntax for querying and managing data.

## Quickstart

### Install package

`npm install @aaron-wu/jssql`

### Usage

Check out [query.js](./lib/query.js) for a list of all the supported queries

Here's a little code sample:

```js
import { createTable, insertInto } from '@aaron-wu/jssql';

createTable('CREATE TABLE products (id int, name txt, quantity int)');

insertInto(
  "INSERT INTO products (id, name, quantity) VALUES (1, 'table', 100)"
);
insertInto("INSERT INTO products (id, name, quantity) VALUES (2, 'chair', 60)");
insertInto(
  "INSERT INTO products (id, name, quantity) VALUES (3, 'nightstand', 40)"
);
```
