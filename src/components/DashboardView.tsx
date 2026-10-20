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
      alert(`Success! Ticket ${target.ticket_number} officially CLOSED. Hindi WhatsApp message sent to citizen ${target.citizen_phone}.`);
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
      alert(`Ticket ${target.ticket_number} has been REOPENED. Re-assigned to responsible officer ${target.assigned_officer_name}.`);
    }

    setSelectedTicketForClosure(null);
  };

  // Handlers for Intake verification
  const handleAcceptIntake = (intakeId: string, forwardingOption: ForwardingOption, slaHours: number) => {
    const intake = intakes.find(i => i.id === intakeId);
    if (!intake) return;

    // Update intake status
    onUpdateIntake({
      ...intake,
      status: 'ACCEPTED'
    });

    // Generate unique official ticket SNP-2026-XXXX
    const nextNum = 840 + tickets.length + 1;
    const ticketNum = `SNP-2026-0${nextNum}`;
    const deadlineHours = slaHours;
    const deadlineDate = new Date();
    deadlineDate.setHours(deadlineDate.getHours() + deadlineHours);

    // Find assigned officer for the department
    const dept = departments.find(d => d.name === intake.department_name) || departments[0];

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

    setSelectedIntakeForVerification(null);
    alert(`Success! Generated Ticket ${ticketNum}. Dispatched notifications according to selected forwarding option.`);
  };

  const handleRejectIntake = (intakeId: string, reason: string) => {
    const intake = intakes.find(i => i.id === intakeId);
    if (!intake) return;
    onUpdateIntake({
      ...intake,
      status: 'REJECTED',
      rejection_reason: reason
    });
    setSelectedIntakeForVerification(null);
    alert(`Intake complaint marked as REJECTED with reason recorded in audit log.`);
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
      {/* 1. LEFT SIDEBAR NAVIGATION (Matches Reference Screenshot 2) */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
        <div>
          {/* Sidebar Header Brand */}
          <div className="p-4 border-b border-slate-800/80">
            <NagarParishadLogo size="sm" theme="dark" />
            <div className="mt-2 text-[10px] uppercase font-mono tracking-wider text-slate-400 pl-1">
              ADMIN PORTAL &bull; CHITTORTECH
            </div>
          </div>

          {/* MAIN MENU */}
          <div className="p-3 space-y-6">
            <div>
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                MAIN
              </span>
              <div className="mt-1 space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('DASHBOARD')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'DASHBOARD'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>
              </div>
            </div>

            {/* MANAGEMENT MENU */}
            <div>
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                MANAGEMENT
              </span>
              <div className="mt-1 space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('INTAKE')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'INTAKE'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Inbox className="w-4 h-4" />
                    <span>Intake Queue</span>
                  </div>
                  {kpis.pendingIntakes > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px]">
                      {kpis.pendingIntakes}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('TICKETS')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'TICKETS'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <TicketCheck className="w-4 h-4" />
                    <span>All Complaints</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {tickets.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('SLA')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'SLA'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ClockAlert className="w-4 h-4" />
                    <span>SLA &amp; Overdue</span>
                  </div>
                  {kpis.overdueComplaints > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold text-[10px] animate-pulse">
                      {kpis.overdueComplaints}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('WARDS')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'WARDS'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span>Wards 1–60</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('DEPARTMENTS')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'DEPARTMENTS'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Departments</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('WHATSAPP')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'WHATSAPP'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp Logs</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('SETTINGS')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'SETTINGS'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings &amp; Hours</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User Profile Pill at Bottom (Matches Reference Screenshot 2) */}
        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 text-white">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {userRole.substring(0, 2)}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold truncate leading-tight">
                  {userRole.replace('_', ' ')}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {userEmail}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
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
              onClick={() => alert("Refreshed latest data from Supabase.")}
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
                Live Sync: Supabase Connected
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
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

          {/* TAB: DASHBOARD / ALL TICKETS */}
          {(activeTab === 'DASHBOARD' || activeTab === 'TICKETS') && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Complaints &amp; Official Tickets Management
                  </h3>
                  <p className="text-xs text-slate-500">
                    Showing {filteredTickets.length} active complaints across Chittorgarh Nagar Parishad
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Status Filter:</span>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
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

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px] text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Ticket ID</th>
                      <th className="px-5 py-3">Citizen &amp; Contact</th>
                      <th className="px-5 py-3">Ward &amp; Location</th>
                      <th className="px-5 py-3">Department &amp; Problem</th>
                      <th className="px-5 py-3">SLA &amp; Deadline</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Ticket Number */}
                        <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                          {ticket.ticket_number}
                          {ticket.is_escalated && (
                            <span className="ml-1.5 px-1.5 py-0.5 rounded-sm bg-purple-100 text-purple-700 font-bold text-[9px] uppercase">
                              Escalated
                            </span>
                          )}
                        </td>

                        {/* Citizen */}
                        <td className="px-5 py-3.5">
                          <p className="font-bold text-slate-900">{ticket.citizen_name}</p>
                          <a href={`tel:${ticket.citizen_phone}`} className="text-blue-600 hover:underline font-mono">
                            {ticket.citizen_phone}
                          </a>
                        </td>

                        {/* Ward & Address */}
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-slate-900">Ward {ticket.ward_number}</p>
                          <p className="text-slate-500 text-[11px] truncate max-w-xs">{ticket.address}</p>
                        </td>

                        {/* Department & Problem */}
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-slate-800">{ticket.department_name}</p>
                          <p className="text-slate-500 text-[11px] truncate max-w-xs">{ticket.problem_description}</p>
                        </td>

                        {/* SLA */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5 font-medium">
                            <ClockAlert className={`w-3.5 h-3.5 ${ticket.is_overdue ? 'text-rose-600' : 'text-slate-400'}`} />
                            <span className={ticket.is_overdue ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                              {ticket.sla_deadline}
                            </span>
                          </div>
                          {ticket.is_overdue && (
                            <span className="text-[10px] text-rose-500 font-semibold block">
                              ⚠️ SLA Overdue
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            ticket.status === 'CLOSED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ticket.status === 'RESOLVED_AWAITING_CITIZEN'
                              ? 'bg-amber-100 text-amber-800'
                              : ticket.status === 'REOPENED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {ticket.status.replace(/_/g, ' ')}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                          {ticket.status !== 'CLOSED' && (
                            <button
                              type="button"
                              onClick={() => setSelectedTicketForClosure(ticket)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-2xs inline-flex items-center gap-1"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>2-Step Closure</span>
                            </button>
                          )}
                          <a
                            href={`tel:${ticket.citizen_phone}`}
                            title="Call Citizen"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 inline-block"
                          >
                            <Phone className="w-3.5 h-3.5 text-blue-600" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: INTAKE QUEUE (Helpline Calls & WhatsApp Intake) */}
          {activeTab === 'INTAKE' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Incoming Unverified Complaint Intake Queue (Workflow A &amp; B)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Helpline calls (10 AM - 6 PM) and WhatsApp messages requiring Portal Manager acceptance
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
                  {kpis.pendingIntakes} Pending Verification
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px] text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Channel &amp; Time</th>
                      <th className="px-5 py-3">Citizen Info</th>
                      <th className="px-5 py-3">Ward &amp; Locality</th>
                      <th className="px-5 py-3">Reported Problem</th>
                      <th className="px-5 py-3">Queue Status</th>
                      <th className="px-5 py-3 text-right">Verification Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {intakes.map((intake) => (
                      <tr key={intake.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            intake.intake_channel === 'WHATSAPP' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {intake.intake_channel === 'WHATSAPP' ? 'WhatsApp 24/7' : 'Helpline Call'}
                          </span>
                          <p className="text-[11px] text-slate-500 mt-1">{intake.received_at}</p>
                          {intake.is_after_hours && (
                            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-sm border border-amber-200 mt-0.5 inline-block">
                              After-Hours Queue
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-3.5">
                          <p className="font-bold text-slate-900">{intake.citizen_name}</p>
                          <p className="font-mono text-slate-600">{intake.citizen_phone}</p>
                        </td>

                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-slate-900">Ward {intake.ward_number}</p>
                          <p className="text-slate-500 text-[11px]">{intake.address}</p>
                        </td>

                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-slate-800">{intake.category_name}</p>
                          <p className="text-slate-500 text-[11px]">{intake.problem_description}</p>
                        </td>

                        <td className="px-5 py-3.5">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                            intake.status === 'ACCEPTED' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : intake.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {intake.status}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          {intake.status === 'PENDING_REVIEW' ? (
                            <button
                              type="button"
                              onClick={() => setSelectedIntakeForVerification(intake)}
                              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs"
                            >
                              Verify &amp; Accept
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: 60 WARDS DIRECTORY */}
          {activeTab === 'WARDS' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Chittorgarh Nagar Parishad: All 60 Wards &amp; Councillors
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ward mapping, elected councillors, contact numbers, and key municipal landmarks
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                  60 Total Wards
                </span>
              </div>

              <div className="overflow-x-auto max-h-[600px]">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px] text-slate-500 z-10">
                    <tr>
                      <th className="px-5 py-3">Ward #</th>
                      <th className="px-5 py-3">Ward Name</th>
                      <th className="px-5 py-3">Zone</th>
                      <th className="px-5 py-3">Elected Councillor</th>
                      <th className="px-5 py-3">Councillor Phone</th>
                      <th className="px-5 py-3">Key Landmarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {wards.map((ward) => (
                      <tr key={ward.ward_number} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3 font-mono font-bold text-blue-600">
                          Ward {ward.ward_number}
                        </td>
                        <td className="px-5 py-3 font-semibold text-slate-900">
                          {ward.ward_name}
                        </td>
                        <td className="px-5 py-3">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-medium">
                            {ward.zone}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-bold text-slate-800">
                          {ward.councillor_name}
                        </td>
                        <td className="px-5 py-3 font-mono">
                          <a href={`tel:${ward.councillor_phone}`} className="text-blue-600 hover:underline">
                            {ward.councillor_phone}
                          </a>
                        </td>
                        <td className="px-5 py-3 text-slate-500 text-[11px]">
                          {ward.key_landmarks}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: WHATSAPP AUDIT LOGS */}
          {activeTab === 'WHATSAPP' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    WhatsApp Automation &amp; Notification Audit Logs (Workflow H)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Official Hindi closure messages, councillor alerts, and officer dispatches
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px] text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Ticket #</th>
                      <th className="px-5 py-3">Recipient &amp; Phone</th>
                      <th className="px-5 py-3">Template</th>
                      <th className="px-5 py-3">Message Content</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Sent Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {notifications.map((notif) => (
                      <tr key={notif.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3 font-mono font-bold text-slate-900">
                          {notif.ticket_number}
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-semibold text-slate-900">{notif.recipient_name}</p>
                          <p className="font-mono text-slate-500">{notif.recipient_phone}</p>
                        </td>
                        <td className="px-5 py-3 font-mono text-[10px] text-slate-600">
                          {notif.template_name}
                        </td>
                        <td className="px-5 py-3 max-w-md">
                          <p className="line-clamp-2 text-[11px] text-slate-700 font-sans">
                            {notif.message_content}
                          </p>
                        </td>
                        <td className="px-5 py-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            {notif.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-500 text-[11px]">
                          {notif.sent_at}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
            alert("New complaint added to Intake Queue for Portal Manager verification.");
          }}
        />
      )}
    </div>
  );
};
