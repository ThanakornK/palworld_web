// TypeScript interfaces based on Go backend models

export interface Suitability {
  work: string;
  level: number;
}

export interface Child {
  parent: string;
  child: string;
}

export interface Pal {
  id: string;
  name: string;
  imageUrl: string;
  suitability: Suitability[];
  children: Child[];
}

export interface PassiveSkill {
  name: string;
  effect: string;
  tier: number;
}

export interface StoredPal {
  id: number;
  gender: string;
  passiveSkills: string[];
}

export interface PalSpecies {
  name: string;
  storedPals: StoredPal[];
}

export interface ComboPassiveSkill {
  name: string;
  skills: string[];
}

// DTO interfaces for API requests/responses
export interface AddPalRequest {
  name: string;
  gender: string;
  passive_skills: string[];
}

export interface RemovePalRequest {
  name: string;
  id: number;
}

export interface PalDTO {
  id: number;
  name: string;
  image_url: string;
  gender: string;
  passive_skills: PassiveSkillDTO[];
}

export interface PassiveSkillDTO {
  name: string;
}

// Firebase data structure
export interface FirebaseData {
  pals: Pal[];
  passive_skills: PassiveSkill[];
  passive_skill_combos: ComboPassiveSkill[];
  stored_pals: PalSpecies[];
}

// API Response types
export interface ApiResponse<T> {
  message: T;
}

export interface ApiError {
  error: string;
}