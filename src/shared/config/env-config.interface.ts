export interface EnvVariables {
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  POSTGRES_USER?: string;
  POSTGRES_PASSWORD?: string;
  POSTGRES_DB?: string;
  DATABASE_URL?: string;
}
