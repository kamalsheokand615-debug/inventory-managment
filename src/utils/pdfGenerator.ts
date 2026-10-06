import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import { SaleRecord, AppSettings } from '../types';

/**
 * Downloads a high-resolution PDF invoice generated from the DOM element.
 * Uses html2canvas-pro to support modern Tailwind CSS v4 color formats like oklch(),
 * with a resilient vector fallback if canvas fails for any reason.
 */
export async function downloadInvoicePDF(
  receiptElement: HTMLElement,
  invoice: SaleRecord,
  settings: AppSettings
): Promise<boolean> {
  const storeSlug = (settings.businessName || 'Store').replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Bill_${invoice.invoiceNo || 'INV'}_${storeSlug}.pdf`;

  try {
    // Generate high resolution canvas using html2canvas-pro (supports oklch, lab, lch)
    const canvas = await html2canvas(receiptElement, {
      scale: 2.5,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: receiptElement.scrollWidth || 380,
      windowHeight: receiptElement.scrollHeight || 600,
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Receipt width: 80mm standard POS format
    const pdfWidth = 80; // in mm
    const pdfHeight = Math.max((canvas.height * pdfWidth) / canvas.width, 60);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [pdfWidth, pdfHeight],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(fileName);
    return true;
  } catch (canvasError) {
    console.warn('Canvas PDF rendering failed, falling back to direct vector PDF:', canvasError);
    return generateDirectVectorPDF(invoice, settings, fileName);
  }
}

/**
 * Bulletproof fallback that writes a clean vector POS invoice PDF directly using jsPDF
 * in case any DOM/canvas/CSS parser error occurs.
 */
function generateDirectVectorPDF(
  invoice: SaleRecord,
  settings: AppSettings,
  fileName: string
): boolean {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 160 + invoice.items.length * 8],
    });

    let y = 10;
    const margin = 6;
    const pageWidth = 80;
    const rightMargin = pageWidth - margin;

    // Store Name & Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(settings.businessName || 'My Store', pageWidth / 2, y, { align: 'center' });
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    if (settings.businessAddress) {
      doc.text(settings.businessAddress, pageWidth / 2, y, { align: 'center' });
      y += 4;
    }
    if (settings.businessPhone) {
      doc.text(`Tel: ${settings.businessPhone}`, pageWidth / 2, y, { align: 'center' });
      y += 4;
    }
    if (settings.gstNumber) {
      doc.text(`GSTIN: ${settings.gstNumber}`, pageWidth / 2, y, { align: 'center' });
      y += 4;
    }

    // Divider
    y += 2;
    doc.setLineDashPattern([1, 1], 0);
    doc.line(margin, y, rightMargin, y);
    doc.setLineDashPattern([], 0);
    y += 4;

    // Bill Meta
    doc.setFontSize(8);
    doc.text(`Bill No: ${invoice.invoiceNo}`, margin, y);
    const dateStr = new Date(invoice.timestamp).toLocaleDateString();
    doc.text(`Date: ${dateStr}`, rightMargin, y, { align: 'right' });
    y += 4;

    if (invoice.customerName) {
      doc.text(`Customer: ${invoice.customerName}`, margin, y);
      if (invoice.customerPhone) {
        doc.text(invoice.customerPhone, rightMargin, y, { align: 'right' });
      }
      y += 4;
    }

    // Table Header
    y += 2;
    doc.line(margin, y, rightMargin, y);
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.text('Item', margin, y);
    doc.text('Qty x Rate', 44, y, { align: 'center' });
    doc.text('Amount', rightMargin, y, { align: 'right' });
    y += 2;
    doc.line(margin, y, rightMargin, y);
    y += 4;

    // Items
    doc.setFont('helvetica', 'normal');
    invoice.items.forEach(item => {
      const name = item.name.length > 20 ? item.name.substring(0, 18) + '..' : item.name;
      doc.text(name, margin, y);
      doc.text(`${item.quantity} ${item.unit} x ${item.sellingPrice}`, 44, y, { align: 'center' });
      doc.text(`${settings.currency} ${item.subtotal.toFixed(2)}`, rightMargin, y, { align: 'right' });
      y += 4.5;
    });

    // Divider
    y += 1;
    doc.line(margin, y, rightMargin, y);
    y += 4;

    if (invoice.discount && invoice.discount > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('Subtotal:', margin, y);
      doc.text(`${settings.currency} ${(invoice.subtotal || invoice.totalAmount + invoice.discount).toFixed(2)}`, rightMargin, y, { align: 'right' });
      y += 4;
      doc.text('Discount:', margin, y);
      doc.text(`-${settings.currency} ${invoice.discount.toFixed(2)}`, rightMargin, y, { align: 'right' });
      y += 4;
    }

    // Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Total Payable:', margin, y);
    doc.text(`${settings.currency} ${invoice.totalAmount.toFixed(2)}`, rightMargin, y, { align: 'right' });
    y += 6;

    // Payment method & details
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    let payStr = `Payment: ${invoice.paymentMethod.toUpperCase()}`;
    if (invoice.paymentMethod === 'upi' && invoice.paymentDetails?.upiRef) {
      payStr += ` (UTR: ${invoice.paymentDetails.upiRef})`;
    } else if (invoice.paymentMethod === 'card' && invoice.paymentDetails?.cardLast4) {
      payStr += ` (${invoice.paymentDetails.cardType || 'Card'} ••${invoice.paymentDetails.cardLast4})`;
    } else if (invoice.paymentMethod === 'cash' && invoice.paymentDetails?.cashTendered) {
      payStr += ` (Rec: ${settings.currency}${invoice.paymentDetails.cashTendered}`;
      if (invoice.paymentDetails.cashChange) {
        payStr += `, Chg: ${settings.currency}${invoice.paymentDetails.cashChange}`;
      }
      payStr += `)`;
    } else if (invoice.paymentMethod === 'credit' && invoice.paymentDetails?.creditDueDate) {
      payStr += ` (Due: ${invoice.paymentDetails.creditDueDate})`;
    }
    doc.text(payStr, margin, y);
    y += 5;

    // Footer
    doc.text('Thank you! Visit again.', pageWidth / 2, y, { align: 'center' });

    doc.save(fileName);
    return true;
  } catch (err) {
    console.error('Direct vector PDF failed as well:', err);
    return false;
  }
}

/**
 * Direct print helper: Creates a temporary print iframe with only the bill content
 * and executes print safely without printing surrounding UI or getting blocked by sandbox.
 */
export function printReceiptElement(receiptElement: HTMLElement): void {
  try {
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map(el => el.outerHTML)
      .join('\n');

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Bill</title>
          ${styles}
          <style>
            @page {
              size: auto;
              margin: 4mm;
            }
            body {
              margin: 0;
              padding: 6px;
              background: #ffffff;
              color: #000000;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            }
            .no-print {
              display: none !important;
            }
          </style>
        </head>
        <body>
          <div style="max-width: 380px; margin: 0 auto;">
            ${receiptElement.innerHTML}
          </div>
          <script>
            window.onload = function() {
              window.focus();
              window.print();
              setTimeout(function() {
                window.frameElement.remove();
              }, 1000);
            };
          </script>
        </body>
      </html>
    `);
    doc.close();
  } catch (e) {
    console.warn('Iframe print fallback to window.print', e);
    window.print();
  }
}
