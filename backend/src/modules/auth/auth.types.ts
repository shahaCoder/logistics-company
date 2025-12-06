export interface LoginDTO {
  email: string;
  password: string;
}

export interface JWTPayload {
  id: string;
  email: string;
  role: 'SUPER_ADMIN' | 'MANAGER' | 'VIEWER';
}

export interface AuthRequest extends Express.Request {
  user?: JWTPayload;
}

