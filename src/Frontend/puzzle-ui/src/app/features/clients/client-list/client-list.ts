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
import { Client } from '../../../core/models';

@Component({
  selector: 'app-client-list',
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
          <h2 class="m-0">{{ 'CLIENTS.TITLE' | translate }}</h2>
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
        [value]="filteredClients"
        [loading]="loading"
        [rowHover]="true"
        [paginator]="true"
        [rows]="10"
        [showCurrentPageReport]="true"
        [currentPageReportTemplate]="'COMMON.PAGE_REPORT' | translate"
      >
        <ng-template #header>
          <tr>
            <th>{{ 'CLIENTS.NAME' | translate }}</th>
            <th>{{ 'CLIENTS.PHONE' | translate }}</th>
            <th>{{ 'CLIENTS.ADDRESS' | translate }}</th>
            <th style="width: 200px">{{ 'COMMON.ACTIONS' | translate }}</th>
          </tr>
        </ng-template>
        <ng-template #body let-client>
          <tr>
            <td>{{ client.name }}</td>
            <td>{{ client.phone }}</td>
            <td>{{ client.address }}</td>
            <td>
              <p-button
                icon="pi pi-eye"
                [rounded]="true"
                [text]="true"
                severity="info"
                (onClick)="viewClient(client)"
              />
              <p-button
                icon="pi pi-pencil"
                [rounded]="true"
                [text]="true"
                severity="info"
                (onClick)="editClient(client)"
              />
              <p-button
                icon="pi pi-trash"
                [rounded]="true"
                [text]="true"
                severity="danger"
                (onClick)="deleteClient(client)"
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
      [header]="editMode ? ('CLIENTS.EDIT' | translate) : ('CLIENTS.ADD' | translate)"
      [modal]="true"
      [style]="{ width: '500px' }"
    >
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="flex flex-col gap-4 mt-4">
          <div class="flex flex-col gap-2">
            <label for="name">{{ 'CLIENTS.NAME' | translate }}</label>
            <input pInputText id="name" formControlName="name" />
            <small class="text-red-500" *ngIf="form.get('name')?.invalid && form.get('name')?.touched">
              {{ 'COMMON.REQUIRED' | translate }}
            </small>
          </div>

          <div class="flex flex-col gap-2">
            <label for="phone">{{ 'CLIENTS.PHONE' | translate }}</label>
            <input pInputText id="phone" formControlName="phone" />
          </div>

          <div class="flex flex-col gap-2">
            <label for="address">{{ 'CLIENTS.ADDRESS' | translate }}</label>
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
export class ClientList implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  clients: Client[] = [];
  filteredClients: Client[] = [];
  loading = false;
  dialogVisible = false;
  editMode = false;
  selectedClient: Client | null = null;
  searchTerm = '';

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    phone: [''],
    address: ['']
  });

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.loading = true;
    this.http.get<Client[]>('/api/clients').subscribe({
      next: (data) => {
        this.clients = data;
        this.filterClients();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.filterClients();
  }

  filterClients(): void {
    if (!this.searchTerm) {
      this.filteredClients = [...this.clients];
    } else {
      this.filteredClients = this.clients.filter(c =>
        c.name.toLowerCase().includes(this.searchTerm) ||
        c.phone?.toLowerCase().includes(this.searchTerm)
      );
    }
  }

  viewClient(client: Client): void {
    this.router.navigate(['/clients', client.id]);
  }

  openNew(): void {
    this.editMode = false;
    this.selectedClient = null;
    this.form.reset();
    this.dialogVisible = true;
  }

  editClient(client: Client): void {
    this.editMode = true;
    this.selectedClient = client;
    this.form.patchValue({
      name: client.name,
      phone: client.phone,
      address: client.address
    });
    this.dialogVisible = true;
  }

  save(): void {
    if (this.form.invalid) return;

    const payload = this.form.value;

    if (this.editMode && this.selectedClient) {
      this.http.put(`/api/clients/${this.selectedClient.id}`, payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Client updated' });
          this.dialogVisible = false;
          this.loadClients();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update client' });
        }
      });
    } else {
      this.http.post('/api/clients', payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Client created' });
          this.dialogVisible = false;
          this.loadClients();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create client' });
        }
      });
    }
  }

  deleteClient(client: Client): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this client?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.http.delete(`/api/clients/${client.id}`).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Client deleted' });
            this.loadClients();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete client' });
          }
        });
      }
    });
  }
}
