const BASE = 'http://localhost:5000'

export async function submitReport(formData: {
  operatorName: string
  operatorContact: string
  zone: string
  shift: string
  date: string
  rawNotes: string
}) {
  const res = await fetch(`${BASE}/generate-report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to generate report')
  }
  return res.json()
}

export async function getReports() {
  const res = await fetch(`${BASE}/reports`)
  if (!res.ok) throw new Error('Failed to fetch reports')
  return res.json()
}

export async function getReport(id: string) {
  const res = await fetch(`${BASE}/reports/${id}`)
  if (!res.ok) throw new Error('Failed to fetch report')
  return res.json()
}
export async function sendChat(message: string){
  const res = await fetch(`${BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  })
  if (!res.ok) throw new Error('Failed to send chat')
  return res.json()
}