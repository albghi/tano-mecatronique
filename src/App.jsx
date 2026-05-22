import { useState, useRef, useEffect } from "react";

const TOPICS = [
  { id: "ibrido", label: "Ibrido Elettrico", icon: "⚡", color: "#00D4AA", desc: "Sistemi ibridi, batterie, motori elettrici" },
  { id: "fap", label: "FAP / DPF", icon: "🔧", color: "#FF6B35", desc: "Filtri antiparticolato, rigenerazione, diagnosi" },
  { id: "gr", label: "Sistemi GR", icon: "⚙️", color: "#4FC3F7", desc: "Gestione elettronica, centraline, sensori" },
  { id: "meccat", label: "Meccatronica", icon: "🔌", color: "#AB47BC", desc: "Integrazione meccanica ed elettronica" },
  { id: "diag", label: "Diagnostica", icon: "📊", color: "#FFD54F", desc: "OBD, codici errore, analisi guasti" },
  { id: "libero", label: "Domanda Libera", icon: "💬", color: "#78909C", desc: "Qualsiasi domanda tecnica" },
];

const SYSTEM_PROMPT = `Sei Tano, un esperto di meccatronica automobilistica specializzato in sistemi ibridi elettrici, filtri antiparticolato (FAP/DPF), sistemi GR, e tutta la parte meccanica ed elettronica dei veicoli moderni.

Rispondi SEMPRE in italiano. Le tue risposte devono essere:
- Tecnicamente precise e dettagliate
- Strutturate con chiarezza (usa titoli, elenchi puntati quando necessario)
- Pratiche e orientate alla diagnosi/riparazione
- Basate su dati reali (norme, valori tecnici, procedure)

Quando appropriato, includi:
- Valori di riferimento (temperature, pressioni, tensioni)
- Procedure di diagnosi passo per passo
- Codici di errore comuni e loro significato
- Consigli su strumenti di diagnosi

Sei un professionista che parla a un altro professionista della meccanica.`;

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [view, setView] = useState("home");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startChat = (topic) => {
    setSelectedTopic(topic);
    setMessages([]);
    setView("chat");
    if (topic.id !== "libero") setInput(`Parlami di: ${topic.label} - `);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const topicContext = selectedTopic && selectedTopic.id !== "libero"
        ? `L'utente sta chiedendo informazioni su: ${selectedTopic.label} - ${selectedTopic.desc}. `
        : "";

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT + (topicContext ? `\n\nContesto attuale: ${topicContext}` : ""),
          messages: newMessages,
        }),
      });

      const data = await response.json();
      const reply = data.content?.[0]?.text || "Errore nella risposta.";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages([...newMessages, { role: "assistant", content: "Errore di connessione. Riprova." }]);
    }
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (view === "chat") {
    return (
      <div style={styles.appShell}>
        <div style={styles.chatHeader}>
          <button onClick={() => setView("home")} style={styles.backBtn}>←</button>
          <div style={styles.headerCenter}>
            <div style={{ ...styles.topicBadge, background: selectedTopic?.color + "22", borderColor: selectedTopic?.color }}>
              <span>{selectedTopic?.icon}</span>
              <span style={{ color: selectedTopic?.color, fontWeight: 700, fontSize: 13 }}>{selectedTopic?.label}</span>
            </div>
            <div style={styles.headerTitle}>TANO Meccatronica</div>
          </div>
          <img src="/tano-logo.jpg" alt="TANO" style={styles.headerLogo} />
        </div>

        <div style={styles.messagesArea}>
          {messages.length === 0 && (
            <div style={styles.emptyState}>
              <div style={{ fontSize: 48 }}>{selectedTopic?.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#ccc" }}>Pronto per {selectedTopic?.label}</div>
              <div style={{ fontSize: 13, color: "#556", textAlign: "center" }}>{selectedTopic?.desc}</div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={{ ...styles.msgRow, justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              {m.role === "assistant" && <img src="/tano-logo.jpg" alt="TANO" style={styles.avatarLogo} />}
              <div style={{
                ...styles.bubble,
                background: m.role === "user" ? selectedTopic?.color || "#00D4AA" : "#1A1F2E",
                color: m.role === "user" ? "#000" : "#E8EAF0",
                borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                border: m.role === "assistant" ? "1px solid #2A2F3E" : "none",
              }}>
                {m.content.split('\n').map((line, j) => (
                  <span key={j}>{line}{j < m.content.split('\n').length - 1 && <br />}</span>
                ))}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ ...styles.msgRow, justifyContent: "flex-start" }}>
              <img src="/tano-logo.jpg" alt="TANO" style={styles.avatarLogo} />
              <div style={{ ...styles.bubble, background: "#1A1F2E", border: "1px solid #2A2F3E" }}>
                <div style={{ display: "flex", gap: 5, padding: "4px 2px" }}>
                  {[0, 150, 300].map(delay => (
                    <span key={delay} style={{ width: 6, height: 6, borderRadius: "50%", background: "#D4AF37", animation: "bounce 1s infinite", animationDelay: `${delay}ms`, display: "inline-block" }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={styles.inputArea}>
          <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
            placeholder="Scrivi la tua domanda tecnica..." style={styles.textarea} rows={2} />
          <button onClick={sendMessage} disabled={loading || !input.trim()}
            style={{ ...styles.sendBtn, background: selectedTopic?.color || "#D4AF37", opacity: (!input.trim() || loading) ? 0.4 : 1 }}>↑</button>
        </div>
        <style>{`@keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }`}</style>
      </div>
    );
  }

  return (
    <div style={styles.appShell}>
      <div style={styles.homeHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/tano-logo.jpg" alt="TANO" style={styles.logoImg} />
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: 3, color: "#fff" }}>TANO</div>
            <div style={{ fontSize: 10, color: "#556", letterSpacing: 1, textTransform: "uppercase" }}>Meccatronica Avanzata</div>
          </div>
        </div>
        <div style={styles.versionBadge}>AI Pro</div>
      </div>

      <div style={{ padding: "32px 20px 20px", position: "relative" }}>
        <div style={{ fontSize: 14, color: "#667", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Il tuo esperto di</div>
        <div style={{ fontSize: 32, fontWeight: 900, background: "linear-gradient(90deg, #D4AF37, #FFD700)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: -1, lineHeight: 1.1, marginBottom: 10 }}>Meccatronica Auto</div>
        <div style={{ fontSize: 13, color: "#778", lineHeight: 1.5, maxWidth: 300 }}>Analisi tecnica avanzata su sistemi ibridi, FAP, GR e diagnostica elettronica</div>
      </div>

      <div style={{ fontSize: 10, color: "#445", letterSpacing: 2, fontWeight: 700, padding: "0 20px 12px" }}>SELEZIONA UN ARGOMENTO</div>
      <div style={styles.topicsGrid}>
        {TOPICS.map(topic => (
          <button key={topic.id} onClick={() => startChat(topic)} style={styles.topicCard}>
            <div style={{ position: "absolute", inset: 0, borderRadius: 16, background: topic.color + "15", pointerEvents: "none" }} />
            <div style={{ width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: topic.color, background: topic.color + "18" }}>{topic.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 0.3, color: topic.color }}>{topic.label}</div>
            <div style={{ fontSize: 10, color: "#556", lineHeight: 1.4 }}>{topic.desc}</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4, color: topic.color }}>→</div>
          </button>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 10, color: "#334", padding: "20px 20px 24px", marginTop: "auto" }}>
        <img src="/tano-logo.jpg" alt="TANO" style={{ width: 28, height: 28, objectFit: "contain", borderRadius: 6 }} />
        <span>TANO Bosch Car Service · Powered by AI</span>
      </div>
    </div>
  );
}

const styles = {
  appShell: { minHeight: "100vh", background: "#0D1117", color: "#E8EAF0", fontFamily: "'Segoe UI', system-ui, sans-serif", display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto" },
  homeHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 20px 0" },
  logoImg: { width: 52, height: 52, objectFit: "contain", borderRadius: 10, filter: "drop-shadow(0 2px 8px rgba(212,175,55,0.5))" },
  versionBadge: { fontSize: 11, fontWeight: 700, color: "#D4AF37", background: "#D4AF3718", border: "1px solid #D4AF3744", borderRadius: 20, padding: "4px 10px", letterSpacing: 1 },
  topicsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "0 16px" },
  topicCard: { background: "#13181F", border: "1px solid #1E2430", borderRadius: 16, padding: "16px 14px", cursor: "pointer", textAlign: "left", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", gap: 6 },
  chatHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 16px 12px", borderBottom: "1px solid #1A1F2E", background: "#0D1117", position: "sticky", top: 0, zIndex: 10 },
  backBtn: { background: "#1A1F2E", border: "none", color: "#fff", fontSize: 18, width: 36, height: 36, borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  headerCenter: { display: "flex", flexDirection: "column", alignItems: "center", gap: 2 },
  topicBadge: { display: "flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 20, border: "1px solid", fontSize: 12 },
  headerTitle: { fontSize: 10, color: "#445", letterSpacing: 1 },
  headerLogo: { width: 36, height: 36, objectFit: "contain", borderRadius: 8, filter: "drop-shadow(0 2px 6px rgba(212,175,55,0.4))" },
  messagesArea: { flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 12, minHeight: 300 },
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 10, padding: "40px 20px", opacity: 0.6 },
  msgRow: { display: "flex", alignItems: "flex-end", gap: 8 },
  avatarLogo: { width: 28, height: 28, objectFit: "contain", borderRadius: 6, flexShrink: 0, filter: "drop-shadow(0 1px 4px rgba(212,175,55,0.4))" },
  bubble: { maxWidth: "80%", padding: "10px 14px", fontSize: 14, lineHeight: 1.6, wordBreak: "break-word" },
  inputArea: { display: "flex", gap: 8, padding: "12px 16px 20px", borderTop: "1px solid #1A1F2E", background: "#0D1117", alignItems: "flex-end" },
  textarea: { flex: 1, background: "#13181F", border: "1px solid #2A2F3E", borderRadius: 14, color: "#E8EAF0", fontSize: 14, padding: "10px 14px", resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.5 },
  sendBtn: { width: 44, height: 44, borderRadius: 12, border: "none", color: "#000", fontSize: 20, fontWeight: 900, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" },
};
