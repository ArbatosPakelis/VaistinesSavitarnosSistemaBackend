'use strict';
const {
  Model
} = require('sequelize');
const users = require('./users');
module.exports = (sequelize, DataTypes) => {
  class user_types extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(db) {
      this.hasMany(db.users, { 
        foreignKey: 'user_types_fk',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE', 
        hooks: true
      });
    }
  }
  user_types.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    type: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'user_types',
  });
  return user_types;
};