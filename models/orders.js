'use strict';
const {
  Model
} = require('sequelize');
const users = require('./users');
const adresses = require('./adresses');
const prescriptions = require('./prescriptions');
const confirmations = require('./confirmations');
const order_products = require('./order_products');
module.exports = (sequelize, DataTypes) => {
  class orders extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(db) {
      this.hasMany(db.prescriptions, { 
        foreignKey: 'orders_fk',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE', 
        hooks: true
      });
      this.hasMany(db.order_products, { 
        foreignKey: 'orders_fk',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE', 
        hooks: true
      });
      this.hasOne(db.confirmations, { 
        foreignKey: 'orders_fk',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE', 
        hooks: true
      });
      this.belongsTo(db.users, { 
        foreignKey: 'users_fk',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      });
      this.belongsTo(db.adresses, { 
        foreignKey: 'adresses_fk',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      });
    }
  }
  orders.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    price: DataTypes.DECIMAL,
    state: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    users_fk: DataTypes.INTEGER,
    adresses_fk: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'orders',
  });
  return orders;
};