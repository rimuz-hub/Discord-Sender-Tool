import { z } from 'zod';
import { insertConfigSchema, configs } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  automation: {
    start: {
      method: 'POST' as const,
      path: '/api/automation/start',
      input: z.object({
        token: z.string().min(1, "Token is required"),
        message: z.string().min(1, "Message is required"),
        channelIds: z.array(z.string()).min(1, "At least one channel ID is required"),
        delaySeconds: z.number().min(1, "Delay must be at least 1 second"),
        imageUrls: z.array(z.string()).optional(),
      }),
      responses: {
        200: z.object({ message: z.string() }),
        400: errorSchemas.validation,
      },
    },
    stop: {
      method: 'POST' as const,
      path: '/api/automation/stop',
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    status: {
      method: 'GET' as const,
      path: '/api/automation/status',
      responses: {
        200: z.object({
          isRunning: z.boolean(),
          logs: z.array(z.object({
            id: z.string(),
            timestamp: z.string(),
            type: z.enum(['info', 'success', 'error']),
            message: z.string(),
          })),
        }),
      },
    },
  },
  configs: {
    list: {
      method: 'GET' as const,
      path: '/api/configs',
      responses: {
        200: z.array(z.custom<typeof configs.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/configs/:id',
      responses: {
        200: z.custom<typeof configs.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    save: {
      method: 'POST' as const,
      path: '/api/configs',
      input: insertConfigSchema,
      responses: {
        200: z.custom<typeof configs.$inferSelect>(),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/configs/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  upload: {
    images: {
      method: 'POST' as const,
      path: '/api/upload/images',
      responses: {
        200: z.object({ urls: z.array(z.string()) }),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
