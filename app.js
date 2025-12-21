
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
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcrypt');
const csurf = require('csurf');

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

app.set('trust proxy', 1);

const adminPath = process.env.ADMIN_PATH || '/admin';

mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "https://cdn.tailwindcss.com", "'unsafe-inline'"],
        "style-src": ["'self'", "https://cdnjs.cloudflare.com", "'unsafe-inline'"],
        "font-src": ["'self'", "https://cdnjs.cloudflare.com"],
        "img-src": ["'self'", "data:", "res.cloudinary.com"],
      },
    },
  })
);
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/contact', apiLimiter);
app.use('/blog/:id/comment', apiLimiter);
app.post(`${adminPath}/login`, apiLimiter);

// Core Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24
  }
}));

// CSRF Protection Middleware - Must be after session
const csrfProtection = csurf({ cookie: true });

// Global Middleware
app.use(async (req, res, next) => {
    res.locals.adminPath = adminPath;
    res.locals.user = req.session.user;
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
        res.locals.unreadMessageCount = 0;
        res.locals.unreadCommentsCount = 0;
    }
    next();
});

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);

// --- AUTHENTICATION & ADMIN ROUTING ---

const requireLogin = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect(`${adminPath}/login`);
    }
    next();
};

// Login routes are placed BEFORE CSRF protection is applied
app.get(`${adminPath}/login`, (req, res) => {
  req.app.set('layout', false);
  res.render('admin/login', { error: null, adminPath });
});

app.post(`${adminPath}/login`, async (req, res) => {
    const { username, password } = req.body;
    const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASS_HASH = process.env.ADMIN_PASSWORD_HASH;

    if (!ADMIN_PASS_HASH) {
        console.error('FATAL: ADMIN_PASSWORD_HASH is not defined in .env file.');
        req.app.set('layout', false);
        return res.status(500).render('admin/login', { error: 'Configuration server error.', adminPath });
    }

    const isUserValid = (username === ADMIN_USER);
    const isPasswordValid = await bcrypt.compare(password, ADMIN_PASS_HASH);

    if (isUserValid && isPasswordValid) {
        req.session.user = { username: ADMIN_USER };
        // On successful login, redirect to a page that will have CSRF protection
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
        res.clearCookie('connect.sid'); // Default cookie name
        res.redirect(`${adminPath}/login`);
    });
});

// Protected Admin Router
const protectedAdminRouter = express.Router();
protectedAdminRouter.use(requireLogin);
protectedAdminRouter.use(csrfProtection); // Apply CSRF protection to all subsequent routes
protectedAdminRouter.use((req, res, next) => { // Middleware to make CSRF token available to all admin views
  res.locals.csrfToken = req.csrfToken();
  next();
});
protectedAdminRouter.use((req, res, next) => {
  req.app.set('layout', 'admin/layout');
  next();
});

// Attach admin sub-routers
protectedAdminRouter.use('/', adminRouter);
protectedAdminRouter.use('/posts', postsRouter);
protectedAdminRouter.use('/sections', sectionsRouter);
protectedAdminRouter.use('/messages', messagesRouter);
protectedAdminRouter.use('/events', eventsRouter);
protectedAdminRouter.use('/members', membersRouter);
protectedAdminRouter.use('/comments', commentsRouter);

// --- MAIN ROUTING ---

app.use((req, res, next) => {
  if (!req.originalUrl.startsWith(adminPath)) {
    req.app.set('layout', 'layout');
  }
  next();
});
app.use('/', indexRouter);
app.use(adminPath, protectedAdminRouter);

// --- ERROR HANDLERS ---

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Custom CSRF Error Handler
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    res.status(403);
    res.render('error', {
      message: 'Action non autorisée. Jeton de sécurité invalide ou manquant.',
      error: req.app.get('env') === 'development' ? err : {},
      layout: false
    });
  } else {
    next(err);
  }
});

// General Error Handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error', { layout: false });
});

// Start Server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`🚀 Site principal disponible sur : http://localhost:${PORT}`);
  if (adminPath) {
    console.log(`🔑 Panel Admin disponible sur      : http://localhost:${PORT}${adminPath}`);
  }
});

module.exports = app;
