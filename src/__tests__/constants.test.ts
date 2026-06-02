import {
  NAV_LINKS,
  TRUST_STATS,
  PROBLEMS,
  SOLUTIONS,
  FEATURES,
  WORKFLOW_STEPS,
  CHAT_DEMO_MESSAGES,
  USE_CASES,
  INTEGRATIONS,
  PRICING_TIERS,
  TESTIMONIALS,
  FAQ_ITEMS,
} from "@/lib/constants";

describe("Constants validation", () => {
  it("NAV_LINKS has required entries", () => {
    expect(NAV_LINKS.length).toBeGreaterThanOrEqual(5);
    NAV_LINKS.forEach((link) => {
      expect(link.label).toBeTruthy();
      expect(link.href).toBeTruthy();
      expect(link.href).toMatch(/^#/);
    });
  });

  it("TRUST_STATS has 4 entries with numeric values", () => {
    expect(TRUST_STATS).toHaveLength(4);
    TRUST_STATS.forEach((stat) => {
      expect(typeof stat.value).toBe("number");
      expect(stat.label).toBeTruthy();
    });
  });

  it("PROBLEMS and SOLUTIONS have matching lengths", () => {
    expect(PROBLEMS).toHaveLength(5);
    expect(SOLUTIONS).toHaveLength(5);
  });

  it("FEATURES has 10 items with icons", () => {
    expect(FEATURES).toHaveLength(10);
    FEATURES.forEach((f) => {
      expect(f.title).toBeTruthy();
      expect(f.description).toBeTruthy();
      expect(f.icon).toBeTruthy();
    });
  });

  it("WORKFLOW_STEPS has 5 steps", () => {
    expect(WORKFLOW_STEPS).toHaveLength(5);
    WORKFLOW_STEPS.forEach((step) => {
      expect(step.step).toBeGreaterThanOrEqual(1);
      expect(step.title).toBeTruthy();
    });
  });

  it("CHAT_DEMO_MESSAGES has entries with sender and text", () => {
    expect(CHAT_DEMO_MESSAGES.length).toBeGreaterThanOrEqual(4);
    CHAT_DEMO_MESSAGES.forEach((msg) => {
      expect(["lead", "ai"]).toContain(msg.sender);
      expect(msg.text).toBeTruthy();
    });
  });

  it("USE_CASES has 4 industry cards", () => {
    expect(USE_CASES).toHaveLength(4);
    USE_CASES.forEach((uc) => {
      expect(uc.industry).toBeTruthy();
      expect(uc.benefits.length).toBeGreaterThanOrEqual(3);
    });
  });

  it("INTEGRATIONS has entries", () => {
    expect(INTEGRATIONS.length).toBeGreaterThanOrEqual(10);
  });

  it("PRICING_TIERS has 3 tiers with prices", () => {
    expect(PRICING_TIERS).toHaveLength(3);
    PRICING_TIERS.forEach((tier) => {
      expect(tier.monthlyPrice).toBeGreaterThan(0);
      expect(tier.yearlyPrice).toBeGreaterThan(0);
      expect(tier.features.length).toBeGreaterThanOrEqual(4);
    });
    expect(PRICING_TIERS[1].highlighted).toBe(true);
  });

  it("TESTIMONIALS has entries with ratings", () => {
    expect(TESTIMONIALS.length).toBeGreaterThanOrEqual(4);
    TESTIMONIALS.forEach((t) => {
      expect(t.name).toBeTruthy();
      expect(t.quote).toBeTruthy();
      expect(t.rating).toBeGreaterThanOrEqual(1);
      expect(t.rating).toBeLessThanOrEqual(5);
    });
  });

  it("FAQ_ITEMS has entries with questions and answers", () => {
    expect(FAQ_ITEMS.length).toBeGreaterThanOrEqual(6);
    FAQ_ITEMS.forEach((item) => {
      expect(item.question).toBeTruthy();
      expect(item.answer).toBeTruthy();
      expect(item.question.endsWith("?")).toBe(true);
    });
  });
});