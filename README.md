# Tradger

외화와 원화를 함께 기록하고 보여주는 모바일(iOS/Android) 가계부.

- 지출을 외화(USD, JPY 등)와 원화로 동시에 표시
- 환전할 때의 환율을 입력하면 그 환율로, 없으면 현재 환율로 원화 환산
- 통화별 총액과 원화 환산 총액을 함께 제공

## 문서

| 문서 | 내용 |
|---|---|
| [01. 기술 스택 · 시스템 아키텍처 · 폴더 구조](docs/01-architecture.md) | 확정 기술 스택, React Native(Expo) + SQLite + Supabase 구성, 환율 결정 흐름, 데이터 모델 |
| [02. 구현 시 고려해야 할 변수](docs/02-implementation-variables.md) | 통화 자릿수·반올림, 환전 환율 적용 범위·선입선출, 카드 결제 추정/확정, 환율 소스·기준 시점, 오프라인, 시간대, 환불, 백업, 경계 케이스 테스트 |
| [03. 기술 스택 검토 — 실제 배포 기준](docs/03-tech-stack-review.md) | 프레임워크 비교(RN·Flutter·네이티브·KMP), 구성 요소별 유지/변경, 스토어 요건, 출시 파이프라인, 운영·비용·리스크 |
| [04. 출시 전 베타 배포와 사전 홍보](docs/04-beta-and-prelaunch.md) | TestFlight·Play 비공개 테스트, 일정 예시, 대기자 명단과 모집 채널, 피드백 수집, 베타 주의점 |

## 개발 환경

| 항목 | 버전 |
|---|---|
| Expo SDK | 57 (React Native 0.86, React 19.2) |
| Node.js | 22 |
| 패키지 매니저 | npm |

### 처음 받았을 때

```bash
npm install
cp .env.example .env   # 값은 아래 "EAS 연결" 이후에 채운다
```

### 확인 명령

```bash
npm run typecheck   # TypeScript 검사
npm run lint        # ESLint + Prettier
npm test            # 단위 테스트 (돈 계산·포맷)
npm run format      # 코드 자동 정렬
```

### 앱 실행

Unistyles, SQLite 같은 네이티브 모듈을 쓰므로 **Expo Go로는 실행할 수 없고 개발 빌드가 필요하다.**

```bash
# 방법 1: 내 컴퓨터에서 빌드 (iOS는 macOS + Xcode, Android는 Android Studio 필요)
npm run ios
npm run android

# 방법 2: EAS 클라우드에서 개발 빌드를 만들어 폰에 설치한 뒤
npx eas-cli@latest build --profile development --platform android
npx expo start --dev-client
```

### DB 스키마를 바꿨을 때

`src/core/db/schema.ts`를 고친 뒤 마이그레이션을 만든다. 앱은 시작할 때 자동으로 적용한다.

```bash
npm run db:generate
```

### EAS 연결 (처음 한 번)

```bash
npx eas-cli@latest login
npx eas-cli@latest init      # 발급된 프로젝트 ID를 .env의 EAS_PROJECT_ID에 넣는다
```

- 출시 전에 `app.config.ts`의 `bundleIdentifier`·`package`(현재 `com.tradger.app`)를 실제 값으로 정한다. 스토어에 올린 뒤에는 바꿀 수 없다.
- 빌드 프로필은 `eas.json`에 있다: `development`(개발 빌드), `preview`(내부 테스트, Android APK), `production`(스토어).

### 폴더

```text
src/
├── app/            # 화면 (Expo Router)
├── features/       # 기능별 모듈 (기능을 만들면서 추가)
├── core/
│   ├── domain/     # 돈 계산 같은 순수 로직 (React Native·DB 의존 금지)
│   └── db/         # Drizzle 스키마, 마이그레이션, DB 연결
├── shared/         # 공통 UI, 포맷터, 테마
└── types/
supabase/
└── migrations/     # 서버 DB (환율, 앱 설정)
```

자세한 구조와 규칙은 [01 문서 3장](docs/01-architecture.md#3-폴더-구조)을 따른다.
