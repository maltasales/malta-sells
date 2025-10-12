"use client";

import { useState, useEffect, useMemo } from 'react';
import { X, ArrowLeft, Calculator, TrendingUp, DollarSign, Clock, FileText, CheckCircle, AlertCircle } from 'lucide-react';

// Bank data with Malta banks
const MALTA_BANKS = [
  {
    id: 'bov',
    name: 'Bank of Valletta',
    shortName: 'BOV',
    logo: 'https://customer-assets.emergentagent.com/job_malta-bazaar/artifacts/z9i3mll9_BOV-Image.jpg',
    minDeposit: 10,
    maxTerm: 40,
    rates: {
      variable: 4.75,
      fixed: 5.25,
    },
    fees: {
      arrangement: 500,
      valuation: 150,
      legal: 800,
    },
    color: '#003366',
    features: ['Up to 40 years term', 'Low minimum deposit', 'Established since 1974'],
  },
  {
    id: 'aps',
    name: 'APS Bank',
    shortName: 'APS',
    logo: 'https://customer-assets.emergentagent.com/job_malta-bazaar/artifacts/tj89d1vt_6687b571e36833fe4e907555_400x400-APSLogo-01.webp',
    minDeposit: 10,
    maxTerm: 35,
    rates: {
      variable: 4.65,
      fixed: 5.15,
    },
    fees: {
      arrangement: 450,
      valuation: 150,
      legal: 750,
    },
    color: '#00a651',
    features: ['Lowest interest rates', 'Competitive fees', 'Fast approval process'],
  },
  {
    id: 'hsbc',
    name: 'HSBC Malta',
    shortName: 'HSBC',
    logo: 'https://customer-assets.emergentagent.com/job_malta-bazaar/artifacts/sbp2t4eh_download.jpeg',
    minDeposit: 15,
    maxTerm: 35,
    rates: {
      variable: 4.90,
      fixed: 5.40,
    },
    fees: {
      arrangement: 600,
      valuation: 200,
      legal: 900,
    },
    color: '#db0011',
    features: ['Global banking network', 'Premium service', 'Flexible options'],
  },
];

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return `€${Math.round(amount).toLocaleString('en-US')}`;
};

// Helper function to format percentage
const formatPercent = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

// Calculate mortgage details using amortization formula
const calculateMortgage = (
  propertyPrice: number,
  depositPercent: number,
  termYears: number,
  annualRate: number,
  fees: { arrangement: number; valuation: number; legal: number }
) => {
  const deposit = propertyPrice * (depositPercent / 100);
  const loanAmount = propertyPrice - deposit;
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = termYears * 12;

  // Monthly payment formula: M = P[i(1+i)^n]/[(1+i)^n-1]
  const monthlyPayment =
    loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);

  const totalPayment = monthlyPayment * numPayments;
  const totalInterest = totalPayment - loanAmount;
  const totalFees = fees.arrangement + fees.valuation + fees.legal;
  const totalCost = totalPayment + totalFees + deposit;

  // Generate payment schedule for first 12 months
  let remainingBalance = loanAmount;
  const schedule = [];
  
  for (let month = 1; month <= Math.min(12, numPayments); month++) {
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    remainingBalance -= principalPayment;

    schedule.push({
      month,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance: remainingBalance,
    });
  }

  return {
    deposit,
    loanAmount,
    monthlyPayment,
    totalPayment,
    totalInterest,
    totalFees,
    totalCost,
    schedule,
  };
};

interface MortgageCalculatorProps {
  propertyPrice: number;
  propertyId: string;
}

export default function MortgageCalculator({ propertyPrice, propertyId }: MortgageCalculatorProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState<typeof MALTA_BANKS[0] | null>(null);
  const [depositPercent, setDepositPercent] = useState(20);
  const [loanTerm, setLoanTerm] = useState(25);
  const [interestType, setInterestType] = useState<'variable' | 'fixed'>('variable');
  const [showComparison, setShowComparison] = useState(false);

  // Calculate estimates for all banks
  const bankEstimates = useMemo(() => {
    return MALTA_BANKS.map(bank => {
      const rate = interestType === 'variable' ? bank.rates.variable : bank.rates.fixed;
      const calculation = calculateMortgage(
        propertyPrice,
        Math.max(depositPercent, bank.minDeposit),
        Math.min(loanTerm, bank.maxTerm),
        rate,
        bank.fees
      );
      return {
        bank,
        calculation,
      };
    });
  }, [propertyPrice, depositPercent, loanTerm, interestType]);

  // Find best deal
  const bestDeal = useMemo(() => {
    return bankEstimates.reduce((best, current) => 
      current.calculation.totalCost < best.calculation.totalCost ? current : best
    );
  }, [bankEstimates]);

  // Current calculation for selected bank
  const currentCalculation = useMemo(() => {
    if (!selectedBank) return null;
    const rate = interestType === 'variable' ? selectedBank.rates.variable : selectedBank.rates.fixed;
    return calculateMortgage(propertyPrice, depositPercent, loanTerm, rate, selectedBank.fees);
  }, [selectedBank, propertyPrice, depositPercent, loanTerm, interestType]);

  // Reset when modal closes
  useEffect(() => {
    if (!showModal) {
      setSelectedBank(null);
      setShowComparison(false);
    }
  }, [showModal]);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center justify-center space-x-2 py-3 px-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-[#D12C1D] transition-all duration-200 shadow-sm w-full"
        data-testid="banks-calculator-button"
      >
        <Calculator className="w-4 h-4 text-[#D12C1D]" />
        <span className="text-sm font-medium text-gray-700">Bank's Calculators</span>
      </button>

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div 
            className="bg-white w-full md:max-w-4xl md:rounded-xl rounded-t-xl max-h-[95vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 md:rounded-t-xl z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {(selectedBank || showComparison) && (
                    <button
                      onClick={() => {
                        if (showComparison) {
                          setShowComparison(false);
                        } else {
                          setSelectedBank(null);
                        }
                      }}
                      className="p-1 hover:bg-white/20 rounded-full transition-colors"
                      data-testid="back-button"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  )}
                  <div>
                    <h2 className="text-xl font-bold">
                      {showComparison ? 'Compare Banks' : selectedBank ? selectedBank.name : 'Mortgage Calculator'}
                    </h2>
                    <p className="text-sm text-blue-100 mt-0.5">
                      Property Price: {formatCurrency(propertyPrice)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  data-testid="close-calculator-button"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 md:p-6">
              {!selectedBank && !showComparison ? (
                // Bank Selection Screen
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Your Bank</h3>
                    <p className="text-sm text-gray-600">Compare mortgage offers from Malta's leading banks</p>
                  </div>

                  {/* Interest Type Toggle */}
                  <div className="flex items-center justify-center space-x-2 p-1 bg-gray-100 rounded-lg w-fit mx-auto">
                    <button
                      onClick={() => setInterestType('variable')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        interestType === 'variable'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      data-testid="variable-rate-toggle"
                    >
                      Variable Rate
                    </button>
                    <button
                      onClick={() => setInterestType('fixed')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        interestType === 'fixed'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      data-testid="fixed-rate-toggle"
                    >
                      Fixed Rate
                    </button>
                  </div>

                  {/* Bank Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {bankEstimates.map(({ bank, calculation }) => {
                      const isBest = bank.id === bestDeal.bank.id;
                      return (
                        <div
                          key={bank.id}
                          onClick={() => setSelectedBank(bank)}
                          className="relative border-2 border-gray-200 rounded-xl p-5 cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all duration-200 bg-white"
                          data-testid={`bank-card-${bank.id}`}
                        >
                          {isBest && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                              <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center space-x-1">
                                <CheckCircle className="w-3 h-3" />
                                <span>Best Deal</span>
                              </span>
                            </div>
                          )}

                          {/* Bank Logo */}
                          <div className="flex justify-center mb-4">
                            <img
                              src={bank.logo}
                              alt={bank.name}
                              className="h-16 w-auto object-contain"
                            />
                          </div>

                          {/* Bank Name */}
                          <h4 className="text-lg font-bold text-center text-gray-900 mb-4">
                            {bank.name}
                          </h4>

                          {/* Monthly Payment - Large Display */}
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 mb-4">
                            <p className="text-xs text-gray-600 text-center mb-1">Monthly Payment</p>
                            <p className="text-2xl font-bold text-center" style={{ color: bank.color }}>
                              {formatCurrency(calculation.monthlyPayment)}
                            </p>
                            <p className="text-xs text-gray-500 text-center mt-1">
                              {formatPercent(bank.rates[interestType])} {interestType}
                            </p>
                          </div>

                          {/* Key Features */}
                          <div className="space-y-2 mb-4">
                            {bank.features.slice(0, 2).map((feature, idx) => (
                              <div key={idx} className="flex items-start space-x-2 text-xs text-gray-600">
                                <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>

                          {/* CTA Button */}
                          <button
                            className="w-full py-2.5 rounded-lg text-white font-medium text-sm hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: bank.color }}
                          >
                            Calculate
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Compare All Button */}
                  <button
                    onClick={() => setShowComparison(true)}
                    className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
                    data-testid="compare-all-banks-button"
                  >
                    <TrendingUp className="w-5 h-5" />
                    <span>Compare All Banks Side by Side</span>
                  </button>
                </div>
              ) : showComparison ? (
                // Comparison View
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">Comparison Based On:</h4>
                        <div className="text-sm text-blue-800 space-y-1">
                          <p>• Property Price: {formatCurrency(propertyPrice)}</p>
                          <p>• Deposit: {depositPercent}% ({formatCurrency(propertyPrice * depositPercent / 100)})</p>
                          <p>• Term: {loanTerm} years</p>
                          <p>• Rate Type: {interestType === 'variable' ? 'Variable' : 'Fixed'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comparison Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="text-left p-3 font-semibold text-gray-900 border-b-2 border-gray-300">Bank</th>
                          <th className="text-right p-3 font-semibold text-gray-900 border-b-2 border-gray-300">Monthly</th>
                          <th className="text-right p-3 font-semibold text-gray-900 border-b-2 border-gray-300">Interest Rate</th>
                          <th className="text-right p-3 font-semibold text-gray-900 border-b-2 border-gray-300">Total Interest</th>
                          <th className="text-right p-3 font-semibold text-gray-900 border-b-2 border-gray-300">Total Fees</th>
                          <th className="text-right p-3 font-semibold text-gray-900 border-b-2 border-gray-300">Total Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bankEstimates.map(({ bank, calculation }) => {
                          const isBest = bank.id === bestDeal.bank.id;
                          const savings = isBest ? 0 : calculation.totalCost - bestDeal.calculation.totalCost;
                          
                          return (
                            <tr
                              key={bank.id}
                              className={`border-b border-gray-200 hover:bg-gray-50 ${
                                isBest ? 'bg-green-50' : ''
                              }`}
                            >
                              <td className="p-3">
                                <div className="flex items-center space-x-3">
                                  <img src={bank.logo} alt={bank.name} className="h-8 w-auto object-contain" />
                                  <div>
                                    <p className="font-semibold text-gray-900">{bank.shortName}</p>
                                    {isBest && (
                                      <span className="text-xs text-green-600 font-medium">Best Deal</span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 text-right">
                                <p className="font-bold text-gray-900">{formatCurrency(calculation.monthlyPayment)}</p>
                              </td>
                              <td className="p-3 text-right">
                                <p className="text-gray-700">{formatPercent(bank.rates[interestType])}</p>
                              </td>
                              <td className="p-3 text-right">
                                <p className="text-gray-700">{formatCurrency(calculation.totalInterest)}</p>
                              </td>
                              <td className="p-3 text-right">
                                <p className="text-gray-700">{formatCurrency(calculation.totalFees)}</p>
                              </td>
                              <td className="p-3 text-right">
                                <div>
                                  <p className="font-bold text-gray-900">{formatCurrency(calculation.totalCost)}</p>
                                  {!isBest && (
                                    <p className="text-xs text-red-600">+{formatCurrency(savings)}</p>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Individual Calculate Buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {MALTA_BANKS.map(bank => (
                      <button
                        key={bank.id}
                        onClick={() => {
                          setSelectedBank(bank);
                          setShowComparison(false);
                        }}
                        className="py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: bank.color }}
                        data-testid={`calculate-${bank.id}-button`}
                      >
                        Calculate with {bank.shortName}
                      </button>
                    ))}
                  </div>
                </div>
              ) : selectedBank && currentCalculation ? (
                // Detailed Calculator for Selected Bank
                <div className="space-y-6">
                  {/* Bank Header */}
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <img src={selectedBank.logo} alt={selectedBank.name} className="h-12 w-auto object-contain" />
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{selectedBank.name}</h3>
                      <p className="text-sm text-gray-600">Mortgage Calculator</p>
                    </div>
                  </div>

                  {/* Interest Type Toggle */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate Type</label>
                    <div className="flex items-center space-x-2 p-1 bg-gray-100 rounded-lg w-full">
                      <button
                        onClick={() => setInterestType('variable')}
                        className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                          interestType === 'variable'
                            ? 'bg-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                        style={interestType === 'variable' ? { color: selectedBank.color } : {}}
                      >
                        Variable {formatPercent(selectedBank.rates.variable)}
                      </button>
                      <button
                        onClick={() => setInterestType('fixed')}
                        className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                          interestType === 'fixed'
                            ? 'bg-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                        style={interestType === 'fixed' ? { color: selectedBank.color } : {}}
                      >
                        Fixed {formatPercent(selectedBank.rates.fixed)}
                      </button>
                    </div>
                  </div>

                  {/* Deposit Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Deposit</label>
                      <span className="text-sm font-bold text-gray-900">
                        {depositPercent}% ({formatCurrency(currentCalculation.deposit)})
                      </span>
                    </div>
                    <input
                      type="range"
                      min={selectedBank.minDeposit}
                      max="50"
                      step="1"
                      value={depositPercent}
                      onChange={(e) => setDepositPercent(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      data-testid="deposit-slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{selectedBank.minDeposit}% (min)</span>
                      <span>50%</span>
                    </div>
                  </div>

                  {/* Loan Term Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Loan Term</label>
                      <span className="text-sm font-bold text-gray-900">{loanTerm} years</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max={selectedBank.maxTerm}
                      step="1"
                      value={loanTerm}
                      onChange={(e) => setLoanTerm(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      data-testid="loan-term-slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>5 years</span>
                      <span>{selectedBank.maxTerm} years (max)</span>
                    </div>
                  </div>

                  {/* Large Monthly Payment Display */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center border-2 border-blue-200">
                    <p className="text-sm text-gray-600 mb-2">Your Monthly Payment</p>
                    <p className="text-4xl md:text-5xl font-bold mb-2" style={{ color: selectedBank.color }}>
                      {formatCurrency(currentCalculation.monthlyPayment)}
                    </p>
                    <p className="text-sm text-gray-600">
                      at {formatPercent(selectedBank.rates[interestType])} {interestType} rate
                    </p>
                  </div>

                  {/* Complete Breakdown */}
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <DollarSign className="w-5 h-5 mr-2" style={{ color: selectedBank.color }} />
                      Complete Breakdown
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Property Price</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(propertyPrice)}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Deposit ({depositPercent}%)</span>
                        <span className="font-semibold text-green-600">-{formatCurrency(currentCalculation.deposit)}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Loan Amount</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(currentCalculation.loanAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Interest Rate ({interestType})</span>
                        <span className="font-semibold text-gray-900">{formatPercent(selectedBank.rates[interestType])}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Loan Term</span>
                        <span className="font-semibold text-gray-900">{loanTerm} years</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Monthly Payment</span>
                        <span className="font-bold" style={{ color: selectedBank.color }}>
                          {formatCurrency(currentCalculation.monthlyPayment)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Total Payment ({loanTerm} years)</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(currentCalculation.totalPayment)}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Total Interest</span>
                        <span className="font-semibold text-red-600">{formatCurrency(currentCalculation.totalInterest)}</span>
                      </div>
                      <div className="bg-gray-50 -mx-5 -mb-5 mt-4 p-5 rounded-b-lg">
                        <div className="space-y-2">
                          <h5 className="text-xs font-semibold text-gray-700 mb-2">Additional Costs</h5>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-600">Arrangement Fee</span>
                            <span className="text-gray-900">{formatCurrency(selectedBank.fees.arrangement)}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-600">Valuation Fee</span>
                            <span className="text-gray-900">{formatCurrency(selectedBank.fees.valuation)}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-600">Legal Fees</span>
                            <span className="text-gray-900">{formatCurrency(selectedBank.fees.legal)}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs pt-2 border-t border-gray-200">
                            <span className="text-gray-600">Total Fees</span>
                            <span className="font-semibold text-gray-900">{formatCurrency(currentCalculation.totalFees)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total Cost Summary */}
                  <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-5 text-white">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-300 mb-1">Total Cost of Mortgage</p>
                        <p className="text-xs text-gray-400">Including deposit, interest, and all fees</p>
                      </div>
                      <p className="text-3xl font-bold">{formatCurrency(currentCalculation.totalCost)}</p>
                    </div>
                  </div>

                  {/* Payment Schedule */}
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2" style={{ color: selectedBank.color }} />
                      Payment Schedule (First 12 Months)
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 text-gray-700 font-medium">Month</th>
                            <th className="text-right py-2 text-gray-700 font-medium">Payment</th>
                            <th className="text-right py-2 text-gray-700 font-medium">Principal</th>
                            <th className="text-right py-2 text-gray-700 font-medium">Interest</th>
                            <th className="text-right py-2 text-gray-700 font-medium">Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentCalculation.schedule.map((month) => (
                            <tr key={month.month} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-2 text-gray-600">{month.month}</td>
                              <td className="text-right py-2 text-gray-900">{formatCurrency(month.payment)}</td>
                              <td className="text-right py-2 text-green-600">{formatCurrency(month.principal)}</td>
                              <td className="text-right py-2 text-red-600">{formatCurrency(month.interest)}</td>
                              <td className="text-right py-2 text-gray-900 font-medium">{formatCurrency(month.balance)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                    <button
                      onClick={() => setShowComparison(true)}
                      className="py-3 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                      data-testid="compare-banks-button"
                    >
                      Compare Banks
                    </button>
                    <button
                      className="py-3 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: selectedBank.color }}
                      data-testid="apply-with-bank-button"
                    >
                      Apply with {selectedBank.shortName}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
