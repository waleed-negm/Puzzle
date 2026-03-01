import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
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
import { ConfirmationService, MessageService } from 'primeng/api';
import { Category } from '../../../core/models';

@Component({
  selector: 'app-category-list',
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
    ToolbarModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <p-toast />
    <p-confirmdialog />

    <div class="card">
      <p-toolbar>
        <ng-template #start>
          <h2 class="m-0">{{ 'CATEGORIES.TITLE' | translate }}</h2>
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
        [value]="categories"
        [loading]="loading"
        [rowHover]="true"
        [paginator]="true"
        [rows]="10"
        [showCurrentPageReport]="true"
        [currentPageReportTemplate]="'COMMON.PAGE_REPORT' | translate"
      >
        <ng-template #header>
          <tr>
            <th>{{ 'CATEGORIES.NAME' | translate }}</th>
            <th>{{ 'CATEGORIES.DESCRIPTION' | translate }}</th>
            <th style="width: 150px">{{ 'COMMON.ACTIONS' | translate }}</th>
          </tr>
        </ng-template>
        <ng-template #body let-category>
          <tr>
            <td>{{ category.name }}</td>
            <td>{{ category.description }}</td>
            <td>
              <p-button
                icon="pi pi-pencil"
                [rounded]="true"
                [text]="true"
                severity="info"
                (onClick)="editCategory(category)"
              />
              <p-button
                icon="pi pi-trash"
                [rounded]="true"
                [text]="true"
                severity="danger"
                (onClick)="deleteCategory(category)"
              />
            </td>
          </tr>
        </ng-template>
        <ng-template #emptymessage>
          <tr>
            <td colspan="3" class="text-center">
              {{ 'COMMON.NO_DATA' | translate }}
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog
      [(visible)]="dialogVisible"
      [header]="editMode ? ('CATEGORIES.EDIT' | translate) : ('CATEGORIES.ADD' | translate)"
      [modal]="true"
      [style]="{ width: '450px' }"
    >
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="flex flex-col gap-4 mt-4">
          <div class="flex flex-col gap-2">
            <label for="name">{{ 'CATEGORIES.NAME' | translate }}</label>
            <input
              pInputText
              id="name"
              formControlName="name"
              [placeholder]="'CATEGORIES.NAME' | translate"
            />
            <small class="text-red-500" *ngIf="form.get('name')?.invalid && form.get('name')?.touched">
              {{ 'COMMON.REQUIRED' | translate }}
            </small>
          </div>

          <div class="flex flex-col gap-2">
            <label for="description">{{ 'CATEGORIES.DESCRIPTION' | translate }}</label>
            <textarea
              pTextarea
              id="description"
              formControlName="description"
              [placeholder]="'CATEGORIES.DESCRIPTION' | translate"
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
export class CategoryList implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  categories: Category[] = [];
  loading = false;
  dialogVisible = false;
  editMode = false;
  selectedCategory: Category | null = null;

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: ['']
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.http.get<Category[]>('/api/categories').subscribe({
      next: (data) => {
        this.categories = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  openNew(): void {
    this.editMode = false;
    this.selectedCategory = null;
    this.form.reset();
    this.dialogVisible = true;
  }

  editCategory(category: Category): void {
    this.editMode = true;
    this.selectedCategory = category;
    this.form.patchValue({
      name: category.name,
      description: category.description
    });
    this.dialogVisible = true;
  }

  save(): void {
    if (this.form.invalid) return;

    const payload = this.form.value;

    if (this.editMode && this.selectedCategory) {
      this.http.put(`/api/categories/${this.selectedCategory.id}`, payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Category updated' });
          this.dialogVisible = false;
          this.loadCategories();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update category' });
        }
      });
    } else {
      this.http.post('/api/categories', payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Category created' });
          this.dialogVisible = false;
          this.loadCategories();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create category' });
        }
      });
    }
  }

  deleteCategory(category: Category): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this category?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.http.delete(`/api/categories/${category.id}`).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Category deleted' });
            this.loadCategories();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete category' });
          }
        });
      }
    });
  }
}
