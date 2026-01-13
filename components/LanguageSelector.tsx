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
        <label className="block text-xs font-medium text-slate-400 mb-2">
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

      {/* Language Grid - Compact */}
      <div className="grid grid-cols-3 gap-2">
        {availableLanguages.map((language) => {
          const isSelected = selectedLanguage === language.code;

          return (
            <motion.button
              key={language.code}
              onClick={() => onSelect(language.code)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                p-2.5 rounded-xl border transition-all text-center
                ${isSelected
                  ? 'bg-neon-cyan/15 border-neon-cyan/50'
                  : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                }
              `}
            >
              <div className="text-xl mb-1">{language.flag}</div>
              <div className="text-xs font-medium text-white truncate">
                {language.nativeName}
              </div>
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

