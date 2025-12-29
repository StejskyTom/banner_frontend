export default function Toggle({ checked, onChange, label }) {
    return (
        <div className="flex items-center space-x-3 pt-2">
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`${checked ? 'bg-visualy-accent-4' : 'bg-gray-700'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-visualy-accent-4 focus:ring-offset-2 focus:ring-offset-gray-900 cursor-pointer border-0`}
            >
                <span
                    className={`${checked ? 'translate-x-6' : 'translate-x-1'
                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform pointer-events-none`}
                />
            </button>
            {label && (
                <span className="text-sm font-medium text-gray-300 select-none cursor-pointer" onClick={() => onChange(!checked)}>
                    {label}
                </span>
            )}
        </div>
    )
}
