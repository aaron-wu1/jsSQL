// lib/mutex.js
/**
 * @module mutex
 * @description Implement a mutex for managing access to resources
 */

import { logDebug } from "../logger/logger.js";

class Mutex {
  constructor() {
    this._queue = [];
    this._locked = false;
  }

  lock() {
    return new Promise((resolve) => {
      // attempt to aquire lock
      const tryAcquire = () => {
        if (!this._locked) {
          this._locked = true;
          logDebug("[Mutex] Lock acquired");
          resolve(this.unlock.bind(this));
        } else {
          logDebug("[Mutex] Lock busy, request queued");
          this._queue.push(tryAcquire);
        }
      };

      tryAcquire();
    });
  }

  unlock() {
    if (this._queue.length > 0) {
      logDebug("[MUTEX] Passing the lock to the next function in the queue");
      this._locked = false;
      // next queued function
      const next = this._queue.shift();
      next();
    } else {
      this._locked = false;
      logDebug("[MUTEX] Lock released");
    }
  }
}
export default Mutex;
