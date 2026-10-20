import { useState, useEffect } from 'react';
import type { UserRole, Ticket, IntakeComplaint, NotificationLog, Ward, Department } from './types';
import { INITIAL_WARDS, INITIAL_DEPARTMENTS, INITIAL_TICKETS, INITIAL_INTAKES, INITIAL_NOTIFICATIONS } from './data/initialData';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';

export function App() {
  const [currentUser, setCurrentUser] = useState<{ role: UserRole; email: string } | null>(null);
  const [wards, setWards] = useState<Ward[]>(INITIAL_WARDS);
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [intakes, setIntakes] = useState<IntakeComplaint[]>(INITIAL_INTAKES);
  const [notifications, setNotifications] = useState<NotificationLog[]>(INITIAL_NOTIFICATIONS);

  // Attempt live sync with Supabase if configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const activeClient = supabase;
    const fetchLiveDbData = async () => {
      try {
        const { data: wardsData } = await activeClient.from('wards').select('*');
        if (wardsData && wardsData.length > 0) {
          setWards(wardsData);
        }

        const { data: deptsData } = await activeClient.from('departments').select('*');
        if (deptsData && deptsData.length > 0) {
          setDepartments(deptsData);
        }
      } catch (err) {
        console.warn("Supabase live sync in progress or local mode active:", err);
      }
    };

    fetchLiveDbData();
  }, []);

  const handleLogin = (role: UserRole, email: string) => {
    setCurrentUser({ role, email });
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleUpdateTicket = (updatedTicket: Ticket) => {
    setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
  };

  const handleAddTicket = (newTicket: Ticket) => {
    setTickets(prev => [newTicket, ...prev]);
  };

  const handleUpdateIntake = (updatedIntake: IntakeComplaint) => {
    setIntakes(prev => prev.map(i => i.id === updatedIntake.id ? updatedIntake : i));
  };

  const handleAddIntake = (newIntake: IntakeComplaint) => {
    setIntakes(prev => [newIntake, ...prev]);
  };

  const handleAddNotification = (newNotif: NotificationLog) => {
    setNotifications(prev => [newNotif, ...prev]);
  };

  return (
    <div className="w-full min-h-screen bg-slate-100 antialiased">
      {!currentUser ? (
        <LoginView onLogin={handleLogin} />
      ) : (
        <DashboardView
          userRole={currentUser.role}
          userEmail={currentUser.email}
          onLogout={handleLogout}
          wards={wards}
          departments={departments}
          tickets={tickets}
          intakes={intakes}
          notifications={notifications}
          onUpdateTicket={handleUpdateTicket}
          onAddTicket={handleAddTicket}
          onUpdateIntake={handleUpdateIntake}
          onAddIntake={handleAddIntake}
          onAddNotification={handleAddNotification}
        />
      )}
    </div>
  );
}

export default App;
