
require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');

// Models
const Message = require('./models/message');
const Post = require('./models/post');

// Routers
const indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin');
const postsRouter = require('./routes/admin/posts');
const membersRouter = require('./routes/admin/members');
const sectionsRouter = require('./routes/admin/sections');
const eventsRouter = require('./routes/admin/events');
const messagesRouter = require('./routes/admin/messages');
const commentsRouter = require('./routes/admin/comments');

const app = express();

const adminPath = process.env.ADMIN_PATH || '/admin';

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Middleware setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.default.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Global middleware to make data available to all views
app.use(async (req, res, next) => {
  res.locals.adminPath = adminPath;
  res.locals.user = req.session.user; // Pass user data to views

  // Calculate notifications only if the user is logged in and in the admin area
  if (req.session.user && req.originalUrl.startsWith(adminPath)) {
    try {
      const unreadMessageCount = await Message.countDocuments({ read: false });
      const unreadCommentsAggregation = await Post.aggregate([
        { $unwind: '$comments' },
        { $match: { 'comments.read': false } },
        { $count: 'unread' }
      ]);
      res.locals.unreadMessageCount = unreadMessageCount;
      res.locals.unreadCommentsCount = unreadCommentsAggregation.length > 0 ? unreadCommentsAggregation[0].unread : 0;
    } catch (err) {
      console.error("Error counting unread items:", err);
      res.locals.unreadMessageCount = 0;
      res.locals.unreadCommentsCount = 0;
    }
  } else {
    // Default values for non-admin or non-logged-in users
    res.locals.unreadMessageCount = 0;
    res.locals.unreadCommentsCount = 0;
  }
  next();
});

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);


// --- AUTHENTICATION & ADMIN ROUTING ---

// 1. Public Admin Routes (Login/Logout)
// These routes do not require authentication and use a specific layout.

app.get(`${adminPath}/login`, (req, res) => {
  req.app.set('layout', false); // No layout for the login page
  res.render('admin/login', { error: null, adminPath });
});

app.post(`${adminPath}/login`, (req, res) => {
  const { username, password } = req.body;
  const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
  const ADMIN_PASS = process.env.ADMIN_PASSWORD || '7X54M}VvDtmx2z{2&)(H';

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.user = { username: ADMIN_USER };
    res.redirect(adminPath);
  } else {
    req.app.set('layout', false);
    res.render('admin/login', { error: 'Identifiants incorrects.', adminPath });
  }
});

app.get(`${adminPath}/logout`, (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destruction error:", err);
      return next(err);
    }
    res.clearCookie('connect.sid'); // Default session cookie name
    res.redirect(`${adminPath}/login`);
  });
});

// 2. Authentication Middleware
// This function checks if a user is logged in. If not, it redirects to the login page.
const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect(`${adminPath}/login`);
  }
  next();
};

// 3. Protected Admin Router
// All routes for the admin dashboard are grouped here and protected by the requireLogin middleware.
const protectedAdminRouter = express.Router();
protectedAdminRouter.use(requireLogin); // Authentication wall
protectedAdminRouter.use((req, res, next) => {
  req.app.set('layout', 'admin/layout'); // Use the admin layout for all these routes
  next();
});

// Mount all the individual admin controllers onto the protected router
protectedAdminRouter.use('/', adminRouter);
protectedAdminRouter.use('/posts', postsRouter);
protectedAdminRouter.use('/sections', sectionsRouter);
protectedAdminRouter.use('/messages', messagesRouter);
protectedAdminRouter.use('/events', eventsRouter);
protectedAdminRouter.use('/members', membersRouter);
protectedAdminRouter.use('/comments', commentsRouter);

// 4. Main Application Routing
app.use((req, res, next) => {
  // Set the default public layout for all non-admin routes
  if (!req.originalUrl.startsWith(adminPath)) {
    req.app.set('layout', 'layout');
  }
  next();
});

// Mount the public-facing router
app.use('/', indexRouter);

// Mount the entire protected admin section under its secure path
app.use(adminPath, protectedAdminRouter);

// --- Error Handlers ---
app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error', { layout: false }); // Render error page without layout
});

// Start the server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`🚀 Site principal disponible sur : http://localhost:${PORT}`);
  if (adminPath) {
    console.log(`🔑 Panel Admin disponible sur      : http://localhost:${PORT}${adminPath}`);
  }
});

module.exports = app;
