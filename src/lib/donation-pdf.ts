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

export type DonationReceiptData = {
  id: string;
  receiptId?: string | null;
  donorName: string;
  phone: string;
  email?: string | null;
  amount: number;
  currency: string;
  donationType: string;
  onBehalfOf?: string | null;
  status: string;
  paymentId?: string | null;
  orderId?: string | null;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt?: string;
};

export async function downloadDonationReceipt(donation: DonationReceiptData) {
  const dateStr = new Date(donation.createdAt).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true,
  });
  
  const donorName = donation.isAnonymous ? "Anonymous Donor" : formatVal(donation.donorName);
  const email = donation.isAnonymous ? "—" : formatVal(donation.email);
  const phone = donation.isAnonymous ? "—" : formatVal(donation.phone);
  
  const receiptNo = formatVal(donation.receiptId ?? donation.id);
  const amountStr = `₹ ${Number(donation.amount).toLocaleString('en-IN')}`;

  const isPaid = donation.status === "completed";
  const statusColor: "success" | "warning" = isPaid ? "success" : "warning";

  let qrCodeUrl = "";
  try {
    qrCodeUrl = await QRCode.toDataURL(`https://nooreharam.in/verify/donation/${donation.id}`, {
      margin: 1, width: 250, color: { dark: PDF_COLORS.textMain, light: "#ffffff" },
    });
  } catch (err) {
    console.error("Error generating QR code:", err);
  }

  // Left Column: Donor Info
  const leftCol = pdfCard("DONOR INFORMATION", ICONS.user, `
    ${pdfApplicantRow(ICONS.user, "Donor Name", donorName)}
    ${pdfApplicantRow(ICONS.email, "Email Address", email)}
    ${pdfApplicantRow(ICONS.phone, "Phone Number", phone)}
    ${pdfApplicantRow(ICONS.clipboard, "On Behalf Of", formatVal(donation.onBehalfOf))}
    ${pdfApplicantRow(ICONS.info, "Anonymous", donation.isAnonymous ? "Yes" : "No")}
  `);

  // Right Column: Donation Details
  const rightCol = pdfCard("DONATION DETAILS", ICONS.clipboard, `
    ${pdfDetailRow("Receipt No", receiptNo, false)}
    ${pdfDetailRow("Date", dateStr, true)}
    ${pdfDetailRow("Amount", amountStr, false)}
    ${pdfDetailRow("Donation Type", formatVal(donation.donationType), true)}
    ${pdfDetailRow("Payment Status", isPaid ? "COMPLETED" : "PENDING", false, true, statusColor)}
    ${pdfDetailRow("Transaction ID", formatVal(donation.paymentId), true)}
    ${pdfDetailRow("Order ID", formatVal(donation.orderId), false)}
  `);

  // Assemble Main Document
  const content = `
    ${pdfTopHeader("Official Donation Receipt")}
    
    ${pdfStatusBar({
      regNo: receiptNo,
      isPaid: isPaid,
      issueDate: dateStr,
      qrUrl: qrCodeUrl
    })}

    ${pdfMainGrid(leftCol, rightCol)}

    ${pdfBottomGrid(
      pdfVerificationBox(qrCodeUrl, donation.id),
      pdfImportantInfo()
    )}

    ${pdfSealsRow()}
    ${pdfFooter()}
  `;

  const finalHtml = pdfContainerWrapper(content);

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
    pdf.save(`Donation-Receipt-${receiptNo}.pdf`);
  } catch (err) {
    console.error("PDF generation failed:", err);
  } finally {
    document.body.removeChild(container);
  }
}
