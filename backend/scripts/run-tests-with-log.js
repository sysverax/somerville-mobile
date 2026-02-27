const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const logsDir = path.resolve(__dirname, "..", "logs");
fs.mkdirSync(logsDir, { recursive: true });

const now = new Date();
const pad = (value) => String(value).padStart(2, "0");
const timestamp = [
  now.getFullYear(),
  pad(now.getMonth() + 1),
  pad(now.getDate()),
  "-",
  pad(now.getHours()),
  pad(now.getMinutes()),
  pad(now.getSeconds()),
].join("");

const logPath = path.join(logsDir, `test-${timestamp}.log`);
const logStream = fs.createWriteStream(logPath, { flags: "a" });

const argsFromCli = process.argv.slice(2);
const jestArgs = ["jest", "--runInBand", ...argsFromCli];

const header = `Test run started: ${now.toISOString()}\nCommand: npx ${jestArgs.join(" ")}\n\n`;
logStream.write(header);
process.stdout.write(`Saving full test output to: ${logPath}\n\n`);

const child = spawn("npx", jestArgs, {
  cwd: path.resolve(__dirname, ".."),
  shell: true,
  env: process.env,
});

child.stdout.on("data", (chunk) => {
  process.stdout.write(chunk);
  logStream.write(chunk);
});

child.stderr.on("data", (chunk) => {
  process.stderr.write(chunk);
  logStream.write(chunk);
});

child.on("close", (code) => {
  const footer = `\n\nTest run finished with exit code: ${code}\n`;
  logStream.write(footer);
  logStream.end();
  process.stdout.write(`\nSaved log file: ${logPath}\n`);
  process.exit(code ?? 1);
});

child.on("error", (error) => {
  const message = `Failed to start test process: ${error.message}\n`;
  process.stderr.write(message);
  logStream.write(message);
  logStream.end();
  process.exit(1);
});
