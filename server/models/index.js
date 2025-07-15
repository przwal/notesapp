const User = require('./User');
const Note = require('./Note');
const Category = require('./Category');
const NoteCategory = require('./NoteCategory');

// Associations
User.hasMany(Note, { foreignKey: 'userId' });
Note.belongsTo(User, { foreignKey: 'userId' });

Note.belongsToMany(Category, { through: NoteCategory, foreignKey: 'noteId' });
Category.belongsToMany(Note, { through: NoteCategory, foreignKey: 'categoryId' });

Category.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Category, { foreignKey: 'userId' });

module.exports = {
  User,
  Note,
  Category,
  NoteCategory,
};
