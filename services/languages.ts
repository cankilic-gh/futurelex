import { Language } from '../types';

// Supported languages configuration
export const SUPPORTED_LANGUAGES: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    rtl: false,
  },
  {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    flag: '🇹🇷',
    rtl: false,
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    rtl: false,
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    rtl: false,
  },
  {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    rtl: false,
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    rtl: false,
  },
];

// Language lookup by code
export const getLanguageByCode = (code: string): Language | undefined => {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
};

// Get language name (native or English)
export const getLanguageName = (code: string, useNative: boolean = false): string => {
  const language = getLanguageByCode(code);
  if (!language) return code.toUpperCase();
  return useNative ? language.nativeName : language.name;
};

// Check if language pair is valid (can't learn language from itself)
export const isValidLanguagePair = (sourceCode: string, targetCode: string): boolean => {
  return sourceCode !== targetCode && 
         SUPPORTED_LANGUAGES.some(lang => lang.code === sourceCode) &&
         SUPPORTED_LANGUAGES.some(lang => lang.code === targetCode);
};

// Generate plan name from language pair
export const generatePlanName = (sourceCode: string, targetCode: string): string => {
  const sourceLang = getLanguageByCode(sourceCode);
  const targetLang = getLanguageByCode(targetCode);
  
  if (!sourceLang || !targetLang) {
    return `${sourceCode.toUpperCase()} → ${targetCode.toUpperCase()}`;
  }
  
  return `${targetLang.name} from ${sourceLang.name}`;
};

// Get all valid target languages for a source language
export const getValidTargetLanguages = (sourceCode: string): Language[] => {
  return SUPPORTED_LANGUAGES.filter(lang => lang.code !== sourceCode);
};

// Get all valid source languages for a target language
export const getValidSourceLanguages = (targetCode: string): Language[] => {
  return SUPPORTED_LANGUAGES.filter(lang => lang.code !== targetCode);
};


