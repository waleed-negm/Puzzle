import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Order, PaginatedResult } from '../../../core/models';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    TableModule,
    ButtonModule,
    TagModule,
    ToolbarModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <p-toast />

    <div class="card">
      <p-toolbar>
        <ng-template #start>
          <h2 class="m-0">{{ 'ORDERS.TITLE' | translate }}</h2>
        </ng-template>
        <ng-template #end>
          <div class="flex gap-2 align-items-center">
            <p-iconfield>
              <p-inputicon styleClass="pi pi-search" />
              <input
                pInputText
                type="text"
                [placeholder]="'COMMON.SEARCH' | translate"
                (input)="onSearch($event)"
              />
            </p-iconfield>
            <p-button
              [label]="'ORDERS.NEW_ORDER' | translate"
              icon="pi pi-plus"
              (onClick)="createOrder()"
            />
          </div>
        </ng-template>
      </p-toolbar>

      <p-table
        [value]="orders"
        [loading]="loading"
        [rowHover]="true"
        [lazy]="true"
        [paginator]="true"
        [rows]="pageSize"
        [totalRecords]="totalRecords"
        [showCurrentPageReport]="true"
        [currentPageReportTemplate]="'COMMON.PAGE_REPORT' | translate"
        (onLazyLoad)="onLazyLoad($event)"
        selectionMode="single"
        (onRowSelect)="onRowSelect($event)"
      >
        <ng-template #header>
          <tr>
            <th>{{ 'ORDERS.ORDER_NUMBER' | translate }}</th>
            <th>{{ 'ORDERS.CLIENT' | translate }}</th>
            <th>{{ 'ORDERS.DATE' | translate }}</th>
            <th>{{ 'ORDERS.STATUS' | translate }}</th>
            <th>{{ 'ORDERS.TOTAL' | translate }}</th>
            <th>{{ 'ORDERS.PAID' | translate }}</th>
            <th>{{ 'ORDERS.REMAINING' | translate }}</th>
            <th style="width: 100px">{{ 'COMMON.ACTIONS' | translate }}</th>
          </tr>
        </ng-template>
        <ng-template #body let-order>
          <tr class="cursor-pointer" (click)="viewOrder(order)">
            <td>{{ order.orderNumber }}</td>
            <td>{{ order.clientName || '-' }}</td>
            <td>{{ order.orderDate | date:'short' }}</td>
            <td>
              <p-tag [value]="order.status" [severity]="getStatusSeverity(order.status)" />
            </td>
            <td>{{ order.total | number:'1.2-2' }}</td>
            <td>{{ order.paidAmount | number:'1.2-2' }}</td>
            <td>{{ order.remaining | number:'1.2-2' }}</td>
            <td>
              <p-button
                icon="pi pi-eye"
                [rounded]="true"
                [text]="true"
                severity="info"
                (onClick)="viewOrder(order); $event.stopPropagation()"
              />
            </td>
          </tr>
        </ng-template>
        <ng-template #emptymessage>
          <tr>
            <td colspan="8" class="text-center">
              {{ 'COMMON.NO_DATA' | translate }}
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      padding: 1rem;
    }
    .card {
      background: var(--surface-card);
      border-radius: 10px;
      padding: 1.5rem;
    }
  `]
})
export class OrderList implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  orders: Order[] = [];
  loading = false;
  totalRecords = 0;
  page = 1;
  pageSize = 10;
  searchTerm = '';

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    let params = new HttpParams()
      .set('page', this.page.toString())
      .set('pageSize', this.pageSize.toString());

    if (this.searchTerm) {
      params = params.set('search', this.searchTerm);
    }

    this.http.get<PaginatedResult<Order>>('/api/orders', { params }).subscribe({
      next: (data) => {
        this.orders = data.items;
        this.totalRecords = data.totalCount;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onLazyLoad(event: any): void {
    this.page = Math.floor((event.first || 0) / this.pageSize) + 1;
    this.pageSize = event.rows || 10;
    this.loadOrders();
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.page = 1;
    this.loadOrders();
  }

  onRowSelect(event: any): void {
    this.viewOrder(event.data);
  }

  createOrder(): void {
    this.router.navigate(['/orders/new']);
  }

  viewOrder(order: Order): void {
    this.router.navigate(['/orders', order.id]);
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (status) {
      case 'Pending': return 'warn';
      case 'Confirmed': return 'info';
      case 'Delivered': return 'success';
      case 'Cancelled': return 'danger';
      case 'PartialReturn': return 'warn';
      case 'FullReturn': return 'danger';
      default: return 'secondary';
    }
  }
}
