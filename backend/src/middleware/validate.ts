import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { error } from '../utils/response';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const messages = result.error.issues.map(i => i.message).join('; ');
      error(res, `参数验证失败: ${messages}`, 400);
      return;
    }
    req.body = result.data;
    next();
  };
}
