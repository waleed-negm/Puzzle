import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PanelMenu } from 'primeng/panelmenu';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, TranslateModule, PanelMenu],
  template: `
    <aside class="sidebar surface-card border-inline-end h-full">
      <div class="logo-container flex items-center justify-center p-4 border-b">
        <img
          src="/assets/images/logo.png"
          alt="Puzzle Stationery"
          class="logo-image"
          (error)="logoError = true"
          [style.display]="logoError ? 'none' : 'block'"
        />
        <span *ngIf="logoError" class="text-xl font-bold text-primary">
          {{ 'app.title' | translate }}
        </span>
      </div>
      <div class="menu-container p-2">
        <p-panelmenu [model]="menuItems" [multiple]="false" styleClass="w-full border-0" />
      </div>
    </aside>
  `,
  styles: `
    .sidebar {
      width: 280px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      border-inline-end: 1px solid var(--p-surface-border);
    }

    .logo-container {
      height: 60px;
      border-block-end: 1px solid var(--p-surface-border);
    }

    .logo-image {
      max-height: 40px;
      max-width: 200px;
      object-fit: contain;
    }

    .menu-container {
      flex: 1;
      overflow-y: auto;
    }

    :host ::ng-deep .p-panelmenu {
      .p-panelmenu-panel {
        margin-bottom: 0;
      }

      .p-panelmenu-header-link,
      .p-menuitem-link {
        border-radius: 8px;
      }
    }
  `
})
export class SidebarComponent implements OnInit, OnDestroy {
  private readonly translate = inject(TranslateService);
  private readonly authService = inject(AuthService);

  menuItems: MenuItem[] = [];
  logoError = false;

  private langChangeSub?: Subscription;

  ngOnInit(): void {
    this.buildMenuItems();
    this.langChangeSub = this.translate.onLangChange.subscribe(() => {
      this.buildMenuItems();
    });
  }

  ngOnDestroy(): void {
    this.langChangeSub?.unsubscribe();
  }

  private buildMenuItems(): void {
    const isAdmin = this.authService.getUserRole() === 'admin';

    this.menuItems = [
      {
        label: this.translate.instant('nav.dashboard'),
        icon: 'pi pi-home',
        routerLink: '/dashboard'
      },
      {
        label: this.translate.instant('nav.products'),
        icon: 'pi pi-box',
        routerLink: '/products'
      },
      {
        label: this.translate.instant('nav.categories'),
        icon: 'pi pi-tags',
        routerLink: '/categories'
      },
      ...(isAdmin
        ? [
            {
              label: this.translate.instant('nav.employees'),
              icon: 'pi pi-users',
              routerLink: '/employees'
            }
          ]
        : []),
      {
        label: this.translate.instant('nav.clients'),
        icon: 'pi pi-user',
        routerLink: '/clients'
      },
      {
        label: this.translate.instant('nav.orders'),
        icon: 'pi pi-shopping-cart',
        routerLink: '/orders'
      },
      {
        label: this.translate.instant('nav.suppliers'),
        icon: 'pi pi-truck',
        routerLink: '/suppliers'
      },
      {
        label: this.translate.instant('nav.supplierInvoices'),
        icon: 'pi pi-file',
        routerLink: '/supplier-invoices'
      }
    ];
  }
}
