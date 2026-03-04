"use client";

/**
 * Office Visualization
 * Capacity rule: max(12, headcount + 6) rounded to nearest multiple of 6.
 * This ensures empty desks remain visible as the team grows.
 */
function getOfficeCapacity(engineers: number, salesStaff: number): number {
  const headcount = engineers + salesStaff;
  const minCapacity = Math.max(12, headcount + 6);
  return Math.ceil(minCapacity / 6) * 6;
}

type DeskType = "engineer" | "sales" | "empty";

interface OfficeVizProps {
  engineers: number;
  salesStaff: number;
}

export function OfficeViz({ engineers, salesStaff }: OfficeVizProps) {
  const capacity = getOfficeCapacity(engineers, salesStaff);
  const desks: DeskType[] = [];

  for (let i = 0; i < engineers; i++) desks.push("engineer");
  for (let i = 0; i < salesStaff; i++) desks.push("sales");
  for (let i = desks.length; i < capacity; i++) desks.push("empty");

  const cols = 6;
  const rows = Math.ceil(capacity / cols);

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
      <h2 className="mb-4 text-lg font-semibold">Office</h2>
      <div className="mb-4 flex gap-6 text-sm">
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 rounded bg-amber-500/80" />
          Engineer
        </span>
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 rounded bg-blue-500/80" />
          Sales
        </span>
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 rounded border-2 border-dashed border-slate-600" />
          Empty
        </span>
      </div>
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {desks.map((type, i) => (
          <DeskSlot key={i} type={type} />
        ))}
      </div>
    </div>
  );
}

function DeskSlot({ type }: { type: DeskType }) {
  if (type === "engineer") {
    return (
      <div
        className="flex aspect-square items-center justify-center rounded-lg bg-amber-500/80 text-2xl"
        title="Engineer"
      >
        ⚙
      </div>
    );
  }
  if (type === "sales") {
    return (
      <div
        className="flex aspect-square items-center justify-center rounded-lg bg-blue-500/80 text-2xl"
        title="Sales"
      >
        📞
      </div>
    );
  }
  return (
    <div
      className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-slate-600"
      title="Empty"
    />
  );
}
