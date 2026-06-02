"use client";

import { useState } from "react";
import { Calculator, TrendingUp, DollarSign, Users } from "lucide-react";
import GlassCard from "./GlassCard";

export default function ROICalculator() {
  const [leadsPerMonth, setLeadsPerMonth] = useState(200);
  const [currentConversion, setCurrentConversion] = useState(8);
  const [avgDealValue, setAvgDealValue] = useState(500);

  const aiConversionRate = Math.min(currentConversion * 3, 30);
  const currentRevenue = Math.round((leadsPerMonth * currentConversion) / 100 * avgDealValue);
  const aiRevenue = Math.round((leadsPerMonth * aiConversionRate) / 100 * avgDealValue);
  const additionalRevenue = aiRevenue - currentRevenue;
  const roi = Math.round(((additionalRevenue - 99) / 99) * 100);
  const roiDisplay = roi > 1000 ? "1,000%+" : `${roi}%`;

  return (
    <GlassCard className="p-6 md:p-8" hover={false}>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Calculator className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">ROI Calculator</h3>
      </div>

      <div className="space-y-5">
        <div>
          <label className="flex justify-between text-sm mb-2">
            <span className="text-gray-500 dark:text-gray-400">Leads per month</span>
            <span className="font-semibold text-gray-900 dark:text-white">{leadsPerMonth}</span>
          </label>
          <input
            type="range"
            min="50"
            max="1000"
            step="10"
            value={leadsPerMonth}
            onChange={(e) => setLeadsPerMonth(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="flex justify-between text-sm mb-2">
            <span className="text-gray-500 dark:text-gray-400">Current conversion rate</span>
            <span className="font-semibold text-gray-900 dark:text-white">{currentConversion}%</span>
          </label>
          <input
            type="range"
            min="1"
            max="25"
            step="1"
            value={currentConversion}
            onChange={(e) => setCurrentConversion(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="flex justify-between text-sm mb-2">
            <span className="text-gray-500 dark:text-gray-400">Average deal value ($)</span>
            <span className="font-semibold text-gray-900 dark:text-white">${avgDealValue.toLocaleString()}</span>
          </label>
          <input
            type="range"
            min="100"
            max="5000"
            step="100"
            value={avgDealValue}
            onChange={(e) => setAvgDealValue(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="glass rounded-xl p-4 text-center">
          <DollarSign className="h-5 w-5 mx-auto mb-1 text-gray-400" />
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Revenue</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">${currentRevenue.toLocaleString()}</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <TrendingUp className="h-5 w-5 mx-auto mb-1 text-accent" />
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">With AI</p>
          <p className="text-lg font-bold text-accent">${aiRevenue.toLocaleString()}</p>
        </div>
        <div className="glass rounded-xl p-4 text-center col-span-2">
          <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Additional Monthly Revenue</p>
          <p className="text-2xl font-bold gradient-text">
            +${additionalRevenue.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            ROI: <span className="text-accent font-semibold">{roiDisplay}</span>
          </p>
        </div>
      </div>
    </GlassCard>
  );
}