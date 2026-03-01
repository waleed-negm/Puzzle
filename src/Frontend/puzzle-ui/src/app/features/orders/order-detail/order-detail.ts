import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { DividerModule } from 'primeng/divider';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { OrderDetail as OrderDetailDto, OrderItem, OrderPayment } from '../../../core/models';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputNumberModule,
    TextareaModule,
    SelectModule,
    CardModule,
    TagModule,
    CheckboxModule,
    ToastModule,
    ToolbarModule,
    DividerModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast />
    <p-confirmdialog />

    <div class="p-4" *ngIf="order">
      <!-- Header -->
      <p-toolbar>
        <ng-template #start>
          <div class="flex items-center gap-2">
            <p-button
              icon="pi pi-arrow-left"
              [rounded]="true"
              [text]="true"
              (onClick)="goBack()"
            />
            <h2 class="m-0">{{ 'ORDERS.ORDER' | translate }} #{{ order.orderNumber }}</h2>
            <p-tag [value]="order.status" [severity]="getStatusSeverity(order.status)" />
          </div>
        </ng-template>
        <ng-template #end>
          <div class="flex gap-2">
            <p-button
              [label]="'ORDERS.PRINT' | translate"
              icon="pi pi-print"
              [outlined]="true"
              (onClick)="printReceipt()"
            />
          </div>
        </ng-template>
      </p-toolbar>

      <!-- Order Info Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <p-card>
          <div class="text-center">
            <div class="text-sm text-gray-500">{{ 'ORDERS.DATE' | translate }}</div>
            <div class="font-bold mt-1">{{ order.orderDate | date:'short' }}</div>
          </div>
        </p-card>
        <p-card>
          <div class="text-center">
            <div class="text-sm text-gray-500">{{ 'ORDERS.CLIENT' | translate }}</div>
            <div class="font-bold mt-1">{{ order.clientName || '-' }}</div>
          </div>
        </p-card>
        <p-card>
          <div class="text-center">
            <div class="text-sm text-gray-500">{{ 'ORDERS.SUBTOTAL' | translate }}</div>
            <div class="font-bold mt-1">{{ order.subTotal | number:'1.2-2' }}</div>
          </div>
        </p-card>
        <p-card>
          <div class="text-center">
            <div class="text-sm text-gray-500">{{ 'ORDERS.DISCOUNT' | translate }}</div>
            <div class="font-bold mt-1">{{ order.discount | number:'1.2-2' }}</div>
          </div>
        </p-card>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        <p-card>
          <div class="text-center">
            <div class="text-sm text-gray-500">{{ 'ORDERS.TOTAL' | translate }}</div>
            <div class="text-xl font-bold text-primary mt-1">{{ order.total | number:'1.2-2' }}</div>
          </div>
        </p-card>
        <p-card>
          <div class="text-center">
            <div class="text-sm text-gray-500">{{ 'ORDERS.PAID' | translate }}</div>
            <div class="text-xl font-bold text-green-500 mt-1">{{ order.paidAmount | number:'1.2-2' }}</div>
          </div>
        </p-card>
        <p-card>
          <div class="text-center">
            <div class="text-sm text-gray-500">{{ 'ORDERS.REMAINING' | translate }}</div>
            <div class="text-xl font-bold mt-1" [class.text-red-500]="order.remaining > 0">
              {{ order.remaining | number:'1.2-2' }}
            </div>
          </div>
        </p-card>
      </div>

      <!-- Status Update -->
      <div class="mt-4" *ngIf="canUpdateStatus()">
        <p-card>
          <div class="flex items-center gap-3">
            <label class="font-bold">{{ 'ORDERS.UPDATE_STATUS' | translate }}</label>
            <p-select
              [options]="statusOptions"
              optionLabel="label"
              optionValue="value"
              [(ngModel)]="newStatus"
              [placeholder]="'ORDERS.SELECT_STATUS' | translate"
              [style]="{ minWidth: '200px' }"
            />
            <p-button
              [label]="'COMMON.UPDATE' | translate"
              icon="pi pi-check"
              (onClick)="updateStatus()"
              [disabled]="!newStatus"
            />
          </div>
        </p-card>
      </div>

      <!-- Items Table -->
      <p-card [header]="'ORDERS.ITEMS' | translate" class="mt-4">
        <div class="flex justify-end mb-3" *ngIf="canReturn()">
          <p-button
            [label]="'ORDERS.RETURN_ITEMS' | translate"
            icon="pi pi-undo"
            severity="warn"
            (onClick)="openReturnDialog()"
          />
        </div>
        <p-table [value]="order.items" [rowHover]="true">
          <ng-template #header>
            <tr>
              <th>{{ 'ORDERS.PRODUCT' | translate }}</th>
              <th>{{ 'ORDERS.QUANTITY' | translate }}</th>
              <th>{{ 'ORDERS.UNIT_PRICE' | translate }}</th>
              <th>{{ 'ORDERS.ITEM_TOTAL' | translate }}</th>
              <th>{{ 'ORDERS.RETURNED' | translate }}</th>
              <th>{{ 'ORDERS.RETURN_PRICE' | translate }}</th>
            </tr>
          </ng-template>
          <ng-template #body let-item>
            <tr>
              <td>{{ item.productName }}</td>
              <td>{{ item.quantity }}</td>
              <td>{{ item.unitPrice | number:'1.2-2' }}</td>
              <td>{{ item.total | number:'1.2-2' }}</td>
              <td>
                <p-tag
                  [value]="(item.isReturned ? 'COMMON.YES' : 'COMMON.NO') | translate"
                  [severity]="item.isReturned ? 'danger' : 'success'"
                />
              </td>
              <td>{{ item.returnPrice | number:'1.2-2' }}</td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>

      <!-- Payments Table -->
      <p-card [header]="'ORDERS.PAYMENTS' | translate" class="mt-4">
        <div class="flex justify-end mb-3">
          <p-button
            [label]="'ORDERS.ADD_PAYMENT' | translate"
            icon="pi pi-plus"
            (onClick)="openPaymentDialog()"
          />
        </div>
        <p-table [value]="order.payments" [rowHover]="true">
          <ng-template #header>
            <tr>
              <th>{{ 'PAYMENTS.AMOUNT' | translate }}</th>
              <th>{{ 'PAYMENTS.DATE' | translate }}</th>
              <th>{{ 'PAYMENTS.NOTES' | translate }}</th>
              <th style="width: 80px">{{ 'COMMON.ACTIONS' | translate }}</th>
            </tr>
          </ng-template>
          <ng-template #body let-payment>
            <tr>
              <td>{{ payment.amount | number:'1.2-2' }}</td>
              <td>{{ payment.paymentDate | date:'short' }}</td>
              <td>{{ payment.notes }}</td>
              <td>
                <p-button
                  icon="pi pi-trash"
                  [rounded]="true"
                  [text]="true"
                  severity="danger"
                  (onClick)="deletePayment(payment)"
                />
              </td>
            </tr>
          </ng-template>
          <ng-template #emptymessage>
            <tr>
              <td colspan="4" class="text-center">{{ 'COMMON.NO_DATA' | translate }}</td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>

      <!-- Notes -->
      <p-card [header]="'ORDERS.NOTES' | translate" class="mt-4" *ngIf="order.notes">
        <p>{{ order.notes }}</p>
      </p-card>
    </div>

    <!-- Add Payment Dialog -->
    <p-dialog
      [(visible)]="paymentDialogVisible"
      [header]="'ORDERS.ADD_PAYMENT' | translate"
      [modal]="true"
      [style]="{ width: '400px' }"
    >
      <form [formGroup]="paymentForm">
        <div class="flex flex-col gap-4 mt-4">
          <div class="flex flex-col gap-2">
            <label for="paymentAmount">{{ 'PAYMENTS.AMOUNT' | translate }}</label>
            <p-inputnumber
              id="paymentAmount"
              formControlName="amount"
              mode="decimal"
              [minFractionDigits]="2"
              [maxFractionDigits]="2"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label for="paymentNotes">{{ 'PAYMENTS.NOTES' | translate }}</label>
            <textarea pTextarea id="paymentNotes" formControlName="notes" rows="3"></textarea>
          </div>
        </div>
      </form>

      <ng-template #footer>
        <p-button
          [label]="'COMMON.CANCEL' | translate"
          icon="pi pi-times"
          [text]="true"
          (onClick)="paymentDialogVisible = false"
        />
        <p-button
          [label]="'COMMON.SAVE' | translate"
          icon="pi pi-check"
          (onClick)="savePayment()"
          [disabled]="paymentForm.invalid"
        />
      </ng-template>
    </p-dialog>

    <!-- Return Items Dialog -->
    <p-dialog
      [(visible)]="returnDialogVisible"
      [header]="'ORDERS.RETURN_ITEMS' | translate"
      [modal]="true"
      [style]="{ width: '500px' }"
    >
      <div class="flex flex-col gap-3 mt-4">
        <div *ngFor="let item of returnableItems; let i = index" class="flex items-center gap-3 p-2 border-b">
          <p-checkbox
            [(ngModel)]="item.selected"
            [binary]="true"
            [inputId]="'return-' + i"
          />
          <label [for]="'return-' + i" class="flex-1">
            {{ item.productName }} ({{ 'ORDERS.QUANTITY' | translate }}: {{ item.quantity }})
          </label>
        </div>
        <div *ngIf="returnableItems.length === 0" class="text-center text-gray-500 py-4">
          {{ 'ORDERS.NO_RETURNABLE_ITEMS' | translate }}
        </div>
      </div>

      <ng-template #footer>
        <p-button
          [label]="'COMMON.CANCEL' | translate"
          icon="pi pi-times"
          [text]="true"
          (onClick)="returnDialogVisible = false"
        />
        <p-button
          [label]="'ORDERS.CONFIRM_RETURN' | translate"
          icon="pi pi-check"
          severity="warn"
          (onClick)="processReturn()"
          [disabled]="!hasSelectedReturnItems()"
        />
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class OrderDetail implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  order: OrderDetailDto | null = null;
  paymentDialogVisible = false;
  returnDialogVisible = false;
  newStatus: string | null = null;

  returnableItems: (OrderItem & { selected: boolean })[] = [];

  statusOptions = [
    { label: 'Pending', value: 'Pending' },
    { label: 'Confirmed', value: 'Confirmed' },
    { label: 'Delivered', value: 'Delivered' },
    { label: 'Cancelled', value: 'Cancelled' }
  ];

  paymentForm: FormGroup = this.fb.group({
    amount: [null, [Validators.required, Validators.min(0.01)]],
    notes: ['']
  });

  private orderId!: number;

  ngOnInit(): void {
    this.orderId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadOrder();
  }

  loadOrder(): void {
    this.http.get<OrderDetailDto>(`/api/orders/${this.orderId}`).subscribe({
      next: (data) => {
        this.order = data;
      }
    });
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

  canUpdateStatus(): boolean {
    if (!this.order) return false;
    return this.order.status !== 'Cancelled' && this.order.status !== 'FullReturn';
  }

  canReturn(): boolean {
    if (!this.order) return false;
    return this.order.status !== 'Cancelled' && this.order.status !== 'FullReturn';
  }

  updateStatus(): void {
    if (!this.newStatus || !this.order) return;

    this.http.put(`/api/orders/${this.orderId}/status`, { status: this.newStatus }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Status updated' });
        this.newStatus = null;
        this.loadOrder();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update status' });
      }
    });
  }

  // Payment
  openPaymentDialog(): void {
    this.paymentForm.reset();
    this.paymentDialogVisible = true;
  }

  savePayment(): void {
    if (this.paymentForm.invalid) return;

    const payload = this.paymentForm.value;
    this.http.post(`/api/orders/${this.orderId}/payments`, payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Payment added' });
        this.paymentDialogVisible = false;
        this.loadOrder();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add payment' });
      }
    });
  }

  deletePayment(payment: OrderPayment): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this payment?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.http.delete(`/api/orders/${this.orderId}/payments/${payment.id}`).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Payment deleted' });
            this.loadOrder();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete payment' });
          }
        });
      }
    });
  }

  // Return
  openReturnDialog(): void {
    if (!this.order) return;
    this.returnableItems = this.order.items
      .filter(item => !item.isReturned)
      .map(item => ({ ...item, selected: false }));
    this.returnDialogVisible = true;
  }

  hasSelectedReturnItems(): boolean {
    return this.returnableItems.some(item => item.selected);
  }

  processReturn(): void {
    const selectedItemIds = this.returnableItems
      .filter(item => item.selected)
      .map(item => item.id);

    if (selectedItemIds.length === 0) return;

    this.http.post(`/api/orders/${this.orderId}/return`, { itemIds: selectedItemIds }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Items returned' });
        this.returnDialogVisible = false;
        this.loadOrder();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to return items' });
      }
    });
  }

  // Print
  printReceipt(): void {
    this.http.post(`/api/orders/${this.orderId}/print`, {}).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Receipt sent to printer' });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to print receipt' });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }
}
