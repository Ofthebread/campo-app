export interface OnboardingData {
  // Paso 1
  objetivo: string;

  // Paso 2
  volumenCarrera: "nada" | "menos_20" | "20_40" | "mas_40";
  lesiones: string;
  edad: number;
  peso: number;

  // Paso 3
  diasDisponibles: number;
  duracionMaxSesion: "30min" | "45min" | "1h" | "mas_1h";
  lugarEntrenamiento: "calle" | "pista" | "cinta" | "campo";
  tieneDispositivo: boolean;

  // Paso 4
  otrosDeportes: string;
  preferenciaEntrenamiento: "corta_intensa" | "larga_suave";
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
