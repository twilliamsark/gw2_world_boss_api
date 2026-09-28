import { getRawData, parseBossSegments } from '../shared/helper';
import {
  Boss,
  Encounter,
  BossEncounters,
  BossEncounter,
} from '../shared/interfaces';

export const getPOFDVBosses = async () => {
  try {
    const data = await getRawData();
    const combined: BossEncounters = await extractBossEncounters(data);

    return combined;
  } catch (error) {
    console.error('Error fetching GW-HWB Bosses:', error);
    return [];
  }
};

const extractBossEncounters = async (data: string): Promise<BossEncounters> => {
  const dynamicHash = JSON.parse(data);
  const wb = dynamicHash['events']['pof-dv'];
  const segments = wb['segments'];
  const bosses: Boss[] = await parseBossSegments(segments);
  const encounters: Encounter[] = wb['sequences']['pattern'];

  const bossEncounters: BossEncounter[] = encounters.map((encounter) => ({
    boss: bosses[Number(encounter.r)],
    duration: Number(encounter.d),
  }));

  return {
    totalMinutes: encounters.reduce(
      (sum, encounter) => sum + Number(encounter.d),
      0,
    ),
    encounters: bossEncounters,
  };
};
