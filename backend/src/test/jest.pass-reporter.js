class JestPassReporter {
  getFailureReason(testCaseResult) {
    const firstFailure = testCaseResult.failureMessages?.[0];
    if (!firstFailure) return "No reason provided";

    const cleanedMessage = firstFailure
      .replace(/\u001b\[[0-9;]*m/g, "")
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line.length > 0);

    return cleanedMessage || "No reason provided";
  }

  onTestCaseResult(test, testCaseResult) {
    if (testCaseResult.status === "passed") {
      process.stdout.write(`✅ PASS: ${testCaseResult.fullName}\n`);
      return;
    }

    if (testCaseResult.status === "failed") {
      const reason = this.getFailureReason(testCaseResult);
      process.stdout.write(
        `❌ FAIL: ${testCaseResult.fullName} | Reason: ${reason}\n`,
      );
    }
  }
}

module.exports = JestPassReporter;
