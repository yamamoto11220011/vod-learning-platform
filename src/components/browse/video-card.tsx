import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Database } from "@/lib/types/database";

type Video = Database["public"]["Tables"]["videos"]["Row"];

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function VideoCard({ video }: { video: Video }) {
  return (
    <Link href={`/watch/${video.id}`}>
      <Card className="overflow-hidden py-0 transition hover:scale-[1.01] hover:border-primary/40">
        <div className="aspect-video bg-muted">
          {video.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={video.thumbnail_url} alt={video.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No Thumbnail</div>
          )}
        </div>
        <CardContent className="space-y-2 p-4">
          <p className="line-clamp-2 text-sm font-medium leading-5">{video.title}</p>
          <div className="flex items-center justify-between">
            <Badge variant="secondary">{video.category ?? "Uncategorized"}</Badge>
            <span className="text-xs text-muted-foreground">{formatDuration(video.duration)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
