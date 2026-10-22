import { TestBed } from '@angular/core/testing';
import { ToastService } from './imports.service';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('ToastService (Anti-Spam & Animación)', () => {
  let service: ToastService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debe registrar una notificación individual', () => {
    service.success('Producto agregado');
    const toasts = service.toasts();
    expect(toasts.length).toBe(1);
    expect(toasts[0].message).toBe('Producto agregado');
    expect(toasts[0].count).toBe(1);
  });

  it('anti-spam: debe agrupar notificaciones idénticas e incrementar count', () => {
    service.success('Producto agregado');
    service.success('Producto agregado');
    service.success('Producto agregado');

    const toasts = service.toasts();
    expect(toasts.length).toBe(1);
    expect(toasts[0].message).toBe('Producto agregado');
    expect(toasts[0].count).toBe(3);
    expect(toasts[0].progressKey).toBe(3);
  });

  it('anti-spam: no debe superar el límite máximo de notificaciones concurrentes', () => {
    service.info('Mensaje 1');
    service.info('Mensaje 2');
    service.info('Mensaje 3');
    service.info('Mensaje 4');

    const activeToasts = service.toasts().filter((t) => !t.leaving);
    expect(activeToasts.length).toBeLessThanOrEqual(3);
  });

  it('debe marcar la notificación como leaving y luego retirarla', () => {
    service.success('Producto agregado', 1000);
    expect(service.toasts().length).toBe(1);

    // Avanzar hasta el término de la duración
    vi.advanceTimersByTime(1000);
    const toast = service.toasts().find((t) => t.message === 'Producto agregado');
    expect(toast?.leaving).toBe(true);

    // Avanzar fin de animación de salida (250ms)
    vi.advanceTimersByTime(250);
    expect(service.toasts().length).toBe(0);
  });
});
