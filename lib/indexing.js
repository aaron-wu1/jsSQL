// lib/indexing.js
/**
 * @module indexing
 * @description Implements indexing and optimised lookups
 */

import { logError, logInfo, logSuccess } from "../logger/logger.js";
import { readJSON, writeJSON, getTableFilePath } from "./storage.js";

const ORDER = 4;
/**
 * Node class represents a node in the B-Tree
 *
 * @class
 * @property {Array<string>} keys - The keys stored in the node.
 * @property {Array<Node>} children - The children nodes of the current node.
 * @property {boolean} isLeaf - Indicates if the node is a leaf node.
 * @property {Node|null} next - The next leaf node (used in leaf nodes for range queries).
 */
class Node {
  constructor(isLeaf = false) {
    this.keys = [];
    this.children = [];
    this.isLeaf = isLeaf;
    this.next = null;
  }

  /**
   * Searches key in the table
   * @param {string} key - key to search for
   * @returns {int} - index after the key in the table or next greater key
   */
  searchNode(key) {
    let childIdx = 0;
    while (childIdx < this.keys.length && this.keys[childIdx] <= key) {
      childIdx++;
    }
    return childIdx;
  }
}
/**
 * BTree class represents a B-Tree data structure.
 *
 * @class
 * @property {number} order - The order of the B-Tree.
 * @property {Node} root - The root node of the B-Tree.
 */
class BTree {
  constructor() {
    this.order = ORDER;
    this.root = new Node(true);
  }
  /**
   * Searches for the given key in the table
   * @param {string} key - key to search for
   * @returns {string} - position of key in the table
   */
  search(key) {
    let curNode = this.root;
    while (!curNode.isLeaf) {
      let childIdx = curNode.searchNode(key);
      curNode = curNode.children[childIdx];
    }
    const idx = curNode.keys.findIndex((k) => k === key);
    return idx !== -1 ? curNode.children[idx] : null;
  }

  /**
   * Inserts key with value in the table, appends if key already exists
   * @param {string} key - key to search for
   * @param {string} value - value to insert
   */
  insert(key, value) {
    const { newKey, newNode } = this.insertRecursive(this.root, key, value);

    if (newNode) {
      const newRoot = new Node(false);
      newRoot.keys = [newKey];
      newRoot.children.push(this.root);
      newRoot.children.push(newNode);
      this.root = newRoot;
    }
  }
  /**
   * helper function to recursive traverse b tree
   * @param {Node} node - current node
   * @param {string} key - key to search for
   * @param {string} value - value to insert
   */
  insertRecursive(node, key, value) {
    // find key position
    const idx = node.searchNode(key);

    // base case
    // if key exists
    if (node.isLeaf && node.keys.includes(key)) {
      // node.keys.splice(idx, 0, key);
      node.children[idx - 1].push(value);
      // node.children.splice(idx, 0, value);

      // if node is full, split it
      if (node.keys.length > this.order - 1) {
        return this.splitLeaf(node);
      }
      return {};
    } else if (node.isLeaf) {
      node.keys.splice(idx, 0, key);
      node.children.splice(idx, 0, [value]);

      // if node is full, split it
      if (node.keys.length > this.order - 1) {
        return this.splitLeaf(node);
      }
      return {};
    }

    const { newKey, newNode } = this.insertRecursive(node.children[idx], key, value);

    // spliting parent node
    if (newNode) {
      node.keys.splice(idx, 0, newKey);
      node.children.splice(idx + 1, 0, newNode);

      // if node is full, split it
      if (node.keys.length > this.order - 1) {
        return this.splitInternal(node);
      }
    }
    return {};
  }
  /**
   * helper function to split leaf node
   * @param {Node} node - node to split
   * @return {Object{string[], Node}} - object with keys newKey and newNode corresponding to the new keys and new node
   */
  splitLeaf(node) {
    const midIdx = Math.floor(node.keys.length / 2);
    const newKey = node.keys[midIdx];
    const newLeaf = new Node(true);
    newLeaf.keys = node.keys.splice(midIdx);
    newLeaf.children = node.children.splice(midIdx);

    newLeaf.next = node.next;
    node.next = newLeaf;

    return { newKey: newLeaf.keys[0], newNode: newLeaf };
  }
  /**
   * helper function to split internal nodes
   * @param {Node} node - node to split
   * @return {Object{string[], Node}} - object with keys newKey and newNode corresponding to the new keys and new node
   */
  splitInternal(node) {
    const midIdx = Math.floor(node.keys.length / 2);
    const newInternal = new Node(false);
    newInternal.keys = node.keys.splice(midIdx);
    newInternal.children = node.children.splice(midIdx);
    const upKey = node.keys.pop();
    return { newKey: upKey, newNode: newInternal };
  }
  /**
   * helper function query a range of keys TODO: broken
   * @param {string} startKey - start key to check
   * @param {string} endKey - end key to check
   * @return {Array<number>} - array of values in the range
   */
  rangeQuery(startKey, endKey) {
    let currentNode = this.root;

    while (!currentNode.isLeaf) {
      const idx = this._findChildIndex(currentNode.keys, startKey);
      currentNode = currentNode.children[idx];
    }

    const results = [];
    while (currentNode) {
      for (let i = 0; i < currentNode.keys.length; i++) {
        if (
          this.compareFn(currentNode.keys[i], startKey) >= 0 &&
          this.compareFn(currentNode.keys[i], endKey) <= 0
        ) {
          results.push(currentNode.children[i]);
        } else if (this.compareFn(currentNode.keys[i], endKey) > 0) {
          return results;
        }
      }
      currentNode = currentNode.next;
    }
    return results;
  }
  /**
   * helper function to parse b tree from json and builds tree
   * @param {string} jsonTree - raw json data
   */
  fromJSON(jsonTree) {
    const buildNode = (data) => {
      const node = new Node(data.isLeaf);

      node.keys = data.keys;
      node.children = data.children;

      if (node.isLeaf) {
        node.next = data.next || null;
      } else {
        node.children = node.children.map((childData) => buildNode(childData));
      }
      return node;
    };
    this.root = buildNode(jsonTree);
  }
}

/**
 * Creates an index on a specific column of a table
 * @param {string} tableName - The name of the table
 * @param {string} column - The column to index
 */
export function createIndex(tableName, column) {
  const dataPath = getTableFilePath(tableName, "data");
  const indexPath = getTableFilePath(tableName, `${column}.index`);

  const data = readJSON(dataPath);
  if (!data) {
    logError(`Table "${tableName}" does not exist`);
    throw new Error(`Table "${tableName}" does not exist`);
  }
  const indexTree = new BTree();
  data.forEach((row, i) => {
    const key = row[column];
    indexTree.insert(key, i);
  });

  writeJSON(indexPath, indexTree);
  logSuccess(`Index created on column: "${column}" of table: "${tableName}"`);
}

/**
 * Searches for rows in a table using an index
 * @param {string} tableName - Name of the table
 * @param {string} column - Column to search
 * @param {string | number | boolean} value - Value to search for
 * @returns {Array<object>} the matching rows
 */
export function searchWithIndex(tableName, column, value) {
  const dataPath = getTableFilePath(tableName, "data");
  const indexPath = getTableFilePath(tableName, `${column}.index`);

  const data = readJSON(dataPath);
  if (!data) {
    logError(`Table "${tableName}" does not exist`);
    throw new Error(`Table "${tableName}" does not exist`);
  }

  const indexTree = new BTree();
  indexTree.fromJSON(readJSON(indexPath).root);
  if (!indexTree) {
    logError(`Index on column: "${column}" does not exist for table "${tableName}"`);
    throw new Error(`Index on column: "${column}" does not exist for table "${tableName}"`);
  }
  const positions = indexTree.search(value);
  let rows = [];
  if (!positions) {
    for (row in data) {
      logInfo(`Index: failed to find rows "${value}" in table "${tableName}": `, rows);
      logInfo(`Searching without index..."${value}" in table "${tableName}": `, rows);
      if (row[column] === value) {
        rows.push(row);
      }
    }
  } else {
    rows = positions.map((pos) => data[pos]);
  }

  logInfo(`Found matching rows for "${value}" in table "${tableName}": `, rows);
  return rows;
}
