import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '../ui/Button';
import * as XLSX from 'xlsx';

const ExportButton = ({ data, filename = 'export', type = 'xlsx' }) => {
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const exportToCSV = () => {
    const headers = Object.keys(data[0]).join(',');
    const csvData = data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' ? `"${value}"` : value
      ).join(',')
    );
    const csv = [headers, ...csvData].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="relative group">
      <Button
        variant="outline"
        onClick={() => type === 'xlsx' ? exportToExcel() : exportToCSV()}
        className="flex items-center space-x-2"
      >
        <Download className="h-4 w-4" />
        <span>Export {type.toUpperCase()}</span>
      </Button>
    </div>
  );
};

export default ExportButton; 