const {
  Issue,
  IssueCategory,
  IssuePriority,
  User,
  InstituteProject,
  HierarchyNode,
  IssueAssignment,
  IssueTier,
  IssueEscalation,
  IssueComment,
  IssueHistory,
  ProjectUserRole,
  Institute,
  Project,
  EscalationAttachment,
  ResolutionAttachment,
  AssignmentAttachment,
  IssueResolution,
  IssueSolution,
  IssueSolutionAttachment,
  IssueReRaise,
  ReRaiseAttachment,
  IssueAttachment,
  IssueReject,
  RejectAttachment,
  Attachment,
  IssueAction,
  IssueStatusHistory,
  sequelize,
} = require("../../models");
const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const NotificationService = require("../../services/notificationService");

// ================================
// CREATE ISSUE (with optional attachments)
// ================================
const createIssue = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      project_id,
      title,
      description,
      issue_category_id,
      hierarchy_node_id,
      priority_id,
      reported_by,
      assigned_to,
      action_taken,
      url_path,
      issue_description,
      issue_occured_time,
      attachment_ids, // optional array of attachment IDs
    } = req.body;

    // Generate ticket number in controller
    const ticket_number = await generateTicket();

    const issue_id = uuidv4();

    const issue = await Issue.create(
      {
        issue_id,
        ticket_number,
        project_id: project_id || null,
        title,
        description,
        issue_category_id: issue_category_id || null,
        hierarchy_node_id: hierarchy_node_id || null,
        priority_id: priority_id || null,
        reported_by,
        assigned_to: assigned_to || null,
        action_taken: action_taken || null,
        url_path: url_path || null,
        issue_description: issue_description || null,
        issue_occured_time: issue_occured_time || null,
        status: "pending",
        // created_at: new Date(),
        // updated_at: new Date(),
      },
      { transaction: t }
    );

    // ================================
    // CREATE ISSUE HISTORY (NEW)
    // ================================
    await IssueHistory.create(
      {
        history_id: uuidv4(),
        issue_id: issue.issue_id,
        user_id: reported_by,
        action: "created",
        status_at_time: "pending",
        escalation_id: null,
        resolution_id: null,
        notes: "Issue created",
        created_at: new Date(),
      },
      { transaction: t }
    );

    // Create initial status history
    await IssueStatusHistory.create(
      {
        status_history_id: uuidv4(),
        issue_id: issue.issue_id,
        from_status: "pending",
        to_status: "pending",
        changed_by: reported_by,
        reason: "Issue created",
        created_at: new Date(),
      },
      { transaction: t }
    );

    // Link attachments if provided
    if (
      attachment_ids &&
      Array.isArray(attachment_ids) &&
      attachment_ids.length > 0
    ) {
      const links = attachment_ids.map((attachment_id) => ({
        issue_id: issue.issue_id,
        attachment_id,
      }));
      await IssueAttachment.bulkCreate(links, { transaction: t });
    }

    // ================================
    // SEND NOTIFICATION TO PARENT HIERARCHY
    // ================================
    try {
      if (project_id && reported_by) {
        // Use the NotificationService
        await NotificationService.sendToImmediateParentHierarchy(
          {
            sender_id: reported_by,
            project_id: project_id,
            issue_id: issue.issue_id,
            hierarchy_node_id: hierarchy_node_id,
            title: `New Issue Created: ${title}`,
            message: `A new issue "${title}" (${ticket_number}) has been created in your child hierarchy. Priority: ${
              priority_id ? "High" : "Normal"
            }`,
          },
          t // Pass the transaction
        );
        // Note: We don't need to do anything with the result here
        // It will return success even if no parents found
      }
    } catch (notificationError) {
      // Log notification error but don't fail the issue creation
      console.warn(
        "Failed to send notification for new issue:",
        notificationError.message
      );
      // Continue with issue creation even if notification fails
    }

    await t.commit();

    // Return full issue details including attachments
    const issueWithDetails = await Issue.findOne({
      where: { issue_id: issue.issue_id },
      include: [
        { model: Project, as: "project" },
        { model: IssueCategory, as: "category" },
        { model: IssuePriority, as: "priority" },
        { model: HierarchyNode, as: "hierarchyNode" },
        { model: User, as: "reporter" },
        { model: User, as: "assignee" },
        {
          model: IssueAttachment,
          as: "attachments",
          include: [
            {
              model: Attachment,
              as: "attachment",
            },
          ],
        },
      ],
    });

    res.status(201).json(issueWithDetails);
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ================================
// GET ALL ISSUES
// ================================
const getIssues = async (req, res) => {
  try {
    const {
      project_id,
      status,
      priority_id,
      issue_category_id,
      assigned_to,
      reported_by,
    } = req.query;

    const whereClause = {};
    if (project_id) whereClause.project_id = project_id;
    if (status) whereClause.status = status;
    if (priority_id) whereClause.priority_id = priority_id;
    if (issue_category_id) whereClause.issue_category_id = issue_category_id;
    if (assigned_to) whereClause.assigned_to = assigned_to;
    if (reported_by) whereClause.reported_by = reported_by;

    const issues = await Issue.findAll({
      where: whereClause,
      include: [
        { model: Project, as: "project" },
        { model: IssueCategory, as: "category" },
        { model: IssuePriority, as: "priority" },
        { model: HierarchyNode, as: "hierarchyNode" },
        { model: User, as: "reporter" },
        { model: User, as: "assignee" },
        {
          model: IssueComment,
          as: "comments",
          include: [{ model: User, as: "author" }],
        },
        {
          model: IssueAttachment,
          as: "attachments",
          include: [{ model: Attachment, as: "attachment" }],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json(issues);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ================================
// GET ALL ISSUES BY USER ID
// ================================
// const getIssuesByUserId = async (req, res) => {
//   try {
//     const { id: user_id } = req.params;

//     const whereClause = {};
//     if (user_id) whereClause.reported_by = user_id;

//     const issues = await Issue.findAll({
//       where: whereClause,
//       include: [
//         { model: Project, as: "project" },
//         { model: IssueCategory, as: "category" },
//         { model: IssuePriority, as: "priority" },
//         { model: HierarchyNode, as: "hierarchyNode" },
//         { model: User, as: "reporter" },
//         { model: User, as: "assignee" },
//         // Comments
//         {
//           model: IssueComment,
//           as: "comments",
//           include: [{ model: User, as: "author" }],
//         },
//       ],
//       order: [["created_at", "DESC"]],
//     });

//     res.status(200).json(issues);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

// ================================
// GET ALL ISSUES BY USER ID
// ================================
const getIssuesByUserId = async (req, res) => {
  try {
    const { id: user_id } = req.params;

    // ====== Get search and pagination from query params ======
    const {
      search, // optional: for ticket number, priority, category, etc.
      page = 1,
      pageSize = 10,
    } = req.query;

    if (!user_id) {
      return res.status(400).json({
        message: "User ID parameter is required",
      });
    }

    // ====== Calculate pagination ======
    const pageNum = parseInt(page);
    const limit = parseInt(pageSize);
    const offset = (pageNum - 1) * limit;

    // ====== SIMPLIFIED APPROACH: Handle search separately ======
    if (search) {
      // Step 1: Find issue IDs that match the search in Issue table
      const matchingIssuesDirect = await Issue.findAll({
        where: {
          reported_by: user_id,
          [Op.or]: [{ ticket_number: { [Op.iLike]: `%${search}%` } }],
        },
        attributes: ["issue_id"],
        raw: true,
      });

      // Step 2: Find issue IDs through related tables
      const matchingThroughPriority = await Issue.findAll({
        where: { reported_by: user_id },
        include: [
          {
            model: IssuePriority,
            as: "priority",
            where: { name: { [Op.iLike]: `%${search}%` } },
            required: true,
            attributes: [],
          },
        ],
        attributes: ["issue_id"],
        raw: true,
      });

      const matchingThroughCategory = await Issue.findAll({
        where: { reported_by: user_id },
        include: [
          {
            model: IssueCategory,
            as: "category",
            where: { name: { [Op.iLike]: `%${search}%` } },
            required: true,
            attributes: [],
          },
        ],
        attributes: ["issue_id"],
        raw: true,
      });

      const matchingThroughHierarchy = await Issue.findAll({
        where: { reported_by: user_id },
        include: [
          {
            model: HierarchyNode,
            as: "hierarchyNode",
            where: { name: { [Op.iLike]: `%${search}%` } },
            required: true,
            attributes: [],
          },
        ],
        attributes: ["issue_id"],
        raw: true,
      });

      const matchingThroughProject = await Issue.findAll({
        where: { reported_by: user_id },
        include: [
          {
            model: Project,
            as: "project",
            where: { name: { [Op.iLike]: `%${search}%` } },
            required: true,
            attributes: [],
          },
        ],
        attributes: ["issue_id"],
        raw: true,
      });

      const matchingThroughAssignee = await Issue.findAll({
        where: { reported_by: user_id },
        include: [
          {
            model: User,
            as: "reporter",
            where: {
              [Op.or]: [
                { full_name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
              ],
            },
            required: true,
            attributes: [],
          },
        ],
        attributes: ["issue_id"],
        raw: true,
      });

      // Combine all matching issue IDs
      const allMatchingIds = new Set();

      [
        ...matchingIssuesDirect,
        ...matchingThroughPriority,
        ...matchingThroughCategory,
        ...matchingThroughHierarchy,
        ...matchingThroughProject,
        ...matchingThroughAssignee,
      ].forEach((issue) => {
        allMatchingIds.add(issue.issue_id);
      });

      const matchingIssueIds = Array.from(allMatchingIds);

      if (matchingIssueIds.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No issues found matching search criteria.",
          search_query: search,
          user_id: user_id,
          count: 0,
          total_count: 0,
          data: [],
          meta: {
            page: pageNum,
            pageSize: limit,
            total: 0,
            totalPages: 0,
          },
        });
      }

      // Get paginated issues with all includes
      const { rows: issues, count: totalCount } = await Issue.findAndCountAll({
        where: {
          issue_id: { [Op.in]: matchingIssueIds },
        },
        include: [
          {
            model: Project,
            as: "project",
          },
          {
            model: IssueCategory,
            as: "category",
          },
          {
            model: IssuePriority,
            as: "priority",
          },
          {
            model: HierarchyNode,
            as: "hierarchyNode",
          },
          {
            model: User,
            as: "reporter",
            attributes: ["user_id", "full_name", "email"],
          },
          {
            model: User,
            as: "assignee",
            attributes: ["user_id", "full_name", "email"],
          },
          // Comments with author
          {
            model: IssueComment,
            as: "comments",
            include: [{ model: User, as: "author" }],
          },
        ],
        order: [["created_at", "DESC"]],
        limit: limit,
        offset: offset,
        distinct: true,
      });

      const totalPages = Math.ceil(totalCount / limit);

      return res.status(200).json({
        success: true,
        message: "Issues fetched successfully.",
        search_query: search,
        user_id: user_id,
        count: issues.length,
        total_count: totalCount,
        data: issues,
        meta: {
          page: pageNum,
          pageSize: limit,
          total: totalCount,
          totalPages: totalPages,
        },
      });
    } else {
      // ======================================================
      // NO SEARCH - Original logic with pagination
      // ======================================================
      const { rows: issues, count: totalCount } = await Issue.findAndCountAll({
        where: { reported_by: user_id },
        include: [
          {
            model: Project,
            as: "project",
          },
          {
            model: IssueCategory,
            as: "category",
          },
          {
            model: IssuePriority,
            as: "priority",
          },
          {
            model: HierarchyNode,
            as: "hierarchyNode",
          },
          {
            model: User,
            as: "reporter",
            attributes: ["user_id", "full_name", "email"],
          },
          {
            model: User,
            as: "assignee",
            attributes: ["user_id", "full_name", "email"],
          },
          // Comments with author
          {
            model: IssueComment,
            as: "comments",
            include: [{ model: User, as: "author" }],
          },
        ],
        order: [["created_at", "DESC"]],
        limit: limit,
        offset: offset,
        distinct: true,
      });

      const totalPages = Math.ceil(totalCount / limit);

      return res.status(200).json({
        success: true,
        message: "Issues fetched successfully.",
        user_id: user_id,
        count: issues.length,
        total_count: totalCount,
        data: issues,
        meta: {
          page: pageNum,
          pageSize: limit,
          total: totalCount,
          totalPages: totalPages,
        },
      });
    }
  } catch (error) {
    console.error("Error fetching issues by user ID:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ============================================
// GET ISSUES ASSIGNED TO A USER
// ============================================
const getAssignedIssues = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Fetch assignments + related issues
    const assignments = await IssueAssignment.findAll({
      where: { assignee_id: user_id },
      include: [
        {
          model: Issue,
          as: "issue",
          include: [
            { model: Project, as: "project" },
            { model: IssueCategory, as: "category" },
            { model: IssuePriority, as: "priority" },
            { model: HierarchyNode, as: "hierarchyNode" },
            { model: User, as: "reporter" },
            {
              model: IssueAttachment,
              as: "attachments",
              include: [{ model: Attachment, as: "attachment" }],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    // Extract ONLY the issues
    const issues = assignments.map((a) => a.issue);
    res.status(200).json({
      success: true,
      count: issues.length,
      issues,
    });
  } catch (error) {
    console.error("GET ASSIGNED ISSUES ERROR:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ================================
// GET ISSUE BY ID
// ================================
const getIssueById = async (req, res) => {
  try {
    const { id } = req.params;
    const userInstituteId = req.user?.institute_id || null;
    const issue = await Issue.findByPk(id, {
      include: [
        { model: Project, as: "project" },
        { model: IssueCategory, as: "category" },
        { model: IssuePriority, as: "priority" },
        { model: HierarchyNode, as: "hierarchyNode" },
        { model: User, as: "reporter" },
        { model: User, as: "assignee" },
        {
          model: IssueComment,
          as: "comments",
          include: [{ model: User, as: "author" }],
        },

        // Issue Attachments
        {
          model: IssueAttachment,
          as: "attachments",
          include: [{ model: Attachment, as: "attachment" }],
        },
        // Escalations & their attachments
        {
          model: IssueEscalation,
          as: "escalations",
          include: [
            { model: User, as: "escalator" },
            {
              model: HierarchyNode,
              as: "fromTierNode",
              foreignKey: "from_tier",
              targetKey: "hierarchy_node_id",
            },
            {
              model: HierarchyNode,
              as: "toTierNode",
              foreignKey: "to_tier",
              targetKey: "hierarchy_node_id",
            },
            {
              model: EscalationAttachment,
              as: "attachments",
              include: [{ model: Attachment, as: "attachment" }],
            },
          ],
        },
        // Resolutions & their attachments
        {
          model: IssueResolution,
          as: "resolutions",
          include: [
            { model: User, as: "resolver" },
            {
              model: ResolutionAttachment,
              as: "attachments",
              include: [{ model: Attachment, as: "attachment" }],
            },
          ],
        },
        // Rejection & their attachments
        {
          model: IssueReject,
          as: "rejects",
          include: [
            { model: User, as: "rejector" },
            {
              model: RejectAttachment,
              as: "attachments",
              include: [{ model: Attachment, as: "attachment" }],
            },
          ],
        },
        // Re Raise & their attachments
        {
          model: IssueReRaise,
          as: "reRaises",
          include: [
            { model: User, as: "re_raiser" },
            {
              model: ReRaiseAttachment,
              as: "attachments",
              include: [{ model: Attachment, as: "attachment" }],
            },
          ],
        },
        // Assignment & their attachments
        {
          model: IssueAssignment,
          as: "assignments",
          include: [
            { model: User, as: "assigner" },
            { model: User, as: "assignee" },
            {
              model: AssignmentAttachment,
              as: "attachments",
              include: [{ model: Attachment, as: "attachment" }],
            },
          ],
        },
        // History logs
        {
          model: IssueHistory,
          as: "history",
          include: [
            {
              model: User,
              as: "performed_by", // If user has an institute → filter, otherwise show all
              where: userInstituteId
                ? { institute_id: userInstituteId }
                : undefined,
              required: userInstituteId ? true : false,
            },
            {
              model: IssueEscalation,
              as: "escalation",
              include: [
                {
                  model: HierarchyNode,
                  as: "fromTierNode",
                  foreignKey: "from_tier",
                  targetKey: "hierarchy_node_id",
                },
                {
                  model: HierarchyNode,
                  as: "toTierNode",
                  foreignKey: "to_tier",
                  targetKey: "hierarchy_node_id",
                },
              ],
            },
            { model: IssueResolution, as: "resolution" },
          ],
          order: [["created_at", "DESC"]],
        },
      ],
    });

    if (!issue) return res.status(404).json({ message: "Issue not found" });
    res.status(200).json(issue);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getIssueByTicketingNumber = async (req, res) => {
  try {
    const { ticket_number } = req.params;

    const issue = await Issue.findOne({
      where: { ticket_number },
      include: [
        { model: Project, as: "project" },
        { model: IssueCategory, as: "category" },
        { model: IssuePriority, as: "priority" },
        { model: HierarchyNode, as: "hierarchyNode" },
        { model: User, as: "reporter" },
        { model: User, as: "assignee" },

        {
          model: IssueComment,
          as: "comments",
          include: [{ model: User, as: "author" }],
        },

        {
          model: IssueAttachment,
          as: "attachments",
          include: [{ model: Attachment, as: "attachment" }],
        },

        {
          model: IssueEscalation,
          as: "escalations",
          include: [
            { model: User, as: "escalator" },
            {
              model: HierarchyNode,
              as: "fromTierNode",
            },
            {
              model: HierarchyNode,
              as: "toTierNode",
            },
            {
              model: EscalationAttachment,
              as: "attachments",
              include: [{ model: Attachment, as: "attachment" }],
            },
          ],
        },

        {
          model: IssueResolution,
          as: "resolutions",
          include: [
            { model: User, as: "resolver" },
            {
              model: ResolutionAttachment,
              as: "attachments",
              include: [{ model: Attachment, as: "attachment" }],
            },
          ],
        },

        {
          model: IssueAssignment,
          as: "assignments",
          include: [
            { model: User, as: "assigner" },
            { model: User, as: "assignee" },
            {
              model: AssignmentAttachment,
              as: "attachments",
              include: [{ model: Attachment, as: "attachment" }],
            },
          ],
        },

        {
          model: IssueHistory,
          as: "history",
          include: [
            { model: User, as: "performed_by" },
            {
              model: IssueEscalation,
              as: "escalation",
              include: [
                { model: HierarchyNode, as: "fromTierNode" },
                { model: HierarchyNode, as: "toTierNode" },
              ],
            },
            { model: IssueResolution, as: "resolution" },
          ],
          order: [["created_at", "DESC"]],
        },
      ],
    });

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    res.status(200).json(issue);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ================================
// GET ISSUES BY HIERARCHY NODE ID
// ================================
const getIssuesByHierarchyNodeId = async (req, res) => {
  try {
    const { hierarchy_node_id, project_id } = req.params;

    if (!hierarchy_node_id || !project_id) {
      return res.status(400).json({
        message: "Hierarchy node ID and Project ID are required",
      });
    }

    const issues = await Issue.findAll({
      where: {
        hierarchy_node_id,
        project_id,
      },
      include: [
        { model: Project, as: "project" },
        { model: IssueCategory, as: "category" },
        { model: IssuePriority, as: "priority" },
        { model: HierarchyNode, as: "hierarchyNode" },
        { model: User, as: "reporter" },
        { model: User, as: "assignee" },
        {
          model: IssueComment,
          as: "comments",
          include: [{ model: User, as: "author" }],
        },
        {
          model: IssueAttachment,
          as: "attachments",
          include: [{ model: Attachment, as: "attachment" }],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json(issues);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ================================
// GET ISSUES BY MULTIPLE HIERARCHY NODE ID
// ================================
// const getIssuesByMultipleHierarchyNodes = async (req, res) => {
//   try {
//     const { pairs, user_id } = req.params;

//     if (!pairs || !user_id)
//       return res
//         .status(400)
//         .json({ message: "Pairs and user_id are required" });

//     let pairsArray;
//     try {
//       pairsArray = JSON.parse(pairs);
//     } catch {
//       return res
//         .status(400)
//         .json({ message: "Invalid pairs format. Expected JSON array" });
//     }

//     const validPairs = pairsArray.filter(
//       (p) => p.project_id && p.hierarchy_node_id
//     );
//     if (validPairs.length === 0)
//       return res.status(400).json({
//         message:
//           "No valid pairs provided. Each pair must have project_id and hierarchy_node_id",
//       });

//     // Identify ROOT hierarchy nodes

//     const hierarchyNodes = await HierarchyNode.findAll({
//       where: {
//         hierarchy_node_id: validPairs.map((p) => p.hierarchy_node_id),
//       },
//       attributes: ["hierarchy_node_id", "parent_id", "project_id"],
//     });

//     const rootNodes = hierarchyNodes.filter((node) => node.parent_id === null);

//     // ------------------------------------------------------------
//     // 1️⃣ Build a map: project_id => ONLY descendants (EXCLUDE parent)
//     // ------------------------------------------------------------
//     const projectNodeMap = {};
//     for (const pair of validPairs) {
//       const { project_id, hierarchy_node_id } = pair;

//       // initialize entry
//       if (!projectNodeMap[project_id]) projectNodeMap[project_id] = [];

//       // ONLY direct children, no recursion
//       const directChildren = await getDirectChildNodeIds(
//         hierarchy_node_id,
//         HierarchyNode
//       );

//       // add children only
//       projectNodeMap[project_id].push(...directChildren);
//     }

//     const allChildNodeIds = Object.values(projectNodeMap).flat();

//     if (allChildNodeIds.length === 0) {
//       return res.status(200).json({
//         success: true,
//         count: 0,
//         issues: [],
//       });
//     }
//     // ------------------------------------------------------------
//     // 3️⃣ GET DIRECT ISSUES (all childrens)
//     // ------------------------------------------------------------
//     const directIssues = await Issue.findAll({
//       where: {
//         project_id: Object.keys(projectNodeMap),
//         hierarchy_node_id: { [Op.in]: allChildNodeIds },
//         reported_by: { [Op.ne]: user_id },
//       },
//       include: [
//         { model: Project, as: "project" },
//         { model: IssueCategory, as: "category" },
//         { model: IssuePriority, as: "priority", where: { is_active: false } },
//         { model: HierarchyNode, as: "hierarchyNode" },
//         { model: User, as: "reporter" },
//         { model: User, as: "assignee" },
//         {
//           model: IssueComment,
//           as: "comments",
//           include: [{ model: User, as: "author" }],
//         },
//         {
//           model: IssueAttachment,
//           as: "attachments",
//           include: [{ model: Attachment, as: "attachment" }],
//         },
//       ],
//       order: [["created_at", "DESC"]],
//     });

//     // ------------------------------------------------------------
//     // 2️⃣ GET ESCALATED ISSUES FROM IssueEscalation
//     //    - to_tier matches hierarchy_node_id
//     // ------------------------------------------------------------
//     const escalatedIssuesEscalation = await IssueEscalation.findAll({
//       where: {
//         [Op.or]: validPairs.map((pair) => ({
//           to_tier: pair.hierarchy_node_id,
//           // Optional: you can filter by project if needed
//           // project_id: pair.project_id
//         })),
//       },
//       include: [
//         {
//           model: Issue,
//           as: "issue",
//           where: {
//             reported_by: { [Op.ne]: user_id },
//           },
//           include: [
//             { model: Project, as: "project" },
//             { model: IssueCategory, as: "category" },
//             {
//               model: IssuePriority,
//               as: "priority",
//               where: { is_active: false },
//             },
//             { model: HierarchyNode, as: "hierarchyNode" },
//             { model: User, as: "reporter" },
//             { model: User, as: "assignee" },
//             {
//               model: IssueComment,
//               as: "comments",
//               include: [{ model: User, as: "author" }],
//             },
//             {
//               model: IssueAttachment,
//               as: "attachments",
//               include: [{ model: Attachment, as: "attachment" }],
//             },
//           ],
//         },
//       ],
//     });

//     const escalatedIssues = escalatedIssuesEscalation.map((t) => t.issue);

//     // ------------------------------------------------------------
//     // 5️⃣ Root priority issues
//     // ------------------------------------------------------------

//     let rootPriorityIssues = [];

//     if (rootNodes.length > 0) {
//       const rootProjectIds = [
//         ...new Set(rootNodes.map((node) => node.project_id)),
//       ];

//       rootPriorityIssues = await Issue.findAll({
//         where: {
//           project_id: rootProjectIds,
//           reported_by: { [Op.ne]: user_id },
//         },
//         include: [
//           { model: Project, as: "project" },
//           {
//             model: IssuePriority,
//             as: "priority",
//             where: { is_active: true }, // ✅ REQUIRED CONDITION
//           },
//           { model: IssueCategory, as: "category" },
//           { model: HierarchyNode, as: "hierarchyNode" },
//           { model: User, as: "reporter" },
//           { model: User, as: "assignee" },
//           {
//             model: IssueComment,
//             as: "comments",
//             include: [{ model: User, as: "author" }],
//           },
//           {
//             model: IssueAttachment,
//             as: "attachments",
//             include: [{ model: Attachment, as: "attachment" }],
//           },
//         ],
//         order: [["created_at", "DESC"]],
//       });
//     }

//     // ------------------------------------------------------------
//     // 5️⃣ MERGE BOTH RESULTS WITHOUT DUPLICATES
//     // ------------------------------------------------------------
//     const issuesMap = new Map();
//     directIssues.forEach((issue) => issuesMap.set(issue.issue_id, issue));
//     escalatedIssues.forEach((issue) => issuesMap.set(issue.issue_id, issue));
//     rootPriorityIssues.forEach((issue) => issuesMap.set(issue.issue_id, issue));

//     const finalIssues = Array.from(issuesMap.values());

//     res.status(200).json({
//       success: true,
//       count: finalIssues.length,
//       issues: finalIssues,
//     });
//   } catch (err) {
//     console.error(err);
//     res
//       .status(500)
//       .json({ message: "Internal server error", error: err.message });
//   }
// };

const getIssuesByMultipleHierarchyNodes = async (req, res) => {
  try {
    const { pairs, user_id } = req.params;

    // ====== Get search and pagination from query params ======
    const {
      search, // optional: for ticket number, priority, category, etc.
      page = 1,
      pageSize = 10,
    } = req.query;

    if (!pairs || !user_id)
      return res
        .status(400)
        .json({ message: "Pairs and user_id are required" });

    let pairsArray;
    try {
      pairsArray = JSON.parse(pairs);
    } catch {
      return res
        .status(400)
        .json({ message: "Invalid pairs format. Expected JSON array" });
    }

    const validPairs = pairsArray.filter(
      (p) => p.project_id && p.hierarchy_node_id
    );
    if (validPairs.length === 0)
      return res.status(400).json({
        message:
          "No valid pairs provided. Each pair must have project_id and hierarchy_node_id",
      });

    // ====== Calculate pagination ======
    const pageNum = parseInt(page);
    const limit = parseInt(pageSize);
    const offset = (pageNum - 1) * limit;

    // Identify ROOT hierarchy nodes
    const hierarchyNodes = await HierarchyNode.findAll({
      where: {
        hierarchy_node_id: validPairs.map((p) => p.hierarchy_node_id),
      },
      attributes: ["hierarchy_node_id", "parent_id", "project_id"],
    });

    const rootNodes = hierarchyNodes.filter((node) => node.parent_id === null);

    // ------------------------------------------------------------
    // 1️⃣ Build a map: project_id => ONLY descendants (EXCLUDE parent)
    // ------------------------------------------------------------
    const projectNodeMap = {};
    for (const pair of validPairs) {
      const { project_id, hierarchy_node_id } = pair;

      // initialize entry
      if (!projectNodeMap[project_id]) projectNodeMap[project_id] = [];

      // ONLY direct children, no recursion
      const directChildren = await getDirectChildNodeIds(
        hierarchy_node_id,
        HierarchyNode
      );

      // add children only
      projectNodeMap[project_id].push(...directChildren);
    }

    const allChildNodeIds = Object.values(projectNodeMap).flat();

    if (allChildNodeIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No issues found.",
        search_query: search || null,
        count: 0,
        total_count: 0,
        issues: [],
        meta: {
          page: pageNum,
          pageSize: limit,
          total: 0,
          totalPages: 0,
        },
      });
    }

    // ====== SIMPLIFIED APPROACH: Handle search separately ======
    if (search) {
      // Step 1: Find issue IDs that match the search in direct issues
      const matchingDirectIssues = await Issue.findAll({
        where: {
          project_id: Object.keys(projectNodeMap),
          hierarchy_node_id: { [Op.in]: allChildNodeIds },
          reported_by: { [Op.ne]: user_id },
          [Op.or]: [
            { ticket_number: { [Op.iLike]: `%${search}%` } },
            { title: { [Op.iLike]: `%${search}%` } },
            { description: { [Op.iLike]: `%${search}%` } },
          ],
        },
        attributes: ["issue_id"],
        raw: true,
      });

      // Step 2: Find issue IDs through related tables for direct issues
      const matchingDirectThroughPriority = await Issue.findAll({
        where: {
          project_id: Object.keys(projectNodeMap),
          hierarchy_node_id: { [Op.in]: allChildNodeIds },
          reported_by: { [Op.ne]: user_id },
        },
        include: [
          {
            model: IssuePriority,
            as: "priority",
            where: {
              is_active: false,
              name: { [Op.iLike]: `%${search}%` },
            },
            required: true,
            attributes: [],
          },
        ],
        attributes: ["issue_id"],
        raw: true,
      });

      const matchingDirectThroughCategory = await Issue.findAll({
        where: {
          project_id: Object.keys(projectNodeMap),
          hierarchy_node_id: { [Op.in]: allChildNodeIds },
          reported_by: { [Op.ne]: user_id },
        },
        include: [
          {
            model: IssueCategory,
            as: "category",
            where: { name: { [Op.iLike]: `%${search}%` } },
            required: true,
            attributes: [],
          },
        ],
        attributes: ["issue_id"],
        raw: true,
      });

      const matchingDirectThroughHierarchy = await Issue.findAll({
        where: {
          project_id: Object.keys(projectNodeMap),
          hierarchy_node_id: { [Op.in]: allChildNodeIds },
          reported_by: { [Op.ne]: user_id },
        },
        include: [
          {
            model: HierarchyNode,
            as: "hierarchyNode",
            where: { name: { [Op.iLike]: `%${search}%` } },
            required: true,
            attributes: [],
          },
        ],
        attributes: ["issue_id"],
        raw: true,
      });

      const matchingDirectThroughProject = await Issue.findAll({
        where: {
          project_id: Object.keys(projectNodeMap),
          hierarchy_node_id: { [Op.in]: allChildNodeIds },
          reported_by: { [Op.ne]: user_id },
        },
        include: [
          {
            model: Project,
            as: "project",
            where: { name: { [Op.iLike]: `%${search}%` } },
            required: true,
            attributes: [],
          },
        ],
        attributes: ["issue_id"],
        raw: true,
      });

      const matchingDirectThroughReporter = await Issue.findAll({
        where: {
          project_id: Object.keys(projectNodeMap),
          hierarchy_node_id: { [Op.in]: allChildNodeIds },
          reported_by: { [Op.ne]: user_id },
        },
        include: [
          {
            model: User,
            as: "reporter",
            where: {
              [Op.or]: [
                { full_name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
              ],
            },
            required: true,
            attributes: [],
          },
        ],
        attributes: ["issue_id"],
        raw: true,
      });

      const matchingDirectThroughAssignee = await Issue.findAll({
        where: {
          project_id: Object.keys(projectNodeMap),
          hierarchy_node_id: { [Op.in]: allChildNodeIds },
          reported_by: { [Op.ne]: user_id },
        },
        include: [
          {
            model: User,
            as: "assignee",
            where: {
              [Op.or]: [
                { full_name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
              ],
            },
            required: true,
            attributes: [],
          },
        ],
        attributes: ["issue_id"],
        raw: true,
      });

      // Step 3: Find issue IDs for escalated issues
      const matchingEscalatedIssues = await IssueEscalation.findAll({
        where: {
          [Op.or]: validPairs.map((pair) => ({
            to_tier: pair.hierarchy_node_id,
          })),
        },
        include: [
          {
            model: Issue,
            as: "issue",
            where: {
              reported_by: { [Op.ne]: user_id },
              [Op.or]: [
                { ticket_number: { [Op.iLike]: `%${search}%` } },
                { title: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } },
              ],
            },
            attributes: ["issue_id"],
          },
        ],
        raw: true,
      }).then((records) =>
        records.map((r) => ({ issue_id: r.issue.issue_id }))
      );

      // Step 4: Find issue IDs for root priority issues
      let matchingRootPriorityIssues = [];
      if (rootNodes.length > 0) {
        const rootProjectIds = [
          ...new Set(rootNodes.map((node) => node.project_id)),
        ];

        matchingRootPriorityIssues = await Issue.findAll({
          where: {
            project_id: rootProjectIds,
            reported_by: { [Op.ne]: user_id },
            [Op.or]: [
              { ticket_number: { [Op.iLike]: `%${search}%` } },
              { title: { [Op.iLike]: `%${search}%` } },
              { description: { [Op.iLike]: `%${search}%` } },
            ],
          },
          include: [
            {
              model: IssuePriority,
              as: "priority",
              where: { is_active: true },
              required: true,
            },
          ],
          attributes: ["issue_id"],
          raw: true,
        });
      }

      // Combine all matching issue IDs
      const allMatchingIds = new Set();

      [
        ...matchingDirectIssues,
        ...matchingDirectThroughPriority,
        ...matchingDirectThroughCategory,
        ...matchingDirectThroughHierarchy,
        ...matchingDirectThroughProject,
        ...matchingDirectThroughReporter,
        ...matchingDirectThroughAssignee,
        ...matchingEscalatedIssues,
        ...matchingRootPriorityIssues,
      ].forEach((issue) => {
        if (issue && issue.issue_id) allMatchingIds.add(issue.issue_id);
      });

      const matchingIssueIds = Array.from(allMatchingIds);

      if (matchingIssueIds.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No issues found matching search criteria.",
          search_query: search,
          count: 0,
          total_count: 0,
          issues: [],
          meta: {
            page: pageNum,
            pageSize: limit,
            total: 0,
            totalPages: 0,
          },
        });
      }

      // ======================================================
      // 1️⃣ GET DIRECT ISSUES (with search filtered IDs)
      // ======================================================
      const directIssues = await Issue.findAndCountAll({
        where: {
          issue_id: { [Op.in]: matchingIssueIds },
          project_id: Object.keys(projectNodeMap),
          hierarchy_node_id: { [Op.in]: allChildNodeIds },
          reported_by: { [Op.ne]: user_id },
        },
        include: [
          { model: Project, as: "project" },
          { model: IssueCategory, as: "category" },
          { model: IssuePriority, as: "priority", where: { is_active: false } },
          { model: HierarchyNode, as: "hierarchyNode" },
          { model: User, as: "reporter" },
          { model: User, as: "assignee" },
          {
            model: IssueComment,
            as: "comments",
            include: [{ model: User, as: "author" }],
          },
          {
            model: IssueAttachment,
            as: "attachments",
            include: [{ model: Attachment, as: "attachment" }],
          },
        ],
        order: [["created_at", "DESC"]],
        limit: limit,
        offset: offset,
        distinct: true,
      });

      // ======================================================
      // 2️⃣ GET ESCALATED ISSUES (with search filtered IDs)
      // ======================================================
      const escalatedIssuesEscalation = await IssueEscalation.findAndCountAll({
        where: {
          [Op.or]: validPairs.map((pair) => ({
            to_tier: pair.hierarchy_node_id,
          })),
        },
        include: [
          {
            model: Issue,
            as: "issue",
            where: {
              issue_id: { [Op.in]: matchingIssueIds },
              reported_by: { [Op.ne]: user_id },
            },
            include: [
              { model: Project, as: "project" },
              { model: IssueCategory, as: "category" },
              {
                model: IssuePriority,
                as: "priority",
                where: { is_active: false },
              },
              { model: HierarchyNode, as: "hierarchyNode" },
              { model: User, as: "reporter" },
              { model: User, as: "assignee" },
              {
                model: IssueComment,
                as: "comments",
                include: [{ model: User, as: "author" }],
              },
              {
                model: IssueAttachment,
                as: "attachments",
                include: [{ model: Attachment, as: "attachment" }],
              },
            ],
          },
        ],
        limit: limit,
        offset: offset,
        distinct: true,
      });

      const escalatedIssues = escalatedIssuesEscalation.rows.map(
        (t) => t.issue
      );

      // ======================================================
      // 3️⃣ Root priority issues (with search filtered IDs)
      // ======================================================
      let rootPriorityIssues = await Issue.findAndCountAll({
        where: {
          issue_id: { [Op.in]: matchingIssueIds },
          reported_by: { [Op.ne]: user_id },
        },
        include: [
          { model: Project, as: "project" },
          {
            model: IssuePriority,
            as: "priority",
            where: { is_active: true },
            required: true,
          },
          { model: IssueCategory, as: "category" },
          { model: HierarchyNode, as: "hierarchyNode" },
          { model: User, as: "reporter" },
          { model: User, as: "assignee" },
          {
            model: IssueComment,
            as: "comments",
            include: [{ model: User, as: "author" }],
          },
          {
            model: IssueAttachment,
            as: "attachments",
            include: [{ model: Attachment, as: "attachment" }],
          },
        ],
        order: [["created_at", "DESC"]],
        limit: limit,
        offset: offset,
        distinct: true,
      });

      // ======================================================
      // 4️⃣ MERGE & DEDUPLICATE
      // ======================================================
      const issuesMap = new Map();
      directIssues.rows.forEach((issue) =>
        issuesMap.set(issue.issue_id, issue)
      );
      escalatedIssues.forEach((issue) => issuesMap.set(issue.issue_id, issue));
      rootPriorityIssues.rows.forEach((issue) =>
        issuesMap.set(issue.issue_id, issue)
      );

      const finalIssues = Array.from(issuesMap.values());

      // ======================================================
      // 5️⃣ Calculate total count (unique issues from all queries)
      // ======================================================
      const totalUniqueCount =
        directIssues.count +
        escalatedIssuesEscalation.count +
        rootPriorityIssues.count;
      const totalPages = Math.ceil(totalUniqueCount / limit);

      return res.status(200).json({
        success: true,
        message: "Issues fetched successfully.",
        search_query: search,
        count: finalIssues.length,
        total_count: totalUniqueCount,
        issues: finalIssues,
        meta: {
          page: pageNum,
          pageSize: limit,
          total: totalUniqueCount,
          totalPages: totalPages,
        },
      });
    } else {
      // ======================================================
      // NO SEARCH - Original logic with pagination
      // ======================================================
      // 1️⃣ GET DIRECT ISSUES
      const directIssues = await Issue.findAndCountAll({
        where: {
          project_id: Object.keys(projectNodeMap),
          hierarchy_node_id: { [Op.in]: allChildNodeIds },
          reported_by: { [Op.ne]: user_id },
        },
        include: [
          { model: Project, as: "project" },
          { model: IssueCategory, as: "category" },
          { model: IssuePriority, as: "priority", where: { is_active: false } },
          { model: HierarchyNode, as: "hierarchyNode" },
          { model: User, as: "reporter" },
          { model: User, as: "assignee" },
          {
            model: IssueComment,
            as: "comments",
            include: [{ model: User, as: "author" }],
          },
          {
            model: IssueAttachment,
            as: "attachments",
            include: [{ model: Attachment, as: "attachment" }],
          },
        ],
        order: [["created_at", "DESC"]],
        limit: limit,
        offset: offset,
        distinct: true,
      });

      // ======================================================
      // 2️⃣ GET ESCALATED ISSUES
      // ======================================================
      const escalatedIssuesEscalation = await IssueEscalation.findAndCountAll({
        where: {
          [Op.or]: validPairs.map((pair) => ({
            to_tier: pair.hierarchy_node_id,
          })),
        },
        include: [
          {
            model: Issue,
            as: "issue",
            where: {
              reported_by: { [Op.ne]: user_id },
            },
            include: [
              { model: Project, as: "project" },
              { model: IssueCategory, as: "category" },
              {
                model: IssuePriority,
                as: "priority",
                where: { is_active: false },
              },
              { model: HierarchyNode, as: "hierarchyNode" },
              { model: User, as: "reporter" },
              { model: User, as: "assignee" },
              {
                model: IssueComment,
                as: "comments",
                include: [{ model: User, as: "author" }],
              },
              {
                model: IssueAttachment,
                as: "attachments",
                include: [{ model: Attachment, as: "attachment" }],
              },
            ],
          },
        ],
        limit: limit,
        offset: offset,
        distinct: true,
      });

      const escalatedIssues = escalatedIssuesEscalation.rows.map(
        (t) => t.issue
      );

      // ======================================================
      // 3️⃣ Root priority issues
      // ======================================================
      let rootPriorityIssues = await Issue.findAndCountAll({
        where: {
          reported_by: { [Op.ne]: user_id },
        },
        include: [
          { model: Project, as: "project" },
          {
            model: IssuePriority,
            as: "priority",
            where: { is_active: true },
            required: true,
          },
          { model: IssueCategory, as: "category" },
          { model: HierarchyNode, as: "hierarchyNode" },
          { model: User, as: "reporter" },
          { model: User, as: "assignee" },
          {
            model: IssueComment,
            as: "comments",
            include: [{ model: User, as: "author" }],
          },
          {
            model: IssueAttachment,
            as: "attachments",
            include: [{ model: Attachment, as: "attachment" }],
          },
        ],
        order: [["created_at", "DESC"]],
        limit: limit,
        offset: offset,
        distinct: true,
      });

      // ======================================================
      // 4️⃣ MERGE & DEDUPLICATE
      // ======================================================
      const issuesMap = new Map();
      directIssues.rows.forEach((issue) =>
        issuesMap.set(issue.issue_id, issue)
      );
      escalatedIssues.forEach((issue) => issuesMap.set(issue.issue_id, issue));
      rootPriorityIssues.rows.forEach((issue) =>
        issuesMap.set(issue.issue_id, issue)
      );

      const finalIssues = Array.from(issuesMap.values());

      // ======================================================
      // 5️⃣ Calculate total count
      // ======================================================
      const totalCount =
        directIssues.count +
        escalatedIssuesEscalation.count +
        rootPriorityIssues.count;
      const totalPages = Math.ceil(totalCount / limit);

      return res.status(200).json({
        success: true,
        message: "Issues fetched successfully.",
        search_query: null,
        count: finalIssues.length,
        total_count: totalCount,
        issues: finalIssues,
        meta: {
          page: pageNum,
          pageSize: limit,
          total: totalCount,
          totalPages: totalPages,
        },
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

const getProjectIssuesEscalatedOrTopHierarchy = async (req, res) => {
  try {
    const { projectIds } = req.params;

    // ====== Get search and pagination from query params ======
    const {
      search, // optional: for ticket number, priority, category, etc.
      page = 1,
      pageSize = 10,
    } = req.query;

    if (!projectIds) {
      return res.status(400).json({
        message: "projectIds parameter is required",
      });
    }

    let parsedProjectIds;

    try {
      parsedProjectIds = JSON.parse(decodeURIComponent(projectIds));
    } catch (err) {
      return res.status(400).json({
        message: "Invalid projectIds format",
      });
    }

    if (!Array.isArray(parsedProjectIds) || parsedProjectIds.length === 0) {
      return res.status(400).json({
        message: "projectIds must be a non-empty array",
      });
    }

    // ====== Calculate pagination ======
    const pageNum = parseInt(page);
    const limit = parseInt(pageSize);
    const offset = (pageNum - 1) * limit;

    // ====== SIMPLIFIED APPROACH: Handle search separately ======
    if (search) {
      // Step 1: Find issue IDs that match the search in Issue table
      const matchingIssuesDirect = await Issue.findAll({
        where: {
          project_id: { [Op.in]: parsedProjectIds },
          [Op.or]: [
            { ticket_number: { [Op.iLike]: `%${search}%` } },
            { title: { [Op.iLike]: `%${search}%` } },
            { description: { [Op.iLike]: `%${search}%` } },
          ],
        },
        attributes: ["issue_id"],
        raw: true,
      });

      // Step 2: Find issue IDs through related tables
      const matchingThroughPriority = await Issue.findAll({
        where: { project_id: { [Op.in]: parsedProjectIds } },
        include: [
          {
            model: IssuePriority,
            as: "priority",
            where: { name: { [Op.iLike]: `%${search}%` } },
            required: true,
            attributes: [],
          },
        ],
        attributes: ["issue_id"],
        raw: true,
      });

      const matchingThroughCategory = await Issue.findAll({
        where: { project_id: { [Op.in]: parsedProjectIds } },
        include: [
          {
            model: IssueCategory,
            as: "category",
            where: { name: { [Op.iLike]: `%${search}%` } },
            required: true,
            attributes: [],
          },
        ],
        attributes: ["issue_id"],
        raw: true,
      });

      const matchingThroughHierarchy = await Issue.findAll({
        where: { project_id: { [Op.in]: parsedProjectIds } },
        include: [
          {
            model: HierarchyNode,
            as: "hierarchyNode",
            where: { name: { [Op.iLike]: `%${search}%` } },
            required: true,
            attributes: [],
          },
        ],
        attributes: ["issue_id"],
        raw: true,
      });

      const matchingThroughProject = await Issue.findAll({
        where: { project_id: { [Op.in]: parsedProjectIds } },
        include: [
          {
            model: Project,
            as: "project",
            where: { name: { [Op.iLike]: `%${search}%` } },
            required: true,
            attributes: [],
          },
        ],
        attributes: ["issue_id"],
        raw: true,
      });

      const matchingThroughReporter = await Issue.findAll({
        where: { project_id: { [Op.in]: parsedProjectIds } },
        include: [
          {
            model: User,
            as: "reporter",
            where: {
              [Op.or]: [
                { full_name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
              ],
            },
            required: true,
            attributes: [],
          },
        ],
        attributes: ["issue_id"],
        raw: true,
      });

      const matchingThroughAssignee = await Issue.findAll({
        where: { project_id: { [Op.in]: parsedProjectIds } },
        include: [
          {
            model: User,
            as: "assignee",
            where: {
              [Op.or]: [
                { full_name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
              ],
            },
            required: true,
            attributes: [],
          },
        ],
        attributes: ["issue_id"],
        raw: true,
      });

      // Combine all matching issue IDs
      const allMatchingIds = new Set();

      [
        ...matchingIssuesDirect,
        ...matchingThroughPriority,
        ...matchingThroughCategory,
        ...matchingThroughHierarchy,
        ...matchingThroughProject,
        ...matchingThroughReporter,
        ...matchingThroughAssignee,
      ].forEach((issue) => {
        allMatchingIds.add(issue.issue_id);
      });

      const matchingIssueIds = Array.from(allMatchingIds);

      if (matchingIssueIds.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No issues found matching search criteria.",
          search_query: search,
          count: 0,
          total_count: 0,
          data: [],
          meta: {
            page: pageNum,
            pageSize: limit,
            total: 0,
            totalPages: 0,
          },
        });
      }

      // ======================================================
      // 1️⃣ Issues escalated to NULL tier with matching IDs
      // ======================================================
      const escalatedNullTierRecords = await IssueEscalation.findAndCountAll({
        where: { to_tier: null },
        include: [
          {
            model: Issue,
            as: "issue",
            where: {
              issue_id: { [Op.in]: matchingIssueIds },
            },
            include: [
              {
                model: Project,
                as: "project",
              },
              {
                model: IssueCategory,
                as: "category",
              },
              {
                model: IssuePriority,
                as: "priority",
              },
              {
                model: HierarchyNode,
                as: "hierarchyNode",
                required: false,
              },
              {
                model: User,
                as: "reporter",
                attributes: ["user_id", "full_name", "email"],
              },
              {
                model: User,
                as: "assignee",
                attributes: ["user_id", "full_name", "email"],
              },
            ],
          },
        ],
        limit: limit,
        offset: offset,
        distinct: true,
      });

      // ======================================================
      // 2️⃣ Top hierarchy issues with matching IDs
      // ======================================================
      const topHierarchyIssues = await Issue.findAndCountAll({
        where: {
          issue_id: { [Op.in]: matchingIssueIds },
        },
        include: [
          {
            model: Project,
            as: "project",
          },
          {
            model: IssueCategory,
            as: "category",
          },
          {
            model: IssuePriority,
            as: "priority",
          },
          {
            model: HierarchyNode,
            as: "hierarchyNode",
            where: { parent_id: null },
            required: true,
          },
          {
            model: User,
            as: "reporter",
            attributes: ["user_id", "full_name", "email"],
          },
          {
            model: User,
            as: "assignee",
            attributes: ["user_id", "full_name", "email"],
          },
        ],
        limit: limit,
        offset: offset,
        distinct: true,
      });

      // ======================================================
      // 3️⃣ Merge & deduplicate
      // ======================================================
      const issuesMap = new Map();

      escalatedNullTierRecords.rows.forEach((r) => {
        if (r.issue) issuesMap.set(r.issue.issue_id, r.issue);
      });
      topHierarchyIssues.rows.forEach((i) => issuesMap.set(i.issue_id, i));

      const finalIssues = Array.from(issuesMap.values());

      // ======================================================
      // 4️⃣ Calculate total count (unique issues from both queries)
      // ======================================================
      const totalUniqueCount =
        escalatedNullTierRecords.count + topHierarchyIssues.count;
      const totalPages = Math.ceil(totalUniqueCount / limit);

      return res.status(200).json({
        success: true,
        message: "Issues fetched successfully.",
        search_query: search || null,
        count: finalIssues.length,
        total_count: totalUniqueCount,
        data: finalIssues,
        meta: {
          page: pageNum,
          pageSize: limit,
          total: totalUniqueCount,
          totalPages: totalPages,
        },
      });
    } else {
      // ======================================================
      // NO SEARCH - Original logic with pagination
      // ======================================================
      // 1️⃣ Issues escalated to NULL tier
      const escalatedNullTierRecords = await IssueEscalation.findAndCountAll({
        where: { to_tier: null },
        include: [
          {
            model: Issue,
            as: "issue",
            where: { project_id: { [Op.in]: parsedProjectIds } },
            include: [
              {
                model: Project,
                as: "project",
              },
              {
                model: IssueCategory,
                as: "category",
              },
              {
                model: IssuePriority,
                as: "priority",
              },
              {
                model: HierarchyNode,
                as: "hierarchyNode",
                required: false,
              },
              {
                model: User,
                as: "reporter",
                attributes: ["user_id", "full_name", "email"],
              },
              {
                model: User,
                as: "assignee",
                attributes: ["user_id", "full_name", "email"],
              },
            ],
          },
        ],
        limit: limit,
        offset: offset,
        distinct: true,
      });

      // 2️⃣ Top hierarchy issues
      const topHierarchyIssues = await Issue.findAndCountAll({
        where: { project_id: { [Op.in]: parsedProjectIds } },
        include: [
          {
            model: Project,
            as: "project",
          },
          {
            model: IssueCategory,
            as: "category",
          },
          {
            model: IssuePriority,
            as: "priority",
          },
          {
            model: HierarchyNode,
            as: "hierarchyNode",
            where: { parent_id: null },
            required: true,
          },
          {
            model: User,
            as: "reporter",
            attributes: ["user_id", "full_name", "email"],
          },
          {
            model: User,
            as: "assignee",
            attributes: ["user_id", "full_name", "email"],
          },
        ],
        limit: limit,
        offset: offset,
        distinct: true,
      });

      // 3️⃣ Merge & deduplicate
      const issuesMap = new Map();

      escalatedNullTierRecords.rows.forEach((r) => {
        if (r.issue) issuesMap.set(r.issue.issue_id, r.issue);
      });
      topHierarchyIssues.rows.forEach((i) => issuesMap.set(i.issue_id, i));

      const finalIssues = Array.from(issuesMap.values());

      // Calculate total count
      const totalCount =
        escalatedNullTierRecords.count + topHierarchyIssues.count;
      const totalPages = Math.ceil(totalCount / limit);

      return res.status(200).json({
        success: true,
        message: "Issues fetched successfully.",
        count: finalIssues.length,
        total_count: totalCount,
        data: finalIssues,
        meta: {
          page: pageNum,
          pageSize: limit,
          total: totalCount,
          totalPages: totalPages,
        },
      });
    }
  } catch (error) {
    console.error("Error fetching issues:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
// ======================================================
// GET ISSUES THAT WERE ESCALATED AND to_tier IS NULL
// ======================================================

const getEscalatedIssuesWithNullTier = async (req, res) => {
  try {
    // 1️⃣ Find issue escalations where to_tier IS NULL
    const escalatedNullTier = await IssueEscalation.findAll({
      where: { to_tier: null },
      include: [
        {
          model: Issue,
          as: "issue",
          include: [
            { model: Project, as: "project" },
            { model: IssueCategory, as: "category" },
            { model: IssuePriority, as: "priority" },
            { model: HierarchyNode, as: "hierarchyNode" },
            { model: User, as: "reporter" },
            { model: User, as: "assignee" },
            {
              model: IssueComment,
              as: "comments",
              include: [{ model: User, as: "author" }],
            },
            {
              model: IssueAttachment,
              as: "attachments",
              include: [{ model: Attachment, as: "attachment" }],
            },
          ],
        },
      ],
    });

    // 2️⃣ Extract actual issues
    const issues = escalatedNullTier.map((record) => record.issue);

    res.status(200).json({
      success: true,
      count: issues.length,
      issues,
    });
  } catch (error) {
    console.error("Error fetching escalated issues with null tier:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const acceptIssue = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { issue_id } = req.body;
    const user_id = req.user?.user_id;

    const issue = await Issue.findByPk(issue_id, { transaction: t });
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    // Store action
    await IssueAction.create(
      {
        action_id: uuidv4(),
        issue_id,
        action_name: "accepted",
        action_description: "Issue accepted by parent handler",
        performed_by: user_id,
        related_tier: issue.hierarchy_node_id,
        created_at: new Date(),
      },
      { transaction: t }
    );

    // Update issue status to 'in_progress'
    const oldStatus = issue.status;
    issue.status = "in_progress"; // <--- status update
    await issue.save({ transaction: t });

    // Store status history
    await IssueStatusHistory.create(
      {
        status_history_id: uuidv4(),
        issue_id,
        from_status: oldStatus,
        to_status: issue.status,
        changed_by: user_id,
        reason: "Issue accepted and marked In Progress",
        created_at: new Date(),
      },
      { transaction: t }
    );

    // ================================
    // NEW — CREATE ISSUE HISTORY RECORD
    // ================================
    await IssueHistory.create(
      {
        history_id: uuidv4(),
        issue_id,
        user_id,
        action: "accepted",
        status_at_time: "in_progress", // new status
        escalation_id: null,
        resolution_id: null,
        notes: "Issue accepted by handler and status changed to In Progress",
        created_at: new Date(),
      },
      { transaction: t }
    );

    await t.commit();
    return res.json({
      success: true,
      message: "Issue status updated to In Progress.",
    });
  } catch (error) {
    await t.rollback();
    console.error("ACCEPT ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

const confirmIssueResolved = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { issue_id } = req.body;
    const user_id = req.user?.user_id;

    const issue = await Issue.findByPk(issue_id, { transaction: t });
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    // Store action
    await IssueAction.create(
      {
        action_id: uuidv4(),
        issue_id,
        action_name: "closed",
        action_description: "Issue marked as resolved by handler",
        performed_by: user_id,
        related_tier: issue.hierarchy_node_id,
        created_at: new Date(),
      },
      { transaction: t }
    );

    // Update issue status to 'closed'
    const oldStatus = issue.status;
    issue.status = "closed";
    await issue.save({ transaction: t });

    // Store status history
    await IssueStatusHistory.create(
      {
        status_history_id: uuidv4(),
        issue_id,
        from_status: oldStatus,
        to_status: issue.status,
        changed_by: user_id,
        reason: "Issue confirmed resolved and marked Closed",
        created_at: new Date(),
      },
      { transaction: t }
    );

    // Create issue history record
    await IssueHistory.create(
      {
        history_id: uuidv4(),
        issue_id,
        user_id,
        action: "closed",
        status_at_time: "closed",
        escalation_id: null,
        resolution_id: null,
        notes: "Issue confirmed resolved and status changed to Closed",
        created_at: new Date(),
      },
      { transaction: t }
    );

    // ==================================
    // NOTIFY SOLVER(S) ABOUT CONFIRMATION/REJECTION
    // ==================================
    try {
      await NotificationService.notifySolverOnConfirmation(
        {
          issue_id,
          creator_id: user_id,
          is_confirmed: true,
          rejection_reason: null,
        },
        t // Pass the existing transaction
      );
    } catch (notificationError) {
      console.warn("Notification to solver failed:", notificationError.message);
      // Don't fail the entire operation if notification fails
    }

    await t.commit();
    return res.json({
      success: true,
      message: "Issue status updated to Closed.",
    });
  } catch (error) {
    await t.rollback();
    console.error("RESOLVE ISSUE ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ================================
// UPDATE ISSUE (with attachments)
// ================================

const updateIssue = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const {
      title,
      description,
      issue_category_id,
      hierarchy_node_id,
      priority_id,
      status,
      assigned_to,
      action_taken,
      url_path,
      issue_description,
      issue_occured_time,
      status_change_reason,
      attachment_ids,
    } = req.body;

    const user_id = req.user?.user_id;

    const issue = await Issue.findByPk(id, { transaction: t });
    if (!issue) {
      await t.rollback();
      return res.status(404).json({ message: "Issue not found" });
    }

    const oldStatus = issue.status;
    const oldAssignee = issue.assigned_to;

    // Track if *any* meaningful change happened
    let hasChanges = false;
    let notes = [];

    // Detect changes and apply modifications
    const fieldsToCheck = {
      title,
      description,
      issue_category_id,
      hierarchy_node_id,
      priority_id,
      action_taken,
      url_path,
      issue_description,
      issue_occured_time,
    };

    for (const [field, newValue] of Object.entries(fieldsToCheck)) {
      if (newValue && newValue !== issue[field]) {
        hasChanges = true;
        notes.push(`${field} updated`);
        issue[field] = newValue;
      }
    }

    // Handle assignee change
    let assigneeChanged = false;
    if (assigned_to && assigned_to !== oldAssignee) {
      assigneeChanged = true;
      hasChanges = true;
      notes.push(`assigned_to changed from ${oldAssignee} to ${assigned_to}`);
      issue.assigned_to = assigned_to;
    }

    // Handle status change
    let statusChanged = false;
    if (status && status !== issue.status) {
      statusChanged = true;
      hasChanges = true;
      notes.push(`status changed from ${oldStatus} to ${status}`);

      issue.status = status;
      if (status === "resolved") issue.resolved_at = new Date();
      if (status === "closed") issue.closed_at = new Date();

      await IssueStatusHistory.create(
        {
          status_history_id: uuidv4(),
          issue_id: issue.issue_id,
          from_status: oldStatus,
          to_status: status,
          changed_by: user_id || issue.reported_by,
          reason: status_change_reason || "Status updated",
          created_at: new Date(),
        },
        { transaction: t }
      );
    }

    await issue.save({ transaction: t });

    // Link new attachments
    if (
      attachment_ids &&
      Array.isArray(attachment_ids) &&
      attachment_ids.length > 0
    ) {
      const existingLinks = await IssueAttachment.findAll({
        where: { issue_id: issue.issue_id },
        transaction: t,
      });
      const existingIds = existingLinks.map((l) => l.attachment_id);

      const newLinks = attachment_ids
        .filter((aid) => !existingIds.includes(aid))
        .map((aid) => ({ issue_id: issue.issue_id, attachment_id: aid }));

      if (newLinks.length > 0) {
        await IssueAttachment.bulkCreate(newLinks, { transaction: t });
        notes.push("new attachments added");
        hasChanges = true;
      }
    }

    // ================================
    // CREATE ISSUE HISTORY ENTRY
    // ================================
    if (hasChanges) {
      let action = "updated";

      if (assigneeChanged) action = "assigned";
      if (statusChanged)
        action = status === "resolved" ? "resolved" : "updated";

      await IssueHistory.create(
        {
          history_id: uuidv4(),
          issue_id: issue.issue_id,
          user_id: user_id,
          action,
          status_at_time: issue.status,
          escalation_id: null,
          resolution_id: null,
          notes: notes.join("; "),
          created_at: new Date(),
        },
        { transaction: t }
      );
    }

    await t.commit();

    const updatedIssue = await Issue.findByPk(id, {
      include: [
        { model: Project, as: "project" },
        { model: IssueCategory, as: "category" },
        { model: IssuePriority, as: "priority" },
        { model: HierarchyNode, as: "hierarchyNode" },
        { model: User, as: "reporter" },
        { model: User, as: "assignee" },
        {
          model: IssueAttachment,
          as: "attachments",
          include: [{ model: Attachment, as: "attachment" }],
        },
      ],
    });

    res.status(200).json(updatedIssue);
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ================================
// DELETE ISSUE
// ================================
const deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const issue = await Issue.findByPk(id);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    await issue.destroy();
    res.status(200).json({ message: "Issue deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  createIssue,
  getIssues,
  getIssueById,
  getIssueByTicketingNumber,
  getIssuesByUserId,
  getAssignedIssues,
  getIssuesByHierarchyNodeId,
  getIssuesByMultipleHierarchyNodes,
  getEscalatedIssuesWithNullTier,
  getProjectIssuesEscalatedOrTopHierarchy,
  updateIssue,
  deleteIssue,
  acceptIssue,
  confirmIssueResolved,
};

// Utility functions
const getDirectChildNodeIds = async (nodeId, HierarchyNode) => {
  const childNodes = await HierarchyNode.findAll({
    where: { parent_id: nodeId },
    attributes: ["hierarchy_node_id"],
  });

  return childNodes.map((n) => n.hierarchy_node_id);
};

// Helper function to generate ticket number - FIXED VERSION
const generateTicket = async () => {
  const crypto = require("crypto");
  const year = new Date().getFullYear().toString().slice(-2);

  // Use a while loop with a safety limit to prevent infinite loops
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const randomCode = crypto.randomBytes(3).toString("hex").toUpperCase();
    const ticket = `TICK-${year}-${randomCode}`;

    // Check if ticket exists in database
    try {
      const existing = await Issue.findOne({
        where: { ticket_number: ticket },
      });

      if (!existing) {
        return ticket; // Return the unique ticket
      }
    } catch (error) {
      // If there's an error checking, generate a new one
      console.warn("Error checking ticket uniqueness:", error.message);
    }

    attempts++;
  }

  // If we can't find a unique ticket after max attempts,
  // generate one with a timestamp to ensure uniqueness
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomCode = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `TICK-${year}-${timestamp}-${randomCode}`;
};
