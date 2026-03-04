import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

const TMDB_BASE = process.env.NEXT_PUBLIC_TMDB_BASE_URL ?? "https://api.themoviedb.org/3";
const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY ?? "";

interface TMDbMovie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  vote_average: number;
  vote_count: number;
  overview: string;
  popularity: number;
  media_type?: string;
}

interface TMDbPage {
  results: TMDbMovie[];
}

type RowRef = { tmdb_id: number | null; media_type: string | null };

// ── Genre pools ───────────────────────────────────────────────────────────────

const ALL_MOVIE_GENRES = [28, 12, 16, 35, 80, 99, 18, 10751, 14, 36, 27, 9648, 10749, 878, 53, 10752, 37];
const ALL_TV_GENRES   = [10759, 16, 35, 80, 18, 99, 10751, 27, 9648, 10765, 10768, 37];

// ── Helpers ───────────────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

async function fetchDiscoverPage(page: number, extraParams: Record<string, string> = {}): Promise<TMDbMovie[]> {
  try {
    const url = new URL(`${TMDB_BASE}/discover/movie`);
    url.searchParams.set("api_key", TMDB_KEY);
    url.searchParams.set("language", "fr-FR");
    url.searchParams.set("sort_by", "popularity.desc");
    url.searchParams.set("vote_count.gte", "100");
    url.searchParams.set("page", String(page));
    for (const [k, v] of Object.entries(extraParams)) {
      url.searchParams.set(k, v);
    }
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json() as TMDbPage;
    return (data.results ?? []).map((m) => ({ ...m, media_type: "movie" }));
  } catch {
    return [];
  }
}

async function fetchDiscoverTVPage(page: number, extraParams: Record<string, string> = {}): Promise<TMDbMovie[]> {
  try {
    const url = new URL(`${TMDB_BASE}/discover/tv`);
    url.searchParams.set("api_key", TMDB_KEY);
    url.searchParams.set("language", "fr-FR");
    url.searchParams.set("sort_by", "popularity.desc");
    url.searchParams.set("vote_count.gte", "100");
    url.searchParams.set("page", String(page));
    for (const [k, v] of Object.entries(extraParams)) {
      url.searchParams.set(k, v);
    }
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json() as TMDbPage;
    return (data.results ?? []).map((m) => ({ ...m, media_type: "tv" }));
  } catch {
    return [];
  }
}

async function fetchTasteProfile(userId: string): Promise<Record<string, number> | null> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("user_taste_profiles")
      .select("genre_scores")
      .eq("user_id", userId)
      .single();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((data as any)?.genre_scores as Record<string, number>) ?? null;
  } catch {
    return null;
  }
}

async function getExcludedIds(userId: string): Promise<Set<string>> {
  const supabase = createAdminClient();
  const excludedSet = new Set<string>();

  // Films déjà interagis (like, dislike, not_interested)
  const { data: interactions } = await supabase
    .from("interactions")
    .select("tmdb_id, media_type")
    .eq("user_id", userId);

  for (const row of ((interactions as RowRef[] | null) ?? [])) {
    if (row.tmdb_id && row.media_type) {
      excludedSet.add(`${row.tmdb_id}-${row.media_type}`);
    }
  }

  // Films de l'historique de visionnage
  try {
    const { data: watchHistory } = await supabase
      .from("watch_history")
      .select("tmdb_id, media_type")
      .eq("user_id", userId);

    for (const row of ((watchHistory as RowRef[] | null) ?? [])) {
      if (row.tmdb_id && row.media_type) {
        excludedSet.add(`${row.tmdb_id}-${row.media_type}`);
      }
    }
  } catch {
    // La table peut ne pas exister ou avoir une structure différente
  }

  // Imports externes (Letterboxd, Trakt, Netflix)
  try {
    const { data: ext } = await supabase
      .from("external_watch_history")
      .select("tmdb_id, media_type")
      .eq("user_id", userId);

    for (const row of ((ext as RowRef[] | null) ?? [])) {
      if (row.tmdb_id && row.media_type) {
        excludedSet.add(`${row.tmdb_id}-${row.media_type}`);
      }
    }
  } catch {
    // Idem — silencieux
  }

  // Films dans la liste "Suggestions" (swipés ➕) → ne doivent pas réapparaître
  try {
    const { data: suggListItems } = await supabase
      .from("list_items")
      .select("tmdb_id, media_type, list_id, lists!inner(user_id, name)")
      .eq("lists.user_id", userId)
      .eq("lists.name", "Suggestions");

    for (const row of ((suggListItems as RowRef[] | null) ?? [])) {
      if (row.tmdb_id && row.media_type) {
        excludedSet.add(`${row.tmdb_id}-${row.media_type}`);
      }
    }
  } catch {
    // Silencieux — la liste peut ne pas exister encore
  }

  return excludedSet;
}

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const { searchParams } = new URL(request.url);

  // IDs déjà vus côté client (session-wide) → à exclure
  const excludeParam = searchParams.get("exclude") ?? "";
  const clientExcludedSet = new Set<string>();
  if (excludeParam) {
    for (const key of excludeParam.split(",")) {
      if (key) clientExcludedSet.add(key.trim());
    }
  }

  // IDs déjà vus / swipés / dans l'historique → exclus du feed (DB)
  const [dbExcludedSet, genreScores] = await Promise.all([
    getExcludedIds(user.id),
    fetchTasteProfile(user.id),
  ]);

  // Fusionner les deux sets d'exclusion
  const excludedSet = new Set([...dbExcludedSet, ...clientExcludedSet]);

  // ── Calcul des genres d'affinité et d'exploration ─────────────────────────

  const scores = genreScores ?? {};
  const lovedGenres = Object.entries(scores)
    .filter(([, s]) => (s as number) > 0.3)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .map(([id]) => Number(id))
    .slice(0, 4);

  const knownGenreIds = new Set(Object.keys(scores).map(Number));
  const explorationMoviePool = ALL_MOVIE_GENRES.filter((g) => !knownGenreIds.has(g));
  const explorationTVPool = ALL_TV_GENRES.filter((g) => !knownGenreIds.has(g));
  const exploMovieGenres = shuffleArray(explorationMoviePool).slice(0, 2);
  const exploTVGenres = shuffleArray(explorationTVPool).slice(0, 2);

  // ── Fetch en parallèle (4 buckets) ───────────────────────────────────────

  const [affinityM, affinityTV, exploM, exploTV, trendingM, trendingTV, qualityM] = await Promise.all([
    lovedGenres.length > 0
      ? fetchDiscoverPage(1, { with_genres: lovedGenres.join("|") })
      : fetchDiscoverPage(1),
    lovedGenres.length > 0
      ? fetchDiscoverTVPage(1, { with_genres: lovedGenres.join("|") })
      : fetchDiscoverTVPage(1),
    exploMovieGenres.length > 0
      ? fetchDiscoverPage(1, { with_genres: exploMovieGenres.join("|"), sort_by: "vote_count.desc", "vote_count.gte": "200" })
      : [],
    exploTVGenres.length > 0
      ? fetchDiscoverTVPage(1, { with_genres: exploTVGenres.join("|") })
      : [],
    fetchDiscoverPage(Math.ceil(Math.random() * 3)),
    fetchDiscoverTVPage(Math.ceil(Math.random() * 3)),
    fetchDiscoverPage(1, { sort_by: "vote_average.desc", "vote_count.gte": "1000" }),
  ]);

  // ── Interleaving pondéré ──────────────────────────────────────────────────

  function pickN(pool: TMDbMovie[], n: number, seen: Set<number | string>): TMDbMovie[] {
    const result: TMDbMovie[] = [];
    for (const item of pool) {
      if (result.length >= n) break;
      const key = `${item.id}-${item.media_type ?? "movie"}`;
      if (!excludedSet.has(key) && !seen.has(item.id)) {
        result.push(item);
        seen.add(item.id);
      }
    }
    return result;
  }

  const dedupSeen = new Set<number | string>();

  const affinityPick = pickN(shuffleArray([...affinityM, ...affinityTV]), 9, dedupSeen);
  const explorePick  = pickN(shuffleArray([...exploM, ...exploTV]), 6, dedupSeen);
  const trendingPick = pickN(shuffleArray([...trendingM, ...trendingTV]), 6, dedupSeen);
  const qualityPick  = pickN(qualityM, 4, dedupSeen);

  const combined = [...affinityPick, ...explorePick, ...trendingPick, ...qualityPick];

  // Shuffle final pour casser la structure des buckets
  const cards = shuffleArray(combined).slice(0, 25);

  return NextResponse.json({ cards });
}
