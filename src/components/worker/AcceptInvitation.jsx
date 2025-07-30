import React, { useState } from 'react';
import { Sun, Moon, ArrowRight, KeyRound, Info, Check, X } from 'lucide-react';
import logo from '../../assets/logo_typo_w.svg';
import axios from 'axios';
import UseFetch from '../../hooks/UseFetch';

export default function AcceptInvitation() {
  const [dark, setDark] = useState(false);
  const [code, setCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState('');
  const [post, setPost] = useState('');
  const [success, setSuccess] = useState('');
  const userData = UseFetch()

  // Step 1: Check code
  const handleCheck = async (e) => {
    e.preventDefault();
    setChecking(true);
    setError('');
    setSuccess('')
    try {
      // Backend should return { companyName, post }
      const res = await axios.post(
        'http://localhost:3000/entreprise/api/acceptInvitationph1',
        { memberId:userData.id,code:code },
        { withCredentials: true }
      );
      console.log(res.data);
      setSuccess(res.data.message)
      
      setCompanyName(res.data.payload.companyName);
      setPost(res.data.payload.post);
      setStep(2);
    } catch (err) {
      if(err.response && err.response.data) setError(err.response.data.message);

      console.log("can't set the response from the server due to this",err);
      
    } finally {
      setChecking(false);
    }
  };

  // Step 2: Confirm join
  const handleAgree = async () => {
    setChecking(true);
    setError('');
    setSuccess('')
    try {
      // Backend should finalize the join (optional: you can use the same endpoint with a flag)
      const acceptInvitationRequest = await axios.post(
        'http://localhost:3000/entreprise/api/acceptInvitationph2',
        { memberId:userData.id,code:code },
        { withCredentials: true }
      );
      setSuccess(acceptInvitationRequest.data.message);
      setTimeout(() => {
        window.location.href = acceptInvitationRequest.data.redirectUrl;
      }, 2000);
    } catch (err) {
      if(err.response && err.response.data){
           
          setError(err.response.data.message);


      }
      console.log("can't accept join team request due to this",error);
      
      setStep(1);
    } finally {
      setChecking(false);
    }
  };

  // Step 2: Decline
  const handleDecline = () => {
    setCompanyName('');
    setPost('');
    setCode('');
    setStep(1);
    setError('');
  };

  return (
    <div className={`${dark ? 'bg-slate-950' : 'bg-gray-50'} min-h-screen transition-all duration-500 relative`}>
      {/* Gradient background effect */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-blue-600 via-purple-500 to-pink-400 opacity-30 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-500 opacity-20 blur-2xl"></div>
      </div>

      {/* Theme toggle button */}
      <button
        className={`fixed top-6 right-6 z-50 p-3 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
          dark
            ? 'bg-slate-800/60 text-yellow-400 hover:bg-slate-700/60'
            : 'bg-white/60 text-slate-600 hover:bg-white/80 shadow-lg'
        }`}
        onClick={() => setDark(!dark)}
        aria-label="Toggle dark mode"
      >
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="min-h-screen flex flex-col justify-center items-center px-8 py-10 relative z-10">
        {/* Logo at the top */}
        <div className="flex items-center justify-center mb-7 bg-blue-600 p-2 rounded-lg shadow-lg">
          <img src={logo} className="w-13" alt="AYB HUB" />
        </div>
        <div className="w-full max-w-xl relative z-10">
          <div className="space-y-8 animate-fade-in">
            {step === 1 && (
              <>
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:bg-blue-900/30 text-blue-700 text-sm font-medium mb-4">
                    <KeyRound className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
                      Join a Company
                    </span>
                  </div>
                  <h1 className={`text-4xl font-black mb-4 leading-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
                    Enter Your Invitation Code
                  </h1>
                  <p className={`text-lg ${dark ? 'text-slate-300' : 'text-slate-600'} max-w-lg mx-auto leading-relaxed`}>
                    <span className="inline-flex items-center gap-2">
                      <Info className="w-5 h-5 text-blue-400" />
                      Paste the code your manager sent you to join your workspace.
                    </span>
                  </p>
                </div>
                <form onSubmit={handleCheck} className="flex flex-col items-center gap-6">
                  <div
                    className="otp-box select-all text-white px-10 py-5 rounded-xl text-3xl font-extrabold tracking-widest shadow-lg mb-2 z-10"
                    style={{
                      background: '#2563eb',
                      letterSpacing: '8px',
                    }}
                  >
                    <input
                      type="text"
                      className={`bg-transparent border-none outline-none text-white text-3xl font-extrabold tracking-widest text-center w-60`}
                      placeholder="Enter Code"
                      value={code}
                      onChange={e => {
                        // Only allow A-Z, 0-9, max 6 chars, always uppercase
                        let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
                        setCode(val);
                      }}
                      maxLength={6}
                      style={{ letterSpacing: '8px' }}
                      autoFocus
                    />
                  </div>
                  {success && (
  <div className="flex flex-col items-center mb-3">
    <div className={`
      flex items-center gap-3 mt-4 px-6 py-3 rounded-xl shadow-lg  animate-fade-in
     ${
                  dark
                    ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700 border-2'
                    : 'bg-white'
                }
    `}>
      <svg className={`w-7 h-7 rounded-full p-1 shadow
        ${dark ? "bg-green-700 text-white" : "bg-green-600 text-white"}
      `} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill={dark ? "#15803d" : "#22c55e"}/>
        <path stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M8 12l2 2l4-4"/>
      </svg>
      <span className={`font-semibold text-lg drop-shadow
        ${dark ? "text-green-100" : "text-green-800"}
      `}>{success}</span>
    </div>
  </div>
)}

{/* Error Message */}
{error && (
  <div className="flex flex-col items-center mb-3">
    <div className={`
      flex items-center gap-3 mt-4 px-6 py-3 rounded-xl shadow-lg  animate-fade-in
     ${dark
                    ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700 border-2'
                    : 'bg-white'}
    `}>
      <svg className={`w-7 h-7 rounded-full p-1 shadow bg-red-400 text-white`}
       fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill={dark ? "#991b1b" : "#ef4444"}/>
        <path stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6m0-6l6 6"/>
      </svg>
      <span className={`font-semibold text-lg drop-shadow
        ${dark ? "text-red-200" : "text-red-700"}
      `}>{error}</span>
    </div>
  </div>
)}
                  <button
                    type="submit"
                    className={`px-8 py-3 rounded-2xl font-semibold shadow-xl transition-all duration-300 flex items-center space-x-2 ${
                      checking
                        ? 'bg-gray-300 dark:bg-slate-700 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                    }`}
                    
                  >
                    <span>{checking ? 'Checking...' : 'Check Code'}</span>
                    {!checking && <ArrowRight className="w-5 h-5" />}
                  </button>
                </form>
              </>
            )}

            {step === 2 && (
              <div className="flex flex-col items-center gap-8">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:bg-blue-900/30 text-blue-700 text-sm font-medium mb-4">
                    <Check className="w-4 h-4 mr-2 text-green-500" />
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
                      Invitation Valid
                    </span>
                  </div>
                  <h2 className={`text-3xl font-bold mb-2 ${dark ? 'text-white' : 'text-slate-900'}`}>
                    You will join <span className="text-blue-600">{companyName}</span> as <span className="text-purple-600">{post}</span>
                  </h2>
                  <p className={`text-base ${dark ? 'text-slate-400' : 'text-blue-700'}`}>
                    Do you agree to join this company with this post?
                  </p>
                </div>
                 {success && (
  <div className="flex flex-col items-center mb-3">
    <div className={`
      flex items-center gap-3 mt-4 px-6 py-3 rounded-xl shadow-lg  animate-fade-in
     ${
                  dark
                    ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700 border-2'
                    : 'bg-white'
                }
    `}>
      <svg className={`w-7 h-7 rounded-full p-1 shadow
        ${dark ? "bg-green-700 text-white" : "bg-green-600 text-white"}
      `} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill={dark ? "#15803d" : "#22c55e"}/>
        <path stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M8 12l2 2l4-4"/>
      </svg>
      <span className={`font-semibold text-lg drop-shadow
        ${dark ? "text-green-100" : "text-green-800"}
      `}>{success}</span>
    </div>
  </div>
)}

{/* Error Message */}
{error && (
  <div className="flex flex-col items-center mb-3">
    <div className={`
      flex items-center gap-3 mt-4 px-6 py-3 rounded-xl shadow-lg  animate-fade-in
     ${dark
                    ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700 border-2'
                    : 'bg-white'}
    `}>
      <svg className={`w-7 h-7 rounded-full p-1 shadow bg-red-400 text-white`}
       fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill={dark ? "#991b1b" : "#ef4444"}/>
        <path stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6m0-6l6 6"/>
      </svg>
      <span className={`font-semibold text-lg drop-shadow
        ${dark ? "text-red-200" : "text-red-700"}
      `}>{error}</span>
    </div>
  </div>
)}
                <div className="flex gap-4">
                  <button
                    className="px-8 py-3 rounded-2xl font-semibold shadow-xl transition-all duration-300 flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                    onClick={handleAgree}
                    disabled={checking}
                  >
                    <span>{checking ? 'Joining...' : 'Yes, Join & Go to Dashboard'}</span>
                    {!checking && <ArrowRight className="w-5 h-5" />}
                  </button>
                  <button
                    className="px-8 py-3 rounded-2xl font-semibold shadow-xl transition-all duration-300 flex items-center space-x-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300"
                    onClick={handleDecline}
                    disabled={checking}
                  >
                    <X className="w-5 h-5" />
                    <span>No, Back</span>
                  </button>
                </div>
                
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced animations */}
      <style>{`
        .animate-fade-in {
          animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes fadeInUp {
          from { 
            opacity: 0; 
            transform: translateY(30px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
        .otp-box {
          background: linear-gradient(135deg, #3182ce, #6b21a8);
          color: white;
          font-size: 2rem;
          font-weight: 700;
          text-align: center;
          border-radius: 8px;
          margin: 10px 0;
          letter-spacing: 8px;
          box-shadow: 0 4px 12px rgba(49, 130, 206, 0.3);
        }
      `}</style>
    </div>
  );
}