"use client";
import { useState, useRef, useEffect } from "react";

const FORM_RESTAURANTES = "https://docs.google.com/forms/d/e/1FAIpQLSf1H3c9HZ5JrAHSe36ys-zjM3ZCYrj47v6QXnLXui2xrMpKeQ/viewform";
const FORM_MODIFICAR = "https://docs.google.com/forms/d/e/1FAIpQLScSaC2-3EZTQCOemTG4PrnxbiNUH6R0eFuDGZaZsroNB0-FTA/viewform";
const FORM_PAGOS = "https://forms.gle/t5QaxnEuFqL6SCHQ9";

const SYSTEM_ASISTENTE = `Eres MOLI, el hada madrina virtual del Área Mágica del Viajero de LOS VIAJES DE MOLI.

Tu saludo inicial debe ser:
"✨ Hola, soy Moli, tu hada madrina de Los Viajes de Moli.

Estoy aquí para ayudarte con las dudas más frecuentes de tu viaje: planes de comidas, restaurantes, pagos, modificaciones, extras, documentación, consejos para familias y mucho más.

Cuéntame qué necesitas y haré todo lo posible para ayudarte de la forma más mágica posible 🪄

⚠️ Recuerda que es muy importante que reserves tus restaurantes cuanto antes, especialmente los que incluyen personajes. Y si deseas realizar la experiencia My Royal Dream, ¡también se agota muy rápido! Ambas reservas se realizan a través de la app de Disneyland Paris desde 7 días antes, aunque te recomiendo revisar desde 15 días antes."

Tienes acceso a los datos REALES del cliente. Úsalos para personalizar tus respuestas.
Hablas en nombre de Los Viajes de Moli.
Siempre respondes en español.

DATOS DEL CLIENTE:
{DATOS_CLIENTE}

FORMULARIOS:
Restaurantes: ${FORM_RESTAURANTES}
Modificar reserva: ${FORM_MODIFICAR}

---

INFORMACIÓN IMPORTANTE SOBRE EL PORTAL Y LA APP DE DISNEYLAND PARIS:

En el portal del viajero solo aparece la reserva del paquete (hotel + entradas).
Las entradas, el plan de comidas y las comidas especiales NO se muestran en el portal ni en la app de Disneyland Paris hasta aproximadamente 7 días antes del viaje.
A partir de ese momento aparecerán automáticamente en la app de Disneyland Paris.
Toda la información detallada está en el bono de reserva que Lara envía al cliente.
Si el cliente pregunta por qué no ve su plan de comidas o entradas en la app, explicarle esto con tranquilidad.

---

PLANES DE COMIDAS — PRECIOS POR PERSONA Y NOCHE (válido hasta marzo 2027)

Solo se pueden contratar si el cliente está alojado en un Hotel Disney oficial.
Se contratan para todas las personas (mayores de 3 años) y todas las noches.
Se pueden añadir o modificar hasta 7 días antes de la llegada desde la app o llamando al 901 51 55 55.
NO se pueden comprar una vez en el parque.

SOLO DESAYUNO (precio varía según hotel):
- Davy Crockett Ranch (para llevar): Adulto 14€ / Niño 14€
- Davy Crockett Ranch (buffet, 4 may - 30 ago): Adulto 22€ / Niño 18€
- Santa Fe: Adulto 22€ / Niño 18€
- Cheyenne: Adulto 25€ / Niño 20€
- Sequoia Lodge / Newport Bay Club: Adulto 30€ / Niño 24€
- Hotel New York – The Art of Marvel: Adulto 32€ / Niño 26€
- Disneyland Hotel: Adulto 45€ / Niño 36€

STANDARD (solo en Davy Crockett y Santa Fe):
- Media pensión: Adulto 55€ / Niño 35€
- Pensión completa: Adulto 75€ / Niño 45€
Una comida por noche debe ser en restaurante de servicio rápido en pensión completa.
Bono REGALO de PC Standard: 1 bono comida rápida extra.

SMART (solo Sequoia Lodge y Newport Bay, hab. standard/superior, solo PC):
- Pensión completa: Adulto 80€ / Niño 35€
Solo incluye restaurantes de esos hoteles y Disney Village. NO incluye restaurantes de los parques.

PLUS (todos los hoteles excepto Disneyland Hotel):
- Media pensión, hab. standard: Adulto 65€ / Niño 40€
- Media pensión, hab. club/suite: Adulto 45€ / Niño 23€
- Pensión completa, hab. standard: Adulto 115€ / Niño 60€
- Pensión completa, hab. club/suite: Adulto 95€ / Niño 46€
Bono REGALO de PC Plus: 1 bono comida/cena buffet o mesa extra.

EXTRA PLUS (todos los hoteles excepto Disneyland Hotel, solo PC):
- Pensión completa, hab. standard: Adulto 150€ / Niño 80€
- Pensión completa, hab. club/suite: Adulto 130€ / Niño 66€
Incluye: 1 comida con personajes por estancia (Auberge de Cendrillon, The Regal View o Royal Banquet) + snack y bebida extra por noche + bebida extra por noche.
Bono REGALO de PC Extra Plus: 1 bono comida/cena buffet o mesa extra.

PREMIUM (solo Disneyland Hotel):
- Media pensión, hab. standard: Adulto 135€ / Niño 75€
- Media pensión, hab. club/suite: Adulto 90€ / Niño 42€
- Pensión completa, hab. standard: Adulto 245€ / Niño 135€
- Pensión completa, hab. club/suite: Adulto 200€ / Niño 100€
Incluye TODAS las comidas con personajes sin extra (Auberge de Cendrillon, Regal View, Royal Banquet, La Table de Lumière).
Bono REGALO de PC Premium: 1 bono comida/cena buffet o mesa extra.

FLEXIBILIDAD DE BONOS — MUY IMPORTANTE:
Los bonos NO caducan cada día. El cliente puede distribuirlos como quiera durante toda la estancia.
Ejemplos: puede usar 2 bonos buffet un día y ninguno otro. Puede acumularlos para una cena especial. Con MP puede un día no usar ningún bono y otro usar 2. Total libertad.
NO es obligatorio consumir el plan completo cada día.

DESAYUNO — SIEMPRE EN EL HOTEL:
El desayuno SIEMPRE se toma en el hotel. No hay desayuno en los parques.
Cada hotel tiene su restaurante de desayuno incluido en el precio de la habitación o con plan de desayuno.
Los hoteles con hab. Club/Suite incluyen desayuno en su lounge exclusivo.

DESAYUNOS CON PERSONAJES:
NO están incluidos en ningún plan de comidas.
Se pueden añadir pagando suplemento.
EXCEPCIÓN: huéspedes de Castle Club o Suite del Disneyland Hotel desayunan en el Castle Club Lounge CON personajes incluido.
Solo la pensión premium del Disneyland Hotel en categoría Suite o Castle Club tiene desayuno con princesas incluido.
El resto siempre con suplemento, distinto según hotel.
Precio desayuno con princesas: Adulto 60€ / Niño 40€.

NIÑOS EN LOS PLANES:
- Precio niño: de 3 a 11 años. A partir de 12 años se paga como adulto.
- Menores de 3 años: NO incluidos en los planes. Comen GRATIS. Pueden comer del plato de los demás o de lo que lleven.

QUÉ INCLUYE CADA COMIDA:
- Desayuno buffet: ilimitado + bebida.
- Buffet comida/cena: ilimitado + bebida sin alcohol para todos.
- Restaurante de mesa: entrante + principal + postre. Bebida incluida solo para niños. Adultos pagan aparte (pueden pedir jarra de agua del grifo gratis).
- Servicio rápido: principal + acompañante + bebida. Postre solo para niños.

RESTAURANTES NO INCLUIDOS EN NINGÚN PLAN:
McDonald's, Rainforest Cafe, Brasserie Rosalie, Royal Pub, Starbucks, Earl of Sandwich, Five Guys y Vapiano (todos en Disney Village).
Billy Bob's Country Western Saloon y Steakhouse de Disney Village SÍ están incluidos.

ATENCIÓN LUCKY NUGGET SALOON:
Es comida rápida pero con mesas. El sistema descuenta bono de buffet/mesa — NO es rentable.
Solicitar pagar con bono de comida rápida y abonar suplemento si hay diferencia.

SUPLEMENTOS COMIDAS ESPECIALES (sin plan o fuera del plan):
- Desayuno con princesas: Adulto 60€ / Niño 40€ (solo en Auberge de Cendrillon y The Regal View, en horario Extra Magic Time)
- Auberge de Cendrillon (comida): Adulto 100€ / Niño 50€
- The Regal View (comida/cena): Adulto 100€ / Niño 50€
- Royal Banquet (comida/cena): Adulto 100€ / Niño 50€
- La Table de Lumière (solo cena): Adulto 120€ / Niño 60€

REGLAS CÁLCULO CAMBIO DE PLAN:
Si el cliente quiere cambiar de plan, calcular la diferencia:
(nuevo precio adulto - actual adulto) x nº adultos x noches
+
(nuevo precio niño - actual niño) x nº niños x noches
Siempre indicar: "Este importe es aproximado. El precio final actualizado aparecerá en tu hoja de reserva."

---

PAGOS:

Los pagos se realizan mediante transferencia o ingreso bancario a la cuenta de la agencia.
En algunos casos puede haber opción de tarjeta, pero debe consultarse.
Todos los pagos se descuentan del total de la reserva, incluidos los 200€ iniciales de formalización.
Los Viajes de Moli nunca entra en contacto directo con el dinero. La labor de Lara es gestionar las reservas y los abonos.
Aunque existan distintos proveedores (paquete Disney, hotel en París, traslados, extras), normalmente los pagos en Europa se realizan al mismo número de cuenta de la agencia.
Se recomienda realizar el pago total antes de los 30 días previos al viaje.
Los justificantes deben enviarse mediante el formulario de pagos: ${FORM_PAGOS}
Si el cliente pregunta cómo enviar un justificante o hacer un pago, dirigirle a ese formulario.
Los datos del portal son orientativos y puede haber algún dato pendiente de actualización. La información definitiva es siempre la de la hoja de reserva actualizada.

---

TRASLADOS:

Los traslados no pueden reservarse correctamente hasta disponer de toda la información de vuelos.

Datos necesarios para reservar traslado:
- Aeropuerto de llegada y salida
- Número de vuelo (ida y vuelta)
- Horarios de llegada y salida
- Número de personas
- Hotel de destino
- Si viajan menores de 3 años
- Si necesitan silla ACM

Precios aproximados:
Charles de Gaulle → Disneyland Paris:
- Hasta 4 personas: 87€
- Hasta 8 personas: 124€

Orly → Disneyland Paris:
- Hasta 4 personas: 95€
- Hasta 8 personas: 128€

Si viaja un menor de 3 años con silla ACM: normalmente se necesita VAN de 8 plazas aunque sean menos personas.
Los traslados nocturnos pueden tener suplemento aproximado de 12€.
Los traslados hacia París pueden variar algunos euros según dirección y condiciones.
Los traslados suelen recoger aproximadamente 3 o 3,5 horas antes del vuelo de regreso.
Siempre indicar: "El precio es aproximado y debe confirmarse al reservar el traslado."

Si el cliente quiere reservar traslado, dirigirle al formulario de modificar reserva: ${FORM_MODIFICAR}

---

RESTAURANTES:

La reserva de restaurantes no es inmediata.
Se recomienda leer primero la mini guía incluida en la reserva.

Consejos:
- Reservar con antelación, especialmente restaurantes con personajes.
- Dejar noches flexibles.
- Priorizar buffet con niños pequeños (más rápido y variado).
- Los restaurantes de mesa son más lentos, mejor sin prisas.
- Los restaurantes de servicio rápido no se reservan.
- Reservar más restaurantes de los necesarios para decidir después cuáles usar.
- En grupos grandes puede ser necesario dividir el grupo.
- Todas las personas de la reserva deben tener el mismo plan de comidas y la misma comida especial.
- Las sillas infantiles normalmente se dejan fuera del restaurante.

Si el cliente quiere reservar restaurantes, dirigirle al formulario: ${FORM_RESTAURANTES}

---

SEGUROS DE VIAJE:

Se recomienda contratar el seguro en el momento de realizar la primera reserva o vuelos.
Si están dentro de los primeros 7 días desde la reserva: recomendar IATI.
Si ya han pasado más de 7 días: Heymondo permite añadir ciertas coberturas de anulación.
Aunque tengan seguro privado o tarjeta sanitaria europea, el seguro de viaje sigue siendo muy recomendable.

ENLACES SEGUROS:
🛡️ IATI: https://www.iatiseguros.com/?r=89568165155642&cmp=losviajesdemoli
🛡️ Heymondo: https://heymondo.es/?utm_medium=Afiliado&utm_source=LOSVIAJESDEMOLI&utm_campaign=PRINCIPAL&cod_descuento=LOSVIAJESDEMOLI&ag_campaign=ENTRADA&agencia=xQ0D8aBrpiAfSWCniUfqBemoXeawv04AgzuECLt7

---

PERSONAJES Y EXPERIENCIAS ESPECIALES:

NO hay comidas con superhéroes.
Los huéspedes del Hotel New York – The Art of Marvel tienen encuentros exclusivos con superhéroes que se reservan desde 7 días antes de la visita a través de la app.
En Campus Avengers hay encuentro con Spider-Man o un superhéroe al azar (no requiere reserva de comida).

COMIDAS CON PERSONAJES DISPONIBLES ACTUALMENTE:
- Desayuno con princesas: en Auberge de Cendrillon o The Regal View. Solo en horario Extra Magic Time (huéspedes hotel Disney o Disneyland Pass Gold).
- Plaza Gardens está CERRADO actualmente.
- Royal Banquet (Hotel Disneyland): comida y cena con personajes. Normalmente Mickey y Minnie vestidos con ropa principesca. Se intercambian Pluto y Goofy con Donald y Daisy. En cena suelen estar Donald y Daisy; en comida Pluto y Goofy.
- Auberge de Cendrillon: comida y según época también cena. Actualmente incluye a Mickey y en alguna ocasión Minnie en su lugar.
- The Regal View: comida y según época también cena.
- La Table de Lumière (Hotel Disneyland): cena con príncipes y princesas. Ya está abierta a todos.

MY ROYAL DREAM:
Experiencia muy especial y muy solicitada — se agota con mucha facilidad.
Precio aproximado: desde 149€ por niño.
Solo se puede reservar a través de la app de Disneyland Paris, 7 días antes (conviene revisar desde 15 días antes).
Lara no tiene posibilidad de reservarlo directamente.

PREMIER ACCESS:
Se puede añadir el pase Premier Access, pero no incluye todas las atracciones, solo algunas.

TARJETA POR DISCAPACIDAD:
Se solicita a través de la web 1 mes antes, aunque se finaliza el trámite en el propio hotel con foto e impresión de la tarjeta.
Da acceso a la persona portadora y hasta 4 acompañantes. En shows nocturnos: la persona y 2 acompañantes.

TARJETA POR ENFERMEDAD:
Se tramita directamente en el parque con un certificado médico que acredite enfermedad de larga duración.

CUMPLEAÑOS:
- Pueden solicitar una chapa de cumpleaños en City Hall.
- Se puede encargar una tarta: para 2-4 personas o hasta 8 personas. La caja de Frozen cuesta 189€.

TIEMPO Y CLIMA:
El tiempo en Disneyland Paris es muy inestable. No preocuparse por las previsiones de días previos al viaje.

---

NOCHES EXTRA Y HOTELES:
Los clientes pueden añadir noches extra en un Hotel Disney siempre que no sea en paquete con vuelos.
Hoteles asociados Disney: comparten autobús (muy lleno), no llegan a tiempo para hora extra de apertura (usar Uber), parking diario ~15€, tasas turísticas.

PARA VISITAR PARÍS:
- Tour privado en coche de ~3h por 350€ (sin traslado a París incluido).
- Muy recomendable el día de llegada: recogen en aeropuerto, veis París y os dejan en Hotel Disney.

---

CONTACTO:
lara@pasaportemagico.com`;

// ═══════════════════════════════════════════════════════
// CALENDARIO HORARIOS ESTIMADOS DISNEYLAND PARIS 2026
// Basado en el calendario de Los Viajes de Moli
// ═══════════════════════════════════════════════════════
const HORARIOS_2026 = {
  // ENERO: negro=20h semana 1, verde=21h resto, rojo=20-21 semana 19-25
  "2026-01-01":"20:00","2026-01-02":"20:00","2026-01-03":"20:00","2026-01-04":"20:00",
  "2026-01-05":"21:00","2026-01-06":"21:00","2026-01-07":"21:00","2026-01-08":"21:00","2026-01-09":"21:00","2026-01-10":"21:00","2026-01-11":"21:00",
  "2026-01-12":"21:00","2026-01-13":"21:00","2026-01-14":"21:00","2026-01-15":"21:00","2026-01-16":"21:00","2026-01-17":"21:00","2026-01-18":"21:00",
  "2026-01-19":"20:00-21:00","2026-01-20":"20:00-21:00","2026-01-21":"20:00-21:00","2026-01-22":"20:00-21:00","2026-01-23":"20:00-21:00","2026-01-24":"20:00-21:00","2026-01-25":"20:00-21:00",
  "2026-01-26":"21:00","2026-01-27":"21:00","2026-01-28":"21:00","2026-01-29":"21:00","2026-01-30":"21:00","2026-01-31":"21:00",
  // FEBRERO
  "2026-02-02":"21:00","2026-02-03":"21:00","2026-02-04":"21:00","2026-02-05":"21:00","2026-02-06":"21:00","2026-02-07":"21:00","2026-02-08":"21:00",
  "2026-02-09":"20:00-21:00","2026-02-10":"20:00-21:00","2026-02-11":"20:00-21:00","2026-02-12":"20:00-21:00","2026-02-13":"20:00-21:00","2026-02-14":"20:00-21:00","2026-02-15":"20:00-21:00",
  "2026-02-16":"21:00","2026-02-17":"21:00","2026-02-18":"21:00","2026-02-19":"21:00","2026-02-20":"21:00","2026-02-21":"21:00","2026-02-22":"21:00",
  "2026-02-23":"21:00","2026-02-24":"21:00","2026-02-25":"21:00","2026-02-26":"21:00","2026-02-27":"21:00","2026-02-28":"21:00",
  // MARZO
  "2026-03-01":"21:00","2026-03-02":"21:00","2026-03-03":"21:00","2026-03-04":"21:00","2026-03-05":"21:00","2026-03-06":"21:00","2026-03-07":"21:00","2026-03-08":"21:00",
  "2026-03-09":"21:00","2026-03-10":"21:00","2026-03-11":"21:00","2026-03-12":"21:00","2026-03-13":"21:00","2026-03-14":"21:00","2026-03-15":"21:00",
  "2026-03-16":"20:00-21:00","2026-03-17":"20:00-21:00","2026-03-18":"20:00-21:00","2026-03-19":"20:00-21:00","2026-03-20":"20:00-21:00","2026-03-21":"20:00-21:00","2026-03-22":"20:00-21:00",
  "2026-03-23":"22:00","2026-03-24":"22:00","2026-03-25":"22:00","2026-03-26":"22:00","2026-03-27":"22:00","2026-03-28":"22:00","2026-03-29":"22:00",
  "2026-03-30":"22:40","2026-03-31":"22:40",
  // ABRIL
  "2026-04-01":"22:40","2026-04-02":"22:40","2026-04-03":"22:40","2026-04-04":"22:40","2026-04-05":"22:40",
  "2026-04-06":"22:40","2026-04-07":"22:40","2026-04-08":"22:40","2026-04-09":"22:40","2026-04-10":"22:40","2026-04-11":"22:40","2026-04-12":"22:40",
  "2026-04-13":"22:40","2026-04-14":"22:40","2026-04-15":"22:40","2026-04-16":"22:40","2026-04-17":"22:40","2026-04-18":"22:40","2026-04-19":"22:40",
  "2026-04-20":"22:40","2026-04-21":"22:40","2026-04-22":"22:40","2026-04-23":"22:40","2026-04-24":"22:40","2026-04-25":"22:40","2026-04-26":"22:40",
  "2026-04-27":"22:40","2026-04-28":"22:40","2026-04-29":"22:40","2026-04-30":"22:40",
  // MAYO-AGOSTO: todo 22:40
  ...(()=>{const d={};for(let m=5;m<=8;m++){const days=m===8?31:m===5||m===7?31:30;for(let i=1;i<=days;i++){d[`2026-0${m}-${String(i).padStart(2,'0')}`]="22:40";}}return d;})(),
  // SEPTIEMBRE: 1-20 → 22:40, 21-30 → 22:00
  ...(()=>{const d={};for(let i=1;i<=20;i++)d[`2026-09-${String(i).padStart(2,'0')}`]="22:40";for(let i=21;i<=30;i++)d[`2026-09-${String(i).padStart(2,'0')}`]="22:00";return d;})(),
  // OCTUBRE: 1-18 → 22:00, 19-31 → 21:00
  ...(()=>{const d={};for(let i=1;i<=18;i++)d[`2026-10-${String(i).padStart(2,'0')}`]="22:00";for(let i=19;i<=31;i++)d[`2026-10-${String(i).padStart(2,'0')}`]="21:00";return d;})(),
  // NOVIEMBRE: todo 21:00
  ...(()=>{const d={};for(let i=1;i<=30;i++)d[`2026-11-${String(i).padStart(2,'0')}`]="21:00";return d;})(),
  // DICIEMBRE: 1-20 → 21:00, 21-31 → 22:40 (Navidad)
  ...(()=>{const d={};for(let i=1;i<=20;i++)d[`2026-12-${String(i).padStart(2,'0')}`]="21:00";for(let i=21;i<=31;i++)d[`2026-12-${String(i).padStart(2,'0')}`]="22:40";return d;})(),
};

function getHorario(dateStr) { return HORARIOS_2026[dateStr] || "21:00"; }
function getDayOfWeek(dateStr) { return new Date(dateStr + 'T12:00:00').getDay(); }
function isAltaDemanda(dateStr) { return [0,3,5,6].includes(getDayOfWeek(dateStr)); }
function isMiercoles(dateStr) { return getDayOfWeek(dateStr) === 3; }
function getDatesInRange(start, end) {
  const dates=[]; const cur=new Date(start+'T12:00:00'); const last=new Date(end+'T12:00:00');
  while(cur<last){dates.push(cur.toISOString().split('T')[0]);cur.setDate(cur.getDate()+1);}
  return dates;
}
function formatDateEs(dateStr) {
  const d=new Date(dateStr+'T12:00:00');
  const days=['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  const months=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return `${days[d.getDay()]} ${d.getDate()} de ${months[d.getMonth()]}`;
}

// ═══════════════════════════════════════════════════════
// HELPERS PLAN DE COMIDAS
// ═══════════════════════════════════════════════════════
function parsePlan(planStr) {
  if (!planStr) return null;
  const p = planStr.toLowerCase();
  if (p.includes('premium')) return 'premium';
  if (p.includes('extra plus') || p.includes('extra-plus')) return 'extra_plus';
  if (p.includes('plus')) return 'plus';
  if (p.includes('smart')) return 'smart';
  if (p.includes('standard') || p.includes('estándar')) return 'standard';
  if (p.includes('media') || p.includes('mp')) return 'media';
  return null;
}

function parseNoches(checkin, checkout) {
  if (!checkin || !checkout) return 0;
  return getDatesInRange(checkin, checkout).length;
}

function calcBonos(planTipo, noches) {
  switch(planTipo) {
    case 'media':
      return { mesa: noches, rapido: 0, regalo: 0, tipoRegalo: null,
        desc: `${noches} bono${noches>1?'s':''} buffet/mesa` };
    case 'standard':
      return { mesa: noches, rapido: noches, regalo: 1, tipoRegalo: 'rapido',
        desc: `${noches} bono${noches>1?'s':''} rápido + ${noches} bono${noches>1?'s':''} buffet/mesa + 1 rápido de regalo` };
    case 'smart':
      return { mesa: noches*2, rapido: 0, regalo: 1, tipoRegalo: 'mesa',
        desc: `${noches*2} bonos buffet/mesa + 1 de regalo (solo hoteles Sequoia/Newport y Disney Village)` };
    case 'plus':
    case 'extra_plus':
    case 'premium':
      return { mesa: noches*2, rapido: 0, regalo: 1, tipoRegalo: 'mesa',
        desc: `${noches*2} bonos buffet/mesa + 1 de regalo`,
        extra: planTipo === 'extra_plus' ? '+ 1 comida con personajes incluida por estancia' :
               planTipo === 'premium' ? '+ TODAS las comidas con personajes incluidas' : '' };
    default:
      return null;
  }
}

function getDesayunoHotel(hotel) {
  const h = (hotel||'').toLowerCase();
  if (h.includes('disneyland hotel') || h.includes('castle')) return {
    rest: 'Royal Banquet / Deluxe Lounge / Castle Club Lounge',
    tipo: 'Buffet incluido en tarifa o lounge exclusivo según categoría',
    cena: 'La Table de Lumière (cena con Princesas) · Royal Banquet (comida/cena con personajes) · Fleur de Lys Bar',
    nota: 'Los restaurantes del hotel abren para cenas a partir de las 18h aprox.'
  };
  if (h.includes('new york') || h.includes('marvel')) return {
    rest: 'Downtown Restaurant',
    tipo: 'Buffet completo (incluido en Empire State Club y Suites)',
    cena: 'Manhattan Restaurant (a la carta · solo cenas) · Downtown Restaurant (buffet) · Skyline Bar · Bleecker Street Lounge',
    nota: '⭐ Al alojarte en el Hotel New York – Marvel podemos solicitar a Disney mesa en el Downtown Restaurant. Si no hay disponibilidad habrá que ir revisando la app. Los restaurantes del hotel abren para cenas a partir de las 18h aprox.'
  };
  if (h.includes('newport')) return {
    rest: 'Cape Cod ⭐ (favorito de Lara para familias con bebés)',
    tipo: 'Buffet completo (incluido en Compass Club y Suites)',
    cena: 'Yacht Club (a la carta) · Cape Cod (buffet) · Captain\'s Quarters (bar)',
    nota: 'Los restaurantes del hotel abren para cenas a partir de las 18h aprox.'
  };
  if (h.includes('sequoia')) return {
    rest: "Hunter's Grill & Beaver Creek Tavern",
    tipo: 'Buffet completo (incluido en Golden Forest Club y Suites)',
    cena: "Hunter's Grill & Beaver Creek Tavern (buffet cena) · Redwood Bar and Lounge",
    nota: 'Los restaurantes del hotel abren para cenas a partir de las 18h aprox.'
  };
  if (h.includes('cheyenne')) return {
    rest: 'Chuck Wagon Cafe',
    tipo: 'Buffet completo',
    cena: 'Chuck Wagon Cafe (buffet cena) · Red Garter Saloon · Starbucks',
    nota: 'Los restaurantes del hotel abren para cenas a partir de las 18h aprox.'
  };
  if (h.includes('santa fe')) return {
    rest: 'La Cantina',
    tipo: 'Buffet completo (con opciones veganas)',
    cena: 'La Cantina (buffet cena) · Rio Grande Bar · Starbucks',
    nota: 'Los restaurantes del hotel abren para cenas a partir de las 18h aprox.'
  };
  if (h.includes('davy') || h.includes('crockett')) return {
    rest: "Crockett's Tavern / Para llevar",
    tipo: 'Desayuno para llevar o buffet (temporada)',
    cena: "Crockett's Tavern (buffet cena) · Crockett's Saloon",
    nota: 'Los restaurantes del hotel abren para cenas a partir de las 18h aprox. Recuerda que el ranch requiere vehículo propio para ir al parque.'
  };
  return {
    rest: 'Restaurante del hotel',
    tipo: 'Buffet según hotel',
    cena: 'Restaurante principal del hotel',
    nota: 'Los restaurantes del hotel abren para cenas a partir de las 18h aprox.'
  };
}

// ═══════════════════════════════════════════════════════
// FORMATEADORES
// ═══════════════════════════════════════════════════════
// ═══ HELPERS DE PAGOS — maneja texto, números y combinaciones ═══

// Extrae número(s) de un valor mixto: "200", "200€", "200+150", "500 - falta recibo" → número total
function extractNumber(val) {
  if (!val && val !== 0) return 0;
  const str = String(val).replace(/€/g, '').replace(/\s/g, '');
  const nums = str.match(/\d+([.,]\d+)?/g);
  if (!nums) return 0;
  return nums.reduce((acc, n) => acc + parseFloat(n.replace(',', '.')), 0);
}

// ¿Contiene texto significativo además del número?
function hasText(val) {
  if (!val && val !== 0) return false;
  const str = String(val).trim();
  if (!str || str === '0') return false;
  return str.replace(/[\d€+\-.,\s]/g, '').trim().length > 0;
}

// Formatea un número como euros
function formatEuro(val) {
  if (!val && val !== 0) return "0,00 €";
  const num = extractNumber(val);
  if (!num && !hasText(val)) return "0,00 €";
  if (!num) return String(val);
  return num.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

// Renderiza valor de pago: muestra número formateado + texto visible si lo hay
function PagoValor({ val, colorNum = "#1c1410", colorTxt = "#7a6a50", size = 18 }) {
  if (!val && val !== 0) return <span style={{ color:"#bbb" }}>—</span>;
  const str = String(val).trim();
  if (!str || str === "0") return <span style={{ color:"#bbb" }}>—</span>;
  const num = extractNumber(val);
  const texto = hasText(val);
  return (
    <span>
      {num > 0 && (
        <strong style={{ color:colorNum, fontSize:size }}>
          {num.toLocaleString("es-ES", { style:"currency", currency:"EUR" })}
        </strong>
      )}
      {texto && (
        <span style={{ color:colorTxt, fontSize:"0.75em", display:"block", marginTop:2, fontStyle:"italic" }}>
          📝 {str}
        </span>
      )}
      {!num && !texto && <span style={{ color:"#bbb" }}>—</span>}
    </span>
  );
}

function PagoBar({ pagado, total }) {
  const p = extractNumber(pagado);
  const t = extractNumber(total) || 1;
  const pct = Math.min(100, Math.round((p / t) * 100));
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#7a6a50", marginBottom:6 }}>
        <span>Pagado: <strong style={{ color:"#16a34a" }}>{p.toLocaleString("es-ES",{style:"currency",currency:"EUR"})}</strong></span>
        <span>{pct}%</span>
      </div>
      <div style={{ background:"#e8e0d5", borderRadius:20, height:8 }}>
        <div style={{ width:`${pct}%`, height:"100%", background: pct===100 ? "#16a34a" : "linear-gradient(90deg, #c9a84c, #e8c97a)", borderRadius:20 }} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// PLANIFICADOR DE RESTAURANTES
// ═══════════════════════════════════════════════════════
function PlanificadorRestaurantes({ cliente }) {
  const [prefs, setPrefs] = useState({});
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const resultRef = useRef(null);

  const planTipo = parsePlan(cliente?.["Plan de comidas"]);
  const noches = parseNoches(cliente?.["Check-in"], cliente?.["Check-out"]);
  const bonos = calcBonos(planTipo, noches);
  const desayuno = getDesayunoHotel(cliente?.Hotel);
  const dates = getDatesInRange(cliente?.["Check-in"]||"", cliente?.["Check-out"]||"");

  // Parse personas
  const personasStr = cliente?.["Nº personas y edad niños"] || "";
  const adultos = parseInt(personasStr.match(/(\d+)\s*adulto/i)?.[1] || "2");
  const ninos = parseInt(personasStr.match(/(\d+)\s*ni[ñn]/i)?.[1] || "0");
  const bebes = parseInt(personasStr.match(/(\d+)\s*(beb[eé]|menor)/i)?.[1] || "0");
  const totalPax = adultos + ninos + bebes;

  const setPref = (group, val) => setPrefs(p => ({ ...p, [group]: val }));

  const prefsCompletas = ['personajes','reserva','estilo'].every(k => prefs[k]);

  const prefGroups = [
    { key:'personajes', label:'👑 ¿Queréis comer con personajes?', opts:[
      { val:'si', label:'✅ Sí, imprescindible' },
      { val:'si-si-hay', label:'Si hay disponibilidad' },
      { val:'no', label:'No nos importa' }
    ]},
    { key:'reserva', label:'📅 ¿Preferís tener las comidas reservadas o ir libremente?', opts:[
      { val:'reservado', label:'📋 Todo reservado y organizado' },
      { val:'flexible', label:'🎯 Solo reservar lo especial' },
      { val:'libre', label:'🆓 Sin reservas, total libertad' },
    ]},
    { key:'estilo', label:'🍽️ ¿Preferís buffet o carta?', opts:[
      { val:'buffet', label:'🥗 Buffet — variedad y sin esperas' },
      { val:'carta', label:'📖 Carta — elegir el menú' },
      { val:'indiferente', label:'😊 Nos da igual' },
    ]},
    { key:'dieta', label:'🌿 ¿Alguna restricción alimentaria?', opts:[
      { val:'ninguna', label:'Ninguna' },
      { val:'vegetariano', label:'Vegetariano/vegan' },
      { val:'alergias', label:'Alergias' },
      { val:'sin-gluten', label:'Sin gluten' },
    ]},
  ];

  const accentColors = { personajes:'#5B2D8E', reserva:'#F5287A', estilo:'#2BBCD4', dieta:'#F0A500' };

  async function generarPlan() {
    if (!prefsCompletas) return;
    setLoading(true); setPlan(null);

    const diasInfo = dates.map(date => ({
      fecha: formatDateEs(date),
      cierre: getHorario(date),
      alta: isAltaDemanda(date),
      mierc: isMiercoles(date),
    }));

    const prompt = `Eres el asistente de restaurantes de "Los Viajes de Moli", agencia oficial Disney de España. Crea un plan de restaurantes COMPLETO, personalizado y práctico.

DATOS DE LA RESERVA:
- Nombre: ${cliente?.Nombre}
- Hotel: ${cliente?.Hotel}
- Plan de comidas: ${cliente?.["Plan de comidas"] || "sin plan"}
- Fechas: ${cliente?.["Check-in"]} al ${cliente?.["Check-out"]} (${noches} noches · ${dates.length} días en parque)
- Adultos: ${adultos} · Niños 3-11 años: ${ninos} · Bebés <3 años: ${bebes}${bebes>0?' (comen GRATIS en todos los restaurantes Disney)':''}
- Total personas: ${totalPax}

RESUMEN DE BONOS — explícalo así de claro:
${(() => {
  const plan = (cliente?.["Plan de comidas"]||'').toLowerCase();
  const hotel = (cliente?.Hotel||'').toLowerCase();
  const esSantaFeDavy = hotel.includes('santa fe') || hotel.includes('davy') || hotel.includes('crockett');

  if (!plan || plan === 'sin plan') {
    return 'Sin plan de comidas contratado. Paga cada comida en el momento.';
  }
  if (plan.includes('solo desayuno') || plan === 'desayuno') {
    return `Solo Desayuno: ${noches} desayunos buffet en el hotel incluidos. Comidas y cenas se pagan aparte.`;
  }
  if (plan.includes('media') || plan === 'mp') {
    if (esSantaFeDavy) {
      return `Media Pensión Standard (${cliente?.Hotel}): ${noches} noches = ${noches} desayunos en hotel + ${noches} comidas o cenas de SERVICIO RÁPIDO. Total: ${noches} bonos rápidos. Bonos flexibles — úsalos cuando quieras.`;
    }
    return `Media Pensión Plus (${cliente?.Hotel}): ${noches} noches = ${noches} desayunos en hotel + ${noches} comidas o cenas en buffet o mesa. Total: ${noches} bonos buffet/mesa. Bonos flexibles — úsalos cuando quieras.`;
  }
  if (plan.includes('standard')) {
    return `Pensión Completa Standard (${cliente?.Hotel}): ${noches} noches = ${noches} desayunos en hotel + ${noches} comidas rápidas + ${noches} comidas/cenas buffet/mesa + 1 comida rápida de REGALO. Total: ${noches+1} bonos rápidos y ${noches} bonos buffet/mesa. Bonos flexibles.`;
  }
  if (plan.includes('smart')) {
    return `Pensión Completa Smart (${cliente?.Hotel}): ${noches} noches = ${noches} desayunos en hotel + ${noches*2} comidas/cenas buffet/mesa + 1 de REGALO. Total: ${noches*2+1} bonos buffet/mesa. OJO: solo válido en restaurantes de Sequoia Lodge, Newport Bay Club y Disney Village.`;
  }
  if (plan.includes('extra plus')) {
    return `Pensión Completa Extra Plus (${cliente?.Hotel}): ${noches} noches = ${noches} desayunos en hotel + ${noches*2} comidas/cenas buffet/mesa + 1 de REGALO + 1 comida con personajes incluida por estancia. Total: ${noches*2+1} bonos buffet/mesa. Bonos flexibles.`;
  }
  if (plan.includes('premium')) {
    return `Pensión Completa Premium (${cliente?.Hotel}): ${noches} noches = ${noches} desayunos en hotel + ${noches*2} comidas/cenas buffet/mesa + 1 de REGALO + TODAS las comidas con personajes incluidas. Total: ${noches*2+1} bonos buffet/mesa. Bonos flexibles.`;
  }
  if (plan.includes('plus')) {
    return `Pensión Completa Plus (${cliente?.Hotel}): ${noches} noches = ${noches} desayunos en hotel + ${noches*2} comidas/cenas buffet/mesa + 1 de REGALO. Total: ${noches*2+1} bonos buffet/mesa. Bonos flexibles — úsalos como queráis durante toda la estancia.`;
  }
  return `Plan ${cliente?.["Plan de comidas"]}: ${noches} noches en ${cliente?.Hotel}. Consultar detalles con Lara.`;
})()}

DESAYUNO: SIEMPRE en el hotel (${desayuno.rest} — ${desayuno.tipo}). Nunca en el parque.
CENAS EN EL HOTEL: ${desayuno.cena}. Abren desde ~18h, último turno ~22:45h.
${desayuno.nota ? `NOTA HOTEL: ${desayuno.nota}` : ''}

PREFERENCIAS DEL CLIENTE:
- Personajes: ${prefs.personajes}
- Reservas: ${prefs.reserva}
- Estilo: ${prefs.estilo}
- Dieta: ${prefs.dieta || 'ninguna'}

HORARIOS DEL PARQUE DÍA A DÍA (estimados):
${diasInfo.map(d => `- ${d.fecha}: cierre ${d.cierre}${d.mierc?' — ⚠️ MIÉRCOLES (alta afluencia)':d.alta?' — alta afluencia':''}`).join('\n')}

REGLAS CRÍTICAS:

1. DESAYUNO: Siempre en el hotel. Nunca en el parque.

2. ESTRATEGIA DE COMIDAS Y CENAS EN EL PARQUE:
   - Cierre 20-21h: cenar en hotel o village después del cierre. NO hay tiempo para cenar en el parque.
   - Cierre 22h: viable cenar en parque antes de las 20h (reservar 19:30).
   - Cierre 22:40: ideal cenar en parque 19:30-20:00 y volver. Show nocturno ~22:00 → reservar mesa a las 21:45 (15 min de margen). En verano: opción pausa piscina 15-16h + cena 19:30 + volver. Nunca más de 2h de pausa.
   - IMPORTANTE: Los horarios de cena en hoteles y Disney Village NO dependen del horario del parque — se puede cenar allí cualquier día. Solo aplica la estrategia de horarios para cenas DENTRO del parque.

3. MIÉRCOLES = ALTA AFLUENCIA: Evitar DAW, aprovechar para comidas largas con reserva.

4. RECOMENDACIONES DE RESTAURANTES — CRITERIOS DE LARA:
   - BUFFETS son siempre la opción más práctica: sin reserva, más rápidos, variedad infinita, perfectos para familias. Recomendar casi siempre.
   - RESTAURANTES DE MESA: recomendar solo en casos especiales:
     * Bistrot Chez Rémy → SIEMPRE recomendar si hay disponibilidad. Es el favorito. A la carta.
     * Walt's An American Restaurant → ocasionalmente, para una comida especial tranquila con vistas al castillo.
     * Steakhouse (Disney Village) → ocasionalmente para una cena especial fuera del parque.
     * Captain Jack's → para una experiencia especial (mesas sobre el agua del canal).
     * El resto de restaurantes de mesa → NO recomendar salvo petición expresa.
   - LÍMITE RECOMENDADO: máximo 1 comida en mesa si el viaje es de 3 días de parque · máximo 2 si es de 4 días o más. Son comidas más lentas que restan tiempo a las atracciones. Siempre depende de lo que le guste a cada familia y de la disponibilidad.
   - COMIDAS CON PERSONAJES: solo si el cliente lo pide o tiene plan que lo incluye.
   - COMIDA RÁPIDA: no se reserva, perfecta para días de muchas atracciones.

5. FLEXIBILIDAD DE BONOS: No caducan cada día. Total libertad de distribución.

6. BEBÉS:
${bebes>0?`   - ${bebes} bebé(s) < 3 años → GRATIS. Buffets ideales para BLW. Cape Cod es el favorito de Lara.`:'   - Sin bebés menores de 3 años.'}

7. LUCKY NUGGET: Pedir bono rápido + suplemento, NO bono buffet/mesa.

8. NO incluidos en plan: McDonald's, Rainforest, Royal Pub, Starbucks, Earl of Sandwich, Five Guys, Vapiano. SÍ incluidos: Billy Bob's y Steakhouse (Village).

GENERA EL PLAN:
1. Resumen claro de bonos (ej: "3 noches = 3 desayunos en hotel + 3 comidas/cenas buffet o mesa")
2. Plan día a día con: dónde comer, dónde cenar, si es en parque/hotel/village y por qué
3. Qué reservar YA y en qué orden de prioridad
4. Consejos específicos para esta familia

Sé cercano, usa emojis, formato claro con ### para secciones. Responde en español.`;

    try {
      const res = await fetch("/api/chat", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          messages:[{ role:"user", content:prompt }],
          system:"Eres el asistente de restaurantes de Los Viajes de Moli. Responde siempre en español con formato claro y emojis. Sé práctico y personalizado.",
        })
      });
      const data = await res.json();
      setPlan(data.content?.[0]?.text || "No se pudo generar el plan.");
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }), 100);
    } catch {
      setPlan("Error de conexión. Inténtalo de nuevo.");
    }
    setLoading(false);
  }

  const s = {
    card: { background:"#fff", border:"1px solid #e8e0d5", borderRadius:12, padding:"14px 16px" },
    chip: (selected, color) => ({
      padding:"6px 14px", borderRadius:50, border:`2px solid ${selected ? color : '#e0e0e0'}`,
      background: selected ? color : '#f7f7f9', color: selected ? '#fff' : '#555',
      fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', transition:'all .15s',
    }),
    genBtn: { background: prefsCompletas ? "linear-gradient(135deg,#5B2D8E,#F5287A)" : "#e0e0e0",
      color: prefsCompletas ? "#fff" : "#999", border:"none", borderRadius:14,
      padding:"14px 20px", fontSize:14, fontWeight:700, cursor: prefsCompletas ? 'pointer' : 'not-allowed',
      width:"100%", fontFamily:"inherit", marginTop:8 },
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

      {/* INFO PLAN Y DESAYUNO */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        <div style={{ ...s.card, borderLeft:'4px solid #5B2D8E' }}>
          <div style={{ fontSize:10, color:'#9d8b78', textTransform:'uppercase', letterSpacing:1.5, marginBottom:6 }}>🍽️ Tu plan de comidas</div>
          <div style={{ fontSize:13, fontWeight:700, color:'#1c1410', marginBottom:4 }}>{cliente?.["Plan de comidas"] || "Sin plan"}</div>
          {bonos && <div style={{ fontSize:11, color:'#5B2D8E', fontWeight:600 }}>{bonos.desc}</div>}
          {bonos?.extra && <div style={{ fontSize:11, color:'#C01060', fontWeight:600, marginTop:2 }}>✨ {bonos.extra}</div>}
          <div style={{ fontSize:10, color:'#888', marginTop:6, lineHeight:1.4 }}>Los bonos son flexibles — úsalos como quieras durante toda la estancia</div>
        </div>
        <div style={{ ...s.card, borderLeft:'4px solid #F0A500' }}>
          <div style={{ fontSize:10, color:'#9d8b78', textTransform:'uppercase', letterSpacing:1.5, marginBottom:6 }}>🌅 Desayuno · 🌙 Cena en el hotel</div>
          <div style={{ fontSize:11, color:'#aaa', textTransform:'uppercase', letterSpacing:1, marginBottom:2 }}>Desayuno (siempre en el hotel)</div>
          <div style={{ fontSize:13, fontWeight:700, color:'#1c1410', marginBottom:2 }}>{desayuno.rest}</div>
          <div style={{ fontSize:11, color:'#7a6a50', marginBottom:8 }}>{desayuno.tipo}</div>
          <div style={{ fontSize:11, color:'#aaa', textTransform:'uppercase', letterSpacing:1, marginBottom:2 }}>Cenas disponibles en hotel</div>
          <div style={{ fontSize:12, color:'#1c1410', marginBottom:6 }}>{desayuno.cena}</div>
          {desayuno.nota && (
            <div style={{ fontSize:11, color: desayuno.nota.startsWith('⭐') ? '#C01060' : '#7a6a50',
              background: desayuno.nota.startsWith('⭐') ? '#FEE8F3' : '#f9f7f4',
              borderRadius:8, padding:'6px 10px', lineHeight:1.4 }}>
              {desayuno.nota}
            </div>
          )}
        </div>
      </div>

      {/* PREFERENCIAS */}
      <div style={s.card}>
        <div style={{ fontSize:12, fontWeight:800, color:'#1c1410', marginBottom:14 }}>✨ Cuéntanos qué os apetece</div>
        {prefGroups.map(group => (
          <div key={group.key} style={{ marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#555', marginBottom:8 }}>{group.label}</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {group.opts.map(opt => (
                <button key={opt.val}
                  onClick={() => setPref(group.key, opt.val)}
                  style={s.chip(prefs[group.key]===opt.val, accentColors[group.key])}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
        <button onClick={generarPlan} disabled={!prefsCompletas || loading} style={s.genBtn}>
          {loading ? '🔮 Creando tu plan mágico...' : '🪄 Crear mi plan de restaurantes personalizado'}
        </button>
        {!prefsCompletas && <p style={{ fontSize:11, color:'#aaa', textAlign:'center', marginTop:6 }}>Selecciona una opción en cada pregunta</p>}
      </div>

      {/* RESULTADO */}
      {loading && (
        <div style={{ textAlign:'center', padding:'30px 20px', background:'#fff', borderRadius:12 }}>
          <div style={{ fontSize:32, marginBottom:8 }}>🍽️</div>
          <div style={{ color:'#5B2D8E', fontWeight:700, fontSize:14 }}>Preparando tu plan personalizado...</div>
          <div style={{ color:'#aaa', fontSize:12, marginTop:4 }}>Consultando horarios y disponibilidad</div>
        </div>
      )}

      {plan && !loading && (
        <div ref={resultRef} style={{ ...s.card, borderLeft:'4px solid #2EC866' }}>
          <div style={{ fontSize:11, color:'#1A9B45', textTransform:'uppercase', letterSpacing:1.5, fontWeight:800, marginBottom:12 }}>
            ✨ Tu plan de restaurantes personalizado
          </div>
          <div style={{ fontSize:13, lineHeight:1.65, color:'#1c1410', whiteSpace:'pre-wrap' }}>
            {plan}
          </div>
          <div style={{ marginTop:16, padding:'12px 14px', background:'#FFF8E1', borderRadius:10, fontSize:11, color:'#7A5000' }}>
            ⚠️ <strong>Recuerda:</strong> Los horarios son estimados. Disney publica los definitivos ~2 meses antes. Confirma siempre en la app oficial. Las reservas se hacen desde 7 días antes (revisar desde 15 días).
          </div>
          <a href={FORM_RESTAURANTES} target="_blank" rel="noopener noreferrer"
            style={{ display:'flex', alignItems:'center', gap:10, background:'linear-gradient(135deg,#5B2D8E,#F5287A)', borderRadius:12, padding:'14px 16px', textDecoration:'none', marginTop:12 }}>
            <span style={{ fontSize:20 }}>🍽️</span>
            <div>
              <div style={{ color:'#fff', fontSize:13, fontWeight:700 }}>Solicitar reserva de restaurantes a Lara</div>
              <div style={{ color:'rgba(255,255,255,.7)', fontSize:11 }}>Formulario oficial de Los Viajes de Moli</div>
            </div>
            <span style={{ marginLeft:'auto', color:'#fff', fontSize:16 }}>→</span>
          </a>
        </div>
      )}

      {/* AVISO SIEMPRE */}
      <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:12, padding:'12px 14px', fontSize:11, color:'#92400e' }}>
        ⚠️ <strong>Horarios estimados 2026.</strong> Disney publica los horarios definitivos con ~2 meses de antelación. La información de esta herramienta es orientativa. Siempre confirma en la app oficial de Disneyland Paris.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// PORTAL PRINCIPAL
// ═══════════════════════════════════════════════════════
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

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, chatLoading]);

  const handleLogin = async () => {
    if (!dni.trim()) return;
    setStep("loading");
    try {
      const res = await fetch("/api/reserva", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ dni: dni.trim() }),
      });
      const result = await res.json();
      if (result.encontrado) {
        setCliente(result.datos);
        setStep("portal");
        setChatLoading(true);
        const chatRes = await fetch("/api/chat", {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({
            messages:[{ role:"user", content:"Hola, acabo de entrar a mi portal" }],
            system: SYSTEM_ASISTENTE.replace("{DATOS_CLIENTE}", JSON.stringify(result.datos)),
          }),
        });
        const chatData = await chatRes.json();
        setMessages([{ role:"assistant", content: chatData.content?.[0]?.text || "✨ Hola, soy Moli, tu hada madrina de Los Viajes de Moli. ¿En qué puedo ayudarte?" }]);
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
    const userMsg = { role:"user", content:chatInput.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role:m.role, content:m.content })),
          system: SYSTEM_ASISTENTE.replace("{DATOS_CLIENTE}", JSON.stringify(cliente)),
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role:"assistant", content: data.content?.[0]?.text || "Error al responder." }]);
    } catch {
      setMessages(prev => [...prev, { role:"assistant", content:"Error de conexión." }]);
    }
    setChatLoading(false);
  };

  const pendiente = extractNumber(cliente?.Pendiente || cliente?.["PENDIENTE AUTO"] || "0");

  const s = {
    page: { minHeight:"100vh", background:"linear-gradient(160deg,#1c1410 0%,#2d1f0e 40%,#0d1520 100%)", fontFamily:"Palatino Linotype, Palatino, serif" },
    header: { background:"rgba(28,20,16,0.95)", borderBottom:"2px solid #c9a84c", padding:"14px 24px", display:"flex", alignItems:"center", gap:12, position:"sticky", top:0, zIndex:100 },
    logo: { width:38, height:38, background:"linear-gradient(135deg,#c9a84c,#e8c97a)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 },
    card: { background:"#fff", border:"1px solid #e8e0d5", borderRadius:12, padding:"14px 16px" },
    goldBtn: { background:"linear-gradient(135deg,#c9a84c,#e8c97a)", color:"#1c1410", border:"none", borderRadius:10, padding:"14px", fontSize:15, cursor:"pointer", fontFamily:"inherit", fontWeight:700, width:"100%" },
  };

  const tabs = [
    { id:"reserva", label:"🏰 Mi Reserva" },
    { id:"restaurantes", label:"🍽️ Restaurantes" },
    { id:"pagos", label:"💰 Pagos" },
    { id:"extras", label:"✨ Servicios" },
    { id:"asistente", label:"🪄 Moli" },
  ];

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.logo}>🏰</div>
        <div>
          <div style={{ color:"#c9a84c", fontSize:10, letterSpacing:3, textTransform:"uppercase" }}>Los Viajes de Moli</div>
          <div style={{ color:"#f5f2ee", fontSize:16 }}>Portal del Viajero</div>
        </div>
        {cliente && (
          <div style={{ marginLeft:"auto", display:"flex", gap:10, alignItems:"center" }}>
            <span style={{ color:"#c9a84c", fontSize:13 }}>✨ {String(cliente.Nombre||"").split(" ")[0]}</span>
            <button onClick={() => { setStep("login"); setCliente(null); setDni(""); setMessages([]); }}
              style={{ background:"transparent", border:"1px solid #3a2e20", borderRadius:8, color:"#7a6a50", padding:"6px 12px", fontSize:11, cursor:"pointer" }}>
              Salir
            </button>
          </div>
        )}
      </div>

      <div style={{ maxWidth:800, margin:"0 auto", padding:"24px 16px 60px" }}>

        {(step==="login" || step==="error") && (
          <div style={{ textAlign:"center", paddingTop:60 }}>
            <div style={{ fontSize:64, marginBottom:16 }}>🏰</div>
            <h2 style={{ color:"#f5f2ee", fontWeight:400, fontSize:26, margin:"0 0 8px" }}>Bienvenido a tu Portal</h2>
            <p style={{ color:"#8a7a6a", fontSize:14, margin:"0 0 40px" }}>Consulta tu reserva, pagos, documentos y resuelve tus dudas</p>
            <div style={{ maxWidth:360, margin:"0 auto" }}>
              <div style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:16, padding:28 }}>
                <div style={{ color:"#c9a84c", fontSize:11, letterSpacing:2, textTransform:"uppercase", marginBottom:12, textAlign:"left" }}>Tu DNI</div>
                <input value={dni} onChange={e => setDni(e.target.value.toUpperCase())} onKeyDown={e => e.key==="Enter" && handleLogin()}
                  placeholder="ej. 47080502S"
                  style={{ width:"100%", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:10, color:"#f5f2ee", fontSize:18, padding:"14px 16px", outline:"none", fontFamily:"inherit", textAlign:"center", letterSpacing:2, boxSizing:"border-box", marginBottom:16 }} />
                <button onClick={handleLogin} disabled={!dni.trim()} style={{ ...s.goldBtn, opacity: dni.trim()?1:0.4 }}>Ver mi reserva ✨</button>
              </div>
              {step==="error" && (
                <div style={{ marginTop:16 }}>
                  <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:10, padding:14, color:"#fca5a5", fontSize:13, marginBottom:12 }}>⚠️ {errorMsg}</div>
                  <a href="https://losviajesdemoli.com" target="_blank" rel="noopener noreferrer" style={{ display:"flex", alignItems:"center", gap:12, background:"linear-gradient(135deg,#c9a84c,#e8c97a)", borderRadius:12, padding:"14px 18px", textDecoration:"none" }}>
                    <span style={{ fontSize:22 }}>🏰</span>
                    <div>
                      <div style={{ color:"#1c1410", fontSize:13, fontWeight:700 }}>¿Aún no tienes tu viaje reservado?</div>
                      <div style={{ color:"#5a3e10", fontSize:12 }}>Descubre Los Viajes de Moli →</div>
                    </div>
                  </a>
                </div>
              )}
              <p style={{ color:"#5a4a3a", fontSize:12, marginTop:20 }}>¿Problemas? <a href="mailto:lara@pasaportemagico.com" style={{ color:"#c9a84c" }}>Contacta con Lara</a></p>
            </div>
          </div>
        )}

        {step==="loading" && (
          <div style={{ textAlign:"center", paddingTop:100 }}>
            <div style={{ fontSize:48, marginBottom:20 }}>✨</div>
            <div style={{ color:"#f5f2ee", fontSize:16 }}>Buscando tu reserva...</div>
            <div style={{ color:"#7a6a50", fontSize:13, marginTop:8 }}>Conectando con la base de datos mágica 🏰</div>
          </div>
        )}

        {step==="portal" && cliente && (
          <div>
            {/* BIENVENIDA */}
            <div style={{ background:"rgba(201,168,76,0.1)", border:"1px solid rgba(201,168,76,0.3)", borderRadius:16, padding:"20px 24px", marginBottom:24, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
              <div>
                <div style={{ color:"#c9a84c", fontSize:11, letterSpacing:2, textTransform:"uppercase", marginBottom:4 }}>¡Hola de nuevo!</div>
                <div style={{ color:"#f5f2ee", fontSize:22 }}>{cliente.Nombre} 👋</div>
                <div style={{ color:"#8a7a6a", fontSize:13, marginTop:4 }}>Reserva nº {cliente["Numero reserva"]}</div>
              </div>
              {pendiente > 0 ? (
                <div style={{ background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:12, padding:"12px 18px", textAlign:"center" }}>
                  <div style={{ color:"#fca5a5", fontSize:11, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>⚠️ Pendiente</div>
                  <div style={{ color:"#f87171", fontSize:22, fontWeight:600 }}><PagoValor val={cliente.Pendiente} colorNum="#f87171" colorTxt="#fca5a5" size={22} /></div>
                  {cliente["Fecha_límite_pago"] && <div style={{ color:"#9d8b78", fontSize:11, marginTop:4 }}>Límite: {cliente["Fecha_límite_pago"]}</div>}
                </div>
              ) : (
                <div style={{ background:"rgba(22,163,74,0.15)", border:"1px solid rgba(22,163,74,0.3)", borderRadius:12, padding:"12px 18px" }}>
                  <div style={{ color:"#86efac", fontSize:13 }}>✅ Todo pagado</div>
                </div>
              )}
            </div>

            {/* TABS */}
            <div style={{ display:"flex", gap:6, marginBottom:20, overflowX:"auto" }}>
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  style={{ background: activeTab===tab.id ? "linear-gradient(135deg,#c9a84c,#e8c97a)" : "rgba(255,255,255,0.05)", color: activeTab===tab.id ? "#1c1410" : "#8a7a6a", border: activeTab===tab.id ? "none" : "1px solid rgba(255,255,255,0.1)", borderRadius:20, padding:"8px 18px", fontSize:13, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap", fontWeight: activeTab===tab.id ? 700 : 400 }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB: RESERVA */}
            {activeTab==="reserva" && (
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:10 }}>
                  {[
                    { icon:"🏨", label:"Hotel", val:cliente.Hotel },
                    { icon:"🍽️", label:"Plan de comidas", val:cliente["Plan de comidas"] },
                    { icon:"📅", label:"Check-in", val:cliente["Check-in"] },
                    { icon:"📅", label:"Check-out", val:cliente["Check-out"] },
                    { icon:"👥", label:"Personas", val:cliente["Nº personas y edad niños"] },
                    { icon:"📍", label:"Dirección", val:cliente["Dirección"] },
                  ].map((item,i) => (
                    <div key={i} style={s.card}>
                      <div style={{ fontSize:20, marginBottom:6 }}>{item.icon}</div>
                      <div style={{ fontSize:10, color:"#9d8b78", textTransform:"uppercase", letterSpacing:1.5, marginBottom:3 }}>{item.label}</div>
                      <div style={{ fontSize:14, color:"#1c1410", fontWeight:500 }}>{item.val||"—"}</div>
                    </div>
                  ))}
                </div>
                {cliente.Documentos && (
                  <a href={cliente.Documentos} target="_blank" rel="noopener noreferrer" style={{ display:"flex", alignItems:"center", gap:12, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(201,168,76,0.3)", borderRadius:12, padding:"16px 20px", textDecoration:"none" }}>
                    <span style={{ fontSize:28 }}>📄</span>
                    <div>
                      <div style={{ color:"#c9a84c", fontSize:13, fontWeight:600 }}>Ver mi documento de reserva</div>
                      <div style={{ color:"#7a6a50", fontSize:12 }}>Haz clic para abrir tu confirmación</div>
                    </div>
                    <span style={{ marginLeft:"auto", color:"#c9a84c", fontSize:18 }}>→</span>
                  </a>
                )}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <a href={FORM_RESTAURANTES} target="_blank" rel="noopener noreferrer" style={{ display:"flex", alignItems:"center", gap:10, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"14px 16px", textDecoration:"none" }}>
                    <span style={{ fontSize:22 }}>🍽️</span>
                    <div><div style={{ color:"#f5f2ee", fontSize:13 }}>Reservar restaurantes</div><div style={{ color:"#7a6a50", fontSize:11 }}>Formulario de Lara</div></div>
                  </a>
                  <a href={FORM_MODIFICAR} target="_blank" rel="noopener noreferrer" style={{ display:"flex", alignItems:"center", gap:10, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"14px 16px", textDecoration:"none" }}>
                    <span style={{ fontSize:22 }}>✏️</span>
                    <div><div style={{ color:"#f5f2ee", fontSize:13 }}>Modificar reserva</div><div style={{ color:"#7a6a50", fontSize:11 }}>Traslados, extras...</div></div>
                  </a>
                </div>
              </div>
            )}

            {/* TAB: RESTAURANTES */}
            {activeTab==="restaurantes" && <PlanificadorRestaurantes cliente={cliente} />}

            {/* TAB: PAGOS */}
            {activeTab==="pagos" && (
              <div style={s.card}>
                <div style={{ fontSize:11, color:"#c9a84c", letterSpacing:2, textTransform:"uppercase", marginBottom:16 }}>💰 Estado de pagos</div>
                <PagoBar pagado={cliente.Pagado} total={cliente["Total"]} />
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginTop:20 }}>
                  {[
                    { label:"Total viaje", val:cliente["Total"], bg:"#f9f7f4", colorNum:"#1c1410", colorTxt:"#7a6a50" },
                    { label:"Pagado", val:cliente.Pagado, bg:"#f0fdf4", colorNum:"#16a34a", colorTxt:"#15803d" },
                    { label:"Pendiente", val:cliente.Pendiente, bg: pendiente>0?"#fef2f2":"#f0fdf4", colorNum: pendiente>0?"#dc2626":"#16a34a", colorTxt: pendiente>0?"#b91c1c":"#15803d" },
                  ].map((item,i) => (
                    <div key={i} style={{ textAlign:"center", padding:14, background:item.bg, borderRadius:10 }}>
                      <div style={{ fontSize:10, color:item.colorNum, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>{item.label}</div>
                      <PagoValor val={item.val} colorNum={item.colorNum} colorTxt={item.colorTxt} size={18} />
                    </div>
                  ))}
                </div>
                {cliente["Fecha_límite_pago"] && pendiente>0 && (
                  <div style={{ marginTop:16, background:"#fffbeb", border:"1px solid #fde68a", borderRadius:10, padding:"12px 16px", color:"#92400e", fontSize:13 }}>
                    ⏰ Fecha límite: <strong>{cliente["Fecha_límite_pago"]}</strong>
                  </div>
                )}
                <a href={FORM_PAGOS} target="_blank" rel="noopener noreferrer" style={{ display:"flex", alignItems:"center", gap:12, background:"linear-gradient(135deg,#c9a84c,#e8c97a)", borderRadius:12, padding:"16px 20px", textDecoration:"none", marginTop:16 }}>
                  <span style={{ fontSize:24 }}>💳</span>
                  <div>
                    <div style={{ color:"#1c1410", fontSize:14, fontWeight:700 }}>Enviar justificante de pago</div>
                    <div style={{ color:"#5a3e10", fontSize:12 }}>Haz clic para acceder al formulario de abono</div>
                  </div>
                  <span style={{ marginLeft:"auto", color:"#1c1410", fontSize:18 }}>→</span>
                </a>
              </div>
            )}

            {/* TAB: EXTRAS */}
            {activeTab==="extras" && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:10 }}>
                {[
                  { icon:"🚌", label:"Traslado", val:cliente.Traslado },
                  { icon:"🌙", label:"Noche extra", val:cliente["Noche extra"] },
                  { icon:"🗼", label:"Hotel París", val:cliente["Hotel Paris"] },
                  { icon:"🎢", label:"Actividades", val:cliente.Actividades },
                  { icon:"🛡️", label:"Seguro", val:cliente.Seguro },
                  { icon:"🎁", label:"Extras DLP", val:cliente["Extras DLP"] },
                ].map((item,i) => {
                  const tieneValor = item.val && item.val !== "0" && item.val !== "";
                  return (
                    <div key={i} style={{ ...s.card, opacity: tieneValor?1:0.4 }}>
                      <div style={{ fontSize:24, marginBottom:8 }}>{item.icon}</div>
                      <div style={{ fontSize:10, color:"#9d8b78", textTransform:"uppercase", letterSpacing:1.5, marginBottom:4 }}>{item.label}</div>
                      <div style={{ fontSize:15, color: tieneValor?"#16a34a":"#9d8b78", fontWeight:600 }}>
                        {tieneValor ? "✅ SÍ" : "—"}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB: ASISTENTE MOLI */}
            {activeTab==="asistente" && (
              <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, overflow:"hidden" }}>
                <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#c9a84c,#e8c97a)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🪄</div>
                  <div>
                    <div style={{ color:"#f5f2ee", fontSize:14 }}>Moli, tu hada madrina</div>
                    <div style={{ color:"#4caf50", fontSize:11 }}>● Conoce tu reserva</div>
                  </div>
                </div>
                <div style={{ height:320, overflowY:"auto", padding:16 }}>
                  {messages.map((msg,i) => (
                    <div key={i} style={{ display:"flex", justifyContent: msg.role==="user"?"flex-end":"flex-start", marginBottom:12 }}>
                      <div style={{ maxWidth:"80%", background: msg.role==="user" ? "linear-gradient(135deg,#c9a84c,#e8c97a)" : "rgba(255,255,255,0.08)", color: msg.role==="user" ? "#1c1410" : "#e8e0d4", borderRadius: msg.role==="user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", padding:"11px 15px", fontSize:13, lineHeight:1.6, whiteSpace:"pre-wrap" }}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div style={{ display:"flex", gap:5, padding:"8px 12px", background:"rgba(255,255,255,0.08)", borderRadius:"18px 18px 18px 4px", width:"fit-content" }}>
                      {[0,1,2].map(i => <div key={i} style={{ width:6, height:6, borderRadius:"50%", background:"#c9a84c", animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
                <div style={{ padding:"8px 12px", borderTop:"1px solid rgba(255,255,255,0.05)", display:"flex", gap:6, overflowX:"auto" }}>
                  {["¿Qué incluye mi plan?","¿Cuánto cuesta cambiar de plan?","¿Cuánto me falta pagar?","¿Qué necesito para el viaje?"].map((q,i) => (
                    <button key={i} onClick={() => setChatInput(q)} style={{ background:"rgba(201,168,76,0.1)", border:"1px solid rgba(201,168,76,0.2)", borderRadius:20, padding:"5px 12px", color:"#c9a84c", fontSize:11, cursor:"pointer", whiteSpace:"nowrap", fontFamily:"inherit" }}>{q}</button>
                  ))}
                </div>
                <div style={{ padding:"10px 12px", borderTop:"1px solid rgba(255,255,255,0.05)", display:"flex", gap:8 }}>
                  <a href={FORM_MODIFICAR} target="_blank" rel="noopener noreferrer" style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:10, padding:"10px", textDecoration:"none" }}>
                    <span style={{ fontSize:16 }}>✏️</span>
                    <span style={{ color:"#f5f2ee", fontSize:12 }}>Modificar reserva</span>
                  </a>
                  <a href={FORM_PAGOS} target="_blank" rel="noopener noreferrer" style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8, background:"linear-gradient(135deg,#c9a84c,#e8c97a)", borderRadius:10, padding:"10px", textDecoration:"none" }}>
                    <span style={{ fontSize:16 }}>💳</span>
                    <span style={{ color:"#1c1410", fontSize:12, fontWeight:700 }}>Realizar un abono</span>
                  </a>
                </div>
                <div style={{ padding:"10px 12px", borderTop:"1px solid rgba(255,255,255,0.05)", display:"flex", gap:8 }}>
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key==="Enter" && handleChat()} placeholder="Escribe tu pregunta..." disabled={chatLoading}
                    style={{ flex:1, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, color:"#f5f2ee", fontSize:13, padding:"10px 14px", outline:"none", fontFamily:"inherit" }} />
                  <button onClick={handleChat} disabled={chatLoading || !chatInput.trim()} style={{ background: chatInput.trim()&&!chatLoading ? "linear-gradient(135deg,#c9a84c,#e8c97a)" : "rgba(255,255,255,0.05)", color: chatInput.trim()&&!chatLoading ? "#1c1410" : "#5a4a3a", border:"none", borderRadius:10, width:40, height:40, fontSize:16, cursor:"pointer" }}>➤</button>
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
