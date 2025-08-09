// Firebase Realtime Database service
// Handles all Firebase operations for Palworld data

import { 
  initializeFirebase, 
  getFirebaseDatabase, 
  isFirebaseInitialized,
  autoInitializeFirebase,
  FirebaseConfig as ImportedFirebaseConfig,
  FirebaseServices 
} from './firebase-config';
import { ref, set, get, push, remove, child } from 'firebase/database';
import { FirebaseData, PalSpecies, Pal, PassiveSkill, ComboPassiveSkill } from '@/types/palworld';

// Firebase configuration interface
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Firebase service class
export class FirebaseService {
  private static instance: FirebaseService;

  private constructor() {
    // Auto-initialize Firebase when service is created
    this.autoInitialize();
  }

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  /**
   * Auto-initialize Firebase with environment configuration
   */
  private autoInitialize(): void {
    try {
      const result = autoInitializeFirebase();
      if (result) {
        console.log('Firebase auto-initialized successfully');
      } else {
        console.warn('Firebase auto-initialization failed - environment variables may be missing');
      }
    } catch (error) {
      console.error('Firebase auto-initialization error:', error);
    }
  }

  /**
   * Initialize Firebase with configuration
   */
  public async initialize(config: ImportedFirebaseConfig): Promise<FirebaseServices> {
    try {
      const services = initializeFirebase(config);
      console.log('Firebase service initialized successfully');
      return services;
    } catch (error) {
      console.error('Failed to initialize Firebase service:', error);
      throw error;
    }
  }

  /**
   * Check if Firebase is initialized
   */
  public isInitialized(): boolean {
    return isFirebaseInitialized();
  }

  /**
   * Get database reference
   */
  private getDatabase() {
    return getFirebaseDatabase();
  }

  /**
   * Import initial data to Firebase
   */
  public async importData(data: FirebaseData): Promise<void> {
    if (!this.isInitialized()) {
      throw new Error('Firebase not initialized');
    }

    try {
      // Import pals data
      await this.setPals(data.pals);
      
      // Import passive skills
      await this.setPassiveSkills(data.passive_skills);
      
      // Import passive skill combos
      await this.setPassiveSkillCombos(data.passive_skill_combos);
      
      // Import stored pals
      await this.setStoredPals(data.stored_pals);
      
      console.log('Data imported to Firebase successfully');
    } catch (error) {
      console.error('Failed to import data to Firebase:', error);
      throw error;
    }
  }

  /**
   * Get all pals from Firebase
   */
  public async getPals(): Promise<Pal[]> {
    if (!this.isInitialized()) {
      throw new Error('Firebase not initialized');
    }

    try {
      const database = this.getDatabase();
      const palsRef = ref(database, 'pals');
      const snapshot = await get(palsRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const rawPals = Array.isArray(data) ? data : Object.values(data);
        
        // Convert Firebase data structure to match TypeScript interface
        const convertedPals = rawPals.map((pal: any) => ({
          id: pal.Id || pal.id || '',
          name: pal.Name || pal.name || '',
          imageUrl: pal.ImageUrl || pal.imageUrl || '',
          suitability: (pal.Suitability || pal.suitability || []).map((suit: any) => ({
            work: suit.Work || suit.work || '',
            level: suit.Level || suit.level || 0
          })),
          children: (pal.Children || pal.children || []).map((child: any) => ({
            parent: child.Parent || child.parent || '',
            child: child.Child || child.child || ''
          }))
        }));
        
        return convertedPals;
      }
      return [];
    } catch (error) {
      console.error('Failed to get pals from Firebase:', error);
      throw error;
    }
  }

  /**
   * Set pals data in Firebase
   */
  public async setPals(pals: Pal[]): Promise<void> {
    if (!this.isInitialized()) {
      throw new Error('Firebase not initialized');
    }

    try {
      const database = this.getDatabase();
      const palsRef = ref(database, 'pals');
      await set(palsRef, pals);
      console.log('Setting pals data in Firebase:', pals.length, 'pals');
    } catch (error) {
      console.error('Failed to set pals in Firebase:', error);
      throw error;
    }
  }

  /**
   * Get passive skills from Firebase
   */
  public async getPassiveSkills(): Promise<PassiveSkill[]> {
    if (!this.isInitialized()) {
      throw new Error('Firebase not initialized');
    }

    try {
      const database = this.getDatabase();
      const passiveSkillsRef = ref(database, 'passive_skills');
      const snapshot = await get(passiveSkillsRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        if (Array.isArray(data)) {
          // Convert Firebase property names to match TypeScript interface
          return data.map((skill: any) => ({
            name: skill.Name || skill.name,
            effect: skill.Effect || skill.effect,
            tier: skill.Tier || skill.tier
          }));
        } else {
          // Convert object to array and fix property names
          return Object.values(data).map((skill: any) => ({
            name: skill.Name || skill.name,
            effect: skill.Effect || skill.effect,
            tier: skill.Tier || skill.tier
          }));
        }
      }
      
      return [];
    } catch (error) {
      console.error('Failed to get passive skills from Firebase:', error);
      throw error;
    }
  }

  /**
   * Set passive skills data in Firebase
   */
  public async setPassiveSkills(passiveSkills: PassiveSkill[]): Promise<void> {
    if (!this.isInitialized()) {
      throw new Error('Firebase not initialized');
    }

    try {
      const database = this.getDatabase();
      const passiveSkillsRef = ref(database, 'passive_skills');
      await set(passiveSkillsRef, passiveSkills);
      console.log('Setting passive skills data in Firebase:', passiveSkills.length, 'skills');
    } catch (error) {
      console.error('Failed to set passive skills in Firebase:', error);
      throw error;
    }
  }

  /**
   * Get passive skill combos from Firebase
   */
  public async getPassiveSkillCombos(): Promise<ComboPassiveSkill[]> {
    if (!this.isInitialized()) {
      throw new Error('Firebase not initialized');
    }

    try {
      const database = this.getDatabase();
      const combosRef = ref(database, 'passive_skill_combos');
      const snapshot = await get(combosRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log('Firebase stored pals raw data:', data);
        
        if (Array.isArray(data)) {
          console.log('Data is already an array');
          return data;
        } else {
          // Convert object to array, preserving the structure
          const result = Object.values(data).map((item: any) => {
            // If item has Name and StoredPals, it's the correct structure
            if (item && typeof item === 'object' && item.Name && item.StoredPals) {
              return {
                name: item.Name,
                storedPals: item.StoredPals.map((pal: any) => ({
                  id: pal.ID,
                  gender: pal.Gender,
                  passiveSkills: pal.PassiveSkills
                }))
              };
            }
            return item;
          });
          console.log('Firebase stored pals converted to array:', result);
          return result;
        }
      }
      
      return [];
    } catch (error) {
      console.error('Failed to get passive skill combos from Firebase:', error);
      throw error;
    }
  }

  /**
   * Set passive skill combos data in Firebase
   */
  public async setPassiveSkillCombos(combos: ComboPassiveSkill[]): Promise<void> {
    if (!this.isInitialized()) {
      throw new Error('Firebase not initialized');
    }

    try {
      const database = this.getDatabase();
      const combosRef = ref(database, 'passive_skill_combos');
      await set(combosRef, combos);
      console.log('Setting passive skill combos data in Firebase:', combos.length, 'combos');
    } catch (error) {
      console.error('Failed to set passive skill combos in Firebase:', error);
      throw error;
    }
  }

  /**
   * Get stored pals from Firebase
   */
  public async getStoredPals(): Promise<PalSpecies[]> {
    if (!this.isInitialized()) {
      throw new Error('Firebase not initialized');
    }

    try {
      const database = this.getDatabase();
      const storedPalsRef = ref(database, 'stored_pals');
      const snapshot = await get(storedPalsRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const rawData = Array.isArray(data) ? data : Object.values(data);
        
        // Convert Firebase property names to match TypeScript interface
        return rawData.map((species: any) => ({
          name: species.Name || species.name,
          storedPals: (species.StoredPals || species.storedPals || []).map((pal: any) => ({
            id: pal.ID || pal.id,
            gender: pal.Gender || pal.gender,
            passiveSkills: pal.PassiveSkills || pal.passiveSkills || []
          }))
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Failed to get stored pals from Firebase:', error);
      throw error;
    }
  }

  /**
   * Set stored pals data in Firebase
   */
  public async setStoredPals(storedPals: PalSpecies[]): Promise<void> {
    if (!this.isInitialized()) {
      throw new Error('Firebase not initialized');
    }

    try {
      const database = this.getDatabase();
      const storedPalsRef = ref(database, 'stored_pals');
      
      // Convert TypeScript property names to Firebase property names
      const firebaseData = storedPals.map(species => ({
        Name: species.name,
        StoredPals: species.storedPals.map(pal => ({
          ID: pal.id,
          Gender: pal.gender,
          PassiveSkills: pal.passiveSkills
        }))
      }));
      
      await set(storedPalsRef, firebaseData);
      console.log('Setting stored pals data in Firebase:', storedPals.length, 'species');
    } catch (error) {
      console.error('Failed to set stored pals in Firebase:', error);
      throw error;
    }
  }

  /**
   * Add a new pal to stored pals in Firebase
   */
  public async addStoredPal(
    palName: string,
    gender: string,
    passiveSkills: string[]
  ): Promise<void> {
    if (!this.isInitialized()) {
      throw new Error('Firebase not initialized');
    }

    try {
      // Get current stored pals
      const storedPals = await this.getStoredPals();
      
      // Find existing species or create new one
      const existingSpeciesIndex = storedPals.findIndex(
        species => species.name.toLowerCase() === palName.toLowerCase()
      );
      
      if (existingSpeciesIndex !== -1) {
        // Add to existing species
        const newId = storedPals[existingSpeciesIndex].storedPals.length + 1;
        storedPals[existingSpeciesIndex].storedPals.push({
          id: newId,
          gender,
          passiveSkills
        });
      } else {
        // Create new species
        storedPals.push({
          name: palName,
          storedPals: [{
            id: 1,
            gender,
            passiveSkills
          }]
        });
      }
      
      // Update Firebase
      await this.setStoredPals(storedPals);
    } catch (error) {
      console.error('Failed to add stored pal in Firebase:', error);
      throw error;
    }
  }

  /**
   * Remove a pal from stored pals in Firebase
   */
  public async removeStoredPal(palName: string, palId: number): Promise<void> {
    if (!this.isInitialized()) {
      throw new Error('Firebase not initialized');
    }

    try {
      // Get current stored pals
      const storedPals = await this.getStoredPals();
      
      // Find and remove the pal
      for (let i = 0; i < storedPals.length; i++) {
        const species = storedPals[i];
        if (species.name.toLowerCase() === palName.toLowerCase()) {
          const palIndex = species.storedPals.findIndex(p => p.id === palId);
          if (palIndex !== -1) {
            // Remove the pal
            species.storedPals.splice(palIndex, 1);
            
            // Update IDs
            for (let j = palIndex; j < species.storedPals.length; j++) {
              species.storedPals[j].id = j + 1;
            }
            
            // Remove species if empty
            if (species.storedPals.length === 0) {
              storedPals.splice(i, 1);
            }
            break;
          }
        }
      }
      
      // Update Firebase
      await this.setStoredPals(storedPals);
    } catch (error) {
      console.error('Failed to remove stored pal in Firebase:', error);
      throw error;
    }
  }

  /**
   * Get all data from Firebase
   */
  public async getAllData(): Promise<FirebaseData> {
    if (!this.isInitialized()) {
      throw new Error('Firebase not initialized');
    }

    try {
      const [pals, passiveSkills, passiveSkillCombos, storedPals] = await Promise.all([
        this.getPals(),
        this.getPassiveSkills(),
        this.getPassiveSkillCombos(),
        this.getStoredPals()
      ]);

      return {
        pals,
        passive_skills: passiveSkills,
        passive_skill_combos: passiveSkillCombos,
        stored_pals: storedPals
      };
    } catch (error) {
      console.error('Failed to get all data from Firebase:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const firebaseService = FirebaseService.getInstance();