'use strict';
const {
  Model
} = require('sequelize');
const automatic_medicine_storages = require('./automatic_medicine_storages');
const remaining_goods = require('./remaining_goods');
const orders = require('./orders');
const users = require('./users');
module.exports = (sequelize, DataTypes) => {
  class adresses extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(db) {
      this.hasMany(db.automatic_medicine_storages, {
        foreignKey: 'adresses_fk',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE', 
        hooks: true
      });
      this.hasMany(db.remaining_goods, { 
        foreignKey: 'adresses_fk',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE', 
        hooks: true
      });
      this.hasMany(db.orders, { 
        foreignKey: 'adresses_fk',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE', 
        hooks: true
      });
      this.hasMany(db.users, { 
        foreignKey: 'adresses_fk',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE', 
        hooks: true
      });
    }
  }
  adresses.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    street: DataTypes.STRING,
    country: DataTypes.STRING,
    city: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'adresses',
  });
  return adresses;
};