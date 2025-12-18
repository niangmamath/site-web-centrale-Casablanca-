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

// Routers
const indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin');
const postsRouter = require('./routes/admin/posts'); // Pattern A
const membersRouter = require('./routes/members'); // Pattern B
const sectionsRouter = require('./routes/admin/sections'); // Pattern A
const eventsRouter = require('./routes/events'); // Pattern B
const messagesRouter = require('./routes/admin/messages'); // Pattern A

const app = express();

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

// Middleware to make session available in all views
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', './layout');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// --- CORRECTED ROUTE MOUNTING ---

// Pattern A routers: mounted with a specific prefix
app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/admin/posts', postsRouter);
app.use('/admin/sections', sectionsRouter);
app.use('/admin/messages', messagesRouter);

// Pattern B routers: contain full paths and are mounted at the root
app.use('/', membersRouter); 
app.use('/', eventsRouter);

// --- END OF CORRECTIONS ---

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error', { layout: false }); // Avoid rendering layout for error page
});

// Start the server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

module.exports = app;
