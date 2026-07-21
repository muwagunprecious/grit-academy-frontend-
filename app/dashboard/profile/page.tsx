'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Phone, School, MapPin, Save, Loader2, GraduationCap } from 'lucide-react'
import api from '../../../lib/api'
import { useAuthStore } from '../../../stores/auth.store'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [fetching, setFetching] = useState(true)

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    school: '',
    class: '',
    state: '',
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/me')
        const u = res.data.data.user
        setForm({
          firstName: u.firstName || '',
          lastName: u.lastName || '',
          email: u.email || '',
          phone: u.phone || '',
          school: u.school || '',
          class: u.class || '',
          state: u.state || '',
        })
      } catch {
        if (user) {
          setForm({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: '',
            school: '',
            class: '',
            state: '',
          })
        }
      } finally {
        setFetching(false)
      }
    }
    fetchProfile()
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/users/me', {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || undefined,
        school: form.school || undefined,
        class: form.class || undefined,
        state: form.state || undefined,
      })
      setSaved(true)
    } catch { /* silent */ } finally {
      setSaving(false)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const initials = (form.firstName?.[0] || '') + (form.lastName?.[0] || '')

  const fields = [
    { name: 'firstName', label: 'First Name', icon: <User size={15} />, placeholder: 'First name', type: 'text' },
    { name: 'lastName', label: 'Last Name', icon: <User size={15} />, placeholder: 'Last name', type: 'text' },
    { name: 'email', label: 'Email', icon: <Mail size={15} />, placeholder: 'you@example.com', type: 'email', readonly: true },
    { name: 'phone', label: 'Phone', icon: <Phone size={15} />, placeholder: 'Phone number', type: 'tel' },
    { name: 'school', label: 'School', icon: <School size={15} />, placeholder: 'Your school name', type: 'text' },
    { name: 'class', label: 'Class / Level', icon: <GraduationCap size={15} />, placeholder: 'e.g. SS3, JAMB 2025', type: 'text' },
    { name: 'state', label: 'State', icon: <MapPin size={15} />, placeholder: 'Your state', type: 'text' },
  ]

  return (
    <div style={{ padding: '36px 40px', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>Profile</h2>
          <p style={{ fontSize: 13, color: 'var(--slate-500)', marginTop: 4 }}>Manage your personal information</p>
        </div>

        {fetching ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80, gap: 10, color: 'var(--slate-400)' }}>
            <Loader2 size={18} className="animate-spin" /> Loading profile...
          </div>
        ) : (
          <div style={{ background: 'white', border: '1.5px solid var(--slate-200)', borderRadius: 18, padding: 32 }}>
            {/* Avatar header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, paddingBottom: 28, borderBottom: '1px solid var(--slate-100)', marginBottom: 28 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16, flexShrink: 0,
                background: '#2563EB', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 800,
              }}>
                {initials || <User size={26} />}
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--slate-900)', margin: 0 }}>
                  {form.firstName && form.lastName ? `${form.firstName} ${form.lastName}` : 'Your Name'}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--slate-400)', margin: '2px 0 0' }}>{form.email || 'No email set'}</p>
              </div>
            </div>

            {/* Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              {fields.map((f) => (
                <div key={f.name}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--slate-500)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{f.label}</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)', display: 'flex' }}>{f.icon}</span>
                    <input
                      type={f.type}
                      name={f.name}
                      value={(form as any)[f.name]}
                      onChange={handleChange}
                      placeholder={f.placeholder}
                      readOnly={f.readonly}
                      style={{
                        width: '100%',
                        background: f.readonly ? 'var(--slate-50)' : 'white',
                        border: '1.5px solid var(--slate-200)',
                        borderRadius: 12,
                        fontSize: 13,
                        paddingLeft: 38,
                        paddingRight: 14,
                        height: 44,
                        color: 'var(--slate-900)',
                        outline: 'none',
                        boxSizing: 'border-box',
                        opacity: f.readonly ? 0.7 : 1,
                        cursor: f.readonly ? 'not-allowed' : 'text',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Save button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--slate-100)' }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '0 28px', height: 44,
                  background: '#2563EB', color: 'white', border: 'none',
                  borderRadius: 12, fontSize: 13, fontWeight: 700,
                  cursor: saving ? 'wait' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                  transition: 'opacity 0.15s',
                }}
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              {saved && (
                <span style={{ fontSize: 13, fontWeight: 600, color: '#059669' }}>Changes saved successfully</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
