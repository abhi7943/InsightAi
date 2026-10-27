import { useEffect, useMemo, useState } from 'react';

import {
  Upload,
  Trash2,
  Download,
  FileSpreadsheet,
  Database,
  Rows3,
  Columns3,
  FileText,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Search,
  X,
  BarChart3,
  Clock3,
  FileCheck2,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';

import { Link } from 'react-router-dom';

import api from '../services/api';
import Layout from '../components/Layout';


export default function Datasets() {

  const [ds, setDs] = useState([]);
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [dragging, setDragging] = useState(false);

  const [search, setSearch] = useState('');

  const [deletingId, setDeletingId] = useState(null);


  /* =========================================================
     LOAD DATASETS
  ========================================================= */

  const load = async () => {

    try {

      setLoadingData(true);

      const response = await api.get('/datasets');

      setDs(response.data || []);

    } catch (error) {

      console.error('Failed to load datasets:', error);

    } finally {

      setLoadingData(false);

    }

  };


  useEffect(() => {

    load();

  }, []);


  /* =========================================================
     FILE SELECTION
  ========================================================= */

  const selectFile = (selectedFile) => {

    if (!selectedFile) return;


    const allowed = [
      '.csv',
      '.xlsx',
      '.xls',
      '.pdf'
    ];


    const extension =
      '.' +
      selectedFile.name
        .split('.')
        .pop()
        .toLowerCase();


    if (!allowed.includes(extension)) {

      alert(
        'Please select a CSV, Excel or PDF file.'
      );

      return;

    }


    setFile(selectedFile);

  };


  /* =========================================================
     UPLOAD
  ========================================================= */

  const upload = async () => {

    if (!file) return;


    setLoading(true);


    const fd = new FormData();

    fd.append('file', file);


    try {

      await api.post(
        '/datasets/upload',
        fd,
        {
          headers: {
            'Content-Type':
              'multipart/form-data'
          }
        }
      );


      setFile(null);

      await load();


    } catch (error) {

      alert(
        error.response?.data?.detail ||
        'Upload failed'
      );


    } finally {

      setLoading(false);

    }

  };


  /* =========================================================
     DELETE
  ========================================================= */

  const del = async (id) => {

    if (!confirm('Delete this dataset?')) {
      return;
    }


    try {

      setDeletingId(id);

      await api.delete(`/datasets/${id}`);

      await load();


    } catch (error) {

      alert(
        error.response?.data?.detail ||
        'Failed to delete dataset'
      );


    } finally {

      setDeletingId(null);

    }

  };


  /* =========================================================
     DOWNLOAD
  ========================================================= */

  const download = async (id, ext = 'csv') => {

    try {

      const response = await api.get(
        `/datasets/${id}/download.${ext}`,
        {
          responseType: 'blob'
        }
      );


      const url =
        URL.createObjectURL(response.data);


      const anchor =
        document.createElement('a');


      anchor.href = url;

      anchor.download =
        `dataset.${ext}`;


      document.body.appendChild(anchor);

      anchor.click();

      anchor.remove();

      URL.revokeObjectURL(url);


    } catch (error) {

      alert(
        error.response?.data?.detail ||
        'Download failed'
      );

    }

  };


  /* =========================================================
     DRAG & DROP
  ========================================================= */

  const handleDrop = (event) => {

    event.preventDefault();

    setDragging(false);


    const droppedFile =
      event.dataTransfer.files?.[0];


    if (droppedFile) {

      selectFile(droppedFile);

    }

  };


  /* =========================================================
     HELPERS
  ========================================================= */

  const getExtension = (name = '') => {

    return (
      name
        .split('.')
        .pop()
        ?.toLowerCase() || ''
    );

  };


  const getFileIcon = (name = '') => {

    const extension =
      getExtension(name);


    if (extension === 'pdf') {

      return (
        <FileText size={22} />
      );

    }


    return (
      <FileSpreadsheet size={22} />
    );

  };


  const getFileType = (name = '') => {

    const extension =
      getExtension(name);


    if (extension === 'xlsx') {
      return 'Excel';
    }

    if (extension === 'xls') {
      return 'Excel';
    }

    if (extension === 'pdf') {
      return 'PDF';
    }

    return 'CSV';

  };


  const formatSize = (bytes = 0) => {

    if (!bytes) return '0 KB';


    const mb =
      bytes / 1024 / 1024;


    if (mb < 1) {

      return `${Math.max(
        1,
        Math.round(bytes / 1024)
      )} KB`;

    }


    return `${mb.toFixed(2)} MB`;

  };


  /* =========================================================
     FILTERED DATASETS
  ========================================================= */

  const filteredDatasets = useMemo(() => {

    const query =
      search.trim().toLowerCase();


    if (!query) {

      return ds;

    }


    return ds.filter((dataset) => {

      const name =
        String(
          dataset.name || ''
        ).toLowerCase();


      const filename =
        String(
          dataset.source_filename || ''
        ).toLowerCase();


      return (
        name.includes(query) ||
        filename.includes(query)
      );

    });

  }, [ds, search]);


  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalRows =
    ds.reduce(
      (sum, dataset) =>
        sum +
        Number(
          dataset.row_count || 0
        ),
      0
    );


  const totalColumns =
    ds.reduce(
      (sum, dataset) =>
        sum +
        Number(
          dataset.column_count || 0
        ),
      0
    );


  const latestDataset =
    ds.length > 0
      ? [...ds].sort(
          (a, b) =>
            new Date(b.created_at) -
            new Date(a.created_at)
        )[0]
      : null;


  /* =========================================================
     RENDER
  ========================================================= */

  return (

    <Layout>

      <div className="datasets-page">


        {/* =================================================
            HEADER
        ================================================= */}

        <section className="datasets-header">

          <div>

            <div className="datasets-eyebrow">

              <span className="datasets-eyebrow-dot"></span>

              DATA WORKSPACE

            </div>


            <h1 className="datasets-title">

              Your data command center

            </h1>


            <p className="datasets-subtitle">

              Upload, manage and prepare your
              business data for AI-powered analysis.

            </p>

          </div>


          <div className="datasets-header-actions">

            <button
              className="dataset-refresh-button"
              onClick={load}
              title="Refresh datasets"
            >

              <RefreshCw
                size={17}
                className={
                  loadingData
                    ? 'dataset-spin'
                    : ''
                }
              />

            </button>


            <Link
              to="/chat"
              className="dataset-ai-button"
            >

              <Sparkles size={16} />

              Ask AI

              <ArrowUpRight size={15} />

            </Link>

          </div>

        </section>


        {/* =================================================
            STATUS BAR
        ================================================= */}

        <section className="dataset-status-bar">

          <div className="dataset-status-left">

            <div className="dataset-status-icon">

              <Sparkles size={17} />

            </div>


            <div>

              <strong>

                {ds.length > 0
                  ? 'AI workspace is ready'
                  : 'Your AI workspace is waiting'}

              </strong>


              <span>

                {ds.length > 0
                  ? 'Your data is available for business analysis.'
                  : 'Upload your first dataset to start analyzing.'}

              </span>

            </div>

          </div>


          <div className="dataset-status-right">

            <span>

              <FileCheck2 size={14} />

              {ds.length} datasets

            </span>


            <span>

              <Rows3 size={14} />

              {totalRows.toLocaleString()} records

            </span>

          </div>

        </section>


        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="dataset-stats">

          <div className="dataset-stat premium-stat">

            <div className="dataset-stat-icon purple">

              <Database size={20} />

            </div>


            <div className="dataset-stat-content">

              <span>DATASETS</span>

              <strong>
                {ds.length.toLocaleString()}
              </strong>

              <small>
                Uploaded business files
              </small>

            </div>

          </div>


          <div className="dataset-stat premium-stat">

            <div className="dataset-stat-icon blue">

              <Rows3 size={20} />

            </div>


            <div className="dataset-stat-content">

              <span>TOTAL ROWS</span>

              <strong>
                {totalRows.toLocaleString()}
              </strong>

              <small>
                Records available for AI
              </small>

            </div>

          </div>


          <div className="dataset-stat premium-stat">

            <div className="dataset-stat-icon green">

              <Columns3 size={20} />

            </div>


            <div className="dataset-stat-content">

              <span>DATA COLUMNS</span>

              <strong>
                {totalColumns.toLocaleString()}
              </strong>

              <small>
                Available data fields
              </small>

            </div>

          </div>


          <div className="dataset-stat premium-stat">

            <div className="dataset-stat-icon orange">

              <BarChart3 size={20} />

            </div>


            <div className="dataset-stat-content">

              <span>LATEST DATASET</span>

              <strong className="dataset-latest-name">

                {latestDataset
                  ? String(
                      latestDataset.name || 'Dataset'
                    ).slice(0, 18)
                  : '—'}

              </strong>

              <small>

                {latestDataset
                  ? 'Recently added'
                  : 'No data uploaded'}

              </small>

            </div>

          </div>

        </section>


        {/* =================================================
            UPLOAD CARD
        ================================================= */}

        <section className="upload-card premium-upload-card">

          <div className="upload-card-heading">

            <div>

              <div className="upload-card-label">

                <Sparkles size={14} />

                AI DATA INGESTION

              </div>


              <h2>

                Add a new dataset

              </h2>


              <p>

                Import your business data and
                let InsightAI prepare it for analysis.

              </p>

            </div>


            <div className="upload-security-badge">

              <CheckCircle2 size={15} />

              Secure import

            </div>

          </div>


          <div
            className={`upload-zone premium-upload-zone ${
              dragging ? 'dragging' : ''
            } ${file ? 'has-file' : ''}`}

            onDragOver={(event) => {

              event.preventDefault();

              setDragging(true);

            }}

            onDragLeave={() =>
              setDragging(false)
            }

            onDrop={handleDrop}

          >

            {!file ? (

              <>

                <div className="upload-icon premium-upload-icon">

                  <Upload size={25} />

                </div>


                <h2>

                  Drop your data here

                </h2>


                <p>

                  Drag and drop your file,
                  or choose one from your computer.

                </p>


                <label className="browse-button premium-browse-button">

                  <Upload size={16} />

                  Browse files

                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls,.pdf"
                    hidden
                    onChange={(event) =>
                      selectFile(
                        event.target.files?.[0]
                      )
                    }
                  />

                </label>


                <div className="supported-files">

                  <span>CSV</span>

                  <span>XLSX</span>

                  <span>XLS</span>

                  <span>PDF</span>

                </div>

              </>

            ) : (

              <div className="selected-file premium-selected-file">

                <div className="selected-file-icon">

                  {getFileIcon(file.name)}

                </div>


                <div className="selected-file-info">

                  <strong>
                    {file.name}
                  </strong>


                  <span>

                    {getFileType(file.name)}

                    {' • '}

                    {formatSize(file.size)}

                  </span>

                </div>


                <div className="selected-file-ready">

                  <CheckCircle2 size={18} />

                  Ready

                </div>


                <button
                  type="button"
                  className="remove-file"
                  onClick={() =>
                    setFile(null)
                  }
                >

                  <X size={15} />

                  Remove

                </button>

              </div>

            )}

          </div>


          {file && (

            <div className="upload-action-row premium-upload-action">

              <div>

                <strong>
                  Ready to import
                </strong>

                <span>
                  InsightAI will process this file automatically.
                </span>

              </div>


              <button
                disabled={loading}
                onClick={upload}
                className="import-button premium-import-button"
              >

                {loading ? (

                  <>

                    <span className="upload-spinner"></span>

                    Processing...

                  </>

                ) : (

                  <>

                    <Sparkles size={16} />

                    Import & Analyze

                  </>

                )}

              </button>

            </div>

          )}

        </section>


        {/* =================================================
            DATASET LIST HEADER
        ================================================= */}

        <section className="datasets-list-card premium-datasets-card">

          <div className="datasets-list-header premium-list-header">

            <div>

              <div className="datasets-list-eyebrow">

                YOUR DATA LIBRARY

              </div>


              <h2>

                Your datasets

              </h2>


              <p>

                Manage the business data connected
                to your InsightAI workspace.

              </p>

            </div>


            <div className="dataset-library-tools">

              <div className="dataset-search">

                <Search size={16} />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search datasets..."
                />


                {search && (

                  <button
                    onClick={() =>
                      setSearch('')
                    }
                  >

                    <X size={14} />

                  </button>

                )}

              </div>


              <span className="dataset-count">

                {filteredDatasets.length}

                {' '}

                {filteredDatasets.length === 1
                  ? 'file'
                  : 'files'}

              </span>

            </div>

          </div>


          {/* =================================================
              LOADING
          ================================================= */}

          {loadingData ? (

            <div className="datasets-loading">

              <div className="dataset-loading-spinner"></div>

              <strong>
                Loading your datasets...
              </strong>

              <span>
                Preparing your data workspace.
              </span>

            </div>

          ) : filteredDatasets.length > 0 ? (

            <div className="dataset-list premium-dataset-list">

              {filteredDatasets.map((dataset) => {

                const fileName =
                  dataset.source_filename ||
                  dataset.name ||
                  'Dataset';


                const fileType =
                  getFileType(fileName);


                const isDeleting =
                  deletingId === dataset.id;


                return (

                  <div
                    className={`dataset-item premium-dataset-item ${
                      isDeleting
                        ? 'dataset-item-deleting'
                        : ''
                    }`}
                    key={dataset.id}
                  >

                    {/* FILE */}

                    <div className="dataset-file-icon premium-file-icon">

                      {getFileIcon(fileName)}

                    </div>


                    {/* MAIN INFO */}

                    <div className="dataset-main-info">

                      <div className="dataset-name-row">

                        <h3>

                          {dataset.name}

                        </h3>


                        <span className="dataset-ready">

                          <span></span>

                          AI Ready

                        </span>

                      </div>


                      <p>

                        {fileName}

                        <span className="dataset-file-type">

                          {fileType}

                        </span>

                      </p>

                    </div>


                    {/* ROWS */}

                    <div className="dataset-metric">

                      <span>
                        ROWS
                      </span>

                      <strong>

                        {Number(
                          dataset.row_count || 0
                        ).toLocaleString()}

                      </strong>

                    </div>


                    {/* COLUMNS */}

                    <div className="dataset-metric">

                      <span>
                        COLUMNS
                      </span>

                      <strong>

                        {Number(
                          dataset.column_count || 0
                        ).toLocaleString()}

                      </strong>

                    </div>


                    {/* DATE */}

                    <div className="dataset-date">

                      <span>
                        CREATED
                      </span>

                      <strong>

                        {dataset.created_at
                          ? new Date(
                              dataset.created_at
                            ).toLocaleDateString(
                              undefined,
                              {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              }
                            )
                          : '—'}

                      </strong>

                    </div>


                    {/* ACTIONS */}

                    <div className="dataset-actions premium-dataset-actions">

                      <Link
                        to="/chat"
                        title="Analyze with AI"
                        className="dataset-ai-action"
                      >

                        <MessageSquare size={16} />

                      </Link>


                      <button
                        title="Download CSV"
                        onClick={() =>
                          download(
                            dataset.id,
                            'csv'
                          )
                        }
                      >

                        <Download size={16} />

                      </button>


                      <button
                        title="Delete dataset"
                        className="delete-action"
                        disabled={isDeleting}
                        onClick={() =>
                          del(dataset.id)
                        }
                      >

                        {isDeleting ? (

                          <span className="mini-spinner"></span>

                        ) : (

                          <Trash2 size={16} />

                        )}

                      </button>

                    </div>

                  </div>

                );

              })}

            </div>

          ) : (

            <div className="datasets-empty premium-empty-state">

              <div className="empty-dataset-icon">

                {search ? (
                  <Search size={27} />
                ) : (
                  <Database size={27} />
                )}

              </div>


              <h3>

                {search
                  ? 'No matching datasets'
                  : 'No datasets yet'}

              </h3>


              <p>

                {search
                  ? `We couldn't find a dataset matching "${search}".`
                  : 'Upload your first business dataset above to start analyzing your data with AI.'}

              </p>


              {search ? (

                <button
                  className="empty-reset-button"
                  onClick={() =>
                    setSearch('')
                  }
                >

                  Clear search

                </button>

              ) : (

                <button
                  className="empty-upload-button"
                  onClick={() =>
                    document
                      .querySelector(
                        '.premium-upload-zone'
                      )
                      ?.scrollIntoView({
                        behavior: 'smooth'
                      })
                  }
                >

                  <Upload size={16} />

                  Upload your first dataset

                </button>

              )}

            </div>

          )}

        </section>


        {/* =================================================
            AI WORKFLOW
        ================================================= */}

        <section className="dataset-ai-workflow">

          <div className="dataset-ai-workflow-icon">

            <Sparkles size={21} />

          </div>


          <div className="dataset-ai-workflow-content">

            <span>
              INSIGHTAI WORKFLOW
            </span>

            <h2>
              From raw data to business decisions
            </h2>

            <p>

              Upload your data → InsightAI analyzes it →
              ask questions → discover trends and opportunities.

            </p>

          </div>


          <Link
            to="/chat"
            className="dataset-workflow-button"
          >

            <MessageSquare size={16} />

            Open AI Analyst

            <ArrowUpRight size={15} />

          </Link>

        </section>


        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="dashboard-footer datasets-footer">

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

            {ds.length > 0
              ? `${totalRows.toLocaleString()} records ready for analysis`
              : 'Ready for your first dataset'}

          </span>

        </footer>


      </div>

    </Layout>

  );

}