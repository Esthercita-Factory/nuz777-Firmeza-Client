import { Component, inject, input } from '@angular/core';
import { ThemeService } from '../../Services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  template: `
    @if (variant() === 'fab') {
      <button
        type="button"
        (click)="theme.toggle()"
        [attr.aria-label]="theme.isDark() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
        [attr.title]="theme.isDark() ? 'Activar modo claro' : 'Activar modo oscuro'"
        [class]="positionClass() + ' fixed z-40 flex h-12 w-12 items-center justify-center rounded-full border shadow-2xl backdrop-blur-xl transition-all duration-300 active:scale-90 hover:scale-110 cursor-pointer'"
        [class.theme-toggle-fab-dark]="theme.isDark()"
        [class.theme-toggle-fab-light]="!theme.isDark()"
      >
        @if (theme.isDark()) {
          <!-- Icono Luna / Modo Noche OLED -->
          <svg
            class="h-6 w-6 text-blue-400 transition-transform duration-300 hover:rotate-12"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        } @else {
          <!-- Icono Sol / Modo Día (oscuro) -->
          <svg
            class="h-6 w-6 text-slate-800 transition-transform duration-300 hover:rotate-45 hover:text-black"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
        }
      </button>
    } @else {
      <button
        type="button"
        (click)="theme.toggle()"
        [attr.aria-label]="theme.isDark() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
        [attr.title]="theme.isDark() ? 'Activar modo claro' : 'Activar modo oscuro'"
        class="relative inline-flex items-center justify-center rounded-xl border transition-all duration-200 active:scale-95 cursor-pointer min-h-[40px] min-w-[40px] h-10 w-10 p-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a5cff]"
        [class.theme-toggle-dark]="theme.isDark()"
        [class.theme-toggle-light]="!theme.isDark()"
      >
        @if (theme.isDark()) {
          <!-- Icono Luna / Modo Noche OLED -->
          <svg
            class="h-full w-full text-blue-400 transition-transform duration-300 rotate-0 hover:rotate-12"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        } @else {
          <!-- Icono Sol / Modo Día (oscuro) -->
          <svg
            class="h-full w-full text-slate-800 transition-transform duration-300 rotate-0 hover:rotate-45 hover:text-black"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
        }
      </button>
    }
  `,
  styles: [
    `
      .theme-toggle-dark {
        background-color: rgba(18, 18, 22, 0.85);
        border-color: rgba(255, 255, 255, 0.12);
        box-shadow: 0 0 15px rgba(59, 130, 246, 0.15);
      }
      .theme-toggle-dark:hover {
        background-color: rgba(28, 28, 35, 0.95);
        border-color: rgba(59, 130, 246, 0.5);
      }
      .theme-toggle-light {
        background-color: rgba(255, 255, 255, 0.9);
        border-color: rgba(148, 163, 184, 0.6);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }
      .theme-toggle-light:hover {
        background-color: #ffffff;
        border-color: rgba(15, 23, 42, 0.7);
        box-shadow: 0 2px 6px rgba(15, 23, 42, 0.12);
      }

      .theme-toggle-fab-dark {
        background-color: rgba(18, 18, 22, 0.92);
        border-color: rgba(255, 255, 255, 0.18);
        box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.7), 0 0 20px rgba(59, 130, 246, 0.3);
      }
      .theme-toggle-fab-dark:hover {
        background-color: rgba(28, 28, 35, 0.98);
        border-color: rgba(59, 130, 246, 0.6);
        box-shadow: 0 14px 30px -3px rgba(0, 0, 0, 0.85), 0 0 25px rgba(59, 130, 246, 0.45);
      }
      .theme-toggle-fab-light {
        background-color: rgba(255, 255, 255, 0.95);
        border-color: rgba(148, 163, 184, 0.6);
        box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.12), 0 0 15px rgba(15, 23, 42, 0.12);
      }
      .theme-toggle-fab-light:hover {
        background-color: #ffffff;
        border-color: rgba(15, 23, 42, 0.7);
        box-shadow: 0 14px 30px -3px rgba(0, 0, 0, 0.18), 0 0 20px rgba(15, 23, 42, 0.2);
      }
    `
  ]
})
export class ThemeToggleComponent {
  readonly theme = inject(ThemeService);
  readonly size = input<'sm' | 'md'>('md');
  readonly variant = input<'inline' | 'fab'>('inline');
  readonly positionClass = input<string>('bottom-20 right-4');
}
