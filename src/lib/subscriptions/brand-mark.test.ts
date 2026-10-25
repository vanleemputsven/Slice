import { describe, expect, it } from "vitest";
import { brandGlyph, brandSlugFor } from "@/lib/subscriptions/brand-mark";

describe("brandSlugFor", () => {
  it("reads the stored key, then the name, then the provider", () => {
    expect(brandSlugFor({ iconKey: "netflix", name: "Films" })).toBe("netflix");
    expect(brandSlugFor({ name: "Spotify" })).toBe("spotify");
    expect(brandSlugFor({ name: "Music", provider: "YouTube Music" })).toBe(
      "youtubemusic"
    );
  });

  it("folds premium and plus into the same mark", () => {
    expect(brandSlugFor({ name: "YouTube Premium" })).toBe("youtube");
    expect(brandSlugFor({ name: "iCloud+" })).toBe("icloud");
  });

  it("leaves a service without a glyph unnamed", () => {
    expect(brandSlugFor({ name: "Krant" })).toBeNull();
    expect(brandSlugFor({ iconKey: "fitness", name: "Fitness" })).toBeNull();
  });
});

describe("brandGlyph", () => {
  it("keeps a bright brand ink and lifts a near-black one", () => {
    expect(brandGlyph("1ED760")).toBe("#1ED760");
    expect(brandGlyph("000000")).toBe("#F6F7FB");
  });
});
