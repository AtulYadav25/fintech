import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export const generateToken = (payload: { _id: string, email: string, role: string }) => {
    return jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, config.JWT_SECRET);
};

export const durationToSeconds = (input: string): number => {
    const match = input.match(/^(\d+)([dhm])$/);

    if (!match) {
        throw new Error("Invalid format. Use formats like '7d', '4h', '10m'");
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers: Record<string, number> = {
        d: 60 * 60 * 24, // days
        h: 60 * 60,      // hours
        m: 60            // minutes
    };

    return value * multipliers[unit];
}