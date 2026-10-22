import { Component, inject } from '@angular/core';
import { ToastItem, ToastService } from '../../Services/imports.service';

@Component({
  selector: 'app-toasts',
  template: `
    <div class="pointer-events-none fixed inset-x-0 top-5 z-50 flex flex-col items-center gap-2.5 px-4" aria-live="polite">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto relative flex w-full max-w-md items-center gap-3 overflow-hidden rounded-2xl border border-slate-200/90 bg-white px-4 py-3.5 text-sm font-medium shadow-xl backdrop-blur-md transition-all dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          [class.toast-enter]="!toast.leaving"
          [class.toast-leave]="toast.leaving"
          role="status"
        >
          <!-- Ícono representativo sutil -->
          @switch (toast.kind) {
            @case ('success') {
              <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400">
                <svg viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            }
            @case ('error') {
              <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/70 dark:text-rose-400">
                <svg viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
            }
            @default {
              <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400">
                <svg viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
              </div>
            }
          }

          <!-- Mensaje -->
          <span class="flex-1 text-slate-800 dark:text-slate-100 leading-snug">{{ toast.message }}</span>

          <!-- Badge contador anti-spam si se presiona varias veces -->
          @if (toast.count > 1) {
            <span class="inline-flex shrink-0 items-center justify-center rounded-full bg-slate-900 px-2 py-0.5 text-xs font-black text-white shadow-xs dark:bg-blue-600">
              x{{ toast.count }}
            </span>
          }

          <!-- Botón de descarte -->
          <button
            type="button"
            class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
            (click)="toastService.dismiss(toast.id)"
            aria-label="Cerrar"
          >
            ✕
          </button>

          <!-- Barrita progresiva INFERIOR -->
          <div class="absolute inset-x-0 bottom-0 h-1 overflow-hidden bg-slate-100 dark:bg-slate-800/80">
            @for (key of [toast.progressKey]; track key) {
              <div
                class="h-full"
                [class]="progressBarClass(toast.kind)"
                [style.animation]="'toast-progress-shrink ' + toast.durationMs + 'ms linear forwards'"
              ></div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class ToastsComponent {
  protected readonly toastService = inject(ToastService);

  protected progressBarClass(kind: ToastItem['kind']): string {
    switch (kind) {
      case 'success':
        return 'bg-emerald-500 dark:bg-emerald-400';
      case 'error':
        return 'bg-rose-500 dark:bg-rose-400';
      default:
        return 'bg-blue-600 dark:bg-blue-500';
    }
  }
}
