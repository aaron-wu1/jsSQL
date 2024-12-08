import { writeJSON } from "./lib/storage.js";
import { logDebug, logError, logInfo, logSuccess } from "./logger/logger.js";

logError("This is my error statement");
logDebug("This is my debug statement");
logInfo("This is my info statement");
logSuccess("This is my success statement");

writeJSON("./database");
