# 01. 기술 스택 · 시스템 아키텍처 · 폴더 구조

> **Tradger** — 외화와 원화를 함께 기록하고 보여주는 모바일(iOS/Android) 가계부

## 0. 요구사항과 설계 원칙

### 핵심 요구사항

| # | 요구사항 |
|---|---|
| R1 | 지출/수입을 **외화(USD, JPY 등)와 원화(KRW)로 함께** 표시한다. |
| R2 | 환전할 때의 **환율을 입력했다면 그 환율**로 원화를 계산한다. |
| R3 | 입력한 환율이 없다면 **현재 환율**로 계산한다. |
| R4 | **통화별 총 사용 금액**과 **원화로 환산한 총 사용 금액**을 둘 다 보여준다. |

### 아키텍처를 결정하는 원칙

1. **로컬 우선(Offline-first)**
   해외에서는 데이터가 자주 끊긴다. 기기 안의 SQLite를 원본 데이터로 쓰고, 네트워크는 환율 갱신(이후에는 백업·동기화)에만 쓴다.
2. **환율 스냅샷 저장**
   거래를 저장할 때 *적용한 환율, 환율 출처, 기준 시각, 원화 환산액*을 함께 저장한다. 시세가 바뀌어도 과거 기록의 원화 금액은 바뀌지 않는다. 환전 기록을 고치는 것처럼 그 거래의 근거 데이터가 바뀔 때만 다시 계산한다 ([02 문서 V-15](02-implementation-variables.md#v-15-재계산-규칙)).
3. **부동소수점 금지**
   금액은 **최소 단위 정수**(USD 25.50 → `2550`, KRW 35,190 → `35190`)로, 환율은 **10진 문자열**(`"1380.00"`)로 저장한다. 계산은 decimal 라이브러리로 한다.
4. **환율 API는 서버에서만 호출**
   API 키를 앱에 넣지 않고, 호출 한도를 지키고, 환율 제공처를 앱 업데이트 없이 바꿀 수 있게 하기 위해서다. 앱은 우리 서버에 저장된 환율만 읽는다.
5. **환율 결정 로직은 교체 가능한 체인**
   `직접 입력 → 환전 기록(그 돈을 환전할 때의 환율) → 현재 환율` 순서로 환율을 고른다. 나중에 새 출처를 추가해도 기존 코드를 고치지 않는다.

---

## 1. 기술 스택

### 확정: React Native (Expo) + TypeScript + Supabase

실제 배포 기준 검토와 변경 근거는 [03 문서](03-tech-stack-review.md)에 정리했다.

| 영역 | 선택 | 선택 이유 |
|---|---|---|
| 앱 프레임워크 | **React Native + Expo** (개발 빌드 사용) | iOS/Android를 한 코드베이스로 개발. EAS로 빌드, 스토어 제출, OTA 업데이트까지 처리. 네이티브 모듈을 쓰기 위해 Expo Go 대신 개발 빌드(dev client)로 개발 |
| 언어 | **TypeScript** (strict) | 앱과 서버(Edge Function)를 한 언어로 작성 |
| 라우팅 | **Expo Router** | 파일 기반 라우팅. 탭, 모달, 딥링크 기본 지원 |
| 로컬 DB | **expo-sqlite + Drizzle ORM** | 오프라인 원본 저장소. 타입 안전한 쿼리와 마이그레이션 제공. `useLiveQuery`로 데이터가 바뀌면 화면이 자동 갱신. 환율 캐시도 여기에 저장 |
| 상태 | **Zustand** | 설정(기본 통화, 표시 방식)과 UI 상태. 서버 데이터 캐시 계층(TanStack Query)은 두지 않는다. 화면은 SQLite만 구독한다 |
| 금액 계산 | **decimal.js** | 부동소수점 오차 차단 (`0.1 + 0.2 ≠ 0.3` 문제) |
| 금액 표시 | **자체 통화 포맷터** (`shared/lib/format.ts`) | 통화 테이블의 기호·자릿수로 직접 만든다. Intl 결과가 플랫폼·버전마다 달라지는 것을 막아 iOS와 Android의 표시를 똑같이 맞춘다 |
| 날짜·시간대 | **date-fns v4 + @date-fns/tz** | 해외 현지 시각 기록과 표시 |
| 폼·검증 | **react-hook-form + zod** | 금액·환율 입력 검증. `drizzle-zod`로 DB 스키마에서 검증 스키마 생성 |
| UI 스타일 | **Unistyles 3** | 안정 버전, 타입 안전한 테마, 다크 모드 |
| 차트 | **react-native-gifted-charts** | 카테고리별·통화별 지출 차트 |
| 알림 | **expo-notifications** (로컬 알림) | 카드 청구액 확인 알림. 서버 푸시가 필요 없다 |
| 백업 | **expo-file-system + expo-sharing + expo-document-picker** | 백업 파일 만들기·복원, CSV 내보내기 |
| 보안 | **expo-local-authentication, expo-secure-store** | 생체인증 앱 잠금, 토큰 보관(Phase 2) |
| 백엔드 | **Supabase 서울 리전** (Postgres · Edge Functions · pg_cron) | 환율 수집·저장과 강제 업데이트 설정(`app_config`). 개발·베타는 무료, 정식 출시부터 Pro. Phase 2에서 Auth와 동기화로 확장 |
| 환율 데이터 | **한국수출입은행 환율 API** (주, TTS 포함) + **ExchangeRate-API** (보조) | 원화 기준 공시 환율과 카드 추정용 송금 환율(TTS). 수집 함수는 `x-region`으로 서울에서 실행 |
| 테스트 | **Jest (jest-expo) + React Native Testing Library, Maestro** | 도메인 로직 단위 테스트, 화면 흐름 E2E |
| 코드 품질 | **ESLint + Prettier** | |
| CI/CD | **GitHub Actions + EAS Build / Submit / Update** | PR마다 lint, typecheck, test 실행. 스토어 배포 자동화. OTA는 `fingerprint` 런타임 버전과 단계적 배포 |
| 모니터링 | **Sentry** (`@sentry/react-native`) | 크래시·에러 추적. 금액·메모는 보내지 않음 |
| Phase 2 | **PowerSync**, **Supabase Auth + Apple 로그인 + 카카오 로그인** | SQLite ↔ Postgres 동기화. iOS는 소셜 로그인과 함께 Apple 로그인 같은 동등한 옵션이 필요 |

### 왜 React Native(Expo)인가

- **언어가 하나다.** 앱, 환율 수집 Edge Function, 마이그레이션 스크립트를 모두 TypeScript로 작성한다.
- **OTA 업데이트.** 환율 계산이나 표시 로직의 버그를 스토어 심사 없이 EAS Update로 바로 고칠 수 있다.
- **생태계.** SQLite, 보안 저장소, 생체인증, 차트 같은 가계부에 필요한 모듈이 Expo에서 바로 동작한다.

> 대안: **Flutter**(Dart + drift)도 충분히 좋은 선택이다. 다만 서버까지 한 언어로 맞추고 OTA로 빠르게 고치려면 Expo가 더 유리하다. 비교 근거는 [03 문서 2장](03-tech-stack-review.md#2-앱-프레임워크-비교).

---

## 2. 시스템 아키텍처

### 2.1 전체 구성도

```mermaid
flowchart LR
  subgraph Device["사용자 기기 · iOS / Android"]
    direction TB
    UI["Presentation<br/>Expo Router 화면 · 컴포넌트"]
    APP["Application<br/>훅 · 유스케이스 · Zustand"]
    DOM["Domain (순수 TS)<br/>Money · Currency · RateResolver"]
    DATA["Data<br/>Repository"]
    DB[("SQLite<br/>거래 · 환전 · 카테고리<br/>+ 환율 캐시")]
    UI --> APP
    APP --> DOM
    APP --> DATA
    DATA --> DB
  end

  subgraph Cloud["Supabase · 서울 리전"]
    direction TB
    REST["REST API<br/>읽기 전용 · RLS"]
    PG[("Postgres<br/>exchange_rates · app_config")]
    EF["Edge Function<br/>fetch-rates<br/>(서울에서 실행)"]
    CRON["pg_cron + pg_net<br/>스케줄러"]
    CRON --> EF
    EF --> PG
    REST --> PG
    AUTH["Auth · PowerSync 동기화<br/>(Phase 2)"]
  end

  subgraph Ext["외부 환율 API"]
    KEXIM["한국수출입은행<br/>환율 API (주)"]
    FB["글로벌 환율 API<br/>(폴백)"]
  end

  DATA -- "환율 · 최소 지원 버전 조회 HTTPS" --> REST
  DATA -. "백업 · 동기화 (Phase 2)" .-> AUTH
  EF -- "API Key는 서버에만 보관" --> KEXIM
  EF -. "실패 시" .-> FB
```

| 구성 요소 | 역할 |
|---|---|
| **앱 (Device)** | 모든 거래·환전 기록의 원본. 오프라인에서도 등록·조회·합계 계산이 모두 가능 |
| **SQLite 환율 캐시** | 마지막으로 받은 환율을 저장. 오프라인일 때 "현재 환율"로 사용하고 기준 시각을 함께 표시 |
| **Supabase REST** | 앱이 읽는 유일한 서버 창구 (환율, 최소 지원 버전). 익명(anon) 키로 읽기만 허용(RLS) |
| **Edge Function `fetch-rates`** | 외부 API 호출, 응답 정규화(단위·형식 통일), DB 저장. 수출입은행 API를 국내 IP에서 부르도록 서울 리전에서 실행 |
| **pg_cron** | 정해진 주기로 `fetch-rates` 호출 |
| **외부 환율 API** | 주 소스와 폴백 소스. 앱은 어떤 API를 쓰는지 알지 못한다 |

### 2.2 앱 내부 레이어

```mermaid
flowchart TB
  P["<b>Presentation</b><br/>src/app · features/*/components<br/>화면 · 컴포넌트"]
  A["<b>Application</b><br/>features/*/hooks · features/*/use-cases<br/>useCreateTransaction · useSummary"]
  I["<b>Data</b><br/>features/*/*.repository.ts · features/rates/sources<br/>src/core/db · src/core/api<br/>Repository · RateSource 구현체"]
  D["<b>Domain</b> (순수 TS)<br/>src/core/domain<br/>Money · Currency · convert()<br/>RateResolver · RateSource 인터페이스"]
  P --> A
  A --> I
  A --> D
  I -. "RateSource 인터페이스 구현" .-> D
```

**의존 규칙**

- 의존은 위에서 아래로만 흐르고 최종적으로 Domain에 모인다. **Domain은 다른 어떤 레이어도 import하지 않는다.**
- **Domain은 React Native, SQLite, 네트워크를 모른다.** 순수 TypeScript라서 단위 테스트를 가장 촘촘하게 붙일 수 있다.
- Domain은 `RateSource` 같은 **인터페이스만 정의**하고, Data 레이어가 이를 구현한다. 그래서 환율 출처를 추가하거나 바꿔도 Domain은 그대로다.

### 2.3 환율 결정 흐름 (지출 등록)

`RateResolver`는 등록된 `RateSource`를 우선순위대로 물어보고, 처음으로 환율을 돌려준 출처를 채택한다.

| 우선순위 | RateSource | 언제 쓰이나 | `rate_source` 값 |
|---|---|---|---|
| — | — | 거래 통화가 KRW (환산 없음) | `BASE` |
| 1 | `ManualRateSource` | 거래에 환율이나 원화 금액을 직접 입력한 경우 | `MANUAL` |
| 2 | `ExchangeRateSource` | 환전해 둔 외화에서 결제했고(외화 잔액형 지갑) 그 지갑에 이 통화의 환전 기록이 있는 경우. 그 돈을 환전할 때의 환율 (R2) | `EXCHANGE` |
| 3 | `MarketRateSource` | 그 밖의 경우. 결제할 때 원화가 나가는 카드 결제 포함 (R3) | `MARKET` |

지갑 유형, 여러 번 환전했을 때의 규칙(선입선출), 카드 결제 추정·확정 규칙은 [02 문서 3~4장](02-implementation-variables.md#3-환율-결정-규칙-r2--r3의-핵심)에 정리했다.

```mermaid
sequenceDiagram
  autonumber
  actor U as 사용자
  participant F as 지출 등록 화면
  participant UC as createTransaction
  participant RR as RateResolver
  participant EX as ExchangeRepository
  participant RT as RateRepository
  participant DB as SQLite
  participant SB as Supabase

  U->>F: 25.50 USD · 식비 · 지갑 선택 · (환율 직접 입력)
  F->>UC: submit(input)
  UC->>RR: resolve(USD, 거래일시, walletId, manualRate?)
  alt 환율을 직접 입력함
    RR-->>UC: 1,392.10 · MANUAL
  else 외화 잔액형 지갑에 환전 기록 있음
    RR->>EX: allocate(walletId, USD 25.50, 거래일시)
    EX->>DB: 환전 · 지출 기록 시간순 조회
    DB-->>EX: 환전 ①에서 차감 · 1,380.00 KRW/USD
    RR-->>UC: 1,380.00 · EXCHANGE
  else 원화 결제형 카드 또는 환전 기록 없음 → 현재 환율
    RR->>RT: getRate(USD, 거래일시)
    RT->>DB: 환율 캐시 조회
    opt 캐시 없음 또는 만료 · 온라인
      RT->>SB: GET exchange_rates
      SB-->>RT: 1,385.40 (기준 시각 포함)
      RT->>DB: 캐시 저장
    end
    RT-->>RR: 환율 + 기준 시각
    RR-->>UC: 1,385.40 · MARKET
  end
  UC->>UC: Money.convert (예: 25.50 × 1,380.00 = 35,190원)
  UC->>DB: INSERT transaction (외화 금액 · 적용 환율 · 출처 · 기준 시각 · 원화 환산액)
  DB-->>F: live query로 화면 갱신
  F-->>U: USD 합계와 원화 총액을 함께 표시
```

**합계 계산 (R4)** — 저장된 스냅샷 덕분에 단순한 집계가 된다.

- 통화별 총액: `SUM(amount_minor) GROUP BY currency` → 예) `USD 312.40`, `JPY 18,500`
- 원화 환산 총액: `SUM(base_amount_minor)` → 예) `₩ 612,830`
- 환전 기록은 지출이 아니므로 두 합계에서 모두 뺀다 ([02 문서 V-30](02-implementation-variables.md#v-30-집계-대상)).

### 2.4 환율 수집 파이프라인

```mermaid
sequenceDiagram
  autonumber
  participant C as pg_cron
  participant EF as Edge Function fetch-rates (서울)
  participant K as 한국수출입은행 API
  participant FB as 폴백 환율 API
  participant PG as Postgres exchange_rates
  participant App as 앱 RateRepository

  C->>EF: 평일 정해진 시각에 호출 (pg_net, x-region 서울)
  par 수출입은행 제공 통화 (22개)
    EF->>K: 오늘 환율 요청 (서버에 보관한 API Key)
    K-->>EF: 매매기준율 (고시 전·휴일이면 빈 응답 → 이전 값 유지)
  and 그 외 통화 (VND, TWD 등)
    EF->>FB: 최신 환율 요청 (USD 기준)
    FB-->>EF: 환율 → 원화 기준으로 교차 계산
  end
  opt 수출입은행 장애가 이어짐
    EF->>FB: 해당 통화도 보조 소스로 대체 (출처 기록)
  end
  EF->>EF: 정규화 (1 외화당 원화, JPY(100) 단위 보정, 10진 문자열) + 이상치 검사
  EF->>PG: UPSERT (통화, 기준일, 출처, 고시 시각)
  App->>PG: 앱 실행 · 포그라운드 진입 시 최신 환율 조회 (읽기 전용)
  PG-->>App: 환율 목록 + 기준 시각
  App->>App: SQLite 캐시에 저장해 오프라인에서도 사용
```

> 데이터 소스 선택, 수집 주기, 영업일·공휴일 처리, 이상치 기준은 [02 문서 5장](02-implementation-variables.md#5-현재-환율-데이터-market)에 정리했다.

### 2.5 핵심 데이터 모델 (초안)

```mermaid
erDiagram
  LEDGER ||--o{ WALLET : has
  LEDGER ||--o{ TRANSACTION : contains
  WALLET ||--o{ EXCHANGE : "환전 · 충전"
  WALLET ||--o{ TRANSACTION : "결제"
  CATEGORY ||--o{ TRANSACTION : classifies
  TRANSACTION |o--o{ TRANSACTION : "환불"
  TRANSACTION ||--o{ LOT_ALLOCATION : "사용한 외화"
  EXCHANGE ||--o{ LOT_ALLOCATION : "차감됨"

  LEDGER {
    text id PK "UUID"
    text name "예: 2026 뉴욕 여행"
    text base_currency "KRW"
    text timezone "기본 시간대"
    text created_at
    text updated_at
    text deleted_at "soft delete"
  }
  WALLET {
    text id PK "UUID"
    text ledger_id FK
    text name "예: 현금, 트래블로그"
    text type "FX_BALANCE, KRW_BILLED"
    text est_fee_rate "카드 예상 수수료율"
  }
  EXCHANGE {
    text id PK "UUID"
    text wallet_id FK "들어간 지갑"
    text kind "BUY, CARRY_OVER, RECEIVED"
    text exchanged_at
    text from_currency "KRW"
    int from_amount_minor "690000"
    text to_currency "USD"
    int to_amount_minor "50000 = 500.00 USD"
    int fee_minor "별도 수수료"
    text rate "1380.00 (두 금액에서 계산)"
  }
  TRANSACTION {
    text id PK "UUID"
    text ledger_id FK
    text wallet_id FK
    text category_id FK
    text refund_of_id FK "nullable"
    text type "EXPENSE, INCOME, REFUND"
    text occurred_at "UTC"
    text timezone "거래 현지 시간대"
    int amount_minor "2550 = 25.50 USD"
    text currency "USD"
    text rate "적용 환율 스냅샷"
    text rate_source "BASE, MANUAL, EXCHANGE, MARKET"
    text rate_status "ESTIMATED, CONFIRMED"
    text rate_as_of "환율 기준 시각"
    int base_amount_minor "35190 = 35,190원"
  }
  CATEGORY {
    text id PK "UUID"
    text name
    text icon
  }
  LOT_ALLOCATION {
    text transaction_id FK
    text exchange_id FK
    int amount_minor "이 환전에서 쓴 외화"
  }
  RATE_CACHE {
    text currency PK
    text rate_date PK
    text rate "1 외화당 원화"
    text tts "송금 환율, 카드 추정용"
    text source
    text effective_at "고시 시각"
    text fetched_at
  }
```

- **LEDGER**: 가계부 단위(여행 한 건, 한 달 생활비 등). 기준 통화는 기본 KRW.
- **WALLET**: 결제수단. 기준은 카드 종류가 아니라 돈이 어디서 나가는지다. 외화 잔액형(`FX_BALANCE`: 현금, 트래블카드, 외화통장 체크카드)은 환전으로 잔액이 생기고, 원화 결제형(`KRW_BILLED`: 일반 신용카드, 원화 계좌 체크카드)은 잔액이 없다.
- **EXCHANGE**: 지갑에 외화를 넣은 기록. 환전·충전(`BUY`) 외에 원래 있던 외화(`CARRY_OVER`)와 받은 돈(`RECEIVED`)도 여기에 원화 가치와 함께 넣는다. R2의 "환전했을 때의 환율"이 여기에 저장된다. 같은 지갑에 환율이 다른 돈이 섞이면 먼저 환전한 돈부터 쓴 것으로 계산한다.
- **TRANSACTION**: 거래. 적용 환율, 출처, 추정/확정 상태, 원화 환산액을 **스냅샷**으로 갖는다.
- **LOT_ALLOCATION**: 어떤 거래가 어느 환전의 외화를 얼마나 썼는지. 재계산할 때마다 새로 만드는 파생 데이터.
- **RATE_CACHE**: 서버에서 받은 시장 환율의 로컬 사본.
- 모든 테이블은 **UUID 기본키, `created_at`, `updated_at`, `deleted_at`** 을 둔다. Phase 2에서 동기화를 붙일 때 스키마를 바꾸지 않기 위해서다.

### 2.6 단계별 범위

| 단계 | 범위 | 서버 구성 |
|---|---|---|
| **Phase 1 · MVP** | 로그인 없음 · 가계부/지갑/거래/환전 CRUD · 환율 결정 체인(선입선출) · 카드 결제 추정→청구액 확정 · 통화별 합계와 원화 총액 · 카테고리 통계 · CSV 내보내기와 백업 파일 · 앱 잠금 | Supabase 서울 리전: `exchange_rates`·`app_config` 테이블 + `fetch-rates` 함수 + cron. 개발·베타는 무료, 정식 출시부터 Pro |
| **Phase 2** | 계정 · 클라우드 백업과 다기기 동기화 · 동행자와 공유하는 가계부(정산) · 재환전 환차손익 · 외화 간 환전 · 오늘 환율 기준 재평가 · 영수증 OCR | Supabase Auth(Apple·카카오 로그인) · 사용자 데이터 테이블 + RLS · PowerSync |

---

## 3. 폴더 구조

기능(feature) 단위로 나누고, 여러 기능이 공유하는 순수 로직은 `core/domain`에 둔다.

```text
tradger/
├── src/
│   ├── app/                              # Expo Router: 파일 하나 = 화면 하나
│   │   ├── _layout.tsx                   # 루트 Provider (DB, Theme), 강제 업데이트 확인
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx               # 하단 탭
│   │   │   ├── index.tsx                 # 홈: 통화별 합계 + 원화 총액
│   │   │   ├── transactions.tsx          # 거래 내역
│   │   │   ├── exchanges.tsx             # 환전 기록
│   │   │   └── settings.tsx              # 설정
│   │   ├── ledger/
│   │   │   ├── new.tsx                   # 가계부(여행) 생성
│   │   │   └── [id].tsx
│   │   ├── transaction/
│   │   │   ├── new.tsx                   # 지출/수입 등록 (모달)
│   │   │   └── [id].tsx                  # 상세·수정
│   │   └── exchange/
│   │       ├── new.tsx                   # 환전 기록 등록 (모달)
│   │       └── [id].tsx
│   │
│   ├── features/                         # 기능 모듈: UI + 훅 + 데이터 접근
│   │   ├── ledgers/
│   │   ├── transactions/
│   │   │   ├── components/               # TransactionForm, TransactionListItem ...
│   │   │   ├── hooks/                    # useTransactions, useCreateTransaction
│   │   │   ├── use-cases/                # createTransaction.ts (환율 결정 + 저장)
│   │   │   ├── transaction.repository.ts
│   │   │   └── transaction.types.ts
│   │   ├── exchanges/                    # 환전 기록 (같은 구조)
│   │   ├── wallets/                      # 지갑(외화 잔액형·원화 결제형), 잔액과 선입선출 차감
│   │   ├── rates/                        # 환율 동기화(서버 → SQLite), RateSource 구현체
│   │   │   ├── rate.repository.ts
│   │   │   └── sources/                  # manual.ts, exchange.ts, market.ts
│   │   ├── summary/                      # 통화별 합계, 원화 총액, 차트
│   │   ├── backup/                       # 백업 파일 만들기·복원, CSV 내보내기
│   │   └── settings/
│   │
│   ├── core/
│   │   ├── domain/                       # 순수 TS: RN·DB·네트워크 의존 없음
│   │   │   ├── currency.ts               # 통화 테이블 (저장·입력 자릿수, 기호, 환율 표시 단위)
│   │   │   ├── money.ts                  # 금액 파싱, 외화 → 원화 환산, 반올림, 실효 환율
│   │   │   ├── money.test.ts
│   │   │   ├── fifo.ts                   # 선입선출 차감 (02 문서 V-13)
│   │   │   ├── fifo.test.ts
│   │   │   ├── rate-resolver.ts          # RateSource 체인 실행
│   │   │   └── rate-resolver.test.ts
│   │   ├── db/
│   │   │   ├── schema.ts                 # Drizzle 스키마
│   │   │   ├── client.ts                 # expo-sqlite 연결
│   │   │   └── migrations/               # drizzle-kit 생성물
│   │   ├── api/
│   │   │   ├── supabase.ts               # Supabase 클라이언트
│   │   │   └── rates.api.ts              # exchange_rates 조회
│   │   └── config/                       # 환경변수, 상수
│   │
│   ├── shared/
│   │   ├── ui/                           # Button, AmountText, CurrencyPicker, RateBadge ...
│   │   ├── hooks/
│   │   ├── lib/                          # format.ts(자체 통화 포맷터), date.ts, notifications.ts
│   │   └── theme/
│   │
│   ├── stores/                           # Zustand: 설정, UI 상태
│   └── types/                            # 전역 타입 선언 (*.sql 모듈 등)
│
├── supabase/
│   ├── config.toml
│   ├── migrations/                       # exchange_rates·app_config 테이블, RLS, pg_cron 등록
│   └── functions/
│       └── fetch-rates/
│           ├── index.ts                  # 수집 → 정규화 → upsert
│           ├── normalize.ts
│           └── providers/
│               ├── koreaexim.ts          # 한국수출입은행 (주)
│               └── fallback.ts           # 글로벌 API (폴백)
│
├── tests/
│   └── e2e/                              # Maestro 플로우 (*.yaml)
├── assets/                               # 아이콘, 폰트, 스플래시
├── docs/
│   ├── 01-architecture.md                # 이 문서
│   ├── 02-implementation-variables.md    # 구현 시 고려할 변수
│   ├── 03-tech-stack-review.md           # 기술 스택 검토 (배포 기준)
│   └── 04-beta-and-prelaunch.md          # 출시 전 베타 배포와 사전 홍보
├── .github/
│   └── workflows/
│       └── ci.yml                        # lint · typecheck · test
├── index.ts                              # 앱 진입점 (Unistyles 설정 → Expo Router)
├── app.config.ts                         # Expo 설정 (환경변수 주입)
├── eas.json                              # EAS Build/Submit 프로필
├── drizzle.config.ts
├── tsconfig.json
└── package.json
```

**폴더 규칙**

| 위치 | 넣는 것 | 넣지 않는 것 |
|---|---|---|
| `src/app/` | 라우트 파일. 화면 조립만 담당 | 비즈니스 로직, DB 쿼리 |
| `src/features/*` | 기능별 UI, 훅, 유스케이스, Repository | 다른 기능의 내부 파일 직접 import |
| `src/core/domain/` | 금액·통화·환산·환율 결정 같은 순수 로직 | `react`, `expo-*`, `drizzle` import |
| `src/core/db`, `src/core/api` | DB 연결, 스키마, 외부 클라이언트 | 화면 로직 |
| `src/shared/` | 기능에 무관한 공통 UI·유틸 | 특정 기능에 종속된 코드 |
| `supabase/` | 서버 마이그레이션, Edge Function | 앱 코드 |

- 단위 테스트는 소스 옆에 `*.test.ts`로 둔다. E2E만 `tests/e2e/`에 둔다.
- `src/core/domain/`의 import 금지 규칙은 ESLint(`no-restricted-imports`)로 강제한다.

---

## 다음 문서

- [02. 구현 시 고려해야 할 변수](02-implementation-variables.md): 통화별 소수 자릿수, 반올림, 환전 환율 적용 범위와 선입선출, 카드 결제, 환율 소스와 기준 시점, 오프라인 처리, 시간대, 환불, 백업 등
