import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Button } from "../../components/ui/Button";
import { Printer, FileText, FileSpreadsheet, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PrintButton = ({ children, title = "MIS REPORT", className = '' }) => {
  const [loading, setLoading] = useState(false);

  const handlePrint = () => window.print();

  const handleExport = async (type) => {
    setLoading(true);
    try {
      if (type === 'pdf') {
        await exportToPDF();
      } else if (type === 'excel') {
        await exportToExcel();
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    return new Promise((resolve, reject) => {
      const doc = new jsPDF();
      const image = new Image();
      image.src = '/logo/logo.png';

      image.onload = () => {
        doc.addImage(image, 'PNG', 10, 10, 40, 40);
        doc.setFontSize(24);
        doc.setTextColor(41, 128, 185);
        doc.text('MINISTRY OF SPORTS', 105, 20, null, null, 'center');

        doc.setFontSize(18);
        doc.setTextColor(0);
        doc.text(title, 105, 30, null, null, 'center');
        doc.setFontSize(12);
        const date = new Date().toLocaleDateString();
        doc.text(`Report Date: ${date}`, 105, 40, null, null, 'center');

        // Filtered Table Content (Exclude Operation Column)
        const table = document.querySelector('.content-to-export table');
        if (table) {
          const filteredData = Array.from(table.rows).map((row) => {
            return Array.from(row.cells)
              .filter((_, index) => !row.cells[index].classList.contains('operation')) // Exclude operation column
              .map((cell) => cell.innerText);
          });

          autoTable(doc, {
            head: [filteredData[0]],
            body: filteredData.slice(1),
            startY: 60,
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            styles: { fontSize: 10, cellPadding: 4 },
          });
          doc.save(`${title}.pdf`);
          resolve();
        } else {
          doc.text('No table content available.', 10, 60);
          toast.error("No table content available.");
          resolve();
        }
      };

      image.onerror = () => {
        toast.error("Failed to load logo. Ensure the PNG is valid.");
        reject("Logo image failed to load.");
      };
    });
  };

  const exportToExcel = async () => {
    const table = document.querySelector('.content-to-export table');

    if (!table) {
      toast.error('No table found to export!');
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Report');

      const imageData = await fetch('/logo/logo.png').then((res) => res.blob());
      const image = await imageData.arrayBuffer();
      const imageId = workbook.addImage({
        buffer: image,
        extension: 'png',
      });
      worksheet.addImage(imageId, {
        tl: { col: 0, row: 0 },
        ext: { width: 200, height: 75 },
      });

      const date = new Date().toLocaleDateString();
      worksheet.addRow([]);
      worksheet.addRow(['MINISTRY OF SPORTS']);
      worksheet.mergeCells('A2:D2');
      worksheet.getRow(2).font = { size: 16, bold: true, color: { argb: '2980B9' } };
      worksheet.getRow(2).alignment = { horizontal: 'center' };

      worksheet.addRow([title]);
      worksheet.mergeCells('A3:D3');
      worksheet.getRow(3).font = { size: 14, bold: true };
      worksheet.getRow(3).alignment = { horizontal: 'center' };

      worksheet.addRow([`Report Date: ${date}`]);
      worksheet.mergeCells('A4:D4');
      worksheet.getRow(4).font = { size: 12, italic: true };
      worksheet.getRow(4).alignment = { horizontal: 'center' };
      worksheet.addRow([]);

      Array.from(table.rows).forEach((row) => {
        const cells = Array.from(row.cells)
          .filter((cell) => !cell.classList.contains('operation')) // Exclude operation column
          .map((cell) => cell.innerText);
        worksheet.addRow(cells);
      });

      worksheet.columns.forEach((col) => (col.width = 25));
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `${title}.xlsx`);
      toast.success('Excel exported successfully!');
    } catch (error) {
      console.error('Excel export failed:', error);
      toast.error('Excel export failed. Check console for details.');
    }
  };

  return (
    <div className={`print-wrapper ${className}`}>
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-300">
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <div className="flex items-center gap-4">
            <img
              src="/logo/logo.png"
              alt="Ministry Logo"
              className="hidden print:block h-16 w-16 object-contain"
            />
            <h1 className="hidden print:block text-3xl font-semibold text-blue-700">
              MINISTRY OF SPORTS
            </h1>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handlePrint}
              disabled={loading}
              className="print:hidden bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Printer className="mr-2 h-5 w-5" />
              Print
            </Button>
            <Button
              onClick={() => handleExport('pdf')}
              disabled={loading}
              className="print:hidden bg-red-500 hover:bg-red-600 text-white"
            >
              {loading ? <Loader className="animate-spin mr-2 h-5 w-5" /> : <FileText className="mr-2 h-5 w-5" />}
              Export PDF
            </Button>
            <Button
              onClick={() => handleExport('excel')}
              disabled={loading}
              className="print:hidden bg-green-500 hover:bg-green-600 text-white"
            >
              {loading ? <Loader className="animate-spin mr-2 h-5 w-5" /> : <FileSpreadsheet className="mr-2 h-5 w-5" />}
              Export Excel
            </Button>
          </div>
        </div>

        <div className="content-to-export bg-gray-50 rounded p-6 border border-gray-200">
          {children}
        </div>
      </div>

      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-wrapper,
            .print-wrapper * {
              visibility: visible;
            }
            .print-wrapper {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 2rem;
            }
            th.operation, td.operation {
              display: none !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default PrintButton;
