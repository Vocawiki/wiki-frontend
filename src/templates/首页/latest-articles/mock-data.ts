import type { PageInfo } from '~/widgets/LatestArticleList/types'

const mockData: PageInfo[] = [
	{
		summary: '',
		title: 'Mon,mon,honey',
		href: '/Mon,mon,honey',
		image: null,
	},
	{
		summary:
			'《貝殻の涙》（贝壳之泪）是彩埜(銀鱗P)于2012年2月16日投稿至niconico的VOCALOID日语原创歌曲，由KAITO演唱。',
		title: '贝壳之泪',
		href: '/%E8%B4%9D%E5%A3%B3%E4%B9%8B%E6%B3%AA',
		image: {
			source:
				'/vocawiki/images/thumb/3/3f/%E8%B2%9D%E6%AE%BB%E3%81%AE%E6%B6%99.jpg/160px-%E8%B2%9D%E6%AE%BB%E3%81%AE%E6%B6%99.jpg',
			width: 160,
			height: 120,
		},
	},
	{
		summary:
			'《＊＊＊＊（ドスケベ）コンテンツ》是ぱりぱりさらうどん于2025年12月25日投稿至niconico和YouTube的VOCALOID日语原创歌曲，由初音未来演唱。',
		title: '＊＊＊＊类内容',
		href: '/%EF%BC%8A%EF%BC%8A%EF%BC%8A%EF%BC%8A%E7%B1%BB%E5%86%85%E5%AE%B9',
		image: {
			source:
				'/vocawiki/images/thumb/2/2b/%EF%BC%8A%EF%BC%8A%EF%BC%8A%EF%BC%8A%E3%82%B3%E3%83%B3%E3%83%86%E3%83%B3%E3%83%84.jpg/160px-%EF%BC%8A%EF%BC%8A%EF%BC%8A%EF%BC%8A%E3%82%B3%E3%83%B3%E3%83%86%E3%83%B3%E3%83%84.jpg',
			width: 160,
			height: 90,
		},
	},
	{
		summary:
			'《貝殻の唄》（贝壳之歌）是遠道（魔王P）于2016年8月20日投稿至niconico、YouTube的VOCALOID日语原创歌曲，由鏡音リン演唱。',
		title: '贝壳之歌',
		href: '/%E8%B4%9D%E5%A3%B3%E4%B9%8B%E6%AD%8C',
		image: {
			source:
				'/vocawiki/images/thumb/c/c9/%E8%B2%9D%E6%AE%BB%E3%81%AE%E5%94%84.jpg/160px-%E8%B2%9D%E6%AE%BB%E3%81%AE%E5%94%84.jpg',
			width: 160,
			height: 90,
		},
	},
	{
		summary:
			'《色彩電気》（色彩电气/色彩电流）是ムシぴ于2016年11月29日投稿至niconico、YouTube的VOCALOID日语原创歌曲，由初音未来演唱，并被收录于《6-Sense》中。',
		title: '色彩电气',
		href: '/%E8%89%B2%E5%BD%A9%E7%94%B5%E6%B0%94',
		image: {
			source:
				'/vocawiki/images/thumb/5/55/%E8%89%B2%E5%BD%A9%E7%94%B5%E6%B0%94.jpg/160px-%E8%89%B2%E5%BD%A9%E7%94%B5%E6%B0%94.jpg',
			width: 160,
			height: 90,
		},
	},
	{
		summary:
			'《天真烂漫高襟姬》（天真烂漫高襟姬）是かぴたろう于2012年5月4日投稿至niconico的日语原创歌曲，由初音ミク演唱，收录于专辑《未来和歌集》，是かぴたろう的和风曲第三弹。',
		title: '天真烂漫高襟姬',
		href: '/%E5%A4%A9%E7%9C%9F%E7%83%82%E6%BC%AB%E9%AB%98%E8%A5%9F%E5%A7%AC',
		image: {
			source:
				'/vocawiki/images/thumb/f/f6/%E5%A4%A9%E7%9C%9F%E7%88%9B%E6%BC%AB%E9%AB%98%E8%A5%9F%E5%A7%AB.jpg/160px-%E5%A4%A9%E7%9C%9F%E7%88%9B%E6%BC%AB%E9%AB%98%E8%A5%9F%E5%A7%AB.jpg',
			width: 160,
			height: 91,
		},
	},
	{
		summary:
			'《さいはてに花》是ぬゆり于2026年7月17日投稿至niconico、YouTube和bilibili的VOCALOID日语原创歌曲，由初音未来演唱，收录于专辑《NORMAL END》\n该曲参与了匿名投稿活动無色透名祭3…',
		title: '天涯之花',
		href: '/%E5%A4%A9%E6%B6%AF%E4%B9%8B%E8%8A%B1',
		image: {
			source:
				'/vocawiki/images/thumb/a/a6/%E5%A4%A9%E6%B6%AF%E4%B9%8B%E8%8A%B1.jpg/160px-%E5%A4%A9%E6%B6%AF%E4%B9%8B%E8%8A%B1.jpg',
			width: 160,
			height: 90,
		},
	},
	{
		summary:
			'《青い鳥》（青鸟）是島白（よだれP）于2008年11月25日投稿至niconico的VOCALOID日语原创歌曲，由初音ミク演唱。\n目前该曲目原版PV仍处于部分遗失状态，完整版PV仍需等待进一步搜寻。',
		title: '青鸟',
		href: '/%E9%9D%92%E9%B8%9F',
		image: {
			source: '/vocawiki/images/thumb/c/c0/Bluebird.jpg/160px-Bluebird.jpg',
			width: 160,
			height: 117,
		},
	},
	{
		summary:
			'《いたい》（好痛）是由匿名作编曲，由無色透名祭官方于2025年11月21日投稿至niconico的VOCALOID日语原创歌曲，由初音未来演唱。\n此曲因为作曲与调校风格被认为是大漠波新与巡巡的合作曲，不过两人尚未承认…',
		title: '好痛',
		href: '/%E5%A5%BD%E7%97%9B',
		image: {
			source:
				'/vocawiki/images/thumb/f/fc/%E6%97%A0%E8%89%B2%E9%80%8F%E5%90%8D%E7%A5%AD3LOGO.jpg/160px-%E6%97%A0%E8%89%B2%E9%80%8F%E5%90%8D%E7%A5%AD3LOGO.jpg',
			width: 160,
			height: 90,
		},
	},
	{
		summary:
			'《ワンダーポートディスプレイ》是shikisai于2026年7月20日投稿至niconico、YouTube的Synthesizer V日语原创歌曲，由音街鳗、追傩酱演唱。',
		title: 'Wonderport Display',
		href: '/Wonderport_Display',
		image: {
			source: '/vocawiki/images/thumb/f/ff/Wonderport_Display.jpg/160px-Wonderport_Display.jpg',
			width: 160,
			height: 90,
		},
	},
	{
		summary:
			'《桜花爛漫恋語》（樱花烂漫恋语）是かぴたろう于2012年5月4日投稿至niconico的日语原创歌曲，由初音ミク演唱，收录于专辑《未来和歌集》，是かぴたろう的和风曲第二弹。',
		title: '樱花烂漫恋语',
		href: '/%E6%A8%B1%E8%8A%B1%E7%83%82%E6%BC%AB%E6%81%8B%E8%AF%AD',
		image: {
			source:
				'/vocawiki/images/thumb/7/7f/%E6%A1%9C%E8%8A%B1%E7%88%9B%E6%BC%AB%E6%81%8B%E8%AA%9E.jpg/160px-%E6%A1%9C%E8%8A%B1%E7%88%9B%E6%BC%AB%E6%81%8B%E8%AA%9E.jpg',
			width: 160,
			height: 90,
		},
	},
	{
		summary:
			'《光》是由水野あつ于2026年7月17日投稿至niconico和YouTube的VOCALOID日语原创歌曲，由初音未来演唱。\n本曲是为游戏《世界计划 缤纷舞台！ feat. 初音未来》中的组合25点…',
		title: '光(水野Atsu)',
		href: '/%E5%85%89(%E6%B0%B4%E9%87%8EAtsu)',
		image: null,
	},
	{
		summary: '',
		title: '霓虹灯鱼',
		href: '/%E9%9C%93%E8%99%B9%E7%81%AF%E9%B1%BC',
		image: {
			source:
				'/vocawiki/images/thumb/0/05/%E3%83%8D%E3%82%AA%E3%83%B3%E3%83%86%E3%83%88%E3%83%A9%E5%B0%81%E9%9D%A2.jpg/160px-%E3%83%8D%E3%82%AA%E3%83%B3%E3%83%86%E3%83%88%E3%83%A9%E5%B0%81%E9%9D%A2.jpg',
			width: 160,
			height: 90,
		},
	},
	{
		summary:
			'《宵月舞呗》（宵月舞歌）是かぴたろう于2012年3月19日投稿至niconico的日语原创歌曲，由初音ミク演唱，收录于专辑《未来和歌集》。',
		title: '宵月舞歌',
		href: '/%E5%AE%B5%E6%9C%88%E8%88%9E%E6%AD%8C',
		image: {
			source:
				'/vocawiki/images/thumb/4/42/%E5%AE%B5%E6%9C%88%E8%88%9E%E5%94%84.webp/160px-%E5%AE%B5%E6%9C%88%E8%88%9E%E5%94%84.webp.png',
			width: 160,
			height: 90,
		},
	},
	{
		summary:
			'《ほしのこもりうた》是島白（よだれP）于2008年8月31日、2009年10月4日、2010年8月3日投稿至niconico的VOCALOID日语原创歌曲，由初音ミク演唱。\n该曲目被收录于島白（よだれP…',
		title: '星之摇篮曲',
		href: '/%E6%98%9F%E4%B9%8B%E6%91%87%E7%AF%AE%E6%9B%B2',
		image: {
			source: '/vocawiki/images/thumb/e/e6/Komoriuta.jpg/160px-Komoriuta.jpg',
			width: 160,
			height: 120,
		},
	},
	{
		summary:
			'《只の人》是犬ドリンク于2025年11月28日投稿至niconico与YouTube、2026年5619日投稿至bilibili的UTAU日语原创歌曲，由唄音ウタ演唱。',
		title: '只身一人',
		href: '/%E5%8F%AA%E8%BA%AB%E4%B8%80%E4%BA%BA',
		image: {
			source:
				'/vocawiki/images/thumb/8/86/%E5%8F%AA%E8%BA%AB%E4%B8%80%E4%BA%BA.jpg/160px-%E5%8F%AA%E8%BA%AB%E4%B8%80%E4%BA%BA.jpg',
			width: 160,
			height: 90,
		},
	},
	{
		summary:
			'《ぜったいだった！！！！》（本来是绝对的！！！！）是内緒の秘密于2026年7月16日投稿至niconico、YouTube的VOCALOID日语原创歌曲，由初音未来、IA演唱。\n该曲参与了匿名投稿活动無色透名祭3…',
		title: '本来是绝对的！！！！',
		href: '/%E6%9C%AC%E6%9D%A5%E6%98%AF%E7%BB%9D%E5%AF%B9%E7%9A%84%EF%BC%81%EF%BC%81%EF%BC%81%EF%BC%81',
		image: {
			source:
				'/vocawiki/images/thumb/b/ba/%E6%9C%AC%E6%9D%A5%E6%98%AF%E7%BB%9D%E5%AF%B9%E7%9A%84.jpg/160px-%E6%9C%AC%E6%9D%A5%E6%98%AF%E7%BB%9D%E5%AF%B9%E7%9A%84.jpg',
			width: 160,
			height: 90,
		},
	},
	{
		summary:
			'《ステラノーツ》是岛白（よだれP）于2015年5月3日投稿至niconico的VOCALOID日语原创歌曲，由初音ミク演唱。',
		title: 'Stella Notes',
		href: '/Stella_Notes',
		image: {
			source: '/vocawiki/images/thumb/9/9c/Stella_Notes.jpg/160px-Stella_Notes.jpg',
			width: 160,
			height: 66,
		},
	},
	{
		summary:
			'Biliboard术力口周榜第111期是Bili-Board_Atel在2026年7月22号发布于Bilibili中的针对B站的流行趋势的日V周榜。',
		title: 'Biliboard术力口周榜/第111期',
		href: '/Biliboard%E6%9C%AF%E5%8A%9B%E5%8F%A3%E5%91%A8%E6%A6%9C/%E7%AC%AC111%E6%9C%9F',
		image: {
			source:
				'/vocawiki/images/thumb/0/07/Biliboard%E6%9C%AF%E5%8A%9B%E5%8F%A3%E5%91%A8%E6%A6%9C%E7%AC%AC111%E6%9C%9F.png/160px-Biliboard%E6%9C%AF%E5%8A%9B%E5%8F%A3%E5%91%A8%E6%A6%9C%E7%AC%AC111%E6%9C%9F.png',
			width: 160,
			height: 90,
		},
	},
	{
		summary:
			'《サクラ点睛乱れ撃ち》（樱花点睛乱射）是島白（よだれP）于2010年8月14日、2010年8月15日投稿至niconico的VOCALOID日语原创歌曲，由初音ミク演唱。',
		title: '樱花点睛乱射',
		href: '/%E6%A8%B1%E8%8A%B1%E7%82%B9%E7%9D%9B%E4%B9%B1%E5%B0%84',
		image: {
			source:
				'/vocawiki/images/thumb/8/85/%E3%82%B5%E3%82%AF%E3%83%A9%E7%82%B9%E7%9D%9B%E4%B9%B1%E3%82%8C%E6%92%83%E3%81%A1.jpg/160px-%E3%82%B5%E3%82%AF%E3%83%A9%E7%82%B9%E7%9D%9B%E4%B9%B1%E3%82%8C%E6%92%83%E3%81%A1.jpg',
			width: 160,
			height: 120,
		},
	},
	{
		summary:
			'《AGAINSTAR》是島白（よだれP）于2008年5月24日、2009年1月12日、2010年8月3日投稿至niconico的VOCALOID日语原创歌曲，由初音ミク演唱。\n此曲被收录于島白（よだれP…',
		title: 'AGAINSTAR',
		href: '/AGAINSTAR',
		image: {
			source: '/vocawiki/images/thumb/7/79/AGAINSTAR.jpg/160px-AGAINSTAR.jpg',
			width: 160,
			height: 116,
		},
	},
	{
		summary: 'Billboard JAPAN在2026年07月22日发布了NICONICO VOCALOID SONGS TOP20 第177期。',
		title: 'NICONICO VOCALOID SONGS TOP20/第177期',
		href: '/NICONICO_VOCALOID_SONGS_TOP20/%E7%AC%AC177%E6%9C%9F',
		image: null,
	},
	{
		summary:
			'《SING》是島白（よだれP）于2008年3月22日、2008年3月25日、2008年8月15日投稿至niconico的VOCALOID日语原创歌曲，由初音ミク演唱。\n该曲目在島白（よだれP）删除稿件后曾一度成为失传媒体…',
		title: 'SING',
		href: '/SING',
		image: {
			source: '/vocawiki/images/thumb/4/49/SING.jpg/160px-SING.jpg',
			width: 160,
			height: 119,
		},
	},
	{
		summary:
			'《色想環モノグラフィー》（色谱绘影）是Twinfield于2026年3月24日投稿至niconico与YouTube的VOCALOID日语原创歌曲，由初音未来演唱，收录于专辑《Boite a Bijoux…',
		title: '色谱绘影',
		href: '/%E8%89%B2%E8%B0%B1%E7%BB%98%E5%BD%B1',
		image: {
			source:
				'/vocawiki/images/thumb/6/63/%E8%89%B2%E8%B0%B1%E7%BB%98%E5%BD%B1.jpg/160px-%E8%89%B2%E8%B0%B1%E7%BB%98%E5%BD%B1.jpg',
			width: 160,
			height: 90,
		},
	},
	{
		summary:
			'《1121》是aoneko于2021年11月21日投稿至YouTube，2021年11月24日投稿于niconico的VOCALOID日语原创歌曲，由初音ミク演唱。',
		title: '1121',
		href: '/1121',
		image: {
			source: '/vocawiki/images/thumb/2/23/1121.jpg/160px-1121.jpg',
			width: 160,
			height: 90,
		},
	},
	{
		summary:
			'《ドライビングライディングダイビングダイ》（驱车疾行 溺坠而亡）是佐藤ちなみに于2026年7月16日投稿至YouTube、bilibili的VOCALOID日语原创歌曲，由初音ミク演唱。',
		title: '驱车疾行 溺坠而亡',
		href: '/%E9%A9%B1%E8%BD%A6%E7%96%BE%E8%A1%8C_%E6%BA%BA%E5%9D%A0%E8%80%8C%E4%BA%A1',
		image: {
			source:
				'/vocawiki/images/thumb/5/5e/%E3%83%89%E3%83%A9%E3%82%A4%E3%83%93%E3%83%B3%E3%82%B0%E3%83%A9%E3%82%A4%E3%83%87%E3%82%A3%E3%83%B3%E3%82%B0%E3%83%80%E3%82%A4%E3%83%93%E3%83%B3%E3%82%B0%E3%83%80%E3%82%A4.jpg/160px-%E3%83%89%E3%83%A9%E3%82%A4%E3%83%93%E3%83%B3%E3%82%B0%E3%83%A9%E3%82%A4%E3%83%87%E3%82%A3%E3%83%B3%E3%82%B0%E3%83%80%E3%82%A4%E3%83%93%E3%83%B3%E3%82%B0%E3%83%80%E3%82%A4.jpg',
			width: 160,
			height: 90,
		},
	},
	{
		summary:
			'《∞まわる∞》是カルロス袴田(サイゼP)于2017年9月23日投稿至niconico、YouTube的VOCALOID日语原创歌曲，由初音未来和音街鳗演唱。',
		title: '∞转过∞',
		href: '/%E2%88%9E%E8%BD%AC%E8%BF%87%E2%88%9E',
		image: {
			source:
				'/vocawiki/images/thumb/f/f0/%E9%A9%AC%E6%B4%BC%E8%B7%AF.jpg/160px-%E9%A9%AC%E6%B4%BC%E8%B7%AF.jpg',
			width: 160,
			height: 90,
		},
	},
	{
		summary:
			'《Restart Refine》是d0tc0mmie于2026年07月20日投稿至niconico、YouTube和bilibili的Synthesizer V原创歌曲，由GUMI演唱。',
		title: 'Restart Refine',
		href: '/Restart_Refine',
		image: {
			source: '/vocawiki/images/thumb/e/e1/Restart_Refine.jpg/160px-Restart_Refine.jpg',
			width: 160,
			height: 90,
		},
	},
	{
		summary: '术力口数据姬于2026年07月18日发布了周刊虚拟歌手外语排行榜 #98。',
		title: '周刊虚拟歌手外语排行榜98',
		href: '/%E5%91%A8%E5%88%8A%E8%99%9A%E6%8B%9F%E6%AD%8C%E6%89%8B%E5%A4%96%E8%AF%AD%E6%8E%92%E8%A1%8C%E6%A6%9C98',
		image: {
			source:
				'/vocawiki/images/thumb/b/b2/%E5%91%A8%E5%88%8A%E8%99%9A%E6%8B%9F%E6%AD%8C%E6%89%8B%E5%A4%96%E8%AF%AD%E6%8E%92%E8%A1%8C%E6%A6%9C-98.jpg/160px-%E5%91%A8%E5%88%8A%E8%99%9A%E6%8B%9F%E6%AD%8C%E6%89%8B%E5%A4%96%E8%AF%AD%E6%8E%92%E8%A1%8C%E6%A6%9C-98.jpg',
			width: 160,
			height: 90,
		},
	},
	{
		summary:
			'《リリュージョン》是せきこみごはん于2026年7月3日投稿至YouTube、2026年7月4日投稿至niconico与bilibili的VOCALOID日语原创歌曲，由初音未来演唱。收录于专辑《誰も知らない音楽奇譚…',
		title: '幻影(咳悟饭)',
		href: '/%E5%B9%BB%E5%BD%B1(%E5%92%B3%E6%82%9F%E9%A5%AD)',
		image: {
			source:
				'/vocawiki/images/thumb/1/1f/%E5%B9%BB%E5%BD%B1%28%E5%92%B3%E5%97%BD%E9%A5%AD%29.jpg/160px-%E5%B9%BB%E5%BD%B1%28%E5%92%B3%E5%97%BD%E9%A5%AD%29.jpg',
			width: 160,
			height: 90,
		},
	},
]

export default mockData
