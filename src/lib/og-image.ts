import { loadDefaultJapaneseParser } from "budoux";
import satori from "satori";
import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

interface OGImageOptions {
  title: string;
  date: string;
  locale?: "ja" | "en";
}

type SatoriNode = {
  type: "div" | "span" | "img";
  props: {
    style?: Record<string, string | number>;
    children?: SatoriNode[] | string;
    src?: string;
  };
};

const japaneseParser = loadDefaultJapaneseParser();

const COLORS = {
  background: "#070b10",
  line: "#163040",
  text: "#eef7fb",
  muted: "#78909d",
  cyan: "#8ac8ff",
};

function node(
  type: SatoriNode["type"],
  style: Record<string, string | number>,
  children?: SatoriNode[] | string
): SatoriNode {
  return { type, props: { style, children } };
}

function imageNode(
  src: string,
  style: Record<string, string | number>
): SatoriNode {
  return { type: "img", props: { src, style } };
}

function splitLongPhrase(phrase: string, maxLength: number): string[] {
  const result: string[] = [];
  let rest = phrase;

  while (rest.length > maxLength) {
    result.push(rest.slice(0, maxLength));
    rest = rest.slice(maxLength);
  }
  if (rest) result.push(rest);
  return result;
}

function phraseWidth(value: string): number {
  return Array.from(value).reduce(
    (width, character) => width + (/^[A-Za-z0-9]$/u.test(character) ? 0.55 : 1),
    0
  );
}

function wrapJapaneseTitle(title: string, maxWidth = 15.5): string[] {
  const phrases = japaneseParser.parse(title);
  const lines: string[] = [];
  let current = "";

  for (const phrase of phrases) {
    if (phraseWidth(phrase) > maxWidth) {
      if (current) {
        lines.push(current);
        current = "";
      }
      lines.push(...splitLongPhrase(phrase, Math.floor(maxWidth)));
      continue;
    }

    if (current && phraseWidth(current) + phraseWidth(phrase) > maxWidth) {
      lines.push(current);
      current = "";
    }
    current += phrase;
  }

  if (current) lines.push(current);
  return lines;
}

function wrapEnglishTitle(title: string, maxLength = 28): string[] {
  const words = title.trim().split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (current && current.length + word.length + 1 > maxLength) {
      lines.push(current);
      current = "";
    }
    current += current ? ` ${word}` : word;
  }

  if (current) lines.push(current);
  return lines;
}

function wrapTitle(title: string, locale: "ja" | "en"): string[] {
  const lines = locale === "ja"
    ? wrapJapaneseTitle(title)
    : wrapEnglishTitle(title);

  if (lines.length <= 3) return lines;
  const visible = lines.slice(0, 3);
  visible[2] = `${visible[2].replace(/[\s。、、,.!?！？]+$/u, "")}…`;
  return visible;
}

function digitalRainDataUri(): string {
  let seed = 0x5f3759df;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const drops: string[] = [];

  Array.from({ length: 108 }, () => {
    const blockCount = Math.floor(6 + random() * 20);
    const top = Math.round(random() * 630 - blockCount * 8);
    const left = Math.round(random() * 1196);

    Array.from({ length: blockCount }, (_, index) => {
      const fade = 1 - index / blockCount;
      const alpha = Math.max(0.06, (0.12 + random() * 0.22) * fade);
      drops.push(
        `<rect x="${left}" y="${top + index * 8}" width="4" height="4" fill="${COLORS.text}" fill-opacity="${alpha.toFixed(3)}"/>`
      );
    });
  });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">${drops.join("")}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export async function generateOGImage({
  title,
  date,
  locale = "ja",
}: OGImageOptions): Promise<Buffer> {
  const fontInter = await readFile(
    resolve(process.cwd(), "./public/fonts/Inter-Bold.ttf")
  );
  const fontNoto = await readFile(
    resolve(process.cwd(), "./public/fonts/NotoSansJP-Bold.ttf")
  );
  const rainDataUri = digitalRainDataUri();
  const titleLines = wrapTitle(title, locale);
  const titleFont = locale === "ja" ? "Noto Sans JP" : "Inter";
  const titleSize = titleLines.length <= 2 ? 72 : 60;

  const svg = await satori(
    node("div", {
      position: "relative",
      display: "flex",
      width: "100%",
      height: "100%",
      overflow: "hidden",
      backgroundColor: COLORS.background,
      color: COLORS.text,
      fontFamily: "Inter",
    }, [
      imageNode(rainDataUri, {
        position: "absolute",
        top: 0,
        left: 0,
        width: 1200,
        height: 630,
      }),
      node("div", {
        position: "absolute",
        top: 58,
        bottom: 58,
        left: 54,
        width: 3,
        backgroundColor: COLORS.cyan,
        boxShadow: `0 0 24px ${COLORS.cyan}`,
      }),
      node("div", {
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        width: "100%",
        height: "100%",
        padding: "58px 72px 52px 92px",
      }, [
        node("div", {
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          width: "100%",
          color: COLORS.muted,
          fontSize: 21,
          letterSpacing: 1.5,
        }, [
          node("span", {}, date),
        ]),
        node("div", {
          display: "flex",
          flexDirection: "column",
          gap: 0,
          width: 1000,
          marginTop: 145,
        }, [
          node("div", {
            display: "flex",
            flexDirection: "column",
            gap: 4,
            color: COLORS.text,
            fontFamily: titleFont,
            fontSize: titleSize,
            fontWeight: 700,
            lineHeight: 1.18,
            letterSpacing: locale === "ja" ? 1 : -1,
          }, titleLines.map((line) => node("div", {}, line))),
        ]),
      ]),
    ]),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Inter",
          data: fontInter,
          weight: 700,
          style: "normal",
        },
        {
          name: "Noto Sans JP",
          data: fontNoto,
          weight: 700,
          style: "normal",
        },
      ],
    }
  );

  return sharp(Buffer.from(svg)).png().toBuffer();
}
