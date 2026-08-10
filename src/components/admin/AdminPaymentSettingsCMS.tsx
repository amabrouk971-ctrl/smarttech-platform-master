import React, { useState, useEffect } from 'react';
import { getPaymentSettings, updatePaymentSettings } from '../../services/bookingService';
import { PaymentSettings } from '../../types';
import { Settings, Save, CheckCircle2, Phone, MapPin, CreditCard } from 'lucide-react';

export const AdminPaymentSettingsCMS: React.FC = () => {
  const [settings, setSettings] = useState<PaymentSettings>({
    instapayNumber: '',
    vodafoneCashNumber: '',
    whatsappNumber: '',
    branchInformation: '',
    instapayEnabled: true,
    vodafoneCashEnabled: true,
    inPersonEnabled: true
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    getPaymentSettings().then(setSettings).catch(console.error);
  }, []);

  const handleChange = (field: keyof PaymentSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');
    try {
      await updatePaymentSettings(settings);
      setSaveMessage('Payment Settings updated successfully.');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings', error);
      setSaveMessage('Error saving settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 max-w-4xl">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <Settings className="w-8 h-8 text-emerald-400" />
        <div>
          <h2 className="text-2xl font-black text-white">Payment & Contact Settings</h2>
          <p className="text-sm text-slate-400">Manage payment numbers, branch info, and WhatsApp destination.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* WhatsApp */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-400" /> WhatsApp Confirmation Number
          </h3>
          <p className="text-xs text-slate-400">All bookings will redirect to this number for confirmation.</p>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">WhatsApp Phone Number</label>
            <input
              type="text"
              required
              value={settings.whatsappNumber}
              onChange={(e) => handleChange('whatsappNumber', e.target.value)}
              placeholder="e.g. 201024434357"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-bold text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* InstaPay */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-400" /> InstaPay Configuration
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.instapayEnabled}
                onChange={(e) => handleChange('instapayEnabled', e.target.checked)}
                className="w-4 h-4 accent-emerald-500"
              />
              <span className="text-sm font-bold text-slate-300">Enabled</span>
            </label>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">InstaPay Payment Number</label>
            <input
              type="text"
              value={settings.instapayNumber}
              onChange={(e) => handleChange('instapayNumber', e.target.value)}
              disabled={!settings.instapayEnabled}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-bold text-white focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Vodafone Cash */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Phone className="w-5 h-5 text-red-500" /> Vodafone Cash Configuration
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.vodafoneCashEnabled}
                onChange={(e) => handleChange('vodafoneCashEnabled', e.target.checked)}
                className="w-4 h-4 accent-emerald-500"
              />
              <span className="text-sm font-bold text-slate-300">Enabled</span>
            </label>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Vodafone Cash Number</label>
            <input
              type="text"
              value={settings.vodafoneCashNumber}
              onChange={(e) => handleChange('vodafoneCashNumber', e.target.value)}
              disabled={!settings.vodafoneCashEnabled}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-bold text-white focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Pay In Person */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-500" /> Pay In Person Configuration
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.inPersonEnabled}
                onChange={(e) => handleChange('inPersonEnabled', e.target.checked)}
                className="w-4 h-4 accent-emerald-500"
              />
              <span className="text-sm font-bold text-slate-300">Enabled</span>
            </label>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Branch Information</label>
            <textarea
              value={settings.branchInformation}
              onChange={(e) => handleChange('branchInformation', e.target.value)}
              disabled={!settings.inPersonEnabled}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-bold text-white focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 h-24"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-6">
          <p className="text-emerald-400 font-bold text-sm">{saveMessage}</p>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl transition shadow-lg shadow-emerald-900/20 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

      </form>
    </div>
  );
};
