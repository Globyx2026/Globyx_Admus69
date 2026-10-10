import { AE, AU, BR, CA, DE, EG, ES, FR, GB, GH, IN, IT, KE, NG, NL, PL, SE, SG, US, ZA } from 'country-flag-icons/react/3x2';
import type { CountryCode } from '@/data/countries';
import { cn } from '@/lib/utils';

// Imported one by one so only the flags we sell in are bundled. SVG flags are
// used because Windows does not draw flag emoji.
const FLAGS: Record<CountryCode, typeof KE> = {
  AE, AU, BR, CA, DE, EG, ES, FR, GB, GH, IN, IT, KE, NG, NL, PL, SE, SG, US, ZA,
};

export function Flag({ code, className }: { code: CountryCode; className?: string }) {
  const Svg = FLAGS[code];
  return (
    <span
      className={cn('inline-block h-4 w-6 shrink-0 overflow-hidden rounded-[3px] ring-1 ring-black/10', className)}
      aria-hidden="true"
    >
      <Svg className="h-full w-full object-cover" />
    </span>
  );
}
