import React, { useState, useEffect } from 'react';
import { Save, Shield, Mail, Lock, UserCheck, Key, Globe, Clock, Smartphone, UserPlus, FileText } from 'lucide-react';
import { AuthSettings } from '../../types';
import { fetchAuthSettings, saveAuthSettings, DEFAULT_AUTH_SETTINGS } from '../../services/authService';

export const AuthenticationSettingsCMS: React.FC = () => {
  const [settings, setSettings] = useState<AuthSettings>(DEFAULT_AUTH_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAuthSettings();
      setSettings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveAuthSettings(settings);
      alert('Authentication settings saved successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: keyof AuthSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) return <div className="text-white p-8">Loading settings...</div>;

  return (
    <div className="space-y-6" dir="ltr">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Shield className="w-7 h-7 text-red-500" />
            Authentication Settings
          </h2>
          <p className="text-slate-400 mt-1">Configure sign-in providers, security policies, and registration rules.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sign-In Providers */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
            <Globe className="w-5 h-5 text-indigo-400" />
            Sign-In Providers
          </h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-medium text-slate-200">Email & Password</span>
              </div>
              <input
                type="checkbox"
                checked={settings.enableEmailPassword}
                onChange={(e) => updateSetting('enableEmailPassword', e.target.checked)}
                className="w-5 h-5 rounded border-slate-700 text-red-500 focus:ring-red-500 bg-slate-950"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-medium text-slate-200">Google Sign-In</span>
              </div>
              <input
                type="checkbox"
                checked={settings.enableGoogle}
                onChange={(e) => updateSetting('enableGoogle', e.target.checked)}
                className="w-5 h-5 rounded border-slate-700 text-red-500 focus:ring-red-500 bg-slate-950"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-medium text-slate-200">Phone Number (SMS)</span>
              </div>
              <input
                type="checkbox"
                checked={settings.enablePhone}
                onChange={(e) => updateSetting('enablePhone', e.target.checked)}
                className="w-5 h-5 rounded border-slate-700 text-red-500 focus:ring-red-500 bg-slate-950"
              />
            </label>
          </div>
        </div>

        {/* Security Policies */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
            <Lock className="w-5 h-5 text-amber-400" />
            Security & Verification
          </h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <UserCheck className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-medium text-slate-200">Require Email Verification</span>
              </div>
              <input
                type="checkbox"
                checked={settings.requireEmailVerification}
                onChange={(e) => updateSetting('requireEmailVerification', e.target.checked)}
                className="w-5 h-5 rounded border-slate-700 text-red-500 focus:ring-red-500 bg-slate-950"
              />
            </label>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-medium text-slate-200">Session Timeout (Hours)</span>
              </div>
              <input
                type="number"
                value={settings.sessionTimeoutHours}
                onChange={(e) => updateSetting('sessionTimeoutHours', parseInt(e.target.value) || 24)}
                className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-sm text-white text-center"
              />
            </div>
          </div>
        </div>

        {/* Password Policy */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
            <Key className="w-5 h-5 text-emerald-400" />
            Password Policy
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-200">Minimum Length</span>
              <input
                type="number"
                value={settings.passwordMinLength}
                onChange={(e) => updateSetting('passwordMinLength', parseInt(e.target.value) || 8)}
                className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-sm text-white text-center"
              />
            </div>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-slate-200">Require Uppercase</span>
              <input
                type="checkbox"
                checked={settings.passwordRequireUppercase}
                onChange={(e) => updateSetting('passwordRequireUppercase', e.target.checked)}
                className="w-5 h-5 rounded border-slate-700 text-red-500 focus:ring-red-500 bg-slate-950"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-slate-200">Require Lowercase</span>
              <input
                type="checkbox"
                checked={settings.passwordRequireLowercase}
                onChange={(e) => updateSetting('passwordRequireLowercase', e.target.checked)}
                className="w-5 h-5 rounded border-slate-700 text-red-500 focus:ring-red-500 bg-slate-950"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-slate-200">Require Number</span>
              <input
                type="checkbox"
                checked={settings.passwordRequireNumber}
                onChange={(e) => updateSetting('passwordRequireNumber', e.target.checked)}
                className="w-5 h-5 rounded border-slate-700 text-red-500 focus:ring-red-500 bg-slate-950"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-slate-200">Require Special Character</span>
              <input
                type="checkbox"
                checked={settings.passwordRequireSpecial}
                onChange={(e) => updateSetting('passwordRequireSpecial', e.target.checked)}
                className="w-5 h-5 rounded border-slate-700 text-red-500 focus:ring-red-500 bg-slate-950"
              />
            </label>
          </div>
        </div>

        {/* Registration Rules */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
            <UserPlus className="w-5 h-5 text-blue-400" />
            Registration & Roles
          </h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-slate-200">Allow Guest Access</span>
              <input
                type="checkbox"
                checked={settings.allowGuestAccess}
                onChange={(e) => updateSetting('allowGuestAccess', e.target.checked)}
                className="w-5 h-5 rounded border-slate-700 text-red-500 focus:ring-red-500 bg-slate-950"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-slate-200">Allow Student Registration</span>
              <input
                type="checkbox"
                checked={settings.allowStudentRegistration}
                onChange={(e) => updateSetting('allowStudentRegistration', e.target.checked)}
                className="w-5 h-5 rounded border-slate-700 text-red-500 focus:ring-red-500 bg-slate-950"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-slate-200">Require Student Approval</span>
              <input
                type="checkbox"
                checked={settings.requireStudentApproval}
                onChange={(e) => updateSetting('requireStudentApproval', e.target.checked)}
                className="w-5 h-5 rounded border-slate-700 text-red-500 focus:ring-red-500 bg-slate-950"
              />
            </label>
            <div className="h-px bg-slate-800 my-2" />
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-slate-200">Allow Teacher Registration</span>
              <input
                type="checkbox"
                checked={settings.allowTeacherRegistration}
                onChange={(e) => updateSetting('allowTeacherRegistration', e.target.checked)}
                className="w-5 h-5 rounded border-slate-700 text-red-500 focus:ring-red-500 bg-slate-950"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-slate-200">Require Teacher Approval</span>
              <input
                type="checkbox"
                checked={settings.requireTeacherApproval}
                onChange={(e) => updateSetting('requireTeacherApproval', e.target.checked)}
                className="w-5 h-5 rounded border-slate-700 text-red-500 focus:ring-red-500 bg-slate-950"
              />
            </label>
            <div className="h-px bg-slate-800 my-2" />
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-slate-200">Allow Parent Registration</span>
              <input
                type="checkbox"
                checked={settings.allowParentRegistration}
                onChange={(e) => updateSetting('allowParentRegistration', e.target.checked)}
                className="w-5 h-5 rounded border-slate-700 text-red-500 focus:ring-red-500 bg-slate-950"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-slate-200">Require Parent Approval</span>
              <input
                type="checkbox"
                checked={settings.requireParentApproval}
                onChange={(e) => updateSetting('requireParentApproval', e.target.checked)}
                className="w-5 h-5 rounded border-slate-700 text-red-500 focus:ring-red-500 bg-slate-950"
              />
            </label>
          </div>
        </div>

      </div>
    </div>
  );
};
