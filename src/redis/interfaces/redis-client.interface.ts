/**
 * Interfaz para abstraer el cliente Redis
 *
 * @method get - Obtiene un valor por clave
 * @method set - Almacena un valor con opción de expiración
 * @method del - Elimina una clave
 * @method ping - Verifica conexión con Redis
 * @method quit - Cierra la conexión
 */
export interface IRedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, expireSeconds?: number): Promise<'OK' | null>;
  del(key: string): Promise<number>;
  ping(): Promise<string>;
  quit(): Promise<void>;
}
