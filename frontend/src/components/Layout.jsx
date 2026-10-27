import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import {
  BarChart3,
  Database,
  MessageSquare,
  LogOut,
  Sparkles,
  Menu,
  X,
  Activity,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';


export default function Layout({ children }) {

  const { user, logout } = useAuth();

  const loc = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);


  const links = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      description: 'Business overview',
      icon: BarChart3
    },
    {
      to: '/datasets',
      label: 'Datasets',
      description: 'Manage your data',
      icon: Database
    },
    {
      to: '/chat',
      label: 'AI Analyst',
      description: 'Ask your data',
      icon: MessageSquare
    }
  ];


  const closeMobile = () => {
    setMobileOpen(false);
  };


  return (
    <div className="insight-layout">

      {/* =================================================
          MOBILE OVERLAY
      ================================================= */}

      {mobileOpen && (
        <button
          className="insight-mobile-overlay"
          onClick={closeMobile}
          aria-label="Close navigation"
        />
      )}


      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={`insight-sidebar ${
          mobileOpen ? 'insight-sidebar-mobile-open' : ''
        }`}
      >

        {/* =================================================
            BRAND
        ================================================= */}

        <div className="insight-brand">

          <Link
            to="/dashboard"
            className="insight-logo"
            onClick={closeMobile}
          >

            <div className="insight-logo-icon">
              <Sparkles size={19} />
            </div>


            <div className="insight-logo-copy">

              <div className="insight-logo-text">
                Insight<span>AI</span>
              </div>

              <span className="insight-logo-subtitle">
                Business Intelligence
              </span>

            </div>

          </Link>


          <button
            className="insight-mobile-close"
            onClick={closeMobile}
            aria-label="Close menu"
          >
            <X size={19} />
          </button>

        </div>


        {/* =================================================
            AI STATUS
        ================================================= */}

        <div className="insight-ai-status">

          <div className="insight-status-icon">
            <Activity size={16} />
          </div>


          <div className="insight-status-content">

            <div>

              <strong>
                AI Engine
              </strong>

              <span className="insight-status-dot"></span>

            </div>


            <span>
              Ready for analysis
            </span>

          </div>

        </div>


        {/* =================================================
            NAVIGATION
        ================================================= */}

        <div className="insight-nav-label">
          WORKSPACE
        </div>


        <nav className="insight-nav">

          {links.map((item) => {

            const Icon = item.icon;

            const active = loc.pathname === item.to;

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={closeMobile}
                className={`insight-nav-link ${
                  active ? 'active' : ''
                }`}
              >

                <div className="insight-nav-icon">
                  <Icon size={18} />
                </div>


                <div className="insight-nav-copy">

                  <span>
                    {item.label}
                  </span>

                  <small>
                    {item.description}
                  </small>

                </div>


                {active && (
                  <ChevronRight
                    size={15}
                    className="insight-nav-arrow"
                  />
                )}

              </Link>
            );

          })}

        </nav>


        {/* =================================================
            AI TIP CARD
        ================================================= */}

        <div className="insight-tip-card">

          <div className="insight-tip-icon">
            <Sparkles size={15} />
          </div>


          <div>

            <strong>
              Smart insights
            </strong>

            <p>
              Ask AI questions about your business data.
            </p>

          </div>

        </div>


        {/* =================================================
            SIDEBAR BOTTOM
        ================================================= */}

        <div className="insight-sidebar-bottom">

          {/* COMPANY */}

          {user?.company_name && (
            <div className="insight-company-card">

              <div className="insight-company-avatar">

                {String(user.company_name)
                  .charAt(0)
                  .toUpperCase()}

              </div>


              <div className="insight-company-info">

                <span>
                  WORKSPACE
                </span>

                <strong>
                  {user.company_name}
                </strong>

              </div>

            </div>
          )}


          {/* SECURITY */}

          <div className="insight-security">

            <ShieldCheck size={13} />

            <span>
              Secure workspace
            </span>

          </div>


          {/* LOGOUT */}

          <button
            onClick={logout}
            className="insight-logout"
          >

            <LogOut size={16} />

            <span>
              Sign out
            </span>

          </button>

        </div>

      </aside>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="insight-main">

        {/* MOBILE TOP BAR */}

        <div className="insight-mobile-header">

          <button
            className="insight-mobile-menu"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >

            <Menu size={20} />

          </button>


          <Link
            to="/dashboard"
            className="insight-mobile-brand"
          >

            <div className="insight-mobile-brand-icon">
              <Sparkles size={16} />
            </div>

            <strong>
              Insight<span>AI</span>
            </strong>

          </Link>

        </div>


        {/* PAGE CONTENT */}

        {children}

      </main>

    </div>
  );
}