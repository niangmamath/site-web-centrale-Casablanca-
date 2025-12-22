const express = require('express');
const multer = require('multer');
const streamifier = require('streamifier');
const csurf = require('csurf');
const cloudinary = require('../config/cloudinary');
const asyncHandler = require('../utils/asyncHandler');

const csrfProtection = csurf({ cookie: true });
const upload = multer({ storage: multer.memoryStorage() });

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

  const addCsrfTokenToLocals = (req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
  };

  const singularName = viewPath.slice(0, -1);

  router.get('/', csrfProtection, addCsrfTokenToLocals, asyncHandler(async (req, res) => {
    const items = await Model.find().sort({ createdAt: -1 });
    res.render(`admin/${viewPath}/index`, { 
      items, 
      title: `Gérer ${routePath}`,
      routePath: routePath,
      layout: './admin/layout'
    });
  }));

  const renderAddForm = (req, res) => {
    const action = `${res.locals.adminPath}/${routePath}/add`;
    const renderData = {
      title: `Ajouter un ${singularName}`,
      action,
      tinymceApiKey: process.env.TINYMCE_API_KEY, // CORRIGÉ : Assurer que la clé est passée
      layout: './admin/layout'
    };
    renderData[singularName] = {};
    res.render(`admin/${viewPath}/add`, renderData);
  };

  router.get('/add', csrfProtection, addCsrfTokenToLocals, renderAddForm);
  router.get('/new', csrfProtection, addCsrfTokenToLocals, renderAddForm);

  router.get('/edit/:id', csrfProtection, addCsrfTokenToLocals, asyncHandler(async (req, res) => {
    const item = await Model.findById(req.params.id);
    const action = `${res.locals.adminPath}/${routePath}/edit/${item._id}?_method=PUT`;
    const renderData = {
      title: `Modifier un ${singularName}`,
      action,
      tinymceApiKey: process.env.TINYMCE_API_KEY, // CORRIGÉ : Assurer que la clé est passée
      layout: './admin/layout'
    };
    renderData[singularName] = item;
    res.render(`admin/${viewPath}/edit`, renderData);
  }));

  const uploadMiddleware = uploadOptions ? upload.single(uploadOptions.fieldName) : (req, res, next) => next();
  const postMiddlewares = [uploadMiddleware, csrfProtection];

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

  router.delete('/delete/:id', csrfProtection, asyncHandler(async (req, res) => {
    await Model.findByIdAndDelete(req.params.id);
    res.redirect(`${res.locals.adminPath}/${routePath}`);
  }));

  return router;
};

module.exports = { createCrudRouter };
