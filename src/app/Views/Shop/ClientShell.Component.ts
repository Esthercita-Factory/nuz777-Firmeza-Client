import { Component, ElementRef, HostListener, ViewChild, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import Swal from 'sweetalert2';
import { toApiError } from '../../Services/Api.Service';
import { AuthService } from '../../Services/auth.service';
import { CartService } from '../../Services/cart.service';
import { LogoComponent } from '../Layout/Shell.Component';
import { BottomNavComponent, BottomNavItem } from '../Shared/BottomNav.Component';
import { IconComponent } from '../Shared/Icon.Component';
import { ThemeToggleComponent } from '../Shared/ThemeToggle.Component';
import { productDetailModalOpenSignal } from './ProductDetailDrawer.Component';

/**
 * Layout del portal del cliente. Es distinto del panel de administracion: el
 * cliente ve el catalogo, el carrito y su sesion, nada del inventario ni del
 * directorio de clientes.
 */
@Component({
  selector: 'app-client-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LogoComponent, IconComponent, ThemeToggleComponent, BottomNavComponent],
  template: `
    <div class="relative flex min-h-screen flex-col justify-between overflow-x-hidden bg-slate-50 text-slate-800">
      <!-- Barra superior limpia y ligera (en PC desaparece al abrir el detalle de producto y reaparece con animación suave al cerrarlo) -->
      <header
        class="sticky top-0 z-30 border-b border-slate-200 bg-white sm:transition-all sm:duration-300 sm:ease-out"
        [class.sm:opacity-0]="isProductDetailOpen()"
        [class.sm:-translate-y-full]="isProductDetailOpen()"
        [class.sm:pointer-events-none]="isProductDetailOpen()"
        [class.sm:opacity-100]="!isProductDetailOpen()"
        [class.sm:translate-y-0]="!isProductDetailOpen()"
      >
        <div class="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <a routerLink="/tienda" class="flex items-center gap-2.5 text-slate-950 transition hover:opacity-90">
            <app-logo size="sm" />
            <span class="text-xl font-black tracking-tight">Firmeza<span class="text-blue-600">.</span></span>
          </a>

          <nav class="ml-6 hidden items-center gap-1.5 sm:flex" aria-label="Navegación del cliente">
            <a
              routerLink="/tienda"
              routerLinkActive="bg-blue-50 text-blue-700 shadow-2xs font-black"
              class="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                <rect width="7" height="7" x="3" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="14" rx="1" />
                <rect width="7" height="7" x="3" y="14" rx="1" />
              </svg>
              Catálogo
            </a>
            <a
              routerLink="/carrito"
              routerLinkActive="bg-blue-50 text-blue-700 shadow-2xs font-black"
              class="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <app-icon name="cart" [size]="15" />
              Carrito
              @if (cart.count() > 0) {
                <span class="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-black text-white shadow-xs">{{ cart.count() }}</span>
              }
            </a>
            <a
              routerLink="/mis-compras"
              routerLinkActive="bg-blue-50 text-blue-700 shadow-2xs font-black"
              class="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <app-icon name="receipt" [size]="15" />
              Mis compras
            </a>
          </nav>

          <div class="ml-auto flex items-center gap-2 sm:gap-3">
            <!-- Carrito en móvil -->
            <a
              routerLink="/carrito"
              class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-600 shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 sm:hidden"
            >
              <app-icon name="cart" [size]="16" />
              @if (cart.count() > 0) {
                <span class="rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-black text-white">{{ cart.count() }}</span>
              }
            </a>

            <!-- Selector de modo oscuro/claro (a la izquierda del perfil) -->
            <div class="hidden sm:block">
              <app-theme-toggle size="sm" />
            </div>

            <!-- Perfil de usuario con menú desplegable animado (a la derecha de themetoggle) -->
            @if (authService.getUser(); as user) {
              <div #userMenuContainer class="relative">
                <button
                  type="button"
                  (click)="$event.stopPropagation(); toggleUserMenu()"
                  class="flex items-center gap-2 rounded-xl p-1.5 pr-2.5 transition hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer focus:outline-none"
                  [attr.aria-expanded]="userMenuOpen()"
                  aria-haspopup="true"
                  title="Opciones de perfil"
                >
                  @if (user.avatarUrl) {
                    <img
                      [src]="user.avatarUrl"
                      [alt]="user.fullName"
                      class="h-8 w-8 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shadow-2xs"
                      (error)="user.avatarUrl = null"
                    />
                  } @else {
                    <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 font-black text-xs text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                      {{ user.fullName.charAt(0).toUpperCase() }}
                    </span>
                  }
                  <div class="hidden text-left sm:block">
                    <p class="text-xs font-black text-slate-900 dark:text-slate-100 leading-tight">{{ user.fullName }}</p>
                    <p class="text-[10px] font-semibold text-slate-400">Cliente registrado</p>
                  </div>
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    class="h-3.5 w-3.5 text-slate-400 transition-transform duration-200"
                    [class.rotate-180]="userMenuOpen()"
                  >
                    <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
                  </svg>
                </button>

                @if (userMenuOpen()) {
                  <!-- Panel desplegable con animación de entrada y salida -->
                  <div
                    (click)="$event.stopPropagation()"
                    class="absolute right-0 top-full mt-2 z-50 w-64 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                    [class.dropdown-menu-enter]="!userMenuClosing()"
                    [class.dropdown-menu-leave]="userMenuClosing()"
                    role="menu"
                  >
                    <div class="flex items-center gap-3 px-3 py-2.5">
                      @if (user.avatarUrl) {
                        <img
                          [src]="user.avatarUrl"
                          [alt]="user.fullName"
                          class="h-9 w-9 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                        />
                      } @else {
                        <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 font-black text-sm text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                          {{ user.fullName.charAt(0).toUpperCase() }}
                        </span>
                      }
                      <div class="min-w-0 flex-1 text-left">
                        <p class="truncate text-xs font-black text-slate-900 dark:text-slate-100 leading-tight">{{ user.fullName }}</p>
                        <p class="truncate text-[11px] text-slate-500 dark:text-slate-400">{{ user.email }}</p>
                      </div>
                    </div>

                    <div class="my-1.5 h-px bg-slate-100 dark:bg-slate-800"></div>

                    <!-- Botón Borrar mis datos -->
                    <button
                      type="button"
                      [disabled]="deletingAccount()"
                      (click)="confirmDeleteAccount()"
                      class="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-50 cursor-pointer"
                    >
                      <app-icon name="trash" [size]="15" />
                      <span>{{ deletingAccount() ? 'Borrando...' : 'Borrar mis datos' }}</span>
                    </button>

                    <!-- Botón Cerrar sesión -->
                    <button
                      type="button"
                      (click)="logout()"
                      class="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4 text-slate-400">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </header>

      <!-- Contenedor central (z-20 para que los elementos flotantes como el carrito queden siempre por encima del footer) -->
      <main class="relative z-20 mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 pb-28 sm:pb-8">
        <router-outlet />
      </main>

      <!-- Pie de página con seguridad y datos empresariales (en PC desaparece al abrir el detalle de producto y reaparece con animación suave al cerrarlo) -->
      <footer
        class="relative z-10 border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-500 sm:transition-all sm:duration-300 sm:ease-out"
        [class.sm:opacity-0]="isProductDetailOpen()"
        [class.sm:translate-y-full]="isProductDetailOpen()"
        [class.sm:pointer-events-none]="isProductDetailOpen()"
        [class.sm:opacity-100]="!isProductDetailOpen()"
        [class.sm:translate-y-0]="!isProductDetailOpen()"
      >
        <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <p>© {{ year }} Firmeza · Materiales de Construcción y Ferretería. Todos los derechos reservados.</p>
          <div class="flex items-center gap-1.5 text-slate-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3.5 w-3.5 text-emerald-600">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span>Conexión segura TLS 1.3 · Compra directa sin intermediarios</span>
          </div>
        </div>
      </footer>

      <!-- BARRA DE NAVEGACIÓN INFERIOR PARA MÓVILES EN EL PORTAL DE CLIENTES -->
      <app-bottom-nav
        hideBreakpoint="sm"
        [items]="navItems()"
      />

      <!-- Botón flotante de Modo Claro / Oscuro para móvil -->
      <div class="sm:hidden">
        <app-theme-toggle variant="fab" positionClass="bottom-[88px] right-4" />
      </div>
    </div>
  `
})
export class ClientShellComponent {
  protected readonly authService = inject(AuthService);
  protected readonly cart = inject(CartService);
  private readonly router = inject(Router);
  protected readonly isProductDetailOpen = productDetailModalOpenSignal;

  protected readonly year = new Date().getFullYear();
  protected readonly deletingAccount = signal(false);
  protected readonly userMenuOpen = signal(false);
  protected readonly userMenuClosing = signal(false);
  private userMenuTimer: ReturnType<typeof setTimeout> | null = null;

  @ViewChild('userMenuContainer') private readonly userMenuContainer?: ElementRef<HTMLElement>;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.userMenuOpen() || this.userMenuClosing()) return;
    const target = event.target as Node | null;
    if (this.userMenuContainer?.nativeElement && !this.userMenuContainer.nativeElement.contains(target)) {
      this.closeUserMenu();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.userMenuOpen() && !this.userMenuClosing()) {
      this.closeUserMenu();
    }
  }

  protected readonly navItems = computed<BottomNavItem[]>(() => [
    {
      label: 'Catálogo',
      icon: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
      route: '/tienda'
    },
    {
      label: 'Carrito',
      icon: 'M2 3h2l2.4 11.4a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 2-1.6L21 7H6M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2M18 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2',
      route: '/carrito',
      badge: this.cart.count(),
      badgeColor: 'bg-amber-500'
    },
    {
      label: 'Mis compras',
      icon: [
        'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z',
        'M14 2v6h6',
        'M16 13H8',
        'M16 17H8'
      ],
      route: '/mis-compras'
    }
  ]);

  protected toggleUserMenu(): void {
    if (this.userMenuClosing()) return;
    if (this.userMenuOpen()) {
      this.closeUserMenu();
    } else {
      this.userMenuOpen.set(true);
    }
  }

  protected closeUserMenu(): void {
    if (!this.userMenuOpen() || this.userMenuClosing()) return;
    this.userMenuClosing.set(true);
    if (this.userMenuTimer) {
      clearTimeout(this.userMenuTimer);
    }
    this.userMenuTimer = setTimeout(() => {
      this.userMenuOpen.set(false);
      this.userMenuClosing.set(false);
      this.userMenuTimer = null;
    }, 150);
  }

  protected logout(): void {
    this.userMenuOpen.set(false);
    this.cart.clear();
    this.authService.logout(true);
  }

  protected confirmDeleteAccount(): void {
    this.userMenuOpen.set(false);
    if (this.deletingAccount()) return;

    void Swal.fire({
      icon: 'warning',
      title: '¿Borrar tu cuenta y todos tus datos?',
      html: `
        <p style="font-size: 14px; line-height: 1.5;">
          Esta acción es <strong>definitiva e irreversible</strong>. Se eliminará tu usuario, tus solicitudes, tu historial de compras y toda tu información registrada en Firmeza.
        </p>
      `,
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, borrar todos mis datos',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.deletingAccount.set(true);
      this.authService.deleteMyAccount().subscribe({
        next: () => {
          this.deletingAccount.set(false);
          this.cart.clear();
          this.authService.logout(false);
          void Swal.fire({
            icon: 'success',
            title: 'Usuario eliminado',
            text: 'Tu cuenta y todos tus datos han sido borrados correctamente.',
            timer: 2200,
            showConfirmButton: false
          }).then(() => {
            this.router.navigate(['/login']);
          });
        },
        error: (err) => {
          this.deletingAccount.set(false);
          void Swal.fire({
            icon: 'error',
            title: 'No se pudo eliminar',
            text: toApiError(err).message || 'Ocurrió un problema al intentar borrar tu cuenta.'
          });
        }
      });
    });
  }
}