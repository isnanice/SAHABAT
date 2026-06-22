import { create } from 'zustand'

const useChatbotStore = create((set, get) => ({
  messages: [],
  sessionId: null,
  loading: false,
  isOpen: false,

  setOpen: (isOpen) => set({ isOpen }),
  setLoading: (loading) => set({ loading }),

  initSession: () => {
    const { v4: uuidv4 } = require('uuid')
    if (!get().sessionId) {
      set({
        sessionId: uuidv4(),
        messages: [
          {
            id: '0',
            role: 'assistant',
            content:
              'Halo! Aku KAWAN, teman curhat kamu di SAHABAT 💙 Ceritakan apa yang sedang kamu rasakan. Semua yang kamu bagikan di sini aman dan terjaga kerahasiaannya.',
          },
        ],
      })
    }
  },

  sendMessage: async (content) => {
    const { messages, sessionId } = get()
    const userMessage = { id: Date.now().toString(), role: 'user', content }

    set({ messages: [...messages, userMessage], loading: true })

    try {
      const response = await fetch('/api/ai/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          sessionId,
        }),
      })

      const data = await response.json()
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
      }

      set((state) => ({
        messages: [...state.messages, assistantMessage],
        loading: false,
      }))
    } catch {
      set((state) => ({
        messages: [
          ...state.messages,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: 'Maaf, ada gangguan koneksi. Coba lagi ya 🙏',
          },
        ],
        loading: false,
      }))
    }
  },

  reset: () => set({ messages: [], sessionId: null }),
}))

export default useChatbotStore
