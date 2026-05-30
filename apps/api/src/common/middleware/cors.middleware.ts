import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    const allowed = (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
      .split(',')
      .map((s) => s.trim());

    if (!origin || allowed.includes('*') || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-cart-token', 'x-request-id'],
  credentials: true,
};
