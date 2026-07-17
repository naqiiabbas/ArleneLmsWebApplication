// components/exportPdf.ts
export const handleExportPdf = async (activeTab: string, invoices: any[]) => {
  try {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Billing & Plans Report - ${activeTab}`, 14, 20);
    
    const tableRows = invoices.map(inv => [
      inv.id, 
      inv.organization, 
      `$${inv.amount.toFixed(2)}`, 
      inv.status, 
      inv.dueDate
    ]);

    autoTable(doc, {
      startY: 35,
      head: [["Invoice #", "Organization", "Amount", "Status", "Due Date"]],
      body: tableRows,
      headStyles: { fillColor: [245, 158, 11] },
      theme: 'striped'
    });

    doc.save(`Billing_Report_${activeTab.replace(/\s/g, "_")}.pdf`);
  } catch (error) {
    console.error("PDF Export failed:", error);
  }
};