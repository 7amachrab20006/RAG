import api from './api'

export async function uploadDocuments(files: File[], onProgress?: (p: number) => void) {
  const form = new FormData()
  files.forEach((f) => form.append('files', f))
  const res = await api.post('/api/documents/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (evt: ProgressEvent) => {
      if (onProgress && evt.total) {
        onProgress(Math.round((evt.loaded / evt.total) * 100))
      }
    }
  })
  return res.data
}

export async function listDocuments() {
  const res = await api.get('/api/documents')
  return res.data
}

export async function deleteDocument(name: string) {
  // Use the axios instance so baseURL and CORS are handled consistently
  const res = await api.delete(`/api/documents/${encodeURIComponent(name)}`)
  return res.data
}
