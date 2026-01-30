function getIPA_Lat() {
    let charToPhoneme = [
        ["a", "a"],
        ["ā", "aː"],
        ["ae", "ae̯"],
        ["au", "aw"],
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
        if (segment.match("g", "_ʊ,V")) {
            segment.value = "gʷ";
            segment.relIdx(1).remove();
        }

        if (segment.match("ɪ", "#/V_V")) {
            segment.value = "j";
            segment.type = "consonant";
            if (segment.ctxMatch("V_"))
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
        if (segment.match("z", "V_V"))
            word.insert("z", segment.idx);
    });

    word.forEach(segment => {
        if (segment.match("s", "m_"))
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
        if (segment.match("d", "_s/p/t/k/kʷ/pʰ/tʰ/kʰ/g/gʷ/n/l"))
            segment.value = segment.relIdx(1).value[0];
    });
    word.replace("d", "t", "_f");


    let stressedVowel;
    if (word.endMatch("k") && (word.atIdx(-2).match("C") || word.atIdx(-2).value.length > 1))
        stressedVowel = word.vowels.atIdx(-1);
    else if (word.vowels.length < 3)
        stressedVowel = word.vowels.atIdx(0);
    else if (word.vowels.atIdx(-2).value.length > 1 || (word.vowels.atIdx(-2).ctxMatch("_C,C") && !(word.vowels.atIdx(-2).ctxMatch("_p/t/k/b/d/g/pʰ/tʰ/kʰ/f,l/ɫ/r"))))
        stressedVowel = word.vowels.atIdx(-2);
    else
        stressedVowel = word.vowels.atIdx(-3);

    stressedVowel.stressed = true;
    if (stressedVowel.ctxMatch("C_"))
        stressedVowel.relIdx(-1).stressed = true;
    if (stressedVowel.ctxMatch("p/t/k/b/d/g/pʰ/tʰ/kʰ/f,l/ɫ/r_") || stressedVowel.ctxMatch("C,s,p/t/k/pʰ/tʰ/kʰ_"))
        stressedVowel.relIdx(-2).stressed = true;
    if (stressedVowel.ctxMatch("C,s,p/t/k/b/d/g/pʰ/tʰ/kʰ/f,l/ɫ/r_"))
        stressedVowel.relIdx(-3).stressed = true;
    word.forEach(segment => {
        if (word.vowels.atIdx(0).stressed && segment.idx < word.vowels.atIdx(0).idx)
            segment.stressed = true;
    });

    word.forEach(segment => {
        if (segment.match("V", "_n,f/s") || segment.match("V", "_m,#")) {
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

    addRow("Lat", "Classical Latin", "AD 50", getSpellingFromArg_Lat(), word);
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

    word.remove("p/t/k/b/d/g/f", "#_C[!=l/r]");

    word.remove("ɦ");
    word.remove("h");

    word.replace("ɛ", "e", "_V");
    word.replace("ɪ", "i", "_V");
    word.replace("ɔ", "o", "_V");
    word.replace("ʊ", "u", "_V");

    //Denasalization
    word.forEach(segment => {
        if (segment.nasalized) {
            if (segment.ctxMatch("_#") && segment.stressed) {
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
        if (segment.match("a", "_a/aː") || segment.match("e", "_ɛ/e/eː") || segment.match("i", "_ɪ/i/iː") || segment.match("o", "_ɔ/o/oː") || segment.match("u", "_ʊ/u/uː")) {
            if (segment.value.length == 1)
                segment.value += "ː";
            if (segment.relIdx(1).stressed)
                segment.stressed = true;
            segment.relIdx(1).remove();
        }
    });

    word.remove("ɪ", "{a/aː}[stressed],w_t/k");

    word.replace("w", "β", "_V", segment => !segment.ctxMatch("#/V/s,s_"));

    word.forEach(segment => {
        if (segment.match("ɪ", "a/aː/e/eː/o/oː_") && segment != word.vowels.atIdx(-1)) {
            segment.value = "j";
            segment.type = "consonant";
            if (segment.stressed)
                segment.relIdx(-1).stressed = true;
        }

        if (segment.match("ʊ", "a/aː/e/eː/o/oː_") && segment != word.vowels.atIdx(-1)) {
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
        if (segment.match("i/iː", "_ɪ/i/iː")) {
            segment.value = "iː";
            if (segment.relIdx(1).stressed)
                segment.stressed = true;
            segment.relIdx(1).remove();
        }
    });

    word.replace("ae̯", "ɛː");
    word.replace("oe̯", "eː");

    word.forEach(segment => {
        if (segment.match("i/e/iː/eː", "_V") && (!segment.stressed || segment == word.vowels.atIdx(-3)) && !segment.ctxMatch("#,w_")) {
            segment.value = "j";
            segment.type = "consonant";
            if (segment.stressed)
                segment.relIdx(1).stressed = true;
            if (segment.relIdx(1).stressed)
                segment.stressed = true;
        }

        if (segment.match("u/o/uː/oː", "_V") && !segment.stressed && !segment.ctxMatch("#,j_")) {
            segment.value = "w";
            segment.type = "consonant";
            if (segment.relIdx(1).stressed)
                segment.stressed = true;
        }

        if (segment.match("u/o/uː/oː", "_V") && segment == word.vowels.atIdx(-3) && !segment.ctxMatch("#,j_")) {
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
        if (segment.match("j", "r/w_ɛ/eː")) {
            segment.relIdx(1).value = "eː";
            segment.remove();
        }

        if (segment.match("w", "_ɔ/oː")) {
            segment.relIdx(1).value = "oː";
            segment.remove();
        }
    });

    word.remove("w", "k/g_j");

    word.forEach(segment => {
        if (segment.match("aw[!stressed]") && segment.nextVowel().match("ʊ/u/uː", "k/g_"))
            segment.value = "a";
    });

    word.replace("g", "w", "_m");
    word.replaceSeq("a,w", "aw");
    word.replaceSeq("aw,w", "aw");
    word.remove("w", "uː_");

    word.forEach(segment => {
        if (segment.match("p/k", "_s") && !segment.ctxMatch("V/j/w_s,V/j/w") && !segment.ctxMatch("[stressed]_s,#"))
            segment.remove();
    });

    word.replace("s", "f", "_f");
    word.replace("r", "s", "_s");

    //Degeminate s after long vowels
    word.forEach(segment => {
        if (segment.match("s", "V_s") && segment.relIdx(-1).value.length > 1)
            segment.remove();
    });

    word.replace("eː", "iː", "_s,t,j");
    word.replace("oː", "uː", "_s,t,j");

    //Early syncope
    word.forEach(segment => {
        if (segment.match("ʊ[!stressed]", "t/d/k/g_l/r,V") && segment != word.vowels.atIdx(0) && !(word.partOfSpeech == "inf" && segment.ctxMatch("_r,V,#")))
            segment.remove();

        if (segment.match("V[!=a/aː][!stressed]", "V,s_p/t/k,V/l/r"))
            segment.remove();

        if (segment.match("ɪ[!stressed]", "V,l/r/n_t/d") && segment == word.vowels.atIdx(-2))
            segment.remove();
    });
    word.forEach(segment => {
        if (segment.match("C") && segment.value == segment.relIdx(1).value && !segment.ctxMatch("V/j/w_C,V/j/w") && !segment.ctxMatch("_p/t/k/b/d/g,l/r"))
            segment.remove();
    });
    word.forEach(segment => {
        if (segment.match("m", "_l/r"))
            word.insert("b", segment.idx + 1);
    });
    word.replace("l", "ɫ", "_C");
    word.replace("ɫ", "l", "_j/w");
    word.replace("ɫ", "l", "_l");

    word.replace("b", "β", "V_V/w/r");

    word.replace("t", "k", "_l");
    word.replace("t", "k", "_k,l");

    word.insert("k", "s_l");

    word.forEach(segment => {
        if (segment.match("j", "C[!=t/k/d/g/d͡z]_") && segment.idx < word.vowels.atIdx(0).idx) {
            segment.value = "i";
            segment.type = "vowel";
            segment.stressed = false;
        }
    });

    //Palatalization (with gemination in many cases)
    word.forEach(segment => {
        if (segment.match("C[!=j]", "_j")) {
            if (!segment.match("s/t/r") && (segment.ctxMatch("V_") || segment.match("p/t/k/b/d/g", "ɫ/r_")))
                word.insert(segment.value, segment.idx);
            segment.value += "ʲ";
            segment.relIdx(1).remove();
        }
    });

    if (word.startMatch("s,C[!=w]"))
        word.insert("ɪ", 0);

    if (word.partOfSpeech == "conjVerb" && word.endMatch("r"))
        word.atIdx(-1).remove();

    if (word.endMatch("p/t/k/b/d/g/f,V[!stressed],r")) {
        word.insert("r", -2);
        word.atIdx(-1).remove();
    }

    if (word.partOfSpeech == "noun" && word.vowels.length == 1 && word.endMatch("C[!=s]"))
        word.insert("e", word.length);
    word.replace("ɫ", "l", "_V");

    //Allophonic lengthening
    word.forEach(segment => {
        if (segment.match("V") && segment.value.endsWith("ː"))
            segment.value = segment.value[0];

        if (
            segment.match("V[stressed]") && segment.value.length == 1
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
        if (segment.match("j", "V_V"))
            word.insert("j", segment.idx);
    });

    word.replaceSeq("aw", "a,w");

    word.forEach(segment => {
        if (segment.match("C"))
            segment.stressed = false;
    });
    if (word.stressedVowel.ctxMatch("C_") && !word.stressedVowel.ctxMatch("V,w_"))
        word.stressedVowel.relIdx(-1).stressed = true;
    if (word.stressedVowel.ctxMatch("p/t/k/b/d/g/f/β,l/r_") || word.stressedVowel.ctxMatch("C,w_") || word.stressedVowel.ctxMatch("C,s,p/t/k_"))
        word.stressedVowel.relIdx(-2).stressed = true;
    if (word.stressedVowel.ctxMatch("C,s,p/t/k,l/r_"))
        word.stressedVowel.relIdx(-3).stressed = true;
    word.forEach(segment => {
        if (word.vowels.atIdx(0).stressed && segment.idx < word.vowels.atIdx(0).idx)
            segment.stressed = true;
    });

    addRow("LL", "Vulgar Late Latin", "400", getSpellingFromArg_Lat(), word);
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
    word.replace("p/d/r", "s", "_s/sʲ");
    word.replace("p", "t", "_t/t͡sʲ");
    word.replace("b", "d", "_d/d͡zʲ");
    word.replace("b/d", "β", "_β/βʲ");
    if (variety != "french")
        word.replace("m", "n", "_n/ɲ");
    word.remove("s", "s_C");

    if (variety != "french") {
        word.forEach(segment => {
            if (segment.match("d͡zʲ", "C,d_") && !(variety == "spanish" && segment.ctxMatch("j/w,d_"))) {
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
    if (variety != "french" && word.partOfSpeech == "inf" && !word.vowels.atIdx(-2).stressed && word.endMatch("V,r,V")) {
        if (word.stressedVowel.value.endsWith("ː"))
            word.stressedVowel.value = word.stressedVowel.value[0];

        if (word.stressedVowel.match("ɛ"))
            word.stressedVowel.value = "e";
        else if (word.stressedVowel.match("ɔ"))
            word.stressedVowel.value = "o";

        word.forEach(segment => segment.stressed = false);
        word.vowels.atIdx(-2).stressed = true;

        if (word.stressedVowel.ctxMatch("C_") && !word.stressedVowel.ctxMatch("V,w_"))
            word.stressedVowel.relIdx(-1).stressed = true;
        if (word.stressedVowel.ctxMatch("p/t/k/b/d/g/f/β,l/r_") || word.stressedVowel.ctxMatch("C,w_") || word.stressedVowel.ctxMatch("C,s,p/t/k_"))
            word.stressedVowel.relIdx(-2).stressed = true;
        if (word.stressedVowel.ctxMatch("C,s,p/t/k,l/r_"))
            word.stressedVowel.relIdx(-3).stressed = true;
        word.forEach(segment => {
            if (word.vowels.atIdx(0).stressed && segment.idx < word.vowels.atIdx(0).idx)
                segment.stressed = true;
        });

        if (
            word.stressedVowel.value.length == 1
            && (word.stressedVowel.ctxMatch("_V/#") || word.stressedVowel.ctxMatch("_C,V") || word.stressedVowel.ctxMatch("_p/t/k/b/d/g/f/β/ð/ɣ,r/rʲ/w,V")
                || word.stressedVowel.ctxMatch("_p/k/b/g/f/ɣ,l,V"))
        )
            word.stressedVowel.value += "ː";
    }
    if (
        variety == "spanish" && word.partOfSpeech == "inf" && word.vowels.atIdx(-2).match("eː[stressed]")
        && (word.vowels.atIdx(-3).match("i/u") || word.vowels.atIdx(-2).ctxMatch("j_"))
    )
        word.vowels.atIdx(-2).value = "iː";

    //Metaphony
    word.forEach(segment => {
        if (segment.stressed && segment == word.vowels.atIdx(-2) && segment.nextVowel().match("i")) {
            if (segment.match("e/eː/ɪ/ɪː"))
                segment.value = "i" + segment.value.slice(1);

            if (segment.match("o/oː/ʊ/ʊː"))
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
    let approximants = "l/ɫ/ʎ/r/rʲ/j/w/x";
    let nasals = "m/mʲ/n/ɲ/ŋ";
    let sibilants = "s/sʲ/z/zʲ/t͡sʲ/d͡zʲ";
    let fricatives = "f/fʲ/β/βʲ/ð/ɣ";
    let stops = "p/pʲ/b/bʲ/t/d/c/ɟ/k/g";
    word.slice().reverse().forEach(segment => {
        if (segment.match("V[!=a][!stressed]", "C_C") && segment != word.vowels.atIdx(0) && segment != word.vowels.atIdx(-1)) {
            let newWord = word.duplicate();
            newWord.atIdx(segment.idx).remove();
            let surrounded = s => s.match("C", "C_C")
                && !((s.relIdx(-1).value.slice(0, -1) || s.relIdx(-1).value) == s.value[0] && s.relIdx(-2).match("V"))
                && !(s.relIdx(1).value[0] == (s.value.slice(0, -1) || s.value) && s.relIdx(2).match("V"));

            if (
                !newWord.some(s => s.match(`${approximants}/${fricatives}`) && surrounded(s) && !segment.match("w") && !s.ctxMatch(`${approximants}_${approximants}`))
                && !newWord.some(s => s.match(nasals) && surrounded(s) && !s.ctxMatch(`${approximants}/${nasals}_`) && !s.ctxMatch(`_${approximants}/${nasals}`))
                && !newWord.some(s => surrounded(s) && !s.ctxMatch(`${approximants}/${nasals}/${fricatives}/s/sʲ/z/zʲ_`)
                    && !s.ctxMatch(`_${approximants}/${nasals}/β/s/z`) && !s.match(stops, `${stops}_${stops}/t͡sʲ/d͡zʲ`))
                && !newWord.some(s => s.match(sibilants) && surrounded(s) && !s.ctxMatch(`${approximants}_`))
                && !newWord.some(s => surrounded(s) && s.ctxMatch(`${sibilants}_s/sʲ/z/zʲ`))
                && !newWord.some(s => s.match(sibilants) && surrounded(s) && !s.ctxMatch(`${stops}/${sibilants}_`))
                && !newWord.some(s => s.match("β/βʲ/ð/ɣ/c/ɟ") && surrounded(s))
                && !segment.ctxMatch("t/d/c/ɟ_l/ʎ")
                && !segment.ctxMatch(`${stops}/${nasals}/l/ɫ_ð/ɣ`)
                && !segment.ctxMatch(`${stops}/t͡sʲ/d͡zʲ_β/βʲ`)
                && !segment.ctxMatch(`C[!=${approximants}/${nasals}/f/fʲ/s/sʲ/z/zʲ]_f/fʲ/j`)
                && !segment.ctxMatch("f/fʲ_C[!=f/fʲ/l/ɫ/ʎ/r/rʲ]")
                && !segment.ctxMatch(`${stops}_t,t͡sʲ`)
                && !segment.ctxMatch(`k/g_t/d/${sibilants}`)
                && !segment.ctxMatch("_x/g,t/d/t͡sʲ/d͡zʲ")
                && !segment.ctxMatch(`C!=[${nasals}]_ɲ`)
                && !segment.ctxMatch(`C[!=${nasals}]_${nasals},ɲ`)
                && !segment.ctxMatch("C[!=l/ɫ/ʎ]_ʎ")
                && !segment.ctxMatch("_j,j")
                && !segment.ctxMatch("w_r")
                && !(variety != "french" && newWord.some(s => s.match(nasals) && surrounded(s) && !s.ctxMatch(`_${nasals}`)))
                && !(variety != "french" && newWord.some(s => s.match(stops, "_m") && surrounded(s)))
                && !(variety != "french" && segment.ctxMatch("ɫ/r,m_n"))
                && !(variety != "french" && segment == word.vowels.atIdx(-2) && segment.ctxMatch("C[!=m]_C[!=n/ɟ],e/i") && !segment.ctxMatch("[!=r],C_r"))
                && !(variety != "french" && segment.ctxMatch("j,j_"))
                && !(variety != "french" && segment.ctxMatch("c/ɟ_r"))
                && !(variety != "french" && segment.ctxMatch("n_m"))
                && variety != "portuguese"
            )
                segment.remove();

            if (
                variety == "portuguese" && segment.match("e/ɪ/i")
                && (segment.ctxMatch("m/l/r_") || segment.ctxMatch("ɟ_d") || segment.ctxMatch("d/ð_ɟ") || (segment.ctxMatch("n_") && segment.prevVowel().stressed))
                && !segment.ctxMatch("m_n") && !segment.ctxMatch("n_m") && !segment.ctxMatch("_ð")
                && !newWord.some(s => s.match(`${approximants}/${nasals}`) && surrounded(s))
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
        if (segment.ctxMatch("p/pʲ/t/c/k/t͡sʲ/f/fʲ/s/sʲ_")) {
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

        if (segment.ctxMatch("b/bʲ/d/ɟ/g/d͡zʲ/β/βʲ/z/zʲ_")) {
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
            segment.match("C", "C[!=j/w]_C[!=w]")
            && !segment.match(sibilants, `${approximants}/${nasals}_`) && !segment.match(`C[!=${approximants}/${nasals}]`, `_${approximants}`)
            && !(segment.match(`C[!=${approximants}/${nasals}]`, `${approximants}/${nasals}_`) && segment.value == segment.relIdx(1).value[0])
            && !segment.match("m", `C[!=${approximants}]_n`) && !segment.match(stops, `${nasals}_n`)
        ) {
            segment.remove();
            i--;
        }

        if (
            segment.match("C") && segment.value == segment.relIdx(1).value[0]
            && !(segment.ctxMatch(`V/${approximants}/${nasals}_`) && (segment.ctxMatch("_C,V/w") || segment.ctxMatch(`_${stops}/f/fʲ,${approximants}`)))
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
        if (segment.match("m/mʲ", "_l/r/rʲ"))
            word.insert("b", segment.idx + 1);

        if (segment.match("s/sʲ", "_r/rʲ"))
            word.insert("t", segment.idx + 1);

        if (segment.match("z/zʲ", "_r/rʲ"))
            word.insert("d", segment.idx + 1);
    });
    word.forEach(segment => {
        if (segment.match(`${stops}/${fricatives}`, `_{${approximants}}[stressed]`) && !segment.match("t/d/ð", "_l"))
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

    if (variety == "portuguese" && word.vowels.atIdx(-3).match("ɛ") && word.vowels.atIdx(-2).match("ɪ"))
        word.vowels.atIdx(-3).value = "e";

    if (word.stressedVowel.ctxMatch("ʎ/ɲ_"))
        word.stressedVowel.relIdx(-2).stressed = false;
    if (word.stressedVowel.ctxMatch(`s,${stops}_`))
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

    if (word.endMatch("C[!=j/w],C"))
        word.atIdx(-1).remove();
    word.replace("m", "n", "_#");
    word.replace("ɲ", "n", "_#");
    word.replace("ŋ", "n", "_#");

    word.forEach(segment => {
        if (segment.match("p/t/k", "_p/t/k/t͡sʲ"))
            segment.value = segment.relIdx(1).value[0];
    });

    word.replace("ɫ", "j", "ʊ_t/t͡sʲ/s̺");

    word.replace("ɪ", "e");
    word.replace("ʊ", "o");

    if ((word.partOfSpeech == "inf" || word.partOfSpeech == "conjVerb") && word.stressedVowel.ctxMatch("C[!=k/g],w_") && word.stressedVowel != word.vowels.atIdx(0))
        word.stressedVowel.relIdx(-1).remove();

    word.forEach(segment => {
        if (segment.match("a/ɔ/o") && segment.ctxMatch("_p/t/b/d/f/β/s̺/z̺,w")) {
            segment.relIdx(2).remove();
            word.insert("w", segment.idx + 1);
        }
    });
    word.replace("ɔ", "o", "_w");
    word.remove("w", "o_");

    word.forEach(segment => {
        if (segment.match("V[stressed]", "_e/i")) {
            segment.relIdx(1).value = "j";
            segment.relIdx(1).type = "consonant";
        }

        if (segment.match("V[!=i][stressed]", "_o/u")) {
            segment.relIdx(1).value = "w";
            segment.relIdx(1).type = "consonant";
        }
    });

    word.remove("j", "ɛ/e/i_j");
    word.remove("j", "V/w_V");

    word.replace("ɛ/e[stressed]", "i", "_a");
    word.replace("ɔ/o[stressed]", "u", "_a");

    word.forEach(segment => {
        if (segment.match("w", "k_") && !(segment.ctxMatch("_a") && segment.idx >= word.stressedVowel.idx - 1))
            segment.remove();

        if (segment.match("w", "g_V[!=a]"))
            segment.remove();
    });

    word.replace("o", "u", "_j,C[!=j]");

    word.forEach(segment => {
        if (segment.match("s̺ʲ/z̺ʲ/rʲ", "V_") || segment.match("s̺", "V_s̺ʲ")) {
            if (!segment.ctxMatch("i_"))
                word.insert("j", segment.idx);
            if (segment.match("s̺", "_s̺ʲ"))
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
        if (segment.match("ð", "V/j/w_V/l/r") && !segment.ctxMatch("a/ɔ/o/u_a/ɔ/o/u"))
            segment.remove();
    });

    word.forEach(segment => {
        if (segment.value.endsWith("ʲ") && !segment.match("t͡sʲ/d͡zʲ")) {
            if (segment.ctxMatch("_V"))
                word.insert("j", segment.idx + 1);
            segment.value = segment.value.slice(0, -1);
        }
    });

    word.forEach(segment => {
        if (segment.match("e/i", "_V") && segment.prevVowel().stressed) {
            segment.value = "j";
            segment.type = "consonant";
        }
    });

    word.forEach(segment => {
        if (segment.match("j", "C_") && segment.relIdx(1) == word.vowels.atIdx(0)) {
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
        if (segment.match("r") && !segment.ctxMatch("#/r/s̺/z̺/t͡sʲ/d͡zʲ_") && !segment.ctxMatch("_r"))
            segment.value = "ɾ";
    });
    word.forEach(segment => {
        if (segment.match("ɾ", "m_"))
            word.insert("b", segment.idx);

        if (segment.match("ɾ", "ɫ/n/ɲ_"))
            word.insert("d", segment.idx);

        if (segment.match("ɾ[stressed]", "b/d_"))
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
        if (segment.match("C") && segment.value == segment.relIdx(1).value[0] && !segment.ctxMatch("_m/n/ɲ/l/ʎ/r/t͡sʲ/d͡zʲ"))
            segment.remove();
    });

    word.replace("a", "e", "_j,C/#");
    word.replace("a", "o", "_w");

    if (word.stressedVowel.ctxMatch("C[!=w]_"))
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
        if (segment.match("j", "V,n_") && ((word.partOfSpeech == "inf" && segment.nextVowel().stressed) || (word.partOfSpeech == "conjVerb" && segment.prevVowel().stressed))) {
            segment.relIdx(-1).value = "ɲ";
            segment.remove();
        }
    });
    word.replace("j", "d͡z", "V,ɾ/n_");

    //Pre-yod raising
    word.vowels.forEach((segment, i) => {
        if (segment.ctxMatch("_j/ʎ/ɲ/w")) {
            switch (segment.value) {
                case "ɛ":
                    segment.value = "e";
                    break;
                case "ɔ":
                    segment.value = "o";
                    break;
            }
        } else if (segment.nextVowel().ctxMatch("j_") && !segment.ctxMatch("_w")) {
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

    word.replace("a[!stressed]", "e", "#,j_");

    word.remove("j", "#_{e/i}[!stressed]");

    word.vowels.forEach(segment => {
        if (segment.match("e") && segment.nextVowel().stressed && segment.nextVowel().ctxMatch("j/ɲ_") && segment.ctxMatch("_j"))
            segment.value = "i";

        if (segment.match("o") && segment.nextVowel().stressed && (segment.nextVowel().ctxMatch("j/ɲ_") || segment.ctxMatch("_j,V")))
            segment.value = "u";
    });
    word.remove("j", "i_C");
    word.remove("w", "u_");

    word.replace("ɫ", "w", "a_p/t/t͡sʲ");
    word.replace("a", "o", "_w");

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
    if (word.stressedVowel.ctxMatch("ŋ,g,w_"))
        word.stressedVowel.relIdx(-3).stressed = false;

    word.replace("a", "o", "_w");

    word.replaceSeq("l,l", "ʎ,ʎ");
    word.replaceSeq("n,n", "ɲ,ɲ");

    //Degemination
    word.forEach(segment => {
        if (segment.match("C") && (segment.value == segment.relIdx(1).value || segment.value == segment.relIdx(1).value[0]))
            segment.remove();
    });

    word.replace("j", "ʒ", "#_a[!stressed]/o/u/ue̯");

    if (word.vowels.atIdx(-1).match("i[!stressed]"))
        word.vowels.atIdx(-1).value = "e";
    if (word.vowels.atIdx(-1).match("u[!stressed]"))
        word.vowels.atIdx(-1).value = "o";

    //Loss of final /e/
    word.remove("e[!stressed]", "V/j/w,l/ɾ/n/s̺/z̺/t͡s/d͡z/d/ð/j/w/ʎ/ɲ_#");
    word.replace("ʎ", "l", "_#");
    word.replace("ɲ", "n", "_#");
    word.replace("z̺", "s̺", "_#");
    word.replace("d͡z", "t͡s", "_#");

    if (word.stressedVowel.match("i") && word.stressedVowel.prevVowel().match("i"))
        word.stressedVowel.prevVowel().value = "e";

    word.remove("j", "o/u_t͡s/d͡z/t͡ʃ/s̺/z̺/ʃ/ʒ");

    word.forEach(segment => {
        if (segment.match("o", "_j,C")) {
            if (segment.nextVowel().stressed) {
                segment.value = "u";
            } else {
                segment.value = "ue̯";
                segment.relIdx(1).remove();
            }
        }
    });

    word.forEach(segment => {
        if (segment.match("ie̯")) {
            word.insert("j", segment.idx);
            if (segment.stressed)
                segment.relIdx(-1).stressed = true;
            segment.value = "e";
        }

        if (segment.match("ue̯")) {
            word.insert("w", segment.idx);
            if (segment.stressed)
                segment.relIdx(-1).stressed = true;
            segment.value = "e";
        }

        if (segment.match("e") && segment.ctxMatch("_w")) {
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
        if (segment.match("u[!stressed]", "_j,C/#")) {
            segment.value = "w";
            segment.type = "consonant";
            segment.relIdx(1).value = "i";
            segment.relIdx(1).type = "vowel";
        }

        if (segment.match("i[!stressed]", "_w,C/#")) {
            segment.value = "j";
            segment.type = "consonant";
            segment.relIdx(1).value = "u";
            segment.relIdx(1).type = "vowel";
        }
    });

    word.forEach(segment => {
        if (segment.match("i[!stressed]") && !segment.ctxMatch("#/C_C/#")) {
            segment.value = "j";
            segment.type = "consonant";
        }

        if (segment.match("u[!stressed]") && !segment.ctxMatch("#/C_C/#")) {
            segment.value = "w";
            segment.type = "consonant";
        }

        if (segment.match("j/w", "_V[stressed]")) {
            segment.stressed = true;
            if (segment.ctxMatch("C_"))
                segment.relIdx(-1).stressed = true;
            if (segment.ctxMatch("p/t/k/b/d/g/β/ð/ɣ/ɸ,l/ɾ_"))
                segment.relIdx(-2).stressed = true;
        }
    });

    word.vowels.forEach(segment => {
        if (segment.nextVowel().stressed && segment.nextVowel().ctxMatch("j/ʎ/ɲ_")) {
            if (segment.match("e") && segment.nextVowel().value != "i")
                segment.value = "i";
            else if (segment.match("o"))
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
        if (segment.match("ɾ", "m_")) {
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

    if (word.endMatch("ð") && word.partOfSpeech == "conjVerb")
        word.atIdx(-1).remove();

    if (word.endMatch("V,e[!stressed]"))
        word.atIdx(-1).remove();
    word.replace("ʎ", "l", "_#");
    word.replace("ɲ", "n", "_#");
    word.replace("z̺", "s̺", "_#");
    word.replace("d͡z", "t͡s", "_#");

    if (word.stressedVowel.ctxMatch("C_"))
        word.stressedVowel.relIdx(-1).stressed = true;
    if (word.stressedVowel.ctxMatch("p/t/k/b/d/g/f/β,ɾ_"))
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
        if (segment.match("h")) {
            segment.relIdx(1).droppedCons = true;
            segment.remove();
        }
    });

    word.forEach(segment => {
        if (segment.match("i[!stressed]") && !segment.ctxMatch("#/C_C/#")) {
            segment.value = "j";
            segment.type = "consonant";
        }

        if (segment.match("u[!stressed]") && !segment.ctxMatch("#/C_C/#")) {
            segment.value = "w";
            segment.type = "consonant";
        }
    });

    if (word.partOfSpeech == "conjVerb" && word.endMatch("o[LLValue=oː]"))
        word.insert("j", word.length);

    word.forEach(segment => {
        if (segment.match("e", "j_ʎ")) {
            segment.value = "i";
            segment.relIdx(-1).remove();
            if (segment.stressed && segment.prevVowel().match("i"))
                segment.prevVowel().value = "e";
        }
    });

    word.remove("j", "ʃ_");

    word.replace("n", "m", "_β");
    word.replace("b", "β");
    word.replace("β", "b", "#/m_");

    word.replace("β", "w", "_C[!=j/w/l/ɾ]");
    word.forEach(segment => {
        if (segment.match("i") && segment.ctxMatch("_w,C/#") && !segment.stressed) {
            segment.value = "j";
            segment.type = "consonant";
            segment.relIdx(1).value = "u";
            segment.relIdx(1).type = "vowel";
        }
    });
    word.remove("w", "o/u_");

    word.forEach((segment => {
        if (segment.match("ɣ", "w_")) {
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
    let liquids = word.filter(segment => segment.match("l/ɾ") || segment.match("r", "#_"));
    if (word.stressedVowel.ctxMatch("_ɾ") && word.stressedVowel.relIdx(1) == liquids.at(-1))
        liquids.pop();
    if (word.partOfSpeech == "conjVerb" && word.stressedVowel.ctxMatch("ɾ_") && word.stressedVowel.relIdx(-1) == liquids.at(-1))
        liquids.pop();
    if (liquids.length >= 2) {
        let firstLiquid = liquids.at(-2);
        let secondLiquid = liquids.at(-1);
        if (firstLiquid.match("r")) {
            if (!secondLiquid.ctxMatch("t/d/ð_"))
                secondLiquid.value = "l";
        } else if (secondLiquid.ctxMatch("C[!=ɾ]_") && firstLiquid.ctxMatch("#/V_")) {
            firstLiquid.value = "l";
            secondLiquid.value = "ɾ";
        } else if (!secondLiquid.ctxMatch("t/d/ð_")) {
            firstLiquid.value = "ɾ";
            secondLiquid.value = "l";
        }
    }
    word.replace("ɾ", "r", "#_");
    word.forEach(segment => {
        if (segment.match("ɾ", "n/z_")) {
            word.insert("d", segment.idx);
            if (segment.stressed)
                segment.relIdx(-1).stressed = true;
        }
    });

    if (word.stressedVowel.ctxMatch("C_"))
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
        if (segment.ctxMatch("_j")) {
            switch (segment.value) {
                case "ɛ":
                    segment.value = "e";
                    break;
                case "ɔ":
                    segment.value = "o";
                    break;
            }
        } else if (segment.nextVowel().ctxMatch("j_") && !segment.ctxMatch("_w")) {
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

    if (word.vowels.atIdx(-3).match("ɛ") && word.vowels.atIdx(-2).match("i"))
        word.vowels.atIdx(-3).value = "i";

    if (word.stressedVowel.prevVowel().match("e") && word.stressedVowel.ctxMatch("w_"))
        word.stressedVowel.prevVowel().value = "i";

    word.replace("ɣ", "g");

    word.replaceSeq("p,ʎ", "t͡ʃ");
    word.replaceSeq("k,ʎ", "t͡ʃ");
    word.replaceSeq("f,ʎ", "t͡ʃ");

    word.remove("s̺", "_t͡ʃ");

    word.replace("b", "β", "ɫ/ɾ_");

    if (word.endMatch("n") && !word.vowels.atIdx(-1).stressed && word.partOfSpeech != "conjVerb")
        word.atIdx(-1).remove();

    word.replace("w", "β", "ð/ɫ_");
    word.replace("w", "n", "n_ɛ/e/i");
    word.replaceSeq("n,w", "ŋ,g,w");

    word.replace("ɫ", "w", "a_p/t/t͡sʲ");
    word.replace("a", "o", "_w");

    word.replace("b", "l", "V_l");

    word.remove("d", "_#");

    //Loss of final /e/ and /i/
    if (word.partOfSpeech == "conjVerb")
        word.remove("{e/i}[!stressed]", "V,ɾ/d͡zʲ_#");
    else
        word.remove("{e/i}[!stressed]", "V,l/ɾ/n/s̺/z̺/t͡sʲ/d͡zʲ/j/w_#");
    word.replace("z̺", "s̺", "_#");
    word.replace("d͡zʲ", "t͡sʲ", "_#");
    word.replace("l", "ɫ", "_#");

    word.replace("e", "i", "_ŋ");
    word.replace("o[stressed]", "u", "_ŋ");

    //Nasalization
    word.remove("j", "_m/n/ŋ,C/#");
    word.remove("w", "_m/n/ŋ,C/#");
    word.forEach(segment => {
        if (segment.match("V") && (segment.ctxMatch("_n") || segment.ctxMatch("_m/ŋ,C/#")) && !segment.ctxMatch("_C,m/n/j/w")) {
            if (segment.relIdx(2).match("i[stressed]", "_V"))
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
        if (segment.match("C") && (segment.value == segment.relIdx(1).value || segment.value == segment.relIdx(1).value[0]))
            segment.remove();
    });

    word.replace("l", "ɾ", "p/b/k/g_");

    word.remove("ʎ", "ɲ_");

    if (word.startMatch("e[!stressed],j")) {
        word.atIdx(0).value = "i";
        word.atIdx(1).remove();
    }

    if (!word.vowels.atIdx(-1).stressed) {
        if (word.vowels.atIdx(-1).match("i"))
            word.vowels.atIdx(-1).value = "e";

        if (word.vowels.atIdx(-1).match("u") && word.endMatch("C"))
            word.vowels.atIdx(-1).value = "o";
    }

    word.forEach(segment => {
        if (segment.match("{e/ẽ}[!stressed]") && (segment.ctxMatch("i/ĩ_") || segment.ctxMatch("_i/ĩ")) && !segment.ctxMatch("e/ẽ_") && !segment.ctxMatch("_e/ẽ"))
            segment.value = "i" + segment.value.slice(1);
    });

    word.remove("b", "_#");

    word.replaceSeq("s̺,t͡sʲ", "s̺ʲ");

    word.replace("t͡sʲ", "t͡s");
    word.replace("d͡zʲ", "d͡z");

    word.remove("t", "t͡s_");
    word.remove("d", "d͡z_");

    word.forEach(segment => {
        if (segment.match("C[!=w]", "_j") && !segment.value.endsWith("ʲ")) {
            segment.value += "ʲ";
            segment.relIdx(1).remove();
        }
    });

    word.forEach(segment => {
        if (segment.value.endsWith("ʲ")) {
            if (segment.ctxMatch("V_") && !segment.relIdx(-1).value.endsWith("\u0303"))
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

    if (word.stressedVowel.ctxMatch("C[!=w]_"))
        word.stressedVowel.relIdx(-1).stressed = true;

    addRow("OGP", "Old Galician-Portuguese", "1300", getSpelling_OGP(), word);
}

function OGP_to_ModPort() {
    word = outcomes.OGP.duplicate();

    word.forEach(segment => {
        if (segment.match("w", "V_V"))
            word.insert("β", segment.idx + 1);
    });

    word.replace("β", "v");

    word.replace("e", "ɛ", "_ɫ");

    word.replace("ɛ", "e", "_j/w");

    word.replace("õ", "ã", "_#");
    if (word.endMatch("ã"))
        word.insert("o", word.length);

    word.replace("a", "ã", "ã_");
    word.replace("e", "ẽ", "ẽ_");
    word.replace("i", "ĩ", "ĩ_");
    word.replace("o", "õ", "õ_");
    word.replace("u", "ũ", "ũ_");

    word.forEach(segment => {
        if (segment.match("j", "_t/d/t͡s/d͡z") && segment.relIdx(-1).value.endsWith("\u0303"))
            segment.remove();
    });

    //Elimination of hiatus
    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);

        if (segment.match("V[!stressed]", "_V")) {
            switch (segment.value) {
                case "a":
                case "ã":
                    if (segment.match("a", "_e[stressed]"))
                        segment.relIdx(1).value = "ɛ";
                    else if (segment.match("a", "_o[stressed]"))
                        segment.relIdx(1).value = "ɔ";
                    else if (segment.ctxMatch("_e"))
                        segment.relIdx(1).value = "i";
                    else if (segment.ctxMatch("_o"))
                        segment.relIdx(1).value = "u";
                    else if (segment.ctxMatch("_a") && segment.relIdx(1).idx < word.stressedVowel.idx)
                        segment.relIdx(1).value = "aː";

                    if (segment.ctxMatch("_a/ã/aː/ɛ/e/ẽ/ɔ/õ")) {
                        segment.remove();
                        i--;
                    }
                    break;
                case "e":
                case "ẽ":
                    if (segment.ctxMatch("_e/ẽ") && !segment.match("ẽ", "_ẽ,j")) {
                        if (segment.ctxMatch("_e,[!=j]") && segment.relIdx(1).idx < word.stressedVowel.idx)
                            segment.relIdx(1).value = "eː";
                        segment.remove();
                        i--;
                    } else if (segment.ctxMatch("_a") && segment.relIdx(1).nextVowel().stressed) {
                        segment.value = "ɛ";
                        segment.relIdx(1).remove();
                    } else if (!segment.relIdx(1).nextVowel().stressed) {
                        segment.value = "i";
                    }
                    break;
                case "i":
                case "ĩ":
                    if (segment.ctxMatch("_e[stressed]") && !(word.partOfSpeech == "inf" && segment.ctxMatch("_e,ɾ,#"))) {
                        segment.relIdx(1).value = "ɛ";
                    } else if (segment.ctxMatch("_i/ĩ") || (segment.ctxMatch("_e/ẽ") && segment.relIdx(1).nextVowel().stressed)) {
                        if (segment.match("ĩ"))
                            segment.relIdx(1).value = "ĩ";
                        else
                            segment.relIdx(1).value = "i";
                        segment.remove();
                        i--;
                    }
                    break;
                case "o":
                case "õ":
                    if (segment.ctxMatch("_o/õ/u/ũ")) {
                        if (segment.match("õ", "_u,C/V"))
                            segment.relIdx(1).value = "ũ";
                        else if (segment.ctxMatch("_o,[!=w]") && segment.relIdx(1).idx < word.stressedVowel.idx)
                            segment.relIdx(1).value = "oː";
                        segment.remove();
                        i--;
                    } else if (segment.ctxMatch("_a") && segment.relIdx(1).nextVowel().stressed) {
                        segment.value = "ɔ";
                        segment.relIdx(1).remove();
                    } else if (!segment.relIdx(1).nextVowel().stressed) {
                        segment.value = "u";
                    }
                    break;
                case "u":
                case "ũ":
                    if (segment.ctxMatch("_o[stressed]")) {
                        segment.relIdx(1).value = "ɔ";
                    } else if (segment.ctxMatch("_u/ũ")) {
                        segment.remove();
                        i--;
                    }
                    break;
            }
        }

        if (segment.match("V", "V_") && (segment.relIdx(-1).stressed || segment.nextVowel().stressed)) {
            switch (segment.value) {
                case "a":
                    if (segment.ctxMatch("o_") || (segment.ctxMatch("õ_") && segment == word.vowels.atIdx(-2)))
                        segment.relIdx(-1).value = "ɔ";

                    if (segment.ctxMatch("a/ã/ɛ/ɔ_"))
                        segment.remove();
                    break;
                case "e":
                case "i":
                    if (segment.ctxMatch("e/ẽ/i/ĩ/u/ũ_"))
                        segment.remove();
                    else
                        segment.value = "i";
                    break;
                case "o":
                case "u":
                    if (segment.ctxMatch("ɔ/o/õ/u/ũ_"))
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
    word.remove("j", "i_");
    word.remove("w", "u_");
    word.remove("j", "_j/w");
    word.remove("w", "_j/w");

    word.forEach(segment => {
        if (segment.match("ĩ", "_a/o") && (segment.stressed || segment.relIdx(1).stressed)) {
            word.insert("ɲ", segment.idx + 1);
            segment.value = "i";
        }
    });

    //Syllabification
    if (word.stressedVowel.ctxMatch("C[!=j/w]_"))
        word.stressedVowel.relIdx(-1).stressed = true;
    if (word.stressedVowel.ctxMatch("p/t/k/b/d/g/f/β,ɾ_"))
        word.stressedVowel.relIdx(-2).stressed = true;
    word.forEach(segment => {
        if (word.vowels.atIdx(0).stressed && segment.idx < word.vowels.atIdx(0).idx)
            segment.stressed = true;
    });

    if (word.endMatch("ɾ") && word.vowels.atIdx(-2).stressed)
        word.insert("e", word.length);

    //Final raising
    word.replace("e[!stressed]", "i", "_#");
    word.replace("o[!stressed]", "u", "_#");
    word.replace("a[!stressed]", "ɐ");

    word.forEach(segment => {
        if (segment.match("i[!stressed]", "V_")) {
            segment.value = "j";
            segment.type = "consonant";
        }

        if (segment.match("u[!stressed]", "V[!=i/ĩ]_") && !segment.ctxMatch("e/ẽ[stressed]_")) {
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
        if (segment.match("e[stressed]", "_V[!=ẽ]"))
            word.insert("j", segment.idx + 1);
    });

    if (word.vowels.atIdx(-1).match("ẽ"))
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
        if (segment.match("V", "V,j/w_")) {
            word.insert(segment.relIdx(-1).value, segment.idx);
            segment.relIdx(-1).stressed = segment.stressed;
        }
    });

    word.replace("j", "ɪ̯", "V/ɪ̯_");
    word.replace("w", "ʊ̯", "V/ʊ̯_");

    //Nasalize semivowels after nasal vowels
    word.forEach(segment => {
        if (segment.value.endsWith("\u0303") && segment.ctxMatch("_ɪ̯/ʊ̯"))
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
        if (segment.ctxMatch("V/C_") && !segment.relIdx(-1).value.endsWith("\u0303")) {
            switch (segment.value) {
                case "b":
                    segment.value = "β";
                    break;
                case "d":
                    if (!segment.ctxMatch("ɫ_"))
                        segment.value = "ð";
                    break;
                case "g":
                    segment.value = "ɣ";
                    break;
            }
        }
    });

    word.forEach(segment => {
        if (segment.match("i[!stressed]", "[!=ɾ]_V")) {
            segment.value = "j";
            segment.type = "consonant";
            if (segment.relIdx(1).stressed) {
                segment.stressed = true;
                if (segment.ctxMatch("C_"))
                    segment.relIdx(-1).stressed = true;
            }
        }

        if (segment.match("u[!stressed]", "[!=ɾ/j]_V")) {
            segment.value = "w";
            segment.type = "consonant";
            if (segment.relIdx(1).stressed) {
                segment.stressed = true;
                if (segment.ctxMatch("C_"))
                    segment.relIdx(-1).stressed = true;
            }
        }
    });

    word.forEach(segment => {
        if (segment.match("s") && !segment.ctxMatch("_V/j/w"))
            segment.value = "ʃ";
    });

    word.replace("e[!stressed]", "ɘ", "_C[!=ɪ̯/ʊ̯]");
    word.replace("i[!stressed]", "ɘ", "_#");
    word.forEach(segment => {
        if (
            segment.match("i[!stressed]", "_C[!=ʊ̯]")
            && (segment.ctxMatch("ʎ/ɲ/ʃ/ʒ_") || segment.ctxMatch("_ʎ/ɲ/ʃ/ʒ") || segment.prevVowel().match("i/ĩ") || segment.nextVowel().match("i/ĩ"))
        )
            segment.value = "ɘ";
    });

    word.replace("o[!stressed]", "u", "_[!=ɪ̯/ʊ̯/ɫ]");

    word.replace("ɘ", "i", "#_");

    word.replace("l", "ɫ");

    word.remove("ʊ̯", "o_");

    word.replace("e", "ɜ", "_ɪ̯/ʎ/ɲ/ʒ");
    word.replace("ẽ", "ɜ̃", "_ɪ̯̃");

    addRow("Port", "Modern Portuguese (Portugal)", "", getSpelling_ModPort(word.EModPortWord), word);
}

function ModPort_to_Br() {
    word = outcomes.ModPort.duplicate();

    if (word.stressedVowel.ctxMatch("_m/n/ɲ"))
        word.stressedVowel.value += "\u0303";
    word.replace("ɛ̃", "ẽ");
    word.replace("ɔ̃", "õ");

    word.replace("ɜ[!stressed]", "a", "_C/V");
    word.replace("ɛ[!stressed]", "e");
    word.replace("ɔ[!stressed]", "o");

    word.replace("ẽ[!stressed]", "ĩ", "#_");

    word.replace("ɲ", "j̃");

    word.remove("ʊ̯", "o_");
    word.remove("ɪ̯", "e_");

    word.replace("ɫ", "ʊ̯");

    word.replace("t", "t͡ʃ", "_i");
    word.replace("d", "d͡ʒ", "_i");

    word.replace("ɾ", "ʁ", "_C/#");
    word.replace("ʁ", "h");
    word.replace("h", "ɦ", "_m/n/j̃/b/d/g/v/z/ʒ/l");
    if (word.partOfSpeech == "inf")
        word.remove("h", "_#");

    if (word.endMatch("{a/ɛ/e/ɔ/o/u}[stressed],s"))
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

    word.replace("ʎ", "l", "C[!=ʎ/j/w]_");

    addRow("GR", "Gallo-Romance", "600", "", word, true);


    word.replace("ɛː", "ie̯");
    word.replace("ɔː", "uo̯");

    word.replace("ɛ", "ie̯", "_j/ʎ");
    word.replace("ɔ", "uo̯", "_j/ʎ");

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
        if (segment.match("V[stressed]", "_e/i")) {
            segment.relIdx(1).value = "j";
            segment.relIdx(1).type = "consonant";
        }

        if (segment.match("V[stressed]", "_o/u")) {
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
        if (segment.ctxMatch("p/pʲ/t/c/k/t͡sʲ/f/fʲ/s̺/s̺ʲ_")) {
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

        if (segment.ctxMatch("b/bʲ/d/ɟ/g/d͡zʲ/β/βʲ/z̺/z̺ʲ_")) {
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
    let approximants = "l/ɫ/ʎ/r/rʲ/j/w";
    let nasals = "m/mʲ/n/ɲ/ŋ";
    let sibilants = "s̺/s̺ʲ/z̺/z̺ʲ/t͡sʲ/d͡zʲ";
    let fricatives = "f/fʲ/β/βʲ/ð/ɣ";
    let stops = "p/pʲ/b/bʲ/t/d/c/ɟ/k/g";
    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);
        if (
            segment.match("C", "C[!=j/w/β/ɣ]_C[!=w]")
            && !segment.match("s̺/s̺ʲ/z̺/z̺ʲ", `${approximants}/${nasals}_`) && !segment.match(`C[!=${approximants}/${nasals}]`, `_${approximants}`)
            && !(segment.match(`C[!=${approximants}/${nasals}]`, `${approximants}/${nasals}_`) && segment.value == segment.relIdx(1).value[0])
            && !segment.match("m", `C[!=${approximants}]_n`) && !segment.match(stops, `${nasals}_n`)
        ) {
            segment.remove();
            i--;
        }

        if (
            segment.match("C") && segment.value == segment.relIdx(1).value[0]
            && !(segment.ctxMatch(`V/${approximants}/${nasals}_`) && (segment.ctxMatch("_C,V/w") || segment.ctxMatch(`_${stops}/f/fʲ,${approximants}`)))
        ) {
            segment.remove();
            i--;
        }
    }
    word.remove("w", "C_C");
    word.forEach(segment => {
        if (segment.value == segment.relIdx(1).value[0] + "ʲ") {
            segment.value = segment.value[0];
            segment.relIdx(1).value += "ʲ";
        }
    });
    word.forEach(segment => {
        if (segment.match("m", "_l/r/rʲ"))
            word.insert("b", segment.idx + 1);

        if (segment.match("s̺", "_r/rʲ"))
            word.insert("t", segment.idx + 1);

        if (segment.match("z̺", "_r/rʲ"))
            word.insert("d", segment.idx + 1);
    });
    word.forEach(segment => {
        if (segment.match(`${stops}/${fricatives}`, `_{${approximants}}[stressed]`) && !segment.match("t/d/ð", "_l"))
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

    word.replace("ɟ", "j", "_C[!=ɟ]");

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
        if (segment.match("w") && segment.relIdx(1) == word.vowels.atIdx(0) && !segment.ctxMatch("k/g_")) {
            segment.value = "o";
            segment.type = "vowel";
            segment.stressed = false;
            segment.relIdx(-1).stressed = false;
        }
    });

    word.replace("w", "β", "n_");
    word.forEach(segment => {
        if (segment.match("n", "_β"))
            segment.stressed = false;
    });

    word.replaceSeq("ɫ,w", "l,l");
    word.replace("w", "r", "r_");
    word.replace("w", "m", "m_");
    word.replace("w", "s̺", "s̺_");
    word.replace("w", "z̺", "z̺_");
    word.replace("C[!=ɣ]", "w", "V_w");

    word.forEach(segment => {
        if (segment.match("β", "_C") && !segment.ctxMatch("_β/βʲ/r/rʲ,V")) {
            if (segment.ctxMatch("ɔ/uo̯/o/oː/u/uː/w_"))
                segment.remove();
            else
                segment.value = "w";
        }
    });
    word.remove("β", "C_C");

    word.forEach(segment => {
        if (segment.match("V") && segment.value.endsWith("ː"))
            segment.value = segment.value[0];

        if (
            segment.match("V[!=ɛ/ɔ][stressed]") && segment.value.length == 1
            && (segment.ctxMatch("_V/#") || segment.ctxMatch("_C,V") || segment.ctxMatch("_p/t/k/b/d/g/f/β/ð/ɣ,r/rʲ/w,V") || segment.ctxMatch("_p/k/b/g/f/ɣ,l,V"))
        )
            segment.value += "ː";
    });
    word.replace("aː", "a", "_b,l");

    if (word.endMatch("j,j,V[!stressed],r")) {
        word.atIdx(-3).remove();
        word.atIdx(-1).remove();
        word.insert("r", -1);
    }

    //Explains the difference between, e.g., faire, pire (with final -e) and noir (without)
    word.replace("j", "J", "_r");

    word.replace("eː", "ei̯");
    word.replace("oː", "ou̯", "_[!=m/n]");

    if (variety != "norman") {
        word.replace("k", "t͡ʃ", "_a/aː");
        word.replace("g", "d͡ʒ", "_a/aː");
        word.replace("k", "t", "_t͡ʃ");
        word.replace("g", "d", "_d͡ʒ");
    }

    word.forEach(segment => {
        if (segment.match("ɣ", "[!=ɔ/uo̯/o/ou̯/u/uː/w]_[!=ɔ/uo̯/o/ou̯/u/uː/w]") && !segment.ctxMatch("e_r"))
            segment.value = "j";

        if (segment.match("ɣ", "[!=ɔ/uo̯/o/ou̯/u/uː/w][stressed]_w") && variety != "norman")
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
        if (segment.match("n", "_d͡ʒ"))
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
        if (segment.match("V[!=u/uː]", "_w")) {
            if (!segment.match("ie̯/uo̯"))
                segment.value = segment.value[0];
            segment.value += "u̯";
            segment.relIdx(1).remove();
        }
    });

    word.forEach(segment => {
        if (segment.match("V[!=i]", "_C[!=j]") && (segment.ctxMatch("_d͡zʲ/s̺ʲ/z̺ʲ/rʲ") || segment.nextVowel().ctxMatch("s̺ʲ/rʲ_")))
            word.insert("j", segment.idx + 1);
    });
    word.replace("ɛ", "ie̯", "_j");
    word.replace("ɔ", "uo̯", "_j");

    word.forEach(segment => {
        if (segment.match("n/t/d/r") && segment.prevVowel().ctxMatch("_j/ɲ"))
            segment.value += "ʲ";
    });

    word.forEach(segment => {
        if (segment.match("V", "_j")) {
            if (!segment.match("i/iː")) {
                if (!segment.match("ie̯/uo̯/au̯"))
                    segment.value = segment.value[0];
                segment.value += "i̯";
            }
            if (!segment.ctxMatch("_j,V[stressed]"))
                segment.relIdx(1).remove();
        }
    });
    word.forEach(segment => {
        if (segment.match("ɣ", "V[!=ei̯/iː][stressed]_o/u") && !segment.relIdx(-1).value.endsWith("i̯"))
            segment.value = "w";
    });

    word.replace("aː", "au̯", "_w");

    word.forEach(segment => {
        if ((segment.relIdx(-1).value.endsWith("ʲ") || segment.ctxMatch("j/ɲ/ʎ/t͡ʃ/d͡ʒ_"))) {
            if (segment.match("aː"))
                segment.value = "ie̯";
            else if (segment.match("ai̯/ei̯"))
                segment.value = "ie̯i̯";
        }
    });

    word.forEach(segment => {
        if (segment.value.endsWith("ʲ"))
            segment.value = segment.value.slice(0, -1);
    });

    //Unstressed final vowel loss
    let finalVowel = word.vowels.atIdx(-1);
    if (!finalVowel.stressed) {
        if (
            finalVowel.match("a")
            || finalVowel.ctxMatch("t͡ʃ/d͡ʒ_") || finalVowel.ctxMatch("_C,C") || finalVowel.ctxMatch("d,d͡z_") || finalVowel.ctxMatch("ð,β_")
            || (finalVowel.ctxMatch("C,m/n/ɲ/l/ʎ/r/j_") && !finalVowel.ctxMatch("r,m/n_#") && finalVowel.relIdx(-2).value != finalVowel.relIdx(-1).value)
        )
            finalVowel.value = "ə";
        else
            finalVowel.remove();
    }
    word.remove("p/t/k/b/d/g", "_ð/p/k,#");
    word.replace("ð", "d", "C_");
    word.remove("ð", "_d");
    word.replace("d", "t", "p/t/k_");
    word.remove("n", "m_#");
    if (word.atIdx(-2).value == word.atIdx(-1).value[0] && word.endMatch("C"))
        word.atIdx(-2).remove();
    if (word.endMatch("C,m/n/ɲ/l/ɫ/ʎ/r/j") && !word.endMatch("r,m/n"))
        word.insert("ə", word.length);
    if (word.endMatch("C,m/n/ɲ/l/ɫ/ʎ/r/j,C[!=w]") && !word.endMatch("r,m/n,C") && word.atIdx(-3).value != word.atIdx(-2).value)
        word.insert("ə", -1);
    if (word.endMatch("p/t/k/b/d/g/f,p/k/b/d/g/f,C[!=w]") && word.atIdx(-2).value[0] != word.atIdx(-3).value)
        word.insert("ə", -1);
    if (word.endMatch("s̺/z̺/t͡s/d͡z,s̺"))
        word.atIdx(-1).remove();
    word.replace("l", "ɫ", "_C/#");
    word.replace("ɫ", "l", "_l/V");
    word.forEach(segment => {
        if (segment.match("m", "_l/r"))
            word.insert("b", segment.idx + 1);

        if (segment.match("s̺/t͡s", "_r"))
            word.insert("t", segment.idx + 1);

        if (segment.match("z̺", "_r"))
            word.insert("d", segment.idx + 1);
    });
    word.replace("d", "ð", "ə_#");
    word.remove("w", "C/ai̯_C/#");

    word.replace("J", "j");
    word.forEach(segment => {
        if (segment.match("V", "_j")) {
            if (!segment.match("i/iː")) {
                if (!segment.match("ie̯/uo̯/au̯"))
                    segment.value = segment.value[0];
                segment.value += "i̯";
            }
            if (!segment.ctxMatch("_j,V[stressed]"))
                segment.relIdx(1).remove();
        }
    });

    word.forEach(segment => {
        if (segment.match("r", "ɫ/ʎ/n/ɲ_"))
            word.insert("d", segment.idx);
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
        if (segment.match("C[!=r]", "_C") && (segment.value == segment.relIdx(1).value[0] || segment.value == segment.relIdx(1).value))
            segment.remove();
    });

    word.remove("β", "V_ɔ/o/u/uo̯/ou̯");
    word.remove("β", "u[stressed]_");

    word.remove("ɣ");
    word.replace("ŋ", "n", "_#");
    word.replace("ɫ", "l", "_V");
    if (word.stressedVowel.ctxMatch("C_"))
        word.stressedVowel.relIdx(-1).stressed = true;

    word.forEach(segment => {
        if ((segment.match("e") || (segment.match("a") && segment != word.vowels.atIdx(0))) && !segment.stressed && !segment.ctxMatch("#_")
            && (segment.ctxMatch("_V") || segment.ctxMatch("_C,V/j/w") || segment.ctxMatch("_p/t/k/b/d/g/f/β/ð,l/ɾ,V/j/w"))
            && !segment.ctxMatch("_ʎ/ɲ") && !segment.ctxMatch("_t/d,l")
        )
            segment.value = "ə";
    });

    //Final devoicing
    word.slice().reverse().forEach(segment => {
        if (segment.ctxMatch("_p/t/k/t͡s/t͡ʃ/f/θ/s̺/#")) {
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
        if (segment.match("C") && segment.value == segment.relIdx(1).value[0])
            segment.remove();
    });
    word.replace("t͡s", "s̺", "_C");

    word.replaceSeq("t,s̺", "t͡s");
    word.replaceSeq("θ,s̺", "t͡s");

    word.replace("s̺", "t͡s", "ɲ/ʎ_");

    word.forEach(segment => {
        if (segment.match("ɲ", "V[!=i]_C/#")) {
            word.insert("j", segment.idx);
        }
    });

    word.forEach(segment => {
        if (segment.match("V", "_j")) {
            if (segment.value != "i" && !segment.value.endsWith("i̯"))
                segment.value += "i̯";
            segment.relIdx(1).remove();
        }

        if (segment.match("V", "_w,C[!=ɾ]/#")) {
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
        if (segment.match("V", "_m/n/ɲ/ŋ"))
            segment.nasalized = true;
    });

    word.replaceSeq("ie̯u̯", "ie̯,w");
    word.replaceSeq("uo̯u̯", "uo̯,w");

    if (variety != "norman")
        word.replace("ei̯[!nasalized]", "oi̯");
    word.replace("ou̯", "eu̯", "_[!=m/p/b/f/v]");
    word.replace("uo̯", "ue̯");

    word.forEach(segment => {
        if (segment.match("ɫ", "_C")) {
            segment.relIdx(-1).droppedL = true;
            if (segment.ctxMatch("i/u/oi̯/ui̯/ə/w_") || segment.relIdx(-1).value.endsWith("u̯"))
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
        if (segment.match("V", "_m/n/ɲ/ŋ"))
            segment.nasalized = true;
    });

    word.replace("e", "ə", "_V");

    word.replace("ɔ/ue̯[nasalized]", "o");

    word.replace("u", "y");
    word.replace("ui̯", "yi̯");

    word.remove("m", "ɾ_C/#");
    word.remove("n", "ɾ_C/#");

    if (!word.vowels.atIdx(-1).stressed) {
        word.vowels.atIdx(-1).value = "ə";
        if (word.vowels.atIdx(-1).ctxMatch("_w"))
            word.vowels.atIdx(-1).relIdx(1).remove();
    }

    if (variety == "norman")
        word.remove("g", "#_w");
    else
        word.remove("w", "k/g_");

    word.replace("iu̯", "yi̯");

    word.replace("w[stressed]", "v", "V_");
    word.replace("w", "v", "i/oi̯/ə/e/eː_V/ɾ");

    if (variety != "norman")
        word.replace("ɛ/e", "æ", "_m/n/ŋ");

    word.replace("e", "ɛ", "_l/ɾ/r");

    word.forEach(segment => {
        if (segment.match("ie̯")) {
            if (!segment.ctxMatch("w_"))
                word.insert("j", segment.idx);
            if (segment.stressed)
                segment.relIdx(-1).stressed = true;
            segment.value = "e";
        }

        if (segment.match("ue̯")) {
            if (!segment.ctxMatch("w_"))
                word.insert("w", segment.idx);
            if (segment.stressed)
                segment.relIdx(-1).stressed = true;
            segment.value = "e";
        }

        if (segment.match("yi̯")) {
            if (!segment.ctxMatch("w_"))
                word.insert("ɥ", segment.idx);
            if (segment.stressed)
                segment.relIdx(-1).stressed = true;
            segment.value = "i";
        }
    });

    word.forEach(segment => {
        if (segment.match("V[!=ə]", "_j") && !segment.value.endsWith("i̯") && !segment.value.endsWith("u̯")) {
            if (!segment.match("i/y"))
                segment.value += "i̯";
            segment.relIdx(1).remove();
        }

        if (segment.match("V[!=ə]", "_e̯au̯") && !segment.value.endsWith("i̯") && !segment.value.endsWith("u̯")) {
            if (!segment.match("i/y"))
                segment.value += "i̯";
            segment.relIdx(1).value = "au̯";
        }

        if (segment.match("V[!=ə/i/y]", "_w") && !segment.value.endsWith("i̯")) {
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
        if (segment.match("z̺", "V_C[!=j/w/ɥ]")) {
            if (segment.relIdx(-1).value.length == 1 && !segment.ctxMatch("ə_"))
                segment.relIdx(-1).value += "ː";
            segment.relIdx(-1).droppedS = true;
            segment.remove();
        }
    });

    word.replace("a", "ə", "_y");

    word.forEach(segment => {
        if (segment.match("ə", "V_") && segment.nextVowel().stressed)
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
        if (segment.match("s̺", "V_C[!=j/w/ɥ]")) {
            if (segment.relIdx(-1).value.length == 1 && !segment.ctxMatch("ə_"))
                segment.relIdx(-1).value += "ː";
            segment.relIdx(-1).droppedS = true;
            segment.remove();
        }

        if (segment.match("V[!=ə]", "_z̺/r") && segment.value.length == 1)
            segment.value += "ː";
    });
    word.replace("ɔ", "ɔː", "_v");

    word.forEach(segment => {
        if (segment.match("e", "_C") && !segment.ctxMatch("_ɾ,ə"))
            segment.value = "ɛ";
    });
    word.replace("ø", "œ");
    word.replace("øː", "œː");

    if (word.partOfSpeech == "inf" && word.endMatch("C,j,ɛ,ɾ"))
        word.atIdx(-3).remove();

    word.replace("w", "j", "[!=p/b/f/v/k/g]_øu̯");

    word.replace("øu̯", "œ");
    word.remove("w", "_œ/œː/øː");

    word.replace("ɔ", "u", "_V/#");

    //Loss of vowels in hiatus
    word.forEach(segment => {
        if (
            segment.match("V")
            && (
                segment.ctxMatch("ə/a_")
                || segment.relIdx(-1).value == segment.value[0]
                || (segment.ctxMatch("ɛ_") && segment.value.startsWith("e"))
                || (segment.ctxMatch("ɔ_") && (segment.value.startsWith("o") || segment.value.startsWith("u")))
            )
        ) {
            if (segment.stressed && segment.value.length == 1)
                segment.value += "ː";
            if (segment.match("eː/ei̯"))
                segment.value = "ɛː";
            if (segment.match("ɛː/iː", "a/ɛ_")) {
                segment.value = "ɛː";
                segment.droppedA = true;
            }
            if (segment.match("uː", "ɔ_"))
                segment.value = "oː";
            else if (segment.match("uː[nasalized]", "ə/a_"))
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
        if (segment.match("V[stressed]", "oi̯_")) {
            word.insert("j", segment.idx);
            segment.relIdx(-1).stressed = true;
        }
    });

    word.replace("ɛː[!stressed][EOFValue!=ai̯]", "e");

    word.replace("ɾ", "r");

    word.replace("ai̯", "ɛ");

    //Syllabification
    if (word.stressedVowel.ctxMatch("C_"))
        word.stressedVowel.relIdx(-1).stressed = true;
    if (word.stressedVowel.ctxMatch("C[!=j/w/ɥ],j/w/ɥ_") || word.stressedVowel.ctxMatch("p/t/k/b/d/g/f/v,l/r_"))
        word.stressedVowel.relIdx(-2).stressed = true;
    if (word.stressedVowel.ctxMatch("p/t/k/b/d/g/f/v,l/r,j/w/ɥ_"))
        word.stressedVowel.relIdx(-3).stressed = true;
    word.forEach(segment => {
        if (word.vowels.atIdx(0).stressed && segment.idx < word.vowels.atIdx(0).idx)
            segment.stressed = true;
    });

    word.lateOFWord = word.duplicate();

    word.replace("æ", "a");

    word.forEach(segment => {
        if (segment.match("oi̯")) {
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
        if (segment.match("V", "_m/n/ɲ/ŋ,C[!=j/w]/#")) {
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
        if (segment.match("j", "ʃ/ʒ/ʎ/ɲ_") && !segment.relIdx(1).value.includes("\u0303")) {
            word.lateOFWord.vowels[word.vowels.indexOf(segment.nextVowel())].relIdx(-1).remove();
            segment.remove();
        }
    });

    //Loss of internal schwa
    word.forEach(segment => {
        if (
            segment.match("ə") && segment.idx < word.stressedVowel.idx && !segment.ctxMatch("#,C_")
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
    word.remove("C[!=t/k/l/ʎ/r/f]", "_#");

    word.replace("ɛ", "a", "w_");

    word.replace("e", "ɛ", "_r");

    if (word.endMatch("ɛ[EOFValue!=ai̯],r") && word.vowels.length > 1)
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
    if (word.vowels.atIdx(-1).match("ə"))
        word.vowels.atIdx(-1).remove();

    word.replace("e̯o", "o");

    word.forEach(segment => {
        if (segment.match("i/u/y", "_V") && !segment.ctxMatch("p/t/k/b/d/g/f/v,l/ʁ_") && !segment.ctxMatch("C,j/w/ɥ_")) {
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
        if (segment.match("i", "_V"))
            word.insert("j", segment.idx + 1);

        if (segment.match("j", "p/t/k/b/d/g/f/v,l/ʁ_"))
            word.insert("i", segment.idx);
    });

    //Syllabification
    if (word.stressedVowel.ctxMatch("C_"))
        word.stressedVowel.relIdx(-1).stressed = true;
    if (word.stressedVowel.ctxMatch("C[!=j/w/ɥ],j/w/ɥ_") || word.stressedVowel.ctxMatch("p/t/k/b/d/g/f,l/ʁ_") || word.stressedVowel.ctxMatch("v,ʁ_"))
        word.stressedVowel.relIdx(-2).stressed = true;
    if (word.stressedVowel.ctxMatch("p/t/k/b/d/g/f,l/ʁ,j/w/ɥ_") || word.stressedVowel.ctxMatch("v,ʁ,j/w/ɥ_"))
        word.stressedVowel.relIdx(-3).stressed = true;
    word.forEach(segment => {
        if (!segment.nextVowel().stressed)
            segment.stressed = false;

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
        if (segment.match("V[stressed]", "_v/z/ʒ/ʁ,#/ʁ") || segment.match("{o/ø/ɒ̃/æ̃/õ}[stressed]", "_C"))
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
        if (segment.match("j", "V_V") && segment.relIdx(-1).idx > word.stressedVowel.idx) {
            if (segment.ctxMatch("ɪ/e_"))
                segment.relIdx(-1).value = "j";
            segment.remove();
        }
    });
    word.replaceSeq("l,j", "ʎ,ʎ");
    word.remove("l", "_ʎ");

    word.forEach(segment => {
        if (segment.match("j", "V/w_V"))
            word.insert("j", segment.idx);
    });

    word.replace("ɪ", "i", "_ŋ,t/t͡sʲ");
    word.replace("ʊ", "u", "_ŋ,t/t͡sʲ");

    word.remove("s", "{ɪ/ʊ}[!stressed]_#");

    word.replace("ɪ", "e");
    word.replace("ɪː", "eː");
    word.replace("ʊ", "o");
    word.replace("ʊː", "oː");

    word.replace("e", "i", "_ɲ/ʎ");

    word.replace("ŋ", "ɲ", "_n/ɲ");
    word.replace("n", "ɲ", "ɲ_");

    word.forEach(segment => {
        if (segment.match("t͡sʲ", "V_"))
            word.insert("t", segment.idx);
    });

    word.remove("k/p", "_s,#");

    word.remove("C", "C[!=j/w]_#");
    word.replace("m/ɲ/ŋ", "n", "_#");

    if (word.endMatch("n") && !word.vowels.atIdx(-1).stressed && !word.vowels.atIdx(-2).stressed)
        word.atIdx(-1).remove();

    //Consonant assimilation
    word.forEach(segment => {
        if (segment.match("C[!=m/n/ɲ/ŋ/ɫ/r/j/w/s/z]", "_C[!=l/ʎ/r/rʲ/j/w]"))
            segment.value = segment.relIdx(1).value[0];
    });
    word.remove("s", "s_C");
    word.replace("m", "n", "_n");
    word.replace("m", "ɲ", "_ɲ");
    word.replace("n", "m", "_m");

    word.forEach(segment => {
        if (segment.match("C", "#/C[!=j/w]_") && segment.relIdx(1).value[0] == segment.value)
            segment.remove();
    });

    word.replace("m", "n", "_s/sʲ/t/t͡sʲ");
    word.replace("ŋ", "n", "_s/sʲ/t/t͡sʲ");

    word.forEach(segment => {
        if (segment.match("r", "z_")) {
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
        if (segment.match("w", "C[!=k/g]_") && segment.relIdx(1) == word.vowels.atIdx(0)) {
            segment.value = "o";
            segment.type = "vowel";
            segment.stressed = false;
            segment.relIdx(-1).stressed = false;
        }
    });

    word.replace("w", "β", "l/r_");

    word.forEach(segment => {
        if (segment.match("C[!=k/g]", "_w")) {
            if (segment.ctxMatch("V_"))
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

    word.remove("e[!stressed]", "#_s/z/ʃ,C[!=s]");
    word.remove("ʃ", "#_ʃ");
    word.remove("s", "#_sʲ");
    if (word.startMatch("s/z/ʃ,[stressed]"))
        word.atIdx(0).stressed = true;

    word.replace("s", "j", "_#");

    if (word.endMatch("n") && word.partOfSpeech == "conjVerb")
        word.insert("o", word.length);

    //Loss of final consonants
    if (word.endMatch("C[!=j/w]") && !(word.endMatch("n") && word.vowels.length == 1))
        word.atIdx(-1).remove();

    if (word.endMatch("j") && !word.atIdx(-2).stressed) {
        if (word.endMatch("a,j") && word.partOfSpeech != "conjVerb")
            word.atIdx(-2).value = "e";
        else
            word.atIdx(-2).value = "i";
        word.atIdx(-1).remove();
    }

    word.forEach(segment => {
        if (segment.match("V") && segment.value.endsWith("ː"))
            segment.value = segment.value[0];

        if (
            segment.match("V[stressed]") && segment.value.length == 1
            && (segment.ctxMatch("_V") || segment.ctxMatch("_C,V") || segment.ctxMatch("_p/t/k/b/d/g/f/β,l/r/w,_"))
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
        if (segment.match("p/k/b/g/f", "_ʎ")) {
            segment.relIdx(1).value = "j";
            if (segment.ctxMatch("V_"))
                word.insert(segment.value, segment.idx);
        }
    });
    word.remove("j", "_i/iː");

    word.forEach(segment => {
        if (segment.match("β", "_r")) {
            segment.value = "b";
            word.insert("b", segment.idx);
        }
    });

    if (word.vowels.atIdx(-1).match("u") && !word.vowels.atIdx(-1).stressed)
        word.vowels.atIdx(-1).value = "o";

    word.forEach(segment => {
        if (segment.match("V") && segment.value.endsWith("ː"))
            segment.value = segment.value[0];

        if (
            segment.match("V[stressed]") && segment.value.length == 1
            && (segment.ctxMatch("_V/#") || segment.ctxMatch("_C,V") || segment.ctxMatch("_p/t/k/b/d/g/f/β,l/r/w"))
        )
            segment.value += "ː";
    });

    word.replace("eː", "iː", "_V");
    word.replace("oː", "uː", "_V");

    word.forEach(segment => {
        if (segment.match("ɛː") && !segment.ctxMatch("j/w_")) {
            word.insert("j", segment.idx);
            if (segment.stressed)
                segment.relIdx(-1).stressed = true;
            segment.diphthongized = true;
        }

        if (segment.match("ɔː") && !segment.ctxMatch("j/w_")) {
            word.insert("w", segment.idx);
            if (segment.stressed)
                segment.relIdx(-1).stressed = true;
        }
    });

    word.replaceSeq("a,w", "ɔː");
    word.replaceSeq("aː,w", "ɔː");

    word.forEach(segment => {
        if (segment.match("V") && segment.value.endsWith("ː"))
            segment.value = segment.value[0];

        if (
            segment.match("V[stressed]") && segment.value.length == 1
            && (segment.ctxMatch("_V") || segment.ctxMatch("_C,V") || segment.ctxMatch("_p/t/k/b/d/g/f/β,l/r/w"))
        )
            segment.value += "ː";
    });

    word.forEach(segment => {
        if (segment.match("ɛː", "j_a/e/o")) {
            segment.value = "iː";
            segment.relIdx(-1).remove();
        }

        if (segment.match("ɔː", "w_a/e/o")) {
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
        if (segment.match("e[!stressed]", "_[!=r]") && segment != word.vowels.atIdx(-1))
            segment.value = "i";

        if (segment.match("u") && segment.idx < word.stressedVowel.idx)
            segment.value = "o";

        if (segment.match("ɔ") && segment.idx < word.stressedVowel.idx)
            segment.value = "u";

        if (segment.match("a[!stressed]", "C/V_r"))
            segment.value = "e";
    });

    word.replace("ɔ", "o", "_m/n/ɲ/ŋ,C[!=n]");

    word.replace("e", "i", "_ŋ");
    word.replace("o", "u", "_ŋ");
    word.replace("e", "i", "_s,k,j");

    word.remove("j", "t͡ʃ/d͡ʒ/ʃ/ʎ/ɲ_");
    word.remove("j", "C,r_");
    word.remove("w", "C,r_");

    if (word.endMatch("aː/uː,t/d,e") && word.partOfSpeech != "conjVerb") {
        word.atIdx(-2).remove();
        word.atIdx(-1).remove();
    }

    word.replace("ʃ", "t͡ʃ", "V_V");

    word.replace("s", "z", "V_V");

    addRow("ModIt", "Modern Italian", "", getSpelling_ModIt(), word);
}

function LL_to_CRom() {
    word = outcomes.LL.duplicate();

    word.replace("nʲ", "ɲ", "V/C_");
    word.replace("n", "ɲ", "_ɲ");
    word.replace("lʲ", "ʎ", "V/C_");
    word.replace("l", "ʎ", "_ʎ");

    word.forEach(segment => {
        if (segment.value.endsWith("ː"))
            segment.value = segment.value[0];
    });

    if (word.partOfSpeech != "conjVerb")
        word.remove("s", "ɪ[!stressed]_#");
    word.remove("s", "ʊ[!stressed]_#");

    //Loss of final consonants
    while (word.endMatch("C[!=s/j/w]") && !(word.endMatch("n") && word.vowels.length == 1))
        word.atIdx(-1).remove();

    word.replace("ɪ", "e");
    word.replace("ɔ", "o");
    word.replace("ʊ", "u");

    word.replace("k", "p", "_t/t͡sʲ/s/sʲ");
    word.replace("ŋ", "m", "_n/t/t͡sʲ/s/sʲ");

    word.replace("l", "ʎ", "k/g_");

    word.replace("ɫ", "l");

    word.replace("rʲ", "r");

    word.remove("w", "k/g_ɛ/e/i");

    word.replace("j/d͡zʲ", "d͡ʒ", "#_");
    word.replace("t͡sʲ d͡zʲ", "t͡ʃ d͡ʒ", "_o/u,C");
    word.replace("sʲ", "ʃ");

    word.replace("c ɟ", "t͡ʃ d͡ʒ");
    word.replace("t͡ʃ", "t", "_t͡ʃ");
    word.replace("d͡ʒ", "d", "_d͡ʒ");
    word.replace("ɲ", "n", "_t͡ʃ/d͡ʒ");

    word.replace("t͡ʃ d͡ʒ", "t͡sʲ d͡zʲ", "", segment => segment.prevVowel().stressed);

    word.replace("k g", "t͡ʃ d͡ʒ", "_ɛ/e/i");
    word.replace("k", "t", "_t͡ʃ");
    word.replace("g", "d", "_d͡ʒ");
    word.replace("ŋ", "n", "_t͡ʃ/d͡ʒ");

    word.remove("e[!stressed]", "#_s/z/ʃ,C[!=s]");
    word.remove("ʃ", "#_ʃ");
    if (word.startMatch("s/z/ʃ,[stressed]"))
        word.atIdx(0).stressed = true;

    word.forEach(segment => {
        if (segment.match("pʲ/bʲ/fʲ/βʲ/mʲ")) {
            word.insert("j", segment.prevVowel().idx + 1);
            segment.value = segment.value[0];
        }
    });

    word.replaceSeq("k,w", "p");
    word.replaceSeq("g,w", "b");
    word.replace("ŋ", "m", "_p/b");

    word.replace("β", "b", "l/r/z_");

    word.replace("β", "w", "_l/r");

    word.remove("β", "V/j/w_");

    word.insert("e", "C,s_#");

    word.replace("s", "j", "_#");

    if (word.endMatch("j") && !word.atIdx(-2).stressed) {
        if (word.endMatch("a,j") && word.partOfSpeech != "conjVerb")
            word.atIdx(-2).value = "e";
        else
            word.atIdx(-2).value = "i";
        word.atIdx(-1).remove();
    }

    //Degemination
    word.forEach(segment => {
        if (segment.match("C[!=n/l/r]") && segment.value == segment.relIdx(1).value[0])
            segment.remove();
    });

    addRow("BR", "Balkan Romance", "600", "", word, true);


    word.forEach(segment => {
        if (segment.match("ɛ", "[!=j]_") && !segment.ctxMatch("_m/n,C[!=m/n]")) {
            word.insert("j", segment.idx);
            if (segment.stressed)
                segment.relIdx(-1).stressed = true;
        }
    });

    word.replace("ɛ", "e");

    word.remove("j", "r_");

    word.remove("V[!stressed]", "", segment => segment.relIdx(-1).value == segment.value || segment.relIdx(1).value == segment.value);

    word.replace("a[!stressed]", "ə", "C/V_");
    word.replace("o[!stressed]", "u");

    word.replace("i[!stressed] u[!stressed]", "j[type=consonant] w[type=consonant]", "_V");

    if (word.stressedVowel.ctxMatch("C_"))
        word.stressedVowel.relIdx(-1).stressed = true;
    if (word.stressedVowel.ctxMatch("p/t/k/b/d/g/f/β,l/ʎ/r_") || word.stressedVowel.ctxMatch("C,w_"))
        word.stressedVowel.relIdx(-2).stressed = true;
    word.forEach(segment => {
        if (word.vowels.atIdx(0).stressed && segment.idx < word.vowels.atIdx(0).idx)
            segment.stressed = true;
    });

    word.replace("a o", "ə u", "_n/ɲ,[!=n]");
    word.replace("a o", "ə u", "_m/ŋ,C[!=m/n]");

    word.replace("l", "r", "V/j/w_V");

    word.remove("l", "_l");

    word.replace("l", "w", "V_ə[!stressed]");

    word.replace("w", "v", "u_");

    word.replace("i[!stressed]", "e", "C_C");

    //Second palatalization
    word.replace("t d s l", "t͡sʲ d͡zʲ ʃ ʎ", "_i/j");
    word.replace("s", "ʃ", "_ʃ");
    word.replace("l", "ʎ", "_ʎ");
    word.remove("j", "t͡sʲ/d͡zʲ/t͡ʃ/d͡ʒ/ʃ/ʎ_");

    word.replaceSeq("s,t͡ʃ/t͡sʲ", "ʃ,t");

    word.replace("t͡sʲ", "t͡s");
    word.replace("d͡zʲ", "d͡z");

    word.replace("{i/e}[!stressed] u[!stressed]", "j[type=consonant] w[type=consonant]", "V_");

    word.forEach(segment => {
        if (segment.match("e", "_a/ə")) {
            segment.value = "e̯a";
            if (segment.relIdx(1).stressed)
                segment.stressed = true;
            segment.relIdx(1).remove();
        }
    });

    word.forEach(segment => {
        if (segment.stressed && segment.nextVowel().match("ə/e") && !segment.ctxMatch("_n,V/C[!=n]") && !segment.ctxMatch("_m,C[!=m/n]")) {
            if (segment.match("e"))
                segment.value = "e̯a";

            if (segment.match("o"))
                segment.value = "o̯a";
        }
    });

    word.remove("ə", "o̯a_");

    word.replace("ə", "e", "ʎ/ɲ_");

    word.replace("β", "v");

    addRow("CRom", "Common Romanian", "1000", "", word);
}

function CRom_to_ModRom() {
    word = outcomes.CRom.duplicate();

    word.replace("e e̯a", "ə a", "m/p/b/f/β_", segment => segment.nextVowel().match("ə/a/o/o̯a/u"));

    word.remove("w", "V[stressed]_ə[!stressed]");
    word.remove("ə", "a/e̯a/o̯a_");

    word.replace("ə", "ɨ", "_n/ɲ/ŋ");
    word.replace("ə", "ɨ", "_m/r/s,C[!=r]");

    word.replace("e[stressed]", "i", "_m/n/ŋ,[!=n]");
    word.remove("j", "_i");

    word.replace("e i", "ə ɨ", "#/r,r_");

    word.remove("n", "_n");
    word.remove("r", "_r");

    word.replace("w", "u[type=vowel]", "a[stressed]_C");

    word.replace("m", "n", "_t/t͡s/t͡ʃ");

    if (word.partOfSpeech == "inf" && word.endMatch("r,V")) {
        word.atIdx(-2).remove();
        word.atIdx(-1).remove();
    }

    word.replace("ʎ/ɲ", "j");
    word.remove("j", "_i");
    word.replace("i[!stressed]", "j[type=consonant]", "V_");
    word.replaceSeq("i,j", "iː", "_C/#");

    word.replace("e̯a", "a", "t͡ʃ/d͡ʒ/ʃ/j_");

    word.replace("ə", "e", "i_#");

    word.replace("i[!stressed] u[!stressed]", "i̥ u̥", "C_#", segment => !segment.ctxMatch("C[!=j/w],l/r_"));

    addRow("ORom", "Old Romanian", "1600", getSpelling_ORom(), word, true);


    word.replace("d͡z", "z");
    word.replace("d͡ʒ", "ʒ", "_o/o̯a/u/u̥");

    word.replace("e̯a", "e", "", segment => segment.nextVowel().match("e"));

    word.replace("k g", "c ɟ", "_e/e̯a/i/i̥/j");
    word.replace("ŋ", "ɲ", "_c/ɟ");

    word.replace("e̯a", "a", "c/ɟ_");

    word.replace("i̥", "ʲ");
    word.remove("u̥");

    word.remove("j/ʲ", "c/ɟ_");
    word.replaceSeq("t͡ʃ,ʲ", "t͡ɕ");
    word.replaceSeq("d͡ʒ,ʲ", "d͡ʑ");
    word.replaceSeq("ʃ,ʲ", "ɕ");

    word.replaceSeq("i,j", "iː", "_#");

    word.replaceSeq(",o̯a", "w,a", "#/V_");
    word.replace("C", "[stressed]", "_V[stressed]");

    word.insert("m", "n,u[stressed]_p/b");
    word.insert("n", "n,u[stressed]_t/d/t͡s/d͡z/t͡ʃ/d͡ʒ");
    word.insert("ɲ", "n,u[stressed]_c/ɟ");
    word.insert("ŋ", "n,u[stressed]_k/g");

    addRow("ModRom", "Modern Romanian", "", getSpelling_ModRom(), word);
}

function getSpellingFromArg_Lat() {
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
                if (segment.ctxMatch("#/V_") || segment.ctxMatch("_#"))
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
                if (segment.ctxMatch("#/V_"))
                    str += "h";
                str += "u";
                break;
            case "b":
                str += "b";
                break;
            case "t͡s":
                if (segment.ctxMatch("_e/i/j"))
                    str += "c";
                else if (segment.ctxMatch("_V/w"))
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
                if (segment.ctxMatch("_e/i/j"))
                    str += "gu";
                else
                    str += "g";
                break;
            case "ʒ":
                if (segment.ctxMatch("_e/i/j"))
                    str += "g";
                else
                    str += "j";
                break;
            case "k":
                if (segment.ctxMatch("_e/i/j"))
                    str += "qu";
                else if (segment.ctxMatch("_w,[!=e/i/j]"))
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
                if (segment.ctxMatch("_C[!=j/w]"))
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

    return str.replace(/s$/, `<span class= "nonHist">s</span>`);
}

function getSpelling_EModSp() {
    let str = "";

    if (wordArg.startsWith("h") && word.startMatch("V"))
        str += "h";

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);

        if (segment.droppedCons && (segment.match("V") || segment.ctxMatch("V_")))
            str += "h";

        switch (segment.value) {
            case "a":
                if (segment.ctxMatch("_#") && segment.stressed && word.vowels.length > 1)
                    str += "à";
                else
                    str += "a";
                break;
            case "e":
                if (segment.ctxMatch("_#") && segment.stressed && word.vowels.length > 1)
                    str += "è";
                else
                    str += "e";
                break;
            case "i":
                if (str == "")
                    str += "y";
                else if (segment.ctxMatch("_#") && segment.stressed && word.vowels.length > 1)
                    str += "ì";
                else
                    str += "i";
                break;
            case "o":
                if (segment.ctxMatch("_#") && segment.stressed && word.vowels.length > 1)
                    str += "ò";
                else
                    str += "o";
                break;
            case "u":
                if (segment.ctxMatch("_#") && segment.stressed && word.vowels.length > 1)
                    str += "ù";
                else if (str == "" && !modernTypography)
                    str += "v";
                else
                    str += "u";
                break;
            case "j":
                if (segment.ctxMatch("_#"))
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
                if (segment.ctxMatch("_e/i/j"))
                    str += "gu";
                else
                    str += "g";
                break;
            case "ʃ":
                if (segment.OSpValue == "ʃ")
                    str += "x";
                else if (segment.ctxMatch("_e/i/j"))
                    str += "g";
                else if (modernTypography)
                    str += "j";
                else
                    str += "i";
                break;
            case "k":
                if (segment.ctxMatch("_e/i/j"))
                    str += "qu";
                else if (segment.ctxMatch("_w,[!=e/i/j]"))
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
                if (segment.ctxMatch("_b[OSpValue!=b]"))
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
                } else if (segment.ctxMatch("_#") || modernTypography) {
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
                if (segment.OSpValue == "d͡z" || segment.ctxMatch("_C!=[j/w]/#"))
                    str += "z";
                else if (segment.ctxMatch("_e/i/j"))
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

    if (wordArg.startsWith("h") && word.atIdx(0).match("V"))
        str += "h";

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);

        if (segment.droppedCons && (segment.match("V") || segment.ctxMatch("V_")))
            str += "h";

        let defaultStress = false;
        if (segment == word.vowels.atIdx(-2) && word.endMatch("V/s̺/n"))
            defaultStress = true;
        if (segment == word.vowels.atIdx(-1) && word.endMatch("C[!=s̺/n]"))
            defaultStress = true;
        if (word.vowels.length == 1 && segment.match("V"))
            defaultStress = true;
        if (segment.match("i/u") && (segment.ctxMatch("_V") || segment.ctxMatch("V_")))
            defaultStress = false;
        if (segment.match("i/u", "_j/w,C"))
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
                if (segment.ctxMatch("_#"))
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
                if (segment.ctxMatch("_e/i/j"))
                    str += "gu";
                else
                    str += "g";
                break;
            case "ʃ":
                if (segment.LatValue == "g" && segment.ctxMatch("_e/i/j"))
                    str += "g";
                else
                    str += "j";
                break;
            case "k":
                if (segment.ctxMatch("_e/i/j"))
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
                if (segment.ctxMatch("_b") && !(segment.relIdx(1).LatValue == "b" || segment.relIdx(1).LatValue == "p" || !segment.relIdx(1).LatValue))
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
                if (segment.ctxMatch("_e/i/j"))
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
                if (segment.ctxMatch("#/V[!=i/ĩ]_[!=i/ĩ]") || segment.ctxMatch("_#"))
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
                if (segment == word.vowels.atIdx(-1) && !segment.stressed && !segment.ctxMatch("u/ũ_"))
                    str += "o";
                else
                    str += "u";
                break;
            case "ã":
                if (segment.ctxMatch("_V"))
                    str += "ã";
                else if (segment.ctxMatch("_p/b"))
                    str += "am";
                else
                    str += "an";
                break;
            case "ẽ":
                if (segment.ctxMatch("_V"))
                    str += "ẽ";
                else if (segment.ctxMatch("_p/b"))
                    str += "em";
                else
                    str += "en";
                break;
            case "ĩ":
                if (segment.ctxMatch("_V"))
                    str += "ĩ";
                else if (segment.ctxMatch("_p/b"))
                    str += "im";
                else
                    str += "in";
                break;
            case "õ":
                if (segment.ctxMatch("_V"))
                    str += "õ";
                else if (segment.ctxMatch("_p/b"))
                    str += "om";
                else
                    str += "on";
                break;
            case "ũ":
                if (segment.ctxMatch("_V"))
                    str += "ũ";
                else if (segment.ctxMatch("_p/b"))
                    str += "um";
                else
                    str += "un";
                break;
            case "j":
                if (segment.ctxMatch("_V/#"))
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
                if (segment.ctxMatch("_ɛ/e/i/ẽ/ĩ/j"))
                    str += "qu";
                else if (segment.ctxMatch("_w"))
                    str += "q";
                else
                    str += "c";
                break;
            case "t͡s":
                if (segment.ctxMatch("_#"))
                    str += "z";
                else if (segment.ctxMatch("_ɛ/e/i/ẽ/ĩ/j"))
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
                if (segment.ctxMatch("_ɛ/e/i/ẽ/ĩ/j"))
                    str += "gu";
                else
                    str += "g";
                break;
            case "ʒ":
                if (segment.ctxMatch("_ɛ/e/i/ẽ/ĩ/j") && segment.LatValue == "g")
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

    if (wordArg.startsWith("h") && word.atIdx(0).match("V"))
        str += "h";

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);

        let defaultStress = false;
        if (segment == word.vowels.atIdx(-2) && word.endMatch("V/s/t͡s"))
            defaultStress = true;
        if (segment == word.vowels.atIdx(-2) && word.partOfSpeech == "conjVerb" && word.endMatch("ɐ̃[!stressed],w"))
            defaultStress = true;
        if (segment == word.vowels.atIdx(-2) && word.endMatch("ẽ,j"))
            defaultStress = true;
        if (segment == word.vowels.atIdx(-1) && segment.match("i/u/ɐ̃/ĩ/õ/ũ"))
            defaultStress = true;
        if (segment == word.vowels.atIdx(-1) && segment.ctxMatch("_C[!=s]"))
            defaultStress = true;
        if (segment.match("i/u", "V_[!=ɲ]") && !segment.match("_ɾ,#"))
            defaultStress = false;
        if (segment == word.vowels.atIdx(-2) && word.endMatch("ɐ̃"))
            defaultStress = false;
        if (segment == word.vowels.atIdx(-2) && word.vowels.atIdx(-1).ctxMatch("w_"))
            defaultStress = false;
        if (segment.match("ɛ/ɔ", "_j/w"))
            defaultStress = false;
        if (segment.match("ẽ") && segment.ctxMatch("_j,#") && word.vowels.length > 1)
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
                if (segment.stressed && !defaultStress && variety == "br" && segment.ctxMatch("_m/n/ɲ"))
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
                    (segment.OGPValue == "e" || segment.OGPValue == "ẽ" || !segment.OGPValue) && !segment.ctxMatch("_ɛ/e/ẽ/i/ĩ")
                    && !(segment.ctxMatch("_u/ũ")
                        && ((segment.OGPValue == "o" || segment.OGPValue == "õ" || (segment == word.vowels.atIdx(-1) && !segment.stressed))
                            && !segment.ctxMatch("_ɔ/o/õ")))
                    && !segment.stressed
                )
                    str += "e";
                else if (segment.stressed && !defaultStress)
                    str += "í";
                else
                    str += "i";
                break;
            case "ɔ":
                if (segment.stressed && !defaultStress && variety == "br" && segment.ctxMatch("_m/n/ɲ"))
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
                if ((segment.OGPValue == "o" || segment.OGPValue == "õ" || (segment == word.vowels.atIdx(-1) && !segment.stressed)) && !segment.ctxMatch("_ɔ/o/õ") && !segment.stressed)
                    str += "o";
                else if (segment.stressed && !defaultStress)
                    str += "ú";
                else
                    str += "u";
                break;
            case "ɐ̃":
                if (segment.ctxMatch("_p/b") || (word.partOfSpeech == "conjVerb" && segment.ctxMatch("_w,#") && !segment.stressed)) {
                    if (segment.stressed && !defaultStress)
                        str += "ám";
                    else
                        str += "am";
                } else if (segment.ctxMatch("_C[!=j/w]")) {
                    if (segment.stressed && !defaultStress)
                        str += "án";
                    else
                        str += "an";
                } else {
                    str += "ã";
                }
                break;
            case "ẽ":
                if (segment.ctxMatch("_p/b") || segment.ctxMatch("_j,p/b/#")) {
                    if (segment.stressed && !defaultStress && segment == word.vowels.atIdx(-1) && segment.ctxMatch("_j"))
                        str += "ém";
                    else if (segment.stressed && !defaultStress)
                        str += "êm";
                    else
                        str += "em";
                } else {
                    if (segment.stressed && !defaultStress && segment == word.vowels.atIdx(-1) && segment.ctxMatch("_j"))
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
                } else if (segment.relIdx(1).match("C") && !segment.ctxMatch("_j/w")) {
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
                if (segment.ctxMatch("ɐ̃/õ_") && segment.relIdx(-1) == word.vowels.atIdx(-1))
                    str += "e";
                else if (!segment.ctxMatch("ẽ_"))
                    str += "i";
                break;
            case "w":
                if (word.partOfSpeech == "conjVerb" && segment.ctxMatch("ɐ̃[!stressed]_#"))
                    break;
                else if (segment.ctxMatch("ɐ̃_") && segment.relIdx(-1) == word.vowels.atIdx(-1))
                    str += "o";
                else
                    str += "u";
                break;
            case "b":
                str += "b";
                break;
            case "k":
                if (segment.ctxMatch("_ɛ/e/i/ẽ/ĩ/j"))
                    str += "qu";
                else if (segment.ctxMatch("_w"))
                    str += "q";
                else
                    str += "c";
                break;
            case "t͡s":
                if (segment.ctxMatch("V[stressed]_#"))
                    str += "z";
                else if (segment.ctxMatch("_ɛ/e/i/ẽ/ĩ/j"))
                    str += "c";
                else if (segment.ctxMatch("_#") || segment.ctxMatch("#_"))
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
                if (segment.ctxMatch("_ɛ/e/i/ẽ/ĩ/j"))
                    str += "gu";
                else
                    str += "g";
                break;
            case "ʒ":
                if (segment.ctxMatch("_ɛ/e/i/ẽ/ĩ/j") && segment.LatValue != "j")
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
                if (segment.ctxMatch("_w"))
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
                if (segment.ctxMatch("_V"))
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
                if (segment.ctxMatch("_#"))
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
                if (segment.ctxMatch("#_"))
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
                if (segment.ctxMatch("_#"))
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

    let frontVowels = "ɛ/e/æ/ə/i/ei̯/e̯au̯/øu̯/ɛː/eː/iː/j";

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);
        switch (segment.value) {
            case "a":
            case "ɑ":
                if (segment.ctxMatch("_ɲ"))
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
                if (segment.droppedL && (segment.ctxMatch("_#") || segment.ctxMatch("_s̺,#")))
                    str += "l";
                break;
            case "ɔ":
            case "u":
                if (segment.ctxMatch("_ɲ"))
                    str += "oi";
                else
                    str += "o";
                break;
            case "y":
                str += "u";
                if (segment.droppedL && (segment.ctxMatch("_#") || segment.ctxMatch("_s̺,#")))
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
                if (segment.droppedL && (segment.ctxMatch("_#") || segment.ctxMatch("_s̺,#")))
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
                if (segment.ctxMatch("_z"))
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
                if (segment.ctxMatch(`_${frontVowels}`))
                    str += "gu";
                else
                    str += "g";
                break;
            case "d͡ʒ":
                if (segment.ctxMatch(`_${frontVowels}`))
                    str += "g";
                else
                    str += "j";
                break;
            case "k":
                if (segment.ctxMatch(`_${frontVowels}`) || (segment.LatValue == "kʷ" && segment.ctxMatch("_V/j")))
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
                if (segment.ctxMatch("#_"))
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
                if (segment.ctxMatch("_#"))
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

        let frontVowels = "ɛ/e/ə/æ/œ/i/ei̯/e̯au̯/ɛː/iː/øː/j";

        let doubleCons = segment.ctxMatch("{a/ɛ/æ/ɔ/o}[stressed][EOFValue!=ai̯]_ə");

        switch (segment.value) {
            case "a":
            case "ɑ":
                if (segment.LOFValue == "u")
                    str += "ao";
                else if (segment.ctxMatch("_ɲ"))
                    str += "ai";
                else
                    str += "a";
                break;
            case "ɛ":
            case "æ":
                if ((segment.EOFValue == "ai̯" || segment.droppedA) && segment.ctxMatch("_V/j/#"))
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
                else if (segment.ctxMatch("_#") && word.vowels.length > 1)
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
                else if (segment.ctxMatch("V_") || segment.ctxMatch("#/w_v"))
                    str += "y";
                else
                    str += "i";
                if (segment.droppedL && (segment.ctxMatch("_#") || segment.ctxMatch("_s̺,#")))
                    str += "l";
                break;
            case "ɔ":
            case "o":
                if (segment.ctxMatch("_ɲ"))
                    str += "oi";
                else
                    str += "o";
                break;
            case "u":
                str += "ou";
                break;
            case "y":
                if (segment.ctxMatch("#_") && !modernTypography)
                    str += "v";
                else
                    str += "u";
                if (segment.droppedL && (segment.ctxMatch("_#") || segment.ctxMatch("_s̺,#")))
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
                else if (segment.droppedL && (segment.ctxMatch("_#") || segment.ctxMatch("_s̺,#")))
                    str += "oil";
                else if (segment.ctxMatch("_V/j/#"))
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
                    if (segment.ctxMatch("V_"))
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
                if (segment.ctxMatch("_z̺") || !segment.droppedS)
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
                if (segment.ctxMatch("#_") && !modernTypography)
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
                if (segment.ctxMatch("#_"))
                    str += "h";
                str += "ou";
                break;
            case "ɥ":
                if (segment.ctxMatch("#_"))
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
                if (segment.ctxMatch(`_${frontVowels}[EOFValue!=ai̯]`))
                    str += "gu";
                else
                    str += "g";
                break;
            case "d͡ʒ":
                if (segment.ctxMatch(`_${frontVowels}`))
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
                else if (segment.ctxMatch(`_${frontVowels}[EOFValue!=ai̯]`) || (segment.LatValue == "kʷ" && segment.ctxMatch("_V/j")))
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
                if (doubleCons || (segment.LOFValue == "r" && !segment.ctxMatch("#_")))
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
                else if (segment.ctxMatch("_#") || modernTypography)
                    str += "s";
                else
                    str += "ſ";
                break;
            case "z̺":
                if (segment.ctxMatch("_#") || modernTypography)
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
                if (segment.ctxMatch("#_") || modernTypography)
                    str += "v";
                else
                    str += "u";
                break;
            case "t͡s":
                if (segment.ctxMatch("V[stressed]_#") && word.vowels.length > 1)
                    str += "z";
                else if (segment.ctxMatch("au̯/e̯au̯/œ_#"))
                    str += "x";
                else if (segment.ctxMatch("_#"))
                    str += "s";
                else if (!segment.ctxMatch(`_${frontVowels}`))
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

        let frontVowels = "ɛ/e/ə/æ/œ/i/ei̯/e̯au̯/ɛː/iː/øː/j";

        let doubleCons = segment.ctxMatch("{a/ɛ/æ/ɔ/o}[stressed][EOFValue!=ai̯]_ə");

        switch (segment.value) {
            case "a":
            case "ɑ":
                if (segment.LOFValue == "u")
                    str += "ao";
                else
                    str += "a";
                break;
            case "ɛ":
                if ((segment.EOFValue == "ai̯" || segment.droppedA) && segment.ctxMatch("_j/i/iː"))
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
                if (segment.ctxMatch("_r"))
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
                else if (segment.ctxMatch("V[!=y]_"))
                    str += "ï";
                else
                    str += "i";
                if (segment.droppedL && (segment.ctxMatch("_#") || segment.ctxMatch("_s̺,#")))
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
                if (segment.droppedL && (segment.ctxMatch("_#") || segment.ctxMatch("_s̺,#")))
                    str += "ul";
                else if (str.endsWith("g") && segment.ctxMatch(`_${frontVowels}[EOFValue!=ai̯]`))
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
                if (segment.droppedL && (segment.ctxMatch("_#") || segment.ctxMatch("_s̺,#")))
                    str += "oil";
                else if (segment.ctxMatch("_j/i/iː"))
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
                else if (segment.ctxMatch("_z̺/r[LOFValue=r]"))
                    str += "a";
                else
                    str += "â";
                break;
            case "ɛː":
                if (segment.EOFValue == "ai̯" || segment.droppedA)
                    str += "ai";
                else if (segment.ctxMatch("_r[LOFValue=r]"))
                    str += "e";
                else
                    str += "ê";
                break;
            case "oː":
                if (segment.ctxMatch("_z̺"))
                    str += "o";
                else
                    str += "ô";
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
                if (segment.ctxMatch("#_"))
                    str += "h";
                str += "ou";
                break;
            case "ɥ":
                if (segment.ctxMatch("#_"))
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
                if (segment.ctxMatch(`_${frontVowels}[EOFValue!=ai̯]`))
                    str += "gu";
                else
                    str += "g";
                break;
            case "d͡ʒ":
                if (segment.ctxMatch(`_${frontVowels}`))
                    str += "g";
                else
                    str += "j";
                if (!segment.ctxMatch("_V/j/w/ɥ"))
                    str += "e";
                break;
            case "k":
                if (segment.ctxMatch("_œ/øː,ʎ"))
                    str += "cu";
                else if (segment.ctxMatch(`_${frontVowels}[EOFValue!=ai̯]`) || (segment.LatValue == "kʷ" && segment.ctxMatch("_V/j")))
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
                if (doubleCons || (segment.LOFValue == "r" && !segment.ctxMatch("#_")))
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
                if (segment.ctxMatch("V[stressed]_#") && word.vowels.length > 1)
                    str += "z";
                else if (segment.ctxMatch("au̯/e̯au̯/œ_#"))
                    str += "x";
                else if (segment.ctxMatch("_#"))
                    str += "s";
                else if (segment.ctxMatch(`_${frontVowels}`))
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

    let frontVowels = "ɛ/ɛː/e/eː/i/iː/j";

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);

        let accentCondition = (segment.ctxMatch("_#") && segment.stressed
            && (word.vowels.length > 1
                || (str.at(-1).match(/[iu]/) && str.at(-2) != "q")
                || (segment.diphthongized && segment.ctxMatch("t͡ʃ/d͡ʒ/ʃ_"))));

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
                if (segment.diphthongized && segment.ctxMatch("t͡ʃ/d͡ʒ/ʃ_"))
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
                if (segment.ctxMatch("_w,V[!=ɔ/ɔː]")) {
                    str += "q";
                } else {
                    str += "c";
                    if (segment.ctxMatch(`_${frontVowels}`))
                        str += "h";
                }
                break;
            case "t͡ʃ":
                str += "c";
                if (!segment.ctxMatch(`_${frontVowels}`) || (segment.ctxMatch("V_e,#") && segment.relIdx(1).LatValue.startsWith("a")))
                    str += "i";
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
                str += "g";
                if (segment.ctxMatch(`_${frontVowels}`))
                    str += "h";
                break;
            case "d͡ʒ":
                str += "g";
                if (!segment.ctxMatch(`_${frontVowels}`))
                    str += "i";
                break;
            case "ʎ":
                if (segment.relIdx(1).value != "ʎ") {
                    str += "gl";
                    if (!segment.ctxMatch("_i/iː"))
                        str += "i";
                }
                break;
            case "ɲ":
                if (!segment.ctxMatch("_ɲ"))
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
                if (!segment.ctxMatch("_ʃ")) {
                    str += "sc";
                    if (!segment.ctxMatch(`_${frontVowels}`))
                        str += "i";
                }
                break;
            case "t":
                if (segment.ctxMatch("_t͡ʃ"))
                    str += "c";
                else if (segment.ctxMatch("_t͡s"))
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

function getSpelling_ORom() {
    let str = "";

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);
        switch (segment.value) {
            case "a":
                str += "а";
                break;
            case "ə":
                str += "ъ";
                break;
            case "e":
                str += "е";
                break;
            case "e̯a":
                str += "ѣ";
                break;
            case "i":
            case "i̥":
                if (segment.ctxMatch("_V/w"))
                    str += "і";
                else
                    str += "и";
                break;
            case "iː":
                str += "їй";
                break;
            case "o":
            case "o̯a": //а added after diacritics
                if (segment.ctxMatch("V_"))
                    str += "ѡ";
                else
                    str += "о";
                break;
            case "u":
            case "w":
                if (segment.ctxMatch("#_"))
                    str += "оу";
                else
                    str += "ꙋ";
                break;
            case "u̥":
                str += "ь";
                break;
            case "ɨ":
                if (segment.ctxMatch("#_m/n/ŋ")) {
                    str += "ꙟ";
                    if (segment.ctxMatch("_C,C/#"))
                        i++;
                } else {
                    str += "ѫ";
                }
                break;
            case "j":
                if (segment.ctxMatch("#_a")) {
                    str += "ꙗ";
                    i++;
                } else if (segment.ctxMatch("_a")) {
                    str += "ѧ";
                    i++;
                } else if (segment.ctxMatch("_e")) {
                    str += "ѥ";
                    i++;
                } else if (segment.ctxMatch("_u")) {
                    str += "ю";
                    i++;
                } else if (segment.ctxMatch("_V/w")) {
                    str += "і";
                } else {
                    str += "й";
                }
                break;
            case "b":
                str += "б";
                break;
            case "v":
                str += "в";
                break;
            case "g":
                str += "г";
                break;
            case "d":
                str += "д";
                break;
            case "d͡z":
                str += "ѕ";
                break;
            case "z":
                if (modernTypography)
                    str += "з";
                else
                    str += "ꙁ";
                break;
            case "k":
                str += "к";
                break;
            case "l":
                str += "л";
                break;
            case "m":
                str += "м";
                break;
            case "n":
            case "ŋ":
                str += "н";
                break;
            case "p":
                str += "п";
                break;
            case "r":
                str += "р";
                break;
            case "s":
                str += "с";
                break;
            case "t":
                str += "т";
                break;
            case "f":
                str += "ф";
                break;
            case "t͡s":
                str += "ц";
                break;
            case "t͡ʃ":
                str += "ч";
                break;
            case "ʃ":
                if (segment.ctxMatch("_t")) {
                    str += "щ";
                    i++;
                } else {
                    str += "ш";
                }
                break;
            case "d͡ʒ":
                str += "џ";
                break;
        }

        if (segment.match("V")) {
            //Smooth breathing
            if (segment.ctxMatch("#_"))
                str += "\u0486";
            //Accent
            if (segment.stressed)
                str += "\u0301";
        }

        if (segment.match("o̯a"))
            str += "а";

        if (str.endsWith("і"))
            str = str.slice(0, -1) + "ї";
    }

    return str.normalize("NFC");
}

function getSpelling_ModRom() {
    let str = "";

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);
        switch (segment.value) {
            case "a":
                str += "a";
                break;
            case "ə":
                str += "ă";
                break;
            case "e":
                str += "e";
                break;
            case "e̯a":
                str += "ea";
                break;
            case "i":
            case "j":
            case "ʲ":
                if (!str.endsWith("i"))
                    str += "i";
                break;
            case "iː":
                str += "ii";
                break;
            case "o":
                str += "o";
                break;
            case "o̯a":
                str += "oa";
                break;
            case "u":
                str += "u";
                break;
            case "w":
                if (segment.ctxMatch("#/V_a"))
                    str += "o";
                else
                    str += "u";
                break;
            case "ɨ":
                if (segment.ctxMatch("#_") || segment.ctxMatch("_#"))
                    str += "ɨ";
                else
                    str += "â";
                break;
            case "b":
                str += "b";
                break;
            case "k":
                str += "c";
                break;
            case "c":
                if (segment.ctxMatch("_e/i"))
                    str += "ch";
                else if (segment.ctxMatch("_a"))
                    str += "che";
                else
                    str += "chi";
                break;
            case "t͡ʃ":
                if (segment.ctxMatch("_e/i/ʲ"))
                    str += "c";
                else
                    str += "ci";
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
            case "ɟ":
                if (segment.ctxMatch("_e/i"))
                    str += "gh";
                else if (segment.ctxMatch("_a"))
                    str += "ghe";
                else
                    str += "ghi";
                break;
            case "d͡ʒ":
                if (segment.ctxMatch("_e/i/ʲ"))
                    str += "g";
                else
                    str += "gi";
                break;
            case "ʒ":
                str += "j";
                break;
            case "l":
                str += "l";
                break;
            case "m":
                str += "m";
                break;
            case "n":
            case "ɲ":
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
                str += "s";
                break;
            case "ʃ":
                str += "ș";
                break;
            case "t":
                str += "t";
                break;
            case "t͡s":
                str += "ț";
                break;
            case "v":
                str += "v";
                break;
            case "z":
                str += "z";
                break;
        }
    }

    return str;
}