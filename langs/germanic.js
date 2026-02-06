function getIPA_PG() {
    let charToPhoneme = {
        "a": "ɑ",
        "ā": "ɑː",
        "ą": "ɑ̃",
        "ą̄": "ɑ̃ː",
        "ai": "ɑ,j",
        "au": "ɑ,w",
        "b": "β",
        "d": "ð",
        "e": "e",
        "ē": "ɛː",
        "ē₂": "eː",
        "ê": "ɛːː",
        "ēi": "ɛː,j",
        "eu": "e,w",
        "ēu": "ɛː,w",
        "f": "ɸ",
        "g": "ɣ",
        "gw": "ɣʷ",
        "h": "x",
        "hw": "xʷ",
        "i": "i",
        "ī": "iː",
        "į": "ĩ",
        "į̄": "ĩː",
        "iu": "i,w",
        "j": "j",
        "k": "k",
        "kw": "kʷ",
        "l": "l",
        "m": "m",
        "n": "n",
        "ō": "ɔː",
        "ô": "ɔːː",
        "ǭ": "ɔ̃ː",
        "ǫ̂": "ɔ̃ːː",
        "ōi": "ɔː,j",
        "ōu": "ɔː,w",
        "p": "p",
        "r": "r",
        "s": "s",
        "t": "t",
        "u": "u",
        "ū": "uː",
        "ų": "ũ",
        "ų̄": "ũː",
        "w": "w",
        "z": "z",
        "þ": "θ",
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
        "sp", "st", "sk", "spl", "pl", "kl", "bl", "ɣl", "fl", "xl", "sl", "wl",
        "spr", "str", "skr", "pr", "tr", "kr", "br", "dr", "ɣr", "fr", "θr", "xr", "wr",
        "tw", "kw", "dw", "θw", "xw", "sw", "sm", "kn", "ɣn", "fn", "xn", "sn"
    ];
    if (stressedVowel.ctxMatch("C_"))
        stressedVowel.relIdx(-1).stressed = true;
    if (onsetClusters.includes(stressedVowel.relIdx(-2).value + stressedVowel.relIdx(-1).value))
        stressedVowel.relIdx(-2).stressed = true;
    if (onsetClusters.includes(stressedVowel.relIdx(-3).value + stressedVowel.relIdx(-2).value + stressedVowel.relIdx(-1).value))
        stressedVowel.relIdx(-3).stressed = true;
    word.forEach(segment => {
        if (word.vowels.atIdx(0).stressed && segment.idx < stressedVowel.idx)
            segment.stressed = true;
    });

    //Allophones
    word.replace("n", "ŋ", "_k/kʷ/ɣ/ɣʷ/x/xʷ");
    word.replace("β", "b", "#/m_");
    word.replace("ð", "d", "#/n/l/z_");
    word.replace("β[stressed] ð[stressed]", "b d");
    word.replace("ɣ ɣʷ", "g gʷ", "ŋ_");
    word.replaceSeq("β,β", "b,b");
    word.replaceSeq("ð,ð", "d,d");
    word.replaceSeq("ɣ,ɣ", "g,g");
    word.replaceSeq("ɣ,ɣʷ", "g,gʷ");
    word.replace("x", "h", "#_");
    word.replace("x[stressed]", "h");

    word.replace("e", "i", "", segment => segment.nextVowel().value.startsWith("i") || segment.nextVowel().ctxMatch("j_"));
    word.replace("e", "i", "_m/n/ŋ,C/#");

    word.forEach(segment => {
        if (segment.match("ɑ/i/u", "_ŋ,x/xʷ")) {
            segment.value += "\u0303" + "ː"; //Nasalize and lengthen
            segment.relIdx(1).remove();
        }
    });

    addRow("PG", "Proto-Germanic", "100 AD", "", word);
}

function PG_to_PWG() {
    word = outcomes.PG.duplicate();

    if (
        word.vowels.length > 2 && word.vowels.atIdx(-1).value.length == 1 && !word.vowels.atIdx(-2).stressed
        && (word.endMatch("V[!stressed]") || word.endMatch("V[!stressed],z"))
    )
        word.vowels.atIdx(-1).remove();
    word.replace("j w", "i[type=vowel] u[type=vowel]", "C_#");
    word.replace("i,j", "iː", "_#");
    word.replace("u,w", "uː", "_#");

    //A-mutation
    word.replace("u[stressed]", "o", "", segment =>
        segment != word.vowels.atIdx(-1) && !segment.nextVowel().match("i/iː/ĩ/ĩː/u/uː/ũ/ũː")
        && !segment.nextVowel().ctxMatch("j_") && !segment.ctxMatch("_m/n/ŋ,C") && !segment.ctxMatch("f/w_l")
    );

    word.remove("j", "ɔː_#");

    word.replace("ɔː[!stressed]", "oː", "_#");

    word.replace("ɛː", "ɑː");

    //Final vowel shortening
    word.forEach(segment => {
        if (segment.match("V[!stressed]", "_#") && segment.value.endsWith("ː") && segment.value.length == 2)
            segment.value = segment.value[0];
    });
    word.replace("o", "u", "_#");
    word.replace("kʷ gʷ xʷ", "k g x", "_u");
    word.remove("w", "C_u");
    word.replace("u[!stressed]", "w[type=consonant]", "V_");

    word.replace("ɔː[!stressed]", "ɑː", "_z,#");
    word.replace("ɔ̃ː[!stressed]", "ɑː", "_#");

    word.replace("ɛːː ɔːː ɔ̃ːː", "ɑː ɔː ɔ̃ː");

    word.replace("ɔː ɔ̃ː", "oː õː");

    word.remove("w", "oː[!stressed]_C/#");

    word.replaceSeq("ɑ[!stressed],j[!stressed]", "eː", "_C/#");
    word.replaceSeq("ɑ[!stressed],w[!stressed]", "oː", "_C/#");

    if (!word.vowels.atIdx(-1).stressed || word.partOfSpeech == "noun" || word.partOfSpeech == "nounPl")
        word.remove("z", "_#");
    word.remove("z", "C_#");
    if (word.partOfSpeech == "noun")
        word.remove("s", "p/t/k/f/θ/x_#");

    word.replace("z", "ɹ");

    word.forEach(segment => {
        if (segment.match("V[stressed]", "_#") && segment.value.length == 1)
            segment.value += "ː";
    });

    word.replace("ð", "d");

    //West Germanic gemination
    word.forEach(segment => {
        if ((segment.match("C[!=r/ɹ/j]", "V_j") || segment.match("p/k", "V_l[!stressed]")) && !segment.ctxMatch("_C,{ɑ/ɑ̃}[!stressed],#"))
            word.insert(segment.value, segment.idx);
    });

    word.replaceSeq("β,β", "b,b");
    word.replaceSeq("ɣ,ɣ", "g,g");

    addRow("PWG", "Proto-West Germanic", "400", "", word, true);
}

function PWG_to_EOE() {
    word = outcomes.PWG.duplicate();

    word.replaceSeq("i[stressed],j", "iː");
    word.replaceSeq("u,w", "uː");

    word.replace("kʷ gʷ xʷ", "k g x", "", segment => segment.idx > word.stressedVowel.idx);

    word.replace("i", "eː", "_ɹ,#");

    word.remove("ɹ", "_#");

    word.insert("b", "m_r/ɹ");

    word.replace("ɸ β", "f v");

    word.replace("e o", "i u", "_m");

    word.replace("θ", "d", "l_");

    if (word.partOfSpeech == "inf" && word.endMatch("oː,n,ɑ̃")) {
        word.insert("j", -2);
        word.insert("ɑ", -2);
    } else if (word.partOfSpeech == "conjVerb" && word.vowels.at(-1).match("oː", "_C[!=s/θ]")) {
        word.insert("j", word.vowels.at(-1).idx + 1);
        word.insert("ɑ", word.vowels.at(-1).idx + 2);
    }

    //Ingvaeonic nasal spirant law
    word.forEach(segment => {
        if (segment.match("V", "_m/n,f/θ/s")) {
            segment.value = segment.value[0] + "\u0303" + "ː";
            segment.relIdx(1).remove();
        }
    });

    word.insert("w", "{ɑː/oː/uː}[stressed]_V");

    word.replace("ɑ[stressed] ɑː", "ɑ̃ ɑ̃ː", "_m/n/ŋ");

    word.replace("ɑː", "æː");

    word.replace("ɑ̃ː", "õː");

    word.replace("l r", "ɫ rˠ", "_C");
    word.replace("l", "ɫ", "ɫ_");
    word.replace("r", "rˠ", "rˠ_");

    word.replaceSeq("kʷ", "k,w");
    word.replaceSeq("gʷ", "g,w");
    word.replaceSeq("xʷ", "x,w");
    word.replace("x", "h", "#_");
    word.replace("x", "h", "_V[stressed]");

    word.replace("ɑ", "ɑː", "_j,C/#");
    word.remove("j", "ɑː_C/#");

    word.replace("ɑ", "æ");

    //Denasalization
    word.forEach(segment => {
        if (segment.value.includes("\u0303"))
            segment.value = segment.value[0] + (segment.value.slice(2) || "");
    });

    //Breaking/retraction
    word.forEach(segment => {
        if (segment.stressed)
            switch (segment.value) {
                case "æ":
                    if (segment.ctxMatch("_x") || segment.ctxMatch("_rˠ/ɹ,C"))
                        segment.value = "æɑ̯";
                    else if (segment.ctxMatch("_ɫ,C") && !segment.ctxMatch("_ɫ,ɫ,j"))
                        segment.value = "ɑ";
                    break;
                case "e":
                    if (segment.ctxMatch("_x") || segment.ctxMatch("_rˠ/ɹ,C") || (segment.ctxMatch("_w,V") && !segment.ctxMatch("_w,æ/ɑ,#")) || segment.ctxMatch("_ɫ,x/k/w"))
                        segment.value = "eo̯";
                    break;
                case "i":
                    if (segment.ctxMatch("_x") || segment.ctxMatch("_rˠ/ɹ,C,[!=i]") || segment.ctxMatch("_rˠ,ɹ,i") || (segment.ctxMatch("_w,V[!=i]") && !segment.ctxMatch("_w,æ/ɑ,#")))
                        segment.value = "iu̯";
                    break;
                case "eː":
                    if (segment.ctxMatch("_x"))
                        segment.value = "eːo̯";
                    break;
                case "iː":
                    if (segment.ctxMatch("_x"))
                        segment.value = "iːu̯";
                    break;
            }
    });

    word.replace("ɹ", "r");
    word.replace("r", "rˠ", "_C");
    word.replace("r", "rˠ", "rˠ_");

    //A-restoration
    word.replace("æ", "ɑ", "", segment => segment.nextVowel().match("{ɑ/ɑː/o/oː/u/uː}[!stressed]"), true);

    word.remove("{æ/ɑ}[!stressed]", "_#");

    word.replace("j", "i[type=vowel]", "C_#");
    word.replace("w", "u[type=vowel]", "C[!=w]_#");
    word.replace("i,j", "iː", "_#");
    word.replace("u,w", "uː", "_#");

    //Height harmonization
    word.replace("æ/ɑ e/eː i/iː", "æːɑ̯ eːo̯ iːu̯", "_w,C/#");
    word.remove("j/w", "æːɑ̯/eːo̯/iːu̯_C[!=j]/#", null, true);

    word.replace("æː", "eː");

    //Palatalization
    let frontVowels = "æ/æɑ̯/æːɑ̯/e/eː/eo̯/eːo̯/i/iː/iu̯/iːu̯";
    word.replace("k g ɣ", "c ɟ ʝ", "_i/iː/j");
    word.replace("k g", "c ɟ", `i/iː_${frontVowels}/#`);
    word.replace("k", "c", `#_${frontVowels}`);
    word.replace("ɣ", "ʝ", `_${frontVowels}`);
    word.replace("ɣ", "ʝ", "æ/e/eː/i/iː_C/#");
    word.replace("k", "c", `æ/e/eː/i/iː,s_${frontVowels}/C/#`);
    word.replace("k", "c", "#,s_");
    word.replace("k", "c", "_c");
    word.replace("g", "ɟ", "_ɟ");
    word.replace("ŋ", "ɲ", "_c/ɟ");

    //I-mutation
    word.forEach(segment => {
        if (segment.nextVowel().match("{i/iː}[!stressed]") || segment.nextVowel().ctxMatch("C,j_"))
            switch (segment.value) {
                case "ɑ":
                    if (segment.ctxMatch("_m/n/ɲ/ŋ"))
                        segment.value = "e";
                    else
                        segment.value = "æ";
                    break;
                case "ɑː":
                    segment.value = "æː";
                    break;
                case "æ":
                case "æɑ̯":
                    segment.value = "e";
                    break;
                case "æːɑ̯":
                    segment.value = "eː";
                    break;
                case "eo̯":
                    segment.value = "iu̯";
                    break;
                case "eːo̯":
                    segment.value = "iːu̯";
                    break;
                case "o":
                    segment.value = "ø";
                    break;
                case "oː":
                    segment.value = "øː";
                    break;
                case "u":
                    segment.value = "y";
                    break;
                case "uː":
                    segment.value = "yː";
                    break;
            }
    });

    word.replace("ɑː", "æː", "_j");

    word.replace("ʝ", "ɣ", "ɑ/ɑː/æɑ̯/æːɑ̯/eo̯/eːo̯/o/oː/u/uː_");
    word.replace("ɣ", "ʝ", "æ/æː/e/eː/i/iː/ø/øː/y/yː_C/#");

    let voicedConsonants = "b/d/g/ɣ/ʝ/j/l/ɫ/m/n/r/rˠ/w";
    word.replace("v ð z", "f θ s");
    word.replace("f θ s", "v ð z", `V/${voicedConsonants}_V/${voicedConsonants}`, segment => segment.prevVowel().stressed);
    word.replace("f θ s", "v ð z", `V_${voicedConsonants}`, segment => !segment.stressed);

    word.replace("x", "ç", "æ/æː/e/eː/ø/øː/i/iː/y/yː/ç_");

    word.replace("l n r w", "l̥ n̥ r̥ ʍ", "h_");

    addRow("EOE", "Early Anglian Old English", "700", getSpelling_OE_runic(), word, true);
}

function EOE_to_OE() {
    word = outcomes.EOE.duplicate();

    word.forEach(segment => {
        if (
            segment.match("ɑ/æ/e", "C/V_C,V") && !segment.stressed && segment != word.vowels.atIdx(0)
            && !(segment.ctxMatch("C,p/t/c/k/b/d/ɟ/g/f/v/θ/ð/s/z_p/k/b/g/f/v/ç/x") && segment.relIdx(-1).value != segment.relIdx(1).value)
            && !segment.ctxMatch("ç/x_p/k/b/g/f/v") && !segment.ctxMatch("C[!=l/r]_ç/x") && !segment.ctxMatch("C[!=l/r/m/n]_f/v")
        )
            segment.remove();
    });

    word.remove("j", "C,C_");
    word.remove("j", "V,w_");

    //High vowel loss after heavy syllables (final first)
    word.forEach(segment => {
        if (
            segment.match("{i/u}[!stressed]", "[!=w]_#")
            && (segment.ctxMatch("C,C_") || segment.prevVowel().value.includes("ː")
                || (word.vowels.length == 3 && word.vowels.atIdx(0).ctxMatch("_C,V") && !word.vowels.atIdx(0).value.includes("ː")))
        )
            segment.remove();
    });
    word.forEach(segment => {
        if (
            segment.match("{i/u}[!stressed]") && (segment.ctxMatch("C_C,V") || segment.ctxMatch("C_s/θ,#") || segment.ctxMatch("C_s,t,#"))
            && !segment.match("i", "_j/w") && (segment.ctxMatch("C,C_") || segment.prevVowel().value.includes("ː"))
        )
            segment.remove();
    });
    word.remove("w", "C_C");
    word.replace("c ɟ", "k g", "_C[!=c/ɟ/r]", null, true);
    word.replace("l r", "ɫ rˠ", "_C");
    word.replace("l", "ɫ", "ɫ_");
    word.replace("r", "rˠ", "rˠ_");
    word.replace("b d g v ð z", "p t k f θ s", "_p/t/k/f/s", null, true);
    word.replace("d v ð z", "t f θ s", "_θ");
    word.replace("θ", "t", "t/s_");
    word.replace("d", "t", "p/t/k/f/s_");
    word.remove("t", "t_t");
    word.forEach(segment => {
        if (segment.match("C") && (segment.ctxMatch("_C,C[!=l/r]/#") || segment.ctxMatch("C_C[!=l/r]")) && segment.value == segment.relIdx(1).value) {
            if (segment.relIdx(1).ctxMatch("_#"))
                segment.relIdx(1).finalGeminate = true;
            segment.remove();
        }
    });
    word.remove("ɫ/rˠ/x/ç", "C[!=w]_C");
    word.remove("m/n", "C[!=rˠ]_C");
    word.remove("t/d", "t/d_l");
    word.replace("n", "ɲ", "_c/ɟ");
    word.replace("n/ɲ", "ŋ", "_k/g");

    word.replaceSeq("i[!stressed],j", "", "C_V");

    word.remove("w[!stressed]", "æ/æː/e/eː/i/iː/y/yː_V");

    word.replace("ʝ", "j");
    word.replace("c ɟ", "t͡ʃ d͡ʒ");
    word.replace("t͡ʃ", "t", "_t͡ʃ");
    word.replace("d͡ʒ", "d", "_d͡ʒ");
    word.replace("ɲ", "n", "_t͡ʃ/d͡ʒ");
    word.replaceSeq("s,t͡ʃ", "ʃ,ʃ");
    word.remove("ʃ", "_ʃ", segment => !segment.ctxMatch("V_ʃ,V[!stressed]"));

    //Back mutation
    word.replace("e i", "eo̯ iu̯", "_C[!=k/g],ɑ/ɑː/o/oː/u/uː");

    //Anglian smoothing
    word.replace("æɑ̯", "e", "_rˠ,k/ɣ/x");
    word.replace("æɑ̯ æːɑ̯ eo̯ eːo̯ iu̯ iːu̯", "æ eː e eː i iː", "_k/ɣ/g/x");
    word.replace("æɑ̯ æːɑ̯ eo̯ eːo̯ iu̯ iːu̯", "æ eː e eː i iː", "_ɫ/rˠ,k/ɣ/x");

    //H-loss
    let voicedConsonants = "b/d/g/ɣ/ʝ/j/l/ɫ/m/n/r/rˠ/w";
    word.forEach(segment => {
        if (segment.match("x/ç", `V/${voicedConsonants}_V/${voicedConsonants}`)) {
            if (segment.ctxMatch("V_") && segment.relIdx(-1).value[1] != "ː")
                segment.relIdx(-1).value = segment.relIdx(-1).value.slice(0, 1) + "ː" + segment.relIdx(-1).value.slice(1);
            segment.remove();
        }
    });

    word.forEach(segment => {
        if (segment.match("V", "_V[!stressed]") && !segment.match("i[!stressed]", "_ɑ")) {
            if (segment.match("e/eː/eo̯/eːo̯", "_ɑ/ɑː/o/oː/u/uː"))
                segment.value = "eːo̯";
            else if (segment.match("i/iː/iu̯/iːu̯", "_ɑ/ɑː/o/oː/u/uː"))
                segment.value = "iːu̯";
            else if (segment.match("u/uː", "_y/yː"))
                segment.value = "yː";
            else if (segment.match("V", "_V") && segment.value[1] != "ː")
                segment.value = segment.value.slice(0, 1) + "ː" + segment.value.slice(1);

            segment.relIdx(1).remove();
        }
    });

    word.replace("oː[!stressed]", "i", "_j");
    word.remove("j", "i[!stressed]_V");

    word.replace("e/eo̯/iu̯", "i", "_x/ç,t/θ/s");

    word.replace("ç", "x");
    word.replace("x", "ç", "æ/æː/e/eː/ø/øː/i/iː/y/yː/ç_");

    //Epenthesis in final clusters
    if (word.endMatch("C,r") || word.endMatch("C[!=t/d/f/v/θ/ð/s/z/j/r],l"))
        if (word.vowels.atIdx(-1).match("æ/æː/e/eː/ø/øː/i/iː/y/yː"))
            word.insert("e", -1);
        else
            word.insert("u", -1);

    word.replace("x/ç", "k", "_s");

    //Unstressed vowel shortening & mergers
    word.forEach(segment => {
        if (segment.match("V") && segment.idx > word.stressedVowel.idx)
            segment.value = segment.value[0];
    });
    word.forEach(segment => {
        if (!segment.stressed)
            switch (segment.value) {
                case "æ":
                case "i":
                case "ø":
                case "y":
                    if (segment.ctxMatch("_t͡ʃ/ʃ/ç/ŋ/j/V[!stressed]"))
                        segment.value = "i";
                    else
                        segment.value = "e";
                    break;
                case "o":
                    segment.value = "ɑ";
                    break;
                case "u":
                    if (segment.ctxMatch("_C[!=m/ŋ/k]") && segment.prevVowel().value != "u")
                        segment.value = "o";
                    break;
            }
    });

    word.replace("θ", "s", "_s");
    word.replace("iː", "i", "_s,s");
    word.remove("s", "s_C[!=l]/l[!stressed]/#");

    word.remove("h", "_l̥/n̥/r̥/ʍ");
    word.replace("ɑ[stressed]", "ɒ", "_m/n/ŋ");

    //Early pre-cluster shortening
    word.forEach(segment => {
        if (segment.value[1] == "ː" && segment.ctxMatch("_C,C") && (segment.relIdx(3).match("C") || segment.idx < word.vowels.atIdx(-2).idx))
            segment.value = segment.value.slice(0, 1) + segment.value.slice(2);
    });

    word.replace("iu̯ iːu̯", "eo̯ eːo̯");

    word.replace("ɣ", "g", "#_");
    word.replace("ɣ[stressed]", "g");

    //Fricative voicing allophony
    word.replace("v ð z", "f θ s", "_#");

    addRow("OE", "Late Anglian Old English", "900", getSpelling_OE(), word);
}

function PWG_to_OHG() {
    word = outcomes.PWG.duplicate();

    word.replaceSeq("i[stressed],j", "iː");
    word.replaceSeq("u,w", "uː");

    word.replace("ɹ", "r");

    word.insert("b", "m_r");

    word.replace("kʷ gʷ xʷ", "k g x", "", segment => segment.idx > word.stressedVowel.idx);

    word.replaceSeq("kʷ", "k,w");
    word.replaceSeq("gʷ", "g,w");
    word.replaceSeq("xʷ", "x,w");
    word.replace("x", "h", "#_");
    word.replace("x", "h", "_V[stressed]");

    word.vowels.forEach(segment =>
        segment.origOpenSyll = segment.ctxMatch("_C,V/j") || segment.ctxMatch("_j/w,C,V/j") || segment.ctxMatch("_V/#")
        || (word.partOfSpeech == "noun" && segment.ctxMatch("_C,#"))
    );

    //Denasalization
    word.forEach(segment => {
        if (segment.value.includes("\u0303"))
            segment.value = segment.value[0] + (segment.value.slice(2) || "");
    });

    word.replace("e", "i", "", segment => segment.nextVowel().match("u[!stressed]"));

    word.remove("ɑ[!stressed]", "_#");

    word.replace("j", "i[type=vowel]", "C[!=j]_#");
    word.replace("w", "u[type=vowel]", "C[!=j/w]_#");
    word.replace("i,j", "iː", "C[!=j]_#");
    word.replace("u,w", "uː", "C[!=j/w]_#");

    if ((word.endMatch("C[!=j/w],l/r") || word.endMatch("C[!=j/w/l/r/m],m/n")) && word.atIdx(-1).value != word.atIdx(-2).value)
        word.insert("ɑ", -1);

    if ((word.endMatch("C[!=j/w],l/r,V[!stressed]") || word.endMatch("C[!=j/w/l/r/m],m/n,V[!stressed]")) && word.atIdx(-2).value != word.atIdx(-3).value) {
        word.insert(word.atIdx(-1).value, -2);
        word.atIdx(-1).remove();
    }

    //Elision of medial vowels after heavy stressed syllables
    if (word.partOfSpeech == "conjVerb" && word.stressedVowel.idx < word.vowels.atIdx(-2).idx && (word.stressedVowel.value.length > 1 || word.stressedVowel.ctxMatch("_C,C"))) {
        let newWord = word.duplicate();
        newWord.stressedVowel.nextVowel().remove();
        newWord.replace("b d g", "p t k", "_p/t/k");
        newWord.replace("b d g", "p t k", "p/t/k_");
        newWord.remove("C", "_C", s => s.value[0] == s.relIdx(1).value[0] && !s.ctxMatch("V_C,V") && !s.ctxMatch("_p/t/k/b/d/g,r") && !s.ctxMatch("_p/k/b/g,l"));
        if (!newWord.some(s => s.match("l/r/w", "C_C")) && !newWord.some(s => s.match("m/n", "C[!=l/r]_C")))
            word = newWord;
    }

    //Elision of final close vowels after heavy stressed syllables
    if (
        word.partOfSpeech != "conjVerb" && !(word.partOfSpeech == "nounPl" && word.endMatch("i")) && word.vowels.atIdx(-2).stressed
        && (word.endMatch("C,C,i/u") || (word.endMatch("C,i/u") && word.vowels.atIdx(-2).value.length > 1))
    )
        word.atIdx(-1).remove();
    word.replace("j", "i[type=vowel]", "C[!=j]_#");
    word.replace("w", "u[type=vowel]", "C[!=j/w]_#");
    word.replace("i,j", "iː", "C[!=j]_#");
    word.replace("u,w", "uː", "C[!=j/w]_#");

    word.remove("n", "m_#");

    word.replace("β ɣ", "b g");

    word.replace("ɸ", "f");

    word.replace("x", "h");

    word.replace("s", "s̠");

    word.replace("f[!stressed] s̠[!stressed]", "v z̠", "V/j/w/l/r_V/l/r/m/n");
    word.forEach(segment => {
        if (segment.match("f/s̠", "V/j/w/l/r_#") && outcomes.PWG.atIdx(-1).match("V"))
            segment.devoiced = true;
    });

    //High German consonant shift
    word.replace("t", "t͡s", "#/t/l/r/n_V/j/w/#");
    word.replace("t[stressed]", "t͡s", "[!=s̠]_V/j/w/#");
    word.replace("p", "p͡f", "#/p/l/r/m_");
    word.replace("p[stressed]", "p͡f", "[!=s̠]_");
    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);

        if (segment.match("t", "V/j/w_V/j/w/#")) {
            segment.value = "s";
            if (segment.ctxMatch("V_") && segment.relIdx(-1).value.length == 1) {
                segment.prevVowel().origOpenSyll = false;
                word.insert("s", segment.idx);
            }
        }

        if (segment.match("p", "V/j/w/f_[!=p͡f]")) {
            segment.value = "f";
            if (segment.ctxMatch("V_") && segment.relIdx(-1).value.length == 1) {
                segment.prevVowel().origOpenSyll = false;
                if (!segment.ctxMatch("_C[!=j/w/l/r]"))
                    word.insert("f", segment.idx);
            }
        }

        if (segment.match("k", "V/j/w/x_[!=k]")) {
            segment.value = "x";
            if (segment.ctxMatch("V_") && segment.relIdx(-1).value.length == 1) {
                segment.prevVowel().origOpenSyll = false;
                if (!segment.ctxMatch("_C[!=j/w/l/r]"))
                    word.insert("x", segment.idx);
            }
        }
    }
    word.replace("d", "t");
    word.replaceSeq("b,b", "p,p");
    word.replaceSeq("g,g", "k,k");

    word.remove("C[!=j/w]", "_C,#", segment => segment.value[0] == segment.relIdx(1).value[0]);

    word.vowels.forEach(segment => {
        if (segment.ctxMatch("_C,V/j"))
            segment.origOpenSyll = true;
    });

    word.replace("h[!stressed]", "x", "V/C_C");
    word.replace("h", "x", "x_");

    word.replace("eː oː", "ie̯ uo̯", "", segment => segment.idx <= word.stressedVowel.idx);

    word.replaceSeq("ɑ/e,j[!stressed]", "ei̯");
    word.replaceSeq("ɑ/o,w[!stressed]", "ou̯");

    word.replace("ei̯", "eː", "_h/r/w/#");
    word.replace("ou̯", "oː", "_t/d/s/s̠/z̠/n/l/r/h/#");

    word.replaceSeq("e,w[!stressed]", "io̯");
    word.replaceSeq("i,w[!stressed]", "iu̯");

    word.replace("iu̯[!stressed]", "i", "_#");
    word.remove("iu̯[!stressed]", "_i[!stressed],#");

    word.remove("j/w", "_#");

    word.replace("e[stressed]", "ɛ");

    //I-mutation
    word.forEach(segment => {
        if (segment.nextVowel().match("{i/iː}[!stressed]") || segment.nextVowel().ctxMatch("C,j_"))
            switch (segment.value) {
                case "ɑ":
                    segment.value = "æ";
                    break;
                case "ɑː":
                    segment.value = "æː";
                    break;
                case "o":
                    segment.value = "ø";
                    break;
                case "oː":
                    segment.value = "øː";
                    break;
                case "u":
                    segment.value = "y";
                    break;
                case "uː":
                    segment.value = "yː";
                    break;
                case "uo̯":
                    segment.value = "yø̯";
                    break;
                case "ou̯":
                    segment.value = "øy̯";
                    break;
            }
    });

    if (word.partOfSpeech == "inf" || word.partOfSpeech == "conjVerb")
        word.forEach(segment => {
            if (segment.match("ɑ", "j_") && segment.idx > word.stressedVowel.idx)
                segment.value = "e";
        });

    word.remove("j[!stressed]", "C[!=r]_");
    word.forEach(segment => {
        if (segment.match("i", "C_j,V") && !segment.stressed) {
            segment.relIdx(1).remove();
            segment.remove();
        }
    });

    word.remove("j[!stressed]", "V_");

    word.remove("h/w", "#_C");
    word.remove("{h/w}[stressed]", "_C");

    word.remove("j", "_i/iː/ie̯/io̯/iu̯");

    word.replace("æ", "e", "", segment => !segment.ctxMatch("_x,t/s̠"));

    word.replace("ɑː eː iː oː uː", "ɑ e i o u", "_#", segment => !segment.stressed && !(word.partOfSpeech == "nounPl" && segment.match("ɑː", "_#")));

    word.replace("θ", "d");

    if (word.partOfSpeech == "conjVerb")
        word.replace("d", "t", "_#");

    word.replace("ɑ[!stressed]", "i", "#,g_");

    addRow("OHG", "Old High German", "900", getSpelling_OHG(), word);
}

function OHG_to_MHG() {
    word = outcomes.OHG.duplicate();

    word.replace("m", "n", "_#", segment => !segment.prevVowel().stressed);

    word.replace("p͡f[!stressed]", "f", "l/r_");

    word.replace("h", "x", "_#");

    word.remove("j[!stressed]", "r_");

    word.replace("æ", "e");

    word.replace("f", "v", "#_");
    word.replace("f[stressed]", "v");
    word.replace("s̠", "z̠", "[!=p/t/k/f/x/s̠]_V");
    word.replace("s̠[stressed]", "z̠", "_V");

    word.remove("ŋ", "n,i_g");

    word.replace("d", "t", "#_w");
    word.replace("d[stressed]", "t", "_w");

    word.replace("t[!stressed]", "d", "n_", segment => !(word.partOfSpeech == "conjVerb" && segment.ctxMatch("_ə,#")));

    word.replace("m", "n", "_f/v");

    word.replaceSeq("s̠,k", "ʃ,ʃ");
    word.remove("ʃ", "_ʃ", segment => !segment.ctxMatch("V_ʃ,V[!stressed]"));

    word.replace("V[!stressed]", "ə", "_C[!=ŋ]/V[stressed]/#", segment => (segment.value.length == 1 || segment.ctxMatch("_C,#")) && !segment.match("i", "_ʃ"));

    word.replace("io̯/ie̯ uo̯ yø̯", "iə̯ uə̯ yə̯");

    word.replace("iu̯", "yː");

    word.remove("w", "_C");

    if (word.partOfSpeech == "conjVerb" && word.endMatch("ə,t,ə"))
        word.atIdx(-2).inSuffix = true;

    //Elision of medial schwa
    for (let i = 0; i < word.vowels.length; i++) {
        let segment = word.vowels[i];
        if (segment.match("ə") && segment != word.vowels.atIdx(0) && segment != word.vowels.atIdx(-1)) {
            let newWord = word.duplicate();
            newWord.atIdx(segment.idx).remove();
            newWord.replace("s", "s̠", "_C[!=s]");
            newWord.replace("s", "s̠", "C[!=s]_");
            newWord.replace("z̠", "s̠", "_s̠");
            newWord.replace("z̠", "s̠", "s̠_");
            newWord.replace("v", "f", "_f");
            newWord.replace("v", "f", "f_");
            newWord.remove("C", "_C", s => s.value[0] == s.relIdx(1).value[0] && !s.ctxMatch("V_C,V") && !s.ctxMatch("_p/t/k/b/d/g,r") && !s.ctxMatch("_p/k/b/g,l") && !s.ctxMatch("_C[!=l/r],l/r,ə,#") && !s.ctxMatch("_C[!=l/r/m/n],m/n,ə,#"));
            newWord.remove("h/w", "_C");
            if (
                !newWord.some(s => s.match("r/w", "C_C")) && !newWord.some(s => s.match("l", "C[!=r]_C")) && !newWord.some(s => s.match("m/n", "C[!=l/r]_C"))
                && !newWord.some(s => s.match("f/v/ʃ/x", "p/t/k/b/d/g/p͡f/t͡s/f/v/s̠/z̠/ʃ_p/t/k/b/d/g/p͡f/t͡s/f/v/s̠/z̠/ʃ"))
            ) {
                word = newWord;
                i--;
            }
        }
    }
    word.replace("n", "ŋ", "_k/g");
    word.replace("s̠", "z̠", "#/V/l/r/m/n_V");
    word.replace("z̠[!stressed]", "s̠", "p/t/f/k/x_");

    word.forEach(segment => {
        if (segment.match("V") && segment.ctxMatch("C[!=r],l/r_[!={r/k/g/x}[!stressed]]") && !segment.stressed && segment.relIdx(-1).value != segment.relIdx(-2).value && !segment.ctxMatch("l_l")) {
            word.insert(segment.relIdx(-1).value, segment.idx + 1);
            segment.relIdx(-1).remove();
        }
    });
    if (word.endMatch("C[!=l/r/m],m/n,ə")) {
        word.insert(word.atIdx(-2).value, word.length);
        word.atIdx(-3).remove();
    }

    word.forEach(segment => {
        if (segment.match("ɑː/æː/iə̯/yə̯", "_ə"))
            word.insert("j", segment.idx + 1);

        if (segment.match("uː/uə̯/øy̯", "_ə"))
            word.insert("w", segment.idx + 1);
    });

    word.replace("ɑː", "æː", "_j");

    word.slice().reverse().forEach(segment => {
        if (segment.match("b/d/g/z̠", "_p/t/k/p͡f/t͡s/f/s/s̠/ʃ/x/#")) {
            if (segment.match("b"))
                segment.value = "p";
            else if (segment.match("d"))
                segment.value = "t";
            else if (segment.match("g"))
                segment.value = "k";
            else if (segment.match("z̠"))
                segment.value = "s̠";
            segment.devoiced = true;
        }
    });

    addRow("MHG", "Middle High German", "1200", getSpelling_MHG(), word, true);
}

function MHG_to_ModG() {
    word = outcomes.MHG.duplicate();

    word.replace("s̠", "ʃ", "#_C");
    word.replace("s̠[stressed]", "ʃ", "_C");

    word.replace("iː uː yː", "ei̯ ou̯ øy̯");

    word.replace("ei̯ ou̯ øy̯", "aɪ̯ aʊ̯ ɔʏ̯");

    word.replace("iə̯ uə̯ yə̯", "iː uː yː");

    word.replace("ɛ æː", "e eː");

    word.replace("u y", "o ø", "_m/n,m/n");

    word.replace("b[!stressed]", "m", "m_");
    word.replace("g[!stressed]", "ŋ", "ŋ_");

    word.replace("t", "t͡s", "#_w");
    word.replace("t[stressed]", "t͡s", "_w");

    word.replace("V", "ə", "_C[!=ŋ/ʃ]", segment => segment.idx > word.stressedVowel.idx);

    word.replace("ə", "i", "_k/g/x", segment => segment.idx > word.stressedVowel.idx);

    //Open syllable lengthening
    word.replace("ɑ e i o u ø y", "ɑː eː iː oː uː øː yː", "", segment => segment.stressed
        && ((segment.origOpenSyll && !(segment.ctxMatch("_C,C") && word.partOfSpeech != "conjVerb") && !segment.ctxMatch("_t/m"))
            || segment.ctxMatch("_r,t/d/t͡s/#")));

    //Closed syllable shortening
    word.replace("ɑː eː iː oː uː øː yː", "ɑ e i o u ø y", "_C",
        segment => (!segment.origOpenSyll || (segment.ctxMatch("_C,C") && word.partOfSpeech != "conjVerb")) && !segment.ctxMatch("_r,t/d/t͡s/#"));

    //Degemination
    word.remove("C", "", segment => segment.value[0] == segment.relIdx(1).value[0]);

    word.replace("v", "f", "#_");
    word.replace("v[stressed]", "f");

    word.replace("s̠ z̠", "s z");

    word.forEach(segment => {
        if (segment.match("h[!stressed]", "V/C_")) {
            if (segment.prevVowel().value.length == 1)
                segment.prevVowel().value += "ː";
            segment.prevVowel().droppedH = true;
            segment.remove();
        }
    });
    word.replaceSeq("ɛː", "eː");

    word.replaceSeq("ɑ/ɑː,w", "aʊ̯");

    word.replace("w", "β");

    word.replace("β", "b", "l/r_");

    word.remove("{j/β}[!stressed]", "V/C_");

    word.replace("s/z", "ʃ", "r_V/#", segment => segment.prevVowel().stressed);

    if (
        (word.partOfSpeech == "conjVerb" || word.partOfSpeech == "noun" || word.partOfSpeech == "nounPl")
        && word.vowels.atIdx(-1).match("ə", "_s/t") && !word.vowels.atIdx(-1).ctxMatch("t͡s/s/z/ʃ_s")
        && !word.vowels.atIdx(-1).ctxMatch("t/d_t") && !word.vowels.atIdx(-1).ctxMatch("C[!=l/r],m/n_")
        && !word.vowels.atIdx(-1).ctxMatch("C[!=l/r/m/n],x_")
    ) {
        word.vowels.atIdx(-1).relIdx(1).inSuffix = true;
        word.vowels.atIdx(-1).remove();
    }

    if (word.partOfSpeech == "noun" && (word.gender != "f" || !word.vowels.atIdx(-2).stressed) && !word.endMatch("C[!=l/r/m/n],x,ə"))
        word.remove("ə", "_#");

    word.remove("β", "_C/#");

    word.slice().reverse().forEach(segment => {
        if (segment.match("b/d/g/z", "_p/t/k/p͡f/t͡s/f/s/ʃ/x/#")) {
            if (segment.match("b"))
                segment.value = "p";
            else if (segment.match("d"))
                segment.value = "t";
            else if (segment.match("g"))
                segment.value = "k";
            else if (segment.match("z"))
                segment.value = "s";
            segment.devoiced = true;
        }
    });

    word.forEach(segment => {
        if (segment.match("aɪ̯/aʊ̯/ɔʏ̯", "_r,C/#"))
            word.insert("ə", segment.idx + 1);
    });

    word.replace("ɑ ɑː e i o u ø y", "a aː ɛ ɪ ɔ ʊ œ ʏ");

    word.replace("x", "ç", "ɛ/eː/ɪ/iː/œ/øː/ʏ/yː/aɪ̯/ɔʏ̯/C_");
    word.replace("x", "χ", "a/aː/ʊ/aʊ̯_");

    addRow("ENHG", "Early New High German", "1600", getSpelling_ENHG(), word, true);


    word.replace("v", "f");

    word.replace("β", "v");

    //By analogy with voiced stops
    word.remove("p[devoiced]", "m_");
    word.remove("k[devoiced]", "ŋ_");

    word.earlyStandardWord = word.duplicate();

    word.replace("ç/x/χ", "k", "_s");

    word.replace("k", "ç", "ɪ[!stressed]_#");

    word.replace("r", "ʁ");

    word.replace("ʁ[!stressed]", "ɐ̯", "V_C/#/V[stressed]");
    word.replaceSeq("ə,ɐ̯", "ɐ");

    if (word.partOfSpeech == "noun" || word.partOfSpeech == "nounPl")
        word.replace("ə", "ɪ", "ç_n,#");

    if (word.partOfSpeech == "inf" || word.partOfSpeech == "conjVerb")
        word.remove("ə", "V[!=aɪ̯/aʊ̯/ɔʏ̯]_n,#");

    //Syllabic consonants
    word.forEach(segment => {
        if (segment.match("ə", "_m/n/l,C/#")) {
            segment.value = segment.relIdx(1).value + "̩";
            segment.relIdx(1).remove();
        }
    });

    word.replace("n̩", "m̩", "p/b_m/n/l/r/#");
    word.replace("n̩", "ŋ̍", "k/g_m/n/l/r/#");

    word.replace("p t k", "pʰ tʰ kʰ", "[!=s/ʃ]_", segment => segment.ctxMatch("_V/#") || segment.stressed);

    word.forEach(segment => {
        if (segment.match("V", "#_") || segment.match("V[stressed]", "V_")) {
            word.insert("ʔ", segment.idx);
            if (segment.stressed)
                segment.relIdx(-1).stressed = true;
        }
    });

    word.replace("eː", "ɛː", "_ʁ,V");

    word.remove("p", "m_t");
    word.remove("k", "ŋ_C[!=l/r]");
    word.replace("t͡s[!stressed]", "s", "l/n_");

    word.replace("aː eː iː oː uː øː yː", "a e i o u ø y", "_ɐ̯");

    addRow("ModG", "Modern German", "", getSpelling_ModG(word.earlyStandardWord), word);
}

function getSpelling_OE_runic() {
    let str = "";
    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);
        switch (segment.value) {
            case "u":
            case "uː":
                str += "ᚢ";
                break;
            case "o":
            case "oː":
                str += "ᚩ";
                break;
            case "i":
            case "iː":
                str += "ᛁ";
                break;
            case "e":
            case "eː":
                str += "ᛖ";
                break;
            case "ø":
            case "øː":
                str += "ᛟ";
                break;
            case "ɑ":
            case "ɑː":
                str += "ᚪ";
                break;
            case "æ":
            case "æː":
                str += "ᚫ";
                break;
            case "y":
            case "yː":
                str += "ᚣ";
                break;
            case "æɑ̯":
            case "æːɑ̯":
                str += "ᛠ";
                break;
            case "eo̯":
            case "eːo̯":
                str += "ᛖᚩ";
                break;
            case "iu̯":
            case "iːu̯":
                str += "ᛁᚢ";
                break;
            case "f":
            case "v":
                str += "ᚠ";
                break;
            case "θ":
            case "ð":
                str += "ᚦ";
                break;
            case "r":
            case "rˠ":
            case "r̥":
                str += "ᚱ";
                break;
            case "k":
            case "c":
                str += "ᚳ";
                break;
            case "ɣ":
            case "ʝ":
            case "g":
            case "ɟ":
                str += "ᚷ";
                break;
            case "w":
            case "ʍ":
                str += "ᚹ";
                break;
            case "h":
            case "x":
            case "ç":
                str += "ᚻ";
                break;
            case "n":
            case "ɲ":
            case "ŋ":
            case "n̥":
                str += "ᚾ";
                break;
            case "j":
                str += "ᛡ";
                break;
            case "p":
                str += "ᛈ";
                break;
            case "s":
            case "z":
                str += "ᛋ";
                break;
            case "t":
                str += "ᛏ";
                break;
            case "b":
                str += "ᛒ";
                break;
            case "m":
                str += "ᛗ";
                break;
            case "l":
            case "ɫ":
            case "l̥":
                str += "ᛚ";
                break;
            case "d":
                str += "ᛞ";
                break;
        }
    }

    return str.replace(/s$/, `<span class="nonHist">s</span>`);
}

function getSpelling_OE() {
    let str = "";
    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);
        switch (segment.value) {
            case "ɑ":
            case "ɒ":
            case "ɑː":
                if (segment.ctxMatch("j_"))
                    str += "ea";
                else
                    str += "a";
                break;
            case "æ":
            case "æː":
                str += "æ";
                break;
            case "e":
            case "eː":
                str += "e";
                break;
            case "i":
            case "iː":
                str += "i";
                break;
            case "o":
            case "oː":
                if (segment.ctxMatch("j_"))
                    str += "eo";
                else
                    str += "o";
                break;
            case "ø":
            case "øː":
                str += "oe";
                break;
            case "u":
            case "uː":
                if (segment.ctxMatch("j_"))
                    str += "eo";
                else
                    str += "u";
                break;
            case "y":
            case "yː":
                str += "y";
                break;
            case "æɑ̯":
            case "æːɑ̯":
                str += "ea";
                break;
            case "eo̯":
            case "eːo̯":
                str += "eo";
                break;
            case "b":
                str += "b";
                break;
            case "k":
            case "t͡ʃ":
                if (segment.ctxMatch("_s")) {
                    str += "x";
                    i++;
                } else {
                    str += "c";
                }
                break;
            case "d":
                if (segment.ctxMatch("_d͡ʒ"))
                    str += "c";
                else
                    str += "d";
                break;
            case "f":
            case "v":
                str += "f";
                break;
            case "g":
                if (segment.ctxMatch("_g"))
                    str += "c";
                else
                    str += "g";
                break;
            case "d͡ʒ":
                if (segment.ctxMatch("_#"))
                    str += "cg";
                else
                    str += "g";
                break;
            case "ɣ":
            case "j":
                str += "g";
                break;
            case "h":
            case "x":
            case "ç":
                str += "h";
                break;
            case "l̥":
                str += "hl";
                break;
            case "n̥":
                str += "hn";
                break;
            case "r̥":
                str += "hr";
                break;
            case "ʍ":
                str += "hw";
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
                    str += "sc";
                break;
            case "t":
                if (segment.ctxMatch("_t͡ʃ"))
                    str += "c";
                else
                    str += "t";
                break;
            case "w":
                str += "w";
                break;
            case "θ":
            case "ð":
                str += "þ";
                break;
        }

        if (segment.finalGeminate && !str.endsWith("cg"))
            str += str.at(-1);
    }

    return str;
}

function getSpelling_OHG() {
    let str = "";
    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);
        switch (segment.value) {
            case "ɑ":
            case "ɑː":
            case "æ":
            case "æː":
                str += "a";
                break;
            case "ɛ":
            case "e":
            case "eː":
                str += "e";
                break;
            case "i":
            case "iː":
                str += "i";
                break;
            case "o":
            case "oː":
            case "ø":
            case "øː":
                str += "o";
                break;
            case "u":
            case "uː":
            case "y":
            case "yː":
                str += "u";
                break;
            case "ei̯":
                str += "ei";
                break;
            case "ie̯":
                str += "ie";
                break;
            case "io̯":
                str += "io";
                break;
            case "iu̯":
                str += "iu";
                if (segment.ctxMatch("_V"))
                    str += "w";
                break;
            case "ou̯":
            case "øy̯":
                str += "ou";
                if (segment.ctxMatch("_V"))
                    str += "w";
                break;
            case "uo̯":
            case "yø̯":
                str += "uo";
                break;
            case "b":
                str += "b";
                break;
            case "d":
                str += "d";
                break;
            case "f":
                str += "f";
                break;
            case "g":
                str += "g";
                break;
            case "h":
            case "x":
                str += "h";
                break;
            case "j":
                if (segment.ctxMatch("#_") || segment.stressed)
                    str += "j";
                else
                    str += "i";
                break;
            case "k":
                if (segment.ctxMatch("_w")) {
                    str += "qu";
                    i++;
                } else {
                    str += "k";
                }
                break;
            case "l":
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
                if (!segment.ctxMatch("_p͡f"))
                    str += "p";
                break;
            case "p͡f":
                str += "ph";
                break;
            case "r":
                str += "r";
                break;
            case "s̠":
            case "z̠":
                str += "s";
                break;
            case "t":
                if (segment.ctxMatch("_t͡s"))
                    str += "z";
                else
                    str += "t";
                break;
            case "v":
                str += "v";
                break;
            case "w":
                str += "w";
                break;
            case "s":
            case "t͡s":
                str += "z";
                break;
        }
    }

    return str;
}

function getSpelling_MHG() {
    let str = "";
    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);
        switch (segment.value) {
            case "ɑ":
            case "ɑː":
                str += "a";
                break;
            case "æː":
                str += "æ";
                break;
            case "ɛ":
            case "e":
            case "eː":
            case "ə":
                str += "e";
                break;
            case "i":
            case "iː":
                str += "i";
                break;
            case "o":
            case "oː":
            case "ø":
            case "øː":
                str += "o";
                break;
            case "u":
            case "uː":
            case "y":
                str += "u";
                break;
            case "yː":
                str += "iu";
                if (segment.ctxMatch("_V"))
                    str += "w";
                break;
            case "ei̯":
                str += "ei";
                break;
            case "iə̯":
                str += "ie";
                break;
            case "ou̯":
            case "øy̯":
                str += "ou";
                if (segment.ctxMatch("_V"))
                    str += "w";
                break;
            case "uə̯":
                str += "uo";
                break;
            case "yə̯":
                str += "ue";
                break;
            case "b":
                str += "b";
                break;
            case "x":
                if (segment.ctxMatch("_x"))
                    break;
                if (segment.ctxMatch("_C"))
                    str += "h";
                else
                    str += "ch";
                break;
            case "d":
                str += "d";
                break;
            case "f":
                str += "f";
                break;
            case "g":
                str += "g";
                break;
            case "h":
                str += "h";
                break;
            case "j":
                if (segment.ctxMatch("_i/iː/iə̯/yː"))
                    str += "g";
                else
                    str += "j";
                break;
            case "k":
                if (segment.ctxMatch("_w")) {
                    str += "qu";
                    i++;
                } else if (segment.ctxMatch("V_C/#") && !segment.stressed) {
                    str += "c";
                } else {
                    str += "k";
                }
                break;
            case "l":
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
                if (!segment.ctxMatch("_p͡f"))
                    str += "p";
                break;
            case "p͡f":
                str += "pf";
                break;
            case "r":
                str += "r";
                break;
            case "s̠":
            case "z̠":
                str += "s";
                break;
            case "ʃ":
                if (!segment.ctxMatch("_ʃ"))
                    str += "sch";
                break;
            case "t":
                str += "t";
                break;
            case "v":
                str += "v";
                break;
            case "w":
                str += "w";
                break;
            case "s":
            case "t͡s":
                str += "z";
                break;
        }
    }

    return str.replaceAll("w", `<span class="nonHist">w</span>`).replace(/s$/, `<span class="nonHist">s</span>`);
}

function getSpelling_ENHG() {
    let str = "";
    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);

        let doubleCons = segment.ctxMatch("V[stressed]_V/#/C[inSuffix]") && segment.relIdx(-1).value.length == 1;

        switch (segment.value) {
            case "a":
            case "aː":
                str += "a";
                if (segment.droppedH || segment.ctxMatch("_V"))
                    str += "h";
                break;
            case "ɛ":
            case "eː":
                if (
                    ((segment.MHGValue == "e" || segment.MHGValue == "æː") && (word.partOfSpeech == "nounPl" || word.partOfSpeech == "conjVerb")
                        && (segment == word.vowels.atIdx(-1) || (segment == word.vowels.atIdx(-2) && word.vowels.atIdx(-1).OHGValue?.startsWith("i"))))
                )
                    str += "ä";
                else
                    str += "e";
                if (segment.droppedH || segment.ctxMatch("_V"))
                    str += "h";
                break;
            case "ɪ":
                str += "i";
                break;
            case "iː":
                if (segment.ctxMatch("#_")) {
                    str += "jh";
                } else {
                    str += "ie";
                    if (segment.droppedH || segment.ctxMatch("_V"))
                        str += "h";
                }
                break;
            case "ɔ":
            case "oː":
                str += "o";
                if (segment.droppedH || segment.ctxMatch("_V"))
                    str += "h";
                break;
            case "ʊ":
            case "uː":
                str += "u";
                if (segment.droppedH || segment.ctxMatch("_V"))
                    str += "h";
                break;
            case "œ":
            case "øː":
                str += "ö";
                if (segment.droppedH || segment.ctxMatch("_V"))
                    str += "h";
                break;
            case "ʏ":
            case "yː":
                str += "ü";
                if (segment.droppedH || segment.ctxMatch("_V"))
                    str += "h";
                break;
            case "aɪ̯":
                if (segment.droppedH)
                    str += "eih";
                else if (segment.ctxMatch("_#"))
                    str += "ey";
                else
                    str += "ei";
                break;
            case "aʊ̯":
                if (segment.droppedH)
                    str += "auh";
                else if (segment.ctxMatch("_V/#"))
                    str += "aw";
                else
                    str += "au";
                break;
            case "ɔʏ̯":
                if (
                    ((segment.MHGValue == "øy̯" || segment.MHGValue == "yː") && (word.partOfSpeech == "nounPl" || word.partOfSpeech == "conjVerb")
                        && (segment == word.vowels.atIdx(-1) || (segment == word.vowels.atIdx(-2) && word.vowels.atIdx(-1).OHGValue?.startsWith("i"))))
                )
                    str += "ä";
                else
                    str += "e";
                if (segment.droppedH)
                    str += "uh";
                else if (segment.ctxMatch("_V/#"))
                    str += "w";
                else
                    str += "u";
                break;
            case "ə":
                str += "e";
                break;
            case "b":
                if (doubleCons)
                    str += "bb";
                else
                    str += "b";
                break;
            case "ç":
            case "x":
            case "χ":
                str += "ch";
                break;
            case "d":
                if (doubleCons)
                    str += "dd";
                else
                    str += "d";
                break;
            case "f":
                if (segment.ctxMatch("#_") || segment.stressed || segment.devoiced)
                    str += "f";
                else
                    str += "ff";
                break;
            case "v":
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
            case "j":
                str += "j";
                break;
            case "k":
                if (segment.ctxMatch("_β")) {
                    str += "qu";
                    i++;
                } else if (segment.devoiced) {
                    str += "g";
                } else if (segment.ctxMatch("V[stressed]_") && segment.relIdx(-1).value.length == 1 || (segment.ctxMatch("C_") && !segment.stressed)) {
                    str += "ck";
                } else {
                    str += "k";
                }
                break;
            case "l":
                if (doubleCons)
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
                if (doubleCons)
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
                else if (segment.devoiced)
                    str += "b";
                else
                    str += "p";
                break;
            case "p͡f":
                str += "pf";
                break;
            case "r":
                if (doubleCons)
                    str += "rr";
                else
                    str += "r";
                break;
            case "z":
                str += "s";
                break;
            case "s":
                if (segment.ctxMatch("V_V"))
                    str += "ss";
                else if (segment.ctxMatch("V/l/r_#/C[inSuffix]") && segment.prevVowel().stressed)
                    str += "ß";
                else
                    str += "s";
                break;
            case "ʃ":
                if (segment.ctxMatch("_p/t") && (segment.ctxMatch("#_") || segment.stressed))
                    str += "s";
                else
                    str += "sch";
                break;
            case "t":
                if (doubleCons)
                    str += "tt";
                else if (segment.devoiced && !(segment.ctxMatch("C[!=m/n/l/r]_") && !str.endsWith("b") && !str.endsWith("g")))
                    str += "d";
                else
                    str += "t";
                break;
            case "β":
                str += "w";
                break;
            case "t͡s":
                if (segment.ctxMatch("#_") || segment.stressed)
                    str += "z";
                else
                    str += "tz";
                break;
        }
    }

    return str;
}

function getSpelling_ModG(word) {
    let str = "";
    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);

        let addH = segment.value.length > 1 && segment.stressed && (segment.droppedH || segment.ctxMatch("_V/#") || segment.ctxMatch("_m/n/l/r,V/#/C[inSuffix]"));

        let doubleCons = segment.ctxMatch("V[stressed]_V/#/C[inSuffix]") && segment.relIdx(-1).value.length == 1;

        switch (segment.value) {
            case "a":
            case "aː":
                str += "a";
                if (addH)
                    str += "h";
                break;
            case "ɛ":
            case "eː":
                if (
                    ((segment.MHGValue == "e" || segment.MHGValue == "æː") && (word.partOfSpeech == "nounPl" || word.partOfSpeech == "conjVerb")
                        && (segment == word.vowels.atIdx(-1) || (segment == word.vowels.atIdx(-2) && word.vowels.atIdx(-1).OHGValue?.startsWith("i"))))
                )
                    str += "ä";
                else
                    str += "e";
                if (addH)
                    str += "h";
                break;
            case "ɪ":
                str += "i";
                break;
            case "iː":
                if (segment.ctxMatch("#_")) {
                    str += "ih";
                } else {
                    str += "ie";
                    if (segment.droppedH || segment.ctxMatch("_V"))
                        str += "h";
                }
                break;
            case "ɔ":
            case "oː":
                str += "o";
                if (addH)
                    str += "h";
                break;
            case "ʊ":
            case "uː":
                str += "u";
                if (addH)
                    str += "h";
                break;
            case "œ":
            case "øː":
                str += "ö";
                if (addH)
                    str += "h";
                break;
            case "ʏ":
            case "yː":
                str += "ü";
                if (addH)
                    str += "h";
                break;
            case "aɪ̯":
                str += "ei";
                if (segment.droppedH)
                    str += "h";
                break;
            case "aʊ̯":
                str += "au";
                break;
            case "ɔʏ̯":
                if (
                    ((segment.MHGValue == "øy̯" || segment.MHGValue == "yː") && (word.partOfSpeech == "nounPl" || word.partOfSpeech == "conjVerb")
                        && (segment == word.vowels.atIdx(-1) || (segment == word.vowels.atIdx(-2) && word.vowels.atIdx(-1).OHGValue?.startsWith("i"))))
                )
                    str += "äu";
                else
                    str += "eu";
                break;
            case "ə":
                str += "e";
                break;
            case "b":
                if (doubleCons)
                    str += "bb";
                else
                    str += "b";
                break;
            case "ç":
            case "x":
            case "χ":
                str += "ch";
                break;
            case "d":
                if (doubleCons)
                    str += "dd";
                else
                    str += "d";
                break;
            case "f":
                if (doubleCons)
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
            case "j":
                str += "j";
                break;
            case "k":
                if (segment.ctxMatch("_v")) {
                    str += "qu";
                    i++;
                } else if (segment.devoiced) {
                    str += "g";
                } else if (segment.ctxMatch("V[stressed]_") && segment.relIdx(-1).value.length == 1) {
                    str += "ck";
                } else {
                    str += "k";
                }
                break;
            case "l":
                if (doubleCons)
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
                if (doubleCons)
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
                else if (segment.devoiced)
                    str += "b";
                else
                    str += "p";
                break;
            case "p͡f":
                str += "pf";
                break;
            case "r":
                if (doubleCons)
                    str += "rr";
                else
                    str += "r";
                break;
            case "z":
                str += "s";
                break;
            case "s":
                if (doubleCons || segment.ctxMatch("V[!stressed]_V"))
                    str += "ss";
                else if (segment.ctxMatch("V[stressed]_V/#/C[inSuffix]") && !segment.devoiced)
                    str += "ß";
                else
                    str += "s";
                break;
            case "ʃ":
                if (segment.ctxMatch("_p/t") && (segment.ctxMatch("#_") || segment.stressed))
                    str += "s";
                else
                    str += "sch";
                break;
            case "t":
                if (doubleCons)
                    str += "tt";
                else if (segment.devoiced && !(segment.ctxMatch("C[!=m/n/l/r]_") && !str.endsWith("b") && !str.endsWith("g")))
                    str += "d";
                else
                    str += "t";
                break;
            case "v":
                str += "w";
                break;
            case "t͡s":
                if (doubleCons)
                    str += "tz";
                else
                    str += "z";
                break;
        }
    }

    if (word.partOfSpeech == "noun" || word.partOfSpeech == "nounPl")
        return str[0].toUpperCase() + str.slice(1);
    else
        return str;
}