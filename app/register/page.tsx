'use client';

import React, {useState} from 'react';
import { useRouter } from 'next/navigation'; 
import Link from 'next/link';

export default function RegisterPage(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [confirmPassword, setconfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    async function handleSubmit(e: React.FormEvent){
        e.preventDefault();
        setError('');
        if(password !== confirmPassword){
            setError('Passwords do not match');
            return 
        }
        setLoading(true)
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
    
            })
            const data = await res.json();
            if(!res.ok){
                throw new Error(data.error || 'Registration failed')
            }
            router.push('/login');
            router.refresh()
        } catch (error:any) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }
    return(
        <>
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="w-full max-w-md space-y-4 rounded-lg border p-6 shadow-sm">
                    <h1 className="text-2xl font-bold">Create an Account</h1>
                    {error && (
                        <div className="rounded bg-red-100 p-3 text-sm text-red-700">
                            {error}
                        </div>
                        )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">Email Address</label>
                            <input name="email" value={email} type="email" onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full rounded border p-2"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Password</label>
                            <input name="password" value={password} type="password" onChange={(e) => setPassword(e.target.value)} required className="mt-1 w-full rounded border p-2"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Confirm Password</label>
                            <input name="confirmPassword" value={confirmPassword} onChange={(e) => setconfirmPassword(e.target.value)} required className="mt-1 w-full rounded border p-2"/>
                        </div>
                        <button type="submit" disabled={loading} className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50">{loading ? 'Creating account...' : 'Register'}</button>
                        <p className="text-center text-sm"><Link href="/login">Already have an account? Sign in here</Link></p>
                    </form>
                </div>
            </div>
        </>
    )
}
