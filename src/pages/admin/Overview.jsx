import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';

const Overview = () => {
  const [user, setUser] = useState({ name: 'Admin' });
  const [timeframe, setTimeframe] = useState('week');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    newOrders: 0,
    newCustomers: 0,
    activeVouchers: 0
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setUser(JSON.parse(userStr));
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard/stats?timeframe=${timeframe}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data.overview);
      setChartData(res.data.chartData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, [timeframe]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 text-white p-3 rounded-lg shadow-lg text-sm font-bold">
          <p className="mb-1 text-zinc-400 capitalize">{label}</p>
          <p>{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-12 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-headline font-extrabold text-zinc-900 tracking-tight mb-2">
            Chào buổi sáng, {user.name.split(' ')[0] || user.name}.
          </h1>
          <p className="text-zinc-500 text-sm max-w-xl">
            Đây là báo cáo tổng hợp tồn kho và doanh thu thực tế dựa trên dữ liệu hệ thống.
          </p>
        </div>
        <div className="flex gap-2">
            {['week', 'month', 'year'].map((tf) => (
                <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-5 py-2 font-bold rounded-lg shadow-sm transition-all text-xs tracking-widest uppercase ${
                        timeframe === tf
                            ? 'bg-zinc-900 text-white'
                            : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
                    }`}
                >
                    {tf === 'week' ? 'Tuần' : tf === 'month' ? 'Tháng' : 'Năm'}
                </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-100 rounded-xl text-amber-600 shadow-inner">
              <span className="material-symbols-outlined shrink-0 leading-none">payments</span>
            </div>
            {/* Can put percentage here later */}
          </div>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Tổng doanh thu</p>
          <h3 className="text-2xl font-black text-zinc-900 font-headline truncate" title={formatCurrency(stats.totalRevenue)}>
             {formatCurrency(stats.totalRevenue)}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-100 rounded-xl text-blue-600 shadow-inner">
              <span className="material-symbols-outlined shrink-0 leading-none">shopping_bag</span>
            </div>
          </div>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Tổng Đơn hàng</p>
          <h3 className="text-2xl font-black text-zinc-900 font-headline">{stats.newOrders}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600 shadow-inner">
              <span className="material-symbols-outlined shrink-0 leading-none">group</span>
            </div>
          </div>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Tổng Khách hàng (Users)</p>
          <h3 className="text-2xl font-black text-zinc-900 font-headline">{stats.newCustomers}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-rose-100 rounded-xl text-rose-600 shadow-inner">
              <span className="material-symbols-outlined shrink-0 leading-none">confirmation_number</span>
            </div>
          </div>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Voucher còn hiệu lực</p>
          <h3 className="text-2xl font-black text-zinc-900 font-headline">{stats.activeVouchers}</h3>
        </div>
      </div>

      {/* Chart Section - Takes full width now since we removed the static suggestions box */}
      <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm relative min-h-[400px]">
        {loading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
            </div>
        )}
        <div className="flex justify-between items-center mb-8">
            <div>
            <h3 className="text-lg font-bold text-zinc-900 font-headline">Báo cáo doanh thu ({timeframe === 'week' ? 'Tuần' : timeframe === 'month' ? 'Tháng' : 'Năm'})</h3>
            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-bold">Biểu đồ trực quan theo thời gian thực</p>
            </div>
        </div>

        <div className="h-80 w-full mt-4 mr-4">
            {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-zinc-400 text-sm font-bold bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                    Chưa có dữ liệu giao dịch hiển thị.
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#71717a', fontSize: 12, fontWeight: 700 }} 
                            dy={10} 
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#a1a1aa', fontSize: 10 }} 
                            tickFormatter={(val) => val >= 1000000 ? `${(val/1000000).toFixed(1)}Tr` : val}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f4f4f5' }} />
                        <Bar 
                            dataKey="revenue" 
                            radius={[6, 6, 6, 6]}
                            maxBarSize={60}
                        >
                            {
                                chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.revenue > 0 ? '#f59e0b' : '#e4e4e7'} />
                                ))
                            }
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
      </div>
    </div>
  );
};

export default Overview;
