import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import Button from '../../components/ui/button/Button';
import Input from '../../components/form/input/InputField';
import SearchableSelect, { SearchableSelectOption } from '../../components/form/select/SearchableSelect';
import RichTextEditor from '../../components/form/RichTextEditor';
import StatCards from '../../components/ui/UIDesigns/StatCards';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { MessageSquare, Mail, Send, CheckCircle, Zap, ShieldCheck } from 'lucide-react';

export default function CommunicationBroadcaster() {
  const tenantId = localStorage.getItem("tenantId") || "";
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<'whatsapp' | 'email'>('whatsapp');
  const [audience, setAudience] = useState<string>('Parents');
  const [subject, setSubject] = useState<string>('');
  const [whatsappTemplate, setWhatsappTemplate] = useState<string>('fee_reminder');
  const [message, setMessage] = useState<string>('');
  const [emailBodyHtml, setEmailBodyHtml] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);

  const audienceOptions: SearchableSelectOption[] = [
    { value: 'Parents', label: '👨‍👩‍👧 All Parents & Guardians' },
    { value: 'Staff', label: '👔 Teaching & Non-Teaching Staff' },
    { value: 'Students', label: '🎓 All Enrolled Students' },
    { value: 'All', label: '🌐 Entire School Community (Parents + Staff)' },
  ];

  const templateOptions: SearchableSelectOption[] = [
    { value: 'fee_reminder', label: '💳 Fee Voucher Reminder Template' },
    { value: 'attendance_alert', label: '⚠️ Student Absent Alert Template' },
    { value: 'exam_results', label: '📊 Term Exam Results Card Template' },
    { value: 'custom', label: '📝 Custom Message Template' },
  ];

  const handleTemplateChange = (val: string) => {
    setWhatsappTemplate(val);
    if (val === 'fee_reminder') {
      setMessage("Dear Parent, Fee Voucher for the current month has been generated. Please pay before the due date to avoid late fees. Thank you - Modern School System.");
    } else if (val === 'attendance_alert') {
      setMessage("Dear Parent, Your child was marked ABSENT today. Please contact the school office if you wish to apply for leave. Regards, School Admin.");
    } else if (val === 'exam_results') {
      setMessage("Dear Parent, Term Examination result cards are now available on the Parent Portal. Please log in to view grades. Regards, Principal Office.");
    } else {
      setMessage("");
    }
  };

  useEffect(() => {
    const channel = searchParams.get('channel');
    if (channel === 'email' || channel === 'whatsapp') {
      setActiveTab(channel);
    }
    const targetAudience = searchParams.get('audience');
    if (targetAudience && audienceOptions.some(a => a.value.toLowerCase() === targetAudience.toLowerCase())) {
      const match = audienceOptions.find(a => a.value.toLowerCase() === targetAudience.toLowerCase());
      if (match) setAudience(match.value);
    }
    const template = searchParams.get('template');
    if (template) {
      handleTemplateChange(template);
    }
  }, [searchParams]);

  const handleSendWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) {
      Swal.fire('Required', 'Please enter a message to broadcast.', 'warning');
      return;
    }

    setSending(true);
    try {
      const res = await api.post('/communicationbroadcaster/whatsapp/broadcast', {
        tenant_id: tenantId,
        audience,
        subject: subject || 'School Announcement',
        message
      });

      Swal.fire({
        title: 'Broadcast Sent! 📲',
        text: res.data.message || 'WhatsApp notifications dispatched successfully.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      });

      setMessage('');
    } catch (err: any) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to send WhatsApp broadcast.', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || (!emailBodyHtml && !message)) {
      Swal.fire('Required', 'Please enter Subject and Email content.', 'warning');
      return;
    }

    setSending(true);
    try {
      const res = await api.post('/communicationbroadcaster/email/broadcast', {
        tenant_id: tenantId,
        audience,
        subject,
        message: emailBodyHtml || message
      });

      Swal.fire({
        title: 'Mass Email Dispatched! ✉️',
        text: res.data.message || 'Official mass email broadcast completed.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      });

      setSubject('');
      setEmailBodyHtml('');
      setMessage('');
    } catch (err: any) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to send email broadcast.', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      
      {/* BREADCRUMB & HEADER */}
      <div>
        <Breadcrumb items={[{ label: 'Communication & Helpdesk', href: '#' }, { label: 'Omnichannel Broadcaster' }]} />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Omnichannel Communication Hub</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Broadcast official WhatsApp Business notifications and Mass HTML Emails to parents, staff, and students.</p>
          </div>
          <StatCards
            stats={[
              { title: 'WhatsApp Business API', value: 'ONLINE 🟢', icon: <MessageSquare className="w-5 h-5" />, theme: 'success' },
              { title: 'Mass Email Dispatcher', value: 'SMTP Active 📧', icon: <Mail className="w-5 h-5" />, theme: 'indigo' },
              { title: 'Target Recipient Reach', value: '1,450 Parents / Staff', icon: <ShieldCheck className="w-5 h-5" />, theme: 'brand' },
            ]}
          />
        </div>
      </div>

      {/* CHANNEL TABS */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'whatsapp'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <MessageSquare className="w-5 h-5 text-emerald-500" />
            WhatsApp Business Broadcaster
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'email'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Mail className="w-5 h-5 text-blue-500" />
            Email SMTP Broadcaster
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'whatsapp' ? (
            <form onSubmit={handleSendWhatsApp} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <SearchableSelect
                    label="Select Target Audience *"
                    options={audienceOptions}
                    value={audience}
                    onChange={(val) => setAudience(val)}
                  />
                </div>
                <div>
                  <SearchableSelect
                    label="Choose Approved WhatsApp Template"
                    options={templateOptions}
                    value={whatsappTemplate}
                    onChange={handleTemplateChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">WhatsApp Notification Message Body *</label>
                <textarea
                  rows={4}
                  required
                  className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  placeholder="Type WhatsApp broadcast message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Sent via Official WhatsApp Business API Gateway with instant In-App alert sync.
                </p>
                <Button type="submit" variant="primary" disabled={sending} className="bg-emerald-600 hover:bg-emerald-700">
                  <Send className="w-4 h-4 mr-2" />
                  {sending ? 'Broadcasting...' : 'Broadcast WhatsApp Message'}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSendEmail} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <SearchableSelect
                    label="Select Target Audience *"
                    options={audienceOptions}
                    value={audience}
                    onChange={(val) => setAudience(val)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Email Subject Line *</label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Official School Circular - Winter Vacation Schedule"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Email HTML Content Body</label>
                <RichTextEditor
                  content={emailBodyHtml}
                  onChange={(html) => setEmailBodyHtml(html)}
                  placeholder="Draft your mass email content here with rich formatting..."
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-blue-500" />
                  Dispatched via Secure School SMTP Server with SSL encryption.
                </p>
                <Button type="submit" variant="primary" disabled={sending} className="bg-blue-600 hover:bg-blue-700">
                  <Send className="w-4 h-4 mr-2" />
                  {sending ? 'Sending Mass Email...' : 'Send Mass Email Broadcast'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

    </div>
  );
}
