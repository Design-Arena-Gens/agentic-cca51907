'use client'

import { useState } from 'react'

export default function Home() {
  const [message, setMessage] = useState('')
  const [channel, setChannel] = useState('chat')
  const [customerName, setCustomerName] = useState('Customer')
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResponse(null)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          channel,
          customer_name: customerName,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      setResponse(data)
    } catch (err: any) {
      setError(err.message || 'Failed to process request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h1>🚀 NextPlay AI</h1>
      <p className="subtitle">AI-Powered Business Automation System</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="customerName">Customer Name</label>
          <input
            id="customerName"
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter customer name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="channel">Channel</label>
          <select
            id="channel"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
          >
            <option value="chat">Chat</option>
            <option value="email">Email</option>
            <option value="call">Call</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message or inquiry..."
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? '🤖 Processing...' : '✨ Process with AI'}
        </button>
      </form>

      {error && (
        <div className="response error">
          <h2>❌ Error</h2>
          <p>{error}</p>
        </div>
      )}

      {response && (
        <div className="response">
          <h2>✅ AI Response</h2>

          <div className="response-item">
            <span className="response-label">Detected Intent:</span>
            <div className="intent-badge">{response.intent}</div>
          </div>

          <div className="response-item">
            <span className="response-label">AI Reply:</span>
            <div className="response-value">{response.reply}</div>
          </div>

          <div className="response-item">
            <span className="response-label">Timestamp:</span>
            <div className="response-value">{new Date(response.time).toLocaleString()}</div>
          </div>
        </div>
      )}
    </div>
  )
}
