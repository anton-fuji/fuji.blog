import satori from "satori";
import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

interface OGImageOptions {
  title: string;
  date: string;
  locale?: "ja" | "en";
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

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#fdfcf9",
          color: "#27272a",
          padding: "64px",
          border: "1px solid #e7e5e1",
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                fontFamily: "Inter",
                fontSize: "24px",
                color: "#71717a",
              },
              children: [
                {
                  type: "span",
                  props: {
                    children: "fuji.blog",
                    style: {
                      fontWeight: 700,
                    },
                  },
                },
                {
                  type: "span",
                  props: {
                    children: `${locale.toUpperCase()} / ${date}`,
                    style: {
                      fontWeight: 700,
                    },
                  },
                },
              ],
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                gap: "28px",
                width: "100%",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      width: "72px",
                      height: "1px",
                      backgroundColor: "#a1a1aa",
                    },
                  },
                },
                {
                  type: "div",
                  props: {
                    children: title,
                    style: {
                      maxWidth: "980px",
                      fontSize: "68px",
                      fontWeight: 700,
                      lineHeight: 1.12,
                      fontFamily: 'Inter, "Noto Sans JP"',
                      color: "#27272a",
                      display: "-webkit-box",
                      lineClamp: 3,
                      webkitLineClamp: 3,
                      webkitBoxOrient: "vertical",
                      overflow: "hidden",
                    },
                  },
                },
              ],
            },
          },
          {
            type: "div",
            props: {
              children: locale === "ja" ? "Osaka / Web engineer" : "Osaka / Web engineer",
              style: {
                fontFamily: "Inter",
                fontSize: "22px",
                fontWeight: 700,
                color: "#71717a",
              },
            },
          },
        ],
      },
    },
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

  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return png;
}
