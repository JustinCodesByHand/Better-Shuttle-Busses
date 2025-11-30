import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

export default function AuthPage() {
    const { signup, login } = useAuth();
    const navigate = useNavigate();
    const [mode, setMode] = useState('signup');
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const isSignup = mode === 'signup';

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isSignup) {
                const payload = {
                    firstName: form.firstName.trim(),
                    lastName: form.lastName.trim(),
                    email: form.email.trim(),
                    password: form.password,
                };

                // quick front-end check for @ualbany.edu
                if (!payload.email.toLowerCase().endsWith('@ualbany.edu')) {
                    setError('Please use a UAlbany email ending in @ualbany.edu.');
                    setLoading(false);
                    return;
                }

                await signup(payload);
            } else {
                await login({
                    email: form.email.trim(),
                    password: form.password,
                });
            }
            navigate('/map');
        } catch (e) {
            setError(e.response?.data?.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    }

    function updateField(field) {
        return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
    }

    return (
        <main className="auth-shell">
            <div className="auth-card">
                <div className="auth-header-block">
                    <span className="auth-tag">UAlbany · Shuttle Tracker</span>
                    <h2>{isSignup ? 'Create your campus shuttle account' : 'Welcome back, Great Dane'}</h2>
                    <p>
                        {isSignup
                            ? 'Use your UAlbany email to save favorite stops and arrival alerts.'
                            : 'Log in to access your saved stops and alert settings.'}
                    </p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {isSignup && (
                        <div className="auth-row">
                            <div className="auth-field">
                                <label>First name</label>
                                <input
                                    type="text"
                                    required
                                    value={form.firstName}
                                    onChange={updateField('firstName')}
                                    placeholder="Florian"
                                />
                            </div>
                            <div className="auth-field">
                                <label>Last name</label>
                                <input
                                    type="text"
                                    required
                                    value={form.lastName}
                                    onChange={updateField('lastName')}
                                    placeholder="Charles"
                                />
                            </div>
                        </div>
                    )}

                    <div className="auth-field">
                        <label>UAlbany email</label>
                        <input
                            type="email"
                            required
                            value={form.email}
                            onChange={updateField('email')}
                            placeholder="example@ualbany.edu"
                        />
                    </div>

                    <div className="auth-field">
                        <label>Password</label>
                        <input
                            type="password"
                            required
                            value={form.password}
                            onChange={updateField('password')}
                            placeholder="••••••••"
                        />
                    </div>

                    {error && <div className="auth-error">{error}</div>}

                    <button type="submit" className="auth-primary-btn" disabled={loading}>
                        {loading
                            ? 'One sec…'
                            : isSignup
                                ? 'Sign up with UAlbany'
                                : 'Log in'}
                    </button>
                </form>

                <button
                    type="button"
                    className="auth-secondary-btn"
                    onClick={() => {
                        setMode((m) => (m === 'signup' ? 'login' : 'signup'));
                        setError(null);
                    }}
                >
                    {isSignup
                        ? 'Already have an account? Log in'
                        : 'New here? Create an account'}
                </button>
            </div>
        </main>
    );
}
