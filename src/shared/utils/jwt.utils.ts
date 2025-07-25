export function getMsFromExpiresIn(expiresIn: string): number {
  if (!expiresIn || typeof expiresIn !== 'string' || expiresIn.length < 2) {
    throw new Error(
      'El formato debe ser un número seguido de una unidad (ej: "60s", "2h", "1d")',
    );
  }

  const timeStr = expiresIn.slice(0, -1);
  const unit = expiresIn.slice(-1).toLowerCase();
  const time = parseInt(timeStr);

  if (isNaN(time)) {
    throw new Error(`El tiempo debe ser numérico: "${timeStr}"`);
  }

  switch (unit) {
    case 's':
      return time * 1000;
    case 'm':
      return time * 60 * 1000;
    case 'h':
      return time * 60 * 60 * 1000;
    case 'd':
      return time * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`Unidad no soportada: "${unit}". Use s, m, h o d`);
  }
}
