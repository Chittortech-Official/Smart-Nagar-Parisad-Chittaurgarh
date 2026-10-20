import { useState, useMemo } from 'react';
import type { 
  UserRole, 
  Ticket, 
  IntakeComplaint, 
  Ward, 
  Department, 
  NotificationLog, 
  ForwardingOption 
} from '../types';
import { NagarParishadLogo } from './NagarParishadLogo';
import { TwoStepClosureModal } from './TwoStepClosureModal';
import { IntakeVerificationModal } from './IntakeVerificationModal';
import { NewComplaintModal } from './NewComplaintModal';
import { StatusModal } from './StatusModal';
import type { StatusModalConfig } from './StatusModal';
import { TabGuideBanner } from './TabGuideBanner';
import { 
  LayoutDashboard, 
  Inbox, 
  TicketCheck, 
  ClockAlert, 
  MapPin, 
  Building2, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Search, 
  RefreshCw, 
  Bell, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Phone, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Filter,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface DashboardViewProps {
  userRole: UserRole;
  userEmail: string;
  onLogout: () => void;
  wards: Ward[];
  departments: Department[];
  tickets: Ticket[];
  intakes: IntakeComplaint[];
  notifications: NotificationLog[];
  onUpdateTicket: (ticket: Ticket) => void;
  onAddTicket: (ticket: Ticket) => void;
  onUpdateIntake: (intake: IntakeComplaint) => void;
  onAddIntake: (intake: IntakeComplaint) => void;
  onAddNotification: (notif: NotificationLog) => void;
}

export const DashboardView = ({
  userRole,
  userEmail,
  onLogout,
  wards,
  departments,
  tickets,
  intakes,
  notifications,
  onUpdateTicket,
  onAddTicket,
  onUpdateIntake,
  onAddIntake,
  onAddNotification
}: DashboardViewProps) => {

  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'INTAKE' | 'TICKETS' | 'SLA' | 'WARDS' | 'DEPARTMENTS' | 'WHATSAPP' | 'SETTINGS'>('DASHBOARD');
  
  // Advanced Filters State
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedWard, setSelectedWard] = useState<string>('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedTicketForClosure, setSelectedTicketForClosure] = useState<Ticket | null>(null);
  const [selectedIntakeForVerification, setSelectedIntakeForVerification] = useState<IntakeComplaint | null>(null);
  const [showNewComplaintModal, setShowNewComplaintModal] = useState(false);

  // Status modal state (custom confirmation & success popup)
  const [statusModalConfig, setStatusModalConfig] = useState<StatusModalConfig>({
    isOpen: false,
    type: 'success',
    title: ''
  });

  // Derived filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      if (selectedWard !== 'ALL' && ticket.ward_number.toString() !== selectedWard) return false;
      if (selectedDepartment !== 'ALL' && ticket.department_name !== selectedDepartment) return false;
      if (selectedStatus !== 'ALL' && ticket.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = 
          ticket.ticket_number.toLowerCase().includes(q) ||
          ticket.citizen_name.toLowerCase().includes(q) ||
          ticket.citizen_phone.includes(q) ||
          ticket.address.toLowerCase().includes(q) ||
          ticket.category_name.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [tickets, selectedWard, selectedDepartment, selectedStatus, searchQuery]);

  // Real-time KPI Counts (from Master Prompt Section 9)
  const kpis = useMemo(() => {
    const todayRegistered = tickets.filter(t => t.registration_time.includes('2026-10-20') || t.registration_time.includes('Today')).length;
    const totalComplaints = tickets.length;
    const pendingComplaints = tickets.filter(t => t.status === 'REGISTERED' || t.status === 'IN_PROGRESS' || t.status === 'RESOLVED_AWAITING_CITIZEN').length;
    const confirmedResolvedClosed = tickets.filter(t => t.status === 'CLOSED').length;
    const overdueComplaints = tickets.filter(t => t.is_overdue && t.status !== 'CLOSED').length;
    const escalatedComplaints = tickets.filter(t => t.is_escalated && t.status !== 'CLOSED').length;
    const pendingIntakes = intakes.filter(i => i.status === 'PENDING_REVIEW').length;

    return {
      todayRegistered,
      totalComplaints,
      pendingComplaints,
      confirmedResolvedClosed,
      overdueComplaints,
      escalatedComplaints,
      pendingIntakes
    };
  }, [tickets, intakes]);

  // Handlers for Two Step Closure
  const handleAuthorityConfirm = (ticketId: string, notes: string) => {
    const target = tickets.find(t => t.id === ticketId);
    if (!target) return;
    const updated: Ticket = {
      ...target,
      authority_confirmed: true,
      authority_notes: notes,
      status: 'RESOLVED_AWAITING_CITIZEN',
      resolution_time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
    onUpdateTicket(updated);
  };

  const handleCitizenConfirm = (ticketId: string, satisfied: boolean, feedback: string, _callOutcome: string) => {
    const target = tickets.find(t => t.id === ticketId);
    if (!target) return;
    
    if (satisfied) {
      // Step 2 Success: Mark CLOSED and send Official Hindi WhatsApp message
      const updated: Ticket = {
        ...target,
        citizen_satisfied: true,
        citizen_feedback: feedback,
        status: 'CLOSED',
        closed_at: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      onUpdateTicket(updated);

      // Auto-dispatch Hindi WhatsApp Closure Notification
      const dateStr = new Date().toLocaleDateString('hi-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const hindiMsg = `नमस्कार!\n\nआपकी शिकायत संख्या ${target.ticket_number} के संबंध में सूचित किया जाता है कि आपकी समस्या के समाधान की पुष्टि आपके द्वारा कर दी गई है।\n\nशिकायत का प्रकार: ${target.category_name}\nस्थान: ${target.address}, वार्ड ${target.ward_number}\nसमाधान दिनांक: ${dateStr}\n\nआपकी पुष्टि के बाद शिकायत को स्मार्ट नगर परिषद चित्तौड़गढ़ के सिस्टम में बंद कर दिया गया है।\n\nधन्यवाद!\nस्मार्ट नगर परिषद चित्तौड़गढ़, राजस्थान`;

      const newNotif: NotificationLog = {
        id: `notif-${Date.now()}`,
        ticket_number: target.ticket_number,
        recipient_type: 'CITIZEN',
        recipient_name: target.citizen_name,
        recipient_phone: target.citizen_phone,
        channel: 'WHATSAPP',
        template_name: 'snp_closure_official_hindi',
        message_content: hindiMsg,
        status: 'DELIVERED',
        sent_at: 'Just now'
      };
      onAddNotification(newNotif);
      setStatusModalConfig({
        isOpen: true,
        type: 'success',
        title: 'Ticket Successfully Closed!',
        subtitle: `Ticket ${target.ticket_number} has been certified closed with verified citizen satisfaction. Official WhatsApp closure receipt dispatched.`,
        details: [
          `Ticket Number: ${target.ticket_number}`,
          `Citizen: ${target.citizen_name} (${target.citizen_phone})`,
          `Ward: Ward ${target.ward_number} (${target.address})`,
          `Feedback: ${feedback || 'Citizen Confirmed Satisfied'}`
        ],
        confirmText: 'OK'
      });
    } else {
      // Citizen Unsatisfied: Reopen ticket and alert officer
      const updated: Ticket = {
        ...target,
        citizen_satisfied: false,
        citizen_feedback: feedback,
        status: 'REOPENED',
        authority_confirmed: false // reset for re-verification
      };
      onUpdateTicket(updated);
      setStatusModalConfig({
        isOpen: true,
        type: 'warning',
        title: 'Ticket Reopened!',
        subtitle: `Citizen reported unresolved issue. Ticket ${target.ticket_number} has been returned to officer ${target.assigned_officer_name} for priority execution.`,
        details: [
          `Ticket Number: ${target.ticket_number}`,
          `Citizen Feedback: ${feedback || 'Reported Unresolved'}`
        ],
        confirmText: 'OK'
      });
    }

    setSelectedTicketForClosure(null);
  };

  // Handlers for Intake verification with Confirmation & Success (English)
  const handleAcceptIntake = (intakeId: string, forwardingOption: ForwardingOption, slaHours: number) => {
    const intake = intakes.find(i => i.id === intakeId);
    if (!intake) return;

    const dept = departments.find(d => d.name === intake.department_name) || departments[0];
    const nextNum = 840 + tickets.length + 1;
    const ticketNum = `SNP-2026-0${nextNum}`;
    const deadlineHours = slaHours;
    const deadlineDate = new Date();
    deadlineDate.setHours(deadlineDate.getHours() + deadlineHours);

    setSelectedIntakeForVerification(null);

    // Step 1: Confirmation Modal (English)
    setStatusModalConfig({
      isOpen: true,
      type: 'confirm',
      title: 'Verify & Issue Official Ticket?',
      subtitle: `Are you sure you want to verify and generate an official municipal ticket for citizen ${intake.citizen_name}?`,
      details: [
        `Citizen: ${intake.citizen_name} (${intake.citizen_phone})`,
        `Ward & Location: Ward ${intake.ward_number} - ${intake.address}`,
        `Assigned Department: ${intake.department_name}`,
        `Nodal Officer: ${dept.head_officer_name} (${dept.head_officer_phone})`,
        `Resolution SLA: ${deadlineHours} Hours`
      ],
      confirmText: 'Yes, Issue Ticket!',
      cancelText: 'Cancel',
      onConfirm: () => {
        // Update intake status
        onUpdateIntake({
          ...intake,
          status: 'ACCEPTED'
        });

        const newTicket: Ticket = {
          id: `tkt-${Date.now()}`,
          ticket_number: ticketNum,
          citizen_name: intake.citizen_name,
          citizen_phone: intake.citizen_phone,
          ward_number: intake.ward_number,
          address: intake.address,
          landmark: intake.landmark,
          category_name: intake.category_name,
          department_name: intake.department_name,
          problem_description: intake.problem_description,
          status: 'REGISTERED',
          forwarding_option: forwardingOption,
          sla_hours: deadlineHours,
          sla_deadline: deadlineDate.toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }),
          is_overdue: false,
          is_escalated: false,
          assigned_officer_name: dept.head_officer_name,
          assigned_officer_phone: dept.head_officer_phone,
          registration_time: 'Today ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          authority_confirmed: false
        };

        onAddTicket(newTicket);

        // Record notification dispatch
        const wardObj = wards.find(w => w.ward_number === intake.ward_number);
        if (forwardingOption === 'COUNCILLOR_AND_OFFICER' || forwardingOption === 'COUNCILLOR_ONLY') {
          onAddNotification({
            id: `notif-${Date.now()}-c`,
            ticket_number: ticketNum,
            recipient_type: 'COUNCILLOR',
            recipient_name: `${wardObj?.councillor_name || 'Councillor'} (Ward ${intake.ward_number})`,
            recipient_phone: wardObj?.councillor_phone || '+91 98290 00000',
            channel: 'WHATSAPP',
            template_name: 'snp_councillor_forward',
            message_content: `सूचना: आपके वार्ड ${intake.ward_number} में नई शिकायत ${ticketNum} दर्ज हुई है। स्थान: ${intake.address}। विभाग: ${intake.department_name}। SLA समय: ${slaHours} घंटे। - स्मार्ट नगर परिषद चित्तौड़गढ़`,
            status: 'DELIVERED',
            sent_at: 'Just now'
          });
        }

        if (forwardingOption === 'COUNCILLOR_AND_OFFICER' || forwardingOption === 'OFFICER_ONLY') {
          onAddNotification({
            id: `notif-${Date.now()}-o`,
            ticket_number: ticketNum,
            recipient_type: 'OFFICER',
            recipient_name: `${dept.head_officer_name} (${dept.code})`,
            recipient_phone: dept.head_officer_phone,
            channel: 'WHATSAPP',
            template_name: 'snp_officer_assign',
            message_content: `निर्देश: नई शिकायत ${ticketNum} आपके विभाग (${dept.name}) को आवंटित की गई है। नागरिक: ${intake.citizen_name}। वार्ड ${intake.ward_number}। SLA: ${slaHours} घंटे। - पोर्टल मैनेजर, नगर परिषद चित्तौड़गढ़`,
            status: 'DELIVERED',
            sent_at: 'Just now'
          });
        }

        // Step 2: Success Modal (English)
        setStatusModalConfig({
          isOpen: true,
          type: 'success',
          title: 'Ticket Generated Successfully!',
          subtitle: `Official Ticket ${ticketNum} has been issued. Automated notifications dispatched to citizen and nodal department officer.`,
          details: [
            `Ticket ID: ${ticketNum}`,
            `Citizen: ${intake.citizen_name} (${intake.citizen_phone})`,
            `Assigned Officer: ${dept.head_officer_name}`,
            `Resolution SLA: ${deadlineHours} Hours`
          ],
          confirmText: 'OK'
        });
      }
    });
  };

  const handleRejectIntake = (intakeId: string, reason: string) => {
    const intake = intakes.find(i => i.id === intakeId);
    if (!intake) return;

    setSelectedIntakeForVerification(null);

    // Step 1: Confirmation Modal (English)
    setStatusModalConfig({
      isOpen: true,
      type: 'confirm',
      title: 'Reject Complaint Intake?',
      subtitle: `Are you sure you want to reject the grievance submitted by ${intake.citizen_name}?`,
      details: [
        `Rejection Reason: ${reason}`,
        `Audit Log: Reason will be recorded permanently in the official audit trail.`
      ],
      confirmText: 'Yes, Reject',
      cancelText: 'Cancel',
      onConfirm: () => {
        onUpdateIntake({
          ...intake,
          status: 'REJECTED',
          rejection_reason: reason
        });

        // Step 2: Success Modal (English)
        setStatusModalConfig({
          isOpen: true,
          type: 'warning',
          title: 'Complaint Rejected',
          subtitle: 'The intake complaint has been rejected and permanently recorded in the municipal audit trail.',
          confirmText: 'OK'
        });
      }
    });
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden min-w-[1024px]">
      {/* 1. LEFT SIDEBAR NAVIGATION (Compact & Optimized for Maximum Content Area) */}
      <aside className="w-52 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
        <div>
          {/* Sidebar Header Brand */}
          <div className="p-3 border-b border-slate-800/80">
            <NagarParishadLogo size="sm" theme="dark" />
            <div className="mt-1.5 text-[9px] uppercase font-mono tracking-wider text-slate-400 pl-0.5">
              ADMIN PORTAL &bull; CHITTORTECH
            </div>
          </div>

          {/* MAIN MENU */}
          <div className="p-2 space-y-4">
            <div>
              <span className="px-2.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                MAIN
              </span>
              <div className="mt-1 space-y-0.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('DASHBOARD')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'DASHBOARD'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
                  <span>Dashboard</span>
                </button>
              </div>
            </div>

            {/* MANAGEMENT MENU */}
            <div>
              <span className="px-2.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                MANAGEMENT
              </span>
              <div className="mt-1 space-y-0.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('INTAKE')}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'INTAKE'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Inbox className="w-3.5 h-3.5 shrink-0" />
                    <span>Intake Queue</span>
                  </div>
                  {kpis.pendingIntakes > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px]">
                      {kpis.pendingIntakes}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('TICKETS')}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'TICKETS'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <TicketCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>All Complaints</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {tickets.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('SLA')}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'SLA'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ClockAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>SLA &amp; Overdue</span>
                  </div>
                  {kpis.overdueComplaints > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-bold text-[9px] animate-pulse">
                      {kpis.overdueComplaints}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('WARDS')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'WARDS'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span>Wards 1–60</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('DEPARTMENTS')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'DEPARTMENTS'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Departments</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('WHATSAPP')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'WHATSAPP'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                  <span>WhatsApp Logs</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('SETTINGS')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'SETTINGS'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5 shrink-0" />
                  <span>Settings &amp; Hours</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User Profile Pill at Bottom */}
        <div className="p-2 border-t border-slate-800">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/70 text-white">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center font-bold text-[11px] uppercase shrink-0">
                {userRole.substring(0, 2)}
              </div>
              <div className="truncate">
                <p className="text-[11px] font-semibold truncate leading-tight">
                  {userRole.replace('_', ' ')}
                </p>
                <p className="text-[9px] text-slate-400 truncate">
                  {userEmail}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              title="Sign Out"
              className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 transition-colors shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar (Matches Reference Screenshot 2) */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 capitalize">
              {activeTab.toLowerCase()}
            </h2>
            <span className="text-xs text-slate-400 font-normal">
              &bull; Nagar Parishad Chittorgarh Live Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Universal Search Bar */}
            <div className="relative w-64 lg:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket, citizen, ward, street..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Quick action buttons */}
            <button
              type="button"
              onClick={() => {
                setStatusModalConfig({
                  isOpen: true,
                  type: 'success',
                  title: 'Database Synchronized!',
                  subtitle: 'Latest records from Chittorgarh Central Database have been successfully refreshed and synchronized.',
                  confirmText: 'OK'
                });
              }}
              title="Refresh Data"
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              type="button"
              title="Notifications"
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
            </button>

            {/* Register New Complaint button */}
            <button
              type="button"
              onClick={() => setShowNewComplaintModal(true)}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Intake</span>
            </button>
          </div>
        </header>

        {/* Dashboard Body */}
        <main className="p-6 space-y-6">
          {/* Greeting & Subtitle (Matches Reference Screenshot 2) */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                Good morning, {userRole.replace('_', ' ')} 👋
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Here's what's happening across Nagar Parishad Chittorgarh today.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync: Chittorgarh Central DB Connected
              </span>
            </div>
          </div>

          {/* ADVANCED FILTERS CARD (Matches Reference Screenshot 2) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div 
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center justify-between px-5 py-3.5 bg-slate-50/80 cursor-pointer border-b border-slate-200"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-600" />
                <span className="font-bold text-xs text-slate-800">Advanced Filters</span>
                <span className="text-[11px] text-slate-400">(Click to {filtersOpen ? 'collapse' : 'expand'} options)</span>
              </div>
              <button className="text-slate-500">
                {filtersOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {filtersOpen && (
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* From Date */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">FROM DATE</label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white"
                    />
                  </div>

                  {/* To Date */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">TO DATE</label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white"
                    />
                  </div>

                  {/* Ward Filter (1 to 60) */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">CHITTORGARH WARD</label>
                    <select
                      value={selectedWard}
                      onChange={(e) => setSelectedWard(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white font-medium"
                    >
                      <option value="ALL">All 60 Wards</option>
                      {wards.map((w) => (
                        <option key={w.ward_number} value={w.ward_number}>
                          Ward {w.ward_number} - {w.ward_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Department Filter */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">DEPARTMENT</label>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white font-medium"
                    >
                      <option value="ALL">All Municipal Departments</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Helpful Note Bar (Matches Screenshot 2) */}
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/60 text-xs text-blue-900 flex items-center gap-2">
                  <span>💡</span>
                  <span>
                    To view complaints for a <strong>single specific date</strong>, simply select that same date in both the "From Date" and "To Date" fields.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 6 OFFICIAL KPI CARDS (Workflow D: Chairman/Executive & Admin Monitoring) */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
            {/* Card 1: Today's Registered */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Today's Registered</span>
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 font-mono">
                {kpis.todayRegistered}
              </p>
              <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                <span>Helpline &amp; WA</span>
              </div>
            </div>

            {/* Card 2: Total Complaints */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Total Complaints</span>
                <Layers className="w-4 h-4 text-slate-600" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 font-mono">
                {kpis.totalComplaints}
              </p>
              <div className="text-[10px] text-slate-500">
                All 60 Wards
              </div>
            </div>

            {/* Card 3: Pending In-Progress */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Pending Complaints</span>
                <ClockAlert className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-extrabold text-amber-600 font-mono">
                {kpis.pendingComplaints}
              </p>
              <div className="text-[10px] text-amber-700">
                In field execution
              </div>
            </div>

            {/* Card 4: Confirmed Closed */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Confirmed Closed</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-extrabold text-emerald-600 font-mono">
                {kpis.confirmedResolvedClosed}
              </p>
              <div className="text-[10px] text-emerald-700">
                2-Step Certified
              </div>
            </div>

            {/* Card 5: Overdue Complaints */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Overdue Complaints</span>
                <AlertCircle className="w-4 h-4 text-rose-600" />
              </div>
              <p className="text-2xl font-extrabold text-rose-600 font-mono">
                {kpis.overdueComplaints}
              </p>
              <div className="text-[10px] text-rose-600 font-semibold">
                SLA Breached
              </div>
            </div>

            {/* Card 6: Escalated */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Escalated Cases</span>
                <ShieldCheck className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-extrabold text-purple-600 font-mono">
                {kpis.escalatedComplaints}
              </p>
              <div className="text-[10px] text-purple-700">
                Executive Action
              </div>
            </div>
          </div>

          {/* ACTIVE TAB CONTENT DISPLAY */}

          {/* TAB: DASHBOARD / ALL TICKETS / SLA */}
          {(activeTab === 'DASHBOARD' || activeTab === 'TICKETS' || activeTab === 'SLA') && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {activeTab === 'SLA' 
                      ? 'SLA Breached & Urgent Escalations' 
                      : 'Complaints & Official Tickets Management'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {activeTab === 'SLA'
                      ? `Showing ${filteredTickets.filter(t => t.is_overdue || t.is_escalated).length} critical complaints requiring immediate action`
                      : `Showing ${filteredTickets.length} active complaints across Chittorgarh Nagar Parishad`}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline-block text-[11px] text-slate-400">
                    Scroll horizontally ↔ to view all details
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Status Filter:</span>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white shadow-2xs"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="REGISTERED">Registered</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED_AWAITING_CITIZEN">Resolved (Awaiting Citizen)</option>
                      <option value="CLOSED">Closed</option>
                      <option value="REOPENED">Reopened</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Table Container with Horizontal Scaling & Visible Grid Lines */}
              <div className="overflow-x-auto border-t-2 border-slate-400">
                <table className="w-full min-w-[1150px] border-collapse border border-slate-400 text-left text-xs text-slate-800">
                  <thead className="bg-slate-100 border-b-2 border-slate-500 font-bold uppercase tracking-wider text-[11px] text-slate-800 select-none">
                    <tr>
                      <th className="px-4 py-3.5 border-r border-slate-400 w-[160px] min-w-[160px] whitespace-nowrap">Ticket ID</th>
                      <th className="px-4 py-3.5 border-r border-slate-400 w-[190px] min-w-[190px] whitespace-nowrap">Citizen &amp; Contact</th>
                      <th className="px-4 py-3.5 border-r border-slate-400 w-[210px] min-w-[210px]">Ward &amp; Location</th>
                      <th className="px-4 py-3.5 border-r border-slate-400 min-w-[260px]">Department &amp; Problem</th>
                      <th className="px-4 py-3.5 border-r border-slate-400 w-[180px] min-w-[180px] whitespace-nowrap">SLA &amp; Deadline</th>
                      <th className="px-4 py-3.5 border-r border-slate-400 w-[160px] min-w-[160px] text-center whitespace-nowrap">Status</th>
                      <th className="px-4 py-3.5 text-right w-[170px] min-w-[170px] whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-400 bg-white">
                    {(activeTab === 'SLA' 
                      ? filteredTickets.filter(t => t.is_overdue || t.is_escalated) 
                      : filteredTickets
                    ).length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                          No matching complaints found for the current filter criteria.
                        </td>
                      </tr>
                    ) : (
                      (activeTab === 'SLA' 
                        ? filteredTickets.filter(t => t.is_overdue || t.is_escalated) 
                        : filteredTickets
                      ).map((ticket) => (
                        <tr key={ticket.id} className="hover:bg-blue-50/70 even:bg-slate-50/50 transition-colors">
                          {/* Ticket Number */}
                          <td className="px-4 py-3.5 border-r border-slate-400 align-middle whitespace-nowrap">
                            <div className="flex flex-col gap-1 items-start">
                              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded border border-slate-400 text-xs tracking-tight whitespace-nowrap">
                                {ticket.ticket_number}
                              </span>
                              {ticket.is_escalated && (
                                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-[9px] uppercase tracking-wide border border-purple-300 whitespace-nowrap">
                                  Escalated
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Citizen */}
                          <td className="px-4 py-3.5 border-r border-slate-400 align-middle whitespace-nowrap">
                            <p className="font-bold text-slate-900 text-xs whitespace-nowrap">{ticket.citizen_name}</p>
                            <a 
                              href={`tel:${ticket.citizen_phone}`} 
                              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline font-mono text-xs whitespace-nowrap mt-0.5 font-medium"
                            >
                              <Phone className="w-3 h-3 text-blue-500 shrink-0" />
                              <span>{ticket.citizen_phone}</span>
                            </a>
                          </td>

                          {/* Ward & Address */}
                          <td className="px-4 py-3.5 border-r border-slate-400 align-middle">
                            <div className="space-y-0.5">
                              <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold text-[11px] border border-slate-400 whitespace-nowrap">
                                Ward {ticket.ward_number}
                              </span>
                              <p className="text-slate-700 text-xs leading-relaxed" title={ticket.address}>
                                {ticket.address}
                              </p>
                            </div>
                          </td>

                          {/* Department & Problem */}
                          <td className="px-4 py-3.5 border-r border-slate-400 align-middle">
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-900 text-xs block leading-snug">
                                {ticket.department_name}
                              </span>
                              <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2" title={ticket.problem_description}>
                                {ticket.problem_description}
                              </p>
                            </div>
                          </td>

                          {/* SLA */}
                          <td className="px-4 py-3.5 border-r border-slate-400 align-middle whitespace-nowrap">
                            <div className="flex items-center gap-1.5 font-semibold text-xs whitespace-nowrap">
                              <ClockAlert className={`w-3.5 h-3.5 shrink-0 ${ticket.is_overdue ? 'text-rose-600' : 'text-slate-500'}`} />
                              <span className={ticket.is_overdue ? 'text-rose-600 font-bold' : 'text-slate-800 font-medium'}>
                                {ticket.sla_deadline}
                              </span>
                            </div>
                            {ticket.is_overdue ? (
                              <span className="inline-block mt-1 px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-300 text-[10px] font-bold whitespace-nowrap">
                                ⚠️ SLA Overdue
                              </span>
                            ) : (
                              <span className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] font-medium whitespace-nowrap">
                                On Schedule
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3.5 border-r border-slate-400 align-middle text-center whitespace-nowrap">
                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-center whitespace-nowrap shadow-2xs border ${
                              ticket.status === 'CLOSED'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : ticket.status === 'RESOLVED_AWAITING_CITIZEN'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : ticket.status === 'REOPENED'
                                ? 'bg-rose-50 text-rose-800 border-rose-300'
                                : 'bg-blue-50 text-blue-800 border-blue-300'
                            }`}>
                              {ticket.status.replace(/_/g, ' ')}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3.5 align-middle text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                              {ticket.status !== 'CLOSED' && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedTicketForClosure(ticket)}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs inline-flex items-center gap-1 transition-all active:scale-95 whitespace-nowrap"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  <span>2-Step Closure</span>
                                </button>
                              )}
                              <a
                                href={`tel:${ticket.citizen_phone}`}
                                title="Call Citizen"
                                className="p-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors inline-flex items-center justify-center shrink-0"
                              >
                                <Phone className="w-4 h-4 text-blue-600" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Workflow Flowcharts & Guides (Placed at bottom, collapsed by default) */}
            {activeTab === 'DASHBOARD' && <TabGuideBanner tabKey="DASHBOARD" />}
            {activeTab === 'TICKETS' && <TabGuideBanner tabKey="TICKETS" />}
            {activeTab === 'SLA' && <TabGuideBanner tabKey="SLA" />}
          </div>
          )}

          {/* TAB: INTAKE QUEUE (Helpline Calls & WhatsApp Intake) */}
          {activeTab === 'INTAKE' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Incoming Unverified Complaint Intake Queue (Workflow A &amp; B)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Helpline calls (10 AM - 6 PM) and WhatsApp messages requiring Portal Manager acceptance
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline-block text-[11px] text-slate-400">
                    Scroll horizontally ↔
                  </span>
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
                    {kpis.pendingIntakes} Pending Verification
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto border-t-2 border-slate-400">
                <table className="w-full min-w-[1050px] border-collapse border border-slate-400 text-left text-xs text-slate-800">
                  <thead className="bg-slate-100 border-b-2 border-slate-500 font-bold uppercase tracking-wider text-[11px] text-slate-800 select-none">
                    <tr>
                      <th className="px-4 py-3.5 border-r border-slate-400 w-[170px] min-w-[170px] whitespace-nowrap">Channel &amp; Time</th>
                      <th className="px-4 py-3.5 border-r border-slate-400 w-[180px] min-w-[180px] whitespace-nowrap">Citizen Info</th>
                      <th className="px-4 py-3.5 border-r border-slate-400 w-[200px] min-w-[200px]">Ward &amp; Locality</th>
                      <th className="px-4 py-3.5 border-r border-slate-400 min-w-[260px]">Reported Problem</th>
                      <th className="px-4 py-3.5 border-r border-slate-400 w-[140px] min-w-[140px] text-center whitespace-nowrap">Queue Status</th>
                      <th className="px-4 py-3.5 text-right w-[160px] min-w-[160px] whitespace-nowrap">Verification Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-400 bg-white">
                    {intakes.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                          Intake queue is currently empty.
                        </td>
                      </tr>
                    ) : (
                      intakes.map((intake) => (
                        <tr key={intake.id} className="hover:bg-blue-50/70 even:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3.5 border-r border-slate-400 align-middle whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap ${
                              intake.intake_channel === 'WHATSAPP' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-blue-100 text-blue-800 border border-blue-300'
                            }`}>
                              {intake.intake_channel === 'WHATSAPP' ? 'WhatsApp 24/7' : 'Helpline Call'}
                            </span>
                            <p className="text-[11px] text-slate-500 font-mono mt-1 whitespace-nowrap">{intake.received_at}</p>
                            {intake.is_after_hours && (
                              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-sm border border-amber-200 mt-0.5 inline-block whitespace-nowrap">
                                After-Hours Queue
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3.5 border-r border-slate-400 align-middle whitespace-nowrap">
                            <p className="font-bold text-slate-900 text-xs whitespace-nowrap">{intake.citizen_name}</p>
                            <p className="font-mono text-slate-700 text-xs mt-0.5 whitespace-nowrap font-medium">{intake.citizen_phone}</p>
                          </td>

                          <td className="px-4 py-3.5 border-r border-slate-400 align-middle">
                            <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold text-[11px] border border-slate-400 mb-0.5 whitespace-nowrap">
                              Ward {intake.ward_number}
                            </span>
                            <p className="text-slate-700 text-xs leading-relaxed" title={intake.address}>{intake.address}</p>
                          </td>

                          <td className="px-4 py-3.5 border-r border-slate-400 align-middle">
                            <p className="font-bold text-slate-900 text-xs leading-snug">{intake.category_name}</p>
                            <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed line-clamp-2" title={intake.problem_description}>{intake.problem_description}</p>
                          </td>

                          <td className="px-4 py-3.5 border-r border-slate-400 align-middle text-center whitespace-nowrap">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap ${
                              intake.status === 'ACCEPTED' 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                                : intake.status === 'REJECTED'
                                ? 'bg-rose-50 text-rose-800 border-rose-300'
                                : 'bg-amber-50 text-amber-800 border-amber-300'
                            }`}>
                              {intake.status}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 align-middle text-right whitespace-nowrap">
                            {intake.status === 'PENDING_REVIEW' ? (
                              <button
                                type="button"
                                onClick={() => setSelectedIntakeForVerification(intake)}
                                className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-all active:scale-95 whitespace-nowrap"
                              >
                                Verify &amp; Accept
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400 font-medium">Processed</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Workflow Flowchart & Guide (Placed at bottom, collapsed by default) */}
            <TabGuideBanner tabKey="INTAKE" />
          </div>
          )}

          {/* TAB: 60 WARDS DIRECTORY */}
          {activeTab === 'WARDS' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Chittorgarh Nagar Parishad: All 60 Wards &amp; Councillors
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ward mapping, elected councillors, contact numbers, and key municipal landmarks
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline-block text-[11px] text-slate-400">
                    Scroll horizontally ↔
                  </span>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                    60 Total Wards
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto max-h-[600px] border-t-2 border-slate-400">
                <table className="w-full min-w-[1000px] border-collapse border border-slate-400 text-left text-xs text-slate-800">
                  <thead className="sticky top-0 bg-slate-100 border-b-2 border-slate-500 font-bold uppercase tracking-wider text-[11px] text-slate-800 z-10 select-none">
                    <tr>
                      <th className="px-4 py-3.5 border-r border-slate-400 w-[110px] min-w-[110px] whitespace-nowrap">Ward #</th>
                      <th className="px-4 py-3.5 border-r border-slate-400 w-[190px] min-w-[190px]">Ward Name</th>
                      <th className="px-4 py-3.5 border-r border-slate-400 w-[140px] min-w-[140px] whitespace-nowrap">Zone</th>
                      <th className="px-4 py-3.5 border-r border-slate-400 w-[180px] min-w-[180px]">Elected Councillor</th>
                      <th className="px-4 py-3.5 border-r border-slate-400 w-[160px] min-w-[160px] whitespace-nowrap">Councillor Phone</th>
                      <th className="px-4 py-3.5 min-w-[220px]">Key Landmarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-400 bg-white">
                    {wards.map((ward) => (
                      <tr key={ward.ward_number} className="hover:bg-blue-50/70 even:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3.5 border-r border-slate-400 align-middle font-mono font-bold text-blue-600 whitespace-nowrap">
                          Ward {ward.ward_number}
                        </td>
                        <td className="px-4 py-3.5 border-r border-slate-400 align-middle font-semibold text-slate-900">
                          {ward.ward_name}
                        </td>
                        <td className="px-4 py-3.5 border-r border-slate-400 align-middle whitespace-nowrap">
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-300">
                            {ward.zone}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 border-r border-slate-400 align-middle font-bold text-slate-800">
                          {ward.councillor_name}
                        </td>
                        <td className="px-4 py-3.5 border-r border-slate-400 align-middle font-mono whitespace-nowrap">
                          <a href={`tel:${ward.councillor_phone}`} className="inline-flex items-center gap-1.5 text-blue-600 hover:underline">
                            <Phone className="w-3 h-3 text-blue-500" />
                            <span>{ward.councillor_phone}</span>
                          </a>
                        </td>
                        <td className="px-4 py-3.5 align-middle text-slate-600 text-xs">
                          {ward.key_landmarks}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Workflow Flowchart & Guide (Placed at bottom, collapsed by default) */}
            <TabGuideBanner tabKey="WARDS" />
          </div>
          )}

          {/* TAB: MUNICIPAL DEPARTMENTS DIRECTORY */}
          {activeTab === 'DEPARTMENTS' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Nagar Parishad Chittorgarh: Municipal Departments Directory
                  </h3>
                  <p className="text-xs text-slate-500">
                    Official departments, nodal executive officers, contact details, and resolution SLAs
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  {departments.length} Municipal Departments
                </span>
              </div>

              <div className="overflow-x-auto border-t-2 border-slate-400">
                <table className="w-full min-w-[950px] border-collapse border border-slate-400 text-left text-xs text-slate-800">
                  <thead className="bg-slate-100 border-b-2 border-slate-500 font-bold uppercase tracking-wider text-[11px] text-slate-800 select-none">
                    <tr>
                      <th className="px-4 py-3.5 border-r border-slate-400 w-[120px] min-w-[120px] whitespace-nowrap">Code</th>
                      <th className="px-4 py-3.5 border-r border-slate-400 min-w-[240px]">Department Name</th>
                      <th className="px-4 py-3.5 border-r border-slate-400 w-[160px] min-w-[160px] whitespace-nowrap">Standard SLA</th>
                      <th className="px-4 py-3.5 border-r border-slate-400 w-[200px] min-w-[200px]">Nodal Officer</th>
                      <th className="px-4 py-3.5 w-[180px] min-w-[180px] whitespace-nowrap">Officer Phone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-400 bg-white">
                    {departments.map((dept) => (
                      <tr key={dept.id} className="hover:bg-blue-50/70 even:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3.5 border-r border-slate-400 align-middle font-mono font-bold text-blue-600 whitespace-nowrap">
                          {dept.code}
                        </td>
                        <td className="px-4 py-3.5 border-r border-slate-400 align-middle font-bold text-slate-900">
                          {dept.name}
                        </td>
                        <td className="px-4 py-3.5 border-r border-slate-400 align-middle whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[11px]">
                            <ClockAlert className="w-3 h-3 text-blue-600" />
                            <span>{dept.default_sla_hours} Hours</span>
                          </span>
                        </td>
                        <td className="px-4 py-3.5 border-r border-slate-400 align-middle font-semibold text-slate-800">
                          {dept.head_officer_name}
                        </td>
                        <td className="px-4 py-3.5 align-middle font-mono whitespace-nowrap">
                          <a href={`tel:${dept.head_officer_phone}`} className="inline-flex items-center gap-1.5 text-blue-600 hover:underline">
                            <Phone className="w-3 h-3 text-blue-500" />
                            <span>{dept.head_officer_phone}</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Workflow Flowchart & Guide (Placed at bottom, collapsed by default) */}
            <TabGuideBanner tabKey="DEPARTMENTS" />
          </div>
          )}

          {/* TAB: WHATSAPP AUDIT LOGS */}
          {activeTab === 'WHATSAPP' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    WhatsApp Automation &amp; Notification Audit Logs (Workflow H)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Official Hindi closure messages, councillor alerts, and officer dispatches
                  </p>
                </div>
                <span className="hidden sm:inline-block text-[11px] text-slate-400">
                  Scroll horizontally ↔
                </span>
              </div>

              <div className="overflow-x-auto border-t-2 border-slate-400">
                <table className="w-full min-w-[1050px] border-collapse border border-slate-400 text-left text-xs text-slate-800">
                  <thead className="bg-slate-100 border-b-2 border-slate-500 font-bold uppercase tracking-wider text-[11px] text-slate-800 select-none">
                    <tr>
                      <th className="px-4 py-3.5 border-r border-slate-400 w-[140px] min-w-[140px] whitespace-nowrap">Ticket #</th>
                      <th className="px-4 py-3.5 border-r border-slate-400 w-[200px] min-w-[200px] whitespace-nowrap">Recipient &amp; Phone</th>
                      <th className="px-4 py-3.5 border-r border-slate-400 w-[170px] min-w-[170px] whitespace-nowrap">Template</th>
                      <th className="px-4 py-3.5 border-r border-slate-400 min-w-[320px]">Message Content</th>
                      <th className="px-4 py-3.5 border-r border-slate-400 w-[130px] min-w-[130px] text-center whitespace-nowrap">Status</th>
                      <th className="px-4 py-3.5 w-[140px] min-w-[140px] whitespace-nowrap">Sent Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-400 bg-white">
                    {notifications.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                          No WhatsApp notification logs recorded yet.
                        </td>
                      </tr>
                    ) : (
                      notifications.map((notif) => (
                        <tr key={notif.id} className="hover:bg-blue-50/70 even:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3.5 border-r border-slate-400 align-middle font-mono font-bold text-slate-900 whitespace-nowrap">
                            {notif.ticket_number}
                          </td>
                          <td className="px-4 py-3.5 border-r border-slate-400 align-middle whitespace-nowrap">
                            <p className="font-semibold text-slate-900 text-xs whitespace-nowrap">{notif.recipient_name}</p>
                            <p className="font-mono text-slate-500 text-xs mt-0.5 whitespace-nowrap">{notif.recipient_phone}</p>
                          </td>
                          <td className="px-4 py-3.5 border-r border-slate-400 align-middle font-mono text-[11px] text-slate-600 whitespace-nowrap">
                            {notif.template_name}
                          </td>
                          <td className="px-4 py-3.5 border-r border-slate-400 align-middle">
                            <p className="line-clamp-2 text-xs text-slate-700 leading-relaxed font-sans" title={notif.message_content}>
                              {notif.message_content}
                            </p>
                          </td>
                          <td className="px-4 py-3.5 border-r border-slate-400 align-middle text-center whitespace-nowrap">
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-[10px] whitespace-nowrap">
                              {notif.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 align-middle text-slate-500 text-xs whitespace-nowrap font-mono">
                            {notif.sent_at}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Workflow Flowchart & Guide (Placed at bottom, collapsed by default) */}
            <TabGuideBanner tabKey="WHATSAPP" />
          </div>
          )}

          {/* TAB: SETTINGS & WORKING HOURS */}
          {activeTab === 'SETTINGS' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">Official Municipal Working Hours (Workflow A &amp; B)</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="font-medium text-slate-700">Helpline Intake Hours:</span>
                    <span className="font-bold text-slate-900">10:00 AM – 6:00 PM IST</span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="font-medium text-slate-700">WhatsApp Intake Reception:</span>
                    <span className="font-bold text-emerald-700">24/7 Automated Ingestion</span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="font-medium text-slate-700">After-Hours Queue Release:</span>
                    <span className="font-bold text-slate-900">Next Working Day at 10:00 AM</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">Configured Municipal SLA Deadlines (Workflow G)</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="font-medium text-slate-700">Emergency &amp; Carcass Disposal:</span>
                    <span className="font-bold text-rose-600">12 Hours SLA</span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="font-medium text-slate-700">Sanitation &amp; Garbage Collection:</span>
                    <span className="font-bold text-amber-600">24 Hours SLA</span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="font-medium text-slate-700">Streetlights &amp; Drains:</span>
                    <span className="font-bold text-blue-600">48 Hours SLA</span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="font-medium text-slate-700">Road Repairs &amp; Civil Works:</span>
                    <span className="font-bold text-slate-800">72 Hours SLA</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* 3. MODALS */}
      {selectedTicketForClosure && (
        <TwoStepClosureModal
          ticket={selectedTicketForClosure}
          onClose={() => setSelectedTicketForClosure(null)}
          onConfirmAuthority={handleAuthorityConfirm}
          onConfirmCitizen={handleCitizenConfirm}
        />
      )}

      {selectedIntakeForVerification && (
        <IntakeVerificationModal
          intake={selectedIntakeForVerification}
          onClose={() => setSelectedIntakeForVerification(null)}
          onAccept={handleAcceptIntake}
          onReject={handleRejectIntake}
        />
      )}

      {showNewComplaintModal && (
        <NewComplaintModal
          wards={wards}
          departments={departments}
          onClose={() => setShowNewComplaintModal(false)}
          onSubmit={(data) => {
            // Step 1: Confirmation Modal (English)
            setStatusModalConfig({
              isOpen: true,
              type: 'confirm',
              title: 'Submit Complaint for Verification?',
              subtitle: 'Are you sure you want to register and submit this citizen complaint to the Portal Manager queue?',
              details: [
                `Citizen: ${data.citizen_name} (${data.citizen_phone})`,
                `Ward & Address: Ward ${data.ward_number} - ${data.address}`,
                `Department: ${data.department_name}`,
                `Problem Category: ${data.category_name}`,
                `Channel: ${data.intake_channel === 'WHATSAPP' ? 'WhatsApp 24/7' : 'Helpline Call (10 AM - 6 PM)'}`
              ],
              confirmText: 'Yes, Submit!',
              cancelText: 'Cancel',
              onConfirm: () => {
                const newIntake: IntakeComplaint = {
                  id: `intake-${Date.now()}`,
                  intake_channel: data.intake_channel,
                  citizen_name: data.citizen_name,
                  citizen_phone: data.citizen_phone,
                  ward_number: data.ward_number,
                  address: data.address,
                  landmark: data.landmark,
                  category_name: data.category_name,
                  department_name: data.department_name,
                  problem_description: data.problem_description,
                  status: 'PENDING_REVIEW',
                  is_after_hours: false,
                  received_at: 'Today ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                };
                onAddIntake(newIntake);
                setShowNewComplaintModal(false);

                // Step 2: Success Modal (English)
                setStatusModalConfig({
                  isOpen: true,
                  type: 'success',
                  title: 'Complaint Submitted Successfully!',
                  subtitle: 'The complaint has been registered in the Intake Queue and is ready for Portal Manager verification.',
                  details: [
                    `Citizen: ${data.citizen_name} (${data.citizen_phone})`,
                    `Ward: Ward ${data.ward_number}`,
                    `Department: ${data.department_name}`,
                    `Status: PENDING REVIEW`
                  ],
                  confirmText: 'OK'
                });
              }
            });
          }}
        />
      )}

      {/* Global Status / Confirmation / Success Modal (AMPLR Health Style) */}
      <StatusModal
        config={statusModalConfig}
        onClose={() => setStatusModalConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
