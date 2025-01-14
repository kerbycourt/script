/**
 * 更新日期：2024-01-14
 * 用法：Common Proxy Nodes Renaming Script
 * rename.js 以下是此脚本支持的参数，必须以 # 为开头多个参数使用"&"连接
 *
 *** 主要参数
 * [nm]    保留没有匹配到的节点
 * [bl]     正则匹配保留 [0.1x, x0.2, 6x ,3倍]等标识
 * [blnx]   只保留高倍率
 * [nx]     保留1倍率与不显示倍率的
 * [clear]  清理乱名
 * [nf]     把 name= 的前缀值放在最前面
 * [key]    只保留关键词的节点
 * [blockquic] 阻止quic协议
 *
 *** 分隔符参数
 * [fgf=]   节点名前缀分隔符，默认为空格
 * [sn=]    设置国家与序号之间的分隔符，默认为空格
 * [name=]  节点添加机场名称前缀
 *
 *** 序号参数
 * [one]    清理只有一个节点的地区的01
 */

const inArg = $arguments;

const nm = inArg.nm || false,
  numone = inArg.one || false,
  bl = inArg.bl || false,
  nx = inArg.nx || false,
  blnx = inArg.blnx || false,
  clear = inArg.clear || false,
  nf = inArg.nf || false,
  key = inArg.key || false;

const FGF = inArg.fgf == undefined ? " " : decodeURI(inArg.fgf),
  XHFGF = inArg.sn == undefined ? " " : decodeURI(inArg.sn),
  FNAME = inArg.name == undefined ? "" : decodeURI(inArg.name),
  blockquic = inArg.blockquic == undefined ? "" : decodeURI(inArg.blockquic);

// Clean up patterns
const nameclear = /(套餐|到期|有效|剩余|版本|已用|过期|失联|测试|官方|网址|备用|群|TEST|客服|网站|获取|订阅|流量|机场|下次|官址|联系|邮箱|工单|学术|USE|USED|TOTAL|EXPIRE|EMAIL)/i;

// Special regex patterns
const specialRegex = [
  /(\d\.)?\d+×/,
  /IPLC|IEPL|Kern|Edge|Pro|Std|Exp|Biz|Fam|Game|Buy|Zx|LB|Game/,
];

const regexArray = [/ˣ²/, /ˣ³/, /ˣ⁴/, /ˣ⁵/, /ˣ⁶/, /ˣ⁷/, /ˣ⁸/, /ˣ⁹/, /ˣ¹⁰/, /ˣ²⁰/, /ˣ³⁰/, /ˣ⁴⁰/, /ˣ⁵⁰/, /IPLC/i, /IEPL/i, /核心/, /边缘/, /高级/, /标准/, /实验/, /商宽/, /家宽/, /游戏|game/i, /购物/, /专线/, /LB/, /cloudflare/i, /\budp\b/i, /\bgpt\b/i, /udpn\b/];

const valueArray = ["2×", "3×", "4×", "5×", "6×", "7×", "8×", "9×", "10×", "20×", "30×", "40×", "50×", "IPLC", "IEPL", "Kern", "Edge", "Pro", "Std", "Exp", "Biz", "Fam", "Game", "Buy", "Zx", "LB", "CF", "UDP", "GPT", "UDPN"];

// Multiplier patterns
const nameblnx = /(高倍|(?!1)2+(x|倍)|ˣ²|ˣ³|ˣ⁴|ˣ⁵|ˣ¹⁰)/i;
const namenx = /(高倍|(?!1)(0\.|\d)+(x|倍)|ˣ²|ˣ³|ˣ⁴|ˣ⁵|ˣ¹⁰)/i;

// Key patterns for filtering
const keya = /港|Hong|HK|新加坡|SG|Singapore|日本|Japan|JP|美国|United States|US|韩|台|Taiwan|TW|🇸🇬|🇭🇰|🇯🇵|🇺🇸|🇰🇷|🇹🇼/i;
const keyb = /(((1|2|3|4)\d)|(香港|HK) 0[5-9]|((新加坡|SG|Singapore|日本|Japan|JP|美国|United States|US|韩|台|Taiwan|TW) 0[3-9]))/i;

// Common locations - using simplified Chinese
const rurekey = {
  "香港": /(深|沪|呼|京|广|杭)港(?!.*(I|线))|Hong Kong|HongKong|HONG KONG|HK/gi,
  "台湾": /Taiwan|TW|Taipei|TPE|新台|新北|台(?!.*线)/gi,
  "新加坡": /Singapore|SG|SGP|狮城|(深|沪|呼|京|广|杭)新/gi,
  "日本": /(深|沪|呼|京|广|杭|中|辽)日(?!.*(I|线))|Japan|JP|JPN|Tokyo|Osaka|东京|大阪/gi,
  "美国": /United States|USA|US|America|(深|沪|呼|京|广|杭)美|Los Angeles|San Jose|Silicon Valley|Washington|Seattle|波特兰|芝加哥|哥伦布|纽约|硅谷|俄勒冈|西雅图/gi
};

function operator(pro) {
  // Handle clean up and filtering first
  if (clear || nx || blnx || key) {
    pro = pro.filter((res) => {
      const resname = res.name;
      const shouldKeep =
        !(clear && nameclear.test(resname)) &&
        !(nx && namenx.test(resname)) &&
        !(blnx && !nameblnx.test(resname)) &&
        !(key && !(keya.test(resname) && /2|4|6|7/i.test(resname)));
      return shouldKeep;
    });
  }

  pro.forEach((e) => {
    let ikey = "";
    let ikeys = "";
    
    // Handle special indicators
    if (bl) {
      const match = e.name.match(/((倍率|X|x|×)\D?((\d{1,3}\.)?\d+)\D?)|((\d{1,3}\.)?\d+)(倍|X|x|×)/);
      if (match) {
        const rev = match[0].match(/(\d[\d.]*)/)[0];
        if (rev !== "1") {
          ikey = rev + "×";
        }
      }
    }

    // Replace matched patterns
    Object.keys(rurekey).forEach((key) => {
      if (rurekey[key].test(e.name)) {
        e.name = e.name.replace(rurekey[key], key);
      }
    });

    // Handle blockquic
    if (blockquic == "on") {
      e["block-quic"] = "on";
    } else if (blockquic == "off") {
      e["block-quic"] = "off";
    } else {
      delete e["block-quic"];
    }

    // Handle prefixes
    let firstName = "", nNames = "";
    if (nf) {
      firstName = FNAME;
    } else {
      nNames = FNAME;
    }

    if (/(香港|台湾|新加坡|日本|美国)/.test(e.name)) {
      const elements = [firstName, nNames, e.name, ikey, ikeys].filter(Boolean);
      e.name = elements.join(FGF);
    } else {
      e.name = nm ? `${FNAME}${FGF}${e.name}` : null;
    }
  });

  // Remove null names
  pro = pro.filter((e) => e.name !== null);
  
  // Add numbering
  jxh(pro);
  
  // Clean up single node numbers if requested
  numone && oneP(pro);
  
  // Additional key-based filtering
  key && (pro = pro.filter((e) => !keyb.test(e.name)));
  
  return pro;
}

// Numbering function
function jxh(e) {
  const n = e.reduce((e, n) => {
    const t = e.find((e) => e.name === n.name);
    if (t) {
      t.count++;
      t.items.push({
        ...n,
        name: `${n.name}${XHFGF}${t.count.toString().padStart(2, "0")}`,
      });
    } else {
      e.push({
        name: n.name,
        count: 1,
        items: [{
          ...n,
          name: `${n.name}${XHFGF}01`
        }],
      });
    }
    return e;
  }, []);
  const t = (typeof Array.prototype.flatMap === 'function' ? 
    n.flatMap((e) => e.items) : 
    n.reduce((acc, e) => acc.concat(e.items), []));
  e.splice(0, e.length, ...t);
  return e;
}

// Single node cleanup function
function oneP(e) {
  const t = e.reduce((e, t) => {
    const n = t.name.replace(/[^A-Za-z0-9\u00C0-\u017F\u4E00-\u9FFF]+\d+$/, "");
    if (!e[n]) {
      e[n] = [];
    }
    e[n].push(t);
    return e;
  }, {});
  for (const e in t) {
    if (t[e].length === 1 && t[e][0].name.endsWith("01")) {
      t[e][0].name = t[e][0].name.replace(/[^.]01/, "");
    }
  }
  return e;
}