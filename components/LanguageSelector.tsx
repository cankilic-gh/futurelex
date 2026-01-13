import React, { useState } from 'react';
import { SUPPORTED_LANGUAGES, Language } from '../services/languages';
import { motion } from 'framer-motion';

interface LanguageSelectorProps {
  selectedLanguage?: string;
  onSelect: (languageCode: string) => void;
  excludeLanguage?: string; // Language to exclude from selection
  label?: string;
  showSearch?: boolean; // Show search input (default: true)
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onSelect,
  excludeLanguage,
  label = 'Select Language',
  showSearch = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter languages based on search and exclusion
  const availableLanguages = SUPPORTED_LANGUAGES.filter(lang => {
    const matchesSearch = showSearch
      ? (lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
         lang.code.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    const notExcluded = lang.code !== excludeLanguage;
    return matchesSearch && notExcluded;
  });

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-3">
          {label}
        </label>
      )}
      
      {/* Search Input - Only show if showSearch is true */}
      {showSearch && (
        <input
          type="text"
          placeholder="Search languages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 mb-4 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-neon-cyan/50 focus:ring-2 focus:ring-neon-cyan/20"
        />
      )}

      {/* Language Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
        {availableLanguages.map((language) => {
          const isSelected = selectedLanguage === language.code;
          
          return (
            <motion.button
              key={language.code}
              onClick={() => onSelect(language.code)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                p-4 rounded-xl border-2 transition-all
                ${isSelected
                  ? 'bg-neon-cyan/20 border-neon-cyan shadow-[0_0_20px_rgba(0,243,255,0.3)]'
                  : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                }
              `}
            >
              <div className="text-3xl mb-2">{language.flag}</div>
              <div className="text-sm font-semibold text-white">
                {language.nativeName}
              </div>
              <div className="text-xs text-slate-400">
                {language.name}
              </div>
              {isSelected && (
                <div className="mt-2 text-xs text-neon-cyan font-medium">
                  Selected
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {availableLanguages.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          No languages found matching "{searchQuery}"
        </div>
      )}
    </div>
  );
};

