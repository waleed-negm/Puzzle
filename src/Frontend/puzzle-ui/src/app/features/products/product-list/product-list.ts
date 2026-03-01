import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Product, Category, PaginatedResult } from '../../../core/models';

@Component({
  selector: 'app-product-list',
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
    SelectModule,
    CheckboxModule,
    ConfirmDialogModule,
    ToastModule,
    ToolbarModule,
    TagModule,
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
          <h2 class="m-0">{{ 'PRODUCTS.TITLE' | translate }}</h2>
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
              [options]="categories"
              optionLabel="name"
              optionValue="id"
              [placeholder]="'PRODUCTS.FILTER_CATEGORY' | translate"
              [showClear]="true"
              (onChange)="onCategoryFilter($event.value)"
              [style]="{ minWidth: '200px' }"
            />
            <p-button
              [label]="'COMMON.ADD' | translate"
              icon="pi pi-plus"
              (onClick)="openNew()"
            />
          </div>
        </ng-template>
      </p-toolbar>

      <p-table
        [value]="products"
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
            <th>{{ 'PRODUCTS.NAME' | translate }}</th>
            <th>{{ 'PRODUCTS.BARCODE' | translate }}</th>
            <th>{{ 'PRODUCTS.PRICE' | translate }}</th>
            <th>{{ 'PRODUCTS.COST_PRICE' | translate }}</th>
            <th>{{ 'PRODUCTS.STOCK' | translate }}</th>
            <th>{{ 'PRODUCTS.CATEGORY' | translate }}</th>
            <th>{{ 'PRODUCTS.IS_RETURNABLE' | translate }}</th>
            <th style="width: 150px">{{ 'COMMON.ACTIONS' | translate }}</th>
          </tr>
        </ng-template>
        <ng-template #body let-product>
          <tr>
            <td>{{ product.name }}</td>
            <td>{{ product.barcode }}</td>
            <td>{{ product.price | number:'1.2-2' }}</td>
            <td>{{ product.costPrice | number:'1.2-2' }}</td>
            <td>
              <p-tag
                [value]="product.stock.toString()"
                [severity]="product.stock > 10 ? 'success' : product.stock > 0 ? 'warn' : 'danger'"
              />
            </td>
            <td>{{ product.categoryName }}</td>
            <td>
              <p-tag
                [value]="(product.isReturnable ? 'COMMON.YES' : 'COMMON.NO') | translate"
                [severity]="product.isReturnable ? 'success' : 'secondary'"
              />
            </td>
            <td>
              <p-button
                icon="pi pi-pencil"
                [rounded]="true"
                [text]="true"
                severity="info"
                (onClick)="editProduct(product)"
              />
              <p-button
                icon="pi pi-trash"
                [rounded]="true"
                [text]="true"
                severity="danger"
                (onClick)="deleteProduct(product)"
              />
            </td>
          </tr>
        </ng-template>
        <ng-template #emptymessage>
          <tr>
            <td colspan="8" class="text-center">
              {{ 'COMMON.NO_DATA' | translate }}
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog
      [(visible)]="dialogVisible"
      [header]="editMode ? ('PRODUCTS.EDIT' | translate) : ('PRODUCTS.ADD' | translate)"
      [modal]="true"
      [style]="{ width: '550px' }"
    >
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="flex flex-col gap-4 mt-4">
          <div class="flex flex-col gap-2">
            <label for="name">{{ 'PRODUCTS.NAME' | translate }}</label>
            <input pInputText id="name" formControlName="name" />
            <small class="text-red-500" *ngIf="form.get('name')?.invalid && form.get('name')?.touched">
              {{ 'COMMON.REQUIRED' | translate }}
            </small>
          </div>

          <div class="flex flex-col gap-2">
            <label for="barcode">{{ 'PRODUCTS.BARCODE' | translate }}</label>
            <input pInputText id="barcode" formControlName="barcode" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label for="price">{{ 'PRODUCTS.PRICE' | translate }}</label>
              <p-inputnumber
                id="price"
                formControlName="price"
                mode="decimal"
                [minFractionDigits]="2"
                [maxFractionDigits]="2"
              />
            </div>

            <div class="flex flex-col gap-2">
              <label for="costPrice">{{ 'PRODUCTS.COST_PRICE' | translate }}</label>
              <p-inputnumber
                id="costPrice"
                formControlName="costPrice"
                mode="decimal"
                [minFractionDigits]="2"
                [maxFractionDigits]="2"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label for="stock">{{ 'PRODUCTS.STOCK' | translate }}</label>
              <p-inputnumber
                id="stock"
                formControlName="stock"
                [showButtons]="true"
              />
            </div>

            <div class="flex flex-col gap-2">
              <label for="categoryId">{{ 'PRODUCTS.CATEGORY' | translate }}</label>
              <p-select
                id="categoryId"
                formControlName="categoryId"
                [options]="categories"
                optionLabel="name"
                optionValue="id"
                [placeholder]="'PRODUCTS.SELECT_CATEGORY' | translate"
              />
            </div>
          </div>

          <div class="flex items-center gap-2">
            <p-checkbox
              formControlName="isReturnable"
              [binary]="true"
              inputId="isReturnable"
            />
            <label for="isReturnable">{{ 'PRODUCTS.IS_RETURNABLE' | translate }}</label>
          </div>

          <div class="flex flex-col gap-2" *ngIf="form.get('isReturnable')?.value">
            <label for="returnPrice">{{ 'PRODUCTS.RETURN_PRICE' | translate }}</label>
            <p-inputnumber
              id="returnPrice"
              formControlName="returnPrice"
              mode="decimal"
              [minFractionDigits]="2"
              [maxFractionDigits]="2"
            />
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
export class ProductList implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  products: Product[] = [];
  categories: Category[] = [];
  loading = false;
  dialogVisible = false;
  editMode = false;
  selectedProduct: Product | null = null;

  totalRecords = 0;
  page = 1;
  pageSize = 10;
  searchTerm = '';
  categoryFilter: number | null = null;

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    barcode: [''],
    price: [0, Validators.required],
    costPrice: [0],
    stock: [0],
    categoryId: [null, Validators.required],
    isReturnable: [false],
    returnPrice: [0]
  });

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.http.get<Category[]>('/api/categories').subscribe({
      next: (data) => {
        this.categories = data;
      }
    });
  }

  loadProducts(): void {
    this.loading = true;
    let params = new HttpParams()
      .set('page', this.page.toString())
      .set('pageSize', this.pageSize.toString());

    if (this.searchTerm) {
      params = params.set('search', this.searchTerm);
    }
    if (this.categoryFilter) {
      params = params.set('categoryId', this.categoryFilter.toString());
    }

    this.http.get<PaginatedResult<Product>>('/api/products', { params }).subscribe({
      next: (data) => {
        this.products = data.items;
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
    this.loadProducts();
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.page = 1;
    this.loadProducts();
  }

  onCategoryFilter(categoryId: number | null): void {
    this.categoryFilter = categoryId;
    this.page = 1;
    this.loadProducts();
  }

  openNew(): void {
    this.editMode = false;
    this.selectedProduct = null;
    this.form.reset({ price: 0, costPrice: 0, stock: 0, isReturnable: false, returnPrice: 0 });
    this.dialogVisible = true;
  }

  editProduct(product: Product): void {
    this.editMode = true;
    this.selectedProduct = product;
    this.form.patchValue({
      name: product.name,
      barcode: product.barcode,
      price: product.price,
      costPrice: product.costPrice,
      stock: product.stock,
      categoryId: product.categoryId,
      isReturnable: product.isReturnable,
      returnPrice: product.returnPrice
    });
    this.dialogVisible = true;
  }

  save(): void {
    if (this.form.invalid) return;

    const payload = this.form.value;

    if (this.editMode && this.selectedProduct) {
      this.http.put(`/api/products/${this.selectedProduct.id}`, payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Product updated' });
          this.dialogVisible = false;
          this.loadProducts();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update product' });
        }
      });
    } else {
      this.http.post('/api/products', payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Product created' });
          this.dialogVisible = false;
          this.loadProducts();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create product' });
        }
      });
    }
  }

  deleteProduct(product: Product): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this product?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.http.delete(`/api/products/${product.id}`).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Product deleted' });
            this.loadProducts();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete product' });
          }
        });
      }
    });
  }
}
