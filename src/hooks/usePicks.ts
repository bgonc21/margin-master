
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, getUser } from '../lib/supabase';

export interface Game {
  id: string;
  sport: string;
  season: number;
  week: number;
  home_city: string;
  away_city: string;
  home_score: number | null;
  away_score: number | null;
  margin: number | null;
  status: 'upcoming' | 'live' | 'final';
  kickoff_time: string;
  spread: number | null;
}

export interface Pick {
  id: string;
  user_id: string;
  league_id: string;
  week: number;
  game_id: string | null;
  city_picked: string;
  locked_at: string | null;
  points_earned: number | null;
  is_penalty: boolean;
  score_guess: number | null;
  secondary_game_id: string | null;
  secondary_city: string | null;
}

export interface WeeklyDesignatedGame {
  game_id: string;
  description: string;
}

export function usePicks(leagueId: string | null, week: number) {
  const [games, setGames] = useState<Game[]>([]);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [designatedGame, setDesignatedGame] = useState<WeeklyDesignatedGame | null>(null);
  const [usedCities, setUsedCities] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getUser().then(u => setUserId(u?.id ?? null));
  }, []);

  const fetchData = useCallback(async () => {
    if (!leagueId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const { data: gamesData, error: gamesErr } = await supabase
        .from('games')
        .select('*')
        .eq('sport', 'nfl')
        .eq('week', week)
        .order('kickoff_time', { ascending: true });

      if (gamesErr) throw gamesErr;
      setGames(gamesData ?? []);

      const picksRes = await fetch(`/api/picks?league_id=${leagueId}&week=${week}`);
      const picksData = await picksRes.json();
      setPicks(picksData.data ?? []);

      const { data: usedData } = await supabase
        .from('picks')
        .select('city_picked')
        .eq('league_id', leagueId)
        .not('locked_at', 'is', null)
        .eq('is_penalty', false);

      setUsedCities(new Set((usedData ?? []).map(p => p.city_picked)));

      const { data: dgData } = await supabase
        .from('weekly_designated_games')
        .select('game_id, description')
        .eq('week', week)
        .maybeSingle();

      setDesignatedGame(dgData ?? null);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [leagueId, week]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const currentPick = picks.find(p => p.week === week && !p.is_penalty) ?? null;

  async function stagePick(gameId: string, city: string) {
    const res = await fetch('/api/picks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        league_id: leagueId,
        week,
        game_id: gameId,
        city_picked: city,
        user_id: userId,
        action: 'stage',
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    await fetchData();
    return data.data;
  }

  async function lockPick(scoreGuess?: number, secondaryGameId?: string, secondaryCity?: string) {
    const res = await fetch('/api/picks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        league_id: leagueId,
        week,
        city_picked: currentPick?.city_picked,
        game_id: currentPick?.game_id,
        score_guess: scoreGuess,
        secondary_game_id: secondaryGameId,
        secondary_city: secondaryCity,
        user_id: userId,
        action: 'lock',
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    await fetchData();
    return data.data;
  }

  async function changePick() {
    const res = await fetch('/api/picks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        league_id: leagueId,
        week,
        city_picked: currentPick?.city_picked ?? '',
        user_id: userId,
        action: 'change',
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    await fetchData();
  }

  return {
    games,
    picks,
    currentPick,
    designatedGame,
    usedCities,
    loading,
    error,
    stagePick,
    lockPick,
    changePick,
    refresh: fetchData,
  };
}