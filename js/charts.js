/* 历史图表数据：世系、政体、时间轴、地图 */
window.DG_CHARTS = {

/* 王朝世系图 */
dynasty:{
  eras:[
    {label:"萨克森王朝",years:"919—1024",nodes:[
      {name:"亨利一世",y:"919—936",emp:false},
      {name:"奥托一世",y:"936—973",emp:true},
      {name:"奥托二世",y:"973—983",emp:true},
      {name:"奥托三世",y:"983—1002",emp:true},
      {name:"亨利二世",y:"1002—1024",emp:true}
    ]},
    {label:"萨利尔王朝",years:"1024—1125",nodes:[
      {name:"康拉德二世",y:"1024—1039",emp:true},
      {name:"亨利三世",y:"1039—1056",emp:true},
      {name:"亨利四世",y:"1056—1106",emp:true},
      {name:"亨利五世",y:"1106—1125",emp:true}
    ]},
    {label:"霍亨斯陶芬王朝",years:"1138—1250",nodes:[
      {name:"康拉德三世",y:"1138—1152",emp:false},
      {name:"腓特烈一世",y:"1152—1190",emp:true},
      {name:"亨利六世",y:"1190—1197",emp:true},
      {name:"腓特烈二世",y:"1212—1250",emp:true}
    ]},
    {label:"哈布斯堡王朝",years:"1273—1806",nodes:[
      {name:"鲁道夫一世",y:"1273—1291",emp:false},
      {name:"查理四世*",y:"1346—1378",emp:true},
      {name:"马克西米连一世",y:"1493—1519",emp:true},
      {name:"查理五世",y:"1519—1556",emp:true},
      {name:"弗朗茨二世",y:"1792—1806",emp:true}
    ]},
    {label:"霍亨索伦王朝（普鲁士）",years:"1701—1918",nodes:[
      {name:"腓特烈一世",y:"1701—1713",emp:false},
      {name:"腓特烈二世",y:"1740—1786",emp:false},
      {name:"威廉一世",y:"1871—1888",emp:true},
      {name:"威廉二世",y:"1888—1918",emp:true}
    ]}
  ],
  note:"* 查理四世属卢森堡王朝，此处列入以示帝国皇位在中世纪的王朝更替。红色节点为加冕为神圣罗马帝国皇帝者；emp:false 者为仅任德意志国王或普鲁士国王。此图为主要君主示意，非完整世系。"
},

/* 神圣罗马帝国政治结构 */
hrr:{
  center:{name:"神圣罗马帝国皇帝",sub:"由七大选帝侯选举产生"},
  tiers:[
    {title:"七大选帝侯",sub:"拥有皇帝选举权的核心诸侯",items:["美因茨大主教","科隆大主教","特里尔大主教","波希米亚国王","莱茵普法尔茨伯爵","萨克森公爵","勃兰登堡侯爵"]},
    {title:"帝国诸侯",sub:"公爵、侯爵、伯爵及教会诸侯",items:["世俗诸侯","教会诸侯","帝国骑士"]},
    {title:"帝国自由城市",sub:"直接隶属于皇帝的城市",items:["纽伦堡","奥格斯堡","法兰克福","汉堡","吕贝克"]},
    {title:"共同机构",sub:"维系帝国运转的制度",items:["帝国议会","帝国最高法院","帝国宫廷法院","帝国大区制度"]}
  ],
  note:"帝国实行等级制治理：皇帝权力受选帝侯与议会制约。1806年帝国解体。此图为结构示意。"
},

/* 普鲁士与奥地利竞争时间轴 */
rivalry:{
  events:[
    {year:"1701",title:"普鲁士王国成立",desc:"腓特烈一世在柯尼斯堡加冕为普鲁士国王，普鲁士从选帝侯国升格为王国，开始以大国姿态登上欧洲舞台。"},
    {year:"1740",title:"腓特烈二世继位",desc:"年轻的腓特烈二世继承普鲁士王位，随即发动西里西亚战争，挑战奥地利的哈布斯堡统治。"},
    {year:"1748",title:"奥地利王位继承战争结束",desc:"《亚琛和约》确认普鲁士对西里西亚的占领，奥地利被迫接受领土损失，普奥矛盾加深。"},
    {year:"1756",title:"七年战争爆发",desc:"腓特烈二世先发制人进攻萨克森，欧洲大国卷入。英国与普鲁士结盟，法国、奥地利、俄国结成同盟。"},
    {year:"1763",title:"《胡贝图斯堡和约》",desc:"七年战争结束，普鲁士保住西里西亚，跻身欧洲五强之列，德意志二元格局正式确立。"},
    {year:"1772",title:"第一次瓜分波兰",desc:"普鲁士、奥地利与俄国瓜分波兰，普鲁士获得西普鲁士，连接了勃兰登堡与东普鲁士。"},
    {year:"1786",title:"腓特烈二世去世",desc:"腓特烈大王去世，普鲁士进入相对停滞期，但已牢固确立为德意志第一强国。"},
    {year:"1806",title:"耶拿战役与帝国解体",desc:"拿破仑在耶拿击败普鲁士，神圣罗马帝国同年解体，普奥竞争进入新的历史阶段。"},
    {year:"1866",title:"普奥战争",desc:"普鲁士在萨多瓦战役中击败奥地利，将其排除出德意志，确立了普鲁士对统一的主导权。"}
  ],
  note:"点击时间轴节点查看事件详情。普奥竞争是理解德意志统一路径（小德意志方案）的关键。"
},

/* 历史地图集 */
maps:[
  {
    id:"unification",
    title:"德意志统一战争（1864—1871）",
    sub:"三次王朝战争如何塑造德意志帝国",
    svg:`<svg class="map-svg" viewBox="0 0 600 380" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="380" fill="#1a2429"/>
      <!-- 海域 -->
      <path class="map-water" d="M0,0 L160,0 L160,90 Q100,120 0,110 Z"/>
      <path class="map-water" d="M0,300 Q120,290 230,330 L230,380 L0,380 Z"/>
      <!-- 普鲁士 -->
      <path class="map-region" data-info="prussia" d="M230,90 L420,80 L470,130 L440,200 L360,215 L330,170 L260,160 Z"/>
      <!-- 奥地利 -->
      <path class="map-region" data-info="austria" d="M360,215 L440,200 L500,230 L480,310 L390,320 L340,270 Z"/>
      <!-- 丹麦/石勒苏益格 -->
      <path class="map-region" data-info="denmark" d="M230,40 L300,35 L310,85 L235,90 Z"/>
      <!-- 法国方向 -->
      <path class="map-region" data-info="france" d="M80,120 L230,90 L260,160 L230,260 L160,280 L90,220 Z"/>
      <!-- 南德诸邦 -->
      <path class="map-region" data-info="south" d="M300,230 L360,215 L390,320 L290,330 L270,270 Z"/>
      <!-- 城市 -->
      <circle class="map-city" cx="330" cy="130" r="4"/><text class="map-city-label" x="330" y="120">柏林</text>
      <circle class="map-city" cx="390" cy="255" r="4"/><text class="map-city-label" x="390" y="248">维也纳</text>
      <circle class="map-city" cx="155" cy="200" r="4"/><text class="map-city-label" x="155" y="192">巴黎</text>
      <circle class="map-city" cx="270" cy="290" r="4"/><text class="map-city-label" x="270" y="305">慕尼黑</text>
      <text class="map-label" x="380" y="145">普鲁士</text>
      <text class="map-label" x="420" y="265">奥地利</text>
      <text class="map-label" x="165" y="200">法国</text>
      <text class="map-label" x="320" y="280">南德诸邦</text>
      <text class="map-label" x="265" y="65">丹麦</text>
    </svg>`,
    info:{
      prussia:{t:"普鲁士王国",d:"统一的主导力量。1864年联合奥地利击败丹麦；1866年在萨多瓦击败奥地利；1870年在色当击败法国，完成统一。"},
      austria:{t:"奥地利帝国",d:"1864年曾与普鲁士联合对丹麦作战，1866年普奥战争后被排除出德意志，转向多瑙河帝国的发展。"},
      denmark:{t:"丹麦与两公国",d:"石勒苏益格—荷尔斯泰因问题是第一次王朝战争的导火索。1864年丹麦战败，被迫放弃两公国。"},
      france:{t:"法国",d:"1870年普法战争中，拿破仑三世在色当被俘，法国战败。阿尔萨斯—洛林被割让给德国，埋下复仇种子。"},
      south:{t:"南德诸邦",d:"巴伐利亚、符腾堡、巴登等南德邦国在普法战争的民族主义浪潮中加入普鲁士一方，1871年进入德意志帝国。"}
    },
    legend:"点击地图区域查看说明。此图为简化示意，非精确地理地图。"
  },
  {
    id:"ww1",
    title:"第一次世界大战中的德国（1914—1918）",
    sub:"两线作战与帝国的崩溃",
    svg:`<svg class="map-svg" viewBox="0 0 600 380" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="380" fill="#1a2429"/>
      <path class="map-water" d="M0,0 L200,0 L200,80 Q120,110 0,90 Z"/>
      <path class="map-region" data-info="west" d="M120,90 L300,80 L320,180 L200,240 L110,190 Z"/>
      <path class="map-region" data-info="east" d="M320,80 L560,70 L570,220 L400,210 L320,180 Z"/>
      <path class="map-region" data-info="home" d="M200,190 L320,180 L340,270 L220,280 Z"/>
      <circle class="map-city" cx="255" cy="225" r="4"/><text class="map-city-label" x="255" y="216">柏林</text>
      <circle class="map-city" cx="150" cy="160" r="4"/><text class="map-city-label" x="150" y="152">西线</text>
      <circle class="map-city" cx="440" cy="140" r="4"/><text class="map-city-label" x="440" y="132">东线</text>
      <text class="map-label" x="210" y="150">西线战场</text>
      <text class="map-label" x="450" y="180">东线战场</text>
      <text class="map-label" x="275" y="250">德国本土</text>
    </svg>`,
    info:{
      west:{t:"西线",d:"1914年德军经比利时入侵法国，在马恩河被协约国阻挡，随后陷入漫长的堑壕战。凡尔登战役（1916）成为最血腥的战役之一。"},
      east:{t:"东线",d:"德军在坦能堡击败俄国，但俄国在1916年布鲁西洛夫攻势中重创奥匈。1917年俄国革命后，德国与苏俄签订《布列斯特—立托夫斯克和约》。"},
      home:{t:"德国本土",d:"战争期间实施总体战动员，经济转入战时轨道。1918年的军事失败引发十一月革命，德意志帝国崩溃。"}
    },
    legend:"点击区域查看说明。此图为简化示意。"
  },
  {
    id:"division",
    title:"德国的分裂与统一（1945—1990）",
    sub:"占领区、柏林墙与两德统一",
    svg:`<svg class="map-svg" viewBox="0 0 600 380" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="380" fill="#1a2429"/>
      <path class="map-water" d="M0,0 L170,0 L170,100 Q90,130 0,110 Z"/>
      <!-- 西部占领区 -->
      <path class="map-region" data-info="west" d="M90,110 L290,90 L300,200 L280,290 L110,280 L80,190 Z"/>
      <!-- 东部占领区 -->
      <path class="map-region" data-info="east" d="M290,90 L500,100 L520,240 L400,290 L280,290 L300,200 Z"/>
      <!-- 柏林 -->
      <circle class="map-city" cx="360" cy="195" r="7" data-info="berlin" style="cursor:pointer"/>
      <text class="map-city-label" x="360" y="182" style="font-size:11px">柏林</text>
      <text class="map-label" x="185" y="190">联邦德国（西德）</text>
      <text class="map-label" x="410" y="200">民主德国（东德）</text>
      <!-- 柏林墙示意线 -->
      <line x1="350" y1="185" x2="370" y2="205" stroke="#c9404a" stroke-width="2"/>
    </svg>`,
    info:{
      west:{t:"联邦德国",d:"美英法占领区合并而成，1949年成立。实行社会市场经济与议会民主制，在马歇尔计划援助下实现经济奇迹。"},
      east:{t:"民主德国",d:"苏联占领区，1949年成立。实行社会主义计划经济与一党制，在教育与社会保障方面取得成就，但经济活力不足。"},
      berlin:{t:"柏林",d:"被四国分区占领，成为冷战焦点。1961年柏林墙修建，将城市一分为二。1989年11月9日柏林墙倒塌，成为德国统一的先声。"}
    },
    legend:"点击区域查看说明。此图为简化示意。"
  }
]
};
