import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { CardModule } from 'primeng/card';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ClientBalance, Order, OrderPayment } from '../../../core/models';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    CardModule,
    TabsModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast />
    <p-confirmdialog />

    <div class="p-4" *ngIf="client">
      <div class="flex items-center gap-2 mb-4">
        <p-button
          icon="pi pi-arrow-left"
          [rounded]="true"
          [text]="true"
          (onClick)="goBack()"
        />
        <h2 class="m-0">{{ client.name }}</h2>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <p-card>
          <div class="text-center">
            <div class="text-sm text-gray-500 mb-2">{{ 'CLIENTS.TOTAL_ORDERS' | translate }}</div>
            <div class="text-2xl font-bold text-blue-500">{{ client.totalOrders | number:'1.2-2' }}</div>
          </div>
        </p-card>
        <p-card>
          <div class="text-center">
            <div class="text-sm text-gray-500 mb-2">{{ 'CLIENTS.TOTAL_PAID' | translate }}</div>
            <div class="text-2xl font-bold text-green-500">{{ client.totalPaid | number:'1.2-2' }}</div>
          </div>
        </p-card>
        <p-card>
          <div class="text-center">
            <div class="text-sm text-gray-500 mb-2">{{ 'CLIENTS.BALANCE' | translate }}</div>
            <div class="text-2xl font-bold" [class.text-red-500]="client.balance > 0" [class.text-green-500]="client.balance <= 0">
              {{ client.balance | number:'1.2-2' }}
            </div>
          </div>
        </p-card>
      </div>

      <!-- Tabs -->
      <p-tabs value="0">
        <p-tablist>
          <p-tab value="0">{{ 'CLIENTS.ORDERS_TAB' | translate }}</p-tab>
          <p-tab value="1">{{ 'CLIENTS.PAYMENTS_TAB' | translate }}</p-tab>
          <p-tab value="2">{{ 'CLIENTS.INFO_TAB' | translate }}</p-tab>
        </p-tablist>

        <p-tabpanels>
          <!-- Orders Tab -->
          <p-tabpanel value="0">
            <p-table
              [value]="orders"
              [loading]="loadingOrders"
              [rowHover]="true"
              [paginator]="true"
              [rows]="10"
            >
              <ng-template #header>
                <tr>
                  <th>{{ 'ORDERS.ORDER_NUMBER' | translate }}</th>
                  <th>{{ 'ORDERS.DATE' | translate }}</th>
                  <th>{{ 'ORDERS.TOTAL' | translate }}</th>
                  <th>{{ 'ORDERS.PAID' | translate }}</th>
                  <th>{{ 'ORDERS.REMAINING' | translate }}</th>
                  <th>{{ 'ORDERS.STATUS' | translate }}</th>
                </tr>
              </ng-template>
              <ng-template #body let-order>
                <tr class="cursor-pointer" (click)="viewOrder(order)">
                  <td>{{ order.orderNumber }}</td>
                  <td>{{ order.orderDate | date:'short' }}</td>
                  <td>{{ order.total | number:'1.2-2' }}</td>
                  <td>{{ order.paidAmount | number:'1.2-2' }}</td>
                  <td>{{ order.remaining | number:'1.2-2' }}</td>
                  <td>
                    <p-tag [value]="order.status" [severity]="getStatusSeverity(order.status)" />
                  </td>
                </tr>
              </ng-template>
              <ng-template #emptymessage>
                <tr>
                  <td colspan="6" class="text-center">{{ 'COMMON.NO_DATA' | translate }}</td>
                </tr>
              </ng-template>
            </p-table>
          </p-tabpanel>

          <!-- Payments Tab -->
          <p-tabpanel value="1">
            <div class="flex justify-end mb-3">
              <p-button
                [label]="'CLIENTS.ADD_PAYMENT' | translate"
                icon="pi pi-plus"
                (onClick)="openPaymentDialog()"
              />
            </div>
            <p-table
              [value]="payments"
              [loading]="loadingPayments"
              [rowHover]="true"
              [paginator]="true"
              [rows]="10"
            >
              <ng-template #header>
                <tr>
                  <th>{{ 'PAYMENTS.AMOUNT' | translate }}</th>
                  <th>{{ 'PAYMENTS.DATE' | translate }}</th>
                  <th>{{ 'PAYMENTS.NOTES' | translate }}</th>
                </tr>
              </ng-template>
              <ng-template #body let-payment>
                <tr>
                  <td>{{ payment.amount | number:'1.2-2' }}</td>
                  <td>{{ payment.paymentDate | date:'short' }}</td>
                  <td>{{ payment.notes }}</td>
                </tr>
              </ng-template>
              <ng-template #emptymessage>
                <tr>
                  <td colspan="3" class="text-center">{{ 'COMMON.NO_DATA' | translate }}</td>
                </tr>
              </ng-template>
            </p-table>
          </p-tabpanel>

          <!-- Info Tab -->
          <p-tabpanel value="2">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              <div>
                <label class="font-bold text-sm text-gray-500">{{ 'CLIENTS.NAME' | translate }}</label>
                <p class="mt-1">{{ client.name }}</p>
              </div>
              <div>
                <label class="font-bold text-sm text-gray-500">{{ 'CLIENTS.PHONE' | translate }}</label>
                <p class="mt-1">{{ client.phone || '-' }}</p>
              </div>
              <div class="md:col-span-2">
                <label class="font-bold text-sm text-gray-500">{{ 'CLIENTS.ADDRESS' | translate }}</label>
                <p class="mt-1">{{ client.address || '-' }}</p>
              </div>
            </div>
          </p-tabpanel>
        </p-tabpanels>
      </p-tabs>
    </div>

    <!-- Add Payment Dialog -->
    <p-dialog
      [(visible)]="paymentDialogVisible"
      [header]="'CLIENTS.ADD_PAYMENT' | translate"
      [modal]="true"
      [style]="{ width: '400px' }"
    >
      <form [formGroup]="paymentForm" (ngSubmit)="savePayment()">
        <div class="flex flex-col gap-4 mt-4">
          <div class="flex flex-col gap-2">
            <label for="amount">{{ 'PAYMENTS.AMOUNT' | translate }}</label>
            <p-inputnumber
              id="amount"
              formControlName="amount"
              mode="decimal"
              [minFractionDigits]="2"
              [maxFractionDigits]="2"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label for="notes">{{ 'PAYMENTS.NOTES' | translate }}</label>
            <textarea pTextarea id="notes" formControlName="notes" rows="3"></textarea>
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
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ClientDetail implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);

  client: ClientBalance | null = null;
  orders: Order[] = [];
  payments: any[] = [];
  loadingOrders = false;
  loadingPayments = false;
  paymentDialogVisible = false;

  paymentForm: FormGroup = this.fb.group({
    amount: [null, [Validators.required, Validators.min(0.01)]],
    notes: ['']
  });

  private clientId!: number;

  ngOnInit(): void {
    this.clientId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadClient();
    this.loadOrders();
    this.loadPayments();
  }

  loadClient(): void {
    this.http.get<ClientBalance>(`/api/clients/${this.clientId}`).subscribe({
      next: (data) => {
        this.client = data;
      }
    });
  }

  loadOrders(): void {
    this.loadingOrders = true;
    this.http.get<Order[]>(`/api/clients/${this.clientId}/orders`).subscribe({
      next: (data) => {
        this.orders = data;
        this.loadingOrders = false;
      },
      error: () => {
        this.loadingOrders = false;
      }
    });
  }

  loadPayments(): void {
    this.loadingPayments = true;
    this.http.get<any[]>(`/api/clients/${this.clientId}/payments`).subscribe({
      next: (data) => {
        this.payments = data;
        this.loadingPayments = false;
      },
      error: () => {
        this.loadingPayments = false;
      }
    });
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

  openPaymentDialog(): void {
    this.paymentForm.reset();
    this.paymentDialogVisible = true;
  }

  savePayment(): void {
    if (this.paymentForm.invalid) return;

    const payload = {
      clientId: this.clientId,
      ...this.paymentForm.value
    };

    this.http.post('/api/payments/client', payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Payment added' });
        this.paymentDialogVisible = false;
        this.loadClient();
        this.loadPayments();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add payment' });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/clients']);
  }
}
