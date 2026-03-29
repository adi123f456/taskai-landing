import { useState, useEffect, useRef } from "react";

const GEMINI_SYSTEM = `You are TaskAI's intelligent task manager for freelancers. You help prioritize tasks, build daily schedules, and send deadline alerts.

When the user provides tasks, respond ONLY with a JSON object (no markdown, no backticks) in this exact format:
{
  "prioritized": [
    {
      "id": "unique_id",
      "title": "task title",
      "client": "client name",
      "deadline": "YYYY-MM-DD or null",
      "effort": "low|medium|high",
      "priority": 1,
      "priorityLabel": "🔴 Critical|🟠 High|🟡 Medium|🟢 Low",
      "reason": "short reason why this priority",
      "category": "design|development|writing|calls|admin|other"
    }
  ],
  "dailyPlan": [
    { "time": "9:00 AM", "task": "task title", "client": "client", "duration": "2h", "tip": "quick focus tip" }
  ],
  "alerts": [
    { "type": "warning|danger|info", "message": "alert message" }
  ],
  "aiInsight": "one line overall productivity insight"
}`;

const COLORS = {
  "🔴 Critical": { bg: "#FEE2E2", text: "#991B1B", border: "#FCA5A5" },
  "🟠 High":     { bg: "#FEF3C7", text: "#92400E", border: "#FCD34D" },
  "🟡 Medium":   { bg: "#DBEAFE", text: "#1E40AF", border: "#93C5FD" },
  "🟢 Low":      { bg: "#D1FAE5", text: "#065F46", border: "#6EE7B7" },
};

const CAT_ICONS = {
  design: "✦", development: "⌨", writing: "✍", calls: "☎", admin: "📋", other: "◈"
};

const EFFORT_DOT = { low: "#22C55E", medium: "#F59E0B", high: "#EF4444" };

const TODAY = new Date().toISOString().split("T")[0];

function getDaysLeft(deadline) {
  if (!deadline) return null;
  const diff = Math.ceil((new Date(deadline) - new Date(TODAY)) / 86400000);
  return diff;
}

function TaskInput({ onAnalyze, loading }) {
  const [text, setText] = useState("");
  const [client, setClient] = useState("");
  const [deadline, setDeadline] = useState("");
  const [effort, setEffort] = useState("medium");
  const [tasks, setTasks] = useState([]);

  function addTask() {
    if (!text.trim()) return;
    setTasks(prev => [...prev, { id: Date.now(), title: text, client, deadline, effort }]);
    setText(""); setClient(""); setDeadline(""); setEffort("medium");
  }

  function removeTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  function handleAnalyze() {
    if (tasks.length === 0) return;
    onAnalyze(tasks);
  }

  return (
    <div style={{ fontFamily: "'Syne', 'Space Grotesk', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap" rel="stylesheet" />

      <div style={{ background: "linear-gradient(135deg, #0F0F1A 0%, #1A1030 50%, #0D1A2E 100%)", borderRadius: 20, padding: "32px 28px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #6366F1, #A855F7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚡</div>
          <span style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: -1 }}>Task<span style={{ color: "#A78BFA" }}>AI</span></span>
          <span style={{ marginLeft: "auto", fontSize: 11, color: "#6B7280", background: "#1F2937", padding: "3px 10px", borderRadius: 20 }}>FREELANCER COPILOT</span>
        </div>
        <p style={{ color: "#9CA3AF", fontSize: 13, margin: 0 }}>Add your tasks, let AI prioritize & plan your day ✦</p>
      </div>

      {/* Input form */}
      <div style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 16, padding: "20px 20px 16px", marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addTask()}
          placeholder="Task description... (e.g. Design homepage for Rahul's brand)"
          style={{ width: "100%", border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 10, fontFamily: "inherit" }}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, alignItems: "end" }}>
          <div>
            <label style={{ fontSize: 11, color: "#6B7280", display: "block", marginBottom: 4, fontWeight: 600 }}>CLIENT</label>
            <input value={client} onChange={e => setClient(e.target.value)} placeholder="Client name" style={{ width: "100%", border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 12px", fontSize: 13, boxSizing: "border-box", fontFamily: "inherit" }} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#6B7280", display: "block", marginBottom: 4, fontWeight: 600 }}>DEADLINE</label>
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} style={{ width: "100%", border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 12px", fontSize: 13, boxSizing: "border-box", fontFamily: "inherit" }} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#6B7280", display: "block", marginBottom: 4, fontWeight: 600 }}>EFFORT</label>
            <select value={effort} onChange={e => setEffort(e.target.value)} style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 12px", fontSize: 13, fontFamily: "inherit", background: "#fff" }}>
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </div>
        </div>
        <button onClick={addTask} style={{ marginTop: 12, background: "#6366F1", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          + Add Task
        </button>
      </div>

      {/* Task list */}
      {tasks.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {tasks.map((t, i) => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "#FAFAFA", border: "1px solid #F0F0F0", borderRadius: 10, padding: "10px 14px", marginBottom: 6 }}>
              <span style={{ width: 22, height: 22, borderRadius: 6, background: "#EEF2FF", color: "#6366F1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{i + 1}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{t.title}</div>
                <div style={{ fontSize: 11, color: "#9CA3AF" }}>{t.client && `${t.client} · `}{t.deadline && `Due ${t.deadline} · `}<span style={{ color: EFFORT_DOT[t.effort] }}>● {t.effort}</span></div>
              </div>
              <button onClick={() => removeTask(t.id)} style={{ background: "none", border: "none", color: "#D1D5DB", cursor: "pointer", fontSize: 16, lineHeight: 1 }}>×</button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleAnalyze}
        disabled={tasks.length === 0 || loading}
        style={{ width: "100%", background: tasks.length === 0 ? "#E5E7EB" : "linear-gradient(135deg, #6366F1, #A855F7)", color: tasks.length === 0 ? "#9CA3AF" : "#fff", border: "none", borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 700, cursor: tasks.length === 0 ? "not-allowed" : "pointer", fontFamily: "inherit", letterSpacing: -0.3 }}>
        {loading ? "⚡ Analyzing with AI..." : `⚡ Prioritize ${tasks.length > 0 ? tasks.length : ""} Task${tasks.length !== 1 ? "s" : ""} with AI`}
      </button>
    </div>
  );
}

function PriorityBoard({ data, onReset }) {
  const [tab, setTab] = useState("priority");
  const { prioritized, dailyPlan, alerts, aiInsight } = data;

  const tabs = [
    { id: "priority", label: "Priority Board" },
    { id: "plan", label: "Daily Plan" },
    { id: "alerts", label: `Alerts${alerts?.length ? ` (${alerts.length})` : ""}` },
  ];

  return (
    <div style={{ fontFamily: "'Syne', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #6366F1, #A855F7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>⚡</div>
        <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>Task<span style={{ color: "#6366F1" }}>AI</span></span>
        <button onClick={onReset} style={{ marginLeft: "auto", background: "none", border: "1px solid #E5E7EB", borderRadius: 8, padding: "5px 12px", fontSize: 12, color: "#6B7280", cursor: "pointer", fontFamily: "inherit" }}>← New Analysis</button>
      </div>

      {/* AI Insight */}
      {aiInsight && (
        <div style={{ background: "linear-gradient(135deg, #EEF2FF, #F5F3FF)", border: "1px solid #C7D2FE", borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ fontSize: 16 }}>🤖</span>
          <span style={{ fontSize: 13, color: "#4338CA", lineHeight: 1.5 }}>{aiInsight}</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: "#F3F4F6", borderRadius: 10, padding: 4, marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, background: tab === t.id ? "#fff" : "transparent", border: "none", borderRadius: 8, padding: "8px 4px", fontSize: 12, fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? "#6366F1" : "#6B7280", cursor: "pointer", fontFamily: "inherit", boxShadow: tab === t.id ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Priority Board */}
      {tab === "priority" && (
        <div>
          {prioritized.map((task, i) => {
            const daysLeft = getDaysLeft(task.deadline);
            const col = COLORS[task.priorityLabel] || COLORS["🟢 Low"];
            return (
              <div key={task.id || i} style={{ border: `1.5px solid ${col.border}`, borderRadius: 14, padding: "14px 16px", marginBottom: 10, background: col.bg + "44", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: col.border, borderRadius: "14px 0 0 14px" }} />
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, paddingLeft: 8 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: col.bg, border: `1px solid ${col.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>
                    {CAT_ICONS[task.category] || "◈"}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>#{task.priority} {task.title}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: col.text, background: col.bg, border: `1px solid ${col.border}`, padding: "2px 8px", borderRadius: 20 }}>{task.priorityLabel}</span>
                    </div>
                    <div style={{ display: "flex", gap: 12, marginTop: 4, flexWrap: "wrap", alignItems: "center" }}>
                      {task.client && <span style={{ fontSize: 11, color: "#6B7280" }}>👤 {task.client}</span>}
                      {task.deadline && (
                        <span style={{ fontSize: 11, color: daysLeft !== null && daysLeft <= 2 ? "#DC2626" : "#6B7280", fontWeight: daysLeft !== null && daysLeft <= 2 ? 700 : 400 }}>
                          📅 {task.deadline} {daysLeft !== null && `(${daysLeft < 0 ? "overdue!" : daysLeft === 0 ? "today!" : `${daysLeft}d left`})`}
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: EFFORT_DOT[task.effort] }}>● {task.effort} effort</span>
                    </div>
                    {task.reason && <p style={{ fontSize: 12, color: "#6B7280", margin: "6px 0 0", lineHeight: 1.4 }}>{task.reason}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Daily Plan */}
      {tab === "plan" && (
        <div>
          <div style={{ marginBottom: 16, padding: "10px 14px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, fontSize: 12, color: "#166534" }}>
            📅 Your AI-generated work schedule for today
          </div>
          {dailyPlan?.map((slot, i) => (
            <div key={i} style={{ display: "flex", gap: 14, marginBottom: 12 }}>
              <div style={{ minWidth: 64, textAlign: "right" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#6366F1" }}>{slot.time}</span>
              </div>
              <div style={{ width: 2, background: "#E5E7EB", borderRadius: 2, position: "relative", flexShrink: 0 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#6366F1", position: "absolute", top: 6, left: -3 }} />
              </div>
              <div style={{ flex: 1, background: "#fff", border: "1px solid #F0F0F0", borderRadius: 10, padding: "10px 14px", marginTop: 2 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{slot.task}</div>
                <div style={{ display: "flex", gap: 10, marginTop: 3, fontSize: 11, color: "#9CA3AF" }}>
                  {slot.client && <span>👤 {slot.client}</span>}
                  <span>⏱ {slot.duration}</span>
                </div>
                {slot.tip && <p style={{ fontSize: 11, color: "#8B5CF6", margin: "6px 0 0", fontStyle: "italic" }}>💡 {slot.tip}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alerts */}
      {tab === "alerts" && (
        <div>
          {alerts?.length === 0 && (
            <div style={{ textAlign: "center", padding: 32, color: "#9CA3AF" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
              <div style={{ fontSize: 14 }}>No alerts! You're on track.</div>
            </div>
          )}
          {alerts?.map((alert, i) => {
            const styles = {
              danger: { bg: "#FEF2F2", border: "#FCA5A5", text: "#991B1B", icon: "🚨" },
              warning: { bg: "#FFFBEB", border: "#FCD34D", text: "#92400E", icon: "⚠️" },
              info: { bg: "#EFF6FF", border: "#93C5FD", text: "#1E40AF", icon: "ℹ️" },
            }[alert.type] || { bg: "#F9FAFB", border: "#E5E7EB", text: "#374151", icon: "📌" };
            return (
              <div key={i} style={{ background: styles.bg, border: `1px solid ${styles.border}`, borderRadius: 12, padding: "12px 16px", marginBottom: 10, display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: 16 }}>{styles.icon}</span>
                <span style={{ fontSize: 13, color: styles.text, lineHeight: 1.5 }}>{alert.message}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TaskAI() {
  const [stage, setStage] = useState("input"); // input | loading | results | error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleAnalyze(tasks) {
    setStage("loading");
    const taskText = tasks.map((t, i) =>
      `${i + 1}. "${t.title}" | Client: ${t.client || "N/A"} | Deadline: ${t.deadline || "none"} | Effort: ${t.effort}`
    ).join("\n");

    const userPrompt = `Here are my tasks as a freelancer. Today is ${new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.

${taskText}

Please analyze, prioritize by urgency + importance + deadline, create a daily schedule, highlight deadline alerts, and give an AI insight. Return ONLY valid JSON.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: GEMINI_SYSTEM,
          messages: [{ role: "user", content: userPrompt }]
        })
      });
      const data = await res.json();
      const raw = data.content?.map(b => b.text || "").join("").trim();
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
      setStage("results");
    } catch (err) {
      setErrorMsg("Failed to analyze tasks. Please try again.");
      setStage("error");
    }
  }

  if (stage === "loading") return (
    <div style={{ fontFamily: "'Syne', sans-serif", textAlign: "center", padding: "60px 20px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&display=swap" rel="stylesheet" />
      <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, #6366F1, #A855F7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 16px", animation: "pulse 1.2s ease-in-out infinite" }}>⚡</div>
      <style>{`@keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.08);opacity:.85} }`}</style>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#111", marginBottom: 6 }}>AI is analyzing your tasks...</div>
      <div style={{ fontSize: 13, color: "#9CA3AF" }}>Prioritizing by deadline, effort & client importance</div>
    </div>
  );

  if (stage === "error") return (
    <div style={{ fontFamily: "'Syne', sans-serif", textAlign: "center", padding: 40 }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
      <div style={{ fontSize: 14, color: "#DC2626", marginBottom: 16 }}>{errorMsg}</div>
      <button onClick={() => setStage("input")} style={{ background: "#6366F1", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Try Again</button>
    </div>
  );

  if (stage === "results" && result) return <PriorityBoard data={result} onReset={() => { setStage("input"); setResult(null); }} />;

  return <TaskInput onAnalyze={handleAnalyze} loading={stage === "loading"} />;
}
