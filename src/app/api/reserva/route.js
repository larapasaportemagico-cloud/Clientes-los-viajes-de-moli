const handleLogin = async () => {
    if (!dni.trim()) return;
    setStep("loading");
    try {
      const res = await fetch(`/api/reserva?dni=${encodeURIComponent(dni.trim())}`);
      const result = await res.json();
      if (result.encontrado) {
        setCliente(result.reserva);
        setStep("portal");
        setChatLoading(true);
        const chatRes = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: "Hola, acabo de entrar a mi portal" }],
            system: SYSTEM_ASISTENTE.replace("{DATOS_CLIENTE}", JSON.stringify(result.reserva)),
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
