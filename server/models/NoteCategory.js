const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const NoteCategory = sequelize.define('NoteCategory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  }
}, {
  timestamps: false, 
});

module.exports = NoteCategory;
