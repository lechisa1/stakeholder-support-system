const {
  IssueEscalation,
  Issue,
  User,
  IssueTier,
  Attachment,
  IssueHistory,
  EscalationAttachment,
  IssueEscalationHistory,
  IssueAction,
  sequelize,
} = require("../../models");

const { v4: uuidv4 } = require("uuid");

// ------------------------------------------------------
//  ESCALATE ISSUE
// ------------------------------------------------------
const escalateIssue = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      issue_id,
      from_tier,
      to_tier,
      reason,
      escalated_by,
      attachment_ids,
    } = req.body;

    // 1. Validate Issue
    const issue = await Issue.findByPk(issue_id);
    if (!issue) return res.status(404).json({ message: "Issue not found." });

    // 2. Validate User
    const escalator = await User.findByPk(escalated_by);
    if (!escalator)
      return res
        .status(404)
        .json({ message: "User (escalated_by) not found." });

    const escalation_id = uuidv4();

    // 3. Create escalation
    await IssueEscalation.create(
      {
        escalation_id,
        issue_id,
        from_tier,
        to_tier,
        reason,
        escalated_by,
        escalated_at: new Date(),
      },
      { transaction: t }
    );

    // 4. Attach files
    if (attachment_ids?.length > 0) {
      const links = attachment_ids.map((attachment_id) => ({
        escalation_id,
        attachment_id,
        created_at: new Date(),
      }));

      await EscalationAttachment.bulkCreate(links, { transaction: t });
    }

    // 6. Create tier entry (for new tier assignment)
    await IssueTier.create(
      {
        issue_tier_id: uuidv4(),
        issue_id,
        tier_level: to_tier,
        handler_id: null,
        assigned_at: new Date(),
        status: "pending",
        remarks: `Escalated from ${from_tier}`,
      },
      { transaction: t }
    );

    // 7. Log Action
    await IssueAction.create(
      {
        action_id: uuidv4(),
        issue_id,
        action_name: "Issue Escalated",
        action_description: `Escalated from ${from_tier} to ${to_tier}`,
        performed_by: escalated_by,
        related_tier: from_tier,
      },
      { transaction: t }
    );

    // ==================================
    // 8. CREATE IssueHistory ENTRY (NEW)
    // ==================================
    await IssueHistory.create(
      {
        history_id: uuidv4(),
        issue_id: issue_id,
        user_id: escalated_by,
        action: "pending",
        status_at_time: issue.status, // Issue status doesn't change here
        escalation_id: escalation_id,
        resolution_id: null,
        notes: `Escalated from tier ${from_tier} to tier ${to_tier}. Reason: ${reason}`,
        created_at: new Date(),
      },
      { transaction: t }
    );

    // 9 update issue status
    // Update issue status to 'in_progress'
    const oldStatus = issue.status;
    issue.status = "pending"; // <--- status update
    await issue.save({ transaction: t });

    // COMMIT ALL
    await t.commit();

    // Return escalation with details
    const fullEscalation = await IssueEscalation.findOne({
      where: { escalation_id },
      include: [
        { model: Issue, as: "issue" },
        { model: User, as: "escalator" },
        {
          model: EscalationAttachment,
          as: "attachments",
          include: [{ model: Attachment, as: "attachment" }],
        },
      ],
    });

    return res.status(201).json(fullEscalation);
  } catch (error) {
    console.error("ESCALATION ERROR:", error);
    await t.rollback();
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// ------------------------------------------------------
//  GET ESCALATIONS BY ISSUE ID
// ------------------------------------------------------
const getEscalationsByIssueId = async (req, res) => {
  try {
    const { issue_id } = req.params;

    const data = await IssueEscalation.findAll({
      where: { issue_id },
      include: [
        { model: User, as: "escalator" },
        {
          model: EscalationAttachment,
          as: "attachments",
          include: [{ model: Attachment, as: "attachment" }],
        },
      ],
      order: [["escalated_at", "DESC"]],
    });

    return res.status(200).json(data);
  } catch (error) {
    console.error("ESCALATION FETCH ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ------------------------------------------------------
//  GET ESCALATION HISTORY BY ISSUE ID
// ------------------------------------------------------
const getEscalationHistoryByIssueId = async (req, res) => {
  try {
    const { issue_id } = req.params;

    const history = await IssueEscalationHistory.findAll({
      where: { issue_id },
      include: [
        { model: User, as: "escalator" },
        { model: Issue, as: "issue" },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json(history);
  } catch (error) {
    console.error("ESCALATION HISTORY ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ------------------------------------------------------
//  GET ESCALATION BY ID
// ------------------------------------------------------
const getEscalationById = async (req, res) => {
  try {
    const { escalation_id } = req.params;

    const escalation = await IssueEscalation.findOne({
      where: { escalation_id },
      include: [
        { model: Issue, as: "issue" },
        { model: User, as: "escalator" },
        {
          model: EscalationAttachment,
          as: "attachments",
          include: [{ model: Attachment, as: "attachment" }],
        },
      ],
    });

    if (!escalation)
      return res.status(404).json({ message: "Escalation not found" });

    return res.status(200).json(escalation);
  } catch (error) {
    console.error("GET ESCALATION ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ------------------------------------------------------
//  DELETE ESCALATION
// ------------------------------------------------------
const deleteEscalation = async (req, res) => {
  try {
    const { escalation_id } = req.params;

    const escalation = await IssueEscalation.findByPk(escalation_id);
    if (!escalation)
      return res.status(404).json({ message: "Escalation not found" });

    await IssueEscalation.destroy({ where: { escalation_id } });

    return res.status(204).send();
  } catch (error) {
    console.error("DELETE ESCALATION ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ------------------------------------------------------
module.exports = {
  escalateIssue,
  getEscalationsByIssueId,
  getEscalationHistoryByIssueId,
  getEscalationById,
  deleteEscalation,
};
