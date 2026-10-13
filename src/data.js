// Mock data for the MAMMOVIE prototype — no backend, demo only.

export const articles = [
  {
    id: 1,
    type: 'video',
    duration: '03:45',
    title: { fr: "Comment réaliser l'auto-examen des seins ?", en: 'How to perform a breast self-exam', ar: 'كيف تجري الفحص الذاتي للثدي؟' },
    author: 'Dr. M. Benali',
    body: {
      fr: "Découvrez les étapes essentielles pour mieux connaître vos seins et repérer les changements inhabituels. L'auto-examen mensuel aide à détecter précocement toute anomalie.",
      en: 'Learn the essential steps to better know your breasts and spot unusual changes. A monthly self-exam helps detect any abnormality early.',
      ar: 'تعرّفي على الخطوات الأساسية لمعرفة ثدييك بشكل أفضل ورصد التغيّرات غير المعتادة. يساعد الفحص الشهري على الكشف المبكر.',
    },
  },
  {
    id: 2,
    type: 'audio',
    duration: '06:10',
    title: { fr: 'Comprendre le dépistage précoce', en: 'Understanding early screening', ar: 'فهم الكشف المبكر' },
    author: 'Sage-femme L. Haddad',
    body: {
      fr: 'Un épisode audio sur l\'importance du dépistage précoce et les examens recommandés selon l\'âge.',
      en: 'An audio episode on the importance of early screening and the exams recommended by age.',
      ar: 'حلقة صوتية حول أهمية الكشف المبكر والفحوصات الموصى بها حسب العمر.',
    },
  },
  {
    id: 3,
    type: 'text',
    duration: '4 min',
    title: { fr: 'Les facteurs de risque du cancer du sein', en: 'Breast cancer risk factors', ar: 'عوامل خطر سرطان الثدي' },
    author: 'Dr. S. Amrani',
    body: {
      fr: 'Âge, antécédents familiaux, mode de vie… Cet article fait le point sur les principaux facteurs de risque et ce que vous pouvez contrôler.',
      en: 'Age, family history, lifestyle… This article reviews the main risk factors and what you can control.',
      ar: 'العمر، التاريخ العائلي، نمط الحياة… يستعرض هذا المقال أهم عوامل الخطر وما يمكنك التحكم فيه.',
    },
  },
  {
    id: 4,
    type: 'video',
    duration: '05:20',
    title: { fr: 'La mammographie : à quoi s\'attendre ?', en: 'Mammography: what to expect', ar: 'تصوير الثدي: ماذا تتوقعين؟' },
    author: 'Dr. N. Cherif',
    body: {
      fr: 'Une vidéo rassurante qui explique le déroulement d\'une mammographie, étape par étape, pour aborder l\'examen sereinement.',
      en: 'A reassuring video explaining a mammogram step by step so you can approach the exam with confidence.',
      ar: 'فيديو مطمئن يشرح خطوات تصوير الثدي خطوة بخطوة لتقبلي الفحص بثقة.',
    },
  },
  {
    id: 5,
    type: 'audio',
    duration: '08:00',
    title: { fr: 'Vivre après un diagnostic : témoignages', en: 'Life after a diagnosis: stories', ar: 'الحياة بعد التشخيص: شهادات' },
    author: 'Association El Amel',
    body: {
      fr: 'Des témoignages de femmes qui partagent leur parcours, pour rappeler que l\'on n\'est jamais seule.',
      en: 'Stories from women sharing their journey, a reminder that you are never alone.',
      ar: 'شهادات لنساء يشاركن مسيرتهن، تذكير بأنك لست وحدك أبدًا.',
    },
  },
]

export const warningSigns = {
  fr: [
    'Nouvelle masse ou épaississement',
    'Changement de forme ou de taille',
    'Modification de la peau (rougeur, aspect peau d\'orange)',
    'Écoulement du mamelon',
    'Douleur persistante',
    'Ganglions sous l\'aisselle',
  ],
  en: [
    'New lump or thickening',
    'Change in shape or size',
    'Skin changes (redness, orange-peel look)',
    'Nipple discharge',
    'Persistent pain',
    'Lymph nodes under the armpit',
  ],
  ar: [
    'كتلة جديدة أو سماكة',
    'تغيّر في الشكل أو الحجم',
    'تغيّر في الجلد (احمرار، مظهر قشر البرتقال)',
    'إفرازات من الحلمة',
    'ألم مستمر',
    'عقد لمفاوية تحت الإبط',
  ],
}

export const centers = [
  {
    id: 1,
    name: 'Centre de dépistage du sein — CHU Hussein Dey',
    city: 'Alger',
    rating: 4.5,
    reviews: 32,
    distance: '2,3 km',
    services: ['screening', 'mammo'],
    tags: { fr: ['Mammographie', 'Consultation', 'Suivi'], en: ['Mammography', 'Consultation', 'Follow-up'], ar: ['تصوير الثدي', 'استشارة', 'متابعة'] },
  },
  {
    id: 2,
    name: 'Clinique El Amel — Oncologie',
    city: 'Oran',
    rating: 4.7,
    reviews: 54,
    distance: '5,1 km',
    services: ['onco', 'mammo'],
    tags: { fr: ['Oncologie', 'Mammographie'], en: ['Oncology', 'Mammography'], ar: ['الأورام', 'تصوير الثدي'] },
  },
  {
    id: 3,
    name: 'Centre de santé Constantine',
    city: 'Constantine',
    rating: 4.2,
    reviews: 18,
    distance: '8,0 km',
    services: ['screening'],
    tags: { fr: ['Dépistage', 'Consultation'], en: ['Screening', 'Consultation'], ar: ['كشف', 'استشارة'] },
  },
]

export const sampleConversation = {
  fr: [
    { from: 'user', time: '10:24', text: 'Bonjour, est-ce qu\'une douleur dans le sein peut être un signe de cancer ?' },
    { from: 'pro', time: '10:37', text: 'Bonjour, la douleur peut exister dans plusieurs situations, mais elle n\'est pas toujours un signe de cancer. Il est important de faire évaluer vos symptômes par un professionnel de santé.' },
  ],
  en: [
    { from: 'user', time: '10:24', text: 'Hello, can breast pain be a sign of cancer?' },
    { from: 'pro', time: '10:37', text: 'Hello, pain can occur in several situations, but it is not always a sign of cancer. It is important to have your symptoms evaluated by a health professional.' },
  ],
  ar: [
    { from: 'user', time: '10:24', text: 'مرحبًا، هل يمكن أن يكون ألم الثدي علامة على السرطان؟' },
    { from: 'pro', time: '10:37', text: 'مرحبًا، قد يحدث الألم في حالات عدة، لكنه ليس دائمًا علامة على السرطان. من المهم تقييم أعراضك من قبل أخصائي صحة.' },
  ],
}

export const APPROVAL_EMAIL = 'meriemsaai13@gmail.com'
