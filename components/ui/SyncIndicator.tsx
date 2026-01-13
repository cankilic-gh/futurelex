/**
 * SYNC INDICATOR
 *
 * Small, non-intrusive indicator showing sync status.
 * Shows in top-right corner.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalFirst } from '../../context/LocalFirstContext';

export const SyncIndicator: React.FC = () => {
  const { syncStatus, isSyncing } = useLocalFirst();

  // Don't show anything if idle and synced
  if (syncStatus === 'idle' || syncStatus === 'synced') {
    return null;
  }

  const statusConfig = {
    syncing: {
      icon: '↻',
      text: 'Syncing...',
      color: 'text-neon-cyan',
      bg: 'bg-neon-cyan/10',
      border: 'border-neon-cyan/30',
      animate: true,
    },
    offline: {
      icon: '○',
      text: 'Offline',
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
      border: 'border-yellow-400/30',
      animate: false,
    },
    error: {
      icon: '!',
      text: 'Sync failed',
      color: 'text-red-400',
      bg: 'bg-red-400/10',
      border: 'border-red-400/30',
      animate: false,
    },
  };

  const config = statusConfig[syncStatus as keyof typeof statusConfig];
  if (!config) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg} ${config.border} border backdrop-blur-sm`}
      >
        <span
          className={`${config.color} text-sm ${config.animate ? 'animate-spin' : ''}`}
          style={{ display: 'inline-block' }}
        >
          {config.icon}
        </span>
        <span className={`${config.color} text-xs font-mono`}>
          {config.text}
        </span>
      </motion.div>
    </AnimatePresence>
  );
};

export default SyncIndicator;
