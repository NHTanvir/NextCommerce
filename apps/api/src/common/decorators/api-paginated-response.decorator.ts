import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, ApiQuery, getSchemaPath } from '@nestjs/swagger';

export function ApiPaginatedResponse<T>(model: Type<T>) {
  return applyDecorators(
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 12 }),
    ApiOkResponse({
      schema: {
        allOf: [
          {
            properties: {
              items: { type: 'array', items: { $ref: getSchemaPath(model) } },
              total: { type: 'number', example: 100 },
              page: { type: 'number', example: 1 },
              limit: { type: 'number', example: 12 },
              totalPages: { type: 'number', example: 9 },
            },
          },
        ],
      },
    }),
  );
}
