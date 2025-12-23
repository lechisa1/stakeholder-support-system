"use strict";
const { v4: uuidv4 } = require("uuid");

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const permissions = [
      // Dashboard Access
      { resource: "dashboard", action: "view" },

      // User Management
      { resource: "users", action: "create" },
      { resource: "users", action: "read" },
      { resource: "users", action: "update" },
      { resource: "users", action: "delete" },
      { resource: "users", action: "assign_role" },

      // Permission Management
      { resource: "permissions", action: "read" },
      { resource: "permissions", action: "update" },

      // Role Management
      { resource: "roles", action: "create" },
      { resource: "roles", action: "read" },
      { resource: "roles", action: "update" },
      { resource: "roles", action: "delete" },
      { resource: "roles", action: "assign_permission" },

      // Organization Management
      { resource: "organizations", action: "create" },
      { resource: "organizations", action: "read" },
      { resource: "organizations", action: "update" },
      { resource: "organizations", action: "delete" },

      // Project Management
      { resource: "projects", action: "create" },
      { resource: "projects", action: "read" },
      { resource: "projects", action: "update" },
      { resource: "projects", action: "delete" },
      { resource: "projects", action: "assign_users" },
      { resource: "projects", action: "remove_users" },

      // Project Structure (External)
      { resource: "project_structures", action: "create" },
      { resource: "project_structures", action: "read" },
      { resource: "project_structures", action: "update" },
      { resource: "project_structures", action: "delete" },
      { resource: "project_structures", action: "assign_users" },
      { resource: "project_structures", action: "remove_users" },

      // Support Request Management
      { resource: "request", action: "create" },
      { resource: "request", action: "read" },
      { resource: "request", action: "update" },
      { resource: "request", action: "delete" },
      { resource: "request", action: "assign" },
      { resource: "request", action: "accept" },
      { resource: "request", action: "resolve" },
      { resource: "request", action: "escalate" },
      { resource: "request", action: "confirm" },
      { resource: "request", action: "reject" },
      { resource: "request", action: "re_raise" },
      { resource: "request", action: "view_own" },
      { resource: "request", action: "view_all" },

      // Support Request Priority & Category
      { resource: "request_priorities", action: "create" },
      { resource: "request_priorities", action: "read" },
      { resource: "request_priorities", action: "update" },
      { resource: "request_priorities", action: "delete" },

      { resource: "request_categories", action: "create" },
      { resource: "request_categories", action: "read" },
      { resource: "request_categories", action: "update" },
      { resource: "request_categories", action: "delete" },

      // Support Reques Flow Management (Internal)
      { resource: "request_flows", action: "create" },
      { resource: "request_flows", action: "read" },
      { resource: "request_flows", action: "update" },
      { resource: "request_flows", action: "delete" },

      // Humnan Resource Management
      { resource: "human_resources", action: "create" },
      { resource: "human_resources", action: "read" },
      { resource: "human_resources", action: "update" },
      { resource: "human_resources", action: "delete" },
    ];

    for (const perm of permissions) {
      try {
        await queryInterface.bulkInsert(
          "permissions",
          [
            {
              permission_id: uuidv4(),
              resource: perm.resource,
              action: perm.action,
              created_at: now,
              updated_at: now,
            },
          ],
          { ignoreDuplicates: true }
        );
      } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
          console.log(
            `Permission ${perm.resource}:${perm.action} already exists, skipping...`
          );
          continue;
        }
        throw error;
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("permissions", null, {});
  },
};
