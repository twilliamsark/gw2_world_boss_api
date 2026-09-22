import { Request, Response } from 'express';
import { promises as fs } from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@libsql/client';

const envConfig = dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const db = createClient({
  url: process.env.TURSO_DB_URL!,
  authToken: process.env.TURSO_TOKEN!,
});

interface RawBossDBData {
  json: string;
  created_at: number;
}

interface Boss {
  id: number;
  name: string;
  description: string;
  chatlink: string;
}

interface BossSequence {
  r: number;
  d: number;
}

interface BossWithDuration {
  boss: Boss;
  duration: number;
}

interface CombinedBossSequence {
  encounters: BossWithDuration[];
}

interface BossProgression {
  bosses: Boss[];
}

const bosses: Boss[] = [
  {
    id: 1,
    name: 'Boss One',
    description: 'Description for Boss One',
    chatlink: 'chatlink1',
  },
  {
    id: 2,
    name: 'Boss Two',
    description: 'Description for Boss Two',
    chatlink: 'chatlink2',
  },
];

export const getBosses = (req: Request, res: Response) => {
  res.status(200).json(bosses);
};

export const getGWBosses = async () => {
  const BOSS_URL =
    'https://wiki.guildwars2.com/index.php?title=Widget:Event_timer/data.json&action=raw';
  try {
    // const response = await fetch(BOSS_URL, {
    //   method: 'GET',
    //   headers: {
    //     Accept: 'application/json, text/plain, */*',
    //     'User-Agent': 'GW2-WorldBossTimer/1.0',
    //   },
    // });
    // const data = await response.text();
    const now: Date = new Date();
    const nowAsString: string = now.toLocaleString();
    const yesterday: Date = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    var data: string = '';

    const rawData: RawBossDBData = await getCurrentRawData();

    if (rawData.created_at < yesterday.getTime()) {
      console.log('Raw data is older than 24 hours:', rawData.created_at);
      data = await fs.readFile('docs/data.json', 'utf-8');
      // const newRawData = await getNewRawData();
      // data = newRawData.json;
      upsertRawData({ json: data, created_at: now.getTime() });
    } else if (rawData.created_at >= yesterday.getTime()) {
      console.log('Raw data is within the last 24 hours:', rawData.created_at);
      data = rawData.json;
    }

    const dynamicHash = JSON.parse(data);
    const wb = dynamicHash['events']['core-wb']; // "john@example.com"

    const segments = wb['segments'];

    const bosses: Boss[] = Object.entries(segments).map(
      ([id, segment]: [string, any]) => ({
        id: Number(id),
        name: segment?.name,
        description: segment?.link,
        chatlink: segment?.chatlink,
      }),
    );

    const sequences: BossSequence[] = wb['sequences']['pattern'];

    const combined: CombinedBossSequence = {
      encounters: sequences.map((sequence) => ({
        boss: bosses[Number(sequence.r) - 1],
        duration: Number(sequence.d),
      })),
    };

    return combined;
  } catch (error) {
    console.error('Error fetching GW Bosses:', error);
    return [];
  }
};

const getCurrentRawData = async (): Promise<RawBossDBData> => {
  const data = await fs.readFile('docs/data.json', 'utf-8');

  const result = await db.execute(
    'SELECT json, created_at FROM raw_gw2_boss_feed',
  );

  const rawData: RawBossDBData = {
    json: String(result.rows[0]?.json ?? ''),
    created_at: Number(result.rows[0]?.created_at ?? 0),
  };

  return rawData;
};

const upsertRawData = async (rawData: RawBossDBData): Promise<void> => {
  await db.execute(
    'UPDATE raw_gw2_boss_feed set json = ?, created_at = ? WHERE id = 1',
    [rawData.json, rawData.created_at],
  );
};

const getNewRawData = async (): Promise<RawBossDBData> => {
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

const getBossProgression = (data: string): BossProgression => {
  const parsedData = JSON.parse(data);
  const bosses: Boss[] = parsedData.bosses.map((boss: any) => ({
    id: boss.id,
    name: boss.name,
    description: boss.description,
    chatlink: boss.chatlink,
  }));
  return { bosses };
};
