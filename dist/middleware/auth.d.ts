import { Request, Response, NextFunction } from 'express';
export interface JwtPayload {
    userId: string;
    email: string;
    role: string;
}
export interface AuthRequest extends Request {
    user?: JwtPayload;
}
export declare function generateAccessToken(payload: JwtPayload): string;
export declare function generateRefreshToken(payload: JwtPayload): string;
export declare function verifyAccessToken(token: string): JwtPayload;
export declare function verifyRefreshToken(token: string): JwtPayload;
export declare function authenticate(req: AuthRequest, res: Response, next: NextFunction): void;
export declare function requireRole(...roles: string[]): (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare function requirePublisher(req: AuthRequest, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map