export const contactI18n = {
  tr: {
    name: "Mehmet Dağlı",
    title: "İletişim",
    intro:
      "Bilgi almak için formu doldurun. Ayrıca info@mehmetdagliart.com adresinden veya Instagram üzerinden ulaşabilirsiniz.",
    fields: {
      yourName: "İsminiz",
      email: "E-posta",
      howFound: "Bizi nasıl buldunuz?",
      message: "Mesaj",
      purchaseQ: "Mesajınız bir eser satın alımıyla ilgili mi?",
      address: "Teslimat adresiniz (varsa)",
      submit: "Gönder",
    },
    findOptions: [
      "Instagram",
      "Google araması",
      "Arkadaş / kulaktan kulağa",
      "Galeri",
      "Sanat fuarı",
      "Diğer",
    ],
    helpers: {
      required: "Bu alan zorunludur.",
      emailBad: "Geçerli bir e-posta girin.",
      sent: "Teşekkürler! Mesajınız hazır (gönderim ayarı yapılınca iletilecek).",
    },
  },

  en: {
    name: "Mehmet Dağlı",
    title: "Contact",
    intro:
      "Please fill out the form. You can also reach us at info@mehmetdagliart.com or via Instagram.",
    fields: {
      yourName: "Your name",
      email: "Email",
      howFound: "How did you find us?",
      message: "Message",
      purchaseQ: "Is your message about purchasing an artwork?",
      address: "Delivery address (if applicable)",
      submit: "Send",
    },
    findOptions: [
      "Instagram",
      "Google search",
      "Friend / word of mouth",
      "Gallery",
      "Art fair",
      "Other",
    ],
    helpers: {
      required: "This field is required.",
      emailBad: "Please enter a valid email.",
      sent: "Thanks! Your message is ready (delivery will work once SMTP is configured).",
    },
  },

  it: {
    name: "Mehmet Dağlı",
    title: "Contatto",
    intro:
      "Compila il modulo. Puoi anche scriverci a info@mehmetdagliart.com o su Instagram.",
    fields: {
      yourName: "Nome",
      email: "Email",
      howFound: "Come ci hai trovati?",
      message: "Messaggio",
      purchaseQ: "Il messaggio riguarda l’acquisto di un’opera?",
      address: "Indirizzo di consegna (se necessario)",
      submit: "Invia",
    },
    findOptions: [
      "Instagram",
      "Ricerca Google",
      "Amico / passaparola",
      "Galleria",
      "Fiera d’arte",
      "Altro",
    ],
    helpers: {
      required: "Questo campo è obbligatorio.",
      emailBad: "Inserisci un’email valida.",
      sent: "Grazie! Il messaggio è pronto (invio attivo quando SMTP sarà configurato).",
    },
  },
};

export function getContactStrings(lang = "tr") {
  return contactI18n[lang] || contactI18n.tr;
}
