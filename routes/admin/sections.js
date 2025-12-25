const express = require('express');
const router = express.Router();
const Section = require('../../models/section');
const asyncHandler = require('../../utils/asyncHandler');

// List all sections
router.get('/', asyncHandler(async (req, res) => {
  const items = await Section.find();
  res.render('admin/sections/index', {
    items,
    csrfToken: req.csrfToken(),
    title: 'Gérer les Sections',
    layout: './admin/layout',
    routePath: 'sections'
  });
}));

// Display form to add a new section
router.get('/add', (req, res) => {
  res.render('admin/sections/add', {
    csrfToken: req.csrfToken(),
    title: 'Ajouter une Section',
    layout: './admin/layout',
    tinymceApiKey: process.env.TINYMCE_API_KEY // Correction: Ajout de la clé API
  });
});

// Handle adding a new section
router.post('/add', asyncHandler(async (req, res) => {
  const { title, content, page } = req.body;
  const newSection = new Section({ title, content, page });
  await newSection.save();
  res.redirect(`${res.locals.adminPath}/sections`);
}));

// Display form to edit a section
router.get('/edit/:id', asyncHandler(async (req, res) => {
  const section = await Section.findById(req.params.id);
  res.render('admin/sections/edit', {
    section,
    csrfToken: req.csrfToken(),
    title: 'Modifier la Section',
    layout: './admin/layout',
    tinymceApiKey: process.env.TINYMCE_API_KEY // Correction: Ajout de la clé API
  });
}));

// Handle editing a section
router.put('/edit/:id', asyncHandler(async (req, res) => {
  const { title, content, page } = req.body;
  await Section.findByIdAndUpdate(req.params.id, { title, content, page });
  res.redirect(`${res.locals.adminPath}/sections`);
}));

// Handle deleting a section
router.delete('/delete/:id', asyncHandler(async (req, res) => {
  await Section.findByIdAndDelete(req.params.id);
  res.redirect(`${res.locals.adminPath}/sections`);
}));

module.exports = router;
