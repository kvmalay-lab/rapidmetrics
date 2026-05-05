import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type PdfExportPayload = {
  filtersSummary: string;
  kpis: { label: string; value: string; change?: string }[];
  regionRows: { region: string; revenue: number }[];
  categoryRows: { category: string; revenue: number }[];
  trendRows: { period: string; revenue: number }[];
  insight: { problem: string; data: string; recommendation: string };
};

const fmt = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(2)}M`
    : `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

export function exportDashboardPdf(payload: PdfExportPayload) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;

  // Header band
  doc.setFillColor(30, 58, 95);
  doc.rect(0, 0, pageW, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Sales Performance Dashboard", margin, 32);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Data-Driven Insights for Strategic Growth", margin, 50);
  doc.setFontSize(9);
  doc.text(
    `Generated ${new Date().toLocaleString()}`,
    pageW - margin,
    50,
    { align: "right" },
  );

  let y = 95;
  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Filters", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  y += 14;
  doc.text(payload.filtersSummary, margin, y);

  // KPI table
  y += 18;
  autoTable(doc, {
    startY: y,
    head: [["KPI", "Value", "Change"]],
    body: payload.kpis.map((k) => [k.label, k.value, k.change ?? "—"]),
    theme: "grid",
    headStyles: { fillColor: [30, 58, 95], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 10, cellPadding: 6 },
    margin: { left: margin, right: margin },
  });

  // Insight
  // @ts-expect-error lastAutoTable is added by autoTable
  y = doc.lastAutoTable.finalY + 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Key Insight", margin, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const wrap = (t: string) => doc.splitTextToSize(t, pageW - margin * 2);
  doc.setFont("helvetica", "bold");
  doc.text("Problem:", margin, y);
  doc.setFont("helvetica", "normal");
  const p = wrap(payload.insight.problem);
  doc.text(p, margin + 55, y);
  y += p.length * 12 + 6;
  doc.setFont("helvetica", "bold");
  doc.text("Data:", margin, y);
  doc.setFont("helvetica", "normal");
  const d = wrap(payload.insight.data);
  doc.text(d, margin + 55, y);
  y += d.length * 12 + 6;
  doc.setFont("helvetica", "bold");
  doc.text("Action:", margin, y);
  doc.setFont("helvetica", "normal");
  const r = wrap(payload.insight.recommendation);
  doc.text(r, margin + 55, y);
  y += r.length * 12 + 12;

  // Region table
  autoTable(doc, {
    startY: y,
    head: [["Region", "Revenue"]],
    body: payload.regionRows.map((r) => [r.region, fmt(r.revenue)]),
    theme: "striped",
    headStyles: { fillColor: [30, 58, 95], textColor: 255 },
    styles: { fontSize: 10, cellPadding: 6 },
    margin: { left: margin, right: margin },
  });

  // @ts-expect-error lastAutoTable is added by autoTable
  y = doc.lastAutoTable.finalY + 16;
  autoTable(doc, {
    startY: y,
    head: [["Category", "Revenue"]],
    body: payload.categoryRows.map((c) => [c.category, fmt(c.revenue)]),
    theme: "striped",
    headStyles: { fillColor: [30, 58, 95], textColor: 255 },
    styles: { fontSize: 10, cellPadding: 6 },
    margin: { left: margin, right: margin },
  });

  // @ts-expect-error lastAutoTable is added by autoTable
  y = doc.lastAutoTable.finalY + 16;
  autoTable(doc, {
    startY: y,
    head: [["Period", "Revenue"]],
    body: payload.trendRows.map((t) => [t.period, fmt(t.revenue)]),
    theme: "striped",
    headStyles: { fillColor: [30, 58, 95], textColor: 255 },
    styles: { fontSize: 10, cellPadding: 6 },
    margin: { left: margin, right: margin },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(
      `The Visual Project · Page ${i} of ${pageCount}`,
      pageW / 2,
      doc.internal.pageSize.getHeight() - 20,
      { align: "center" },
    );
  }

  doc.save(`sales-performance-${Date.now()}.pdf`);
}
