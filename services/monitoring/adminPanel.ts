/**
 * Admin Panel Service - Handles content import and management for LinguApp
 * Provides functionality for importing vocabulary and lessons from Google Drive
 * Includes validation, versioning, and error logging
 */

import { 
  firestoreDoc,
  firestoreCollection,
  setDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  // callFunction - reserved for future use
} from '@/config/firebase';
import { VocabularyItem, GrammarConcept, CEFRLevel } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ImportResult {
  success: boolean;
  itemsImported: number;
  errors: string[];
  warnings: string[];
  version: string;
}

interface ImportLog {
  id: string;
  userId: string;
  fileName: string;
  language: string;
  level: CEFRLevel;
  timestamp: string;
  result: ImportResult;
  rawFileUrl?: string;
}

interface ContentVersion {
  language: string;
  level: CEFRLevel;
  version: string;
  lastUpdated: string;
  itemCount: number;
}

class AdminPanelService {
  /**
   * Check if user has admin privileges
   */
  async isAdmin(userId: string): Promise<boolean> {
    try {
      // Check user document for admin flag
      const userDoc = await getDocs(query(
        firestoreCollection('users'),
        where('id', '==', userId),
        where('admin', '==', true),
        limit(1),
      ));
      
      return !userDoc.empty;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  /**
   * Import vocabulary from CSV/JSON file
   */
  async importVocabulary(
    userId: string,
    fileContent: string,
    fileName: string,
    language: string,
    level: CEFRLevel,
    fileType: 'csv' | 'json',
  ): Promise<ImportResult> {
    console.debug(`Starting vocabulary import: ${fileName} for ${language} ${level}`);
    
    try {
      // Verify admin privileges
      const isAdmin = await this.isAdmin(userId);
      if (!isAdmin) {
        throw new Error('Insufficient privileges for content import');
      }

      let vocabularyItems: VocabularyItem[] = [];
      const errors: string[] = [];
      const warnings: string[] = [];

      // Parse file content based on type
      if (fileType === 'json') {
        try {
          const parsed = JSON.parse(fileContent);
          vocabularyItems = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          errors.push('Invalid JSON format');
          return { success: false, itemsImported: 0, errors, warnings, version: '' };
        }
      } else if (fileType === 'csv') {
        vocabularyItems = this.parseCSVToVocabulary(fileContent, errors, warnings);
      }

      // Validate vocabulary items
      const validItems = this.validateVocabularyItems(vocabularyItems, errors, warnings);
      
      if (validItems.length === 0) {
        errors.push('No valid vocabulary items found');
        return { success: false, itemsImported: 0, errors, warnings, version: '' };
      }

      // Generate version number
      const version = `v${Date.now()}`;
      
      // Store raw file in Firebase Storage (simulated with Firestore)
      const rawFileRef = firestoreDoc('rawImports', `${language}_${level}_${version}`);
      await setDoc(rawFileRef, {
        fileName,
        language,
        level,
        content: fileContent,
        uploadedBy: userId,
        uploadedAt: serverTimestamp(),
        version,
      });

      // Import vocabulary items to Firestore
      let importedCount = 0;
      for (const item of validItems) {
        try {
          const vocabRef = firestoreDoc('words', `${language}_${level}_vocabulary_${item.id}`);
          await setDoc(vocabRef, {
            ...item,
            importedAt: serverTimestamp(),
            importedBy: userId,
            version,
          });
          importedCount++;
        } catch (error) {
          errors.push(`Failed to import item ${item.id}: ${error}`);
        }
      }

      // Update content version
      await this.updateContentVersion(language, level, version, importedCount);

      // Log import result
      const result: ImportResult = {
        success: importedCount > 0,
        itemsImported: importedCount,
        errors,
        warnings,
        version,
      };

      await this.logImport(userId, fileName, language, level, result);

      console.debug(`Vocabulary import completed: ${importedCount} items imported`);
      return result;
    } catch (error) {
      console.error('Error importing vocabulary:', error);
      const result: ImportResult = {
        success: false,
        itemsImported: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: [],
        version: '',
      };
      
      await this.logImport(userId, fileName, language, level, result);
      return result;
    }
  }

  /**
   * Import grammar concepts from file
   */
  async importGrammar(
    userId: string,
    fileContent: string,
    fileName: string,
    language: string,
    level: CEFRLevel,
    fileType: 'csv' | 'json',
  ): Promise<ImportResult> {
    console.debug(`Starting grammar import: ${fileName} for ${language} ${level}`);
    
    try {
      // Verify admin privileges
      const isAdmin = await this.isAdmin(userId);
      if (!isAdmin) {
        throw new Error('Insufficient privileges for content import');
      }

      let grammarConcepts: GrammarConcept[] = [];
      const errors: string[] = [];
      const warnings: string[] = [];

      // Parse file content
      if (fileType === 'json') {
        try {
          const parsed = JSON.parse(fileContent);
          grammarConcepts = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          errors.push('Invalid JSON format');
          return { success: false, itemsImported: 0, errors, warnings, version: '' };
        }
      } else if (fileType === 'csv') {
        grammarConcepts = this.parseCSVToGrammar(fileContent, errors, warnings);
      }

      // Validate grammar concepts
      const validConcepts = this.validateGrammarConcepts(grammarConcepts, errors, warnings);
      
      if (validConcepts.length === 0) {
        errors.push('No valid grammar concepts found');
        return { success: false, itemsImported: 0, errors, warnings, version: '' };
      }

      // Generate version number
      const version = `v${Date.now()}`;
      
      // Store raw file
      const rawFileRef = firestoreDoc('rawImports', `${language}_${level}_grammar_${version}`);
      await setDoc(rawFileRef, {
        fileName,
        language,
        level,
        content: fileContent,
        uploadedBy: userId,
        uploadedAt: serverTimestamp(),
        version,
        type: 'grammar',
      });

      // Import grammar concepts to Firestore
      let importedCount = 0;
      for (const concept of validConcepts) {
        try {
          const grammarRef = firestoreDoc('words', `${language}_${level}_grammar_${concept.id}`);
          await setDoc(grammarRef, {
            ...concept,
            importedAt: serverTimestamp(),
            importedBy: userId,
            version,
          });
          importedCount++;
        } catch (error) {
          errors.push(`Failed to import concept ${concept.id}: ${error}`);
        }
      }

      // Update content version
      await this.updateContentVersion(language, level, version, importedCount, 'grammar');

      // Log import result
      const result: ImportResult = {
        success: importedCount > 0,
        itemsImported: importedCount,
        errors,
        warnings,
        version,
      };

      await this.logImport(userId, fileName, language, level, result, 'grammar');

      console.debug(`Grammar import completed: ${importedCount} concepts imported`);
      return result;
    } catch (error) {
      console.error('Error importing grammar:', error);
      const result: ImportResult = {
        success: false,
        itemsImported: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: [],
        version: '',
      };
      
      await this.logImport(userId, fileName, language, level, result, 'grammar');
      return result;
    }
  }

  /**
   * Parse CSV content to vocabulary items
   */
  private parseCSVToVocabulary(
    csvContent: string,
    errors: string[],
    warnings: string[],
  ): VocabularyItem[] {
    const items: VocabularyItem[] = [];
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      errors.push('CSV must have at least a header and one data row');
      return items;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = ['word', 'translation'];
    
    for (const required of requiredHeaders) {
      if (!headers.includes(required)) {
        errors.push(`Missing required column: ${required}`);
        return items;
      }
    }

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      if (values.length !== headers.length) {
        warnings.push(`Row ${i + 1}: Column count mismatch`);
        continue;
      }

      const item: Partial<VocabularyItem> = {
        id: `vocab_${Date.now()}_${i}`,
        cefrLevel: 'A1', // Default level
      };

      headers.forEach((header, index) => {
        const value = values[index];
        switch (header) {
          case 'word':
            item.word = value;
            break;
          case 'translation':
            item.translation = value;
            break;
          case 'phonetic':
            item.phonetic = value;
            break;
          case 'partofspeech':
            item.partOfSpeech = value as any;
            break;
          case 'difficulty':
            item.difficulty = parseInt(value) || 1;
            break;
          case 'frequency':
            item.frequency = parseInt(value) || 1;
            break;
          case 'tags':
            item.tags = value.split(';').map(t => t.trim());
            break;
        }
      });

      if (item.word && item.translation) {
        items.push(item as VocabularyItem);
      } else {
        warnings.push(`Row ${i + 1}: Missing required fields`);
      }
    }

    return items;
  }

  /**
   * Parse CSV content to grammar concepts
   */
  private parseCSVToGrammar(
    csvContent: string,
    errors: string[],
    warnings: string[],
  ): GrammarConcept[] {
    const concepts: GrammarConcept[] = [];
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      errors.push('CSV must have at least a header and one data row');
      return concepts;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = ['title', 'description'];
    
    for (const required of requiredHeaders) {
      if (!headers.includes(required)) {
        errors.push(`Missing required column: ${required}`);
        return concepts;
      }
    }

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      if (values.length !== headers.length) {
        warnings.push(`Row ${i + 1}: Column count mismatch`);
        continue;
      }

      const concept: Partial<GrammarConcept> = {
        id: `grammar_${Date.now()}_${i}`,
        cefrLevel: 'A1', // Default level
        category: 'other',
        difficulty: 1,
        examples: [],
      };

      headers.forEach((header, index) => {
        const value = values[index];
        switch (header) {
          case 'title':
            concept.title = { en: value };
            break;
          case 'description':
            concept.description = { en: value };
            break;
          case 'category':
            concept.category = value as any;
            break;
          case 'difficulty':
            concept.difficulty = parseInt(value) || 1;
            break;
        }
      });

      if (concept.title && concept.description) {
        concepts.push(concept as GrammarConcept);
      } else {
        warnings.push(`Row ${i + 1}: Missing required fields`);
      }
    }

    return concepts;
  }

  /**
   * Validate vocabulary items
   */
  private validateVocabularyItems(
    items: VocabularyItem[],
    errors: string[],
    warnings: string[],
  ): VocabularyItem[] {
    const validItems: VocabularyItem[] = [];
    
    for (const item of items) {
      let isValid = true;
      
      // Required fields validation
      if (!item.word || !item.translation) {
        errors.push(`Item ${item.id || 'unknown'}: Missing word or translation`);
        isValid = false;
      }
      
      // Set defaults for optional fields
      if (!item.partOfSpeech) {
        item.partOfSpeech = 'noun';
        warnings.push(`Item ${item.word}: Default part of speech set to 'noun'`);
      }
      
      if (!item.difficulty) {
        item.difficulty = 1;
      }
      
      if (!item.frequency) {
        item.frequency = 1;
      }
      
      if (!item.tags) {
        item.tags = [];
      }
      
      if (!item.exampleSentences) {
        item.exampleSentences = [];
      }
      
      if (isValid) {
        validItems.push(item);
      }
    }
    
    return validItems;
  }

  /**
   * Validate grammar concepts
   */
  private validateGrammarConcepts(
    concepts: GrammarConcept[],
    errors: string[],
    warnings: string[],
  ): GrammarConcept[] {
    const validConcepts: GrammarConcept[] = [];
    
    for (const concept of concepts) {
      let isValid = true;
      
      // Required fields validation
      if (!concept.title || !concept.description) {
        errors.push(`Concept ${concept.id || 'unknown'}: Missing title or description`);
        isValid = false;
      }
      
      // Set defaults for optional fields
      if (!concept.category) {
        concept.category = 'other';
        warnings.push(`Concept ${concept.id}: Default category set to 'other'`);
      }
      
      if (!concept.difficulty) {
        concept.difficulty = 1;
      }
      
      if (!concept.examples) {
        concept.examples = [];
      }
      
      if (isValid) {
        validConcepts.push(concept);
      }
    }
    
    return validConcepts;
  }

  /**
   * Update content version in Firestore
   */
  private async updateContentVersion(
    language: string,
    level: CEFRLevel,
    version: string,
    itemCount: number,
    type: 'vocabulary' | 'grammar' = 'vocabulary',
  ): Promise<void> {
    try {
      const versionRef = firestoreDoc('contentVersions', `${language}_${level}_${type}`);
      await setDoc(versionRef, {
        language,
        level,
        type,
        version,
        lastUpdated: serverTimestamp(),
        itemCount,
      });
      
      console.debug(`Content version updated: ${language} ${level} ${type} ${version}`);
    } catch (error) {
      console.error('Error updating content version:', error);
    }
  }

  /**
   * Log import operation
   */
  private async logImport(
    userId: string,
    fileName: string,
    language: string,
    level: CEFRLevel,
    result: ImportResult,
    type: 'vocabulary' | 'grammar' = 'vocabulary',
  ): Promise<void> {
    try {
      const logRef = firestoreDoc('importLogs', `${Date.now()}_${userId}`);
      await setDoc(logRef, {
        userId,
        fileName,
        language,
        level,
        type,
        result,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error logging import:', error);
    }
  }

  /**
   * Get import logs for admin review
   */
  async getImportLogs(
    userId: string,
    limitCount: number = 50,
  ): Promise<ImportLog[]> {
    try {
      const isAdmin = await this.isAdmin(userId);
      if (!isAdmin) {
        throw new Error('Insufficient privileges');
      }

      const logsCollection = firestoreCollection('importLogs');
      const q = query(
        logsCollection,
        orderBy('timestamp', 'desc'),
        limit(limitCount),
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
...(doc.data() as any),
      })) as ImportLog[];
    } catch (error) {
      console.error('Error getting import logs:', error);
      return [];
    }
  }

  /**
   * Get content versions for all languages and levels
   */
  async getContentVersions(userId: string): Promise<ContentVersion[]> {
    try {
      const isAdmin = await this.isAdmin(userId);
      if (!isAdmin) {
        throw new Error('Insufficient privileges');
      }

      const versionsCollection = firestoreCollection('contentVersions');
      const querySnapshot = await getDocs(versionsCollection);
      
      return querySnapshot.docs.map(doc => ({
...(doc.data() as any),
      })) as ContentVersion[];
    } catch (error) {
      console.error('Error getting content versions:', error);
      return [];
    }
  }

  /**
   * Trigger content refresh for clients
   */
  async triggerContentRefresh(
    userId: string,
    language: string,
    level: CEFRLevel,
  ): Promise<boolean> {
    try {
      const isAdmin = await this.isAdmin(userId);
      if (!isAdmin) {
        throw new Error('Insufficient privileges');
      }

      // Update content version to trigger client refresh
      const refreshRef = firestoreDoc('contentRefresh', `${language}_${level}`);
      await updateDoc(refreshRef, {
        lastRefresh: serverTimestamp(),
        triggeredBy: userId,
      });
      
      console.debug(`Content refresh triggered for ${language} ${level}`);
      return true;
    } catch (error) {
      console.error('Error triggering content refresh:', error);
      return false;
    }
  }

  /**
   * Cache admin status for offline access
   */
  async cacheAdminStatus(userId: string, isAdmin: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(`admin_${userId}`, JSON.stringify({
        isAdmin,
        cachedAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error caching admin status:', error);
    }
  }

  /**
   * Get cached admin status for offline mode
   */
  async getCachedAdminStatus(userId: string): Promise<boolean> {
    try {
      const cached = await AsyncStorage.getItem(`admin_${userId}`);
      if (cached) {
        const { isAdmin, cachedAt } = JSON.parse(cached);
        // Cache valid for 24 hours
        const cacheAge = Date.now() - new Date(cachedAt).getTime();
        if (cacheAge < 24 * 60 * 60 * 1000) {
          return isAdmin;
        }
      }
      return false;
    } catch (error) {
      console.error('Error getting cached admin status:', error);
      return false;
    }
  }
}

export const adminPanelService = new AdminPanelService();
export default adminPanelService;
