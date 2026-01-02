const {
  IssueReRaise,
  ReRaiseAttachment,
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
//  RE-RAISE ISSUE
// ------------------------------------------------------
const reRaiseIssue = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { issue_id, reason, re_raised_by, re_raised_at, attachment_ids } =
      req.body;

    // 1. Validate Issue
    const issue = await Issue.findByPk(issue_id);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found." });
    }

    // 2. Validate User
    const user = await User.findByPk(re_raised_by);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User (re_raised_by) not found." });
    }

    const re_raise_id = uuidv4();

    // 3. Create re-raise record
    await IssueReRaise.create(
      {
        re_raise_id,
        issue_id,
        reason,
        re_raised_by: user.user_id,
        re_raised_at: new Date(re_raised_at),
      },
      { transaction: t }
    );

    // 4. Attach files
    if (attachment_ids?.length > 0) {
      const links = attachment_ids.map((attachment_id) => ({
        re_raise_id,
        attachment_id,
        created_at: new Date(),
      }));

      await ReRaiseAttachment.bulkCreate(links, { transaction: t });
    }

    // 5. Update issue status to PENDING
    await Issue.update(
      {
        status: "re_raised",
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
          status: "pending",
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
        action_name: "Issue Re-Raised",
        action_description: "Issue re-raised and moved back to pending",
        performed_by: re_raised_by,
        related_tier: currentTier?.tier_level || null,
      },
      { transaction: t }
    );

    // 8. Create IssueHistory entry
    await IssueHistory.create(
      {
        history_id: uuidv4(),
        issue_id,
        user_id: re_raised_by,
        action: "re_raised",
        status_at_time: "re_raised",
        escalation_id: null,
        resolution_id: null,
        notes: `Issue re-raised. Reason: ${reason}`,
        created_at: new Date(),
      },
      { transaction: t }
    );

    // ==================================
    // 9. NOTIFY ISSUE RESOLVER AT REOPEND
    // ==================================
    try {
      await NotificationService.notifySolverOnReraise(
        {
          issue_id,
          creator_id: re_raised_by,
          raise_reason: reason,
        },
        t // Pass the existing transaction
      );
    } catch (notificationError) {
      console.warn(
        "Notification failed but continuing with re raise:",
        notificationError.message
      );
      // Don't fail the entire operation if notification fails
    }

    // COMMIT
    await t.commit();

    // Return full re-raise details
    const fullReRaise = await IssueReRaise.findOne({
      where: { re_raise_id },
      include: [
        { model: Issue, as: "issue" },
        { model: User, as: "re_raiser" },
        {
          model: ReRaiseAttachment,
          as: "attachments",
          include: [{ model: Attachment, as: "attachment" }],
        },
      ],
    });

    return res.status(201).json(fullReRaise);
  } catch (error) {
    console.error("RE-RAISE ERROR:", error);
    await t.rollback();
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ------------------------------------------------------
//  GET RE-RAISES BY ISSUE ID
// ------------------------------------------------------
const getReRaisesByIssueId = async (req, res) => {
  try {
    const { issue_id } = req.params;

    const data = await IssueReRaise.findAll({
      where: { issue_id },
      include: [
        { model: User, as: "re_raiser" },
        {
          model: ReRaiseAttachment,
          as: "attachments",
          include: [{ model: Attachment, as: "attachment" }],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json(data);
  } catch (error) {
    console.error("RE-RAISE FETCH ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ------------------------------------------------------
//  GET RE-RAISE BY ID
// ------------------------------------------------------
const getReRaiseById = async (req, res) => {
  try {
    const { re_raise_id } = req.params;

    const data = await IssueReRaise.findOne({
      where: { re_raise_id },
      include: [
        { model: Issue, as: "issue" },
        { model: User, as: "re_raiser" },
        {
          model: ReRaiseAttachment,
          as: "attachments",
          include: [{ model: Attachment, as: "attachment" }],
        },
      ],
    });

    if (!data) return res.status(404).json({ message: "Re-raise not found" });

    return res.status(200).json(data);
  } catch (error) {
    console.error("GET RE-RAISE ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ------------------------------------------------------
//  DELETE RE-RAISE
// ------------------------------------------------------
const deleteReRaise = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { re_raise_id } = req.params;

    const reRaise = await IssueReRaise.findByPk(re_raise_id);
    if (!reRaise)
      return res.status(404).json({ message: "Re-raise not found" });

    const issue_id = reRaise.issue_id;

    await IssueReRaise.destroy({
      where: { re_raise_id },
      transaction: t,
    });

    // Optional: revert issue back to resolved if no other re-raises
    const hasOtherReRaises = await IssueReRaise.findOne({
      where: { issue_id },
      transaction: t,
    });

    if (!hasOtherReRaises) {
      await Issue.update(
        {
          status: "resolved",
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
    console.error("DELETE RE-RAISE ERROR:", error);
    await t.rollback();
    return res.status(500).json({ message: error.message });
  }
};

// ------------------------------------------------------
//  GET LATEST RE-RAISE BY ISSUE ID
// ------------------------------------------------------
const getLatestReRaiseByIssueId = async (req, res) => {
  try {
    const { issue_id } = req.params;

    const data = await IssueReRaise.findOne({
      where: { issue_id },
      include: [
        { model: User, as: "re_raiser" },
        {
          model: ReRaiseAttachment,
          as: "attachments",
          include: [{ model: Attachment, as: "attachment" }],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    if (!data)
      return res
        .status(404)
        .json({ message: "No re-raise found for this issue" });

    return res.status(200).json(data);
  } catch (error) {
    console.error("GET LATEST RE-RAISE ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ------------------------------------------------------
module.exports = {
  reRaiseIssue,
  getReRaisesByIssueId,
  getReRaiseById,
  deleteReRaise,
  getLatestReRaiseByIssueId,
};
