export interface ShortTopicCategory {
  category: string;
  icon: string;
  topics: string[];
}

export const shortTopicCategories: ShortTopicCategory[] = [
  {
    category: "Psicología y Comportamiento",
    icon: "🧠",
    topics: [
      "Trucos psicológicos para leer a la gente",
      "El lado oscuro de la psicología",
      "Señales de que le gustas a alguien",
      "Efecto Mandela: Cosas que todos recordamos mal",
      "Manipulación oscura y cómo defenderte"
    ]
  },
  {
    category: "Misterios",
    icon: "👽",
    topics: [
      "Misterios sin resolver más aterradores",
      "Lugares que parecen de otro planeta",
      "Criaturas extrañas captadas en cámara",
      "Secretos que te ocultan"
    ]
  },
  {
    category: "Ciencia",
    icon: "🚀",
    topics: [
      "Qué pasaría si cayeras en un agujero negro",
      "Cosas aterradoras que esconde el océano",
      "Animales con superpoderes reales",
      "Qué pasaría si la Tierra dejara de girar"
    ]
  },
  {
    category: "Historia",
    icon: "📜",
    topics: [
      "Los castigos más crueles de la historia antigua",
      "Secretos de los Faraones",
      "Civilizaciones perdidas inexplicables"
    ]
  },
  {
    category: "Dinero",
    icon: "💰",
    topics: [
      "Hábitos de los millonarios",
      "Cómo las marcas te manipulan",
      "Las estafas maestras más grandes"
    ]
  }
];
