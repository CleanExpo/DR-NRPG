'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutGrid,
  Briefcase,
  Clock,
  DollarSign,
  User,
  Menu,
  X,
  Bell,
  Search,
  LogOut,
  ChevronDown,
} from 'lucide-react';

interface ContractorPortalLayoutProps {
  children: React.ReactNode;
}

export default function ContractorPortalLayout({ children }: ContractorPortalLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard/contractor', icon: LayoutGrid },
    { name: 'My Jobs', href: '/dashboard/contractor/available-requests', icon: Briefcase },
    { name: 'Availability', href: '/dashboard/contractor/preferences', icon: Clock },
    { name: 'Earnings', href: '/dashboard/contractor/earnings', icon: DollarSign },
    { name: 'Profile', href: '/dashboard/contractor/profile-setup', icon: User },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } md:w-64 bg-gradient-to-b from-orange-600 to-orange-700 text-white transition-[width] duration-300 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] overflow-hidden fixed md:relative z-40 h-full flex flex-col`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-orange-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-orange-600" />
            </div>
            <div className="hidden md:block">
              <h1 className="font-bold text-lg">NRPG</h1>
              <p className="text-xs text-orange-100">Contractor Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-white bg-opacity-20 border-l-4 border-white'
                      : 'hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-orange-500 space-y-3">
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4" />
              <p className="text-sm font-semibold">Available This Week</p>
            </div>
            <p className="text-2xl font-bold">24 hrs</p>
            <p className="text-xs text-orange-100 mt-1">Out of 40 hrs scheduled</p>
          </div>
          <button className="w-full flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-sm font-medium transition-colors">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
          <div className="flex items-center justify-between px-4 md:px-8 py-4">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 hover:bg-slate-100 rounded-lg"
              >
                {sidebarOpen ? (
                  <X className="w-6 h-6 text-slate-700" />
                ) : (
                  <Menu className="w-6 h-6 text-slate-700" />
                )}
              </button>
              <h2 className="text-xl font-bold text-slate-900">
                {navItems.find((item) => isActive(item.href))?.name || 'Dashboard'}
              </h2>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2">
                <Search className="w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search jobs, earnings..."
                  className="bg-transparent outline-none text-sm placeholder-slate-500 w-40"
                />
              </div>

              {/* Notifications */}
              <div className="relative">
                <button className="p-2 hover:bg-slate-100 rounded-lg relative">
                  <Bell className="w-5 h-5 text-slate-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    JD
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-slate-900">
                    John Doe
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                    <div className="p-4 border-b border-slate-100">
                      <p className="font-semibold text-slate-900">John Doe</p>
                      <p className="text-sm text-slate-500">Gold Tier Contractor</p>
                    </div>
                    <div className="p-2 space-y-1">
                      <button className="w-full text-left px-4 py-2 hover:bg-slate-100 rounded text-sm text-slate-700 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        View Profile
                      </button>
                      <button className="w-full text-left px-4 py-2 hover:bg-slate-100 rounded text-sm text-slate-700 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Payment Methods
                      </button>
                      <button className="w-full text-left px-4 py-2 hover:bg-slate-100 rounded text-sm text-slate-700 flex items-center gap-2">
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-8">
          {/* Quick Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Rating Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-600 mb-1">Your Rating</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">4.8</span>
                <span className="text-amber-500 text-sm">★★★★★</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Based on 156 jobs</p>
            </div>

            {/* Completion Rate Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-600 mb-1">Completion Rate</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">98%</span>
                <span className="text-green-600 text-xs font-semibold">↑ Gold</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Excellent standing</p>
            </div>

            {/* This Month Earnings Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-600 mb-1">This Month</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">$4,820</span>
                <span className="text-green-600 text-xs font-semibold">AUD</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">From 12 jobs</p>
            </div>

            {/* Next Payment Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-600 mb-1">Next Payout</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">$3,240</span>
                <span className="text-blue-600 text-xs font-semibold">Dec 28</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">To your bank account</p>
            </div>
          </div>

          {/* Dashboard Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Active Jobs Section */}
            <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Active Jobs</h3>
              <div className="space-y-4">
                {[1, 2, 3].map((job) => (
                  <div key={job} className="border border-slate-200 rounded-lg p-4 hover:border-orange-300 hover:bg-orange-50 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-slate-900">Water Damage - Apartment</h4>
                        <p className="text-sm text-slate-500">Job #JOB-{1001 + job}</p>
                      </div>
                      <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">IN PROGRESS</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                      <div>
                        <p className="text-slate-500">Location</p>
                        <p className="font-medium text-slate-900">Pyrmont, NSW</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Assigned</p>
                        <p className="font-medium text-slate-900">3 days ago</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Est. Value</p>
                        <p className="font-medium text-slate-900">$2,400 AUD</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm">
                View All Jobs →
              </button>
            </div>

            {/* Certification Status */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Certifications</h3>
              <div className="space-y-3">
                {[
                  { name: 'IICRC WRT', expiry: '2025-06-15', status: 'valid' },
                  { name: 'IICRC ASD', expiry: '2024-12-31', status: 'valid' },
                  { name: 'IICRC CFT', expiry: '2024-09-20', status: 'expired' },
                  { name: 'Public Liability', expiry: '2025-03-10', status: 'valid' },
                ].map((cert, idx) => (
                  <div key={idx} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      cert.status === 'valid' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{cert.name}</p>
                      <p className={`text-xs ${cert.status === 'valid' ? 'text-slate-500' : 'text-red-600'}`}>
                        {cert.status === 'valid' ? 'Expires: ' : 'Expired: '}{cert.expiry}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 px-4 py-2 border border-orange-300 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 font-medium text-sm">
                Renew Certification
              </button>
            </div>
          </div>

          {/* Availability Schedule Preview */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">This Week's Schedule</h3>
            <div className="grid grid-cols-7 gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                <div key={day} className="text-center">
                  <p className="text-xs text-slate-500 font-semibold mb-2">{day}</p>
                  <div className={`h-24 rounded border-2 flex items-center justify-center text-center p-2 ${
                    idx >= 5 ? 'bg-slate-100 border-slate-300' : 'bg-green-50 border-green-300'
                  }`}>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">
                        {idx >= 5 ? 'Off' : '8h'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {idx >= 5 ? 'Rest' : 'Available'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm">
              Edit Availability →
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
