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
                    <h3
                        className="text-2xl font-bold mb-2"
                        style={{ color: widget.nameColor || '#111827' }}
                    >
                        {authorName || 'Jméno Autora'}
                    </h3>

                    {authorTitle && (
                        <div
                            className="font-medium uppercase tracking-wide text-sm mb-5"
                            style={{ color: widget.titleColor || '#4f46e5' }}
                        >
                            {authorTitle}
                        </div>
                    )}

                    <p
                        className="leading-relaxed text-base whitespace-pre-wrap"
                        style={{ color: widget.bioColor || '#4b5563' }}
                    >
                        {authorBio || 'Zde se zobrazí váš životopis nebo popis...'}
                    </p>
                </div>
            </div>
        </div>
    );
}
