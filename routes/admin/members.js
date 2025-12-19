const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../../config/cloudinary'); // Corrected path
const Member = require('../../models/member');
const streamifier = require('streamifier');

const upload = multer({ storage: multer.memoryStorage() });

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      { folder: 'team' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

// Admin: List all members
router.get('/', async (req, res) => {
  try {
    const members = await Member.find();
    res.render('admin/members/index', { members, title: 'Gérer l\'équipe' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Admin: Show form to add a new member
router.get('/add', (req, res) => {
  res.render('admin/members/add', { title: 'Ajouter un membre' });
});

// Admin: Handle adding a new member
router.post('/add', upload.single('image'), async (req, res) => {
  try {
    const { name, role, bio, linkedinUrl } = req.body;
    let imageUrl = '';
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    }
    const newMember = new Member({ name, role, bio, linkedinUrl, imageUrl });
    await newMember.save();
    res.redirect(`${res.locals.adminPath}/members`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Admin: Show form to edit a member
router.get('/edit/:id', async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    res.render('admin/members/edit', { member, title: 'Modifier le membre' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Admin: Handle editing a member
router.post('/edit/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, role, bio, linkedinUrl } = req.body;
    let imageUrl;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    } else {
      const member = await Member.findById(req.params.id);
      imageUrl = member.imageUrl;
    }
    await Member.findByIdAndUpdate(req.params.id, { name, role, bio, linkedinUrl, imageUrl });
    res.redirect(`${res.locals.adminPath}/members`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Admin: Handle deleting a member
router.post('/delete/:id', async (req, res) => {
  try {
    await Member.findByIdAndDelete(req.params.id);
    res.redirect(`${res.locals.adminPath}/members`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
