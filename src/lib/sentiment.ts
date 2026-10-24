/**
 * 「本地玄学引擎」——不联网、不调用大模型，纯文本统计。
 * 我们把局限写在脸上：它只会数标点、查情感词，但它 0 延迟、0 费用、0 事故率。
 */
import { MOOD_MAP, type MoodKey } from './types'

export interface TextSignals {
  chars: number
  exclam: number
  question: number
  ellipsis: number
  laughs: number
  cries: number
  emoji: number
  lines: number
}

const LAUGH = /(哈{2,}|嘿嘿|嘻嘻|hehe|233+|hhh+)/gi
const CRY = /(呜呜|嘤嘤|哭了|泪目|破防|难受)/g
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{2764}]/gu

export function analyzeSignals(text: string): TextSignals {
  const chars = text.replace(/\s+/g, '').length
  return {
    chars,
    exclam: (text.match(/[！!]/g) ?? []).length,
    question: (text.match(/[？?]/g) ?? []).length,
    ellipsis: (text.match(/(…{1,}|\.{3,}|。{3,})/g) ?? []).length,
    laughs: (text.match(LAUGH) ?? []).length,
    cries: (text.match(CRY) ?? []).length,
    emoji: (text.match(EMOJI) ?? []).length,
    lines: text.split(/\n+/).filter((l) => l.trim()).length,
  }
}

const POSITIVE: [string, number][] = [
  ['开心', 3], ['高兴', 3], ['快乐', 3], ['满足', 2], ['舒服', 2], ['顺利', 2], ['惊喜', 3],
  ['喜欢', 2], ['好看', 2], ['好吃', 2], ['不错', 2], ['值得', 2], ['踏实', 2], ['治愈', 3],
  ['轻松', 2], ['期待', 2], ['成功', 2], ['感谢', 2], ['可爱', 2], ['爽', 2], ['牛', 2], ['稳', 1],
]

const NEGATIVE: [string, number][] = [
  ['累死', 3], ['崩溃', 3], ['焦虑', 3], ['烦', 2], ['难过', 3], ['生气', 3], ['痛苦', 3],
  ['难受', 2], ['压力', 2], ['加班', 1], ['内耗', 2], ['破防', 2], ['失眠', 2], ['委屈', 2],
  ['后悔', 2], ['失败', 3], ['怕', 2], ['慌', 2], ['来不及', 2], ['吵', 2], ['讨厌', 2], ['想哭', 3],
]

export interface LexiconResult {
  /** -1 ~ 1 */
  score: number
  positive: string[]
  negative: string[]
}

export function lexiconSentiment(text: string): LexiconResult {
  let pos = 0
  let neg = 0
  const positive: string[] = []
  const negative: string[] = []
  for (const [word, weight] of POSITIVE) {
    const hits = text.split(word).length - 1
    if (hits > 0) {
      pos += hits * weight
      positive.push(word)
    }
  }
  for (const [word, weight] of NEGATIVE) {
    const hits = text.split(word).length - 1
    if (hits > 0) {
      neg += hits * weight
      negative.push(word)
    }
  }
  const total = pos + neg
  return { score: total === 0 ? 0 : (pos - neg) / total, positive, negative }
}

export interface Personality {
  label: string
  note: string
}

/** 六种「今日人格」，按可信度排序取第一个命中。 */
export function personality(signals: TextSignals, mood: MoodKey): Personality {
  const moodMeta = MOOD_MAP[mood]
  if (signals.laughs >= 2) {
    return { label: '快乐外放型', note: `你笑了 ${signals.laughs} 次，笑声密度超过你 90% 的日子。` }
  }
  if (signals.ellipsis >= 3) {
    return { label: '欲言又止型', note: `出现 ${signals.ellipsis} 处省略号，有些话留在了句号外面。` }
  }
  if (signals.exclam >= 3) {
    return { label: '高能量输出型', note: `${signals.exclam} 个感叹号。系统判定：今天需要被听见。` }
  }
  if (signals.question >= 3) {
    return { label: '十万个为什么型', note: `${signals.question} 个问号。你在跟自己开会。` }
  }
  if (signals.chars > 0 && signals.chars < 40) {
    return { label: '惜字如金型', note: `只写了 ${signals.chars} 个字，但每个字都有重量。` }
  }
  if (signals.cries > 0) {
    return { label: '情绪容器型', note: '检测到低频情绪词，建议今天早点关灯。' }
  }
  return { label: '日常观察员', note: `今日情绪判定：${moodMeta.label}。${moodMeta.quip}。` }
}
