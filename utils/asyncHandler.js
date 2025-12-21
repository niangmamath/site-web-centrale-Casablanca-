/**
 * Wraps an asynchronous Express route handler to catch any errors and pass them to the next middleware.
 * This avoids the need for repetitive try-catch blocks in every async route.
 * @param {Function} fn - The asynchronous route handler function.
 * @returns {Function} An Express route handler that catches errors.
 * @example
 * const asyncHandler = require('../utils/asyncHandler');
 *
 * router.get('/', asyncHandler(async (req, res) => {
 *   const users = await User.find();
 *   res.json(users);
 * }));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
