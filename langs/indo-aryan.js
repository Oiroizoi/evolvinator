function getIPA_San() {
    let charToPhoneme = {
        "a": "ɜ",
        "ā": "ɑː",
        "ai": "ɑj",
        "au": "ɑw",
        "b": "b",
        "bh": "bʱ",
        "c": "t͡ɕ",
        "ch": "t͡ɕʰ",
        "d": "d",
        "ḍ": "ɖ",
        "dh": "dʱ",
        "ḍh": "ɖʱ",
        "e": "eː",
        "g": "g",
        "gh": "gʱ",
        "h": "ɦ",
        "ḥ": "h",
        "i": "i",
        "ī": "iː",
        "j": "d͡ʑ",
        "jh": "d͡ʑʱ",
        "k": "k",
        "kh": "kʰ",
        "l": "l",
        "ḷ": "l̩",
        "m": "m",
        "ṃ": "N",
        "n": "n",
        "ṇ": "ɳ",
        "ñ": "ɲ",
        "ṅ": "ŋ",
        "o": "oː",
        "p": "p",
        "ph": "pʰ",
        "r": "ɾ",
        "ṛ": "r̩",
        "ṝ": "r̩ː",
        "s": "s",
        "ṣ": "ʂ",
        "ś": "ɕ",
        "t": "t",
        "ṭ": "ʈ",
        "th": "tʰ",
        "ṭh": "ʈʰ",
        "u": "u",
        "ū": "uː",
        "v": "ʋ",
        "y": "j",
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

    word.forEach(segment => {
        if (segment.match("l̩/r̩/r̩ː"))
            segment.type = "vowel";
    });

    word.forEach(segment => {
        if (segment.match("h/N", "#/C_"))
            throw new Error("Invalid diacritic placement");
    });

    word.replace("N", "j̃", "_j");
    word.replace("N", "ʋ̃", "_ʋ");
    word.replace("N", "l̃", "_l");

    word.forEach(segment => {
        if (segment.ctxMatch("_N")) {
            segment.nasalized = true;
            segment.relIdx(1).remove();
        }
    });

    word.replace("t͡ɕ", "t", "_t͡ɕ/t͡ɕʰ");
    word.replace("d͡ʑ", "d", "_d͡ʑ/d͡ʑʱ");

    addRow("San", "Classical Sanskrit", "500 BC", "", word);
}

function San_to_EPr() {
    word = outcomes.San.duplicate();

    word.replace("ɜ", "oː", "_h,#");

    word.remove("h");

    while (word.endMatch("C")) {
        if (word.endMatch("V,m/n/ɳ/ɲ/ŋ"))
            word.atIdx(-2).nasalized = true;
        else if (word.endMatch("ɜ,C"))
            word.atIdx(-2).value = "ɑː";
        else if (word.endMatch("i/u,C"))
            word.atIdx(-2).value += "ː";
        word.atIdx(-1).remove();
    }

    if (word.atIdx(-1).nasalized)
        if (word.endMatch("ɑː"))
            word.atIdx(-1).value = "ɜ";
        else if (word.endMatch("iː/uː"))
            word.atIdx(-1).value = word.atIdx(-1).value[0];

    //Monophthongization
    word.replace("ɑj", "eː");
    word.replace("ɑw", "oː");
    word.replaceSeq("ɜ,j,ɜ/i/oː", "eː");
    word.replaceSeq("ɜ,ʋ,i", "eː");
    word.replaceSeq("ɜ,ʋ,ɜ", "oː");

    word.forEach(segment => {
        if (segment.match("r̩/r̩ː/l̩")) {
            if (segment.match("r̩/r̩ː", "#_"))
                word.insert("ɾ", segment.idx);
            if (segment.ctxMatch("m/p/pʰ/b/bʱ_"))
                segment.value = "u";
            else
                segment.value = "i";
        }
    });

    word.replace("ʂ/ɕ", "s");

    word.replace("m/ʋ", "p", "V,t/tʰ/ʈ/ʈʰ_");
    word.replace("m/ʋ", "b", "V,d/dʱ/ɖ/ɖʱ_");

    word.replaceSeq("n/ɳ/j̃,j", "ɲ,ɲ");

    word.forEach(segment => {
        if (segment.match("l/ɾ", "V,m_"))
            word.insert("b", segment.idx);
    });

    word.replace("p/t", "t͡ɕ", "_j/s");
    word.replace("ʈ/k", "t͡ɕ", "_j");
    word.replace("pʰ/tʰ/ʈʰ/kʰ", "t͡ɕʰ", "_j");
    word.replace("b/d/ʈʰ/g", "d͡ʑ", "_j");
    word.replace("bʱ/dʱ/ɖʱ/gʱ", "d͡ʑʱ", "_j");
    word.remove("j", "t͡ɕ,s_");

    while (word.endMatch("C"))
        word.atIdx(-1).remove();

    word.forEach(segment => {
        if (segment.nasalized && segment.ctxMatch("_C[!=ɦ/ɾ]")) {
            segment.nasalized = false;
            word.insert("N", segment.idx + 1);
        }
    });
    word.replace("m/n/ɳ/ɲ/ŋ", "N", "V_C[!=ɦ/l/ɾ/j/ʋ]");
    word.replace("N", "m", "_m/p/pʰ/b/bʱ");
    word.replace("N", "n", "_n/t/tʰ/d/dʱ/s");
    word.replace("N", "ɳ", "_ɳ/ʈ/ʈʰ/ɖ/ɖʱ");
    word.replace("N", "ɲ", "_ɲ/t͡ɕ/t͡ɕʰ/d͡ʑ/d͡ʑʱ");
    word.replace("N", "ŋ", "_ŋ/k/kʰ/g/gʱ");

    word.replace("ʋ̃ l̃", "ʋ l");

    word.forEach(segment => {
        if (segment.value.endsWith("ː") && segment.ctxMatch("_C,C"))
            segment.value = segment.value[0];
    });
    word.replace("ɑ", "ɜ");

    word.replace("s", "ɦ", "p/pʰ/b/bʱ/t/tʰ/d/dʱ/ʈ/ʈʰ/ɖ/ɖʱ/t͡ɕ/t͡ɕʰ/d͡ʑ/d͡ʑʱ/k/kʰ/g/gʱ_");
    word.replace("s", "ɦ", "_p/pʰ/b/bʱ/t/tʰ/d/dʱ/ʈ/ʈʰ/ɖ/ɖʱ/t͡ɕ/t͡ɕʰ/d͡ʑ/d͡ʑʱ/k/kʰ/g/gʱ/m/n/ɳ/ɲ/ŋ");

    word.forEach(segment => {
        if (segment.match("C", "ɦ_")) {
            word.insert("ɦ", segment.idx + 1);
            segment.relIdx(-1).remove();
        }
    });

    word.forEach(segment => {
        if (segment.match("ɦ", "C[!=m/n/ɳ/ɲ/ŋ/l/ʋ/j/ɾ]_")) {
            segment.value = segment.relIdx(-1).value;
            if (segment.match("p/t/ʈ/t͡ɕ/k"))
                segment.value += "ʰ";
            else if (segment.match("b/d/ɖ/d͡ʑ/g"))
                segment.value += "ʱ";
            if (segment.idx == 1)
                segment.relIdx(-1).remove();
            else
                segment.relIdx(-1).value = segment.relIdx(-1).value[0];
        }
    });

    word.replace("n", "m", "_m/p/pʰ/b/bʱ");
    word.replace("n", "n", "_n/t/tʰ/d/dʱ/s");
    word.replace("n", "ɳ", "_ɳ/ʈ/ʈʰ/ɖ/ɖʱ");
    word.replace("n", "ɲ", "_ɲ/t͡ɕ/t͡ɕʰ/d͡ʑ/d͡ʑʱ");
    word.replace("n", "ŋ", "_ŋ/k/kʰ/g/gʱ");

    word.forEach(segment => {
        if (segment.match("V"))
            while (segment.ctxMatch("C,C,C_"))
                if (segment.relIdx(-2).value == segment.relIdx(-1).value[0])
                    segment.relIdx(-2).remove();
                else
                    segment.relIdx(-1).remove();
    });

    //Cluster simplification
    for (let i = 0; i < word.vowels.length; i++) {
        let vowel = word.vowels[i];

        if (vowel.ctxMatch("C,C_") && !vowel.ctxMatch("#/V,m/n/ɳ/ɲ/ŋ/l/ʋ/j/ɾ,ɦ_") && !vowel.ctxMatch("V,m/n/ɳ/ɲ/ŋ,C[!=m/n/ɳ/ɲ/ŋ/l/ɾ/j/ʋ]_")) {
            //Find the "stronger" consonant in the cluster
            let strengthHierarchy = ["p/pʰ/b/bʱ/t/tʰ/d/dʱ/ʈ/ʈʰ/ɖ/ɖʱ/t͡ɕ/t͡ɕʰ/d͡ʑ/d͡ʑʱ/k/kʰ/g/gʱ", "s", "m/n/ɳ/ɲ/ŋ", "l", "ʋ", "j", "ɾ", "ɦ"];
            let stronger;
            for (let group of strengthHierarchy) {
                if (vowel.relIdx(-1).match(group)) {
                    stronger = vowel.relIdx(-1);
                    break;
                } else if (vowel.relIdx(-2).match(group)) {
                    stronger = vowel.relIdx(-2);
                    break;
                }
            }

            vowel.relIdx(-1).value = stronger.value;
            for (let j = vowel.idx - 2; word.atIdx(j).match("C"); j--)
                word.atIdx(j).value = stronger.value[0];
        }
    }
    word.remove("C", "#/C_C[!=ɦ]");

    word.forEach(segment => {
        if (segment.match("ɦ", "C[!=m/n/ɳ/ɲ/ŋ/l/ʋ/j/ɾ]_")) {
            segment.value = segment.relIdx(-1).value;
            if (segment.match("p/t/ʈ/t͡ɕ/k"))
                segment.value += "ʰ";
            else if (segment.match("b/d/ɖ/d͡ʑ/g"))
                segment.value += "ʱ";
            if (segment.idx == 1)
                segment.relIdx(-1).remove();
            else
                segment.relIdx(-1).value = segment.relIdx(-1).value[0];
        }
    });

    if (word.startMatch("C,ɦ"))
        word.insert("ɜ", 1);

    addRow("EPr", "Early Prakrit", "300 BC", getSpelling_EPr(), word, true);
}

function EPr_to_Apa() {
    word = outcomes.EPr.duplicate();

    word.replaceSeq("j,ɦ", "d,d͡ʑʱ");
    word.remove("d", "#_d͡ʑʱ");
    word.replaceSeq("ʋ,ɦ", "b,bʱ");
    word.remove("b", "#_bʱ");

    word.replace("j", "d͡ʑ", "#_");
    word.replaceSeq("j,j", "d,d͡ʑ");

    word.replace("ɳ/ɲ/ŋ", "n", "_V/ɦ");
    word.replace("ɳ/ɲ/ŋ", "n", "_n");

    word.replace("p pʰ t tʰ ʈ ʈʰ k kʰ t͡ɕ t͡ɕʰ", "b bʱ d dʱ ɖ ɖʱ g gʱ d͡ʑ d͡ʑʱ", "V_V");

    word.replace("b d ɖ g d͡ʑ bʱ/dʱ/gʱ/d͡ʑʱ ɖʱ", "ʋ ð ɽ ɣ ʑ ɦ ɽʱ", "V_V");

    word.remove("ð/ʑ/ɣ");

    word.remove("j", "V_V");

    word.forEach(segment => {
        if (segment.match("ɜ/ɑː", "_ɜ/ɑː") || segment.match("i/iː/e", "_V"))
            word.insert("j", segment.idx + 1);
    });

    word.remove("ʋ", "ɜ/ɑː_i/iː/u/uː");

    word.replace("t͡ɕ t͡ɕʰ d͡ʑ d͡ʑʱ", "t͡ʃ t͡ʃʰ d͡ʒ d͡ʒʱ");

    word.forEach(segment => {
        if (segment.match("ɦ", "C[!=ɦ]_"))
            segment.value = segment.relIdx(-1).value + "ʱ";
    });

    addRow("ShPr", "Shauraseni Prakrit", "AD 200", getSpelling_ShPr(), word);


    word.replace("m", "ʋ̃", "V_V");

    if (word.vowels.length > 1)
        word.replace("ɑː iː/eː uː/oː", "ɜ i u", "_#");

    word.remove("ʋ", "i/iː/u/uː_V");

    word.replace("uː", "u", "_V");

    if (word.vowels.length == 1)
        word.vowels.at(-1).stressed = true;
    else if (word.vowels.at(-2).value.endsWith("ː") || word.vowels.at(-2).ctxMatch("_C,C") || word.vowels.length == 2)
        word.vowels.at(-2).stressed = true;
    else if (word.vowels.at(-3).value.endsWith("ː") || word.vowels.at(-3).ctxMatch("_C,C") || word.vowels.length == 3)
        word.vowels.at(-3).stressed = true;
    else
        word.vowels.at(-4).stressed = true;

    word.replace("C", "[stressed]", "_V[stressed]");

    addRow("Apa", "Apabhramsha", "900", getSpelling_Apa(), word, true);
}

function Apa_to_OH(variety) {
    word = outcomes.Apa.duplicate();

    word.replace("ɭ", "l");
    word.remove("ʋ", "V_i/iː");

    word.replace("ʋ", "b", "#_");
    word.replaceSeq("ʋ,ʋ", "b,b");

    word.replace("iː", "i", "_V");

    word.remove("j", "V_V");

    //Contraction of most vowels in hiatus
    word.slice().reverse().forEach(segment => {
        if (segment.match("ɜ/ɑː", "_ɜ/ɑː")) {
            segment.value = "ɑː";
            if (segment.relIdx(1).stressed)
                segment.stressed = true;
            if (segment.relIdx(1).nasalized)
                segment.nasalized = true;
            segment.relIdx(1).remove();
        } else if (segment.match("ɜ", "_i")) {
            segment.value = "ɜɪ̯";
            if (segment.relIdx(1).stressed)
                segment.stressed = true;
            if (segment.relIdx(1).nasalized)
                segment.nasalized = true;
            segment.relIdx(1).remove();
        } else if (segment.match("ɜ", "_u") || segment.match("ɜ", "_ʋ,ɜ")) {
            segment.value = "ɜʊ̯";
            if (segment.relIdx(2).match("ɜ"))
                segment.relIdx(2).remove();
            if (segment.relIdx(1).stressed)
                segment.stressed = true;
            if (segment.relIdx(1).nasalized)
                segment.nasalized = true;
            segment.relIdx(1).remove();
        } else if (
            segment.match("eː/i/iː/oː/u/uː")
            && (segment.value[0] == segment.relIdx(1).value[0] || (segment.ctxMatch("_V[!stressed]") && segment.relIdx(1).value.length == 1))
        ) {
            segment.value = segment.value[0] + "ː";
            if (segment.relIdx(1).stressed)
                segment.stressed = true;
            if (segment.relIdx(1).nasalized)
                segment.nasalized = true;
            segment.relIdx(1).remove();
        }
        if (segment.match("V") && segment.value == segment.relIdx(1).value) {
            if (segment.relIdx(1).stressed)
                segment.stressed = true;
            if (segment.relIdx(1).nasalized)
                segment.nasalized = true;
            segment.relIdx(1).remove();
        }
    });

    word.forEach(segment => {
        if (segment.ctxMatch("ɜ/ɑː_")) {
            if (segment.match("i")) {
                segment.value = "j";
                segment.type = "consonant";
            } else if (segment.match("u") && !(segment.ctxMatch("_C,C") && segment.relIdx(1).value != segment.relIdx(2).value[0])) {
                segment.value = "ʋ";
                segment.type = "consonant";
            }
        }
    });

    word.forEach(segment => {
        if (segment.value.endsWith("ː") && segment.ctxMatch("_C[!=j/ʋ],C"))
            segment.value = segment.value[0];
    });
    word.replace("ɑ", "ɜ");

    //Cluster reduction & compensatory lengthening
    word.slice().reverse().forEach(segment => {
        if (segment.match("V", "_C,C")) {
            if (
                (segment.stressed && segment.value.length == 1
                    && !(segment.ctxMatch("V/C,C_") || segment.prevVowel().value.length > 1) || segment.match("e/o"))
            ) {
                if (segment.match("ɜ"))
                    segment.value = "ɑ";
                if (segment.ctxMatch("_m/n/ɳ/ɲ/ŋ") && segment.relIdx(1).value != segment.relIdx(2).value[0])
                    segment.nasalized = true;
                segment.value += "ː";
                segment.relIdx(1).remove();
            } else if (segment.relIdx(1).value == segment.relIdx(2).value[0]) {
                segment.relIdx(1).remove();
            } else if (segment.ctxMatch("_C,C,C")) {
                segment.relIdx(2).remove();
            }
        }
    });

    word.replace("ɖ ɖʱ", "ɽ ɽʱ", "V_V");

    word.replaceSeq("V,ʋ̃", "V[nasalized],ʋ");

    word.forEach(segment => segment.stressed = false);
    if (word.vowels.length == 1)
        word.vowels.at(-1).stressed = true;
    else if (word.vowels.at(-2).value.endsWith("ː") || word.vowels.at(-2).value.length > 2 || word.vowels.at(-2).ctxMatch("_C,C") || word.vowels.length == 2)
        word.vowels.at(-2).stressed = true;
    else if (word.vowels.at(-3).value.endsWith("ː") || word.vowels.at(-3).value.length > 2 || word.vowels.at(-3).ctxMatch("_C,C") || word.vowels.length == 3)
        word.vowels.at(-3).stressed = true;
    else
        word.vowels.at(-4).stressed = true;

    word.forEach(segment => {
        if (segment.match("eː/i/iː/oː/u/uː", "_V[!stressed]") && segment.relIdx(1).value.length == 1) {
            segment.value = segment.value[0] + "ː";
            if (segment.relIdx(1).stressed)
                segment.stressed = true;
            if (segment.relIdx(1).nasalized)
                segment.nasalized = true;
            segment.relIdx(1).remove();
            if (segment.value[0] == segment.relIdx(1).value[0]) {
                if (segment.relIdx(1).nasalized)
                    segment.nasalized = true;
                segment.relIdx(1).remove();
            }
        }
    });

    word.replace("i/iː u/uː", "j[type=consonant] ʋ[type=consonant]", "_V[stressed]");

    word.replace("C", "[stressed]", "_V[stressed]");
    word.replace("C", "[stressed]", "_{j/ʋ}[stressed]");

    addRow("OH", "Old Hindi", "1300", (variety == "urdu") ? getSpelling_OH_persian() : getSpelling_OH_devanagari(), word);
}

function OH_to_ModH(variety) {
    word = outcomes.OH.duplicate();

    if (word.partOfSpeech == "noun")
        word.replace("ɜʊ̯", "ɑː", "_#");

    word.forEach(segment => {
        if (segment.match("i/u") && segment.idx > word.stressedVowel.idx)
            segment.value = "ɜ";
    });

    word.replace("ɜɪ̯[!stressed] ɜʊ̯[!stressed]", "eː oː", "_#");

    //Schwa deletion
    word.slice().reverse().forEach(segment => {
        if (segment.match("ɜ") && (segment.ctxMatch("V,C_C,V") || segment.ctxMatch("V,m/n/ɳ/ɲ/ŋ,C_C,V") || segment.ctxMatch("_#")) && word.vowels.length > 1) {
            segment.relIdx(-1).droppedSchwa = true;
            segment.remove();
        }
    });

    word.forEach(segment => {
        if (
            segment.match("V[!stressed]") && !segment.value.endsWith("ː") && segment.value.length < 3
            && (segment.ctxMatch("V,C_C,V") || (segment.ctxMatch("#_C,V") && word.vowels.length > 2))
        ) {
            segment.relIdx(-1).droppedSchwa = true;
            segment.remove();
        }
    });

    word.forEach(segment => {
        if (segment.match("ɑː/eː/iː/oː/uː")) {
            let followingVowels = word.vowels.filter(v => v.idx > segment.idx);
            if (followingVowels.length > 1 && followingVowels.some(v => v.value.length > 1 || v.ctxMatch("_C,C"))) {
                segment.value = segment.value.slice(0, -1);
                if (segment.value.startsWith("ɑ"))
                    segment.value = "ɜ";
                else if (segment.value.startsWith("e"))
                    segment.value = "i";
                else if (segment.value.startsWith("o"))
                    segment.value = "u";
            }
        }
    });

    word.forEach(segment => {
        if (segment.match("V[nasalized]", "_b/bʱ"))
            segment.relIdx(1).value = "m" + segment.relIdx(1).value.slice(1);

        if (segment.match("m", "_b/bʱ")) {
            segment.relIdx(1).value = "m" + segment.relIdx(1).value.slice(1);
            segment.remove();
        }
    });

    word.replace("V", "[nasalized]", "_m/mʱ/n/nʱ/ɳ/ɲ/ŋ,C/#");

    word.replace("mʱ nʱ", "m n", "_C/#");

    word.replace("ʋ", "w", "#,C_");

    word.insert("j", "i_V");

    word.replace("i", "ɪ", "_[!=j]");
    word.replace("u", "ʊ");

    word.replace("ɜɪ̯ ɜʊ̯", "ɛː ɔː");

    word.replace("ɜ", "ɛ", "_ɦ,ɜ/C/#");
    word.replace("ɜ", "ɛ", "ɛ,ɦ_");
    word.replace("ɜ", "ɔ", "_ɦ,ʊ");
    word.replace("ʊ", "ɔ", "_ɦ,ɜ");
    word.replace("ɜ/ʊ", "ɔ", "ɔ,ɦ_");

    word.replace("ɑː", "aː");

    if (variety == "urdu")
        word.replace("j ʋ", "eː[type=vowel] oː[type=vowel]", "V_C/#");

    if (variety == "urdu")
        addRow("ModUr", "Modern Urdu", "", getSpelling_ModUr(), word);
    else
        addRow("ModH", "Modern Hindi", "", getSpelling_ModH(), word);
}

function getSpelling_EPr() {
    let str = "";

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);

        if (segment.match("C[!=m/n/ɳ/ɲ/ŋ]") && segment.value == segment.relIdx(1).value[0])
            continue;

        //Virama
        if (segment.match("C", "C_") && segment.value[0] != segment.relIdx(-1).value && str.at(-1) != "\uDC01")
            str += "\uD804\uDC46";

        switch (segment.value) {
            case "ɜ":
                if (!segment.ctxMatch("C_"))
                    str += "𑀅";
                break;
            case "ɑː":
                if (segment.ctxMatch("C_"))
                    str += "\uD804\uDC38";
                else
                    str += "𑀆";
                break;
            case "i":
                if (segment.ctxMatch("C_"))
                    str += "\uD804\uDC3A";
                else
                    str += "𑀇";
                break;
            case "iː":
                if (segment.ctxMatch("C_"))
                    str += "\uD804\uDC3B";
                else
                    str += "𑀈";
                break;
            case "u":
                if (segment.ctxMatch("C_"))
                    str += "\uD804\uDC3C";
                else
                    str += "𑀉";
                break;
            case "uː":
                if (segment.ctxMatch("C_"))
                    str += "\uD804\uDC3D";
                else
                    str += "𑀊";
                break;
            case "eː":
            case "e":
                if (segment.ctxMatch("C_"))
                    str += "\uD804\uDC42";
                else
                    str += "𑀉";
                break;
            case "oː":
            case "o":
                if (segment.ctxMatch("C_"))
                    str += "\uD804\uDC44";
                else
                    str += "𑀑";
                break;
            case "k":
                str += "𑀓";
                break;
            case "kʰ":
                str += "𑀔";
                break;
            case "g":
                str += "𑀕";
                break;
            case "gʱ":
                str += "𑀖";
                break;
            case "ŋ":
                if (!segment.ctxMatch("_V/ɦ"))
                    str += "\uD804\uDC01";
                else
                    str += "𑀗";
                break;
            case "t͡ɕ":
                str += "𑀘";
                break;
            case "t͡ɕʰ":
                str += "𑀙";
                break;
            case "d͡ʑ":
                str += "𑀚";
                break;
            case "d͡ʑʱ":
                str += "𑀛";
                break;
            case "ɲ":
                if (!segment.ctxMatch("_V/ɦ"))
                    str += "\uD804\uDC01";
                else
                    str += "𑀜";
                break;
            case "ʈ":
                str += "𑀝";
                break;
            case "ʈʰ":
                str += "𑀞";
                break;
            case "ɖ":
                str += "𑀟";
                break;
            case "ɖʱ":
                str += "𑀠";
                break;
            case "ɳ":
                if (!segment.ctxMatch("_V/ɦ"))
                    str += "\uD804\uDC01";
                else
                    str += "𑀡";
                break;
            case "t":
                str += "𑀢";
                break;
            case "tʰ":
                str += "𑀣";
                break;
            case "d":
                str += "𑀤";
                break;
            case "dʱ":
                str += "𑀥";
                break;
            case "n":
                if (!segment.ctxMatch("_V/ɦ"))
                    str += "\uD804\uDC01";
                else
                    str += "𑀦";
                break;
            case "p":
                str += "𑀧";
                break;
            case "pʰ":
                str += "𑀨";
                break;
            case "b":
                str += "𑀩";
                break;
            case "bʱ":
                str += "𑀪";
                break;
            case "m":
                if (!segment.ctxMatch("_V/ɦ"))
                    str += "\uD804\uDC01";
                else
                    str += "𑀫";
                break;
            case "j":
                str += "𑀬";
                break;
            case "ɾ":
                str += "𑀭";
                break;
            case "l":
                str += "𑀮";
                break;
            case "ʋ":
                str += "𑀯";
                break;
            case "s":
                str += "𑀲";
                break;
            case "ɦ":
                str += "𑀳";
                break;
        }

        if (segment.nasalized)
            str += "\uD804\uDC01";
    }

    return str;
}

function getSpelling_ShPr() {
    let str = "";

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);

        if (segment.match("m/n/l/ɾ") && segment.relIdx(1).value == segment.value + "ʱ")
            continue;

        //Virama
        if (segment.match("C[!=mʱ/nʱ/lʱ/ɾʱ]") && segment.value[0] == segment.relIdx(-1).value)
            str += "\uD804\uDC46";

        switch (segment.value) {
            case "ɜ":
                if (segment.ctxMatch("#/V/j_"))
                    str += "𑀅";
                break;
            case "ɑː":
                if (segment.ctxMatch("C[!=j]_"))
                    str += "\uD804\uDC38";
                else
                    str += "𑀆";
                break;
            case "i":
                if (segment.ctxMatch("C[!=j]_"))
                    str += "\uD804\uDC3A";
                else
                    str += "𑀇";
                break;
            case "iː":
                if (segment.ctxMatch("C[!=j]_"))
                    str += "\uD804\uDC3B";
                else
                    str += "𑀈";
                break;
            case "u":
                if (segment.ctxMatch("C[!=j]_"))
                    str += "\uD804\uDC3C";
                else
                    str += "𑀉";
                break;
            case "uː":
                if (segment.ctxMatch("C[!=j]_"))
                    str += "\uD804\uDC3D";
                else
                    str += "𑀊";
                break;
            case "eː":
            case "e":
                if (segment.ctxMatch("C[!=j]_"))
                    str += "\uD804\uDC42";
                else
                    str += "𑀉";
                break;
            case "oː":
            case "o":
                if (segment.ctxMatch("C[!=j]_"))
                    str += "\uD804\uDC44";
                else
                    str += "𑀑";
                break;
            case "m":
                if (!segment.ctxMatch("_V/ɦ/m"))
                    str += "\uD804\uDC01";
                else
                    str += "𑀫";
                break;
            case "mʱ":
                str += "𑀫𑁆𑀳";
                break;
            case "n":
            case "ɳ":
            case "ɲ":
            case "ŋ":
                if (!segment.ctxMatch("_V/ɦ/n"))
                    str += "\uD804\uDC01";
                else
                    str += "𑀡";
                break;
            case "nʱ":
                str += "𑀦𑁆𑀳";
                break;
            case "k":
                str += "𑀓";
                break;
            case "kʰ":
                str += "𑀔";
                break;
            case "g":
                str += "𑀕";
                break;
            case "gʱ":
                str += "𑀖";
                break;
            case "t͡ʃ":
                str += "𑀘";
                break;
            case "t͡ʃʰ":
                str += "𑀙";
                break;
            case "d͡ʒ":
                str += "𑀚";
                break;
            case "d͡ʒʱ":
                str += "𑀛";
                break;
            case "ʈ":
                str += "𑀝";
                break;
            case "ʈʰ":
                str += "𑀞";
                break;
            case "ɖ":
            case "ɽ":
                str += "𑀟";
                break;
            case "ɖʱ":
            case "ɽʱ":
                str += "𑀠";
                break;
            case "t":
                if (segment.ctxMatch("_t͡ʃ/t͡ʃʰ"))
                    str += "𑀘";
                else
                    str += "𑀢";
                break;
            case "tʰ":
                str += "𑀣";
                break;
            case "d":
                if (segment.ctxMatch("_d͡ʒ/d͡ʒʱ"))
                    str += "𑀚";
                else
                    str += "𑀤";
                break;
            case "dʱ":
                str += "𑀥";
                break;
            case "p":
                str += "𑀧";
                break;
            case "pʰ":
                str += "𑀨";
                break;
            case "b":
                str += "𑀩";
                break;
            case "bʱ":
                str += "𑀪";
                break;
            case "ɾ":
                str += "𑀭";
                break;
            case "ɾʱ":
                str += "𑀭𑁆𑀳";
                break;
            case "l":
                str += "𑀮";
                break;
            case "lʱ":
                str += "𑀮𑁆𑀳";
                break;
            case "ʋ":
                str += "𑀯";
                break;
            case "s":
                str += "𑀲";
                break;
            case "ɦ":
                str += "𑀳";
                break;
        }

        if (segment.nasalized)
            str += "\uD804\uDC01";
    }

    return str;
}

function getSpelling_Apa() {
    let str = "";

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);

        if (segment.match("m/n/l/ɾ") && segment.relIdx(1).value == segment.value + "ʱ")
            continue;

        //Virama
        if (segment.match("C[!=mʱ/nʱ/lʱ/ɾʱ]") && segment.value[0] == segment.relIdx(-1).value)
            str += "\uD805\uDDBF";

        switch (segment.value) {
            case "ɜ":
                if (segment.ctxMatch("#/V/j_"))
                    str += "𑖀";
                break;
            case "ɑː":
                if (segment.ctxMatch("C[!=j]_"))
                    str += "\uD805\uDDAF";
                else
                    str += "𑖁";
                break;
            case "i":
                if (segment.ctxMatch("C[!=j]_"))
                    str += "\uD805\uDDB0";
                else
                    str += "𑖂";
                break;
            case "iː":
                if (segment.ctxMatch("C[!=j]_"))
                    str += "\uD805\uDDB1";
                else
                    str += "𑖃";
                break;
            case "u":
                if (segment.ctxMatch("C[!=j]_"))
                    str += "\uD805\uDDB2";
                else
                    str += "𑖄";
                break;
            case "uː":
                if (segment.ctxMatch("C[!=j]_"))
                    str += "\uD805\uDDB3";
                else
                    str += "𑖅";
                break;
            case "eː":
            case "e":
                if (segment.ctxMatch("C[!=j]_"))
                    str += "\uD805\uDDB8";
                else
                    str += "𑖊";
                break;
            case "oː":
            case "o":
                if (segment.ctxMatch("C[!=j]_"))
                    str += "\uD805\uDDBA";
                else
                    str += "𑖌";
                break;
            case "m":
                if (!segment.ctxMatch("_V/ɦ/m"))
                    str += "\uD805\uDDBD";
                else
                    str += "𑖦";
                break;
            case "mʱ":
                str += "𑖦𑖿𑖮";
                break;
            case "n":
            case "ɳ":
            case "ɲ":
            case "ŋ":
                if (!segment.ctxMatch("_V/ɦ/n"))
                    str += "\uD805\uDDBD";
                else
                    str += "𑖜";
                break;
            case "nʱ":
                str += "𑖜𑖿𑖮";
                break;
            case "k":
                str += "𑖎";
                break;
            case "kʰ":
                str += "𑖏";
                break;
            case "g":
                str += "𑖐";
                break;
            case "gʱ":
                str += "𑖑";
                break;
            case "t͡ʃ":
                str += "𑖓";
                break;
            case "t͡ʃʰ":
                str += "𑖔";
                break;
            case "d͡ʒ":
                str += "𑖕";
                break;
            case "d͡ʒʱ":
                str += "𑖖";
                break;
            case "ʈ":
                str += "𑖘";
                break;
            case "ʈʰ":
                str += "𑖙";
                break;
            case "ɖ":
            case "ɽ":
                str += "𑖚";
                break;
            case "ɖʱ":
            case "ɽʱ":
                str += "𑖛";
                break;
            case "t":
                if (segment.ctxMatch("_t͡ʃ/t͡ʃʰ"))
                    str += "𑖓";
                else
                    str += "𑖝";
                break;
            case "tʰ":
                str += "𑖞";
                break;
            case "d":
                if (segment.ctxMatch("_d͡ʒ/d͡ʒʱ"))
                    str += "𑖕";
                else
                    str += "𑖟";
                break;
            case "dʱ":
                str += "𑖠";
                break;
            case "p":
                str += "𑖢";
                break;
            case "pʰ":
                str += "𑖣";
                break;
            case "b":
                str += "𑖤";
                break;
            case "bʱ":
                str += "𑖥";
                break;
            case "ɾ":
                str += "𑖨";
                break;
            case "ɾʱ":
                str += "𑖨𑖿𑖮";
                break;
            case "l":
                str += "𑖩";
                break;
            case "lʱ":
                str += "𑖩𑖿𑖮";
                break;
            case "ʋ":
            case "ʋ̃":
                str += "𑖪";
                break;
            case "s":
                str += "𑖭";
                break;
            case "ɦ":
                str += "𑖮";
                break;
        }

        if (segment.nasalized)
            str += "\uD805\uDDBD";
    }

    return str;
}

function getSpelling_OH_devanagari() {
    let str = "";

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);

        switch (segment.value) {
            case "ɜ":
                if (!segment.ctxMatch("C_"))
                    str += "अ";
                break;
            case "i":
                if (segment.ctxMatch("C_"))
                    str += "\u093F";
                else
                    str += "इ";
                break;
            case "u":
                if (segment.ctxMatch("C_"))
                    str += "\u0941";
                else
                    str += "उ";
                break;
            case "ɑː":
                if (segment.ctxMatch("C_"))
                    str += "\u093E";
                else
                    str += "आ";
                break;
            case "ɜɪ̯":
                if (segment.ctxMatch("C_"))
                    str += "\u0948";
                else
                    str += "ऐ";
                break;
            case "eː":
                if (segment.ctxMatch("C_"))
                    str += "\u0947";
                else
                    str += "ए";
                break;
            case "iː":
                if (segment.ctxMatch("C_"))
                    str += "\u0940";
                else
                    str += "ई";
                break;
            case "ɜʊ̯":
                if (segment.ctxMatch("C_"))
                    str += "\u094C";
                else
                    str += "औ";
                break;
            case "oː":
                if (segment.ctxMatch("C_"))
                    str += "\u094B";
                else
                    str += "ओ";
                break;
            case "uː":
                if (segment.ctxMatch("C_"))
                    str += "\u0942";
                else
                    str += "ऊ";
                break;
            case "m":
                if (segment.ctxMatch("V_C[!=j/ʋ]"))
                    str += "\u0902";
                else
                    str += "म";
                break;
            case "mʱ":
                str += "म्ह";
                break;
            case "n":
            case "ɳ":
            case "ɲ":
            case "ŋ":
                if (segment.ctxMatch("V_C[!=j/ʋ]"))
                    str += "\u0902";
                else
                    str += "न";
                break;
            case "nʱ":
                str += "न्ह";
                break;
            case "k":
                str += "क";
                break;
            case "kʰ":
                str += "ख";
                break;
            case "g":
                str += "ग";
                break;
            case "gʱ":
                str += "घ";
                break;
            case "t͡ʃ":
                str += "च";
                break;
            case "t͡ʃʰ":
                str += "छ";
                break;
            case "d͡ʒ":
                str += "ज";
                break;
            case "d͡ʒʱ":
                str += "झ";
                break;
            case "ʈ":
                str += "ट";
                break;
            case "ʈʰ":
                str += "ठ";
                break;
            case "ɖ":
            case "ɽ":
                str += "ड";
                break;
            case "ɖʱ":
            case "ɽʱ":
                str += "ढ";
                break;
            case "t":
                str += "त";
                break;
            case "tʰ":
                str += "थ";
                break;
            case "d":
                str += "द";
                break;
            case "dʱ":
                str += "ध";
                break;
            case "p":
                str += "प";
                break;
            case "pʰ":
                str += "फ";
                break;
            case "b":
                str += "ब";
                break;
            case "bʱ":
                str += "भ";
                break;
            case "j":
                if (segment.ctxMatch("C_"))
                    str += "\u094D";
                str += "य";
                break;
            case "ɾ":
                str += "र";
                break;
            case "ɾʱ":
                str += "र्ह";
                break;
            case "l":
                str += "ल";
                break;
            case "lʱ":
                str += "ल्ह";
                break;
            case "ʋ":
                if (segment.ctxMatch("C_"))
                    str += "\u094D";
                str += "व";
                break;
            case "s":
                str += "स";
                break;
            case "ɦ":
                str += "ह";
                break;
        }

        if (segment.nasalized)
            str += "\u0902";
    }

    return str;
}

function getSpelling_OH_persian() {
    let str = "";

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);

        switch (segment.value) {
            case "ɜ":
                if (segment.idx == 0)
                    str += "ا";
                break;
            case "i":
                if (segment.idx == 0)
                    str += "ا";
                else if (segment.ctxMatch("_V"))
                    str += "ی";
                break;
            case "u":
                if (segment.idx == 0)
                    str += "ا";
                else if (segment.ctxMatch("_V"))
                    str += "و";
                break;
            case "ɑː":
                if (segment.idx == 0)
                    str += "آ";
                else
                    str += "ا";
                break;
            case "ɜɪ̯":
            case "eː":
                if (segment.nasalized && segment.ctxMatch("V[!=i]_"))
                    str += "ئ";
                else if (segment.nasalized)
                    str += "ی";
                else if (segment.ctxMatch("V[!=i]_#"))
                    str += "ئے";
                else if (segment.ctxMatch("_#"))
                    str += "ے";
                else
                    str += "ی";
                break;
            case "iː":
                if (segment.ctxMatch("V[!=i]_"))
                    str += "ئ";
                str += "ی";
                break;
            case "ɜʊ̯":
            case "oː":
            case "uː":
                if (segment.ctxMatch("V[!=u]_"))
                    str += "ؤ";
                else
                    str += "و";
                break;
            case "m":
                str += "م";
                break;
            case "mʱ":
                str += "مھ";
                break;
            case "n":
            case "ɳ":
            case "ɲ":
            case "ŋ":
                str += "ن";
                break;
            case "nʱ":
                str += "نھ";
                break;
            case "k":
                str += "ک";
                break;
            case "kʰ":
                str += "کھ";
                break;
            case "g":
                str += "گ";
                break;
            case "gʱ":
                str += "گھ";
                break;
            case "t͡ʃ":
                str += "چ";
                break;
            case "t͡ʃʰ":
                str += "چھ";
                break;
            case "d͡ʒ":
                str += "ج";
                break;
            case "d͡ʒʱ":
                str += "جھ";
                break;
            case "ʈ":
                str += "ٿ";
                break;
            case "ʈʰ":
                str += "ٿھ";
                break;
            case "ɖ":
            case "ɽ":
                str += "ڐ";
                break;
            case "ɖʱ":
            case "ɽʱ":
                str += "ڐھ";
                break;
            case "t":
                str += "ت";
                break;
            case "tʰ":
                str += "تھ";
                break;
            case "d":
                str += "د";
                break;
            case "dʱ":
                str += "دھ";
                break;
            case "p":
                str += "پ";
                break;
            case "pʰ":
                str += "پھ";
                break;
            case "b":
                str += "ب";
                break;
            case "bʱ":
                str += "بھ";
                break;
            case "j":
                if (segment.ctxMatch("V_#"))
                    str += "ئے";
                else if (segment.ctxMatch("V_C"))
                    str += "ئ";
                else
                    str += "ی";
                break;
            case "ɾ":
                str += "ر";
                break;
            case "ɾʱ":
                str += "رھ";
                break;
            case "l":
                str += "ل";
                break;
            case "lʱ":
                str += "لھ";
                break;
            case "ʋ":
                if (segment.ctxMatch("V_C/#"))
                    str += "ؤ";
                else
                    str += "و";
                break;
            case "s":
                str += "س";
                break;
            case "ɦ":
                str += "ہ";
                break;
        }

        if (segment.nasalized) {
            if (segment.ctxMatch("_#"))
                str += "ں";
            else
                str += "ن";
        }
    }

    return str;
}

function getSpelling_ModH() {
    let str = "";

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);

        switch (segment.value) {
            case "ɜ":
            case "ɛ":
            case "ɔ":
                if (!segment.ctxMatch("C_"))
                    str += "अ";
                break;
            case "ɪ":
            case "i":
                if (segment.ctxMatch("C_"))
                    str += "\u093F";
                else
                    str += "इ";
                break;
            case "ʊ":
                if (segment.ctxMatch("C_"))
                    str += "\u0941";
                else
                    str += "उ";
                break;
            case "aː":
                if (segment.ctxMatch("C_"))
                    str += "\u093E";
                else
                    str += "आ";
                break;
            case "ɛː":
                if (segment.ctxMatch("C_"))
                    str += "\u0948";
                else
                    str += "ऐ";
                break;
            case "eː":
                if (segment.ctxMatch("C_"))
                    str += "\u0947";
                else
                    str += "ए";
                break;
            case "iː":
                if (segment.ctxMatch("C_"))
                    str += "\u0940";
                else
                    str += "ई";
                break;
            case "ɔː":
                if (segment.ctxMatch("C_"))
                    str += "\u094C";
                else
                    str += "औ";
                break;
            case "oː":
                if (segment.ctxMatch("C_"))
                    str += "\u094B";
                else
                    str += "ओ";
                break;
            case "uː":
                if (segment.ctxMatch("C_"))
                    str += "\u0942";
                else
                    str += "ऊ";
                break;
            case "m":
                if (segment.ctxMatch("V_C[!=j/ʋ]") && !segment.droppedSchwa)
                    str += "\u0902";
                else
                    str += "म";
                break;
            case "mʱ":
                str += "म्ह";
                break;
            case "n":
            case "ɳ":
            case "ɲ":
            case "ŋ":
                if (segment.ctxMatch("V_C[!=j/ʋ]") && !segment.droppedSchwa)
                    str += "\u0902";
                else
                    str += "न";
                break;
            case "nʱ":
                str += "न्ह";
                break;
            case "k":
                str += "क";
                break;
            case "kʰ":
                str += "ख";
                break;
            case "g":
                str += "ग";
                break;
            case "gʱ":
                str += "घ";
                break;
            case "t͡ʃ":
                str += "च";
                break;
            case "t͡ʃʰ":
                str += "छ";
                break;
            case "d͡ʒ":
                str += "ज";
                break;
            case "d͡ʒʱ":
                str += "झ";
                break;
            case "ʈ":
                str += "ट";
                break;
            case "ʈʰ":
                str += "ठ";
                break;
            case "ɖ":
                str += "ड";
                break;
            case "ɽ":
                str += "ड़";
                break;
            case "ɖʱ":
                str += "ढ";
                break;
            case "ɽʱ":
                str += "ढ़";
                break;
            case "t":
                str += "त";
                break;
            case "tʰ":
                str += "थ";
                break;
            case "d":
                str += "द";
                break;
            case "dʱ":
                str += "ध";
                break;
            case "p":
                str += "प";
                break;
            case "pʰ":
                str += "फ";
                break;
            case "b":
                str += "ब";
                break;
            case "bʱ":
                str += "भ";
                break;
            case "j":
                if (segment.ctxMatch("C_") && !segment.relIdx(-1).droppedSchwa)
                    str += "\u094D";
                str += "य";
                break;
            case "ɾ":
                str += "र";
                break;
            case "ɾʱ":
                str += "र्ह";
                break;
            case "l":
                str += "ल";
                break;
            case "lʱ":
                str += "ल्ह";
                break;
            case "ʋ":
            case "w":
                if (segment.ctxMatch("C_") && !segment.relIdx(-1).droppedSchwa)
                    str += "\u094D";
                str += "व";
                break;
            case "s":
                str += "स";
                break;
            case "ɦ":
                str += "ह";
                break;
        }

        if (segment.nasalized && !segment.ctxMatch("_m/n/ɳ/ɲ/ŋ")) {
            if (segment.match("ɪ/iː/eː/ɛː/oː/ɔː", "C_") || segment.match("iː/ɛː/oː/ɔː", "#/V_"))
                str += "\u0902";
            else
                str += "\u0901";
        }
    }

    return str;
}

function getSpelling_ModUr() {
    let str = "";

    let finalNoonGhunna = false;

    for (let i = 0; i < word.length; i++) {
        let segment = word.atIdx(i);

        switch (segment.value) {
            case "ɜ":
            case "ɛ":
            case "ɔ":
            case "ɪ":
            case "i":
                if (segment.idx == 0)
                    str += "ا";
                break;
            case "ʊ":
                if (segment.idx == 0)
                    str += "ا";
                else if (segment.ctxMatch("_V"))
                    str += "و";
                break;
            case "aː":
                if (segment.idx == 0)
                    str += "آ";
                else
                    str += "ا";
                break;
            case "ɛː":
            case "eː":
                if (segment.nasalized && segment.ctxMatch("V_"))
                    str += "ئ";
                else if (segment.nasalized)
                    str += "ی";
                else if (segment.ctxMatch("V_#"))
                    str += "ئے";
                else if (segment.ctxMatch("_#"))
                    str += "ے";
                else
                    str += "ی";
                break;
            case "iː":
                if (segment.ctxMatch("V_"))
                    str += "ئ";
                str += "ی";
                break;
            case "ɔː":
            case "oː":
            case "uː":
                if (segment.ctxMatch("V[!=ʊ]_"))
                    str += "ؤ";
                else
                    str += "و";
                break;
            case "m":
                str += "م";
                break;
            case "mʱ":
                str += "مھ";
                break;
            case "n":
            case "ɳ":
            case "ɲ":
            case "ŋ":
                str += "ن";
                break;
            case "nʱ":
                str += "نھ";
                break;
            case "k":
                str += "ک";
                break;
            case "kʰ":
                str += "کھ";
                break;
            case "g":
                str += "گ";
                break;
            case "gʱ":
                str += "گھ";
                break;
            case "t͡ʃ":
                str += "چ";
                break;
            case "t͡ʃʰ":
                str += "چھ";
                break;
            case "d͡ʒ":
                str += "ج";
                break;
            case "d͡ʒʱ":
                str += "جھ";
                break;
            case "ʈ":
                str += "ٹ";
                break;
            case "ʈʰ":
                str += "ٹھ";
                break;
            case "ɖ":
                str += "ڈ";
                break;
            case "ɽ":
                str += "ڑ";
                break;
            case "ɖʱ":
                str += "ڈھ";
                break;
            case "ɽʱ":
                str += "ڑھ";
                break;
            case "t":
                str += "ت";
                break;
            case "tʰ":
                str += "تھ";
                break;
            case "d":
                str += "د";
                break;
            case "dʱ":
                str += "دھ";
                break;
            case "p":
                str += "پ";
                break;
            case "pʰ":
                str += "پھ";
                break;
            case "b":
                str += "ب";
                break;
            case "bʱ":
                str += "بھ";
                break;
            case "j":
                str += "ی";
                break;
            case "ɾ":
                str += "ر";
                break;
            case "ɾʱ":
                str += "رھ";
                break;
            case "l":
                str += "ل";
                break;
            case "lʱ":
                str += "لھ";
                break;
            case "ʋ":
            case "w":
                str += "و";
                break;
            case "s":
                str += "س";
                break;
            case "ɦ":
                str += "ہ";
                break;
        }

        if (segment.nasalized && !segment.ctxMatch("_m/n/ɳ/ɲ/ŋ")) {
            if (segment.ctxMatch("_#"))
                str += "ں";
            else if (segment.ctxMatch("_V/j/ʋ,#"))
                finalNoonGhunna = true;
            else
                str += "ن";
        }
    }

    if (finalNoonGhunna)
        str += "ں";

    return str;
}