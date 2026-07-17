export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

/**
 * Streams a POST endpoint that emits SSE-style `data: {...}\n\n` frames.
 * Calls onChunk(text) for each token, and returns the full accumulated text.
 */
export async function streamModule(path, body, onChunk, onError) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok || !res.body) {
    const msg = `Request failed (${res.status})`
    onError?.(msg)
    throw new Error(msg)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let full = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const frames = buffer.split('\n\n')
    buffer = frames.pop() ?? ''

    for (const frame of frames) {
      const line = frame.split('\n').find((l) => l.startsWith('data:'))
      if (!line) continue
      const jsonStr = line.replace(/^data:\s*/, '')
      try {
        const payload = JSON.parse(jsonStr)
        if (payload.error) {
          onError?.(payload.error)
        } else if (payload.text) {
          full += payload.text
          onChunk?.(payload.text, full)
        }
      } catch {
        // ignore malformed frame
      }
    }
  }
  return full
}

export async function fetchCanvas(startup) {
  const res = await fetch(`${API_BASE}/canvas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ startup }),
  })
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json()
}
