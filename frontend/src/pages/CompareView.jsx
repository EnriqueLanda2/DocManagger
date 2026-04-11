import React from 'react';
import PropTypes from 'prop-types';
import { ArrowLeft } from 'lucide-react';

const CompareView = ({ activeDoc, compareVersions, setCompareVersions, onBack }) => {
  const vCurrent = activeDoc.versions && activeDoc.versions.length > 0 
    ? activeDoc.versions[0] 
    : { version_number: 'Actual', content: activeDoc.content, date: 'Ahora' };
  
  const vPrevious = activeDoc.versions && activeDoc.versions.length > 1 
    ? activeDoc.versions[1] 
    : vCurrent;

  const leftVer = compareVersions[0] || vPrevious;
  const rightVer = compareVersions[1] || vCurrent;

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="font-bold text-slate-800 text-lg">Comparar Versiones</h2>
            <p className="text-xs text-slate-500 font-medium">{activeDoc.name}</p>
          </div>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <span className="text-xs font-bold text-slate-600 px-3 py-1 bg-white rounded shadow-sm">Lado a Lado</span>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        <div className="flex-1 flex flex-col border-r border-slate-200 bg-white">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-8 bg-red-400 rounded-full"></span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Versión A (Izquierda)</span>
                <select
                  className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer hover:underline"
                  value={leftVer.id || ''}
                  onChange={(e) => {
                    const selected = activeDoc.versions.find(v => v.id.toString() === e.target.value);
                    if (selected) {
                      const newVers = [...compareVersions];
                      newVers[0] = selected;
                      setCompareVersions(newVers);
                    }
                  }}
                >
                  {activeDoc.versions.map(v => (
                    <option key={v.id} value={v.id}>Versión {v.version_number} - {v.author_name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-600">{leftVer.date}</p>
              <p className="text-[10px] text-slate-400 italic">"{leftVer.note || 'Sin notas'}"</p>
            </div>
          </div>
          <div className="flex-1 p-8 overflow-auto bg-slate-50/30">
            <div className="max-w-2xl mx-auto bg-white min-h-full p-8 shadow-sm border border-slate-100 rounded-lg text-slate-600 font-serif whitespace-pre-wrap">
              {leftVer.content}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-white">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-8 bg-emerald-400 rounded-full"></span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Versión B (Derecha)</span>
                <select
                  className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer hover:underline"
                  value={rightVer.id || ''}
                  onChange={(e) => {
                    const selected = activeDoc.versions.find(v => v.id.toString() === e.target.value);
                    if (selected) {
                      const newVers = [...compareVersions];
                      newVers[1] = selected;
                      setCompareVersions(newVers);
                    }
                  }}
                >
                  {activeDoc.versions.map(v => (
                    <option key={v.id} value={v.id}>Versión {v.version_number} - {v.author_name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-600">{rightVer.date}</p>
              <p className="text-[10px] text-slate-400 italic">"{rightVer.note || 'Sin notas'}"</p>
            </div>
          </div>
          <div className="flex-1 p-8 overflow-auto bg-white">
            <div className="max-w-2xl mx-auto bg-white min-h-full p-8 shadow-sm border border-slate-100 rounded-lg text-slate-800 font-serif whitespace-pre-wrap">
              {rightVer.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

CompareView.propTypes = {
  activeDoc: PropTypes.object.isRequired,
  compareVersions: PropTypes.array.isRequired,
  setCompareVersions: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default CompareView;
