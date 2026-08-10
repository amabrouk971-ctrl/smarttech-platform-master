import { db } from '../firebase/config';
import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { AIModelProviderConfig } from '../types';

const AI_MODELS_COLLECTION = 'ai_model_providers';

export const SEED_AI_MODELS: AIModelProviderConfig[] = [
  {
    id: 'gemini-3.6-flash-default',
    providerName: 'Google Gemini 3.6 Flash (Primary)',
    providerType: 'GEMINI',
    apiKeyEnvVar: 'GEMINI_API_KEY',
    modelName: 'gemini-3.6-flash',
    temperature: 0.7,
    maxTokens: 2048,
    systemPrompt: 'أنت المساعد الذكي التفاعلي لمنصة SmartTech التعليمية.',
    rateLimitPerMinute: 60,
    rateLimitPerStudentDaily: 50,
    enabled: true,
    isDefault: true,
    usageCount: 1420,
    totalTokensUsed: 385000,
    estimatedCostUsd: 0.05,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'openai-gpt4o-fallback',
    providerName: 'OpenAI GPT-4o Proxy (Secondary Fallback)',
    providerType: 'OPENAI',
    baseUrl: 'https://api.openai.com/v1',
    apiKeyEnvVar: 'OPENAI_API_KEY',
    modelName: 'gpt-4o',
    temperature: 0.5,
    maxTokens: 2048,
    systemPrompt: 'You are an advanced educational AI evaluator for SmartTech Academy.',
    rateLimitPerMinute: 30,
    rateLimitPerStudentDaily: 20,
    enabled: false,
    isDefault: false,
    usageCount: 0,
    totalTokensUsed: 0,
    estimatedCostUsd: 0.00,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export async function getAIModelProvidersFromFirestore(): Promise<AIModelProviderConfig[]> {
  try {
    const snap = await getDocs(collection(db, AI_MODELS_COLLECTION));
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as AIModelProviderConfig));
    }
  } catch (err) {
    console.warn('Error loading AI model providers from Firestore:', err);
  }
  return SEED_AI_MODELS;
}

export async function saveAIModelProviderToFirestore(config: AIModelProviderConfig): Promise<void> {
  await setDoc(doc(db, AI_MODELS_COLLECTION, config.id), {
    ...config,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

export async function deleteAIModelProviderFromFirestore(id: string): Promise<void> {
  await deleteDoc(doc(db, AI_MODELS_COLLECTION, id));
}

// SERVER PROXY METHOD FOR TEST PLAYGROUND
export async function testAIModelPromptOnServer(
  providerId: string,
  systemPrompt: string,
  userPrompt: string,
  temperature: number = 0.7
): Promise<{ text: string; latencyMs: number; tokensUsed: number; status: 'SUCCESS' | 'ERROR'; errorMessage?: string }> {
  const startTime = Date.now();
  try {
    const res = await fetch('/api/ai/smartbot-hint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problemTitle: systemPrompt || 'SmartTech Lab AI Test',
        currentCode: userPrompt,
        studentAttempts: 1
      })
    });

    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}`);
    }

    const data = await res.json();
    const latencyMs = Date.now() - startTime;
    const text = Array.isArray(data.hints) ? data.hints.join('\n\n') : JSON.stringify(data, null, 2);

    return {
      text,
      latencyMs,
      tokensUsed: Math.round(text.length / 4) + 50,
      status: 'SUCCESS'
    };
  } catch (err: any) {
    return {
      text: '',
      latencyMs: Date.now() - startTime,
      tokensUsed: 0,
      status: 'ERROR',
      errorMessage: err.message || 'Failed to call server AI proxy'
    };
  }
}
