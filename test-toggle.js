// Test script for toggle functionality
// This simulates the toggle behavior

class ToggleTester {
  constructor() {
    this.savedWordIds = new Set();
    this.completedWordIds = new Set();
    this.isSaving = false;
    this.isCompleting = false;
    this.testResults = [];
  }

  log(message, data = {}) {
    const logEntry = { message, data, timestamp: new Date().toISOString() };
    this.testResults.push(logEntry);
    console.log(`[TEST] ${message}`, data);
  }

  async toggleSaveWord(wordId) {
    this.log("toggleSaveWord called", { wordId, isSaving: this.isSaving, isCompleting: this.isCompleting });
    
    if (this.isSaving || this.isCompleting) {
      this.log("BLOCKED: isSaving or isCompleting is true");
      return;
    }

    const isCurrentlySaved = this.savedWordIds.has(wordId);
    this.log("Current state", { isCurrentlySaved, savedSize: this.savedWordIds.size, completedSize: this.completedWordIds.size });

    this.isSaving = true;
    
    try {
      if (isCurrentlySaved) {
        // Remove from saved
        this.savedWordIds = new Set(this.savedWordIds);
        this.savedWordIds.delete(wordId);
        this.log("Removed from saved", { wordId, newSize: this.savedWordIds.size });
      } else {
        // Remove from completed if exists
        if (this.completedWordIds.has(wordId)) {
          this.completedWordIds = new Set(this.completedWordIds);
          this.completedWordIds.delete(wordId);
          this.log("Removed from completed (mutual exclusivity)", { wordId, newCompletedSize: this.completedWordIds.size });
        }
        
        // Add to saved
        this.savedWordIds = new Set(this.savedWordIds);
        this.savedWordIds.add(wordId);
        this.log("Added to saved", { wordId, newSize: this.savedWordIds.size });
      }
    } finally {
      this.isSaving = false;
    }
  }

  async toggleCompleteWord(wordId) {
    this.log("toggleCompleteWord called", { wordId, isSaving: this.isSaving, isCompleting: this.isCompleting });
    
    if (this.isSaving || this.isCompleting) {
      this.log("BLOCKED: isSaving or isCompleting is true");
      return;
    }

    const isCurrentlyCompleted = this.completedWordIds.has(wordId);
    this.log("Current state", { isCurrentlyCompleted, savedSize: this.savedWordIds.size, completedSize: this.completedWordIds.size });

    this.isCompleting = true;
    
    try {
      if (isCurrentlyCompleted) {
        // Remove from completed
        this.completedWordIds = new Set(this.completedWordIds);
        this.completedWordIds.delete(wordId);
        this.log("Removed from completed", { wordId, newSize: this.completedWordIds.size });
      } else {
        // Remove from saved if exists
        if (this.savedWordIds.has(wordId)) {
          this.savedWordIds = new Set(this.savedWordIds);
          this.savedWordIds.delete(wordId);
          this.log("Removed from saved (mutual exclusivity)", { wordId, newSavedSize: this.savedWordIds.size });
        }
        
        // Add to completed
        this.completedWordIds = new Set(this.completedWordIds);
        this.completedWordIds.add(wordId);
        this.log("Added to completed", { wordId, newSize: this.completedWordIds.size });
      }
    } finally {
      this.isCompleting = false;
    }
  }

  getState(wordId) {
    return {
      isSaved: this.savedWordIds.has(wordId),
      isCompleted: this.completedWordIds.has(wordId),
      savedCount: this.savedWordIds.size,
      completedCount: this.completedWordIds.size
    };
  }

  async runTests() {
    this.log("=== STARTING TOGGLE TESTS ===");
    
    const wordId = "test-word-1";
    
    // Test 1: Save toggle on
    this.log("\n--- Test 1: Save toggle ON ---");
    await this.toggleSaveWord(wordId);
    let state = this.getState(wordId);
    this.log("State after save", state);
    if (!state.isSaved || state.savedCount !== 1) {
      this.log("❌ FAIL: Save toggle ON failed", state);
    } else {
      this.log("✅ PASS: Save toggle ON");
    }
    
    // Test 2: Save toggle off
    this.log("\n--- Test 2: Save toggle OFF ---");
    await this.toggleSaveWord(wordId);
    state = this.getState(wordId);
    this.log("State after unsave", state);
    if (state.isSaved || state.savedCount !== 0) {
      this.log("❌ FAIL: Save toggle OFF failed", state);
    } else {
      this.log("✅ PASS: Save toggle OFF");
    }
    
    // Test 3: Complete toggle on
    this.log("\n--- Test 3: Complete toggle ON ---");
    await this.toggleCompleteWord(wordId);
    state = this.getState(wordId);
    this.log("State after complete", state);
    if (!state.isCompleted || state.completedCount !== 1 || state.isSaved) {
      this.log("❌ FAIL: Complete toggle ON failed", state);
    } else {
      this.log("✅ PASS: Complete toggle ON");
    }
    
    // Test 4: Complete toggle off
    this.log("\n--- Test 4: Complete toggle OFF ---");
    await this.toggleCompleteWord(wordId);
    state = this.getState(wordId);
    this.log("State after uncomplete", state);
    if (state.isCompleted || state.completedCount !== 0) {
      this.log("❌ FAIL: Complete toggle OFF failed", state);
    } else {
      this.log("✅ PASS: Complete toggle OFF");
    }
    
    // Test 5: Save -> Complete (mutual exclusivity)
    this.log("\n--- Test 5: Save -> Complete (mutual exclusivity) ---");
    await this.toggleSaveWord(wordId);
    state = this.getState(wordId);
    this.log("State after save", state);
    await this.toggleCompleteWord(wordId);
    state = this.getState(wordId);
    this.log("State after complete (should remove save)", state);
    if (!state.isCompleted || state.isSaved || state.savedCount !== 0 || state.completedCount !== 1) {
      this.log("❌ FAIL: Mutual exclusivity failed", state);
    } else {
      this.log("✅ PASS: Mutual exclusivity");
    }
    
    // Test 6: Complete -> Save (mutual exclusivity)
    this.log("\n--- Test 6: Complete -> Save (mutual exclusivity) ---");
    await this.toggleCompleteWord(wordId); // Toggle off
    await this.toggleCompleteWord(wordId); // Toggle on
    state = this.getState(wordId);
    this.log("State after complete", state);
    await this.toggleSaveWord(wordId);
    state = this.getState(wordId);
    this.log("State after save (should remove complete)", state);
    if (!state.isSaved || state.isCompleted || state.savedCount !== 1 || state.completedCount !== 0) {
      this.log("❌ FAIL: Mutual exclusivity failed", state);
    } else {
      this.log("✅ PASS: Mutual exclusivity");
    }
    
    this.log("\n=== TEST RESULTS ===");
    const failures = this.testResults.filter(r => r.message.includes("❌"));
    const passes = this.testResults.filter(r => r.message.includes("✅"));
    this.log(`Total tests: ${passes.length + failures.length}`);
    this.log(`Passed: ${passes.length}`);
    this.log(`Failed: ${failures.length}`);
    
    if (failures.length > 0) {
      this.log("\n=== FAILURES ===");
      failures.forEach(f => this.log(f.message, f.data));
    }
    
    return { passes: passes.length, failures: failures.length, results: this.testResults };
  }
}

// Run tests
const tester = new ToggleTester();
tester.runTests().then(results => {
  console.log("\n=== FINAL RESULTS ===");
  console.log(JSON.stringify(results, null, 2));
  process.exit(results.failures > 0 ? 1 : 0);
});

