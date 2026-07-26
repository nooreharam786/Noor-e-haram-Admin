"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Download,
  FileText,
  Gauge,
  HandHeart,
  Loader2,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Star,
  Trash2,
  Trophy,
  Users,
  WalletCards,
  X,
  RefreshCw,
  Printer,
  Plus,
  Bell,
  BookOpen,
  Image as ImageIcon,
  Mail,
  Globe,
  CheckSquare,
  Eye,
  EyeOff,
  Video
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { API_URL, api, clearToken, getToken, toQuery } from "@/lib/api";
import { downloadApplicantTicket } from "@/lib/ticket-pdf";
import { downloadDonationReceipt } from "@/lib/donation-pdf";
import { pdfFooter, pdfSealsRow, pdfTopHeader } from "@/lib/pdfComponents";
import { AdminLang, adminLanguages, getAdminTranslation } from "@/lib/admin-i18n";


import type { Applicant, ApplicationStatus, Donation, DrawResult, Feedback, Paginated, PaymentStatus, PublicDocument, Stats, User } from "@/types/api";

type Tab = "Dashboard" | "Users" | "Lucky Draw Applicants" | "Draw Control" | "YouTube & Live Stream" | "Payments" | "Donations" | "Announcements" | "Dua Guidelines" | "Gallery CMS" | "Feedback CMS" | "Contact & Settings" | "Settings";
type SortOrder = "asc" | "desc";
type SettingsTab = "Organization Assets" | "Payment Gateway" | "Social Media & Location" | "Admin Profile";

type DrawItem = {
  id: string;
  name: string;
  drawIndex: number;
  status: "draft" | "active" | "paused" | "closed" | "archived";
  appControlStatus: "open" | "paused" | "closed";
  bannerMessage?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  totalApplications: number;
  paidApplications: number;
  verifiedApplications: number;
  approvedApplications: number;
  winnerApplications: number;
  waitingApplications: number;
};

type MarqueeItem = {
  id: string;
  content: string;
  isActive: boolean;
  order: number;
  linkUrl?: string | null;
  eventDate?: string | null;
  lastDate?: string | null;
  statusBadge?: string | null;
  priority: number;
  createdAt?: string;
};

type FeedbackCMSItem = {
  id: string;
  name: string;
  rating: number;
  message: string;
  location?: string | null;
  source: string;
  approved: boolean;
  isFeatured: boolean;
  isPublished: boolean;
  isHidden: boolean;
  order: number;
  avatarUrl?: string | null;
  createdAt: string;
};

type AnnouncementItem = {
  id: string;
  title: string;
  description: string;
  priority: number;
  publishDate?: string | null;
  expiryDate?: string | null;
  status: "draft" | "scheduled" | "published" | "archived";
  locations: string;
  linkUrl?: string | null;
  badge?: string | null;
  createdAt: string;
};

type DuaGuidelineItem = {
  id: string;
  title: string;
  description?: string | null;
  shortDescription?: string | null;
  filename: string;
  thumbnailUrl?: string | null;
  images: string;
  kind: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
};

type GalleryCMSItem = {
  id: string;
  imageUrl: string;
  caption?: string | null;
  altText?: string | null;
  description?: string | null;
  category: string;
  order: number;
  isVisible: boolean;
  createdAt: string;
};

type ContactSettings = {
  contactSupportEmail: string;
  contactGeneralEmail: string;
  contactPhone: string;
  contactAltPhone: string;
  contactAddress: string;
  workingHours: string;
  googleMapsUrl: string;
  socialFacebookUrl: string;
  socialInstagramUrl: string;
  socialYoutubeUrl: string;
  socialWhatsappUrl: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  smtpSecure: string;
  smtpFrom: string;
};

type ContactMessageItem = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  status: string;
  createdAt: string;
};

const tabs: { name: Tab; short: string; icon: typeof Gauge }[] = [
  { name: "Dashboard", short: "Home", icon: Gauge },
  { name: "Users", short: "Users", icon: Users },
  { name: "Lucky Draw Applicants", short: "Draw", icon: Trophy },
  { name: "Draw Control", short: "Run", icon: Sparkles },
  { name: "YouTube & Live Stream", short: "Media", icon: Video },
  { name: "Payments", short: "Payments", icon: CreditCard },
  { name: "Donations", short: "Donations", icon: HandHeart },
  { name: "Announcements", short: "Alerts", icon: Bell },
  { name: "Dua Guidelines", short: "Duas", icon: BookOpen },
  { name: "Gallery CMS", short: "Photos", icon: ImageIcon },
  { name: "Feedback CMS", short: "Reviews", icon: MessageSquare },
  { name: "Contact & Settings", short: "Settings", icon: Settings }
];

const statusTone: Record<string, string> = {
  selected: "bg-emerald-mist text-emerald-deep",
  not_selected: "bg-stone-100 text-stone-600",
  pending: "bg-gold-soft text-stone-700",
  verified: "bg-blue-50 text-blue-700 border border-blue-200",
  approved: "bg-emerald-mist text-emerald-deep border border-emerald-300",
  rejected: "bg-red-50 text-red-700 border border-red-200",
  winner: "bg-gold text-emerald-deep font-bold border border-gold shadow-gold",
  waiting_list: "bg-amber-50 text-amber-800 border border-amber-300",
  cancelled: "bg-stone-100 text-stone-500",
  paid: "bg-emerald-mist text-emerald-deep",
  failed: "bg-red-50 text-red-700",
  open: "bg-emerald-50 text-emerald-700 font-semibold",
  paused: "bg-amber-50 text-amber-700 font-semibold",
  closed: "bg-red-50 text-red-700 font-semibold",
  active: "bg-emerald-deep text-white font-bold",
  draft: "bg-stone-100 text-stone-700",
  archived: "bg-stone-200 text-stone-600",
  admin: "bg-gold-soft text-emerald-deep",
  user: "bg-stone-100 text-stone-600"
};

function formatDate(value?: string | number | Date | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "—";
  return format(date, "dd MMM yyyy, h:mm a");
}

function Badge({ value }: { value: string }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone[value] ?? statusTone.pending}`}>{value.replace("_", " ")}</span>;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-t border-stone-100 py-3 first:border-t-0 first:pt-0 last:pb-0">
      <span className="text-xs font-semibold uppercase tracking-wide text-stone-400">{label}</span>
      <span className="max-w-[68%] text-right text-sm font-medium text-stone-700">{value}</span>
    </div>
  );
}

function SkeletonRows({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, row) => (
        <tr key={row} className="border-t border-stone-100">
          {Array.from({ length: cols }).map((__, col) => (
            <td key={col} className="px-4 py-4">
              <div className="h-4 w-full max-w-32 animate-pulse rounded bg-stone-100" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function Pagination({ page, pages, onPage }: { page: number; pages: number; onPage: (page: number) => void }) {
  return (
    <div className="flex items-center justify-center gap-2 border-t border-stone-100 px-4 py-3 sm:justify-end">
      <button className="btn-secondary h-9 px-3" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="text-sm text-stone-500">
        Page {page} of {Math.max(pages, 1)}
      </span>
      <button className="btn-secondary h-9 px-3" disabled={page >= pages} onClick={() => onPage(page + 1)}>
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [adminLang, setAdminLang] = useState<AdminLang>("en");
  const [activeTab, setActiveTab] = useState<Tab>("Dashboard");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<Paginated<User> | null>(null);
  const [applicants, setApplicants] = useState<Paginated<Applicant> | null>(null);
  const [drawHistory, setDrawHistory] = useState<DrawResult[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [documents, setDocuments] = useState<PublicDocument[]>([]);
  const [settings, setSettings] = useState({
    resultsYoutubeUrl: "",
    galleryImageUrls: "",
    termsDocumentUrl: "",
    umrahPackagePrice: 0,
    socialFacebookUrl: "",
    socialInstagramUrl: "",
    socialYoutubeUrl: "",
    socialWhatsappUrl: "",
    contactAddress: "",
    contactPhone: "",
    contactEmail: "",
    googleMapsUrl: "",
    officialSealUrl: "",
    authorizedSignatureUrl: "",
    adminName: "",
    adminEmail: "",
    razorpayPublicKey: "",
    paymentMode: "test" as "test" | "live",
    defaultDrawAmount: 1499
  });

  const [orgSettingsForm, setOrgSettingsForm] = useState({
    phone: "+91 9213408880",
    email: "support@nooreharam.in",
    website: "www.nooreharam.in",
    address: "AT.& PO.Umalla, (Dumala) Vaghpura, Near Masjid, Main Road, Ta. Jhagadia, Dist Bharuch 393120 Gujarat India",
    logo_url: "",
    seal_image_url: "",
    signature_image_url: "",
    signatory_name: "Noor E Haram Charity Foundation"
  });

  async function loadOrgSettingsData() {
    try {
      const data = await api<any>("/admin/org-settings");
      if (data) {
        setOrgSettingsForm({
          phone: data.phone || "+91 9213408880",
          email: data.email || "support@nooreharam.in",
          website: data.website || "www.nooreharam.in",
          address: data.address || "AT.& PO.Umalla, (Dumala) Vaghpura, Near Masjid, Main Road, Ta. Jhagadia, Dist Bharuch 393120 Gujarat India",
          logo_url: data.logo_url || "",
          seal_image_url: data.seal_image_url || "",
          signature_image_url: data.signature_image_url || "",
          signatory_name: data.signatory_name || "Noor E Haram Charity Foundation"
        });
      }
    } catch (err) {
      console.error("Failed to load org settings:", err);
    }
  }

  async function uploadOrgAsset(file: File, field: "logo_url" | "seal_image_url" | "signature_image_url") {
    setSaving(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const data = await api<{ url: string }>("/admin/org-settings/upload", {
        method: "POST",
        body: formData
      });
      if (data?.url) {
        setOrgSettingsForm((prev) => ({ ...prev, [field]: data.url }));
        toast.success("Asset uploaded successfully!");
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setOrgSettingsForm((prev) => ({ ...prev, [field]: evt.target!.result as string }));
          toast.success("Asset updated!");
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setSaving(false);
    }
  }

  async function saveOrgSettingsSubmit() {
    setSaving(true);
    try {
      await api("/admin/org-settings", {
        method: "PUT",
        body: JSON.stringify(orgSettingsForm)
      });
      toast.success("Organization Settings saved successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save organization settings");
    } finally {
      setSaving(false);
    }
  }

  const [payments, setPayments] = useState<Paginated<Applicant> | null>(null);
  const [donations, setDonations] = useState<Paginated<Donation> | null>(null);
  const [paymentQuery, setPaymentQuery] = useState({ page: 1, search: "", status: "" as PaymentStatus | "", drawId: "", dateFilter: "" });
  const [donationQuery, setDonationQuery] = useState({ page: 1, search: "", status: "", dateFilter: "" });
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("Organization Assets");
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);
  const [newFeedback, setNewFeedback] = useState({ name: "", rating: 5, location: "", message: "" });
  const [documentForm, setDocumentForm] = useState({ title: "", description: "", kind: "dua" });
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [usersQuery, setUsersQuery] = useState({ page: 1, search: "", sortBy: "createdAt", sortOrder: "desc" as SortOrder });
  const [appQuery, setAppQuery] = useState({
    page: 1,
    search: "",
    status: "" as ApplicationStatus | "",
    paymentStatus: "" as PaymentStatus | "",
    drawId: "",
    sortBy: "createdAt",
    sortOrder: "desc" as SortOrder
  });
  const [drawMode, setDrawMode] = useState<"fixed" | "percentage">("fixed");
  const [fixedCount, setFixedCount] = useState(125);
  const [percentage, setPercentage] = useState(1.25);
  const [confirmDraw, setConfirmDraw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [galleryFiles, setGalleryFiles] = useState<FileList | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [drawsList, setDrawsList] = useState<DrawItem[]>([]);
  const [drawBackups, setDrawBackups] = useState<any[]>([]);
  const [marqueeList, setMarqueeList] = useState<MarqueeItem[]>([]);
  const [selectedDrawId, setSelectedDrawId] = useState<string>("");
  const [selectedPrintDrawId, setSelectedPrintDrawId] = useState<string>("");
  const [newDrawName, setNewDrawName] = useState<string>("");
  const [bannerMessageInput, setBannerMessageInput] = useState<string>("");
  const [newMarquee, setNewMarquee] = useState({ content: "", linkUrl: "", eventDate: "", lastDate: "", statusBadge: "", priority: 0 });
  const [selectedWinners, setSelectedWinners] = useState<string[]>([]);
  const [selectedWaitingList, setSelectedWaitingList] = useState<string[]>([]);

  const [feedbackCMSList, setFeedbackCMSList] = useState<FeedbackCMSItem[]>([]);
  const [selectedFeedbackIds, setSelectedFeedbackIds] = useState<string[]>([]);
  const [announcementsList, setAnnouncementsList] = useState<AnnouncementItem[]>([]);
  const [newAnnouncementForm, setNewAnnouncementForm] = useState({
    title: "",
    description: "",
    priority: 0,
    publishDate: "",
    expiryDate: "",
    status: "published" as "draft" | "scheduled" | "published" | "archived",
    locations: "homepage,marquee",
    linkUrl: "",
    badge: "Official Announcement"
  });

  const [duaGuidelinesList, setDuaGuidelinesList] = useState<DuaGuidelineItem[]>([]);
  const [duaForm, setDuaForm] = useState({ title: "", shortDescription: "", description: "", thumbnailUrl: "", order: 0 });
  const [duaPdfFile, setDuaPdfFile] = useState<File | null>(null);

  const [galleryCMSList, setGalleryCMSList] = useState<GalleryCMSItem[]>([]);
  const [newGalleryCMSForm, setNewGalleryCMSForm] = useState({
    imageUrl: "",
    caption: "",
    altText: "",
    description: "",
    category: "General",
    order: 0,
    isVisible: true
  });

  const [contactSettings, setContactSettings] = useState<ContactSettings>({
    contactSupportEmail: "",
    contactGeneralEmail: "",
    contactPhone: "",
    contactAltPhone: "",
    contactAddress: "",
    workingHours: "",
    googleMapsUrl: "",
    socialFacebookUrl: "",
    socialInstagramUrl: "",
    socialYoutubeUrl: "",
    socialWhatsappUrl: "",
    smtpHost: "",
    smtpPort: "587",
    smtpUser: "",
    smtpPass: "",
    smtpSecure: "false",
    smtpFrom: ""
  });

  const [contactMessages, setContactMessages] = useState<ContactMessageItem[]>([]);
  const [cmsStats, setCmsStats] = useState<any>(null);

  async function loadDrawHistory() {
    const history = await api<DrawResult[]>("/admin/draw/history");
    setDrawHistory(history);
  }

  async function loadDashboard() {
    const [nextStats, history, cmsData] = await Promise.all([
      api<Stats>("/admin/stats"),
      api<DrawResult[]>("/admin/draw/history"),
      api<any>("/admin/cms/stats").catch(() => null)
    ]);
    setStats(nextStats);
    setDrawHistory(history);
    if (cmsData) setCmsStats(cmsData);
    loadOrgSettingsData();
  }

  async function loadFeedbackCMS() {
    const res = await api<{ items: FeedbackCMSItem[] }>("/admin/cms/feedback?limit=100");
    setFeedbackCMSList(res.items);
  }

  async function loadAnnouncementsCMS() {
    const res = await api<AnnouncementItem[]>("/admin/cms/announcements");
    setAnnouncementsList(res);
  }

  async function loadDuaGuidelinesCMS() {
    const res = await api<DuaGuidelineItem[]>("/admin/cms/dua-guidelines");
    setDuaGuidelinesList(res);
  }

  async function loadGalleryCMS() {
    const res = await api<GalleryCMSItem[]>("/admin/cms/gallery");
    setGalleryCMSList(res);
  }

  async function loadContactSettingsCMS() {
    const res = await api<ContactSettings>("/admin/cms/contact-settings");
    setContactSettings(res);
    const messages = await api<ContactMessageItem[]>("/admin/cms/contact-messages").catch(() => []);
    setContactMessages(messages);
  }

  async function handleBulkFeedbackAction(action: "publish" | "hide" | "delete" | "feature" | "unfeature") {
    if (selectedFeedbackIds.length === 0) { toast.info("Select testimonials first"); return; }
    setSaving(true);
    try {
      await api("/admin/cms/feedback/bulk", {
        method: "POST",
        body: JSON.stringify({ ids: selectedFeedbackIds, action })
      });
      toast.success(`Bulk operation '${action}' completed!`);
      setSelectedFeedbackIds([]);
      await loadFeedbackCMS();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bulk operation failed");
    } finally { setSaving(false); }
  }

  async function handleUpdateSingleFeedback(id: string, updates: Partial<FeedbackCMSItem>) {
    try {
      await api(`/admin/cms/feedback/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates)
      });
      toast.success("Testimonial updated!");
      await loadFeedbackCMS();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update testimonial");
    }
  }

  async function handleCreateAnnouncement() {
    if (!newAnnouncementForm.title.trim() || !newAnnouncementForm.description.trim()) {
      toast.info("Title and description are required"); return;
    }
    setSaving(true);
    try {
      await api("/admin/cms/announcements", {
        method: "POST",
        body: JSON.stringify(newAnnouncementForm)
      });
      toast.success("Announcement created!");
      setNewAnnouncementForm({
        title: "",
        description: "",
        priority: 0,
        publishDate: "",
        expiryDate: "",
        status: "published",
        locations: "homepage,marquee",
        linkUrl: "",
        badge: "Official Announcement"
      });
      await loadAnnouncementsCMS();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create announcement");
    } finally { setSaving(false); }
  }

  async function handleDeleteAnnouncement(id: string) {
    try {
      await api(`/admin/cms/announcements/${id}`, { method: "DELETE" });
      toast.success("Announcement deleted!");
      await loadAnnouncementsCMS();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete announcement");
    }
  }

  async function handleCreateDuaGuideline(e: FormEvent) {
    e.preventDefault();
    if (!duaForm.title || !duaPdfFile) {
      toast.info("Title and PDF file are required"); return;
    }
    const formData = new FormData();
    formData.append("title", duaForm.title);
    formData.append("shortDescription", duaForm.shortDescription);
    formData.append("description", duaForm.description);
    formData.append("thumbnailUrl", duaForm.thumbnailUrl);
    formData.append("document", duaPdfFile);

    setSaving(true);
    try {
      await api("/admin/cms/dua-guidelines", {
        method: "POST",
        body: formData
      });
      toast.success("Dua Guideline uploaded!");
      setDuaForm({ title: "", shortDescription: "", description: "", thumbnailUrl: "", order: 0 });
      setDuaPdfFile(null);
      await loadDuaGuidelinesCMS();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload guideline");
    } finally { setSaving(false); }
  }

  async function handleDeleteDuaGuideline(id: string) {
    try {
      await api(`/admin/cms/dua-guidelines/${id}`, { method: "DELETE" });
      toast.success("Guideline removed!");
      await loadDuaGuidelinesCMS();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete guideline");
    }
  }

  async function handleCreateGalleryCMSItem() {
    if (!newGalleryCMSForm.imageUrl.trim()) { toast.info("Image URL is required"); return; }
    setSaving(true);
    try {
      await api("/admin/cms/gallery", {
        method: "POST",
        body: JSON.stringify(newGalleryCMSForm)
      });
      toast.success("Gallery image added!");
      setNewGalleryCMSForm({
        imageUrl: "",
        caption: "",
        altText: "",
        description: "",
        category: "General",
        order: 0,
        isVisible: true
      });
      await loadGalleryCMS();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add gallery item");
    } finally { setSaving(false); }
  }

  async function handleUpdateGalleryCMSItem(id: string, updates: Partial<GalleryCMSItem>) {
    try {
      await api(`/admin/cms/gallery/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates)
      });
      toast.success("Gallery item updated!");
      await loadGalleryCMS();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update gallery item");
    }
  }

  async function handleDeleteGalleryCMSItem(id: string) {
    try {
      await api(`/admin/cms/gallery/${id}`, { method: "DELETE" });
      toast.success("Gallery item deleted!");
      await loadGalleryCMS();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete gallery item");
    }
  }

  async function handleSaveContactSettings() {
    setSaving(true);
    try {
      await api("/admin/cms/contact-settings", {
        method: "PATCH",
        body: JSON.stringify(contactSettings)
      });
      toast.success("Contact & SMTP settings saved live!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings");
    } finally { setSaving(false); }
  }

  async function loadDraws() {
    try {
      const res = await api<DrawItem[]>("/admin/draws");
      setDrawsList(res);
      if (res.length > 0) {
        const active = res.find((d) => d.status === "active") || res[0];
        if (!selectedDrawId) setSelectedDrawId(active.id);
        if (!selectedPrintDrawId) setSelectedPrintDrawId(active.id);
        setBannerMessageInput(active.bannerMessage || "");
      }
    } catch (err) {
      console.error("Failed to load draws:", err);
    }
    loadDrawBackups();
  }

  async function loadDrawBackups() {
    try {
      const res = await api<any[]>("/admin/draws/backups");
      setDrawBackups(res || []);
    } catch (err) {
      console.error("Failed to load draw backups:", err);
    }
  }

  async function handleTriggerDrawBackup(drawId: string) {
    setSaving(true);
    try {
      await api(`/admin/draws/${drawId}/backup`, { method: "POST" });
      toast.success("Draw snapshot backup created!");
      await loadDrawBackups();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to backup draw");
    } finally { setSaving(false); }
  }

  async function handleDownloadBackup(backupId: string, drawName: string) {
    try {
      const res = await api<any>(`/admin/draws/backups/${backupId}`);
      if (res?.data?.snapshotData) {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data.snapshotData, null, 2));
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `draw-backup-${drawName.replace(/\s+/g, "_")}-${backupId}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        toast.success("Backup downloaded successfully!");
      } else {
        toast.error("Snapshot data unavailable");
      }
    } catch (err) {
      toast.error("Failed to download backup JSON");
    }
  }

  async function loadMarquees() {
    const res = await api<MarqueeItem[]>("/admin/marquee");
    setMarqueeList(res);
  }

  async function handleCreateDraw() {
    if (!newDrawName.trim()) { toast.info("Enter draw name first"); return; }
    setSaving(true);
    try {
      await api("/admin/draws", {
        method: "POST",
        body: JSON.stringify({ name: newDrawName.trim(), makeActive: true })
      });
      setNewDrawName("");
      toast.success("New Draw created successfully!");
      await loadDraws();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create draw");
    } finally { setSaving(false); }
  }

  async function handleSetActiveDraw(drawId: string) {
    setSaving(true);
    try {
      await api(`/admin/draws/${drawId}/activate`, { method: "POST" });
      toast.success("Draw activated!");
      await loadDraws();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to activate draw");
    } finally { setSaving(false); }
  }

  async function handleDeleteDraw(drawId: string, drawName: string) {
    const confirmName = window.prompt(
      `CRITICAL ACTION:\nAre you sure you want to delete draw "${drawName}"?\n\n- All applicants in this draw will be permanently deleted.\n- Registration sequence counter will roll back to where it was before creating this draw.\n\nType the exact draw name "${drawName}" below to confirm deletion:`
    );
    if (!confirmName || confirmName.trim() !== drawName) {
      if (confirmName !== null) toast.error("Draw name confirmation mismatch. Deletion cancelled.");
      return;
    }
    setSaving(true);
    try {
      const res = await api<{ message: string }>(`/admin/draws/${drawId}`, { method: "DELETE" });
      toast.success(res.message || `Draw '${drawName}' deleted successfully.`);
      if (selectedPrintDrawId === drawId) setSelectedPrintDrawId("");
      await loadDraws();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete draw");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateDrawStatus(drawId: string, status: "active" | "closed" | "archived") {
    setSaving(true);
    try {
      await api(`/admin/draws/${drawId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });
      toast.success(`Draw marked as ${status}!`);
      await loadDraws();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update draw status");
    } finally { setSaving(false); }
  }

  async function handleUpdateAppControl(drawId: string, appControlStatus: "open" | "paused" | "closed") {
    setSaving(true);
    try {
      await api(`/admin/draws/${drawId}/control`, {
        method: "PATCH",
        body: JSON.stringify({ appControlStatus, bannerMessage: bannerMessageInput })
      });
      toast.success(`Applications ${appControlStatus.toUpperCase()}! Banner updated.`);
      await loadDraws();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update application control");
    } finally { setSaving(false); }
  }

  async function handleUpdateApplicantStatus(applicationId: string, status: ApplicationStatus) {
    try {
      await api("/admin/applicants/status", {
        method: "PATCH",
        body: JSON.stringify({ applicationId, status })
      });
      toast.success(`Status updated to ${status}`);
      await loadApplicants();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    }
  }

  async function handleDeclareWinners(drawId: string) {
    if (selectedWinners.length === 0) { toast.info("Select at least one winner"); return; }
    setSaving(true);
    try {
      await api("/admin/draws/winners", {
        method: "POST",
        body: JSON.stringify({ drawId, winnerIds: selectedWinners, waitingListIds: selectedWaitingList })
      });
      toast.success("Winners declared! Website updated automatically.");
      setSelectedWinners([]);
      setSelectedWaitingList([]);
      await Promise.all([loadDraws(), loadApplicants(), loadDrawHistory(), loadDashboard()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to declare winners");
    } finally { setSaving(false); }
  }

  async function handleBulkMarkNotSelected(drawId: string) {
    if (!confirm("Are you sure you want to mark all remaining non-selected applicants in this draw as 'Not Selected'? This will update all remaining entries instantly.")) {
      return;
    }
    setSaving(true);
    try {
      const res = await api<{ count: number }>(`/admin/draws/${drawId}/bulk-mark-not-selected`, {
        method: "POST"
      });
      toast.success(`Successfully updated ${res.count} applicants to 'Not Selected'!`);
      await loadDraws();
      await loadApplicants();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to bulk update status");
    } finally { setSaving(false); }
  }

  async function handleCreateMarquee() {
    if (!newMarquee.content.trim()) { toast.info("Enter announcement content"); return; }
    setSaving(true);
    try {
      await api("/admin/marquee", {
        method: "POST",
        body: JSON.stringify(newMarquee)
      });
      setNewMarquee({ content: "", linkUrl: "", eventDate: "", lastDate: "", statusBadge: "", priority: 0 });
      toast.success("Marquee announcement added!");
      await loadMarquees();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add marquee");
    } finally { setSaving(false); }
  }

  async function handleDeleteMarquee(id: string) {
    try {
      await api(`/admin/marquee/${id}`, { method: "DELETE" });
      toast.success("Marquee item removed");
      await loadMarquees();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove marquee");
    }
  }

  async function handleToggleMarquee(id: string, currentActive: boolean) {
    try {
      await api(`/admin/marquee/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !currentActive })
      });
      toast.success(!currentActive ? "Marquee ticker enabled" : "Marquee ticker disabled");
      await loadMarquees();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update marquee status");
    }
  }

  async function printA4LuckyDrawChits(overrideDrawId?: string) {
    try {
      // Strict draw selection: always require an explicit draw selection
      const targetDrawId = overrideDrawId || selectedPrintDrawId;
      
      if (!targetDrawId) {
        toast.error("Please select a draw from the dropdown before printing chits. Printing across all draws is not allowed.");
        return;
      }

      const selectedDraw = drawsList.find((d) => d.id === targetDrawId);
      if (!selectedDraw) {
        toast.error("Selected draw not found. Please refresh and try again.");
        return;
      }

      toast.info(`Preparing A4 physical lucky draw chits for "${selectedDraw.name}"...`);

      // Always send drawId — backend will reject requests without it
      const res = await api<{ items: Applicant[] }>(`/admin/print/applicants?all=true&drawId=${targetDrawId}`);
      const applicantsList = res.items;

      if (!applicantsList || applicantsList.length === 0) {
        toast.error(`"${selectedDraw.name}" has 0 registered applicants. No chits available to print.`);
        return;
      }

      const printWin = window.open("", "_blank");
      if (!printWin) {
        toast.error("Pop-up blocked! Please allow pop-ups to print chits.");
        return;
      }

      const chitsHtml = applicantsList.map((app, index) => {
        const serialNo = String(index + 1).padStart(3, "0");
        const regNo = app.registrationNo || `NHCF${String(index + 1).padStart(6, "0")}`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://nooreharam.in/verify/${app.id}`;
        const fullAddress = [app.address, app.city, app.stateName].filter((part) => part && part.trim() !== "").join(", ");
        
        return `
          <div class="chit">
            <div class="chit-header">
              <div class="brand">NOOR E HARAM CHARITY FOUNDATION</div>
              <div class="tagline">OFFICIAL LUCKY DRAW ENTRY CHIT</div>
            </div>
            <div class="chit-divider"></div>
            <div class="chit-body">
              <div class="center-info">
                <div>
                  <div class="reg-no">${regNo}</div>
                  <div class="name">${app.user?.name || "Applicant"}</div>
                  <div class="serial">SERIAL: #${serialNo}</div>
                </div>
                <div class="details-section">
                  <div class="details">Address: ${fullAddress || "Address Not Specified"}</div>
                  <div class="details">Phone: ${app.phone || "—"} | Draw: ${(app as any).draw?.name || selectedDraw?.name || "Lucky Draw"}</div>
                  <div class="badge">OFFICIAL VERIFIED ENTRY</div>
                </div>
              </div>
              <div class="right-info">
                <div class="seal-logo">
                  <svg viewBox="0 0 100 100" width="56" height="56" style="display: block;">
                    <circle cx="50" cy="50" r="48" fill="none" stroke="#D8A820" stroke-width="2" stroke-dasharray="2,2"/>
                    <circle cx="50" cy="50" r="44" fill="none" stroke="#D8A820" stroke-width="1"/>
                    <path id="curve-${index}" fill="transparent" d="M 16,50 A 34,34 0 1,1 84,50 A 34,34 0 1,1 16,50" />
                    <text fill="#D8A820" font-size="8.5" font-weight="bold" letter-spacing="0.5">
                      <textPath href="#curve-${index}" startOffset="50%" text-anchor="middle">NOOR E HARAM CHARITY FOUNDATION</textPath>
                    </text>
                    <rect x="35" y="30" width="30" height="35" fill="#D8A820" rx="2"/>
                    <rect x="42" y="25" width="16" height="5" fill="#D8A820" rx="1"/>
                    <text x="14" y="54" font-size="11" fill="#D8A820">★</text>
                    <text x="76" y="54" font-size="11" fill="#D8A820">★</text>
                  </svg>
                </div>
                <div class="qr-box">
                  <img src="${qrUrl}" alt="QR" />
                  <div class="qr-label">SCAN TO VERIFY</div>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join("");

      printWin.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>NOOR E HARAM - Official Lucky Draw Entry Chits (A4 Printable)</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm;
            }
            * {
              box-sizing: border-box;
            }
            body {
              font-family: Arial, Helvetica, sans-serif;
              margin: 0;
              padding: 0;
              background: #fff;
              color: #111;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .page-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              grid-auto-rows: 64mm;
              gap: 4mm;
              page-break-after: always;
            }
            .chit {
              border: 1.5px dashed #0B4633;
              border-radius: 8px;
              padding: 10px 14px 8px 14px;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              background: #FFFFFF;
              position: relative;
              height: 64mm;
              overflow: hidden;
            }
            .chit-header {
              text-align: center;
              padding-bottom: 1px;
            }
            .brand {
              font-size: 13px;
              font-weight: 800;
              color: #0B4633;
              letter-spacing: 0.05em;
              text-transform: uppercase;
              line-height: 1.1;
            }
            .tagline {
              font-size: 8.5px;
              color: #B8860B;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.04em;
              margin-top: 2px;
            }
            .chit-divider {
              width: 100%;
              height: 1.5px;
              background-color: #D8A820;
              margin: 5px 0 8px 0;
            }
            .chit-body {
              display: flex;
              justify-content: space-between;
              flex: 1;
              position: relative;
            }
            .center-info {
              flex: 1;
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
              justify-content: space-between;
              padding: 0 4px;
            }
            .reg-no {
              font-family: Arial, Helvetica, sans-serif;
              font-size: 18px;
              font-weight: 800;
              color: #0B4633;
              letter-spacing: 0.02em;
              line-height: 1.1;
              margin-top: 1px;
              text-align: center;
            }
            .name {
              font-size: 18px;
              font-weight: 800;
              color: #111111;
              line-height: 1.2;
              margin-top: 3px;
              text-align: center;
            }
            .serial {
              font-size: 10.5px;
              font-weight: 700;
              color: #555555;
              margin-top: 3px;
              text-align: center;
            }
            .details-section {
              margin-top: auto;
              text-align: center;
            }
            .details {
              font-size: 9px;
              color: #555555;
              line-height: 1.2;
              text-align: center;
            }
            .badge {
              font-size: 8px;
              font-weight: 700;
              color: #888888;
              letter-spacing: 0.05em;
              margin-top: 2px;
              text-transform: uppercase;
              text-align: center;
            }
            .right-info {
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              align-items: flex-end;
              width: 65px;
            }
            .seal-logo {
              width: 56px;
              height: 56px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .qr-box {
              width: 55px;
              text-align: center;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .qr-box img {
              width: 48px;
              height: 48px;
              display: block;
            }
            .qr-label {
              font-size: 7px;
              color: #555555;
              font-weight: 700;
              letter-spacing: 0.04em;
              margin-top: 2px;
              text-transform: uppercase;
              white-space: nowrap;
            }
          </style>
        </head>
        <body>
          <div class="page-grid">
            ${chitsHtml}
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
        </html>
      `);
      printWin.document.close();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to generate print chits");
    }
  }

  async function loadUsers() {
    const query = toQuery({ ...usersQuery, limit: 10 });
    setUsers(await api<Paginated<User>>(`/admin/users${query}`));
  }

  async function loadApplicants() {
    const query = toQuery({ ...appQuery, limit: 10 });
    setApplicants(await api<Paginated<Applicant>>(`/admin/applicants${query}`));
  }

  async function loadSettings() {
    const data = await api<{
      resultsYoutubeUrl?: string;
      galleryImageUrls?: string;
      termsDocumentUrl?: string;
      umrahPackagePrice?: number;
      socialFacebookUrl?: string;
      socialInstagramUrl?: string;
      socialYoutubeUrl?: string;
      socialWhatsappUrl?: string;
      contactAddress?: string;
      contactPhone?: string;
      contactEmail?: string;
      razorpayPublicKey?: string;
      paymentMode?: string;
      defaultDrawAmount?: number;
      googleMapsUrl?: string;
      officialSealUrl?: string;
      authorizedSignatureUrl?: string;
      admin?: { name: string; email: string };
    }>("/admin/settings");
    setSettings({
      resultsYoutubeUrl: data.resultsYoutubeUrl ?? "",
      galleryImageUrls: data.galleryImageUrls ?? "",
      termsDocumentUrl: data.termsDocumentUrl ?? "",
      umrahPackagePrice: data.umrahPackagePrice ?? 0,
      socialFacebookUrl: data.socialFacebookUrl ?? "",
      socialInstagramUrl: data.socialInstagramUrl ?? "",
      socialYoutubeUrl: data.socialYoutubeUrl ?? "",
      socialWhatsappUrl: data.socialWhatsappUrl ?? "",
      contactAddress: data.contactAddress ?? "",
      contactPhone: data.contactPhone ?? "",
      contactEmail: data.contactEmail ?? "",
      adminName: data.admin?.name ?? "",
      adminEmail: data.admin?.email ?? "",
      razorpayPublicKey: data.razorpayPublicKey ?? "",
      paymentMode: (data.paymentMode ?? "test") as "test" | "live",
      defaultDrawAmount: data.defaultDrawAmount ?? 1499,
      googleMapsUrl: data.googleMapsUrl ?? "",
      officialSealUrl: data.officialSealUrl ?? "",
      authorizedSignatureUrl: data.authorizedSignatureUrl ?? "",
    });
  }

  async function loadPayments() {
    const query = toQuery({ ...paymentQuery, limit: 20 });
    setPayments(await api<Paginated<Applicant>>(`/admin/payments${query}`));
  }

  async function loadDonations() {
    const query = toQuery({ ...donationQuery, limit: 20 });
    setDonations(await api<Paginated<Donation>>(`/admin/donations${query}`));
  }

  async function loadFeedback() {
    setFeedback(await api<Feedback[]>("/admin/feedback"));
  }

  async function loadDocuments() {
    setDocuments(await api<PublicDocument[]>("/admin/documents"));
  }

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }

    setLoading(true);
    Promise.all([
      loadDashboard(),
      loadDraws(),
      loadSettings()
    ])
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Unable to load dashboard");
        if (error instanceof Error && error.message.toLowerCase().includes("token")) router.replace("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  // Tab-based Lazy Data Fetching (Only load data when user opens specific tab)
  useEffect(() => {
    if (!getToken()) return;

    if (activeTab === "Dashboard") {
      loadDashboard().catch((error) => toast.error(error.message));
    } else if (activeTab === "Users") {
      loadUsers().catch((error) => toast.error(error.message));
    } else if (activeTab === "Lucky Draw Applicants" || activeTab === "Draw Control") {
      loadApplicants().catch((error) => toast.error(error.message));
    } else if (activeTab === "Payments") {
      loadPayments().catch((error) => toast.error(error.message));
    } else if (activeTab === "Donations") {
      loadDonations().catch((error) => toast.error(error.message));
    } else if (activeTab === "Announcements") {
      loadAnnouncementsCMS().catch((error) => toast.error(error.message));
      loadMarquees().catch((error) => toast.error(error.message));
    } else if (activeTab === "Dua Guidelines") {
      loadDuaGuidelinesCMS().catch((error) => toast.error(error.message));
    } else if (activeTab === "Gallery CMS") {
      loadGalleryCMS().catch((error) => toast.error(error.message));
    } else if (activeTab === "Feedback CMS") {
      loadFeedbackCMS().catch((error) => toast.error(error.message));
    } else if (activeTab === "Contact & Settings") {
      loadContactSettingsCMS().catch((error) => toast.error(error.message));
    }
  }, [activeTab]);

  useEffect(() => {
    if (getToken() && activeTab === "Users") loadUsers().catch((error) => toast.error(error.message));
  }, [usersQuery]);

  useEffect(() => {
    if (getToken() && (activeTab === "Lucky Draw Applicants" || activeTab === "Draw Control")) {
      loadApplicants().catch((error) => toast.error(error.message));
    }
  }, [appQuery]);

  useEffect(() => {
    if (getToken() && activeTab === "Payments") loadPayments().catch((error) => toast.error(error.message));
  }, [paymentQuery]);

  useEffect(() => {
    if (getToken() && activeTab === "Donations") loadDonations().catch((error) => toast.error(error.message));
  }, [donationQuery]);

  const statCards = useMemo(
    () => [
      { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users },
      { label: "Total Applicants", value: stats?.totalApplicants ?? 0, icon: Trophy },
      { label: "Paid Users", value: stats?.paidUsers ?? 0, icon: WalletCards },
      { label: "Selected Users", value: stats?.selectedUsers ?? 0, icon: BadgeCheck }
    ],
    [stats]
  );

  function logout() {
    clearToken();
    router.replace("/login");
  }

  async function runDraw() {
    setSaving(true);
    try {
      const result = await api<DrawResult>("/admin/draw/run", {
        method: "POST",
        body: JSON.stringify({ mode: drawMode, fixedCount, percentage })
      });
      toast.success(`Lucky draw complete: ${result.selectedCount} selected`);
      setConfirmDraw(false);
      await Promise.all([loadDashboard(), loadDrawHistory(), loadApplicants()]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Draw failed");
    } finally {
      setSaving(false);
    }
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await api("/admin/settings", {
        method: "PATCH",
        body: JSON.stringify(settings)
      });
      toast.success("Settings updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save settings");
    } finally {
      setSaving(false);
    }
  }

  async function addFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await api<Feedback>("/admin/feedback", {
        method: "POST",
        body: JSON.stringify({ ...newFeedback, location: newFeedback.location || undefined })
      });
      setNewFeedback({ name: "", rating: 5, location: "", message: "" });
      await loadFeedback();
      toast.success("Feedback added");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to add feedback");
    } finally {
      setSaving(false);
    }
  }

  async function deleteFeedback(id: string) {
    if (!window.confirm("Delete this feedback permanently?")) return;

    setSaving(true);
    try {
      await api(`/admin/feedback/${id}`, { method: "DELETE" });
      setFeedback((items) => items.filter((item) => item.id !== id));
      toast.success("Feedback deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete feedback");
    } finally {
      setSaving(false);
    }
  }

  async function uploadDocument() {
    if (!documentFile) {
      toast.info("Choose a PDF first");
      return;
    }
    if (!documentFile.name.toLowerCase().endsWith(".pdf") && documentFile.type !== "application/pdf") {
      toast.error("Unsupported file format. Only PDF files are allowed.");
      return;
    }
    if (documentFile.size === 0) {
      toast.error("Invalid or corrupted file. File size is 0 bytes.");
      return;
    }
    if (documentFile.size > 15 * 1024 * 1024) {
      toast.error("File is too large. Maximum PDF file size limit is 15MB.");
      return;
    }
    const formData = new FormData();
    formData.append("title", documentForm.title);
    formData.append("description", documentForm.description);
    formData.append("kind", documentForm.kind);
    formData.append("document", documentFile);

    setSaving(true);
    try {
      const document = await api<PublicDocument>("/admin/documents", { method: "POST", body: formData });
      if (document.kind === "terms") {
        setSettings((value) => ({ ...value, termsDocumentUrl: document.url }));
      }
      setDocumentForm({ title: "", description: "", kind: "dua" });
      setDocumentFile(null);
      await loadDocuments();
      toast.success("PDF uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to upload PDF");
    } finally {
      setSaving(false);
    }
  }

  async function deleteDocument(id: string) {
    setSaving(true);
    try {
      await api(`/admin/documents/${id}`, { method: "DELETE" });
      await loadDocuments();
      toast.success("PDF removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to remove PDF");
    } finally {
      setSaving(false);
    }
  }

  async function uploadGalleryImages() {
    if (!galleryFiles?.length) {
      toast.info("Choose at least one image first");
      return;
    }

    const formData = new FormData();
    Array.from(galleryFiles).forEach((file) => formData.append("images", file));

    setSaving(true);
    try {
      const data = await api<{ galleryImageUrls: string }>("/admin/gallery/upload", {
        method: "POST",
        body: formData
      });
      setSettings((value) => ({ ...value, galleryImageUrls: data.galleryImageUrls }));
      setGalleryFiles(null);
      toast.success("Gallery images uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to upload images");
    } finally {
      setSaving(false);
    }
  }

  async function removeGalleryImage(imageUrl: string) {
    setSaving(true);
    try {
      const data = await api<{ galleryImageUrls: string }>("/admin/gallery/image", {
        method: "DELETE",
        body: JSON.stringify({ imageUrl })
      });
      setSettings((value) => ({ ...value, galleryImageUrls: data.galleryImageUrls }));
      toast.success("Photo removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to remove photo");
    } finally {
      setSaving(false);
    }
  }

  const galleryImages = settings.galleryImageUrls
    .split(/\r?\n/)
    .map((url) => url.trim())
    .filter(Boolean);
  const activeTabMeta = tabs.find((tab) => tab.name === activeTab) ?? tabs[0];
  const ActiveTabIcon = activeTabMeta.icon;

  function exportApplicants() {
    if (!applicants?.items.length) { toast.info("No applicants to export"); return; }
    const rows = applicants.items.map((item) => ({
      Name: item.user.name, Email: item.user.email, Phone: item.phone,
      State: item.stateName, City: item.city, Fee: item.entryFee,
      Status: item.status, Payment: item.paymentStatus, Applied: item.createdAt
    }));
    downloadCsv(rows, "applicants.csv");
  }

  function exportPaymentsCsv() {
    const token = getToken();
    const query = toQuery({ ...paymentQuery });
    const sep = query ? "&" : "?";
    const authParam = token ? `${sep}token=${encodeURIComponent(token)}` : "";
    window.open(`${API_URL}/admin/payments/export-csv${query}${authParam}`, "_blank");
  }

  function exportDonationsCsv() {
    const token = getToken();
    const query = toQuery({ ...donationQuery });
    const sep = query ? "&" : "?";
    const authParam = token ? `${sep}token=${encodeURIComponent(token)}` : "";
    window.open(`${API_URL}/admin/donations/export-csv${query}${authParam}`, "_blank");
  }

  async function markPaymentSuccessful(applicationId: string) {
    if (!window.confirm("Mark this payment as successful? This will generate a receipt. Only use for verified Razorpay payments.")) return;
    setMarkingPaid(applicationId);
    try {
      await api(`/admin/payments/${applicationId}/mark-paid`, { method: "POST" });
      toast.success("Payment marked as successful and receipt generated");
      await loadPayments();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to mark payment");
    } finally {
      setMarkingPaid(null);
    }
  }

  function downloadCsv(rows: Record<string, any>[], filename: string) {
    if (!rows.length) return;
    const csv = [Object.keys(rows[0]).join(","), ...rows.map((row) => Object.values(row).map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  function testDemoReceipt() {
    downloadDonationReceipt({
      id: "demo-donation-12345",
      receiptId: "NHR-DON-DEMO-001",
      donorName: "Demo Donor",
      phone: "9876543210",
      email: "demo@nooreharam.in",
      amount: 5000,
      currency: "INR",
      donationType: "General Sadaqah",
      onBehalfOf: "Late Grandparents",
      status: "completed",
      paymentId: "pay_demo999999",
      orderId: "order_demo99999",
      isAnonymous: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return (
    <main className="min-h-screen overflow-x-hidden">
      <Toaster richColors position="top-right" />
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-stone-200 bg-emerald-deep p-5 text-white lg:block">
          <div className="mb-8 rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-gold">NOOR E HARAM</p>
            <h1 className="mt-1 text-2xl font-semibold">Admin Panel</h1>
          </div>
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold transition ${
                  activeTab === tab.name ? "bg-gold text-emerald-deep shadow-gold" : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-emerald-light/20 bg-emerald-deep px-3 pb-4 pt-3 text-white shadow-emerald md:border-stone-200 md:bg-white/95 md:px-8 md:py-4 md:text-ink md:shadow-none md:backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gold text-emerald-deep shadow-gold md:hidden">
                  <ActiveTabIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gold md:text-sm">Noor-e-Haram Admin</p>
                  <h2 className="truncate text-2xl font-semibold text-white md:text-3xl md:text-emerald-deep">{activeTab}</h2>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <select
                  className="rounded-lg border border-gold/40 bg-cream text-emerald-deep font-semibold text-xs h-9 px-2 shadow-sm focus:outline-none"
                  value={adminLang}
                  onChange={(e) => setAdminLang(e.target.value as AdminLang)}
                >
                  {adminLanguages.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.native} ({l.code.toUpperCase()})
                    </option>
                  ))}
                </select>
                <button className="hidden h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-gold/40 bg-white px-4 text-sm font-semibold text-emerald-deep shadow-sm transition hover:bg-gold-soft md:inline-flex" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-white/10 bg-white/10 p-3 text-sm text-white/85 md:hidden">
              <div className="flex items-center justify-between gap-4">
                <span>Managing trust operations</span>
                <span className="rounded-full bg-gold px-3 py-1 text-xs font-bold text-emerald-deep">Live</span>
              </div>
            </div>
            <div className="mt-4 hidden gap-2 overflow-x-auto md:flex lg:hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
                    activeTab === tab.name ? "bg-emerald-deep text-white" : "bg-white text-stone-600 gold-ring"
                  }`}
                >
                  <tab.icon className="h-4 w-4 shrink-0" />
                  {tab.name}
                </button>
              ))}
            </div>
          </header>

          <div className="p-3 sm:p-4 md:p-8">
            {activeTab === "Dashboard" && (
              <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {statCards.map((card) => (
                    <div key={card.label} className="relative overflow-hidden rounded-xl border border-stone-200 bg-white p-4 shadow-card sm:p-5">
                      <div className="absolute inset-x-0 top-0 h-1 bg-gold" />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-stone-500">{card.label}</p>
                          <p className="mt-2 text-3xl font-bold text-emerald-deep">{loading ? "--" : card.value}</p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gold-soft text-emerald-deep">
                          <card.icon className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-card sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-emerald-deep">Lucky Draw Results History</h3>
                      <p className="text-xs text-stone-500 mt-1">All draw runs sorted by latest first. Auto-refreshes when new draws are run.</p>
                    </div>
                    <button
                      className="btn-secondary h-8 text-xs px-3 flex items-center gap-1.5"
                      onClick={() => loadDrawHistory().catch((e) => toast.error(e.message))}
                    >
                      <RefreshCw className="h-3 w-3" />
                      Refresh
                    </button>
                  </div>
                  {drawHistory.length === 0 ? (
                    <p className="text-sm text-stone-500">No lucky draw has been run yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-cream text-xs font-semibold text-stone-500">
                          <tr>
                            <th className="px-4 py-3">#</th>
                            <th className="px-4 py-3">Draw Name</th>
                            <th className="px-4 py-3">Paid Entries</th>
                            <th className="px-4 py-3">Selected</th>
                            <th className="px-4 py-3">Run At</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 text-stone-700">
                          {drawHistory.map((result, idx) => (
                            <tr key={result.id || `draw-hist-${idx}`} className={`hover:bg-stone-50 ${idx === 0 ? "bg-gold-soft" : ""}`}>
                              <td className="px-4 py-3 font-mono text-xs text-stone-400">#{drawHistory.length - idx}</td>
                              <td className="px-4 py-3 font-semibold text-emerald-deep">
                                {result.draw?.name || "Lucky Draw"}
                                {idx === 0 && <span className="ml-2 rounded bg-gold text-emerald-deep text-[10px] font-bold px-1.5 py-0.5">LATEST</span>}
                              </td>
                              <td className="px-4 py-3 font-bold">{result.totalUsers}</td>
                              <td className="px-4 py-3">
                                <span className="font-bold text-gold">{result.selectedCount}</span>
                                <span className="text-xs text-stone-400 ml-1">selected</span>
                              </td>
                              <td className="px-4 py-3 text-xs text-stone-500">{formatDate(result.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.section>
            )}

            {activeTab === "Users" && (
              <TableShell
                title="Registered Users"
                action={
                  <div className="grid w-full gap-2 sm:grid-cols-[minmax(220px,1fr)_160px_120px] lg:w-auto">
                    <SearchBox value={usersQuery.search} onChange={(search) => setUsersQuery((query) => ({ ...query, page: 1, search }))} />
                    <select className="input" value={usersQuery.sortBy} onChange={(event) => setUsersQuery((query) => ({ ...query, sortBy: event.target.value }))}>
                      <option value="createdAt">Created At</option>
                      <option value="name">Name</option>
                      <option value="email">Email</option>
                      <option value="role">Role</option>
                    </select>
                    <select className="input" value={usersQuery.sortOrder} onChange={(event) => setUsersQuery((query) => ({ ...query, sortOrder: event.target.value as SortOrder }))}>
                      <option value="desc">Desc</option>
                      <option value="asc">Asc</option>
                    </select>
                  </div>
                }
              >
                <div className="grid gap-3 p-3 md:hidden">
                  {!users ? (
                    Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-32 animate-pulse rounded-lg bg-stone-100" />)
                  ) : (
                    users.items.map((user) => (
                      <article key={user.id} className="admin-mobile-card">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="truncate font-semibold text-emerald-deep">{user.name}</h4>
                            <p className="mt-1 break-all text-sm text-stone-500">{user.email}</p>
                          </div>
                          <Badge value={user.role} />
                        </div>
                        <DetailRow label="Joined" value={formatDate(user.createdAt)} />
                      </article>
                    ))
                  )}
                </div>
                <table className="hidden w-full min-w-[760px] text-left text-sm md:table">
                  <thead className="bg-cream text-xs font-semibold text-stone-500">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!users ? <SkeletonRows cols={4} /> : users.items.map((user) => (
                      <tr key={user.id} className="border-t border-stone-100">
                        <td className="px-4 py-4 font-semibold text-stone-800">{user.name}</td>
                        <td className="px-4 py-4 text-stone-600">{user.email}</td>
                        <td className="px-4 py-4"><Badge value={user.role} /></td>
                        <td className="px-4 py-4 text-stone-500">{formatDate(user.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Pagination page={usersQuery.page} pages={users?.meta.pages ?? 1} onPage={(page) => setUsersQuery((query) => ({ ...query, page }))} />
              </TableShell>
            )}

            {activeTab === "Lucky Draw Applicants" && (
              <TableShell
                title="Lucky Draw Applicants"
                action={
                  <div className="grid w-full gap-2 sm:grid-cols-[minmax(200px,1fr)_160px_140px_140px_auto] lg:w-auto">
                    <SearchBox value={appQuery.search} onChange={(search) => setAppQuery((query) => ({ ...query, page: 1, search }))} />
                    <select className="input font-semibold text-emerald-deep" value={appQuery.drawId} onChange={(event) => setAppQuery((query) => ({ ...query, page: 1, drawId: event.target.value }))}>
                      <option value="">-- All Draws --</option>
                      {drawsList.map((d) => (
                        <option key={d.id} value={d.id}>Draw #{d.drawIndex}: {d.name}</option>
                      ))}
                    </select>
                    <select className="input" value={appQuery.status} onChange={(event) => setAppQuery((query) => ({ ...query, page: 1, status: event.target.value as ApplicationStatus | "" }))}>
                      <option value="">All status</option>
                      <option value="pending">Pending</option>
                      <option value="selected">Selected</option>
                      <option value="not_selected">Not selected</option>
                    </select>
                    <select className="input" value={appQuery.paymentStatus} onChange={(event) => setAppQuery((query) => ({ ...query, page: 1, paymentStatus: event.target.value as PaymentStatus | "" }))}>
                      <option value="">All payments</option>
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                    <button className="btn-secondary" onClick={exportApplicants}>
                      <Download className="h-4 w-4" />
                      CSV
                    </button>
                  </div>
                }
              >
                <div className="grid gap-3 p-3 md:hidden">
                  {!applicants ? (
                    Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-56 animate-pulse rounded-lg bg-stone-100" />)
                  ) : (
                    applicants.items.map((item) => (
                      <article key={item.id} className="admin-mobile-card">
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-mono text-sm font-semibold text-gold">{item.registrationNo}</p>
                            <h4 className="mt-1 truncate font-semibold text-emerald-deep">{item.user.name}</h4>
                            <p className="mt-1 break-all text-xs text-stone-500">{item.user.email}</p>
                          </div>
                          <div className="grid gap-1 text-right">
                            <Badge value={item.status} />
                            <Badge value={item.paymentStatus} />
                          </div>
                        </div>
                        <DetailRow label="Draw" value={<span className="rounded bg-gold-soft px-2.5 py-0.5 text-xs font-bold text-emerald-deep">{(item as any).draw?.name || "Draw"}</span>} />
                        <DetailRow label="Phone" value={item.phone} />
                        <DetailRow label="State" value={item.stateName} />
                        <DetailRow label="Address" value={item.address || "—"} />
                        <DetailRow label="Persons" value={item.persons} />
                        <DetailRow label="Fee" value={`Rs.${item.entryFee.toLocaleString("en-IN")}`} />
                        <DetailRow
                          label="Travellers"
                          value={
                            <span className="grid gap-1">
                              {item.travellers?.map((traveller) => (
                                <span key={traveller.id}>{traveller.fullName}</span>
                              ))}
                            </span>
                          }
                        />
                        <DetailRow label="Applied" value={formatDate(item.createdAt)} />
                        <div className="mt-4 flex gap-2">
                          <button type="button" className="btn-secondary w-full justify-center" onClick={() => downloadApplicantTicket(item)}>
                            <Download className="h-4 w-4" />
                            Ticket PDF
                          </button>
                          <button type="button" className="btn-secondary w-full justify-center text-emerald-deep hover:bg-emerald-mist" onClick={() => downloadApplicantTicket(item)}>
                            <RefreshCw className="h-4 w-4" />
                            Regenerate
                          </button>
                        </div>
                      </article>
                    ))
                  )}
                </div>
                <table className="hidden w-full min-w-[1360px] text-left text-sm md:table">
                  <thead className="bg-cream text-xs font-semibold text-stone-500">
                    <tr>
                      <th className="px-4 py-3">Draw</th>
                      <th className="px-4 py-3">Reg No</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">State</th>
                      <th className="px-4 py-3">Address</th>
                      <th className="px-4 py-3">Persons</th>
                      <th className="px-4 py-3">Travellers</th>
                      <th className="px-4 py-3">Fee</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Payment Status</th>
                      <th className="px-4 py-3">Applied Date</th>
                      <th className="px-4 py-3 text-right">Ticket</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!applicants ? <SkeletonRows cols={13} /> : applicants.items.map((item) => (
                      <tr key={item.id} className="border-t border-stone-100">
                        <td className="px-4 py-4">
                          <span className="rounded bg-gold-soft px-2.5 py-1 text-xs font-bold text-emerald-deep whitespace-nowrap">
                            {(item as any).draw?.name || "Draw"}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-mono text-sm font-semibold text-emerald-deep">{item.registrationNo}</td>
                        <td className="px-4 py-4 font-semibold text-stone-800">{item.user.name}</td>
                        <td className="px-4 py-4 text-stone-600">{item.user.email}</td>
                        <td className="px-4 py-4 text-stone-600">{item.phone}</td>
                        <td className="px-4 py-4 text-stone-600">{item.stateName}</td>
                        <td className="px-4 py-4 text-stone-600 max-w-xs truncate" title={item.address}>{item.address || "—"}</td>
                        <td className="px-4 py-4 text-stone-600">{item.persons}</td>
                        <td className="px-4 py-4 text-stone-600">
                          <div className="max-w-xs space-y-1">
                            {item.travellers?.map((traveller) => (
                              <p key={traveller.id}>{traveller.fullName} <span className="text-stone-400">({traveller.phone})</span></p>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-4 font-semibold text-stone-700">Rs.{item.entryFee.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-4">
                          <select
                            className="input h-8 text-xs py-0 px-2 font-medium"
                            value={item.status}
                            onChange={(e) => handleUpdateApplicantStatus(item.id, e.target.value as ApplicationStatus)}
                          >
                            {item.status === "pending" && <option value="pending">Pending</option>}
                            <option value="selected">Selected</option>
                            <option value="not_selected">Not selected</option>
                          </select>
                        </td>
                        <td className="px-4 py-4"><Badge value={item.paymentStatus} /></td>
                        <td className="px-4 py-4 text-stone-500">{formatDate(item.createdAt)}</td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button type="button" className="btn-secondary h-9 px-3" onClick={() => downloadApplicantTicket(item)}>
                              <Download className="h-4 w-4" />
                              PDF
                            </button>
                            <button type="button" className="btn-secondary h-9 px-3 text-emerald-deep hover:bg-emerald-mist" onClick={() => downloadApplicantTicket(item)}>
                              <RefreshCw className="h-4 w-4" />
                              Regenerate
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Pagination page={appQuery.page} pages={applicants?.meta.pages ?? 1} onPage={(page) => setAppQuery((query) => ({ ...query, page }))} />
              </TableShell>
            )}

            {activeTab === "Draw Control" && (
              <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                
                {/* Section 1: Draw Lifecycle Manager */}
                <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-card sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-5">
                    <div>
                      <h3 className="text-xl font-semibold text-emerald-deep">Draw Lifecycle Management</h3>
                      <p className="mt-1 text-sm text-stone-500">Only one draw can be ACTIVE at a time. Each draw maintains isolated numbering (Draw 0 = NHCF000001+, Draw 1 = NHCF100001+).</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        className="input h-10 w-60 text-sm"
                        placeholder="New Draw Name (e.g. Umrah Draw #2)"
                        value={newDrawName}
                        onChange={(e) => setNewDrawName(e.target.value)}
                      />
                      <button className="btn-primary h-10 px-4 text-sm" onClick={handleCreateDraw} disabled={saving}>
                        <Sparkles className="h-4 w-4" />
                        Start New Draw
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {drawsList.length === 0 ? (
                      <p className="text-sm text-stone-500">No draws created yet.</p>
                    ) : (
                      drawsList.map((draw) => (
                        <div
                          key={draw.id}
                          className={`rounded-xl border p-5 space-y-4 ${
                            draw.status === "active" ? "border-gold bg-cream shadow-gold" : "border-stone-200 bg-white"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="font-mono text-xs font-bold text-gold">DRAW #{draw.drawIndex}</span>
                              <h4 className="text-lg font-bold text-emerald-deep">{draw.name}</h4>
                            </div>
                            <Badge value={draw.status} />
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 bg-white/75 p-3 rounded-lg border border-stone-200">
                            <div>Total Apps: <strong>{draw.totalApplications}</strong></div>
                            <div>Paid Apps: <strong>{draw.paidApplications}</strong></div>
                            <div>Verified: <strong>{draw.verifiedApplications}</strong></div>
                            <div>Selected Persons: <strong className="text-gold font-bold">{draw.winnerApplications}</strong></div>
                          </div>

                          <div className="flex flex-wrap gap-2 pt-2">
                            {draw.status !== "active" && (
                              <button
                                className="btn-secondary h-8 text-xs px-3 text-emerald-deep"
                                onClick={() => handleSetActiveDraw(draw.id)}
                                disabled={saving}
                              >
                                Set Active
                              </button>
                            )}
                            {draw.status === "active" && (
                              <button
                                className="btn-secondary h-8 text-xs px-3 text-amber-700"
                                onClick={() => handleUpdateDrawStatus(draw.id, "closed")}
                                disabled={saving}
                              >
                                Close Draw
                              </button>
                            )}
                            <button
                              className="btn-secondary h-8 text-xs px-3 text-red-600 hover:bg-red-50"
                              onClick={() => handleBulkMarkNotSelected(draw.id)}
                              disabled={saving}
                              title="Bulk update all non-selected applicants to 'Not Selected'"
                            >
                              Mark Rest 'Not Selected'
                            </button>
                            <button
                              className="btn-secondary h-8 text-xs px-3 text-blue-700 hover:bg-blue-50"
                              onClick={() => handleTriggerDrawBackup(draw.id)}
                              disabled={saving}
                              title="Create full snapshot backup of this draw"
                            >
                              Backup Draw
                            </button>
                            {draw.status !== "archived" && (
                              <button
                                className="btn-secondary h-8 text-xs px-3 text-stone-500"
                                onClick={() => handleUpdateDrawStatus(draw.id, "archived")}
                                disabled={saving}
                              >
                                Archive
                              </button>
                            )}
                            <button
                              className="btn-secondary h-8 text-xs px-3 text-red-700 bg-red-50 hover:bg-red-100 border-red-200 font-semibold"
                              onClick={() => handleDeleteDraw(draw.id, draw.name)}
                              disabled={saving}
                              title="Delete draw and roll back registration counter"
                            >
                              Delete Draw
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Section 1B: Draw Data Backups & Historical Snapshots */}
                <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-card sm:p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-emerald-deep">Historical Draw Backups</h3>
                      <p className="text-xs text-stone-500">Immutable JSON snapshots created on draw closure or manual backup requests for future audit.</p>
                    </div>
                    <button className="btn-secondary h-8 text-xs px-3" onClick={loadDrawBackups}>
                      Refresh Backups
                    </button>
                  </div>

                  {drawBackups.length === 0 ? (
                    <p className="text-xs text-stone-500 py-4">No draw backups created yet. Click 'Backup Draw' or close a draw to create one.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <tbody className="divide-y divide-stone-200 text-stone-600">
                          {drawBackups.map((b) => (
                            <tr key={b.id} className="hover:bg-stone-50">
                              <td className="p-2.5 font-medium text-emerald-deep">{b.drawName}</td>
                              <td className="p-2.5 font-mono">#{b.drawIndex}</td>
                              <td className="p-2.5 font-bold">{b.totalApplications} Apps</td>
                              <td className="p-2.5 text-emerald-600 font-bold">{b.paidApplications} Paid</td>
                              <td className="p-2.5 text-gold font-bold">{b.winnerApplications} Selected</td>
                              <td className="p-2.5"><span className="rounded bg-stone-200 px-1.5 py-0.5 text-[10px] font-mono text-stone-700">{b.backupReason}</span></td>
                              <td className="p-2.5">{new Date(b.createdAt).toLocaleString("en-IN")}</td>
                              <td className="p-2.5 text-right">
                                <button
                                  className="btn-secondary h-7 text-[11px] px-2.5 text-blue-700"
                                  onClick={() => handleDownloadBackup(b.id, b.drawName)}
                                >
                                  Download JSON
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Section 2: Application Window Control, Public Video Link & Print Chits */}
                <div className="grid gap-6 lg:grid-cols-3">
                  
                  {/* Public YouTube Live / Result Video Link */}
                  <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-card space-y-4 sm:p-6">
                    <div>
                      <h3 className="text-lg font-semibold text-emerald-deep flex items-center gap-2">
                        <Video className="h-5 w-5 text-red-600" />
                        Public YouTube Video Link
                      </h3>
                      <p className="mt-1 text-xs text-stone-500">Publish live stream or result draw video directly to frontend website (/resources page).</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-stone-700">
                        YouTube Live / Result Video URL
                      </label>
                      <input
                        className="input text-sm"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={settings.resultsYoutubeUrl}
                        onChange={(e) => setSettings((v) => ({ ...v, resultsYoutubeUrl: e.target.value }))}
                      />
                      <p className="text-[11px] text-stone-400">
                        Supports YouTube video links, short links, or live streams.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="btn-primary w-full justify-center py-2.5 text-xs font-bold"
                      disabled={saving}
                      onClick={async () => {
                        setSaving(true);
                        try {
                          await api("/admin/settings", {
                            method: "PATCH",
                            body: JSON.stringify({ resultsYoutubeUrl: settings.resultsYoutubeUrl })
                          });
                          toast.success("YouTube URL published to frontend!");
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Failed to publish YouTube URL");
                        } finally {
                          setSaving(false);
                        }
                      }}
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
                      Publish Video Link to Frontend
                    </button>
                  </div>

                  {/* Application Window Control */}
                  <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-card space-y-4 sm:p-6">
                    <div>
                      <h3 className="text-lg font-semibold text-emerald-deep">Application Window Control</h3>
                      <p className="mt-1 text-xs text-stone-500">Control application window state and live website banners.</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        className={`flex-1 py-2 text-xs font-bold rounded-lg border transition ${
                          drawsList.find((d) => d.status === "active")?.appControlStatus === "open"
                            ? "bg-emerald-deep text-white border-emerald-deep"
                            : "bg-white text-stone-700 border-stone-200"
                        }`}
                        onClick={() => {
                          const active = drawsList.find((d) => d.status === "active");
                          if (active) handleUpdateAppControl(active.id, "open");
                        }}
                      >
                        Open Applications
                      </button>
                      <button
                        className={`flex-1 py-2 text-xs font-bold rounded-lg border transition ${
                          drawsList.find((d) => d.status === "active")?.appControlStatus === "paused"
                            ? "bg-amber-500 text-white border-amber-500"
                            : "bg-white text-stone-700 border-stone-200"
                        }`}
                        onClick={() => {
                          const active = drawsList.find((d) => d.status === "active");
                          if (active) handleUpdateAppControl(active.id, "paused");
                        }}
                      >
                        Pause Applications
                      </button>
                      <button
                        className={`flex-1 py-2 text-xs font-bold rounded-lg border transition ${
                          drawsList.find((d) => d.status === "active")?.appControlStatus === "closed"
                            ? "bg-red-600 text-white border-red-600"
                            : "bg-white text-stone-700 border-stone-200"
                        }`}
                        onClick={() => {
                          const active = drawsList.find((d) => d.status === "active");
                          if (active) handleUpdateAppControl(active.id, "closed");
                        }}
                      >
                        Close Applications
                      </button>
                    </div>

                    <label className="grid gap-2 text-xs font-semibold text-stone-700">
                      Live Banner Announcement Message
                      <input
                        className="input text-sm"
                        placeholder="e.g. Applications are currently paused for document verification."
                        value={bannerMessageInput}
                        onChange={(e) => setBannerMessageInput(e.target.value)}
                      />
                    </label>
                  </div>

                  {/* Print Lucky Draw Chits for Physical Box */}
                  <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-card space-y-4 sm:p-6">
                    <div>
                      <h3 className="text-lg font-semibold text-emerald-deep">Print Physical Lucky Draw Chits</h3>
                      <p className="mt-1 text-xs text-stone-500">Generate A4-optimized chits with dashed cut marks, QR codes, and registration numbers for physical draw box selection.</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-stone-700">
                        Select Draw to Print Chits From: <span className="text-red-500">*</span>
                      </label>
                      <select
                        className={`input w-full font-semibold ${selectedPrintDrawId ? "bg-white text-emerald-deep" : "bg-red-50 border-red-300 text-red-700"}`}
                        value={selectedPrintDrawId}
                        onChange={(e) => setSelectedPrintDrawId(e.target.value)}
                      >
                        <option value="">⚠ Select a draw first (required)</option>
                        {drawsList.map((draw) => (
                          <option key={draw.id} value={draw.id}>
                            Draw #{draw.drawIndex}: {draw.name} ({draw.status.toUpperCase()}) - {draw.totalApplications} Entries
                          </option>
                        ))}
                      </select>
                      {!selectedPrintDrawId && (
                        <p className="text-xs text-red-500 font-medium">⚠ You must select a specific draw. Printing across all draws is not allowed.</p>
                      )}
                    </div>

                    {selectedPrintDrawId && (
                      <div className="p-4 bg-cream border border-gold/40 rounded-lg space-y-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">
                          <Printer className="h-4 w-4 text-emerald-deep" />
                          <span>A4 Grid Layout (8 chits per page)</span>
                        </div>
                        <p className="text-xs text-stone-500">
                          Prints verified applicant chits with QR code, applicant name, and registration numbers
                          {` for Draw #${drawsList.find(d => d.id === selectedPrintDrawId)?.drawIndex || ""}: ${drawsList.find(d => d.id === selectedPrintDrawId)?.name || ""}`}.
                        </p>
                      </div>
                    )}

                    <button
                      className={`btn-primary w-full justify-center py-3 ${!selectedPrintDrawId ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() => printA4LuckyDrawChits()}
                      disabled={!selectedPrintDrawId}
                    >
                      <Printer className="h-4 w-4" />
                      {selectedPrintDrawId
                        ? `Print Chits for "${drawsList.find(d => d.id === selectedPrintDrawId)?.name || "Selected Draw"}"`
                        : "Select a Draw First to Print Chits"
                      }
                    </button>
                  </div>
                </div>

                {/* Section 3: Selection Declaration & Bulk Status Panel */}
                <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-card sm:p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-emerald-deep">Selected Persons Declaration & Bulk Status Update</h3>
                    <p className="mt-1 text-sm text-stone-500">Perform random selection for lucky applicants, or bulk update all remaining non-selected applicants (up to 10,000 entries) to 'Not Selected'.</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <button className={`rounded-lg border p-4 text-left ${drawMode === "fixed" ? "border-gold bg-gold-soft" : "border-stone-200 bg-white"}`} onClick={() => setDrawMode("fixed")}>
                      <p className="font-semibold text-emerald-deep">Fixed Seat Count</p>
                      <input className="input mt-3 w-full" type="number" min={1} value={fixedCount} onChange={(event) => setFixedCount(Number(event.target.value))} />
                    </button>
                    <button className={`rounded-lg border p-4 text-left ${drawMode === "percentage" ? "border-gold bg-gold-soft" : "border-stone-200 bg-white"}`} onClick={() => setDrawMode("percentage")}>
                      <p className="font-semibold text-emerald-deep">Percentage</p>
                      <input className="input mt-3 w-full" type="number" min={0.01} step={0.01} value={percentage} onChange={(event) => setPercentage(Number(event.target.value))} />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button className="btn-primary" onClick={() => setConfirmDraw(true)}>
                      <Sparkles className="h-4 w-4" />
                      Execute Random Selection Engine
                    </button>

                    <button
                      className="btn-secondary text-red-700 border-red-200 hover:bg-red-50"
                      onClick={() => {
                        const active = drawsList.find((d) => d.status === "active");
                        if (active) handleBulkMarkNotSelected(active.id);
                        else toast.info("No active draw selected");
                      }}
                      disabled={saving}
                    >
                      Mark All Remaining Applicants as 'Not Selected'
                    </button>
                  </div>
                </div>
              </motion.section>
            )}

            {activeTab === "YouTube & Live Stream" && (
              <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-card space-y-6 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
                    <div>
                      <h3 className="text-xl font-bold text-emerald-deep flex items-center gap-2">
                        <Video className="h-6 w-6 text-red-600" />
                        Public YouTube Video & Live Selection Stream
                      </h3>
                      <p className="text-xs text-stone-600 mt-1">
                        Publish live streams or selection result video links directly to the public website homepage and resources page.
                      </p>
                    </div>
                    <a
                      href="https://www.youtube.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-xs"
                    >
                      <Globe className="h-4 w-4" />
                      Open YouTube Studio
                    </a>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* Link Publisher Box */}
                    <div className="space-y-5 rounded-xl border border-stone-200 bg-cream/50 p-5">
                      <h4 className="font-semibold text-emerald-deep">1. Selection Result / Live Selection Stream Link</h4>
                      <p className="text-xs text-stone-500">
                        Paste any YouTube video link (watch URL, shortened link, or live stream URL). This video is embedded directly in the frontend <strong>/resources</strong> section.
                      </p>

                      <label className="grid gap-2 text-xs font-semibold text-stone-700">
                        YouTube Stream / Video URL
                        <input
                          className="input text-sm"
                          placeholder="e.g. https://www.youtube.com/watch?v=... or https://youtu.be/..."
                          value={settings.resultsYoutubeUrl}
                          onChange={(e) => setSettings((v) => ({ ...v, resultsYoutubeUrl: e.target.value }))}
                        />
                      </label>

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="button"
                          className="btn-primary flex-1 justify-center py-2.5 text-xs font-bold"
                          disabled={saving}
                          onClick={async () => {
                            setSaving(true);
                            try {
                              await api("/admin/settings", {
                                method: "PATCH",
                                body: JSON.stringify({ resultsYoutubeUrl: settings.resultsYoutubeUrl })
                              });
                              toast.success("YouTube URL published live to frontend!");
                            } catch (err) {
                              toast.error(err instanceof Error ? err.message : "Failed to publish YouTube URL");
                            } finally {
                              setSaving(false);
                            }
                          }}
                        >
                          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
                          Publish Video Link to Frontend
                        </button>
                      </div>
                    </div>

                    {/* Live Preview Box */}
                    <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
                      <h4 className="font-semibold text-emerald-deep flex items-center justify-between">
                        <span>2. Live Website Preview</span>
                        {settings.resultsYoutubeUrl ? (
                          <span className="rounded-full bg-emerald-mist px-2.5 py-0.5 text-[11px] font-bold text-emerald-deep">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-bold text-stone-500">
                            NO LINK SET
                          </span>
                        )}
                      </h4>

                      <div className="aspect-video overflow-hidden rounded-lg bg-stone-900 flex items-center justify-center border border-stone-200">
                        {settings.resultsYoutubeUrl ? (
                          <iframe
                            className="h-full w-full"
                            src={
                              settings.resultsYoutubeUrl.includes("embed")
                                ? settings.resultsYoutubeUrl
                                : settings.resultsYoutubeUrl.includes("youtu.be")
                                ? `https://www.youtube.com/embed/${settings.resultsYoutubeUrl.split("/").pop()?.split("?")[0]}`
                                : settings.resultsYoutubeUrl.includes("watch?v=")
                                ? `https://www.youtube.com/embed/${new URLSearchParams(settings.resultsYoutubeUrl.split("?")[1] || "").get("v")}`
                                : settings.resultsYoutubeUrl.includes("/live/")
                                ? `https://www.youtube.com/embed/${settings.resultsYoutubeUrl.split("/live/")[1]?.split("?")[0]}`
                                : settings.resultsYoutubeUrl
                            }
                            title="YouTube Preview"
                            allowFullScreen
                          />
                        ) : (
                          <div className="p-6 text-center text-stone-400">
                            <Video className="mx-auto mb-2 h-10 w-10 text-stone-600" />
                            <p className="text-sm font-medium">No YouTube link provided yet</p>
                            <p className="mt-1 text-xs text-stone-500">Paste a link on the left and click publish to preview.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Channel Link */}
                  <div className="border-t border-stone-100 pt-5 grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-xs font-semibold text-stone-700">
                      Official YouTube Channel Page URL (Header & Footer Link)
                      <input
                        className="input text-sm"
                        placeholder="https://youtube.com/@nooreharamcharityfoundation"
                        value={settings.socialYoutubeUrl}
                        onChange={(e) => setSettings((v) => ({ ...v, socialYoutubeUrl: e.target.value }))}
                      />
                      <span className="text-[11px] text-stone-400">
                        This link opens the foundation's official YouTube channel when users click the YouTube icon in the website topbar or footer.
                      </span>
                    </label>

                    <div className="flex items-end">
                      <button
                        type="button"
                        className="btn-secondary h-10 text-xs px-5 font-semibold"
                        disabled={saving}
                        onClick={async () => {
                          setSaving(true);
                          try {
                            await api("/admin/settings", {
                              method: "PATCH",
                              body: JSON.stringify({ socialYoutubeUrl: settings.socialYoutubeUrl })
                            });
                            toast.success("YouTube Channel URL updated!");
                          } catch (err) {
                            toast.error(err instanceof Error ? err.message : "Failed to update channel URL");
                          } finally {
                            setSaving(false);
                          }
                        }}
                      >
                        Save Channel Link
                      </button>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            {activeTab === "Announcements" && (
              <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                {/* 1. Top Marquee Ticker Manager */}
                <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-card space-y-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
                    <div>
                      <h3 className="text-xl font-bold text-emerald-deep flex items-center gap-2">
                        <Bell className="h-5 w-5 text-gold" />
                        Top Scrolling Marquee Bar
                      </h3>
                      <p className="text-xs text-stone-600 mt-1">
                        <strong>Where shown:</strong> Displayed continuously scrolling at the very top header banner of the website homepage.
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                      {marqueeList.filter((m) => m.isActive).length} Active Tickers
                    </span>
                  </div>

                  {/* Marquee Form */}
                  <form onSubmit={(e) => { e.preventDefault(); handleCreateMarquee(); }} className="grid gap-4 md:grid-cols-12 items-end bg-stone-50/80 p-4 rounded-xl border border-stone-200">
                    <div className="md:col-span-6">
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Ticker Message Text *
                      </label>
                      <input
                        className="input text-xs w-full bg-white"
                        placeholder="Registration for Umrah 2026 is now open."
                        value={newMarquee.content}
                        onChange={(e) => setNewMarquee((v) => ({ ...v, content: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Badge Tag (Optional)
                      </label>
                      <input
                        className="input text-xs w-full bg-white"
                        placeholder="NOTICE"
                        value={newMarquee.statusBadge || ""}
                        onChange={(e) => setNewMarquee((v) => ({ ...v, statusBadge: e.target.value }))}
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Target Link URL (Optional)
                      </label>
                      <input
                        className="input text-xs w-full bg-white"
                        placeholder="/draw"
                        value={newMarquee.linkUrl || ""}
                        onChange={(e) => setNewMarquee((v) => ({ ...v, linkUrl: e.target.value }))}
                      />
                    </div>

                    <div className="md:col-span-12 flex justify-end">
                      <button className="btn-primary text-xs px-4 py-2" disabled={saving}>
                        <Plus className="h-3.5 w-3.5" />
                        Add Ticker
                      </button>
                    </div>
                  </form>

                  {/* Saved Marquee Tickers */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">Current Ticker Messages</h4>
                    {marqueeList.length === 0 ? (
                      <div className="p-4 text-center rounded-lg border border-dashed border-stone-200 text-stone-400 text-xs">
                        No marquee ticker messages created yet.
                      </div>
                    ) : (
                      <div className="divide-y divide-stone-100 rounded-lg border border-stone-200 bg-white">
                        {marqueeList.map((item, idx) => (
                          <div key={item.id || `marquee-${idx}`} className="flex flex-wrap items-center justify-between p-3.5 gap-3 hover:bg-stone-50/50">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${item.isActive ? "bg-emerald-500 animate-pulse" : "bg-stone-300"}`} />
                              {item.statusBadge && (
                                <span className="rounded bg-gold/20 text-emerald-800 text-[10px] font-bold px-2 py-0.5 border border-gold/30 shrink-0">
                                  {item.statusBadge}
                                </span>
                              )}
                              <span className="text-xs font-medium text-stone-800 truncate">{item.content}</span>
                              {item.linkUrl && (
                                <span className="text-[11px] text-stone-400 truncate hidden sm:inline">(Link: {item.linkUrl})</span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                className={`btn-secondary text-[11px] px-2.5 py-1 ${item.isActive ? "text-amber-700 bg-amber-50 hover:bg-amber-100" : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"}`}
                                onClick={() => handleToggleMarquee(item.id, item.isActive)}
                              >
                                {item.isActive ? "Disable" : "Enable"}
                              </button>
                              <button
                                type="button"
                                className="btn-secondary text-[11px] px-2.5 py-1 text-red-600 hover:bg-red-50"
                                onClick={() => handleDeleteMarquee(item.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Detailed System Announcements */}
                <div className="space-y-4">
                  <div className="rounded-xl border border-stone-200 bg-white p-4">
                    <h3 className="text-base font-bold text-emerald-deep">Detailed Website Announcements</h3>
                    <p className="text-xs text-stone-600 mt-1">
                      <strong>Where shown:</strong> Displayed in full card format under the Announcements section on the homepage and in popup alerts.
                    </p>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
                    {/* Announcement Creator Form */}
                    <form onSubmit={(e) => { e.preventDefault(); handleCreateAnnouncement(); }} className="rounded-xl border border-stone-200 bg-white p-5 shadow-card space-y-4 sm:p-6">
                      <h4 className="text-lg font-bold text-emerald-deep">New Announcement</h4>

                      <label className="grid gap-2 text-xs font-semibold text-stone-700">
                        Title *
                        <input
                          className="input text-sm"
                          placeholder="Announcement title"
                          value={newAnnouncementForm.title}
                          onChange={(e) => setNewAnnouncementForm((v) => ({ ...v, title: e.target.value }))}
                          required
                        />
                      </label>

                      <label className="grid gap-2 text-xs font-semibold text-stone-700">
                        Description *
                        <textarea
                          className="input min-h-24 text-sm"
                          placeholder="Announcement details..."
                          value={newAnnouncementForm.description}
                          onChange={(e) => setNewAnnouncementForm((v) => ({ ...v, description: e.target.value }))}
                          required
                        />
                      </label>

                      <div className="grid grid-cols-2 gap-3">
                        <label className="grid gap-2 text-xs font-semibold text-stone-700">
                          Status
                          <select
                            className="input text-xs"
                            value={newAnnouncementForm.status}
                            onChange={(e) => setNewAnnouncementForm((v) => ({ ...v, status: e.target.value as any }))}
                          >
                            <option value="published">Published</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="draft">Draft</option>
                            <option value="archived">Archived</option>
                          </select>
                        </label>

                        <label className="grid gap-2 text-xs font-semibold text-stone-700">
                          Priority Score
                          <input
                            className="input text-xs"
                            type="number"
                            value={newAnnouncementForm.priority}
                            onChange={(e) => setNewAnnouncementForm((v) => ({ ...v, priority: Number(e.target.value) }))}
                          />
                        </label>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <label className="grid gap-2 text-xs font-semibold text-stone-700">
                          Publish Date
                          <input
                            className="input text-xs"
                            type="date"
                            value={newAnnouncementForm.publishDate}
                            onChange={(e) => setNewAnnouncementForm((v) => ({ ...v, publishDate: e.target.value }))}
                          />
                        </label>
                        <label className="grid gap-2 text-xs font-semibold text-stone-700">
                          Expiry Date
                          <input
                            className="input text-xs"
                            type="date"
                            value={newAnnouncementForm.expiryDate}
                            onChange={(e) => setNewAnnouncementForm((v) => ({ ...v, expiryDate: e.target.value }))}
                          />
                        </label>
                      </div>

                      <label className="grid gap-2 text-xs font-semibold text-stone-700">
                        Display Location
                        <input
                          className="input text-xs"
                          placeholder="homepage,popup"
                          value={newAnnouncementForm.locations}
                          onChange={(e) => setNewAnnouncementForm((v) => ({ ...v, locations: e.target.value }))}
                        />
                      </label>

                      <label className="grid gap-2 text-xs font-semibold text-stone-700">
                        Badge Label
                        <input
                          className="input text-xs"
                          placeholder="Official Notice"
                          value={newAnnouncementForm.badge}
                          onChange={(e) => setNewAnnouncementForm((v) => ({ ...v, badge: e.target.value }))}
                        />
                      </label>

                      <button className="btn-primary w-full justify-center" disabled={saving}>
                        <Plus className="h-4 w-4" />
                        Publish Announcement
                      </button>
                    </form>

                    {/* Announcement List */}
                    <TableShell title="System Announcements" action={<span className="text-xs text-stone-500">{announcementsList.length} items</span>}>
                      <div className="space-y-3 p-4">
                        {announcementsList.length === 0 ? (
                          <p className="text-sm text-stone-500">No announcements published.</p>
                        ) : (
                          announcementsList.map((item) => (
                            <div key={item.id} className="p-4 rounded-xl border border-stone-200 bg-white space-y-2">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  {item.badge && <Badge value={item.badge} />}
                                  <Badge value={item.status} />
                                  <span className="text-xs text-stone-400 font-mono">Priority: {item.priority}</span>
                                </div>
                                <button
                                  type="button"
                                  className="btn-secondary h-8 px-2.5 text-xs text-red-600"
                                  onClick={() => handleDeleteAnnouncement(item.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Delete
                                </button>
                              </div>

                              <h4 className="text-base font-bold text-emerald-deep">{item.title}</h4>
                              <p className="text-sm text-stone-600">{item.description}</p>
                              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-400">
                                <span>Locations: <strong>{item.locations}</strong></span>
                                <span>Created: {formatDate(item.createdAt)}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </TableShell>
                  </div>
                </div>
              </motion.section>
            )}

            {activeTab === "Dua Guidelines" && (
              <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 xl:grid-cols-[400px_1fr]">
                {/* Upload Form */}
                <form onSubmit={handleCreateDuaGuideline} className="rounded-xl border border-stone-200 bg-white p-5 shadow-card space-y-4 sm:p-6">
                  <h3 className="text-xl font-semibold text-emerald-deep">Upload Dua Guideline PDF</h3>

                  <label className="grid gap-2 text-xs font-semibold text-stone-700">
                    Title *
                    <input
                      className="input text-sm"
                      placeholder="e.g. Complete Umrah Dua Guide 2026"
                      value={duaForm.title}
                      onChange={(e) => setDuaForm((v) => ({ ...v, title: e.target.value }))}
                      required
                    />
                  </label>

                  <label className="grid gap-2 text-xs font-semibold text-stone-700">
                    Short Description
                    <input
                      className="input text-sm"
                      placeholder="e.g. Essential duas for Tawaf and Sa'i"
                      value={duaForm.shortDescription}
                      onChange={(e) => setDuaForm((v) => ({ ...v, shortDescription: e.target.value }))}
                    />
                  </label>

                  <label className="grid gap-2 text-xs font-semibold text-stone-700">
                    Thumbnail Image URL
                    <input
                      className="input text-xs"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={duaForm.thumbnailUrl}
                      onChange={(e) => setDuaForm((v) => ({ ...v, thumbnailUrl: e.target.value }))}
                    />
                  </label>

                  <label className="grid gap-2 text-xs font-semibold text-stone-700">
                    PDF Document File *
                    <input
                      className="input text-xs pt-1.5"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setDuaPdfFile(e.target.files?.[0] || null)}
                      required
                    />
                  </label>

                  <button className="btn-primary w-full justify-center" disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}
                    Upload Dua PDF
                  </button>
                </form>

                {/* Guidelines List */}
                <TableShell title="Published Dua Guidelines & Reminders" action={<span className="text-xs text-stone-500">{duaGuidelinesList.length} total</span>}>
                  <div className="grid gap-4 p-4 md:grid-cols-2">
                    {duaGuidelinesList.length === 0 ? (
                      <p className="text-sm text-stone-500">No Dua Guidelines uploaded yet.</p>
                    ) : (
                      duaGuidelinesList.map((item) => (
                        <div key={item.id} className="p-4 rounded-xl border border-stone-200 bg-white space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold-soft text-emerald-deep">
                                <FileText className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="font-bold text-emerald-deep text-sm">{item.title}</h4>
                                <p className="text-xs text-stone-500">{item.shortDescription || item.filename}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="btn-secondary h-8 px-2.5 text-xs text-red-600"
                              onClick={() => handleDeleteDuaGuideline(item.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-xs text-stone-400 border-t border-stone-100 pt-2">
                            <span>Kind: <strong>{item.kind}</strong></span>
                            <span>{formatDate(item.createdAt)}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TableShell>
              </motion.section>
            )}

            {activeTab === "Gallery CMS" && (
              <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <form onSubmit={(e) => { e.preventDefault(); handleCreateGalleryCMSItem(); }} className="rounded-xl border border-stone-200 bg-white p-5 shadow-card space-y-4 sm:p-6">
                  <h3 className="text-xl font-semibold text-emerald-deep">Add Gallery Photo</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <label className="grid gap-2 text-xs font-semibold text-stone-700">
                      Image URL *
                      <input
                        className="input text-sm"
                        placeholder="https://images.unsplash.com/..."
                        value={newGalleryCMSForm.imageUrl}
                        onChange={(e) => setNewGalleryCMSForm((v) => ({ ...v, imageUrl: e.target.value }))}
                        required
                      />
                    </label>

                    <label className="grid gap-2 text-xs font-semibold text-stone-700">
                      Caption
                      <input
                        className="input text-sm"
                        placeholder="e.g. Pilgrims arriving at Holy Kaaba"
                        value={newGalleryCMSForm.caption}
                        onChange={(e) => setNewGalleryCMSForm((v) => ({ ...v, caption: e.target.value }))}
                      />
                    </label>

                    <label className="grid gap-2 text-xs font-semibold text-stone-700">
                      Category
                      <select
                        className="input text-sm"
                        value={newGalleryCMSForm.category}
                        onChange={(e) => setNewGalleryCMSForm((v) => ({ ...v, category: e.target.value }))}
                      >
                        <option value="General">General</option>
                        <option value="Umrah">Umrah</option>
                        <option value="Charity">Charity</option>
                        <option value="Events">Events</option>
                      </select>
                    </label>
                  </div>

                  <button className="btn-primary" disabled={saving}>
                    <Plus className="h-4 w-4" />
                    Add Photo to Gallery
                  </button>
                </form>

                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                  {galleryCMSList.map((item) => (
                    <div key={item.id} className="rounded-xl border border-stone-200 bg-white overflow-hidden space-y-3 p-3">
                      <div className="aspect-video bg-stone-100 rounded-lg overflow-hidden relative">
                        <img src={item.imageUrl} alt={item.altText || item.caption || "Gallery"} className="w-full h-full object-cover" />
                        <button
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white text-xs"
                          onClick={() => handleDeleteGalleryCMSItem(item.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <input
                        className="input text-xs"
                        placeholder="Caption"
                        value={item.caption || ""}
                        onChange={(e) => handleUpdateGalleryCMSItem(item.id, { caption: e.target.value })}
                      />

                      <div className="flex items-center justify-between gap-2 text-xs">
                        <select
                          className="input py-1 px-2 text-xs font-semibold text-emerald-deep"
                          value={item.category || "General"}
                          onChange={(e) => handleUpdateGalleryCMSItem(item.id, { category: e.target.value })}
                        >
                          <option value="General">General</option>
                          <option value="Events">Events</option>
                          <option value="Charity">Charity</option>
                          <option value="Umrah">Umrah</option>
                        </select>
                        <button
                          type="button"
                          className={`btn-secondary h-7 px-2 text-xs ${item.isVisible ? "text-emerald-700" : "text-stone-400"}`}
                          onClick={() => handleUpdateGalleryCMSItem(item.id, { isVisible: !item.isVisible })}
                        >
                          {item.isVisible ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                          {item.isVisible ? "Visible" : "Hidden"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {activeTab === "Feedback CMS" && (
              <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                
                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-stone-200 bg-white">
                  <div className="flex items-center gap-2 text-sm font-semibold text-stone-700">
                    <CheckSquare className="h-4 w-4 text-emerald-deep" />
                    <span>{selectedFeedbackIds.length} Selected</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button className="btn-secondary h-9 px-3 text-xs text-emerald-700" onClick={() => handleBulkFeedbackAction("publish")}>
                      Publish Selected
                    </button>
                    <button className="btn-secondary h-9 px-3 text-xs text-amber-700" onClick={() => handleBulkFeedbackAction("hide")}>
                      Hide Selected
                    </button>
                    <button className="btn-secondary h-9 px-3 text-xs text-gold" onClick={() => handleBulkFeedbackAction("feature")}>
                      Feature Selected
                    </button>
                    <button className="btn-secondary h-9 px-3 text-xs text-red-600" onClick={() => handleBulkFeedbackAction("delete")}>
                      Delete Selected
                    </button>
                  </div>
                </div>

                <TableShell title="Testimonials & Public Reviews" action={<span className="text-xs text-stone-500">{feedbackCMSList.length} items</span>}>
                  <table className="w-full text-left text-sm">
                    <thead className="bg-cream text-xs font-semibold text-stone-500">
                      <tr>
                        <th className="px-4 py-3 w-10">
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              if (e.target.checked) setSelectedFeedbackIds(feedbackCMSList.map((f) => f.id));
                              else setSelectedFeedbackIds([]);
                            }}
                          />
                        </th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Stars</th>
                        <th className="px-4 py-3">Message</th>
                        <th className="px-4 py-3">Featured</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feedbackCMSList.map((item) => (
                        <tr key={item.id} className="border-t border-stone-100">
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={selectedFeedbackIds.includes(item.id)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedFeedbackIds((ids) => [...ids, item.id]);
                                else setSelectedFeedbackIds((ids) => ids.filter((id) => id !== item.id));
                              }}
                            />
                          </td>
                          <td className="px-4 py-4 font-semibold text-stone-800">
                            {item.name}
                            <p className="text-xs text-stone-400">{item.location || "Gujarat"}</p>
                          </td>
                          <td className="px-4 py-4 text-gold font-bold">{item.rating} ★</td>
                          <td className="px-4 py-4 text-stone-600 max-w-sm truncate" title={item.message}>{item.message}</td>
                          <td className="px-4 py-4">
                            <button
                              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                item.isFeatured ? "bg-gold text-emerald-deep" : "bg-stone-100 text-stone-500"
                              }`}
                              onClick={() => handleUpdateSingleFeedback(item.id, { isFeatured: !item.isFeatured })}
                            >
                              {item.isFeatured ? "★ Featured" : "Standard"}
                            </button>
                          </td>
                          <td className="px-4 py-4">
                            <Badge value={item.isPublished ? "published" : "closed"} />
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                className="btn-secondary h-8 px-2 text-xs"
                                onClick={() => handleUpdateSingleFeedback(item.id, { isPublished: !item.isPublished })}
                              >
                                {item.isPublished ? "Hide" : "Publish"}
                              </button>
                              <button
                                className="btn-secondary h-8 px-2 text-xs text-red-600"
                                onClick={() => {
                                  if (window.confirm("Delete testimonial?")) {
                                    api(`/admin/cms/feedback/${item.id}`, { method: "DELETE" }).then(() => loadFeedbackCMS());
                                  }
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableShell>
              </motion.section>
            )}

            {activeTab === "Contact & Settings" && (
              <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                
                {/* Contact Settings */}
                <form onSubmit={(e) => { e.preventDefault(); handleSaveContactSettings(); }} className="rounded-xl border border-stone-200 bg-white p-5 shadow-card space-y-4 sm:p-6">
                  <h3 className="text-xl font-semibold text-emerald-deep">Contact & Social Media Settings</h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-xs font-semibold text-stone-700">
                      Support Email
                      <input
                        className="input text-sm"
                        value={contactSettings.contactSupportEmail}
                        onChange={(e) => setContactSettings((v) => ({ ...v, contactSupportEmail: e.target.value }))}
                      />
                    </label>

                    <label className="grid gap-2 text-xs font-semibold text-stone-700">
                      General Email
                      <input
                        className="input text-sm"
                        value={contactSettings.contactGeneralEmail}
                        onChange={(e) => setContactSettings((v) => ({ ...v, contactGeneralEmail: e.target.value }))}
                      />
                    </label>

                    <label className="grid gap-2 text-xs font-semibold text-stone-700">
                      Primary Phone
                      <input
                        className="input text-sm"
                        value={contactSettings.contactPhone}
                        onChange={(e) => setContactSettings((v) => ({ ...v, contactPhone: e.target.value }))}
                      />
                    </label>

                    <label className="grid gap-2 text-xs font-semibold text-stone-700">
                      Alternate Phone
                      <input
                        className="input text-sm"
                        value={contactSettings.contactAltPhone}
                        onChange={(e) => setContactSettings((v) => ({ ...v, contactAltPhone: e.target.value }))}
                      />
                    </label>

                    <label className="grid gap-2 text-xs font-semibold text-stone-700">
                      Working Hours
                      <input
                        className="input text-sm"
                        value={contactSettings.workingHours}
                        onChange={(e) => setContactSettings((v) => ({ ...v, workingHours: e.target.value }))}
                      />
                    </label>

                    <label className="grid gap-2 text-xs font-semibold text-stone-700">
                      Google Maps Embed URL
                      <input
                        className="input text-sm"
                        value={contactSettings.googleMapsUrl}
                        onChange={(e) => setContactSettings((v) => ({ ...v, googleMapsUrl: e.target.value }))}
                      />
                    </label>
                  </div>

                  <h4 className="text-base font-bold text-emerald-deep pt-4 border-t border-stone-200">SMTP Server Dispatcher Configuration</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <label className="grid gap-2 text-xs font-semibold text-stone-700">
                      SMTP Host
                      <input
                        className="input text-sm"
                        placeholder="smtp.gmail.com"
                        value={contactSettings.smtpHost}
                        onChange={(e) => setContactSettings((v) => ({ ...v, smtpHost: e.target.value }))}
                      />
                    </label>

                    <label className="grid gap-2 text-xs font-semibold text-stone-700">
                      SMTP Port
                      <input
                        className="input text-sm"
                        placeholder="587"
                        value={contactSettings.smtpPort}
                        onChange={(e) => setContactSettings((v) => ({ ...v, smtpPort: e.target.value }))}
                      />
                    </label>

                    <label className="grid gap-2 text-xs font-semibold text-stone-700">
                      SMTP User
                      <input
                        className="input text-sm"
                        placeholder="your-email@gmail.com"
                        value={contactSettings.smtpUser}
                        onChange={(e) => setContactSettings((v) => ({ ...v, smtpUser: e.target.value }))}
                      />
                    </label>

                    <label className="grid gap-2 text-xs font-semibold text-stone-700">
                      SMTP Password
                      <input
                        className="input text-sm"
                        type="password"
                        placeholder="••••••••"
                        value={contactSettings.smtpPass}
                        onChange={(e) => setContactSettings((v) => ({ ...v, smtpPass: e.target.value }))}
                      />
                    </label>

                    <label className="grid gap-2 text-xs font-semibold text-stone-700">
                      SSL/TLS Secure
                      <select
                        className="input text-sm"
                        value={contactSettings.smtpSecure}
                        onChange={(e) => setContactSettings((v) => ({ ...v, smtpSecure: e.target.value }))}
                      >
                        <option value="false">False (Port 587)</option>
                        <option value="true">True (Port 465)</option>
                      </select>
                    </label>
                  </div>

                  <button className="btn-primary" disabled={saving}>
                    Save Contact & SMTP Settings
                  </button>
                </form>

                {/* Submitted Contact Form Messages */}
                <TableShell title="Received Support Form Inquiries" action={<span className="text-xs text-stone-500">{contactMessages.length} messages</span>}>
                  <div className="space-y-3 p-4">
                    {contactMessages.length === 0 ? (
                      <p className="text-sm text-stone-500">No support messages received yet.</p>
                    ) : (
                      contactMessages.map((msg) => (
                        <div key={msg.id} className="p-4 rounded-xl border border-stone-200 bg-white space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-emerald-deep text-base">{msg.name} <span className="text-xs font-normal text-stone-500">({msg.email})</span></h4>
                            <span className="text-xs text-stone-400">{formatDate(msg.createdAt)}</span>
                          </div>
                          <p className="text-xs font-bold text-gold">{msg.subject}</p>
                          <p className="text-sm text-stone-600 bg-cream p-3 rounded-lg">{msg.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </TableShell>
              </motion.section>
            )}

            {activeTab === "Payments" && (
              <TableShell
                title="Payments"
                action={
                  <div className="flex flex-wrap items-center gap-2">
                    <SearchBox value={paymentQuery.search} onChange={(search) => setPaymentQuery((q) => ({ ...q, page: 1, search }))} />
                    <select className="input h-11 w-40" value={paymentQuery.status} onChange={(e) => setPaymentQuery((q) => ({ ...q, page: 1, status: e.target.value as any }))}>
                      <option value="">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                    <select className="input h-11 w-40" value={paymentQuery.dateFilter} onChange={(e) => setPaymentQuery((q) => ({ ...q, page: 1, dateFilter: e.target.value }))}>
                      <option value="">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                    </select>
                    <button className="btn-secondary h-11" onClick={exportPaymentsCsv}>
                      <Download className="h-4 w-4" />
                      Export CSV
                    </button>
                  </div>
                }
              >
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-cream text-xs font-semibold text-stone-500">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Reg No</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Receipt</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!payments ? <SkeletonRows cols={8} /> : payments.items.map((item) => (
                      <tr key={item.id} className="border-t border-stone-100">
                        <td className="px-4 py-4">
                          <p className="font-semibold text-stone-800">{item.user.name}</p>
                          <p className="text-xs text-stone-400">{item.user.email}</p>
                        </td>
                        <td className="px-4 py-4 text-stone-600">{item.phone}</td>
                        <td className="px-4 py-4 font-mono text-xs text-stone-500">{item.registrationNo}</td>
                        <td className="px-4 py-4 font-semibold text-emerald-deep">₹{item.entryFee.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-4"><Badge value={item.paymentStatus} /></td>
                        <td className="px-4 py-4 font-mono text-xs text-stone-400">{item.receipt?.receiptNo ?? "—"}</td>
                        <td className="px-4 py-4 text-stone-500">{formatDate(item.createdAt)}</td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {item.paymentStatus !== "paid" && (
                              <button
                                className="btn-secondary h-9 px-3 text-xs text-emerald-deep"
                                onClick={() => markPaymentSuccessful(item.id)}
                                disabled={markingPaid === item.id}
                              >
                                {markingPaid === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <BadgeCheck className="h-3 w-3" />}
                                Mark Paid
                              </button>
                            )}
                            {item.receipt && (
                              <a
                                className="btn-secondary h-9 px-3 text-xs"
                                href={`${API_URL}/admin/payments/${item.id}/receipt?token=${encodeURIComponent(getToken() || "")}`}
                                target="_blank" rel="noreferrer"
                              >
                                <FileText className="h-3 w-3" />
                                Receipt
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Pagination page={paymentQuery.page} pages={payments?.meta.pages ?? 1} onPage={(page) => setPaymentQuery((q) => ({ ...q, page }))} />
              </TableShell>
            )}

            {activeTab === "Donations" && (
              <TableShell
                title="Donations"
                action={
                  <div className="flex flex-wrap items-center gap-2">
                    <SearchBox value={donationQuery.search} onChange={(search) => setDonationQuery((q) => ({ ...q, page: 1, search }))} />
                    <select className="input h-11 w-40" value={donationQuery.status} onChange={(e) => setDonationQuery((q) => ({ ...q, page: 1, status: e.target.value }))}>
                      <option value="">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                    </select>
                    <select className="input h-11 w-40" value={donationQuery.dateFilter} onChange={(e) => setDonationQuery((q) => ({ ...q, page: 1, dateFilter: e.target.value }))}>
                      <option value="">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                    </select>
                    <button className="btn-secondary h-11" onClick={exportDonationsCsv}>
                      <Download className="h-4 w-4" />
                      Export CSV
                    </button>
                    <button className="btn-secondary h-11 text-emerald-deep hover:bg-emerald-mist" onClick={testDemoReceipt}>
                      <FileText className="h-4 w-4" />
                      Test Demo Receipt
                    </button>
                  </div>
                }
              >
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-cream text-xs font-semibold text-stone-500">
                    <tr>
                      <th className="px-4 py-3">Donor</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!donations ? <SkeletonRows cols={8} /> : donations.items.map((item) => (
                      <tr key={item.id} className="border-t border-stone-100">
                        <td className="px-4 py-4 font-semibold text-stone-800">{item.donorName}</td>
                        <td className="px-4 py-4 text-stone-600">{item.phone}</td>
                        <td className="px-4 py-4 text-stone-500">{item.email ?? "—"}</td>
                        <td className="px-4 py-4 font-semibold text-emerald-deep">₹{Number(item.amount).toLocaleString("en-IN")}</td>
                        <td className="px-4 py-4 text-stone-500">{item.donationType}</td>
                        <td className="px-4 py-4"><Badge value={item.status} /></td>
                        <td className="px-4 py-4 text-stone-500">{formatDate(item.createdAt)}</td>
                        <td className="px-4 py-4 text-right">
                          <button type="button" className="btn-secondary h-9 px-3 w-full justify-center text-emerald-deep hover:bg-emerald-mist" onClick={() => downloadDonationReceipt(item as any)}>
                            <Download className="h-4 w-4" />
                            PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Pagination page={donationQuery.page} pages={donations?.meta.pages ?? 1} onPage={(page) => setDonationQuery((q) => ({ ...q, page }))} />
              </TableShell>
            )}

            {(activeTab === "Contact & Settings" || activeTab === "Settings") && (
              <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl space-y-6">
                {/* Settings Sub-Tabs */}
                <div className="flex flex-wrap gap-2">
                  {(["Organization Assets", "Payment Gateway", "Social Media & Location", "Admin Profile"] as SettingsTab[]).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setSettingsTab(tab)}
                      className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                        settingsTab === tab ? "bg-emerald-deep text-white shadow-emerald" : "bg-white border border-stone-200 text-stone-600 hover:bg-gold-soft hover:text-emerald-deep"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <form onSubmit={saveSettings} className="rounded-xl border border-stone-200 bg-white p-5 shadow-card sm:p-6">

                  {settingsTab === "Organization Assets" && (
                    <div className="grid gap-6">
                      <div>
                        <h3 className="text-xl font-semibold text-emerald-deep">Organization Branding & Document Assets</h3>
                        <p className="mt-1 text-sm text-stone-500">
                          Manage official organization details, logo, seal, and digital signatures used across all generated PDF receipts and tickets.
                        </p>
                      </div>

                      {/* Form Inputs: Phone, Email, Website, Address, Signatory Name */}
                      <div className="grid gap-4 rounded-xl border border-stone-200 bg-white p-5 shadow-sm md:grid-cols-2">
                        <label className="grid gap-1.5 text-xs font-semibold text-stone-700">
                          Organization Phone
                          <input
                            className="input text-sm"
                            value={orgSettingsForm.phone}
                            onChange={(e) => setOrgSettingsForm((v) => ({ ...v, phone: e.target.value }))}
                            placeholder="+91 9213408880"
                          />
                        </label>

                        <label className="grid gap-1.5 text-xs font-semibold text-stone-700">
                          Organization Email
                          <input
                            className="input text-sm"
                            type="email"
                            value={orgSettingsForm.email}
                            onChange={(e) => setOrgSettingsForm((v) => ({ ...v, email: e.target.value }))}
                            placeholder="support@nooreharam.in"
                          />
                        </label>

                        <label className="grid gap-1.5 text-xs font-semibold text-stone-700">
                          Organization Website
                          <input
                            className="input text-sm"
                            value={orgSettingsForm.website}
                            onChange={(e) => setOrgSettingsForm((v) => ({ ...v, website: e.target.value }))}
                            placeholder="www.nooreharam.in"
                          />
                        </label>

                        <label className="grid gap-1.5 text-xs font-semibold text-stone-700">
                          Authorized Signatory Name
                          <input
                            className="input text-sm"
                            value={orgSettingsForm.signatory_name}
                            onChange={(e) => setOrgSettingsForm((v) => ({ ...v, signatory_name: e.target.value }))}
                            placeholder="Noor E Haram Charity Foundation"
                          />
                        </label>

                        <label className="grid gap-1.5 text-xs font-semibold text-stone-700 md:col-span-2">
                          Official Address
                          <textarea
                            className="input min-h-20 text-sm"
                            value={orgSettingsForm.address}
                            onChange={(e) => setOrgSettingsForm((v) => ({ ...v, address: e.target.value }))}
                            placeholder="Full Registered Office Address"
                          />
                        </label>

                        <div className="md:col-span-2 flex justify-end">
                          <button
                            type="button"
                            className="btn-primary text-xs px-5 py-2.5"
                            onClick={saveOrgSettingsSubmit}
                            disabled={saving}
                          >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}
                            Save Organization Settings
                          </button>
                        </div>
                      </div>

                      {/* Asset Upload Cards: Logo, Seal, Signature */}
                      <div className="grid gap-6 md:grid-cols-3">
                        {/* Organization Logo */}
                        <div className="rounded-xl border border-stone-200 bg-cream p-5 space-y-4">
                          <h4 className="font-semibold text-stone-800">Organization Logo</h4>
                          <p className="text-xs text-stone-500">Logo displayed on top header of documents.</p>

                          <div
                            className="flex flex-col items-center justify-center p-4 bg-white border-2 border-dashed border-stone-300 rounded-lg min-h-36 transition-colors hover:border-emerald-deep"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              const file = e.dataTransfer.files?.[0];
                              if (file) uploadOrgAsset(file, "logo_url");
                            }}
                          >
                            {orgSettingsForm.logo_url ? (
                              <img src={orgSettingsForm.logo_url} alt="Logo Preview" className="h-24 max-w-full object-contain" />
                            ) : (
                              <div className="text-center text-xs text-stone-400">
                                <p className="font-medium text-stone-600">Default Logo Active</p>
                                <p>(/noor-e-haram-logo3.png)</p>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <label className="btn-secondary h-9 text-xs px-3 cursor-pointer flex-1 justify-center">
                              <span>{orgSettingsForm.logo_url ? "Replace Logo" : "Upload Logo"}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) uploadOrgAsset(file, "logo_url");
                                }}
                              />
                            </label>
                            {orgSettingsForm.logo_url && (
                              <button
                                type="button"
                                className="btn-secondary h-9 text-xs px-3 text-red-600"
                                onClick={() => setOrgSettingsForm((v) => ({ ...v, logo_url: "" }))}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Official Seal */}
                        <div className="rounded-xl border border-stone-200 bg-cream p-5 space-y-4">
                          <h4 className="font-semibold text-stone-800">Official Seal</h4>
                          <p className="text-xs text-stone-500">Circular official seal stamp artwork.</p>

                          <div
                            className="flex flex-col items-center justify-center p-4 bg-white border-2 border-dashed border-stone-300 rounded-lg min-h-36 transition-colors hover:border-emerald-deep"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              const file = e.dataTransfer.files?.[0];
                              if (file) uploadOrgAsset(file, "seal_image_url");
                            }}
                          >
                            {orgSettingsForm.seal_image_url ? (
                              <img src={orgSettingsForm.seal_image_url} alt="Seal Preview" className="h-24 max-w-full object-contain" />
                            ) : (
                              <div className="text-center text-xs text-stone-400">
                                <p className="font-medium text-stone-600">Default Seal Active</p>
                                <p>(SVG Seal Element)</p>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <label className="btn-secondary h-9 text-xs px-3 cursor-pointer flex-1 justify-center">
                              <span>{orgSettingsForm.seal_image_url ? "Replace Seal" : "Upload Seal"}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) uploadOrgAsset(file, "seal_image_url");
                                }}
                              />
                            </label>
                            {orgSettingsForm.seal_image_url && (
                              <button
                                type="button"
                                className="btn-secondary h-9 text-xs px-3 text-red-600"
                                onClick={() => setOrgSettingsForm((v) => ({ ...v, seal_image_url: "" }))}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Authorized Signature */}
                        <div className="rounded-xl border border-stone-200 bg-cream p-5 space-y-4">
                          <h4 className="font-semibold text-stone-800">Authorized Signature</h4>
                          <p className="text-xs text-stone-500">Transparent PNG digital signature.</p>

                          <div
                            className="flex flex-col items-center justify-center p-4 bg-white border-2 border-dashed border-stone-300 rounded-lg min-h-36 transition-colors hover:border-emerald-deep"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              const file = e.dataTransfer.files?.[0];
                              if (file) uploadOrgAsset(file, "signature_image_url");
                            }}
                          >
                            {orgSettingsForm.signature_image_url ? (
                              <img src={orgSettingsForm.signature_image_url} alt="Signature Preview" className="h-20 max-w-full object-contain" />
                            ) : (
                              <div className="text-center text-xs text-stone-400">
                                <p className="font-medium text-stone-600">Default Signature Active</p>
                                <p>(SVG Signature Path)</p>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <label className="btn-secondary h-9 text-xs px-3 cursor-pointer flex-1 justify-center">
                              <span>{orgSettingsForm.signature_image_url ? "Replace Signature" : "Upload Signature"}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) uploadOrgAsset(file, "signature_image_url");
                                }}
                              />
                            </label>
                            {orgSettingsForm.signature_image_url && (
                              <button
                                type="button"
                                className="btn-secondary h-9 text-xs px-3 text-red-600"
                                onClick={() => setOrgSettingsForm((v) => ({ ...v, signature_image_url: "" }))}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* LIVE PREVIEW SECTION */}
                      <div className="rounded-xl border border-gold/40 bg-white p-5 space-y-4 shadow-sm">
                        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                          <div>
                            <h4 className="font-semibold text-emerald-deep">Live Document Branding Preview</h4>
                            <p className="text-xs text-stone-500">Real-time preview of header logo, seal, signature, and footer as rendered on all PDF documents.</p>
                          </div>
                          <span className="rounded-full bg-gold-soft px-3 py-1 text-xs font-bold text-emerald-deep">LIVE PREVIEW</span>
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-stone-200 bg-cream p-4">
                          <div
                            className="mx-auto w-[680px] bg-white p-4 shadow-md rounded border border-stone-200 text-stone-800 text-xs"
                            dangerouslySetInnerHTML={{
                              __html: `
                                ${pdfTopHeader("Document Header Preview", orgSettingsForm.logo_url || undefined)}
                                <div style="padding: 15px 0; border-top: 1px dashed #D8A820; border-bottom: 1px dashed #D8A820; margin: 15px 0;">
                                  ${pdfSealsRow(
                                    orgSettingsForm.seal_image_url || undefined,
                                    orgSettingsForm.signature_image_url || undefined,
                                    orgSettingsForm.signatory_name || undefined
                                  )}
                                </div>
                                ${pdfFooter({
                                  phone: orgSettingsForm.phone,
                                  email: orgSettingsForm.email,
                                  website: orgSettingsForm.website,
                                  address: orgSettingsForm.address
                                })}
                              `,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {settingsTab === "Payment Gateway" && (
                    <div className="grid gap-5">
                      <h3 className="text-xl font-semibold text-emerald-deep">Payment Gateway Settings</h3>
                      <p className="text-sm text-stone-500">Only the Razorpay <strong>public key</strong> is stored here. Never enter the secret key.</p>
                      <label className="grid gap-2 text-sm font-medium text-stone-700">
                        Razorpay Public Key (key_id)
                        <input className="input" placeholder="rzp_live_..." value={settings.razorpayPublicKey} onChange={(e) => setSettings((v) => ({ ...v, razorpayPublicKey: e.target.value }))} />
                      </label>
                      <label className="grid gap-2 text-sm font-medium text-stone-700">
                        Payment Mode
                        <select className="input" value={settings.paymentMode} onChange={(e) => setSettings((v) => ({ ...v, paymentMode: e.target.value as "test" | "live" }))}>
                          <option value="test">Test Mode</option>
                          <option value="live">Live Mode</option>
                        </select>
                      </label>
                      <label className="grid gap-2 text-sm font-medium text-stone-700">
                        Default Lucky Draw Amount (₹)
                        <input className="input" type="number" min={1} value={settings.defaultDrawAmount} onChange={(e) => setSettings((v) => ({ ...v, defaultDrawAmount: Number(e.target.value) }))} />
                        <span className="text-xs text-stone-400">This is for display only. The backend always enforces ₹1499.</span>
                      </label>
                    </div>
                  )}

                  {settingsTab === "Social Media & Location" && (
                    <div className="grid gap-5">
                      <h3 className="text-xl font-semibold text-emerald-deep">Social Media Links & Map Embed</h3>
                      <div className="grid gap-5 md:grid-cols-2">
                        <label className="grid gap-2 text-sm font-medium text-stone-700">Facebook Page URL<input className="input" placeholder="https://facebook.com/..." value={settings.socialFacebookUrl} onChange={(e) => setSettings((v) => ({ ...v, socialFacebookUrl: e.target.value }))} /></label>
                        <label className="grid gap-2 text-sm font-medium text-stone-700">Instagram Profile URL<input className="input" placeholder="https://instagram.com/..." value={settings.socialInstagramUrl} onChange={(e) => setSettings((v) => ({ ...v, socialInstagramUrl: e.target.value }))} /></label>
                        <label className="grid gap-2 text-sm font-medium text-stone-700">YouTube Channel URL<input className="input" placeholder="https://youtube.com/@..." value={settings.socialYoutubeUrl} onChange={(e) => setSettings((v) => ({ ...v, socialYoutubeUrl: e.target.value }))} /></label>
                        <label className="grid gap-2 text-sm font-medium text-stone-700">WhatsApp Contact Link<input className="input" placeholder="https://wa.me/..." value={settings.socialWhatsappUrl} onChange={(e) => setSettings((v) => ({ ...v, socialWhatsappUrl: e.target.value }))} /></label>
                      </div>
                      <label className="grid gap-2 text-sm font-medium text-stone-700 mt-2">
                        Google Maps Embed URL
                        <input className="input" placeholder="https://www.google.com/maps/embed?pb=..." value={settings.googleMapsUrl} onChange={(e) => setSettings((v) => ({ ...v, googleMapsUrl: e.target.value }))} />
                        <span className="text-xs text-stone-400">Enter full Google Maps iframe embed URL for the Contact Us page.</span>
                      </label>
                    </div>
                  )}

                  {settingsTab === "Admin Profile" && (
                    <div className="grid gap-5">
                      <h3 className="text-xl font-semibold text-emerald-deep">Admin Profile</h3>
                      <label className="grid gap-2 text-sm font-medium text-stone-700">Admin Name<input className="input" value={settings.adminName} onChange={(e) => setSettings((v) => ({ ...v, adminName: e.target.value }))} /></label>
                      <label className="grid gap-2 text-sm font-medium text-stone-700">Admin Email<input className="input" type="email" value={settings.adminEmail} onChange={(e) => setSettings((v) => ({ ...v, adminEmail: e.target.value }))} /></label>
                    </div>
                  )}

                  <button className="btn-primary mt-6" disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}
                    Save {settingsTab} Settings
                  </button>
                </form>
              </motion.section>
            )}
          </div>
        </section>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-emerald-deep/55 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 34 }}
            className="absolute right-0 top-0 flex h-full w-[86vw] max-w-sm flex-col bg-white shadow-elevated"
          >
            <div className="bg-emerald-deep p-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-gold">Noor-e-Haram</p>
                  <h3 className="mt-1 text-2xl font-semibold">Admin Menu</h3>
                </div>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/10"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <nav className="grid gap-2 p-4">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.name);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                    activeTab === tab.name ? "bg-emerald-deep text-white shadow-emerald" : "bg-cream text-stone-700 hover:bg-gold-soft hover:text-emerald-deep"
                  }`}
                >
                  <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${activeTab === tab.name ? "bg-gold text-emerald-deep" : "bg-white text-emerald-deep"}`}>
                    <tab.icon className="h-5 w-5" />
                  </span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>

            <div className="mt-auto border-t border-stone-100 p-4">
              <button className="btn-secondary w-full justify-center text-red-600" onClick={logout}>
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </motion.aside>
        </div>
      )}

      {confirmDraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-deep/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-elevated">
            <h3 className="text-2xl font-semibold text-emerald-deep">Confirm lucky draw</h3>
            <p className="mt-3 text-sm text-stone-600">
              This will reset all paid applicants to not selected, then select winners using Fisher-Yates shuffle.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => setConfirmDraw(false)} disabled={saving}>Cancel</button>
              <button className="btn-primary" onClick={runDraw} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function SearchBox({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex h-11 w-full min-w-0 items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 focus-within:border-emerald-deep focus-within:ring-4 focus-within:ring-emerald-deep/10 sm:min-w-64">
      <Search className="h-4 w-4 text-stone-400" />
      <input className="w-full border-0 bg-transparent text-sm outline-none" placeholder="Search" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TableShell({ title, action, children }: { title: string; action: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-card">
      <div className="flex flex-col gap-4 border-b border-stone-100 p-4 lg:flex-row lg:items-center lg:justify-between">
        <h3 className="text-lg font-semibold text-emerald-deep sm:text-xl">{title}</h3>
        {action}
      </div>
      <div className="overflow-x-auto">{children}</div>
    </motion.section>
  );
}
