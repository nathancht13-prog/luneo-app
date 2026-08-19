import { useState, type ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Clock3,
  Heart,
  Home,
  Library,
  MoreHorizontal,
  Plus,
  Settings,
  Sparkles,
  WandSparkles,
} from "lucide-react";

type Story = {
  title: string;
  subtitle: string;
  time: string;
  palette: string;
  favorite?: boolean;
  kind: "cave" | "mountain" | "dino";
};

const stories: Story[] = [
  { title: "La grotte aux lucioles", subtitle: "Amitié · Ce soir", time: "5 min", palette: "#6faeb0", favorite: true, kind: "cave" },
  { title: "Le secret de la montagne bleue", subtitle: "Exploration · Hier", time: "8 min", palette: "#344c9d", favorite: true, kind: "mountain" },
  { title: "Léo et le dinosaure qui tremblait", subtitle: "Confiance · Il y a 3 jours", time: "5 min", palette: "#df8b62", kind: "dino" },
];

function BrandMark({ small = false }: { small?: boolean }) {
  return (
    <span style={{ width: small ? 29 : 38, height: small ? 29 : 38, borderRadius: small ? 10 : 13, background: "#f7c95c", display: "grid", placeItems: "center", position: "relative", overflow: "hidden", flex: "0 0 auto" }}>
      <span style={{ width: small ? 17 : 22, height: small ? 17 : 22, borderRadius: "50%", background: "#253d8e", transform: "translate(4px,-3px)" }} />
      <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#f7c95c", position: "absolute", top: 6, right: 6 }} />
    </span>
  );
}

function StoryArt({ kind, palette }: Pick<Story, "kind" | "palette">) {
  const art: Record<Story["kind"], ReactNode> = {
    cave: <><circle cx="110" cy="40" r="38" fill="#d2f0df" opacity=".82" /><path d="M0 112C25 60 55 88 77 53c22-35 53 5 85-37 19-25 38-28 58-22v106H0Z" fill="#236478" opacity=".84" /><circle cx="89" cy="70" r="2.5" fill="#fff7c9" /><circle cx="120" cy="90" r="2" fill="#fff7c9" /><circle cx="151" cy="58" r="3" fill="#fff7c9" /></>,
    mountain: <><circle cx="160" cy="34" r="31" fill="#f6cf63" /><path d="M0 118 72 25l45 61 28-37 75 69Z" fill="#667fc6" /><path d="M37 118 100 50l34 40 38-52 48 80Z" fill="#253e87" /><path d="m81 58 19-8 8 14 10-8 16 24Z" fill="#dbe7f4" opacity=".9" /></>,
    dino: <><circle cx="156" cy="35" r="31" fill="#ffd886" opacity=".9" /><path d="M0 106c32-55 59-21 83-46 22-23 47-5 68-40 15-25 50-23 69-11v104H0Z" fill="#c86f55" opacity=".62" /><path d="M85 105c-12-42 20-68 52-48 15 9 14 21 22 27l17-4-9 17-8 7H89Z" fill="#486e75" /><circle cx="145" cy="65" r="3.2" fill="#22365b" /><path d="m105 57 7-12 7 13 9-12 6 17" fill="#486e75" /></>,
  };
  return <svg viewBox="0 0 220 118" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "100%", background: palette }}>{art[kind]}</svg>;
}

export default function LuneoRefined() {
  const [favorites, setFavorites] = useState(() => stories.map((story) => Boolean(story.favorite)));
  const [notice, setNotice] = useState("");
  const toggleFavorite = (index: number) => {
    setFavorites((current) => current.map((value, item) => item === index ? !value : value));
    setNotice(favorites[index] ? "Retirée des favoris" : "Ajoutée aux favoris");
  };
  const navItem = (icon: ReactNode, label: string, active = false) => (
    <button onClick={() => setNotice(`${label} sélectionné`)} style={{ display: "flex", width: "100%", alignItems: "center", gap: 12, padding: "12px 13px", border: 0, borderRadius: 12, background: active ? "#f7c95c" : "transparent", color: active ? "#21377e" : "#cbd7f4", fontFamily: "inherit", fontSize: 14, fontWeight: active ? 750 : 500, cursor: "pointer", textAlign: "left" }}>
      {icon}{label}
    </button>
  );

  return (
    <main style={{ minHeight: "100%", background: "#f7f5ee", color: "#24345c", fontFamily: "'DM Sans', ui-sans-serif, system-ui, sans-serif", display: "flex", letterSpacing: "-0.01em" }}>
      <aside style={{ width: 258, minHeight: "100%", padding: "29px 17px 22px", background: "#243d8e", color: "#eef2ff", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "0 12px 41px", fontFamily: "Georgia, serif", fontSize: 28, letterSpacing: "-.06em" }}><BrandMark />luneo</div>
        <div style={{ padding: "0 13px 10px", color: "#aabce9", fontSize: 10, fontWeight: 800, letterSpacing: ".15em", textTransform: "uppercase" }}>Le rituel du soir</div>
        <nav style={{ display: "grid", gap: 5 }}>
          {navItem(<Home size={17} />, "Accueil", true)}
          {navItem(<Library size={17} />, "Bibliothèque")}
          {navItem(<WandSparkles size={17} />, "Aventures")}
        </nav>
        <div style={{ flex: 1 }} />
        <div style={{ borderTop: "1px solid rgba(255,255,255,.16)", paddingTop: 16, display: "grid", gap: 5 }}>
          {navItem(<Settings size={17} />, "Réglages")}
          <div style={{ margin: "11px 4px 0", padding: "13px 8px 2px", display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: "#edd9a3", color: "#243d8e", display: "grid", placeItems: "center", fontWeight: 800 }}>L</div>
            <div><div style={{ fontSize: 13, fontWeight: 750, color: "#fff" }}>Léo</div><div style={{ fontSize: 11, color: "#b8c7ed", marginTop: 2 }}>6 ans · explorateur</div></div>
          </div>
        </div>
      </aside>

      <section style={{ width: "calc(100% - 258px)", minWidth: 0, padding: "22px clamp(26px,4.1vw,64px) 48px", boxSizing: "border-box", maxWidth: 1550 }}>
        <header style={{ height: 41, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 25 }}>
          <div style={{ color: "#8892a5", fontSize: 13 }}>Mardi 16 avril <span style={{ color: "#c2b9a9", margin: "0 8px" }}>·</span> 20:34</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {notice && <span style={{ color: "#52617e", fontSize: 12, fontWeight: 650 }}>{notice}</span>}
            <button onClick={() => setNotice("Réglages ouverts")} aria-label="Réglages" style={{ width: 38, height: 38, border: "1px solid #e5dfd3", borderRadius: 12, background: "#fffdfa", color: "#62708b", display: "grid", placeItems: "center", cursor: "pointer" }}><Settings size={17} /></button>
            <button onClick={() => setNotice("Profil de Léo")} aria-label="Profil de Léo" style={{ width: 38, height: 38, border: 0, borderRadius: 12, background: "#ead7a8", color: "#243d8e", fontWeight: 800, cursor: "pointer" }}>L</button>
          </div>
        </header>

        <section style={{ minHeight: 322, overflow: "hidden", position: "relative", borderRadius: 26, background: "#243d8e", padding: "42px 45px", boxSizing: "border-box", color: "#fff", boxShadow: "0 18px 36px rgba(35,59,137,.14)" }}>
          <div style={{ position: "absolute", width: 490, height: 490, border: "1px solid rgba(247,201,92,.18)", borderRadius: "50%", right: -123, top: -187 }} />
          <div style={{ position: "absolute", width: 405, height: 405, border: "1px solid rgba(247,201,92,.16)", borderRadius: "50%", right: -81, top: -145 }} />
          <div style={{ position: "absolute", width: 220, height: 220, background: "#f7c95c", borderRadius: "50%", right: 88, bottom: -93 }} />
          <div style={{ position: "absolute", width: 178, height: 178, background: "#243d8e", borderRadius: "50%", right: 126, bottom: -67 }} />
          <span style={{ position: "absolute", right: 315, top: 75, color: "#f9dc8c", fontSize: 22 }}>✦</span>
          <span style={{ position: "absolute", right: 128, top: 43, color: "#f9dc8c", fontSize: 12 }}>✦</span>
          <div style={{ position: "relative", maxWidth: 610 }}>
            <div style={{ color: "#f7c95c", fontSize: 11, fontWeight: 800, letterSpacing: ".15em", textTransform: "uppercase" }}>Le moment des histoires</div>
            <h1 style={{ fontFamily: "Georgia, serif", margin: "12px 0 14px", maxWidth: 540, fontSize: "clamp(34px,4vw,57px)", lineHeight: 1.02, letterSpacing: "-.055em", fontWeight: 600 }}>Bonsoir, la famille de Léo.</h1>
            <p style={{ margin: 0, maxWidth: 460, color: "#d0daf4", fontSize: 15, lineHeight: 1.65 }}>Une histoire douce, pensée juste pour lui, est prête à prendre vie ce soir.</p>
            <button onClick={() => setNotice("Nouvelle histoire — choisissez un univers")} style={{ marginTop: 25, border: 0, borderRadius: 12, padding: "13px 17px", background: "#f7c95c", color: "#21377e", display: "inline-flex", alignItems: "center", gap: 9, fontFamily: "inherit", fontSize: 13, fontWeight: 800, cursor: "pointer" }}><Plus size={17} />Créer une histoire</button>
          </div>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 292px", gap: 23, marginTop: 39 }}>
          <section>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 17 }}>
              <h2 style={{ margin: 0, color: "#25375f", fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 600, letterSpacing: "-.04em" }}>Histoires récentes</h2>
              <button onClick={() => setNotice("Bibliothèque ouverte")} style={{ border: 0, background: "transparent", color: "#243d8e", fontFamily: "inherit", fontWeight: 800, fontSize: 12, display: "flex", gap: 3, alignItems: "center", cursor: "pointer" }}>Tout voir <ChevronRight size={15} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 15 }}>
              {stories.map((story, index) => (
                <article key={story.title} style={{ overflow: "hidden", border: "1px solid #e6dfd4", background: "#fffdfa", borderRadius: 17, boxShadow: "0 8px 20px rgba(36,52,92,.04)" }}>
                  <div style={{ height: 128, position: "relative" }}><StoryArt kind={story.kind} palette={story.palette} /><span style={{ position: "absolute", left: 14, bottom: 12, padding: "5px 8px", borderRadius: 7, color: "#fff", background: "rgba(27,41,83,.26)", fontSize: 10, fontWeight: 700 }}>Pour Léo</span></div>
                  <div style={{ padding: "15px 16px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#7a8497", fontSize: 10.5 }}><span>{story.subtitle}</span><span style={{ display: "flex", alignItems: "center", gap: 3 }}><Clock3 size={11} />{story.time}</span></div>
                    <h3 style={{ color: "#26385f", margin: "7px 0 13px", minHeight: 42, fontFamily: "Georgia, serif", fontSize: 18, lineHeight: 1.14, letterSpacing: "-.03em", fontWeight: 600 }}>{story.title}</h3>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <button onClick={() => setNotice(`Lecture : ${story.title}`)} style={{ border: 0, borderRadius: 9, background: "#f0eee8", color: "#243d8e", padding: "8px 9px", fontFamily: "inherit", fontSize: 11, fontWeight: 800, display: "flex", gap: 4, alignItems: "center", cursor: "pointer" }}>Lire <ArrowRight size={13} /></button>
                      <button onClick={() => toggleFavorite(index)} aria-label="Ajouter aux favoris" style={{ border: 0, background: "transparent", color: favorites[index] ? "#d98258" : "#b9b3a7", cursor: "pointer", padding: 4 }}><Heart size={18} fill={favorites[index] ? "currentColor" : "none"} /></button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside>
            <div style={{ padding: 20, borderRadius: 18, background: "#edeae0", minHeight: 182, boxSizing: "border-box" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ color: "#8c7952", fontSize: 10, fontWeight: 800, letterSpacing: ".13em", textTransform: "uppercase" }}>À poursuivre</div><MoreHorizontal size={17} color="#758095" /></div>
              <div style={{ display: "flex", gap: 12, marginTop: 16, alignItems: "center" }}>
                <div style={{ width: 68, height: 74, borderRadius: 12, background: "linear-gradient(140deg,#e9b96e,#6e9f9e)", position: "relative", overflow: "hidden", flex: "0 0 auto" }}><span style={{ position: "absolute", bottom: -18, left: 15, width: 57, height: 57, borderRadius: "50%", background: "#dc7650" }} /></div>
                <div><h3 style={{ margin: 0, color: "#25375f", fontFamily: "Georgia,serif", fontSize: 17, lineHeight: 1.08, letterSpacing: "-.03em" }}>Léo et Flamme</h3><p style={{ margin: "5px 0 0", color: "#697388", fontSize: 11, lineHeight: 1.35 }}>Épisode 2 · La montagne bleue</p></div>
              </div>
              <div style={{ marginTop: 14, height: 5, background: "#d7d0c3", borderRadius: 4 }}><div style={{ width: "40%", height: "100%", background: "#243d8e", borderRadius: 4 }} /></div>
              <button onClick={() => setNotice("Reprise de l'épisode 2")} style={{ marginTop: 12, color: "#243d8e", border: 0, background: "transparent", padding: 0, fontFamily: "inherit", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", cursor: "pointer" }}>Continuer l'aventure <ChevronRight size={14} /></button>
            </div>
            <div style={{ marginTop: 18, padding: "17px 19px", border: "1px solid #e8e1d5", borderRadius: 17, background: "#fffdfa" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#243d8e" }}><span style={{ width: 28, height: 28, borderRadius: 9, background: "#f8eac0", display: "grid", placeItems: "center" }}><Sparkles size={15} /></span><strong style={{ fontSize: 13 }}>Le petit rituel</strong></div>
              <p style={{ color: "#758095", margin: "10px 0 0", fontSize: 12, lineHeight: 1.48 }}>Une histoire de 5 minutes suffit pour fermer doucement la journée.</p>
            </div>
          </aside>
        </div>
        <div style={{ marginTop: 34, paddingTop: 16, borderTop: "1px solid #e7e0d5", display: "flex", alignItems: "center", gap: 8, color: "#8992a2", fontSize: 11 }}><BookOpen size={14} /> 12 histoires inventées ensemble</div>
      </section>
    </main>
  );
}