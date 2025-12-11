import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { BreadcrumbItem } from '@cadai/pxs-ng-core/interfaces';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private titleSubject = new BehaviorSubject<string>('App');
  title$ = this.titleSubject.asObservable();

  private breadcrumbsSubject = new BehaviorSubject<BreadcrumbItem[]>([]);
  public breadcrumbs$ = this.breadcrumbsSubject.asObservable();

  setTitle(title: string) {
    this.titleSubject.next(title);
  }

  setBreadcrumbs(items: BreadcrumbItem[]): void {
    this.breadcrumbsSubject.next(items);
  }

  clearBreadcrumbs(): void {
    this.breadcrumbsSubject.next([]);
  }
}
