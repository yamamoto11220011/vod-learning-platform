"use client";

import { useEffect, useMemo, useState } from "react";

import { CategoryFilter } from "@/components/browse/category-filter";
import { SearchBar } from "@/components/browse/search-bar";
import { VideoCard } from "@/components/browse/video-card";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/database";

type Video = Database["public"]["Tables"]["videos"]["Row"];

export default function BrowsePage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("すべて");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        if (active) {
          setError("Supabase環境変数が未設定です。`.env.local` を設定してください。");
          setLoading(false);
        }
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false });

      if (!active) {
        return;
      }

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setVideos(data ?? []);
      }

      setLoading(false);
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(videos.map((video) => video.category).filter(Boolean))) as string[],
    [videos],
  );

  const filtered = useMemo(() => {
    return videos.filter((video) => {
      const byCategory = selectedCategory === "すべて" || video.category === selectedCategory;
      const bySearch = video.title.toLowerCase().includes(search.trim().toLowerCase());
      return byCategory && bySearch;
    });
  }, [search, selectedCategory, videos]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl p-4 sm:p-6">
      <section className="mb-6 space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Browse Videos</h1>
        <SearchBar value={search} onChange={setSearch} />
        <CategoryFilter categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />
      </section>

      {loading ? <p className="text-sm text-muted-foreground">読み込み中...</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {!loading && !error ? (
        filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">該当動画がありません。</p>
        ) : (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </section>
        )
      ) : null}
    </main>
  );
}
