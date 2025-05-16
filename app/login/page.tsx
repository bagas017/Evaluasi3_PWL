'use client';
import { signIn } from 'next-auth/react';
import Head from 'next/head';
import { FiArrowRight, FiLock, FiShield } from 'react-icons/fi';

export default function LoginPage() {
  const handleLogin = () => signIn('google', { callbackUrl: '/dashboard'});

  return (
    <>
      <Head>
        <title>Login | Bagas News</title>
        <meta name="description" content="Login to access Bagas News content" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl">
          {/* Left Side - Branding */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 md:p-12 text-white md:w-1/2 flex flex-col justify-center">
            <div className="mb-8">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                <FiShield className="text-white text-xl" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Bagas News</h1>
              <p className="text-blue-100">Your trusted source for global news</p>
            </div>
            
            <div className="space-y-4 mt-auto">
              <div className="flex items-start gap-3">
                <div className="bg-white/20 p-1.5 rounded-full mt-0.5">
                  <FiLock className="text-white text-sm" />
                </div>
                <div>
                  <h3 className="font-medium">Secure Authentication</h3>
                  <p className="text-blue-100 text-sm">Protected with industry-standard encryption</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-white/20 p-1.5 rounded-full mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">One-Click Access</h3>
                  <p className="text-blue-100 text-sm">No passwords to remember</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="bg-white p-8 md:p-12 md:w-1/2">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
              <p className="text-gray-500">Sign in to access your personalized news dashboard</p>
            </div>

            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-between gap-3 px-6 py-3.5 border border-gray-200 rounded-xl shadow-sm text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-150"
              aria-label="Sign in with Google"
            >
              <div className="flex items-center gap-3">
                <svg 
                  className="w-5 h-5" 
                  aria-hidden="true" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                </svg>
                <span>Continue with Google</span>
              </div>
              <FiArrowRight className="text-gray-400" />
            </button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <form className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="you@example.com"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">Forgot?</a>
                </div>
                <input
                  type="password"
                  id="password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
              
              <button
                type="submit"
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-150"
              >
                Sign in with Email
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>
                Don't have an account?{' '}
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Get started
                </a>
              </p>
              <p className="mt-2 text-xs">
                By continuing, you agree to our{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500">Terms</a> and{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}