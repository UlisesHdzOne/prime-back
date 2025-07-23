import { RevokedToken } from '../entities/revoked-token.entity';

export interface IRevokedTokenRepository {
  revokeToken(token: string): Promise<void>;
  isTokenRevoked(token: string): Promise<boolean>;
  findToken(token: string): Promise<RevokedToken | null>;
}
