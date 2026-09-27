import { useState, useRef, useEffect, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useListChatThreads,
  useGetThreadMessages,
  useSendChatMessage,
  useListDocuments,
  useSubmitChatFeedback,
} from '@workspace/api-client-react';
import type { ChatMessage, ChatThread, Document } from '@workspace/api-client-react';
import {
  Sparkles,
  X,
  Send,
  Mic,
  MicOff,
  Globe,
  Volume2,
  VolumeX,
  CheckCircle2,
  ShieldAlert,
  ThumbsUp,
  ThumbsDown,
  Paperclip,
  Key,
} from 'lucide-react';

export function FloatingChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'mr' | 'gu'>('en');
  const [isRecording, setIsRecording] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [attachedDocIds, setAttachedDocIds] = useState<string[]>([]);
  const [feedbackSuccessId, setFeedbackSuccessId] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState(() => (typeof localStorage !== 'undefined' ? localStorage.getItem('schemesaathi_api_key') || '' : ''));
  const [selectedModel, setSelectedModel] = useState(() => (typeof localStorage !== 'undefined' ? localStorage.getItem('schemesaathi_model') || 'meta-llama/llama-3.3-70b-instruct' : 'meta-llama/llama-3.3-70b-instruct'));
  const [showKeyInput, setShowKeyInput] = useState(false);

  const saveApiKey = (val: string) => {
    setApiKey(val);
    if (typeof localStorage !== 'undefined') {
      if (val.trim()) {
        localStorage.setItem('schemesaathi_api_key', val.trim());
      } else {
        localStorage.removeItem('schemesaathi_api_key');
      }
    }
  };

  const saveModel = (val: string) => {
    setSelectedModel(val);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('schemesaathi_model', val);
    }
  };

  const queryClient = useQueryClient();
  const threadsQuery = useListChatThreads();
  const docsQuery = useListDocuments();
  const sendMessage = useSendChatMessage();
  const submitFeedback = useSubmitChatFeedback();

  const threads: ChatThread[] = threadsQuery.data || [];
  const documents: Document[] = docsQuery.data || [];
  const activeThreadId = threads[0]?.id || '';

  const messagesQuery = useGetThreadMessages(activeThreadId);
  const messages: ChatMessage[] = messagesQuery.data || [];

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, sendMessage.isPending]);

  const handleSendMessage = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText.trim();
    setInputText('');

    sendMessage.mutate(
      {
        data: {
          threadId: activeThreadId || undefined,
          text: textToSend,
          attachedDocs: attachedDocIds,
          language: selectedLanguage,
          apiKey: apiKey.trim() || undefined,
          model: selectedModel || undefined,
        } as any,
      },
      {
        onSuccess: () => {
          setTimeout(() => {
            queryClient.invalidateQueries();
          }, 100);
        },
      }
    );
  };

  const speakText = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Text-to-Speech is not supported on this browser.');
      return;
    }
    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang =
      selectedLanguage === 'hi'
        ? 'hi-IN'
        : selectedLanguage === 'mr'
        ? 'mr-IN'
        : selectedLanguage === 'gu'
        ? 'gu-IN'
        : 'en-IN';
    utterance.rate = 0.95;
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);
    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const toggleVoiceInput = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input is not supported on this browser.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  const handleFeedback = (messageId: string, isHelpful: boolean) => {
    submitFeedback.mutate(
      { data: { messageId, isHelpful } },
      {
        onSuccess: () => {
          setFeedbackSuccessId(messageId);
          setTimeout(() => setFeedbackSuccessId(null), 3000);
          queryClient.invalidateQueries();
        },
      }
    );
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
        {!isOpen && (
          <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-primary/30 bg-card px-3.5 py-2 text-xs font-bold text-foreground shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-right-4 duration-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>Ask Saathi AI 🤖</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`group flex h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl transition-all duration-300 ${
            isOpen
              ? 'bg-rose-600 hover:bg-rose-700 rotate-90'
              : 'bg-gradient-to-r from-primary via-teal-600 to-emerald-600 hover:scale-110 shadow-primary/25'
          }`}
          title={isOpen ? 'Close AI Assistant' : 'Open Ask Saathi Floating Assistant'}
          data-testid="floating-chatbot-toggle"
        >
          {isOpen ? <X size={24} /> : <Sparkles size={24} className="animate-pulse" />}
        </button>
      </div>

      {/* Floating Drawer Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[550px] w-[390px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Top Bar Header */}
          <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-teal-950 via-emerald-950 to-primary px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 font-display text-lg font-black text-secondary backdrop-blur-md">
                S
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display text-sm font-extrabold">SchemeSaathi AI</h3>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[10px] text-white/70">Govt Scheme & Application Advisor</p>
              </div>
            </div>

            {/* API Key & Language Selector */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowKeyInput(!showKeyInput)}
                className={`rounded-xl border px-2 py-1 text-[10px] font-extrabold transition flex items-center gap-1 ${
                  apiKey
                    ? 'border-emerald-400/40 bg-emerald-500/20 text-emerald-300'
                    : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                }`}
                title="Configure Gemini / OpenAI API Key"
              >
                <Key size={11} />
                <span>{apiKey ? 'API Key Set' : 'Set Key'}</span>
              </button>

              <div className="flex items-center gap-1 rounded-xl border border-white/20 bg-white/10 px-2 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                <Globe size={13} className="text-emerald-300" />
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value as any)}
                  className="bg-transparent text-[11px] font-bold outline-none cursor-pointer text-white"
                >
                  <option value="en" className="text-black">EN</option>
                  <option value="hi" className="text-black">हिंदी</option>
                  <option value="mr" className="text-black">मराठी</option>
                  <option value="gu" className="text-black">ગુજરાતી</option>
                </select>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-white/70 hover:bg-white/10 hover:text-white"
                title="Minimize Chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* API Key Configuration Dropdown Box */}
          {showKeyInput && (
            <div className="border-b border-border bg-amber-500/10 p-3 text-xs space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between font-bold text-amber-900 dark:text-amber-300 text-[11px]">
                <span className="flex items-center gap-1"><Key size={13} /> OpenRouter / Gemini API Key</span>
                <button onClick={() => setShowKeyInput(false)} className="text-muted-foreground hover:text-foreground"><X size={13} /></button>
              </div>

              <input
                type="password"
                value={apiKey}
                onChange={(e) => saveApiKey(e.target.value)}
                placeholder="Paste OpenRouter (sk-or-...) or Gemini (AIza...) Key"
                className="w-full h-8 rounded-lg border border-input bg-background px-2 text-xs outline-none focus:border-primary font-mono"
              />

              <div>
                <span className="block text-[10px] font-bold text-muted-foreground mb-1">Select OpenRouter Model</span>
                <select
                  value={selectedModel}
                  onChange={(e) => saveModel(e.target.value)}
                  className="w-full h-8 rounded-lg border border-input bg-background px-2 text-xs outline-none focus:border-primary font-semibold"
                >
                  <option value="meta-llama/llama-3.3-70b-instruct">🦙 OpenRouter: Llama 3.3 70B Instruct</option>
                  <option value="deepseek/deepseek-r1">🧠 OpenRouter: DeepSeek R1 Reasoning</option>
                  <option value="google/gemini-2.0-flash-001">⚡ OpenRouter: Gemini 2.0 Flash</option>
                  <option value="openai/gpt-4o-mini">🤖 OpenRouter: GPT-4o Mini</option>
                  <option value="gemini-1.5-flash">💎 Direct Google Gemini 1.5</option>
                </select>
              </div>

              <p className="text-[10px] text-muted-foreground leading-4">
                Saved locally in browser. Uses OpenRouter to answer scheme questions and generate recommendations.
              </p>
            </div>
          )}

          {/* Attached Document Selector */}
          {documents.length > 0 && (
            <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-3 py-1.5 text-[11px]">
              <Paperclip size={12} className="text-muted-foreground" />
              <select
                value={attachedDocIds[0] || ''}
                onChange={(e) => setAttachedDocIds(e.target.value ? [e.target.value] : [])}
                className="h-7 w-full rounded-md border border-input bg-background px-2 text-[11px] font-semibold outline-none focus:border-primary"
              >
                <option value="">Attach Document Context (Optional)</option>
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.status})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Chat Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.length > 0 ? (
              messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div key={msg.id} className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    
                    {!isUser && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-[10px]">
                        AI
                      </div>
                    )}

                    <div className={`max-w-[85%] space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`rounded-2xl p-3 text-xs leading-5 ${
                          isUser
                            ? 'bg-primary text-primary-foreground shadow-sm rounded-tr-none'
                            : msg.isGuardrailBlocked
                            ? 'bg-rose-500/10 border border-rose-500/30 text-foreground rounded-tl-none'
                            : 'bg-muted/70 border border-border text-foreground rounded-tl-none'
                        }`}
                      >
                        {msg.text}

                        {/* Guardrail Policy Refusal Box */}
                        {msg.isGuardrailBlocked && msg.structuredAnswer && (
                          <div className="mt-2 space-y-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-[11px]">
                            <div className="flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-300">
                              <ShieldAlert size={14} /> {msg.structuredAnswer.answer}
                            </div>
                            <p className="text-muted-foreground">{msg.structuredAnswer.why}</p>
                          </div>
                        )}

                        {/* Valid 5-Part Structured Response */}
                        {!isUser && !msg.isGuardrailBlocked && msg.structuredAnswer && (
                          <div className="mt-2.5 space-y-2.5 text-[11px]">
                            {/* Audio Playback Button */}
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => speakText(msg.id, `${msg.structuredAnswer?.answer}. ${msg.structuredAnswer?.why}`)}
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold transition ${
                                  speakingMsgId === msg.id
                                    ? 'bg-rose-500 text-white animate-pulse'
                                    : 'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground'
                                }`}
                              >
                                {speakingMsgId === msg.id ? <VolumeX size={12} /> : <Volume2 size={12} />}
                                {speakingMsgId === msg.id ? 'Stop' : '🔊 Listen'}
                              </button>
                            </div>

                            {/* Answer */}
                            <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-2.5 text-blue-950 dark:text-blue-200">
                              <p className="font-bold text-blue-700 dark:text-blue-300 mb-0.5">Answer</p>
                              <p className="leading-4">{msg.structuredAnswer.answer}</p>
                            </div>

                            {/* Why */}
                            <div className="rounded-lg border border-teal-500/30 bg-teal-500/10 p-2.5 text-teal-950 dark:text-teal-200">
                              <p className="font-bold text-teal-700 dark:text-teal-300 mb-0.5">Why it fits</p>
                              <p className="leading-4">{msg.structuredAnswer.why}</p>
                            </div>

                            {/* Documents */}
                            <div className="rounded-lg border border-border bg-background p-2.5 space-y-1">
                              <p className="font-bold text-foreground mb-0.5">What You Need:</p>
                              {msg.structuredAnswer.whatYouNeed.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-1.5 text-muted-foreground text-[10px]">
                                  <CheckCircle2 size={12} className="mt-0.5 shrink-0 text-emerald-600" />
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>

                            {/* Next Steps */}
                            <div className="rounded-lg border border-border bg-background p-2.5 space-y-1">
                              <p className="font-bold text-foreground mb-0.5">Next Steps:</p>
                              {msg.structuredAnswer.nextSteps.map((step, idx) => (
                                <p key={idx} className="text-muted-foreground text-[10px]">{idx + 1}. {step}</p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Feedback buttons for AI answers */}
                      {!isUser && (
                        <div className="flex items-center gap-2 px-1 text-[10px] text-muted-foreground">
                          <span>Helpful?</span>
                          <button
                            onClick={() => handleFeedback(msg.id, true)}
                            className={`p-1 rounded hover:bg-muted transition ${msg.isHelpful === true ? 'text-emerald-600 font-bold' : ''}`}
                          >
                            <ThumbsUp size={12} />
                          </button>
                          <button
                            onClick={() => handleFeedback(msg.id, false)}
                            className={`p-1 rounded hover:bg-muted transition ${msg.isHelpful === false ? 'text-rose-600 font-bold' : ''}`}
                          >
                            <ThumbsDown size={12} />
                          </button>
                          {feedbackSuccessId === msg.id && (
                            <span className="text-[10px] font-bold text-emerald-600">✓ Saved</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center p-4 space-y-2 text-muted-foreground">
                <Sparkles size={28} className="text-primary animate-pulse" />
                <p className="font-bold text-foreground text-sm">Ask Saathi Anything!</p>
                <p className="text-[11px]">Type any question regarding schemes, subsidies, DPR, or Udyam registration.</p>
              </div>
            )}

            {sendMessage.isPending && (
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground p-2 rounded-xl bg-muted/50 w-fit animate-pulse">
                <Sparkles size={13} className="text-primary animate-spin" />
                <span>Thinking & analyzing eligibility...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-1.5 bg-muted/30 border-t border-border flex items-center gap-1.5 overflow-x-auto text-[10px]">
            {['Which scheme fits my unit?', 'Documents for PMEGP?', 'Udyam registration steps'].map((promptText) => (
              <button
                key={promptText}
                onClick={() => setInputText(promptText)}
                className="whitespace-nowrap rounded-full border border-border bg-background px-2.5 py-0.5 font-medium transition hover:border-primary hover:text-primary"
              >
                {promptText}
              </button>
            ))}
          </div>

          {/* Message Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-background flex items-center gap-2">
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition ${
                isRecording
                  ? 'border-rose-500 bg-rose-500 text-white animate-pulse'
                  : 'border-input bg-background hover:bg-muted text-muted-foreground'
              }`}
              title={isRecording ? 'Listening...' : 'Voice Input'}
            >
              {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isRecording ? 'Listening...' : 'Ask your scheme question...'}
              className="h-9 flex-1 rounded-xl border border-input bg-background px-3 text-xs outline-none focus:border-primary"
            />

            <button
              type="submit"
              disabled={sendMessage.isPending || !inputText.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold disabled:opacity-50 transition hover:brightness-110"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
