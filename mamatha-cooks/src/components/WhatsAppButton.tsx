import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "919640483646";

export const getWhatsAppUrl = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

const WhatsAppButton = () => {
  return (
    <a
      href={getWhatsAppUrl("Hi, I want to order from Mamatha Cooks")}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#1ebe57] text-primary-foreground rounded-full p-4 warm-shadow-lg transition-transform hover:scale-110"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
    </a>
  );
};

export default WhatsAppButton;
