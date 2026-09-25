"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

import {
  ArrowRight,
  Bot,
  BrainCircuit,
  Check,
  CheckCircle2,
  Compass,
  Lightbulb,
  MapPin,
  MessageSquare,
  Plus,
  Route,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
} from "lucide-react";

import { apiGet, apiPost } from "@/lib/api/client";

/**
 * =====================================================================
 * AI CAREER NAVIGATOR — AI CAREER GUIDE
 * =====================================================================
 *
 * FILE:
 * frontend/app/(app)/chat/page.tsx
 *
 * NOTE: header and left app-sidebar are provided by the shared
 * (app)/layout.tsx wrapper. This page adds its OWN always-visible
 * chat-history sidebar (narrow, left edge of this section) —
 * matching real AI chat products (ChatGPT-style), replacing an
 * earlier dropdown version that had a stale-click bug.
 * =====================================================================
 */

type ChatRole = "assistant" | "user";

type Message = {
  id: number;
  role: ChatRole;
  content: string;
};

type CareerContext = {
  hasRoadmap: boolean;
  targetCareer: string | null;
  readiness: number;
  currentStepTitle: string | null;
  stepsCompleted: number;
  stepsTotal: number;
  strongestSkills: { name: string; level: number }[];
  priorityGaps: { name: string; level: number }[];
};

const suggestions = [
  {
    icon: <Target size={14} />,
    label: "Why this career?",
    prompt: "Why does my current target career match my profile?",
  },
  {
    icon: <TrendingUp size={14} />,
    label: "Biggest skill gap",
    prompt: "What skill should I focus on first and why?",
  },
  {
    icon: <Route size={14} />,
    label: "Explain my roadmap",
    prompt: "Explain why my roadmap is ordered this way.",
  },
  {
    icon: <Lightbulb size={14} />,
    label: "What should I do next?",
    prompt: "Based on my current progress, what should I work on next?",
  },
];

export default function CareerChatPage() {
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [allSessions, setAllSessions] = useState<
    { id: number; created_at: string }[]
  >([]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const [context, setContext] = useState<CareerContext | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // -------------------------------------------------------------
  // LOAD ALL SESSIONS, THEN OPEN THE MOST RECENT ONE
  // -------------------------------------------------------------
  useEffect(() => {
    async function initSession() {
      try {
        const sessions = await apiGet<
          { id: number; profile_id: string; created_at: string }[]
        >("/chat/sessions");

        setAllSessions(
          sessions.map((s) => ({ id: s.id, created_at: s.created_at }))
        );

        let activeSessionId: number;

        if (sessions.length > 0) {
          activeSessionId = sessions[0].id;
        } else {
          const newSession = await apiPost<{ id: number }>(
            "/chat/sessions",
            {}
          );
          activeSessionId = newSession.id;
          setAllSessions([
            { id: newSession.id, created_at: new Date().toISOString() },
          ]);
        }

        setSessionId(activeSessionId);

        const history = await apiGet<
          { id: number; role: string; content: string }[]
        >(`/chat/sessions/${activeSessionId}/messages`);

        setMessages(
          history.map((m) => ({
            id: m.id,
            role: m.role as ChatRole,
            content: m.content,
          }))
        );
      } catch (err) {
        console.error("Failed to initialize chat session:", err);
      } finally {
        setLoadingHistory(false);
      }
    }

    initSession();
  }, []);

  // -------------------------------------------------------------
  // LOAD REAL CAREER CONTEXT FOR THE RIGHT PANEL
  // -------------------------------------------------------------
  useEffect(() => {
    async function loadContext() {
      try {
        const summary = await apiGet<{
          has_roadmap: boolean;
          target_career: string | null;
          readiness_percentage: number;
          steps_completed: number;
          steps_total: number;
          current_step_title: string | null;
          opportunities: { skill_name: string; current_level: number }[];
        }>("/dashboard/summary");

        const skillsDetailed = await apiGet<{
          skills: {
            skill_name: string;
            total_score: number;
            source: string | null;
          }[];
        }>("/skills/my-levels-detailed");

        const testedSkills = skillsDetailed.skills
          .filter((s) => s.total_score >= 60)
          .sort((a, b) => b.total_score - a.total_score)
          .slice(0, 3)
          .map((s) => ({ name: s.skill_name, level: s.total_score }));

        const priorityGaps = summary.opportunities
          .slice(0, 3)
          .map((o) => ({ name: o.skill_name, level: o.current_level }));

        setContext({
          hasRoadmap: summary.has_roadmap,
          targetCareer: summary.target_career,
          readiness: summary.readiness_percentage,
          currentStepTitle: summary.current_step_title,
          stepsCompleted: summary.steps_completed,
          stepsTotal: summary.steps_total,
          strongestSkills: testedSkills,
          priorityGaps,
        });
      } catch (err) {
        console.error("Failed to load career context:", err);
      }
    }

    loadContext();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // -------------------------------------------------------------
  // SEND A REAL MESSAGE
  // -------------------------------------------------------------
  async function sendMessage(messageText?: string) {
    const finalMessage = messageText?.trim() || input.trim();
    if (!finalMessage || isThinking || !sessionId) return;

    const optimisticUserMessage: Message = {
      id: Date.now(),
      role: "user",
      content: finalMessage,
    };

    setMessages((previous) => [...previous, optimisticUserMessage]);
    setInput("");
    setIsThinking(true);

    try {
      const response = await apiPost<{
        user_message: { id: number; role: string; content: string };
        assistant_message: { id: number; role: string; content: string };
      }>(`/chat/sessions/${sessionId}/messages`, { content: finalMessage });

      setMessages((previous) => [
        ...previous.filter((m) => m.id !== optimisticUserMessage.id),
        {
          id: response.user_message.id,
          role: "user",
          content: response.user_message.content,
        },
        {
          id: response.assistant_message.id,
          role: "assistant",
          content: response.assistant_message.content,
        },
      ]);
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage();
  }

  async function newConversation() {
    try {
      const newSession = await apiPost<{ id: number }>("/chat/sessions", {});
      setSessionId(newSession.id);
      setMessages([]);
      setInput("");
      setAllSessions((current) => [
        { id: newSession.id, created_at: new Date().toISOString() },
        ...current,
      ]);
    } catch (err) {
      console.error("Failed to start new conversation:", err);
    }
  }

  async function switchToSession(id: number) {
    if (id === sessionId) return;

    setLoadingHistory(true);
    try {
      const history = await apiGet<
        { id: number; role: string; content: string }[]
      >(`/chat/sessions/${id}/messages`);

      setSessionId(id);
      setMessages(
        history.map((m) => ({
          id: m.id,
          role: m.role as ChatRole,
          content: m.content,
        }))
      );
    } catch (err) {
      console.error("Failed to switch session:", err);
    } finally {
      setLoadingHistory(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] min-w-0 flex-1">
      {/* =============================================================
          CHAT HISTORY SIDEBAR — always visible, ChatGPT-style,
          replacing the earlier dropdown version.
      ============================================================= */}
      <aside className="hidden w-[220px] shrink-0 flex-col border-r border-slate-100 bg-white md:flex">
        <div className="p-3">
          <button
            type="button"
            onClick={newConversation}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-accent px-3 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/15 transition hover:bg-brand-navy"
          >
            <Plus size={14} />
            New conversation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-3">
          <p className="mb-2 px-2 text-[9px] font-bold uppercase tracking-wider text-slate-400">
            History
          </p>

          {allSessions.length === 0 ? (
            <p className="px-2 text-xs text-slate-400">No conversations yet.</p>
          ) : (
            <div className="space-y-1">
              {allSessions.map((s) => {
                const isActive = s.id === sessionId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => switchToSession(s.id)}
                    className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition ${
                      isActive
                        ? "bg-blue-50 font-semibold text-brand-accent"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <MessageSquare
                      size={13}
                      className={isActive ? "text-brand-accent" : "text-slate-400"}
                    />
                    <span className="truncate">
                      {new Date(s.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* =============================================================
          CHAT AREA
      ============================================================= */}
      <section className="relative flex min-w-0 flex-1 flex-col bg-[#fbfcff]">
        <div className="pointer-events-none absolute -right-48 -top-48 h-[450px] w-[450px] rounded-full bg-blue-100/50 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.018] [background-image:linear-gradient(to_right,#1e3a8a_1px,transparent_1px),linear-gradient(to_bottom,#1e3a8a_1px,transparent_1px)] [background-size:40px_40px]" />

        <div className="relative flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-5 pb-8 pt-8 sm:px-8">
            {loadingHistory ? (
              <p className="text-center text-sm text-slate-400">
                Loading your conversation...
              </p>
            ) : (
              <>
                {messages.length === 0 && (
                  <div className="mb-9 text-center">
                    <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-[1.3rem] bg-gradient-to-br from-brand-navy to-brand-accent text-white shadow-xl shadow-blue-500/20">
                      <Bot size={28} />
                      <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-blue-100 text-brand-accent">
                        <Sparkles size={11} />
                      </div>
                    </div>

                    <h1 className="mt-5 text-2xl font-bold tracking-tight text-brand-navy">
                      Your AI Career Guide
                    </h1>

                    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                      Ask questions about your career matches, skill gaps,
                      learning path, and progress.
                    </p>

                    <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[10px] font-semibold text-emerald-700">
                      <CheckCircle2 size={12} />
                      Using your latest career data
                    </div>
                  </div>
                )}

                {messages.length === 0 && (
                  <div className="mb-9 grid gap-3 sm:grid-cols-2">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.label}
                        type="button"
                        onClick={() => sendMessage(suggestion.prompt)}
                        className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-brand-accent transition group-hover:bg-brand-accent group-hover:text-white">
                          {suggestion.icon}
                        </div>
                        <span className="flex-1 text-xs font-semibold text-brand-navy">
                          {suggestion.label}
                        </span>
                        <ArrowRight
                          size={13}
                          className="text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-brand-accent"
                        />
                      </button>
                    ))}
                  </div>
                )}

                <div className="space-y-7">
                  {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}

                  {isThinking && <ThinkingMessage />}

                  <div ref={bottomRef} />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="relative border-t border-slate-100 bg-white/90 px-4 py-4 backdrop-blur-xl sm:px-6">
          <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
            <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg shadow-slate-900/[0.05] transition focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50">
              <div className="mb-1 ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-brand-accent">
                <Sparkles size={16} />
              </div>

              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                rows={1}
                placeholder="Ask about your career path..."
                className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-2 py-3 text-sm text-brand-navy outline-none placeholder:text-slate-400"
              />

              <button
                type="submit"
                disabled={!input.trim() || isThinking || !sessionId}
                className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-accent text-white shadow-md shadow-blue-500/15 transition-all hover:bg-brand-navy disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
              >
                <Send size={15} />
              </button>
            </div>

            <p className="mt-2 text-center text-[9px] text-slate-400">
              Guidance is based on your saved profile, assessment, matches
              and roadmap.
            </p>
          </form>
        </div>
      </section>

      {/* =============================================================
          RIGHT — CAREER CONTEXT
      ============================================================= */}
      <aside className="hidden w-[300px] shrink-0 overflow-y-auto border-l border-slate-100 bg-white 2xl:block">
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Live context
              </p>
              <h2 className="mt-1 text-sm font-bold text-brand-navy">
                What your guide knows
              </h2>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-brand-accent">
              <BrainCircuit size={17} />
            </div>
          </div>

          {!context ? (
            <p className="mt-5 text-xs text-slate-400">Loading context...</p>
          ) : !context.hasRoadmap ? (
            <p className="mt-5 text-xs text-slate-400">
              No roadmap yet — explore your career matches to get started.
            </p>
          ) : (
            <>
              <div className="relative mt-5 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-navy to-[#174b91] p-5 text-white">
                <Compass
                  size={105}
                  strokeWidth={0.6}
                  className="absolute -right-7 -top-7 text-white/10"
                />
                <div className="relative">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                    <Target size={17} />
                  </div>
                  <p className="mt-4 text-[9px] font-bold uppercase tracking-wider text-blue-200">
                    Target career
                  </p>
                  <p className="mt-1 text-lg font-bold">
                    {context.targetCareer}
                  </p>

                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold">
                        {context.readiness}%
                      </p>
                      <p className="text-[9px] text-blue-200">readiness</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {context.stepsCompleted}/{context.stepsTotal}
                      </p>
                      <p className="text-[9px] text-blue-200">steps done</p>
                    </div>
                  </div>
                </div>
              </div>

              {context.currentStepTitle && (
                <ContextSection title="Current focus" icon={<Route size={14} />}>
                  <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3.5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand-accent shadow-sm">
                        <MapPin size={14} />
                      </div>
                      <p className="text-xs font-bold text-brand-navy">
                        {context.currentStepTitle}
                      </p>
                    </div>
                  </div>
                </ContextSection>
              )}

              {context.strongestSkills.length > 0 && (
                <ContextSection title="Strongest skills" icon={<CheckCircle2 size={14} />}>
                  <div className="flex flex-wrap gap-2">
                    {context.strongestSkills.map((skill) => (
                      <span
                        key={skill.name}
                        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-[9px] font-bold text-emerald-700"
                      >
                        <Check size={10} />
                        {skill.name} ({skill.level}%)
                      </span>
                    ))}
                  </div>
                </ContextSection>
              )}

              {context.priorityGaps.length > 0 && (
                <ContextSection title="Priority gaps" icon={<TrendingUp size={14} />}>
                  <div className="space-y-2">
                    {context.priorityGaps.map((skill, index) => (
                      <div
                        key={skill.name}
                        className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5"
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-[9px] font-bold text-brand-accent shadow-sm">
                          {index + 1}
                        </div>
                        <span className="text-[10px] font-semibold text-brand-navy">
                          {skill.name} ({skill.level}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </ContextSection>
              )}
            </>
          )}

          <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50/70 p-3.5">
            <div className="flex gap-2.5">
              <Lightbulb size={14} className="mt-0.5 shrink-0 text-amber-600" />
              <p className="text-[9px] leading-4 text-amber-800">
                Your guide uses these results to explain your career path.
                Compatibility and readiness values come from your saved
                career data, not from the chat.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function ChatMessage({ message }: { message: Message }) {
  const assistant = message.role === "assistant";

  if (!assistant) {
    return (
      <div className="flex justify-end gap-3">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-brand-navy px-4 py-3 text-sm leading-6 text-white shadow-md shadow-blue-950/10">
          {message.content}
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <UserRound size={14} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-navy to-brand-accent text-white shadow-md shadow-blue-500/15">
        <Bot size={16} />
      </div>

      <div className="max-w-[85%]">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="text-[10px] font-bold text-brand-navy">
            AI Career Guide
          </span>
          <Sparkles size={10} className="text-brand-accent" />
        </div>

        <div className="rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3.5 text-sm leading-6 text-slate-600 shadow-sm">
          {message.content}
        </div>
      </div>
    </div>
  );
}

function ThinkingMessage() {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-navy to-brand-accent text-white">
        <Bot size={16} />
      </div>
      <div className="rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-accent [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-accent [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-accent" />
        </div>
      </div>
    </div>
  );
}

function ContextSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-5 border-t border-slate-100 pt-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-brand-accent">{icon}</span>
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}