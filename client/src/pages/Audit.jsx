import React, { useEffect, useState } from 'react';
import AppShell from '../components/Layout/AppShell';
import { api } from '../services/api';

export default function AuditPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api('/audit-log?limit=100').then(setLogs);
  }, []);

  return (
    <AppShell title="Audit Trail">
      <div className="page-header">
        <h2>Audit Trail &amp; Compliance</h2>
        <p>Append-only log of all create, edit, post, approve, and login events</p>
      </div>

      <div className="card">
        <table className="data-table" id="audit-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Entity ID</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.log_id}>
                <td>{log.timestamp}</td>
                <td>{log.user_name || '—'}</td>
                <td><span className="badge badge-info">{log.action}</span></td>
                <td>{log.entity}</td>
                <td>{log.entity_id ? `${log.entity_id.slice(0, 12)}…` : '—'}</td>
                <td>{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
