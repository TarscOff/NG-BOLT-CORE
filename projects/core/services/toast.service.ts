import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);

  show(message: string, action = this.translate.instant('close'), duration = 3000): void {
    this.snackBar.open(message, action, {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: 'app-toast-success',
    });
  }

  showError(message: string, action = this.translate.instant('close'), duration = 3000): void {
    this.snackBar.open(message, action, {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: 'app-toast-error',
    });
  }
}
