import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Cake, Sparkles, Send, Gift, RefreshCw } from 'lucide-react';

interface Celebrant {
  type: string;
  id: string;
  name: string;
  dob: string;
  phone?: string;
}

export default function BirthdayWishesManager() {
  const tenantId = localStorage.getItem("tenantId") || "";

  const [celebrants, setCelebrants] = useState<Celebrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);

  const fetchBirthdays = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await api.get<Celebrant[]>(`/birthdaywishes/today/tenant/${tenantId}`);
      setCelebrants(res.data);
    } catch (err) {
      Swal.fire('Error', 'Failed to fetch birthday celebrants.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBirthdays();
  }, [tenantId]);

  const handleSendAllWishes = async () => {
    setTriggering(true);
    try {
      const res = await api.post('/birthdaywishes/trigger-wishes', tenantId, {
        headers: { 'Content-Type': 'application/json' }
      });
      Swal.fire({
        title: 'Wishes Sent! 🎂🎉',
        text: res.data.message || 'Automated WhatsApp & Push Birthday greetings dispatched.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      });
      fetchBirthdays();
    } catch (err: any) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to dispatch birthday wishes.', 'error');
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      
      {/* BREADCRUMB & HEADER */}
      <div>
        <Breadcrumb items={[{ label: 'Communication & Helpdesk', href: '#' }, { label: 'Automated Birthday Wishes Engine' }]} />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Cake className="w-7 h-7 text-pink-500" />
              Automated Birthday Greetings Engine
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">System automatically detects student and staff birthdays and dispatches personalized WhatsApp & In-App greeting cards.</p>
          </div>
          <Button variant="primary" onClick={handleSendAllWishes} disabled={triggering} className="bg-pink-600 hover:bg-pink-700">
            <Send className="w-4 h-4 mr-2" />
            {triggering ? 'Dispatching Wishes...' : 'Send Birthday Wishes Now'}
          </Button>
        </div>
      </div>

      {/* KPI STATUS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Today's Celebrants</p>
            <p className="text-2xl font-black text-pink-600 dark:text-pink-400 mt-1">{celebrants.length}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center text-pink-600 text-xl">🎈</div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Auto Dispatcher</p>
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">ACTIVE (Daily 08:00 AM)</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 text-xl">⏰</div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Channels Sync</p>
            <p className="text-lg font-black text-purple-600 dark:text-purple-400 mt-1">WhatsApp + Push</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 text-xl">📱</div>
        </div>
      </div>

      {/* CELEBRANTS GRID */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
        </div>
      ) : celebrants.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-800">
          <Gift className="w-12 h-12 text-pink-500 mx-auto mb-3 opacity-70" />
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">No Birthdays Today</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto mb-4">
            There are no student or staff birthdays registered for today's date. The automated dispatch engine runs daily at 08:00 AM.
          </p>
          <Button variant="outline" size="sm" onClick={fetchBirthdays} className="inline-flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4" /> Refresh Today's List
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {celebrants.map((item) => (
            <div key={item.id} className="bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-white dark:to-gray-900 rounded-2xl p-6 border border-pink-200 dark:border-pink-900/30 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <Sparkles className="w-16 h-16 text-pink-500/10 absolute -right-3 -bottom-3" />
              <div>
                <div className="flex justify-between items-center mb-3">
                  <Badge variant="light" color={item.type === 'Student' ? 'primary' : 'success'}>
                    {item.type.toUpperCase()}
                  </Badge>
                  <span className="text-xs font-bold text-pink-600 dark:text-pink-400">🎂 Today's Birthday</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{item.name}</h3>
                <p className="text-xs text-gray-500 mt-1">Phone: {item.phone || '+92 300 0000000'}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-pink-100 dark:border-pink-900/20 flex justify-between items-center text-xs text-pink-700 dark:text-pink-300 font-medium">
                <span>Greeting Card Prepared</span>
                <span className="font-bold text-emerald-600">✓ Ready</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
