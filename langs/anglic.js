function getIPA_OE() {
    let charToPhoneme = {
        "a": "ɑ",
        "ā": "ɑː",
        "b": "b",
        "c": "k",
        "ċ": "t͡ʃ",
        "ċċ": "t,t͡ʃ",
        "cg": "ɣ,ɣ",
        "ċġ": "j,j",
        "d": "d",
        "e": "e",
        "ē": "eː",
        "ea": "æɑ̯",
        "ēa": "æːɑ̯",
        "eo": "eo̯",
        "ēo": "eːo̯",
        "f": "f",
        "g": "ɣ",
        "ġ": "j",
        "h": "h",
        "i": "i",
        "ī": "iː",
        "ie": "iy̯",
        "īe": "iːy̯",
        "l": "l",
        "m": "m",
        "n": "n",
        "o": "o",
        "ō": "oː",
        "p": "p",
        "r": "r",
        "s": "s",
        "sċ": "ʃ,ʃ",
        "t": "t",
        "u": "u",
        "ū": "uː",
        "w": "w",
        "x": "k,s",
        "y": "y",
        "ȳ": "yː",
        "þ": "θ",
        "æ": "æ",
        "ǣ": "æː",
    };

    for (let i = 0; i < wordArg.length; i++) {
        let phonemes;
        let digraphPair = charToPhoneme[wordArg[i] + wordArg[i + 1]];
        if (digraphPair) {
            phonemes = digraphPair;
            i++;
        } else {
            phonemes = charToPhoneme[wordArg[i]];
        }
        phonemes.split(",").forEach(phoneme => word.insert(phoneme, word.length));
    }

    let stressedVowel = word.vowels.atIdx(stressArg - 1);
    stressedVowel.stressed = true;
    let onsetClusters = [
        "sp", "st", "sk", "spl", "pl", "kl", "bl", "ɣl", "fl", "hl", "sl", "wl",
        "spr", "str", "skr", "ʃr", "pr", "tr", "kr", "br", "dr", "ɣr", "fr", "θr", "hr", "wr",
        "tw", "kw", "dw", "θw", "hw", "sw", "sm", "kn", "ɣn", "fn", "hn", "sn"
    ];
    if (stressedVowel.ctxMatch("C_"))
        stressedVowel.relIdx(-1).stressed = true;
    if (onsetClusters.includes(stressedVowel.relIdx(-2).value + stressedVowel.relIdx(-1).value))
        stressedVowel.relIdx(-2).stressed = true;
    if (onsetClusters.includes(stressedVowel.relIdx(-3).value + stressedVowel.relIdx(-2).value + stressedVowel.relIdx(-1).value))
        stressedVowel.relIdx(-3).stressed = true;
    if (word.vowels.atIdx(0).stressed)
        word.replace("C", "[stressed]", "", segment => segment.idx < word.vowels.atIdx(0).idx);

    //Allophones

    word.replace("ɣ", "g", "n/#_");
    word.replace("ɣ[stressed]", "g");
    word.replaceSeq("ɣ,ɣ", "g,g");
    word.replace("n", "ŋ", "_k/g");
    word.replace("l r", "ɫ rˠ", "_C");
    word.replace("l", "ɫ", "ɫ_");
    word.replace("r", "rˠ", "rˠ_");
    word.replaceSeq("h,l", "l̥");
    word.replaceSeq("h,n", "n̥");
    word.replaceSeq("h,r", "r̥");
    word.replaceSeq("h,w", "ʍ");
    word.replace("h", "x", "ɑ/ɑː/o/oː/u/uː/æɑ̯/æːɑ̯/eo̯/eːo̯/x_");
    word.replace("h", "x", "ɫ/rˠ_C/#");
    word.replace("h", "ç", "æ/æː/e/eː/i/iː/y/yː/iy̯/iːy̯/ç_");
    word.replace("x/ç", "h", "_V[stressed]");
    word.replace("ɑ[stressed]", "ɒ", "_m/n/ŋ");
    word.replaceSeq("j,j", "d,d͡ʒ");
    word.replace("j", "d͡ʒ", "n_", segment => segment.idx > stressedVowel.idx);

    let voicedConsonants = "b/d/ɣ/j/l/ɫ/m/n/r/rˠ/w";
    word.replace("f θ s", "v ð z", `V/${voicedConsonants}_V/${voicedConsonants}`, segment => segment.prevVowel().stressed);
    word.replace("f θ s", "v ð z", `V_${voicedConsonants}`, segment => !segment.stressed);

    word.remove("C", "_C", segment =>
        segment.match("C", "_C") && (segment.value == segment.relIdx(1).value[0] || (segment.match("r/rˠ", "_r/rˠ")))
        && !segment.ctxMatch("V_C,V") && !onsetClusters.includes(segment.relIdx(1).value + segment.relIdx(2).value)
    );
    word.remove("ʃ", "_ʃ", segment => !segment.ctxMatch("V_ʃ,V[!stressed]"));

    addRow("OE", "Late Old English", "900", getSpellingFromArg_OE(), word);
}

function OE_to_EME(variety) {
    word = outcomes.OE.duplicate();

    word.replace("θ", "s", "_s");
    word.remove("s", "_s", segment => !segment.ctxMatch("V_s,V/l"));

    word.replace("x", "k", "_s");
    word.replace("ç", "k", "_s");

    word.replace("ɣ", "x", "_p/t/k/t͡ʃ/f/θ/s/ʃ/#");

    word.forEach(segment => {
        if (segment.match("n", "_d[!stressed],C[stressed]")) {
            segment.relIdx(1).remove();
            if (segment.relIdx(-1).match("ɑ"))
                segment.relIdx(-1).value = "o";
        }
    });

    word.replace("d", "t", "_θ/s");

    word.remove("h[!stressed]", "C_");

    word.forEach(segment => {
        if (segment.match("V") && segment.idx > word.stressedVowel.idx) {
            switch (word.partOfSpeech) {
                case "conjVerb":
                    if (segment.ctxMatch("_θ"))
                        segment.inSuffix = true;
                case "pastPtcp":
                    if (segment.ctxMatch("_d"))
                        segment.inSuffix = true;
                case "inf":
                    if (segment.ctxMatch("_n,#"))
                        segment.inSuffix = true;
                default:
                    if (segment.ctxMatch("_s,#"))
                        segment.inSuffix = true;
            }
        }
    });

    word.replace("iy̯", "y");
    word.replace("iːy̯", "yː");

    word.replace("l̥", "l");
    word.replace("n̥", "n");
    word.replace("r̥", "r");

    if (variety != "northumbrian") {
        word.insert("d", "n_{l/ɫ/r/rˠ}[!stressed]");
        word.insert("b", "m_{l/ɫ/r/rˠ}[!stressed]");
    }

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);
        if (segment.match("m/n/l/ɫ/r/rˠ", "#/C_C/#") && (!segment.ctxMatch("ɫ/rˠ/j/w_") || segment.match("r", "ɫ_")) && !segment.match("n", "m_")) {
            word.insert("ə", segment.idx);
        }
    }
    word.replace("j", "iː[type=vowel]", "#/C_C/#");

    if (variety != "northumbrian")
        word.replace("e/eo̯/ø/y/o", "u", "w_r/rˠ");

    word.replace("æɑ̯ æːɑ̯ eo̯ eːo̯", "æ æː ø øː");

    word.replace("ø øː y yː", "e eː i iː");

    word.replace("ɒ", "ɑ");

    //Homorganic lengthening
    word.forEach(segment => {
        if (variety == "northumbrian") {
            if (segment.match("V[stressed]") && !segment.value.includes("ː")) {
                if (segment.match("ɑ/æ/e/i", "_ɫ,d") || segment.match("ɑ", "_m,b") || segment.match("æ/e/o", "_rˠ,d")) {
                    segment.value = segment.value.slice(0, 1) + "ː" + segment.value.slice(1);
                    segment.lengthened = true;
                }
            }
        } else {
            let lengtheningClusters = ["ɫd", "mb", "nd", "ŋg", "rˠd", "rˠn", "rˠz", "rˠð"];

            if (segment.match("V[stressed]") && !segment.value.includes("ː") && lengtheningClusters.includes(segment.relIdx(1).value + segment.relIdx(2).value)) {
                segment.value = segment.value.slice(0, 1) + "ː" + segment.value.slice(1);
                segment.lengthened = true;
            }
        }
    });

    //Early pre-cluster shortening
    word.forEach(segment => {
        if (segment.value[1] == "ː" && segment.ctxMatch("_C,C") && (segment.relIdx(3).match("C") || segment.idx < word.vowels.atIdx(-2).idx))
            segment.value = segment.value.slice(0, 1) + segment.value.slice(2);
    });

    word.replace("ɑː[!stressed]", "ɑ", "_[stressed]");
    word.replace("o", "ɑ", "_n/m/ŋ,[stressed]");
    word.remove("n/m/ŋ", "ɑ_C[stressed]");

    word.replace("æ/ɑ", "a");

    word.replace("æː", "ɛː");
    if (variety == "northumbrian")
        word.replace("ɑː", "aː");
    else
        word.replace("ɑː", "ɔː");

    word.replace("ç", "x", "a/x_");
    word.replace("x", "ç", "ɛː/e/eː/i/iː/ç_");

    word.replace("ɣ[!stressed]", "ʝ", "ɛː/e/eː/i/iː_");

    //Vowel reduction
    word.forEach(segment => {
        if (
            segment.match("V[!stressed]") && !segment.value.endsWith("ː")
            && ((segment.idx > word.stressedVowel.idx && !segment.ctxMatch("_j/w/ɣ/ʝ/x/ç")) || segment.match("e", "_C[stressed]/rˠ/V"))
            && !(segment.match("i", "_p"))
        )
            segment.value = "ə";
    });
    word.replace("ə", "i", "_{t͡ʃ/ʃ/ç/ŋ}[!stressed]");
    word.replace("e[!stressed]", "i", "_j/ɣ/ç");
    word.replace("u[!stressed]", "o", "_w/ɣ/x");
    word.remove("ə", "ə_");
    word.forEach(segment => {
        if (segment.match("ə", "#/C,j_") && (segment.idx < word.stressedVowel.idx || segment.relIdx(-2).value != "rˠ") && segment != word.vowels.atIdx(-1)) {
            segment.value = "i";
            segment.relIdx(-1).remove();
            if (segment.ctxMatch("V_"))
                segment.remove();
        }

        if (segment.match("ə", "_n") && ["conjVerb", "pastPtcp", "inf"].includes(word.partOfSpeech) && segment.idx > word.stressedVowel.idx)
            segment.inSuffix = true;
    });

    word.replace("ɛː/eː", "e", "_j[!stressed]", segment => !(variety == "northumbrian" && segment.ctxMatch("_j,V")));
    word.replaceSeq("i/iː,j[!stressed]", "iː");
    word.replaceSeq("u/uː,w[!stressed]", "uː");

    addRow("EME", (variety == "northumbrian") ? "Early Northumbrian Middle English" : "Early Middle English", "1200", getSpelling_EME(), word, true);
}

function EME_to_LME(variety) {
    word = outcomes.EME.duplicate();

    if (variety == "scots") {
        word.replace("a", "e", "_s/ʃ");

        word.replace("e", "a", "_ɫ,ɣ");
    }

    word.replace("oː", "o", "_w", segment => !segment.match("[!stressed]", "_[stressed]"));

    word.replace("ʝ", "j");
    word.replace("ɣ", "w");

    word.forEach(segment => {
        if (segment.match("i/iː", "_j") && !segment.relIdx(2).stressed) {
            segment.value = "iː";
            segment.relIdx(1).remove();
        }
    });

    //Delete short unstressed vowel between short vowel + liquid and consonant
    word.forEach(segment => {
        if (
            segment.match("V[!stressed][!inSuffix]", "V,l/r_C[!=j/w]") && !segment.value.includes("ː")
            && !segment.relIdx(-2).value.includes("ː") && !segment.ctxMatch("_m/n/ŋ,p/t/t͡ʃ/k/b/d/d͡ʒ/g")
            && !segment.ctxMatch("l_l/ɫ") && !segment.ctxMatch("l/r_r/rˠ")
        ) {
            if (segment.relIdx(-1).match("l"))
                segment.relIdx(-1).value = "ɫ";
            else if (segment.relIdx(-1).match("r"))
                segment.relIdx(-1).value = "rˠ";
            segment.remove();
        }
    });

    word.forEach(segment => {
        if (segment.match("V") && segment.idx > word.stressedVowel.idx) {
            switch (word.partOfSpeech) {
                case "conjVerb":
                    if (segment.ctxMatch("_θ"))
                        segment.inSuffix = true;
                case "pastPtcp":
                    if (segment.ctxMatch("_d"))
                        segment.inSuffix = true;
                case "inf":
                    if (segment.ctxMatch("_n,#"))
                        segment.inSuffix = true;
                default:
                    if (segment.ctxMatch("_s") && segment == word.vowels.atIdx(-1))
                        segment.inSuffix = true;
            }
        }
    });

    word.replace("ʍ", "w", "V_");

    //Drop schwa between vowel and consonant, except in inflectional suffixes
    word.remove("ə[!inSuffix]", "V_C[!stressed]");
    word.remove("ə[!inSuffix]", "V,j/w_C[!stressed]");

    word.insert("ə", "V,w_{r/rˠ}[!stressed]");

    word.remove("x", "C_C");

    word.replace("θ", "t", "f/s/ʃ/ç/x_");

    word.replace("t", "s", "_s");

    //Loss of [v] before most consonants
    word.forEach(segment => {
        if (segment.match("v", "_C[!=l/r/n/j]"))
            segment.value = segment.relIdx(1).value[0];
    });
    word.remove("C", "", segment =>
        segment.value == segment.relIdx(1).value && !segment.ctxMatch("V_C,V") && !segment.ctxMatch("_p/t/k/b/d/g,r") && !segment.ctxMatch("_p/k/b/g,l")
    );
    word.remove("w", "w_");

    word.replace("oː", "o", "_x,C");

    if (variety == "scots") {
        word.insert("w", "a/aː_x");
    } else {
        word.insert("j", "ɛː/e/eː_ç");
        word.insert("w", "a/aː/ɔː/o/oː_x");
    }

    //Middle English diphthong development
    word.replace("a/aː e/ɛː i/iː o/ɔː/oː u/uː", "ai̯ ɛi̯ iː ɔi̯ ui̯", "_j[!stressed]");
    word.replace("a/aː e/ɛː eː i/iː o/ɔː u/uː", "au̯ ɛu̯ eu̯ iu̯ ɔu̯ uː", "_w[!stressed]");
    if (variety != "scots") {
        word.replace("eː", "ei̯", "_j[!stressed]");
        word.replace("oː", "ou̯", "_w[!stressed]");
    }
    word.remove("{j/w}[!stressed]", "V_");

    word.replace("ei̯ ou̯ eu̯", "iː uː iu̯");

    if (variety == "scots")
        word.replace("eː", "i", "_ç");

    //Elision of medial schwa
    word.forEach(segment => {
        if (
            segment.match("ə", "C_C") && (segment.relIdx(-2).match("V") || segment.relIdx(-2).value == segment.relIdx(-1).value)
            && (segment.relIdx(2).match("V/j") || segment.relIdx(2).value == segment.relIdx(1).value) && !segment.ctxMatch("_C[!=s],ə,#")
            && !segment.relIdx(2).match("{ə/i}[inSuffix]") && !segment.ctxMatch("ʍ_") && !segment.ctxMatch("t͡ʃ_s")
        ) {
            if (segment.relIdx(-1).value == segment.relIdx(-2).value)
                segment.relIdx(-1).remove();
            if (segment.relIdx(1).value == segment.relIdx(2).value)
                segment.relIdx(1).remove();
            segment.remove();
        }
    });
    word.insert("p", "m_t/s");
    if (variety != "scots") {
        word.insert("b", "m_ɫ/l/r/r");
        word.insert("d", "ɫ/n_r/rˠ");
        word.insert("b", "V/rˠ/m,m_ə,l/ɫ");
        word.remove("m", "m_b");
    }
    word.replace("s", "z", "b/d/g/v/ð_");
    word.replace("z", "s", "_p/t/k/t͡ʃ/f/θ/s");

    word.forEach(segment => {
        if (segment.match("b", "m_") && (segment.ctxMatch("_C[!=l/r]/V[inSuffix]/#") || segment.ctxMatch("_V,#"))) {
            segment.relIdx(-1).droppedB = true;
            segment.remove();
        }

        if (segment.match("n", "m_") && (segment.ctxMatch("_C[!=l/r]/V[inSuffix]/#") || segment.ctxMatch("_V,#"))) {
            segment.value = "m";
            segment.droppedN = true;
            if (segment.ctxMatch("_C/#"))
                segment.relIdx(-1).remove();
        }
    });

    //Trisyllabic laxing and open syllable lengthening
    word.forEach(segment => {
        if (segment.match("V") && segment.idx < word.vowels.atIdx(-2).idx && !segment.ctxMatch("_V/j/w")) {
            if (segment.value.endsWith("ː"))
                segment.value = segment.value[0];
            word.replace("ɛ", "e");
            word.replace("ɔ", "o");
        } else if (segment.match("V[stressed]") && (segment.ctxMatch("_C,V") || segment.ctxMatch("_V/#"))) {
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
    word.replace("aː ɛː/eː iː ɔː/oː uː", "a e i o u", "_C[!=j/w],C", segment =>
        !segment.ctxMatch("_s,t") && !segment.ctxMatch("_ɫ/n,d") && !segment.match("oː", "_rˠ,d") && !(variety == "scots" && segment.ctxMatch("_rˠ"))
    );

    //Homorganic lengthening reversed in some cases
    word.replace("{ɛː/eː}[lengthened]", "e", "_n,d");
    word.replace("{ɔː/oː}[lengthened]", "o", "_ɫ/n,d");
    word.replace("uː[lengthened]", "u", "_ɫ,d");
    word.replace("uː[lengthened]", "u", "_m,b");

    //Early Scots vowel developments
    if (variety == "scots") {
        word.replace("oː", "øː");

        word.replaceSeq("eː,j[!stressed]", "ei̯");
        word.replaceSeq("øː,w[!stressed]", "yu̯");

        word.replace("ei̯", "eː");
        word.replace("yu̯", "iu̯");

        word.replace("a", "aː", "_rˠ,C");
        word.replace("aː", "a", "_rˠ,rˠ");
    }

    word.replace("d", "ð", "[!=d/n/ɫ]_ə,r/rˠ");

    word.replace("eː", "ɛː", "_r/rˠ");

    if (variety != "scots")
        word.replaceSeq("s,w", "s[droppedW]", "_ɔː/ɔu̯/o/oː/u/uː");

    //Fricative voicing after unstressed vowels
    if (variety != "scots")
        word.replace("f θ s", "v ð z", "V[!stressed]_V[!stressed]/#");

    if (word.endMatch("ə,z/s"))
        word.sSuffix = true;

    //Degemination
    word.forEach(segment => {
        if (segment.match("C") && segment.idx < word.length - 1 && (segment.value == segment.relIdx(1).value[0] || segment.value == segment.relIdx(1).value)) {
            segment.relIdx(1).degeminated = true;
            segment.remove();
        }
    });

    word.replace("f", "s", "#_n");
    word.replace("f[stressed]", "s", "_n");

    word.replace("ai̯/ɛi̯ au̯", "æi̯ ɑu̯");
    word.replace("o", "ɔ");

    word.forEach(segment => {
        if (segment.match("C", "_[unstressed]"))
            segment.stressed = false;

        if (segment.idx > word.stressedVowel.idx)
            segment.stressed = false;
    });

    if (word.endMatch("ə")) {
        word.atIdx(-1).remove();
        word.droppedE = true;
    }
    word.remove("ə", "_V");
    if (word.stressedVowel.ctxMatch("C_"))
        word.stressedVowel.relIdx(-1).stressed = true;

    word.replace("iː", "i", "_t͡ʃ");

    if (word.endMatch("i[!stressed],t͡ʃ")) {
        word.atIdx(-1).remove();
        word.droppedE = false;
    }

    word.remove("w", "_l");

    word.insert("ə", "iː[!stressed]_r/rˠ");

    word.replace("iː[!stressed][!inSuffix]", "i", "_C/V");

    word.forEach(segment => {
        if (segment.match("m/n/l/r", "C_C/#") && !segment.match("m/n/l", "ɫ/rˠ_"))
            word.insert("ə", segment.idx);

        if (segment.match("j", "_C/#")) {
            if (segment.ctxMatch("_C,C/#"))
                segment.value = "i";
            else
                segment.value = "iː";
            segment.type = "vowel";
        }
    });
    word.replace("w/ʍ", "ɔu̯[type=vowel]", "_C[!=r]/#");
    if (variety != "scots")
        word.replace("x", "ɔu̯[type=vowel]", "C_#");
    word.remove("h", "_C/#");

    word.replace("j[!stressed]", "i[type=vowel]", "C_");

    word.replace("l r", "ɫ rˠ", "_C/#");
    word.replace("ɫ rˠ", "l r", "_V");

    if (variety == "scots") {
        if (word.endMatch("ə,d,ə,s,t")) {
            word.atIdx(-3).remove();
            word.atIdx(-2).remove();
            word.atIdx(-1).remove();
        }

        word.replace("d", "t", "V[!stressed]_#");

        if (word.partOfSpeech == "conjVerb" && !word.vowels.atIdx(-1).stressed) {
            if (word.endMatch("θ")) {
                word.atIdx(-1).value = "s";
                word.sSuffix = true;
            }

            if (word.endMatch("s,t")) {
                word.atIdx(-1).remove();
                word.sSuffix = true;
            }
        }

        word.forEach(segment => {
            if (segment.match("ʃ[!stressed]") && !segment.prevVowel().stressed) {
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
        if ((word.partOfSpeech == "inf" || word.partOfSpeech == "conjVerb") && word.endMatch("ɪ,n")) {
            word.atIdx(-2).remove();
            word.atIdx(-1).remove();
            word.droppedE = true;

            if (word.endMatch("C,m/n/l/r") && !word.endMatch("ɫ/rˠ,m/n/l") && !word.endMatch("m,n"))
                word.insert("ə", word.length - 1);

            if (word.endMatch("w")) {
                word.atIdx(-1).value = "ɔu̯";
                word.atIdx(-1).type = "vowel";
            }
        } else if (word.partOfSpeech == "inf" && word.endMatch("n") && word.atIdx(-2).value.length > 1) {
            word.atIdx(-1).remove();
            word.droppedE = true;
        }

        word.remove("b", "m_");
        word.remove("g", "ŋ_");

        word.replace("ŋ", "n", "_C[!=k/l/ɾ]");

        word.replace("ŋ", "n[ing]", "_#", segment => !segment.prevVowel().stressed);
    }

    if (variety == "scots")
        addRow("LME", "Early Scots", "1400", getSpelling_ESc(), word);
    else
        addRow("LME", "Late Middle English", "1400", getSpelling_LME(), word);
}

function LME_to_EModE(variety) {
    word = outcomes.LME.duplicate();

    //Drop y- prefix from verbs and nouns
    if (word.partOfSpeech != "other")
        word.remove("i[!stressed]", "#_C[stressed]/V");

    if (word.partOfSpeech == "conjVerb" && variety != "scots")
        word.replaceSeq("ə,n,d", "i,ŋ,g", "_#");

    if (variety == "scots" && word.endMatch("n,d") && !word.vowels.atIdx(-1).stressed)
        word.replaceSeq("n,d", "n[droppedD]", "_#");

    word.replace("ɔ", "a", "_n,d");

    if (variety != "scots")
        word.replace("u", "ɔ", "_ɫ,t/d/n");

    word.replace("ʍ", "h", "_ɔː/oː/uː");

    word.replace("e", "i", "_n,d͡ʒ");

    word.replace("ð", "d", "_l");
    word.replace("ð", "d", "_ə,ɫ");

    word.replace("i", "iː", "_V[!inSuffix]");

    word.replace("e[!stressed]", "i");
    if (variety == "scots")
        word.replace("i", "ɪ", "_C");

    //Reduction of vowels in prefixes
    word.forEach(segment => {
        if (segment.match("V[!stressed]", "_[stressed]")) {
            if (segment.ctxMatch("_V")) {
                segment.relIdx(-1).stressed = true;
                if (segment == word.vowels.atIdx(0))
                    for (let i = segment.idx; i >= 0; i--)
                        word.atIdx(i).stressed = true;
                segment.remove();
            } else {
                segment.value = "ə";
            }
        }
    });

    if (variety == "scots")
        word.replace("ɔ", "a", "_m/p/b/f");

    word.replace("ɔu̯", "ɑu̯", "_x,t");

    //H-loss
    if (variety != "scots") {
        word.replace("i u", "iː uː", "_ç/x");
        word.replaceSeq("V,ç/x", "V[droppedH]");
    }

    //Loss of -en suffix
    if ((word.partOfSpeech == "inf" || word.partOfSpeech == "conjVerb") && word.endMatch("ə,n")) {
        word.atIdx(-2).remove();
        word.atIdx(-1).remove();
        word.droppedE = true;

        if (word.endMatch("C,m/n/l/r") && !word.endMatch("ɫ/rˠ,m/n/l") && !word.endMatch("m,n"))
            word.insert("ə", word.length - 1);

        if (word.endMatch("w")) {
            word.atIdx(-1).value = "ɔu̯";
            word.atIdx(-1).type = "vowel";
        }
    } else if (word.partOfSpeech == "inf" && word.endMatch("V,n") && word.atIdx(-2).value.length > 1) {
        word.atIdx(-1).remove();
        word.droppedE = true;
    }

    word.remove("ə", "V_n,V/#", segment => segment.relIdx(-1).value.length > 1);
    word.remove("{ə/ɪ}[!stressed]", "V,r_n,#");
    word.replace("r", "rˠ", "_C/#");
    word.replace("i", "iː", "_V/#");

    if (word.partOfSpeech == "conjVerb" && word.endMatch("V[!stressed],ð")) {
        word.thVerb = true;
        word.atIdx(-1).value = "z";
        word.sSuffix = true;
    }
    if (word.partOfSpeech == "conjVerb" && word.endMatch("C,θ")) {
        word.thVerb = true;
        word.insert("ə", -1);
        word.atIdx(-1).value = "z";
        word.sSuffix = true;
    }

    if (variety == "scots" && word.sSuffix && word.endMatch("s"))
        word.atIdx(-1).value = "z";

    //Loss of vowel in -es and -ed suffixes
    if (word.sSuffix && word.endMatch("V/C[!=s/z/ʃ/t͡ʃ/d͡ʒ],{ə/ɪ}[!stressed],z"))
        word.atIdx(-2).remove();
    if ((word.partOfSpeech == "conjVerb" || word.partOfSpeech == "pastPtcp") && word.endMatch("V[!stressed],d/t")) {
        word.pastTense = true;
        if (word.endMatch("V/C[!=t/d],ə,d"))
            word.atIdx(-2).remove();
    }
    if (word.partOfSpeech == "pastPtcp" && word.endMatch("V,d/t"))
        word.pastTense = true;
    if (word.partOfSpeech == "conjVerb" && word.endMatch("V[!stressed],d,ə,s,t")) {
        word.conjPastTense = true;
        if (word.atIdx(-5).match("ə", "V/C[!=t/d]_"))
            word.atIdx(-5).remove();
    }
    if (word.partOfSpeech == "conjVerb" && word.endMatch("V[!stressed],d,ə,n")) {
        word.conjPastTense = true;
        if (word.atIdx(-4).match("ə", "V/C[!=t/d]_"))
            word.atIdx(-4).remove();
    }
    word.remove("h", "_C/#");
    word.replace("z", "s", "p/t/k/f/θ_");
    word.replace("d", "t", "p/k/t͡ʃ/f/θ/s/ʃ_");
    word.forEach(segment => {
        if (segment.match("m/n/l/r", "C_C/#") && !segment.match("m/n/l", "ɫ/rˠ_") && !segment.match("n", "m_"))
            word.insert("ə", segment.idx);
    });
    word.replace("j", "iː[type=vowel]", "_C,#");
    word.replace("w/ʍ", "ɔu̯[type=vowel]", "_C,#");
    word.replace("l r", "ɫ rˠ", "_C/#");
    word.replace("ɫ rˠ", "l r", "_V");

    word.sForm = word;

    if (word.conjPastTense)
        word.remove("ə", "_s,t,#");

    word.remove("n", "ɫ_C/#");

    if (variety == "scots")
        word.remove("v", "ɫ/rˠ_");
    word.replace("ɫ", "l", "_V");

    word.replace("e", "a", "_rˠ");
    if (variety == "scots")
        word.replace("e", "a", "_r");

    if (variety == "scots")
        word.replace("e", "a", "w/ʍ_");

    word.EModEWord = word.duplicate();


    if (variety == "scots")
        word.replace("r/rˠ", "ɾ");
    else
        word.replace("rˠ", "ɹ̠");

    //[ə] > [ɪ] frequently before coronal obstruents
    word.replace("ə", "ɪ", "_{t/d/θ/ð/s/z}[!stressed],C/#");

    //Vowel changes before /l/
    if (variety == "scots") {
        word.replace("aː", "ɑu̯", "_ɫ,d");
        word.replaceSeq("a,ɫ", "ɑu̯[droppedL]", "_C[!=j/w]/#");
        word.replaceSeq("ɔ,ɫ", "ɔu̯[droppedL]", "_C[!=j/w]/#");
        word.replaceSeq("u,ɫ", "uː[droppedL]", "_C[!=j/w]/#");
    } else {
        word.replace("a ɔ", "ɑu̯ ɔu̯", "_ɫ,t/d/t͡ʃ/d͡ʒ/s/z/ʃ/l/r/k/#");
        word.remove("ɫ", "ɑu̯/ɔu̯_k");
        word.remove("ɫ", "a/ɔ_f");
        word.remove("ɫ", "a_v");
        word.replaceSeq("a,ɫ", "ɑː", "_m");
        word.replaceSeq("ɔ,ɫ", "ɔː", "_m");
    }

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
    word.replace("aː", "ɛː", "", segment => !(variety == "scots" && segment.ctxMatch("w/ʍ_")));

    word.replace("æi̯", "ɛi̯");
    word.replace("ɑu̯", "ɔː");
    word.replace("ɔu̯", "ou̯");
    word.replace("iu̯", "ɪu̯");
    word.replace("ɛu̯", "ɪu̯");
    word.replace("ɔi̯", "oi̯");
    if (variety != "scots")
        word.replace("ui̯", "oi̯");

    if (variety == "scots")
        word.replace("ɔː/aː", "ɑː");

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

    //Convert -th verb suffix to -s
    if (word.thVerb) {
        word.sSuffix = true;
        word.EModEWord.sSuffix = true;
        word.atIdx(-1).value = word.sForm.atIdx(-1).value;
        word.EModEWord.atIdx(-1).value = word.sForm.atIdx(-1).value;
        if (word.atIdx(-2).match("ɪ") && word.sForm.atIdx(-2).value != "ə") {
            word.atIdx(-2).remove();
            word.EModEWord.atIdx(-2).remove();
        }
        if (word.atIdx(-3).match("C") && word.sForm.atIdx(-3).match("ə")) {
            word.insert("ə", -2);
            word.EModEWord.insert("ə", -2);
        }
        if (word.atIdx(-2).match("j") && word.sForm.atIdx(-2).match("iː")) {
            word.atIdx(-2).value = "əi̯";
            word.atIdx(-2).type = "vowel";
            word.EModEWord.atIdx(-2).value = "iː";
            word.EModEWord.atIdx(-2).type = "vowel";
        }
        if (word.atIdx(-2).match("w/ʍ") && word.sForm.atIdx(-2).match("ɔu̯")) {
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

    word.replaceSeq("w,ɹ̠/ɾ", ",[droppedW]");

    word.replace("ð", "θ", "V[!stressed]_#");

    word.forEach(segment => {
        if (segment.match("k/g", "_n")) {
            if (segment.ctxMatch("V_")) {
                segment.stressed = false;
            } else if (!segment.ctxMatch("ŋ/ɫ/ɹ̠/ɾ/s_") || segment.ctxMatch("_[stressed]")) {
                if (segment.ctxMatch("ŋ_"))
                    segment.relIdx(-1).value = "n";
                if (segment.match("k"))
                    segment.relIdx(1).droppedK = true;
                if (segment.match("g"))
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

    word.replace("p t k", "pʰ tʰ kʰ", "[!=s]_", segment => segment.stressed);

    //Foot-strut split
    word.replace("ʊ", "ʌ", "", segment => !segment.ctxMatch("pʰ/p/b/f/w_ʃ/l/ɫ"));

    word.remove("g", "ŋ_C[!=l/ɹ̠/w]/#");

    word.replace("a", "ɒ", "w/ʍ_C[!=k/g/ŋ]");

    word.replace("ɒ", "ɒː", "_f/θ/s");

    word.replace("a ɒ ɪ/ʌ/ɛ", "ɑː ɔː əː", "_ɹ̠,C/#");

    word.replace("a", "æ");

    word.replace("uː", "ʊ", "_k");

    word.replace("uː", "oː", "_ɹ̠");

    word.forEach(segment => {
        if (segment.match("ɪu̯")) {
            segment.value = "uː";
            if (!segment.ctxMatch("j/t͡ʃ/d͡ʒ/ʃ/ɹ̠/w_") && !segment.ctxMatch("pʰ/tʰ/kʰ/p/t/k/b/d/g,l_")) {
                word.insert("j", segment.idx);
                if (segment.stressed)
                    segment.relIdx(-1).stressed = true;
            }
        }
    });

    word.replace("h", "ç", "_j");

    word.replace("eː iː oː uː", "ɛə̯ ɪə̯ ɔə̯ ʊə̯", "_ɹ̠");
    word.insert("ə", "əi̯/əu̯/oi̯_ɹ̠,C/#");

    //"Happy" shortening & tensing
    word.replace("{əi̯/iː}[!stressed]", "i", "", segment => segment.ctxMatch("_#/V") || ((word.sSuffix || word.pastTense) && segment.ctxMatch("_C,#")));

    //Syllabic consonants
    word.forEach(segment => {
        if (segment.match("ə", "_m/n/ɫ,C/#")) {
            segment.value = segment.relIdx(1).value + "̩";
            segment.relIdx(1).remove();
        }
    });

    word.remove("t", "f/s_n̩/ɫ̩");

    word.replace("eː oː", "eɪ̯ oʊ̯");
    word.replace("əi̯ əu̯ oi̯", "aɪ̯ aʊ̯ ɔɪ̯");

    word.replace("ʍ", "w");

    word.replace("tʰ t d", "t̠ʰ t̠ d̠", "_ɹ̠");

    word.insert("ʔ", "V/n/ɫ/ɹ̠_{t/t͡ʃ}[!stressed],n̩/C/#");

    word.insert("ʔ", "#_V");
    word.replace("C", "[stressed]", "_V[stressed]");

    word.modernSpelling = getSpelling_ModE(word.EModEWord);
    outcomes.ModE = word.duplicate();
}

function ModE_to_UK() {
    word = outcomes.ModE.duplicate();

    //Non-rhoticity
    word.remove("ɹ̠", "V_C/#");

    word.replace("ɹ̠", "ɹ̠ʷ");

    word.replace("æ", "ɑː[trapBath]", "", segment => segment.ctxMatch("_f/θ/s") || segment.ctxMatch("_n,t͡ʃ/s"));

    word.replace("ɒː", "ɒ");

    word.replace("ɔə̯", "ɔː");

    word.replace("æ ɒ ɔː", "a ɔ oː");

    word.replace("oʊ̯ uː ʌ ʊ", "əʉ̯ ʊʉ̯ ɐ ɵ");

    word.replace("iː", "ɪi̯");

    word.replace("əʉ̯ ʊʉ̯", "ɒʊ̯ uː", "_ɫ");

    word.replace("ɛə̯ ɪə̯ ʊə̯", "ɛː ɪː oː");

    word.replace("eɪ̯ ɔɪ̯", "ɛɪ̯ oɪ̯");

    word.remove("j", "#/C,s_");
    word.remove("j[stressed]", "l_");

    addRow("UK", "Modern English (UK)", "", word.modernSpelling, word);
}

function ModE_to_US() {
    word = outcomes.ModE.duplicate();

    word.replace("ɒ", "ɒː", "_ŋ/g");
    word.replace("ɒː", "ɔː");

    word.replace("ɒ", "ɔː", "_ɹ̠");

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
    word.replace("æ ɜ", "ɛ ə", "_ɹ̠");
    word.replace("ɪə̯", "ɪ");
    word.replace("ʊə̯", "ə", "t͡ʃ/d͡ʒ/ʃ/j/n/l/ɹ̠_");
    word.replace("ʊə̯", "ɔ");
    word.replace("ɛ ɔ", "e o", "_ɹ̠");

    word.replaceSeq("ə,ɹ̠", "ɚ", "_C/#");
    word.replaceSeq("ə[stressed],ɹ̠", "ɚ");

    word.replaceSeq("ɹ̠", "ɚ̯", "ɑ/e/ɪ/o_C/#");

    word.replace("ɹ̠", "ɹ̠ʷ");

    //Weak vowel merger
    word.forEach(segment => {
        if (segment.match("{ə/ɪ}[!stressed]", "_[!=ŋ]")) {
            if (segment.ctxMatch("_C[!stressed],C/#")) {
                if (segment.ctxMatch("_m/n/ɫ")) {
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

    word.replace("i u", "iə̯ uə̯", "_ɫ,C/#");

    word.replace("æ", "ɛː", "_ŋ");

    addRow("US", "Modern English (US)", "", word.modernSpelling, word, true);
}

function UK_to_AU() {
    word = outcomes.UK.duplicate();

    word.forEach(segment => {
        if (segment.trapBath && segment.ctxMatch("_n"))
            segment.value = "a";
    });

    //Flapping
    word.replace("{t/d}[!stressed]", "ɾ", "V[!=m̩/n̩/ɫ̩]_V");

    word.remove("j[stressed]", "θ_");
    word.remove("j", "C,θ_");

    //Yod-coalescence
    word.replaceSeq("tʰ/t,j", "t͡ʃ");
    word.replaceSeq("d,j", "d͡ʒ");
    word.replaceSeq("s,j", "ʃ");
    word.replaceSeq("z,j", "ʒ");

    //Weak vowel merger
    word.forEach(segment => {
        if (segment.match("{ə/ɪ}[!stressed]", "_[!=ŋ]")) {
            if (segment.ctxMatch("_C[!stressed],C/#")) {
                if (segment.ctxMatch("_m/n/ɫ")) {
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

    word.replace("a ɛ ɪ ɵ", "æ e i u");
    word.replace("aɪ̯ ɛɪ̯ aʊ̯ əʉ̯", "ɑe̯ æɪ̯ æɔ̯ ɜʉ̯");
    word.replace("ɑː ɛː əː", "ɐː eː ɘː");
    word.replace("ə", "ɐ", "_#");
    word.replace("ɒʊ̯", "ɔʊ̯");
    word.replace("ɪi̯", "iː", "_ɫ");

    word.replace("æ æɔ̯", "ɛː ɛɔ̯", "_m/n/ŋ");

    word.replace("ɪː", "ɪə̯", "", segment => !segment.ctxMatch("_C,C/#"));

    addRow("AU", "Modern English (Australia)", "", word.modernSpelling, word, true);
}

function ModE_to_ModSc() {
    word = outcomes.ModE.duplicate();

    word.replace("øː", "ɪu̯", "_k/x");

    word.forEach(segment => {
        if (segment.match("ɪu̯")) {
            segment.value = "uː";
            if (!segment.ctxMatch("j/t͡ʃ/d͡ʒ/ʃ/ɾ/w_") && !segment.ctxMatch("p/t/k/b/d/g,l_")) {
                word.insert("j", segment.idx);
                if (segment.stressed)
                    segment.relIdx(-1).stressed = true;
            }
        }
    });

    word.replace("h", "ç", "_j");

    word.replace("{əi̯/iː}[!stressed]", "e", "", segment => segment.ctxMatch("_#/V") || ((word.sSuffix || word.pastTense) && segment.ctxMatch("_C,#")));

    //Scottish Vowel Length Rule
    word.forEach(segment => {
        if (segment.ctxMatch("_C") && !segment.ctxMatch("_v/ð/z/ɾ,V/#") && !(word.pastTense && segment.ctxMatch("_C,#")))
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
        else
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
    });

    word.replace("əːi̯", "ai̯");

    word.replace("ui̯", "əi̯");

    word.replace("ɛi̯", "əi̯", "", segment => segment.ctxMatch("_#") || segment.relIdx(1).inSuffix || (word.sSuffix && segment.ctxMatch("_C,#")));

    word.replace("ɛi̯", "eː");

    word.forEach(segment => {
        if (segment.match("d", "n_[!=ɾ]")) {
            segment.relIdx(-1).droppedD = true;
            segment.remove();
        }

        if (segment.match("d", "ɫ_") && (segment.ctxMatch("_#/V[inSuffix]") || (word.sSuffix && segment.ctxMatch("_C,#")))) {
            segment.relIdx(-1).droppedD = true;
            segment.remove();
        }
    });

    if (word.pastTense && word.atIdx(-2).match("ɪ") && !word.atIdx(-3).match("p/b/t/d/k/g")) {
        if (word.atIdx(-3).match("d͡ʒ/v/ð/z") || (word.vowels.atIdx(-2).stressed && word.atIdx(-3).match("m/n/ŋ/l/ɾ")))
            word.atIdx(-1).value = "d";
        word.atIdx(-2).remove();
    }
    word.replace("l", "ɫ", "_C/#");
    word.replace("ɫ", "l", "_V");

    word.forEach(segment => {
        if (segment.match("m/n/ɫ/ɾ", "C_C[!=j/w]/#") && !segment.match("m/n/ɫ", "ɫ/ɾ_") && !segment.match("n", "m_"))
            word.insert("ə", segment.idx);
    });
    word.replace("j w/ʍ", "iː[type=vowel] ou̯[type=vowel]", "_C,#");

    word.replace("ɪ", "ə", "_n", segment => segment.idx > word.stressedVowel.idx);

    word.remove("t", "f/s/ç/x_ə,n/ɫ");

    word.replace("l", "ɫ");

    word.replace("ʊ", "ʌ");
    word.replace("ou̯", "ʌu̯");

    word.replace("t͡ʃ d͡ʒ", "ʃ ʒ", "n_");

    word.replace("ai̯ oi̯", "aɪ̯ oɪ̯");

    word.replace("ɪ", "ʌ", "w/ʍ_");

    word.replace("ɪ", "ə", "_ɫ/ɾ");

    word.replace("ø", "ʏ");

    word.insert("ʔ", "V/n/ɫ/ɾ_{t/t͡ʃ}[!stressed],n̩/C[!=ɾ]/#");

    word.replace("ʌu̯[!stressed]", "e", "_C/#");

    word.replace("øː", "eː", "_#");

    addRow("scots", "Modern Scots", "", getSpelling_ModSc(word), word);
}

function getSpellingFromArg_OE() {
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
                if (segment.ctxMatch("_d͡ʒ"))
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
                if (segment.ctxMatch("_s")) {
                    str += "x";
                    i++;
                } else if (segment.ctxMatch("_w")) {
                    str += "qu";
                    i++;
                } else if (segment.ctxMatch("_e/ə/ɛː/eː/i/iː/ɛi̯/ɛu̯/iu̯/k/#") || segment.ctxMatch("k_")) {
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
                if (!segment.ctxMatch("_ʃ"))
                    str += "sch";
                break;
            case "t":
                if (segment.ctxMatch("_t͡ʃ"))
                    str += "c";
                else
                    str += "t";
                break;
            case "θ":
            case "ð":
                str += "þ";
                break;
            case "v":
                if (segment.ctxMatch("_C"))
                    str += "f";
                else
                    str += "v";
                break;
            case "w":
                str += "w";
                break;
            case "ʍ":
                str += "hw";
                break;
        }
    }

    return str.replaceAll("w", `<span class="nonHist">w</span>`).replace(/s$/, `<span class="nonHist">s</span>`);
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
                if (segment.ctxMatch("_C,V") || segment.ctxMatch("_V/#") || (word.droppedE && segment.ctxMatch("_C,#")))
                    str += "e";
                else
                    str += "ee";
                break;
            case "i":
            case "iː":
                if ((segment.ctxMatch("_#") && !word.droppedE) || segment.ctxMatch("_i") || (segment.ctxMatch("#_") && !segment.stressed))
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
                    segment.ctxMatch("_C,V") || segment.ctxMatch("_V/#") || (word.droppedE && segment.ctxMatch("_C,#"))
                    || segment.ctxMatch("_ɫ/rˠ,d") || (segment.ctxMatch("_m[droppedB]") || (segment.ctxMatch("_m,b")))
                )
                    str += "o";
                else
                    str += "oo";
                break;
            case "u":
                if (segment.ctxMatch("w/v/s[droppedW]_") || segment.ctxMatch("_m/n/ŋ/v"))
                    str += "o";
                else
                    str += "u";
                break;
            case "uː":
            case "ɔu̯":
                if (segment.ctxMatch("_C"))
                    str += "ou";
                else
                    str += "ow";
                break;
            case "ɑu̯":
                if (segment.ctxMatch("_C"))
                    str += "au";
                else
                    str += "aw";
                break;
            case "æi̯":
                if (segment.EMEValue == "a")
                    str += "a";
                else
                    str += "e";
                if (segment.ctxMatch("_C"))
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
                if (segment.ctxMatch("_C"))
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
                if (segment.ctxMatch("_s")) {
                    str += "x";
                    i++;
                } else if (segment.ctxMatch("_w")) {
                    str += "qu";
                    i++;
                } else if (segment.degeminated) {
                    str += "ck";
                } else if (segment.ctxMatch("_e/ə/ɛː/eː/i/iː/ɛu̯/iu̯/æi̯[EMEValue!=a]/j/n/#")) {
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
                if (segment.ctxMatch("_C"))
                    str += "e";
                break;
            case "w":
                str += "w";
                break;
            case "ʍ":
                str += "wh";
                break;
            case "j":
                if (segment.ctxMatch("C_") && !segment.stressed)
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
                if (segment.ctxMatch("_C,V") || segment.ctxMatch("_ɫ/V/#") || (word.droppedE && segment.ctxMatch("_C,#")))
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
                if (segment.ctxMatch("_C,V") || segment.ctxMatch("_V/#") || (word.droppedE && segment.ctxMatch("_C,#")))
                    str += "e";
                else
                    str += "ei";
                break;
            case "ɪ":
            case "iː":
            case "i":
                if ((segment.ctxMatch("_#") && !word.droppedE) || segment.ctxMatch("_ɪ"))
                    str += "y";
                else
                    str += "i";
                break;
            case "ɔ":
                str += "o";
                break;
            case "ɔː":
                if (segment.ctxMatch("_C,V") || segment.ctxMatch("_V/#") || (word.droppedE && segment.ctxMatch("_C,#")))
                    str += "o";
                else
                    str += "oo";
                break;
            case "u":
                if (segment.ctxMatch("w/v/s[droppedW]_") || segment.ctxMatch("_m/n/ŋ"))
                    str += "o";
                else
                    str += "u";
                break;
            case "øː":
                if (segment.ctxMatch("_C,V") || segment.ctxMatch("_V/#") || (word.droppedE && segment.ctxMatch("_C,#")))
                    str += "u";
                else
                    str += "ui";
                break;
            case "uː":
            case "ɔu̯":
                if (segment.ctxMatch("_C"))
                    str += "ou";
                else
                    str += "ow";
                break;
            case "ɑu̯":
                if (segment.ctxMatch("_C"))
                    str += "au";
                else
                    str += "aw";
                break;
            case "æi̯":
                if (segment.EMEValue == "a")
                    str += "a";
                else
                    str += "e";
                if (segment.ctxMatch("_C"))
                    str += "i";
                else
                    str += "y";
                break;
            case "ɛu̯":
            case "iu̯":
                if (segment.ctxMatch("_C"))
                    str += "eu";
                else
                    str += "ew";
                break;
            case "ɔi̯":
            case "ui̯":
                if (segment.ctxMatch("_C"))
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
                if (segment.ctxMatch("_s")) {
                    str += "x";
                    i++;
                } else if (segment.ctxMatch("_w")) {
                    str += "qu";
                    i++;
                } else if (segment.degeminated) {
                    str += "kk";
                } else if (segment.ctxMatch("_e/ə/ɛː/eː/ɪ/iː/ɛu̯/iu̯/æi̯[EMEValue!=a]/j/s/n/l/h/#")) {
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
                if (segment.ctxMatch("_k"))
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
                if (segment.match("v", "_C"))
                    str += "e";
                break;
            case "ʍ":
                str += "quh";
                break;
        }
    }

    if (word.droppedE && ((word.atIdx(-2).value.endsWith("ː") && word.endMatch("C")) || word.endMatch("C[degeminated][!=ʃ]")))
        str += "e";

    return str;
}

function getSpelling_EModE(word) {
    let laterWord = word;
    word = word.EModEWord;
    let str = "";

    let finalE =
        (word.droppedE && (word.vowels.atIdx(-1).stressed || word.endMatch("V")) && !word.endMatch("eː/ɛː/θ") && !word.pastTense)
        || (laterWord.vowels.atIdx(-1).value.length > 1 && word.endMatch("C[!=θ]") && !word.sSuffix && !word.pastTense && !word.vowels.atIdx(-1).droppedH
            && !(word.endMatch("z") && !laterWord.vowels.atIdx(-1).match("ɛː/əi̯/[stressed]")))
        || (word.endMatch("v/d͡ʒ") || (word.endMatch("V[stressed],ð/z") && word.atIdx(-2).value.length > 1 && !word.sSuffix))
        || (word.endMatch("ð") && word.vowels.atIdx(-1).stressed)
        || (word.endMatch("V,s") && word.atIdx(-2).value.length == 1)
        || (word.endMatch("C,s/z") && !word.sSuffix);

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);

        let addApostrophe =
            (word.pastTense && (segment.ctxMatch("_d,#") || segment.ctxMatch("aː/iː/ɔː_t,#"))
                && !(segment.match("V") && segment.value.length == 1) && !segment.match("eː[stressed]"))
            || (word.conjPastTense && (segment.ctxMatch("_d,s,t,#") || segment.ctxMatch("aː/iː/ɔː_t,s,t,#")) && !(segment.match("V")
                && segment.value.length == 1) && !segment.match("eː[stressed]"));

        let addE =
            (word.sSuffix && segment.ctxMatch("_C,#") && (word.vowels.atIdx(-1).stressed || segment.match("V")) && !segment.match("ə/eː/ɛː/θ"))
            || (word.sSuffix && segment.match("C[!=θ]", "_C,#") && laterWord.vowels.atIdx(-1).value.length > 1 && !word.vowels.atIdx(-1).droppedH)
            || (segment.match("d͡ʒ/v", "_C") && !addApostrophe)
            || (segment.match("iː[!stressed]", "_rˠ,#"))
            || (finalE && segment.ctxMatch("_#"));

        let doubleCons = segment.relIdx(-1).match("a/e/i/ɔ/u") && segment.relIdx(-1).stressed && (segment.ctxMatch("_V") || addE || addApostrophe);

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
                    segment.ctxMatch("C[!=m/n/v/l/r/θ/t͡ʃ/ʃ/d͡ʒ/j/w/ʍ]_ɫ") && !(str.at(-1) == "s" && str.at(-2) != "s")
                    && !segment.ctxMatch("_C,C,C") && !(segment.ctxMatch("_C,C,#") && !word.sSuffix && !word.pastTense)
                ) {
                    str += "le";
                    i++;
                } else if (segment.ctxMatch("#_[stressed]")) {
                    str += "a";
                } else if (segment.LMEValue == "oː" || segment.LMEValue == "ɔ" || segment.ctxMatch("_{m/p/b/k}[!stressed]")) {
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
                else if ((segment.ctxMatch("_#") && !finalE) || segment.ctxMatch("_i"))
                    str += "y";
                else
                    str += "i";
                break;
            case "ɔ":
                str += "o";
                break;
            case "ɔː":
                if (
                    segment.ctxMatch("_C,V") || segment.ctxMatch("_V/#") || addE || (word.droppedE && segment.ctxMatch("_C,#"))
                    || ((word.sSuffix || word.pastTense) && segment.ctxMatch("_C,C,#")) || segment.ctxMatch("_rˠ,n") || (segment.ctxMatch("_m[droppedB]"))
                )
                    str += "o";
                else
                    str += "oa";
                break;
            case "oː":
                if (segment.ctxMatch("_m[droppedB]") || segment.ctxMatch("_m,b"))
                    str += "o";
                else
                    str += "oo";
                break;
            case "u":
                if (segment.ctxMatch("w/v_") || segment.ctxMatch("_v"))
                    str += "o";
                else if (segment.idx == 0 && !modernTypography)
                    str += "v";
                else
                    str += "u";
                break;
            case "uː":
                if (segment.droppedH)
                    str += "ough";
                else if (segment.ctxMatch("_m/p/b/f/v"))
                    str += "oo";
                else if (
                    (segment.ctxMatch("_C") && !addE && !addApostrophe && !segment.ctxMatch("_n/l/ɫ,z/V/#") && !(word.sSuffix && segment.ctxMatch("_z,#")))
                    || segment.ctxMatch("j_")
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
                else if (segment.ctxMatch("_C") && !addE && !addApostrophe && !segment.ctxMatch("_n/l/ɫ,z/V/#") && !(word.sSuffix && segment.ctxMatch("_z,#")))
                    str += "au";
                else
                    str += "aw";
                break;
            case "æi̯":
                if (segment.droppedH)
                    str += "eigh";
                else if (segment.ctxMatch("_C") && !addE && !addApostrophe && !(word.sSuffix && segment.ctxMatch("_z,#")))
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
                if (segment.ctxMatch("{a/e/i/ɔ/u}[stressed]_"))
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
                if (segment.ctxMatch("{a/e/i/ɔ/u}[stressed]_") && (segment.ctxMatch("_V/#") || (word.sSuffix && segment.ctxMatch("_C,#")) || addE))
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
                if (segment.LMEValue == "ʍ")
                    str += "wh";
                else
                    str += "h";
                break;
            case "d͡ʒ":
                if (segment.ctxMatch("a/e/i/ɔ/u_"))
                    str += "dg";
                else
                    str += "g";
                break;
            case "k":
                if (segment.ctxMatch("_s") && !(word.sSuffix && segment.ctxMatch("_s,#"))) {
                    str += "x";
                    i++;
                } else if (segment.ctxMatch("_w")) {
                    str += "qu";
                    i++;
                } else if (
                    segment.ctxMatch("a/e/i/ɔ/u_") && (!segment.stressed || segment.ctxMatch("_n"))
                    && (segment.ctxMatch("_s/n/l/h/V/#") || addE || (word.pastTense && segment.ctxMatch("_t,#"))
                        || (word.conjPastTense && segment.ctxMatch("_t,s,t,#")))
                ) {
                    str += "ck";
                } else if (
                    segment.ctxMatch("_e/ɛː/eː/i/iː/ɛu̯/iu̯/j/n/h/#") || segment.ctxMatch("_ə,[!=m/p/b/k]") || addE || addApostrophe
                    || (word.sSuffix && segment.ctxMatch("_s,#")) || (word.pastTense && segment.ctxMatch("_t,#"))
                    || (word.conjPastTense && segment.ctxMatch("_t,s,t,#"))
                ) {
                    str += "k";
                } else {
                    str += "c";
                }
                break;
            case "l":
            case "ɫ":
                if (segment.ctxMatch("{a/e/i/ɔ/u}[stressed]_") && (segment.ctxMatch("_V/#") || (word.sSuffix && segment.ctxMatch("_C,#")) || addE || addApostrophe))
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
                if (segment.ctxMatch("{a/e/i/ɔ/u/ə}[stressed]_") && (segment.ctxMatch("_V/#") || addE))
                    if (modernTypography)
                        str += "ss";
                    else
                        str += "ſſ";
                else if (segment.ctxMatch("iː_") && (segment.ctxMatch("_V") || addE))
                    str += "c";
                else if ((segment.ctxMatch("_#") && !addE) || modernTypography)
                    str += "s";
                else
                    str += "ſ";
                break;
            case "ʃ":
                if (modernTypography)
                    str += "sh";
                else
                    str += "ſh";
                break;
            case "t":
                if (segment.ctxMatch("_θ"))
                    break;
                else if (((segment.ctxMatch("_#") && word.pastTense) || (segment.ctxMatch("_s,t,#") && word.conjPastTense)) && str.at(-1) == "'")
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
                if (segment.ctxMatch("#_") || modernTypography)
                    str += "v";
                else
                    str += "u";
                break;
            case "w":
                str += "w";
                break;
            case "ʍ":
                str += "wh";
                break;
            case "j":
                str += "y";
                break;
            case "z":
                if ((segment.ctxMatch("_#") && !addE) || modernTypography)
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

    let finalE =
        (word.endMatch("iː,C") && !word.sSuffix && !word.pastTense && !word.endMatch("iː[!stressed],rˠ"))
        | (word.droppedE && word.endMatch("aː/ɛː/ɔː/oː/øː,C") && !word.sSuffix && !word.pastTense)
        | (word.endMatch("ð/v/d͡ʒ") || (word.endMatch("V[stressed],z") && word.atIdx(-2).value.length > 1 && !word.sSuffix))
        | (word.endMatch("C,s/z") && !word.sSuffix);

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);

        let addI = word.sSuffix && segment.ctxMatch("_s/z,#") && !segment.match("ɪ/eː/ɛː");

        let addE =
            (segment.match("d͡ʒ/v", "_C") && !addI)
            || segment.match("iː[!stressed]", "_rˠ,#")
            || (finalE && segment.ctxMatch("_#"));

        let doubleCons = segment.ctxMatch("{a/e/ɪ/ɔ/u}[stressed]_") && (segment.ctxMatch("_V") || addE || addI);

        switch (segment.value) {
            case "a":
                str += "a";
                break;
            case "aː":
                if (
                    segment.ctxMatch("_C,V") || segment.ctxMatch("_V/#") || addE || addI || (finalE && segment.ctxMatch("_C,#"))
                    || (word.sSuffix && segment.ctxMatch("_C,C")) || segment.ctxMatch("_ɫ")
                )
                    str += "a";
                else
                    str += "ai";
                break;
            case "e":
                str += "e";
                break;
            case "ə":
                if (segment.ctxMatch("#_[stressed]"))
                    str += "a";
                else if (segment.LMEValue == "ɔ" || segment.ctxMatch("_{m/p/b/k}[stressed]"))
                    str += "o";
                else
                    str += "e";
                break;
            case "ɛː":
            case "eː":
                if (
                    segment.ctxMatch("_C,V") || segment.ctxMatch("_V/#") || addE || addI || (finalE && segment.ctxMatch("_C,#"))
                    || (word.sSuffix && segment.ctxMatch("_C,C"))
                )
                    str += "e";
                else
                    str += "ei";
                break;
            case "ɪ":
            case "iː":
                if (!segment.stressed && segment.LMEValue == "e")
                    str += "e";
                else if ((segment.ctxMatch("_#") && !finalE) || segment.ctxMatch("_ɪ"))
                    str += "y";
                else
                    str += "i";
                break;
            case "ɔ":
            case "ɔː":
                str += "o";
                break;
            case "øː":
                if (
                    segment.ctxMatch("_C,V") || segment.ctxMatch("_V/#") || addE || addI || (finalE && segment.ctxMatch("_C,#"))
                    || (word.sSuffix && segment.ctxMatch("_C,C"))
                ) {
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
                if (segment.ctxMatch("w/v_"))
                    str += "o";
                else if (segment.idx == 0 && !modernTypography)
                    str += "v";
                else
                    str += "u";
                break;
            case "uː":
                if (segment.ctxMatch("_C") && !addE && !addI && !(word.sSuffix && segment.ctxMatch("_z,#")))
                    str += "ou";
                else
                    str += "ow";
                break;
            case "ɑu̯":
                if (segment.ctxMatch("_C") && !addE && !addI && !(word.sSuffix && segment.ctxMatch("_z,#")))
                    str += "au";
                else
                    str += "aw";
                break;
            case "æi̯":
                if (segment.ctxMatch("_C") && !addE && !addI && !(word.sSuffix && segment.ctxMatch("_z,#")))
                    str += "ai";
                else
                    str += "ay";
                break;
            case "ɛu̯":
            case "iu̯":
                if (segment.ctxMatch("_C") && !addE && !addI && !(word.sSuffix && segment.ctxMatch("_z,#")))
                    str += "eu";
                else
                    str += "ew";
                break;
            case "ɔi̯":
            case "ui̯":
                if (segment.ctxMatch("_C") && !addE && !addI && !(word.sSuffix && segment.ctxMatch("_z,#")))
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
                if (segment.ctxMatch("{a/e/i/ɔ/u}[stressed]_") && (segment.ctxMatch("_V/#") || (word.sSuffix && segment.ctxMatch("_C,#")) || addE || addI))
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
                if (segment.LMEValue == "ʍ")
                    str += "wh";
                else
                    str += "h";
                break;
            case "d͡ʒ":
                str += "g";
                break;
            case "k":
                if (segment.ctxMatch("_s") && !(word.sSuffix && segment.ctxMatch("_s,#"))) {
                    str += "x";
                    i++;
                } else if (segment.ctxMatch("_w")) {
                    str += "qu";
                    i++;
                } else if (doubleCons) {
                    str += "kk";
                } else if (
                    segment.ctxMatch("_e/ɛː/eː/ɪ/iː/ɛu̯/iu̯/j/s/n/l/h/#") || segment.ctxMatch("_ə,[!=m/p/b/k]") || addE || addI
                    || (word.sSuffix && segment.ctxMatch("_s,#"))
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
                if (segment.ctxMatch("_k"))
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
                if (segment.ctxMatch("a/e/ɪ/ɔ/u/ə_") && !segment.stressed && (segment.ctxMatch("_V/#") || addE || addI))
                    if (modernTypography)
                        str += "ss";
                    else
                        str += "ſſ";
                else if (segment.relIdx(-1).match("iː") && (segment.ctxMatch("_V") || addE || addI))
                    str += "c";
                else if ((segment.ctxMatch("_#") && !addI) || modernTypography)
                    str += "s";
                else
                    str += "ſ";
                break;
            case "ʃ":
                if (modernTypography)
                    str += "sch";
                else
                    str += "ſch";
                break;
            case "t":
                if (segment.ctxMatch("_θ"))
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
                if (segment.ctxMatch("#_") || modernTypography)
                    str += "v";
                else
                    str += "u";
                break;
            case "ʍ":
                str += "quh";
                break;
            case "j":
                str += "y";
                break;
            case "z":
                if ((segment.ctxMatch("_#") && !addE) || modernTypography)
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

    let finalE =
        (word.endMatch("{aː/iː}[!droppedH],C[!droppedB]") && !word.sSuffix && !word.pastTense && !word.endMatch("iː[!stressed],rˠ"))
        || (word.atIdx(-2).match("ɔː") && word.endMatch("ɔː,C[!droppedB]") && word.droppedE && !word.sSuffix)
        || (word.endMatch("v/d͡ʒ") || (word.endMatch("V[stressed],ð/z") && word.atIdx(-2).value.length > 1 && !word.sSuffix))
        || (word.endMatch("ð") && word.vowels.atIdx(-1).stressed)
        || (word.endMatch("V,s") && word.atIdx(-2).value.length > 1)
        || (word.endMatch("C[!=k/v],s/z") && word.atIdx(-2).match("C") && !word.sSuffix);

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);

        let addE =
            (word.sSuffix && segment.ctxMatch("{aː/iː/ɔː}[!droppedH]_s/z,#"))
            || (word.sSuffix && segment.match("aː/iː/ɔː/{eː/ɛː}[!stressed]", "_z,#") && !segment.droppedH)
            || (word.pastTense && segment.ctxMatch("_d/t,#") && !(segment.match("V") && segment.value.length == 1) && !segment.match("V", "_t") && !segment.match("eː[stressed]"))
            || (word.conjPastTense && segment.ctxMatch("_d/t,s,t") && !(segment.match("V") && segment.value.length == 1) && !segment.match("V", "_t") && !segment.match("eː"))
            || segment.match("d͡ʒ/v", "_C")
            || segment.match("iː[!stressed]", "_rˠ,#")
            || (finalE && segment.ctxMatch("_#"));

        let doubleCons = segment.ctxMatch("{a/e/i/ɔ/u}[stressed]_") && (segment.ctxMatch("_V") || addE);

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
                    segment.ctxMatch("C[!=m/n/v/l/r/θ/t͡ʃ/ʃ/d͡ʒ/j/w/ʍ]_ɫ") && !(str.at(-1) == "s" && str.at(-2) != "s")
                    && !segment.ctxMatch("_C,C,C") && !(segment.ctxMatch("_C,C,#") && !word.sSuffix && !word.pastTense)
                ) {
                    str += "le";
                    i++;
                } else if (segment.ctxMatch("#_[stressed]")) {
                    str += "a";
                } else if (segment.LMEValue == "oː" || segment.LMEValue == "ɔ" || segment.ctxMatch("_{m/p/b/k}[!stressed]")) {
                    str += "o";
                } else {
                    str += "e";
                }
                break;
            case "ɛː":
                if (!segment.stressed && segment.ctxMatch("_i/#"))
                    str += "y";
                else if (!segment.stressed && (segment.ctxMatch("_V") || addE))
                    str += "i";
                else
                    str += "ea";
                break;
            case "eː":
                if (!segment.stressed && segment.ctxMatch("_i/#"))
                    str += "y";
                else if (!segment.stressed && (segment.ctxMatch("_V") || addE))
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
                    segment.ctxMatch("_C,V") || segment.ctxMatch("_V/#") || addE || (word.droppedE && segment.ctxMatch("_C,#"))
                    || ((word.sSuffix || word.pastTense) && segment.ctxMatch("_C,C,#")) || segment.ctxMatch("_rˠ,n") || (segment.ctxMatch("_m[droppedB]"))
                )
                    str += "o";
                else
                    str += "oa";
                break;
            case "oː":
                if (segment.ctxMatch("_m[droppedB]") || segment.ctxMatch("_m,b") || segment.ctxMatch("_rˠ,d"))
                    str += "o";
                else
                    str += "oo";
                break;
            case "u":
                if (segment.ctxMatch("w/v_") || segment.ctxMatch("_v"))
                    str += "o";
                else
                    str += "u";
                break;
            case "uː":
                if (segment.droppedH)
                    str += "ough";
                else if (segment.ctxMatch("_m/p/b/f/v"))
                    str += "oo";
                else if (
                    (segment.ctxMatch("_C") && !addE && !segment.ctxMatch("_n/l/ɫ,z/V/#") && !(word.sSuffix && segment.ctxMatch("_z,#")))
                    || segment.ctxMatch("j_")
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
                else if (segment.ctxMatch("_C") && !addE && !segment.ctxMatch("_n/l/ɫ,z/V/#") && !(word.sSuffix && segment.ctxMatch("_z,#")))
                    str += "au";
                else
                    str += "aw";
                break;
            case "æi̯":
                if (segment.droppedH)
                    str += "eigh";
                else if (segment.ctxMatch("_C") && !addE && !(word.sSuffix && segment.ctxMatch("_z,#")))
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
                if (segment.ctxMatch("_C") && !addE && !(word.sSuffix && segment.ctxMatch("_z,#")))
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
                if (segment.ctxMatch("{a/e/i/ɔ/u}[stressed]_"))
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
                if (segment.ctxMatch("{a/e/i/ɔ/u}[stressed]_") && (segment.ctxMatch("_V/#") || (word.sSuffix && segment.ctxMatch("_C,#")) || addE))
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
                if (segment.LMEValue == "ʍ")
                    str += "wh";
                else
                    str += "h";
                break;
            case "d͡ʒ":
                if (segment.ctxMatch("a/e/i/ɔ/u_"))
                    str += "dg";
                else
                    str += "g";
                break;
            case "k":
                if (segment.ctxMatch("_s") && !(word.sSuffix && segment.ctxMatch("_C,#"))) {
                    str += "x";
                    i++;
                } else if (segment.ctxMatch("_w")) {
                    str += "qu";
                    i++;
                } else if (segment.ctxMatch("a/e/i/ɔ/u/ə_") && (!segment.stressed || segment.ctxMatch("_n")) && (segment.ctxMatch("_s/n/l/h/V/#") || addE)) {
                    str += "ck";
                } else if (segment.ctxMatch("_e/ɛː/eː/i/iː/ɛu̯/iu̯/j/n/h/#") || segment.ctxMatch("_ə,[!=m/p/b/k]") || addE || (word.sSuffix && segment.ctxMatch("_s,#"))) {
                    str += "k";
                } else {
                    str += "c";
                }
                break;
            case "l":
            case "ɫ":
                if (segment.ctxMatch("{a/e/i/ɔ/u}[stressed]_") && (segment.ctxMatch("_V/#") || (word.sSuffix && segment.ctxMatch("_C,#")) || addE))
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
                if (segment.ctxMatch("a/e/i/ɔ/u/ə_") && !segment.stressed && (segment.ctxMatch("_V/#") || addE))
                    str += "ss";
                else if (segment.ctxMatch("iː_") && (segment.ctxMatch("_V") || addE))
                    str += "c";
                else
                    str += "s";
                break;
            case "ʃ":
                str += "sh";
                break;
            case "t":
                if (segment.ctxMatch("_θ"))
                    break;
                else if (((word.pastTense && segment.ctxMatch("_#")) || (word.conjPastTense && segment.ctxMatch("_s,t,#"))) && segment.ctxMatch("C_"))
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
            case "ʍ":
                str += "wh";
                break;
            case "j":
                str += "y";
                break;
            case "z":
                if (segment.ctxMatch("{a/e/i/ɔ/u}[stressed]_") && (segment.ctxMatch("_V/#") || addE))
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

    let shortVowels = "a/aː/ɛ/ɛː/ɪ/ɔ/ɔː/ʌ/ə";

    let finalE =
        (word.endMatch("{əi̯/aɪ̯}[LMEValue=iː],C[!droppedD]") && !word.sSuffix && !word.pastTense)
        || (word.endMatch("{e/eː}[LMEValue!=æi̯],C") && word.droppedE && !word.sSuffix && !word.pastTense)
        || (word.endMatch("o/oː,C") && !word.sSuffix && !word.pastTense)
        || word.endMatch("v/ð/d͡ʒ/ʒ")
        || word.endMatch("əi̯/aɪ̯/i/iː/e/eː/o/oː/u/uː/ʏ/øː/oɪ̯/ɑː/ʌu̯,s")
        || (word.endMatch("C[!=k/v],s/z") && word.atIdx(-2).match("C") && !word.sSuffix)
        || word.endMatch("ʌu̯");

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);

        let addE =
            (word.sSuffix && segment.ctxMatch("e/eː/o/oː/ʌu̯/{əi̯/aɪ̯}[LMEValue!=iː]_C,#"))
            || (word.sSuffix && segment.match("eː/aɪ̯/ʌu̯", "_C,#"))
            || (word.pastTense && segment.ctxMatch("_d,#") && !segment.match("e/eː/i/iː/" + shortVowels))
            || segment.match("d͡ʒ/v", "_C")
            || segment.match("iː", "_rˠ,#")
            || (finalE && segment.ctxMatch("_#"));

        let doubleCons = segment.ctxMatch(`{${shortVowels}}[stressed]_`) && (segment.ctxMatch("_V") || addE);

        switch (segment.value) {
            case "əi̯":
            case "aɪ̯":
                if (segment.LMEValue == "iː" && (segment.ctxMatch("_#/V[LMEValue=i]") || (segment.relIdx(1).inSuffix && word.partOfSpeech != "pastPtcp")))
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
                else if ((segment.ctxMatch("_#") || ((word.sSuffix || word.pastTense) && segment.ctxMatch("_C,#"))) && (segment.LMEValue == "iː" || segment.LMEValue == "i"))
                    str += "ie";
                else if (segment.ctxMatch("_#") || ((word.sSuffix || word.pastTense) && segment.ctxMatch("_C,#")) && !addE)
                    str += "ae";
                else if (
                    (segment.ctxMatch("_C,V") || segment.ctxMatch("_V/#") || addE || (finalE && segment.ctxMatch("_C,#"))
                        || ((word.sSuffix || word.pastTense) && segment.ctxMatch("_C,C,#")))
                    && segment.LMEValue != "æi̯"
                )
                    str += "a";
                else if (segment.ctxMatch("_V"))
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
                if ((segment.LMEValue == "ɛu̯" || segment.LMEValue == "iu̯") && segment.ctxMatch("_V/#"))
                    str += "ew";
                else if (segment.LMEValue == "øː" || segment.LMEValue == "ɛu̯" || segment.LMEValue == "iu̯")
                    str += "eu";
                else if (segment.droppedL)
                    str += "ou";
                else
                    str += "oo";
                break;
            case "ʏ":
            case "øː":
                str += "ui";
                break;
            case "oɪ̯":
                if (segment.ctxMatch("_C") && !addE && !(word.sSuffix && segment.ctxMatch("_z,#")))
                    str += "oi";
                else
                    str += "oy";
                break;
            case "ɑː":
                if (segment.LMEValue == "aː" && !segment.ctxMatch("_ɫ"))
                    str += "a";
                else if (segment.ctxMatch("_C[!=k]") && !addE && !(word.sSuffix && segment.ctxMatch("_z,#")))
                    str += "au";
                else
                    str += "aw";
                break;
            case "ʌu̯":
                str += "ow";
                break;
            case "ɪ":
                if (word.sSuffix && segment.ctxMatch("_C,#"))
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
                if (segment.stressed || (segment.inSuffix && word.partOfSpeech != "pastPtcp") || (segment.LMEValue == "ɪ" && segment.ctxMatch("_n") && segment.idx > word.stressedVowel.idx)) {
                    str += "i";
                } else if (
                    segment.ctxMatch("C[!=v/l/ɾ/θ/t͡ʃ/ʃ/d͡ʒ/j/w/ʍ]_ɫ,C/#") && !(str.at(-1) == "s" && str.at(-2) != "s")
                    && !segment.ctxMatch("_C,C,C") && !(segment.ctxMatch("_C,C,#") && !word.sSuffix && !word.pastTense)
                ) {
                    str += "le";
                    i++;
                } else if (segment.ctxMatch("#_") && (segment.ctxMatch("_[stressed]") || segment.ctxMatch("_k,n[stressed]"))) {
                    str += "a";
                } else if (segment.LMEValue == "øː" || segment.LMEValue == "ɔ" || segment.ctxMatch("_{m/p/b/k}[!stressed]")) {
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
                if (segment.ctxMatch(`{${shortVowels}}[stressed]_`))
                    str += "tch";
                else
                    str += "ch";
                break;
            case "x":
            case "ç":
                if (segment.ctxMatch("_j"))
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
                if (segment.ctxMatch(`{${shortVowels}}[stressed]_`) && (segment.ctxMatch("_V/#") || (word.sSuffix && segment.ctxMatch("_s,#")) || addE))
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
                if (segment.ctxMatch(`${shortVowels}_`))
                    str += "dg";
                else
                    str += "g";
                break;
            case "k":
                if (segment.ctxMatch("_s") && !(word.sSuffix && segment.ctxMatch("_s,#"))) {
                    str += "x";
                    i++;
                } else if (segment.ctxMatch("_w")) {
                    str += "qu";
                    i++;
                } else if (segment.ctxMatch(`${shortVowels}_`) && !segment.stressed && (segment.ctxMatch("_s/n/ɫ/h/V/#") || addE)) {
                    str += "ck";
                } else if (
                    segment.ctxMatch("_e/eː/ɛ/ɛː/i/iː/ɪ/əi̯/aɪ̯/ə[stressed]/j/n/h/#") || segment.ctxMatch("_ə,[!=m/p/b/k]")
                    || (word.sSuffix && segment.ctxMatch("_s,#"))
                ) {
                    str += "k";
                } else {
                    str += "c";
                }
                break;
            case "ɫ":
                if (segment.droppedD)
                    str += "ld";
                else if (segment.ctxMatch(`{${shortVowels}}[stressed]_`) && (segment.ctxMatch("_z/V/#") || addE))
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
                if (segment.droppedD && segment.ctxMatch("[stressed]_C/#/V[inSuffix]"))
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
                if (segment.ctxMatch("_k"))
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
                if (segment.ctxMatch(`${shortVowels}_`) && !segment.stressed && (segment.ctxMatch("_V/#") || addE))
                    str += "ss";
                else if (segment.ctxMatch("əi̯_") && (segment.ctxMatch("_ə") || addE))
                    str += "c";
                else
                    str += "s";
                break;
            case "ʃ":
                if (segment.ctxMatch("n_"))
                    str += "ch";
                else
                    str += "sh";
                break;
            case "t":
                if (segment.ctxMatch("_θ"))
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
            case "ʍ":
                str += "wh";
                break;
            case "j":
                if (!(segment.ctxMatch("_u/uː") && !segment.LMEValue))
                    str += "y";
                break;
            case "z":
                if (segment.ctxMatch(`{${shortVowels}}[stressed]_`) && (segment.ctxMatch("_V/#") || addE))
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