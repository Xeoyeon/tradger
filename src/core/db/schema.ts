import { index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// 01 문서 2.5 데이터 모델.
// - 금액은 최소 단위 정수(*_minor), 환율은 10진 문자열.
// - 모든 사용자 데이터 테이블은 UUID 키와 created_at / updated_at / deleted_at을 둔다 (Phase 2 동기화 대비).
// - 시각은 UTC ISO 문자열.

const nowIso = () => new Date().toISOString();

const timestamps = {
  createdAt: text('created_at').notNull().$defaultFn(nowIso),
  updatedAt: text('updated_at').notNull().$defaultFn(nowIso).$onUpdateFn(nowIso),
  deletedAt: text('deleted_at'),
};

export const ledgers = sqliteTable('ledgers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  baseCurrency: text('base_currency').notNull().default('KRW'),
  timezone: text('timezone').notNull(),
  ...timestamps,
});

export const wallets = sqliteTable(
  'wallets',
  {
    id: text('id').primaryKey(),
    ledgerId: text('ledger_id')
      .notNull()
      .references(() => ledgers.id),
    name: text('name').notNull(),
    // FX_BALANCE: 환전해 둔 외화에서 나감 / KRW_BILLED: 결제할 때 원화에서 나감 (02 문서 V-12)
    type: text('type', { enum: ['FX_BALANCE', 'KRW_BILLED'] }).notNull(),
    // 원화 결제형 카드의 예상 수수료율 (예: '0.013') (02 문서 V-18)
    estFeeRate: text('est_fee_rate').notNull().default('0'),
    ...timestamps,
  },
  (t) => [index('wallets_ledger_idx').on(t.ledgerId)],
);

export const exchanges = sqliteTable(
  'exchanges',
  {
    id: text('id').primaryKey(),
    walletId: text('wallet_id')
      .notNull()
      .references(() => wallets.id),
    // BUY: 환전·충전 / CARRY_OVER: 원래 있던 외화 / RECEIVED: 받은 돈 (02 문서 V-34)
    kind: text('kind', { enum: ['BUY', 'CARRY_OVER', 'RECEIVED'] }).notNull(),
    exchangedAt: text('exchanged_at').notNull(),
    fromCurrency: text('from_currency').notNull().default('KRW'),
    fromAmountMinor: integer('from_amount_minor').notNull(),
    toCurrency: text('to_currency').notNull(),
    toAmountMinor: integer('to_amount_minor').notNull(),
    feeMinor: integer('fee_minor').notNull().default(0),
    // 두 금액에서 계산한 실효 환율 (02 문서 V-16)
    rate: text('rate').notNull(),
    memo: text('memo'),
    ...timestamps,
  },
  (t) => [index('exchanges_wallet_time_idx').on(t.walletId, t.toCurrency, t.exchangedAt)],
);

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon'),
  sortOrder: integer('sort_order').notNull().default(0),
  ...timestamps,
});

export const transactions = sqliteTable(
  'transactions',
  {
    id: text('id').primaryKey(),
    ledgerId: text('ledger_id')
      .notNull()
      .references(() => ledgers.id),
    walletId: text('wallet_id')
      .notNull()
      .references(() => wallets.id),
    categoryId: text('category_id').references(() => categories.id),
    refundOfId: text('refund_of_id'),
    type: text('type', { enum: ['EXPENSE', 'INCOME', 'REFUND'] }).notNull(),
    occurredAt: text('occurred_at').notNull(),
    timezone: text('timezone').notNull(),
    amountMinor: integer('amount_minor').notNull(),
    currency: text('currency').notNull(),
    // 적용 환율 스냅샷과 그 근거 (02 문서 V-11, V-15)
    rate: text('rate').notNull(),
    rateSource: text('rate_source', { enum: ['BASE', 'MANUAL', 'EXCHANGE', 'MARKET'] }).notNull(),
    rateStatus: text('rate_status', { enum: ['ESTIMATED', 'CONFIRMED'] }).notNull(),
    rateAsOf: text('rate_as_of'),
    baseAmountMinor: integer('base_amount_minor').notNull(),
    memo: text('memo'),
    ...timestamps,
  },
  (t) => [
    index('transactions_ledger_time_idx').on(t.ledgerId, t.occurredAt),
    index('transactions_wallet_time_idx').on(t.walletId, t.currency, t.occurredAt),
  ],
);

// 어느 환전의 외화를 얼마나 썼는지 (선입선출 결과, 02 문서 V-13).
// 재계산할 때마다 다시 만드는 파생 데이터라 동기화 대상이 아니다.
export const lotAllocations = sqliteTable(
  'lot_allocations',
  {
    transactionId: text('transaction_id')
      .notNull()
      .references(() => transactions.id),
    exchangeId: text('exchange_id')
      .notNull()
      .references(() => exchanges.id),
    amountMinor: integer('amount_minor').notNull(),
  },
  (t) => [primaryKey({ columns: [t.transactionId, t.exchangeId] })],
);

// 서버에서 받은 시장 환율의 로컬 사본 (02 문서 V-20 ~ V-24)
export const rateCache = sqliteTable(
  'rate_cache',
  {
    currency: text('currency').notNull(),
    rateDate: text('rate_date').notNull(),
    // 매매기준율, 1 외화당 원화
    rate: text('rate').notNull(),
    // 송금 보낼 때 환율. 카드 결제 추정에 쓴다 (수출입은행 제공 통화만)
    tts: text('tts'),
    source: text('source').notNull(),
    effectiveAt: text('effective_at').notNull(),
    fetchedAt: text('fetched_at').notNull().$defaultFn(nowIso),
  },
  (t) => [primaryKey({ columns: [t.currency, t.rateDate] })],
);
