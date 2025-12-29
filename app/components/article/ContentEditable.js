'use client';

import { useRef, useCallback, useEffect } from 'react';

export default function ContentEditable({ tagName, html, onChange, onFormatChange, ...props }) {
    const contentEditableRef = useRef(null);

    const setRef = useCallback((node) => {
        if (node) {
            contentEditableRef.current = node;
            // Set initial content
            if (node.innerHTML !== html) {
                node.innerHTML = html;
            }
        }
    }, []); // Run once on mount

    useEffect(() => {
        // Update content if it changes externally
        if (contentEditableRef.current && html !== contentEditableRef.current.innerHTML) {
            contentEditableRef.current.innerHTML = html;
        }
    }, [html]);

    const checkFormats = () => {
        if (!onFormatChange) return;

        let fontSize = '';
        let color = '#000000';
        let fontFamily = '';

        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const anchor = selection.anchorNode;
            if (anchor) {
                const element = anchor.nodeType === 3 ? anchor.parentNode : anchor;
                // Ensure we are inside the editor
                if (contentEditableRef.current && contentEditableRef.current.contains(element)) {
                    const computed = window.getComputedStyle(element);
                    fontSize = computed.fontSize;
                    color = computed.color;
                    fontFamily = computed.fontFamily.replace(/['"]/g, ''); // Remove quotes
                }
            }
        }

        // Helper to convert RGB to Hex
        const rgbToHex = (rgb) => {
            if (!rgb) return '#000000';
            if (rgb.startsWith('#')) return rgb;
            if (!rgb.startsWith('rgb')) return '#000000';

            try {
                const sep = rgb.indexOf(",") > -1 ? "," : " ";
                const rgbArr = rgb.substr(4).split(")")[0].split(sep);

                let r = (+rgbArr[0]).toString(16);
                let g = (+rgbArr[1]).toString(16);
                let b = (+rgbArr[2]).toString(16);

                if (r.length === 1) r = "0" + r;
                if (g.length === 1) g = "0" + g;
                if (b.length === 1) b = "0" + b;

                return "#" + r + g + b;
            } catch (e) {
                return '#000000';
            }
        };

        const formats = {
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            tag: document.queryCommandValue('formatBlock').toLowerCase() || 'p',
            fontSize: fontSize,
            color: rgbToHex(color),
            fontFamily: fontFamily
        };
        onFormatChange(formats);
    };

    const Tag = tagName || 'div';

    return (
        <Tag
            ref={setRef}
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => {
                onChange(e.currentTarget.innerHTML);
                checkFormats();
            }}
            onMouseUp={checkFormats}
            onKeyUp={checkFormats}
            onFocus={checkFormats}
            onClick={checkFormats}
            {...props}
        />
    );
}
