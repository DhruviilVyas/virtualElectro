import rateLimit from 'express-rate-limit';

export const orderLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 5,
  message: "Too many requests. Slow down!"
});