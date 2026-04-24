import { DestroyRef, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { BreadcrumbItem, HeaderLogo, HeaderNavLink } from '@cadai/pxs-ng-core/interfaces';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  // ── Page title / breadcrumbs ──────────────────────────────
  private titleSubject = new BehaviorSubject<string>('');
  title$ = this.titleSubject.asObservable();

  private breadcrumbsSubject = new BehaviorSubject<BreadcrumbItem[]>([]);
  public breadcrumbs$ = this.breadcrumbsSubject.asObservable();

  private logoDataSubject = new BehaviorSubject<HeaderLogo | null>(null);
  logoData$ = this.logoDataSubject.asObservable();

  setTitle(title: string) {
    this.titleSubject.next(title);
  }

  setBreadcrumbs(items: BreadcrumbItem[]): void {
    this.breadcrumbsSubject.next(items);
  }

  setLogoData(logoData: HeaderLogo | null): void {
    this.logoDataSubject.next(logoData);
  }

  clearBreadcrumbs(): void {
    this.breadcrumbsSubject.next([]);
  }

  // ── Header / layout config ────────────────────────────────
  private showSidenavSubject = new BehaviorSubject(true);
  showSidenav$ = this.showSidenavSubject.asObservable();

  private headerNavLinksSubject = new BehaviorSubject<HeaderNavLink[]>([]);
  headerNavLinks$ = this.headerNavLinksSubject.asObservable();

  setShowSidenav(show: boolean): void {
    this.showSidenavSubject.next(show);
  }

  setHeaderNavLinks(links: HeaderNavLink[]): void {
    this.headerNavLinksSubject.next(links);
  }

  /** Reset header/layout config to defaults. */
  resetLayoutConfig(): void {
    this.showSidenavSubject.next(true);
    this.headerNavLinksSubject.next([]);
  }

  /**
   * Scope layout configuration to a component's lifetime.
   * Resets to defaults when the component is destroyed.
   */
  configureLayout(
    destroyRef: DestroyRef,
    config: {
      showSidenav?: boolean;
      transparent?: boolean;
      navLinks?: HeaderNavLink[];
    },
  ): void {
    if (config.showSidenav != null) this.setShowSidenav(config.showSidenav);
    if (config.navLinks != null) this.setHeaderNavLinks(config.navLinks);

    destroyRef.onDestroy(() => this.resetLayoutConfig());
  }
}
