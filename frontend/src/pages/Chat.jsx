import {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import {
  Send,
  Download,
  Sparkles,
  BarChart3,
  TrendingUp,
  Users,
  Package,
  ChevronDown,
  ChevronUp,
  Database,
  Bot,
  User,
  Lightbulb,
  ArrowUpRight,
  MessageSquareText,
  Zap,
  Copy,
  Check,
  Trash2,
  Clock3,
  Table2,
  Code2,
  Brain,
  ShieldCheck
} from 'lucide-react';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

import Layout from '../components/Layout';
import api, { getApiErrorMessage } from '../services/api';


/* =========================================================
   COLORS
========================================================= */

const CHART_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#14b8a6'
];


/* =========================================================
   MARKDOWN-LIKE TEXT RENDERER
   No extra package required.
========================================================= */

function RichText({ text }) {
  if (!text) return null;

  const lines = String(text).split('\n');

  const renderInline = (value) => {
    const parts = String(value).split(
      /(\*\*[^*]+\*\*|`[^`]+`)/g
    );

    return parts.map((part, index) => {
      if (
        part.startsWith('**') &&
        part.endsWith('**')
      ) {
        return (
          <strong key={index}>
            {part.slice(2, -2)}
          </strong>
        );
      }

      if (
        part.startsWith('`') &&
        part.endsWith('`')
      ) {
        return (
          <code key={index}>
            {part.slice(1, -1)}
          </code>
        );
      }

      return (
        <span key={index}>
          {part}
        </span>
      );
    });
  };

  return (
    <div className="ai-rich-text">
      {lines.map((line, index) => {

        const trimmed = line.trim();

        if (!trimmed) {
          return (
            <div
              key={index}
              className="ai-rich-spacer"
            />
          );
        }

        if (
          trimmed.startsWith('- ') ||
          trimmed.startsWith('* ')
        ) {
          return (
            <div
              key={index}
              className="ai-rich-list-item"
            >
              <span className="ai-rich-bullet">
                •
              </span>

              <span>
                {renderInline(
                  trimmed.slice(2)
                )}
              </span>
            </div>
          );
        }

        if (
          trimmed.startsWith('### ')
        ) {
          return (
            <h4 key={index}>
              {renderInline(
                trimmed.slice(4)
              )}
            </h4>
          );
        }

        if (
          trimmed.startsWith('## ')
        ) {
          return (
            <h3 key={index}>
              {renderInline(
                trimmed.slice(3)
              )}
            </h3>
          );
        }

        return (
          <p key={index}>
            {renderInline(line)}
          </p>
        );
      })}
    </div>
  );
}



function ResultChart({ chart }) {
  if (!chart?.data?.length) {
    return null;
  }

  const { type, x, y, data } = chart;

  if (type === "line") {
    return (
      <div className="ai-chart-card">
        <div className="ai-chart-header">
          <div className="ai-chart-title-wrap">
            <div className="ai-chart-icon purple">
              <TrendingUp size={17} />
            </div>
            <div>
              <span className="ai-chart-label">TREND ANALYSIS</span>
              <h4>{y} over {x}</h4>
            </div>
          </div>
          <span className="ai-chart-type">Line</span>
        </div>

        <div className="ai-chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid
                strokeDasharray="4 5"
                vertical={false}
                stroke="#eef2f6"
              />
              <XAxis dataKey={x} />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey={y}
                stroke="#6366f1"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (type === "pie") {
    return (
      <div className="ai-chart-card">
        <div className="ai-chart-header">
          <div className="ai-chart-title-wrap">
            <div className="ai-chart-icon green">
              <BarChart3 size={17} />
            </div>
            <div>
              <span className="ai-chart-label">DISTRIBUTION</span>
              <h4>{y} by {x}</h4>
            </div>
          </div>
          <span className="ai-chart-type">Pie</span>
        </div>

        <div className="ai-chart">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey={y}
                nameKey={x}
                outerRadius={105}
                innerRadius={55}
                paddingAngle={3}
                label
              >
                {data.map((_, index) => (
                  <Cell
                    key={index}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  const series = chart.series || [y];

  return (
    <div className="ai-chart-card">
      <div className="ai-chart-header">
        <div className="ai-chart-title-wrap">
          <div className="ai-chart-icon blue">
            <BarChart3 size={17} />
          </div>
          <div>
            <span className="ai-chart-label">COMPARISON</span>
            <h4>
              {series.length > 1
                ? "Monthly Sales and Profit by Region"
                : `${y} by ${x}`}
            </h4>
          </div>
        </div>
        <span className="ai-chart-type">Bar</span>
      </div>

      <div className="ai-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 10,
              right: 12,
              left: 0,
              bottom: 5
            }}
          >
            <CartesianGrid
              strokeDasharray="4 5"
              vertical={false}
              stroke="#eef2f6"
            />

            <XAxis
              dataKey={x}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#98a2b3", fontSize: 10 }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#98a2b3", fontSize: 10 }}
            />

            <Tooltip />
            <Legend />

            {series.map((seriesName, index) => (
              <Bar
                key={seriesName}
                dataKey={seriesName}
                name={
                  seriesName === "monthly_sales"
                    ? "Sales"
                    : seriesName === "monthly_profit"
                    ? "Profit"
                    : seriesName
                }
                fill={index === 0 ? "#6366f1" : "#10b981"}
                radius={[7, 7, 0, 0]}
                barSize={28}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* =========================================================
   DATA TABLE
========================================================= */

function DataTable({
  columns,
  rows
}) {

 if (
    !columns?.length ||
    !rows?.length
  ) {
    return null;
  }


  return (
    <div className="ai-data-card">

      <div className="ai-data-header">

        <div className="ai-data-title-wrap">

          <div className="ai-data-icon">
            <Table2 size={16} />
          </div>

          <div>
            <span className="ai-chart-label">
              QUERY RESULTS
            </span>

            <h4>
              Data returned by InsightAI
            </h4>
          </div>

        </div>

        <div className="ai-row-count">
          {rows.length} rows
        </div>

      </div>


      <div className="ai-table-wrapper">

        <table className="ai-result-table">

          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>


          <tbody>
            {rows
              .slice(0, 10)
              .map((row, index) => (
                <tr key={index}>
                  {row.map((value, i) => (
                    <td key={i}>
                      {value === null ||
                      value === undefined
                        ? '-'
                        : String(value)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>

        </table>

      </div>


      {rows.length > 10 && (
        <div className="ai-table-footer">
          Showing first 10 of{' '}
          {rows.length} results
        </div>
      )}

    </div>
  );
}


function SmartDataQuality({ columns, rows }) {
  if (!columns?.length) return null;

  const observations = [];

  // No data
  if (!rows || rows.length === 0) {
    observations.push({
      type: 'warning',
      title: 'No matching data',
      text: 'The query did not return any records, so there is nothing to compare or analyze.'
    });
  } else {
    // Only one result
    if (rows.length === 1) {
      observations.push({
        type: 'warning',
        title: 'Limited comparison',
        text: 'Only one result was returned. A broader query may provide a better comparison of your business performance.'
      });
    }

    // Missing values
    let missingValues = 0;

    rows.forEach((row) => {
      row.forEach((value) => {
        if (
          value === null ||
          value === undefined ||
          value === ''
        ) {
          missingValues += 1;
        }
      });
    });

    if (missingValues > 0) {
      observations.push({
        type: 'warning',
        title: 'Missing values detected',
        text: `${missingValues} missing value${missingValues === 1 ? '' : 's'} were found in the returned results.`
      });
    }

    // Date-based trend
    if (rows.length >= 3 && columns.length >= 2) {
      const firstColumn = String(columns[0]).toLowerCase();

      const looksLikeDate =
        firstColumn.includes('date') ||
        firstColumn.includes('month') ||
        firstColumn.includes('time') ||
        firstColumn.includes('year');

      if (looksLikeDate) {
        const values = rows
          .map((row) => Number(row[1]))
          .filter((value) => Number.isFinite(value));

        if (values.length >= 3) {
          const firstValue = values[0];
          const lastValue = values[values.length - 1];

          if (firstValue !== 0) {
            const change =
              ((lastValue - firstValue) / Math.abs(firstValue)) * 100;

            if (Math.abs(change) >= 5) {
              const direction =
                change > 0 ? 'increased' : 'decreased';

              observations.push({
                type: change > 0 ? 'positive' : 'warning',
                title: 'Trend detected',
                text: `The ${columns[1]} ${direction} by approximately ${Math.abs(change).toFixed(1)}% from the first to the last returned period.`
              });
            }
          }
        }
      }
    }

    // High concentration
    if (rows.length >= 2 && columns.length >= 2) {
      const numericValues = rows
        .map((row) => Number(row[1]))
        .filter((value) => Number.isFinite(value) && value >= 0);

      if (numericValues.length >= 2) {
        const total = numericValues.reduce(
          (sum, value) => sum + value,
          0
        );

        const highest = Math.max(...numericValues);

        if (total > 0) {
          const share = (highest / total) * 100;

          if (share >= 30) {
            const concentrationType =
              share >= 80
                ? 'High concentration'
                : share >= 50
                  ? 'Strong concentration'
                  : 'Leading contributor';

            observations.push({
              type: share >= 50 ? 'info' : 'positive',
              title: concentrationType,
              text: `The top result contributes approximately ${share.toFixed(1)}% of the total ${columns[1]} returned by this query.`
            });
          }
        }
      }
    }
  }

  if (observations.length === 0) return null;

  return (
    <div className="smart-data-quality">
      <div className="smart-data-quality-header">
        <div className="smart-data-quality-icon">
          <Sparkles size={15} />
        </div>

        <div>
          <strong>Smart observations</strong>
          <span>Automatic data checks</span>
        </div>
      </div>

      <div className="smart-data-quality-list">
        {observations.map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            className={`smart-data-quality-item ${item.type}`}
          >
            <div className="smart-data-quality-dot" />

            <div>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FollowUpActions({ columns, rows, onAsk }) {
  if (!rows || rows.length === 0 || !columns || columns.length < 2) {
    return null;
  }

  const firstColumn = String(columns[0]).toLowerCase();

  const firstValue =
    rows[0]?.[0] !== undefined
      ? String(rows[0][0])
      : 'this result';

  const looksLikeDate =
    firstColumn.includes('date') ||
    firstColumn.includes('month') ||
    firstColumn.includes('time') ||
    firstColumn.includes('year');

  const actions = [
    {
      label: `Analyze ${firstValue}`,
      question: `Analyze ${firstValue} and explain why it is performing this way.`
    },
    {
      label: 'Compare top 3',
      question: `Compare the top 3 results and explain the key differences between them.`
    },
    {
      label: 'Find underperformers',
      question: `Identify the lowest-performing results and explain what the business should investigate.`
    }
  ];

  if (looksLikeDate) {
    actions.push({
      label: 'Show trend',
      question: `Analyze the trend over time and explain whether performance is improving or declining.`
    });
  } else {
    actions.push({
      label: 'Explain the result',
      question: `Explain the main business insight from these results and what action I should take.`
    });
  }

  return (
    <div className="ai-follow-up">
      <div className="ai-follow-up-header">
        <div className="ai-follow-up-title">
          <Sparkles size={14} />
          <span>Continue analysis</span>
        </div>

        <span className="ai-follow-up-subtitle">
          Ask a follow-up question
        </span>
      </div>

      <div className="ai-follow-up-actions">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            className="ai-follow-up-button"
            onClick={() => onAsk(action.question)}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ExecutiveInsights({ columns, rows }) {
  if (!columns?.length || !rows?.length || columns.length < 2) {
    return null;
  }

  const labelColumn = String(columns[0]);
  const valueColumn = String(columns[1]);

  const items = rows
    .map((row) => ({
      label: row?.[0] !== undefined ? String(row[0]) : '',
      value: Number(row?.[1])
    }))
    .filter((item) => item.label && Number.isFinite(item.value));

  if (!items.length) return null;

  const sorted = [...items].sort((a, b) => b.value - a.value);

  const top = sorted[0];
  const bottom = sorted[sorted.length - 1];

  const total = items.reduce(
    (sum, item) => sum + item.value,
    0
  );

  const topShare =
    total > 0
      ? (top.value / total) * 100
      : 0;

  const average =
    items.length > 0
      ? total / items.length
      : 0;

  const concentrationText =
    topShare >= 50
      ? `${top.label} contributes approximately ${topShare.toFixed(1)}% of the returned ${valueColumn}.`
      : `${top.label} is the strongest contributor, representing approximately ${topShare.toFixed(1)}% of the returned ${valueColumn}.`;

  const recommendation =
    topShare >= 50
      ? `Protect ${top.label}'s performance while reducing dependency by improving the other ${items.length - 1} results.`
      : `Continue supporting ${top.label} while looking for ways to improve the lower-performing results.`;

  const risk =
    topShare >= 50
      ? `A large share of the returned ${valueColumn} is concentrated in ${top.label}.`
      : `Performance is spread across multiple results, but the gap between the strongest and weakest results should be monitored.`;

  const opportunity =
    bottom.value < average
      ? `${bottom.label} is below the average returned ${valueColumn}, creating an opportunity for improvement.`
      : `There is an opportunity to improve the overall performance of the returned ${labelColumn.toLowerCase()} results.`;

  return (
    <div className="ai-executive-insights">
      <div className="ai-executive-header">
        <div className="ai-executive-title">
          <div className="ai-executive-icon">
            <Sparkles size={16} />
          </div>

          <div>
            <strong>AI Executive Insights</strong>
            <span>Business summary from verified query results</span>
          </div>
        </div>

        <div className="ai-executive-badge">
          {items.length} results analyzed
        </div>
      </div>

      <div className="ai-executive-grid">

        <div className="ai-executive-card finding">
          <div className="ai-executive-card-label">
            KEY FINDING
          </div>

          <h4>
            {top.label} is the leading contributor
          </h4>

          <p>
            It generated {top.value.toLocaleString()} in {valueColumn}.
          </p>
        </div>

        <div className="ai-executive-card impact">
          <div className="ai-executive-card-label">
            BUSINESS IMPACT
          </div>

          <h4>
            {topShare.toFixed(1)}% contribution
          </h4>

          <p>
            {concentrationText}
          </p>
        </div>

        <div className="ai-executive-card recommendation">
          <div className="ai-executive-card-label">
            RECOMMENDATION
          </div>

          <h4>
            Protect the leader, improve the rest
          </h4>

          <p>
            {recommendation}
          </p>
        </div>

        <div className="ai-executive-card risk">
          <div className="ai-executive-card-label">
            RISK
          </div>

          <h4>
            Revenue concentration
          </h4>

          <p>
            {risk}
          </p>
        </div>

        <div className="ai-executive-card opportunity">
          <div className="ai-executive-card-label">
            OPPORTUNITY
          </div>

          <h4>
            Improve the lower performers
          </h4>

          <p>
            {opportunity}
          </p>
        </div>

        <div className="ai-executive-card benchmark">
          <div className="ai-executive-card-label">
            AVERAGE RESULT
          </div>

          <h4>
            {average.toLocaleString(undefined, {
              maximumFractionDigits: 0
            })}
          </h4>

          <p>
            Average {valueColumn} across the returned results.
          </p>
        </div>

      </div>
    </div>
  );
}

/* =========================================================
   SQL BLOCK
========================================================= */
function AnomalyDetection({ columns, rows }) {
  if (!columns?.length || !rows?.length || columns.length < 2) {
    return null;
  }

  const values = rows
    .map((row) => ({
      label: row?.[0] !== undefined ? String(row[0]) : '',
      value: Number(row?.[1])
    }))
    .filter(
      (item) =>
        item.label &&
        Number.isFinite(item.value)
    );

  if (values.length < 5) {
    return null;
  }

  const sortedValues = values
    .map((item) => item.value)
    .sort((a, b) => a - b);

  const percentile = (array, p) => {
    const index = (array.length - 1) * p;
    const lower = Math.floor(index);
    const upper = Math.ceil(index);

    if (lower === upper) {
      return array[lower];
    }

    return (
      array[lower] +
      (array[upper] - array[lower]) *
        (index - lower)
    );
  };

  const q1 = percentile(sortedValues, 0.25);
  const q3 = percentile(sortedValues, 0.75);
  const iqr = q3 - q1;

  if (iqr <= 0) {
    return null;
  }

  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  const anomalies = values.filter(
    (item) =>
      item.value < lowerBound ||
      item.value > upperBound
  );

  if (!anomalies.length) {
    return null;
  }

  return (
    <div className="ai-anomaly-card">
      <div className="ai-anomaly-header">
        <div className="ai-anomaly-icon">
          ⚠
        </div>

        <div>
          <strong>Potential anomalies</strong>
          <span>
            Statistical check on returned results
          </span>
        </div>

        <div className="ai-anomaly-count">
          {anomalies.length}
        </div>
      </div>

      <div className="ai-anomaly-list">
        {anomalies.slice(0, 3).map((item) => (
          <div
            className="ai-anomaly-item"
            key={item.label}
          >
            <div>
              <strong>{item.label}</strong>

              <p>
                {item.value.toLocaleString()} in{' '}
                {columns[1]} is outside the
                expected statistical range.
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="ai-anomaly-note">
        This is a statistical signal, not proof of a
        business problem. Investigate the underlying
        data before taking action.
      </div>
    </div>
  );
}
function SqlBlock({ sql }) {

  const [
    open,
    setOpen
  ] = useState(false);

  const [
    copied,
    setCopied
  ] = useState(false);


  if (!sql) {
    return null;
  }


  const copySql = async () => {

    try {

      await navigator.clipboard.writeText(
        sql
      );

      setCopied(true);

      setTimeout(
        () => setCopied(false),
        1600
      );

    } catch (error) {

      console.warn(
        'Unable to copy SQL',
        error
      );

    }
  };


  return (
    <div className="ai-sql-card">

      <button
        className="ai-sql-toggle"
        onClick={() =>
          setOpen(!open)
        }
      >

        <div className="ai-sql-title">

          <div className="ai-sql-icon">
            <Code2 size={15} />
          </div>

          <span>
            Generated SQL query
          </span>

        </div>


        {open ? (
          <ChevronUp size={17} />
        ) : (
          <ChevronDown size={17} />
        )}

      </button>


      {open && (

        <div className="ai-sql-expanded">

          <div className="ai-sql-toolbar">

            <span>
              Read-only query
            </span>

            <button
              onClick={copySql}
              className="ai-copy-button"
            >

              {copied ? (
                <Check size={13} />
              ) : (
                <Copy size={13} />
              )}

              {copied
                ? 'Copied'
                : 'Copy'}

            </button>

          </div>


          <pre className="ai-sql-code">
            {sql}
          </pre>

        </div>

      )}

    </div>
  );
}


/* =========================================================
   WELCOME SCREEN
========================================================= */

function WelcomeScreen({
  onQuestion
}) {

  const suggestions = [

    {
      icon: TrendingUp,
      title: 'Revenue trends',
      text:
        'Show me revenue trends over time',
      type: 'purple'
    },

    {
      icon: Package,
      title: 'Top products',
      text:
        'Which products sold the most?',
      type: 'blue'
    },

    {
      icon: Users,
      title: 'Best customers',
      text:
        'Who are my top 5 customers?',
      type: 'green'
    },

    {
      icon: BarChart3,
      title: 'Business overview',
      text:
        'Give me a complete business summary',
      type: 'orange'
    }

  ];


  return (
    <div className="ai-welcome">

      <div className="ai-welcome-orbit">

        <div className="ai-welcome-icon">
          <Sparkles size={30} />
        </div>

        <div className="ai-orbit-dot dot-one"></div>
        <div className="ai-orbit-dot dot-two"></div>
        <div className="ai-orbit-dot dot-three"></div>

      </div>


      <div className="ai-welcome-badge">

        <span className="ai-live-dot"></span>

        AI ANALYST ONLINE

      </div>


      <h2>
        Ask your data
        <span> anything.</span>
      </h2>


      <p>
        Turn your business data into clear answers,
        charts, trends and actionable insights.
      </p>


      <div className="ai-capability-row">

        <span>
          <Brain size={13} />
          Natural language
        </span>

        <span>
          <BarChart3 size={13} />
          Smart charts
        </span>

        <span>
          <ShieldCheck size={13} />
          Verified data
        </span>

      </div>


      <div className="ai-suggestion-grid">

        {suggestions.map((item) => {

          const Icon =
            item.icon;

          return (

            <button
              key={item.title}
              className="ai-suggestion-card"
              onClick={() =>
                onQuestion(
                  item.text
                )
              }
            >

              <div
                className={`ai-suggestion-icon ${item.type}`}
              >
                <Icon size={19} />
              </div>


              <div>

                <strong>
                  {item.title}
                </strong>

                <span>
                  {item.text}
                </span>

              </div>


              <ArrowUpRight size={16} />

            </button>

          );

        })}

      </div>

    </div>
  );
}


/* =========================================================
   MAIN CHAT
========================================================= */

export default function Chat() {

  const [
    q,
    setQ
  ] = useState('');

  const [
    messages,
    setMessages
  ] = useState([]);

  const [
    busy,
    setBusy
  ] = useState(false);

  const [reportBusy, setReportBusy] = useState(false);
const [copiedMessage, setCopiedMessage] = useState(null);

  const messagesEndRef =
    useRef(null);

  const inputRef =
    useRef(null);


  /* =======================================================
     AUTO SCROLL
  ======================================================= */

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });

  }, [
    messages,
    busy
  ]);


  /* =======================================================
     ASK AI
  ======================================================= */

  const ask = async (
    customQuestion
  ) => {

    const question =
      (
        customQuestion ||
        q
      ).trim();


    if (
      !question ||
      busy
    ) {
      return;
    }


    setQ('');


   const history = messages
  .slice(-12)
  .map((m) => ({
    role: m.role,
    text: m.text
  }));

    setMessages((current) => [
      ...current,
      {
        role: 'user',
        text: question,
        time: new Date()
      }
    ]);


    setBusy(true);


    try {

      const response =
        await api.post(
          '/datasets/chat',
          {
            question,
            history
          }
        );


      setMessages(
        (current) => [
          ...current,
          {
            role: 'assistant',
            text:
              response.data.answer,
            sql:
              response.data.sql,
            columns:
              response.data.columns,
            rows:
              response.data.rows,
            chart:
              response.data.chart,
            time:
              new Date()
          }
        ]
      );

    } catch (error) {

      setMessages(
        (current) => [
          ...current,
          {
            role: 'assistant',
            text: getApiErrorMessage(
  error,
  'Something went wrong while analyzing your data.'
),
            error: true,
            time:
              new Date()
          }
        ]
      );

    } finally {

      setBusy(false);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);

    }
  };


  /* =======================================================
     PDF REPORT
  ======================================================= */

  const report = async () => {

    if (
      !messages.length ||
      reportBusy
    ) {
      return;
    }


    const last =
      [...messages]
        .reverse()
        .find(
          (x) =>
            x.role === 'user'
        );


    if (!last) {
      return;
    }


    setReportBusy(true);


    try {

      const response =
        await api.post(
          '/datasets/report',
          {
            question:
              last.text
          },
          {
            responseType: 'blob'
          }
        );


      const url =
        URL.createObjectURL(
          response.data
        );


      const a =
        document.createElement(
          'a'
        );

      a.href = url;

      a.download =
        'insightai-report.pdf';

      a.click();


      URL.revokeObjectURL(
        url
      );

    } catch (error) {

      alert(
        error.response?.data?.detail ||
        'Unable to generate report.'
      );

    } finally {

      setReportBusy(false);

    }
  };


  /* =======================================================
     CLEAR CHAT
  ======================================================= */

  const clearChat = () => {

    if (!messages.length) {
      return;
    }


    const confirmed =
      window.confirm(
        'Clear this AI conversation?'
      );


    if (confirmed) {
      setMessages([]);
      setQ('');

      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };


  /* =======================================================
     MESSAGE COUNT
  ======================================================= */

  const questionCount =
    useMemo(
      () =>
        messages.filter(
          (m) =>
            m.role === 'user'
        ).length,
      [messages]
    );


  /* =======================================================
     FORMAT TIME
  ======================================================= */

  const formatTime = (date) => {
    if (!date) return '';

    const value = date instanceof Date ? date : new Date(date);

    if (Number.isNaN(value.getTime())) {
      return '';
    }

    return value.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

const copyAnswer = async (text, index) => {
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);

    setCopiedMessage(index);

    setTimeout(() => {
      setCopiedMessage(null);
    }, 1600);
  } catch (error) {
    console.warn('Unable to copy answer', error);
  }
};

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <Layout>

      <div className="ai-page">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="ai-page-header">

          <div>

            <div className="ai-title-row">

              <div className="ai-title-icon">
                <Sparkles size={21} />
              </div>


              <div>

                <div className="ai-overline">
                  INTELLIGENT BUSINESS ANALYTICS
                </div>

                <h1>
                  AI Analyst
                </h1>

              </div>

            </div>


            <p>
              Ask questions about your business data
              and get instant, explainable insights.
            </p>

          </div>


          <div className="ai-header-actions">

            <div className="ai-online-status">

              <span></span>

              AI Online

            </div>


            {messages.length > 0 && (

              <>

                <div className="ai-question-count">

                  <MessageSquareText
                    size={13}
                  />

                  {questionCount}{' '}
                  {questionCount === 1
                    ? 'question'
                    : 'questions'}

                </div>


                <button
                  onClick={clearChat}
                  className="ai-clear-button"
                  title="Clear conversation"
                >
                  <Trash2 size={15} />
                </button>


                <button
                  onClick={report}
                  disabled={reportBusy}
                  className="ai-report-button"
                >

                  {reportBusy ? (
                    <>
                      <span className="ai-button-spinner"></span>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      PDF Report
                    </>
                  )}

                </button>

              </>

            )}

          </div>

        </div>


        {/* =================================================
            WORKSPACE
        ================================================= */}

        <div className="ai-workspace">

          {/* =================================================
              TOP BAR
          ================================================= */}

          <div className="ai-workspace-top">

            <div className="ai-workspace-title">

              <div className="ai-bot-avatar">
                <Bot size={19} />
              </div>


              <div>

                <strong>
                  InsightAI Analyst
                </strong>

                <span>
                  Powered by your business data
                </span>

              </div>

            </div>


            <div className="ai-secure-badge">

              <Zap size={14} />

              Real-time analysis

            </div>

          </div>


          {/* =================================================
              CHAT CONTENT
          ================================================= */}

          <div className="ai-chat-area">

            {!messages.length ? (

              <WelcomeScreen
                onQuestion={ask}
              />

            ) : (

              <div className="ai-messages">

                {messages.map(
                  (message, index) => (

                    <div
                      key={index}
                      className={`ai-message ${
                        message.role === 'user'
                          ? 'ai-message-user'
                          : 'ai-message-assistant'
                      }`}
                    >

                      <div className="ai-message-avatar">

                        {message.role === 'user' ? (
                          <User size={17} />
                        ) : (
                          <Sparkles size={17} />
                        )}

                      </div>


                      <div className="ai-message-content">

                        <div className="ai-message-meta">

                          <div className="ai-message-name">

                            {message.role === 'user'
                              ? 'You'
                              : 'InsightAI'}

                          </div>


                          {message.time && (

                            <span className="ai-message-time">

                              <Clock3
                                size={11}
                              />

                              {formatTime(
                                message.time
                              )}

                            </span>

                          )}

                        </div>


                        <div
                          className={`ai-message-bubble ${
                            message.error
                              ? 'ai-message-error'
                              : ''
                          }`}
                                           >

                          {message.text && (
                            <div className="ai-message-text">
                              {message.text}
                            </div>
                          )}

                          {message.role === 'assistant' && !message.error && (
  <div className="ai-answer-actions">
    <button
      type="button"
      onClick={() => copyAnswer(message.text, index)}
      className="ai-copy-answer-button"
    >
      {copiedMessage === index ? (
        <>
          <Check size={13} />
          Copied
        </>
      ) : (
        <>
          <Copy size={13} />
          Copy answer
        </>
      )}
    </button>
  </div>
)}


                          {message.role ===
                            'assistant' &&
                            !message.error && (
                              <>

                               <ResultChart chart={message.chart} />

<DataTable
  columns={message.columns}
  rows={message.rows}
/>

<SmartDataQuality
  columns={message.columns}
  rows={message.rows}
/>


<AnomalyDetection
  columns={message.columns}
  rows={message.rows}
/>

<SqlBlock sql={message.sql} />
                                

                              </>
                            )}

                        </div>

                      </div>

                    </div>

                  )
                )}


                {/* THINKING */}

                {busy && (

                  <div className="ai-message ai-message-assistant">

                    <div className="ai-message-avatar">
                      <Sparkles size={17} />
                    </div>


                    <div className="ai-message-content">

                      <div className="ai-message-meta">

                        <div className="ai-message-name">
                          InsightAI
                        </div>

                        <span className="ai-thinking-label">
                          Processing
                        </span>

                      </div>


                      <div className="ai-thinking">

                        <div className="ai-thinking-icon">
                          <Brain size={15} />
                        </div>

                        <span>
                          Analyzing your data
                        </span>

                        <div className="ai-thinking-dots">
                          <i></i>
                          <i></i>
                          <i></i>
                        </div>

                      </div>

                    </div>

                  </div>

                )}


                <div
                  ref={messagesEndRef}
                />

              </div>

            )}

          </div>


          {/* =================================================
              INPUT
          ================================================= */}

          <div className="ai-input-section">

            <div className="ai-input-suggestions">

              <button
                onClick={() =>
                  ask(
                    'Which product sold the most?'
                  )
                }
                disabled={busy}
              >
                <TrendingUp size={14} />
                Top product
              </button>


              <button
                onClick={() =>
                  ask(
                    'What are my top 5 customers?'
                  )
                }
                disabled={busy}
              >
                <Users size={14} />
                Top customers
              </button>


              <button
                onClick={() =>
                  ask(
                    'Show me my revenue trend'
                  )
                }
                disabled={busy}
              >
                <BarChart3 size={14} />
                Revenue trend
              </button>


              <button
                onClick={() =>
                  ask(
                    'What are the biggest business risks in my data?'
                  )
                }
                disabled={busy}
              >
                <Lightbulb size={14} />
                Find risks
              </button>

            </div>


            <div className="ai-input-box">

              <MessageSquareText
                size={19}
                className="ai-input-icon"
              />


              <input
                ref={inputRef}
                value={q}
                onChange={(e) =>
                  setQ(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {

                  if (
                    e.key === 'Enter' &&
                    !e.shiftKey
                  ) {
                    e.preventDefault();
                    ask();
                  }

                }}
                placeholder="Ask anything about your business data..."
                disabled={busy}
              />


              <button
                onClick={() =>
                  ask()
                }
                disabled={
                  !q.trim() ||
                  busy
                }
                className="ai-send-button"
              >

                <Send size={18} />

              </button>

            </div>


            <div className="ai-input-footer">

              <span>
                <Lightbulb size={13} />
                Ask in natural language
              </span>


              <span>
                <ShieldCheck size={13} />
                Answers are based on your uploaded data
              </span>

            </div>

          </div>

        </div>

      </div>

    </Layout>
  );
}
