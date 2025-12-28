const { v4: uuidv4, validate: uuidValidate } = require("uuid");
const { IssueCategory } = require("../models");
const { categorySchema } = require("../validators/issueCategoryValidator");
const { Op } = require("sequelize");

exports.createCategory = async (req, res) => {
  try {
    // Validate input using Joi schema
    const { error, value } = categorySchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((d) => d.message),
      });
    }

    // Prevent duplicates
    const exists = await IssueCategory.findOne({
      where: { name: value.name.trim() },
    });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Category name already exists",
      });
    }

    // Create category
    const category = await IssueCategory.create({
      category_id: uuidv4(),
      name: value.name.trim(),
      description: value.description?.trim() || null,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (err) {
    console.error("Create Category Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const {
      is_active,
      search, // optional: for name/email search
      page = 1,
      pageSize = 10,
    } = req.query;

    // ====== Build filters dynamically ======
    const whereClause = {};

    if (is_active !== undefined) whereClause.is_active = is_active === "true";

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    // ====== Calculate pagination ======
    const pageNum = parseInt(page);
    const limit = parseInt(pageSize);
    const offset = (pageNum - 1) * limit;

    // ====== Fetch total count ======
    const total = await IssueCategory.count({ where: whereClause });

    const categories = await IssueCategory.findAll({
      where: whereClause,
      order: [["created_at", "DESC"]],
      limit: limit,
      offset: offset,
    });

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully.",
      data: categories,
      meta: {
        page: pageNum,
        pageSize: limit,
        total: total,
        totalPages: totalPages,
      },
    });
  } catch (err) {
    console.error("Get All Categories Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate UUID
    if (!uuidValidate(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category ID format" });
    }

    const category = await IssueCategory.findOne({
      where: { category_id: id },
    });
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res.status(200).json({ success: true, data: category });
  } catch (err) {
    console.error("Get Category By ID Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate UUID
    if (!uuidValidate(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category ID format" });
    }

    // Validate input
    const { error, value } = categorySchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((d) => d.message),
      });
    }

    const category = await IssueCategory.findOne({
      where: { category_id: id },
    });
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // Check if new name conflicts with another category
    if (value.name && value.name.trim() !== category.name) {
      const duplicate = await IssueCategory.findOne({
        where: { name: value.name.trim() },
      });
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Another category with this name already exists",
        });
      }
    }

    // Perform update
    await category.update({
      name: value.name.trim(),
      description: value.description?.trim() || null,
      updated_at: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (err) {
    console.error("Update Category Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate UUID
    if (!uuidValidate(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category ID format" });
    }

    const category = await IssueCategory.findOne({
      where: { category_id: id },
    });
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    await category.destroy();

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (err) {
    console.error("Delete Category Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};
