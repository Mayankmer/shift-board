'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true); 
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    employee_code: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        // --- LOGIN LOGIC ---
        const res = await axios.post('/api/login', { 
          email: formData.email, 
          password: formData.password 
        });
        
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        router.push('/dashboard');
      } else {
        // --- SIGN UP LOGIC ---
        await axios.post('/api/signup', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          employee_code: formData.employee_code
        });
        
        setSuccess('Account created! Please login.');
        setIsLogin(true); // Switch back to login view
        setFormData({ name: '', email: '', password: '', employee_code: '' });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {isLogin ? 'Shift Board Login' : 'Create Account'}
        </h1>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Show Name field only if Signing Up */}
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  name="name"
                  type="text"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Employee Code (Optional)</label>
                <input
                  name="employee_code"
                  type="text"
                  placeholder="e.g. EMP005"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  value={formData.employee_code}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              name="email"
              type="email"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              name="password"
              type="password"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:underline"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </button>
        </div>
        
        {/* {isLogin && (
          <div className="mt-6 text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <p className="font-semibold">Demo Credentials:</p>
            <p>Admin: hire-me@anshumat.org</p>
            <p>Pass: HireMe@2025!</p>
          </div>
        )} */}
      </div>
    </div>
  );
}