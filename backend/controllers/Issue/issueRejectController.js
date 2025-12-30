const {
  IssueReject,
  RejectAttachment,
  Issue,
  User,
  IssueHistory,
  IssueTier,
  Attachment,
  IssueAction,
  sequelize,
} = require("../../models");

const { v4: uuidv4 } = require("uuid");
const NotificationService = require("../../services/notificationService");

// ------------------------------------------------------
//  REJECT ISSUE
// ------------------------------------------------------
const rejectIssue = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { issue_id, reason, rejected_by, attachment_ids } = req.body;

    // 1. Validate Issue
    const issue = await Issue.findByPk(issue_id);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found." });
    }

    // 2. Validate User
    const user = await User.findByPk(rejected_by);
    if (!user) {
      return res.status(404).json({ message: "User (rejected_by) not found." });
    }

    const reject_id = uuidv4();

    // 3. Create reject record
    await IssueReject.create(
      {
        reject_id,
        issue_id,
        reason,
        rejected_by,
        rejected_at: new Date(),
      },
      { transaction: t }
    );

    // 4. Attach files
    if (attachment_ids?.length > 0) {
      const links = attachment_ids.map((attachment_id) => ({
        reject_id,
        attachment_id,
        created_at: new Date(),
      }));

      await RejectAttachment.bulkCreate(links, { transaction: t });
    }

    // 5. Update issue status to REJECTED
    await Issue.update(
      {
        status: "rejected",
        updated_at: new Date(),
      },
      {
        where: { issue_id },
        transaction: t,
      }
    );

    // 6. Update latest tier status
    const currentTier = await IssueTier.findOne({
      where: { issue_id },
      order: [["assigned_at", "DESC"]],
      transaction: t,
    });

    if (currentTier) {
      await IssueTier.update(
        {
          status: "rejected",
          updated_at: new Date(),
        },
        {
          where: { issue_tier_id: currentTier.issue_tier_id },
          transaction: t,
        }
      );
    }

    // 7. Log action
    await IssueAction.create(
      {
        action_id: uuidv4(),
        issue_id,
        action_name: "Issue Rejected",
        action_description: "Issue rejected and marked as rejected",
        performed_by: rejected_by,
        related_tier: currentTier?.tier_level || null,
      },
      { transaction: t }
    );

    // 8. Create IssueHistory entry
    await IssueHistory.create(
      {
        history_id: uuidv4(),
        issue_id,
        user_id: rejected_by,
        action: "rejected",
        status_at_time: "rejected",
        escalation_id: null,
        resolution_id: null,
        notes: `Issue rejected. Reason: ${reason}`,
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
          creator_id: rejected_by,
          is_confirmed: false,
          rejection_reason: reason,
        },
        t // Pass the existing transaction
      );
    } catch (notificationError) {
      console.warn("Notification to solver failed:", notificationError.message);
      // Don't fail the entire operation if notification fails
    }

    // COMMIT
    await t.commit();

    // Return full reject details
    const fullReject = await IssueReject.findOne({
      where: { reject_id },
      include: [
        { model: Issue, as: "issue" },
        { model: User, as: "rejector" },
        {
          model: RejectAttachment,
          as: "attachments",
          include: [{ model: Attachment, as: "attachment" }],
        },
      ],
    });

    return res.status(201).json(fullReject);
  } catch (error) {
    console.error("REJECT ISSUE ERROR:", error);
    await t.rollback();
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ------------------------------------------------------
//  GET REJECTS BY ISSUE ID
// ------------------------------------------------------
const getRejectsByIssueId = async (req, res) => {
  try {
    const { issue_id } = req.params;

    const data = await IssueReject.findAll({
      where: { issue_id },
      include: [
        { model: User, as: "rejector" },
        {
          model: RejectAttachment,
          as: "attachments",
          include: [{ model: Attachment, as: "attachment" }],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json(data);
  } catch (error) {
    console.error("REJECT FETCH ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ------------------------------------------------------
//  GET REJECT BY ID
// ------------------------------------------------------
const getRejectById = async (req, res) => {
  try {
    const { reject_id } = req.params;

    const data = await IssueReject.findOne({
      where: { reject_id },
      include: [
        { model: Issue, as: "issue" },
        { model: User, as: "rejector" },
        {
          model: RejectAttachment,
          as: "attachments",
          include: [{ model: Attachment, as: "attachment" }],
        },
      ],
    });

    if (!data) return res.status(404).json({ message: "Reject not found" });

    return res.status(200).json(data);
  } catch (error) {
    console.error("GET REJECT ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ------------------------------------------------------
//  DELETE REJECT
// ------------------------------------------------------
const deleteReject = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { reject_id } = req.params;

    const reject = await IssueReject.findByPk(reject_id);
    if (!reject) return res.status(404).json({ message: "Reject not found" });

    const issue_id = reject.issue_id;

    await IssueReject.destroy({
      where: { reject_id },
      transaction: t,
    });

    // Optional: revert issue back to previous status if needed
    const hasOtherRejects = await IssueReject.findOne({
      where: { issue_id },
      transaction: t,
    });

    if (!hasOtherRejects) {
      await Issue.update(
        {
          status: "pending",
          updated_at: new Date(),
        },
        {
          where: { issue_id },
          transaction: t,
        }
      );
    }

    await t.commit();
    return res.status(204).send();
  } catch (error) {
    console.error("DELETE REJECT ERROR:", error);
    await t.rollback();
    return res.status(500).json({ message: error.message });
  }
};

// ------------------------------------------------------
//  GET LATEST REJECT BY ISSUE ID
// ------------------------------------------------------
const getLatestRejectByIssueId = async (req, res) => {
  try {
    const { issue_id } = req.params;

    const data = await IssueReject.findOne({
      where: { issue_id },
      include: [
        { model: User, as: "rejector" },
        {
          model: RejectAttachment,
          as: "attachments",
          include: [{ model: Attachment, as: "attachment" }],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    if (!data)
      return res
        .status(404)
        .json({ message: "No reject found for this issue" });

    return res.status(200).json(data);
  } catch (error) {
    console.error("GET LATEST REJECT ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ------------------------------------------------------
module.exports = {
  rejectIssue,
  getRejectsByIssueId,
  getRejectById,
  deleteReject,
  getLatestRejectByIssueId,
};
