"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class IssueEscalation extends Model {
    static associate(models) {
      // IssueEscalation ↔ Issue
      IssueEscalation.belongsTo(models.Issue, {
        foreignKey: "issue_id",
        as: "issue",
      });

      // IssueEscalation ↔ User (escalated by)
      IssueEscalation.belongsTo(models.User, {
        foreignKey: "escalated_by",
        as: "escalator",
      });

      // IssueEscalation ↔ HierarchyNode (from_tier)
      IssueEscalation.belongsTo(models.HierarchyNode, {
        foreignKey: "from_tier",
        targetKey: "hierarchy_node_id",
        as: "fromTierNode",
      });

      // IssueEscalation ↔ HierarchyNode (to_tier)
      IssueEscalation.belongsTo(models.HierarchyNode, {
        foreignKey: "to_tier",
        targetKey: "hierarchy_node_id",
        as: "toTierNode",
      });

      // IssueEscalation ↔ EscalationAttachments
      IssueEscalation.hasMany(models.EscalationAttachment, {
        foreignKey: "escalation_id",
        as: "attachments",
      });
    }
  }

  IssueEscalation.init(
    {
      escalation_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      issue_id: DataTypes.UUID,
      from_tier: DataTypes.UUID,
      to_tier: DataTypes.UUID,
      reason: DataTypes.TEXT,
      escalated_by: DataTypes.UUID,
      escalated_at: DataTypes.DATE,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "IssueEscalation",
      tableName: "issue_escalations",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return IssueEscalation;
};
