import { formatNumber, formatCurrency, cn } from "@/lib/utils";

describe("cn utility", () => {
  it("joins truthy class names", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("filters out falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });
});

describe("formatNumber", () => {
  it("formats millions", () => {
    expect(formatNumber(1500000)).toBe("1.5M");
  });

  it("formats thousands", () => {
    expect(formatNumber(2500)).toBe("2.5K");
  });

  it("formats small numbers", () => {
    expect(formatNumber(42)).toBe("42");
  });

  it("formats exactly 1000", () => {
    expect(formatNumber(1000)).toBe("1.0K");
  });
});

describe("formatCurrency", () => {
  it("formats USD", () => {
    expect(formatCurrency(2500)).toBe("$2,500");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0");
  });

  it("formats large amounts", () => {
    expect(formatCurrency(100000)).toBe("$100,000");
  });
});