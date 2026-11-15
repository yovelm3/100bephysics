"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DEVICE_STORAGE_KEY } from "@/lib/device";

function readBackup() {
  try {
    return localStorage.getItem(DEVICE_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeBackup(key: string) {
  try {
    localStorage.setItem(DEVICE_STORAGE_KEY, key);
  } catch {
    // Storage blocked (private mode). The cookie still works.
  }
}

export function DeviceCheck({ next }: { next: string }) {
  const router = useRouter();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/device", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ backup: readBackup() }),
        });
        if (res.status === 401) return router.replace(`/login?next=${encodeURIComponent(next)}`);
        if (!res.ok) throw new Error();
        const { status, deviceKey } = await res.json();
        if (deviceKey) writeBackup(deviceKey);
        if (cancelled) return;
        router.replace(status === "locked" ? "/locked" : next);
        router.refresh();
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [next, router]);

  return failed ? (
    <p className="text-warn">לא הצלחנו לזהות את המכשיר. רענן את הדף ונסה שוב.</p>
  ) : (
    <p className="text-muted">בודקים את המכשיר…</p>
  );
}
