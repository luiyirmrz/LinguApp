import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../../create-context';

// Validation schema for language settings
const languageSettingsSchema = z.object({
  mainLanguage: z.string().min(2).max(10),
  targetLanguage: z.string().min(2).max(10),
  showTranslations: z.boolean(),
  showPhonetics: z.boolean(),
});

export const languageSettingsRoute = createTRPCRouter({
  update: publicProcedure
    .input(languageSettingsSchema)
    .mutation(async ({ input }) => {
      try {
        // Validate the input
        const validatedInput = languageSettingsSchema.parse(input);
        
        // For now, we'll simulate the update and return the settings
        // In a real implementation, this would update the database
        const updatedSettings = {
          mainLanguage: validatedInput.mainLanguage,
          targetLanguage: validatedInput.targetLanguage,
          showTranslations: validatedInput.showTranslations,
          showPhonetics: validatedInput.showPhonetics,
          updatedAt: new Date().toISOString(),
        };

        console.log('Language settings updated:', updatedSettings);

        return {
          success: true,
          ...updatedSettings,
        };
      } catch (error) {
        console.error('Error updating language settings:', error);
        throw new Error('Failed to update language settings');
      }
    }),
});
