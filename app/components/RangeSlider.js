import React from 'react';

export default function RangeSlider({ value, min, max, onChange, className = "", step = 1 }) {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={onChange}
            className={`w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-slider-thumb ${className}`}
            style={{
                backgroundImage: `linear-gradient(to right, var(--visualy-accent-4) ${percentage}%, rgb(55 65 81) ${percentage}%)`
            }}
        />
    );
}
