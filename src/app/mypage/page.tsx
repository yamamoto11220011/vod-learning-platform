"use client";

import Link from "next/link";
import { format } from "date-fns";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type NoteWithVideo = {
  id: string;
  content: string;
  video_timestamp: number;
  created_at: string;
  video_id: string;
  videos: {
    title: string;
    thumbnail_url: string | null;
  } | null;
};

function formatTime(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function mapAuthError(message: string) {
  if (message.toLowerCase().includes("invalid login credentials")) {
    return "メールアドレスかパスワードが正しくありません。";
  }
  return message;
}

export default function MyPage() {
  const [notes, setNotes] = useState<NoteWithVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresLogin, setRequiresLogin] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        if (active) {
          setError("Supabase設定が未完了です。`.env.local` にURLとAnon Keyを設定してください。");
          setLoading(false);
        }
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!active) {
        return;
      }

      if (userError) {
        setError(mapAuthError(userError.message));
        setLoading(false);
        return;
      }

      if (!user) {
        setRequiresLogin(true);
        setLoading(false);
        return;
      }

      const { data, error: notesError } = await supabase
        .from("notes")
        .select("id,content,video_timestamp,created_at,video_id,videos(title,thumbnail_url)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!active) {
        return;
      }

      if (notesError) {
        setError(notesError.message);
      } else {
        setNotes((data ?? []) as unknown as NoteWithVideo[]);
      }

      setLoading(false);
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-5xl p-4 sm:p-6">
        <p className="text-sm text-muted-foreground">読み込み中...</p>
      </main>
    );
  }

  if (requiresLogin) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-5xl p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle>ログインが必要です</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">My Pageを表示するにはログインしてください。</p>
            <Button asChild>
              <Link href="/login">ログインへ</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl p-4 sm:p-6">
      <section className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">My Notes</h1>
        <p className="text-sm text-muted-foreground">保存済みメモ: {notes.length}件</p>
      </section>

      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}

      {!error && notes.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">
            まだメモがありません。<Link href="/browse" className="text-primary underline">動画を探す</Link>
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4">
        {notes.map((note) => (
          <Card key={note.id} className="py-0">
            <CardHeader className="pt-4 pb-0">
              <CardTitle className="text-base">
                <Link href={`/watch/${note.video_id}`} className="hover:text-primary">
                  {note.videos?.title ?? "Unknown video"}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 py-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{formatTime(note.video_timestamp)}</Badge>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(note.created_at), "yyyy/MM/dd HH:mm")}
                </span>
              </div>
              <p className="text-sm leading-relaxed">{note.content}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
