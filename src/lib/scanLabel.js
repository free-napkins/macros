import { supabase } from './supabaseClient'

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      resolve(result.slice(result.indexOf(',') + 1))
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function scanLabel(file, kind) {
  const imageBase64 = await fileToBase64(file)
  const mediaType = file.type || 'image/jpeg'
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const res = await fetch('/api/parse-label', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(session ? { authorization: `Bearer ${session.access_token}` } : {}),
    },
    body: JSON.stringify({ imageBase64, mediaType, kind }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to parse label')
  return data
}
