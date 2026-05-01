export type Objetivo = "rugby" | "navette" | "carrera_popular" | "forma_fisica";
export type Nivel = "sedentario" | "algo_activo" | "activo";

export interface OnboardingData {
  objetivo: Objetivo;
  nivel: Nivel;
  diasDisponibles: number;
  fechaEvento?: string;
  semanasHastaObjetivo?: number;
}

export interface Ejercicio {
  nombre: string;
  series?: number | null;
  repeticiones?: string | null;
  duracion?: string | null;
  descanso?: string | null;
  descripcion: string;
}

export interface Sesion {
  dia: string;
  tipo: string;
  duracion: number;
  calentamiento: string;
  ejercicios: Ejercicio[];
  vueltaCalma: string;
  consejos: string;
}

export interface Semana {
  numero: number;
  descripcion: string;
  objetivoSemana: string;
  sesiones: Sesion[];
}

export interface PlanEntrenamiento {
  titulo: string;
  objetivo: string;
  nivel: string;
  totalSemanas: number;
  semanas: Semana[];
  consejosGenerales: string[];
  nutricion: string[];
}
