'use client';

import { useRef, useCallback, useEffect } from 'react';

export default function WidgetContentEditable({ tagName, html, onChange, ...props }) {
    const contentEditableRef = useRef(null);
    const latestHtml = useRef(html);
    latestHtml.current = html;

    const setRef = useCallback((node) => {
        if (node) {
            contentEditableRef.current = node;
            // Set initial content
            if (node.innerHTML !== latestHtml.current) {
                node.innerHTML = latestHtml.current;
            }
        }
    }, []);

    useEffect(() => {
        // Update content if it changes externally
        if (contentEditableRef.current && html !== contentEditableRef.current.innerHTML) {
            contentEditableRef.current.innerHTML = html;
        }
    }, [html, tagName]);

    const Tag = tagName || 'div';

    return (
        <Tag
            ref={setRef}
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            onInput={(e) => {
                onChange(e.currentTarget.innerHTML);
            }}
            onBlur={(e) => {
                // Ensure final sync
                if (e.currentTarget.innerHTML !== html) {
                    onChange(e.currentTarget.innerHTML);
                }
            }}
            {...props}
        />
    );
}
