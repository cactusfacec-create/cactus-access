export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/50 px-4 py-4 sm:px-6">
      <p className="text-center text-xs text-muted-foreground">
        © Cactus {new Date().getFullYear()} · Todos los derechos reservados
      </p>
    </footer>
  );
}
