import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────── */

const WAKE_WORD = "Shiv";
const MEMORY_KEY = "ARIA_SIGMA_MEMORY";
const METRICS_KEY = "ARIA_SIGMA_METRICS";

const MODELS = {
  fast: "gpt-4o-mini",
  smart: "gpt-4o"
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */

export default function VoiceAgent() {

  const [messages, setMessages] = useState([]);
  const [mode, setMode] = useState("sleeping");
  const [isAwake, setIsAwake] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const recognitionRef = useRef(null);
  const sleepTimerRef = useRef(null);
  const synth = typeof window !== "undefined" ? window.speechSynthesis : null;

  /* ───────────────── MEMORY ───────────────── */

  const saveMemory = (entry) => {
    const old = JSON.parse(localStorage.getItem(MEMORY_KEY) || "[]");
    localStorage.setItem(MEMORY_KEY, JSON.stringify([...old, entry]));
  };

  const loadMemory = () => {
    return JSON.parse(localStorage.getItem(MEMORY_KEY) || "[]");
  };

  /* ───────────────── METRICS ───────────────── */

  const saveMetric = (entry) => {
    const old = JSON.parse(localStorage.getItem(METRICS_KEY) || "[]");
    localStorage.setItem(METRICS_KEY, JSON.stringify([...old, entry]));
  };

  const getMetrics = () => {
    return JSON.parse(localStorage.getItem(METRICS_KEY) || "[]");
  };

  /* ───────────────── SPEECH ───────────────── */

  const speak = useCallback((text, emotion = "normal") => {
    if (!synth) return;

    synth.cancel();
    const utt = new SpeechSynthesisUtterance(text);

    if (emotion === "excited") {
      utt.rate = 1.2;
      utt.pitch = 1.3;
    } else if (emotion === "serious") {
      utt.rate = 0.9;
      utt.pitch = 0.8;
    }

    setMode("speaking");
    utt.onend = () => setMode("awake");
    synth.speak(utt);
  }, [synth]);

  /* ───────────────── AUTO SLEEP ───────────────── */

  const resetSleepTimer = () => {
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);

    sleepTimerRef.current = setTimeout(() => {
      setIsAwake(false);
      setMode("sleeping");
      speak("Entering standby mode.");
    }, 30000);
  };

  /* ───────────────── MODEL ROUTER ───────────────── */

  const routeModel = (task) => {
    if (task.includes("deploy") || task.includes("architecture"))
      return MODELS.smart;
    return MODELS.fast;
  };

  /* ───────────────── LLM CALL ───────────────── */

  const callLLM = async (system, user, model) => {

    const res = await fetch("/api/llm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system, user, model })
    });

    const data = await res.json();
    return data.response;
  };

  /* ───────────────── PARALLEL PLANNERS ───────────────── */

  const parallelPlanners = async (userMessage) => {

    const plannerPrompt = `
Break the request into executable steps.
Return JSON { "plan": ["..."] }
`;

    const model = routeModel(userMessage);

    const calls = [1,2,3].map(() =>
      callLLM(plannerPrompt, userMessage, model)
    );

    const results = await Promise.all(calls);

    return results.map(r => JSON.parse(r).plan);
  };

  /* ───────────────── CRITIC SCORING ───────────────── */

  const scorePlan = async (plan, userMessage) => {

    const criticPrompt = `
Score this plan 1-10 for:
- completeness
- safety
- efficiency
Return JSON { "score": number }
`;

    const res = await callLLM(
      criticPrompt,
      JSON.stringify({ userMessage, plan }),
      MODELS.fast
    );

    return JSON.parse(res).score;
  };

  const voteBestPlan = async (plans, userMessage) => {

    let bestPlan = null;
    let bestScore = -1;

    for (const plan of plans) {
      const score = await scorePlan(plan, userMessage);
      if (score > bestScore) {
        bestScore = score;
        bestPlan = plan;
      }
    }

    return bestPlan;
  };

  /* ───────────────── SIGMA PRO PIPELINE ───────────────── */

  const callSigmaPro = async (userMessage) => {

    const startTime = performance.now();

    try {

      const plans = await parallelPlanners(userMessage);
      const finalPlan = await voteBestPlan(plans, userMessage);

      const executorPrompt = `
Execute this plan and return ARIA JSON:
{
  "speak": "...",
  "action": "...",
  "title": "...",
  "steps": ["..."],
  "code": "...",
  "output": "...",
  "status": "success"
}
`;

      const result = await callLLM(
        executorPrompt,
        JSON.stringify({ userMessage, finalPlan }),
        MODELS.smart
      );

      const endTime = performance.now();

      saveMetric({
        task: userMessage,
        duration: Math.round(endTime - startTime),
        time: Date.now()
      });

      return JSON.parse(result);

    } catch (err) {

      return {
        speak: "Cloud unavailable. Switching to fallback reasoning.",
        action: "none",
        status: "error"
      };
    }
  };

  /* ───────────────── HANDLE COMMAND ───────────────── */

  const handleCommand = async (text) => {

    if (processing) return;

    setProcessing(true);
    setMode("processing");

    setMessages(prev => [...prev, { role: "user", text }]);

    const response = await callSigmaPro(text);

    if (["execute","deploy"].includes(response.action)) {
      setPendingAction(response);
      speak("Permission required. Shall I proceed?");
      setProcessing(false);
      return;
    }

    speak(response.speak);
    saveMemory({ title: response.title, time: Date.now() });

    setMessages(prev => [...prev, {
      role: "assistant",
      text: response.speak
    }]);

    setProcessing(false);
  };

  /* ───────────────── VOICE LISTENER ───────────────── */

  const startListening = useCallback(() => {

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();

    rec.continuous = true;
    rec.lang = "en-US";

    rec.onresult = (e) => {
      const text = e.results[e.results.length - 1][0].transcript.toLowerCase();

      if (!isAwake && text.includes(WAKE_WORD)) {
        setIsAwake(true);
        setMode("awake");
        speak("Yes.");
        resetSleepTimer();
        return;
      }

      if (isAwake && pendingAction) {
        if (text.includes("yes")) {
          speak("Executing now.", "excited");
          setPendingAction(null);
        } else if (text.includes("no")) {
          speak("Cancelled.");
          setPendingAction(null);
        }
        return;
      }

      if (isAwake) {
        resetSleepTimer();
        handleCommand(text);
      }
    };

    rec.onend = () => rec.start();
    recognitionRef.current = rec;
    rec.start();

  }, [isAwake, pendingAction]);

  useEffect(() => {
    startListening();
  }, []);

  /* ───────────────── UI ───────────────── */

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono flex flex-col items-center justify-center">

      <h1 className="text-3xl mb-4">ARIA SIGMA PRO</h1>

      <div className="mb-4">Mode: {mode.toUpperCase()}</div>

      <div className="w-full max-w-xl space-y-2">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-blue-400" : "text-green-400"}>
            {m.role === "user" ? "You: " : "ARIA: "}
            {m.text}
          </div>
        ))}
      </div>

      <div className="mt-6 text-xs text-gray-500">
        <div>Recent Tasks:</div>
        {getMetrics().slice(-5).map((m, i) => (
          <div key={i}>
            {m.task} — {m.duration}ms
          </div>
        ))}
      </div>

    </div>
  );
}