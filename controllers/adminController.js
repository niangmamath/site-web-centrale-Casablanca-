const express = require('express');
const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');
const asyncHandler = require('../utils/asyncHandler');

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream({ folder }, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

const createCrudRouter = (Model, { viewPath, routePath, fields, uploadOptions }) => {
  const router = express.Router();

  const singularName = viewPath.slice(0, -1);

  router.get('/', asyncHandler(async (req, res) => {
    const items = await Model.find().sort({ createdAt: -1 });
    res.render(`admin/${viewPath}/index`, { 
      items, 
      title: `Gérer ${routePath}`,
      routePath: routePath,
      layout: './admin/layout',
      csrfToken: req.csrfToken() // FIX: Pass CSRF token for delete forms
    });
  }));

  const renderAddForm = (req, res) => {
    const item = {};
    const viewData = {
      title: `Ajouter un ${singularName}`,
      action: `${res.locals.adminPath}/${routePath}/add`,
      tinymceApiKey: process.env.TINYMCE_API_KEY,
      csrfToken: req.csrfToken(),
      layout: './admin/layout'
    };
    viewData[singularName] = item; // Use dynamic key for consistency
    viewData['item'] = item; // Keep for backward compatibility
    res.render(`admin/${viewPath}/add`, viewData);
  };

  router.get('/add', renderAddForm);
  router.get('/new', renderAddForm);

  router.get('/edit/:id', asyncHandler(async (req, res) => {
    const item = await Model.findById(req.params.id);
    const viewData = {
      title: `Modifier un ${singularName}`,
      action: `${res.locals.adminPath}/${routePath}/edit/${item._id}?_method=PUT`,
      tinymceApiKey: process.env.TINYMCE_API_KEY,
      csrfToken: req.csrfToken(),
      layout: './admin/layout'
    };
    viewData[singularName] = item; // FIX: Pass item with dynamic key (e.g., 'post', 'event')
    viewData['item'] = item; // Keep for backward compatibility
    res.render(`admin/${viewPath}/edit`, viewData);
  }));

  const uploadMiddleware = uploadOptions ? upload.single(uploadOptions.fieldName) : (req, res, next) => next();
  const postMiddlewares = [uploadMiddleware];

  const createItemHandler = asyncHandler(async (req, res) => {
    const newItem = new Model();
    for (const field of fields) {
      if (req.body[field] !== undefined) {
        newItem[field] = req.body[field];
      }
    }

    if (uploadOptions && req.file) {
      const { folder, dbImageFieldName } = uploadOptions;
      const result = await uploadToCloudinary(req.file.buffer, folder);
      newItem[dbImageFieldName] = result.secure_url;
    }

    await newItem.save();
    res.redirect(`${res.locals.adminPath}/${routePath}`);
  });

  router.post('/add', postMiddlewares, createItemHandler);
  router.post('/new', postMiddlewares, createItemHandler);

  router.put('/edit/:id', postMiddlewares, asyncHandler(async (req, res) => {
    const item = await Model.findById(req.params.id);
    if (!item) return res.status(404).send('Not found');

    for (const field of fields) {
      if (req.body[field] !== undefined) {
        item[field] = req.body[field];
      }
    }

    if (uploadOptions && req.file) {
      const { folder, dbImageFieldName } = uploadOptions;
      const result = await uploadToCloudinary(req.file.buffer, folder);
      item[dbImageFieldName] = result.secure_url;
    } 

    await item.save();
    res.redirect(`${res.locals.adminPath}/${routePath}`);
  }));

  router.delete('/delete/:id', asyncHandler(async (req, res) => {
    await Model.findByIdAndDelete(req.params.id);
    res.redirect(`${res.locals.adminPath}/${routePath}`);
  }));

  return router;
};

module.exports = { createCrudRouter };