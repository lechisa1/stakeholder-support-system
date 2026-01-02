const {
  Notification,
  User,
  Issue,
  Project,
  HierarchyNode,
  ProjectUserRole,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const NotificationService = require("../services/notificationService");

// ================================
// GET NOTIFICATION BY ID
// ================================
const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Notification ID is required",
      });
    }

    const notification = await Notification.findOne({
      where: { notification_id: id },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["user_id", "full_name", "email"],
        },
        {
          model: User,
          as: "receiver",
          attributes: ["user_id", "full_name", "email"],
        },
        {
          model: Issue,
          as: "issue",
          include: [
            { model: Project, as: "project" },
            {
              model: User,
              as: "reporter",
              attributes: ["user_id", "full_name", "email"],
            },
          ],
        },
        { model: Project, as: "project" },
      ],
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification fetched successfully",
      data: notification,
    });
  } catch (error) {
    console.error("Error fetching notification by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notification",
      error: error.message,
    });
  }
};

// ================================
// GET NOTIFICATIONS BY USER ID (with pagination and filters)
// ================================
const getNotificationsByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Get query parameters
    const {
      is_read, // optional: filter by read status
      type, // optional: filter by notification type
      page = 1,
      pageSize = 20,
      search, // optional: search in title/message
    } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limit = parseInt(pageSize);
    const offset = (pageNum - 1) * limit;

    // Build where clause
    const whereClause = { receiver_id: user_id };

    if (is_read !== undefined) {
      whereClause.is_read = is_read === "true";
    }

    if (type) {
      whereClause.type = type;
    }

    // Build search condition
    let searchCondition = {};
    if (search) {
      searchCondition = {
        [Op.or]: [
          { title: { [Op.iLike]: `%${search}%` } },
          { message: { [Op.iLike]: `%${search}%` } },
        ],
      };
    }

    // Combine conditions
    const finalWhere = { ...whereClause, ...searchCondition };

    // Fetch notifications with pagination
    const { rows: notifications, count: totalCount } =
      await Notification.findAndCountAll({
        where: finalWhere,
        include: [
          {
            model: User,
            as: "sender",
            attributes: ["user_id", "full_name", "email"],
          },
          {
            model: Issue,
            as: "issue",
            attributes: ["issue_id", "ticket_number", "title"],
            include: [
              {
                model: Project,
                as: "project",
                attributes: ["project_id", "name"],
              },
            ],
          },
          {
            model: Project,
            as: "project",
            attributes: ["project_id", "name"],
          },
        ],
        order: [["created_at", "DESC"]],
        limit,
        offset,
        distinct: true,
      });

    // Calculate unread count separately
    const unreadCount = await Notification.count({
      where: {
        receiver_id: user_id,
        is_read: false,
      },
    });

    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      data: notifications,
      meta: {
        page: pageNum,
        pageSize: limit,
        total: totalCount,
        totalPages,
        unreadCount,
      },
    });
  } catch (error) {
    console.error("Error fetching notifications by user ID:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

// ================================
// MARK NOTIFICATION AS READ
// ================================
const markNotificationAsRead = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { notification_id } = req.body;
    const user_id = req.user?.user_id;

    if (!notification_id) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Notification ID is required",
      });
    }

    // Find notification
    const notification = await Notification.findOne({
      where: {
        notification_id,
        receiver_id: user_id,
      },
      transaction: t,
    });

    if (!notification) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Notification not found or unauthorized",
      });
    }

    // Update if not already read
    if (!notification.is_read) {
      notification.is_read = true;
      notification.read_at = new Date();
      await notification.save({ transaction: t });
    }

    await t.commit();

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    if (!t.finished) await t.rollback();
    console.error("Error marking notification as read:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
      error: error.message,
    });
  }
};

// ================================
// MARK ALL NOTIFICATIONS AS READ
// ================================
const markAllNotificationsAsRead = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const user_id = req.user?.user_id;

    // Update all unread notifications for the user
    const [updatedCount] = await Notification.update(
      {
        is_read: true,
        read_at: new Date(),
      },
      {
        where: {
          receiver_id: user_id,
          is_read: false,
        },
        transaction: t,
      }
    );

    await t.commit();

    return res.status(200).json({
      success: true,
      message: `Marked ${updatedCount} notifications as read`,
      data: { updatedCount },
    });
  } catch (error) {
    if (!t.finished) await t.rollback();
    console.error("Error marking all notifications as read:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark notifications as read",
      error: error.message,
    });
  }
};

// ================================
// SEND NOTIFICATION TO PARENT HIERARCHY USERS
// ================================
const sendNotificationToParentHierarchyUsers = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      sender_id,
      project_id,
      issue_id,
      hierarchy_node_id,
      message,
      title,
    } = req.body;

    // Validate required fields
    if (!sender_id || !project_id) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Sender ID and Project ID are required",
      });
    }

    // 1. Get sender details
    const sender = await User.findByPk(sender_id, {
      attributes: ["user_id", "full_name", "email"],
      transaction: t,
    });

    if (!sender) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Sender not found",
      });
    }

    let senderHierarchyNode = null;
    let senderHierarchyNodeId = null;

    // Determine hierarchy node: either from parameter or from ProjectUserRole
    if (hierarchy_node_id) {
      // Use provided hierarchy_node_id
      senderHierarchyNode = await HierarchyNode.findByPk(hierarchy_node_id, {
        attributes: ["hierarchy_node_id", "parent_id", "project_id"],
        transaction: t,
      });

      if (senderHierarchyNode) {
        senderHierarchyNodeId = senderHierarchyNode.hierarchy_node_id;
      }
    } else {
      // Try to get hierarchy node from ProjectUserRole for this sender and project
      const senderAssignment = await ProjectUserRole.findOne({
        where: {
          project_id,
          user_id: sender_id,
        },
        include: [
          {
            model: HierarchyNode,
            as: "hierarchyNode",
            attributes: ["hierarchy_node_id", "parent_id", "project_id"],
          },
        ],
        transaction: t,
      });

      if (senderAssignment?.hierarchyNode) {
        senderHierarchyNode = senderAssignment.hierarchyNode;
        senderHierarchyNodeId = senderHierarchyNode.hierarchy_node_id;
      }
    }

    // If no hierarchy node found, return early
    if (!senderHierarchyNodeId || !senderHierarchyNode) {
      await t.rollback();
      return res.status(200).json({
        success: true,
        message:
          "Sender has no hierarchy node assigned to this project, no parent users to notify",
        data: {
          sent_count: 0,
          recipients: [],
        },
      });
    }

    // 3. Check if sender's hierarchy node is in the same project
    if (senderHierarchyNode.project_id !== project_id) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Hierarchy node does not belong to the specified project",
      });
    }

    // 4. If sender's node has no parent (already top-level), nothing to do
    if (!senderHierarchyNode.parent_id) {
      await t.rollback();
      return res.status(200).json({
        success: true,
        message: "Sender is at top hierarchy level, no parent users to notify",
        data: {
          sent_count: 0,
          recipients: [],
        },
      });
    }

    // 5. Get all parent hierarchy nodes (traverse up the tree)
    const parentNodeIds = [];
    let currentNode = senderHierarchyNode;

    while (currentNode.parent_id) {
      const parentNode = await HierarchyNode.findByPk(currentNode.parent_id, {
        attributes: ["hierarchy_node_id", "parent_id", "project_id"],
        transaction: t,
      });

      if (!parentNode) break;

      // Only include parent nodes that belong to the same project
      if (parentNode.project_id === project_id) {
        parentNodeIds.push(parentNode.hierarchy_node_id);
      } else {
        break; // Stop if parent is in different project
      }

      currentNode = parentNode;
    }

    if (parentNodeIds.length === 0) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "No valid parent hierarchy nodes found in the same project",
      });
    }

    // 6. Find users assigned to these parent hierarchy nodes AND assigned to the project
    const parentUsersAssignments = await ProjectUserRole.findAll({
      where: {
        project_id,
        hierarchy_node_id: {
          [Op.in]: parentNodeIds,
        },
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
          model: HierarchyNode,
          as: "hierarchyNode",
          attributes: ["hierarchy_node_id", "name", "level", "parent_id"],
        },
        {
          model: Role,
          as: "role",
          attributes: ["role_id", "name"],
        },
      ],
      transaction: t,
    });

    // Extract unique users (in case same user has multiple roles)
    const uniqueParentUsers = [];
    const seenUserIds = new Set();

    for (const assignment of parentUsersAssignments) {
      if (assignment.user && !seenUserIds.has(assignment.user.user_id)) {
        uniqueParentUsers.push({
          user: assignment.user,
          hierarchyNode: assignment.hierarchyNode,
          role: assignment.role,
        });
        seenUserIds.add(assignment.user.user_id);
      }
    }

    if (uniqueParentUsers.length === 0) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message:
          "No active users found in parent hierarchy assigned to this project",
      });
    }

    // 7. Get project details for notification
    const project = await Project.findByPk(project_id, { transaction: t });

    // 8. Get issue details if provided
    let issueDetails = null;
    if (issue_id) {
      issueDetails = await Issue.findByPk(issue_id, {
        attributes: ["issue_id", "ticket_number", "title"],
        transaction: t,
      });
    }

    // 9. Create notifications for each parent hierarchy user
    const notifications = uniqueParentUsers.map(
      ({ user, hierarchyNode, role }) => ({
        notification_id: uuidv4(),
        type: "ISSUE_CREATED", // or appropriate type based on context
        sender_id,
        receiver_id: user.user_id,
        issue_id: issue_id || null,
        project_id,
        title: title || `New Activity in ${project?.name || "Project"}`,
        message:
          message ||
          `A new activity has been reported by ${sender.full_name} from child hierarchy node in project "${project?.name}"`,
        priority: "MEDIUM",
        data: {
          project_name: project?.name,
          sender_name: sender.full_name,
          sender_email: sender.email,
          sender_hierarchy_node_id: senderHierarchyNodeId,
          receiver_hierarchy_node_id: hierarchyNode.hierarchy_node_id,
          receiver_hierarchy_node_name: hierarchyNode.name,
          receiver_role: role?.name,
          issue_ticket: issueDetails?.ticket_number,
          issue_title: issueDetails?.title,
          hierarchy_level: "parent",
          hierarchy_relationship: getHierarchyRelationship(
            senderHierarchyNode,
            hierarchyNode
          ),
        },
        created_at: new Date(),
      })
    );

    // 10. Bulk create notifications
    await Notification.bulkCreate(notifications, { transaction: t });

    // 11. Get hierarchy chain for response
    const hierarchyChain = await getHierarchyChain(senderHierarchyNodeId, t);

    await t.commit();

    return res.status(201).json({
      success: true,
      message: `Notification sent to ${notifications.length} parent hierarchy users`,
      data: {
        sent_count: notifications.length,
        sender_info: {
          user_id: sender.user_id,
          name: sender.full_name,
          hierarchy_node_id: senderHierarchyNodeId,
        },
        hierarchy_chain: hierarchyChain,
        recipients: uniqueParentUsers.map(({ user, hierarchyNode, role }) => ({
          user_id: user.user_id,
          name: user.full_name,
          email: user.email,
          hierarchy_node_id: hierarchyNode.hierarchy_node_id,
          hierarchy_node_name: hierarchyNode.name,
          role: role?.name,
          role_id: role?.role_id,
        })),
      },
    });
  } catch (error) {
    if (!t.finished) await t.rollback();
    console.error("Error sending notification to parent hierarchy:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send notifications",
      error: error.message,
    });
  }
};

// ================================
// SIMPLIFIED VERSION (Immediate Parent Only)
// ================================

// Then update the sendNotificationToImmediateParentHierarchy function to use the service:
const sendNotificationToImmediateParentHierarchy = async (req, res) => {
  try {
    const {
      sender_id,
      project_id,
      issue_id,
      hierarchy_node_id,
      message,
      title,
    } = req.body;

    // Validate required fields
    if (!sender_id || !project_id) {
      return res.status(400).json({
        success: false,
        message: "Sender ID and Project ID are required",
      });
    }

    // Use the service
    const result = await NotificationService.sendToImmediateParentHierarchy({
      sender_id,
      project_id,
      issue_id,
      hierarchy_node_id,
      message,
      title,
    });

    return res.status(201).json(result);
  } catch (error) {
    console.error("Error sending notification to immediate parent:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send notifications",
      error: error.message,
    });
  }
};

// ================================
// NOTIFY ISSUE CREATOR WHEN SOLVED
// ================================
const notifyIssueCreatorWhenSolved = async (req, res) => {
  try {
    const { issue_id, resolver_id, solution_details } = req.body;

    const result = await NotificationService.notifyIssueCreatorWhenSolved({
      issue_id,
      resolver_id,
      solution_details,
    });

    return res.status(201).json(result);
  } catch (error) {
    console.error("Error notifying issue creator:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send notification",
      error: error.message,
    });
  }
};

// ================================
// NOTIFY SOLVER WHEN CREATOR CONFIRMS/REJECTS
// ================================
const notifySolverOnConfirmation = async (req, res) => {
  try {
    const { issue_id, creator_id, is_confirmed, rejection_reason } = req.body;

    const result = await NotificationService.notifySolverOnConfirmation({
      issue_id,
      creator_id,
      is_confirmed,
      rejection_reason,
    });

    return res.status(201).json(result);
  } catch (error) {
    console.error("Error notifying solver:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send notification",
      error: error.message,
    });
  }
};

// ================================
// SEND GENERAL NOTIFICATION
// ================================
const sendGeneralNotification = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      sender_id,
      receiver_ids,
      type,
      title,
      message,
      priority,
      channel,
      data,
      expires_at,
    } = req.body;

    // Validate required fields
    if (
      !receiver_ids ||
      !Array.isArray(receiver_ids) ||
      receiver_ids.length === 0
    ) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Receiver IDs array is required and must not be empty",
      });
    }

    if (!title || !message) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Title and message are required",
      });
    }

    // Validate receiver IDs exist
    const users = await User.findAll({
      where: {
        user_id: { [Op.in]: receiver_ids },
        is_active: true,
      },
      attributes: ["user_id"],
      transaction: t,
    });

    if (users.length !== receiver_ids.length) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "One or more receiver IDs are invalid or inactive",
      });
    }

    // Create notifications for each receiver
    const notifications = receiver_ids.map((receiver_id) => ({
      notification_id: uuidv4(),
      type: type || "SYSTEM_ALERT",
      sender_id: sender_id || null,
      receiver_id,
      title,
      message,
      priority: priority || "MEDIUM",
      channel: channel || "IN_APP",
      data: data || {},
      expires_at: expires_at || null,
      created_at: new Date(),
    }));

    // Bulk create notifications
    await Notification.bulkCreate(notifications, { transaction: t });

    await t.commit();

    return res.status(201).json({
      success: true,
      message: `Notification sent to ${notifications.length} users`,
      data: {
        sent_count: notifications.length,
      },
    });
  } catch (error) {
    if (!t.finished) await t.rollback();
    console.error("Error sending general notification:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send notification",
      error: error.message,
    });
  }
};

// ================================
// DELETE NOTIFICATION
// ================================
const deleteNotification = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const user_id = req.user?.user_id;

    if (!id) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Notification ID is required",
      });
    }

    // Find and delete notification (only if user is the receiver)
    const notification = await Notification.findOne({
      where: {
        notification_id: id,
        receiver_id: user_id,
      },
      transaction: t,
    });

    if (!notification) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Notification not found or unauthorized",
      });
    }

    await notification.destroy({ transaction: t });
    await t.commit();

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    if (!t.finished) await t.rollback();
    console.error("Error deleting notification:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete notification",
      error: error.message,
    });
  }
};

// ================================
// GET NOTIFICATION STATISTICS
// ================================
const getNotificationStats = async (req, res) => {
  try {
    const user_id = req.user?.user_id;

    // Get counts by type
    const countsByType = await Notification.findAll({
      where: { receiver_id: user_id },
      attributes: [
        "type",
        [sequelize.fn("COUNT", sequelize.col("notification_id")), "count"],
      ],
      group: ["type"],
      raw: true,
    });

    // Get read vs unread counts
    const readCount = await Notification.count({
      where: {
        receiver_id: user_id,
        is_read: true,
      },
    });

    const unreadCount = await Notification.count({
      where: {
        receiver_id: user_id,
        is_read: false,
      },
    });

    // Get priority distribution
    const priorityCounts = await Notification.findAll({
      where: { receiver_id: user_id },
      attributes: [
        "priority",
        [sequelize.fn("COUNT", sequelize.col("notification_id")), "count"],
      ],
      group: ["priority"],
      raw: true,
    });

    return res.status(200).json({
      success: true,
      message: "Notification statistics fetched successfully",
      data: {
        total: readCount + unreadCount,
        read: readCount,
        unread: unreadCount,
        by_type: countsByType,
        by_priority: priorityCounts,
      },
    });
  } catch (error) {
    console.error("Error fetching notification stats:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notification statistics",
      error: error.message,
    });
  }
};

module.exports = {
  getNotificationById,
  getNotificationsByUserId,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  sendNotificationToParentHierarchyUsers, // All parent levels
  sendNotificationToImmediateParentHierarchy, // Immediate parent only
  notifyIssueCreatorWhenSolved,
  notifySolverOnConfirmation,
  sendGeneralNotification,
  deleteNotification,
  getNotificationStats,
};

// Helper function to get hierarchy chain
const getHierarchyChain = async (startNodeId, transaction) => {
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
};

// Helper function to determine hierarchy relationship
const getHierarchyRelationship = (senderNode, receiverNode) => {
  // Check if receiver node is direct parent
  if (senderNode.parent_id === receiverNode.hierarchy_node_id) {
    return "immediate_parent";
  }

  // Check if receiver node is higher up in the chain
  if (receiverNode.level < senderNode.level) {
    return `ancestor_level_${senderNode.level - receiverNode.level}`;
  }

  return "parent";
};
