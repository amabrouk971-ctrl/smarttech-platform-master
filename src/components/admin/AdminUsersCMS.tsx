import React, { useState, useEffect } from 'react';
import { Users, Shield, Search, CheckCircle2, XCircle, Clock, AlertTriangle, Key } from 'lucide-react';
import { User, Role } from '../../types';
import { fetchAllUsersFromFirestore, updateUserProfileInFirestore } from '../../services/firebaseService';
import { logSecurityEvent, sendResetEmail } from '../../services/authService';
import { auth } from '../../firebase/config';

export const AdminUsersCMS: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const allUsers = await fetchAllUsersFromFirestore();
      setUsers(allUsers);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (user: User, newStatus: User['status']) => {
    if (!window.confirm(`Change status to ${newStatus}?`)) return;
    try {
      const updatedUser = { ...user, status: newStatus };
      await updateUserProfileInFirestore(updatedUser);
      setUsers(users.map(u => u.id === user.id ? updatedUser : u));
      await logSecurityEvent({
        userId: user.id,
        userEmail: user.email,
        eventType: newStatus === 'DISABLED' ? 'ACCOUNT_DISABLED' : 'ACCOUNT_ENABLED',
        result: 'SUCCESS',
        actorId: auth.currentUser?.uid
      });
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    }
  };

  const handleUpdateRole = async (user: User, newRole: Role) => {
    if (!window.confirm(`Change role to ${newRole}?`)) return;
    try {
      const updatedUser = { ...user, role: newRole };
      await updateUserProfileInFirestore(updatedUser);
      setUsers(users.map(u => u.id === user.id ? updatedUser : u));
      await logSecurityEvent({
        userId: user.id,
        userEmail: user.email,
        eventType: 'ROLE_CHANGED',
        result: 'SUCCESS',
        actorId: auth.currentUser?.uid,
        metadata: { newRole }
      });
    } catch (err) {
      console.error(err);
      alert('Failed to update role.');
    }
  };

  const handleSendResetEmail = async (user: User) => {
    if (!window.confirm(`Send password reset email to ${user.email}?`)) return;
    try {
      await sendResetEmail(user.email);
      alert('Password reset link sent.');
    } catch (err) {
      alert('Failed to send reset email.');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6" dir="ltr">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-indigo-500" />
            User Management
          </h2>
          <p className="text-slate-400 mt-1">Manage accounts, roles, statuses, and authentication.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 w-64"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Roles</option>
            {Object.values(Role).map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400">Loading users...</div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-bold">User</th>
                  <th className="px-6 py-4 font-bold">Role</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Last Login</th>
                  <th className="px-6 py-4 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold uppercase">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white">{user.name}</div>
                          <div className="text-xs text-slate-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdateRole(user, e.target.value as Role)}
                        className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        {Object.values(Role).map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.status || 'ACTIVE'}
                        onChange={(e) => handleUpdateStatus(user, e.target.value as any)}
                        className={`border rounded px-2 py-1 text-xs font-bold focus:outline-none
                          ${(!user.status || user.status === 'ACTIVE') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : ''}
                          ${user.status === 'DISABLED' ? 'bg-red-500/10 text-red-400 border-red-500/30' : ''}
                          ${user.status === 'PENDING_APPROVAL' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : ''}
                          ${user.status === 'EMAIL_VERIFICATION_PENDING' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : ''}
                        `}
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="DISABLED">DISABLED</option>
                        <option value="SUSPENDED">SUSPENDED</option>
                        <option value="PENDING_APPROVAL">PENDING APPROVAL</option>
                        <option value="EMAIL_VERIFICATION_PENDING">EMAIL UNVERIFIED</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleSendResetEmail(user)}
                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-400/10 px-3 py-1.5 rounded transition-colors"
                      >
                        Send Reset Link
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
