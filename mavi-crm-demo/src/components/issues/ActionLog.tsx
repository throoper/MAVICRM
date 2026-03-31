import { useState } from "react";
import type { ActionEntry } from "../../types";
import { TEAM_MEMBERS } from "../../types";

interface ActionLogProps {
  entries: ActionEntry[];
  onAddEntry: (entry: ActionEntry) => void;
}

export default function ActionLog({ entries, onAddEntry }: ActionLogProps) {
  const [note, setNote] = useState("");
  const [author, setAuthor] = useState<string>(TEAM_MEMBERS[0]);

  const handleAdd = () => {
    if (!note.trim()) return;
    onAddEntry({
      id: `act-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      author,
      note: note.trim(),
    });
    setNote("");
  };

  return (
    <div>
      <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "16px" }}>
        <select
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          style={{
            padding: "8px 10px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "13px",
            background: "#fff",
          }}
        >
          {TEAM_MEMBERS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Add an action note..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          style={{
            flex: 1,
            padding: "8px 12px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "13px",
            outline: "none",
          }}
        />
        <button
          onClick={handleAdd}
          disabled={!note.trim()}
          style={{
            padding: "8px 16px",
            background: note.trim() ? "#2563eb" : "#94a3b8",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: 500,
            cursor: note.trim() ? "pointer" : "default",
          }}
        >
          Add
        </button>
      </div>

      {entries.length > 0 ? (
        <div>
          {[...entries].reverse().map((entry) => (
            <div
              key={entry.id}
              style={{
                padding: "12px 16px",
                borderLeft: "3px solid #2563eb",
                background: "#f8fafc",
                borderRadius: "0 6px 6px 0",
                marginBottom: "8px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#1e40af" }}>{entry.author}</span>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>{entry.date}</span>
              </div>
              <p style={{ fontSize: "13px", color: "#374151", margin: 0 }}>{entry.note}</p>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: "#9ca3af", fontSize: "13px" }}>No action log entries yet.</p>
      )}
    </div>
  );
}
