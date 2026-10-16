import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { toApiError } from '../../Services/Api.Service';
import { AuthService } from '../../Services/auth.service';
import { CartLine, CartService } from '../../Services/cart.service';
import { Sale, SalesService } from '../../Services/sales.service';
import { ConfirmService } from '../../Services/confirm.service';
import { ToastService } from '../../Services/imports.service';
import { AdminNotificationService } from '../../Services/admin-notification.service';
import { Product, ProductsService } from '../../Services/products.service';
import { IconComponent } from '../Shared/Icon.Component';
import Swal from 'sweetalert2';

/**
 * Carrito y checkout profesional del portal del cliente.
 * Rediseño visual fiel con soporte completo para modo claro y oscuro,
 * flujo de pasos, tarjeta flotante de resumen y sección de productos sugeridos.
 */
@Component({
  selector: 'app-checkout',
  imports: [RouterLink, CurrencyPipe],
  template: `
    <div class="max-w-[1240px] mx-auto space-y-6 sm:space-y-8 pb-12">
      <!-- ENCABEZADO CON ENLACE Y STEPPER -->
      <div>
        <a
          routerLink="/tienda"
          class="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-[#1F5BFF] dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="h-4 w-4">
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span>Seguir comprando</span>
        </a>

        <div class="mt-3 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 class="text-[34px] font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Carrito de compras
            </h1>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Revisa tus materiales antes de confirmar el pedido.
            </p>
          </div>

          <!-- Indicador de pasos: 1 Carrito -> 2 Confirmación -> 3 Recibo -->
          <div class="flex items-center gap-2 sm:gap-3 py-1">
            <!-- Paso 1 (Activo) -->
            <div class="flex items-center gap-1.5 sm:gap-2">
              <span class="flex h-6 w-6 items-center justify-center rounded-full bg-[#1F5BFF] text-xs font-bold text-white shadow-sm">
                1
              </span>
              <span class="text-xs sm:text-sm font-bold text-[#1F5BFF]">
                Carrito
              </span>
            </div>

            <!-- Conector -->
            <div class="h-px w-5 sm:w-8 bg-slate-300 dark:bg-slate-700"></div>

            <!-- Paso 2 -->
            <div class="flex items-center gap-1.5 sm:gap-2">
              <span class="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-400 dark:text-slate-500">
                2
              </span>
              <span class="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500">
                Confirmación
              </span>
            </div>

            <!-- Conector -->
            <div class="h-px w-5 sm:w-8 bg-slate-300 dark:bg-slate-700"></div>

            <!-- Paso 3 -->
            <div class="flex items-center gap-1.5 sm:gap-2">
              <span class="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-400 dark:text-slate-500">
                3
              </span>
              <span class="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500">
                Recibo
              </span>
            </div>
          </div>
        </div>
      </div>

      @if (errorMessage(); as message) {
        <div class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          {{ message }}
        </div>
      }

      @if (cart.isEmpty()) {
        <!-- CARRITO VACÍO -->
        <div
          class="rounded-[24px] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-14 text-center relative overflow-hidden shadow-sm"
          style="background: radial-gradient(circle at 50% 0%, rgba(31, 91, 255, 0.08) 0%, transparent 70%);"
        >
          <!-- Icono de carrito blanco sobre un cuadrado azul degradado de 96px con radio 28px, sombra azul y rotación de -6° -->
          <div class="mx-auto mb-6 flex h-24 w-24 -rotate-6 items-center justify-center rounded-[28px] bg-gradient-to-br from-[#1F5BFF] to-blue-700 text-white shadow-xl shadow-blue-500/30 transform transition-transform duration-300 hover:rotate-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-11 w-11">
              <circle cx="8" cy="21" r="1.5" />
              <circle cx="19" cy="21" r="1.5" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
          </div>

          <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Tu carrito está vacío
          </h2>
          <p class="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Agrega materiales desde el catálogo para cotizar y confirmar tu pedido.
          </p>

          <a
            routerLink="/tienda"
            class="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1F5BFF] px-7 text-sm font-black text-white shadow-lg shadow-blue-500/25 transition hover:bg-[#1a4ed9] active:scale-[0.98]"
          >
            <span>Explorar catálogo</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="h-4 w-4">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>

          <!-- SECCIÓN: LO MÁS PEDIDO -->
          @if (featuredProducts().length > 0) {
            <div class="mt-14 pt-10 border-t border-slate-100 dark:border-slate-800 text-left">
              <div class="flex items-center justify-between mb-5">
                <div>
                  <h3 class="text-base font-black text-slate-900 dark:text-white">Lo más pedido</h3>
                  <p class="text-xs text-slate-400 mt-0.5">Suministros esenciales de alta rotación</p>
                </div>
                <a routerLink="/tienda" class="text-xs font-bold text-[#1F5BFF] hover:underline">
                  Ver todo el catálogo →
                </a>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                @for (product of featuredProducts(); track product.id) {
                  <div class="group relative flex items-center justify-between gap-3 rounded-[18px] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-sm transition hover:border-blue-300 hover:shadow-md dark:hover:border-slate-700">
                    <div class="flex items-center gap-3 min-w-0 flex-1">
                      <!-- Miniatura de 64px -->
                      <div class="w-16 h-16 rounded-xl shrink-0 overflow-hidden relative flex items-center justify-center p-1.5 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs {{ getCategoryGradient(product) }}">
                        <div class="pointer-events-none absolute inset-0 auth-grid opacity-20"></div>
                        <div class="relative z-10 flex items-center justify-center text-white/90">
                          @switch (getCategoryType(product)) {
                            @case ('cemento') {
                              <svg viewBox="0 0 64 64" fill="none" class="h-8 w-8 drop-shadow-sm">
                                <rect x="14" y="16" width="36" height="42" rx="4" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="2.5" />
                                <circle cx="32" cy="36" r="8" fill="currentColor" fill-opacity="0.25" stroke="currentColor" stroke-width="2" />
                              </svg>
                            }
                            @case ('acero') {
                              <svg viewBox="0 0 64 64" fill="none" class="h-8 w-8 drop-shadow-sm">
                                <path d="M12 16h40M12 48h40" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
                                <path d="M32 16v32" stroke="currentColor" stroke-width="6" stroke-linecap="round" />
                              </svg>
                            }
                            @case ('mamposteria') {
                              <svg viewBox="0 0 64 64" fill="none" class="h-8 w-8 drop-shadow-sm">
                                <rect x="10" y="14" width="20" height="10" rx="1.5" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" />
                                <rect x="34" y="14" width="20" height="10" rx="1.5" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" />
                                <rect x="10" y="40" width="20" height="10" rx="1.5" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" />
                              </svg>
                            }
                            @case ('tuberia') {
                              <svg viewBox="0 0 64 64" fill="none" class="h-8 w-8 drop-shadow-sm">
                                <path d="M12 28h22c4.4 0 8 3.6 8 8v16" stroke="currentColor" stroke-width="5" stroke-linecap="round" />
                                <circle cx="24" cy="28" r="6" fill="currentColor" fill-opacity="0.3" stroke="currentColor" stroke-width="2" />
                              </svg>
                            }
                            @case ('herramienta') {
                              <svg viewBox="0 0 64 64" fill="none" class="h-8 w-8 drop-shadow-sm">
                                <path d="M46 16a7 7 0 0 0-9 2l-18 26a3 3 0 0 0 4 4l18-26a7 7 0 0 0 5-6z" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                              </svg>
                            }
                            @default {
                              <svg viewBox="0 0 64 64" fill="none" class="h-8 w-8 drop-shadow-sm">
                                <rect x="12" y="14" width="40" height="36" rx="4" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="2.5" />
                                <path d="M12 24h40M26 24v26" stroke="currentColor" stroke-width="2" stroke-opacity="0.6" />
                              </svg>
                            }
                          }
                        </div>
                      </div>

                      <!-- Info -->
                      <div class="min-w-0 flex-1">
                        <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition" [title]="product.name">
                          {{ product.name }}
                        </h4>
                        <p class="text-[10px] text-slate-400 mt-0.5 truncate">
                          {{ product.category }} · {{ product.stock > 0 ? (product.stock > 10 ? 'En stock' : 'Pocas unid.') : 'Agotado' }}
                        </p>
                        <p class="text-xs font-black text-slate-950 dark:text-white mt-1">
                          {{ product.price | currency: 'COP' }}
                        </p>
                      </div>
                    </div>

                    <!-- Botón + cuadrado azul suave -->
                    <button
                      type="button"
                      class="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1F5BFF] dark:text-blue-400 hover:bg-[#1F5BFF] hover:text-white flex items-center justify-center font-black text-lg transition active:scale-95 shrink-0 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-blue-50 disabled:hover:text-[#1F5BFF] cursor-pointer"
                      [disabled]="product.stock <= 0"
                      [title]="product.stock <= 0 ? 'Sin existencias' : 'Agregar 1 al carrito'"
                      (click)="addFeaturedProduct(product)"
                    >
                      +
                    </button>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <!-- CARRITO CON PRODUCTOS (LAYOUT 2 COLUMNAS) -->
        <div class="grid gap-6 lg:gap-8 lg:grid-cols-[1fr_400px] lg:items-start">
          <!-- COLUMNA IZQUIERDA: LISTA DE PRODUCTOS -->
          <div class="overflow-hidden rounded-[22px] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <!-- Encabezado de la tarjeta -->
            <div class="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div class="flex items-center gap-2 font-black text-slate-900 dark:text-white text-base sm:text-lg">
                <span>Tus productos</span>
                <span class="text-slate-400 dark:text-slate-600 font-normal">·</span>
                <span class="text-slate-500 dark:text-slate-400 text-sm font-semibold">
                  {{ cart.count() }} {{ cart.count() === 1 ? 'ítem' : 'ítems' }}
                </span>
              </div>
              <button
                type="button"
                class="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                [disabled]="saving()"
                (click)="clear()"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3.5 w-3.5">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                <span>Vaciar carrito</span>
              </button>
            </div>

            <!-- Filas de productos -->
            <div class="divide-y divide-slate-100 dark:divide-slate-800/60">
              @for (line of cart.lines(); track line.product.id) {
                <div class="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <!-- Lado izquierdo: Miniatura de 84px + Info -->
                  <div class="flex items-center gap-4 min-w-0 flex-1">
                    <!-- Miniatura de 84px con radio 14px -->
                    <div class="w-[84px] h-[84px] rounded-[14px] shrink-0 overflow-hidden relative flex items-center justify-center p-2 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs {{ getCategoryGradient(line.product) }}">
                      <div class="pointer-events-none absolute inset-0 auth-grid opacity-20"></div>
                      <div class="relative z-10 flex items-center justify-center text-white/90">
                        @switch (getCategoryType(line.product)) {
                          @case ('cemento') {
                            <svg viewBox="0 0 64 64" fill="none" class="h-11 w-11 drop-shadow-sm">
                              <rect x="14" y="16" width="36" height="42" rx="4" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="2.5" />
                              <path d="M14 24h36M14 48h36" stroke="currentColor" stroke-width="2" stroke-dasharray="2 2" />
                              <circle cx="32" cy="36" r="8" fill="currentColor" fill-opacity="0.25" stroke="currentColor" stroke-width="2" />
                              <path d="M28 36h8M32 32v8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
                            </svg>
                          }
                          @case ('acero') {
                            <svg viewBox="0 0 64 64" fill="none" class="h-11 w-11 drop-shadow-sm">
                              <path d="M12 16h40M12 48h40" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
                              <path d="M32 16v32" stroke="currentColor" stroke-width="6" stroke-linecap="round" />
                              <circle cx="16" cy="32" r="3" fill="currentColor" />
                              <circle cx="48" cy="32" r="3" fill="currentColor" />
                            </svg>
                          }
                          @case ('mamposteria') {
                            <svg viewBox="0 0 64 64" fill="none" class="h-11 w-11 drop-shadow-sm">
                              <rect x="10" y="14" width="20" height="10" rx="1.5" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" />
                              <rect x="34" y="14" width="20" height="10" rx="1.5" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" />
                              <rect x="10" y="40" width="20" height="10" rx="1.5" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" />
                              <rect x="34" y="40" width="20" height="10" rx="1.5" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" />
                            </svg>
                          }
                          @case ('tuberia') {
                            <svg viewBox="0 0 64 64" fill="none" class="h-11 w-11 drop-shadow-sm">
                              <path d="M12 28h22c4.4 0 8 3.6 8 8v16" stroke="currentColor" stroke-width="5" stroke-linecap="round" />
                              <circle cx="24" cy="28" r="6" fill="currentColor" fill-opacity="0.3" stroke="currentColor" stroke-width="2" />
                              <path d="M24 16v6M20 16h8" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
                            </svg>
                          }
                          @case ('herramienta') {
                            <svg viewBox="0 0 64 64" fill="none" class="h-11 w-11 drop-shadow-sm">
                              <path d="M20 14h16l-3 8h-10l-3-8z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
                              <path d="M46 16a7 7 0 0 0-9 2l-18 26a3 3 0 0 0 4 4l18-26a7 7 0 0 0 5-6z" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                            </svg>
                          }
                          @case ('acabados') {
                            <svg viewBox="0 0 64 64" fill="none" class="h-11 w-11 drop-shadow-sm">
                              <path d="M16 22l4 28a4 4 0 0 0 4 4h16a4 4 0 0 0 4-4l4-28H16z" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" />
                              <ellipse cx="32" cy="22" rx="16" ry="4" stroke="currentColor" stroke-width="2.5" />
                            </svg>
                          }
                          @case ('electrico') {
                            <svg viewBox="0 0 64 64" fill="none" class="h-11 w-11 drop-shadow-sm">
                              <circle cx="32" cy="32" r="22" fill="currentColor" fill-opacity="0.1" stroke="currentColor" stroke-width="2" stroke-dasharray="4 2" />
                              <path d="M36 12L22 34h12l-6 18 20-24H34l6-16z" fill="currentColor" fill-opacity="0.3" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" />
                            </svg>
                          }
                          @case ('agregados') {
                            <svg viewBox="0 0 64 64" fill="none" class="h-11 w-11 drop-shadow-sm">
                              <path d="M10 48c6-14 14-26 22-26s16 12 22 26H10z" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" />
                              <circle cx="28" cy="38" r="2" fill="currentColor" />
                              <circle cx="36" cy="36" r="2.5" fill="currentColor" />
                            </svg>
                          }
                          @case ('madera') {
                            <svg viewBox="0 0 64 64" fill="none" class="h-11 w-11 drop-shadow-sm">
                              <rect x="14" y="16" width="36" height="32" rx="3" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2.5" />
                              <path d="M22 16v32M32 16v32" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.5" />
                            </svg>
                          }
                          @default {
                            <svg viewBox="0 0 64 64" fill="none" class="h-11 w-11 drop-shadow-sm">
                              <rect x="12" y="14" width="40" height="36" rx="4" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="2.5" />
                              <path d="M12 24h40M26 24v26" stroke="currentColor" stroke-width="2" stroke-opacity="0.6" />
                              <circle cx="40" cy="37" r="6" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" />
                            </svg>
                          }
                        }
                      </div>
                    </div>

                    <!-- Datos del material -->
                    <div class="min-w-0 flex-1">
                      <h3 class="font-bold text-slate-900 dark:text-white text-base leading-snug line-clamp-2">
                        {{ line.product.name }}
                      </h3>
                      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span class="font-mono font-bold">{{ line.product.sku }}</span>
                        <span class="mx-1.5 text-slate-300 dark:text-slate-600">·</span>
                        <span>{{ line.product.price | currency: 'COP' }} / {{ line.product.unit }}</span>
                        <span class="mx-1.5 text-slate-300 dark:text-slate-600">·</span>
                        <span>IVA incl.</span>
                      </p>

                      <!-- Estado de stock -->
                      <div class="mt-2 flex items-center gap-1.5 text-xs font-semibold">
                        @if (line.product.stock > 10) {
                          <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
                          <span class="text-emerald-700 dark:text-emerald-400 font-bold">En stock</span>
                          <span class="text-[11px] text-slate-400">({{ line.product.stock }} disp.)</span>
                        } @else if (line.product.stock > 0) {
                          <span class="h-2 w-2 rounded-full bg-amber-500"></span>
                          <span class="text-amber-700 dark:text-amber-400 font-bold">Pocas unidades</span>
                          <span class="text-[11px] text-slate-400">({{ line.product.stock }} disp.)</span>
                        } @else {
                          <span class="h-2 w-2 rounded-full bg-rose-500"></span>
                          <span class="text-rose-700 dark:text-rose-400 font-bold">Agotado</span>
                        }
                      </div>
                    </div>
                  </div>

                  <!-- Lado derecho: Selector de cantidad + Total línea + Quitar -->
                  <div class="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <!-- Selector de cantidad con fondo azul suave -->
                    <div class="flex items-center gap-1.5 rounded-xl bg-[#F0F5FF] dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 p-1">
                      <button
                        type="button"
                        aria-label="Quitar una unidad"
                        class="flex h-8 w-8 items-center justify-center rounded-[9px] bg-white dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-200 shadow-2xs transition hover:bg-slate-50 hover:text-blue-600 active:scale-95"
                        (click)="cart.decrement(line.product.id)"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        [max]="line.product.stock"
                        [value]="line.quantity"
                        (focus)="onQuantityFocus($event)"
                        (input)="onQuantityInput(line.product.id, line.product.stock, $event)"
                        (change)="onQuantityChange(line.product.id, line.product.stock, $event)"
                        (keydown.enter)="onQuantityEnter($event)"
                        class="h-8 w-12 text-center font-mono text-sm font-black text-slate-900 dark:text-white bg-transparent outline-none"
                        [attr.aria-label]="'Cantidad de ' + line.product.name"
                      />
                      <button
                        type="button"
                        aria-label="Agregar una unidad"
                        class="flex h-8 w-8 items-center justify-center rounded-[9px] bg-white dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-200 shadow-2xs transition hover:bg-slate-50 hover:text-blue-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                        [disabled]="cart.quantityOf(line.product.id) >= line.product.stock"
                        (click)="cart.increment(line.product.id)"
                      >
                        +
                      </button>
                    </div>

                    <!-- Total de línea y acción Quitar -->
                    <div class="text-right min-w-[125px]">
                      <p class="text-[18px] font-black text-slate-900 dark:text-white tracking-tight">
                        {{ lineTotal(line.product.price, line.quantity) | currency: 'COP' }}
                      </p>
                      <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        Base: {{ lineBase(line.product.price, line.quantity) | currency: 'COP' }} · IVA: {{ lineIva(line.product.price, line.quantity) | currency: 'COP' }}
                      </p>
                      <button
                        type="button"
                        class="text-xs font-semibold text-rose-500 hover:text-rose-600 hover:underline cursor-pointer mt-1"
                        (click)="removeLine(line.product.id, line.product.name)"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- Franja inferior: banda verde suave con Despacho directo a pie de obra -->
            <div class="bg-emerald-50/90 dark:bg-emerald-950/30 border-t border-emerald-100 dark:border-emerald-900/50 p-4 px-6 rounded-b-[22px] flex items-center gap-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400">
                <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                <path d="M15 18H9" />
                <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14v10" />
                <circle cx="17" cy="18" r="2" />
                <circle cx="7" cy="18" r="2" />
              </svg>
              <span>Despacho directo a pie de obra</span>
            </div>
          </div>

          <!-- COLUMNA DERECHA: RESUMEN DEL PEDIDO (400px STICKY) -->
          <aside class="w-full lg:w-[400px] shrink-0 sticky top-[20px] rounded-[22px] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm">
            <h2 class="text-lg font-black text-slate-900 dark:text-white">Resumen del pedido</h2>

            <div class="mt-5 space-y-3 text-sm">
              <div class="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>Subtotal (base)</span>
                <span class="font-bold text-slate-900 dark:text-white">{{ cart.subtotalBase() | currency: 'COP' }}</span>
              </div>
              <div class="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>IVA ({{ (cart.taxes().rate * 100).toFixed(0) }}%)</span>
                <span class="font-bold text-slate-900 dark:text-white">{{ cart.iva() | currency: 'COP' }}</span>
              </div>
              <div class="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>Despacho</span>
                <span class="font-bold text-emerald-600 dark:text-emerald-400 text-xs bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/80">
                  A coordinar en obra
                </span>
              </div>

              <div class="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
                <div class="flex justify-between items-baseline">
                  <div>
                    <p class="text-xs font-bold text-slate-500 dark:text-slate-400">Total a pagar</p>
                    <p class="text-[10px] text-slate-400 dark:text-slate-500">IVA incluido · COP</p>
                  </div>
                  <div class="text-right">
                    <p class="text-[30px] font-black tracking-tight text-slate-950 dark:text-white leading-none">
                      {{ cart.total() | currency: 'COP' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            @if (isCustomerPending()) {
              <div class="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900 flex items-start gap-2.5 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-200">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <div>
                  <p class="font-bold">Cuenta pendiente de aprobación</p>
                  <p class="mt-0.5 text-amber-800/90 dark:text-amber-300/80 leading-relaxed text-[11px]">
                    Tu solicitud está siendo validada por la administración. Podrás enviar pedidos en cuanto sea aprobada.
                  </p>
                </div>
              </div>
            }

            <!-- Botón principal azul de 52px con sombra suave -->
            <button
              type="button"
              class="mt-6 h-[52px] w-full rounded-xl bg-[#1F5BFF] hover:bg-[#1a4ed9] text-base font-black text-white shadow-lg shadow-blue-500/25 transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              [disabled]="saving() || isCustomerPending()"
              (click)="confirmPurchase()"
            >
              <span>{{ saving() ? 'Procesando pedido…' : isCustomerPending() ? 'Cuenta en revisión' : 'Confirmar pedido' }}</span>
              @if (!saving() && !isCustomerPending()) {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="h-4 w-4">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              }
            </button>

            <!-- Tres líneas de confianza en cajas gris muy claro -->
            <div class="mt-6 space-y-2.5">
              <div class="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-100 dark:border-slate-800 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4 text-emerald-500 shrink-0">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Conexión segura TLS 1.3</span>
              </div>

              <div class="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-100 dark:border-slate-800 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4 text-blue-500 shrink-0">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <span>Recibo en PDF al confirmar</span>
              </div>

              <div class="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-100 dark:border-slate-800 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4 text-amber-500 shrink-0">
                  <path d="m9 12 2 2 4-4" />
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                </svg>
                <span>Stock verificado en tiempo real</span>
              </div>
            </div>
          </aside>
        </div>
      }
    </div>
  `
})
export class CheckoutComponent implements OnInit {
  protected readonly cart = inject(CartService);
  private readonly salesService = inject(SalesService);
  private readonly confirmService = inject(ConfirmService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly productsService = inject(ProductsService, { optional: true });
  protected readonly authService = inject(AuthService, { optional: true });

  protected readonly isCustomerPending = computed(() => this.authService?.isCustomerPending() ?? false);

  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly featuredProducts = signal<Product[]>([]);

  ngOnInit(): void {
    // Si el carrito está vacío o se entra directamente, cargar sugerencias para "Lo más pedido"
    if (this.productsService) {
      this.productsService.list({ pageSize: 4, onlyActive: true }).subscribe({
        next: (response) => {
          this.featuredProducts.set(response.items.slice(0, 4));
        },
        error: () => {}
      });
    }
  }

  protected lineTotal(price: number, quantity: number): number {
    return price * quantity;
  }

  protected lineBase(price: number, quantity: number): number {
    const total = price * quantity;
    const scale = 100;
    return Math.round((Math.abs(total) * scale + Number.EPSILON) / 1.19) / scale * Math.sign(total);
  }

  protected lineIva(price: number, quantity: number): number {
    return (price * quantity) - this.lineBase(price, quantity);
  }

  protected addFeaturedProduct(product: Product): void {
    const available = this.cart.availableToAdd(product);
    if (available <= 0) {
      this.toastService.error(`No hay existencias disponibles de ${product.name}`);
      return;
    }
    this.cart.add(product, 1);
    this.toastService.success(`${product.name} agregado al carrito.`);
  }

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

  protected onQuantityInput(productId: string, stock: number, event: Event): void {
    const input = event.target as HTMLInputElement | null;
    if (!input) return;

    const raw = input.value.trim();
    if (raw === '') return;

    const parsed = parseInt(raw, 10);
    if (Number.isNaN(parsed) || parsed < 1) return;

    if (parsed > stock) {
      input.value = String(stock);
      this.cart.setQuantity(productId, stock);
      this.toastService.info(`Tope de existencias: máximo ${stock} unidades.`);
      return;
    }

    this.cart.setQuantity(productId, parsed);
  }

  protected onQuantityChange(productId: string, stock: number, event: Event): void {
    const input = event.target as HTMLInputElement | null;
    if (!input) return;

    const raw = input.value.trim();
    if (raw === '' || raw === '0') {
      if (raw === '0') {
        this.cart.remove(productId);
        this.toastService.info('Producto retirado del carrito.');
        return;
      }
      const current = this.cart.quantityOf(productId);
      input.value = String(current > 0 ? current : 1);
      return;
    }

    const parsed = parseInt(raw, 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      input.value = '1';
      this.cart.setQuantity(productId, 1);
      return;
    }

    const clamped = Math.min(parsed, stock);
    input.value = String(clamped);
    this.cart.setQuantity(productId, clamped);

    if (parsed > stock) {
      this.toastService.info(`Ajustado al stock máximo disponible (${stock} unidades).`);
    }
  }

  protected async removeLine(productId: string, name: string): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Quitar del carrito',
      message: `¿Quitar ${name} del carrito?`,
      confirmLabel: 'Quitar'
    });
    if (confirmed) {
      this.cart.remove(productId);
    }
  }

  protected async clear(): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Vaciar carrito',
      message: '¿Vaciar el carrito? Se quitarán todos los productos.',
      confirmLabel: 'Vaciar'
    });
    if (confirmed) {
      this.cart.clear();
    }
  }

  protected async confirmPurchase(): Promise<void> {
    if (this.saving() || this.cart.isEmpty()) return;

    if (this.isCustomerPending()) {
      void Swal.fire({
        icon: 'info',
        title: 'Cuenta pendiente de aprobación',
        text: 'Tu solicitud de cuenta de cliente aún está en proceso de validación. Podrás realizar pedidos tan pronto sea aprobada por la administración.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    const confirmed = await this.confirmService.confirm({
      title: 'Solicitar productos',
      message: `¿Enviar la solicitud por ${this.formatTotal()}? Un administrador la confirmará y luego marcará la entrega.`,
      confirmLabel: 'Solicitar',
      tone: 'default'
    });
    if (!confirmed) return;

    this.saving.set(true);
    this.errorMessage.set(null);

    const lines = this.cart
      .lines()
      .map((line) => ({ productId: line.product.id, quantity: line.quantity, unitPrice: line.product.price }));

    // customerId en null: el backend lo resuelve desde el correo del token, así el
    // cliente no puede comprar en nombre de otro. Si lo mandamos, la API lo ignora.
    // status Pending: el cliente solicita y el administrador confirma después.
    this.salesService.create({ customerId: null, status: 'Pending', lines }).subscribe({
      next: (sale) => {
        this.saving.set(false);
        this.cart.clear();
        AdminNotificationService.broadcastNewSale(sale.saleNumber);
        this.toastService.success(`Solicitud ${sale.saleNumber} enviada. Queda pendiente de confirmación.`);
        this.router.navigate(['/mis-compras']);
      },
      error: (error) => {
        const apiError = toApiError(error);
        this.saving.set(false);
        this.errorMessage.set(apiError.message);
        this.toastService.error(apiError.message);
      }
    });
  }

  private formatTotal(): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(
      this.cart.total()
    );
  }
}