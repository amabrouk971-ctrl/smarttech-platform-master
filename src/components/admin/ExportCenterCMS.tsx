import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileJson, FileText, CheckCircle2, AlertCircle, Database } from 'lucide-react';
import * as XLSX from 'xlsx';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

export const ExportCenterCMS: React.FC = () => {
  const [selectedFormat, setSelectedFormat] = useState<'EXCEL' | 'CSV' | 'JSON'>('EXCEL');
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>(['courses', 'bookings', 'users']);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');
  
  const datasets = [
    { id: 'users', label: 'Customers / Users' },
    { id: 'courses', label: 'Courses' },
    { id: 'classes', label: 'Classes & Cohorts' },
    { id: 'bookings', label: 'Bookings & Payments' },
    { id: 'enrollments', label: 'Enrollments' },
    { id: 'projects', label: 'Student Projects' },
    { id: 'attendance', label: 'Attendance Records' }
  ];

  const handleToggleDataset = (id: string) => {
    setSelectedDatasets(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const fetchCollectionData = async (collectionName: string) => {
    try {
      const colRef = collection(db, collectionName);
      const snapshot = await getDocs(colRef);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return data;
    } catch (error) {
      console.warn(`Error fetching ${collectionName} or it doesn't exist yet:`, error);
      return [];
    }
  };

  const flattenObject = (obj: any, prefix = ''): any => {
    return Object.keys(obj).reduce((acc: any, k: string) => {
      const pre = prefix.length ? prefix + '_' : '';
      if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
        Object.assign(acc, flattenObject(obj[k], pre + k));
      } else if (Array.isArray(obj[k])) {
        acc[pre + k] = JSON.stringify(obj[k]);
      } else {
        acc[pre + k] = obj[k];
      }
      return acc;
    }, {});
  };

  const handleExport = async () => {
    if (selectedDatasets.length === 0) {
      setExportMessage('Please select at least one dataset.');
      return;
    }

    setIsExporting(true);
    setExportMessage('Preparing export...');
    
    try {
      const exportData: Record<string, any[]> = {};
      
      for (const dataset of selectedDatasets) {
        const rawData = await fetchCollectionData(dataset);
        exportData[dataset] = rawData.map(item => flattenObject(item));
      }

      const timestamp = new Date().toISOString().split('T')[0];
      const fileNameBase = `SmartTech_Export_${timestamp}`;

      if (selectedFormat === 'EXCEL') {
        const wb = XLSX.utils.book_new();
        
        for (const [sheetName, data] of Object.entries(exportData)) {
          const ws = XLSX.utils.json_to_sheet(data);
          XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31)); // Max sheet name 31 chars
        }
        
        XLSX.writeFile(wb, `${fileNameBase}.xlsx`);
      } else if (selectedFormat === 'CSV') {
        // Just export the first selected one if multiple, or create a zip (simplified: just do first for CSV)
        const firstSheetName = selectedDatasets[0];
        const data = exportData[firstSheetName];
        const ws = XLSX.utils.json_to_sheet(data);
        const csv = XLSX.utils.sheet_to_csv(ws);
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${fileNameBase}_${firstSheetName}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (selectedFormat === 'JSON') {
        const jsonStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${fileNameBase}.json`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setExportMessage('Export completed successfully!');
      setTimeout(() => setExportMessage(''), 5000);
    } catch (error) {
      console.error('Export error:', error);
      setExportMessage('Error during export. Please check console.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <Database className="w-8 h-8 text-emerald-400" />
        <div>
          <h2 className="text-2xl font-black text-white">Data Export Center</h2>
          <p className="text-sm text-slate-400">Export platform data securely into Excel, CSV, or JSON formats.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Datasets Selection */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-white mb-4">Select Datasets</h3>
          <div className="space-y-3">
            {datasets.map(dataset => (
              <label key={dataset.id} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800/50 transition">
                <input
                  type="checkbox"
                  checked={selectedDatasets.includes(dataset.id)}
                  onChange={() => handleToggleDataset(dataset.id)}
                  className="w-5 h-5 accent-emerald-500 rounded bg-slate-800 border-slate-700"
                />
                <span className="text-sm font-bold text-slate-300">{dataset.label}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setSelectedDatasets(datasets.map(d => d.id))}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold px-3 py-1 bg-emerald-500/10 rounded-lg transition"
            >
              Select All
            </button>
            <button
              onClick={() => setSelectedDatasets([])}
              className="text-xs text-slate-400 hover:text-slate-300 font-bold px-3 py-1 bg-slate-800 rounded-lg transition"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Format Selection & Actions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <h3 className="text-lg font-bold text-white">Export Format</h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setSelectedFormat('EXCEL')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition ${
                selectedFormat === 'EXCEL' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <FileSpreadsheet className="w-8 h-8" />
              <span className="text-xs font-bold">Excel (.xlsx)</span>
            </button>
            <button
              onClick={() => setSelectedFormat('CSV')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition ${
                selectedFormat === 'CSV' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <FileText className="w-8 h-8" />
              <span className="text-xs font-bold">CSV</span>
            </button>
            <button
              onClick={() => setSelectedFormat('JSON')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition ${
                selectedFormat === 'JSON' ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <FileJson className="w-8 h-8" />
              <span className="text-xs font-bold">JSON</span>
            </button>
          </div>

          <div className="pt-6 border-t border-slate-800">
            <button
              onClick={handleExport}
              disabled={isExporting || selectedDatasets.length === 0}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl transition shadow-lg shadow-emerald-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isExporting ? (
                <>Generating Export...</>
              ) : (
                <><Download className="w-5 h-5" /> Export Selected Data</>
              )}
            </button>
            
            {exportMessage && (
              <div className={`mt-4 p-3 rounded-lg text-sm font-bold flex items-center gap-2 ${
                exportMessage.includes('completed') ? 'bg-emerald-500/20 text-emerald-400' :
                exportMessage.includes('Preparing') ? 'bg-blue-500/20 text-blue-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {exportMessage.includes('completed') ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {exportMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
