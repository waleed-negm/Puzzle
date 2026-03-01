import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, TranslateModule, Button],
  template: `
    <header class="topbar surface-card flex items-center px-4 shadow-sm">
      <h1 class="text-lg font-semibold m-0">
        {{ 'app.title' | translate }}
      </h1>

      <div class="flex-1"></div>

      <div class="flex items-center gap-3">
        <p-button
          [icon]="'pi pi-globe'"
          [rounded]="true"
          [text]="true"
          severity="secondary"
          (onClick)="onSwitchLanguage()"
          [title]="'common.language' | translate"
        />

        <span class="text-sm font-medium" *ngIf="currentUserName">
          {{ 'common.welcome' | translate }}, {{ currentUserName }}
        </span>

        <p-button
          [icon]="'pi pi-power-off'"
          [rounded]="true"
          [text]="true"
          severity="danger"
          (onClick)="onLogout()"
          [title]="'common.logout' | translate"
        />
      </div>
    </header>
  `,
  styles: `
    .topbar {
      height: 60px;
      border-block-end: 1px solid var(--p-surface-border);
      z-index: 100;
    }
  `
})
export class TopbarComponent {
  private readonly authService = inject(AuthService);
  private readonly languageService = inject(LanguageService);

  get currentUserName(): string {
    const user = this.authService.getCurrentUser();
    return user?.fullName || user?.unique_name || '';
  }

  onSwitchLanguage(): void {
    this.languageService.switchLanguage();
  }

  onLogout(): void {
    this.authService.logout();
  }
}
