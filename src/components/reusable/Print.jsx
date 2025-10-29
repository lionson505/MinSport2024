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
      const doc = new jsPDF('landscape'); // Use landscape orientation for better table display
      const image = new Image();
      image.src = '/logo/logo.png';

      image.onload = () => {
        // Header with logo and title
        doc.addImage(image, 'PNG', 15, 10, 30, 30);
        
        // Ministry title
        doc.setFontSize(20);
        doc.setTextColor(41, 128, 185);
        doc.setFont(undefined, 'bold');
        doc.text('MINISTRY OF SPORTS', 150, 20, null, null, 'center');

        // Report title
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'bold');
        doc.text(title, 150, 30, null, null, 'center');
        
        // Date and additional info
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        const date = new Date().toLocaleDateString();
        doc.text(`Report Generated: ${date}`, 150, 38, null, null, 'center');
        
        // Add a line separator
        doc.setDrawColor(41, 128, 185);
        doc.setLineWidth(0.5);
        doc.line(15, 45, 285, 45);

        // Get table data
        const table = document.querySelector('.content-to-export table');
        if (table) {
          const rows = Array.from(table.rows);
          const headers = Array.from(rows[0].cells)
            .filter((cell, index) => !cell.classList.contains('operation'))
            .map((cell) => cell.innerText.trim());
          
          const bodyData = rows.slice(1).map((row) => {
            return Array.from(row.cells)
              .filter((cell, index) => !cell.classList.contains('operation'))
              .map((cell) => {
                // Clean up cell content - remove extra spaces and line breaks
                let content = cell.innerText.trim();
                // Handle badge content (like sports disciplines and sections)
                if (cell.querySelector('.bg-blue-100, .bg-purple-100, .bg-green-100')) {
                  const badges = Array.from(cell.querySelectorAll('span')).map(span => span.innerText.trim());
                  content = badges.join(', ');
                }
                return content;
              });
          });

          // Define column widths based on content type - optimized for landscape A4
          const columnStyles = {
            0: { cellWidth: 25 }, // Name
            1: { cellWidth: 18 }, // Domain
            2: { cellWidth: 20 }, // Category
            3: { cellWidth: 12 }, // Students
            4: { cellWidth: 20 }, // Province
            5: { cellWidth: 20 }, // District
            6: { cellWidth: 18 }, // Sector
            7: { cellWidth: 25 }, // Legal Representative
            8: { cellWidth: 22 }, // Contact
            9: { cellWidth: 28 }, // Sports Disciplines
            10: { cellWidth: 12 }, // No. of Sports
            11: { cellWidth: 25 }, // Sections/Teams
          };

          autoTable(doc, {
            head: [headers],
            body: bodyData,
            startY: 55,
            theme: 'striped',
            headStyles: { 
              fillColor: [41, 128, 185], 
              textColor: 255,
              fontSize: 7,
              fontStyle: 'bold',
              halign: 'center',
              valign: 'middle'
            },
            bodyStyles: {
              fontSize: 6,
              cellPadding: 2,
              valign: 'top'
            },
            alternateRowStyles: {
              fillColor: [245, 245, 245]
            },
            columnStyles: columnStyles,
            styles: {
              overflow: 'linebreak',
              cellWidth: 'wrap',
              fontSize: 7,
              cellPadding: 2,
              halign: 'left'
            },
            margin: { top: 55, left: 10, right: 10 },
            tableWidth: 'wrap',
            didDrawPage: function (data) {
              // Add page numbers
              doc.setFontSize(8);
              doc.setTextColor(128, 128, 128);
              doc.text('Page ' + doc.internal.getNumberOfPages(), 280, 200, null, null, 'right');
            }
          });
          
          doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\//g, '-')}.pdf`);
          toast.success('PDF exported successfully!');
          resolve();
        } else {
          doc.setFontSize(12);
          doc.text('No table content available for export.', 150, 80, null, null, 'center');
          doc.save(`${title}_empty.pdf`);
          toast.error("No table content available.");
          resolve();
        }
      };

      image.onerror = () => {
        // Continue without logo if it fails to load
        console.warn("Logo failed to load, continuing without logo");
        
        const doc = new jsPDF('landscape');
        
        // Header without logo
        doc.setFontSize(20);
        doc.setTextColor(41, 128, 185);
        doc.setFont(undefined, 'bold');
        doc.text('MINISTRY OF SPORTS', 150, 20, null, null, 'center');

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text(title, 150, 30, null, null, 'center');
        
        const date = new Date().toLocaleDateString();
        doc.setFontSize(10);
        doc.text(`Report Generated: ${date}`, 150, 38, null, null, 'center');
        
        doc.setDrawColor(41, 128, 185);
        doc.setLineWidth(0.5);
        doc.line(15, 45, 285, 45);

        const table = document.querySelector('.content-to-export table');
        if (table) {
          const rows = Array.from(table.rows);
          const headers = Array.from(rows[0].cells)
            .filter((cell) => !cell.classList.contains('operation'))
            .map((cell) => cell.innerText.trim());
          
          const bodyData = rows.slice(1).map((row) => {
            return Array.from(row.cells)
              .filter((cell) => !cell.classList.contains('operation'))
              .map((cell) => {
                let content = cell.innerText.trim();
                if (cell.querySelector('.bg-blue-100, .bg-purple-100, .bg-green-100')) {
                  const badges = Array.from(cell.querySelectorAll('span')).map(span => span.innerText.trim());
                  content = badges.join(', ');
                }
                return content;
              });
          });

          const columnStyles = {
            0: { cellWidth: 25 }, // Name
            1: { cellWidth: 18 }, // Domain
            2: { cellWidth: 20 }, // Category
            3: { cellWidth: 12 }, // Students
            4: { cellWidth: 20 }, // Province
            5: { cellWidth: 20 }, // District
            6: { cellWidth: 18 }, // Sector
            7: { cellWidth: 25 }, // Legal Representative
            8: { cellWidth: 22 }, // Contact
            9: { cellWidth: 28 }, // Sports Disciplines
            10: { cellWidth: 12 }, // No. of Sports
            11: { cellWidth: 25 }, // Sections/Teams
          };

          autoTable(doc, {
            head: [headers],
            body: bodyData,
            startY: 55,
            theme: 'striped',
            headStyles: { 
              fillColor: [41, 128, 185], 
              textColor: 255,
              fontSize: 7,
              fontStyle: 'bold',
              halign: 'center'
            },
            bodyStyles: {
              fontSize: 6,
              cellPadding: 2,
              valign: 'top'
            },
            columnStyles: columnStyles,
            styles: { 
              fontSize: 7, 
              cellPadding: 2,
              overflow: 'linebreak',
              cellWidth: 'wrap'
            },
            margin: { top: 55, left: 10, right: 10 },
            tableWidth: 'wrap'
          });
        }
        
        doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\//g, '-')}.pdf`);
        resolve();
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
