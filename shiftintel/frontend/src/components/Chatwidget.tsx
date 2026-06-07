'use client'

import { useState } from 'react'
import { sendChat } from '@/lib/api'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I am ShiftIntel Assistant. Ask me anything about your shift reports.'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim()) return

    const userMsg: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const data = await sendChat(input)
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.reply }
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Try again.' }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="no-print fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {open && (
        <div className="flex h-[500px] w-[380px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl">
          <header className="flex shrink-0 items-start justify-between border-b border-white/10 px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-white">
                ShiftIntel Assistant
              </h2>
              <p className="mt-0.5 text-xs text-zinc-400">
                Ask about your shift reports
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
              aria-label="Close chat"
            >
              <span className="text-lg leading-none">×</span>
            </button>
          </header>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${
                    message.role === 'user'
                      ? 'rounded-br-md bg-emerald-600 text-white'
                      : 'rounded-bl-md bg-zinc-800 text-zinc-100'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="animate-pulse rounded-2xl rounded-bl-md bg-zinc-800 px-3.5 py-2.5 text-sm text-zinc-400">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-white/10 p-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Ask about reports, zones, issues..."
                disabled={loading}
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="shrink-0 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-xl text-white shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-500 hover:shadow-emerald-900/40"
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? (
          <span className="text-2xl leading-none">×</span>
        ) : (
          <span aria-hidden>💬</span>
        )}
      </button>
    </div>
  )
}