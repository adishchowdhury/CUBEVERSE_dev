import React, { useState, useEffect } from 'react';
import { Database, BarChart3, Users, Zap, Award, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AnalyticsData {
  total_solves: number;
  avg_tps: number;
  global_avg_time: number;
  top_method: string;
  active_cubers: number;
  neural_optimization_score: number;
}

export function GlobalAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<string>('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics/global');
        const result = await response.json();
        if (result.source === 'demo_fallback') {
          setData(result.stats);
        } else {
          setData(result.data);
        }
        setSource(result.source);
      } catch (error) {
        console.error('Failed to fetch global analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return null;

  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/10 mt-8 relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full group-hover:bg-blue-500/20 transition-all duration-700" />
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
            <Database size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Snowpark Global Insights</h3>
            <p className="text-xs text-white/40 flex items-center gap-1.5">
              {source === 'snowflake_snowpark' ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  Live Snowflake Connection
                </>
              ) : (
                <>
                  <Info size={10} />
                  Simulated Neural Data (No Credentials)
                </>
              )}
            </p>
          </div>
        </div>
        
        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/50 font-mono">
          REF: SNOW-7721-X
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Solves', value: data?.total_solves.toLocaleString(), icon: Award, color: 'text-amber-400' },
          { label: 'Avg TPS', value: data?.avg_tps.toFixed(2), icon: Zap, color: 'text-cyan-400' },
          { label: 'Global Avg', value: `${data?.global_avg_time}s`, icon: BarChart3, color: 'text-purple-400' },
          { label: 'Top Method', value: data?.top_method, icon: Award, color: 'text-green-400' },
          { label: 'Active Today', value: data?.active_cubers.toLocaleString(), icon: Users, color: 'text-blue-400' },
          { label: 'Neural Score', value: `${data?.neural_optimization_score}%`, icon: Zap, color: 'text-pink-400' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col gap-2 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
          >
            <div className={`flex items-center gap-2 ${stat.color}`}>
              <stat.icon size={14} />
              <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">{stat.label}</span>
            </div>
            <div className="text-xl font-bold text-white tracking-tight leading-none">
              {stat.value}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between pt-6 border-t border-white/5">
        <p className="text-[10px] text-white/30 max-w-md">
          Leveraging Snowflake Snowpark for distributed processing of massive cubing datasets. Real-time neural aggregation for peak performance modeling.
        </p>
        <button className="text-[10px] text-blue-400 hover:text-blue-300 font-medium transition-colors">
          View Raw Dataset →
        </button>
      </div>
    </div>
  );
}
