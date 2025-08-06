import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Path to your logo/watermark image
import invoiceImage from '../assets/invoice.jpg';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceData {
  invoiceNo: string;
  date: string;
  companyName: string;
  address: string;
  phone: string;
  email: string;
  items: InvoiceItem[];
  paymentDetails: {
    bank: string;
    ifsc: string;
    branch: string;
    accountNo: string;
  };
  total: number;
}

const defaultItem: InvoiceItem = {
  description: '',
  quantity: 1,
  unitPrice: 0,
  total: 0,
};

const defaultData: InvoiceData = {
  invoiceNo: '',
  date: '',
  companyName: '',
  address: '',
  phone: '',
  email: '',
  items: [],
  paymentDetails: {
    bank: '',
    ifsc: '',
    branch: '',
    accountNo: '',
  },
  total: 0,
};

const InvoicePDFGenerator: React.FC = () => {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(defaultData);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInvoiceData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInvoiceData((prev) => ({
      ...prev,
      paymentDetails: { ...prev.paymentDetails, [name]: value },
    }));
  };

  const handleItemChange = (idx: number, field: keyof InvoiceItem, value: string | number) => {
    setInvoiceData((prev) => {
      const items = prev.items.map((item, i) =>
        i === idx ? { ...item, [field]: value, total: field === 'quantity' || field === 'unitPrice' ? Number(field === 'quantity' ? value : item.quantity) * Number(field === 'unitPrice' ? value : item.unitPrice) : item.total } : item
      );
      return { ...prev, items, total: items.reduce((sum, item) => sum + item.total, 0) };
    });
  };

  const addItem = () => {
    setInvoiceData((prev) => ({ ...prev, items: [...prev.items, { ...defaultItem }] }));
  };

  const removeItem = (idx: number) => {
    setInvoiceData((prev) => {
      const items = prev.items.filter((_, i) => i !== idx);
      return { ...prev, items, total: items.reduce((sum, item) => sum + item.total, 0) };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  const generatePDF = async (action: 'save' | 'preview') => {
    const doc = new jsPDF('p', 'pt', 'a4');
    const img = new window.Image();
    img.src = invoiceImage;
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    // Watermark
    doc.addImage(img, 'PNG', 0, 0, 595, 842, '', 'FAST');

    // Invoice Title
    doc.setFontSize(24);
    doc.setFont('times', 'bold');
    doc.text('Invoice', 260, 250);

    // Invoice Info
    doc.setFontSize(11);
    doc.setFont('times', 'normal');
    let yPos = 280;
    doc.text(`Invoice No.: ${invoiceData.invoiceNo}`, 50, yPos);
    doc.text(`Date: ${invoiceData.date}`, 400, yPos);
    yPos += 20;
    doc.text(`Company Name: ${invoiceData.companyName}`, 50, yPos);
    yPos += 20;
    doc.text(`Address: ${invoiceData.address}`, 50, yPos);
    yPos += 20;
    doc.text(`Phone No.: ${invoiceData.phone}`, 50, yPos);
    yPos += 20;
    doc.text(`Email: ${invoiceData.email}`, 50, yPos);
    yPos += 30;

    // Table
    (doc as any).autoTable({
      startY: yPos,
      head: [['Sr. No.', 'Item Description', 'Qty.', 'Unit Price', 'Total Amount']],
      body: invoiceData.items.map((item, idx) => [
        idx + 1,
        item.description,
        item.quantity,
        `${item.unitPrice.toLocaleString()}`,
        `${item.total.toLocaleString()}`,
      ]),
      theme: 'grid',
      headStyles: { fillColor: [66, 139, 202], textColor: [255, 255, 255] },
      styles: { fontSize: 10, textColor: [0, 0, 0] },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 220 },
        2: { cellWidth: 50 },
        3: { cellWidth: 80 },
        4: { cellWidth: 100 },
      },
    });

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
    yPos = finalY + 30;
    doc.setFontSize(16);
    doc.setFont('times', 'bold');
    doc.text(`Total: ${invoiceData.total.toLocaleString()}`, 400, yPos);
    yPos += 30;
    doc.setFontSize(12);
    doc.setFont('times', 'bold');
    doc.text('Payment Details:', 50, yPos);
    yPos += 20;
    doc.setFontSize(11);
    doc.setFont('times', 'normal');
    doc.text(`Bank: ${invoiceData.paymentDetails.bank}`, 50, yPos);
    doc.text(`IFSC: ${invoiceData.paymentDetails.ifsc}`, 250, yPos);
    yPos += 20;
    doc.text(`Branch: ${invoiceData.paymentDetails.branch}`, 50, yPos);
    doc.text(`Account No.: ${invoiceData.paymentDetails.accountNo}`, 250, yPos);

    if (action === 'save') {
      doc.save(`Invoice_${invoiceData.invoiceNo}.pdf`);
    } else {
      setPdfPreviewUrl(doc.output('datauristring'));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Invoice No.</label>
            <input type="text" name="invoiceNo" value={invoiceData.invoiceNo} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input type="date" name="date" value={invoiceData.date} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Company Name</label>
            <input type="text" name="companyName" value={invoiceData.companyName} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <input type="text" name="address" value={invoiceData.address} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input type="text" name="phone" value={invoiceData.phone} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" name="email" value={invoiceData.email} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Invoice Items</label>
          {invoiceData.items.map((item, idx) => (
            <div key={idx} className="flex gap-2 mb-2 items-center">
              <input type="text" placeholder="Description" value={item.description} onChange={e => handleItemChange(idx, 'description', e.target.value)} className="flex-1 border rounded px-3 py-2" required />
              <input type="number" placeholder="Qty" min={1} value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', Number(e.target.value))} className="w-20 border rounded px-3 py-2" required />
              <input type="number" placeholder="Unit Price" min={0} value={item.unitPrice} onChange={e => handleItemChange(idx, 'unitPrice', Number(e.target.value))} className="w-28 border rounded px-3 py-2" required />
              <span className="w-24 text-right">₹ {item.total.toLocaleString()}</span>
              {invoiceData.items.length > 1 && (
                <button type="button" onClick={() => removeItem(idx)} className="text-red-500 px-2">Remove</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addItem} className="mt-2 px-3 py-1 bg-blue-500 text-white rounded">Add Item</button>
        </div>
        <div className="text-right text-lg font-semibold">Total: ₹ {invoiceData.total.toLocaleString()}</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Bank</label>
            <input type="text" name="bank" value={invoiceData.paymentDetails.bank} onChange={handlePaymentChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">IFSC</label>
            <input type="text" name="ifsc" value={invoiceData.paymentDetails.ifsc} onChange={handlePaymentChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Branch</label>
            <input type="text" name="branch" value={invoiceData.paymentDetails.branch} onChange={handlePaymentChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Account No.</label>
            <input type="text" name="accountNo" value={invoiceData.paymentDetails.accountNo} onChange={handlePaymentChange} className="w-full border rounded px-3 py-2" required />
          </div>
        </div>
        <button type="submit" className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Save Invoice Data</button>
      </form>
      <div className="mt-6">
        <button
          onClick={() => generatePDF('preview')}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-4"
        >
          Refresh Preview
        </button>
        <button
          onClick={() => generatePDF('save')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Download Invoice PDF
        </button>
      </div>
      {pdfPreviewUrl && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Invoice Preview</h3>
          <iframe src={pdfPreviewUrl} width="100%" height="600px" className="border rounded" />
        </div>
      )}
    </div>
  );
};

export default InvoicePDFGenerator;
