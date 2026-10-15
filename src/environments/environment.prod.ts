/**
 * Resuelve dinámicamente la URL base de Firmeza.Api según el entorno donde se ejecute.
 *
 * 1. En la nube (producción):
 *    - Si se ingresa desde firmeza.clandev.com o cualquier subdominio .clandev.com:
 *      apunta a services.firmeza.clandev.com/api con el mismo protocolo (http o https).
 *
 * 2. En local (desarrollo):
 *    - Si se ingresa desde localhost, 127.0.0.1 o IP local:
 *      - Si el frontend está en el puerto 8889 u 8081 (Docker): apunta a localhost:8888/api.
 *      - Si el frontend está en cualquier otro puerto local (ej: ng serve en 4200): apunta a localhost:5180/api.
 *
 * 3. Permite override manual en localStorage ('firmeza_api_url') si se desea forzar una URL específica.
 */
export function resolveApiUrl(): string {
  if (typeof window !== 'undefined' && window.location) {
    const { protocol, hostname, port } = window.location;

    // A. Override manual opcional por localStorage (ej: localStorage.setItem('firmeza_api_url', '...'))
    try {
      const customApi = localStorage.getItem('firmeza_api_url');
      if (customApi && customApi.trim()) {
        return customApi.trim().replace(/\/+$/, '');
      }
    } catch {
      // Ignorar fallback si localStorage está bloqueado
    }

    // B. Dominio en la nube (producción)
    if (hostname === 'firmeza.clandev.com' || hostname.endsWith('.clandev.com')) {
      return `${protocol}//services.firmeza.clandev.com/api`;
    }

    // C. Pruebas locales en Docker (frontend en puerto 8889 u 8081)
    if (port === '8889' || port === '8081') {
      return `${protocol}//${hostname}:8888/api`;
    }

    // D. Pruebas locales con ng serve (puerto 4200) o ejecución directa
    return `${protocol}//${hostname}:5180/api`;
  }

  return 'http://localhost:5180/api';
}

export const environment = {
  get apiUrl(): string {
    return resolveApiUrl();
  }
};