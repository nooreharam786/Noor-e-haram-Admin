import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import * as QRCode from "qrcode";
import {
  formatVal,
  ICONS,
  PDF_COLORS,
  pdfApplicantRow,
  pdfBottomGrid,
  pdfCard,
  pdfContainerWrapper,
  pdfDetailRow,
  pdfFooter,
  pdfImportantInfo,
  pdfMainGrid,
  pdfSealsRow,
  pdfStatusBar,
  pdfTopHeader,
  pdfVerificationBox
} from "./pdfComponents";

export interface PaymentReceiptData {
  receiptNumber: string;
  registrationNo: string;
  drawName: string;
  applicantName: string;
  email: string;
  paymentId: string;
  amount: number | string;
  paymentStatus: string;
  paymentDate: string;
  receiptGeneratedDate: string;
  qrUrl?: string;
}

export interface OrgSettingsData {
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  logo_url?: string | null;
  seal_image_url?: string | null;
  signature_image_url?: string | null;
  signatory_name?: string | null;
}

/**
 * Pure HTML generator for Payment Receipts.
 * Accepts PaymentReceiptData and dynamic OrgSettingsData.
 */
export function generatePaymentReceiptHtml(data: PaymentReceiptData, orgSettings?: OrgSettingsData): string {
  const isPaid = data.paymentStatus?.toLowerCase() === "paid" || data.paymentStatus?.toLowerCase() === "completed" || data.paymentStatus?.toLowerCase() === "successful";
  const amountStr = typeof data.amount === "number" ? `₹ ${data.amount.toLocaleString("en-IN")}` : formatVal(data.amount);
  const statusColor: "success" | "warning" = isPaid ? "success" : "warning";

  // Left Column: Applicant / Donor Information
  const leftCol = pdfCard("DONOR INFORMATION", ICONS.user, `
    ${pdfApplicantRow(ICONS.user, "Donor Name", formatVal(data.applicantName))}
    ${pdfApplicantRow(ICONS.email, "Email Address", formatVal(data.email))}
    ${pdfApplicantRow(ICONS.clipboard, "Registration No", formatVal(data.registrationNo))}
    ${pdfApplicantRow(ICONS.info, "On Behalf Of", formatVal(data.drawName || "Late Grandparents"))}
  `);

  // Right Column: Donation / Payment Details
  const rightCol = pdfCard("DONATION DETAILS", ICONS.clipboard, `
    ${pdfDetailRow("Receipt No", formatVal(data.receiptNumber), false)}
    ${pdfDetailRow("Date", formatVal(data.paymentDate || data.receiptGeneratedDate), true)}
    ${pdfDetailRow("Amount", amountStr, false)}
    ${pdfDetailRow("Donation Type", formatVal(data.drawName || "General Sadaqah"), true)}
    ${pdfDetailRow("Payment Status", isPaid ? "COMPLETED" : "PENDING", false, true, statusColor)}
    ${pdfDetailRow("Transaction ID", formatVal(data.paymentId), true)}
  `);

  // Inner Content Layout
  const content = `
    ${pdfTopHeader("Official Donation Receipt", orgSettings?.logo_url || undefined)}

    ${pdfStatusBar({
      regNo: formatVal(data.registrationNo || data.receiptNumber),
      isPaid: isPaid,
      issueDate: formatVal(data.paymentDate || data.receiptGeneratedDate),
      qrUrl: data.qrUrl || ""
    })}

    ${pdfMainGrid(leftCol, rightCol)}

    ${pdfBottomGrid(
      pdfVerificationBox(data.qrUrl || "", formatVal(data.registrationNo || data.receiptNumber)),
      pdfImportantInfo()
    )}

    ${pdfSealsRow(
      orgSettings?.seal_image_url || undefined,
      orgSettings?.signature_image_url || undefined,
      orgSettings?.signatory_name || undefined
    )}

    ${pdfFooter({
      phone: orgSettings?.phone,
      email: orgSettings?.email,
      website: orgSettings?.website,
      address: orgSettings?.address
    })}
  `;

  return pdfContainerWrapper(content);
}

/**
 * Downloads the Payment Receipt as a PDF document.
 */
export async function downloadPaymentReceipt(data: PaymentReceiptData, orgSettings?: OrgSettingsData) {
  let qrUrl = data.qrUrl || "";
  if (!qrUrl) {
    try {
      qrUrl = await QRCode.toDataURL(`https://nooreharam.in/verify/receipt/${data.receiptNumber || data.registrationNo}`, {
        margin: 1,
        width: 250,
        color: { dark: PDF_COLORS.textMain, light: "#ffffff" }
      });
    } catch (err) {
      console.error("QR Code generation failed:", err);
    }
  }

  const finalHtml = generatePaymentReceiptHtml({ ...data, qrUrl }, orgSettings);

  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.innerHTML = finalHtml;
  document.body.appendChild(container);

  try {
    const targetElement = container.firstElementChild as HTMLElement;
    const canvas = await html2canvas(targetElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: PDF_COLORS.bgCream,
      logging: false
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const pdf = new jsPDF("p", "mm", "a4");
    pdf.addImage(imgData, "JPEG", 0, 0, 210, 297, undefined, "FAST");
    pdf.save(`Payment-Receipt-${data.receiptNumber}.pdf`);
  } catch (err) {
    console.error("PDF generation failed:", err);
  } finally {
    document.body.removeChild(container);
  }
}
