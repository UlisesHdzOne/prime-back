export class RevokedToken {
  constructor(
    public token: string,
    public revokedAt: Date,
    public expiresAt: Date,
    public id?: number,
  ) {}
}
