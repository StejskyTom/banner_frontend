import { useState, useRef, useEffect } from 'react';
import { BoldIcon, ItalicIcon, LinkIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { SwatchIcon } from '@heroicons/react/24/outline';

// ─── Helpers ────────────────────────────────────────────────────────────────

const getContrastYIQ = (hexcolor) => {
    if (!hexcolor) return '#000000';
    let hex = hexcolor.toString().replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    if (hex.length !== 6) return '#000000';
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return '#000000';
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return yiq >= 128 ? '#000000' : '#ffffff';
};

// ─── ColorInput ─────────────────────────────────────────────────────────────

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

// ─── Inline Link Panel ────────────────────────────────────────────────────────
// Rendered as a normal flow element (no absolute positioning) so it stays
// inside the sidebar without causing overflow or scroll.

function LinkPanel({ onClose, savedRangeRef }) {
    const [url, setUrl] = useState('');
    const [linkText, setLinkText] = useState('');
    const [hasSelection, setHasSelection] = useState(false);
    const [isExistingLink, setIsExistingLink] = useState(false);
    const urlInputRef = useRef(null);

    useEffect(() => {
        // Read state from the saved range (captured before popover opened)
        const range = savedRangeRef.current;
        if (range) {
            const selectedText = range.toString();
            setHasSelection(!!selectedText);
            if (selectedText) setLinkText(selectedText);

            // Check if the range is inside an existing <a>
            const container = range.commonAncestorContainer;
            const node = container.nodeType === 3 ? container.parentNode : container;
            const existingLink = node?.closest?.('a');
            if (existingLink) {
                setUrl(existingLink.href || '');
                setLinkText(existingLink.textContent || selectedText);
                setIsExistingLink(true);
            }
        }
        setTimeout(() => urlInputRef.current?.focus(), 30);
    }, []);

    const restoreSelection = () => {
        const range = savedRangeRef.current;
        if (!range) return;
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    };

    const getEditor = () => {
        const range = savedRangeRef.current;
        if (!range) return null;
        const container = range.commonAncestorContainer;
        const node = container.nodeType === 3 ? container.parentNode : container;
        return node?.closest?.('[contenteditable]');
    };

    const fireInputEvent = () => {
        const editor = getEditor();
        if (editor) editor.dispatchEvent(new Event('input', { bubbles: true }));
    };

    const handleInsert = () => {
        if (!url.trim()) return;
        const fullUrl = url.startsWith('http') ? url : `https://${url}`;
        restoreSelection();

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        const range = selection.getRangeAt(0);

        const anchor = selection.anchorNode;
        const el = anchor?.nodeType === 3 ? anchor.parentNode : anchor;
        const existingLink = el?.closest?.('a');

        if (existingLink) {
            existingLink.href = fullUrl;
            if (linkText.trim()) existingLink.textContent = linkText;
        } else if (range.toString()) {
            const a = document.createElement('a');
            a.href = fullUrl;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            try {
                range.surroundContents(a);
            } catch {
                const extracted = range.extractContents();
                a.appendChild(extracted);
                range.insertNode(a);
            }
            selection.removeAllRanges();
        } else if (linkText.trim()) {
            const a = document.createElement('a');
            a.href = fullUrl;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.textContent = linkText;
            range.insertNode(a);
            range.setStartAfter(a);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        }

        fireInputEvent();
        onClose();
    };

    const handleRemove = () => {
        restoreSelection();
        const selection = window.getSelection();
        if (!selection) return;
        const anchor = selection.anchorNode;
        const el = anchor?.nodeType === 3 ? anchor.parentNode : anchor;
        const existingLink = el?.closest?.('a');
        if (existingLink) {
            const parent = existingLink.parentNode;
            while (existingLink.firstChild) parent.insertBefore(existingLink.firstChild, existingLink);
            parent.removeChild(existingLink);
            fireInputEvent();
        }
        onClose();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); handleInsert(); }
        if (e.key === 'Escape') onClose();
    };

    return (
        <div
            className="mt-2 rounded-xl border border-visualy-accent-4/30 bg-gray-800/60 p-3 space-y-2"
            onMouseDown={(e) => e.stopPropagation()}
        >
            {/* Header row */}
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-visualy-accent-4 flex items-center gap-1.5">
                    <LinkIcon className="h-3.5 w-3.5" />
                    {isExistingLink ? 'Upravit odkaz' : 'Vložit odkaz'}
                </span>
                <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={onClose}
                    className="text-gray-500 hover:text-white transition-colors p-0.5 rounded"
                >
                    <XMarkIcon className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* Link text – only when no selection, or editing existing link */}
            {(!hasSelection || isExistingLink) && (
                <div>
                    <label className="text-[10px] text-gray-500 mb-1 block uppercase tracking-wider">Text odkazu</label>
                    <input
                        type="text"
                        placeholder="Klikněte zde"
                        value={linkText}
                        onChange={e => setLinkText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-gray-900 border border-gray-700 text-white text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-visualy-accent-4 placeholder-gray-600"
                    />
                </div>
            )}

            {/* URL */}
            <div>
                <label className="text-[10px] text-gray-500 mb-1 block uppercase tracking-wider">URL adresa</label>
                <input
                    ref={urlInputRef}
                    type="text"
                    placeholder="https://..."
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-gray-900 border border-gray-700 text-white text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-visualy-accent-4 placeholder-gray-600"
                />
            </div>

            {/* Actions */}
            <div className="flex gap-1.5 pt-0.5">
                <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleInsert}
                    disabled={!url.trim()}
                    className="flex-1 px-2.5 py-1.5 bg-visualy-accent-4 hover:bg-visualy-accent-4/90 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {isExistingLink ? 'Uložit' : 'Vložit'}
                </button>
                {isExistingLink && (
                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={handleRemove}
                        className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-lg border border-red-500/20 transition-colors"
                    >
                        Odebrat
                    </button>
                )}
                <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={onClose}
                    className="px-2.5 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-semibold rounded-lg transition-colors"
                >
                    Zrušit
                </button>
            </div>
        </div>
    );
}

// ─── Main Toolbar ─────────────────────────────────────────────────────────────

export default function RichTextToolbar({ activeFormats = {}, alignment, onAlignmentChange }) {
    const [showLinkPanel, setShowLinkPanel] = useState(false);
    // We save the selection range here (in the toolbar component) so that
    // opening the panel (which re-renders) doesn't lose the selection.
    const savedRangeRef = useRef(null);

    const openLinkPanel = () => {
        // Capture current selection before the panel steals focus
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            savedRangeRef.current = selection.getRangeAt(0).cloneRange();
        } else {
            savedRangeRef.current = null;
        }
        setShowLinkPanel(true);
    };

    const applyFontSize = (size) => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        const range = selection.getRangeAt(0);
        const editor = range.commonAncestorContainer.nodeType === 3
            ? range.commonAncestorContainer.parentNode.closest('[contenteditable]')
            : range.commonAncestorContainer.closest('[contenteditable]');
        if (!editor) return;

        const span = document.createElement('span');
        span.style.fontSize = size;
        span.style.fontFamily = 'inherit';
        const contents = range.extractContents();

        contents.querySelectorAll('span').forEach(s => {
            if (s.style.fontSize) {
                s.style.fontSize = '';
                if (!s.getAttribute('style')) {
                    const p = s.parentNode;
                    while (s.firstChild) p.insertBefore(s.firstChild, s);
                    p.removeChild(s);
                }
            }
        });
        contents.querySelectorAll('font').forEach(f => {
            const p = f.parentNode;
            while (f.firstChild) p.insertBefore(f.firstChild, f);
            p.removeChild(f);
        });

        span.appendChild(contents);
        range.insertNode(span);
        selection.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        selection.addRange(newRange);
        editor.focus();
        editor.dispatchEvent(new Event('input', { bubbles: true }));
    };

    const applyFontFamily = (font) => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        const range = selection.getRangeAt(0);
        const editor = range.commonAncestorContainer.nodeType === 3
            ? range.commonAncestorContainer.parentNode.closest('[contenteditable]')
            : range.commonAncestorContainer.closest('[contenteditable]');
        if (!editor) return;

        const span = document.createElement('span');
        span.style.fontFamily = font;
        const contents = range.extractContents();

        contents.querySelectorAll('span').forEach(s => {
            if (s.style.fontFamily) {
                s.style.fontFamily = '';
                if (!s.getAttribute('style')) {
                    const p = s.parentNode;
                    while (s.firstChild) p.insertBefore(s.firstChild, s);
                    p.removeChild(s);
                }
            }
        });
        contents.querySelectorAll('font').forEach(f => {
            const p = f.parentNode;
            while (f.firstChild) p.insertBefore(f.firstChild, f);
            p.removeChild(f);
        });

        span.appendChild(contents);
        range.insertNode(span);
        selection.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        selection.addRange(newRange);
        editor.focus();
        editor.dispatchEvent(new Event('input', { bubbles: true }));
    };

    const isInLink = () => {
        try {
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) return false;
            const anchor = sel.anchorNode;
            const el = anchor?.nodeType === 3 ? anchor.parentNode : anchor;
            return !!el?.closest?.('a');
        } catch { return false; }
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

                {/* Button row */}
                <div className="flex flex-wrap gap-2 mb-3">
                    <Button onClick={() => document.execCommand('formatBlock', false, 'p')} active={activeFormats.tag === 'p' || !activeFormats.tag} title="Normal Text">T</Button>
                    <Button onClick={() => document.execCommand('formatBlock', false, 'h1')} active={activeFormats.tag === 'h1'} title="Heading 1">H1</Button>
                    <Button onClick={() => document.execCommand('formatBlock', false, 'h2')} active={activeFormats.tag === 'h2'} title="Heading 2">H2</Button>
                    <Button onClick={() => document.execCommand('formatBlock', false, 'h3')} active={activeFormats.tag === 'h3'} title="Heading 3">H3</Button>
                    <div className="w-px h-8 bg-gray-700 mx-1" />
                    <Button onClick={() => document.execCommand('bold')} active={activeFormats.bold} title="Bold">
                        <BoldIcon className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => document.execCommand('italic')} active={activeFormats.italic} title="Italic">
                        <ItalicIcon className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-8 bg-gray-700 mx-1" />
                    <Button
                        onClick={() => showLinkPanel ? setShowLinkPanel(false) : openLinkPanel()}
                        active={showLinkPanel || isInLink()}
                        title="Odkaz"
                    >
                        <LinkIcon className="h-4 w-4" />
                    </Button>
                </div>

                {/* Inline link panel – appears below buttons, no scroll side-effect */}
                {showLinkPanel && (
                    <LinkPanel
                        savedRangeRef={savedRangeRef}
                        onClose={() => setShowLinkPanel(false)}
                    />
                )}

                <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                        <ColorInput
                            value={activeFormats.color || '#000000'}
                            onChange={(val) => document.execCommand('foreColor', false, val)}
                        />
                    </div>

                    <select
                        className="h-9 w-full bg-gray-800 border border-gray-700 text-white text-sm px-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-visualy-accent-4"
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
                        className={`h-9 w-full bg-gray-800 border border-gray-700 text-white text-sm px-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-visualy-accent-4 ${!onAlignmentChange ? 'col-span-2' : ''}`}
                        onChange={(e) => applyFontFamily(e.target.value)}
                        value={activeFormats.fontFamily || ''}
                    >
                        <option value="" disabled>Font</option>
                        <option value="system-ui">System UI</option>
                        <option value="Arial, sans-serif">Arial</option>
                        <option value="Georgia, serif">Georgia</option>
                        <option value="Courier New, monospace">Courier</option>
                    </select>

                    {onAlignmentChange && (
                        <select
                            className="h-9 w-full bg-gray-800 border border-gray-700 text-white text-sm px-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-visualy-accent-4"
                            onChange={(e) => onAlignmentChange(e.target.value)}
                            value={alignment || 'left'}
                        >
                            <option value="left">Vlevo</option>
                            <option value="center">Na střed</option>
                            <option value="right">Vpravo</option>
                            <option value="justify">Do bloku</option>
                        </select>
                    )}
                </div>
            </div>
        </div>
    );
}
