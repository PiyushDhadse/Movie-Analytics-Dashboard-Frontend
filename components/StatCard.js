export default function StatCard({ title, value, subtitle, icon: Icon, trend }) {
  const trendColor = trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-500' : 'text-muted-foreground';
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '';
  
  return (
    <div className="relative bg-card rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground/90 tracking-normal">
            {title}
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight text-foreground">
              {value}
            </span>
            {subtitle && (
              <span className={`text-sm font-medium ${trendColor} flex items-center gap-0.5`}>
                {trendIcon} {subtitle}
              </span>
            )}
          </div>
        </div>
        
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-4.5 h-4.5 text-primary stroke-[1.5]" />
        </div>
      </div>
    </div>
  );
}