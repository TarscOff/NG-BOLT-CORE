import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Inject,
  inject,
  OnInit,
  Optional,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { combineLatest } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith, switchMap } from 'rxjs/operators';

import { QuickSettingsField } from '@cadai/pxs-ng-core/enums';
import { FieldConfig, Lang } from '@cadai/pxs-ng-core/interfaces';
import { AppActions, AppSelectors } from '@cadai/pxs-ng-core/store';

import { SelectComponent } from '../forms/fields/select/select.component';
import { ToggleComponent } from '../forms/fields/toggle/toggle.component';

const VarSel = AppSelectors.AiVariantsSelectors;

@Component({
  selector: 'app-quick-settings',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    SelectComponent,
    ToggleComponent,
  ],
  templateUrl: './quick-settings.component.html',
  styleUrl: './quick-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class QuickSettingsComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);
  readonly dialogRef = inject(MatDialogRef<QuickSettingsComponent>);
  public readonly QuickSettingsField = QuickSettingsField;

  // ── Theme ────────────────────────────────────────────────────
  themeField: FieldConfig = {
    name: 'themeSwitcher',
    label: 'form.labels.themeSwitcher',
    type: 'toggle',
    toggleIcons: { on: 'dark_mode', off: 'light_mode', position: 'start' },
    color: 'primary',
    layoutClass: 'primary',
  };
  themeControl!: FormControl<boolean>;

  // ── Language ─────────────────────────────────────────────────
  // TODO: replace hardcoded options with CORE_OPTIONS.languages
  langField: FieldConfig = {
    name: 'language',
    label: 'form.labels.language',
    type: 'dropdown',
    options: [
      { label: 'English', value: 'en' },
      { label: 'Français', value: 'fr' },
    ],
    color: 'primary',
    layoutClass: 'primary',
  };
  langControl!: FormControl<string>;

  // ── AI Variants ──────────────────────────────────────────────
  aiScopeField: FieldConfig = {
    name: 'aiScope',
    label: 'ai.scope',
    type: 'dropdown',
    options: [],
    color: 'primary',
    layoutClass: 'primary',
  };
  aiScopeControl!: FormControl<string>;

  aiKeyField: FieldConfig = {
    name: 'aiKey',
    label: 'ai.variant',
    type: 'dropdown',
    options: [],
    color: 'primary',
    layoutClass: 'primary',
  };
  aiKeyControl!: FormControl<string>;

  aiValueField: FieldConfig = {
    name: 'aiValue',
    label: 'ai.value',
    type: 'dropdown',
    options: [],
    color: 'primary',
    layoutClass: 'primary',
  };
  aiValueControl!: FormControl<string>;

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: { fields?: QuickSettingsField[] },
  ) {}

  ngOnInit(): void {
    // ── Theme ──────────────────────────────────────────────────
    this.themeControl = new FormControl<boolean>(false, { nonNullable: true });

    this.store
      .select(AppSelectors.ThemeSelectors.selectIsDark)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((isDark) => {
        if (this.themeControl.value !== isDark) {
          this.themeControl.setValue(isDark, { emitEvent: false });
        }
      });

    this.themeControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((isDark) => {
      this.store.dispatch(AppActions.ThemeActions.setTheme({ mode: isDark ? 'dark' : 'light' }));
    });

    // ── Language ────────────────────────────────────────────────
    this.langControl = new FormControl<string>('', { nonNullable: true });

    this.store
      .select(AppSelectors.LangSelectors.selectLang)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((lang: Lang | null): lang is Lang => !!lang),
        distinctUntilChanged(),
      )
      .subscribe((lang) => {
        if (this.langControl.value !== lang) {
          this.langControl.setValue(lang, { emitEvent: false });
        }
      });

    this.langControl.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        distinctUntilChanged(),
        filter((lang): lang is Lang => !!lang),
      )
      .subscribe((lang) => {
        this.store.dispatch(AppActions.LangActions.setLang({ lang }));
        this.translate.use(lang);
      });

    // ── AI Variants ─────────────────────────────────────────────
    this.aiScopeControl = new FormControl<string>('', { nonNullable: true });
    this.aiKeyControl = new FormControl<string>('ai.provider', { nonNullable: true });
    this.aiValueControl = new FormControl<string>('', { nonNullable: true });

    const setKeyLabels = () => {
      this.aiKeyField.options = [
        { label: this.translate.instant('ai.provider') || 'ai.provider', value: 'ai.provider' },
        { label: this.translate.instant('ai.model') || 'ai.model', value: 'ai.model' },
      ];
    };
    setKeyLabels();
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => setKeyLabels());

    this.store
      .select(VarSel.selectFeatureVariants)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((featuresMap) => {
        const scopes = Object.entries(featuresMap)
          .filter(([k, rec]) => k !== '' && !!(rec as any)['__ai.modelsByProvider'])
          .map(([k]) => k);

        this.aiScopeField.options = scopes.map((k) => ({
          label: this.translate.instant(k) || k,
          value: k,
        }));

        const current = this.aiScopeControl.value;
        const next = scopes.includes(current) ? current : (scopes[0] ?? '');
        if (next !== current) this.aiScopeControl.setValue(next, { emitEvent: !!next });
      });

    const scope$ = this.aiScopeControl.valueChanges.pipe(
      startWith(this.aiScopeControl.value),
      distinctUntilChanged(),
    );

    const providers$ = scope$.pipe(
      switchMap((scope) => this.store.select(VarSel.selectFeatureRecord(scope || ''))),
      map((rec) => (rec['__ai.providers'] as string[] | undefined) ?? []),
    );

    const modelsByProvider$ = scope$.pipe(
      switchMap((scope) => this.store.select(VarSel.selectModelsByProvider(scope || ''))),
    );

    const selectedProvider$ = scope$.pipe(
      switchMap((scope) => this.store.select(VarSel.selectProviderInFeature(scope || ''))),
    );

    const selectedModel$ = scope$.pipe(
      switchMap((scope) => this.store.select(VarSel.selectModelInFeature(scope || ''))),
    );

    const key$ = this.aiKeyControl.valueChanges.pipe(
      startWith(this.aiKeyControl.value),
      distinctUntilChanged(),
    );

    combineLatest([
      key$,
      providers$,
      selectedProvider$.pipe(startWith<string | undefined>(undefined)),
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([key, providers, selProvider]) => {
        if (key !== 'ai.provider') return;
        this.aiValueField.options = providers.map((p) => ({ label: p, value: p }));
        const next = selProvider && providers.includes(selProvider) ? selProvider : '';
        if (this.aiValueControl.value !== next) {
          this.aiValueControl.setValue(next, { emitEvent: false });
        }
      });

    combineLatest([
      key$,
      modelsByProvider$,
      selectedProvider$.pipe(startWith<string | undefined>(undefined)),
      selectedModel$.pipe(startWith<string | undefined>(undefined)),
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([key, byProv, selProvider, selModel]) => {
        if (key !== 'ai.model') return;
        const models = selProvider ? (byProv[selProvider] ?? []) : [];
        this.aiValueField.options = models.map((m) => ({ label: m, value: m }));
        const next = selModel && models.includes(selModel) ? selModel : '';
        if (this.aiValueControl.value !== next) {
          this.aiValueControl.setValue(next, { emitEvent: false });
        }
      });

    this.aiValueControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        const scope = this.aiScopeControl.value;
        const key = this.aiKeyControl.value;
        if (!scope || !key) return;
        this.store.dispatch(
          AppActions.AiVariantsActions.setVariant({ featureKey: scope, path: key, value }),
        );
      });
  }

  showField(field: QuickSettingsField): boolean {
    // If no data.fields provided, show all
    return !this.data?.fields || this.data.fields.includes(field);
  }
}
