import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
/**
 * Middleware factory pour valider le body de la requête avec un schéma Zod
 */
export declare function validate(schema: ZodSchema): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validate.d.ts.map