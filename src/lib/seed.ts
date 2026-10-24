/**
 * 首次进入时灌入的虚构范文（19 天）。
 * 目的：打开看板就是满的，不用现场憋稿；且数据形态有起伏，图才好看。
 */
import { addDays, todayKey } from './format'
import type { DiaryEntry, MoodKey, WeatherKey } from './types'

interface SeedSpec {
  offset: number
  hour: number
  minute: number
  title: string
  body: string
  mood: MoodKey
  weather: WeatherKey
  tags: string[]
}

const SPECS: SeedSpec[] = [
  {
    offset: 0,
    hour: 21,
    minute: 12,
    title: '项目终于上线了',
    body: '下午四点提交最后一次构建，六点收到一句「可以了」。整层楼只剩空调的声音，我居然没有一点想欢呼的冲动，只是把杯子洗干净、把椅子推回桌子下面。\n回家路上买了一瓶冰可乐，站在小区门口喝完。风有点凉，但很舒服。',
    mood: 'joy',
    weather: 'cloudy',
    tags: ['工作', '上线', '可乐'],
  },
  {
    offset: 1,
    hour: 22,
    minute: 40,
    title: '加班到十点，关东煮救我',
    body: '需求改了第三遍，改到最后我已经不记得最初想做什么了。楼下便利店只剩最后一串萝卜，收银员小哥说「今天你来得比我还准时」。\n汤是热的，人是麻的。',
    mood: 'calm',
    weather: 'cloudy',
    tags: ['加班', '工作', '关东煮'],
  },
  {
    offset: 2,
    hour: 19,
    minute: 5,
    title: '地铁上听完一整张专辑',
    body: '没有刷手机，从头听到尾。第七首有个很轻的鼓点，像雨落在铁皮棚上。到站的时候我还坐着，多坐了一站再走回来。\n今天没有特别的事，但觉得挺好。',
    mood: 'calm',
    weather: 'sunny',
    tags: ['音乐', '地铁'],
  },
  {
    offset: 3,
    hour: 20,
    minute: 18,
    title: '妈妈的电话',
    body: '她说家里的桂花开了，说今年开得比去年早，说不用挂念。我们聊了十一分钟，其中九分钟在讲我表弟的工作。\n挂掉以后我在阳台上站了一会儿，楼下有人在遛狗。',
    mood: 'joy',
    weather: 'sunny',
    tags: ['家人', '桂花'],
  },
  {
    offset: 4,
    hour: 23,
    minute: 47,
    title: '第五版方案又被否了',
    body: '理由很充分，我甚至无法反驳。只是改到第五版的时候，我有点分不清是方案的问题还是我的问题。\n睡前把文档关了，没有再打开。',
    mood: 'anxious',
    weather: 'cloudy',
    tags: ['工作', '方案', '深夜'],
  },
  {
    offset: 5,
    hour: 18,
    minute: 30,
    title: '忘带伞，鞋湿了一整天',
    body: '早上出门还是晴天，下午突然下大了。袜子在鞋里泡了六个小时，开会的时候我一直盯着窗外的雨发呆。\n回来路上买了一把，十五块，很丑，但很结实。',
    mood: 'angry',
    weather: 'rain',
    tags: ['天气', '下雨', '通勤'],
  },
  {
    offset: 6,
    hour: 21,
    minute: 3,
    title: '楼下那只橘猫又来蹭饭',
    body: '它现在认得我的脚步声了，在单元门口的台阶上等着。今天给它掰了半根火腿肠，吃完以后它翻了个身，露出一肚子的白毛。\n我们谁也没出声，一起坐了十分钟。',
    mood: 'joy',
    weather: 'cloudy',
    tags: ['猫', '楼下'],
  },
  {
    offset: 8,
    hour: 20,
    minute: 22,
    title: '五公里，其实只跑了两公里',
    body: '跑步机上的数字跳得比我的心跳还快。最后走了三分钟，出了一身汗，感觉那顿火锅被抵消了一半。\n回家秤了一下，没有变化。生活真诚实。',
    mood: 'joy',
    weather: 'sunny',
    tags: ['运动', '健身', '火锅'],
  },
  {
    offset: 9,
    hour: 15,
    minute: 11,
    title: '奶茶续命',
    body: '今天第三杯。第一杯是会议前，第二杯是会议后，第三杯是会议改到明天之后。\n我知道这样不好，但珍珠在嘴里弹的那一下，确实让我原谅了这个下午。',
    mood: 'calm',
    weather: 'sunny',
    tags: ['奶茶', '工作', '下午'],
  },
  {
    offset: 10,
    hour: 1,
    minute: 9,
    title: '深夜开始想一些没用的事',
    body: '躺着的时候突然想到，如果当年去了另一个城市，现在的我会不会在另一个房间刷手机。\n这种问题永远没有答案，但脑子很喜欢问。写完这段就去睡。',
    mood: 'sad',
    weather: 'cloudy',
    tags: ['深夜', '自我怀疑'],
  },
  {
    offset: 12,
    hour: 23,
    minute: 30,
    title: '团建吃火锅聊到十二点',
    body: '锅底选了鸳鸯，最后红的比白的热。平时不说话的同事讲了三个冷笑话，大家笑到拍桌子。\n散场的时候有人说「以后多出来」，我知道大概率不会，但那一刻是真的开心。',
    mood: 'joy',
    weather: 'cloudy',
    tags: ['朋友', '火锅', '团建'],
  },
  {
    offset: 13,
    hour: 16,
    minute: 44,
    title: '体检报告，三项偏高',
    body: '医生说得很快，我点头点得也很快，出来以后一个字都想不起来。只记得那三个向上的小箭头。\n从今天开始少吃外卖——这句话我去年也写过。',
    mood: 'anxious',
    weather: 'sunny',
    tags: ['体检', '健康', '外卖'],
  },
  {
    offset: 15,
    hour: 14,
    minute: 2,
    title: '把房间彻底收拾了一遍',
    body: '扔了两袋东西，其中一袋是去年的快递盒，另一袋是「以后可能会用」的东西。抽屉清空的那一刻，心里也跟着空了一点，是舒服的那种空。\n顺手把桌子换了个方向，光变好了。',
    mood: 'calm',
    weather: 'sunny',
    tags: ['整理', '房间'],
  },
  {
    offset: 16,
    hour: 22,
    minute: 50,
    title: '一本书的最后三十页',
    body: '从三月读到今天，中间断了两次。最后三十页意外地轻，像是一把椅子慢慢放下来。\n合上书之后我坐了一会儿，什么也没想。',
    mood: 'calm',
    weather: 'cloudy',
    tags: ['阅读', '深夜'],
  },
  {
    offset: 18,
    hour: 20,
    minute: 7,
    title: '楼下看到特别圆的月亮',
    body: '拿外卖的时候抬头，月亮就在两栋楼中间，很圆，边缘有点毛。拍了三张都不好看，就干脆不拍了，站着看了两分钟。\n有些东西拍不下来，只能算自己赚到。',
    mood: 'joy',
    weather: 'sunny',
    tags: ['月亮', '楼下', '外卖'],
  },
  {
    offset: 20,
    hour: 11,
    minute: 25,
    title: '面试了一个年轻人',
    body: '他讲的思路和我三年前一模一样，包括那个我觉得很幼稚的停顿。面试完我在工位上坐了很久。\n后来想想，那时候的我其实挺好的。',
    mood: 'calm',
    weather: 'cloudy',
    tags: ['工作', '面试', '回忆'],
  },
  {
    offset: 23,
    hour: 17,
    minute: 35,
    title: '电脑蓝屏，稿子没保存',
    body: '蓝屏的那一秒世界安静了。两小时的稿子，只留下来一句「这是一个值得思考的问题」。\n我重写了。第二遍比第一遍好，但我并不想为此感谢蓝屏。',
    mood: 'angry',
    weather: 'rain',
    tags: ['工作', '电脑', '意外'],
  },
  {
    offset: 26,
    hour: 13,
    minute: 40,
    title: '奶奶的红烧肉',
    body: '回老家，进门就是那个味道。她一边嫌我瘦一边往我碗里夹，我吃了两碗饭。\n走的时候她塞了一袋鸡蛋给我，说路上别摔了。',
    mood: 'joy',
    weather: 'snow',
    tags: ['家人', '回老家', '红烧肉'],
  },
  {
    offset: 30,
    hour: 23,
    minute: 18,
    title: '开始写这本日记',
    body: '买了一个本子，最后还是在电脑上写。理由是可以搜索，虽然我从来没搜过。\n希望以后翻回来的时候，能认出现在的自己。',
    mood: 'neutral',
    weather: 'cloudy',
    tags: ['开始', '日记'],
  },
]

export function buildSeedEntries(today: string = todayKey()): DiaryEntry[] {
  const entries = SPECS.map((spec) => {
    const date = addDays(today, -spec.offset)
    const [y, m, d] = date.split('-').map(Number)
    const createdAt = new Date(y, m - 1, d, spec.hour, spec.minute).getTime()
    return {
      id: `seed-${date}`,
      date,
      title: spec.title,
      body: spec.body,
      mood: spec.mood,
      weather: spec.weather,
      tags: spec.tags,
      createdAt: Number.isFinite(createdAt) ? createdAt : Date.now(),
      updatedAt: Number.isFinite(createdAt) ? createdAt : Date.now(),
    } satisfies DiaryEntry
  })
  return entries.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
}
