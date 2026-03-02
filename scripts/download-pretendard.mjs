#!/usr/bin/env node
/**
 * Pretendard Variable woff2를 public/fonts에 다운로드합니다.
 * 한 번 실행 후 빌드/서빙 시 같은 오리진에서 폰트가 로드되어 더 빠르고,
 * font-display: optional 과 함께 사용하면 로드 중 폰트가 바뀌는 현상을 줄일 수 있습니다.
 */
import { mkdir, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "public", "fonts");
const url =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/variable/woff2/PretendardVariable.woff2";
const outPath = join(outDir, "PretendardVariable.woff2");

async function download() {
  await mkdir(outDir, { recursive: true });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(outPath, buf);
  console.log(`Saved: ${outPath}`);
}

download().catch((e) => {
  console.error(e);
  process.exit(1);
});
