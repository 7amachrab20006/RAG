import api from './api'

export async function sendQuestion(question: string) {
  const res = await api.post('/api/chat', { question })
  return res.data
}
