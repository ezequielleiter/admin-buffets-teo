'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement proper authentication logic
    console.log('Login attempt:', { username, password });
    
    // For demo purposes, redirect to dashboard on any login attempt
    // In a real app, you would validate credentials first
    if (username && password) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark font-display">
        {/* Top Navigation Bar */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#dadfe7] dark:border-slate-800 bg-white dark:bg-slate-900 px-10 py-3">
          <div className="flex items-center gap-4 text-buffests-text dark:text-white">
            <h2 className="text-buffests-text dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">
              Buffests
            </h2>
          </div>
        </header>

        {/* Main Content Area: Centered Login Card */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-[440px] w-full">
            {/* Card Container */}
            <div className="flex flex-col items-stretch justify-start rounded-xl shadow-lg bg-white dark:bg-slate-900 overflow-hidden">

              {/* Form Content */}
              <div className="flex w-full grow flex-col items-stretch justify-center gap-6 py-8 px-8">
                <div className="text-center mb-2">
                  <p className="text-buffests-text dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                    Buffests Login
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {/* Username Field */}
                  <div className="flex flex-col w-full">
                    <label className="flex flex-col w-full">
                      <p className="text-buffests-text dark:text-slate-200 text-sm font-semibold leading-normal pb-2">
                        Username
                      </p>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#5e718d] text-xl">
                          person
                        </span>
                        <input
                          className="form-input flex w-full resize-none overflow-hidden rounded-lg text-buffests-text dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-[#dadfe7] dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary h-12 placeholder:text-[#5e718d] pl-10 pr-4 text-base font-normal leading-normal transition-colors"
                          placeholder="Enter your username"
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                        />
                      </div>
                    </label>
                  </div>

                  {/* Password Field */}
                  <div className="flex flex-col w-full">
                    <label className="flex flex-col w-full">
                      <p className="text-buffests-text dark:text-slate-200 text-sm font-semibold leading-normal pb-2">
                        Password
                      </p>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#5e718d] text-xl">
                          lock
                        </span>
                        <input
                          className="form-input flex w-full resize-none overflow-hidden rounded-lg text-buffests-text dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-[#dadfe7] dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary h-12 placeholder:text-[#5e718d] pl-10 pr-4 text-base font-normal leading-normal transition-colors"
                          placeholder="Enter your password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    </label>
                  </div>

                  {/* Login Button */}
                  <div className="flex pt-4">
                    <button
                      className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-blue-600 hover:bg-blue-700 text-white text-base font-bold leading-normal tracking-[0.015em] transition-all shadow-md active:scale-[0.98]"
                      type="submit"
                    >
                      <span className="truncate">Sign In</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
  );
}