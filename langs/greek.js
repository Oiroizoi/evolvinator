function getIPA_AttGr() {
    let charToPhoneme = {
        "a": "a",
        "ā": "aː",
        "ai": "aj",
        "āi": "aːj",
        "au": "aw",
        "āu": "aːw",
        "b": "b",
        "ch": "kʰ",
        "d": "d",
        "e": "e",
        "ē": "ɛː",
        "ei": "eː",
        "ēi": "ɛːj",
        "eu": "ew",
        "ēu": "ɛːw",
        "g": "g",
        "h": "h",
        "i": "i",
        "ī": "iː",
        "k": "k",
        "l": "l",
        "m": "m",
        "n": "n",
        "o": "o",
        "ō": "ɔː",
        "oi": "oj",
        "ōi": "ɔːj",
        "ou": "uː",
        "p": "p",
        "ph": "pʰ",
        "r": "r",
        "rh": "r̥",
        "s": "s",
        "t": "t",
        "th": "tʰ",
        "x": "k,s",
        "y": "y",
        "ȳ": "yː",
        "yi": "yj",
        "z": "z,d",
    };

    let noAccents = wordArg.normalize("NFD").replaceAll("\u0301", "").replaceAll(/(?<=[iu])\u0302/g, "").replaceAll(/(?<=\u0304)\u0308/g, "").replaceAll(/\u0308(?=\u0302)/g, "").normalize("NFC");
    for (let i = 0; i < noAccents.length; i++) {
        let phonemes;
        let digraphPair = charToPhoneme[noAccents[i].normalize("NFD").replace("\u0308", "").normalize("NFC") + noAccents[i + 1]];
        if (digraphPair) {
            phonemes = digraphPair;
            i++;
        } else {
            let noAccents = wordArg.normalize("NFD").replaceAll("\u0301", "").replaceAll("\u0302", "\u0304").replaceAll("\u0308", "").normalize("NFC");
            phonemes = charToPhoneme[noAccents[i]];
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

    if (word.some(segment => segment.match("C") && segment.pitch))
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

    word.replace("k", "g[voiced]", "_b/d/g");
    word.replace("yj", "yː[diphthong]");

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);
        if ((segment.value.endsWith("j") || segment.value.endsWith("w")) && segment.ctxMatch("_V")) {
            word.insert(segment.value.slice(-1), segment.idx + 1);
            i++;
        }
    }

    addRow("AttGr", "Attic Ancient Greek", "400 BC", getSpellingFromArg_AttGr(), word);
}

function AttGr_to_ModGr() {
    word = outcomes.AttGr.duplicate();

    //Attic verb contraction (noun contraction also occurred, but less predictably)
    if (word.partOfSpeech == "verb")
        word.forEach(segment => {
            if (segment.match("V[pitch=high]", "_V")) {
                switch (segment.value) {
                    case "a":
                        switch (segment.relIdx(1).value) {
                            case "a":
                            case "aː":
                            case "e":
                            case "ɛː":
                                segment.value = "aː";
                                break;
                            case "aj":
                            case "i":
                                segment.value = "aj";
                                break;
                            case "aːj":
                            case "eː":
                            case "ɛːj":
                                segment.value = "aːj";
                                break;
                            case "o":
                            case "uː":
                            case "ɔː":
                                segment.value = "ɔː";
                                break;
                            case "oj":
                            case "ɔːj":
                                segment.value = "ɔːj";
                                break;
                        }
                        segment.pitch = "falling";
                        segment.relIdx(1).remove();
                        break;
                    case "e":
                        if (segment != word.vowels.atIdx(0) || segment.ctxMatch("_e/eː")) {
                            switch (segment.relIdx(1).value) {
                                case "a":
                                case "aː":
                                case "ɛː":
                                    segment.value = "ɛː";
                                    break;
                                case "aj":
                                case "ɛːj":
                                    segment.value = "ɛːj";
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
                                case "oj":
                                    segment.value = "oj";
                                    break;
                                case "ɔː":
                                    segment.value = "ɔː";
                                    break;
                                case "ɔːj":
                                    segment.value = "ɔːj";
                                    break;
                                case "y":
                                    segment.value = "ew";
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
                            case "oj":
                                segment.value = "oj";
                                break;
                            case "ɛːj":
                            case "ɔːj":
                                segment.value = "ɔːj";
                                break;
                        }
                        segment.pitch = "falling";
                        segment.relIdx(1).remove();
                        break;
                }
            }
        });
    word.forEach(segment => segment.AttGrValue = segment.value);
    word.ancientSpelling = getSpellingFromArg_AttGr();

    word.remove("j/w", "V_V");

    word.replace("ŋ", "g", "_m");

    word.replace("aːj ɛːj ɔːj", "aː ɛː ɔː");

    word.forEach(segment => {
        if (segment.value.endsWith("w")) {
            segment.value = segment.value.slice(0, -1);
            word.insert("β", segment.idx + 1);
        }
    });

    word.replace("ɛː ɔː", "eː oː");

    word.replace("aj", "ɛː");
    word.replace("oj", "yː");

    word.replace("eː ɛː", "iː eː");

    word.forEach(segment => {
        if (segment.value.includes("ː"))
            segment.value = segment.value[0] + segment.value.slice(2);
    });

    word.remove("h");
    word.replace("r̥", "r");

    word.replace("k kʰ g", "c cʰ ɟ", "_e/i/y");
    word.replace("k", "c", "_c/cʰ");
    word.replace("g", "ɟ", "_ɟ");
    word.replace("ŋ", "ɲ", "_c/cʰ/ɟ");

    //Spirantization
    word.remove("d", "z_");
    word.replace("pʰ tʰ cʰ kʰ", "ɸ θ ç x");
    word.replace("b", "β", "[!=m]_");
    word.replace("d", "ð", "[!=n]_");
    word.replace("ɟ", "ʝ", "[!=ɲ]_");
    word.replace("g", "ɣ", "[!=ŋ]_");

    //Convert pitch accent to stress
    word.forEach(segment => {
        if (segment.pitch) {
            segment.stressed = true;
            segment.ancientPitch = segment.pitch;
            delete segment.pitch;
        }
    });
    word.replace("C", "[stressed]", "_V[stressed]");
    word.replace("p/t/k/ɸ/θ/x/β/ð/ɣ", "[stressed]", "_{l/r/n}[stressed]");
    word.replace("C", "[stressed]", "", segment => word.vowels.atIdx(0).stressed && segment.idx < word.vowels.atIdx(0).idx);

    word.replace("β", "ɸ", "_p/t/c/k/ɸ/θ/ç/x/s/#");

    addRow("KoiGr", "Koine Greek", "AD 400", getSpelling_KoiGr(), word);


    word.replace("p", "b", "m_");
    word.replace("t", "d", "n_");
    word.replace("c", "ɟ", "ɲ_");
    word.replace("k", "g", "ŋ_");
    word.replace("b g", "p k", "_t/s");
    word.replace("d", "t", "_s");

    word.replace("ɸ β", "f v");

    //Degemination
    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);
        if (segment.match("C") && segment.value == segment.relIdx(-1).value) {
            segment.relIdx(-1).remove();
            segment.degeminated = true;
            i--;
        }
    }

    word.forEach(segment => {
        if (segment.match("ɣ", "_v")) {
            let temp = segment.relIdx(1);
            word[segment.idx + 1] = segment;
            word[segment.idx] = temp;
        }
    });
    word.replace("ɣ", "ʝ", "_e/i/y");

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);
        if (segment.match("V") && segment.value == segment.relIdx(-1).value) {
            if (segment.stressed)
                segment.relIdx(-1).stressed = true;
            segment.remove();
            i--;
        }
    }
    word.remove("i", "y_");

    //Synizesis of front vowels
    word.forEach(segment => {
        if (word.partOfSpeech == "noun" && segment.KoiGrValue == "i" && segment.ctxMatch("_o") && segment.relIdx(1) == word.vowels.atIdx(-1)) {
            segment.relIdx(1).value = "i";
            if (segment.stressed)
                segment.relIdx(1).stressed = true;
            segment.remove();
        }

        if (segment.match("e/i/y", "_V") && !segment.ctxMatch("C,r_")) {
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
    word.replace("f θ x", "p t k", "_s");
    word.replace("f", "p", "θ/x_");
    word.replace("θ", "t", "f/s/x_");
    word.replace("ç x", "c k", "f/θ/s_");
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
    word.replace("C", "[stressed]", "_V[stressed]");
    word.replace("C", "[stressed]", "_j[stressed]");
    word.replace("p/t/k/b/d/g/f/θ/x/v/ð/ɣ", "[stressed]", "_{l/r}[stressed]");
    word.replace("s/z", "[stressed]", "_C[stressed]");
    word.replace("f/x", "[stressed]", "_t[stressed]");
    word.replace("v/ɣ", "[stressed]", "_ð[stressed]");
    word.replace("v", "[stressed]", "_{ʝ/ɣ}[stressed]");
    word.replace("t/ð", "[stressed]", "_m[stressed]");
    word.replace("p/k/θ/x/ɣ/m", "[stressed]", "_n[stressed]");
    word.replace("C", "[stressed]", "", segment => word.vowels.atIdx(0).stressed && segment.idx < word.vowels.atIdx(0).idx);

    addRow("ByzGr", "Byzantine Greek", "900", getSpelling_ByzGr(), word, true);


    word.replace("y", "i");
    word.remove("j", "_i");

    if (word.partOfSpeech == "verb")
        word.remove("e[!stressed]", "#_", segment => word.vowels.length > 1 && !segment.ctxMatch("_l/r,C"));
    word.replace("C", "[stressed]", "", segment => word.vowels.atIdx(0).stressed && segment.idx < word.vowels.atIdx(0).idx);

    word.replace("l", "r", "_θ");

    let earlyModernWord = word.duplicate();

    word.replaceSeq("m,b", ",ᵐb");
    word.replaceSeq("n,d", ",ⁿd");
    word.replaceSeq("ɲ,ɟ", ",ᶮɟ");
    word.replaceSeq("ŋ,g", ",ᵑg");

    word.replace("ᵐb ⁿd ᶮɟ ᵑg", "b d ɟ g", "#/C_");

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

function getSpellingFromArg_AttGr() {
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
            case "aj":
            case "aːj":
            case "ajː":
            case "aːjː":
                str += "αι";
                break;
            case "aw":
            case "aːw":
            case "awː":
            case "aːwː":
                str += "αυ";
                break;
            case "ɛːj":
            case "ɛːjː":
                str += "ηι";
                break;
            case "ɛːw":
            case "ɛːwː":
                str += "ηυ";
                break;
            case "eː":
                str += "ει";
                break;
            case "ew":
            case "ewː":
                str += "ευ";
                break;
            case "ɔːj":
            case "ɔːjː":
                str += "ωι";
                break;
            case "oj":
            case "ojː":
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
                if (segment.voiced || (segment.match("g", "_g")))
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
                if (segment.ctxMatch("_s")) {
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
                if (segment.ctxMatch("_s")) {
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
                if (segment.ctxMatch("_d")) {
                    str += "ζ";
                    i++;
                } else if (segment.ctxMatch("_#")) {
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

    //Convert to Latin characters for the font
    let greekToLatin = {
        "α": "a",
        "β": "b",
        "γ": "g",
        "δ": "d",
        "ε": "e",
        "ζ": "z",
        "η": "h",
        "θ": "q",
        "ι": "i",
        "κ": "k",
        "λ": "l",
        "μ": "m",
        "ν": "n",
        "ξ": "c",
        "ο": "o",
        "π": "p",
        "ρ": "r",
        "σ": "s",
        "ς": "s",
        "τ": "t",
        "υ": "u",
        "φ": "f",
        "χ": "x",
        "ψ": "y",
        "ω": "w"
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
                    case "ɛːj":
                    case "ɛːw":
                        str += "η";
                        break;
                    case "eː":
                        str += "ει";
                        break;
                    case "y":
                    case "yː":
                        str += "υ";
                        //Dieresis
                        if (segment.ctxMatch("V_"))
                            str += "\u0308";
                        if (segment.diphthong)
                            str += "ι";
                        break;
                    case "oj":
                        str += "οι";
                        break;
                    default:
                        str += "ι";
                        //Dieresis
                        if (segment.ctxMatch("V_"))
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
                if (segment.AttGrValue == "oj") {
                    str += "οι";
                } else {
                    str += "υ";
                    //Dieresis
                    if (segment.ctxMatch("V_"))
                        str += "\u0308";
                    if (segment.diphthong)
                        str += "ι";
                }
                break;
            case "v":
                if (segment.relIdx(-1).AttGrValue?.endsWith("w"))
                    str += "υ";
                else
                    str += "β";
                if (segment.degeminated && !segment.ctxMatch("#_"))
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
                if (segment.degeminated && !segment.ctxMatch("#_"))
                    str += "δδ";
                else
                    str += "δ";
                break;
            case "z":
                if (segment.ctxMatch("_C[!=j]"))
                    str += "σ";
                else
                    str += "ζ";
                break;
            case "θ":
                str += "θ";
                break;
            case "k":
            case "c":
                if (segment.ctxMatch("_s")) {
                    str += "ξ";
                    i++;
                } else if (segment.degeminated && !segment.ctxMatch("#_")) {
                    str += "κκ";
                } else {
                    str += "κ";
                }
                break;
            case "l":
                if (segment.degeminated && !segment.ctxMatch("#_"))
                    str += "λλ";
                else
                    str += "λ";
                break;
            case "m":
                if (segment.degeminated && !segment.ctxMatch("#_"))
                    str += "μμ";
                else
                    str += "μ";
                break;
            case "n":
                if (segment.degeminated && !segment.ctxMatch("#_"))
                    str += "νν";
                else
                    str += "ν";
                break;
            case "p":
            case "b":
                if (segment.ctxMatch("_s")) {
                    str += "ψ";
                    i++;
                } else if (segment.degeminated && !segment.ctxMatch("#_")) {
                    str += "ππ";
                } else {
                    str += "π";
                }
                break;
            case "r":
                if (segment.degeminated && !segment.ctxMatch("#_"))
                    str += "ρρ";
                else
                    str += "ρ";
                break;
            case "s":
                if (segment.ctxMatch("_#"))
                    str += "ς";
                else if (segment.degeminated && !segment.ctxMatch("#_"))
                    str += "σσ";
                else
                    str += "σ";
                break;
            case "t":
            case "d":
                if (segment.degeminated && !segment.ctxMatch("#_"))
                    str += "ττ";
                else
                    str += "τ";
                break;
            case "f":
                if (segment.relIdx(-1).AttGrValue?.endsWith("w"))
                    str += "υ";
                else
                    str += "φ";
                break;
            case "x":
            case "ç":
                str += "χ";
                break;
        }

        if (segment.match("V/j")) {
            //Breathings
            if (segment.ctxMatch("#_") && wordArg.startsWith("h"))
                str += "\u0314";
            else if (segment.ctxMatch("#_"))
                str += "\u0313";
            //Accents
            if (segment.match("V") && segment.stressed)
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
                if (segment.match("j") && segment.ctxMatch("#_"))
                    str += "γ";
                switch (segment.AttGrValue) {
                    case "ɛː":
                    case "ɛːj":
                    case "ɛːw":
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
                    case "oj":
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
                if (segment.relIdx(-1).AttGrValue?.endsWith("w"))
                    str += "υ";
                else
                    str += "β";
                if (segment.degeminated && !segment.ctxMatch("#_"))
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
                if (segment.degeminated && !segment.ctxMatch("#_"))
                    str += "δδ";
                else
                    str += "δ";
                break;
            case "z":
                if (segment.ctxMatch("_C") && segment.relIdx(1).value != "j")
                    str += "σ";
                else
                    str += "ζ";
                break;
            case "θ":
                str += "θ";
                break;
            case "k":
            case "c":
                if (segment.ctxMatch("_s")) {
                    str += "ξ";
                    i++;
                } else if (segment.degeminated && !segment.ctxMatch("#_")) {
                    str += "κκ";
                } else {
                    str += "κ";
                }
                break;
            case "l":
                if (segment.degeminated && !segment.ctxMatch("#_"))
                    str += "λλ";
                else
                    str += "λ";
                break;
            case "m":
                if (segment.degeminated && !segment.ctxMatch("#_"))
                    str += "μμ";
                else
                    str += "μ";
                break;
            case "n":
                if (segment.degeminated && !segment.ctxMatch("#_"))
                    str += "νν";
                else
                    str += "ν";
                break;
            case "p":
            case "b":
                if (segment.ctxMatch("_s")) {
                    str += "ψ";
                    i++;
                } else if (segment.degeminated && !segment.ctxMatch("#_")) {
                    str += "ππ";
                } else {
                    str += "π";
                }
                break;
            case "r":
                if (segment.degeminated && !segment.ctxMatch("#_"))
                    str += "ρρ";
                else
                    str += "ρ";
                break;
            case "s":
                if (segment.ctxMatch("_#"))
                    str += "ς";
                else if (segment.degeminated && !segment.ctxMatch("#_"))
                    str += "σσ";
                else
                    str += "σ";
                break;
            case "t":
            case "d":
                if (segment.degeminated && !segment.ctxMatch("#_"))
                    str += "ττ";
                else
                    str += "τ";
                break;
            case "f":
                if (segment.relIdx(-1).AttGrValue?.endsWith("w"))
                    str += "υ";
                else
                    str += "φ";
                break;
            case "x":
            case "ç":
                str += "χ";
                break;
        }

        if (segment.match("V") && segment.stressed && word.vowels.length > 1)
            str += "\u0301";
    }

    return str.normalize("NFC");
}