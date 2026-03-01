// Auth
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  employee: Employee;
}

// Employee
export interface Employee {
  id: number;
  name: string;
  username: string;
  role: string;
  isActive: boolean;
}

// Category
export interface Category {
  id: number;
  name: string;
  description: string;
}

// Product
export interface Product {
  id: number;
  name: string;
  barcode: string;
  price: number;
  costPrice: number;
  stock: number;
  isReturnable: boolean;
  returnPrice: number;
  categoryId: number;
  categoryName: string;
}

// Client
export interface Client {
  id: number;
  name: string;
  phone: string;
  address: string;
}

export interface ClientBalance {
  id: number;
  name: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalPaid: number;
  balance: number;
}

// Order
export interface Order {
  id: number;
  orderNumber: string;
  clientId: number;
  clientName: string;
  orderDate: string;
  status: string;
  discount: number;
  subTotal: number;
  total: number;
  paidAmount: number;
  remaining: number;
  notes: string;
}

export interface OrderDetail {
  id: number;
  orderNumber: string;
  clientId: number;
  clientName: string;
  orderDate: string;
  status: string;
  discount: number;
  subTotal: number;
  total: number;
  paidAmount: number;
  remaining: number;
  notes: string;
  items: OrderItem[];
  payments: OrderPayment[];
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  isReturned: boolean;
  returnPrice: number;
}

export interface OrderPayment {
  id: number;
  orderId: number;
  amount: number;
  paymentDate: string;
  notes: string;
}

// Supplier
export interface Supplier {
  id: number;
  name: string;
  phone: string;
  address: string;
}

export interface SupplierBalance {
  id: number;
  name: string;
  phone: string;
  address: string;
  totalInvoices: number;
  totalPaid: number;
  balance: number;
}

// Supplier Invoice
export interface SupplierInvoice {
  id: number;
  invoiceNumber: string;
  supplierId: number;
  supplierName: string;
  invoiceDate: string;
  total: number;
  paidAmount: number;
  remaining: number;
  notes: string;
}

export interface SupplierInvoiceDetail {
  id: number;
  invoiceNumber: string;
  supplierId: number;
  supplierName: string;
  invoiceDate: string;
  total: number;
  paidAmount: number;
  remaining: number;
  notes: string;
  items: SupplierInvoiceItem[];
  payments: SupplierInvoicePayment[];
}

export interface SupplierInvoiceItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  total: number;
}

export interface SupplierInvoicePayment {
  id: number;
  supplierInvoiceId: number;
  amount: number;
  paymentDate: string;
  notes: string;
}

// Payments
export interface ClientPayment {
  id: number;
  clientId: number;
  clientName: string;
  amount: number;
  paymentDate: string;
  notes: string;
}

export interface SupplierPayment {
  id: number;
  supplierId: number;
  supplierName: string;
  amount: number;
  paymentDate: string;
  notes: string;
}

// Dashboard
export interface DashboardDto {
  totalProducts: number;
  totalOrders: number;
  totalClients: number;
  totalSuppliers: number;
  todayOrders: number;
  todaySales: number;
  recentOrders: RecentOrderDto[];
}

export interface RecentOrderDto {
  id: number;
  orderNumber: string;
  clientName: string;
  totalAmount: number;
  status: string;
  orderDate: string;
}

// Generic
export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors: string[];
}
