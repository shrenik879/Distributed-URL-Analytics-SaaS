export function Skeleton({ className = "" }) {
    return (
        <div
            className={`rounded-xl bg-gray-100 ${className}`}
            style={{
                backgroundImage:
                    "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.03) 50%, transparent 100%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s ease-in-out infinite",
            }}
        />
    );
}

export function CardSkeleton() {
    return (
        <div className="card p-6 space-y-4">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
        </div>
    );
}

export function TableSkeleton({ rows = 5 }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="card p-4 flex items-center gap-4">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-16 ml-auto" />
                </div>
            ))}
        </div>
    );
}
