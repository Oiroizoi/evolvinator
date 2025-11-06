function getIPA_Lat() {
    let charToPhoneme = [
        ["a", "a"],
        ["ā", "aː"],
        ["ae", "ae̯"],
        ["au", "au̯"],
        ["b", "b"],
        ["c", "k"],
        ["ch", "kʰ"],
        ["d", "d"],
        ["e", "ɛ"],
        ["ē", "eː"],
        ["f", "f"],
        ["g", "g"],
        ["h", "h"],
        ["i", "ɪ"],
        ["ī", "iː"],
        ["l", "l"],
        ["m", "m"],
        ["n", "n"],
        ["o", "ɔ"],
        ["ō", "oː"],
        ["oe", "oe̯"],
        ["p", "p"],
        ["ph", "pʰ"],
        ["qu", "kʷ"],
        ["r", "r"],
        ["rh", "r̥"],
        ["s", "s"],
        ["t", "t"],
        ["th", "tʰ"],
        ["u", "ʊ"],
        ["ū", "uː"],
        ["v", "w"],
        ["x", "k,s"],
        ["y", "ʏ"],
        ["ȳ", "yː"],
        ["z", "z"],
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

    word.forEach(segment => {
        if (segment.value == "g" && segment.ctxMatch("_ʊ,V")) {
            segment.value = "gʷ";
            segment.relIdx(1).remove();
        }

        if (segment.value == "ɪ" && segment.ctxMatch("#/V_V")) {
            segment.value = "j";
            segment.type = "consonant";
            if (segment.relIdx(-1).type == "vowel")
                word.insert("j", segment.idx);
        }
    });
    word.replace("ɛ", "e", "_V");
    word.replace("ɪ", "i", "_V");
    word.replace("ɔ", "o", "_V");
    word.replace("ʊ", "u", "_V");
    word.replace("ʏ", "y", "_V");

    word.remove("g", "#_n");

    word.remove("h", "C_");
    word.replace("h", "ɦ", "V_V");

    word.replace("kʷ", "k", "_ʊ/u/uː");
    word.replace("gʷ", "g", "_ʊ/u/uː");

    word.forEach(segment => {
        if (segment.value == "z" && segment.ctxMatch("V_V"))
            word.insert("z", segment.idx);
    });

    word.forEach(segment => {
        if (segment.value == "s" && segment.relIdx(-1).value == "m")
            word.insert("p", segment.idx);
    });

    //Allophones
    word.replace("l", "ɫ");
    word.replace("ɫ", "l", "_ɪ/i/iː");
    word.replace("ɫ", "l", "ɫ_");
    word.replace("ɫ", "l", "_l");
    word.replace("r", "r̥", "_r̥");
    word.replace("m", "n", "_C[!=n]");
    word.replace("n", "m", "_m/p/b/pʰ");
    word.replace("n", "ŋ", "_k/g/kʷ/gʷ/kʰ");
    word.replace("g", "ŋ", "_n");
    word.replace("b", "p", "_p/t/k/kʷ/pʰ/tʰ/kʰ/f/s");
    word.replace("b", "m", "_m");
    word.replace("p", "f", "_f");
    word.replace("g", "k", "_p/t/k/kʷ/pʰ/tʰ/kʰ/f/s");
    word.replace("p", "b", "_b/d/g/gʷ/z");
    word.replace("t", "d", "_b/d/g/gʷ/z");
    word.replace("k", "g", "_b/d/g/gʷ/z");

    //Assimilation of /d/
    word.forEach(segment => {
        if (segment.value == "d" && segment.relIdx(1).match("s", "p", "t", "k", "kʷ", "pʰ", "tʰ", "kʰ", "g", "gʷ", "n", "l"))
            segment.value = segment.relIdx(1).value[0];
    });
    word.replace("d", "t", "_f");


    let stressedVowel;
    if (word.atIdx(-1).value == "k" && (word.atIdx(-2).type == "consonant" || word.atIdx(-2).value.length > 1))
        stressedVowel = word.vowels.atIdx(-1);
    else if (word.vowels.length < 3)
        stressedVowel = word.vowels.atIdx(0);
    else if (
        word.vowels.atIdx(-2).value.length > 1
        || (word.vowels.atIdx(-2).ctxMatch("_C,C") && !(word.vowels.atIdx(-2).ctxMatch("_p/t/k/b/d/g/pʰ/tʰ/kʰ/f,l/ɫ/r")))
    )
        stressedVowel = word.vowels.atIdx(-2);
    else
        stressedVowel = word.vowels.atIdx(-3);

    stressedVowel.stressed = true;
    if (stressedVowel.relIdx(-1).type == "consonant")
        stressedVowel.relIdx(-1).stressed = true;
    if (stressedVowel.relIdx(-2).match("p", "t", "k", "b", "d", "g", "pʰ", "tʰ", "kʰ", "f") && stressedVowel.relIdx(-1).match("l", "ɫ", "r"))
        stressedVowel.relIdx(-2).stressed = true;
    if (stressedVowel.relIdx(-2).value == "s" && stressedVowel.relIdx(-1).match("p", "t", "k", "pʰ", "tʰ", "kʰ")
        && stressedVowel.relIdx(-3).type == "consonant")
        stressedVowel.relIdx(-2).stressed = true;
    if (stressedVowel.relIdx(-3).value == "s" && stressedVowel.relIdx(-2).match("p", "t", "k", "pʰ", "tʰ", "kʰ")
        && stressedVowel.relIdx(-1).match("l", "r") && stressedVowel.relIdx(-3).type == "consonant")
        stressedVowel.relIdx(-3).stressed = true;
    word.forEach(segment => {
        if (word.vowels.atIdx(0).stressed && segment.idx < word.vowels.atIdx(0).idx)
            segment.stressed = true;
    });

    word.forEach(segment => {
        if (segment.type == "vowel" && (segment.ctxMatch("_n,f/s") || segment.ctxMatch("_m,#"))) {
            switch (segment.value) {
                case "a":
                    segment.value = "aː";
                    break;
                case "ɛ":
                    segment.value = "eː";
                    break;
                case "ɪ":
                    segment.value = "iː";
                    break;
                case "ɔ":
                    segment.value = "oː";
                    break;
                case "ʊ":
                    segment.value = "uː";
                    break;
                case "ʏ":
                    segment.value = "yː";
                    break;
            }
            segment.nasalized = true;
            segment.relIdx(1).remove();
        }
    });

    addRow("Lat", "Classical Latin", "AD 50", getSpelling_Lat(), word);
}

function Lat_to_LL() {
    word = outcomes.Lat.duplicate();

    word.replace("ʏ", "ɪ");
    word.replace("y", "i");
    word.replace("yː", "iː");

    word.replace("pʰ", "f");
    word.replace("p", "f", "_f");
    word.replace("tʰ", "t");
    word.replace("kʰ", "k");
    word.replace("r̥", "r");
    word.replaceSeq("z,z", "d,d͡z");
    word.replace("z", "d͡z");

    word.replace("ɫ", "l", "_V");

    word.remove("s", "k_s");
    word.remove("t", "s_p/t/k/b/d/g/f");

    if (word.atIdx(0).match("p", "t", "k", "b", "d", "g", "f") && word.atIdx(1).type == "consonant" && !word.atIdx(1).match("l", "r"))
        word.atIdx(0).remove();

    word.remove("ɦ");
    word.remove("h");

    word.replace("ɛ", "e", "_V");
    word.replace("ɪ", "i", "_V");
    word.replace("ɔ", "o", "_V");
    word.replace("ʊ", "u", "_V");

    //Denasalization
    word.forEach(segment => {
        if (segment.nasalized) {
            if (segment.negIdx == -1 && segment.stressed) {
                switch (segment.value) {
                    case "ãː":
                        segment.value = "a";
                        break;
                    case "ẽː":
                        segment.value = "ɛ";
                        break;
                    case "ĩː":
                        segment.value = "ɪ";
                        break;
                    case "õː":
                        segment.value = "ɔ";
                        break;
                    case "ũː":
                        segment.value = "ʊ";
                        break;
                }
                word.insert("n", word.length);
            }
            segment.nasalized = false;
        }
    });

    word.forEach(segment => {
        if (segment.type == "vowel" && (segment.relIdx(1).value == segment.value || segment.relIdx(1).value == segment.value + "ː")) {
            switch (segment.value) {
                case "a":
                    segment.value = "aː";
                    break;
                case "ɛ":
                    segment.value = "eː";
                    break;
                case "ɪ":
                    segment.value = "iː";
                    break;
                case "ɔ":
                    segment.value = "oː";
                    break;
                case "ʊ":
                    segment.value = "uː";
                    break;
            }
            if (segment.relIdx(1).stressed)
                segment.stressed = true;
            segment.relIdx(1).remove();
        }
    });

    word.remove("ɪ", "{a/aː}[stressed],w_t/k");

    word.replace("w", "β", "_V");

    word.forEach(segment => {
        if (segment.value == "ɪ" && segment.relIdx(-1).match("a", "aː", "e", "eː", "o", "oː") && segment != word.vowels.atIdx(-1)) {
            segment.value = "j";
            segment.type = "consonant";
            if (segment.stressed)
                segment.relIdx(-1).stressed = true;
        }

        if (segment.value == "ʊ" && segment.relIdx(-1).match("a", "aː", "e", "eː", "o", "oː") && segment != word.vowels.atIdx(-1)) {
            segment.value = "w";
            segment.type = "consonant";
            if (segment.stressed)
                segment.relIdx(-1).stressed = true;
        }
    });

    if (word.vowels.atIdx(-2).ctxMatch("_C,C") && word.vowels.atIdx(-3).stressed) {
        word.vowels.atIdx(-2).stressed = true;
        word.vowels.atIdx(-3).stressed = false;
    }

    word.forEach(segment => {
        if (segment.match("i", "iː") && segment.relIdx(1).match("ɪ", "i", "iː")) {
            segment.value = "iː";
            if (segment.relIdx(1).stressed)
                segment.stressed = true;
            segment.relIdx(1).remove();
        }
    });

    word.replace("ae̯", "ɛː");
    word.replace("oe̯", "eː");

    word.forEach(segment => {
        if (segment.match("i", "e", "iː", "eː") && segment.relIdx(1).type == "vowel" && (!segment.stressed || segment == word.vowels.atIdx(-3)) && !segment.ctxMatch("#,w_")) {
            segment.value = "j";
            segment.type = "consonant";
            if (segment.stressed)
                segment.relIdx(1).stressed = true;
            if (segment.relIdx(1).stressed)
                segment.stressed = true;
        }

        if (segment.match("u", "o", "uː", "oː") && segment.relIdx(1).type == "vowel" && !segment.stressed && !segment.ctxMatch("#,j_")) {
            segment.value = "w";
            segment.type = "consonant";
            if (segment.relIdx(1).stressed)
                segment.stressed = true;
        }

        if (segment.match("u", "o", "uː", "oː") && segment.relIdx(1).type == "vowel" && segment == word.vowels.atIdx(-3) && !segment.ctxMatch("#,j_")) {
            segment.relIdx(1).stressed = true;
            if (word.vowels.length > 3) {
                word.forEach(segment => segment.stressed = false);
                word.vowels.atIdx(-4).stressed = true;
            }
            segment.value = "w";
            segment.type = "consonant";
        }
    });
    word.remove("j", "#/C_j");

    word.remove("w", "C,C[!=k/g/n]_");
    word.remove("w", "_{ɔ/o/oː/ʊ/u/uː}[!stressed]");

    word.replace("kʷ", "k", "_ɔ/o/oː/ʊ/u/uː");
    word.replace("gʷ", "g", "_ɔ/o/oː/ʊ/u/uː");

    word.replace("w", "β", "#/V_V");

    word.replace("e", "ɛ");
    word.replace("i", "ɪ");
    word.replace("o", "ɔ");
    word.replace("u", "ʊ");
    word.replace("ʊ", "u", "_ɪ/iː/j");

    word.replaceSeq("kʷ", "k,w");
    word.replaceSeq("gʷ", "g,w");

    word.forEach(segment => {
        if (segment.value == "j" && segment.ctxMatch("r/w_ɛ/eː")) {
            segment.relIdx(1).value = "eː";
            segment.remove();
        }

        if (segment.value == "w" && segment.relIdx(1).match("ɔ", "oː")) {
            segment.relIdx(1).value = "oː";
            segment.remove();
        }
    });

    word.remove("w", "k/g_j");

    word.forEach(segment => {
        if (segment.value == "au̯" && !segment.stressed && (segment.nextVowel().match("ʊ", "u", "uː") && segment.nextVowel().relIdx(-1).match("k", "g")))
            segment.value = "a";
    });

    word.replace("g", "w", "_m");
    word.replaceSeq("a,w", "au̯");
    word.replaceSeq("au̯,w", "au̯");
    word.remove("w", "uː_");

    word.forEach(segment => {
        if (
            segment.value == "k" && segment.relIdx(1).value == "s"
            && !(segment.relIdx(-1).selfMatch("V/j/w") && segment.relIdx(2).selfMatch("V/j/w"))
            && !(segment.negIdx == -2 && segment.relIdx(-1).stressed)
        )
            segment.remove();
    });

    word.replace("s", "f", "_f");
    word.replace("r", "s", "_s");

    //Degeminate s after long vowels
    word.forEach(segment => {
        if (segment.value == "s" && segment.ctxMatch("V_s") && segment.relIdx(-1).value.length > 1)
            segment.remove();
    });

    word.replace("eː", "iː", "_s,t,j");
    word.replace("oː", "uː", "_s,t,j");

    //Early syncope
    word.forEach(segment => {
        if (
            segment.value == "ʊ" && segment.ctxMatch("t/d/k/g_l/r,V") && !segment.stressed && segment != word.vowels.atIdx(0)
            && !(word.partOfSpeech == "inf" && segment.ctxMatch("_r,V,#"))
        )
            segment.remove();

        if (segment.type == "vowel" && segment.ctxMatch("V,s_p/t/k,V/l/r") && !segment.match("a", "aː") && !segment.stressed)
            segment.remove();

        if (segment.value == "ɪ" && segment.ctxMatch("V,l/r/n_t/d") && !segment.stressed && segment == word.vowels.atIdx(-2))
            segment.remove();
    });
    word.forEach(segment => {
        if (segment.type == "consonant" && segment.value == segment.relIdx(1).value && !segment.ctxMatch("V/j/w_C,V/j/w") && !segment.ctxMatch("_p/t/k/b/d/g,l/r"))
            segment.remove();
    });
    word.forEach(segment => {
        if (segment.value == "m" && segment.relIdx(1).match("l", "r"))
            word.insert("b", segment.idx + 1);
    });
    word.replace("l", "ɫ", "_C");
    word.replace("ɫ", "l", "_j/w");
    word.replace("ɫ", "l", "_l");

    word.replace("b", "β", "V_V/w/r");

    word.replace("t", "k", "_l");
    word.replace("d", "g", "_l");
    word.replace("t", "k", "_k,l");
    word.replace("d", "g", "_g,l");

    word.forEach(segment => {
        if (segment.value == "j" && segment.idx < word.vowels.atIdx(0).idx && segment.ctxMatch("C[!=t/k/d/g/d͡z]_")) {
            segment.value = "i";
            segment.type = "vowel";
            segment.stressed = false;
        }
    });

    //Palatalization (with gemination in many cases)
    word.forEach(segment => {
        if (segment.type == "consonant" && segment.relIdx(1).value == "j" && segment.value != "j") {
            if (
                !segment.match("s", "t", "r")
                && (segment.relIdx(-1).type == "vowel" || (segment.match("p", "t", "k", "b", "d", "g") && segment.relIdx(-1).match("ɫ", "r")))
            )
                word.insert(segment.value, segment.idx);
            segment.value += "ʲ";
            segment.relIdx(1).remove();
        }
    });

    if (word.atIdx(0).value == "s" && word.atIdx(1).type == "consonant" && word.atIdx(1).value != "w")
        word.insert("ɪ", 0);

    if (word.partOfSpeech == "conjVerb" && word.atIdx(-1).value == "r")
        word.atIdx(-1).remove();

    if (word.atIdx(-1).value == "r" && word.atIdx(-2).type == "vowel" && !word.atIdx(-2).stressed && word.atIdx(-3).match("p", "t", "k", "b", "d", "g", "f")) {
        word.insert("r", -2);
        word.atIdx(-1).remove();
    }

    if (word.partOfSpeech == "noun" && word.vowels.length == 1 && word.atIdx(-1).type == "consonant" && word.atIdx(-1).value != "s")
        word.insert("e", word.length);
    word.replace("ɫ", "l", "_V");

    //Allophonic lengthening
    word.forEach(segment => {
        if (segment.type == "vowel" && segment.value.endsWith("ː"))
            segment.value = segment.value[0];

        if (
            segment.type == "vowel" && segment.stressed && segment.value.length == 1
            && (segment.ctxMatch("_V/#") || segment.ctxMatch("_C,V") || segment.ctxMatch("_p/t/k/b/d/g/f/β,l/r/w,V"))
        )
            segment.value += "ː";
    });

    word.replace("ɛ[!stressed]", "e");
    word.replace("ɔ[!stressed]", "o");

    word.replace("s", "z", "_m/mʲ/n/nʲ/b/bʲ/d/dʲ/g/gʲ/β/βʲ/z/zʲ/l/lʲ/r/rʲ");
    word.replace("z", "s", "s_");

    word.replace("k", "ŋ", "_n");

    word.remove("p/k", "m/ŋ_C[!=l/lʲ/r/rʲ/w]");

    word.replace("tʲ", "t͡sʲ");
    word.replace("dʲ", "d͡zʲ");
    word.replace("d͡z", "d͡zʲ", "V/C_");

    word.replace("j", "d͡zʲ", "#_");

    word.replace("kʲ", "c");
    word.replace("gʲ", "ɟ");
    word.replace("k", "c", "_c");
    word.replace("g", "ɟ", "_ɟ");
    word.replace("ŋ", "ɲ", "_c/ɟ");

    word.remove("ɫ", "_nʲ");

    word.forEach(segment => {
        if (segment.value == "j" && segment.ctxMatch("V_V"))
            word.insert("j", segment.idx);
    });

    word.replaceSeq("au̯", "a,w");

    word.forEach(segment => {
        if (segment.type == "consonant")
            segment.stressed = false;
    });
    if (word.stressedVowel.relIdx(-1).type == "consonant" && !(word.stressedVowel.relIdx(-1).value == "w" && word.stressedVowel.relIdx(-2).type == "vowel"))
        word.stressedVowel.relIdx(-1).stressed = true;
    if (word.stressedVowel.relIdx(-2).match("p", "t", "k", "b", "d", "g", "f", "β") && word.stressedVowel.relIdx(-1).match("l", "r"))
        word.stressedVowel.relIdx(-2).stressed = true;
    if (word.stressedVowel.relIdx(-2).type == "consonant" && word.stressedVowel.relIdx(-1).value == "w")
        word.stressedVowel.relIdx(-2).stressed = true;
    if (word.stressedVowel.relIdx(-2).value == "s" && word.stressedVowel.relIdx(-1).match("p", "t", "k")
        && word.stressedVowel.relIdx(-3).type == "consonant")
        word.stressedVowel.relIdx(-2).stressed = true;
    if (word.stressedVowel.relIdx(-3).value == "s" && word.stressedVowel.relIdx(-2).match("p", "t", "k")
        && word.stressedVowel.relIdx(-1).match("l", "r") && word.stressedVowel.relIdx(-4).type == "consonant")
        word.stressedVowel.relIdx(-3).stressed = true;
    word.forEach(segment => {
        if (word.vowels.atIdx(0).stressed && segment.idx < word.vowels.atIdx(0).idx)
            segment.stressed = true;
    });

    addRow("LL", "Vulgar Late Latin", "400", getSpelling_Lat(), word);
}

function LL_to_WR(variety) {
    word = outcomes.LL.duplicate();

    word.replace("nʲ", "ɲ", "V/C_");
    word.replace("n", "ɲ", "_ɲ");
    word.replace("lʲ", "ʎ", "V/C_");
    word.replace("l", "ʎ", "_ʎ");

    word.replace("k", "kʲ", "_ɛ/ɛː/e/eː/ɪ/ɪː/i/iː");
    word.replace("g", "gʲ", "_ɛ/ɛː/e/eː/ɪ/ɪː/i/iː");

    if (variety == "portuguese") {
        word.remove("p", "_pʲ");
        word.remove("b", "_bʲ");
    }

    //Consonant assimilation
    word.replace("p", "s", "_s/sʲ");
    word.replace("d", "s", "_s/sʲ");
    word.replace("r", "s", "_s/sʲ");
    word.replace("p", "t", "_t/t͡sʲ");
    word.replace("b", "d", "_d/d͡zʲ");
    word.replace("b", "β", "_β/βʲ");
    if (variety != "french")
        word.replace("m", "n", "_n/ɲ");
    word.remove("s", "s_C");

    if (variety != "french") {
        word.forEach(segment => {
            if (segment.value == "d͡zʲ" && segment.ctxMatch("C,d_") && !(variety == "spanish" && segment.relIdx(-2).match("j", "w"))) {
                segment.value = "t͡sʲ";
                segment.relIdx(-1).value = "t";
            }
        });
        word.replace("d͡zʲ", "t͡sʲ", "m/n/ɫ/r_");
    }

    if (variety == "french")
        word.replace("d͡z", "d͡zʲ");

    word.replace("gʲ", "j");
    word.replace("ɟ", "j");
    word.replace("d͡zʲ", "j");
    word.replace("d", "j", "_j");
    word.replace("g", "j", "_j");
    word.replace("ɲ", "n", "_j");
    word.replace("ŋ", "n", "_j");
    word.remove("j", "C[!=w]_j");

    word.replace("c", "t͡sʲ");
    word.replace("t͡sʲ", "t", "_t͡sʲ");
    word.replace("ɲ", "n", "_t͡sʲ");
    word.replace("ʎ", "ɫ", "_t͡sʲ");

    //First lenition
    word.replace("f", "β", "V/j/w_V/w/r/rʲ");
    word.replace("fʲ", "βʲ", "V/j/w_V");
    word.replace("s", "z", "V/j/w_V/w");
    word.replace("sʲ", "zʲ", "V/j/w_V");
    word.replace("bʲ", "βʲ", "V/j/w_V");
    word.replace("g", "ɣ", "V/j/w_V/w/r/rʲ");
    word.replace("p", "b", "V/j_V/w/r/rʲ/l/ʎ");
    word.replace("pʲ", "bʲ", "V/j_V");
    word.replace("k", "g", "V/j_V/w/r/rʲ/l/ʎ");
    word.replace("kʲ", "gʲ", "V/j_V");
    word.replace("t͡sʲ", "d͡zʲ", "V/j_V");
    //Preceding /w/ prevented voicing of stops in Ibero-Romance (except finally)
    //Lenition of /t/ and /d/ occurred later in Gallo-Romance
    if (variety == "french") {
        word.replace("p", "b", "w_V/w/r/rʲ/l");
        word.replace("pʲ", "bʲ", "w_V");
        word.replace("k", "g", "w_V/w/r/rʲ/l");
        word.replace("kʲ", "gʲ", "w_V");
        word.replace("t͡sʲ", "d͡zʲ", "w_V");
    } else {
        word.replace("d", "ð", "V/j/w_V/w/r/rʲ/#");
        word.replace("t", "d", "V/j_V/w/r/rʲ/#");
        word.replace("t", "d", "w_#");
    }

    word.replace("kʲ", "c");
    word.replace("gʲ", "ɟ");
    word.replace("k", "c", "_c");
    word.replace("g", "ɟ", "_ɟ");

    word.replace("d͡z", "d͡zʲ");

    //In early Ibero-Romance, all infinitives are stressed on the penult
    if (variety != "french" && word.partOfSpeech == "inf" && !word.vowels.atIdx(-2).stressed && word.atIdx(-3).type == "vowel" && word.atIdx(-2).value == "r" && word.atIdx(-1).type == "vowel") {
        if (word.stressedVowel.value.endsWith("ː"))
            word.stressedVowel.value = word.stressedVowel.value[0];

        if (word.stressedVowel.value == "ɛ")
            word.stressedVowel.value = "e";
        else if (word.stressedVowel.value == "ɔ")
            word.stressedVowel.value = "o";

        word.forEach(segment => segment.stressed = false);
        word.vowels.atIdx(-2).stressed = true;

        if (word.stressedVowel.relIdx(-1).type == "consonant" && !(word.stressedVowel.relIdx(-1).value == "w" && word.stressedVowel.relIdx(-2).type == "vowel"))
            word.stressedVowel.relIdx(-1).stressed = true;
        if (word.stressedVowel.relIdx(-2).match("p", "t", "k", "b", "d", "g", "f", "β") && word.stressedVowel.relIdx(-1).match("l", "r"))
            word.stressedVowel.relIdx(-2).stressed = true;
        if (word.stressedVowel.relIdx(-2).type == "consonant" && word.stressedVowel.relIdx(-1).value == "w")
            word.stressedVowel.relIdx(-2).stressed = true;
        word.forEach(segment => {
            if (word.vowels.atIdx(0).stressed && segment.idx < word.vowels.atIdx(0).idx)
                segment.stressed = true;
        });

        if (
            word.stressedVowel.value.length == 1
            && !(word.stressedVowel.relIdx(1).type == "consonant" && word.stressedVowel.relIdx(2).type != "vowel" &&
                !(word.stressedVowel.relIdx(1).match("p", "t", "k", "b", "d", "g", "f", "β") && word.stressedVowel.relIdx(2).match("l", "r", "w")))
        )
            word.stressedVowel.value += "ː";
    }
    if (
        variety == "spanish" && word.partOfSpeech == "inf" && word.vowels.atIdx(-2).stressed && word.vowels.atIdx(-2).value == "eː"
        && (word.vowels.atIdx(-3).match("i", "u") || word.vowels.atIdx(-2).relIdx(-1).value == "j")
    )
        word.vowels.atIdx(-2).value = "iː";

    //Metaphony
    word.forEach(segment => {
        if (segment.stressed && segment == word.vowels.atIdx(-2) && segment.nextVowel().value == "i") {
            if (segment.match("e", "eː", "ɪ", "ɪː"))
                segment.value = "i" + segment.value.slice(1);

            if (segment.match("o", "oː", "ʊ", "ʊː"))
                segment.value = "u" + segment.value.slice(1);
        }
    });

    if (variety == "french") {
        word.replace("k", "t", "_t͡sʲ");
        word.replace("g", "d", "_d͡zʲ");
    }

    word.replace("k", "x", "V/w_t/t͡sʲ/s/sʲ");

    word.replace("g", "ʎ", "V_l/ʎ");
    word.replace("l", "ʎ", "ʎ_");
    word.replace("ŋ", "ɲ", "_n/ɲ");
    word.replace("n", "ɲ", "ɲ_");
    if (variety == "french")
        word.replaceSeq("n,j", "ɲ,ɲ");

    //Later intertonic syncope
    let approximants = ["l", "ɫ", "ʎ", "r", "rʲ", "j", "w", "x"];
    let nasals = ["m", "mʲ", "n", "ɲ", "ŋ"];
    let sibilants = ["s", "sʲ", "z", "zʲ", "t͡sʲ", "d͡zʲ"];
    let fricatives = ["f", "fʲ", "β", "βʲ", "ð", "ɣ"];
    let stops = ["p", "pʲ", "b", "bʲ", "t", "d", "c", "ɟ", "k", "g"];
    word.slice().reverse().forEach(segment => {
        if (segment.type == "vowel" && !segment.stressed && segment.value != "a" && segment != word.vowels.atIdx(0) && segment != word.vowels.atIdx(-1) && segment.relIdx(-1).type != "vowel") {
            let newWord = word.duplicate();
            newWord.atIdx(segment.idx).remove();
            let surrounded = s => s.type == "consonant" && s.relIdx(-1).type == "consonant" && s.relIdx(1).type == "consonant"
                && !((s.relIdx(-1).value.slice(0, -1) || s.relIdx(-1).value) == s.value[0] && s.relIdx(-2).type == "vowel")
                && !(s.relIdx(1).value[0] == (s.value.slice(0, -1) || s.value) && s.relIdx(2).type == "vowel");

            if (
                !newWord.some(s => s.match(...approximants, ...fricatives) && surrounded(s) && s.value != "w"
                    && !(s.relIdx(-1).match(...approximants) && s.relIdx(1).match(...approximants)))
                && !newWord.some(s => s.match(...nasals) && surrounded(s) && !s.relIdx(-1).match(...approximants, ...nasals)
                    && !s.relIdx(1).match(...approximants, ...nasals))
                && !newWord.some(s => surrounded(s) && !s.relIdx(-1).match(...approximants, ...nasals, ...fricatives, "s", "sʲ", "z", "zʲ")
                    && !s.relIdx(1).match(...approximants, ...nasals, "β", "s", "z")
                    && !(s.match(...stops) && s.relIdx(-1).match(...stops) && s.relIdx(1).match(...stops, "t͡sʲ", "d͡zʲ")))
                && !newWord.some(s => s.match(...sibilants) && surrounded(s) && !s.relIdx(-1).match(...approximants))
                && !newWord.some(s => surrounded(s) && s.relIdx(-1).match(...sibilants) && s.relIdx(1).match("s", "sʲ", "z", "zʲ"))
                && !newWord.some(s => s.match(...sibilants) && surrounded(s) && !s.relIdx(1).match(...stops, ...sibilants))
                && !newWord.some(s => s.match("β", "βʲ", "ð", "ɣ", "c", "ɟ") && surrounded(s))
                && !newWord.some(s => s.match("f", "fʲ", "j") && s.relIdx(-1).type == "consonant" && s.relIdx(-1).value[0] != s.value[0]
                    && !s.relIdx(-1).match(...approximants, ...nasals, "s", "sʲ", "z", "zʲ"))
                && !newWord.some(s => s.match("f", "fʲ") && s.relIdx(1).type == "consonant" && !s.relIdx(1).match("f", "fʲ", "l", "ɫ", "ʎ", "r", "rʲ"))
                && !newWord.some(s => s.match("β", "βʲ") && s.relIdx(-1).match(...stops, "t͡sʲ", "d͡zʲ"))
                && !newWord.some(s => s.match("ð", "ɣ") && s.relIdx(-1).match(...stops, ...nasals, "l", "ɫ"))
                && !newWord.some(s => s.match("l", "ʎ") && s.relIdx(-1).match("t", "d", "c", "ɟ"))
                && !segment.ctxMatch("w_r")
                && !(segment.relIdx(1).match("β", "βʲ") && segment.relIdx(-1).match(...stops))
                && !(segment.relIdx(-1).match("k", "g") && segment.relIdx(1).match("t", "d", ...sibilants))
                && !segment.ctxMatch("_x/g,t/d/t͡sʲ/d͡zʲ")
                && !(segment.relIdx(1).value == "ɲ" && !segment.relIdx(-1).match(...nasals))
                && !(segment.relIdx(1).match(...nasals) && segment.relIdx(2).value == "ɲ" && !segment.relIdx(-1).match(...nasals))
                && !(segment.relIdx(1).value == "ʎ" && !segment.relIdx(-1).match("l", "ɫ", "ʎ"))
                && !segment.ctxMatch("_j,j")
                && !(segment.ctxMatch("_t,t͡sʲ") && segment.relIdx(-1).match(...stops))
                && !(variety != "french" && newWord.some(s => s.match(...nasals) && surrounded(s) && !s.relIdx(1).match(...nasals)))
                && !(variety != "french" && newWord.some(s => s.match(...stops) && surrounded(s) && s.relIdx(1).value == "m"))
                && !(variety != "french" && segment.ctxMatch("ɫ/r,m_n"))
                && !(variety != "french" && segment == word.vowels.atIdx(-2) && segment.relIdx(2).match("e", "i") && !segment.relIdx(1).match("n", "ɟ")
                    && !segment.relIdx(-1).match("m") && !(segment.relIdx(1).value == "r" && segment.relIdx(-2).value != "r"))
                && !(variety != "french" && segment.ctxMatch("j,j_"))
                && !(variety != "french" && segment.ctxMatch("c/ɟ_r"))
                && !(variety != "french" && segment.ctxMatch("n_m"))
                && variety != "portuguese"
            )
                segment.remove();

            if (
                variety == "portuguese" && segment.match("e", "ɪ", "i")
                && (
                    segment.relIdx(-1).match("m", "l", "r") || segment.ctxMatch("ɟ_d") || segment.ctxMatch("d/ð_ɟ")
                    || (segment.relIdx(-1).value == "n" && segment.prevVowel().stressed)
                )
                && !segment.ctxMatch("m_n") && !segment.ctxMatch("n_m")
                && segment.relIdx(1).value != "ð"
                && !newWord.some(s => s.match(...approximants, ...nasals) && surrounded(s))
            )
                segment.remove();
        }
    });
    if (variety == "french") {
        word.replace("g", "j", "V,t/d_");
    }
    word.replace("t", "c", "_c");
    word.replace("d", "ɟ", "_ɟ");
    word.replace("ð", "ɟ", "_ɟ");

    //Voicing assimilation
    word.forEach(segment => {
        if (segment.relIdx(-1).match("p", "pʲ", "t", "c", "k", "t͡sʲ", "f", "fʲ", "s", "sʲ")) {
            switch (segment.value) {
                case "b":
                    segment.value = "p";
                    break;
                case "bʲ":
                    segment.value = "pʲ";
                    break;
                case "d":
                    segment.value = "t";
                    break;
                case "ɟ":
                    segment.value = "c";
                    break;
                case "g":
                    segment.value = "k";
                    break;
                case "d͡zʲ":
                    segment.value = "t͡sʲ";
                    break;
                case "β":
                    segment.value = "f";
                    break;
                case "βʲ":
                    segment.value = "fʲ";
                    break;
                case "z":
                    segment.value = "s";
                    break;
                case "zʲ":
                    segment.value = "sʲ";
                    break;
            }
        }

        if (segment.relIdx(-1).match("b", "bʲ", "d", "ɟ", "g", "d͡zʲ", "β", "βʲ", "z", "zʲ")) {
            switch (segment.value) {
                case "p":
                    segment.value = "b";
                    break;
                case "pʲ":
                    segment.value = "bʲ";
                    break;
                case "t":
                    segment.value = "d";
                    break;
                case "c":
                    segment.value = "ɟ";
                    break;
                case "k":
                    segment.value = "g";
                    break;
                case "t͡sʲ":
                    segment.value = "d͡zʲ";
                    break;
                case "f":
                    segment.value = "β";
                    break;
                case "fʲ":
                    segment.value = "βʲ";
                    break;
                case "s":
                    segment.value = "z";
                    break;
                case "sʲ":
                    segment.value = "zʲ";
                    break;
            }
        }
    });

    //Middle consonant loss
    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);
        if (
            segment.type == "consonant" && segment.relIdx(-1).type == "consonant" && segment.relIdx(1).type == "consonant"
            && !segment.relIdx(-1).match("j", "w") && segment.relIdx(1).value != "w"
            && !(segment.relIdx(1).match(...approximants) && !segment.match(...approximants, ...nasals))
            && !(segment.match(...sibilants) && segment.relIdx(-1).match(...approximants, ...nasals))
            && !(segment.relIdx(-1).match(...approximants, ...nasals) && !segment.match(...approximants, ...nasals) && segment.value == segment.relIdx(1).value[0])
            && !(segment.value == "m" && segment.relIdx(1).value == "n" && segment.relIdx(-1).match(...approximants))
            && !(segment.relIdx(-1).match(...nasals) && segment.match(...stops) && segment.relIdx(1).value == "n")
        ) {
            segment.remove();
            i--;
        }

        if (
            segment.type == "consonant" && segment.value == segment.relIdx(1).value[0]
            && !((segment.relIdx(-1).type == "vowel" || segment.relIdx(-1).match(...approximants, ...nasals))
                && (segment.relIdx(2).type == "vowel" || segment.relIdx(2).value == "w"
                    || (segment.relIdx(1).match(...stops, "f", "fʲ") && segment.relIdx(2).match(...approximants))))
        ) {
            segment.remove();
            i--;
        }
    }
    word.forEach(segment => {
        if (segment.value == segment.relIdx(1).value[0] + "ʲ") {
            segment.value = segment.value[0];
            segment.relIdx(1).value += "ʲ";
        }
    });
    word.forEach(segment => {
        if (segment.match("m", "mʲ") && segment.relIdx(1).match("l", "r", "rʲ"))
            word.insert("b", segment.idx + 1);

        if (segment.match("s", "sʲ") && segment.relIdx(1).match("r", "rʲ"))
            word.insert("t", segment.idx + 1);

        if (segment.match("z", "zʲ") && segment.relIdx(1).match("r", "rʲ"))
            word.insert("d", segment.idx + 1);
    });
    word.forEach(segment => {
        if (segment.match(...stops, ...fricatives) && segment.relIdx(1).match(...approximants) && segment.relIdx(1).stressed && !(segment.match("t", "d", "ð") && segment.relIdx(1).value == "l"))
            segment.stressed = true;
    });

    word.replace("l", "ɫ", "_C");
    word.replace("ɫ", "l", "_l");
    word.replace("n", "ŋ", "_k/g");
    word.replace("n", "ɲ", "_c/ɟ/ɲ");
    word.replace("ŋ", "ɲ", "_c/ɟ");
    word.replace("ɫ", "ʎ", "_c/ɟ/ʎ");
    word.replace("s", "z", "_m/mʲ/n/ɲ/l/ʎ/r/rʲ/b/bʲ/d/ɟ/g/β/βʲ/ð/ɣ/z/zʲ");
    word.replace("b", "β", "_d");
    word.replace("ð", "d", "_d/d͡zʲ");
    word.replace("sʲ", "s", "_t͡sʲ");
    word.replace("zʲ", "z", "_d͡zʲ");
    word.replace("s", "sʲ", "_c");
    word.replace("z", "zʲ", "_ɟ");
    word.replaceSeq("t,s", "t͡sʲ");
    word.replaceSeq("t,sʲ", "t͡sʲ");
    word.replaceSeq("d,z", "d͡zʲ");
    word.replaceSeq("d,zʲ", "d͡zʲ");
    word.remove("s", "c/t͡sʲ_");
    word.remove("sʲ", "c/t͡sʲ_");
    word.remove("z", "ɟ/d͡zʲ_");
    word.remove("zʲ", "ɟ/d͡zʲ_");

    word.replaceSeq("ɫ,j", "ʎ,ʎ");
    if (variety == "french")
        word.replaceSeq("n,j", "ɲ,ɲ");

    if (variety == "french") {
        word.replace("d", "ð", "V/j/w_V/w/r/rʲ/#");
        word.replace("t", "d", "V/j/w_V/j/w/r/rʲ/#");
    }

    //Palatalization of velars before coronals
    word.replace("x", "j", "V/w_t/t͡sʲ/s/sʲ");
    word.replace("ŋ", "ɲ", "V/w_t/d/t͡sʲ/d͡zʲ/s/sʲ/z/zʲ");

    word.replace("ŋ", "n", "_C[!=k/g]");

    if (variety == "portuguese" && word.vowels.atIdx(-3).value == "ɛ" && word.vowels.atIdx(-3).stressed && word.vowels.atIdx(-2).value == "ɪ")
        word.vowels.atIdx(-3).value = "e";

    if (word.stressedVowel.relIdx(-1).match("ʎ", "ɲ"))
        word.stressedVowel.relIdx(-2).stressed = false;
    if (word.stressedVowel.relIdx(-2).value == "s" && word.stressedVowel.relIdx(-1).match(...stops))
        word.stressedVowel.relIdx(-2).stressed = false;

    word.replace("s", "s̺");
    word.replace("z", "z̺");
    word.replace("sʲ", "s̺ʲ");
    word.replace("zʲ", "z̺ʲ");

    //Western Romance
    outcomes.WR = word.duplicate();
}

function WR_to_IR() {
    word = outcomes.WR.duplicate();

    word.forEach(segment => {
        if (segment.value.endsWith("ː"))
            segment.value = segment.value[0];
    });

    word.replace("ɪ", "i", "_ɲ,t/t͡sʲ");
    word.replace("ʊ", "u", "_ɲ,t/t͡sʲ");

    word.replace("c", "t͡sʲ");
    word.replace("ɟ", "d͡zʲ");
    word.replace("t͡sʲ", "t", "_t͡sʲ");
    word.replace("d͡zʲ", "d", "_d͡zʲ");
    word.replace("ɲ", "n", "_t͡sʲ/d͡zʲ");
    word.replace("ʎ", "ɫ", "_t͡sʲ/d͡zʲ");
    word.replace("s̺ʲ", "s̺", "_t͡sʲ");
    word.replace("z̺ʲ", "z̺", "_d͡zʲ");

    if (word.atIdx(-1).type == "consonant" && word.atIdx(-2).type == "consonant" && !word.atIdx(-2).match("j", "w"))
        word.atIdx(-1).remove();
    word.replace("m", "n", "_#");
    word.replace("ɲ", "n", "_#");
    word.replace("ŋ", "n", "_#");

    word.forEach(segment => {
        if (segment.match("p", "t", "k") && segment.relIdx(1).match("p", "t", "k", "t͡sʲ"))
            segment.value = segment.relIdx(1).value[0];
    });

    word.replace("ɫ", "j", "ʊ_t/s̺");

    word.replace("ɪ", "e");
    word.replace("ʊ", "o");

    if ((word.partOfSpeech == "inf" || word.partOfSpeech == "conjVerb") && word.stressedVowel.relIdx(-1).value == "w" && word.stressedVowel.relIdx(-2).type == "consonant" && !word.stressedVowel.relIdx(-2).match("k", "g") && word.stressedVowel != word.vowels.atIdx(0))
        word.stressedVowel.relIdx(-1).remove();

    word.forEach(segment => {
        if (segment.match("a", "ɔ", "o") && segment.ctxMatch("_p/t/b/d/f/β/s̺/z̺,w")) {
            segment.relIdx(2).remove();
            word.insert("w", segment.idx + 1);
        }
    });
    word.replace("ɔ", "o", "_w");
    word.remove("w", "o_");

    word.forEach(segment => {
        if (segment.type == "vowel" && segment.stressed && segment.relIdx(1).match("e", "i")) {
            segment.relIdx(1).value = "j";
            segment.relIdx(1).type = "consonant";
        }

        if (segment.type == "vowel" && segment.stressed && segment.value != "i" && segment.relIdx(1).match("o", "u")) {
            segment.relIdx(1).value = "w";
            segment.relIdx(1).type = "consonant";
        }
    });

    word.remove("j", "ɛ/e/i_j");
    word.remove("j", "V/w_V");

    word.replace("ɛ/e[stressed]", "i", "_a");
    word.replace("ɔ/o[stressed]", "u", "_a");

    word.forEach(segment => {
        if (segment.value == "w" && segment.relIdx(-1).value == "k" && !(segment.relIdx(1).value == "a" && segment.idx >= word.stressedVowel.idx - 1))
            segment.remove();

        if (segment.value == "w" && segment.relIdx(-1).value == "g" && segment.relIdx(1).value != "a")
            segment.remove();
    });

    word.replace("o", "u", "_j,C[!=j]");

    word.forEach(segment => {
        if ((segment.match("s̺ʲ", "z̺ʲ", "rʲ") || (segment.value == "s̺" && segment.relIdx(1).value == "s̺ʲ")) && segment.relIdx(-1).type == "vowel") {
            if (segment.relIdx(-1).value != "i")
                word.insert("j", segment.idx);
            if (segment.value == "s̺" && segment.relIdx(1).value == "s̺ʲ")
                segment.relIdx(1).value = "s̺";
            else if (segment.value.endsWith("ʲ"))
                segment.value = segment.value.slice(0, -1);
        }
    });

    word.replace("s̺", "ʃ", "j_V/s̺");
    word.replace("s̺", "ʃ", "ʃ_");

    word.remove("j", "i_C[!=j]/#");
    word.remove("w", "u_");

    word.forEach(segment => {
        if (segment.value == "ð" && segment.ctxMatch("V/j/w_V/l/r") && !segment.ctxMatch("a/ɔ/o/u_a/ɔ/o/u"))
            segment.remove();
    });

    word.forEach(segment => {
        if (segment.value.endsWith("ʲ") && !segment.match("t͡sʲ", "d͡zʲ")) {
            if (segment.relIdx(1).type == "vowel")
                word.insert("j", segment.idx + 1);
            segment.value = segment.value.slice(0, -1);
        }
    });

    word.forEach(segment => {
        if (segment.match("e", "i") && segment.relIdx(1).type == "vowel" && segment.prevVowel().stressed) {
            segment.value = "j";
            segment.type = "consonant";
        }
    });

    word.forEach(segment => {
        if (segment.value == "j" && segment.relIdx(-1).type == "consonant" && segment.relIdx(1) == word.vowels.atIdx(0)) {
            segment.value = "i";
            segment.type = "vowel";
            segment.relIdx(-1).stressed = false;
            segment.relIdx(-2).stressed = false;
        }
    });

    word.remove("g", "#_l");

    word.replace("l", "ʎ", "p/k/f_");

    word.replaceSeq("ŋ,g,l", "ɲ,ʎ");

    word.forEach(segment => {
        if (segment.value == "r" && !segment.ctxMatch("#/r/s̺/z̺/t͡sʲ/d͡zʲ_") && !segment.relIdx(1).value.startsWith("r"))
            segment.value = "ɾ";
    });
    word.forEach(segment => {
        if (segment.value == "ɾ" && segment.relIdx(-1).value == "m")
            word.insert("b", segment.idx);

        if (segment.value == "ɾ" && segment.relIdx(-1).match("ɫ", "n", "ɲ"))
            word.insert("d", segment.idx);

        if (segment.value == "ɾ" && segment.stressed && segment.relIdx(-1).match("b", "d"))
            segment.relIdx(-1).stressed = true;
    });

    word.replace("z̺", "s̺", "_#/p/t/k/t͡sʲ/s̺");
    word.replace("s̺", "z̺", "_m/n/ɲ/b/d/g/d͡zʲ/β/ð/ɣ/l/ʎ/r");
    word.replace("d͡zʲ", "t͡sʲ", "_#/p/t/k/t͡sʲ/s̺");
    word.replace("t͡sʲ", "d͡zʲ", "_m/n/ɲ/b/d/g/d͡zʲ/β/ð/ɣ/l/ʎ/r");

    //Nasal assimilation
    word.replace("m", "n", "_t/d/t͡sʲ/d͡zʲ/s̺/z̺/t͡ʃ/ʃ/β/ð/h");
    word.replace("m", "ŋ", "_k/g/ɣ");
    word.replace("m", "ɲ", "_ɲ");
    word.replace("n", "m", "_p/b");
    word.replace("ɲ", "n", "_t/d/t͡sʲ/d͡zʲ/s̺/z̺/t͡ʃ/ʃ/β/ð/h");

    word.replace("ʎ", "ɫ", "_C");
    word.replace("ɫ", "ʎ", "_ʎ");

    word.remove("k", "_#");
    word.remove("b", "_#");

    //Degemination
    word.forEach(segment => {
        if (segment.type == "consonant" && segment.value == segment.relIdx(1).value[0] && !segment.relIdx(1).match("m", "n", "ɲ", "l", "ʎ", "r", "t͡sʲ", "d͡zʲ"))
            segment.remove();
    });

    word.replace("a", "e", "_j,C/#");
    word.replace("a", "o", "_w");

    if (word.stressedVowel.relIdx(-1).type == "consonant" && word.stressedVowel.relIdx(-1).value != "w")
        word.stressedVowel.relIdx(-1).stressed = true;
    word.forEach(segment => {
        if (word.vowels.atIdx(0).stressed && segment.idx < word.vowels.atIdx(0).idx)
            segment.stressed = true;
    });

    addRow("IR", "Ibero-Romance", "800", "", word, true);
}

function IR_to_OSp() {
    word = outcomes.IR.duplicate();

    word.replace("t͡sʲ", "t͡s");
    word.replace("d͡zʲ", "d͡z");

    word.remove("s̺", "_t͡s");
    word.remove("z̺", "_d͡z");

    word.forEach(segment => {
        if (segment.value == "j" && segment.ctxMatch("V,n_") && ((word.partOfSpeech == "inf" && segment.nextVowel().stressed) || (word.partOfSpeech == "conjVerb" && segment.prevVowel().stressed))) {
            segment.relIdx(-1).value = "ɲ";
            segment.remove();
        }
    });
    word.replace("j", "d͡z", "V,ɾ/n_");

    //Pre-yod raising
    word.vowels.forEach((segment, i) => {
        if (segment.relIdx(1).match("j", "ʎ", "ɲ")) {
            switch (segment.value) {
                case "ɛ":
                    segment.value = "e";
                    break;
                case "ɔ":
                    segment.value = "o";
                    break;
            }
        } else if (segment.nextVowel().relIdx(-1).value == "j" && segment.relIdx(1).value != "w") {
            switch (segment.value) {
                case "ɛ":
                    segment.value = "e";
                    break;
                case "e":
                    segment.value = "i";
                    break;
                case "ɔ":
                    segment.value = "o";
                    break;
                case "o":
                    segment.value = "u";
                    break;
            }
        }
    });

    word.replace("ɛ", "ie̯");
    word.replace("ɔ", "ue̯");

    word.replace("f", "ɸ");

    if (word.atIdx(0).value == "j" && word.atIdx(1).value == "a" && !word.atIdx(1).stressed)
        word.atIdx(1).value = "e";

    if (word.atIdx(0).value == "j" && word.atIdx(1).match("e", "i") && !word.atIdx(1).stressed)
        word.atIdx(0).remove();

    word.vowels.forEach(segment => {
        if (segment.value == "e" && segment.nextVowel().stressed && segment.nextVowel().relIdx(-1).match("j", "ɲ") && segment.relIdx(1).value != "j")
            segment.value = "i";

        if (segment.value == "o" && segment.nextVowel().stressed && (segment.nextVowel().relIdx(-1).match("j", "ɲ") || (segment.relIdx(1).value == "j" && segment.relIdx(2).type == "vowel")))
            segment.value = "u";
    });
    word.remove("j", "i_C");
    word.remove("w", "u_");

    word.replace("t", "t͡ʃ", "j_V");

    word.remove("j", "e_C");
    word.remove("w", "o_");

    word.remove("p", "_ʎ");
    word.remove("k", "_ʎ");
    word.remove("ɸ", "_ʎ");

    word.remove("ʎ", "ɲ_");

    word.replace("ʎ", "ʒ", "V/C_");

    word.replace("ʒ", "t͡ʃ", "C[!=ʒ/j/w]_");
    word.replace("m/ŋ", "n", "_t͡ʃ");

    word.remove("s̺", "_t͡ʃ");

    word.remove("b", "m_V");

    word.remove("w", "n_e/i/ie̯");
    word.replaceSeq("n,w", "ŋ,g,w");
    if (word.stressedVowel.relIdx(-3).value == "ŋ")
        word.stressedVowel.relIdx(-3).stressed = false;

    word.replace("a", "o", "_w");

    word.replaceSeq("l,l", "ʎ,ʎ");
    word.replaceSeq("n,n", "ɲ,ɲ");

    //Degemination
    word.forEach(segment => {
        if (segment.type == "consonant" && (segment.value == segment.relIdx(1).value || segment.value == segment.relIdx(1).value[0]))
            segment.remove();
    });

    if (word.atIdx(0).value == "j" && (word.atIdx(1).match("o", "u", "ue̯") || (word.atIdx(1).value == "a" && !word.atIdx(1).stressed)))
        word.atIdx(0).value = "ʒ";

    if (!word.vowels.atIdx(-1).stressed) {
        if (word.vowels.atIdx(-1).value == "i")
            word.vowels.atIdx(-1).value = "e";

        if (word.vowels.atIdx(-1).value == "u")
            word.vowels.atIdx(-1).value = "o";
    }

    //Loss of final /e/
    if (
        word.atIdx(-1).value == "e" && !word.atIdx(-1).stressed && word.atIdx(-2).match("l", "ɾ", "n", "s̺", "z̺", "t͡s", "d͡z", "d", "ð", "j", "w", "ʎ", "ɲ")
        && (word.atIdx(-3).type == "vowel" || (word.atIdx(-4).type == "vowel" && word.atIdx(-3).match("j", "w")))
    )
        word.atIdx(-1).remove();
    word.replace("ʎ", "l", "_#");
    word.replace("ɲ", "n", "_#");
    word.replace("z̺", "s̺", "_#");
    word.replace("d͡z", "t͡s", "_#");

    if (word.stressedVowel.value == "i" && word.stressedVowel.prevVowel().value == "i")
        word.stressedVowel.prevVowel().value = "e";

    word.remove("j", "o/u_t͡s/d͡z/t͡ʃ/s̺/z̺/ʃ/ʒ");

    word.forEach(segment => {
        if (segment.value == "o" && segment.ctxMatch("_j,C")) {
            if (segment.nextVowel().stressed) {
                segment.value = "u";
            } else {
                segment.value = "ue̯";
                segment.relIdx(1).remove();
            }
        }
    });

    word.forEach(segment => {
        if (segment.value == "ie̯") {
            word.insert("j", segment.idx);
            if (segment.stressed)
                segment.relIdx(-1).stressed = true;
            segment.value = "e";
        }

        if (segment.value == "ue̯") {
            word.insert("w", segment.idx);
            if (segment.stressed)
                segment.relIdx(-1).stressed = true;
            segment.value = "e";
        }

        if (segment.value == "e" && segment.relIdx(1).value == "w") {
            segment.value = "j";
            segment.type = "consonant";
            segment.relIdx(1).value = "o";
            segment.relIdx(1).type = "vowel";
            if (segment.stressed)
                segment.relIdx(1).stressed = true;
        }
    });
    word.remove("j", "j_");
    word.forEach(segment => {
        if (segment.value == "u" && segment.ctxMatch("_j,C/#") && !segment.stressed) {
            segment.value = "w";
            segment.type = "consonant";
            segment.relIdx(1).value = "i";
            segment.relIdx(1).type = "vowel";
        }

        if (segment.value == "i" && segment.ctxMatch("_w,C/#") && !segment.stressed) {
            segment.value = "j";
            segment.type = "consonant";
            segment.relIdx(1).value = "u";
            segment.relIdx(1).type = "vowel";
        }
    });

    word.forEach(segment => {
        if (segment.value == "i" && !segment.stressed && (segment.relIdx(-1).type == "vowel" || segment.relIdx(1).type == "vowel")) {
            segment.value = "j";
            segment.type = "consonant";
        }

        if (segment.value == "u" && !segment.stressed && (segment.relIdx(-1).type == "vowel" || segment.relIdx(1).type == "vowel")) {
            segment.value = "w";
            segment.type = "consonant";
        }

        if (segment.match("j", "w") && segment.relIdx(1).type == "vowel" && segment.relIdx(1).stressed) {
            segment.stressed = true;
            if (segment.relIdx(-1).type == "consonant")
                segment.relIdx(-1).stressed = true;
            if (segment.relIdx(-1).match("l", "ɾ") && segment.relIdx(-2).match("p", "t", "k", "b", "d", "g", "β", "ð", "ɣ", "ɸ"))
                segment.relIdx(-2).stressed = true;
        }
    });

    word.vowels.forEach(segment => {
        if (segment.nextVowel().stressed && segment.nextVowel().relIdx(-1).match("j", "ʎ", "ɲ")) {
            if (segment.value == "e" && segment.nextVowel().value != "i")
                segment.value = "i";
            else if (segment.value == "o")
                segment.value = "u";
        }
    });

    word.remove("j", "j/ʎ/ɲ/ʒ_");
    word.remove("w", "w_");
    word.remove("j", "C_w");
    word.remove("w", "C_j");
    word.remove("j", "_i");
    word.remove("w", "_u");

    word.replace("ɸ", "h", "_V");

    word.replace("j", "ʝ", "#/V_V");

    word.replace("n", "ɾ", "m_");
    word.replace("n", "ɾ", "m/n/ŋ,p/t/k/b/d/g_");
    word.forEach(segment => {
        if (segment.value == "ɾ" && segment.relIdx(-1).value == "m") {
            word.insert("b", segment.idx);
            if (segment.stressed)
                segment.relIdx(-1).stressed = true;
        }
    });

    word.remove("t", "t͡s_");
    word.remove("d", "d͡z_");

    word.replace("ɫ", "l");

    word.replace("d", "ð");
    word.replace("g", "ɣ");
    word.replace("ð", "d", "#/n/l_");
    word.replace("ɣ", "g", "#/ŋ_");

    if (word.atIdx(-1).value == "ð" && word.partOfSpeech == "conjVerb")
        word.atIdx(-1).remove();

    if (word.atIdx(-1).value == "e" && !word.atIdx(-1).stressed && word.atIdx(-2).type == "vowel")
        word.atIdx(-1).remove();
    word.replace("ʎ", "l", "_#");
    word.replace("ɲ", "n", "_#");
    word.replace("z̺", "s̺", "_#");
    word.replace("d͡z", "t͡s", "_#");

    if (word.stressedVowel.relIdx(-1).type == "consonant")
        word.stressedVowel.relIdx(-1).stressed = true;
    if (word.stressedVowel.relIdx(-1).value == "ɾ" && word.stressedVowel.relIdx(-2).match("p", "t", "k", "b", "d", "g", "f", "β"))
        word.stressedVowel.relIdx(-2).stressed = true;
    word.forEach(segment => {
        if (word.vowels.atIdx(0).stressed && segment.idx < word.vowels.atIdx(0).idx)
            segment.stressed = true;
    });

    addRow("OSp", "Old Spanish", "1200", getSpelling_OSp(), word);
}

function OSp_to_ModSp() {
    word = outcomes.OSp.duplicate();

    word.replace("ɸ", "f");
    word.replace("n", "ɱ", "_f");

    word.remove("p/t/k/b/β/ð/ɣ", "_m/n/ɲ");

    word.forEach(segment => {
        if (segment.value == "h") {
            segment.relIdx(1).droppedCons = true;
            segment.remove();
        }
    });

    word.forEach(segment => {
        if (segment.value == "i" && !segment.stressed && (segment.relIdx(-1).type == "vowel" || segment.relIdx(1).type == "vowel")) {
            segment.value = "j";
            segment.type = "consonant";
        }

        if (segment.value == "u" && !segment.stressed && (segment.relIdx(-1).type == "vowel" || segment.relIdx(1).type == "vowel")) {
            segment.value = "w";
            segment.type = "consonant";
        }
    });

    if (word.partOfSpeech == "conjVerb" && word.atIdx(-1).value == "o" && word.atIdx(-1).LLValue == "oː")
        word.insert("j", word.length);

    word.forEach(segment => {
        if (segment.value == "e" && segment.ctxMatch("j_ʎ")) {
            segment.value = "i";
            segment.relIdx(-1).remove();
            if (segment.stressed && segment.prevVowel().value == "i")
                segment.prevVowel().value = "e";
        }
    });

    word.remove("j", "ʃ_");

    word.replace("n", "m", "_β");
    word.replace("b", "β");
    word.replace("β", "b", "#/m_");

    word.forEach((segment => {
        if (segment.value == "β" && segment.relIdx(1).type == "consonant" && !segment.relIdx(1).match("j", "w", "l", "ɾ"))
            segment.value = "w";
    }));
    word.forEach(segment => {
        if (segment.value == "i" && segment.ctxMatch("_w,C/#") && !segment.stressed) {
            segment.value = "j";
            segment.type = "consonant";
            segment.relIdx(1).value = "u";
            segment.relIdx(1).type = "vowel";
        }
    });
    word.remove("w", "o/u_");

    word.forEach((segment => {
        if (segment.value == "ɣ" && segment.relIdx(-1).value == "w") {
            segment.relIdx(-1).remove();
            word.insert("w", segment.idx + 1);
            segment.relIdx(1).stressed = segment.stressed;
        }
    }));

    word.replace("d͡z", "z");
    word.replace("t͡s", "s");

    word.replace("z", "s");
    word.replace("z̺", "s̺");
    word.replace("ʒ", "ʃ");

    word.replace("f", "v", "V_m/n/ɲ/l/ɾ/β/ð/ɣ");
    word.replace("s", "z", "_m/n/ɲ/l/r/β/ð/ɣ");
    word.replace("s̺", "z̺", "_m/n/ɲ/l/r/β/ð/ɣ");

    word.replace("ð", "z", "_ɣ");

    //r-l substitution
    let liquids = word.filter(segment => segment.match("l", "ɾ") || (segment.value == "r" && segment.idx == 0));
    if (word.stressedVowel.relIdx(1).value == "ɾ" && word.stressedVowel.relIdx(1) == liquids.at(-1))
        liquids.pop();
    if (word.partOfSpeech == "conjVerb" && word.stressedVowel.relIdx(-1).value == "ɾ" && word.stressedVowel.relIdx(-1) == liquids.at(-1))
        liquids.pop();
    if (liquids.length >= 2) {
        let firstLiquid = liquids.at(-2);
        let secondLiquid = liquids.at(-1);
        if (firstLiquid.value == "r") {
            if (!secondLiquid.relIdx(-1).match("t", "d", "ð"))
                secondLiquid.value = "l";
        } else if (secondLiquid.relIdx(-1).type == "consonant" && secondLiquid.relIdx(-1).value != "ɾ" && firstLiquid.relIdx(-1).type != "consonant") {
            firstLiquid.value = "l";
            secondLiquid.value = "ɾ";
        } else if (!secondLiquid.relIdx(-1).match("t", "d", "ð")) {
            firstLiquid.value = "ɾ";
            secondLiquid.value = "l";
        }
    }
    word.replace("ɾ", "r", "#_");
    word.forEach(segment => {
        if (segment.value == "ɾ" && segment.relIdx(-1).match("n", "z")) {
            word.insert("d", segment.idx);
            if (segment.stressed)
                segment.relIdx(-1).stressed = true;
        }
    });

    if (word.stressedVowel.relIdx(-1).type == "consonant")
        word.stressedVowel.relIdx(-1).stressed = true;
    word.forEach(segment => {
        if (word.vowels.atIdx(0).stressed && segment.idx < word.vowels.atIdx(0).idx)
            segment.stressed = true;
    });

    let EModSpWord = word.duplicate();
    addRow("EModSp", "Early Modern Spanish", "1600", getSpelling_EModSp(), word, true);


    word.replace("ʃ", "x");

    word.replace("ʎ", "ʝ");
    word.replace("ʝ", "ɟ͡ʝ", "#/n_");
    word.replace("w", "w̝", "#_");

    word.replace("β", "β̞");
    word.replace("ð", "ð̞");
    word.replace("ɣ", "ɣ̞");

    let beforeSplit = word.duplicate();

    word.replace("s", "θ");
    word.replace("z", "ð");

    word.replace("x", "χ");

    addRow("Spain", "Modern Spanish (Spain)", "", getSpelling_ModSp(EModSpWord), word);


    word = beforeSplit;

    word.replace("s̺", "s");
    word.replace("z̺", "z");

    addRow("LatAm", "Modern Spanish (Lat. Am.)", "", getSpelling_ModSp(EModSpWord), word, true);
}

function IR_to_OGP() {
    word = outcomes.IR.duplicate();

    word.replace("ɣ", "j", "V_ɾ");
    word.replace("a", "e", "_j,C[!=j]/#");

    //Pre-yod raising
    word.vowels.forEach((segment, i) => {
        if (segment.relIdx(1).value == "j") {
            switch (segment.value) {
                case "ɛ":
                    segment.value = "e";
                    break;
                case "ɔ":
                    segment.value = "o";
                    break;
            }
        } else if (segment.nextVowel().relIdx(-1).value == "j" && segment.relIdx(1).value != "w") {
            switch (segment.value) {
                case "ɛ":
                    segment.value = "e";
                    break;
                case "e":
                    segment.value = "i";
                    break;
                case "ɔ":
                    segment.value = "o";
                    break;
                case "o":
                    segment.value = "u";
                    break;
            }
        }
    });

    if (word.vowels.atIdx(-3).value == "ɛ" && word.vowels.atIdx(-2).value == "i")
        word.vowels.atIdx(-3).value = "i";

    if (word.stressedVowel.prevVowel().value == "e" && word.stressedVowel.relIdx(-1).value == "w")
        word.stressedVowel.prevVowel().value = "i";

    word.replace("ɣ", "g");

    word.replaceSeq("p,ʎ", "t͡ʃ");
    word.replaceSeq("k,ʎ", "t͡ʃ");
    word.replaceSeq("f,ʎ", "t͡ʃ");

    word.remove("s̺", "_t͡ʃ");

    word.replace("b", "β", "ɫ/ɾ_");

    if (word.atIdx(-1).value == "n" && !word.vowels.atIdx(-1).stressed && word.partOfSpeech != "conjVerb")
        word.atIdx(-1).remove();

    word.replace("w", "β", "ð/ɫ_");
    word.replace("w", "n", "n_ɛ/e/i");
    word.replaceSeq("n,w", "ŋ,g,w");

    word.replace("ɫ", "w", "a_p/t/t͡sʲ");
    word.replace("a", "o", "_w");

    word.replace("b", "l", "V_l");

    if (word.atIdx(-1).value == "d")
        word.atIdx(-1).remove();

    //Loss of final /e/ and /i/
    if (word.partOfSpeech != "conjVerb" && word.atIdx(-1).match("e", "i") && !word.atIdx(-1).stressed && word.atIdx(-2).match("l", "ɾ", "n", "s̺", "z̺", "t͡sʲ", "d͡zʲ", "j", "w") && word.atIdx(-3).type == "vowel")
        word.atIdx(-1).remove();
    if (word.partOfSpeech == "conjVerb" && word.atIdx(-1).match("e", "i") && !word.atIdx(-1).stressed && word.atIdx(-2).match("ɾ", "d͡zʲ") && (word.atIdx(-3).type == "vowel"))
        word.atIdx(-1).remove();
    word.replace("z̺", "s̺", "_#");
    word.replace("d͡zʲ", "t͡sʲ", "_#");
    word.replace("l", "ɫ", "_#");

    word.replace("e", "i", "_ŋ");
    word.replace("o[stressed]", "u", "_ŋ");

    //Nasalization
    word.remove("j", "_m/n/ŋ,C/#");
    word.remove("w", "_m/n/ŋ,C/#");
    word.forEach(segment => {
        if (segment.type == "vowel" && (segment.relIdx(1).value == "n" || segment.ctxMatch("_m/ŋ,C/#")) && !segment.relIdx(2).match("m", "n", "j", "w")) {
            if (segment.relIdx(2).value == "i" && segment.relIdx(2).stressed && segment.relIdx(3).type == "vowel")
                segment.relIdx(2).value += "\u0303";
            else
                segment.value += "\u0303";
            segment.relIdx(1).remove();
        }
    });

    word.remove("ð");
    word.remove("l", "V/j/w_V");

    //Degemination
    word.forEach(segment => {
        if (segment.type == "consonant" && (segment.value == segment.relIdx(1).value || segment.value == segment.relIdx(1).value[0]))
            segment.remove();
    });

    word.replace("l", "ɾ", "p/b/k/g_");

    word.remove("ʎ", "ɲ_");

    if (word.atIdx(0).value == "e" && word.atIdx(1).value == "j" && !word.atIdx(0).stressed) {
        word.atIdx(0).value = "i";
        word.atIdx(1).remove();
    }

    if (!word.vowels.atIdx(-1).stressed) {
        if (word.vowels.atIdx(-1).value == "i")
            word.vowels.atIdx(-1).value = "e";

        if (word.vowels.atIdx(-1).value == "u" && word.atIdx(-1).type == "consonant")
            word.vowels.atIdx(-1).value = "o";
    }

    word.forEach(segment => {
        if (segment.match("e", "ẽ") && (segment.relIdx(-1).match("i", "ĩ") || segment.relIdx(1).match("i", "ĩ")) && !segment.relIdx(-1).match("e", "ẽ") && !segment.relIdx(1).match("e", "ẽ") && !segment.stressed)
            segment.value = "i" + segment.value.slice(1);
    });

    word.remove("b", "_#");

    word.replaceSeq("s̺,t͡sʲ", "s̺ʲ");

    word.replace("t͡sʲ", "t͡s");
    word.replace("d͡zʲ", "d͡z");

    word.remove("t", "t͡s_");
    word.remove("d", "d͡z_");

    word.forEach(segment => {
        if (segment.type == "consonant" && segment.relIdx(1).value == "j" && !segment.value.endsWith("ʲ") && segment.value != "w") {
            segment.value += "ʲ";
            segment.relIdx(1).remove();
        }
    });

    word.forEach(segment => {
        if (segment.value.endsWith("ʲ")) {
            if (segment.relIdx(-1).type == "vowel" && !segment.relIdx(-1).value.endsWith("\u0303"))
                word.insert("j", segment.idx);
            segment.value = segment.value.slice(0, -1);
        }
    });
    word.remove("j", "i/ĩ_");

    word.replace("j", "ʒ", "_V");

    word.replace("s̺", "ʃ", "j_V");
    word.replace("z̺", "ʒ", "j_V");

    word.replace("ɛ̃", "ẽ");
    word.replace("ɔ̃", "õ");

    if (word.stressedVowel.relIdx(-1).type == "consonant" && word.stressedVowel.relIdx(-1).value != "w")
        word.stressedVowel.relIdx(-1).stressed = true;

    addRow("OGP", "Old Galician-Portuguese", "1300", getSpelling_OGP(), word);
}

function OGP_to_ModPort() {
    word = outcomes.OGP.duplicate();

    word.forEach(segment => {
        if (segment.value == "w" && segment.ctxMatch("V_V"))
            word.insert("β", segment.idx + 1);
    });

    word.replace("β", "v");

    word.replace("e", "ɛ", "_ɫ");

    word.replace("ɛ", "e", "_j/w");

    word.replace("õ", "ã", "_#");
    if (word.atIdx(-1).value == "ã")
        word.insert("o", word.length);

    word.replace("a", "ã", "ã_");
    word.replace("e", "ẽ", "ẽ_");
    word.replace("i", "ĩ", "ĩ_");
    word.replace("o", "õ", "õ_");
    word.replace("u", "ũ", "ũ_");

    word.forEach(segment => {
        if (segment.value == "j" && segment.relIdx(-1).value.endsWith("\u0303") && segment.relIdx(1).match("t", "d", "t͡s", "d͡z"))
            segment.remove();
    });

    //Elimination of hiatus
    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);

        if (segment.relIdx(1).type == "vowel" && !segment.stressed) {
            switch (segment.value) {
                case "a":
                case "ã":
                    if (segment.value == "a" && segment.relIdx(1).value == "e" && segment.relIdx(1).stressed)
                        segment.relIdx(1).value = "ɛ";
                    else if (segment.value == "a" && segment.relIdx(1).value == "o" && segment.relIdx(1).stressed)
                        segment.relIdx(1).value = "ɔ";
                    else if (segment.relIdx(1).value == "e")
                        segment.relIdx(1).value = "i";
                    else if (segment.relIdx(1).value == "o")
                        segment.relIdx(1).value = "u";
                    else if (segment.relIdx(1).value == "a" && segment.relIdx(1).idx < word.stressedVowel.idx)
                        segment.relIdx(1).value = "aː";

                    if (segment.relIdx(1).match("a", "ã", "aː", "ɛ", "e", "ẽ", "ɔ", "õ")) {
                        segment.remove();
                        i--;
                    }
                    break;
                case "e":
                case "ẽ":
                    if (segment.relIdx(1).match("e", "ẽ") && !(segment.value == "ẽ" && segment.relIdx(2).value == "j")) {
                        if (segment.relIdx(1).value == "e" && segment.relIdx(1).idx < word.stressedVowel.idx && segment.relIdx(2).value != "j")
                            segment.relIdx(1).value = "eː";
                        segment.remove();
                        i--;
                    } else if (segment.relIdx(1).value == "a" && segment.relIdx(1).nextVowel().stressed) {
                        segment.value = "ɛ";
                        segment.relIdx(1).remove();
                    } else if (!segment.relIdx(1).nextVowel().stressed) {
                        segment.value = "i";
                    }
                    break;
                case "i":
                case "ĩ":
                    if (segment.relIdx(1).value == "e" && segment.relIdx(1).stressed) {
                        segment.relIdx(1).value = "ɛ";
                    } else if (segment.relIdx(1).match("i", "ĩ") || (segment.relIdx(1).match("e", "ẽ") && segment.relIdx(1).nextVowel().stressed)) {
                        if (segment.value == "ĩ")
                            segment.relIdx(1).value = "ĩ";
                        else
                            segment.relIdx(1).value = "i";
                        segment.remove();
                        i--;
                    }
                    break;
                case "o":
                case "õ":
                    if (segment.relIdx(1).match("o", "õ", "u", "ũ")) {
                        if (segment.value == "õ" && segment.relIdx(1).value == "u" && segment.negIdx != -2)
                            segment.relIdx(1).value = "ũ";
                        else if (segment.relIdx(1).value == "o" && segment.relIdx(1).idx < word.stressedVowel.idx && segment.relIdx(2).value != "w")
                            segment.relIdx(1).value = "oː";
                        segment.remove();
                        i--;
                    } else if (segment.relIdx(1).value == "a" && segment.relIdx(1).nextVowel().stressed) {
                        segment.value = "ɔ";
                        segment.relIdx(1).remove();
                    } else if (!segment.relIdx(1).nextVowel().stressed) {
                        segment.value = "u";
                    }
                    break;
                case "u":
                case "ũ":
                    if (segment.relIdx(1).value == "o" && segment.relIdx(1).stressed) {
                        segment.relIdx(1).value = "ɔ";
                    } else if (segment.relIdx(1).match("u", "ũ")) {
                        segment.remove();
                        i--;
                    }
                    break;
            }
        }
        word.remove("j", "i_");
        word.remove("w", "u_");

        if (segment.relIdx(-1).type == "vowel" && (segment.relIdx(-1).stressed || segment.nextVowel().stressed)) {
            switch (segment.value) {
                case "a":
                    if (segment.relIdx(-1).value == "o" || (segment.relIdx(-1).value == "õ" && segment == word.vowels.atIdx(-2)))
                        segment.relIdx(-1).value = "ɔ";

                    if (segment.relIdx(-1).match("a", "ã", "ɛ", "ɔ"))
                        segment.remove();
                    break;
                case "e":
                case "i":
                    if (segment.relIdx(-1).match("e", "ẽ", "i", "ĩ", "u", "ũ"))
                        segment.remove();
                    else
                        segment.value = "i";
                    break;
                case "o":
                case "u":
                    if (segment.relIdx(-1).match("ɔ", "o", "õ", "u", "ũ"))
                        segment.remove();
                    else
                        segment.value = "u";
                    break;
                case "ã":
                case "ẽ":
                case "ĩ":
                case "õ":
                case "ũ":
                    if (segment.relIdx(-1).value == segment.value)
                        segment.remove();
                    break;
            }
        }
    }
    word.remove("j", "_j/w");
    word.remove("w", "_j/w");

    word.forEach(segment => {
        if (segment.value == "ĩ" && segment.relIdx(1).match("a", "o") && (segment.stressed || segment.relIdx(1).stressed)) {
            word.insert("ɲ", segment.idx + 1);
            segment.value = "i";
        }
    });

    //Syllabification
    if (word.stressedVowel.relIdx(-1).type == "consonant" && !word.stressedVowel.relIdx(-1).match("j", "w"))
        word.stressedVowel.relIdx(-1).stressed = true;
    if (word.stressedVowel.relIdx(-1).value == "ɾ" && word.stressedVowel.relIdx(-2).match("p", "t", "k", "b", "d", "g", "f", "β"))
        word.stressedVowel.relIdx(-2).stressed = true;
    word.forEach(segment => {
        if (word.vowels.atIdx(0).stressed && segment.idx < word.vowels.atIdx(0).idx)
            segment.stressed = true;
    });

    if (word.atIdx(-1).value == "ɾ" && word.vowels.atIdx(-2).stressed)
        word.insert("e", word.length);

    //Final raising
    word.replace("e[!stressed]", "i", "_#");
    word.replace("o[!stressed]", "u", "_#");
    word.replace("a[!stressed]", "ɐ");

    word.forEach(segment => {
        if (segment.value == "i" && !segment.stressed && segment.relIdx(-1).type == "vowel") {
            segment.value = "j";
            segment.type = "consonant";
        }

        if (segment.value == "u" && !segment.stressed && segment.ctxMatch("V[!=i/ĩ]_") && !segment.ctxMatch("e/ẽ[stressed]_")) {
            segment.value = "w";
            segment.type = "consonant";
        }
    });
    word.remove("j", "w_C");

    //Denasalization before vowels and certain consonants
    word.forEach(segment => {
        if (segment.value.endsWith("\u0303") && (segment.ctxMatch("_V/l/ʎ/ɾ/r/m/n/ɲ") || segment.ctxMatch("_j/w,V/l/ʎ/ɾ/r/m/n/ɲ")))
            segment.value = segment.value[0];
    });

    word.replace("ã", "ɐ̃");
    word.replace("a[stressed]", "ɐ", "_m/n/ɲ");

    word.replace("aː", "a");
    word.replace("eː", "ɛ");
    word.replace("oː", "ɔ");

    word.forEach(segment => {
        if (segment.value == "e" && segment.stressed && segment.relIdx(1).type == "vowel" && segment.relIdx(1).value != "ẽ")
            word.insert("j", segment.idx + 1);
    });

    if (word.vowels.atIdx(-1).value == "ẽ")
        word.insert("j", word.vowels.atIdx(-1).idx + 1);

    word.replaceSeq("ɫ,n", "l");

    word.remove("j", "u_C");
    word.remove("j", "o_ʃ");

    word.replace("s̺", "s");
    word.replace("z̺", "z");

    word.EModPortWord = word.duplicate();

    word.replace("t͡s", "s");
    word.replace("d͡z", "z");
    word.replace("t͡ʃ", "ʃ");
    word.replace("d͡ʒ", "ʒ");

    //Gemination of intervocalic semivowels
    word.forEach(segment => {
        if (segment.type == "vowel" && segment.ctxMatch("V,j/w_")) {
            word.insert(segment.relIdx(-1).value, segment.idx);
            segment.relIdx(-1).stressed = segment.stressed;
        }
    });

    word.replace("j", "ɪ̯", "V/ɪ̯_");
    word.replace("w", "ʊ̯", "V/ʊ̯_");

    //Nasalize semivowels after nasal vowels
    word.forEach(segment => {
        if (segment.value.endsWith("\u0303") && segment.relIdx(1).match("ɪ̯", "ʊ̯"))
            segment.relIdx(1).value += "\u0303";
    });

    word.replace("r", "ʁ");

    word.replace("ɐ", "ɜ");
    word.replace("ɐ̃", "ɜ̃");

    outcomes.ModPort = word.duplicate();
}

function ModPort_to_Port() {
    word = outcomes.ModPort.duplicate();

    word.forEach(segment => {
        if (segment.idx != 0 && !segment.relIdx(-1).value.endsWith("\u0303")) {
            switch (segment.value) {
                case "b":
                    segment.value = "β";
                    break;
                case "d":
                    if (segment.relIdx(-1).value != "ɫ")
                        segment.value = "ð";
                    break;
                case "g":
                    segment.value = "ɣ";
                    break;
            }
        }
    });

    word.forEach(segment => {
        if (segment.value == "i" && !segment.stressed && segment.relIdx(1).type == "vowel" && segment.relIdx(-1).value != "ɾ") {
            segment.value = "j";
            segment.type = "consonant";
            if (segment.relIdx(1).stressed) {
                segment.stressed = true;
                if (segment.relIdx(-1).type == "consonant")
                    segment.relIdx(-1).stressed = true;
            }
        }

        if (segment.value == "u" && !segment.stressed && segment.relIdx(1).type == "vowel" && !segment.relIdx(-1).match("ɾ", "j")) {
            segment.value = "w";
            segment.type = "consonant";
            if (segment.relIdx(1).stressed) {
                segment.stressed = true;
                if (segment.relIdx(-1).type == "consonant")
                    segment.relIdx(-1).stressed = true;
            }
        }
    });

    word.forEach(segment => {
        if (segment.value == "s" && !segment.ctxMatch("_V/j/w"))
            segment.value = "ʃ";
    });

    word.forEach(segment => {
        if (segment.value == "e" && !segment.stressed && !segment.relIdx(1).match("ɪ̯", "ʊ̯"))
            segment.value = "ɨ";

        if (
            segment.value == "i" && !segment.stressed && !segment.relIdx(1).value != "ʊ̯"
            && (segment.relIdx(-1).match("ʎ", "ɲ", "ʃ", "ʒ") || segment.relIdx(1).match("ʎ", "ɲ", "ʃ", "ʒ") || segment.prevVowel().match("i", "ĩ") || segment.nextVowel().match("i", "ĩ"))
        )
            segment.value = "ɨ";
    });
    word.replace("i[!stressed]", "ɨ", "_#");

    word.replace("o[!stressed]", "u", "_[!=ɪ̯/ʊ̯/ɫ]");

    word.replace("ɨ", "i", "#_");

    word.replace("l", "ɫ");

    word.remove("ʊ̯", "o_");

    word.replace("e", "ɜ", "_ɪ̯/ʎ/ɲ/ʒ");
    word.replace("ẽ", "ɜ̃", "_ɪ̯̃");

    addRow("Port", "Modern Portuguese (Portugal)", "", getSpelling_ModPort(word.EModPortWord), word);
}

function ModPort_to_Br() {
    word = outcomes.ModPort.duplicate();

    if (word.stressedVowel.relIdx(1).match("m", "n", "ɲ"))
        word.stressedVowel.value += "\u0303";
    word.replace("ɛ̃", "ẽ");
    word.replace("ɔ̃", "õ");

    word.replace("ɜ[!stressed]", "a", "_C/V");
    word.replace("ɛ[!stressed]", "e");
    word.replace("ɔ[!stressed]", "o");

    word.replace("ẽ[!stressed]", "ĩ", "#_");

    word.replace("ɲ", "j̃");

    word.remove("ʊ̯", "o_");

    word.replace("ɫ", "ʊ̯");

    word.replace("t", "t͡ʃ", "_i");
    word.replace("d", "d͡ʒ", "_i");

    word.replace("ɾ", "ʁ", "_C/#");
    word.replace("ʁ", "h");
    word.replace("h", "ɦ", "_m/n/j̃/b/d/g/v/z/ʒ/l");
    if (word.partOfSpeech == "inf")
        word.remove("h", "_#");

    if (word.atIdx(-1).value == "s" && word.atIdx(-2).match("a", "ɛ", "e", "ɔ", "o", "u") && word.atIdx(-2).stressed)
        word.insert("ɪ̯", -1);

    addRow("Br", "Modern Portuguese (Brazil)", "", getSpelling_ModPort(word.EModPortWord, "br"), word, true);
}

function WR_to_EOF(variety) {
    word = outcomes.WR.duplicate();

    word.remove("j", "V/w_V");

    word.replace("ɪ", "e");
    word.replace("ɪː", "eː");
    word.replace("ʊ", "o");
    word.replace("ʊː", "oː");

    word.replace("ɛ", "ie̯", "_j");
    word.replace("ɔ", "uo̯", "_j");

    word.replace("ʎ", "l", "C[!=ʎ/j/w]_");

    addRow("GR", "Gallo-Romance", "600", "", word, true);

    word.replace("ɛː", "ie̯");
    word.replace("ɔː", "uo̯");

    word.replace("ɛ", "e", "_ɲ");
    word.replace("ɔ", "o", "_ɲ");

    word.replace("ɣ", "β", "o/oː_a/aː");

    word.replace("β", "t", "_t/t͡sʲ");
    word.replace("β", "d", "_d/d͡zʲ");

    //Second lenition
    word.replace("b", "β", "V/j/w_V/w/r/rʲ");
    word.replace("bʲ", "βʲ", "V/j/w_V/w/r/rʲ");
    word.replace("d", "ð", "V/w_V/w/r/rʲ/#");
    word.replace("g", "ɣ", "V/j/w_V/w/r/rʲ");

    word.forEach(segment => {
        if (segment.type == "vowel" && segment.stressed && segment.relIdx(1).match("e", "i")) {
            segment.relIdx(1).value = "j";
            segment.relIdx(1).type = "consonant";
        }

        if (segment.type == "vowel" && segment.stressed && segment.relIdx(1).match("o", "u")) {
            segment.relIdx(1).value = "w";
            segment.relIdx(1).type = "consonant";
        }
    });

    //Loss of all unstressed penultimate vowels
    if (word.vowels.atIdx(-3).stressed)
        word.vowels.atIdx(-2).remove();
    word.remove("ð", "C[!=j/w]_");
    word.remove("β", "s̺/t͡sʲ_");

    //Voicing assimilation
    word.forEach(segment => {
        if (segment.relIdx(-1).match("p", "pʲ", "t", "c", "k", "t͡sʲ", "f", "fʲ", "s̺", "s̺ʲ")) {
            switch (segment.value) {
                case "b":
                    segment.value = "p";
                    break;
                case "bʲ":
                    segment.value = "pʲ";
                    break;
                case "d":
                    segment.value = "t";
                    break;
                case "ɟ":
                    segment.value = "c";
                    break;
                case "g":
                    segment.value = "k";
                    break;
                case "d͡zʲ":
                    segment.value = "t͡sʲ";
                    break;
                case "β":
                    segment.value = "f";
                    break;
                case "βʲ":
                    segment.value = "fʲ";
                    break;
                case "z̺":
                    segment.value = "s̺";
                    break;
                case "z̺ʲ":
                    segment.value = "s̺ʲ";
                    break;
            }
        }

        if (segment.relIdx(-1).match("b", "bʲ", "d", "ɟ", "g", "d͡zʲ", "β", "βʲ", "z̺", "z̺ʲ")) {
            switch (segment.value) {
                case "p":
                    segment.value = "b";
                    break;
                case "pʲ":
                    segment.value = "bʲ";
                    break;
                case "t":
                    segment.value = "d";
                    break;
                case "c":
                    segment.value = "ɟ";
                    break;
                case "k":
                    segment.value = "g";
                    break;
                case "t͡sʲ":
                    segment.value = "d͡zʲ";
                    break;
                case "f":
                    segment.value = "β";
                    break;
                case "fʲ":
                    segment.value = "βʲ";
                    break;
                case "s̺":
                    segment.value = "z̺";
                    break;
                case "s̺ʲ":
                    segment.value = "z̺ʲ";
                    break;
            }
        }
    });

    //Middle consonant loss
    let approximants = ["l", "ɫ", "ʎ", "r", "rʲ", "j", "w"];
    let nasals = ["m", "mʲ", "n", "ɲ", "ŋ"];
    let sibilants = ["s̺", "s̺ʲ", "z̺", "z̺ʲ", "t͡sʲ", "d͡zʲ"];
    let fricatives = ["f", "fʲ", "β", "βʲ", "ð", "ɣ"];
    let stops = ["p", "pʲ", "b", "bʲ", "t", "d", "c", "ɟ", "k", "g"];
    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);
        if (
            segment.type == "consonant" && segment.relIdx(-1).type == "consonant" && segment.relIdx(1).type == "consonant"
            && !segment.relIdx(-1).match("j", "w", "β", "ɣ") && segment.relIdx(1).value != "w"
            && !(segment.relIdx(1).match(...approximants) && !segment.match(...approximants, ...nasals))
            && !(segment.match("s̺", "s̺ʲ", "z̺", "z̺ʲ") && segment.relIdx(-1).match(...approximants, ...nasals))
            && !(segment.relIdx(-1).match(...approximants, ...nasals) && !segment.match(...approximants, ...nasals) && segment.value == segment.relIdx(1).value[0])
            && !(segment.value == "m" && segment.relIdx(1).value == "n" && segment.relIdx(-1).match(...approximants))
            && !(segment.relIdx(-1).match(...nasals) && segment.match(...stops) && segment.relIdx(1).value == "n")
        ) {
            segment.remove();
            i--;
        }

        if (
            segment.type == "consonant" && segment.value == segment.relIdx(1).value[0]
            && !((segment.relIdx(-1).type == "vowel" || segment.relIdx(-1).match(...approximants, ...nasals))
                && (segment.relIdx(2).type == "vowel" || segment.relIdx(2).value == "w"
                    || (segment.relIdx(1).match(...stops, "f", "fʲ") && segment.relIdx(2).match(...approximants))))
        ) {
            segment.remove();
            i--;
        }
    }
    word.forEach(segment => {
        if (segment.value == segment.relIdx(1).value[0] + "ʲ") {
            segment.value = segment.value[0];
            segment.relIdx(1).value += "ʲ";
        }
    });
    word.forEach(segment => {
        if (segment.value == "m" && segment.relIdx(1).match("l", "r", "rʲ"))
            word.insert("b", segment.idx + 1);

        if (segment.value == "s̺" && segment.relIdx(1).match("r", "rʲ"))
            word.insert("t", segment.idx + 1);

        if (segment.value == "z̺" && segment.relIdx(1).match("r", "rʲ"))
            word.insert("d", segment.idx + 1);
    });
    word.forEach(segment => {
        if (segment.match(...stops, ...fricatives) && segment.relIdx(1).match(...approximants) && segment.relIdx(1).stressed && !(segment.match("t", "d", "ð") && segment.relIdx(1).value == "l"))
            segment.stressed = true;
    });

    word.replace("l", "ɫ", "_C");
    word.replace("ɫ", "l", "_l");
    word.replace("n", "ŋ", "_k/g");
    word.replace("s̺", "z̺", "_m/mʲ/n/ɲ/l/ʎ/r/rʲ/b/bʲ/d/ɟ/g/β/βʲ/ð/ɣ/z/zʲ");
    word.replace("s̺ʲ", "z̺ʲ", "_m/mʲ/n/ɲ/l/ʎ/r/rʲ/b/bʲ/d/ɟ/g/β/βʲ/ð/ɣ/z/zʲ");
    word.replace("ð", "d", "_d/d͡zʲ");
    word.replace("s̺ʲ", "s̺", "_t͡sʲ");
    word.replace("z̺ʲ", "z̺", "_d͡zʲ");

    word.replace("ɟ", "j", "_C");

    word.replace("c", "tʲ");
    word.replace("ɟ", "dʲ");
    word.replace("tʲ", "t", "_r");
    word.replace("dʲ", "d", "_r");
    word.replace("ɲ", "n", "_tʲ/dʲ");
    word.replace("ʎ", "ɫ", "_tʲ/dʲ");
    word.replace("tʲ", "t", "_tʲ");
    word.replace("dʲ", "d", "_dʲ");

    word.replaceSeq("ŋ,g,n", "ɲ,ɲ");

    word.forEach(segment => {
        if (segment.value == "w" && segment.relIdx(1) == word.vowels.atIdx(0) && !segment.relIdx(-1).match("k", "g")) {
            segment.value = "o";
            segment.type = "vowel";
            segment.stressed = false;
            segment.relIdx(-1).stressed = false;
        }
    });


    word.replace("w", "β", "n_");
    word.forEach(segment => {
        if (segment.value == "n" && segment.relIdx(1).value == "β")
            segment.stressed = false;
    });

    word.replaceSeq("ɫ,w", "l,l");
    word.replace("w", "r", "r_");
    word.replace("w", "m", "m_");
    word.replace("w", "s̺", "s̺_");
    word.replace("w", "z̺", "z̺_");
    word.replace("C[!=ɣ]", "w", "V_w");

    word.forEach(segment => {
        if (segment.value == "β" && segment.relIdx(1).type == "consonant" && !segment.ctxMatch("_β/βʲ/r/rʲ,V")) {
            if (segment.relIdx(-1).match("ɔ", "uo̯", "o", "oː", "u", "uː", "w"))
                segment.remove();
            else
                segment.value = "w";
        }
    });
    word.remove("β", "C_C");

    word.forEach(segment => {
        if (segment.type == "vowel" && segment.value.endsWith("ː"))
            segment.value = segment.value[0];

        if (
            segment.type == "vowel" && segment.stressed && segment.value.length == 1 && !segment.match("ɛ", "ɔ")
            && (segment.ctxMatch("_V/#") || segment.ctxMatch("_C,V") || segment.ctxMatch("_p/t/k/b/d/g/f/β/ð/ɣ,r/rʲ/w,V") || segment.ctxMatch("_p/k/b/g/f/ɣ,l,V"))
        )
            segment.value += "ː";
    });
    word.replace("aː", "a", "_b,l");

    word.replace("eː", "ei̯");
    word.replace("oː", "ou̯", "_[!=m/n]");

    if (variety != "norman") {
        word.replace("k", "t͡ʃ", "_a/aː");
        word.replace("g", "d͡ʒ", "_a/aː");
        word.replace("k", "t", "_t͡ʃ");
        word.replace("g", "d", "_d͡ʒ");
    }

    word.forEach(segment => {
        if (segment.value == "ɣ" && !segment.relIdx(-1).match("ɔ", "uo̯", "o", "ou̯", "u", "uː", "w") && !segment.relIdx(1).match("ɔ", "uo̯", "o", "ou̯", "u", "uː", "w") && !segment.ctxMatch("e_r"))
            segment.value = "j";

        if (segment.value == "ɣ" && !segment.relIdx(-1).match("ɔ", "uo̯", "o", "ou̯", "u", "uː", "w") && segment.relIdx(-1).stressed && segment.relIdx(1).value == "w" && variety != "norman")
            segment.value = "j";
    });
    word.remove("j", "C_C");

    word.replace("k", "j", "a/ɛ/e/i_#");

    word.remove("j", "_j");

    word.replace("g", "j", "d_");

    word.replace("t͡sʲ", "s̺ʲ", "_C");
    word.replace("d͡zʲ", "z̺ʲ", "_C");

    word.replace("ɲ", "mʲ", "m_");

    word.replace("pʲ", "t͡ʃ");
    word.replace("bʲ", "d͡ʒ");
    word.replace("fʲ", "t͡ʃ");
    word.replace("βʲ", "d͡ʒ");
    word.replace("p", "t", "_t͡ʃ");
    word.replace("b", "d", "_d͡ʒ");
    word.replace("f", "t", "_t͡ʃ");
    word.replace("β", "d", "_d͡ʒ");
    word.replaceSeq("mʲ", "n,d͡ʒ");
    word.remove("n", "#/C[!=r]_d͡ʒ");
    word.forEach(segment => {
        if (segment.value == "n" && segment.relIdx(1).value == "d͡ʒ")
            segment.stressed = false;
    });

    word.replaceSeq("t,j", "t͡ʃ");

    word.replace("j", "d͡ʒ", "#/C[!=w]_");

    if (variety == "norman")
        word.replace("t͡sʲ", "t͡ʃ");

    word.replace("d͡zʲ", "z̺ʲ", "V_V");

    word.replace("tʲ", "t͡sʲ");
    word.replace("dʲ", "d͡zʲ");
    word.replace("s̺ʲ", "s̺", "_t͡sʲ");
    word.replace("z̺ʲ", "z̺", "_d͡zʲ");

    word.replace("n", "nʲ", "j_");
    word.replace("t", "tʲ", "j_");
    word.replace("d", "dʲ", "j_");
    word.replace("r", "rʲ", "j_");

    word.replace("t͡sʲ", "s̺ʲ", "s̺_");
    word.replace("t͡sʲ", "s̺ʲ", "_C");

    word.forEach(segment => {
        if (segment.type == "vowel" && segment.relIdx(1).value == "w" && !segment.match("u", "uː")) {
            if (!segment.match("ie̯", "uo̯"))
                segment.value = segment.value[0];
            segment.value += "u̯";
            segment.relIdx(1).remove();
        }
    });

    word.forEach(segment => {
        if (segment.type == "vowel" && segment.value != "i" && segment.relIdx(1).value != "j" && (segment.relIdx(1).match("d͡zʲ", "s̺ʲ", "z̺ʲ", "rʲ") || segment.nextVowel().relIdx(-1).match("s̺ʲ", "rʲ")))
            word.insert("j", segment.idx + 1);
    });
    word.replace("ɛ", "ie̯", "_j");
    word.replace("ɔ", "uo̯", "_j");

    word.forEach(segment => {
        if (segment.match("n", "t", "d", "r") && segment.prevVowel().relIdx(1).match("j", "ɲ"))
            segment.value += "ʲ";
    });

    word.forEach(segment => {
        if (segment.type == "vowel" && segment.relIdx(1).value == "j") {
            if (!segment.match("i", "iː")) {
                if (!segment.match("ie̯", "uo̯", "au̯"))
                    segment.value = segment.value[0];
                segment.value += "i̯";
            }
            if (!(segment.relIdx(2).type == "vowel" && segment.relIdx(2).stressed))
                segment.relIdx(1).remove();
        }
    });
    word.replace("ii̯", "i");

    word.forEach(segment => {
        if (segment.value == "ɣ" && !segment.relIdx(-1).match("ei̯", "iː") && !segment.relIdx(-1).value.endsWith("i̯") && segment.relIdx(-1).stressed && segment.relIdx(1).match("o", "u"))
            segment.value = "w";
    });

    word.replace("aː", "au̯", "_w");

    word.forEach(segment => {
        if ((segment.relIdx(-1).value.endsWith("ʲ") || segment.relIdx(-1).match("j", "ɲ", "ʎ", "t͡ʃ", "d͡ʒ"))) {
            if (segment.value == "aː")
                segment.value = "ie̯";
            else if (segment.match("ai̯", "ei̯"))
                segment.value = "ie̯i̯";
        }
    });

    word.replace("aː", "ai̯", "_m/n");
    word.replace("aː", "eː");

    word.replace("au̯", "ɔ");
    word.replace("au̯i̯", "ɔi̯");
    word.replace("ie̯i̯", "i");
    word.replace("uo̯i̯", "ui̯");

    word.replace("iː", "i");
    word.replace("uː", "u");
    word.replace("oː", "o");

    word.forEach(segment => {
        if (segment.value.endsWith("ʲ"))
            segment.value = segment.value.slice(0, -1);
    });

    //Unstressed final vowel loss
    let finalVowel = word.vowels.atIdx(-1);
    if (!finalVowel.stressed) {
        if (
            finalVowel.value == "a"
            || finalVowel.relIdx(-1).match("t͡ʃ", "d͡ʒ")
            || (finalVowel.relIdx(1).type == "consonant" && finalVowel.relIdx(2).type == "consonant")
            || (finalVowel.relIdx(-2).value == "d" && finalVowel.relIdx(-1).value == "d͡z")
            || (finalVowel.relIdx(-2).value == "ð" && finalVowel.relIdx(-1).value == "β")
            || (finalVowel.ctxMatch("C,m/n/ɲ/l/ʎ/r/j_") && !finalVowel.ctxMatch("r,m/n_#") && finalVowel.relIdx(-2).value != finalVowel.relIdx(-1).value)
            || (word.partOfSpeech == "inf" && word.vowels.length == 2)
        )
            finalVowel.value = "ə";
        else
            finalVowel.remove();
    }
    if (word.atIdx(-2).match("p", "t", "k", "b", "d", "g") && word.atIdx(-1).match("ð", "p", "k"))
        word.atIdx(-2).remove();
    word.replace("ð", "d", "C_");
    word.remove("ð", "_d");
    word.replace("d", "t", "p/t/k_");
    word.remove("n", "m_#");
    if (word.atIdx(-2).value == word.atIdx(-1).value[0] && word.atIdx(-1).type == "consonant")
        word.atIdx(-2).remove();
    if (word.atIdx(-1).match("m", "n", "ɲ", "l", "ɫ", "ʎ", "r", "j") && word.atIdx(-2).type == "consonant" && !(word.atIdx(-2).value == "r" && word.atIdx(-1).match("m", "n")))
        word.insert("ə", word.length);
    if (word.atIdx(-1).type == "consonant" && word.at(-1).value != "w" && word.atIdx(-2).match("m", "n", "ɲ", "l", "ɫ", "ʎ", "r", "j") && word.atIdx(-3).type == "consonant" && !(word.atIdx(-3).value == "r" && word.atIdx(-2).match("m", "n")) && word.atIdx(-3).value != word.atIdx(-2).value)
        word.insert("ə", -1);
    if (word.atIdx(-1).type == "consonant" && word.at(-1).value != "w" && word.atIdx(-2).match("p", "k", "b", "d", "g", "f") && word.atIdx(-3).match("p", "t", "k", "b", "d", "g", "f") && word.atIdx(-2).value[0] != word.atIdx(-3).value)
        word.insert("ə", -1);
    if (word.atIdx(-1).value == "s̺" && word.atIdx(-2).match("s̺", "z̺", "t͡s", "d͡z"))
        word.atIdx(-1).remove();
    word.replace("l", "ɫ", "_C/#");
    word.replace("ɫ", "l", "_l/V");
    word.forEach(segment => {
        if (segment.value == "m" && segment.relIdx(1).match("l", "r"))
            word.insert("b", segment.idx + 1);

        if (segment.value == "s̺" && segment.relIdx(1).value == "r")
            word.insert("t", segment.idx + 1);

        if (segment.value == "z̺" && segment.relIdx(1).value == "r")
            word.insert("d", segment.idx + 1);
    });
    word.replace("d", "ð", "ə_#");
    word.remove("w", "C/ai̯_C/#");

    word.forEach(segment => {
        if (segment.value == "r" && segment.relIdx(-1).match("ɫ", "ʎ", "n", "ɲ"))
            word.insert("d", segment.idx);
    });

    word.remove("w", "u_");

    word.replace("n", "t", "n/r_s̺");

    word.replace("d͡z", "z̺", "V_V");

    word.replace("n", "m", "m_");

    //Nasal assimilation
    word.remove("m", "m_C");
    word.remove("n", "n_C");
    word.replace("n", "m", "_m/p/b");
    word.replace("ŋ", "m", "_m/p/b");
    word.replace("m", "n", "_t/d/t͡s/d͡z/t͡ʃ/d͡ʒ/ð/s̺/z̺/f/β");
    word.replace("ŋ", "n", "_t/d/t͡s/d͡z/t͡ʃ/d͡ʒ/ð/s̺/z̺/f/β");
    word.replace("m", "ɲ", "_ɲ");
    word.replace("m", "ŋ", "_k/g/ɣ");
    word.replace("n", "ŋ", "_k/g/ɣ");

    word.replace("r", "ɾ", "[!=#/r]_[!=r]");

    //Degemination
    word.forEach(segment => {
        if (segment.type == "consonant" && (segment.value == segment.relIdx(1).value[0] || segment.value == segment.relIdx(1).value) && segment.value != "r")
            segment.remove();
    });

    word.remove("β", "V_ɔ/o/u/uo̯/ou̯");
    word.remove("β", "u[stressed]_");

    word.remove("ɣ");
    word.replace("ŋ", "n", "_#");
    word.replace("ɫ", "l", "_V");
    if (word.stressedVowel.relIdx(-1).type == "consonant")
        word.stressedVowel.relIdx(-1).stressed = true;

    word.forEach(segment => {
        if ((segment.value == "e" || (segment.value == "a" && segment != word.vowels.atIdx(0))) && !segment.stressed && segment.idx != 0
            && (segment.relIdx(1).type == "vowel" || segment.ctxMatch("_C,V/j/w") || segment.ctxMatch("_p/t/k/b/d/g/f/β/ð,l/ɾ,V/j/w"))
            && !segment.relIdx(1).match("ʎ", "ɲ") && !segment.ctxMatch("_t/d,l")
        )
            segment.value = "ə";
    });

    //Final devoicing
    word.slice().reverse().forEach(segment => {
        if (segment.negIdx == -1 || segment.relIdx(1).match("p", "t", "k", "t͡s", "t͡ʃ", "f", "θ", "s̺")) {
            switch (segment.value) {
                case "b":
                    segment.value = "p";
                    break;
                case "d":
                    segment.value = "t";
                    break;
                case "g":
                    segment.value = "k";
                    break;
                case "d͡z":
                    segment.value = "t͡s";
                    break;
                case "d͡ʒ":
                    segment.value = "t͡ʃ";
                    break;
                case "β":
                    segment.value = "f";
                    break;
                case "ð":
                    segment.value = "θ";
                    break;
                case "z̺":
                    segment.value = "s̺";
                    break;
            }
        }
    });
    word.forEach(segment => {
        if (segment.type == "consonant" && segment.value == segment.relIdx(1).value[0])
            segment.remove();
    });
    word.replace("t͡s", "s̺", "_C");

    word.replaceSeq("t,s̺", "t͡s");
    word.replaceSeq("θ,s̺", "t͡s");

    word.replace("s̺", "t͡s", "ɲ/ʎ_");

    word.forEach(segment => {
        if (segment.value == "ɲ" && segment.ctxMatch("V[!=i]_C/#")) {
            word.insert("j", segment.idx);
        }
    });

    word.forEach(segment => {
        if (segment.type == "vowel" && segment.relIdx(1).value == "j") {
            if (segment.value != "i" && !segment.value.endsWith("i̯"))
                segment.value += "i̯";
            segment.relIdx(1).remove();
        }

        if (segment.type == "vowel" && segment.ctxMatch("_w,C[!=ɾ]/#")) {
            if (segment.value != "u" && !segment.value.endsWith("u̯"))
                segment.value += "u̯";
            segment.relIdx(1).remove();
        }
    });

    word.replace("ɲ", "n", "_C");
    word.replace("ʎ", "ɫ", "_C");

    word.replace("e[!stressed]", "ɛ", "_ɫ/ɾ,C");
    word.replace("o[!stressed]", "ɔ", "_ɫ,C");

    word.remove("s̺", "_t͡s");

    addRow("EOF", "Early Old French", "900", getSpelling_EOF(), word, true);
}

function EOF_to_LOF(variety) {
    word = outcomes.EOF.duplicate();

    word.replace("β", "v");

    word.replace("m", "n", "_#");
    word.replace("ɲ", "n", "_#");

    word.replace("e", "ei̯", "_ɲ");
    word.replace("u", "ui̯", "_ʎ/ɲ,V");

    word.remove("f", "_s̺/t,C/#");
    word.remove("p", "_s̺/t,C/#");
    word.remove("k", "_s̺/t,C/#");
    word.remove("s̺", "_s̺,C/#");
    word.replace("m", "n", "_s̺/t");
    word.replace("ŋ", "n", "_s̺/t");

    word.remove("k", "s̺_l");
    word.replace("s̺", "z̺", "_l");
    word.remove("g", "ɾ_l");

    word.remove("p/t/k/b/d/g", "_m/n/ɲ/p/t/k/b/d/g/f");
    word.remove("m/n/ɲ/ŋ", "_m/n/ɲ");

    word.forEach(segment => {
        if (segment.type == "vowel" && segment.relIdx(1).match("m", "n", "ɲ", "ŋ"))
            segment.nasalized = true;
    });

    word.replaceSeq("ie̯u̯", "ie̯,w");
    word.replaceSeq("uo̯u̯", "uo̯,w");

    word.forEach(segment => {
        if (segment.value == "ei̯" && !segment.nasalized && variety != "norman")
            segment.value = "oi̯";

        if (segment.value == "ou̯" && !segment.relIdx(1).match("m", "p", "b", "f", "v"))
            segment.value = "eu̯";

        if (segment.value == "uo̯")
            segment.value = "ue̯";
    });

    word.forEach(segment => {
        if (segment.value == "ɫ" && segment.relIdx(1).type == "consonant") {
            segment.relIdx(-1).droppedL = true;
            if (segment.relIdx(-1).match("i", "u", "oi̯", "ui̯", "ə", "w") || segment.relIdx(-1).value.endsWith("u̯"))
                segment.remove();
            else
                segment.value = "w";
        }
    });

    if (variety != "norman") {
        word.replace("eː", "ie̯", "_w");
        word.replace("ɛ", "e̯a", "_w");
        word.replace("ai̯", "e̯a", "_w");
    }

    word.replace("a", "ɑ", "_s̺/z̺");

    word.remove("θ");
    word.remove("ð");
    word.forEach(segment => {
        if (segment.type == "vowel" && segment.relIdx(1).match("m", "n", "ɲ", "ŋ"))
            segment.nasalized = true;
    });

    word.replace("e", "ə", "_V");

    word.replace("ɔ", "o", "_m/n/ɲ/ŋ");
    word.replace("ue̯", "o", "_m/n/ŋ");

    word.replace("u", "y");
    word.replace("ui̯", "yi̯");

    word.remove("m", "ɾ_C/#");
    word.remove("n", "ɾ_C/#");

    if (!word.vowels.atIdx(-1).stressed) {
        word.vowels.atIdx(-1).value = "ə";
        if (word.vowels.atIdx(-1).relIdx(1).value == "w")
            word.vowels.atIdx(-1).relIdx(1).remove();
    }

    if (variety == "norman")
        word.remove("g", "#_w");
    else
        word.remove("w", "k/g_");

    word.replace("iu̯", "yi̯");

    word.replace("w[stressed]", "v", "V_");
    word.replace("w", "v", "i/oi̯/ə/e/eː_");

    if (variety != "norman")
        word.replace("ɛ/e", "æ", "_m/n/ŋ");

    word.replace("e", "ɛ", "_l/ɾ/r");

    word.forEach(segment => {
        if (segment.value == "ie̯") {
            if (segment.relIdx(-1).value != "w")
                word.insert("j", segment.idx);
            if (segment.stressed)
                segment.relIdx(-1).stressed = true;
            segment.value = "e";
        }

        if (segment.value == "ue̯") {
            if (segment.relIdx(-1).value != "w")
                word.insert("w", segment.idx);
            if (segment.stressed)
                segment.relIdx(-1).stressed = true;
            segment.value = "e";
        }

        if (segment.value == "yi̯") {
            if (segment.relIdx(-1).value != "w")
                word.insert("ɥ", segment.idx);
            if (segment.stressed)
                segment.relIdx(-1).stressed = true;
            segment.value = "i";
        }
    });

    word.forEach(segment => {
        if (segment.type == "vowel" && segment.relIdx(1).value == "j" && segment.value != "ə" && !segment.value.endsWith("i̯") && !segment.value.endsWith("u̯")) {
            if (!segment.match("i", "y"))
                segment.value += "i̯";
            segment.relIdx(1).remove();
        }

        if (segment.type == "vowel" && segment.relIdx(1).value == "e̯au̯" && segment.value != "ə" && !segment.value.endsWith("i̯") && !segment.value.endsWith("u̯")) {
            if (!segment.match("i", "y"))
                segment.value += "i̯";
            segment.relIdx(1).value = "au̯";
        }

        if (segment.type == "vowel" && segment.relIdx(1).value == "w" && segment.value != "ə" && !segment.match("i", "y") && !segment.value.endsWith("i̯")) {
            if (segment.value != "u" && !segment.value.endsWith("u̯"))
                segment.value += "u̯";
            segment.relIdx(1).remove();
        }
    });

    word.replace("eː", "e");

    word.replace("o", "u");
    word.replace("ou̯", "u");

    word.replace("ai̯", "ɛ", "_C");

    word.replace("ɔi̯", "oi̯");
    word.replace("ɛu̯", "eu̯");

    word.replace("e", "ø", "w_");
    word.replace("ɛ", "œ", "w_");
    word.replace("eu̯", "øu̯");

    //Loss of preconsonantal /z/
    word.forEach(segment => {
        if (segment.value == "z̺" && segment.ctxMatch("V_C") && !segment.relIdx(1).match("j", "w", "ɥ")) {
            if (segment.relIdx(-1).value.length == 1 && segment.relIdx(-1).value != "ə")
                segment.relIdx(-1).value += "ː";
            segment.relIdx(-1).droppedS = true;
            segment.remove();
        }
    });

    word.replace("a", "ə", "_y");

    word.forEach(segment => {
        if (segment.value == "ə" && segment.relIdx(-1).type == "vowel" && segment.nextVowel().stressed)
            segment.remove();
    });

    word.replace("l", "ɾ", "t/d_");

    addRow("LOF", "Late Old French", "1200", getSpelling_LOF(), word);
}

function LOF_to_MF() {
    word = outcomes.LOF.duplicate();

    word.replace("ɫ", "l");

    word.replace("ɔu̯", "u");

    //Loss of preconsonantal /s/ and other vowel lengthening
    word.forEach(segment => {
        if (segment.value == "s̺" && segment.ctxMatch("V_C") && !segment.relIdx(1).match("j", "w", "ɥ")) {
            if (segment.relIdx(-1).value.length == 1 && segment.relIdx(-1).value != "ə")
                segment.relIdx(-1).value += "ː";
            segment.relIdx(-1).droppedS = true;
            segment.remove();
        }

        if (segment.type == "vowel" && segment.relIdx(1).match("z̺", "r") && segment.value.length == 1 && segment.value != "ə")
            segment.value += "ː";
    });
    word.replace("ɔ", "ɔː", "_v");

    word.forEach(segment => {
        if (segment.value == "e" && segment.relIdx(1).type == "consonant" && !segment.ctxMatch("_ɾ,ə"))
            segment.value = "ɛ";
    });
    word.replace("ø", "œ");
    word.replace("øː", "œː");

    if (word.partOfSpeech == "inf" && word.atIdx(-1).value == "ɾ" && word.atIdx(-2).value == "ɛ" && word.atIdx(-3).value == "j" && word.atIdx(-4).type == "consonant")
        word.atIdx(-3).remove();

    word.replace("w", "j", "[!=p/b/f/v/k/g]_øu̯");

    word.replace("øu̯", "œ");
    word.remove("w", "_œ/œː/øː");

    word.replace("ɔ", "u", "_V/#");

    //Loss of vowels in hiatus
    word.forEach(segment => {
        if (
            segment.type == "vowel"
            && (
                segment.relIdx(-1).match("ə", "a")
                || segment.relIdx(-1).value == segment.value[0]
                || (segment.relIdx(-1).value == "ɛ" && segment.value.startsWith("e"))
                || (segment.relIdx(-1).value == "ɔ" && (segment.value.startsWith("o") || segment.value.startsWith("u")))
            )
        ) {
            if (segment.stressed && segment.value.length == 1)
                segment.value += "ː";
            if (segment.match("eː", "ei̯"))
                segment.value = "ɛː";
            if (segment.relIdx(-1).match("a", "ɛ") && segment.match("ɛː", "iː")) {
                segment.value = "ɛː";
                segment.droppedA = true;
            }
            if (segment.relIdx(-1).value == "ɔ" && segment.value == "uː")
                segment.value = "oː";
            else if (segment.relIdx(-1).match("ə", "a") && segment.value == "uː" && segment.relIdx(1).match("m", "n", "ɲ", "ŋ"))
                segment.value = "ɑː";
            segment.relIdx(-1).remove();
        }
    });

    word.replace("aː", "ɑː");
    word.replace("eː", "ɛː");
    word.replace("ɔː", "oː");
    word.replace("æː", "ɑː");

    word.forEach(segment => {
        if (segment.ctxMatch("_m/n/ɲ/ŋ,C/#")) {
            switch (segment.value) {
                case "ɑː":
                    segment.value = "a";
                    break;
                case "ɛː":
                    segment.value = "ɛ";
                    break;
                case "iː":
                    segment.value = "i";
                    break;
                case "oː":
                    segment.value = "ɔ";
                    break;
                case "uː":
                    segment.value = "u";
                    break;
                case "yː":
                    segment.value = "y";
                    break;
            }
        }
    });

    word.replace("u", "ɔ", "_m/n/ɲ/ŋ");

    word.forEach(segment => {
        if (segment.type == "vowel" && segment.relIdx(-1).value == "oi̯" && segment.stressed) {
            word.insert("j", segment.idx);
            segment.relIdx(-1).stressed = true;
        }
    });

    word.forEach(segment => {
        if (segment.value == "ɛː" && !segment.stressed && segment.EOFValue != "ai̯")
            segment.value = "e";
    });

    word.replace("ɾ", "r");

    word.replace("ai̯", "ɛ");

    //Syllabification
    if (word.stressedVowel.relIdx(-1).type == "consonant")
        word.stressedVowel.relIdx(-1).stressed = true;
    if (word.stressedVowel.relIdx(-1).match("j", "w", "ɥ") && word.stressedVowel.relIdx(-2).type == "consonant" && !word.stressedVowel.relIdx(-2).match("j", "w", "ɥ"))
        word.stressedVowel.relIdx(-2).stressed = true;
    if (word.stressedVowel.relIdx(-1).match("l", "r") && word.stressedVowel.relIdx(-2).match("p", "t", "k", "b", "d", "g", "f"))
        word.stressedVowel.relIdx(-2).stressed = true;
    if (word.stressedVowel.relIdx(-1).match("j", "w", "ɥ") && word.stressedVowel.relIdx(-2).match("l", "r") && word.stressedVowel.relIdx(-3).match("p", "t", "k", "b", "d", "g", "f"))
        word.stressedVowel.relIdx(-3).stressed = true;
    if (word.stressedVowel.relIdx(-1).value == "r" && word.stressedVowel.relIdx(-2).value == "v")
        word.stressedVowel.relIdx(-2).stressed = true;
    if (word.stressedVowel.relIdx(-1).match("j", "w", "ɥ") && word.stressedVowel.relIdx(-2).value == "r" && word.stressedVowel.relIdx(-3).value == "v")
        word.stressedVowel.relIdx(-3).stressed = true;
    word.forEach(segment => {
        if (word.vowels.atIdx(0).stressed && segment.idx < word.vowels.atIdx(0).idx)
            segment.stressed = true;
    });

    word.lateOFWord = word.duplicate();

    word.replace("æ", "a");

    word.forEach(segment => {
        if (segment.value == "oi̯") {
            word.insert("w", segment.idx);
            if (segment.stressed)
                segment.relIdx(-1).stressed = true;
            segment.value = "ɛ";
        }
    });
    word.remove("w", "w_");

    word.replace("t͡s", "s");
    word.replace("d͡z", "z");
    word.replace("t͡ʃ", "ʃ");
    word.replace("d͡ʒ", "ʒ");

    word.replace("s̺", "s");
    word.replace("z̺", "z");

    //Vowel nasalization
    word.forEach(segment => {
        segment.nasalized = false;
        if (segment.type == "vowel" && segment.ctxMatch("_m/n/ɲ/ŋ,C/#") && !segment.relIdx(2).match("j", "w")) {
            segment.value = segment.value.slice(0, 1) + "\u0303" + segment.value.slice(1);
            if (segment.value.length > 2)
                segment.value += "\u0303";
            else if (segment.value != "ə̃")
                segment.value += "ː";
            segment.relIdx(1).remove();
        }
    });

    word.replace("ei̯", "ɛ");
    word.replace("ẽĩ̯", "ɛ̃");

    word.replace("ə̃", "ə");

    word.replace("au̯", "oː");
    word.replace("e̯au̯", "e̯oː");

    addRow("MF", "Middle French", "1600", getSpelling_MF(word.lateOFWord), word, true);
}

function MF_to_ModF() {
    word = outcomes.MF.duplicate();

    //Delete /j/ after palatals, except before nasal vowels
    word.forEach(segment => {
        if (segment.value == "j" && segment.relIdx(-1).match("ʃ", "ʒ", "ʎ", "ɲ") && !segment.relIdx(1).value.includes("\u0303")) {
            word.lateOFWord.vowels[word.vowels.indexOf(segment.nextVowel())].relIdx(-1).remove();
            segment.remove();
        }
    });

    //Loss of internal schwa
    word.forEach(segment => {
        if (
            segment.value == "ə" && segment.idx < word.stressedVowel.idx && !segment.ctxMatch("#,C_")
            && !(segment.ctxMatch("C,l/r_") && segment.relIdx(-1).value != segment.relIdx(1).value)
        ) {
            if (segment.relIdx(-1).value == segment.relIdx(1).value) {
                word.lateOFWord.vowels[word.vowels.indexOf(segment)].remove();
                word.lateOFWord.vowels[word.vowels.indexOf(segment)].relIdx(-1).remove();
                segment.relIdx(-1).remove();
            }
            segment.remove();
        }
    });

    //Loss of final consonants
    while (word.atIdx(-1).type == "consonant" && !word.atIdx(-1).match("t", "k", "l", "ʎ", "r", "f"))
        word.atIdx(-1).remove();

    word.replace("ɛ", "a", "w_");

    word.replace("e", "ɛ", "_r");

    if (word.atIdx(-1).value == "r" && word.atIdx(-2).value == "ɛ" && word.atIdx(-2).EOFValue != "ai̯" && word.vowels.length > 1)
        word.atIdx(-1).remove();

    word.replace("ɛ[EOFValue!=ai̯]", "e", "_V/#");

    word.replace("œ", "ø", "_#/z/t");
    word.replace("œː", "øː");

    //Loss of vowel length distinction
    word.forEach(segment => {
        if (segment.value.endsWith("ː"))
            segment.value = segment.value.slice(0, -1);
    });

    word.remove("t", "_#");

    word.replace("r", "ʁ");

    word.replace("ʎ", "j");
    word.remove("j", "_j");

    //Elision of final schwa
    if (word.vowels.atIdx(-1).value == "ə")
        word.vowels.atIdx(-1).remove();

    word.replace("e̯o", "o");

    word.forEach(segment => {
        if (segment.match("i", "u", "y") && segment.relIdx(1).type == "vowel" && !segment.ctxMatch("p/t/k/b/d/g/f/v,l/ʁ_") && !segment.ctxMatch("C,j/w/ɥ_")) {
            switch (segment.value) {
                case "i":
                    segment.value = "j";
                    break;
                case "u":
                    segment.value = "w";
                    break;
                case "y":
                    segment.value = "ɥ";
                    break;
            }
            segment.type = "consonant";
        }
    });

    word.forEach(segment => {
        if (segment.value == "i" && segment.relIdx(1).type == "vowel")
            word.insert("j", segment.idx + 1);

        if (segment.value == "j" && segment.ctxMatch("p/t/k/b/d/g/f/v,l/ʁ_"))
            word.insert("i", segment.idx);
    });

    //Syllabification
    if (word.stressedVowel.relIdx(-1).type == "consonant")
        word.stressedVowel.relIdx(-1).stressed = true;
    if (word.stressedVowel.relIdx(-1).match("j", "w", "ɥ") && word.stressedVowel.relIdx(-2).type == "consonant" && !word.stressedVowel.relIdx(-2).match("j", "w", "ɥ"))
        word.stressedVowel.relIdx(-2).stressed = true;
    if (word.stressedVowel.relIdx(-1).match("l", "ʁ") && word.stressedVowel.relIdx(-2).match("p", "t", "k", "b", "d", "g", "f"))
        word.stressedVowel.relIdx(-2).stressed = true;
    if (word.stressedVowel.relIdx(-1).match("j", "w", "ɥ") && word.stressedVowel.relIdx(-2).match("l", "ʁ") && word.stressedVowel.relIdx(-3).match("p", "t", "k", "b", "d", "g", "f"))
        word.stressedVowel.relIdx(-3).stressed = true;
    if (word.stressedVowel.relIdx(-1).value == "ʁ" && word.stressedVowel.relIdx(-2).value == "v")
        word.stressedVowel.relIdx(-2).stressed = true;
    if (word.stressedVowel.relIdx(-1).match("j", "w", "ɥ") && word.stressedVowel.relIdx(-2).value == "ʁ" && word.stressedVowel.relIdx(-3).value == "v")
        word.stressedVowel.relIdx(-3).stressed = true;
    word.forEach(segment => {
        if (word.vowels.atIdx(0).stressed && segment.idx < word.vowels.atIdx(0).idx)
            segment.stressed = true;
    });

    word.replace("ĩ", "ɛ̃");
    word.replace("ỹ", "œ̃");
    word.replace("ɛ̃", "æ̃");
    word.replace("ã", "ɒ̃");
    word.replace("ɔ̃", "õ");

    //Metropolitan French vowel mergers
    word.replace("œ̃", "æ̃");
    word.replace("ɑ", "a");
    word.replace("ə", "œ");
    word.replace("ɔ", "o", "_#");

    //Allophonic vowel lengthening
    word.forEach(segment => {
        if (segment.type == "vowel" && segment.stressed && segment.ctxMatch("_v/z/ʒ/ʁ,#/ʁ"))
            segment.value += "ː";
        else if (segment.match("o", "ø", "ɒ̃", "æ̃", "õ") && segment.stressed && segment.relIdx(1).type == "consonant")
            segment.value += "ː";
    });

    word.replace("ʁ", "χ", "p/t/k/f/s/ʃ_");
    word.replace("ʁ", "χ", "_p/t/k/f/s/ʃ");
    word.replace("ʁ", "χ", "V_#");

    addRow("ModF", "Modern French", "", getSpelling_ModF(word.lateOFWord), word);
}

function LL_to_ModIt() {
    word = outcomes.LL.duplicate();

    word.replace("nʲ", "ɲ", "V/C_");
    word.replace("n", "ɲ", "_ɲ");
    word.replace("lʲ", "ʎ", "V/C_");
    word.replace("l", "ʎ", "_ʎ");

    word.replace("k", "c", "_ɛ/ɛː/e/eː/ɪ/ɪː/i/iː");
    word.replace("g", "ɟ", "_ɛ/ɛː/e/eː/ɪ/ɪː/i/iː");
    word.replace("k", "c", "_c");
    word.replace("g", "ɟ", "_ɟ");
    word.replace("ŋ", "ɲ", "_c/ɟ");

    word.replace("ɟ", "j");
    word.replace("d͡zʲ", "j", "#_");
    word.replace("d͡zʲ", "j", "V/j/w,d_");
    word.replace("d", "j", "_j");
    word.replace("ɲ", "n", "_j");
    word.remove("j", "C[!=w]_j");

    word.forEach(segment => {
        if (segment.value == "j" && segment.ctxMatch("V_V") && segment.relIdx(-1).idx > word.stressedVowel.idx) {
            if (segment.relIdx(-1).match("ɪ", "e"))
                segment.relIdx(-1).value = "j";
            segment.remove();
        }
    });
    word.replaceSeq("l,j", "ʎ,ʎ");
    word.remove("l", "_ʎ");

    word.forEach(segment => {
        if (segment.value == "j" && segment.ctxMatch("V/w_V"))
            word.insert("j", segment.idx);
    });

    word.replace("ɪ", "i", "_ŋ,t/t͡sʲ");
    word.replace("ʊ", "u", "_ŋ,t/t͡sʲ");

    if (word.atIdx(-1).value == "s" && word.atIdx(-2).match("ɪ", "ʊ") && !word.atIdx(-2).stressed)
        word.atIdx(-1).remove();

    word.replace("ɪ", "e");
    word.replace("ɪː", "eː");
    word.replace("ʊ", "o");
    word.replace("ʊː", "oː");

    word.replace("e", "i", "_ɲ/ʎ");

    word.replace("ŋ", "ɲ", "_n/ɲ");
    word.replace("n", "ɲ", "ɲ_");

    word.forEach(segment => {
        if (segment.value == "t͡sʲ" && segment.relIdx(-1).type == "vowel")
            word.insert("t", segment.idx);
    });

    word.remove("k/p", "_s,#");

    if (word.atIdx(-1).type == "consonant" && word.atIdx(-2).type == "consonant" && !word.atIdx(-2).match("j", "w"))
        word.atIdx(-1).remove();
    word.replace("m", "n", "_#");
    word.replace("ɲ", "n", "_#");
    word.replace("ŋ", "n", "_#");

    if (word.atIdx(-1).value == "n" && !word.vowels.atIdx(-1).stressed && !word.vowels.atIdx(-2).stressed)
        word.atIdx(-1).remove();

    //Consonant assimilation
    word.forEach(segment => {
        if (segment.type == "consonant" && segment.relIdx(1).type == "consonant" && !segment.match("m", "n", "ɲ", "ŋ", "ɫ", "r", "j", "w", "s", "z") && !segment.relIdx(1).match("l", "ʎ", "r", "rʲ", "j", "w"))
            segment.value = segment.relIdx(1).value[0];
    });
    word.remove("s", "s_C");
    word.replace("m", "n", "_n");
    word.replace("m", "ɲ", "_ɲ");
    word.replace("n", "m", "_m");

    word.forEach(segment => {
        if (segment.type == "consonant" && segment.relIdx(1).value[0] == segment.value && !segment.ctxMatch("V/j/w_"))
            segment.remove();
    });

    word.replace("m", "n", "_s/sʲ/t/t͡sʲ");
    word.replace("ŋ", "n", "_s/sʲ/t/t͡sʲ");

    word.forEach(segment => {
        if (segment.value == "r" && segment.relIdx(-1).value == "z") {
            word.insert("d", segment.idx);
            if (segment.relIdx(1).stressed)
                segment.relIdx(-1).stressed = true;
        }
    });

    word.replace("e", "i", "uː_");

    word.replace("l", "ʎ", "p/k/b/g/f_");

    word.replaceSeq("j,j", "ɟ,ɟ");
    word.replace("j", "ɟ", "#/r/n_");

    word.replace("c", "t͡ʃ");
    word.replace("ɟ", "d͡ʒ");
    word.replace("t͡ʃ", "t", "_t͡ʃ");
    word.replace("d͡ʒ", "d", "_d͡ʒ");
    word.replace("ɲ", "n", "_t͡ʃ/d͡ʒ");

    word.replace("t͡sʲ", "t͡ʃ", "s_");

    word.replaceSeq("s,t͡ʃ", "ʃ,ʃ");

    word.forEach(segment => {
        if (segment.value == "w" && segment.relIdx(1) == word.vowels.atIdx(0) && !segment.relIdx(-1).match("k", "g")) {
            segment.value = "o";
            segment.type = "vowel";
            segment.stressed = false;
            segment.relIdx(-1).stressed = false;
        }
    });

    word.replace("w", "β", "l/r_");

    word.forEach(segment => {
        if (segment.type == "consonant" && !segment.match("k", "g") && segment.relIdx(1).value == "w") {
            if (segment.relIdx(-1).type == "vowel")
                word.insert(segment.value, segment.idx);
            segment.relIdx(1).remove();
        }
    });

    word.replaceSeq("β,β", "b,b");
    word.replaceSeq("β,βʲ", "b,bʲ");

    word.remove("w", "#,k_ɛ/ɛː/e/eː/i/iː");

    word.replace("k", "g", "V/j/w_w");

    word.replace("t͡sʲ", "t͡s");
    word.replace("d͡zʲ", "d͡z");

    if (word.vowels.atIdx(-1).value == "u")
        word.vowels.atIdx(-1).value = "o";

    word.replace("s", "j", "_#");

    if (word.atIdx(-1).value == "n" && word.partOfSpeech == "conjVerb")
        word.insert("o", word.length);

    //Loss of final consonants
    if (word.atIdx(-1).type == "consonant" && !word.atIdx(-1).match("j", "w") && !(word.atIdx(-1).value == "n" && word.vowels.length == 1))
        word.atIdx(-1).remove();

    if (word.atIdx(-1).value == "j" && !word.atIdx(-2).stressed) {
        if (word.atIdx(-2).value == "a" && word.partOfSpeech != "conjVerb")
            word.atIdx(-2).value = "e";
        else
            word.atIdx(-2).value = "i";
        word.atIdx(-1).remove();
    }

    word.forEach(segment => {
        if (segment.type == "vowel" && segment.value.endsWith("ː"))
            segment.value = segment.value[0];

        if (
            segment.type == "vowel" && segment.stressed && segment.value.length == 1
            && (segment.relIdx(1).type == "vowel" || segment.ctxMatch("_C,V") || segment.ctxMatch("_p/t/k/b/d/g/f/β,l/r/w,_"))
        )
            segment.value += "ː";
    });

    addRow("ItR", "Italo-Romance", "900", "", word, true);

    word.replace("sʲ", "ʃ");
    word.replace("s", "ʃ", "_ʃ");

    word.replace("rʲ", "j");

    word.forEach(segment => {
        if (segment.value.endsWith("ʲ")) {
            word.insert("j", segment.idx + 1);
            segment.value = segment.value.slice(0, -1);
            if (segment.stressed)
                segment.relIdx(1).stressed = true;
        }
    });

    word.forEach(segment => {
        if (segment.match("p", "k", "b", "g", "f") && segment.relIdx(1).value == "ʎ") {
            segment.relIdx(1).value = "j";
            if (segment.relIdx(-1).type == "vowel")
                word.insert(segment.value, segment.idx);
        }
    });
    word.remove("j", "_i/iː");

    if (word.atIdx(0).value == "e" && !word.atIdx(0).stressed && word.atIdx(1).match("s", "z", "ʃ") && word.atIdx(2).type == "consonant" && word.atIdx(2).value != "s")
        word.atIdx(0).remove();
    word.remove("ʃ", "#_ʃ");
    if (word.atIdx(0).match("s", "z", "ʃ") && word.atIdx(1).stressed)
        word.atIdx(0).stressed = true;

    word.forEach(segment => {
        if (segment.value == "β" && segment.relIdx(1).value == "r") {
            segment.value = "b";
            word.insert("b", segment.idx);
        }
    });

    word.forEach(segment => {
        if (segment.type == "vowel" && segment.value.endsWith("ː"))
            segment.value = segment.value[0];

        if (
            segment.type == "vowel" && segment.stressed && segment.value.length == 1
            && !(segment.relIdx(1).type == "consonant" && segment.relIdx(2).type != "vowel" &&
                !(segment.relIdx(1).match("p", "t", "k", "b", "d", "g", "f", "β") && segment.relIdx(2).match("l", "r", "w")))
        )
            segment.value += "ː";
    });

    word.forEach(segment => {
        if (segment.value == "j" && segment.relIdx(1).type == "vowel" && segment.idx < word.stressedVowel.idx - 1) {
            segment.relIdx(1).value = "i";
            segment.remove();
        }
    });

    word.replace("eː", "iː", "_V");
    word.replace("oː", "uː", "_V");

    word.forEach(segment => {
        if (segment.value == "ɛː" && !segment.relIdx(-1).match("j", "w")) {
            word.insert("j", segment.idx);
            if (segment.stressed)
                segment.relIdx(-1).stressed = true;
            segment.diphthongized = true;
        }

        if (segment.value == "ɔː" && !segment.relIdx(-1).match("j", "w")) {
            word.insert("w", segment.idx);
            if (segment.stressed)
                segment.relIdx(-1).stressed = true;
        }
    });

    word.replaceSeq("a,w", "ɔː");
    word.replaceSeq("aː,w", "ɔː");

    word.forEach(segment => {
        if (segment.type == "vowel" && segment.value.endsWith("ː"))
            segment.value = segment.value[0];

        if (
            segment.type == "vowel" && segment.stressed && segment.value.length == 1 && segment.negIdx != -1
            && !(segment.relIdx(1).type == "consonant" && segment.relIdx(2).type != "vowel" &&
                !(segment.relIdx(1).match("p", "t", "k", "b", "d", "g", "f", "β") && segment.relIdx(2).match("l", "r", "w")))
        )
            segment.value += "ː";
    });

    word.forEach(segment => {
        if (segment.value == "ɛː" && segment.ctxMatch("j_a/e/o")) {
            segment.value = "iː";
            segment.relIdx(-1).remove();
        }

        if (segment.value == "ɔː" && segment.ctxMatch("w_a/e/o")) {
            segment.value = "uː";
            segment.relIdx(-1).remove();
        }
    });

    word.replace("ɫ", "l");

    word.replace("β", "v");
    word.replace("n", "ɱ", "_v");

    word.replace("e[stressed]", "ɛ", "j_");
    word.replace("eː[stressed]", "ɛː", "j_");

    word.forEach(segment => {
        if (segment.value == "e" && !segment.stressed && segment != word.vowels.atIdx(-1) && segment.relIdx(1).value != "r")
            segment.value = "i";

        if (segment.value == "u" && segment.idx < word.stressedVowel.idx)
            segment.value = "o";

        if (segment.value == "ɔ" && segment.idx < word.stressedVowel.idx)
            segment.value = "u";

        if (segment.value == "a" && segment.relIdx(1).value == "r" && !segment.stressed && segment.idx != 0)
            segment.value = "e";
    });

    word.replace("ɔ", "o", "_m/n/ɲ/ŋ,C[!=n]");

    word.replace("e", "i", "_ŋ");
    word.replace("o", "u", "_ŋ");
    word.replace("e", "i", "_s,k,j");

    word.remove("j", "t͡ʃ/d͡ʒ/ʃ/ʎ/ɲ_");
    word.remove("j", "C,r_");
    word.remove("w", "C,r_");

    if (word.atIdx(-3).match("aː", "uː") && word.atIdx(-2).match("t", "d") && word.atIdx(-1).value == "e" && word.partOfSpeech != "conjVerb") {
        word.atIdx(-2).remove();
        word.atIdx(-1).remove();
    }

    word.replace("ʃ", "t͡ʃ", "V_V");

    word.replace("s", "z", "V_V");

    addRow("ModIt", "Modern Italian", "", getSpelling_ModIt(), word);
}

function getSpelling_Lat() {
    let str = wordArg;
    str = str.replaceAll("ā", "a");
    str = str.replaceAll("ē", "e");
    str = str.replaceAll("ī", "i");
    str = str.replaceAll("ō", "o");
    str = str.replaceAll("ū", "u");
    str = str.replaceAll("ȳ", "y");

    if (modernTypography) {
        str = str.replaceAll(/^i(?=[aeiouy])/g, "j");
        str = str.replaceAll(/(?<=[aeiouy])i(?=[aeiouy])/g, "j");
    }
    else {
        str = str.replaceAll("u", "v");
    }

    return str;
}

function getSpelling_OSp() {
    let str = "";
    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);
        switch (segment.value) {
            case "a":
                str += "a";
                break;
            case "e":
                str += "e";
                break;
            case "i":
            case "j":
                if (segment.relIdx(-1).type != "consonant" || segment.negIdx == -1)
                    str += "y";
                else
                    str += "i";
                break;
            case "o":
                str += "o";
                break;
            case "u":
                str += "u";
                break;
            case "w":
                if (segment.relIdx(-1).type != "consonant")
                    str += "h";
                str += "u";
                break;
            case "b":
                str += "b";
                break;
            case "t͡s":
                if (segment.relIdx(1).match("e", "i", "j"))
                    str += "c";
                else if (segment.relIdx(1).type == "vowel" || segment.relIdx(1).value == "w")
                    str += "ç";
                else
                    str += "z";
                break;
            case "t͡ʃ":
                str += "ch";
                break;
            case "d":
            case "ð":
                str += "d";
                break;
            case "h":
            case "ɸ":
                str += "f";
                break;
            case "g":
            case "ɣ":
                if (segment.relIdx(1).match("e", "i", "j"))
                    str += "gu";
                else
                    str += "g";
                break;
            case "ʒ":
                if (segment.relIdx(1).match("e", "i", "j"))
                    str += "g";
                else
                    str += "j";
                break;
            case "k":
                if (segment.relIdx(1).match("e", "i", "j"))
                    str += "qu";
                else if (segment.relIdx(1).value == "w" && !segment.relIdx(2).match("e", "i", "j"))
                    str += "q";
                else
                    str += "c";
                break;
            case "l":
                str += "l";
                break;
            case "ʎ":
                str += "ll";
                break;
            case "m":
                str += "m";
                break;
            case "n":
            case "ŋ":
                str += "n";
                break;
            case "ɲ":
                str += "nn";
                break;
            case "p":
                str += "p";
                break;
            case "ɾ":
                str += "r";
                break;
            case "r":
                if (segment.ctxMatch("V/j/w_"))
                    str += "rr";
                else
                    str += "r";
                break;
            case "s̺":
                if (segment.ctxMatch("V/j/w_V/j/w"))
                    str += "ss";
                else
                    str += "s";
                break;
            case "z̺":
                str += "s";
                break;
            case "t":
                str += "t";
                break;
            case "β":
                if (segment.relIdx(1).type == "consonant" && !segment.relIdx(1).match("j", "w"))
                    str += "b";
                else
                    str += "v";
                break;
            case "ʃ":
                str += "x";
                break;
            case "ʝ":
                str += "y";
                break;
            case "d͡z":
                str += "z";
                break;
        }
    }

    return str.replace(/s$/, `<span class="nonHist">s</span>`);
}

function getSpelling_EModSp() {
    let str = "";

    if (wordArg.startsWith("h") && word.atIdx(0).type == "vowel")
        str += "h";

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);

        if (segment.droppedCons && (segment.type == "vowel" || segment.relIdx(-1).type == "vowel"))
            str += "h";

        switch (segment.value) {
            case "a":
                if (segment.negIdx == -1 && segment.stressed && word.vowels.length > 1)
                    str += "à";
                else
                    str += "a";
                break;
            case "e":
                if (segment.negIdx == -1 && segment.stressed && word.vowels.length > 1)
                    str += "è";
                else
                    str += "e";
                break;
            case "i":
                if (str == "")
                    str += "y";
                else if (segment.negIdx == -1 && segment.stressed && word.vowels.length > 1)
                    str += "ì";
                else
                    str += "i";
                break;
            case "o":
                if (segment.negIdx == -1 && segment.stressed && word.vowels.length > 1)
                    str += "ò";
                else
                    str += "o";
                break;
            case "u":
                if (segment.negIdx == -1 && segment.stressed && word.vowels.length > 1)
                    str += "ù";
                else if (str == "" && !modernTypography)
                    str += "v";
                else
                    str += "u";
                break;
            case "j":
                if (segment.negIdx == -1)
                    str += "y";
                else
                    str += "i";
                break;
            case "w":
                if (segment.ctxMatch("#/V_V"))
                    str += "h";
                str += "u";
                break;
            case "b":
            case "β":
                if (segment.OSpValue == "b")
                    str += "b";
                else if (str == "" || modernTypography)
                    str += "v";
                else
                    str += "u";
                break;
            case "t͡ʃ":
                str += "ch";
                break;
            case "d":
            case "ð":
                str += "d";
                break;
            case "f":
                str += "f";
                break;
            case "g":
            case "ɣ":
                if (segment.relIdx(1).match("e", "i", "j"))
                    str += "gu";
                else
                    str += "g";
                break;
            case "ʃ":
                if (segment.OSpValue == "ʃ")
                    str += "x";
                else if (segment.relIdx(1).match("e", "i", "j"))
                    str += "g";
                else if (modernTypography)
                    str += "j";
                else
                    str += "i";
                break;
            case "k":
                if (segment.relIdx(1).match("e", "i", "j"))
                    str += "qu";
                else if (segment.relIdx(1).value == "w" && !segment.relIdx(2).match("e", "i", "j"))
                    str += "q";
                else
                    str += "c";
                break;
            case "l":
                str += "l";
                break;
            case "ʎ":
                str += "ll";
                break;
            case "m":
            case "ɱ":
                if (segment.relIdx(1).value == "b" && !(segment.relIdx(1).OSpValue == "b" || segment.relIdx(2).value == "w"))
                    str += "n";
                else
                    str += "m";
                break;
            case "n":
            case "ŋ":
                str += "n";
                break;
            case "ɲ":
                str += "ñ";
                break;
            case "p":
                str += "p";
                break;
            case "ɾ":
                str += "r";
                break;
            case "r":
                if (segment.ctxMatch("V/j/w_"))
                    str += "rr";
                else
                    str += "r";
                break;
            case "s̺":
            case "z̺":
                if (segment.OSpValue == "s̺" && segment.ctxMatch("V/j/w_V/j/w")) {
                    if (modernTypography)
                        str += "ss";
                    else
                        str += "ſſ";
                } else if (segment.negIdx == -1 || modernTypography) {
                    str += "s";
                } else {
                    str += "ſ";
                }
                break;
            case "t":
                str += "t";
                break;
            case "ʝ":
                str += "y";
                break;
            case "s":
            case "z":
                if (segment.OSpValue == "d͡z" || !segment.ctxMatch("_V/j/w"))
                    str += "z";
                else if (segment.relIdx(1).match("e", "i", "j"))
                    str += "c";
                else
                    str += "ç";
                break;
        }
    }

    return str;
}

function getSpelling_ModSp(EModSpWord) {
    let word = EModSpWord;
    let str = "";

    if (wordArg.startsWith("h") && word.atIdx(0).type == "vowel")
        str += "h";

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);

        if (segment.droppedCons && (segment.type == "vowel" || segment.relIdx(-1).type == "vowel"))
            str += "h";

        let defaultStress = false;
        if (segment == word.vowels.atIdx(-2) && (word.atIdx(-1).type == "vowel" || word.atIdx(-1).match("s̺", "n")))
            defaultStress = true;
        if (segment == word.vowels.atIdx(-1) && word.atIdx(-1).type == "consonant" && !word.atIdx(-1).match("s̺", "n"))
            defaultStress = true;
        if (word.vowels.length == 1 && segment.type == "vowel")
            defaultStress = true;
        if (segment.match("i", "u") && (segment.relIdx(1).type == "vowel" || segment.relIdx(-1).type == "vowel"))
            defaultStress = false;
        if (segment.match("i", "u") && segment.relIdx(1).match("j", "w") && segment.relIdx(2).type == "consonant")
            defaultStress = false;

        switch (segment.value) {
            case "a":
                if (segment.stressed && !defaultStress)
                    str += "á";
                else
                    str += "a";
                break;
            case "e":
                if (segment.stressed && !defaultStress)
                    str += "é";
                else
                    str += "e";
                break;
            case "i":
                if (segment.stressed && !defaultStress)
                    str += "í";
                else
                    str += "i";
                break;
            case "o":
                if (segment.stressed && !defaultStress)
                    str += "ó";
                else
                    str += "o";
                break;
            case "u":
                if (segment.stressed && !defaultStress)
                    str += "ú";
                else
                    str += "u";
                break;
            case "j":
                if (segment.negIdx == -1)
                    str += "y";
                else
                    str += "i";
                break;
            case "w":
            case "w̝":
                if (segment.ctxMatch("#/V_V"))
                    str += "h";
                if (segment.ctxMatch("g/ɣ_e/i/j"))
                    str += "ü";
                else
                    str += "u";
                break;
            case "b":
            case "β":
                if (segment.LatValue == "b" || segment.LatValue == "p" || segment.LatValue == "pʰ" || !segment.LatValue)
                    str += "b";
                else
                    str += "v";
                break;
            case "t͡ʃ":
                str += "ch";
                break;
            case "d":
            case "ð":
                str += "d";
                break;
            case "f":
                str += "f";
                break;
            case "g":
            case "ɣ":
                if (segment.relIdx(1).match("e", "i", "j"))
                    str += "gu";
                else
                    str += "g";
                break;
            case "ʃ":
                if (segment.LatValue == "g" && segment.relIdx(1).match("e", "i", "j"))
                    str += "g";
                else
                    str += "j";
                break;
            case "k":
                if (segment.relIdx(1).match("e", "i", "j"))
                    str += "qu";
                else
                    str += "c";
                break;
            case "l":
                str += "l";
                break;
            case "ʎ":
                str += "ll";
                break;
            case "m":
            case "ɱ":
                if (segment.relIdx(1).value == "b" && !(segment.relIdx(1).LatValue == "b" || segment.relIdx(1).LatValue == "p" || !segment.relIdx(1).LatValue || segment.relIdx(2).value == "w"))
                    str += "n";
                else
                    str += "m";
                break;
            case "n":
            case "ŋ":
                str += "n";
                break;
            case "ɲ":
                str += "ñ";
                break;
            case "p":
                str += "p";
                break;
            case "ɾ":
                str += "r";
                break;
            case "r":
                if (segment.ctxMatch("V/j/w_"))
                    str += "rr";
                else
                    str += "r";
                break;
            case "s̺":
            case "z̺":
                str += "s";
                break;
            case "t":
                str += "t";
                break;
            case "ɟ͡ʝ":
            case "ʝ":
                str += "y";
                break;
            case "s":
            case "z":
                if (segment.relIdx(1).match("e", "i", "j"))
                    str += "c";
                else
                    str += "z";
                break;
        }
    }

    return str;
}

function getSpelling_OGP() {
    let str = "";

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);

        switch (segment.value) {
            case "a":
                str += "a";
                break;
            case "ɐ":
                str += "a";
                break;
            case "ɛ":
                str += "e";
                break;
            case "e":
                str += "e";
                break;
            case "i":
                if ((segment.relIdx(-1).type != "consonant" && !segment.relIdx(-1).match("i", "ĩ") && !segment.relIdx(1).match("i", "ĩ")) || segment.negIdx == -1)
                    str += "y";
                else
                    str += "i";
                break;
            case "ɔ":
                str += "o";
                break;
            case "o":
                str += "o";
                break;
            case "u":
                if (segment == word.vowels.atIdx(-1) && !segment.stressed && !segment.relIdx(-1).match("u", "ũ"))
                    str += "o";
                else
                    str += "u";
                break;
            case "ã":
                if (segment.relIdx(1).type == "vowel")
                    str += "ã";
                else if (segment.relIdx(1).match("p", "b"))
                    str += "am";
                else
                    str += "an";
                break;
            case "ẽ":
                if (segment.relIdx(1).type == "vowel")
                    str += "ẽ";
                else if (segment.relIdx(1).match("p", "b"))
                    str += "em";
                else
                    str += "en";
                break;
            case "ĩ":
                if (segment.relIdx(1).type == "vowel")
                    str += "ĩ";
                else if (segment.relIdx(1).match("p", "b"))
                    str += "im";
                else
                    str += "in";
                break;
            case "õ":
                if (segment.relIdx(1).type == "vowel")
                    str += "õ";
                else if (segment.relIdx(1).match("p", "b"))
                    str += "om";
                else
                    str += "on";
                break;
            case "ũ":
                if (segment.relIdx(1).type == "vowel")
                    str += "ũ";
                else if (segment.relIdx(1).match("p", "b"))
                    str += "um";
                else
                    str += "un";
                break;
            case "j":
                if (segment.relIdx(1).type != "consonant")
                    str += "y";
                else
                    str += "i";
                break;
            case "w":
                str += "u";
                break;
            case "b":
                str += "b";
                break;
            case "k":
                if (segment.relIdx(1).match("ɛ", "e", "i", "ẽ", "ĩ", "j"))
                    str += "qu";
                else if (segment.relIdx(1).value == "w")
                    str += "q";
                else
                    str += "c";
                break;
            case "t͡s":
                if (segment.negIdx == -1)
                    str += "z";
                else if (segment.relIdx(1).match("ɛ", "e", "i", "ẽ", "ĩ", "j"))
                    str += "c";
                else
                    str += "ç";
                break;
            case "t͡ʃ":
                str += "ch";
                break;
            case "d":
                str += "d";
                break;
            case "f":
                str += "f";
                break;
            case "g":
                if (segment.relIdx(1).match("ɛ", "e", "i", "ẽ", "ĩ", "j"))
                    str += "gu";
                else
                    str += "g";
                break;
            case "ʒ":
                if (segment.relIdx(1).match("ɛ", "e", "i", "ẽ", "ĩ", "j") && segment.LatValue == "g")
                    str += "g";
                else
                    str += "j";
                break;
            case "l":
            case "ɫ":
                str += "l";
                break;
            case "ʎ":
                str += "lh";
                break;
            case "m":
                str += "m";
                break;
            case "n":
                str += "n";
                break;
            case "ɲ":
                str += "nh";
                break;
            case "p":
                str += "p";
                break;
            case "ɾ":
                str += "r";
                break;
            case "r":
                if (segment.ctxMatch("V/j/w_"))
                    str += "rr";
                else
                    str += "r";
                break;
            case "s̺":
                if (segment.ctxMatch("V/j/w_V/j/w") && !str.endsWith("n"))
                    str += "ss";
                else
                    str += "s";
                break;
            case "z̺":
                str += "s";
                break;
            case "t":
                str += "t";
                break;
            case "β":
                str += "v";
                break;
            case "ʃ":
                str += "x";
                break;
            case "d͡z":
                str += "z";
                break;
        }
    }

    if (!modernTypography) {
        str = str.replaceAll("j", "i")
            .replaceAll("v", "u");
    }

    return str;
}

function getSpelling_ModPort(EModPortWord, variety) {
    let word = EModPortWord;
    let str = "";

    if (wordArg.startsWith("h") && word.atIdx(0).type == "vowel")
        str += "h";

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);

        let defaultStress = false;
        if (segment == word.vowels.atIdx(-2) && (word.atIdx(-1).type == "vowel" || word.atIdx(-1).match("s", "t͡s")))
            defaultStress = true;
        if (segment == word.vowels.atIdx(-2) && word.partOfSpeech == "conjVerb" && word.atIdx(-2).value == "ɐ̃" && word.atIdx(-1).value == "w" && !word.atIdx(-2).stressed)
            defaultStress = true;
        if (segment == word.vowels.atIdx(-2) && word.atIdx(-2).value == "ẽ" && word.atIdx(-1).value == "j")
            defaultStress = true;
        if (segment == word.vowels.atIdx(-1) && segment.match("i", "u", "ɐ̃", "ĩ", "õ", "ũ"))
            defaultStress = true;
        if (segment == word.vowels.atIdx(-1) && segment.relIdx(1).type == "consonant" && segment.relIdx(1).value != "s")
            defaultStress = true;
        if (segment.match("i", "u") && segment.relIdx(-1).type == "vowel" && segment.relIdx(1).value != "ɲ" && !(segment.value == "i" && segment.ctxMatch("_ɾ,#")))
            defaultStress = false;
        if (segment == word.vowels.atIdx(-2) && word.atIdx(-1).value == "ɐ̃")
            defaultStress = false;
        if (segment == word.vowels.atIdx(-2) && word.vowels.atIdx(-1).relIdx(-1).value == "w")
            defaultStress = false;
        if (segment.match("ɛ", "ɔ") && segment.relIdx(1).match("j", "w"))
            defaultStress = false;
        if (segment.value == "ẽ" && segment.relIdx(1).value == "j" && segment.negIdx == -2 && word.vowels.length > 1)
            defaultStress = false;

        switch (segment.value) {
            case "a":
                if (segment.stressed && !defaultStress)
                    str += "á";
                else
                    str += "a";
                break;
            case "ɐ":
                if (segment.stressed && !defaultStress)
                    str += "â";
                else
                    str += "a";
                break;
            case "ɛ":
                if (segment.stressed && !defaultStress && variety == "br" && segment.relIdx(1).match("m", "n", "ɲ"))
                    str += "ê";
                else if (segment.stressed && !defaultStress)
                    str += "é";
                else
                    str += "e";
                break;
            case "e":
                if (segment.stressed && !defaultStress)
                    str += "ê";
                else
                    str += "e";
                break;
            case "i":
                if (
                    (segment.OGPValue == "e" || segment.OGPValue == "ẽ" || !segment.OGPValue) && !segment.relIdx(1).match("ɛ", "e", "ẽ", "i", "ĩ")
                    && !(segment.relIdx(1).match("u", "ũ")
                        && ((segment.OGPValue == "o" || segment.OGPValue == "õ" || (segment == word.vowels.atIdx(-1) && !segment.stressed))
                            && !segment.relIdx(1).match("ɔ", "o", "õ")))
                    && !segment.stressed
                )
                    str += "e";
                else if (segment.stressed && !defaultStress)
                    str += "í";
                else
                    str += "i";
                break;
            case "ɔ":
                if (segment.stressed && !defaultStress && variety == "br" && segment.relIdx(1).match("m", "n", "ɲ"))
                    str += "ô";
                else if (segment.stressed && !defaultStress)
                    str += "ó";
                else
                    str += "o";
                break;
            case "o":
                if (segment.stressed && !defaultStress)
                    str += "ô";
                else
                    str += "o";
                break;
            case "u":
                if ((segment.OGPValue == "o" || segment.OGPValue == "õ" || (segment == word.vowels.atIdx(-1) && !segment.stressed)) && !segment.relIdx(1).match("ɔ", "o", "õ") && !segment.stressed)
                    str += "o";
                else if (segment.stressed && !defaultStress)
                    str += "ú";
                else
                    str += "u";
                break;
            case "ɐ̃":
                if (segment.relIdx(1).match("p", "b") || (word.partOfSpeech == "conjVerb" && segment.ctxMatch("_w,#") && !segment.stressed)) {
                    if (segment.stressed && !defaultStress)
                        str += "ám";
                    else
                        str += "am";
                } else if (segment.relIdx(1).type == "consonant" && !segment.relIdx(1).match("j", "w")) {
                    if (segment.stressed && !defaultStress)
                        str += "án";
                    else
                        str += "an";
                } else {
                    str += "ã";
                }
                break;
            case "ẽ":
                if (segment.relIdx(1).match("p", "b") || (segment.relIdx(1).value == "j" && (segment.negIdx == -2 || segment.relIdx(2).match("p", "b")))) {
                    if (segment.stressed && !defaultStress && segment == word.vowels.atIdx(-1) && segment.relIdx(1).value == "j")
                        str += "ém";
                    else if (segment.stressed && !defaultStress)
                        str += "êm";
                    else
                        str += "em";
                } else {
                    if (segment.stressed && !defaultStress && segment == word.vowels.atIdx(-1) && segment.relIdx(1).value == "j")
                        str += "én";
                    else if (segment.stressed && !defaultStress)
                        str += "ên";
                    else
                        str += "en";
                }
                break;
            case "ĩ":
                if (segment.ctxMatch("_p/b/#")) {
                    if (segment.stressed && !defaultStress)
                        str += "ím";
                    else
                        str += "im";
                } else {
                    if (segment.stressed && !defaultStress)
                        str += "ín";
                    else
                        str += "in";
                }
                break;
            case "õ":
                if (segment.ctxMatch("_p/b/#")) {
                    if (segment.stressed && !defaultStress)
                        str += "ôm";
                    else
                        str += "om";
                } else if (segment.relIdx(1).type == "consonant" && !segment.relIdx(1).match("j", "w")) {
                    if (segment.stressed && !defaultStress)
                        str += "ôn";
                    else
                        str += "on";
                } else {
                    str += "õ";
                }
                break;
            case "ũ":
                if (segment.ctxMatch("_p/b/#")) {
                    if (segment.stressed && !defaultStress)
                        str += "úm";
                    else
                        str += "um";
                } else {
                    if (segment.stressed && !defaultStress)
                        str += "ún";
                    else
                        str += "un";
                }
                break;
            case "j":
                if (segment.relIdx(-1).value == "ẽ")
                    break;
                else if (segment.relIdx(-1).match("ɐ̃", "õ") && segment.relIdx(-1) == word.vowels.atIdx(-1))
                    str += "e";
                else
                    str += "i";
                break;
            case "w":
                if (word.partOfSpeech == "conjVerb" && segment.ctxMatch("ɐ̃_#") && !segment.relIdx(-1).stressed)
                    break;
                else if (segment.relIdx(-1).value == "ɐ̃" && segment.relIdx(-1) == word.vowels.atIdx(-1))
                    str += "o";
                else
                    str += "u";
                break;
            case "b":
                str += "b";
                break;
            case "k":
                if (segment.relIdx(1).match("ɛ", "e", "i", "ẽ", "ĩ", "j"))
                    str += "qu";
                else if (segment.relIdx(1).value == "w")
                    str += "q";
                else
                    str += "c";
                break;
            case "t͡s":
                if (segment.negIdx == -1 && segment.relIdx(-1).stressed)
                    str += "z";
                else if (segment.relIdx(1).match("ɛ", "e", "i", "ẽ", "ĩ", "j"))
                    str += "c";
                else if (segment.negIdx == -1 || segment.idx == 0)
                    str += "s";
                else
                    str += "ç";
                break;
            case "t͡ʃ":
                str += "ch";
                break;
            case "d":
                str += "d";
                break;
            case "f":
                str += "f";
                break;
            case "g":
                if (segment.relIdx(1).match("ɛ", "e", "i", "ẽ", "ĩ", "j"))
                    str += "gu";
                else
                    str += "g";
                break;
            case "ʒ":
                if (segment.relIdx(1).match("ɛ", "e", "i", "ẽ", "ĩ", "j") && segment.LatValue != "j")
                    str += "g";
                else
                    str += "j";
                break;
            case "l":
            case "ɫ":
                str += "l";
                break;
            case "ʎ":
                str += "lh";
                break;
            case "m":
                str += "m";
                break;
            case "n":
                str += "n";
                break;
            case "ɲ":
                str += "nh";
                break;
            case "p":
                str += "p";
                break;
            case "ɾ":
                str += "r";
                break;
            case "r":
                if (segment.ctxMatch("V/j/w_"))
                    str += "rr";
                else
                    str += "r";
                break;
            case "s":
                if (segment.ctxMatch("V/j/w_V/j/w") && !str.endsWith("n"))
                    str += "ss";
                else
                    str += "s";
                break;
            case "z":
                if (str.endsWith("n"))
                    str += "z";
                else
                    str += "s";
                break;
            case "t":
                str += "t";
                break;
            case "v":
                str += "v";
                break;
            case "ʃ":
                str += "x";
                break;
            case "d͡z":
                str += "z";
                break;
        }
    }

    return str;
}

function getSpelling_EOF() {
    let str = "";
    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);
        switch (segment.value) {
            case "a":
                str += "a";
                break;
            case "ɛ":
            case "e":
            case "eː":
            case "ə":
                str += "e";
                break;
            case "i":
            case "j":
                str += "i";
                break;
            case "ɔ":
            case "o":
                str += "o";
                break;
            case "u":
            case "w":
                str += "u";
                break;
            case "ie̯":
                str += "ie";
                break;
            case "uo̯":
                str += "uo";
                break;
            case "ai̯":
                str += "ai";
                break;
            case "ei̯":
                str += "ei";
                break;
            case "ɔi̯":
            case "oi̯":
                str += "oi";
                break;
            case "ui̯":
                str += "ui";
                break;
            case "au̯":
                str += "au";
                break;
            case "ɛu̯":
            case "eu̯":
                str += "eu";
                break;
            case "iu̯":
                str += "iu";
                break;
            case "ɔu̯":
            case "ou̯":
                str += "ou";
                break;
            case "ie̯u̯":
                str += "ieu";
                break;
            case "uo̯u̯":
                str += "uou";
                break;
            case "b":
                str += "b";
                break;
            case "t͡ʃ":
                str += "ch";
                break;
            case "d":
            case "ð":
                str += "d";
                break;
            case "f":
                str += "f";
                break;
            case "g":
                str += "g";
                break;
            case "d͡ʒ":
                if (["ɛ", "e", "eː", "ə", "i"].includes(segment.relIdx(1).value[0]))
                    str += "g";
                else
                    str += "j";
                break;
            case "k":
                if (segment.relIdx(1).value == "w")
                    str += "q";
                else if (["ɛ", "e", "eː", "ə", "i"].includes(segment.relIdx(1).value[0]))
                    str += "qu";
                else
                    str += "c";
                break;
            case "l":
            case "ɫ":
                str += "l";
                break;
            case "ʎ":
                if (!str.endsWith("i"))
                    str += "i";
                str += "l";
                if (segment.relIdx(1).type == "vowel")
                    str += "l";
                break;
            case "m":
                str += "m";
                break;
            case "n":
            case "ŋ":
                str += "n";
                break;
            case "ɲ":
                if (segment.negIdx == -1)
                    str += "ng";
                else
                    str += "gn";
                break;
            case "p":
                str += "p";
                break;
            case "ɾ":
                str += "r";
                break;
            case "r":
                if (segment.idx == 0)
                    str += "r";
                else
                    str += "rr";
                break;
            case "s̺":
                if (segment.ctxMatch("V_V"))
                    str += "ss";
                else
                    str += "s";
                break;
            case "z̺":
                str += "s";
                break;
            case "t":
            case "θ":
                str += "t";
                break;
            case "β":
                str += "v";
                break;
            case "t͡s":
                if (segment.negIdx == -1)
                    str += "z";
                else
                    str += "c";
                break;
            case "d͡z":
                str += "z";
                break;
        }
    }

    return str;
}

function getSpelling_LOF() {
    let str = "";

    let frontVowels = ["ɛ", "e", "æ", "ə", "i", "ei̯", "e̯au̯", "øu̯", "ɛː", "eː", "iː", "j"];

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);
        switch (segment.value) {
            case "a":
            case "ɑ":
                if (segment.relIdx(1).value == "ɲ")
                    str += "ai";
                else
                    str += "a";
                break;
            case "ɛ":
            case "e":
            case "œ":
            case "ø":
            case "æ":
            case "ə":
                if (segment.EOFValue == "ai̯")
                    str += "ai";
                else
                    str += "e";
                break;
            case "i":
                str += "i";
                if (segment.droppedL && (segment.negIdx == -1 || segment.ctxMatch("_s̺,#")))
                    str += "l";
                break;
            case "ɔ":
            case "u":
                if (segment.relIdx(1).value == "ɲ")
                    str += "oi";
                else
                    str += "o";
                break;
            case "y":
                str += "u";
                if (segment.droppedL && (segment.negIdx == -1 || segment.ctxMatch("_s̺,#")))
                    str += "l";
                break;
            case "ai̯":
                str += "ai";
                if (segment.droppedS)
                    str += "s";
                break;
            case "ei̯":
                str += "ei";
                break;
            case "oi̯":
                str += "oi";
                if (segment.droppedL && (segment.negIdx == -1 || segment.ctxMatch("_s̺,#")))
                    str += "l";
                else if (segment.droppedS)
                    str += "s";
                break;
            case "au̯":
                str += "au";
                break;
            case "e̯au̯":
                str += "eau";
                break;
            case "øu̯":
                str += "eu";
                break;
            case "ɔu̯":
                str += "ou";
                break;
            case "ɑː":
                str += "as";
                break;
            case "ɛː":
            case "eː":
            case "øː":
                if (segment.EOFValue == "ai̯")
                    str += "ais";
                else
                    str += "es";
                break;
            case "iː":
                str += "is";
                break;
            case "ɔː":
            case "uː":
                if (segment.relIdx(1).value == "z")
                    str += "o";
                else
                    str += "os";
                break;
            case "yː":
                str += "us";
                break;
            case "j":
                str += "i";
                break;
            case "w":
            case "ɥ":
                str += "u";
                break;
            case "b":
                str += "b";
                break;
            case "t͡ʃ":
                str += "ch";
                break;
            case "d":
                str += "d";
                break;
            case "f":
                str += "f";
                break;
            case "g":
                if (segment.relIdx(1).match(...frontVowels))
                    str += "gu";
                else
                    str += "g";
                break;
            case "d͡ʒ":
                if (segment.relIdx(1).match(...frontVowels))
                    str += "g";
                else
                    str += "j";
                break;
            case "k":
                if (segment.relIdx(1).match(...frontVowels) || (segment.LatValue == "kʷ" && segment.ctxMatch("_V/j")))
                    str += "qu";
                else
                    str += "c";
                break;
            case "l":
            case "ɫ":
                str += "l";
                break;
            case "ʎ":
                if (!str.endsWith("i"))
                    str += "i";
                str += "l";
                if (segment.ctxMatch("_V/j/w/ɥ"))
                    str += "l";
                break;
            case "m":
                str += "m";
                break;
            case "n":
            case "ŋ":
                str += "n";
                break;
            case "ɲ":
                str += "gn";
                break;
            case "p":
                str += "p";
                break;
            case "ɾ":
                str += "r";
                break;
            case "r":
                if (segment.idx == 0)
                    str += "r";
                else
                    str += "rr";
                break;
            case "s̺":
                if (segment.ctxMatch("V_V/j"))
                    str += "ss";
                else
                    str += "s";
                break;
            case "z̺":
                str += "s";
                break;
            case "t":
                str += "t";
                break;
            case "v":
                str += "v";
                break;
            case "t͡s":
                if (segment.negIdx == -1)
                    str += "z";
                else
                    str += "c";
                break;
            case "d͡z":
                str += "z";
                break;
        }
    }

    return str.replace(/s$/, `<span class="nonHist">s</span>`);
}

function getSpelling_MF(lateOFWord) {
    let word = lateOFWord;
    let str = "";

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);

        let frontVowels = ["ɛ", "e", "ə", "æ", "œ", "i", "ei̯", "e̯au̯", "ɛː", "iː", "øː", "j"];

        let doubleCons = segment.ctxMatch("a/ɛ/æ/ɔ/o_ə") && segment.relIdx(-1).stressed && segment.relIdx(-1).EOFValue != "ai̯";

        switch (segment.value) {
            case "a":
            case "ɑ":
                if (segment.LOFValue == "u")
                    str += "ao";
                else if (segment.relIdx(1).value == "ɲ")
                    str += "ai";
                else
                    str += "a";
                break;
            case "ɛ":
            case "æ":
                if ((segment.EOFValue == "ai̯" || segment.droppedA) && (segment.negIdx == -1 || segment.relIdx(1).type == "vowel" || segment.relIdx(1).value == "j"))
                    str += "ay";
                else if (segment.EOFValue == "ai̯" || segment.droppedA)
                    str += "ai";
                else
                    str += "e";
                break;
            case "e":
                if (segment.droppedS && modernTypography)
                    str += "es";
                else if (segment.droppedS)
                    str += "eſ";
                else if (segment.negIdx == -1 && word.vowels.length > 1)
                    str += "é";
                else
                    str += "e";
                break;
            case "ə":
                str += "e";
                break;
            case "i":
                if (str.endsWith("y"))
                    break;
                else if (segment.relIdx(-1).type == "vowel" || segment.ctxMatch("#/w_v"))
                    str += "y";
                else
                    str += "i";
                if (segment.droppedL && (segment.negIdx == -1 || segment.ctxMatch("_s̺,#")))
                    str += "l";
                break;
            case "ɔ":
            case "o":
                if (segment.relIdx(1).value == "ɲ")
                    str += "oi";
                else
                    str += "o";
                break;
            case "u":
                str += "ou";
                break;
            case "y":
                if (segment.idx == 0 && !modernTypography)
                    str += "v";
                else
                    str += "u";
                if (segment.droppedL && (segment.negIdx == -1 || segment.ctxMatch("_s̺,#")))
                    str += "l";
                break;
            case "œ":
                if (segment.ctxMatch("k/g_ʎ"))
                    str += "e";
                else
                    str += "eu";
                break;
            case "ei̯":
                str += "ei";
                break;
            case "oi̯":
                if (segment.droppedS && modernTypography)
                    str += "ois";
                else if (segment.droppedS)
                    str += "oiſ";
                else if (segment.droppedL && (segment.negIdx == -1 || segment.ctxMatch("_s̺,#")))
                    str += "oil";
                else if (segment.negIdx == -1 || segment.relIdx(1).type == "vowel" || segment.relIdx(1).value == "j")
                    str += "oy";
                else
                    str += "oi";
                break;
            case "au̯":
                str += "au";
                break;
            case "e̯au̯":
                str += "eau";
                break;
            case "ɑː":
                if (segment.LOFValue == "u")
                    str += "ao";
                else if (!segment.droppedS)
                    str += "a";
                else if (modernTypography)
                    str += "as";
                else
                    str += "aſ";
                break;
            case "ɛː":
                if (segment.EOFValue == "ai̯" || segment.droppedA)
                    str += "ai";
                else
                    str += "e";
                if (segment.droppedS && modernTypography)
                    str += "s";
                else if (segment.droppedS)
                    str += "ſ";
                break;
            case "iː":
                if (!str.endsWith("y")) {
                    if (segment.relIdx(-1).type == "vowel")
                        str += "y";
                    else
                        str += "i";
                }
                if (segment.droppedS && modernTypography)
                    str += "s";
                else if (segment.droppedS)
                    str += "ſ";
                break;
            case "oː":
                if (segment.relIdx(1).value == "z̺" || !segment.droppedS)
                    str += "o";
                else if (modernTypography)
                    str += "os";
                else
                    str += "oſ";
                break;
            case "uː":
                if (!segment.droppedS)
                    str += "ou";
                else if (modernTypography)
                    str += "ous";
                else
                    str += "ouſ";
                break;
            case "yː":
                if (segment.idx == 0 && !modernTypography)
                    str += "v";
                else
                    str += "u";
                if (segment.droppedS && modernTypography)
                    str += "s";
                else if (segment.droppedS)
                    str += "ſ";
                break;
            case "œː":
                if (!segment.droppedS)
                    str += "eu";
                else if (modernTypography)
                    str += "eus";
                else
                    str += "euſ";
                break;
            case "j":
                if (str.endsWith("y"))
                    break;
                else if (segment.ctxMatch("#/V_"))
                    str += "y";
                else
                    str += "i";
                break;
            case "w":
                if (segment.idx == 0)
                    str += "h";
                str += "ou";
                break;
            case "ɥ":
                if (segment.idx == 0)
                    str += "h";
                str += "u";
                break;
            case "b":
                if (doubleCons)
                    str += "bb";
                else
                    str += "b";
                break;
            case "t͡ʃ":
                str += "ch";
                if (!segment.ctxMatch("_V/j/w/ɥ"))
                    str += "e";
                break;
            case "d":
                str += "d";
                break;
            case "f":
                if (doubleCons)
                    str += "ff";
                else
                    str += "f";
                break;
            case "g":
                if (segment.relIdx(1).match(...frontVowels) && segment.relIdx(1).EOFValue != "ai̯")
                    str += "gu";
                else
                    str += "g";
                break;
            case "d͡ʒ":
                if (segment.relIdx(1).match(...frontVowels))
                    str += "g";
                else if (modernTypography)
                    str += "j";
                else
                    str += "i";
                if (!segment.ctxMatch("_V/j/w/ɥ"))
                    str += "e";
                break;
            case "k":
                if (segment.ctxMatch("_œ/øː,ʎ"))
                    str += "cu";
                else if ((segment.relIdx(1).match(...frontVowels) && segment.relIdx(1).EOFValue != "ai̯") || (segment.LatValue == "kʷ" && segment.ctxMatch("_V/j")))
                    str += "qu";
                else
                    str += "c";
                break;
            case "l":
            case "ɫ":
                if (doubleCons)
                    str += "ll";
                else
                    str += "l";
                break;
            case "ʎ":
                if (!str.endsWith("i"))
                    str += "i";
                str += "l";
                if (segment.ctxMatch("_V/j/w/ɥ"))
                    str += "l";
                break;
            case "m":
                if (doubleCons || segment.ctxMatch("æ_V"))
                    str += "mm";
                else
                    str += "m";
                break;
            case "n":
            case "ŋ":
                if (doubleCons || segment.ctxMatch("æ_V"))
                    str += "nn";
                else
                    str += "n";
                break;
            case "ɲ":
                str += "gn";
                break;
            case "p":
                if (doubleCons)
                    str += "pp";
                else
                    str += "p";
                break;
            case "r":
                if (doubleCons || (segment.LOFValue == "r" && segment.idx != 0))
                    str += "rr";
                else
                    str += "r";
                break;
            case "s̺":
                if (segment.ctxMatch("au̯/e̯au̯/œ_#"))
                    str += "x";
                else if (segment.ctxMatch("V_V/j") && modernTypography)
                    str += "ss";
                else if (segment.ctxMatch("V_V/j"))
                    str += "ſſ";
                else if (segment.negIdx == -1 || modernTypography)
                    str += "s";
                else
                    str += "ſ";
                break;
            case "z̺":
                if (segment.negIdx == -1 || modernTypography)
                    str += "s";
                else
                    str += "ſ";
                break;
            case "t":
                if (doubleCons)
                    str += "tt";
                else
                    str += "t";
                break;
            case "v":
                if (segment.idx == 0 || modernTypography)
                    str += "v";
                else
                    str += "u";
                break;
            case "t͡s":
                if (segment.ctxMatch("V_#") && segment.relIdx(-1).stressed && word.vowels.length > 1)
                    str += "z";
                else if (segment.ctxMatch("au̯/e̯au̯/œ_#"))
                    str += "x";
                else if (segment.negIdx == -1)
                    str += "s";
                else if (!segment.relIdx(1).match(...frontVowels))
                    str += "ç";
                else
                    str += "c";
                break;
            case "d͡z":
                str += "z";
                break;
        }
    }

    return str;
}

function getSpelling_ModF(lateOFWord) {
    let word = lateOFWord;
    let str = "";

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);

        let frontVowels = ["ɛ", "e", "ə", "æ", "œ", "i", "ei̯", "e̯au̯", "ɛː", "iː", "øː", "j"];

        let doubleCons = segment.ctxMatch("a/ɛ/æ/ɔ/o_ə") && segment.relIdx(-1).stressed && segment.relIdx(-1).EOFValue != "ai̯";

        switch (segment.value) {
            case "a":
            case "ɑ":
                if (segment.LOFValue == "u")
                    str += "ao";
                else
                    str += "a";
                break;
            case "ɛ":
                if ((segment.EOFValue == "ai̯" || segment.droppedA) && segment.relIdx(1).match("j", "i", "iː"))
                    str += "ay";
                else if (segment.EOFValue == "ai̯" || segment.droppedA)
                    str += "ai";
                else if (segment.ctxMatch("_ə/#") || (segment.ctxMatch("_s̺,#") && word.vowels.length > 1))
                    str += "é";
                else if (segment.ctxMatch("_d/t͡ʃ/t͡s/d͡z/v/z̺,V/C") || segment.ctxMatch("_C,l/r") || (!segment.stressed && segment.ctxMatch("_C[!=s/ʎ],V")))
                    str += "è";
                else
                    str += "e";
                break;
            case "e":
                if (segment.relIdx(1).value == "r")
                    str += "è";
                else
                    str += "é";
                break;
            case "ə":
            case "æ":
                str += "e";
                break;
            case "i":
            case "iː":
                if (str.endsWith("y"))
                    break;
                else if (segment.relIdx(-1).type == "vowel" && segment.relIdx(-1).value != "y")
                    str += "ï";
                else
                    str += "i";
                if (segment.droppedL && (segment.negIdx == -1 || segment.ctxMatch("_s̺,#")))
                    str += "l";
                break;
            case "ɔ":
            case "o":
                str += "o";
                break;
            case "u":
            case "uː":
                str += "ou";
                break;
            case "y":
            case "yː":
                if (segment.droppedL && (segment.negIdx == -1 || segment.ctxMatch("_s̺,#")))
                    str += "ul";
                else if (str.endsWith("g") && segment.relIdx(1).match(...frontVowels) && segment.relIdx(1).EOFValue != "ai̯")
                    str += "ü";
                else
                    str += "u";
                break;
            case "œ":
            case "œː":
                if (segment.ctxMatch("k/g_ʎ"))
                    str += "e";
                else
                    str += "eu";
                break;
            case "ei̯":
                str += "ei";
                break;
            case "oi̯":
                if (segment.droppedL && (segment.negIdx == -1 || segment.ctxMatch("_s̺,#")))
                    str += "oil";
                else if (segment.relIdx(1).match("j", "i", "iː"))
                    str += "oy";
                else
                    str += "oi";
                break;
            case "au̯":
                str += "au";
                break;
            case "e̯au̯":
                str += "eau";
                break;
            case "ɑː":
                if (segment.LOFValue == "u")
                    str += "ao";
                else if (segment.relIdx(1).match("z̺") || segment.relIdx(1).LOFValue == "r")
                    str += "a";
                else
                    str += "â";
                break;
            case "ɛː":
                if (segment.EOFValue == "ai̯" || segment.droppedA)
                    str += "ai";
                else if (segment.relIdx(1).LOFValue == "r")
                    str += "e";
                else
                    str += "ê";
                break;
            case "oː":
                if (segment.relIdx(1).value == "z̺")
                    str += "o";
                else
                    str += "ô";
                break;
            case "j":
                if (str.endsWith("y"))
                    break;
                else if (segment.idx == 0 || segment.relIdx(-1).type == "vowel")
                    str += "y";
                else
                    str += "i";
                break;
            case "w":
                if (segment.idx == 0)
                    str += "h";
                str += "ou";
                break;
            case "ɥ":
                if (segment.idx == 0)
                    str += "h";
                str += "u";
                break;
            case "b":
                if (doubleCons)
                    str += "bb";
                else
                    str += "b";
                break;
            case "t͡ʃ":
                str += "ch";
                if (!segment.ctxMatch("_V/j/w/ɥ"))
                    str += "e";
                break;
            case "d":
                str += "d";
                break;
            case "f":
                if (doubleCons)
                    str += "ff";
                else
                    str += "f";
                break;
            case "g":
                if (segment.relIdx(1).match(...frontVowels) && segment.relIdx(1).EOFValue != "ai̯")
                    str += "gu";
                else
                    str += "g";
                break;
            case "d͡ʒ":
                if (segment.relIdx(1).match(...frontVowels))
                    str += "g";
                else
                    str += "j";
                if (!segment.ctxMatch("_V/j/w/ɥ"))
                    str += "e";
                break;
            case "k":
                if (segment.ctxMatch("_œ/øː,ʎ"))
                    str += "cu";
                else if ((segment.relIdx(1).match(...frontVowels) && segment.relIdx(1).EOFValue != "ai̯") || (segment.LatValue == "kʷ" && segment.ctxMatch("_V/j")))
                    str += "qu";
                else
                    str += "c";
                break;
            case "l":
            case "ɫ":
                if (doubleCons)
                    str += "ll";
                else
                    str += "l";
                break;
            case "ʎ":
                if (!str.endsWith("i"))
                    str += "i";
                str += "l";
                if (segment.ctxMatch("_V/j/w/ɥ"))
                    str += "l";
                break;
            case "m":
                if (doubleCons || segment.ctxMatch("æ_V"))
                    str += "mm";
                else
                    str += "m";
                break;
            case "n":
            case "ŋ":
                if (doubleCons || segment.ctxMatch("æ_V"))
                    str += "nn";
                else
                    str += "n";
                break;
            case "ɲ":
                str += "gn";
                break;
            case "p":
                if (doubleCons)
                    str += "pp";
                else
                    str += "p";
                break;
            case "r":
                if (doubleCons || (segment.LOFValue == "r" && segment.idx != 0))
                    str += "rr";
                else
                    str += "r";
                break;
            case "s̺":
                if (segment.ctxMatch("au̯/e̯au̯/œ_#"))
                    str += "x";
                else if (segment.ctxMatch("V_V/j"))
                    str += "ss";
                else
                    str += "s";
                break;
            case "z̺":
                str += "s";
                break;
            case "t":
                if (doubleCons)
                    str += "tt";
                else
                    str += "t";
                break;
            case "v":
                str += "v";
                break;
            case "t͡s":
                if (segment.ctxMatch("V_#") && segment.relIdx(-1).stressed && word.vowels.length > 1)
                    str += "z";
                else if (segment.ctxMatch("au̯/e̯au̯/œ_#"))
                    str += "x";
                else if (segment.negIdx == -1)
                    str += "s";
                else if (segment.relIdx(1).match(...frontVowels))
                    str += "c";
                else
                    str += "ç";
                break;
            case "d͡z":
                str += "z";
                break;
        }
    }

    return str;
}

function getSpelling_ModIt() {
    let str = "";

    let frontVowels = ["ɛ", "ɛː", "e", "eː", "i", "iː", "j"];

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);

        let accentCondition = (segment.negIdx == -1 && segment.stressed
            && (word.vowels.length > 1
                || (str.at(-1).match(/[iu]/) && str.at(-2) != "q")
                || (segment.diphthongized && segment.relIdx(-1).match("t͡ʃ", "d͡ʒ", "ʃ"))));

        switch (segment.value) {
            case "a":
            case "aː":
                if (accentCondition)
                    str += "à";
                else
                    str += "a";
                break;
            case "ɛ":
            case "ɛː":
                if (segment.diphthongized && segment.relIdx(-1).match("t͡ʃ", "d͡ʒ", "ʃ"))
                    str += "i";
                if (accentCondition)
                    str += "è";
                else
                    str += "e";
                break;
            case "e":
            case "eː":
                if (accentCondition)
                    str += "é";
                else
                    str += "e";
                break;
            case "i":
            case "iː":
                if (accentCondition)
                    str += "ì";
                else
                    str += "i";
                break;
            case "ɔ":
            case "ɔː":
                if (accentCondition)
                    str += "ò";
                else
                    str += "o";
                break;
            case "o":
            case "oː":
                if (accentCondition)
                    str += "ó";
                else
                    str += "o";
                break;
            case "u":
            case "uː":
                if (accentCondition)
                    str += "ù";
                else
                    str += "u";
                break;
            case "j":
                str += "i";
                break;
            case "w":
                str += "u";
                break;
            case "b":
                str += "b";
                break;
            case "k":
                if (segment.relIdx(1).value == "w" && !segment.relIdx(2).match("ɔ", "ɔː")) {
                    str += "q";
                } else {
                    str += "c";
                    if (segment.relIdx(1).match(...frontVowels))
                        str += "h";
                }
                break;
            case "t͡ʃ":
                str += "c";
                if (!segment.relIdx(1).match(...frontVowels) || (segment.ctxMatch("V_e,#") && segment.relIdx(1).LatValue.startsWith("a")))
                    str += "i";
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
                str += "g";
                if (segment.relIdx(1).match(...frontVowels))
                    str += "h";
                break;
            case "d͡ʒ":
                str += "g";
                if (!segment.relIdx(1).match(...frontVowels))
                    str += "i";
                break;
            case "ʎ":
                if (segment.relIdx(1).value != "ʎ") {
                    str += "gl";
                    if (!segment.relIdx(1).match("i", "iː"))
                        str += "i";
                }
                break;
            case "ɲ":
                if (segment.relIdx(1).value != "ɲ")
                    str += "gn";
                break;
            case "l":
                str += "l";
                break;
            case "m":
                str += "m";
                break;
            case "n":
            case "ɱ":
            case "ŋ":
                str += "n";
                break;
            case "p":
                str += "p";
                break;
            case "r":
                str += "r";
                break;
            case "s":
            case "z":
                str += "s";
                break;
            case "ʃ":
                if (segment.relIdx(1).value != "ʃ") {
                    str += "sc";
                    if (!segment.relIdx(1).match(...frontVowels))
                        str += "i";
                }
                break;
            case "t":
                if (segment.relIdx(1).value == "t͡ʃ")
                    str += "c";
                else if (segment.relIdx(1).value == "t͡s")
                    str += "z";
                else
                    str += "t";
                break;
            case "v":
                str += "v";
                break;
            case "t͡s":
            case "d͡z":
                str += "z";
                break;
        }
    }

    return str;
}