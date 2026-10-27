import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
  TrendingUp
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setErr('');
    setLoading(true);

    try {
      await login({ email, password });
      nav('/dashboard');
    } catch (x) {
      setErr(
        x.response?.data?.detail ||
        'Unable to sign in. Please check your email and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* ================= LEFT SIDE ================= */}

      <section className="auth-hero">

        <div className="auth-hero-content">

          <div className="auth-brand">
            <div className="auth-brand-icon">
              <Sparkles size={20} />
            </div>

            <span>
              Insight<span>AI</span>
            </span>
          </div>


          <div className="auth-hero-text">

            <div className="auth-badge">
              <Sparkles size={14} />
              AI-Powered Business Intelligence
            </div>

            <h1>
              Ask your business
              <span> anything.</span>
            </h1>

            <p>
              Turn your business data into clear answers,
              powerful insights and smarter decisions.
            </p>

          </div>


          {/* Feature list */}

          <div className="auth-features">

            <div className="auth-feature">
              <div className="auth-feature-icon">
                <Brain size={17} />
              </div>

              <div>
                <strong>AI-powered analysis</strong>
                <span>Ask questions in natural language.</span>
              </div>
            </div>


            <div className="auth-feature">
              <div className="auth-feature-icon">
                <BarChart3 size={17} />
              </div>

              <div>
                <strong>Smart analytics</strong>
                <span>Turn raw data into useful insights.</span>
              </div>
            </div>


            <div className="auth-feature">
              <div className="auth-feature-icon">
                <TrendingUp size={17} />
              </div>

              <div>
                <strong>Better decisions</strong>
                <span>Discover trends and opportunities faster.</span>
              </div>
            </div>

          </div>


          {/* Floating analytics card */}

          <div className="auth-floating-card">

            <div className="floating-card-top">
              <div className="floating-icon">
                <TrendingUp size={17} />
              </div>

              <div>
                <span>Business performance</span>
                <strong>+24.8%</strong>
              </div>

              <div className="floating-check">
                <CheckCircle2 size={17} />
              </div>
            </div>

            <div className="floating-bars">
              <i></i>
              <i></i>
              <i></i>
              <i></i>
              <i></i>
              <i></i>
              <i></i>
            </div>

          </div>

        </div>

      </section>


      {/* ================= RIGHT SIDE ================= */}

      <section className="auth-form-section">

        <div className="auth-form-container">

          {/* Mobile logo */}

          <div className="auth-mobile-brand">
            <div className="auth-brand-icon">
              <Sparkles size={19} />
            </div>

            <span>
              Insight<span>AI</span>
            </span>
          </div>


          <div className="auth-form-header">

            <div className="auth-form-icon">
              <Sparkles size={21} />
            </div>

            <div>
              <h2>Welcome back</h2>
              <p>Sign in to your InsightAI workspace.</p>
            </div>

          </div>


          {/* Error */}

          {err && (
            <div className="auth-error">
              <span>!</span>
              {err}
            </div>
          )}


          <form
            onSubmit={submit}
            className="auth-form"
          >

            {/* Email */}

            <div className="auth-field">

              <label htmlFor="email">
                Email address
              </label>

              <input
                id="email"
                className="auth-input"
                placeholder="you@company.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />

            </div>


            {/* Password */}

            <div className="auth-field">

              <div className="auth-label-row">

                <label htmlFor="password">
                  Password
                </label>

              </div>

              <div className="password-wrapper">

                <input
                  id="password"
                  className="auth-input password-input"
                  placeholder="Enter your password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((v) => !v)
                  }
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </div>


            {/* Submit */}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="auth-spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={18} />
                </>
              )}

            </button>

          </form>


          <div className="auth-divider">
            <span></span>
            <p>Secure workspace access</p>
            <span></span>
          </div>


          <p className="auth-register">
            Don't have an account?

            <Link to="/register">
              Create your account
              <ArrowRight size={14} />
            </Link>
          </p>


          <p className="auth-copyright">
            © 2026 InsightAI · Intelligent business analytics
          </p>

        </div>

      </section>

    </div>
  );
}