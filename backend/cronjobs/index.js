// cronjobs/index.js
const cron = require("node-cron");
const deactivateExpiredProjects = require("./deactivateProjects");

async function runDeactivationTask() {
  try {
    console.log("Running project deactivation task immediately...");
    await deactivateExpiredProjects();
    console.log("Immediate project deactivation completed.");
  } catch (err) {
    console.error("Error during immediate deactivation:", err);
  }
}

// Run immediately on server start
runDeactivationTask();

// Schedule daily cron at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("Running daily project deactivation task...");
  try {
    await deactivateExpiredProjects();
    console.log("Daily project deactivation task completed.");
  } catch (err) {
    console.error("Error running daily project deactivation task:", err);
  }
});
