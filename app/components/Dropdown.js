'use client';

import { useState, useRef, useEffect, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';

const DropdownContext = createContext({
    isOpen: false,
    close: () => { },
});

export function Dropdown({ trigger, children, align = 'right' }) {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({});
    const triggerRef = useRef(null);

    const close = () => setIsOpen(false);

    const toggle = (e) => {
        e.stopPropagation();
        if (isOpen) {
            setIsOpen(false);
        } else {
            if (triggerRef.current) {
                const rect = triggerRef.current.getBoundingClientRect();

                // Calculate position for fixed rendering
                const pos = {
                    top: rect.bottom + 8, // slight offset
                };

                if (align === 'right') {
                    // Align right edge of dropdown with right edge of trigger
                    // Since 'right' in fixed positioning is relative to viewport right,
                    // we calculate padding from right side.
                    pos.right = window.innerWidth - rect.right;
                } else {
                    pos.left = rect.left;
                }

                setPosition(pos);
                setIsOpen(true);
            }
        }
    };

    // Close on scroll or resize to prevent detached dropdowns
    useEffect(() => {
        if (!isOpen) return;

        const handleScroll = () => close();
        const handleResize = () => close();

        // Capture scroll on window and all scrolling parents (simplified by using window capture)
        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleResize);
        };
    }, [isOpen]);

    return (
        <DropdownContext.Provider value={{ isOpen, close }}>
            <div className="relative inline-block text-left" ref={triggerRef}>
                <div
                    onClick={toggle}
                    className="cursor-pointer"
                >
                    {trigger}
                </div>

                {isOpen && (
                    <DropdownPortal close={close} position={position} align={align}>
                        {children}
                    </DropdownPortal>
                )}
            </div>
        </DropdownContext.Provider>
    );
}

function DropdownPortal({ children, close, position, align }) { // eslint-disable-line no-unused-vars
    const dropdownRef = useRef(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Handle click outside within the portal context
    useEffect(() => {
        function handleClickOutside(event) {
            // If the click is on the trigger, the toggle handler in parent will handle it (preventing immediate reopen)
            // We just need to ensure we close if clicked elsewhere
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                // Check if it's the trigger (optional, relies on propagation stopping in trigger)
                close();
            }
        }

        // Use timeout to avoid immediate close from the triggering click bubbling up (if not stopped)
        // But we stopped propagation in toggle, so immediate should be fine?
        // Let's add it to document
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [close]);

    if (!mounted) return null;

    return createPortal(
        <div
            ref={dropdownRef}
            style={{
                position: 'fixed',
                top: position.top,
                left: position.left,
                right: position.right,
                zIndex: 9999, // Ensure it's on top of everything
                minWidth: '12rem', // w-48 equivalent
            }}
            className="origin-top-right rounded-xl bg-white dark:bg-gray-800 shadow-xl ring-1 ring-black/5 dark:ring-white/10 focus:outline-none overflow-hidden animate-in fade-in zoom-in-95 duration-100"
            role="menu"
            aria-orientation="vertical"
        >
            <div className="py-1" role="none">
                {children}
            </div>
        </div>,
        document.body
    );
}

export function DropdownItem({ onClick, children, className = '', danger = false, icon: Icon }) {
    const { close } = useContext(DropdownContext);

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                if (onClick) onClick(e);
                close();
            }}
            className={`
                group flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors text-left
                ${danger
                    ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                } 
                ${className}
            `}
            role="menuitem"
        >
            {Icon && (
                <Icon className={`h-4 w-4 ${danger ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'}`} />
            )}
            {children}
        </button>
    );
}
