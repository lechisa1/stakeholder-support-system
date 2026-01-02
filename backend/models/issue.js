"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Issue extends Model {
    static associate(models) {
      // Issue ↔ Project
      Issue.belongsTo(models.Project, {
        foreignKey: "project_id",
        as: "project",
      });
      // Issue ↔ InstituteProject (nullable for EAI users)
      // Issue.belongsTo(models.InstituteProject, {
      //   foreignKey: "institute_project_id",
      //   as: "instituteProject",
      // });

      // Issue ↔ IssueCategory
      Issue.belongsTo(models.IssueCategory, {
        foreignKey: "issue_category_id",
        as: "category",
      });

      // Issue ↔ HierarchyNode
      Issue.belongsTo(models.HierarchyNode, {
        foreignKey: "hierarchy_node_id",
        as: "hierarchyNode",
      });

      // Issue ↔ IssuePriority
      Issue.belongsTo(models.IssuePriority, {
        foreignKey: "priority_id",
        as: "priority",
      });

      // Issue ↔ User (reporter)
      Issue.belongsTo(models.User, {
        foreignKey: "reported_by",
        as: "reporter",
      });

      // Issue ↔ User (assignee)
      Issue.belongsTo(models.User, {
        foreignKey: "assigned_to",
        as: "assignee",
      });

      // Issue ↔ IssueAssignments
      Issue.hasMany(models.IssueAssignment, {
        foreignKey: "issue_id",
        as: "assignments",
      });

      // Issue ↔ IssueTiers
      Issue.hasMany(models.IssueTier, {
        foreignKey: "issue_id",
        as: "tiers",
      });

      // Issue ↔ IssueEscalations
      Issue.hasMany(models.IssueEscalation, {
        foreignKey: "issue_id",
        as: "escalations",
      });

      // Issue ↔ IssueResolution
      Issue.hasMany(models.IssueResolution, {
        foreignKey: "issue_id",
        as: "resolutions",
      });

      // Issue ↔ IssueReRaises
      Issue.hasMany(models.IssueReRaise, {
        foreignKey: "issue_id",
        as: "reRaises",
      });
      // Issue ↔ IssueRejects
      Issue.hasMany(models.IssueReject, {
        foreignKey: "issue_id",
        as: "rejects",
      });

      // Issue ↔ IssueHistory
      Issue.hasMany(models.IssueHistory, {
        foreignKey: "issue_id",
        as: "history",
      });

      // Issue ↔ IssueComments
      Issue.hasMany(models.IssueComment, {
        foreignKey: "issue_id",
        as: "comments",
      });

      // Issue ↔ IssueAttachments
      Issue.hasMany(models.IssueAttachment, {
        foreignKey: "issue_id",
        as: "attachments",
      });

      // Issue ↔ IssueActions
      Issue.hasMany(models.IssueAction, {
        foreignKey: "issue_id",
        as: "actions",
      });

      // Issue ↔ IssueStatusHistory
      Issue.hasMany(models.IssueStatusHistory, {
        foreignKey: "issue_id",
        as: "statusHistory",
      });
    }
  }

  Issue.init(
    {
      issue_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      ticket_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      project_id: {
        type: DataTypes.UUID,
        allowNull: false, // issue must belong to a project now
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      issue_category_id: {
        type: DataTypes.UUID,
      },
      hierarchy_node_id: {
        type: DataTypes.UUID,
      },
      priority_id: {
        type: DataTypes.UUID,
      },
      status: {
        type: DataTypes.STRING(50),
        defaultValue: "pending",
      },
      reported_by: {
        type: DataTypes.UUID,
      },
      assigned_to: {
        type: DataTypes.UUID,
      },
      action_taken: {
        type: DataTypes.STRING(255),
      },
      url_path: {
        type: DataTypes.STRING(255),
      },
      issue_description: {
        type: DataTypes.STRING(255),
      },
      issue_occured_time: {
        type: DataTypes.DATE,
      },
      created_at: {
        type: DataTypes.DATE,
      },
      updated_at: {
        type: DataTypes.DATE,
      },
      resolved_at: {
        type: DataTypes.DATE,
      },
      closed_at: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "Issue",
      tableName: "issues",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Issue;
};
