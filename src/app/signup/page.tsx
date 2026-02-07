"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function mapAuthError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("user already registered")) {
    return "このメールアドレスは既に登録されています。ログインしてください。";
  }
  if (lower.includes("password should be at least")) {
    return "パスワードは6文字以上で入力してください。";
  }
  return message;
}

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setError("Supabase設定が未完了です。`.env.local` にURLとAnon Keyを設定してください。");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (signupError) {
      setError(mapAuthError(signupError.message));
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push("/mypage");
      router.refresh();
      return;
    }

    setMessage("登録は完了しました。確認メールのリンクを開いてからログインしてください。");
    setLoading(false);
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-56px)] w-full max-w-md items-center p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>新規登録</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="email@example.com"
              required
            />
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="password (6文字以上)"
              minLength={6}
              required
            />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {message ? <p className="text-sm text-emerald-500">{message}</p> : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "登録中..." : "登録"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            すでにアカウントがある場合は <Link href="/login" className="text-primary underline">ログイン</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
