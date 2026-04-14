export const metadata = {
  title: 'Portal del Viajero - Los Viajes de Moli',
  description: 'Consulta tu reserva, pagos y documentos',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
