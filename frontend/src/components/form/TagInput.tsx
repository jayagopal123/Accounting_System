import React, { useState } from "react";
import { X } from "lucide-react";

export const TagInput: React.FC<{ tags: string[]; onChange: (tags: string[]) => void; placeholder?: string }> = ({
  tags,
  onChange,
  placeholder = "Type and press Enter…",
}) => {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const t = draft.trim();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setDraft("");
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-input bg-card px-3 py-2">
      {tags.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          {t}
          <button type="button" onClick={() => onChange(tags.filter((x) => x !== t))} aria-label={`Remove ${t}`}>
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
          if (e.key === "Backspace" && !draft && tags.length) onChange(tags.slice(0, -1));
        }}
        onBlur={commit}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="min-w-24 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
};

export default TagInput;
