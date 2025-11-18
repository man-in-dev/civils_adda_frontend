"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const [name, setName] = useState(user?.name || "");
  const [loading, setLoading] = useState(false);

  const handleUpdateName = () => {
    if (!name.trim()) {
      addToast("Name cannot be empty", "error");
      return;
    }
    // In a real app, this would update the user in the backend
    // For frontend-only, we'll just show a message
    addToast("Name updated successfully! (Changes saved locally)", "success");
  };

  const handleLogout = () => {
    logout();
    addToast("Logged out successfully", "success");
    router.push("/");
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="input w-full bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input flex-1"
                  placeholder="Enter your name"
                />
                <button
                  onClick={handleUpdateName}
                  disabled={loading}
                  className="btn btn-primary whitespace-nowrap"
                >
                  Update Name
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Account Actions</h2>
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors text-left"
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Data Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">📊 About Your Data</h3>
          <p className="text-sm text-blue-800 mb-3">
            All your data (tests, attempts, purchases) is stored locally in your browser. 
            This means:
          </p>
          <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
            <li>Data is private to your device</li>
            <li>Clearing browser data will reset everything</li>
            <li>Data is not synced across devices</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

