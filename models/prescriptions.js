'use strict';
const {
  Model
} = require('sequelize');
const orders = require('./orders');
module.exports = (sequelize, DataTypes) => {
  class prescriptions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(db) {
      this.belongsTo(db.orders, {
        foreignKey: 'orders_fk',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }
  prescriptions.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    medicine_name: DataTypes.STRING,
    orders_fk: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'prescriptions',
  });
  return prescriptions;
};