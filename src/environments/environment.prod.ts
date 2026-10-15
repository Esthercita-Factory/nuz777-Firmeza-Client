/**
 * Entorno de producción: resuelve dinámicamente la URL de Firmeza.Api.
 *
 * - Si se ingresa desde el dominio público de producción (firmeza.clandev.com o similar):
 *   apunta a services.firmeza.clandev.com/api con el mismo protocolo (http o https).
 * - Si se prueba en local (localhost o 127.0.0.1):
 *   apunta a localhost:8888/api.
 * - Si se accede directamente por IP del host:
 *   apunta a la misma IP en el puerto 8888/api.
 */
function getApiUrl(): string {
  if (typeof window !== 'undefined' && window.location) {
    const { protocol, hostname } = window.location;

    // Pruebas locales
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//${hostname}:8888/api`;
    }

    // Acceso directo por IP
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
      return `${protocol}//${hostname}:8888/api`;
    }

    // Dominio oficial de producción
    if (hostname === 'firmeza.clandev.com' || hostname.endsWith('.clandev.com')) {
      return `${protocol}//services.firmeza.clandev.com/api`;
    }

    return `${protocol}//services.firmeza.clandev.com/api`;
  }

  return 'http://services.firmeza.clandev.com/api';
}

export const environment = {
  apiUrl: getApiUrl()
};