# Evolvinator
This program applies phonological changes to predict the development of historical words. You can try it [here](https://oiroizoi.github.io/evolvinator/).

## Available languages
<table>
    <tr>
        <th>Input</th>
        <th>Output</th>
    </tr>
    <tr>
        <td>Ancient Greek</td>
        <td>Modern Greek</td>
    </tr>
    <tr>
        <td rowspan=4>Classical Latin</td>
        <td>Modern French</td>
    </tr>
    <tr>
        <td>Modern Italian</td>
    </tr>
    <tr>
        <td>Modern Portuguese</td>
    </tr>
    <tr>
        <td>Modern Spanish</td>
    </tr>
    <tr>
        <td rowspan=2>Old English</td>
        <td>Modern English</td>
    </tr>
    <tr>
        <td>Modern Scots</td>
    </tr>
</table>

More languages coming soon!

## Input instructions

### Ancient Greek
- Enter an Ancient Greek word. You can enter the original word or its romanization. (Greek-script inputs will be automatically converted to Latin-script).
- Mark all long vowels and accents. If a diphthong or vowel digraph is accented, the accent mark should go on the second element (e.g., "āí", "oû").
- Use a dieresis (¨) to indicate that an "i" or "y" is pronounced separately from the preceding vowel.
- Choose the appropriate part of speech.

### Classical Latin
- Enter a Latin word, marking all long vowels with macrons.
- Use "u" for the vowel /u/ and "v" for the consonant /w/.
- Use "i" for both the vowel /i/ and the consonant /j/. Its phonetic value will be determined based on its position. (These sounds contrasted in Classical Latin, but the difference is unimportant in the development of the Romance Languages).
- Choose the appropriate part of speech.
- Note that most words in the Romance languages derive from Latin accusative forms (e.g., "canem", not "canis").

### Old English
- Enter an Old English word, using standard diacritics (i.e., dots for palatalization and macrons for long vowels).
- If the Old English word's spelling does not reflect its pronunciation, modify your input to match the pronunciation. For example, enter "ġung" for _geong_ [juŋg].
- Select the syllable on which the primary stress falls.
- Choose the appropriate part of speech. For present participles, select "Conjugated verb".
- Predicted outcomes are more accurate for single-stem words than for compounds. For better results, enter each component of a compound word separately.

## Other notes
- You can click on the "Expected outcomes" header to see more information, including additional steps in the word's development and outcomes in other dialects.
- Words appear approximately as they would have been written at the time. You can select "Use modern typography" to show the words with modern letterforms instead.
- In many cases, spellings and pronunciations have varied greatly by region and individual. The ones shown are only representative examples.
- Results will not always be accurate. Incorrect predictions may be due to unexpected word developments or flaws in the program.
- If you find a bug or have other feedback, please [create an issue](https://github.com/Oiroizoi/evolvinator/issues/new)!

## Example inputs
These examples demonstrate the form of valid inputs as well as some of the major developments of the daughter languages.

### Ancient Greek
- ángelos ("messegner, angel", Noun)
- bréchei ("he/she wets, it rains", Verb)
- déndron ("tree", Noun)
- ekbaínō ("I go out", Verb)
- elégomen ("we said", Verb)
- ennéa ("nine", Other)
- gráphō ("I draw, I write", Verb)
- hērōïkós ("heroic", Other)
- hyiós ("son", Noun)
- kardía ("heart", Noun)
- nýmphē ("bride", Noun)
- ouranós ("sky, heaven", Noun)
- paidíon ("little child", Noun)
- polloí ("many", Other)
- psȳchḗ ("soul")
- pterón ("wing, feather", Noun)
- rhíza ("root", Noun)
- thálassa ("sea", Noun)

### Classical Latin
- adiūtāre ("to help", Infinitive verb)
- audīre ("to hear", Infinitive verb)
- cantō ("I sing", Conjugated verb)
- caelum ("sky, heaven", Noun)
- carcerem ("prison", Noun)
- cāseum ("cheese", Noun)
- duōs ("two", Other)
- falsum ("deceived, false", Other)
- fēcī ("I did", Conjugated verb)
- fēminās ("women", Noun)
- flammam ("flame", Noun)
- īnsulam ("island", Noun)
- locum ("place", Noun)
- mōnstrāre ("to show", Infinitive verb)
- nitidum ("shining", Other)
- novum ("new", Other)
- oculōs ("eyes", Noun)
- parabolam ("comparison, parable, word", Noun)
- quattuor ("four", Other)
- ratiōnem ("reason, calculation", Noun)
- signum ("sign", Noun)
- solvere ("to loosen, to solve", Infinitive verb)
- strictum ("tightened", Other)
- undecim ("eleven", Other)
- vēritātem ("truth", Noun)

### Old English
All words are stressed on the first syllable unless otherwise noted.
- ǣfre ("ever", Other)
- æppel ("apple", Noun)
- āsċamod ("ashamed", Past participle, 2nd syllable stressed)
- bāt ("boat", Noun)
- blētsian ("to bless", Infinitive verb)
- boga ("bow", Noun)
- bryċġe ("bridge", Noun)
- ċiriċe ("church", Noun)
- cnīfas ("knives", Noun)
- cwiculīċe ("quickly", Other)
- drincþ ("drinks", Conjugated Verb)
- flēoge ("fly", Noun)
- folgian ("to follow", Infinitive verb)
- ġēar ("year", Noun)
- ġeboren ("born", Past participle, 2nd syllable stressed)
- ġeolwe ("yellow", Other)
- ġeþōht ("thought", Noun, 2nd syllable stressed)
- hāliġ ("holy", Other)
- hræfn ("raven", Noun)
- hundas ("dogs", Noun)
- hwēol ("wheel", Noun)
- lōcian ("to look", Infinitive verb)
- mȳs ("mice", Noun)
- plegodon ("played (plural)", Conjugated verb)
- sihþ ("sight", Noun)
- sneġel ("snail, slug", Noun)
- steorra ("star", Noun)
- ūle ("owl", Noun)
- weorold ("world", Noun)
- wrist ("wrist", Noun)

## Main sources
- [Phonological history of English](https://en.wikipedia.org/wiki/Phonological_history_of_English)
- [englesaxe](https://adoneilson.com/eme/index.html)
- [A History of Scots to 1700](https://web.archive.org/web/20140703144921fw_/http://www.dsl.ac.uk/dsl/SCOTSHIST/index.html)
- [The Edinburgh History of the Scots Language](https://openlibrary.org/books/OL453735M/The_Edinburgh_history_of_the_Scots_language)
- [From Latin to Modern French with Especial Consideration of Anglo-Norman](https://archive.org/details/fromlatintomoder0000unse)
- [Phonological history of French](https://en.wikipedia.org/wiki/Phonological_history_of_French)
- [From Latin to Italian](https://archive.org/details/fromlatintoitali0000unse)
- [A Linguistic History of Italian](https://www.google.com/books/edition/A_Linguistic_History_of_Italian/DwTKAwAAQBAJ?hl=en)
- [From Latin to Portuguese](https://hdl.handle.net/2027/mdp.39015034652472)
- [From Latin to Spanish](https://www.google.com/books/edition/From_Latin_to_Spanish_Historical_phonolo/_QkNAAAAIAAJ?hl=en)
- [Greek: A History of Language and Its Speakers](https://openlibrary.org/works/OL17197733W/Greek?edition=key%3A/books/OL25769450M)
- [Ranieri's Greek Pronunciation Chronology](https://docs.google.com/spreadsheets/d/1fv46XgPPJy-ky9FUSApiemOVmtc8i6q7ZL5XkqtmMWA/edit?gid=1919026778#gid=1919026778)

### Historical fonts used
- [Pfeffer Mediæval](https://robert-pfeffer.net/schriftarten/englisch/pfeffer_mediaeval.html)
- [Pfeffer Simpelgotisch](https://robert-pfeffer.net/schriftarten/englisch/pfeffer_simpelgotisch.html)
- [EB Garamond](https://fonts.google.com/specimen/EB+Garamond)
- [Cinzel](https://fonts.google.com/specimen/Cinzel)
- [Rustic Capitals](https://www.fontspace.com/rustic-capitals-font-f7460)
- [Stoix](https://www.dafont.com/stoix.font)
- [P39](http://individual.utoronto.ca/atloder/uncialfonts.html)
- [0800 Theophanes](https://web.archive.org/web/20240529071259/http://www.sch%C3%A4ffel.ch/de_gruppe1.html)