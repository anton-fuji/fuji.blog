import satori from "satori";
import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

interface OGImageOptions {
  title: string;
  date: string;
}

export async function generateOGImage({
  title,
  date,
}: OGImageOptions): Promise<Buffer> {
  // フォント読み込み
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
        // ▼ 全体の背景
        style: {
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000000", // 完全な黒ベース
          backgroundImage: "radial-gradient(circle at 0% 0%, #1e1b4b 0%, #000000 60%)",
          color: "#ffffff",
          padding: "80px",
        },
        children: [
          // ▼ メインタイトル (画面のど真ん中)
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center", // 中央揃え
                justifyContent: "center",
                textAlign: "center",
                width: "100%",
              },
              children: [
                // タイトル本体
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: "60px",
                      fontWeight: 700,
                      lineHeight: 1.3,
                      fontFamily: 'Inter, "Noto Sans JP"',
                      color: "#f0ffff",
                      // 長文対応
                      display: "-webkit-box",
                      lineClamp: 3,
                      webkitLineClamp: 3,
                      webkitBoxOrient: "vertical",
                      overflow: "hidden",
                      // 背景が暗いので、文字が発光しているようなドロップシャドウ
                      textShadow: "0 0 30px rgba(255, 255, 255, 0.3)",
                    },
                    children: title,
                  },
                },
                // 日付 
                {
                  type: "div",
                  props: {
                    style: {
                      marginTop: "32px",
                      fontSize: "18px",
                      color: "#94a3b8", // 暗めのグレーで目立たせない
                      fontFamily: 'Inter, "Noto Sans JP"',
                      letterSpacing: "0.05em",
                    },
                    children: date.replace(/-/g, '-'), // 2024-01-01 -> 2024.01.01 表記に変更
                  },
                },
              ],
            },
          },

          // ▼ 右下のロゴ (絶対配置)
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                bottom: "30px",
                right: "60px",
                display: "flex",
                alignItems: "center",
              },
              children: [
                // ブログ名
                {
                  type: "span",
                  props: {
                    children: "fuji.blog",
                    style: {
                      fontSize: "25px",
                      fontWeight: 400,
                      color: "#2d1224",
                      fontFamily: "Inter", // 英字フォント優先
                      letterSpacing: "-0.02em", // 少し詰めてロゴっぽく
                    },
                  },
                },
              ],
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
