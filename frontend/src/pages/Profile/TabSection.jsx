export default function DashboardSection({ title, children, emptyMessage }) {
   const hasItems = children[1]?.props?.children?.length > 0;
   return (
     <div>
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text)' }}>{title}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
                <div className="sticky top-8 space-y-6">
                    {children[0]}
                </div>
            </div>
            <div className="lg:col-span-3">
                {hasItems ? children[1] : (
                    <div className="text-center py-20 rounded-xl border border-dashed bg-[var(--bg-soft)]" style={{ borderColor: 'var(--border-strong)' }}>
                        <p className="text-lg font-medium text-[var(--text-muted)]">{emptyMessage}</p>
                    </div>
                )}
            </div>
        </div>
     </div>
   );
}