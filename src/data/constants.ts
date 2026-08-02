import brazoImage from '@/assets/images/Brazo.webp'
import cardioImage from '@/assets/images/Cardio.webp'
import coreImage from '@/assets/images/Core.webp'
import cuerpoCompletoImage from '@/assets/images/CuerpoCompleto.webp'
import espaldaImage from '@/assets/images/Espalda.webp'
import hombroImage from '@/assets/images/Hombro.webp'
import pechoImage from '@/assets/images/Pecho.webp'
import piernaImage from '@/assets/images/Pierna.webp'

export const MUSCLE_GROUPS = [
  {
    name: 'Pecho',
    description: 'Ejercicios enfocados en pectorales mayores y menores.',
    imageUrl: pechoImage,
  },
  {
    name: 'Espalda',
    description: 'Desarrollo de dorsales, trapecios y lumbares.',
    imageUrl: espaldaImage,
  },
  {
    name: 'Piernas',
    description: 'Cuádriceps, isquiotibiales, glúteos y gemelos.',
    imageUrl: piernaImage,
  },
  {
    name: 'Brazos',
    description: 'Bíceps, tríceps y antebrazos.',
    imageUrl: brazoImage,
  },
  {
    name: 'Hombros',
    description: 'Deltoides frontales, laterales y posteriores.',
    imageUrl: hombroImage,
  },
  {
    name: 'Core',
    description: 'Abdomen, oblicuos y zona media.',
    imageUrl: coreImage,
  },
  {
    name: 'Cardio',
    description: 'Ejercicios cardiovasculares y resistencia.',
    imageUrl: cardioImage,
  },
  {
    name: 'Cuerpo Completo',
    description: 'Movimientos compuestos full-body.',
    imageUrl: cuerpoCompletoImage,
  },
] as const

export const MUSCLE_GROUP_NAMES = MUSCLE_GROUPS.map((g) => g.name) as readonly string[]

export type MuscleGroupName = (typeof MUSCLE_GROUP_NAMES)[number]
