import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Supplier } from '../../../core/models';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    ConfirmDialogModule,
    ToastModule,
    ToolbarModule,
    IconFieldModule,
    InputIconModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <p-toast />
    <p-confirmdialog />

    <div class="card">
      <p-toolbar>
        <ng-template #start>
          <h2 class="m-0">{{ 'SUPPLIERS.TITLE' | translate }}</h2>
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
              [label]="'COMMON.ADD' | translate"
              icon="pi pi-plus"
              (onClick)="openNew()"
            />
          </div>
        </ng-template>
      </p-toolbar>

      <p-table
        [value]="filteredSuppliers"
        [loading]="loading"
        [rowHover]="true"
        [paginator]="true"
        [rows]="10"
        [showCurrentPageReport]="true"
        [currentPageReportTemplate]="'COMMON.PAGE_REPORT' | translate"
      >
        <ng-template #header>
          <tr>
            <th>{{ 'SUPPLIERS.NAME' | translate }}</th>
            <th>{{ 'SUPPLIERS.PHONE' | translate }}</th>
            <th>{{ 'SUPPLIERS.ADDRESS' | translate }}</th>
            <th style="width: 200px">{{ 'COMMON.ACTIONS' | translate }}</th>
          </tr>
        </ng-template>
        <ng-template #body let-supplier>
          <tr>
            <td>{{ supplier.name }}</td>
            <td>{{ supplier.phone }}</td>
            <td>{{ supplier.address }}</td>
            <td>
              <p-button
                icon="pi pi-eye"
                [rounded]="true"
                [text]="true"
                severity="info"
                (onClick)="viewSupplier(supplier)"
              />
              <p-button
                icon="pi pi-pencil"
                [rounded]="true"
                [text]="true"
                severity="info"
                (onClick)="editSupplier(supplier)"
              />
              <p-button
                icon="pi pi-trash"
                [rounded]="true"
                [text]="true"
                severity="danger"
                (onClick)="deleteSupplier(supplier)"
              />
            </td>
          </tr>
        </ng-template>
        <ng-template #emptymessage>
          <tr>
            <td colspan="4" class="text-center">
              {{ 'COMMON.NO_DATA' | translate }}
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog
      [(visible)]="dialogVisible"
      [header]="editMode ? ('SUPPLIERS.EDIT' | translate) : ('SUPPLIERS.ADD' | translate)"
      [modal]="true"
      [style]="{ width: '500px' }"
    >
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="flex flex-col gap-4 mt-4">
          <div class="flex flex-col gap-2">
            <label for="name">{{ 'SUPPLIERS.NAME' | translate }}</label>
            <input pInputText id="name" formControlName="name" />
            <small class="text-red-500" *ngIf="form.get('name')?.invalid && form.get('name')?.touched">
              {{ 'COMMON.REQUIRED' | translate }}
            </small>
          </div>

          <div class="flex flex-col gap-2">
            <label for="phone">{{ 'SUPPLIERS.PHONE' | translate }}</label>
            <input pInputText id="phone" formControlName="phone" />
          </div>

          <div class="flex flex-col gap-2">
            <label for="address">{{ 'SUPPLIERS.ADDRESS' | translate }}</label>
            <textarea
              pTextarea
              id="address"
              formControlName="address"
              rows="3"
            ></textarea>
          </div>
        </div>
      </form>

      <ng-template #footer>
        <p-button
          [label]="'COMMON.CANCEL' | translate"
          icon="pi pi-times"
          [text]="true"
          (onClick)="dialogVisible = false"
        />
        <p-button
          [label]="'COMMON.SAVE' | translate"
          icon="pi pi-check"
          (onClick)="save()"
          [disabled]="form.invalid"
        />
      </ng-template>
    </p-dialog>
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
export class SupplierList implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  suppliers: Supplier[] = [];
  filteredSuppliers: Supplier[] = [];
  loading = false;
  dialogVisible = false;
  editMode = false;
  selectedSupplier: Supplier | null = null;
  searchTerm = '';

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    phone: [''],
    address: ['']
  });

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.loading = true;
    this.http.get<Supplier[]>('/api/suppliers').subscribe({
      next: (data) => {
        this.suppliers = data;
        this.filterSuppliers();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.filterSuppliers();
  }

  filterSuppliers(): void {
    if (!this.searchTerm) {
      this.filteredSuppliers = [...this.suppliers];
    } else {
      this.filteredSuppliers = this.suppliers.filter(s =>
        s.name.toLowerCase().includes(this.searchTerm) ||
        s.phone?.toLowerCase().includes(this.searchTerm)
      );
    }
  }

  viewSupplier(supplier: Supplier): void {
    this.router.navigate(['/suppliers', supplier.id]);
  }

  openNew(): void {
    this.editMode = false;
    this.selectedSupplier = null;
    this.form.reset();
    this.dialogVisible = true;
  }

  editSupplier(supplier: Supplier): void {
    this.editMode = true;
    this.selectedSupplier = supplier;
    this.form.patchValue({
      name: supplier.name,
      phone: supplier.phone,
      address: supplier.address
    });
    this.dialogVisible = true;
  }

  save(): void {
    if (this.form.invalid) return;

    const payload = this.form.value;

    if (this.editMode && this.selectedSupplier) {
      this.http.put(`/api/suppliers/${this.selectedSupplier.id}`, payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Supplier updated' });
          this.dialogVisible = false;
          this.loadSuppliers();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update supplier' });
        }
      });
    } else {
      this.http.post('/api/suppliers', payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Supplier created' });
          this.dialogVisible = false;
          this.loadSuppliers();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create supplier' });
        }
      });
    }
  }

  deleteSupplier(supplier: Supplier): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this supplier?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.http.delete(`/api/suppliers/${supplier.id}`).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Supplier deleted' });
            this.loadSuppliers();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete supplier' });
          }
        });
      }
    });
  }
}
