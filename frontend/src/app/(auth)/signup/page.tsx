'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company_name: companyName,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      if (data.user && !data.session) {
        setSuccess(true)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-sm">
        {/* Logo - typographic */}
        <div className="mb-8">
          <Link href="/">
            <span className="text-xl font-semibold tracking-tight text-zinc-950">
              BrandOS
            </span>
          </Link>
        </div>

        {/* Success State */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 mb-2">
            Check your email
          </h1>
          <p className="text-sm text-zinc-500">
            We&apos;ve sent a confirmation link to{' '}
            <span className="text-zinc-950 font-medium">{email}</span>.
            Click the link to activate your account.
          </p>
        </div>

        <Link href="/login">
          <Button variant="outline" className="w-full">
            Back to login
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo - typographic */}
      <div className="mb-8">
        <Link href="/">
          <span className="text-xl font-semibold tracking-tight text-zinc-950">
            BrandOS
          </span>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 mb-2">
          Create your account
        </h1>
        <p className="text-sm text-zinc-500">
          Start controlling your employer brand in minutes
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSignup} className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label
            htmlFor="fullName"
            className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium"
          >
            Your Name
          </label>
          <Input
            id="fullName"
            type="text"
            placeholder="Jane Smith"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="companyName"
            className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium"
          >
            Company Name
          </label>
          <Input
            id="companyName"
            type="text"
            placeholder="Acme Corp"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium"
          >
            Work Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium"
          >
            Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            disabled={loading}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      {/* Footer */}
      <p className="mt-8 text-sm text-zinc-500 text-center">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-zinc-950 font-medium hover:underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
