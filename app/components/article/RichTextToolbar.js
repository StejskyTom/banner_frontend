import { BoldIcon, ItalicIcon } from '@heroicons/react/24/solid';

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

    return (
        <div className="mb-4 space-y-3">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Styl textu</label>
                <div className="flex flex-wrap gap-2">
                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => document.execCommand('formatBlock', false, 'p')}
                        className={`p-2 rounded border ${activeFormats.tag === 'p' || !activeFormats.tag ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                        title="Normal Text"
                    >
                        <span className="text-sm font-bold">T</span>
                    </button>
                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => document.execCommand('formatBlock', false, 'h1')}
                        className={`p-2 rounded border ${activeFormats.tag === 'h1' ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                        title="Heading 1"
                    >
                        <span className="text-sm font-bold">H1</span>
                    </button>
                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => document.execCommand('formatBlock', false, 'h2')}
                        className={`p-2 rounded border ${activeFormats.tag === 'h2' ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                        title="Heading 2"
                    >
                        <span className="text-sm font-bold">H2</span>
                    </button>
                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => document.execCommand('formatBlock', false, 'h3')}
                        className={`p-2 rounded border ${activeFormats.tag === 'h3' ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                        title="Heading 3"
                    >
                        <span className="text-sm font-bold">H3</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap gap-4">
                <div className="flex gap-2">
                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => document.execCommand('bold')}
                        className={`p-2 rounded border ${activeFormats.bold ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                        title="Bold"
                    >
                        <BoldIcon className="h-4 w-4" />
                    </button>
                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => document.execCommand('italic')}
                        className={`p-2 rounded border ${activeFormats.italic ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                        title="Italic"
                    >
                        <ItalicIcon className="h-4 w-4" />
                    </button>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            className="h-9 w-9 p-1 rounded border border-gray-300 cursor-pointer"
                            onChange={(e) => document.execCommand('foreColor', false, e.target.value)}
                            value={activeFormats.color || '#000000'}
                            title="Barva textu"
                        />
                        <select
                            className="p-2 rounded border border-gray-300 text-sm"
                            onChange={(e) => applyFontSize(e.target.value)}
                            value={activeFormats.fontSize || ''}
                        >
                            <option value="" disabled>Velikost</option>
                            <option value="14px">Malé (14px)</option>
                            <option value="16px">Normální (16px)</option>
                            <option value="18px">Střední (18px)</option>
                            <option value="20px">Velké (20px)</option>
                            <option value="24px">Extra velké (24px)</option>
                        </select>
                    </div>
                    <select
                        className="p-2 rounded border border-gray-300 text-sm w-full"
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
