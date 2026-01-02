const fs = require("fs");
const path = require("path");

const logsDir = path.join(__dirname, "..", "logs");
const logFile = path.join(logsDir, "app.log");

if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

function timestamp() {
  return new Date().toISOString();
}

function writeLog(level, message) {
  const logMessage = `[${timestamp()}] [${level.toUpperCase()}] ${message}\n`;
  // Console output
  switch (level) {
    case "error":
      console.error(logMessage);
      break;
    case "warn":
      console.warn(logMessage);
      break;
    default:
      console.log(logMessage);
  }

  // Write to file asynchronously
  fs.appendFile(logFile, logMessage, (err) => {
    if (err) console.error("Failed to write log to file:", err);
  });
}

module.exports = {
  info: (msg) => writeLog("info", msg),
  warn: (msg) => writeLog("warn", msg),
  error: (msg) => writeLog("error", msg),
};
