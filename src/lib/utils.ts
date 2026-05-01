export function formatPace(paceMinKm: number): string {
  const mins = Math.floor(paceMinKm);
  const secs = Math.round((paceMinKm - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, "0")} min/km`;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function workoutTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    easy: "Rodaje suave",
    tempo: "Tempo",
    interval: "Intervalos",
    long: "Largo",
    rest: "Descanso",
    cross: "Entrenamiento cruzado",
  };
  return labels[type] ?? type;
}
