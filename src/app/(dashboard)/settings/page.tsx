"use client";

import React, { useState } from "react";
import {
  SlidersHorizontal,
  Building2,
  Receipt,
  Printer,
  Bell,
  Save,
  CheckCircle2,
  DollarSign,
  Percent,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);

  // Form State
  const [restaurantName, setRestaurantName] = useState("Le Majestic - Grand Bistro");
  const [branchCode, setBranchCode] = useState("MAIN-01");
  const [address, setAddress] = useState("123 Culinary Boulevard");
  const [city, setCity] = useState("New York");
  const [state, setState] = useState("NY");
  const [zipCode, setZipCode] = useState("10001");
  const [phone, setPhone] = useState("+1 (555) 019-2834");
  const [email, setEmail] = useState("contact@grandbistro.com");

  // Financial / Tax
  const [taxRate, setTaxRate] = useState("8.875");
  const [serviceCharge, setServiceCharge] = useState("0.0");
  const [currency, setCurrency] = useState("USD ($)");

  // Printing & Hardware
  const [printerWidth, setPrinterWidth] = useState<"80mm" | "58mm">("80mm");
  const [receiptHeader, setReceiptHeader] = useState("LE MAJESTIC GRAND BISTRO");
  const [receiptFooter, setReceiptFooter] = useState("Thank you for dining with us! Follow us @lemajestic");
  const [autoPrintOrder, setAutoPrintOrder] = useState(true);

  // Notifications
  const [chimeOnOrder, setChimeOnOrder] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      toast.success("Restaurant & POS settings successfully saved!");
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-14">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-widest mb-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Terminal & Branch Setup</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            System & Restaurant Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure enterprise branch profile, tax rates, thermal printer parameters, and billing rules.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? "Saving..." : "Save Settings"}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Restaurant Profile */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Restaurant & Branch Profile</h2>
              <p className="text-[11px] text-slate-400">Legal business entity and branch contact details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Restaurant Display Name</label>
              <input
                type="text"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Branch Code</label>
              <input
                type="text"
                value={branchCode}
                onChange={(e) => setBranchCode(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1.5">Street Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">City & State</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500"
                />
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State (e.g. NY)"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500 uppercase"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Postal / ZIP Code</label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Financial & Tax Calculations */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Tax & Financial Rules</h2>
              <p className="text-[11px] text-slate-400">Automatic tax assessment applied at checkout</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Sales Tax Rate (%)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.001"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-500 pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">%</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Default: 8.875% NYC combined tax</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Service Charge (%)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={serviceCharge}
                  onChange={(e) => setServiceCharge(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-500 pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">%</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Optional dine-in gratuity charge</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Operating Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="USD ($)">USD ($) - US Dollar</option>
                <option value="EUR (€)">EUR (€) - Euro</option>
                <option value="IDR (Rp)">IDR (Rp) - Indonesian Rupiah</option>
                <option value="GBP (£)">GBP (£) - British Pound</option>
                <option value="SGD ($)">SGD (S$) - Singapore Dollar</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Thermal Printer & Receipt Customization */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Receipts & Thermal Hardware</h2>
              <p className="text-[11px] text-slate-400">Header, footer branding, and printer paper specifications</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Receipt Top Banner Title</label>
              <input
                type="text"
                value={receiptHeader}
                onChange={(e) => setReceiptHeader(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500 uppercase font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Printer Roll Width</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPrinterWidth("80mm")}
                  className={`py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    printerWidth === "80mm"
                      ? "bg-slate-800 border-amber-500/60 text-amber-400 shadow-md"
                      : "bg-slate-950/40 border-slate-800 text-slate-400"
                  }`}
                >
                  Standard (80mm)
                </button>
                <button
                  type="button"
                  onClick={() => setPrinterWidth("58mm")}
                  className={`py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    printerWidth === "58mm"
                      ? "bg-slate-800 border-amber-500/60 text-amber-400 shadow-md"
                      : "bg-slate-950/40 border-slate-800 text-slate-400"
                  }`}
                >
                  Compact (58mm)
                </button>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1.5">Receipt Footer Message</label>
              <input
                type="text"
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-between p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
              <div>
                <p className="font-semibold text-slate-200">Auto-Print Order Receipt on Checkout</p>
                <p className="text-[11px] text-slate-400">
                  Immediately open print preview when payment is marked as successful in POS
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoPrintOrder}
                onChange={(e) => setAutoPrintOrder(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Chimes & Operational Alerts */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Live Service Notifications</h2>
              <p className="text-[11px] text-slate-400">Audio alerts and inventory warning prompts</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
              <div>
                <p className="font-semibold text-slate-200">Kitchen Ticket Chime</p>
                <p className="text-[11px] text-slate-400">Play an audible chime when a new POS order is fired</p>
              </div>
              <input
                type="checkbox"
                checked={chimeOnOrder}
                onChange={(e) => setChimeOnOrder(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
              <div>
                <p className="font-semibold text-slate-200">Low Stock Alert Notifications</p>
                <p className="text-[11px] text-slate-400">
                  Show warning indicators when raw material inventory falls below safe threshold
                </p>
              </div>
              <input
                type="checkbox"
                checked={lowStockAlerts}
                onChange={(e) => setLowStockAlerts(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Action Button at bottom */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? "Saving Changes..." : "Save System Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
