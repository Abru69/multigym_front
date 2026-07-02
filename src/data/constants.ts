export const MUSCLE_GROUPS = [
  {
    name: 'Pecho',
    description: 'Ejercicios enfocados en pectorales mayores y menores.',
    imageUrl:
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&auto=format&fit=crop&q=60',
  },
  {
    name: 'Espalda',
    description: 'Desarrollo de dorsales, trapecios y lumbares.',
    imageUrl:
      'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=500&auto=format&fit=crop&q=60',
  },
  {
    name: 'Piernas',
    description: 'Cuádriceps, isquiotibiales, glúteos y gemelos.',
    imageUrl:
      'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=500&auto=format&fit=crop&q=60',
  },
  {
    name: 'Brazos',
    description: 'Bíceps, tríceps y antebrazos.',
    imageUrl:
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=60',
  },
  {
    name: 'Hombros',
    description: 'Deltoides frontales, laterales y posteriores.',
    imageUrl:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=60',
  },
  {
    name: 'Core',
    description: 'Abdomen, oblicuos y zona media.',
    imageUrl:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&auto=format&fit=crop&q=60',
  },
  {
    name: 'Cardio',
    description: 'Ejercicios cardiovasculares y resistencia.',
    imageUrl:
      'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=500&auto=format&fit=crop&q=60',
  },
  {
    name: 'Cuerpo Completo',
    description: 'Movimientos compuestos full-body.',
    imageUrl:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&auto=format&fit=crop&q=60',
  },
] as const

export const MUSCLE_GROUP_NAMES = MUSCLE_GROUPS.map((g) => g.name) as readonly string[]

export type MuscleGroupName = (typeof MUSCLE_GROUP_NAMES)[number]
