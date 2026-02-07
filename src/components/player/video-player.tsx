"use client";

import { Pause, Play, RotateCcw, RotateCw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

type VideoPlayerProps = {
  title: string;
  videoUrl: string;
  seekToSeconds: number | null;
  onTimeUpdate: (seconds: number) => void;
};

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

function formatTime(totalSeconds: number) {
  const safe = Number.isFinite(totalSeconds) ? Math.max(0, Math.floor(totalSeconds)) : 0;
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;

  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  return `${m}:${String(s).padStart(2, "0")}`;
}

export function VideoPlayer({ title, videoUrl, seekToSeconds, onTimeUpdate }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || seekToSeconds === null) {
      return;
    }

    video.currentTime = seekToSeconds;
    onTimeUpdate(seekToSeconds);
  }, [onTimeUpdate, seekToSeconds]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.playbackRate = playbackRate;
  }, [playbackRate]);

  const playedPercent = useMemo(() => {
    if (!duration) {
      return 0;
    }

    return Math.min(100, (playedSeconds / duration) * 100);
  }, [duration, playedSeconds]);

  const seekTo = (seconds: number) => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const next = Math.max(0, Math.min(duration || video.duration || seconds, seconds));
    video.currentTime = next;
    setPlayedSeconds(next);
    onTimeUpdate(next);
  };

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-border bg-black">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full"
          style={{ aspectRatio: "16 / 9" }}
          onClick={() => {
            const video = videoRef.current;
            if (!video) {
              return;
            }
            if (video.paused) {
              void video.play();
              setPlaying(true);
            } else {
              video.pause();
              setPlaying(false);
            }
          }}
          onLoadedMetadata={(event) => {
            setDuration(event.currentTarget.duration || 0);
          }}
          onTimeUpdate={(event) => {
            const nextSeconds = event.currentTarget.currentTime;
            setPlayedSeconds(nextSeconds);
            onTimeUpdate(nextSeconds);
          }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-3">
        <p className="mb-3 line-clamp-1 text-sm font-medium text-foreground">{title}</p>

        <input
          className="mb-3 h-2 w-full cursor-pointer accent-primary"
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={playedPercent}
          onChange={(event) => {
            const nextPercent = Number(event.target.value);
            seekTo((nextPercent / 100) * duration);
          }}
          aria-label="Seek"
        />

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="icon"
              variant="secondary"
              onClick={() => {
                seekTo(playedSeconds - 10);
              }}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              size="icon"
              onClick={() => {
                const video = videoRef.current;
                if (!video) {
                  return;
                }

                if (video.paused) {
                  void video.play();
                  setPlaying(true);
                } else {
                  video.pause();
                  setPlaying(false);
                }
              }}
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>

            <Button
              type="button"
              size="icon"
              variant="secondary"
              onClick={() => {
                seekTo(playedSeconds + 10);
              }}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatTime(playedSeconds)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
            <select
              value={playbackRate}
              onChange={(event) => setPlaybackRate(Number(event.target.value))}
              className="ml-2 rounded-md border border-input bg-background px-2 py-1 text-xs"
              aria-label="Playback speed"
            >
              {SPEEDS.map((speed) => (
                <option key={speed} value={speed}>
                  {speed}x
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
