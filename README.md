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
cp .env.example .env   # Supabase 값은 환율 기능을 만들 때 채운다
```

### 확인 명령

```bash
npm run typecheck   # TypeScript 검사
npm run lint        # ESLint + Prettier
npm test            # 단위 테스트 (돈 계산·포맷)
npm run format      # 코드 자동 정렬
```

### 앱 실행

Unistyles 같은 네이티브 모듈을 쓰므로 **Expo Go로는 실행할 수 없고 개발 빌드가 필요하다.**
개발 빌드는 한 번 설치해 두면, 코드를 고칠 때마다 다시 빌드하지 않고 화면에 바로 반영된다. 네이티브 라이브러리를 추가했을 때만 다시 빌드한다.

#### iPhone에서 (Mac 없이, EAS 클라우드 빌드)

Apple Developer Program(연 $99) 가입이 필요하다.

```bash
npx eas-cli@latest device:create                                  # 링크를 iPhone에서 열어 기기 등록
npx eas-cli@latest build --profile development --platform ios     # 완료 후 링크·QR로 설치
```

1. iPhone 설정 → 개인정보 보호 및 보안 → **개발자 모드** 켜기 (재시작 필요)
2. 컴퓨터에서 `npx expo start` 실행
3. iPhone의 Tradger 개발 빌드를 열고 QR 코드를 스캔 (같은 Wi-Fi가 아니면 `npx expo start --tunnel`)

#### Mac이 있을 때

```bash
npm run ios      # iOS 시뮬레이터 (무료)
npx expo run:ios --device   # 연결한 iPhone (무료 Apple ID로도 가능, 7일마다 재설치)
```

#### Android

```bash
npm run android  # 에뮬레이터 또는 USB 연결 기기 (Android Studio 필요)
npx eas-cli@latest build --profile development --platform android  # 클라우드 빌드 후 APK 설치
```

### DB 스키마를 바꿨을 때

`src/core/db/schema.ts`를 고친 뒤 마이그레이션을 만든다. 앱은 시작할 때 자동으로 적용한다.

```bash
npm run db:generate
```

### EAS 연결 (처음 한 번)

```bash
npx eas-cli@latest login     # expo.dev에서 만든 계정으로 로그인
npx eas-cli@latest whoami    # 로그인 확인
npx eas-cli@latest init      # expo.dev에 프로젝트 생성, 프로젝트 ID 출력
```

- 출력된 프로젝트 ID를 `app.config.ts`의 `EAS_PROJECT_ID`에 넣는다.
- 첫 iOS 빌드 전에 `app.config.ts`의 `APP_ID`(현재 `com.tradger.app`)를 확정한다. 스토어에 올린 뒤에는 바꿀 수 없다.
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
