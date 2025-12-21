const express = require('express');
const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');

// Configure Multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Uploads a file buffer to Cloudinary.
 * @param {Buffer} fileBuffer - The buffer of the file to upload.
 * @param {string} folder - The folder in Cloudinary to store the file.
 * @returns {Promise<object>} A promise that resolves with the Cloudinary upload result.
 */
const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

/**
 * Creates a generic CRUD router for a Mongoose model.
 * @param {mongoose.Model} Model - The Mongoose model to create the router for.
 * @param {object} options - Configuration options for the router.
 * @param {string} options.viewPath - The path to the EJS views directory (e.g., 'posts').
 * @param {string} options.routePath - The base path for the routes (e.g., 'posts').
 * @param {string[]} options.fields - The fields of the model to be managed by the form.
 * @param {object} [options.uploadOptions] - Optional configuration for file uploads.
 * @param {string} options.uploadOptions.fieldName - The name of the file input field.
 * @param {string} options.uploadOptions.folder - The Cloudinary folder for uploads.
 * @returns {express.Router} An Express router with complete CRUD functionality.
 */
const createCrudRouter = (Model, { viewPath, routePath, fields, uploadOptions }) => {
  const router = express.Router();

  // List all items
  router.get('/', async (req, res) => {
    try {
      const items = await Model.find().sort({ createdAt: -1 });
      res.render(`admin/${viewPath}/index`, { items, title: `Gérer ${routePath}` });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });

  // Display add form
  router.get('/add', (req, res) => {
    res.render(`admin/${viewPath}/add`, { tinymceApiKey: process.env.TINYMCE_API_KEY, title: `Ajouter un ${routePath.slice(0, -1)}` });
  });

  // Add a new item
  const addMiddleware = uploadOptions ? upload.single(uploadOptions.fieldName) : (req, res, next) => next();
  router.post('/add', addMiddleware, async (req, res) => {
    try {
      const newItem = new Model();
      for (const field of fields) {
        newItem[field] = req.body[field];
      }

      if (uploadOptions && req.file) {
        const result = await uploadToCloudinary(req.file.buffer, uploadOptions.folder);
        newItem[uploadOptions.fieldName] = result.secure_url;
      }

      await newItem.save();
      res.redirect(res.locals.adminPath + '/' + routePath);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });

  // Display edit form
  router.get('/edit/:id', async (req, res) => {
    try {
      const item = await Model.findById(req.params.id);
      res.render(`admin/${viewPath}/edit`, { item, tinymceApiKey: process.env.TINYMCE_API_KEY, title: `Modifier un ${routePath.slice(0, -1)}` });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });

  // Edit an item
  const editMiddleware = uploadOptions ? upload.single(uploadOptions.fieldName) : (req, res, next) => next();
  router.put('/edit/:id', editMiddleware, async (req, res) => {
    try {
      const updates = {};
      for (const field of fields) {
        updates[field] = req.body[field];
      }

      if (uploadOptions && req.file) {
        const result = await uploadToCloudinary(req.file.buffer, uploadOptions.folder);
        updates[uploadOptions.fieldName] = result.secure_url;
      } else {
        const item = await Model.findById(req.params.id);
        if (uploadOptions && item[uploadOptions.fieldName]) {
            updates[uploadOptions.fieldName] = item[uploadOptions.fieldName];
        }
      }

      await Model.findByIdAndUpdate(req.params.id, updates);
      res.redirect(res.locals.adminPath + '/' + routePath);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });

  // Delete an item
  router.delete('/delete/:id', async (req, res) => {
    try {
      await Model.findByIdAndDelete(req.params.id);
      res.redirect(res.locals.adminPath + '/' + routePath);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });

  return router;
};

module.exports = { createCrudRouter };
