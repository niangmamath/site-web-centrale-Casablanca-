const express = require('express');
const router = express.Router();
const Section = require('../../models/section');

// GET all sections
router.get('/', async (req, res) => {
  try {
    const sections = await Section.find().sort({ page: 1 });
    res.render('admin/sections/index', { sections });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET form to add a new section
router.get('/add', (req, res) => {
  res.render('admin/sections/add');
});

// POST a new section
router.post('/add', async (req, res) => {
  try {
    const { title, content, page } = req.body;
    const newSection = new Section({ title, content, page });
    await newSection.save();
    res.redirect('/admin/sections');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET form to edit a section
router.get('/edit/:id', async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    res.render('admin/sections/edit', { section });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// PUT (update) a section
router.put('/edit/:id', async (req, res) => {
  try {
    const { title, content, page } = req.body;
    await Section.findByIdAndUpdate(req.params.id, { title, content, page });
    res.redirect('/admin/sections');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// DELETE a section
router.delete('/delete/:id', async (req, res) => {
  try {
    await Section.findByIdAndDelete(req.params.id);
    res.redirect('/admin/sections');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
