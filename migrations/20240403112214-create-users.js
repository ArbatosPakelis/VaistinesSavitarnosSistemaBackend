'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.TEXT
      },
      email: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      ForceRelogin: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: DataTypes.NOW
      },
      user_types_fk: {
        type: Sequelize.DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'user_types'
          },
          key: 'id'
        },
        allowNull: false,
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      adresses_fk: {
        type: Sequelize.DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'adresses'
          },
          key: 'id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};