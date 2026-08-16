import type { Applicant, PrintApplicant } from "@/types/api";

export type PdfAction = "preview" | "download" | "print";

const brand = {
  deep: "#0B3D2E",
  green: "#147A5B",
  gold: "#C8A951",
  goldSoft: "#F7F0D7",
  cream: "#F7F3EA",
  ink: "#2E2923",
  muted: "#756F66",
  line: "#DCD6C9"
};

const ptPerMm = 2.834645669;
const chitWidth = 42 * ptPerMm;
const chitHeight = 37 * ptPerMm;
const chitsPerPage = 40;

const brandMark = `
  <svg width="44" height="44" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
    <rect width="44" height="44" rx="12" fill="#0B3D2E"/>
    <path d="M25.3 8.6A13.7 13.7 0 1 0 34.8 29 12 12 0 1 1 25.3 8.6Z" fill="#C8A951"/>
    <path d="m30.4 14.7 1.2 3.2 3.4.1-2.7 2.1.9 3.3-2.8-1.9-2.9 1.9 1-3.3-2.8-2.1 3.5-.1 1.2-3.2Z" fill="#F7F0D7"/>
  </svg>`;

function makeSafeFilename(value: string) {
  return value.replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase();
}

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function shortText(value: string, maxLength: number) {
  const text = value.trim().replace(/\s+/g, " ");
  return text.length > maxLength ? `${text.slice(0, maxLength - 1).trimEnd()}…` : text;
}

function formatDate(value?: string | number | Date | null, includeTime = false) {
  if (!value) return "—";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit", hour12: true } : {})
  }).format(date);
}

function generatedAt() {
  return formatDate(new Date().toISOString(), true);
}

function website() {
  if (typeof window === "undefined") return "noorerehmat.org";
  return window.location.origin.replace(/^https?:\/\//, "");
}

async function getPdfMake() {
  const [pdfMakeModule, vfsModule] = await Promise.all([import("pdfmake/build/pdfmake"), import("pdfmake/build/vfs_fonts")]);
  const pdfMake = (pdfMakeModule.default ?? pdfMakeModule) as any;
  const vfs = (vfsModule.default ?? vfsModule) as Record<string, string>;
  pdfMake.addVirtualFileSystem(vfs);
  return pdfMake;
}

async function runPdf(docDefinition: any, filename: string, action: PdfAction) {
  const target = action === "download" ? undefined : window.open("", "_blank");
  if (action !== "download" && !target) {
    throw new Error("Please allow pop-ups to open the generated PDF");
  }
  const pdfMake = await getPdfMake();
  const document = pdfMake.createPdf(docDefinition);

  if (action === "download") {
    await document.download(filename);
    return;
  }
  if (action === "print") {
    await document.print(target);
    return;
  }
  await document.open(target);
}

function sectionLabel(value: string) {
  return { text: value.toUpperCase(), fontSize: 8, bold: true, color: brand.green, characterSpacing: 1.15, margin: [0, 0, 0, 6] };
}

function detailCell(label: string, value: string) {
  return {
    stack: [
      { text: label.toUpperCase(), fontSize: 7.5, bold: true, color: brand.muted, characterSpacing: 0.75, margin: [0, 0, 0, 3] },
      { text: value || "—", fontSize: 10.5, color: brand.ink, lineHeight: 1.15 }
    ],
    fillColor: "#FBFAF6",
    margin: [10, 8, 10, 8]
  };
}

export async function downloadApplicantTicket(applicant: Applicant) {
  const verificationValue = `NOOREREHMAT|${applicant.id}|${applicant.registrationNo ?? ""}`;
  const docDefinition = {
    info: {
      title: `Lucky Draw Ticket ${applicant.registrationNo ?? ""}`,
      author: "Noor-e-Rehmat Trust",
      subject: "Lucky Draw registration ticket"
    },
    pageSize: "A5",
    pageMargins: [28, 26, 28, 40],
    footer: () => ({
      columns: [
        { text: `Verify at ${website()}  •  Registration ID: ${shortText(applicant.id, 18)}`, color: brand.muted, fontSize: 7.5 },
        { text: "Noor-e-Rehmat Trust  •  Contact the Trust Office", color: brand.muted, fontSize: 7.5, alignment: "right" }
      ],
      margin: [28, 12, 28, 0]
    }),
    content: [
      {
        columns: [
          { svg: brandMark, width: 42 },
          {
            stack: [
              { text: "NOOR-E-REHMAT TRUST", fontSize: 10, bold: true, color: brand.deep, characterSpacing: 0.6 },
              { text: "Lucky Draw / Umrah Draw", fontSize: 17, bold: true, color: brand.ink, margin: [0, 2, 0, 0] },
              { text: "Official registration ticket", fontSize: 8.5, color: brand.muted, margin: [0, 3, 0, 0] }
            ],
            margin: [9, 1, 0, 0]
          }
        ],
        margin: [0, 0, 0, 16]
      },
      {
        table: {
          widths: ["*"],
          body: [
            [
              {
                stack: [
                  { text: "YOUR TOKEN NUMBER", fontSize: 8, bold: true, color: "#D9F0E6", characterSpacing: 1.2, alignment: "center", margin: [0, 0, 0, 5] },
                  { text: applicant.registrationNo ?? "", fontSize: 30, bold: true, color: "#FFFFFF", alignment: "center", noWrap: true }
                ],
                fillColor: brand.deep,
                margin: [12, 13, 12, 13]
              }
            ]
          ]
        },
        layout: { hLineWidth: () => 0, vLineWidth: () => 0 },
        margin: [0, 0, 0, 16]
      },
      sectionLabel("Participant details"),
      {
        table: {
          widths: ["*", "*"],
          body: [
            [detailCell("Participant name", applicant.applicantName || applicant.user.name), detailCell("Mobile number", applicant.phone)],
            [detailCell("Registration date", formatDate(applicant.createdAt, true)), detailCell("Registration ID", applicant.id)]
          ]
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => brand.line,
          vLineColor: () => brand.line,
          paddingLeft: () => 0,
          paddingRight: () => 0,
          paddingTop: () => 0,
          paddingBottom: () => 0
        },
        margin: [0, 0, 0, 16]
      },
      sectionLabel("Family / Traveller details"),
      {
        table: {
          widths: ["*"],
          body: [
            [
              {
                stack: [
                  { text: "PARTICIPANTS COUNT", fontSize: 7.5, bold: true, color: brand.muted, characterSpacing: 0.75, margin: [0, 0, 0, 3] },
                  { text: `${applicant.persons} Person(s) Total`, fontSize: 10.5, bold: true, color: brand.ink, margin: [0, 0, 0, 8] },
                  { text: "TRAVELLER LIST", fontSize: 7, bold: true, color: brand.muted, characterSpacing: 0.7, margin: [0, 0, 0, 4] },
                  ...applicant.travellers.map((traveller, index) => ({
                    text: `${index + 1}. ${traveller.fullName} (${traveller.phone})`,
                    fontSize: 9,
                    color: brand.ink,
                    margin: [0, 0, 0, 3]
                  }))
                ],
                fillColor: "#FBFAF6",
                margin: [10, 8, 10, 8]
              }
            ]
          ]
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => brand.line,
          vLineColor: () => brand.line,
          paddingLeft: () => 0,
          paddingRight: () => 0,
          paddingTop: () => 0,
          paddingBottom: () => 0
        },
        margin: [0, 0, 0, 16]
      },
      {
        columns: [
          {
            qr: verificationValue,
            fit: 70,
            foreground: brand.ink,
            background: "#FFFFFF",
            margin: [0, 4, 0, 0]
          },
          {
            stack: [
              { text: "SECURE VERIFICATION QR", fontSize: 7.5, bold: true, color: brand.muted, characterSpacing: 0.75 },
              {
                text: "Scan this code with a mobile camera to verify this registration ticket directly on the official trust database.",
                fontSize: 8.5,
                color: brand.ink,
                lineHeight: 1.25,
                margin: [0, 4, 0, 0]
              }
            ],
            margin: [10, 0, 10, 4]
          },
          {
            text: "This ticket confirms registration only. Selection and final verification remain subject to the Trust’s draw process and applicable terms.",
            fontSize: 7.5,
            color: brand.muted,
            italics: true,
            margin: [0, 14, 0, 0]
          }
        ],
        defaultStyle: { font: "Roboto" }
      }
    ]
  };

  await runPdf(docDefinition, `noor-e-rehmat-ticket-${makeSafeFilename(applicant.registrationNo ?? "")}.pdf`, "download");
}

function chitCell(item: PrintApplicant) {
  return {
    stack: [
      { text: item.registrationNo, fontSize: 17, bold: true, color: brand.deep, alignment: "center", noWrap: true, margin: [0, 7, 0, 4] },
      { text: shortText(item.applicantName || item.user.name, 40), fontSize: 8.5, bold: true, color: brand.ink, alignment: "center", noWrap: true, margin: [4, 0, 4, 2] },
      { text: item.phone, fontSize: 8, color: brand.muted, alignment: "center", noWrap: true },
      { text: shortText(item.id, 22), fontSize: 5.5, color: "#A39B8F", alignment: "center", noWrap: true, margin: [0, 5, 0, 0] }
    ],
    margin: [0, 0, 0, 0]
  };
}

function padPage(items: PrintApplicant[]) {
  return [...items, ...Array.from({ length: Math.max(0, chitsPerPage - items.length) }, () => null)];
}

function chitPage(items: PrintApplicant[], pageIndex: number) {
  const rows = padPage(items).reduce<(PrintApplicant | null)[][]>((result, item, index) => {
    if (index % 5 === 0) result.push([]);
    result[result.length - 1].push(item);
    return result;
  }, []);

  return {
    table: {
      widths: Array.from({ length: 5 }, () => chitWidth),
      heights: Array.from({ length: 8 }, () => chitHeight),
      body: rows.map((row) => row.map((item) => (item ? chitCell(item) : { text: "" })))
    },
    layout: {
      hLineWidth: () => 0.45,
      vLineWidth: () => 0.45,
      hLineColor: () => "#8E887D",
      vLineColor: () => "#8E887D",
      paddingLeft: () => 0,
      paddingRight: () => 0,
      paddingTop: () => 0,
      paddingBottom: () => 0
    },
    pageBreak: pageIndex === 0 ? undefined : "before"
  };
}

export async function exportChits(items: PrintApplicant[], action: PdfAction) {
  const pages = Array.from({ length: Math.ceil(items.length / chitsPerPage) }, (_, index) => items.slice(index * chitsPerPage, (index + 1) * chitsPerPage));
  const docDefinition = {
    info: {
      title: "Noor-e-Rehmat Lucky Draw Chits",
      author: "Noor-e-Rehmat Trust",
      subject: "Cut-ready lucky draw chits"
    },
    pageSize: "A4",
    pageOrientation: "portrait",
    pageMargins: [0, (297 - 8 * 37) * ptPerMm / 2, 0, (297 - 8 * 37) * ptPerMm / 2],
    content: pages.map(chitPage),
    defaultStyle: { font: "Roboto" }
  };

  await runPdf(docDefinition, `noor-e-rehmat-draw-chits-${items.length}.pdf`, action);
}

export async function exportParticipantReport(items: PrintApplicant[], action: PdfAction) {
  const created = generatedAt();
  const rows = items.map((item, index) => [
    { text: String(index + 1), color: brand.muted },
    { text: item.registrationNo ?? "", bold: true, color: brand.deep },
    { text: item.applicantName || item.user.name },
    { text: item.phone },
    { text: formatDate(item.createdAt, true), color: brand.muted },
    { text: item.status.replace("_", " "), color: item.status === "selected" ? brand.green : brand.muted }
  ]);
  const header = [
    { text: "#", bold: true, color: "#FFFFFF" },
    { text: "Token Number", bold: true, color: "#FFFFFF" },
    { text: "Participant Name", bold: true, color: "#FFFFFF" },
    { text: "Mobile Number", bold: true, color: "#FFFFFF" },
    { text: "Registration Date", bold: true, color: "#FFFFFF" },
    { text: "Status", bold: true, color: "#FFFFFF" }
  ];

  const docDefinition = {
    info: {
      title: "Noor-e-Rehmat Participant Report",
      author: "Noor-e-Rehmat Trust",
      subject: "Lucky Draw participant report"
    },
    pageSize: "A4",
    pageOrientation: "landscape",
    pageMargins: [28, 60, 28, 38],
    header: () => ({
      columns: [
        { svg: brandMark, width: 28 },
        {
          stack: [
            { text: "NOOR-E-REHMAT TRUST", bold: true, color: brand.deep, fontSize: 10, characterSpacing: 0.5 },
            { text: "Lucky Draw Participant Report", fontSize: 14, bold: true, color: brand.ink, margin: [0, 2, 0, 0] }
          ],
          margin: [7, 1, 0, 0]
        },
        { text: `Total registrations: ${items.length}`, alignment: "right", color: brand.green, bold: true, fontSize: 9, margin: [0, 10, 0, 0] }
      ],
      margin: [28, 18, 28, 0]
    }),
    footer: (currentPage: number, pageCount: number) => ({
      columns: [
        { text: `Generated ${created}`, color: brand.muted, fontSize: 7.5 },
        { text: `${website()}  •  Page ${currentPage} of ${pageCount}`, color: brand.muted, fontSize: 7.5, alignment: "right" }
      ],
      margin: [28, 10, 28, 0]
    }),
    content: [
      { text: `Selected registrations: ${items.length}`, fontSize: 9, color: brand.muted, margin: [0, 0, 0, 12] },
      {
        table: {
          headerRows: 1,
          widths: [24, 86, "*", 88, 110, 66],
          body: [header, ...rows]
        },
        layout: {
          fillColor: (rowIndex: number) => (rowIndex === 0 ? brand.deep : rowIndex % 2 === 0 ? "#FBFAF6" : null),
          hLineColor: () => brand.line,
          vLineColor: () => brand.line,
          hLineWidth: () => 0.45,
          vLineWidth: () => 0.45,
          paddingLeft: () => 7,
          paddingRight: () => 7,
          paddingTop: () => 6,
          paddingBottom: () => 6
        },
        fontSize: 8.5
      }
    ],
    defaultStyle: { font: "Roboto", color: brand.ink }
  };

  await runPdf(docDefinition, `noor-e-rehmat-participant-report-${items.length}.pdf`, action);
}

function triggerDownload(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadParticipantCsv(items: PrintApplicant[]) {
  const header = ["Token Number", "Participant Name", "Mobile Number", "Registration Date", "Registration Status"];
  const rows = items.map((item) => [item.registrationNo ?? "", item.applicantName || item.user.name, item.phone, formatDate(item.createdAt, true), item.status.replace("_", " ")]);
  const csv = [header, ...rows].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
  triggerDownload(csv, `noor-e-rehmat-participant-report-${items.length}.csv`, "text/csv;charset=utf-8");
}

export function downloadParticipantXml(items: PrintApplicant[]) {
  const rows = items
    .map(
      (item) =>
        `<Row><Cell><Data ss:Type="String">${escapeXml(item.registrationNo ?? "")}</Data></Cell><Cell><Data ss:Type="String">${escapeXml(item.applicantName || item.user.name)}</Data></Cell><Cell><Data ss:Type="String">${escapeXml(item.phone)}</Data></Cell><Cell><Data ss:Type="String">${escapeXml(formatDate(item.createdAt, true))}</Data></Cell><Cell><Data ss:Type="String">${escapeXml(item.status.replace("_", " "))}</Data></Cell></Row>`
    )
    .join("");
  const xml = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Participants"><Table><Row><Cell><Data ss:Type="String">Token Number</Data></Cell><Cell><Data ss:Type="String">Participant Name</Data></Cell><Cell><Data ss:Type="String">Mobile Number</Data></Cell><Cell><Data ss:Type="String">Registration Date</Data></Cell><Cell><Data ss:Type="String">Registration Status</Data></Cell></Row>${rows}</Table></Worksheet></Workbook>`;
  triggerDownload(xml, `noor-e-rehmat-participant-report-${items.length}.xml`, "application/vnd.ms-excel");
}

export { chitsPerPage };
