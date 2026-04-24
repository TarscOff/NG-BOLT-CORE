import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';

import { BreadcrumbItem, HeaderLogo, HeaderNavLink } from '@cadai/pxs-ng-core/interfaces';
import { ToolbarActionsService } from '@cadai/pxs-ng-core/services';

import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';

/**
 * Header based on mat-toolbar.
 *
 * All buttons are provided via ToolbarActionsService -- nothing is hardcoded.
 *
 * Inputs:
 * - showMenuButton  -- hamburger that emits (menuToggle)
 * - title / breadcrumbItems -- page context
 * - navLinks -- desktop mega-menu + mobile drawer
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
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent {
  // -- Feature flags --
  @Input() showMenuButton = false;

  // -- Content --
  @Input() title: string | null = null;
  @Input() breadcrumbItems: BreadcrumbItem[] | null = null;
  @Input() navLinks: HeaderNavLink[] = [];
  @Input() scrolled = false;

  // -- Logo --
  @Input() logoData: HeaderLogo | null = null;

  // -- Aria --
  @Input() navAriaLabel = 'header.nav.primary';
  @Input() navToggleAriaLabel = 'header.nav.toggle';
  @Input() navMobileAriaLabel = 'header.nav.mobile';

  // -- Outputs --
  @Output() menuToggle = new EventEmitter<void>();
  @Output() navLinkClick = new EventEmitter<string>();

  // -- Toolbar actions (all buttons come from here) --
  readonly toolbarActions$ = inject(ToolbarActionsService).actions$;

  // -- Internal state --
  readonly isScrolled = signal(false);
  readonly menuOpen = signal(false);
  readonly activeMegaMenu = signal<number | null>(null);
  readonly expandedGroups = signal<Set<number>>(new Set());

  // -- Nav actions --
  openMegaMenu(index: number): void {
    this.activeMegaMenu.set(index);
  }

  closeMegaMenu(): void {
    this.activeMegaMenu.set(null);
  }

  toggleMegaMenu(index: number): void {
    this.activeMegaMenu.update((v) => (v === index ? null : index));
  }

  toggleMobileGroup(index: number): void {
    this.expandedGroups.update((set) => {
      const next = new Set<number>();
      if (!set.has(index)) next.add(index);
      return next;
    });
  }

  toggleMobileMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  scrollToSection(event: Event, target: string) {
    event.preventDefault();
    const el = document.getElementById(target);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
