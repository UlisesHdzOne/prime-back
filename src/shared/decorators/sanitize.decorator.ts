import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import * as sanitizeHtml from 'sanitize-html';

export const SanitizeText = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const { body } = request;

    if (body) {
      Object.keys(body).forEach(key => {
        if (typeof body[key] === 'string') {
          body[key] = sanitizeHtml(body[key], {
            allowedTags: [],
            allowedAttributes: {},
          });
        }
      });
    }

    return body;
  },
);