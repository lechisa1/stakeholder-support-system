"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Institute extends Model {
    static associate(models) {
      // Many-to-Many relationship with Project through InstituteProject
      this.belongsToMany(models.Project, {
        through: models.InstituteProject,
        foreignKey: "institute_id",
        otherKey: "project_id",
        as: "projects",
      });
      // One-to-Many relationship with InstituteAttachment
      this.hasMany(models.InstituteAttachment, {
        foreignKey: "institute_id",
        as: "attachments",
      });
    }
    // Virtual getter for logo
    getLogo() {
      const attachments = this.attachments || [];
      const logo = attachments.find((att) => att.file_type === "logo");
      return logo ? logo.file_name : null;
    }
  }

  Institute.init(
    {
      institute_id: {
        type: DataTypes.UUIDV4,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      // name: {
      //   type: DataTypes.JSON,
      //   allowNull: false,
      //   comment: "Localized names JSON: { en: 'Name', am: 'እትም', fr: 'Nom' }",
      //   unique: false,
      //   get() {
      //     const raw = this.getDataValue("name");
      //     return raw;
      //   },
      //   set(value) {
      //     if (typeof value === "string") {
      //       this.setDataValue("name", { en: value });
      //     } else if (typeof value === "object" && value !== null) {
      //       // unwrap nested 'en'
      //       let nameValue = value;
      //       while (nameValue.en && typeof nameValue.en === "object") {
      //         nameValue = nameValue.en;
      //       }
      //       this.setDataValue("name", { en: nameValue.en || nameValue });
      //     } else {
      //       this.setDataValue("name", value);
      //     }
      //   },
      // },

      name: {
        type: DataTypes.CHAR(255),
        allowNull: false,
        unique: false,
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      // Virtual field to expose logo URL or file_name
      logo: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.getLogo();
        },
        set(value) {
          throw new Error("Do not try to set the `logo` value directly.");
        },
      },
    },
    {
      sequelize,
      modelName: "Institute",
      tableName: "institutes",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      paranoid: true, // Enables soft delete
    }
  );

  return Institute;
};
