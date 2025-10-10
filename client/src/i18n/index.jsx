import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";

/** Supported languages (order matters for the switcher) */
export const LANGS = ["tr", "en", "it"];

/** Translations */
const dict = {
  tr: {
    langName: "Türkçe",
    // layout / nav
    nav: {
      portfolio: "Portfolio",
      events: "Etkinlikler",
      bio: "Biyografi",
      contact: "İletişim",
      admin: "Yönetim",
    },
    // bio page
    bio: {
      title: "Biyografi",
      sections: {
        aboutTitle: "Mehmet Dağlı",
        aboutParas: [
          "1959 yılında Malatya’da doğdu. İlk ve orta öğrenimini burada tamamladıktan sonra lisansını Marmara Üniversitesi Atatürk Eğitim Fakültesi Grafik Bölümünde tamamladı.",
          "Ardından İtalya’da ‘Ambalaj ve Grafik Tasarımı’ eğitimi aldı. Aynı ülkede üç yıllık iş tecrübesi edindikten sonra İstanbul’da kendi reklam ajansını kurdu. Ulusal ve uluslararası birçok markaya hizmet veren ajansında Kreatif Direktör olarak çalıştı.",
          "Daha sonra Doğuş Üniversitesinde ‘Grafik ve Ambalaj Tasarımı’ dersleri verdi. Grafik sanatlar ve tasarım alanında uzun yıllar çalıştıktan sonra eğitim ve profesyonel hayatı boyunca ilgi duyduğu resme daha çok yoğunlaşmaya başladı.",
        ],
        exhibitions: "Sergiler",
        solo: "Kişisel Sergiler",
        group: "Grup Sergileri",
      },
      soloList: [
        { year: 2017, text: '"Lines" Bohem Gallery, İstanbul' },
        { year: 2018, text: "Rengigül Gallery, Bozcaada Çanakkale" },
        { year: 2023, text: "Fular’t Sanat Evi, İstanbul" },
        { year: 2024, text: "Forlì Sanat Fuarı, İtalya" },
      ],
      groupList: [
        { year: 2018, text: "İstanbul Art Show, Gallery Abay, İstanbul" },
        {
          year: 2018,
          text: "Bir Grup İnsan, Türkan Saylan Kültür Merkezi, İstanbul",
        },
        { year: 2018, text: "Bir Grup İnsan, Pusula Art Gallery, İstanbul" },
        {
          year: 2018,
          text: "Bir Grup İnsan, Çerkezköy Belediye Sanat Galerisi, Tekirdağ",
        },
        { year: 2018, text: "Moda Passage Art Gallery, İstanbul" },
        {
          year: 2019,
          text: "ArtAnkara 5. Uluslararası Çağdaş Sanat Fuarı, Ankara",
        },
        {
          year: 2019,
          text: "Artİstanbul 2. Uluslararası Çağdaş Sanat Fuarı, İstanbul",
        },
        {
          year: 2023,
          text: "Fular’t Sanat Evi, Yeni Yıl Karma Sergi, İstanbul",
        },
        { year: 2024, text: "Evrim Sanat Galerisi, Sintesi Sergisi" },
      ],
    },
  },

  en: {
    langName: "English",
    nav: {
      portfolio: "Portfolio",
      events: "Events",
      bio: "Bio",
      contact: "Contact",
      admin: "Admin",
    },
    bio: {
      title: "Biography",
      sections: {
        aboutTitle: "Mehmet Dağlı",
        aboutParas: [
          "Born in 1959 in Malatya, Turkey. After completing his primary and secondary education there, he graduated from Marmara University, Atatürk Faculty of Education, Department of Graphic Design.",
          "He then studied “Packaging and Graphic Design” in Italy. Following three years of professional experience in the same country, he returned to Istanbul and founded his own advertising agency, serving national and international brands as Creative Director.",
          "Later, he taught “Graphic and Packaging Design” at Doğuş University. After many years in graphic arts and design, he began to focus more intensely on painting—an interest he pursued throughout his education and professional life.",
        ],
        exhibitions: "Exhibitions",
        solo: "Solo Exhibitions",
        group: "Group Exhibitions",
      },
      soloList: [
        { year: 2017, text: '"Lines" — Bohem Gallery, Istanbul' },
        { year: 2018, text: "Rengigül Gallery, Bozcaada, Çanakkale" },
        { year: 2023, text: "Fular’t Art House, Istanbul" },
        { year: 2024, text: "Forlì Art Fair, Italy" },
      ],
      groupList: [
        { year: 2018, text: "Istanbul Art Show, Gallery Abay, Istanbul" },
        {
          year: 2018,
          text: "A Group of People, Türkan Saylan Cultural Center, Istanbul",
        },
        { year: 2018, text: "A Group of People, Pusula Art Gallery, Istanbul" },
        {
          year: 2018,
          text: "A Group of People, Çerkezköy Municipal Art Gallery, Tekirdağ",
        },
        { year: 2018, text: "Moda Passage Art Gallery, Istanbul" },
        {
          year: 2019,
          text: "ArtAnkara 5th International Contemporary Art Fair, Ankara",
        },
        {
          year: 2019,
          text: "ArtIstanbul 2nd International Contemporary Art Fair, Istanbul",
        },
        {
          year: 2023,
          text: "Fular’t Art House, New Year Mixed Exhibition, Istanbul",
        },
        { year: 2024, text: "Evrim Art Gallery, Sintesi Exhibition" },
      ],
    },
  },

  it: {
    langName: "Italiano",
    nav: {
      portfolio: "Portfolio",
      events: "Eventi",
      bio: "Biografia",
      contact: "Contatto",
      admin: "Admin",
    },
    bio: {
      title: "Biografia",
      sections: {
        aboutTitle: "Mehmet Dağlı",
        aboutParas: [
          "Nato nel 1959 a Malatya. Dopo gli studi primari e secondari, si è laureato all’Università di Marmara, Facoltà di Formazione Atatürk, Dipartimento di Grafica.",
          "Successivamente ha studiato “Packaging e Graphic Design” in Italia. Dopo tre anni di esperienza professionale nello stesso paese, è tornato a Istanbul dove ha fondato la propria agenzia pubblicitaria, lavorando come Direttore Creativo per marchi nazionali e internazionali.",
          "In seguito ha insegnato “Graphic e Packaging Design” all’Università Doğuş. Dopo molti anni nelle arti grafiche e nel design, ha iniziato a concentrarsi maggiormente sulla pittura, interesse coltivato durante tutta la sua formazione e carriera.",
        ],
        exhibitions: "Mostre",
        solo: "Personali",
        group: "Collettive",
      },
      soloList: [
        { year: 2017, text: '"Lines" — Bohem Gallery, Istanbul' },
        { year: 2018, text: "Rengigül Gallery, Bozcaada, Çanakkale" },
        { year: 2023, text: "Fular’t Art House, Istanbul" },
        { year: 2024, text: "Fiera d’Arte di Forlì, Italia" },
      ],
      groupList: [
        { year: 2018, text: "Istanbul Art Show, Gallery Abay, Istanbul" },
        {
          year: 2018,
          text: "Un Gruppo di Persone, Centro Culturale Türkan Saylan, Istanbul",
        },
        {
          year: 2018,
          text: "Un Gruppo di Persone, Pusula Art Gallery, Istanbul",
        },
        {
          year: 2018,
          text: "Un Gruppo di Persone, Galleria d’Arte Comunale di Çerkezköy, Tekirdağ",
        },
        { year: 2018, text: "Moda Passage Art Gallery, Istanbul" },
        {
          year: 2019,
          text: "ArtAnkara 5ª Fiera Internazionale d’Arte Contemporanea, Ankara",
        },
        {
          year: 2019,
          text: "ArtIstanbul 2ª Fiera Internazionale d’Arte Contemporanea, Istanbul",
        },
        {
          year: 2023,
          text: "Fular’t Art House, Mostra Collettiva di Capodanno, Istanbul",
        },
        { year: 2024, text: "Galleria d’Arte Evrim, mostra Sintesi" },
      ],
    },
  },
};

/** Context */
const I18nCtx = createContext({ lang: "tr", setLang: () => {}, t: (p) => p });

export function I18nProvider({ children, defaultLang = "tr" }) {
  const [lang, setLang] = useState(localStorage.getItem("lang") || defaultLang);

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.setAttribute("data-lang", lang);
  }, [lang]);

  const value = useMemo(() => {
    const bag = dict[lang] || dict[defaultLang];
    const t = (path) =>
      path.split(".").reduce((acc, k) => (acc ? acc[k] : undefined), bag);
    return { lang, setLang, t };
  }, [lang, defaultLang]);

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  return useContext(I18nCtx);
}
