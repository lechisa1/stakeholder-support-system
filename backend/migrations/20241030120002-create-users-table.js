"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      user_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      full_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      phone_number: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      user_type_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "user_types",
          key: "user_type_id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      institute_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "institutes",
          key: "institute_id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL ",
      },
      hierarchy_node_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "hierarchy_nodes",
          key: "hierarchy_node_id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      internal_node_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "internal_nodes",
          key: "internal_node_id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      user_position_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "user_positions",
          key: "user_position_id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      position: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      profile_image: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      is_first_logged_in: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      last_login_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      password_changed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("users");
  },
};
