import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { getFallbackSiteContent, SiteContentRecord, supabase } from "@/lib/supabase";

type Props = { setMessage: (message: string) => void };

const sectionMeta = [
  ["identity", "Identity & About", "Hero, bio, focus areas"],
  ["skills", "Skills", "Tools and learning groups"],
  ["journey", "Journey", "Timeline entries"],
  ["certifications", "Certifications", "Proof and credential links"],
  ["contact", "Contact & Links", "Social destinations and email"],
] as const;

export default function SiteContentEditor({ setMessage }: Props) {
  const [items, setItems] = useState<SiteContentRecord[]>(getFallbackSiteContent());
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.from("portfolio_site_content").select("key,value").order("key").then(({ data, error }) => {
      if (error) setMessage(`Content table unavailable: ${error.message}`);
      else if (data?.length) setItems(data as SiteContentRecord[]);
      setLoading(false);
    });
  }, [setMessage]);
  const update = (key: string, raw: string) => setItems((current) => current.map((item) => item.key === key ? { ...item, value: raw } : item));
  const save = async (item: SiteContentRecord) => {
    if (!supabase) return;
    let value: unknown;
    try { value = JSON.parse(item.value); } catch { setMessage(`${item.label} must contain valid JSON.`); return; }
    const { error } = await supabase.from("portfolio_site_content").upsert({ key: item.key, value, updated_at: new Date().toISOString() });
    setMessage(error ? error.message : `${item.label} is live and saved.`);
  };
  if (loading) return <section className="admin-showcase"><p className="admin-showcase-loading">Loading live section editors…</p></section>;
  return <section className="admin-showcase" id="site-content-editor"><div className="admin-showcase-head"><div><p className="admin-kicker">LIVE SOURCE SECTIONS</p><h2>Everything<br /><em>editable.</em></h2></div><span className="live-dot">● LIVE</span></div><p className="admin-showcase-copy">Every remaining section is now authenticated, database-backed, and editable. Keep the JSON shape shown in each editor so the public portfolio can render it safely.</p><div className="admin-showcase-list">{sectionMeta.map(([key, label, detail]) => { const item = items.find((entry) => entry.key === key) || { key, label, value: "{}" }; return <article className="admin-showcase-row" key={key}><div className="admin-showcase-mark mark-mint">●</div><div className="admin-showcase-fields"><p className="admin-kicker">LIVE / {detail}</p><h3>{label}</h3><textarea rows={12} value={item.value} onChange={(event) => update(key, event.target.value)} spellCheck={false} /><div className="admin-showcase-actions"><button type="button" className="admin-save" onClick={() => save(item)}><Save size={14} /> Save {label}</button></div></div></article>; })}</div></section>;
}
