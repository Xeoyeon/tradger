import {
  MoneyError,
  deriveRate,
  parseAmount,
  rateFromDisplay,
  rateToDisplay,
  toBaseAmount,
  toMajor,
} from './money';

// 기대값은 02 문서 12장 "경계 케이스 테스트 목록"을 따른다.
describe('parseAmount', () => {
  it('통화별 최소 단위 정수로 바꾼다', () => {
    expect(parseAmount('25.50', 'USD')).toBe(2550);
    expect(parseAmount('30000', 'KRW')).toBe(30000);
    expect(parseAmount('1500', 'JPY')).toBe(1500);
  });

  it('소수 3자리 통화를 처리한다 (#4)', () => {
    expect(parseAmount('1.234', 'BHD')).toBe(1234);
  });

  it('IDR은 소수를 받지 않고 ISO 자릿수(2)로 저장한다 (#5)', () => {
    expect(parseAmount('15000', 'IDR')).toBe(1500000);
    expect(() => parseAmount('15000.5', 'IDR')).toThrow(MoneyError);
  });

  it('입력 자릿수를 넘거나 형식이 틀리면 거부한다', () => {
    expect(() => parseAmount('1.234', 'USD')).toThrow(MoneyError);
    expect(() => parseAmount('10.5', 'KRW')).toThrow(MoneyError);
    expect(() => parseAmount('-5', 'USD')).toThrow(MoneyError);
    expect(() => parseAmount('1,000', 'USD')).toThrow(MoneyError);
    expect(() => parseAmount('', 'USD')).toThrow(MoneyError);
  });
});

describe('toMajor', () => {
  it('최소 단위 정수를 금액으로 되돌린다', () => {
    expect(toMajor(2550, 'USD').toString()).toBe('25.5');
    expect(toMajor(1234, 'BHD').toString()).toBe('1.234');
  });
});

describe('toBaseAmount', () => {
  it('KRW는 환산하지 않는다 (#1)', () => {
    expect(toBaseAmount(30000, 'KRW', '1')).toBe(30000);
  });

  it('USD 25.50 × 1,380 = 35,190원 (#2)', () => {
    expect(toBaseAmount(2550, 'USD', '1380.00')).toBe(35190);
  });

  it('JPY 1,500 × 9.0512 = 13,577원 (#3)', () => {
    expect(toBaseAmount(1500, 'JPY', '9.0512')).toBe(13577);
  });

  it('0.5원은 올린다 (#6)', () => {
    expect(toBaseAmount(50, 'USD', '1381.00')).toBe(691);
  });

  it('거래마다 반올림한다 (#17)', () => {
    const perRow = toBaseAmount(99, 'USD', '1385.40');
    expect(perRow).toBe(1372);
    expect(perRow * 3).toBe(4116);
  });

  it('카드 추정: TTS × (1 + 수수료율) (#23)', () => {
    const estimatedRate = '1417.187'; // 1,399.00 × 1.013
    expect(toBaseAmount(10000, 'USD', estimatedRate)).toBe(141719);
  });

  it('큰 금액도 정밀도를 잃지 않는다', () => {
    expect(toBaseAmount(100_000_000_00, 'USD', '1399.12345678')).toBe(139_912_345_678);
  });

  it('잘못된 환율은 거부한다', () => {
    expect(() => toBaseAmount(100, 'USD', '0')).toThrow(MoneyError);
    expect(() => toBaseAmount(100, 'USD', 'abc')).toThrow(MoneyError);
  });
});

describe('deriveRate', () => {
  it('낸 원화 ÷ 받은 외화로 실효 환율을 구한다 (V-16)', () => {
    expect(deriveRate(690000, 50000, 'USD')).toBe('1380');
    expect(deriveRate(420000, 30000, 'USD')).toBe('1400');
  });

  it('소수 8자리에서 반올림한다', () => {
    expect(deriveRate(1000000, 72464, 'USD')).toBe('1379.99558401');
  });
});

describe('표시 단위 환율', () => {
  it('100엔당 환율을 1엔당으로 저장한다 (V-08)', () => {
    expect(rateFromDisplay('905.12', 'JPY')).toBe('9.0512');
    expect(rateFromDisplay('1380.00', 'USD')).toBe('1380');
  });

  it('저장된 환율을 표시 단위로 되돌린다', () => {
    expect(rateToDisplay('9.0512', 'JPY').toFixed(2)).toBe('905.12');
  });
});
