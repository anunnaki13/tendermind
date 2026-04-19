"use client";

import { useEffect, useState } from "react";

type AuthGuardProps = {
  apiBaseUrl: string;
  children: React.ReactNode;
};

type AuthState =
  | { status: "checking" }
  | { status: "authenticated"; user: { email: string; full_name: string; role: string } }
  | { status: "unauthenticated" };

function readToken(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith("tendermind_access_token="));

  if (cookie) {
    return decodeURIComponent(cookie.split("=")[1] ?? "");
  }

  return localStorage.getItem("tendermind_access_token");
}

export function AuthGuard({ apiBaseUrl, children }: AuthGuardProps) {
  const [authState, setAuthState] = useState<AuthState>({ status: "checking" });

  useEffect(() => {
    let active = true;

    async function verify() {
      const token = readToken();
      if (!token) {
        setAuthState({ status: "unauthenticated" });
        window.location.replace("/login");
        return;
      }

      try {
        const response = await fetch(`${apiBaseUrl}/api/v1/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("unauthorized");
        }

        const data = (await response.json()) as { email: string; full_name: string; role: string };
        if (!active) {
          return;
        }

        setAuthState({ status: "authenticated", user: data });
      } catch {
        localStorage.removeItem("tendermind_access_token");
        localStorage.removeItem("tendermind_user_email");
        document.cookie = "tendermind_access_token=; Max-Age=0; Path=/; SameSite=Lax";
        setAuthState({ status: "unauthenticated" });
        window.location.replace("/login");
      }
    }

    void verify();

    return () => {
      active = false;
    };
  }, [apiBaseUrl]);

  if (authState.status !== "authenticated") {
    return (
      <main className="login-shell">
        <div className="card login-panel" style={{ maxWidth: 420 }}>
          <p className="mini-heading">Authentication</p>
          <h1 style={{ margin: "0 0 12px", fontSize: 30, letterSpacing: "-0.05em" }}>Memverifikasi sesi</h1>
          <p className="muted" style={{ lineHeight: 1.7 }}>
            Sistem sedang memeriksa token login Anda sebelum membuka workspace internal.
          </p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
