import { useState, useCallback } from 'react'

// ─── Constants ────────────────────────────────────────────────────────────────

const CFPB_BASE = 'https://www.consumerfinance.gov/data-research/consumer-complaints/search/api/v1/'
const PAGE_SIZE = 10

const CATEGORIES = [
  { label: 'All Categories',      value: '' },
  { label: 'Mortgage',            value: 'Mortgage' },
  { label: 'Debt Collection',     value: 'Debt collection' },
  { label: 'Credit Card / Prepaid Card', value: 'Credit card or prepaid card' },
  { label: 'Credit Reporting',    value: 'Credit reporting, credit repair services, or other personal consumer reports' },
  { label: 'Student Loan',        value: 'Student loan' },
  { label: 'Auto Loan / Lease',   value: 'Vehicle loan or lease' },
  { label: 'Checking / Savings',  value: 'Checking or savings account' },
  { label: 'Personal / Payday Loan', value: 'Payday loan, title loan, or personal loan' },
  { label: 'Money Transfer',      value: 'Money transfer, virtual currency, or money service' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

function ResponseBadge({ response }) {
  if (!response) return null
  const isResolved = response.toLowerCase().includes('closed')
  return (
    <span style={{
      padding: '2px 8px',
      borderRadius: '3px',
      fontSize: '11px',
      fontWeight: '600',
      letterSpacing: '0.04em',
      background: isResolved ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
      border: `1px solid ${isResolved ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
      color: isResolved ? '#4ade80' : '#f87171',
      whiteSpace: 'nowrap',
    }}>
      {response}
    </span>
  )
}

// ─── Complaint Card ───────────────────────────────────────────────────────────

function ComplaintCard({ hit, onClick }) {
  const s = hit._source
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? '#0f141a' : '#0d1117',
        border: `1px solid ${hovered ? '#374151' : '#1e2530'}`,
        borderRadius: '6px',
        padding: '20px',
        marginBottom: '10px',
        cursor: 'pointer',
        transition: 'border-color 0.15s, background 0.15s',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#f3f4f6', fontFamily: "'Playfair Display', serif" }}>
            {s.company || 'Unknown Company'}
          </div>
          <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '3px' }}>
            {s.issue || 'Issue not specified'}
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
          <ResponseBadge response={s.company_response} />
        </div>
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
        {s.product && (
          <span style={{ padding: '2px 8px', borderRadius: '3px', fontSize: '11px', fontWeight: '600', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', color: '#93c5fd' }}>
            {s.product}
          </span>
        )}
        {s.sub_product && (
          <span style={{ padding: '2px 8px', borderRadius: '3px', fontSize: '11px', fontWeight: '600', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', color: '#c4b5fd' }}>
            {s.sub_product}
          </span>
        )}
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>
          Date: <span style={{ color: '#d1d5db', fontWeight: '500' }}>{formatDate(s.date_received)}</span>
        </span>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>
          State: <span style={{ color: '#d1d5db', fontWeight: '500' }}>{s.state || '—'}</span>
        </span>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>
          ID: <span style={{ color: '#d1d5db', fontWeight: '500' }}>#{s.complaint_id}</span>
        </span>
        {s.consumer_disputed === 'Yes' && (
          <span style={{ fontSize: '12px', color: '#f87171' }}>⚠ Consumer Disputed</span>
        )}
      </div>
    </div>
  )
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function ComplaintModal({ hit, onClose }) {
  const s = hit._source

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0d1117',
          border: '1px solid #2d3748',
          borderRadius: '8px',
          padding: '32px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'none', border: '1px solid #2d3748', borderRadius: '4px',
            color: '#6b7280', cursor: 'pointer', padding: '4px 10px',
            fontSize: '16px', lineHeight: 1, transition: 'border-color 0.15s',
          }}
        >✕</button>

        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: '700', color: '#f3f4f6', marginBottom: '5px', paddingRight: '40px' }}>
          {s.company}
        </div>
        <div style={{ fontSize: '12px', color: '#4b5563', marginBottom: '20px' }}>
          Complaint ID #{s.complaint_id} · Received {formatDate(s.date_received)}
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
          {s.product && <span style={{ padding: '2px 8px', borderRadius: '3px', fontSize: '11px', fontWeight: '600', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', color: '#93c5fd' }}>{s.product}</span>}
          {s.sub_product && <span style={{ padding: '2px 8px', borderRadius: '3px', fontSize: '11px', fontWeight: '600', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', color: '#c4b5fd' }}>{s.sub_product}</span>}
          <ResponseBadge response={s.company_response} />
        </div>

        <div style={{ height: '1px', background: '#1e2530', margin: '20px 0' }} />

        {/* Field grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Field label="Issue" value={s.issue} />
          <Field label="Sub-Issue" value={s.sub_issue} />
          <Field label="State" value={s.state} />
          <Field label="ZIP Code" value={s.zip_code} />
          <Field label="Submitted Via" value={s.submitted_via} />
          <Field label="Consumer Disputed" value={s.consumer_disputed} />
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Company Response" value={s.company_response} />
          </div>
        </div>

        {/* Narrative */}
        {s.complaint_what_happened && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '10px', color: '#4b5563', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
              Consumer Narrative
            </div>
            <div style={{
              fontSize: '13px', color: '#9ca3af', lineHeight: 1.7,
              background: '#080c10', border: '1px solid #1e2530',
              borderRadius: '4px', padding: '16px',
            }}>
              {s.complaint_what_happened}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: '10px', color: '#4b5563', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ fontSize: '14px', color: '#d1d5db', fontWeight: '500' }}>
        {value || '—'}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ComplaintLookup() {
  const [query, setQuery]             = useState('')
  const [product, setProduct]         = useState('')
  const [dateFrom, setDateFrom]       = useState('')
  const [dateTo, setDateTo]           = useState('')
  const [results, setResults]         = useState([])
  const [total, setTotal]             = useState(0)
  const [page, setPage]               = useState(0)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [selected, setSelected]       = useState(null)

  const fetchComplaints = useCallback(async (pageNum = 0) => {
    if (!query.trim() && !product) return

    setLoading(true)
    setError('')

    const params = new URLSearchParams({
      size: PAGE_SIZE,
      frm:  pageNum * PAGE_SIZE,
      sort: 'created_date_desc',
    })
    if (query.trim()) params.append('search_term', query.trim())
    if (product)      params.append('product', product)
    if (dateFrom)     params.append('date_received_min', dateFrom)
    if (dateTo)       params.append('date_received_max', dateTo)

    try {
      const res  = await fetch(`${CFPB_BASE}?${params}`)
      if (!res.ok) throw new Error('Bad response')
      const data = await res.json()

      setResults(data.hits?.hits || [])
      setTotal(
        typeof data.hits?.total === 'object'
          ? data.hits.total.value
          : (data.hits?.total || 0)
      )
      setPage(pageNum)
      setHasSearched(true)
    } catch {
      setError('Unable to reach the CFPB database. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }, [query, product, dateFrom, dateTo])

  const handleSearch = () => fetchComplaints(0)
  const handleKey    = e => e.key === 'Enter' && handleSearch()

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const startPage  = Math.max(0, Math.min(page - 2, totalPages - 5))

  return (
    <div style={{ minHeight: '100vh', background: '#080c10' }}>

      {/* ── Header ── */}
      <header style={{
        background: 'linear-gradient(180deg, #0d1117 0%, #080c10 100%)',
        borderBottom: '1px solid #1e2530',
        padding: '36px 24px 32px',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(239,68,68,0.12)',
          border: '1px solid rgba(239,68,68,0.3)',
          color: '#f87171',
          fontSize: '10px', fontWeight: '700',
          letterSpacing: '0.12em',
          padding: '4px 12px',
          borderRadius: '2px',
          marginBottom: '14px',
          textTransform: 'uppercase',
        }}>
          Consumer Protection Database
        </div>
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 'clamp(32px, 5vw, 52px)',
          fontWeight: '700',
          color: '#f3f4f6',
          margin: '0 0 10px',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
        }}>
          Complaint<span style={{ color: '#ef4444' }}>Lookup</span>
        </h1>
        <p style={{ fontSize: '15px', color: '#6b7280' }}>
          Search 4M+ consumer complaints filed with the CFPB
        </p>
      </header>

      {/* ── Search ── */}
      <div style={{ maxWidth: '800px', margin: '32px auto', padding: '0 20px' }}>
        {/* Main search row */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search by company name (e.g. Wells Fargo, Experian…)"
            style={{
              flex: 1,
              background: '#0d1117',
              border: '1px solid #2d3748',
              borderRadius: '6px',
              padding: '13px 16px',
              color: '#e5e7eb',
              fontSize: '15px',
              transition: 'border-color 0.2s',
            }}
          />
          <button
            onClick={handleSearch}
            disabled={loading || (!query.trim() && !product)}
            style={{
              background: loading ? '#6b7280' : '#ef4444',
              border: 'none',
              borderRadius: '6px',
              padding: '13px 26px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>

        {/* Filters row */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={product}
            onChange={e => setProduct(e.target.value)}
            style={{
              flex: 1, minWidth: '185px',
              background: '#0d1117', border: '1px solid #2d3748',
              borderRadius: '6px', padding: '10px 12px',
              color: '#9ca3af', fontSize: '13px', cursor: 'pointer',
            }}
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <input
            type="date" value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            title="From date"
            style={{
              flex: 1, minWidth: '145px',
              background: '#0d1117', border: '1px solid #2d3748',
              borderRadius: '6px', padding: '10px 12px',
              color: '#9ca3af', fontSize: '13px', colorScheme: 'dark',
            }}
          />
          <input
            type="date" value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            title="To date"
            style={{
              flex: 1, minWidth: '145px',
              background: '#0d1117', border: '1px solid #2d3748',
              borderRadius: '6px', padding: '10px 12px',
              color: '#9ca3af', fontSize: '13px', colorScheme: 'dark',
            }}
          />
        </div>
      </div>

      {/* ── Results ── */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px 80px' }}>

        {/* Error */}
        {error && (
          <div style={{
            padding: '14px 18px',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '6px', color: '#f87171', fontSize: '14px', marginBottom: '18px',
          }}>
            {error}
          </div>
        )}

        {/* Stats bar */}
        {hasSearched && !loading && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '18px', padding: '14px 18px',
            background: '#0d1117', border: '1px solid #1e2530', borderRadius: '6px',
          }}>
            <div>
              <span style={{ fontSize: '22px', fontWeight: '700', fontFamily: "'Playfair Display', serif", color: '#f3f4f6' }}>
                {total.toLocaleString()}
              </span>
              <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '8px' }}>complaints found</span>
            </div>
            <span style={{ fontSize: '13px', color: '#6b7280' }}>
              Page {page + 1} of {Math.max(1, totalPages).toLocaleString()}
            </span>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '64px 24px', color: '#4b5563' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚖️</div>
            <div style={{ fontSize: '18px', color: '#6b7280', fontFamily: "'Playfair Display', serif" }}>
              Searching complaints database…
            </div>
          </div>
        )}

        {/* Empty state — no results */}
        {!loading && hasSearched && results.length === 0 && !error && (
          <div style={{ textAlign: 'center', padding: '64px 24px', color: '#4b5563' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔍</div>
            <div style={{ fontSize: '18px', color: '#6b7280', fontFamily: "'Playfair Display', serif", marginBottom: '8px' }}>
              No complaints found
            </div>
            <div style={{ fontSize: '14px' }}>Try a different company name or adjust your filters</div>
          </div>
        )}

        {/* Empty state — not yet searched */}
        {!loading && !hasSearched && (
          <div style={{ textAlign: 'center', padding: '64px 24px', color: '#4b5563' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>📋</div>
            <div style={{ fontSize: '18px', color: '#6b7280', fontFamily: "'Playfair Display', serif", marginBottom: '8px' }}>
              Search the CFPB Complaints Database
            </div>
            <div style={{ fontSize: '14px' }}>Enter a company name above to see consumer complaints</div>
          </div>
        )}

        {/* Results */}
        {!loading && results.map((hit, i) => (
          <ComplaintCard
            key={hit._source.complaint_id || i}
            hit={hit}
            onClick={() => setSelected(hit)}
          />
        ))}

        {/* Pagination */}
        {hasSearched && !loading && totalPages > 1 && (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '28px', flexWrap: 'wrap' }}>
            <button
              onClick={() => fetchComplaints(page - 1)}
              disabled={page === 0}
              style={{
                padding: '8px 16px', background: '#0d1117',
                border: '1px solid #2d3748', borderRadius: '5px',
                color: page === 0 ? '#4b5563' : '#d1d5db',
                fontSize: '13px', cursor: page === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              ← Prev
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = startPage + i
              return (
                <button
                  key={p}
                  onClick={() => fetchComplaints(p)}
                  style={{
                    padding: '8px 16px',
                    background: p === page ? '#ef4444' : '#0d1117',
                    border: `1px solid ${p === page ? '#ef4444' : '#2d3748'}`,
                    borderRadius: '5px',
                    color: p === page ? '#fff' : '#d1d5db',
                    fontSize: '13px', cursor: 'pointer',
                  }}
                >
                  {p + 1}
                </button>
              )
            })}

            <button
              onClick={() => fetchComplaints(page + 1)}
              disabled={page >= totalPages - 1}
              style={{
                padding: '8px 16px', background: '#0d1117',
                border: '1px solid #2d3748', borderRadius: '5px',
                color: page >= totalPages - 1 ? '#4b5563' : '#d1d5db',
                fontSize: '13px', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid #1e2530',
        padding: '24px',
        textAlign: 'center',
        fontSize: '12px',
        color: '#374151',
      }}>
        Data sourced from the{' '}
        <a
          href="https://www.consumerfinance.gov/data-research/consumer-complaints/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#4b5563', textDecoration: 'underline' }}
        >
          Consumer Financial Protection Bureau (CFPB)
        </a>
        {' '}public database · complaintlookup.com
      </footer>

      {/* ── Modal ── */}
      {selected && (
        <ComplaintModal
          hit={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
