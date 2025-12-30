const express = require("express");
const router = express.Router();
const controller = require("../controllers/notificationController");
const {
  validateMarkAsRead,
  validateSendToParentHierarchy,
  validateSendToImmediateParent,
  validateNotifyIssueCreator,
  validateNotifySolver,
  validateSendGeneralNotification,
  validateNotificationsQuery,
} = require("../validators/notificationValidator");
const { authenticateToken } = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification management and delivery
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         notification_id:
 *           type: string
 *           format: uuid
 *         type:
 *           type: string
 *           enum:
 *             - ISSUE_CREATED
 *             - ISSUE_ASSIGNED
 *             - ISSUE_RESOLVED
 *             - ISSUE_CONFIRMED
 *             - ISSUE_REJECTED
 *             - ISSUE_REOPENED
 *             - ISSUE_ESCALATED
 *             - ISSUE_COMMENTED
 *             - PASSWORD_UPDATED
 *             - LOGIN_ALERT
 *             - USER_DEACTIVATED
 *             - USER_REACTIVATED
 *             - PROFILE_UPDATED
 *             - SYSTEM_ALERT
 *             - BROADCAST_MESSAGE
 *         sender_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         receiver_id:
 *           type: string
 *           format: uuid
 *         issue_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         project_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         title:
 *           type: string
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           additionalProperties: true
 *         priority:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *         is_read:
 *           type: boolean
 *         read_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         is_sent:
 *           type: boolean
 *         sent_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         channel:
 *           type: string
 *           enum: [IN_APP, EMAIL, SMS, PUSH, ALL]
 *         expires_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         created_at:
 *           type: string
 *           format: date-time
 *
 *     SendParentHierarchyRequest:
 *       type: object
 *       required:
 *         - sender_id
 *         - project_id
 *       properties:
 *         sender_id:
 *           type: string
 *           format: uuid
 *         project_id:
 *           type: string
 *           format: uuid
 *         issue_id:
 *           type: string
 *           format: uuid
 *         hierarchy_node_id:
 *           type: string
 *           format: uuid
 *         message:
 *           type: string
 *         title:
 *           type: string
 *
 *     MarkAsReadRequest:
 *       type: object
 *       required:
 *         - notification_id
 *       properties:
 *         notification_id:
 *           type: string
 *           format: uuid
 *
 *     NotifyIssueCreatorRequest:
 *       type: object
 *       required:
 *         - issue_id
 *         - resolver_id
 *       properties:
 *         issue_id:
 *           type: string
 *           format: uuid
 *         resolver_id:
 *           type: string
 *           format: uuid
 *         solution_details:
 *           type: string
 *
 *     NotifySolverRequest:
 *       type: object
 *       required:
 *         - issue_id
 *         - creator_id
 *         - is_confirmed
 *       properties:
 *         issue_id:
 *           type: string
 *           format: uuid
 *         creator_id:
 *           type: string
 *           format: uuid
 *         is_confirmed:
 *           type: boolean
 *         rejection_reason:
 *           type: string
 *
 *     SendGeneralNotificationRequest:
 *       type: object
 *       required:
 *         - receiver_ids
 *         - title
 *         - message
 *       properties:
 *         sender_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         receiver_ids:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *         type:
 *           type: string
 *         title:
 *           type: string
 *         message:
 *           type: string
 *         priority:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *         channel:
 *           type: string
 *           enum: [IN_APP, EMAIL, SMS, PUSH, ALL]
 *         data:
 *           type: object
 *         expires_at:
 *           type: string
 *           format: date-time
 *
 *     NotificationStats:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *         read:
 *           type: integer
 *         unread:
 *           type: integer
 *         by_type:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               count:
 *                 type: integer
 *         by_priority:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               priority:
 *                 type: string
 *               count:
 *                 type: integer
 */
/**
 * @swagger
 * /api/notifications/stats:
 *   get:
 *     summary: Get notification statistics for current user
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: Notification statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationStats'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/stats", authenticateToken, controller.getNotificationStats);

/**
 * @swagger
 * /api/notifications/user/{user_id}:
 *   get:
 *     summary: Get notifications by user ID with pagination and filters
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *       - in: query
 *         name: is_read
 *         schema:
 *           type: string
 *           enum: [true, false]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of notifications with pagination info
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.get(
  "/user/:user_id",
  validateNotificationsQuery,
  controller.getNotificationsByUserId
);

/**
 * @swagger
 * /api/notifications/mark-all-read:
 *   post:
 *     summary: Mark all notifications as read for current user
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  "/mark-all-read",
  authenticateToken,
  controller.markAllNotificationsAsRead
);

// ================================
// POST ROUTES
// ================================

/**
 * @swagger
 * /api/notifications/mark-read:
 *   post:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MarkAsReadRequest'
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       400:
 *         description: Validation error
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/mark-read",
  authenticateToken,
  validateMarkAsRead,
  controller.markNotificationAsRead
);

/**
 * @swagger
 * /api/notifications/send/parent-hierarchy:
 *   post:
 *     summary: Send notification to parent hierarchy users
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendParentHierarchyRequest'
 *     responses:
 *       201:
 *         description: Notification sent to parent hierarchy users
 *       400:
 *         description: Validation error
 *       404:
 *         description: Sender, project, or parent users not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/send/parent-hierarchy",
  validateSendToParentHierarchy,
  controller.sendNotificationToParentHierarchyUsers
);

/**
 * @swagger
 * /api/notifications/send/immediate-parent:
 *   post:
 *     summary: Send notification to immediate parent hierarchy users
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendParentHierarchyRequest'
 *     responses:
 *       201:
 *         description: Notification sent to immediate parent users
 *       400:
 *         description: Validation error
 *       404:
 *         description: Sender, project, or parent users not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/send/immediate-parent",
  validateSendToImmediateParent,
  controller.sendNotificationToImmediateParentHierarchy
);

/**
 * @swagger
 * /api/notifications/send/issue-solved:
 *   post:
 *     summary: Notify issue creator when issue is solved
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotifyIssueCreatorRequest'
 *     responses:
 *       201:
 *         description: Notification sent to issue creator
 *       400:
 *         description: Validation error
 *       404:
 *         description: Issue or resolver not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/send/issue-solved",
  validateNotifyIssueCreator,
  controller.notifyIssueCreatorWhenSolved
);

/**
 * @swagger
 * /api/notifications/send/solver-confirmation:
 *   post:
 *     summary: Notify solver when creator confirms/rejects resolution
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotifySolverRequest'
 *     responses:
 *       201:
 *         description: Notification sent to solver
 *       400:
 *         description: Validation error
 *       404:
 *         description: Issue, creator, or assignee not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/send/solver-confirmation",
  validateNotifySolver,
  controller.notifySolverOnConfirmation
);

/**
 * @swagger
 * /api/notifications/send/general:
 *   post:
 *     summary: Send general notification to multiple users
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendGeneralNotificationRequest'
 *     responses:
 *       201:
 *         description: General notification sent successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: One or more receiver IDs are invalid
 *       500:
 *         description: Internal server error
 */
router.post(
  "/send/general",
  validateSendGeneralNotification,
  controller.sendGeneralNotification
);

// ================================
// GET ROUTES
// ================================

/**
 * @swagger
 * /api/notifications/{id}:
 *   get:
 *     summary: Get notification by ID
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     responses:
 *       200:
 *         description: Notification details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", controller.getNotificationById);

// ================================
// DELETE ROUTES
// ================================

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Notification not found or unauthorized
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", controller.deleteNotification);

module.exports = router;
