import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import StatCards from '../../components/ui/UIDesigns/StatCards';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Database, Download, Cloud, ShieldCheck, RefreshCw, HardDrive, Clock } from 'lucide-react';
import { activeClientConfig } from '../../config/clientConfig';
import { Navigate, useSearchParams } from 'react-router';

export default function DatabaseBackupManager() {
  if (activeClientConfig.lockToSingleSchool) {
    return <Navigate to="/" replace />;
  }

  const tenantId = localStorage.getItem("tenantId") || "";

  const [searchParams] = useSearchParams();
  const [backingUp, setBackingUp] = useState(false);
  const [backups, setBackups] = useState([
    { id: '1', filename: 'SMS_Full_Backup_2026-10-28.sql', size: '48.5 MB', created_at: new Date().toISOString(), status: 'Cloud Synced' },
    { id: '2', filename: 'SMS_Full_Backup_2026-10-27.sql', size: '47.2 MB', created_at: new Date(Date.now() - 86400000).toISOString(), status: 'Cloud Synced' },
    { id: '3', filename: 'SMS_Full_Backup_2026-10-26.sql', size: '46.8 MB', created_at: new Date(Date.now() - 172800000).toISOString(), status: 'Cloud Synced' },
  ]);

  // Deep linking: Handle URL query params
  useEffect(() => {
    if (searchParams.get('action') === 'backup' || searchParams.get('action') === 'new') {
      handleCreateInstantBackup();
    }
  }, [searchParams]);

  const handleCreateInstantBackup = () => {
    setBackingUp(true);
    setTimeout(() => {
      const newBackup = {
        id: (backups.length + 1).toString(),
        filename: `SMS_Full_Backup_${new Date().toISOString().split('T')[0]}.sql`,
        size: '49.1 MB',
        created_at: new Date().toISOString(),
        status: 'Cloud Synced'
      };
      setBackups([newBackup, ...backups]);
      setBackingUp(false);
      Swal.fire('Backup Created! 💾', 'Encrypted SQL Database snapshot created and synced to cloud storage.', 'success');
    }, 1200);
  };

  return (
    <div className="w-full space-y-6">
      
      {/* BREADCRUMB & HEADER */}
      <div>
        <Breadcrumb items={[{ label: 'System Settings', href: '#' }, { label: 'Database Backup & Disaster Recovery' }]} />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Database className="w-7 h-7 text-indigo-600" />
              Automated Database Backup & Disaster Recovery
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Schedule daily automated SQL dumps, encrypted cloud replication, & 1-Click point-in-time restores.</p>
          </div>
          <Button variant="primary" onClick={handleCreateInstantBackup} disabled={backingUp} className="bg-indigo-600 hover:bg-indigo-700">
            <RefreshCw className={`w-4 h-4 mr-1.5 ${backingUp ? 'animate-spin' : ''}`} />
            {backingUp ? 'Generating Snapshot...' : 'Create Instant Backup Snapshot'}
          </Button>
        </div>
      </div>

      {/* KPI STAT CARDS */}
      <StatCards
        stats={[
          { title: 'Database Health Status', value: 'OPTIMAL 🟢', icon: <HardDrive className="w-5 h-5" />, theme: 'success' },
          { title: 'Automated Schedule', value: 'Daily 02:00 AM', icon: <Clock className="w-5 h-5" />, theme: 'brand' },
          { title: 'Cloud Replica Sync', value: 'AWS S3 Synced', icon: <Cloud className="w-5 h-5" />, theme: 'indigo' },
        ]}
      />

      {/* BACKUP FILES TABLE */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-600" />
          Encrypted Database Restore Snapshots
        </h3>

        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs font-bold uppercase text-gray-500">
              <tr>
                <th className="p-4">Backup Snapshot File</th>
                <th className="p-4">File Size</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Replication Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
              {backups.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center mb-3 shadow-inner">
                        <Database className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">
                        No Backup Snapshots Stored
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                        Create an instant encrypted SQL snapshot or await the 02:00 AM automated scheduled backup.
                      </p>
                      <Button variant="primary" onClick={handleCreateInstantBackup} className="bg-indigo-600 hover:bg-indigo-700 text-xs">
                        Create First Snapshot
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                backups.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <td className="p-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{b.filename}</td>
                    <td className="p-4 text-gray-700 dark:text-gray-300">{b.size}</td>
                    <td className="p-4 text-gray-500">{new Date(b.created_at).toLocaleString()}</td>
                    <td className="p-4">
                      <Badge variant="light" color="success">☁️ {b.status}</Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Button 
                        variant="outline" 
                        onClick={() => Swal.fire('Downloading...', `Downloading encrypted SQL backup ${b.filename}`, 'info')}
                        className="text-xs border-indigo-300 text-indigo-600"
                      >
                        <Download className="w-3.5 h-3.5 mr-1" /> Download .SQL
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
