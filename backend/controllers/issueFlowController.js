const {
  Issue,

  HierarchyNode,

  IssueEscalation,

  IssueCategory,
  IssuePriority,
  User,
  InstituteProject,
 

 
  IssueComment,


  IssueStatusHistory,
  sequelize,
  IssueAction,
} = require("../models");

const { Op } = require("sequelize");

const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");

const acceptIssue = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { issue_id } = req.body;
    const user_id = req.user?.user_id;

    const issue = await Issue.findByPk(issue_id);
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

    // No status change (still pending)
    await IssueStatusHistory.create(
      {
        status_history_id: uuidv4(),
        issue_id,
        from_status: issue.status,
        to_status: issue.status,
        changed_by: user_id,
        reason: "Issue accepted",
        created_at: new Date(),
      },
      { transaction: t }
    );

    await t.commit();
    return res.json({ success: true, message: "Issue accepted." });
  } catch (error) {
    await t.rollback();
    console.error("ACCEPT ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

const resolveIssue = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { issue_id, resolution_note } = req.body;
    const user_id = req.user.user_id;

    const issue = await Issue.findByPk(issue_id);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    // Update issue
    await issue.update(
      {
        status: "resolved",
        resolved_at: new Date(),
        action_taken: resolution_note,
      },
      { transaction: t }
    );

    // Add action
    await IssueAction.create(
      {
        action_id: uuidv4(),
        issue_id,
        action_name: "resolved",
        action_description: resolution_note,
        performed_by: user_id,
        related_tier: issue.hierarchy_node_id,
        created_at: new Date(),
      },
      { transaction: t }
    );

    // Add history
    await IssueStatusHistory.create(
      {
        status_history_id: uuidv4(),
        issue_id,
        from_status: issue.status,
        to_status: "resolved",
        changed_by: user_id,
        reason: "Issue resolved",
        created_at: new Date(),
      },
      { transaction: t }
    );

    await t.commit();
    res.json({ message: "Issue resolved successfully" });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};

const escalateIssue = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { issue_id, reason } = req.body;
    const user_id = req.user.user_id;

    const issue = await Issue.findByPk(issue_id);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    const node = await HierarchyNode.findByPk(issue.hierarchy_node_id);
    if (!node)
      return res.status(400).json({ message: "Handler hierarchy not found" });

    // ---- find parent node --------------------
    if (!node.parent_id) {
      return res
        .status(400)
        .json({ message: "Already at highest hierarchy. Cannot escalate." });
    }

    const parentNode = await HierarchyNode.findByPk(node.parent_id);

    // ---- update issue handler to parent ------
    await issue.update(
      {
        hierarchy_node_id: parentNode.hierarchy_node_id,
        assigned_to: null, // new handler
        updated_at: new Date(),
      },
      { transaction: t }
    );

    // ---- add issue action --------------------
    await IssueAction.create(
      {
        action_id: uuidv4(),
        issue_id,
        action_name: "escalated",
        action_description: reason,
        performed_by: user_id,
        related_tier: `from ${node.name} to ${parentNode.name}`,
        created_at: new Date(),
      },
      { transaction: t }
    );

    // ---- add escalation table (optional) -----
    await IssueEscalation.create(
      {
        escalation_id: uuidv4(),
        issue_id,
        from_tier: node.name,
        to_tier: parentNode.name,
        reason,
        escalated_by: user_id,
        escalated_at: new Date(),
        created_at: new Date(),
      },
      { transaction: t }
    );

    // ---- status history (still pending) ------
    await IssueStatusHistory.create(
      {
        status_history_id: uuidv4(),
        issue_id,
        from_status: issue.status,
        to_status: issue.status,
        changed_by: user_id,
        reason: "Issue escalated",
        created_at: new Date(),
      },
      { transaction: t }
    );

    await t.commit();

    return res.json({
      success: true,
      message: "Issue escalated to next hierarchy",
    });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({ message: error.message });
  }
};

// const getIssues = async (req, res) => {
//   try {
//     const {
//       institute_project_id,
//       status,
//       priority_id,
//       issue_category_id,
//       assigned_to,
//       reported_by,
//     } = req.query;

//     const whereClause = {};

//     // Apply filters if provided
//     if (institute_project_id)
//       whereClause.institute_project_id = institute_project_id;
//     if (status) whereClause.status = status;
//     if (priority_id) whereClause.priority_id = priority_id;
//     if (issue_category_id) whereClause.issue_category_id = issue_category_id;
//     if (assigned_to) whereClause.assigned_to = assigned_to;
//     if (reported_by) whereClause.reported_by = reported_by;

//     // -------------------------------------------------------------
//     //    🔥 NEW LOGIC: return issues assigned to handler's tier
//     // -------------------------------------------------------------
//     const user = req.user;

//     if (!reported_by) {
//       // If user is NOT asking for their own created issues
//       // then return issues assigned to their hierarchy node
//       if (user.hierarchy_node_id) {
//         whereClause.hierarchy_node_id = user.hierarchy_node_id;
//       }
//     }
//     // --------------------------------------------------------------

//     const issues = await Issue.findAll({
//       where: whereClause,
//       include: [
//         { model: InstituteProject, as: "instituteProject" },
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

// Recursive function to get all child hierarchy nodes
async function getDescendantNodes(nodeId) {
  const children = await HierarchyNode.findAll({
    where: { parent_id: nodeId },
    attributes: ["hierarchy_node_id"],
  });

  let result = children.map((c) => c.hierarchy_node_id);

  for (const child of children) {
    const subChildren = await getDescendantNodes(child.hierarchy_node_id);
    result = result.concat(subChildren);
  }

  return result;
}

const getIssues = async (req, res) => {
  try {
    const {
      institute_project_id,
      status,
      priority_id,
      issue_category_id,
      assigned_to,
      reported_by,
    } = req.query;

    const whereClause = {};

    // Apply normal filters
    if (institute_project_id)
      whereClause.institute_project_id = institute_project_id;
    if (status) whereClause.status = status;
    if (priority_id) whereClause.priority_id = priority_id;
    if (issue_category_id) whereClause.issue_category_id = issue_category_id;
    if (assigned_to) whereClause.assigned_to = assigned_to;
    if (reported_by) whereClause.reported_by = reported_by;

    const user = req.user?.user_id;

    // -------------------------------------------------------------
    //  🔥 NEW LOGIC: multi-level hierarchy visibility
    // -------------------------------------------------------------
    if (!reported_by) {
      if (user.hierarchy_node_id) {
        const myNode = user.hierarchy_node_id;

        // 1. Get all descendants recursively
        const descendants = await getDescendantNodes(myNode);

        // 2. Include the user's own node too
        const allowedNodes = [myNode, ...descendants];

        whereClause.hierarchy_node_id = { [Op.in]: allowedNodes };
      }
    }
    // --------------------------------------------------------------

    const issues = await Issue.findAll({
      where: whereClause,
      include: [
        { model: InstituteProject, as: "instituteProject" },
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

const issueIncludes = [
  { model: InstituteProject, as: "instituteProject" },
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
];
const getMyCreatedIssues = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const issues = await Issue.findAll({
      where: {
        reported_by: userId,
      },
      include: issueIncludes,
      order: [["created_at", "DESC"]],
    });

    res.status(200).json(issues);
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
const getMyAssignedIssues = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const issues = await Issue.findAll({
      where: { assigned_to: userId },
      include: issueIncludes,
      order: [["created_at", "DESC"]],
    });

    res.status(200).json(issues);
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
const getIssuesByHierarchy = async (req, res) => {
  try {
    const nodeId = req.params.node_id;

    // 1. Get descendants (recursive)
    const childNodes = await getDescendantNodes(nodeId);

    // 2. Include parent + children
    const allowedNodes = [nodeId, ...childNodes];

    const issues = await Issue.findAll({
      where: {
        hierarchy_node_id: { [Op.in]: allowedNodes },
      },
      include: issueIncludes,
      order: [["created_at", "DESC"]],
    });

    res.status(200).json(issues);
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  getIssues,
  escalateIssue,
  resolveIssue,
  acceptIssue,
  getIssuesByHierarchy,
  getMyAssignedIssues,
  getMyCreatedIssues,
};
