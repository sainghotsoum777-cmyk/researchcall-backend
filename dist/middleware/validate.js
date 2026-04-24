"use strict";
// ─────────────────────────────────────────────────────────
// backend/src/middleware/validate.ts — Middleware de validation Zod
// ResearchCall MVP — Phase 1
// ─────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const zod_1 = require("zod");
/**
 * Middleware factory pour valider le body de la requête avec un schéma Zod
 */
function validate(schema) {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const formattedErrors = {};
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
//# sourceMappingURL=validate.js.map