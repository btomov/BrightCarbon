import { NextFunction, Request, Response } from "express";
import xss from "xss";
import sanitizeHtml from "sanitize-html";

/**
 * Middleware to sanitize and escape input to prevent XSS and NoSQL injection attacks.
 */
export const sanitizeInputMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const sanitizeObject = (obj: any) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Sanitize strings using xss and escape html entities
        obj[key] = xss(sanitizeHtml(obj[key], { allowedTags: [], allowedAttributes: {} }));
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        // Recursively sanitize nested objects
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body) {
    sanitizeObject(req.body);
  }
  if (req.params) {
    sanitizeObject(req.params);
  }
  if (req.query) {
    sanitizeObject(req.query);
  }

  next();
};
