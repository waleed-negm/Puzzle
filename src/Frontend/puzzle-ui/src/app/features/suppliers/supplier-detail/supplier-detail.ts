import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { CardModule } from 'primeng/card';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SupplierBalance, SupplierInvoice } from '../../../core/models';

@Component({
  selector: 'app-supplier-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    TableModule,
    ButtonModule,
    DialogModule,
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

    <div class="p-4" *ngIf="supplier">
      <div class="flex items-center gap-2 mb-4">
        <p-button
          icon="pi pi-arrow-left"
          [rounded]="true"
          [text]="true"
          (onClick)="goBack()"
        />
        <h2 class="m-0">{{ supplier.name }}</h2>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <p-card>
          <div class="text-center">
            <div class="text-sm text-gray-500 mb-2">{{ 'SUPPLIERS.TOTAL_INVOICES' | translate }}</div>
            <div class="text-2xl font-bold text-blue-500">{{ supplier.totalInvoices | number:'1.2-2' }}</div>
          </div>
        </p-card>
        <p-card>
          <div class="text-center">
            <div class="text-sm text-gray-500 mb-2">{{ 'SUPPLIERS.TOTAL_PAID' | translate }}</div>
            <div class="text-2xl font-bold text-green-500">{{ supplier.totalPaid | number:'1.2-2' }}</div>
          </div>
        </p-card>
        <p-card>
          <div class="text-center">
            <div class="text-sm text-gray-500 mb-2">{{ 'SUPPLIERS.BALANCE' | translate }}</div>
            <div class="text-2xl font-bold" [class.text-red-500]="supplier.balance > 0" [class.text-green-500]="supplier.balance <= 0">
              {{ supplier.balance | number:'1.2-2' }}
            </div>
          </div>
        </p-card>
      </div>

      <!-- Tabs -->
      <p-tabs value="0">
        <p-tablist>
          <p-tab value="0">{{ 'SUPPLIERS.INVOICES_TAB' | translate }}</p-tab>
          <p-tab value="1">{{ 'SUPPLIERS.PAYMENTS_TAB' | translate }}</p-tab>
          <p-tab value="2">{{ 'SUPPLIERS.INFO_TAB' | translate }}</p-tab>
        </p-tablist>

        <p-tabpanels>
          <!-- Invoices Tab -->
          <p-tabpanel value="0">
            <p-table
              [value]="invoices"
              [loading]="loadingInvoices"
              [rowHover]="true"
              [paginator]="true"
              [rows]="10"
            >
              <ng-template #header>
                <tr>
                  <th>{{ 'INVOICES.INVOICE_NUMBER' | translate }}</th>
                  <th>{{ 'INVOICES.DATE' | translate }}</th>
                  <th>{{ 'INVOICES.TOTAL' | translate }}</th>
                  <th>{{ 'INVOICES.PAID' | translate }}</th>
                  <th>{{ 'INVOICES.REMAINING' | translate }}</th>
                </tr>
              </ng-template>
              <ng-template #body let-invoice>
                <tr class="cursor-pointer" (click)="viewInvoice(invoice)">
                  <td>{{ invoice.invoiceNumber }}</td>
                  <td>{{ invoice.invoiceDate | date:'short' }}</td>
                  <td>{{ invoice.total | number:'1.2-2' }}</td>
                  <td>{{ invoice.paidAmount | number:'1.2-2' }}</td>
                  <td>{{ invoice.remaining | number:'1.2-2' }}</td>
                </tr>
              </ng-template>
              <ng-template #emptymessage>
                <tr>
                  <td colspan="5" class="text-center">{{ 'COMMON.NO_DATA' | translate }}</td>
                </tr>
              </ng-template>
            </p-table>
          </p-tabpanel>

          <!-- Payments Tab -->
          <p-tabpanel value="1">
            <div class="flex justify-end mb-3">
              <p-button
                [label]="'SUPPLIERS.ADD_PAYMENT' | translate"
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
                <label class="font-bold text-sm text-gray-500">{{ 'SUPPLIERS.NAME' | translate }}</label>
                <p class="mt-1">{{ supplier.name }}</p>
              </div>
              <div>
                <label class="font-bold text-sm text-gray-500">{{ 'SUPPLIERS.PHONE' | translate }}</label>
                <p class="mt-1">{{ supplier.phone || '-' }}</p>
              </div>
              <div class="md:col-span-2">
                <label class="font-bold text-sm text-gray-500">{{ 'SUPPLIERS.ADDRESS' | translate }}</label>
                <p class="mt-1">{{ supplier.address || '-' }}</p>
              </div>
            </div>
          </p-tabpanel>
        </p-tabpanels>
      </p-tabs>
    </div>

    <!-- Add Payment Dialog -->
    <p-dialog
      [(visible)]="paymentDialogVisible"
      [header]="'SUPPLIERS.ADD_PAYMENT' | translate"
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
export class SupplierDetail implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);

  supplier: SupplierBalance | null = null;
  invoices: SupplierInvoice[] = [];
  payments: any[] = [];
  loadingInvoices = false;
  loadingPayments = false;
  paymentDialogVisible = false;

  paymentForm: FormGroup = this.fb.group({
    amount: [null, [Validators.required, Validators.min(0.01)]],
    notes: ['']
  });

  private supplierId!: number;

  ngOnInit(): void {
    this.supplierId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadSupplier();
    this.loadInvoices();
    this.loadPayments();
  }

  loadSupplier(): void {
    this.http.get<SupplierBalance>(`/api/suppliers/${this.supplierId}`).subscribe({
      next: (data) => {
        this.supplier = data;
      }
    });
  }

  loadInvoices(): void {
    this.loadingInvoices = true;
    this.http.get<SupplierInvoice[]>(`/api/suppliers/${this.supplierId}/invoices`).subscribe({
      next: (data) => {
        this.invoices = data;
        this.loadingInvoices = false;
      },
      error: () => {
        this.loadingInvoices = false;
      }
    });
  }

  loadPayments(): void {
    this.loadingPayments = true;
    this.http.get<any[]>(`/api/suppliers/${this.supplierId}/payments`).subscribe({
      next: (data) => {
        this.payments = data;
        this.loadingPayments = false;
      },
      error: () => {
        this.loadingPayments = false;
      }
    });
  }

  viewInvoice(invoice: SupplierInvoice): void {
    this.router.navigate(['/supplier-invoices', invoice.id]);
  }

  openPaymentDialog(): void {
    this.paymentForm.reset();
    this.paymentDialogVisible = true;
  }

  savePayment(): void {
    if (this.paymentForm.invalid) return;

    const payload = {
      supplierId: this.supplierId,
      ...this.paymentForm.value
    };

    this.http.post('/api/payments/supplier', payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Payment added' });
        this.paymentDialogVisible = false;
        this.loadSupplier();
        this.loadPayments();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add payment' });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/suppliers']);
  }
}
