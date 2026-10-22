import { CurrencyPipe, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { toApiError } from '../../Services/Api.Service';
import { AdminNotificationService } from '../../Services/admin-notification.service';
import { AuthService } from '../../Services/auth.service';
import { CartService } from '../../Services/cart.service';
import { Product, ProductsService } from '../../Services/products.service';
import { ToastService } from '../../Services/imports.service';
import { ConfirmService } from '../../Services/confirm.service';
import {
  MOCK_PRODUCT_DETAILS,
  ProductDetailDrawerComponent,
  ProductDetailModel,
  RelatedCatalogCard
} from './ProductDetailDrawer.Component';
import Swal from 'sweetalert2';

export interface CatalogProduct extends Product {
  readonly image: string;
  readonly stockPercentage: number;
}

/**
 * Catálogo comercial moderno y profesional de Ferretería Firmeza.
 * Enfoque prioritario en los productos, fotografía real de materiales,
 * disponibilidad en tiempo real y flujo de compra ágil.
 */
@Component({
  selector: 'app-shop',
  imports: [FormsModule, RouterLink, CurrencyPipe, ProductDetailDrawerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-[1320px] mx-auto space-y-6 pb-12">
      <!-- CABECERA PRINCIPAL: TÍTULO, ESTADO Y RESUMEN DEL CARRITO -->
      <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Catálogo de Materiales
            </h1>
            <span class="rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/70 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
              Stock en vivo
            </span>
          </div>
          <p class="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Suministros certificados para construcción y remodelación con IVA del 19% incluido.
          </p>
        </div>

        <div class="flex items-center gap-3">
          @if (authService?.requiresProfileCompletion()) {
            <button
              type="button"
              (click)="showCompleteProfileModal()"
              class="inline-flex items-center gap-1.5 rounded-xl border border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50 px-3.5 py-2 text-xs font-bold text-[#1F5BFF] dark:text-blue-300 hover:bg-blue-100 transition cursor-pointer"
            >
              <span class="h-2 w-2 rounded-full bg-[#1F5BFF] animate-pulse"></span>
              Completar perfil comercial
            </button>
          } @else if (isCustomerPending()) {
            <button
              type="button"
              (click)="showPendingSweetAlert()"
              class="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 dark:border-amber-800/60 dark:bg-amber-950/40 px-3.5 py-2 text-xs font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition cursor-pointer"
            >
              <span class="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
              Cuenta en revisión
            </button>
          }

          <!-- Pastilla de acceso rápido al Carrito -->
          <a
            routerLink="/carrito"
            class="inline-flex items-center gap-2.5 rounded-xl bg-slate-900 dark:bg-white px-4 py-2 text-xs font-bold text-white dark:text-slate-900 shadow-sm transition hover:bg-[#1F5BFF] dark:hover:bg-blue-50 hover:shadow active:scale-98"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            <span>{{ cart.count() }} {{ cart.count() === 1 ? 'ítem' : 'ítems' }}</span>
            <span class="opacity-50">·</span>
            <span class="font-extrabold">{{ cart.total() | currency: 'COP' }}</span>
          </a>
        </div>
      </header>

      <!-- BARRA DE BÚSQUEDA Y FILTRADO INTEGRADO -->
      <section class="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs space-y-4">
        <!-- Fila superior: Input de búsqueda + Filtros rápidos -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <!-- Input de búsqueda con debounce -->
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
              placeholder="Buscar por código SKU, nombre o material (ej. CEM-001, Cemento, Varilla, Tubo)..."
              class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 py-2.5 pl-10 pr-24 text-sm font-medium text-slate-900 dark:text-white outline-none transition placeholder:text-slate-400 focus:border-[#1F5BFF] focus:bg-white dark:focus:bg-slate-900 focus:ring-3 focus:ring-blue-100 dark:focus:ring-blue-900/40"
            />
            <div class="absolute inset-y-1 right-1 flex items-center gap-1">
              @if (queryText) {
                <button
                  type="button"
                  (click)="clearSearch()"
                  class="rounded-lg px-2 py-1 text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                  title="Limpiar búsqueda"
                >
                  ✕
                </button>
              }
              <button
                type="submit"
                class="rounded-lg bg-slate-900 dark:bg-slate-700 hover:bg-[#1F5BFF] dark:hover:bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white transition cursor-pointer"
              >
                Buscar
              </button>
            </div>
          </form>

          <!-- Filtros de disponibilidad y orden -->
          <div class="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              (click)="toggleOnlyInStock()"
              class="flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition cursor-pointer"
              [class]="onlyInStock()
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'"
            >
              <span class="h-2 w-2 rounded-full" [class]="onlyInStock() ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'"></span>
              Solo con stock
            </button>

            <div class="relative flex items-center">
              <select
                [ngModel]="sortBy()"
                (ngModelChange)="onSortChange($event)"
                class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-3 pr-8 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none transition focus:border-blue-400 cursor-pointer"
              >
                <option value="default">Ordenar: Relevancia</option>
                <option value="price-asc">Menor precio</option>
                <option value="price-desc">Mayor precio</option>
                <option value="stock-desc">Mayor stock</option>
                <option value="name-asc">Nombre (A - Z)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Fila inferior: Pastillas de categorías con scroll suave -->
        <div class="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 no-scrollbar">
          <span class="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1 shrink-0">
            Categorías:
          </span>
          @for (cat of categories(); track cat) {
            <button
              type="button"
              (click)="onCategorySelect(cat)"
              class="rounded-xl px-3 py-1.5 text-xs font-bold transition shrink-0 cursor-pointer"
              [class]="selectedCategory() === cat
                ? 'bg-[#1F5BFF] text-white shadow-xs'
                : 'border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:border-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'"
            >
              {{ categoryLabel(cat) }}
            </button>
          }

          @if (queryText || selectedCategory() !== 'all' || onlyInStock()) {
            <button
              type="button"
              (click)="resetFilters()"
              class="rounded-xl border border-rose-200 bg-rose-50 dark:border-rose-900/60 dark:bg-rose-950/40 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition shrink-0 cursor-pointer ml-auto"
            >
              Limpiar filtros
            </button>
          }
        </div>
      </section>

      <!-- FEEDBACK DE ERROR O CARGA -->
      @if (errorMessage()) {
        <div class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          {{ errorMessage() }}
        </div>
      }

      @if (loading()) {
        <!-- Skeleton loader limpio -->
        <div class="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
          @for (_ of [1, 2, 3, 4, 5, 6, 7, 8]; track _) {
            <div class="animate-pulse rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 sm:p-4 space-y-2.5 sm:space-y-3">
              <div class="h-32 sm:h-48 w-full rounded-xl bg-slate-100 dark:bg-slate-800"></div>
              <div class="h-3.5 sm:h-4 w-3/4 rounded bg-slate-100 dark:bg-slate-800"></div>
              <div class="h-2.5 sm:h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800"></div>
              <div class="pt-1.5 sm:pt-2 flex justify-between items-center">
                <div class="h-5 sm:h-6 w-16 sm:w-24 rounded bg-slate-100 dark:bg-slate-800"></div>
                <div class="h-8 sm:h-9 w-14 sm:w-24 rounded-xl bg-slate-100 dark:bg-slate-800"></div>
              </div>
            </div>
          }
        </div>
      } @else {
        <!-- REJILLA PRINCIPAL DE PRODUCTOS (2x2 EN MÓVIL, RESPONSIVE) -->
        <div class="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
          @for (product of displayedProducts(); track product.id) {
            <article
              tabindex="0"
              role="button"
              [attr.aria-label]="'Ver detalle de ' + product.name"
              (click)="openProductDetail(product)"
              (keydown.enter)="openProductDetail(product)"
              class="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 sm:p-4 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-blue-400/70 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
            >
              <div>
                <!-- Cabecera de la tarjeta: Categoría y SKU -->
                <div class="flex items-center justify-between gap-1 text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
                  <span class="truncate rounded bg-slate-100 dark:bg-slate-800 px-1.5 sm:px-2 py-0.5 font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 max-w-[85px] sm:max-w-none">
                    {{ product.category }}
                  </span>
                  <span class="font-mono text-[9px] sm:text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
                    {{ product.sku }}
                  </span>
                </div>

                <!-- CONTENEDOR DE FOTOGRAFÍA REAL DEL MATERIAL -->
                <div class="relative h-32 sm:h-48 w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center group/img">
                  <img
                    [src]="product.image"
                    [alt]="product.name"
                    (error)="onImageError($event)"
                    loading="lazy"
                    class="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                  />

                  <!-- Badge de disponibilidad en esquina superior derecha -->
                  <div class="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 z-10">
                    <span
                      class="inline-flex items-center gap-1 sm:gap-1.5 rounded-full px-1.5 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-sm text-white backdrop-blur-md"
                      [class]="product.stock > 10
                        ? 'bg-emerald-600/90'
                        : product.stock > 0
                          ? 'bg-amber-600/90'
                          : 'bg-rose-600/90'"
                    >
                      @if (product.stock > 0) {
                        <span class="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-white animate-pulse"></span>
                      }
                      {{ product.stock > 10 ? 'En stock' : product.stock > 0 ? (product.stock <= 5 ? 'Últimas ' + product.stock : product.stock + ' disp.') : 'Agotado' }}
                    </span>
                  </div>

                  <!-- Unidad en esquina inferior izquierda -->
                  <div class="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 z-10">
                    <span class="rounded bg-black/60 backdrop-blur-md px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-white">
                      x {{ product.unit }}
                    </span>
                  </div>
                </div>

                <!-- DATOS DEL MATERIAL -->
                <div class="mt-2.5 sm:mt-3.5">
                  <h3 class="text-xs sm:text-base font-bold text-slate-900 dark:text-white leading-tight sm:leading-snug line-clamp-2 group-hover:text-[#1F5BFF] transition-colors" [title]="product.name">
                    {{ product.name }}
                  </h3>

                  @if (product.description) {
                    <p class="mt-1 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-1 sm:line-clamp-2 leading-relaxed">
                      {{ product.description }}
                    </p>
                  } @else {
                    <p class="mt-1 text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 italic line-clamp-1 sm:line-clamp-2">
                      Material certificado de alta calidad para obra civil.
                    </p>
                  }
                </div>
              </div>

              <!-- PIE DE TARJETA: PRECIO, BARRA DE DISPONIBILIDAD Y ACCIÓN -->
              <div class="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-800">
                <div class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5 sm:gap-2 mb-2">
                  <div>
                    <span class="text-base sm:text-xl font-black text-slate-950 dark:text-white tracking-tight">
                      {{ product.price | currency: 'COP' }}
                    </span>
                  </div>
                  <span class="w-fit text-[9px] sm:text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/80">
                    IVA 19% inc.
                  </span>
                </div>

                <!-- Barra de existencias -->
                <div class="mb-2.5 sm:mb-3">
                  <div class="flex items-center justify-between text-[9px] sm:text-[10px] font-semibold text-slate-400 dark:text-slate-500 mb-1">
                    <span class="hidden sm:inline">Disponibilidad</span>
                    <span class="sm:hidden">Stock</span>
                    <span class="font-bold text-slate-700 dark:text-slate-300">{{ product.stock }} {{ product.unit }}s</span>
                  </div>
                  <div class="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all duration-300"
                      [class]="product.stock > 10 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-rose-500'"
                      [style.width.%]="product.stockPercentage"
                    ></div>
                  </div>
                </div>

                <!-- ACCIONES DE COMPRA -->
                <div (click)="$event.stopPropagation()" (keydown)="$event.stopPropagation()">
                  @if (cart.quantityOf(product.id) > 0) {
                    <!-- Stepper interactivo dentro del carrito -->
                    <div class="flex items-center justify-between gap-1 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/70 dark:bg-blue-950/40 p-1">
                      <button
                        type="button"
                        (click)="decrementCart(product)"
                        class="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-slate-800 font-black text-slate-700 dark:text-slate-200 shadow-2xs transition hover:bg-slate-50 hover:text-blue-600 active:scale-95 cursor-pointer"
                        [title]="cart.quantityOf(product.id) === 1 ? 'Quitar del carrito' : 'Restar una unidad'"
                      >
                        <span class="text-sm sm:text-base leading-none">−</span>
                      </button>

                      <div class="flex flex-1 flex-col items-center justify-center px-0.5 sm:px-1">
                        <div class="flex items-center justify-center gap-0.5 sm:gap-1">
                          <input
                            type="number"
                            min="1"
                            [max]="product.stock"
                            [value]="cart.quantityOf(product.id)"
                            (focus)="onQuantityFocus($event)"
                            (input)="onQuantityInput(product, $event)"
                            (change)="onQuantityChange(product, $event)"
                            (keydown.enter)="onQuantityEnter($event)"
                            class="h-6 w-9 sm:h-7 sm:w-14 rounded border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 text-center font-mono text-[11px] sm:text-xs font-black text-blue-950 dark:text-blue-100 outline-none"
                            [attr.aria-label]="'Cantidad de ' + product.name"
                          />
                          <span class="text-[9px] sm:text-[10px] font-bold text-blue-900 dark:text-blue-300 truncate max-w-[36px] sm:max-w-[50px] hidden sm:inline" [title]="product.unit">
                            {{ product.unit }}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        (click)="incrementCart(product)"
                        [disabled]="cart.quantityOf(product.id) >= product.stock"
                        class="btn-catalog-cart-add flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 dark:bg-blue-600 font-black text-white shadow-2xs transition hover:bg-blue-700 dark:hover:bg-blue-500 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 cursor-pointer"
                        title="Agregar una unidad más"
                      >
                        <span class="text-sm sm:text-base leading-none">+</span>
                      </button>
                    </div>
                  } @else {
                    <!-- Botón normal para agregar -->
                    <button
                      type="button"
                      class="btn-catalog-cart-add flex h-8 sm:h-10 w-full items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-blue-600 dark:bg-blue-600 text-[11px] sm:text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 dark:hover:bg-blue-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:shadow-none cursor-pointer"
                      [disabled]="product.stock <= 0"
                      (click)="add(product)"
                    >
                      @if (product.stock <= 0) {
                        <span>Sin stock</span>
                      } @else {
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="h-3 w-3 sm:h-3.5 sm:w-3.5">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                        <span>Agregar<span class="hidden sm:inline"> al carrito</span></span>
                      }
                    </button>
                  }
                </div>
              </div>
            </article>
          } @empty {
            <div class="col-span-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-xs">
              <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#1F5BFF] dark:text-blue-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-7 w-7">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <h3 class="mt-4 text-base font-bold text-slate-800 dark:text-slate-100">No se encontraron materiales</h3>
              <p class="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                No hay productos que coincidan con "{{ queryText }}". Prueba con otro término o limpia los filtros.
              </p>
              <button
                type="button"
                (click)="resetFilters()"
                class="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-700 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#1F5BFF] cursor-pointer"
              >
                Ver todos los materiales
              </button>
            </div>
          }
        </div>
      }

      <!-- PAGINACIÓN -->
      @if (totalPages() > 1) {
        <nav class="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3.5 shadow-xs" aria-label="Paginación del catálogo">
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Página <span class="font-bold text-slate-900 dark:text-white">{{ page() }}</span> de <span class="font-bold text-slate-900 dark:text-white">{{ totalPages() }}</span> (Total {{ totalCount() }} materiales)
          </p>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              [disabled]="page() <= 1"
              (click)="goToPage(page() - 1)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="h-3.5 w-3.5">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Anterior
            </button>

            <span class="rounded-lg bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 text-xs font-bold text-[#1F5BFF] dark:text-blue-300 border border-blue-200 dark:border-blue-900/50">
              {{ page() }} / {{ totalPages() }}
            </span>

            <button
              type="button"
              class="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              [disabled]="page() >= totalPages()"
              (click)="goToPage(page() + 1)"
            >
              Siguiente
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="h-3.5 w-3.5">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </nav>
      }

      <!-- DRAWER DE DETALLE DE PRODUCTO -->
      <app-product-detail-drawer
        [isOpen]="drawerOpen()"
        [productInput]="selectedProductDetail()"
        [isLoadingInput]="drawerLoading()"
        [hasErrorInput]="drawerError()"
        [relatedProducts]="displayedProducts()"
        (closed)="closeProductDetail()"
        (addToCart)="onDrawerAddToCart($event)"
        (selectRelated)="openProductDetail($event)"
        (retry)="retryLoadSkuDetail()"
      />

      <!-- BOTÓN FLOTANTE AZUL DEL CARRITO (Exclusivo de Catálogo de Materiales) -->
      <a
        routerLink="/carrito"
        (click)="onFloatingCartClick()"
        [class.opacity-0]="drawerOpen()"
        [class.pointer-events-none]="drawerOpen()"
        class="fixed z-50 bottom-[148px] right-4 sm:bottom-8 sm:right-8 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-[#1a5cff] text-white shadow-2xl shadow-blue-500/40 ring-4 ring-white/80 dark:ring-slate-900/80 transition-all duration-300 hover:scale-110 hover:bg-blue-600 active:scale-95 cursor-pointer group"
        aria-label="Ir al carrito de compras"
        title="Ver carrito de compras"
      >
        <!-- Ícono del carrito -->
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-6 w-6 sm:h-7 sm:w-7 transition-transform duration-300 group-hover:scale-110"
        >
          <circle cx="8" cy="21" r="1" />
          <circle cx="19" cy="21" r="1" />
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
        </svg>

        <!-- Indicador numérico de productos en el carrito -->
        <span
          class="absolute -top-1 -right-1 flex min-h-[22px] min-w-[22px] sm:min-h-[24px] sm:min-w-[24px] items-center justify-center rounded-full px-1.5 text-xs font-black text-white shadow-md ring-2 ring-white dark:ring-slate-900 transition-transform duration-200"
          [class.bg-rose-600]="cart.count() > 0"
          [class.scale-110]="cart.count() > 0"
          [class.bg-slate-700]="cart.count() === 0"
        >
          {{ cart.count() > 99 ? '99+' : cart.count() }}
        </span>
      </a>
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
  private readonly route = inject(ActivatedRoute, { optional: true });
  private readonly location = inject(Location, { optional: true });

  protected onFloatingCartClick(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }

  protected readonly isCustomerPending = computed(() => this.authService?.isCustomerPending() ?? false);

  private static readonly CAPACITIES_KEY = 'firmeza_product_capacities';
  private static capacitiesCache: Record<string, number> | null = null;
  private static capacitiesDirty = false;
  private static capacitiesSaveTimeout?: ReturnType<typeof setTimeout>;

  private stockChangeSub?: Subscription;
  private routeSub?: Subscription;
  private searchDebounceTimeout?: ReturnType<typeof setTimeout>;

  protected readonly products = signal<Product[]>([]);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly page = signal(1);
  protected readonly totalPages = signal(0);
  protected readonly totalCount = signal(0);

  /** Estado del drawer lateral de detalle de producto */
  protected readonly drawerOpen = signal(false);
  protected readonly selectedProductDetail = signal<ProductDetailModel | null>(null);
  protected readonly drawerLoading = signal(false);
  protected readonly drawerError = signal(false);
  private pendingRouteSku: string | null = null;

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

    return list.map((p) => ({
      ...p,
      image: this.getProductImage(p),
      stockPercentage: this.stockPercentage(p)
    }));
  });

  private static hasShownPendingAlertInSession = false;

  protected showCompleteProfileModal(): void {
    const user = this.authService?.getUser();

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
            <input id="swal-doc" class="swal2-input" placeholder="Ej: 1020304050" style="margin:0; width: 100%; box-sizing: border-box; font-size: 13px; height: 38px;">
          </div>

          <div style="margin-bottom: 10px;">
            <label style="display:block; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 3px; color: #1e293b;">
              Teléfono de contacto <span style="color: #e11d48;">*</span>
            </label>
            <input id="swal-phone" class="swal2-input" placeholder="Ej: 3101234567" style="margin:0; width: 100%; box-sizing: border-box; font-size: 13px; height: 38px;">
          </div>

          <div style="margin-bottom: 10px;">
            <label style="display:block; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 3px; color: #1e293b;">
              Edad (años) <span style="color: #e11d48;">*</span>
            </label>
            <input id="swal-age" type="number" min="18" max="120" class="swal2-input" placeholder="Ej: 28" style="margin:0; width: 100%; box-sizing: border-box; font-size: 13px; height: 38px;">
          </div>

          <div style="margin-bottom: 4px;">
            <label style="display:block; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 3px; color: #1e293b;">
              Dirección de despacho (opcional)
            </label>
            <input id="swal-addr" class="swal2-input" placeholder="Ej: Calle 45 # 12-34" style="margin:0; width: 100%; box-sizing: border-box; font-size: 13px; height: 38px;">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Enviar Solicitud',
      cancelButtonText: 'Más tarde',
      confirmButtonColor: '#1F5BFF',
      cancelButtonColor: '#94a3b8',
      width: '480px',
      customClass: {
        popup: 'rounded-3xl shadow-2xl',
        confirmButton: 'rounded-xl px-5 py-2.5 font-bold text-xs uppercase tracking-wider',
        cancelButton: 'rounded-xl px-5 py-2.5 font-bold text-xs uppercase tracking-wider'
      },
      preConfirm: () => {
        const docInput = document.getElementById('swal-doc') as HTMLInputElement;
        const phoneInput = document.getElementById('swal-phone') as HTMLInputElement;
        const ageInput = document.getElementById('swal-age') as HTMLInputElement;
        const addrInput = document.getElementById('swal-addr') as HTMLInputElement;

        const documentNumber = docInput?.value?.trim();
        const phoneNumber = phoneInput?.value?.trim();
        const ageVal = parseInt(ageInput?.value?.trim() || '0', 10);
        const address = addrInput?.value?.trim();

        if (!documentNumber || documentNumber.length < 5) {
          Swal.showValidationMessage('Por favor ingresa un número de Cédula o NIT válido (mínimo 5 caracteres).');
          return false;
        }

        if (!phoneNumber || phoneNumber.length < 7) {
          Swal.showValidationMessage('Por favor ingresa un teléfono de contacto válido (mínimo 7 dígitos).');
          return false;
        }

        if (!ageVal || ageVal < 18 || ageVal > 120) {
          Swal.showValidationMessage('Debes ser mayor de edad (mínimo 18 años) para registrar una cuenta comercial.');
          return false;
        }

        return {
          document: documentNumber,
          phone: phoneNumber,
          age: ageVal,
          address: address || undefined
        };
      }
    }).then((result) => {
      if (!result.isConfirmed || !result.value || !this.authService) return;

      this.authService.completeProfile(result.value).subscribe({
        next: () => {
          void Swal.fire({
            icon: 'success',
            title: '¡Solicitud enviada con éxito!',
            html: `
              <div style="text-align: left; font-size: 14px; line-height: 1.6; padding: 4px 0;">
                <p style="margin-bottom: 8px;">
                  Tus datos han sido registrados correctamente y tu <strong>solicitud de cuenta de cliente</strong> ya está en la bandeja del administrador.
                </p>
                <p style="font-size: 12.5px; opacity: 0.85; margin-top: 10px; border-top: 1px dashed rgba(148, 163, 184, 0.4); padding-top: 8px;">
                  Mientras el administrador aprueba tu cuenta, puedes seguir cotizando y explorando los productos del catálogo.
                </p>
              </div>
            `,
            confirmButtonText: 'Explorar catálogo',
            confirmButtonColor: '#1F5BFF',
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
            confirmButtonColor: '#1F5BFF'
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
      confirmButtonColor: '#1F5BFF',
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

    this.routeSub = this.route?.paramMap?.subscribe((params) => {
      const sku = params.get('sku')?.trim() ?? null;
      if (sku) {
        this.pendingRouteSku = sku;
        this.resolveDirectSku(sku);
      }
    });

    this.load();
    this.stockChangeSub = this.notificationService.stockOrSaleChanged$.subscribe(() => {
      this.load(true);
    });
  }

  ngOnDestroy(): void {
    if (this.searchDebounceTimeout) {
      clearTimeout(this.searchDebounceTimeout);
    }
    ShopComponent.flushCapacities();
    this.stockChangeSub?.unsubscribe();
    this.routeSub?.unsubscribe();
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

  /**
   * Resuelve el tipo semántico de categoría para compatibilidad con pruebas unitarias y temas.
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
    if (text.includes('cemento') || text.includes('concreto') || text.includes('mortero') || text.includes('cem-')) return 'cemento';
    if (text.includes('acero') || text.includes('hierro') || text.includes('varilla') || text.includes('malla') || text.includes('viga') || text.includes('ace-')) return 'acero';
    if (text.includes('ladrillo') || text.includes('bloque') || text.includes('adoquin') || text.includes('mampost') || text.includes('lad-') || text.includes('blo-')) return 'mamposteria';
    if (text.includes('tub') || text.includes('pvc') || text.includes('fontaner') || text.includes('plomer') || text.includes('codo') || text.includes('valvula')) return 'tuberia';
    if (text.includes('herramienta') || text.includes('pala') || text.includes('martillo') || text.includes('carretilla') || text.includes('llave') || text.includes('alicate') || text.includes('taladro') || text.includes('her-')) return 'herramienta';
    if (text.includes('pintur') || text.includes('esmalte') || text.includes('estuco') || text.includes('yeso') || text.includes('ceramica') || text.includes('acabado') || text.includes('brocha') || text.includes('pin-')) return 'acabados';
    if (text.includes('electr') || text.includes('cable') || text.includes('breaker') || text.includes('toma') || text.includes('interruptor') || text.includes('ele-')) return 'electrico';
    if (text.includes('arena') || text.includes('agregado') || text.includes('grava') || text.includes('gravilla') || text.includes('triturado') || text.includes('are-')) return 'agregados';
    if (text.includes('madera') || text.includes('tabla') || text.includes('liston') || text.includes('triplay') || text.includes('triplex') || text.includes('mad-')) return 'madera';
    return 'general';
  }

  protected getCategoryGradient(product: Product): string {
    const type = this.getCategoryType(product);
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

  private static readonly imageCache = new Map<string, string>();

  /**
   * Obtiene la fotografía real del material según la categoría, SKU o nombre.
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

  protected openProductDetail(product: CatalogProduct | RelatedCatalogCard): void {
    const detail = ProductDetailDrawerComponent.fromCatalogProduct(product, product.image);
    this.drawerLoading.set(false);
    this.drawerError.set(false);
    this.selectedProductDetail.set(detail);
    this.drawerOpen.set(true);
    this.pendingRouteSku = detail.sku;
    this.location?.replaceState(`/producto/${encodeURIComponent(detail.sku)}`);
  }

  protected closeProductDetail(): void {
    this.drawerOpen.set(false);
    this.pendingRouteSku = null;
    this.location?.replaceState('/tienda');
  }

  protected onDrawerAddToCart(payload: { product: ProductDetailModel; quantity: number; unitPrice: number }): void {
    const { product, quantity, unitPrice } = payload;
    const catalogMatch = this.products().find(
      (p) => p.id === product.id || p.sku.toUpperCase() === product.sku.toUpperCase()
    );

    const targetProduct: Product = catalogMatch
      ? { ...catalogMatch, price: unitPrice }
      : {
          id: product.id,
          sku: product.sku,
          name: product.nombre,
          description: product.descripcion_corta,
          category: product.categoria,
          unit: product.unidad,
          price: unitPrice,
          stock: product.stock,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: null
        };

    const available = this.cart.availableToAdd(targetProduct);
    if (available <= 0) {
      this.toastService.error('No hay más unidades disponibles de este producto.');
      return;
    }

    const toAdd = Math.min(quantity, available);
    this.cart.add(targetProduct, toAdd);
    this.toastService.success(`${targetProduct.name} (${toAdd} ${targetProduct.unit}) agregado al carrito.`);
  }

  protected retryLoadSkuDetail(): void {
    if (this.pendingRouteSku) {
      this.resolveDirectSku(this.pendingRouteSku);
    }
  }

  private resolveDirectSku(sku: string): void {
    const normalized = sku.trim().toUpperCase();

    // 1. Verificar en los 3 productos mock si coincide el SKU (CEM-001, ACE-002, AGR-003)
    const mockFound = MOCK_PRODUCT_DETAILS.find((m) => m.sku.toUpperCase() === normalized);
    if (mockFound) {
      this.drawerLoading.set(false);
      this.drawerError.set(false);
      this.selectedProductDetail.set(mockFound);
      this.drawerOpen.set(true);
      return;
    }

    // 2. Verificar en los productos ya cargados del catálogo
    const existing = this.displayedProducts().find((p) => (p.sku || '').toUpperCase() === normalized);
    if (existing) {
      this.openProductDetail(existing);
      return;
    }

    // 3. Buscar por SKU en el servicio del catálogo
    this.drawerOpen.set(true);
    this.drawerLoading.set(true);
    this.drawerError.set(false);

    this.productsService
      .list({
        q: sku,
        onlyActive: true,
        page: 1,
        pageSize: 12
      })
      .subscribe({
        next: (res) => {
          this.drawerLoading.set(false);
          const match =
            res.items.find((p) => (p.sku || '').toUpperCase() === normalized) ?? res.items[0] ?? null;
          if (match) {
            const img = this.getProductImage(match);
            this.selectedProductDetail.set(ProductDetailDrawerComponent.fromCatalogProduct(match, img));
          } else {
            this.drawerError.set(true);
          }
        },
        error: () => {
          this.drawerLoading.set(false);
          this.drawerError.set(true);
        }
      });
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

          if (this.pendingRouteSku && !this.selectedProductDetail()) {
            const match = this.displayedProducts().find(
              (p) => (p.sku || '').toUpperCase() === this.pendingRouteSku!.toUpperCase()
            );
            if (match) {
              this.openProductDetail(match);
            }
          }
        },
        error: (error) => {
          this.loading.set(false);
          this.errorMessage.set(toApiError(error).message);
        }
      });
  }
}