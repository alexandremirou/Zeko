export interface AuthUser {
  userId: string;
  email: string;
}

export interface RefreshAuthUser extends AuthUser {
  refreshToken: string;
  sessionId: string;
}
