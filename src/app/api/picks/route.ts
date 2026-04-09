
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  try {
    const sb = getSupabase();
    const { searchParams } = new URL(req.url);
    const league_id = searchParams.get('league_id');
    const week = searchParams.get('week');

    let query = sb.from('picks').select('*');
    if (league_id) query = query.eq('league_id', league_id);
    if (week) query = query.eq('week', parseInt(week));

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sb = getSupabase();
    const body = await req.json();
    const { league_id, week, game_id, city_picked, action, user_id } = body;

    if (!league_id || !week || !city_picked || !user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (action === 'change') {
      const { error } = await sb.from('picks').delete()
        .eq('user_id', user_id).eq('league_id', league_id)
        .eq('week', week).is('locked_at', null);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ data: { changed: true } });
    }

    if (action === 'lock') {
      const { data: game } = await sb.from('games')
        .select('kickoff_time').eq('id', game_id).single();
      if (!game) return NextResponse.json({ error: 'Game not found' }, { status: 404 });
      if (new Date(game.kickoff_time) <= new Date()) {
        return NextResponse.json({ error: 'Game has already started' }, { status: 400 });
      }
      const { data, error } = await sb.from('picks')
        .update({ locked_at: new Date().toISOString() })
        .eq('user_id', user_id).eq('league_id', league_id)
        .eq('week', week).is('locked_at', null)
        .select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ data });
    }

    // Stage pick
    const { data, error } = await sb.from('picks').upsert({
      user_id, league_id, week, game_id, city_picked, locked_at: null,
    }, { onConflict: 'user_id,league_id,week' }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}