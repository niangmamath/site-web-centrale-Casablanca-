const express = require('express');
const router = express.Router();
const multer = require('multer');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');

const Section = require('../models/section');
const Event = require('../models/event');
const Member = require('../models/member');
const ensureAuthenticated = require('../middleware/auth');

// Configure AWS S3 Client
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Configure Multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

// Middleware to pass layout and user to all admin routes
router.use((req, res, next) => {
    res.locals.layout = 'admin-layout';
    res.locals.user = req.user;
    next();
});

// Admin Dashboard
router.get('/', ensureAuthenticated, (req, res) => {
    res.render('admin/dashboard', { title: 'Admin Dashboard' });
});

// ... (routes for sections and events) ...

// Members Management
router.get('/members', ensureAuthenticated, async (req, res) => {
    try {
        const members = await Member.find();
        res.render('admin/members', { title: 'Manage Members', members });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Add Member Form
router.get('/members/add', ensureAuthenticated, (req, res) => {
    res.render('admin/members/add', { title: 'Add Member' });
});

// Create Member
router.post('/members/add', ensureAuthenticated, upload.single('image'), async (req, res) => {
    try {
        const { name, role, mission, bio, linkedinUrl } = req.body;
        let imageUrl = '';

        if (req.file) {
            const fileName = generateFileName();
            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: fileName,
                Body: req.file.buffer,
                ContentType: req.file.mimetype
            };
            await s3.send(new PutObjectCommand(params));
            imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${fileName}`;
        }

        const newMember = new Member({ name, role, mission, bio, linkedinUrl, imageUrl });
        await newMember.save();
        res.redirect('/admin/members');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Edit Member Form
router.get('/members/edit/:id', ensureAuthenticated, async (req, res) => {
    try {
        const member = await Member.findById(req.params.id);
        res.render('admin/members/edit', { title: 'Edit Member', member });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Update Member
router.put('/members/edit/:id', ensureAuthenticated, upload.single('image'), async (req, res) => {
    try {
        const member = await Member.findById(req.params.id);
        if (!member) {
            return res.status(404).send('Member not found');
        }

        const { name, role, mission, bio, linkedinUrl } = req.body;

        member.name = name;
        member.role = role;
        member.mission = mission;
        member.bio = bio;
        member.linkedinUrl = linkedinUrl;

        if (req.file) {
            if (member.imageUrl) {
                const oldKey = member.imageUrl.split('/').pop();
                await s3.send(new DeleteObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME, Key: oldKey }));
            }
            const fileName = generateFileName();
            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: fileName,
                Body: req.file.buffer,
                ContentType: req.file.mimetype
            };
            await s3.send(new PutObjectCommand(params));
            member.imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${fileName}`;
        }

        await member.save();
        res.redirect('/admin/members'); // Redirection normale rétablie

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Delete Member
router.delete('/members/delete/:id', ensureAuthenticated, async (req, res) => {
    try {
        const member = await Member.findById(req.params.id);
        if (member && member.imageUrl) {
            const key = member.imageUrl.split('/').pop();
            await s3.send(new DeleteObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME, Key: key }));
        }
        await Member.findByIdAndDelete(req.params.id);
        res.redirect('/admin/members');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;