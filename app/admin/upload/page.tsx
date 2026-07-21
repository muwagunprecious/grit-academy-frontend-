'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Upload,
  FileText,
  AlertCircle,
  Loader2,
  X,
  BookOpen,
  Brain,
  FileUp,
  Sparkles,
  Trash2,
  ChevronDown,
  ChevronUp,
  Zap,
  Plus,
  Check,
  CheckCircle2,
  Layers,
  Lightbulb,
} from 'lucide-react';
import api from '../../../lib/api';

interface Subject {
  id: string;
  name: string;
  _count?: {
    questions: number;
    pdfs: number;
  };
}

type UploadedPdf = {
  id: string;
  fileName: string;
  fileSize: number;
  status: 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'FAILED' | 'uploading' | 'generating' | 'done' | 'error';
  error?: string;
  warning?: string;
  questionsCount?: number;
};

type QuestionOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

type GeneratedQuestion = {
  id: string;
  text: string;
  type: string;
  options: QuestionOption[];
  explanation?: string;
  topic?: string;
  difficulty?: string;
};

const SUBJECT_EMOJIS: Record<string, string> = {
  Mathematics: '📐',
  Physics: '⚡',
  Chemistry: '🧪',
  Biology: '🧬',
  English: '📖',
  Economics: '📊',
  Government: '🏛️',
  Literature: '📚',
  Commerce: '💼',
  CRS: '✝️',
  Accounting: '📈',
  History: '📜',
  Geography: '🌍',
  Agricultural: '🌾',
};

function formatFileSize(bytes: number): string {
  if (!bytes) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function PDFUploadStudioPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  // Modal State
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [addingSubject, setAddingSubject] = useState(false);
  const [subjectError, setSubjectError] = useState('');

  // PDF & Questions State
  const [pdfs, setPdfs] = useState<UploadedPdf[]>([]);
  const [loadingPdfs, setLoadingPdfs] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [generatingFromPdf, setGeneratingFromPdf] = useState<string | null>(null);

  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [dragging, setDragging] = useState(false);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const fetchSubjects = async () => {
    setLoadingSubjects(true);
    try {
      const res = await api.get('/subjects');
      const fetchedSubjects: Subject[] = res.data.data.subjects || [];
      setSubjects(fetchedSubjects);
      if (fetchedSubjects.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(fetchedSubjects[0].id);
      }
    } catch (err) {
      console.error('Failed to load subjects:', err);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const fetchSubjectData = async (subjectId: string) => {
    if (!subjectId) return;
    setLoadingPdfs(true);
    setLoadingQuestions(true);
    try {
      const [pdfRes, qRes] = await Promise.all([
        api.get('/pdfs'),
        api.get(`/questions?subjectId=${subjectId}`),
      ]);

      const allPdfs: UploadedPdf[] = pdfRes.data.data.pdfs || [];
      setPdfs(allPdfs.filter((p: any) => p.subjectId === subjectId));
      setGeneratedQuestions(qRes.data.data.questions || []);
    } catch (err) {
      console.error('Failed to fetch files/questions:', err);
    } finally {
      setLoadingPdfs(false);
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubjectId) {
      fetchSubjectData(selectedSubjectId);
    }
  }, [selectedSubjectId]);

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    setAddingSubject(true);
    setSubjectError('');
    try {
      const res = await api.post('/subjects', { name: newSubjectName.trim() });
      const created: Subject = res.data.data.subject;
      setSubjects((prev) => [...prev, created]);
      setSelectedSubjectId(created.id);
      setNewSubjectName('');
      setShowAddSubjectModal(false);
    } catch (err: any) {
      setSubjectError(err.response?.data?.message || 'Failed to create subject');
    } finally {
      setAddingSubject(false);
    }
  };

  const uploadFile = useCallback(
    async (file: File) => {
      if (!selectedSubjectId) return;

      const pdfTempId = crypto.randomUUID();
      const pdfItem: UploadedPdf = {
        id: pdfTempId,
        fileName: file.name,
        fileSize: file.size,
        status: 'uploading',
      };

      setPdfs((prev) => [pdfItem, ...prev]);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('subjectId', selectedSubjectId);

      try {
        const res = await api.post('/pdfs/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const uploadedPdf = res.data.data.pdf;
        const warning = res.data.warning;

        setPdfs((prev) =>
          prev.map((p) =>
            p.id === pdfTempId
              ? {
                  ...p,
                  id: uploadedPdf.id,
                  status: 'UPLOADED',
                  fileName: uploadedPdf.fileName,
                  fileSize: uploadedPdf.fileSize,
                  warning,
                }
              : p
          )
        );
        fetchSubjects();
      } catch (err: any) {
        setPdfs((prev) =>
          prev.map((p) =>
            p.id === pdfTempId
              ? {
                  ...p,
                  status: 'FAILED',
                  error: err.response?.data?.message || 'PDF upload failed',
                }
              : p
          )
        );
      }
    },
    [selectedSubjectId]
  );

  const handleFiles = useCallback(
    (fileList: FileList | File[]) => {
      const docFiles = Array.from(fileList).filter((f) => {
        const name = f.name.toLowerCase();
        return name.endsWith('.pdf') || name.endsWith('.docx') || name.endsWith('.doc') || name.endsWith('.txt');
      });
      if (docFiles.length === 0) return;
      docFiles.forEach((f) => uploadFile(f));
    },
    [uploadFile]
  );

  const handleGenerateQuestions = async (pdfId: string) => {
    setGeneratingFromPdf(pdfId);
    setPdfs((prev) =>
      prev.map((p) => (p.id === pdfId ? { ...p, status: 'PROCESSING', error: undefined } : p))
    );

    try {
      const res = await api.post(`/pdfs/${pdfId}/process`, {
        numQuestions,
        difficulty,
      });

      const extracted: GeneratedQuestion[] = res.data.data.questions || [];
      setGeneratedQuestions((prev) => [...extracted, ...prev]);

      setPdfs((prev) =>
        prev.map((p) =>
          p.id === pdfId
            ? { ...p, status: 'PROCESSED', questionsCount: (p.questionsCount || 0) + extracted.length }
            : p
        )
      );
      fetchSubjects();
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || 'AI extraction failed. Try a text-based PDF.';
      setPdfs((prev) =>
        prev.map((p) => (p.id === pdfId ? { ...p, status: 'FAILED', error: message } : p))
      );
    } finally {
      setGeneratingFromPdf(null);
    }
  };

  const handleDeletePdf = async (pdfId: string) => {
    // Optimistically remove from state immediately so UI updates right away
    setPdfs((prev) => prev.filter((p) => p.id !== pdfId));

    try {
      await api.delete(`/pdfs/${pdfId}`);
    } catch (err: any) {
      console.warn('Backend delete PDF warning (already removed locally):', err?.message || err);
    } finally {
      fetchSubjects();
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    setGeneratedQuestions((prev) => prev.filter((q) => q.id !== questionId));

    try {
      await api.delete(`/questions/${questionId}`);
    } catch (err: any) {
      console.warn('Delete question warning (already removed locally):', err?.message || err);
    } finally {
      fetchSubjects();
    }
  };

  const handleClearAllQuestions = async () => {
    if (!selectedSubject) return;
    if (!confirm(`Are you sure you want to delete all ${generatedQuestions.length} questions for ${selectedSubject.name}?`)) return;

    const questionIds = generatedQuestions.map((q) => q.id);
    setGeneratedQuestions([]);

    try {
      await Promise.all(questionIds.map((id) => api.delete(`/questions/${id}`).catch(() => {})));
    } catch (err: any) {
      console.warn('Clear all questions warning:', err);
    } finally {
      fetchSubjects();
    }
  };

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue-600)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
            AI Question Generator Studio
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--slate-900)', letterSpacing: '-0.02em', margin: 0 }}>
            Subject & PDF Question Hub
          </h1>
          <p style={{ fontSize: 13, color: 'var(--slate-500)', marginTop: 4, fontWeight: 400 }}>
            Add subjects, upload PDF past questions, and extract AI questions with corrections.
          </p>
        </div>

        <button
          onClick={() => setShowAddSubjectModal(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            height: 44, padding: '0 20px',
            background: 'var(--blue-600)', color: 'white',
            fontSize: 13, fontWeight: 700, borderRadius: 12,
            border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
            transition: 'all 0.15s',
          }}
        >
          <Plus style={{ width: 16, height: 16 }} /> Add New Subject
        </button>
      </div>

      {/* Modal: Add Subject */}
      {showAddSubjectModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
          zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }}>
          <div style={{
            background: 'white', border: '1.5px solid var(--slate-200)', borderRadius: 20,
            padding: 32, width: '100%', maxWidth: 440, boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
            display: 'flex', flexDirection: 'column', gap: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#EFF6FF', color: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen style={{ width: 18, height: 18 }} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>Add New Subject</h3>
              </div>
              <button onClick={() => setShowAddSubjectModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)', padding: 4 }}>
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {subjectError && (
                <div style={{ padding: '12px 16px', borderRadius: 12, background: '#FEF2F2', border: '1px solid rgba(220,38,38,0.15)', fontSize: 13, fontWeight: 600, color: '#DC2626' }}>
                  {subjectError}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                  Subject Name
                </label>
                <input
                  type="text"
                  required
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="e.g. Further Mathematics, Agricultural Science..."
                  style={{
                    width: '100%', height: 48, padding: '0 16px',
                    borderRadius: 12, border: '1.5px solid var(--slate-200)', background: 'var(--slate-50)',
                    fontSize: 14, fontWeight: 500, color: 'var(--slate-900)', outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, paddingTop: 12 }}>
                <button type="button" onClick={() => setShowAddSubjectModal(false)} style={{ height: 40, padding: '0 16px', background: 'none', border: 'none', fontSize: 13, fontWeight: 600, color: 'var(--slate-500)', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={addingSubject || !newSubjectName.trim()} style={{ height: 44, padding: '0 20px', background: 'var(--blue-600)', color: 'white', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  {addingSubject ? <Loader2 style={{ width: 16, height: 16, animation: 'spin 0.7s linear infinite' }} /> : <Plus style={{ width: 16, height: 16 }} />}
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Target Subject Selector Card */}
      <div style={{ background: 'white', border: '1.5px solid var(--slate-200)', borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column', gap: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EFF6FF', color: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--slate-900)' }}>Select Target Subject</div>
              <div style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 2 }}>{subjects.length} subjects configured</div>
            </div>
          </div>
        </div>

        {loadingSubjects ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--slate-400)', padding: '20px 0' }}>
            <Loader2 style={{ width: 18, height: 18, animation: 'spin 0.7s linear infinite' }} /> Loading subjects...
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }} className="subject-pills-grid">
            {subjects.map((sub) => {
              const isSelected = selectedSubjectId === sub.id;
              const emoji = SUBJECT_EMOJIS[sub.name] || '📘';
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubjectId(sub.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px', borderRadius: 14,
                    border: `1.5px solid ${isSelected ? 'var(--blue-600)' : 'var(--slate-200)'}`,
                    background: isSelected ? '#EFF6FF' : 'white',
                    color: isSelected ? 'var(--blue-600)' : 'var(--slate-900)',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                  }}
                >
                  <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{emoji}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.name}</div>
                      <div style={{ fontSize: 11, color: isSelected ? 'var(--blue-600)' : 'var(--slate-400)', fontWeight: 500, marginTop: 2 }}>
                        {sub._count?.questions || 0} Qs
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check style={{ width: 16, height: 16, color: 'var(--blue-600)', flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2-Column Layout */}
      {selectedSubject && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="upload-two-col">
          {/* Left Column — Upload & Process PDF */}
          <div style={{ background: 'white', border: '1.5px solid var(--slate-200)', borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 16, borderBottom: '1px solid var(--slate-100)' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileUp style={{ width: 18, height: 18 }} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--slate-900)' }}>Upload PDF for {selectedSubject.name}</div>
                <div style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 2 }}>Extract Q&A set directly with AI</div>
              </div>
            </div>

            {/* Select Options */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, background: 'var(--slate-50)', padding: 16, borderRadius: 14, border: '1px solid var(--slate-200)' }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                  Question Count
                </label>
                <select
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  style={{ width: '100%', height: 42, padding: '0 12px', borderRadius: 10, border: '1.5px solid var(--slate-200)', background: 'white', fontSize: 13, fontWeight: 600, color: 'var(--slate-900)', outline: 'none' }}
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                  <option value={20}>20 Questions</option>
                  <option value={30}>30 Questions</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                  Difficulty Standard
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  style={{ width: '100%', height: 42, padding: '0 12px', borderRadius: 10, border: '1.5px solid var(--slate-200)', background: 'white', fontSize: 13, fontWeight: 600, color: 'var(--slate-900)', outline: 'none' }}
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                  <option value="EXPERT">Expert (WAEC/JAMB)</option>
                </select>
              </div>
            </div>

            {/* Document Dropzone */}
            <input ref={inputRef} type="file" accept=".pdf,.docx,.doc,.txt" multiple onChange={(e) => e.target.files && handleFiles(e.target.files)} style={{ display: 'none' }} />
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
              onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files); }}
              onClick={() => inputRef.current?.click()}
              style={{
                border: `2px dashed ${dragging ? 'var(--blue-600)' : 'var(--slate-300)'}`,
                background: dragging ? '#EFF6FF' : 'var(--slate-50)',
                borderRadius: 16, padding: '32px 24px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'white', border: '1px solid var(--slate-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: 'var(--blue-600)' }}>
                <Upload style={{ width: 20, height: 20 }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--slate-900)' }}>
                {dragging ? 'Drop documents here' : 'Click or Drag document files here to upload'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 4 }}>
                Supports Microsoft Word (<span style={{ fontWeight: 700, color: 'var(--slate-700)' }}>.docx, .doc</span>), PDF (<span style={{ fontWeight: 700, color: 'var(--slate-700)' }}>.pdf</span>), and Text (<span style={{ fontWeight: 700, color: 'var(--slate-700)' }}>.txt</span>)
              </div>
            </div>

            {/* PDF File Listing */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Uploaded Subject PDFs ({pdfs.length})
              </div>

              {loadingPdfs ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--slate-400)', padding: '12px 0' }}>
                  <Loader2 style={{ width: 16, height: 16, animation: 'spin 0.7s linear infinite' }} /> Loading files…
                </div>
              ) : pdfs.length === 0 ? (
                <div style={{ padding: '20px', borderRadius: 12, background: 'var(--slate-50)', textAlign: 'center', fontSize: 12, color: 'var(--slate-400)', fontWeight: 500 }}>
                  No PDF study material uploaded for {selectedSubject.name} yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {pdfs.map((pdf) => (
                    <div key={pdf.id} style={{ background: 'var(--slate-50)', border: '1.5px solid var(--slate-200)', borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <FileText style={{ width: 18, height: 18 }} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--slate-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pdf.fileName}</div>
                            <div style={{ fontSize: 11, color: 'var(--slate-400)', marginTop: 2 }}>{formatFileSize(pdf.fileSize)} • {pdf.questionsCount || 0} Qs Extracted</div>
                          </div>
                        </div>
                        <button onClick={() => handleDeletePdf(pdf.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)', padding: 4 }}>
                          <Trash2 style={{ width: 16, height: 16 }} />
                        </button>
                      </div>

                      {pdf.error && (
                        <div style={{ padding: '10px 14px', borderRadius: 10, background: '#FEF2F2', border: '1px solid rgba(220,38,38,0.15)', fontSize: 12, color: '#DC2626', fontWeight: 600 }}>
                          {pdf.error}
                        </div>
                      )}

                      <button
                        onClick={() => handleGenerateQuestions(pdf.id)}
                        disabled={generatingFromPdf === pdf.id || pdf.status === 'uploading' || pdf.status === 'FAILED'}
                        style={{
                          width: '100%', height: 44,
                          background: pdf.status === 'FAILED' ? 'var(--slate-200)' : 'var(--blue-600)',
                          color: pdf.status === 'FAILED' ? 'var(--slate-500)' : 'white',
                          border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700,
                          cursor: generatingFromPdf === pdf.id || pdf.status === 'uploading' || pdf.status === 'FAILED' ? 'not-allowed' : 'pointer',
                          opacity: generatingFromPdf === pdf.id || pdf.status === 'uploading' ? 0.6 : 1,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          boxShadow: pdf.status === 'FAILED' ? 'none' : '0 4px 14px rgba(37,99,235,0.25)',
                        }}
                      >
                        {generatingFromPdf === pdf.id || pdf.status === 'uploading' ? (
                          <Loader2 style={{ width: 16, height: 16, animation: 'spin 0.7s linear infinite' }} />
                        ) : pdf.status === 'FAILED' ? (
                          'Upload Failed — Please Delete & Retry'
                        ) : (
                          <>
                            <Zap style={{ width: 15, height: 15 }} /> Generate {numQuestions} Qs & Answers with AI
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column — Questions & Corrections */}
          <div style={{ background: 'white', border: '1.5px solid var(--slate-200)', borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--slate-100)', paddingBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Brain style={{ width: 18, height: 18 }} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--slate-900)' }}>Questions & Corrections ({generatedQuestions.length})</div>
                  <div style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 2 }}>Review options (A, B, C, D) & corrections</div>
                </div>
              </div>

              {generatedQuestions.length > 0 && (
                <button
                  onClick={handleClearAllQuestions}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 8,
                    background: '#FEF2F2', border: '1px solid rgba(220,38,38,0.15)',
                    color: '#DC2626', fontSize: 11, fontWeight: 700,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <Trash2 style={{ width: 13, height: 13 }} /> Clear All
                </button>
              )}
            </div>

            {loadingQuestions ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, color: 'var(--slate-400)', padding: '40px 0' }}>
                <Loader2 style={{ width: 18, height: 18, animation: 'spin 0.7s linear infinite' }} /> Loading questions…
              </div>
            ) : generatedQuestions.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', background: 'var(--slate-50)', borderRadius: 16, border: '1px solid var(--slate-200)' }}>
                <Sparkles style={{ width: 28, height: 28, color: 'var(--blue-600)', margin: '0 auto 10px' }} />
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--slate-900)' }}>No questions generated yet</div>
                <div style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 4, maxWidth: 280, margin: '4px auto 0' }}>
                  Upload a PDF on the left and click &quot;Generate Qs & Answers with AI&quot;.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 600, overflowY: 'auto', paddingRight: 4 }}>
                {generatedQuestions.map((q, idx) => {
                  const isExpanded = expandedQuestionId === q.id;
                  const optionsList = Array.isArray(q.options) ? q.options : [];

                  return (
                    <div key={q.id} style={{ background: 'var(--slate-50)', border: '1.5px solid var(--slate-200)', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div
                        onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, cursor: 'pointer' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, minWidth: 0 }}>
                          <span style={{ width: 24, height: 24, borderRadius: 7, background: 'var(--blue-600)', color: 'white', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                            {idx + 1}
                          </span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--slate-900)', lineHeight: 1.5 }}>{q.text}</div>
                            {q.topic && (
                              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--blue-600)', background: '#EFF6FF', padding: '2px 8px', borderRadius: 6, display: 'inline-block', marginTop: 6 }}>
                                Topic: {q.topic}
                              </span>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteQuestion(q.id);
                            }}
                            title="Delete this question"
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              color: 'var(--slate-400)', padding: 6, borderRadius: 6,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all 0.15s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#DC2626')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--slate-400)')}
                          >
                            <Trash2 style={{ width: 15, height: 15 }} />
                          </button>
                          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)', padding: 4 }}>
                            {isExpanded ? <ChevronUp style={{ width: 16, height: 16 }} /> : <ChevronDown style={{ width: 16, height: 16 }} />}
                          </button>
                        </div>
                      </div>

                      {/* Options */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {optionsList.map((opt) => (
                          <div
                            key={opt.id}
                            style={{
                              padding: '10px 12px', borderRadius: 10,
                              border: `1px solid ${opt.isCorrect ? 'rgba(5,150,105,0.3)' : 'var(--slate-200)'}`,
                              background: opt.isCorrect ? '#ECFDF5' : 'white',
                              color: opt.isCorrect ? '#059669' : 'var(--slate-700)',
                              fontSize: 12, fontWeight: opt.isCorrect ? 700 : 500,
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                              <span style={{
                                width: 20, height: 20, borderRadius: 6,
                                background: opt.isCorrect ? '#059669' : 'var(--slate-100)',
                                color: opt.isCorrect ? 'white' : 'var(--slate-500)',
                                fontSize: 10, fontWeight: 800,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                              }}>
                                {opt.id}
                              </span>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{opt.text}</span>
                            </div>
                            {opt.isCorrect && (
                              <span style={{ fontSize: 9, fontWeight: 800, color: '#059669', background: '#D1FAE5', padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' }}>
                                Correct
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Explanation */}
                      {q.explanation && (
                        <div>
                          <button
                            onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', fontSize: 12, fontWeight: 700, color: '#7C3AED', cursor: 'pointer' }}
                          >
                            <Lightbulb style={{ width: 14, height: 14 }} />
                            {isExpanded ? 'Hide Step-by-Step AI Correction' : 'View Step-by-Step AI Correction'}
                          </button>

                          {isExpanded && (
                            <div style={{ marginTop: 8, padding: 14, borderRadius: 12, background: '#F5F3FF', border: '1px solid rgba(124,58,237,0.15)' }}>
                              <div style={{ fontSize: 11, fontWeight: 800, color: '#7C3AED', marginBottom: 4 }}>Step-by-Step AI Correction:</div>
                              <div style={{ fontSize: 12, color: 'var(--slate-700)', lineHeight: 1.6, fontWeight: 400 }}>{q.explanation}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .subject-pills-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .upload-two-col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
