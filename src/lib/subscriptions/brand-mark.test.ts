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
    expect(brandSlugFor({ name: "Google One" })).toBe("google");
    expect(brandSlugFor({ name: "Claude" })).toBe("claude");
    expect(brandSlugFor({ name: "DAZN" })).toBe("dazn");
    expect(brandSlugFor({ name: "NOW" })).toBe("now");
  });

  it("leaves a service without a glyph unnamed", () => {
    expect(brandSlugFor({ name: "Krant" })).toBeNull();
    expect(brandSlugFor({ iconKey: "fitness", name: "Fitness" })).toBeNull();
    expect(brandSlugFor({ name: "Streamz" })).toBeNull();
    expect(brandSlugFor({ name: "Play Sports" })).toBeNull();
  });

  it("uses the vendored mark for brands Simple Icons does not ship", () => {
    expect(brandSlugFor({ name: "Disney+" })).toBe("disney");
    expect(brandSlugFor({ name: "Prime Video" })).toBe("prime");
    expect(brandSlugFor({ name: "ChatGPT" })).toBe("chatgpt");
    expect(brandSlugFor({ name: "Xbox Game Pass" })).toBe("xbox");
    expect(brandSlugFor({ name: "Nintendo Switch Online" })).toBe("nintendo");
    expect(brandSlugFor({ name: "Microsoft 365" })).toBe("microsoft365");
    expect(brandSlugFor({ name: "VTM GO+" })).toBe("vtmgo");
    expect(brandSlugFor({ name: "Videoland" })).toBe("videoland");
  });
});

describe("brandGlyph", () => {
  it("keeps a bright brand ink, including red, and lifts a near-black one", () => {
    expect(brandGlyph("1ED760")).toBe("#1ED760");
    expect(brandGlyph("FF0000")).toBe("#FF0000");
    expect(brandGlyph("E60012")).toBe("#E60012");
    expect(brandGlyph("E30613")).toBe("#E30613");
    expect(brandGlyph("000000")).toBe("#F6F7FB");
    expect(brandGlyph("181717")).toBe("#F6F7FB");
  });
});
