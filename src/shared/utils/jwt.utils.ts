export function getMsFromExpiresIn(expiresIn: string): number {
  const time = parseInt(expiresIn.slice(0, -1));
  const unit = expiresIn.slice(-1).toLowerCase();

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
      return 86400 * 1000; // 24 horas por defecto
  }
}
