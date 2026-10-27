import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  Upload,
  Database,
  Rows3,
  Columns3,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Users,
  Package,
  ShoppingCart,
  Target,
  AlertTriangle,
  Lightbulb,
  Activity,
  CalendarDays,
  RefreshCw,
  ChevronRight,
  Zap
} from 'lucide-react';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import api from '../services/api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';


/* =========================================================
   HELPERS
========================================================= */

function formatNumber(value) {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return String(value);
  }

  return number.toLocaleString();
}


function formatCurrency(value) {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return String(value);
  }

  if (Math.abs(number) >= 10000000) {
    return `₹${(number / 10000000).toFixed(2)}Cr`;
  }

  if (Math.abs(number) >= 100000) {
    return `₹${(number / 100000).toFixed(2)}L`;
  }

  if (Math.abs(number) >= 1000) {
    return `₹${(number / 1000).toFixed(1)}K`;
  }

  return `₹${number.toLocaleString()}`;
}


function getObjectValue(value, keys = []) {
  if (!value) return null;

  if (typeof value !== 'object') {
    return value;
  }

  for (const key of keys) {
    if (
      value[key] !== undefined &&
      value[key] !== null
    ) {
      return value[key];
    }
  }

  return null;
}


function normalizeChartData(data) {
  if (!Array.isArray(data)) return [];

  return data
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const keys = Object.keys(item);

      if (keys.length < 2) {
        return null;
      }

      const xKey = keys[0];
      const yKey = keys[1];

      return {
        label: String(item[xKey] ?? ''),
        value: Number(item[yKey]) || 0
      };
    })
    .filter(Boolean)
    .slice(0, 10);
}


/* =========================================================
   KPI CARD
========================================================= */

function MetricCard({
  icon: Icon,
  label,
  value,
  subtitle,
  type = 'purple',
  trend,
  loading
}) {
  return (
    <div className={`premium-metric-card ${type}`}>

      <div className="metric-card-top">

        <div className={`metric-icon ${type}`}>
          <Icon size={19} />
        </div>

        {trend && (
          <span className="metric-trend">
            {trend.direction === 'up' ? (
              <ArrowUpRight size={13} />
            ) : (
              <ArrowDownRight size={13} />
            )}

            {trend.text}
          </span>
        )}

      </div>

      <div className="metric-label">
        {label}
      </div>

      <div className="metric-value">
        {loading ? (
          <span className="metric-skeleton"></span>
        ) : (
          value
        )}
      </div>

      <div className="metric-subtitle">
        {subtitle}
      </div>

    </div>
  );
}


/* =========================================================
   INSIGHT ITEM
========================================================= */

function InsightItem({
  icon: Icon,
  title,
  text,
  type = 'purple'
}) {
  return (
    <div className={`business-insight-item ${type}`}>

      <div className="business-insight-icon">
        <Icon size={16} />
      </div>

      <div className="business-insight-content">
        <strong>{title}</strong>

        <span>{text}</span>
      </div>

    </div>
  );
}


/* =========================================================
   EMPTY STATE
========================================================= */

function DashboardEmpty({ onUpload }) {
  return (
    <div className="dashboard-empty-state">

      <div className="dashboard-empty-icon">
        <Database size={30} />
      </div>

      <div className="dashboard-empty-content">

        <span className="dashboard-empty-badge">
          GET STARTED
        </span>

        <h2>
          Your business intelligence starts here
        </h2>

        <p>
          Upload your first dataset and InsightAI will
          automatically analyze your business data,
          discover patterns and generate insights.
        </p>

        <button
          className="dashboard-empty-button"
          onClick={onUpload}
        >
          <Upload size={17} />
          Upload your first dataset
        </button>

      </div>

    </div>
  );
}


/* =========================================================
   MAIN DASHBOARD
========================================================= */

export default function Dashboard() {

  const { user } = useAuth();

  const [s, setS] = useState({
    datasets: 0,
    rows: 0,
    columns: 0
  });

  const [ds, setDs] = useState([]);

  const [insights, setInsights] = useState(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);


  /* =======================================================
     LOAD DASHBOARD
  ======================================================= */

  const loadDashboard = async (showRefresh = false) => {

    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {

      const [
        summaryRes,
        datasetsRes
      ] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/datasets')
      ]);


      const summary =
        summaryRes.data || {};

      const datasets =
        datasetsRes.data || [];


      setS(summary);

      setDs(datasets);


      /*
       * Analyze latest dataset
       */

      if (datasets.length > 0) {

        try {

          const latestDataset =
            datasets[0];

          const insightResponse =
            await api.get(
              `/dashboard/dataset/${latestDataset.id}/insights`
            );

          setInsights(
            insightResponse.data
          );

        } catch (error) {

          console.warn(
            'Insights unavailable',
            error
          );

          setInsights(null);
        }

      } else {

        setInsights(null);

      }

    } catch (error) {

      console.error(
        'Dashboard loading failed',
        error
      );

    } finally {

      setLoading(false);
      setRefreshing(false);

    }
  };


  useEffect(() => {
    loadDashboard();
  }, []);


  /* =======================================================
     REAL DATA FALLBACKS
  ======================================================= */

  const datasetCount =
    Number(
      s.datasets ||
      ds.length ||
      0
    );


  const rowCount =
    Number(
      s.rows ||
      ds.reduce(
        (total, dataset) =>
          total +
          Number(
            dataset.row_count || 0
          ),
        0
      )
    );


  const columnCount =
    Number(
      s.columns ||
      ds.reduce(
        (total, dataset) =>
          total +
          Number(
            dataset.column_count || 0
          ),
        0
      )
    );


  /* =======================================================
     ANALYTICS
  ======================================================= */

  const analytics =
    insights?.analytics || {};


  const totalRevenue =
    analytics.total_revenue ??
    analytics.revenue ??
    null;


  const totalQuantity =
    analytics.total_quantity ??
    analytics.quantity ??
    null;


  const topProduct =
    analytics.top_product ??
    analytics.topProduct ??
    null;


  const topCategory =
    analytics.top_category ??
    analytics.topCategory ??
    null;


  const topCustomer =
    analytics.top_customer ??
    analytics.topCustomer ??
    null;


  const bestDay =
    analytics.best_day ??
    analytics.bestDay ??
    null;


  /* =======================================================
     CHART DATA
  ======================================================= */

  const revenue =
    analytics?.charts?.revenue_by_date ||
    [];


  const revenueByProduct =
    analytics?.charts?.revenue_by_product ||
    analytics?.charts?.product_revenue ||
    [];


  const revenueByCategory =
    analytics?.charts?.revenue_by_category ||
    analytics?.charts?.category_revenue ||
    [];


  const datasetChart =
    ds.slice(0, 7).map((dataset) => ({
      name:
        dataset.name?.slice(0, 14) ||
        'Dataset',

      rows:
        Number(
          dataset.row_count || 0
        )
    }));


  const productChart =
    normalizeChartData(
      revenueByProduct
    );


  const categoryChart =
    normalizeChartData(
      revenueByCategory
    );


  /* =======================================================
     AI CONTENT
  ======================================================= */

  const insightList =
    insights?.ai?.key_insights ||
    insights?.key_insights ||
    insights?.insights ||
    [];


  const recommendations =
    insights?.ai?.recommendations ||
    insights?.recommendations ||
    [];


  const opportunities =
    insights?.ai?.opportunities ||
    insights?.opportunities ||
    [];


  const risks =
    insights?.ai?.risks ||
    insights?.risks ||
    [];


  /* =======================================================
     QUICK QUESTIONS
  ======================================================= */

  const questions = [
    {
      icon: TrendingUp,
      text: 'Which products generated the most revenue?'
    },
    {
      icon: BarChart3,
      text: 'Show me my revenue trend.'
    },
    {
      icon: Users,
      text: 'Which customers are buying less?'
    },
    {
      icon: Package,
      text: 'What should I restock?'
    }
  ];


  /* =======================================================
     DISPLAY VALUES
  ======================================================= */

  const topProductName =
    getObjectValue(
      topProduct,
      [
        'name',
        'product',
        'product_name',
        'label'
      ]
    );


  const topCategoryName =
    getObjectValue(
      topCategory,
      [
        'name',
        'category',
        'category_name',
        'label'
      ]
    );


  const topCustomerName =
    getObjectValue(
      topCustomer,
      [
        'name',
        'customer',
        'customer_name',
        'label'
      ]
    );


  const bestDayName =
    getObjectValue(
      bestDay,
      [
        'date',
        'day',
        'name',
        'label'
      ]
    );


  const firstInsight =
    insightList.length > 0
      ? typeof insightList[0] === 'string'
        ? insightList[0]
        : insightList[0]?.text ||
          insightList[0]?.insight ||
          JSON.stringify(insightList[0])
      : null;


  const firstRecommendation =
    recommendations.length > 0
      ? typeof recommendations[0] === 'string'
        ? recommendations[0]
        : recommendations[0]?.text ||
          recommendations[0]?.recommendation ||
          JSON.stringify(recommendations[0])
      : null;


  const firstOpportunity =
    opportunities.length > 0
      ? typeof opportunities[0] === 'string'
        ? opportunities[0]
        : opportunities[0]?.text ||
          opportunities[0]?.opportunity ||
          JSON.stringify(opportunities[0])
      : null;


  const firstRisk =
    risks.length > 0
      ? typeof risks[0] === 'string'
        ? risks[0]
        : risks[0]?.text ||
          risks[0]?.risk ||
          JSON.stringify(risks[0])
      : null;


  /* =======================================================
     MEMOIZED DATA
  ======================================================= */

  const businessStatus = useMemo(() => {

    if (loading) {
      return {
        label: 'Analyzing',
        description: 'Preparing your business intelligence',
        className: 'analyzing'
      };
    }

    if (insights) {
      return {
        label: 'AI Ready',
        description: 'Latest dataset analyzed',
        className: 'ready'
      };
    }

    if (ds.length > 0) {
      return {
        label: 'Processing',
        description: 'Dataset available for analysis',
        className: 'processing'
      };
    }

    return {
      label: 'Waiting',
      description: 'Upload a dataset to begin',
      className: 'waiting'
    };

  }, [
    loading,
    insights,
    ds.length
  ]);


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <Layout>

      <div className="dashboard-page">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="premium-dashboard-header">

          <div className="dashboard-heading">

            <div className="dashboard-eyebrow">
              <Sparkles size={14} />
              AI BUSINESS INTELLIGENCE
            </div>

            <h1>
              Welcome back,{' '}
              {user?.full_name || 'there'}
              <span>👋</span>
            </h1>

            <p>
              Your business intelligence command center.
              Monitor performance, discover opportunities
              and make smarter decisions with AI.
            </p>

          </div>


          <div className="dashboard-header-actions">

            <button
              className="dashboard-refresh"
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
              title="Refresh dashboard"
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? 'spin'
                    : ''
                }
              />
            </button>


            <Link
              to="/datasets"
              className="dashboard-upload-btn"
            >
              <Upload size={17} />
              Upload data
            </Link>

          </div>

        </header>


        {/* =================================================
            BUSINESS STATUS
        ================================================= */}

        <div className="dashboard-status-bar">

          <div className="dashboard-status-left">

            <div className="status-pulse">
              <span></span>
            </div>

            <div>
              <strong>
                {businessStatus.label}
              </strong>

              <span>
                {businessStatus.description}
              </span>
            </div>

          </div>


          <div className="dashboard-status-right">

            <span>
              <Activity size={14} />
              {datasetCount}{' '}
              {datasetCount === 1
                ? 'dataset'
                : 'datasets'}
            </span>

            <span>
              <Rows3 size={14} />
              {formatNumber(rowCount)} records
            </span>

          </div>

        </div>


        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {!loading && ds.length === 0 ? (

          <DashboardEmpty
            onUpload={() =>
              window.location.href =
                '/datasets'
            }
          />

        ) : (

          <>

            {/* =============================================
                KPI CARDS
            ============================================= */}

            <section className="premium-metrics-grid">

              <MetricCard
                icon={Database}
                label="DATASETS"
                value={formatNumber(datasetCount)}
                subtitle="Uploaded business datasets"
                type="purple"
                loading={loading}
              />


              <MetricCard
                icon={Rows3}
                label="DATA ROWS"
                value={formatNumber(rowCount)}
                subtitle="Records available for analysis"
                type="blue"
                loading={loading}
              />


              <MetricCard
                icon={Columns3}
                label="DATA COLUMNS"
                value={formatNumber(columnCount)}
                subtitle="Available data fields"
                type="green"
                loading={loading}
              />


              <MetricCard
                icon={TrendingUp}
                label="TOTAL REVENUE"
                value={formatCurrency(totalRevenue)}
                subtitle="Revenue across analyzed data"
                type="orange"
                loading={loading}
              />

            </section>


            {/* =============================================
                SECONDARY BUSINESS METRICS
            ============================================= */}

            <section className="business-metrics-grid">

              <div className="business-mini-card">

                <div className="business-mini-icon purple">
                  <Package size={18} />
                </div>

                <div>
                  <span>TOP PRODUCT</span>

                  <strong>
                    {topProductName || '—'}
                  </strong>
                </div>

                <ArrowUpRight
                  size={16}
                  className="business-mini-arrow"
                />

              </div>


              <div className="business-mini-card">

                <div className="business-mini-icon blue">
                  <Target size={18} />
                </div>

                <div>
                  <span>TOP CATEGORY</span>

                  <strong>
                    {topCategoryName || '—'}
                  </strong>
                </div>

                <ArrowUpRight
                  size={16}
                  className="business-mini-arrow"
                />

              </div>


              <div className="business-mini-card">

                <div className="business-mini-icon green">
                  <Users size={18} />
                </div>

                <div>
                  <span>TOP CUSTOMER</span>

                  <strong>
                    {topCustomerName || '—'}
                  </strong>
                </div>

                <ArrowUpRight
                  size={16}
                  className="business-mini-arrow"
                />

              </div>


              <div className="business-mini-card">

                <div className="business-mini-icon orange">
                  <ShoppingCart size={18} />
                </div>

                <div>
                  <span>TOTAL QUANTITY</span>

                  <strong>
                    {formatNumber(totalQuantity)}
                  </strong>
                </div>

                <ArrowUpRight
                  size={16}
                  className="business-mini-arrow"
                />

              </div>

            </section>


            {/* =============================================
                MAIN ANALYTICS GRID
            ============================================= */}

            <section className="dashboard-main-grid">


              {/* =========================================
                  REVENUE OVERVIEW
              ========================================= */}

              <div className="premium-card revenue-main-card">

                <div className="premium-card-header">

                  <div className="premium-card-title">

                    <div className="premium-card-icon purple">
                      <TrendingUp size={18} />
                    </div>

                    <div>
                      <h2>Revenue Overview</h2>

                      <p>
                        Revenue performance over time
                      </p>
                    </div>

                  </div>


                  <div className="chart-period">
                    <CalendarDays size={14} />
                    Latest data
                  </div>

                </div>


                <div className="large-revenue-chart">

                  {revenue.length > 0 ? (

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >

                      <LineChart
                        data={revenue}
                        margin={{
                          top: 20,
                          right: 20,
                          left: 0,
                          bottom: 5
                        }}
                      >

                        <defs>

                          <linearGradient
                            id="revenueGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopOpacity={0.25}
                            />

                            <stop
                              offset="100%"
                              stopOpacity={0}
                            />
                          </linearGradient>

                        </defs>


                        <CartesianGrid
                          strokeDasharray="4 5"
                          vertical={false}
                          stroke="#eef2f6"
                        />


                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: '#98a2b3',
                            fontSize: 10
                          }}
                        />


                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: '#98a2b3',
                            fontSize: 10
                          }}
                        />


                        <Tooltip
                          cursor={{
                            stroke: '#c7d2fe',
                            strokeWidth: 1
                          }}
                          contentStyle={{
                            borderRadius: '14px',
                            border: '1px solid #eaecf0',
                            boxShadow:
                              '0 15px 40px rgba(15,23,42,.10)',
                            fontSize: '12px'
                          }}
                        />


                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#6366f1"
                          strokeWidth={3}
                          dot={false}
                          activeDot={{
                            r: 6
                          }}
                        />

                      </LineChart>

                    </ResponsiveContainer>

                  ) : (

                    <div className="chart-empty-state">

                      <div>
                        <TrendingUp size={25} />
                      </div>

                      <strong>
                        Revenue analytics will appear here
                      </strong>

                      <span>
                        Your latest dataset needs revenue
                        data to generate this chart.
                      </span>

                    </div>

                  )}

                </div>

              </div>


              {/* =========================================
                  AI INSIGHTS
              ========================================= */}

              <div className="premium-card ai-command-card">

                <div className="premium-card-header">

                  <div className="premium-card-title">

                    <div className="premium-card-icon ai">
                      <Sparkles size={18} />
                    </div>

                    <div>
                      <h2>AI Business Insights</h2>

                      <p>
                        Intelligence from your data
                      </p>
                    </div>

                  </div>


                  <div className="ai-ready-pill">
                    <span></span>
                    {businessStatus.label}
                  </div>

                </div>


                <div className="ai-insights-body">

                  {insights ? (

                    <>

                      {totalRevenue !== null && (

                        <div className="ai-revenue-highlight">

                          <div>

                            <span>
                              ANALYZED REVENUE
                            </span>

                            <strong>
                              {formatCurrency(
                                totalRevenue
                              )}
                            </strong>

                          </div>

                          <div className="ai-revenue-icon">
                            <TrendingUp size={20} />
                          </div>

                        </div>

                      )}


                      <div className="business-insight-list">

                        {firstInsight && (
                          <InsightItem
                            icon={Lightbulb}
                            title="Key insight"
                            text={firstInsight}
                            type="purple"
                          />
                        )}


                        {firstOpportunity && (
                          <InsightItem
                            icon={TrendingUp}
                            title="Opportunity"
                            text={firstOpportunity}
                            type="green"
                          />
                        )}


                        {firstRisk && (
                          <InsightItem
                            icon={AlertTriangle}
                            title="Risk detected"
                            text={firstRisk}
                            type="orange"
                          />
                        )}


                        {firstRecommendation && (
                          <InsightItem
                            icon={Target}
                            title="Recommendation"
                            text={firstRecommendation}
                            type="blue"
                          />
                        )}

                      </div>


                      {!firstInsight &&
                        !firstOpportunity &&
                        !firstRisk &&
                        !firstRecommendation && (

                          <div className="ai-no-insights">
                            <Sparkles size={22} />

                            <span>
                              Your dataset has been analyzed.
                            </span>

                            <small>
                              Ask InsightAI for deeper
                              business recommendations.
                            </small>
                          </div>

                        )}


                      <Link
                        to="/chat"
                        className="ai-primary-button"
                      >
                        <Sparkles size={16} />
                        Explore with AI Analyst
                        <ArrowUpRight size={15} />
                      </Link>

                    </>

                  ) : (

                    <div className="ai-waiting-state">

                      <div className="ai-waiting-orb">
                        <Sparkles size={25} />
                      </div>

                      <strong>
                        Your AI analyst is ready
                      </strong>

                      <p>
                        Upload data and InsightAI will
                        discover patterns, trends,
                        opportunities and risks.
                      </p>

                      <Link
                        to="/chat"
                        className="ai-secondary-button"
                      >
                        <MessageSquare size={16} />
                        Open AI Analyst
                      </Link>

                    </div>

                  )}

                </div>

              </div>

            </section>


            {/* =============================================
                PRODUCT + CATEGORY ANALYTICS
            ============================================= */}

            <section className="secondary-chart-grid">


              {/* PRODUCT */}

              <div className="premium-card secondary-chart-card">

                <div className="premium-card-header">

                  <div className="premium-card-title">

                    <div className="premium-card-icon blue">
                      <Package size={18} />
                    </div>

                    <div>
                      <h2>Top Products</h2>

                      <p>
                        Highest performing products
                      </p>
                    </div>

                  </div>

                  {topProductName && (
                    <span className="chart-highlight-label">
                      #1 {String(topProductName).slice(0, 18)}
                    </span>
                  )}

                </div>


                <div className="secondary-chart">

                  {productChart.length > 0 ? (

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >

                      <BarChart
                        data={productChart}
                        layout="vertical"
                        margin={{
                          top: 5,
                          right: 15,
                          left: 10,
                          bottom: 5
                        }}
                      >

                        <CartesianGrid
                          strokeDasharray="3 4"
                          horizontal={false}
                          stroke="#eef2f6"
                        />

                        <XAxis
                          type="number"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: '#98a2b3',
                            fontSize: 10
                          }}
                        />

                        <YAxis
                          type="category"
                          dataKey="label"
                          width={90}
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: '#667085',
                            fontSize: 10
                          }}
                        />

                        <Tooltip />

                        <Bar
                          dataKey="value"
                          fill="#6366f1"
                          radius={[
                            0,
                            7,
                            7,
                            0
                          ]}
                          barSize={18}
                        />

                      </BarChart>

                    </ResponsiveContainer>

                  ) : (

                    <div className="chart-empty-small">

                      <Package size={24} />

                      <span>
                        Product analytics will appear
                        when available.
                      </span>

                    </div>

                  )}

                </div>

              </div>


              {/* CATEGORY */}

              <div className="premium-card secondary-chart-card">

                <div className="premium-card-header">

                  <div className="premium-card-title">

                    <div className="premium-card-icon green">
                      <PieChartIcon size={18} />
                    </div>

                    <div>
                      <h2>Category Performance</h2>

                      <p>
                        Revenue distribution by category
                      </p>
                    </div>

                  </div>

                </div>


                <div className="category-chart">

                  {categoryChart.length > 0 ? (

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >

                      <PieChart>

                        <Pie
                          data={categoryChart}
                          dataKey="value"
                          nameKey="label"
                          innerRadius={55}
                          outerRadius={88}
                          paddingAngle={3}
                        >

                          {categoryChart.map(
                            (_, index) => (
                              <Cell
                                key={index}
                              />
                            )
                          )}

                        </Pie>

                        <Tooltip />

                      </PieChart>

                    </ResponsiveContainer>

                  ) : (

                    <div className="category-empty">

                      <div className="category-empty-ring">
                        <PieChartIcon size={24} />
                      </div>

                      <strong>
                        {topCategoryName
                          ? topCategoryName
                          : 'Category insights'}
                      </strong>

                      <span>
                        {topCategoryName
                          ? 'Top performing category'
                          : 'Category analytics will appear when available'}
                      </span>

                    </div>

                  )}

                </div>

              </div>

            </section>


            {/* =============================================
                DATASET OVERVIEW
            ============================================= */}

            <section className="premium-card dataset-overview-card">

              <div className="premium-card-header">

                <div className="premium-card-title">

                  <div className="premium-card-icon purple">
                    <Database size={18} />
                  </div>

                  <div>
                    <h2>Dataset Overview</h2>

                    <p>
                      Records available across your datasets
                    </p>
                  </div>

                </div>


                <Link
                  to="/datasets"
                  className="premium-view-link"
                >
                  View all datasets
                  <ArrowUpRight size={15} />
                </Link>

              </div>


              <div className="dataset-overview-chart">

                {datasetChart.length > 0 ? (

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <BarChart
                      data={datasetChart}
                      margin={{
                        top: 15,
                        right: 15,
                        left: 0,
                        bottom: 5
                      }}
                    >

                      <CartesianGrid
                        strokeDasharray="3 4"
                        vertical={false}
                        stroke="#eef2f6"
                      />

                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: '#98a2b3',
                          fontSize: 10
                        }}
                      />

                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: '#98a2b3',
                          fontSize: 10
                        }}
                      />

                      <Tooltip
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid #eaecf0',
                          boxShadow:
                            '0 12px 30px rgba(15,23,42,.08)'
                        }}
                      />

                      <Bar
                        dataKey="rows"
                        fill="#6366f1"
                        radius={[
                          7,
                          7,
                          0,
                          0
                        ]}
                        barSize={40}
                      />

                    </BarChart>

                  </ResponsiveContainer>

                ) : (

                  <div className="chart-empty-state">

                    <Database size={25} />

                    <strong>
                      No dataset analytics
                    </strong>

                  </div>

                )}

              </div>

            </section>


            {/* =============================================
                QUICK AI ACTIONS
            ============================================= */}

            <section className="ai-actions-card">

              <div className="ai-actions-heading">

                <div className="ai-actions-icon">
                  <Sparkles size={20} />
                </div>

                <div>
                  <span>
                    AI-POWERED ANALYSIS
                  </span>

                  <h2>
                    What would you like to discover?
                  </h2>

                  <p>
                    Ask natural-language questions and
                    let InsightAI analyze your business.
                  </p>
                </div>

              </div>


              <div className="ai-question-grid">

                {questions.map(
                  (question, index) => {

                    const Icon =
                      question.icon;

                    return (
                      <Link
                        key={index}
                        to="/chat"
                        className="ai-question-card"
                      >

                        <div className="ai-question-icon">
                          <Icon size={17} />
                        </div>

                        <span>
                          {question.text}
                        </span>

                        <ChevronRight
                          size={16}
                        />

                      </Link>
                    );
                  }
                )}

              </div>


              <Link
                to="/chat"
                className="ai-main-cta"
              >
                <Sparkles size={17} />
                Ask InsightAI anything
                <ArrowUpRight size={16} />
              </Link>

            </section>


            {/* =============================================
                FOOTER
            ============================================= */}

            <footer className="dashboard-footer">

              <div>
                <div className="footer-brand-icon">
                  <Sparkles size={13} />
                </div>

                <strong>
                  InsightAI
                </strong>

                <span>
                  AI-powered business intelligence
                </span>
              </div>

              <span>
                {datasetCount > 0
                  ? `${formatNumber(rowCount)} records analyzed`
                  : 'Ready for your first dataset'}
              </span>

            </footer>

          </>

        )}

      </div>

    </Layout>
  );
}