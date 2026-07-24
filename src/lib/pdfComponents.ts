/**
 * Noor E Haram Charity Foundation - Premium PDF UI Components
 * Redesigned to exactly match the provided visual reference.
 */

export const PDF_COLORS = {
  primary: "#0B4633", // Dark green matched to website theme
  primaryLight: "#126B4E",
  gold: "#D8A820", // Gold matched to website theme
  goldLight: "#F2EEDD", // Light yellow background
  bgCream: "#FAF9F4", // Overall background color
  white: "#FFFFFF",
  textMain: "#222222",
  textMuted: "#555555",
  success: "#408458",
  danger: "#C13535",
  borderLight: "#E5E0D8",
};

// SVG Icons
export const ICONS = {
  user: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
  email: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>`,
  location: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
  city: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15 11V5l-3-3-3 3v2H3v14h18V11h-6zm-8 8H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V9h2v2zm6 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm6 12h-2v-2h2v2zm0-4h-2v-2h2v2z"/></svg>`,
  globe: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>`,
  clipboard: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>`,
  shieldCheck: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>`,
  checkCircle: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`,
  info: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`,
  website: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`
};

export function formatVal(val: any): string {
  if (val === undefined || val === null || Number.isNaN(val) || val === "" || val === "undefined") {
    return "—";
  }
  return String(val);
}

export function pdfContainerWrapper(children: string): string {
  const cornerDeco = `
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 0H40V2C19.0132 2 2 19.0132 2 40H0V0Z" fill="${PDF_COLORS.gold}"/>
      <path d="M8 8H32V10C20.9543 10 12 18.9543 12 30H10V8Z" fill="${PDF_COLORS.gold}"/>
    </svg>
  `;
  return `
    <div style="
      position: relative;
      width: 794px; height: 1123px; box-sizing: border-box;
      background-color: ${PDF_COLORS.bgCream}; 
      padding: 12px;
      display: flex; flex-direction: column;
    ">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
        * { box-sizing: border-box; }
        .pdf-root { font-family: 'Inter', sans-serif; color: ${PDF_COLORS.textMain}; }
        .pdf-serif { font-family: 'Playfair Display', serif; }
      </style>
      
      <div class="pdf-root" style="
        width: 100%; height: 100%; border: 3px solid ${PDF_COLORS.primary}; 
        position: relative; display: flex; flex-direction: column;
        background-color: ${PDF_COLORS.white};
      ">
        <!-- Inner thin border -->
        <div style="position: absolute; inset: 4px; border: 1px solid ${PDF_COLORS.gold}; pointer-events: none; z-index: 10;"></div>
        
        <!-- Corner decorations -->
        <div style="position: absolute; top: 4px; left: 4px; z-index: 11;">${cornerDeco}</div>
        <div style="position: absolute; top: 4px; right: 4px; transform: scaleX(-1); z-index: 11;">${cornerDeco}</div>
        <div style="position: absolute; bottom: 4px; left: 4px; transform: scaleY(-1); z-index: 11;">${cornerDeco}</div>
        <div style="position: absolute; bottom: 4px; right: 4px; transform: scale(-1, -1); z-index: 11;">${cornerDeco}</div>
        
        <!-- Background Watermark Text -->
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.03; font-size: 110px; font-weight: 800; white-space: nowrap; pointer-events: none; z-index: 0; letter-spacing: 0.1em; color: ${PDF_COLORS.primary}; text-align: center; line-height: 1; width: 100%;">
          NOOR E HARAM
        </div>

        <!-- Top Right Arabesque Pattern -->
        <div style="position: absolute; top: 0; right: 0; opacity: 0.05; pointer-events: none; z-index: 0;">
          <img src="/pattern-bg.png" style="width: 250px; height: 250px; object-fit: cover;" onerror="this.style.display='none'" />
        </div>

        <!-- Main Content Wrapper -->
        <div style="flex: 1; display: flex; flex-direction: column; z-index: 2; position: relative; padding: 20px 30px;">
          ${children}
        </div>
      </div>
    </div>
  `;
}

export function pdfTopHeader(title: string = "Official Lucky Draw Registration Ticket", logoUrl?: string): string {
  const logoSrc = logoUrl || "/noor-e-haram-logo3.png";
  return `
    <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 20px; padding-top: 10px;">
      <img src="${logoSrc}" style="height: 70px; object-fit: contain; margin-bottom: 8px;" onerror="this.src='/noor-e-haram-logo3.png'" />
      <h1 class="pdf-serif" style="font-size: 26px; font-weight: 700; color: ${PDF_COLORS.primary}; margin: 0; letter-spacing: 0.05em; text-transform: uppercase;">
        NOOR E HARAM
      </h1>
      <div style="display: flex; align-items: center; gap: 10px; margin: 4px 0;">
        <div style="width: 30px; height: 1px; background-color: ${PDF_COLORS.gold};"></div>
        <span style="font-size: 11px; font-weight: 600; color: ${PDF_COLORS.gold}; text-transform: uppercase; letter-spacing: 0.15em;">CHARITY FOUNDATION</span>
        <div style="width: 30px; height: 1px; background-color: ${PDF_COLORS.gold};"></div>
      </div>
      <p style="font-size: 10px; color: ${PDF_COLORS.textMain}; margin: 4px 0 16px 0; font-weight: 500; letter-spacing: 0.05em;">Faith • Service • Humanity</p>

      <h2 style="font-size: 16px; font-weight: 700; color: ${PDF_COLORS.primary}; margin: 0; text-transform: uppercase; letter-spacing: 0.05em;">
        ${title}
      </h2>
    </div>
  `;
}

export function pdfStatusBar(options: {
  regNo: string;
  isPaid: boolean;
  issueDate: string;
  qrUrl: string;
}): string {
  const statusColor = options.isPaid ? PDF_COLORS.primary : "#B8860B";
  const statusText = options.isPaid ? "PAID" : "PENDING";
  const statusIcon = options.isPaid 
    ? `<svg style="width:12px;height:12px;margin-right:4px;" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`
    : `<svg style="width:12px;height:12px;margin-right:4px;" viewBox="0 0 24 24" fill="white"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>`;

  return `
    <div style="border: 1px solid ${PDF_COLORS.gold}; border-radius: 8px; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <span style="font-size: 9px; font-weight: 600; color: ${PDF_COLORS.textMuted}; text-transform: uppercase;">REGISTRATION NUMBER</span>
        <div style="background-color: ${PDF_COLORS.primary}; color: ${PDF_COLORS.white}; padding: 6px 14px; border-radius: 6px; font-weight: 600; font-size: 13px; font-family: monospace; display: inline-block; transform: translateY(-2px);">
          ${options.regNo}
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 6px; align-items: center;">
        <span style="font-size: 9px; font-weight: 600; color: ${PDF_COLORS.textMuted}; text-transform: uppercase;">STATUS</span>
        <div style="background-color: ${statusColor}; color: ${PDF_COLORS.white}; padding: 6px 14px; border-radius: 6px; font-weight: 600; font-size: 11px; display: inline-flex; align-items: center; transform: translateY(-2px);">
          ${statusIcon} ${statusText}
        </div>
      </div>

      <div style="display: flex; gap: 10px; align-items: flex-start;">
        <div style="color: ${PDF_COLORS.gold}; width: 16px; height: 16px; margin-top: 2px;">${ICONS.calendar}</div>
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <span style="font-size: 9px; font-weight: 600; color: ${PDF_COLORS.textMuted}; text-transform: uppercase;">ISSUE DATE</span>
          <span style="font-size: 11px; font-weight: 600; color: ${PDF_COLORS.textMain};">${options.issueDate.split(',')[0]}</span>
          <span style="font-size: 10px; color: ${PDF_COLORS.textMuted};">${options.issueDate.split(',')[1] || ''}</span>
        </div>
      </div>

      <div style="width: 1px; height: 50px; background-color: ${PDF_COLORS.borderLight}; margin: 0 10px;"></div>

      <div style="display: flex; gap: 12px; align-items: center;">
        <div style="width: 50px; height: 50px; padding: 2px; border: 1px solid ${PDF_COLORS.textMain};">
          ${options.qrUrl ? `<img src="${options.qrUrl}" style="width: 100%; height: 100%;" />` : ''}
        </div>
        <div style="display: flex; flex-direction: column; max-width: 90px;">
          <span style="font-size: 10px; font-weight: 700; color: ${PDF_COLORS.textMain}; margin-bottom: 2px;">SCAN TO VERIFY</span>
          <span style="font-size: 7px; color: ${PDF_COLORS.textMuted}; line-height: 1.3;">This QR code can be used to verify the authenticity of this registration.</span>
        </div>
      </div>
    </div>
  `;
}

export function pdfMainGrid(leftColumn: string, rightColumn: string): string {
  return `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; align-items: start;">
      <div>${leftColumn}</div>
      <div>${rightColumn}</div>
    </div>
  `;
}

export function pdfCard(title: string, icon: string, content: string): string {
  return `
    <div style="border: 1px solid ${PDF_COLORS.borderLight}; border-radius: 6px; overflow: hidden; background-color: ${PDF_COLORS.white};">
      <div style="background-color: ${PDF_COLORS.primary}; padding: 10px 14px; display: flex; align-items: center; gap: 8px;">
        <div style="color: ${PDF_COLORS.white}; width: 14px; height: 14px;">${icon}</div>
        <span style="color: ${PDF_COLORS.white}; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; transform: translateY(-2px);">${title}</span>
      </div>
      <div>
        ${content}
      </div>
    </div>
  `;
}

export function pdfApplicantRow(icon: string, label: string, value: string): string {
  return `
    <div style="display: flex; align-items: center; padding: 12px 14px; border-bottom: 1px solid ${PDF_COLORS.borderLight};">
      <div style="color: ${PDF_COLORS.primary}; width: 14px; height: 14px; margin-right: 12px; flex-shrink: 0;">${icon}</div>
      <div style="width: 110px; font-size: 10px; color: ${PDF_COLORS.textMuted}; flex-shrink: 0;">${label}</div>
      <div style="font-size: 10px; font-weight: 600; color: ${PDF_COLORS.textMain};">${formatVal(value)}</div>
    </div>
  `;
}

export function pdfDetailRow(label: string, value: string, isAlternate: boolean = false, isPill: boolean = false, pillColor: "success" | "warning" = "success"): string {
  const bg = isAlternate ? "#FAFAFA" : "#FFFFFF";
  let valHtml = `<div style="font-size: 10px; font-weight: 600; color: ${PDF_COLORS.textMain};">${formatVal(value)}</div>`;
  
  if (isPill) {
    const pBg = pillColor === "success" ? "#408458" : "#FAF4EC";
    const pColor = pillColor === "success" ? "#FFFFFF" : "#A87A29";
    const pBorder = pillColor === "success" ? "transparent" : "#D4B982";
    const pIcon = pillColor === "success" 
      ? `<svg style="width:10px;height:10px;margin-right:4px;" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`
      : `<svg style="width:10px;height:10px;margin-right:4px;" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>`;
      
    valHtml = `
      <div style="background-color: ${pBg}; border: 1px solid ${pBorder}; color: ${pColor}; padding: 3px 10px; border-radius: 12px; font-size: 9px; font-weight: 700; display: inline-flex; align-items: center; text-transform: uppercase; transform: translateY(-2px);">
        ${pIcon} ${formatVal(value)}
      </div>
    `;
  }

  return `
    <div style="display: flex; align-items: center; padding: 10px 14px; border-bottom: 1px solid ${PDF_COLORS.borderLight}; background-color: ${bg};">
      <div style="width: 140px; font-size: 10px; color: ${PDF_COLORS.textMuted}; flex-shrink: 0;">${label}</div>
      ${valHtml}
    </div>
  `;
}

export function pdfBottomGrid(leftColumn: string, rightColumn: string): string {
  return `
    <div style="display: grid; grid-template-columns: 240px 1fr; gap: 20px; margin-bottom: 20px; align-items: start;">
      <div>${leftColumn}</div>
      <div>${rightColumn}</div>
    </div>
  `;
}

export function pdfVerificationBox(qrUrl: string, regId: string): string {
  return pdfCard("VERIFICATION QR CODE", ICONS.shieldCheck, `
    <div style="padding: 16px; display: flex; gap: 14px;">
      <div style="width: 75px; height: 75px; padding: 2px; border: 1px solid ${PDF_COLORS.textMain}; flex-shrink: 0;">
        ${qrUrl ? `<img src="${qrUrl}" style="width: 100%; height: 100%;" />` : ''}
      </div>
      <div style="display: flex; flex-direction: column;">
        <span style="font-size: 7px; color: ${PDF_COLORS.textMain}; line-height: 1.4; margin-bottom: 10px;">
          This is a unique QR code linked to your registration. It can be scanned by the Noor E Haram Charity Foundation for verification.
        </span>
        <span style="font-size: 8px; color: ${PDF_COLORS.textMuted}; margin-bottom: 2px; text-transform: uppercase;">VERIFICATION ID</span>
        <div style="border: 1px solid ${PDF_COLORS.borderLight}; padding: 4px 8px; font-family: monospace; font-size: 8px; font-weight: 600; color: ${PDF_COLORS.textMain}; background: #F9F9F9; word-break: break-all; line-height: 1.2;">
          ${regId}
        </div>
      </div>
    </div>
  `);
}

export function pdfImportantInfo(): string {
  const items = [
    "This is an official registration document issued by Noor E Haram Charity Foundation.",
    "Keep this document safely for your records.",
    "Carry this document for verification if requested by the foundation.",
    "Selection does not guarantee travel until final verification and approval.",
    "The Foundation reserves the right to verify all submitted information."
  ];

  const listHtml = items.map(text => `
    <div style="display: flex; gap: 8px; margin-bottom: 8px; align-items: flex-start;">
      <div style="color: ${PDF_COLORS.primary}; width: 12px; height: 12px; flex-shrink: 0; margin-top: 1px;">${ICONS.checkCircle}</div>
      <span style="font-size: 9px; color: ${PDF_COLORS.textMain}; line-height: 1.4;">${text}</span>
    </div>
  `).join('');

  return `
    <div style="background-color: ${PDF_COLORS.goldLight}; border: 1px solid ${PDF_COLORS.borderLight}; border-radius: 6px; padding: 16px; height: 100%;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 14px;">
        <div style="background-color: ${PDF_COLORS.gold}; color: ${PDF_COLORS.white}; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <div style="width: 12px; height: 12px;">${ICONS.info}</div>
        </div>
        <span style="font-size: 11px; font-weight: 700; color: ${PDF_COLORS.textMain}; letter-spacing: 0.05em;">IMPORTANT INFORMATION</span>
      </div>
      ${listHtml}
    </div>
  `;
}

export function pdfSealsRow(customSealUrl?: string, customSignatureUrl?: string, signatoryName?: string): string {
  const signatureImage = customSignatureUrl || "/signature.png";
  const signatoryText = signatoryName || "Afzal Shaikh";

  const sealContent = customSealUrl
    ? `<img src="${customSealUrl}" style="width: 100%; height: 100%; object-fit: contain;" />`
    : `<svg viewBox="0 0 100 100" width="100%" height="100%">
        <circle cx="50" cy="50" r="48" fill="none" stroke="${PDF_COLORS.gold}" stroke-width="2" stroke-dasharray="2,2"/>
        <circle cx="50" cy="50" r="44" fill="none" stroke="${PDF_COLORS.gold}" stroke-width="1"/>
        <path id="curve" fill="transparent" d="M 16,50 A 34,34 0 1,1 84,50 A 34,34 0 1,1 16,50" />
        <text fill="${PDF_COLORS.gold}" font-size="9" font-weight="bold" letter-spacing="1">
          <textPath href="#curve" startOffset="50%" text-anchor="middle">NOOR E HARAM CHARITY FOUNDATION</textPath>
        </text>
        <rect x="35" y="30" width="30" height="35" fill="${PDF_COLORS.gold}" rx="2"/>
        <rect x="42" y="25" width="16" height="5" fill="${PDF_COLORS.gold}" rx="1"/>
        <text x="15" y="54" font-size="12" fill="${PDF_COLORS.gold}">★</text>
        <text x="75" y="54" font-size="12" fill="${PDF_COLORS.gold}">★</text>
      </svg>`;

  return `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 40px; margin-bottom: 10px;">

      <!-- Seal -->
      <div style="position: relative; width: 90px; height: 90px; display: flex; align-items: center; justify-content: center;">
        ${sealContent}
      </div>

      <!-- Signature -->
      <div style="display: flex; flex-direction: column; align-items: center;">
        <span style="font-size: 8px; color: ${PDF_COLORS.textMuted}; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">AUTHORIZED DIGITAL SIGNATURE</span>
        <img src="${signatureImage}" style="height: 40px; max-width: 180px; object-fit: contain; margin-bottom: 2px;" />
        <div style="width: 200px; height: 1px; background-color: ${PDF_COLORS.textMain}; margin-bottom: 4px;"></div>
        <span style="font-size: 9px; font-weight: 600; color: ${PDF_COLORS.textMain};">${signatoryText}</span>
        <span style="font-size: 7.5px; color: ${PDF_COLORS.textMuted}; font-style: italic; margin-top: 1px;">(Digitally Signed)</span>
      </div>

      <!-- Digital Document Badge -->
      <div style="display: flex; align-items: flex-start; gap: 8px; max-width: 180px; padding: 10px; background-color: #FAFAFA; border: 1px solid ${PDF_COLORS.borderLight}; border-radius: 6px;">
        <div style="color: ${PDF_COLORS.primary}; width: 16px; height: 16px; flex-shrink: 0;">${ICONS.shieldCheck}</div>
        <div style="display: flex; flex-direction: column;">
          <span style="font-size: 8px; font-weight: 700; color: ${PDF_COLORS.textMain}; margin-bottom: 2px;">DIGITAL DOCUMENT</span>
          <span style="font-size: 7px; color: ${PDF_COLORS.textMuted}; line-height: 1.3;">This document is computer generated and digitally signed by Noor E Haram Charity Foundation.</span>
        </div>
      </div>

    </div>
  `;
}

export function pdfFooter(contact?: { phone?: string; email?: string; website?: string; address?: string }): string {
  const generatedOn = new Date().toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true
  });

  const phone = contact?.phone || "9213408880";
  const email = contact?.email || "support@nooreharam.in";
  const website = contact?.website || "www.nooreharam.in";
  const address = contact?.address || "AT.& PO.Umalla, (Dumala) Vaghpura, Near Masjid, Main Road, Ta. Jhagadia, Dist Bharuch 393120 Gujarat India";

  return `
    <div style="margin-top: auto; position: relative; z-index: 5;">

      <!-- Green Info Bar -->
      <div style="background-color: ${PDF_COLORS.primary}; padding: 14px 20px; display: flex; justify-content: space-between; color: ${PDF_COLORS.white}; border-radius: 6px 6px 0 0;">

        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="color: ${PDF_COLORS.gold}; width: 16px; height: 16px;">${ICONS.phone}</div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 7.5px; color: ${PDF_COLORS.gold}; text-transform: uppercase;">Phone</span>
            <span style="font-size: 9.5px; font-weight: 600;">${phone}</span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="color: ${PDF_COLORS.gold}; width: 16px; height: 16px;">${ICONS.email}</div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 7.5px; color: ${PDF_COLORS.gold}; text-transform: uppercase;">Email</span>
            <span style="font-size: 9.5px; font-weight: 600;">${email}</span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="color: ${PDF_COLORS.gold}; width: 16px; height: 16px;">${ICONS.globe}</div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 7.5px; color: ${PDF_COLORS.gold}; text-transform: uppercase;">Website</span>
            <span style="font-size: 9.5px; font-weight: 600;">${website}</span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="color: ${PDF_COLORS.gold}; width: 16px; height: 16px;">${ICONS.location}</div>
          <div style="display: flex; flex-direction: column; max-width: 200px;">
            <span style="font-size: 7.5px; color: ${PDF_COLORS.gold}; text-transform: uppercase;">Address</span>
            <span style="font-size: 8.5px; font-weight: 600; line-height: 1.2;">${address}</span>
          </div>
        </div>

      </div>

      <!-- Bottom White Bar -->
      <div style="background-color: ${PDF_COLORS.white}; border-top: 1px solid ${PDF_COLORS.borderLight}; padding: 8px 20px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 8px; color: ${PDF_COLORS.textMain};">
          Document Generated On: ${generatedOn} &nbsp;|&nbsp; System Version: v1.0
        </span>
        <span style="font-size: 8px; color: ${PDF_COLORS.textMain};">
          © ${new Date().getFullYear()} NOOR E HARAM Charity Foundation. All Rights Reserved.
        </span>
      </div>

    </div>
  `;
}
