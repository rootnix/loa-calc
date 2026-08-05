import { getRefineTable, getTargetList } from './data';
import { fixed } from './refine';

describe('완갑 재련 데이터', () => {
  it('1강부터 25강까지 제공한다', () => {
    expect(getTargetList('wristguard', undefined)).toEqual(
      Array.from({ length: 25 }, (_, index) => index + 1)
    );
  });

  it('1강 필수 재료를 기존 장비 템플릿과 동일하게 제공한다', () => {
    const table = getRefineTable(
      'wristguard',
      undefined,
      1,
      false,
      false
    );

    expect(table?.baseProb).toBe(0.15);
    expect(table?.additionalProb).toBe(0);
    expect(table?.amount).toEqual({
      운명파편: 14500,
      운명의파괴석결정: 600,
      운명의수호석결정: 1800,
      위운돌: 30,
      상급아비도스: 22,
      골드: 5200,
    });
  });

  it('모든 구간에서 풀숨 시 기본 성공률만큼 추가한다', () => {
    const tiers = [
      { from: 1, to: 5, amount: 20, probability: 0.00375 },
      { from: 6, to: 10, amount: 25, probability: 0.002 },
      { from: 11, to: 15, amount: 30, probability: 0.05 / 60 },
      { from: 16, to: 20, amount: 35, probability: 0.03 / 70 },
      { from: 21, to: 25, amount: 40, probability: 0.015 / 80 },
    ];

    tiers.forEach(({ from, to, amount, probability }) => {
      for (let target = from; target <= to; target += 1) {
        const table = getRefineTable(
          'wristguard',
          undefined,
          target,
          true,
          true
        );
        const totalAdditionalProb = Object.values(table?.breath ?? {}).reduce(
          (sum, [maxAmount, probabilityPerItem]) =>
            sum + maxAmount * probabilityPerItem,
          0
        );

        expect(table?.additionalProb).toBe(0);
        expect(table?.breath).toEqual({
          용암: [amount, probability],
          빙하: [amount, probability],
        });
        expect(totalAdditionalProb).toBeCloseTo(table!.baseProb, 10);
      }
    });
  });

  it('1강 풀숨 재련 확률을 15%에서 30%로 계산한다', () => {
    const table = getRefineTable(
      'wristguard',
      undefined,
      1,
      false,
      false
    );
    const result = fixed(
      table!,
      {
        운명파편: 0,
        운명의파괴석결정: 0,
        운명의수호석결정: 0,
        위운돌: 0,
        상급아비도스: 0,
        골드: 1,
        용암: 0,
        빙하: 0,
      },
      {},
      0,
      0,
      2
    );

    expect(result.path[0].totalProb).toBe(0.3);
    expect(result.path[0].breathes).toEqual({ 용암: 20, 빙하: 20 });
  });

  it('25강 재련 필수 재료를 보존한다', () => {
    const table = getRefineTable(
      'wristguard',
      undefined,
      25,
      false,
      false
    );
    expect(table?.baseProb).toBe(0.015);
    expect(table?.amount).toEqual({
      운명파편: 38470,
      운명의파괴석결정: 1280,
      운명의수호석결정: 4015,
      위운돌: 94,
      상급아비도스: 62,
      골드: 13160,
    });
  });

  it('가격 정보에 골드 단가가 없어도 재련 골드를 1:1로 계산한다', () => {
    const table = getRefineTable(
      'wristguard',
      undefined,
      1,
      false,
      false
    );
    const result = fixed(
      table!,
      { 용암: 0, 빙하: 0 },
      {},
      0,
      1,
      0
    );

    expect(result.price).toBe(5200);
    expect(result.path[0].price).toBe(5200);
  });
});
