// Специалностите идват от бекенда като свободен текст, затова иконата се избира
// по познати стойности с резервен вариант. Ако екипът въведе enum за
// специалностите, това става просто съответствие по код.
const ICONS = {
  Кардиология: 'heart-pulse',
  'Обща медицина': 'stethoscope',
  Ортопедия: 'activity',
  Неврология: 'brain',
  Педиатрия: 'person-standing',
  Дерматология: 'sun',
};

export const iconForSpeciality = (speciality) => ICONS[speciality] ?? 'stethoscope';
