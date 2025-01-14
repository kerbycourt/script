function operator(proxies = [], targetPlatform, context) {
  const inArg = $arguments;
  const nm = inArg.nm || false;

  const nameMap = {
    cn: "cn",
    zh: "cn",
    us: "us",
    en: "us",
    quan: "quan",
    gq: "gq",
    flag: "gq"
  };

  const inname = nameMap[inArg.in] || "",
    outputName = nameMap[inArg.out] || "";

  // Parallel arrays for different naming systems
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

  function jxh(e) {
    const n = e.reduce((e, n) => {
      const t = e.find((e) => e.name === n.name);
      if (t) {
        t.count++;
        t.items.push({
          ...n,
          name: `${n.name} ${t.count.toString().padStart(2, "0")}`
        });
      } else {
        e.push({
          name: n.name,
          count: 1,
          items: [{
            ...n,
            name: `${n.name} 01`
          }]
        });
      }
      return e;
    }, []);
    
    const t = n.flatMap((e) => e.items);
    e.splice(0, e.length, ...t);
    return e;
  }

  const Allmap = {};
  const outList = getList(outputName);
  let inputList = inname !== "" ? [getList(inname)] : [ZH, FG, QC, EN];

  inputList.forEach((arr) => {
    arr.forEach((value, valueIndex) => {
      Allmap[value] = outList[valueIndex];
    });
  });

  proxies.forEach((proxy) => {
    let findKey = false;
    for (const [key, value] of Object.entries(Allmap)) {
      if (proxy.name.includes(key)) {
        proxy.name = value;
        findKey = true;
        break;
      }
    }
    if (!findKey && !nm) {
      proxy.name = null;
    }
  });

  const filteredProxies = proxies.filter((proxy) => proxy.name !== null);
  jxh(filteredProxies);
  return filteredProxies;
}
