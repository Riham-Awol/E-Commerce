import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  rating,
  size = 14,
  showValue = false,
  count,
}: {
  rating: number;
  size?: number;
  showValue?: boolean;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            width={size}
            height={size}
            className={cn(
              i <= Math.round(rating) ? "fill-accent text-accent" : "fill-secondary/10 text-secondary/10",
            )}
          />
        ))}
      </div>
      {showValue && <span className="text-xs font-semibold text-secondary">{rating.toFixed(1)}</span>}
      {typeof count === "number" && (
        <span className="text-xs text-secondary/50">({count})</span>
      )}
    </div>
  );
}
