import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'dark' | 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly storageKey = 'firmeza-theme';
  readonly isDark = signal<boolean>(true);

  constructor() {
    this.initTheme();
  }

  private initTheme(): void {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(this.storageKey);
    if (stored === 'light') {
      this.setDark(false);
    } else if (stored === 'dark') {
      this.setDark(true);
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setDark(prefersDark);
    }
  }

  toggle(): void {
    this.setDark(!this.isDark());
  }

  setDark(dark: boolean): void {
    this.isDark.set(dark);
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem(this.storageKey, 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem(this.storageKey, 'light');
    }
  }
}
