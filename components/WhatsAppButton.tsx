export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/50769785995"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp +507 6978-5995"
      className="fixed bottom-5 right-5 z-40 block h-16 w-16 drop-shadow-md transition-transform hover:scale-105"
    >
      <img src="/logos/whatsapp.png" alt="" className="h-full w-full" />
    </a>
  );
}
