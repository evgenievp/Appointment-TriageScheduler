import {
  Activity,
  Brain,
  CalendarCheck,
  CalendarX,
  ChevronDown,
  Eye,
  EyeOff,
  HeartPulse,
  Menu,
  PersonStanding,
  Phone,
  ShieldCheck,
  Stethoscope,
  Sun,
  Trash2,
  TriangleAlert,
  X,
} from 'lucide-react';

// Lucide is what the design system uses. The wrapper stays for two reasons:
// `size` can be a token (lucide only takes numbers), and if the clinic ever
// ships its own icon set, this is the single place that changes.
//
// Names match lucide-static, because that is how the design files refer to them
// and how `iconForSpeciality` and the demo data spell them.
const icons = {
  activity: Activity,
  brain: Brain,
  'calendar-check': CalendarCheck,
  'calendar-x': CalendarX,
  'chevron-down': ChevronDown,
  eye: Eye,
  'eye-off': EyeOff,
  'heart-pulse': HeartPulse,
  menu: Menu,
  'person-standing': PersonStanding,
  phone: Phone,
  'shield-check': ShieldCheck,
  stethoscope: Stethoscope,
  sun: Sun,
  'trash-2': Trash2,
  'triangle-alert': TriangleAlert,
  x: X,
};

export default function Icon({ name, size = 'var(--icon-lg)', style }) {
  const Glyph = icons[name];
  if (!Glyph) return null;

  return (
    <Glyph
      aria-hidden="true"
      style={{ width: size, height: size, flexShrink: 0, ...style }}
    />
  );
}
