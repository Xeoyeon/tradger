import DecimalBase from 'decimal.js';

import { BASE_CURRENCY, getCurrency, type CurrencyCode } from './currency';

// 금액 계산 전용 Decimal. 큰 금액 × 소수 8자리 환율도 잘리지 않도록 정밀도를 넉넉히 둔다.
export const Decimal = DecimalBase.clone({ precision: 40, rounding: DecimalBase.ROUND_HALF_UP });
export type DecimalValue = InstanceType<typeof Decimal>;

/** 환율 저장 정밀도: 소수점 아래 최대 8자리 (02 문서 V-09) */
export const RATE_DECIMALS = 8;

export class MoneyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MoneyError';
  }
}

const AMOUNT_PATTERN = /^\d+(\.\d+)?$/;

function assertSafeInteger(value: number): number {
  if (!Number.isSafeInteger(value)) {
    throw new MoneyError(`금액이 너무 큽니다: ${value}`);
  }
  return value;
}

function assertRate(rate: string): DecimalValue {
  if (!AMOUNT_PATTERN.test(rate)) {
    throw new MoneyError(`환율 형식이 올바르지 않습니다: ${rate}`);
  }
  const value = new Decimal(rate);
  if (value.lte(0)) {
    throw new MoneyError('환율은 0보다 커야 합니다.');
  }
  return value;
}

/**
 * 입력한 금액 문자열 → 최소 단위 정수 (02 문서 V-01, V-04).
 * 소수점은 `.`만 받는다. 기기 언어별 구분자 변환은 입력 컴포넌트가 맡는다.
 *
 * @example parseAmount('25.50', 'USD') // 2550
 * @example parseAmount('15000', 'IDR') // 1500000 (ISO 자릿수 2로 저장)
 */
export function parseAmount(input: string, currency: CurrencyCode): number {
  const { inputDigits, minorUnit } = getCurrency(currency);
  const normalized = input.trim();
  if (!AMOUNT_PATTERN.test(normalized)) {
    throw new MoneyError(`금액 형식이 올바르지 않습니다: ${input}`);
  }
  const fraction = normalized.split('.')[1] ?? '';
  if (fraction.length > inputDigits) {
    throw new MoneyError(`${currency}는 소수 ${inputDigits}자리까지 입력할 수 있습니다.`);
  }
  return assertSafeInteger(new Decimal(normalized).mul(Decimal.pow(10, minorUnit)).toNumber());
}

/** 최소 단위 정수 → 금액. toMajor(2550, 'USD') → 25.5 */
export function toMajor(amountMinor: number, currency: CurrencyCode): DecimalValue {
  return new Decimal(amountMinor).div(Decimal.pow(10, getCurrency(currency).minorUnit));
}

/**
 * 외화 금액 × 환율 → 원화 최소 단위 정수 (02 문서 V-28, V-29).
 * 원 미만은 반올림하고, 0.5는 0에서 먼 쪽으로 보낸다.
 *
 * @param rate 외화 1단위당 원화 (10진 문자열)
 * @example toBaseAmount(2550, 'USD', '1380.00') // 35190
 */
export function toBaseAmount(amountMinor: number, currency: CurrencyCode, rate: string): number {
  const rateValue = assertRate(rate);
  if (currency === BASE_CURRENCY) {
    return amountMinor;
  }
  return assertSafeInteger(
    toMajor(amountMinor, currency)
      .mul(rateValue)
      .mul(Decimal.pow(10, getCurrency(BASE_CURRENCY).minorUnit))
      .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
      .toNumber(),
  );
}

/**
 * 두 금액에서 실효 환율을 계산한다 (02 문서 V-16).
 * 환전 기록은 "낸 원화 + 받은 외화"가 기준이고, 환율은 여기서 계산한 값이다.
 *
 * @example deriveRate(690000, 50000, 'USD') // '1380'
 */
export function deriveRate(
  baseAmountMinor: number,
  amountMinor: number,
  currency: CurrencyCode,
): string {
  const amount = toMajor(amountMinor, currency);
  if (amount.lte(0)) {
    throw new MoneyError('외화 금액은 0보다 커야 합니다.');
  }
  return toMajor(baseAmountMinor, BASE_CURRENCY)
    .div(amount)
    .toDecimalPlaces(RATE_DECIMALS, Decimal.ROUND_HALF_UP)
    .toString();
}

/**
 * 화면에서 입력한 표시 단위 환율 → 저장용 1단위 환율 (02 문서 V-08).
 *
 * @example rateFromDisplay('905.12', 'JPY') // '9.0512' (100엔 = 905.12원)
 */
export function rateFromDisplay(displayRate: string, currency: CurrencyCode): string {
  return assertRate(displayRate)
    .div(getCurrency(currency).rateDisplayUnit)
    .toDecimalPlaces(RATE_DECIMALS, Decimal.ROUND_HALF_UP)
    .toString();
}

/**
 * 저장용 1단위 환율 → 화면 표시 단위 환율.
 *
 * @example rateToDisplay('9.0512', 'JPY') // Decimal(905.12)
 */
export function rateToDisplay(rate: string, currency: CurrencyCode): DecimalValue {
  return assertRate(rate).mul(getCurrency(currency).rateDisplayUnit);
}
