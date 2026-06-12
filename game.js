const canvas = document.querySelector("#petCanvas");
const ctx = canvas.getContext("2d");
const spritePet = document.querySelector("#spritePet");
const speech = document.querySelector("#petSpeech");
const petNameInput = document.querySelector("#petName");
const characterSelect = document.querySelector("#characterSelect");
const characterCards = document.querySelectorAll("[data-character]");
const petColorSelect = document.querySelector("#petColor");
const talkStyleSelect = document.querySelector("#talkStyle");
const coachPolicySelect = document.querySelector("#coachPolicy");
const playerRoleSelect = document.querySelector("#playerRole");
const playerLevelSelect = document.querySelector("#playerLevel");
const playerGoalInput = document.querySelector("#playerGoal");
const settingsSheet = document.querySelector("#settingsSheet");
const settingsButton = document.querySelector("#settingsButton");
const dailyPlan = document.querySelector("#dailyPlan");
const chatLog = document.querySelector("#chatLog");
const chatForm = document.querySelector("#chatForm");
const chatInput = document.querySelector("#chatInput");
const matchChecklist = document.querySelector("#matchChecklist");
const scoreBoard = document.querySelector("#scoreBoard");
const resultForm = document.querySelector("#resultForm");
const resultCoach = document.querySelector("#resultCoach");
const weeklyReview = document.querySelector("#weeklyReview");
const resultStats = document.querySelector("#resultStats");
const resultList = document.querySelector("#resultList");
const ruleSearch = document.querySelector("#ruleSearch");
const ruleCards = document.querySelector("#ruleCards");

const DEFAULT_SPRITE_SRC = "./assets/kon-spritesheet.png";
const DEFAULT_SPRITE_FRAME = { x: 48, y: 31, w: 154, h: 160 };
const EXPRESSIONS = {
  calm: "./assets/kon-calm.png",
  smile: "./assets/kon-calm.png",
  happy: "./assets/kon-happy.png",
  wink: "./assets/kon-wink.png",
  surprised: "./assets/kon-surprised.png",
  focus: "./assets/kon-focus.png",
  think: "./assets/kon-focus.png",
  heart: "./assets/kon-heart.png",
  sad: "./assets/kon-sad.png",
  sleepy: "./assets/kon-sleepy.png"
};

const CHARACTERS = {
  kon: {
    displayName: "コン",
    fullName: "ナンシキ村のコン",
    expressions: EXPRESSIONS
  },
  lee: {
    displayName: "リー",
    fullName: "ナンシキ村のリー",
    expressions: {
      calm: "./assets/lee-calm.png",
      smile: "./assets/lee-calm.png",
      happy: "./assets/lee-happy.png",
      wink: "./assets/lee-wink.png",
      surprised: "./assets/lee-surprised.png",
      focus: "./assets/lee-focus.png",
      think: "./assets/lee-focus.png",
      heart: "./assets/lee-heart.png",
      sad: "./assets/lee-sad.png",
      sleepy: "./assets/lee-sleepy.png"
    }
  }
};

// 表情PNG差し替え時に古いキャッシュが使われないようにする
const SPRITE_VERSION = "20260610-heartfix2";
for (const expressions of [CHARACTERS.kon.expressions, CHARACTERS.lee.expressions]) {
  for (const key of Object.keys(expressions)) {
    expressions[key] = `${expressions[key]}?v=${SPRITE_VERSION}`;
  }
}

function readStoredJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
}

const store = {
  name: localStorage.getItem("buddy-name") || "コン",
  character: localStorage.getItem("buddy-character") || "kon",
  color: localStorage.getItem("buddy-color") || "mint",
  spriteData: localStorage.getItem("buddy-sprite-data") || DEFAULT_SPRITE_SRC,
  spriteFrame: readStoredJson("buddy-sprite-frame", null),
  results: readStoredJson("buddy-results", []),
  daily: readStoredJson("buddy-daily", null),
  bond: readStoredJson("buddy-bond", null),
  preferences: readStoredJson("buddy-preferences", null),
  matchPrep: readStoredJson("buddy-match-prep", null),
  score: readStoredJson("buddy-score", null)
};

if (store.name === "こん") store.name = "コン";
if (store.name === "ナンシキ村のリー") store.name = "リー";
for (const result of store.results) {
  if (!result.type) result.type = result.title?.startsWith("試合") ? "match" : "practice";
}

const palettes = {
  mint: { cap: "#ff514d", side: "#17284e", bill: "#78e0df", cheek: "#ff65bd", accent: "#40c7bd" },
  sunset: { cap: "#ff7a45", side: "#6e315b", bill: "#ffd36d", cheek: "#ff79b7", accent: "#ff8b5d" },
  sky: { cap: "#48a7ff", side: "#153a78", bill: "#a7f3ff", cheek: "#ff82d2", accent: "#45aee8" },
  grape: { cap: "#9b74ff", side: "#3d286b", bill: "#7de2c6", cheek: "#ff77c8", accent: "#8d7df2" }
};

const rules = [
  {
    title: "ソフトテニスの基本",
    category: "match",
    tags: ["基本", "競技", "バウンド"],
    keys: "基本 ダブルス シングルス ボール バウンド",
    body: "ネットを挟んで相手と向かい合い、ラケットでゴムボールを打ち合ってポイントを競う競技。返球はノーバウンドかワンバウンドで行う、という理解から始めると入りやすいよ。",
    source: "JSTA「ソフトテニスとは」"
  },
  {
    title: "マッチとゲーム",
    category: "match",
    tags: ["マッチ", "ゲーム", "先取"],
    keys: "試合 マッチ ゲーム 7ゲーム 9ゲーム 先取",
    body: "試合全体をマッチ、その中の区切りをゲームと考える。7ゲームマッチなら4ゲーム先取、9ゲームマッチなら5ゲーム先取が基本として紹介されているよ。大会ごとの方式も必ず確認しよう。",
    source: "JSTA「ソフトテニスとは」"
  },
  {
    title: "1ゲームの得点",
    category: "match",
    tags: ["得点", "カウント", "ポイント"],
    keys: "得点 カウント ポイント 0 1 2 3 4",
    body: "通常の1ゲームは4ポイント先取が基本。カウントは0、1、2、3と数える。競った場面では、次の1本を急がずに今のカウントを声に出して確認すると落ち着ける。",
    source: "JSTA「ソフトテニスとは」"
  },
  {
    title: "ファイナルゲーム",
    category: "match",
    tags: ["ファイナル", "7点", "最終ゲーム"],
    keys: "ファイナル 最終ゲーム 7ポイント デュース",
    body: "ゲームカウントが並んだ時に行う最終ゲーム。基本は7ポイント先取として紹介される。サービス順やサイドチェンジは通常ゲームと違う扱いになるので、試合前に確認しておこう。",
    source: "JSTA「ソフトテニスとは」"
  },
  {
    title: "ダブルスの基本",
    category: "match",
    tags: ["ダブルス", "ペア", "前衛", "後衛"],
    keys: "ダブルス ペア 前衛 後衛 連携 ポジション",
    body: "2人で1ポイントを取りにいく種目。前衛は相手にプレッシャーをかけ、後衛は深い球や展開で流れを作る。役割は固定ではなく、状況に応じてカバーし合うのが強さになる。",
    source: "JSTA「ソフトテニスとは」"
  },
  {
    title: "シングルスの考え方",
    category: "match",
    tags: ["シングルス", "1対1", "配球"],
    keys: "シングルス 1人 1対1 コート 配球",
    body: "シングルスは1人でコートを守るため、無理な決め球よりも深さ、角度、相手を動かす配球が大切。体力配分とコートカバーも勝敗に直結する。",
    source: "JSTA「ソフトテニスとは」"
  },
  {
    title: "試合前の選択",
    category: "match",
    tags: ["トス", "サービス", "レシーブ", "コート"],
    keys: "試合前 トス コイントス ラケット サーブ レシーブ コート",
    body: "試合前には、サービス・レシーブ・コートなどを決める手続きがある。JSTAは2026年に本連盟主催大会でコイントスを実施する案内を出しているので、大会運用も見ておこう。",
    source: "JSTA 2026年案内"
  },
  {
    title: "サービスとは",
    category: "serve",
    tags: ["サービス", "サーブ", "開始"],
    keys: "サービス サーブ 始め方 ポイント 開始",
    body: "サービスはポイントを始めるためのプレー。狙いは強く打つことだけではなく、相手に次の球を打ちにくくさせること。まずは入る確率とコースの再現性を大切にしよう。",
    source: "JSTA 審判・技術等級資料"
  },
  {
    title: "サービスのコース",
    category: "serve",
    tags: ["サービスコート", "右", "左"],
    keys: "サービスコート 右 左 ライト レフト コース",
    body: "サービスは決められたサービスコートを狙って打つ。右・左のどちらに入れる場面かを間違えないことが大事。緊張した時は、打つ前にサービスコートを目で確認しよう。",
    source: "JSTA 審判・技術等級資料"
  },
  {
    title: "サービスの順序",
    category: "serve",
    tags: ["順番", "サーバー", "ペア"],
    keys: "サービス 順序 サーバー ペア 交代",
    body: "サービスには順序がある。特にダブルスでは、誰が打つか、どちら側から打つかをペアで確認することが大切。順序の勘違いは試合中に起きやすいので、カウントと一緒に声かけしよう。",
    source: "JSTA 審判・技術等級資料"
  },
  {
    title: "フォルト",
    category: "serve",
    tags: ["フォルト", "失敗", "サーブ"],
    keys: "フォルト サービス 失敗 サーブ 入らない",
    body: "サービスが決められた条件を満たさない時はフォルトになる。サーブ練習では、速さよりもフォーム、トス、足の位置、狙うコートを一定にすることから始めよう。",
    source: "JSTA 審判・技術等級資料"
  },
  {
    title: "サービスのレット",
    category: "serve",
    tags: ["レット", "ネット", "やり直し"],
    keys: "レット ネット サービス やり直し",
    body: "サービスでネットに触れた後の扱いなど、条件によってレットとしてやり直しになる場合がある。細かな条件は公式規則で確認し、審判の判定に従おう。",
    source: "JSTA ワンポイントレッスン"
  },
  {
    title: "レシーブの基本",
    category: "serve",
    tags: ["レシーブ", "返球", "1歩目"],
    keys: "レシーブ 返球 サーブ 受ける",
    body: "レシーブは相手サービスへの最初の返球。相手が打つ瞬間に軽く沈み、1歩目を早く出せる姿勢を作る。深く返す球と前衛の足元を狙う球を使い分けよう。",
    source: "JSTA 審判・技術等級資料"
  },
  {
    title: "レシーブの位置",
    category: "serve",
    tags: ["レシーブ", "位置", "ダブルス"],
    keys: "レシーブ 位置 ライト レフト サービスコート ダブルス",
    body: "ダブルスでは、レシーブ側の2人が担当する側を確認しておく。ゲーム中の扱いには決まりがあるので、試合前にペアで『どちらを受けるか』をはっきりさせよう。",
    source: "JSTA 審判・技術等級資料"
  },
  {
    title: "インプレー",
    category: "play",
    tags: ["インプレー", "ラリー", "継続"],
    keys: "インプレー ラリー プレー中 継続",
    body: "サービスからポイントが決まるまでのプレー中をインプレーと考える。インプレー中はボール、ライン、相手、ペアの位置を見ながら、次の1本を選ぶ。",
    source: "JSTA 審判・技術等級資料"
  },
  {
    title: "アウトとイン",
    category: "play",
    tags: ["アウト", "イン", "ライン"],
    keys: "アウト イン ライン 境界 判定",
    body: "ボールが有効な範囲に入ったか、外に出たかを判断する基本。ライン際は見間違いが起きやすいので、セルフジャッジの練習でも最後までボールを見る習慣を作ろう。",
    source: "JSTA 審判・技術等級資料"
  },
  {
    title: "ノーバウンドとワンバウンド",
    category: "play",
    tags: ["バウンド", "ボレー", "返球"],
    keys: "ノーバウンド ワンバウンド バウンド ボレー ストローク",
    body: "返球はノーバウンドまたはワンバウンドで行う。前衛のボレーはノーバウンド、後衛のストロークはワンバウンドが多いけれど、状況で役割は変わる。",
    source: "JSTA「ソフトテニスとは」"
  },
  {
    title: "ネットに当たった球",
    category: "play",
    tags: ["ネット", "ラリー", "有効"],
    keys: "ネット 当たる ラリー 有効 無効",
    body: "ラリー中にネットへ触れた球でも、その後に有効なコートへ入ればプレーが続く場面がある。サービス時とは扱いが違う場合があるので、混同しないようにしよう。",
    source: "JSTA 審判・技術等級資料"
  },
  {
    title: "相手コートへの侵入に注意",
    category: "play",
    tags: ["ネット", "接触", "安全"],
    keys: "ネット 相手 コート 侵入 接触 危険",
    body: "ネットや相手側のプレーを妨げる行為には注意。強く打った後の勢いでも、相手やネット付近への接触は危険につながる。安全を優先しよう。",
    source: "JSTA 審判・技術等級資料"
  },
  {
    title: "サイドチェンジ",
    category: "match",
    tags: ["チェンジサイズ", "サイド", "コート"],
    keys: "サイドチェンジ チェンジサイズ コート 交代",
    body: "試合中は決められたタイミングでコートを入れ替える。日差しや風の影響も変わるため、チェンジ時は次のゲームでどんな球を使うかペアで短く確認しよう。",
    source: "JSTA 審判・技術等級資料"
  },
  {
    title: "チェンジサービス",
    category: "serve",
    tags: ["チェンジサービス", "交代", "サービス"],
    keys: "チェンジサービス サービス 交代 ゲーム",
    body: "サービスを行う側はゲームや場面によって交代する。特にファイナルでは順序を間違えやすいので、審判・ペア・相手とカウントを確認しながら進めよう。",
    source: "JSTA 審判・技術等級資料"
  },
  {
    title: "審判の役割",
    category: "judge",
    tags: ["審判", "アンパイヤー", "判定"],
    keys: "審判 アンパイヤー 主審 副審 判定",
    body: "審判はポイント、ライン、反則、進行を管理する役割。プレーヤーは判定に感情的にならず、確認が必要な時は落ち着いて手順に従うことが大事。",
    source: "JSTA 審判・技術等級"
  },
  {
    title: "スコアの伝え方",
    category: "judge",
    tags: ["スコア", "カウント", "コール"],
    keys: "スコア カウント コール 審判 得点",
    body: "審判やプレーヤーはカウントを正しく共有する必要がある。間違いを防ぐため、ポイント後に現在のカウントを声に出す習慣は練習試合でも役立つ。",
    source: "JSTA 審判・技術等級"
  },
  {
    title: "抗議ではなく確認",
    category: "judge",
    tags: ["判定", "確認", "態度"],
    keys: "判定 抗議 確認 審判 態度",
    body: "判定に疑問がある時も、まずは落ち着いて確認する。相手や審判を責める言い方ではなく、『今の判定を確認してもいいですか』という姿勢がフェアプレーにつながる。",
    source: "JSTA マナーBOOK"
  },
  {
    title: "フェアプレー",
    category: "manner",
    tags: ["フェアプレー", "競技精神", "最善"],
    keys: "マナー フェアプレー 競技精神 態度",
    body: "競技者は規則を守り、フェアプレーの精神を大切にし、最善を尽くすことが求められる。勝つための工夫と、相手を尊重する姿勢は両方必要だよ。",
    source: "JSTA 規則PDF"
  },
  {
    title: "あいさつと礼",
    category: "manner",
    tags: ["あいさつ", "礼", "相手"],
    keys: "挨拶 あいさつ 礼 マナー 相手",
    body: "試合前後のあいさつは、相手・審判・大会運営への敬意を表す大切な行動。強い選手ほど、プレー以外の所作も安定している。",
    source: "JSTA マナーBOOK"
  },
  {
    title: "ペアへの声かけ",
    category: "manner",
    tags: ["ペア", "声かけ", "雰囲気"],
    keys: "ペア 声かけ ミス 励ます ダブルス",
    body: "ミスの後に責める言葉を使うと、次のポイントの判断が固くなる。『次は深くいこう』『今の狙いはよかった』のように、次の行動へつながる声を選ぼう。",
    source: "JSTA マナーBOOK"
  },
  {
    title: "安全と体調",
    category: "manner",
    tags: ["安全", "体調", "熱中症"],
    keys: "安全 体調 熱中症 水分 休憩",
    body: "練習や試合では体調管理もルール以前の大切な土台。暑さ、疲労、けがの兆候がある時は無理をしない。水分、休憩、周囲への報告を忘れないようにしよう。",
    source: "JSTA マナーBOOK"
  },
  {
    title: "ラケット",
    category: "gear",
    tags: ["ラケット", "用具", "公認"],
    keys: "ラケット 用具 公認 マーク",
    body: "公式戦では大会や連盟の用具ルールに合ったラケットを使う。JSTAは2026年に公認ラケットの公認マーク廃止について案内しているため、最新の扱いも確認しよう。",
    source: "JSTA 2026年案内"
  },
  {
    title: "ボール",
    category: "gear",
    tags: ["ボール", "ゴムボール", "用具"],
    keys: "ボール ゴムボール 空気 用具",
    body: "ソフトテニスはゴムボールを使う。ボールの状態は弾みや打球感に影響するため、練習でも極端に空気が抜けた球ばかり使わないようにしよう。",
    source: "JSTA 用具・用品規程"
  },
  {
    title: "コートとライン",
    category: "gear",
    tags: ["コート", "ライン", "施設"],
    keys: "コート ライン 施設 サービスライン ベースライン",
    body: "ラインの意味を知ると、アウト・イン、サービスコート、配球の狙いが分かりやすくなる。初心者はまずベースライン、サイドライン、サービスラインを覚えよう。",
    source: "JSTA 用具・用品規程"
  },
  {
    title: "ユニフォーム・シューズ",
    category: "gear",
    tags: ["ユニフォーム", "シューズ", "大会"],
    keys: "ユニフォーム シューズ 服装 大会 要項",
    body: "大会では服装やシューズに決まりがある場合がある。学校内の練習試合と公式大会では扱いが違うこともあるので、大会要項を読んで準備しよう。",
    source: "JSTA 用具・用品規程"
  },
  {
    title: "ポイントを失う主な場面",
    category: "trouble",
    tags: ["失点", "アウト", "反則"],
    keys: "ポイント 失う 失点 アウト フォルト 反則",
    body: "アウト、返球できない、サービスの失敗、プレーを妨げる行為、ネットや相手側への接触などは失点につながる。試合中は『何で失点したか』を短く分類すると、次の練習テーマに変えやすい。",
    source: "JSTA 競技規則PDF"
  },
  {
    title: "フットフォルトに注意",
    category: "serve",
    tags: ["フットフォルト", "サービス", "足"],
    keys: "フットフォルト 足 サーブ サービス ライン 踏む",
    body: "サービス時に足の位置やラインの扱いを誤るとフットフォルトになることがある。サーブ練習では、打つ前の足の場所を決め、トスと同じくらい毎回確認しよう。",
    source: "JSTA 競技規則PDF"
  },
  {
    title: "サービスを打つ前の確認",
    category: "serve",
    tags: ["サービス", "構え", "確認"],
    keys: "サーブ 打つ前 準備 レディ サービスコート",
    body: "サービス前は、サービスコート、相手の準備、ペアの位置、自分の足の位置を確認する。慌てて始めるより、同じ手順を作る方が試合で安定する。",
    source: "JSTA 競技規則PDF"
  },
  {
    title: "レシーバーの準備",
    category: "serve",
    tags: ["レシーブ", "準備", "構え"],
    keys: "レシーバー 準備 レシーブ レディ 受ける",
    body: "レシーブ側も、相手が打つ前に構えと担当範囲を整える。準備が遅れると詰まりやすいので、相手の動作を見て小さく沈む習慣を作ろう。",
    source: "JSTA 審判・技術等級"
  },
  {
    title: "ファイナルのサービス交替",
    category: "match",
    tags: ["ファイナル", "サービス", "交替"],
    keys: "ファイナル サービス 交替 順番 2ポイント",
    body: "ファイナルゲームでは通常ゲームとサービス順の感覚が変わる。ポイントごとの進行に合わせてサービス側が交替するため、審判のコールとペアでの確認を必ず聞こう。",
    source: "JSTA 競技規則PDF"
  },
  {
    title: "ファイナルのサイドチェンジ",
    category: "match",
    tags: ["ファイナル", "サイド", "チェンジ"],
    keys: "ファイナル サイドチェンジ チェンジサイズ コート 交替",
    body: "ファイナルゲームではサイドを替えるタイミングも通常ゲームとは違う。風や日差しの影響を受けるので、チェンジ時に次の狙いをペアで短く共有しよう。",
    source: "JSTA 競技規則PDF"
  },
  {
    title: "デュースになったら",
    category: "trouble",
    tags: ["デュース", "接戦", "カウント"],
    keys: "デュース 接戦 3-3 競る カウント",
    body: "ゲーム内でカウントが並んだ時は、焦って決め急がない。まず現在のカウントを確認し、次の1本の狙いを『深く返す』『足元へ』のように短く決めよう。",
    source: "JSTA「ソフトテニスとは」"
  },
  {
    title: "レットと言われたら",
    category: "trouble",
    tags: ["レット", "やり直し", "確認"],
    keys: "レット やり直し ネット 中断 コール",
    body: "レットは条件によりプレーをやり直す扱い。自分で決めつけず、審判のコールを聞いて、どこから再開するかを確認しよう。",
    source: "JSTA ソフトテニス用語"
  },
  {
    title: "インかアウトか迷った時",
    category: "trouble",
    tags: ["イン", "アウト", "判定"],
    keys: "迷った イン アウト ライン セルフジャッジ 判定",
    body: "ライン際で迷った時は、感情的に言い切らず、審判や相手との確認を落ち着いて行う。練習でも『最後まで見る』習慣を作ると、判定への納得感が上がる。",
    source: "JSTA マナーBOOK"
  },
  {
    title: "ネットに触れたかもしれない時",
    category: "trouble",
    tags: ["ネット", "接触", "確認"],
    keys: "ネット 触った 接触 タッチ 妨害 反則",
    body: "インプレー中に身体、ラケット、着衣などがネット付近へ触れると反則になる場合がある。迷った時は審判の判定を待ち、次からは打った後の体の流れも意識しよう。",
    source: "JSTA ソフトテニス用語"
  },
  {
    title: "プレーを妨げた時",
    category: "trouble",
    tags: ["妨害", "安全", "反則"],
    keys: "妨害 邪魔 相手 プレー 反則 インターフェア",
    body: "相手のプレーを妨げる行為は、故意でなくても問題になることがある。ネット付近や相手コート近くでは、安全と相手の動線を優先しよう。",
    source: "JSTA 競技規則PDF"
  },
  {
    title: "ボールが2回当たったように見えた時",
    category: "trouble",
    tags: ["二度打ち", "打球", "確認"],
    keys: "二度打ち 2回 当たる ダブルヒット 打球",
    body: "打球が不自然に2回当たったように見える場面は、判定が難しくなりやすい。自分で断定せず、審判の判断を聞き、次のポイントへ気持ちを切り替えよう。",
    source: "JSTA 競技規則PDF"
  },
  {
    title: "審判コール: プレーボール",
    category: "call",
    tags: ["コール", "開始", "審判"],
    keys: "プレーボール 開始 コール 審判",
    body: "試合やゲームを始める時の合図。コールが聞こえたら、サービス側・レシーブ側ともに準備できているかを確認してからプレーに入ろう。",
    source: "JSTA ソフトテニス用語"
  },
  {
    title: "審判コール: フォルト",
    category: "call",
    tags: ["コール", "フォルト", "サービス"],
    keys: "フォルト コール サーブ サービス 失敗",
    body: "サービスが有効にならなかった時のコール。練習ではフォルトの理由を『コース』『足』『トス』『力み』に分けて記録すると改善しやすい。",
    source: "JSTA ソフトテニス用語"
  },
  {
    title: "審判コール: レット",
    category: "call",
    tags: ["コール", "レット", "やり直し"],
    keys: "レット コール やり直し 中断",
    body: "条件によりプレーをやり直す時のコール。選手は勝手に再開せず、審判の指示とカウントを確認してからプレーを続けよう。",
    source: "JSTA ソフトテニス用語"
  },
  {
    title: "審判コール: チェンジサイズ",
    category: "call",
    tags: ["コール", "サイド", "交替"],
    keys: "チェンジサイズ サイドチェンジ コール コート 交替",
    body: "サイドを替える合図として使われるコール。移動中に長く反省しすぎず、風・日差し・次のサービスを短く確認する時間にしよう。",
    source: "JSTA ソフトテニス用語"
  },
  {
    title: "審判コール: チェンジサービス",
    category: "call",
    tags: ["コール", "サービス", "交替"],
    keys: "チェンジサービス コール サービス 交替",
    body: "サービスを行う側が替わる合図。特にダブルスやファイナルでは順序を勘違いしやすいので、ペアで『次は誰がどちらから』を確認しよう。",
    source: "JSTA ソフトテニス用語"
  },
  {
    title: "審判コール: ゲーム",
    category: "call",
    tags: ["コール", "ゲーム", "得点"],
    keys: "ゲーム コール 獲得 終了 カウント",
    body: "そのゲームが終わったことを示すコール。次のゲームに入る前に、サービス順、サイド、ペアの声かけを確認して流れを切らさないようにしよう。",
    source: "JSTA ソフトテニス用語"
  },
  {
    title: "ヒートルール",
    category: "manner",
    tags: ["暑さ", "熱中症", "休憩"],
    keys: "ヒートルール 暑さ 熱中症 35度 休憩 ファイナル",
    body: "暑さが厳しい大会では、ヒートルールなど安全のための運用が行われる場合がある。大会要項と当日の審判・レフェリーの指示を確認し、無理をしないことが大切。",
    source: "JSTA ヒートルール案内"
  },
  {
    title: "タイムや休憩の扱い",
    category: "trouble",
    tags: ["休憩", "タイム", "中断"],
    keys: "タイム 休憩 中断 けが 体調",
    body: "体調不良やけが、暑さなどで不安がある時は、我慢せず周囲や審判に伝える。ルール上の扱いは大会や状況で変わるため、審判の指示に従おう。",
    source: "JSTA 競技規則PDF"
  },
  {
    title: "ラケットやボールに異常がある時",
    category: "trouble",
    tags: ["用具", "ラケット", "ボール"],
    keys: "ラケット ボール 壊れた 空気 用具 異常",
    body: "ラケットやボールの状態に異常を感じたら、勝手にプレーを止め続けず、審判や大会運営に確認する。練習では用具チェックを試合前ルーティンに入れよう。",
    source: "JSTA 用具・用品規程"
  },
  {
    title: "大会要項を読む理由",
    category: "trouble",
    tags: ["大会", "要項", "確認"],
    keys: "大会要項 ローカルルール 試合形式 服装 集合",
    body: "試合形式、ゲーム数、服装、集合、審判の割り当てなどは大会要項で指定されることがある。公式規則だけでなく、その大会の案内も必ず確認しよう。",
    source: "JSTA 競技規則PDF"
  }
];

let W = 0, H = 0, dpr = 1, t = 0, blinkTimer = 0, mood = "smile";
let bubbleTimer = 0;
let activeRuleCategory = "all";
let spriteImage = new Image();
let spriteReady = false;
let spriteFrameCanvas = null;
let expressionTimer = 0;
let lastFrameTime = 0;
let petPhysicsReady = false;
const petPhysics = {
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  rotation: 0,
  angular: 0,
  scaleX: 1,
  scaleY: 1,
  radiusX: 66,
  radiusY: 70,
  dragging: false,
  active: false,
  settleTimer: 0,
  lastPointerX: 0,
  lastPointerY: 0,
  lastPointerTime: 0
};

petNameInput.value = store.name;
characterSelect.value = store.character;
petColorSelect.value = store.color;
document.querySelector("#todayLabel").textContent = new Intl.DateTimeFormat("ja-JP", { month: "short", day: "numeric" }).format(new Date());

function ensurePreferences() {
  if (!store.preferences) {
    store.preferences = {
      talkStyle: store.character === "lee" ? "energetic" : "gentle",
      coachPolicy: "basic",
      playerRole: "both",
      playerLevel: "middle",
      playerGoal: ""
    };
  }
  if (!store.preferences.scoreMode) store.preferences.scoreMode = "simple";
}

const conditionOptions = {
  good: {
    label: "元気",
    mood: "happy",
    practiceCondition: "good",
    line: {
      kon: "今日は少し攻めても大丈夫そう。いい1本を増やしていこう。",
      lee: "いい調子！今日は勢いを使って、決める練習まで行こう！"
    }
  },
  normal: {
    label: "ふつう",
    mood: "calm",
    practiceCondition: "normal",
    line: {
      kon: "いつものリズムで大丈夫。テーマを1つに絞ると伸びやすいよ。",
      lee: "いつも通りなら十分！まず1テーマ、きっちり積み上げよう！"
    }
  },
  tired: {
    label: "疲れ気味",
    mood: "sleepy",
    practiceCondition: "tired",
    line: {
      kon: "今日は体を守りながらいこう。短く、ていねいに、確認中心でいいよ。",
      lee: "疲れてる日は無理しない作戦！軽めでも、意味のある1本は作れるよ！"
    }
  },
  nervous: {
    label: "緊張",
    mood: "focus",
    practiceCondition: "normal",
    line: {
      kon: "緊張していても大丈夫。呼吸と最初の1本だけ決めよう。",
      lee: "緊張は本気のしるし！深呼吸して、最初の1本に集中しよう！"
    }
  }
};

const dailyMissions = [
  { id: "serve-routine", goal: "serve", text: "サーブ前のルーティンを3回そろえる" },
  { id: "deep-receive", goal: "receive", text: "レシーブで深く返す球を5本ねらう" },
  { id: "front-call", goal: "front", text: "前衛で出る球を1種類だけ決めて試す" },
  { id: "back-depth", goal: "back", text: "後衛で深い球を3本続ける場面を作る" },
  { id: "pair-voice", goal: "pair", text: "ペアに次の行動へつながる声を3回かける" },
  { id: "reset-breath", goal: "pair", text: "ミスの後に深呼吸して、次の狙いを声に出す" }
];

const matchPrepItems = [
  { id: "gear", group: "持ち物", text: "ラケット・ボール・タオル・飲み物を確認" },
  { id: "uniform", group: "持ち物", text: "ユニフォーム・シューズ・ゼッケンを確認" },
  { id: "format", group: "ルール", text: "試合形式、ゲーム数、ファイナルの流れを確認" },
  { id: "serve-order", group: "ルール", text: "サービス順とレシーブ担当をペアで確認" },
  { id: "signals", group: "ペア", text: "前衛が出る合図、苦しい時の合図を2つ決める" },
  { id: "first-point", group: "作戦", text: "最初の1本の狙いを決める" },
  { id: "condition", group: "体調", text: "水分、暑さ、けがの不安を確認" },
  { id: "mind", group: "メンタル", text: "深呼吸して、ミス後の戻り方を決める" }
];

function ensureMatchPrep() {
  const date = todayKey();
  if (!store.matchPrep || store.matchPrep.date !== date) {
    store.matchPrep = {
      date,
      checked: {}
    };
    saveStore();
  }
}

const scoreCallNames = ["ゼロ", "ワン", "ツー", "スリー", "フォー", "ファイブ", "シックス"];

function newScoreState(format = 7, opponent = "", players = null) {
  return {
    format,
    opponent,
    games: { us: 0, them: 0 },
    points: { us: 0, them: 0 },
    finalGame: false,
    finished: false,
    winner: null,
    saved: false,
    history: [],
    serveSide: "us",
    server: 1,
    faultCount: 0,
    players: players || ["選手1", "選手2"],
    log: []
  };
}

function ensureScore() {
  if (!store.score || !store.score.games || !store.score.points) {
    store.score = newScoreState();
  }
  const state = store.score;
  if (!Array.isArray(state.history)) state.history = [];
  if (state.serveSide !== "us" && state.serveSide !== "them") state.serveSide = "us";
  if (state.server !== 1 && state.server !== 2) state.server = 1;
  if (typeof state.faultCount !== "number") state.faultCount = 0;
  if (!Array.isArray(state.players) || state.players.length !== 2) state.players = ["選手1", "選手2"];
  if (!Array.isArray(state.log)) state.log = [];
}

function scoreGamesToWin(format) {
  return Math.ceil(format / 2);
}

function scoreTargetPoints(state) {
  return state.finalGame ? 7 : 4;
}

function scoreOpponentLabel(state) {
  return state.opponent || "あいて";
}

function scoreCall(state) {
  const { us, them } = state.points;
  const target = scoreTargetPoints(state);
  if (us >= target - 1 && them >= target - 1) {
    if (us === them) return "デュース";
    return us > them ? "アドバンテージ こっち" : `アドバンテージ ${scoreOpponentLabel(state)}`;
  }
  const call = n => scoreCallNames[n] || String(n);
  if (us === 0 && them === 0) return state.finalGame ? "ファイナルゲーム スタート" : "ゼロオール";
  if (us === them) return `${call(us)}オール`;
  return `${call(us)}・${call(them)}`;
}

function scoreGamePointSide(state) {
  const target = scoreTargetPoints(state);
  const { us, them } = state.points;
  if (us >= target - 1 && us - them >= 1) return "us";
  if (them >= target - 1 && them - us >= 1) return "them";
  return null;
}

function pushScoreHistory(state) {
  state.history.push(JSON.stringify({
    games: state.games,
    points: state.points,
    finalGame: state.finalGame,
    finished: state.finished,
    winner: state.winner,
    serveSide: state.serveSide,
    server: state.server,
    faultCount: state.faultCount,
    logLen: state.log.length
  }));
  if (state.history.length > 80) state.history.shift();
}

function addScorePoint(side, info = {}) {
  ensureScore();
  const state = store.score;
  if (state.finished) return;
  pushScoreHistory(state);
  state.points[side] += 1;
  const ourServe = state.serveSide === "us";
  state.log.push({
    g: state.games.us + state.games.them,
    side,
    player: info.player || null,
    reason: info.reason || "point",
    serve: state.serveSide,
    server: ourServe ? state.server : null,
    firstIn: ourServe ? state.faultCount === 0 && info.reason !== "dfault" : null
  });
  state.faultCount = 0;
  if (state.log.length > 300) state.log.shift();
  const target = scoreTargetPoints(state);
  const { us, them } = state.points;
  let gameWon = null;
  if (Math.max(us, them) >= target && Math.abs(us - them) >= 2) {
    gameWon = us > them ? "us" : "them";
    state.games[gameWon] += 1;
    state.points = { us: 0, them: 0 };
    state.finalGame = false;
    state.serveSide = state.serveSide === "us" ? "them" : "us";
    if (state.serveSide === "us") state.server = 1;
    const need = scoreGamesToWin(state.format);
    if (state.games[gameWon] >= need) {
      state.finished = true;
      state.winner = gameWon;
    } else if (state.games.us === need - 1 && state.games.them === need - 1) {
      state.finalGame = true;
    }
  } else {
    // サーバーは2ポイントごとに交代（ファイナルはサーブ権もチーム間で交互）
    const pointsInGame = state.points.us + state.points.them;
    if (pointsInGame % 2 === 0) {
      if (state.finalGame) {
        state.serveSide = state.serveSide === "us" ? "them" : "us";
        if (state.serveSide === "us") state.server = state.server === 1 ? 2 : 1;
      } else if (state.serveSide === "us") {
        state.server = state.server === 1 ? 2 : 1;
      }
    }
  }
  saveStore();
  renderScoreBoard();
  announceScore(state, side, gameWon);
}

function registerScoreFault() {
  ensureScore();
  const state = store.score;
  if (state.finished) return;
  state.faultCount += 1;
  if (state.faultCount >= 2) {
    state.faultCount = 0;
    const receiver = state.serveSide === "us" ? "them" : "us";
    addScorePoint(receiver, { reason: "dfault" });
    return;
  }
  saveStore();
  renderScoreBoard();
  setExpression("focus", 700);
}

function announceScore(state, side, gameWon) {
  const lee = store.character === "lee";
  if (state.finished) {
    const won = state.winner === "us";
    addBondXp(won ? 20 : 12, won ? "試合に勝った" : "最後まで戦い抜いた", won ? "heart" : "calm", false);
    if (won) {
      petSay(lee
        ? `マッチ勝利！${state.games.us}-${state.games.them}、最高の試合だった！`
        : `マッチ勝利、${state.games.us}-${state.games.them}。落ち着いて取り切れたね。おめでとう。`, "heart");
    } else {
      petSay(lee
        ? "悔しいけど、ここまで戦えたのが力だよ。次は取り返そう！"
        : "負けは次の材料になるよ。よかった1本を、結果メモに残しておこう。", "sad");
    }
    return;
  }
  if (gameWon) {
    if (state.finalGame) {
      petSay(lee ? "ついにファイナル！7点先取、思い切っていこう！" : "ファイナルゲームだね。1本ずつ、カウントを声に出して確認しよう。", "focus");
    } else if (gameWon === "us") {
      petSay(lee ? "ゲーム取った！この流れ、つなげよう！" : "いいゲームだったね。次も最初の1本をていねいに。", "happy");
    } else {
      petSay(lee ? "1ゲーム取られたけど、まだまだ！切り替えよう！" : "取られた後こそ深呼吸。次のゲームの入りを大事にね。", "focus");
    }
    return;
  }
  const gamePoint = scoreGamePointSide(state);
  if (state.points.us === state.points.them && state.points.us >= scoreTargetPoints(state) - 1) {
    petSay(lee ? "デュース！ここからが勝負どころ！" : "デュースだね。急がず、狙いを1つに絞ろう。", "focus");
  } else if (gamePoint === "us") {
    petSay(lee ? "ゲームポイント！思い切っていこう！" : "ゲームポイントだよ。いつも通りの1本でいい。", "focus");
  } else if (gamePoint === "them") {
    petSay(lee ? "ピンチだけど1本ずつ！まず返そう！" : "相手のゲームポイント。1本しのげば流れは変わるよ。", "focus");
  } else if (side === "us") {
    setExpression("happy", 900);
  } else {
    setExpression("calm", 900);
  }
}

function undoScorePoint() {
  ensureScore();
  const state = store.score;
  const last = state.history.pop();
  if (!last) {
    petSay("取り消せる記録がまだないよ。", "calm");
    return;
  }
  const snap = JSON.parse(last);
  state.games = snap.games;
  state.points = snap.points;
  state.finalGame = snap.finalGame;
  state.finished = snap.finished;
  state.winner = snap.winner;
  if (snap.serveSide) state.serveSide = snap.serveSide;
  if (snap.server === 1 || snap.server === 2) state.server = snap.server;
  state.faultCount = snap.faultCount || 0;
  if (typeof snap.logLen === "number") state.log = state.log.slice(0, snap.logLen);
  if (!state.finished) state.saved = false;
  saveStore();
  renderScoreBoard();
  petSay("1本前に戻したよ。", "calm");
}

function resetScore(format) {
  ensureScore();
  store.score = newScoreState(format ?? store.score.format, store.score.opponent, store.score.players);
  saveStore();
  renderScoreBoard();
}

function scoreAnalysisStats(state) {
  const stats = {
    players: [
      { win: 0, miss: 0, servePts: 0, firstIn: 0, df: 0 },
      { win: 0, miss: 0, servePts: 0, firstIn: 0, df: 0 }
    ],
    dfUs: 0,
    dfThem: 0,
    otherWin: 0,
    otherLose: 0
  };
  for (const entry of state.log) {
    if (entry.server === 1 || entry.server === 2) {
      const server = stats.players[entry.server - 1];
      server.servePts += 1;
      if (entry.firstIn) server.firstIn += 1;
      if (entry.reason === "dfault") server.df += 1;
    }
    if (entry.reason === "dfault") {
      if (entry.side === "us") stats.dfThem += 1;
      else stats.dfUs += 1;
    } else if (entry.side === "us") {
      if (entry.player) stats.players[entry.player - 1].win += 1;
      else stats.otherWin += 1;
    } else if (entry.player) {
      stats.players[entry.player - 1].miss += 1;
    } else {
      stats.otherLose += 1;
    }
  }
  return stats;
}

function firstServeText(playerStats) {
  if (!playerStats.servePts) return "—";
  return `${Math.round(playerStats.firstIn / playerStats.servePts * 100)}% (${playerStats.firstIn}/${playerStats.servePts})`;
}

function dfRateText(playerStats) {
  if (!playerStats.servePts) return "—";
  return `${Math.round(playerStats.df / playerStats.servePts * 100)}% (${playerStats.df}/${playerStats.servePts})`;
}

function saveScoreToResults() {
  ensureScore();
  const state = store.score;
  if (!state.finished || state.saved) return;
  const won = state.winner === "us";
  const opponent = scoreOpponentLabel(state);
  let good = won ? "ゲームを取り切れた" : "最後まで集中して戦えた";
  let next = won ? "勝てた形をもう一度確認する" : "取られた場面の入り方を見直す";
  let focus = "mental";
  if (store.preferences?.scoreMode === "analysis" && state.log.length) {
    const stats = scoreAnalysisStats(state);
    const [p1, p2] = state.players;
    good = `得点: ${p1} ${stats.players[0].win}本 / ${p2} ${stats.players[1].win}本（相手ミスほか ${stats.otherWin}本）`;
    if (stats.dfUs > 0) {
      const dfier = stats.players[0].df >= stats.players[1].df ? 0 : 1;
      next = `ダブルフォルト（${state.players[dfier]} ${stats.players[dfier].df}本）をなくす`;
      focus = "serve";
    } else {
      const missier = stats.players[0].miss >= stats.players[1].miss ? 0 : 1;
      next = `ミス（${state.players[missier]} ${stats.players[missier].miss}本）の場面をペアで振り返る`;
      focus = "pair";
    }
  }
  store.results.unshift({
    date: new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium" }).format(new Date()),
    title: `試合 vs ${opponent} ${state.games.us}-${state.games.them} ${won ? "勝ち" : "負け"}`,
    good,
    next,
    focus,
    type: "match",
    match: {
      format: state.format,
      opponent,
      won,
      games: { ...state.games },
      players: [...state.players],
      log: state.log.slice(-200)
    }
  });
  state.saved = true;
  saveStore();
  renderResults();
  renderScoreBoard();
  document.querySelector('[data-tab="result"]').click();
  petSay("結果メモに残したよ。できたことを書き足すと、次につながるよ。", "happy");
}

const focusLabels = {
  serve: "サーブ",
  receive: "レシーブ",
  front: "前衛",
  back: "後衛",
  pair: "ペア連携",
  mental: "メンタル"
};

const focusSteps = {
  serve: "サーブ前の形を決めて、同じトスで10本打つ",
  receive: "レシーブを深く返す球と足元へ落とす球を分ける",
  front: "出る球を1種類だけ決めて、迷わず動く",
  back: "深い球を3本続けてから、1本だけ展開球を混ぜる",
  pair: "ペアと合図を2つ決め、ポイント後に短く確認する",
  mental: "ミス後に深呼吸して、次の狙いを声に出す"
};

function ensureBond() {
  if (!store.bond) {
    store.bond = {
      xp: 0,
      logs: []
    };
  }
}

function bondLevel(xp = 0) {
  return Math.floor(xp / 100) + 1;
}

function bondProgress(xp = 0) {
  return xp % 100;
}

function addBondXp(amount, label, mood = "happy", announce = true) {
  ensureBond();
  const beforeLevel = bondLevel(store.bond.xp);
  store.bond.xp += amount;
  store.bond.logs.unshift({
    date: new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric" }).format(new Date()),
    label,
    amount
  });
  store.bond.logs = store.bond.logs.slice(0, 5);
  const afterLevel = bondLevel(store.bond.xp);
  saveStore();
  renderDailyPlan();
  renderWeeklyReview();
  renderResultStats();
  if (!announce) return;
  if (afterLevel > beforeLevel) {
    petSay(store.character === "lee"
      ? `相棒Lv.${afterLevel}にアップ！やった、どんどん息が合ってきた！`
      : `相棒Lv.${afterLevel}になったよ。少しずつ、いい相棒になってきたね。`, "heart");
  } else {
    petSay(`${label} +${amount}XP`, mood);
  }
}

function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function missionForToday(dateKey) {
  const seed = [...dateKey].reduce((sum, ch) => sum + ch.charCodeAt(0), store.character === "lee" ? 3 : 0);
  return dailyMissions[seed % dailyMissions.length];
}

function focusFromPolicy() {
  ensurePreferences();
  return {
    basic: "serve",
    match: "pair",
    mental: "mental",
    pair: "pair"
  }[store.preferences.coachPolicy] || "serve";
}

function weeklyFocus() {
  if (store.results.length) {
    const latest = store.results[0];
    if (latest.focus && focusLabels[latest.focus]) return latest.focus;
    const analysis = analyzeResult(`${latest.title || ""} ${latest.good || ""} ${latest.next || ""}`);
    const found = Object.entries(resultFocuses).find(([, value]) => value === analysis);
    if (found?.[0]) return found[0];
  }
  const mission = store.daily ? currentMission() : missionForToday(todayKey());
  return mission?.goal || focusFromPolicy();
}

function ensureDailyPlan() {
  const date = todayKey();
  if (!store.daily || store.daily.date !== date) {
    const mission = missionForToday(date);
    store.daily = {
      date,
      condition: "normal",
      missionId: mission.id,
      missionDone: false
    };
    saveStore();
  }
}

function saveStore() {
  localStorage.setItem("buddy-name", store.name);
  localStorage.setItem("buddy-character", store.character);
  localStorage.setItem("buddy-color", store.color);
  localStorage.setItem("buddy-daily", JSON.stringify(store.daily));
  localStorage.setItem("buddy-bond", JSON.stringify(store.bond));
  localStorage.setItem("buddy-preferences", JSON.stringify(store.preferences));
  localStorage.setItem("buddy-match-prep", JSON.stringify(store.matchPrep));
  localStorage.setItem("buddy-score", JSON.stringify(store.score));
  try {
    if (store.spriteData) localStorage.setItem("buddy-sprite-data", store.spriteData);
    else localStorage.removeItem("buddy-sprite-data");
    if (store.spriteFrame) localStorage.setItem("buddy-sprite-frame", JSON.stringify(store.spriteFrame));
    else localStorage.removeItem("buddy-sprite-frame");
  } catch {
    localStorage.removeItem("buddy-sprite-data");
    localStorage.removeItem("buddy-sprite-frame");
  }
  localStorage.setItem("buddy-results", JSON.stringify(store.results.slice(0, 30)));
}

function resize() {
  const rect = canvas.getBoundingClientRect();
  dpr = Math.min(devicePixelRatio || 1, 3);
  W = rect.width;
  H = rect.height;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  clampPetIntoCourt();
}

window.addEventListener("resize", resize);
resize();

function petSay(text, newMood = "smile") {
  mood = newMood;
  speech.textContent = text;
  bubbleTimer = 1.2;
  setExpression(newMood);
}

function setExpression(name = "calm", temporaryMs = 0) {
  if (!spritePet) return;
  const character = CHARACTERS[store.character] || CHARACTERS.kon;
  const src = character.expressions[name] || character.expressions.calm;
  if (spritePet.getAttribute("src") !== src) {
    spritePet.setAttribute("src", src);
    spritePet.classList.remove("expression-pop");
    void spritePet.offsetWidth;
    spritePet.classList.add("expression-pop");
    setTimeout(() => spritePet.classList.remove("expression-pop"), 260);
  }
  if (expressionTimer) clearTimeout(expressionTimer);
  if (temporaryMs) {
    expressionTimer = setTimeout(() => setExpression("calm"), temporaryMs);
  }
}

function syncCharacterCards() {
  characterCards.forEach(card => {
    const active = card.dataset.character === store.character;
    card.classList.toggle("active", active);
    card.setAttribute("aria-pressed", String(active));
  });
  characterSelect.value = store.character;
}

function syncPreferenceControls() {
  ensurePreferences();
  talkStyleSelect.value = store.preferences.talkStyle;
  coachPolicySelect.value = store.preferences.coachPolicy;
  playerRoleSelect.value = store.preferences.playerRole;
  playerLevelSelect.value = store.preferences.playerLevel;
  playerGoalInput.value = store.preferences.playerGoal || "";
  document.querySelector("#practiceRole").value = store.preferences.playerRole;
  document.querySelector("#practiceLevel").value = store.preferences.playerLevel;
  const scoreModeSelect = document.querySelector("#scoreMode");
  if (scoreModeSelect) scoreModeSelect.value = store.preferences.scoreMode;
}

function policyGoal() {
  ensurePreferences();
  return {
    basic: "serve",
    match: "pair",
    mental: "pair",
    pair: "pair"
  }[store.preferences.coachPolicy] || "serve";
}

function styleReply(text) {
  ensurePreferences();
  const goal = store.preferences.playerGoal ? ` 目標「${store.preferences.playerGoal}」に近づく1本として見よう。` : "";
  const policy = {
    basic: "基礎を崩さず、フォームと再現性を大切にしよう。",
    match: "試合で使う場面まで想像して、1本ごとに判断を入れよう。",
    mental: "焦った時ほど呼吸とカウント確認。心を戻す手順も練習だよ。",
    pair: "ペアと同じ絵を見ることを大事にしよう。短い声かけが武器になるよ。"
  }[store.preferences.coachPolicy] || "";
  const style = {
    gentle: "大丈夫、少しずつ整えていこう。",
    energetic: "いいね、ここから上げていこう！",
    strict: "今日は甘く見ないよ。課題を1つ決めて、やり切ろう。",
    praise: "ここまで考えられている時点で、とてもいいよ。"
  }[store.preferences.talkStyle] || "";
  return `${text} ${style} ${policy}${goal}`.replace(/\s+/g, " ").trim();
}

function selectCharacter(characterId, announce = true) {
  store.character = characterId;
  const character = CHARACTERS[store.character] || CHARACTERS.kon;
  store.name = character.displayName;
  petNameInput.value = store.name;
  ensurePreferences();
  if (!localStorage.getItem("buddy-preferences")) {
    store.preferences.talkStyle = store.character === "lee" ? "energetic" : "gentle";
  }
  syncCharacterCards();
  syncPreferenceControls();
  saveStore();
  renderDailyPlan();
  setExpression("happy");
  if (announce) petSay(`${character.fullName}に交代したよ。これから一緒に練習を見守るね。`, "happy");
}

function initPetPhysics() {
  if (!spritePet || petPhysicsReady || !W || !H) return;
  petPhysics.x = W * .5;
  petPhysics.y = H * .52;
  petPhysics.vx = 0;
  petPhysics.vy = 0;
  petPhysics.active = false;
  petPhysicsReady = true;
  applyPetTransform();
}

function clampPetIntoCourt() {
  if (!petPhysicsReady) return;
  petPhysics.x = Math.min(W - petPhysics.radiusX, Math.max(petPhysics.radiusX, petPhysics.x));
  petPhysics.y = Math.min(H - petPhysics.radiusY, Math.max(petPhysics.radiusY + 10, petPhysics.y));
  applyPetTransform();
}

function updatePetPhysics(dt) {
  if (!spritePet) return;
  initPetPhysics();
  if (!petPhysicsReady) return;

  if (!petPhysics.dragging && petPhysics.active) {
    petPhysics.settleTimer += dt;
    petPhysics.x += petPhysics.vx * dt;
    petPhysics.y += petPhysics.vy * dt;
    petPhysics.rotation += petPhysics.angular * dt;
    petPhysics.vx *= Math.pow(.982, dt * 60);
    petPhysics.vy *= Math.pow(.982, dt * 60);
    petPhysics.angular *= Math.pow(.975, dt * 60);

    const minX = petPhysics.radiusX;
    const maxX = W - petPhysics.radiusX;
    const minY = petPhysics.radiusY + 6;
    const maxY = H - petPhysics.radiusY - 7;
    let bounced = false;

    if (petPhysics.x < minX) {
      petPhysics.x = minX;
      petPhysics.vx = Math.abs(petPhysics.vx) * .92 + 38;
      petPhysics.angular = Math.abs(petPhysics.angular) + .7;
      bounced = true;
    } else if (petPhysics.x > maxX) {
      petPhysics.x = maxX;
      petPhysics.vx = -Math.abs(petPhysics.vx) * .92 - 38;
      petPhysics.angular = -Math.abs(petPhysics.angular) - .7;
      bounced = true;
    }

    if (petPhysics.y < minY) {
      petPhysics.y = minY;
      petPhysics.vy = Math.abs(petPhysics.vy) * .9 + 36;
      bounced = true;
    } else if (petPhysics.y > maxY) {
      petPhysics.y = maxY;
      petPhysics.vy = -Math.abs(petPhysics.vy) * .9 - 56;
      petPhysics.scaleX = 1.08;
      petPhysics.scaleY = .92;
      bounced = true;
    }

    if (bounced) {
      setExpression(Math.random() > .55 ? "surprised" : "wink", 900);
    }

    const centerX = W * .5;
    const centerY = H * .52;
    const returnStrength = petPhysics.settleTimer > .55 ? 5.2 : .9;
    petPhysics.vx += (centerX - petPhysics.x) * returnStrength * dt;
    petPhysics.vy += (centerY - petPhysics.y) * returnStrength * dt;
    petPhysics.angular += (0 - petPhysics.rotation) * 2.8 * dt;

    const speed = Math.hypot(petPhysics.vx, petPhysics.vy);
    const nearCenter = Math.hypot(petPhysics.x - centerX, petPhysics.y - centerY) < 6;
    if (petPhysics.settleTimer > 1.4 && speed < 18 && nearCenter && Math.abs(petPhysics.rotation) < .08) {
      petPhysics.active = false;
      petPhysics.x = centerX;
      petPhysics.y = centerY;
      petPhysics.vx = 0;
      petPhysics.vy = 0;
      petPhysics.rotation = 0;
      petPhysics.angular = 0;
      setExpression("calm");
    }
  }

  if (!petPhysics.active && !petPhysics.dragging) {
    petPhysics.x = W * .5;
    petPhysics.y = H * .52 + Math.sin(t * 2.25) * 8;
    petPhysics.rotation = Math.sin(t * 1.3) * .035;
    petPhysics.scaleX = 1 + Math.sin(t * 2.25) * .018;
    petPhysics.scaleY = 1 - Math.sin(t * 2.25) * .018;
  }

  petPhysics.scaleX += (1 - petPhysics.scaleX) * Math.min(1, dt * 9);
  petPhysics.scaleY += (1 - petPhysics.scaleY) * Math.min(1, dt * 9);
  applyPetTransform();
}

function applyPetTransform() {
  if (!spritePet || !petPhysicsReady) return;
  spritePet.style.left = `${petPhysics.x}px`;
  spritePet.style.top = `${petPhysics.y}px`;
  spritePet.style.transform = `translate(-50%, -50%) rotate(${petPhysics.rotation}rad) scale(${petPhysics.scaleX}, ${petPhysics.scaleY})`;
}

const rallyButton = document.querySelector("#rallyButton");
const rallyBall = document.querySelector("#rallyBall");
const rallyRacket = document.querySelector("#rallyRacket");
const rallyScoreEl = document.querySelector("#rallyScore");
const skyCard = document.querySelector(".sky-card");
const rallyWall = document.querySelector("#rallyWall");
const RALLY_RACKET_W = 56;
const RALLY_RACKET_H = 92;
const RALLY_WALL_W = 14;
const rally = {
  active: false,
  score: 0,
  best: Number(localStorage.getItem("buddy-wall-rally-best")) || 0,
  x: 0, y: 0, vx: 0, vy: 0,
  bounces: 0,
  toWall: false,
  racketX: 0,
  racketY: 0,
  racketTargetX: 0,
  racketTargetY: 0,
  racketVx: 0,
  racketVy: 0,
  steering: false,
  raf: 0,
  last: 0
};

function rallyBallRadius() {
  return 17;
}

function rallyRacketHomeY() {
  return H - 24 - RALLY_RACKET_H / 2;
}

function rallyHeadRadius() {
  return 30;
}

function rallyHeadCenter() {
  return { x: rally.racketX, y: rally.racketY - RALLY_RACKET_H * .21 };
}

function rallyRacketMinX() {
  return Math.max(RALLY_WALL_W + 80, W * .38);
}

function launchRallyBall() {
  const r = rallyBallRadius();
  rally.x = RALLY_WALL_W + r + 6;
  rally.y = H * .35;
  rally.vx = 170;
  rally.vy = -160;
  rally.toWall = false;
  rally.bounces = 0;
  applyRallyBall();
}

function applyRallyBall() {
  rallyBall.style.left = `${rally.x}px`;
  rallyBall.style.top = `${rally.y}px`;
}

function applyRallyRacket() {
  rallyRacket.style.left = `${rally.racketX}px`;
  rallyRacket.style.top = `${rally.racketY}px`;
  const tilt = Math.max(-.16, Math.min(.16, rally.racketVx / 2200));
  rallyRacket.style.transform = `translate(-50%, -50%) rotate(${-.1 + tilt}rad)`;
}

function steerRacket(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  rally.racketTargetX = Math.max(rallyRacketMinX(), Math.min(W - RALLY_RACKET_W / 2, x));
  rally.racketTargetY = Math.max(40, Math.min(H - 24, y));
}

function updateRallyScore() {
  rallyScoreEl.textContent = `壁打ち ${rally.score}回${rally.best ? ` / ベスト ${rally.best}` : ""}`;
}

function reboundOffWall() {
  const r = rallyBallRadius();
  const ramp = Math.min(rally.score / 15, 1);
  const late = Math.max(0, Math.min((rally.score - 15) / 20, 1));
  const ceiling = r + 4;
  const usable = Math.max(80, rallyRacketHomeY() - r - ceiling);
  const apex = usable * (.35 - late * .17 + Math.random() * (.35 + late * .25));
  rally.vy = -Math.sqrt(2 * 580 * apex);
  rally.vx = 150 + ramp * 100 + late * 90 + Math.random() * (40 + late * 70);
  rally.toWall = false;
  rally.bounces = 0;
}

function rallyLoop(now) {
  if (!rally.active) return;
  const dt = Math.min(32, now - rally.last) / 1000;
  rally.last = now;
  const r = rallyBallRadius();
  const prevRacketX = rally.racketX;
  const prevRacketY = rally.racketY;
  rally.racketTargetX = Math.max(rallyRacketMinX(), Math.min(W - RALLY_RACKET_W / 2, rally.racketTargetX));
  rally.racketTargetY = Math.max(40, Math.min(H - 24, rally.racketTargetY));
  const follow = Math.min(1, dt * 24);
  rally.racketX += (rally.racketTargetX - rally.racketX) * follow;
  rally.racketY += (rally.racketTargetY - rally.racketY) * follow;
  rally.racketVx = dt > 0 ? (rally.racketX - prevRacketX) / dt : 0;
  rally.racketVy = dt > 0 ? (rally.racketY - prevRacketY) / dt : 0;
  applyRallyRacket();
  rally.vy += 580 * dt;
  rally.x += rally.vx * dt;
  rally.y += rally.vy * dt;
  if (rally.x < RALLY_WALL_W + r) {
    rally.x = RALLY_WALL_W + r;
    if (rally.toWall) reboundOffWall();
    else rally.vx = Math.abs(rally.vx) * .8;
  } else if (rally.x > W - r) {
    rally.x = W - r;
    rally.vx = -Math.abs(rally.vx);
  }
  if (rally.y < r + 4) {
    rally.y = r + 4;
    rally.vy = Math.abs(rally.vy) * .85;
  }
  if (rally.y > H - r - 4 && rally.vy > 0) {
    if (rally.toWall) {
      endRally(true, "short");
      return;
    }
    rally.y = H - r - 4;
    rally.vy = -Math.abs(rally.vy) * .62;
    rally.vx *= .96;
    rally.bounces += 1;
    if (rally.bounces >= 2) {
      endRally(true);
      return;
    }
  }
  const head = rallyHeadCenter();
  const hitRange = rallyHeadRadius() + r * .8;
  if (!rally.toWall && Math.hypot(rally.x - head.x, rally.y - head.y) <= hitRange) {
    hitRallyBall();
  }
  applyRallyBall();
  rally.raf = requestAnimationFrame(rallyLoop);
}

function startRally() {
  if (rally.active) {
    endRally(false);
    return;
  }
  rally.active = true;
  rally.score = 0;
  rally.racketX = W * .65;
  rally.racketTargetX = W * .65;
  rally.racketY = rallyRacketHomeY();
  rally.racketTargetY = rallyRacketHomeY();
  rally.racketVx = 0;
  rally.racketVy = 0;
  rallyButton.textContent = "やめる";
  rallyBall.classList.remove("hidden");
  rallyRacket.classList.remove("hidden");
  rallyWall?.classList.remove("hidden");
  rallyScoreEl.classList.remove("hidden");
  skyCard?.classList.add("rally-active");
  updateRallyScore();
  applyRallyRacket();
  petSay(store.character === "lee" ? "壁打ち勝負！思いっきりスイングして、ノーバウンドで壁に当てよう！" : "壁打ちしよう。ラケットを振った勢いで強く飛ぶよ。ノーバウンドで壁まで届かせてね。", "focus");
  launchRallyBall();
  rally.last = performance.now();
  rally.raf = requestAnimationFrame(rallyLoop);
}

function hitRallyBall() {
  rally.score += 1;
  updateRallyScore();
  const r = rallyBallRadius();
  const ramp = Math.min(rally.score / 15, 1);
  const head = rallyHeadCenter();
  const dist = Math.hypot(rally.x - head.x, rally.y - head.y);
  const centered = 1 - Math.min(1, dist / (rallyHeadRadius() + r * .8));
  // スイングの勢い: 壁方向(左)への速さ + 縦振りの一部
  const swing = Math.min(900, Math.max(0, -rally.racketVx) + Math.abs(rally.racketVy) * .35);
  const ceiling = r + 4;
  const usable = Math.max(80, rallyRacketHomeY() - r - ceiling);
  const headroom = Math.max(24, (rally.y - ceiling) * .9);
  const apex = Math.min(usable * (.35 + centered * .15 + (swing / 900) * .25 + Math.random() * .05), headroom);
  rally.x = Math.min(rally.x, head.x - rallyHeadRadius() - r * .3);
  rally.vy = -Math.sqrt(2 * 580 * apex);
  rally.vx = Math.max(-520, -(140 + centered * 60 + ramp * 30 + swing * .45));
  rally.toWall = true;
  rally.bounces = 0;
  rallyRacket.classList.remove("hit");
  void rallyRacket.offsetWidth;
  rallyRacket.classList.add("hit");
  setExpression(rally.score % 5 === 0 ? "heart" : "happy", 600);
  if (rally.score === 10) petSay(store.character === "lee" ? "10回連続！壁打ちの天才！" : "10回続いたね。真ん中で打ててるよ。", "happy");
  else if (rally.score === 20) petSay(store.character === "lee" ? "20回！もう止まらない！" : "20回。すごい集中力だね。", "heart");
}

function endRally(missed, reason = "") {
  cancelAnimationFrame(rally.raf);
  rally.active = false;
  rally.steering = false;
  rallyButton.textContent = "壁打ち";
  rallyBall.classList.add("hidden");
  rallyRacket.classList.add("hidden");
  rallyWall?.classList.add("hidden");
  rallyScoreEl.classList.add("hidden");
  skyCard?.classList.remove("rally-active");
  const score = rally.score;
  const isBest = score > rally.best;
  if (isBest) {
    rally.best = score;
    localStorage.setItem("buddy-wall-rally-best", String(score));
  }
  if (!missed) {
    petSay("壁打ちはまた今度ね。いつでも誘ってよ。", "calm");
    return;
  }
  if (score > 0) addBondXp(Math.min(score, 12), `壁打ち${score}回続けた`, "happy", false);
  if (isBest && score > 0) {
    petSay(store.character === "lee" ? `ベスト更新、${score}回！ナイス壁打ち！` : `ベスト更新だよ、${score}回。集中が続いてたね。`, "heart");
  } else if (reason === "short") {
    petSay(store.character === "lee" ? "おしい、壁まで届かなかった！ボールに向かって思いっきり振ってみよう！" : "壁まで届かなかったね。ボールに向かってラケットを振り抜くと、強く飛ぶよ。", "focus");
  } else if (score >= 5) {
    petSay(store.character === "lee" ? `${score}回打ち返した！いい反応だった！` : `${score}回続いたね。目がボールに慣れてきたよ。`, "happy");
  } else {
    petSay(store.character === "lee" ? "おしい！もう1回いこう、次は続くよ！" : "おしいね。ボールの落ちる場所を予想してみよう。", "surprised");
  }
}

function bouncePetFromPointer(event) {
  if (!spritePet) return;
  initPetPhysics();
  const rect = canvas.getBoundingClientRect();
  const px = event.clientX - rect.left;
  const py = event.clientY - rect.top;
  const dx = petPhysics.x - px;
  const dy = petPhysics.y - py;
  const distance = Math.max(28, Math.hypot(dx, dy));
  const power = 420;
  petPhysics.vx = dx / distance * power + (Math.random() - .5) * 80;
  petPhysics.vy = dy / distance * power - 120;
  petPhysics.angular += (dx > 0 ? 1 : -1) * 2.1;
  petPhysics.scaleX = 1.12;
  petPhysics.scaleY = .88;
  petPhysics.active = true;
  petPhysics.settleTimer = 0;
  setExpression("surprised", 900);
}

function expressionForText(text) {
  if (text.includes("勝") || text.includes("できた") || text.includes("成功") || text.includes("うれしい")) return "happy";
  if (text.includes("好き") || text.includes("最高") || text.includes("ありがとう")) return "heart";
  if (text.includes("負け") || text.includes("ミス") || text.includes("失敗") || text.includes("つら") || text.includes("悔")) return "sad";
  if (text.includes("びっくり") || text.includes("驚") || text.includes("えっ")) return "surprised";
  if (text.includes("悩") || text.includes("迷") || text.includes("サーブ") || text.includes("レシーブ") || text.includes("前衛") || text.includes("後衛")) return "focus";
  return "calm";
}

function addMessage(role, text) {
  const node = document.createElement("div");
  node.className = `msg ${role}`;
  node.textContent = text;
  chatLog.append(node);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function openSettings() {
  settingsSheet.classList.remove("hidden");
  petNameInput.focus();
}

function closeSettings() {
  settingsSheet.classList.add("hidden");
}

function loadSprite(dataUrl, frame = null, announce = true) {
  spriteReady = false;
  spriteFrameCanvas = null;
  spriteImage = new Image();
  spriteImage.onload = () => {
    const isDefaultSprite = dataUrl === DEFAULT_SPRITE_SRC || dataUrl.endsWith("/assets/kon-spritesheet.png");
    store.spriteFrame = frame || (isDefaultSprite ? DEFAULT_SPRITE_FRAME : detectFirstSpriteFrame(spriteImage));
    spriteFrameCanvas = store.spriteFrame ? buildSpriteFrameCanvas(spriteImage, store.spriteFrame) : null;
    spriteReady = !!spriteFrameCanvas;
    saveStore();
    updateSpriteStatus();
    if (announce) petSay("スプライト画像をそのまま表示するようにしたよ。これなら線の太さも目の位置も元画像基準だよ。", "happy");
  };
  spriteImage.onerror = () => {
    spriteReady = false;
    store.spriteData = "";
    store.spriteFrame = null;
    updateSpriteStatus();
    petSay("画像を読み込めなかったよ。PNGかWebPでもう一度試してね。", "think");
  };
  spriteImage.src = dataUrl;
}

function detectFirstSpriteFrame(img) {
  const sample = document.createElement("canvas");
  const sctx = sample.getContext("2d");
  sample.width = img.naturalWidth;
  sample.height = img.naturalHeight;
  sctx.drawImage(img, 0, 0);
  const { data, width, height } = sctx.getImageData(0, 0, sample.width, sample.height);
  const scanW = Math.floor(width * .22);
  const scanH = Math.floor(height * .22);
  const mask = new Uint8Array(scanW * scanH);

  for (let y = 0; y < scanH; y++) {
    for (let x = 0; x < scanW; x++) {
      const i = (y * width + x) * 4;
      if (isSpriteInk(data[i], data[i + 1], data[i + 2], data[i + 3])) mask[y * scanW + x] = 1;
    }
  }

  const seen = new Uint8Array(mask.length);
  const stack = [];
  let best = null;

  for (let y = 0; y < scanH; y++) {
    for (let x = 0; x < scanW; x++) {
      const start = y * scanW + x;
      if (!mask[start] || seen[start]) continue;
      let minX = x, minY = y, maxX = x, maxY = y, area = 0;
      stack.push(start);
      seen[start] = 1;
      while (stack.length) {
        const p = stack.pop();
        const px = p % scanW;
        const py = Math.floor(p / scanW);
        area++;
        minX = Math.min(minX, px);
        minY = Math.min(minY, py);
        maxX = Math.max(maxX, px);
        maxY = Math.max(maxY, py);
        for (const n of [p - 1, p + 1, p - scanW, p + scanW]) {
          if (n < 0 || n >= mask.length || seen[n] || !mask[n]) continue;
          const nx = n % scanW;
          if (Math.abs(nx - px) > 1) continue;
          seen[n] = 1;
          stack.push(n);
        }
      }
      const component = { minX, minY, maxX, maxY, area };
      const isCandidate = area > 120 && minX < width * .13 && minY < height * .13;
      if (isCandidate && (!best || component.minX < best.minX || (component.minX === best.minX && area > best.area))) best = component;
    }
  }

  if (!best) return null;
  const pad = Math.max(18, Math.round(width * .018));
  return {
    x: Math.max(0, best.minX - pad),
    y: Math.max(0, best.minY - pad),
    w: Math.min(width - Math.max(0, best.minX - pad), best.maxX - best.minX + pad * 2),
    h: Math.min(height - Math.max(0, best.minY - pad), best.maxY - best.minY + pad * 2)
  };
}

function isSpriteInk(r, g, b, a) {
  if (a <= 20) return false;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max - min;
  return max < 210 || saturation > 32;
}

function isBrightNeutral(r, g, b, a) {
  if (a <= 20) return true;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max > 224 && max - min < 14;
}

function buildSpriteFrameCanvas(img, frame) {
  const out = document.createElement("canvas");
  const octx = out.getContext("2d");
  out.width = Math.round(frame.w);
  out.height = Math.round(frame.h);
  octx.drawImage(img, frame.x, frame.y, frame.w, frame.h, 0, 0, out.width, out.height);

  const image = octx.getImageData(0, 0, out.width, out.height);
  const { data, width, height } = image;
  const seen = new Uint8Array(width * height);
  const stack = [];

  function pushIfBg(x, y) {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const p = y * width + x;
    if (seen[p]) return;
    const i = p * 4;
    if (!isBrightNeutral(data[i], data[i + 1], data[i + 2], data[i + 3])) return;
    seen[p] = 1;
    stack.push(p);
  }

  for (let x = 0; x < width; x++) {
    pushIfBg(x, 0);
    pushIfBg(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    pushIfBg(0, y);
    pushIfBg(width - 1, y);
  }

  while (stack.length) {
    const p = stack.pop();
    const x = p % width;
    const y = Math.floor(p / width);
    pushIfBg(x - 1, y);
    pushIfBg(x + 1, y);
    pushIfBg(x, y - 1);
    pushIfBg(x, y + 1);
  }

  for (let p = 0; p < seen.length; p++) {
    if (seen[p]) data[p * 4 + 3] = 0;
  }
  octx.putImageData(image, 0, 0);
  return out;
}

function updateSpriteStatus() {
}

function coachReply(raw) {
  const text = raw.toLowerCase();
  const name = store.name;
  const isLee = store.character === "lee";
  if (text.includes("トス")) {
    if (isLee) return styleReply("トスはサーブの土台！今日は高さを決めて、打つ前に1秒止まるイメージでいこう。ラケットを振るより、同じ場所に上げる練習を10本だよ！");
    return styleReply("トスが安定しない時は、打つ練習より先に上げる練習を分けよう。目線の少し上に同じ高さで10本、足の位置を動かさず確認するのが近道だよ。");
  }
  if (text.includes("詰まる") || text.includes("つまる")) {
    if (isLee) return styleReply("詰まる時は準備が半歩遅れてるかも！相手が打つ瞬間に小さく沈んで、ラケットを先に出す。まず深く返す1本だけに集中しよう！");
    return styleReply("レシーブで詰まる時は、打つ瞬間ではなく相手が打つ前の姿勢を見直そう。小さく沈む、1歩目を早く出す、深く返す、この3つに絞ると立て直しやすいよ。");
  }
  if (text.includes("タイミング") || text.includes("出る判断") || text.includes("出るタイミング")) {
    if (isLee) return styleReply("前衛の出るタイミングは、全部を取りに行かないこと！今日は『相手の打点が低い時だけ出る』みたいに条件を1つ決めよう。決めた球なら思い切ってGO！");
    return styleReply("前衛は出る条件を1つに絞ると迷いが減るよ。相手の打点が低い、体勢が崩れた、面が外を向いた。この中から今日の合図を1つ選ぼう。");
  }
  if (text.includes("浅く") || text.includes("浅い")) {
    if (isLee) return styleReply("浅くなる時は、打点と体重移動を見よう！無理に強く打たず、相手後衛の足元より奥を狙って、まず3本深く続けるチャレンジ！");
    return styleReply("球が浅くなる時は、力より打点の余裕を作ろう。半歩早く入り、打った後に前へ流れすぎず、深いコースを1つ決めて3本続ける練習が合うよ。");
  }
  if (text.includes("緊張") || text.includes("怖") || text.includes("焦")) {
    if (isLee) return styleReply("緊張は悪者じゃないよ！まず息を長く吐いて、次の1本の狙いを声に出そう。『深く返す』みたいに短い言葉でOK！");
    return styleReply("緊張した時は、結果より手順に戻ろう。深呼吸、カウント確認、次の狙いを1つ言葉にする。この順番を作ると心が戻りやすいよ。");
  }
  if (text.includes("噛み合わ") || text.includes("かみ合わ")) {
    if (isLee) return styleReply("ペアと噛み合わない時は、作戦を増やしすぎない！『深く打ったら前衛が出る』『苦しい時はロブ』みたいに2つだけ合図を決めよう！");
    return styleReply("ペアと噛み合わない時は、反省より共通の合図を作ろう。出る球、下がる球、ロブで時間を作る球を短い名前にすると、次のポイントで合わせやすいよ。");
  }
  if (text.includes("結果") || text.includes("振り返") || text.includes("負け") || text.includes("勝")) {
    if (isLee) return styleReply(`${name}だよ！まず今日のナイスプレーを1つ言おう。次に「どこで流れが変わったか」をサーブ・レシーブ・ラリー・ペア連携に分けるよ。そこまで見えたら、次の一歩はもう決まる！`);
    return styleReply(`${name}だよ。まず「できたこと」を1つ言葉にしよう。次に失点が多かった場面を、サーブ・レシーブ・ラリー・ポジションのどれかに分けると、次の練習が決めやすいよ。`);
  }
  if (text.includes("サーブ")) {
    if (isLee) return styleReply("サーブいこう！今日は速さより成功率。トスを同じ高さにして、7割の力で10本連続チャレンジ。入ったらコースを2つに分けて、ちょっとずつ攻めよう！");
    return styleReply("サーブは威力より再現性から。今日は 1. トスの高さ固定 2. 7割の力で10本連続 3. セカンド想定でコース2択、の順でいこう。");
  }
  if (text.includes("レシーブ")) {
    if (isLee) return styleReply("レシーブは一歩目勝負！相手が打つ瞬間に軽く沈んで、深く返す球をまず作ろう。慣れたら前衛の足元へ、ズバッと1本！");
    return styleReply("レシーブは最初の一歩が大事。相手が打つ前に小さく沈んで、深く返す球と前衛の足元を狙う球を分けて練習しよう。");
  }
  if (text.includes("前衛") || text.includes("ボレー")) {
    if (isLee) return styleReply("前衛は迷わないのが強い！今日は「この球だけ出る」を1つ決めよう。相手後衛の打点が低い時、面が外を向いた時、そこがチャンス！");
    return styleReply("前衛は「出る/出ない」を早く決めると強いよ。相手後衛の面の向き、体勢、打点の高さを見て、出る球を1種類だけ決めて練習しよう。");
  }
  if (text.includes("後衛") || text.includes("ラリー")) {
    if (isLee) return styleReply("後衛は深く、しぶとく、そこから一気に展開！まず3球深くつなぐ。できたら4球目でロブか中ロブ、相手を動かしていこう！");
    return styleReply("後衛は深さが味方。まずはアウトを怖がりすぎず、相手後衛の後ろ足側へ深く。3球続けたら1本だけ展開球を混ぜよう。");
  }
  if (text.includes("ダブルス") || text.includes("ペア") || text.includes("連携")) {
    if (isLee) return styleReply("ペア連携は声で強くなる！「今のいいね」「次は深く」「ここ出るよ」みたいに短く共有。2人で同じ絵を見られたら、ポイントが取りやすい！");
    return styleReply("ペア連携は合図を小さく決めるのが効くよ。「前衛が出る球」「後衛がロブで時間を作る球」を2人で名前つきにしよう。");
  }
  if (text.includes("ルール") || text.includes("ファイナル") || text.includes("得点")) {
    if (isLee) return styleReply("ルール確認だね！通常ゲームは4ポイント先取、ファイナルは7ポイント先取が基本。迷ったらルールタブで一緒にチェックしよう！");
    return styleReply("ルールの基本は、通常ゲームは4ポイント先取、ファイナルは7ポイント先取が基本。詳しくはルールタブで確認できるよ。");
  }
  if (isLee) return styleReply(`${name}はこう思う！課題は大きく見えるけど、今日やることは1つでOK。「次に増やしたい1本」を決めて、そこに全力でいこう！`);
  return styleReply(`${name}はこう思うよ。今日の課題を1つに絞るなら「何で失点したか」より「次にどの1本を増やすか」で考えよう。練習タブでメニューも作れるよ。`);
}

function seedChat() {
  chatLog.innerHTML = "";
  const opening = store.character === "lee"
    ? `${store.name}だよ！今日の結果、練習メニュー、試合の悩み、なんでも聞くよ。いっしょに次の一歩を決めよう！`
    : `${store.name}だよ。今日の結果はどうだった？練習メニューでも、試合の悩みでも相談してね。`;
  addMessage("pet", opening);
}

function currentMission() {
  ensureDailyPlan();
  return dailyMissions.find(mission => mission.id === store.daily.missionId) || missionForToday(store.daily.date);
}

function renderDailyPlan() {
  if (!dailyPlan) return;
  ensureDailyPlan();
  ensureBond();
  const mission = currentMission();
  const condition = conditionOptions[store.daily.condition] || conditionOptions.normal;
  const characterKey = store.character === "lee" ? "lee" : "kon";
  const level = bondLevel(store.bond.xp);
  const progress = bondProgress(store.bond.xp);
  const focus = weeklyFocus();
  const goalText = store.preferences?.playerGoal || "まずは今の目標を設定しよう";
  const logs = store.bond.logs?.length
    ? store.bond.logs.map(log => `<li><span>${escapeHtml(log.date)}</span>${escapeHtml(log.label)} +${log.amount}XP</li>`).join("")
    : `<li><span>今日</span>相談や記録で成長ログが増えるよ</li>`;
  dailyPlan.innerHTML = `
    <header>
      <div>
        <small>TODAY'S PLAN</small>
        <strong>今日の作戦カード</strong>
      </div>
      <span class="mission-pill">${condition.label}</span>
    </header>
    <div class="condition-row" aria-label="今日の調子">
      ${Object.entries(conditionOptions).map(([key, option]) => `
        <button class="condition-chip ${store.daily.condition === key ? "active" : ""}" data-condition="${key}" type="button">${option.label}</button>
      `).join("")}
    </div>
    <div class="mission-body">
      <p><strong>ミッション:</strong> ${mission.text}<br>${condition.line[characterKey]}</p>
      <div class="mission-actions">
        <button id="useMission" type="button">練習へ</button>
        <button id="missionDone" class="${store.daily.missionDone ? "done" : ""}" type="button">${store.daily.missionDone ? "達成済み" : "達成"}</button>
      </div>
    </div>
    <div class="roadmap-card">
      <small>GOAL ROUTE</small>
      <strong>${escapeHtml(goalText)}</strong>
      <div class="roadmap-steps">
        <span>今週: ${focusLabels[focus]}</span>
        <span>次: ${focusSteps[focus]}</span>
      </div>
      <button id="useRoadmap" type="button">この一歩で練習</button>
    </div>
    <div class="bond-card">
      <div class="bond-head">
        <strong>相棒Lv.${level}</strong>
        <span>きずな ${progress}/100</span>
      </div>
      <div class="bond-meter" aria-label="きずなゲージ"><i style="width:${progress}%"></i></div>
      <ul class="bond-log">${logs}</ul>
    </div>
  `;
  dailyPlan.querySelectorAll("[data-condition]").forEach(button => {
    button.addEventListener("click", () => {
      const nextCondition = button.dataset.condition;
      store.daily.condition = nextCondition;
      store.daily.missionDone = false;
      const nextOption = conditionOptions[nextCondition] || conditionOptions.normal;
      const practiceCondition = document.querySelector("#practiceCondition");
      if (practiceCondition) practiceCondition.value = nextOption.practiceCondition;
      saveStore();
      renderDailyPlan();
      petSay(nextOption.line[characterKey], nextOption.mood);
      makePracticePlan(false);
    });
  });
  dailyPlan.querySelector("#useMission")?.addEventListener("click", () => {
    const practiceCondition = document.querySelector("#practiceCondition");
    const practiceGoal = document.querySelector("#practiceGoal");
    if (practiceCondition) practiceCondition.value = condition.practiceCondition;
    if (practiceGoal) practiceGoal.value = mission.goal;
    addBondXp(6, "作戦から練習を作った", "focus", false);
    makePracticePlan();
    document.querySelector('[data-tab="practice"]').click();
  });
  dailyPlan.querySelector("#useRoadmap")?.addEventListener("click", () => {
    const practiceGoal = document.querySelector("#practiceGoal");
    if (practiceGoal) practiceGoal.value = focus === "mental" ? "pair" : focus;
    addBondXp(6, "目標ルートから練習を作った", "focus", false);
    makePracticePlan();
    document.querySelector('[data-tab="practice"]').click();
  });
  dailyPlan.querySelector("#missionDone")?.addEventListener("click", () => {
    const wasDone = store.daily.missionDone;
    store.daily.missionDone = !store.daily.missionDone;
    saveStore();
    renderDailyPlan();
    if (!wasDone && store.daily.missionDone) {
      addBondXp(24, "今日のミッション達成", "heart", false);
    }
    const doneMessage = store.daily.missionDone
      ? store.character === "lee"
        ? "ミッション達成！いいね、その1本が明日の自信になるよ！"
        : "ミッション達成だね。小さくても、続く成長は強いよ。"
      : "ミッションを戻したよ。もう一度、今日の中で試してみよう。";
    petSay(doneMessage, store.daily.missionDone ? "heart" : "focus");
  });
}

function renderResultStats() {
  if (!resultStats) return;
  ensureBond();
  const dayFormat = new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium" });
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push({
      label: `${date.getMonth() + 1}/${date.getDate()}`,
      key: dayFormat.format(date),
      count: 0
    });
  }
  const focusCounts = {};
  for (const item of store.results) {
    const day = days.find(day => day.key === item.date);
    if (day) day.count += 1;
    const focus = item.focus && focusLabels[item.focus] ? item.focus : "mental";
    focusCounts[focus] = (focusCounts[focus] || 0) + 1;
  }
  const maxCount = Math.max(1, ...days.map(day => day.count));
  const bars = days.map((day, index) => {
    const height = day.count ? Math.max(6, (day.count / maxCount) * 50) : 3;
    const x = 10 + index * 38;
    return `
      <rect x="${x}" y="${66 - height}" width="26" height="${height}" rx="4" class="${day.count ? "stats-bar" : "stats-bar empty"}"></rect>
      ${day.count ? `<text x="${x + 13}" y="${62 - height}" class="stats-value">${day.count}</text>` : ""}
      <text x="${x + 13}" y="80" class="stats-day">${day.label}</text>
    `;
  }).join("");
  const weekTotal = days.reduce((sum, day) => sum + day.count, 0);
  const maxFocus = Math.max(1, ...Object.values(focusCounts));
  const focusRows = Object.entries(focusLabels).map(([key, label]) => {
    const count = focusCounts[key] || 0;
    return `
      <div class="stats-focus-row">
        <span>${label}</span>
        <div class="stats-meter"><i style="width:${Math.round((count / maxFocus) * 100)}%"></i></div>
        <b>${count}</b>
      </div>
    `;
  }).join("");
  const xp = store.bond.xp || 0;
  resultStats.innerHTML = `
    <article class="stats-card">
      <small>GROWTH GRAPH</small>
      <strong>この7日間の記録: ${weekTotal}件</strong>
      <svg viewBox="0 0 286 86" role="img" aria-label="直近7日間の記録件数グラフ">
        <line x1="6" y1="66" x2="280" y2="66" class="stats-axis"></line>
        ${bars}
      </svg>
      <strong>記録のテーマ分布（直近${Math.min(store.results.length, 30)}件）</strong>
      ${store.results.length ? `<div class="stats-focus">${focusRows}</div>` : '<p class="stats-empty">まだ記録がないよ。結果メモを書くと、ここに成長が見えてくる。</p>'}
      <div class="stats-bond">
        <span>相棒Lv.${bondLevel(xp)}</span>
        <div class="stats-meter"><i style="width:${bondProgress(xp)}%"></i></div>
        <b>あと${100 - bondProgress(xp)}XPでLv.${bondLevel(xp) + 1}</b>
      </div>
    </article>
  `;
}

let resultView = "practice";

function matchProgressionSvg(match) {
  const log = match.log || [];
  if (log.length < 2) return "";
  let diff = 0;
  const diffs = [0];
  for (const entry of log) {
    diff += entry.side === "us" ? 1 : -1;
    diffs.push(diff);
  }
  const w = 320, h = 96, pad = 10;
  const maxAbs = Math.max(2, ...diffs.map(Math.abs));
  const x = i => pad + (w - 2 * pad) * i / (diffs.length - 1);
  const y = v => h / 2 - v / maxAbs * (h / 2 - pad);
  const points = diffs.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  let gameLines = "";
  for (let i = 1; i < log.length; i++) {
    if (log[i].g !== log[i - 1].g) {
      gameLines += `<line x1="${x(i).toFixed(1)}" y1="${pad}" x2="${x(i).toFixed(1)}" y2="${h - pad}" stroke="rgba(24,48,76,.14)" stroke-width="1"/>`;
    }
  }
  return `
    <svg class="match-progress" viewBox="0 0 ${w} ${h}" aria-label="得点差の推移">
      <line x1="${pad}" y1="${h / 2}" x2="${w - pad}" y2="${h / 2}" stroke="rgba(24,48,76,.25)" stroke-dasharray="3 3"/>
      ${gameLines}
      <polyline points="${points}" fill="none" stroke="#40c7bd" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
      <text x="${pad}" y="${pad + 2}" font-size="9" font-weight="bold" fill="#40c7bd">↑リード</text>
      <text x="${pad}" y="${h - pad + 8}" font-size="9" font-weight="bold" fill="#ff6b62">↓ビハインド</text>
    </svg>
  `;
}

function statBarRow(label, value, max, cls) {
  const width = max ? Math.max(4, Math.round(value / max * 100)) : 4;
  return `<div class="stat-row"><span>${escapeHtml(label)}</span><div class="stat-bar"><i class="${cls}" style="width:${width}%"></i></div><b>${value}</b></div>`;
}

function renderMatchDetail(item) {
  const match = item.match;
  if (!match?.log?.length) {
    return `<div class="match-detail"><p class="detail-note">この試合は分析データがないよ。分析モードで記録すると、得点の流れや選手別スタッツが見られるよ。</p></div>`;
  }
  const stats = scoreAnalysisStats({ log: match.log });
  const [p1, p2] = match.players || ["選手1", "選手2"];
  const barMax = Math.max(1, stats.players[0].win, stats.players[1].win, stats.players[0].miss, stats.players[1].miss, stats.otherWin, stats.otherLose);
  return `
    <div class="match-detail">
      <small>得点差の推移（縦線=ゲームの区切り）</small>
      ${matchProgressionSvg(match)}
      <small>ポイントの流れ</small>
      ${renderScoreFlow({ log: match.log })}
      <small>得点</small>
      ${statBarRow(p1, stats.players[0].win, barMax, "bar-win")}
      ${statBarRow(p2, stats.players[1].win, barMax, "bar-win")}
      ${statBarRow("相手ミス他", stats.otherWin, barMax, "bar-win")}
      <small>失点</small>
      ${statBarRow(`${p1}ミス`, stats.players[0].miss, barMax, "bar-miss")}
      ${statBarRow(`${p2}ミス`, stats.players[1].miss, barMax, "bar-miss")}
      ${statBarRow("相手に決められた", stats.otherLose, barMax, "bar-miss")}
      <div class="detail-rates">
        <span>1stサーブ: ${escapeHtml(p1)} ${firstServeText(stats.players[0])} / ${escapeHtml(p2)} ${firstServeText(stats.players[1])}</span>
        <span>Wフォルト率: ${escapeHtml(p1)} ${dfRateText(stats.players[0])} / ${escapeHtml(p2)} ${dfRateText(stats.players[1])}</span>
        <span>相手のWフォルト: ${stats.dfThem}本</span>
      </div>
    </div>
  `;
}

function renderResults() {
  renderResultCoach();
  renderWeeklyReview();
  renderResultStats();
  resultList.innerHTML = "";
  const items = store.results.filter(item => (item.type || "practice") === resultView);
  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "result-item";
    empty.textContent = resultView === "match"
      ? "まだ試合の記録はないよ。スコアタブで試合をつけて「結果メモに残す」と、ここに並ぶよ。"
      : "まだ記録はないよ。練習後に1つだけでも残すと、次のメニューが作りやすくなる。";
    resultList.append(empty);
    return;
  }
  for (const item of items) {
    const analysis = item.focus ? resultFocuses[item.focus] : analyzeResult(`${item.good} ${item.next}`);
    const node = document.createElement("article");
    const isMatch = (item.type || "practice") === "match";
    node.className = `result-item${isMatch ? " match" : ""}`;
    node.innerHTML = `
      <time>${item.date}</time>
      <strong>${escapeHtml(item.title)}</strong>
      <div class="result-tags"><span>${analysis.icon} ${analysis.label}</span>${isMatch ? '<span class="tap-hint">タップで詳細分析</span>' : ""}</div>
      <p>できた: ${escapeHtml(item.good)}</p>
      <p>次: ${escapeHtml(item.next)}</p>
    `;
    if (isMatch) {
      node.addEventListener("click", () => {
        const existing = node.querySelector(".match-detail");
        if (existing) {
          existing.remove();
          node.classList.remove("expanded");
        } else {
          node.insertAdjacentHTML("beforeend", renderMatchDetail(item));
          node.classList.add("expanded");
        }
      });
    }
    resultList.append(node);
  }
}

function weeklySummary() {
  ensureBond();
  const recent = store.results.slice(0, 7);
  const focusCounts = {};
  for (const item of recent) {
    const focus = item.focus || Object.entries(resultFocuses).find(([, value]) => value === analyzeResult(`${item.title || ""} ${item.good || ""} ${item.next || ""}`))?.[0] || "mental";
    focusCounts[focus] = (focusCounts[focus] || 0) + 1;
  }
  const topFocus = Object.entries(focusCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || weeklyFocus();
  const doneCount = recent.length;
  const xpGains = store.bond.logs?.slice(0, 5) || [];
  const growthText = xpGains.length
    ? xpGains.map(log => log.label).slice(0, 3).join(" / ")
    : "相談や記録を残すところから始めよう";
  const good = recent.find(item => item.good)?.good || "今週のよかったことを1つ記録しよう";
  const next = recent.find(item => item.next)?.next || focusSteps[topFocus];
  return {
    topFocus,
    doneCount,
    growthText,
    good,
    next
  };
}

function renderWeeklyReview() {
  if (!weeklyReview) return;
  const summary = weeklySummary();
  const focus = resultFocuses[summary.topFocus] || resultFocuses.mental;
  const characterLine = store.character === "lee"
    ? "今週の積み上げ、ちゃんと見えてるよ。次はこのテーマで一段上げよう！"
    : "今週の流れが見えてきたよ。次の重点を1つに絞ると、練習がつながるね。";
  weeklyReview.innerHTML = `
    <article class="weekly-card">
      <small>WEEKLY REVIEW</small>
      <strong>今週は「${focusLabels[summary.topFocus]}」を育てる週</strong>
      <div class="weekly-grid">
        <p><span>記録</span>${summary.doneCount ? `${summary.doneCount}件のメモ` : "まだ記録なし"}</p>
        <p><span>成長</span>${escapeHtml(summary.growthText)}</p>
        <p><span>できた</span>${escapeHtml(summary.good)}</p>
        <p><span>次の重点</span>${escapeHtml(summary.next)}</p>
      </div>
      <p class="weekly-comment">${characterLine}</p>
      <button id="useWeeklyFocus" type="button" data-goal="${focus.practiceGoal}">今週の重点で練習</button>
    </article>
  `;
  weeklyReview.querySelector("#useWeeklyFocus")?.addEventListener("click", () => {
    document.querySelector("#practiceGoal").value = focus.practiceGoal;
    addBondXp(6, "週間振り返りから練習を作った", "focus", false);
    makePracticePlan();
    document.querySelector('[data-tab="practice"]').click();
  });
}

function renderMatchChecklist() {
  if (!matchChecklist) return;
  ensureMatchPrep();
  const checkedCount = matchPrepItems.filter(item => store.matchPrep.checked[item.id]).length;
  const total = matchPrepItems.length;
  const percent = Math.round((checkedCount / total) * 100);
  const grouped = matchPrepItems.map(item => `
    <label class="match-item ${store.matchPrep.checked[item.id] ? "done" : ""}">
      <input type="checkbox" data-match-item="${item.id}" ${store.matchPrep.checked[item.id] ? "checked" : ""} />
      <span><b>${item.group}</b>${item.text}</span>
    </label>
  `).join("");
  const goal = store.preferences?.playerGoal || "今日の1本を大切にする";
  const mission = currentMission();
  matchChecklist.innerHTML = `
    <article class="match-card">
      <small>MATCH PREP</small>
      <strong>${checkedCount}/${total} 完了</strong>
      <div class="match-meter" aria-label="試合前準備の進み具合"><i style="width:${percent}%"></i></div>
      <p>目標: ${escapeHtml(goal)}<br>今日の作戦: ${escapeHtml(mission.text)}</p>
      <div class="match-actions">
        <button id="openRulesForMatch" type="button">ルール確認</button>
        <button id="openPairPlan" type="button">ペア作戦</button>
      </div>
    </article>
    <div class="match-list">${grouped}</div>
    <button id="matchReady" class="match-ready" type="button">${percent === 100 ? "準備OK！" : "ここまで確認"}</button>
  `;
  matchChecklist.querySelectorAll("[data-match-item]").forEach(input => {
    input.addEventListener("change", () => {
      store.matchPrep.checked[input.dataset.matchItem] = input.checked;
      saveStore();
      renderMatchChecklist();
      if (input.checked) addBondXp(2, "試合前チェック", "focus", false);
    });
  });
  matchChecklist.querySelector("#openRulesForMatch")?.addEventListener("click", () => {
    document.querySelector('[data-tab="rules"]').click();
    activeRuleCategory = "trouble";
    document.querySelectorAll("[data-rule-category]").forEach(x => x.classList.remove("active"));
    document.querySelector('[data-rule-category="trouble"]')?.classList.add("active");
    renderRules("");
  });
  matchChecklist.querySelector("#openPairPlan")?.addEventListener("click", () => {
    document.querySelector("#practiceGoal").value = "pair";
    document.querySelector("#practiceLevel").value = "match";
    makePracticePlan();
    document.querySelector('[data-tab="practice"]').click();
  });
  matchChecklist.querySelector("#matchReady")?.addEventListener("click", () => {
    const message = percent === 100
      ? store.character === "lee"
        ? "準備ばっちり！あとは最初の1本、元気よく入ろう！"
        : "準備は整ったね。最初の1本だけ、ていねいに入ろう。"
      : `あと${total - checkedCount}個確認できるよ。焦らず、試合前の不安を減らしていこう。`;
    petSay(message, percent === 100 ? "heart" : "focus");
    if (percent === 100) addBondXp(12, "試合前準備完了", "heart", false);
  });
}

const judgePaper = document.querySelector("#judgePaper");

function judgeGrid(entries, perspective) {
  const cols = 16;
  const cells = [];
  for (let i = 0; i < cols * 2; i++) {
    const entry = entries[i];
    let mark = "";
    if (entry) mark = entry.side === perspective ? "○" : "✕";
    cells.push(`<i>${mark}</i>`);
  }
  return `<div class="pgrid">${cells.join("")}</div>`;
}

function judgeFinalGrid(entries, perspective) {
  // ファイナル行: 2ポイントごとの*印付き（サービス交代の目印）
  const cols = 16;
  const cells = [];
  for (let i = 0; i < cols * 2; i++) {
    const entry = entries[i];
    let mark = "";
    if (entry) mark = entry.side === perspective ? "○" : "✕";
    const col = i % cols;
    const star = Math.floor(col / 2) % 2 === (i < cols ? 0 : 1) ? ' class="star"' : "";
    cells.push(`<i${star}>${mark}</i>`);
  }
  return `<div class="pgrid pgrid-final">${cells.join("")}</div>`;
}

function judgeSR(circle) {
  return `<span class="sr"><b class="${circle === "S" ? "on" : ""}">S</b><b class="${circle === "R" ? "on" : ""}">R</b></span>`;
}

function judgeCircled(value, won) {
  if (value === null) return "";
  return `<span class="${won ? "circled" : ""}">${value}</span>`;
}

function renderJudgePaper() {
  ensureScore();
  ensurePreferences();
  const state = store.score;
  const analysis = store.preferences.scoreMode === "analysis";
  const [p1, p2] = state.players;
  const opponent = state.opponent || "";
  const need = scoreGamesToWin(state.format);
  const gameEntries = [];
  for (const entry of state.log) {
    if (!gameEntries[entry.g]) gameEntries[entry.g] = [];
    gameEntries[entry.g].push(entry);
  }
  const rows = [];
  const gameNums = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧"];
  for (let row = 0; row < 9; row++) {
    const isFinal = row === 8;
    // 通常ゲームは①〜⑧、ファイナル（最終ゲーム）はⒻ行へ
    const g = isFinal ? state.format - 1 : row;
    const entries = (isFinal || g < state.format - 1) ? (gameEntries[g] || []) : [];
    const usPts = entries.filter(e => e.side === "us").length;
    const themPts = entries.filter(e => e.side === "them").length;
    const target = isFinal ? 7 : 4;
    const decided = entries.length > 0 && Math.max(usPts, themPts) >= target && Math.abs(usPts - themPts) >= 2;
    let srLeft = "";
    let srRight = "";
    if (analysis && entries.length) {
      const serveUs = entries[0].serve === "us";
      srLeft = serveUs ? "S" : "R";
      srRight = serveUs ? "R" : "S";
    }
    const center = entries.length
      ? `${judgeCircled(usPts, decided && usPts > themPts)}<em>-${isFinal ? "Ⓕ" : gameNums[row]}-</em>${judgeCircled(themPts, decided && themPts > usPts)}`
      : `<em>-${isFinal ? "Ⓕ" : gameNums[row]}-</em>`;
    const gridFn = isFinal ? judgeFinalGrid : judgeGrid;
    rows.push(`
      <tr>
        <td class="srcell">${judgeSR(srLeft)}</td>
        <td class="ptcell">${gridFn(entries, "us")}</td>
        <td class="gcell">${center}</td>
        <td class="ptcell">${gridFn(entries, "them")}</td>
        <td class="srcell">${judgeSR(srRight)}</td>
      </tr>
    `);
  }
  const scoreCenter = state.log.length
    ? `${judgeCircled(state.games.us, state.finished && state.winner === "us")}<em>−</em>${judgeCircled(state.games.them, state.finished && state.winner === "them")}`
    : "<em>−</em>";
  judgePaper.innerHTML = `
    <div class="judge-actions">
      <button id="judgePrint" type="button">印刷する</button>
      <button id="judgeClose" type="button">閉じる</button>
    </div>
    <div class="judge-sheet">
      <h1>ダブルス・シングルス採点票</h1>
      <table class="jhead">
        <tr>
          <td class="w26">種別　　　　　<span class="mw">男<br>女</span></td>
          <td class="w22">第　　　　コート</td>
          <td class="w26"><small>正審</small></td>
          <td class="w26"><small>副審</small></td>
        </tr>
        <tr>
          <td>第　　　　回戦</td>
          <td><small>開始</small>　　：　　分<br><small>終了</small>　　：　　分</td>
          <td><small>線審</small></td>
          <td><small>線審</small></td>
        </tr>
      </table>
      <table class="jteams">
        <tr>
          <td class="no"><small>No</small></td>
          <td class="aff"><small>所属</small></td>
          <td class="mid" rowspan="3"><small>（スコア）</small><div class="jscore">${scoreCenter}</div></td>
          <td class="no"><small>No</small></td>
          <td class="aff"><small>所属</small>　${opponent ? escapeHtml(opponent) : ""}</td>
        </tr>
        <tr>
          <td class="plab"><small>プレーヤー</small></td>
          <td class="pname"><small>A</small>　${escapeHtml(p1)}</td>
          <td class="plab"><small>プレーヤー</small></td>
          <td class="pname"><small>A</small></td>
        </tr>
        <tr>
          <td class="plab"><small>サイド</small></td>
          <td class="pname"><small>B</small>　${escapeHtml(p2)}</td>
          <td class="plab"><small>サイド</small></td>
          <td class="pname"><small>B</small></td>
        </tr>
      </table>
      <table class="jgames">${rows.join("")}</table>
      <table class="jfoot">
        <tr>
          <td class="warn"><small>(警告)</small>　Y　　Y　　R</td>
          <td class="time" rowspan="2"><small>タイム</small><br>A　5　・　5<br>B　5　・　5</td>
          <td class="time" rowspan="2"><small>タイム</small><br>A　5　・　5<br>B　5　・　5</td>
          <td class="warn"><small>(警告)</small>　Y　　Y　　R</td>
        </tr>
        <tr>
          <td class="warn"><small>該当事項</small></td>
          <td class="warn"><small>該当事項</small></td>
        </tr>
      </table>
      <table class="jsign">
        <tr>
          <td><small>勝者サイン</small></td>
          <td class="fill"></td>
          <td><small>勝者No.</small></td>
          <td class="fill"></td>
          <td><small>進行</small></td>
          <td class="fill"></td>
          <td><small>点検</small></td>
          <td class="fill"></td>
          <td><small>記録</small></td>
          <td class="fill"></td>
        </tr>
      </table>
      <p class="jfooter">公益財団法人　日本ソフトテニス連盟　採点票様式に準拠</p>
    </div>
  `;
  judgePaper.querySelector("#judgePrint").addEventListener("click", () => window.print());
  judgePaper.querySelector("#judgeClose").addEventListener("click", closeJudgePaper);
}

function openJudgePaper() {
  renderJudgePaper();
  judgePaper.classList.remove("hidden");
  document.body.classList.add("judge-open");
}

function closeJudgePaper() {
  judgePaper.classList.add("hidden");
  document.body.classList.remove("judge-open");
}

function renderScoreFlow(state) {
  if (!state.log.length) return '<p class="score-flow-empty">ポイントを記録すると、試合の流れがここに並ぶよ。</p>';
  const recent = state.log.slice(-30);
  let lastGame = recent[0].g;
  const dots = recent.map(entry => {
    const divider = entry.g !== lastGame ? '<i class="flow-game"></i>' : "";
    lastGame = entry.g;
    const label = entry.reason === "dfault" ? "F" : entry.player ? String(entry.player) : "・";
    return `${divider}<span class="flow-dot ${entry.side === "us" ? "us" : "them"}" title="${entry.side === "us" ? "得点" : "失点"}">${label}</span>`;
  }).join("");
  return `<div class="score-flow" aria-label="ポイントの流れ">${dots}</div>`;
}

function renderScoreBoard() {
  if (!scoreBoard) return;
  ensureScore();
  ensurePreferences();
  const state = store.score;
  const analysis = store.preferences.scoreMode === "analysis";
  const need = scoreGamesToWin(state.format);
  const opponent = scoreOpponentLabel(state);
  const [p1, p2] = state.players;
  const disabled = state.finished ? "disabled" : "";
  const statusLine = state.finished
    ? state.winner === "us" ? "マッチ勝利！おつかれさま！" : "マッチ終了。よく戦ったよ。"
    : state.finalGame
      ? "ファイナルゲーム: 7ポイント先取（6-6からは2点差）"
      : `${state.format}ゲームマッチ: ${need}ゲーム先取 / 1ゲームは4ポイント`;
  const scoreHead = `
    <div class="score-games" aria-label="ゲームカウント">
      <div class="score-side"><b>こっち</b><strong>${state.games.us}</strong></div>
      <span>ゲーム</span>
      <div class="score-side"><b>${escapeHtml(opponent)}</b><strong>${state.games.them}</strong></div>
    </div>
    <p class="score-call">${escapeHtml(scoreCall(state))}</p>
  `;
  const tools = `
    <p class="score-status">${statusLine}</p>
    <div class="score-tools">
      <button id="scoreUndo" type="button">1本戻す</button>
      <button id="scoreReset" type="button">リセット</button>
      <button id="judgePaperBtn" type="button">ジャッジペーパー</button>
      ${state.finished && !state.saved ? '<button id="scoreToResult" class="score-save" type="button">結果メモに残す</button>' : ""}
    </div>
  `;
  if (!analysis) {
    scoreBoard.innerHTML = `
      <article class="score-card">
        <small>SCORE BOARD</small>
        ${scoreHead}
        <div class="score-points">
          <button id="scoreUs" type="button" ${disabled}><strong>${state.points.us}</strong><span>こっち +1</span></button>
          <button id="scoreThem" type="button" ${disabled}><strong>${state.points.them}</strong><span>${escapeHtml(opponent)} +1</span></button>
        </div>
        ${tools}
        <div class="score-setup">
          <label><span>試合形式</span>
            <select id="scoreFormat">
              ${[5, 7, 9].map(format => `<option value="${format}" ${state.format === format ? "selected" : ""}>${format}ゲーム</option>`).join("")}
            </select>
          </label>
          <label><span>相手の名前</span>
            <input id="scoreOpponent" maxlength="12" placeholder="例: ○○中ペア" value="${escapeHtml(state.opponent || "")}" autocomplete="off" />
          </label>
        </div>
      </article>
    `;
  } else {
    const stats = scoreAnalysisStats(state);
    const serveUs = state.serveSide === "us";
    scoreBoard.innerHTML = `
      <article class="score-card score-card-compact">
        <div class="serve-row" aria-label="このゲームのサーブ">
          <button id="serveP1" class="serve-chip ${serveUs && state.server === 1 ? "active" : ""}" type="button" ${disabled}>${escapeHtml(p1)}サーブ</button>
          <button id="serveP2" class="serve-chip ${serveUs && state.server === 2 ? "active" : ""}" type="button" ${disabled}>${escapeHtml(p2)}サーブ</button>
          <button id="serveThem" class="serve-chip ${serveUs ? "" : "active"}" type="button" ${disabled}>レシーブ</button>
        </div>
        <div class="score-strip">
          <span class="strip-games">G <b>${state.games.us}-${state.games.them}</b></span>
          <strong>${state.points.us} − ${state.points.them}</strong>
          <span class="strip-call">${escapeHtml(scoreCall(state))}</span>
        </div>
        <div class="analysis-grid">
          <button class="ana-win" id="scoreP1Win" type="button" ${disabled}>${escapeHtml(p1)}<b>が決めた +1</b></button>
          <button class="ana-win" id="scoreP2Win" type="button" ${disabled}>${escapeHtml(p2)}<b>が決めた +1</b></button>
          <button class="ana-miss" id="scoreP1Miss" type="button" ${disabled}>${escapeHtml(p1)}<b>のミス −1</b></button>
          <button class="ana-miss" id="scoreP2Miss" type="button" ${disabled}>${escapeHtml(p2)}<b>のミス −1</b></button>
          <button class="ana-other-win" id="scoreUsOther" type="button" ${disabled}>相手ミスで<b>得点 +1</b></button>
          <button class="ana-other-miss" id="scoreThemOther" type="button" ${disabled}>相手に<b>決められた −1</b></button>
        </div>
        <button id="scoreFault" class="fault-button ${state.faultCount === 1 ? "warn" : ""}" type="button" ${disabled}>
          ${state.faultCount === 1 ? "フォルト 1本目 — もう1回でWフォルト" : "フォルト"}
          <b>${serveUs ? "Wフォルトで失点" : `${escapeHtml(opponent)}のWフォルトで得点`}</b>
        </button>
        <div class="score-stats">
          <span>${escapeHtml(p1)}: 得点${stats.players[0].win} / ミス${stats.players[0].miss}</span>
          <span>${escapeHtml(p2)}: 得点${stats.players[1].win} / ミス${stats.players[1].miss}</span>
          <span>1stサーブ: ${escapeHtml(p1)} ${firstServeText(stats.players[0])} / ${escapeHtml(p2)} ${firstServeText(stats.players[1])}</span>
          <span>Wフォルト率: ${escapeHtml(p1)} ${dfRateText(stats.players[0])} / ${escapeHtml(p2)} ${dfRateText(stats.players[1])}（相手${stats.dfThem}本）</span>
        </div>
        ${renderScoreFlow(state)}
        ${tools}
        <div class="score-setup">
          <label><span>選手1の名前</span>
            <input id="scorePlayer1" maxlength="8" placeholder="例: けい" value="${escapeHtml(p1)}" autocomplete="off" />
          </label>
          <label><span>選手2の名前</span>
            <input id="scorePlayer2" maxlength="8" placeholder="例: ゆう" value="${escapeHtml(p2)}" autocomplete="off" />
          </label>
          <label><span>試合形式</span>
            <select id="scoreFormat">
              ${[5, 7, 9].map(format => `<option value="${format}" ${state.format === format ? "selected" : ""}>${format}ゲーム</option>`).join("")}
            </select>
          </label>
          <label><span>相手の名前</span>
            <input id="scoreOpponent" maxlength="12" placeholder="例: ○○中ペア" value="${escapeHtml(state.opponent || "")}" autocomplete="off" />
          </label>
        </div>
      </article>
    `;
  }
  scoreBoard.querySelector("#scoreFormat")?.addEventListener("change", event => {
    const format = Number(event.target.value) || 7;
    resetScore(format);
    petSay(`${format}ゲームマッチに切り替えたよ。${scoreGamesToWin(format)}ゲーム先取だね。`, "focus");
  });
  scoreBoard.querySelector("#scoreOpponent")?.addEventListener("change", event => {
    state.opponent = event.target.value.trim();
    saveStore();
    renderScoreBoard();
  });
  scoreBoard.querySelector("#scoreUs")?.addEventListener("click", () => addScorePoint("us"));
  scoreBoard.querySelector("#scoreThem")?.addEventListener("click", () => addScorePoint("them"));
  scoreBoard.querySelector("#serveP1")?.addEventListener("click", () => {
    state.serveSide = "us";
    state.server = 1;
    state.faultCount = 0;
    saveStore();
    renderScoreBoard();
  });
  scoreBoard.querySelector("#serveP2")?.addEventListener("click", () => {
    state.serveSide = "us";
    state.server = 2;
    state.faultCount = 0;
    saveStore();
    renderScoreBoard();
  });
  scoreBoard.querySelector("#serveThem")?.addEventListener("click", () => {
    state.serveSide = "them";
    state.faultCount = 0;
    saveStore();
    renderScoreBoard();
  });
  scoreBoard.querySelector("#scoreP1Win")?.addEventListener("click", () => addScorePoint("us", { player: 1 }));
  scoreBoard.querySelector("#scoreP2Win")?.addEventListener("click", () => addScorePoint("us", { player: 2 }));
  scoreBoard.querySelector("#scoreP1Miss")?.addEventListener("click", () => addScorePoint("them", { player: 1, reason: "miss" }));
  scoreBoard.querySelector("#scoreP2Miss")?.addEventListener("click", () => addScorePoint("them", { player: 2, reason: "miss" }));
  scoreBoard.querySelector("#scoreUsOther")?.addEventListener("click", () => addScorePoint("us"));
  scoreBoard.querySelector("#scoreThemOther")?.addEventListener("click", () => addScorePoint("them"));
  scoreBoard.querySelector("#scoreFault")?.addEventListener("click", registerScoreFault);
  scoreBoard.querySelector("#scorePlayer1")?.addEventListener("change", event => {
    state.players[0] = event.target.value.trim() || "選手1";
    saveStore();
    renderScoreBoard();
  });
  scoreBoard.querySelector("#scorePlayer2")?.addEventListener("change", event => {
    state.players[1] = event.target.value.trim() || "選手2";
    saveStore();
    renderScoreBoard();
  });
  scoreBoard.querySelector("#scoreUndo")?.addEventListener("click", undoScorePoint);
  scoreBoard.querySelector("#scoreReset")?.addEventListener("click", () => {
    resetScore();
    petSay("スコアをリセットしたよ。次の試合もがんばろう。", "calm");
  });
  scoreBoard.querySelector("#scoreToResult")?.addEventListener("click", saveScoreToResults);
  scoreBoard.querySelector("#judgePaperBtn")?.addEventListener("click", openJudgePaper);
}

const resultFocuses = {
  serve: {
    label: "サーブ",
    icon: "S",
    practiceGoal: "serve",
    advice: "次はトスの高さとセカンドサーブの成功率をそろえよう。速さより、同じフォームで入る本数を見るのが近道だよ。"
  },
  receive: {
    label: "レシーブ",
    icon: "R",
    practiceGoal: "receive",
    advice: "次は構えから1歩目までをテーマにしよう。深く返す球と前衛の足元へ落とす球を分けると、試合で使いやすいよ。"
  },
  front: {
    label: "前衛",
    icon: "F",
    practiceGoal: "front",
    advice: "次は出る球を1種類だけ決めよう。相手後衛の打点が低い時、面が外を向いた時など、判断の合図を作ると迷いが減るよ。"
  },
  back: {
    label: "後衛",
    icon: "B",
    practiceGoal: "back",
    advice: "次は深い球を3本続けてから展開する練習が合いそう。浅くならないことを最優先にしよう。"
  },
  pair: {
    label: "ペア連携",
    icon: "P",
    practiceGoal: "pair",
    advice: "次はペアで合図を2つだけ決めよう。ポイント後の声かけも短くそろえると、2人の判断が合いやすくなるよ。"
  },
  mental: {
    label: "メンタル",
    icon: "M",
    practiceGoal: "pair",
    advice: "次はカウント確認と深呼吸をセットにしよう。焦った場面ほど、次の1本の狙いを声に出すと戻りやすいよ。"
  }
};

function analyzeResult(text) {
  const source = text.toLowerCase();
  const checks = [
    ["serve", ["サーブ", "サービス", "トス", "フォルト", "セカンド"]],
    ["receive", ["レシーブ", "リターン", "返球"]],
    ["front", ["前衛", "ボレー", "ポーチ", "スマッシュ"]],
    ["back", ["後衛", "ラリー", "ストローク", "ロブ", "中ロブ", "深い"]],
    ["pair", ["ペア", "連携", "声", "サイン", "ダブルス"]],
    ["mental", ["緊張", "焦", "ミス", "怖", "集中", "流れ", "メンタル"]]
  ];
  const found = checks.find(([, words]) => words.some(word => source.includes(word)));
  return resultFocuses[found ? found[0] : "mental"];
}

function renderResultCoach() {
  if (!resultCoach) return;
  if (!store.results.length) {
    resultCoach.innerHTML = `
      <div class="coach-card empty">
        <small>COACH NOTE</small>
        <strong>最初の記録を待っているよ</strong>
        <p>できたことと次の課題を1つずつ残すと、ここに次のおすすめ練習が出るよ。</p>
      </div>
    `;
    return;
  }
  const latest = store.results[0];
  const analysis = latest.focus ? resultFocuses[latest.focus] : analyzeResult(`${latest.good} ${latest.next}`);
  const count = store.results.length;
  resultCoach.innerHTML = `
    <div class="coach-card">
      <small>COACH NOTE</small>
      <strong>${count}回分の記録から、次は「${analysis.label}」を育てよう</strong>
      <p>${analysis.advice}</p>
      <button id="useResultFocus" type="button" data-goal="${analysis.practiceGoal}">この課題で練習を作る</button>
    </div>
  `;
  document.querySelector("#useResultFocus")?.addEventListener("click", () => {
    document.querySelector("#practiceGoal").value = analysis.practiceGoal;
    document.querySelector("#makePlan").click();
    document.querySelector('[data-tab="practice"]').click();
  });
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

function makePracticePlan(announce = true) {
  const goal = document.querySelector("#practiceGoal").value;
  const minutes = Number(document.querySelector("#practiceTime").value);
  const level = document.querySelector("#practiceLevel").value;
  const role = document.querySelector("#practiceRole").value;
  const condition = document.querySelector("#practiceCondition").value;
  ensurePreferences();
  const timeUnit = minutes >= 90 ? 18 : minutes >= 60 ? 12 : 7;
  const intensity = condition === "tired" ? "軽め" : condition === "good" ? "高め" : "標準";
  const reps = condition === "tired" ? "6〜8本" : condition === "good" ? "12〜15本" : "10本";
  const levelNote = {
    beginner: "フォームを崩さず、成功体験を増やす",
    middle: "成功率とコースの再現性を両方見る",
    match: "試合の1本目を想定して、判断まで入れる"
  }[level];
  const roleNote = {
    front: "前衛の出る/止まる判断を必ず入れる",
    back: "後衛の深さと展開のタイミングを重視する",
    both: "ペアで声をかけ、前衛後衛のつながりを見る"
  }[role];
  const policyNote = {
    basic: "フォーム、足の位置、打点を毎回そろえる",
    match: "点数や相手の位置を想定して、試合で使う判断にする",
    mental: "ミス後の呼吸、カウント確認、次の狙いをセットにする",
    pair: "ペアへの声かけと、前衛後衛の合図を必ず入れる"
  }[store.preferences.coachPolicy];
  const goalNote = store.preferences.playerGoal ? `目標: ${store.preferences.playerGoal}` : "目標: 今日のテーマを1つ残す";
  const drills = {
    serve: {
      title: "サーブ安定メニュー",
      main: "トスの高さをそろえて、7割の力でセカンドサーブを打つ",
      target: "入るフォームを固定し、右左2コースへ打ち分ける",
      caution: "速さを上げるのは成功率が上がってから"
    },
    receive: {
      title: "レシーブ強化メニュー",
      main: "スプリットステップから1歩目を早く出し、深いレシーブを返す",
      target: "相手後衛の足元か前衛の足元へ狙いを分ける",
      caution: "手だけで返さず、打つ前に小さく沈む"
    },
    front: {
      title: "前衛判断メニュー",
      main: "正面ボレーとポーチ判断を交互に練習する",
      target: "出る球を1種類決め、迷いを減らす",
      caution: "全部出ようとせず、相手の打点と面を見る"
    },
    back: {
      title: "後衛ラリーメニュー",
      main: "深いストロークを左右へ打ち、3球続けてから展開球を入れる",
      target: "深さで相手を下げ、ロブや中ロブで時間を作る",
      caution: "アウトを怖がりすぎて浅くならないようにする"
    },
    pair: {
      title: "ペア連携メニュー",
      main: "サインを2つだけ決め、後衛の深い球から前衛が出る流れを練習する",
      target: "ポイント後に一言で振り返り、次の動きをそろえる",
      caution: "反省を長くしすぎず、次の1本の合図に変える"
    }
  };
  const drill = drills[goal];
  const plan = [
    {
      title: "ウォームアップ",
      minutes: condition === "tired" ? 6 : 8,
      reps: "肩・股関節・軽いラリー",
      aim: "体を温めて、今日の調子を確認する",
      caution: condition === "tired" ? "無理に強く打たず、呼吸を整える" : "最初から全力にしない"
    },
    {
      title: drill.title,
      minutes: timeUnit,
      reps,
      aim: drill.target,
      caution: drill.caution
    },
    {
      title: role === "front" ? "前衛連動" : role === "back" ? "後衛展開" : "ペア連携",
      minutes: timeUnit,
      reps: level === "match" ? "ポイント形式5本" : "左右セット3回",
      aim: `${drill.main}。${roleNote}`,
      caution: levelNote
    },
    {
      title: level === "match" ? "試合想定" : "仕上げ",
      minutes: Math.max(5, Math.round(minutes / 8)),
      reps: level === "match" ? "ゲーム形式" : "今日のベスト3本",
      aim: "練習したテーマを実戦に近い形で使う",
      caution: `強度は${intensity}。${policyNote}。${goalNote}`
    }
  ];
  const list = document.querySelector("#practicePlan");
  list.innerHTML = "";
  plan.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "plan-card";
    card.innerHTML = `
      <header><b>${index + 1}</b><strong>${item.title}</strong></header>
      <div class="plan-meta"><span>${item.minutes}分</span><span>${item.reps}</span></div>
      <p><strong>ねらい:</strong> ${item.aim}</p>
      <p><strong>注意:</strong> ${item.caution}</p>
    `;
    list.append(card);
  });
  if (announce) {
    addBondXp(8, "練習メニューを作った", "focus", false);
    const message = store.character === "lee"
      ? "メニュー完成！今日は全部を完璧にしなくてOK。1テーマを決めて、元気よくやり切ろう！"
      : "いいメニューができたよ。今日は全部やるより、最後まで集中して1テーマを育てよう。";
    petSay(message, "wink");
  }
}

function renderRules(filter = "") {
  const q = filter.trim().toLowerCase();
  ruleCards.innerHTML = "";
  const shown = rules.filter(rule => {
    const matchCategory = activeRuleCategory === "all" || rule.category === activeRuleCategory;
    const haystack = `${rule.title} ${rule.keys} ${rule.body} ${rule.tags.join(" ")}`.toLowerCase();
    return matchCategory && (!q || haystack.includes(q));
  });
  document.querySelector("#ruleCount").textContent = `${shown.length}件のルール解説`;
  for (const rule of shown) {
    const node = document.createElement("article");
    node.className = "rule-card";
    node.innerHTML = `<small>${rule.source}</small><strong>${rule.title}</strong><p>${rule.body}</p><div class="rule-tags">${rule.tags.map(tag => `<span>${tag}</span>`).join("")}</div>`;
    ruleCards.append(node);
  }
  if (!shown.length) {
    const node = document.createElement("article");
    node.className = "rule-card";
    node.textContent = "見つからなかったよ。得点、ファイナル、ダブルス、バウンド、マナーなどで探してみて。";
    ruleCards.append(node);
  }
}

function drawPet(now) {
  t = now / 1000;
  const dt = Math.min(.033, lastFrameTime ? (now - lastFrameTime) / 1000 : .016);
  lastFrameTime = now;
  blinkTimer -= .016;
  if (blinkTimer <= 0) blinkTimer = 2.4 + Math.random() * 2.7;
  ctx.clearRect(0, 0, W, H);

  drawFloatingBalls();
  if (spritePet) {
    updatePetPhysics(dt);
    requestAnimationFrame(drawPet);
    return;
  }
  const x = W * .5 + Math.sin(t * 1.3) * 20;
  const y = H * .52 + Math.sin(t * 2.1) * 12;
  const squash = Math.sin(t * 2.1) * .035;
  if (spriteReady && store.spriteFrame) drawSpriteKon(x, y, 1 - squash, 1 + squash);
  else drawKon(x, y, 1 - squash, 1 + squash);
  requestAnimationFrame(drawPet);
}

function drawFloatingBalls() {
  for (let i = 0; i < 6; i++) {
    const x = (i * 84 + t * 22) % (W + 80) - 40;
    const y = 54 + Math.sin(t * 1.4 + i) * 14 + i * 19;
    ctx.globalAlpha = .16;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(x, y, 12 + i % 2 * 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawSpriteKon(x, y, sx, sy) {
  const source = spriteFrameCanvas || spriteImage;
  const targetW = 142;
  const targetH = targetW * (source.height / source.width);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sx, sy);
  ctx.fillStyle = "rgba(24,48,76,.13)";
  ctx.beginPath();
  ctx.ellipse(0, targetH * .42, targetW * .34, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, -targetW / 2, -targetH / 2, targetW, targetH);
  ctx.restore();
}

function drawKon(x, y, sx, sy) {
  const p = palettes[store.color];
  const blink = blinkTimer < .13;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sx, sy);

  ctx.fillStyle = "rgba(24,48,76,.13)";
  ctx.beginPath();
  ctx.ellipse(0, 69, 58, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(20, 37, 55, .82)";
  ctx.lineWidth = 2.15;

  const bodyGrad = ctx.createRadialGradient(-18, -12, 12, 0, 18, 70);
  bodyGrad.addColorStop(0, "#ffffff");
  bodyGrad.addColorStop(.58, "#fffefd");
  bodyGrad.addColorStop(.86, "#f3f5f0");
  bodyGrad.addColorStop(1, "#e6ebe7");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(0, 17, 63, 54, -.02, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(212, 220, 213, .45)";
  ctx.beginPath();
  ctx.ellipse(2, 42, 45, 17, 0, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.7)";
  ctx.beginPath();
  ctx.ellipse(-25, -1, 18, 11, -.45, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.rotate(-.08);

  const capGrad = ctx.createLinearGradient(-44, -62, 28, -14);
  capGrad.addColorStop(0, "#ff7770");
  capGrad.addColorStop(.52, p.cap);
  capGrad.addColorStop(1, "#d93643");
  ctx.fillStyle = capGrad;
  ctx.beginPath();
  ctx.moveTo(-52, -17);
  ctx.bezierCurveTo(-49, -46, -28, -67, -2, -67);
  ctx.bezierCurveTo(22, -67, 42, -47, 45, -17);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,.24)";
  ctx.beginPath();
  ctx.ellipse(-23, -47, 18, 9, -.55, 0, Math.PI * 2);
  ctx.fill();

  const sideGrad = ctx.createLinearGradient(9, -64, 45, -17);
  sideGrad.addColorStop(0, "#263b70");
  sideGrad.addColorStop(.82, p.side);
  ctx.fillStyle = sideGrad;
  ctx.beginPath();
  ctx.moveTo(11, -63);
  ctx.bezierCurveTo(26, -58, 40, -43, 45, -17);
  ctx.lineTo(17, -17);
  ctx.bezierCurveTo(18, -33, 17, -48, 11, -63);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(20, 37, 55, .72)";
  ctx.lineWidth = 1.55;
  ctx.stroke();

  const billGrad = ctx.createLinearGradient(31, -36, 83, -26);
  billGrad.addColorStop(0, "#bffff7");
  billGrad.addColorStop(.58, p.bill);
  billGrad.addColorStop(1, "#54cbd2");
  ctx.fillStyle = p.bill;
  ctx.beginPath();
  ctx.ellipse(57, -30, 31, 11, -.16, 0, Math.PI * 2);
  ctx.fillStyle = billGrad;
  ctx.fill();
  ctx.lineWidth = 1.8;
  ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.lineWidth = 1.55;
  roundRect(-25, -27, 33, 15, 7, true, true);
  ctx.fillStyle = "#d77a4b";
  roundRect(-20, -19, 27, 7, 3, true, false);
  ctx.strokeStyle = "rgba(80, 47, 37, .7)";
  ctx.lineWidth = .8;
  for (let i = -17; i <= 2; i += 5) {
    ctx.beginPath();
    ctx.moveTo(i, -18.5);
    ctx.lineTo(i + 1, -13.5);
    ctx.stroke();
  }
  ctx.restore();

  ctx.fillStyle = "#172b3e";
  ctx.strokeStyle = "#172b3e";
  if (mood === "happy") {
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    ctx.moveTo(-24, 8); ctx.quadraticCurveTo(-17, 15, -24, 21);
    ctx.moveTo(24, 8); ctx.quadraticCurveTo(17, 15, 24, 21);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 22, 15, 0, Math.PI);
    ctx.stroke();
  } else if (mood === "think") {
    ctx.beginPath();
    ctx.ellipse(-20, 10, 3.2, blink ? .8 : 6.2, 0, 0, Math.PI * 2);
    ctx.ellipse(20, 10, 3.2, blink ? .8 : 6.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 23, 11, Math.PI * .1, Math.PI * .9);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.ellipse(-20, 10, 3.3, blink ? .8 : 6.4, 0, 0, Math.PI * 2);
    ctx.ellipse(20, 10, 3.3, blink ? .8 : 6.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 18, 14, .14, Math.PI - .14);
    ctx.stroke();
  }
  ctx.strokeStyle = p.cheek;
  ctx.lineWidth = 1.7;
  for (const cx of [-37, 31]) {
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + i * 4.5, 25);
      ctx.lineTo(cx - 1.5 + i * 4.5, 33);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawRacket(x, y, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-.52);
  ctx.strokeStyle = "rgba(20, 37, 55, .82)";
  ctx.lineWidth = 2;
  const grad = ctx.createLinearGradient(-12, -55, 13, -5);
  grad.addColorStop(0, "#dffcff");
  grad.addColorStop(.55, color);
  grad.addColorStop(1, "#3aa9b8");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, -28, 19, 28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,.75)";
  ctx.lineWidth = .95;
  for (let i = -10; i <= 10; i += 5) {
    ctx.beginPath(); ctx.moveTo(i, -50); ctx.lineTo(i, -6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-15, -28 + i); ctx.lineTo(15, -28 + i); ctx.stroke();
  }
  ctx.strokeStyle = "rgba(20, 37, 55, .86)";
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(0, -3);
  ctx.lineTo(0, 37);
  ctx.stroke();
  ctx.restore();
}

function roundRect(x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

petNameInput.addEventListener("input", () => {
  store.name = petNameInput.value.trim() || "コン";
  saveStore();
  petSay(`${store.name}って呼んでね。今日も一緒にがんばろう。`, "happy");
});

characterCards.forEach(card => {
  card.addEventListener("click", () => {
    selectCharacter(card.dataset.character);
  });
});

petColorSelect.addEventListener("change", () => {
  store.color = petColorSelect.value;
  document.documentElement.style.setProperty("--accent", palettes[store.color].accent);
  saveStore();
  petSay("色が変わったよ。いつか帽子や表情も選べるようにしたいね。", "happy");
});

talkStyleSelect.addEventListener("change", () => {
  ensurePreferences();
  store.preferences.talkStyle = talkStyleSelect.value;
  saveStore();
  petSay(styleReply("話し方を変えたよ。これからの相談でこの感じを大事にするね。"), "happy");
});

coachPolicySelect.addEventListener("change", () => {
  ensurePreferences();
  store.preferences.coachPolicy = coachPolicySelect.value;
  const practiceGoal = document.querySelector("#practiceGoal");
  if (practiceGoal) practiceGoal.value = policyGoal();
  saveStore();
  makePracticePlan(false);
  petSay(styleReply("コーチ方針を更新したよ。練習メニューにも反映していくね。"), "focus");
});

document.querySelector("#scoreMode")?.addEventListener("change", event => {
  ensurePreferences();
  store.preferences.scoreMode = event.target.value === "analysis" ? "analysis" : "simple";
  saveStore();
  renderScoreBoard();
  petSay(store.preferences.scoreMode === "analysis"
    ? "分析モードにしたよ。サーブ側と、誰の得点・ミスかも記録して、試合の流れを見ていこう。"
    : "シンプルモードにしたよ。得点だけサクッと数えよう。", "focus");
});

playerRoleSelect.addEventListener("change", () => {
  ensurePreferences();
  store.preferences.playerRole = playerRoleSelect.value;
  document.querySelector("#practiceRole").value = store.preferences.playerRole;
  saveStore();
  makePracticePlan(false);
  petSay("ポジションを覚えたよ。次の練習はそこを見ながら組むね。", "wink");
});

playerLevelSelect.addEventListener("change", () => {
  ensurePreferences();
  store.preferences.playerLevel = playerLevelSelect.value;
  document.querySelector("#practiceLevel").value = store.preferences.playerLevel;
  saveStore();
  makePracticePlan(false);
  petSay("経験レベルを更新したよ。無理なく伸びる強さに調整するね。", "happy");
});

playerGoalInput.addEventListener("input", () => {
  ensurePreferences();
  store.preferences.playerGoal = playerGoalInput.value.trim();
  saveStore();
  renderDailyPlan();
});

playerGoalInput.addEventListener("change", () => {
  makePracticePlan(false);
  const text = store.preferences.playerGoal
    ? `目標「${store.preferences.playerGoal}」、ちゃんと覚えたよ。`
    : "目標は空にしたよ。決まったらまた入れてね。";
  petSay(text, "heart");
});

document.querySelector("#petButton").addEventListener("click", () => {
  const lines = [
    "今日の結果はどうだった？できたことから聞かせて。",
    "今日はどんな練習をする？テーマを1つ選ぼう。",
    "無理に全部直さなくて大丈夫。次の1本だけ決めよう。",
    "ペアと話したこともメモしておくと、明日の連携がよくなるよ。"
  ];
  const moods = ["happy", "wink", "focus", "calm"];
  const index = Math.floor(Math.random() * lines.length);
  petSay(lines[index], moods[index]);
});

spritePet?.addEventListener("pointerdown", event => {
  if (rally.active) return;
  event.preventDefault();
  spritePet.setPointerCapture(event.pointerId);
  initPetPhysics();
  petPhysics.dragging = true;
  petPhysics.active = true;
  petPhysics.settleTimer = 0;
  petPhysics.lastPointerX = event.clientX;
  petPhysics.lastPointerY = event.clientY;
  petPhysics.lastPointerTime = performance.now();
  petPhysics.vx = 0;
  petPhysics.vy = 0;
  setExpression("surprised", 800);
});

spritePet?.addEventListener("pointermove", event => {
  if (!petPhysics.dragging) return;
  const rect = canvas.getBoundingClientRect();
  const now = performance.now();
  const dt = Math.max(16, now - petPhysics.lastPointerTime) / 1000;
  const nextX = event.clientX - rect.left;
  const nextY = event.clientY - rect.top;
  petPhysics.vx = (event.clientX - petPhysics.lastPointerX) / dt;
  petPhysics.vy = (event.clientY - petPhysics.lastPointerY) / dt;
  petPhysics.x = nextX;
  petPhysics.y = nextY;
  petPhysics.angular = Math.max(-5, Math.min(5, petPhysics.vx / 220));
  petPhysics.lastPointerX = event.clientX;
  petPhysics.lastPointerY = event.clientY;
  petPhysics.lastPointerTime = now;
  petPhysics.scaleX = 1.03;
  petPhysics.scaleY = .97;
  clampPetIntoCourt();
});

spritePet?.addEventListener("pointerup", event => {
  petPhysics.dragging = false;
  spritePet.releasePointerCapture(event.pointerId);
  petPhysics.active = true;
  petPhysics.settleTimer = 0;
  if (Math.hypot(petPhysics.vx, petPhysics.vy) < 80) bouncePetFromPointer(event);
  else {
    petPhysics.vx = Math.max(-520, Math.min(520, petPhysics.vx));
    petPhysics.vy = Math.max(-520, Math.min(520, petPhysics.vy));
    setExpression("wink", 900);
  }
});

spritePet?.addEventListener("pointercancel", () => {
  petPhysics.dragging = false;
});

skyCard?.addEventListener("pointerdown", event => {
  if (event.target.closest("button")) return;
  if (rally.active) {
    event.preventDefault();
    rally.steering = true;
    try {
      skyCard.setPointerCapture(event.pointerId);
    } catch {}
    steerRacket(event);
    return;
  }
  if (event.target === spritePet || event.target === rallyBall) return;
  bouncePetFromPointer(event);
});

skyCard?.addEventListener("pointermove", event => {
  if (!rally.active) return;
  if (rally.steering || event.pointerType === "mouse") steerRacket(event);
});

skyCard?.addEventListener("pointerup", () => {
  rally.steering = false;
});

skyCard?.addEventListener("pointercancel", () => {
  rally.steering = false;
});

rallyButton?.addEventListener("click", startRally);

settingsButton.addEventListener("click", openSettings);
document.querySelectorAll("[data-close-settings]").forEach(button => {
  button.addEventListener("click", closeSettings);
});
window.addEventListener("keydown", event => {
  if (event.key === "Escape") closeSettings();
});

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
    document.querySelectorAll(".panel").forEach(x => x.classList.remove("active"));
    tab.classList.add("active");
    document.querySelector(`#${tab.dataset.tab}`).classList.add("active");
    const tabMood = { today: "happy", chat: "calm", practice: "focus", match: "focus", score: "focus", result: "happy", rules: "focus" }[tab.dataset.tab] || "calm";
    setExpression(tabMood, 1800);
  });
});

function submitChat(text) {
  text = text.trim();
  if (!text) return;
  addMessage("user", text);
  addBondXp(4, "相棒に相談した", "happy", false);
  chatInput.value = "";
  const reply = coachReply(text);
  const replyMood = expressionForText(text);
  setTimeout(() => {
    addMessage("pet", reply);
    petSay(reply, replyMood);
  }, 250);
}

chatForm.addEventListener("submit", event => {
  event.preventDefault();
  const prompt = event.submitter?.dataset?.prompt;
  submitChat(prompt || chatInput.value);
});

document.querySelector("#makePlan").addEventListener("click", makePracticePlan);

resultForm.addEventListener("submit", event => {
  event.preventDefault();
  const title = document.querySelector("#resultTitle").value.trim() || "今日のメモ";
  const good = document.querySelector("#goodPoint").value.trim() || "最後まで集中できた";
  const next = document.querySelector("#nextPoint").value.trim() || "次の練習テーマを1つ決める";
  const analysis = analyzeResult(`${title} ${good} ${next}`);
  store.results.unshift({
    date: new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium" }).format(new Date()),
    title, good, next,
    focus: Object.entries(resultFocuses).find(([, value]) => value === analysis)?.[0] || "mental",
    type: "practice"
  });
  saveStore();
  renderResults();
  renderDailyPlan();
  addBondXp(18, "結果を記録した", "happy", false);
  resultForm.reset();
  const resultMessage = store.character === "lee"
    ? `記録できた！次は${analysis.label}を育てよう。いい流れ、作れるよ！`
    : `記録できたよ。次は${analysis.label}を少し育てると、次の一歩につながりそう。`;
  petSay(resultMessage, "happy");
});

document.querySelectorAll("[data-result-view]").forEach(button => {
  button.addEventListener("click", () => {
    resultView = button.dataset.resultView;
    document.querySelectorAll("[data-result-view]").forEach(x => x.classList.toggle("active", x === button));
    document.querySelector("#result").classList.toggle("view-match", resultView === "match");
    renderResults();
    setExpression(resultView === "match" ? "focus" : "happy", 1200);
  });
});

ruleSearch.addEventListener("input", () => renderRules(ruleSearch.value));
document.querySelectorAll("[data-rule-category]").forEach(button => {
  button.addEventListener("click", () => {
    activeRuleCategory = button.dataset.ruleCategory;
    document.querySelectorAll("[data-rule-category]").forEach(x => x.classList.remove("active"));
    button.classList.add("active");
    renderRules(ruleSearch.value);
    setExpression("focus", 1500);
  });
});

document.documentElement.style.setProperty("--accent", palettes[store.color].accent);
ensureDailyPlan();
ensureBond();
ensurePreferences();
ensureMatchPrep();
document.querySelector("#practiceCondition").value = conditionOptions[store.daily.condition]?.practiceCondition || "normal";
syncCharacterCards();
syncPreferenceControls();
renderDailyPlan();
seedChat();
renderMatchChecklist();
ensureScore();
renderScoreBoard();
renderResults();
renderRules();
makePracticePlan(false);
petSay(store.character === "lee" ? "今日の調子はどう？リーと一緒に、次の一歩を決めよう！" : "今日の結果はどうだった？一緒に振り返ろう。", "smile");
setExpression("calm");
updateSpriteStatus();
if (store.spriteData) loadSprite(store.spriteData, null, false);
requestAnimationFrame(drawPet);

// ホーム画面に追加（PWA）
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

let installPromptEvent = null;
const installButton = document.querySelector("#installApp");
window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  installPromptEvent = event;
  installButton?.classList.remove("hidden");
});
installButton?.addEventListener("click", async () => {
  if (!installPromptEvent) return;
  installPromptEvent.prompt();
  const choice = await installPromptEvent.userChoice;
  installPromptEvent = null;
  installButton.classList.add("hidden");
  if (choice.outcome === "accepted") {
    petSay("ホーム画面に追加できたよ。これからはアイコンから1タップだね！", "heart");
  }
});
window.addEventListener("appinstalled", () => {
  installButton?.classList.add("hidden");
});
