import { describe, it, expect } from 'vitest';
import {
  getGameRecommendationData,
  getUpgradeAnalysisData,
  getContextualSuggestedReplies,
} from '../../server';

describe('AI Advisor Game & Upgrade Requirements', () => {
  it('should explain GPU/CPU requirements and propose a matching build for Cyberpunk 2077 on Ultra settings', () => {
    const res = getGameRecommendationData('Cyberpunk 2077 ni Ultra sozlamada oʻynamoqchiman', 'Ultra');

    expect(res.replyText).toContain('Cyberpunk 2077');
    // Explains GPU requirement
    expect(res.replyText.toLowerCase()).toMatch(/rtx 4060|rtx 4070|gpu/i);
    // Explains CPU requirement
    expect(res.replyText.toLowerCase()).toMatch(/ryzen|core i5|cpu/i);
    // Proposes a build
    expect(res.recommendedBuild).toBeDefined();
    expect(res.recommendedBuild.componentIds.length).toBeGreaterThan(0);
    expect(res.recommendedBuild.totalPrice).toBeGreaterThan(5000000);
    // 2-3 suggested replies
    expect(res.suggestedReplies.length).toBeGreaterThanOrEqual(2);
    expect(res.suggestedReplies.length).toBeLessThanOrEqual(3);
  });

  it('should provide competitive gaming CPU/GPU advice for CS2', () => {
    const res = getGameRecommendationData('CS2 da 240 FPS kerak', 'High');

    expect(res.replyText).toContain('Counter-Strike 2');
    expect(res.replyText).toContain('FPS');
    expect(res.recommendedBuild).toBeDefined();
    expect(res.suggestedReplies.length).toBeGreaterThanOrEqual(2);
  });

  it('should analyze existing PC specs, identify bottleneck, and give concrete upgrade advice', () => {
    const userSpecs = 'Menda i3-10100F, GTX 1050 Ti, 8GB RAM bor, nimalarni yangilasam boʻladi?';
    const res = getUpgradeAnalysisData(userSpecs);

    // Identifies GPU bottleneck
    expect(res.replyText.toLowerCase()).toMatch(/bottleneck|toʻsiq|1050/i);
    // Identifies RAM upgrade
    expect(res.replyText.toLowerCase()).toMatch(/16gb|ram/i);
    // Recommends upgrade parts from PCForge
    expect(res.replyText.toLowerCase()).toMatch(/rtx 4060|rx 7600/i);
    // 2-3 suggested replies
    expect(res.suggestedReplies.length).toBeGreaterThanOrEqual(2);
    expect(res.suggestedReplies.length).toBeLessThanOrEqual(3);
  });

  it('should always return 2-3 continuation suggested replies across different prompt types', () => {
    const gameSuggestions = getContextualSuggestedReplies('Cyberpunk 2077', 'FPS 90');
    expect(gameSuggestions.length).toBeGreaterThanOrEqual(2);
    expect(gameSuggestions.length).toBeLessThanOrEqual(3);

    const upgradeSuggestions = getContextualSuggestedReplies('i5 va gtx 1060 upgrade', 'Yangilash rejasi');
    expect(upgradeSuggestions.length).toBeGreaterThanOrEqual(2);
    expect(upgradeSuggestions.length).toBeLessThanOrEqual(3);

    const generalSuggestions = getContextualSuggestedReplies('Salom', 'Assalomu alaykum');
    expect(generalSuggestions.length).toBeGreaterThanOrEqual(2);
    expect(generalSuggestions.length).toBeLessThanOrEqual(3);
  });
});
