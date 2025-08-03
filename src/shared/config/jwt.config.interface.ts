export interface JwtConfig {
  secret: string;
  expiresIn: string;
  expiration: number;
  isProduction: boolean;
}
