export default function StatItem({ label, value, icon: Icon, color, highlight = false }) {
    return (
        <div className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: highlight ? 'var(--bg)' : 'transparent' }}>
                    <Icon size={20} style={{ color: color || 'var(--text)' }} />
                </div>
                <span className="text-sm font-medium text-[var(--text-muted)]">{label}</span>
            </div>
            <span className={`font-bold ${highlight ? 'text-lg' : 'text-base'}`} style={{ color: 'var(--text)' }}>{value}</span>
        </div>
    );
}