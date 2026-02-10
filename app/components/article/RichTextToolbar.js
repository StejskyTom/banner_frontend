import { BoldIcon, ItalicIcon } from '@heroicons/react/24/solid';
import { SwatchIcon } from '@heroicons/react/24/outline';

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
                <div className="relative flex items-center h-10 w-full rounded-md border border-gray-600 shadow-sm overflow-hidden ring-1 ring-white/5 transition-all focus-within:ring-2 focus-within:ring-visualy-accent-4">
                    <input
                        type="text"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full h-full text-left text-sm font-bold uppercase font-mono border-none focus:outline-none pl-3 pr-10"
                        style={{ backgroundColor: value || '#ffffff', color: textColor }}
                    />

                    {/* Color Picker Trigger (Right Side) */}
                    <div className="absolute right-0 top-0 bottom-0 w-10 flex items-center justify-center cursor-pointer border-l border-black/10 hover:bg-black/20 bg-black/5">
                        <SwatchIcon className="h-5 w-5 opacity-70" style={{ color: textColor }} />
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

export default function RichTextToolbar({ activeFormats = {} }) {
    const applyFontSize = (size) => {

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const editor = range.commonAncestorContainer.nodeType === 3
            ? range.commonAncestorContainer.parentNode.closest('[contenteditable]')
            : range.commonAncestorContainer.closest('[contenteditable]');

        if (!editor) return;

        // Create the new span
        const span = document.createElement('span');
        span.style.fontSize = size;
        span.style.fontFamily = 'inherit';

        // Extract contents
        const contents = range.extractContents();

        // Clean up nested font sizes in the extracted content to avoid compounding/nesting
        const spans = contents.querySelectorAll('span');
        spans.forEach(s => {
            if (s.style.fontSize) {
                s.style.fontSize = '';
                if (!s.getAttribute('style')) {
                    // Unwrap if no other styles
                    const parent = s.parentNode;
                    while (s.firstChild) parent.insertBefore(s.firstChild, s);
                    parent.removeChild(s);
                }
            }
        });

        // Also remove any <font> tags that might have been left over from previous attempts
        const fonts = contents.querySelectorAll('font');
        fonts.forEach(f => {
            const parent = f.parentNode;
            while (f.firstChild) parent.insertBefore(f.firstChild, f);
            parent.removeChild(f);
        });

        span.appendChild(contents);
        range.insertNode(span);

        // Restore selection to the new span
        selection.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        selection.addRange(newRange);

        // Ensure focus
        editor.focus();

        // Trigger input event to save changes (React needs this)
        const event = new Event('input', { bubbles: true });
        editor.dispatchEvent(event);
    };

    const applyFontFamily = (font) => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const editor = range.commonAncestorContainer.nodeType === 3
            ? range.commonAncestorContainer.parentNode.closest('[contenteditable]')
            : range.commonAncestorContainer.closest('[contenteditable]');

        if (!editor) return;

        // Create the new span
        const span = document.createElement('span');
        span.style.fontFamily = font;

        // Extract contents
        const contents = range.extractContents();

        // Clean up nested font families
        const spans = contents.querySelectorAll('span');
        spans.forEach(s => {
            if (s.style.fontFamily) {
                s.style.fontFamily = '';
                if (!s.getAttribute('style')) {
                    const parent = s.parentNode;
                    while (s.firstChild) parent.insertBefore(s.firstChild, s);
                    parent.removeChild(s);
                }
            }
        });

        // Remove font tags
        const fonts = contents.querySelectorAll('font');
        fonts.forEach(f => {
            const parent = f.parentNode;
            while (f.firstChild) parent.insertBefore(f.firstChild, f);
            parent.removeChild(f);
        });

        span.appendChild(contents);
        range.insertNode(span);

        // Restore selection
        selection.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        selection.addRange(newRange);

        editor.focus();

        const event = new Event('input', { bubbles: true });
        editor.dispatchEvent(event);
    };

    const Button = ({ active, onClick, children, title }) => (
        <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            className={`p-2 rounded-md transition-all font-medium text-sm border flex items-center justify-center h-8 min-w-[32px]
                ${active
                    ? 'bg-visualy-accent-4/20 text-visualy-accent-4 border-visualy-accent-4/50'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700 hover:border-gray-600'
                }`}
            title={title}
        >
            {children}
        </button>
    );

    return (
        <div className="mb-6 space-y-4">
            <div>
                <label className="text-xs font-medium text-gray-400 mb-2 block">Formátování</label>
                <div className="flex flex-wrap gap-2 mb-3">
                    <Button
                        onClick={() => document.execCommand('formatBlock', false, 'p')}
                        active={activeFormats.tag === 'p' || !activeFormats.tag}
                        title="Normal Text"
                    >
                        T
                    </Button>
                    <Button
                        onClick={() => document.execCommand('formatBlock', false, 'h1')}
                        active={activeFormats.tag === 'h1'}
                        title="Heading 1"
                    >
                        H1
                    </Button>
                    <Button
                        onClick={() => document.execCommand('formatBlock', false, 'h2')}
                        active={activeFormats.tag === 'h2'}
                        title="Heading 2"
                    >
                        H2
                    </Button>
                    <Button
                        onClick={() => document.execCommand('formatBlock', false, 'h3')}
                        active={activeFormats.tag === 'h3'}
                        title="Heading 3"
                    >
                        H3
                    </Button>
                    <div className="w-px h-8 bg-gray-700 mx-1" />
                    <Button
                        onClick={() => document.execCommand('bold')}
                        active={activeFormats.bold}
                        title="Bold"
                    >
                        <BoldIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        onClick={() => document.execCommand('italic')}
                        active={activeFormats.italic}
                        title="Italic"
                    >
                        <ItalicIcon className="h-4 w-4" />
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                        <ColorInput
                            value={activeFormats.color || '#000000'}
                            onChange={(val) => document.execCommand('foreColor', false, val)}
                        />
                    </div>

                    <select
                        className="h-9 w-full bg-gray-800 border border-gray-700 text-white text-xs px-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-visualy-accent-4 rounded-lg"
                        onChange={(e) => applyFontSize(e.target.value)}
                        value={activeFormats.fontSize || ''}
                    >
                        <option value="" disabled>Velikost</option>
                        <option value="14px">14px</option>
                        <option value="16px">16px</option>
                        <option value="18px">18px</option>
                        <option value="20px">20px</option>
                        <option value="24px">24px</option>
                    </select>

                    <select
                        className="h-9 w-full bg-gray-800 border border-gray-700 text-white text-xs px-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-visualy-accent-4 col-span-2"
                        onChange={(e) => applyFontFamily(e.target.value)}
                        value={activeFormats.fontFamily || ''}
                    >
                        <option value="" disabled>Font</option>
                        <option value="system-ui">System UI</option>
                        <option value="Arial, sans-serif">Arial</option>
                        <option value="Georgia, serif">Georgia</option>
                        <option value="Courier New, monospace">Courier</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
