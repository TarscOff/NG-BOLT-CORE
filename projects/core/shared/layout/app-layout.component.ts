import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  Inject,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { fromEvent, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import {
  AuthProfile,
  BreadcrumbItem,
  CoreOptions,
  FeatureNavItem,
  HeaderLogo,
  HeaderNavLink,
} from '@cadai/pxs-ng-core/interfaces';
import {
  FeatureService,
  KeycloakService,
  LayoutService,
  ThemeService,
} from '@cadai/pxs-ng-core/services';
import { AppActions, AppSelectors } from '@cadai/pxs-ng-core/store';
import { CORE_OPTIONS } from '@cadai/pxs-ng-core/tokens';

import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatListModule,
    MatMenuModule,
    MatChipsModule,
    TranslateModule,
    BreadcrumbComponent,
    HeaderComponent,
  ],
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss'],
})
export class AppLayoutComponent implements OnInit, AfterViewInit {
  constructor(@Inject(CORE_OPTIONS) private readonly coreOpts: Required<CoreOptions>) {
    effect(() => {
      this.menuItems = this.features.visibleFeaturesSig();
      this.cdr.markForCheck();
    });
  }

  public isOpen = true;
  public title$!: Observable<string>;
  public logoData$!: Observable<HeaderLogo | null>;
  public version!: string;
  public menuItems: FeatureNavItem[] = [];

  public breadcrumbItems$!: Observable<BreadcrumbItem[]>;

  @ViewChild('sidenavContent', { read: ElementRef }) sidenavContent!: ElementRef;
  @ViewChild('sidenav') sidenav?: MatSidenav;
  public isScrolled = false;

  profile$!: Observable<AuthProfile | null>;
  roles$!: Observable<string[]>;

  // inject()
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);
  private layoutService = inject(LayoutService);
  public translate = inject(TranslateService);
  public theme = inject(ThemeService);
  private store = inject(Store);
  private features = inject(FeatureService);
  private keycloak = inject(KeycloakService);

  // ── Layout / header config from LayoutService ──
  readonly showSidenav = toSignal(this.layoutService.showSidenav$, { initialValue: true });
  readonly headerNavLinks = toSignal(this.layoutService.headerNavLinks$, {
    initialValue: [] as HeaderNavLink[],
  });

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
    if (this.sidenavContent?.nativeElement) {
      fromEvent(this.sidenavContent.nativeElement, 'scroll')
        .pipe(
          map(() => this.sidenavContent.nativeElement.scrollTop > 0),
          distinctUntilChanged(),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe((scrolled) => {
          this.isScrolled = scrolled;
          this.cdr.markForCheck();
        });
    }
  }

  ngOnInit(): void {
    this.logoData$ = this.layoutService.logoData$;
    this.title$ = this.layoutService.title$;
    this.breadcrumbItems$ = this.layoutService.breadcrumbs$;
    this.version = this.coreOpts.appVersion || '0.0.0';
    this.menuItems = this.features.visibleFeaturesSig();

    this.profile$ = this.store.select(AppSelectors.AuthSelectors.selectProfile);
    this.roles$ = this.profile$.pipe(map((p) => p?.authorization ?? []));
    this.profile$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((p) => {
      const roles = p?.authorization ?? [];
      const { isAuthenticated, tenant } = this.keycloak.getUserCtx();
      this.features.setUser({ isAuthenticated, roles, tenant });
      this.menuItems = this.features.visibleFeaturesSig();
      this.cdr.markForCheck();
    });
  }

  async toggleSidenav(): Promise<void> {
    await this.sidenav?.toggle();
  }

  displayName(p: AuthProfile | null): string {
    if (!p) return '';
    return (
      p.name ||
      [p.given_name, p.family_name].filter(Boolean).join(' ') ||
      p.preferred_username ||
      ''
    );
  }

  logout(): void {
    this.store.dispatch(AppActions.AuthActions.logout());
  }

  get logoUrl(): string {
    return (
      this.coreOpts.logoUrl ||
      'https://clarence-cloud.com/wp-content/themes/theme-clarence/assets/public/img/cloud-clarence.png'
    );
  }
}
