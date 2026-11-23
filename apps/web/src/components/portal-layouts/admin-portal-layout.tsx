'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  Users,
  Settings,
  BarChart3,
  Menu,
  X,
  Bell,
  Search,
  LogOut,
  ChevronDown,
  AlertCircle,
  Beaker,
} from 'lucide-react';

interface AdminPortalLayoutProps {
  children: React.ReactNode;
}

export default function AdminPortalLayout({ children }: AdminPortalLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Verification Queue', href: '/admin/verification', icon: CheckSquare },
    { name: 'Claims Management', href: '/admin/claims', icon: FileText },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Beta Programmes', href: '/dashboard/admin/beta', icon: Beaker },
    { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } md:w-64 bg-gradient-to-b from-indigo-700 to-indigo-800 text-white transition-[width] duration-300 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] overflow-hidden fixed md:relative z-40 h-full flex flex-col`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-indigo-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-indigo-700" />
            </div>
            <div className="hidden md:block">
              <h1 className="font-bold text-lg">NRPG Admin</h1>
              <p className="text-xs text-indigo-200">Control Panel</p>
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
        <div className="p-4 border-t border-indigo-600 space-y-3">
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm font-semibold">Pending Actions</p>
            </div>
            <p className="text-2xl font-bold">23</p>
            <p className="text-xs text-indigo-200 mt-1">Contractor verifications</p>
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
                  placeholder="Search contractors, claims..."
                  className="bg-transparent outline-none text-sm placeholder-slate-500 w-40"
                />
              </div>

              {/* Notifications */}
              <div className="relative">
                <button className="p-2 hover:bg-slate-100 rounded-lg relative">
                  <Bell className="w-5 h-5 text-slate-600" />
                  <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full font-semibold">3</span>
                </button>
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    AS
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-slate-900">
                    Admin Smith
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                    <div className="p-4 border-b border-slate-100">
                      <p className="font-semibold text-slate-900">Admin Smith</p>
                      <p className="text-sm text-slate-500">Super Administrator</p>
                    </div>
                    <div className="p-2 space-y-1">
                      <button className="w-full text-left px-4 py-2 hover:bg-slate-100 rounded text-sm text-slate-700 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Admin Profile
                      </button>
                      <button className="w-full text-left px-4 py-2 hover:bg-slate-100 rounded text-sm text-slate-700 flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Admin Settings
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
          {/* System Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* System Health Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-600 mb-1">System Health</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">98%</span>
                <span className="text-green-600 text-xs font-semibold">Healthy</span>
              </div>
              <div className="w-full h-1 bg-slate-200 rounded-full mt-3">
                <div className="h-full bg-green-500 rounded-full w-98%"></div>
              </div>
            </div>

            {/* Active Users Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-600 mb-1">Active Users</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">1,247</span>
                <span className="text-blue-600 text-xs font-semibold">Online</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">456 contractors, 791 customers</p>
            </div>

            {/* Pending Verifications Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-600 mb-1">Pending Actions</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">23</span>
                <span className="text-amber-600 text-xs font-semibold">Urgent</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Contractor verifications</p>
            </div>

            {/* Response Time Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-600 mb-1">Avg Response Time</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">145ms</span>
                <span className="text-green-600 text-xs font-semibold">Fast</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Last 24 hours</p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Verification Queue Section */}
            <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">Pending Verifications</h3>
                <span className="bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">23 NEW</span>
              </div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="border border-slate-200 rounded-lg p-4 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-slate-900">Robert {String.fromCharCode(64 + item)}</h4>
                        <p className="text-sm text-slate-500">Applied 2 days ago</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-1 rounded">PENDING</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3 mb-4 text-sm">
                      <div>
                        <p className="text-slate-500">Category</p>
                        <p className="font-medium text-slate-900">Water Damage</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Certification Level</p>
                        <p className="font-medium text-slate-900">Water damage restoration, structural drying</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Location</p>
                        <p className="font-medium text-slate-900">NSW, VIC</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Rating</p>
                        <p className="font-medium text-slate-900">No history</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-sm font-medium">
                        Approve
                      </button>
                      <button className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-medium">
                        Reject
                      </button>
                      <button className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-medium">
                        Review Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm">
                View All Pending (23) →
              </button>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 text-left">
                  <CheckSquare className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-slate-900 text-sm">Verify Contractors</p>
                    <p className="text-xs text-slate-500">23 pending</p>
                  </div>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 text-left">
                  <FileText className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-slate-900 text-sm">Approve Claims</p>
                    <p className="text-xs text-slate-500">8 awaiting review</p>
                  </div>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 text-left">
                  <Users className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-slate-900 text-sm">User Support</p>
                    <p className="text-xs text-slate-500">5 open tickets</p>
                  </div>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 text-left">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-slate-900 text-sm">Alert Resolution</p>
                    <p className="text-xs text-slate-500">3 critical alerts</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* System Logs Section */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Recent System Activity</h3>
              <button className="text-indigo-600 text-sm font-medium hover:text-indigo-700">View All Logs</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Timestamp</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Action</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">User</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { time: '14:32 UTC', action: 'Contractor Approved', user: 'Admin Smith', status: 'success', details: 'John D. verified' },
                    { time: '14:28 UTC', action: 'Claim Submitted', user: 'Customer Jane', status: 'info', details: 'Water damage claim' },
                    { time: '14:15 UTC', action: 'Login Attempt', user: 'Contractor Mike', status: 'warning', details: 'Failed password' },
                    { time: '14:03 UTC', action: 'Booking Created', user: 'API System', status: 'success', details: 'Fire damage job' },
                    { time: '13:58 UTC', action: 'User Registration', user: 'New User', status: 'success', details: 'Customer account' },
                  ].map((log, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm text-slate-600">{log.time}</td>
                      <td className="py-3 px-4 text-sm font-medium text-slate-900">{log.action}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{log.user}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          log.status === 'success' ? 'bg-green-100 text-green-700' :
                          log.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
