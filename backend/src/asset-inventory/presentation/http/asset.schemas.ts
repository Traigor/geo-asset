import { z } from 'zod';
import type { CreateAssetRequestDto } from './dtos/create-asset-request.dto.js';
import type { ListAssetsQueryDto } from './dtos/list-assets-query.dto.js';
import type { UpdateAssetRequestDto } from './dtos/update-asset-request.dto.js';

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD date');

export const assetTypeSchema = z.enum(['pipe', 'hydrant', 'sensor', 'valve']);
export const assetStatusSchema = z.enum(['ok', 'warning', 'critical']);
export const assetSortBySchema = z.enum(['name', 'installed_at', 'last_inspected_at']);
export const sortDirectionSchema = z.enum(['asc', 'desc']);

export const assetIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const listAssetsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(50),
    type: assetTypeSchema.optional(),
    status: assetStatusSchema.optional(),
    sortBy: assetSortBySchema.default('installed_at'),
    sortDirection: sortDirectionSchema.default('desc'),
    nearLat: z.coerce.number().min(-90).max(90).optional(),
    nearLng: z.coerce.number().min(-180).max(180).optional(),
    radiusMeters: z.coerce.number().positive().max(100000).optional(),
    minLat: z.coerce.number().min(-90).max(90).optional(),
    minLng: z.coerce.number().min(-180).max(180).optional(),
    maxLat: z.coerce.number().min(-90).max(90).optional(),
    maxLng: z.coerce.number().min(-180).max(180).optional(),
  })
  .superRefine((query, ctx) => {
    const radiusProvided = [query.nearLat, query.nearLng, query.radiusMeters].filter(
      (value) => value !== undefined,
    ).length;
    const boundsProvided = [query.minLat, query.minLng, query.maxLat, query.maxLng].filter(
      (value) => value !== undefined,
    ).length;

    if (radiusProvided > 0 && radiusProvided < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'nearLat, nearLng, and radiusMeters must be provided together',
        path: ['radiusMeters'],
      });
    }

    if (boundsProvided > 0 && boundsProvided < 4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'minLat, minLng, maxLat, and maxLng must be provided together',
        path: ['maxLng'],
      });
    }

    if (radiusProvided === 3 && boundsProvided === 4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Radius and map bounds filters cannot be combined',
        path: ['minLat'],
      });
    }

    if (query.minLat !== undefined && query.maxLat !== undefined && query.minLat > query.maxLat) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'minLat must be less than or equal to maxLat',
        path: ['minLat'],
      });
    }

    if (query.minLng !== undefined && query.maxLng !== undefined && query.minLng > query.maxLng) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'minLng must be less than or equal to maxLng',
        path: ['minLng'],
      });
    }
  });

export const createAssetBodySchema = z.object({
  name: z.string().trim().min(1, 'Asset name is required'),
  type: assetTypeSchema,
  status: assetStatusSchema,
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  installed_at: isoDateSchema,
  last_inspected_at: isoDateSchema.nullable(),
  notes: z.string().default(''),
});

export const updateAssetBodySchema = createAssetBodySchema
  .partial()
  .refine((body) => Object.keys(body).length > 0, {
    message: 'At least one field must be provided',
  });

export type AssetIdParams = z.infer<typeof assetIdParamsSchema>;
export type ListAssetsQueryParams = z.infer<typeof listAssetsQuerySchema> & ListAssetsQueryDto;
export type CreateAssetBody = z.infer<typeof createAssetBodySchema> & CreateAssetRequestDto;
export type UpdateAssetBody = z.infer<typeof updateAssetBodySchema> & UpdateAssetRequestDto;
