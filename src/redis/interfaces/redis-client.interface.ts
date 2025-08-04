export interface IRedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, expireSeconds?: number): Promise<'OK' | null>;
  del(key: string): Promise<number>;
  ping(): Promise<string>;
  quit(): Promise<void>;
}