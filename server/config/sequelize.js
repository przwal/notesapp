const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('notesapp', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false, 
});

module.exports = sequelize;
