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
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SupplierInvoiceDetail as InvoiceDetailDto, SupplierInvoicePayment } from '../../../core/models';

@Component({
  selector: 'app-invoice-detail',
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
    ToastModule,
    ToolbarModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast />
    <p-confirmdialog />

    <div class="p-4" *ngIf="invoice">
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
            <h2 class="m-0">{{ 'INVOICES.INVOICE' | translate }} #{{ invoice.invoiceNumber }}</h2>
          </div>
        </ng-template>
      </p-toolbar>

      <!-- Invoice Info Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <p-card>
          <div class="text-center">
            <div class="text-sm text-gray-500">{{ 'INVOICES.INVOICE_NUMBER' | translate }}</div>
            <div class="font-bold mt-1">{{ invoice.invoiceNumber }}</div>
          </div>
        </p-card>
        <p-card>
          <div class="text-center">
            <div class="text-sm text-gray-500">{{ 'INVOICES.SUPPLIER' | translate }}</div>
            <div class="font-bold mt-1">{{ invoice.supplierName }}</div>
          </div>
        </p-card>
        <p-card>
          <div class="text-center">
            <div class="text-sm text-gray-500">{{ 'INVOICES.DATE' | translate }}</div>
            <div class="font-bold mt-1">{{ invoice.invoiceDate | date:'short' }}</div>
          </div>
        </p-card>
        <p-card>
          <div class="text-center">
            <div class="text-sm text-gray-500">{{ 'INVOICES.TOTAL' | translate }}</div>
            <div class="text-xl font-bold text-primary mt-1">{{ invoice.total | number:'1.2-2' }}</div>
          </div>
        </p-card>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <p-card>
          <div class="text-center">
            <div class="text-sm text-gray-500">{{ 'INVOICES.PAID' | translate }}</div>
            <div class="text-xl font-bold text-green-500 mt-1">{{ invoice.paidAmount | number:'1.2-2' }}</div>
          </div>
        </p-card>
        <p-card>
          <div class="text-center">
            <div class="text-sm text-gray-500">{{ 'INVOICES.REMAINING' | translate }}</div>
            <div class="text-xl font-bold mt-1" [class.text-red-500]="invoice.remaining > 0">
              {{ invoice.remaining | number:'1.2-2' }}
            </div>
          </div>
        </p-card>
      </div>

      <!-- Items Table -->
      <p-card [header]="'INVOICES.ITEMS' | translate" class="mt-4">
        <p-table [value]="invoice.items" [rowHover]="true">
          <ng-template #header>
            <tr>
              <th>{{ 'INVOICES.PRODUCT' | translate }}</th>
              <th>{{ 'INVOICES.QUANTITY' | translate }}</th>
              <th>{{ 'INVOICES.COST_PRICE' | translate }}</th>
              <th>{{ 'INVOICES.SELLING_PRICE' | translate }}</th>
              <th>{{ 'INVOICES.ITEM_TOTAL' | translate }}</th>
            </tr>
          </ng-template>
          <ng-template #body let-item>
            <tr>
              <td>{{ item.productName }}</td>
              <td>{{ item.quantity }}</td>
              <td>{{ item.costPrice | number:'1.2-2' }}</td>
              <td>{{ item.sellingPrice | number:'1.2-2' }}</td>
              <td>{{ item.total | number:'1.2-2' }}</td>
            </tr>
          </ng-template>
          <ng-template #emptymessage>
            <tr>
              <td colspan="5" class="text-center">{{ 'COMMON.NO_DATA' | translate }}</td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>

      <!-- Payments Table -->
      <p-card [header]="'INVOICES.PAYMENTS' | translate" class="mt-4">
        <div class="flex justify-end mb-3">
          <p-button
            [label]="'INVOICES.ADD_PAYMENT' | translate"
            icon="pi pi-plus"
            (onClick)="openPaymentDialog()"
          />
        </div>
        <p-table [value]="invoice.payments" [rowHover]="true">
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
      <p-card [header]="'INVOICES.NOTES' | translate" class="mt-4" *ngIf="invoice.notes">
        <p>{{ invoice.notes }}</p>
      </p-card>
    </div>

    <!-- Add Payment Dialog -->
    <p-dialog
      [(visible)]="paymentDialogVisible"
      [header]="'INVOICES.ADD_PAYMENT' | translate"
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
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class InvoiceDetail implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  invoice: InvoiceDetailDto | null = null;
  paymentDialogVisible = false;

  paymentForm: FormGroup = this.fb.group({
    amount: [null, [Validators.required, Validators.min(0.01)]],
    notes: ['']
  });

  private invoiceId!: number;

  ngOnInit(): void {
    this.invoiceId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadInvoice();
  }

  loadInvoice(): void {
    this.http.get<InvoiceDetailDto>(`/api/supplier-invoices/${this.invoiceId}`).subscribe({
      next: (data) => {
        this.invoice = data;
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
    this.http.post(`/api/supplier-invoices/${this.invoiceId}/payments`, payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Payment added' });
        this.paymentDialogVisible = false;
        this.loadInvoice();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add payment' });
      }
    });
  }

  deletePayment(payment: SupplierInvoicePayment): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this payment?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.http.delete(`/api/supplier-invoices/${this.invoiceId}/payments/${payment.id}`).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Payment deleted' });
            this.loadInvoice();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete payment' });
          }
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/supplier-invoices']);
  }
}
