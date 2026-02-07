"use client";

import { useEffect, useState } from "react";

import { NotesPanel } from "@/components/player/notes-panel";
import { VideoPlayer } from "@/components/player/video-player";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/database";

type Note = Database["public"]["Tables"]["notes"]["Row"];
type Video = Database["public"]["Tables"]["videos"]["Row"];

const FALLBACK_VIDEO_URL = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export function WatchPageClient({ videoId }: { videoId: string }) {
  const [video, setVideo] = useState<Video | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [seekToSeconds, setSeekToSeconds] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

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

      try {
        const userResult = await supabase.auth.getUser();
        const uid = userResult.data.user?.id ?? null;

        if (active) {
          setUserId(uid);
        }

        const { data: videoData, error: videoError } = await supabase
          .from("videos")
          .select("*")
          .eq("id", videoId)
          .single();

        if (videoError) {
          throw videoError;
        }

        const { data: notesData, error: notesError } = uid
          ? await supabase
              .from("notes")
              .select("*")
              .eq("video_id", videoId)
              .eq("user_id", uid)
              .order("video_timestamp", { ascending: true })
          : { data: [], error: null };

        if (notesError) {
          throw notesError;
        }

        if (!active) {
          return;
        }

        setVideo(videoData);
        setNotes(notesData ?? []);
      } catch (loadError) {
        if (!active) {
          return;
        }

        const message = loadError instanceof Error ? loadError.message : "データの取得に失敗しました。";
        setError(message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [videoId]);

  const handleAddNote = async () => {
    const content = noteDraft.trim();
    if (!content) {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase環境変数が未設定です。`.env.local` を設定してください。");
      return;
    }

    if (!userId) {
      setError("メモ保存にはログインが必要です。");
      return;
    }

    setSaving(true);

    try {
      const payload: Database["public"]["Tables"]["notes"]["Insert"] = {
        user_id: userId,
        video_id: videoId,
        content,
        video_timestamp: Math.floor(currentTime),
      };

      const { data, error: insertError } = await supabase
        .from("notes")
        .insert(payload as never)
        .select("*")
        .single();
      if (insertError) {
        throw insertError;
      }

      setNotes((prev) => [...prev, data].sort((a, b) => a.video_timestamp - b.video_timestamp));
      setNoteDraft("");
      setError(null);
    } catch (insertError) {
      const message = insertError instanceof Error ? insertError.message : "メモ保存に失敗しました。";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <main className="mx-auto max-w-7xl p-4 text-sm text-muted-foreground">読み込み中...</main>;
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl p-4 sm:p-6">
      {error ? (
        <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <VideoPlayer
          title={video?.title ?? "Sample Video"}
          videoUrl={video?.video_url ?? FALLBACK_VIDEO_URL}
          seekToSeconds={seekToSeconds}
          onTimeUpdate={(seconds) => {
            setCurrentTime(seconds);
            if (seekToSeconds !== null) {
              setSeekToSeconds(null);
            }
          }}
        />

        <NotesPanel
          notes={notes}
          noteDraft={noteDraft}
          saving={saving}
          currentTime={currentTime}
          onDraftChange={setNoteDraft}
          onAddNote={handleAddNote}
          onSeekToNote={(seconds) => setSeekToSeconds(seconds)}
        />
      </div>
    </main>
  );
}
