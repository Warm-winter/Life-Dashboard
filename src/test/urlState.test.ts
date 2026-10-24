import { describe, expect, it } from 'vitest'
import { buildHash, buildSearch, buildUrl, fxLabel, nearestFx, parseFx, parseView } from '../lib/urlState'
import { DEFAULT_FX } from '../lib/types'

describe('特效档位解析', () => {
  it('就近吸附到六个合法档位', () => {
    expect(nearestFx(0.1)).toBe(0)
    expect(nearestFx(0.4)).toBe(0.5)
    expect(nearestFx(1.6)).toBe(2)
    expect(nearestFx(3.4)).toBe(3.5)
    expect(nearestFx(4.9)).toBe(5)
  })

  it('非法数字回落默认档', () => {
    expect(nearestFx(Number.NaN)).toBe(DEFAULT_FX)
  })

  it('缺参数时用默认档', () => {
    expect(parseFx('')).toBe(DEFAULT_FX)
    expect(parseFx('?foo=1')).toBe(DEFAULT_FX)
    expect(parseFx('?fx=')).toBe(DEFAULT_FX)
    expect(parseFx('?fx=abc')).toBe(DEFAULT_FX)
  })

  it('合法参数直接生效', () => {
    expect(parseFx('?fx=5')).toBe(5)
    expect(parseFx('?fx=0')).toBe(0)
    expect(parseFx('?fx=3.5')).toBe(3.5)
  })
})

describe('视图解析', () => {
  it('认识三个视图', () => {
    expect(parseView('#/write')).toBe('write')
    expect(parseView('#/dashboard')).toBe('dashboard')
    expect(parseView('#/entries')).toBe('entries')
  })

  it('未知路由回落写日记', () => {
    expect(parseView('')).toBe('write')
    expect(parseView('#/whatever')).toBe('write')
    expect(parseView('#/dashboard?x=1')).toBe('dashboard')
  })
})

describe('链接拼装', () => {
  it('hash 与 search 一致', () => {
    expect(buildHash('dashboard')).toBe('#/dashboard')
    expect(buildSearch(3.5)).toBe('?fx=3.5')
    expect(buildUrl('dashboard', 5)).toBe('/?fx=5#/dashboard')
  })

  it('价格文案保留两位小数', () => {
    expect(fxLabel(0)).toBe('¥0.00')
    expect(fxLabel(3.5)).toBe('¥3.50')
    expect(fxLabel(5)).toBe('¥5.00')
  })
})
