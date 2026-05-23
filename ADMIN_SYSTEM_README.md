# Kitch Professional Admin Dashboard System

## Overview

This document describes the enhanced professional admin dashboard system for the Kitch application, featuring comprehensive product management, real-time finance tracking, daily sales logging, and automated report generation.

## Features

### 1. **Product Management Module** (`ProductManagementEnhanced.tsx`)

**Capabilities:**
- Add new products with detailed information
- Update existing products (name, price, cost, stock, description)
- Delete products from inventory
- Track profit margins automatically
- Monitor total stock and sold quantities
- Export inventory to Excel and PDF formats

**Key Metrics:**
- Total Products Count
- Total Stock Quantity
- Total Items Sold (Lifetime)
- Total Revenue Generated
- Total Profit Earned

**Fields:**
- Product Name (Required)
- Category (Required)
- Selling Price in ETB (Required)
- Cost Price in ETB (for profit calculation)
- Stock Quantity
- Description
- Image URL
- Profit Margin % (Auto-calculated)

### 2. **Daily Sales Log Module** (`DailySalesLog.tsx`)

**Capabilities:**
- Record daily sales with automatic profit calculation
- Filter sales by date
- Track individual sale details (product, quantity, price, cost, profit)
- View daily statistics in real-time
- Export daily reports to PDF and Excel

**Daily Statistics Tracked:**
- Total Items Sold
- Different Products Sold Count
- Total Revenue (ETB)
- Total Cost (ETB)
- Daily Profit (ETB)

**Sale Record Fields:**
- Product Name
- Quantity Sold
- Unit Price (ETB)
- Unit Cost (ETB)
- Sale Notes
- Automatic Profit Calculation
- Timestamp

### 3. **Finance Management Module** (`FinanceManagementEnhanced.tsx`)

**Capabilities:**
- Monitor monthly financial performance
- Track revenue, expenses, and profit
- View payment status breakdown
- Analyze revenue by category
- Generate monthly reports
- Export financial data to PDF and Excel

**Key Metrics:**
- Total Revenue
- Total Expenses
- Net Profit
- Profit Margin %
- Collection Rate
- Monthly Revenue Trends
- Category-wise Revenue Breakdown

**Features:**
- Month selector for historical data analysis
- Real-time profit calculation
- Payment status tracking (Paid, Unpaid, Partial)
- 12-month revenue history
- Category revenue visualization

### 4. **Order Management Module** (`OrderManagement.tsx`)

**Capabilities:**
- Create and manage customer orders
- Track order status (Pending, Completed, Cancelled)
- Monitor payment status
- Add multiple items per order
- View order statistics

**Order Fields:**
- Customer Name
- Customer Email
- Order Items (Product, Quantity, Price)
- Order Status
- Payment Status
- Notes

## Export Features

### PDF Export

All modules support PDF export with professional formatting:

**Daily Report PDF:**
- Date and summary metrics
- Itemized sales list
- Profit calculations
- Generated timestamp

**Monthly Report PDF:**
- Month and year header
- Monthly summary statistics
- Daily breakdown table
- Professional formatting with colors

**Product Inventory PDF:**
- Product listing with all details
- Stock and sales information
- Profit tracking
- Professional header and footer

### Excel Export

All modules support Excel export for further analysis:

**Daily Report Excel:**
- Summary section
- Itemized sales data
- Profit calculations
- Professional formatting

**Monthly Report Excel:**
- Monthly summary
- Daily breakdown
- Financial metrics
- Easy data manipulation

**Product Inventory Excel:**
- Complete product catalog
- Stock levels
- Profit information
- Sortable and filterable data

## Database Schema

### Enhanced Tables

#### `products` Table
```
- id (Primary Key)
- name (String, Required)
- description (Text)
- category (String, Required)
- price (Double, Required)
- cost (Double, for profit calculation)
- stock (Integer, default: 0)
- totalSold (Integer, tracks lifetime sales)
- totalProfit (Double, tracks lifetime profit)
- imageUrl (String)
- sku (String, Unique)
- featured (Boolean)
- createdAt (Timestamp)
- updatedAt (Timestamp)
```

#### `daily_sales` Table
```
- id (Primary Key)
- productId (Integer)
- productName (String, Required)
- quantity (Integer, Required)
- unitPrice (Double, Required)
- unitCost (Double, Required)
- totalAmount (Double, quantity × unitPrice)
- totalCost (Double, quantity × unitCost)
- profit (Double, totalAmount - totalCost)
- saleDate (Date, Required)
- saleTime (Timestamp)
- notes (Text)
- createdAt (Timestamp)
```

#### `daily_attendance` Table
```
- id (Primary Key)
- attendanceDate (Date, Required)
- totalItemsSold (Integer)
- totalRevenue (Double)
- totalCost (Double)
- totalProfit (Double)
- itemCount (Integer, different products)
- createdAt (Timestamp)
- updatedAt (Timestamp)
```

## Component Architecture

### File Structure

```
client/src/
├── components/
│   ├── ProductManagementEnhanced.tsx      # Product management with profit tracking
│   ├── DailySalesLog.tsx                  # Daily sales recording and tracking
│   ├── FinanceManagementEnhanced.tsx      # Finance dashboard with exports
│   └── AdminSidebar.tsx                   # Navigation sidebar (updated)
├── lib/
│   └── exportUtils.ts                     # PDF and Excel export utilities
├── pages/
│   └── AdminDashboardComplete.tsx         # Main admin dashboard (updated)
└── drizzle/
    └── schema_enhanced.ts                 # Enhanced database schema
```

### Component Dependencies

```
AdminDashboardComplete (Main)
├── ProductManagementEnhanced
│   └── exportUtils (Excel/PDF)
├── DailySalesLog
│   └── exportUtils (Excel/PDF)
├── FinanceManagementEnhanced
│   └── exportUtils (Excel/PDF)
├── OrderManagement
└── AdminSidebar
```

## Usage Guide

### Adding a Product

1. Navigate to **Products** tab
2. Click **Add Product** button
3. Fill in required fields (Name, Category, Price)
4. Optionally add Cost Price for profit tracking
5. Set initial stock quantity
6. Click **Add Product**

### Recording a Sale

1. Navigate to **Daily Sales** tab
2. Select the date (defaults to today)
3. Click **Record Sale** button
4. Enter product name, quantity, and unit price
5. Optionally add unit cost for profit calculation
6. System automatically calculates profit
7. Click **Record Sale**

### Viewing Financial Reports

1. Navigate to **Finance** tab
2. Select month using month selector
3. View real-time metrics and charts
4. Click **Excel** or **PDF** to export monthly report

### Exporting Reports

**Product Inventory:**
- Go to Products tab
- Click **Excel** or **PDF** button
- File downloads automatically

**Daily Sales Report:**
- Go to Daily Sales tab
- Select date
- Click **Excel** or **PDF** button
- File downloads with date in filename

**Monthly Financial Report:**
- Go to Finance tab
- Select month
- Click **Excel** or **PDF** button
- File downloads with month/year in filename

## Real-Time Features

### Automatic Calculations

- **Profit Calculation:** `Profit = (Unit Price - Unit Cost) × Quantity`
- **Profit Margin:** `Margin % = ((Price - Cost) / Price) × 100`
- **Daily Totals:** Automatically sum all sales for selected date
- **Monthly Totals:** Aggregate all daily sales for selected month

### Real-Time Updates

- Dashboard metrics update immediately after each sale
- Profit tracking updates in real-time
- Stock levels update when products are added/modified
- Finance dashboard reflects latest sales data

## Security Features

- Admin-only access (role-based)
- Firebase authentication
- Protected routes
- User session management
- Logout functionality

## Performance Optimizations

- Lazy loading of components
- Efficient database queries
- Pagination for large datasets
- Optimized PDF/Excel generation
- Cached calculations

## Browser Compatibility

- Chrome/Chromium (Latest)
- Firefox (Latest)
- Safari (Latest)
- Edge (Latest)

## Dependencies

### Core Libraries
- React 19.2.1
- Firebase 12.13.0
- Framer Motion 12.23.22
- TailwindCSS 4.1.14

### Export Libraries
- XLSX (Excel export)
- jsPDF (PDF generation)
- jspdf-autotable (PDF tables)

### UI Components
- Radix UI components
- Lucide React icons
- Sonner (Toast notifications)

## Installation & Setup

### Prerequisites
```bash
Node.js 22.13.0+
npm or pnpm
```

### Install Dependencies
```bash
cd Kitch
npm install --legacy-peer-deps
# or
pnpm install
```

### Install Export Libraries
```bash
npm install xlsx jspdf jspdf-autotable --legacy-peer-deps
```

### Environment Setup
```bash
# Configure Firebase credentials in .env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
# ... other Firebase config
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm run start
```

## API Integration

### Firestore Collections Used

- `products` - Product inventory
- `daily_sales` - Daily sales records
- `daily_attendance` - Daily summaries
- `orders` - Customer orders
- `users` - User management

### Real-Time Listeners

- Product updates trigger inventory refresh
- Sales records update daily statistics
- Finance data aggregates from sales collection

## Troubleshooting

### Export Not Working
- Ensure browser allows downloads
- Check file permissions
- Verify data exists before export

### Missing Data
- Refresh page to sync with database
- Check date filters are correct
- Verify user has admin access

### Performance Issues
- Clear browser cache
- Reduce date range for reports
- Close unused tabs

## Future Enhancements

- Advanced analytics dashboard
- Inventory forecasting
- Automated reorder alerts
- Multi-user collaboration
- API integrations
- Mobile app support
- Advanced filtering options
- Custom report builder

## Support & Maintenance

For issues or feature requests, contact the development team.

## Version History

- **v1.0.0** - Initial release with core features
  - Product Management
  - Daily Sales Logging
  - Finance Management
  - PDF/Excel Export
  - Real-time Profit Tracking

---

**Last Updated:** May 23, 2026
**Status:** Production Ready
