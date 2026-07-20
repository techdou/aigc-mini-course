/**
 * 豆懂 AI 动物英语微课 · 词库数据
 * 三大主题：农场 / 海洋 / 森林，共 15 个动物
 * 每个动物包含：英文、中文、图标(emoji兜底)、图片路径、短语、例句中文
 *
 * 图片文件名约定：{theme}_{en}.png
 * 例如：farm_cat.png, ocean_dolphin.png, forest_owl.png
 */
window.ANIMAL_WORDS = [
  // ========== 农场主题 farm ==========
  {
    en: 'cat', cn: '猫', theme: 'farm', themeCn: '农场',
    icon: '🐱', img: 'assets/images/animals/farm_cat.png',
    phrase: 'a lazy cat',
    phraseCn: '一只懒洋洋的猫',
    sentence: 'The lazy cat is sleeping on the sofa.',
    sentenceCn: '那只懒猫正睡在沙发上。'
  },
  {
    en: 'dog', cn: '狗', theme: 'farm', themeCn: '农场',
    icon: '🐶', img: 'assets/images/animals/farm_dog.png',
    phrase: 'a happy dog',
    phraseCn: '一只开心的狗',
    sentence: 'The happy dog wags its tail.',
    sentenceCn: '那只开心的狗摇着尾巴。'
  },
  {
    en: 'rabbit', cn: '兔子', theme: 'farm', themeCn: '农场',
    icon: '🐰', img: 'assets/images/animals/farm_rabbit.png',
    phrase: 'a white rabbit',
    phraseCn: '一只白兔子',
    sentence: 'The white rabbit eats a carrot.',
    sentenceCn: '那只白兔在吃胡萝卜。'
  },
  {
    en: 'duck', cn: '鸭子', theme: 'farm', themeCn: '农场',
    icon: '🦆', img: 'assets/images/animals/farm_duck.png',
    phrase: 'a yellow duck',
    phraseCn: '一只黄鸭子',
    sentence: 'The yellow duck swims in the pond.',
    sentenceCn: '那只黄鸭在池塘里游泳。'
  },
  {
    en: 'pig', cn: '猪', theme: 'farm', themeCn: '农场',
    icon: '🐷', img: 'assets/images/animals/farm_pig.png',
    phrase: 'a pink pig',
    phraseCn: '一只粉红猪',
    sentence: 'The pink pig rolls in the mud.',
    sentenceCn: '那只粉红猪在泥里打滚。'
  },

  // ========== 海洋主题 ocean ==========
  {
    en: 'fish', cn: '鱼', theme: 'ocean', themeCn: '海洋',
    icon: '🐟', img: 'assets/images/animals/ocean_fish.png',
    phrase: 'a small fish',
    phraseCn: '一条小鱼',
    sentence: 'The small fish swims fast.',
    sentenceCn: '那条小鱼游得很快。'
  },
  {
    en: 'dolphin', cn: '海豚', theme: 'ocean', themeCn: '海洋',
    icon: '🐬', img: 'assets/images/animals/ocean_dolphin.png',
    phrase: 'a smart dolphin',
    phraseCn: '一只聪明的海豚',
    sentence: 'The smart dolphin jumps high.',
    sentenceCn: '那只聪明的海豚跳得很高。'
  },
  {
    en: 'whale', cn: '鲸鱼', theme: 'ocean', themeCn: '海洋',
    icon: '🐋', img: 'assets/images/animals/ocean_whale.png',
    phrase: 'a big whale',
    phraseCn: '一头大鲸鱼',
    sentence: 'The big whale sings in the sea.',
    sentenceCn: '那头大鲸鱼在海里唱歌。'
  },
  {
    en: 'crab', cn: '螃蟹', theme: 'ocean', themeCn: '海洋',
    icon: '🦀', img: 'assets/images/animals/ocean_crab.png',
    phrase: 'a red crab',
    phraseCn: '一只红螃蟹',
    sentence: 'The red crab walks sideways.',
    sentenceCn: '那只红螃蟹横着走。'
  },
  {
    en: 'turtle', cn: '海龟', theme: 'ocean', themeCn: '海洋',
    icon: '🐢', img: 'assets/images/animals/ocean_turtle.png',
    phrase: 'a slow turtle',
    phraseCn: '一只慢吞吞的海龟',
    sentence: 'The slow turtle walks on the beach.',
    sentenceCn: '那只慢吞吞的海龟走在沙滩上。'
  },

  // ========== 森林主题 forest ==========
  {
    en: 'bird', cn: '鸟', theme: 'forest', themeCn: '森林',
    icon: '🐦', img: 'assets/images/animals/forest_bird.png',
    phrase: 'a little bird',
    phraseCn: '一只小鸟',
    sentence: 'The little bird sings in the tree.',
    sentenceCn: '那只小鸟在树上唱歌。'
  },
  {
    en: 'owl', cn: '猫头鹰', theme: 'forest', themeCn: '森林',
    icon: '🦉', img: 'assets/images/animals/forest_owl.png',
    phrase: 'a wise owl',
    phraseCn: '一只聪明的猫头鹰',
    sentence: 'The wise owl looks at the moon.',
    sentenceCn: '那只聪明的猫头鹰看着月亮。'
  },
  {
    en: 'fox', cn: '狐狸', theme: 'forest', themeCn: '森林',
    icon: '🦊', img: 'assets/images/animals/forest_fox.png',
    phrase: 'a red fox',
    phraseCn: '一只红狐狸',
    sentence: 'The red fox runs through the forest.',
    sentenceCn: '那只红狐狸跑过森林。'
  },
  {
    en: 'bear', cn: '熊', theme: 'forest', themeCn: '森林',
    icon: '🐻', img: 'assets/images/animals/forest_bear.png',
    phrase: 'a brown bear',
    phraseCn: '一只棕熊',
    sentence: 'The brown bear eats honey.',
    sentenceCn: '那只棕熊在吃蜂蜜。'
  },
  {
    en: 'monkey', cn: '猴子', theme: 'forest', themeCn: '森林',
    icon: '🐵', img: 'assets/images/animals/forest_monkey.png',
    phrase: 'a funny monkey',
    phraseCn: '一只滑稽的猴子',
    sentence: 'The funny monkey climbs the tree.',
    sentenceCn: '那只滑稽的猴子爬树。'
  }
];

// 主题元数据
window.THEMES = [
  { id: 'farm',   cn: '农场', color: '#f0c674', emoji: '🚜' },
  { id: 'ocean',  cn: '海洋', color: '#5fb3d4', emoji: '🌊' },
  { id: 'forest', cn: '森林', color: '#7ba872', emoji: '🌳' }
];
