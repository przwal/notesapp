const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const Category = require('../models/Category');
const NoteCategory = require('../models/NoteCategory');
const authMiddleware = require('../middleware/authMiddleware');


router.post('/notes', authMiddleware, async (req, res) => {
  try {
    const { title, content, categoryIds } = req.body;
    const userId = req.user.id;
    console.log('Received data:', { title, content, categoryIds});

    // input validation
    if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
      return res.status(400).json({ error: 'At least one categoryId is required.' });
    }

    // check if categories exist and belong to the user
    const categories = await Category.findAll({
      where: {
        id: categoryIds,
        userId,
      },
    });

    if (categories.length !== categoryIds.length) {
      return res.status(403).json({ error: 'Some categories are invalid or not owned by the user.' });
    }

    //create the note
    const note = await Note.create({ title, content, userId });

    // this is sequelize way to handle mtom relationships automatically
    await note.setCategories(categoryIds); 

    res.status(201).json({ message: 'Note created with categories.', note });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


router.get('/notes', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const offset = (page - 1) * limit;

    const { count, rows } = await Note.findAndCountAll({
      where: { userId },
      include: {
        model: Category,
        attributes: ['id', 'name'],
        through: { attributes: [] },
      },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      notes: rows,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalNotes: count,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




router.post('/category', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    const category = await Category.create({ name, userId });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}).get('/category', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const categories = await Category.findAll({ where: { userId } });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// GET single note by ID
router.get('/notes/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;

    const note = await Note.findOne({
      where: { id: noteId, userId },
      include: {
        model: Category,
        attributes: ['id', 'name'],
        through: { attributes: [] }
      },
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update note
router.put('/notes/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const { title, content, categoryIds } = req.body;

    const note = await Note.findOne({ where: { id: noteId, userId } });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Optional: Validate categoryIds and ownership again
    if (Array.isArray(categoryIds) && categoryIds.length > 0) {
      const categories = await Category.findAll({
        where: {
          id: categoryIds,
          userId,
        },
      });

      if (categories.length !== categoryIds.length) {
        return res.status(403).json({ error: 'Some categories are invalid or not owned by the user.' });
      }

      await note.setCategories(categoryIds); 
    }


    await note.update({ title, content });

    res.json({ message: 'Note updated', note });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE note
router.delete('/notes/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;

    const note = await Note.findOne({ where: { id: noteId, userId } });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    await note.setCategories([]); 
    await note.destroy();

    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
