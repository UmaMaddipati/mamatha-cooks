import { Star } from "lucide-react";

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= Math.round(rating)
              ? "fill-secondary text-secondary"
              : "text-border"
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground font-body">({rating})</span>
    </div>
  );
};

export default StarRating;
