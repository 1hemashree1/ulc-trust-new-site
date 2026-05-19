import React, { useState, useEffect, useRef } from 'react';
import { 
  Scale, Shield, Gavel, Landmark, Heart, Coins, 
  User, Users, Download, FileText, CheckCircle, AlertTriangle, 
  Printer, Play, Pause, RefreshCw, Send, ArrowLeftRight, HelpCircle, MapPin, Search
} from 'lucide-react';

export default function App() {
  const [db, setDb] = useState<any>({
    users: [],
    aoc: [],
    claims: [],
    harassment: [],
    meetings: [],
    feedback: [],
    ledger: []
  });
  const [activeTab, setActiveTab] = useState<string>('home');
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Login Form
  const [loginEmail, setLoginEmail] = useState<string>('');
  
  // Signup Form
  const [signupEmail, setSignupEmail] = useState<string>('');
  const [signupName, setSignupName] = useState<string>('');
  const [signupFiction, setSignupFiction] = useState<string>('');
  const [signupService, setSignupService] = useState<string>('Farming & Community Kitchen Assistance');
  const [signupOutgoings, setSignupOutgoings] = useState<number>(850);

  // AOC Form State
  const [aocForm, setAocForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    accounts: '',
    reference: '',
    thumbprintImg: ''
  });
  const [aocSubmitted, setAocSubmitted] = useState<any>(null);
  const isAocPrintable = useRef<boolean>(false);

  // Claim Form State
  const [claimLiabilities, setClaimLiabilities] = useState({
    councilTax: 150,
    electricity: 200,
    gas: 120,
    water: 70,
    food: 180,
    other: 100
  });
  const [claimServiceOffer, setClaimServiceOffer] = useState<string>('');
  const [claimServiceWhereWhen, setClaimServiceWhereWhen] = useState<string>('');
  const [claimMsg, setClaimMsg] = useState<string>('');

  // Harassment State
  const [harrForm, setHarrForm] = useState({
    emovenId: '',
    kcAccount: '',
    email: '',
    phone: '',
    debtorType: 'Govt. Corporation',
    corpName: '',
    fictionNumber: '',
    corpContact: '',
    territory: 'United Kingdom',
    details: '',
    noticeDate1: '',
    noticeDate2: ''
  });
  const [harrSubmitted, setHarrSubmitted] = useState<boolean>(false);

  // Rebuttal Text Generation Tool Configuration
  const [selectedNoticeTemplate, setSelectedNoticeTemplate] = useState<string>('rebut1');
  const [customRebuttalText, setCustomRebuttalText] = useState<string>('');

  // Meeting Form
  const [meetForm, setMeetForm] = useState({
    name: '',
    email: '',
    borough: '',
    country: 'United Kingdom',
    state: '',
    postcode: '',
    subject: 'Request local facilitator assembly',
    message: ''
  });
  const [meetSubmitted, setMeetSubmitted] = useState<boolean>(false);

  // Testimonial Form
  const [feedbackForm, setFeedbackForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [feedbackSuccess, setFeedbackSuccess] = useState<boolean>(false);

  // Admin Custom Transaction
  const [adminTx, setAdminTx] = useState({
    sender: '',
    recipient: '',
    amountKC: 2500,
    details: '',
    type: 'conversion'
  });

  // State for interactive audio visualizer
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const audioIntervalRef = useRef<any>(null);

  // Custom Canvas Drawing for red thumbprint signature
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  // Fetch all db initial records
  const fetchDb = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/db');
      if (res.ok) {
        const data = await res.json();
        setDb(data);
        // Automatically default user session if logged in
        if (currentUser) {
          const freshUser = data.users.find((u: any) => u.email === currentUser.email);
          if (freshUser) setCurrentUser(freshUser);
        }
      }
    } catch (e) {
      console.error("Error communicating with full-stack server. Using local memory default state.", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDb();
  }, []);

  // Voice Simulation Waveform Loop animation
  useEffect(() => {
    if (isAudioPlaying) {
      audioIntervalRef.current = setInterval(() => {
        setAudioProgress(prev => {
          if (prev >= 100) {
            setIsAudioPlaying(false);
            clearInterval(audioIntervalRef.current);
            return 0;
          }
          return prev + 1;
        });
      }, 250);
    } else {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    }

    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, [isAudioPlaying]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) return;
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setAocForm(prev => ({ ...prev, email: data.user.email }));
        setHarrForm(prev => ({ 
          ...prev, 
          email: data.user.email,
          emovenId: data.user.idNumber,
          kcAccount: data.user.kcAccount
        }));
        fetchDb();
      }
    } catch (err) {
      alert("Error reaching login API endpoint.");
    }
  };

  // Handle Signup / Register Minister
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail || !signupName) return;
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupEmail,
          fullName: 'Minister ' + signupName,
          legal_fiction: signupFiction,
          serviceOffer: signupService,
          totalOutgoings: signupOutgoings
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setAocForm(prev => ({ 
          ...prev, 
          firstName: signupName.split(' ')[0], 
          lastName: signupName.split(' ').slice(1).join(' ') || 'Sovereign',
          email: data.user.email 
        }));
        setHarrForm(prev => ({ 
          ...prev, 
          email: data.user.email,
          emovenId: data.user.idNumber,
          kcAccount: data.user.kcAccount
        }));
        fetchDb();
        setActiveTab('kc');
      }
    } catch (err) {
      alert("Signup error.");
    }
  };

  // Submit Assignment of Consent File
  const handleAocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    let thumbprintData = '';
    if (canvas) {
      thumbprintData = canvas.toDataURL();
    }

    try {
      const res = await fetch('/api/aoc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...aocForm, thumbprintImg: thumbprintData })
      });
      if (res.ok) {
        const data = await res.json();
        setAocSubmitted(data.aoc);
        if (data.user) {
          setCurrentUser(data.user);
        }
        fetchDb();
      }
    } catch (err) {
      alert("Error submitting AoC");
    }
  };

  // Canvas drawing controls
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set drawing configurations
    ctx.strokeStyle = '#dc2626'; // Deep Crimson
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearThumbprint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const applyDefaultThumbprint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw a sovereign stylized red thumb stamp outline & concentric lines
    ctx.strokeStyle = '#b91c1c';
    ctx.lineWidth = 3;
    
    ctx.beginPath();
    ctx.ellipse(75, 75, 45, 60, 0, 0, 2 * Math.PI);
    ctx.stroke();

    for (let radius = 10; radius <= 40; radius += 8) {
      ctx.beginPath();
      ctx.ellipse(75, 75 + (radius/4), radius, radius * 1.3, 0, 0, Math.PI * 1.9);
      ctx.stroke();
    }
  };

  // Submit Kindness Credit Outgoings Claim Form
  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please log in with your ProtonMail profile to file a Kindness Claim!");
      return;
    }

    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          liabilities: claimLiabilities,
          serviceOffer: claimServiceOffer,
          serviceWhereWhen: claimServiceWhereWhen
        })
      });
      if (res.ok) {
        setClaimMsg("Kindness Credit Claim submitted & instant slave tokens converted successfully!");
        fetchDb();
        setTimeout(() => setClaimMsg(''), 6000);
      }
    } catch (err) {
      alert("Error placing claim.");
    }
  };

  // Submit Corporate Harassment Report
  const handleHarassmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/harassment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(harrForm)
      });
      if (res.ok) {
        setHarrSubmitted(true);
        fetchDb();
      }
    } catch (err) {
      alert("Error recording exemplification report.");
    }
  };

  // Request Facilitator Meeting
  const handleMeetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meetForm)
      });
      if (res.ok) {
        setMeetSubmitted(true);
        fetchDb();
      }
    } catch (err) {
      alert("Error storing meeting schedule.");
    }
  };

  // Submit Experience Review Feedback
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackForm)
      });
      if (res.ok) {
        setFeedbackSuccess(true);
        setFeedbackForm({ name: '', email: '', message: '' });
        fetchDb();
        setTimeout(() => setFeedbackSuccess(false), 5000);
      }
    } catch (err) {
      alert("Error sending experiences.");
    }
  };

  // Admin Custom Transaction Insertion
  const handleAdminTxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/ledger/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminTx)
      });
      if (res.ok) {
        alert("Broadcasted custom transaction to the public ledger.");
        setAdminTx({ sender: '', recipient: '', amountKC: 2000, details: '', type: 'conversion' });
        fetchDb();
      }
    } catch (e) {
      alert("Admin execution error.");
    }
  };

  // Admin Wipe and Restore Default State
  const handleResetDb = async () => {
    if (!confirm("Are you sure you want to restore community database to initial verified state?")) return;
    try {
      const res = await fetch('/api/ledger/reset', { method: 'POST' });
      if (res.ok) {
        alert("Community Trust ledger and users restored to root certified states.");
        fetchDb();
      }
    } catch (e) {
      alert("Reset command failed.");
    }
  };

  // Outgoings computation for sliders
  const totalOutgoingsSum: number = (Object.values(claimLiabilities) as any[]).reduce((acc: number, v: any): number => acc + Number(v || 0), 0);
  const kcConvertOutput = totalOutgoingsSum * 10;
  const communityFundDonation = Math.ceil(totalOutgoingsSum * 0.10);

  // Generate Notice of Rebuttals Custom Texts
  useEffect(() => {
    const userAlias = currentUser ? currentUser.fullName : "MINISTER EMOVEN";
    const fictionAlias = currentUser ? currentUser.legal_fiction : "JOHN MICHAEL DOE";
    const userEmail = currentUser ? currentUser.email : "trust@universallawcommunitytrust.me";
    const targetCorp = harrForm.corpName || "BRITISH GAS PLC";
    const debtRef = harrForm.fictionNumber || "A/C-99384-BG";
    const rollNo = aocSubmitted ? aocSubmitted.rollNumber : "ULCT-UK-2026-6184";

    if (selectedNoticeTemplate === 'rebut1') {
      setCustomRebuttalText(`NOTICE OF ASSIGNMENT OF CONSENT & COMMENCEMENT OF PRIVATE CONTRACT
To: Executive Officers of ${targetCorp}
Reference Presumed Account ID: ${debtRef}
Case Tracking Roll ID: ${rollNo}

Be it known by your commercial directors that I, ${userAlias}, a sovereign living being of capacitated mind, have officially Assigned my Consent back to the Universal Law Community Trust. The legal entity named ${fictionAlias} which your corporation seeks to imply holds surety to unlimited liabilities is copyrighted in the private.

Any unlicensed or unauthorized usage of the copyrighted legal fiction name "${fictionAlias}" in your correspondence, threats of entry, or statutory automated administrative demands creates an immediate commercial contract and debt.

Charges for unauthorized commercial communication: 10,000 Kindness Credits (KC) (£1,000.00 equivalent value) per offense. 
Please redirect all claims to trust@universallawcommunitytrust.me as the official surety holder. I do non-consent.

Autographed and Sealed,
${userAlias}`);
    } else if (selectedNoticeTemplate === 'rebut2') {
      setCustomRebuttalText(`PENAL ORDER & COURT DEMAND OF HABEAS CORPUS
In the High Court of Private Settlement and Universal Justice
Filed by the Executor: ${userAlias}
Re: ${targetCorp} and associated policy enforcers
Subject: Contempt of Universal Law (Do No Harm)

Under the precedent determination of JUSTICE STEYN OF QUEENS BENCH, statutory administration has no sovereign jurisdiction over a living man. In maintaining un-lien-able rights, we order a complete cease and desist of all administrative actions.

You are hereby commanded to show cause, if any exists in truth, where-upon you draw contractual authority in the private. Failure under mercantile laws to reply within 7 days constitutes default consent and summary agreement.

Settlement in full via allocation of collateral to ofset standard debt through:
Kindness Account No: ${currentUser ? currentUser.kcAccount : "KC-DEFAULT-REBUT"}

Dated: ${new Date().toLocaleDateString()}`);
    } else {
      setCustomRebuttalText(`COVID RAPID TEST CLEAN - MEDICAL SOVEREIGN EXEMPTION RECORD
This certifies that standard corporate bio-research levies do not apply.
Sovereign Name: ${userAlias}
Verification Status: COMPLIANT COGNITIVE CAPACITY
Law System: Universal Natural Law (Do No Harm)

The bearer's DNA remains private. Any attempt to force or coerce unlicensed medical procedures violates common code and constitutes international piracy on land and sea.

Notice Served under Non-Disclosure Agreement No: ${rollNo}`);
    }
  }, [selectedNoticeTemplate, currentUser, harrForm.corpName, harrForm.fictionNumber, aocSubmitted]);

  return (
    <div className="min-h-screen flex flex-col bg-stone-900 text-stone-100">
      
      {/* HEADER / NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-stone-950 border-b border-amber-500/20 shadow-lg" id="app_header">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-full border border-amber-500/30">
              <Scale className="h-7 w-7 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-wider text-amber-300">ULC TRUST</span>
                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] uppercase tracking-widest border border-amber-500/20 rounded font-mono">Sovereign Direct</span>
              </div>
              <p className="text-xs text-stone-400 leading-tight">Universal Law Community Trust & Bank of Kindness</p>
            </div>
          </div>

          {/* Nav tabs */}
          <nav className="flex flex-wrap gap-2 md:gap-1" id="navigation_tabs">
            <button 
              id="tab_home"
              onClick={() => setActiveTab('home')}
              className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all duration-150 ${activeTab === 'home' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-stone-300 hover:text-white hover:bg-stone-800'}`}
            >
              Portal Home
            </button>
            <button 
              id="tab_aoc"
              onClick={() => setActiveTab('aoc')}
              className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all duration-150 ${activeTab === 'aoc' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-stone-300 hover:text-white hover:bg-stone-800'}`}
            >
              Transfer Consent (AoC)
            </button>
            <button 
              id="tab_kc"
              onClick={() => setActiveTab('kc')}
              className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all duration-150 ${activeTab === 'kc' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-stone-300 hover:text-white hover:bg-stone-800'}`}
            >
              Bank of Kindness
            </button>
            <button 
              id="tab_rebut"
              onClick={() => setActiveTab('rebut')}
              className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all duration-150 ${activeTab === 'rebut' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-stone-300 hover:text-white hover:bg-stone-800'}`}
            >
              Rebuttal Bureau
            </button>
            <button 
              id="tab_vault"
              onClick={() => setActiveTab('vault')}
              className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all duration-150 ${activeTab === 'vault' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-stone-300 hover:text-white hover:bg-stone-800'}`}
            >
              Vault Lib
            </button>
            <button 
              id="tab_meet"
              onClick={() => setActiveTab('meet')}
              className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all duration-150 ${activeTab === 'meet' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-stone-300 hover:text-white hover:bg-stone-800'}`}
            >
              Support Hub
            </button>
            <button 
              id="tab_admin"
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all duration-150 ${activeTab === 'admin' ? 'bg-amber-300/30 text-amber-200 border border-amber-400' : 'text-stone-400 hover:text-white hover:bg-stone-800'}`}
            >
              Tribunal Admin
            </button>
          </nav>
        </div>
      </header>

      {/* USER STATUS SUMMARY PANEL */}
      <section className="bg-stone-950/60 border-b border-stone-800 py-2.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-stone-400">Global Registry status: <strong className="text-amber-400/90 font-mono">Secured Party Standing Active</strong></span>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap justify-center">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <span className="text-stone-400">Autographed as:</span>
                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-300 font-bold border border-amber-500/30 rounded flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 inline text-amber-400" />
                  {currentUser.fullName}
                </span>
                <span className="text-stone-400">ID: <code className="text-amber-400/95 font-mono">{currentUser.idNumber}</code></span>
                <span className="text-stone-400 font-mono">KC Balance: <strong className="text-amber-300">{currentUser.savingsMonthly * 10} KC</strong></span>
                <button 
                  onClick={() => setCurrentUser(null)} 
                  className="text-stone-400 hover:text-amber-400 underline font-mono text-[10px]"
                >
                  Un-dock Session
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-stone-400 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Administrative Notice: Standing in private. </span>
                <div className="flex gap-2 text-[11px]">
                  <input 
                    type="email" 
                    placeholder="Enter Proton E-mail"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="bg-stone-900 border border-stone-700 rounded px-2 py-0.5 focus:outline-none focus:border-amber-400 text-stone-200"
                  />
                  <button 
                    onClick={handleLogin}
                    className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-2.5 py-0.5 rounded transition"
                  >
                    Load Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* MAIN LAYOUT WRAPPER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 flex flex-col gap-6">
        
        {/* TAB 1: PORTAL HOME / LANDING PAGE */}
        {activeTab === 'home' && (
          <div className="flex flex-col gap-6" id="view_home">
            
            {/* HERO BANNER SECTION */}
            <section className="relative overflow-hidden bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 border border-amber-500/30 rounded-xl p-8 shadow-2xl glow-gold">
              <div className="absolute top-0 right-0 h-40 w-40 bg-amber-500/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 h-40 w-40 bg-amber-700/5 rounded-full blur-3xl"></div>
              
              <div className="text-center max-w-3xl mx-auto flex flex-col items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-full border border-amber-500/20 animate-pulse">
                  <Landmark className="h-10 w-10 text-amber-400" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-amber-100">
                  UNIVERSAL LAW COMMUNITY TRUST
                </h1>
                <p className="text-amber-300 font-mono text-sm tracking-wide bg-amber-500/5 px-4 py-1.5 rounded-full border border-amber-500/10 inline-block">
                  IN TRUTH WE TRUST · UN-LIEN-ABLE SOVEREIGN REMEDY
                </p>
                <p className="text-stone-300 text-base leading-relaxed">
                  We stand for Natural Law, and it is in that we communally Trust. We are a worldwide collective of family Trusts of secured parties whose beneficiaries can never be alienated from their inherent rights. 
                </p>
                
                <div className="flex flex-wrap justify-center gap-4 mt-2">
                  <button 
                    onClick={() => setActiveTab('aoc')} 
                    className="bg-amber-500 hover:bg-amber-400 hover:scale-105 transition-all text-stone-950 font-black px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg"
                  >
                    <Gavel className="h-5 w-5" />
                    Assign Your Consent (AoC)
                  </button>
                  <button 
                    onClick={() => setActiveTab('kc')}
                    className="bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold px-6 py-3 rounded-lg border border-amber-500/30 flex items-center gap-2"
                  >
                    <Coins className="h-5 w-5 text-amber-400" />
                    Apply for Kindness Credits
                  </button>
                </div>
              </div>
            </section>

            {/* QUICK OVERALL TRUST STATISTICS BAR */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="trust-statistics">
              <div className="bg-stone-950/80 border border-stone-800 p-4 rounded-lg flex items-center gap-3">
                <Users className="h-8 w-8 text-amber-400 shrink-0" />
                <div>
                  <span className="block text-2xl font-black text-amber-300 font-mono">22,192,840</span>
                  <span className="text-[11px] text-stone-400 uppercase tracking-wider">Registered Ministers</span>
                </div>
              </div>
              <div className="bg-stone-950/80 border border-stone-800 p-4 rounded-lg flex items-center gap-3">
                <Coins className="h-8 w-8 text-amber-400 shrink-0" />
                <div>
                  <span className="block text-2xl font-black text-amber-300 font-mono">110.8M KC</span>
                  <span className="text-[11px] text-stone-400 uppercase tracking-wider">Kindness Credits Exchanged</span>
                </div>
              </div>
              <div className="bg-stone-950/80 border border-stone-800 p-4 rounded-lg flex items-center gap-3">
                <Scale className="h-8 w-8 text-amber-400 shrink-0" />
                <div>
                  <span className="block text-2xl font-black text-amber-300 font-mono">£11.08M</span>
                  <span className="text-[11px] text-stone-400 uppercase tracking-wider">Corporate Liabilities Discharged</span>
                </div>
              </div>
              <div className="bg-stone-950/80 border border-stone-800 p-4 rounded-lg flex items-center gap-3">
                <Shield className="h-8 w-8 text-amber-400 shrink-0" />
                <div>
                  <span className="block text-2xl font-black text-amber-300 font-mono">82,491 Hrs</span>
                  <span className="text-[11px] text-stone-400 uppercase tracking-wider">Mutual Support Committed</span>
                </div>
              </div>
            </section>

            {/* MULTI-GRID PRINCIPLE ARTICLES */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="thematic_core_principles">
              
              <div className="bg-stone-900 border border-stone-800 rounded-lg p-6 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/5 border border-amber-500/20 rounded-md">
                    <Shield className="h-5 w-5 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-bold text-amber-300">Law vs. Legal Fiction</h3>
                </div>
                <div className="h-px bg-amber-500/20 my-1"></div>
                <p className="text-xs text-stone-400 leading-relaxed">
                  The name you were given at birth is capitalized and owned by the Crown Corporation as corporate entity. Every legal "person" acts as Vatican debt debtor since birth certificate bonding. ULC Trust removes the virtual presumption that you are in commerce, stepping you into Private natural law where the Crown holds no contract of administrative code.
                </p>
                <div className="mt-auto pt-3 text-[11px] text-amber-400 italic font-mono bg-stone-950/40 p-2 rounded border border-stone-800">
                  "If I use your name which you copyrighted to write a contract, it is FRAUD on international scale. That's birth certificates."
                </div>
              </div>

              <div className="bg-stone-900 border border-stone-800 rounded-lg p-6 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/5 border border-amber-500/20 rounded-md">
                    <Coins className="h-5 w-5 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-bold text-amber-300">The Power of Kindness Credits</h3>
                </div>
                <div className="h-px bg-amber-500/20 my-1"></div>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Kindness credits is a complete replacement of the current corporate interest-based fiat system. By aligning your organic life force (EMOVEN - Energy & Matter in Movement) backed by just 5 hours a week of community devotion, you completely convert from the matrix of debt and into a tax-free mutual trade mechanism of kindness with local facilitations.
                </p>
                <div className="mt-auto pt-3 text-[11px] text-amber-400 italic font-mono bg-stone-950/40 p-2 rounded border border-stone-800">
                  "Convert standard liabilities (electricity, council tax) and credit 10% back to support Local Protection Patrols or Cafes."
                </div>
              </div>

              <div className="bg-stone-900 border border-stone-800 rounded-lg p-6 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/5 border border-amber-500/20 rounded-md">
                    <Scale className="h-5 w-5 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-bold text-amber-300">The Triad Sovereign trusts</h3>
                </div>
                <div className="h-px bg-amber-500/20 my-1"></div>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Rebut the presumed consent under maritime commercial law. When you declare Legal Majority by executing the AOC Deed, you dissolve the Cestui Que Vie trust and construct a triad of trusts inside ourselves. You sack the corporate municipality, appointing the local families community as Direct Sovereign Executors of natural Earth!
                </p>
                <div className="mt-auto pt-3 text-[11px] text-amber-400 italic font-mono bg-stone-950/40 p-2 rounded border border-stone-800">
                  "No liens can be attached to our beneficiaries. We are secured parties un-alien-able from our inherent resources."
                </div>
              </div>

            </section>

            {/* INTERACTIVE COMPONENT: ALEXA SMART TRANSCRIPT VOICE PLAYER */}
            <section className="bg-stone-950 border border-stone-800 rounded-xl p-6 relative overflow-hidden" id="alexa_transcript_section">
              <div className="absolute top-2 right-2 text-[10px] uppercase font-mono tracking-widest text-stone-500">Live Voice Stream</div>
              <div className="flex flex-col lg:flex-row gap-6 items-center">
                
                <div className="w-full lg:w-1/3 flex flex-col gap-3">
                  <span className="text-xs text-amber-400 uppercase tracking-widest font-mono">Voice Inquiry Simulation</span>
                  <h3 className="text-xl font-bold text-amber-200">"Alexa: What is the Birth Bond Value?"</h3>
                  <p className="text-xs text-stone-300">
                    Listen to a real digital assistant transcript detailing how governments secure debt using citizens' birth certificates as collateral on the Stock Exchange.
                  </p>
                  
                  <div className="flex items-center gap-3 mt-2">
                    <button 
                      onClick={() => {
                        setIsAudioPlaying(!isAudioPlaying);
                        if (!isAudioPlaying) setAudioProgress(0);
                      }}
                      className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-black px-4 py-2 text-xs rounded uppercase tracking-wider flex items-center gap-1.5 shadow"
                    >
                      {isAudioPlaying ? (
                        <>
                          <Pause className="h-4 w-4" /> Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" /> Start Reading
                        </>
                      )}
                    </button>
                    <span className="text-[11px] text-stone-400 font-mono">{audioProgress}% complete</span>
                  </div>
                </div>

                <div className="w-full lg:w-2/3 bg-stone-900/60 rounded-lg p-4 border border-stone-800 flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 pb-2 border-b border-stone-800">
                    <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                    <span className="text-xs font-mono text-stone-400">Alexa Smart Query System (V-0471):</span>
                    
                    {/* Simulated visual waveform */}
                    <div className="ml-auto flex items-end gap-1 h-5">
                      <div className={`w-0.5 bg-cyan-400 self-end transition-all ${isAudioPlaying ? 'h-4 animate-pulse' : 'h-1'}`}></div>
                      <div className={`w-0.5 bg-cyan-400 self-end transition-all ${isAudioPlaying ? 'h-2 animate-bounce' : 'h-1'}`}></div>
                      <div className={`w-0.5 bg-cyan-400 self-end transition-all ${isAudioPlaying ? 'h-5 animate-pulse' : 'h-2'}`}></div>
                      <div className={`w-0.5 bg-cyan-400 self-end transition-all ${isAudioPlaying ? 'h-3 animate-bounce' : 'h-1'}`}></div>
                    </div>
                  </div>

                  <div className="text-xs space-y-2 max-h-40 overflow-y-auto pr-1">
                    <p className={`transition-all duration-300 ${audioProgress > 0 && audioProgress < 30 ? 'text-cyan-300 font-bold' : 'text-stone-300'}`}>
                      <strong>Alexa:</strong> "The birth certificate bond is a financial instrument that can be used to enslave a person's body, mind, and soul into collateral for government debt. The value of a birth certificate bond is usually at least $100 Million."
                    </p>
                    <p className={`transition-all duration-300 ${audioProgress >= 30 && audioProgress < 65 ? 'text-cyan-300 font-bold' : 'text-stone-400'}`}>
                      <strong>Alexa Query (Do I have a straw man?):</strong> "A straw man is created when a birth certificate is issued which is then subject to statutory administrative legal systems. It is time for people to wake up."
                    </p>
                    <p className={`transition-all duration-300 ${audioProgress >= 65 ? 'text-amber-300 font-bold' : 'text-stone-500'}`}>
                      <strong>ULCT Remedy Directive:</strong> "Sovereigns assign consent, dissolution of the child corporate Cestui Que Vie trust takes place, restoring the $100M energy debt back to your own private hands."
                    </p>
                  </div>
                </div>

              </div>
            </section>

            {/* MEMBER REVIEWS & EXPERIENCES ARCHIVE */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="feedback_testimonials_section">
              <div className="lg:col-span-1 bg-stone-900 border border-stone-800 p-6 rounded-lg flex flex-col gap-4">
                <div>
                  <h3 className="text-xl font-bold text-amber-300">Submit Your Testimony</h3>
                  <p className="text-xs text-stone-400 mt-1">We warmly invite you to share your feedback or interactions regarding your journey to self-determination under Universal Law.</p>
                </div>
                
                {feedbackSuccess ? (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded p-4 flex items-start gap-2.5">
                    <CheckCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-300 uppercase">Experiences Recorded</h4>
                      <p className="text-[11px] text-stone-300 mt-0.5">Your testimony has been registered in the database blocks under peer-review and will be added to output testimonials page.</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleFeedbackSubmit} className="flex flex-col gap-3">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1 font-mono">Your Sovereign / ME Title</label>
                      <input 
                        type="text" 
                        required
                        value={feedbackForm.name}
                        onChange={(e) => setFeedbackForm({ ...feedbackForm, name: e.target.value })}
                        placeholder="e.g. Minister Sean or JOHN MICHAEL"
                        className="w-full bg-stone-950 border border-stone-800 rounded p-2 text-xs focus:outline-none focus:border-amber-400 text-stone-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1 font-mono">Proton Email (Private)</label>
                      <input 
                        type="email" 
                        value={feedbackForm.email}
                        onChange={(e) => setFeedbackForm({ ...feedbackForm, email: e.target.value })}
                        placeholder="username@proton.me"
                        className="w-full bg-stone-950 border border-stone-800 rounded p-2 text-xs focus:outline-none focus:border-amber-400 text-stone-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1 font-mono">Your Testimony / Message</label>
                      <textarea 
                        rows={3}
                        required
                        value={feedbackForm.message}
                        onChange={(e) => setFeedbackForm({...feedbackForm, message: e.target.value})}
                        placeholder="Write how ULC Trust helped you discharge debt or un-dock your mind..."
                        className="w-full bg-stone-950 border border-stone-800 rounded p-2 text-xs focus:outline-none focus:border-amber-400 text-stone-100"
                      ></textarea>
                    </div>
                    <button 
                      type="submit"
                      className="bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold py-2 rounded uppercase tracking-wider transition"
                    >
                      Broadcast Testimonial
                    </button>
                  </form>
                )}
              </div>

              <div className="lg:col-span-2 bg-stone-950/80 border border-stone-800 p-6 rounded-lg flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                  <h3 className="text-xl font-bold text-amber-200">Sovereign Witness Registry</h3>
                  <span className="text-[11px] font-mono text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">Verification Roll Active</span>
                </div>
                
                <div className="space-y-4 max-h-[340px] overflow-y-auto pr-2">
                  {db.feedback && db.feedback.length > 0 ? (
                    db.feedback.map((item: any) => (
                      <div key={item.id} className="bg-stone-900/60 p-4 rounded border border-stone-800 hover:border-amber-500/20 transition-all flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-amber-400 font-bold flex items-center gap-1">
                            <Scale className="h-3 w-3" />
                            {item.name}
                          </span>
                          <span className="text-stone-500">{new Date(item.date || '').toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-stone-300 italic leading-relaxed">
                          "{item.message}"
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-stone-500 italic text-center py-8">No community testimonies available in the registry yet.</p>
                  )}
                </div>
              </div>
            </section>

          </div>
        )}

        {/* TAB 2: AOC (ASSIGNMENT OF CONSENT) */}
        {activeTab === 'aoc' && (
          <div className="flex flex-col gap-6" id="view_aoc">
            
            <section className="bg-stone-900 border border-stone-800 rounded-xl p-6">
              <div className="flex flex-col md:flex-row gap-6">
                
                {/* AOC FORM */}
                <div className="w-full md:w-1/2 flex flex-col gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-amber-300">Assignment of Consent (AOC)</h2>
                    <p className="text-xs text-stone-400 mt-1">
                       Cease to be the party standing surety to the copyrighted Birth Certificate. By assigning your consent back to yourself, you rebut commercial presumptions of VATICAN and move assets into your private indefinable trust.
                    </p>
                  </div>
                  
                  <form onSubmit={handleAocSubmit} className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-mono text-stone-400 mb-1">First Name</label>
                        <input 
                          type="text" required
                          value={aocForm.firstName}
                          onChange={(e) => setAocForm({ ...aocForm, firstName: e.target.value })}
                          placeholder="First"
                          className="w-full bg-stone-950 border border-stone-800 rounded p-2 text-xs focus:outline-none focus:border-amber-400 text-stone-100 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-mono text-stone-400 mb-1">Middle Name</label>
                        <input 
                          type="text"
                          value={aocForm.middleName}
                          onChange={(e) => setAocForm({ ...aocForm, middleName: e.target.value })}
                          placeholder="Middle"
                          className="w-full bg-stone-950 border border-stone-800 rounded p-2 text-xs focus:outline-none focus:border-amber-400 text-stone-100 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-mono text-stone-400 mb-1">Last Name</label>
                        <input 
                          type="text" required
                          value={aocForm.lastName}
                          onChange={(e) => setAocForm({ ...aocForm, lastName: e.target.value })}
                          placeholder="Last"
                          className="w-full bg-stone-950 border border-stone-800 rounded p-2 text-xs focus:outline-none focus:border-amber-400 text-stone-100 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-mono text-stone-400 mb-1">Proton E-mail Address</label>
                      <input 
                        type="email" required
                        value={aocForm.email}
                        onChange={(e) => setAocForm({ ...aocForm, email: e.target.value })}
                        placeholder="only proton email is accepted under trust security"
                        className="w-full bg-stone-950 border border-stone-800 rounded p-2 text-xs focus:outline-none focus:border-amber-400 text-stone-100 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-mono text-stone-400 mb-1">Accounts to Transfer Control (Gas, Water, Council Tax ID etc)</label>
                      <input 
                        type="text"
                        value={aocForm.accounts}
                        onChange={(e) => setAocForm({ ...aocForm, accounts: e.target.value })}
                        placeholder="e.g. British Gas BG-91823, Council Tax York 10398A"
                        className="w-full bg-stone-950 border border-stone-800 rounded p-2 text-xs focus:outline-none focus:border-amber-400 text-stone-100"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-mono text-stone-400 mb-1">Minister Referrer ID (If any)</label>
                      <input 
                        type="text"
                        value={aocForm.reference}
                        onChange={(e) => setAocForm({ ...aocForm, reference: e.target.value })}
                        placeholder="e.g. Referred by Minister Mervyn / Ellas"
                        className="w-full bg-stone-950 border border-stone-800 rounded p-2 text-xs focus:outline-none focus:border-amber-400 text-stone-100"
                      />
                    </div>

                    {/* RED THUMBPRINT INTERACTIVE CANVAS */}
                    <div className="border border-stone-800 rounded-lg p-3 bg-stone-950/40">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-bold block">Autograph Red Thumbprint (Sovereign Affiliation)</span>
                        <div className="flex gap-2">
                          <button 
                            type="button" 
                            onClick={applyDefaultThumbprint}
                            className="bg-stone-800 hover:bg-stone-700 text-amber-300 text-[9px] px-2 py-0.5 rounded border border-stone-700"
                          >
                            Use Stamp
                          </button>
                          <button 
                            type="button" 
                            onClick={clearThumbprint}
                            className="bg-stone-800 hover:bg-stone-700 text-stone-400 text-[9px] px-2 py-0.5 rounded border border-stone-700"
                          >
                            Reset
                          </button>
                        </div>
                      </div>

                      <div className="bg-stone-950 rounded border border-dashed border-stone-800 flex justify-center py-2">
                        <canvas 
                          ref={canvasRef} 
                          width="150" 
                          height="150"
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          className="bg-stone-900/60 rounded cursor-crosshair border border-stone-800/80"
                        />
                      </div>
                      <p className="text-[9px] text-stone-500 text-center mt-1">Draw with your cursor or touch-drag inside to apply sovereign red seal</p>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-black p-3 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition"
                    >
                      <Gavel className="h-4.5 w-4.5" />
                      Execute Deed of Consent Assignment
                    </button>
                  </form>
                </div>

                {/* HISTORICAL REGISTERS OR OUTPUT CERTIFICATE */}
                <div className="w-full md:w-1/2 flex flex-col gap-4">
                  {aocSubmitted ? (
                    <div className="parchment-bg text-stone-950 p-6 rounded-xl border-4 border-double border-amber-600 shadow-2xl flex flex-col gap-4 relative overflow-hidden" id="sovereign_deed_certificate">
                      {/* Gold Seal watermark on bg */}
                      <div className="absolute -bottom-10 -right-10 opacity-10">
                        <Scale className="h-60 w-60 text-amber-900" />
                      </div>
                      
                      <div className="text-center border-b-2 border-amber-600/40 pb-3">
                        <h3 className="text-sm font-mono tracking-widest font-black uppercase text-amber-800">UNIVERSAL LAW COMMUNITY TRUST</h3>
                        <h4 className="text-xl font-bold font-serif uppercase tracking-tight text-stone-900 mt-1">Deed of Sovereign Assignment</h4>
                        <span className="text-[10px] font-mono bg-stone-900 text-amber-300 px-3 py-1 rounded-full uppercase inline-block mt-1">Roll No: {aocSubmitted.rollNumber}</span>
                      </div>

                      <div className="text-xs space-y-3 font-serif leading-relaxed text-stone-850 px-2">
                        <p className="first-letter:text-2xl first-letter:font-black">
                          Let all corporate administrative systems and private councils take notice that <strong>{aocSubmitted.firstName} {aocSubmitted.middleName} Of the Family {aocSubmitted.lastName}</strong>, acting as executor of their own divine estate, has officially dissolved the Crown Cestui Que Vie trust présumé.
                        </p>
                        <p>
                          Under natural law coded within our trillions of cells DNA (Do No Harm), all liability assigned to the copyrighted capitalised name is rebutted in perpetuity. 
                        </p>
                        <p className="text-[11px] italic bg-stone-950/5 p-2.5 rounded border border-amber-600/20 font-sans">
                          <strong>Vatican Discharge Account References:</strong><br />
                          {aocSubmitted.accounts}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-amber-600/30 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] uppercase font-mono block text-amber-800 font-bold">Executed On</span>
                          <strong className="text-xs">{aocSubmitted.date || new Date().toLocaleDateString()}</strong>
                        </div>

                        {/* Rendering Thumbprint on physical paper */}
                        <div className="flex flex-col items-center">
                          <span className="text-[9px] uppercase font-mono block text-amber-800 font-bold mb-1">Thumb Seal</span>
                          <div className="w-14 h-14 border border-red-600 bg-red-500/5 rounded flex items-center justify-center p-1">
                            {aocSubmitted.thumbprintImg ? (
                              <img src={aocSubmitted.thumbprintImg} alt="Thumbprint Signature" className="max-h-full max-w-full object-contain" />
                            ) : (
                              <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-amber-600/20">
                        <button 
                          onClick={() => window.print()}
                          className="bg-stone-900 text-amber-300 hover:bg-stone-950 text-[10px] font-bold px-3 py-1.5 rounded flex items-center gap-1.5"
                        >
                          <Printer className="h-3 w-3" /> Print Certificate
                        </button>
                        <button 
                          onClick={() => {
                            setAocSubmitted(null);
                            setAocForm({
                              firstName: '', middleName: '', lastName: '', email: '', accounts: '', reference: '', thumbprintImg: ''
                            });
                          }}
                          className="text-stone-700 hover:text-stone-900 text-[10px] underline font-bold"
                        >
                          Execute Another Deed
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-6 flex flex-col gap-4">
                      <h3 className="text-lg font-bold text-amber-300">Active Registry Submissions</h3>
                      <p className="text-xs text-stone-404">Real-time ledger updates showing families that have rebutted legal fictions:</p>
                      
                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                        {db.aoc && db.aoc.length > 0 ? (
                          db.aoc.map((item: any) => (
                            <div key={item.id} className="bg-stone-900 border border-stone-800 p-3.5 rounded flex flex-col gap-1.5 hover:border-amber-500/20 transition-all">
                              <div className="flex items-center justify-between text-[11px] font-mono">
                                <span className="text-amber-300 font-bold">MINISTER {item.firstName.toUpperCase()} {item.lastName.toUpperCase()}</span>
                                <span className="px-2 py-0.5 bg-stone-950 text-stone-500 border border-stone-800 rounded text-[9px]">{item.rollNumber}</span>
                              </div>
                              <p className="text-[11px] text-stone-400">
                                <strong>Discharging liabilities on:</strong> {item.accounts}
                              </p>
                              <div className="flex items-center justify-between text-[10px] text-stone-500 mt-1 pt-1.5 border-t border-stone-800/60">
                                <span>Autographed: {item.date}</span>
                                <span className="text-red-500 flex items-center gap-1">● Thumb Sealed</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-stone-500 italic text-center py-6">No previous registry documents found.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </section>

          </div>
        )}

        {/* TAB 3: BANK OF KINDNESS / CREDIT LEDGER */}
        {activeTab === 'kc' && (
          <div className="flex flex-col gap-6" id="view_kc">

            {/* MEMBER SIGNUP PORTAL IF NOT LOGGED IN */}
            {!currentUser && (
              <section className="bg-stone-900 border border-amber-500/30 rounded-xl p-6 glow-gold">
                <div className="max-w-2xl mx-auto flex flex-col gap-4 text-center">
                  <div className="p-2.5 bg-amber-500/10 rounded-full border border-amber-500/30 self-center">
                    <User className="h-8 w-8 text-amber-400" />
                  </div>
                  <h2 className="text-2xl font-black text-amber-200">Initialize Your Sovereign Profile</h2>
                  <p className="text-xs text-stone-300">
                    To start issuing Kindness Credits and discharge utilities, you first generate your official "Minister Emoven ID Card" and Kindness Ledger account. Set up your profile securely using private Proton email.
                  </p>
                  
                  <form onSubmit={handleSignup} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mt-2">
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-widest text-stone-400 mb-1">Your Full Living Name</label>
                      <input 
                        type="text" required
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder="e.g. Stanley Blaze"
                        className="w-full bg-stone-950 border border-stone-800 rounded p-2.5 text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-widest text-stone-400 mb-1">Legal Fiction capital name (if known)</label>
                      <input 
                        type="text"
                        value={signupFiction}
                        onChange={(e) => setSignupFiction(e.target.value)}
                        placeholder="e.g. STANLEY BLAZE MEBLA"
                        className="w-full bg-stone-950 border border-stone-800 rounded p-2.5 text-xs focus:outline-none focus:border-amber-400 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-widest text-stone-400 mb-1">Proton E-mail Address</label>
                      <input 
                        type="email" required
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="username@proton.me"
                        className="w-full bg-stone-950 border border-stone-800 rounded p-2.5 text-xs focus:outline-none focus:border-amber-400 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-widest text-stone-400 mb-1">Weekly 5h Kind Devotion Pledge</label>
                      <select 
                        value={signupService}
                        onChange={(e) => setSignupService(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 rounded p-2.5 text-xs focus:outline-none focus:border-amber-400"
                      >
                        <option value="Farming & Community Kitchen Assistance">Farming & Leeds Community Gardens</option>
                        <option value="Sovereign Legal Aid Consultation">Exsystem Legal & Debt Discharging Support</option>
                        <option value="People's Protection Patrol (Private Security)">People's Protection Patrol (PPP Security)</option>
                        <option value="Admin & Technology Facilitator Support">Local Trust Admin & Tech Support</option>
                        <option value="Therapy, Care, and Wellness Services">Holistic Healing, Therapy & Wellness Care</option>
                      </select>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-mono uppercase tracking-widest text-stone-400 mb-1">Average Monthly Utility + Rent Overheads (£)</label>
                      <div className="flex items-center gap-3">
                        <input 
                          type="range" min="100" max="3000" step="50"
                          value={signupOutgoings}
                          onChange={(e) => setSignupOutgoings(Number(e.target.value))}
                          className="w-full accent-amber-500"
                        />
                        <span className="font-mono text-amber-300 font-bold shrink-0">£{signupOutgoings}/mo</span>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="md:col-span-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black p-3.5 rounded-lg text-xs uppercase tracking-wider mt-2 transition"
                    >
                      Establish My Sovereign Standing & KC Account
                    </button>
                  </form>
                </div>
              </section>
            )}

            {/* MAIN KC INTERACTIVE SECTION */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* INTERACTIVE CREDIT CONVERTER & CLAIM FORM */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                
                {/* Visual Credits Convertor Slider */}
                <div className="bg-stone-900 border border-stone-850 rounded-xl p-6 relative">
                  <h3 className="text-lg font-bold text-amber-300 flex items-center gap-2">
                    <ArrowLeftRight className="h-5 w-5 text-amber-400" />
                    Sovereign Trade Conversion Calculator
                  </h3>
                  <p className="text-xs text-stone-400 mt-1">
                    Calculate how much of standard interest debt ("Slave Tokens" GBP/USD) you discharge and convert into real human energy Kindness Credits (KC). 1 hour of mutual service = 10 KC (equivalent to £10 value).
                  </p>

                  <div className="bg-stone-950 rounded-lg p-5 mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 border border-stone-850">
                    <div className="text-center p-3 border-r border-stone-800">
                      <span className="text-[10px] font-mono uppercase text-stone-400 block mb-1">Your Total Liabilities</span>
                      <strong className="text-2xl font-black text-rose-500 font-mono">£{totalOutgoingsSum}</strong>
                      <span className="text-[9px] text-stone-500 block">Debt Slave Tokens</span>
                    </div>
                    <div className="text-center p-3 border-r border-stone-800">
                      <span className="text-[10px] font-mono uppercase text-stone-400 block mb-1">Kindness Credits Converted</span>
                      <strong className="text-2xl font-black text-amber-300 font-mono">{kcConvertOutput} KC</strong>
                      <span className="text-[9px] text-amber-500/80 block">Equivalent Energy Points</span>
                    </div>
                    <div className="text-center p-3">
                      <span className="text-[10px] font-mono uppercase text-stone-400 block mb-1">10% Community Contribution</span>
                      <strong className="text-2xl font-black text-cyan-400 font-mono">{communityFundDonation} KC</strong>
                      <span className="text-[9px] text-stone-500 block">Invested to PPP/Big Blue</span>
                    </div>
                  </div>
                  
                  <p className="text-[10px] text-stone-500 text-center mt-3 font-mono">
                    *Formula: Converted KC = Outgoings × 10. Community Donation = 10% Converted. Direct decentralization works!
                  </p>
                </div>

                {/* Kindness Credit Claim Outgoings Setup */}
                <div className="bg-stone-900 border border-stone-850 p-6 rounded-xl">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-amber-200">Discharge liabilities & Claim Credits</h3>
                      <span className="text-xs text-stone-400 block">Register your detailed monthly overhead and secure your debt.</span>
                    </div>
                    <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] font-mono border border-amber-500/20 rounded uppercase tracking-wider font-bold">Step 2 Claim Status</span>
                  </div>

                  {claimMsg && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded text-xs mb-4 flex items-center gap-2">
                      <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                      {claimMsg}
                    </div>
                  )}

                  <form onSubmit={handleClaimSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-mono text-stone-400 mb-1">Council Tax (£)</label>
                        <input 
                          type="number" 
                          value={claimLiabilities.councilTax}
                          onChange={(e) => setClaimLiabilities({ ...claimLiabilities, councilTax: Number(e.target.value) })}
                          className="w-full bg-stone-950 border border-stone-850 rounded p-2 text-xs text-stone-100 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-mono text-stone-400 mb-1">Electricity Bill (£)</label>
                        <input 
                          type="number" 
                          value={claimLiabilities.electricity}
                          onChange={(e) => setClaimLiabilities({ ...claimLiabilities, electricity: Number(e.target.value) })}
                          className="w-full bg-stone-950 border border-stone-850 rounded p-2 text-xs text-stone-100 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-mono text-stone-400 mb-1">Gas Bill (£)</label>
                        <input 
                          type="number" 
                          value={claimLiabilities.gas}
                          onChange={(e) => setClaimLiabilities({ ...claimLiabilities, gas: Number(e.target.value) })}
                          className="w-full bg-stone-950 border border-stone-850 rounded p-2 text-xs text-stone-100 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-mono text-stone-400 mb-1">Water Bill (£)</label>
                        <input 
                          type="number" 
                          value={claimLiabilities.water}
                          onChange={(e) => setClaimLiabilities({ ...claimLiabilities, water: Number(e.target.value) })}
                          className="w-full bg-stone-950 border border-stone-850 rounded p-2 text-xs text-stone-100 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-mono text-stone-400 mb-1">Food Needs (£)</label>
                        <input 
                          type="number" 
                          value={claimLiabilities.food}
                          onChange={(e) => setClaimLiabilities({ ...claimLiabilities, food: Number(e.target.value) })}
                          className="w-full bg-stone-950 border border-stone-850 rounded p-2 text-xs text-stone-100 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-mono text-stone-400 mb-1">Rent / Mortgage (£)</label>
                        <input 
                          type="number" 
                          value={claimLiabilities.other}
                          onChange={(e) => setClaimLiabilities({ ...claimLiabilities, other: Number(e.target.value) })}
                          className="w-full bg-stone-950 border border-stone-850 rounded p-2 text-xs text-stone-100 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-mono text-stone-400 mb-1">Describe what your 5h/week service offer supports (Where & When)</label>
                        <input 
                          type="text" required
                          placeholder="e.g. Leeds community garden Saturdays 9am"
                          value={claimServiceWhereWhen}
                          onChange={(e) => setClaimServiceWhereWhen(e.target.value)}
                          className="w-full bg-stone-950 border border-stone-850 rounded p-2 text-xs text-stone-100"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-mono text-stone-400 mb-1">Your detailed trade service profile name</label>
                        <input 
                          type="text" required
                          placeholder="e.g. Farm Helper or Sovereign Legal Assistant"
                          value={claimServiceOffer}
                          onChange={(e) => setClaimServiceOffer(e.target.value)}
                          className="w-full bg-stone-950 border border-stone-850 rounded p-2 text-xs text-stone-100"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={!currentUser}
                      className={`w-full font-black p-3 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition ${currentUser ? 'bg-amber-500 hover:bg-amber-400 text-stone-950' : 'bg-stone-800 text-stone-600 cursor-not-allowed'}`}
                    >
                      <Coins className="h-4.5 w-4.5" />
                      {currentUser ? "Verify Claim & Discharge liabilities" : "Log in With ProtonMail First To Claim"}
                    </button>
                  </form>
                </div>

              </div>

              {/* REAL-TIME DECENTRALIZED PUBLIC LEDGER FEED */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                
                {/* MINISTERS SOVEREIGN IDENTITY CARD GENERATOR */}
                {currentUser && (
                  <div className="bg-gradient-to-r from-stone-950 to-stone-900 border-2 border-amber-500/40 rounded-xl p-5 relative overflow-hidden" id="sovereign_identity_card">
                    {/* Visual pattern */}
                    <div className="absolute top-0 right-0 h-16 w-16 bg-amber-500/10 rounded-bl-full border-l border-b border-amber-500/20"></div>
                    
                    <div className="flex items-center gap-3 pb-3 border-b border-stone-800">
                      <div className="p-1 text-xs border border-amber-500/30 rounded-full bg-amber-500/5 text-amber-400">
                        <Scale className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-mono tracking-widest text-stone-400 block leading-tight">Universal Law Community Registry</span>
                        <strong className="text-xs font-bold tracking-wider text-amber-300">MINISTER EMOVEN WARRANTY CARD</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <div className="col-span-1 flex flex-col items-center justify-center border border-stone-800 rounded bg-stone-950 p-2 text-center h-24">
                        {/* Red stamp representation */}
                        <div className="w-12 h-12 bg-red-650/15 border-2 border-dashed border-red-500/40 rounded-full flex items-center justify-center">
                          <span className="text-[8px] font-mono text-red-500 font-extrabold rotate-12 block leading-none">SEALED</span>
                        </div>
                        <span className="text-[8px] uppercase tracking-wider font-mono text-stone-500 mt-1 leading-none">Authority</span>
                      </div>

                      <div className="col-span-2 space-y-1 text-xs pl-1">
                        <div>
                          <span className="text-[8px] font-mono text-stone-500 block uppercase">Executor Name:</span>
                          <strong className="text-stone-200 block text-[11px] truncate">{currentUser.fullName}</strong>
                        </div>
                        <div>
                          <span className="text-[8px] font-mono text-stone-500 block uppercase">Sovereign Identifier:</span>
                          <code className="text-amber-400 text-[10px] font-mono font-bold">{currentUser.idNumber}</code>
                        </div>
                        <div>
                          <span className="text-[8px] font-mono text-stone-500 block uppercase">Kind Ledger Account:</span>
                          <code className="text-stone-300 text-[10px] font-mono font-bold">{currentUser.kcAccount}</code>
                        </div>
                      </div>
                    </div>

                    <div className="bg-stone-950/80 p-2.5 rounded border border-stone-800 text-[9px] text-stone-400 leading-tight mt-3">
                      <strong>WARRANTY PROCLAMATION:</strong> Bearer holds natural right-of-use of sovereign body. Any unlicensed detention or administrative prosecution triggers instant commercial tariff: 100,000 KC (£10,000 equivalent) per hour.
                    </div>
                  </div>
                )}

                {/* Dynamic live ledger Feed */}
                <div className="bg-stone-950 border border-stone-800 rounded-xl p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Coins className="h-5 w-5 text-amber-400" />
                      <h4 className="text-base font-bold text-amber-200">Bank of Kindness Ledger</h4>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono text-[9px] tracking-widest uppercase animate-pulse">Live Ledger Feed</span>
                  </div>

                  <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                    {db.ledger && db.ledger.length > 0 ? (
                      db.ledger.map((tx: any) => (
                        <div key={tx.id} className="bg-stone-900 border border-stone-850 p-3 rounded flex flex-col gap-1.5 transition-all hover:border-amber-500/10">
                          
                          <div className="flex items-center justify-between">
                            <span className={`text-[9px] font-mono uppercase font-bold py-0.5 px-1.5 rounded ${tx.type === 'donation' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                              {tx.type}
                            </span>
                            <span className="text-[10px] font-black text-amber-300 font-mono">+{tx.amountKC} KC</span>
                          </div>

                          <p className="text-[11px] text-stone-300 font-mono truncate">{tx.details}</p>

                          <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1.5 border-t border-stone-850/60 leading-tight">
                            <span className="truncate max-w-[150px]">To: {tx.recipient}</span>
                            <span className="shrink-0 font-mono">Val: {tx.equivalentSlaveTokens}</span>
                          </div>

                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-stone-500 italic text-center py-10">Ledger empty. Convert some slave tokens to begin!</p>
                    )}
                  </div>
                </div>

              </div>

            </section>

          </div>
        )}

        {/* TAB 4: REBUTTAL BURAEU */}
        {activeTab === 'rebut' && (
          <div className="flex flex-col gap-6" id="view_rebut bg_agency">
            
            <section className="bg-stone-900 border border-stone-800 rounded-xl p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                
                {/* STATUTORY HARASSMENT REPORTING FORM */}
                <div className="w-full lg:w-5/12 flex flex-col gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-amber-300">Rebuttal Bureau & Securing Agency</h2>
                    <p className="text-xs text-stone-400 mt-1">
                      Report un-notified corporate incursions (unsolicited notices from British Gas, energy suppliers, bailiffs, water companies, or town councils). File here to automatically register a counter-charge contract under private equity.
                    </p>
                  </div>

                  {harrSubmitted ? (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded p-5 flex flex-col gap-4">
                      <div className="flex items-start gap-2.5">
                        <CheckCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-amber-300 uppercase font-mono">Corporation Counter-Claim Docketed</h4>
                          <p className="text-[11px] text-stone-350 mt-1">
                            An automated Consuming of My Private Credit Agreement has been registered. 50,000 KC counter-tariff has been listed into the public sovereign records against the debtor corporation. Use notice generator opposite to send response.
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setHarrSubmitted(false)}
                        className="bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs py-2 rounded font-mono uppercase tracking-wider"
                      >
                        Docket Another Offense
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleHarassmentSubmit} className="space-y-3.5">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-mono tracking-wider text-stone-400 mb-0.5">Your Warrior ID Number</label>
                          <input 
                            type="text" 
                            placeholder="ME-91820-UK"
                            value={harrForm.emovenId}
                            onChange={(e) => setHarrForm({...harrForm, emovenId: e.target.value})}
                            className="w-full bg-stone-950 border border-stone-800 p-2 text-xs text-amber-300 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-mono tracking-wider text-stone-400 mb-0.5">Kindness Account (KC)</label>
                          <input 
                            type="text" 
                            placeholder="KC-8849-01"
                            value={harrForm.kcAccount}
                            onChange={(e) => setHarrForm({...harrForm, kcAccount: e.target.value})}
                            className="w-full bg-stone-950 border border-stone-800 p-2 text-xs text-amber-300 font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-mono tracking-wider text-stone-400 mb-0.5">Your Secure Proton Mail</label>
                          <input 
                            type="email" required
                            placeholder="username@proton.me"
                            value={harrForm.email}
                            onChange={(e) => setHarrForm({...harrForm, email: e.target.value})}
                            className="w-full bg-stone-950 border border-stone-800 p-2 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-mono tracking-wider text-stone-400 mb-0.5">Your Phone (Secure)</label>
                          <input 
                            type="text"
                            placeholder="+447700900077"
                            value={harrForm.phone}
                            onChange={(e) => setHarrForm({...harrForm, phone: e.target.value})}
                            className="w-full bg-stone-950 border border-stone-800 p-2 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-mono tracking-wider text-stone-400 mb-0.5">Harassing Corporation Name</label>
                          <input 
                            type="text" required
                            placeholder="e.g. BRITISH GAS PLC / COUNCIL"
                            value={harrForm.corpName}
                            onChange={(e) => setHarrForm({...harrForm, corpName: e.target.value})}
                            className="w-full bg-stone-950 border border-stone-850 p-2 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-mono tracking-wider text-stone-400 mb-0.5">Unsolicited Reference Number</label>
                          <input 
                            type="text"
                            placeholder="BG-999120-LH"
                            value={harrForm.fictionNumber}
                            onChange={(e) => setHarrForm({...harrForm, fictionNumber: e.target.value})}
                            className="w-full bg-stone-950 border border-stone-850 p-2 text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-mono tracking-wider text-stone-400 mb-0.5">Brief description of corporate aggression</label>
                        <textarea 
                          rows={2}
                          value={harrForm.details}
                          onChange={(e) => setHarrForm({...harrForm, details: e.target.value})}
                          placeholder="Bailiff letters, utility threat, unauthorized boundary trespassing..."
                          className="w-full bg-stone-950 border border-stone-850 p-2 text-xs"
                        ></textarea>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-mono tracking-wider text-stone-400 mb-0.5 font-mono">Notice 1 Delivered Date</label>
                          <input 
                            type="date"
                            value={harrForm.noticeDate1}
                            onChange={(e) => setHarrForm({...harrForm, noticeDate1: e.target.value})}
                            className="w-full bg-stone-950 border border-stone-850 p-2 text-xs font-mono text-stone-200"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-mono tracking-wider text-stone-400 mb-0.5 font-mono">Notice 2 Delivered Date</label>
                          <input 
                            type="date"
                            value={harrForm.noticeDate2}
                            onChange={(e) => setHarrForm({...harrForm, noticeDate2: e.target.value})}
                            className="w-full bg-stone-950 border border-stone-850 p-2 text-xs font-mono text-stone-200"
                          />
                        </div>
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-black p-3 text-xs rounded uppercase tracking-wider transition"
                      >
                        Register Counter-Charge Docket against Corp
                      </button>
                    </form>
                  )}
                </div>

                {/* DYNAMIC CEASE AND DESIST NOTICE GENERATOR */}
                <div className="w-full lg:w-7/12 bg-stone-950 border border-stone-800 p-5 rounded-lg flex flex-col gap-4">
                  
                  <div className="flex flex-wrap items-center justify-between border-b border-stone-850 pb-3 gap-3">
                    <div>
                      <h4 className="text-base font-bold text-amber-200">Legal Fiction Rebuttal Notice Builder</h4>
                      <p className="text-[11px] text-stone-400">Generate personalized sovereign rebuttal documents instantly.</p>
                    </div>
                    
                    <div className="flex gap-2.5">
                      <select 
                        value={selectedNoticeTemplate}
                        onChange={(e) => setSelectedNoticeTemplate(e.target.value)}
                        className="bg-stone-900 border border-stone-800 rounded p-1.5 text-[11px] text-amber-300"
                      >
                        <option value="rebut1">British Gas / Utility Rebut</option>
                        <option value="rebut2">High Court Private Penal Order</option>
                        <option value="rebut3">Medical Sovereign Exemption</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex-1 bg-stone-900/80 p-4 rounded border border-stone-850 relative">
                    <textarea 
                      value={customRebuttalText}
                      onChange={(e) => setCustomRebuttalText(e.target.value)}
                      rows={12}
                      className="w-full h-full bg-transparent border-none text-xs text-stone-220 leading-relaxed font-mono focus:outline-none resize-none"
                    ></textarea>
                    
                    <div className="absolute bottom-2.5 right-2.5 flex gap-2">
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(customRebuttalText);
                          alert("Counter Rebuttal Notice copied to private clipboard successfully!");
                        }}
                        className="bg-stone-950 text-amber-400 border border-amber-500/30 hover:bg-stone-900 text-[10px] font-black px-3 py-1.5 rounded uppercase tracking-wider"
                      >
                        Copy Notice Text
                      </button>
                      <button 
                        onClick={() => window.print()}
                        className="bg-amber-600 hover:bg-amber-500 text-stone-950 text-[10px] font-black px-3 py-1.5 rounded uppercase tracking-wider"
                      >
                        Print Notice
                      </button>
                    </div>
                  </div>

                  <div className="bg-amber-500/5 p-3 rounded border border-amber-500/10 text-[10px] text-stone-400">
                    <strong>INSTRUCTIONS:</strong> Copy this notice, connect to your ProtonMail, paste and send recorded delivery directly to the litigation directors of the target harassers. Record tracking dates in the dockets.
                  </div>

                </div>

              </div>
            </section>

          </div>
        )}

        {/* TAB 5: UN DOCK VAULT (DOCUMENT VAULT LIBRARY) */}
        {activeTab === 'vault' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="view_documents_library">
            
            <div className="md:col-span-4 bg-stone-900 border border-stone-800 p-6 rounded-xl flex flex-col gap-4">
              <div>
                <h3 className="text-xl font-bold text-amber-300">"Un-Dock Your Mind" Library</h3>
                <p className="text-xs text-stone-400 mt-1">Examine and study validated procedures used to rebut presumed administrative jurisdictions. Download these high-court templates securely.</p>
              </div>

              <div className="space-y-1.5">
                <button 
                  onClick={() => setSelectedNoticeTemplate('rebut1')}
                  className={`w-full text-left p-3 rounded text-xs transition border flex items-center gap-2.5 ${selectedNoticeTemplate === 'rebut1' ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-stone-950 border-stone-850 text-stone-300 hover:border-amber-500/20'}`}
                >
                  <FileText className="h-4.5 w-4.5 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold block leading-none">British Gas Rebut</span>
                    <span className="text-[9px] text-stone-500 font-mono block mt-1">Utility Cease & Desist template</span>
                  </div>
                </button>

                <button 
                  onClick={() => setSelectedNoticeTemplate('rebut2')}
                  className={`w-full text-left p-3 rounded text-xs transition border flex items-center gap-2.5 ${selectedNoticeTemplate === 'rebut2' ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-stone-950 border-stone-850 text-stone-300 hover:border-amber-500/20'}`}
                >
                  <Gavel className="h-4.5 w-4.5 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold block leading-none">High Court Private Penal Order</span>
                    <span className="text-[9px] text-stone-500 font-mono block mt-1">Habeas Corpus & Counter Claim</span>
                  </div>
                </button>

                <button 
                  onClick={() => setSelectedNoticeTemplate('rebut3')}
                  className={`w-full text-left p-3 rounded text-xs transition border flex items-center gap-2.5 ${selectedNoticeTemplate === 'rebut3' ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-stone-950 border-stone-850 text-stone-300 hover:border-amber-500/20'}`}
                >
                  <Shield className="h-4.5 w-4.5 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold block leading-none">Sovereign Medical Exemption</span>
                    <span className="text-[9px] text-stone-500 font-mono block mt-1">Bio-research Clean Record</span>
                  </div>
                </button>
              </div>

              <div className="bg-stone-950/60 p-4 border border-stone-850 rounded text-[11px] text-stone-400 leading-relaxed">
                <strong>HISTORICAL NOTE:</strong> These certified files reference private determinations by Justice Steyn, concluding statutory rules do not bind unaligned living heirs.
              </div>
            </div>

            <div className="md:col-span-8 bg-stone-950 border border-stone-800 p-6 rounded-xl flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-stone-850 pb-2">
                <span className="text-xs uppercase font-mono tracking-widest text-stone-400">Parchment Viewer Mode</span>
                <span className="text-[11px] text-amber-400 uppercase font-bold flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5 text-amber-400" /> Root Certified File
                </span>
              </div>

              <div className="parchment-bg text-stone-950 p-6 rounded-lg shadow-inner h-[400px] overflow-y-auto border border-amber-600/30">
                <div className="font-serif text-sm leading-relaxed whitespace-pre-line" id="document_library_content">
                  {customRebuttalText}
                </div>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-400 font-mono font-bold uppercase">Vault File State: REVEALED PRIVATE STATUS</span>
                <button 
                  onClick={() => {
                    const printWindow = window.open("", "_blank");
                    if (printWindow) {
                      printWindow.document.write(`<pre style="font-family:serif; font-size:14px; white-space:pre-wrap; padding:20px;">${customRebuttalText}</pre>`);
                      printWindow.document.close();
                      printWindow.print();
                    } else {
                      window.print();
                    }
                  }}
                  className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-black px-4 py-2 rounded text-xs uppercase tracking-wider flex items-center gap-1"
                >
                  <Printer className="h-4 w-4" /> Hard Copy Direct
                </button>
              </div>
            </div>

          </div>
        )}

        {/* TAB 6: SUPPORT HUB / MEET FACILITATORS */}
        {activeTab === 'meet' && (
          <div className="flex flex-col gap-6" id="view_support_hub">
            
            <section className="bg-stone-900 border border-stone-800 rounded-xl p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                
                {/* REQUEST A MEETING FORM */}
                <div className="w-full lg:w-1/2 flex flex-col gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-amber-300">Request a Meeting with Facilitation</h2>
                    <p className="text-xs text-stone-400 mt-1">
                      The easiest way to understand ULCT natural law is to meet with facilitators in person. Coordinate zooming coordinates or local borough assemblies.
                    </p>
                  </div>

                  {meetSubmitted ? (
                    <div className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-lg flex items-start gap-3">
                      <CheckCircle className="h-5.5 w-5.5 text-amber-400 shrink-0" />
                      <div>
                        <h4 className="text-sm font-bold text-amber-300 font-mono">Meeting Schedule Registered</h4>
                        <p className="text-xs text-stone-300 mt-1">
                          A facilitator active in your general location will contact your ProtonMail address to schedule zoom assembly. Check your inbox within 24 hours.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleMeetSubmit} className="space-y-3.5">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-mono text-stone-400 mb-0.5">Your Living Name</label>
                          <input 
                            type="text" required
                            placeholder="e.g. Stanley Blaze"
                            value={meetForm.name}
                            onChange={(e) => setMeetForm({...meetForm, name: e.target.value})}
                            className="w-full bg-stone-950 border border-stone-800 p-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-mono text-stone-400 mb-0.5">Your Secure ProtonMail</label>
                          <input 
                            type="email" required
                            placeholder="username@proton.me"
                            value={meetForm.email}
                            onChange={(e) => setMeetForm({...meetForm, email: e.target.value})}
                            className="w-full bg-stone-950 border border-stone-800 p-2 text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-mono text-stone-400 mb-0.5">Borough / Parish on Earth</label>
                          <input 
                            type="text" placeholder="e.g. Leeds Outer West"
                            value={meetForm.borough}
                            onChange={(e) => setMeetForm({...meetForm, borough: e.target.value})}
                            className="w-full bg-stone-950 border border-stone-800 p-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-mono text-stone-400 mb-0.5">County / State / Territory</label>
                          <input 
                            type="text" placeholder="e.g. West Yorkshire"
                            value={meetForm.state}
                            onChange={(e) => setMeetForm({...meetForm, state: e.target.value})}
                            className="w-full bg-stone-950 border border-stone-800 p-2 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-mono text-stone-400 mb-0.5">Postal/Zip Code</label>
                          <input 
                            type="text" placeholder="e.g. LS28 6PT"
                            value={meetForm.postcode}
                            onChange={(e) => setMeetForm({...meetForm, postcode: e.target.value})}
                            className="w-full bg-stone-950 border border-stone-800 p-2 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-mono text-stone-400 mb-0.5">Subject Matter</label>
                          <input 
                            type="text"
                            value={meetForm.subject}
                            onChange={(e) => setMeetForm({...meetForm, subject: e.target.value})}
                            className="w-full bg-stone-950 border border-stone-800 p-2 text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-mono text-stone-400 mb-0.5">Inquiry Details</label>
                        <textarea 
                          rows={3} required
                          placeholder="What can we help you coordinate? (Gas rebutting assistance, community chest questions...)"
                          value={meetForm.message}
                          onChange={(e) => setMeetForm({...meetForm, message: e.target.value})}
                          className="w-full bg-stone-950 border border-stone-850 p-2 text-xs"
                        ></textarea>
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-black p-3 text-xs uppercase tracking-wider transition rounded"
                      >
                        Request Assembly Meet Coordinate
                      </button>
                    </form>
                  )}
                </div>

                {/* ACTIVE GLOBAL LOCAL HUBS REGISTRY */}
                <div className="w-full lg:w-1/2 flex flex-col gap-4">
                  <div className="bg-stone-950 border border-stone-800 p-5 rounded-lg">
                    <div className="flex items-center justify-between border-b border-stone-850 pb-2 mb-3">
                      <h4 className="text-sm font-bold text-amber-200">Facilitation Hub coordinates</h4>
                      <span className="text-[10px] font-mono text-stone-500">Global Ground Map active</span>
                    </div>

                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                      
                      <div className="bg-stone-900 p-3 rounded border border-stone-800 flex flex-col gap-1 hover:border-amber-500/10">
                        <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" /> Leeds Borough assembly
                          </span>
                          <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 bg-stone-950 text-amber-400 rounded">United Kingdom</span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          Leeds LS9 and West West Yorkshire hubs. Active support for council tax rebuttals & People's Protection Patrol coordinates.
                        </p>
                      </div>

                      <div className="bg-stone-900 p-3 rounded border border-stone-800 flex flex-col gap-1 hover:border-amber-500/10">
                        <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" /> Ellas / Rock of Light
                          </span>
                          <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 bg-stone-950 text-amber-400 rounded">Greece</span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          Athens & Ikaria direct coordinates. Managing bio-ethical research clean records and Mediterranean energy conversions.
                        </p>
                      </div>

                      <div className="bg-stone-900 p-3 rounded border border-stone-800 flex flex-col gap-1 hover:border-amber-500/10">
                        <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" /> Wales and Scotland Unions
                          </span>
                          <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 bg-stone-950 text-amber-400 rounded">Great Britain</span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          Active wood-working and garden co-ops backing kindness conversions in local councils. Socratic courtroom challengers.
                        </p>
                      </div>

                      <div className="bg-stone-900 p-3 rounded border border-stone-800 flex flex-col gap-1 hover:border-amber-500/10">
                        <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" /> Canada & Americas Trust
                          </span>
                          <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 bg-stone-950 text-amber-400 rounded">Americas</span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          Sovereign secured party credit files brokers setup support. UCC filing procedures guides twice weekly.
                        </p>
                      </div>

                    </div>
                  </div>
                </div>

              </div>
            </section>

          </div>
        )}

        {/* TAB 7: TRIBUNAL ADMIN PANEL */}
        {activeTab === 'admin' && (
          <div className="flex flex-col gap-6" id="view_admin">
            
            <section className="bg-stone-900 border border-stone-800 rounded-xl p-6">
              <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-4 gap-4 flex-wrap">
                <div>
                  <h2 className="text-2xl font-black text-amber-300 font-serif">Tribunal Sovereign Management Panel</h2>
                  <p className="text-xs text-stone-400">Direct democracy control panel: view registries, inject block ledger entries and reset state.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleResetDb}
                    className="bg-red-900 hover:bg-red-800 border border-red-500 text-stone-100 text-xs font-bold px-3 py-2 rounded font-mono uppercase tracking-wider transition"
                  >
                    Restore certified DB Clean State
                  </button>
                  <button 
                    onClick={fetchDb}
                    className="bg-stone-850 hover:bg-stone-800 text-amber-300 text-xs font-bold px-3 py-2 rounded border border-amber-500/20"
                  >
                    Refresh State
                  </button>
                </div>
              </div>

              {/* ADMIN GRID DETAILS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* TRANSACTION LEDGER INJECTOR */}
                <div className="lg:col-span-5 bg-stone-950 p-4 border border-stone-800 rounded-lg flex flex-col gap-4">
                  <h3 className="text-sm font-mono uppercase tracking-wider text-amber-400 font-black">Force Block Transaction Injector</h3>
                  
                  <form onSubmit={handleAdminTxSubmit} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-stone-400 mb-1">Sender Entity / Sovereign Persona</label>
                      <input 
                        type="text" required
                        placeholder="e.g. York Council Corporation"
                        value={adminTx.sender}
                        onChange={(e) => setAdminTx({...adminTx, sender: e.target.value})}
                        className="w-full bg-stone-900 border border-stone-800 rounded p-2 text-stone-200"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-400 mb-1">Recipient Living Persona</label>
                      <input 
                        type="text" required
                        placeholder="e.g. Minister Sean"
                        value={adminTx.recipient}
                        onChange={(e) => setAdminTx({...adminTx, recipient: e.target.value})}
                        className="w-full bg-stone-900 border border-stone-800 rounded p-2 text-stone-200"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-stone-400 mb-1">Amount in KC</label>
                        <input 
                          type="number" required
                          value={adminTx.amountKC}
                          onChange={(e) => setAdminTx({...adminTx, amountKC: Number(e.target.value)})}
                          className="w-full bg-stone-900 border border-stone-800 rounded p-2 font-mono text-amber-300"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-400 mb-1">Transaction Category</label>
                        <select 
                          value={adminTx.type}
                          onChange={(e) => setAdminTx({...adminTx, type: e.target.value})}
                          className="w-full bg-stone-900 border border-stone-800 rounded p-2"
                        >
                          <option value="conversion">Conversion / Settlement</option>
                          <option value="donation">Community Return (10%)</option>
                          <option value="award">Tribunal Remedial Award</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-stone-400 mb-1">Transaction Details Narrative</label>
                      <input 
                        type="text" required
                        placeholder="e.g. Counter-notice tariff penalty processed on Smart Meter intrusion"
                        value={adminTx.details}
                        onChange={(e) => setAdminTx({...adminTx, details: e.target.value})}
                        className="w-full bg-stone-900 border border-stone-800 rounded p-2 text-stone-200 animate-pulse"
                      />
                    </div>
                    
                    <button 
                      type="submit"
                      className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-black p-2.5 rounded text-xs uppercase tracking-wider"
                    >
                      Broadcast Custom Transaction block
                    </button>
                  </form>
                </div>

                {/* PENDING SUBMISSIONS MONITOR */}
                <div className="lg:col-span-7 space-y-4">
                  
                  {/* AOC Registry list */}
                  <div className="bg-stone-950 p-4 border border-stone-800 rounded-lg">
                    <h3 className="text-sm font-mono uppercase tracking-wider text-amber-400 font-black mb-2.5">Sovereign AOC Files Registered ({db.aoc?.length || 0})</h3>
                    <div className="max-h-40 overflow-y-auto space-y-2 text-xs">
                      {db.aoc && db.aoc.map((item: any) => (
                        <div key={item.id} className="bg-stone-900 p-2.5 rounded border border-stone-850 flex items-center justify-between gap-4">
                          <div>
                            <strong className="text-stone-200">Minister {item.firstName} {item.lastName}</strong>
                            <p className="text-[10px] text-stone-500 font-mono">Discharging: {item.accounts} | {item.email}</p>
                          </div>
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded font-mono text-[9px] uppercase">
                            {item.rollNumber}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Harassment reporting list */}
                  <div className="bg-stone-950 p-4 border border-stone-800 rounded-lg">
                    <h3 className="text-sm font-mono uppercase tracking-wider text-amber-400 font-black mb-2.5">Aggressive Corporate Infringements ({db.harassment?.length || 0})</h3>
                    <div className="max-h-40 overflow-y-auto space-y-2 text-xs">
                      {db.harassment && db.harassment.map((item: any) => (
                        <div key={item.id} className="bg-stone-900 p-2.5 rounded border border-stone-850 flex flex-col gap-1">
                          <div className="flex justify-between items-center text-[10px] font-mono leading-none">
                            <span className="text-red-400 font-bold uppercase">{item.corpName}</span>
                            <span className="text-stone-500">Ref: {item.fictionNumber}</span>
                          </div>
                          <p className="text-[11px] text-stone-300">{item.details}</p>
                          <div className="flex justify-between text-[10px] text-stone-500 mt-1 pt-1 border-t border-stone-850/60 leading-none">
                            <span>Reporter mail: {item.email}</span>
                            <span className="text-amber-400 font-bold uppercase">Penalty Active</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            </section>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-stone-950 border-t border-stone-800 text-stone-500 py-6 text-xs mt-10" id="app_footer">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <p className="font-bold text-stone-400">UNIVERSAL LAW COMMUNITY TRUST (ULCT)</p>
            <p className="text-[11px] text-stone-550 mt-1">Direct Sovereignty & Wealth Discharging Bureau. Built under Natural Law (Do No Harm).</p>
          </div>
          
          <div className="text-[11px] font-mono text-stone-500">
            <span>Copyright © 2026. All Rights Reserved. Private Trust Standing.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
