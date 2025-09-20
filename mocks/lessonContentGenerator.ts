import { CEFRLevel, ExerciseType, LessonType, SkillCategory, MultilingualContent } from '@/types';

// Enhanced lesson content generator for multilingual functionality
export class LessonContentGenerator {
  private targetLanguage: string;
  private mainLanguage: string;

  constructor(targetLanguage: string, mainLanguage: string) {
    this.targetLanguage = targetLanguage;
    this.mainLanguage = mainLanguage;
  }

  // Generate multilingual exercise content
  generateExerciseContent(type: ExerciseType, level: CEFRLevel, category: SkillCategory): any {
    const instructions = this.getInstructions(type);
    
    switch (type) {
      case 'match': 
        return {
          instruction: instructions,
          word: 'hello',
          translation: this.getTranslation('hello'),
          options: this.getMatchOptions('hello'),
          audioUrl: `https://example.com/audio/${this.targetLanguage}/hello.mp3`,
          imageUrl: 'https://example.com/images/hello.jpg',
        };
      case 'translate':
        return {
          instruction: instructions,
          sentence: this.getSentenceForTranslation(level),
          options: this.getTranslationOptions(level),
          correctIndex: 0,
          explanation: this.getExplanation(type, level),
        };
      case 'listening':
        return {
          instruction: instructions,
          audioUrl: `https://example.com/audio/${this.targetLanguage}/listening_${level}.mp3`,
          transcript: this.getListeningTranscript(level),
          question: this.getListeningQuestion(),
          options: this.getListeningOptions(level),
        };
      case 'speaking':
        return {
          instruction: instructions,
          prompt: this.getSpeakingPrompt(level),
          expectedResponse: this.getSpeakingResponse(level),
          phonetic: this.getPhonetic(level),
          audioUrl: `https://example.com/audio/${this.targetLanguage}/speaking_${level}.mp3`,
        };
      case 'fillBlank':
        return {
          instruction: instructions,
          sentence: this.getFillBlankSentence(level),
          options: this.getFillBlankOptions(level),
          correctAnswer: this.getFillBlankAnswer(level),
          explanation: this.getExplanation(type, level),
        };
      default:
        return {
          instruction: instructions,
        };
    }
  }

  private getInstructions(type: ExerciseType): MultilingualContent {
    const instructions: { [key: string]: MultilingualContent } = {
      match: {
        en: 'Match the word with its translation',
        es: 'Empareja la palabra con su traducción',
        fr: 'Associez le mot à sa traduction',
        it: 'Abbina la parola alla sua traduzione',
        hr: 'Spojite riječ s njezinim prijevodom',
        zh: '将单词与其翻译匹配',
      },
      translate: {
        en: 'Translate this sentence',
        es: 'Traduce esta oración',
        fr: 'Traduisez cette phrase',
        it: 'Traduci questa frase',
        hr: 'Prevedite ovu rečenicu',
        zh: '翻译这个句子',
      },
      listening: {
        en: 'Listen and answer the question',
        es: 'Escucha y responde la pregunta',
        fr: 'Écoutez et répondez à la question',
        it: 'Ascolta e rispondi alla domanda',
        hr: 'Slušajte i odgovorite na pitanje',
        zh: '听并回答问题',
      },
      speaking: {
        en: 'Say the following phrase',
        es: 'Di la siguiente frase',
        fr: 'Dites la phrase suivante',
        it: 'Pronuncia la seguente frase',
        hr: 'Izgovorite sljedeću frazu',
        zh: '说出以下短语',
      },
      fillBlank: {
        en: 'Fill in the blank',
        es: 'Completa el espacio en blanco',
        fr: 'Remplissez le blanc',
        it: 'Riempi lo spazio vuoto',
        hr: 'Popunite prazninu',
        zh: '填空',
      },
    };
    
    return instructions[type] || instructions.match;
  }

  private getTranslation(word: string): string {
    const translations: { [key: string]: { [key: string]: string } } = {
      hello: {
        hr: 'zdravo',
        es: 'hola',
        fr: 'bonjour',
        it: 'ciao',
        zh: '你好',
        en: 'hello',
      },
    };
    
    return translations[word]?.[this.targetLanguage] || word;
  }

  private getMatchOptions(word: string): string[] {
    const optionSets: { [key: string]: { [key: string]: string[] } } = {
      hello: {
        hr: ['zdravo', 'doviđenja', 'hvala', 'molim'],
        es: ['hola', 'adiós', 'gracias', 'por favor'],
        fr: ['bonjour', 'au revoir', 'merci', 's\'il vous plaît'],
        it: ['ciao', 'arrivederci', 'grazie', 'prego'],
        zh: ['你好', '再见', '谢谢', '请'],
        en: ['hello', 'goodbye', 'thank you', 'please'],
      },
    };
    
    return optionSets[word]?.[this.targetLanguage] || ['option1', 'option2', 'option3', 'option4'];
  }

  private getSentenceForTranslation(level: CEFRLevel): string {
    const sentences: { [key: string]: { [key: string]: string } } = {
      A1: {
        hr: 'Ja sam student.',
        es: 'Yo soy estudiante.',
        fr: 'Je suis étudiant.',
        it: 'Io sono studente.',
        zh: '我是学生。',
        en: 'I am a student.',
      },
    };
    
    return sentences[level]?.[this.targetLanguage] || 'Sample sentence';
  }

  private getTranslationOptions(level: CEFRLevel): string[] {
    const options: { [key: string]: { [key: string]: string[] } } = {
      A1: {
        hr: ['Ja sam student.', 'Ti si učitelj.', 'On je doktor.', 'Ona je inženjer.'],
        es: ['Yo soy estudiante.', 'Tú eres profesor.', 'Él es doctor.', 'Ella es ingeniera.'],
        fr: ['Je suis étudiant.', 'Tu es professeur.', 'Il est docteur.', 'Elle est ingénieure.'],
        it: ['Io sono studente.', 'Tu sei insegnante.', 'Lui è dottore.', 'Lei è ingegnere.'],
        zh: ['我是学生。', '你是老师。', '他是医生。', '她是工程师。'],
        en: ['I am a student.', 'You are a teacher.', 'He is a doctor.', 'She is an engineer.'],
      },
    };
    
    return options[level]?.[this.targetLanguage] || ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
  }

  private getListeningTranscript(level: CEFRLevel): string {
    const transcripts: { [key: string]: { [key: string]: string } } = {
      A1: {
        hr: 'Zdravo, kako ste?',
        es: 'Hola, ¿cómo está?',
        fr: 'Bonjour, comment allez-vous?',
        it: 'Ciao, come stai?',
        zh: '你好，你好吗？',
        en: 'Hello, how are you?',
      },
    };
    
    return transcripts[level]?.[this.targetLanguage] || 'Sample transcript';
  }

  private getListeningQuestion(): MultilingualContent {
    return {
      en: 'What greeting did you hear?',
      es: '¿Qué saludo escuchaste?',
      fr: 'Quelle salutation avez-vous entendue?',
      it: 'Che saluto hai sentito?',
      hr: 'Koji pozdrav ste čuli?',
      zh: '你听到了什么问候语？',
    };
  }

  private getListeningOptions(level: CEFRLevel): MultilingualContent[] {
    const baseOptions = [
      {
        en: 'Hello, how are you?',
        es: 'Hola, ¿cómo está?',
        fr: 'Bonjour, comment allez-vous?',
        it: 'Ciao, come stai?',
        hr: 'Zdravo, kako ste?',
        zh: '你好，你好吗？',
      },
      {
        en: 'Goodbye, see you later',
        es: 'Adiós, hasta luego',
        fr: 'Au revoir, à bientôt',
        it: 'Arrivederci, a dopo',
        hr: 'Doviđenja, vidimo se kasnije',
        zh: '再见，回头见',
      },
      {
        en: 'Thank you very much',
        es: 'Muchas gracias',
        fr: 'Merci beaucoup',
        it: 'Grazie mille',
        hr: 'Hvala vam puno',
        zh: '非常感谢',
      },
      {
        en: 'Please help me',
        es: 'Por favor ayúdame',
        fr: 'Aidez-moi s\'il vous plaît',
        it: 'Per favore aiutami',
        hr: 'Molim vas pomozite mi',
        zh: '请帮助我',
      },
    ];
    
    return baseOptions;
  }

  private getSpeakingPrompt(level: CEFRLevel): MultilingualContent {
    const prompts: { [key: string]: MultilingualContent } = {
      A1: {
        en: 'Say "Hello" in Croatian',
        es: 'Di "Hola" en croata',
        fr: 'Dites "Bonjour" en croate',
        it: 'Di "Ciao" in croato',
        hr: 'Recite "Zdravo" na engleskom',
        zh: '用克罗地亚语说"你好"',
      },
    };
    
    return prompts[level] || prompts.A1;
  }

  private getSpeakingResponse(level: CEFRLevel): string {
    const responses: { [key: string]: { [key: string]: string } } = {
      A1: {
        hr: 'Zdravo',
        es: 'Hola',
        fr: 'Bonjour',
        it: 'Ciao',
        zh: '你好',
        en: 'Hello',
      },
    };
    
    return responses[level]?.[this.targetLanguage] || 'Response';
  }

  private getPhonetic(level: CEFRLevel): string {
    const phonetics: { [key: string]: { [key: string]: string } } = {
      A1: {
        hr: '/zdraːʋo/',
        es: '/ˈola/',
        fr: '/bon.ˈʒuʁ/',
        it: '/ˈtʃaːo/',
        zh: '/ni˥ xaʊ˨˩˦/',
        en: '/həˈloʊ/',
      },
    };
    
    return phonetics[level]?.[this.targetLanguage] || '/phonetic/';
  }

  private getFillBlankSentence(level: CEFRLevel): string {
    const sentences: { [key: string]: { [key: string]: string } } = {
      A1: {
        hr: 'Ja ___ student.',
        es: 'Yo ___ estudiante.',
        fr: 'Je ___ étudiant.',
        it: 'Io ___ studente.',
        zh: '我___学生。',
        en: 'I ___ a student.',
      },
    };
    
    return sentences[level]?.[this.targetLanguage] || 'Sample ___ sentence';
  }

  private getFillBlankOptions(level: CEFRLevel): string[] {
    const options: { [key: string]: { [key: string]: string[] } } = {
      A1: {
        hr: ['sam', 'si', 'je', 'smo'],
        es: ['soy', 'eres', 'es', 'somos'],
        fr: ['suis', 'es', 'est', 'sommes'],
        it: ['sono', 'sei', 'è', 'siamo'],
        zh: ['是', '不是', '会', '能'],
        en: ['am', 'is', 'are', 'be'],
      },
    };
    
    return options[level]?.[this.targetLanguage] || ['option1', 'option2', 'option3', 'option4'];
  }

  private getFillBlankAnswer(level: CEFRLevel): string {
    const answers: { [key: string]: { [key: string]: string } } = {
      A1: {
        hr: 'sam',
        es: 'soy',
        fr: 'suis',
        it: 'sono',
        zh: '是',
        en: 'am',
      },
    };
    
    return answers[level]?.[this.targetLanguage] || 'answer';
  }

  private getExplanation(type: ExerciseType, level: CEFRLevel): MultilingualContent {
    const explanations: { [key: string]: MultilingualContent } = {
      translate: {
        en: 'This sentence uses the verb "to be" in first person singular.',
        es: 'Esta oración usa el verbo "ser" en primera persona del singular.',
        fr: 'Cette phrase utilise le verbe "être" à la première personne du singulier.',
        it: 'Questa frase usa il verbo "essere" in prima persona singolare.',
        hr: 'Ova rečenica koristi glagol "biti" u prvom licu jednine.',
        zh: '这个句子使用第一人称单数的"是"动词。',
      },
      fillBlank: {
        en: 'The correct form of "to be" for "I" is "am".',
        es: 'La forma correcta de "ser" para "yo" es "soy".',
        fr: 'La forme correcte d\'"être" pour "je" est "suis".',
        it: 'La forma corretta di "essere" per "io" è "sono".',
        hr: 'Ispravni oblik glagola "biti" za "ja" je "sam".',
        zh: '"我"的"是"的正确形式是"是"。',
      },
    };
    
    return explanations[type] || explanations.translate;
  }
}
