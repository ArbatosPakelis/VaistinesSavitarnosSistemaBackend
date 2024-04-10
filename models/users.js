'use strict';
const {
  Model
} = require('sequelize');
const user_types = require('./user_types');
const confirmations = require('./confirmations');
const adresses = require('./adresses');
const orders = require('./orders');
module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(db) {
      this.hasMany(db.confirmations, { 
        foreignKey: 'users_fk',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE', 
        hooks: true
      });
      this.hasMany(db.orders, {
        foreignKey: 'users_fk',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE', 
        hooks: true
      });
      this.belongsTo(db.user_types, { 
        foreignKey: 'user_types_fk',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      });
      this.belongsTo(db.adresses, { 
        foreignKey: 'adresses_fk',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      });
    }
  }
  users.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    username: DataTypes.STRING,
    password: DataTypes.TEXT,
    email: DataTypes.STRING,
    status: DataTypes.STRING,
    ForceRelogin: DataTypes.BOOLEAN,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    user_types_fk: DataTypes.INTEGER,
    adresses_fk: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'users',
  });
  return users;
};