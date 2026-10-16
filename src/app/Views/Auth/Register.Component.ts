import { Component, HostListener, OnInit, OnDestroy, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { toApiError } from '../../Services/Api.Service';
import { AuthService } from '../../Services/auth.service';
import { ToastService } from '../../Services/imports.service';
import { ThemeToggleComponent } from '../Shared/ThemeToggle.Component';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink, ThemeToggleComponent],
  template: `
    <div class="relative flex min-h-[100dvh] w-full flex-col justify-between overflow-x-clip bg-gradient-to-br from-[#eef3fb] via-[#e6effa] to-[#dde7f6] dark:bg-none dark:bg-[#05070b] text-[#0d1424] dark:text-[#f4f6fb] sm:transition-colors sm:duration-200">
      <!-- Malla sutil de fondo y resplandores decorativos (ocultos en móvil para máximo rendimiento) -->
      <div class="pointer-events-none fixed inset-0 auth-grid opacity-35 dark:opacity-10 hidden sm:block"></div>
      <div class="pointer-events-none fixed -left-32 -top-32 h-96 w-96 rounded-full bg-blue-400/15 dark:bg-blue-600/10 blur-3xl hidden sm:block"></div>
      <div class="pointer-events-none fixed -bottom-32 -right-32 h-96 w-96 rounded-full bg-sky-400/15 dark:bg-sky-500/10 blur-3xl hidden sm:block"></div>

      <!-- Barra superior de navegación accesible -->
      <header class="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <a
          routerLink="/"
          class="inline-flex items-center gap-2 rounded-xl border border-[#d5deee] bg-white/95 px-3.5 sm:px-4 py-2 text-xs font-bold text-[#0d1424] shadow-xs backdrop-blur-md transition hover:border-[#1a5cff] hover:bg-white hover:text-[#1a5cff] dark:border-[#1d2433] dark:bg-[#0c1017] dark:text-[#f4f6fb] dark:hover:border-blue-500 dark:hover:text-blue-400 min-h-[40px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a5cff]"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5">
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span>Volver al portal</span>
        </a>

        <!-- Controles superiores: Tema e Inicio de sesión siempre visibles en móvil y escritorio -->
        <div class="flex items-center gap-2 sm:gap-3 text-xs font-semibold">
          <app-theme-toggle size="sm" />
          <div class="hidden sm:flex items-center gap-1.5 text-[#68748d] dark:text-[#7f899e]">
            <span>¿Ya tienes cuenta?</span>
            <a routerLink="/login" class="font-bold text-[#1a5cff] dark:text-[#3b82f6] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a5cff] rounded">
              Iniciar sesión →
            </a>
          </div>
          <a
            routerLink="/login"
            class="sm:hidden inline-flex items-center justify-center rounded-xl border border-[#d5deee] bg-white/90 px-3 py-2 text-xs font-bold text-[#1a5cff] dark:border-[#1d2433] dark:bg-[#0c1017] dark:text-blue-400 min-h-[40px]"
          >
            Ingresar
          </a>
        </div>
      </header>

      <!-- Contenedor principal: Layout dividido en escritorio, centrado en tablet y móvil -->
      <main class="relative z-10 my-auto flex w-full items-center justify-center px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div class="w-full max-w-6xl xl:max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          <!-- PANEL IZQUIERDO DE MARCA (Desktop: Imagen 4) -->
          <section class="hidden lg:flex lg:col-span-5 xl:col-span-5 flex-col justify-between rounded-[28px] border border-[#d5deee] bg-white/90 p-8 xl:p-10 shadow-xl shadow-slate-200/50 backdrop-blur-md dark:border-[#1d2433] dark:bg-[#0c1017] dark:shadow-2xl dark:shadow-black/70 sticky top-6 min-h-[640px] overflow-hidden transition-colors duration-200">
            <!-- Malla arquitectónica decorativa de fondo -->
            <div class="pointer-events-none absolute inset-0 auth-grid opacity-20 dark:opacity-10"></div>
            <div class="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl"></div>

            <!-- Cabecera de marca con icono de perfil -->
            <div class="relative z-10">
              <div class="inline-flex items-center gap-3.5">
                <!-- Icono de perfil en lugar de la F -->
                <div class="h-12 w-12 rounded-2xl bg-[#1a5cff] flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <span class="block text-xl font-black tracking-tight text-[#0d1424] dark:text-[#f4f6fb]">Ferretería Firmeza</span>
                  <span class="text-xs font-semibold text-[#68748d] dark:text-[#7f899e]">Registro Comercial & Clientes</span>
                </div>
              </div>

              <!-- Titular del registro -->
              <h2 class="mt-8 text-3xl font-black tracking-tight leading-tight text-[#0d1424] dark:text-[#f4f6fb]">
                Solicitud de Cuenta de Cliente
              </h2>
              <p class="mt-4 text-sm leading-relaxed text-[#68748d] dark:text-[#7f899e]">
                Únete a la red líder de suministros para contratistas, maestros de obra y empresas constructoras. Accede a precios especiales, facturación electrónica y despachos a pie de obra.
              </p>

              <!-- Indicador de pasos visuales (Imagen 3: Datos, Contacto, Seguridad) -->
              <div class="mt-8 space-y-4">
                <div class="flex items-center gap-3">
                  <div class="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-xs font-black text-[#1a5cff] dark:bg-[#141b27] dark:text-blue-400">
                    1
                  </div>
                  <div>
                    <p class="text-xs font-bold text-[#0d1424] dark:text-[#f4f6fb]">Identificación</p>
                    <p class="text-[11px] text-[#68748d] dark:text-[#7f899e]">Cédula o NIT y nombre comercial</p>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <div class="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-xs font-black text-[#1a5cff] dark:bg-[#141b27] dark:text-blue-400">
                    2
                  </div>
                  <div>
                    <p class="text-xs font-bold text-[#0d1424] dark:text-[#f4f6fb]">Contacto & Ubicación</p>
                    <p class="text-[11px] text-[#68748d] dark:text-[#7f899e]">Celular, correo y dirección de despacho</p>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <div class="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-xs font-black text-[#1a5cff] dark:bg-[#141b27] dark:text-blue-400">
                    3
                  </div>
                  <div>
                    <p class="text-xs font-bold text-[#0d1424] dark:text-[#f4f6fb]">Seguridad de Acceso</p>
                    <p class="text-[11px] text-[#68748d] dark:text-[#7f899e]">Contraseña cifrada y términos del servicio</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Beneficios de la cuenta de cliente -->
            <div class="relative z-10 pt-8 border-t border-[#d5deee]/80 dark:border-[#1d2433] space-y-2 text-xs text-[#68748d] dark:text-[#7f899e]">
              <div class="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4 text-[#22c55e]">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span>Stock certificado en tiempo real</span>
              </div>
              <div class="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4 text-[#22c55e]">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span>Precios con IVA del 19% desglosado</span>
              </div>
              <div class="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4 text-[#22c55e]">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span>Aprobación rápida por el equipo comercial</span>
              </div>
            </div>
          </section>

          <!-- PANEL DERECHO: FORMULARIO DE REGISTRO EN 2 COLUMNAS (Móvil, Tablet y Escritorio) -->
          <div class="lg:col-span-7 xl:col-span-7 w-full">
            <div class="rounded-[26px] border border-[#d5deee] bg-white p-6 sm:p-8 md:p-9 shadow-2xl shadow-slate-300/40 dark:border-[#1d2433] dark:bg-[#0c1017] dark:shadow-2xl dark:shadow-black/80 transition-colors duration-200">
              
              <!-- Encabezado con icono de perfil (en lugar de la F) -->
              <div class="text-center">
                <div class="mx-auto h-14 w-14 rounded-2xl bg-[#1a5cff] flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-7 w-7">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <h1 class="mt-4 text-2xl font-black tracking-tight text-[#0d1424] dark:text-[#f4f6fb]">
                  Registro de cliente
                </h1>
                <p class="mt-1 text-xs text-[#68748d] dark:text-[#7f899e]">
                  Completa tus datos para solicitar acceso y comprar en Ferretería Firmeza
                </p>
              </div>

              <!-- Selector Persona natural / Empresa (NIT) -->
              <div class="mt-6 flex h-11 rounded-xl border border-[#d5deee] bg-[#f0f4fa] p-1 text-xs font-bold dark:border-[#1d2433] dark:bg-[#080b11]">
                <button
                  type="button"
                  (click)="setCustomerType('natural')"
                  class="flex flex-1 items-center justify-center gap-1.5 rounded-lg transition min-h-[34px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a5cff]"
                  [class]="customerType() === 'natural'
                    ? 'bg-white text-[#1a5cff] shadow-sm dark:bg-[#141b27] dark:text-[#f4f6fb]'
                    : 'text-[#68748d] hover:text-[#0d1424] dark:text-[#7f899e] dark:hover:text-[#f4f6fb]'"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3.5 w-3.5">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>Persona natural</span>
                </button>
                <button
                  type="button"
                  (click)="setCustomerType('company')"
                  class="flex flex-1 items-center justify-center gap-1.5 rounded-lg transition min-h-[34px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a5cff]"
                  [class]="customerType() === 'company'
                    ? 'bg-white text-[#1a5cff] shadow-sm dark:bg-[#141b27] dark:text-[#f4f6fb]'
                    : 'text-[#68748d] hover:text-[#0d1424] dark:text-[#7f899e] dark:hover:text-[#f4f6fb]'"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3.5 w-3.5">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                  <span>Empresa (NIT)</span>
                </button>
              </div>

              <!-- Banner de Aprobación Administrativa -->
              <div class="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-200">
                <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-[11px] font-black text-white">
                  i
                </div>
                <div class="leading-relaxed">
                  <span class="font-bold">Aprobación administrativa:</span> Tu cuenta quedará pendiente de validación por parte del equipo comercial. Mientras tanto, podrás explorar el catálogo completo con precios en tiempo real.
                </div>
              </div>

              <!-- Mensaje de error general accesible -->
              @if (errorMessage(); as message) {
                <div class="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300" role="alert">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{{ message }}</span>
                </div>
              }

              <!-- Formulario de Registro en 2 columnas -->
              <form class="mt-5 space-y-4 sm:space-y-4.5" (ngSubmit)="onSubmit()" (input)="saveDraft()" (change)="saveDraft()" novalidate>
                
                <!-- SECCIÓN 1: IDENTIFICACIÓN -->
                <div class="grid gap-4 sm:grid-cols-2">
                  <!-- Documento / NIT -->
                  <div class="space-y-1.5">
                    <div class="flex items-center justify-between">
                      <label for="document" class="block text-xs font-bold uppercase tracking-wider text-[#0d1424] dark:text-[#f4f6fb]">
                        {{ customerType() === 'company' ? 'NIT de la empresa (sin DV)' : 'Documento / Cédula' }} <span class="text-rose-500">*</span>
                      </label>
                      <span class="text-[10px] font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800/80">
                        Solo números
                      </span>
                    </div>
                    <div class="relative flex items-center">
                      <span class="pointer-events-none absolute left-3.5 text-[#68748d] dark:text-[#7f899e]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                          <rect x="3" y="4" width="18" height="16" rx="3" />
                          <circle cx="9" cy="10" r="2" />
                          <path d="M15 8h2M15 12h2M7 16h10" />
                        </svg>
                      </span>
                      <input
                        id="document"
                        name="document"
                        type="text"
                        inputmode="numeric"
                        autocomplete="off"
                        [placeholder]="customerType() === 'company' ? 'Ej.: 900123456' : 'Ej.: 1020304050'"
                        class="h-[46px] w-full rounded-[12px] border border-[#d5deee] bg-[#f8fafc] dark:border-[#1d2433] dark:bg-[#080b11] py-2.5 pl-10 pr-4 text-[16px] sm:text-sm font-medium text-[#0d1424] dark:text-[#f4f6fb] outline-none transition placeholder:text-[#8b9bb4] dark:placeholder:text-[#566176] focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/20"
                        [class.border-rose-400]="fieldError('document')"
                        [(ngModel)]="document"
                        (keydown)="onNumericKeyDown($event, 'el documento')"
                        (input)="onNumericInput($event, 'el documento')"
                        (paste)="onNumericPaste($event, 'el documento')"
                        required
                      />
                    </div>
                    @if (fieldError('document'); as message) {
                      <p class="text-xs font-semibold text-rose-600 dark:text-rose-400">{{ message }}</p>
                    }
                  </div>

                  <!-- Nombre completo o Razón social -->
                  <div class="space-y-1.5">
                    <label for="fullName" class="block text-xs font-bold uppercase tracking-wider text-[#0d1424] dark:text-[#f4f6fb]">
                      {{ customerType() === 'company' ? 'Razón Social de la Empresa' : 'Nombre Completo' }} <span class="text-rose-500">*</span>
                    </label>
                    <div class="relative flex items-center">
                      <span class="pointer-events-none absolute left-3.5 text-[#68748d] dark:text-[#7f899e]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </span>
                      <input
                        id="fullName"
                        name="fullName"
                        autocomplete="name"
                        [placeholder]="customerType() === 'company' ? 'Ej.: Constructora Bolívar SAS' : 'Ej.: Carlos Andrés Pérez'"
                        class="h-[46px] w-full rounded-[12px] border border-[#d5deee] bg-[#f8fafc] dark:border-[#1d2433] dark:bg-[#080b11] py-2.5 pl-10 pr-4 text-[16px] sm:text-sm font-medium text-[#0d1424] dark:text-[#f4f6fb] outline-none transition placeholder:text-[#8b9bb4] dark:placeholder:text-[#566176] focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/20"
                        [class.border-rose-400]="fieldError('fullName')"
                        [(ngModel)]="fullName"
                        required
                      />
                    </div>
                    @if (fieldError('fullName'); as message) {
                      <p class="text-xs font-semibold text-rose-600 dark:text-rose-400">{{ message }}</p>
                    }
                  </div>
                </div>

                <!-- SECCIÓN 2: CONTACTO Y EDAD -->
                <div class="grid gap-4 sm:grid-cols-2">
                  <!-- Teléfono -->
                  <div class="space-y-1.5">
                    <div class="flex items-center justify-between">
                      <label for="phone" class="block text-xs font-bold uppercase tracking-wider text-[#0d1424] dark:text-[#f4f6fb]">
                        Teléfono / Celular <span class="text-rose-500">*</span>
                      </label>
                      <span class="text-[10px] font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800/80">
                        Solo números
                      </span>
                    </div>
                    <div class="relative flex items-center">
                      <span class="pointer-events-none absolute left-3.5 text-[#68748d] dark:text-[#7f899e]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                      </span>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        inputmode="numeric"
                        autocomplete="tel"
                        placeholder="Ej.: 3101234567"
                        class="h-[46px] w-full rounded-[12px] border border-[#d5deee] bg-[#f8fafc] dark:border-[#1d2433] dark:bg-[#080b11] py-2.5 pl-10 pr-4 text-[16px] sm:text-sm font-medium text-[#0d1424] dark:text-[#f4f6fb] outline-none transition placeholder:text-[#8b9bb4] dark:placeholder:text-[#566176] focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/20"
                        [class.border-rose-400]="fieldError('phone')"
                        [(ngModel)]="phone"
                        (keydown)="onNumericKeyDown($event, 'el teléfono')"
                        (input)="onNumericInput($event, 'el teléfono')"
                        (paste)="onNumericPaste($event, 'el teléfono')"
                        required
                      />
                    </div>
                    @if (fieldError('phone'); as message) {
                      <p class="text-xs font-semibold text-rose-600 dark:text-rose-400">{{ message }}</p>
                    }
                  </div>

                  <!-- Edad con Stepper -->
                  <div class="space-y-1.5">
                    <div class="flex items-center justify-between">
                      <label for="age" class="block text-xs font-bold uppercase tracking-wider text-[#0d1424] dark:text-[#f4f6fb]">
                        Edad <span class="text-rose-500">*</span>
                      </label>
                      <span class="text-[10px] font-semibold text-[#68748d] dark:text-[#7f899e]">
                        Mínimo 18 años
                      </span>
                    </div>
                    <div class="relative flex items-center">
                      <span class="pointer-events-none absolute left-3.5 text-[#68748d] dark:text-[#7f899e]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      </span>
                      <input
                        id="age"
                        name="age"
                        type="number"
                        min="18"
                        max="120"
                        placeholder="18"
                        class="h-[46px] w-full rounded-[12px] border border-[#d5deee] bg-[#f8fafc] dark:border-[#1d2433] dark:bg-[#080b11] py-2.5 pl-10 pr-12 text-[16px] sm:text-sm font-medium text-[#0d1424] dark:text-[#f4f6fb] outline-none transition placeholder:text-[#8b9bb4] dark:placeholder:text-[#566176] focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/20"
                        [class.border-rose-400]="fieldError('age')"
                        [(ngModel)]="age"
                        (keydown)="onNumericKeyDown($event, 'la edad')"
                        required
                      />
                      <div class="absolute right-2 flex items-center">
                        <div class="flex flex-col -space-y-px rounded-lg border border-[#d5deee] bg-white shadow-2xs overflow-hidden dark:border-[#1d2433] dark:bg-[#141b27]">
                          <button
                            type="button"
                            (click)="incrementAge()"
                            [disabled]="age >= 120"
                            title="Aumentar edad"
                            aria-label="Aumentar edad"
                            class="flex h-4 w-7 items-center justify-center text-[#68748d] hover:bg-blue-50 hover:text-[#1a5cff] dark:text-[#7f899e] dark:hover:bg-[#1f2838] dark:hover:text-white transition disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="h-2.5 w-2.5">
                              <path d="m18 15-6-6-6 6" />
                            </svg>
                          </button>
                          <div class="h-px bg-[#d5deee] dark:bg-[#1d2433]"></div>
                          <button
                            type="button"
                            (click)="decrementAge()"
                            [disabled]="age <= 18"
                            title="Disminuir edad"
                            aria-label="Disminuir edad"
                            class="flex h-4 w-7 items-center justify-center text-[#68748d] hover:bg-blue-50 hover:text-[#1a5cff] dark:text-[#7f899e] dark:hover:bg-[#1f2838] dark:hover:text-white transition disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="h-2.5 w-2.5">
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    @if (fieldError('age'); as message) {
                      <p class="text-xs font-semibold text-rose-600 dark:text-rose-400">{{ message }}</p>
                    }
                  </div>
                </div>

                <!-- SECCIÓN 3: CORREO Y DIRECCIÓN -->
                <div class="grid gap-4 sm:grid-cols-2">
                  <!-- Correo -->
                  <div class="space-y-1.5">
                    <label for="email" class="block text-xs font-bold uppercase tracking-wider text-[#0d1424] dark:text-[#f4f6fb]">
                      Correo electrónico <span class="text-rose-500">*</span>
                    </label>
                    <div class="relative flex items-center">
                      <span class="pointer-events-none absolute left-3.5 text-[#68748d] dark:text-[#7f899e]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <path d="m22 7-10 6L2 7" />
                        </svg>
                      </span>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autocomplete="email"
                        placeholder="tu@correo.com"
                        class="h-[46px] w-full rounded-[12px] border border-[#d5deee] bg-[#f8fafc] dark:border-[#1d2433] dark:bg-[#080b11] py-2.5 pl-10 pr-4 text-[16px] sm:text-sm font-medium text-[#0d1424] dark:text-[#f4f6fb] outline-none transition placeholder:text-[#8b9bb4] dark:placeholder:text-[#566176] focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/20"
                        [class.border-rose-400]="fieldError('email')"
                        [(ngModel)]="email"
                        required
                      />
                    </div>
                    @if (fieldError('email'); as message) {
                      <p class="text-xs font-semibold text-rose-600 dark:text-rose-400">{{ message }}</p>
                    }
                  </div>

                  <!-- Dirección -->
                  <div class="space-y-1.5">
                    <label for="address" class="block text-xs font-bold uppercase tracking-wider text-[#0d1424] dark:text-[#f4f6fb]">
                      Dirección de entrega <span class="text-slate-400 font-normal lowercase">(Opcional)</span>
                    </label>
                    <div class="relative flex items-center">
                      <span class="pointer-events-none absolute left-3.5 text-[#68748d] dark:text-[#7f899e]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      </span>
                      <input
                        id="address"
                        name="address"
                        autocomplete="street-address"
                        placeholder="Calle, número, barrio u obra"
                        class="h-[46px] w-full rounded-[12px] border border-[#d5deee] bg-[#f8fafc] dark:border-[#1d2433] dark:bg-[#080b11] py-2.5 pl-10 pr-4 text-[16px] sm:text-sm font-medium text-[#0d1424] dark:text-[#f4f6fb] outline-none transition placeholder:text-[#8b9bb4] dark:placeholder:text-[#566176] focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/20"
                        [(ngModel)]="address"
                      />
                    </div>
                  </div>
                </div>

                <!-- SECCIÓN 4: CONTRASEÑA Y CONFIRMACIÓN -->
                <div class="grid gap-4 sm:grid-cols-2">
                  <!-- Contraseña -->
                  <div class="space-y-1.5">
                    <label for="password" class="block text-xs font-bold uppercase tracking-wider text-[#0d1424] dark:text-[#f4f6fb]">
                      Contraseña <span class="text-rose-500">*</span>
                    </label>
                    <div class="relative flex items-center">
                      <span class="pointer-events-none absolute left-3.5 text-[#68748d] dark:text-[#7f899e]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                          <rect x="4" y="10" width="16" height="11" rx="2" />
                          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                        </svg>
                      </span>
                      <input
                        id="password"
                        name="password"
                        [type]="showPassword() ? 'text' : 'password'"
                        autocomplete="new-password"
                        placeholder="Mínimo 8 caracteres"
                        class="h-[46px] w-full rounded-[12px] border border-[#d5deee] bg-[#f8fafc] dark:border-[#1d2433] dark:bg-[#080b11] py-2.5 pl-10 pr-11 text-[16px] sm:text-sm font-medium text-[#0d1424] dark:text-[#f4f6fb] outline-none transition placeholder:text-[#8b9bb4] dark:placeholder:text-[#566176] focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/20"
                        [class.border-rose-400]="fieldError('password')"
                        [(ngModel)]="password"
                        (input)="onPasswordChange()"
                        required
                      />
                      <button
                        type="button"
                        aria-label="Mostrar u ocultar contraseña"
                        class="absolute right-2.5 grid h-8 w-8 place-items-center rounded-lg text-[#68748d] dark:text-[#7f899e] transition hover:bg-slate-200/60 dark:hover:bg-[#141b27] hover:text-[#0d1424] dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a5cff]"
                        (click)="showPassword.set(!showPassword())"
                      >
                        @if (showPassword()) {
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-6.5 0-10-7-10-7a18.5 18.5 0 0 1 5.06-5.94" />
                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19" />
                            <path d="M14.12 14.12A3 3 0 1 1 9.88 9.88" />
                            <line x1="2" y1="2" x2="22" y2="22" />
                          </svg>
                        } @else {
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        }
                      </button>
                    </div>

                    <!-- Medidor de fortaleza de contraseña -->
                    <div class="mt-2">
                      <div class="flex gap-1.5">
                        <span class="h-1 flex-1 rounded-full transition-colors duration-300" [class]="barClass(0)"></span>
                        <span class="h-1 flex-1 rounded-full transition-colors duration-300" [class]="barClass(1)"></span>
                        <span class="h-1 flex-1 rounded-full transition-colors duration-300" [class]="barClass(2)"></span>
                        <span class="h-1 flex-1 rounded-full transition-colors duration-300" [class]="barClass(3)"></span>
                      </div>
                      <p class="mt-1 text-[11px] font-semibold" [class]="strengthClass()">{{ strengthLabel() }}</p>
                    </div>
                    @if (fieldError('password'); as message) {
                      <p class="text-xs font-semibold text-rose-600 dark:text-rose-400">{{ message }}</p>
                    }
                  </div>

                  <!-- Confirmar contraseña -->
                  <div class="space-y-1.5">
                    <label for="confirmPassword" class="block text-xs font-bold uppercase tracking-wider text-[#0d1424] dark:text-[#f4f6fb]">
                      Confirmar contraseña <span class="text-rose-500">*</span>
                    </label>
                    <div class="relative flex items-center">
                      <span class="pointer-events-none absolute left-3.5 text-[#68748d] dark:text-[#7f899e]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                          <rect x="4" y="10" width="16" height="11" rx="2" />
                          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                        </svg>
                      </span>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        [type]="showPassword() ? 'text' : 'password'"
                        autocomplete="new-password"
                        placeholder="Repite la contraseña"
                        class="h-[46px] w-full rounded-[12px] border border-[#d5deee] bg-[#f8fafc] dark:border-[#1d2433] dark:bg-[#080b11] py-2.5 pl-10 pr-4 text-[16px] sm:text-sm font-medium text-[#0d1424] dark:text-[#f4f6fb] outline-none transition placeholder:text-[#8b9bb4] dark:placeholder:text-[#566176] focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/20"
                        [class.border-rose-400]="fieldError('confirmPassword')"
                        [(ngModel)]="confirmPassword"
                        required
                      />
                    </div>
                    @if (fieldError('confirmPassword'); as message) {
                      <p class="text-xs font-semibold text-rose-600 dark:text-rose-400">{{ message }}</p>
                    }
                  </div>
                </div>

                <!-- Checkbox de Términos y Condiciones -->
                <div class="pt-2">
                  <label for="termsAccepted" class="flex items-start gap-2.5 cursor-pointer select-none text-xs text-[#68748d] dark:text-[#7f899e] leading-relaxed">
                    <input
                      id="termsAccepted"
                      name="termsAccepted"
                      type="checkbox"
                      [(ngModel)]="termsAccepted"
                      class="mt-0.5 h-4 w-4 rounded-[4px] border border-[#d5deee] bg-white text-[#1a5cff] accent-[#1a5cff] focus:ring-[#1a5cff] dark:border-[#1d2433] dark:bg-[#0c1017] dark:accent-[#1a5cff] cursor-pointer"
                    />
                    <span>
                      Acepto los <button type="button" (click)="showTermsModal()" class="font-bold text-[#1a5cff] dark:text-[#3b82f6] hover:underline">términos y condiciones del servicio</button> y autorizo el tratamiento de mis datos personales según la política de privacidad.
                    </span>
                  </label>
                  @if (fieldError('terms'); as message) {
                    <p class="mt-1 text-xs font-semibold text-rose-600 dark:text-rose-400">{{ message }}</p>
                  }
                </div>

                <!-- Botón principal de Envío -->
                <button
                  type="submit"
                  data-keep-gradient
                  class="group btn-primary-gradient mt-4 flex h-[48px] w-full items-center justify-center gap-2 rounded-[12px] bg-gradient-to-r from-[#1a5cff] to-[#2563eb] hover:from-[#3b82f6] hover:to-[#1a5cff] text-sm font-bold text-white shadow-lg shadow-blue-500/25 active:scale-[0.99] transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                  [disabled]="loading()"
                >
                  @if (loading()) {
                    <svg viewBox="0 0 24 24" fill="none" class="h-4 w-4 animate-spin text-white">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" class="opacity-25" />
                      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
                    </svg>
                    <span>Enviando solicitud…</span>
                  } @else {
                    <span>Enviar solicitud de registro</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 transition-transform group-hover:translate-x-1">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  }
                </button>
              </form>

              <!-- Separador -->
              <div class="my-5 flex w-full items-center gap-3">
                <div class="h-px flex-1 bg-[#cbd5e1] dark:bg-[#263042]"></div>
                <span class="shrink-0 text-[11px] font-bold text-[#68748d] dark:text-[#94a3b8] uppercase tracking-wider">
                  o regístrate con
                </span>
                <div class="h-px flex-1 bg-[#cbd5e1] dark:bg-[#263042]"></div>
              </div>

              <!-- Botón de GitHub -->
              <button
                type="button"
                (click)="registerWithGithub()"
                class="btn-github flex h-[46px] w-full items-center justify-center gap-2.5 rounded-[12px] text-xs font-bold active:scale-[0.99] transition duration-200 cursor-pointer"
              >
                <svg class="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
                <span>Registrarse con GitHub</span>
              </button>

              <!-- Pie de la tarjeta -->
              <div class="mt-6 border-t border-[#d5deee]/80 dark:border-[#1d2433] pt-5 text-center text-xs text-[#68748d] dark:text-[#7f899e]">
                ¿Ya tienes una cuenta aprobada?
                <a routerLink="/login" class="font-bold text-[#1a5cff] dark:text-[#3b82f6] hover:underline ml-1">
                  Iniciar sesión aquí →
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Pie de página general con seguridad -->
      <footer class="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-4 text-xs text-[#68748d] dark:text-[#7f899e]">
        <p>© {{ year }} Ferretería Firmeza · Todos los derechos reservados.</p>
        <div class="flex items-center gap-1.5 font-medium">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3.5 w-3.5 text-[#22c55e]">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span>Conexión cifrada TLS 1.3</span>
        </div>
      </footer>
    </div>
  `
})
export class RegisterComponent implements OnInit, OnDestroy {
  private static readonly DRAFT_KEY = 'firmeza-draft-register';
  private static readonly DRAFT_TTL_MS = 60 * 1000;

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  private draftExpiryTimer?: ReturnType<typeof setTimeout>;

  protected readonly year = new Date().getFullYear();

  protected readonly customerType = signal<'natural' | 'company'>('natural');
  protected document = '';
  protected fullName = '';
  protected age = 18;
  protected phone = '';
  protected address = '';
  protected email = '';
  protected password = '';
  protected confirmPassword = '';
  protected termsAccepted = false;

  protected readonly showPassword = signal(false);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly fieldErrors = signal<Record<string, string>>({});
  protected readonly score = signal(0);

  private lastToastTime = 0;

  protected registerWithGithub(): void {
    this.authService.loginWithExternal('GitHub', 'register');
  }

  ngOnInit(): void {
    this.restoreDraft();
  }

  ngOnDestroy(): void {
    if (this.draftExpiryTimer) {
      clearTimeout(this.draftExpiryTimer);
      this.draftExpiryTimer = undefined;
    }
  }

  protected setCustomerType(type: 'natural' | 'company'): void {
    this.customerType.set(type);
    this.saveDraft();
  }

  protected showTermsModal(): void {
    void Swal.fire({
      icon: 'info',
      title: 'Términos y Condiciones',
      html: `
        <div style="text-align: left; font-size: 13px; line-height: 1.6; padding: 4px 0;">
          <p style="margin-bottom: 8px;"><strong>1. Objeto del Servicio:</strong> Ferretería Firmeza proporciona una plataforma digital para la consulta de existencias, cotizaciones y suministro de materiales de construcción.</p>
          <p style="margin-bottom: 8px;"><strong>2. Validación de Clientes:</strong> Toda cuenta de cliente registrada pasa por un proceso de revisión y validación administrativa de datos comerciales antes de la habilitación de pedidos.</p>
          <p style="margin-bottom: 8px;"><strong>3. Protección de Datos (Ley 1581):</strong> La información recopilada será tratada de manera confidencial y exclusivamente para la gestión comercial, facturación y despacho a pie de obra.</p>
        </div>
      `,
      confirmButtonText: 'He leído y acepto',
      confirmButtonColor: '#1a5cff',
      width: '460px',
      customClass: {
        popup: 'rounded-3xl shadow-2xl',
        confirmButton: 'rounded-xl px-6 py-2.5 font-bold text-xs uppercase tracking-wider'
      }
    }).then((res) => {
      if (res.isConfirmed) {
        this.termsAccepted = true;
      }
    });
  }

  protected notifyNumericWarning(fieldName: string = 'este campo'): void {
    const now = Date.now();
    if (now - this.lastToastTime < 700) {
      return;
    }
    this.lastToastTime = now;

    void Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'warning',
      title: `Solo se permiten números en ${fieldName}`,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true
    });
  }

  protected onNumericKeyDown(event: KeyboardEvent, fieldName: string): void {
    const allowedNavigationKeys = [
      'Backspace',
      'Tab',
      'Enter',
      'Delete',
      'Escape',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End'
    ];

    if (allowedNavigationKeys.includes(event.key)) {
      return;
    }

    if (event.ctrlKey || event.metaKey) {
      return;
    }

    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
      this.notifyNumericWarning(fieldName);
    }
  }

  protected onNumericInput(event: Event, fieldName: string): void {
    const target = event.target as HTMLInputElement;
    if (!target) return;

    if (/\D/.test(target.value)) {
      target.value = target.value.replace(/\D/g, '');
      if (fieldName === 'el documento') this.document = target.value;
      if (fieldName === 'el teléfono') this.phone = target.value;
      this.notifyNumericWarning(fieldName);
    }
  }

  protected onNumericPaste(event: ClipboardEvent, fieldName: string): void {
    const pasted = event.clipboardData?.getData('text') ?? '';
    if (/\D/.test(pasted)) {
      this.notifyNumericWarning(fieldName);
    }
  }

  protected incrementAge(): void {
    const current = Number(this.age) || 18;
    if (current < 120) {
      this.age = current + 1;
      this.saveDraft();
    }
  }

  protected decrementAge(): void {
    const current = Number(this.age) || 18;
    if (current > 18) {
      this.age = current - 1;
      this.saveDraft();
    }
  }

  private readonly levels = [
    { label: 'Muy débil', bar: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400' },
    { label: 'Débil', bar: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400' },
    { label: 'Aceptable', bar: 'bg-amber-400', text: 'text-amber-600 dark:text-amber-400' },
    { label: 'Segura', bar: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' }
  ];

  private readonly level = computed(() => {
    const idx = Math.max(0, Math.min(this.score() - 1, 3));
    return this.levels[idx] ?? this.levels[0];
  });

  protected readonly strengthLabel = computed(() =>
    this.password.length === 0 ? 'Mínimo 8 caracteres con números y letras.' : `Seguridad: ${this.level().label}`
  );

  protected readonly strengthClass = computed(() =>
    this.password.length === 0 ? 'text-[#8b9bb4] dark:text-[#566176]' : this.level().text
  );

  protected fieldError(field: string): string | null {
    return this.fieldErrors()[field] ?? null;
  }

  protected barClass(index: number): string {
    const score = this.score();
    if (this.password.length === 0 || index >= score) return 'bg-slate-200 dark:bg-[#1d2433]';
    return this.level().bar;
  }

  protected onPasswordChange(): void {
    const value = this.password;
    let score = 0;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
    if (/\d/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;

    this.score.set(score);
  }

  protected onSubmit(): void {
    if (this.loading()) return;

    this.errorMessage.set(null);
    this.fieldErrors.set({});

    if (!this.termsAccepted) {
      this.fieldErrors.set({ terms: 'Debes aceptar los términos y condiciones para continuar.' });
      this.errorMessage.set('Debes aceptar los términos y condiciones para continuar.');
      void Swal.fire({
        icon: 'warning',
        title: 'Términos y condiciones',
        text: 'Por favor acepta los términos y condiciones antes de enviar tu solicitud.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#1a5cff'
      });
      return;
    }

    this.loading.set(true);

    this.authService
      .register({
        document: this.document.trim(),
        fullName: this.fullName.trim(),
        age: this.age,
        email: this.email.trim(),
        phone: this.phone.trim(),
        address: this.address.trim() || null,
        password: this.password,
        confirmPassword: this.confirmPassword
      })
      .subscribe({
        next: () => {
          this.clearDraft();
          this.toastService.success('Solicitud enviada. Un administrador la revisará para activar tu cuenta.');
          this.router.navigate(['/login']);
        },
        error: (error) => {
          const apiError = toApiError(error);
          this.errorMessage.set(apiError.message);
          this.fieldErrors.set(apiError.fieldErrors);
          this.loading.set(false);

          const emailErr = apiError.fieldErrors['email'] ||
            (apiError.message.toLowerCase().includes('correo') ? apiError.message : null);

          if (emailErr) {
            void Swal.fire({
              icon: 'error',
              title: 'Correo ya registrado',
              html: `
                <div style="text-align: left; font-size: 13.5px; line-height: 1.6; padding: 4px 0;">
                  <p style="margin-bottom: 8px;">
                    El correo electrónico <strong>${this.email}</strong> ya está registrado en Firmeza.
                  </p>
                  <p style="font-size: 12.5px; color: #64748b; margin-top: 8px;">
                    Si ya solicitaste tu cuenta o eres cliente activo, por favor ingresa con tus credenciales.
                  </p>
                </div>
              `,
              showCancelButton: true,
              confirmButtonText: 'Ir a Iniciar Sesión',
              cancelButtonText: 'Usar otro correo',
              confirmButtonColor: '#1a5cff',
              cancelButtonColor: '#64748b',
              customClass: {
                popup: 'rounded-3xl shadow-2xl',
                confirmButton: 'rounded-xl px-5 py-2.5 font-bold text-xs uppercase tracking-wider',
                cancelButton: 'rounded-xl px-5 py-2.5 font-bold text-xs uppercase tracking-wider'
              }
            }).then((res) => {
              if (res.isConfirmed) {
                this.router.navigate(['/login']);
              }
            });
          }
        }
      });
  }

  protected hasFormData(): boolean {
    return Boolean(
      this.document ||
      this.fullName ||
      this.phone ||
      this.address ||
      this.email ||
      this.password ||
      this.confirmPassword
    );
  }

  protected saveDraft(): void {
    queueMicrotask(() => {
      try {
        if (!this.hasFormData()) {
          this.clearDraft();
          return;
        }

        const draft = {
          customerType: this.customerType(),
          document: this.document,
          fullName: this.fullName,
          age: this.age,
          phone: this.phone,
          address: this.address,
          email: this.email,
          password: this.password,
          confirmPassword: this.confirmPassword,
          savedAt: Date.now()
        };
        localStorage.setItem(RegisterComponent.DRAFT_KEY, JSON.stringify(draft));
        this.restartDraftTimer(RegisterComponent.DRAFT_TTL_MS);
      } catch {}
    });
  }

  private restartDraftTimer(delayMs: number): void {
    if (this.draftExpiryTimer) {
      clearTimeout(this.draftExpiryTimer);
    }
    this.draftExpiryTimer = setTimeout(() => {
      this.handleDraftExpired();
    }, delayMs);
  }

  private handleDraftExpired(): void {
    if (!this.hasFormData()) return;

    this.document = '';
    this.fullName = '';
    this.age = 18;
    this.phone = '';
    this.address = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
    this.termsAccepted = false;
    this.onPasswordChange();
    this.clearDraft();

    this.toastService.info('Los datos del formulario se han borrado tras 1 minuto de inactividad.');
  }

  @HostListener('window:beforeunload')
  protected onBeforeUnload(): void {
    try {
      if (!this.hasFormData()) {
        this.clearDraft();
        return;
      }
      const draft = {
        customerType: this.customerType(),
        document: this.document,
        fullName: this.fullName,
        age: this.age,
        phone: this.phone,
        address: this.address,
        email: this.email,
        password: this.password,
        confirmPassword: this.confirmPassword,
        savedAt: Date.now()
      };
      localStorage.setItem(RegisterComponent.DRAFT_KEY, JSON.stringify(draft));
    } catch {}
  }

  private clearDraft(): void {
    try {
      localStorage.removeItem(RegisterComponent.DRAFT_KEY);
    } catch {}
    if (this.draftExpiryTimer) {
      clearTimeout(this.draftExpiryTimer);
      this.draftExpiryTimer = undefined;
    }
  }

  protected restoreDraft(): void {
    try {
      const raw = localStorage.getItem(RegisterComponent.DRAFT_KEY);
      if (!raw) return;

      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object') return;

      const savedAt = Number(data.savedAt);
      const elapsed = Date.now() - (savedAt || 0);

      if (elapsed >= RegisterComponent.DRAFT_TTL_MS) {
        this.clearDraft();
        return;
      }

      if (data.customerType === 'natural' || data.customerType === 'company') {
        this.customerType.set(data.customerType);
      }
      if (typeof data.document === 'string') this.document = data.document;
      if (typeof data.fullName === 'string') this.fullName = data.fullName;
      if (typeof data.age === 'number') this.age = data.age;
      if (typeof data.phone === 'string') this.phone = data.phone;
      if (typeof data.address === 'string') this.address = data.address;
      if (typeof data.email === 'string') this.email = data.email;
      if (typeof data.password === 'string') this.password = data.password;
      if (typeof data.confirmPassword === 'string') this.confirmPassword = data.confirmPassword;

      this.onPasswordChange();
      this.restartDraftTimer(RegisterComponent.DRAFT_TTL_MS - elapsed);
    } catch {
      this.clearDraft();
    }
  }
}
