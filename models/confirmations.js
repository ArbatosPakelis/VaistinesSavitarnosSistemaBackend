'use strict';
const {
  Model
} = require('sequelize');
const users = require('./users');
const orders = require('./orders');
module.exports = (sequelize, DataTypes) => {
  class confirmations extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(db) {
      this.belongsTo(db.users, { 
        foreignKey: 'users_fk',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      });
      this.belongsTo(db.orders, { 
        foreignKey: 'orders_fk',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }
  confirmations.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
      users_fk: DataTypes.INTEGER,
      orders_fk: DataTypes.INTEGER
    },
    reason: DataTypes.STRING,
    createdAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'confirmations',
  });
  return confirmations;
};