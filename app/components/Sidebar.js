'use client';

import { useState } from 'react';

export default function Sidebar({ logos, setLogos, title, setTitle }) {
  const [newLogo, setNewLogo] = useState('');

  const handleAddLogo = () => {
    if (!newLogo.trim()) return;
    setLogos([...logos, newLogo.trim()]);
    setNewLogo('');
  };

  return (
    <aside className="w-72 bg-gray-900 border-r border-gray-800 text-gray-100 flex flex-col px-4 py-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold mb-2">Logo Carousel</h2>
        <p className="text-sm text-gray-400">Editor obsahu</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Nadpis carouselu</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Např. Naši partneři"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Přidat nové logo (URL)</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newLogo}
            onChange={(e) => setNewLogo(e.target.value)}
            className="flex-1 px-3 py-2 rounded bg-gray-800 border border-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="https://..."
          />
          <button
            onClick={handleAddLogo}
            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded text-sm"
          >
            Přidat
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-1">Počet log: {logos.length}</h3>
        <ul className="text-xs text-gray-400 space-y-1 max-h-32 overflow-y-auto">
          {logos.map((logo, i) => (
            <li key={i} className="truncate">{logo}</li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
