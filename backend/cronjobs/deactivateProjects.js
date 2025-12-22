// cronjobs/deactivateProjects.js
const { Project, ProjectMaintenance } = require("../models");
const { Op } = require("sequelize");

async function deactivateExpiredProjects() {
  const today = new Date();

  const expiredMaintenances = await ProjectMaintenance.findAll({
    where: {
      end_date: { [Op.lt]: today },
    },
    include: [{ model: Project, as: "project" }],
  });

  for (const maintenance of expiredMaintenances) {
    const project = maintenance.project;
    if (project.is_active) {
      project.is_active = false;
      await project.save();
      console.log(`Project ${project.name} has been deactivated.`);
    }
  }
}

module.exports = deactivateExpiredProjects;
