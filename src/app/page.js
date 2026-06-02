"use client";
import { useState, useRef, useEffect } from "react";

const FORM_RESTAURANTES = "https://docs.google.com/forms/d/e/1FAIpQLSf1H3c9HZ5JrAHSe36ys-zjM3ZCYrj47v6QXnLXui2xrMpKeQ/viewform";
const FORM_MODIFICAR = "https://docs.google.com/forms/d/e/1FAIpQLScSaC2-3EZTQCOemTG4PrnxbiNUH6R0eFuDGZaZsroNB0-FTA/viewform";
const FORM_PAGOS = "https://forms.gle/t5QaxnEuFqL6SCHQ9";

// ═══════════════════════════════════════════════════════
// HELPER: detectar si el cliente tiene reserva completa
// Un cliente "en proceso" es aquel que está en el Sheet
// pero aún no tiene los datos de reserva completos (hotel vacío)
// ═══════════════════════════════════════════════════════
function parseFecha(str) {
  if (!str) return null;
  const s = String(str).trim();
  const ddmmyyyy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyy) return new Date(parseInt(ddmmyyyy[3]), parseInt(ddmmyyyy[2])-1, parseInt(ddmmyyyy[1]));
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(parseInt(iso[1]), parseInt(iso[2])-1, parseInt(iso[3]));
  return new Date(s);
}

function esPeriodoVisita(cliente) {
  if (!cliente?.["Check-in"] || !cliente?.["Check-out"]) return false;
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  const checkin = parseFecha(cliente["Check-in"]);
  const checkout = parseFecha(cliente["Check-out"]);
  if (!checkin || !checkout || isNaN(checkin) || isNaN(checkout)) return false;
  const inicio = new Date(checkin); inicio.setDate(inicio.getDate() - 1);
  return hoy >= inicio && hoy <= checkout;
}

function diasParaViaje(cliente) {
  if (!cliente?.["Check-in"]) return null;
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  const checkin = parseFecha(cliente["Check-in"]);
  if (!checkin || isNaN(checkin)) return null;
  const diff = Math.ceil((checkin - hoy) / (1000*60*60*24));
  return diff;
}

function tieneReservaCompleta(cliente) {
  if (!cliente) return false;
  return !!(cliente.Hotel && String(cliente.Hotel).trim() !== "");
}

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

COMIDAS ESPECIALES CON PRINCESAS O PERSONAJES — MUY IMPORTANTE:
- Las comidas especiales con princesas o personajes (Auberge de Cendrillon, The Regal View, Royal Banquet, La Table de Lumière...) NO aparecen en la app de Disneyland Paris hasta 7 días antes del viaje, cuando se activan las magic pass.
- Tampoco aparecen en el portal del viajero.
- La única referencia que tiene el cliente antes de esos 7 días es su BONO DE RESERVA que Lara le envía.
- Si el cliente pregunta dónde está su comida con princesas o personajes, indicarle que revise su bono de reserva y que aparecerá en la app a partir de los 7 días antes.

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
El desayuno NO se reserva — se va directamente al restaurante del hotel.
Cada hotel tiene su restaurante de desayuno incluido en el precio de la habitación o con plan de desayuno.
Los hoteles con hab. Club/Suite incluyen desayuno en su lounge exclusivo.

HORARIOS RESTAURANTES DE HOTELES DISNEY:
Los restaurantes de los hoteles Disney solo abren en DOS momentos del día:
- DESAYUNO (mañana) — en tu propio hotel, sin reserva
- CENA (noche) — a partir de las 18:00h aprox.
NO sirven comidas al mediodía. Las comidas se realizan en el parque.

DÓNDE COMER Y CENAR:
- COMIDAS (mediodía): siempre en el parque — los restaurantes de hotel no abren a mediodía.
- CENAS: tres opciones a elegir:
  1. En el parque (si el horario de cierre lo permite — ver consejos de horarios)
  2. En Disney Village (abierto todas las noches, sin entrada)
  3. En cualquier hotel Disney — podéis cenar en el restaurante de CUALQUIER hotel Disney aunque no os alojéis en él. Es una opción muy buena para cenar con tranquilidad.

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

Consejos generales:
- Reservar con antelación, especialmente restaurantes con personajes.
- Dejar noches flexibles.
- Priorizar buffet con niños pequeños (más rápido y variado).
- Los restaurantes de mesa son más lentos, mejor sin prisas.
- Los restaurantes de servicio rápido no se reservan.
- Reservar más restaurantes de los necesarios para decidir después cuáles usar.
- En grupos grandes puede ser necesario dividir el grupo.
- Todas las personas de la reserva deben tener el mismo plan de comidas y la misma comida especial.
- Las sillas infantiles normalmente se dejan fuera del restaurante.
- Con plan de comidas hay que pedir SIEMPRE en quiosco o caja — NO se puede realizar el pedido desde la app.

---

GUÍA DE RESTAURANTES DE COMIDA RÁPIDA — CONSEJOS DE LARA:

Cuando el cliente pregunte dónde comer o cenar, hazle estas preguntas:
1. ¿En qué parque o zona estáis?
2. ¿Es para comida o cena?
3. ¿Qué os apetece comer? (pizza, hamburguesa, pollo, pasta, buffet, algo ligero...)
4. ¿Tenéis niños pequeños o alguna preferencia especial?

Según sus respuestas, recomienda con los siguientes criterios:

PARQUE DISNEYLAND — COMIDA RÁPIDA:

MAIN STREET (abierto hasta el cierre del parque):
- Todos los restaurantes, puestos y cafeterías de Main Street abren hasta el cierre. Buena opción para cenar tarde.
- Market House Deli: sándwiches, bocadillos, snacks. Ideal para algo rápido y económico. El sándwich de jamón y queso tiene forma de Mickey. Beignet de chocolate muy recomendado.

ADVENTURELAND:
- Colonel Hathi's Outpost: cocina india/étnica. Buena opción para pizza — el único restaurante con pizza del parque (estilo flatbread). Si quieren pizza, dirigirles aquí.
- Otros puestos en la zona: cierran antes, revisar horarios en la app.

DISCOVERYLAND — CAFÉ HYPERION (IMPRESCINDIBLE CONOCERLO):
- Café Hyperion es ideal cuando se quiere un sitio grande con capacidad garantizada. Cierra muy tarde.
- Solo tiene hamburguesas, pero las raciones son buenas.
- MUY RECOMENDABLE para hacer coincidir comida o merienda/café con espectáculos de temporada (Navidad, Halloween) — se puede comer mientras se ve el espectáculo desde dentro. Es el único restaurante con esta ventaja.
- También tiene enchufes EU y es la única sala donde puedes sentarte a cargar el móvil.

FRONTIERLAND — COWBOY COOKOUT BARBECUE:
- Uno de los favoritos de Lara. Ideal para compartir — tiene muy buenas raciones.
- El menú de costillas, pollo y salchichas es especialmente recomendado para compartir en grupo.
- ⚠️ Cierra antes que otros restaurantes — no sirve para cenar tardía. Si es para cenar, verificar horario en la app.

FANTASYLAND:
- ⚠️ IMPORTANTE: Fantasyland cierra UNA HORA ANTES del espectáculo nocturno final. Sus restaurantes también cierran antes.
- No son una buena opción para cenar salvo que sea muy temprano (antes de las 19:00h aprox).
- Para cenar en Fantasyland: ir antes de que empiece a cerrar la zona.

LUCKY NUGGET SALOON (Frontierland):
- Técnicamente es comida rápida pero el sistema lo descuenta como bono de buffet/mesa — NO es rentable usarlo con ese bono.
- Buena opción cuando sobra un bono de comida rápida o para gastar bono de comida rápida pagando menor diferencia que cenando en un buffet de verdad.
- Si el cliente tiene bono de comida rápida sobrante, es una opción cómoda.

DISNEY ADVENTURE WORLD — COMIDA RÁPIDA:

- Todos los restaurantes de comida rápida de Disney Adventure World están abiertos hasta el cierre del parque. No hay problema de horarios para cenar.

ZONA DEL LAGO Y FROZEN (World of Frozen / Adventure Bay):
- ⚠️ ATENCIÓN: Toda la zona del lago y Frozen solo tiene UN restaurante de comida rápida — el restaurante de Frozen, que sirve albóndigas y salmón.
- El resto son puestos de comida para llevar o comer en terraza, con muy baja capacidad. Si hay mucha gente pueden estar llenos.
- Si el cliente está en esa zona y quiere comer cómodamente, recomendarle moverse a otra zona del parque.

STARK FACTORY (Campus Avengers):
- MUY RECOMENDADO para usar bono de comida rápida — las raciones son muy grandes.
- Las raciones infantiles incluyen la MISMA cantidad de pasta que las de adultos. Ideal para compartir entre 2 niños.
- También incluye la opción de 2 Babybel. Perfecto para familias con niños pequeños.
- Recomendarlo especialmente cuando tengan bonos de comida rápida que quieran aprovechar bien.

WORLD PREMIER CAFÉ (Studio 1 / entrada DAW):
- Ubicado en el edificio de entrada de Disney Adventure World.
- Tiene hamburguesas. Buena opción al entrar o salir del parque.

RESUMEN RÁPIDO PARA RECOMENDAR:
- Quieren pizza → Colonel Hathi's Outpost (Adventureland, Disneyland)
- Quieren sitio grande seguro / ver espectáculos de temporada → Café Hyperion (Discoveryland)
- Quieren compartir / costillas / pollo → Cowboy Cookout Barbecue (Frontierland) — verificar cierre
- Sobra bono rápido y quieren algo diferente → Lucky Nugget Saloon
- Están en DAW y quieren aprovechar el bono rápido → Stark Factory (raciones grandes)
- Están en la zona del lago/Frozen y hay mucha gente → moverse a otra zona
- Quieren cenar tarde en Disneyland → Main Street o Café Hyperion (Discoveryland)
- NO cenar tarde en Fantasyland — cierra 1h antes del show nocturno

CONSEJOS ADICIONALES DE LARA PARA RESTAURANTES Y MOVIMIENTO POR EL PARQUE:

LLUVIA O MUCHO CALOR — ATAJOS Y ZONAS CUBIERTAS:
- Si llueve o hace mucho calor, recomendar usar los "atajos" del parque para moverse entre zonas y así evitar mojarse o el sol directo.
- Main Street tiene zonas cubiertas a ambos lados — ideal para refugiarse o moverse de un extremo al otro sin mojarse.
- ⚠️ IMPORTANTE: Disney Adventure World tiene MUY POCAS zonas cubiertas y resguardadas del sol. Avisar a los clientes de esto, especialmente en verano o días de lluvia — es un parque muy expuesto.
- En lluvia, Café Hyperion en Discoveryland es ideal porque es un espacio interior grande donde refugiarse y comer o descansar.

SIN RESERVA EN BUFFET O MESA:
- Si no tienen reserva para un restaurante buffet o mesa, pueden probar a acercarse directamente y pedir mesa — puede haber alguna libre, especialmente a horas intermedias o fuera de los picos de comida (antes de las 12:30 o después de las 14:30 para comidas, antes de las 19:00 para cenas).
- Vale la pena intentarlo siempre antes de rendirse.

GRUPOS GRANDES (más de 10 personas):
- La mayoría de restaurantes Disney no tienen mesas muy grandes — os dividirán en varios grupos.
- Truco: podéis hacer varias reservas para el mismo restaurante desde distintos usuarios de la app y solicitar al llegar que os coloquen cerca de las otras reservas.
- Para grupos grandes, las mejores opciones son los restaurantes de los hoteles:
  * Chuck Wagon Cafe en Hotel Cheyenne — buffet amplio, buena capacidad
  * La Cantina en Hotel Santa Fe — buffet con opciones variadas incluyendo vegetarianas
  * Ambos están fuera del parque (en los hoteles Disney) por lo que no necesitan entrada.

Si el cliente quiere reservar restaurantes de mesa o buffet, dirigirle al formulario: ${FORM_RESTAURANTES}

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

PERSONAJES SECRETOS — LUGARES QUE NO APARECEN EN LA APP:

Hay zonas del parque donde aparecen personajes que NO salen en la app de Disneyland Paris. Son puntos que Lara conoce por experiencia. Compartirlos con el cliente cuando pregunte por personajes o cómo encontrarlos.

PUNTOS CLAVE (Parque Disneyland):

1. FRONTIERLAND — Minnie Mouse:
- Minnie suele aparecer en Frontierland en un punto fijo.
- Las filas suelen ser MUY CORTAS comparado con otros encuentros — una oportunidad de oro para conocerla sin esperar.
- Recomendarlo especialmente a familias que quieran ver a Minnie sin hacer larga cola.

2. ADVENTURELAND — Personajes del Libro de la Selva + sorpresas:
- En Adventureland hay un punto donde se colocan personajes del Libro de la Selva.
- También pueden aparecer Donald, Daisy o incluso Vaina — la rotación es variada y sorprendente.
- Vale la pena pasarse por la zona aunque no estén seguros de quién habrá.

3. FANTASYLAND — Princesas "libres":
- Algunas princesas aparecen por distintos puntos de Fantasyland fuera de los encuentros oficiales.
- No tienen un horario fijo en la app pero se pueden encontrar paseando o en zonas concretas.
- Recomendable recorrer Fantasyland con atención, especialmente por la zona del castillo y alrededores.

4. ZONAS DE PASO — verlos sin cola:
- Los personajes cambian cada 30 minutos. Cuando se van a su zona de cambio pasan muy cerca de la gente.
- Aunque en ese momento NO firman ni hacen fotos oficiales, se les puede ver y fotografiar muy de cerca.
- Colocarse cerca de la zona de cambio justo antes de que termine su turno es un truco para verlos sin esperar.

REGLA IMPORTANTE — HORARIO:
- ⚠️ La mayoría de personajes en estos puntos "secretos" están disponibles ANTES DE LAS 17:00h.
- A partir de las 17:00h aproximadamente se van a descansar y ya no suelen aparecer.
- Recomendar siempre recorrer estos puntos durante la mañana o primera tarde, nunca dejarlo para el final del día.

CONSEJO GENERAL:
- Recorrer TODOS los puntos mencionados durante el día, especialmente antes de las 17h.
- Consultar también la guía privada que Lara envía a sus clientes donde están marcados estos puntos en el mapa.

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

PARA VISITAR París:
- Tour privado en coche de ~3h por 350€ (sin traslado a París incluido).
- Muy recomendable el día de llegada: recogen en aeropuerto, veis París y os dejan en Hotel Disney.

---

CONSEJOS DE LLEGADA, CHECK-IN Y ÚLTIMO DÍA:

HORA EXTRA:
- La hora extra está incluida durante TODA la estancia, no solo el primer día.
- Horario habitual: 8:30–9:30h. En octubre y noviembre puede cambiar a 8:00–9:00h. Revisar siempre la app.
- En algunos hoteles Disney se pueden disfrutar encuentros con personajes durante la hora extra (antes de la apertura oficial).

PRIMER DÍA — LLEGADA Y CHECK-IN:
- El check-in online se puede realizar 7 días antes a través de la app para agilizar el proceso.
- Si da error en el envío del email de confirmación del check-in, no pasa nada — es un fallo habitual, el check-in queda registrado igualmente.
- Esa mañana lo ideal es llegar temprano al hotel (si ya estáis en Disney o París) para disfrutar de la hora extra, o no llegar muy tarde si hay mucha fila en recepción.
- El TITULAR de la reserva tiene que acudir a recepción para el check-in. Otro miembro del grupo puede quedarse en la fila de consigna para dejar el equipaje mientras tanto — así se aprovecha mejor el tiempo.
- Si necesitáis solicitar tarjeta por enfermedad o discapacidad, hacerlo justo después del check-in. Las filas para esto suelen estar en la zona de información del hotel y pueden ser largas — hacerlo cuanto antes.

ÚLTIMO DÍA — APROVECHAR LA HORA EXTRA:
- Si queréis disfrutar de la hora extra el último día, el consejo de Lara es:
  1. Desayunar a las 7:00h en el hotel
  2. Dejar las maletas en la habitación y llevarlas a consigna sobre las 8:00h
  3. Si os alojáis lejos de recepción, llevar directamente las maletas al desayuno ya que algunas consignas abren a las 7:00h y otras a las 7:30h
- Así podéis estar en los tornos del parque a las 8:20h sin perder la hora extra.

CONSIGNAS DE EQUIPAJE EN HOTELES DISNEY:
- Las consignas de equipaje son GRATUITAS en todos los hoteles Disney oficiales.
- Horario habitual: abren entre las 7:00h y las 7:30h según el hotel.
- ⚠️ EXCEPCIÓN: Davy Crockett Ranch NO tiene consigna de equipaje.

CONTACTO:
lara@pasaportemagico.com`;

// ═══════════════════════════════════════════════════════
// CALENDARIO HORARIOS ESTIMADOS DISNEYLAND PARIS 2026
// ═══════════════════════════════════════════════════════
const HORARIOS_2026 = {
  "2026-01-01":"20:00","2026-01-02":"20:00","2026-01-03":"20:00","2026-01-04":"20:00",
  "2026-01-05":"21:00","2026-01-06":"21:00","2026-01-07":"21:00","2026-01-08":"21:00","2026-01-09":"21:00","2026-01-10":"21:00","2026-01-11":"21:00",
  "2026-01-12":"21:00","2026-01-13":"21:00","2026-01-14":"21:00","2026-01-15":"21:00","2026-01-16":"21:00","2026-01-17":"21:00","2026-01-18":"21:00",
  "2026-01-19":"20:00-21:00","2026-01-20":"20:00-21:00","2026-01-21":"20:00-21:00","2026-01-22":"20:00-21:00","2026-01-23":"20:00-21:00","2026-01-24":"20:00-21:00","2026-01-25":"20:00-21:00",
  "2026-01-26":"21:00","2026-01-27":"21:00","2026-01-28":"21:00","2026-01-29":"21:00","2026-01-30":"21:00","2026-01-31":"21:00",
  "2026-02-02":"21:00","2026-02-03":"21:00","2026-02-04":"21:00","2026-02-05":"21:00","2026-02-06":"21:00","2026-02-07":"21:00","2026-02-08":"21:00",
  "2026-02-09":"20:00-21:00","2026-02-10":"20:00-21:00","2026-02-11":"20:00-21:00","2026-02-12":"20:00-21:00","2026-02-13":"20:00-21:00","2026-02-14":"20:00-21:00","2026-02-15":"20:00-21:00",
  "2026-02-16":"21:00","2026-02-17":"21:00","2026-02-18":"21:00","2026-02-19":"21:00","2026-02-20":"21:00","2026-02-21":"21:00","2026-02-22":"21:00",
  "2026-02-23":"21:00","2026-02-24":"21:00","2026-02-25":"21:00","2026-02-26":"21:00","2026-02-27":"21:00","2026-02-28":"21:00",
  "2026-03-01":"21:00","2026-03-02":"21:00","2026-03-03":"21:00","2026-03-04":"21:00","2026-03-05":"21:00","2026-03-06":"21:00","2026-03-07":"21:00","2026-03-08":"21:00",
  "2026-03-09":"21:00","2026-03-10":"21:00","2026-03-11":"21:00","2026-03-12":"21:00","2026-03-13":"21:00","2026-03-14":"21:00","2026-03-15":"21:00",
  "2026-03-16":"20:00-21:00","2026-03-17":"20:00-21:00","2026-03-18":"20:00-21:00","2026-03-19":"20:00-21:00","2026-03-20":"20:00-21:00","2026-03-21":"20:00-21:00","2026-03-22":"20:00-21:00",
  "2026-03-23":"22:00","2026-03-24":"22:00","2026-03-25":"22:00","2026-03-26":"22:00","2026-03-27":"22:00","2026-03-28":"22:00","2026-03-29":"22:00",
  "2026-03-30":"22:40","2026-03-31":"22:40",
  "2026-04-01":"22:40","2026-04-02":"22:40","2026-04-03":"22:40","2026-04-04":"22:40","2026-04-05":"22:40",
  "2026-04-06":"22:40","2026-04-07":"22:40","2026-04-08":"22:40","2026-04-09":"22:40","2026-04-10":"22:40","2026-04-11":"22:40","2026-04-12":"22:40",
  "2026-04-13":"22:40","2026-04-14":"22:40","2026-04-15":"22:40","2026-04-16":"22:40","2026-04-17":"22:40","2026-04-18":"22:40","2026-04-19":"22:40",
  "2026-04-20":"22:40","2026-04-21":"22:40","2026-04-22":"22:40","2026-04-23":"22:40","2026-04-24":"22:40","2026-04-25":"22:40","2026-04-26":"22:40",
  "2026-04-27":"22:40","2026-04-28":"22:40","2026-04-29":"22:40","2026-04-30":"22:40",
  ...(()=>{const d={};for(let m=5;m<=8;m++){const days=m===8?31:m===5||m===7?31:30;for(let i=1;i<=days;i++){d[`2026-0${m}-${String(i).padStart(2,'0')}`]="22:40";}}return d;})(),
  ...(()=>{const d={};for(let i=1;i<=20;i++)d[`2026-09-${String(i).padStart(2,'0')}`]="22:40";for(let i=21;i<=30;i++)d[`2026-09-${String(i).padStart(2,'0')}`]="22:00";return d;})(),
  ...(()=>{const d={};for(let i=1;i<=18;i++)d[`2026-10-${String(i).padStart(2,'0')}`]="22:00";for(let i=19;i<=31;i++)d[`2026-10-${String(i).padStart(2,'0')}`]="21:00";return d;})(),
  ...(()=>{const d={};for(let i=1;i<=30;i++)d[`2026-11-${String(i).padStart(2,'0')}`]="21:00";return d;})(),
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

function parsePlan(planStr, hotel) {
  if (!planStr) return 'ninguno';
  const p = planStr.toLowerCase().trim();
  const h = (hotel||'').toLowerCase();
  const esSantaFeDavy = h.includes('santa fe') || h.includes('davy') || h.includes('crockett');
  if (p === 'no' || p === 'ninguno' || p === 'sin plan' || p === '') return 'ninguno';
  if (p.includes('desayuno')) return 'desayuno';
  if (p.includes('premium')) return 'premium';
  if (p.includes('extra plus') || p.includes('extra-plus')) return 'extra_plus';
  if (p.includes('smart')) return 'smart';
  if (p.includes('plus')) { if (p.includes('media') || p === 'mp plus' || p.includes('mp p')) return 'mp_plus'; return 'pc_plus'; }
  if (p.includes('standard') || p.includes('estándar')) { if (p.includes('media') || p.includes('mp')) return 'mp_standard'; return 'pc_standard'; }
  if (p.includes('pension completa') || p.includes('pensión completa') || p === 'pc') { return esSantaFeDavy ? 'pc_standard' : 'pc_plus'; }
  if (p === 'mp' || p.includes('media p')) { return esSantaFeDavy ? 'mp_standard' : 'mp_plus'; }
  return 'ninguno';
}

function calcBonos(planTipo, noches) {
  switch(planTipo) {
    case 'ninguno': return { desc: null, detalle: null };
    case 'desayuno': return { desc: `Solo desayuno`, detalle: `1 desayuno buffet en tu hotel por cada noche. Comidas y cenas se pagan aparte.` };
    case 'mp_standard': return { desc: `Media Pensión Standard`, detalle: `1 desayuno en hotel + 1 comida o cena de servicio RÁPIDO por cada noche. Bonos flexibles — úsalos cuando quieras.` };
    case 'mp_plus': return { desc: `Media Pensión Plus`, detalle: `1 desayuno en hotel + 1 comida o cena en buffet o mesa por cada noche. Bonos flexibles — úsalos cuando quieras.` };
    case 'pc_standard': return { desc: `Pensión Completa Standard`, detalle: `1 desayuno en hotel + 1 comida/cena buffet o mesa + 1 comida/cena rápida por cada noche + 1 comida rápida de REGALO de Disney. Bonos flexibles.` };
    case 'pc_plus': return { desc: `Pensión Completa Plus`, detalle: `1 desayuno en hotel + 2 comidas/cenas en buffet o mesa por cada noche + 1 bono buffet/mesa de REGALO de Disney. Bonos flexibles.` };
    case 'smart': return { desc: `Pensión Completa Smart`, detalle: `1 desayuno en hotel + 2 comidas/cenas en buffet o mesa por cada noche + 1 bono de REGALO. ⚠️ Solo válido en restaurantes de tu hotel y Disney Village.` };
    case 'extra_plus': return { desc: `Pensión Completa Extra Plus`, detalle: `1 desayuno en hotel + 2 comidas/cenas buffet o mesa por cada noche + 1 de REGALO + 1 bebida extra/noche + 1 snack/noche + 1 comida con personajes incluida por estancia. Bonos flexibles.` };
    case 'premium': return { desc: `Pensión Completa Premium`, detalle: `1 desayuno en hotel + 2 comidas/cenas buffet o mesa por cada noche + 1 de REGALO. ✨ TODAS las comidas pueden ser con personajes o princesas sin suplemento.` };
    default: return { desc: null, detalle: null };
  }
}

function parseNoches(checkin, checkout) {
  if (!checkin || !checkout) return 0;
  return getDatesInRange(checkin, checkout).length;
}

function getDesayunoHotel(hotel) {
  const h = (hotel||'').toLowerCase();
  if (h.includes('disneyland hotel') || h.includes('castle')) return { rest: 'Royal Banquet / Deluxe Lounge / Castle Club Lounge', tipo: 'Buffet incluido en tarifa o lounge exclusivo según categoría', cena: 'La Table de Lumière (cena con Princesas) · Royal Banquet (comida/cena con personajes) · Fleur de Lys Bar', nota: 'Los restaurantes del hotel abren para cenas a partir de las 18h aprox.' };
  if (h.includes('new york') || h.includes('marvel')) return { rest: 'Downtown Restaurant', tipo: 'Buffet completo (incluido en Empire State Club y Suites)', cena: 'Manhattan Restaurant (a la carta · solo cenas) · Downtown Restaurant (buffet) · Skyline Bar · Bleecker Street Lounge', nota: '⭐ Al alojarte en el Hotel New York – Marvel podemos solicitar a Disney mesa en el Downtown Restaurant. Si no hay disponibilidad habrá que ir revisando la app. Los restaurantes del hotel abren para cenas a partir de las 18h aprox.' };
  if (h.includes('newport')) return { rest: 'Cape Cod ⭐ (favorito de Lara para familias con bebés)', tipo: 'Buffet completo (incluido en Compass Club y Suites)', cena: 'Yacht Club (a la carta) · Cape Cod (buffet) · Captain\'s Quarters (bar)', nota: 'Los restaurantes del hotel abren para cenas a partir de las 18h aprox.' };
  if (h.includes('sequoia')) return { rest: "Hunter's Grill & Beaver Creek Tavern", tipo: 'Buffet completo (incluido en Golden Forest Club y Suites)', cena: "Hunter's Grill & Beaver Creek Tavern (buffet cena) · Redwood Bar and Lounge", nota: 'Los restaurantes del hotel abren para cenas a partir de las 18h aprox.' };
  if (h.includes('cheyenne')) return { rest: 'Chuck Wagon Cafe', tipo: 'Buffet completo', cena: 'Chuck Wagon Cafe (buffet cena) · Red Garter Saloon · Starbucks', nota: 'Los restaurantes del hotel abren para cenas a partir de las 18h aprox.' };
  if (h.includes('santa fe')) return { rest: 'La Cantina', tipo: 'Buffet completo (con opciones veganas)', cena: 'La Cantina (buffet cena) · Rio Grande Bar · Starbucks', nota: 'Los restaurantes del hotel abren para cenas a partir de las 18h aprox.' };
  if (h.includes('davy') || h.includes('crockett')) return { rest: "Crockett's Tavern / Para llevar", tipo: 'Desayuno para llevar o buffet (temporada)', cena: "Crockett's Tavern (buffet cena) · Crockett's Saloon", nota: 'Los restaurantes del hotel abren para cenas a partir de las 18h aprox. Recuerda que el ranch requiere vehículo propio para ir al parque.' };
  return { rest: 'Restaurante del hotel', tipo: 'Buffet según hotel', cena: 'Restaurante principal del hotel', nota: 'Los restaurantes del hotel abren para cenas a partir de las 18h aprox.' };
}

function extractNumber(val) {
  if (!val && val !== 0) return 0;
  const str = String(val).replace(/€/g, '').replace(/\s/g, '');
  const nums = str.match(/\d+([.,]\d+)?/g);
  if (!nums) return 0;
  return nums.reduce((acc, n) => acc + parseFloat(n.replace(',', '.')), 0);
}
function hasText(val) {
  if (!val && val !== 0) return false;
  const str = String(val).trim();
  if (!str || str === '0') return false;
  return str.replace(/[\d€+\-.,\s]/g, '').trim().length > 0;
}
function PagoValor({ val, colorNum = "#1c1410", colorTxt = "#7a6a50", size = 18 }) {
  if (!val && val !== 0) return <span style={{ color:"#bbb" }}>—</span>;
  const str = String(val).trim();
  if (!str || str === "0") return <span style={{ color:"#bbb" }}>—</span>;
  const num = extractNumber(val);
  const texto = hasText(val);
  return (
    <span>
      {num > 0 && <strong style={{ color:colorNum, fontSize:size }}>{num.toLocaleString("es-ES", { style:"currency", currency:"EUR" })}</strong>}
      {texto && <span style={{ color:colorTxt, fontSize:"0.75em", display:"block", marginTop:2, fontStyle:"italic" }}>📝 {str}</span>}
      {!num && !texto && <span style={{ color:"#bbb" }}>—</span>}
    </span>
  );
}
function PagoBar({ pagado, total }) {
  const p = Math.round((extractNumber(pagado) + Number.EPSILON) * 100) / 100;
  const t = Math.round((extractNumber(total) + Number.EPSILON) * 100) / 100 || 1;
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
// PLANIFICADOR DE RESTAURANTES (sin cambios)
// ═══════════════════════════════════════════════════════
function PlanificadorRestaurantes({ cliente }) {
  const [prefs, setPrefs] = useState({});
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const resultRef = useRef(null);

  const planTipo = parsePlan(cliente?.["Plan de comidas"], cliente?.Hotel);
  const noches = parseNoches(cliente?.["Check-in"], cliente?.["Check-out"]);
  const bonos = calcBonos(planTipo, noches);
  const desayuno = getDesayunoHotel(cliente?.Hotel);
  const dates = getDatesInRange(cliente?.["Check-in"]||"", cliente?.["Check-out"]||"");

  const personasStr = cliente?.["Nº personas y edad niños"] || "";
  const adultos = parseInt(personasStr.match(/(\d+)\s*adulto/i)?.[1] || "2");
  const ninos = parseInt(personasStr.match(/(\d+)\s*ni[ñn]/i)?.[1] || "0");
  const bebes = parseInt(personasStr.match(/(\d+)\s*(beb[eé]|menor)/i)?.[1] || "0");
  const totalPax = adultos + ninos + bebes;

  const setPref = (group, val) => setPrefs(p => ({ ...p, [group]: val }));
  const prefsCompletas = ['personajes','reserva','estilo'].every(k => prefs[k]);

  const prefGroups = [
    { key:'personajes', label:'👑 ¿Queréis comer con personajes?', opts:[{ val:'si', label:'✅ Sí, imprescindible' },{ val:'si-si-hay', label:'Si hay disponibilidad' },{ val:'no', label:'No nos importa' }]},
    { key:'reserva', label:'📅 ¿Preferís tener las comidas reservadas o ir libremente?', opts:[{ val:'reservado', label:'📋 Todo reservado y organizado' },{ val:'flexible', label:'🎯 Solo reservar lo especial' },{ val:'libre', label:'🆓 Sin reservas, total libertad' }]},
    { key:'estilo', label:'🍽️ ¿Preferís buffet o carta?', opts:[{ val:'buffet', label:'🥗 Buffet — variedad y sin esperas' },{ val:'carta', label:'📖 Carta — elegir el menú' },{ val:'indiferente', label:'😊 Nos da igual' }]},
    { key:'dieta', label:'🌿 ¿Alguna restricción alimentaria?', opts:[{ val:'ninguna', label:'Ninguna' },{ val:'vegetariano', label:'Vegetariano/vegan' },{ val:'alergias', label:'Alergias' },{ val:'sin-gluten', label:'Sin gluten' }]},
  ];

  const accentColors = { personajes:'#5B2D8E', reserva:'#F5287A', estilo:'#2BBCD4', dieta:'#F0A500' };

  function generarPlan() {
    if (!prefsCompletas) return;
    setLoading(true); setPlan(null);

    const RESTS_PERSONAJES = {
      "premium":["🏰 Auberge de Cendrillon — Princesas + Mickey · Reserva con meses","👑 Royal Banquet (Hotel Disneyland) — Mickey, Minnie, Pluto, Donald · Solo cena","✨ La Table de Lumière (Hotel Disneyland) — Príncipes y princesas · Solo cena"],
      "extra_plus":["🏰 Auberge de Cendrillon — Incluida en tu plan · Reserva con antelación","🌊 The Regal View (Adventure Way) — Nuevo 2026 · Princesas · Reserva cuanto antes"],
      "pc_plus":["🏰 Auberge de Cendrillon — Suplemento · Reserva con antelación","🌊 The Regal View — Suplemento · Nuevo 2026","🦸 PYM Kitchen (Campus Avengers) — Buffet Avengers · Con plan"],
      "mp_plus":["🏰 Auberge de Cendrillon — Suplemento","🌊 The Regal View — Suplemento · Nuevo 2026"],
      "pc_standard":["🌊 The Regal View — Suplemento · Nuevo 2026"],
      "mp_standard":["🌊 The Regal View — Suplemento · Nuevo 2026"],
    };
    const RESTS_BUFFET = ["🤠 Cowboy Cookout BBQ (Frontierland) — Barbacoa · Cierra antes","🦸 PYM Kitchen (Campus Avengers) — Buffet Avengers · Personajes Marvel","⚓ Cape Cod (Newport Bay) — Favorito Lara para familias con bebés · Solo cenas","🌴 Manhattan Restaurant (NY Marvel) — Buffet · Avengers por las noches"];
    const RESTS_MESA = ["🕯️ Walt's Restaurant (Main Street) — Cocina francesa · Vistas al castillo","🏝️ Blue Lagoon (Adventureland) — DENTRO de Piratas · Única en el mundo · Reserva con meses","🐀 Chez Rémy (Worlds of Pixar) — Muy demandado · Reserva con semanas","🌊 The Regal View (Adventure Way) — Nuevo 2026 · Vistas al lago"];
    const RESTS_RAPIDO = ["🍕 Colonel Hathi's (Adventureland) — ÚNICO con pizza del parque","☕ Café Hyperion (Discoveryland) — Grande, cubierto, enchufes EU","⚡ Stark Factory (Campus Avengers) — Raciones muy grandes · Ideal bono rápido"];

    const tienePersonajes = prefs.personajes === "si" || prefs.personajes === "si-si-hay";
    const quiereBuffet = prefs.estilo === "buffet";
    const restsPersonajes = RESTS_PERSONAJES[planTipo] || [];
    const desayunoInfo = getDesayunoHotel(cliente?.Hotel);
    const horario = getHorario(dates[0] || "");
    const cierresTarde = horario >= "22:00";

    const partes = [];
    partes.push("🍽️ **Plan de restaurantes para " + (cliente?.Nombre || "") + "**");
    partes.push("📍 " + (cliente?.Hotel || "") + " · " + (cliente?.["Plan de comidas"] || "Sin plan") + " · " + noches + " noches\n");
    partes.push("**🌅 DESAYUNOS** · Todos los días en el hotel · Sin reserva");
    partes.push("→ " + desayunoInfo.rest + " · " + desayunoInfo.tipo + "\n");
    partes.push("**🍽️ TU PLAN: " + (bonos?.desc || "Sin plan") + "**");
    if (bonos?.detalle) partes.push(bonos.detalle + "\n");
    if (tienePersonajes && restsPersonajes.length > 0) {
      partes.push("**👑 RESTAURANTES CON PERSONAJES**");
      restsPersonajes.forEach(function(r2) { partes.push("• " + r2); });
      partes.push("⚠️ Reserva desde la app DLP · Disponible 7 días antes · Revisa desde 15 días\n");
    }
    partes.push("**💡 RECOMENDACIONES**\n");
    if (quiereBuffet) {
      partes.push("*Buffets recomendados:*");
      RESTS_BUFFET.slice(0,3).forEach(function(r2) { partes.push("• " + r2); });
    } else {
      partes.push("*Restaurantes de mesa:*");
      RESTS_MESA.slice(0,3).forEach(function(r2) { partes.push("• " + r2); });
    }
    partes.push("\n*Comida rápida (sin perder tiempo):*");
    RESTS_RAPIDO.slice(0,2).forEach(function(r2) { partes.push("• " + r2); });
    partes.push("\n**🌙 HORARIO DE CENAS**");
    if (cierresTarde) {
      partes.push("El parque cierra tarde (" + horario + "h). Cenad sobre las 19:30-20:00h antes del show.");
    } else {
      partes.push("Podéis cenar en los hoteles a las 20:00-21:00h o en Disney Village.");
    }
    if (planTipo === "pc_standard" || planTipo === "mp_standard") {
      partes.push("\n⚠️ Lucky Nugget: usa bono rápido sobrante, no bono de mesa.");
    }
    partes.push("\n📱 Reservas desde la app de DLP. ¿Dudas? Escríbeme directamente.");

    setPlan(partes.join("\n"));
    setTimeout(function() { resultRef.current && resultRef.current.scrollIntoView({ behavior:"smooth", block:"start" }); }, 100);
    setLoading(false);
  }

  const s = {
    card: { background:"#fff", border:"1px solid #e8e0d5", borderRadius:12, padding:"14px 16px" },
    chip: (selected, color) => ({ padding:"6px 14px", borderRadius:50, border:`2px solid ${selected ? color : '#e0e0e0'}`, background: selected ? color : '#f7f7f9', color: selected ? '#fff' : '#555', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }),
    genBtn: { background: prefsCompletas ? "linear-gradient(135deg,#5B2D8E,#F5287A)" : "#e0e0e0", color: prefsCompletas ? "#fff" : "#999", border:"none", borderRadius:14, padding:"14px 20px", fontSize:14, fontWeight:700, cursor: prefsCompletas ? 'pointer' : 'not-allowed', width:"100%", fontFamily:"inherit", marginTop:8 },
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        <div style={{ ...s.card, borderLeft:'4px solid #2BBCD4' }}>
          <div style={{ fontSize:10, color:'#9d8b78', textTransform:'uppercase', letterSpacing:1.5, marginBottom:6 }}>🍽️ Tu plan de comidas</div>
          <div style={{ fontSize:13, fontWeight:700, color:'#1c1410', marginBottom:4 }}>{cliente?.["Plan de comidas"] || "Sin plan"}</div>
          {bonos?.desc && <div style={{ fontSize:11, color:'#1A8A9E', fontWeight:800, marginBottom:4 }}>{bonos.desc}</div>}
          {bonos?.detalle && <div style={{ fontSize:11, color:'#555', lineHeight:1.5 }}>{bonos.detalle}</div>}
          {planTipo === 'ninguno' && <div style={{ fontSize:11, color:'#aaa' }}>Sin plan contratado · Pagas cada comida en el momento</div>}
        </div>
        <div style={{ ...s.card, borderLeft:'4px solid #F0A500' }}>
          <div style={{ fontSize:10, color:'#9d8b78', textTransform:'uppercase', letterSpacing:1.5, marginBottom:6 }}>🌅 Desayuno · 🌙 Cena en el hotel</div>
          <div style={{ fontSize:11, color:'#aaa', textTransform:'uppercase', letterSpacing:1, marginBottom:2 }}>Desayuno (siempre en el hotel)</div>
          <div style={{ fontSize:13, fontWeight:700, color:'#1c1410', marginBottom:2 }}>{desayuno.rest}</div>
          <div style={{ fontSize:11, color:'#7a6a50', marginBottom:8 }}>{desayuno.tipo}</div>
          <div style={{ fontSize:11, color:'#aaa', textTransform:'uppercase', letterSpacing:1, marginBottom:2 }}>Cenas disponibles en hotel</div>
          <div style={{ fontSize:12, color:'#1c1410', marginBottom:6 }}>{desayuno.cena}</div>
          {desayuno.nota && <div style={{ fontSize:11, color: desayuno.nota.startsWith('⭐') ? '#C01060' : '#7a6a50', background: desayuno.nota.startsWith('⭐') ? '#FEE8F3' : '#f9f7f4', borderRadius:8, padding:'6px 10px', lineHeight:1.4 }}>{desayuno.nota}</div>}
        </div>
      </div>
      <div style={s.card}>
        <div style={{ fontSize:12, fontWeight:800, color:'#1c1410', marginBottom:14 }}>✨ Cuéntanos qué os apetece</div>
        {prefGroups.map(group => (
          <div key={group.key} style={{ marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#555', marginBottom:8 }}>{group.label}</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {group.opts.map(opt => <button key={opt.val} onClick={() => setPref(group.key, opt.val)} style={s.chip(prefs[group.key]===opt.val, accentColors[group.key])}>{opt.label}</button>)}
            </div>
          </div>
        ))}
        <button onClick={generarPlan} disabled={!prefsCompletas || loading} style={s.genBtn}>
          {loading ? '🔮 Creando tu plan mágico...' : '🪄 Crear mi plan de restaurantes personalizado'}
        </button>
        {!prefsCompletas && <p style={{ fontSize:11, color:'#aaa', textAlign:'center', marginTop:6 }}>Selecciona una opción en cada pregunta</p>}
      </div>
      {loading && <div style={{ textAlign:'center', padding:'30px 20px', background:'#fff', borderRadius:12 }}><div style={{ fontSize:32, marginBottom:8 }}>🍽️</div><div style={{ color:'#5B2D8E', fontWeight:700, fontSize:14 }}>Preparando tu plan personalizado...</div></div>}
      {plan && !loading && (
        <div ref={resultRef} style={{ ...s.card, borderLeft:'4px solid #2EC866' }}>
          <div style={{ fontSize:11, color:'#1A9B45', textTransform:'uppercase', letterSpacing:1.5, fontWeight:800, marginBottom:12 }}>✨ Tu plan de restaurantes personalizado</div>
          <div style={{ fontSize:13, lineHeight:1.65, color:'#1c1410', whiteSpace:'pre-wrap' }}>{plan}</div>
          <div style={{ marginTop:16, padding:'12px 14px', background:'#FFF8E1', borderRadius:10, fontSize:11, color:'#7A5000' }}>⚠️ <strong>Recuerda:</strong> Los horarios son estimados. Confirma siempre en la app oficial.</div>
          <a href={FORM_RESTAURANTES} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:10, background:'linear-gradient(135deg,#5B2D8E,#F5287A)', borderRadius:12, padding:'14px 16px', textDecoration:'none', marginTop:12 }}>
            <span style={{ fontSize:20 }}>🍽️</span>
            <div><div style={{ color:'#fff', fontSize:13, fontWeight:700 }}>Solicitar reserva de restaurantes a Lara</div><div style={{ color:'rgba(255,255,255,.7)', fontSize:11 }}>Formulario oficial de Los Viajes de Moli</div></div>
            <span style={{ marginLeft:'auto', color:'#fff', fontSize:16 }}>→</span>
          </a>
        </div>
      )}
      <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:12, padding:'12px 14px', fontSize:11, color:'#92400e' }}>
        ⚠️ <strong>Horarios estimados 2026.</strong> Disney publica los horarios definitivos con ~2 meses de antelación. Confirma siempre en la app oficial de Disneyland Paris.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// PLANIFICADOR INTELIGENTE — Lógica experta de Lara
// Tiempos reales + consejos por hora + peques + restaurantes
// ═══════════════════════════════════════════════════════

// ── ZONAS DE JUEGO / ESPERA PARA PEQUES ──
const ZONAS_PEQUES = {
  dlp: [
    { zona:"Frontierland", nombre:"Adventure Isle", desc:"Adventure Isle está justo al lado de BTM — zona con puentes colgantes, cuevas y toboganes. Los peques pueden explorar mientras adultos hacen BTM o Phantom Manor.", cerca:["btm","phantom"] },
    { zona:"Adventureland", nombre:"La Cabane des Robinson", desc:"Treehouse climbable con vistas. Sin cola, entretenida para peques mientras adultos hacen Indiana Jones.", cerca:["indiana"] },
    { zona:"Discoveryland", nombre:"Café Hyperion", desc:"Gran espacio cubierto con pantallas de dibujos animados y shows en temporadas especiales (Halloween, Navidad). Ideal para un descanso o comida con peques mientras adultos hacen Space Mountain.", cerca:["space","buzz"] },
    { zona:"Discoveryland", nombre:"Les Mystères du Nautilus", desc:"Submarino cubierto y sin prácticamente cola a ninguna hora. Perfecto para refugiarse del calor o la lluvia mientras adultos hacen Space Mountain o Buzz.", cerca:["space","buzz","buzz"] },
    { zona:"Discoveryland", nombre:"Orbitron", desc:"Atracción suave sin restricción de altura. Los peques vuelan en cohetes mientras adultos esperan en Buzz o Space Mountain. En hora extra siempre tiene poca cola.", cerca:["space","buzz"] },
    { zona:"Discoveryland", nombre:"Autopia", desc:"Los peques pueden conducir con un adulto (altura mínima 81cm). Cola baja, cubierta parcialmente. Buena mientras esperan en Space Mountain o Buzz.", cerca:["space","buzz"] },
  ],
  daw: [
    { zona:"Worlds of Pixar", nombre:"Zona de juego Toy Story", desc:"Área temática de Toy Story con juegos para peques. Perfecta mientras adultos hacen Crush Coaster.", cerca:["crush","rc-racer"] },
    { zona:"Toon Studio", nombre:"Cars Quatre Roues Rallye", desc:"Atracción suave sin restricción de altura. El adulto que se queda puede montar con los peques mientras esperan Crush.", cerca:["crush"] },
    { zona:"Campus Avengers", nombre:"Zona de exposiciones Avengers", desc:"Exposición interactiva de superhéroes sin cola. Entretenida para niños mientras adultos hacen Avengers Flight Force.", cerca:["avengers"] },
  ]
};


// ── SECUENCIAS HORA EXTRA DAW ──
// Crush y Frozen son excluyentes — hay que elegir UNO primero
// y luego seguir la secuencia correspondiente
const SECUENCIAS_HE_DAW = {
  frozen: {
    label: "Empezáis por Frozen Ever After ❄️",
    color: "#1a7aaa",
    bg: "#e0f4ff",
    orden: [
      { id:"frozen",     consejo:"Primera parada nada más abrir. En hora extra 30-60 min — el resto del día llega a 120 min. ⚠️ Puede asustar a niños pequeños (caída similar a Piratas)." },
      { id:"ratatouille",consejo:"Segunda. Hora extra siempre. Ve directo al salir de Frozen sin perder tiempo." },
      { id:"paracaidas", consejo:"Tercera. Cola baja en hora extra. Buena opción con niños pequeños." },
      { id:"spiderman",  consejo:"Cuarta. Tiempos bajos en hora extra. También puedes dejarla para el final del día." },
    ],
    aviso: "⚠️ Si Frozen está cerrada por avería → ve directo a Crush Coaster, que se saturará más sin Frozen operativa.",
    despues: "Una vez terminada la hora extra: Crush Coaster tendrá más cola que de costumbre si Frozen también está llena. Considera Premier Access para Crush o hazla al final del día (baja a 30 min antes del cierre)."
  },
  crush: {
    label: "Empezáis por Crush's Coaster 🐢",
    color: "#0a8a5e",
    bg: "#e0fff4",
    orden: [
      { id:"crush",      consejo:"Primera parada obligatoria. LA más demandada — en hora extra 30-60 min, el resto del día puede superar 120 min. 💡 Si vais con niños que no pueden montar: Premier Access + Baby Switch (2-3 personas precio de 1)." },
      { id:"ratatouille",consejo:"Segunda. Hora extra siempre. Ve directo al salir de Crush." },
      { id:"spiderman",  consejo:"Tercera. Tiempos bajos en hora extra." },
      { id:"paracaidas", consejo:"Cuarta. Cola muy baja. Buena para peques." },
    ],
    aviso: "⚠️ Si Crush está cerrado por avería → ve directo a Frozen, que se saturará más sin Crush operativo.",
    despues: "Frozen puedes dejarlo para el final del día — suele bajar a ~30 min antes del cierre. ⚠️ Recuerda: Frozen cierra a las 23:00h, más tarde que el resto del parque."
  }
};

// ── LÓGICA DE COLAS POR HORA (estimada) ──
// Devuelve minutos estimados según hora del día
function colaEstimada(atrId, horaNum) {
  const CURVAS = {
    // DLP
    "peter-pan":  { 8:20, 9:45, 10:70, 11:90, 12:100, 13:90, 14:80, 15:70, 16:60, 17:60, 18:50, 19:40, 20:30, 21:20 },
    "dumbo":      { 8:15, 9:30, 10:45, 11:60, 12:60,  13:50, 14:45, 15:40, 16:35, 17:30, 18:25, 19:20, 20:15, 21:10 },
    "buzz":       { 8:10, 9:25, 10:40, 11:50, 12:55,  13:50, 14:45, 15:40, 16:35, 17:30, 18:20, 19:15, 20:10, 21:10 },
    "btm":        { 8:20, 9:35, 10:50, 11:65, 12:75,  13:70, 14:65, 15:60, 16:55, 17:50, 18:40, 19:25, 20:15, 21:10 },
    "space":      { 8:25, 9:35, 10:45, 11:55, 12:60,  13:55, 14:50, 15:45, 16:40, 17:35, 18:30, 19:20, 20:15, 21:10 },
    "indiana":    { 8:0,  9:25, 10:45, 11:60, 12:70,  13:65, 14:60, 15:55, 16:50, 17:55, 18:45, 19:25, 20:15, 21:10 },
    "pirates":    { 8:0,  9:15, 10:25, 11:30, 12:35,  13:30, 14:25, 15:20, 16:20, 17:20, 18:15, 19:10, 20:10, 21:5  },
    "phantom":    { 8:0,  9:15, 10:20, 11:30, 12:35,  13:30, 14:25, 15:20, 16:20, 17:20, 18:15, 19:10, 20:10, 21:5  },
    "small-world":{ 8:0,  9:5,  10:10, 11:15, 12:20,  13:15, 14:15, 15:15, 16:10, 17:10, 18:10, 19:5,  20:5,  21:5  },
    "meet-mickey":{ 8:0,  9:20, 10:35, 11:45, 12:50,  13:45, 14:40, 15:35, 16:30, 17:25, 18:20, 19:15, 20:0,  21:0  },
    "princess-pavilion":{ 8:0, 9:25, 10:40, 11:55, 12:60, 13:55, 14:50, 15:45, 16:40, 17:35, 18:25, 19:15, 20:0, 21:0 },
    // DAW
    "crush":      { 8:35, 9:55, 10:80, 11:100,12:110, 13:100,14:90, 15:85, 16:80, 17:75, 18:60, 19:45, 20:30, 21:20 },
    "frozen":     { 8:30, 9:50, 10:70, 11:90, 12:100, 13:90, 14:80, 15:75, 16:65, 17:60, 18:50, 19:35, 20:25, 21:15 },
    "ratatouille":{ 8:20, 9:35, 10:50, 11:65, 12:75,  13:65, 14:60, 15:55, 16:50, 17:45, 18:35, 19:20, 20:15, 21:10 },
    "spiderman":  { 8:15, 9:25, 10:40, 11:55, 12:60,  13:55, 14:50, 15:45, 16:35, 17:30, 18:25, 19:15, 20:10, 21:10 },
    "tower":      { 8:0,  9:20, 10:35, 11:45, 12:55,  13:50, 14:45, 15:40, 16:35, 17:30, 18:25, 19:15, 20:10, 21:5  },
    "rapunzel":   { 8:5,  9:10, 10:20, 11:25, 12:30,  13:25, 14:20, 15:20, 16:15, 17:15, 18:15, 19:10, 20:10, 21:10 },
    "avengers":   { 8:0,  9:15, 10:25, 11:35, 12:40,  13:35, 14:30, 15:25, 16:20, 17:20, 18:15, 19:10, 20:5,  21:5  },
    "paracaidas": { 8:10, 9:15, 10:20, 11:25, 12:30,  13:25, 14:20, 15:15, 16:15, 17:10, 18:10, 19:5,  20:5,  21:5  },
  };
  const curva = CURVAS[atrId];
  if (!curva) return null;
  const horas = Object.keys(curva).map(Number).sort((a,b)=>a-b);
  const horaBase = horas.reduce((prev, h) => h <= horaNum ? h : prev, horas[0]);
  return curva[horaBase] || null;
};

// ── TENDENCIA DE COLA ──
// Devuelve si la cola está subiendo, bajando o estable
function tendenciaCola(atrId, horaNum) {
  const actual = colaEstimada(atrId, horaNum);
  const en2h   = colaEstimada(atrId, horaNum + 2);
  if (!actual || !en2h) return "estable";
  const diff = en2h - actual;
  if (diff > 15) return "subiendo";
  if (diff < -15) return "bajando";
  return "estable";
}

// ── MEJOR MOMENTO PARA UNA ATRACCIÓN ──
function mejorMomento(atrId, horaActual, horaCierre) {
  const horas = [];
  for (let h = horaActual; h <= horaCierre - 1; h++) {
    const cola = colaEstimada(atrId, h);
    if (cola !== null) horas.push({ h, cola });
  }
  if (!horas.length) return null;
  return horas.reduce((min, x) => x.cola < min.cola ? x : min, horas[0]);
}

// ── CONSEJO INTELIGENTE POR ATRACCIÓN + HORA ──
function consejoInteligente({ atrId, atrNombre, horaActual, horaCierre, colaReal, tieneBebes, zona }) {
  const colaEst = colaEstimada(atrId, horaActual) || 30;
  const cola = colaReal !== null && colaReal !== undefined ? colaReal : colaEst;
  const tendencia = tendenciaCola(atrId, horaActual);
  const mejor = mejorMomento(atrId, horaActual, horaCierre);
  const minutosParaCierre = (horaCierre - horaActual) * 60;

  // Atracción fuerte con peques
  const atrFuertes = ["btm","indiana","space","crush","avengers","tower","frozen","rapunzel","rc-racer"];
  const esAtraccionFuerte = atrFuertes.includes(atrId);

  const consejos = [];

  // ── CONSEJO DE COLA ACTUAL ──
  if (cola <= 15) {
    consejos.push({ tipo:"verde", texto:`Cola muy baja ahora mismo (${cola} min) — ¡hazla ya! Es el momento perfecto.` });
  } else if (cola <= 30) {
    consejos.push({ tipo:"verde", texto:`Cola moderada (${cola} min). Buen momento para hacerla sin perder mucho tiempo.` });
  } else if (cola <= 60 && tendencia === "bajando") {
    consejos.push({ tipo:"amarillo", texto:`Ahora tiene ${cola} min, pero la cola está bajando. Puedes hacerla ahora o esperar un poco más — en un par de horas irá bajando.` });
  } else if (cola <= 60 && tendencia === "subiendo") {
    consejos.push({ tipo:"amarillo", texto:`Cola de ${cola} min y subiendo. Si la quieres hacer hoy, hazla ahora antes de que suba más.` });
  } else if (cola > 60) {
    if (mejor && mejor.cola < cola - 20 && mejor.h > horaActual) {
      const horaLabel = `${mejor.h}:00h`;
      consejos.push({ tipo:"naranja", texto:`Ahora tiene ${cola} min — bastante espera. Según mis datos, sobre las ${horaLabel} suele bajar bastante (aprox. ${mejor.cola} min). Si no tienes prisa, puede valer la pena esperar.` });
    } else {
      consejos.push({ tipo:"rojo", texto:`Cola alta ahora (${cola} min). Si la quieres hacer hoy, el final del día suele ser el mejor momento para las colas más largas.` });
    }
  }

  // ── CONSEJO FANTASYLAND (cierra antes) ──
  const atrFantasyland = ["peter-pan","dumbo","small-world","meet-mickey","princess-pavilion","snow-white","pinocchio","carrousel","casey","contes","tea-cups","labyrinth"];
  if (atrFantasyland.includes(atrId) && horaActual >= 19) {
    consejos.push({ tipo:"rojo", texto:`⚠️ Atención: Fantasyland cierra 1 hora antes del show nocturno. Si el parque cierra tarde, esta zona puede estar cerrando ya. No la dejes para el último momento.` });
  }

  // ── CONSEJO BABY SWITCH + ZONA PEQUES ──
  if (tieneBebes && esAtraccionFuerte) {
    const atrBabySwitch = ["btm","indiana","space","crush","avengers","tower","spiderman","rc-racer"];
    const zonaPequesInfo = ZONAS_PEQUES[zona]?.find(z => z.cerca.includes(atrId));
    const usaBabySwitch = atrBabySwitch.includes(atrId);

    if (usaBabySwitch) {
      const esCrush = atrId === "crush";
      consejos.push({
        tipo:"baby",
        texto: esCrush
          ? `👶 Baby Switch + Premier Access: compra Premier Access para Crush. Con el precio de 1 persona entran 2 o 3 usando Baby Switch. El adulto que se queda con los peques entra después directamente sin cola.`
          : `👶 Baby Switch gratuito: pide Baby Switch al Cast Member de la entrada. El adulto que se queda con los peques puede entrar después sin hacer cola de nuevo.`
      });
    }

    if (zonaPequesInfo) {
      consejos.push({
        tipo:"peques",
        texto: `🧒 Mientras esperas: ${zonaPequesInfo.nombre} está cerca — ${zonaPequesInfo.desc}`
      });
    }
  }

  // ── CONSEJO DE TIEMPO RESTANTE ──
  if (minutosParaCierre < 90 && cola > 30) {
    consejos.push({ tipo:"rojo", texto:`⚠️ Queda poco para el cierre y la cola es alta. Valora si merece la pena o si prefieres aprovechar ese tiempo en otras atracciones.` });
  }

  return consejos;
}

// ── ATRACCIONES COMPLETAS ──
const ATRACCIONES_DLP = [
  { id:"peter-pan",   nombre:"Peter Pan's Flight",         zona:"dlp", subzona:"Fantasyland",   emoji:"🧚", intensidad:"suave",    altura:null, heEsencial:true,  heOrden:1, babySwitch:false, susto:false, fantasyland:true },
  { id:"dumbo",       nombre:"Dumbo",                       zona:"dlp", subzona:"Fantasyland",   emoji:"🐘", intensidad:"suave",    altura:null, heEsencial:true,  heOrden:2, babySwitch:false, susto:false, fantasyland:true },
  { id:"buzz",        nombre:"Buzz Lightyear Laser Blast",  zona:"dlp", subzona:"Discoveryland", emoji:"🚀", intensidad:"suave",    altura:null, heEsencial:true,  heOrden:3, babySwitch:false, susto:false, fantasyland:false },
  { id:"btm",         nombre:"Big Thunder Mountain",        zona:"dlp", subzona:"Frontierland",  emoji:"⛰️", intensidad:"media",   altura:102,  heEsencial:true,  heOrden:4, babySwitch:true,  susto:false, fantasyland:false },
  { id:"space",       nombre:"Space Mountain / Star Wars",  zona:"dlp", subzona:"Discoveryland", emoji:"🌌", intensidad:"fuerte",  altura:120,  heEsencial:false, heOrden:5, babySwitch:true,  susto:false, fantasyland:false },
  { id:"indiana",     nombre:"Indiana Jones™",              zona:"dlp", subzona:"Adventureland", emoji:"🎩", intensidad:"media",   altura:140,  heEsencial:false, heOrden:null, babySwitch:true, susto:false, fantasyland:false },
  { id:"pirates",     nombre:"Pirates of the Caribbean",    zona:"dlp", subzona:"Adventureland", emoji:"☠️", intensidad:"suave",   altura:null, heEsencial:false, heOrden:null, babySwitch:false, susto:false, fantasyland:false },
  { id:"phantom",     nombre:"Phantom Manor",               zona:"dlp", subzona:"Frontierland",  emoji:"👻", intensidad:"suave",   altura:null, heEsencial:false, heOrden:null, babySwitch:false, susto:false, fantasyland:false },
  { id:"small-world", nombre:"It's a Small World",          zona:"dlp", subzona:"Fantasyland",   emoji:"🌍", intensidad:"suave",   altura:null, heEsencial:false, heOrden:null, babySwitch:false, susto:false, fantasyland:true },
  { id:"meet-mickey", nombre:"Meet Mickey Mouse",           zona:"dlp", subzona:"Fantasyland",   emoji:"🐭", intensidad:"personaje",altura:null, heEsencial:false, heOrden:null, babySwitch:false, susto:false, fantasyland:true },
  { id:"princess-pavilion", nombre:"Princess Pavilion",    zona:"dlp", subzona:"Fantasyland",   emoji:"👸", intensidad:"personaje",altura:null, heEsencial:false, heOrden:null, babySwitch:false, susto:false, fantasyland:true },
  { id:"snow-white",  nombre:"Blanche-Neige et les Sept Nains", zona:"dlp", subzona:"Fantasyland", emoji:"🍎", intensidad:"suave", altura:null, heEsencial:false, heOrden:null, babySwitch:false, susto:true, fantasyland:true },
  { id:"tea-cups",    nombre:"Mad Hatter's Tea Cups",       zona:"dlp", subzona:"Fantasyland",   emoji:"🍵", intensidad:"suave",   altura:null, heEsencial:false, heOrden:null, babySwitch:false, susto:false, fantasyland:true },
  { id:"nautilus",    nombre:"Les Mystères du Nautilus",    zona:"dlp", subzona:"Discoveryland", emoji:"🐙", intensidad:"suave",   altura:null, heEsencial:false, heOrden:null, babySwitch:false, susto:false, fantasyland:false },
];

const ATRACCIONES_DAW = [
  { id:"crush",     nombre:"Crush's Coaster",                  zona:"daw", subzona:"Toon Studio",      emoji:"🐢", intensidad:"media",  altura:107, heEsencial:true,  heOrden:1, babySwitch:true,  susto:false, fantasyland:false },
  { id:"frozen",    nombre:"Frozen Ever After ❄️",              zona:"daw", subzona:"World of Frozen",  emoji:"❄️", intensidad:"suave",  altura:null, heEsencial:true, heOrden:2, babySwitch:false, susto:true,  fantasyland:false },
  { id:"ratatouille",nombre:"Ratatouille",                     zona:"daw", subzona:"Worlds of Pixar",  emoji:"🐀", intensidad:"suave",  altura:null, heEsencial:true,  heOrden:3, babySwitch:false, susto:false, fantasyland:false },
  { id:"spiderman", nombre:"Spider-Man WEB Adventure",         zona:"daw", subzona:"Campus Avengers",  emoji:"🕷️", intensidad:"suave", altura:null,  heEsencial:false, heOrden:4, babySwitch:true,  susto:false, fantasyland:false },
  { id:"tower",     nombre:"Tower of Terror",                  zona:"daw", subzona:"Studio 1",         emoji:"🏨", intensidad:"fuerte", altura:102,  heEsencial:false, heOrden:null, babySwitch:true, susto:false, fantasyland:false },
  { id:"rapunzel",  nombre:"Tangled Spin 🌸",zona:"daw", subzona:"World of Frozen",  emoji:"🌸", intensidad:"suave",  altura:null, heEsencial:false, heOrden:null, babySwitch:false, susto:true, fantasyland:false },
  { id:"avengers",  nombre:"Avengers Assemble: Flight Force",  zona:"daw", subzona:"Campus Avengers",  emoji:"🦸", intensidad:"fuerte", altura:140,  heEsencial:false, heOrden:null, babySwitch:true,  susto:false, fantasyland:false },
  { id:"paracaidas",nombre:"Toy Soldiers Parachute Drop",      zona:"daw", subzona:"Worlds of Pixar",  emoji:"🪂", intensidad:"suave",  altura:null, heEsencial:false, heOrden:null, babySwitch:false, susto:false, fantasyland:false },
  { id:"rc-racer",  nombre:"RC Racer",                         zona:"daw", subzona:"Worlds of Pixar",  emoji:"🏎️", intensidad:"media", altura:120,  heEsencial:false, heOrden:null, babySwitch:true,  susto:false, fantasyland:false },
  { id:"slinky",    nombre:"Slinky Dog Zigzag Spin",           zona:"daw", subzona:"Worlds of Pixar",  emoji:"🐶", intensidad:"suave",  altura:null, heEsencial:false, heOrden:null, babySwitch:false, susto:false, fantasyland:false },
];

const TODAS_ATRACCIONES = [...ATRACCIONES_DLP, ...ATRACCIONES_DAW];

// ── NOMBRE → ID para tiempos reales ──
const NOMBRE_A_ID = {
  "Peter Pan's Flight":"peter-pan","Dumbo the Flying Elephant":"dumbo",
  "Buzz Lightyear Laser Blast":"buzz","Big Thunder Mountain":"btm",
  "Star Wars Hyperspace Mountain":"space","Indiana Jones and the Temple of Peril":"indiana",
  "Pirates of the Caribbean":"pirates","Phantom Manor":"phantom",
  "it's a small world":"small-world","It's a Small World":"small-world",
  "Princess Pavilion":"princess-pavilion","Meet Mickey Mouse":"meet-mickey",
  "Blanche-Neige et les Sept Nains":"snow-white","Mad Hatter's Tea Cups":"tea-cups",
  "Les Mystères du Nautilus":"nautilus",
  "Crush's Coaster":"crush","Frozen Ever After":"frozen",
  "Ratatouille: The Adventure":"ratatouille","Spider-Man W.E.B. Adventure":"spiderman",
  "The Twilight Zone Tower of Terror":"tower","La Tanière du Dragon":"rapunzel",
  "Avengers Assemble: Flight Force":"avengers","Toy Soldiers Parachute Drop":"paracaidas",
  "RC Racer":"rc-racer","Slinky Dog Zigzag Spin":"slinky",
};

// ── COLORES ──
const C = {
  verde:  { bg:"#e8fdf0", border:"#2EC866", color:"#0a5a28", icon:"✅" },
  amarillo:{ bg:"#fff8e0", border:"#F0A500", color:"#7a4a00", icon:"💡" },
  naranja:{ bg:"#fff3e0", border:"#FF8C00", color:"#8a3a00", icon:"⏳" },
  rojo:   { bg:"#fff0f0", border:"#DC143C", color:"#8a0010", icon:"⚠️" },
  baby:   { bg:"#ffe0ef", border:"#F5287A", color:"#8a003a", icon:"👶" },
  peques: { bg:"#ede0ff", border:"#5B2D8E", color:"#3a1a6e", icon:"🧒" },
  info:   { bg:"#dffaff", border:"#2BBCD4", color:"#0a5a6e", icon:"ℹ️" },
};

function ConsejoBox({ tipo, texto }) {
  const c = C[tipo] || C.info;
  return (
    <div style={{ background:c.bg, border:`1px solid ${c.border}`, borderRadius:10, padding:"9px 12px", display:"flex", gap:8, alignItems:"flex-start", marginTop:6 }}>
      <span style={{ fontSize:14, flexShrink:0 }}>{c.icon}</span>
      <div style={{ fontSize:12, color:c.color, fontWeight:700, lineHeight:1.55 }}>{texto}</div>
    </div>
  );
}

function WaitBadge({ min, status, cargando }) {
  if (cargando) return <span style={{ fontSize:10, background:"#f0f0f0", color:"#999", padding:"2px 8px", borderRadius:10, fontWeight:800 }}>⏳ cargando</span>;
  if (status === "DOWN")         return <span style={{ fontSize:10, background:"#fff0f0", color:"#8a0010", padding:"2px 8px", borderRadius:10, fontWeight:800 }}>🔴 Parada técnica</span>;
  if (status === "CLOSED")       return <span style={{ fontSize:10, background:"#f0f0f0", color:"#666", padding:"2px 8px", borderRadius:10, fontWeight:800 }}>⚫ Cerrada hoy</span>;
  if (status === "REFURBISHMENT")return <span style={{ fontSize:10, background:"#f0f0f0", color:"#666", padding:"2px 8px", borderRadius:10, fontWeight:800 }}>🔧 En obras</span>;
  if (min === null || min === undefined) return null;
  const c = min <= 15 ? "#0a5a28" : min <= 30 ? "#7a4a00" : min <= 60 ? "#8a3a00" : "#8a0010";
  const bg = min <= 15 ? "#e8fdf0" : min <= 30 ? "#fff8e0" : min <= 60 ? "#fff3e0" : "#fff0f0";
  return <span style={{ fontSize:10, background:bg, color:c, padding:"2px 8px", borderRadius:10, fontWeight:800 }}>🕐 {min} min</span>;
}

// ══════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════
// RESTAURANTES POR ZONA — datos reales de Lara
// ═══════════════════════════════════════════════════════
const RESTS_ZONA = {
  dlp: {
    "Main Street": [
      { n:"Walt's Restaurant", tipo:"mesa", emoji:"🕯️", consejo:"El más especial del parque. Vistas al castillo. Reserva con antelación.", plan:["mp","plus","sin"] },
      { n:"Market House Deli", tipo:"rapido", emoji:"🥪", consejo:"Sándwich con forma de Mickey. Beignet chocolate. Ideal para esperar el show.", plan:["standard","sin"] },
    ],
    "Adventureland": [
      { n:"Blue Lagoon", tipo:"mesa", emoji:"🏝️", consejo:"DENTRO de la atracción de Piratas. Experiencia única. Reserva con meses.", plan:["mp","plus","sin"] },
      { n:"Colonel Hathi's Pizza Outpost", tipo:"rapido", emoji:"🍕", consejo:"El ÚNICO restaurante con pizza del Parque Disneyland. Si quieren pizza, aquí.", plan:["standard","sin"] },
    ],
    "Frontierland": [
      { n:"Cowboy Cookout BBQ", tipo:"buffet", emoji:"🥩", consejo:"Barbacoa del Oeste. ⚠️ Cierra antes que otros — verifica horario en la app.", plan:["mp","plus"] },
      { n:"Lucky Nugget Saloon", tipo:"rapido", emoji:"🎰", consejo:"⚠️ Descuenta bono de mesa aunque es comida rápida. Usa bono rápido sobrante.", plan:["standard","sin"] },
    ],
    "Discoveryland": [
      { n:"Café Hyperion", tipo:"rapido", emoji:"☕", consejo:"Grande, cubierto, enchufes EU. Shows de temporada. El refugio del parque con lluvia.", plan:["standard","sin"] },
    ],
    "Fantasyland": [
      { n:"Auberge de Cendrillon", tipo:"mesa", emoji:"👸", consejo:"Princesas + Mickey. Solo plan Extra Plus/Premium o suplemento. Reserva con meses.", plan:["extra_plus","premium","sin"] },
      { n:"Pizzeria Bella Notte", tipo:"rapido", emoji:"🍕", consejo:"Pizza en Fantasyland. ⚠️ Cierra 1h antes del show nocturno.", plan:["standard","sin"] },
    ],
  },
  daw: {
    "Campus Avengers": [
      { n:"PYM Kitchen", tipo:"buffet", emoji:"🦸", consejo:"Buffet temático Avengers. Personajes Marvel. Reserva con antelación.", plan:["mp","plus"] },
      { n:"Stark Factory", tipo:"rapido", emoji:"⚡", consejo:"Raciones MUY grandes con bono rápido. Pasta infantil = misma cantidad que adulto.", plan:["standard","sin"] },
    ],
    "Worlds of Pixar": [
      { n:"Chez Rémy", tipo:"mesa", emoji:"🐀", consejo:"El más famoso de DAW. ~55€/persona. Reserva con semanas.", plan:["mp","plus","sin"] },
    ],
    "World of Frozen": [
      { n:"The Regal View Restaurant", tipo:"mesa", emoji:"🌊", consejo:"NUEVO 2026. Vistas al lago. Desayuno/comida/cena. Princesas con plan Premium. Reserva YA.", plan:["mp","plus","premium","sin"] },
      { n:"Restaurante rápido Frozen", tipo:"rapido", emoji:"❄️", consejo:"Albóndigas y salmón. Poca capacidad — si hay mucha gente, mejor otra zona.", plan:["standard","sin"] },
    ],
    "Studio 1": [
      { n:"World Premier Café", tipo:"rapido", emoji:"🌿", consejo:"Al entrar o salir de DAW. Hamburguesas.", plan:["standard","sin"] },
    ],
  },
};

function PlanificadorAtracciones({ cliente }) {
  const [zona, setZona]             = useState(null);
  const [horaExtra, setHoraExtra]   = useState(null);
  const [tieneBebes, setTieneBebes] = useState(null);
  const [horaActual, setHoraActual] = useState(null); // "9", "10", etc.
  const [horaCierre, setHoraCierre] = useState(null); // "22", "21", etc.
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [paso, setPaso]             = useState(1);
  const [vista, setVista]           = useState("config"); // "config" | "consejo" | "ruta"
  const [atrActivaConsejo, setAtrActivaConsejo] = useState(null);
  const [heEleccionDAW, setHeEleccionDAW] = useState(null); // "frozen" | "crush" | null

  // Tiempos reales
  const [tiemposReales, setTiemposReales]       = useState({});
  const [cargandoTiempos, setCargandoTiempos]   = useState(false);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
  const [errorAPI, setErrorAPI]                 = useState(false);

  const atrDisponibles = zona === "ambos" ? TODAS_ATRACCIONES
    : zona === "dlp" ? ATRACCIONES_DLP
    : zona === "daw" ? ATRACCIONES_DAW : [];

  const horaNum = parseInt(horaActual) || 10;
  const cierreNum = parseInt(horaCierre) || 22;

  // ── Cargar tiempos reales ──
  const cargarTiempos = async (z) => {
    if (!z) return;
    setCargandoTiempos(true); setErrorAPI(false);
    const parques = z === "ambos" ? ["dlp","daw"] : [z];
    try {
      const results = await Promise.all(parques.map(p =>
        fetch(`/api/waittimes?parque=${p}`).then(r => r.json())
      ));
      const mapa = {};
      results.forEach(data => {
        if (data.ok && data.atracciones) {
          data.atracciones.forEach(a => {
            const id = NOMBRE_A_ID[a.nombre] || NOMBRE_A_ID[a.nombre?.trim()];
            if (id) mapa[id] = { waitTime: a.waitTime, status: a.status };
          });
        } else { setErrorAPI(true); }
      });
      setTiemposReales(mapa);
      setUltimaActualizacion(new Date().toLocaleTimeString("es-ES", { hour:"2-digit", minute:"2-digit" }));
    } catch { setErrorAPI(true); }
    setCargandoTiempos(false);
  };

  const toggleAtr = (id) => setSeleccionadas(p => p.includes(id) ? p.filter(x=>x!==id) : [...p,id]);

  // ── Vista: consejo para una atracción específica ──
  const abrirConsejo = (atr) => { setAtrActivaConsejo(atr); setVista("consejo"); };

  // ── Generar ruta ordenada ──
  const generarRuta = () => {
    const sels = TODAS_ATRACCIONES.filter(a => seleccionadas.includes(a.id));
    // Ordenar por: 1) hora extra esenciales, 2) cola más baja ahora
    return sels.sort((a, b) => {
      if (horaExtra === "si") {
        if (a.heEsencial && !b.heEsencial) return -1;
        if (!a.heEsencial && b.heEsencial) return 1;
        if (a.heEsencial && b.heEsencial) return (a.heOrden||99) - (b.heOrden||99);
      }
      const trA = tiemposReales[a.id];
      const trB = tiemposReales[b.id];
      const colaA = trA?.waitTime ?? colaEstimada(a.id, horaNum) ?? 50;
      const colaB = trB?.waitTime ?? colaEstimada(b.id, horaNum) ?? 50;
      return colaA - colaB;
    });
  };

  const s = {
    card: { background:"#fff", border:"1px solid #e8e0d5", borderRadius:14, padding:"14px 16px" },
    optBtn: (sel, color="#5B2D8E") => ({
      flex:1, padding:"9px 12px", borderRadius:12,
      border:`2px solid ${sel ? color : "#e0e0e0"}`,
      background: sel ? color : "#f7f7f9",
      color: sel ? "#fff" : "#555",
      fontSize:12, fontWeight:700, cursor:"pointer",
      fontFamily:"inherit", transition:"all .15s", minWidth:100,
    }),
    atrCard: (sel, cerrada) => ({
      border:`2px solid ${sel ? "#5B2D8E" : cerrada ? "#f0f0f0" : "#e8e0d5"}`,
      background: sel ? "#f0e8ff" : cerrada ? "#fafafa" : "#fff",
      borderRadius:12, padding:"10px 12px",
      cursor: cerrada ? "not-allowed" : "pointer",
      transition:"all .15s", opacity: cerrada ? 0.5 : 1,
    }),
    nextBtn: (ok) => ({
      width:"100%", marginTop:12,
      background: ok ? "linear-gradient(135deg,#5B2D8E,#F5287A)" : "#e0e0e0",
      color: ok ? "#fff" : "#999", border:"none", borderRadius:12,
      padding:"13px", fontSize:14, fontWeight:700,
      cursor: ok ? "pointer" : "not-allowed", fontFamily:"inherit",
    }),
  };

  const coloresInt = {
    suave:    { bg:"#e8fdf0", color:"#0a5a28", label:"Suave" },
    media:    { bg:"#fff8e0", color:"#7a4a00", label:"Media" },
    fuerte:   { bg:"#fff0f0", color:"#8a0010", label:"Fuerte ⚠️" },
    personaje:{ bg:"#ede0ff", color:"#5B2D8E", label:"Personaje 🌟" },
  };

  // ════════════════════════
  // VISTA: CONSEJO ESPECÍFICO
  // ════════════════════════
  if (vista === "consejo" && atrActivaConsejo) {
    const a = atrActivaConsejo;
    const tr = tiemposReales[a.id];
    const colaReal = tr?.waitTime ?? null;
    const colaEst = colaEstimada(a.id, horaNum);
    const cola = colaReal !== null ? colaReal : colaEst;
    const consejos = consejoInteligente({ atrId:a.id, atrNombre:a.nombre, horaActual:horaNum, horaCierre:cierreNum, colaReal, tieneBebes, zona });
    const mejor = mejorMomento(a.id, horaNum, cierreNum);

    return (
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        <button onClick={() => setVista("config")} style={{ background:"none", border:"none", color:"#5B2D8E", fontSize:13, fontWeight:800, cursor:"pointer", textAlign:"left", padding:0, fontFamily:"inherit" }}>← Volver al planificador</button>

        <div style={{ background:"linear-gradient(135deg,#5B2D8E,#F5287A)", borderRadius:14, padding:"16px 18px", color:"white" }}>
          <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:20 }}>{a.emoji} {a.nombre}</div>
          <div style={{ fontSize:12, opacity:.8, marginTop:2 }}>{a.subzona} · {zona === "dlp" ? "Disneyland Park" : "Disney Adventure World"}</div>
        </div>

        {/* Cola ahora */}
        <div style={s.card}>
          <div style={{ fontSize:11, fontWeight:900, color:"#999", textTransform:"uppercase", letterSpacing:1.5, marginBottom:8 }}>Cola ahora mismo</div>
          <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
            <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:28, color: cola <= 20 ? "#2EC866" : cola <= 45 ? "#F0A500" : cola <= 70 ? "#FF6347" : "#DC143C" }}>
              {tr?.status === "DOWN" ? "🔴" : tr?.status === "CLOSED" ? "⚫" : cola !== null ? `${cola} min` : "—"}
            </div>
            <div>
              {tr ? (
                <div style={{ fontSize:11, color:"#2EC866", fontWeight:800 }}>🟢 Dato en directo · {ultimaActualizacion}</div>
              ) : (
                <div style={{ fontSize:11, color:"#F0A500", fontWeight:800 }}>🟡 Estimación según mis datos · {horaNum}:00h</div>
              )}
              <div style={{ fontSize:11, color:"#999", marginTop:2 }}>
                Tendencia: {tendenciaCola(a.id, horaNum) === "bajando" ? "📉 bajando" : tendenciaCola(a.id, horaNum) === "subiendo" ? "📈 subiendo" : "➡️ estable"}
              </div>
            </div>
          </div>
        </div>

        {/* Mejor momento */}
        {mejor && mejor.h > horaNum && mejor.cola < (cola || 99) - 15 && (
          <div style={{ ...s.card, borderLeft:"4px solid #2EC866" }}>
            <div style={{ fontSize:11, fontWeight:900, color:"#0a5a28", textTransform:"uppercase", letterSpacing:1.5, marginBottom:4 }}>⭐ Mejor momento hoy</div>
            <div style={{ fontSize:13, color:"#1c1410", fontWeight:700 }}>
              Sobre las <strong>{mejor.h}:00h</strong> — aprox. {mejor.cola} min de espera
            </div>
            <div style={{ fontSize:11, color:"#555", marginTop:4 }}>Según mis datos de afluencia habitual para esta atracción.</div>
          </div>
        )}

        {/* Consejos */}
        <div style={s.card}>
          <div style={{ fontSize:11, fontWeight:900, color:"#999", textTransform:"uppercase", letterSpacing:1.5, marginBottom:6 }}>💜 Consejo de Lara</div>
          {consejos.map((c, i) => <ConsejoBox key={i} tipo={c.tipo} texto={c.texto} />)}
        </div>

        {/* Altura mínima */}
        {a.altura && (
          <div style={{ background:"#fff0f0", border:"1px solid #ffcdd2", borderRadius:10, padding:"10px 14px", fontSize:12, color:"#8a0010", fontWeight:700 }}>
            📏 Altura mínima: <strong>{a.altura} cm</strong>
          </div>
        )}

        {/* Tabla colas por hora */}
        <div style={s.card}>
          <div style={{ fontSize:11, fontWeight:900, color:"#999", textTransform:"uppercase", letterSpacing:1.5, marginBottom:10 }}>📊 Colas estimadas a lo largo del día</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {[9,10,11,12,13,14,15,16,17,18,19,20,21].map(h => {
              const c = colaEstimada(a.id, h);
              if (c === null || h > cierreNum) return null;
              const bg = c <= 15 ? "#e8fdf0" : c <= 30 ? "#fff8e0" : c <= 60 ? "#fff3e0" : "#fff0f0";
              const col = c <= 15 ? "#0a5a28" : c <= 30 ? "#7a4a00" : c <= 60 ? "#8a3a00" : "#8a0010";
              const esAhora = h === horaNum;
              return (
                <div key={h} style={{ background:bg, border:`${esAhora ? "2px" : "1px"} solid ${esAhora ? "#5B2D8E" : col}`, borderRadius:8, padding:"5px 9px", textAlign:"center", minWidth:48 }}>
                  <div style={{ fontSize:10, color:"#999", fontWeight:700 }}>{h}:00h</div>
                  <div style={{ fontSize:12, fontWeight:900, color:col }}>{c} min</div>
                  {esAhora && <div style={{ fontSize:9, color:"#5B2D8E", fontWeight:900 }}>ahora</div>}
                </div>
              );
            })}
          </div>
          <div style={{ fontSize:10, color:"#aaa", marginTop:8 }}>Estimaciones para afluencia media-alta. Pueden variar según temporada y condiciones del día.</div>
        </div>

        <button onClick={() => setVista("config")} style={{ background:"none", border:"2px solid #e0d8f0", borderRadius:12, padding:"10px", color:"#5B2D8E", fontFamily:"inherit", fontWeight:800, fontSize:13, cursor:"pointer" }}>
          ← Volver al planificador
        </button>
      </div>
    );
  }

  // ════════════════════════
  // VISTA: RUTA DEL DÍA
  // ════════════════════════
  if (vista === "ruta") {
    const ruta = generarRuta();
    const hayBabySwitch = tieneBebes === "si" && ruta.some(a => a.babySwitch);

    return (
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        <div style={{ background:"linear-gradient(135deg,#5B2D8E,#F5287A)", borderRadius:14, padding:"16px 18px", color:"white" }}>
          <div style={{ fontSize:11, opacity:.8, letterSpacing:1.5, textTransform:"uppercase", marginBottom:3 }}>Tu ruta de hoy</div>
          <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:18 }}>{ruta.length} atracciones · Orden optimizado</div>
          <div style={{ fontSize:12, opacity:.85, marginTop:3 }}>
            {horaExtra === "si" ? "⭐ Hora extra 8:30h · " : ""}Parque cierra a las {horaCierre}:00h
          </div>
        </div>

        {/* Estado tiempos reales */}
        <div style={{ ...s.card, borderLeft:`4px solid ${Object.keys(tiemposReales).length > 0 && !errorAPI ? "#2EC866" : "#F0A500"}` }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, flexWrap:"wrap" }}>
            <div style={{ fontSize:12, fontWeight:800, color: Object.keys(tiemposReales).length > 0 && !errorAPI ? "#0a5a28" : "#7a4a00" }}>
              {Object.keys(tiemposReales).length > 0 && !errorAPI ? `🟢 Tiempos en directo · ${ultimaActualizacion}` : errorAPI ? "🟡 Tiempos estimados (API no disponible)" : "⚪ Sin tiempos en directo"}
            </div>
            <button onClick={() => cargarTiempos(zona)} disabled={cargandoTiempos}
              style={{ background:"none", border:"1px solid #2EC866", borderRadius:20, padding:"3px 12px", color:"#0a5a28", fontSize:11, fontWeight:800, cursor:"pointer", fontFamily:"inherit" }}>
              {cargandoTiempos ? "⏳" : "🔄 Actualizar"}
            </button>
          </div>
          <div style={{ fontSize:11, color:"#555", marginTop:5 }}>📱 Revisa siempre la app oficial de Disneyland Paris antes de cada atracción.</div>
        </div>

        {/* Baby Switch resumen */}
        {hayBabySwitch && (
          <div style={{ background:"linear-gradient(135deg,#FFE0EF,#fff0f8)", border:"2px solid #F5287A", borderRadius:14, padding:"13px 15px" }}>
            <div style={{ fontFamily:"'Fredoka One',cursive", color:"#F5287A", fontSize:14, marginBottom:6 }}>👶 Baby Switch disponible en tu ruta</div>
            {ruta.filter(a => a.babySwitch).map(a => (
              <div key={a.id} style={{ background:"white", borderRadius:9, padding:"8px 11px", marginTop:6, fontSize:12, color:"#555", lineHeight:1.5 }}>
                <strong style={{ color:"#5B2D8E" }}>{a.emoji} {a.nombre}:</strong>{" "}
                {a.id === "crush" ? "💡 Premier Access + Baby Switch — 2-3 personas con precio de 1. El adulto que espera entra sin cola." : "Baby Switch gratuito. Pídelo al Cast Member de la entrada."}
              </div>
            ))}
          </div>
        )}

        {/* SECUENCIA HORA EXTRA DAW */}
        {horaExtra === "si" && (zona === "daw" || zona === "ambos") && heEleccionDAW && (
          <div style={{ background: SECUENCIAS_HE_DAW[heEleccionDAW].bg, border:`2px solid ${SECUENCIAS_HE_DAW[heEleccionDAW].color}`, borderRadius:14, padding:"13px 15px" }}>
            <div style={{ fontFamily:"'Fredoka One',cursive", color: SECUENCIAS_HE_DAW[heEleccionDAW].color, fontSize:14, marginBottom:8 }}>
              ⭐ Hora Extra — {heEleccionDAW === "frozen" ? "❄️" : "🐢"} {SECUENCIAS_HE_DAW[heEleccionDAW].label}
            </div>
            {SECUENCIAS_HE_DAW[heEleccionDAW].orden.map((a, i) => {
              const atrInfo = TODAS_ATRACCIONES.find(x => x.id === a.id);
              const tr = tiemposReales[a.id];
              return (
                <div key={a.id} style={{ display:"flex", gap:8, alignItems:"flex-start", padding:"6px 0", borderBottom: i < SECUENCIAS_HE_DAW[heEleccionDAW].orden.length-1 ? "1px solid rgba(0,0,0,.07)" : "none" }}>
                  <div style={{ width:22, height:22, borderRadius:"50%", background: SECUENCIAS_HE_DAW[heEleccionDAW].color, color:"white", fontSize:11, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{i+1}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                      <span style={{ fontSize:13, fontWeight:800, color:"#1c1410" }}>{atrInfo?.emoji} {atrInfo?.nombre}</span>
                      {tr && <WaitBadge min={tr.waitTime} status={tr.status} cargando={cargandoTiempos} />}
                    </div>
                    <div style={{ fontSize:11, color:"#555", lineHeight:1.4, marginTop:2 }}>{a.consejo}</div>
                  </div>
                </div>
              );
            })}
            <div style={{ marginTop:8, fontSize:11, fontWeight:700, color:"#8a3a00", background:"rgba(255,255,255,.6)", borderRadius:8, padding:"6px 10px" }}>
              {SECUENCIAS_HE_DAW[heEleccionDAW].aviso}
            </div>
          </div>
        )}

        {/* Lista ruta */}
        {ruta.map((a, i) => {
          const tr = tiemposReales[a.id];
          const colaR = tr?.waitTime ?? null;
          const colaE = colaEstimada(a.id, horaNum);
          const cola = colaR !== null ? colaR : colaE;
          const cerrada = tr?.status === "CLOSED" || tr?.status === "REFURBISHMENT" || tr?.status === "DOWN";
          const intInfo = coloresInt[a.intensidad];
          const zonaJuego = tieneBebes === "si" && ZONAS_PEQUES[zona]?.find(z => z.cerca.includes(a.id));

          return (
            <div key={a.id} style={{ borderRadius:14, overflow:"hidden", boxShadow:"0 2px 10px rgba(91,45,142,.08)" }}>
              {/* Header atracción */}
              <div style={{ background: cerrada ? "#f0f0f0" : i === 0 ? "linear-gradient(135deg,#5B2D8E,#8B1FCC)" : "#faf8ff", borderTop:`3px solid ${cerrada ? "#ccc" : i === 0 ? "#5B2D8E" : "#e8e0f8"}`, padding:"11px 14px", display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:28, height:28, borderRadius:"50%", background: cerrada ? "#ccc" : i === 0 ? "rgba(255,255,255,.2)" : "#5B2D8E", border: i === 0 ? "2px solid rgba(255,255,255,.4)" : "none", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:13, fontWeight:900, flexShrink:0 }}>{i+1}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:900, fontSize:14, color: cerrada ? "#999" : i === 0 ? "white" : "#1c1410" }}>{a.emoji} {a.nombre}</div>
                  <div style={{ display:"flex", gap:5, marginTop:3, flexWrap:"wrap" }}>
                    <span style={{ fontSize:10, fontWeight:800, background: i===0 ? "rgba(255,255,255,.2)" : intInfo.bg, color: i===0 ? "white" : intInfo.color, padding:"1px 7px", borderRadius:10 }}>{intInfo.label}</span>
                    {a.altura && <span style={{ fontSize:10, fontWeight:800, background:"#fff0f0", color:"#8a0010", padding:"1px 7px", borderRadius:10 }}>📏 {a.altura}cm</span>}
                    {horaExtra === "si" && a.heEsencial && <span style={{ fontSize:10, fontWeight:800, background: i===0 ? "rgba(255,255,255,.25)" : "#e8fdf0", color: i===0 ? "white" : "#0a5a28", padding:"1px 7px", borderRadius:10 }}>⭐ Hora extra</span>}
                    <WaitBadge min={cola} status={tr?.status} cargando={cargandoTiempos} />
                  </div>
                </div>
                <button onClick={() => abrirConsejo(a)} style={{ background: i===0 ? "rgba(255,255,255,.15)" : "#ede0ff", border:"none", borderRadius:8, padding:"5px 10px", color: i===0 ? "white" : "#5B2D8E", fontSize:11, fontWeight:800, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
                  💡 Consejo
                </button>
              </div>

              {/* Consejo rápido + zona peques */}
              <div style={{ background:"white", padding:"10px 14px" }}>
                {cerrada ? (
                  <div style={{ fontSize:12, color:"#999" }}>Esta atracción no está operativa hoy. Consulta la app oficial.</div>
                ) : (
                  <>
                    {/* Consejo principal resumido */}
                    {cola !== null && cola > 45 && (
                      (() => {
                        const mejor = mejorMomento(a.id, horaNum, cierreNum);
                        return mejor && mejor.h > horaNum && mejor.cola < cola - 15 ? (
                          <div style={{ fontSize:12, color:"#7a4a00", fontWeight:700, background:"#fff8e0", borderRadius:8, padding:"7px 10px", marginBottom:6 }}>
                            ⏳ Cola alta ahora ({cola} min). Sobre las {mejor.h}:00h podría bajar a ~{mejor.cola} min — una opción a valorar.
                          </div>
                        ) : null;
                      })()
                    )}
                    {cola !== null && cola <= 15 && (
                      <div style={{ fontSize:12, color:"#0a5a28", fontWeight:700, background:"#e8fdf0", borderRadius:8, padding:"7px 10px", marginBottom:6 }}>
                        ✅ Cola muy baja ahora — ¡momento ideal para hacerla!
                      </div>
                    )}
                    {/* Zona peques */}
                    {zonaJuego && tieneBebes === "si" && (
                      <div style={{ fontSize:12, color:"#3a1a6e", fontWeight:700, background:"#ede0ff", borderRadius:8, padding:"7px 10px" }}>
                        🧒 Mientras esperáis: <strong>{zonaJuego.nombre}</strong> — {zonaJuego.desc}
                      </div>
                    )}
                    {/* Fantasyland warning */}
                    {a.fantasyland && horaNum >= 19 && (
                      <div style={{ fontSize:12, color:"#8a0010", fontWeight:700, background:"#fff0f0", borderRadius:8, padding:"7px 10px", marginTop:6 }}>
                        ⚠️ Fantasyland cierra 1h antes del show nocturno. ¡No la dejes para el último momento!
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}

        {zona && zona !== "hotel" && (() => {
          const zonasDlp = zona === "dlp" || zona === "ambos";
          const zonasDaw = zona === "daw" || zona === "ambos";
          const rapidos = [
            ...(zonasDlp ? Object.values(RESTS_ZONA.dlp).flat() : []),
            ...(zonasDaw ? Object.values(RESTS_ZONA.daw).flat() : []),
          ].filter(function(r2) { return r2.tipo === "rapido"; }).slice(0,3);
          const especiales = [
            ...(zonasDlp ? Object.values(RESTS_ZONA.dlp).flat() : []),
            ...(zonasDaw ? Object.values(RESTS_ZONA.daw).flat() : []),
          ].filter(function(r2) { return r2.tipo === "mesa" || r2.tipo === "buffet"; }).slice(0,3);
          return rapidos.length > 0 ? (
            <div style={{background:"#fff",border:"1px solid #e8e0d5",borderRadius:14,padding:"14px 16px",marginBottom:12}}>
              <div style={{fontFamily:"'Fredoka One',cursive",color:"#5B2D8E",fontSize:".95rem",marginBottom:10}}>🍽️ Dónde comer hoy</div>
              <div style={{fontSize:11,fontWeight:800,color:"#0a5a6e",marginBottom:6}}>⚡ Rápido</div>
              {rapidos.map(function(r2,i) { return (
                <div key={i} style={{display:"flex",gap:10,padding:"6px 0",borderBottom:"1px solid #f5f0fc",alignItems:"flex-start"}}>
                  <span style={{fontSize:15,flexShrink:0}}>{r2.emoji}</span>
                  <div><div style={{fontSize:12,fontWeight:800}}>{r2.n}</div><div style={{fontSize:11,color:"#666"}}>{r2.consejo}</div></div>
                </div>
              ); })}
              {especiales.length > 0 && <div style={{fontSize:11,fontWeight:800,color:"#5B2D8E",margin:"8px 0 5px"}}>🕯️ Mesa / Buffet</div>}
              {especiales.map(function(r2,i) { return (
                <div key={i} style={{display:"flex",gap:10,padding:"6px 0",borderBottom:"1px solid #f5f0fc",alignItems:"flex-start"}}>
                  <span style={{fontSize:15,flexShrink:0}}>{r2.emoji}</span>
                  <div><div style={{fontSize:12,fontWeight:800}}>{r2.n}</div><div style={{fontSize:11,color:"#666"}}>{r2.consejo}</div></div>
                </div>
              ); })}
              <div style={{background:"#fff8e0",border:"1px solid #fde68a",borderRadius:8,padding:"6px 10px",marginTop:8,fontSize:11,color:"#92400e"}}>
                📱 Reservas desde la app de DLP. ¿Dudas? Pregunta a Moli.
              </div>
            </div>
          ) : null;
        })()}

        <button onClick={() => { setVista("config"); setSeleccionadas([]); setPaso(1); setZona(null); setHoraExtra(null); setTieneBebes(null); setHoraActual(null); setHoraCierre(null); setTiemposReales({}); setHeEleccionDAW(null); }}
          style={{ background:"none", border:"2px solid #e0d8f0", borderRadius:12, padding:"10px", color:"#5B2D8E", fontFamily:"inherit", fontWeight:800, fontSize:13, cursor:"pointer" }}>
          ↩ Nuevo planificador
        </button>
      </div>
    );
  }

  // ════════════════════════
  // VISTA: CONFIGURACIÓN
  // ════════════════════════
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>

      {/* PASO 1: Parque */}
      <div style={s.card}>
        <div style={{ fontSize:12, fontWeight:800, color:"#5B2D8E", marginBottom:10 }}>🏰 ¿En qué parque estáis hoy?</div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {[{val:"dlp",label:"🏰 Disneyland Park"},{val:"daw",label:"🎬 Disney Adventure World"},{val:"ambos",label:"✨ Los dos parques"}].map(opt => (
            <button key={opt.val} onClick={() => { setZona(opt.val); setPaso(Math.max(paso,2)); setSeleccionadas([]); setTiemposReales({}); cargarTiempos(opt.val); }}
              style={s.optBtn(zona===opt.val)}>{opt.label}</button>
          ))}
        </div>
      </div>

      {/* PASO 2: Hora actual */}
      {zona && (
        <div style={s.card}>
          <div style={{ fontSize:12, fontWeight:800, color:"#5B2D8E", marginBottom:10 }}>🕐 ¿Qué hora es ahora?</div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {(horaExtra === "si" ? [8,9,10,11,12,13,14,15,16,17,18,19,20,21] : [9,10,11,12,13,14,15,16,17,18,19,20,21]).map(h => (
              <button key={h} onClick={() => { setHoraActual(String(h)); setPaso(Math.max(paso,3)); }}
                style={{ ...s.optBtn(horaActual===String(h)), flex:"0 0 auto", padding:"7px 12px", fontSize:12, minWidth:0 }}>{h}:00h</button>
            ))}
          </div>
        </div>
      )}

      {/* PASO 3: Hora cierre */}
      {horaActual && (
        <div style={s.card}>
          <div style={{ fontSize:12, fontWeight:800, color:"#5B2D8E", marginBottom:10 }}>🌙 ¿A qué hora cierra el parque hoy?</div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {["18","19","20","21","22","22:40"].map(h => (
              <button key={h} onClick={() => { setHoraCierre(h); setPaso(Math.max(paso,4)); }}
                style={{ ...s.optBtn(horaCierre===h), flex:"0 0 auto", padding:"7px 12px", fontSize:12, minWidth:0 }}>{h}h</button>
            ))}
          </div>
        </div>
      )}

      {/* PASO 4: Hora extra */}
      {horaCierre && (
        <div style={s.card}>
          <div style={{ fontSize:12, fontWeight:800, color:"#5B2D8E", marginBottom:10 }}>⭐ ¿Tenéis hora extra?</div>
          <div style={{ display:"flex", gap:8 }}>
            {[{val:"si",label:"✅ Sí, hotel Disney",c:"#2EC866"},{val:"no",label:"⏰ No, apertura general",c:"#5B2D8E"}].map(opt => (
              <button key={opt.val} onClick={() => { setHoraExtra(opt.val); setPaso(Math.max(paso,5)); }}
                style={s.optBtn(horaExtra===opt.val, opt.c)}>{opt.label}</button>
            ))}
          </div>
        </div>
      )}

      {/* SELECTOR HORA EXTRA DAW — elegir Frozen o Crush primero */}
      {horaExtra === "si" && (zona === "daw" || zona === "ambos") && (
        <div style={{ background:"#fff", border:"2px solid #1a7aaa", borderRadius:14, padding:"14px 16px" }}>
          <div style={{ fontSize:12, fontWeight:800, color:"#1a7aaa", marginBottom:6 }}>❄️🐢 ¿Por cuál empezáis la hora extra en Disney Adventure World?</div>
          <div style={{ fontSize:11, color:"#666", marginBottom:12, lineHeight:1.5 }}>Frozen Ever After y Crush Coaster son siempre prioritarias en hora extra — pero hay que elegir UNO primero. La secuencia depende de tu elección.</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {Object.entries(SECUENCIAS_HE_DAW).map(([key, seq]) => (
              <button key={key} onClick={() => setHeEleccionDAW(key)}
                style={{ flex:1, minWidth:140, padding:"12px 14px", borderRadius:12, border:`2px solid ${heEleccionDAW===key ? seq.color : "#e0e0e0"}`, background: heEleccionDAW===key ? seq.bg : "#f7f7f9", cursor:"pointer", fontFamily:"inherit", textAlign:"left" }}>
                <div style={{ fontSize:13, fontWeight:800, color: heEleccionDAW===key ? seq.color : "#333" }}>{key === "frozen" ? "❄️" : "🐢"} {seq.label}</div>
                <div style={{ fontSize:11, color:"#888", marginTop:3 }}>{key === "frozen" ? "Frozen → Ratatouille → Paracaídas → Spiderman" : "Crush → Ratatouille → Spiderman → Paracaídas"}</div>
              </button>
            ))}
          </div>
          {heEleccionDAW && (
            <div style={{ marginTop:10, background: SECUENCIAS_HE_DAW[heEleccionDAW].bg, border:`1px solid ${SECUENCIAS_HE_DAW[heEleccionDAW].color}`, borderRadius:10, padding:"9px 12px" }}>
              <div style={{ fontSize:11, fontWeight:800, color: SECUENCIAS_HE_DAW[heEleccionDAW].color, marginBottom:4 }}>⭐ Secuencia recomendada:</div>
              {SECUENCIAS_HE_DAW[heEleccionDAW].orden.map((a, i) => {
                const atrInfo = TODAS_ATRACCIONES.find(x => x.id === a.id);
                return (
                  <div key={a.id} style={{ display:"flex", gap:8, alignItems:"flex-start", padding:"5px 0", borderBottom: i < SECUENCIAS_HE_DAW[heEleccionDAW].orden.length-1 ? "1px solid rgba(0,0,0,.06)" : "none" }}>
                    <div style={{ width:20, height:20, borderRadius:"50%", background: SECUENCIAS_HE_DAW[heEleccionDAW].color, color:"white", fontSize:10, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>{i+1}</div>
                    <div>
                      <div style={{ fontSize:12, fontWeight:800, color:"#1c1410" }}>{atrInfo?.emoji} {atrInfo?.nombre}</div>
                      <div style={{ fontSize:11, color:"#666", lineHeight:1.4 }}>{a.consejo}</div>
                    </div>
                  </div>
                );
              })}
              <div style={{ marginTop:8, fontSize:11, fontWeight:700, color:"#8a3a00", background:"#fff8e0", borderRadius:8, padding:"6px 10px" }}>
                {SECUENCIAS_HE_DAW[heEleccionDAW].aviso}
              </div>
              {SECUENCIAS_HE_DAW[heEleccionDAW].despues && (
                <div style={{ marginTop:6, fontSize:11, fontWeight:700, color:"#0a5a6e", background:"#e0f9ff", borderRadius:8, padding:"6px 10px" }}>
                  💡 {SECUENCIAS_HE_DAW[heEleccionDAW].despues}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* PASO 5: Niños */}
      {horaExtra && (
        <div style={s.card}>
          <div style={{ fontSize:12, fontWeight:800, color:"#5B2D8E", marginBottom:10 }}>👶 ¿Vais con bebés o niños pequeños?</div>
          <div style={{ display:"flex", gap:8 }}>
            {[{val:"si",label:"👶 Sí, hay peques",c:"#F5287A"},{val:"no",label:"🎉 No",c:"#5B2D8E"}].map(opt => (
              <button key={opt.val} onClick={() => { setTieneBebes(opt.val); setPaso(Math.max(paso,6)); }}
                style={s.optBtn(tieneBebes===opt.val, opt.c)}>{opt.label}</button>
            ))}
          </div>
        </div>
      )}

      {/* Estado tiempos reales */}
      {zona && (
        <div style={{ background: Object.keys(tiemposReales).length > 0 && !errorAPI ? "#e8fdf0" : "#fff8e0", border:`1px solid ${Object.keys(tiemposReales).length > 0 && !errorAPI ? "#2EC866" : "#F0A500"}`, borderRadius:10, padding:"8px 13px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
          <div style={{ fontSize:11, fontWeight:700, color: Object.keys(tiemposReales).length > 0 && !errorAPI ? "#0a5a28" : "#7a4a00" }}>
            {cargandoTiempos ? "⏳ Cargando tiempos en directo..." : Object.keys(tiemposReales).length > 0 && !errorAPI ? `🟢 Tiempos en directo · ${ultimaActualizacion}` : errorAPI ? "🟡 Usando tiempos estimados" : "⚪ Tiempos se cargarán al seleccionar parque"}
          </div>
          {!cargandoTiempos && zona && (
            <button onClick={() => cargarTiempos(zona)} style={{ background:"none", border:"1px solid currentColor", borderRadius:20, padding:"2px 10px", fontSize:10, fontWeight:800, cursor:"pointer", fontFamily:"inherit", color: Object.keys(tiemposReales).length > 0 ? "#0a5a28" : "#7a4a00" }}>🔄</button>
          )}
        </div>
      )}

      {/* PASO 6: Seleccionar atracciones */}
      {tieneBebes && (
        <div style={s.card}>
          <div style={{ fontSize:12, fontWeight:800, color:"#5B2D8E", marginBottom:4 }}>🎢 ¿Qué atracciones queréis hacer?</div>
          <div style={{ fontSize:11, color:"#999", marginBottom:12 }}>Márcalas y te doy la ruta óptima con consejos en tiempo real.</div>

          {Array.from(new Set(atrDisponibles.map(a => a.subzona))).map(subzona => {
            const atrZona = atrDisponibles.filter(a => a.subzona === subzona);
            return (
              <div key={subzona} style={{ marginBottom:14 }}>
                <div style={{ fontSize:10, fontWeight:900, color:"#999", textTransform:"uppercase", letterSpacing:1.5, marginBottom:8, paddingBottom:4, borderBottom:"1px solid #f0eaf8" }}>{subzona}</div>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {atrZona.map(a => {
                    const sel = seleccionadas.includes(a.id);
                    const tr = tiemposReales[a.id];
                    const cerrada = tr?.status === "CLOSED" || tr?.status === "REFURBISHMENT";
                    const intInfo = coloresInt[a.intensidad];
                    return (
                      <div key={a.id} style={{ display:"flex", gap:8, alignItems:"stretch" }}>
                        <div onClick={() => !cerrada && toggleAtr(a.id)} style={{ ...s.atrCard(sel, cerrada), flex:1 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <div style={{ fontSize:20, flexShrink:0 }}>{a.emoji}</div>
                            <div style={{ flex:1 }}>
                              <div style={{ fontSize:13, fontWeight:800, color:"#1c1410" }}>{a.nombre}</div>
                              <div style={{ display:"flex", gap:4, marginTop:3, flexWrap:"wrap" }}>
                                <span style={{ fontSize:10, fontWeight:800, background:intInfo.bg, color:intInfo.color, padding:"1px 6px", borderRadius:10 }}>{intInfo.label}</span>
                                {a.altura && <span style={{ fontSize:10, fontWeight:700, background:"#fff0f0", color:"#8a0010", padding:"1px 6px", borderRadius:10 }}>📏 {a.altura}cm</span>}
                                {horaExtra === "si" && a.heEsencial && <span style={{ fontSize:10, fontWeight:800, background:"#e8fdf0", color:"#0a5a28", padding:"1px 6px", borderRadius:10 }}>⭐</span>}
                                {a.susto && tieneBebes === "si" && <span style={{ fontSize:10, fontWeight:800, background:"#fff8e0", color:"#8a4a00", padding:"1px 6px", borderRadius:10 }}>⚠️</span>}
                                {tr && <WaitBadge min={tr.waitTime} status={tr.status} cargando={cargandoTiempos} />}
                              </div>
                            </div>
                            <div style={{ width:20, height:20, borderRadius:"50%", border:`2px solid ${sel ? "#5B2D8E" : "#ddd"}`, background: sel ? "#5B2D8E" : "transparent", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:11, flexShrink:0 }}>
                              {sel ? "✓" : ""}
                            </div>
                          </div>
                        </div>
                        {/* Botón consejo rápido */}
                        <button onClick={() => abrirConsejo(a)} title="Ver consejo de Lara"
                          style={{ background:"#ede0ff", border:"none", borderRadius:10, width:38, cursor:"pointer", fontSize:16, flexShrink:0 }}>
                          💡
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <button onClick={() => setVista("ruta")} disabled={seleccionadas.length === 0} style={s.nextBtn(seleccionadas.length > 0)}>
            {seleccionadas.length === 0 ? "Selecciona al menos una atracción" : `✨ Ver mi ruta optimizada (${seleccionadas.length} atr.)`}
          </button>
        </div>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════
// VISOR COLAS — tiempos reales + estimación por hora
// ═══════════════════════════════════════════════════════
const CURVAS_COLAS = {
  "peter-pan":  {z:"dlp",sz:"Fantasyland",  e:"🧚",n:"Peter Pan's Flight",        c:{8:15,9:30,10:45,11:60,12:60,13:55,14:50,15:55,16:55,17:55,18:45,19:35,20:25,21:20}},
  "dumbo":      {z:"dlp",sz:"Fantasyland",  e:"🐘",n:"Dumbo",                      c:{8:10,9:25,10:40,11:55,12:55,13:50,14:45,15:40,16:35,17:30,18:25,19:20,20:15,21:10}},
  "small-world":{z:"dlp",sz:"Fantasyland",  e:"🌍",n:"It's a Small World",         c:{8:0, 9:5, 10:10,11:15,12:20,13:15,14:15,15:15,16:10,17:10,18:10,19:5, 20:5, 21:5}},
  "snow-white": {z:"dlp",sz:"Fantasyland",  e:"🍎",n:"Blanche-Neige",             c:{8:0, 9:10,10:20,11:30,12:35,13:30,14:25,15:20,16:20,17:15,18:10,19:5, 20:5, 21:5}},
  "pinocchio":  {z:"dlp",sz:"Fantasyland",  e:"🎭",n:"Les Voyages de Pinocchio",   c:{8:0, 9:10,10:20,11:25,12:30,13:25,14:20,15:15,16:15,17:10,18:10,19:5, 20:5, 21:5}},
  "tea-cups":   {z:"dlp",sz:"Fantasyland",  e:"🍵",n:"Mad Hatter's Tea Cups",      c:{8:0, 9:10,10:20,11:30,12:35,13:30,14:25,15:20,16:15,17:15,18:10,19:5, 20:5, 21:5}},
  "carrousel":  {z:"dlp",sz:"Fantasyland",  e:"🎠",n:"Carrousel de Lancelot",      c:{8:10,9:20,10:30,11:40,12:45,13:40,14:35,15:30,16:25,17:20,18:15,19:10,20:5, 21:5}},
  "rapunzel-dlp":{z:"dlp",sz:"Fantasyland", e:"🌸",n:"Tangled Spin 🌸",       c:{8:5, 9:10,10:20,11:25,12:30,13:25,14:20,15:20,16:15,17:15,18:15,19:10,20:10,21:10}},
  "space":      {z:"dlp",sz:"Discoveryland",e:"🌌",n:"Space Mountain",             c:{8:5, 9:25,10:40,11:50,12:55,13:50,14:45,15:40,16:35,17:30,18:25,19:15,20:10,21:10}},
  "buzz":       {z:"dlp",sz:"Discoveryland",e:"🚀",n:"Buzz Lightyear Laser Blast", c:{8:10,9:25,10:40,11:50,12:55,13:50,14:45,15:40,16:35,17:30,18:20,19:15,20:10,21:10}},
  "orbitron":   {z:"dlp",sz:"Discoveryland",e:"🪐",n:"Orbitron",                   c:{8:10,9:15,10:25,11:35,12:40,13:35,14:30,15:25,16:20,17:20,18:15,19:10,20:5, 21:5}},
  "autopia":    {z:"dlp",sz:"Discoveryland",e:"🚗",n:"Autopia (81cm)",             c:{8:0, 9:10,10:20,11:30,12:35,13:30,14:25,15:20,16:15,17:15,18:10,19:5, 20:5, 21:5}},
  "star-tours": {z:"dlp",sz:"Discoveryland",e:"⭐",n:"Star Tours",                 c:{8:0, 9:15,10:25,11:35,12:40,13:35,14:30,15:25,16:20,17:15,18:15,19:10,20:5, 21:5}},
  "nautilus":   {z:"dlp",sz:"Discoveryland",e:"🐙",n:"Les Mystères du Nautilus",   c:{8:0, 9:5, 10:5, 11:10,12:10,13:10,14:10,15:10,16:5, 17:5, 18:5, 19:5, 20:5, 21:5}},
  "btm":        {z:"dlp",sz:"Frontierland", e:"⛰️",n:"Big Thunder Mountain",       c:{8:20,9:35,10:50,11:60,12:70,13:65,14:60,15:55,16:50,17:45,18:35,19:20,20:15,21:10}},
  "phantom":    {z:"dlp",sz:"Frontierland", e:"👻",n:"Phantom Manor",              c:{8:0, 9:15,10:20,11:30,12:35,13:30,14:25,15:20,16:20,17:20,18:15,19:10,20:10,21:5}},
  "indiana":    {z:"dlp",sz:"Adventureland",e:"🎩",n:"Indiana Jones™ (140cm)",     c:{8:0, 9:25,10:40,11:55,12:60,13:55,14:55,15:50,16:50,17:50,18:40,19:25,20:15,21:10}},
  "pirates":    {z:"dlp",sz:"Adventureland",e:"☠️",n:"Pirates of the Caribbean",   c:{8:0, 9:15,10:25,11:30,12:35,13:30,14:25,15:20,16:20,17:20,18:15,19:10,20:10,21:5}},
  "crush":      {z:"daw",sz:"Toon Studio",  e:"🐢",n:"Crush's Coaster (~107cm)",   c:{8:30,9:50,10:75,11:95,12:105,13:95,14:85,15:80,16:75,17:70,18:55,19:45,20:40,21:35}},
  "ratatouille":{z:"daw",sz:"Worlds of Pixar",e:"🐀",n:"Ratatouille",             c:{8:20,9:35,10:50,11:65,12:70,13:60,14:55,15:50,16:45,17:40,18:30,19:20,20:15,21:10}},
  "paracaidas": {z:"daw",sz:"Worlds of Pixar",e:"🪂",n:"Toy Soldiers Parachute",  c:{8:0, 9:20,10:35,11:50,12:55,13:50,14:45,15:40,16:35,17:30,18:25,19:15,20:10,21:10}},
  "rc-racer":   {z:"daw",sz:"Worlds of Pixar",e:"🏎️",n:"RC Racer (120cm)",        c:{8:0, 9:10,10:20,11:30,12:35,13:30,14:25,15:20,16:15,17:15,18:10,19:10,20:5, 21:5}},
  "slinky":     {z:"daw",sz:"Worlds of Pixar",e:"🐶",n:"Slinky Dog Zigzag Spin",  c:{8:0, 9:5, 10:10,11:15,12:20,13:15,14:15,15:10,16:10,17:5, 18:5, 19:5, 20:5, 21:5}},
  "frozen":     {z:"daw",sz:"World of Frozen",e:"❄️",n:"Frozen Ever After",        c:{8:30,9:50,10:70,11:85,12:95,13:85,14:75,15:70,16:60,17:55,18:45,19:30,20:15,21:5}},
  "rapunzel":   {z:"daw",sz:"World of Frozen",e:"🌸",n:"Tangled Spin 🌸",     c:{8:5, 9:10,10:20,11:25,12:30,13:25,14:20,15:20,16:15,17:15,18:15,19:10,20:10,21:10}},
  "spiderman":  {z:"daw",sz:"Campus Avengers",e:"🕷️",n:"Spider-Man WEB Adventure",c:{8:15,9:25,10:40,11:50,12:55,13:50,14:45,15:40,16:30,17:25,18:20,19:15,20:10,21:10}},
  "avengers":   {z:"daw",sz:"Campus Avengers",e:"🦸",n:"Avengers Flight Force (140cm)",c:{8:0,9:15,10:25,11:35,12:40,13:35,14:30,15:25,16:20,17:20,18:15,19:10,20:5,21:5}},
  "tower":      {z:"daw",sz:"Studio 1",     e:"🏨",n:"Tower of Terror (102cm)",    c:{8:0, 9:20,10:35,11:45,12:55,13:50,14:45,15:40,16:35,17:30,18:25,19:15,20:10,21:5}},
};

const API_MAP = {
  "Peter Pan's Flight":"peter-pan","Dumbo the Flying Elephant":"dumbo",
  "it's a small world":"small-world","It's a Small World":"small-world",
  "Blanche-Neige et les Sept Nains":"snow-white","Les Voyages de Pinocchio":"pinocchio",
  "Mad Hatter's Tea Cups":"tea-cups","Le Carrousel de Lancelot":"carrousel",
  "La Tanière du Dragon":"rapunzel-dlp",
  "Star Wars Hyperspace Mountain":"space","Buzz Lightyear Laser Blast":"buzz",
  "Orbitron":"orbitron","Autopia":"autopia","Star Tours: The Adventures Continue":"star-tours",
  "Les Mystères du Nautilus":"nautilus","Big Thunder Mountain":"btm","Phantom Manor":"phantom",
  "Indiana Jones and the Temple of Peril":"indiana","Pirates of the Caribbean":"pirates",
  "Crush's Coaster":"crush","Ratatouille: The Adventure":"ratatouille",
  "Toy Soldiers Parachute Drop":"paracaidas","RC Racer":"rc-racer",
  "Slinky Dog Zigzag Spin":"slinky","Frozen Ever After":"frozen",
  "Spider-Man W.E.B. Adventure":"spiderman","Avengers Assemble: Flight Force":"avengers",
  "The Twilight Zone Tower of Terror":"tower",
};

function getEst(id, h) {
  const c = CURVAS_COLAS[id]?.c; if(!c) return null;
  const hs = Object.keys(c).map(Number).sort((a,b)=>a-b);
  const hb = hs.reduce((p,x) => x<=h?x:p, hs[0]);
  return c[hb]??null;
}

function VisorColas({cliente}) {
  const [parque, setParque] = useState("dlp");
  const [modo, setModo] = useState("directo");
  const [horaSelec, setHoraSelec] = useState(10);
  const [tiempos, setTiempos] = useState({});
  const [cargando, setCargando] = useState(false);
  const [ultimaAct, setUltimaAct] = useState(null);
  const [errorAPI, setErrorAPI] = useState(false);

  const cargar = async(p) => {
    setCargando(true); setErrorAPI(false);
    try {
      const res = await fetch(`/api/waittimes?parque=${p}`);
      const data = await res.json();
      if(data.ok && data.atracciones) {
        const m={};
        data.atracciones.forEach(a => { const id=API_MAP[a.nombre]||API_MAP[a.nombre?.trim()]; if(id) m[id]={waitTime:a.waitTime,status:a.status}; });
        setTiempos(m);
        setUltimaAct(new Date().toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"}));
      } else setErrorAPI(true);
    } catch { setErrorAPI(true); }
    setCargando(false);
  };

  useEffect(() => { if(modo==="directo") cargar(parque); }, [parque,modo]);

  const atrPorZona = {};
  Object.entries(CURVAS_COLAS).filter(([,v])=>v.z===parque).forEach(([id,v])=>{
    if(!atrPorZona[v.sz]) atrPorZona[v.sz]=[];
    atrPorZona[v.sz].push({id,...v});
  });

  const st = {
    tab:(sel,c="#5B2D8E")=>({flex:1,padding:"8px 10px",borderRadius:10,border:"none",background:sel?c:"#f0f0f0",color:sel?"#fff":"#666",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}),
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{background:"#fff",border:"1px solid #e8e0d5",borderRadius:14,padding:"14px 16px"}}>
        <div style={{fontSize:12,fontWeight:800,color:"#5B2D8E",marginBottom:10}}>🏰 Selecciona el parque</div>
        <div style={{display:"flex",gap:8}}>
          {[{v:"dlp",l:"🏰 Disneyland Park"},{v:"daw",l:"🎬 Disney Adventure World"}].map(o=>(
            <button key={o.v} onClick={()=>setParque(o.v)} style={st.tab(parque===o.v)}>{o.l}</button>
          ))}
        </div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={()=>setModo("directo")} style={st.tab(modo==="directo","#2EC866")}>🟢 En directo</button>
        <button onClick={()=>setModo("planificar")} style={st.tab(modo==="planificar")}>📅 Por hora</button>
      </div>
      {modo==="planificar" && (
        <div style={{background:"#fff",border:"1px solid #e8e0d5",borderRadius:14,padding:"14px 16px"}}>
          <div style={{fontSize:12,fontWeight:800,color:"#5B2D8E",marginBottom:10}}>🕐 Hora del día</div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {[8,9,10,11,12,13,14,15,16,17,18,19,20,21].map(h=>(
              <button key={h} onClick={()=>setHoraSelec(h)} style={{...st.tab(horaSelec===h),flex:"0 0 auto",padding:"5px 9px",fontSize:11}}>
                {h}h
              </button>
            ))}
          </div>
          <div style={{fontSize:10,color:"#aaa",marginTop:6}}>Estimación basada en datos de afluencia de Lara</div>
        </div>
      )}
      {modo==="directo" && (
        <div style={{background:errorAPI?"#fff8e0":Object.keys(tiempos).length>0?"#e8fdf0":"#f5f5f5",border:`1px solid ${errorAPI?"#F0A500":Object.keys(tiempos).length>0?"#2EC866":"#ddd"}`,borderRadius:10,padding:"8px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
          <div style={{fontSize:11,fontWeight:700,color:errorAPI?"#7a4a00":Object.keys(tiempos).length>0?"#0a5a28":"#666"}}>
            {cargando?"⏳ Cargando tiempos...":errorAPI?"🟡 Mostrando estimaciones de Lara":Object.keys(tiempos).length>0?`🟢 Datos en directo · ${ultimaAct}`:""}
          </div>
          <button onClick={()=>cargar(parque)} disabled={cargando} style={{background:"none",border:"1px solid #2EC866",borderRadius:20,padding:"2px 10px",color:"#0a5a28",fontSize:10,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>
            {cargando?"⏳":"🔄"}
          </button>
        </div>
      )}
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {[{min:10,l:"≤15 min"},{min:25,l:"16-30"},{min:45,l:"31-60"},{min:75,l:"61-90"},{min:100,l:"+90"}].map(({min,l})=>{
          const c=min<=15?{bg:"#e8fdf0",co:"#0a5a28"}:min<=30?{bg:"#fff8e0",co:"#7a4a00"}:min<=60?{bg:"#fff0d0",co:"#8a3a00"}:{bg:"#fff0f0",co:"#8a0010"};
          return <div key={min} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,fontWeight:700,color:"#555"}}><div style={{width:11,height:11,borderRadius:3,background:c.bg,border:`1px solid ${c.co}`}}/>{l}</div>;
        })}
      </div>
      {Object.entries(atrPorZona).map(([zona,atrs])=>(
        <div key={zona} style={{borderRadius:13,overflow:"hidden",boxShadow:"0 2px 10px rgba(91,45,142,.07)"}}>
          <div style={{background:parque==="dlp"?"linear-gradient(135deg,#5B2D8E,#8B1FCC)":"linear-gradient(135deg,#0a8a9e,#2BBCD4)",padding:"8px 14px"}}>
            <div style={{fontFamily:"'Fredoka One',cursive",color:"white",fontSize:13}}>{zona}</div>
          </div>
          <div style={{background:"white"}}>
            {atrs.map((a,i)=>{
              const tr=tiempos[a.id];
              const sc=tr?.status==="DOWN"||tr?.status==="CLOSED"||tr?.status==="REFURBISHMENT"?tr.status:null;
              const minReal=tr?.waitTime??null;
              const minEst=getEst(a.id,horaSelec);
              const min=modo==="directo"?(sc?null:(minReal!==null?minReal:minEst)):minEst;
              const c=min===null?{bg:"#f0f0f0",co:"#999"}:min<=15?{bg:"#e8fdf0",co:"#0a5a28"}:min<=30?{bg:"#fff8e0",co:"#7a4a00"}:min<=60?{bg:"#fff0d0",co:"#8a3a00"}:{bg:"#fff0f0",co:"#8a0010"};
              const esTiempoReal=modo==="directo"&&minReal!==null&&!sc;
              return (
                <div key={a.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 14px",borderBottom:i<atrs.length-1?"1px solid #f5f0fc":"none",background:i%2===0?"white":"#fdfcff"}}>
                  <div style={{fontSize:17,flexShrink:0}}>{a.e}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:800,color:"#1c1410",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.n}</div>
                    {esTiempoReal&&<div style={{fontSize:9,color:"#2EC866",fontWeight:800}}>🟢 en directo</div>}
                    {modo==="directo"&&!tr&&<div style={{fontSize:9,color:"#F0A500"}}>estimación Lara</div>}
                  </div>
                  <div style={{width:90,flexShrink:0}}>
                    {min!==null&&!sc&&<div style={{height:5,borderRadius:3,background:"#f0f0f0",marginBottom:3}}><div style={{height:"100%",width:`${Math.min(100,Math.round((min/120)*100))}%`,background:c.co,borderRadius:3}}/></div>}
                    <div style={{textAlign:"right"}}>
                      {sc?<span style={{fontSize:10,fontWeight:800,background:"#f0f0f0",color:"#666",padding:"2px 7px",borderRadius:10}}>{sc==="DOWN"?"🔴 Parada":"⚫ Cerrada"}</span>
                        :<span style={{fontSize:11,fontWeight:900,background:c.bg,color:c.co,padding:"2px 8px",borderRadius:20,border:`1px solid ${c.co}18`}}>{min!==null?`${min} min`:"—"}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:10,padding:"10px 14px",fontSize:11,color:"#92400e"}}>
        ⚠️ <strong>Datos en directo:</strong> API oficial DLP, actualización cada 60 seg. <strong>Estimaciones:</strong> datos de afluencia media-alta de Lara. Revisa siempre la app oficial.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// TIEMPO METEOROLÓGICO DISNEYLAND PARIS
// ═══════════════════════════════════════════════════════
function TiempoDLP({cliente}) {
  const [tiempo, setTiempo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(()=>{
    fetch("https://api.open-meteo.com/v1/forecast?latitude=48.8722&longitude=2.7760&current=temperature_2m,weathercode,windspeed_10m,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=Europe/Paris&forecast_days=3")
      .then(r=>r.json())
      .then(d=>{ setTiempo(d); setCargando(false); })
      .catch(()=>{ setError(true); setCargando(false); });
  },[]);

  const getIcono = (wc) => {
    if(wc<=1) return {icon:"☀️",label:"Soleado",tipo:"sol"};
    if(wc<=3) return {icon:"⛅",label:"Parcialmente nublado",tipo:"nublado"};
    if(wc<=48) return {icon:"☁️",label:"Nublado",tipo:"nublado"};
    if(wc<=67) return {icon:"🌧️",label:"Lluvia",tipo:"lluvia"};
    if(wc<=77) return {icon:"❄️",label:"Nieve",tipo:"frio"};
    return {icon:"⛈️",label:"Tormenta",tipo:"tormenta"};
  };

  const getConsejos = (tipo, tmax) => {
    if(tipo==="lluvia"||tipo==="tormenta") return [
      {icon:"☂️",txt:"<strong>Llevad chubasqueros</strong> — los ponchos del parque son caros y de poca calidad"},
      {icon:"🏛️",txt:"<strong>Main Street</strong> tiene galerías cubiertas a ambos lados — perfectas para cruzar sin mojarse"},
      {icon:"☕",txt:"<strong>Café Hyperion</strong> (Discoveryland) es el refugio grande del parque — interior con dibujos animados"},
      {icon:"🐙",txt:"<strong>Nautilus</strong> es cubierto y sin cola — ideal para esperar que escampe"},
      {icon:"⚠️",txt:"<strong>Disney Adventure World tiene MUY POCAS zonas cubiertas</strong> — en días de lluvia es más incómodo que Disneyland Park"},
      {icon:"🎭",txt:"Los espectáculos de interior (Mickey and the Magician, Together...) son la mejor opción con lluvia"},
    ];
    if(tmax>=28) return [
      {icon:"🌊",txt:"<strong>Piscina del hotel a mediodía</strong> (13-16h) — las colas bajan y los peques descansan"},
      {icon:"💧",txt:"<strong>Hidratación constante</strong> — lleva botellas rellenables. Fuentes en Café Hyperion y Studio 1"},
      {icon:"⚠️",txt:"<strong>Disney Adventure World tiene muy poca sombra</strong> — en verano es especialmente duro al mediodía"},
      {icon:"🌅",txt:"Aprovecha las <strong>primeras horas y última hora</strong> del día para las atracciones exteriores"},
      {icon:"🧴",txt:"<strong>Protección solar</strong> imprescindible — especialmente en DAW"},
      {icon:"🎡",txt:"Las <strong>atracciones de agua</strong> (Thunder Mesa...) son especialmente apetecibles con calor"},
    ];
    if(tmax<=10) return [
      {icon:"🧥",txt:"<strong>Ropa de abrigo en capas</strong> — las mañanas son muy frías aunque mejore el día"},
      {icon:"💧",txt:"Las <strong>fuentes al aire libre no funcionan</strong> con frío — recarga botellas en Café Hyperion o Studio 1"},
      {icon:"🎠",txt:"Algunas atracciones al aire libre pueden cerrar con viento fuerte — revisa la app"},
      {icon:"☕",txt:"Los restaurantes cubiertos son tu mejor aliado — Café Hyperion y restaurantes de hotel"},
      {icon:"✅",txt:"<strong>Las colas son más cortas</strong> en temporada fría — aprovecha para hacer más atracciones"},
    ];
    return [
      {icon:"✅",txt:"<strong>Temperatura ideal</strong> para disfrutar el parque sin agobios de calor ni frío"},
      {icon:"🕐",txt:"Con buen tiempo las colas son más largas — sigue la estrategia de hora extra"},
      {icon:"🧥",txt:"Lleva una <strong>capa ligera</strong> para la noche — Disneyland Paris puede refrescar al anochecer"},
    ];
  };

  const dias = ["Hoy","Mañana","Pasado"];
  const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];

  if(cargando) return <div style={{textAlign:"center",padding:"30px",color:"#5B2D8E",fontWeight:700}}>⏳ Cargando tiempo en Marne-la-Vallée...</div>;
  if(error||!tiempo) return <div style={{background:"#fff8e0",border:"1px solid #F0A500",borderRadius:12,padding:"14px",fontSize:12,color:"#7a4a00"}}>No se pudo cargar el tiempo. Consulta la app del tiempo para Marne-la-Vallée (Paris).</div>;

  const curr = tiempo.current;
  const currIcono = getIcono(curr.weathercode);
  const tmaxHoy = tiempo.daily.temperature_2m_max[0];
  const consejos = getConsejos(currIcono.tipo, tmaxHoy);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {/* Tiempo actual */}
      <div style={{background:`linear-gradient(135deg,${currIcono.tipo==="lluvia"||currIcono.tipo==="tormenta"?"#1a3a5e,#2a5a8e":currIcono.tipo==="sol"?"#1a6e2e,#2a9e4e":currIcono.tipo==="frio"?"#1a4a6e,#2a6a9e":"#2a3a5e,#3a5a8e"})`,borderRadius:16,padding:"20px 22px",color:"white"}}>
        <div style={{fontSize:11,opacity:.7,letterSpacing:1.5,textTransform:"uppercase",marginBottom:6}}>🏰 Disneyland Paris · Marne-la-Vallée</div>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:12}}>
          <div style={{fontSize:48}}>{currIcono.icon}</div>
          <div>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:32,lineHeight:1}}>{Math.round(curr.temperature_2m)}°C</div>
            <div style={{fontSize:13,opacity:.85,marginTop:2}}>{currIcono.label}</div>
            {curr.windspeed_10m>20&&<div style={{fontSize:11,opacity:.75,marginTop:1}}>💨 Viento {Math.round(curr.windspeed_10m)} km/h</div>}
          </div>
        </div>
        {/* Próximos 3 días */}
        <div style={{display:"flex",gap:8}}>
          {tiempo.daily.temperature_2m_max.slice(0,3).map((tmax,i)=>{
            const tmin=tiempo.daily.temperature_2m_min[i];
            const ic=getIcono(tiempo.daily.weathercode[i]);
            const fecha=new Date(tiempo.daily.time[i]+"T12:00:00");
            return (
              <div key={i} style={{flex:1,background:"rgba(255,255,255,.12)",borderRadius:10,padding:"8px 10px",textAlign:"center"}}>
                <div style={{fontSize:10,opacity:.7,fontWeight:700,marginBottom:3}}>{i===0?"Hoy":i===1?"Mañana":`${fecha.getDate()} ${meses[fecha.getMonth()]}`}</div>
                <div style={{fontSize:18,marginBottom:2}}>{ic.icon}</div>
                <div style={{fontSize:11,fontWeight:800}}>{Math.round(tmax)}° <span style={{opacity:.6,fontWeight:600}}>{Math.round(tmin)}°</span></div>
                {tiempo.daily.precipitation_sum[i]>1&&<div style={{fontSize:9,opacity:.7,marginTop:1}}>💧{Math.round(tiempo.daily.precipitation_sum[i])}mm</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Consejos según tiempo */}
      <div style={{background:"#fff",border:"1px solid #e8e0d5",borderRadius:14,padding:"14px 16px"}}>
        <div style={{fontFamily:"'Fredoka One',cursive",color:"#5B2D8E",fontSize:.95+"rem",marginBottom:10}}>
          💜 Consejos de Lara para hoy
        </div>
        {consejos.map((c,i)=>(
          <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"7px 0",borderBottom:i<consejos.length-1?"1px solid #f5f0fc":"none"}}>
            <span style={{fontSize:16,flexShrink:0}}>{c.icon}</span>
            <div style={{fontSize:12,color:"#444",fontWeight:600,lineHeight:1.55}} dangerouslySetInnerHTML={{__html:c.txt}}/>
          </div>
        ))}
      </div>

      <div style={{fontSize:10,color:"#aaa",textAlign:"center"}}>Datos: Open-Meteo · Coordenadas Marne-la-Vallée (Disneyland Paris)</div>
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

  // Detectar si la reserva está completa o en proceso
  const reservaCompleta = tieneReservaCompleta(cliente);
  const esPref = !reservaCompleta; // presupuesto preferente: sin hotel confirmado

  const handleLogin = async () => {
    if (!dni.trim()) return;
    setStep("loading");
    try {
      const res = await fetch("/api/reserva", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ dni: dni.trim() }) });
      const result = await res.json();
      if (result.encontrado) {
        setCliente(result.datos);
        setStep("portal");
        // Si no tiene reserva completa, abrir directamente en la tab de Moli
        setActiveTab(tieneReservaCompleta(result.datos) ? "reserva" : "asistente");
        setChatLoading(true);
        const chatRes = await fetch("/api/chat", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ messages:[{ role:"user", content:"Hola, acabo de entrar a mi portal" }], system: SYSTEM_ASISTENTE.replace("{DATOS_CLIENTE}", JSON.stringify(result.datos)) }) });
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
      const res = await fetch("/api/chat", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ messages: newMessages.map(m => ({ role:m.role, content:m.content })), system: SYSTEM_ASISTENTE.replace("{DATOS_CLIENTE}", JSON.stringify(cliente)) }) });
      const data = await res.json();
      setMessages(prev => [...prev, { role:"assistant", content: data.content?.[0]?.text || "Error al responder." }]);
    } catch { setMessages(prev => [...prev, { role:"assistant", content:"Error de conexión." }]); }
    setChatLoading(false);
  };

  const pendiente   = Math.round((extractNumber(cliente?.PENDIENTE || cliente?.Pendiente || cliente?.["PENDIENTE AUTO"] || "0") + Number.EPSILON) * 100) / 100;
  const pagadoTotal = Math.round((extractNumber(cliente?.PAGADO   || cliente?.Pagado   || "0") + Number.EPSILON) * 100) / 100;
  const totalViaje  = Math.round((extractNumber(cliente?.TOTAL    || cliente?.Total    || cliente?.["Precio total"] || "0") + Number.EPSILON) * 100) / 100;

  const s = {
    page: { minHeight:"100vh", background:"linear-gradient(160deg,#0a1628 0%,#0d2233 40%,#0a1a2e 100%)", fontFamily:"'Nunito', sans-serif" },
    header: { background:"rgba(10,22,40,0.97)", borderBottom:"2px solid #2BBCD4", padding:"14px 24px", display:"flex", alignItems:"center", gap:12, position:"sticky", top:0, zIndex:100 },
    logo: { width:38, height:38, background:"linear-gradient(135deg,#2BBCD4,#1A8A9E)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 },
    card: { background:"rgba(255,255,255,0.97)", border:"1px solid rgba(43,188,212,0.2)", borderRadius:12, padding:"14px 16px" },
    goldBtn: { background:"linear-gradient(135deg,#2BBCD4,#1A8A9E)", color:"white", border:"none", borderRadius:10, padding:"14px", fontSize:15, cursor:"pointer", fontFamily:"inherit", fontWeight:700, width:"100%" },
  };

  // Tabs: si la reserva NO está completa, solo muestra Guías, Asistente (y oculta el resto)
  const allTabs = [
    { id:"reserva",     label:"🏰 Mi Reserva",     soloCompleta: false, soloReserva: true,  soloPref: false },
    { id:"atracciones", label:"🎢 Atracciones",     soloCompleta: false, soloReserva: true,  soloPref: false },
    { id:"restaurantes",label:"🍽️ Restaurantes",   soloCompleta: true,  soloReserva: true,  soloPref: false },
    { id:"guias",       label:"📖 Guías",           soloCompleta: false, soloReserva: false, soloPref: true  },
    { id:"tiempo",      label:"🌤️ Tiempo",          soloCompleta: false, soloReserva: false, soloPref: false },
    { id:"guia-parque", label:"🏰 Guía del Parque", soloCompleta: false, soloReserva: true,  soloPref: false },
    { id:"pagos",       label:"💰 Pagos",           soloCompleta: false, soloReserva: false, soloPref: true  },
    { id:"extras",      label:"✨ Servicios",       soloCompleta: true,  soloReserva: true,  soloPref: false },
    { id:"asistente",   label:"🪄 Moli",            soloCompleta: false, soloReserva: false, soloPref: true  },
  ];

  // Siempre mostramos todas las tabs; las que son "soloCompleta" se muestran deshabilitadas si no hay reserva
  const tabs = allTabs;

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.logo}>🪄</div>
        <div>
          <div style={{ color:"#2BBCD4", fontSize:10, letterSpacing:3, textTransform:"uppercase", fontFamily:"'Nunito',sans-serif" }}>Los Viajes de Moli</div>
          <div style={{ color:"#f5f2ee", fontSize:16, fontFamily:"'Fredoka One',cursive" }}>Portal del Viajero</div>
        </div>
        {cliente && (
          <div style={{ marginLeft:"auto", display:"flex", gap:10, alignItems:"center" }}>
            <span style={{ color:"#2BBCD4", fontSize:13 }}>✨ {String(cliente.Nombre||"").split(" ")[0]}</span>
            <button onClick={() => { setStep("login"); setCliente(null); setDni(""); setMessages([]); }} style={{ background:"transparent", border:"1px solid rgba(43,188,212,0.3)", borderRadius:8, color:"#2BBCD4", padding:"6px 12px", fontSize:11, cursor:"pointer" }}>Salir</button>
          </div>
        )}
      </div>

      <div style={{ maxWidth:800, margin:"0 auto", padding:"24px 16px 60px" }}>

        {(step==="login" || step==="error") && (
          <div style={{ textAlign:"center", paddingTop:60 }}>
            <div style={{ fontSize:64, marginBottom:16 }}>🏰</div>
            <h2 style={{ color:"#f5f2ee", fontWeight:400, fontSize:26, margin:"0 0 8px", fontFamily:"'Fredoka One',cursive" }}>Bienvenido a tu Portal</h2>
            <p style={{ color:"#7a9aaa", fontSize:14, margin:"0 0 40px" }}>Consulta tu reserva, pagos, documentos y resuelve tus dudas</p>
            <div style={{ maxWidth:360, margin:"0 auto" }}>
              <div style={{ background:"rgba(43,188,212,0.08)", border:"1px solid rgba(43,188,212,0.25)", borderRadius:16, padding:28 }}>
                <div style={{ color:"#2BBCD4", fontSize:11, letterSpacing:2, textTransform:"uppercase", marginBottom:12, textAlign:"left", fontWeight:800 }}>Tu DNI</div>
                <input value={dni} onChange={e => setDni(e.target.value.toUpperCase())} onKeyDown={e => e.key==="Enter" && handleLogin()} placeholder="ej. 47080502S"
                  style={{ width:"100%", background:"rgba(43,188,212,0.08)", border:"1px solid rgba(43,188,212,0.3)", borderRadius:10, color:"#f5f2ee", fontSize:18, padding:"14px 16px", outline:"none", fontFamily:"inherit", textAlign:"center", letterSpacing:2, boxSizing:"border-box", marginBottom:16 }} />
                <button onClick={handleLogin} disabled={!dni.trim()} style={{ ...s.goldBtn, opacity: dni.trim()?1:0.4 }}>Ver mi reserva ✨</button>
              </div>
              {step==="error" && (
                <div style={{ marginTop:16 }}>
                  <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:10, padding:14, color:"#fca5a5", fontSize:13, marginBottom:12 }}>⚠️ {errorMsg}</div>
                  <a href="https://losviajesdemoli.com" target="_blank" rel="noopener noreferrer" style={{ display:"flex", alignItems:"center", gap:12, background:"linear-gradient(135deg,#2BBCD4,#1A8A9E)", borderRadius:12, padding:"14px 18px", textDecoration:"none" }}>
                    <span style={{ fontSize:22 }}>🏰</span>
                    <div><div style={{ color:"white", fontSize:13, fontWeight:700 }}>¿Aún no tienes tu viaje reservado?</div><div style={{ color:"rgba(255,255,255,.7)", fontSize:12 }}>Descubre Los Viajes de Moli →</div></div>
                  </a>
                </div>
              )}
              <p style={{ color:"#4a6a7a", fontSize:12, marginTop:20 }}>¿Problemas? <a href="mailto:lara@pasaportemagico.com" style={{ color:"#2BBCD4" }}>Contacta con Lara</a></p>
              <div style={{ marginTop:16, background:"rgba(43,188,212,0.06)", border:"1px solid rgba(43,188,212,0.15)", borderRadius:12, padding:"12px 14px", fontSize:11, color:"#4a7a8a", lineHeight:1.5, textAlign:"left" }}>
                ⚠️ <strong style={{ color:"#2BBCD4" }}>Información orientativa.</strong> Los datos mostrados en este portal son una referencia de tu reserva. El precio, condiciones y detalles definitivos son siempre los reflejados en tu hoja de reserva oficial.
              </div>
            </div>
          </div>
        )}

        {step==="loading" && (
          <div style={{ textAlign:"center", paddingTop:100 }}>
            <div style={{ fontSize:48, marginBottom:20 }}>✨</div>
            <div style={{ color:"#2BBCD4", fontSize:16, fontFamily:"'Fredoka One',cursive" }}>Buscando tu reserva...</div>
            <div style={{ color:"#4a7a8a", fontSize:13, marginTop:8 }}>Conectando con la base de datos mágica 🏰</div>
          </div>
        )}

        {step==="portal" && cliente && (
          <div>
            {/* BIENVENIDA */}
            <div style={{ background:"linear-gradient(135deg,rgba(43,188,212,0.15),rgba(91,45,142,0.15))", border:"1px solid rgba(43,188,212,0.3)", borderRadius:16, padding:"20px 24px", marginBottom:24, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
              <div>
                <div style={{ color:"#2BBCD4", fontSize:11, letterSpacing:2, textTransform:"uppercase", marginBottom:4, fontWeight:800 }}>
                  {reservaCompleta ? "¡Hola de nuevo!" : "¡Bienvenido al portal!"}
                </div>
                <div style={{ color:"#f5f2ee", fontSize:22, fontFamily:"'Fredoka One',cursive" }}>{cliente.Nombre} 👋</div>
                <div style={{ color:"#7a9aaa", fontSize:13, marginTop:4 }}>
                  {reservaCompleta
                    ? `Reserva nº ${cliente["Numero reserva"]}`
                    : "Tu reserva está siendo preparada por Lara ✨"}
                </div>
              </div>
              {reservaCompleta && pendiente > 0 ? (
                <div style={{ background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:12, padding:"12px 18px", textAlign:"center" }}>
                  <div style={{ color:"#fca5a5", fontSize:11, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>⚠️ Pendiente</div>
                  <div style={{ color:"#f87171", fontSize:22, fontWeight:600 }}><PagoValor val={cliente.PENDIENTE || cliente.Pendiente} colorNum="#f87171" colorTxt="#fca5a5" size={22} /></div>
                  {cliente["Fecha_límite_pago"] && <div style={{ color:"#9d8b78", fontSize:11, marginTop:4 }}>Límite: {cliente["Fecha_límite_pago"]}</div>}
                </div>
              ) : (reservaCompleta && pagadoTotal > 0) ? (
                <div style={{ background:"rgba(46,200,102,0.15)", border:"1px solid rgba(46,200,102,0.3)", borderRadius:12, padding:"12px 18px" }}>
                  <div style={{ color:"#86efac", fontSize:13 }}>✅ Todo pagado</div>
                </div>
              ) : (
                <div style={{ background:"rgba(240,165,0,0.15)", border:"1px solid rgba(240,165,0,0.3)", borderRadius:12, padding:"12px 18px", textAlign:"center" }}>
                  <div style={{ color:"#fbbf24", fontSize:11, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>⏳ En proceso</div>
                  <div style={{ color:"#fcd34d", fontSize:13, fontWeight:700 }}>Lara está preparando<br/>tu reserva</div>
                </div>
              )}
            </div>

            {/* TABS */}
            <div style={{ display:"flex", gap:6, marginBottom:20, overflowX:"auto" }}>
              {tabs.map(tab => {
                const disabled = (tab.soloCompleta && !reservaCompleta) || (tab.soloReserva && esPref) || (esPref && !tab.soloPref);
                const isActive = activeTab === tab.id;
                return (
                  <button key={tab.id}
                    onClick={() => !disabled && setActiveTab(tab.id)}
                    title={disabled ? (esPref ? "Disponible cuando confirmes tu reserva con Lara ✨" : "Disponible cuando tu reserva esté confirmada") : ""}
                    style={{
                      background: isActive ? "linear-gradient(135deg,#2BBCD4,#1A8A9E)" : disabled ? "rgba(43,188,212,0.03)" : "rgba(43,188,212,0.08)",
                      color: isActive ? "white" : disabled ? "rgba(43,188,212,0.25)" : "#2BBCD4",
                      border: isActive ? "none" : `1px solid ${disabled ? "rgba(43,188,212,0.08)" : "rgba(43,188,212,0.2)"}`,
                      borderRadius:20, padding:"8px 18px", fontSize:13, cursor: disabled ? "not-allowed" : "pointer",
                      fontFamily:"inherit", whiteSpace:"nowrap", fontWeight: isActive ? 700 : 600,
                    }}>
                    {tab.label}
                    {disabled && " 🔒"}
                  </button>
                );
              })}
            </div>

            {/* TAB: RESERVA */}
            {activeTab==="reserva" && (
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {!reservaCompleta ? (
                  /* Vista para clientes en proceso */
                  <div style={{ background:"rgba(255,255,255,0.97)", border:"1px solid rgba(240,165,0,0.3)", borderRadius:16, padding:"28px 24px", textAlign:"center" }}>
                    <div style={{ fontSize:48, marginBottom:16 }}>✨</div>
                    <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:20, color:"#1c1410", marginBottom:10 }}>¡Tu reserva está en camino!</div>
                    <p style={{ color:"#7a6a50", fontSize:14, lineHeight:1.6, maxWidth:400, margin:"0 auto 20px" }}>
                      Lara está preparando todos los detalles de tu viaje a Disneyland Paris. En breve recibirás la confirmación con toda la información.
                    </p>
                    <div style={{ background:"#FFF8E1", border:"1px solid #fde68a", borderRadius:12, padding:"14px 18px", fontSize:13, color:"#92400e", marginBottom:20, textAlign:"left" }}>
                      💡 Mientras tanto, puedes usar la <strong>Guía de Hoteles</strong> y la <strong>Guía de Restaurantes</strong> para ir conociendo las opciones del parque. ¡Y Moli está aquí para resolver cualquier duda!
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                      <button onClick={() => setActiveTab("guias")} style={{ background:"linear-gradient(135deg,#5B2D8E,#F5287A)", color:"white", border:"none", borderRadius:12, padding:"14px 16px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                        📖 Ver las guías
                      </button>
                      <button onClick={() => setActiveTab("asistente")} style={{ background:"linear-gradient(135deg,#2BBCD4,#1A8A9E)", color:"white", border:"none", borderRadius:12, padding:"14px 16px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                        🪄 Hablar con Moli
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Vista para clientes con reserva completa */
                  <>
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
                        <div><div style={{ color:"#c9a84c", fontSize:13, fontWeight:600 }}>Ver mi documento de reserva</div><div style={{ color:"#7a6a50", fontSize:12 }}>Haz clic para abrir tu confirmación</div></div>
                        <span style={{ marginLeft:"auto", color:"#c9a84c", fontSize:18 }}>→</span>
                      </a>
                    )}
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                      <a href={FORM_RESTAURANTES} target="_blank" rel="noopener noreferrer" style={{ display:"flex", alignItems:"center", gap:10, background:"rgba(43,188,212,0.1)", border:"1px solid rgba(43,188,212,0.25)", borderRadius:12, padding:"14px 16px", textDecoration:"none" }}>
                        <span style={{ fontSize:22 }}>🍽️</span>
                        <div><div style={{ color:"#f5f2ee", fontSize:13 }}>Reservar restaurantes</div><div style={{ color:"#4a7a8a", fontSize:11 }}>Formulario de Lara</div></div>
                      </a>
                      <a href={FORM_MODIFICAR} target="_blank" rel="noopener noreferrer" style={{ display:"flex", alignItems:"center", gap:10, background:"rgba(43,188,212,0.1)", border:"1px solid rgba(43,188,212,0.25)", borderRadius:12, padding:"14px 16px", textDecoration:"none" }}>
                        <span style={{ fontSize:22 }}>✏️</span>
                        <div><div style={{ color:"#f5f2ee", fontSize:13 }}>Modificar reserva</div><div style={{ color:"#4a7a8a", fontSize:11 }}>Traslados, extras...</div></div>
                      </a>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* TAB: PLANIFICADOR DE RESTAURANTES */}
            {activeTab==="restaurantes" && reservaCompleta && <PlanificadorRestaurantes cliente={cliente} />}

            {activeTab==="atracciones" && <PlanificadorAtracciones cliente={cliente} />}

            {activeTab==="tiempo" && <TiempoDLP cliente={cliente} />}

            {/* TAB: GUÍAS — accesible para todos */}
            {activeTab==="guia-parque" && (() => {
              const activo = esPeriodoVisita(cliente);
              const dias = diasParaViaje(cliente);
              return (
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  <div style={{ background:"linear-gradient(135deg,#5B2D8E,#F5287A)", borderRadius:16, padding:"20px 22px", color:"white" }}>
                    <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:20, marginBottom:4 }}>🏰 Guía del Parque</div>
                    <div style={{ fontSize:12, opacity:.85 }}>La guía completa de Lara para sacar el máximo a cada hora</div>
                  </div>

                  {!activo && dias !== null && dias > 0 && (
                    <div style={{ background:"rgba(240,165,0,0.1)", border:"2px solid #F0A500", borderRadius:14, padding:"18px 20px", textAlign:"center" }}>
                      <div style={{ fontSize:36, marginBottom:10 }}>⏳</div>
                      <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:18, color:"#8a4a00", marginBottom:6 }}>
                        ¡Faltan {dias} día{dias!==1?"s":""}!
                      </div>
                      <div style={{ fontSize:13, color:"#7a5000", lineHeight:1.6 }}>
                        La guía del parque se activa <strong>el día antes de tu llegada</strong>.<br/>
                        Mientras tanto, puedes revisar la guía de hoteles y restaurantes en la pestaña Guías.
                      </div>
                    </div>
                  )}

                  {!activo && (dias === null || dias <= 0) && (
                    <div style={{ background:"rgba(43,188,212,0.08)", border:"1px solid rgba(43,188,212,0.3)", borderRadius:14, padding:"18px 20px", textAlign:"center" }}>
                      <div style={{ fontSize:36, marginBottom:10 }}>✈️</div>
                      <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:18, color:"#1A8A9E", marginBottom:6 }}>¡Espero que hayáis disfrutado!</div>
                      <div style={{ fontSize:13, color:"#4a7a8a", lineHeight:1.6 }}>El viaje ya ha terminado. ¡Gracias por confiar en Los Viajes de Moli!</div>
                    </div>
                  )}

                  {activo && (
                    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                      <div style={{ background:"#e8fdf0", border:"2px solid #2EC866", borderRadius:12, padding:"12px 16px", fontSize:13, fontWeight:700, color:"#0a5a28", textAlign:"center" }}>
                        🟢 Guía activa — ¡Disfrutad del viaje!
                      </div>
                      {[
                        { href:"/GUIA_DLP.html", icon:"🗺️", title:"Guía completa del parque", desc:"Atracciones, rutas, hora extra, personajes, espectáculos y todos los consejos de Lara" },
                        { href:"/guia_restaurantes_moli.html", icon:"🍽️", title:"Guía de restaurantes", desc:"Dónde comer en los parques, hoteles y Disney Village con consejos de reserva" },
                        { href:"/guia_hoteles_moli.html", icon:"🏨", title:"Guía de hoteles", desc:"Todos los hoteles Disney con características, precios y pros/contras" },
                      ].map((g,i) => (
                        <a key={i} href={g.href} target="_blank" rel="noopener noreferrer"
                          style={{ display:"flex", alignItems:"center", gap:14, background:"rgba(255,255,255,0.97)", border:"1px solid rgba(43,188,212,0.25)", borderRadius:14, padding:"16px 18px", textDecoration:"none" }}>
                          <span style={{ fontSize:32 }}>{g.icon}</span>
                          <div style={{ flex:1 }}>
                            <div style={{ color:"#1c1410", fontSize:14, fontWeight:800, marginBottom:3 }}>{g.title}</div>
                            <div style={{ color:"#7a6a50", fontSize:12 }}>{g.desc}</div>
                          </div>
                          <span style={{ color:"#2BBCD4", fontSize:20 }}>→</span>
                        </a>
                      ))}
                      <div style={{ background:"#FFF8E1", border:"1px solid #fde68a", borderRadius:12, padding:"12px 14px", fontSize:12, color:"#92400e" }}>
                        💡 <strong>Consejo de Lara:</strong> Lee la sección de Hora Extra antes de entrar al parque y ten clara la ruta del primer día. ¡Marca en favoritos esta página para acceder rápido desde el parque!
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {activeTab==="guias" && (
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <div style={{ background:"rgba(255,255,255,0.97)", borderRadius:16, padding:"18px 20px", border:"1px solid rgba(43,188,212,0.2)" }}>
                  <div style={{ fontSize:11, color:"#2BBCD4", textTransform:"uppercase", letterSpacing:2, fontWeight:800, marginBottom:16 }}>📖 Guías de Lara</div>
                  <p style={{ fontSize:13, color:"#7a6a50", lineHeight:1.6, marginBottom:20 }}>
                    Con más de 25 visitas a Disneyland Paris, Lara ha preparado estas guías para que llegues al parque con todo claro y sin dudas.
                  </p>
                  {esPref && (
                    <div style={{ background:"linear-gradient(135deg,rgba(91,45,142,0.08),rgba(245,40,122,0.06))", border:"2px solid rgba(91,45,142,0.2)", borderRadius:12, padding:"14px 16px", marginBottom:16 }}>
                      <div style={{ fontFamily:"'Fredoka One',cursive", color:"#5B2D8E", fontSize:15, marginBottom:6 }}>✨ Tu portal completo te espera</div>
                      <div style={{ fontSize:12, color:"#7a6a50", lineHeight:1.6 }}>
                        Cuando confirmes tu reserva con Lara tendrás acceso a tu planificador de atracciones con tiempos reales, el asistente de restaurantes personalizado, el seguimiento de pagos y mucho más. <strong style={{color:"#F5287A"}}>Todo pensado para que tu familia disfrute al máximo cada hora en el parque.</strong>
                      </div>
                      <a href="https://losviajesdemoli.com" target="_blank" rel="noopener noreferrer"
                        style={{ display:"inline-flex", alignItems:"center", gap:6, marginTop:10, background:"linear-gradient(135deg,#5B2D8E,#F5287A)", color:"white", borderRadius:20, padding:"7px 16px", textDecoration:"none", fontSize:12, fontWeight:800 }}>
                        🏰 Reservar con Lara →
                      </a>
                    </div>
                  )}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                    {/* GUÍA HOTELES */}
                    <a href="/guia_hoteles_moli.html" target="_blank" rel="noopener noreferrer"
                      style={{ display:"flex", flexDirection:"column", gap:8, background:"linear-gradient(135deg,rgba(91,45,142,0.1),rgba(245,40,122,0.08))", border:"1px solid rgba(91,45,142,0.25)", borderRadius:14, padding:"18px 16px", textDecoration:"none" }}>
                      <span style={{ fontSize:36 }}>🏨</span>
                      <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:16, color:"#3D1A6B" }}>Guía de Hoteles</div>
                      <div style={{ fontSize:12, color:"#7a6a50", lineHeight:1.5 }}>Todos los hoteles Disney con precios, características, pros y contras. Elige el que mejor se adapta a tu familia.</div>
                      <div style={{ marginTop:4, color:"#5B2D8E", fontSize:12, fontWeight:800 }}>Abrir guía →</div>
                    </a>
                    {/* GUÍA RESTAURANTES */}
                    <a href="/guia_restaurantes_moli.html" target="_blank" rel="noopener noreferrer"
                      style={{ display:"flex", flexDirection:"column", gap:8, background:"linear-gradient(135deg,rgba(43,188,212,0.1),rgba(46,200,102,0.08))", border:"1px solid rgba(43,188,212,0.25)", borderRadius:14, padding:"18px 16px", textDecoration:"none" }}>
                      <span style={{ fontSize:36 }}>🍽️</span>
                      <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:16, color:"#1A8A9E" }}>Guía de Restaurantes</div>
                      <div style={{ fontSize:12, color:"#7a6a50", lineHeight:1.5 }}>Todos los restaurantes de los parques, hoteles y Disney Village con precios, tips y consejos de reserva.</div>
                      <div style={{ marginTop:4, color:"#1A8A9E", fontSize:12, fontWeight:800 }}>Abrir guía →</div>
                    </a>
                  </div>
                </div>
                {/* TIP de Moli */}
                <div style={{ background:"rgba(240,165,0,0.1)", border:"1px solid rgba(240,165,0,0.3)", borderRadius:12, padding:"14px 18px", display:"flex", gap:12, alignItems:"flex-start" }}>
                  <span style={{ fontSize:24 }}>💡</span>
                  <div>
                    <div style={{ color:"#c9a84c", fontWeight:800, fontSize:13, marginBottom:4 }}>Consejo de Lara</div>
                    <div style={{ color:"#7a6a50", fontSize:12, lineHeight:1.6 }}>Lee las guías antes de que Lara te confirme la reserva — así podrás elegir el hotel y los restaurantes con criterio y sin prisas. ¡Las reservas de restaurantes con personajes se agotan muy rápido!</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PAGOS */}
            {activeTab==="pagos" && (
              <div style={s.card}>
                {!reservaCompleta ? (
                  <div style={{ textAlign:"center", padding:"20px 0" }}>
                    <div style={{ fontSize:40, marginBottom:12 }}>💰</div>
                    <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:18, color:"#1c1410", marginBottom:8 }}>Pagos</div>
                    <p style={{ color:"#9d8b78", fontSize:13 }}>Los detalles de pago estarán disponibles en cuanto Lara confirme tu reserva.</p>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize:11, color:"#c9a84c", letterSpacing:2, textTransform:"uppercase", marginBottom:16 }}>💰 Estado de pagos</div>
                    <PagoBar pagado={cliente.PAGADO || cliente.Pagado} total={cliente.TOTAL || cliente.Total} />
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginTop:20 }}>
                      {[
                        { label:"Total viaje", val:cliente["TOTAL"], bg:"#f9f7f4", colorNum:"#1c1410", colorTxt:"#7a6a50" },
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
                  </>
                )}
                <a href={FORM_PAGOS} target="_blank" rel="noopener noreferrer" style={{ display:"flex", alignItems:"center", gap:12, background:"linear-gradient(135deg,#2BBCD4,#1A8A9E)", borderRadius:12, padding:"16px 20px", textDecoration:"none", marginTop:16 }}>
                  <span style={{ fontSize:24 }}>💳</span>
                  <div><div style={{ color:"white", fontSize:14, fontWeight:700 }}>Enviar justificante de pago</div><div style={{ color:"rgba(255,255,255,.7)", fontSize:12 }}>Haz clic para acceder al formulario de abono</div></div>
                  <span style={{ marginLeft:"auto", color:"white", fontSize:18 }}>→</span>
                </a>
              </div>
            )}

            {/* TAB: EXTRAS */}
            {activeTab==="extras" && reservaCompleta && (
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
                      <div style={{ fontSize:15, color: tieneValor?"#16a34a":"#9d8b78", fontWeight:600 }}>{tieneValor ? "✅ SÍ" : "—"}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB: ASISTENTE MOLI */}
            {activeTab==="asistente" && (
              <div style={{ background:"rgba(43,188,212,0.05)", border:"1px solid rgba(43,188,212,0.2)", borderRadius:16, overflow:"hidden" }}>
                <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(43,188,212,0.15)", display:"flex", alignItems:"center", gap:10, background:"rgba(43,188,212,0.1)" }}>
                  <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#2BBCD4,#5B2D8E)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🪄</div>
                  <div>
                    <div style={{ color:"#f5f2ee", fontSize:14, fontFamily:"'Fredoka One',cursive" }}>Moli, tu hada madrina</div>
                    <div style={{ color:"#2EC866", fontSize:11 }}>● Conoce tu reserva</div>
                  </div>
                </div>
                <div style={{ height:320, overflowY:"auto", padding:16 }}>
                  {messages.map((msg,i) => (
                    <div key={i} style={{ display:"flex", justifyContent: msg.role==="user"?"flex-end":"flex-start", marginBottom:12 }}>
                      <div style={{ maxWidth:"80%", background: msg.role==="user" ? "linear-gradient(135deg,#2BBCD4,#1A8A9E)" : "rgba(255,255,255,0.08)", color: msg.role==="user" ? "white" : "#e8e0d4", borderRadius: msg.role==="user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", padding:"11px 15px", fontSize:13, lineHeight:1.6, whiteSpace:"pre-wrap" }}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div style={{ display:"flex", gap:5, padding:"8px 12px", background:"rgba(255,255,255,0.08)", borderRadius:"18px 18px 18px 4px", width:"fit-content" }}>
                      {[0,1,2].map(i => <div key={i} style={{ width:6, height:6, borderRadius:"50%", background:"#2BBCD4", animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
                <div style={{ padding:"8px 12px", borderTop:"1px solid rgba(43,188,212,0.1)", display:"flex", gap:6, overflowX:"auto" }}>
                  {["¿Qué incluye mi plan?","¿Cuánto cuesta cambiar de plan?","¿Cuánto me falta pagar?","¿Qué necesito para el viaje?"].map((q,i) => (
                    <button key={i} onClick={() => setChatInput(q)} style={{ background:"rgba(43,188,212,0.1)", border:"1px solid rgba(43,188,212,0.2)", borderRadius:20, padding:"5px 12px", color:"#2BBCD4", fontSize:11, cursor:"pointer", whiteSpace:"nowrap", fontFamily:"inherit" }}>{q}</button>
                  ))}
                </div>
                <div style={{ padding:"10px 12px", borderTop:"1px solid rgba(43,188,212,0.1)", display:"flex", gap:8 }}>
                  <a href={FORM_MODIFICAR} target="_blank" rel="noopener noreferrer" style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8, background:"rgba(43,188,212,0.1)", border:"1px solid rgba(43,188,212,0.2)", borderRadius:10, padding:"10px", textDecoration:"none" }}>
                    <span style={{ fontSize:16 }}>✏️</span>
                    <span style={{ color:"#f5f2ee", fontSize:12 }}>Modificar reserva</span>
                  </a>
                  <a href={FORM_PAGOS} target="_blank" rel="noopener noreferrer" style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8, background:"linear-gradient(135deg,#2BBCD4,#1A8A9E)", borderRadius:10, padding:"10px", textDecoration:"none" }}>
                    <span style={{ fontSize:16 }}>💳</span>
                    <span style={{ color:"white", fontSize:12, fontWeight:700 }}>Realizar un abono</span>
                  </a>
                </div>
                <div style={{ padding:"10px 12px", borderTop:"1px solid rgba(43,188,212,0.1)", display:"flex", gap:8 }}>
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key==="Enter" && handleChat()} placeholder="Escribe tu pregunta..." disabled={chatLoading}
                    style={{ flex:1, background:"rgba(43,188,212,0.08)", border:"1px solid rgba(43,188,212,0.2)", borderRadius:10, color:"#f5f2ee", fontSize:13, padding:"10px 14px", outline:"none", fontFamily:"inherit" }} />
                  <button onClick={handleChat} disabled={chatLoading || !chatInput.trim()} style={{ background: chatInput.trim()&&!chatLoading ? "linear-gradient(135deg,#2BBCD4,#1A8A9E)" : "rgba(43,188,212,0.1)", color: chatInput.trim()&&!chatLoading ? "white" : "#4a7a8a", border:"none", borderRadius:10, width:40, height:40, fontSize:16, cursor:"pointer" }}>➤</button>
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