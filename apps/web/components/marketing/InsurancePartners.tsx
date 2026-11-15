/**
 * Insurance Documentation Trust Band
 *
 * Communicates a TRUTHFUL trust signal: NRPG contractors produce industry-standard
 * scope-of-works and estimates that major Australian insurers accept for
 * restoration claims.
 *
 * IMPORTANT: This component must NOT display insurer logos, names, or links, and
 * must NOT claim partnership/endorsement by any insurer. Doing so implies a
 * commercial relationship that does not exist (false affiliation) and uses
 * third-party trademarks without authorisation. Keep claims to what NRPG itself
 * does — produce documentation insurers accept.
 */

const DOCUMENTATION_POINTS: { title: string; body: string }[] = [
  {
    title: 'Industry-standard scope of works',
    body: 'A professional, standards-based scope and estimate prepared the way insurers expect to receive it.',
  },
  {
    title: 'Clear claim documentation',
    body: 'Moisture readings, photos, and drying logs that support your claim with your own insurer.',
  },
  {
    title: 'You stay in control',
    body: 'NRPG does not determine claim outcomes or act as your insurer — you deal directly with your insurer.',
  },
];

export function InsurancePartners() {
  return (
    <div className="w-full bg-gradient-to-r from-slate-50 to-blue-50 rounded-3xl p-8 md:p-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
          Documentation Your Insurer Accepts
        </h3>
        <p className="text-slate-600 max-w-2xl mx-auto">
          NRPG contractors produce industry-standard documentation recognised by major Australian
          insurers — a professional scope of works and estimate you can submit with your claim.
        </p>
      </div>

      {/* What we provide */}
      <div className="grid md:grid-cols-3 gap-6">
        {DOCUMENTATION_POINTS.map(point => (
          <div key={point.title} className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <p className="font-bold text-slate-900 mb-2">{point.title}</p>
            <p className="text-sm text-slate-600">{point.body}</p>
          </div>
        ))}
      </div>

      {/* Bottom Trust Statement */}
      <div className="mt-12 pt-8 border-t border-slate-200">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-black text-blue-600 mb-1">AU + NZ</div>
            <p className="text-sm text-slate-600">Network coverage across Australia and New Zealand</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-blue-600 mb-1">24/7</div>
            <p className="text-sm text-slate-600">Emergency claims processing support</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-blue-600 mb-1">IICRC</div>
            <p className="text-sm text-slate-600">Certified contractors on every job</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-8 text-center">
        <p className="text-sm text-slate-700 mb-4">
          Have an insurance claim to process?
        </p>
        <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">
          Request Emergency Service →
        </button>
      </div>
    </div>
  );
}
