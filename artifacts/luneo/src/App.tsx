import { useEffect, useId, useRef, useState } from 'react';
import {
  ClerkProvider,
  SignIn,
  SignUp,
  Show,
  useClerk,
  useUser,
} from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import {
  Link,
  Redirect,
  Route,
  Router as WouterRouter,
  Switch,
  useLocation,
  useParams,
} from 'wouter';
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from '@tanstack/react-query';
import { WhopCheckoutEmbed } from '@whop/checkout/react';
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Heart,
  Home,
  Library,
  LogOut,
  Plus,
  Search,
  Settings,
  Sparkles,
  UserRound,
  WandSparkles,
} from 'lucide-react';
import { themes, interestOptions, preferenceOptions, type Category, type Child, type Story } from './data';

// ─── Clerk setup ─────────────────────────────────────────────────────────────
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk' as const,
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: '#1E3A8A',
    colorForeground: '#24345c',
    colorMutedForeground: '#748096',
    colorDanger: '#dc2626',
    colorBackground: '#FAF8F5',
    colorInput: '#ffffff',
    colorInputForeground: '#24345c',
    colorNeutral: '#e7dfd2',
    fontFamily: "'DM Sans', sans-serif",
    borderRadius: '12px',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-xl border border-[#e7dfd2]',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'font-serif text-[#1e3a8a]',
    headerSubtitle: 'text-[#748096]',
    socialButtonsBlockButtonText: 'text-[#24345c]',
    formFieldLabel: 'text-[#56627a] font-semibold text-sm',
    footerActionLink: 'text-[#1e3a8a] font-bold',
    footerActionText: 'text-[#7e8797]',
    dividerText: 'text-[#9aa0ae]',
    identityPreviewEditButton: 'text-[#1e3a8a]',
    formFieldSuccessText: 'text-green-600',
    alertText: 'text-[#24345c]',
    logoBox: 'flex justify-center mb-2',
    logoImage: 'h-10 w-10',
    socialButtonsBlockButton: 'border border-[#e7dfd2] bg-white hover:bg-[#f5f2ec] text-[#24345c]',
    formButtonPrimary: 'bg-[#1e3a8a] hover:bg-[#2a4fa8] text-white',
    formFieldInput: 'border-[#e3ddd3] bg-[#fffdfb] text-[#24345c] focus:border-[#768dca]',
    footerAction: 'bg-[#f5f2ec]',
    dividerLine: 'bg-[#e4ddd2]',
    alert: 'border-[#e7dfd2]',
    otpCodeFieldInput: 'border-[#e3ddd3]',
    formFieldRow: '',
    main: '',
  },
};

// ─── QueryClient ─────────────────────────────────────────────────────────────
const queryClient = new QueryClient();

// ─── Local state (stories, child, settings) ───────────────────────────────
const STORAGE = 'luneo-demo-state-v2';
type State = { stories: Story[]; child: Child; settings: { reminders: boolean; calm: boolean } };
const emptyChild: Child = { name: '', age: 6, interests: [], preferences: [], siblings: '', reading: 'Avec un parent, avant le coucher' };
const initialState: State = { stories: [], child: emptyChild, settings: { reminders: true, calm: true } };

function useLuneo() {
  const [state, setState] = useState<State>(() => {
    try { return { ...initialState, ...JSON.parse(localStorage.getItem(STORAGE) || '{}') }; }
    catch { return initialState; }
  });
  useEffect(() => localStorage.setItem(STORAGE, JSON.stringify(state)), [state]);
  const updateStory = (id: string, patch: Partial<Story>) =>
    setState(s => ({ ...s, stories: s.stories.map(x => x.id === id ? { ...x, ...patch } : x) }));
  const createStory = (story: Story) => setState(s => ({ ...s, stories: [story, ...s.stories] }));
  return { state, setState, updateStory, createStory };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const WHOP_PLAN_ID = 'plan_pkLxmpE0feqFB';
function previewParagraphCount(total: number) {
  return Math.max(1, Math.ceil(total / 2));
}
function useSubscription() {
  const { isSignedIn } = useUser();
  const { data } = useQuery({
    queryKey: ['subscription'],
    enabled: isSignedIn,
    queryFn: async () => {
      const res = await fetch('/api/subscription');
      if (!res.ok) return { subscribed: false };
      return res.json() as Promise<{ subscribed: boolean }>;
    },
  });
  return data?.subscribed ?? false;
}
const nav = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/library', label: 'Bibliothèque', icon: Library },
  { href: '/series', label: 'Aventures', icon: WandSparkles },
];

function LuneoMark({ size = 34 }: { size?: number }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <mask id={`lm-${uid}`}>
          <rect width="36" height="36" fill="white" />
          <circle cx="14" cy="12" r="11" fill="black" />
        </mask>
      </defs>
      {/* Dark navy rounded square background */}
      <rect width="36" height="36" rx="9" fill="#1E3A8A" />
      {/* Yellow crescent */}
      <circle cx="19" cy="18" r="14" fill="#F6C453" mask={`url(#lm-${uid})`} />
      {/* Tiny star dot */}
      <circle cx="31" cy="8" r="1.6" fill="#F6C453" opacity="0.6" />
    </svg>
  );
}

function LuneoMarkLight({ size = 34 }: { size?: number }) {
  return <LuneoMark size={size} />;
}

function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="brand" data-testid="link-logo">
      {light ? <LuneoMarkLight /> : <LuneoMark />}
      <span className="brand-name">luneo</span>
    </Link>
  );
}

// ─── Auth guard ──────────────────────────────────────────────────────────────
function Protected({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Show when="signed-in">{children}</Show>
      <Show when="signed-out"><Redirect to="/sign-in" /></Show>
    </>
  );
}

// ─── Landing page ─────────────────────────────────────────────────────────────
function LandingPage() {
  return (
    <div className="landing-shell" data-testid="page-landing">
      <header className="landing-header">
        <Logo />
        <nav className="landing-header-actions">
          <Link href="/sign-in" className="button-ghost" data-testid="button-landing-login">Se connecter</Link>
          <Link href="/sign-up" className="button-primary" data-testid="button-landing-signup">Créer une histoire</Link>
        </nav>
      </header>
      <section className="landing-hero">
        <div className="landing-hero-copy">
          <div className="eyebrow">Le rituel du soir, réinventé</div>
          <h1>Chaque soir, une histoire où votre enfant est le héros.</h1>
          <p>Luneo crée, en quelques secondes, une histoire unique pour votre enfant : son prénom, son âge, ses passions. Une nouvelle aventure à lire ensemble, chaque soir, pour un vrai moment de calme avant de dormir.</p>
          <div className="landing-hero-actions">
            <Link href="/sign-up" className="hero-button" data-testid="button-hero-create">
              <Plus size={18} />Créer une histoire pour mon enfant
            </Link>
            <Link href="/sign-in" className="text-link" data-testid="link-hero-login">
              J'ai déjà un compte <ChevronRight size={14} />
            </Link>
          </div>
        </div>
        <div className="landing-moon">
          <svg viewBox="0 0 230 250" fill="none" xmlns="http://www.w3.org/2000/svg" className="landing-moon-svg">
            <defs>
              <filter id="moon-glow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="9" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <mask id="moon-mask">
                <circle cx="115" cy="125" r="88" fill="white" />
                <circle cx="85" cy="112" r="78" fill="black" />
              </mask>
            </defs>
            {/* Halo rings */}
            <circle cx="115" cy="125" r="105" fill="rgba(246,196,83,0.05)" />
            <circle cx="115" cy="125" r="94" fill="rgba(246,196,83,0.07)" />
            {/* Crescent */}
            <circle cx="115" cy="125" r="88" fill="#F6C453" mask="url(#moon-mask)" filter="url(#moon-glow)" />
          </svg>
        </div>
      </section>
      <section className="landing-steps">
        <div className="landing-steps-head">
          <div className="eyebrow">Comment ça marche</div>
          <h2>Trois étapes vers le rituel du soir</h2>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-badge">1</div>
            <h3>Parlez-nous de votre enfant</h3>
            <p>Quelques informations suffisent pour que l'histoire soit vraiment la sienne :</p>
            <ul className="step-list">
              <li>Prénom de l'enfant</li>
              <li>Âge</li>
              <li>Ses passions</li>
              <li>Son compagnon — un animal qui lui ressemble (chien, chat, dragon…)</li>
            </ul>
          </div>
          <div className="step-card">
            <div className="step-badge">2</div>
            <h3>Laissez la magie opérer</h3>
            <p>En quelques secondes, Luneo imagine une histoire unique où votre enfant est le héros, adaptée à son âge et à la durée choisie — 5-10 minutes ou 10-15 minutes.</p>
          </div>
          <div className="step-card">
            <div className="step-badge">3</div>
            <h3>Savourez le moment ensemble</h3>
            <p>Lisez l'histoire à voix haute, blottis l'un contre l'autre — et retrouvez une nouvelle aventure prête chaque soir.</p>
          </div>
        </div>
      </section>
      <section className="landing-pricing">
        <div className="landing-pricing-head">
          <div className="eyebrow">Tarifs</div>
          <h2>Un abonnement pour chaque famille</h2>
        </div>
        <div className="pricing-grid">
          <div className="price-card">
            <div className="price-name">Gratuit</div>
            <div className="price-amount">0€ <span>/ toujours</span></div>
            <p className="price-tagline">Pour découvrir Luneo, sans engagement.</p>
            <ul className="price-features">
              <li>Génération d'histoires illimitée</li>
              <li>Aperçu de chaque histoire</li>
              <li>1 profil enfant</li>
            </ul>
            <Link href="/sign-up" className="price-cta" data-testid="button-pricing-free">Commencer gratuitement</Link>
          </div>
          <div className="price-card featured">
            <span className="price-badge">Le plus populaire</span>
            <div className="price-name">Basique</div>
            <div className="price-amount">4,99€ <span>/ mois</span></div>
            <p className="price-tagline">Histoires complètes, à volonté.</p>
            <ul className="price-features">
              <li>Histoires complètes et illimitées</li>
              <li>1 profil enfant</li>
              <li>Durée 5-10 ou 10-15 minutes</li>
              <li>Sans engagement, résiliable à tout moment</li>
            </ul>
            <Link href="/sign-up" className="price-cta" data-testid="button-pricing-basic">Choisir Basique</Link>
          </div>
          <div className="price-card">
            <div className="price-name">Familiale</div>
            <div className="price-amount">7,99€ <span>/ mois</span></div>
            <p className="price-tagline">Pour toute la fratrie.</p>
            <ul className="price-features">
              <li>Tout Basique inclus</li>
              <li>Jusqu'à 4 profils enfants</li>
              <li>Idéal pour les familles nombreuses</li>
            </ul>
            <span className="price-cta price-cta-soon" data-testid="button-pricing-family">Bientôt disponible</span>
          </div>
        </div>
      </section>
      <section className="landing-faq">
        <div className="landing-faq-head">
          <div className="eyebrow">Questions fréquentes</div>
          <h2>Tout ce qu'il faut savoir</h2>
        </div>
        <div className="faq-list">
          <details className="faq-item" open>
            <summary>Puis-je annuler à tout moment ?</summary>
            <p>Oui, sans engagement. Vous pouvez résilier votre abonnement en un clic depuis votre compte, à tout moment.</p>
          </details>
          <details className="faq-item">
            <summary>Les histoires sont-elles adaptées à l'âge de mon enfant ?</summary>
            <p>Oui, chaque histoire est générée en fonction de l'âge indiqué : vocabulaire, thèmes et longueur s'ajustent automatiquement.</p>
          </details>
          <details className="faq-item">
            <summary>Que faites-vous des informations de mon enfant ?</summary>
            <p>Elles servent uniquement à personnaliser les histoires (prénom, âge, passions). Elles ne sont jamais partagées ni revendues.</p>
          </details>
          <details className="faq-item">
            <summary>Puis-je changer d'abonnement plus tard ?</summary>
            <p>Bien sûr, vous pouvez passer de Basique à Familiale (ou inversement) à tout moment depuis votre compte.</p>
          </details>
        </div>
      </section>
      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} Luneo</p>
        <Link href="/legal" className="text-link">Mentions légales &amp; CGV</Link>
      </footer>
    </div>
  );
}

// ─── App Shell ───────────────────────────────────────────────────────────────
function Shell({ luneo, children }: { luneo: ReturnType<typeof useLuneo>; children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();
  const active = (href: string) => href === '/' ? location === '/' : location.startsWith(href);
  const child = luneo.state.child;
  const initial = (child.name || user?.firstName || '?').charAt(0).toUpperCase();
  const doLogout = () => signOut({ redirectUrl: basePath || '/' });

  return (
    <div className="luneo-app app-shell">
      <aside className="sidebar">
        <Logo light />
        <div className="nav-label">Le rituel du soir</div>
        <nav className="nav-list">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`nav-item ${active(href) ? 'active' : ''}`} data-testid={`link-nav-${label}`}>
              <Icon size={17} />{label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        <nav className="nav-list">
          <Link href="/child" className={`nav-item ${active('/child') ? 'active' : ''}`} data-testid="link-nav-child">
            <UserRound size={17} />Profil de {child.name || 'l\'enfant'}
          </Link>
          <Link href="/settings" className={`nav-item ${active('/settings') ? 'active' : ''}`} data-testid="link-nav-settings">
            <Settings size={17} />Réglages
          </Link>
          <button className="nav-item nav-item-button" onClick={doLogout} data-testid="button-nav-logout">
            <LogOut size={17} />Se déconnecter
          </button>
        </nav>
        <div className="profile-chip">
          <span className="avatar">{initial}</span>
          <span>
            <b>{child.name || user?.firstName || 'Votre enfant'}</b><br />
            <small>{child.age} ans · explorateur</small>
          </span>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <Link href="/" className="mobile-brand" data-testid="link-mobile-logo">
            <LuneoMark size={28} />luneo
          </Link>
          <div className="top-actions">
            <Link href="/settings" className="icon-button" data-testid="button-top-settings"><Settings size={17} /></Link>
            <button className="icon-button" onClick={doLogout} data-testid="button-top-logout"><LogOut size={17} /></button>
          </div>
        </header>
        {children}
        <nav className="mobile-nav">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={active(href) ? 'active' : ''} data-testid={`link-mobile-${label}`}>
              <Icon size={19} />{label}
            </Link>
          ))}
          <Link href="/child" className={active('/child') ? 'active' : ''} data-testid="link-mobile-child">
            <UserRound size={19} />Profil
          </Link>
          <Link href="/settings" className={active('/settings') ? 'active' : ''} data-testid="link-mobile-settings">
            <Settings size={19} />Réglages
          </Link>
        </nav>
      </main>
    </div>
  );
}

// ─── Story components ─────────────────────────────────────────────────────────
function StoryVisual({ story }: { story: Story }) {
  return (
    <div className={`story-visual ${story.visual}`}>
      <span className="visual-shape large" />
      <span className="visual-shape small" />
      <span className="visual-title">{story.title}</span>
      <span className="star one">✦</span>
    </div>
  );
}

function StoryCard({ story, onFavorite }: { story: Story; onFavorite: () => void }) {
  return (
    <article className="story-card" data-testid={`card-story-${story.id}`}>
      <StoryVisual story={story} />
      <div className="story-body">
        <div className="story-meta"><span>{story.category}</span><span><Clock3 size={12} /> {story.length}</span></div>
        <h3 className="story-card-title">{story.title}</h3>
        <div className="story-actions">
          <Link className="read-button" href={`/story/${story.id}`} data-testid={`link-read-${story.id}`}>Lire l'histoire <ChevronRight size={14} /></Link>
          <button className={`favorite-button ${story.favorite ? 'is-favorite' : ''}`} onClick={onFavorite} data-testid={`button-favorite-${story.id}`}>
            <Heart size={19} fill={story.favorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </article>
  );
}

function SectionHead({ title, link, href }: { title: string; link?: string; href?: string }) {
  return (
    <div className="section-head">
      <h2 className="section-title">{title}</h2>
      {link && href && <Link href={href} className="text-link" data-testid={`link-section-${title}`}>{link}<ChevronRight size={14} /></Link>}
    </div>
  );
}

// ─── Pages ────────────────────────────────────────────────────────────────────
function HomePage({ luneo }: { luneo: ReturnType<typeof useLuneo> }) {
  const { state, updateStory } = luneo;
  const recent = state.stories.slice(0, 3);
  const favorites = state.stories.filter(s => s.favorite).slice(0, 2);
  const now = new Date();
  const dateLabel = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const timeLabel = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="page" data-testid="page-dashboard">
      <div className="dashboard-hero">
        <div className="hero-copy">
          <div className="eyebrow">{dateLabel} · {timeLabel}</div>
          <h1 className="hero-title">Bonsoir{state.child.name ? `, la famille de ${state.child.name}` : ''}.</h1>
          <p className="hero-subtitle">Quelle aventure allons-nous vivre ce soir ? Une histoire douce, pensée juste pour {state.child.name || 'votre enfant'}.</p>
          <Link href="/create" className="hero-button" data-testid="button-create-story"><Plus size={18} />Créer une histoire</Link>
        </div>
        <div className="moon-scene"><span className="star one">✦</span><span className="star two">✦</span></div>
      </div>
      <SectionHead title="Histoires récentes" link="Tout voir" href="/library" />
      {recent.length > 0 ? (
        <div className="dashboard-grid">
          <div className="library-grid">
            {recent.map(s => <StoryCard key={s.id} story={s} onFavorite={() => updateStory(s.id, { favorite: !s.favorite })} />)}
          </div>
          <div>
            <SectionHead title="Favoris" link="Voir tout" href="/library" />
            <div className="favorite-list">
              {favorites.map(s => <StoryCard key={s.id} story={s} onFavorite={() => updateStory(s.id, { favorite: !s.favorite })} />)}
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-state" data-testid="empty-home-stories">
          <div className="empty-icon"><Sparkles size={20} /></div>
          <h3>Pas encore d'histoire</h3>
          <p>Créez la toute première aventure de {state.child.name || 'votre enfant'}, en quelques secondes.</p>
          <Link href="/create" className="button-primary" data-testid="button-empty-create-home">Créer une histoire</Link>
        </div>
      )}
    </div>
  );
}

function LibraryPage({ luneo }: { luneo: ReturnType<typeof useLuneo> }) {
  const { state, updateStory } = luneo;
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Toutes');
  const visible = state.stories
    .filter(s => filter === 'Toutes' ? true : filter === 'Favoris' ? s.favorite : s.category === filter)
    .filter(s => `${s.title} ${s.theme}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="page">
      <div className="eyebrow">La bibliothèque de {state.child.name || 'votre enfant'}</div>
      <h1 className="page-title">Toutes ses histoires</h1>
      <p className="page-intro">Les aventures inventées pour les soirs pressés, les grands câlins et les petits voyages imaginaires.</p>
      <div className="toolbar">
        <label className="search-box">
          <Search size={17} />
          <input data-testid="input-library-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher une histoire…" />
        </label>
        <div className="filter-row">
          {['Toutes', 'Favoris', 'Divertissement', 'Émotions & apprentissage'].map(x => (
            <button key={x} className={`filter ${filter === x ? 'active' : ''}`} onClick={() => setFilter(x)} data-testid={`button-filter-${x}`}>{x}</button>
          ))}
        </div>
      </div>
      <div className="library-grid">
        {visible.map(s => <StoryCard key={s.id} story={s} onFavorite={() => updateStory(s.id, { favorite: !s.favorite })} />)}
      </div>
      {visible.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon"><Search size={20} /></div>
          <h3>Aucune histoire trouvée</h3>
          <p>Essayez un autre mot ou créez une histoire rien que pour {state.child.name || 'votre enfant'}.</p>
          <Link href="/create" className="button-primary" data-testid="button-empty-create">Créer une histoire</Link>
        </div>
      )}
    </div>
  );
}

function SeriesPage() {
  return (
    <div className="page">
      <div className="eyebrow">Le fil des aventures</div>
      <h1 className="page-title">Les séries</h1>
      <div className="empty-state" data-testid="empty-series">
        <div className="empty-icon"><WandSparkles size={20} /></div>
        <h3>Bientôt disponible</h3>
        <p>Les histoires en plusieurs épisodes, à suivre soir après soir, arrivent prochainement.</p>
        <Link href="/create" className="button-primary" data-testid="button-series-create">Créer une histoire</Link>
      </div>
    </div>
  );
}

function StoryPage({ luneo }: { luneo: ReturnType<typeof useLuneo> }) {
  const { id } = useParams<{ id: string }>();
  const subscribed = useSubscription();
  const story = luneo.state.stories.find(s => s.id === id) || luneo.state.stories[0];
  if (!story) return (
    <div className="page">
      <h1 className="page-title">Aucune histoire pour l'instant</h1>
      <Link href="/create" className="button-primary" data-testid="link-story-empty-create">Créer une histoire</Link>
    </div>
  );
  const paragraphs = subscribed ? story.paragraphs : story.paragraphs.slice(0, previewParagraphCount(story.paragraphs.length));
  return (
    <div className="page book-layout">
      <div className="book-head">
        <Link href="/" className="text-link" data-testid="link-back-home"><ChevronLeft size={17} />Retour</Link>
        <button className={`favorite-button ${story.favorite ? 'is-favorite' : ''}`} onClick={() => luneo.updateStory(story.id, { favorite: !story.favorite })} data-testid="button-story-favorite">
          <Heart size={21} fill={story.favorite ? 'currentColor' : 'none'} /> {story.favorite ? 'Dans les favoris' : 'Ajouter aux favoris'}
        </button>
      </div>
      <div className="book-meta">{story.seriesId ? `Épisode ${story.episode}` : story.category} · {story.length}</div>
      <h1 className="book-title">{story.title}</h1>
      <div className="book-illustration" />
      <div className="book-page">
        <div className="story-content">
          {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </div>
        {!subscribed && <div className="finish-line">Aperçu — abonne-toi pour lire la suite</div>}
      </div>
      {!subscribed && (
        <div className="result-actions">
          <Link href="/subscribe" className="button-primary" data-testid="button-story-continue-paywall">
            <WandSparkles size={16} />Lire la suite
          </Link>
        </div>
      )}
    </div>
  );
}

function SubscribePage() {
  return (
    <div className="page wizard">
      <div className="eyebrow">Débloquer Lunéo</div>
      <h1 className="page-title">S'abonner</h1>
      <p className="page-intro">Accès illimité à la création d'histoires personnalisées pour votre enfant.</p>
      <div className="wizard-card" style={{ padding: 0, overflow: 'hidden' }}>
        <WhopCheckoutEmbed planId={WHOP_PLAN_ID} theme="light" returnUrl={`${window.location.origin}/`} />
      </div>
    </div>
  );
}

type CreateForm = { category: Category; theme: string; length: string; idea: string; mode: string };

function CreatePage({ luneo }: { luneo: ReturnType<typeof useLuneo> }) {
  const subscribed = useSubscription();
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<Story | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateForm>({ category: 'Divertissement', theme: 'Aventure', length: '5-10 minutes', idea: '', mode: 'new' });
  const set = (p: Partial<CreateForm>) => setForm(f => ({ ...f, ...p }));
  const next = async () => {
    if (step < 4) { setStep(s => s + 1); return; }
    setGenerating(true); setError(null);
    try {
      const res = await fetch('/api/stories/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childName: luneo.state.child.name || 'Votre enfant', childAge: luneo.state.child.age, category: form.category, theme: form.theme, length: form.length, idea: form.idea || undefined, interests: luneo.state.child.interests }),
      });
      if (!res.ok) throw new Error('generation_failed');
      const data = await res.json() as { title: string; paragraphs: string[] };
      const id = `story-${Date.now()}`;
      const visuals = ['visual-night', 'visual-ocean', 'visual-amber', 'visual-lilac'];
      const story: Story = { id, title: data.title, category: form.category, theme: form.theme, length: form.length, createdAt: 'À l\'instant', favorite: false, finished: false, visual: visuals[Math.floor(Math.random() * visuals.length)], paragraphs: data.paragraphs };
      luneo.createStory(story);
      setResult(story);
    } catch {
      setError('La génération a échoué. Réessayez dans un instant.');
    } finally {
      setGenerating(false);
    }
  };

  if (generating) return (
    <div className="page wizard">
      <div className="wizard-card generate-card">
        <div className="orbit" />
        <h2>L'histoire prend vie…</h2>
        <p>Nous préparons un voyage rien que pour {luneo.state.child.name || 'votre enfant'}.</p>
      </div>
    </div>
  );
  if (error) return (
    <div className="page wizard">
      <div className="wizard-card generate-card">
        <h2>Oups…</h2><p>{error}</p>
        <button className="button-primary" onClick={() => setError(null)} data-testid="button-generation-retry">Réessayer</button>
      </div>
    </div>
  );
  if (result) return (
    <div className="page wizard">
      <div className="result-card">
        <div className="result-banner">
          <div className="eyebrow">Une nouvelle histoire pour {luneo.state.child.name || 'votre enfant'}</div>
          <h2>{result.title}</h2>
        </div>
        <div className="story-content">{(subscribed ? result.paragraphs : result.paragraphs.slice(0, previewParagraphCount(result.paragraphs.length))).map((p, i) => <p key={i}>{p}</p>)}</div>
        <div className="result-actions">
          {!subscribed && <Link href="/subscribe" className="button-primary" data-testid="button-continue-story-paywall"><BookOpen size={16} />Continuer l'histoire</Link>}
          <Link href="/create" className="button-ghost" data-testid="button-create-another">Créer une autre</Link>
        </div>
      </div>
    </div>
  );

  const labels = ['Départ', 'Ambiance', 'Pour qui', 'Derniers détails'];
  return (
    <div className="page wizard">
      <div className="eyebrow">La fabrique à histoires</div>
      <h1 className="page-title">Créer une histoire</h1>
      <div className="wizard-steps">
        {labels.map((l, i) => (
          <div className={`step ${step >= i + 1 ? 'active' : ''}`} key={l}>
            <span className="step-dot">{i + 1}</span>{l}
          </div>
        ))}
      </div>
      <div className="wizard-card">
        {step === 1 && (
          <>
            <h2>Quel genre d'aventure ?</h2>
            <p>Choisissez l'humeur de ce soir.</p>
            <div className="choice-grid">
              {([['Divertissement', 'Une grande aventure pleine de merveilles', Sparkles], ['Émotions & apprentissage', `Mettre des mots sur ce qui traverse ${luneo.state.child.name || 'votre enfant'}`, CircleHelp]] as const).map(([name, desc, Icon]) => (
                <button key={name} className={`choice ${form.category === name ? 'selected' : ''}`} onClick={() => set({ category: name as Category })} data-testid={`button-category-${name}`}>
                  <span className="choice-icon"><Icon size={17} /></span>
                  <span><strong>{name}</strong><small>{desc}</small></span>
                </button>
              ))}
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <h2>Quel sera le thème ?</h2>
            <p>Un fil rouge pour laisser l'imagination s'envoler.</p>
            <div className="tag-grid">
              {themes.map(t => <button className={`tag ${form.theme === t ? 'selected' : ''}`} key={t} onClick={() => set({ theme: t })} data-testid={`button-theme-${t}`}>{t}</button>)}
            </div>
            <div className="field" style={{ marginTop: 28 }}>
              <label className="field-label">Une idée en tête ? <span style={{ fontWeight: 400 }}>(facultatif)</span></label>
              <textarea className="text-area" value={form.idea} onChange={e => set({ idea: e.target.value })} placeholder="Un volcan qui chante, une cabane dans les nuages…" data-testid="input-custom-idea" />
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <h2>Pour qui raconte-t-on ?</h2>
            <p>Chaque détail rend le voyage plus personnel.</p>
            <div className="choice-grid">
              <button className="choice selected" data-testid="button-child-selected">
                <span className="avatar">{(luneo.state.child.name || '?').charAt(0).toUpperCase()}</span>
                <span>
                  <strong>{luneo.state.child.name || 'Votre enfant'}{luneo.state.child.name ? `, ${luneo.state.child.age} ans` : ''}</strong>
                  <small>{luneo.state.child.interests.join(' · ') || 'Complétez son profil pour des histoires encore plus personnalisées'}</small>
                </span>
              </button>
              <Link href="/child" className="choice" data-testid="link-add-child">
                <span className="choice-icon"><Plus size={17} /></span>
                <span><strong>Modifier le profil</strong><small>Prénom, âge, goûts</small></span>
              </Link>
            </div>
          </>
        )}
        {step === 4 && (
          <>
            <h2>Combien de temps ce soir ?</h2>
            <p>Une histoire peut être courte et laisser de grands souvenirs.</p>
            <div className="choice-grid">
              {['5-10 minutes', '10-15 minutes'].map(x => (
                <button className={`choice ${form.length === x ? 'selected' : ''}`} key={x} onClick={() => set({ length: x })} data-testid={`button-length-${x}`}>
                  <span className="choice-icon"><Clock3 size={17} /></span>
                  <span><strong>{x}</strong></span>
                </button>
              ))}
            </div>
            <div className="field" style={{ marginTop: 24 }}>
              <label className="field-label">Nouvelle aventure ou suite ?</label>
              <select className="select-input" value={form.mode} onChange={e => set({ mode: e.target.value })} data-testid="select-adventure-mode">
                <option value="new">Commencer une nouvelle aventure</option>
                <option value="continue">Continuer une série existante</option>
              </select>
            </div>
          </>
        )}
        <div className="wizard-footer">
          {step > 1
            ? <button className="button-ghost" onClick={() => setStep(s => s - 1)} data-testid="button-wizard-back"><ChevronLeft size={16} />Retour</button>
            : <span />
          }
          <button className="button-primary" onClick={next} data-testid="button-wizard-next">
            {step === 4 ? 'Créer l\'histoire' : 'Continuer'}<ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ChildPage({ luneo }: { luneo: ReturnType<typeof useLuneo> }) {
  const { state, setState } = luneo;
  const [draft, setDraft] = useState(state.child);
  const toggle = (key: 'interests' | 'preferences', value: string) =>
    setDraft(d => ({ ...d, [key]: d[key].includes(value) ? d[key].filter(x => x !== value) : [...d[key], value] }));
  return (
    <div className="page">
      <div className="eyebrow">Un profil, une voix</div>
      <h1 className="page-title">Le profil de {draft.name || 'votre enfant'}</h1>
      <div className="profile-layout">
        <div className="profile-card">
          <div className="profile-avatar">{draft.name.charAt(0).toUpperCase() || '?'}</div>
          <h2>{draft.name || 'Votre enfant'}</h2>
          <p>{draft.age} ans · petit explorateur</p>
        </div>
        <div className="profile-form">
          <h3>Ses repères pour les histoires</h3>
          <div className="form-grid">
            <div className="field"><label className="field-label">Prénom</label><input className="text-input" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} data-testid="input-child-name" /></div>
            <div className="field"><label className="field-label">Âge</label><input className="text-input" type="number" value={draft.age} onChange={e => setDraft({ ...draft, age: Number(e.target.value) })} data-testid="input-child-age" /></div>
          </div>
          <div className="field">
            <label className="field-label">Ce qu'il aime</label>
            <div className="tag-grid">{interestOptions.map(x => <button className={`tag ${draft.interests.includes(x) ? 'selected' : ''}`} key={x} onClick={() => toggle('interests', x)} data-testid={`button-interest-${x}`}>{x}</button>)}</div>
          </div>
          <div className="field">
            <label className="field-label">Ses thèmes favoris</label>
            <div className="tag-grid">{preferenceOptions.map(x => <button className={`tag ${draft.preferences.includes(x) ? 'selected' : ''}`} key={x} onClick={() => toggle('preferences', x)} data-testid={`button-preference-${x}`}>{x}</button>)}</div>
          </div>
          <div className="field"><label className="field-label">Fratrie</label><input className="text-input" value={draft.siblings} onChange={e => setDraft({ ...draft, siblings: e.target.value })} data-testid="input-child-siblings" /></div>
          <div className="field">
            <label className="field-label">Rituel préféré</label>
            <select className="select-input" value={draft.reading} onChange={e => setDraft({ ...draft, reading: e.target.value })} data-testid="select-reading-preference">
              <option>Avec un parent, avant le coucher</option>
              <option>Après le dîner</option>
              <option>Le week-end, sous la couette</option>
            </select>
          </div>
          <button
            className="button-primary"
            onClick={() => {
              setState(s => ({ ...s, child: draft }));
              window.history.back();
            }}
            data-testid="button-save-child"
          >
            <Check size={16} />Enregistrer le profil
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsPage({ luneo }: { luneo: ReturnType<typeof useLuneo> }) {
  const { state, setState } = luneo;
  const { signOut } = useClerk();
  const set = (key: 'reminders' | 'calm') => setState(s => ({ ...s, settings: { ...s.settings, [key]: !s.settings[key] } }));
  return (
    <div className="page">
      <div className="eyebrow">Les petits réglages</div>
      <h1 className="page-title">Réglages</h1>
      <p className="page-intro">Luneo reste simple : quelques préférences pour protéger le calme du soir.</p>
      <div className="settings-list" style={{ marginTop: 28 }}>
        <div className="settings-card">
          <div><h3>Rappel du rituel</h3><p>Recevoir un rappel doux à l'heure des histoires.</p></div>
          <button className={`switch ${state.settings.reminders ? 'on' : ''}`} onClick={() => set('reminders')} data-testid="switch-reminders"><span /></button>
        </div>
        <div className="settings-card">
          <div><h3>Ambiance apaisée</h3><p>Favoriser les histoires courtes et les thèmes doux le soir.</p></div>
          <button className={`switch ${state.settings.calm ? 'on' : ''}`} onClick={() => set('calm')} data-testid="switch-calm"><span /></button>
        </div>
        <Link href="/child" className="settings-card" data-testid="link-settings-child">
          <div><h3>Profil de l'enfant</h3><p>Modifier les goûts et les habitudes de lecture de {state.child.name || 'votre enfant'}.</p></div>
          <ChevronRight size={19} color="#1e3a8a" />
        </Link>
        <button className="settings-card settings-card-button" onClick={() => signOut({ redirectUrl: basePath || '/' })} data-testid="button-settings-logout">
          <div><h3>Se déconnecter</h3><p>Quitter ce compte sur cet appareil.</p></div>
          <LogOut size={19} color="#1e3a8a" />
        </button>
      </div>
    </div>
  );
}

// ─── Sign-in / Sign-up pages ──────────────────────────────────────────────────
function SignInPage() {
  return (
    <div className="clerk-page">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="clerk-page">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
      <p className="legal-consent">
        En créant un compte, vous acceptez nos <Link href="/legal#cgv">CGV</Link> et notre <Link href="/legal#confidentialite">politique de confidentialité</Link>.
      </p>
    </div>
  );
}

// ─── Legal page ───────────────────────────────────────────────────────────────
function LegalPage() {
  return (
    <div className="page legal-page">
      <h1 className="page-title">Mentions légales &amp; confidentialité</h1>
      <p className="page-intro">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}.</p>

      <section id="mentions">
        <h2>Mentions légales</h2>
        <p>Le site Luneo est édité par Nathan [Nom de famille], entrepreneur individuel (micro-entreprise en cours d'immatriculation), basé à Rennes, France. Directeur de la publication : Nathan [Nom de famille]. Contact : nathan.cht13@gmail.com.</p>
        <p>Hébergement de l'application : Replit, Inc. (replit.com).</p>
      </section>

      <section id="cgv">
        <h2>Conditions générales de vente</h2>
        <p>Luneo propose la génération d'histoires personnalisées pour enfants, sous forme d'abonnement mensuel sans engagement (offres Basique et Familiale) ou d'un accès gratuit limité. Les tarifs en vigueur sont indiqués sur la page d'accueil, toutes taxes comprises.</p>
        <p>L'abonnement est facturé mensuellement via notre prestataire de paiement (Whop) et peut être résilié à tout moment depuis votre compte ; la résiliation prend effet à la fin de la période déjà payée.</p>
        <p>Conformément à l'article L221-28 du Code de la consommation, l'accès étant fourni immédiatement après paiement, le client reconnaît renoncer à son droit de rétractation pour le contenu déjà généré.</p>
        <p>En cas de litige, une solution amiable sera recherchée avant toute action judiciaire ; à défaut, les tribunaux français seront compétents.</p>
      </section>

      <section id="confidentialite">
        <h2>Politique de confidentialité</h2>
        <p>Nous collectons l'adresse email du compte (gestion de la connexion et de l'abonnement) ainsi que les informations que vous renseignez sur votre enfant (prénom, âge, centres d'intérêt) dans le seul but de personnaliser les histoires générées. Ces informations sont fournies par vous, en tant que parent ou tuteur légal, et ne sont jamais vendues ni partagées avec des tiers à des fins commerciales.</p>
        <p>Les données sont conservées tant que votre compte est actif, et supprimées sur simple demande à nathan.cht13@gmail.com. Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données à tout moment.</p>
        <p>Le site utilise uniquement les cookies techniques nécessaires au fonctionnement du compte et du paiement.</p>
      </section>
    </div>
  );
}

// ─── Cache invalidator ────────────────────────────────────────────────────────
function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const unsub = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) qc.clear();
      prevUserIdRef.current = userId;
    });
    return unsub;
  }, [addListener, qc]);
  return null;
}

// ─── Router ───────────────────────────────────────────────────────────────────
function AppRoutes() {
  const luneo = useLuneo();
  return (
    <>
      <ClerkQueryClientCacheInvalidator />
      <Switch>
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
        <Route path="/legal" component={LegalPage} />
        <Route path="/create">
          <Protected><Shell luneo={luneo}><CreatePage luneo={luneo} /></Shell></Protected>
        </Route>
        <Route path="/subscribe">
          <Protected><Shell luneo={luneo}><SubscribePage /></Shell></Protected>
        </Route>
        <Route path="/library">
          <Protected><Shell luneo={luneo}><LibraryPage luneo={luneo} /></Shell></Protected>
        </Route>
        <Route path="/series/:id">
          <Protected><Shell luneo={luneo}><SeriesPage /></Shell></Protected>
        </Route>
        <Route path="/series">
          <Protected><Shell luneo={luneo}><SeriesPage /></Shell></Protected>
        </Route>
        <Route path="/story/:id">
          <Protected><Shell luneo={luneo}><StoryPage luneo={luneo} /></Shell></Protected>
        </Route>
        <Route path="/child">
          <Protected><Shell luneo={luneo}><ChildPage luneo={luneo} /></Shell></Protected>
        </Route>
        <Route path="/settings">
          <Protected><Shell luneo={luneo}><SettingsPage luneo={luneo} /></Shell></Protected>
        </Route>
        <Route path="/">
          <Show when="signed-in"><Shell luneo={luneo}><HomePage luneo={luneo} /></Shell></Show>
          <Show when="signed-out"><LandingPage /></Show>
        </Route>
        <Route>
          <Show when="signed-in"><Shell luneo={luneo}><div className="page"><h1 className="page-title">Cette page est introuvable</h1><Link href="/" className="button-primary">Retour à l'accueil</Link></div></Shell></Show>
          <Show when="signed-out"><Redirect to="/" /></Show>
        </Route>
      </Switch>
    </>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: { start: { title: 'Ravi de vous revoir', subtitle: 'Connectez-vous pour retrouver vos histoires.' } },
        signUp: { start: { title: 'Créer un compte Luneo', subtitle: 'Chaque soir, une histoire où votre enfant est le héros.' } },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <AppRoutes />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}
