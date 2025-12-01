'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { LogOut, Plus, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [shifts, setShifts] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [formData, setFormData] = useState({
    userId: '', date: '', startTime: '', endTime: ''
  });
  const [error, setError] = useState('');

  // 1. Check Auth & Load Data
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      router.push('/');
      return;
    }

    const userData = JSON.parse(storedUser);
    setUser(userData);
    
    // Set Auth Header globally for this session
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    loadData(userData);
  }, []);

  const loadData = async (currentUser: any) => {
    try {
      const shiftRes = await axios.get('/api/shifts');
      setShifts(shiftRes.data);

      if (currentUser.role === 'admin') {
        const empRes = await axios.get('/api/employees');
        setEmployees(empRes.data);
      }
    } catch (err) {
      console.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await axios.post('/api/shifts', formData);
      setFormData({ userId: '', date: '', startTime: '', endTime: '' }); // Reset form
      loadData(user); // Refresh table
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add shift');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shift Board</h1>
            <p className="text-gray-600">Welcome, {user.name} ({user.role})</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded transition">
            <LogOut size={20} /> Logout
          </button>
        </div>

        {/* Admin Only: Add Shift Form */}
        {user.role === 'admin' && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Plus size={20} /> Assign Shift
            </h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded flex items-center gap-2 text-sm">
                <AlertCircle size={16} /> {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-gray-700">Employee</label>
                <select 
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.userId}
                  onChange={e => setFormData({...formData, userId: e.target.value})}
                  required
                >
                  <option value="">Select Employee...</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.employee_code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Date</label>
                <input 
                  type="date" 
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Start Time</label>
                <input 
                  type="time" 
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.startTime}
                  onChange={e => setFormData({...formData, startTime: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">End Time</label>
                <input 
                  type="time" 
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.endTime}
                  onChange={e => setFormData({...formData, endTime: e.target.value})}
                  required
                />
              </div>
              <div className="md:col-span-5 flex justify-end">
                <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Shifts Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Date</th>
                <th className="p-4 font-semibold text-gray-600">Employee</th>
                <th className="p-4 font-semibold text-gray-600">Time</th>
                <th className="p-4 font-semibold text-gray-600">Duration</th>
                {user.role === 'admin' && <th className="p-4 font-semibold text-gray-600">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {shifts.map((shift: any) => {
                const start = new Date(`${shift.date}T${shift.start_time}`);
                const end = new Date(`${shift.date}T${shift.end_time}`);
                const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                
                return (
                  <tr key={shift.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 text-gray-800">{format(new Date(shift.date), 'MMM dd, yyyy')}</td>
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{shift.employee_name}</div>
                      <div className="text-xs text-gray-500">{shift.employee_code}</div>
                    </td>
                    <td className="p-4 text-gray-600">
                      {format(start, 'h:mm a')} - {format(end, 'h:mm a')}
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        hours >= 8 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {hours.toFixed(1)} hrs
                      </span>
                    </td>
                    {user.role === 'admin' && (
                        <td className="p-4 text-xs text-gray-400">Locked (Demo)</td>
                    )}
                  </tr>
                );
              })}
              {shifts.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No shifts found for this criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}