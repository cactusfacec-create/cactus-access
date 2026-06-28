// Next.js monta una instancia nueva de este componente en cada navegación
// (a diferencia de layout.tsx, que persiste), lo que nos da un punto natural
// para reproducir el fade-in en cada cambio de vista del dashboard.
export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-350">{children}</div>
  );
}
