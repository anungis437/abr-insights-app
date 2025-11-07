"use client";

import React from "react";
import Navigation from '@/components/shared/Navigation';

export default function OrgSettingsPage() {
  const [formData, setFormData] = React.useState({
    name: "",
    industry: "",
  });

  return (
    <>
      <Navigation />
      <div className="p-8 max-w-2xl mx-auto pt-24">
      <h1 className="text-2xl font-bold mb-6">Organization Settings</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-lg font-semibold mb-4">Organization</h2>
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Organization Name</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={formData.name}
              onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g., Acme Corp"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Industry</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={formData.industry}
              onChange={e => setFormData(f => ({ ...f, industry: e.target.value }))}
              placeholder="e.g., Education, Healthcare, etc."
            />
          </div>
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
    </>
  );
}