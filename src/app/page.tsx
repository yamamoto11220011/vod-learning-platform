import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-56px)] w-full max-w-4xl flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="rounded-full border border-border/70 bg-card/70 px-4 py-1 text-xs text-muted-foreground">
        Knowledge Learning VOD
      </p>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">動画を見ながら、学びを蓄積する。</h1>
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        タイムスタンプ付きメモで、重要ポイントに即ジャンプ。学習特化のVOD体験をシンプルに実装しています。
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/browse">動画を探す</Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="/watch/demo-video-id">デモ視聴</Link>
        </Button>
      </div>
    </main>
  );
}
