import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { PasswordModule } from 'primeng/password';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Employee } from '../../../core/models';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    CheckboxModule,
    ConfirmDialogModule,
    ToastModule,
    ToolbarModule,
    TagModule,
    PasswordModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <p-toast />
    <p-confirmdialog />

    <div class="card">
      <p-toolbar>
        <ng-template #start>
          <h2 class="m-0">{{ 'EMPLOYEES.TITLE' | translate }}</h2>
        </ng-template>
        <ng-template #end>
          <p-button
            [label]="'COMMON.ADD' | translate"
            icon="pi pi-plus"
            (onClick)="openNew()"
          />
        </ng-template>
      </p-toolbar>

      <p-table
        [value]="employees"
        [loading]="loading"
        [rowHover]="true"
        [paginator]="true"
        [rows]="10"
        [showCurrentPageReport]="true"
        [currentPageReportTemplate]="'COMMON.PAGE_REPORT' | translate"
      >
        <ng-template #header>
          <tr>
            <th>{{ 'EMPLOYEES.NAME' | translate }}</th>
            <th>{{ 'EMPLOYEES.USERNAME' | translate }}</th>
            <th>{{ 'EMPLOYEES.ROLE' | translate }}</th>
            <th>{{ 'EMPLOYEES.ACTIVE' | translate }}</th>
            <th style="width: 150px">{{ 'COMMON.ACTIONS' | translate }}</th>
          </tr>
        </ng-template>
        <ng-template #body let-employee>
          <tr>
            <td>{{ employee.name }}</td>
            <td>{{ employee.username }}</td>
            <td>
              <p-tag
                [value]="employee.role"
                [severity]="employee.role === 'Admin' ? 'warn' : 'info'"
              />
            </td>
            <td>
              <p-tag
                [value]="(employee.isActive ? 'COMMON.ACTIVE' : 'COMMON.INACTIVE') | translate"
                [severity]="employee.isActive ? 'success' : 'danger'"
              />
            </td>
            <td>
              <p-button
                icon="pi pi-pencil"
                [rounded]="true"
                [text]="true"
                severity="info"
                (onClick)="editEmployee(employee)"
              />
              <p-button
                icon="pi pi-trash"
                [rounded]="true"
                [text]="true"
                severity="danger"
                (onClick)="deleteEmployee(employee)"
              />
            </td>
          </tr>
        </ng-template>
        <ng-template #emptymessage>
          <tr>
            <td colspan="5" class="text-center">
              {{ 'COMMON.NO_DATA' | translate }}
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog
      [(visible)]="dialogVisible"
      [header]="editMode ? ('EMPLOYEES.EDIT' | translate) : ('EMPLOYEES.ADD' | translate)"
      [modal]="true"
      [style]="{ width: '500px' }"
    >
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="flex flex-col gap-4 mt-4">
          <div class="flex flex-col gap-2">
            <label for="name">{{ 'EMPLOYEES.NAME' | translate }}</label>
            <input pInputText id="name" formControlName="name" />
            <small class="text-red-500" *ngIf="form.get('name')?.invalid && form.get('name')?.touched">
              {{ 'COMMON.REQUIRED' | translate }}
            </small>
          </div>

          <div class="flex flex-col gap-2">
            <label for="username">{{ 'EMPLOYEES.USERNAME' | translate }}</label>
            <input pInputText id="username" formControlName="username" />
            <small class="text-red-500" *ngIf="form.get('username')?.invalid && form.get('username')?.touched">
              {{ 'COMMON.REQUIRED' | translate }}
            </small>
          </div>

          <div class="flex flex-col gap-2">
            <label for="password">{{ 'EMPLOYEES.PASSWORD' | translate }}</label>
            <p-password
              id="password"
              formControlName="password"
              [toggleMask]="true"
              [feedback]="false"
              styleClass="w-full"
              inputStyleClass="w-full"
            />
            <small class="text-gray-500" *ngIf="editMode">
              {{ 'EMPLOYEES.PASSWORD_HINT' | translate }}
            </small>
          </div>

          <div class="flex flex-col gap-2">
            <label for="role">{{ 'EMPLOYEES.ROLE' | translate }}</label>
            <p-select
              id="role"
              formControlName="role"
              [options]="roles"
              optionLabel="label"
              optionValue="value"
              [placeholder]="'EMPLOYEES.SELECT_ROLE' | translate"
            />
          </div>

          <div class="flex items-center gap-2">
            <p-checkbox
              formControlName="isActive"
              [binary]="true"
              inputId="isActive"
            />
            <label for="isActive">{{ 'EMPLOYEES.ACTIVE' | translate }}</label>
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
export class EmployeeList implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  employees: Employee[] = [];
  loading = false;
  dialogVisible = false;
  editMode = false;
  selectedEmployee: Employee | null = null;

  roles = [
    { label: 'Admin', value: 'Admin' },
    { label: 'User', value: 'User' }
  ];

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    username: ['', Validators.required],
    password: [''],
    role: ['User', Validators.required],
    isActive: [true]
  });

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading = true;
    this.http.get<Employee[]>('/api/employees').subscribe({
      next: (data) => {
        this.employees = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  openNew(): void {
    this.editMode = false;
    this.selectedEmployee = null;
    this.form.reset({ role: 'User', isActive: true });
    this.form.get('password')?.setValidators(Validators.required);
    this.form.get('password')?.updateValueAndValidity();
    this.dialogVisible = true;
  }

  editEmployee(employee: Employee): void {
    this.editMode = true;
    this.selectedEmployee = employee;
    this.form.patchValue({
      name: employee.name,
      username: employee.username,
      password: '',
      role: employee.role,
      isActive: employee.isActive
    });
    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
    this.dialogVisible = true;
  }

  save(): void {
    if (this.form.invalid) return;

    const payload = { ...this.form.value };
    if (this.editMode && !payload.password) {
      delete payload.password;
    }

    if (this.editMode && this.selectedEmployee) {
      this.http.put(`/api/employees/${this.selectedEmployee.id}`, payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Employee updated' });
          this.dialogVisible = false;
          this.loadEmployees();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update employee' });
        }
      });
    } else {
      this.http.post('/api/employees', payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Employee created' });
          this.dialogVisible = false;
          this.loadEmployees();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create employee' });
        }
      });
    }
  }

  deleteEmployee(employee: Employee): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this employee?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.http.delete(`/api/employees/${employee.id}`).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Employee deleted' });
            this.loadEmployees();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete employee' });
          }
        });
      }
    });
  }
}
