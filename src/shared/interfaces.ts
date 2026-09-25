export interface RawBossDBData {
  json: string;
  created_at: number;
}

export interface Boss {
  id: number;
  name: string;
  description: string;
  chatlink: string;
}

export interface Encounter {
  r: number;
  d: number;
}

export interface BossEncounter {
  boss: Boss;
  duration: number;
}

export interface BossEncounters {
  totalMinutes: number;
  encounters: BossEncounter[];
}
