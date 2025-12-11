import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

import { BreadcrumbItem } from '@cadai/pxs-ng-core/interfaces';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
})
export class BreadcrumbComponent {
  @Input() items: BreadcrumbItem[] | null = null;

  constructor(private router: Router) {}

  async navigate(item: BreadcrumbItem): Promise<void> {
    if (item.route && !item.disabled) {
      await this.router.navigate([item.route], { queryParams: item.queryParams });
    }
  }

  isClickable(item: BreadcrumbItem): boolean {
    return !!item.route && !item.disabled;
  }
}
