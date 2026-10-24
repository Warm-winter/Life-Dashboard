import { describe, expect, it } from 'vitest'
import {
  calcPower,
  currentStreak,
  dailySeries,
  heatWeeks,
  longestStreak,
  moodSegments,
  summarize,
  topTags,
} from '../lib/stats'
import type { DiaryEntry, MoodKey } from '../lib/types'

function entry(date: string, body = '今天加班到很晚。', mood: MoodKey = 'calm', tags: string[] = ['工作']): DiaryEntry {
  return {
    id: `e-${date}`,
    date,
    title: '测试',
    body,
    mood,
    weather: 'sunny',
    tags,
    createdAt: new Date(`${date}T10:00:00`).getTime(),
    updatedAt: new Date(`${date}T10:00:00`).getTime(),
  }
}

const TODAY = '2026-10-24'

describe('连续记录天数', () => {
  it('没有记录时是 0', () => {
    expect(currentStreak([], TODAY)).toBe(0)
  })

  it('只有今天是 1', () => {
    expect(currentStreak([entry(TODAY)], TODAY)).toBe(1)
  })

  it('只有昨天也算连着（今天还没写不算断更）', () => {
    expect(currentStreak([entry('2026-10-23')], TODAY)).toBe(1)
  })

  it('断在两天前就归零', () => {
    expect(currentStreak([entry('2026-10-22')], TODAY)).toBe(0)
  })

  it('连续三天计数正确', () => {
    const list = [entry('2026-10-24'), entry('2026-10-23'), entry('2026-10-22')]
    expect(currentStreak(list, TODAY)).toBe(3)
  })

  it('中间断一天就只算到断点', () => {
    const list = [entry('2026-10-24'), entry('2026-10-23'), entry('2026-10-21')]
    expect(currentStreak(list, TODAY)).toBe(2)
  })
})

describe('最长连续', () => {
  it('取全历史最长的一段', () => {
    const list = [
      entry('2026-10-01'),
      entry('2026-10-02'),
      entry('2026-10-03'),
      entry('2026-10-10'),
      entry('2026-10-11'),
    ]
    expect(longestStreak(list)).toBe(3)
  })

  it('空列表是 0', () => {
    expect(longestStreak([])).toBe(0)
  })
})

describe('汇总', () => {
  const list = [entry('2026-10-24', '一二三四五'), entry('2026-10-23', '一二三', 'joy')]

  it('总篇数与总字数', () => {
    const summary = summarize(list, TODAY)
    expect(summary.totalEntries).toBe(2)
    expect(summary.totalChars).toBe(8)
    expect(summary.avgChars).toBe(4)
    expect(summary.activeDays).toBe(2)
  })

  it('情绪指数是各篇情绪分的平均', () => {
    // calm=82, joy=100 → 91
    expect(summarize(list, TODAY).moodIndex).toBe(91)
  })

  it('空数据时情绪指数为 0，战斗力为 0', () => {
    const summary = summarize([], TODAY)
    expect(summary.moodIndex).toBe(0)
    expect(summary.power.score).toBe(0)
    expect(summary.power.rank).toBe('还没开机')
    expect(summary.totalChars).toBe(0)
  })

  it('最近一次记录距今天数', () => {
    expect(summarize([entry('2026-10-21')], TODAY).daysSinceLast).toBe(3)
  })
})

describe('战斗力', () => {
  it('分数被夹在 0-100 之间', () => {
    const many = Array.from({ length: 200 }, (_, index) => entry(`2026-01-${String((index % 28) + 1).padStart(2, '0')}`, '字'.repeat(500)))
    const power = calcPower(many, 30)
    expect(power.score).toBeLessThanOrEqual(100)
    expect(power.score).toBeGreaterThan(50)
    expect(power.rank.length).toBeGreaterThan(0)
  })

  it('零记录时是 0 分', () => {
    expect(calcPower([], 0)).toEqual({ score: 0, rank: '还没开机', tier: 0 })
  })
})

describe('每日序列', () => {
  it('长度正确，缺数据补 0 和 null', () => {
    const series = dailySeries([entry('2026-10-24'), entry('2026-10-22')], 5, TODAY)
    expect(series).toHaveLength(5)
    expect(series[4].date).toBe('2026-10-24')
    expect(series[4].hasEntry).toBe(true)
    expect(series[3].hasEntry).toBe(false)
    expect(series[3].chars).toBe(0)
    expect(series[3].mood).toBeNull()
  })
})

describe('标签与心情构成', () => {
  it('标签按出现次数排序', () => {
    const list = [entry('2026-10-24', 'a', 'calm', ['工作', '猫']), entry('2026-10-23', 'b', 'calm', ['猫'])]
    expect(topTags(list)[0]).toEqual({ tag: '猫', count: 2 })
  })

  it('心情构成跳过 0 并且按分值从高到低', () => {
    const list = [entry('2026-10-24', 'a', 'joy'), entry('2026-10-23', 'b', 'sad')]
    const segments = moodSegments(list)
    expect(segments.map((item) => item.key)).toEqual(['joy', 'sad'])
    expect(segments.every((item) => item.count > 0)).toBe(true)
  })
})

describe('热力图', () => {
  it('总是返回 weeks × 7 个格子', () => {
    const weeks = heatWeeks([entry('2026-10-24')], 12, TODAY)
    expect(weeks).toHaveLength(12)
    expect(weeks.every((week) => week.length === 7)).toBe(true)
    expect(weeks.flat().some((point) => point.date === '2026-10-24')).toBe(true)
  })
})
