"use client";

// =============================================================================
// AdminRegistrationsList — Admin list view for registrations.
// Filterable by form_type and status, searchable within jsonb data,
// with detail view, status management, and export buttons.
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '@/components/admin/AdminAuthProvider';
import { escapeHtml } from '@/lib/registrations/validation';
import type {
  Registration,
  FormSchema,
  RegistrationStatus,
  REGISTRATION_STATUSES,
} from '@/lib/registrations/types';

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  pending: { bg: 'rgba(251,191,36,0.1)', text: '#fbbf24', border: 'rgba(251,191,36,0.3)' },
  reviewed: { bg: 'rgba(96,165,250,0.1)', text: '#60a5fa', border: 'rgba(96,165,250,0.3)' },
  accepted: { bg: 'rgba(0,230,118,0.1)', text: '#00e676', border: 'rgba(0,230,118,0.3)' },
  rejected: { bg: 'rgba(239,68,68,0.1)', text: '#ef4444', border: 'rgba(239,68,68,0.3)' },
};

interface PaginatedResponse {
  registrations: Registration[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export default function AdminRegistrationsList() {
  const { accessToken } = useAdminAuth();

  // Filters
  const [formTypeFilter, setFormTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Data
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [schemas, setSchemas] = useState<FormSchema[]>([]);
  const [schemaMap, setSchemaMap] = useState<Map<string, FormSchema>>(new Map());
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Detail
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Tab view: list vs schema manager
  const [activeView, setActiveView] = useState<'list' | 'schemas'>('list');

  // Fetch schemas on mount
  useEffect(() => {
    async function fetchSchemas() {
      try {
        const res = await fetch('/api/form-schemas');
        if (res.ok) {
          const data = await res.json();
          setSchemas(data.schemas || []);
          const map = new Map<string, FormSchema>();
          for (const s of data.schemas || []) {
            map.set(s.form_type, s);
          }
          setSchemaMap(map);
        }
      } catch (err) {
        console.error('Failed to fetch schemas:', err);
      }
    }
    fetchSchemas();
  }, []);

  // Fetch registrations
  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (formTypeFilter) params.set('form_type', formTypeFilter);
      if (statusFilter) params.set('status', statusFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      params.set('page', String(page));
      params.set('sort_order', sortOrder);

      const res = await fetch(`/api/registrations?${params.toString()}`);
      if (res.ok) {
        const data: PaginatedResponse = await res.json();
        setRegistrations(data.registrations);
        setTotalPages(data.total_pages);
        setTotal(data.total);
      }
    } catch (err) {
      console.error('Failed to fetch registrations:', err);
    } finally {
      setLoading(false);
    }
  }, [formTypeFilter, statusFilter, searchQuery, page, sortOrder]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  // Update status
  const handleStatusChange = async (regId: string, newStatus: RegistrationStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch('/api/registrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: regId, status: newStatus }),
      });

      if (res.ok) {
        // Refresh data
        await fetchRegistrations();
        if (selectedReg?.id === regId) {
          setSelectedReg((prev) => prev ? { ...prev, status: newStatus } : null);
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Export
  const handleExport = async (format: 'csv' | 'document') => {
    const params = new URLSearchParams();
    if (formTypeFilter) params.set('form_type', formTypeFilter);
    if (statusFilter) params.set('status', statusFilter);
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    params.set('format', format);

    try {
      const res = await fetch(`/api/registrations/export?${params.toString()}`);
      if (!res.ok) return;

      const blob = await res.blob();
      const ext = format === 'csv' ? 'csv' : 'md';
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `registrations_export.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  /**
   * Safely render a data value — defense in depth against stored XSS.
   */
  const safeRender = (val: unknown): string => {
    if (val == null) return 'N/A';
    return escapeHtml(String(val));
  };

  /**
   * Get a preview of key fields for the table row.
   */
  const getPreviewFields = (reg: Registration): { label: string; value: string }[] => {
    const schema = schemaMap.get(reg.form_type);
    if (!schema) return [];

    // Show first 2-3 fields as a preview
    return schema.fields.slice(0, 3).map((f) => ({
      label: f.label,
      value: safeRender(reg.data[f.key]),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveView('list')}
          className={`px-4 py-2 rounded-lg text-sm font-mono transition-all ${
            activeView === 'list'
              ? 'bg-[#00e676]/10 text-[#00e676] border border-[#00e676]/20'
              : 'text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          Submissions
        </button>
        <button
          onClick={() => setActiveView('schemas')}
          className={`px-4 py-2 rounded-lg text-sm font-mono transition-all ${
            activeView === 'schemas'
              ? 'bg-[#00e676]/10 text-[#00e676] border border-[#00e676]/20'
              : 'text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          Form Schemas
        </button>
      </div>

      {activeView === 'schemas' ? (
        <AdminFormSchemaManagerInline
          schemas={schemas}
          onSchemasChange={async () => {
            // Refresh schemas
            const res = await fetch('/api/form-schemas');
            if (res.ok) {
              const data = await res.json();
              setSchemas(data.schemas || []);
              const map = new Map<string, FormSchema>();
              for (const s of data.schemas || []) {
                map.set(s.form_type, s);
              }
              setSchemaMap(map);
            }
          }}
        />
      ) : (
        <>
          {/* Filters row */}
          <div className="flex flex-wrap gap-3">
            <select
              value={formTypeFilter}
              onChange={(e) => { setFormTypeFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-lg text-sm font-mono bg-gray-900 border border-gray-700 text-gray-200 focus:outline-none focus:border-[#00e676]/30"
            >
              <option value="">All Forms</option>
              {schemas.map((s) => (
                <option key={s.form_type} value={s.form_type}>
                  {s.title}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-lg text-sm font-mono bg-gray-900 border border-gray-700 text-gray-200 focus:outline-none focus:border-[#00e676]/30"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>

            <input
              type="text"
              placeholder="Search submissions..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="flex-1 min-w-[200px] px-3 py-2 rounded-lg text-sm font-mono bg-gray-900 border border-gray-700 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#00e676]/30"
            />

            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="px-3 py-2 rounded-lg text-sm font-mono bg-gray-900 border border-gray-700 text-gray-400 hover:text-white transition-colors"
              title={`Sort by date: ${sortOrder === 'desc' ? 'newest first' : 'oldest first'}`}
            >
              {sortOrder === 'desc' ? '↓ Newest' : '↑ Oldest'}
            </button>

            {/* Export buttons */}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => handleExport('csv')}
                className="px-3 py-2 rounded-lg text-sm font-mono bg-gray-900 border border-gray-700 text-gray-400 hover:text-[#00e676] hover:border-[#00e676]/30 transition-colors"
              >
                Export CSV
              </button>
              <button
                onClick={() => handleExport('document')}
                className="px-3 py-2 rounded-lg text-sm font-mono bg-gray-900 border border-gray-700 text-gray-400 hover:text-[#00e676] hover:border-[#00e676]/30 transition-colors"
              >
                Export Doc
              </button>
            </div>
          </div>

          {/* Results summary */}
          <p className="text-xs text-gray-500 font-mono">
            {total} submission{total !== 1 ? 's' : ''} found
          </p>

          {/* Table */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-900 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 font-mono text-sm">No submissions found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {registrations.map((reg) => {
                const previews = getPreviewFields(reg);
                const statusColor = STATUS_COLORS[reg.status] || STATUS_COLORS.pending;

                return (
                  <div
                    key={reg.id}
                    onClick={() => setSelectedReg(reg)}
                    className="p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.005]"
                    style={{
                      background: 'rgba(10,10,10,0.8)',
                      border: selectedReg?.id === reg.id
                        ? '1px solid rgba(0,230,118,0.3)'
                        : '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-xs font-mono text-gray-500">
                            {reg.id.slice(0, 8)}…
                          </span>
                          <span className="text-xs font-mono text-gray-600">
                            {schemaMap.get(reg.form_type)?.title || reg.form_type}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          {previews.map((p) => (
                            <span key={p.label} className="text-gray-300 truncate">
                              <span className="text-gray-600 text-xs">{p.label}: </span>
                              {p.value}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-mono font-medium"
                          style={{
                            background: statusColor.bg,
                            color: statusColor.text,
                            border: `1px solid ${statusColor.border}`,
                          }}
                        >
                          {reg.status}
                        </span>
                        <span className="text-xs text-gray-600 font-mono whitespace-nowrap">
                          {new Date(reg.created_at).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-sm font-mono bg-gray-900 border border-gray-700 text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>
              <span className="text-xs font-mono text-gray-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg text-sm font-mono bg-gray-900 border border-gray-700 text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          )}

          {/* Detail panel */}
          {selectedReg && (
            <DetailPanel
              reg={selectedReg}
              schema={schemaMap.get(selectedReg.form_type)}
              onClose={() => setSelectedReg(null)}
              onStatusChange={handleStatusChange}
              updatingStatus={updatingStatus}
              safeRender={safeRender}
            />
          )}
        </>
      )}
    </div>
  );
}

// =============================================================================
// Detail Panel
// =============================================================================

function DetailPanel({
  reg,
  schema,
  onClose,
  onStatusChange,
  updatingStatus,
  safeRender,
}: {
  reg: Registration;
  schema: FormSchema | undefined;
  onClose: () => void;
  onStatusChange: (id: string, status: RegistrationStatus) => void;
  updatingStatus: boolean;
  safeRender: (val: unknown) => string;
}) {
  const statusColor = STATUS_COLORS[reg.status] || STATUS_COLORS.pending;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl p-6 relative"
        style={{
          background: 'rgba(8,8,8,0.98)',
          border: '1px solid rgba(0,230,118,0.15)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(0,230,118,0.4), transparent)',
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white font-mono">
              Submission Details
            </h3>
            <p className="text-xs text-gray-500 font-mono mt-1">
              ID: {reg.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gray-900/50 border border-gray-800">
            <p className="text-xs text-gray-500 font-mono mb-1">Form Type</p>
            <p className="text-sm text-gray-200 font-mono">
              {schema?.title || reg.form_type}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-gray-900/50 border border-gray-800">
            <p className="text-xs text-gray-500 font-mono mb-1">Submitted</p>
            <p className="text-sm text-gray-200 font-mono">
              {new Date(reg.created_at).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Status with change control */}
        <div className="mb-6 p-3 rounded-xl bg-gray-900/50 border border-gray-800">
          <p className="text-xs text-gray-500 font-mono mb-2">Status</p>
          <div className="flex items-center gap-3">
            <span
              className="px-3 py-1 rounded-full text-xs font-mono font-medium"
              style={{
                background: statusColor.bg,
                color: statusColor.text,
                border: `1px solid ${statusColor.border}`,
              }}
            >
              {reg.status}
            </span>
            <span className="text-gray-600 text-xs">→</span>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  onStatusChange(reg.id, e.target.value as RegistrationStatus);
                }
              }}
              disabled={updatingStatus}
              className="px-3 py-1.5 rounded-lg text-xs font-mono bg-gray-900 border border-gray-700 text-gray-300 focus:outline-none focus:border-[#00e676]/30 disabled:opacity-50"
            >
              <option value="">Change to...</option>
              {(['pending', 'reviewed', 'accepted', 'rejected'] as const)
                .filter((s) => s !== reg.status)
                .map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
            </select>
          </div>
        </div>

        {/* Data fields */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-400 font-mono uppercase tracking-widest">
            Form Data
          </h4>
          {schema ? (
            schema.fields.map((fieldDef) => {
              const val = reg.data[fieldDef.key];
              return (
                <div key={fieldDef.key} className="p-3 rounded-xl bg-gray-900/50 border border-gray-800">
                  <p className="text-xs text-gray-500 font-mono mb-1">{fieldDef.label}</p>
                  <p
                    className="text-sm text-gray-200 font-body whitespace-pre-wrap break-words"
                    dangerouslySetInnerHTML={{ __html: safeRender(val) }}
                  />
                </div>
              );
            })
          ) : (
            // Fallback for schemas that no longer exist — show raw keys
            Object.entries(reg.data).map(([key, val]) => (
              <div key={key} className="p-3 rounded-xl bg-gray-900/50 border border-gray-800">
                <p className="text-xs text-gray-500 font-mono mb-1">{key}</p>
                <p
                  className="text-sm text-gray-200 font-body whitespace-pre-wrap break-words"
                  dangerouslySetInnerHTML={{ __html: safeRender(val) }}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Inline Form Schema Manager (embedded in registrations tab)
// =============================================================================

function AdminFormSchemaManagerInline({
  schemas,
  onSchemasChange,
}: {
  schemas: FormSchema[];
  onSchemasChange: () => Promise<void>;
}) {
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const toggleActive = async (schema: FormSchema) => {
    try {
      await fetch('/api/form-schemas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: schema.id, is_active: !schema.is_active }),
      });
      await onSchemasChange();
    } catch (err) {
      console.error('Failed to toggle schema:', err);
    }
  };

  const copyFormUrl = (formType: string) => {
    const url = `${window.location.origin}/register/${formType}`;
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-mono text-gray-400">Form Schemas</h3>
        <button
          onClick={() => setCreating(true)}
          className="px-4 py-2 rounded-lg text-sm font-mono bg-[#00e676]/10 text-[#00e676] border border-[#00e676]/20 hover:bg-[#00e676]/15 transition-colors"
        >
          + New Form
        </button>
      </div>

      {creating && (
        <SchemaEditor
          onSave={async () => {
            setCreating(false);
            await onSchemasChange();
          }}
          onCancel={() => setCreating(false)}
        />
      )}

      {schemas.map((schema) => (
        <div key={schema.id}>
          {editingId === schema.id ? (
            <SchemaEditor
              existing={schema}
              onSave={async () => {
                setEditingId(null);
                await onSchemasChange();
              }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div
              className="p-4 rounded-xl border transition-all"
              style={{
                background: 'rgba(10,10,10,0.8)',
                borderColor: schema.is_active
                  ? 'rgba(0,230,118,0.1)'
                  : 'rgba(255,255,255,0.05)',
                opacity: schema.is_active ? 1 : 0.6,
              }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-white font-mono">{schema.title}</h4>
                    {!schema.is_active && (
                      <span className="px-2 py-0.5 rounded text-xs font-mono bg-gray-800 text-gray-500">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 font-mono">
                    {schema.form_type} · {schema.fields.length} field{schema.fields.length !== 1 ? 's' : ''}
                    {schema.identity_field && ` · dedup: ${schema.identity_field}`}
                    {` · rate: ${schema.max_submissions_per_hour}/hr`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyFormUrl(schema.form_type)}
                    className="px-2 py-1 rounded text-xs font-mono text-gray-500 hover:text-[#00e676] transition-colors"
                    title="Copy form URL"
                  >
                    🔗 Copy URL
                  </button>
                  <button
                    onClick={() => setEditingId(schema.id)}
                    className="px-2 py-1 rounded text-xs font-mono text-gray-500 hover:text-white transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleActive(schema)}
                    className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                      schema.is_active
                        ? 'text-yellow-500 hover:text-yellow-400'
                        : 'text-green-500 hover:text-green-400'
                    }`}
                  >
                    {schema.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {schemas.length === 0 && !creating && (
        <div className="text-center py-12">
          <p className="text-gray-500 font-mono text-sm">No form schemas yet. Create one to get started.</p>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Schema Editor (create/edit form schema)
// =============================================================================

interface FieldEditorState {
  key: string;
  label: string;
  type: string;
  required: boolean;
  min_length: string;
  max_length: string;
  options: string;
  validation_regex: string;
  placeholder: string;
}

function emptyField(): FieldEditorState {
  return {
    key: '',
    label: '',
    type: 'text',
    required: false,
    min_length: '',
    max_length: '',
    options: '',
    validation_regex: '',
    placeholder: '',
  };
}

function SchemaEditor({
  existing,
  onSave,
  onCancel,
}: {
  existing?: FormSchema;
  onSave: () => Promise<void>;
  onCancel: () => void;
}) {
  const [formType, setFormType] = useState(existing?.form_type || '');
  const [title, setTitle] = useState(existing?.title || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [allowDuplicates, setAllowDuplicates] = useState(existing?.allow_duplicates || false);
  const [identityField, setIdentityField] = useState(existing?.identity_field || '');
  const [maxPerHour, setMaxPerHour] = useState(String(existing?.max_submissions_per_hour || 3));
  const [fields, setFields] = useState<FieldEditorState[]>(
    existing?.fields.map((f) => ({
      key: f.key,
      label: f.label,
      type: f.type,
      required: f.required,
      min_length: f.min_length != null ? String(f.min_length) : '',
      max_length: f.max_length != null ? String(f.max_length) : '',
      options: f.options?.join(', ') || '',
      validation_regex: f.validation_regex || '',
      placeholder: f.placeholder || '',
    })) || [emptyField()]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addField = () => setFields([...fields, emptyField()]);
  const removeField = (index: number) => setFields(fields.filter((_, i) => i !== index));
  const updateField = (index: number, updates: Partial<FieldEditorState>) => {
    setFields(fields.map((f, i) => (i === index ? { ...f, ...updates } : f)));
  };
  const moveField = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= fields.length) return;
    const newFields = [...fields];
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    setFields(newFields);
  };

  const handleSave = async () => {
    setError(null);
    setSaving(true);

    // Build fields array
    const builtFields = fields.map((f) => ({
      key: f.key.trim(),
      label: f.label.trim(),
      type: f.type,
      required: f.required,
      min_length: f.min_length ? parseInt(f.min_length, 10) : null,
      max_length: f.max_length ? parseInt(f.max_length, 10) : null,
      options: ['select', 'radio'].includes(f.type) && f.options
        ? f.options.split(',').map((o) => o.trim()).filter(Boolean)
        : null,
      validation_regex: f.validation_regex.trim() || null,
      placeholder: f.placeholder.trim() || null,
    }));

    // Basic client-side validation
    if (!title.trim()) { setError('Title is required'); setSaving(false); return; }
    if (!existing && !formType.trim()) { setError('Form type is required'); setSaving(false); return; }
    if (builtFields.length === 0) { setError('At least one field is required'); setSaving(false); return; }
    for (const f of builtFields) {
      if (!f.key || !f.label) {
        setError('All fields must have a key and label');
        setSaving(false);
        return;
      }
    }

    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim() || null,
        fields: builtFields,
        allow_duplicates: allowDuplicates,
        identity_field: identityField.trim() || null,
        max_submissions_per_hour: parseInt(maxPerHour, 10) || 3,
      };

      if (existing) {
        body.id = existing.id;
        const res = await fetch('/api/form-schemas', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || 'Failed to update'); setSaving(false); return; }
      } else {
        body.form_type = formType.trim();
        const res = await fetch('/api/form-schemas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || 'Failed to create'); setSaving(false); return; }
      }

      await onSave();
    } catch {
      setError('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const fieldTypes = ['text', 'email', 'tel', 'url', 'textarea', 'select', 'radio', 'checkbox'];

  return (
    <div
      className="p-6 rounded-xl border space-y-4"
      style={{
        background: 'rgba(10,10,10,0.95)',
        borderColor: 'rgba(0,230,118,0.15)',
      }}
    >
      <h4 className="text-sm font-bold text-white font-mono">
        {existing ? 'Edit Form Schema' : 'New Form Schema'}
      </h4>

      {/* Basic info */}
      <div className="grid grid-cols-2 gap-3">
        {!existing && (
          <div>
            <label className="block text-xs text-gray-500 font-mono mb-1">Form Type (snake_case)</label>
            <input
              value={formType}
              onChange={(e) => setFormType(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="media_team_application"
              className="w-full px-3 py-2 rounded-lg text-sm font-mono bg-gray-900 border border-gray-700 text-gray-200 focus:outline-none focus:border-[#00e676]/30"
            />
          </div>
        )}
        <div className={existing ? 'col-span-2' : ''}>
          <label className="block text-xs text-gray-500 font-mono mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Media Team Application"
            className="w-full px-3 py-2 rounded-lg text-sm font-mono bg-gray-900 border border-gray-700 text-gray-200 focus:outline-none focus:border-[#00e676]/30"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 font-mono mb-1">Description (optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 rounded-lg text-sm font-mono bg-gray-900 border border-gray-700 text-gray-200 resize-none focus:outline-none focus:border-[#00e676]/30"
        />
      </div>

      {/* Settings row */}
      <div className="flex flex-wrap gap-4 items-center">
        <label className="flex items-center gap-2 text-xs text-gray-400 font-mono">
          <input
            type="checkbox"
            checked={allowDuplicates}
            onChange={(e) => setAllowDuplicates(e.target.checked)}
            className="rounded border-gray-600 bg-transparent text-[#00e676]"
          />
          Allow Duplicates
        </label>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 font-mono">Identity Field:</label>
          <select
            value={identityField}
            onChange={(e) => setIdentityField(e.target.value)}
            className="px-2 py-1 rounded text-xs font-mono bg-gray-900 border border-gray-700 text-gray-300"
          >
            <option value="">None</option>
            {fields.filter((f) => f.key.trim()).map((f) => (
              <option key={f.key} value={f.key}>{f.label || f.key}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 font-mono">Rate Limit/hr:</label>
          <input
            type="number"
            value={maxPerHour}
            onChange={(e) => setMaxPerHour(e.target.value)}
            min="1"
            max="100"
            className="w-16 px-2 py-1 rounded text-xs font-mono bg-gray-900 border border-gray-700 text-gray-300"
          />
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="text-xs text-gray-400 font-mono uppercase tracking-widest">Fields</h5>
          <button
            onClick={addField}
            className="text-xs font-mono text-[#00e676] hover:text-[#00e676]/80 transition-colors"
          >
            + Add Field
          </button>
        </div>

        {fields.map((field, index) => (
          <div key={index} className="p-3 rounded-lg bg-gray-900/50 border border-gray-800 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 font-mono w-6">{index + 1}.</span>
              <input
                value={field.key}
                onChange={(e) => updateField(index, { key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                placeholder="field_key"
                className="flex-1 px-2 py-1 rounded text-xs font-mono bg-gray-900 border border-gray-700 text-gray-300"
              />
              <input
                value={field.label}
                onChange={(e) => updateField(index, { label: e.target.value })}
                placeholder="Field Label"
                className="flex-1 px-2 py-1 rounded text-xs font-mono bg-gray-900 border border-gray-700 text-gray-300"
              />
              <select
                value={field.type}
                onChange={(e) => updateField(index, { type: e.target.value })}
                className="px-2 py-1 rounded text-xs font-mono bg-gray-900 border border-gray-700 text-gray-300"
              >
                {fieldTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <label className="flex items-center gap-1 text-xs text-gray-500">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => updateField(index, { required: e.target.checked })}
                  className="rounded border-gray-600 bg-transparent text-[#00e676]"
                />
                Req
              </label>
              <div className="flex gap-1">
                <button onClick={() => moveField(index, -1)} disabled={index === 0} className="text-gray-600 hover:text-gray-300 disabled:opacity-30 text-xs">↑</button>
                <button onClick={() => moveField(index, 1)} disabled={index === fields.length - 1} className="text-gray-600 hover:text-gray-300 disabled:opacity-30 text-xs">↓</button>
              </div>
              <button onClick={() => removeField(index)} className="text-red-500/60 hover:text-red-400 text-xs">✕</button>
            </div>

            {/* Extended options row */}
            <div className="flex gap-2 pl-8 flex-wrap">
              <input
                value={field.placeholder}
                onChange={(e) => updateField(index, { placeholder: e.target.value })}
                placeholder="Placeholder text"
                className="flex-1 min-w-[120px] px-2 py-1 rounded text-xs font-mono bg-gray-900 border border-gray-800 text-gray-400"
              />
              <input
                value={field.min_length}
                onChange={(e) => updateField(index, { min_length: e.target.value })}
                placeholder="Min len"
                type="number"
                className="w-20 px-2 py-1 rounded text-xs font-mono bg-gray-900 border border-gray-800 text-gray-400"
              />
              <input
                value={field.max_length}
                onChange={(e) => updateField(index, { max_length: e.target.value })}
                placeholder="Max len"
                type="number"
                className="w-20 px-2 py-1 rounded text-xs font-mono bg-gray-900 border border-gray-800 text-gray-400"
              />
              {['select', 'radio'].includes(field.type) && (
                <input
                  value={field.options}
                  onChange={(e) => updateField(index, { options: e.target.value })}
                  placeholder="Option A, Option B, Option C"
                  className="flex-1 min-w-[150px] px-2 py-1 rounded text-xs font-mono bg-gray-900 border border-gray-800 text-gray-400"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 font-mono">{error}</p>
      )}

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-sm font-mono text-gray-400 border border-gray-700 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-lg text-sm font-mono bg-[#00e676]/10 text-[#00e676] border border-[#00e676]/20 hover:bg-[#00e676]/15 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : existing ? 'Update' : 'Create'}
        </button>
      </div>
    </div>
  );
}
