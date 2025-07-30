# Strapi API Endpoints for Jewelry Management System

## Required Content Types in Strapi

### 1. Products Collection Type
**API ID:** `products`
**Display Name:** Products

#### Fields:
- `name` (Text) - Product name
- `sku` (Text) - Stock Keeping Unit (auto-generated)
- `category` (Text) - Product category
- `subcategory` (Text) - Product subcategory (optional)
- `description` (Rich Text) - Product description (optional)
- `weight` (Number - Decimal) - Weight in grams
- `purity` (Text) - Gold/Silver purity (22K, 18K, etc.)
- `making_charges` (Number - Decimal) - Making charges
- `stone_charges` (Number - Decimal) - Stone charges (optional)
- `other_charges` (Number - Decimal) - Other charges (optional)
- `total_amount` (Number - Decimal) - Total calculated amount
- `stock_quantity` (Number - Integer) - Current stock quantity
- `min_stock_level` (Number - Integer) - Minimum stock level for alerts
- `supplier` (Text) - Supplier name (optional)
- `purchase_date` (Date) - Purchase date (optional)
- `purchase_price` (Number - Decimal) - Purchase price
- `selling_price` (Number - Decimal) - Selling price
- `discount_percentage` (Number - Decimal) - Discount percentage (optional)
- `tax_percentage` (Number - Decimal) - Tax percentage (default: 18)
- `barcode` (Text) - Generated barcode
- `images` (Media - Multiple) - Product images (optional)
- `status` (Enumeration) - Values: active, inactive, out_of_stock
- `location` (Text) - Storage location (optional)
- `notes` (Rich Text) - Additional notes (optional)

### 2. Product Barcodes Collection Type
**API ID:** `product-barcodes`
**Display Name:** Product Barcodes

#### Fields:
- `product_id` (Number - Integer) - Related product ID
- `barcode` (Text) - Barcode value
- `barcode_type` (Enumeration) - Values: CODE128, EAN13, QR
- `generated_at` (DateTime) - Generation timestamp
- `printed_count` (Number - Integer) - Print count (default: 0)
- `is_active` (Boolean) - Active status (default: true)

## API Endpoints Used by the Application

### Products Endpoints:
- `GET /api/products` - Get all products with filters
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Product Barcodes Endpoints:
- `GET /api/product-barcodes` - Get all barcodes
- `GET /api/product-barcodes/:id` - Get single barcode
- `POST /api/product-barcodes` - Create new barcode
- `PUT /api/product-barcodes/:id` - Update barcode
- `DELETE /api/product-barcodes/:id` - Delete barcode

### Authentication Endpoints:
- `POST /api/auth/local` - Login
- `POST /api/auth/local/register` - Register
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password

## Strapi Configuration Steps:

1. **Create Content Types:**
   - Go to Content-Type Builder
   - Create "Products" collection type with above fields
   - Create "Product Barcodes" collection type with above fields

2. **Set Permissions:**
   - Go to Settings > Roles & Permissions
   - For Authenticated users, enable:
     - Products: find, findOne, create, update, delete
     - Product-barcodes: find, findOne, create, update, delete

3. **API Configuration:**
   - Ensure REST API is enabled
   - Set proper CORS settings for your frontend domain

## Sample Data Structure:

### Product:
```json
{
  "data": {
    "name": "Gold Ring",
    "category": "Ring",
    "weight": 5.5,
    "purity": "22K",
    "making_charges": 500,
    "purchase_price": 25000,
    "selling_price": 28000,
    "stock_quantity": 1,
    "min_stock_level": 1,
    "tax_percentage": 18,
    "status": "active"
  }
}
```

### Product Barcode:
```json
{
  "data": {
    "product_id": 1,
    "barcode": "1234567890123",
    "barcode_type": "CODE128",
    "generated_at": "2024-01-01T10:00:00.000Z",
    "printed_count": 0,
    "is_active": true
  }
}
```