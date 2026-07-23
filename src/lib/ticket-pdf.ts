import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import * as QRCode from "qrcode";
import type { Applicant } from "@/types/api";
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

export async function downloadApplicantTicket(applicant: Applicant) {
  const dateStr = new Date(applicant.createdAt).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true,
  });
  const paymentDateStr = applicant.completedAt ? new Date(applicant.completedAt).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true,
  }) : "—";
  
  const applicantName = formatVal(applicant.user?.name || "Applicant");
  const email = formatVal(applicant.user?.email);
  const phone = formatVal(applicant.phone);
  const coverId = formatVal(applicant.registrationNo);
  const regId = formatVal(applicant.id);
  const address = formatVal(applicant.address);
  const cityState = `${formatVal(applicant.city)}, ${formatVal(applicant.stateName)}`;
  const country = "India";
  
  const participantCount = String(applicant.persons || 1);
  const entryFee = applicant.entryFee ? `₹ ${applicant.entryFee.toLocaleString('en-IN')}` : "—";

  const isPaid = applicant.paymentStatus === "paid";
  
  // Status logic
  const appStatusText = applicant.status === "selected" ? "SELECTED" : applicant.status === "not_selected" ? "NOT SELECTED" : "PENDING";
  const appStatusColor: "success" | "warning" = applicant.status === "pending" ? "warning" : "success"; // Warning for pending, success for selected/not_selected handled as pill
  
  const ticketStatusText = isPaid ? "CONFIRMED" : "PENDING";
  const ticketStatusColor: "success" | "warning" = isPaid ? "success" : "warning";

  let qrCodeUrl = "";
  try {
    qrCodeUrl = await QRCode.toDataURL(`https://nooreharam.in/verify/${regId}`, {
      margin: 1, width: 250, color: { dark: PDF_COLORS.textMain, light: "#ffffff" },
    });
  } catch (err) {
    console.error("Error generating QR code:", err);
  }

  // Left Column: Applicant Info
  const leftCol = pdfCard("APPLICANT INFORMATION", ICONS.user, `
    ${pdfApplicantRow(ICONS.user, "Full Name", applicantName)}
    ${pdfApplicantRow(ICONS.email, "Email Address", email)}
    ${pdfApplicantRow(ICONS.phone, "Phone Number", phone)}
    ${pdfApplicantRow(ICONS.location, "Address", address)}
    ${pdfApplicantRow(ICONS.city, "City / State", cityState)}
    ${pdfApplicantRow(ICONS.globe, "Country", country)}
  `);

  // Right Column: Registration Details
  const rightCol = pdfCard("REGISTRATION DETAILS", ICONS.clipboard, `
    ${pdfDetailRow("Draw ID", coverId, false)}
    ${pdfDetailRow("Application Date", dateStr, true)}
    ${pdfDetailRow("Payment Date", paymentDateStr, false)}
    ${pdfDetailRow("Entry Fee", entryFee, true)}
    ${pdfDetailRow("Participant Count", participantCount, false)}
    ${pdfDetailRow("Payment Status", isPaid ? "PAID" : "PENDING", true, true, isPaid ? "success" : "warning")}
    ${pdfDetailRow("Application Status", appStatusText, false, true, appStatusColor)}
    ${pdfDetailRow("Ticket Status", ticketStatusText, true, true, ticketStatusColor)}
    ${pdfDetailRow("Transaction ID", formatVal(applicant.paymentId), false)}
    ${pdfDetailRow("Order ID", formatVal(applicant.orderId), true)}
  `);

  // Assemble Main Document
  const content = `
    ${pdfTopHeader()}
    
    ${pdfStatusBar({
      regNo: coverId,
      isPaid: isPaid,
      issueDate: dateStr,
      qrUrl: qrCodeUrl
    })}

    ${pdfMainGrid(leftCol, rightCol)}

    ${pdfBottomGrid(
      pdfVerificationBox(qrCodeUrl, regId),
      pdfImportantInfo()
    )}

    ${pdfSealsRow()}
    ${pdfFooter()}
  `;

  const finalHtml = pdfContainerWrapper(content);

  // Render to canvas and PDF
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
    
    pdf.save(`noor-e-haram-ticket-${coverId}.pdf`);
  } catch (err) {
    console.error("PDF generation failed:", err);
  } finally {
    document.body.removeChild(container);
  }
}
