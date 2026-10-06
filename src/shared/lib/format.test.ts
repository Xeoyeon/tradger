import { formatMoney, formatRate } from './format';

describe('formatMoney', () => {
  it('통화 기호와 천 단위 구분을 붙인다', () => {
    expect(formatMoney(2550, 'USD')).toBe('US$25.50');
    expect(formatMoney(35190, 'KRW')).toBe('₩35,190');
    expect(formatMoney(1234567, 'JPY')).toBe('JP¥1,234,567');
    expect(formatMoney(1234, 'BHD')).toBe('BHD 1.234');
  });

  it('IDR은 저장 자릿수(2)와 상관없이 소수 없이 보여준다', () => {
    expect(formatMoney(1500000, 'IDR')).toBe('Rp 15,000');
  });

  it('겹치는 기호를 구분한다', () => {
    expect(formatMoney(100, 'USD')).toBe('US$1.00');
    expect(formatMoney(100, 'AUD')).toBe('AU$1.00');
    expect(formatMoney(100, 'JPY')).toBe('JP¥100');
    expect(formatMoney(100, 'CNY')).toBe('CN¥1.00');
  });

  it('음수와 기호 생략을 처리한다', () => {
    expect(formatMoney(-2550, 'USD')).toBe('-US$25.50');
    expect(formatMoney(0, 'USD')).toBe('US$0.00');
    expect(formatMoney(2550, 'USD', { symbol: false })).toBe('25.50');
  });
});

describe('formatRate', () => {
  it('표시 단위 기준으로 보여준다', () => {
    expect(formatRate('1380', 'USD')).toBe('1 USD = 1,380.00원');
    expect(formatRate('9.0512', 'JPY')).toBe('100 JPY = 905.12원');
    expect(formatRate('0.0525', 'VND')).toBe('100 VND = 5.25원');
  });
});
