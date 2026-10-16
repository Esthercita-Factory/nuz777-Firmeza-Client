import { Component, OnDestroy, OnInit, computed, inject, input, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { Subscription, filter } from 'rxjs';

export interface BottomNavItem {
  label: string;
  icon: string | string[];
  route: string;
  badge?: number | null;
  badgeColor?: string;
  subItems?: {
    label: string;
    icon: string | string[];
    route: string;
    badge?: number | null;
  }[];
}

@Component({
  selector: 'app-bottom-nav',
  imports: [RouterLink],
  template: `
    <!-- CONTENEDOR PRINCIPAL FIJO EN LA PARTE INFERIOR (SOLO MÓVIL) -->
    <nav
      class="fixed inset-x-0 bottom-0 z-40 w-full overflow-visible border-t transition-colors duration-300 bg-white dark:bg-[#0b1018] border-slate-200 dark:border-[#1a2230]"
      [class.sm:hidden]="hideBreakpoint() === 'sm'"
      [class.md:hidden]="hideBreakpoint() === 'md'"
      [class.lg:hidden]="hideBreakpoint() === 'lg'"
      style="padding-bottom: env(safe-area-inset-bottom, 0px);"
      aria-label="Navegación inferior móvil"
    >
      <div class="relative flex h-[76px] w-full items-stretch overflow-visible">
        <!-- SILUETA DE LA MONTAÑITA ANIMADA (INDICADOR ACTIVO) -->
        @if (items().length > 0 && activeIndex() >= 0) {
          <div
            class="pointer-events-none absolute left-0 top-[-20px] h-[96px] z-10 flex items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
            [style.width.%]="100 / items().length"
            [style.transform]="'translateX(' + (activeIndex() * 100) + '%)'"
          >
            <svg
              viewBox="0 0 124 96"
              preserveAspectRatio="none"
              class="h-[96px] transition-all duration-300 fill-[#2563eb] dark:fill-white drop-shadow-[0_-3px_8px_rgba(37,99,235,0.25)] dark:drop-shadow-[0_-4px_12px_rgba(0,0,0,0.5)]"
              [class]="mountainWidthClass()"
            >
              <path
                d="M0,20 C14.67,20 22,18 28,11 C36,0 36,0 62,0 C88,0 88,0 96,11 C102,18 109.33,20 124,20 L124,80 Q124,96 108,96 L16,96 Q0,96 0,80 Z"
              />
            </svg>
          </div>
        }

        <!-- LISTA DE ÍTEMS DE NAVEGACIÓN -->
        @for (item of items(); track item.label; let i = $index) {
          @if (item.subItems && item.subItems.length > 0) {
            <!-- Ítem agrupador 'Más' -->
            <button
              type="button"
              (click)="toggleMore()"
              [attr.aria-current]="isActive(i) ? 'page' : null"
              class="relative z-20 flex h-[76px] flex-1 flex-col items-center justify-center gap-1 select-none transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer"
              [class.-translate-y-2.5]="isActive(i)"
            >
              <!-- Icono -->
              <div class="relative flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="h-6 w-6 transition-colors duration-300"
                  [class]="isActive(i)
                    ? 'text-white dark:text-[#2563eb]'
                    : 'text-[#64748b] dark:text-[#7b8494]'"
                >
                  @for (d of getIconPaths(item.icon); track $index) {
                    <path [attr.d]="d" />
                  }
                </svg>

                @if (getItemBadge(item); as badgeCount) {
                  <span class="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-black text-white shadow-xs ring-1 ring-white/60 dark:ring-black/40">
                    {{ badgeCount > 99 ? '99+' : badgeCount }}
                  </span>
                }
              </div>

              <!-- Etiqueta -->
              <span
                class="text-[12px] leading-tight transition-colors duration-300 truncate max-w-[70px] text-center"
                [class]="isActive(i)
                  ? 'font-bold text-white dark:text-[#0d1424]'
                  : 'font-normal text-[#64748b] dark:text-[#7b8494]'"
              >
                {{ item.label }}
              </span>
            </button>
          } @else {
            <!-- Ítem de enlace regular -->
            <a
              [routerLink]="item.route"
              (click)="onItemClick(item, i)"
              [attr.aria-current]="isActive(i) ? 'page' : null"
              class="relative z-20 flex h-[76px] flex-1 flex-col items-center justify-center gap-1 select-none transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer"
              [class.-translate-y-2.5]="isActive(i)"
            >
              <!-- Icono -->
              <div class="relative flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="h-6 w-6 transition-colors duration-300"
                  [class]="isActive(i)
                    ? 'text-white dark:text-[#2563eb]'
                    : 'text-[#64748b] dark:text-[#7b8494]'"
                >
                  @for (d of getIconPaths(item.icon); track $index) {
                    <path [attr.d]="d" />
                  }
                </svg>

                @if (item.badge && item.badge > 0) {
                  <span
                    class="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-black text-white shadow-xs ring-1 ring-white/60 dark:ring-black/40"
                    [class]="item.badgeColor || 'bg-blue-600'"
                  >
                    {{ item.badge > 99 ? '99+' : item.badge }}
                  </span>
                }
              </div>

              <!-- Etiqueta -->
              <span
                class="text-[12px] leading-tight transition-colors duration-300 truncate max-w-[70px] text-center"
                [class]="isActive(i)
                  ? 'font-bold text-white dark:text-[#0d1424]'
                  : 'font-normal text-[#64748b] dark:text-[#7b8494]'"
              >
                {{ item.label }}
              </span>
            </a>
          }
        }
      </div>
    </nav>

    <!-- MENÚ FLOTANTE PARA EL ÍTEM 'MÁS' -->
    @if (moreOpen()) {
      <!-- Fondo oscuro de captura de clics -->
      <div
        class="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity"
        (click)="closeMore()"
      ></div>

      <!-- Menú emergente -->
      <div
        class="fixed inset-x-4 bottom-[90px] z-50 mx-auto max-w-sm rounded-2xl border border-slate-200 dark:border-[#1a2230] bg-white dark:bg-[#0b1018] p-3 shadow-2xl"
        style="margin-bottom: env(safe-area-inset-bottom, 0px);"
      >
        <div class="px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Más opciones
        </div>
        <div class="mt-1 space-y-1">
          @for (sub of getMoreSubItems(); track sub.route) {
            <a
              [routerLink]="sub.route"
              (click)="closeMore()"
              class="flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer"
              [class]="isRouteActive(sub.route)
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                : 'text-slate-700 dark:text-slate-300'"
            >
              <div class="flex items-center gap-3">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="h-5 w-5 shrink-0"
                >
                  @for (d of getIconPaths(sub.icon); track $index) {
                    <path [attr.d]="d" />
                  }
                </svg>
                <span>{{ sub.label }}</span>
              </div>
              @if (sub.badge && sub.badge > 0) {
                <span class="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-black text-white shadow-xs">
                  {{ sub.badge }}
                </span>
              }
            </a>
          }
        </div>
      </div>
    }
  `
})
export class BottomNavComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);

  /** Lista de ítems a mostrar en la barra */
  readonly items = input.required<BottomNavItem[]>();

  /** Breakpoint en el que la barra se oculta para escritorio */
  readonly hideBreakpoint = input<'sm' | 'md' | 'lg'>('sm');

  /** Índice del ítem actualmente activo */
  protected readonly activeIndex = signal<number>(0);

  /** Estado del menú flotante 'Más' */
  protected readonly moreOpen = signal<boolean>(false);

  private routerSub?: Subscription;

  ngOnInit(): void {
    this.updateActiveIndex();
    this.routerSub = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateActiveIndex();
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  protected isActive(index: number): boolean {
    return this.activeIndex() === index;
  }

  protected onItemClick(item: BottomNavItem, index: number): void {
    this.activeIndex.set(index);
    this.moreOpen.set(false);
  }

  protected toggleMore(): void {
    this.moreOpen.update((open) => !open);
  }

  protected closeMore(): void {
    this.moreOpen.set(false);
  }

  protected getMoreSubItems() {
    const moreItem = this.items().find((item) => item.subItems && item.subItems.length > 0);
    return moreItem?.subItems ?? [];
  }

  protected getItemBadge(item: BottomNavItem): number | null {
    if (item.badge && item.badge > 0) return item.badge;
    if (item.subItems) {
      const sum = item.subItems.reduce((acc, sub) => acc + (sub.badge || 0), 0);
      return sum > 0 ? sum : null;
    }
    return null;
  }

  protected getIconPaths(icon: string | string[]): string[] {
    return Array.isArray(icon) ? icon : [icon];
  }

  /** Ancho responsive para que la montañita encaje perfecto en el ancho del slot sin desbordar */
  protected readonly mountainWidthClass = computed(() => {
    const count = this.items().length;
    if (count <= 3) {
      return 'w-full max-w-[104px]';
    }
    if (count === 4) {
      return 'w-full max-w-[84px]';
    }
    return 'w-full max-w-[74px]';
  });

  protected isRouteActive(route: string): boolean {
    if (!route) return false;
    const current = this.router.url.split('?')[0].split('#')[0];
    if (route === current) return true;
    if (route !== '/' && (current.startsWith(route + '/') || current === route)) return true;

    // Casos especiales de rutas hijas o relacionadas
    if (route === '/mis-compras' && current.startsWith('/compras')) return true;

    return false;
  }

  private updateActiveIndex(): void {
    const list = this.items();
    if (!list || list.length === 0) {
      this.activeIndex.set(0);
      return;
    }

    const index = list.findIndex((item) => {
      if (this.isRouteActive(item.route)) return true;
      if (item.subItems?.some((sub) => this.isRouteActive(sub.route))) return true;
      return false;
    });

    if (index >= 0) {
      this.activeIndex.set(index);
    }
  }
}
