import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import home from "./home";

export const LANGS = ["tr", "en", "it"];

const baseDict = {
  tr: {
    langName: "Türkçe",
    layout: { brand: "Mehmet Dağlı" },
    nav: {
      home: "Ana Sayfa",
      portfolio: "Portfolyo",
      events: "Sergiler",
      bio: "Biyografi",
      contact: "İletişim",
      admin: "Yönetim",
    },
    common: {
      loading: "Yükleniyor…",
      errorGeneric: "Bir şeyler ters gitti",
      retry: "Tekrar dene",
      available: "Satışta",
      notAvailable: "Satışta değil",
      seeAll: "Tümünü gör",
      empty: "İçerik bulunamadı.",
    },
    portfolio: { title: "Portfolyo", empty: "Henüz eser bulunmuyor." },
    events: { title: "Sergiler", empty: "Yaklaşan etkinlik yok." },
    bio: {
      title: "Biyografi",
      sections: {
        timeline: "Zaman Çizelgesi",
        awards: "Ödüller",
        solo: "Kişisel Sergiler",
        group: "Karma Sergiler",
      },
      timelineList: [
        { year: "2020", text: "İstanbul’da ilk kişisel sergi" },
        { year: "2022", text: "Ankara Sanat Günleri" },
        { year: "2024", text: "Roma konuk sanatçı programı" },
      ],
      awardsList: [{ year: "2023", text: "Çağdaş Sanat Ödülü" }],
      soloList: [{ year: "2021", text: "“Doğa ve Biçimler”, İstanbul" }],
      groupList: [{ year: "2022", text: "Karma sergi, Ankara" }],
    },
    contact: { title: "İletişim", send: "Gönder" },
    notFound: {
      title: "Sayfa bulunamadı",
      body: "Aradığınız sayfayı bulamadık.",
    },
  },

  en: {
    langName: "English",
    layout: { brand: "Mehmet Dağlı" },
    nav: {
      home: "Home",
      portfolio: "Portfolio",
      events: "Exhibitions",
      bio: "Bio",
      contact: "Contact",
      admin: "Admin",
    },
    common: {
      loading: "Loading...",
      errorGeneric: "Something went wrong",
      retry: "Retry",
      available: "Available",
      notAvailable: "Not available",
      seeAll: "See all",
      empty: "Nothing to show yet.",
    },
    portfolio: { title: "Portfolio", empty: "No artworks yet." },
    events: { title: "Exhibitions", empty: "No upcoming events." },
    bio: {
      title: "Biography",
      sections: {
        timeline: "Timeline",
        awards: "Awards",
        solo: "Solo Exhibitions",
        group: "Group Exhibitions",
      },
      timelineList: [
        { year: "2020", text: "First solo show in Istanbul" },
        { year: "2022", text: "Ankara Art Days" },
        { year: "2024", text: "Rome artist residency" },
      ],
      awardsList: [{ year: "2023", text: "Contemporary Art Prize" }],
      soloList: [{ year: "2021", text: "“Nature & Forms”, Istanbul" }],
      groupList: [{ year: "2022", text: "Group exhibition, Ankara" }],
    },
    contact: { title: "Contact", send: "Send" },
    notFound: {
      title: "Page not found",
      body: "Sorry, we couldn't find that.",
    },
  },

  it: {
    langName: "Italiano",
    layout: { brand: "Mehmet Dağlı" },
    nav: {
      home: "Home",
      portfolio: "Portfolio",
      events: "Mostre",
      bio: "Bio",
      contact: "Contatto",
      admin: "Admin",
    },
    common: {
      loading: "Caricamento…",
      errorGeneric: "Qualcosa è andato storto",
      retry: "Riprova",
      available: "Disponibile",
      notAvailable: "Non disponibile",
      seeAll: "Vedi tutto",
      empty: "Niente da mostrare.",
    },
    portfolio: { title: "Portfolio", empty: "Ancora nessuna opera." },
    events: { title: "Mostre", empty: "Nessun evento imminente." },
    bio: {
      title: "Biografia",
      sections: {
        timeline: "Cronologia",
        awards: "Premi",
        solo: "Mostre Personali",
        group: "Mostre Collettive",
      },
      timelineList: [
        { year: "2020", text: "Prima personale a Istanbul" },
        { year: "2022", text: "Giornate dell'Arte di Ankara" },
        { year: "2024", text: "Residenza d'artista a Roma" },
      ],
      awardsList: [{ year: "2023", text: "Premio Arte Contemporanea" }],
      soloList: [{ year: "2021", text: "“Natura & Forme”, Istanbul" }],
      groupList: [{ year: "2022", text: "Mostra collettiva, Ankara" }],
    },
    contact: { title: "Contatto", send: "Invia" },
    notFound: {
      title: "Pagina non trovata",
      body: "Spiacenti, non l'abbiamo trovata.",
    },
  },
};

const I18nCtx = createContext({ lang: "tr", setLang: () => {}, t: () => "" });

export function I18nProvider({ children, defaultLang = "tr" }) {
  const [lang, setLang] = useState(defaultLang);

  useEffect(() => {
    const saved = localStorage.getItem("md.lang");
    if (saved && baseDict[saved]) setLang(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("md.lang", lang);
  }, [lang]);

  // Merge base dict with module dicts (like `home`)
  const value = useMemo(() => {
    const modules = [home]; // add more modules later if needed
    const merged = { ...(baseDict[lang] || baseDict[defaultLang]) };
    // merge per-language modules shallowly
    for (const mod of modules) {
      if (mod?.[lang]) {
        Object.assign(merged, mod[lang]);
      }
    }
    const t = (path) =>
      path.split(".").reduce((acc, k) => (acc ? acc[k] : undefined), merged);
    return { lang, setLang, t };
  }, [lang, defaultLang]);

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  return useContext(I18nCtx);
}
