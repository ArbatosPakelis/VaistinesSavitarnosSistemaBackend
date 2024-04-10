'use strict';
const {
  Model
} = require('sequelize');
const adresses = require('./adresses');
module.exports = (sequelize, DataTypes) => {
  class automatic_medicine_storages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(db) {
      this.belongsTo(db.adresses, { 
        foreignKey: 'adresses_fk',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
    });
    }
  }
  automatic_medicine_storages.init({
    status: DataTypes.STRING
  }, {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
      adresses_fk: DataTypes.INTEGER
    },
    sequelize,
    modelName: 'automatic_medicine_storages',
  });
  return automatic_medicine_storages;
};