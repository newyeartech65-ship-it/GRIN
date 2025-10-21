import React, { useState } from 'react';
import { UserData } from '../types';

interface UserInfoFormProps {
  onSessionStart: (data: UserData) => void;
}

const UserInfoForm: React.FC<UserInfoFormProps> = ({ onSessionStart }) => {
  const [formData, setFormData] = useState<UserData>({
    name: '',
    age: '',
    dob: '',
    isInvestor: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.age && formData.dob) {
      onSessionStart(formData);
    }
  };

  const isFormValid = formData.name && formData.age && formData.dob;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50">
      <div className="w-full max-w-md bg-[#0a0f1c] border border-cyan-400/30 rounded-2xl shadow-2xl shadow-cyan-500/10 p-8">
        <h2 className="text-2xl font-bold text-center text-cyan-400 mb-2">Initialize Session</h2>
        <p className="text-center text-slate-400 mb-8">Please provide your details to continue.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-cyan-300 mb-2">Name</label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-slate-800/60 border border-cyan-400/30 rounded-lg py-2 px-4 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition duration-300"
              placeholder="John Doe"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-cyan-300 mb-2">Age</label>
              <input
                type="number"
                name="age"
                id="age"
                value={formData.age}
                onChange={handleChange}
                required
                className="w-full bg-slate-800/60 border border-cyan-400/30 rounded-lg py-2 px-4 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition duration-300"
                placeholder="28"
              />
            </div>
            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-cyan-300 mb-2">Date of Birth</label>
              <input
                type="date"
                name="dob"
                id="dob"
                value={formData.dob}
                onChange={handleChange}
                required
                className="w-full bg-slate-800/60 border border-cyan-400/30 rounded-lg py-2 px-4 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition duration-300"
              />
            </div>
          </div>
          <div className="flex items-center">
            <input
              id="isInvestor"
              name="isInvestor"
              type="checkbox"
              checked={formData.isInvestor}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
            />
            <label htmlFor="isInvestor" className="ml-3 block text-sm text-slate-300">
              Are you an active investor?
            </label>
          </div>
          <button
            type="submit"
            disabled={!isFormValid}
            className="w-full bg-cyan-500 text-slate-900 font-bold rounded-lg px-4 py-3 flex items-center justify-center transition-all duration-300 hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(0,245,255,0.6)] disabled:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            Start GRIN Session
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserInfoForm;
