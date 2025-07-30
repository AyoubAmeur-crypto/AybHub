import React, { useEffect, useState ,useRef } from 'react';
import {
  User,
  Mail,
  Plus,
  Shield,
  Users,
  Building,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  CheckCircle2,
  CheckCircle,
  AlertTriangle,
  Database,
  Settings,
  Download,
  Lock,
  Globe,
  Server,
  FileCheck,
  Clock,
  X,
  ChevronDown,
  CheckCircle2Icon,
  AlertCircleIcon,
  ChevronRight
} from 'lucide-react';

import {cn} from '../../lib/utils'

import google from '../../assets/google.svg'
import facebook from '../../assets/facebook.svg'
import paypal from '../../assets/paypal-icon.svg'
import logo from '../../assets/logo_typo_w.svg'
import '../../App.css'
import UseFetch from '../../hooks/UseFetch';
import axios from 'axios';
import ReCAPTCHA from "react-google-recaptcha";
import { Alert,AlertDescription, AlertTitle } from "../../components/Alert";


const WorkerSetting = () => {
  //captcha verfification before deleting
  const [showDeleteVerification, setShowDeleteVerification] = useState(false);
const [deleteCode, setDeleteCode] = useState('');
const [inputCode, setInputCode] = useState('');
const [entireDelete,setentireDelete]=useState(false)
const [PasswordLoading,setPasswordLoading]=useState(false)
const [donationAmount, setDonationAmount] = useState(50);
const [privacyOpen, setPrivacyOpen] = useState(false);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showPassword, setShowPassword] = useState({ old: false, new: false });
  const [expandedTeams, setExpandedTeams] = useState({});
  const [toast, setToast] = useState(null);
  const [loading,setLoading]=useState(false)
  const [teamMembers,setTeamMembers]=useState([])
  const [companySetting,setCompanySettings]=useState(null)
  const [formData, setFormData] = useState({
    inviteEmail: '',
    inviteRole: '',
    oldPassword: '',
    newPassword: ''
  });

  const [confirmationModal,setConfiramtionModal]=useState(false)
  const [emailError, setEmailError] = useState(false);
  const [deletedUser,setDeletedUser]=useState(null)
  const [teamInfo,setTeamInfo]=useState([])
  const [showSuccessModal,setshowSuccessModal]=useState(false)
  const [successMessage,setSuccessMessage]=useState(null)
  const [alert,setAlert]=useState(null)
  const [invitations,setInvitations]=useState([])



  const userData = UseFetch()


const [captchaVerified, setCaptchaVerified] = useState(false);

const paypalRef = useRef();

  const privacyFeatures = [
    {
      icon: <Shield className="w-5 h-5 text-blue-600" />,
      title: "Zero Data Selling",
      description: "We never sell, rent, or share your personal or company data with third parties for any purpose."
    },
    {
      icon: <Users className="w-5 h-5 text-blue-600" />,
      title: "Team-Only Access",
      description: "Only your authorized team members and designated admins can access your shared workspace content."
    },
    {
      icon: <Lock className="w-5 h-5 text-blue-600" />,
      title: "End-to-End Encryption",
      description: "All data is encrypted in transit using TLS 1.3 and at rest with AES-256 encryption standards."
    },
    {
      icon: <Eye className="w-5 h-5 text-blue-600" />,
      title: "Privacy-First Analytics",
      description: "We use minimal, anonymized analytics focused solely on improving user experience—never for advertising."
    }
  ];

  const additionalPrivacyFeatures = [
    {
      icon: <Database className="w-5 h-5 text-blue-600" />,
      title: "Data Residency Control",
      description: "Choose where your data is stored with our global infrastructure spanning US, EU, and Asia-Pacific regions."
    },
    {
      icon: <Settings className="w-5 h-5 text-blue-600" />,
      title: "Granular Privacy Controls",
      description: "Fine-tune privacy settings at user, project, and organization levels with role-based access controls."
    },
    {
      icon: <Download className="w-5 h-5 text-blue-600" />,
      title: "Complete Data Portability",
      description: "Export all your data in standard formats (JSON, CSV, PDF) at any time with one-click downloads."
    },
    {
      icon: <Trash2 className="w-5 h-5 text-blue-600" />,
      title: "Right to be Forgotten",
      description: "Permanently delete your account and all associated data within 30 days, with cryptographic proof of deletion."
    },
   
    {
      icon: <Server className="w-5 h-5 text-blue-600" />,
      title: "SOC 2 Type II Certified",
      description: "Independently audited and certified for security, availability, and confidentiality controls."
    },
 
    {
      icon: <Lock className="w-5 h-5 text-blue-600" />,
      title: "Zero-Knowledge Architecture",
      description: "We cannot access your encrypted data even if we wanted to—your encryption keys remain under your control."
    }
  ];



useEffect(() => {
  if (window.paypal) {
    window.paypal.Buttons({
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [
            {
              amount: { value: "50" }, // you can make this dynamic if you want
            },
          ],
        });
      },
      onApprove: (data, actions) => {
        return actions.order.capture().then((details) => {
          alert(`🎉 Thank you ${details.payer.name.given_name} for your donation! 🙏`);
        });
      },
      onError: (err) => {
        console.error("PayPal error:", err);
        alert("Something went wrong with the payment.");
      },
    }).render(paypalRef.current);
  }
}, []);


useEffect(() => {
  const loadPayPalSDK = () => {
    if (window.paypal) {
      renderPayPalButtons();
    } else {
      // Show fallback button if PayPal SDK fails to load
      const fallbackButton = document.getElementById('fallback-paypal-button');
      if (fallbackButton) {
        fallbackButton.style.display = 'flex';
      }
    }
  };

  const renderPayPalButtons = () => {
    if (paypalRef.current && window.paypal) {
      // Clear any existing buttons
      paypalRef.current.innerHTML = '';
      
      window.paypal.Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: { 
                  value: donationAmount.toString(), // Use dynamic amount
                  currency_code: "USD" // Change to USD for better compatibility
                },
                description: "Support for AYB HUB Platform - Thank you!",
                // Remove donation-specific fields that cause issues
                custom_id: `support_${Date.now()}`,
                soft_descriptor: "AYB HUB Support"
              },
            ],
            // Use CAPTURE intent instead of donation-specific settings
            intent: "CAPTURE"
          });
        },
        onApprove: (data, actions) => {
          return actions.order.capture().then((details) => {
            // Show success message
            setSuccessMessage(`🎉 Thank you ${details.payer.name.given_name} for your generous support of $${donationAmount}! 🙏 Your contribution means the world to us!`);
            setshowSuccessModal(true);
            
            setTimeout(() => {
              setshowSuccessModal(false);
              setSuccessMessage('');
            }, 5000);
          });
        },
        onError: (err) => {
          console.error("PayPal error:", err);
          setAlert("Something went wrong with the payment. Please try again or use the alternative donation link.");
          setTimeout(() => setAlert(null), 6000);
        },
        onCancel: (data) => {
          console.log("Payment cancelled", data);
          setAlert("Payment was cancelled. You can try again anytime!");
          setTimeout(() => setAlert(null), 3000);
        },
        style: {
          layout: 'vertical',
          color: 'blue', // Change from 'gold' to 'blue' for regular payments
          shape: 'rect',
          label: 'pay', // Change from 'donate' to 'pay'
          height: 45,
          tagline: false
        }
      }).render(paypalRef.current);
    }
  };

  // Load PayPal buttons when component mounts
  loadPayPalSDK();
}, [userData.id, donationAmount]);


// get exact infos about the post user

const [exactInfo,setExactInfo]=useState('')


  const openDeleteVerification = () => {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  setDeleteCode(code);
  setInputCode('');
  setShowDeleteVerification(true);
  setCaptchaVerified(false);
};



  const getPost = async ()=>{
    setLoading(true)
    try {

      const res = await axios.get("http://localhost:3000/setting/api/getExactInvitation",{withCredentials:true})
      console.log("exact infos fetch ",res.data.info);
      
      setExactInfo(res.data.info)
      
    } catch (error) {

      console.log("can't fetch exact infos for this user due to this ",error);
      
      
    }finally{

      setLoading(false)
    }
  }

  const deleteFromEntreprise = async (user)=>{

   setLoading(true)
    try {

      const res = await axios.delete(`http://localhost:3000/setting/api/deleteUser/${user._id}`,{withCredentials:true})
      if(res.data.message){
        setSuccessMessage('User Has Been Deleted Successfully')

        setshowSuccessModal(true)

        setTimeout(()=>{
           setshowSuccessModal(false);
          setShowInviteModal(false);
          setSuccessMessage('');
        },4000)
      }
      await getMemebersInfos()
      await getInvitations()
      await getTeamsInfos()


      
    } catch (error) {

      console.log("can't delete user due to this",error);
      
      
    }finally{

      setLoading(false)
      setConfiramtionModal(false)
   
      
    }
  }

  const deleteFromSaas = async ()=>{
    setLoading(true)
    try {

      const res = await axios.delete("http://localhost:3000/setting/api/deleteUser",{withCredentials:true})

      if(res.data){

        setSuccessMessage('Thanks For Your Time in AYB HUB We Wish You All The Best In The Future 👋')
        setshowSuccessModal(true)

        setTimeout(()=>{

          setSuccessMessage('')
          setshowSuccessModal(false)
        },4000)
      }
      
    } catch (error) {

      console.log("can't delete the user due to this",error);
      
      
    }finally{

      setLoading(false)
      setentireDelete(false)
    }
  }

  const getMemebersInfos = async ()=>{
    setLoading(true)
    try {

      const res = await axios.get("http://localhost:3000/setting/api/getMemberInfos",{withCredentials:true})

      console.log("data sent from server",res.data.entreprise);
      setTeamMembers(res.data.entreprise.workers || [])
      setCompanySettings(res.data.entreprise)
      
      


       
    } catch (error) {

      console.log("can't fetch data of team members due to this",error);
      
      
    }finally{

      setLoading(false)

    }
  }

  const getInvitations = async ()=>{

    setLoading(true)
    try {
      
            const res = await axios.get("http://localhost:3000/setting/api/getInvitations",{withCredentials:true})
            console.log("invitations sent from the server ",res.data.invitations);
            
            setInvitations(res.data.invitations)
            

    } catch (error) {

      console.log("can't fetch invitations due to this",error);
      
      
    }finally{

      setLoading(false)
    }
  }
  const getTeamsInfos = async ()=>{
    setLoading(true)
    try {

      const res = await axios.get("http://localhost:3000/setting/api/getTeamInfos",{withCredentials:true})


      console.log("data sent from server fort teams",res.data.teams);
      setTeamInfo(res.data.teams)
      
      


      
    } catch (error) {

      console.log("can't fetch data of teams due to this",error);
      
      
    }finally{

      setLoading(false)
    }
  }

  useEffect(()=>{

    getMemebersInfos()
    getTeamsInfos()
    getInvitations()
    getPost()


  },[userData.id])

  

  const teams = [
    {
      id: 1,
      name: "Frontend Team",
      memberCount: 4,
      members: ["AC", "ED", "LP", "SJ"]
    },
    {
      id: 2,
      name: "Backend Team",
      memberCount: 3,
      members: ["RK", "AC", "SJ"]
    },
    {
      id: 3,
      name: "Design Team",
      memberCount: 5,
      members: ["ED", "SW", "DB", "MG", "JS"]
    },
    {
      id: 4,
      name: "QA Team",
      memberCount: 3,
      members: ["RK", "LP", "AC"]
    }
  ];

  // Function to display a toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Handler for sending an invitation
  const handleInviteSubmit = async () => {
    if (formData.inviteEmail && formData.inviteRole) {
      setLoading(true)
      try {

        const res = await axios.post("http://localhost:3000/entreprise/api/inviteMembers",{ownerId:userData.id,emails:[{email:formData.inviteEmail,post:formData.inviteRole}]},{withCredentials:true})
    
      if(res){
        setSuccessMessage(`Invitation has been sent successfuly to ${formData.inviteEmail}`)

        setshowSuccessModal(true)
        await getInvitations()


        setTimeout(()=>{
          setshowSuccessModal(false);
          
          setSuccessMessage('');
          setFormData({ ...formData, inviteEmail: '', inviteRole: '' });
        },4000)
      }
        
      } catch (error) {

        console.log("can't send invitation due to this",error);
        
        
      }finally{


         
          setLoading(false)
          setShowInviteModal(false);
      


      }
    }
  };

  // Handler for changing password
  const handlePasswordChange = async () => {
    if (formData.oldPassword && formData.newPassword) {
setPasswordLoading(true)
try {

  const res = await axios.post("http://localhost:3000/setting/api/updatePassword",{oldPassword:formData.oldPassword,NewPassword:formData.newPassword},{withCredentials:true})
  if(res.data.success){

    console.log("response sent",res.data.message);
     setSuccessMessage(res.data.message)
        setFormData({ ...formData, oldPassword: '', newPassword: '' });
    
  }

  
} catch (error) {

  if(error && error.response && error.response.data){

    console.log("response sent : ",error.response.data.message);
    setAlert(error.response.data.message)

    
  }

  else{

    console.log("can't update password due to this",error);
    
  }
  
}finally{

  setPasswordLoading(false)
}
       
    
    }
  };

  // Toggle expansion state for team sections
  const toggleTeam = (teamId) => {
    setExpandedTeams(prev => ({
      ...prev,
      [teamId]: !prev[teamId]
    }));
  };

  // Helper function to get status badge classes
  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    if (status === 'accepted') {
      return `${baseClasses} bg-green-100 text-green-800`;
    }
    return `${baseClasses} bg-yellow-100 text-yellow-800`;
  };

  // Helper function to get role badge classes
  const getRoleBadge = (role) => {
    const colors = {
      'Manager': 'bg-purple-100 text-purple-800',
      'Developer': 'bg-blue-100 text-blue-800',
      'Designer': 'bg-pink-100 text-pink-800',
      'QA': 'bg-green-100 text-green-800',
      'DevOps': 'bg-orange-100 text-orange-800',
      'Data': 'bg-indigo-100 text-indigo-800'
    };
    return `px-2 py-1 rounded-lg text-xs font-medium ${colors[role] || 'bg-gray-100 text-gray-800'}`;
  };

  const handleAlternativeDonation = () => {
  // Create a proper PayPal.me link with your actual PayPal username
  // Replace 'aybhubsupport' with your actual PayPal.me username
  window.open(`https://paypal.me/AyoubAmeurMA/${donationAmount}USD`, '_blank');
};

const handleBankTransfer = () => {
  // Show bank transfer details
  setSuccessMessage(`Bank Transfer Details:
  
📧 Email: ayoub.dogs2020@gmail.com
💰 Amount: ${donationAmount} USD
📝 Reference: AYB HUB Support

Please contact us for complete bank transfer information.`);
  setshowSuccessModal(true);
  
  setTimeout(() => {
    setshowSuccessModal(false);
    setSuccessMessage('');
  }, 10000);
};

const handleCryptoDonation = () => {
  setSuccessMessage(`Cryptocurrency Donations:

₿ Bitcoin: Contact us for wallet address
🏦 USDT/USDC: Contact us for wallet address
📧 Email: ayoub.dogs2020@gmail.com

We'll provide secure wallet addresses upon request.`);
  setshowSuccessModal(true);
  
  setTimeout(() => {
    setshowSuccessModal(false);
    setSuccessMessage('');
  }, 10000);
};

  return (
    // Fixed height container with explicit overflow settings
    <div className="min-h-screen bg-gray-50">
<script src="https://www.paypal.com/sdk/js?client-id=AZFHas-2fTPfVTadC17iR_8ciYQRVLOGU9uHdDPepN4GcyO7H5b4XCvszFqwMoDQo5E2rrRnGJdfwtIE&currency=USD&intent=capture"></script>


      {/* Main scrollable container */}
      <div className="h-screen overflow-y-auto project-scrollbar">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-6">

              {/* Left Panel */}
              <div className="lg:w-1/3 space-y-6">

                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-blue-600">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {userData.avatar ? <img src={userData.avatar} className='rounded-full w-24 h-24'/> : <div>{userData.firstName[0]+userData.lastName[0]}</div>}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{userData.firstName + ' ' + userData.lastName}</h2>
                    <div className="flex items-center justify-center text-blue-700 mb-2">
                      <User className="w-4 h-4 mr-2" />
                      {loading ? <span className="font-medium">-</span> : <span className="font-medium">{exactInfo.post}</span>}
                    </div>
                    <div className="flex items-center justify-center text-gray-600 mb-4">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>{userData.email}</span>
                    </div>
             
                  </div>
                </div>

                {/* Company Settings */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center mb-4">
                    <Building className="w-5 h-5 text-blue-600 mr-3" />
                    <h3 className="text-xl font-bold text-gray-900">Company Settings</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Company Name</p>
                      <p className="font-medium text-gray-900">
                          {companySetting ? companySetting.name : "Loading..."}

                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Plan</p>
                      <p className="font-medium text-gray-900">-</p>
                    </div>
                  </div>
                </div>

               

                {/* Security Settings */}
               <div className="mb-30">
                <div className="bg-white rounded-2xl shadow-lg p-6">
  <div className="flex items-center mb-4">
    <Shield className="w-5 h-5 text-blue-600 mr-3" />
    <h3 className="text-xl font-bold text-gray-900">Security Settings</h3>
  </div>
  <div className="mb-4">
    {(userData.facebookId || userData.googleId) ? (
      <div className="px-3 py-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white text-[14px] font-medium rounded-2xl flex flex-col items-center gap-2">
        <Lock className="w-10 h-10 mr-2 " />
        Your account is secured with a  third-party login system.<br />
        <span className="text-[12px] font-normal">
          To reset your password, please use the login page for your provider (Google or Facebook).
        </span>
      </div>
    ) : null}             {(successMessage || alert) && (
        <div className="grid w-full max-w-xl items-start gap-4 mb-3">
          <Alert 
            variant={successMessage ? "default" : "destructive"}
            className={cn(
              successMessage ? "bg-green-600 border border-green-800/40 text-white" : "bg-red-700 border border-red-800/40 text-pink-100" )}
          >
            {/* Change icon based on message type */}
            {successMessage 
              ? <CheckCircle2Icon className="text-green-300" />


              : <AlertCircleIcon className="text-red-300" />
            }
            
            {/* Change title based on message type */}
            <AlertTitle className={cn(
              successMessage
                ?  "text-green-300" 
                :  "text-red-300"
            )}>
              {successMessage ? "Success" : "Password Update Error"}
            </AlertTitle>
            
            <AlertDescription className={cn(
              successMessage
                ? "text-green-200" 
                : "text-red-200" 
            )}>
              <p>{successMessage || alert}</p>
            </AlertDescription>
          </Alert>
        </div>
      )}

  </div>
  <div className="mb-6 p-3 bg-blue-50 rounded-lg">
    <p className="text-sm text-gray-600">Current Email</p>
    <p className="font-medium text-gray-900">{userData.email}</p>
  </div>
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Old Password
      </label>
      <div className="relative">
        <input
          type={showPassword.old ? "text" : "password"}
          value={formData.oldPassword}
          onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
          className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${userData.facebookId || userData.googleId ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}`}
          placeholder="Enter old password"
          disabled={userData.facebookId || userData.googleId}
        />
        <button
          type="button"
          onClick={() => setShowPassword({ ...showPassword, old: !showPassword.old })}
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${userData.facebookId || userData.googleId ? "text-gray-300 cursor-not-allowed" : "text-gray-500"}`}
          disabled={userData.facebookId || userData.googleId}
        >
          {showPassword.old ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        New Password
      </label>
      <div className="relative">
        <input
          type={showPassword.new ? "text" : "password"}
          value={formData.newPassword}
          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
          className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${userData.facebookId || userData.googleId ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}`}
          placeholder="Enter new password"
          disabled={userData.facebookId || userData.googleId}
        />
        <button
          type="button"
          onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${userData.facebookId || userData.googleId ? "text-gray-300 cursor-not-allowed" : "text-gray-500"}`}
          disabled={userData.facebookId || userData.googleId}
        >
          {showPassword.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Min 8 chars, one uppercase, one number
      </p>
    </div>
    <button
      type="button"
      onClick={handlePasswordChange}
      className={`w-full px-6 py-3 rounded-xl font-medium transition-all duration-300 ${userData.facebookId || userData.googleId
        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
        : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg hover:bg-gradient-to-r from-blue-700 to-blue-800"
        }`}
      disabled={userData.facebookId || userData.googleId}
    >
       {PasswordLoading ? (
        <span className="flex  items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          Changing...
        </span>
      ) : "Change Password"}
             
     
    </button>
  </div>
</div>
               </div>
              </div>

              {/* Right Panel */}
              <div className="lg:w-2/3 space-y-6">

                {/* Team Members Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center mb-6">
                    <Users className="w-5 h-5 text-blue-600 mr-3" />
                    <h3 className="text-xl font-bold text-gray-900">Team Members</h3>
                    <span className="ml-auto bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {teamMembers.length} members
                    </span>
                  </div>

                  <div className="grid gap-4">
                   {loading ? <><div class="loader">
  <div class="wrapper">
    <div class="circle"></div>
    <div class="line-1"></div>
    <div class="line-2"></div></div>
    
</div> <div class="loader">
  <div class="wrapper">
    <div class="circle"></div>
    <div class="line-1"></div>
    <div class="line-2"></div></div>
    
</div>  </>: teamMembers && teamMembers.length > 0 ? (
    teamMembers.map((member) => (
      <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:shadow-md transition-all duration-300">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold mr-4">
            {member.member.avatar ? <img src={member.member.avatar} className='w-12 h-12 rounded-full'/> : <div>{member.member.firstName[0]+''+member.member.lastName[0]}</div>}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{member.member.firstName+' '+member.member.lastName}</h4>
            <p className="text-sm text-gray-600">{member.post}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={getRoleBadge(member.post)}>{member.post}</span>
        </div>
      </div>
    ))
  ) : (
    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
      <Users className="w-12 h-12 mb-2" />
      <span className="text-lg font-medium">No  members found</span>
    </div>
  )}
                  </div>
                </div>

                {/* Teams Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Teams</h3>

                  <div className="space-y-4">
                    {loading ? <><div class="loader">
  <div class="wrapper">

    <div class="line-1"></div>
    <div class="line-2"></div></div>
    
</div> <div class="loader">
  <div class="wrapper">
    <div class="line-1"></div>
    <div class="line-2"></div></div>
    
</div>  </> : <>

{teamInfo && teamInfo.length > 0 ? <>{teamInfo.map((team) => (
                      <div key={team._id} className="border border-gray-200 rounded-xl p-4">
                        <div
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => toggleTeam(team._id)}
                        >
                          <div className="flex items-center">
                            {expandedTeams[team._id] ? (
                              <ChevronDown className="w-5 h-5 text-gray-400 mr-3" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-400 mr-3" />
                            )}
                            <h4 className="font-semibold text-gray-900">{team.name}</h4>
                            <span className="ml-3 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                              {team.members.length} members
                            </span>
                          </div>
                          <div className="flex -space-x-2">
                            {team.members.slice(0, 3).map((member, idx) => (
                              <div key={idx} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                                {member.avatar ? <img src={member.avatar} className='w-8 h-8 rounded-full'/> : <div>{member.firstName[0]+''+member.lastName[0]}</div>}
                              </div>
                            ))}
                            {team.members.length > 3 && (
                              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-bold border-2 border-white">
                                +{team.members.length - 3}
                              </div>
                            )}
                          </div>
                        </div>

                        
                         <div
  className={`overflow-hidden transition-all duration-300 ${
    expandedTeams[team._id]
      ? "max-h-40 opacity-100 pt-4 mt-4 border-t border-gray-200"
      : "max-h-0 opacity-0"
  }`}
>
  <p className="text-gray-700 font-normal text-sm truncate">{team.description}</p>
</div>
                      
                      </div>
                    ))}</> : <>
                       <div className="flex flex-col items-center justify-center py-10 text-gray-400">
      <Users className="w-12 h-12 mb-2" />
      <span className="text-lg font-medium">No teams found</span>
    </div>
                     </>}

</>}
                  </div>
                </div>

                {/* Additional content to demonstrate scrolling */}
              <div className="p-4 bg-gray-50 rounded-lg">
  <h4 className="font-semibold text-gray-900 mb-2">Integrations</h4>
  <div className="flex flex-col sm:flex-row gap-4 mt-5 w-full">
    {/* Facebook Integration Card */}
    <div className={`flex items-center gap-3 flex-1 px-4 py-3 rounded-xl shadow-sm border transition-all duration-200
      ${userData.facebookId ? "bg-blue-50 border-blue-200" : "bg-gray-100 border-gray-200"}`}>
      <img
        width="32"
        height="32"
        src={facebook}
        alt="Facebook"
        style={{
          filter: userData.facebookId ? "none" : "grayscale(1)",
          opacity: userData.facebookId ? 1 : 0.5,
        }}
      />
      <div className="flex flex-col">
        <span className={`font-semibold text-base ${userData.facebookId ? "text-blue-700" : "text-gray-400"}`}>
          Facebook
        </span>
        <span className={`text-xs ${userData.facebookId ? "text-blue-500" : "text-gray-400"}`}>
          {userData.facebookId ? "Linked" : "Not linked"}
        </span>
      </div>
    </div>
    {/* Google Integration Card */}
    <div className={`flex items-center gap-3 flex-1 px-4 py-3 rounded-xl shadow-sm border transition-all duration-200
      ${userData.googleId ? "bg-red-50 border-red-200" : "bg-gray-100 border-gray-200"}`}>
      <img
        width="32"
        height="32"
        src={google}
        alt="Google"
        style={{
          filter: userData.googleId ? "none" : "grayscale(1)",
          opacity: userData.googleId ? 1 : 0.5,
        }}
      />
      <div className="flex flex-col">
        <span className={`font-semibold text-base ${userData.googleId ? "text-[#EA4335]" : "text-gray-400"}`}>
          Google
        </span>
        <span className={`text-xs ${userData.googleId ? "text-[#EA4335]" : "text-gray-400"}`}>
          {userData.googleId ? "Linked" : "Not linked"}
        </span>
      </div>
    </div>
  </div>
</div>

                
<div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center cursor-pointer p-6 transition-all duration-200"
        onClick={() => setPrivacyOpen((prev) => !prev)}
      >
        <div className="flex items-center flex-1">
          {privacyOpen ? (
            <ChevronDown className="w-5 h-5 text-gray-400 mr-3 transition-all duration-300" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400 mr-3 transition-all duration-300" />
          )}
          <div className="flex items-center">
            <Shield className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">Privacy & Security</h3>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
            Enterprise Grade
          </span>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {privacyOpen ? "Hide Details" : "View All"}
          </span>
        </div>
      </div>

      {/* Always Visible Preview */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {privacyFeatures.map((feature, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 mt-0.5">
                {feature.icon}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">
                  {feature.title}
                </h4>
                <p className="text-gray-600 text-xs leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expandable Section */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          privacyOpen
            ? "max-h-[800px] opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-gray-200 px-6 py-6">
          {/* Company Logo Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl px-1 py-2 w-18 h-20 flex flex-col items-center justify-center">
      <img src={logo} className='w-15 h-15' />
    </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2 mt-2">Your Privacy is Our Priority</h4>
            <p className="text-gray-600 text-center max-w-md text-sm">
              We've built AYB HUB from the ground up with privacy-first principles, 
              ensuring your data remains secure and under your complete control.
            </p>
          </div>

          {/* Advanced Privacy Features */}
          <div className="space-y-4 mb-8">
            <h5 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Advanced Privacy Features
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {additionalPrivacyFeatures.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors duration-200">
                  <div className="flex-shrink-0 mt-1">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-gray-600 text-xs leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications & Compliance */}
        

          {/* Contact & Resources */}
          <div className="flex flex-col md:flex-row gap-2 items-center pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600 mb-4 md:mb-0">
              Questions about our privacy practices? 
              <a href="#" className="text-blue-600 hover:text-blue-700 ml-1 font-medium">
                Contact our Privacy Team On : 
              </a>
            </div>
            <div className="flex space-x-4 text-sm">
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                aybhubsupport@gmail.com
              </a>
             
            </div>
          </div>
        </div>
      </div>
    </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
  <div className="flex flex-col items-center w-full mb-4">
    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl px-1 py-2 w-18 h-20 flex flex-col items-center justify-center">
      <img src={logo} className='w-15 h-15' />
    </div>
  </div>
  <p className="text-gray-600 text-center mb-6 max-w-xl">
    AYB HUB is built with passion and dedication. If you love our platform and want to help us grow, consider making a contribution.<br />
    <span className="text-blue-800 font-extralight">Your support keeps us innovating and delivering more value to you! 💙</span>
  </p>
  
  {/* Donation Amount Selection */}
  <div className="w-full max-w-sm mb-4">
    <div className="flex gap-2 mb-3">
      {[5, 10, 25, 50].map(amount => (
        <button
          key={amount}
          onClick={() => setDonationAmount(amount)}
          className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all ${
            donationAmount === amount 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          ${amount}
        </button>
      ))}
    </div>
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">$</span>
      <input
        type="number"
        placeholder="Custom amount"
        value={donationAmount}
        min="1"
        max="10000"
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-center"
        onChange={(e) => setDonationAmount(parseInt(e.target.value) || 5)}
      />
      <span className="text-sm text-gray-600">USD</span>
    </div>
  </div>
  
  {/* PayPal Buttons Container */}
  <div ref={paypalRef} className="w-full max-w-sm " />
  
  {/* Alternative Donation Methods */}
  <div className="w-full max-w-sm flex flex-col items-center justify-center ">
    <button
      onClick={handleAlternativeDonation}
      className="w-full flex flex-col py-3 items-center justify-center rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600 cursor-pointer font-semibold shadow-lg transition-all duration-300 hover:scale-102 hover:shadow-xl"
    >
       <img
      src={paypal}
      alt="Paypal"
      
      className="w-30 drop-shadow-lg"
    />     
    </button>
    
  
  </div>
  
  <span className="mt-4 text-xs text-gray-400 text-center w-full">
    Every contribution helps us keep AYB HUB free and awesome for everyone.<br />
  </span>
</div>


                {/* Final section to test bottom visibility */}
               <div className="mb-30">
                 <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Account Management</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <h4 className="font-semibold text-red-900 mb-2">Danger Zone</h4>
                      <p className="text-sm text-red-600 mb-3">Permanently delete your account and all data</p>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors" onClick={openDeleteVerification}>
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
               </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteVerification && (
  <div className="fixed inset-0 z-[10003] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
    <div className="bg-white rounded-2xl shadow-2xl p-6  w-[350px] ">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Verify Deletion</h3>
        </div>
      </div>
      <p className="text-gray-700 mb-2">
        To confirm, please type the code below:
      </p>
      <div className="mb-4">
        <div className="font-mono text-lg bg-gray-100 px-4 py-2 rounded text-center tracking-widest select-none">
          {deleteCode}
        </div>
      </div>
      <input
        type="text"
        value={inputCode}
        onChange={e => setInputCode(e.target.value.toUpperCase())}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
        placeholder="Enter the code above"
      />
      <div className="flex flex-col items-start justify-center w-full">
             <ReCAPTCHA 
sitekey='6LekZ5ArAAAAAMuRGRFt41wZUICHi3N0HivVjMmL'
onChange={() => setCaptchaVerified(true)}
  onExpired={() => setCaptchaVerified(false)}
  className="mb-4 "
/>
      </div>
 
      <div className="flex space-x-3 mt-4">
        <button
          onClick={() => setShowDeleteVerification(false)}
          className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
        >
          Cancel
        </button>
       <button
  onClick={() => {
    if (inputCode === deleteCode && captchaVerified) {
      setShowDeleteVerification(false);
      setentireDelete(true);
    } else if (!captchaVerified) {
      alert("Please complete the CAPTCHA.");
    } else {
      alert("Verification failed. Please enter the correct code.");
    }
  }}
  className={`flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-medium flex items-center justify-center`}
  disabled={!captchaVerified || inputCode !== deleteCode}
>
  Verify
</button>
      </div>
    </div>
  </div>
)}

     {showInviteModal && (
  <div className="fixed inset-0 bg-black/30 backdrop-blur-sm animate-fade-in flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">Send Invitation</h3>
        <button
          onClick={() => setShowInviteModal(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Error Modal at the top of the modal */}
      {emailError && (
        <div className="animate-fade-in mb-4 w-full bg-red-600 text-white px-4 py-2 rounded-xl flex items-center justify-between z-10">
          <span>Invalid email address</span>
          <button
            className="ml-2 text-white"
            onClick={() => setEmailError(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="email"
              value={formData.inviteEmail}
              onChange={(e) => {
                setFormData({ ...formData, inviteEmail: e.target.value });
                setEmailError(false);
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent"
              placeholder="john.doe@company.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Title/Role
          </label>
          <input
            type="text"
            value={formData.inviteRole}
            onChange={(e) => setFormData({ ...formData, inviteRole: e.target.value })}
            className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent"
            placeholder="e.g., Developer, Designer"
            required
          />
        </div>

        <button
          type="button"
          onClick={() => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.inviteEmail)) {
              setEmailError(true);
              return;
            }
            handleInviteSubmit();
          }}
          className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 ${formData.inviteEmail && formData.inviteRole ? "hover:shadow-lg bg-gradient-to-r from-green-600 to-green-700 cursor-pointer animate-fade-in" : ""}
`}
          disabled={
            !formData.inviteEmail ||
            !formData.inviteRole 
          }
        >
          {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          Sending...
        </span>
      ) : "Send Invitation"}
             
        </button>
      </div>
    </div>
  </div>
)}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 px-6 py-4 rounded-xl shadow-lg z-50 ${
          toast.type === 'success'
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center">
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <X className="w-5 h-5 mr-2" />
            )}
            {toast.message}
          </div>
        </div>
      )}
      {confirmationModal && deletedUser && (
              <div className="fixed inset-0 z-[10003] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-2">
                    Are you sure you want to delete <span className="font-semibold">{deletedUser.firstName+' '+deletedUser.lastName}</span> From Your Team?
                  </p>
                  
                  <div className="flex space-x-3 mt-6">
                    <button 
                      onClick={() => setConfiramtionModal(false)}
                      className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => {deleteFromEntreprise(deletedUser)}}
                      className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-medium flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                           {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          Deleting...
        </span>
      ) : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {entireDelete  && (
              <div className="fixed inset-0 z-[10003] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Destroy Your Account</h3>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-2">
                    Are you sure you want to delete Your Account Entirely  From AYB HUB?
                  </p>
                  
                  <div className="flex space-x-3 mt-6">
                    <button 
                      onClick={() => setentireDelete(false)}
                      className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={deleteFromSaas}
                      className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-medium flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                           {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          Deleting...
        </span>
      ) : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            )}
      {showSuccessModal && (
              <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Success!</h3>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">{successMessage}</p>
                  <button 
                    onClick={() => setshowSuccessModal(false)}
                    className="w-full px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                  >
                    OK
                  </button>
                </div>
              </div>
            )}
    </div>
    
  );
};

export default WorkerSetting;