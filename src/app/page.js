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

  async function generarPlan() {
    if (!prefsCompletas) return;
    setLoading(true); setPlan(null);
    const diasInfo = dates.map(date => ({ fecha: formatDateEs(date), cierre: getHorario(date), alta: isAltaDemanda(date), mierc: isMiercoles(date) }));
    const prompt = `Eres el asistente de restaurantes de "Los Viajes de Moli". Crea un plan de restaurantes personalizado.
DATOS: Nombre: ${cliente?.Nombre}, Hotel: ${cliente?.Hotel}, Plan: ${cliente?.["Plan de comidas"] || "sin plan"}, Fechas: ${cliente?.["Check-in"]} al ${cliente?.["Check-out"]} (${noches} noches), Adultos: ${adultos}, Niños: ${ninos}, Bebés: ${bebes}
PREFERENCIAS: Personajes: ${prefs.personajes}, Reservas: ${prefs.reserva}, Estilo: ${prefs.estilo}, Dieta: ${prefs.dieta || 'ninguna'}
HORARIOS DÍA A DÍA: ${diasInfo.map(d => `${d.fecha}: cierre ${d.cierre}${d.mierc?' — MIÉRCOLES (alta afluencia)':''}`).join(', ')}
Genera plan día a día con emojis y formato claro. Responde en español.`;
    try {
      const res = await fetch("/api/chat", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ messages:[{ role:"user", content:prompt }], system:"Eres el asistente de restaurantes de Los Viajes de Moli. Responde siempre en español." }) });
      const data = await res.json();
      setPlan(data.content?.[0]?.text || "No se pudo generar el plan.");
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }), 100);
    } catch { setPlan("Error de conexión. Inténtalo de nuevo."); }
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

  const pendiente = Math.round((extractNumber(cliente?.Pendiente || cliente?.["PENDIENTE AUTO"] || "0") + Number.EPSILON) * 100) / 100;

  const s = {
    page: { minHeight:"100vh", background:"linear-gradient(160deg,#0a1628 0%,#0d2233 40%,#0a1a2e 100%)", fontFamily:"'Nunito', sans-serif" },
    header: { background:"rgba(10,22,40,0.97)", borderBottom:"2px solid #2BBCD4", padding:"14px 24px", display:"flex", alignItems:"center", gap:12, position:"sticky", top:0, zIndex:100 },
    logo: { width:38, height:38, background:"linear-gradient(135deg,#2BBCD4,#1A8A9E)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 },
    card: { background:"rgba(255,255,255,0.97)", border:"1px solid rgba(43,188,212,0.2)", borderRadius:12, padding:"14px 16px" },
    goldBtn: { background:"linear-gradient(135deg,#2BBCD4,#1A8A9E)", color:"white", border:"none", borderRadius:10, padding:"14px", fontSize:15, cursor:"pointer", fontFamily:"inherit", fontWeight:700, width:"100%" },
  };

  // Tabs: si la reserva NO está completa, solo muestra Guías, Asistente (y oculta el resto)
  const allTabs = [
    { id:"reserva", label:"🏰 Mi Reserva", soloCompleta: false },
    { id:"restaurantes", label:"🍽️ Planificador", soloCompleta: true },
    { id:"guias", label:"📖 Guías", soloCompleta: false },
    { id:"pagos", label:"💰 Pagos", soloCompleta: false },
    { id:"extras", label:"✨ Servicios", soloCompleta: true },
    { id:"asistente", label:"🪄 Moli", soloCompleta: false },
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
                  <div style={{ color:"#f87171", fontSize:22, fontWeight:600 }}><PagoValor val={cliente.Pendiente} colorNum="#f87171" colorTxt="#fca5a5" size={22} /></div>
                  {cliente["Fecha_límite_pago"] && <div style={{ color:"#9d8b78", fontSize:11, marginTop:4 }}>Límite: {cliente["Fecha_límite_pago"]}</div>}
                </div>
              ) : reservaCompleta ? (
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
                const disabled = tab.soloCompleta && !reservaCompleta;
                const isActive = activeTab === tab.id;
                return (
                  <button key={tab.id}
                    onClick={() => !disabled && setActiveTab(tab.id)}
                    title={disabled ? "Disponible cuando tu reserva esté confirmada" : ""}
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

            {/* TAB: GUÍAS — accesible para todos */}
            {activeTab==="guias" && (
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <div style={{ background:"rgba(255,255,255,0.97)", borderRadius:16, padding:"18px 20px", border:"1px solid rgba(43,188,212,0.2)" }}>
                  <div style={{ fontSize:11, color:"#2BBCD4", textTransform:"uppercase", letterSpacing:2, fontWeight:800, marginBottom:16 }}>📖 Guías de Lara</div>
                  <p style={{ fontSize:13, color:"#7a6a50", lineHeight:1.6, marginBottom:20 }}>
                    Con más de 25 visitas a Disneyland Paris, Lara ha preparado estas guías para que llegues al parque con todo claro y sin dudas.
                  </p>
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
                    <PagoBar pagado={cliente.Pagado} total={cliente["TOTAL"]} />
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
