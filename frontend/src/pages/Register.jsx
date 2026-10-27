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

export default function Register() {
  const [form, setForm] = useState({
    full_name: '',
    company_name: '',
    email: '',
    password: ''
  });

  const [err, setErr] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const nav = useNavigate();

  const change = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const submit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setErr('');
    setLoading(true);

    try {
      await register(form);
      nav('/dashboard');
    } catch (x) {
      setErr(
        x.response?.data?.detail ||
        'Registration failed. Please try again.'
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
              Start your AI workspace
            </div>

            <h1>
              Make your data
              <span> work smarter.</span>
            </h1>

            <p>
              Create your InsightAI workspace and turn
              business data into meaningful insights.
            </p>

          </div>

          <div className="auth-features">

            <div className="auth-feature">
              <div className="auth-feature-icon">
                <Brain size={17} />
              </div>

              <div>
                <strong>Ask questions naturally</strong>
                <span>Talk to your data using simple language.</span>
              </div>
            </div>

            <div className="auth-feature">
              <div className="auth-feature-icon">
                <BarChart3 size={17} />
              </div>

              <div>
                <strong>Visualize your data</strong>
                <span>Discover patterns through intelligent charts.</span>
              </div>
            </div>

            <div className="auth-feature">
              <div className="auth-feature-icon">
                <TrendingUp size={17} />
              </div>

              <div>
                <strong>Find business opportunities</strong>
                <span>Use AI insights to make better decisions.</span>
              </div>
            </div>

          </div>

          <div className="auth-floating-card">

            <div className="floating-card-top">

              <div className="floating-icon">
                <TrendingUp size={17} />
              </div>

              <div>
                <span>AI opportunity detected</span>
                <strong>+18.4% growth</strong>
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
              <h2>Create your workspace</h2>
              <p>
                Set up your InsightAI account in a few seconds.
              </p>
            </div>

          </div>


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

            {/* Full name */}

            <div className="auth-field">

              <label htmlFor="full_name">
                Full name
              </label>

              <input
                id="full_name"
                name="full_name"
                className="auth-input"
                placeholder="Your full name"
                type="text"
                value={form.full_name}
                onChange={change}
                autoComplete="name"
                required
              />

            </div>


            {/* Company */}

            <div className="auth-field">

              <label htmlFor="company_name">
                Company name
              </label>

              <input
                id="company_name"
                name="company_name"
                className="auth-input"
                placeholder="Your company"
                type="text"
                value={form.company_name}
                onChange={change}
                autoComplete="organization"
                required
              />

            </div>


            {/* Email */}

            <div className="auth-field">

              <label htmlFor="register-email">
                Email address
              </label>

              <input
                id="register-email"
                name="email"
                className="auth-input"
                placeholder="you@company.com"
                type="email"
                value={form.email}
                onChange={change}
                autoComplete="email"
                required
              />

            </div>


            {/* Password */}

            <div className="auth-field">

              <label htmlFor="register-password">
                Password
              </label>

              <div className="password-wrapper">

                <input
                  id="register-password"
                  name="password"
                  className="auth-input password-input"
                  placeholder="At least 8 characters"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={change}
                  minLength={8}
                  autoComplete="new-password"
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
                  Creating workspace...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight size={18} />
                </>
              )}

            </button>

          </form>


          <div className="auth-divider">
            <span></span>
            <p>YOUR DATA • YOUR INSIGHTS</p>
            <span></span>
          </div>


          <p className="auth-register">

            Already have an account?

            <Link to="/login">
              Sign in
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