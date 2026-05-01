import type { WorkoutSession } from "@/types/training";
import { formatPace, formatDuration, workoutTypeLabel } from "@/lib/utils";

interface Props {
  session: WorkoutSession;
}

const typeColors: Record<string, string> = {
  easy: "bg-green-100 text-green-700",
  tempo: "bg-orange-100 text-orange-700",
  interval: "bg-red-100 text-red-700",
  long: "bg-blue-100 text-blue-700",
  rest: "bg-slate-100 text-slate-500",
  cross: "bg-purple-100 text-purple-700",
};

export default function WorkoutCard({ session }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
      <span
        className={`px-2 py-1 rounded-md text-xs font-semibold ${typeColors[session.type] ?? "bg-slate-100 text-slate-600"}`}
      >
        {workoutTypeLabel(session.type)}
      </span>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900">
          {session.distanceKm} km · {formatDuration(session.durationMin)}
        </p>
        {session.notes && (
          <p className="text-xs text-slate-500 mt-0.5">{session.notes}</p>
        )}
      </div>
      <p className="text-xs text-slate-400">{formatPace(session.paceMinKm)}</p>
      <span
        className={`w-2 h-2 rounded-full ${session.completed ? "bg-green-500" : "bg-slate-300"}`}
      />
    </div>
  );
}
