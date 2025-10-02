function getIPA_AttGr() {
    let charToPhoneme = [
        ["a", "a"],
        ["ā", "aː"],
        ["ai", "ai̯"],
        ["āi", "aːi̯"],
        ["au", "au̯"],
        ["āu", "aːu̯"],
        ["b", "b"],
        ["ch", "kʰ"],
        ["d", "d"],
        ["e", "e"],
        ["ē", "ɛː"],
        ["ei", "eː"],
        ["ēi", "ɛːi̯"],
        ["eu", "eu̯"],
        ["ēu", "ɛːu̯"],
        ["g", "g"],
        ["h", "h"],
        ["i", "i"],
        ["ī", "iː"],
        ["k", "k"],
        ["l", "l"],
        ["m", "m"],
        ["n", "n"],
        ["o", "o"],
        ["ō", "ɔː"],
        ["oi", "oi̯"],
        ["ōi", "ɔːi̯"],
        ["ou", "uː"],
        ["p", "p"],
        ["ph", "pʰ"],
        ["r", "r"],
        ["rh", "r̥"],
        ["s", "s"],
        ["t", "t"],
        ["th", "tʰ"],
        ["x", "k,s"],
        ["y", "y"],
        ["ȳ", "yː"],
        ["yi", "yi̯"],
        ["z", "z,d"],
    ];

    let noAccents = wordArg.normalize("NFD").replaceAll("\u0301", "").replaceAll(/(?<=[iu])\u0302/g, "").replaceAll(/(?<=\u0304)\u0308/g, "").replaceAll(/\u0308(?=\u0302)/g, "").normalize("NFC");
    for (let i = 0; i < noAccents.length; i++) {
        let phonemes;
        let digraphPair = charToPhoneme.find(pair => pair[0] == noAccents[i].normalize("NFD").replace("\u0308", "").normalize("NFC") + noAccents[i + 1]);
        if (digraphPair) {
            phonemes = digraphPair[1];
            i++;
        } else {
            let noAccents = wordArg.normalize("NFD").replaceAll("\u0301", "").replaceAll("\u0302", "\u0304").replaceAll("\u0308", "").normalize("NFC");
            phonemes = charToPhoneme.find(pair => pair[0] == noAccents[i])[1];
        }
        phonemes.split(",").forEach(phoneme => word.insert(phoneme, word.length));

        let accent = wordArg.normalize("NFD").replaceAll("\u0304", "").replaceAll("\u0308", "")[i + 1];
        if (accent == "\u0301" && word.atIdx(-1).value.length == 1)
            word.atIdx(-1).pitch = "high";
        else if (accent == "\u0301")
            word.atIdx(-1).pitch = "rising";
        else if (accent == "\u0302")
            word.atIdx(-1).pitch = "falling";
    }

    if (word.some(segment => segment.type == "consonant" && segment.pitch))
        throw new Error("Accented consonant");
    if (wordArg[0].match(/[\u0301\u0302]/))
        throw new Error("Uncombined accent");
    if (word.vowels.length > 1 && !wordArg.normalize("NFD").match(/[\u0301\u0302]/g))
        throw "At least one vowel must be accented in multi-syllabic words";
    if (wordArg.normalize("NFD").match(/[\u0301\u0302]/g)?.length > 1)
        throw "Only one accent per word";

    //Allophones
    word.replace("n", "ŋ", "_k/kʰ/g");
    word.replace("g", "ŋ", "_m");
    word.replace("s", "z", "_m/n/b/d/g");
    word.replace("r", "r̥", "_r̥");

    word.forEach(segment => {
        if (segment.value == "k" && segment.relIdx(1).match("b", "d", "g")) {
            segment.value = "g";
            segment.voiced = true;
        }

        if (segment.value == "yi̯") {
            segment.value = "yː";
            segment.diphthong = true;
        }
    });

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);
        if ((segment.value.endsWith("i̯") || segment.value.endsWith("u̯")) && segment.relIdx(1).type == "vowel") {
            word.insert(segment.value.slice(-2), segment.idx + 1);
            i++;
        }
    }

    addRow("AttGr", "Attic Ancient Greek", "400 BC", getSpelling_AttGr(), word);
}

function AttGr_to_ModGr() {
    word = outcomes.AttGr.duplicate();

    //Attic verb contraction (noun contraction also occurred, but less predictably)
    if (word.partOfSpeech == "verb")
        word.forEach(segment => {
            if (segment.type == "vowel" && segment.relIdx(1).type == "vowel" && segment.pitch == "high") {
                switch (segment.value) {
                    case "a":
                        switch (segment.relIdx(1).value) {
                            case "a":
                            case "aː":
                            case "e":
                            case "ɛː":
                                segment.value = "aː";
                                break;
                            case "ai̯":
                            case "i":
                                segment.value = "ai̯";
                                break;
                            case "aːi̯":
                            case "eː":
                            case "ɛːi̯":
                                segment.value = "aːi̯";
                                break;
                            case "o":
                            case "uː":
                            case "ɔː":
                                segment.value = "ɔː";
                                break;
                            case "oi̯":
                            case "ɔːi̯":
                                segment.value = "ɔːi̯";
                                break;
                        }
                        segment.pitch = "falling";
                        segment.relIdx(1).remove();
                        break;
                    case "e":
                        if (segment != word.vowels.atIdx(0) || segment.relIdx(1).match("e", "eː")) {
                            switch (segment.relIdx(1).value) {
                                case "a":
                                case "aː":
                                case "ɛː":
                                    segment.value = "ɛː";
                                    break;
                                case "ai̯":
                                case "ɛːi̯":
                                    segment.value = "ɛːi̯";
                                    break;
                                case "e":
                                case "eː":
                                case "i":
                                    segment.value = "eː";
                                    break;
                                case "o":
                                case "uː":
                                    segment.value = "uː";
                                    break;
                                case "oi̯":
                                    segment.value = "oi̯";
                                    break;
                                case "ɔː":
                                    segment.value = "ɔː";
                                    break;
                                case "ɔːi̯":
                                    segment.value = "ɔːi̯";
                                    break;
                                case "y":
                                    segment.value = "eu̯";
                                    break;
                            }
                            segment.pitch = "falling";
                            segment.relIdx(1).remove();
                        }
                        break;
                    case "o":
                        switch (segment.relIdx(1).value) {
                            case "a":
                            case "ɛː":
                            case "ɔː":
                                segment.value = "ɔː";
                                break;
                            case "e":
                            case "o":
                            case "uː":
                                segment.value = "uː";
                                break;
                            case "eː":
                            case "i":
                            case "oi̯":
                                segment.value = "oi̯";
                                break;
                            case "ɛːi̯":
                            case "ɔːi̯":
                                segment.value = "ɔːi̯";
                                break;
                        }
                        segment.pitch = "falling";
                        segment.relIdx(1).remove();
                        break;
                }
            }
        });
    word.forEach(segment => segment.AttGrValue = segment.value);
    word.ancientSpelling = getSpelling_AttGr();

    word.remove("i̯/u̯");

    word.replace("ŋ", "g", "_m");

    word.replace("aːi̯", "aː");
    word.replace("ɛːi̯", "ɛː");
    word.replace("ɔːi̯", "ɔː");

    word.forEach(segment => {
        if (segment.value.endsWith("u̯")) {
            segment.value = segment.value.slice(0, -2);
            word.insert("β", segment.idx + 1);
        }
    });

    word.replace("ɛː", "eː");
    word.replace("ɔː", "oː");

    word.replace("ai̯", "ɛː");
    word.replace("oi̯", "yː");

    word.replace("eː", "iː");
    word.replace("ɛː", "eː");

    word.forEach(segment => {
        if (segment.value.includes("ː"))
            segment.value = segment.value[0] + segment.value.slice(2);
    });

    word.remove("h");
    word.replace("r̥", "r");

    word.replace("k", "c", "_e/i/y");
    word.replace("kʰ", "cʰ", "_e/i/y");
    word.replace("g", "ɟ", "_e/i/y");
    word.replace("k", "c", "_c/cʰ");
    word.replace("g", "ɟ", "_ɟ");
    word.replace("ŋ", "ɲ", "_c/cʰ/ɟ");

    //Spirantization
    word.remove("d", "z_");
    word.replace("pʰ", "ɸ");
    word.replace("tʰ", "θ");
    word.replace("cʰ", "ç");
    word.replace("kʰ", "x");
    word.forEach(segment => {
        switch (segment.value) {
            case "b":
                if (segment.relIdx(-1).value != "m")
                    segment.value = "β";
                break;
            case "d":
                if (segment.relIdx(-1).value != "n")
                    segment.value = "ð";
                break;
            case "ɟ":
                if (segment.relIdx(-1).value != "ɲ")
                    segment.value = "ʝ";
                break;
            case "g":
                if (segment.relIdx(-1).value != "ŋ")
                    segment.value = "ɣ";
                break;
        }
    });


    word.forEach(segment => {
        if (segment.pitch) {
            segment.stressed = true;
            if (segment.relIdx(-1).type == "consonant")
                segment.relIdx(-1).stressed = true;
            if (segment.relIdx(-2).match("p", "t", "k", "ɸ", "θ", "x", "β", "ð", "ɣ") && segment.relIdx(-1).match("l", "r", "n"))
                segment.relIdx(-2).stressed = true;
            segment.ancientPitch = segment.pitch;
            delete segment.pitch;
        }
    });
    word.forEach(segment => {
        if (word.vowels.atIdx(0).stressed && segment.idx < word.vowels.atIdx(0).idx)
            segment.stressed = true;
    });

    word.replace("β", "ɸ", "_p/t/c/k/ɸ/θ/ç/x/s/#");

    addRow("KoiGr", "Koine Greek", "AD 400", getSpelling_KoiGr(), word);


    word.replace("p", "b", "m_");
    word.replace("t", "d", "n_");
    word.replace("c", "ɟ", "ɲ_");
    word.replace("k", "g", "ŋ_");
    word.replace("b", "p", "_t/s");
    word.replace("d", "t", "_s");
    word.replace("g", "k", "_t/s");

    word.replace("ɸ", "f");
    word.replace("β", "v");

    //Degemination
    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);
        if (segment.type == "consonant" && segment.value == segment.relIdx(-1).value) {
            segment.relIdx(-1).remove();
            segment.degeminated = true;
            i--;
        }
    }

    word.forEach(segment => {
        if (segment.value == "ɣ" && segment.relIdx(1).value == "v") {
            let temp = segment.relIdx(1);
            word[segment.idx + 1] = segment;
            word[segment.idx] = temp;
        }
    });
    word.replace("ɣ", "ʝ", "_e/i/y");

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);
        if (segment.type == "vowel" && segment.value == segment.relIdx(-1).value) {
            if (segment.stressed)
                segment.relIdx(-1).stressed = true;
            segment.remove();
            i--;
        }
    }
    word.remove("i", "y_");

    //Synizesis of front vowels
    word.forEach(segment => {
        if (word.partOfSpeech == "noun" && segment.KoiGrValue == "i" && segment.relIdx(1).value == "o" && segment.relIdx(1) == word.vowels.atIdx(-1)) {
            segment.relIdx(1).value = "i";
            if (segment.stressed)
                segment.relIdx(1).stressed = true;
            segment.remove();
        }

        if (segment.match("e", "i", "y") && segment.relIdx(1).type == "vowel" && !segment.ctxMatch("C,r_")) {
            segment.value = "j";
            segment.type = "consonant";
            if (segment.stressed)
                segment.relIdx(1).stressed = true;
            if (segment.relIdx(1).stressed)
                segment.stressed = true;
        }
    });
    word.remove("j", "j_");
    word.remove("j", "_i");

    word.replace("p", "f", "_t/k");
    word.replace("t", "θ", "_p/k");
    word.replace("k", "x", "_p/t");
    word.replace("f", "p", "_s");
    word.replace("θ", "t", "_s");
    word.replace("x", "k", "_s");
    word.replace("f", "p", "θ/x_");
    word.replace("θ", "t", "f/s/x_");
    word.replace("ç", "c", "f/θ/s_");
    word.replace("x", "k", "f/θ/s_");
    word.replace("f", "p", "m_t/k");
    word.replace("x", "k", "ŋ_p/t");

    word.remove("m", "_f");
    word.remove("n", "_θ/s");
    word.remove("ɲ", "_ç");
    word.remove("ŋ", "_x");

    word.remove("n", "_#");

    word.replace("v", "m", "_n");
    word.remove("v", "_m");

    //Syllabification
    if (word.vowels.length > 1) {
        let nonLiquidClusters = ["ft", "xt", "vð", "ɣð", "vʝ", "vɣ", "tm", "ðm", "pn", "kn", "θn", "xn", "ɣn", "mn"];
        if (word.stressedVowel.relIdx(-1).type == "consonant") {
            word.stressedVowel.relIdx(-1).stressed = true;
            if (word.stressedVowel.relIdx(-2).match("s", "z"))
                word.stressedVowel.relIdx(-2).stressed = true;
        }
        if (word.stressedVowel.relIdx(-2).type == "consonant" && word.stressedVowel.relIdx(-1).value == "j") {
            word.stressedVowel.relIdx(-2).stressed = true;
            if (word.stressedVowel.relIdx(-3).match("s", "z"))
                word.stressedVowel.relIdx(-3).stressed = true;
        }
        if (word.stressedVowel.relIdx(-2).match("p", "t", "k", "b", "d", "g", "f", "θ", "x", "v", "ð", "ɣ") && word.stressedVowel.relIdx(-1).match("l", "r")) {
            word.stressedVowel.relIdx(-2).stressed = true;
            if (word.stressedVowel.relIdx(-3).value == "s")
                word.stressedVowel.relIdx(-3).stressed = true;
        }
        if (word.stressedVowel.relIdx(-3).match("p", "t", "k", "b", "d", "g", "f", "θ", "x", "v", "ð", "ɣ") && word.stressedVowel.relIdx(-2).value == "l" && word.stressedVowel.relIdx(-1).value == "j") {
            word.stressedVowel.relIdx(-3).stressed = true;
            word.stressedVowel.relIdx(-2).stressed = true;
            if (word.stressedVowel.relIdx(-4).value == "s")
                word.stressedVowel.relIdx(-4).stressed = true;
        }
        if (nonLiquidClusters.includes(word.stressedVowel.relIdx(-2).value + word.stressedVowel.relIdx(-1).value))
            word.stressedVowel.relIdx(-2).stressed = true;
        if (nonLiquidClusters.includes(word.stressedVowel.relIdx(-3).value + word.stressedVowel.relIdx(-2).value) && word.stressedVowel.relIdx(-1).value == "j") {
            word.stressedVowel.relIdx(-3).stressed = true;
            word.stressedVowel.relIdx(-2).stressed = true;
        }
    }
    word.forEach(segment => {
        if (word.vowels.atIdx(0).stressed && segment.idx < word.vowels.atIdx(0).idx)
            segment.stressed = true;
    });

    addRow("ByzGr", "Byzantine Greek", "900", getSpelling_ByzGr(), word, true);


    word.replace("y", "i");
    word.remove("j", "_i");

    if (word.partOfSpeech == "verb" && word.atIdx(0).value == "e" && !word.atIdx(0).stressed && word.vowels.length > 1 && !word.atIdx(0).ctxMatch("_l/r,C"))
        word.atIdx(0).remove();
    word.forEach(segment => {
        if (word.vowels.atIdx(0).stressed && segment.idx < word.vowels.atIdx(0).idx)
            segment.stressed = true;
    });

    word.replace("l", "r", "_θ");

    let earlyModernWord = word.duplicate();

    word.replace("b", "ᵐb", "m_");
    word.replace("d", "ⁿd", "n_");
    word.replace("ɟ", "ᶮɟ", "ɲ_");
    word.replace("g", "ᵑg", "ŋ_");
    word.remove("m", "_ᵐb");
    word.remove("n", "_ⁿd");
    word.remove("ɲ", "_ᶮɟ");
    word.remove("ŋ", "_ᵑg");

    word.replace("ᵐb", "b", "#/C_");
    word.replace("ⁿd", "d", "#/C_");
    word.replace("ᶮɟ", "ɟ", "#/C_");
    word.replace("ᵑg", "g", "#/C_");

    word.remove("j", "c/ɟ/ç/ʝ_");
    word.replace("j", "ɲ", "m_");
    word.replaceSeq("n,j", "ɲ");
    word.replaceSeq("l,j", "ʎ");
    word.replace("j", "ʝ");
    word.replace("ʝ", "ç", "p/t/f/θ/s_");

    word.replace("a", "ɐ");

    word.replace("r", "ɾ", "#/V_V");

    word.replaceSeq("t,s", "t͡s");

    addRow("ModGr", "Modern Greek", "", getSpelling_ModGr(earlyModernWord), word);
}

function getSpelling_AttGr() {
    let str = "";

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);

        switch (segment.value) {
            case "a":
            case "aː":
                str += "α";
                break;
            case "ɛː":
                str += "η";
                break;
            case "e":
                str += "ε";
                break;
            case "i":
            case "iː":
                str += "ι";
                break;
            case "ɔː":
                str += "ω";
                break;
            case "o":
                str += "ο";
                break;
            case "y":
            case "yː":
                if (segment.diphthong)
                    str += "υι";
                else
                    str += "υ";
                break;
            case "ai̯":
            case "aːi̯":
            case "ai̯ː":
            case "aːi̯ː":
                str += "αι";
                break;
            case "au̯":
            case "aːu̯":
            case "au̯ː":
            case "aːu̯ː":
                str += "αυ";
                break;
            case "ɛːi̯":
            case "ɛːi̯ː":
                str += "ηι";
                break;
            case "ɛːu̯":
            case "ɛːu̯ː":
                str += "ηυ";
                break;
            case "eː":
                str += "ει";
                break;
            case "eu̯":
            case "eu̯ː":
                str += "ευ";
                break;
            case "ɔːi̯":
            case "ɔːi̯ː":
                str += "ωι";
                break;
            case "oi̯":
            case "oi̯ː":
                str += "οι";
                break;
            case "uː":
                str += "ου";
                break;
            case "b":
                str += "β";
                break;
            case "g":
            case "ŋ":
                if (segment.voiced || (segment.value == "g" && segment.relIdx(1).value == "g"))
                    str += "κ";
                else
                    str += "γ";
                break;
            case "d":
                str += "δ";
                break;
            case "tʰ":
                str += "θ";
                break;
            case "k":
                if (segment.relIdx(1).value == "s") {
                    str += "ξ";
                    i++;
                } else {
                    str += "κ";
                }
                break;
            case "l":
                str += "λ";
                break;
            case "m":
                str += "μ";
                break;
            case "n":
                str += "ν";
                break;
            case "p":
                if (segment.relIdx(1).value == "s") {
                    str += "ψ";
                    i++;
                } else {
                    str += "π";
                }
                break;
            case "r":
            case "r̥":
                str += "ρ";
                break;
            case "s":
            case "z":
                if (segment.relIdx(1).value == "d") {
                    str += "ζ";
                    i++;
                } else if (segment.negIdx == -1) {
                    str += "ς";
                } else {
                    str += "σ";
                }
                break;
            case "t":
                str += "τ";
                break;
            case "pʰ":
                str += "φ";
                break;
            case "kʰ":
                str += "χ";
                break;
        }
    }

    return str;
}

function getSpelling_KoiGr() {
    let str = word.ancientSpelling;

    //Convert to Latin script for the font
    let greekToLatin = {
        α: "a",
        β: "b",
        γ: "g",
        δ: "d",
        ε: "e",
        ζ: "z",
        η: "h",
        θ: "q",
        ι: "i",
        κ: "k",
        λ: "l",
        μ: "m",
        ν: "n",
        ξ: "c",
        ο: "o",
        π: "p",
        ρ: "r",
        σ: "s",
        ς: "s",
        τ: "t",
        υ: "u",
        φ: "f",
        χ: "x",
        ψ: "y",
        ω: "w"
    };
    if (!modernTypography)
        for (let char in greekToLatin)
            str = str.replaceAll(char, `<span class="greekChar">${greekToLatin[char]}</span>`);

    return str;
}

function getSpelling_ByzGr() {
    let str = "";

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);

        switch (segment.value) {
            case "a":
                str += "α";
                break;
            case "e":
                if (segment.AttGrValue.startsWith("e"))
                    str += "ε";
                else
                    str += "αι";
                break;
            case "i":
            case "j":
                switch (segment.AttGrValue) {
                    case "ɛː":
                    case "ɛːi̯":
                    case "ɛːu̯":
                        str += "η";
                        break;
                    case "eː":
                        str += "ει";
                        break;
                    case "y":
                    case "yː":
                        str += "υ";
                        //Dieresis
                        if (segment.relIdx(-1).type == "vowel")
                            str += "\u0308";
                        if (segment.diphthong)
                            str += "ι";
                        break;
                    case "oi̯":
                        str += "οι";
                        break;
                    default:
                        str += "ι";
                        //Dieresis
                        if (segment.relIdx(-1).type == "vowel")
                            str += "\u0308";
                        break;
                }
                break;
            case "o":
                if (segment.AttGrValue == "o")
                    str += "ο";
                else
                    str += "ω";
                break;
            case "u":
                str += "ου";
                break;
            case "y":
                if (segment.AttGrValue == "oi̯") {
                    str += "οι";
                } else {
                    str += "υ";
                    //Dieresis
                    if (segment.relIdx(-1).type == "vowel")
                        str += "\u0308";
                    if (segment.diphthong)
                        str += "ι";
                }
                break;
            case "v":
                if (segment.relIdx(-1).AttGrValue?.endsWith("u̯"))
                    str += "υ";
                else
                    str += "β";
                if (segment.degeminated && segment.idx != 0)
                    str += "β";
                break;
            case "ɣ":
            case "ŋ":
            case "ʝ":
            case "ɲ":
                str += "γ";
                break;
            case "g":
            case "ɟ":
                if (segment.AttGrValue == "g")
                    str += "γ";
                else
                    str += "κ";
                break;
            case "ð":
                if (segment.degeminated && segment.idx != 0)
                    str += "δδ";
                else
                    str += "δ";
                break;
            case "z":
                if (segment.relIdx(1).type == "consonant" && segment.relIdx(1).value != "j")
                    str += "σ";
                else
                    str += "ζ";
                break;
            case "θ":
                str += "θ";
                break;
            case "k":
            case "c":
                if (segment.relIdx(1).value == "s") {
                    str += "ξ";
                    i++;
                } else if (segment.degeminated && segment.idx != 0) {
                    str += "κκ";
                } else {
                    str += "κ";
                }
                break;
            case "l":
                if (segment.degeminated && segment.idx != 0)
                    str += "λλ";
                else
                    str += "λ";
                break;
            case "m":
                if (segment.degeminated && segment.idx != 0)
                    str += "μμ";
                else
                    str += "μ";
                break;
            case "n":
                if (segment.degeminated && segment.idx != 0)
                    str += "νν";
                else
                    str += "ν";
                break;
            case "p":
            case "b":
                if (segment.relIdx(1).value == "s") {
                    str += "ψ";
                    i++;
                } else if (segment.degeminated && segment.idx != 0) {
                    str += "ππ";
                } else {
                    str += "π";
                }
                break;
            case "r":
                if (segment.degeminated && segment.idx != 0)
                    str += "ρρ";
                else
                    str += "ρ";
                break;
            case "s":
                if (segment.negIdx == -1)
                    str += "ς";
                else if (segment.degeminated && segment.idx != 0)
                    str += "σσ";
                else
                    str += "σ";
                break;
            case "t":
            case "d":
                if (segment.degeminated && segment.idx != 0)
                    str += "ττ";
                else
                    str += "τ";
                break;
            case "f":
                if (segment.relIdx(-1).AttGrValue?.endsWith("u̯"))
                    str += "υ";
                else
                    str += "φ";
                break;
            case "x":
            case "ç":
                str += "χ";
                break;
        }

        if (segment.type == "vowel" || segment.value == "j") {
            //Breathings
            if (segment.idx == 0 && wordArg.startsWith("h"))
                str += "\u0314";
            else if (segment.idx == 0)
                str += "\u0313";
            //Accents
            if (segment.type == "vowel" && segment.stressed)
                if (segment.ancientPitch == "falling")
                    str += "\u0342";
                else
                    str += "\u0301";
        }
    }

    return str.normalize("NFC");
}

function getSpelling_ModGr(earlyModernWord) {
    let word = earlyModernWord;
    let str = "";

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);

        switch (segment.value) {
            case "a":
                str += "α";
                break;
            case "e":
                if (segment.AttGrValue.startsWith("e"))
                    str += "ε";
                else
                    str += "αι";
                break;
            case "i":
            case "j":
                if (segment.value == "j" && segment.idx == 0)
                    str += "γ";
                switch (segment.AttGrValue) {
                    case "ɛː":
                    case "ɛːi̯":
                    case "ɛːu̯":
                        str += "η";
                        break;
                    case "y":
                    case "yː":
                        str += "υ";
                        //Dieresis
                        if (str.at(-2)?.match(/[αεηο]/))
                            str += "\u0308";
                        if (segment.diphthong)
                            str += "ι";
                        break;
                    case "eː":
                        str += "ει";
                        break;
                    case "oi̯":
                        str += "οι";
                        break;
                    default:
                        str += "ι";
                        //Dieresis
                        if (str.at(-2)?.match(/[αεο]/))
                            str += "\u0308";
                        break;
                }
                break;
            case "o":
                if (segment.AttGrValue == "o")
                    str += "ο";
                else
                    str += "ω";
                break;
            case "u":
                str += "ου";
                break;
            case "v":
                if (segment.relIdx(-1).AttGrValue?.endsWith("u̯"))
                    str += "υ";
                else
                    str += "β";
                if (segment.degeminated && segment.idx != 0)
                    str += "β";
                break;
            case "ɣ":
            case "ŋ":
            case "ʝ":
            case "ɲ":
                if (!segment.ctxMatch("C_j"))
                    str += "γ";
                break;
            case "g":
            case "ɟ":
                if (segment.AttGrValue == "g")
                    str += "γ";
                else
                    str += "κ";
                break;
            case "ð":
                if (segment.degeminated && segment.idx != 0)
                    str += "δδ";
                else
                    str += "δ";
                break;
            case "z":
                if (segment.relIdx(1).type == "consonant" && segment.relIdx(1).value != "j")
                    str += "σ";
                else
                    str += "ζ";
                break;
            case "θ":
                str += "θ";
                break;
            case "k":
            case "c":
                if (segment.relIdx(1).value == "s") {
                    str += "ξ";
                    i++;
                } else if (segment.degeminated && segment.idx != 0) {
                    str += "κκ";
                } else {
                    str += "κ";
                }
                break;
            case "l":
                if (segment.degeminated && segment.idx != 0)
                    str += "λλ";
                else
                    str += "λ";
                break;
            case "m":
                if (segment.degeminated && segment.idx != 0)
                    str += "μμ";
                else
                    str += "μ";
                break;
            case "n":
                if (segment.degeminated && segment.idx != 0)
                    str += "νν";
                else
                    str += "ν";
                break;
            case "p":
            case "b":
                if (segment.relIdx(1).value == "s") {
                    str += "ψ";
                    i++;
                } else if (segment.degeminated && segment.idx != 0) {
                    str += "ππ";
                } else {
                    str += "π";
                }
                break;
            case "r":
                if (segment.degeminated && segment.idx != 0)
                    str += "ρρ";
                else
                    str += "ρ";
                break;
            case "s":
                if (segment.negIdx == -1)
                    str += "ς";
                else if (segment.degeminated && segment.idx != 0)
                    str += "σσ";
                else
                    str += "σ";
                break;
            case "t":
            case "d":
                if (segment.degeminated && segment.idx != 0)
                    str += "ττ";
                else
                    str += "τ";
                break;
            case "f":
                if (segment.relIdx(-1).AttGrValue?.endsWith("u̯"))
                    str += "υ";
                else
                    str += "φ";
                break;
            case "x":
            case "ç":
                str += "χ";
                break;
        }

        if (segment.type == "vowel" && segment.stressed && word.vowels.length > 1)
            str += "\u0301";
    }

    return str.normalize("NFC");
}