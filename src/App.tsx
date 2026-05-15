/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  FileText, 
  History, 
  Settings, 
  HelpCircle, 
  Search, 
  Bell, 
  Menu,
  Copy,
  Download,
  Stethoscope,
  HeartPulse,
  Plane,
  MoreHorizontal,
  CloudUpload,
  QrCode,
  AlertTriangle,
  XCircle,
  Info,
  Activity,
  Zap,
  Hospital,
  ChevronRight,
  ExternalLink,
  Star,
  MapPin,
  CheckCircle2,
  Loader2,
  Plus,
  CreditCard,
  Check,
  Globe,
  Lock,
  User as UserIcon,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";
import { cn } from './lib/utils';

// --- Types ---

interface Policy {
  id: string;
  name: string;
  type: 'Hospital' | 'Outpatient' | 'A&E' | 'Travel' | 'Accident' | 'Others';
  limit: string;
  utilized: number;
  description: string;
  issuer: string;
  premium: number;
}

interface ClaimSimulationResult {
  claimable: {
    policyName: string;
    maxAmount: string;
    reason: string;
  }[];
  exclusions: string[];
  recommendations: {
    name: string;
    competency: string;
    rating: string;
    distance: string;
  }[];
  estOutOfPocket: string;
}

interface ClaimHistoryItem {
  id: string;
  policyName: string;
  condition: string;
  date: string;
  amount: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}

interface RecommendedPlan {
  id: string;
  name: string;
  issuer: string;
  premium: string;
  benefitTitle: string;
  benefitValue: string;
  tag: string;
}

// --- Constants & API ---

const INITIAL_POLICIES: Policy[] = [
  { id: '1', name: 'Income Shield Plus', type: 'Hospital', limit: '$2,500,000', utilized: 12, description: 'Lifetime Limit', issuer: 'Income Insurance', premium: 1200 },
  { id: '2', name: 'Elite Health Care', type: 'Outpatient', limit: '$15,000', utilized: 65, description: 'Annual Limit', issuer: 'AIA', premium: 450 },
  { id: '3', name: 'Emergency Guard', type: 'A&E', limit: 'Unlimited', utilized: 5, description: 'Co-payment applies', issuer: 'Great Eastern', premium: 280 },
  { id: '4', name: 'Globetrotter Pro', type: 'Travel', limit: '$500,000', utilized: 0, description: 'Per Voyage', issuer: 'Prudential', premium: 150 },
  { id: '5', name: 'Personal Accident Elite', type: 'Accident', limit: '$100,000', utilized: 100, description: 'Lump Sum Coverage', issuer: 'Income Insurance', premium: 200 },
];

const INITIAL_CLAIMS: ClaimHistoryItem[] = [
  { id: 'c1', policyName: 'Income Shield Plus', condition: 'Cataract Surgery', date: '2023-11-12', amount: '$4,200', status: 'Approved' },
  { id: 'c2', policyName: 'Elite Health Care', condition: 'Physiotherapy (Sports Injury)', date: '2024-01-05', amount: '$150', status: 'Approved' },
  { id: 'c3', policyName: 'Emergency Guard', condition: 'Food Poisoning (A&E)', date: '2024-02-28', amount: '$450', status: 'Approved' },
  { id: 'c4', policyName: 'Elite Health Care', condition: 'Diagnostic X-Ray', date: '2024-03-15', amount: '$220', status: 'Pending' },
];

const RECOMMENDED_PLANS: RecommendedPlan[] = [
  { id: 'rp1', name: 'Infinite CI Protector', issuer: 'Income Insurance', premium: '$45/mo', benefitTitle: 'CI Coverage', benefitValue: '$350,000', tag: 'Top Choice' },
  { id: 'rp2', name: 'Life Premium Plus', issuer: 'AIA', premium: '$52/mo', benefitTitle: 'CI Coverage', benefitValue: '$500,000', tag: 'Best Value' },
  { id: 'rp3', name: 'Smart Health Critical', issuer: 'Great Eastern', premium: '$38/mo', benefitTitle: 'CI Coverage', benefitValue: '$250,000', tag: 'Starter' },
];

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// --- Components ---

const Sidebar = ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'policies', label: 'My Policies', icon: FileText },
    { id: 'claims', label: 'Claims History', icon: History },
    { id: 'pricing', label: 'Pricing Plan', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help Center', icon: HelpCircle },
  ];

  return (
    <aside className="hidden md:flex flex-col h-full border-r border-gray-200 bg-white w-72 fixed left-0 top-0 shadow-xl z-50">
      <div className="p-6 flex items-center space-x-3">
        <ShieldCheck className="text-primary w-8 h-8 fill-primary/10" />
        <span className="font-display font-bold text-xl text-primary">Insure Help</span>
      </div>
      
      <div className="mt-8 px-4 flex-1">
        <div className="mb-8 p-4 bg-gray-50 rounded-xl flex items-center space-x-3 border border-gray-100">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white font-bold">
            JD
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant">Welcome back</p>
            <p className="font-display font-bold text-lg text-primary">John Doe</p>
          </div>
        </div>

        <nav className="space-y-1" role="navigation" aria-label="Main Navigation">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset",
                activeTab === item.id 
                  ? "bg-primary-container text-white font-bold shadow-lg shadow-primary-container/20" 
                  : "text-on-surface-variant hover:bg-gray-100"
              )}
              aria-current={activeTab === item.id ? 'page' : undefined}
            >
              <item.icon className={cn("mr-3 w-5 h-5", activeTab === item.id ? "text-white" : "text-on-surface-variant group-hover:text-primary")} />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6 border-t border-gray-100">
        <div className="bg-surface-warm p-4 rounded-xl border-l-4 border-primary shadow-sm">
          <p className="text-sm font-bold text-primary">Status: Premium User</p>
          <p className="text-xs text-on-surface-variant mt-1">Your coverage is 85% optimal.</p>
        </div>
      </div>
    </aside>
  );
};

const ClaimsHistoryView = ({ claims }: { claims: ClaimHistoryItem[] }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-8"
  >
    <div className="flex justify-between items-center">
      <div>
        <h2 className="font-display text-3xl font-bold text-on-surface">Claims History</h2>
        <p className="text-on-surface-variant mt-1">A detailed list of all your processed and pending claims.</p>
      </div>
      <button className="bg-white text-primary border-2 border-primary/20 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all flex items-center gap-2">
        <Download className="w-4 h-4" />
        <span>Download Statement</span>
      </button>
    </div>

    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-extrabold text-on-surface-variant uppercase tracking-widest">Date</th>
              <th className="px-6 py-4 text-xs font-extrabold text-on-surface-variant uppercase tracking-widest">Medical Condition</th>
              <th className="px-6 py-4 text-xs font-extrabold text-on-surface-variant uppercase tracking-widest">Policy</th>
              <th className="px-6 py-4 text-xs font-extrabold text-on-surface-variant uppercase tracking-widest text-right">Amount</th>
              <th className="px-6 py-4 text-xs font-extrabold text-on-surface-variant uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-4 text-xs font-extrabold text-on-surface-variant uppercase tracking-widest text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {claims.map((claim) => (
              <tr key={claim.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-on-surface">
                    {new Date(claim.date).toLocaleDateString('en-SG', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-on-surface">{claim.condition}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold rounded-full border border-primary/10 uppercase tracking-wider">
                    {claim.policyName}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-black text-on-surface">{claim.amount}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={cn(
                    "px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-wider",
                    claim.status === 'Approved' ? "bg-green-50 text-green-600 border border-green-100" :
                    claim.status === 'Pending' ? "bg-orange-50 text-orange-600 border border-orange-100" :
                    "bg-red-50 text-red-600 border border-red-100"
                  )}>
                    {claim.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-on-surface-variant">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </motion.div>
);

const PricingView = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Ideal for basic policy tracking.',
      features: ['Up to 2 policies', 'Basic AI analysis', 'Manual claim check', 'Mobile App access'],
      buttonText: 'Current Plan',
      isPopular: false,
      color: 'bg-gray-100 text-gray-800'
    },
    {
      name: 'Basic',
      price: '$9',
      description: 'Perfect for families with multiple policies.',
      features: ['Up to 10 policies', 'Advanced AI Assistant', 'Automatic claim filing', 'Priority Support', 'Family Sharing'],
      buttonText: 'Upgrade to Basic',
      isPopular: true,
      color: 'bg-primary text-white shadow-xl shadow-primary/20'
    },
    {
      name: 'Advanced',
      price: '$29',
      description: 'Comprehensive coverage protection.',
      features: ['Unlimited policies', 'Full Legal Support', '24/7 Medical Concierge', 'Wealth Integration', 'Custom Gap Analysis'],
      buttonText: 'Upgrade to Advanced',
      isPopular: false,
      color: 'bg-gray-900 text-white'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="font-display text-4xl font-extrabold text-on-surface">Secure Your Future</h2>
        <p className="text-on-surface-variant mt-4 text-lg">Choose the right plan to maximize your coverage and minimize out-of-pocket expenses.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
        {plans.map((plan, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -8 }}
            className={cn(
              "p-8 rounded-[2.5rem] border flex flex-col items-center text-center transition-all",
              plan.isPopular ? "border-primary bg-white ring-4 ring-primary/5" : "border-gray-200 bg-white"
            )}
          >
            {plan.isPopular && (
              <span className="bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-6">Most Popular</span>
            )}
            <h3 className="font-display text-2xl font-bold mb-2">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-black">{plan.price}</span>
              <span className="text-on-surface-variant font-bold">/mo</span>
            </div>
            <p className="text-sm text-on-surface-variant mb-8 min-h-[40px]">{plan.description}</p>
            
            <div className="w-full space-y-4 mb-10 flex-1">
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-left">
                  <div className="p-1 bg-green-50 rounded-full">
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-on-surface-variant">{feature}</span>
                </div>
              ))}
            </div>

            <button className={cn(
              "w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98]",
              plan.color,
              plan.name === 'Free' ? "cursor-default opacity-50" : "hover:opacity-90"
            )}>
              {plan.buttonText}
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const RecommendationsModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <h3 className="font-display text-2xl font-bold text-on-surface">Recommended for You</h3>
              <p className="text-sm text-on-surface-variant mt-1">Based on your identified coverage gap in Critical Illness.</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <XCircle className="w-6 h-6 text-on-surface-variant" />
            </button>
          </div>
          
          <div className="p-8 overflow-y-auto space-y-4">
            {RECOMMENDED_PLANS.map((plan) => (
              <motion.div 
                key={plan.id}
                whileHover={{ x: 4 }}
                className="p-5 border border-gray-100 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-primary hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <span className="font-bold text-on-surface">{plan.name}</span>
                       <span className="text-[10px] font-black uppercase text-primary bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10 tracking-widest">{plan.tag}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">{plan.issuer}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-start">
                  <div className="text-right sm:text-left">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{plan.benefitTitle}</p>
                    <p className="text-sm font-black text-on-surface">{plan.benefitValue}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-primary">{plan.premium}</p>
                    <button className="text-[11px] font-black text-primary hover:underline flex items-center gap-1 uppercase tracking-tighter">
                      Apply Now <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="p-8 border-t border-gray-100 bg-gray-50/30">
            <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <Zap className="w-5 h-5 text-primary mt-1" />
              <p className="text-xs text-on-surface-variant leading-relaxed">
                <span className="font-bold text-primary">Pro-tip:</span> These plans are pre-qualified based on your current age and existing health declarations. You can potentially waive medical check-ups for policies with the <span className="font-bold">Top Choice</span> tag.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const PoliciesListView = ({ policies, onAddPolicy }: { policies: Policy[], onAddPolicy: () => void }) => {
  const getIconForType = (type: string) => {
    switch (type) {
      case 'Hospital': return Hospital;
      case 'Outpatient': return Stethoscope;
      case 'A&E': return Activity;
      case 'Travel': return Plane;
      case 'Accident': return HeartPulse;
      default: return Info;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display text-3xl font-bold text-on-surface">Integrated Policies</h2>
          <p className="text-on-surface-variant mt-1">Manage and view details of all your coverage instruments.</p>
        </div>
        <button 
          onClick={onAddPolicy}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Policy</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {policies.map((policy) => {
          const Icon = getIconForType(policy.type);
          return (
            <motion.div 
              key={policy.id}
              whileHover={{ scale: 1.01 }}
              className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-6 group hover:border-primary transition-all"
            >
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-colors bg-opacity-10",
                policy.utilized > 80 ? "bg-red-500 text-red-600" : policy.utilized > 40 ? "bg-orange-500 text-orange-600" : "bg-primary text-primary"
              )}>
                <Icon className="w-8 h-8" />
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-display text-xl font-bold text-on-surface group-hover:text-primary transition-colors">{policy.name}</h3>
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{policy.issuer}</p>
                  </div>
                  <span className="px-3 py-1 bg-gray-50 text-[10px] font-black rounded-full border border-gray-100 uppercase tracking-widest">{policy.type}</span>
                </div>
                
                <p className="text-sm text-on-surface-variant mb-6">{policy.description}</p>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest mb-1">Coverage Limit</p>
                      <p className="font-display text-lg font-black text-on-surface">{policy.limit}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest mb-1">Utilization</p>
                      <p className={cn(
                        "font-display text-lg font-black transition-colors",
                        policy.utilized > 80 ? "text-red-500" : policy.utilized > 40 ? "text-orange-500" : "text-primary"
                      )}>{policy.utilized}%</p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden shadow-inner flex items-center">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${policy.utilized}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={cn(
                        "h-full rounded-full",
                        policy.utilized > 80 ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" : policy.utilized > 40 ? "bg-orange-500" : "bg-primary"
                      )}
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-8 pt-6 border-t border-gray-50 group-hover:border-primary/10 transition-colors">
                  <button className="flex-1 py-3 bg-gray-50 text-on-surface font-bold text-xs rounded-xl hover:bg-gray-100 transition-colors uppercase tracking-widest flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" />
                    View Doc
                  </button>
                  <button className="flex-1 py-3 bg-gray-50 text-on-surface font-bold text-xs rounded-xl hover:bg-gray-100 transition-colors uppercase tracking-widest flex items-center justify-center gap-2 text-primary">
                    <History className="w-4 h-4" />
                    Claims
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

const HelpCenterView = () => {
  const [activeSubTab, setActiveSubTab] = useState<'faq' | 'contact'>('faq');
  
  const faqs = [
    { question: "How do I add a new policy?", answer: "Click on 'Add New Policy' in your dashboard or 'Scan' in the mobile app to upload your document. Our AI will automatically parse the details for you." },
    { question: "What does 'Coverage Gap' mean?", answer: "A coverage gap occurs when your current insurance policies don't fully protect you against specific risks. Our AI identifies these based on your profile and industry standards." },
    { question: "How long does a claim take to process?", answer: "Most claims are processed within 3-5 business days. You can track the real-time status under the 'Claims History' tab." },
    { question: "Can I cancel a policy through the app?", answer: "Currently, you need to contact your agent or insurer to cancel. We can, however, prepare the necessary documents for you." },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-display text-3xl font-bold text-on-surface">Help Center</h2>
          <p className="text-on-surface-variant mt-1">Found the answers you're looking for or talk to your specialist.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
          <button 
            onClick={() => setActiveSubTab('faq')}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-bold transition-all",
              activeSubTab === 'faq' ? "bg-primary text-white shadow-md shadow-primary/20" : "text-on-surface-variant hover:bg-gray-50"
            )}
          >
            FAQs
          </button>
          <button 
            onClick={() => setActiveSubTab('contact')}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-bold transition-all",
              activeSubTab === 'contact' ? "bg-primary text-white shadow-md shadow-primary/20" : "text-on-surface-variant hover:bg-gray-50"
            )}
          >
            Your Agent
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'faq' ? (
          <motion.div 
            key="faq"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-primary transition-all group">
                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h4 className="font-display text-lg font-bold text-on-surface mb-2">{faq.question}</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="agent"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-1/3 bg-primary-container p-10 flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <img 
                    src="/src/assets/images/insurance_agent_avatar_1778829243604.png" 
                    alt="Sarah Chen" 
                    className="w-32 h-32 rounded-[2rem] object-cover shadow-2xl border-4 border-white/20"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-primary-container"></div>
                </div>
                <h3 className="font-display text-2xl font-bold text-white uppercase tracking-wider">Sarah Chen</h3>
                <p className="text-white/70 text-xs font-bold uppercase tracking-[0.2em] mt-1">Personal Specialist</p>
                <div className="mt-8 space-y-4 w-full">
                  <div className="bg-white/10 p-3 rounded-xl flex items-center gap-3">
                    <Star className="w-4 h-4 text-orange-300 fill-orange-300" />
                    <span className="text-white text-sm font-bold">4.9 / 5.0 Rating</span>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl flex items-center gap-3">
                    <History className="w-4 h-4 text-white/50" />
                    <span className="text-white text-sm font-bold">8 Years Experience</span>
                  </div>
                </div>
              </div>
              
              <div className="lg:w-2/3 p-10 lg:p-14">
                <h4 className="font-display text-2xl font-bold text-on-surface mb-6 underline decoration-primary decoration-4 underline-offset-8">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Email Address</p>
                    <p className="font-bold text-on-surface flex items-center gap-2">
                       sarah.chen@insurehelp.com
                       <ExternalLink className="w-3.5 h-3.5 text-primary" />
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Direct Phone</p>
                    <p className="font-bold text-on-surface flex items-center gap-2">
                       +65 9123 4567
                       <ExternalLink className="w-3.5 h-3.5 text-primary" />
                    </p>
                  </div>
                </div>
                
                <h4 className="font-display text-2xl font-bold text-on-surface mb-6 underline decoration-primary decoration-4 underline-offset-8">Expertise Areas</h4>
                <div className="flex flex-wrap gap-2 mb-10">
                  {['Wealth Management', 'Critical Illness', 'Hospitalization', 'Estate Planning'].map(tag => (
                    <span key={tag} className="px-4 py-2 bg-gray-50 text-on-surface text-xs font-bold rounded-lg border border-gray-100 uppercase tracking-widest">{tag}</span>
                  ))}
                </div>
                
                <div className="flex gap-4">
                  <button className="flex-1 bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all">
                    Schedule a Consultation
                  </button>
                  <button className="px-6 border-2 border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <Bell className="w-5 h-5 text-on-surface-variant" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-gray-900 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-md">
            <h3 className="font-display text-2xl font-bold mb-2">Still can't find what you need?</h3>
            <p className="text-white/60 text-sm">Our community forum and official documentation are available 24/7 for you to explore.</p>
          </div>
          <div className="flex gap-4">
            <button className="px-8 py-3 bg-white text-gray-900 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all">
              Join Forum
            </button>
            <button className="px-8 py-3 bg-gray-800 text-white rounded-xl font-bold border border-white/10 hover:bg-gray-700 transition-all">
              Documentation
            </button>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/20 rounded-full blur-[100px]"></div>
      </div>
    </motion.div>
  );
};

const SettingsView = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <div>
        <h2 className="font-display text-3xl font-bold text-on-surface">Account Settings</h2>
        <p className="text-on-surface-variant mt-1">Manage your personal profile, privacy, and app preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Section */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                <UserIcon className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-on-surface">Profile Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  type="text" 
                  defaultValue="Andrew Tan" 
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-on-surface focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Email Address</label>
                <input 
                  type="email" 
                  defaultValue="andztan@gmail.com" 
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-on-surface focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Phone Number</label>
                <input 
                  type="tel" 
                  defaultValue="+65 9876 5432" 
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-on-surface focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Country</label>
                <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-on-surface focus:border-primary outline-none transition-all">
                  <option>Singapore</option>
                  <option>Malaysia</option>
                  <option>Indonesia</option>
                </select>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-50 flex justify-end">
              <button className="bg-primary text-white px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-md shadow-primary/10">
                Save Changes
              </button>
            </div>
          </div>

          {/* Privacy & Security Section */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-orange-50 rounded-2xl text-orange-600">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-on-surface">Security & Privacy</h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-xl text-on-surface-variant">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">Two-Factor Authentication</h4>
                    <p className="text-[11px] text-on-surface-variant">Secure your account with an extra layer of protection.</p>
                  </div>
                </div>
                <button className="text-xs font-black text-primary hover:underline uppercase tracking-tighter">Enable</button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-xl text-on-surface-variant">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">Data Sharing</h4>
                    <p className="text-[11px] text-on-surface-variant">Allow Insure Help to share insights with your medical providers.</p>
                  </div>
                </div>
                <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer shadow-inner">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Notifications Section */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-purple-50 rounded-2xl text-purple-600">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-on-surface">Notifications</h3>
            </div>
            
            <div className="space-y-6">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between group">
                  <span className="text-sm font-bold text-on-surface-variant group-hover:text-primary transition-colors capitalize">{key} Alerts</span>
                  <div 
                    onClick={() => setNotifications(prev => ({ ...prev, [key]: !value }))}
                    className={cn(
                      "w-10 h-5 rounded-full relative cursor-pointer transition-colors shadow-inner",
                      value ? "bg-primary" : "bg-gray-200"
                    )}
                  >
                    <motion.div 
                      animate={{ x: value ? 20 : 0 }}
                      className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden">
            <h3 className="font-display text-xl font-bold mb-6 relative z-10">Advanced</h3>
            <div className="space-y-4 relative z-10">
              <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all">
                Export My Data
              </button>
              <button className="w-full py-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all border border-red-500/30">
                Delete Account
              </button>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Header = ({ activeTab }: { activeTab: string }) => {
  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'policies': return 'My Policies';
      case 'claims': return 'Claims History';
      case 'pricing': return 'Pricing Plans';
      case 'settings': return 'Settings';
      case 'help': return 'Help Center';
      default: return 'Insure Help';
    }
  };

  return (
    <header className="w-full top-0 sticky z-40 bg-white shadow-sm border-b border-gray-100 h-16 flex justify-between items-center px-6 md:px-10">
      <div className="flex items-center">
        <Menu className="md:hidden text-primary mr-4 cursor-pointer" />
        <h1 className="font-display text-xl font-bold text-primary md:hidden">Insure Help</h1>
        <div className="hidden md:block">
           <h1 className="font-display text-xl font-bold text-primary">{getTitle()}</h1>
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="hidden md:flex items-center space-x-2 text-on-surface-variant cursor-pointer hover:bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 transition-colors">
          <Search className="w-4 h-4" />
          <span className="text-sm font-medium">Search analytics...</span>
        </div>
        
        <div className="relative cursor-pointer hover:bg-gray-50 p-2 rounded-full transition-colors border border-gray-100">
          <Bell className="w-5 h-5 text-on-surface-variant" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </div>
        
        <img 
          alt="User" 
          className="w-9 h-9 rounded-full border-2 border-primary-container cursor-pointer shadow-sm hover:scale-105 transition-transform" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCweMV92ht3OxAeWewO4pWGSpy3qJzClJrjEdVrBY5gw1fXvyW4RFXpsKiKh3JV4WwpFoGc-m4bgH-FJGcI-ULsbT1091fmYTUjBMy7biSZoo8PKeUV40DGlFJ6g477eNXvWVcgULpni8uveJHwcjPKaA4QPZ_xwrlRQ-5kVr9ojOqpGtbp4N5m01MOOEW9lsRiT3Yb8EO6hfQjVcBx4IJASQfi-vpeDgEcFRuwrea310dzToNT3-MDVaHV3mu70AvcdpXDWyuFtJKT" 
          referrerPolicy="no-referrer"
        />
      </div>
    </header>
  );
};

const SummaryCard = ({ 
  title, 
  value, 
  label, 
  icon: Icon, 
  percentage, 
  statusColor, 
  statusLabel 
}: { 
  title: string, 
  value: string, 
  label: string, 
  icon: any, 
  percentage: number, 
  statusColor: string, 
  statusLabel: string 
}) => (
  <motion.div 
    whileHover={{ y: -4 }}
    className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-2 rounded-xl bg-opacity-10", statusColor.replace('bg-', 'text-').replace('-500', '-600'))}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-xs font-bold text-on-surface-variant bg-gray-50 px-2 py-1 rounded-lg uppercase tracking-wider">{title}</span>
    </div>
    <h3 className="font-display text-2xl font-bold text-on-surface">{value}</h3>
    <p className="text-xs font-medium text-on-surface-variant mb-4">{label}</p>
    
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={cn("h-full rounded-full", statusColor)}
      />
    </div>
    <p className={cn("text-xs font-bold mt-2", statusColor.replace('bg-', 'text-').replace('-500', '-600'))}>
      {statusLabel}
    </p>
  </motion.div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [medicalQuery, setMedicalQuery] = useState('Knee Replacement');
  const [policies, setPolicies] = useState<Policy[]>(INITIAL_POLICIES);
  const [claims, setClaims] = useState<ClaimHistoryItem[]>(INITIAL_CLAIMS);
  const [isScanning, setIsScanning] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<ClaimSimulationResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isRecommendationsOpen, setIsRecommendationsOpen] = useState(false);
  const [medisaveBalance, setMedisaveBalance] = useState({
    balance: "$48,500",
    monthlyContribution: "$450",
    lastUpdated: "12 May 2024"
  });

  const handleScan = () => {
    setIsScanning(true);
    setValidationError(null);
    // Simulate OCR/AI parsing
    setTimeout(() => {
      const newPolicy: Policy = {
        id: Math.random().toString(36).substr(2, 9),
        name: 'New Life Secure',
        type: 'Hospital',
        limit: '$50,000',
        utilized: 0,
        description: 'New Aggregate Data',
        issuer: 'New Insurer',
        premium: 500
      };
      setPolicies(prev => [newPolicy, ...prev]);
      setIsScanning(false);
    }, 2000);
  };

  const validateInput = (input: string) => {
    if (!input.trim()) return "Please enter a medical condition.";
    if (input.length < 3) return "Condition name is too short.";
    if (/[<>{}]/.test(input)) return "Invalid characters used.";
    return null;
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMedicalQuery(e.target.value);
    if (validationError) setValidationError(null);
  };

  const runSimulation = async () => {
    const error = validateInput(medicalQuery);
    if (error) {
      setValidationError(error);
      return;
    }

    setIsSimulating(true);
    setValidationError(null);
    
    try {
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this medical condition: "${medicalQuery}" in the context of a typical insurance policy's coverage. 
        Return a JSON object matching this structure:
        {
          "claimable": [{"policyName": string, "maxAmount": string, "reason": string}],
          "exclusions": [string],
          "recommendations": [{"name": string, "competency": string, "rating": string, "distance": string}],
          "estOutOfPocket": string
        }
        Use realistic values for a Singapore-based health system context.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              claimable: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    policyName: { type: Type.STRING },
                    maxAmount: { type: Type.STRING },
                    reason: { type: Type.STRING }
                  },
                  required: ["policyName", "maxAmount", "reason"]
                }
              },
              exclusions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    competency: { type: Type.STRING },
                    rating: { type: Type.STRING },
                    distance: { type: Type.STRING }
                  },
                  required: ["name", "competency", "rating", "distance"]
                }
              },
              estOutOfPocket: { type: Type.STRING }
            },
            required: ["claimable", "exclusions", "recommendations", "estOutOfPocket"]
          }
        }
      });

      if (response.text) {
        setSimulationResult(JSON.parse(response.text));
      }
    } catch (error) {
      console.error("Simulation failed:", error);
      // Fallback data
      setSimulationResult({
        claimable: [
          { policyName: "Income Shield Plus", maxAmount: "$12,500", reason: "Main Medical Plan" },
          { policyName: "Personal Accident Elite", maxAmount: "$3,000", reason: "Injury-related Clause" }
        ],
        exclusions: [
          "Private Hospitals Excluded (Plan only covers Public)",
          "Physiotherapy limited to 10 sessions",
          "20% reduction due to pre-existing clause"
        ],
        recommendations: [
          { name: "Mount Elizabeth Novena", competency: "Orthopedic Surgery", rating: "4.8", distance: "2.4 km" },
          { name: "Gleneagles Hospital", competency: "Sports Medicine Unit", rating: "4.5", distance: "4.1 km" }
        ],
        estOutOfPocket: "$1,200"
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      runSimulation();
    }
  };

  useEffect(() => {
    runSimulation();
  }, []);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'Hospital': return Hospital;
      case 'Outpatient': return Stethoscope;
      case 'A&E': return Activity;
      case 'Travel': return Plane;
      case 'Accident': return HeartPulse;
      default: return Info;
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleCopySummary = () => {
    // Logic for copying summary
    console.log("Summary copied");
  };

  const totalPremium = policies.reduce((acc, p) => acc + (p.premium || 0), 0);

  return (
    <div className="flex h-screen overflow-hidden font-sans selection:bg-primary/20 selection:text-primary">
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      
      <main className="flex-1 ml-0 md:ml-72 overflow-y-auto bg-surface-cool min-h-screen">
        <Header activeTab={activeTab} />
        
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-10"
              >
                {/* Section: Welcome & Aggregation Summary */}
                <section>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex items-center gap-2 mb-1">
                   <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                   <p className="text-xs font-black text-primary uppercase tracking-[0.2em]">Welcome back</p>
                </div>
                <h2 className="font-display text-4xl font-bold text-on-surface">John Doe</h2>
                <p className="text-on-surface-variant mt-1 italic">Managing {policies.length} active policies across 4 providers</p>
              </motion.div>
              <div className="flex flex-wrap gap-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5 pr-8"
                >
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Total Premiums</p>
                    <p className="text-xl font-black text-on-surface">${totalPremium.toLocaleString()} <span className="text-xs font-normal text-on-surface-variant">/ year</span></p>
                  </div>
                </motion.div>
                <button 
                  onClick={handleCopySummary}
                  className="bg-white text-primary border-2 border-primary/20 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all active:scale-95 flex items-center gap-2 focus:ring-2 focus:ring-primary focus:outline-none"
                  aria-label="Copy aggregation summary to clipboard"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Summary</span>
                </button>
                <button 
                  onClick={handleScan}
                  disabled={isScanning}
                  className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2 border-2 border-primary disabled:opacity-50 focus:ring-2 focus:ring-white focus:outline-none"
                  aria-label={isScanning ? "Scanning policy" : "Add new policy documents"}
                >
                  {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>{isScanning ? 'Adding...' : 'Add New Policy'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0 }}
              >
                <SummaryCard 
                  title="MediSave" 
                  value={medisaveBalance.balance} 
                  label="CPF Medical Savings" 
                  icon={ShieldCheck} 
                  percentage={100} 
                  statusColor="bg-red-500" 
                  statusLabel={`+${medisaveBalance.monthlyContribution} / mo`} 
                />
              </motion.div>
              {policies.map((policy, idx) => (
                <motion.div
                  key={policy.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (idx + 1) * 0.1 }}
                >
                  <SummaryCard 
                    title={policy.type} 
                    value={policy.limit} 
                    label={policy.description} 
                    icon={getIconForType(policy.type)} 
                    percentage={policy.utilized} 
                    statusColor={policy.utilized > 50 ? "bg-orange-500" : "bg-primary"} 
                    statusLabel={policy.utilized === 0 ? "No active usage" : policy.utilized === 100 ? "Fully utilized" : `${policy.utilized}% utilized`} 
                  />
                </motion.div>
              ))}
            </div>
          </section>

          {/* Grid Layout for Scan, Exclusions, and Gaps */}
          <div className="grid grid-cols-12 gap-8">
            {/* Scan Policy Section */}
            <div className="col-span-12 lg:col-span-4 h-full">
              <div className="bg-white p-8 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 hover:border-primary transition-all h-full group">
                <div className="w-20 h-20 bg-primary/5 text-primary rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <CloudUpload className="w-10 h-10" />
                </div>
                <h3 className="font-display text-xl font-bold text-on-surface">Scan New Policy</h3>
                <p className="text-sm text-on-surface-variant mt-2 mb-8 px-4">
                  Drag and drop your PDF or scan the QR code from your policy document to aggregate data.
                </p>
                <button 
                  onClick={handleScan}
                  disabled={isScanning}
                  className="w-full bg-primary text-white font-bold py-4 rounded-xl flex items-center justify-center space-x-3 hover:opacity-95 shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                  aria-label="Upload policy document"
                >
                  {isScanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  <span>{isScanning ? 'Processing...' : 'Select Files'}</span>
                </button>
                <div className="mt-8 flex items-center space-x-4 bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100">
                  <QrCode className="w-5 h-5 text-on-surface-variant" />
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Use Mobile App to Scan</span>
                </div>
              </div>
            </div>

            {/* Medical Exclusions & Coverage Gaps */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                {/* Medical Exclusions */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="p-2 bg-red-50 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-on-surface">Medical Exclusions</h3>
                  </div>
                  <div className="space-y-4 flex-1">
                    {[
                      { 
                        title: "Pre-existing Diabetes Type 2", 
                        subtitle: "Excluded from Policy #INS-8821 until Jan 2026",
                        icon: XCircle,
                        color: "text-red-500",
                        bg: "bg-red-50"
                      },
                      { 
                        title: "Cosmetic Surgery & Elective", 
                        subtitle: "Universal exclusion across all integrated policies",
                        icon: XCircle,
                        color: "text-red-500",
                        bg: "bg-red-50"
                      },
                      { 
                        title: "Alternative Medicine Limit", 
                        subtitle: "Capped at $500/year for TCM & Chiropractic",
                        icon: Info,
                        color: "text-orange-500",
                        bg: "bg-orange-50"
                      }
                    ].map((item, i) => (
                      <div key={i} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-2xl border border-gray-100/50 hover:bg-white hover:border-gray-200 transition-all duration-200 cursor-default">
                        <item.icon className={cn("w-5 h-5 mt-0.5", item.color)} />
                        <div>
                          <p className="font-bold text-sm text-on-surface">{item.title}</p>
                          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{item.subtitle}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coverage Gaps */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="p-2 bg-primary/5 rounded-lg">
                      <Activity className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-on-surface">Coverage Gaps</h3>
                  </div>
                  <div className="space-y-4 flex-1">
                    <div className="p-4 bg-surface-warm rounded-2xl border border-primary/10 relative overflow-hidden group hover:border-primary transition-colors">
                      <div className="relative z-10">
                        <p className="font-bold text-sm text-primary">Low Critical Illness Coverage</p>
                        <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">Current: $100k. Recommended: $450k (based on income).</p>
                        <button 
                          onClick={() => setIsRecommendationsOpen(true)}
                          className="flex items-center gap-1 mt-3 font-bold text-xs text-primary group-hover:underline"
                        >
                          See Recommended Plans <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                      <p className="font-bold text-sm text-on-surface">Missing: Early Cancer Shield</p>
                      <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">None of your current policies cover stage 0 cancer detection.</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                      <p className="font-bold text-sm text-on-surface">Deductible Risk</p>
                      <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">Total deductible across policies: $3,500. Consider a Rider.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Smart Claim Assistant */}
          <section className="col-span-12">
            <div className="bg-primary p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-container/20 rounded-full -ml-20 -mb-20 blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row gap-12">
                  <div className="lg:w-1/3">
                    <h2 className="font-display text-4xl font-extrabold text-white leading-tight">Smart Claim Assistant</h2>
                    <p className="text-white/80 mt-3 font-medium text-lg">Check coverage and find pre-approved panel hospitals instantly.</p>
                    
                    <div className="mt-10 bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl">
                      <label htmlFor="medical-query-input" className="block text-sm font-bold text-white mb-4 uppercase tracking-widest opacity-80">Medical Condition</label>
                      <div className="relative">
                        <input 
                          id="medical-query-input"
                          type="text" 
                          value={medicalQuery}
                          onChange={handleQueryChange}
                          onKeyDown={handleKeyDown}
                          className={cn(
                            "w-full bg-white/20 border-2 text-white placeholder:text-white/60 font-bold py-4 px-6 rounded-2xl focus:ring-4 focus:ring-white/20 outline-none transition-all text-lg shadow-inner",
                            validationError ? "border-red-400" : "border-white/30 focus:border-white/50"
                          )}
                          placeholder="e.g. Cataract Surgery..."
                          aria-invalid={!!validationError}
                          aria-errormessage={validationError ? "medical-query-error" : undefined}
                        />
                        <Search className="absolute right-5 top-5 w-6 h-6 text-white/50" />
                      </div>
                      
                      <AnimatePresence>
                        {validationError && (
                          <motion.p 
                            id="medical-query-error"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-red-300 text-xs font-bold mt-2 ml-1"
                            role="alert"
                          >
                            {validationError}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      <button 
                        onClick={runSimulation}
                        disabled={isSimulating}
                        className="w-full mt-6 bg-white text-primary font-bold py-5 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-black/20 flex items-center justify-center gap-3 group text-lg disabled:opacity-70 disabled:scale-100 font-display focus:ring-4 focus:ring-white/30 focus:outline-none"
                        aria-label="Analyze coverage for this condition"
                      >
                        {isSimulating ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Zap className="w-5 h-5 group-hover:animate-pulse" />
                        )}
                        <span>{isSimulating ? 'Analyzing...' : 'Run Coverage Simulation'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="lg:w-2/3 flex flex-col gap-8">
                    <AnimatePresence mode="wait">
                      {isSimulating ? (
                        <motion.div 
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex-1 flex flex-col items-center justify-center bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-12 min-h-[400px]"
                        >
                          <Loader2 className="w-12 h-12 text-white animate-spin mb-6" />
                          <p className="text-white font-display text-2xl font-bold">Analyzing Policies...</p>
                          <p className="text-white/60 mt-2">Connecting with insurance panels & checking exclusions</p>
                        </motion.div>
                      ) : simulationResult && (
                        <motion.div 
                          key="result"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="grid grid-cols-1 md:grid-cols-2 gap-8"
                        >
                          {/* Claimable Results */}
                          <div className="bg-white p-8 rounded-3xl shadow-xl border border-white/10 flex flex-col">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-5 mb-6">
                              <h3 className="text-xs font-extrabold text-primary uppercase tracking-[0.2em]">Claimable Policies</h3>
                              <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full border border-primary/20">{simulationResult.claimable.length} MATCHES</span>
                            </div>
                            <div className="space-y-4">
                              {simulationResult.claimable.map((plan, i) => (
                                <div key={i} className="p-4 bg-gray-50 rounded-2xl border-l-4 border-primary hover:shadow-md transition-all duration-300">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-bold text-sm text-on-surface">{plan.policyName}</p>
                                      <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest mt-1">{plan.reason}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-display text-xl font-black text-primary">{plan.maxAmount}</p>
                                      <p className="text-[9px] font-bold text-on-surface-variant/60 uppercase tracking-tighter">Max Coverage</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              <div className="pt-4 border-t border-gray-100 flex justify-between items-center px-2">
                                <div className="flex items-center gap-2">
                                  <Info className="w-4 h-4 text-red-500" />
                                  <span className="text-xs font-bold text-on-surface-variant">Est. Out-of-pocket</span>
                                </div>
                                <span className="font-display text-xl font-black text-red-500">{simulationResult.estOutOfPocket}</span>
                              </div>
                            </div>
                          </div>

                          {/* Exclusions area */}
                          <div className="bg-white p-8 rounded-3xl shadow-xl border border-white/10 flex flex-col">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-5 mb-6">
                              <h3 className="text-xs font-extrabold text-red-600 uppercase tracking-[0.2em]">Exclusions & Gaps</h3>
                            </div>
                            <div className="space-y-3">
                              {simulationResult.exclusions.map((exclusion, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl border border-transparent hover:border-gray-100 transition-all cursor-default bg-red-50/50">
                                  <XCircle className="w-5 h-5 mt-0.5 text-red-500" />
                                  <div>
                                    <p className="font-bold text-sm text-on-surface">Policy Restriction</p>
                                    <p className="text-[11px] text-on-surface-variant mt-1 font-medium leading-relaxed">{exclusion}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Facilities section */}
                          <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 md:col-span-2">
                            <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-100 pb-5 mb-8 gap-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-xl">
                                  <Hospital className="w-5 h-5 text-primary" />
                                </div>
                                <h3 className="text-xs font-extrabold text-primary uppercase tracking-[0.2em]">Recommended Panel Facilities</h3>
                              </div>
                              <button className="text-primary font-bold text-xs flex items-center hover:bg-primary/5 px-4 py-2 rounded-full transition-all border border-primary/10">
                                View Digital Map <ExternalLink className="w-3.5 h-3.5 ml-2" />
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {simulationResult.recommendations.map((facility, i) => (
                                <div key={i} className="p-5 border-2 border-gray-100 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group relative overflow-hidden">
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-primary/10 text-primary rounded-xl group-hover:scale-110 transition-transform">
                                      <Hospital className="w-5 h-5" />
                                    </div>
                                    <CheckCircle2 className="w-5 h-5 text-primary fill-primary/10" />
                                  </div>
                                  <p className="font-display font-bold text-sm mb-1 group-hover:text-primary transition-colors">{facility.name}</p>
                                  <p className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-widest mb-4">{facility.competency}</p>
                                  <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-on-surface">
                                      <Star className="w-3 h-3 text-orange-400 fill-orange-400" />
                                      {facility.rating}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-on-surface/60">
                                      <MapPin className="w-3 h-3" />
                                      {facility.distance}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </section>
              </motion.div>
            )}

            {activeTab === 'claims' && (
              <ClaimsHistoryView claims={claims} />
            )}

            {activeTab === 'policies' && (
              <PoliciesListView policies={policies} onAddPolicy={handleScan} />
            )}

            {activeTab === 'help' && (
              <HelpCenterView />
            )}

            {activeTab === 'pricing' && (
              <PricingView />
            )}

            {activeTab === 'settings' && (
              <SettingsView />
            )}

            {activeTab !== 'dashboard' && activeTab !== 'claims' && activeTab !== 'pricing' && activeTab !== 'policies' && activeTab !== 'help' && activeTab !== 'settings' && (
              <motion.div
                key="other"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm"
              >
                <div className="p-6 bg-gray-50 rounded-full mb-6">
                  <Settings className="w-12 h-12 text-gray-300 animate-pulse" />
                </div>
                <h3 className="font-display text-2xl font-bold text-on-surface">Tab under construction</h3>
                <p className="text-on-surface-variant mt-2 max-w-sm text-center">We're building something great here. Please check back later or use the Dashboard.</p>
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className="mt-8 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all"
                >
                  Back to Dashboard
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Area */}
          <footer className="pt-12 pb-16 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <ShieldCheck className="text-primary/40 w-6 h-6" />
              <p className="text-sm font-medium text-on-surface-variant/70">
                © 2024 Insure Help Digital. All coverage information is periodically synced.
              </p>
            </div>
            <div className="flex gap-8">
              {['Privacy Policy', 'Terms of Service', 'Security Trust'].map((link) => (
                <a key={link} href="#" className="text-sm font-bold text-on-surface-variant/50 hover:text-primary hover:underline transition-all uppercase tracking-widest">
                  {link}
                </a>
              ))}
            </div>
          </footer>
        </div>

        {/* Mobile Navbar */}
        <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center py-4 bg-white border-t border-gray-100 md:hidden z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]" role="navigation" aria-label="Mobile Navigation">
           <button 
             onClick={() => handleTabChange('dashboard')} 
             className="flex flex-col items-center gap-1 group focus:outline-none"
             aria-label="Go to Dashboard"
             aria-current={activeTab === 'dashboard' ? 'page' : undefined}
           >
             <LayoutDashboard className={cn("w-6 h-6", activeTab === 'dashboard' ? "text-primary" : "text-gray-400 group-hover:text-primary")} />
             <span className={cn("text-[10px] font-bold uppercase", activeTab === 'dashboard' ? "text-primary" : "text-gray-400")}>Home</span>
           </button>
           <button 
             onClick={() => handleTabChange('claims')} 
             className="flex flex-col items-center gap-1 group focus:outline-none"
             aria-label="View Claims History"
             aria-current={activeTab === 'claims' ? 'page' : undefined}
           >
             <History className={cn("w-6 h-6", activeTab === 'claims' ? "text-primary" : "text-gray-400 group-hover:text-primary")} />
             <span className={cn("text-[10px] font-bold uppercase", activeTab === 'claims' ? "text-primary" : "text-gray-400")}>Claims</span>
           </button>
           <button 
             onClick={handleScan} 
             disabled={isScanning} 
             className="flex flex-col items-center gap-1 -mt-8 group focus:outline-none"
             aria-label={isScanning ? "Processing document" : "Scan new policy document"}
           >
             <div className="p-4 bg-primary rounded-full shadow-lg shadow-primary/40 text-white active:scale-95 transition-transform group-focus:ring-4 group-focus:ring-primary/40">
                {isScanning ? <Loader2 className="w-6 h-6 animate-spin" /> : <CloudUpload className="w-6 h-6" />}
             </div>
             <span className="text-[10px] font-bold text-primary uppercase mt-1">{isScanning ? 'Adding...' : 'Scan'}</span>
           </button>
           <button 
             onClick={() => handleTabChange('policies')} 
             className="flex flex-col items-center gap-1 group focus:outline-none"
             aria-label="View All Policies"
             aria-current={activeTab === 'policies' ? 'page' : undefined}
           >
             <FileText className={cn("w-6 h-6", activeTab === 'policies' ? "text-primary" : "text-gray-400 group-hover:text-primary")} />
             <span className={cn("text-[10px] font-bold uppercase", activeTab === 'policies' ? "text-primary" : "text-gray-400")}>Policies</span>
           </button>
           <button 
             onClick={() => handleTabChange('settings')} 
             className="flex flex-col items-center gap-1 group focus:outline-none"
             aria-label="Open Settings Menu"
             aria-current={activeTab === 'settings' ? 'page' : undefined}
           >
             <Settings className={cn("w-6 h-6", activeTab === 'settings' ? "text-primary" : "text-gray-400 group-hover:text-primary")} />
             <span className={cn("text-[10px] font-bold uppercase", activeTab === 'settings' ? "text-primary" : "text-gray-400")}>Menu</span>
           </button>
        </nav>
      </main>
      <RecommendationsModal 
        isOpen={isRecommendationsOpen} 
        onClose={() => setIsRecommendationsOpen(false)} 
      />
    </div>
  );
}
