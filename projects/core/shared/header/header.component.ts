import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  inject,
  Input,
  Output,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { BreadcrumbItem } from '@cadai/pxs-ng-core/interfaces';
import { HeaderLanguage, HeaderNavLink } from '@cadai/pxs-ng-core/interfaces';
import { KeycloakService, ToolbarActionsService } from '@cadai/pxs-ng-core/services';
import { AppActions, AppSelectors } from '@cadai/pxs-ng-core/store';

import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';

/**
 * Reusable header component with two variants:
 *
 * `variant="normal"` — transparent fixed header for public/landing pages;
 *  gains glass-blur on scroll; renders nav links with optional submenus,
 *  login button, language & theme toggles. Burger menu visible on mobile only.
 *
 * `variant="app"` — toolbar for authenticated pages inside AppLayoutComponent;
 *  renders a menu toggle, page title, breadcrumbs, and dynamic toolbar actions.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    MatTooltipModule,
    BreadcrumbComponent,
    RouterModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent {
  private readonly router = inject(Router);
  private readonly store = inject(Store);
  private readonly translate = inject(TranslateService);
  private readonly kc = inject(KeycloakService);

  // ── Variant ────────────────────────────────────────────────
  @Input() variant: 'normal' | 'app' = 'normal';

  // ═══════════════════════════════════════════════════════════
  // SHARED INPUTS
  // ═══════════════════════════════════════════════════════════

  // ── Logo ───────────────────────────────────────────────────
  @Input() logoSrc = '/assets/logo.png';
  @Input() logoAlt = 'Proximus GenAI';
  @Input() logoName = 'GenAI Platform';
  @Input() logoHref = '/';

  // ── Auth (internal — reads store, delegates to KeycloakService) ──
  readonly isAuthenticated = toSignal(
    this.store.select(AppSelectors.AuthSelectors.selectIsAuthenticated),
    { initialValue: false },
  );

  login(): void {
    this.kc.login();
  }

  logout(): void {
    this.store.dispatch(AppActions.AuthActions.logout());
  }

  // ── Theme (internal — reads/writes store) ──────────────────
  readonly isDark = toSignal(this.store.select(AppSelectors.ThemeSelectors.selectIsDark), {
    initialValue: false,
  });

  toggleTheme(): void {
    this.store.dispatch(
      AppActions.ThemeActions.setTheme({ mode: this.isDark() ? 'light' : 'dark' }),
    );
  }

  // ── Language (internal — reads/writes store + translate) ───
  @Input() languages: HeaderLanguage[] = [];

  readonly currentLang = toSignal(this.store.select(AppSelectors.LangSelectors.selectLang));

  switchLang(code: string): void {
    this.store.dispatch(AppActions.LangActions.setLang({ lang: code as any }));
    this.translate.use(code);
  }

  // ═══════════════════════════════════════════════════════════
  // NORMAL VARIANT INPUTS
  // ═══════════════════════════════════════════════════════════

  @Input() navLinks: HeaderNavLink[] = [];
  @Input() loginLabel = 'header.login';
  @Input() logoutLabel = 'header.logout';
  @Input() langTooltip = 'header.lang.tooltip';
  @Input() langAriaLabel = 'header.lang.select';
  @Input() langMenuAriaLabel = 'header.lang.menu';
  @Input() navAriaLabel = 'header.nav.primary';
  @Input() navToggleAriaLabel = 'header.nav.toggle';
  @Input() navMobileAriaLabel = 'header.nav.mobile';
  @Input() themeToLightAriaLabel = 'header.theme.toLight';
  @Input() themeToDarkAriaLabel = 'header.theme.toDark';
  @Input() scrollThreshold = 60;
  @Output() navLinkClick = new EventEmitter<string>();

  // ═══════════════════════════════════════════════════════════
  // APP VARIANT INPUTS
  // ═══════════════════════════════════════════════════════════

  @Input() title = '';
  @Input() breadcrumbItems: BreadcrumbItem[] | null = null;
  @Input() scrolled = false;
  @Output() menuToggle = new EventEmitter<void>();

  readonly toolbarActions$ = inject(ToolbarActionsService).actions$;

  // ═══════════════════════════════════════════════════════════
  // INTERNAL STATE (normal variant only)
  // ═══════════════════════════════════════════════════════════

  readonly isScrolled = signal(false);
  readonly menuOpen = signal(false);

  @HostListener('window:scroll')
  onScroll(): void {
    if (this.variant !== 'normal') return;
    this.isScrolled.set(window.scrollY > this.scrollThreshold);
  }

  onNavClick(link: HeaderNavLink): void {
    if (link.url) {
      if (link.url.startsWith('http')) {
        window.open(link.url, '_blank', 'noopener');
      } else {
        this.router.navigateByUrl(link.url);
      }
    } else {
      this.navLinkClick.emit(link.target ?? link.label);
    }
    this.menuOpen.set(false);
  }

  toggleMobileMenu(): void {
    this.menuOpen.update((v) => !v);
  }
}
