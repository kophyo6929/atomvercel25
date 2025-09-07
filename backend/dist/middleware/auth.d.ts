import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
export interface AuthRequest extends Request {
    user?: {
        id: number;
        username: string;
        isAdmin: boolean;
    };
    prisma: PrismaClient | null;
    dbConnected: boolean;
}
export declare const authenticateToken: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const requireAdmin: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=auth.d.ts.map