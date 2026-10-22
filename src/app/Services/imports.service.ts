import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, catchError, from, of, switchMap, throwError } from 'rxjs';
import { API_URL } from './Api.Service';

export interface ImportValidationEntry {
  sheetName: string;
  rowNumber: number;
  field: string;
  message: string;
  severity: 'Warning' | 'Error';
  rawValue: string | null;
}

export interface ImportResult {
  success: boolean;
  totalRowsProcessed: number;
  productsCreated: number;
  productsUpdated: number;
  customersCreated: number;
  customersUpdated: number;
  salesCreated: number;
  errors: ImportValidationEntry[];
  warnings: ImportValidationEntry[];
}

@Injectable({
  providedIn: 'root'
})
export class ImportsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_URL}/imports`;

  upload(file: File): Observable<ImportResult> {
    const form = new FormData();
    form.append('file', file, file.name);

    return this.http.post<ImportResult>(`${this.baseUrl}/excel`, form);
  }

  templateUrl(): string {
    return `${this.baseUrl}/template`;
  }

  /**
   * Visualiza un archivo (PDF, comprobante) en una nueva pestaña del navegador directamente
   * sin forzar la descarga en disco.
   */
  preview(url: string): Observable<boolean> {
    const win = window.open('about:blank', '_blank');
    return this.http.get(url, { responseType: 'blob', observe: 'response' }).pipe(
      switchMap((response) => {
        const contentType = response.headers.get('content-type') ?? '';

        if (contentType.includes('application/json') || contentType.includes('text/html') || contentType.startsWith('text/')) {
          if (win) win.close();
          return from(response.body?.text() ?? Promise.resolve('')).pipe(
            switchMap((raw) => throwError(() => new Error(this.extractMessage(raw, response.status))))
          );
        }

        if (response.body) {
          const blob = new Blob([response.body], { type: 'application/pdf' });
          const objectUrl = URL.createObjectURL(blob);
          if (win) {
            win.location.href = objectUrl;
          } else {
            window.open(objectUrl, '_blank');
          }
        } else if (win) {
          win.close();
        }
        return of(true);
      }),
      catchError((err) => {
        if (win) win.close();
        return throwError(() => err);
      })
    );
  }

  /**
   * Descarga binaria (Excel, PDF, comprobantes). Usa el interceptor normal para que
   * la petición lleve el Bearer y se renueve el token si venció.
   */
  download(url: string, fallbackFileName: string): Observable<boolean> {
    return this.http.get(url, { responseType: 'blob', observe: 'response' }).pipe(
      switchMap((response) => {
        const contentType = response.headers.get('content-type') ?? '';

        // La API responde errores en JSON: guardarlos con nombre .xlsx produce un archivo corrupto.
        if (contentType.includes('application/json') || contentType.includes('text/html') || contentType.startsWith('text/')) {
          return from(response.body?.text() ?? Promise.resolve('')).pipe(
            switchMap((raw) => throwError(() => new Error(this.extractMessage(raw, response.status))))
          );
        }

        this.saveFile(response, fallbackFileName);
        return of(true);
      })
    );
  }

  private extractMessage(raw: string, status: number): string {
    try {
      const parsed = JSON.parse(raw);
      const message = parsed?.detail || parsed?.title || parsed?.message;
      if (message) {
        return String(message);
      }
    } catch {
      // La respuesta no era JSON.
    }

    return `No se pudo descargar el archivo (HTTP ${status}).`;
  }

  private saveFile(response: HttpResponse<Blob>, fallbackFileName: string): void {
    if (!response.body) return;

    const objectUrl = URL.createObjectURL(response.body);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = this.fileNameFrom(response.headers.get('content-disposition'), fallbackFileName);
    anchor.click();
    URL.revokeObjectURL(objectUrl);
  }

  private fileNameFrom(contentDisposition: string | null, fallback: string): string {
    const match = contentDisposition ? /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(contentDisposition) : null;
    return match ? decodeURIComponent(match[1]) : fallback;
  }
}

export interface ToastItem {
  id: number;
  kind: 'success' | 'error' | 'info';
  message: string;
  count: number;
  durationMs: number;
  progressKey: number;
  leaving?: boolean;
}

/** Avisos flotantes de la aplicación (con anti-spam y animación fluida). */
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private readonly items = signal<ToastItem[]>([]);
  private nextId = 1;
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  private readonly MAX_CONCURRENT = 3;

  readonly toasts = this.items.asReadonly();

  success(message: string, durationMs = 3500): void {
    this.show('success', message, durationMs);
  }

  error(message: string, durationMs = 6000): void {
    this.show('error', message, durationMs);
  }

  info(message: string, durationMs = 3500): void {
    this.show('info', message, durationMs);
  }

  warning(message: string, durationMs = 4000): void {
    this.show('info', message, durationMs);
  }

  dismiss(id: number): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }

    const currentItem = this.items().find((t) => t.id === id);
    if (!currentItem || currentItem.leaving) {
      return;
    }

    // Activa la animación de salida
    this.items.update((current) =>
      current.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast))
    );

    // Tras completar la animación CSS (250ms), se elimina del estado
    setTimeout(() => {
      this.items.update((current) => current.filter((toast) => toast.id !== id));
    }, 250);
  }

  private show(kind: 'success' | 'error' | 'info', message: string, durationMs: number): void {
    const currentItems = this.items();

    // Sistema Anti-Spam: si el aviso idéntico ya está activo y visible, agrupar contador y reiniciar temporizador
    const existing = currentItems.find((t) => !t.leaving && t.message === message && t.kind === kind);
    if (existing) {
      const oldTimer = this.timers.get(existing.id);
      if (oldTimer) {
        clearTimeout(oldTimer);
      }

      this.items.update((current) =>
        current.map((t) =>
          t.id === existing.id
            ? { ...t, count: t.count + 1, progressKey: t.progressKey + 1, durationMs }
            : t
        )
      );

      const newTimer = setTimeout(() => this.dismiss(existing.id), durationMs);
      this.timers.set(existing.id, newTimer);
      return;
    }

    // Límite máximo concurrente: descartar el más viejo si supera el límite
    const active = currentItems.filter((t) => !t.leaving);
    if (active.length >= this.MAX_CONCURRENT) {
      this.dismiss(active[0].id);
    }

    const id = this.nextId++;
    const newItem: ToastItem = {
      id,
      kind,
      message,
      count: 1,
      durationMs,
      progressKey: 1,
      leaving: false
    };

    this.items.update((current) => [...current, newItem]);

    const timer = setTimeout(() => this.dismiss(id), durationMs);
    this.timers.set(id, timer);
  }
}
