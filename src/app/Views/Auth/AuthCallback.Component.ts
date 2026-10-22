import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ADMINISTRATOR_ROLE, AuthService, TokenResponse } from '../../Services/auth.service';
import { AdminNotificationService } from '../../Services/admin-notification.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  template: `
    <div class="flex min-h-screen items-center justify-center bg-slate-900 text-white">
      <div class="text-center space-y-4">
        <div class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        <p class="text-sm font-semibold tracking-wide text-slate-300">
          Completando autenticación...
        </p>
      </div>
    </div>
  `
})
export class AuthCallbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(AdminNotificationService);

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const error = params.get('error');

    if (error) {
      this.authService.logout(false);
      void Swal.fire({
        icon: 'error',
        title: 'Acceso no permitido',
        text: error,
        confirmButtonColor: '#1a5cff',
        confirmButtonText: 'Volver al inicio de sesión'
      }).then(() => {
        this.router.navigate(['/login']);
      });
      return;
    }

    const accessToken = params.get('accessToken');
    const accessTokenExpiresAt = params.get('accessTokenExpiresAt');
    const refreshToken = params.get('refreshToken');
    const refreshTokenExpiresAt = params.get('refreshTokenExpiresAt');
    const avatarUrl = params.get('avatarUrl');

    if (!accessToken || !refreshToken) {
      void Swal.fire({
        icon: 'error',
        title: 'Error de autenticación',
        text: 'No se recibieron los tokens de acceso del servidor.',
        confirmButtonColor: '#1a5cff'
      }).then(() => {
        this.router.navigate(['/login']);
      });
      return;
    }

    let payload: any = {};
    try {
      const base64 = accessToken.split('.')[1];
      payload = JSON.parse(atob(base64));
    } catch {
      payload = {};
    }

    const rolesRaw = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
      ?? payload['role']
      ?? payload['roles']
      ?? [];
    const roles: string[] = Array.isArray(rolesRaw) ? rolesRaw : [rolesRaw];

    const tokenResponse: TokenResponse = {
      tokenType: 'Bearer',
      accessToken,
      accessTokenExpiresAt: accessTokenExpiresAt ?? new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      refreshToken,
      refreshTokenExpiresAt: refreshTokenExpiresAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      user: {
        id: payload['sub'] ?? payload['nameid'] ?? '',
        email: payload['email'] ?? '',
        fullName: payload['name'] ?? payload['unique_name'] ?? 'Usuario',
        roles,
        customerStatus: 'RequiresProfile',
        avatarUrl: payload['picture'] ?? avatarUrl ?? null
      }
    };

    this.authService.saveSession(tokenResponse);

    if (tokenResponse.user.roles.includes(ADMINISTRATOR_ROLE)) {
      this.notificationService.onAdminLogin();
      this.router.navigate(['/dashboard']);
      return;
    }

    this.authService.me().subscribe({
      next: (profile) => {
        this.authService.updateCurrentUser({
          ...profile,
          avatarUrl: profile.avatarUrl || tokenResponse.user.avatarUrl || null
        });
        this.router.navigate(['/tienda']);
      },
      error: () => {
        this.router.navigate(['/tienda']);
      }
    });
  }
}
