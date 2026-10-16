/**
 * AI Chat API Endpoint
 *
 * Provides streaming AI chat support:
 * - Context-aware responses based on user state
 * - Integration with customer support LangGraph workflow
 * - Streaming responses for real-time interaction
 * - Escalation detection and human handoff
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDefaultProvider } from '@/lib/agents/providers';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

interface ChatRequest {
  message: string;
  conversationId?: string;
  context?: {
    userId?: string;
    currentPage?: string;
    userType?: 'homeowner' | 'contractor' | 'admin' | 'guest';
    claimId?: string;
    bookingId?: string;
  };
  history?: ChatMessage[];
  stream?: boolean;
}

interface ChatResponse {
  success: boolean;
  message?: string;
  conversationId?: string;
  intent?: string;
  sentiment?: 'positive' | 'neutral' | 'negative' | 'urgent';
  escalationRequired?: boolean;
  escalationReason?: string;
  suggestedActions?: string[];
  error?: string;
}

// Australian disaster recovery system prompt
const SYSTEM_PROMPT = `You are a helpful customer support assistant for an Australian disaster recovery platform.

Key responsibilities:
- Help users find and book restoration contractors
- Answer questions about claim submissions and status
- Provide guidance on the disaster recovery process
- Assist with contractor-related queries
- Handle billing and payment questions

Guidelines:
- Use Australian English (colour, mould, organisation)
- Be professional, empathetic, and helpful
- For emergencies, advise calling 000 first
- Direct complex insurance disputes to human support
- Provide specific, actionable guidance
- For support enquiries, direct users to submit a message via /contact (all communication is handled online via AI and the contact form)

Platform features you can help with:
- Submitting insurance claims
- Finding contractors by service type and location
- Checking booking status
- Understanding the matching process
- Accessing invoices and payments`;

// Context-specific prompts
const CONTEXT_PROMPTS: Record<string, string> = {
  '/dashboard/claims': 'The user is viewing their claims dashboard. Help with claim status, submissions, or documentation.',
  '/dashboard/bookings': 'The user is viewing their bookings. Help with booking status, contractor contact, or scheduling.',
  '/contractors': 'The user is searching for contractors. Help them find the right service provider for their needs.',
  '/submit-claim': 'The user is submitting a new claim. Guide them through the process and required information.',
  '/dashboard/admin': 'This is an admin user. Provide operational guidance and platform management help.',
};

const USER_TYPES: string[] = ['homeowner', 'contractor', 'admin', 'guest'];

function isSafeContextId(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(value);
}

// Quick action suggestions based on intent
const QUICK_ACTIONS: Record<string, string[]> = {
  claim_status: ['View my claims', 'Submit new claim', 'Upload documents'],
  find_contractor: ['Search contractors', 'View recommendations', 'Request quotes'],
  billing: ['View invoices', 'Payment history', 'Contact support'],
  booking: ['Check booking status', 'Contact contractor', 'Reschedule'],
  general: ['Browse FAQs', 'Contact support', 'View dashboard'],
};

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, context, history, stream = false } = body;

    if (!message || message.trim().length < 1) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Generate conversation ID if not provided
    const conversationId = body.conversationId || `conv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    // Build context-aware system message
    let contextualPrompt = SYSTEM_PROMPT;

    if (context?.currentPage) {
      const pageContext = Object.entries(CONTEXT_PROMPTS).find(([path]) =>
        context.currentPage?.includes(path)
      );
      if (pageContext) {
        contextualPrompt += `\n\nCurrent context: ${pageContext[1]}`;
      }
    }

    // context comes from the request body: only known user types and id-shaped
    // values may reach the system prompt.
    if (context?.userType && USER_TYPES.includes(context.userType)) {
      contextualPrompt += `\n\nUser type: ${context.userType}`;
    }

    if (isSafeContextId(context?.claimId)) {
      contextualPrompt += `\n\nUser is viewing claim ID: ${context.claimId}`;
    }

    if (isSafeContextId(context?.bookingId)) {
      contextualPrompt += `\n\nUser is viewing booking ID: ${context.bookingId}`;
    }

    // Build message history
    const messages: (SystemMessage | HumanMessage | AIMessage)[] = [new SystemMessage(contextualPrompt)];

    if (history && history.length > 0) {
      // Add conversation history (last 10 messages max)
      const recentHistory = history.slice(-10);
      for (const msg of recentHistory) {
        if (msg.role === 'user') {
          messages.push(new HumanMessage(msg.content));
        } else if (msg.role === 'assistant') {
          messages.push(new AIMessage(msg.content));
        }
      }
    }

    messages.push(new HumanMessage(message));

    // Handle streaming response
    if (stream) {
      return handleStreamingResponse(messages, conversationId, context);
    }

    // Non-streaming response
    return handleNonStreamingResponse(messages, conversationId, context, message);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process chat message',
      },
      { status: 500 }
    );
  }
}

async function handleStreamingResponse(
  messages: (SystemMessage | HumanMessage | AIMessage)[],
  conversationId: string,
  context?: ChatRequest['context']
) {
  try {
    const provider = getDefaultProvider();
    const model = provider.getModel();

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Stream the response
          const streamResponse = await model.stream(messages);

          let fullContent = '';

          for await (const chunk of streamResponse) {
            const content = typeof chunk.content === 'string' ? chunk.content : '';
            if (content) {
              fullContent += content;
              // Send chunk as SSE data
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'chunk', content })}\n\n`)
              );
            }
          }

          // Analyze the full response for metadata
          const analysis = await analyzeResponse(fullContent, context);

          // Send final metadata
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'done',
                conversationId,
                intent: analysis.intent,
                sentiment: analysis.sentiment,
                suggestedActions: analysis.suggestedActions,
              })}\n\n`
            )
          );

          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'error',
                error: 'Streaming failed',
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Stream setup error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize streaming' },
      { status: 500 }
    );
  }
}

async function handleNonStreamingResponse(
  messages: (SystemMessage | HumanMessage | AIMessage)[],
  conversationId: string,
  context: ChatRequest['context'],
  originalMessage: string
) {
  try {
    const provider = getDefaultProvider();
    const model = provider.getModel();

    const response = await model.invoke(messages);
    const content = typeof response.content === 'string' ? response.content : '';

    // Analyze response
    const analysis = await analyzeResponse(content, context);

    // Check for escalation triggers
    const escalationRequired = checkEscalationRequired(originalMessage, analysis);

    return NextResponse.json({
      success: true,
      message: content,
      conversationId,
      intent: analysis.intent,
      sentiment: analysis.sentiment,
      escalationRequired: escalationRequired.required,
      escalationReason: escalationRequired.reason,
      suggestedActions: analysis.suggestedActions,
    } as ChatResponse);
  } catch (error) {
    console.error('Non-streaming response error:', error);
    throw error;
  }
}

async function analyzeResponse(
  response: string,
  context?: ChatRequest['context']
): Promise<{
  intent: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
  suggestedActions: string[];
}> {
  const responseLower = response.toLowerCase();

  // Detect intent
  let intent = 'general';
  if (responseLower.includes('claim') || responseLower.includes('insurance')) {
    intent = 'claim_status';
  } else if (responseLower.includes('contractor') || responseLower.includes('booking')) {
    intent = 'find_contractor';
  } else if (responseLower.includes('payment') || responseLower.includes('invoice')) {
    intent = 'billing';
  }

  // Detect sentiment indicators
  let sentiment: 'positive' | 'neutral' | 'negative' | 'urgent' = 'neutral';
  if (responseLower.includes('sorry') || responseLower.includes('unfortunately')) {
    sentiment = 'negative';
  } else if (responseLower.includes('great') || responseLower.includes('happy to help')) {
    sentiment = 'positive';
  }

  // Get suggested actions
  const suggestedActions = QUICK_ACTIONS[intent] || QUICK_ACTIONS.general;

  return { intent, sentiment, suggestedActions };
}

function checkEscalationRequired(
  message: string,
  analysis: { intent: string; sentiment: string }
): { required: boolean; reason?: string } {
  const messageLower = message.toLowerCase();

  // Urgent/emergency keywords
  if (
    messageLower.includes('urgent') ||
    messageLower.includes('emergency') ||
    messageLower.includes('dangerous') ||
    messageLower.includes('life threatening')
  ) {
    return { required: true, reason: 'Urgent query detected' };
  }

  // Complaint indicators
  if (
    messageLower.includes('complaint') ||
    messageLower.includes('sue') ||
    messageLower.includes('lawyer') ||
    messageLower.includes('legal action') ||
    messageLower.includes('afca')
  ) {
    return { required: true, reason: 'Potential complaint or legal matter' };
  }

  // Dissatisfaction indicators
  if (
    messageLower.includes('terrible service') ||
    messageLower.includes('never again') ||
    messageLower.includes('refund') ||
    messageLower.includes('compensation')
  ) {
    return { required: true, reason: 'Customer dissatisfaction detected' };
  }

  // Safety concerns
  if (
    messageLower.includes('unsafe') ||
    messageLower.includes('hazard') ||
    messageLower.includes('injury') ||
    messageLower.includes('hurt')
  ) {
    return { required: true, reason: 'Safety concern reported' };
  }

  return { required: false };
}

// GET endpoint for health check
export async function GET() {
  try {
    const provider = getDefaultProvider();
    const health = await provider.checkHealth();

    return NextResponse.json({
      status: 'ok',
      provider: provider.getName(),
      providerHealth: health,
      features: {
        streaming: true,
        contextAware: true,
        escalationDetection: true,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: 'Health check failed',
      },
      { status: 500 }
    );
  }
}
