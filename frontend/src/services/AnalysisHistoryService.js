/**
 * AnalysisHistoryService — FakeProof Labs
 * Manages analysis history using localStorage
 * Maximum 20 recent analyses are stored
 */

const STORAGE_KEY = 'analysisHistory';
const MAX_HISTORY = 20;

export const AnalysisHistoryService = {
  /**
   * Add a new analysis to history
   * @param {Object} analysis - Analysis data
   * @returns {Array} Updated history
   */
  addAnalysis(analysis) {
    try {
      const history = this.getHistory();

      const newAnalysis = {
        id: `analysis_${Date.now()}`,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        ...analysis,
      };

      // Add to beginning (most recent first)
      const updatedHistory = [newAnalysis, ...history].slice(0, MAX_HISTORY);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      return updatedHistory;
    } catch (error) {
      console.error('Error adding analysis to history:', error);
      return this.getHistory();
    }
  },

  /**
   * Get all analyses from history
   * @returns {Array} Analysis history
   */
  getHistory() {
    try {
      const history = localStorage.getItem(STORAGE_KEY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error retrieving analysis history:', error);
      return [];
    }
  },

  /**
   * Get analysis by ID
   * @param {string} id - Analysis ID
   * @returns {Object|null} Analysis object or null
   */
  getAnalysisById(id) {
    try {
      const history = this.getHistory();
      return history.find((analysis) => analysis.id === id) || null;
    } catch (error) {
      console.error('Error retrieving analysis by ID:', error);
      return null;
    }
  },

  /**
   * Delete analysis by ID
   * @param {string} id - Analysis ID
   * @returns {Array} Updated history
   */
  deleteAnalysis(id) {
    try {
      const history = this.getHistory();
      const updatedHistory = history.filter((analysis) => analysis.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      return updatedHistory;
    } catch (error) {
      console.error('Error deleting analysis:', error);
      return this.getHistory();
    }
  },

  /**
   * Clear all analysis history
   * @returns {void}
   */
  clearHistory() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  },

  /**
   * Export history as JSON
   * @returns {string} JSON string of history
   */
  exportHistory() {
    try {
      const history = this.getHistory();
      return JSON.stringify(history, null, 2);
    } catch (error) {
      console.error('Error exporting history:', error);
      return '[]';
    }
  },

  /**
   * Get statistics from history
   * @returns {Object} Statistics object
   */
  getStatistics() {
    try {
      const history = this.getHistory();

      if (history.length === 0) {
        return {
          totalAnalyses: 0,
          realCount: 0,
          fakeCount: 0,
          averageConfidence: 0,
        };
      }

      const totalAnalyses = history.length;
      const realCount = history.filter(
        (a) => a.prediction === 'Real' || a.prediction === 'Authentic Image'
      ).length;
      const fakeCount = history.filter(
        (a) => a.prediction === 'Fake' || a.prediction === 'Deepfake Detected'
      ).length;

      const avgConfidence = Math.round(
        history.reduce((sum, a) => sum + (a.confidence || 0), 0) / totalAnalyses
      );

      return {
        totalAnalyses,
        realCount,
        fakeCount,
        averageConfidence: avgConfidence,
      };
    } catch (error) {
      console.error('Error calculating statistics:', error);
      return {
        totalAnalyses: 0,
        realCount: 0,
        fakeCount: 0,
        averageConfidence: 0,
      };
    }
  },
};
