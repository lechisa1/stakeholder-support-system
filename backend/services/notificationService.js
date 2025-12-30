const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const {
  Notification,
  User,
  Role,
  Issue,
  Project,
  HierarchyNode,
  ProjectUserRole,
  IssueResolution,
  sequelize,
} = require("../models");

class NotificationService {
  /**
   * Send notification to immediate parent hierarchy (internal use)
   * @param {Object} data - Notification data
   * @param {Sequelize.Transaction} transaction - Sequelize transaction
   * @returns {Promise<Object>} Notification result
   */
  static async sendToImmediateParentHierarchy(data, transaction = null) {
    const {
      sender_id,
      project_id,
      issue_id,
      hierarchy_node_id,
      message,
      title,
    } = data;

    // Validate required fields
    if (!sender_id || !project_id) {
      throw new Error("Sender ID and Project ID are required");
    }

    let t = transaction;
    let shouldCommit = false;

    if (!t) {
      t = await sequelize.transaction();
      shouldCommit = true;
    }

    try {
      // 1. Get sender details
      const sender = await User.findByPk(sender_id, {
        attributes: ["user_id", "full_name", "email"],
        transaction: t,
      });

      if (!sender) {
        throw new Error("Sender not found");
      }

      // 2. Determine hierarchy node
      let senderHierarchyNode = null;

      if (hierarchy_node_id) {
        // Use provided hierarchy_node_id
        senderHierarchyNode = await HierarchyNode.findByPk(hierarchy_node_id, {
          attributes: [
            "hierarchy_node_id",
            "parent_id",
            "project_id",
            "name",
            "level",
          ],
          transaction: t,
        });
      } else {
        // Get from ProjectUserRole
        const senderAssignment = await ProjectUserRole.findOne({
          where: {
            project_id,
            user_id: sender_id,
          },
          include: [
            {
              model: HierarchyNode,
              as: "hierarchyNode",
              attributes: [
                "hierarchy_node_id",
                "parent_id",
                "project_id",
                "name",
                "level",
              ],
            },
          ],
          transaction: t,
        });

        senderHierarchyNode = senderAssignment?.hierarchyNode;
      }

      // If no hierarchy node found
      if (!senderHierarchyNode) {
        if (shouldCommit) await t.commit();
        return {
          success: true,
          message: "No hierarchy node found for sender in this project",
          data: {
            sent_count: 0,
            recipients: [],
          },
        };
      }

      // 3. Check project consistency
      if (senderHierarchyNode.project_id !== project_id) {
        throw new Error(
          "Hierarchy node does not belong to the specified project"
        );
      }

      // 4. Check for parent node
      if (!senderHierarchyNode.parent_id) {
        if (shouldCommit) await t.commit();
        return {
          success: true,
          message:
            "Sender is at top hierarchy level, no immediate parent to notify",
          data: {
            sent_count: 0,
            recipients: [],
          },
        };
      }

      // 5. Get immediate parent node
      const parentHierarchyNode = await HierarchyNode.findByPk(
        senderHierarchyNode.parent_id,
        {
          attributes: ["hierarchy_node_id", "name", "project_id", "level"],
          transaction: t,
        }
      );

      if (!parentHierarchyNode) {
        throw new Error("Parent hierarchy node not found");
      }

      // 6. Find users assigned to immediate parent node AND to the project
      const parentUsersAssignments = await ProjectUserRole.findAll({
        where: {
          project_id,
          hierarchy_node_id: parentHierarchyNode.hierarchy_node_id,
          user_id: {
            [Op.ne]: sender_id, // Exclude sender
          },
        },
        include: [
          {
            model: User,
            as: "user",
            where: {
              is_active: true,
            },
            attributes: ["user_id", "full_name", "email"],
          },
          {
            model: Role,
            as: "role",
            attributes: ["role_id", "name"],
          },
        ],
        transaction: t,
      });

      // Get unique users
      const uniqueParentUsers = [];
      const seenUserIds = new Set();

      for (const assignment of parentUsersAssignments) {
        if (assignment.user && !seenUserIds.has(assignment.user.user_id)) {
          uniqueParentUsers.push({
            user: assignment.user,
            role: assignment.role,
          });
          seenUserIds.add(assignment.user.user_id);
        }
      }

      if (uniqueParentUsers.length === 0) {
        if (shouldCommit) await t.commit();
        return {
          success: false,
          message:
            "No active users found in immediate parent hierarchy assigned to this project",
        };
      }

      // 7. Get project and issue details
      const project = await Project.findByPk(project_id, { transaction: t });

      let issueDetails = null;
      if (issue_id) {
        issueDetails = await Issue.findByPk(issue_id, {
          attributes: ["issue_id", "ticket_number", "title"],
          transaction: t,
        });
      }

      // 8. Create notifications
      const notifications = uniqueParentUsers.map(({ user, role }) => ({
        notification_id: uuidv4(),
        type: "ISSUE_CREATED",
        sender_id,
        receiver_id: user.user_id,
        issue_id: issue_id || null,
        project_id,
        title: title || `New Activity from ${sender.full_name}`,
        message:
          message ||
          `${sender.full_name} from hierarchy node "${senderHierarchyNode.name}" has reported a new activity in your child hierarchy in project "${project?.name}"`,
        priority: "MEDIUM",
        data: {
          project_name: project?.name,
          sender_name: sender.full_name,
          sender_email: sender.email,
          sender_hierarchy_node: senderHierarchyNode.name,
          sender_hierarchy_node_id: senderHierarchyNode.hierarchy_node_id,
          receiver_hierarchy_node: parentHierarchyNode.name,
          receiver_hierarchy_node_id: parentHierarchyNode.hierarchy_node_id,
          receiver_role: role?.name,
          issue_ticket: issueDetails?.ticket_number,
          issue_title: issueDetails?.title,
          hierarchy_relationship: "immediate_parent",
        },
        created_at: new Date(),
      }));

      // 9. Bulk create notifications
      await Notification.bulkCreate(notifications, { transaction: t });

      if (shouldCommit) await t.commit();

      return {
        success: true,
        message: `Notification sent to ${notifications.length} immediate parent users`,
        data: {
          sent_count: notifications.length,
          sender: {
            user_id: sender.user_id,
            name: sender.full_name,
            hierarchy_node: {
              id: senderHierarchyNode.hierarchy_node_id,
              name: senderHierarchyNode.name,
              level: senderHierarchyNode.level,
            },
          },
          parent_node: {
            id: parentHierarchyNode.hierarchy_node_id,
            name: parentHierarchyNode.name,
            level: parentHierarchyNode.level,
          },
          recipients: uniqueParentUsers.map(({ user, role }) => ({
            user_id: user.user_id,
            name: user.full_name,
            email: user.email,
            role: role?.name,
            role_id: role?.role_id,
          })),
        },
      };
    } catch (error) {
      if (shouldCommit && !t.finished) await t.rollback();
      throw error;
    }
  }

  /**
   * Notify issue creator when issue is solved
   * @param {Object} data - Notification data
   * @param {Sequelize.Transaction} transaction - Sequelize transaction
   * @returns {Promise<Object>} Notification result
   */
  static async notifyIssueCreatorWhenSolved(data, transaction = null) {
    const { issue_id, resolver_id, solution_details } = data;

    // Validate required fields
    if (!issue_id || !resolver_id) {
      throw new Error("Issue ID and Resolver ID are required");
    }

    let t = transaction;
    let shouldCommit = false;

    if (!t) {
      t = await sequelize.transaction();
      shouldCommit = true;
    }

    try {
      // 1. Get issue details
      const issue = await Issue.findByPk(issue_id, {
        include: [
          { model: Project, as: "project" },
          {
            model: User,
            as: "reporter",
            attributes: ["user_id", "full_name", "email"],
          },
        ],
        transaction: t,
      });

      if (!issue) {
        throw new Error("Issue not found");
      }

      // 2. Get resolver details
      const resolver = await User.findByPk(resolver_id, {
        attributes: ["user_id", "full_name", "email"],
        transaction: t,
      });

      if (!resolver) {
        throw new Error("Resolver not found");
      }

      // 3. Create notification for issue creator
      const notification = await Notification.create(
        {
          notification_id: uuidv4(),
          type: "ISSUE_RESOLVED",
          sender_id: resolver_id,
          receiver_id: issue.reported_by,
          issue_id,
          project_id: issue.project_id,
          title: `Issue Resolved: ${issue.title}`,
          message: `Your issue "${issue.title}" (${
            issue.ticket_number
          }) has been resolved by ${resolver.full_name}. ${
            solution_details ? `Details: ${solution_details}` : ""
          }`,
          priority: "MEDIUM",
          data: {
            issue_ticket: issue.ticket_number,
            issue_title: issue.title,
            resolved_by: resolver.full_name,
            resolved_by_email: resolver.email,
            project_name: issue.project?.name,
            solution_details: solution_details || "",
          },
          created_at: new Date(),
        },
        { transaction: t }
      );

      if (shouldCommit) await t.commit();

      return {
        success: true,
        message: "Notification sent to issue creator",
        data: notification,
      };
    } catch (error) {
      if (shouldCommit && !t.finished) await t.rollback();
      throw error;
    }
  }

  /**
   * Notify solver(s) when creator confirms/rejects resolution
   * @param {Object} data - Notification data
   * @param {Sequelize.Transaction} transaction - Sequelize transaction
   * @returns {Promise<Object>} Notification result
   */
  static async notifySolverOnConfirmation(data, transaction = null) {
    const { issue_id, creator_id, is_confirmed, rejection_reason } = data;

    // Validate required fields
    if (!issue_id || !creator_id || is_confirmed === undefined) {
      throw new Error(
        "Issue ID, Creator ID, and confirmation status are required"
      );
    }

    let t = transaction;
    let shouldCommit = false;

    if (!t) {
      t = await sequelize.transaction();
      shouldCommit = true;
    }

    try {
      // 1. Get issue details
      const issue = await Issue.findByPk(issue_id, {
        include: [
          { model: Project, as: "project" },
          {
            model: User,
            as: "reporter",
            attributes: ["user_id", "full_name", "email"],
          },
        ],
        transaction: t,
      });

      if (!issue) {
        throw new Error("Issue not found");
      }

      // 2. Get all resolvers from IssueResolution table
      const resolutions = await IssueResolution.findAll({
        where: { issue_id },
        include: [
          {
            model: User,
            as: "resolver",
            attributes: ["user_id", "full_name", "email"],
          },
        ],
        transaction: t,
        order: [["resolved_at", "DESC"]],
      });

      if (!resolutions || resolutions.length === 0) {
        throw new Error("No resolutions found for this issue");
      }

      // 3. Get unique resolvers (in case same user resolved multiple times)
      const uniqueResolvers = [];
      const seenResolverIds = new Set();

      for (const resolution of resolutions) {
        if (
          resolution.resolver &&
          !seenResolverIds.has(resolution.resolver.user_id)
        ) {
          uniqueResolvers.push(resolution.resolver);
          seenResolverIds.add(resolution.resolver.user_id);
        }
      }

      if (uniqueResolvers.length === 0) {
        throw new Error("No valid resolvers found for this issue");
      }

      // 4. Get creator details
      const creator = await User.findByPk(creator_id, {
        attributes: ["user_id", "full_name", "email"],
        transaction: t,
      });

      if (!creator) {
        throw new Error("Creator not found");
      }

      // 5. Create notification based on confirmation status
      const notificationType = is_confirmed
        ? "ISSUE_CONFIRMED"
        : "ISSUE_REJECTED";
      const notificationTitle = is_confirmed
        ? `Issue Confirmed: ${issue.title}`
        : `Issue Rejected: ${issue.title}`;

      const notificationMessage = is_confirmed
        ? `${creator.full_name} has confirmed that the issue "${issue.title}" (${issue.ticket_number}) has been successfully resolved.`
        : `${creator.full_name} has rejected the resolution for issue "${
            issue.title
          }" (${issue.ticket_number}). ${
            rejection_reason ? `Reason: ${rejection_reason}` : ""
          }`;

      // 6. Create notifications for all unique resolvers
      const notifications = uniqueResolvers.map((resolver) => ({
        notification_id: uuidv4(),
        type: notificationType,
        sender_id: creator_id,
        receiver_id: resolver.user_id,
        issue_id,
        project_id: issue.project_id,
        title: notificationTitle,
        message: notificationMessage,
        priority: "HIGH", // High priority as it requires action
        data: {
          issue_ticket: issue.ticket_number,
          issue_title: issue.title,
          action_by: creator.full_name,
          action_by_email: creator.email,
          project_name: issue.project?.name,
          is_confirmed,
          rejection_reason: rejection_reason || null,
          resolver_name: resolver.full_name,
          resolver_email: resolver.email,
        },
        created_at: new Date(),
      }));

      // 7. Bulk create notifications
      await Notification.bulkCreate(notifications, { transaction: t });

      if (shouldCommit) await t.commit();

      return {
        success: true,
        message: `Notification sent to ${notifications.length} resolver(s) (${
          is_confirmed ? "confirmed" : "rejected"
        })`,
        data: {
          sent_count: notifications.length,
          issue: {
            id: issue.issue_id,
            ticket_number: issue.ticket_number,
            title: issue.title,
          },
          creator: {
            user_id: creator.user_id,
            name: creator.full_name,
            email: creator.email,
          },
          resolvers: uniqueResolvers.map((resolver) => ({
            user_id: resolver.user_id,
            name: resolver.full_name,
            email: resolver.email,
          })),
          notifications: notifications,
        },
      };
    } catch (error) {
      if (shouldCommit && !t.finished) await t.rollback();
      throw error;
    }
  }

  /**
   * Helper function to get hierarchy chain
   */
  static async getHierarchyChain(startNodeId, transaction) {
    const chain = [];
    let currentNodeId = startNodeId;

    while (currentNodeId) {
      const node = await HierarchyNode.findByPk(currentNodeId, {
        attributes: [
          "hierarchy_node_id",
          "name",
          "parent_id",
          "project_id",
          "level",
        ],
        transaction,
      });

      if (!node) break;

      chain.unshift({
        hierarchy_node_id: node.hierarchy_node_id,
        name: node.name,
        level: node.level,
        project_id: node.project_id,
      });

      currentNodeId = node.parent_id;
    }

    return chain;
  }

  /**
   * Helper function to determine hierarchy relationship
   */
  static getHierarchyRelationship(senderNode, receiverNode) {
    // Check if receiver node is direct parent
    if (senderNode.parent_id === receiverNode.hierarchy_node_id) {
      return "immediate_parent";
    }

    // Check if receiver node is higher up in the chain
    if (receiverNode.level < senderNode.level) {
      return `ancestor_level_${senderNode.level - receiverNode.level}`;
    }

    return "parent";
  }
}

module.exports = NotificationService;
