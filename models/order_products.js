'use strict';
const {
  Model
} = require('sequelize');
const orders = require('./orders');
const product_cards = require('./product_cards');
const remaining_goods = require('./remaining_goods');
module.exports = (sequelize, DataTypes) => {
  class order_products extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(db) {
      this.belongsTo(db.orders, { 
        foreignKey: 'orders_fk',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      });
      this.belongsTo(db.product_cards, {
        foreignKey: 'product_cards_fk',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      });
      this.belongsTo(db.remaining_goods, {
        foreignKey: 'remaining_goods_fk',
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE'
      });
    }
  }
  order_products.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    amount: DataTypes.INTEGER,
    price: DataTypes.DECIMAL(10,2),
    discount: DataTypes.INTEGER,
    orders_fk: DataTypes.INTEGER,
    product_cards_fk: DataTypes.INTEGER,
    remaining_goods_fk: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'order_products',
  });
  return order_products;
};