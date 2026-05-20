"use client";

import { useEffect, useState } from "react";

type Note = {
  id: number;
  content: string;
  created_at: string;
};

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    const res = await fetch("/api/notes");
    if (!res.ok) {
      setError("Notlar yüklenemedi. Supabase ayarlarını kontrol et.");
      return;
    }
    setNotes(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError("");
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    });
    setLoading(false);

    if (!res.ok) {
      setError("Not eklenemedi.");
      return;
    }
    setText("");
    load();
  }

  return (
    <main>
      <h1>Notlar 📝</h1>
      <p className="sub">Next.js (frontend + API) + Supabase (Postgres) ile çalışan ilk full-stack uygulamam.</p>

      <form onSubmit={addNote}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Bir not yaz..."
        />
        <button type="submit" disabled={loading}>
          {loading ? "..." : "Ekle"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {notes.length === 0 && !error ? (
        <p className="empty">Henüz not yok. İlkini sen ekle!</p>
      ) : (
        <ul>
          {notes.map((note) => (
            <li key={note.id}>
              {note.content}
              <time>{new Date(note.created_at).toLocaleString("tr-TR")}</time>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
