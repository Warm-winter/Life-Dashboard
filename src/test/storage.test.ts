import { describe, expect, it } from 'vitest'
import { parseEntries, parseSettings, sanitizeEntry, serializeEntries } from '../lib/storage'
import { DEFAULT_SETTINGS } from '../lib/types'

const raw = JSON.stringify({
  version: 1,
  entries: [
    { date: '2026-10-24', title: '今天', body: '正文', mood: 'joy', weather: 'sunny', tags: ['工作', '工作'], createdAt: 1, updatedAt: 5 },
    { date: '2026-10-24', title: '旧版', body: '旧', mood: 'sad', weather: 'rain', tags: [], createdAt: 1, updatedAt: 3 },
    { date: '2026-10-22', title: '前天', body: 'x', mood: 'invalid', weather: 'nope', tags: ['猫'], createdAt: 2, updatedAt: 2 },
  ],
})

describe('存储解析', () => {
  it('空值返回空数组', () => {
    expect(parseEntries(null)).toEqual([])
    expect(parseEntries('')).toEqual([])
  })

  it('坏 JSON 不抛错', () => {
    expect(parseEntries('{not json')).toEqual([])
  })

  it('同一天只保留更新时间最晚的一条', () => {
    const entries = parseEntries(raw)
    expect(entries).toHaveLength(2)
    expect(entries[0].title).toBe('今天')
  })

  it('按日期倒序排列', () => {
    expect(parseEntries(raw).map((item) => item.date)).toEqual(['2026-10-24', '2026-10-22'])
  })

  it('非法枚举值会回落为默认值', () => {
    const fallback = parseEntries(raw)[1]
    expect(fallback.mood).toBe('neutral')
    expect(fallback.weather).toBe('sunny')
  })

  it('标签会去重并去掉空白', () => {
    expect(parseEntries(raw)[0].tags).toEqual(['工作'])
  })

  it('缺少合法日期时整条丢弃', () => {
    expect(sanitizeEntry({ date: '昨天' })).toBeNull()
    expect(sanitizeEntry(null)).toBeNull()
    expect(sanitizeEntry('x')).toBeNull()
  })

  it('序列化之后还能读回来', () => {
    const entries = parseEntries(raw)
    expect(parseEntries(serializeEntries(entries))).toEqual(entries)
  })
})

describe('设置解析', () => {
  it('坏数据回落默认值', () => {
    expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS)
    expect(parseSettings('oops')).toEqual(DEFAULT_SETTINGS)
    expect(parseSettings('{"fx":99}').fx).toBe(DEFAULT_SETTINGS.fx)
  })

  it('合法档位会被保留', () => {
    expect(parseSettings('{"fx":5,"sound":true,"seeded":true}')).toEqual({ fx: 5, sound: true, seeded: true })
  })
})
