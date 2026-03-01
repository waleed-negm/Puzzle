import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { Card } from 'primeng/card';
import { Table, TableModule } from 'primeng/table';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { DashboardDto, RecentOrderDto } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    Card,
    TableModule,
    PageHeaderComponent,
    CurrencyFormatPipe
  ],
  template: `
    <app-page-header [title]="'dashboard.title'" />

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      <p-card styleClass="shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
            <i class="pi pi-box text-blue-600 text-2xl"></i>
          </div>
          <div>
            <p class="text-sm text-color-secondary m-0">
              {{ 'dashboard.totalProducts' | translate }}
            </p>
            <p class="text-2xl font-bold m-0">{{ dashboard()?.totalProducts ?? 0 }}</p>
          </div>
        </div>
      </p-card>

      <p-card styleClass="shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
            <i class="pi pi-shopping-cart text-green-600 text-2xl"></i>
          </div>
          <div>
            <p class="text-sm text-color-secondary m-0">
              {{ 'dashboard.totalOrders' | translate }}
            </p>
            <p class="text-2xl font-bold m-0">{{ dashboard()?.totalOrders ?? 0 }}</p>
          </div>
        </div>
      </p-card>

      <p-card styleClass="shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100">
            <i class="pi pi-user text-orange-600 text-2xl"></i>
          </div>
          <div>
            <p class="text-sm text-color-secondary m-0">
              {{ 'dashboard.totalClients' | translate }}
            </p>
            <p class="text-2xl font-bold m-0">{{ dashboard()?.totalClients ?? 0 }}</p>
          </div>
        </div>
      </p-card>

      <p-card styleClass="shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100">
            <i class="pi pi-truck text-purple-600 text-2xl"></i>
          </div>
          <div>
            <p class="text-sm text-color-secondary m-0">
              {{ 'dashboard.totalSuppliers' | translate }}
            </p>
            <p class="text-2xl font-bold m-0">{{ dashboard()?.totalSuppliers ?? 0 }}</p>
          </div>
        </div>
      </p-card>
    </div>

    <!-- Today's Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <p-card styleClass="shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center w-12 h-12 rounded-full bg-teal-100">
            <i class="pi pi-calendar text-teal-600 text-2xl"></i>
          </div>
          <div>
            <p class="text-sm text-color-secondary m-0">
              {{ 'dashboard.todayOrders' | translate }}
            </p>
            <p class="text-2xl font-bold m-0">{{ dashboard()?.todayOrders ?? 0 }}</p>
          </div>
        </div>
      </p-card>

      <p-card styleClass="shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center w-12 h-12 rounded-full bg-pink-100">
            <i class="pi pi-wallet text-pink-600 text-2xl"></i>
          </div>
          <div>
            <p class="text-sm text-color-secondary m-0">
              {{ 'dashboard.todaySales' | translate }}
            </p>
            <p class="text-2xl font-bold m-0">{{ dashboard()?.todaySales ?? 0 | currencyFormat }}</p>
          </div>
        </div>
      </p-card>
    </div>

    <!-- Recent Orders Table -->
    <p-card styleClass="shadow-sm">
      <ng-template #header>
        <div class="p-4 pb-0">
          <h3 class="text-lg font-semibold m-0">
            {{ 'dashboard.recentOrders' | translate }}
          </h3>
        </div>
      </ng-template>

      <p-table
        [value]="dashboard()?.recentOrders ?? []"
        [rows]="10"
        styleClass="p-datatable-sm"
      >
        <ng-template #header>
          <tr>
            <th>{{ 'orders.orderNumber' | translate }}</th>
            <th>{{ 'orders.client' | translate }}</th>
            <th>{{ 'common.total' | translate }}</th>
            <th>{{ 'common.status' | translate }}</th>
            <th>{{ 'common.date' | translate }}</th>
          </tr>
        </ng-template>
        <ng-template #body let-order>
          <tr>
            <td>{{ order.orderNumber }}</td>
            <td>{{ order.clientName }}</td>
            <td>{{ order.totalAmount | currencyFormat }}</td>
            <td>
              <span
                class="px-2 py-1 rounded-full text-xs font-medium"
                [ngClass]="{
                  'bg-yellow-100 text-yellow-800': order.status === 'pending',
                  'bg-blue-100 text-blue-800': order.status === 'confirmed',
                  'bg-green-100 text-green-800': order.status === 'delivered',
                  'bg-red-100 text-red-800': order.status === 'cancelled'
                }"
              >
                {{ 'orders.' + order.status | translate }}
              </span>
            </td>
            <td>{{ order.orderDate | date: 'shortDate' }}</td>
          </tr>
        </ng-template>
        <ng-template #emptymessage>
          <tr>
            <td colspan="5" class="text-center p-4">
              {{ 'common.noData' | translate }}
            </td>
          </tr>
        </ng-template>
      </p-table>
    </p-card>
  `,
  styles: `
    :host {
      display: block;
    }
  `
})
export class Dashboard implements OnInit {
  private readonly http = inject(HttpClient);

  dashboard = signal<DashboardDto | null>(null);
  loading = signal(false);

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.loading.set(true);
    this.http.get<DashboardDto>('/api/dashboard').subscribe({
      next: (data) => {
        this.dashboard.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
