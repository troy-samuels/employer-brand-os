'use client'

import { useState } from 'react'

export default function DemoPage() {
  const [companyName, setCompanyName] = useState('')
  const [aiResults, setAiResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const handleDemoAudit = async () => {
    if (!companyName.trim()) return
    
    setLoading(true)
    // Simulate AI responses for demo
    setTimeout(() => {
      setAiResults([
        `ChatGPT says: "${companyName} offers competitive salaries ranging from $60,000 to $120,000, though some employees report below-market compensation."`,
        `Claude responds: "Working at ${companyName} provides good work-life balance, but recent reviews suggest limited remote work options."`,
        `Perplexity finds: "${companyName} is a growing company with unclear benefits package according to online sources."`
      ])
      setLoading(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">BrandOS AI Audit Demo</h1>
          <p className="text-xl text-blue-200">
            See what AI agents really say about your company
          </p>
        </header>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl mb-8">
          <h2 className="text-2xl font-semibold mb-6">Live AI Company Audit</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter your company name..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <button
            onClick={handleDemoAudit}
            disabled={loading || !companyName.trim()}
            className="px-8 py-3 bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {loading ? 'Scanning AI Platforms...' : 'Run AI Audit'}
          </button>
        </div>

        {aiResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold">AI Audit Results</h3>
            {aiResults.map((result, index) => (
              <div key={index} className="bg-red-500/20 border border-red-500/40 p-4 rounded-lg">
                <p className="text-red-200">{result}</p>
              </div>
            ))}
            <div className="bg-orange-500/20 border border-orange-500/40 p-6 rounded-lg text-center">
              <h4 className="text-xl font-semibold text-orange-200 mb-2">Risk Score: 73/100</h4>
              <p className="text-orange-300">
                High risk of misinformation spread. Immediate action recommended.
              </p>
            </div>
            <div className="text-center">
              <button className="px-12 py-4 bg-green-600 hover:bg-green-700 text-xl font-medium rounded-lg">
                Fix with BrandOS Smart Pixel
              </button>
            </div>
          </div>
        )}

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl">
            <h3 className="text-lg font-semibold mb-3">Smart Pixel</h3>
            <p className="text-blue-200">One line of code fixes AI visibility instantly.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl">
            <h3 className="text-lg font-semibold mb-3">Hallucination Radar</h3>
            <p className="text-blue-200">Monitor what AI says about you 24/7.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl">
            <h3 className="text-lg font-semibold mb-3">Compliance Engine</h3>
            <p className="text-blue-200">Automatic pay transparency compliance.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
