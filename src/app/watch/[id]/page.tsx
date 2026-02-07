import { WatchPageClient } from "@/components/player/watch-page-client";

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <WatchPageClient videoId={id} />;
}
