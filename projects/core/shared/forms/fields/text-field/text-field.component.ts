import { TextFieldModule } from '@angular/cdk/text-field';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  ReactiveFormsModule,
  ValidationErrors,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { FieldConfig, FieldVariableOption } from '@cadai/pxs-ng-core/interfaces';

@Component({
  standalone: true,
  selector: 'app-text-field',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    TextFieldModule,
    TranslateModule,
  ],
  template: `
    <mat-form-field
      appearance="outline"
      floatLabel="always"
      [color]="field.color || 'primary'"
      [class]="field.layoutClass?.concat(' w-full') || 'w-full'"
    >
      <mat-label>{{ field.label | translate }}</mat-label>

      <!-- Textarea vs Input -->
      @if (isTextarea) {
        <div class="textarea-wrapper" [class.resizable]="field.isResizable">
          @if (field.isResizable) {
            <div
              class="resize-handle"
              (mousedown)="onResizeStart($event)"
              (touchstart)="onResizeStart($event)"
            >
              <div class="resize-handle-bar"></div>
            </div>
          }
          <textarea
            #textareaRef
            matInput
            [id]="field.name"
            [formControl]="fc"
            [placeholder]="field.placeholder || '' | translate"
            [attr.minlength]="field.minLength || null"
            [attr.maxlength]="field.maxLength || null"
            [attr.aria-label]="field.label | translate"
            [attr.aria-describedby]="ariaDescribedBy"
            [attr.aria-invalid]="fc.invalid || null"
            [attr.aria-required]="field.required || null"
            [attr.aria-disabled]="fc.disabled || null"
            (blur)="fc.markAsTouched()"
            [cdkTextareaAutosize]="!field.isResizable"
            [cdkAutosizeMinRows]="minRows"
            [cdkAutosizeMaxRows]="maxRows"
            [rows]="!field.autoResize && !field.isResizable ? minRows : minRows"
          ></textarea>
        </div>
      } @else {
        <input
          #inputRef
          matInput
          [id]="field.name"
          [type]="inputType"
          [formControl]="fc"
          [maxlength]="field.maxLength || null"
          [placeholder]="field.placeholder || '' | translate"
          [attr.pattern]="patternAttr"
          [attr.minlength]="field.minLength || null"
          [attr.maxlength]="field.maxLength || null"
          [attr.inputmode]="inputMode"
          [attr.autocomplete]="autoComplete"
          (blur)="fc.markAsTouched()"
          [attr.aria-label]="field.label | translate"
          [attr.aria-describedby]="ariaDescribedBy"
          [attr.aria-invalid]="fc.invalid || null"
          [attr.aria-required]="field.required || null"
          [attr.aria-disabled]="fc.disabled || null"
        />
      }

      @if (showVariablePicker) {
        <button
          mat-icon-button
          matSuffix
          type="button"
          class="variable-menu-button"
          [matMenuTriggerFor]="variablesMenu"
          [matTooltip]="field.variablePicker?.label || 'form.variables.insert' | translate"
          [attr.aria-label]="field.variablePicker?.label || 'form.variables.insert' | translate"
        >
          <mat-icon>data_object</mat-icon>
        </button>

        <mat-menu #variablesMenu="matMenu" class="field-variable-menu">
          @for (option of variableOptions; track option.token) {
            <button
              mat-menu-item
              type="button"
              class="variable-menu-item"
              [matTooltip]="variableTooltip(option)"
              matTooltipPosition="left"
              (click)="insertVariable(option)"
            >
              <span class="variable-name">{{ option.name || option.key }}</span>
              <span class="variable-token">{{ option.token }}</span>
              <span class="variable-meta"
                >{{ option.scope }}
                @if (option.category) {
                  / {{ option.category }}
                }
              </span>
            </button>
          }
        </mat-menu>
      }

      <!-- Hint (left) -->
      @if (field.helperText && !showError) {
        <mat-hint [id]="hintId">
          {{ field.helperText | translate: { max: field.maxLength } }}
        </mat-hint>
      }

      <!-- Counter (right) -->
      @if (field.showCounter && field.maxLength) {
        <mat-hint align="end"> {{ charCount }} / {{ field.maxLength }} </mat-hint>
      }

      @if (showError) {
        <mat-error [id]="errorId" role="alert" aria-live="polite">
          {{ errorText }}
        </mat-error>
      }
    </mat-form-field>

    @if (visibleVariableTags.length) {
      <div class="variable-tags-preview" [attr.aria-label]="'form.variables.detected' | translate">
        @for (option of visibleVariableTags; track option.token) {
          <span
            class="variable-tag"
            [class.secret]="option.isSecret"
            [class.unknown]="option.id === '__unknown__'"
            [matTooltip]="variableTooltip(option)"
            matTooltipPosition="above"
          >
            <mat-icon aria-hidden="true">sell</mat-icon>
            {{ option.token }}
          </span>
        }
      </div>
    }
  `,
  styleUrls: ['./text-field.component.scss'],
})
export class TextFieldComponent {
  @Input({ required: true }) field!: FieldConfig;
  @Input({ required: true }) control!: AbstractControl<string>;
  @ViewChild('textareaRef') textareaRef?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('inputRef') inputRef?: ElementRef<HTMLInputElement>;

  private isResizing = false;
  private startY = 0;
  private startHeight = 0;

  constructor(private t: TranslateService) {}

  get isTextarea() {
    return this.field.type === 'textarea';
  }

  // textarea sizing
  get minRows() {
    return this.field.rows ?? 3;
  }
  get maxRows() {
    return this.field.maxRows ?? (this.field.autoResize ? 8 : this.minRows);
  }

  // Min/max height in pixels for resizable mode
  get minHeight() {
    return this.minRows * 24; // Approximate line height
  }
  get maxHeight() {
    return this.maxRows * 24;
  }

  onResizeStart(event: MouseEvent | TouchEvent) {
    if (!this.textareaRef) return;

    event.preventDefault();
    this.isResizing = true;

    const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;
    this.startY = clientY;
    this.startHeight = this.textareaRef.nativeElement.offsetHeight;

    const onMove = (e: MouseEvent | TouchEvent) => this.onResizeMove(e);
    const onEnd = () => this.onResizeEnd(onMove, onEnd);

    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchend', onEnd);
  }

  private onResizeMove(event: MouseEvent | TouchEvent) {
    if (!this.isResizing || !this.textareaRef) return;

    const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;
    const deltaY = clientY - this.startY;
    // Invert deltaY: dragging down increases height, dragging up decreases
    const newHeight = Math.max(this.minHeight, Math.min(this.maxHeight, this.startHeight + deltaY));

    this.textareaRef.nativeElement.style.height = `${newHeight}px`;
    this.textareaRef.nativeElement.style.minHeight = `${newHeight}px`;
    this.textareaRef.nativeElement.style.maxHeight = `${newHeight}px`;
  }

  private onResizeEnd(onMove: (e: MouseEvent | TouchEvent) => void, onEnd: () => void) {
    this.isResizing = false;
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('mouseup', onEnd);
    document.removeEventListener('touchend', onEnd);
  }

  // ---- input attributes (single line only) ----
  get inputType(): string {
    switch (this.field.type) {
      case 'email':
        return 'email';
      case 'password':
        return 'password';
      case 'phone':
        return 'tel';
      default:
        return 'text';
    }
  }
  get inputMode(): string | null {
    switch (this.field.type) {
      case 'email':
        return 'email';
      case 'phone':
        return 'numeric';
      default:
        return null;
    }
  }
  get autoComplete(): string | null {
    switch (this.field.type) {
      case 'email':
        return 'email';
      case 'password':
        return 'new-password';
      case 'phone':
        return 'tel';
      default:
        return 'on';
    }
  }
  get patternAttr(): string | null {
    const textTypes = ['text', 'email', 'password', 'phone', 'autocomplete'];
    return textTypes.includes(this.field.type) && this.field.pattern ? this.field.pattern : null;
  }

  get variableOptions(): FieldVariableOption[] {
    const picker = this.field.variablePicker;
    if (!picker || picker.enabled === false) return [];
    return picker.options ?? [];
  }

  get showVariablePicker(): boolean {
    return this.variableOptions.length > 0 && !this.fc.disabled;
  }

  get visibleVariableTags(): FieldVariableOption[] {
    const value = `${this.fc.value ?? ''}`;
    const tokens = Array.from(new Set(value.match(/\{\{\s*[\w.-]+\.[\w.-]+\s*\}\}/g) ?? []));
    if (!tokens.length) return [];

    const byToken = new Map(this.variableOptions.map((option) => [option.token, option]));
    return tokens.map(
      (token) =>
        byToken.get(token) ?? {
          id: '__unknown__',
          key: token.replace(/[{}]/g, '').trim(),
          token,
          scope: token.replace(/[{}]/g, '').trim().split('.')[0] || 'unknown',
          name: token,
          description: 'Unresolved variable token',
        },
    );
  }

  insertVariable(option: FieldVariableOption): void {
    const element = this.isTextarea
      ? this.textareaRef?.nativeElement
      : this.inputRef?.nativeElement;
    const currentValue = `${this.fc.value ?? ''}`;
    const token = option.token;
    const start = element?.selectionStart ?? currentValue.length;
    const end = element?.selectionEnd ?? start;
    const nextValue = `${currentValue.slice(0, start)}${token}${currentValue.slice(end)}`;

    this.fc.setValue(nextValue);
    this.fc.markAsDirty();
    this.fc.markAsTouched();

    requestAnimationFrame(() => {
      element?.focus();
      const nextPosition = start + token.length;
      element?.setSelectionRange(nextPosition, nextPosition);
    });
  }

  variableTooltip(option: FieldVariableOption): string {
    const preview = option.previewMaskedValue || option.previewValue || '';
    const parts = [
      option.description,
      `${option.scope}${option.category ? ` / ${option.category}` : ''}`,
      preview ? `Preview: ${preview}` : '',
      option.isSecret ? 'Secret' : '',
    ];
    return parts.filter(Boolean).join('\n');
  }

  // ---- ARIA helpers ----
  get showError(): boolean {
    return !!(this.fc?.touched && this.fc?.invalid);
  }
  get hintId() {
    return `${this.field.name}-hint`;
  }
  get errorId() {
    return `${this.field.name}-error`;
  }
  get ariaDescribedBy(): string | null {
    if (this.showError) return this.errorId;
    if (this.field.helperText) return this.hintId;
    return null;
  }

  get charCount(): number {
    const v = this.fc?.value as unknown;
    return typeof v === 'string' ? v.length : Array.isArray(v) ? v.length : 0;
  }

  // ---- error text with interpolation + fallbacks ----
  get errorText(): string {
    const errs = this.fc?.errors ?? {};
    if (!errs || !Object.keys(errs).length) return '';

    const order = ['required', 'minlength', 'maxlength', 'invalidChars', 'pattern'];
    const key = order.find((k) => k in errs) || Object.keys(errs)[0];

    const override = this.field.errorMessages?.[key];
    const fallback = `form.errors.${this.field.name}.${key}`;
    const i18nKey = override ?? fallback;

    return this.t.instant(i18nKey, this.paramsFor(key, errs[key]));
  }

  private paramsFor(key: string, val: ValidationErrors[keyof ValidationErrors]): ValidationErrors {
    switch (key) {
      case 'minlength':
      case 'maxlength':
        return { requiredLength: val?.requiredLength, actualLength: val?.actualLength };
      case 'pattern':
        return { text: this.fc?.value ?? '' };
      case 'invalidChars':
        return { char: val?.char ?? '' };
      default:
        return {};
    }
  }

  get fc(): FormControl {
    return this.control as FormControl;
  }
}
