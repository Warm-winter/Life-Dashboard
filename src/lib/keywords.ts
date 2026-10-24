/**
 * 无词典中文关键词提取。
 * 思路：滑动窗口统计 2–4 字片段 → 过滤虚词 → 按「词频 × 长度加成」排序 → 去掉互为子串的冗余。
 * 不联网、不加载词库、结果可复现；效果够用，且敢在界面上承认是「玄学」。
 */

const CJK_RUN = /[\u4e00-\u9fa5]+/g
const MIN_LEN = 2
const MAX_LEN = 4
const MIN_COUNT = 2

/** 出现在词里基本就是虚词的字，含这些字直接丢弃（保证候选词有实义）。 */
const STOP_CHARS = new Set(
  '的了着过是在有和与就都也又还很太更最不没别把被让给对从向于及或而则之其这那哪个们我你他她它们吗呢吧啊呀哦嗯诶唉嘛啦咯哇'.split(''),
)

/** 常见虚词 / 无信息量词组，整词丢弃。 */
const STOP_WORDS = new Set([
  '今天', '昨天', '明天', '现在', '时候', '自己', '我们', '你们', '他们', '这个', '那个', '什么',
  '因为', '所以', '但是', '如果', '可以', '觉得', '感觉', '有点', '还是', '真的', '已经', '没有',
  '一个', '不是', '就是', '然后', '其实', '不过', '当然', '一直', '非常', '特别', '东西', '事情',
  '时间', '地方', '知道', '起来', '出来', '下来', '一下', '一些', '这么', '那么', '怎么', '为什么',
  '多少', '很多', '好像', '似乎', '应该', '需要', '希望', '开始', '结束', '继续', '最后', '这样',
  '那样', '之后', '之前', '以后', '以前', '同时', '另外', '而且', '并且', '虽然', '即使', '无论',
  '只要', '只有', '除了', '关于', '对于', '由于', '通过', '根据', '一会儿', '今天天', '明天天',
])

export interface Keyword {
  word: string
  count: number
}

function isClean(gram: string): boolean {
  if (STOP_WORDS.has(gram)) return false
  for (const ch of gram) {
    if (STOP_CHARS.has(ch)) return false
  }
  return true
}

export function extractKeywords(texts: string[], limit = 12): Keyword[] {
  const counts = new Map<string, number>()

  for (const text of texts) {
    if (!text) continue
    const runs = text.match(CJK_RUN)
    if (!runs) continue
    for (const run of runs) {
      for (let len = MIN_LEN; len <= MAX_LEN; len += 1) {
        for (let i = 0; i + len <= run.length; i += 1) {
          const gram = run.slice(i, i + len)
          if (!isClean(gram)) continue
          counts.set(gram, (counts.get(gram) ?? 0) + 1)
        }
      }
    }
  }

  const scored = [...counts.entries()]
    .filter(([, count]) => count >= MIN_COUNT)
    .map(([word, count]) => ({ word, count, score: count * (1 + 0.35 * (word.length - MIN_LEN)) }))
    .sort((a, b) => b.score - a.score || b.word.length - a.word.length || a.word.localeCompare(b.word, 'zh-Hans-CN'))

  const picked: Keyword[] = []
  for (const item of scored) {
    if (picked.length >= limit) break
    const redundant = picked.some((p) => p.word.includes(item.word) || item.word.includes(p.word))
    if (redundant) continue
    picked.push({ word: item.word, count: item.count })
  }
  return picked
}
