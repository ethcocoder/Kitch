import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface SaleRecord {
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  profit: number;
  saleDate: string;
}

interface DailyReport {
  date: string;
  totalItemsSold: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  items: SaleRecord[];
}

interface MonthlyReport {
  month: string;
  year: number;
  totalItemsSold: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  dailyBreakdown: DailyReport[];
}

/**
 * Export daily sales report to PDF
 */
export const exportDailyReportPDF = (report: DailyReport) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Header
  doc.setFontSize(20);
  doc.text('Daily Sales Report', pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Date: ${report.date}`, 15, 30);
  
  // Summary metrics
  doc.setFontSize(11);
  doc.setTextColor(0, 102, 204);
  doc.text('Summary', 15, 40);
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  const summaryY = 50;
  doc.text(`Total Items Sold: ${report.totalItemsSold}`, 15, summaryY);
  doc.text(`Total Revenue: ETB ${report.totalRevenue.toFixed(2)}`, 15, summaryY + 7);
  doc.text(`Total Cost: ETB ${report.totalCost.toFixed(2)}`, 15, summaryY + 14);
  doc.text(`Total Profit: ETB ${report.totalProfit.toFixed(2)}`, 15, summaryY + 21);
  
  // Sales details table
  const tableData = report.items.map((item) => [
    item.productName,
    item.quantity.toString(),
    `ETB ${item.unitPrice.toFixed(2)}`,
    `ETB ${item.totalAmount.toFixed(2)}`,
    `ETB ${item.profit.toFixed(2)}`,
  ]);
  
  autoTable(doc, {
    head: [['Product', 'Qty', 'Unit Price', 'Total Amount', 'Profit']],
    body: tableData,
    startY: summaryY + 35,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 102, 204],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    bodyStyles: {
      textColor: [0, 0, 0],
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
    },
  });
  
  // Footer
  doc.setFontSize(9);
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Generated on ${new Date().toLocaleString()}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );
  
  doc.save(`Daily_Report_${report.date}.pdf`);
};

/**
 * Export monthly sales report to PDF
 */
export const exportMonthlyReportPDF = (report: MonthlyReport) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Header
  doc.setFontSize(20);
  doc.text('Monthly Sales Report', pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`${report.month} ${report.year}`, 15, 30);
  
  // Summary metrics
  doc.setFontSize(11);
  doc.setTextColor(0, 102, 204);
  doc.text('Monthly Summary', 15, 40);
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  const summaryY = 50;
  doc.text(`Total Items Sold: ${report.totalItemsSold}`, 15, summaryY);
  doc.text(`Total Revenue: ETB ${report.totalRevenue.toFixed(2)}`, 15, summaryY + 7);
  doc.text(`Total Cost: ETB ${report.totalCost.toFixed(2)}`, 15, summaryY + 14);
  doc.text(`Total Profit: ETB ${report.totalProfit.toFixed(2)}`, 15, summaryY + 21);
  
  // Daily breakdown table
  const tableData = report.dailyBreakdown.map((day) => [
    day.date,
    day.totalItemsSold.toString(),
    `ETB ${day.totalRevenue.toFixed(2)}`,
    `ETB ${day.totalCost.toFixed(2)}`,
    `ETB ${day.totalProfit.toFixed(2)}`,
  ]);
  
  autoTable(doc, {
    head: [['Date', 'Items Sold', 'Revenue', 'Cost', 'Profit']],
    body: tableData,
    startY: summaryY + 35,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 102, 204],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    bodyStyles: {
      textColor: [0, 0, 0],
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
    },
  });
  
  // Footer
  doc.setFontSize(9);
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Generated on ${new Date().toLocaleString()}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );
  
  doc.save(`Monthly_Report_${report.month}_${report.year}.pdf`);
};

/**
 * Export daily sales report to Excel
 */
export const exportDailyReportExcel = (report: DailyReport) => {
  const ws = XLSX.utils.json_to_sheet([
    {
      'Daily Sales Report': '',
      '': '',
      '': '',
      '': '',
      '': '',
    },
    {
      'Date': report.date,
      '': '',
      '': '',
      '': '',
      '': '',
    },
    {
      '': '',
      '': '',
      '': '',
      '': '',
      '': '',
    },
    {
      'Summary': '',
      '': '',
      '': '',
      '': '',
      '': '',
    },
    {
      'Total Items Sold': report.totalItemsSold,
      '': '',
      '': '',
      '': '',
      '': '',
    },
    {
      'Total Revenue': `ETB ${report.totalRevenue.toFixed(2)}`,
      '': '',
      '': '',
      '': '',
      '': '',
    },
    {
      'Total Cost': `ETB ${report.totalCost.toFixed(2)}`,
      '': '',
      '': '',
      '': '',
      '': '',
    },
    {
      'Total Profit': `ETB ${report.totalProfit.toFixed(2)}`,
      '': '',
      '': '',
      '': '',
      '': '',
    },
    {
      '': '',
      '': '',
      '': '',
      '': '',
      '': '',
    },
    {
      'Product': 'Quantity',
      'Unit Price': 'Total Amount',
      'Profit': '',
      '': '',
      '': '',
    },
  ]);
  
  // Add sales items
  const items = report.items.map((item) => ({
    'Product': item.productName,
    'Quantity': item.quantity,
    'Unit Price': `ETB ${item.unitPrice.toFixed(2)}`,
    'Total Amount': `ETB ${item.totalAmount.toFixed(2)}`,
    'Profit': `ETB ${item.profit.toFixed(2)}`,
  }));
  
  XLSX.utils.sheet_add_json(ws, items, { startRow: 9 });
  
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Daily Report');
  XLSX.writeFile(wb, `Daily_Report_${report.date}.xlsx`);
};

/**
 * Export monthly sales report to Excel
 */
export const exportMonthlyReportExcel = (report: MonthlyReport) => {
  const ws = XLSX.utils.json_to_sheet([
    {
      'Monthly Sales Report': '',
      '': '',
      '': '',
      '': '',
      '': '',
    },
    {
      'Month': `${report.month} ${report.year}`,
      '': '',
      '': '',
      '': '',
      '': '',
    },
    {
      '': '',
      '': '',
      '': '',
      '': '',
      '': '',
    },
    {
      'Monthly Summary': '',
      '': '',
      '': '',
      '': '',
      '': '',
    },
    {
      'Total Items Sold': report.totalItemsSold,
      '': '',
      '': '',
      '': '',
      '': '',
    },
    {
      'Total Revenue': `ETB ${report.totalRevenue.toFixed(2)}`,
      '': '',
      '': '',
      '': '',
      '': '',
    },
    {
      'Total Cost': `ETB ${report.totalCost.toFixed(2)}`,
      '': '',
      '': '',
      '': '',
      '': '',
    },
    {
      'Total Profit': `ETB ${report.totalProfit.toFixed(2)}`,
      '': '',
      '': '',
      '': '',
      '': '',
    },
    {
      '': '',
      '': '',
      '': '',
      '': '',
      '': '',
    },
    {
      'Date': 'Items Sold',
      'Revenue': 'Cost',
      'Profit': '',
      '': '',
      '': '',
    },
  ]);
  
  // Add daily breakdown
  const dailyData = report.dailyBreakdown.map((day) => ({
    'Date': day.date,
    'Items Sold': day.totalItemsSold,
    'Revenue': `ETB ${day.totalRevenue.toFixed(2)}`,
    'Cost': `ETB ${day.totalCost.toFixed(2)}`,
    'Profit': `ETB ${day.totalProfit.toFixed(2)}`,
  }));
  
  XLSX.utils.sheet_add_json(ws, dailyData, { startRow: 9 });
  
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Monthly Report');
  XLSX.writeFile(wb, `Monthly_Report_${report.month}_${report.year}.xlsx`);
};

/**
 * Export product inventory to Excel
 */
export const exportProductInventoryExcel = (products: any[]) => {
  const data = products.map((product) => ({
    'Product Name': product.name,
    'Category': product.category,
    'Price (ETB)': product.price,
    'Cost (ETB)': product.cost || 0,
    'Stock': product.stock,
    'Total Sold': product.totalSold || 0,
    'Total Profit (ETB)': product.totalProfit || 0,
    'Created Date': new Date(product.createdAt).toLocaleDateString(),
  }));
  
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
  XLSX.writeFile(wb, `Product_Inventory_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Export product inventory to PDF
 */
export const exportProductInventoryPDF = (products: any[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Header
  doc.setFontSize(20);
  doc.text('Product Inventory Report', pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 15, 30);
  
  // Inventory table
  const tableData = products.map((product) => [
    product.name,
    product.category,
    `ETB ${product.price.toFixed(2)}`,
    `ETB ${(product.cost || 0).toFixed(2)}`,
    product.stock.toString(),
    (product.totalSold || 0).toString(),
    `ETB ${(product.totalProfit || 0).toFixed(2)}`,
  ]);
  
  autoTable(doc, {
    head: [['Product', 'Category', 'Price', 'Cost', 'Stock', 'Sold', 'Profit']],
    body: tableData,
    startY: 40,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 102, 204],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    bodyStyles: {
      textColor: [0, 0, 0],
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
    },
  });
  
  // Footer
  doc.setFontSize(9);
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Generated on ${new Date().toLocaleString()}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );
  
  doc.save(`Product_Inventory_${new Date().toISOString().split('T')[0]}.pdf`);
};
