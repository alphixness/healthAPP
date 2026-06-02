import { Response } from 'express';

export function success<T>(res: Response, data: T, status = 200): void {
  res.status(status).json({ success: true, data });
}

export function error(res: Response, message: string, status = 400): void {
  res.status(status).json({ success: false, error: message });
}

export function paginated<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number
): void {
  res.status(200).json({
    success: true,
    data,
    meta: { total, page, limit },
  });
}
