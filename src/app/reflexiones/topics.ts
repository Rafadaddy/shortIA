export interface TopicCategory {
  category: string;
  icon: string;
  topics: string[];
}

export const topicCategories: TopicCategory[] = [
  {
    category: "Psicología y Comportamiento",
    icon: "🧠",
    topics: [
      "Por qué el ser humano se autoboicotea cuando al fin es feliz",
      "La extraña adicción de la mente a crear problemas que no existen",
      "Por qué idealizamos tanto el pasado y olvidamos lo malo",
      "La diferencia entre intuición y ansiedad paranoica",
      "Por qué duele más la traición de un amigo que de una pareja",
      "El extraño placer de la melancolía y la tristeza",
      "Por qué nos aterra tanto la incertidumbre del futuro"
    ]
  },
  {
    category: "Verdades Incómodías y Vida",
    icon: "👁️",
    topics: [
      "El día que descubres que tus padres también están improvisando",
      "La dura realidad de que nadie sabe realmente lo que hace con su vida",
      "El peligro tóxico de vivir para impresionar a desconocidos en internet",
      "Por qué el concepto moderno de 'éxito' nos deja más vacíos",
      "El duelo silencioso de dejar morir a la persona que solías ser",
      "La hipocresía del positivismo tóxico en redes sociales",
      "Aceptar que a veces tú eres el 'malo' en la historia de alguien"
    ]
  },
  {
    category: "Amor, Relaciones y Desapego",
    icon: "💔",
    topics: [
      "El extraño fenómeno de extrañar a alguien que te hizo tanto daño",
      "Por qué el amor verdadero a veces se siente aburrido y sin drama",
      "Cómo saber si estás enamorado o solo tienes pánico a la soledad",
      "Por qué a veces el mayor acto de amor es alejarte para siempre",
      "La delgada y peligrosa línea entre amar y depender emocionalmente",
      "Aceptar que el 'para siempre' a veces dura solo unos meses",
      "Por qué nos atraen tanto las personas que no están disponibles"
    ]
  },
  {
    category: "Existencialismo y Misterio",
    icon: "🌌",
    topics: [
      "La aterradora pero liberadora idea de lo pequeños que somos en el universo",
      "¿Quéé hay realmente más allá de nuestro profundo miedo a la muerte?",
      "La extraña sensación de que el tiempo pasa más rápido cada año",
      "¿Somos realmente dueños de nuestro destino o todo ya está escrito?",
      "El misterio de tener una conexión inexplicable con un extraño",
      "La sensación de vivir en modo automático (Efecto NPC)",
      "Por qué las madrugadías nos hacen cuestionar toda nuestra existencia"
    ]
  },
  {
    category: "Crecimiento, Éxito y Soledad",
    icon: "🐺",
    topics: [
      "La soledad inevitable y fría que llega cuando decides cambiar de vida",
      "El precio oculto de querer agradarle y caerle bien a todo el mundo",
      "Cómo tu entorno y amigos cambian cuando decides ser más ambicioso",
      "Por qué fracasar rápidamente es mejor que dudar para siempre",
      "El mito de que la motivación constante es la clave del éxito",
      "La paz que encuentras cuando dejas de intentar tener siempre la razón"
    ]
  }
];
