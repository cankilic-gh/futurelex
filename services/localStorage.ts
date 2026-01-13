/**
 * LOCAL-FIRST DATA SERVICE
 *
 * App opens instantly with local data.
 * Firebase syncs in background - user never waits.
 */

import { LearningPlan } from '../types';

const STORAGE_KEYS = {
  PLANS: 'futurelex_plans',
  ACTIVE_PLAN_ID: 'futurelex_active_plan',
  USER_PREFERENCES: 'futurelex_prefs',
  LAST_SYNC: 'futurelex_last_sync',
  PENDING_SYNC: 'futurelex_pending_sync',
  DEVICE_ID: 'futurelex_device_id',
} as const;

// ============================================
// PLAN STORAGE
// ============================================

export const LocalStorage = {
  // Get all plans from local storage
  getPlans(): LearningPlan[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLANS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  // Save plans to local storage
  savePlans(plans: LearningPlan[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
    } catch (e) {
      console.error('[LocalStorage] Failed to save plans:', e);
    }
  },

  // Add a new plan
  addPlan(plan: LearningPlan): LearningPlan[] {
    const plans = this.getPlans();
    const newPlans = [...plans, plan];
    this.savePlans(newPlans);
    return newPlans;
  },

  // Update a plan
  updatePlan(planId: string, updates: Partial<LearningPlan>): LearningPlan[] {
    const plans = this.getPlans();
    const newPlans = plans.map(p =>
      p.id === planId ? { ...p, ...updates } : p
    );
    this.savePlans(newPlans);
    return newPlans;
  },

  // Delete a plan
  deletePlan(planId: string): LearningPlan[] {
    const plans = this.getPlans();
    const newPlans = plans.filter(p => p.id !== planId);
    this.savePlans(newPlans);
    return newPlans;
  },

  // Get active plan ID
  getActivePlanId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_PLAN_ID);
  },

  // Set active plan ID
  setActivePlanId(planId: string | null): void {
    if (planId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PLAN_ID, planId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_PLAN_ID);
    }
  },

  // Get active plan
  getActivePlan(): LearningPlan | null {
    const activeId = this.getActivePlanId();
    if (!activeId) return null;
    const plans = this.getPlans();
    return plans.find(p => p.id === activeId) || plans[0] || null;
  },

  // ============================================
  // SYNC STATUS
  // ============================================

  // Mark data as needing sync
  markPendingSync(action: { type: string; data: any }): void {
    try {
      const pending = this.getPendingSync();
      pending.push({ ...action, timestamp: Date.now() });
      localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(pending));
    } catch (e) {
      console.error('[LocalStorage] Failed to mark pending sync:', e);
    }
  },

  // Get pending sync actions
  getPendingSync(): Array<{ type: string; data: any; timestamp: number }> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PENDING_SYNC);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  // Clear pending sync
  clearPendingSync(): void {
    localStorage.removeItem(STORAGE_KEYS.PENDING_SYNC);
  },

  // Update last sync time
  setLastSync(): void {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());
  },

  // Get last sync time
  getLastSync(): number | null {
    const data = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    return data ? parseInt(data, 10) : null;
  },

  // ============================================
  // UTILITIES
  // ============================================

  // Generate a local ID (for offline-created items)
  generateLocalId(): string {
    return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Check if ID is a local ID
  isLocalId(id: string): boolean {
    return id.startsWith('local_');
  },

  // Get or create device-specific ID for guest users
  // This ensures each device has unique data, preventing data mixing
  getDeviceId(): string {
    try {
      let deviceId = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
      if (!deviceId) {
        // Generate unique device ID: device_<timestamp>_<random>
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
        console.log('[LocalStorage] Created new device ID:', deviceId);
      }
      return deviceId;
    } catch {
      // Fallback for private browsing or storage errors
      return `temp_${Date.now()}`;
    }
  },

  // Clear all data
  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },
};

export default LocalStorage;
