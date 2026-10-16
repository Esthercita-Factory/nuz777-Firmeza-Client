import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { toApiError } from '../../Services/Api.Service';
import { AdminNotificationService } from '../../Services/admin-notification.service';
import { AuthService } from '../../Services/auth.service';
import { CartService } from '../../Services/cart.service';
import { Product, ProductsService } from '../../Services/products.service';
import { ToastService } from '../../Services/imports.service';
import { ConfirmService } from '../../Services/confirm.service';
import { IconComponent } from '../Shared/Icon.Component';
import Swal from 'sweetalert2';

export interface CatalogProduct extends Product {
  readonly image: string;
  readonly stockPercentage: number;
  readonly categoryType: string;
  readonly categoryGradient: string;
}

/**
 * Catálogo profesional del portal del cliente con diseño arquitectónico,
 * fondo de edificios, búsqueda en tiempo real, filtros por categoría y control
 * interactivo del carrito de compras.
 */
@Component({
  selector: 'app-shop',
  imports: [FormsModule, RouterLink, CurrencyPipe, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <!-- CABECERA COMPACTA DEL CATÁLOGO Y RESUMEN DEL CARRITO -->
      <section class="rounded-2xl border border-slate-800 bg-slate-950 p-5 sm:p-6 text-white shadow-sm">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-blue-300">
                <span class="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                Ferretería Firmeza
              </span>

              @if (isCustomerPending()) {
                <button
                  type="button"
                  (click)="onPendingBadgeClick()"
                  class="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-300 hover:bg-amber-500/25 transition-colors cursor-pointer"
                  title="Ver estado de tu solicitud de cuenta"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                  {{ authService?.requiresProfileCompletion() ? 'Completar registro · Enviar datos' : 'Cuenta en revisión · Más información' }}
                </button>
              }
            </div>

            <h1 class="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-white">
              Catálogo de Materiales
            </h1>
            <p class="mt-1 text-xs sm:text-sm text-slate-300">
              Existencias en tiempo real y precios directos con IVA del 19% incluido.
            </p>
          </div>

          <!-- RESUMEN COMPACTO DEL CARRITO -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4 lg:min-w-[360px]">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tu pedido</span>
                <span class="rounded-md bg-blue-500/20 px-2 py-0.5 text-[11px] font-bold text-blue-300">
                  {{ cart.count() }} {{ cart.count() === 1 ? 'ítem' : 'ítems' }}
                </span>
              </div>
              <p class="mt-1 text-xl font-black text-white tracking-tight">
                {{ cart.total() | currency: 'COP' }}
              </p>
              <p class="text-[11px] text-slate-400">
                Base: {{ cart.subtotalBase() | currency: 'COP' }} · IVA: {{ cart.iva() | currency: 'COP' }}
              </p>
            </div>

            <a
              routerLink="/carrito"
              class="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-black text-white transition-colors hover:bg-blue-500"
            >
              <app-icon name="cart" [size]="15" />
              <span>Ver carrito</span>
            </a>
          </div>
        </div>
      </section>

      <!-- BARRA DE BÚSQUEDA Y FILTRADO ORDENADA -->
      <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3.5">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <!-- Input de búsqueda -->
          <form class="relative flex-1" (ngSubmit)="search()">
            <span class="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
            <input
              name="q"
              [ngModel]="queryText"
              (ngModelChange)="onQueryTextChange($event)"
              placeholder="Buscar por código SKU, nombre o categoría (ej.: CEM-001, Cemento, Tubo)..."
              class="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-24 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
            />
            <div class="absolute inset-y-1 right-1.5 flex items-center gap-1">
              @if (queryText) {
                <button
                  type="button"
                  (click)="clearSearch()"
                  class="rounded-lg px-2 py-1 text-xs font-bold text-slate-400 hover:text-slate-700"
                  title="Limpiar búsqueda"
                >
                  ✕
                </button>
              }
              <button
                type="submit"
                class="rounded-lg bg-slate-950 px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-blue-600"
              >
                Buscar
              </button>
            </div>
          </form>

          <!-- Controles de stock y ordenamiento -->
          <div class="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              (click)="toggleOnlyInStock()"
              class="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-colors"
              [class]="onlyInStock() ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'"
            >
              <span class="h-2 w-2 rounded-full" [class]="onlyInStock() ? 'bg-emerald-500' : 'bg-slate-300'"></span>
              Solo disponibles
            </button>

            <select
              [ngModel]="sortBy()"
              (ngModelChange)="onSortChange($event)"
              class="rounded-xl border border-slate-300 bg-white py-2 pl-3 pr-8 text-xs font-bold text-slate-700 outline-none transition-colors focus:border-blue-400"
            >
              <option value="default">Ordenar: Relevancia</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
              <option value="stock-desc">Mayor disponibilidad</option>
              <option value="name-asc">Nombre (A - Z)</option>
            </select>
          </div>
        </div>

        <!-- Categorías en línea compacta -->
        <div class="border-t border-slate-100 pt-3 flex flex-wrap items-center gap-1.5">
          <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">Categorías:</span>
          @for (cat of categories(); track cat) {
            <button
              type="button"
              (click)="onCategorySelect(cat)"
              class="rounded-lg px-3 py-1 text-xs font-bold transition-colors"
              [class]="selectedCategory() === cat
                ? 'bg-blue-600 text-white'
                : 'border border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-900'"
            >
              {{ categoryLabel(cat) }}
            </button>
          }

          @if (queryText || selectedCategory() !== 'all' || onlyInStock()) {
            <button
              type="button"
              (click)="resetFilters()"
              class="ml-auto text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline"
            >
              Limpiar filtros
            </button>
          }
        </div>
      </section>

      <!-- MENSAJE DE ERROR -->
      @if (errorMessage(); as message) {
        <div class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800" role="alert">
          {{ message }}
        </div>
      }

      <!-- SKELETON DE CARGA LIGERO -->
      @if (loading()) {
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          @for (skeleton of [1,2,3,4,5,6,7,8]; track skeleton) {
            <div class="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
              <div class="flex items-center gap-3">
                <div class="h-11 w-11 rounded-xl bg-slate-100"></div>
                <div class="flex-1 space-y-1.5">
                  <div class="h-3 w-20 rounded bg-slate-100"></div>
                  <div class="h-4 w-3/4 rounded bg-slate-200"></div>
                </div>
              </div>
              <div class="h-3 w-full rounded bg-slate-100"></div>
              <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div class="h-6 w-24 rounded bg-slate-200"></div>
                <div class="h-9 w-28 rounded-xl bg-slate-100"></div>
              </div>
            </div>
          }
        </div>
      } @else {
        <!-- REJILLA DE PRODUCTOS ORDENADA Y SIN LAG -->
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          @for (product of displayedProducts(); track product.id) {
            <article class="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs transition-colors hover:border-blue-400">
              <div>
                <!-- Encabezado compacto de la tarjeta: Icono de categoría + SKU + Estado de stock -->
                <div class="flex items-start justify-between gap-2.5">
                  <div class="flex items-center gap-3 min-w-0">
                    <!-- Insignia compacta con color por categoría -->
                    <div
                      class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
                      [class]="product.categoryGradient"
                    >
                      @switch (product.categoryType) {
                        @case ('cemento') {
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
                            <rect x="5" y="4" width="14" height="16" rx="2" />
                            <path d="M5 9h14M5 15h14" />
                          </svg>
                        }
                        @case ('acero') {
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
                            <path d="M4 6h16M4 18h16M12 6v12" />
                          </svg>
                        }
                        @case ('mamposteria') {
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
                            <rect x="3" y="5" width="8" height="5" rx="1" />
                            <rect x="13" y="5" width="8" height="5" rx="1" />
                            <rect x="3" y="14" width="8" height="5" rx="1" />
                            <rect x="13" y="14" width="8" height="5" rx="1" />
                          </svg>
                        }
                        @case ('tuberia') {
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
                            <path d="M4 10h10a4 4 0 0 1 4 4v6" />
                            <path d="M4 7v6M15 20h6" />
                          </svg>
                        }
                        @case ('herramienta') {
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
                            <path d="m14.7 6.3 3 3L7 20H4v-3L14.7 6.3z" />
                          </svg>
                        }
                        @case ('acabados') {
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
                            <path d="M19 11H5m14 0a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2m14 0V9a2 2 0 0 0-2-2M5 11V9a2 2 0 0 1 2-2m0 0V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2M7 7h10" />
                          </svg>
                        }
                        @case ('electrico') {
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
                            <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
                          </svg>
                        }
                        @default {
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                          </svg>
                        }
                      }
                    </div>

                    <div class="min-w-0">
                      <div class="flex items-center gap-1.5">
                        <span class="font-mono text-[11px] font-bold text-slate-500">
                          {{ product.sku }}
                        </span>
                        <span class="text-slate-300">·</span>
                        <span class="truncate text-[11px] font-semibold text-blue-600">
                          {{ product.category }}
                        </span>
                      </div>
                      <h3 class="mt-0.5 text-sm font-black text-slate-950 line-clamp-1" [title]="product.name">
                        {{ product.name }}
                      </h3>
                    </div>
                  </div>

                  <!-- Badge de estado de stock -->
                  <span
                    class="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold"
                    [class]="product.stock > 10
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : product.stock > 0
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'"
                  >
                    {{ product.stock > 10 ? 'Disponible' : product.stock > 0 ? 'Últimas ' + product.stock : 'Agotado' }}
                  </span>
                </div>

                <!-- Descripción corta -->
                <p class="mt-2.5 text-xs text-slate-500 line-clamp-2 min-h-[2rem]">
                  {{ product.description || 'Material certificado para construcción y remodelación.' }}
                </p>
              </div>

              <!-- PIE DE TARJETA: PRECIO, INVENTARIO Y BOTÓN DE COMPRA -->
              <div class="mt-3.5 pt-3 border-t border-slate-100">
                <div class="flex items-baseline justify-between gap-2">
                  <div>
                    <span class="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Precio x {{ product.unit }}
                    </span>
                    <p class="text-lg font-black text-slate-950 tracking-tight">
                      {{ product.price | currency: 'COP' }}
                    </p>
                  </div>
                  <div class="text-right">
                    <span class="text-[10px] font-bold text-slate-500 block">
                      Stock: {{ product.stock }} {{ product.unit }}s
                    </span>
                    <span class="text-[10px] font-semibold text-emerald-600">
                      IVA 19% inc.
                    </span>
                  </div>
                </div>

                <!-- Barra sutil de stock -->
                <div class="mt-2 h-1 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    class="h-full rounded-full"
                    [class]="product.stock > 10 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-rose-500'"
                    [style.width.%]="product.stockPercentage"
                  ></div>
                </div>

                <!-- Control de carrito -->
                <div class="mt-3">
                  @if (cart.quantityOf(product.id) > 0) {
                    <div class="flex items-center justify-between gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1">
                      <button
                        type="button"
                        (click)="decrementCart(product)"
                        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white font-black text-slate-700 transition-colors hover:bg-slate-100"
                        [title]="cart.quantityOf(product.id) === 1 ? 'Quitar del carrito' : 'Restar una unidad'"
                      >
                        −
                      </button>

                      <div class="flex items-center justify-center gap-1 px-1">
                        <input
                          type="number"
                          min="1"
                          [max]="product.stock"
                          [value]="cart.quantityOf(product.id)"
                          (focus)="onQuantityFocus($event)"
                          (input)="onQuantityInput(product, $event)"
                          (change)="onQuantityChange(product, $event)"
                          (keydown.enter)="onQuantityEnter($event)"
                          class="h-7 w-14 rounded-lg border border-slate-300 bg-white px-1 text-center font-mono text-xs font-black text-slate-950 outline-none focus:border-blue-500"
                          [attr.aria-label]="'Cantidad de ' + product.name"
                        />
                        <span class="text-[11px] font-bold text-slate-500 truncate max-w-[55px]">
                          {{ product.unit }}
                        </span>
                      </div>

                      <button
                        type="button"
                        (click)="incrementCart(product)"
                        [disabled]="cart.quantityOf(product.id) >= product.stock"
                        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 font-black text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                        title="Agregar una unidad más"
                      >
                        +
                      </button>
                    </div>
                  } @else {
                    <button
                      type="button"
                      class="flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 text-xs font-bold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                      [disabled]="product.stock <= 0"
                      (click)="add(product)"
                    >
                      @if (product.stock <= 0) {
                        <span>Sin existencias</span>
                      } @else {
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="h-3.5 w-3.5">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                        <span>Agregar al carrito</span>
                      }
                    </button>
                  }
                </div>
              </div>
            </article>
          } @empty {
            <div class="rounded-2xl border border-slate-200 bg-white p-8 text-center sm:col-span-2 lg:col-span-3 xl:col-span-4">
              <h3 class="text-sm font-bold text-slate-900">No se encontraron productos</h3>
              <p class="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                No hay materiales que coincidan con la búsqueda actual.
              </p>
              <button
                type="button"
                (click)="resetFilters()"
                class="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-500"
              >
                Ver todos los productos
              </button>
            </div>
          }
        </div>
      }

      <!-- PAGINACIÓN COMPACTA -->
      @if (totalPages() > 1) {
        <nav class="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 shadow-2xs" aria-label="Paginación del catálogo">
          <p class="text-xs font-semibold text-slate-500">
            Página <span class="font-bold text-slate-900">{{ page() }}</span> de <span class="font-bold text-slate-900">{{ totalPages() }}</span> · {{ totalCount() }} materiales
          </p>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              [disabled]="page() <= 1"
              (click)="goToPage(page() - 1)"
            >
              Anterior
            </button>

            <span class="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-800">
              {{ page() }} / {{ totalPages() }}
            </span>

            <button
              type="button"
              class="flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              [disabled]="page() >= totalPages()"
              (click)="goToPage(page() + 1)"
            >
              Siguiente
            </button>
          </div>
        </nav>
      }
    </div>
  `
})
export class ShopComponent implements OnInit, OnDestroy {
  protected readonly cart = inject(CartService);
  private readonly productsService = inject(ProductsService);
  private readonly notificationService = inject(AdminNotificationService);
  private readonly toastService = inject(ToastService);
  private readonly confirmService = inject(ConfirmService);
  protected readonly authService = inject(AuthService, { optional: true });

  protected readonly isCustomerPending = computed(() => this.authService?.isCustomerPending() ?? false);

  private static readonly CAPACITIES_KEY = 'firmeza_product_capacities';
  private static capacitiesCache: Record<string, number> | null = null;
  private static capacitiesDirty = false;
  private static capacitiesSaveTimeout?: ReturnType<typeof setTimeout>;

  private stockChangeSub?: Subscription;
  private searchDebounceTimeout?: ReturnType<typeof setTimeout>;

  protected readonly products = signal<Product[]>([]);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly page = signal(1);
  protected readonly totalPages = signal(0);
  protected readonly totalCount = signal(0);

  protected queryText = '';
  protected readonly selectedCategory = signal<string>('all');
  protected readonly onlyInStock = signal<boolean>(false);
  protected readonly sortBy = signal<'default' | 'price-asc' | 'price-desc' | 'stock-desc' | 'name-asc'>('default');

  protected readonly defaultCategories = [
    'Cementos',
    'Aceros',
    'Mampostería',
    'Acabados',
    'Herramientas',
    'Tuberías',
    'Eléctricos'
  ];

  /** Lista de categorías disponibles para el filtro */
  protected readonly categories = computed(() => {
    const set = new Set<string>();
    for (const p of this.products()) {
      if (p.category && p.category.trim()) {
        set.add(p.category.trim());
      }
    }
    for (const def of this.defaultCategories) {
      set.add(def);
    }
    return ['all', ...Array.from(set)];
  });

  /** Lista calculada con filtros locales de ordenamiento y existencias, con view-model precalculado para alto rendimiento */
  protected readonly displayedProducts = computed<CatalogProduct[]>(() => {
    let list = [...this.products()];

    if (this.onlyInStock()) {
      list = list.filter((p) => p.stock > 0);
    }

    const sort = this.sortBy();
    if (sort === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sort === 'stock-desc') {
      list.sort((a, b) => b.stock - a.stock);
    } else if (sort === 'name-asc') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list.map((p) => {
      const categoryType = this.getCategoryType(p);
      return {
        ...p,
        image: this.getProductImage(p),
        stockPercentage: this.stockPercentage(p),
        categoryType,
        categoryGradient: this.getCategoryGradient(p, categoryType)
      };
    });
  });

  private static hasShownPendingAlertInSession = false;

  protected onPendingBadgeClick(): void {
    if (this.authService?.requiresProfileCompletion()) {
      this.showCompleteProfileModal();
    } else {
      this.showPendingSweetAlert();
    }
  }

  protected showCompleteProfileModal(): void {
    const user = this.authService?.getUser();
    const defaultName = user?.fullName || '';

    void Swal.fire({
      icon: 'info',
      title: '¡Completa tus datos comerciales!',
      html: `
        <div style="text-align: left; font-size: 13.5px; line-height: 1.5; padding: 4px 0;">
          <p style="margin-bottom: 12px; color: #475569;">
            Para enviar tu <strong>solicitud de cuenta de cliente</strong> al equipo administrativo y habilitar tus pedidos, por favor ingresa tus datos comerciales:
          </p>

          <div style="margin-bottom: 10px;">
            <label style="display:block; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 3px; color: #1e293b;">
              Cédula / NIT <span style="color: #e11d48;">*</span>
            </label>
            <input id="swal-doc" type="text" inputmode="numeric" placeholder="Ej.: 1020304050" class="swal2-input" style="width: 100%; margin: 0; height: 38px; font-size: 13px;" />
          </div>

          <div style="margin-bottom: 10px;">
            <label style="display:block; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 3px; color: #1e293b;">
              Teléfono / Celular <span style="color: #e11d48;">*</span>
            </label>
            <input id="swal-phone" type="tel" inputmode="numeric" placeholder="Ej.: 3101234567" class="swal2-input" style="width: 100%; margin: 0; height: 38px; font-size: 13px;" />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 8px; margin-bottom: 10px;">
            <div>
              <label style="display:block; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 3px; color: #1e293b;">
                Edad <span style="color: #e11d48;">*</span>
              </label>
              <input id="swal-age" type="number" min="18" max="120" value="18" class="swal2-input" style="width: 100%; margin: 0; height: 38px; font-size: 13px;" />
            </div>
            <div>
              <label style="display:block; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 3px; color: #1e293b;">
                Nombre comercial
              </label>
              <input id="swal-name" type="text" value="${defaultName}" placeholder="Nombre o Razón social" class="swal2-input" style="width: 100%; margin: 0; height: 38px; font-size: 13px;" />
            </div>
          </div>

          <div>
            <label style="display:block; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 3px; color: #1e293b;">
              Dirección de despacho (opcional)
            </label>
            <input id="swal-address" type="text" placeholder="Ej.: Carrera 10 # 20-30" class="swal2-input" style="width: 100%; margin: 0; height: 38px; font-size: 13px;" />
          </div>
        </div>
      `,
      confirmButtonText: 'Enviar solicitud comercial',
      confirmButtonColor: '#1a5cff',
      showCancelButton: true,
      cancelButtonText: 'Completar más tarde',
      cancelButtonColor: '#64748b',
      focusConfirm: false,
      allowOutsideClick: false,
      width: '460px',
      customClass: {
        popup: 'rounded-3xl shadow-2xl',
        confirmButton: 'rounded-xl px-5 py-2.5 font-bold text-xs uppercase tracking-wider',
        cancelButton: 'rounded-xl px-5 py-2.5 font-bold text-xs uppercase tracking-wider'
      },
      preConfirm: () => {
        const docInput = document.getElementById('swal-doc') as HTMLInputElement;
        const phoneInput = document.getElementById('swal-phone') as HTMLInputElement;
        const ageInput = document.getElementById('swal-age') as HTMLInputElement;
        const nameInput = document.getElementById('swal-name') as HTMLInputElement;
        const addressInput = document.getElementById('swal-address') as HTMLInputElement;

        const doc = docInput?.value.trim();
        const phone = phoneInput?.value.trim();
        const age = Number(ageInput?.value) || 18;
        const name = nameInput?.value.trim() || defaultName;
        const address = addressInput?.value.trim() || null;

        if (!doc) {
          Swal.showValidationMessage('Ingresa tu número de documento o NIT.');
          return false;
        }
        if (!/^\d+$/.test(doc)) {
          Swal.showValidationMessage('El documento debe contener únicamente números.');
          return false;
        }
        if (!phone) {
          Swal.showValidationMessage('Ingresa tu número de teléfono o celular.');
          return false;
        }
        if (!/^\d+$/.test(phone)) {
          Swal.showValidationMessage('El teléfono debe contener únicamente números.');
          return false;
        }
        if (age < 18) {
          Swal.showValidationMessage('Debes ser mayor de 18 años.');
          return false;
        }

        return { document: doc, phone, age, fullName: name, address };
      }
    }).then((result) => {
      if (!result.isConfirmed || !result.value) return;

      const data = result.value;
      this.authService?.completeProfile(data).subscribe({
        next: (updatedProfile) => {
          this.authService?.updateCurrentUser(updatedProfile);
          void Swal.fire({
            icon: 'success',
            title: '¡Solicitud enviada con éxito!',
            html: `
              <div style="font-size: 13.5px; line-height: 1.6; text-align: left;">
                <p style="margin-bottom: 8px;">Tus datos fueron registrados correctamente y enviados al <strong>equipo administrativo</strong> de Ferretería Firmeza.</p>
                <p style="font-size: 12.5px; color: #64748b;">Una vez validada tu información, se activarán tus pedidos. Mientras tanto, puedes explorar todo el catálogo de materiales y precios en tiempo real.</p>
              </div>
            `,
            confirmButtonText: 'Entendido, ver catálogo',
            confirmButtonColor: '#1a5cff',
            customClass: {
              popup: 'rounded-3xl shadow-2xl',
              confirmButton: 'rounded-xl px-5 py-2.5 font-bold text-xs uppercase tracking-wider'
            }
          });
        },
        error: (err) => {
          const apiErr = toApiError(err);
          void Swal.fire({
            icon: 'error',
            title: 'No se pudo enviar la solicitud',
            text: apiErr.message || 'Ocurrió un error al procesar tu solicitud. Por favor intenta de nuevo.',
            confirmButtonText: 'Reintentar',
            confirmButtonColor: '#1a5cff'
          }).then(() => {
            this.showCompleteProfileModal();
          });
        }
      });
    });
  }

  protected showPendingSweetAlert(): void {
    void Swal.fire({
      icon: 'info',
      title: 'Tu solicitud está en revisión',
      html: `
        <div style="text-align: left; font-size: 14px; line-height: 1.6; padding: 4px 0;">
          <p style="margin-bottom: 8px;">
            ¡Gracias por registrarte en <strong>Ferretería Firmeza</strong>!
          </p>
          <p style="margin-bottom: 8px;">
            Tu solicitud de cuenta de cliente se encuentra actualmente <strong>en proceso de validación</strong> por parte de nuestro equipo administrativo.
          </p>
          <p style="font-size: 12.5px; opacity: 0.85; margin-top: 12px; border-top: 1px dashed rgba(148, 163, 184, 0.4); padding-top: 10px;">
            Mientras tanto, puedes explorar libremente nuestro catálogo de materiales y precios de venta. En cuanto tu solicitud sea aprobada, podrás armar pedidos y solicitar despachos a pie de obra.
          </p>
        </div>
      `,
      confirmButtonText: 'Entendido, ver catálogo',
      confirmButtonColor: '#2563eb',
      width: '460px',
      customClass: {
        popup: 'rounded-3xl shadow-2xl',
        confirmButton: 'rounded-xl px-6 py-2.5 font-bold text-xs uppercase tracking-wider'
      }
    });
  }

  protected checkPendingCustomerAlert(): void {
    if (ShopComponent.hasShownPendingAlertInSession) return;
    if (this.authService?.requiresProfileCompletion()) {
      ShopComponent.hasShownPendingAlertInSession = true;
      this.showCompleteProfileModal();
    } else if (this.isCustomerPending()) {
      ShopComponent.hasShownPendingAlertInSession = true;
      this.showPendingSweetAlert();
    }
  }

  ngOnInit(): void {
    if (this.authService?.isAuthenticated()) {
      this.authService.me().subscribe({
        next: () => {
          this.checkPendingCustomerAlert();
        },
        error: () => {}
      });
    }
    this.checkPendingCustomerAlert();
    this.load();
    this.stockChangeSub = this.notificationService.stockOrSaleChanged$.subscribe(() => {
      // Recargar catálogo silenciosamente en tiempo real al confirmar ventas o actualizar stock
      this.load(true);
    });
  }

  ngOnDestroy(): void {
    if (this.searchDebounceTimeout) {
      clearTimeout(this.searchDebounceTimeout);
    }
    ShopComponent.flushCapacities();
    this.stockChangeSub?.unsubscribe();
  }

  protected onQueryTextChange(value: string): void {
    this.queryText = value;
    if (this.searchDebounceTimeout) {
      clearTimeout(this.searchDebounceTimeout);
    }
    this.searchDebounceTimeout = setTimeout(() => {
      this.search();
    }, 300);
  }

  protected search(): void {
    if (this.searchDebounceTimeout) {
      clearTimeout(this.searchDebounceTimeout);
      this.searchDebounceTimeout = undefined;
    }
    this.page.set(1);
    this.load();
  }

  protected clearSearch(): void {
    if (this.searchDebounceTimeout) {
      clearTimeout(this.searchDebounceTimeout);
      this.searchDebounceTimeout = undefined;
    }
    this.queryText = '';
    this.page.set(1);
    this.load();
  }

  protected onCategorySelect(cat: string): void {
    this.selectedCategory.set(cat);
    this.page.set(1);
    this.load();
  }

  protected categoryLabel(cat: string): string {
    return cat === 'all' ? 'Todas las categorías' : cat;
  }

  protected toggleOnlyInStock(): void {
    this.onlyInStock.update((val) => !val);
  }

  protected onSortChange(value: 'default' | 'price-asc' | 'price-desc' | 'stock-desc' | 'name-asc'): void {
    this.sortBy.set(value);
  }

  protected resetFilters(): void {
    if (this.searchDebounceTimeout) {
      clearTimeout(this.searchDebounceTimeout);
      this.searchDebounceTimeout = undefined;
    }
    this.queryText = '';
    this.selectedCategory.set('all');
    this.onlyInStock.set(false);
    this.sortBy.set('default');
    this.page.set(1);
    this.load();
  }

  protected goToPage(page: number): void {
    this.page.set(page);
    this.load();
  }

  private static getCapacities(): Record<string, number> {
    if (!ShopComponent.capacitiesCache) {
      try {
        const raw = localStorage.getItem(ShopComponent.CAPACITIES_KEY);
        ShopComponent.capacitiesCache = raw ? JSON.parse(raw) : {};
      } catch {
        ShopComponent.capacitiesCache = {};
      }
    }
    return ShopComponent.capacitiesCache!;
  }

  private static scheduleSaveCapacities(): void {
    if (ShopComponent.capacitiesSaveTimeout) return;
    ShopComponent.capacitiesSaveTimeout = setTimeout(() => {
      ShopComponent.capacitiesSaveTimeout = undefined;
      ShopComponent.flushCapacities();
    }, 250);
  }

  private static flushCapacities(): void {
    if (ShopComponent.capacitiesCache && ShopComponent.capacitiesDirty) {
      try {
        localStorage.setItem(ShopComponent.CAPACITIES_KEY, JSON.stringify(ShopComponent.capacitiesCache));
        ShopComponent.capacitiesDirty = false;
      } catch {
        // Ignorar fallback
      }
    }
  }

  /**
   * Obtiene o calcula la capacidad de referencia (tope visual) para el producto.
   * Utiliza caché en memoria para evitar accesos síncronos a localStorage en render.
   */
  private getCapacityFor(productId: string, currentStock: number): number {
    if (currentStock <= 0) return 1;

    const capacities = ShopComponent.getCapacities();
    const saved = capacities[productId];
    const nominalMilestone = this.calculateMilestone(currentStock);
    const capacity = Math.max(saved ?? 0, nominalMilestone, currentStock);

    if (saved !== capacity) {
      capacities[productId] = capacity;
      ShopComponent.capacitiesDirty = true;
      ShopComponent.scheduleSaveCapacities();
    }

    return capacity;
  }

  private calculateMilestone(stock: number): number {
    if (stock <= 0) return 10;
    if (stock <= 10) return 15;
    if (stock <= 25) return 30;
    if (stock <= 50) return 60;
    if (stock <= 100) return 120;
    return Math.ceil((stock * 1.1) / 10) * 10;
  }

  protected stockPercentage(product: Product): number {
    if (product.stock <= 0) return 0;
    const capacity = this.getCapacityFor(product.id, product.stock);
    const pct = Math.round((product.stock / capacity) * 100);
    return Math.min(100, Math.max(6, pct));
  }

  private static readonly imageCache = new Map<string, string>();

  /**
   * Obtiene la ruta de la fotografía representativa según el material, categoría o SKU.
   * Cuenta con memoización para alto rendimiento.
   */
  protected getProductImage(product: Product): string {
    const key = `${product.id || ''}_${product.sku || ''}_${product.name || ''}_${product.category || ''}`;
    const cached = ShopComponent.imageCache.get(key);
    if (cached) return cached;

    const computedImage = this.computeProductImage(product);
    ShopComponent.imageCache.set(key, computedImage);
    return computedImage;
  }

  private computeProductImage(product: Product): string {
    const text = `${product.sku || ''} ${product.name || ''} ${product.category || ''} ${product.description || ''}`.toLowerCase();

    if (text.includes('cemento') || text.includes('concreto') || text.includes('mortero') || text.includes('cem-')) {
      return 'img/products/cemento.jpg';
    }
    if (
      text.includes('arena') ||
      text.includes('agregado') ||
      text.includes('grava') ||
      text.includes('gravilla') ||
      text.includes('triturado') ||
      text.includes('are-')
    ) {
      return 'img/products/arena.jpg';
    }
    if (
      text.includes('ladrillo') ||
      text.includes('bloque') ||
      text.includes('mampost') ||
      text.includes('adoquin') ||
      text.includes('lad-')
    ) {
      return 'img/products/ladrillo.jpg';
    }
    if (
      text.includes('acero') ||
      text.includes('varilla') ||
      text.includes('hierro') ||
      text.includes('rebar') ||
      text.includes('malla') ||
      text.includes('alambr') ||
      text.includes('ace-')
    ) {
      return 'img/products/acero.jpg';
    }
    if (
      text.includes('tub') ||
      text.includes('pvc') ||
      text.includes('fontan') ||
      text.includes('plomer') ||
      text.includes('codo') ||
      text.includes('valvula')
    ) {
      return 'img/products/tuberia.jpg';
    }
    if (
      text.includes('herramienta') ||
      text.includes('equipo') ||
      text.includes('martillo') ||
      text.includes('taladro') ||
      text.includes('pala') ||
      text.includes('disco') ||
      text.includes('her-')
    ) {
      return 'img/products/herramientas.jpg';
    }
    if (
      text.includes('pintur') ||
      text.includes('acabado') ||
      text.includes('esmalte') ||
      text.includes('estuco') ||
      text.includes('impermeab') ||
      text.includes('pin-')
    ) {
      return 'img/products/pintura.jpg';
    }
    if (
      text.includes('electr') ||
      text.includes('cable') ||
      text.includes('ilumin') ||
      text.includes('breaker') ||
      text.includes('enchufe') ||
      text.includes('ele-')
    ) {
      return 'img/products/electrico.jpg';
    }
    if (
      text.includes('mader') ||
      text.includes('tabla') ||
      text.includes('liston') ||
      text.includes('triplay') ||
      text.includes('mad-')
    ) {
      return 'img/products/madera.jpg';
    }
    return 'img/products/general.jpg';
  }

  /** Manejo seguro de error 404/fallback para imágenes */
  protected onImageError(event: Event): void {
    const target = event.target as HTMLImageElement | null;
    if (target && !target.src.endsWith('img/products/general.jpg')) {
      target.src = 'img/products/general.jpg';
    }
  }

  /**
   * Resuelve el tipo semántico de categoría para renderizar el icono/ilustración SVG correspondiente.
   */
  protected getCategoryType(product: Product): string {
    const cat = (product.category || '').toLowerCase();
    if (cat.includes('cemento') || cat.includes('concreto') || cat.includes('mortero')) return 'cemento';
    if (cat.includes('acero') || cat.includes('hierro') || cat.includes('varilla') || cat.includes('malla')) return 'acero';
    if (cat.includes('ladrillo') || cat.includes('bloque') || cat.includes('mampost') || cat.includes('adoquin')) return 'mamposteria';
    if (cat.includes('tub') || cat.includes('pvc') || cat.includes('fontan') || cat.includes('plomer')) return 'tuberia';
    if (cat.includes('herramienta')) return 'herramienta';
    if (cat.includes('pintur') || cat.includes('acabado') || cat.includes('esmalte')) return 'acabados';
    if (cat.includes('electr')) return 'electrico';
    if (cat.includes('arena') || cat.includes('agregado') || cat.includes('grava')) return 'agregados';
    if (cat.includes('madera')) return 'madera';

    const text = `${product.sku || ''} ${product.name || ''} ${product.description || ''}`.toLowerCase();
    if (text.includes('cemento') || text.includes('concreto') || text.includes('mortero') || text.includes('cem-')) {
      return 'cemento';
    }
    if (text.includes('acero') || text.includes('hierro') || text.includes('varilla') || text.includes('malla') || text.includes('viga') || text.includes('ace-')) {
      return 'acero';
    }
    if (text.includes('ladrillo') || text.includes('bloque') || text.includes('adoquin') || text.includes('mampost') || text.includes('lad-') || text.includes('blo-')) {
      return 'mamposteria';
    }
    if (text.includes('tub') || text.includes('pvc') || text.includes('fontaner') || text.includes('plomer') || text.includes('codo') || text.includes('valvula')) {
      return 'tuberia';
    }
    if (text.includes('herramienta') || text.includes('pala') || text.includes('martillo') || text.includes('carretilla') || text.includes('llave') || text.includes('alicate') || text.includes('taladro') || text.includes('her-')) {
      return 'herramienta';
    }
    if (text.includes('pintur') || text.includes('esmalte') || text.includes('estuco') || text.includes('yeso') || text.includes('ceramica') || text.includes('acabado') || text.includes('brocha') || text.includes('pin-')) {
      return 'acabados';
    }
    if (text.includes('electr') || text.includes('cable') || text.includes('breaker') || text.includes('toma') || text.includes('interruptor') || text.includes('ele-')) {
      return 'electrico';
    }
    if (text.includes('arena') || text.includes('agregado') || text.includes('grava') || text.includes('gravilla') || text.includes('triturado') || text.includes('are-')) {
      return 'agregados';
    }
    if (text.includes('madera') || text.includes('tabla') || text.includes('liston') || text.includes('triplay') || text.includes('triplex') || text.includes('mad-')) {
      return 'madera';
    }
    return 'general';
  }

  /**
   * Asigna un degradado atmosférico con diseño industrial para la cabecera del material.
   */
  protected getCategoryGradient(product: Product, precomputedType?: string): string {
    const type = precomputedType ?? this.getCategoryType(product);
    switch (type) {
      case 'cemento':
        return 'bg-gradient-to-br from-slate-800 via-zinc-800 to-slate-900 text-slate-200';
      case 'acero':
        return 'bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 text-sky-200';
      case 'mamposteria':
        return 'bg-gradient-to-br from-amber-950 via-orange-950 to-stone-900 text-amber-200';
      case 'tuberia':
        return 'bg-gradient-to-br from-cyan-950 via-sky-900 to-slate-900 text-cyan-200';
      case 'herramienta':
        return 'bg-gradient-to-br from-amber-950 via-stone-900 to-slate-900 text-amber-300';
      case 'acabados':
        return 'bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 text-purple-200';
      case 'electrico':
        return 'bg-gradient-to-br from-yellow-950 via-amber-950 to-slate-950 text-yellow-300';
      case 'agregados':
        return 'bg-gradient-to-br from-stone-800 via-amber-950 to-stone-900 text-amber-200';
      case 'madera':
        return 'bg-gradient-to-br from-amber-950 via-yellow-950 to-stone-900 text-amber-200';
      default:
        return 'bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-blue-200';
    }
  }

  protected add(product: Product): void {
    const available = this.cart.availableToAdd(product);
    if (available <= 0) {
      this.toastService.error('No hay más unidades disponibles de este producto.');
      return;
    }

    this.cart.add(product, 1);
    this.toastService.success(`${product.name} agregado al carrito.`);
  }

  protected incrementCart(product: Product): void {
    const available = this.cart.availableToAdd(product);
    if (available <= 0) {
      this.toastService.error(`Alcanzaste el límite de existencias de ${product.name} (${product.stock} unid).`);
      return;
    }
    this.cart.increment(product.id);
  }

  protected decrementCart(product: Product): void {
    this.cart.decrement(product.id);
  }

  protected onQuantityFocus(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    if (input) {
      input.select();
    }
  }

  protected onQuantityEnter(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    if (input) {
      input.blur();
    }
  }

  protected onQuantityInput(product: Product, event: Event): void {
    const input = event.target as HTMLInputElement | null;
    if (!input) return;

    const raw = input.value.trim();
    if (raw === '') {
      return;
    }

    const parsed = parseInt(raw, 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      return;
    }

    if (parsed > product.stock) {
      input.value = String(product.stock);
      this.cart.setQuantity(product.id, product.stock);
      this.toastService.info(`Tope de existencias: máximo ${product.stock} ${product.unit}s.`);
      return;
    }

    this.cart.setQuantity(product.id, parsed);
  }

  protected onQuantityChange(product: Product, event: Event): void {
    const input = event.target as HTMLInputElement | null;
    if (!input) return;

    const raw = input.value.trim();
    if (raw === '' || raw === '0') {
      if (raw === '0') {
        this.cart.remove(product.id);
        this.toastService.info(`${product.name} retirado del carrito.`);
        return;
      }
      const current = this.cart.quantityOf(product.id);
      input.value = String(current > 0 ? current : 1);
      return;
    }

    const parsed = parseInt(raw, 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      input.value = '1';
      this.cart.setQuantity(product.id, 1);
      return;
    }

    const clamped = Math.min(parsed, product.stock);
    input.value = String(clamped);
    this.cart.setQuantity(product.id, clamped);

    if (parsed > product.stock) {
      this.toastService.info(`Ajustado al stock máximo disponible (${product.stock} ${product.unit}s).`);
    }
  }

  private load(silent = false): void {
    if (!silent) {
      this.loading.set(true);
    }
    this.errorMessage.set(null);

    const qParam = this.queryText.trim();
    const catParam = this.selectedCategory() !== 'all' ? this.selectedCategory() : undefined;

    this.productsService
      .list({
        q: qParam || undefined,
        category: catParam,
        onlyActive: true,
        page: this.page(),
        pageSize: 12
      })
      .subscribe({
        next: (response) => {
          this.loading.set(false);
          this.products.set(response.items);
          this.page.set(response.page);
          this.totalPages.set(response.totalPages);
          this.totalCount.set(response.totalCount);
          this.cart.syncWithProducts(response.items);
        },
        error: (error) => {
          this.loading.set(false);
          this.errorMessage.set(toApiError(error).message);
        }
      });
  }
}