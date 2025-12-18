// Load environment variables from .env file FIRST.
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

// Models for notification counts
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

// Define the secure path for administration from environment variables
const adminPath = process.env.ADMIN_PATH || '/admin';

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.default.create({ mongoUrl: process.env.MONGODB_URI })
}));

// Middleware to make session, adminPath, and notification counts available in all views
app.use(async (req, res, next) => {
  res.locals.session = req.session;
  res.locals.adminPath = adminPath;

  if (req.originalUrl.startsWith(adminPath)) {
    try {
      const unreadMessageCount = await Message.countDocuments({ read: false });
      const unreadCommentsAggregation = await Post.aggregate([
        { $unwind: '$comments' },
        { $match: { 'comments.read': false } },
        { $count: 'unread' }
      ]);
      const unreadCommentsCount = unreadCommentsAggregation.length > 0 ? unreadCommentsAggregation[0].unread : 0;
      res.locals.unreadMessageCount = unreadMessageCount;
      res.locals.unreadCommentsCount = unreadCommentsCount;
    } catch (err) {
      console.error("Error counting unread items:", err);
      res.locals.unreadMessageCount = 0;
      res.locals.unreadCommentsCount = 0;
    }
  }
  next();
});

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// --- Layout and Route Management ---

// Create a dedicated admin router to apply a specific layout
const adminApp = express.Router();
adminApp.use((req, res, next) => {
    // For all routes in this router, use the admin layout
    req.app.set('layout', 'admin/layout');
    next();
});

// Mount all the individual admin routers onto the adminApp
adminApp.use('/', adminRouter); // For the main dashboard
adminApp.use('/posts', postsRouter);
adminApp.use('/sections', sectionsRouter);
adminApp.use('/messages', messagesRouter);
adminApp.use('/events', eventsRouter);
adminApp.use('/members', membersRouter);
adminApp.use('/comments', commentsRouter);

// Use the main layout for all other routes
app.use((req, res, next) => {
    req.app.set('layout', 'layout');
    next();
});

// Mount the main routers
app.use('/', indexRouter);
app.use(adminPath, adminApp); // Mount the entire admin section under its secure path

// --- End of Routes ---

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error', { layout: false });
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
