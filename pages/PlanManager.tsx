import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalFirst } from '../context/LocalFirstContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { getLanguageByCode, isValidLanguagePair, generatePlanName } from '../services/languages';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X, ArrowRight, AlertTriangle } from 'lucide-react';

export const PlanManager: React.FC = () => {
  // Use LocalFirst context - NO MORE WAITING!
  const { plans, activePlan, createPlan, deletePlan, setActivePlan } = useLocalFirst();
  const navigate = useNavigate();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<{ id: string; name: string } | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState<string>('');
  const [targetLanguage, setTargetLanguage] = useState<string>('');
  const [customName, setCustomName] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (!showCreateModal) {
      setSourceLanguage('');
      setTargetLanguage('');
      setCustomName('');
      setError('');
    }
  }, [showCreateModal]);

  const handleCreatePlan = () => {
    if (!sourceLanguage || !targetLanguage) {
      setError('Please select both source and target languages');
      return;
    }

    if (!isValidLanguagePair(sourceLanguage, targetLanguage)) {
      setError('Invalid language pair');
      return;
    }

    try {
      const planName = customName || generatePlanName(sourceLanguage, targetLanguage);

      // INSTANT! No await needed - local first
      createPlan(sourceLanguage, targetLanguage, planName);

      // Close modal immediately
      setShowCreateModal(false);
      setSourceLanguage('');
      setTargetLanguage('');
      setCustomName('');
      setError('');

      // Navigate to learn
      navigate('/learn');
    } catch (err: any) {
      setError(err.message || 'Failed to create plan');
    }
  };

  const handleDeleteClick = (planId: string, planName: string) => {
    setPlanToDelete({ id: planId, name: planName });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (!planToDelete) return;

    try {
      // INSTANT! No await needed
      deletePlan(planToDelete.id);
      setShowDeleteModal(false);
      setPlanToDelete(null);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to delete plan');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setPlanToDelete(null);
    setError('');
  };

  const handleSetActive = (planId: string) => {
    // INSTANT! No await needed
    setActivePlan(planId);
  };

  // NO LOADING STATE NEEDED - Local first means instant data!

  return (
    <div className="min-h-screen">

      <div className="max-w-4xl mx-auto pt-32 px-4 pb-20">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Learning Plans
            </h1>
            <p className="text-sm text-slate-500">
              Select a plan to start learning
            </p>
          </div>
          <motion.button
            onClick={() => setShowCreateModal(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-all"
          >
            <Plus size={16} />
            New Plan
          </motion.button>
        </div>

        {/* Plans Grid */}
        {plans.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 rounded-2xl bg-slate-900/60 border border-white/5"
          >
            <div className="text-4xl mb-3">🌍</div>
            <p className="text-slate-400 mb-1">No plans yet</p>
            <p className="text-xs text-slate-600">Create your first plan to start learning</p>
          </motion.div>
        ) : (
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
            <AnimatePresence>
              {plans.map((plan) => {
                const sourceLang = getLanguageByCode(plan.sourceLanguage);
                const targetLang = getLanguageByCode(plan.targetLanguage);
                const isActive = activePlan?.id === plan.id;

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    onClick={() => !isActive && handleSetActive(plan.id)}
                    className={`
                      relative p-5 rounded-2xl backdrop-blur-xl transition-all w-full cursor-pointer group
                      ${isActive
                        ? 'bg-slate-800/80 border border-neon-cyan/30'
                        : 'bg-slate-900/60 border border-white/5 hover:bg-slate-800/60 hover:border-white/10'
                      }
                    `}
                  >
                    {/* Top row: Flags and Active indicator */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{sourceLang?.flag}</span>
                        <ArrowRight className="text-slate-600" size={14} />
                        <span className="text-2xl">{targetLang?.flag}</span>
                      </div>
                      {isActive && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neon-cyan/10 text-neon-cyan text-xs font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
                          Active
                        </div>
                      )}
                    </div>

                    {/* Plan Name */}
                    <h3 className="text-base font-semibold text-white mb-1">
                      {plan.name}
                    </h3>

                    {/* Progress - minimal */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                      <span>{plan.progress?.wordsLearned || 0} words</span>
                      <span>Level {plan.progress?.currentLevel || 1}</span>
                    </div>

                    {/* Actions - subtle, at bottom */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      {!isActive ? (
                        <span className="text-xs text-slate-500 group-hover:text-neon-cyan transition-colors">
                          Click to activate
                        </span>
                      ) : (
                        <span className="text-xs text-neon-cyan/70">Currently learning</span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(plan.id, plan.name);
                        }}
                        className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Create Plan Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowCreateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full relative"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">New Plan</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-500 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Source Language */}
                <div className="mb-4">
                  <LanguageSelector
                    label="I know"
                    selectedLanguage={sourceLanguage}
                    onSelect={setSourceLanguage}
                    showSearch={false}
                  />
                </div>

                {/* Target Language */}
                <div className="mb-4">
                  <LanguageSelector
                    label="I want to learn"
                    selectedLanguage={targetLanguage}
                    onSelect={setTargetLanguage}
                    excludeLanguage={sourceLanguage}
                    showSearch={false}
                  />
                </div>

                {/* Custom Name (Optional) */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Name (optional)
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder={sourceLanguage && targetLanguage ? generatePlanName(sourceLanguage, targetLanguage) : 'Auto-generated'}
                    className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-white/20"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                    {error}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleCreatePlan}
                    disabled={!sourceLanguage || !targetLanguage}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white text-slate-900 text-sm font-medium hover:bg-slate-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Plan
                  </button>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-sm font-medium hover:bg-white/10 hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && planToDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={handleDeleteCancel}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full relative"
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">Delete Plan</h2>
                </div>

                <p className="text-sm text-slate-400 mb-4">
                  Are you sure you want to delete <span className="text-white font-medium">{planToDelete.name}</span>? This will remove all saved words and progress.
                </p>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                    {error}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteConfirm}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all"
                  >
                    Delete
                  </button>
                  <button
                    onClick={handleDeleteCancel}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-sm font-medium hover:bg-white/10 hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
