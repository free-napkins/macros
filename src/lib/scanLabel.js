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

async function normalizeImage(file) {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.')
  if (file.type === 'image/heic' || file.type === 'image/heif') {
    throw new Error('HEIC photos are not supported. Choose a JPG or PNG copy of the label.')
  }

  const bitmap = await createImageBitmap(file)
  const maxEdge = 1800
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82))
  if (!blob) throw new Error('This image could not be prepared for scanning.')
  return new File([blob], 'nutrition-label.jpg', { type: 'image/jpeg' })
}

export async function scanLabel(file, kind) {
  const image = await normalizeImage(file)
  const imageBase64 = await fileToBase64(image)
  const mediaType = 'image/jpeg'
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
