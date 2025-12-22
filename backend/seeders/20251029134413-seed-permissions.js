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

      // Organization Structure
      { resource: "organization_structures", action: "create" },
      { resource: "organization_structures", action: "read" },
      { resource: "organization_structures", action: "update" },
      { resource: "organization_structures", action: "delete" },

      // Project Management
      { resource: "projects", action: "create" },
      { resource: "projects", action: "read" },
      { resource: "projects", action: "update" },
      { resource: "projects", action: "delete" },
      { resource: "projects", action: "assign_users" },

      // Issue Management
      { resource: "issues", action: "create" },
      { resource: "issues", action: "read" },
      { resource: "issues", action: "update" },
      { resource: "issues", action: "delete" },
      { resource: "issues", action: "assign" },
      { resource: "issues", action: "accept" },
      { resource: "issues", action: "resolve" },
      { resource: "issues", action: "escalate" },
      { resource: "issues", action: "view_own" },
      { resource: "issues", action: "view_all" },

      // Issue Priority & Category
      { resource: "issue_priorities", action: "create" },
      { resource: "issue_priorities", action: "read" },
      { resource: "issue_priorities", action: "update" },
      { resource: "issue_priorities", action: "delete" },

      { resource: "issue_categories", action: "create" },
      { resource: "issue_categories", action: "read" },
      { resource: "issue_categories", action: "update" },
      { resource: "issue_categories", action: "delete" },

      // Issue Flow Management
      { resource: "issue_flows", action: "create" },
      { resource: "issue_flows", action: "read" },
      { resource: "issue_flows", action: "update" },
      { resource: "issue_flows", action: "delete" },

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
