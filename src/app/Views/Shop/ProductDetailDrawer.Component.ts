import {
  Component,
  ElementRef,
   EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  computed,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../Services/products.service';

/** Señal compartida para sincronizar la visibilidad del header y footer en PC mientras el modal de producto está abierto */
export const productDetailModalOpenSignal = signal<boolean>(false);

export interface VolumePriceScale {
  readonly desde: number;
  readonly hasta: number | null;
  readonly precio: number;
}

export interface ProductDetailModel {
  readonly id: string;
  readonly sku: string;
  readonly nombre: string;
  readonly categoria: string;
  readonly descripcion_corta: string;
  readonly descripcion_larga: string;
  readonly imagenes: readonly string[];
  readonly unidad: string;
  readonly unidad_detalle: string;
  readonly precio_base: number;
  readonly iva: number;
  readonly stock: number;
  readonly especificaciones: Readonly<Record<string, string>>;
  readonly escalas_precio: readonly VolumePriceScale[];
  readonly peso: string;
  readonly tiempo_entrega: string;
  readonly zonas_despacho?: string;
  readonly recogida_bodega?: string;
}

export interface RelatedCatalogCard {
  readonly id: string;
  readonly sku: string;
  readonly name: string;
  readonly description?: string | null;
  readonly category?: string | null;
  readonly unit: string;
  readonly price: number;
  readonly stock: number;
  readonly isActive: boolean;
  readonly image: string;
  readonly stockPercentage: number;
}

/**
 * Datos mock para los 3 perfiles solicitados:
 * 1. CEM-001: Producto en stock con galería e información completa
 * 2. ACE-002: Producto agotado (stock 0)
 * 3. AGR-003: Producto sin imagen (imagenes: []) y sin especificaciones opcionales
 */
export const MOCK_PRODUCT_DETAILS: readonly ProductDetailModel[] = [
  {
    id: 'mock-cem-001',
    sku: 'CEM-001',
    nombre: 'Cemento gris uso general UG 50 kg',
    categoria: 'Cementos',
    descripcion_corta: 'Cemento hidráulico de alta resistencia inicial para concreto estructural, morteros de pega y pañete.',
    descripcion_larga:
      'Cemento Portland tipo UG formulado para obras residenciales, comerciales e infraestructura liviana. Ofrece excelente trabajabilidad, tiempos de fraguado controlados y óptima adherencia en mezclas de concreto y mampostería estructural.',
    imagenes: [
      'img/products/cemento.jpg',
      'img/products/mamposteria.jpg',
      'img/products/arena.jpg',
      'img/products/general.jpg'
    ],
    unidad: 'Saco',
    unidad_detalle: 'por saco de 50 kg',
    precio_base: 27311,
    iva: 0.19,
    stock: 431,
    especificaciones: {
      Peso: '50 kg',
      'Norma NTC': 'NTC 121 / NTC 321',
      'Uso recomendado': 'Concreto estructural, morteros de pega y acabados',
      Rendimiento: '1.4 m² en pañete de 2 cm de espesor por saco'
    },
    escalas_precio: [
      { desde: 1, hasta: 49, precio: 32500 },
      { desde: 50, hasta: 199, precio: 30900 },
      { desde: 200, hasta: null, precio: 29400 }
    ],
    peso: '50 kg',
    tiempo_entrega: '24 a 48 horas hábiles en área metropolitana',
    zonas_despacho: 'Cobertura urbana y periférica con descarga a pie de obra en camión grúa o plataforma.',
    recogida_bodega: 'Disponible para retiro inmediato en patio de materiales principal de lunes a sábado (7:00 a 17:00).'
  },
  {
    id: 'mock-ace-002',
    sku: 'ACE-002',
    nombre: 'Varilla corrugada grado 60 de 1/2 pulgada x 6m',
    categoria: 'Aceros',
    descripcion_corta: 'Barra de acero microaleado de baja aleación para refuerzo de concreto sismorresistente.',
    descripcion_larga:
      'Barra de acero al carbono laminada en caliente con resaltes que garantizan máxima adherencia mecánica con el concreto. Diseñada para columnas, vigas, zapatas y losas bajo normativa colombiana de construcción sismorresistente NSR-10.',
    imagenes: [
      'img/products/acero.jpg',
      'img/products/herramientas.jpg',
      'img/products/cemento.jpg',
      'img/products/general.jpg'
    ],
    unidad: 'Barra',
    unidad_detalle: 'por barra de 6 m (5.96 kg)',
    precio_base: 23950,
    iva: 0.19,
    stock: 0,
    especificaciones: {
      Peso: '5.96 kg por barra',
      'Norma NTC': 'NTC 2289 (ASTM A706)',
      'Uso recomendado': 'Refuerzo de concreto en vigas, columnas y cimentaciones',
      Rendimiento: 'Longitud útil de 6.00 metros lineales por unidad'
    },
    escalas_precio: [
      { desde: 1, hasta: 49, precio: 28500 },
      { desde: 50, hasta: 199, precio: 27100 },
      { desde: 200, hasta: null, precio: 25800 }
    ],
    peso: '5.96 kg',
    tiempo_entrega: 'Sujeto a reposición de planta siderúrgica (3 a 5 días hábiles)',
    zonas_despacho: 'Despacho en vehículo de planchón de 6 metros para garantizar rectitud del material.',
    recogida_bodega: 'Retiro en bodega central previa confirmación de disponibilidad de lote.'
  },
  {
    id: 'mock-agr-003',
    sku: 'AGR-003',
    nombre: 'Arena lavada de río para concreto grueso',
    categoria: 'Agregados',
    descripcion_corta: 'Agregado fino natural libre de arcillas y materia orgánica para mezclas de alta resistencia.',
    descripcion_larga: '',
    imagenes: [],
    unidad: 'm³',
    unidad_detalle: 'por metro cúbico suelto',
    precio_base: 79832,
    iva: 0.19,
    stock: 85,
    especificaciones: {},
    escalas_precio: [
      { desde: 1, hasta: 49, precio: 95000 },
      { desde: 50, hasta: 199, precio: 89500 },
      { desde: 200, hasta: null, precio: 84000 }
    ],
    peso: '1.550 kg / m³',
    tiempo_entrega: 'Despacho programado en volqueta dentro de las próximas 24 horas',
    zonas_despacho: 'Entrega directa en volqueta sencilla o dobletroque según volumen solicitado.',
    recogida_bodega: 'Cargue directo con minicargador en patio de agregados.'
  }
];

type TabKey = 'descripcion' | 'especificaciones' | 'volumen' | 'entrega';

@Component({
  selector: 'app-product-detail-drawer',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (mounted()) {
      <div
        class="fixed inset-0 z-50 flex justify-end"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="product() ? 'drawer-product-title' : null"
      >
        <!-- Overlay oscuro al 45% (animación fade 200ms solo en PC, instantáneo en móvil) -->
        <div
          class="fixed inset-0 bg-black/45 transition-none sm:transition-opacity sm:duration-200"
          [class.sm:opacity-100]="visible()"
          [class.sm:opacity-0]="!visible()"
          (click)="requestClose()"
          aria-hidden="true"
        ></div>

        <!-- Panel Drawer:
             - Móvil (<640px): pantalla completa, 1 columna, sin animación
             - Tablet (640-1024px): 85% ancho
             - Escritorio (>1024px): máx 960px
             - Animación slide + fade 200ms únicamente en PC (>=640px) -->
        <aside
          #drawerPanel
          tabindex="-1"
          class="relative z-10 flex h-full w-full flex-col bg-white dark:bg-slate-900 border border-[#e5e7eb] dark:border-slate-800 rounded-none sm:rounded-[12px] sm:w-[85%] lg:w-full lg:max-w-[960px] outline-none overflow-hidden transition-none sm:transition-all sm:duration-200 sm:ease-out"
          [class.sm:translate-x-0]="visible()"
          [class.sm:opacity-100]="visible()"
          [class.sm:translate-x-8]="!visible()"
          [class.sm:opacity-0]="!visible()"
          (keydown)="onDrawerKeydown($event)"
        >
          <!-- Contenedor con scroll interno y padding de 20px -->
          <div class="flex-1 overflow-y-auto p-[20px] pb-28 sm:pb-[20px]">
            <!-- 1. CABECERA -->
            <header class="flex items-center justify-between gap-3 pb-4 border-b border-[#f3f4f6] dark:border-slate-800">
              <div class="flex flex-wrap items-center gap-2.5 min-w-0">
                @if (loading()) {
                  <div class="h-6 w-24 rounded bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
                  <div class="h-6 w-20 rounded bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
                } @else if (product(); as prod) {
                  <!-- Chip de categoría en mayúsculas pequeñas con letter-spacing sobre fondo gris claro -->
                  <span class="inline-flex items-center rounded-md bg-[#f3f4f6] dark:bg-slate-800 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[#374151] dark:text-slate-300">
                    {{ prod.categoria || 'GENERAL' }}
                  </span>

                  <!-- SKU en fuente monoespaciada con icono de copiar -->
                  <div class="inline-flex items-center gap-1.5 rounded-md border border-[#e5e7eb] dark:border-slate-700 bg-white dark:bg-slate-800/70 px-2 py-0.5">
                    <span class="font-mono text-[12px] font-normal text-[#4b5563] dark:text-slate-300">
                      {{ prod.sku }}
                    </span>
                    <button
                      type="button"
                      class="inline-flex h-6 w-6 items-center justify-center rounded text-[#6b7280] hover:text-[#111827] dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-[#2563eb] cursor-pointer"
                      aria-label="Copiar código SKU"
                      (click)="copySku(prod.sku)"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-3.5 w-3.5">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    </button>
                  </div>

                  @if (skuCopied()) {
                    <span
                      role="status"
                      aria-live="polite"
                      class="inline-flex items-center rounded bg-[#ecfdf5] dark:bg-emerald-950/60 px-2 py-0.5 text-[11px] font-medium text-[#059669] dark:text-emerald-400"
                    >
                      SKU copiado
                    </span>
                  }
                }
              </div>

              <!-- Derecha: botón X (32x32 en escritorio, 44x44 área táctil en móvil) -->
              <button
                #closeBtn
                type="button"
                aria-label="Cerrar detalle de producto"
                class="inline-flex h-11 w-11 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg border border-[#e5e7eb] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#4b5563] dark:text-slate-300 hover:bg-[#f9fafb] dark:hover:bg-slate-700 hover:text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563eb] cursor-pointer"
                (click)="requestClose()"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </header>

            <!-- ESTADO CARGANDO: Skeletons en imagen, título y precio -->
            @if (loading()) {
              <div class="mt-5 grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-6">
                <div>
                  <div class="h-[220px] sm:h-[230px] w-full rounded-[12px] bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
                  <div class="mt-3 grid grid-cols-4 gap-2">
                    <div class="h-[48px] rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
                    <div class="h-[48px] rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
                    <div class="h-[48px] rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
                    <div class="h-[48px] rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
                  </div>
                </div>
                <div class="space-y-4">
                  <div class="h-7 w-4/5 rounded bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
                  <div class="h-4 w-full rounded bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
                  <div class="h-9 w-1/2 rounded bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
                  <div class="h-4 w-2/3 rounded bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
                  <div class="h-12 w-full rounded bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
                  <div class="h-[42px] w-full rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
                </div>
              </div>
            } @else if (error()) {
              <!-- ESTADO ERROR -->
              <div class="my-12 flex flex-col items-center justify-center rounded-[12px] border border-[#e5e7eb] dark:border-slate-800 p-8 text-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" class="h-10 w-10 text-[#6b7280] mb-3">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4m0 4h.01" />
                </svg>
                <p class="text-[15px] font-medium text-[#111827] dark:text-slate-100">
                  No pudimos cargar el producto
                </p>
                <button
                  type="button"
                  class="mt-4 inline-flex h-[42px] items-center justify-center rounded-lg bg-[#2563eb] px-5 text-[13px] font-medium text-white hover:bg-[#1d4ed8] cursor-pointer"
                  (click)="retry.emit()"
                >
                  Reintentar
                </button>
              </div>
            } @else if (product(); as prod) {
              <!-- 2. CUERPO EN DOS COLUMNAS (en móvil una sola columna, tablet/escritorio 1fr / 1.15fr) -->
              <div class="mt-5 grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-6 items-start">
                <!-- COLUMNA IZQUIERDA (GALERÍA) -->
                <div class="min-w-0">
                  <div class="relative h-[220px] sm:h-[230px] w-full overflow-hidden rounded-[12px] border border-[#e5e7eb] dark:border-slate-800 bg-[#f3f4f6] dark:bg-slate-800/80">
                    @if (activeImage()) {
                      <button
                        type="button"
                        class="group relative block h-full w-full cursor-zoom-in focus:outline-none"
                        aria-label="Ampliar imagen del producto"
                        (click)="openLightbox()"
                      >
                        <img
                          [src]="activeImage()"
                          [alt]="prod.nombre"
                          (error)="onGalleryImageError()"
                          class="h-full w-full max-w-full object-cover"
                        />
                        <span class="pointer-events-none absolute bottom-2.5 right-2.5 inline-flex h-7 w-7 items-center justify-center rounded-md bg-white/90 text-[#111827] opacity-80 group-hover:opacity-100">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-3.5 w-3.5">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3M11 8v6M8 11h6" />
                          </svg>
                        </span>
                      </button>
                    } @else {
                      <!-- Producto sin imagen: placeholder gris con icono -->
                      <div class="flex h-full w-full flex-col items-center justify-center text-[#6b7280] dark:text-slate-400">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="h-10 w-10 mb-1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="m21 15-5-5L5 21" />
                        </svg>
                        <span class="text-[12px] font-normal">Sin imagen disponible</span>
                      </div>
                    }

                    <!-- Badge flotante arriba a la derecha: "En stock" (verde #059669, pill) o "Agotado" (rojo/rosa) -->
                    <div class="pointer-events-none absolute top-2.5 right-2.5">
                      @if (prod.stock > 0) {
                        <span class="inline-flex items-center gap-1.5 rounded-full bg-[#059669] px-2.5 py-1 text-[11px] font-medium text-white">
                          <span class="h-1.5 w-1.5 rounded-full bg-white"></span>
                          En stock
                        </span>
                      } @else {
                        <span class="inline-flex items-center gap-1.5 rounded-full bg-[#ffe4e6] border border-[#fecdd3] px-2.5 py-1 text-[11px] font-medium text-[#be123c]">
                          <span class="h-1.5 w-1.5 rounded-full bg-[#e11d48]"></span>
                          Agotado
                        </span>
                      }
                    </div>

                    <!-- Etiqueta de unidad abajo a la izquierda de la imagen (ej. "x Saco") -->
                    <div class="pointer-events-none absolute bottom-2.5 left-2.5">
                      <span class="inline-flex items-center rounded-md bg-white/95 dark:bg-slate-900/95 border border-[#e5e7eb] dark:border-slate-700 px-2 py-0.5 text-[11px] font-medium text-[#111827] dark:text-slate-200">
                        x {{ prod.unidad }}
                      </span>
                    </div>
                  </div>

                  <!-- Fila de 4 miniaturas de 48px de alto (scroll horizontal en móvil) -->
                  @if (galleryThumbnails().length > 0) {
                    <div class="mt-2.5 flex items-center gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-4 sm:overflow-visible">
                      @for (thumb of galleryThumbnails(); track $index) {
                        <button
                          type="button"
                          class="relative h-[48px] min-w-[64px] sm:min-w-0 overflow-hidden rounded-lg bg-[#f3f4f6] dark:bg-slate-800 focus:outline-none cursor-pointer"
                          [class.border-2]="selectedImageIndex() === $index"
                          [class.border-[#2563eb]]="selectedImageIndex() === $index"
                          [class.border]="selectedImageIndex() !== $index"
                          [class.border-[#e5e7eb]]="selectedImageIndex() !== $index"
                          [attr.aria-label]="'Ver miniatura ' + ($index + 1)"
                          (click)="selectThumbnail($index)"
                        >
                          <img
                            [src]="thumb.url"
                            [alt]="prod.nombre + ' vista ' + ($index + 1)"
                            [style.object-position]="thumb.position"
                            class="h-full w-full max-w-full object-cover"
                          />
                        </button>
                      }
                    </div>
                  }
                </div>

                <!-- COLUMNA DERECHA (INFORMACIÓN) -->
                <div class="min-w-0 flex flex-col">
                  <!-- Título del producto (22px, peso 500) -->
                  <h2
                    id="drawer-product-title"
                    class="text-[22px] leading-[1.25] font-medium text-[#111827] dark:text-slate-100"
                  >
                    {{ prod.nombre }}
                  </h2>

                  <!-- Descripción corta en gris (13px, peso 400) -->
                  @if (prod.descripcion_corta) {
                    <p class="mt-1.5 text-[13px] leading-[1.45] font-normal text-[#6b7280] dark:text-slate-400">
                      {{ prod.descripcion_corta }}
                    </p>
                  }

                  <!-- Precio en 28px peso 500, con la unidad al lado en gris -->
                  <div class="mt-4 flex flex-wrap items-baseline gap-2">
                    <span
                      class="text-[28px] leading-none font-medium"
                      [class.text-[#059669]]="hasVolumeDiscount()"
                      [class.text-[#111827]]="!hasVolumeDiscount()"
                      [class.dark:text-slate-100]="!hasVolumeDiscount()"
                    >
                      {{ formatCOP(activeUnitPrice()) }}
                    </span>
                    <span class="text-[13px] font-normal text-[#6b7280] dark:text-slate-400">
                      {{ prod.unidad_detalle }}
                    </span>
                  </div>

                  <!-- Línea de desglose: "Base COP 27.311 + IVA 19 % COP 5.189" -->
                  <p class="mt-1 text-[12px] font-normal text-[#6b7280] dark:text-slate-400">
                    Base {{ formatCOP(activeBasePrice()) }} + IVA {{ formatIvaPercent(prod.iva) }} % {{ formatCOP(activeIvaAmount()) }}
                  </p>

                  <!-- Disponibilidad: texto "Disponibilidad" a la izquierda y cantidad exacta a la derecha ("431 sacos"), con barra verde de 6px -->
                  <div class="mt-4 pt-3 border-t border-[#f3f4f6] dark:border-slate-800">
                    <div class="flex items-center justify-between text-[13px] mb-1.5">
                      <span class="font-normal text-[#6b7280] dark:text-slate-400">Disponibilidad</span>
                      <span class="font-medium text-[#111827] dark:text-slate-200">
                        @if (prod.stock > 0) {
                          {{ prod.stock }} {{ pluralizeUnit(prod.unidad, prod.stock) }}
                        } @else {
                          0 {{ pluralizeUnit(prod.unidad, 0) }}
                        }
                      </span>
                    </div>
                    <div class="h-[6px] w-full overflow-hidden rounded-full bg-[#e5e7eb] dark:bg-slate-800">
                      <div
                        class="h-full rounded-full"
                        [class.bg-[#059669]]="prod.stock > 0"
                        [class.bg-[#9ca3af]]="prod.stock <= 0"
                        [style.width.%]="prod.stock > 0 ? availabilityPercent() : 100"
                      ></div>
                    </div>
                  </div>

                  <!-- Selector de cantidad + Subtotal en vivo a la derecha -->
                  <div class="mt-4 flex items-center justify-between gap-4">
                    <div class="flex flex-col">
                      <span class="text-[12px] font-normal text-[#6b7280] dark:text-slate-400 mb-1">Cantidad</span>
                      <div class="inline-flex items-center rounded-lg border border-[#e5e7eb] dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5">
                        <button
                          type="button"
                          aria-label="Disminuir cantidad"
                          [disabled]="prod.stock <= 0 || quantity() <= 1"
                          class="inline-flex h-11 w-11 sm:h-8 sm:w-8 items-center justify-center rounded-md text-[#111827] dark:text-slate-200 hover:bg-[#f3f4f6] dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          (click)="decrementQty()"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3.5 w-3.5">
                            <path d="M5 12h14" />
                          </svg>
                        </button>

                        <input
                          type="number"
                          inputmode="numeric"
                          aria-label="Cantidad de unidades"
                          [disabled]="prod.stock <= 0"
                          [min]="1"
                          [max]="prod.stock"
                          [value]="quantityInputText()"
                          (input)="onQtyInput($event)"
                          (blur)="onQtyBlur($event)"
                          class="w-14 bg-transparent text-center text-[14px] font-medium text-[#111827] dark:text-slate-100 focus:outline-none disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />

                        <button
                          type="button"
                          aria-label="Aumentar cantidad"
                          [disabled]="prod.stock <= 0 || quantity() >= prod.stock"
                          class="inline-flex h-11 w-11 sm:h-8 sm:w-8 items-center justify-center rounded-md text-[#111827] dark:text-slate-200 hover:bg-[#f3f4f6] dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          (click)="incrementQty()"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3.5 w-3.5">
                            <path d="M12 5v14M5 12h14" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <!-- Subtotal en vivo a la derecha del selector -->
                    <div class="text-right">
                      <span class="block text-[12px] font-normal text-[#6b7280] dark:text-slate-400">Subtotal</span>
                      <span class="text-[18px] font-medium text-[#111827] dark:text-slate-100">
                        {{ prod.stock > 0 ? formatCOP(liveSubtotal()) : formatCOP(0) }}
                      </span>
                    </div>
                  </div>

                  <!-- Mensaje inline si se pasa del stock -->
                  @if (stockExceededMessage()) {
                    <p role="alert" class="mt-1.5 text-[12px] font-normal text-[#be123c] dark:text-rose-400">
                      {{ stockExceededMessage() }}
                    </p>
                  }

                  <!-- Botón de acción en tablet/escritorio (en móvil va en la barra sticky inferior) -->
                  <div class="mt-4 hidden sm:block">
                    @if (prod.stock > 0) {
                      <button
                        type="button"
                        class="inline-flex h-[42px] w-full items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-4 text-[14px] font-medium text-white hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-1 cursor-pointer"
                        (click)="handleAddToCart()"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                        Agregar al carrito
                      </button>
                    } @else {
                      <button
                        type="button"
                        class="inline-flex h-[42px] w-full items-center justify-center gap-2 rounded-lg border border-[#d1d5db] dark:border-slate-700 bg-[#f9fafb] dark:bg-slate-800 px-4 text-[14px] font-medium text-[#374151] dark:text-slate-200 hover:bg-[#f3f4f6] dark:hover:bg-slate-700 cursor-pointer"
                        (click)="handleNotifyWhenAvailable()"
                      >
                        {{ stockAlertRegistered() ? 'Aviso registrado para este producto' : 'Avísame cuando haya stock' }}
                      </button>
                    }
                  </div>
                </div>
              </div>

              <!-- 3. PESTAÑAS (debajo de ambas columnas) -->
              @if (availableTabs().length > 0) {
                <section class="mt-7 border-t border-[#e5e7eb] dark:border-slate-800 pt-4">
                  <!-- Cabecera de pestañas con scroll horizontal en móvil -->
                  <div
                    role="tablist"
                    aria-label="Información técnica del producto"
                    class="flex items-center gap-6 overflow-x-auto border-b border-[#e5e7eb] dark:border-slate-800 no-scrollbar"
                  >
                    @for (tab of availableTabs(); track tab.key) {
                      <button
                        type="button"
                        role="tab"
                        [attr.aria-selected]="activeTab() === tab.key"
                        class="whitespace-nowrap pb-2.5 text-[13px] font-medium border-b-2 -mb-px min-h-[44px] sm:min-h-0 flex items-center cursor-pointer"
                        [class.text-[#2563eb]]="activeTab() === tab.key"
                        [class.border-[#2563eb]]="activeTab() === tab.key"
                        [class.text-[#6b7280]]="activeTab() !== tab.key"
                        [class.border-transparent]="activeTab() !== tab.key"
                        (click)="activeTab.set(tab.key)"
                      >
                        {{ tab.label }}
                      </button>
                    }
                  </div>

                  <!-- Contenido de la pestaña activa (en escritorio >1024px puede mostrarse en dos columnas) -->
                  <div class="mt-4">
                    @switch (activeTab()) {
                      @case ('descripcion') {
                        @if (prod.descripcion_larga) {
                          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 text-[13px] leading-[1.6] font-normal text-[#4b5563] dark:text-slate-300">
                            <p>{{ prod.descripcion_larga }}</p>
                            <div class="rounded-lg border border-[#e5e7eb] dark:border-slate-800 bg-[#f9fafb] dark:bg-slate-800/40 p-3.5">
                              <p class="text-[12px] font-medium text-[#111827] dark:text-slate-200 mb-1">
                                Recomendación de almacenamiento en obra
                              </p>
                              <p class="text-[12px] font-normal text-[#6b7280] dark:text-slate-400">
                                Conservar sobre estibas secas bajo cubierta ventilada, aislado de la humedad del suelo y de la intemperie hasta su utilización.
                              </p>
                            </div>
                          </div>
                        }
                      }

                      @case ('especificaciones') {
                        @if (specEntries().length > 0) {
                          <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-8 border-t border-[#e5e7eb] dark:border-slate-800">
                            @for (entry of specEntries(); track entry[0]) {
                              <div class="flex items-center justify-between gap-4 py-2.5 border-b border-[#e5e7eb] dark:border-slate-800 text-[13px]">
                                <span class="font-normal text-[#6b7280] dark:text-slate-400">{{ entry[0] }}</span>
                                <span class="font-medium text-right text-[#111827] dark:text-slate-200">{{ entry[1] }}</span>
                              </div>
                            }
                          </div>
                        }
                      }

                      @case ('volumen') {
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                          <div class="overflow-hidden rounded-lg border border-[#e5e7eb] dark:border-slate-800">
                            <table class="w-full text-left border-collapse text-[13px]">
                              <thead>
                                <tr class="border-b border-[#e5e7eb] dark:border-slate-800 bg-[#f9fafb] dark:bg-slate-800/60 text-[#6b7280] dark:text-slate-400">
                                  <th class="py-2 px-3 font-medium">Rango ({{ pluralizeUnit(prod.unidad, 2) }})</th>
                                  <th class="py-2 px-3 font-medium text-right">Precio unitario</th>
                                </tr>
                              </thead>
                              <tbody>
                                @for (scale of prod.escalas_precio; track scale.desde) {
                                  <tr
                                    class="border-b last:border-b-0 border-[#e5e7eb] dark:border-slate-800"
                                    [class.bg-[#eff6ff]]="isScaleActive(scale)"
                                    [class.dark:bg-blue-950/30]="isScaleActive(scale)"
                                  >
                                    <td class="py-2.5 px-3 font-normal text-[#111827] dark:text-slate-200">
                                      <div class="flex items-center gap-2">
                                        <span>{{ formatScaleRange(scale) }}</span>
                                        @if (isScaleActive(scale)) {
                                          <span class="rounded bg-[#2563eb] px-1.5 py-0.5 text-[10px] font-medium text-white">
                                            Escala actual
                                          </span>
                                        }
                                      </div>
                                    </td>
                                    <td
                                      class="py-2.5 px-3 text-right font-medium"
                                      [class.text-[#059669]]="isBestPriceScale(scale)"
                                      [class.text-[#111827]]="!isBestPriceScale(scale)"
                                      [class.dark:text-slate-100]="!isBestPriceScale(scale)"
                                    >
                                      {{ formatCOP(scale.precio) }}
                                      @if (isBestPriceScale(scale)) {
                                        <span class="ml-1 text-[11px] font-normal text-[#059669]">(Mejor precio)</span>
                                      }
                                    </td>
                                  </tr>
                                }
                              </tbody>
                            </table>
                          </div>
                          <div class="rounded-lg border border-[#e5e7eb] dark:border-slate-800 p-3.5 text-[12px] text-[#6b7280] dark:text-slate-400">
                            <p class="font-medium text-[#111827] dark:text-slate-200 mb-1">
                              Aplicación automática por volumen
                            </p>
                            <p class="font-normal">
                              Al ajustar la cantidad en el selector superior, el precio unitario y el subtotal se actualizan de acuerdo con el tramo mayorista alcanzado.
                            </p>
                          </div>
                        </div>
                      }

                      @case ('entrega') {
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 text-[13px]">
                          <div class="rounded-lg border border-[#e5e7eb] dark:border-slate-800 p-3.5">
                            <p class="font-medium text-[#111827] dark:text-slate-200">Tiempo estimado</p>
                            <p class="mt-1 font-normal text-[#6b7280] dark:text-slate-400">
                              {{ prod.tiempo_entrega }}
                            </p>
                          </div>
                          <div class="rounded-lg border border-[#e5e7eb] dark:border-slate-800 p-3.5">
                            <p class="font-medium text-[#111827] dark:text-slate-200">Zonas de despacho</p>
                            <p class="mt-1 font-normal text-[#6b7280] dark:text-slate-400">
                              {{ prod.zonas_despacho || 'Cobertura en zona urbana e intermunicipal con transporte de carga propio.' }}
                            </p>
                          </div>
                          <div class="rounded-lg border border-[#e5e7eb] dark:border-slate-800 p-3.5 lg:col-span-2">
                            <p class="font-medium text-[#111827] dark:text-slate-200">Recogida en bodega</p>
                            <p class="mt-1 font-normal text-[#6b7280] dark:text-slate-400">
                              {{ prod.recogida_bodega || 'Disponible sin costo adicional en nuestra bodega central presentando el comprobante de pedido.' }}
                            </p>
                          </div>
                        </div>
                      }
                    }
                  </div>
                </section>
              }

              <!-- 4. PIE: "Productos relacionados" carrusel horizontal con las mismas tarjetas del catálogo -->
              @if (filteredRelatedProducts().length > 0) {
                <footer class="mt-7 border-t border-[#e5e7eb] dark:border-slate-800 pt-4">
                  <div class="flex items-center justify-between mb-3">
                    <h3 class="text-[14px] font-medium text-[#111827] dark:text-slate-100">
                      Productos relacionados
                    </h3>
                    <span class="text-[12px] font-normal text-[#6b7280] dark:text-slate-400">
                      Desliza para explorar
                    </span>
                  </div>

                  <div class="flex gap-3 overflow-x-auto pb-2 snap-x">
                    @for (rel of filteredRelatedProducts(); track rel.id) {
                      <article
                        class="snap-start shrink-0 w-[210px] rounded-[12px] border border-[#e5e7eb] dark:border-slate-800 bg-white dark:bg-slate-800/90 overflow-hidden cursor-pointer hover:border-[#2563eb] transition-colors flex flex-col"
                        (click)="selectRelated.emit(rel)"
                      >
                        <div class="relative h-28 w-full bg-[#f3f4f6] dark:bg-slate-900 overflow-hidden">
                          <img
                            [src]="rel.image"
                            [alt]="rel.name"
                            class="h-full w-full max-w-full object-cover"
                          />
                          <span
                            class="absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-medium"
                            [class.bg-[#059669]]="rel.stock > 0"
                            [class.text-white]="rel.stock > 0"
                            [class.bg-[#ffe4e6]]="rel.stock <= 0"
                            [class.text-[#be123c]]="rel.stock <= 0"
                          >
                            {{ rel.stock > 0 ? 'En stock' : 'Agotado' }}
                          </span>
                          <span class="absolute bottom-1.5 left-1.5 rounded bg-white/95 dark:bg-slate-900/90 px-1.5 py-0.5 text-[10px] font-medium text-[#111827] dark:text-slate-200">
                            x {{ rel.unit }}
                          </span>
                        </div>
                        <div class="p-2.5 flex-1 flex flex-col justify-between">
                          <div>
                            <span class="block text-[10px] font-medium uppercase tracking-wider text-[#6b7280] dark:text-slate-400">
                              {{ rel.category || 'General' }}
                            </span>
                            <h4 class="mt-0.5 text-[13px] font-medium text-[#111827] dark:text-slate-100 line-clamp-1">
                              {{ rel.name }}
                            </h4>
                          </div>
                          <div class="mt-2 pt-1.5 border-t border-[#f3f4f6] dark:border-slate-700/60 flex items-baseline justify-between">
                            <span class="text-[14px] font-medium text-[#111827] dark:text-slate-100">
                              {{ formatCOP(rel.price) }}
                            </span>
                            <span class="font-mono text-[10px] text-[#6b7280] dark:text-slate-400">
                              {{ rel.sku }}
                            </span>
                          </div>
                        </div>
                      </article>
                    }
                  </div>
                </footer>
              }
            }
          </div>

          <!-- BARRA INFERIOR FIJA (STICKY) EN MÓVIL (<640px):
               Subtotal a la izquierda y botón "Agregar al carrito" a la derecha, respetando safe-area-inset-bottom -->
          @if (!loading() && !error() && product(); as prod) {
            <div
              class="sm:hidden sticky bottom-0 left-0 right-0 z-20 flex items-center justify-between gap-3 border-t border-[#e5e7eb] dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3"
              style="padding-bottom: max(0.75rem, env(safe-area-inset-bottom));"
            >
              <div class="min-w-0">
                <span class="block text-[11px] font-normal text-[#6b7280] dark:text-slate-400">Subtotal</span>
                <span class="block truncate text-[16px] font-medium text-[#111827] dark:text-slate-100">
                  {{ prod.stock > 0 ? formatCOP(liveSubtotal()) : formatCOP(0) }}
                </span>
              </div>

              @if (prod.stock > 0) {
                <button
                  type="button"
                  class="inline-flex min-h-[44px] flex-1 max-w-[220px] items-center justify-center gap-1.5 rounded-lg bg-[#2563eb] px-4 text-[14px] font-medium text-white active:bg-[#1d4ed8] cursor-pointer"
                  (click)="handleAddToCart()"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Agregar al carrito
                </button>
              } @else {
                <button
                  type="button"
                  class="inline-flex min-h-[44px] flex-1 max-w-[240px] items-center justify-center rounded-lg border border-[#d1d5db] dark:border-slate-700 bg-[#f9fafb] dark:bg-slate-800 px-3 text-[13px] font-medium text-[#374151] dark:text-slate-200 cursor-pointer"
                  (click)="handleNotifyWhenAvailable()"
                >
                  {{ stockAlertRegistered() ? 'Aviso registrado' : 'Avísame cuando haya stock' }}
                </button>
              }
            </div>
          }
        </aside>

        <!-- LIGHTBOX / ZOOM DE IMAGEN PRINCIPAL -->
        @if (lightboxOpen() && activeImage()) {
          <div
            class="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Vista ampliada de imagen del producto"
            (click)="closeLightbox()"
          >
            <div class="relative max-h-[90vh] max-w-[90vw]" (click)="$event.stopPropagation()">
              <button
                type="button"
                aria-label="Cerrar vista ampliada"
                class="absolute -top-11 right-0 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#111827] hover:bg-slate-100 cursor-pointer"
                (click)="closeLightbox()"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
              <img
                [src]="activeImage()"
                [alt]="product()?.nombre || 'Imagen de producto'"
                class="max-h-[85vh] max-w-full rounded-[12px] object-contain border border-white/20 bg-white"
              />
            </div>
          </div>
        }
      </div>
    }
  `
})
export class ProductDetailDrawerComponent implements OnChanges, OnDestroy {
  @Input() isOpen = false;
  @Input() productInput: ProductDetailModel | null = null;
  @Input() isLoadingInput = false;
  @Input() hasErrorInput = false;
  @Input() relatedProducts: readonly RelatedCatalogCard[] = [];

  @Output() closed = new EventEmitter<void>();
  @Output() addToCart = new EventEmitter<{ product: ProductDetailModel; quantity: number; unitPrice: number }>();
  @Output() selectRelated = new EventEmitter<RelatedCatalogCard>();
  @Output() retry = new EventEmitter<void>();

  @ViewChild('drawerPanel') drawerPanelRef?: ElementRef<HTMLElement>;
  @ViewChild('closeBtn') closeBtnRef?: ElementRef<HTMLButtonElement>;

  protected readonly mounted = signal(false);
  protected readonly visible = signal(false);
  protected readonly product = signal<ProductDetailModel | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal(false);

  protected readonly selectedImageIndex = signal(0);
  protected readonly imageLoadFailed = signal(false);
  protected readonly lightboxOpen = signal(false);

  protected readonly quantity = signal(1);
  protected readonly quantityInputText = signal('1');
  protected readonly stockExceededMessage = signal<string | null>(null);
  protected readonly stockAlertRegistered = signal(false);

  protected readonly skuCopied = signal(false);
  protected readonly activeTab = signal<TabKey>('descripcion');

  private copyTimeout?: ReturnType<typeof setTimeout>;
  private closeAnimationTimeout?: ReturnType<typeof setTimeout>;
  private previouslyFocusedElement: HTMLElement | null = null;

  private static readonly copFormatter = new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  /**
   * Genera las 4 miniaturas de la galería.
   * Si el producto proviene de una tarjeta con una sola imagen, ofrece 4 encuadres de esa misma imagen
   * para mantener siempre la imagen exacta de la carta seleccionada.
   */
  protected readonly galleryThumbnails = computed(() => {
    const prod = this.product();
    if (!prod || !prod.imagenes || prod.imagenes.length === 0 || this.imageLoadFailed()) {
      return [];
    }
    const primary = prod.imagenes[0];
    const positions = ['center center', 'top center', 'bottom center', 'left center'];
    return [0, 1, 2, 3].map((idx) => ({
      url: prod.imagenes[idx] || primary,
      position: positions[idx]
    }));
  });

  protected readonly activeImage = computed<string | null>(() => {
    if (this.imageLoadFailed()) return null;
    const thumbs = this.galleryThumbnails();
    if (thumbs.length === 0) return null;
    const idx = Math.min(this.selectedImageIndex(), thumbs.length - 1);
    return thumbs[idx]?.url ?? null;
  });

  /** Escala de precios activa según la cantidad seleccionada */
  protected readonly activeScale = computed<VolumePriceScale | null>(() => {
    const prod = this.product();
    if (!prod || !prod.escalas_precio || prod.escalas_precio.length === 0) {
      return null;
    }
    const qty = this.quantity();
    for (const scale of prod.escalas_precio) {
      const withinLower = qty >= scale.desde;
      const withinUpper = scale.hasta === null || qty <= scale.hasta;
      if (withinLower && withinUpper) {
        return scale;
      }
    }
    return prod.escalas_precio[0];
  });

  /** Precio unitario final (con IVA incluido) según la escala activa */
  protected readonly activeUnitPrice = computed<number>(() => {
    const prod = this.product();
    if (!prod) return 0;
    const scale = this.activeScale();
    if (scale) return Math.round(scale.precio);
    return Math.round(prod.precio_base * (1 + prod.iva));
  });

  protected readonly hasVolumeDiscount = computed<boolean>(() => {
    const prod = this.product();
    const scale = this.activeScale();
    if (!prod || !scale || prod.escalas_precio.length === 0) return false;
    return scale.precio < prod.escalas_precio[0].precio;
  });

  /** Desglose en vivo de Base e IVA a partir del precio unitario activo */
  protected readonly activeBasePrice = computed<number>(() => {
    const prod = this.product();
    const totalUnit = this.activeUnitPrice();
    if (!prod || totalUnit <= 0) return 0;
    // Si estamos en la primera escala y coincide con precio_base + iva, usamos precio_base exacto
    const firstScalePrice = prod.escalas_precio[0]?.precio;
    if (firstScalePrice && totalUnit === firstScalePrice && Math.round(prod.precio_base * (1 + prod.iva)) === firstScalePrice) {
      return Math.round(prod.precio_base);
    }
    return Math.round(totalUnit / (1 + prod.iva));
  });

  protected readonly activeIvaAmount = computed<number>(() => {
    return Math.max(0, this.activeUnitPrice() - this.activeBasePrice());
  });

  protected readonly liveSubtotal = computed<number>(() => {
    return this.activeUnitPrice() * this.quantity();
  });

  protected readonly availabilityPercent = computed<number>(() => {
    const prod = this.product();
    if (!prod || prod.stock <= 0) return 0;
    const referenceMax = Math.max(prod.stock, 500);
    return Math.min(100, Math.max(12, Math.round((prod.stock / referenceMax) * 100)));
  });

  protected readonly specEntries = computed<[string, string][]>(() => {
    const prod = this.product();
    if (!prod || !prod.especificaciones) return [];
    return Object.entries(prod.especificaciones).filter(([, val]) => Boolean(val && val.trim()));
  });

  /** Si algún campo viene vacío (descripción, especificaciones), se omite la pestaña */
  protected readonly availableTabs = computed<{ key: TabKey; label: string }[]>(() => {
    const prod = this.product();
    if (!prod) return [];
    const tabs: { key: TabKey; label: string }[] = [];
    if (prod.descripcion_larga && prod.descripcion_larga.trim().length > 0) {
      tabs.push({ key: 'descripcion', label: 'Descripción' });
    }
    if (this.specEntries().length > 0) {
      tabs.push({ key: 'especificaciones', label: 'Especificaciones' });
    }
    if (prod.escalas_precio && prod.escalas_precio.length > 0) {
      tabs.push({ key: 'volumen', label: 'Precios por volumen' });
    }
    if (prod.tiempo_entrega && prod.tiempo_entrega.trim().length > 0) {
      tabs.push({ key: 'entrega', label: 'Entrega' });
    }
    return tabs;
  });

  protected readonly filteredRelatedProducts = computed<RelatedCatalogCard[]>(() => {
    const current = this.product();
    const all = this.relatedProducts || [];
    if (!current) return all.slice(0, 6);
    const sameCategory = all.filter(
      (p) => p.sku !== current.sku && (p.category || '').toLowerCase() === (current.categoria || '').toLowerCase()
    );
    const others = all.filter(
      (p) => p.sku !== current.sku && (p.category || '').toLowerCase() !== (current.categoria || '').toLowerCase()
    );
    return [...sameCategory, ...others].slice(0, 8);
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productInput']) {
      this.product.set(this.productInput);
      this.resetProductState();
    }
    if (changes['isLoadingInput']) {
      this.loading.set(this.isLoadingInput);
    }
    if (changes['hasErrorInput']) {
      this.error.set(this.hasErrorInput);
    }
    if (changes['isOpen']) {
      if (this.isOpen) {
        this.openDrawer();
      } else if (this.mounted()) {
        this.closeDrawerInternal(false);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.copyTimeout) clearTimeout(this.copyTimeout);
    if (this.closeAnimationTimeout) clearTimeout(this.closeAnimationTimeout);
    productDetailModalOpenSignal.set(false);
    this.unlockBodyScroll();
  }

  @HostListener('document:keydown.escape', ['$event'])
  protected onEscapePressed(event: Event): void {
    if (!this.mounted()) return;
    event.preventDefault();
    if (this.lightboxOpen()) {
      this.closeLightbox();
      return;
    }
    this.requestClose();
  }

  private resetProductState(): void {
    this.selectedImageIndex.set(0);
    this.imageLoadFailed.set(false);
    this.lightboxOpen.set(false);
    this.quantity.set(1);
    this.quantityInputText.set('1');
    this.stockExceededMessage.set(null);
    this.stockAlertRegistered.set(false);

    const tabs = this.availableTabs();
    if (tabs.length > 0) {
      this.activeTab.set(tabs[0].key);
    }
  }

  private isDesktopViewport(): boolean {
    return typeof window !== 'undefined' && window.innerWidth >= 640;
  }

  private openDrawer(): void {
    if (this.closeAnimationTimeout) {
      clearTimeout(this.closeAnimationTimeout);
      this.closeAnimationTimeout = undefined;
    }

    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      this.previouslyFocusedElement = document.activeElement;
    }

    this.lockBodyScroll();
    this.mounted.set(true);
    productDetailModalOpenSignal.set(true);

    if (this.isDesktopViewport()) {
      // Animación de entrada de 200 ms en PC
      this.visible.set(false);
      setTimeout(() => {
        this.visible.set(true);
        this.closeBtnRef?.nativeElement?.focus();
      }, 16);
    } else {
      // En celular aparece de inmediato sin animación
      this.visible.set(true);
      setTimeout(() => {
        this.closeBtnRef?.nativeElement?.focus();
      }, 0);
    }
  }

  protected requestClose(): void {
    this.closeDrawerInternal(true);
  }

  private closeDrawerInternal(emitEvent: boolean): void {
    this.lightboxOpen.set(false);
    productDetailModalOpenSignal.set(false);

    if (this.isDesktopViewport()) {
      this.visible.set(false);
      if (this.closeAnimationTimeout) clearTimeout(this.closeAnimationTimeout);
      this.closeAnimationTimeout = setTimeout(() => {
        this.finishClose(emitEvent);
      }, 200);
    } else {
      this.visible.set(false);
      this.finishClose(emitEvent);
    }
  }

  private finishClose(emitEvent: boolean): void {
    this.mounted.set(false);
    this.unlockBodyScroll();
    if (this.previouslyFocusedElement && typeof this.previouslyFocusedElement.focus === 'function') {
      this.previouslyFocusedElement.focus();
      this.previouslyFocusedElement = null;
    }
    if (emitEvent) {
      this.closed.emit();
    }
  }

  private lockBodyScroll(): void {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  private unlockBodyScroll(): void {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  /** Focus trap accesible dentro del drawer */
  protected onDrawerKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab' || !this.drawerPanelRef?.nativeElement) return;

    const focusables = this.drawerPanelRef.nativeElement.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  protected copySku(sku: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(sku);
    }
    this.skuCopied.set(true);
    if (this.copyTimeout) clearTimeout(this.copyTimeout);
    this.copyTimeout = setTimeout(() => {
      this.skuCopied.set(false);
    }, 2000);
  }

  protected selectThumbnail(index: number): void {
    this.selectedImageIndex.set(index);
  }

  protected onGalleryImageError(): void {
    this.imageLoadFailed.set(true);
  }

  protected openLightbox(): void {
    if (this.activeImage()) {
      this.lightboxOpen.set(true);
    }
  }

  protected closeLightbox(): void {
    this.lightboxOpen.set(false);
  }

  protected incrementQty(): void {
    const prod = this.product();
    if (!prod || prod.stock <= 0) return;
    const next = this.quantity() + 1;
    if (next > prod.stock) {
      this.stockExceededMessage.set(
        `La cantidad máxima disponible es ${prod.stock} ${this.pluralizeUnit(prod.unidad, prod.stock)}.`
      );
      return;
    }
    this.stockExceededMessage.set(null);
    this.quantity.set(next);
    this.quantityInputText.set(String(next));
  }

  protected decrementQty(): void {
    const prod = this.product();
    if (!prod || prod.stock <= 0) return;
    const next = Math.max(1, this.quantity() - 1);
    this.stockExceededMessage.set(null);
    this.quantity.set(next);
    this.quantityInputText.set(String(next));
  }

  protected onQtyInput(event: Event): void {
    const prod = this.product();
    const input = event.target as HTMLInputElement | null;
    if (!prod || !input) return;

    const raw = input.value.trim();
    this.quantityInputText.set(raw);

    if (raw === '') {
      this.stockExceededMessage.set(null);
      return;
    }

    const parsed = parseInt(raw, 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      return;
    }

    if (parsed > prod.stock) {
      this.quantity.set(prod.stock);
      this.quantityInputText.set(String(prod.stock));
      input.value = String(prod.stock);
      this.stockExceededMessage.set(
        `Superaste el stock disponible. Se ajustó al máximo de ${prod.stock} ${this.pluralizeUnit(prod.unidad, prod.stock)}.`
      );
      return;
    }

    this.stockExceededMessage.set(null);
    this.quantity.set(parsed);
  }

  protected onQtyBlur(event: Event): void {
    const prod = this.product();
    const input = event.target as HTMLInputElement | null;
    if (!prod || !input) return;

    const parsed = parseInt(input.value.trim(), 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      this.quantity.set(1);
      this.quantityInputText.set('1');
      input.value = '1';
      return;
    }

    if (parsed > prod.stock) {
      this.quantity.set(prod.stock);
      this.quantityInputText.set(String(prod.stock));
      input.value = String(prod.stock);
    }
  }

  protected handleAddToCart(): void {
    const prod = this.product();
    if (!prod || prod.stock <= 0) return;
    this.addToCart.emit({
      product: prod,
      quantity: this.quantity(),
      unitPrice: this.activeUnitPrice()
    });
  }

  protected handleNotifyWhenAvailable(): void {
    this.stockAlertRegistered.set(true);
  }

  protected formatCOP(amount: number): string {
    return `COP ${ProductDetailDrawerComponent.copFormatter.format(Math.round(amount || 0))}`;
  }

  protected formatIvaPercent(iva: number): number {
    return Math.round((iva || 0.19) * 100);
  }

  protected pluralizeUnit(unit: string, count: number): string {
    const clean = (unit || 'unidad').trim().toLowerCase();
    if (count === 1) return clean;
    if (clean === 'm³' || clean === 'm2' || clean === 'm²' || clean === 'kg') return clean;
    if (clean.endsWith('s')) return clean;
    if (clean.endsWith('d') || clean.endsWith('r') || clean.endsWith('l') || clean.endsWith('n')) {
      return `${clean}es`;
    }
    return `${clean}s`;
  }

  protected formatScaleRange(scale: VolumePriceScale): string {
    if (scale.hasta === null) {
      return `${scale.desde} o más`;
    }
    return `${scale.desde}-${scale.hasta}`;
  }

  protected isScaleActive(scale: VolumePriceScale): boolean {
    const active = this.activeScale();
    return Boolean(active && active.desde === scale.desde && active.hasta === scale.hasta);
  }

  protected isBestPriceScale(scale: VolumePriceScale): boolean {
    const prod = this.product();
    if (!prod || prod.escalas_precio.length === 0) return false;
    const minPrice = Math.min(...prod.escalas_precio.map((s) => s.precio));
    return scale.precio === minPrice;
  }

  /**
   * Transforma cualquier producto del catálogo de Firmeza al modelo `ProductDetailModel`,
   * conservando la imagen exacta de la tarjeta (`cardImage`) y completando sus escalas y especificaciones técnicas.
   */
  static fromCatalogProduct(product: Product | RelatedCatalogCard, cardImage: string): ProductDetailModel {
    const skuUpper = (product.sku || '').trim().toUpperCase();
    const mockMatch = MOCK_PRODUCT_DETAILS.find((m) => m.sku.toUpperCase() === skuUpper);

    if (mockMatch) {
      return {
        ...mockMatch,
        id: product.id || mockMatch.id,
        nombre: product.name || mockMatch.nombre,
        stock: product.stock ?? mockMatch.stock,
        imagenes: mockMatch.sku === 'AGR-003' ? [] : [cardImage, cardImage, cardImage, cardImage]
      };
    }

    const totalUnitPrice = Math.round(product.price || 0);
    const iva = 0.19;
    const basePrice = Math.round(totalUnitPrice / (1 + iva));
    const tier2Price = Math.round(totalUnitPrice * 0.95);
    const tier3Price = Math.round(totalUnitPrice * 0.9);

    const catLower = `${product.category || ''} ${product.name || ''}`.toLowerCase();
    let norm = 'NTC 121 / NSR-10';
    let peso = 'Estándar de despacho';
    let rendimiento = 'Según diseño de mezcla o plano constructivo';
    let unidadDetalle = `por ${(product.unit || 'unidad').toLowerCase()}`;

    if (catLower.includes('cemento') || catLower.includes('mortero')) {
      norm = 'NTC 121 / NTC 321';
      peso = '50 kg';
      rendimiento = '1.4 m² en pañete de 2 cm por saco';
      unidadDetalle = 'por saco de 50 kg';
    } else if (catLower.includes('acero') || catLower.includes('varilla') || catLower.includes('malla')) {
      norm = 'NTC 2289 (ASTM A706)';
      peso = 'Según calibre nominal';
      rendimiento = 'Tramo estructural de 6 metros lineales';
      unidadDetalle = `por ${(product.unit || 'unidad').toLowerCase()} estructural`;
    } else if (catLower.includes('ladrillo') || catLower.includes('bloque') || catLower.includes('mampost')) {
      norm = 'NTC 4205 Mampostería';
      peso = '4.2 kg por pieza';
      rendimiento = '12.5 unidades por m² de muro';
    } else if (catLower.includes('tub') || catLower.includes('pvc')) {
      norm = 'NTC 382 / NTC 1087';
      peso = 'Liviano de alta densidad';
      rendimiento = 'Tramo útil de 6 metros';
    }

    // Mantiene la imagen exacta que tiene la tarjeta seleccionada
    const images = cardImage ? [cardImage, cardImage, cardImage, cardImage] : [];

    return {
      id: product.id,
      sku: product.sku,
      nombre: product.name,
      categoria: product.category || 'Materiales',
      descripcion_corta:
        product.description ||
        'Material certificado para construcción civil, reformas e infraestructura con disponibilidad en patio.',
      descripcion_larga:
        product.description
          ? `${product.description} Suministro verificado bajo estándares técnicos para obra civil y edificación.`
          : 'Material seleccionado para proyectos de construcción y remodelación. Garantiza consistencia dimensional, durabilidad en obra y respaldo técnico para entregas programadas.',
      imagenes: images,
      unidad: product.unit || 'Unidad',
      unidad_detalle: unidadDetalle,
      precio_base: basePrice,
      iva,
      stock: product.stock,
      especificaciones: {
        Peso: peso,
        'Norma NTC': norm,
        'Uso recomendado': `Obra gris, mampostería y proyectos de ${product.category || 'construcción'}`,
        Rendimiento: rendimiento
      },
      escalas_precio: [
        { desde: 1, hasta: 49, precio: totalUnitPrice },
        { desde: 50, hasta: 199, precio: tier2Price },
        { desde: 200, hasta: null, precio: tier3Price }
      ],
      peso,
      tiempo_entrega: '24 a 48 horas hábiles en área urbana',
      zonas_despacho: 'Cobertura metropolitana y municipios aledaños con descarga a pie de obra.',
      recogida_bodega: 'Retiro disponible en bodega principal de lunes a sábado de 7:00 a 17:00.'
    };
  }
}
