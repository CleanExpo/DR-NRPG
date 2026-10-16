'use client';

import type { Contractor, Stats, Incident } from '../types';

interface HUDProps {
  contractors: Contractor[];
  stats: Stats;
}

// Main HUD Overlay
export const HUD = ({ contractors, stats }: HUDProps) => {
  return (
    <div
      className="fixed top-5 left-5 w-80 bg-slate-950/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl overflow-hidden"
      style={{ color: 'white', zIndex: 100, fontFamily: 'monospace' }}
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50" />
      <h1 className="text-white font-bold tracking-tight text-xl mb-1">NRPG DISASTER RECOVERY</h1>
      <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-4">Live Network Monitor</p>
      <div className="h-px w-full bg-gradient-to-r from-blue-500/50 to-transparent mb-4" />
      <p className="my-1 text-slate-400 text-xs">📍 Territory: Australia</p>
      <p className="my-1 text-slate-400 text-xs">Status: ACTIVE</p>
      <div className="mt-3 pt-3 text-xs">
        <div className="h-px w-full bg-gradient-to-r from-blue-500/50 to-transparent mb-3" />
        <p className="my-1 text-blue-400">🛡️ Active Contractors: {contractors.length}</p>
        <p className="my-1 text-yellow-400">🚨 Total Incidents: {stats.totalIncidents}</p>
        <p className="my-1 text-green-400">✅ Resolved: {stats.resolved}</p>
      </div>
    </div>
  );
};

interface IncidentListProps {
  incidents: Incident[];
  onResolve: (id: number) => void;
}

// Incident List Panel
export const IncidentList = ({ incidents, onResolve }: IncidentListProps) => {
  const activeIncidents = incidents.filter((i) => !i.resolved);

  if (incidents.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 left-5 max-h-[350px] overflow-y-auto"
      style={{ color: 'white', zIndex: 100, fontFamily: 'monospace' }}
    >
      <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-xl p-5 shadow-2xl text-[11px]">
        <h2 className="text-xs uppercase tracking-widest text-red-400 font-bold mb-2">
          🚨 Active Incidents ({activeIncidents.length})
        </h2>
        <div className="h-px w-full bg-gradient-to-r from-red-500/50 to-transparent mb-4" />
        <div>
          {incidents.slice(-5).map((incident) => (
            <div
              key={incident.id}
              className={`p-2 mb-1.5 rounded-md flex justify-between items-center ${
                incident.resolved
                  ? 'bg-green-500/15 border-l-[3px] border-green-500'
                  : 'bg-red-500/15 border-l-[3px] border-red-600'
              }`}
            >
              <span className={incident.resolved ? 'text-green-400' : 'text-red-300'}>
                {incident.type.toUpperCase()} - ID:{incident.id.toString().slice(-4)}
              </span>
              {!incident.resolved && (
                <button
                  onClick={() => onResolve(incident.id)}
                  className="px-2.5 py-1 text-[10px] bg-green-500 text-white border-none rounded cursor-pointer font-bold hover:bg-green-600 transition-colors"
                >
                  RESOLVE
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface ContractorListProps {
  contractors: Contractor[];
}

// Contractor List Panel
export const ContractorList = ({ contractors }: ContractorListProps) => {
  return (
    <div
      className="fixed top-5 right-5 max-w-[320px]"
      style={{ color: 'white', zIndex: 100, fontFamily: 'monospace' }}
    >
      <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-xl p-5 shadow-2xl text-[11px] max-h-[450px] overflow-y-auto">
        <h2 className="text-xs uppercase tracking-widest text-purple-400 font-bold mb-2">⚡ Contractor Network</h2>
        <div className="h-px w-full bg-gradient-to-r from-purple-500/50 to-transparent mb-4" />
        <div>
          {contractors.map((c) => (
            <div
              key={c.id}
              className="p-2 mb-1.5 bg-white/5 rounded-md"
              style={{ borderLeft: `3px solid ${c.color}` }}
            >
              <p className="m-0 font-bold" style={{ color: c.color }}>
                {c.name}
              </p>
              <p className="mt-0.5 mb-0 text-slate-400 text-[10px]">
                {c.state} • {c.tier}km Tier
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
