// Utility functions for Palworld data operations
// Replicates Go backend business logic

import { Pal, PassiveSkill, PalSpecies, StoredPal, FirebaseData } from '@/types/palworld';

/**
 * Find a Pal by name (case-insensitive)
 * Replicates models.FindPal from Go backend
 */
export function findPal(pals: Pal[], palName: string): Pal | null {
  const pal = pals.find(p => p.name.toLowerCase() === palName.toLowerCase());
  return pal || null;
}

/**
 * Find a PassiveSkill by name (case-insensitive)
 * Replicates models.FindPassiveSkill from Go backend
 */
export function findPassiveSkill(passiveSkills: PassiveSkill[], skillName: string): PassiveSkill | null {
  const skill = passiveSkills.find(s => s.name.toLowerCase() === skillName.toLowerCase());
  return skill || null;
}

/**
 * Find a PalSpecies from stored pals by name (case-insensitive)
 * Replicates models.FindPalSpeciesFromStore from Go backend
 */
export function findPalSpeciesFromStore(palSpecies: PalSpecies[], palName: string): PalSpecies | null {
  const species = palSpecies.find(p => p.name.toLowerCase() === palName.toLowerCase());
  return species || null;
}

/**
 * Validate if a pal name exists in the paldex
 */
export function validatePalName(pals: Pal[], palName: string): boolean {
  return findPal(pals, palName) !== null;
}

/**
 * Validate if passive skills exist
 */
export function validatePassiveSkills(passiveSkills: PassiveSkill[], skillNames: string[]): { valid: boolean; invalidSkill?: string } {
  for (const skillName of skillNames) {
    if (!findPassiveSkill(passiveSkills, skillName)) {
      return { valid: false, invalidSkill: skillName };
    }
  }
  return { valid: true };
}

/**
 * Validate gender input
 */
export function validateGender(gender: string): boolean {
  return gender === 'm' || gender === 'f';
}

/**
 * Add a new pal to stored pals
 * Replicates datamanage.AddPal logic from Go backend
 */
export function addPalToStore(
  storedPals: PalSpecies[],
  palName: string,
  gender: string,
  passiveSkillNames: string[]
): PalSpecies[] {
  const updatedStoredPals = [...storedPals];
  const existingSpecies = findPalSpeciesFromStore(updatedStoredPals, palName);
  
  if (existingSpecies) {
    // Add to existing species
    const speciesIndex = updatedStoredPals.findIndex(p => p.name.toLowerCase() === palName.toLowerCase());
    if (speciesIndex !== -1) {
      const newId = updatedStoredPals[speciesIndex].storedPals.length + 1;
      updatedStoredPals[speciesIndex].storedPals.push({
        id: newId,
        gender,
        passiveSkills: passiveSkillNames
      });
    }
  } else {
    // Create new species
    updatedStoredPals.push({
      name: palName,
      storedPals: [{
        id: 1,
        gender,
        passiveSkills: passiveSkillNames
      }]
    });
  }
  
  return updatedStoredPals;
}

/**
 * Remove a pal from stored pals
 * Replicates datamanage.RemovePal logic from Go backend
 */
export function removePalFromStore(
  storedPals: PalSpecies[],
  palName: string,
  palId: number
): PalSpecies[] {
  const updatedStoredPals = [...storedPals];
  
  for (let i = 0; i < updatedStoredPals.length; i++) {
    const species = updatedStoredPals[i];
    if (species.name.toLowerCase() === palName.toLowerCase()) {
      // Find and remove the specific pal
      const palIndex = species.storedPals.findIndex(p => p.id === palId);
      if (palIndex !== -1) {
        // Remove the pal
        species.storedPals.splice(palIndex, 1);
        
        // Update IDs of remaining pals
        for (let j = palIndex; j < species.storedPals.length; j++) {
          species.storedPals[j].id = j + 1;
        }
        
        // If no pals left in species, remove the species
        if (species.storedPals.length === 0) {
          updatedStoredPals.splice(i, 1);
        }
        break;
      }
    }
  }
  
  return updatedStoredPals;
}

/**
 * Transform stored pals data to DTO format for API response
 * Replicates the /store endpoint logic from Go backend
 */
export function transformStoredPalsToDTO(
  storedPals: PalSpecies[],
  paldex: Pal[]
): any[] {
  const palDexMap = new Map<string, Pal>();
  paldex.forEach(pal => {
    if (pal && pal.name && typeof pal.name === 'string') {
      palDexMap.set(pal.name.toLowerCase(), pal);
    }
  });
  
  const result: any[] = [];
  
  storedPals.forEach(species => {
    // Handle both Firebase format and local format
    const speciesName = (species as any).Name || species.name;
    const palsArray = (species as any).StoredPals || species.storedPals || [];
    
    if (speciesName && typeof speciesName === 'string' && palsArray.length > 0) {
      palsArray.forEach((storedPal: any) => {
        if (storedPal && (storedPal.ID !== undefined || storedPal.id !== undefined)) {
          const palInfo = palDexMap.get(speciesName.toLowerCase());
          
          result.push({
            id: storedPal.ID || storedPal.id,
            name: speciesName,
            image_url: palInfo?.imageUrl || (palInfo as any)?.ImageUrl || '',
            gender: storedPal.Gender || storedPal.gender || 'Unknown',
            passive_skills: (storedPal.PassiveSkills || storedPal.passiveSkills || []).map((skill: any) => ({ name: skill }))
          });
        }
      });
    }
  });
  
  return result;
}

/**
 * Get passive skill names from data
 * Replicates options.GetPassiveSkills from Go backend
 */
export function getPassiveSkillNames(passiveSkills: PassiveSkill[]): string[] {
  return passiveSkills.map(skill => skill.name);
}

/**
 * Get pal species names from paldex
 * Replicates options.GetPalSpecies from Go backend
 */
export function getPalSpeciesNames(pals: Pal[]): string[] {
  return pals.map(pal => pal.name);
}

/**
 * Load Firebase data from Firebase Realtime Database
 * This function is deprecated - use Firebase service directly instead
 */
export async function loadFirebaseData(): Promise<FirebaseData> {
  console.warn('loadFirebaseData is deprecated. Use Firebase service directly for real-time data.');
  
  // Return empty structure as fallback
  return initializeFirebaseData();
}

/**
 * Initialize Firebase data structure
 */
export function initializeFirebaseData(): FirebaseData {
  return {
    pals: [],
    passive_skills: [],
    passive_skill_combos: [],
    stored_pals: []
  };
}