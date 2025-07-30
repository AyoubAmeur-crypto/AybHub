import React, { useContext, useState } from 'react';
import { Sun, Moon, ArrowRight, ArrowLeft,Check, UserPlus, Mail, KeyRound, Users, Info } from 'lucide-react';
import logo from '../../assets/logo_typo_w.svg';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import UseFetch from '../../hooks/UseFetch';





export default function InviteMembers() {
  const [dark, setDark] = useState(false);
  const [step, setStep] = useState(0);
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState([{ email: '', post: '' }]);
  const [sending, setSending] = useState(false);
  const [companyCode,setCompanyCode] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate()

  // Add a new member input row
  const userData = UseFetch()
  const addMember = () => setMembers([...members, { email: '', post: '' }]);
  // Remove a member input row
  const removeMember = idx => setMembers(members.filter((_, i) => i !== idx));
  // Update member input
  const updateMember = (idx, field, value) => {
    const updated = [...members];
    updated[idx][field] = value;
    setMembers(updated);
  };

  const createCompany = async (e)=>{
    e.preventDefault()
    setSending(true)
    try {

      const createCompany = await axios.post("http://localhost:3000/entreprise/api/create",{name:companyName,description:description,owner:userData.id},{withCredentials:true})
      setCompanyCode(createCompany.data.code)
      
      setStep(prev=>prev+1)

      
    } catch (error) {

      console.log("Can't generate company code due to this",error);
      
      
    }finally{

      setSending(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (
    members.length === 0 ||
    members.some(m => !m.email.trim() || !m.post.trim())
  ) {
    setError("Please add at least one member with both email and post.");
    return;
  }
    setSending(true);
    try {

      
      const sendInvitaionTomemebers = await axios.post("http://localhost:3000/entreprise/api/inviteMembers",{ownerId:userData.id,emails:members},{withCredentials:true})
      setError('')
      setSuccess(sendInvitaionTomemebers.data.message)
      setTimeout(() => {

              window.location.href=sendInvitaionTomemebers.data.redirectUrl

         
      }, 2000);
      
    } catch (error) {


      console.log("can't sent invitatio to emails due to this",error);
      if(error.response && error.response.data){


        setError(error.response.data.message)
      }
      
      
    }finally{

      setSending(false)
    }
  };

  return (
    <div className={`${dark ? 'bg-slate-950' : 'bg-gray-50'} min-h-screen transition-all duration-500 relative`}>
      {/* Gradient background effect */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      >
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
          {/* Step 1: Company Info */}
      
          {step === 0 && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:bg-blue-900/30 text-blue-700 text-sm font-medium mb-4">
                  <UserPlus className="w-4 h-4 mr-2 text-blue-500" />
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">Company Information</span>
                </div>
                <h1 className={`text-4xl font-black mb-4 leading-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
                  Create Your Company
                </h1>
                <p className={`text-lg ${dark ? 'text-slate-300' : 'text-slate-600'} max-w-lg mx-auto leading-relaxed`}>
                  <span className="inline-flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-400" />
                    Enter your company name and a short description to get started.
                  </span>
                </p>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all duration-200 ${
                    dark
                      ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-400'
                      : 'bg-white border-blue-200 text-slate-900 placeholder:text-slate-400'
                  }`}
                  placeholder="Company Name"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                />
                <textarea
                  className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all duration-200 resize-none ${
                    dark
                      ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-400'
                      : 'bg-white border-blue-200 text-slate-900 placeholder:text-slate-400'
                  }`}
                  placeholder="Company Description"
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
              <div className="flex justify-between">
                <button
                  className="group relative px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                  
                  onClick={() => {setCompanyName('') , setDescription('') , window.location.href='/tellusmore'}}
                >
                  
                  
                  <ArrowLeft className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  <span>Back</span>
                </button>
                 <button
                  className="group relative px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                  disabled={!companyName || !description}
                  onClick={(e)=>{createCompany(e)}}
                >
                  <span>{sending ? 'Sending...' : 'Next'}</span>
                  {!sending && <ArrowRight className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Invite Members */}
          {step === 1 && (
            <div className="max-h-screen flex flex-col justify-center animate-fade-in">
              {/* Invite Members Title - directly after logo */}
              <div className="text-center space-y-2 mb-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-sm font-bold">
                  <Mail className="w-4 h-4 mr-2 text-blue-600" />
                  Invite Members
                </div>
                <h3 className={` text-3xl font-extrabold mb-1  ${dark ? 'text-white' : 'text-slate-900'}`}>
                  Invite your team
                </h3>
                <p className={`text-base ${dark ? 'text-slate-400' : 'text-blue-700'} flex items-center justify-center gap-2`}>
                  <Users className="w-5 h-5 text-blue-400" />
                  Add emails and assign posts for each member you want to invite.
                </p>
              </div>

              {/* Company Code Box */}
              <div
                className={`w-full rounded-2xl shadow-2xl mb-4 p-6 flex flex-col items-center ${
                  dark
                    ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700 border-2'
                    : 'bg-white'
                }`}
                style={{
                  boxShadow: dark
                    ? '0 8px 32px 0 rgba(30,41,59,0.45)'
                    : '0 8px 32px 0 rgba(59,130,246,0.10)'
                }}
              >
                <div className="flex items-center gap-2 mb-2 z-10">
                  <KeyRound className={`drop-shadow w-8 h-8 ${dark ? 'text-blue-300' : 'text-blue-600'}`} />
                  <span className={`text-lg font-bold ${dark ? 'text-blue-300' : 'text-blue-600'}`}>
                    Your Unique Company Code
                  </span>
                </div>
                <div className="otp-box select-all text-white px-10 py-5 rounded-xl text-3xl font-extrabold tracking-widest shadow-lg mb-2 z-10"
                  style={{
                    background: '#2563eb', // bg-blue-600
                  }}
                >
                  {companyCode}
                </div>
                <div className="flex flex-col items-center gap-1 z-10">
                  <div className={`flex items-center  ${dark ? 'text-blue-300' : 'text-blue-700'}`}>
                    <Info className="w-5 h-5 mr-1" />
                    <span>
                      <span className={`font-semibold ${dark ? 'text-blue-300' : 'text-blue-700'}`}>This code is unique</span> to your company.
                    </span>
                  </div>
                  <div className={`text-sm text-center max-w-md ${dark ? 'text-slate-400' : 'text-blue-700'}`}>
                    Share it only with people you want to invite to your workspace.<br />
                    Members will use this code to join your workspace as invited users. <span className="font-semibold">Keep it safe and private!</span>
                  </div>
                </div>
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

              {/* Invite Members Form */}
              <div className="space-y-3">
                {members.map((member, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="email"
                      className={`flex-1 px-4 py-2 rounded-xl border-2 focus:outline-none transition-all duration-200 ${
                        dark
                          ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-400'
                          : 'bg-white border-blue-200 text-slate-900 placeholder:text-slate-400'
                      }`}
                      placeholder="Email"
                      value={member.email}
                      onChange={e => updateMember(idx, 'email', e.target.value)}
                    />
                    <input
                      type="text"
                      className={`w-40 px-4 py-2 rounded-xl border-2 focus:outline-none transition-all duration-200 ${
                        dark
                          ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-400'
                          : 'bg-white border-blue-200 text-slate-900 placeholder:text-slate-400'
                      }`}
                      placeholder="Post"
                      value={member.post}
                      onChange={e => updateMember(idx, 'post', e.target.value)}
                    />
                    {members.length > 1 && (
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700 text-xl px-2"
                        onClick={() => removeMember(idx)}
                        title="Remove"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="mt-2 text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
                  onClick={addMember}
                >
                  <Check className="w-4 h-4" /> Add another member
                </button>
              </div>
              <div className="flex justify-between pt-4">
                <button
                  className="px-6 py-2 rounded-xl font-semibold transition-all duration-300 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300"
                  onClick={() => setStep(0)}
                >
                  Back
                </button>
                <button
                  className={`px-8 py-3 rounded-2xl font-semibold shadow-xl transition-all duration-300 flex items-center space-x-2 ${
                    sending
                      ? 'bg-gray-300 dark:bg-slate-700 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                  }`}
                  
                  onClick={handleSubmit}
                >
                  <span>{sending ? 'Sending...' : 'Send & Go to Dashboard'}</span>
                  {!sending && <ArrowRight className="w-5 h-5" />}
                </button>
              </div>
             
            </div>
          )}
         
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
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}