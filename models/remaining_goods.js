'use strict';
const {
  Model
} = require('sequelize');
const adresses = require('./adresses');
const order_products = require('./order_products');
const product_cards = require('./product_cards');
module.exports = (sequelize, DataTypes) => {
  class remaining_goods extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(db) {
      this.hasMany(db.order_products, { 
        foreignKey: 'remaining_goods_fk',
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE', 
        hooks: true
      });
      this.belongsTo(db.product_cards, { 
        foreignKey: 'product_cards_fk',
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
  remaining_goods.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    amount: DataTypes.INTEGER,
    price: DataTypes.DECIMAL(10,2),
    shortage_point: DataTypes.INTEGER,
    product_cards_fk: DataTypes.INTEGER,
    adresses_fk: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'remaining_goods',
  });
  return remaining_goods;
};