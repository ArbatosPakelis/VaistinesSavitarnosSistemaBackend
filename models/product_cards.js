'use strict';
const {
  Model
} = require('sequelize');
const order_products = require('./order_products');
const remaining_goods = require('./remaining_goods');
module.exports = (sequelize, DataTypes) => {
  class product_cards extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(db) {
      this.hasMany(db.order_products, { 
        foreignKey: 'product_cards_fk',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE', 
        hooks: true
      });
      this.hasMany(db.remaining_goods, { 
        foreignKey: 'product_cards_fk',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE', 
        hooks: true
      });
    }
  }
  product_cards.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    name: DataTypes.STRING,
    manufacturer: DataTypes.STRING,
    dosage_form: DataTypes.STRING,
    product_type: DataTypes.STRING,
    packaging: DataTypes.STRING,
    minimal_age: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'product_cards',
  });
  return product_cards;
};