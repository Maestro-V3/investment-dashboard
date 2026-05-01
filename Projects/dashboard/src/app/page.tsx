"use client";

import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, Area, Bar
} from 'recharts';
import { 
  Building2, Globe, Mail, Send, CheckCircle2, UserPlus, 
  DollarSign, TrendingUp, Target, BarChart3, Settings2, Wrench, Code2, Cpu, ChevronDown, AlertCircle, Users, Network
} from 'lucide-react';

export default function Dashboard() {
  // --- STATE: Inputs ---
  // Scale
  const [numCompanies, setNumCompanies] = useState(3);
  const [domainsPerCompany, setDomainsPerCompany] = useState(25);
  const [mailboxesPerDomain, setMailboxesPerDomain] = useState(2);
  
  // Funnel
  const [emailsPerDayPerMailbox, setEmailsPerDayPerMailbox] = useState(20);
  const [emailsPerLeadPerMonth, setEmailsPerLeadPerMonth] = useState(3);
  const [positiveReplyRate, setPositiveReplyRate] = useState(0.5); // %
  const [conversionRate, setConversionRate] = useState(10); // %
  
  // Lead Sourcing
  const [leadsFromUpload, setLeadsFromUpload] = useState(0);
  const [leadsFromSearch, setLeadsFromSearch] = useState(0);

  // Financials
  const [avgClientTpv, setAvgClientTpv] = useState(50000);
  const [takeRate, setTakeRate] = useState(0.40); // %
  const [profitMargin, setProfitMargin] = useState(30); // %

  // Costs
  const [costPerDomain, setCostPerDomain] = useState(1);
  const [systemCreationCost, setSystemCreationCost] = useState(250);

  // Chart View State
  const [chartView, setChartView] = useState<'profitability' | 'emails_cost' | 'emails_clients' | 'cost_clients'>('profitability');

  // --- CALCULATIONS ---
  const calculations = useMemo(() => {
    // 1. MailScale Plan Logic (Global)
    const totalMailboxesGlobally = numCompanies * domainsPerCompany * mailboxesPerDomain;

    let mailscaleTotalCost = 0;
    let mailscalePlanName = '';
    let totalMailboxCapacity = 0;

    if (totalMailboxesGlobally > 0) {
      if (totalMailboxesGlobally <= 50) {
        mailscaleTotalCost = 119;
        mailscalePlanName = 'Business';
        totalMailboxCapacity = 50;
      } else if (totalMailboxesGlobally <= 200) {
        mailscaleTotalCost = 249;
        mailscalePlanName = 'Enterprise';
        totalMailboxCapacity = 200;
      } else {
        const numEnterprisePlans = Math.ceil(totalMailboxesGlobally / 200);
        mailscaleTotalCost = numEnterprisePlans * 249;
        mailscalePlanName = `${numEnterprisePlans}x Enterprise`;
        totalMailboxCapacity = numEnterprisePlans * 200;
      }
    }

    // 2. Funnel Volumes (Monthly = 30 days)
    const totalDailyEmails = totalMailboxesGlobally * emailsPerDayPerMailbox;
    const totalMonthlyEmails = totalDailyEmails * 30;
    
    // 3. Leads and Instantly Logic
    const totalLeadsContacted = emailsPerLeadPerMonth > 0 ? totalMonthlyEmails / emailsPerLeadPerMonth : 0;
    
    // Instantly Lead Credits Cost
    // Using user-provided sourcing quantities if they exist, otherwise fallback to funnel needs
    const usedLeadsFromUpload = leadsFromUpload > 0 ? leadsFromUpload : 0;
    const usedLeadsFromSearch = leadsFromSearch > 0 ? leadsFromSearch : (leadsFromUpload > 0 ? 0 : totalLeadsContacted);

    const totalInstantlyCreditsNeeded = (usedLeadsFromUpload * 0.5) + (usedLeadsFromSearch * 2);
    let instantlyLeadsCost = 0;
    let instantlyLeadsPlanName = '';
    
    if (totalInstantlyCreditsNeeded > 0) {
      if (totalInstantlyCreditsNeeded <= 10000) {
        instantlyLeadsCost = 197;
        instantlyLeadsPlanName = '10k Leads ($197)';
      } else if (totalInstantlyCreditsNeeded <= 20000) {
        instantlyLeadsCost = 300;
        instantlyLeadsPlanName = '20k Leads ($300)';
      } else if (totalInstantlyCreditsNeeded <= 45000) {
        instantlyLeadsCost = 500;
        instantlyLeadsPlanName = '45k Leads ($500)';
      } else if (totalInstantlyCreditsNeeded <= 100000) {
        instantlyLeadsCost = 997;
        instantlyLeadsPlanName = '100k Leads ($997)';
      } else if (totalInstantlyCreditsNeeded <= 150000) {
        instantlyLeadsCost = 1400;
        instantlyLeadsPlanName = '150k Leads ($1400)';
      } else if (totalInstantlyCreditsNeeded <= 200000) {
        instantlyLeadsCost = 1700;
        instantlyLeadsPlanName = '200k Leads ($1700)';
      } else {
        const numMaxPlans = Math.ceil(totalInstantlyCreditsNeeded / 200000);
        instantlyLeadsCost = numMaxPlans * 1700;
        instantlyLeadsPlanName = `${numMaxPlans}x 200k Leads ($${instantlyLeadsCost})`;
      }
    }

    // Instantly Sending Plan Cost
    let instantlySendingCost = 0;
    let instantlySendingPlanName = '';

    if (totalMonthlyEmails > 0 || totalLeadsContacted > 0) {
      if (totalMonthlyEmails <= 5000 && totalLeadsContacted <= 1000) {
        instantlySendingCost = 47;
        instantlySendingPlanName = 'Growth ($47)';
      } else if (totalMonthlyEmails <= 100000 && totalLeadsContacted <= 25000) {
        instantlySendingCost = 97;
        instantlySendingPlanName = 'Hypergrowth ($97)';
      } else if (totalMonthlyEmails <= 500000 && totalLeadsContacted <= 100000) {
        instantlySendingCost = 358;
        instantlySendingPlanName = 'Light Speed ($358)';
      } else {
        const emailStacks = Math.ceil(totalMonthlyEmails / 500000);
        const contactStacks = Math.ceil(totalLeadsContacted / 100000);
        const stacksNeeded = Math.max(emailStacks, contactStacks);
        instantlySendingCost = stacksNeeded * 358;
        instantlySendingPlanName = `${stacksNeeded}x Light Speed ($${instantlySendingCost})`;
      }
    }

    const instantlyTotalCost = instantlyLeadsCost + instantlySendingCost;

    // Follow-up Diminishing Returns Logic
    let followUpMultiplier = 0;
    for(let i = 1; i <= emailsPerLeadPerMonth; i++) {
      if (i === 1) followUpMultiplier += 1.0;       // 1st email: 100% of base rate
      else if (i === 2) followUpMultiplier += 0.6;  // 2nd email: 60% of base rate
      else if (i === 3) followUpMultiplier += 0.4;  // 3rd email: 40% of base rate
      else if (i === 4) followUpMultiplier += 0.2;  // 4th email: 20% of base rate
      else followUpMultiplier += 0.1;               // 5th+ email: 10% of base rate
    }
    if (emailsPerLeadPerMonth === 0) followUpMultiplier = 0;

    const totalPositiveReplies = totalLeadsContacted * (positiveReplyRate / 100) * followUpMultiplier;
    const totalClientsAcquired = totalPositiveReplies * (conversionRate / 100);

    // 4. Fixed Costs
    const domainsCost = numCompanies * domainsPerCompany * costPerDomain;
    const mailboxesCost = mailscaleTotalCost;
    const totalFixedMonthlyCost = domainsCost + mailboxesCost + instantlyTotalCost + systemCreationCost;

    // 5. Revenue & ROI
    const netProfitPerClient = avgClientTpv * (takeRate / 100) * (profitMargin / 100);
    const totalMonthlyNetProfit = totalClientsAcquired * netProfitPerClient;
    
    const roi = totalFixedMonthlyCost > 0 
      ? ((totalMonthlyNetProfit - totalFixedMonthlyCost) / totalFixedMonthlyCost) * 100 
      : 0;

    const breakevenClients = netProfitPerClient > 0 
      ? totalFixedMonthlyCost / netProfitPerClient 
      : 0;

    // Profit Potential of unused mailboxes
    const unusedMailboxes = totalMailboxCapacity - totalMailboxesGlobally;
    const additionalEmails = unusedMailboxes * emailsPerDayPerMailbox * 30;
    const additionalLeads = emailsPerLeadPerMonth > 0 ? additionalEmails / emailsPerLeadPerMonth : 0;
    const additionalReplies = additionalLeads * (positiveReplyRate / 100) * followUpMultiplier;
    const additionalClients = additionalReplies * (conversionRate / 100);
    const additionalNetProfit = additionalClients * netProfitPerClient;

    return {
      totalMailboxesGlobally,
      mailscalePlanName,
      totalMailboxCapacity,
      unusedMailboxes,
      additionalNetProfit,
      totalLeadsContacted,
      instantlyLeadsPlanName,
      instantlySendingPlanName,
      instantlyTotalCost,
      domainsCost,
      mailboxesCost,
      systemCreationCost,
      totalFixedMonthlyCost,
      totalMonthlyEmails,
      totalPositiveReplies,
      totalClientsAcquired,
      netProfitPerClient,
      totalMonthlyNetProfit,
      roi,
      breakevenClients,
      followUpMultiplier // Exposing for UI description
    };
  }, [
    numCompanies, domainsPerCompany, mailboxesPerDomain, costPerDomain, 
    conversionRate, avgClientTpv, takeRate, profitMargin, leadsFromUpload, leadsFromSearch
  ]);

  // --- CHART DATA GENERATION ---
  const chartData = useMemo(() => {
    const data = [];
    
    let followUpMultiplier = 0;
    for(let i = 1; i <= emailsPerLeadPerMonth; i++) {
      if (i === 1) followUpMultiplier += 1.0;
      else if (i === 2) followUpMultiplier += 0.6;
      else if (i === 3) followUpMultiplier += 0.4;
      else if (i === 4) followUpMultiplier += 0.2;
      else followUpMultiplier += 0.1;
    }
    if (emailsPerLeadPerMonth === 0) followUpMultiplier = 0;

    for (let i = 1; i <= 10; i++) {
      const totalMailboxesGlobally = i * domainsPerCompany * mailboxesPerDomain;
      
      let mailscaleTotalCost = 0;
      if (totalMailboxesGlobally > 0) {
        if (totalMailboxesGlobally <= 50) mailscaleTotalCost = 119;
        else if (totalMailboxesGlobally <= 200) mailscaleTotalCost = 249;
        else mailscaleTotalCost = Math.ceil(totalMailboxesGlobally / 200) * 249;
      }

      const simEmails = totalMailboxesGlobally * emailsPerDayPerMailbox * 30;
      const simLeadsContacted = emailsPerLeadPerMonth > 0 ? simEmails / emailsPerLeadPerMonth : 0;
      
      // Calculate mix ratio for simulation based on current manual inputs
      const totalManualLeads = leadsFromUpload + leadsFromSearch;
      const uploadRatio = totalManualLeads > 0 ? leadsFromUpload / totalManualLeads : 0;
      const searchRatio = totalManualLeads > 0 ? leadsFromSearch / totalManualLeads : 1;

      // Sim Instantly Leads Cost
      const simInstantlyCredits = (simLeadsContacted * uploadRatio * 0.5) + (simLeadsContacted * searchRatio * 2);
      let instantlyLeadsCost = 0;
      if (simInstantlyCredits > 0) {
        if (simInstantlyCredits <= 10000) instantlyLeadsCost = 197;
        else if (simInstantlyCredits <= 20000) instantlyLeadsCost = 300;
        else if (simInstantlyCredits <= 45000) instantlyLeadsCost = 500;
        else if (simInstantlyCredits <= 100000) instantlyLeadsCost = 997;
        else if (simInstantlyCredits <= 150000) instantlyLeadsCost = 1400;
        else if (simInstantlyCredits <= 200000) instantlyLeadsCost = 1700;
        else instantlyLeadsCost = Math.ceil(simInstantlyCredits / 200000) * 1700;
      }

      // Sim Instantly Sending Cost
      let instantlySendingCost = 0;
      if (simEmails > 0 || simLeadsContacted > 0) {
        if (simEmails <= 5000 && simLeadsContacted <= 1000) instantlySendingCost = 47;
        else if (simEmails <= 100000 && simLeadsContacted <= 25000) instantlySendingCost = 97;
        else if (simEmails <= 500000 && simLeadsContacted <= 100000) instantlySendingCost = 358;
        else {
          const emailStacks = Math.ceil(simEmails / 500000);
          const contactStacks = Math.ceil(simLeadsContacted / 100000);
          instantlySendingCost = Math.max(emailStacks, contactStacks) * 358;
        }
      }

      const instantlyTotalCost = instantlyLeadsCost + instantlySendingCost;

      const simDomainsCost = i * domainsPerCompany * costPerDomain;
      const simMailboxesCost = mailscaleTotalCost;
      const simTotalCost = simDomainsCost + simMailboxesCost + instantlyTotalCost + systemCreationCost;

      const simReplies = simLeadsContacted * (positiveReplyRate / 100) * followUpMultiplier;
      const simClients = simReplies * (conversionRate / 100);
      
      const simNetProfitPerClient = avgClientTpv * (takeRate / 100) * (profitMargin / 100);
      const simTotalProfit = simClients * simNetProfitPerClient;

      data.push({
        companies: i,
        emails: Math.round(simEmails),
        clients: Math.round(simClients),
        cost: simTotalCost,
        profit: simTotalProfit,
      });
    }
    return data;
  }, [
    avgClientTpv, takeRate, profitMargin, leadsFromUpload, leadsFromSearch
  ]);

  // --- 12-MONTH COMPOUNDING LTV CHART DATA ---
  const ltvChartData = useMemo(() => {
    const data = [];
    let cumulativeProfit = 0;
    let activeClients = 0;
    
    for (let month = 1; month <= 12; month++) {
      // The Snowball Effect: We acquire a new cohort of clients every single month
      // AND we retain the clients from previous months (100% retention modeled).
      activeClients += calculations.totalClientsAcquired; 
      
      const monthlyRevenue = activeClients * calculations.netProfitPerClient;
      // We subtract the fixed marketing cost ONCE per month for the machine to keep running.
      const monthlyNetProfit = monthlyRevenue - calculations.totalFixedMonthlyCost;
      
      cumulativeProfit += monthlyNetProfit;
      
      data.push({
        month: `Month ${month}`,
        activeClients: Math.round(activeClients),
        monthlyCost: calculations.totalFixedMonthlyCost,
        monthlyProfit: monthlyNetProfit,
        cumulativeProfit: cumulativeProfit
      });
    }
    return data;
  }, [calculations]);

  // --- UTILS ---
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  const formatNumber = (val: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(val);

  return (
    <div className="min-h-screen p-4 lg:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8 max-w-[1600px] mx-auto pb-20">
      
      {/* LEFT PANEL: Controls (Sidebar) */}
      <aside className="w-full lg:w-[400px] flex-shrink-0 flex flex-col gap-6 relative">
        <div className="glass rounded-[2rem] p-6 lg:p-8 flex flex-col gap-8 h-full shadow-2xl sticky top-8 max-h-[calc(100vh-4rem)] z-20">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[#ededed] flex items-center gap-2 mb-1">
              <Settings2 className="w-6 h-6 text-blue-500" /> Dashboard Settings
            </h2>
            <p className="text-sm text-gray-400">Configure your scaling & funnel variables</p>
          </div>

          <div className="overflow-y-auto pr-2 space-y-8 flex-1 custom-scrollbar">
            
            {/* SCALE METRICS */}
            <section className="space-y-4">
              <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gray-500 border-b border-white/10 pb-2">Scale Setup</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300 flex items-center gap-2"><Building2 className="w-4 h-4"/> Companies</span>
                  <span className="font-mono text-white">{numCompanies}</span>
                </div>
                <input type="range" min="1" max="20" value={numCompanies} onChange={(e) => setNumCompanies(Number(e.target.value))} className="w-full" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 flex items-center gap-1"><Globe className="w-3 h-3"/> Domains / Co.</label>
                  <input type="number" value={domainsPerCompany} onChange={(e) => setDomainsPerCompany(Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 flex items-center gap-1"><Mail className="w-3 h-3"/> Mailboxes / Domain</label>
                  <input type="number" value={mailboxesPerDomain} onChange={(e) => setMailboxesPerDomain(Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Total Mailboxes Globally: <span className="font-mono text-white">{calculations.totalMailboxesGlobally}</span>
              </div>
            </section>

            {/* FUNNEL METRICS */}
            <section className="space-y-4">
              <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gray-500 border-b border-white/10 pb-2">Funnel Variables</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 flex items-center gap-1"><Send className="w-3 h-3"/> Emails / Day / Mailbox</label>
                  <input type="number" value={emailsPerDayPerMailbox} onChange={(e) => setEmailsPerDayPerMailbox(Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 flex items-center gap-1"><Users className="w-3 h-3"/> Emails / Lead / Month</label>
                  <input type="number" value={emailsPerLeadPerMonth} onChange={(e) => setEmailsPerLeadPerMonth(Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Base Reply Rate (%)</label>
                  <input type="number" step="0.01" value={positiveReplyRate} onChange={(e) => setPositiveReplyRate(Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 flex items-center gap-1"><UserPlus className="w-3 h-3"/> Convert Rate (%)</label>
                  <input type="number" step="0.1" value={conversionRate} onChange={(e) => setConversionRate(Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
              </div>
            </section>

            {/* LEAD SOURCING */}
            <section className="space-y-4">
              <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gray-500 border-b border-white/10 pb-2">Lead Sourcing (Monthly)</h3>
              
              <div className="space-y-2">
                <label className="text-xs text-gray-400 flex items-center gap-1">Leads Uploaded (Enrichment - 0.5 cr)</label>
                <input type="number" value={leadsFromUpload} onChange={(e) => setLeadsFromUpload(Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors" />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-400 flex items-center gap-1">Leads Purchased (Search - 2.0 cr)</label>
                <input type="number" value={leadsFromSearch} onChange={(e) => setLeadsFromSearch(Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors" />
              </div>

              <div className="text-[0.6rem] text-blue-500/80 bg-blue-500/5 p-2 rounded border border-blue-500/10">
                Tip: If values are 0, it defaults to sourcing 100% via search to match your scale.
              </div>
            </section>

            {/* FINANCIALS */}
            <section className="space-y-4">
              <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gray-500 border-b border-white/10 pb-2">Financials</h3>
              
              <div className="space-y-2">
                <label className="text-xs text-gray-400 flex items-center gap-1"><DollarSign className="w-3 h-3"/> Avg Client TPV ($)</label>
                <input type="number" step="1000" value={avgClientTpv} onChange={(e) => setAvgClientTpv(Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-400">Take Rate (%)</label>
                  <input type="number" step="0.01" value={takeRate} onChange={(e) => setTakeRate(Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-400">Profit Margin (%)</label>
                  <input type="number" step="1" value={profitMargin} onChange={(e) => setProfitMargin(Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
              </div>
            </section>

            {/* FIXED COSTS */}
            <section className="space-y-4">
              <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gray-500 border-b border-white/10 pb-2">Unit & Fixed Costs ($)</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-400">Per Domain</label>
                  <input type="number" step="0.1" value={costPerDomain} onChange={(e) => setCostPerDomain(Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-400">System Creation</label>
                  <input type="number" step="1" value={systemCreationCost} onChange={(e) => setSystemCreationCost(Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
              </div>
            </section>

          </div>
        </div>
      </aside>

      {/* RIGHT PANEL: Outputs & Visualizations */}
      <main className="flex-1 flex flex-col gap-8">
        
        <header>
          <h1 className="text-4xl lg:text-5xl font-medium tracking-tight text-white mb-2">
            MBN <span className="text-blue-500">ROI Matrix</span>
          </h1>
          <p className="text-gray-400">Marketing Return on Investment & Funnel Architecture</p>
        </header>

        {/* Funnel Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6">
          <MetricCard 
            title="Total Emails" 
            value={formatNumber(calculations.totalMonthlyEmails)} 
            icon={<Send className="w-5 h-5 text-gray-400"/>} 
          />
          <MetricCard 
            title="Leads Approached" 
            value={formatNumber(calculations.totalLeadsContacted)} 
            icon={<Users className="w-5 h-5 text-purple-400"/>} 
          />
          <MetricCard 
            title="Positive Replies" 
            value={formatNumber(calculations.totalPositiveReplies)} 
            icon={<CheckCircle2 className="w-5 h-5 text-green-400"/>} 
          />
          <MetricCard 
            title="Clients Acquired" 
            value={formatNumber(calculations.totalClientsAcquired)} 
            icon={<UserPlus className="w-5 h-5 text-blue-400"/>} 
            highlight
          />
        </div>

        {/* Financial Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard 
            title="Total Monthly Cost" 
            value={formatCurrency(calculations.totalFixedMonthlyCost)} 
            icon={<Target className="w-5 h-5 text-red-400"/>} 
          />
          <MetricCard 
            title="Monthly Net Profit" 
            value={formatCurrency(calculations.totalMonthlyNetProfit)} 
            icon={<DollarSign className="w-5 h-5 text-emerald-400"/>} 
            highlight
          />
          <MetricCard 
            title="Est. ROI" 
            value={`${formatNumber(calculations.roi)}%`} 
            icon={<TrendingUp className="w-5 h-5 text-blue-400"/>} 
          />
        </div>

        {/* Unused Capacity Alert */}
        {calculations.unusedMailboxes > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 flex items-start gap-4">
            <div className="p-2 bg-yellow-500/20 rounded-full shrink-0">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <h4 className="text-yellow-500 font-semibold text-sm mb-1">Untapped Profit Potential</h4>
              <p className="text-yellow-500/80 text-xs leading-relaxed">
                Your current MailScale <strong>{calculations.mailscalePlanName} Plan</strong> allows up to {calculations.totalMailboxCapacity} mailboxes. You are only using {calculations.totalMailboxesGlobally}.
                <br/>
                If you max out your remaining <strong>{calculations.unusedMailboxes} mailboxes</strong>, you could generate an estimated <strong>{formatCurrency(calculations.additionalNetProfit)}</strong> in additional net profit <em>without increasing your fixed costs</em>.
              </p>
            </div>
          </div>
        )}

        {/* Additional Stats Row */}
        <div className="glass rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col">
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gray-500">Net Profit / Client</span>
              <span className="text-xl font-mono text-white mt-1">{formatCurrency(calculations.netProfitPerClient)}</span>
            </div>
            <div className="w-px h-12 bg-white/10 hidden md:block"></div>
            <div className="flex flex-col md:text-right">
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gray-500">Breakeven Target</span>
              <span className="text-xl font-mono text-white mt-1">{formatNumber(calculations.breakevenClients)} Clients</span>
            </div>
        </div>

        {/* Chart Section */}
        <div className="glass rounded-[2rem] p-6 lg:p-8 h-[450px] lg:h-[550px] flex flex-col relative overflow-hidden group">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500 rounded-full blur-3xl opacity-10 transition-opacity duration-700 group-hover:opacity-20 pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
            <h3 className="text-xl font-medium tracking-tight text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" /> Matrix Analysis
            </h3>
            
            <div className="relative">
              <select 
                value={chartView} 
                onChange={(e) => setChartView(e.target.value as any)}
                className="appearance-none bg-black/50 border border-white/10 rounded-xl pl-4 pr-10 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500 transition-colors w-full md:w-auto cursor-pointer shadow-lg backdrop-blur-md"
              >
                <option value="profitability">Cost vs Profitability (by Companies Scale)</option>
                <option value="emails_cost">Emails Sent vs Cost</option>
                <option value="emails_clients">Emails Sent vs Clients Acquired</option>
                <option value="cost_clients">Monthly Cost vs Clients Acquired</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          
          <div className="flex-1 w-full h-full min-h-[300px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              {chartView === 'profitability' ? (
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" vertical={false} />
                  <XAxis 
                    dataKey="companies" 
                    stroke="#ffffff50" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    label={{ value: 'Number of Companies Scaled', position: 'bottom', fill: '#ffffff50', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#ffffff50" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', backdropFilter: 'blur(16px)' }}
                    itemStyle={{ color: '#ededed' }}
                    labelStyle={{ color: '#9ca3af', marginBottom: '0.5rem' }}
                    formatter={(value: any, name: any) => [formatCurrency(Number(value)), name === 'profit' ? 'Accumulated Profit' : 'Total Monthly Cost']}
                    labelFormatter={(label) => `${label} Companies (approx. ${formatNumber(chartData.find(d => d.companies === label)?.clients || 0)} clients)`}
                  />
                  <Line type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#0a0a0a', stroke: '#ef4444', strokeWidth: 2 }} activeDot={{ r: 6 }} name="cost" />
                  <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#0a0a0a', stroke: '#10b981', strokeWidth: 2 }} activeDot={{ r: 6 }} name="profit" />
                </LineChart>
              ) : chartView === 'emails_cost' ? (
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" vertical={false} />
                  <XAxis 
                    dataKey="emails" 
                    stroke="#ffffff50" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `${value / 1000}k`}
                    label={{ value: 'Monthly Emails Sent', position: 'bottom', fill: '#ffffff50', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#ffffff50" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', backdropFilter: 'blur(16px)' }}
                    itemStyle={{ color: '#ededed' }}
                    labelStyle={{ color: '#9ca3af', marginBottom: '0.5rem' }}
                    formatter={(value: any) => [formatCurrency(Number(value)), 'Total Monthly Cost']}
                    labelFormatter={(label) => `${formatNumber(Number(label))} Emails`}
                  />
                  <Line type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#0a0a0a', stroke: '#ef4444', strokeWidth: 2 }} activeDot={{ r: 6 }} name="cost" />
                </LineChart>
              ) : chartView === 'emails_clients' ? (
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" vertical={false} />
                  <XAxis 
                    dataKey="emails" 
                    stroke="#ffffff50" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `${value / 1000}k`}
                    label={{ value: 'Monthly Emails Sent', position: 'bottom', fill: '#ffffff50', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#ffffff50" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', backdropFilter: 'blur(16px)' }}
                    itemStyle={{ color: '#ededed' }}
                    labelStyle={{ color: '#9ca3af', marginBottom: '0.5rem' }}
                    formatter={(value: any) => [value, 'Clients Acquired']}
                    labelFormatter={(label) => `${formatNumber(Number(label))} Emails`}
                  />
                  <Line type="monotone" dataKey="clients" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#0a0a0a', stroke: '#3b82f6', strokeWidth: 2 }} activeDot={{ r: 6 }} name="clients" />
                </LineChart>
              ) : (
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" vertical={false} />
                  <XAxis 
                    dataKey="cost" 
                    stroke="#ffffff50" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `$${value / 1000}k`}
                    label={{ value: 'Total Monthly Cost', position: 'bottom', fill: '#ffffff50', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#ffffff50" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', backdropFilter: 'blur(16px)' }}
                    itemStyle={{ color: '#ededed' }}
                    labelStyle={{ color: '#9ca3af', marginBottom: '0.5rem' }}
                    formatter={(value: any) => [value, 'Clients Acquired']}
                    labelFormatter={(label) => `${formatCurrency(Number(label))} Cost`}
                  />
                  <Line type="monotone" dataKey="clients" stroke="#eab308" strokeWidth={3} dot={{ r: 4, fill: '#0a0a0a', stroke: '#eab308', strokeWidth: 2 }} activeDot={{ r: 6 }} name="clients" />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* SECTION 2: Tools & Cost Breakdown */}
        <section className="mt-4 flex flex-col gap-6">
          <header>
            <h2 className="text-2xl font-medium tracking-tight text-white mb-2 flex items-center gap-2">
              <Wrench className="w-6 h-6 text-blue-500" /> Tool Stack & Cost Breakdown
            </h2>
            <p className="text-gray-400">Individual operational costs calculated based on your scale parameters.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ToolCard 
              name="Domains (MailScale)"
              description={`${numCompanies} Companies × ${domainsPerCompany} Domains`}
              cost={calculations.domainsCost}
              icon={<Globe className="w-5 h-5 text-gray-400" />}
            />
            <ToolCard 
              name="Mailboxes (MailScale)"
              description={`${calculations.totalMailboxesGlobally} Mailboxes Total (${calculations.mailscalePlanName})`}
              cost={calculations.mailboxesCost}
              icon={<Mail className="w-5 h-5 text-gray-400" />}
            />
            <ToolCard 
              name="Instantly"
              description={`Sending: ${calculations.instantlySendingPlanName} | Leads: ${calculations.instantlyLeadsPlanName}`}
              cost={calculations.instantlyTotalCost}
              icon={<Send className="w-5 h-5 text-gray-400" />}
            />
            <ToolCard 
              name="System Creation"
              description="Claude Code / Antigravity AI maintenance."
              cost={calculations.systemCreationCost}
              icon={<Cpu className="w-5 h-5 text-gray-400" />}
            />
          </div>
        </section>

        {/* SECTION 3: Funnel Logic Breakdown */}
        <section className="mt-8 flex flex-col gap-6">
          <header>
            <h2 className="text-2xl font-medium tracking-tight text-white mb-2 flex items-center gap-2">
              <Network className="w-6 h-6 text-blue-500" /> Funnel Logic Step-by-Step
            </h2>
            <p className="text-gray-400">A clear breakdown of how the current inputs translate into the final financial results.</p>
          </header>

          <div className="flex flex-col gap-4">
            <StepCard 
              step="1"
              title="Infrastructure & Scale"
              description={`You are currently operating ${numCompanies} companies. With ${domainsPerCompany} domains per company and ${mailboxesPerDomain} mailboxes per domain, your infrastructure is composed of ${calculations.totalMailboxesGlobally} total mailboxes. This foundation incurs a fixed cost of ${formatCurrency(calculations.domainsCost)} for domains and ${formatCurrency(calculations.mailboxesCost)} for the mailboxes (using the MailScale ${calculations.mailscalePlanName} Plan).`}
              icon={<Building2 className="w-5 h-5 text-gray-400" />}
            />
            
            <StepCard 
              step="2"
              title="Lead Generation & Sourcing"
              description={`To utilize your mailboxes, you require leads. By targeting ${emailsPerLeadPerMonth} emails per lead per month, you need to approach ${formatNumber(calculations.totalLeadsContacted)} unique leads. Instantly handles both your email sending and lead enrichment, costing a total of ${formatCurrency(calculations.instantlyTotalCost)} this month (${calculations.instantlySendingPlanName} for sending + ${calculations.instantlyLeadsPlanName} for leads).`}
              icon={<Users className="w-5 h-5 text-purple-400" />}
            />
            
            <StepCard 
              step="3"
              title="Outreach Execution"
              description={`With your leads ready, each of your ${calculations.totalMailboxesGlobally} mailboxes sends ${emailsPerDayPerMailbox} emails per day. Operating over a 30-day period, this generates a massive volume of ${formatNumber(calculations.totalMonthlyEmails)} emails sent directly to your prospects' inboxes.`}
              icon={<Send className="w-5 h-5 text-blue-400" />}
            />
            
            <StepCard 
              step="4"
              title="Conversion & Sales"
              description={`Your base reply rate of ${positiveReplyRate}% is applied to the ${formatNumber(calculations.totalLeadsContacted)} unique leads. Because each lead receives ${emailsPerLeadPerMonth} follow-ups, the conversion multiplies by ${formatNumber(calculations.followUpMultiplier)}x (accounting for diminishing returns per follow-up). This yields ${formatNumber(calculations.totalPositiveReplies)} positive replies. Your sales team then closes ${conversionRate}% of these, resulting in ${formatNumber(calculations.totalClientsAcquired)} new clients this month.`}
              icon={<CheckCircle2 className="w-5 h-5 text-green-400" />}
            />
            
            <StepCard 
              step="5"
              title="Financial ROI & Profitability"
              description={`Each client processes an average TPV of ${formatCurrency(avgClientTpv)}. With an MBN take rate of ${takeRate}% and an operational profit margin of ${profitMargin}%, your net profit is ${formatCurrency(calculations.netProfitPerClient)} per client. Multiplying this by your ${formatNumber(calculations.totalClientsAcquired)} new clients yields a gross monthly profit of ${formatCurrency(calculations.totalMonthlyNetProfit)}. After deducting your ${formatCurrency(calculations.totalFixedMonthlyCost)} total monthly costs, you achieve an estimated ROI of ${formatNumber(calculations.roi)}%.`}
              icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
            />
          </div>
        </section>

        {/* SECTION 4: 12-Month Single Cohort LTV Projection */}
        <section className="mt-8 flex flex-col gap-6">
          <header>
            <h2 className="text-2xl font-medium tracking-tight text-white mb-2 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-500" /> 12-Month Compounding LTV Projection
            </h2>
            <p className="text-gray-400">Visualizing the snowball effect of the sales machine: acquiring new clients every month while retaining previous cohorts. Displays the compounding growth of active clients and exponential cumulative profit against a fixed monthly operation cost.</p>
          </header>

          <div className="glass rounded-[2rem] p-6 lg:p-8 h-[400px] lg:h-[500px] flex flex-col relative overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={ltvChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#ffffff50" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#ffffff50" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#ffffff50" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', backdropFilter: 'blur(16px)' }}
                  itemStyle={{ color: '#ededed' }}
                  labelStyle={{ color: '#9ca3af', marginBottom: '0.5rem' }}
                  formatter={(value: any, name: any) => [
                    name === 'activeClients' ? value : formatCurrency(Number(value)), 
                    name === 'cumulativeProfit' ? 'Cumulative Profit' : 
                    name === 'monthlyProfit' ? 'Monthly Net Profit' : 
                    name === 'monthlyCost' ? 'Monthly Fixed Cost' : 'Total Active Clients'
                  ]}
                />
                <Bar yAxisId="left" dataKey="monthlyCost" fill="#ef4444" radius={[4, 4, 0, 0]} name="monthlyCost" barSize={20} />
                <Bar yAxisId="left" dataKey="monthlyProfit" fill="#10b981" radius={[4, 4, 0, 0]} name="monthlyProfit" barSize={20} />
                <Area yAxisId="left" type="monotone" dataKey="cumulativeProfit" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCumulative)" name="cumulativeProfit" strokeWidth={3} />
                <Line yAxisId="right" type="monotone" dataKey="activeClients" stroke="#eab308" strokeWidth={2} dot={{ r: 4, fill: '#0a0a0a', stroke: '#eab308' }} name="activeClients" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </section>

      </main>

    </div>
  );
}

function MetricCard({ title, value, icon, highlight = false }: { title: string, value: string | number, icon: React.ReactNode, highlight?: boolean }) {
  return (
    <div className={`glass rounded-3xl p-6 relative overflow-hidden transition-all duration-500 hover:-translate-y-1 ${highlight ? 'glow border-blue-500/30' : ''}`}>
      {highlight && <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gray-400">{title}</span>
        <div className="p-2 bg-black/40 rounded-xl border border-white/5">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-medium tracking-tight text-white font-mono relative z-10">
        {value}
      </div>
    </div>
  );
}

function ToolCard({ name, description, cost, icon }: { name: string, description: string, cost: number, icon: React.ReactNode }) {
  return (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-6 hover:border-white/20 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-white/5 rounded-lg">
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-white">{name}</h3>
      </div>
      <p className="text-xs text-gray-500 mb-6 min-h-[32px]">{description}</p>
      
      <div className="pt-4 border-t border-white/5 flex items-end justify-between">
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gray-600">Monthly</span>
        <span className="text-lg font-mono text-white">
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cost)}
        </span>
      </div>
    </div>
  );
}

function StepCard({ step, title, description, icon }: { step: string, title: string, description: string, icon: React.ReactNode }) {
  return (
    <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 flex gap-6 items-start hover:border-white/10 transition-colors">
      <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
        <span className="text-blue-500 font-mono font-bold">{step}</span>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <h3 className="text-base font-semibold text-white">{title}</h3>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
