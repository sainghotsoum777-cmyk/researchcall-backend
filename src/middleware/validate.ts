// ─────────────────────────────────────────────────────────
// backend/src/middleware/validate.ts — Middleware de validation Zod
// ResearchCall MVP — Phase 1
// ─────────────────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Middleware factory pour valider le body de la requête avec un schéma Zod
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors: Record<string, string[]> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!formattedErrors[path]) {
            formattedErrors[path] = [];
          }
          formattedErrors[path].push(err.message);
        });

        res.status(400).json({
          error: true,
          message: 'Erreur de validation',
          errors: formattedErrors,
        });
        return;
      }
      next(error);
    }
  };
}
