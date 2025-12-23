import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import type { Event } from "@/lib/types";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className="shrink-0 w-64">
      {/* Image */}
      {event.media.photos.length > 0 && (
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <img
            src={event.media.photos[0].url || "/placeholder.svg"}
            alt={event.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="p-4">
        {/* Event Type */}
        <Badge variant="secondary" className="mb-2">
          {event.type}
        </Badge>

        {/* Event Name */}
        <h3 className="mb-2 text-lg font-semibold text-foreground">
          {event.name}
        </h3>

        {/* About */}
        {event.about && (
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
            {event.about}
          </p>
        )}

        {/* Date */}
        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(event.startDate)}</span>
        </div>

        {/* Location */}
        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>
            {event.venue?.name || event.geodata.name}, {event.geodata.country}
          </span>
        </div>

        {/* Genres */}
        {event.genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {event.genres.slice(0, 3).map((genre) => (
              <Badge key={genre.id} variant="outline" className="text-xs">
                {genre.name}
              </Badge>
            ))}
            {event.genres.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{event.genres.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
