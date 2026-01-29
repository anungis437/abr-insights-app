'use client'

import React from 'react'

export default function OrgSettingsPage() {
  const [formData, setFormData] = React.useState({
    name: '',
    industry: '',
  })

  return (
    <>
      <div className="mx-auto max-w-2xl p-8 pt-24">
        <h1 className="mb-6 text-2xl font-bold">Organization Settings</h1>
        <div className="rounded-xl border border-gray-200 bg-white p-8">
          <h2 className="mb-4 text-lg font-semibold">Organization</h2>
          <form className="space-y-6">
            <div>
              <label className="mb-1 block text-sm font-medium">Organization Name</label>
              <input
                className="w-full rounded border px-3 py-2"
                value={formData.name}
                onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g., Acme Corp"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Industry</label>
              <input
                className="w-full rounded border px-3 py-2"
                value={formData.industry}
                onChange={(e) => setFormData((f) => ({ ...f, industry: e.target.value }))}
                placeholder="e.g., Education, Healthcare, etc."
              />
            </div>
            <button
              type="submit"
              className="mt-4 rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
