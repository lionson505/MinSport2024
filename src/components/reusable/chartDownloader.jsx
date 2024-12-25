import React, { useRef, useState } from "react";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { saveAs } from "file-saver";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ServerCog, Sheet, Download } from 'lucide-react'; // Added Download icon
import toast from 'react-hot-toast';

const ChartDownloadWrapper = ({ children, chartData, fileName }) => {
  const chartRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  // Helper function to generate timestamp for unique file names
  const getTimestamp = () => {
    const now = new Date();
    return now.toISOString().replace(/[-T:.Z]/g, "_"); // Format like 2024_12_11_150000
  };

  // Function to download as image (PNG/SVG)
  const downloadAsImage = (format) => {
    if (!chartRef.current) return;
    html2canvas(chartRef.current, { scale: 2 }).then((canvas) => {
      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, `${fileName}_${getTimestamp()}.${format}`);
          toast.success(`Your chart has been downloaded as ${format.toUpperCase()}.`);
        }
      }, `image/${format}`);
    });
  };

  // Function to download as Excel with enhanced styling
  const downloadAsExcel = () => {
    if (!chartData || !chartData.datasets || !chartData.datasets[0].data) {
      toast.error("Chart data is missing or incorrect.");
      return;
    }

    const worksheetData = chartData.datasets[0].data.map((value, index) => ({
      Label: chartData.labels[index],
      Value: value,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Chart Data");

    // Define header cell style for Excel
    const headerCellStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } }, // White text
      fill: { patternType: "solid", fgColor: { rgb: "4F81BD" } }, // Blue background
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
      }
    };

    // Define data cell style for Excel
    const dataCellStyle = {
      font: { color: { rgb: "000000" } }, // Black text
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
      }
    };

    // Apply styles to header cells (first row)
    worksheet["A1"].s = headerCellStyle;
    worksheet["B1"].s = headerCellStyle;

    // Apply styles to data cells (rest of the rows)
    Object.keys(worksheet).forEach((key) => {
      if (key[0] !== "!" && !key.includes("1")) {
        worksheet[key].s = dataCellStyle;
      }
    });

    // Set column widths for better visibility
    worksheet["!cols"] = [
      { wch: 20 }, // Column width for 'Label'
      { wch: 15 }, // Column width for 'Value'
    ];

    // Write the workbook to a file
    XLSX.writeFile(workbook, `${fileName}_${getTimestamp()}.xlsx`);
    toast.success("Your chart data has been downloaded as Excel.");
  };

  // Function to download as PDF
  const downloadAsPDF = () => {
    if (!chartRef.current) return;
    html2canvas(chartRef.current, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape" });
      const imgWidth = 280;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add logo or other content to the PDF (logo can be replaced here)
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("Minisports Report", 60, 25);

      pdf.addImage(imgData, "PNG", 10, 40, imgWidth, imgHeight);
      pdf.save(`${fileName}_${getTimestamp()}.pdf`);
      toast.success("Your chart has been downloaded as PDF.");
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative bg-white p-6 rounded-lg shadow-lg"
    >
      <div className="mt-6 flex justify-end">
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200 flex items-center"
          >
            Download Options
            <ChevronDown className="ml-2 h-4 w-4" />
          </button>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-md z-10"
              >
                <div className="py-1">
                  <button
                    onClick={() => {
                      downloadAsImage("png");
                      setIsOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
 Download as PNG
                  </button>
                  <button
                    onClick={() => {
                      downloadAsImage("svg");
                      setIsOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
             Download as SVG
                  </button>
                  <button
                    onClick={() => {
                      downloadAsExcel();
                      setIsOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
Download as Excel
                  </button>
                  <button
                    onClick={() => {
                      downloadAsPDF();
                      setIsOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
 Download as PDF
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <motion.div
        ref={chartRef}
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default ChartDownloadWrapper;
