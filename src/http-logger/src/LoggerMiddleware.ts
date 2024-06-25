import { NextFunction, Request, Response } from 'express';
import { logRequest, logResponse } from './HttpLogger';

export const LoggerMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logRequest(req);
  await next();
  logResponse(req, res);
};
