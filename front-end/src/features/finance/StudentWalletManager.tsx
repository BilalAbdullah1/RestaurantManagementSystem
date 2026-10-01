import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import api from '../../utils/axiosConfig';
import Badge from '../../components/ui/badge/Badge';
import Button from '../../components/ui/button/Button';
import InputField from '../../components/form/input/InputField';
import SearchableSelect, { SearchableSelectOption } from '../../components/form/select/SearchableSelect';
import Label from '../../components/form/Label';
import ProfileDrawer from '../../components/ui/UIDesigns/ProfileDrawer';
import StatCards, { StatCardData } from '../../components/ui/UIDesigns/StatCards';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import ActionMenu from '../../components/ui/UIDesigns/ActionMenu';
import { toast } from '../../components/ui/Toast';
import { DataTable } from '../../components/ui/table/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { 
  Wallet, PlusCircle, MinusCircle, DollarSign, ShoppingBag, 
  CreditCard, AlertTriangle, Clock, ArrowUpRight, ArrowDownLeft, AlertCircle
} from 'lucide-react';

interface StudentWalletItem {
  id: string;
  student_id: string;
  student_name: string;
  admission_number: string;
  class_name: string;
  balance: number;
  last_topup_date?: string;
  rfid_card_tag?: string;
}

interface StudentLookup {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  class_name?: string;
}

export default function StudentWalletManager() {
  const tenantId = localStorage.getItem("tenantId") || "";

  const [searchParams] = useSearchParams();
  const [wallets, setWallets] = useState<StudentWalletItem[]>([]);
  const [students, setStudents] = useState<StudentLookup[]>([]);
  const [loading, setLoading] = useState(true);

  const [topUpDrawerOpen, setTopUpDrawerOpen] = useState(false);
  const [deductDrawerOpen, setDeductDrawerOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [amount, setAmount] = useState<number>(500);
  const [paymentMethod, setPaymentMethod] = useState('Counter Cash');
  const [reason, setReason] = useState('Canteen Purchase');
  const [balanceFilter, setBalanceFilter] = useState<'all' | 'low' | 'healthy'>('all');

  const STORAGE_KEY = `student_wallets_${tenantId}`;

  const loadStoredWallets = (): StudentWalletItem[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  };

  const saveStoredWallets = (data: StudentWalletItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  };

  const fetchWallets = async () => {
    setLoading(true);
    try {
      let stuList: StudentLookup[] = [];
      if (tenantId) {
        try {
          const stuRes = await api.get<StudentLookup[]>(`/students/tenant/${tenantId}`);
          if (Array.isArray(stuRes.data)) stuList = stuRes.data;
        } catch {
          // Ignore network failure, continue to stored/fallback data
        }
      }
      setStudents(stuList);

      const saved = loadStoredWallets();
      if (saved && saved.length > 0) {
        setWallets(saved);
      } else if (stuList.length > 0) {
        const initialWallets: StudentWalletItem[] = stuList.map((s, idx) => ({
          id: s.id,
          student_id: s.id,
          student_name: `${s.first_name || ''} ${s.last_name || ''}`.trim() || 'Unknown Student',
          admission_number: s.admission_number || `ADM-${1000 + idx}`,
          class_name: s.class_name || 'Class 9-A',
          balance: 250 + (idx * 150) % 1500,
          last_topup_date: new Date().toISOString(),
          rfid_card_tag: `RFID-${1000 + idx}`
        }));
        setWallets(initialWallets);
        saveStoredWallets(initialWallets);
      } else {
        const fallbackWallets: StudentWalletItem[] = [
          { id: '1', student_id: '1', student_name: 'Muhammad Ali', admission_number: 'ADM-1001', class_name: 'Class 10-A', balance: 1250, last_topup_date: new Date().toISOString(), rfid_card_tag: 'RFID-1001' },
          { id: '2', student_id: '2', student_name: 'Fatima Zahra', admission_number: 'ADM-1002', class_name: 'Class 9-B', balance: 75, last_topup_date: new Date().toISOString(), rfid_card_tag: 'RFID-1002' },
          { id: '3', student_id: '3', student_name: 'Ahmed Raza', admission_number: 'ADM-1003', class_name: 'Class 8-A', balance: 520, last_topup_date: new Date().toISOString(), rfid_card_tag: 'RFID-1003' },
          { id: '4', student_id: '4', student_name: 'Ayesha Noor', admission_number: 'ADM-1004', class_name: 'Class 10-B', balance: 190, last_topup_date: new Date().toISOString(), rfid_card_tag: 'RFID-1004' },
          { id: '5', student_id: '5', student_name: 'Hamza Khan', admission_number: 'ADM-1005', class_name: 'Class 7-C', balance: 2400, last_topup_date: new Date().toISOString(), rfid_card_tag: 'RFID-1005' },
        ];
        setWallets(fallbackWallets);
        saveStoredWallets(fallbackWallets);
      }
    } catch {
      toast.error('Failed to load student wallets.');
      const saved = loadStoredWallets();
      if (saved.length > 0) setWallets(saved);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, [tenantId]);

  // Deep linking: Handle URL query params
  useEffect(() => {
    const act = searchParams.get('action');
    if (act === 'topup' || act === 'recharge' || act === 'new') {
      setSelectedStudentId(searchParams.get('student_id') || '');
      setAmount(500);
      setTopUpDrawerOpen(true);
    } else if (act === 'deduct') {
      setSelectedStudentId(searchParams.get('student_id') || '');
      setAmount(100);
      setDeductDrawerOpen(true);
    }
    const filter = searchParams.get('filter');
    if (filter === 'low' || filter === 'healthy' || filter === 'all') {
      setBalanceFilter(filter);
    }
  }, [searchParams]);

  const activeSelectedStudent = useMemo(() => {
    return wallets.find(w => w.student_id === selectedStudentId);
  }, [wallets, selectedStudentId]);

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || amount <= 0) {
      toast.error('Please select student and enter a valid top-up amount.');
      return;
    }

    setSubmitLoading(true);
    setTimeout(() => {
      const exists = wallets.some(w => w.student_id === selectedStudentId);
      let updated: StudentWalletItem[];
      if (exists) {
        updated = wallets.map(w => {
          if (w.student_id === selectedStudentId) {
            return { ...w, balance: w.balance + amount, last_topup_date: new Date().toISOString() };
          }
          return w;
        });
      } else {
        const studentInfo = students.find(s => s.id === selectedStudentId);
        const newWallet: StudentWalletItem = {
          id: selectedStudentId,
          student_id: selectedStudentId,
          student_name: studentInfo ? `${studentInfo.first_name || ''} ${studentInfo.last_name || ''}`.trim() : 'Student',
          admission_number: studentInfo?.admission_number || 'N/A',
          class_name: studentInfo?.class_name || 'General',
          balance: amount,
          last_topup_date: new Date().toISOString(),
          rfid_card_tag: `RFID-${Math.floor(1000 + Math.random() * 9000)}`
        };
        updated = [newWallet, ...wallets];
      }

      setWallets(updated);
      saveStoredWallets(updated);
      toast.success(`Wallet Recharged! Rs. ${amount.toLocaleString()} added via ${paymentMethod}.`);
      setTopUpDrawerOpen(false);
      setSubmitLoading(false);
      setAmount(500);
    }, 250);
  };

  const handleDeductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || amount <= 0) {
      toast.error('Please select student and enter a valid purchase amount.');
      return;
    }

    const targetWallet = wallets.find(w => w.student_id === selectedStudentId);
    if (!targetWallet) {
      toast.error('Selected student does not have an active wallet account.');
      return;
    }
    if (targetWallet.balance < amount) {
      toast.error(`Insufficient Balance! Student only has Rs. ${targetWallet.balance.toLocaleString()}, cannot deduct Rs. ${amount.toLocaleString()}.`);
      return;
    }

    setSubmitLoading(true);
    setTimeout(() => {
      const updated = wallets.map(w => {
        if (w.student_id === selectedStudentId) {
          return { ...w, balance: w.balance - amount };
        }
        return w;
      });
      setWallets(updated);
      saveStoredWallets(updated);
      toast.success(`Deducted Rs. ${amount.toLocaleString()} for "${reason}". Remaining Balance: Rs. ${(targetWallet.balance - amount).toLocaleString()}`);
      setDeductDrawerOpen(false);
      setSubmitLoading(false);
      setAmount(100);
    }, 250);
  };

  const studentOptions = useMemo((): SearchableSelectOption[] => {
    if (students.length > 0) {
      return students.map(s => ({
        value: s.id,
        label: `${s.first_name || ''} ${s.last_name || ''} (${s.admission_number || 'N/A'})`
      }));
    }
    return wallets.map(w => ({
      value: w.student_id,
      label: `${w.student_name} (${w.admission_number}) - ${w.class_name}`
    }));
  }, [students, wallets]);

  const displayedWallets = useMemo(() => {
    if (balanceFilter === 'low') {
      return wallets.filter(w => w.balance < 200);
    }
    if (balanceFilter === 'healthy') {
      return wallets.filter(w => w.balance >= 200);
    }
    return wallets;
  }, [wallets, balanceFilter]);

  const totalWalletBalance = useMemo(() => {
    return wallets.reduce((acc, w) => acc + (w.balance || 0), 0);
  }, [wallets]);

  const lowBalanceCount = useMemo(() => {
    return wallets.filter(w => w.balance < 200).length;
  }, [wallets]);

  const statsData: StatCardData[] = useMemo(() => [
    {
      title: 'Total Active Wallets',
      value: wallets.length.toString(),
      icon: <Wallet className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
      theme: 'brand'
    },
    {
      title: 'Total Float Balance',
      value: `Rs. ${totalWalletBalance.toLocaleString()}`,
      icon: <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      theme: 'success'
    },
    {
      title: 'Low Balance Alerts (< Rs. 200)',
      value: lowBalanceCount.toString(),
      icon: <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
      theme: 'warning'
    },
    {
      title: 'RFID Canteen Linked',
      value: `${wallets.filter(w => w.rfid_card_tag).length} Cards`,
      icon: <CreditCard className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
      theme: 'purple'
    }
  ], [wallets, totalWalletBalance, lowBalanceCount]);

  const columns = useMemo<ColumnDef<StudentWalletItem>[]>(
    () => [
      {
        accessorKey: 'student_name',
        header: 'Student & Admission #',
        cell: ({ row }) => {
          const item = row.original;
          const initials = item.student_name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase() || 'ST';
          return (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                {initials}
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-sm">{item.student_name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">Adm: {item.admission_number}</span>
                  <span className="inline-block w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                  <span className="text-xs text-brand-600 dark:text-brand-400 font-medium">{item.class_name}</span>
                </div>
              </div>
            </div>
          );
        }
      },
      {
        accessorKey: 'rfid_card_tag',
        header: 'RFID Smart Card',
        cell: (info) => {
          const tag = (info.getValue() as string) || 'N/A';
          return (
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
              <span className="font-mono text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800/60">
                {tag}
              </span>
            </div>
          );
        }
      },
      {
        accessorKey: 'balance',
        header: 'Wallet Balance',
        cell: (info) => {
          const val = Number(info.getValue()) || 0;
          const isLow = val < 200;
          return (
            <div className="flex items-center gap-2">
              <span className={`font-black text-sm ${isLow ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                Rs. {val.toLocaleString()}
              </span>
              <Badge
                variant="light"
                color={isLow ? 'error' : 'success'}
                size="sm"
              >
                {isLow ? 'Low Balance' : 'Active'}
              </Badge>
            </div>
          );
        }
      },
      {
        accessorKey: 'last_topup_date',
        header: 'Last Activity',
        cell: (info) => {
          const dateStr = info.getValue() as string;
          if (!dateStr) return <span className="text-xs text-gray-400">No activity</span>;
          const d = new Date(dateStr);
          return (
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{d.toLocaleDateString()} {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </span>
          );
        }
      },
      {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => {
          const item = row.original;
          const actionItems = [
            {
              label: 'Top-Up Balance',
              icon: <PlusCircle className="w-4 h-4 text-emerald-500" />,
              onClick: () => {
                setSelectedStudentId(item.student_id);
                setAmount(500);
                setTopUpDrawerOpen(true);
              }
            },
            {
              label: 'Deduct Purchase',
              icon: <MinusCircle className="w-4 h-4 text-rose-500" />,
              onClick: () => {
                setSelectedStudentId(item.student_id);
                setAmount(100);
                setDeductDrawerOpen(true);
              }
            }
          ];

          return (
            <div className="flex justify-end">
              <ActionMenu items={actionItems} />
            </div>
          );
        }
      }
    ],
    []
  );

  return (
    <div className="w-full max-w-full space-y-6">
      
      {/* Top Breadcrumb Navigation */}
      <Breadcrumb items={[
        { label: 'Finance & Accounts', href: '/finance' },
        { label: 'Student Digital Wallets' }
      ]} />

      {/* Main Header Banner Card */}
      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
              <Wallet className="w-7 h-7 text-brand-500" />
              Student Digital Wallets & Canteen RFID Cards
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage RFID smart cards, advance wallet balances, and instant canteen purchases.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 items-center">
            <Button 
              onClick={() => { setSelectedStudentId(''); setAmount(500); setTopUpDrawerOpen(true); }}
              variant="primary"
              className="!bg-emerald-600 hover:!bg-emerald-700 text-white font-bold"
              startIcon={<PlusCircle className="w-4 h-4" />}
            >
              Recharge Wallet
            </Button>
            <Button 
              onClick={() => { setSelectedStudentId(''); setAmount(100); setDeductDrawerOpen(true); }}
              variant="danger"
              className="font-bold"
              startIcon={<MinusCircle className="w-4 h-4" />}
            >
              Deduct Purchase
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stats Summary Cards */}
      <StatCards stats={statsData} loading={loading} />

      {/* Main Standard DataTable */}
      <DataTable
        loading={loading}
        data={displayedWallets}
        columns={columns}
        searchPlaceholder="Search student name, admission #, or RFID card UID..."
        emptyMessage="No student digital wallets found in this filter."
        exportable={true}
        exportFilename="student_wallets_report"
        leftActions={
          <div className="flex p-1 space-x-1 bg-gray-100 dark:bg-gray-800/50 rounded-xl">
            {[
              { id: 'all', label: `All Wallets (${wallets.length})` },
              { id: 'low', label: `Low Balance (${wallets.filter(w => w.balance < 200).length})` },
              { id: 'healthy', label: `Healthy (${wallets.filter(w => w.balance >= 200).length})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setBalanceFilter(tab.id as any)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  balanceFilter === tab.id
                    ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        }
      />

      {/* Slide-Over Drawer for Recharging Wallet */}
      <ProfileDrawer
        isOpen={topUpDrawerOpen}
        onClose={() => setTopUpDrawerOpen(false)}
        title="Recharge Student Wallet"
        subtitle="Deposit advance balance into student account"
        icon={<Wallet className="w-10 h-10 text-white" />}
      >
        <form onSubmit={handleTopUpSubmit} className="space-y-5 p-1">
          <div>
            <Label required>Select Student</Label>
            <SearchableSelect 
              options={studentOptions}
              value={selectedStudentId}
              onChange={(val) => setSelectedStudentId(val as string)}
              placeholder="Search student by name or adm #..."
            />
          </div>

          {activeSelectedStudent && (
            <div className="p-3.5 bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800/60 rounded-xl space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600 dark:text-gray-400">Current Balance:</span>
                <span className="font-bold text-gray-900 dark:text-white">Rs. {activeSelectedStudent.balance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-emerald-700 dark:text-emerald-400 font-medium">After Recharge (+Rs. {amount || 0}):</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">
                  Rs. {(activeSelectedStudent.balance + (Number(amount) || 0)).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <div>
            <Label required>Deposit Amount (Rs.)</Label>
            <InputField 
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Enter top-up amount"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {[100, 200, 500, 1000, 2000, 5000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-bold border transition-colors ${
                    amount === preset 
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  +Rs. {preset.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label required>Payment Method</Label>
            <SearchableSelect 
              options={[
                { value: 'Counter Cash', label: 'Counter Cash' },
                { value: 'Bank Transfer', label: 'Bank Transfer' },
                { value: 'Credit / Debit Card', label: 'Credit / Debit Card' },
                { value: 'JazzCash / EasyPaisa', label: 'JazzCash / EasyPaisa' }
              ]}
              value={paymentMethod}
              onChange={(val) => setPaymentMethod(val as string)}
            />
          </div>

          <div className="pt-6 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-800">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setTopUpDrawerOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              className="!bg-emerald-600 hover:!bg-emerald-700 text-white font-bold"
              loading={submitLoading}
              loadingText="Recharging..."
              startIcon={<ArrowUpRight className="w-4 h-4" />}
            >
              Recharge Wallet
            </Button>
          </div>
        </form>
      </ProfileDrawer>

      {/* Slide-Over Drawer for Deducting Wallet Purchase */}
      <ProfileDrawer
        isOpen={deductDrawerOpen}
        onClose={() => setDeductDrawerOpen(false)}
        title="Deduct Canteen / Store Purchase"
        subtitle="POS deduction from student card balance"
        icon={<ShoppingBag className="w-10 h-10 text-white" />}
      >
        <form onSubmit={handleDeductSubmit} className="space-y-5 p-1">
          <div>
            <Label required>Select Student</Label>
            <SearchableSelect 
              options={studentOptions}
              value={selectedStudentId}
              onChange={(val) => setSelectedStudentId(val as string)}
              placeholder="Search student by name or adm #..."
            />
          </div>

          {activeSelectedStudent && (
            <div className={`p-3.5 rounded-xl border space-y-1 ${
              activeSelectedStudent.balance < amount 
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400'
                : 'bg-slate-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-800'
            }`}>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600 dark:text-gray-400">Current Balance:</span>
                <span className="font-bold text-gray-900 dark:text-white">Rs. {activeSelectedStudent.balance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium">Remaining After Purchase:</span>
                <span className={`font-black ${activeSelectedStudent.balance < amount ? 'text-rose-600' : 'text-gray-900 dark:text-white'}`}>
                  Rs. {Math.max(0, activeSelectedStudent.balance - (Number(amount) || 0)).toLocaleString()}
                </span>
              </div>
              {activeSelectedStudent.balance < amount && (
                <div className="pt-2 flex items-center gap-1.5 text-xs text-rose-600 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Insufficient Balance! Student needs Rs. {(amount - activeSelectedStudent.balance).toLocaleString()} more.</span>
                </div>
              )}
            </div>
          )}

          <div>
            <Label required>Purchase Amount (Rs.)</Label>
            <InputField 
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Enter purchase amount"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {[30, 50, 100, 150, 200, 500].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-bold border transition-colors ${
                    amount === preset 
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm' 
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  Rs. {preset.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label required>Purchase Category / Reason</Label>
            <SearchableSelect 
              options={[
                { value: 'Canteen Purchase', label: 'Canteen Meal / Snacks' },
                { value: 'Bookstore / Stationary', label: 'Bookstore & Stationary' },
                { value: 'Uniform / Sports Kit', label: 'Uniform / Sports Item' },
                { value: 'Library Late Fine', label: 'Library Fine' }
              ]}
              value={reason}
              onChange={(val) => setReason(val as string)}
            />
          </div>

          <div className="pt-6 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-800">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setDeductDrawerOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="danger"
              className="font-bold"
              loading={submitLoading}
              loadingText="Deducting..."
              startIcon={<ArrowDownLeft className="w-4 h-4" />}
            >
              Deduct Wallet Balance
            </Button>
          </div>
        </form>
      </ProfileDrawer>

    </div>
  );
}
