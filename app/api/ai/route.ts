import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

// AI Core Brain
async function aiBrain(systemRole: string, userText: string): Promise<string> {
  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemRole },
        { role: 'user', content: userText },
      ],
    })
    return response.choices[0].message.content?.trim() || ''
  } catch (error) {
    console.error('AI Brain Error:', error)
    throw error
  }
}

// Intent Detection
async function detectIntent(message: string): Promise<string> {
  const prompt = `
Detect intent from message.
Intents:
- BUY
- SELL
- SUPPORT
- PAYMENT
- CALL
- GENERAL

Message: ${message}
`
  return await aiBrain('You are an intent classifier.', prompt)
}

// Sales Automation
async function salesAI(message: string): Promise<string> {
  return await aiBrain(
    'You are a professional AI sales closer.',
    `Close the deal professionally:\n${message}`
  )
}

// Support Automation
async function supportAI(message: string): Promise<string> {
  return await aiBrain(
    'You are a helpful customer support agent.',
    message
  )
}

// Gmail Automation
async function gmailAI(emailText: string): Promise<string> {
  return await aiBrain(
    'You are a professional business email assistant.',
    `Reply professionally to this email:\n${emailText}`
  )
}

// Payment Automation
function paymentAI(): string {
  return (
    '✅ Payment Ready\n\n' +
    'Please complete your payment using the secure link below.\n' +
    'Once paid, your order will be processed immediately.'
  )
}

// Call Automation
function callAI(name: string): string {
  return (
    `📞 Call Scheduled\n\n` +
    `Hi ${name}, our AI has scheduled a call for you.\n` +
    'Our representative will contact you shortly.'
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, channel, customer_name = 'Customer' } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Detect Intent
    const intent = await detectIntent(message)

    let reply: string

    if (intent.includes('BUY')) {
      reply = await salesAI(message)
    } else if (intent.includes('SELL')) {
      reply = await salesAI('Handle seller inquiry')
    } else if (intent.includes('SUPPORT')) {
      reply = await supportAI(message)
    } else if (intent.includes('PAYMENT')) {
      reply = paymentAI()
    } else if (intent.includes('CALL')) {
      reply = callAI(customer_name)
    } else if (channel === 'email') {
      reply = await gmailAI(message)
    } else {
      reply = await aiBrain(
        'You are an intelligent business assistant.',
        message
      )
    }

    return NextResponse.json({
      intent,
      reply,
      time: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
