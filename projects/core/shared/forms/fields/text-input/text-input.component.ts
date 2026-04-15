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
  selector: 'app-text-input',
  standalone: true,
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
    TranslateModule,
  ],
  template: `
    <mat-form-field
      appearance="outline"
      [class]="field.layoutClass?.concat(' w-full') || 'w-full'"
      floatLabel="always"
      [color]="field.color || 'primary'"
    >
      <mat-label>{{ field.label | translate }}</mat-label>

      <input
        #inputRef
        matInput
        [id]="field.name"
        [type]="inputType"
        [formControl]="fc"
        [placeholder]="field.placeholder ?? '' | translate"
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
      />

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

      @if (field.helperText && !showError) {
        <mat-hint [id]="hintId">
          {{ field.helperText | translate }}
        </mat-hint>
      }

      @if (showError) {
        <mat-error [id]="errorId" role="alert" aria-live="polite">
          {{ errorMessage }}
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
  styleUrls: ['./text-input.component.scss'],
})
export class TextInputComponent {
  @Input({ required: true }) field!: FieldConfig;
  @Input({ required: true }) control!: AbstractControl<string>;
  @ViewChild('inputRef') inputRef?: ElementRef<HTMLInputElement>;

  constructor(private t: TranslateService) {}

  // --- UI helpers ---
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

  get patternAttr() {
    const types = ['text', 'email', 'password', 'phone', 'autocomplete'];
    return types.includes(this.field.type) ? (this.field.pattern ?? null) : null;
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
    const input = this.inputRef?.nativeElement;
    const currentValue = `${this.fc.value ?? ''}`;
    const token = option.token;
    const start = input?.selectionStart ?? currentValue.length;
    const end = input?.selectionEnd ?? start;
    const nextValue = `${currentValue.slice(0, start)}${token}${currentValue.slice(end)}`;

    this.fc.setValue(nextValue);
    this.fc.markAsDirty();
    this.fc.markAsTouched();

    requestAnimationFrame(() => {
      input?.focus();
      const nextPosition = start + token.length;
      input?.setSelectionRange(nextPosition, nextPosition);
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
  // --- ARIA ids ---
  get hintId() {
    return `${this.field.name}-hint`;
  }
  get errorId() {
    return `${this.field.name}-error`;
  }

  get showError(): boolean {
    return !!(this.fc?.touched && this.fc?.invalid);
  }

  get ariaDescribedBy(): string | null {
    if (this.showError) return this.errorId;
    if (this.field.helperText) return this.hintId;
    return null;
  }

  // --- Error building with interpolation + fallbacks ---
  get errorMessage(): string {
    const errs = this.fc.errors ?? {};
    if (!errs || !Object.keys(errs).length) return '';

    // Common text-input priorities
    const order = [
      'required',
      'emailDomain',
      'emailTld',
      'email',
      'minlength',
      'maxlength',
      'pattern',
    ];
    const key = order.find((k) => k in errs) || Object.keys(errs)[0];

    // Allow per-field overrides (your configs already use full keys like "form.errors.input.required")
    const overrideKey = this.field.errorMessages?.[key];
    const fallbackKey = `form.errors.${this.field.name}.${key}`;
    const i18nKey = overrideKey ?? fallbackKey;

    const params = this.paramsFor(key, errs[key]);
    return this.t.instant(i18nKey, params);
  }

  private paramsFor(key: string, val: ValidationErrors[keyof ValidationErrors]): ValidationErrors {
    switch (key) {
      case 'minlength':
      case 'maxlength':
        return { requiredLength: val?.requiredLength, actualLength: val?.actualLength };
      case 'invalidChars':
        return { char: val?.char ?? '' };
      case 'pattern':
        return { text: this.fc?.value ?? '' };
      default:
        return {};
    }
  }

  get fc(): FormControl {
    return this.control as FormControl;
  }
}
