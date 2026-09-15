import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from "lucide-react";
import { getFallbackJournal, JournalRecord, supabase } from "@/lib/supabase";

type Props = { setMessage: (message: string) => void };

export default function JournalEditor({ setMessage }: Props) {
  const [items, setItems] = useState<JournalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setItems(getFallbackJournal()); setLoading(false); return; }
    supabase.from("portfolio_journal").select("*").order("sort_order", { ascending: true }).then(({ data, error }) => {
      if (error) { setMessage(`Journal table unavailable: ${error.message}`); setItems(getFallbackJournal()); }
      else setItems((data || []) as JournalRecord[]);
      setLoading(false);
    });
  }, [setMessage]);

  const update = (index: number, patch: Partial<JournalRecord>) => setItems((current) => current.map((item, i) => i === index ? { ...item, ...patch } : item));
  const save = async (index: number) => {
    if (!supabase) return;
    const item = items[index];
    const payload = { title: item.title, excerpt: item.excerpt, body: item.body, published_at: item.published_at, read_time: item.read_time, tags: item.tags, featured: item.featured, sort_order: item.sort_order };
    const result = item.id ? await supabase.from("portfolio_journal").update(payload).eq("id", item.id) : await supabase.from("portfolio_journal").insert(payload);
    setMessage(result.error ? result.error.message : `${item.title || "Journal entry"} saved.`);
  };
  const add = () => setItems((current) => [...current, { title: "New journal entry", excerpt: "A short introduction…", body: "Write the full journal note here…", published_at: new Date().toISOString().slice(0, 10), read_time: "3 min read", tags: ["Notes"], featured: false, sort_order: current.length }]);
  const remove = async (index: number) => {
    const item = items[index];
    if (supabase && item.id) { const { error } = await supabase.from("portfolio_journal").delete().eq("id", item.id); if (error) { setMessage(error.message); return; } }
    setItems((current) => current.filter((_, i) => i !== index)); setMessage("Journal entry removed.");
  };
  const move = (index: number, direction: -1 | 1) => { const target = index + direction; if (target < 0 || target >= items.length) return; const next = [...items]; [next[index], next[target]] = [next[target], next[index]]; setItems(next.map((item, i) => ({ ...item, sort_order: i }))); };

  if (loading) return <section className="admin-showcase"><p className="admin-showcase-loading">Loading journal editor…</p></section>;
  return <section className="admin-showcase" id="journal-editor">
    <div className="admin-showcase-head"><div><p className="admin-kicker">PUBLIC SECTION 08</p><h2>Journal<br /><em>in progress.</em></h2></div><button type="button" className="admin-save" onClick={add}><Plus size={15} /> Add entry</button></div>
    <p className="admin-showcase-copy">Edit the notes shown in the public Journal section. Use the excerpt for the card and the body for the expanded reading view.</p>
    <div className="admin-showcase-list">{items.map((item, index) => <article className="admin-showcase-row" key={item.id || `journal-${index}`}>
      <div className="admin-showcase-mark mark-violet">{String(index + 1).padStart(2, "0")}</div><div className="admin-showcase-fields">
        <label>Title<input value={item.title} onChange={(event) => update(index, { title: event.target.value })} /></label>
        <div className="admin-two"><label>Date<input type="date" value={item.published_at || ""} onChange={(event) => update(index, { published_at: event.target.value })} /></label><label>Read time<input value={item.read_time} onChange={(event) => update(index, { read_time: event.target.value })} /></label></div>
        <label>Tags, comma separated<input value={(item.tags || []).join(", ")} onChange={(event) => update(index, { tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean) })} /></label>
        <label>Card excerpt<textarea rows={3} value={item.excerpt} onChange={(event) => update(index, { excerpt: event.target.value })} /></label>
        <label>Full journal text<textarea rows={7} value={item.body} onChange={(event) => update(index, { body: event.target.value })} /></label>
        <label className="admin-check"><input type="checkbox" checked={item.featured} onChange={(event) => update(index, { featured: event.target.checked })} /> Feature this entry</label>
        <div className="admin-showcase-actions"><button type="button" className="admin-save" onClick={() => save(index)}><Save size={14} /> Save entry</button><button type="button" className="showcase-move" onClick={() => move(index, -1)} disabled={index === 0}><ArrowUp size={14} /> Earlier</button><button type="button" className="showcase-move" onClick={() => move(index, 1)} disabled={index === items.length - 1}><ArrowDown size={14} /> Later</button><button type="button" className="showcase-delete" onClick={() => remove(index)}><Trash2 size={14} /> Delete</button></div>
      </div></article>)}</div>
  </section>;
}
