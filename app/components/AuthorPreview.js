import { PhotoIcon } from '@heroicons/react/24/solid';

export default function AuthorPreview({ widget }) {
    const {
        authorName,
        authorTitle,
        authorBio,
        authorPhotoUrl,
        layout = 'centered',
        backgroundColor = '#ffffff',
        borderRadius = 0
    } = widget;

    const s = widget.settings || {};

    // Name styles
    const NameTag = s.nameTag || 'h3';
    const nameStyle = {
        color: s.nameColor || widget.nameColor || '#111827',
        fontSize: s.nameSize || '24px',
        fontFamily: s.nameFont || 'sans-serif',
        fontWeight: s.nameBold !== false ? 'bold' : 'normal',
        fontStyle: s.nameItalic ? 'italic' : 'normal',
        textAlign: s.nameAlign || (layout === 'side-by-side' ? 'left' : 'center'),
        marginBottom: `${s.nameMarginBottom ?? 8}px`,
        marginTop: 0,
        lineHeight: 1.3,
    };

    // Position/Title styles
    const PositionTag = s.positionTag || 'div';
    const positionStyle = {
        color: s.positionColor || widget.titleColor || '#4f46e5',
        fontSize: s.positionSize || '14px',
        fontFamily: s.positionFont || 'sans-serif',
        fontWeight: s.positionBold ? 'bold' : '500',
        fontStyle: s.positionItalic ? 'italic' : 'normal',
        textAlign: s.positionAlign || (layout === 'side-by-side' ? 'left' : 'center'),
        marginBottom: `${s.positionMarginBottom ?? 20}px`,
        marginTop: 0,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        lineHeight: 1.4,
    };

    // Bio styles
    const BioTag = s.bioTag || 'p';
    const bioStyle = {
        color: s.bioColor || widget.bioColor || '#4b5563',
        fontSize: s.bioSize || '16px',
        fontFamily: s.bioFont || 'sans-serif',
        fontWeight: s.bioBold ? 'bold' : 'normal',
        fontStyle: s.bioItalic ? 'italic' : 'normal',
        textAlign: s.bioAlign || (layout === 'side-by-side' ? 'left' : 'center'),
        marginBottom: `${s.bioMarginBottom ?? 0}px`,
        marginTop: 0,
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
    };

    return (
        <div className="w-full h-full flex items-center justify-center p-8 bg-gray-100 dark:bg-gray-900/50 overflow-y-auto">
            <div
                className={`max-w-2xl w-full shadow-lg transition-all duration-300 ${layout === 'side-by-side'
                    ? 'flex flex-col sm:flex-row items-start gap-8 text-left p-8'
                    : 'flex flex-col items-center text-center p-8'
                    }`}
                style={{
                    backgroundColor: backgroundColor,
                    borderRadius: `${borderRadius}px`
                }}
            >
                {authorPhotoUrl ? (
                    <img
                        src={authorPhotoUrl}
                        alt={authorName || 'Autor'}
                        className={`w-32 h-32 rounded-full object-cover border-4 border-gray-100 flex-shrink-0 ${layout === 'side-by-side' ? '' : 'mb-5'
                            }`}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Foto'; }}
                    />
                ) : (
                    <div className={`w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0 ${layout === 'side-by-side' ? '' : 'mb-5'
                        }`}>
                        <PhotoIcon className="h-12 w-12" />
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <NameTag style={nameStyle}>
                        {authorName || 'Jméno Autora'}
                    </NameTag>

                    {authorTitle && (
                        <PositionTag style={positionStyle}>
                            {authorTitle}
                        </PositionTag>
                    )}

                    <BioTag style={bioStyle}>
                        {authorBio || 'Zde se zobrazí váš životopis nebo popis...'}
                    </BioTag>
                </div>
            </div>
        </div>
    );
}
