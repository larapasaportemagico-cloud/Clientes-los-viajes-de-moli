"use client";
import { useState, useRef, useEffect } from "react";

const FORM_RESTAURANTES = "https://docs.google.com/forms/d/e/1FAIpQLSf1H3c9HZ5JrAHSe36ys-zjM3ZCYrj47v6QXnLXui2xrMpKeQ/viewform";
const FORM_MODIFICAR = "https://docs.google.com/forms/d/e/1FAIpQLScSaC2-3EZTQCOemTG4PrnxbiNUH6R0eFuDGZaZsroNB0-FTA/viewform";

const SYSTEM_ASISTENTE = `Eres el asistente virtual de LOS VIAJES DE MOLI, la agencia de Lara, agente Disney especializada en Disneyland París.
Tienes acceso a los datos REALES del cliente. Úsalos para personalizar tus respuestas.
Hablas en nombre de Lara. Eres amable, cercana, cálida y siempre en español.

DATOS DEL CLIENTE: {DATOS_CLIENTE}

PLANES DE COMIDAS:
- DESAYUNO: Solo desayuno en hotel.
- MEDIA PENSIÓN (MP): Desayuno + 1 comida o cena. No incluye bebidas adultos. Menores 3 años gratis en buffet.
- PENSIÓN COMPLETA (PC): Desayuno + comida + cena. No incluye bebidas adultos.
- PC PLUS: Como PC + restaurantes de mayor categoría.
- PC EXTRA PLUS: Incluye Chez Remy y restaurantes premium.
- PC PREMIUM / MP PREMIUM: Alta gama con experiencias con personajes.

RESTAURANTES DLP:
- Auberge Cendrillon: Princesas. Alta cocina francesa. El más especial. Desde abril 2026 también con Mickey.
- Walt's: Más elegante del parque.
- Agrabah Café: Buffet Aladdín. Árabe/mediterránea. Muy recomendado.
- Chez Remy: Ratatouille. Solo planes Plus o superior.
- PYM Kitchen: Buffet Marvel.
- The Regal View (nuevo 2026): Princesas. Disney Adventure World.
- Plaza Gardens: Buffet. CIERRA ABRIL 2026.
- Downtown (Hotel Marvel): Superhéroes. Muy recomendado.
- Hunter Grill (Sequoia): Carnes a la brasa.
- Chuck Wagon (Cheyenne): Buffet western. Económico.
- Royal Banquet (Hotel Disneyland): Personajes. Solo alojados.

REGLAS:
- Usa el nombre del cliente en la primera respuesta
- Si preguntan por restaurantes, ya sabes su hotel y plan — úsalos
- Para modificar reserva o traslados → formulario de modificación
- Para restaurantes → formulario de restaurantes
- Nunca inventes precios
- Blog de Lara: losviajesdemoli.com
- Contacto: losviajesdemoli.com/contacto`;

function formatEuro(val) {
  if (!val || val === "0" || val === "") return "0,00 €";
  const num = parseFloat(String(val).replace(",", ".").replace("€", "").trim());
  if (isNaN(num)) return val;
  return num.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

function PagoBar({ pagado, total }) {
  const p = parseFloat(String(pagado).replace(",", ".").replace("€", "")) || 0;
  const t = parseFloat(String(total).replace(",", ".").replace("€", "")) || 1;
  const pct = Math.min(100, Math.round((p / t) * 100));
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#7a6a50", marginBottom: 6 }}>
        <span>Pagado: <strong style={{ color: "#16a34a" }}>{formatEuro(pagado)}</strong></span>
        <span>{pct}%</span>
      </div>
      <div style={{ background: "#e8e0d5", borderRadius: 20, height: 8 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? "#16a34a" : "linear-gradient(90deg, #c9a84c, #e8c97a)", borderRadius: 20 }} />
      </div>
    </div>
  );
}

export default function Portal() {
  const [step, setStep] = useState("login");
  const [dni, setDni] = useState("");
  const [cliente, setCliente] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState("reserva");
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, chatLoading]);

  const handleLogin = async () => {
    if (!dni.trim()) return;
    setStep("loading");
    try {
      const SHEET_ID = "1zUnmMzaxoYI4jwfRBJ3vfvzjo5_dPPnML5L_XIRvMFA";
      const GID = "1569558318";
      const res = await fetch(`/api/reserva?dni=${encodeURIComponent(dni.trim())}`);
      const result = await res.json();
      if (result.encontrado) {
        setCliente(result.datos);
        setStep("portal");
        setChatLoading(true);
        const chatRes = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: "Hola, acabo de entrar a mi portal" }],
            system: SYSTEM_ASISTENTE.replace("{DATOS_CLIENTE}", JSON.stringify(result.datos)),
          }),
        });
        const chatData = await chatRes.json();
        setMessages([{ role: "assistant", content: chatData.content?.[0]?.text || "¡Hola! ¿En qué puedo ayudarte?" }]);
        setChatLoading(false);
      } else {
        setErrorMsg("No encontramos ninguna reserva con ese DNI. Verifica que sea correcto o contacta con Lara.");
        setStep("error");
      }
    } catch {
      setErrorMsg("Error de conexión. Inténtalo de nuevo.");
      setStep("error");
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = { role: "user", content: chatInput.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          system: SYSTEM_ASISTENTE.replace("{DATOS_CLIENTE}", JSON.stringify(cliente)),
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.content?.[0]?.text || "Error al responder." }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Error de conexión." }]);
    }
    setChatLoading(false);
  };

  const pendiente = parseFloat(String(cliente?.Pendiente || cliente?.["PENDIENTE AUTO"] || "0").replace(",", ".").replace("€", "")) || 0;

  const s = {
    page: { minHeight: "100vh", background: "linear-gradient(160deg, #1c1410 0%, #2d1f0e 40%, #0d1520 100%)", fontFamily: "Palatino Linotype, Palatino, serif" },
    header: { background: "rgba(28,20,16,0.95)", borderBottom: "2px solid #c9a84c", padding: "14px 24px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 100 },
    logo: { width: 38, height: 38, background: "linear-gradient(135deg, #c9a84c, #e8c97a)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 },
    card: { background: "#fff", border: "1px solid #e8e0d5", borderRadius: 12, padding: "14px 16px" },
    goldBtn: { background: "linear-gradient(135deg, #c9a84c, #e8c97a)", color: "#1c1410", border: "none", borderRadius: 10, padding: "14px", fontSize: 15, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, width: "100%" },
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.logo}>🏰</div>
        <div>
          <div style={{ color: "#c9a84c", fontSize: 10, letterSpacing: 3, textTransform: "uppercase" }}>Los Viajes de Moli</div>
          <div style={{ color: "#f5f2ee", fontSize: 16 }}>Portal del Viajero</div>
        </div>
        {cliente && (
          <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ color: "#c9a84c", fontSize: 13 }}>✨ {String(cliente.Nombre || "").split(" ")[0]}</span>
            <button onClick={() => { setStep("login"); setCliente(null); setDni(""); setMessages([]); }}
              style={{ background: "transparent", border: "1px solid #3a2e20", borderRadius: 8, color: "#7a6a50", padding: "6px 12px", fontSize: 11, cursor: "pointer" }}>
              Salir
            </button>
          </div>
        )}
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 16px 60px" }}>
        {(step === "login" || step === "error") && (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🏰</div>
            <h2 style={{ color: "#f5f2ee", fontWeight: 400, fontSize: 26, margin: "0 0 8px" }}>Bienvenido a tu Portal</h2>
            <p style={{ color: "#8a7a6a", fontSize: 14, margin: "0 0 40px" }}>Consulta tu reserva, pagos, documentos y resuelve tus dudas</p>
            <div style={{ maxWidth: 360, margin: "0 auto" }}>
              <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 28 }}>
                <div style={{ color: "#c9a84c", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, textAlign: "left" }}>Tu DNI</div>
                <input value={dni} onChange={e => setDni(e.target.value.toUpperCase())} onKeyDown={e => e.key === "Enter" && handleLogin()}
                  placeholder="ej. 47080502S"
                  style={{ width: "100%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, color: "#f5f2ee", fontSize: 18, padding: "14px 16px", outline: "none", fontFamily: "inherit", textAlign: "center", letterSpacing: 2, boxSizing: "border-box", marginBottom: 16 }} />
                <button onClick={handleLogin} disabled={!dni.trim()} style={{ ...s.goldBtn, opacity: dni.trim() ? 1 : 0.4 }}>Ver mi reserva ✨</button>
              </div>
              {step === "error" && <div style={{ marginTop: 16, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: 14, color: "#fca5a5", fontSize: 13 }}>⚠️ {errorMsg}</div>}
              <p style={{ color: "#5a4a3a", fontSize: 12, marginTop: 20 }}>¿Problemas? <a href="https://losviajesdemoli.com/contacto/" style={{ color: "#c9a84c" }}>Contacta con Lara</a></p>
            </div>
          </div>
        )}

        {step === "loading" && (
          <div style={{ textAlign: "center", paddingTop: 100 }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>✨</div>
            <div style={{ color: "#f5f2ee", fontSize: 16 }}>Buscando tu reserva...</div>
            <div style={{ color: "#7a6a50", fontSize: 13, marginTop: 8 }}>Conectando con la base de datos mágica 🏰</div>
          </div>
        )}

        {step === "portal" && cliente && (
          <div>
            <div style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 16, padding: "20px 24px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ color: "#c9a84c", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>¡Hola de nuevo!</div>
                <div style={{ color: "#f5f2ee", fontSize: 22 }}>{cliente.Nombre} 👋</div>
                <div style={{ color: "#8a7a6a", fontSize: 13, marginTop: 4 }}>Reserva nº {cliente["Numero reserva"]}</div>
              </div>
              {pendiente > 0 ? (
                <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: "12px 18px", textAlign: "center" }}>
                  <div style={{ color: "#fca5a5", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>⚠️ Pendiente</div>
                  <div style={{ color: "#f87171", fontSize: 22, fontWeight: 600 }}>{formatEuro(cliente.Pendiente)}</div>
                  {cliente["Fecha_límite_pago"] && <div style={{ color: "#9d8b78", fontSize: 11, marginTop: 4 }}>Límite: {cliente["Fecha_límite_pago"]}</div>}
                </div>
              ) : (
                <div style={{ background: "rgba(22,163,74,0.15)", border: "1px solid rgba(22,163,74,0.3)", borderRadius: 12, padding: "12px 18px" }}>
                  <div style={{ color: "#86efac", fontSize: 13 }}>✅ Todo pagado</div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 6, marginBottom: 20, overflowX: "auto" }}>
              {[{ id: "reserva", label: "🏰 Mi Reserva" }, { id: "pagos", label: "💰 Pagos" }, { id: "extras", label: "✨ Servicios" }, { id: "asistente", label: "💬 Asistente" }].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ background: activeTab === tab.id ? "linear-gradient(135deg, #c9a84c, #e8c97a)" : "rgba(255,255,255,0.05)", color: activeTab === tab.id ? "#1c1410" : "#8a7a6a", border: activeTab === tab.id ? "none" : "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "8px 18px", fontSize: 13, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", fontWeight: activeTab === tab.id ? 700 : 400 }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "reserva" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                  {[
                    { icon: "🏨", label: "Hotel", val: cliente.Hotel },
                    { icon: "🍽️", label: "Plan de comidas", val: cliente["Plan de comidas"] },
                    { icon: "📅", label: "Check-in", val: cliente["Check-in"] },
                    { icon: "📅", label: "Check-out", val: cliente["Check-out"] },
                    { icon: "👥", label: "Personas", val: cliente["Nº personas y edad niños"] },
                    { icon: "📍", label: "Dirección", val: cliente["Dirección"] },
                  ].map((item, i) => (
                    <div key={i} style={s.card}>
                      <div style={{ fontSize: 20, marginBottom: 6 }}>{item.icon}</div>
                      <div style={{ fontSize: 10, color: "#9d8b78", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 3 }}>{item.label}</div>
                      <div style={{ fontSize: 14, color: "#1c1410", fontWeight: 500 }}>{item.val || "—"}</div>
                    </div>
                  ))}
                </div>
                {cliente.Documentos && (
                  <a href={cliente.Documentos} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 12, padding: "16px 20px", textDecoration: "none" }}>
                    <span style={{ fontSize: 28 }}>📄</span>
                    <div>
                      <div style={{ color: "#c9a84c", fontSize: 13, fontWeight: 600 }}>Ver mi documento de reserva</div>
                      <div style={{ color: "#7a6a50", fontSize: 12 }}>Haz clic para abrir tu confirmación</div>
                    </div>
                    <span style={{ marginLeft: "auto", color: "#c9a84c", fontSize: 18 }}>→</span>
                  </a>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <a href={FORM_RESTAURANTES} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "14px 16px", textDecoration: "none" }}>
                    <span style={{ fontSize: 22 }}>🍽️</span>
                    <div><div style={{ color: "#f5f2ee", fontSize: 13 }}>Reservar restaurantes</div><div style={{ color: "#7a6a50", fontSize: 11 }}>Formulario de Lara</div></div>
                  </a>
                  <a href={FORM_MODIFICAR} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "14px 16px", textDecoration: "none" }}>
                    <span style={{ fontSize: 22 }}>✏️</span>
                    <div><div style={{ color: "#f5f2ee", fontSize: 13 }}>Modificar reserva</div><div style={{ color: "#7a6a50", fontSize: 11 }}>Traslados, extras...</div></div>
                  </a>
                </div>
              </div>
            )}

            {activeTab === "pagos" && (
              <div style={s.card}>
                <div style={{ fontSize: 11, color: "#c9a84c", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>💰 Estado de pagos</div>
                <PagoBar pagado={cliente.Pagado} total={cliente["Total (€)"]} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 20 }}>
                  {[
                    { label: "Total viaje", val: cliente["Total (€)"], bg: "#f9f7f4", color: "#1c1410" },
                    { label: "Pagado", val: cliente.Pagado, bg: "#f0fdf4", color: "#16a34a" },
                    { label: "Pendiente", val: cliente.Pendiente, bg: pendiente > 0 ? "#fef2f2" : "#f0fdf4", color: pendiente > 0 ? "#dc2626" : "#16a34a" },
                  ].map((item, i) => (
                    <div key={i} style={{ textAlign: "center", padding: 14, background: item.bg, borderRadius: 10 }}>
                      <div style={{ fontSize: 10, color: item.color, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{item.label}</div>
                      <div style={{ fontSize: 18, color: item.color, fontWeight: 600 }}>{formatEuro(item.val)}</div>
                    </div>
                  ))}
                </div>
                {cliente["Fecha_límite_pago"] && pendiente > 0 && (
                  <div style={{ marginTop: 16, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 16px", color: "#92400e", fontSize: 13 }}>
                    ⏰ Fecha límite: <strong>{cliente["Fecha_límite_pago"]}</strong>
                  </div>
                )}
              </div>
            )}

            {activeTab === "extras" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
                {[
                  { icon: "🚌", label: "Traslado", val: cliente.Traslado },
                  { icon: "🌙", label: "Noche extra", val: cliente["Noche extra"] },
                  { icon: "🗼", label: "Hotel París", val: cliente["Hotel Paris"] },
                  { icon: "🎢", label: "Actividades", val: cliente.Actividades },
                  { icon: "🛡️", label: "Seguro", val: cliente.Seguro },
                ].map((item, i) => (
                  <div key={i} style={{ ...s.card, opacity: item.val && item.val !== "0" ? 1 : 0.4 }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
                    <div style={{ fontSize: 10, color: "#9d8b78", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 15, color: "#1c1410", fontWeight: 500 }}>{item.val && item.val !== "0" ? formatEuro(item.val) : "No incluido"}</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "asistente" && (
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden" }}>
                <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #c9a84c, #e8c97a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🏰</div>
                  <div>
                    <div style={{ color: "#f5f2ee", fontSize: 14 }}>Asistente de Lara</div>
                    <div style={{ color: "#4caf50", fontSize: 11 }}>● Conoce tu reserva</div>
                  </div>
                </div>
                <div style={{ height: 320, overflowY: "auto", padding: 16 }}>
                  {messages.map((msg, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: 12 }}>
                      <div style={{ maxWidth: "80%", background: msg.role === "user" ? "linear-gradient(135deg, #c9a84c, #e8c97a)" : "rgba(255,255,255,0.08)", color: msg.role === "user" ? "#1c1410" : "#e8e0d4", borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", padding: "11px 15px", fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div style={{ display: "flex", gap: 5, padding: "8px 12px", background: "rgba(255,255,255,0.08)", borderRadius: "18px 18px 18px 4px", width: "fit-content" }}>
                      {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#c9a84c", animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
                <div style={{ padding: "8px 12px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 6, overflowX: "auto" }}>
                  {["¿Qué incluye mi plan?", "¿Qué restaurantes me recomiendas?", "¿Cuánto me falta pagar?", "¿Qué necesito para el viaje?"].map((q, i) => (
                    <button key={i} onClick={() => setChatInput(q)} style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 20, padding: "5px 12px", color: "#c9a84c", fontSize: 11, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}>{q}</button>
                  ))}
                </div>
                <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 8 }}>
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleChat()} placeholder="Escribe tu pregunta..." disabled={chatLoading}
                    style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#f5f2ee", fontSize: 13, padding: "10px 14px", outline: "none", fontFamily: "inherit" }} />
                  <button onClick={handleChat} disabled={chatLoading || !chatInput.trim()} style={{ background: chatInput.trim() && !chatLoading ? "linear-gradient(135deg, #c9a84c, #e8c97a)" : "rgba(255,255,255,0.05)", color: chatInput.trim() && !chatLoading ? "#1c1410" : "#5a4a3a", border: "none", borderRadius: 10, width: 40, height: 40, fontSize: 16, cursor: "pointer" }}>➤</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <style>{`@keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }`}</style>
    </div>
  );
}
