// 통화 메타데이터 (02 문서 V-01, V-02, V-05, V-08)
//
// - minorUnit: 저장용 소수 자릿수. ISO 4217 값 그대로 쓴다.
// - inputDigits: 입력·표시용 소수 자릿수. 실제로 쓰는 단위 기준 (IDR, TWD는 0).
// - rateDisplayUnit: 환율을 보여줄 때의 외화 단위 (100엔 = 905.12원).

export type CurrencyCode =
  | 'KRW'
  | 'USD'
  | 'EUR'
  | 'JPY'
  | 'CNY'
  | 'GBP'
  | 'HKD'
  | 'TWD'
  | 'VND'
  | 'THB'
  | 'SGD'
  | 'PHP'
  | 'IDR'
  | 'MYR'
  | 'AUD'
  | 'NZD'
  | 'CAD'
  | 'CHF'
  | 'BHD'
  | 'KWD';

export interface Currency {
  code: CurrencyCode;
  nameKo: string;
  symbol: string;
  minorUnit: number;
  inputDigits: number;
  rateDisplayUnit: 1 | 100;
}

export const BASE_CURRENCY: CurrencyCode = 'KRW';

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  KRW: {
    code: 'KRW',
    nameKo: '대한민국 원',
    symbol: '₩',
    minorUnit: 0,
    inputDigits: 0,
    rateDisplayUnit: 1,
  },
  USD: {
    code: 'USD',
    nameKo: '미국 달러',
    symbol: 'US$',
    minorUnit: 2,
    inputDigits: 2,
    rateDisplayUnit: 1,
  },
  EUR: {
    code: 'EUR',
    nameKo: '유로',
    symbol: '€',
    minorUnit: 2,
    inputDigits: 2,
    rateDisplayUnit: 1,
  },
  JPY: {
    code: 'JPY',
    nameKo: '일본 엔',
    symbol: 'JP¥',
    minorUnit: 0,
    inputDigits: 0,
    rateDisplayUnit: 100,
  },
  CNY: {
    code: 'CNY',
    nameKo: '중국 위안',
    symbol: 'CN¥',
    minorUnit: 2,
    inputDigits: 2,
    rateDisplayUnit: 1,
  },
  GBP: {
    code: 'GBP',
    nameKo: '영국 파운드',
    symbol: '£',
    minorUnit: 2,
    inputDigits: 2,
    rateDisplayUnit: 1,
  },
  HKD: {
    code: 'HKD',
    nameKo: '홍콩 달러',
    symbol: 'HK$',
    minorUnit: 2,
    inputDigits: 2,
    rateDisplayUnit: 1,
  },
  TWD: {
    code: 'TWD',
    nameKo: '대만 달러',
    symbol: 'NT$',
    minorUnit: 2,
    inputDigits: 0,
    rateDisplayUnit: 1,
  },
  VND: {
    code: 'VND',
    nameKo: '베트남 동',
    symbol: '₫',
    minorUnit: 0,
    inputDigits: 0,
    rateDisplayUnit: 100,
  },
  THB: {
    code: 'THB',
    nameKo: '태국 바트',
    symbol: '฿',
    minorUnit: 2,
    inputDigits: 2,
    rateDisplayUnit: 1,
  },
  SGD: {
    code: 'SGD',
    nameKo: '싱가포르 달러',
    symbol: 'S$',
    minorUnit: 2,
    inputDigits: 2,
    rateDisplayUnit: 1,
  },
  PHP: {
    code: 'PHP',
    nameKo: '필리핀 페소',
    symbol: '₱',
    minorUnit: 2,
    inputDigits: 2,
    rateDisplayUnit: 1,
  },
  IDR: {
    code: 'IDR',
    nameKo: '인도네시아 루피아',
    symbol: 'Rp',
    minorUnit: 2,
    inputDigits: 0,
    rateDisplayUnit: 100,
  },
  MYR: {
    code: 'MYR',
    nameKo: '말레이시아 링깃',
    symbol: 'RM',
    minorUnit: 2,
    inputDigits: 2,
    rateDisplayUnit: 1,
  },
  AUD: {
    code: 'AUD',
    nameKo: '호주 달러',
    symbol: 'AU$',
    minorUnit: 2,
    inputDigits: 2,
    rateDisplayUnit: 1,
  },
  NZD: {
    code: 'NZD',
    nameKo: '뉴질랜드 달러',
    symbol: 'NZ$',
    minorUnit: 2,
    inputDigits: 2,
    rateDisplayUnit: 1,
  },
  CAD: {
    code: 'CAD',
    nameKo: '캐나다 달러',
    symbol: 'CA$',
    minorUnit: 2,
    inputDigits: 2,
    rateDisplayUnit: 1,
  },
  CHF: {
    code: 'CHF',
    nameKo: '스위스 프랑',
    symbol: 'CHF',
    minorUnit: 2,
    inputDigits: 2,
    rateDisplayUnit: 1,
  },
  BHD: {
    code: 'BHD',
    nameKo: '바레인 디나르',
    symbol: 'BHD',
    minorUnit: 3,
    inputDigits: 3,
    rateDisplayUnit: 1,
  },
  KWD: {
    code: 'KWD',
    nameKo: '쿠웨이트 디나르',
    symbol: 'KWD',
    minorUnit: 3,
    inputDigits: 3,
    rateDisplayUnit: 1,
  },
};

export function isCurrencyCode(value: string): value is CurrencyCode {
  return Object.prototype.hasOwnProperty.call(CURRENCIES, value);
}

export function getCurrency(code: CurrencyCode): Currency {
  return CURRENCIES[code];
}
