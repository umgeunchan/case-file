// src/assets 아래 이미지를 빌드에 포함시키고, 데이터 파일에 적힌 상대 경로로 찾는다.
// 예: rooms.study.background = 'rooms/study.png' → src/assets/rooms/study.png
const files = import.meta.glob('./assets/**/*.{png,jpg,jpeg,gif,webp,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

export function assetUrl(path: string | undefined): string | undefined {
  if (!path) return undefined;
  const url = files[`./assets/${path}`];
  if (!url) console.warn(`[asset] src/assets/${path} 파일이 없어 플레이스홀더로 표시합니다.`);
  return url;
}
