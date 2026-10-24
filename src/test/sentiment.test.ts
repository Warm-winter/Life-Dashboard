import { describe, expect, it } from 'vitest'
import { analyzeSignals, lexiconSentiment, personality } from '../lib/sentiment'

describe('文本特征', () => {
  it('数字数标点', () => {
    const signals = analyzeSignals('太好了！！！真的吗？？哈哈哈哈哈……')
    expect(signals.exclam).toBe(3)
    expect(signals.question).toBe(2)
    expect(signals.laughs).toBeGreaterThanOrEqual(1)
    expect(signals.ellipsis).toBeGreaterThanOrEqual(1)
  })

  it('空白不计算进字数', () => {
    expect(analyzeSignals('一 二\n三').chars).toBe(3)
  })

  it('空文本不炸', () => {
    const signals = analyzeSignals('')
    expect(signals.chars).toBe(0)
    expect(signals.lines).toBe(0)
  })
})

describe('情感词典', () => {
  it('正面词得正分', () => {
    expect(lexiconSentiment('今天很开心，很满足，很治愈').score).toBeGreaterThan(0)
  })

  it('负面词得负分', () => {
    expect(lexiconSentiment('崩溃了，很焦虑，想哭').score).toBeLessThan(0)
  })

  it('没有情绪词时是 0', () => {
    expect(lexiconSentiment('今天星期三，中午吃了米饭。').score).toBe(0)
  })
})

describe('今日人格', () => {
  it('笑声多判定为快乐外放型', () => {
    const text = '哈哈哈哈，真的笑死，嘿嘿'
    expect(personality(analyzeSignals(text), 'joy').label).toBe('快乐外放型')
  })

  it('省略号多判定为欲言又止型', () => {
    const text = '有些话不知道该不该说……算了……明天再讲……'
    expect(personality(analyzeSignals(text), 'neutral').label).toBe('欲言又止型')
  })

  it('字数极少判定为惜字如金型', () => {
    expect(personality(analyzeSignals('还行。'), 'calm').label).toBe('惜字如金型')
  })

  it('普通长文本回落到日常观察员', () => {
    const text =
      '今天按时下班，回家路上买了一把青菜，煮了面，看了两集剧。洗澡的时候想到明天要交的表格还没填，心里有点沉，但还是先把头发吹干再睡。'
    expect(analyzeSignals(text).chars).toBeGreaterThan(40)
    expect(personality(analyzeSignals(text), 'calm').label).toBe('日常观察员')
  })
})
