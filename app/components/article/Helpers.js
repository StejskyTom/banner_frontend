import React from 'react';
import RangeSlider from '../RangeSlider';

export function RangeControl({ label, value, onChange, min = 0, max = 100, step = 1, unit = '%' }) {
    return (
        <div className="mb-4">
            <div className="flex justify-between mb-1.5">
                <label className="text-xs font-medium text-gray-400">{label}</label>
                <span className="text-xs text-gray-400">{value}{unit}</span>
            </div>
            <RangeSlider
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
            />
        </div>
    );
}

export function Input({ label, value, onChange, placeholder }) {
    return (
        <div className="mb-4">
            {label && <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>}
            <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-visualy-accent-4 placeholder-gray-500"
                placeholder={placeholder}
            />
        </div>
    );
}

export function TextArea({ label, value, onChange, placeholder, rows = 3 }) {
    return (
        <div className="mb-4">
            {label && <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>}
            <textarea
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                rows={rows}
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-visualy-accent-4 placeholder-gray-500"
                placeholder={placeholder}
            />
        </div>
    );
}

export function Select({ label, value, onChange, options }) {
    return (
        <div className="mb-4">
            {label && <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>}
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-visualy-accent-4"
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );
}
