/**
 * 用法：Sub-Store 脚本操作添加
 */

const inArg = $arguments;
const nm = inArg.nm || false;  // only keep nm flag as we only care about unmatched nodes

const nameMap = {
    cn: "cn",
    zh: "cn",
    us: "us",
    en: "us",
    quan: "quan",
    gq: "gq",
    flag: "gq",
};

const inname = nameMap[inArg.in] || "",
    outputName = nameMap[inArg.out] || "";

// Keep all the name arrays as they're essential for mapping
const FG = ['🇭🇰','🇲🇴','🇹🇼','🇯🇵','🇰🇷','🇸🇬','🇺🇸','🇬🇧'];
const EN = ['HK','MO','TW','JP','KR','SG','US','GB'];
const ZH = ['香港','澳门','台湾','日本','韩国','新加坡','美国','英国'];
const QC = ['Hong Kong','Macao','Taiwan','Japan','Korea','Singapore','United States','United Kingdom'];

function getList(arg) {
    switch (arg) {
        case 'us':
            return EN;
        case 'gq':
            return FG;
        case 'quan':
            return QC;
        default:
            return ZH;
    }
}

// Keep the jxh function as it handles numbering
function jxh(e) {
    const n = e.reduce((e, n) => {
        const t = e.find((e) => e.name === n.name);
        if (t) {
            t.count++;
            t.items.push({...n, name: `${n.name} ${t.count.toString().padStart(2, "0")}`});
        } else {
            e.push({name: n.name, count: 1, items: [{...n, name: `${n.name} 01`}]});
        }
        return e;
    }, []);
    const t = n.flatMap((e) => e.items);
    e.splice(0, e.length, ...t);
    return e;
}

function operator(pro) {
    const Allmap = {};
    const outList = getList(outputName);
    let inputList = inname !== "" ? [getList(inname)] : [ZH, FG, QC, EN];

    inputList.forEach((arr) => {
        arr.forEach((value, valueIndex) => {
            Allmap[value] = outList[valueIndex];
        });
    });

    pro.forEach((e) => {
        let findKey = false;
        for (const [key, value] of Object.entries(Allmap)) {
            if (e.name.includes(key)) {
                e.name = value;
                findKey = true;
                break;
            }
        }
        if (!findKey && !nm) {
            e.name = null;
        }
    });

    pro = pro.filter((e) => e.name !== null);
    jxh(pro);
    return pro;
}
