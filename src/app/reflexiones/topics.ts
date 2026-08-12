export interface TopicCategory {
  category: string;
  icon: string;
  topics: string[];
}

export const topicCategories: TopicCategory[] = [
  {
    category: "Crecimiento Personal",
    icon: "🌱",
    topics: [
      "Superar el síndrome del impostor",
      "Salir de la zona de confort",
      "El miedo al fracaso en nuevos proyectos",
      "La importancia de la disciplina sobre la motivación",
      "Redefinir el éxito bajo tus propios términos",
      "Aprender a decir 'No' sin sentir culpa",
      "El perfeccionismo como enemigo del progreso",
      "Celebrar las pequeñas victorias del día a día"
    ]
  },
  {
    category: "Relaciones y Vínculos",
    icon: "❤️",
    topics: [
      "Dejar ir a alguien que ya no te aporta",
      "La importancia de la responsabilidad afectiva",
      "Sanar las heridas de amistades perdidas",
      "Aprender a estar solo sin sentirse solitario",
      "Poner límites sanos a personas tóxicas",
      "El perdón como herramienta para uno mismo, no para el otro",
      "El miedo a la vulnerabilidad emocional"
    ]
  },
  {
    category: "Filosofía y Estoicismo",
    icon: "🏛️",
    topics: [
      "Amor Fati: Amar tu destino y lo que te sucede",
      "Memento Mori: Recordar la mortalidad para vivir intensamente",
      "La dicotomía del control: Enfocarse solo en lo que puedes controlar",
      "Encontrar paz en medio del caos moderno",
      "El peligro de desear constantemente más",
      "La riqueza de tener menos (minimalismo mental)",
      "El tiempo como el recurso más valioso que existe"
    ]
  },
  {
    category: "Salud Mental y Bienestar",
    icon: "🧠",
    topics: [
      "Sobrellevar los días oscuros y la ansiedad",
      "La presión de la sociedad y las redes sociales",
      "Hacer las paces con tu pasado",
      "La belleza de la soledad y el silencio",
      "Dejar de compararse con la vida de otros en internet",
      "El agotamiento silencioso (Burnout)",
      "Ser más amable con tu crítico interno"
    ]
  },
  {
    category: "Profesión y Vida",
    icon: "💼",
    topics: [
      "El peso del éxito y las altas expectativas",
      "Cuando el trabajo consume tu identidad",
      "Empezar de cero después de los 30 o 40 años",
      "La ilusión de la inmediatez en el éxito moderno",
      "Encontrar propósito en tareas aburridas"
    ]
  }
];
