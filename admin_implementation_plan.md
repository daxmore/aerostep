# Admin Dashboard Implementation Plan

This document outlines the phased approach for building the Admin Dashboard for AeroStep.

## Phase 1: Foundation & Security

*Goal: Secure the admin area and establish the core layout.*

### Pages

1. **Admin Login** (`/admin/login`)
    * Separate login screen for admins (or role-based redirect).
2. **Admin Layout**
    * Sidebar navigation (Dashboard, Products, Orders, Users, Settings).
    * Top bar (Admin profile, Logout).
3. **Dashboard Overview** (`/admin/dashboard`)
    * Key Metrics Cards: Total Sales, Total Orders, Total Users, Low Stock Alerts.
    * Recent Orders Table (Mini view).

### Functionalities

- **Role-Based Access Control (RBAC)**: Middleware to ensure only users with `isAdmin: true` can access `/admin/*` routes.
* **Protected Routes**: React Router guards for admin paths.
* **Logout**: Secure admin logout.

### Validations

- **Login**: Email/Password required. Check `isAdmin` flag on server response.

---

## Phase 2: Product Management (CRUD)

*Goal: Allow admins to fully manage the catalog.*

### Pages

1. **Product List** (`/admin/products`)
    * Table view with columns: Image, Name, Price, Category, Stock, Actions (Edit/Delete).
    * Search and Filter (by category).
    * Pagination.
2. **Add Product** (`/admin/products/new`)
    * Form for creating products.
3. **Edit Product** (`/admin/products/:id/edit`)
    * Form pre-filled with existing data.

### Functionalities

- **Create**: Upload images (Cloudinary/Local), set details.
* **Read**: Fetch paginated products.
* **Update**: Modify details, update stock, change images.
* **Delete**: Soft delete or hard delete products.

### Validations

- **Client-Side**:
  * Name: Required, min 3 chars.
  * Price: Required, positive number.
  * Stock: Required, non-negative integer.
  * Description: Required, min 20 chars.
  * Image: File type (jpg/png/webp), max size (5MB).
* **Server-Side**:
  * Strict type checks (Price must be number).
  * Sanitization of HTML in description.

---

## Phase 3: Order Management

*Goal: Process orders and manage fulfillment.*

### Pages

1. **Order List** (`/admin/orders`)
    * Table view: Order ID, Customer, Date, Total, Status (Badge), Actions.
    * Filter by Status (Pending, Processing, Shipped, Delivered).
2. **Order Details** (`/admin/orders/:id`)
    * Customer info, Shipping Address, Order Items, Payment Status.
    * Status Update Controls.

### Functionalities

- **View**: Detailed breakdown of an order.
* **Update Status**: Change status dropdown (e.g., mark as Shipped).
* **Cancel Order**: Admin override to cancel orders.

### Validations

- **Status Update**: Ensure valid status transition (e.g., cannot go from 'Delivered' to 'Pending').
* **ID Check**: Validate Order ID format.

---

## Phase 4: User Management

*Goal: Manage customer accounts and permissions.*

### Pages

1. **User List** (`/admin/users`)
    * Table view: Name, Email, Role, Joined Date, Actions.
2. **User Details** (`/admin/users/:id`)
    * View order history, addresses.

### Functionalities

- **View Users**: List all registered users.
* **Promote/Demote**: Make a user an admin (Super Admin only).
* **Delete/Ban**: Remove access for bad actors.

### Validations

- **Self-Protection**: Prevent admin from deleting their own account.
* **Role Validation**: Ensure only Super Admin can modify other admins.

---

## Technical Stack Additions

- **Charts**: `recharts` or `chart.js` for Dashboard analytics.
* **Tables**: `tanstack-table` (optional) or custom table components for sorting/pagination.
* **Icons**: `lucide-react` (already installed).
