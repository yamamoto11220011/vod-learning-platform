"use client";

import { format } from "date-fns";
import { Clock3, NotebookPen } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import type { Database } from "@/lib/types/database";

type Note = Database["public"]["Tables"]["notes"]["Row"];

type NotesPanelProps = {
  notes: Note[];
  noteDraft: string;
  saving: boolean;
  currentTime: number;
  onDraftChange: (value: string) => void;
  onAddNote: () => Promise<void>;
  onSeekToNote: (seconds: number) => void;
};

function formatTime(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function NotesPanel({
  notes,
  noteDraft,
  saving,
  currentTime,
  onDraftChange,
  onAddNote,
  onSeekToNote,
}: NotesPanelProps) {
  return (
    <Card className="h-full min-h-[420px]">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <NotebookPen className="h-4 w-4" />
          Timestamp Notes
        </CardTitle>
        <Badge variant="secondary" className="w-fit">
          <Clock3 className="mr-1 h-3.5 w-3.5" />
          現在: {formatTime(currentTime)}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <Textarea
          placeholder="この時点で学んだことをメモ..."
          value={noteDraft}
          onChange={(event) => onDraftChange(event.target.value)}
          rows={4}
        />

        <Button onClick={onAddNote} disabled={saving || !noteDraft.trim()} className="w-full">
          {saving ? "保存中..." : `メモを追加 (${formatTime(currentTime)})`}
        </Button>

        <ScrollArea className="h-[280px] rounded-lg border border-border p-2">
          <div className="space-y-2 pr-2">
            {notes.length === 0 ? (
              <p className="text-sm text-muted-foreground">メモはまだありません。</p>
            ) : (
              notes.map((note) => (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => onSeekToNote(note.video_timestamp)}
                  className="w-full rounded-lg border border-border bg-card p-3 text-left hover:bg-accent"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <Badge variant="outline">{formatTime(note.video_timestamp)}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(note.created_at), "yyyy/MM/dd HH:mm")}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground">{note.content}</p>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
