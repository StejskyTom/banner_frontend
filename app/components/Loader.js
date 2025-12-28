export default function Loader() {
    return (
        <div className="flex items-center justify-center min-h-screen w-full bg-gray-50 dark:bg-gray-900">
            <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
                <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-t-visualy-accent-4 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-visualy-accent-4 to-emerald-400 opacity-20 animate-pulse"></div>
                </div>
            </div>
        </div>
    );
}
