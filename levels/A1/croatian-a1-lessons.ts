import { MultilingualLesson, MultilingualSkill, VocabularyItem, GrammarConcept, MultilingualContent } from '@/types';

// Croatian A1 Vocabulary Database
export const croatianA1Vocabulary: VocabularyItem[] = [
  // Greetings and Basic Phrases
  {
    id: 'hr_a1_001',
    word: 'zdravo',
    translation: 'hello', 
    phonetic: '/zdraːʋo/',
    pronunciation: '/zdraːʋo/',
    partOfSpeech: 'interjection',
    difficulty: 1,
    frequency: 10,
    imageUrl: 'https://example.com/images/hello.jpg',
    audioUrl: 'https://example.com/audio/hr/zdravo.mp3',
    exampleSentences: [
      {
        original: 'Zdravo, kako ste?',
        translation: 'Hello, how are you?',
        audioUrl: 'https://example.com/audio/hr/zdravo_kako_ste.mp3',
      },
    ],
    tags: ['greetings', 'basic', 'formal'],
    cefrLevel: 'A1',
    mastered: false,
  },
  {
    id: 'hr_a1_002',
    word: 'doviđenja',
    translation: 'goodbye',
    phonetic: '/doʋiɟeɲa/',
    pronunciation: '/doʋiɟeɲa/',
    partOfSpeech: 'interjection',
    difficulty: 1,
    frequency: 9,
    imageUrl: 'https://example.com/images/goodbye.jpg',
    audioUrl: 'https://example.com/audio/hr/dovidjenja.mp3',
    exampleSentences: [
      {
        original: 'Doviđenja, vidimo se sutra!',
        translation: 'Goodbye, see you tomorrow!',
        audioUrl: 'https://example.com/audio/hr/dovidjenja_sutra.mp3',
      },
    ],
    tags: ['greetings', 'basic'],
    cefrLevel: 'A1',
    mastered: false,
  },
  {
    id: 'hr_a1_003',
    word: 'hvala',
    translation: 'thank you',
    phonetic: '/xʋala/',
    pronunciation: '/xʋala/',
    partOfSpeech: 'interjection',
    difficulty: 1,
    frequency: 10,
    imageUrl: 'https://example.com/images/thank_you.jpg',
    audioUrl: 'https://example.com/audio/hr/hvala.mp3',
    exampleSentences: [
      {
        original: 'Hvala vam puno!',
        translation: 'Thank you very much!',
        audioUrl: 'https://example.com/audio/hr/hvala_puno.mp3',
      },
    ],
    tags: ['greetings', 'basic', 'polite'],
    cefrLevel: 'A1',
    mastered: false,
  },
  {
    id: 'hr_a1_004',
    word: 'molim',
    translation: 'please',
    phonetic: '/molim/',
    pronunciation: '/molim/',
    partOfSpeech: 'verb',
    difficulty: 1,
    frequency: 9,
    imageUrl: 'https://example.com/images/please.jpg',
    audioUrl: 'https://example.com/audio/hr/molim.mp3',
    exampleSentences: [
      {
        original: 'Molim vas, pomozite mi.',
        translation: 'Please, help me.',
        audioUrl: 'https://example.com/audio/hr/molim_pomozite.mp3',
      },
    ],
    tags: ['greetings', 'basic', 'polite'],
    cefrLevel: 'A1',
    mastered: false,
  },
  // Personal Pronouns
  {
    id: 'hr_a1_005',
    word: 'ja',
    translation: 'I',
    phonetic: '/ja/',
    pronunciation: '/ja/',
    partOfSpeech: 'pronoun',
    difficulty: 1,
    frequency: 10,
    audioUrl: 'https://example.com/audio/hr/ja.mp3',
    exampleSentences: [
      {
        original: 'Ja sam student.',
        translation: 'I am a student.',
        audioUrl: 'https://example.com/audio/hr/ja_sam_student.mp3',
      },
    ],
    tags: ['pronouns', 'basic'],
    cefrLevel: 'A1',
    mastered: false,
  },
  {
    id: 'hr_a1_006',
    word: 'ti',
    translation: 'you (informal)',
    phonetic: '/ti/',
    pronunciation: '/ti/',
    partOfSpeech: 'pronoun',
    difficulty: 1,
    frequency: 10,
    audioUrl: 'https://example.com/audio/hr/ti.mp3',
    exampleSentences: [
      {
        original: 'Ti si moj prijatelj.',
        translation: 'You are my friend.',
        audioUrl: 'https://example.com/audio/hr/ti_si_prijatelj.mp3',
      },
    ],
    tags: ['pronouns', 'basic', 'informal'],
    cefrLevel: 'A1',
    mastered: false,
  },
  {
    id: 'hr_a1_007',
    word: 'on',
    translation: 'he',
    phonetic: '/on/',
    pronunciation: '/on/',
    partOfSpeech: 'pronoun',
    difficulty: 1,
    frequency: 9,
    audioUrl: 'https://example.com/audio/hr/on.mp3',
    exampleSentences: [
      {
        original: 'On je doktor.',
        translation: 'He is a doctor.',
        audioUrl: 'https://example.com/audio/hr/on_je_doktor.mp3',
      },
    ],
    tags: ['pronouns', 'basic'],
    cefrLevel: 'A1',
    mastered: false,
  },
  {
    id: 'hr_a1_008',
    word: 'ona',
    translation: 'she',
    phonetic: '/ona/',
    pronunciation: '/ona/',
    partOfSpeech: 'pronoun',
    difficulty: 1,
    frequency: 9,
    audioUrl: 'https://example.com/audio/hr/ona.mp3',
    exampleSentences: [
      {
        original: 'Ona je učiteljica.',
        translation: 'She is a teacher.',
        audioUrl: 'https://example.com/audio/hr/ona_je_uciteljica.mp3',
      },
    ],
    tags: ['pronouns', 'basic'],
    cefrLevel: 'A1',
    mastered: false,
  },
  // Basic Verbs
  {
    id: 'hr_a1_009',
    word: 'biti',
    translation: 'to be',
    phonetic: '/biti/',
    pronunciation: '/biti/',
    partOfSpeech: 'verb',
    difficulty: 2,
    frequency: 10,
    audioUrl: 'https://example.com/audio/hr/biti.mp3',
    exampleSentences: [
      {
        original: 'Želim biti sretan.',
        translation: 'I want to be happy.',
        audioUrl: 'https://example.com/audio/hr/zelim_biti_sretan.mp3',
      },
    ],
    tags: ['verbs', 'basic', 'auxiliary'],
    cefrLevel: 'A1',
    mastered: false,
  },
  {
    id: 'hr_a1_010',
    word: 'imati',
    translation: 'to have',
    phonetic: '/imati/',
    pronunciation: '/imati/',
    partOfSpeech: 'verb',
    difficulty: 2,
    frequency: 10,
    audioUrl: 'https://example.com/audio/hr/imati.mp3',
    exampleSentences: [
      {
        original: 'Imam psa.',
        translation: 'I have a dog.',
        audioUrl: 'https://example.com/audio/hr/imam_psa.mp3',
      },
    ],
    tags: ['verbs', 'basic'],
    cefrLevel: 'A1',
    mastered: false,
  },
  // Family Members
  {
    id: 'hr_a1_011',
    word: 'majka',
    translation: 'mother',
    phonetic: '/majka/',
    pronunciation: '/majka/',
    partOfSpeech: 'noun',
    difficulty: 1,
    frequency: 8,
    imageUrl: 'https://example.com/images/mother.jpg',
    audioUrl: 'https://example.com/audio/hr/majka.mp3',
    exampleSentences: [
      {
        original: 'Moja majka je liječnica.',
        translation: 'My mother is a doctor.',
        audioUrl: 'https://example.com/audio/hr/moja_majka_lijecnica.mp3',
      },
    ],
    tags: ['family', 'basic'],
    cefrLevel: 'A1',
    mastered: false,
  },
  {
    id: 'hr_a1_012',
    word: 'otac',
    translation: 'father',
    phonetic: '/otats/',
    pronunciation: '/otats/',
    partOfSpeech: 'noun',
    difficulty: 1,
    frequency: 8,
    imageUrl: 'https://example.com/images/father.jpg',
    audioUrl: 'https://example.com/audio/hr/otac.mp3',
    exampleSentences: [
      {
        original: 'Moj otac radi u banki.',
        translation: 'My father works in a bank.',
        audioUrl: 'https://example.com/audio/hr/moj_otac_banka.mp3',
      },
    ],
    tags: ['family', 'basic'],
    cefrLevel: 'A1',
    mastered: false,
  },
  // Numbers 1-10
  {
    id: 'hr_a1_013',
    word: 'jedan',
    translation: 'one',
    phonetic: '/jedan/',
    pronunciation: '/jedan/',
    partOfSpeech: 'adjective',
    difficulty: 1,
    frequency: 9,
    audioUrl: 'https://example.com/audio/hr/jedan.mp3',
    exampleSentences: [
      {
        original: 'Imam jedan pas.',
        translation: 'I have one dog.',
        audioUrl: 'https://example.com/audio/hr/imam_jedan_pas.mp3',
      },
    ],
    tags: ['numbers', 'basic'],
    cefrLevel: 'A1',
    mastered: false,
  },
  {
    id: 'hr_a1_014',
    word: 'dva',
    translation: 'two',
    phonetic: '/dva/',
    pronunciation: '/dva/',
    partOfSpeech: 'adjective',
    difficulty: 1,
    frequency: 9,
    audioUrl: 'https://example.com/audio/hr/dva.mp3',
    exampleSentences: [
      {
        original: 'Imam dva brata.',
        translation: 'I have two brothers.',
        audioUrl: 'https://example.com/audio/hr/imam_dva_brata.mp3',
      },
    ],
    tags: ['numbers', 'basic'],
    cefrLevel: 'A1',
    mastered: false,
  },
  {
    id: 'hr_a1_015',
    word: 'tri',
    translation: 'three',
    phonetic: '/tri/',
    pronunciation: '/tri/',
    partOfSpeech: 'adjective',
    difficulty: 1,
    frequency: 8,
    audioUrl: 'https://example.com/audio/hr/tri.mp3',
    exampleSentences: [
      {
        original: 'Imam tri sestre.',
        translation: 'I have three sisters.',
        audioUrl: 'https://example.com/audio/hr/imam_tri_sestre.mp3',
      },
    ],
    tags: ['numbers', 'basic'],
    cefrLevel: 'A1',
    mastered: false,
  },
];

// Croatian A1 Grammar Concepts
export const croatianA1Grammar: GrammarConcept[] = [
  {
    id: 'hr_a1_gram_001',
    title: {
      en: 'Present Tense of "biti" (to be)',
      es: 'Presente del verbo "biti" (ser/estar)',
      fr: 'Présent du verbe "biti" (être)',
      it: 'Presente del verbo "biti" (essere)',
      hr: 'Sadašnje vrijeme glagola "biti"',
      zh: '"biti"（是）的现在时',
    },
    description: {
      en: 'Learn the conjugation of the most important Croatian verb "biti" (to be) in present tense.',
      es: 'Aprende la conjugación del verbo croata más importante "biti" (ser/estar) en presente.',
      fr: 'Apprenez la conjugaison du verbe croate le plus important "biti" (être) au présent.',
      it: 'Impara la coniugazione del verbo croato più importante "biti" (essere) al presente.',
      hr: 'Naučite konjugaciju najvažnijeg hrvatskog glagola "biti" u sadašnjem vremenu.',
      zh: '学习最重要的克罗地亚语动词"biti"（是）的现在时变位。',
    },
    examples: [
      {
        original: 'Ja sam student.',
        translation: 'I am a student.',
        explanation: {
          en: '"sam" is the first person singular form of "biti"',
          es: '"sam" es la forma de primera persona singular de "biti"',
          fr: '"sam" est la forme de première personne du singulier de "biti"',
          it: '"sam" è la forma della prima persona singolare di "biti"',
          hr: '"sam" je oblik prvog lica jednine glagola "biti"',
          zh: '"sam"是"biti"的第一人称单数形式',
        },
      },
      {
        original: 'Ti si učenik.',
        translation: 'You are a student.',
        explanation: {
          en: '"si" is the second person singular form of "biti"',
          es: '"si" es la forma de segunda persona singular de "biti"',
          fr: '"si" est la forme de deuxième personne du singulier de "biti"',
          it: '"si" è la forma della seconda persona singolare di "biti"',
          hr: '"si" je oblik drugog lica jednine glagola "biti"',
          zh: '"si"是"biti"的第二人称单数形式',
        },
      },
      {
        original: 'On/ona je doktor.',
        translation: 'He/she is a doctor.',
        explanation: {
          en: '"je" is the third person singular form of "biti"',
          es: '"je" es la forma de tercera persona singular de "biti"',
          fr: '"je" est la forme de troisième personne du singulier de "biti"',
          it: '"je" è la forma della terza persona singolare di "biti"',
          hr: '"je" je oblik trećeg lica jednine glagola "biti"',
          zh: '"je"是"biti"的第三人称单数形式',
        },
      },
    ],
    difficulty: 2,
    cefrLevel: 'A1',
    category: 'tense',
  },
  {
    id: 'hr_a1_gram_002',
    title: {
      en: 'Personal Pronouns',
      es: 'Pronombres Personales',
      fr: 'Pronoms Personnels',
      it: 'Pronomi Personali',
      hr: 'Osobne zamjenice',
      zh: '人称代词',
    },
    description: {
      en: 'Learn the basic personal pronouns in Croatian: ja, ti, on, ona.',
      es: 'Aprende los pronombres personales básicos en croata: ja, ti, on, ona.',
      fr: 'Apprenez les pronoms personnels de base en croate: ja, ti, on, ona.',
      it: 'Impara i pronomi personali di base in croato: ja, ti, on, ona.',
      hr: 'Naučite osnovne osobne zamjenice u hrvatskom: ja, ti, on, ona.',
      zh: '学习克罗地亚语的基本人称代词：ja, ti, on, ona。',
    },
    examples: [
      {
        original: 'Ja govorim hrvatski.',
        translation: 'I speak Croatian.',
        explanation: {
          en: '"Ja" means "I" and is used as the subject of the sentence',
          es: '"Ja" significa "yo" y se usa como sujeto de la oración',
          fr: '"Ja" signifie "je" et est utilisé comme sujet de la phrase',
          it: '"Ja" significa "io" ed è usato come soggetto della frase',
          hr: '"Ja" znači "ja" i koristi se kao subjekt rečenice',
          zh: '"Ja"意思是"我"，用作句子的主语',
        },
      },
      {
        original: 'Ti si iz Hrvatske.',
        translation: 'You are from Croatia.',
        explanation: {
          en: '"Ti" means "you" (informal) and is used when speaking to friends or family',
          es: '"Ti" significa "tú" (informal) y se usa al hablar con amigos o familia',
          fr: '"Ti" signifie "tu" (informel) et est utilisé en parlant à des amis ou à la famille',
          it: '"Ti" significa "tu" (informale) ed è usato quando si parla con amici o famiglia',
          hr: '"Ti" znači "ti" (neformalno) i koristi se kada govorimo s prijateljima ili obitelji',
          zh: '"Ti"意思是"你"（非正式），用于与朋友或家人交谈时',
        },
      },
    ],
    difficulty: 1,
    cefrLevel: 'A1',
    category: 'syntax',
  },
  {
    id: 'hr_a1_gram_003',
    title: {
      en: 'Gender of Nouns',
      es: 'Género de los Sustantivos',
      fr: 'Genre des Noms',
      it: 'Genere dei Sostantivi',
      hr: 'Rod imenica',
      zh: '名词的性',
    },
    description: {
      en: 'Croatian nouns have three genders: masculine, feminine, and neuter. Learn the basic patterns.',
      es: 'Los sustantivos croatas tienen tres géneros: masculino, femenino y neutro. Aprende los patrones básicos.',
      fr: 'Les noms croates ont trois genres: masculin, féminin et neutre. Apprenez les modèles de base.',
      it: 'I sostantivi croati hanno tre generi: maschile, femminile e neutro. Impara i modelli di base.',
      hr: 'Hrvatske imenice imaju tri roda: muški, ženski i srednji. Naučite osnovne obrasce.',
      zh: '克罗地亚语名词有三个性：阳性、阴性和中性。学习基本模式。',
    },
    examples: [
      {
        original: 'student (muški rod)',
        translation: 'student (masculine)',
        explanation: {
          en: 'Masculine nouns typically end in consonants',
          es: 'Los sustantivos masculinos típicamente terminan en consonantes',
          fr: 'Les noms masculins se terminent généralement par des consonnes',
          it: 'I sostantivi maschili tipicamente finiscono con consonanti',
          hr: 'Muške imenice obično završavaju suglasnikom',
          zh: '阳性名词通常以辅音结尾',
        },
      },
      {
        original: 'studentica (ženski rod)',
        translation: 'female student (feminine)',
        explanation: {
          en: 'Feminine nouns typically end in -a',
          es: 'Los sustantivos femeninos típicamente terminan en -a',
          fr: 'Les noms féminins se terminent généralement par -a',
          it: 'I sostantivi femminili tipicamente finiscono in -a',
          hr: 'Ženske imenice obično završavaju na -a',
          zh: '阴性名词通常以-a结尾',
        },
      },
      {
        original: 'dijete (srednji rod)',
        translation: 'child (neuter)',
        explanation: {
          en: 'Neuter nouns typically end in -o or -e',
          es: 'Los sustantivos neutros típicamente terminan en -o o -e',
          fr: 'Les noms neutres se terminent généralement par -o ou -e',
          it: 'I sostantivi neutri tipicamente finiscono in -o o -e',
          hr: 'Srednje imenice obično završavaju na -o ili -e',
          zh: '中性名词通常以-o或-e结尾',
        },
      },
    ],
    difficulty: 3,
    cefrLevel: 'A1',
    category: 'gender',
  },
];

// Croatian A1 Skills Structure
export const croatianA1Skills: MultilingualSkill[] = [
  {
    id: 'hr_a1_skill_001',
    title: {
      en: 'Basic Greetings',
      es: 'Saludos Básicos',
      fr: 'Salutations de Base',
      it: 'Saluti di Base',
      hr: 'Osnovni pozdravi',
      zh: '基本问候语',
    },
    icon: '👋',
    level: 1,
    totalLevels: 5,
    lessons: [], // Will be populated with lessons
    locked: false,
    color: '#58CC02',
    cefrLevel: 'A1',
    category: 'basics',
    xpRequired: 0,
    description: {
      en: 'Learn essential greetings and polite expressions in Croatian.',
      es: 'Aprende saludos esenciales y expresiones corteses en croata.',
      fr: 'Apprenez les salutations essentielles et les expressions polies en croate.',
      it: 'Impara i saluti essenziali e le espressioni cortesi in croato.',
      hr: 'Naučite osnovne pozdrave i pristojne izraze na hrvatskom.',
      zh: '学习克罗地亚语的基本问候语和礼貌用语。',
    },
    targetLanguage: 'hr',
    mainLanguage: 'en',
    vocabularyCount: 4,
    estimatedCompletionTime: 30,
    prerequisites: [],
  },
  {
    id: 'hr_a1_skill_002',
    title: {
      en: 'Personal Pronouns',
      es: 'Pronombres Personales',
      fr: 'Pronoms Personnels',
      it: 'Pronomi Personali',
      hr: 'Osobne zamjenice',
      zh: '人称代词',
    },
    icon: '👤',
    level: 1,
    totalLevels: 3,
    lessons: [], // Will be populated with lessons
    locked: true,
    color: '#FF9600',
    cefrLevel: 'A1',
    category: 'grammar',
    xpRequired: 50,
    description: {
      en: 'Master the basic personal pronouns: I, you, he, she.',
      es: 'Domina los pronombres personales básicos: yo, tú, él, ella.',
      fr: 'Maîtrisez les pronoms personnels de base: je, tu, il, elle.',
      it: 'Padroneggia i pronomi personali di base: io, tu, lui, lei.',
      hr: 'Savladajte osnovne osobne zamjenice: ja, ti, on, ona.',
      zh: '掌握基本人称代词：我、你、他、她。',
    },
    targetLanguage: 'hr',
    mainLanguage: 'en',
    vocabularyCount: 4,
    estimatedCompletionTime: 25,
    prerequisites: ['hr_a1_skill_001'],
  },
  {
    id: 'hr_a1_skill_003',
    title: {
      en: 'The Verb "To Be"',
      es: 'El Verbo "Ser/Estar"',
      fr: 'Le Verbe "Être"',
      it: 'Il Verbo "Essere"',
      hr: 'Glagol "biti"',
      zh: '动词"是"',
    },
    icon: '🔗',
    level: 1,
    totalLevels: 4,
    lessons: [], // Will be populated with lessons
    locked: true,
    color: '#CE82FF',
    cefrLevel: 'A1',
    category: 'grammar',
    xpRequired: 100,
    description: {
      en: 'Learn to conjugate the most important Croatian verb "biti" (to be).',
      es: 'Aprende a conjugar el verbo croata más importante "biti" (ser/estar).',
      fr: 'Apprenez à conjuguer le verbe croate le plus important "biti" (être).',
      it: 'Impara a coniugare il verbo croato più importante "biti" (essere).',
      hr: 'Naučite konjugirati najvažniji hrvatski glagol "biti".',
      zh: '学习变位最重要的克罗地亚语动词"biti"（是）。',
    },
    targetLanguage: 'hr',
    mainLanguage: 'en',
    vocabularyCount: 1,
    estimatedCompletionTime: 40,
    prerequisites: ['hr_a1_skill_002'],
  },
  {
    id: 'hr_a1_skill_004',
    title: {
      en: 'Family Members',
      es: 'Miembros de la Familia',
      fr: 'Membres de la Famille',
      it: 'Membri della Famiglia',
      hr: 'Članovi obitelji',
      zh: '家庭成员',
    },
    icon: '👨‍👩‍👧‍👦',
    level: 1,
    totalLevels: 3,
    lessons: [], // Will be populated with lessons
    locked: true,
    color: '#FF4B4B',
    cefrLevel: 'A1',
    category: 'family',
    xpRequired: 150,
    description: {
      en: 'Learn vocabulary for family members and relationships.',
      es: 'Aprende vocabulario para miembros de la familia y relaciones.',
      fr: 'Apprenez le vocabulaire des membres de la famille et des relations.',
      it: 'Impara il vocabolario per i membri della famiglia e le relazioni.',
      hr: 'Naučite rječnik za članove obitelji i odnose.',
      zh: '学习家庭成员和关系的词汇。',
    },
    targetLanguage: 'hr',
    mainLanguage: 'en',
    vocabularyCount: 8,
    estimatedCompletionTime: 35,
    prerequisites: ['hr_a1_skill_003'],
  },
  {
    id: 'hr_a1_skill_005',
    title: {
      en: 'Numbers 1-10',
      es: 'Números 1-10',
      fr: 'Nombres 1-10',
      it: 'Numeri 1-10',
      hr: 'Brojevi 1-10',
      zh: '数字1-10',
    },
    icon: '🔢',
    level: 1,
    totalLevels: 2,
    lessons: [], // Will be populated with lessons
    locked: true,
    color: '#1CB0F6',
    cefrLevel: 'A1',
    category: 'basics',
    xpRequired: 200,
    description: {
      en: 'Master counting from 1 to 10 in Croatian.',
      es: 'Domina el conteo del 1 al 10 en croata.',
      fr: 'Maîtrisez le comptage de 1 à 10 en croate.',
      it: 'Padroneggia il conteggio da 1 a 10 in croato.',
      hr: 'Savladajte brojanje od 1 do 10 na hrvatskom.',
      zh: '掌握克罗地亚语从1到10的计数。',
    },
    targetLanguage: 'hr',
    mainLanguage: 'en',
    vocabularyCount: 10,
    estimatedCompletionTime: 20,
    prerequisites: ['hr_a1_skill_004'],
  },
];

// Croatian A1 Lesson Content from provided JSON
export const croatianA1LessonData = {
  level: 'A1' as const,
  language: 'Croatian',
  modules: [
    {
      module_id: 1,
      title: 'Greetings & Introductions',
      lessons: [
        {
          lesson_id: 1,
          title: 'Basic Greetings',
          exercises: [
            {
              exercise_type: 'listening',
              content: "Listen and repeat: 'Bok' (Hi/Hello)",
              correct_answer: 'Bok',
              explanation: 'Informal greeting.',
            },
            {
              exercise_type: 'speaking',
              content: "Say: 'Dobar dan' (Good day)",
              correct_answer: 'Dobar dan',
              explanation: 'Used during daytime.',
            },
            {
              exercise_type: 'reading',
              content: "Match 'Dobro jutro' → 'Good morning'",
              correct_answer: 'Dobro jutro → Good morning',
              explanation: 'Used in the morning.',
            },
            {
              exercise_type: 'writing',
              content: "Write 'Good evening' in Croatian",
              correct_answer: 'Dobra večer',
              explanation: 'Used after 6 PM.',
            },
          ],
        },
        {
          lesson_id: 2,
          title: 'Introducing Yourself',
          exercises: [
            {
              exercise_type: 'listening',
              content: "Listen: 'Ja sam Ana' (I am Ana)",
              correct_answer: 'Ja sam Ana',
              explanation: 'Introducing your name.',
            },
            {
              exercise_type: 'speaking',
              content: "Say: 'Drago mi je' (Nice to meet you)",
              correct_answer: 'Drago mi je',
              explanation: 'Polite response when meeting someone.',
            },
            {
              exercise_type: 'reading',
              content: "Match: 'Kako se zoveš?' → 'What is your name?'",
              correct_answer: 'Kako se zoveš? → What is your name?',
              explanation: 'Asking someone\'s name.',
            },
            {
              exercise_type: 'writing',
              content: "Write 'I am from Spain' in Croatian",
              correct_answer: 'Ja sam iz Španjolske',
              explanation: 'Use \'Ja sam iz + country\'.',
            },
          ],
        },
      ],
    },
    {
      module_id: 2,
      title: 'Family & People',
      lessons: [
        {
          lesson_id: 3,
          title: 'Family Members',
          exercises: [
            {
              exercise_type: 'reading',
              content: "Match: 'majka' → 'mother', 'otac' → 'father'",
              correct_answer: 'majka → mother, otac → father',
              explanation: 'Common family terms.',
            },
            {
              exercise_type: 'writing',
              content: "Write 'brother' in Croatian",
              correct_answer: 'brat',
              explanation: 'Male sibling.',
            },
            {
              exercise_type: 'listening',
              content: "Listen: 'sestra' (sister)",
              correct_answer: 'sestra',
              explanation: 'Female sibling.',
            },
            {
              exercise_type: 'speaking',
              content: "Say 'Obitelj' (Family)",
              correct_answer: 'Obitelj',
              explanation: 'General term for family.',
            },
          ],
        },
        {
          lesson_id: 4,
          title: 'Describing People',
          exercises: [
            {
              exercise_type: 'reading',
              content: "Match adjectives: 'visok' → 'tall', 'kratak' → 'short'",
              correct_answer: 'visok → tall, kratak → short',
              explanation: 'Basic descriptive words.',
            },
            {
              exercise_type: 'writing',
              content: "Write 'friendly' in Croatian",
              correct_answer: 'prijateljski',
              explanation: 'Describes personality.',
            },
            {
              exercise_type: 'listening',
              content: "Listen: 'mlad' (young)",
              correct_answer: 'mlad',
              explanation: 'Describes age.',
            },
            {
              exercise_type: 'speaking',
              content: "Say: 'star' (old)",
              correct_answer: 'star',
              explanation: 'Describes age.',
            },
          ],
        },
      ],
    },
  ],
};

// Convert raw lesson data to multilingual format
export function convertToMultilingualLessons(
  rawLessons: typeof croatianA1LessonData,
  mainLanguage: string = 'en',
): MultilingualLesson[] {
  const lessons: MultilingualLesson[] = [];
  
  rawLessons.modules.forEach(module => {
    module.lessons.forEach(lesson => {
      const multilingualLesson: MultilingualLesson = {
        id: `hr_a1_m${module.module_id}_l${lesson.lesson_id}`,
        title: {
          en: lesson.title,
          es: translateTitle(lesson.title, 'es'),
          hr: translateTitle(lesson.title, 'hr'),
        },
        type: 'mixed',
        completed: false,
        exercises: lesson.exercises.map((exercise, index) => ({
          id: `hr_a1_m${module.module_id}_l${lesson.lesson_id}_e${index + 1}`,
          type: exercise.exercise_type as any,
          instruction: getInstructionForExerciseType(exercise.exercise_type, mainLanguage),
          question: {
            en: exercise.content,
            es: translateContent(exercise.content, 'es'),
            hr: translateContent(exercise.content, 'hr'),
          },
          correctAnswer: exercise.correct_answer,
          explanation: {
            en: exercise.explanation,
            es: translateExplanation(exercise.explanation, 'es'),
            hr: translateExplanation(exercise.explanation, 'hr'),
          },
          difficulty: 1,
          xpReward: 10,
          targetLanguage: 'hr',
          mainLanguage,
          vocabularyItems: extractVocabularyFromExercise(exercise),
          grammarPoints: extractGrammarFromExercise(exercise),
          skills: [exercise.exercise_type],
          audio: `https://example.com/audio/hr/a1/m${module.module_id}/l${lesson.lesson_id}/e${index + 1}.mp3`,
          image: getImageForExercise(exercise),
        })),
        xpReward: 50,
        difficulty: 1,
        estimatedTime: 10,
        description: {
          en: `Learn ${lesson.title.toLowerCase()}`,
          es: `Aprende ${translateTitle(lesson.title, 'es').toLowerCase()}`,
          hr: `Naučite ${translateTitle(lesson.title, 'hr').toLowerCase()}`,
        },
        targetLanguage: 'hr',
        mainLanguage,
        vocabularyIntroduced: getVocabularyForLesson(lesson),
        vocabularyReviewed: [],
        grammarConcepts: getGrammarConceptsForLesson(lesson),
        learningObjectives: [
          {
            en: `Master ${lesson.title.toLowerCase()} vocabulary and phrases`,
            es: `Dominar el vocabulario y frases de ${translateTitle(lesson.title, 'es').toLowerCase()}`,
            hr: `Ovladati vokabularom i frazama za ${translateTitle(lesson.title, 'hr').toLowerCase()}`,
          },
        ],
        completionCriteria: {
          minimumAccuracy: 0.8,
          requiredExercises: lesson.exercises.map((_, index) => 
            `hr_a1_m${module.module_id}_l${lesson.lesson_id}_e${index + 1}`,
          ),
        },
      };
      
      lessons.push(multilingualLesson);
    });
  });
  
  return lessons;
}

// Helper functions for translation and content generation
function translateTitle(title: string, language: string): string {
  const translations: { [key: string]: { [lang: string]: string } } = {
    'Basic Greetings': {
      es: 'Saludos Básicos',
      hr: 'Osnovni Pozdravi',
    },
    'Introducing Yourself': {
      es: 'Presentándote',
      hr: 'Predstavljanje',
    },
    'Family Members': {
      es: 'Miembros de la Familia',
      hr: 'Članovi Obitelji',
    },
    'Describing People': {
      es: 'Describiendo Personas',
      hr: 'Opisivanje Ljudi',
    },
  };
  
  return translations[title]?.[language] || title;
}

function translateContent(content: string, language: string): string {
  if (language === 'es') {
    return content.replace(/Listen/g, 'Escucha')
                 .replace(/Say/g, 'Di')
                 .replace(/Write/g, 'Escribe')
                 .replace(/Match/g, 'Empareja');
  }
  if (language === 'hr') {
    return content.replace(/Listen/g, 'Slušaj')
                 .replace(/Say/g, 'Reci')
                 .replace(/Write/g, 'Napiši')
                 .replace(/Match/g, 'Spoji');
  }
  return content;
}

function translateExplanation(explanation: string, language: string): string {
  const translations: { [key: string]: { [lang: string]: string } } = {
    'Informal greeting.': {
      es: 'Saludo informal.',
      hr: 'Neformalni pozdrav.',
    },
    'Used during daytime.': {
      es: 'Usado durante el día.',
      hr: 'Koristi se tijekom dana.',
    },
    'Used in the morning.': {
      es: 'Usado por la mañana.',
      hr: 'Koristi se ujutro.',
    },
    'Used after 6 PM.': {
      es: 'Usado después de las 6 PM.',
      hr: 'Koristi se nakon 18 sati.',
    },
  };
  
  return translations[explanation]?.[language] || explanation;
}

function getInstructionForExerciseType(exerciseType: string, mainLanguage: string): MultilingualContent {
  const instructions: { [key: string]: MultilingualContent } = {
    listening: {
      en: 'Listen and repeat',
      es: 'Escucha y repite',
      hr: 'Slušaj i ponovi',
    },
    speaking: {
      en: 'Say the phrase',
      es: 'Di la frase',
      hr: 'Reci frazu',
    },
    reading: {
      en: 'Match the words',
      es: 'Empareja las palabras',
      hr: 'Spoji riječi',
    },
    writing: {
      en: 'Write the translation',
      es: 'Escribe la traducción',
      hr: 'Napiši prijevod',
    },
  };
  
  return instructions[exerciseType] || instructions.listening;
}

function extractVocabularyFromExercise(exercise: any): string[] {
  const vocabulary: string[] = [];
  
  if (exercise.correct_answer) {
    const words = exercise.correct_answer.split(/[\s→,]+/);
    words.forEach((word: string) => {
      if (word.length > 2 && !word.includes('?') && !word.includes('.')) {
        vocabulary.push(word.toLowerCase());
      }
    });
  }
  
  return vocabulary;
}

function extractGrammarFromExercise(exercise: any): string[] {
  const grammar: string[] = [];
  
  if (exercise.content.includes('I am') || exercise.correct_answer.includes('sam')) {
    grammar.push('present_tense_be');
  }
  if (exercise.content.includes('Good') || exercise.content.includes('Dobr')) {
    grammar.push('adjectives');
  }
  
  return grammar;
}

function getImageForExercise(exercise: any): string | undefined {
  if (exercise.content.includes('greeting') || exercise.content.includes('Hello')) {
    return 'https://example.com/images/greetings.jpg';
  }
  if (exercise.content.includes('family') || exercise.content.includes('majka')) {
    return 'https://example.com/images/family.jpg';
  }
  return undefined;
}

function getVocabularyForLesson(lesson: any): VocabularyItem[] {
  const vocabulary: VocabularyItem[] = [];
  
  lesson.exercises.forEach((exercise: any, index: number) => {
    if (exercise.correct_answer) {
      const words = exercise.correct_answer.split(/[\s→,]+/);
      words.forEach((word: string) => {
        if (word.length > 2 && !word.includes('?') && !word.includes('.')) {
          vocabulary.push({
            id: `vocab_${lesson.lesson_id}_${index}_${word.toLowerCase()}`,
            word: word.trim(),
            translation: getTranslationForWord(word.trim()),
            pronunciation: `[IPA] ${word.trim()}_phonetic`,
            partOfSpeech: getPartOfSpeech(word.trim()),
            difficulty: 1,
            frequency: 8,
            exampleSentences: [{
              original: exercise.correct_answer,
              translation: exercise.content,
            }],
            tags: ['A1', 'basic'],
            cefrLevel: 'A1',
            mastered: false,
          });
        }
      });
    }
  });
  
  return vocabulary;
}

function getGrammarConceptsForLesson(lesson: any): any[] {
  return [
    {
      id: `grammar_${lesson.lesson_id}_present_be`,
      title: {
        en: 'Present Tense - To Be',
        es: 'Tiempo Presente - Ser/Estar',
        hr: 'Sadašnje Vrijeme - Biti',
      },
      description: {
        en: 'Learn how to use the verb "to be" in Croatian',
        es: 'Aprende cómo usar el verbo "ser/estar" en croata',
        hr: 'Naučite kako koristiti glagol "biti" u hrvatskom',
      },
      examples: [{
        original: 'Ja sam Ana',
        translation: 'I am Ana',
        explanation: {
          en: 'First person singular form of "to be"',
          es: 'Primera persona singular de "ser"',
          hr: 'Prvo lice jednine glagola "biti"',
        },
      }],
      difficulty: 1,
      cefrLevel: 'A1' as const,
      category: 'tense' as const,
    },
  ];
}

function getTranslationForWord(word: string): string {
  const translations: { [key: string]: string } = {
    'Bok': 'Hi/Hello',
    'Dobar': 'Good',
    'dan': 'day',
    'jutro': 'morning',
    'večer': 'evening',
    'Ja': 'I',
    'sam': 'am',
    'majka': 'mother',
    'otac': 'father',
    'brat': 'brother',
    'sestra': 'sister',
  };
  
  return translations[word] || word;
}

function getPartOfSpeech(word: string): VocabularyItem['partOfSpeech'] {
  const partOfSpeechMap: { [key: string]: VocabularyItem['partOfSpeech'] } = {
    'Bok': 'interjection',
    'Dobar': 'adjective',
    'dan': 'noun',
    'jutro': 'noun',
    'večer': 'noun',
    'Ja': 'pronoun',
    'sam': 'verb',
    'majka': 'noun',
    'otac': 'noun',
    'brat': 'noun',
    'sestra': 'noun',
  };
  
  return partOfSpeechMap[word] || 'noun';
}

// Generate the multilingual lessons from the raw data
export const croatianA1Lessons: MultilingualLesson[] = convertToMultilingualLessons(croatianA1LessonData);

// Function to get lessons by skill ID
export function getLessonsBySkillId(skillId: string): MultilingualLesson[] {
  switch (skillId) {
    case 'hr_a1_skill_001':
      return croatianA1Lessons.slice(0, 2); // First 2 lessons for greetings
    case 'hr_a1_skill_004':
      return croatianA1Lessons.slice(2, 4); // Next 2 lessons for family
    default:
      return [];
  }
}

// Function to get vocabulary by lesson ID
export function getVocabularyByLessonId(lessonId: string): VocabularyItem[] {
  const lesson = croatianA1Lessons.find(l => l.id === lessonId);
  return lesson ? lesson.vocabularyIntroduced : [];
}

// Function to get grammar concepts by lesson ID
export function getGrammarByLessonId(lessonId: string): GrammarConcept[] {
  const lesson = croatianA1Lessons.find(l => l.id === lessonId);
  return lesson ? lesson.grammarConcepts : [];
}
