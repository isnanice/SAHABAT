import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendChatbotMessage } from '@/lib/ai/chatbot'

export async function POST(request) {
  try {
    const { messages, sessionId } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Format pesan tidak valid' }, { status: 400 })
    }

    // Batasi riwayat pesan ke 20 terakhir untuk efisiensi
    const recentMessages = messages.slice(-20)

    const responseText = await sendChatbotMessage(recentMessages)

    // Simpan ke database (opsional, bisa dinonaktifkan untuk privasi penuh)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user && sessionId) {
      // Simpan pesan user dan assistant ke riwayat
      const lastUserMsg = messages[messages.length - 1]
      await supabase.from('chatbot_sessions').upsert({
        id: sessionId,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      })

      await supabase.from('chatbot_messages').insert([
        { session_id: sessionId, role: lastUserMsg.role, content: lastUserMsg.content },
        { session_id: sessionId, role: 'assistant', content: responseText },
      ])
    }

    return NextResponse.json({ message: responseText })
  } catch (error) {
    console.error('Chatbot API error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada layanan AI' },
      { status: 500 }
    )
  }
}
