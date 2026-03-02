# @lan 작업: 번역 키 K-pop 용으로 정리

> ⚠️ **중요: 이 작업은 반드시 복사된 새 프로젝트(dev-kpop)에서만 수행하세요.**
> 현재 작업 중인 디렉토리가 `dev-kpop` 인지 먼저 확인하세요.
> `dev-vf6` (원본 프로젝트)에서는 절대 실행하지 마세요.

## 배경

이 프로젝트는 격투게임 커뮤니티(VF6)에서 K-pop 커뮤니티로 전환됩니다.
`messages/ko.json`, `messages/en.json`, `messages/ja.json` 에서 게임 특화 키를 제거하고
K-pop 커뮤니티에 맞는 키를 추가해주세요.

## 삭제할 키

아래 네임스페이스/키가 존재하면 3개 언어 모두에서 제거:
- `characters` 관련 키
- `ranks` 관련 키
- `moves` 관련 키
- 게임 캐릭터명, 기술명 등 게임 고유 명사

## 추가할 키

3개 언어(ko/en/ja) 모두에 추가:

```json
// 네임스페이스: "kpop"
{
  "kpop": {
    "artistTag": "아티스트 / 그룹",
    "artistTagPlaceholder": "아티스트 또는 그룹명 입력",
    "filterByArtist": "아티스트별 보기"
  },
  "hero": {
    "title": "글로벌 케이팝 팬 커뮤니티",
    "subtitle": "전 세계 팬들과 K-pop 이야기를 나눠보세요",
    "cta": "지금 시작하기"
  }
}
```

영어(en.json):
```json
{
  "kpop": {
    "artistTag": "Artist / Group",
    "artistTagPlaceholder": "Enter artist or group name",
    "filterByArtist": "Filter by artist"
  },
  "hero": {
    "title": "Global K-pop Fan Community",
    "subtitle": "Share your K-pop stories with fans worldwide",
    "cta": "Get Started"
  }
}
```

일본어(ja.json):
```json
{
  "kpop": {
    "artistTag": "アーティスト / グループ",
    "artistTagPlaceholder": "アーティストまたはグループ名を入力",
    "filterByArtist": "アーティストで絞り込む"
  },
  "hero": {
    "title": "グローバルK-popファンコミュニティ",
    "subtitle": "世界中のファンとK-popの話を共有しましょう",
    "cta": "今すぐ始める"
  }
}
```

## 확인

- 3개 언어 파일의 키 구조가 동일한지 확인
- 기존 공통 키(auth, profile, board, gallery, nav 등)는 유지
- 삭제한 키를 참조하는 컴포넌트가 있으면 목록으로 보고해줘 (직접 수정하지 말고)
