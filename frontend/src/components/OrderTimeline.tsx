import { cn } from "@/lib/utils";
import { orderStatusSteps } from "@/data/orders";
import type { OrderStatus } from "@/types";
import { Check } from "lucide-react";

export function OrderTimeline({ status }: { status: OrderStatus }) {
  const terminal = ["cancelled", "returned", "refunded"];
  if (terminal.includes(status)) {
    return (
      <div className="rounded-xl bg-primary/5 px-4 py-3 text-sm font-semibold capitalize text-primary">
        Order {status}
      </div>
    );
  }
  const currentIndex = orderStatusSteps.findIndex((s) => s.key === status);

  return (
    <div className="flex items-center">
      {orderStatusSteps.map((step, i) => {
        const done = i <= currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <div key={step.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <span className={cn(
                "grid h-8 w-8 place-items-center rounded-full text-xs font-bold transition",
                done ? "bg-success text-white" : "bg-secondary/10 text-secondary/40",
                isCurrent && "ring-4 ring-success/20",
              )}>
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span className={cn(
                "mt-1.5 hidden max-w-[70px] text-center text-[10px] font-medium leading-tight sm:block",
                done ? "text-secondary" : "text-secondary/40",
              )}>
                {step.label}
              </span>
            </div>
            {i < orderStatusSteps.length - 1 && (
              <div className={cn("mx-1 h-0.5 flex-1", i < currentIndex ? "bg-success" : "bg-secondary/10")} />
            )}
          </div>
        );
      })}
    </div>
  );
}
