import React, { useState, useEffect,useContext } from 'react';
import { Sun, Moon, ArrowRight, Sparkles, Users, Crown, User, Check } from 'lucide-react';
import logo from '../assets/logo_typo_w.svg'
import UseFetch from '../hooks/UseFetch';
import { checkfetchedData } from '../context/Authcontext';
import axios from 'axios';
const roles = [
	{
		key: 'manager',
		label: 'I am the boss of my business',
		desc: 'Create and manage your own workspace with advanced controls and team oversight.',
		icon: Crown,
		gradient: 'from-purple-500 to-pink-500',
		features: ['Team Management', 'Advanced Analytics', 'Custom Branding']
	},
	{
		key: 'worker',
		label: 'I want to join my team or startup',
		desc: 'Collaborate seamlessly with your team using powerful collaboration tools.',
		icon: Users,
		gradient: 'from-blue-500 to-cyan-500',
		features: ['Real-time Collaboration', 'Project Management', 'Team Communication']
	}
];

export default function Tellusmore() {
	const [step, setStep] = useState(0);
	const [selected, setSelected] = useState(null);
	const [dark, setDark] = useState(false);
	const [mounted, setMounted] = useState(false);
	const {fetchData} = useContext(checkfetchedData)

  const userData = UseFetch()

	useEffect(() => {
		setMounted(true);
	}, []);


  const handleRoles = async (role) => {

    try {
      const setRole = await axios.post("http://localhost:3000/api/role",{id:userData.id,role:role},{withCredentials:true})
	  await fetchData()
      window.location.href = setRole.data.redirectUrl
    } catch (error) {

      console.log("can't set the user role due to this ",error);
      
      
    }
  }

	if (!mounted) return null;

	return (
		<div className={`${dark ? 'bg-slate-950' : 'bg-gray-50'} min-h-screen transition-all duration-500 relative`}>
			{/* Background bubbles for design consistency */}
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

			<div className="min-h-screen flex flex-col justify-center items-center px-8 py-10 relative overflow-hidden">
				{/* Logo at the top */}
				<div className="flex items-center justify-center mb-7 bg-blue-600 p-2 rounded-lg">
					<img src={logo} className="w-13" alt="AYB HUB" />
				</div>
				<div className="w-full max-w-xl relative z-10">
					{/* Step 1: Premium greeting */}
					{step === 0 && (
						<div className="space-y-8 animate-fade-in">
							<div className="text-center space-y-4">
								<div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 text-sm font-medium mb-4">
									<Sparkles className="w-4 h-4 mr-2" />
									Getting Started
								</div>
								<h1 className={`text-5xl font-black mb-6 ${dark ? 'text-white' : 'text-slate-900'} leading-tight`}>
									Let's Build Something
									<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
										Amazing Together
									</span>
								</h1>
								<p className={`text-xl ${dark ? 'text-slate-300' : 'text-slate-600'} max-w-lg mx-auto leading-relaxed`}>
									We're excited to have you here. Let's personalize your experience and get you set up in just a few clicks.
								</p>
							</div>
							<div className="flex justify-center">
								<button
									className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
									onClick={() => setStep(1)}
								>
									<span>Get Started</span>
									<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
								</button>
							</div>
						</div>
					)}

					{/* Step 2: Premium role selection */}
					{step === 1 && (
						<div className="max-h-screen flex flex-col justify-center animate-fade-in">
							<div className="text-center space-y-2  mb-4">
								<div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700  text-sm font-medium">
									Step 1 of 1
								</div>
								<h3 className={`text-3xl font-bold ${dark ? 'text-white' : 'text-slate-900'} mb-1`}>
									How will you use AYB HUB?
								</h3>
								<p className={`text-base ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
									Choose the option that best describes your workflow
								</p>
							</div>

							<div className="flex flex-col gap-3 w-full">
								{roles.map((role, index) => {
									const Icon = role.icon;
									const isSelected = selected === role.key;
									return (
										<button
											key={role.key}
											className={`group relative w-full p-4 rounded-xl border-2 transition-all duration-300 text-left overflow-hidden ${
												isSelected
													? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-xl scale-102'
													: `border-blue-500  ${dark ? 'bg-slate-800/50' : 'bg-gray-200/95'} hover:border-blue-600 dark:hover:border-blue-600 hover:shadow-lg`
											}`}
											onClick={() => setSelected(role.key)}
											style={{
												animationDelay: `${index * 100}ms`
											}}
										>
											{/* Background gradient */}
											<div className={`absolute inset-0 bg-gradient-to-r ${role.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
											<div className="relative flex items-start space-x-3">
												<div className={`p-2 rounded-xl bg-gradient-to-r ${role.gradient} shadow flex-shrink-0`}>
													<Icon className="w-5 h-5 text-white" />
												</div>
												<div className="flex-1 min-w-0">
													<div className="flex items-center justify-between mb-1">
														<h3 className={`text-base font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>
															{role.label}
														</h3>
														{isSelected && (
															<div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
																<Check className="w-3 h-3 text-white" />
															</div>
														)}
													</div>
													<p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-600'} mb-2 leading-relaxed`}>
														{role.desc}
													</p>
													<div className="flex flex-wrap gap-1">
														{role.features.map((feature, idx) => (
															<span
																key={idx}
																className={`px-2 py-0.5 text-[11px] rounded 
                                ${dark ? 'bg-slate-700 text-slate-400' : 'bg-blue-600 text-white'}
                              `}
															>
																{feature}
															</span>
														))}
													</div>
												</div>
											</div>
										</button>
									);
								})}
							</div>

							<div className="flex justify-center pt-2">
								<button
									className={`px-8 py-3 rounded-2xl font-semibold shadow-xl transition-all duration-300 flex items-center space-x-2 mt-4 ${
										selected
											? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white scale-102'
											: 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400 cursor-not-allowed'
									}`}
									disabled={!selected}
									onClick={(e) => {
										if (selected) {
											const selectedRole = roles.find((r) => r.key === selected);
											handleRoles(selectedRole.key)
										}
									}}
								>
									<span>Continue</span>
									{selected && <ArrowRight className="w-5 h-5" />}
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