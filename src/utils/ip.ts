import { Request } from 'express';

/**
 * Extrait l'adresse IP réelle du client, même derrière un proxy
 */
export function getClientIp(req: Request): string {
  // Si derrière un proxy, vérifier x-forwarded-for
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // x-forwarded-for peut contenir plusieurs IPs, prendre la première
    const forwardedStr = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return forwardedStr.split(',')[0].trim();
  }
  // Sinon utiliser req.ip (fonctionne avec trust proxy)
  return req.ip || (req.socket.remoteAddress || 'unknown');
}

