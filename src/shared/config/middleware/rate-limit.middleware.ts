import rateLimit from 'express-rate-limit';

export const rateLimitMiddleware = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5, // máximo 5 solicitudes por IP
  message: {
    statusCode: 429,
    message: 'Too many requests, please try again later.',
    error: 'Too Many Requests',
  },
});
