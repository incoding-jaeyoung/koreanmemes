# 캐릭터 기술 데이터 파싱 가이드

## 작업 흐름

1. `docs/data/cha-XX.html` 파일을 받음
2. 아래 스크립트를 `/tmp/parse-char.js`로 저장
3. `CHARACTER_SLUG`와 `HTML_FILE` 변수만 바꿔서 실행
4. `node /tmp/parse-char.js`

---

## 캐릭터 slug ↔ HTML 파일 대응표

| HTML 파일   | character_slug     | 캐릭터명       |
|------------|-------------------|--------------|
| cha-01.html | akira-yuki        | Akira Yuki   |
| cha-02.html | pai-chan           | Pai Chan     |
| cha-03.html | lau-chan           | Lau Chan     |
| cha-04.html | wolf-hawkfield     | Wolf Hawkfield |
| cha-05.html | jeffry-mcwild      | Jeffry McWild |
| cha-06.html | kage-maru          | Kage-Maru    |
| cha-07.html | sarah-bryant       | Sarah Bryant |
| cha-08.html | jacky-bryant       | Jacky Bryant |
| cha-09.html | shun-di            | Shun Di      |
| cha-10.html | lion-rafale        | Lion Rafale  |
| cha-11.html | aoi-umenokouji     | Aoi Umenokoji |
| cha-12.html | lei-fei            | Lei-Fei      |
| cha-13.html | vanessa-lewis      | Vanessa Lewis |
| cha-14.html | brad-burns         | Brad Burns   |
| cha-15.html | goh-hinogami       | Goh Hinogami |
| cha-16.html | eileen             | Eileen       |
| cha-17.html | el-blaze           | El Blaze     |
| cha-18.html | taka-arashi        | Taka-Arashi  |
| cha-19.html | jean-kujo          | Jean Kujo    |

---

## 커맨드 이미지 → 토큰 변환표

| 이미지 파일명         | 토큰  | 의미         |
|--------------------|------|------------|
| cursor-one.png     | `1`  | ↙ 하단 왼쪽  |
| cursor-two.png     | `2`  | ↓ 하단      |
| cursor-three.png   | `3`  | ↘ 하단 오른쪽 |
| cursor-four.png    | `4`  | ← 왼쪽      |
| cursor-six.png     | `6`  | → 오른쪽    |
| cursor-seven.png   | `7`  | ↖ 상단 왼쪽  |
| cursor-eight.png   | `8`  | ↑ 상단      |
| cursor-nine.png    | `9`  | ↗ 상단 오른쪽 |
| cursor-b-two.png   | `b2` | 반원 하단 입력 |
| cursor-b-six.png   | `b6` | 반원 오른쪽 입력|

> 새로운 cursor 이미지가 발견되면 이 표와 스크립트 cursorMap에 추가할 것

---

## HTML 테이블 컬럼 순서

| 인덱스 | 컬럼명      | DB 필드          |
|------|-----------|----------------|
| 0    | 기술명      | name           |
| 1    | 커맨드      | command        |
| 2    | 공격 판정   | hit_level      |
| 3    | 대미지      | damage         |
| 4    | 발생        | startup        |
| 5    | 지속        | active         |
| 6    | 전체        | total          |
| 7    | 가드        | recovery       |
| 8    | 히트        | hit_adv        |
| 9    | C-히트      | counter_adv    |
| 10   | 앉아 히트   | crouch_hit_adv |
| 11   | 앉아 C-히트 | crouch_counter_adv |
| 12   | 경직 C      | stun           |
| 13   | 회피 방향   | evade_dir      |
| 14   | 술 깨기     | throw_break    |
| 15   | 비고        | notes          |

카테고리 구분 행: `colspan="17"` 또는 `colspan="16"` + `class="xl68"` 인 tr

---

## 파싱 스크립트 (전체)

```javascript
// =============================================
// 사용법: CHARACTER_SLUG와 HTML_FILE만 수정 후
//   node /tmp/parse-char.js
// =============================================

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// ── 수정할 부분 ──────────────────────────────
const CHARACTER_SLUG = 'pai-chan';           // 위 대응표 참고
const HTML_FILE = '/Users/damanegi/Desktop/dev/dev-vf6/docs/data/cha-02.html';
const VIDEO_ID = 'TBD';                     // 나중에 어드민에서 설정 가능
// ─────────────────────────────────────────────

// 환경변수 로드
const envFile = fs.readFileSync('/Users/damanegi/Desktop/dev/dev-vf6/.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL'];
const SUPABASE_KEY = env['SUPABASE_SERVICE_ROLE_KEY'] || env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Supabase 환경변수 없음');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Prefer': 'return=minimal',
};

// 커맨드 이미지 → 토큰 매핑
const cursorMap = {
  'cursor-one':   '1',
  'cursor-two':   '2',
  'cursor-three': '3',
  'cursor-four':  '4',
  'cursor-six':   '6',
  'cursor-seven': '7',
  'cursor-eight': '8',
  'cursor-nine':  '9',
  'cursor-b-two': 'b2',
  'cursor-b-six': 'b6',
};

const html = fs.readFileSync(HTML_FILE, 'utf8');
const $ = cheerio.load(html);

// 커맨드 td 파싱 (이미지 → 토큰 변환)
function parseCommand($td) {
  let result = '';
  $td.contents().each((_, node) => {
    if (node.type === 'text') {
      result += node.data;
    } else if (node.type === 'tag' && node.name === 'img') {
      const src = $(node).attr('src') || '';
      const filename = path.basename(src, '.png');
      result += cursorMap[filename] || src; // 매핑 없으면 원본 (로그 확인용)
    } else if (node.type === 'tag') {
      result += $(node).text();
    }
  });
  return result.trim();
}

// 테이블 파싱
const moves = [];
let currentCategory = '기본 기술';

$('table.skillTable tr').each((_, tr) => {
  const $tr = $(tr);
  const tds = $tr.find('td');

  // 헤더 행 스킵
  if ($tr.find('td.title').length > 0 && tds.length === 1) return; // 단일 title = 섹션 헤더
  if (tds.first().hasClass('title') && tds.length < 3) return;

  // 카테고리 구분 행 감지 (colspan 큰 행)
  const firstTd = tds.first();
  const colspan = parseInt(firstTd.attr('colspan') || '1');
  if (colspan >= 10) {
    const cat = firstTd.text().trim();
    if (cat) currentCategory = cat;
    return;
  }

  // 컬럼 수가 부족하면 스킵
  if (tds.length < 15) return;

  // 첫 번째 td가 기술명
  const name = tds.eq(0).text().trim();
  if (!name || name === '기술명') return; // 헤더 행

  moves.push({
    character_slug: CHARACTER_SLUG,
    name,
    command:             parseCommand(tds.eq(1)),
    category:            currentCategory,
    sort_order:          moves.length,
    hit_level:           tds.eq(2).text().trim(),
    damage:              tds.eq(3).text().trim(),
    startup:             tds.eq(4).text().trim(),
    active:              tds.eq(5).text().trim(),
    total:               tds.eq(6).text().trim(),
    recovery:            tds.eq(7).text().trim(),
    hit_adv:             tds.eq(8).text().trim(),
    counter_adv:         tds.eq(9).text().trim(),
    crouch_hit_adv:      tds.eq(10).text().trim(),
    crouch_counter_adv:  tds.eq(11).text().trim(),
    stun:                tds.eq(12).text().trim(),
    evade_dir:           tds.eq(13).text().trim(),
    throw_break:         tds.eq(14).text().trim(),
    notes:               tds.eq(15) ? tds.eq(15).text().trim() : '',
    start_time: 0,
    end_time: 0,
  });
});

console.log(`파싱 완료: ${moves.length}개 기술`);

// 알 수 없는 cursor 이미지 경고
const unknownCursors = moves
  .map(m => m.command)
  .filter(c => c.includes('cursor-'));
if (unknownCursors.length > 0) {
  console.warn('⚠️  매핑 안 된 cursor 이미지:', [...new Set(unknownCursors)]);
}

async function run() {
  // 1. character_move_videos upsert
  const videoRes = await fetch(`${SUPABASE_URL}/rest/v1/character_move_videos`, {
    method: 'POST',
    headers: { ...headers, 'Prefer': 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ character_slug: CHARACTER_SLUG, video_id: VIDEO_ID }),
  });
  console.log('video upsert:', videoRes.status);

  // 2. 기존 데이터 삭제
  const delRes = await fetch(
    `${SUPABASE_URL}/rest/v1/character_moves?character_slug=eq.${CHARACTER_SLUG}`,
    { method: 'DELETE', headers }
  );
  console.log('기존 삭제:', delRes.status);

  // 3. 배치 삽입 (100개씩)
  const BATCH = 100;
  for (let i = 0; i < moves.length; i += BATCH) {
    const batch = moves.slice(i, i + BATCH);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/character_moves`, {
      method: 'POST',
      headers,
      body: JSON.stringify(batch),
    });
    console.log(`삽입 ${i+1}~${Math.min(i+BATCH, moves.length)}: ${res.status}`);
  }

  console.log('✅ 완료');
}

run().catch(console.error);
```

---

## 실행 전 체크리스트

- [ ] `CHARACTER_SLUG` 수정 (위 대응표 참고)
- [ ] `HTML_FILE` 경로 수정
- [ ] `VIDEO_ID` 설정 (모르면 `'TBD'` 그대로, 어드민에서 나중에 변경 가능)
- [ ] cheerio 설치 여부 확인: `node -e "require('cheerio')"` (오류 시 `npm i -g cheerio`)
- [ ] 실행: `node /tmp/parse-char.js`

---

## 주의사항

- 스크립트는 **기존 데이터를 삭제 후 재삽입**합니다 (타임스탬프도 초기화됨)
- 이미 타임스탬프가 입력된 캐릭터는 재실행 금지
- 새로운 `cursor-*.png` 이미지가 나오면 경고 출력됨 → cursorMap에 추가 필요
- `video_id`가 `'TBD'`이면 move-list 페이지에서 영상이 안 나옴 (어드민에서 설정)
