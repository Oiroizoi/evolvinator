function getIPA_OE() {
    let charToPhoneme = [
        ["a", "ɑ"],
        ["ā", "ɑː"],
        ["b", "b"],
        ["c", "k"],
        ["ċ", "t͡ʃ"],
        ["ċċ", "t,t͡ʃ"],
        ["cg", "ɣ,ɣ"],
        ["ċġ", "j,j"],
        ["d", "d"],
        ["e", "e"],
        ["ē", "eː"],
        ["ea", "æɑ̯"],
        ["ēa", "æːɑ̯"],
        ["eo", "eo̯"],
        ["ēo", "eːo̯"],
        ["f", "f"],
        ["g", "ɣ"],
        ["ġ", "j"],
        ["h", "h"],
        ["i", "i"],
        ["ī", "iː"],
        ["ie", "iy̯"],
        ["īe", "iːy̯"],
        ["l", "l"],
        ["m", "m"],
        ["n", "n"],
        ["o", "o"],
        ["ō", "oː"],
        ["p", "p"],
        ["r", "r"],
        ["s", "s"],
        ["sċ", "ʃ,ʃ"],
        ["t", "t"],
        ["u", "u"],
        ["ū", "uː"],
        ["w", "w"],
        ["x", "k,s"],
        ["y", "y"],
        ["ȳ", "yː"],
        ["þ", "θ"],
        ["æ", "æ"],
        ["ǣ", "æː"],
    ];

    for (let i = 0; i < wordArg.length; i++) {
        let phonemes;
        let digraphPair = charToPhoneme.find(pair => pair[0] == wordArg[i] + wordArg[i + 1]);
        if (digraphPair) {
            phonemes = digraphPair[1];
            i++;
        } else {
            phonemes = charToPhoneme.find(pair => pair[0] == wordArg[i])[1];
        }
        phonemes.split(",").forEach(phoneme => word.insert(phoneme, word.length));
    }

    let stressedVowel = word.vowels.atIdx(stressArg - 1);
    stressedVowel.stressed = true;
    let onsetClusters = ["bl", "br", "dr", "dw", "fl", "fn", "fr", "ɣl", "ɣn", "ɣr", "hl", "hn", "hr", "hw", "kl", "kn", "kr", "kw", "pl", "pr",
        "sk", "skr", "ʃr", "sl", "sm", "sn", "sp", "spl", "spr", "st", "str", "sw", "tr", "tw", "wl", "wr", "θr", "θw"];
    if (stressedVowel.relIdx(-1).type == "consonant")
        stressedVowel.relIdx(-1).stressed = true;
    if (onsetClusters.includes(stressedVowel.relIdx(-2).value + stressedVowel.relIdx(-1).value))
        stressedVowel.relIdx(-2).stressed = true;
    if (onsetClusters.includes(stressedVowel.relIdx(-3).value + stressedVowel.relIdx(-2).value + stressedVowel.relIdx(-1).value))
        stressedVowel.relIdx(-3).stressed = true;
    if (stressedVowel.relIdx(1).type == "consonant" && stressedVowel.relIdx(2).type != "vowel")
        stressedVowel.relIdx(1).stressed = true;
    word.forEach(segment => {
        if (word.vowels.atIdx(0).stressed && segment.idx < word.vowels.atIdx(0).idx)
            segment.stressed = true;
    });

    //Allophones
    word.replace("ɣ", "g", "n/#_");
    word.replaceSeq("ɣ,ɣ", "g,g");
    word.forEach(segment => {
        if (segment.value == "ɣ" && segment.stressed && segment.idx < stressedVowel.idx)
            segment.value = "g";
    });
    word.replace("n", "ŋ", "_k/g");
    word.replace("l", "ɫ", "_C");
    word.replace("l", "ɫ", "ɫ_");
    word.replace("r", "rˠ", "_C");
    word.replace("r", "rˠ", "rˠ_");
    word.replaceSeq("h,l", "l̥");
    word.replaceSeq("h,n", "n̥");
    word.replaceSeq("h,r", "r̥");
    word.replaceSeq("h,w", "xʷ");
    word.replace("h", "x", "ɑ/ɑː/o/oː/u/uː/æɑ̯/æːɑ̯/eo̯/eːo̯/x_");
    word.replace("h", "x", "ɫ/rˠ_C/#");
    word.replace("h", "ç", "æ/æː/e/eː/i/iː/y/yː/iy̯/iːy̯/ç_");
    word.replace("x/ç", "h", "_V[stressed]");
    word.replace("ɑ[stressed]", "ɒ", "_m/n/ŋ");
    word.replaceSeq("j,j", "d,d͡ʒ");
    word.forEach(segment => {
        if (segment.value == "j" && segment.relIdx(-1).value == "n" && segment.idx > stressedVowel.idx)
            segment.value = "d͡ʒ";
    });
    word.forEach(segment => {
        let voicedConsonants = "b/d/ɣ/j/l/ɫ/m/n/r/rˠ/w";
        if (segment.ctxMatch(`{V/${voicedConsonants}}[stressed]_V/${voicedConsonants}`) || (segment.ctxMatch(`V_${voicedConsonants}`) && !segment.stressed)) {
            switch (segment.value) {
                case "f":
                    segment.value = "v";
                    break;
                case "θ":
                    segment.value = "ð";
                    break;
                case "s":
                    segment.value = "z";
                    break;
            }
        }
    });
    word.forEach(segment => {
        if (
            segment.type == "consonant" && segment.relIdx(1).value
            && (segment.value == segment.relIdx(1).value[0] || (segment.match("r", "rˠ") && segment.relIdx(1).match("r", "rˠ")))
            && (segment.relIdx(-1).type != "vowel" || segment.relIdx(2).type != "vowel")
            && !onsetClusters.includes(segment.relIdx(1).value + segment.relIdx(2).value)
        )
            segment.remove();
    });
    word.forEach(segment => {
        if (segment.value == "ʃ" && segment.relIdx(1).value == "ʃ" && !segment.ctxMatch("V_C,V"))
            segment.remove();
    });
    word.remove("ʃ", "_ʃ,V[stressed]");

    addRow("OE", "Late Old English", "900", getSpelling_OE(), word);
}

function OE_to_EME(variety) {
    word = outcomes.OE.duplicate();

    word.replace("θ", "s", "_s");
    word.forEach(segment => {
        if (segment.type == "consonant" && segment.value == segment.relIdx(1).value && !segment.ctxMatch("V_C,V"))
            segment.remove();
    });

    word.replace("ɣ", "x", "_p/t/k/t͡ʃ/f/θ/s/ʃ/#");

    word.replace("x", "k", "_s");
    word.replace("ç", "k", "_s");

    word.forEach(segment => {
        if (segment.value == "n" && segment.relIdx(1).value == "d" && !segment.relIdx(1).stressed && segment.relIdx(2).stressed) {
            segment.relIdx(1).remove();
            if (segment.relIdx(-1).value == "ɑ")
                segment.relIdx(-1).value = "o";
        }
    });

    word.replace("d", "t", "_θ/s");

    word.remove("h[!stressed]", "C_");

    word.forEach(segment => {
        if (segment.type == "vowel" && segment.idx > word.stressedVowel.idx) {
            switch (word.partOfSpeech) {
                case "conjVerb":
                    if (segment.relIdx(1).value == "θ")
                        segment.inSuffix = true;
                case "pastPtcp":
                    if (segment.relIdx(1).value == "d")
                        segment.inSuffix = true;
                case "inf":
                    if (segment.relIdx(1).value == "n" && segment.negIdx == -2)
                        segment.inSuffix = true;
                default:
                    if (segment.relIdx(1).value == "s" && segment.negIdx == -2)
                        segment.inSuffix = true;
            }
        }
    });

    word.replace("iy̯", "y");
    word.replace("iːy̯", "yː");

    word.replace("l̥", "l");
    word.replace("n̥", "n");
    word.replace("r̥", "r");

    if (variety != "northumbrian")
        word.forEach(segment => {
            if (segment.value == "n" && segment.relIdx(1).match("r", "rˠ") && !segment.relIdx(1).stressed)
                word.insert("d", segment.idx + 1);

            if (segment.value == "m" && segment.relIdx(1).match("l", "ɫ", "r", "rˠ") && !segment.relIdx(1).stressed)
                word.insert("b", segment.idx + 1);
        });

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);

        if (
            segment.match("m", "n", "l", "ɫ", "r", "rˠ") && segment.ctxMatch("#/C_C/#")
            && (!segment.relIdx(-1).match("ɫ", "rˠ", "j", "w") || (segment.relIdx(-1).value == "ɫ" && segment.value == "r"))
            && !(segment.relIdx(-1).value == "m" && segment.value == "n")
        ) {
            word.insert("ə", segment.idx);
            i--;
        }

        if (segment.value == "j" && segment.ctxMatch("#/C_C/#")) {
            segment.value = "iː";
            segment.type = "vowel";
        }
    }

    if (variety != "northumbrian")
        word.replace("e/eo̯/o/y", "u", "w_r/rˠ");

    word.replace("æɑ̯", "æ");
    word.replace("æːɑ̯", "æː");
    word.replace("eo̯", "ø");
    word.replace("eːo̯", "øː");

    word.replace("ø", "e");
    word.replace("øː", "eː");
    word.replace("y", "i");
    word.replace("yː", "iː");

    word.replace("ɒ", "ɑ");

    //Homorganic lengthening
    word.forEach(segment => {
        if (variety == "northumbrian") {
            if (segment.type == "vowel" && segment.stressed && !segment.value.includes("ː")) {
                if (
                    (segment.match("ɑ", "æ", "e", "i") && segment.ctxMatch("_ɫ,d"))
                    || (segment.value == "ɑ" && segment.ctxMatch("_m,b"))
                    || (segment.match("æ", "e", "o") && segment.ctxMatch("_rˠ,d"))
                ) {
                    segment.value = segment.value.slice(0, 1) + "ː" + segment.value.slice(1);
                    segment.lengthened = true;
                }
            }
        } else {
            let lengtheningClusters = ["ɫd", "mb", "nd", "ŋg", "rˠd", "rˠn", "rˠz", "rˠð"];

            if (segment.type == "vowel" && segment.stressed && !segment.value.includes("ː") && lengtheningClusters.includes(segment.relIdx(1).value + segment.relIdx(2).value)) {
                segment.value = segment.value.slice(0, 1) + "ː" + segment.value.slice(1);
                segment.lengthened = true;
            }
        }
    });

    word.forEach(segment => {
        if (segment.value[1] == "ː" && segment.ctxMatch("_C,C") && (segment.relIdx(3).type == "consonant" || segment.idx < word.vowels.atIdx(-2).idx))
            segment.value = segment.value.slice(0, 1) + segment.value.slice(2);
    });

    word.forEach(segment => {
        if (segment.value == "ɑː" && !segment.stressed && segment.relIdx(1).stressed)
            segment.value = "ɑ";

        if (segment.match("o", "ɑ") && segment.relIdx(1).match("n", "m", "ŋ") && segment.relIdx(2).stressed) {
            segment.value = "ɑ";
            if (segment.relIdx(2).type == "consonant")
                segment.relIdx(1).remove();
        }
    });

    word.replace("æ", "a");
    word.replace("ɑ", "a");

    word.replace("æː", "ɛː");
    if (variety == "northumbrian")
        word.replace("ɑː", "aː");
    else
        word.replace("ɑː", "ɔː");

    word.replace("ç", "x", "a/x_");
    word.replace("x", "ç", "ɛː/e/eː/i/iː/ç_");

    word.forEach(segment => {
        if (segment.value == "ɣ" && segment.relIdx(-1).match("ɛː", "e", "eː", "i", "iː") && !segment.relIdx(1).stressed)
            segment.value = "ʝ";
    });

    //Vowel reduction
    word.forEach(segment => {
        if (
            segment.type == "vowel" && !segment.stressed && !segment.value.endsWith("ː")
            && ((segment.idx > word.stressedVowel.idx && !segment.relIdx(1).match("j", "w", "ɣ", "ʝ", "x", "ç"))
                || (segment.value == "e" && (segment.relIdx(1).stressed || segment.relIdx(1).value == "rˠ" || segment.relIdx(1).type == "vowel")))
            && !(segment.value == "i" && segment.relIdx(1).value == "p")
        )
            segment.value = "ə";
    });
    word.forEach(segment => {
        if (segment.value == "ə" && segment.relIdx(1).match("ʃ", "ç", "ŋ") && !segment.relIdx(1).stressed)
            segment.value = "i";
        if (segment.value == "e" && segment.relIdx(1).match("j", "ɣ", "ç") && !segment.stressed)
            segment.value = "i";
        if (segment.value == "u" && segment.relIdx(1).match("w", "ɣ", "x") && !segment.stressed)
            segment.value = "o";
    });
    word.remove("ə", "ə_");
    word.forEach(segment => {
        if (segment.value == "ə" && segment.ctxMatch("#/C,j_") && (segment.idx < word.stressedVowel.idx || segment.relIdx(-2).value != "rˠ") && segment != word.vowels.atIdx(-1)) {
            segment.value = "i";
            segment.relIdx(-1).remove();
            if (segment.relIdx(-1).type == "vowel")
                segment.remove();
        }

        if (segment.value == "ə" && segment.relIdx(1).value == "n" && ["conjVerb", "pastPtcp", "inf"].includes(word.partOfSpeech) && segment.idx > word.stressedVowel.idx)
            segment.inSuffix = true;
    });

    word.vowels.forEach(segment => {
        if (segment.relIdx(1).value == "j") {
            switch (segment.value) {
                case "ɛː":
                case "eː":
                    if (variety != "northumbrian" || segment.relIdx(2).type != "vowel")
                        segment.value = "e";
                    break;
                case "i":
                case "iː":
                    segment.value = "iː";
                    segment.relIdx(1).remove();
                    break;
            }
        }
    });

    addRow("EME", (variety == "northumbrian") ? "Early Northumbrian Middle English" : "Early Middle English", "1200", getSpelling_EME(), word, true);
}

function EME_to_LME(variety) {
    word = outcomes.EME.duplicate();

    if (variety == "scots") {
        word.replace("a", "e", "_s/ʃ");

        word.replace("e", "a", "_ɫ,ɣ");
    }

    word.forEach(segment => {
        if (segment.value == "oː" && segment.relIdx(1).value == "w" && (segment.stressed || !segment.relIdx(1).stressed))
            segment.value = "o";
    });

    word.replace("ʝ", "j");
    word.replace("ɣ", "w");

    word.forEach(segment => {
        if (segment.match("i", "iː") && segment.relIdx(1).value == "j" && !segment.relIdx(2).stressed) {
            segment.value = "iː";
            segment.relIdx(1).remove();
        }
    });

    //Delete short unstressed vowel between short vowel + liquid and consonant
    word.forEach(segment => {
        if (
            segment.type == "vowel" && segment.ctxMatch("V,l/r_C[!=j/w]") && !segment.stressed && !segment.inSuffix && !segment.value.includes("ː")
            && !segment.relIdx(-2).value.includes("ː") && !segment.ctxMatch("_m/n/ŋ,p/t/t͡ʃ/k/b/d/d͡ʒ/g")
            && !segment.ctxMatch("l_l/ɫ") && !segment.ctxMatch("l/r_r/rˠ")
        ) {
            if (segment.relIdx(-1).value == "l")
                segment.relIdx(-1).value = "ɫ";
            else if (segment.relIdx(-1).value == "r")
                segment.relIdx(-1).value = "rˠ";
            segment.remove();
        }
    });

    word.forEach(segment => {
        if (segment.type == "vowel" && segment.idx > word.stressedVowel.idx) {
            switch (word.partOfSpeech) {
                case "conjVerb":
                    if (segment.relIdx(1).value == "θ")
                        segment.inSuffix = true;
                case "pastPtcp":
                    if (segment.relIdx(1).value == "d")
                        segment.inSuffix = true;
                case "inf":
                    if (segment.relIdx(1).value == "n" && segment.negIdx == -2)
                        segment.inSuffix = true;
                default:
                    if (segment.relIdx(1).value == "s" && segment == word.vowels.atIdx(-1))
                        segment.inSuffix = true;
            }
        }
    });

    word.replace("xʷ", "w", "V_");

    //Drop schwa between vowel and consonant, except in inflectional suffixes
    word.remove("ə[!inSuffix]", "V_C[!stressed]");
    word.remove("ə[!inSuffix]", "V,j/w_C[!stressed]");

    word.forEach(segment => {
        if (segment.match("r", "rˠ") && segment.ctxMatch("V,w_") && !segment.stressed)
            word.insert("ə", segment.idx);
    });

    word.remove("x", "C_C");

    word.replace("θ", "t", "f/s/ʃ/ç/x_");

    word.replace("t", "s", "_s");

    //Loss of [v] before most consonants
    word.forEach(segment => {
        if (segment.value == "v" && segment.ctxMatch("_C[!=l/r/n/j]"))
            segment.value = segment.relIdx(1).value[0];
    });
    word.forEach(segment => {
        if (segment.type == "consonant" && segment.value == segment.relIdx(1).value && !segment.ctxMatch("V_C,V"))
            segment.remove();
    });
    word.remove("w", "w_");

    word.replace("oː", "o", "_x,C");

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);

        if (segment.relIdx(1).value == "ç" && segment.type == "vowel" && !segment.match("i", "iː") && variety != "scots") {
            word.insert("j", segment.idx + 1);
            i++;
        }

        if (segment.relIdx(1).value == "x" && segment.type == "vowel" && !segment.match("u", "uː") && (variety != "scots" || segment.match("a", "aː"))) {
            word.insert("w", segment.idx + 1);
            i++;
        }
    }

    //Middle English diphthong development
    word.forEach(segment => {
        if (segment.type == "vowel" && segment.value != "ə" && (segment.stressed || !segment.relIdx(1).stressed)) {
            if (segment.relIdx(1).value == "j") {
                switch (segment.value) {
                    case "a":
                    case "aː":
                        segment.value = "ai̯";
                        break;
                    case "ɛː":
                    case "e":
                        segment.value = "ɛi̯";
                        break;
                    case "eː":
                        if (variety == "scots")
                            return;
                        segment.value = "ei̯";
                        break;
                    case "i":
                    case "iː":
                        segment.value = "iː";
                        break;
                    case "ɔː":
                    case "o":
                    case "oː":
                        segment.value = "ɔi̯";
                        break;
                    case "u":
                    case "uː":
                        segment.value = "ui̯";
                        break;
                }
                segment.relIdx(1).remove();
            } else if (segment.relIdx(1).value == "w") {
                switch (segment.value) {
                    case "a":
                    case "aː":
                        segment.value = "au̯";
                        break;
                    case "ɛː":
                    case "e":
                        segment.value = "ɛu̯";
                        break;
                    case "eː":
                        segment.value = "eu̯";
                        break;
                    case "i":
                    case "iː":
                        segment.value = "iu̯";
                        break;
                    case "ɔː":
                    case "o":
                        segment.value = "ɔu̯";
                        break;
                    case "oː":
                        if (variety == "scots")
                            return;
                        segment.value = "ou̯";
                        break;
                    case "u":
                    case "uː":
                        segment.value = "uː";
                        break;
                }
                segment.relIdx(1).remove();
            }
        }
    });

    word.replace("ei̯", "iː");
    word.replace("ou̯", "uː");
    word.replace("eu̯", "iu̯");

    if (variety == "scots")
        word.replace("eː", "i", "_ç");

    //Elision of intermediate schwa
    word.forEach(segment => {
        if (
            segment.value == "ə" && segment.ctxMatch("C_C") && (segment.relIdx(-2).type == "vowel" || segment.relIdx(-2).value == segment.relIdx(-1).value)
            && (segment.relIdx(2).type == "vowel" || segment.relIdx(2).value == "j" || segment.relIdx(2).value == segment.relIdx(1).value)
            && !(segment.relIdx(2).value == "ə" && segment.relIdx(2).negIdx == -1 && segment.relIdx(1).value != "s")
            && !(segment.relIdx(2).match("ə", "i") && segment.relIdx(2).inSuffix)
            && !segment.relIdx(-1).match("xʷ") && !segment.ctxMatch("t͡ʃ_s")
        ) {
            if (segment.relIdx(-1).value == segment.relIdx(-2).value)
                segment.relIdx(-1).remove();
            if (segment.relIdx(1).value == segment.relIdx(2).value)
                segment.relIdx(1).remove();
            segment.remove();
        }
    });
    word.forEach(segment => {
        if (segment.value == "m" && segment.relIdx(1).match("t", "s"))
            word.insert("p", segment.idx + 1);

        if (segment.value == "m" && segment.relIdx(1).match("ɫ", "l", "r", "rˠ") && variety != "scots")
            word.insert("b", segment.idx + 1);

        if (segment.match("ɫ", "n") && segment.relIdx(1).match("r", "rˠ") && variety != "scots")
            word.insert("d", segment.idx + 1);

        if (segment.value == "m" && segment.ctxMatch("V/rˠ/m_ə,l/ɫ") && variety != "scots") {
            word.insert("b", segment.idx + 1);
            if (segment.relIdx(-1).value == "m")
                segment.relIdx(-1).remove();
        }
    });
    word.replace("z", "s", "_p/t/k/t͡ʃ/f/θ/s");
    word.replace("s", "z", "b/d/g/v/ð_");

    word.forEach(segment => {
        if (
            segment.value == "b" && segment.ctxMatch("m_[!=l/r]")
            && (segment.relIdx(1).type != "vowel" || segment.relIdx(1).inSuffix || segment.negIdx == -2)
        ) {
            segment.relIdx(-1).droppedB = true;
            segment.remove();
        }

        if (
            segment.value == "n" && segment.relIdx(-1).value == "m"
            && (segment.relIdx(1).type != "vowel" || segment.relIdx(1).inSuffix || segment.negIdx == -2)
        ) {
            segment.value = "m";
            segment.droppedN = true;
            if (segment.relIdx(1).type != "vowel")
                segment.relIdx(-1).remove();
        }
    });

    //Trisyllabic laxing and open syllable lengthening
    word.forEach(segment => {
        if (segment.type == "vowel" && segment.idx < word.vowels.atIdx(-2).idx && !segment.ctxMatch("_V/j/w")) {
            if (segment.value.endsWith("ː"))
                segment.value = segment.value[0];
            word.replace("ɛ", "e");
            word.replace("ɔ", "o");
        } else if (segment.type == "vowel" && segment.stressed && (segment.relIdx(2).type == "vowel" || segment.relIdx(1).type == "vowel" || segment.negIdx == -1)) {
            switch (segment.value) {
                case "a":
                    segment.value = "aː";
                    break;
                case "e":
                    segment.value = "ɛː";
                    break;
                case "o":
                    segment.value = "ɔː";
                    break;
            }
        }
    });

    //Vowel shortening before most clusters
    word.forEach(segment => {
        if (
            segment.ctxMatch("_C[!=j/w],C") && !segment.ctxMatch("_s,t") && !segment.ctxMatch("_ɫ/n,d")
            && !(segment.value == "oː" && segment.ctxMatch("_rˠ,d")) && !(variety == "scots" && segment.relIdx(1).value == "rˠ")
        ) {
            switch (segment.value) {
                case "aː":
                    segment.value = "a";
                    break;
                case "ɛː":
                case "eː":
                    segment.value = "e";
                    break;
                case "iː":
                    segment.value = "i";
                    break;
                case "ɔː":
                case "oː":
                    segment.value = "o";
                    break;
                case "uː":
                    segment.value = "u";
                    break;
            }
        }

        //Homorganic lengthening reversed in some cases
        if (segment.lengthened) {
            if (segment.ctxMatch("_n,d")) {
                if (segment.match("ɛː", "eː"))
                    segment.value = "e";

                if (segment.match("ɔː", "oː"))
                    segment.value = "o";
            }

            if (segment.ctxMatch("_ɫ,d")) {
                if (segment.match("ɔː", "oː"))
                    segment.value = "o";

                if (segment.value == "uː")
                    segment.value = "u";
            }

            if (segment.ctxMatch("_m,b") && segment.value == "uː")
                segment.value = "u";
        }
    });

    //Early Scots vowel developments
    if (variety == "scots") {
        word.replace("oː", "øː");

        word.forEach(segment => {
            if (segment.stressed || !segment.relIdx(1).stressed) {
                if (segment.value == "eː" && segment.relIdx(1).value == "j") {
                    segment.value = "ei̯";
                    segment.relIdx(1).remove();
                }

                if (segment.value == "øː" && segment.relIdx(1).value == "w") {
                    segment.value = "yu̯";
                    segment.relIdx(1).remove();
                }
            }
        });

        word.replace("ei̯", "eː");
        word.replace("yu̯", "iu̯");

        word.replace("a", "aː", "_rˠ,C");
        word.replace("aː", "a", "_rˠ,rˠ");
    }

    word.replace("d", "ð", "[!=d/n/ɫ]_ə,r/rˠ");

    word.replace("eː", "ɛː", "_r/rˠ");

    word.forEach(segment => {
        if (segment.value == "w" && segment.ctxMatch("s_o/ɔː/oː/ɔu̯/u/uː") && variety != "scots") {
            segment.relIdx(-1).droppedW = true;
            segment.remove();
        }
    });

    //Fricative voicing after unstressed vowels
    if (variety != "scots") {
        word.replace("f", "v", "V[!stressed]_V[!stressed]/#");
        word.replace("θ", "ð", "V[!stressed]_V[!stressed]/#");
        word.replace("s", "z", "V[!stressed]_V[!stressed]/#");
    }

    if (word.atIdx(-2).value == "ə" && word.atIdx(-1).match("z", "s"))
        word.sSuffix = true;

    //Degemination
    word.forEach(segment => {
        if (segment.type == "consonant" && segment.idx < word.length - 1 && (segment.value == segment.relIdx(1).value[0] || segment.value == segment.relIdx(1).value)) {
            segment.relIdx(1).degeminated = true;
            segment.remove();
        }
    });

    word.forEach(segment => {
        if (segment.value == "f" && segment.relIdx(1).value == "n" && (segment.idx == 0 || segment.stressed))
            segment.value = "s";
    });

    word.replace("ai̯", "æi̯");
    word.replace("ɛi̯", "æi̯");
    word.replace("au̯", "ɑu̯");
    word.replace("o", "ɔ");

    word.forEach(segment => {
        if (segment.type == "consonant" && segment.stressed && !segment.relIdx(1).stressed)
            segment.stressed = false;
    });

    if (word.atIdx(-1).value == "ə") {
        word.atIdx(-1).remove();
        word.droppedE = true;
    }
    word.remove("ə", "_V");
    if (word.stressedVowel.relIdx(-1).type == "consonant")
        word.stressedVowel.relIdx(-1).stressed = true;

    if (word.atIdx(-2).value == "iː" && word.atIdx(-1).value == "t͡ʃ" && !word.atIdx(-2).stressed) {
        word.atIdx(-1).remove();
        word.droppedE = false;
    }

    word.remove("w", "_l");

    word.forEach(segment => {
        if (segment.value == "iː" && !segment.stressed && segment.relIdx(1).match("r", "rˠ"))
            word.insert("ə", segment.idx + 1);
    });

    word.forEach(segment => {
        if (segment.value == "iː" && !segment.stressed && segment.negIdx != -1 && !segment.inSuffix)
            segment.value = "i";
    });

    word.replace("iː", "i", "_t͡ʃ");

    word.forEach(segment => {
        if (segment.match("m", "n", "l", "r") && segment.ctxMatch("C_C/#") && !(segment.relIdx(-1).match("ɫ", "rˠ") && segment.value != "r"))
            word.insert("ə", segment.idx);

        if (segment.value == "j" && segment.relIdx(1).type != "vowel") {
            if (segment.ctxMatch("_C,C/#"))
                segment.value = "i";
            else
                segment.value = "iː";
            segment.type = "vowel";
        }

        if (segment.match("w", "xʷ") && !segment.ctxMatch("_V/r")) {
            segment.value = "ɔu̯";
            segment.type = "vowel";
        }
    });
    if (word.atIdx(-1).value == "x" && word.atIdx(-2).type == "consonant" && variety != "scots") {
        word.atIdx(-1).value = "ɔu̯";
        word.atIdx(-1).type = "vowel";
    }
    word.remove("h", "_C/#");

    word.forEach(segment => {
        if (segment.value == "j" && segment.relIdx(-1).type == "consonant" && !segment.stressed) {
            segment.value = "i";
            segment.type = "vowel";
        }
    });

    word.replace("l", "ɫ", "_C/#");
    word.replace("r", "rˠ", "_C/#");
    word.replace("ɫ", "l", "_V");
    word.replace("rˠ", "r", "_V");

    if (variety == "scots") {
        if (word.toString().endsWith("ədəst")) {
            word.atIdx(-3).remove();
            word.atIdx(-2).remove();
            word.atIdx(-1).remove();
        }

        if (word.atIdx(-1).value == "d" && word.atIdx(-2).type == "vowel" && !word.atIdx(-2).stressed)
            word.atIdx(-1).value = "t";
        if (word.conjPastTense && word.vowels.atIdx(-1).relIdx(1).value == "d" && !word.vowels.atIdx(-1).stressed)
            word.vowels.atIdx(-1).relIdx(1).value = "t";

        if (word.partOfSpeech == "conjVerb" && !word.vowels.atIdx(-1).stressed) {
            if (word.atIdx(-1).value == "θ") {
                word.atIdx(-1).value = "s";
                word.sSuffix = true;
            }

            if (word.atIdx(-2).value == "s" && word.atIdx(-1).value == "t") {
                word.atIdx(-1).remove();
                word.sSuffix = true;
            }
        }

        word.forEach(segment => {
            if (segment.value == "ʃ" && !segment.stressed && !segment.prevVowel().stressed) {
                segment.value = "s";
                if (segment.ctxMatch("V[!stressed]_#"))
                    word.sSuffix = true;
            }
        });

        word.replace("i", "ɪ", "_C");

        word.replace("ə", "ɪ", "_{t/d/θ/ð/s/z/l/ɫ/n}[!stressed]");

        word.remove("ɪ[!stressed]", "#_C[stressed]/V");
        word[0].degeminated = false;

        //Loss of -en suffix
        if ((word.partOfSpeech == "inf" || word.partOfSpeech == "conjVerb") && word.atIdx(-2).value == "ɪ" && word.atIdx(-1).value == "n") {
            word.atIdx(-2).remove();
            word.atIdx(-1).remove();
            if (
                word.atIdx(-1).match("m", "n", "l", "r") && word.atIdx(-2).type != "vowel"
                && !(word.atIdx(-2).match("ɫ", "rˠ") && word.atIdx(-1).value != "r")
                && !(word.atIdx(-2).value == "m" && word.atIdx(-1).value == "n")
            )
                word.insert("ə", word.length - 1);

            if (word.atIdx(-1).value == "w") {
                word.atIdx(-1).value = "ɔu̯";
                word.atIdx(-1).type = "vowel";
            }

            word.droppedE = true;
        } else if (word.partOfSpeech == "inf" && word.atIdx(-1).value == "n" && word.atIdx(-2).value.length > 1) {
            word.atIdx(-1).remove();
            word.droppedE = true;
        }

        word.remove("b", "m_");
        word.remove("g", "ŋ_");

        word.replace("ŋ", "n", "_C[!=k/l/ɾ]");

        if (word.atIdx(-1).value == "ŋ" && !word.vowels.atIdx(-1).stressed) {
            word.atIdx(-1).value = "n";
            word.atIdx(-1).ing = true;
        }
    }

    if (variety == "scots")
        addRow("LME", "Early Scots", "1400", getSpelling_ESc(), word);
    else
        addRow("LME", "Late Middle English", "1400", getSpelling_LME(), word);
}

function LME_to_EModE(variety) {
    word = outcomes.LME.duplicate();

    //Drop y- prefix from verbs and nouns
    if (word.atIdx(0).value == "i" && !word.atIdx(0).stressed && (word.atIdx(1).stressed || word.atIdx(1).type == "vowel") && ["noun", "inf", "conjVerb", "pastPtcp"].includes(word.partOfSpeech))
        word.atIdx(0).remove();

    if (word.partOfSpeech == "conjVerb" && word.toString().endsWith("ənd") && variety != "scots") {
        word.atIdx(-3).value = "i";
        word.atIdx(-2).value = "ŋ";
        word.atIdx(-1).value = "g";
    }

    if (variety == "scots" && word.atIdx(-1).value == "d" && word.atIdx(-2).value == "n" && !word.vowels.atIdx(-1).stressed) {
        word.atIdx(-2).droppedD = true;
        word.atIdx(-1).remove();
    }

    word.replace("ɔ", "a", "_n,d");

    if (variety != "scots")
        word.replace("u", "ɔ", "_ɫ,t/d/n");

    word.replace("xʷ", "h", "_ɔː/oː/uː");

    word.replace("e", "i", "_n,d͡ʒ");

    word.replace("ð", "d", "_l");
    word.replace("ð", "d", "_ə,ɫ");

    word.replace("i", "iː", "_V[!inSuffix]");

    word.replace("e[!stressed]", "i");
    if (variety == "scots")
        word.replace("i", "ɪ", "_C");

    //Reduction of vowels in prefixes
    word.forEach(segment => {
        if (segment.type == "vowel" && !segment.stressed && segment.relIdx(1).stressed) {
            if (segment.relIdx(1).type == "vowel") {
                segment.relIdx(-1).stressed = true;
                if (segment == word.vowels.atIdx(0))
                    for (let i = segment.idx; i >= 0; i--)
                        word.atIdx(i).stressed = true;
                segment.remove();
            }
            else
                segment.value = "ə";
        }
    });

    if (variety == "scots")
        word.replace("ɔ", "a", "_m/p/b/f");

    word.replace("ɔu̯", "ɑu̯", "_x,t");

    //H-loss
    if (variety != "scots") {
        word.forEach(segment => {
            if (segment.match("ç", "x")) {
                if (segment.relIdx(-1).match("i", "u"))
                    segment.relIdx(-1).value += "ː";
                segment.relIdx(-1).droppedH = true;
                segment.remove();
            }
        });
    }

    //Loss of -en suffix
    if ((word.partOfSpeech == "inf" || word.partOfSpeech == "conjVerb") && word.atIdx(-2).value == "ə" && word.atIdx(-1).value == "n") {
        word.atIdx(-2).remove();
        word.atIdx(-1).remove();
        if (
            word.atIdx(-1).match("m", "n", "l", "r") && word.atIdx(-2).type != "vowel"
            && !(word.atIdx(-2).match("ɫ", "rˠ") && word.atIdx(-1).value != "r")
            && !(word.atIdx(-2).value == "m" && word.atIdx(-1).value == "n")
        )
            word.insert("ə", word.length - 1);

        if (word.atIdx(-1).value == "w") {
            word.atIdx(-1).value = "ɔu̯";
            word.atIdx(-1).type = "vowel";
        }

        word.droppedE = true;
    } else if (word.partOfSpeech == "inf" && word.atIdx(-1).value == "n" && word.atIdx(-2).value.length > 1) {
        word.atIdx(-1).remove();
        word.droppedE = true;
    }

    word.forEach(segment => {
        if (segment.value == "ə" && segment.ctxMatch("V_n,V/#") && segment.relIdx(-1).value.length > 1)
            segment.remove();
    });
    word.remove("{ə/ɪ}[!stressed]", "V,r_n,#");
    word.replace("r", "rˠ", "_#");
    word.replace("i", "iː", "_V/#");

    if (word.partOfSpeech == "conjVerb" && word.atIdx(-1).value == "ð" && word.atIdx(-2).type == "vowel" && !word.atIdx(-2).stressed) {
        word.thVerb = true;
        word.atIdx(-1).value = "z";
        word.sSuffix = true;
    }
    if (word.partOfSpeech == "conjVerb" && word.atIdx(-1).value == "θ" && word.atIdx(-2).type == "consonant") {
        word.thVerb = true;
        word.insert("ə", -1);
        word.atIdx(-1).value = "z";
        word.sSuffix = true;
    }

    if (variety == "scots" && word.sSuffix && word.atIdx(-1).value == "s")
        word.atIdx(-1).value = "z";

    //Loss of vowel in -es and -ed suffixes
    if (word.sSuffix && word.atIdx(-1).value == "z" && word.atIdx(-2).match("ə", "ɪ") && !word.atIdx(-2).stressed && !word.atIdx(-3).match("s", "z", "ʃ", "t͡ʃ", "d͡ʒ"))
        word.atIdx(-2).remove();
    if ((word.partOfSpeech == "conjVerb" || word.partOfSpeech == "pastPtcp") && word.atIdx(-1).match("d", "t") && word.atIdx(-2).type == "vowel" && !word.atIdx(-2).stressed) {
        word.pastTense = true;
        if (word.atIdx(-1).value == "d" && word.atIdx(-2).value == "ə" && !word.atIdx(-3).match("t", "d"))
            word.atIdx(-2).remove();
    }
    if (word.partOfSpeech == "pastPtcp" && word.atIdx(-1).match("d", "t") && word.atIdx(-2).type == "vowel")
        word.pastTense = true;
    if (word.partOfSpeech == "conjVerb" && word.toString().endsWith("dəst") && word.atIdx(-5).type == "vowel" && !word.atIdx(-5).stressed) {
        word.conjPastTense = true;
        if (word.atIdx(-5).value == "ə" && !word.atIdx(-6).match("t", "d"))
            word.atIdx(-5).remove();
    }
    if (word.partOfSpeech == "conjVerb" && word.toString().endsWith("dən") && word.atIdx(-4).type == "vowel" && !word.atIdx(-4).stressed) {
        word.conjPastTense = true;
        if (word.atIdx(-4).value == "ə" && !word.atIdx(-5).match("t", "d"))
            word.atIdx(-4).remove();
    }
    word.remove("h", "_C/#");
    word.replace("z", "s", "p/t/k/f/θ_");
    word.replace("d", "t", "p/k/t͡ʃ/f/θ/s/ʃ_");
    word.forEach(segment => {
        if (segment.match("m", "n", "l", "r") && segment.ctxMatch("C_C/#") && !segment.ctxMatch("m,n_") && !(segment.relIdx(-1).match("l", "ɫ", "r", "rˠ") && segment.value != "r"))
            word.insert("ə", segment.idx);
    });
    if (word.atIdx(-2).value == "j" && word.atIdx(-1).type == "consonant") {
        word.atIdx(-2).value = "iː";
        word.atIdx(-2).type = "vowel";
    }
    if (word.atIdx(-2).match("w", "xʷ") && word.atIdx(-1).type == "consonant") {
        word.atIdx(-2).value = "ɔu̯";
        word.atIdx(-2).type = "vowel";
    }
    word.replace("l", "ɫ", "_C/#");
    word.replace("r", "rˠ", "_C/#");
    word.replace("ɫ", "l", "_V");
    word.replace("rˠ", "r", "_V");

    word.sForm = word;

    if (word.conjPastTense && word.toString().endsWith("əst"))
        word.atIdx(-3).remove();

    word.remove("n", "ɫ_C/#");

    if (variety == "scots")
        word.remove("v", "ɫ/rˠ_");
    word.replace("ɫ", "l", "_V");

    word.replace("e", "a", "_rˠ");
    if (variety == "scots")
        word.replace("e", "a", "_r");

    if (variety == "scots")
        word.replace("e", "a", "w/xʷ_");

    word.EModEWord = word.duplicate();


    if (variety == "scots") {
        word.replace("r", "ɾ");
        word.replace("rˠ", "ɾ");
    } else {
        word.replace("rˠ", "ɹ̠");
    }

    //[ə] > [ɪ] frequently before coronal obstruents
    word.replace("ə", "ɪ", "_{t/d/θ/ð/s/z}[!stressed],C/#");

    //Vowel changes before /l/
    word.forEach(segment => {
        if (variety == "scots") {
            word.replace("aː", "ɑu̯", "_ɫ,d");

            if (segment.value == "ɫ" && segment.relIdx(-1).match("a", "ɔ", "u") && !segment.relIdx(1).match("j", "w")) {
                switch (segment.relIdx(-1).value) {
                    case "a":
                        segment.relIdx(-1).value = "ɑu̯";
                        break;
                    case "ɔ":
                        segment.relIdx(-1).value = "ɔu̯";
                        break;
                    case "u":
                        segment.relIdx(-1).value = "uː";
                        break;
                }
                segment.remove();
            }
        } else {
            if (segment.value == "ɫ" && segment.relIdx(-1).match("a", "ɔ")) {
                if (segment.relIdx(1).match("t", "d", "t͡ʃ", "d͡ʒ", "s", "z", "ʃ", "l", "r", "k") || segment.negIdx == -1) {
                    if (segment.relIdx(-1).value == "a")
                        segment.relIdx(-1).value = "ɑu̯";
                    else if (segment.relIdx(-1).value == "ɔ")
                        segment.relIdx(-1).value = "ɔu̯";

                    if (segment.relIdx(1).value == "k")
                        segment.remove();
                }
                else if (segment.relIdx(1).value == "f" || (segment.relIdx(-1).value == "a" && segment.relIdx(1).value == "v"))
                    segment.remove();
                else if (segment.relIdx(1).value == "m") {
                    if (segment.relIdx(-1).value == "a")
                        segment.relIdx(-1).value = "ɑː";
                    else if (segment.relIdx(-1).value == "ɔ")
                        segment.relIdx(-1).value = "ɔː";
                    segment.remove();
                }
            }
        }
    });

    if (variety == "scots")
        word.replace("a", "ɑu̯", "_n,d/d͡ʒ");

    word.replace("i", "ɪ");
    word.replace("u", "ʊ");

    //Great Vowel Shift
    word.replace("iː", "əi̯");
    word.replace("eː", "iː");
    word.replace("ɛː", "eː");
    if (variety != "scots") {
        word.replace("uː", "əu̯", "[!=j]_[!=m/p/b/f/v]");
        word.replace("oː", "uː");
    }
    word.replace("ɔː", "oː");
    word.replace("aː", "ɛː");
    if (variety == "scots")
        word.replace("ɛː", "aː", "w/xʷ_");

    word.replace("æi̯", "ɛi̯");
    word.replace("ɑu̯", "ɔː");
    word.replace("ɔu̯", "ou̯");
    word.replace("iu̯", "ɪu̯");
    word.replace("ɛu̯", "ɪu̯");
    word.replace("ɔi̯", "oi̯");
    if (variety != "scots")
        word.replace("ui̯", "oi̯");

    if (variety == "scots") {
        word.replace("ɔː", "ɑː");
        word.replace("aː", "ɑː");
    }

    if (variety != "scots")
        word.replace("ɔ", "ɒ");

    if (variety == "scots")
        word.remove("t", "p/k_");

    if (variety == "scots")
        addRow("EModE", "Middle Scots", "1600", getSpelling_MSc(word), word, true);
    else
        addRow("EModE", "Early Modern English", "1600", getSpelling_EModE(word), word, true);
}

function EModE_to_ModE(variety) {
    word = outcomes.EModE.duplicate();

    if (word.thVerb) {
        word.sSuffix = true;
        word.EModEWord.sSuffix = true;
        word.atIdx(-1).value = word.sForm.at(-1).value;
        word.EModEWord.atIdx(-1).value = word.sForm.at(-1).value;
        if (word.atIdx(-2).value == "ɪ" && word.sForm.at(-2).value != "ə") {
            word.atIdx(-2).remove();
            word.EModEWord.atIdx(-2).remove();
        }
        if (word.atIdx(-3).type == "consonant" && word.sForm.at(-3).value == "ə") {
            word.insert("ə", -2);
            word.EModEWord.insert("ə", -2);
        }
        if (word.atIdx(-2).value == "j" && word.sForm.at(-2).value == "iː") {
            word.atIdx(-2).value = "əi̯";
            word.atIdx(-2).type = "vowel";
            word.EModEWord.atIdx(-2).value = "iː";
            word.EModEWord.atIdx(-2).type = "vowel";
        }
        if (word.atIdx(-2).match("w", "xʷ") && word.sForm.at(-2).value == "ɔu̯") {
            word.atIdx(-2).value = "ou̯";
            word.atIdx(-2).type = "vowel";
            word.EModEWord.atIdx(-2).value = "ɔu̯";
            word.EModEWord.atIdx(-2).type = "vowel";
        }
    }

    word.replace("r", "ɹ̠");

    word.replace("e", "ɛ");

    if (variety != "scots") {
        word.replace("ɛi̯", "ɛː");
        word.replace("ou̯", "oː");
    }

    word.forEach(segment => {
        if (segment.value == "w" && segment.relIdx(1).match("ɹ̠", "ɾ")) {
            segment.relIdx(1).droppedW = true;
            segment.remove();
        }
    });

    if (word.atIdx(-1).value == "ð" && word.atIdx(-2).type == "vowel" && !word.atIdx(-2).stressed)
        word.atIdx(-1).value = "θ";

    word.forEach(segment => {
        if (segment.match("k", "g") && segment.relIdx(1).value == "n") {
            if (segment.relIdx(-1).type == "vowel") {
                segment.stressed = false;
                if (segment.value == "kʰ")
                    segment.value = "k";
            } else if (!segment.relIdx(-1).match("ŋ", "ɫ", "ɹ̠", "ɾ", "s") || segment.relIdx(1).stressed) {
                if (segment.relIdx(-1).value == "ŋ")
                    segment.relIdx(-1).value = "n";
                if (segment.value == "k")
                    segment.relIdx(1).droppedK = true;
                if (segment.value == "g")
                    segment.relIdx(1).droppedG = true;
                segment.remove();
            }
        }
    });

    //Meet-meat merger
    word.replace("eː", "iː");
    word.replace("ɛː", "eː");

    if (variety == "scots") {
        outcomes.ModE = word.duplicate();
        return;
    }

    word.forEach(segment => {
        if (segment.match("p", "t", "k") && (segment.stressed || segment.idx == 0) && segment.relIdx(-1).value != "s")
            segment.value += "ʰ";
    });

    //Foot-strut split
    word.forEach(segment => {
        if (segment.value == "ʊ" && !segment.ctxMatch("pʰ/b/f/w_ʃ/l/ɫ"))
            segment.value = "ʌ";
    });

    word.remove("g", "ŋ_C[!=l/ɹ̠/w]/#");

    word.replace("a", "ɒ", "w/xʷ_C[!=k/g/ŋ]");

    word.replace("ɒ", "ɒː", "_f/θ/s");

    word.replace("a", "ɑː", "_ɹ̠,C/#");
    word.replace("ɒ", "ɔː", "_ɹ̠,C/#");
    word.replace("ɪ/ʌ/ɛ", "əː", "_ɹ̠,C/#");

    word.replace("a", "æ");

    word.replace("uː", "ʊ", "_k");

    word.replace("uː", "oː", "_ɹ̠");

    word.forEach(segment => {
        if (segment.value == "ɪu̯") {
            segment.value = "uː";
            if (!segment.relIdx(-1).match("j", "t͡ʃ", "d͡ʒ", "ʃ", "ɹ̠", "w") && !segment.ctxMatch("pʰ/tʰ/kʰ/p/t/k/b/d/g,l_")) {
                word.insert("j", segment.idx);
                if (segment.stressed)
                    segment.relIdx(-1).stressed = true;
            }
        }
    });

    word.replace("h", "ç", "_j");

    word.replace("eː", "ɛə̯", "_ɹ̠");
    word.replace("iː", "ɪə̯", "_ɹ̠");
    word.replace("oː", "ɔə̯", "_ɹ̠");
    word.replace("uː", "ʊə̯", "_ɹ̠");
    word.forEach(segment => {
        if (segment.value == "ɹ̠" && segment.ctxMatch("əi̯/əu̯/oi̯_C/#"))
            word.insert("ə", segment.idx);
    });

    //"Happy" shortening & tensing
    word.forEach(segment => {
        if (segment.match("əi̯", "iː") && !segment.stressed && (segment.ctxMatch("_#/V") || ((word.sSuffix || word.pastTense) && segment.negIdx == -2)))
            segment.value = "i";
    });

    //Syllabic consonants
    word.forEach(segment => {
        if (segment.value == "ə" && segment.ctxMatch("_m/n/ɫ,C/#")) {
            segment.value = segment.relIdx(1).value + "̩";
            segment.relIdx(1).remove();
        }
    });

    word.remove("t", "f/s_n̩/ɫ̩");

    word.replace("eː", "eɪ̯");
    word.replace("oː", "oʊ̯");
    word.replace("əi̯", "aɪ̯");
    word.replace("əu̯", "aʊ̯");
    word.replace("oi̯", "ɔɪ̯");

    word.replace("xʷ", "w");

    word.replace("tʰ", "t̠ʰ", "_ɹ̠");
    word.replace("t", "t̠", "_ɹ̠");
    word.replace("d", "d̠", "_ɹ̠");

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);
        if (segment.match("t", "t͡ʃ") && segment.ctxMatch("V/n/ɫ/ɹ̠_n̩/C/#") && !segment.stressed) {
            word.insert("ʔ", segment.idx);
            i++;
        }
    }

    if (word.atIdx(0).type == "vowel") {
        word.insert("ʔ", 0);
        if (word.atIdx(1).stressed)
            word.atIdx(0).stressed = true;
    }

    word.modernSpelling = getSpelling_ModE(word.EModEWord);
    outcomes.ModE = word.duplicate();
}

function ModE_to_UK() {
    word = outcomes.ModE.duplicate();

    //Non-rhoticity
    word.remove("ɹ̠", "V_C/#");

    word.forEach(segment => {
        if (segment.value == "æ" && (segment.relIdx(1).match("f", "θ", "s") || segment.ctxMatch("_n,t͡ʃ/s"))) {
            segment.value = "ɑː";
            segment.trapBath = true;
        }
    });

    word.replace("ɒː", "ɒ");

    word.replace("ɔə̯", "ɔː");

    word.replace("æ", "a");
    word.replace("ɒ", "ɔ");
    word.replace("ɔː", "oː");

    word.replace("oʊ̯", "əʉ̯");
    word.replace("uː", "ʊʉ̯");
    word.replace("ʌ", "ɐ");
    word.replace("ʊ", "ɵ");

    word.replace("iː", "ɪi̯");

    word.replace("əʉ̯", "ɒʊ̯", "_ɫ");
    word.replace("ʊʉ̯", "uː", "_ɫ");

    word.replace("ɛə̯", "ɛː");
    word.replace("ɪə̯", "ɪː");
    word.replace("ʊə̯", "oː");

    word.replace("eɪ̯", "ɛɪ̯");
    word.replace("ɔɪ̯", "oɪ̯");

    word.remove("j", "#/C,s_");
    word.remove("j[stressed]", "l_");

    addRow("UK", "Modern English (UK)", "", word.modernSpelling, word);
}

function ModE_to_US() {
    word = outcomes.ModE.duplicate();

    word.replace("ɒ", "ɒː", "_ŋ/g");
    word.replace("ɒː", "ɔː");

    word.replace("ɒ", "ɔ", "_ɹ̠");

    word.replace("ɒ", "ɑː");

    word.forEach(segment => {
        if (segment.value.endsWith("ː"))
            segment.value = segment.value[0];
    });

    //Flapping
    word.replace("{t/d}[!stressed]", "ɾ", "V[!=m̩/n̩/ɫ̩]/ɹ̠_V");

    word.replace("æ", "eə̯", "_m/n");

    word.replace("ʌ", "ɜ");

    word.replace("ɔə̯", "ɔ");

    //Yod-dropping
    word.remove("j[stressed]", "n/tʰ/t/d/θ/s/l_");
    word.remove("j", "C,n/tʰ/t/d/θ/s/l_");

    word.replace("ɛə̯", "ɛ");
    word.replace("æ", "ɛ", "_ɹ̠");
    word.replace("ɜ", "ə", "_ɹ̠");
    word.replace("ɪə̯", "ɪ");
    word.replace("ʊə̯", "ə", "t͡ʃ/d͡ʒ/ʃ/j/n/l/ɹ̠_");
    word.replace("ʊə̯", "ɔ");
    word.replace("ɛ", "e", "_ɹ̠");
    word.replace("ɔ", "o", "_ɹ̠");

    word.forEach(segment => {
        if (segment.value == "ə" && segment.relIdx(1).value == "ɹ̠" && (segment.relIdx(2).type != "vowel" || segment.stressed)) {
            segment.value = "ɚ";
            segment.relIdx(1).remove();
        }
    });
    word.forEach(segment => {
        if (segment.match("ɑ", "e", "ɪ", "o") && segment.ctxMatch("_ɹ̠,C/#")) {
            segment.value += "ɚ̯";
            segment.relIdx(1).remove();
        }
    });

    //Weak vowel merger
    word.forEach(segment => {
        if (segment.match("ə", "ɪ") && !segment.stressed && segment.relIdx(1).value != "ŋ") {
            if (segment.ctxMatch("_C,C/#") && !segment.relIdx(1).stressed) {
                if (segment.relIdx(1).match("m", "n", "ɫ")) {
                    segment.value = segment.relIdx(1).value + "̩";
                    segment.relIdx(1).remove();
                } else {
                    segment.value = "ɨ";
                }
            } else {
                segment.value = "ə";
            }
        }
    });

    word.replace("l", "ɫ");

    word.replace("i", "iə̯", "_ɫ,C/#");
    word.replace("u", "uə̯", "_ɫ,C/#");

    addRow("US", "Modern English (US)", "", word.modernSpelling, word, true);
}

function UK_to_AU() {
    word = outcomes.UK.duplicate();

    word.forEach(segment => {
        if (segment.trapBath && segment.relIdx(1).value == "n")
            segment.value = "a";
    });

    //Flapping
    word.replace("{t/d}[!stressed]", "ɾ", "V[!=m̩/n̩/ɫ̩]/ɹ̠_V");

    word.remove("j[stressed]", "θ_");
    word.remove("j", "C,θ_");

    //Yod-coalescence
    word.replaceSeq("tʰ,j", "t͡ʃ");
    word.replaceSeq("t,j", "t͡ʃ");
    word.replaceSeq("d,j", "d͡ʒ");
    word.replaceSeq("s,j", "ʃ");
    word.replaceSeq("z,j", "ʒ");

    //Weak vowel merger
    word.forEach(segment => {
        if (segment.match("ə", "ɪ") && !segment.stressed && segment.relIdx(1).value != "ŋ") {
            if (segment.ctxMatch("_C,C/#") && !segment.relIdx(1).stressed) {
                if (segment.relIdx(1).match("m", "n", "ɫ")) {
                    segment.value = segment.relIdx(1).value + "̩";
                    segment.relIdx(1).remove();
                } else {
                    segment.value = "ɨ";
                }
            } else {
                segment.value = "ə";
            }
        }
    });

    word.replace("l", "ɫ");

    word.replace("a", "æ");
    word.replace("ɛ", "e");
    word.replace("ɪ", "i");
    word.replace("ɵ", "u");
    word.replace("aɪ̯", "ɑe̯");
    word.replace("ɛɪ̯", "æɪ̯");
    word.replace("aʊ̯", "æɔ̯");
    word.replace("əʉ̯", "ɜʉ̯");
    word.replace("ɑː", "ɐː");
    word.replace("ɛː", "eː");
    word.replace("əː", "ɘː");
    word.replace("ə", "ɐ", "_#");
    word.replace("ɒʊ̯", "ɔʊ̯");
    word.replace("æ", "ɛː", "_m/n/ŋ");
    word.replace("ɪi̯", "iː", "_ɫ");

    word.forEach(segment => {
        if (segment.value == "ɪː" && !(segment.relIdx(1).type == "consonant" && segment.relIdx(2).type != "vowel"))
            segment.value = "ɪə̯";
    });

    addRow("AU", "Modern English (Australia)", "", word.modernSpelling, word, true);
}

function ModE_to_ModSc() {
    word = outcomes.ModE.duplicate();

    word.replace("øː", "ɪu̯", "_k/x");

    word.forEach(segment => {
        if (segment.value == "ɪu̯") {
            segment.value = "uː";
            if (!segment.relIdx(-1).match("j", "t͡ʃ", "d͡ʒ", "ʃ", "ɾ", "w") && !segment.ctxMatch("p/t/k/b/d/g,l_")) {
                word.insert("j", segment.idx);
                if (segment.stressed)
                    segment.relIdx(-1).stressed = true;
            }
        }
    });

    word.replace("h", "ç", "_j");

    word.forEach(segment => {
        if (segment.match("əi̯", "iː") && !segment.stressed && (segment.negIdx == -1 || segment.relIdx(1).type == "vowel" || ((word.sSuffix || word.pastTense) && segment.negIdx == -2)))
            segment.value = "e";
    });

    //Scottish Vowel Length Rule
    word.forEach(segment => {
        if (segment.relIdx(1).type == "consonant" && (!segment.relIdx(1).match("v", "ð", "z", "ɾ") || segment.relIdx(2).type == "consonant") && !(segment.negIdx == -2 && word.pastTense)) {
            switch (segment.value) {
                case "iː":
                    segment.value = "i";
                    break;
                case "eː":
                    segment.value = "e";
                    break;
                case "oː":
                    segment.value = "o";
                    break;
                case "uː":
                    segment.value = "u";
                    break;
                case "øː":
                    segment.value = "ø";
                    break;
                case "ɛi̯":
                    segment.value = "e";
                    break;
            }
        } else {
            switch (segment.value) {
                case "a":
                    segment.value = "aː";
                    break;
                case "ɛ":
                    segment.value = "ɛː";
                    break;
                case "ɔ":
                    segment.value = "ɔː";
                    break;
                case "əi̯":
                    segment.value = "əːi̯";
                    break;
            }
        }
    });

    word.replace("əːi̯", "ai̯");

    word.replace("ui̯", "əi̯");

    word.forEach(segment => {
        if (segment.value == "ɛi̯" && (segment.negIdx == -1 || segment.relIdx(1).inSuffix || (word.sSuffix && segment.negIdx == -2)))
            segment.value = "əi̯";
    });
    word.replace("ɛi̯", "eː");

    word.forEach(segment => {
        if (segment.value == "d" && segment.relIdx(-1).value == "n" && segment.relIdx(1).value != "ɾ") {
            segment.relIdx(-1).droppedD = true;
            segment.remove();
        }

        if (segment.value == "d" && segment.relIdx(-1).value == "ɫ" && (segment.negIdx == -1 || segment.relIdx(1).inSuffix)) {
            segment.relIdx(-1).droppedD = true;
            segment.remove();
        }
    });

    if (word.pastTense && word.atIdx(-2).value == "ɪ" && !word.atIdx(-3).match("p", "b", "t", "d", "k", "g")) {
        if (word.atIdx(-3).match("d͡ʒ", "v", "ð", "z") || (word.vowels.atIdx(-2).stressed && word.atIdx(-3).match("m", "n", "ŋ", "l", "ɾ")))
            word.atIdx(-1).value = "d";
        word.atIdx(-2).remove();
    }
    word.replace("l", "ɫ", "_C/#");
    word.replace("ɫ", "l", "_V");

    word.forEach(segment => {
        if (segment.match("m", "n", "ɫ", "ɾ") && segment.ctxMatch("C_C[!=j/w]/#") && !segment.ctxMatch("m,n_") && !(segment.relIdx(-1).match("ɫ", "ɾ") && segment.value != "ɾ"))
            word.insert("ə", segment.idx);
    });
    if (word.atIdx(-2).value == "j" && word.atIdx(-1).type == "consonant") {
        word.atIdx(-2).value = "iː";
        word.atIdx(-2).type = "vowel";
    }
    if (word.atIdx(-2).match("w", "xʷ") && word.atIdx(-1).type == "consonant") {
        word.atIdx(-2).value = "ou̯";
        word.atIdx(-2).type = "vowel";
    }

    word.forEach(segment => {
        if (segment.value == "ɪ" && segment.relIdx(1).value == "n" && segment.idx > word.stressedVowel.idx)
            segment.value = "ə";
    });

    word.remove("t", "f/s/ç/x_ə,n/ɫ");

    word.replace("l", "ɫ");

    word.replace("ʊ", "ʌ");
    word.replace("ou̯", "ʌu̯");

    word.replace("t͡ʃ", "ʃ", "n_");
    word.replace("d͡ʒ", "ʒ", "n_");

    word.replace("ai̯", "aɪ̯");
    word.replace("oi̯", "oɪ̯");

    word.replace("ɪ", "ʌ", "w/xʷ_");

    word.replace("ɪ", "ə", "_ɫ/ɾ");

    word.replace("ø", "ʏ");

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);
        if (segment.match("t", "t͡ʃ") && !segment.stressed && (segment.relIdx(-1).type == "vowel" || segment.relIdx(-1).match("n", "ɫ", "ɾ")) && segment.relIdx(1).type != "vowel") {
            word.insert("ʔ", segment.idx);
            i++;
        }
    }

    if (word.atIdx(0).type == "vowel") {
        word.insert("ʔ", 0);
        if (word.atIdx(1).stressed)
            word.atIdx(0).stressed = true;
    }

    word.replace("ʌu̯[!stressed]", "e", "_C/#");

    word.replace("øː", "eː", "_#");

    addRow("scots", "Modern Scots", "", getSpelling_ModSc(word), word);
}

function getSpelling_OE() {
    let str = wordArg;
    str = str.replaceAll("ā", "a")
        .replaceAll("ē", "e")
        .replaceAll("ī", "i")
        .replaceAll("ō", "o")
        .replaceAll("ū", "u")
        .replaceAll("ȳ", "y")
        .replaceAll("ǣ", "æ")
        .replaceAll("ċ", "c")
        .replaceAll(/(?<![eiyæn])ġa/g, "gea")
        .replaceAll(/(?<![eiyæn])ġo/g, "geo")
        .replaceAll(/(?<![eiyæn])ġu/g, "geo")
        .replaceAll("ġ", "g");
    return str;
}

function getSpelling_EME() {
    let str = "";
    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);
        switch (segment.value) {
            case "a":
            case "aː":
                str += "a";
                break;
            case "e":
            case "ɛː":
            case "eː":
            case "ə":
                str += "e";
                break;
            case "i":
            case "iː":
                str += "i";
                break;
            case "o":
            case "ɔː":
            case "oː":
                str += "o";
                break;
            case "u":
            case "uː":
                str += "u";
                break;
            case "b":
                str += "b";
                break;
            case "t͡ʃ":
                str += "ch";
                break;
            case "d":
                if (segment.relIdx(1).value == "d͡ʒ")
                    str += "g";
                else
                    str += "d";
                break;
            case "f":
                str += "f";
                break;
            case "g":
            case "d͡ʒ":
                str += "g";
                break;
            case "ɣ":
            case "ʝ":
            case "j":
            case "x":
            case "ç":
                str += "ȝ";
                break;
            case "h":
                str += "h";
                break;
            case "k":
                if (segment.relIdx(1).value == "s") {
                    str += "x";
                    i++;
                } else if (segment.relIdx(1).value == "w") {
                    str += "qu";
                    i++;
                } else if (segment.ctxMatch("_e/ə/ɛː/eː/i/iː/ɛi̯/ɛu̯/iu̯/k/#") || segment.relIdx(-1).value == "k") {
                    str += "k";
                } else {
                    str += "c";
                }
                break;
            case "l":
            case "ɫ":
                str += "l";
                break;
            case "m":
                str += "m";
                break;
            case "n":
            case "ŋ":
                str += "n";
                break;
            case "p":
                str += "p";
                break;
            case "r":
            case "rˠ":
                str += "r";
                break;
            case "s":
            case "z":
                str += "s";
                break;
            case "ʃ":
                if (segment.relIdx(1).value != "ʃ")
                    str += "sch";
                break;
            case "t":
                if (segment.relIdx(1).value == "t͡ʃ")
                    str += "c";
                else
                    str += "t";
                break;
            case "θ":
            case "ð":
                str += "þ";
                break;
            case "v":
                if (segment.relIdx(1).type == "consonant")
                    str += "f";
                else
                    str += "v";
                break;
            case "w":
                str += "w";
                break;
            case "xʷ":
                str += "hw";
                break;
        }
    }

    return str.replace(/s$/, `<span class="nonHist">s</span>`);
}

function getSpelling_LME() {
    let str = "";
    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);
        switch (segment.value) {
            case "a":
            case "aː":
                str += "a";
                break;
            case "e":
            case "ə":
                str += "e";
                break;
            case "ɛː":
            case "eː":
                if (segment.relIdx(2).type == "vowel" || segment.relIdx(1).type != "consonant" || (word.droppedE && segment.negIdx == -2))
                    str += "e";
                else
                    str += "ee";
                break;
            case "i":
            case "iː":
                if ((segment.negIdx == -1 && !word.droppedE) || segment.relIdx(1).value == "i" || (segment.idx == 0 && !segment.stressed))
                    str += "y";
                else
                    str += "i";
                break;
            case "ɔ":
                str += "o";
                break;
            case "ɔː":
            case "oː":
                if (
                    segment.relIdx(2).type == "vowel" || segment.relIdx(1).type != "consonant" || segment.ctxMatch("_ɫ/rˠ,d") || (word.droppedE && segment.negIdx == -2)
                    || (segment.relIdx(1).value == "m" && (segment.relIdx(1).droppedB || segment.relIdx(2).value == "b"))
                )
                    str += "o";
                else
                    str += "oo";
                break;
            case "u":
                if (segment.relIdx(-1).match("w", "v") || segment.relIdx(-1).droppedW || segment.relIdx(1).match("m", "n", "ŋ", "v"))
                    str += "o";
                else
                    str += "u";
                break;
            case "uː":
            case "ɔu̯":
                if (segment.relIdx(1).type == "consonant")
                    str += "ou";
                else
                    str += "ow";
                break;
            case "ɑu̯":
                if (segment.relIdx(1).type == "consonant")
                    str += "au";
                else
                    str += "aw";
                break;
            case "æi̯":
                if (segment.EMEValue == "a")
                    str += "a";
                else
                    str += "e";
                if (segment.relIdx(1).type == "consonant")
                    str += "i";
                else
                    str += "y";
                break;
            case "ɛu̯":
            case "iu̯":
                str += "ew";
                break;
            case "ɔi̯":
            case "ui̯":
                if (segment.relIdx(1).type == "consonant")
                    str += "oi";
                else
                    str += "oy";
                break;
            case "b":
                if (segment.degeminated)
                    str += "bb";
                else
                    str += "b";
                break;
            case "t͡ʃ":
                if (segment.degeminated)
                    str += "cch";
                else
                    str += "ch";
                break;
            case "d":
                if (segment.degeminated)
                    str += "dd";
                else
                    str += "d";
                break;
            case "f":
                if (segment.degeminated)
                    str += "ff";
                else
                    str += "f";
                break;
            case "g":
            case "d͡ʒ":
                if (segment.degeminated)
                    str += "gg";
                else
                    str += "g";
                break;
            case "h":
                str += "h";
                break;
            case "x":
            case "ç":
                str += "gh";
                break;
            case "k":
                if (segment.relIdx(1).value == "s") {
                    str += "x";
                    i++;
                }
                else if (segment.relIdx(1).value == "w") {
                    str += "qu";
                    i++;
                } else if (segment.degeminated) {
                    str += "ck";
                } else if (
                    segment.relIdx(1).match("e", "ə", "ɛː", "eː", "i", "iː", "ɛu̯", "iu̯", "j", "n")
                    || (segment.relIdx(1).value == "æi̯" && (segment.relIdx(1).EMEValue != "a"))
                    || segment.negIdx == -1
                ) {
                    str += "k";
                } else {
                    str += "c";
                }
                break;
            case "l":
            case "ɫ":
                if (segment.degeminated)
                    str += "ll";
                else
                    str += "l";
                break;
            case "m":
                if (segment.droppedB)
                    str += "mb";
                else if (segment.droppedN)
                    str += "mn";
                else if (segment.degeminated)
                    str += "mm";
                else
                    str += "m";
                break;
            case "n":
            case "ŋ":
                if (segment.degeminated)
                    str += "nn";
                else
                    str += "n";
                break;
            case "p":
                if (segment.degeminated)
                    str += "pp";
                else
                    str += "p";
                break;
            case "r":
            case "rˠ":
                if (segment.degeminated)
                    str += "rr";
                else
                    str += "r";
                break;
            case "s":
            case "z":
                if (segment.degeminated)
                    str += "ss";
                else
                    str += "s";
                if (segment.droppedW)
                    str += "w";
                break;
            case "ʃ":
                str += "sch";
                break;
            case "t":
                if (segment.degeminated)
                    str += "tt";
                else
                    str += "t";
                break;
            case "θ":
            case "ð":
                if (segment.degeminated)
                    str += "thth";
                else
                    str += "th";
                break;
            case "v":
                if (modernTypography)
                    str += "v";
                else
                    str += "u";
                if (segment.relIdx(1).type == "consonant")
                    str += "e";
                break;
            case "w":
                str += "w";
                break;
            case "xʷ":
                str += "wh";
                break;
            case "j":
                if (segment.relIdx(-1).type == "consonant" && !segment.stressed)
                    str += "i";
                else
                    str += "y";
                break;
        }
    }

    if (word.droppedE)
        str += "e";

    return str;
}

function getSpelling_ESc() {
    let str = "";
    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);
        switch (segment.value) {
            case "a":
                str += "a";
                break;
            case "aː":
                if (segment.relIdx(2).type == "vowel" || segment.relIdx(1).type != "consonant" || (word.droppedE && segment.negIdx == -2) || segment.relIdx(1).value == "ɫ")
                    str += "a";
                else
                    str += "ai";
                break;
            case "e":
            case "ə":
                str += "e";
                break;
            case "ɛː":
            case "eː":
                if (segment.relIdx(2).type == "vowel" || segment.relIdx(1).type != "consonant" || (word.droppedE && segment.negIdx == -2))
                    str += "e";
                else
                    str += "ei";
                break;
            case "ɪ":
            case "iː":
            case "i":
                if ((segment.negIdx == -1 && !word.droppedE) || segment.relIdx(1).value == "ɪ")
                    str += "y";
                else
                    str += "i";
                break;
            case "ɔ":
                str += "o";
                break;
            case "ɔː":
                if (segment.relIdx(2).type == "vowel" || segment.relIdx(1).type != "consonant" || (word.droppedE && segment.negIdx == -2))
                    str += "o";
                else
                    str += "oo";
                break;
            case "u":
                if (segment.relIdx(-1).match("w", "v") || segment.relIdx(-1).droppedW || segment.relIdx(1).match("m", "n", "ŋ"))
                    str += "o";
                else
                    str += "u";
                break;
            case "øː":
                if (segment.relIdx(2).type == "vowel" || segment.relIdx(1).type != "consonant" || (word.droppedE && segment.negIdx == -2))
                    str += "u";
                else
                    str += "ui";
                break;
            case "uː":
            case "ɔu̯":
                if (segment.relIdx(1).type == "consonant")
                    str += "ou";
                else
                    str += "ow";
                break;
            case "ɑu̯":
                if (segment.relIdx(1).type == "consonant")
                    str += "au";
                else
                    str += "aw";
                break;
            case "æi̯":
                if (segment.EMEValue == "a")
                    str += "a";
                else
                    str += "e";
                if (segment.relIdx(1).type == "consonant")
                    str += "i";
                else
                    str += "y";
                break;
            case "ɛu̯":
            case "iu̯":
                if (segment.relIdx(1).type == "consonant")
                    str += "eu";
                else
                    str += "ew";
                break;
            case "ɔi̯":
            case "ui̯":
                if (segment.relIdx(1).type == "consonant")
                    str += "oi";
                else
                    str += "oy";
                break;
            case "b":
                if (segment.degeminated)
                    str += "bb";
                else
                    str += "b";
                break;
            case "t͡ʃ":
            case "x":
            case "ç":
                if (segment.degeminated)
                    str += "cch";
                else
                    str += "ch";
                break;
            case "d":
                if (segment.degeminated)
                    str += "dd";
                else
                    str += "d";
                break;
            case "f":
                if (segment.degeminated)
                    str += "ff";
                else
                    str += "f";
                break;
            case "g":
            case "d͡ʒ":
                if (segment.degeminated)
                    str += "gg";
                else
                    str += "g";
                break;
            case "j":
                if (modernTypography)
                    str += "ȝ";
                else
                    str += "z";
                break;
            case "h":
                str += "h";
                break;
            case "k":
                if (segment.relIdx(1).value == "s") {
                    str += "x";
                    i++;
                } else if (segment.relIdx(1).value == "w") {
                    str += "qu";
                    i++;
                } else if (segment.degeminated) {
                    str += "kk";
                } else if (
                    segment.relIdx(1).match("e", "ə", "ɛː", "eː", "ɪ", "iː", "ɛu̯", "iu̯", "j", "s", "n", "l", "h")
                    || (segment.relIdx(1).value == "æi̯" && (segment.relIdx(1).EMEValue != "a"))
                    || segment.negIdx == -1
                ) {
                    str += "k";
                } else {
                    str += "c";
                }
                break;
            case "l":
            case "ɫ":
                if (segment.degeminated || (segment.ctxMatch("V_V/#") && segment.relIdx(-1).idx > word.stressedVowel.idx))
                    str += "ll";
                else
                    str += "l";
                break;
            case "m":
                if (segment.degeminated)
                    str += "mm";
                else
                    str += "m";
                break;
            case "n":
                if (segment.degeminated)
                    str += "nn";
                else
                    str += "n";
                break;
            case "ŋ":
                if (segment.relIdx(1).value == "k")
                    str += "n";
                else
                    str += "ng";
                break;
            case "p":
                if (segment.degeminated)
                    str += "pp";
                else
                    str += "p";
                break;
            case "r":
            case "rˠ":
                if (segment.degeminated)
                    str += "rr";
                else
                    str += "r";
                break;
            case "s":
            case "z":
                if (segment.degeminated)
                    str += "ss";
                else
                    str += "s";
                break;
            case "ʃ":
                str += "sch";
                break;
            case "t":
                if (segment.degeminated)
                    str += "tt";
                else
                    str += "t";
                break;
            case "θ":
            case "ð":
                if (segment.degeminated)
                    str += "þþ";
                else
                    str += "þ";
                break;
            case "v":
            case "w":
                if (modernTypography)
                    str += "v";
                else
                    str += "u";
                if (segment.value == "v" && segment.relIdx(1).type == "consonant")
                    str += "e";
                break;
            case "xʷ":
                str += "quh";
                break;
        }
    }

    if (word.droppedE && ((word.atIdx(-2).value.endsWith("ː") && word.atIdx(-1).type == "consonant") || (word.atIdx(-1).degeminated && word.atIdx(-1).value != "ʃ")))
        str += "e";

    return str;
}

function getSpelling_EModE(word) {
    let laterWord = word;
    word = word.EModEWord;
    let str = "";

    let finalE = false;
    if (word.droppedE && (word.vowels.atIdx(-1).stressed || (word.atIdx(-1).type == "vowel" && !word.atIdx(-1).stressed)) && !word.atIdx(-1).match("eː", "ɛː") && !word.pastTense && word.atIdx(-1).value != "θ")
        finalE = true;
    if (laterWord.vowels.atIdx(-1).value.length > 1 && !word.sSuffix && !word.pastTense && !word.vowels.atIdx(-1).droppedH && word.atIdx(-1).type != "vowel" && word.atIdx(-1).value != "θ" && !(word.atIdx(-1).value == "z" && !laterWord.vowels.atIdx(-1).stressed && !laterWord.vowels.atIdx(-1).match("ɛː", "əi̯")))
        finalE = true;
    if (word.atIdx(-1).match("v", "d͡ʒ") || (word.atIdx(-1).match("ð", "z") && word.atIdx(-2).type == "vowel" && word.atIdx(-2).value.length > 1 && word.atIdx(-2).stressed && !word.sSuffix))
        finalE = true;
    if (word.atIdx(-1).value == "ð" && word.vowels.atIdx(-1).stressed)
        finalE = true;
    if (word.atIdx(-1).value == "s" && word.atIdx(-2).type == "vowel" && word.atIdx(-2).value.length == 1)
        finalE = true;
    if (word.atIdx(-1).match("s", "z") && word.atIdx(-2).type == "consonant" && !word.sSuffix)
        finalE = true;

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);

        let addApostrophe = false;
        if (
            segment.negIdx == -2 && word.pastTense && (segment.relIdx(1).value == "d" || segment.relIdx(-1).match("aː", "iː", "ɔː"))
            && !(segment.type == "vowel" && segment.value.length == 1) && !(segment.value == "eː" && segment.stressed)
        )
            addApostrophe = true;
        if (
            segment.negIdx == -4 && word.conjPastTense && (segment.relIdx(1).value == "d" || segment.relIdx(-1).match("aː", "iː", "ɔː"))
            && !(segment.type == "vowel" && segment.value.length == 1) && segment.value != "eː"
        )
            addApostrophe = true;

        let addE = false;
        if (segment.negIdx == -2 && word.sSuffix && (word.vowels.atIdx(-1).stressed || segment.type == "vowel") && !segment.match("ə", "eː", "ɛː"))
            addE = true;
        if (segment.negIdx == -2 && word.sSuffix && laterWord.vowels.atIdx(-1).value.length > 1 && !word.vowels.atIdx(-1).droppedH && segment.type != "vowel" && segment.value != "θ")
            addE = true;
        if (segment.match("d͡ʒ", "v") && segment.relIdx(1).type == "consonant" && !addApostrophe)
            addE = true;
        if (segment.value == "iː" && segment.ctxMatch("_rˠ,#") && !segment.stressed)
            addE = true;
        if (finalE && segment.negIdx == -1)
            addE = true;

        let doubleCons = segment.relIdx(-1).match("a", "e", "i", "ɔ", "u") && segment.relIdx(-1).stressed && (segment.relIdx(1).type == "vowel" || addE || addApostrophe);

        switch (segment.value) {
            case "a":
            case "aː":
                str += "a";
                break;
            case "e":
                str += "e";
                break;
            case "ə":
                if (
                    segment.ctxMatch("C_ɫ") && !segment.relIdx(-1).match("m", "n", "v", "l", "r", "θ", "t͡ʃ", "ʃ", "d͡ʒ", "j", "w")
                    && !(str.at(-1) == "s" && str.at(-2) != "s")
                    && !(segment.relIdx(2).type == "consonant" && segment.relIdx(3).type != "vowel" && !(segment.negIdx == -3 && (word.sSuffix || word.pastTense)))
                ) {
                    str += "le";
                    i++;
                } else if (segment.idx == 0 && segment.relIdx(1).stressed) {
                    str += "a";
                } else if (segment.LMEValue == "oː" || segment.LMEValue == "ɔ" || (segment.relIdx(1).match("m", "p", "b", "k") && !segment.relIdx(1).stressed)) {
                    str += "o";
                } else {
                    str += "e";
                }
                break;
            case "ɛː":
                str += "ea";
                break;
            case "eː":
                if (segment.ctxMatch("_ɫ/n,d"))
                    str += "ie";
                else
                    str += "ee";
                break;
            case "i":
            case "iː":
                if (segment.droppedH)
                    str += "igh";
                else if (!segment.stressed && segment.LMEValue == "e")
                    str += "e";
                else if ((segment.negIdx == -1 && !finalE) || segment.relIdx(1).value == "i")
                    str += "y";
                else
                    str += "i";
                break;
            case "ɔ":
                str += "o";
                break;
            case "ɔː":
                if (
                    segment.relIdx(2).type == "vowel" || segment.relIdx(1).type != "consonant" || addE
                    || (word.droppedE && segment.negIdx == -2)
                    || (segment.negIdx == -3 && (word.sSuffix || word.pastTense))
                    || segment.ctxMatch("_ɫ,d") || segment.ctxMatch("_rˠ,n")
                    || (segment.relIdx(1).value == "m" && segment.relIdx(1).droppedB)
                )
                    str += "o";
                else
                    str += "oa";
                break;
            case "oː":
                if (segment.relIdx(1).droppedB || segment.ctxMatch("_m,b"))
                    str += "o";
                else
                    str += "oo";
                break;
            case "u":
                if (segment.relIdx(-1).match("w", "v") || segment.relIdx(1).value == "v")
                    str += "o";
                else if (segment.idx == 0 && !modernTypography)
                    str += "v";
                else
                    str += "u";
                break;
            case "uː":
                if (segment.droppedH)
                    str += "ough";
                else if (segment.relIdx(1).match("m", "p", "b", "f", "v"))
                    str += "oo";
                else if (
                    (segment.relIdx(1).type == "consonant" && !addE && !addApostrophe && !segment.ctxMatch("_n/l/ɫ,z/V/#") && !(word.sSuffix && segment.ctxMatch("_z,#")))
                    || segment.relIdx(-1).value == "j"
                )
                    str += "ou";
                else
                    str += "ow";
                break;
            case "ɑu̯":
                if (segment.droppedH && segment.LMEValue == "ɔu̯")
                    str += "ough";
                else if (segment.droppedH)
                    str += "augh";
                else if (segment.relIdx(1).type == "consonant" && !addE && !addApostrophe && !segment.ctxMatch("_n/l/ɫ,z/V/#") && !(word.sSuffix && segment.ctxMatch("_z,#")))
                    str += "au";
                else
                    str += "aw";
                break;
            case "æi̯":
                if (segment.droppedH)
                    str += "eigh";
                else if (segment.relIdx(1).type == "consonant" && !addE && !addApostrophe && !(word.sSuffix && segment.ctxMatch("_z,#")))
                    str += "ai";
                else
                    str += "ay";
                break;
            case "ɛu̯":
            case "iu̯":
                str += "ew";
                break;
            case "ɔi̯":
            case "ui̯":
                str += "oy";
                break;
            case "ɔu̯":
                if (segment.droppedH)
                    str += "ough";
                else
                    str += "ow";
                break;
            case "b":
                if (doubleCons)
                    str += "bb";
                else
                    str += "b";
                break;
            case "t͡ʃ":
                if (segment.relIdx(-1).match("a", "e", "i", "ɔ", "u") && segment.relIdx(-1).stressed)
                    str += "tch";
                else
                    str += "ch";
                break;
            case "d":
                if (doubleCons)
                    str += "dd";
                else
                    str += "d";
                break;
            case "f":
                if (segment.relIdx(-1).match("a", "e", "i", "ɔ", "u") && segment.relIdx(-1).stressed && (segment.relIdx(1).type != "consonant" || (word.sSuffix && segment.negIdx == -2) || addE))
                    str += "ff";
                else
                    str += "f";
                break;
            case "g":
                if (doubleCons)
                    str += "gg";
                else
                    str += "g";
                break;
            case "h":
                if (segment.LMEValue == "xʷ")
                    str += "wh";
                else
                    str += "h";
                break;
            case "d͡ʒ":
                if (segment.relIdx(-1).match("a", "e", "i", "ɔ", "u"))
                    str += "dg";
                else
                    str += "g";
                break;
            case "k":
                if (segment.relIdx(1).value == "s" && !(word.sSuffix && segment.negIdx == -2)) {
                    str += "x";
                    i++;
                } else if (segment.relIdx(1).value == "w") {
                    str += "qu";
                    i++;
                } else if (
                    segment.relIdx(-1).match("a", "e", "i", "ɔ", "u", "ə")
                    && (!segment.stressed || segment.relIdx(1).value == "n")
                    && (segment.ctxMatch("_s/n/l/h/V/#") || addE || (segment.negIdx == -2 && word.pastTense) || (segment.negIdx == -4 && word.conjPastTense))
                ) {
                    str += "ck";
                } else if (
                    segment.relIdx(1).match("e", "ɛː", "eː", "i", "iː", "ɛu̯", "iu̯", "j", "n", "h")
                    || (segment.relIdx(1).value == "ə" && !segment.relIdx(2).match("m", "p", "b", "k"))
                    || addE || addApostrophe || segment.negIdx == -1 || (segment.negIdx == -2 && word.sSuffix)
                    || (segment.negIdx == -2 && word.pastTense) || (segment.negIdx == -4 && word.conjPastTense)
                ) {
                    str += "k";
                } else {
                    str += "c";
                }
                break;
            case "l":
            case "ɫ":
                if (segment.relIdx(-1).match("a", "e", "i", "ɔ", "u") && segment.relIdx(-1).stressed && (segment.relIdx(1).type != "consonant" || (word.sSuffix && segment.negIdx == -2) || addE || addApostrophe))
                    str += "ll";
                else
                    str += "l";
                break;
            case "m":
                if (segment.droppedB)
                    str += "mb";
                else if (segment.droppedN)
                    str += "mn";
                else if (doubleCons)
                    str += "mm";
                else
                    str += "m";
                break;
            case "n":
            case "ŋ":
                if (doubleCons)
                    str += "nn";
                else
                    str += "n";
                break;
            case "p":
                if (doubleCons)
                    str += "pp";
                else
                    str += "p";
                break;
            case "r":
            case "rˠ":
                if (doubleCons)
                    str += "rr";
                else
                    str += "r";
                break;
            case "s":
                if (segment.relIdx(-1).match("a", "e", "i", "ɔ", "u", "ə") && !segment.stressed && (segment.relIdx(1).type != "consonant" || addE)) {
                    if (modernTypography)
                        str += "ss";
                    else
                        str += "ſſ";
                } else if (segment.relIdx(-1).value == "iː" && (segment.relIdx(1).type == "vowel" || addE)) {
                    str += "c";
                } else if ((segment.negIdx == -1 && !addE) || modernTypography) {
                    str += "s";
                } else {
                    str += "ſ";
                }
                break;
            case "ʃ":
                if (modernTypography)
                    str += "sh";
                else
                    str += "ſh";
                break;
            case "t":
                if (segment.relIdx(1).value == "θ")
                    break;
                else if (((segment.negIdx == -1 && word.pastTense) || (segment.negIdx == -3 && word.conjPastTense)) && str.at(-1) == "'")
                    str += "d";
                else if (doubleCons)
                    str += "tt";
                else
                    str += "t";
                break;
            case "θ":
            case "ð":
                str += "th";
                break;
            case "v":
                if (segment.idx == 0 || modernTypography)
                    str += "v";
                else
                    str += "u";
                break;
            case "w":
                str += "w";
                break;
            case "xʷ":
                str += "wh";
                break;
            case "j":
                str += "y";
                break;
            case "z":
                if ((segment.negIdx == -1 && !addE) || modernTypography)
                    str += "s";
                else
                    str += "ſ";
                break;
        }
        if (addE)
            str += "e";
        if (addApostrophe)
            str += "'";
    }

    return str;
}

function getSpelling_MSc(word) {
    word = word.EModEWord;
    let str = "";

    let finalE = false;
    if (word.atIdx(-2).value == "iː" && word.atIdx(-1).type == "consonant" && !word.sSuffix && !word.pastTense && !(word.atIdx(-1).value == "rˠ" && !word.atIdx(-2).stressed))
        finalE = true;
    if (word.droppedE && word.atIdx(-2).match("aː", "ɛː", "ɔː", "oː", "øː") && word.atIdx(-1).type == "consonant" && !word.sSuffix && !word.pastTense)
        finalE = true;
    if (word.atIdx(-1).match("ð", "v", "d͡ʒ") || (word.atIdx(-1).value == "z" && word.atIdx(-2).type == "vowel" && word.atIdx(-2).value.length > 1 && word.atIdx(-2).stressed && !word.sSuffix))
        finalE = true;
    if (word.atIdx(-1).match("s", "z") && word.atIdx(-2).type == "consonant" && !word.sSuffix)
        finalE = true;

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);

        let addI = false;
        if (segment.negIdx == -2 && word.sSuffix && !segment.match("ɪ", "eː", "ɛː"))
            addI = true;

        let addE = false;
        if (segment.match("d͡ʒ", "v") && segment.relIdx(1).type == "consonant" && !addI)
            addE = true;
        if (segment.value == "iː" && segment.ctxMatch("_rˠ,#") && !segment.stressed)
            addE = true;
        if (finalE && segment.negIdx == -1)
            addE = true;

        let doubleCons = segment.relIdx(-1).match("a", "e", "ɪ", "ɔ", "u") && segment.relIdx(-1).stressed && (segment.relIdx(1).type == "vowel" || addE || addI);

        switch (segment.value) {
            case "a":
                str += "a";
                break;
            case "aː":
                if (segment.relIdx(2).type == "vowel" || segment.relIdx(1).type != "consonant" || addE || addI || (finalE && segment.negIdx == -2) || (word.sSuffix && segment.negIdx == -3) || segment.relIdx(1).value == "ɫ")
                    str += "a";
                else
                    str += "ai";
                break;
            case "e":
                str += "e";
                break;
            case "ə":
                if (segment.idx == 0 && segment.relIdx(1).stressed)
                    str += "a";
                else if (segment.LMEValue == "ɔ" || (segment.relIdx(1).match("m", "p", "b", "k") && !segment.relIdx(1).stressed))
                    str += "o";
                else
                    str += "e";
                break;
            case "ɛː":
            case "eː":
                if (segment.relIdx(2).type == "vowel" || segment.relIdx(1).type != "consonant" || addE || addI || (finalE && segment.negIdx == -2) || (word.sSuffix && segment.negIdx == -3))
                    str += "e";
                else
                    str += "ei";
                break;
            case "ɪ":
            case "iː":
                if (!segment.stressed && segment.LMEValue == "e")
                    str += "e";
                else if ((segment.negIdx == -1 && !finalE) || segment.relIdx(1).value == "ɪ")
                    str += "y";
                else
                    str += "i";
                break;
            case "ɔ":
            case "ɔː":
                str += "o";
                break;
            case "øː":
                if (segment.relIdx(2).type == "vowel" || segment.relIdx(1).type != "consonant" || addE || addI || (finalE && segment.negIdx == -2) || (word.sSuffix && segment.negIdx == -3)) {
                    if (segment.idx == 0 && !modernTypography)
                        str += "v";
                    else
                        str += "u";
                } else {
                    if (segment.idx == 0 && !modernTypography)
                        str += "vi";
                    else
                        str += "ui";
                }
                break;
            case "u":
                if (segment.relIdx(-1).match("w", "v"))
                    str += "o";
                else if (segment.idx == 0 && !modernTypography)
                    str += "v";
                else
                    str += "u";
                break;
            case "uː":
                if (segment.relIdx(1).type == "consonant" && !addE && !addI && !(word.sSuffix && segment.ctxMatch("_z,#")))
                    str += "ou";
                else
                    str += "ow";
                break;
            case "ɑu̯":
                if (segment.relIdx(1).type == "consonant" && !addE && !addI && !(word.sSuffix && segment.ctxMatch("_z,#")))
                    str += "au";
                else
                    str += "aw";
                break;
            case "æi̯":
                if (segment.relIdx(1).type == "consonant" && !addE && !addI && !(word.sSuffix && segment.ctxMatch("_z,#")))
                    str += "ai";
                else
                    str += "ay";
                break;
            case "ɛu̯":
            case "iu̯":
                if (segment.relIdx(1).type == "consonant" && !addE && !addI && !(word.sSuffix && segment.ctxMatch("_z,#")))
                    str += "eu";
                else
                    str += "ew";
                break;
            case "ɔi̯":
            case "ui̯":
                if (segment.relIdx(1).type == "consonant" && !addE && !addI && !(word.sSuffix && segment.ctxMatch("_z,#")))
                    str += "oi";
                else
                    str += "oy";
                break;
            case "ɔu̯":
                str += "ow";
                break;
            case "b":
                if (doubleCons)
                    str += "bb";
                else
                    str += "b";
                break;
            case "t͡ʃ":
            case "x":
            case "ç":
                str += "ch";
                break;
            case "d":
                if (doubleCons)
                    str += "dd";
                else
                    str += "d";
                break;
            case "f":
                if (segment.relIdx(-1).match("a", "e", "ɪ", "ɔ", "u") && segment.relIdx(-1).stressed
                    && (segment.relIdx(1).type != "consonant" || (word.sSuffix && segment.negIdx == -2) || addE || addI))
                    str += "ff";
                else
                    str += "f";
                break;
            case "g":
                if (doubleCons)
                    str += "gg";
                else
                    str += "g";
                break;
            case "h":
                if (segment.LMEValue == "xʷ")
                    str += "wh";
                else
                    str += "h";
                break;
            case "d͡ʒ":
                str += "g";
                break;
            case "k":
                if (segment.relIdx(1).value == "s" && !(word.sSuffix && segment.negIdx == -2)) {
                    str += "x";
                    i++;
                } else if (segment.relIdx(1).value == "w") {
                    str += "qu";
                    i++;
                } else if (doubleCons) {
                    str += "kk";
                } else if (
                    segment.relIdx(1).match("e", "ɛː", "eː", "ɪ", "iː", "ɛu̯", "iu̯", "j", "s", "n", "l", "h")
                    || (segment.relIdx(1).value == "ə" && !segment.relIdx(2).match("m", "p", "b", "k"))
                    || addE || addI || segment.negIdx == -1 || (segment.negIdx == -2 && word.sSuffix)
                ) {
                    str += "k";
                } else {
                    str += "c";
                }
                break;
            case "l":
            case "ɫ":
                if (doubleCons || (segment.ctxMatch("V_V/#") && segment.relIdx(-1).idx > word.stressedVowel.idx))
                    str += "ll";
                else
                    str += "l";
                break;
            case "m":
                if (doubleCons)
                    str += "mm";
                else
                    str += "m";
                break;
            case "n":
                if (segment.ing)
                    str += "ng";
                else if (segment.droppedD)
                    str += "nd";
                else if (doubleCons)
                    str += "nn";
                else
                    str += "n";
                break;
            case "ŋ":
                if (segment.relIdx(1).value == "k")
                    str += "n";
                else
                    str += "ng";
                break;
            case "p":
                if (doubleCons)
                    str += "pp";
                else
                    str += "p";
                break;
            case "r":
            case "rˠ":
                if (doubleCons)
                    str += "rr";
                else
                    str += "r";
                break;
            case "s":
                if (segment.relIdx(-1).match("a", "e", "ɪ", "ɔ", "u", "ə") && !segment.stressed && (segment.relIdx(1).type != "consonant" || addE || addI)) {
                    if (modernTypography)
                        str += "ss";
                    else
                        str += "ſſ";
                } else if (segment.relIdx(-1).value == "iː" && (segment.relIdx(1).type == "vowel" || addE || addI)) {
                    str += "c";
                } else if ((segment.negIdx == -1 && !addI) || modernTypography) {
                    str += "s";
                } else {
                    str += "ſ";
                }
                break;
            case "ʃ":
                if (modernTypography)
                    str += "sch";
                else
                    str += "ſch";
                break;
            case "t":
                if (segment.relIdx(1).value == "θ")
                    break;
                else if (doubleCons)
                    str += "tt";
                else
                    str += "t";
                break;
            case "θ":
            case "ð":
                str += "th";
                break;
            case "v":
            case "w":
                if (segment.idx == 0 || modernTypography)
                    str += "v";
                else
                    str += "u";
                break;
            case "xʷ":
                str += "quh";
                break;
            case "j":
                str += "y";
                break;
            case "z":
                if ((segment.negIdx == -1 && !addE) || modernTypography)
                    str += "s";
                else
                    str += "ſ";
                break;
        }
        if (addE)
            str += "e";
        if (addI)
            str += "i";
    }

    return str;
}

function getSpelling_ModE(word) {
    let str = "";

    let finalE = false;
    if (
        word.atIdx(-2).match("aː", "iː") && !word.atIdx(-2).droppedH && word.atIdx(-1).type == "consonant" && !word.sSuffix && !word.pastTense && !word.atIdx(-1).droppedB
        && !(word.atIdx(-2).value == "iː" && !word.atIdx(-2).stressed && word.atIdx(-1).value == "rˠ")
    )
        finalE = true;
    if (word.atIdx(-2).value == "ɔː" && word.atIdx(-1).type == "consonant" && word.droppedE && !word.sSuffix)
        finalE = true;
    if (word.atIdx(-1).match("v", "d͡ʒ") || (word.atIdx(-1).match("ð", "z") && word.atIdx(-2).type == "vowel" && word.atIdx(-2).value.length > 1 && word.atIdx(-2).stressed && !word.sSuffix))
        finalE = true;
    if (word.atIdx(-1).value == "ð" && word.vowels.atIdx(-1).stressed)
        finalE = true;
    if (word.atIdx(-1).value == "s" && word.atIdx(-2).type == "vowel" && word.atIdx(-2).value.length > 1)
        finalE = true;
    if (word.atIdx(-1).match("s", "z") && word.atIdx(-2).type == "consonant" && !word.atIdx(-2).match("k", "v") && !word.sSuffix)
        finalE = true;

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);

        let addE = false;
        if (segment.negIdx == -2 && segment.relIdx(-1).match("aː", "iː", "ɔː") && word.sSuffix && !segment.relIdx(-1).droppedH)
            addE = true;
        if (segment.negIdx == -2 && (segment.match("aː", "iː", "ɔː") || (segment.match("eː", "ɛː") && !segment.stressed)) && word.sSuffix && !segment.droppedH)
            addE = true;
        if (segment.negIdx == -2 && word.pastTense && !(segment.type == "vowel" && segment.value.length == 1) && !(segment.type == "vowel" && segment.relIdx(1).value == "t") && !(segment.value == "eː" && segment.stressed))
            addE = true;
        if (segment.negIdx == -4 && word.conjPastTense && !(segment.type == "vowel" && segment.value.length == 1) && !(segment.type == "vowel" && segment.relIdx(1).value == "t") && segment.value != "eː")
            addE = true;
        if (segment.match("d͡ʒ", "v") && segment.relIdx(1).type == "consonant")
            addE = true;
        if (segment.value == "iː" && segment.ctxMatch("_rˠ,#") && !segment.stressed)
            addE = true;
        if (finalE && segment.negIdx == -1)
            addE = true;

        let doubleCons = segment.relIdx(-1).match("a", "e", "i", "ɔ", "u") && segment.relIdx(-1).stressed && (segment.relIdx(1).type == "vowel" || addE);

        switch (segment.value) {
            case "a":
            case "aː":
                str += "a";
                break;
            case "e":
                str += "e";
                break;
            case "ə":
                if (
                    segment.ctxMatch("C_ɫ") && !segment.relIdx(-1).match("m", "n", "v", "l", "r", "θ", "t͡ʃ", "ʃ", "d͡ʒ", "j", "w")
                    && !(str.at(-1) == "s" && str.at(-2) != "s")
                    && !(segment.relIdx(2).type == "consonant" && segment.relIdx(3).type != "vowel" && !(segment.negIdx == -3 && (word.sSuffix || word.pastTense)))
                ) {
                    str += "le";
                    i++;
                } else if (segment.idx == 0 && segment.relIdx(1).stressed) {
                    str += "a";
                } else if (segment.LMEValue == "oː" || segment.LMEValue == "ɔ" || (segment.relIdx(1).match("m", "p", "b", "k") && !segment.relIdx(1).stressed)) {
                    str += "o";
                } else {
                    str += "e";
                }
                break;
            case "ɛː":
                if (!segment.stressed && segment.ctxMatch("_i/#"))
                    str += "y";
                else if (!segment.stressed && (segment.relIdx(1).type == "vowel" || addE))
                    str += "i";
                else
                    str += "ea";
                break;
            case "eː":
                if (!segment.stressed && segment.ctxMatch("_i/#"))
                    str += "y";
                else if (!segment.stressed && (segment.relIdx(1).type == "vowel" || addE))
                    str += "i";
                else if (segment.ctxMatch("_ɫ/n,d"))
                    str += "ie";
                else
                    str += "ee";
                break;
            case "i":
            case "iː":
                if (segment.droppedH)
                    str += "igh";
                else if (!segment.stressed && segment.LMEValue == "e")
                    str += "e";
                else if (segment.ctxMatch("_i/#"))
                    str += "y";
                else
                    str += "i";
                break;
            case "ɔ":
                str += "o";
                break;
            case "ɔː":
                if (
                    segment.relIdx(2).type == "vowel" || segment.relIdx(1).type != "consonant" || segment.ctxMatch("_rˠ,n")
                    || addE || (finalE && segment.negIdx == -2)
                    || (segment.negIdx == -3 && (word.sSuffix || word.pastTense))
                    || (segment.relIdx(1).value == "m" && segment.relIdx(1).droppedB)
                )
                    str += "o";
                else
                    str += "oa";
                break;
            case "oː":
                if (segment.relIdx(1).droppedB || segment.ctxMatch("_m,b") || segment.ctxMatch("_rˠ,d"))
                    str += "o";
                else
                    str += "oo";
                break;
            case "u":
                if (segment.relIdx(-1).match("w", "v") || segment.relIdx(1).value == "v")
                    str += "o";
                else
                    str += "u";
                break;
            case "uː":
                if (segment.droppedH)
                    str += "ough";
                else if (segment.relIdx(1).match("m", "p", "b", "f", "v"))
                    str += "oo";
                else if (
                    (segment.relIdx(1).type == "consonant" && !addE && !segment.ctxMatch("_n/l/ɫ,z/V/#") && !(word.sSuffix && segment.ctxMatch("_z,#")))
                    || segment.relIdx(-1).value == "j"
                )
                    str += "ou";
                else
                    str += "ow";
                break;
            case "ɑu̯":
                if (segment.droppedH && segment.LMEValue == "ɔu̯")
                    str += "ough";
                else if (segment.droppedH)
                    str += "augh";
                else if (segment.relIdx(1).type == "consonant" && !addE && !segment.ctxMatch("_n/l/ɫ,z/V/#") && !(word.sSuffix && segment.ctxMatch("_z,#")))
                    str += "au";
                else
                    str += "aw";
                break;
            case "æi̯":
                if (segment.droppedH)
                    str += "eigh";
                else if (segment.relIdx(1).type == "consonant" && !addE && !(word.sSuffix && segment.ctxMatch("_z,#")))
                    str += "ai";
                else
                    str += "ay";
                break;
            case "ɛu̯":
            case "iu̯":
                str += "ew";
                break;
            case "ɔi̯":
            case "ui̯":
                if (segment.relIdx(1).type == "consonant" && !addE && !(word.sSuffix && segment.ctxMatch("_z,#")))
                    str += "oi";
                else
                    str += "oy";
                break;
            case "ɔu̯":
                if (segment.droppedH)
                    str += "ough";
                else
                    str += "ow";
                break;
            case "b":
                if (doubleCons)
                    str += "bb";
                else
                    str += "b";
                break;
            case "t͡ʃ":
                if (segment.relIdx(-1).match("a", "e", "i", "ɔ", "u") && segment.relIdx(-1).stressed)
                    str += "tch";
                else
                    str += "ch";
                break;
            case "d":
                if (doubleCons)
                    str += "dd";
                else
                    str += "d";
                break;
            case "f":
                if (segment.relIdx(-1).match("a", "e", "i", "ɔ", "u") && segment.relIdx(-1).stressed && (segment.relIdx(1).type != "consonant" || (word.sSuffix && segment.negIdx == -2) || addE))
                    str += "ff";
                else
                    str += "f";
                break;
            case "g":
                if (doubleCons)
                    str += "gg";
                else
                    str += "g";
                break;
            case "h":
                if (segment.LMEValue == "xʷ")
                    str += "wh";
                else
                    str += "h";
                break;
            case "d͡ʒ":
                if (segment.relIdx(-1).match("a", "e", "i", "ɔ", "u"))
                    str += "dg";
                else
                    str += "g";
                break;
            case "k":
                if (segment.relIdx(1).value == "s" && !(word.sSuffix && segment.negIdx == -2)) {
                    str += "x";
                    i++;
                } else if (segment.relIdx(1).value == "w") {
                    str += "qu";
                    i++;
                } else if (segment.relIdx(-1).match("a", "e", "i", "ɔ", "u", "ə") && (!segment.stressed || segment.relIdx(1).value == "n") && (segment.ctxMatch("_s/n/l/h/V/#") || addE)) {
                    str += "ck";
                } else if (
                    segment.relIdx(1).match("e", "ɛː", "eː", "i", "iː", "ɛu̯", "iu̯", "j", "n", "h")
                    || (segment.relIdx(1).value == "ə" && !segment.relIdx(2).match("m", "p", "b", "k"))
                    || addE || segment.negIdx == -1 || (segment.negIdx == -2 && word.sSuffix)
                ) {
                    str += "k";
                } else {
                    str += "c";
                }
                break;
            case "l":
            case "ɫ":
                if (segment.relIdx(-1).match("a", "e", "i", "ɔ", "u") && segment.relIdx(-1).stressed && (segment.relIdx(1).type != "consonant" || (word.sSuffix && segment.negIdx == -2) || addE))
                    str += "ll";
                else
                    str += "l";
                break;
            case "m":
                if (segment.droppedB)
                    str += "mb";
                else if (segment.droppedN)
                    str += "mn";
                else if (doubleCons)
                    str += "mm";
                else
                    str += "m";
                break;
            case "n":
            case "ŋ":
                if (doubleCons)
                    str += "nn";
                else
                    str += "n";
                break;
            case "p":
                if (doubleCons)
                    str += "pp";
                else
                    str += "p";
                break;
            case "r":
            case "rˠ":
                if (doubleCons)
                    str += "rr";
                else
                    str += "r";
                break;
            case "s":
                if (segment.relIdx(-1).match("a", "e", "i", "ɔ", "u", "ə") && !segment.stressed && (segment.relIdx(1).type != "consonant" || addE))
                    str += "ss";
                else if (segment.relIdx(-1).value == "iː" && (segment.relIdx(1).type == "vowel" || addE))
                    str += "c";
                else
                    str += "s";
                break;
            case "ʃ":
                str += "sh";
                break;
            case "t":
                if (segment.relIdx(1).value == "θ")
                    break;
                else if (((segment.negIdx == -1 && word.pastTense) || (segment.negIdx == -3 && word.conjPastTense)) && segment.relIdx(-1).type == "consonant")
                    str += "d";
                else if (doubleCons)
                    str += "tt";
                else
                    str += "t";
                break;
            case "θ":
            case "ð":
                str += "th";
                break;
            case "v":
                str += "v";
                break;
            case "w":
                str += "w";
                break;
            case "xʷ":
                str += "wh";
                break;
            case "j":
                str += "y";
                break;
            case "z":
                if (segment.relIdx(-1).match("a", "e", "i", "ɔ", "u") && segment.relIdx(-1).stressed && (segment.relIdx(1).type != "consonant" || addE))
                    str += "zz";
                else
                    str += "s";
                break;
        }
        if (addE)
            str += "e";
    }

    return str;
}

function getSpelling_ModSc(scotsWord) {
    let word = scotsWord.duplicate();
    word.remove("ʔ");
    let str = "";

    let longVowels = ["əi̯", "aɪ̯", "i", "iː", "e", "eː", "o", "oː", "u", "uː", "ʏ", "øː", "oɪ̯", "ɑː", "ʌu̯"];
    let shortVowels = ["a", "aː", "ɛ", "ɛː", "ɪ", "ɔ", "ɔː", "ʌ", "ə"];

    let finalE = false;
    if (word.atIdx(-2).match("əi̯", "aɪ̯") && word.atIdx(-2).LMEValue == "iː" && word.atIdx(-1).type == "consonant" && !word.atIdx(-1).droppedD && !word.sSuffix && !word.pastTense)
        finalE = true;
    if (word.atIdx(-2).match("e", "eː") && word.atIdx(-1).type == "consonant" && word.droppedE && !word.sSuffix && !word.pastTense && word.atIdx(-2).LMEValue != "æi̯")
        finalE = true;
    if (word.atIdx(-2).match("o", "oː") && word.atIdx(-1).type == "consonant" && !word.sSuffix && !word.pastTense)
        finalE = true;
    if (word.atIdx(-1).match("v", "ð", "d͡ʒ", "ʒ"))
        finalE = true;
    if (word.atIdx(-1).value == "s" && word.atIdx(-2).match(...longVowels))
        finalE = true;
    if (word.atIdx(-1).match("s", "z") && word.atIdx(-2).type == "consonant" && !word.atIdx(-2).match("k", "v") && !word.sSuffix)
        finalE = true;
    if (word.atIdx(-1).value == "ʌu̯")
        finalE = true;

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);

        let addE = false;
        if (segment.negIdx == -2 && segment.relIdx(-1).match("e", "eː", "əi̯", "aɪ̯", "o", "oː", "ʌu̯") && !(segment.relIdx(-1).match("əi̯", "aɪ̯") && segment.relIdx(-1).LMEValue != "iː") && word.sSuffix)
            addE = true;
        if (segment.negIdx == -2 && segment.match("eː", "aɪ̯", "ʌu̯") && word.sSuffix)
            addE = true;
        if (segment.negIdx == -2 && word.pastTense && segment.value != "ɪ" && !shortVowels.includes(segment.value) && !segment.match("e", "eː", "i", "iː") && segment.relIdx(1).value == "d")
            addE = true;
        if (segment.negIdx == -4 && word.conjPastTense && segment.value != "ɪ" && !shortVowels.includes(segment.value) && !segment.match("e", "eː", "i", "iː") && segment.relIdx(1).value == "d")
            addE = true;
        if (segment.match("d͡ʒ", "v") && segment.relIdx(1).type == "consonant")
            addE = true;
        if (segment.value == "iː" && segment.ctxMatch("_rˠ,#"))
            addE = true;
        if (finalE && segment.negIdx == -1)
            addE = true;

        let doubleCons = segment.relIdx(-1).match(...shortVowels) && segment.relIdx(-1).stressed && (segment.relIdx(1).type == "vowel" || addE);

        switch (segment.value) {
            case "əi̯":
            case "aɪ̯":
                if (segment.LMEValue == "iː" && (segment.negIdx == -1 || segment.relIdx(1).LMEValue == "i" || (segment.relIdx(1).inSuffix && word.partOfSpeech != "pastPtcp")))
                    str += "y";
                else if (segment.LMEValue == "iː")
                    str += "i";
                else
                    str += "ey";
                break;
            case "i":
            case "iː":
                if (segment.LMEValue == "eː")
                    str += "ee";
                else
                    str += "ei";
                break;
            case "e":
            case "eː":
                if (segment.ctxMatch("_ə,ɾ"))
                    str += "i";
                else if ((segment.negIdx == -1 || (segment.negIdx == -2 && (word.sSuffix || word.pastTense))) && (segment.LMEValue == "iː" || segment.LMEValue == "i"))
                    str += "ie";
                else if (segment.negIdx == -1 || (segment.negIdx == -2 && (word.sSuffix || word.pastTense)) && !addE)
                    str += "ae";
                else if ((segment.relIdx(2).type == "vowel" || segment.relIdx(1).type != "consonant" || addE || (finalE && segment.negIdx == -2) || (segment.negIdx == -3 && (word.sSuffix || word.pastTense))) && segment.LMEValue != "æi̯")
                    str += "a";
                else if (segment.relIdx(1).type == "vowel")
                    str += "ay";
                else
                    str += "ai";
                break;
            case "o":
            case "oː":
                str += "o";
                break;
            case "u":
            case "uː":
                if ((segment.LMEValue == "ɛu̯" || segment.LMEValue == "iu̯") && segment.relIdx(1).type != "consonant")
                    str += "ew";
                else if (segment.LMEValue == "øː" || segment.LMEValue == "ɛu̯" || segment.LMEValue == "iu̯")
                    str += "eu";
                else
                    str += "oo";
                break;
            case "ʏ":
            case "øː":
                str += "ui";
                break;
            case "oɪ̯":
                if (segment.relIdx(1).type == "consonant" && !addE && !(word.sSuffix && segment.ctxMatch("_z,#")))
                    str += "oi";
                else
                    str += "oy";
                break;
            case "ɑː":
                if (segment.LMEValue == "aː" && segment.relIdx(1).value != "ɫ")
                    str += "a";
                else if (segment.relIdx(1).type == "consonant" && !addE && segment.relIdx(1).value != "k" && !(word.sSuffix && segment.ctxMatch("_z,#")))
                    str += "au";
                else
                    str += "aw";
                break;
            case "ʌu̯":
                str += "ow";
                break;
            case "ɪ":
                if (word.sSuffix && segment.negIdx == -2)
                    str += "e";
                else
                    str += "i";
                break;
            case "ɛ":
            case "ɛː":
                str += "e";
                break;
            case "a":
            case "aː":
                str += "a";
                break;
            case "ɔ":
            case "ɔː":
                str += "o";
                break;
            case "ʌ":
                if (segment.EModEValue == "ɪ")
                    str += "i";
                else
                    str += "u";
                break;
            case "ə":
                if (segment.stressed || (segment.inSuffix && word.partOfSpeech != "pastPtcp") || (segment.LMEValue == "ɪ" && segment.relIdx(1).value == "n" && segment.idx > word.stressedVowel.idx)) {
                    str += "i";
                } else if (
                    segment.ctxMatch("C_ɫ,C/#") && !segment.relIdx(-1).match("v", "l", "ɾ", "θ", "t͡ʃ", "ʃ", "d͡ʒ", "j", "w")
                    && !(str.at(-1) == "s" && str.at(-2) != "s")
                    && !(segment.relIdx(2).type == "consonant" && segment.relIdx(3).type != "vowel" && !(segment.negIdx == -3 && word.sSuffix))
                ) {
                    str += "le";
                    i++;
                } else if (segment.idx == 0 && (segment.relIdx(1).stressed || (segment.ctxMatch("_k,n") && segment.relIdx(2).stressed))) {
                    str += "a";
                } else if (segment.LMEValue == "øː" || segment.LMEValue == "ɔ" || (segment.relIdx(1).match("m", "p", "b", "k") && !segment.relIdx(1).stressed)) {
                    str += "o";
                } else {
                    str += "e";
                }
                break;
            case "b":
                if (doubleCons)
                    str += "bb";
                else
                    str += "b";
                break;
            case "t͡ʃ":
                if (segment.relIdx(-1).match(...shortVowels) && segment.relIdx(-1).stressed)
                    str += "tch";
                else
                    str += "ch";
                break;
            case "x":
            case "ç":
                if (segment.relIdx(1).value == "j")
                    str += "h";
                else
                    str += "ch";
                break;
            case "d":
                if (doubleCons)
                    str += "dd";
                else
                    str += "d";
                break;
            case "f":
                if (segment.relIdx(-1).match(...shortVowels) && segment.relIdx(-1).stressed && (segment.relIdx(1).type != "consonant" || (word.sSuffix && segment.negIdx == -2) || addE))
                    str += "ff";
                else
                    str += "f";
                break;
            case "g":
                if (doubleCons)
                    str += "gg";
                else
                    str += "g";
                break;
            case "h":
                str += "h";
                break;
            case "d͡ʒ":
            case "ʒ":
                if (segment.relIdx(-1).match(...shortVowels))
                    str += "dg";
                else
                    str += "g";
                break;
            case "k":
                if (segment.relIdx(1).value == "s" && !(segment.negIdx == -2 && word.sSuffix)) {
                    str += "x";
                    i++;
                } else if (segment.relIdx(1).value == "w") {
                    str += "qu";
                    i++;
                } else if (segment.relIdx(-1).match(...shortVowels) && !segment.stressed && (segment.ctxMatch("_s/n/ɫ/h/V/#") || addE)) {
                    str += "ck";
                } else if (
                    segment.relIdx(1).match("e", "eː", "ɛ", "ɛː", "i", "iː", "ɪ", "əi̯", "aɪ̯", "ɚ", "ɫ̩", "n̩", "j", "n", "h")
                    || (segment.relIdx(1).value == "ə" && (segment.stressed || !segment.relIdx(2).match("m", "p", "b", "k")))
                    || segment.negIdx == -1 || (segment.negIdx == -2 && word.sSuffix)
                ) {
                    str += "k";
                } else {
                    str += "c";
                }
                break;
            case "ɫ":
                if (segment.droppedD)
                    str += "ld";
                else if (segment.relIdx(-1).match(...shortVowels) && segment.relIdx(-1).stressed && (segment.ctxMatch("_z/V/#") || addE))
                    str += "ll";
                else
                    str += "l";
                break;
            case "m":
                if (doubleCons)
                    str += "mm";
                else
                    str += "m";
                break;
            case "n":
                if (segment.droppedD && segment.relIdx(-1).stressed && (segment.relIdx(1).type != "vowel" || segment.relIdx(1).inSuffix))
                    str += "nd";
                else if (segment.droppedK)
                    str += "kn";
                else if (segment.droppedG)
                    str += "gn";
                else if (doubleCons)
                    str += "nn";
                else
                    str += "n";
                break;
            case "ŋ":
                if (segment.relIdx(1).value == "k")
                    str += "n";
                else
                    str += "ng";
                break;
            case "p":
                if (doubleCons)
                    str += "pp";
                else
                    str += "p";
                break;
            case "ɾ":
                if (segment.droppedW)
                    str += "wr";
                else if (doubleCons)
                    str += "rr";
                else
                    str += "r";
                break;
            case "s":
                if (segment.relIdx(-1).match(...shortVowels) && !segment.stressed && (segment.relIdx(1).type != "consonant" || addE))
                    str += "ss";
                else if (segment.relIdx(-1).value == "əi̯" && (segment.relIdx(1).value == "ə" || addE))
                    str += "c";
                else
                    str += "s";
                break;
            case "ʃ":
                if (segment.relIdx(-1).value == "n")
                    str += "ch";
                else
                    str += "sh";
                break;
            case "t":
                if (segment.relIdx(1).value == "θ")
                    break;
                else if (doubleCons)
                    str += "tt";
                else
                    str += "t";
                break;
            case "θ":
            case "ð":
                str += "th";
                break;
            case "v":
                str += "v";
                break;
            case "w":
                str += "w";
                break;
            case "xʷ":
                str += "wh";
                break;
            case "j":
                if (!(segment.relIdx(1).match("u", "uː") && !segment.LMEValue))
                    str += "y";
                break;
            case "z":
                if (segment.relIdx(-1).match(...shortVowels) && segment.relIdx(-1).stressed && (segment.relIdx(1).type != "consonant" || addE))
                    str += "zz";
                else
                    str += "s";
                break;
        }
        if (addE)
            str += "e";
    }

    return str;
}