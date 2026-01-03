'use client';
import { SwatchIcon, XMarkIcon } from '@heroicons/react/24/outline';

const getContrastYIQ = (hexcolor) => {
    if (!hexcolor) return '#000000';

    // Remove hash
    let hex = hexcolor.toString().replace('#', '');

    // Handle 3-char shorthand
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }

    // Attempt to handle non-hex colors or incomplete hex by defaulting to black
    if (hex.length !== 6) return '#000000';

    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    if (isNaN(r) || isNaN(g) || isNaN(b)) return '#000000';

    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
};

const ColorInput = ({ label, value, onChange }) => {
    const textColor = getContrastYIQ(value);

    return (
        <div>
            {label && <label className="text-xs font-medium text-gray-400 mb-2 block">{label}</label>}
            <div className="relative group">
                <div className="relative flex items-center h-10 w-full rounded-md border border-gray-600 shadow-sm overflow-hidden ring-1 ring-white/5 transition-all focus-within:ring-2 focus-within:ring-indigo-500">
                    <input
                        type="text"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Transparent"
                        className="w-full h-full text-left text-sm font-bold uppercase font-mono border-none focus:outline-none pl-3 pr-20"
                        style={{
                            backgroundColor: value || '#1f2937',
                            color: value ? textColor : '#9ca3af'
                        }}
                    />

                    {/* Clear Button */}
                    {value && (
                        <button
                            onClick={() => onChange('')}
                            className="absolute right-10 top-0 bottom-0 w-8 flex items-center justify-center cursor-pointer hover:bg-black/10 transition-colors z-10"
                            style={{ color: textColor }}
                            title="Vymazat barvu"
                        >
                            <XMarkIcon className="h-4 w-4" />
                        </button>
                    )}

                    {/* Color Picker Trigger (Right Side) */}
                    <div className="absolute right-0 top-0 bottom-0 w-10 flex items-center justify-center cursor-pointer border-l border-black/10 hover:bg-black/20 bg-black/5 z-10">
                        <SwatchIcon className="h-5 w-5 opacity-70" style={{ color: value ? textColor : '#9ca3af' }} />
                        <input
                            type="color"
                            value={value || '#000000'}
                            onChange={(e) => onChange(e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ColorInput;
