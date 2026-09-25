import dotenv from 'dotenv';
import { createClient } from '@libsql/client';
import { Boss, RawBossDBData } from './interfaces';

// Ensure local `.env` is loaded before reading Turso credentials.
// Missing file is fine on Vercel, where env vars are injected.

dotenv.config();

export const db = createClient({
  url: process.env.TURSO_DB_URL!,
  authToken: process.env.TURSO_TOKEN!,
});

export const getRawData = async (): Promise<string> => {
  try {
    var data = '';
    const rawData: RawBossDBData = await getCurrentRawData();

    const now: Date = new Date();
    const yesterday: Date = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    if (rawData.created_at < yesterday.getTime()) {
      console.log('Raw data is older than 24 hours:', rawData.created_at);
      const newRawData = await getNewRawData();
      data = newRawData.json;
      await upsertRawData({ json: data, created_at: now.getTime() });
    } else if (rawData.created_at >= yesterday.getTime()) {
      console.log('Raw data is within the last 24 hours:', rawData.created_at);
      data = rawData.json;
    }
    return data;
  } catch (error) {
    console.error('Error fetching raw data:', error);
    return '';
  }
};

export const getCurrentRawData = async (): Promise<RawBossDBData> => {
  const result = await db.execute(
    'SELECT json, created_at FROM raw_gw2_boss_feed',
  );

  const rawData: RawBossDBData = {
    json: String(result.rows[0]?.json ?? ''),
    created_at: Number(result.rows[0]?.created_at ?? 0),
  };

  return rawData;
};

export const upsertRawData = async (rawData: RawBossDBData): Promise<void> => {
  await db.execute(
    'UPDATE raw_gw2_boss_feed set json = ?, created_at = ? WHERE id = 1',
    [rawData.json, rawData.created_at],
  );
};

export const getNewRawData = async (): Promise<RawBossDBData> => {
  const BOSS_URL =
    'https://wiki.guildwars2.com/index.php?title=Widget:Event_timer/data.json&action=raw';

  const response = await fetch(BOSS_URL, {
    method: 'GET',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'User-Agent': 'GW2-WorldBossTimer/1.0',
    },
  });

  const data = await response.text();
  const now: Date = new Date();

  const rawData: RawBossDBData = {
    json: String(data ?? ''),
    created_at: Number(now.getTime()),
  };

  return rawData;
};

export const parseBossSegments = async (bossSegments: any): Promise<Boss[]> => {
  return Object.entries(bossSegments).map(([id, segment]: [string, any]) => ({
    id: Number(id),
    name: segment?.name || '',
    description: segment?.link || '',
    chatlink: segment?.chatlink || '',
  }));
};
