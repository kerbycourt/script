class NodeMapper {
  constructor() {
    // Name format mapping
    this.nameMap = {
      cn: "cn",
      zh: "cn",
      us: "us",
      en: "us",
      quan: "quan",
      gq: "gq",
      flag: "gq"
    };

    // Parallel arrays for different naming systems
    this.FG = ['🇭🇰','🇲🇴','🇹🇼','🇯🇵','🇰🇷','🇸🇬','🇺🇸','🇬🇧'];
    this.EN = ['HK','MO','TW','JP','KR','SG','US','GB'];
    this.ZH = ['香港','澳门','台湾','日本','韩国','新加坡','美国','英国'];
    this.QC = ['Hong Kong','Macao','Taiwan','Japan','Korea','Singapore','United States','United Kingdom'];
  }

  getList(format) {
    switch (format) {
      case 'us': 
        return this.EN;
      case 'gq': 
        return this.FG;
      case 'quan': 
        return this.QC;
      default: 
        return this.ZH;
    }
  }

  buildNameMap(inputFormat, outputFormat) {
    const Allmap = {};
    const outList = this.getList(outputFormat || "cn");
    const inputLists = inputFormat ? 
      [this.getList(inputFormat)] : 
      [this.ZH, this.FG, this.QC, this.EN];

    inputLists.forEach(list => {
      list.forEach((value, index) => {
        Allmap[value] = outList[index];
      });
    });

    return Allmap;
  }

  process(nodes, options = {}) {
    const {
      in: inputFormat,
      out: outputFormat = "cn"
    } = options;

    const nameMapping = this.buildNameMap(
      this.nameMap[inputFormat],
      this.nameMap[outputFormat]
    );

    const counts = {};
    
    return nodes.map(node => {
      let newName = null;
      
      // Find matching name in mapping
      for (const [key, value] of Object.entries(nameMapping)) {
        if (node.name.includes(key)) {
          newName = value;
          break;
        }
      }

      if (!newName) {
        return null;
      }

      // Add numbering
      counts[newName] = (counts[newName] || 0) + 1;
      newName = `${newName} ${String(counts[newName]).padStart(2, '0')}`;

      return {
        ...node,
        name: newName
      };
    }).filter(Boolean);
  }
}

// Usage:
/*
const mapper = new NodeMapper();
const nodes = [
  { name: "日本 IPLC" },
  { name: "HK 5x" },
  { name: "SG Premium" }
];

const result = mapper.process(nodes, {
  in: "zh",    // Input format (zh, en, gq, quan)
  out: "cn"    // Output format (cn, us, gq, quan)
});
*/
