// ============================================================
// ClinicoTrace — Multilingual Patient Instruction Translations
// Languages: English (en), Tamil (ta), Hindi (hi), Telugu (te)
//
// IMPORTANT: Clinical data (medication name, strength, dose) is
// NEVER translated. Only timing, context, and patient-facing
// explanation text is localized. This prevents clinical errors
// from mistranslation of drug names or doses.
// ============================================================

import type { SupportedLanguage, LocalizedMedicationInstruction } from '@/types/clinical';

// ---- Language metadata -------------------------------------

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: 'English',
  ta: 'தமிழ்',
  hi: 'हिन्दी',
  te: 'తెలుగు',
};

// ---- Common timing strings ---------------------------------

const MORNING: Record<SupportedLanguage, string> = {
  en: 'Morning',
  ta: 'காலை',
  hi: 'सुबह',
  te: 'ఉదయం',
};

const AFTERNOON: Record<SupportedLanguage, string> = {
  en: 'Afternoon',
  ta: 'மதியம்',
  hi: 'दोपहर',
  te: 'మధ్యాహ్నం',
};

const EVENING: Record<SupportedLanguage, string> = {
  en: 'Evening',
  ta: 'மாலை',
  hi: 'शाम',
  te: 'సాయంత్రం',
};

const AFTER_FOOD: Record<SupportedLanguage, string> = {
  en: 'After food',
  ta: 'உணவுக்குப் பிறகு',
  hi: 'खाने के बाद',
  te: 'భోజనం తర్వాత',
};

const AS_DIRECTED: Record<SupportedLanguage, string> = {
  en: 'As directed by the doctor',
  ta: 'மருத்துவர் கூறியபடி',
  hi: 'डॉक्टर के निर्देशानुसार',
  te: 'వైద్యుడు చెప్పినట్టు',
};

const ONE_TABLET: Record<SupportedLanguage, string> = {
  en: '1 tablet',
  ta: '1 மாத்திரை',
  hi: '1 गोली',
  te: '1 మాత్ర',
};

const ONE_NEBULISATION: Record<SupportedLanguage, string> = {
  en: '1 nebulisation session',
  ta: '1 நெபுலைசேஷன்',
  hi: '1 नेब्युलाइज़ेशन',
  te: '1 నెబ్యులైజేషన్',
};

const DO_NOT_STOP: Record<SupportedLanguage, string> = {
  en: 'Do not stop this medicine without consulting your doctor.',
  ta: 'மருத்துவரின் ஆலோசனை இல்லாமல் இந்த மருந்தை நிறுத்தாதீர்கள்.',
  hi: 'डॉक्टर से परामर्श किए बिना यह दवा बंद न करें।',
  te: 'వైద్యుడిని సంప్రదించకుండా ఈ మందు ఆపవద్దు.',
};

const COMPLETE_COURSE: Record<SupportedLanguage, string> = {
  en: 'Complete the full course even if you feel better.',
  ta: 'நலமடைந்தாலும் முழு கோர்ஸ் முடிக்கவும்.',
  hi: 'बेहतर महसूस होने पर भी पूरा कोर्स लें।',
  te: 'మెరుగుపడినా పూర్తి కోర్సు తీసుకోండి.',
};

const MONITOR_BREATHING: Record<SupportedLanguage, string> = {
  en: 'Inform your doctor immediately if breathing does not improve.',
  ta: 'சுவாசம் சரியாகவில்லை என்றால் உடனே மருத்துவரிடம் தெரிவிக்கவும்.',
  hi: 'यदि सांस में सुधार न हो तो तुरंत डॉक्टर को बताएं।',
  te: 'శ్వాస మెరుగుపడకపోతే వెంటనే వైద్యుడికి తెలియజేయండి.',
};

// ---- Demo prescription instructions (Arun Kumar) -----------
// Salbutamol 2.5mg TDS nebulisation, Prednisolone 30mg OD, Azithromycin 500mg OD

export function getArunKumarInstructions(
  lang: SupportedLanguage
): LocalizedMedicationInstruction[] {
  return [
    {
      medicationName: 'Salbutamol Nebulisation',
      strength: '2.5mg',
      timingSlots: [
        { time: MORNING[lang], dose: ONE_NEBULISATION[lang], when: AS_DIRECTED[lang] },
        { time: AFTERNOON[lang], dose: ONE_NEBULISATION[lang], when: AS_DIRECTED[lang] },
        { time: EVENING[lang], dose: ONE_NEBULISATION[lang], when: AS_DIRECTED[lang] },
      ],
      specialNote: MONITOR_BREATHING[lang],
    },
    {
      medicationName: 'Prednisolone',
      strength: '30mg',
      timingSlots: [
        { time: MORNING[lang], dose: ONE_TABLET[lang], when: AFTER_FOOD[lang] },
      ],
      specialNote: DO_NOT_STOP[lang],
      cautionNote:
        lang === 'ta'
          ? 'இந்த மாத்திரையை திடீரென நிறுத்தாதீர்கள். ஸ்டீராய்டு மருந்து.'
          : lang === 'hi'
          ? 'इस दवा को अचानक बंद न करें। यह स्टेरॉयड दवा है।'
          : lang === 'te'
          ? 'ఈ మందును అకస్మాత్తుగా ఆపవద్దు. ఇది స్టెరాయిడ్ మందు.'
          : 'Steroid medicine — do not stop abruptly.',
    },
    {
      medicationName: 'Azithromycin',
      strength: '500mg',
      timingSlots: [
        { time: MORNING[lang], dose: ONE_TABLET[lang], when:
          lang === 'ta' ? 'உணவுக்கு 1 மணி நேரம் முன்பு அல்லது 2 மணி நேரம் பிறகு' :
          lang === 'hi' ? 'खाने से 1 घंटे पहले या 2 घंटे बाद' :
          lang === 'te' ? 'భోజనానికి 1 గంట ముందు లేదా 2 గంటల తర్వాత' :
          '1 hour before or 2 hours after food'
        },
      ],
      specialNote: COMPLETE_COURSE[lang],
    },
  ];
}

// ---- UI label helpers for the patient instruction screen ---

export const SECTION_LABELS: Record<string, Record<SupportedLanguage, string>> = {
  title: {
    en: 'Patient Instructions',
    ta: 'நோயாளி அறிவுறுத்தல்கள்',
    hi: 'रोगी निर्देश',
    te: 'రోగి సూచనలు',
  },
  generatedFrom: {
    en: 'Generated from the verified prescription.',
    ta: 'சரிபார்க்கப்பட்ட மருந்துச் சீட்டிலிருந்து உருவாக்கப்பட்டது.',
    hi: 'सत्यापित नुस्खे से तैयार किया गया।',
    te: 'ధృవీకరించబడిన ప్రిస్క్రిప్షన్ నుండి రూపొందించబడింది.',
  },
  medicineSchedule: {
    en: 'Medicine Schedule',
    ta: 'மருந்து அட்டவணை',
    hi: 'दवा का समय',
    te: 'మందుల షెడ్యూల్',
  },
  importantNote: {
    en: 'Important',
    ta: 'முக்கியம்',
    hi: 'महत्वपूर्ण',
    te: 'ముఖ్యమైనది',
  },
  caution: {
    en: 'Caution',
    ta: 'எச்சரிக்கை',
    hi: 'सावधानी',
    te: 'జాగ్రత్త',
  },
};
