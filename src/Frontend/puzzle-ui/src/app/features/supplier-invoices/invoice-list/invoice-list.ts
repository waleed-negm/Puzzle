import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SupplierInvoice, Supplier, PaginatedResult } from '../../../core/models';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    TableModule,
    ButtonModule,
    ToolbarModule,
    SelectModule,
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
          <h2 class="m-0">{{ 'INVOICES.TITLE' | translate }}</h2>
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
            <p-select
              [options]="suppliers"
              optionLabel="name"
              optionValue="id"
              [placeholder]="'INVOICES.FILTER_SUPPLIER' | translate"
              [showClear]="true"
              (onChange)="onSupplierFilter($event.value)"
              [style]="{ minWidth: '200px' }"
            />
            <p-button
              [label]="'INVOICES.NEW_INVOICE' | translate"
              icon="pi pi-plus"
              (onClick)="createInvoice()"
            />
          </div>
        </ng-template>
      </p-toolbar>

      <p-table
        [value]="invoices"
        [loading]="loading"
        [rowHover]="true"
        [lazy]="true"
        [paginator]="true"
        [rows]="pageSize"
        [totalRecords]="totalRecords"
        [showCurrentPageReport]="true"
        [currentPageReportTemplate]="'COMMON.PAGE_REPORT' | translate"
        (onLazyLoad)="onLazyLoad($event)"
      >
        <ng-template #header>
          <tr>
            <th>{{ 'INVOICES.INVOICE_NUMBER' | translate }}</th>
            <th>{{ 'INVOICES.SUPPLIER' | translate }}</th>
            <th>{{ 'INVOICES.DATE' | translate }}</th>
            <th>{{ 'INVOICES.TOTAL' | translate }}</th>
            <th>{{ 'INVOICES.PAID' | translate }}</th>
            <th>{{ 'INVOICES.REMAINING' | translate }}</th>
            <th style="width: 100px">{{ 'COMMON.ACTIONS' | translate }}</th>
          </tr>
        </ng-template>
        <ng-template #body let-invoice>
          <tr class="cursor-pointer" (click)="viewInvoice(invoice)">
            <td>{{ invoice.invoiceNumber }}</td>
            <td>{{ invoice.supplierName }}</td>
            <td>{{ invoice.invoiceDate | date:'short' }}</td>
            <td>{{ invoice.total | number:'1.2-2' }}</td>
            <td>{{ invoice.paidAmount | number:'1.2-2' }}</td>
            <td>{{ invoice.remaining | number:'1.2-2' }}</td>
            <td>
              <p-button
                icon="pi pi-eye"
                [rounded]="true"
                [text]="true"
                severity="info"
                (onClick)="viewInvoice(invoice); $event.stopPropagation()"
              />
            </td>
          </tr>
        </ng-template>
        <ng-template #emptymessage>
          <tr>
            <td colspan="7" class="text-center">
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
export class InvoiceList implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  invoices: SupplierInvoice[] = [];
  suppliers: Supplier[] = [];
  loading = false;
  totalRecords = 0;
  page = 1;
  pageSize = 10;
  searchTerm = '';
  supplierFilter: number | null = null;

  ngOnInit(): void {
    this.loadSuppliers();
    this.loadInvoices();
  }

  loadSuppliers(): void {
    this.http.get<Supplier[]>('/api/suppliers').subscribe({
      next: (data) => {
        this.suppliers = data;
      }
    });
  }

  loadInvoices(): void {
    this.loading = true;
    let params = new HttpParams()
      .set('page', this.page.toString())
      .set('pageSize', this.pageSize.toString());

    if (this.searchTerm) {
      params = params.set('search', this.searchTerm);
    }
    if (this.supplierFilter) {
      params = params.set('supplierId', this.supplierFilter.toString());
    }

    this.http.get<PaginatedResult<SupplierInvoice>>('/api/supplier-invoices', { params }).subscribe({
      next: (data) => {
        this.invoices = data.items;
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
    this.loadInvoices();
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.page = 1;
    this.loadInvoices();
  }

  onSupplierFilter(supplierId: number | null): void {
    this.supplierFilter = supplierId;
    this.page = 1;
    this.loadInvoices();
  }

  createInvoice(): void {
    this.router.navigate(['/supplier-invoices/new']);
  }

  viewInvoice(invoice: SupplierInvoice): void {
    this.router.navigate(['/supplier-invoices', invoice.id]);
  }
}
