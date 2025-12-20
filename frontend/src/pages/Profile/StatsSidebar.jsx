import { BarChart2 } from "lucide-react";

export default function StatsSidebar({ children }) {
    return (
        <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] space-y-6">
            <div className="flex items-center gap-2 mb-2">
                <BarChart2 size={18} className="text-[var(--text-muted)]" />
                <span className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">Statistics</span>
            </div>
            {children}
        </div>
    );
}