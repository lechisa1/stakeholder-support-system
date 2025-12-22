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
  IssueAttachment,
  Attachment,
  IssueAction,
  IssueStatusHistory,
  sequelize,
} = require("../../models");
const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

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

    const issue_id = uuidv4();

    const issue = await Issue.create(
      {
        issue_id,
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
const getIssuesByUserId = async (req, res) => {
  try {
    const { id: user_id } = req.params;

    const whereClause = {};
    if (user_id) whereClause.reported_by = user_id;

    const issues = await Issue.findAll({
      where: whereClause,
      include: [
        { model: Project, as: "project" },
        { model: IssueCategory, as: "category" },
        { model: IssuePriority, as: "priority" },
        { model: HierarchyNode, as: "hierarchyNode" },
        { model: User, as: "reporter" },
        { model: User, as: "assignee" },
        // Comments
        {
          model: IssueComment,
          as: "comments",
          include: [{ model: User, as: "author" }],
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
//     const { pairs, user_id } = req.params; // Change from req.query to req.params

//     if (!pairs) {
//       return res.status(400).json({
//         message: "Pairs parameter is required",
//       });
//     }

//     if (!user_id) {
//       return res.status(400).json({
//         message: "User ID is required",
//       });
//     }

//     let pairsArray;
//     try {
//       pairsArray = JSON.parse(pairs);
//     } catch (parseError) {
//       return res.status(400).json({
//         message: "Invalid pairs format. Expected JSON array",
//       });
//     }

//     if (!Array.isArray(pairsArray)) {
//       return res.status(400).json({
//         message: "Pairs must be an array",
//       });
//     }

//     // Validate each pair
//     const validPairs = pairsArray.filter(
//       (pair) => pair.project_id && pair.hierarchy_node_id
//     );

//     if (validPairs.length === 0) {
//       return res.status(400).json({
//         message:
//           "No valid pairs provided. Each pair must have project_id and hierarchy_node_id",
//       });
//     }

//     // Create where conditions for all pairs
//     const whereConditions = {
//       [Op.or]: validPairs.map((pair) => ({
//         project_id: pair.project_id,
//         hierarchy_node_id: pair.hierarchy_node_id,
//       })),
//       // ❗ EXCLUDE issues reported by this user
//       reported_by: {
//         [Op.ne]: user_id,
//       },
//     };

//     const issues = await Issue.findAll({
//       where: whereConditions,
//       include: [
//         { model: Project, as: "project" },
//         { model: IssueCategory, as: "category" },
//         { model: IssuePriority, as: "priority" },
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

//     res.status(200).json(issues);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

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

//     // ------------------------------------------------------------
//     // 1️⃣ Get levels of all requested hierarchy nodes
//     // ------------------------------------------------------------
//     const hierarchyNodes = await HierarchyNode.findAll({
//       where: { hierarchy_node_id: validPairs.map((p) => p.hierarchy_node_id) },
//     });

//     const hierarchyLevels = hierarchyNodes.map((n) => n.level);

//     // ------------------------------------------------------------
//     // 2️⃣ Find all hierarchy_node_ids at those levels (siblings)
//     // ------------------------------------------------------------
//     const siblingNodes = await HierarchyNode.findAll({
//       where: { level: { [Op.in]: hierarchyLevels } },
//     });
//     const siblingNodeIds = siblingNodes.map((n) => n.hierarchy_node_id);

//     // ------------------------------------------------------------
//     // 3️⃣ GET DIRECT ISSUES (all siblings)
//     // ------------------------------------------------------------
//     const directIssues = await Issue.findAll({
//       where: {
//         project_id: validPairs.map((p) => p.project_id),
//         hierarchy_node_id: { [Op.in]: siblingNodeIds },
//         reported_by: { [Op.ne]: user_id },
//       },
//       include: [
//         { model: Project, as: "project" },
//         { model: IssueCategory, as: "category" },
//         { model: IssuePriority, as: "priority" },
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
//     // 4️⃣ GET ESCALATED ISSUES (from IssueTier)
//     // ------------------------------------------------------------
//     const escalatedIssueTiers = await IssueTier.findAll({
//       where: {
//         tier_level: { [Op.in]: siblingNodeIds },
//         status: { [Op.ne]: "closed" },
//       },
//       include: [
//         {
//           model: Issue,
//           as: "issue",
//           required: true,
//           where: { reported_by: { [Op.ne]: user_id } }, // <<<< EXCLUDE CREATOR
//           include: [
//             { model: Project, as: "project" },
//             { model: IssueCategory, as: "category" },
//             { model: IssuePriority, as: "priority" },
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
//     // const escalatedIssueTiers = await IssueTier.findAll({
//     //   where: {
//     //     tier_level: {
//     //       [Op.in]: validPairs.map((p) => p.hierarchy_node_id),
//     //     },
//     //     status: { [Op.ne]: "closed" },
//     //   },
//     //   include: [
//     //     {
//     //       model: Issue,
//     //       as: "issue",
//     //       where: {
//     //         reported_by: { [Op.ne]: user_id },
//     //       },
//     //       include: [
//     //         { model: Project, as: "project" },
//     //         { model: IssueCategory, as: "category" },
//     //         { model: IssuePriority, as: "priority" },
//     //         { model: HierarchyNode, as: "hierarchyNode" },
//     //         { model: User, as: "reporter" },
//     //         { model: User, as: "assignee" },
//     //         {
//     //           model: IssueComment,
//     //           as: "comments",
//     //           include: [{ model: User, as: "author" }],
//     //         },
//     //         {
//     //           model: IssueAttachment,
//     //           as: "attachments",
//     //           include: [{ model: Attachment, as: "attachment" }],
//     //         },
//     //       ],
//     //     },
//     //   ],
//     // });

//     // Extract Issues from IssueTier
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
//             { model: IssuePriority, as: "priority" },
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
//     // 5️⃣ MERGE BOTH RESULTS WITHOUT DUPLICATES
//     // ------------------------------------------------------------
//     const issuesMap = new Map();
//     directIssues.forEach((issue) => issuesMap.set(issue.issue_id, issue));
//     escalatedIssues.forEach((issue) => issuesMap.set(issue.issue_id, issue));

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
        count: 0,
        issues: [],
      });
    }
    // ------------------------------------------------------------
    // 3️⃣ GET DIRECT ISSUES (all childrens)
    // ------------------------------------------------------------
    const directIssues = await Issue.findAll({
      where: {
        project_id: Object.keys(projectNodeMap),
        hierarchy_node_id: { [Op.in]: allChildNodeIds },
        reported_by: { [Op.ne]: user_id },
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

    // ------------------------------------------------------------
    // 4️⃣ GET ESCALATED ISSUES (from IssueTier)
    // ------------------------------------------------------------

    // const escalatedIssueTiers = await IssueTier.findAll({
    //   where: {
    //     tier_level: {
    //       [Op.in]: validPairs.map((p) => p.hierarchy_node_id),
    //     },
    //     status: { [Op.ne]: "closed" },
    //   },
    //   include: [
    //     {
    //       model: Issue,
    //       as: "issue",
    //       where: {
    //         reported_by: { [Op.ne]: user_id },
    //       },
    //       include: [
    //         { model: Project, as: "project" },
    //         { model: IssueCategory, as: "category" },
    //         { model: IssuePriority, as: "priority" },
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
    //     },
    //   ],
    // });

    // Extract Issues from IssueTier
    // ------------------------------------------------------------
    // 2️⃣ GET ESCALATED ISSUES FROM IssueEscalation
    //    - to_tier matches hierarchy_node_id
    // ------------------------------------------------------------
    const escalatedIssuesEscalation = await IssueEscalation.findAll({
      where: {
        [Op.or]: validPairs.map((pair) => ({
          to_tier: pair.hierarchy_node_id,
          // Optional: you can filter by project if needed
          // project_id: pair.project_id
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

    const escalatedIssues = escalatedIssuesEscalation.map((t) => t.issue);

    // ------------------------------------------------------------
    // 5️⃣ MERGE BOTH RESULTS WITHOUT DUPLICATES
    // ------------------------------------------------------------
    const issuesMap = new Map();
    directIssues.forEach((issue) => issuesMap.set(issue.issue_id, issue));
    escalatedIssues.forEach((issue) => issuesMap.set(issue.issue_id, issue));

    const finalIssues = Array.from(issuesMap.values());

    res.status(200).json({
      success: true,
      count: finalIssues.length,
      issues: finalIssues,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
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
