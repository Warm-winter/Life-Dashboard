import { describe, expect, it } from 'vitest'
import { extractKeywords } from '../lib/keywords'

describe('无词典关键词', () => {
  it('空输入返回空数组', () => {
    expect(extractKeywords([])).toEqual([])
    expect(extractKeywords(['', '   '])).toEqual([])
  })

  it('出现两次以上才入选，并按次数排序', () => {
    const text = '今天加班到很晚，加班的时候喝了奶茶。奶茶很好喝，加班让我很累。'
    const words = extractKeywords([text], 5).map((item) => item.word)
    expect(words).toContain('加班')
    expect(words).toContain('奶茶')
    expect(words.indexOf('加班')).toBeLessThan(words.indexOf('奶茶'))
  })

  it('过滤停用词', () => {
    const text = '今天今天今天今天，因为因为因为因为。'
    const words = extractKeywords([text], 5).map((item) => item.word)
    expect(words).not.toContain('今天')
    expect(words).not.toContain('因为')
  })

  it('不会把标点当成词', () => {
    const words = extractKeywords(['！！？？。。。', '，。、；'], 5)
    expect(words).toEqual([])
  })

  it('尊重数量上限', () => {
    const text = '猫猫狗狗猫猫狗狗猫猫狗狗花花草草花花草草'
    expect(extractKeywords([text], 2).length).toBeLessThanOrEqual(2)
  })
})
