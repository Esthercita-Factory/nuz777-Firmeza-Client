import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { toApiError } from '../../Services/Api.Service';
import { ADMINISTRATOR_ROLE, AuthService } from '../../Services/auth.service';
import { AdminNotificationService } from '../../Services/admin-notification.service';
import { ThemeToggleComponent } from '../Shared/ThemeToggle.Component';

@Component({
  selector: 'app-login',
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

        <!-- Controles superiores: Tema y Registro siempre visibles en cualquier pantalla -->
        <div class="flex items-center gap-2 sm:gap-3 text-xs font-semibold">
          <app-theme-toggle size="sm" />
          <div class="hidden sm:flex items-center gap-1.5 text-[#68748d] dark:text-[#7f899e]">
            <span>¿No tienes cuenta?</span>
            <a routerLink="/register" class="font-bold text-[#1a5cff] hover:text-[#3b82f6] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a5cff] rounded">
              Solicitar registro →
            </a>
          </div>
          <a
            routerLink="/register"
            class="sm:hidden inline-flex items-center justify-center rounded-xl border border-[#d5deee] bg-white/90 px-3 py-2 text-xs font-bold text-[#1a5cff] dark:border-[#1d2433] dark:bg-[#0c1017] dark:text-blue-400 min-h-[40px]"
          >
            Registro
          </a>
        </div>
      </header>

      <!-- Contenedor principal: Layout dividido en escritorio, centrado en tablet y móvil -->
      <main class="relative z-10 my-auto flex w-full items-center justify-center px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div class="w-full max-w-6xl xl:max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          <!-- PANEL IZQUIERDO DE MARCA (Desktop) -->
          <section class="hidden lg:flex lg:col-span-7 xl:col-span-7 flex-col justify-between min-h-[580px] rounded-[28px] border border-[#d5deee] bg-white/90 p-8 xl:p-12 shadow-xl shadow-slate-200/50 backdrop-blur-md dark:border-[#1d2433] dark:bg-[#0c1017] dark:shadow-2xl dark:shadow-black/70 relative overflow-hidden transition-colors duration-200">
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
                  <span class="text-xs font-semibold text-[#68748d] dark:text-[#7f899e]">Plataforma Comercial & Bodega</span>
                </div>
              </div>

              <!-- Titular impactante -->
              <h2 class="mt-8 text-3xl xl:text-4xl font-black tracking-tight leading-tight text-[#0d1424] dark:text-[#f4f6fb]">
                Suministros y materiales de construcción a gran escala
              </h2>
              <p class="mt-4 text-sm xl:text-base leading-relaxed text-[#68748d] dark:text-[#7f899e] max-w-xl">
                Control inteligente de existencias en bodega, cotizaciones con IVA desglosado en tiempo real y despacho directo a pie de obra para proyectos y constructoras.
              </p>

              <!-- Barras decorativas de rendimiento y disponibilidad -->
              <div class="mt-8 space-y-3.5 max-w-md">
                <div>
                  <div class="flex justify-between text-xs font-bold mb-1.5">
                    <span class="text-[#0d1424] dark:text-[#f4f6fb]">Disponibilidad en bodega central</span>
                    <span class="text-[#1a5cff]">99.4%</span>
                  </div>
                  <div class="h-2 w-full rounded-full bg-slate-200 dark:bg-[#111622] overflow-hidden">
                    <div data-keep-gradient class="h-full rounded-full progress-bar-blue bg-gradient-to-r from-[#1a5cff] to-[#3b82f6] w-[99.4%]"></div>
                  </div>
                </div>

                <div>
                  <div class="flex justify-between text-xs font-bold mb-1.5">
                    <span class="text-[#0d1424] dark:text-[#f4f6fb]">Despachos logísticos a tiempo</span>
                    <span class="text-[#22c55e]">98.8%</span>
                  </div>
                  <div class="h-2 w-full rounded-full bg-slate-200 dark:bg-[#111622] overflow-hidden">
                    <div data-keep-gradient class="h-full rounded-full progress-bar-green bg-gradient-to-r from-[#22c55e] to-emerald-400 w-[98.8%]"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Métricas destacadas (3 tarjetas) -->
            <div class="relative z-10 pt-8 border-t border-[#d5deee]/80 dark:border-[#1d2433]">
              <div class="grid grid-cols-3 gap-4">
                <div class="rounded-2xl border border-[#d5deee] bg-white/70 p-4 dark:border-[#1d2433] dark:bg-[#080b11]">
                  <p class="text-2xl xl:text-3xl font-black text-[#1a5cff] tracking-tight">+1,200</p>
                  <p class="mt-1 text-xs font-semibold text-[#68748d] dark:text-[#7f899e]">Materiales en catálogo</p>
                </div>
                <div class="rounded-2xl border border-[#d5deee] bg-white/70 p-4 dark:border-[#1d2433] dark:bg-[#080b11]">
                  <p class="text-2xl xl:text-3xl font-black text-[#22c55e] tracking-tight">99.8%</p>
                  <p class="mt-1 text-xs font-semibold text-[#68748d] dark:text-[#7f899e]">Despachos a tiempo</p>
                </div>
                <div class="rounded-2xl border border-[#d5deee] bg-white/70 p-4 dark:border-[#1d2433] dark:bg-[#080b11]">
                  <p class="text-2xl xl:text-3xl font-black text-[#0d1424] dark:text-[#f4f6fb] tracking-tight">24/7</p>
                  <p class="mt-1 text-xs font-semibold text-[#68748d] dark:text-[#7f899e]">Trazabilidad de pedidos</p>
                </div>
              </div>
            </div>
          </section>

          <!-- PANEL DERECHO: FORMULARIO DE ACCESO (Móvil, Tablet y Escritorio) -->
          <div class="lg:col-span-5 xl:col-span-5 w-full max-w-[480px] mx-auto">
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
                  Iniciar sesión
                </h1>
                <p class="mt-1 text-xs text-[#68748d] dark:text-[#7f899e]">
                  Ingresa tus credenciales para acceder a la plataforma
                </p>
              </div>

              <!-- Selector de pestaña: Correo o Cédula/NIT -->
              <div class="mt-6 flex h-11 rounded-xl border border-[#d5deee] bg-[#f0f4fa] p-1 text-xs font-bold dark:border-[#1d2433] dark:bg-[#080b11]">
                <button
                  type="button"
                  (click)="setLoginType('email')"
                  class="flex flex-1 items-center justify-center gap-1.5 rounded-lg transition min-h-[34px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a5cff]"
                  [class]="loginType() === 'email'
                    ? 'bg-white text-[#1a5cff] shadow-sm dark:bg-[#141b27] dark:text-[#f4f6fb]'
                    : 'text-[#68748d] hover:text-[#0d1424] dark:text-[#7f899e] dark:hover:text-[#f4f6fb]'"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3.5 w-3.5">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-10 6L2 7" />
                  </svg>
                  <span>Correo</span>
                </button>
                <button
                  type="button"
                  (click)="setLoginType('document')"
                  class="flex flex-1 items-center justify-center gap-1.5 rounded-lg transition min-h-[34px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a5cff]"
                  [class]="loginType() === 'document'
                    ? 'bg-white text-[#1a5cff] shadow-sm dark:bg-[#141b27] dark:text-[#f4f6fb]'
                    : 'text-[#68748d] hover:text-[#0d1424] dark:text-[#7f899e] dark:hover:text-[#f4f6fb]'"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3.5 w-3.5">
                    <rect x="3" y="4" width="18" height="16" rx="3" />
                    <circle cx="9" cy="10" r="2" />
                    <path d="M15 8h2M15 12h2M7 16h10" />
                  </svg>
                  <span>Cédula / NIT</span>
                </button>
              </div>

              <!-- Mensaje de error accesible -->
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

              <!-- Formulario de acceso -->
              <form class="mt-5 space-y-4" (ngSubmit)="onSubmit()" (input)="saveDraft()" (change)="saveDraft()" novalidate>
                @if (loginType() === 'document') {
                  <div class="space-y-1.5">
                    <div class="flex items-center justify-between">
                      <label for="document" class="block text-xs font-bold uppercase tracking-wider text-[#0d1424] dark:text-[#f4f6fb]">
                        Cédula / NIT <span class="text-rose-500">*</span>
                      </label>
                      <span class="text-[10px] font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/80">
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
                        placeholder="Ej.: 1020304050"
                        class="h-[46px] w-full rounded-[12px] border border-[#d5deee] bg-[#f8fafc] dark:border-[#1d2433] dark:bg-[#080b11] py-2.5 pl-10 pr-4 text-[16px] sm:text-sm font-medium text-[#0d1424] dark:text-[#f4f6fb] outline-none transition placeholder:text-[#8b9bb4] dark:placeholder:text-[#566176] focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/20"
                        [(ngModel)]="document"
                        (keydown)="onNumericKeyDown($event, 'el documento')"
                        (input)="onNumericInput($event, 'el documento')"
                        (paste)="onNumericPaste($event, 'el documento')"
                        required
                      />
                    </div>
                  </div>
                } @else {
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
                        placeholder="ejemplo@firmeza.com"
                        class="h-[46px] w-full rounded-[12px] border border-[#d5deee] bg-[#f8fafc] dark:border-[#1d2433] dark:bg-[#080b11] py-2.5 pl-10 pr-4 text-[16px] sm:text-sm font-medium text-[#0d1424] dark:text-[#f4f6fb] outline-none transition placeholder:text-[#8b9bb4] dark:placeholder:text-[#566176] focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/20"
                        [(ngModel)]="email"
                        required
                      />
                    </div>
                  </div>
                }

                <!-- Campo de Contraseña -->
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between">
                    <label for="password" class="block text-xs font-bold uppercase tracking-wider text-[#0d1424] dark:text-[#f4f6fb]">
                      Contraseña <span class="text-rose-500">*</span>
                    </label>
                  </div>
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
                      autocomplete="current-password"
                      placeholder="••••••••"
                      class="h-[46px] w-full rounded-[12px] border border-[#d5deee] bg-[#f8fafc] dark:border-[#1d2433] dark:bg-[#080b11] py-2.5 pl-10 pr-11 text-[16px] sm:text-sm font-medium text-[#0d1424] dark:text-[#f4f6fb] outline-none transition placeholder:text-[#8b9bb4] dark:placeholder:text-[#566176] focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/20"
                      [(ngModel)]="password"
                      (keyup)="onPasswordKey($event)"
                      (blur)="capsLock.set(false)"
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

                  @if (capsLock()) {
                    <p class="mt-1 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3.5 w-3.5">
                        <path d="M12 3 3 14h6v4h6v-4h6z" />
                        <line x1="9" y1="21" x2="15" y2="21" />
                      </svg>
                      Bloq Mayús está activado
                    </p>
                  }
                </div>

                <!-- Fila de Recordarme y Olvidé contraseña -->
                <div class="flex items-center justify-between pt-1 text-xs">
                  <label for="rememberMe" class="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      id="rememberMe"
                      name="rememberMe"
                      type="checkbox"
                      [(ngModel)]="rememberMe"
                      class="h-4 w-4 rounded-[4px] border border-[#d5deee] bg-white text-[#1a5cff] accent-[#1a5cff] focus:ring-[#1a5cff] dark:border-[#1d2433] dark:bg-[#0c1017] dark:accent-[#1a5cff] cursor-pointer"
                    />
                    <span class="font-medium text-[#68748d] dark:text-[#7f899e]">Recordarme</span>
                  </label>
                  <button
                    type="button"
                    (click)="onForgotPassword()"
                    class="font-bold text-[#1a5cff] dark:text-[#3b82f6] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a5cff] rounded"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                <!-- Botón principal con degradado y sombra suave -->
                <button
                  type="submit"
                  data-keep-gradient
                  class="group btn-primary-gradient mt-3 flex h-[48px] w-full items-center justify-center gap-2 rounded-[12px] bg-gradient-to-r from-[#1a5cff] to-[#2563eb] hover:from-[#3b82f6] hover:to-[#1a5cff] text-sm font-bold text-white shadow-lg shadow-blue-500/25 active:scale-[0.99] transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                  [disabled]="loading()"
                >
                  @if (loading()) {
                    <svg viewBox="0 0 24 24" fill="none" class="h-4 w-4 animate-spin text-white">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" class="opacity-25" />
                      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
                    </svg>
                    <span>Verificando credenciales…</span>
                  } @else {
                    <span>Ingresar al sistema</span>
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
                  o continúa con
                </span>
                <div class="h-px flex-1 bg-[#cbd5e1] dark:bg-[#263042]"></div>
              </div>

              <!-- Botón de GitHub -->
              <button
                type="button"
                (click)="loginWithGithub()"
                class="btn-github flex h-[46px] w-full items-center justify-center gap-2.5 rounded-[12px] text-xs font-bold active:scale-[0.99] transition duration-200 cursor-pointer"
              >
                <svg class="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
                <span>Ingresar con GitHub</span>
              </button>

              <!-- Pie de la tarjeta -->
              <div class="mt-6 border-t border-[#d5deee]/80 dark:border-[#1d2433] pt-5 text-center text-xs text-[#68748d] dark:text-[#7f899e]">
                ¿Eres cliente nuevo?
                <a routerLink="/register" class="font-bold text-[#1a5cff] dark:text-[#3b82f6] hover:underline ml-1">
                  Solicita tu registro aquí →
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
export class LoginComponent implements OnInit {
  private static readonly DRAFT_KEY = 'firmeza-draft-login';
  private static readonly REMEMBER_KEY = 'firmeza-remember-login';

  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(AdminNotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly year = new Date().getFullYear();

  protected readonly loginType = signal<'email' | 'document'>('email');
  protected email = '';
  protected document = '';
  protected password = '';
  protected rememberMe = false;
  protected readonly showPassword = signal(false);
  protected readonly capsLock = signal(false);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.restoreRemembered();
    this.restoreDraft();
  }

  protected setLoginType(type: 'email' | 'document'): void {
    this.loginType.set(type);
    this.saveDraft();
  }

  private lastToastTime = 0;

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
      this.document = target.value;
      this.notifyNumericWarning(fieldName);
    }
  }

  protected onNumericPaste(event: ClipboardEvent, fieldName: string): void {
    const pasted = event.clipboardData?.getData('text') ?? '';
    if (/\D/.test(pasted)) {
      this.notifyNumericWarning(fieldName);
    }
  }

  protected onPasswordKey(event: KeyboardEvent): void {
    this.capsLock.set(event.getModifierState?.('CapsLock') ?? false);
  }

  protected onForgotPassword(): void {
    void Swal.fire({
      icon: 'info',
      title: 'Recuperar contraseña',
      html: `
        <div style="text-align: left; font-size: 14px; line-height: 1.6; padding: 4px 0;">
          <p style="margin-bottom: 8px;">
            Por políticas de seguridad corporativa de <strong>Ferretería Firmeza</strong>, el restablecimiento de contraseñas es coordinado por la administración.
          </p>
          <p style="font-size: 12.5px; opacity: 0.85; margin-top: 12px; border-top: 1px dashed rgba(148, 163, 184, 0.4); padding-top: 10px;">
            Escribe a <strong>soporte&#64;firmeza.com</strong> indicando tu número de documento comercial para generar un enlace seguro de renovación.
          </p>
        </div>
      `,
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#1a5cff',
      width: '440px',
      customClass: {
        popup: 'rounded-3xl shadow-2xl',
        confirmButton: 'rounded-xl px-6 py-2.5 font-bold text-xs uppercase tracking-wider'
      }
    });
  }

  protected onSubmit(): void {
    if (this.loading()) return;

    const identifier = this.loginType() === 'document' ? this.document.trim() : this.email.trim();

    if (!identifier) {
      this.errorMessage.set(
        this.loginType() === 'document' ? 'Ingresa tu número de documento.' : 'Ingresa tu correo electrónico.'
      );
      return;
    }

    this.errorMessage.set(null);
    this.loading.set(true);

    this.authService.login({ email: identifier, password: this.password }).subscribe({
      next: (tokens) => {
        this.clearDraft();
        if (this.rememberMe) {
          try {
            localStorage.setItem(
              LoginComponent.REMEMBER_KEY,
              JSON.stringify({
                loginType: this.loginType(),
                identifier
              })
            );
          } catch {}
        } else {
          try {
            localStorage.removeItem(LoginComponent.REMEMBER_KEY);
          } catch {}
        }

        this.authService.saveSession(tokens);

        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

        if (tokens.user.roles.includes(ADMINISTRATOR_ROLE)) {
          this.notificationService.onAdminLogin();
          this.router.navigate([returnUrl && returnUrl.startsWith('/') ? returnUrl : '/dashboard']);
          return;
        }

        this.router.navigate([returnUrl && returnUrl.startsWith('/') ? returnUrl : '/tienda']);
      },
      error: (error) => {
        this.errorMessage.set(toApiError(error).message);
        this.loading.set(false);
      }
    });
  }

  protected loginWithGithub(): void {
    this.authService.loginWithExternal('GitHub', 'login');
  }

  protected saveDraft(): void {
    queueMicrotask(() => {
      try {
        const draft = {
          loginType: this.loginType(),
          email: this.email,
          document: this.document
        };
        localStorage.setItem(LoginComponent.DRAFT_KEY, JSON.stringify(draft));
      } catch {}
    });
  }

  @HostListener('window:beforeunload')
  protected onBeforeUnload(): void {
    try {
      const draft = {
        loginType: this.loginType(),
        email: this.email,
        document: this.document
      };
      localStorage.setItem(LoginComponent.DRAFT_KEY, JSON.stringify(draft));
    } catch {}
  }

  private clearDraft(): void {
    try {
      localStorage.removeItem(LoginComponent.DRAFT_KEY);
    } catch {}
  }

  private restoreDraft(): void {
    try {
      const raw = localStorage.getItem(LoginComponent.DRAFT_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.loginType === 'email' || data.loginType === 'document') {
        this.loginType.set(data.loginType);
      }
      if (typeof data.email === 'string' && data.email) this.email = data.email;
      if (typeof data.document === 'string' && data.document) this.document = data.document;
    } catch {}
  }

  private restoreRemembered(): void {
    try {
      const raw = localStorage.getItem(LoginComponent.REMEMBER_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data && data.identifier) {
        this.rememberMe = true;
        if (data.loginType === 'document') {
          this.loginType.set('document');
          this.document = data.identifier;
        } else {
          this.loginType.set('email');
          this.email = data.identifier;
        }
      }
    } catch {}
  }
}
