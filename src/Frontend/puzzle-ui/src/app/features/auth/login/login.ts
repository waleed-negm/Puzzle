import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    Card,
    InputText,
    Password,
    Button,
    Message
  ],
  template: `
    <div class="login-wrapper flex items-center justify-center min-h-screen">
      <p-card styleClass="login-card w-full" [style]="{'max-width': '400px'}">
        <div class="flex flex-col items-center gap-4 mb-6">
          <img
            src="/assets/images/logo.png"
            alt="Puzzle Stationery"
            class="login-logo"
            (error)="logoError = true"
            [style.display]="logoError ? 'none' : 'block'"
          />
          <h2 class="text-2xl font-bold text-center m-0">
            {{ 'app.title' | translate }}
          </h2>
          <p class="text-sm text-color-secondary m-0">
            {{ 'auth.login' | translate }}
          </p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <label for="username" class="font-medium">
              {{ 'auth.username' | translate }}
            </label>
            <input
              pInputText
              id="username"
              formControlName="username"
              [placeholder]="'auth.username' | translate"
              class="w-full"
              autocomplete="username"
            />
            <small
              class="text-red-500"
              *ngIf="loginForm.get('username')?.touched && loginForm.get('username')?.hasError('required')"
            >
              {{ 'common.required' | translate }}
            </small>
          </div>

          <div class="flex flex-col gap-2">
            <label for="password" class="font-medium">
              {{ 'auth.password' | translate }}
            </label>
            <p-password
              id="password"
              formControlName="password"
              [placeholder]="'auth.password' | translate"
              [toggleMask]="true"
              [feedback]="false"
              styleClass="w-full"
              inputStyleClass="w-full"
              autocomplete="current-password"
            />
            <small
              class="text-red-500"
              *ngIf="loginForm.get('password')?.touched && loginForm.get('password')?.hasError('required')"
            >
              {{ 'common.required' | translate }}
            </small>
          </div>

          @if (errorMessage()) {
            <p-message severity="error" [text]="errorMessage()" styleClass="w-full" />
          }

          <p-button
            type="submit"
            [label]="'auth.login' | translate"
            icon="pi pi-sign-in"
            styleClass="w-full"
            [loading]="loading()"
            [disabled]="loginForm.invalid || loading()"
          />
        </form>
      </p-card>
    </div>
  `,
  styles: `
    .login-wrapper {
      background-color: var(--p-surface-ground);
      padding: 1rem;
    }

    .login-logo {
      max-width: 200px;
      max-height: 80px;
      object-fit: contain;
    }

    :host ::ng-deep .login-card {
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    }
  `
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  loading = signal(false);
  errorMessage = signal('');
  logoError = false;

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const { username, password } = this.loginForm.value;

    this.authService.login(username!, password!).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('auth.invalidCredentials');
      }
    });
  }
}
