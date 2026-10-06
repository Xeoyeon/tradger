import { getCurrency, type CurrencyCode } from '@/core/domain/currency';
import { Decimal, rateToDisplay, toMajor, type DecimalValue } from '@/core/domain/money';

// 금액·환율 표시는 Intl에 맡기지 않고 통화 테이블로 직접 만든다.
// iOS와 Android에서 표시가 똑같아야 하기 때문이다 (03 문서 3장).

const RATE_DISPLAY_DIGITS = 2;

function groupThousands(integerPart: string): string {
  return integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatNumber(value: DecimalValue, digits: number): string {
  const fixed = value.abs().toFixed(digits, Decimal.ROUND_HALF_UP);
  const [integerPart = '0', fractionPart] = fixed.split('.');
  const grouped = groupThousands(integerPart);
  return fractionPart ? `${grouped}.${fractionPart}` : grouped;
}

function withSymbol(symbol: string, body: string): string {
  // 'CHF', 'Rp'처럼 글자로 끝나는 기호는 숫자와 띄운다.
  return /[A-Za-z]$/.test(symbol) ? `${symbol} ${body}` : `${symbol}${body}`;
}

/**
 * 최소 단위 정수 금액을 화면용 문자열로 만든다.
 *
 * @example formatMoney(2550, 'USD') // 'US$25.50'
 * @example formatMoney(35190, 'KRW') // '₩35,190'
 * @example formatMoney(1500000, 'IDR') // 'Rp 15,000'
 */
export function formatMoney(
  amountMinor: number,
  currency: CurrencyCode,
  options: { symbol?: boolean } = {},
): string {
  const { symbol, inputDigits } = getCurrency(currency);
  const amount = toMajor(amountMinor, currency).toDecimalPlaces(inputDigits, Decimal.ROUND_HALF_UP);
  const body = formatNumber(amount, inputDigits);
  const text = options.symbol === false ? body : withSymbol(symbol, body);
  return amount.isNegative() && !amount.isZero() ? `-${text}` : text;
}

/**
 * 저장된 1단위 환율을 표시 단위 기준 문자열로 만든다 (02 문서 V-08, V-09).
 *
 * @example formatRate('1380', 'USD') // '1 USD = 1,380.00원'
 * @example formatRate('9.0512', 'JPY') // '100 JPY = 905.12원'
 */
export function formatRate(rate: string, currency: CurrencyCode): string {
  const { rateDisplayUnit } = getCurrency(currency);
  const value = formatNumber(rateToDisplay(rate, currency), RATE_DISPLAY_DIGITS);
  return `${rateDisplayUnit} ${currency} = ${value}원`;
}
