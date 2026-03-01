import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { CardModule } from 'primeng/card';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { Client, Product, PaginatedResult } from '../../../core/models';

interface OrderItemRow {
  product: Product | null;
  quantity: number;
  unitPrice: number;
  total: number;
}

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    TextareaModule,
    CardModule,
    AutoCompleteModule,
    ToastModule,
    ToolbarModule,
    DividerModule
  ],
  providers: [MessageService],
  template: `
    <p-toast />

    <div class="p-4">
      <p-toolbar>
        <ng-template #start>
          <div class="flex items-center gap-2">
            <p-button
              icon="pi pi-arrow-left"
              [rounded]="true"
              [text]="true"
              (onClick)="goBack()"
            />
            <h2 class="m-0">{{ 'ORDERS.NEW_ORDER' | translate }}</h2>
          </div>
        </ng-template>
        <ng-template #end>
          <p-button
            [label]="'COMMON.SAVE' | translate"
            icon="pi pi-check"
            (onClick)="save()"
            [disabled]="!isValid()"
            [loading]="saving"
          />
        </ng-template>
      </p-toolbar>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <!-- Main Form -->
        <div class="lg:col-span-2">
          <p-card [header]="'ORDERS.ORDER_INFO' | translate">
            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-2">
                <label for="client">{{ 'ORDERS.CLIENT' | translate }}</label>
                <p-select
                  id="client"
                  [options]="clients"
                  optionLabel="name"
                  optionValue="id"
                  [placeholder]="'ORDERS.SELECT_CLIENT' | translate"
                  [showClear]="true"
                  [filter]="true"
                  filterBy="name"
                  [(ngModel)]="selectedClientId"
                  [style]="{ width: '100%' }"
                />
              </div>

              <div class="flex flex-col gap-2">
                <label for="notes">{{ 'ORDERS.NOTES' | translate }}</label>
                <textarea
                  pTextarea
                  id="notes"
                  [(ngModel)]="notes"
                  rows="2"
                ></textarea>
              </div>
            </div>
          </p-card>

          <!-- Items Section -->
          <p-card [header]="'ORDERS.ITEMS' | translate" class="mt-4">
            <div class="flex justify-end mb-3">
              <p-button
                [label]="'ORDERS.ADD_ITEM' | translate"
                icon="pi pi-plus"
                [outlined]="true"
                (onClick)="addItem()"
              />
            </div>

            <p-table [value]="items">
              <ng-template #header>
                <tr>
                  <th style="width: 35%">{{ 'ORDERS.PRODUCT' | translate }}</th>
                  <th style="width: 15%">{{ 'ORDERS.QUANTITY' | translate }}</th>
                  <th style="width: 20%">{{ 'ORDERS.UNIT_PRICE' | translate }}</th>
                  <th style="width: 20%">{{ 'ORDERS.ITEM_TOTAL' | translate }}</th>
                  <th style="width: 10%"></th>
                </tr>
              </ng-template>
              <ng-template #body let-item let-i="rowIndex">
                <tr>
                  <td>
                    <p-autocomplete
                      [(ngModel)]="item.product"
                      [suggestions]="productSuggestions"
                      (completeMethod)="searchProducts($event)"
                      field="name"
                      [placeholder]="'ORDERS.SEARCH_PRODUCT' | translate"
                      [dropdown]="true"
                      (onSelect)="onProductSelect(i)"
                      [style]="{ width: '100%' }"
                      [inputStyle]="{ width: '100%' }"
                    />
                  </td>
                  <td>
                    <p-inputnumber
                      [(ngModel)]="item.quantity"
                      [showButtons]="true"
                      [min]="1"
                      (onInput)="calculateItemTotal(i)"
                      [style]="{ width: '100%' }"
                    />
                  </td>
                  <td>
                    <p-inputnumber
                      [(ngModel)]="item.unitPrice"
                      mode="decimal"
                      [minFractionDigits]="2"
                      [maxFractionDigits]="2"
                      (onInput)="calculateItemTotal(i)"
                      [style]="{ width: '100%' }"
                    />
                  </td>
                  <td>
                    <span class="font-bold">{{ item.total | number:'1.2-2' }}</span>
                  </td>
                  <td>
                    <p-button
                      icon="pi pi-trash"
                      [rounded]="true"
                      [text]="true"
                      severity="danger"
                      (onClick)="removeItem(i)"
                    />
                  </td>
                </tr>
              </ng-template>
              <ng-template #emptymessage>
                <tr>
                  <td colspan="5" class="text-center text-gray-500 py-4">
                    {{ 'ORDERS.NO_ITEMS' | translate }}
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </p-card>
        </div>

        <!-- Summary Sidebar -->
        <div>
          <p-card [header]="'ORDERS.SUMMARY' | translate">
            <div class="flex flex-col gap-3">
              <div class="flex justify-between">
                <span>{{ 'ORDERS.SUBTOTAL' | translate }}</span>
                <span class="font-bold">{{ subTotal | number:'1.2-2' }}</span>
              </div>
              <p-divider />
              <div class="flex flex-col gap-2">
                <label for="discount">{{ 'ORDERS.DISCOUNT' | translate }}</label>
                <p-inputnumber
                  id="discount"
                  [(ngModel)]="discount"
                  mode="decimal"
                  [minFractionDigits]="2"
                  [maxFractionDigits]="2"
                  [min]="0"
                  (onInput)="calculateTotals()"
                  [style]="{ width: '100%' }"
                />
              </div>
              <p-divider />
              <div class="flex justify-between text-xl">
                <span class="font-bold">{{ 'ORDERS.TOTAL' | translate }}</span>
                <span class="font-bold text-primary">{{ total | number:'1.2-2' }}</span>
              </div>
            </div>
          </p-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class OrderForm implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  clients: Client[] = [];
  productSuggestions: Product[] = [];

  selectedClientId: number | null = null;
  notes = '';
  discount = 0;
  subTotal = 0;
  total = 0;
  saving = false;

  items: OrderItemRow[] = [];

  ngOnInit(): void {
    this.loadClients();
    this.addItem();
  }

  loadClients(): void {
    this.http.get<Client[]>('/api/clients').subscribe({
      next: (data) => {
        this.clients = data;
      }
    });
  }

  searchProducts(event: any): void {
    const query = event.query;
    const params = new HttpParams().set('search', query).set('page', '1').set('pageSize', '20');
    this.http.get<PaginatedResult<Product>>('/api/products', { params }).subscribe({
      next: (data) => {
        this.productSuggestions = data.items;
      }
    });
  }

  onProductSelect(index: number): void {
    const item = this.items[index];
    if (item.product) {
      item.unitPrice = item.product.price;
      item.quantity = item.quantity || 1;
      this.calculateItemTotal(index);
    }
  }

  addItem(): void {
    this.items.push({
      product: null,
      quantity: 1,
      unitPrice: 0,
      total: 0
    });
  }

  removeItem(index: number): void {
    this.items.splice(index, 1);
    this.calculateTotals();
  }

  calculateItemTotal(index: number): void {
    const item = this.items[index];
    item.total = (item.quantity || 0) * (item.unitPrice || 0);
    this.calculateTotals();
  }

  calculateTotals(): void {
    this.subTotal = this.items.reduce((sum, item) => sum + (item.total || 0), 0);
    this.total = this.subTotal - (this.discount || 0);
    if (this.total < 0) this.total = 0;
  }

  isValid(): boolean {
    return this.items.some(item => item.product !== null && item.quantity > 0);
  }

  save(): void {
    if (!this.isValid()) return;

    this.saving = true;
    const validItems = this.items.filter(item => item.product !== null);

    const payload = {
      clientId: this.selectedClientId,
      discount: this.discount || 0,
      notes: this.notes,
      items: validItems.map(item => ({
        productId: item.product!.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      }))
    };

    this.http.post<any>('/api/orders', payload).subscribe({
      next: (result) => {
        this.saving = false;
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Order created' });
        const orderId = result.id || result;
        this.router.navigate(['/orders', orderId]);
      },
      error: () => {
        this.saving = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create order' });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }
}
