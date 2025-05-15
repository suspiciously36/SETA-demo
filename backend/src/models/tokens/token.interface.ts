export interface AuthPayload {
  sub: string;
  email: string;
}

export interface TokenPayload {
  id: string;
  user_id: string;
  token: string;
  is_revoked: boolean;
  expired_at: Date;
}
