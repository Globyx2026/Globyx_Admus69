import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { motion } from 'framer-motion';
import { ChevronDown, Menu, X } from 'lucide-react';
import { companyNav, primaryNav } from '@/data/site';
import { cn } from '@/lib/utils';
import { ButtonLink } from '@/components/ui/Button';
import { Logo } from './Logo';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-md py-2 text-[13px] transition-colors duration-200',
    isActive ? 'text-cream' : 'text-cream/65 hover:text-cream',
  );

function CompanyMenu() {
  const { pathname } = useLocation();
  const active = companyNav.some((item) => item.to === pathname);

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger
        className={cn(
          'group inline-flex items-center gap-1 rounded-md py-2 text-[13px] transition-colors duration-200',
          active ? 'text-cream' : 'text-cream/65 hover:text-cream data-[state=open]:text-cream',
        )}
      >
        Company
        <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="center"
          sideOffset={10}
          className="glass z-[60] min-w-44 !rounded-2xl !bg-ink/85 p-1.5 text-cream"
        >
          {companyNav.map((item) => (
            <DropdownMenu.Item key={item.to} asChild>
              <Link
                to={item.to}
                className="block rounded-xl px-3 py-2 text-[13px] text-cream/80 outline-none transition-colors data-[highlighted]:bg-white/10 data-[highlighted]:text-cream"
              >
                {item.label}
              </Link>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function MobileMenu() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // Close the sheet whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  const links = [...primaryNav, ...companyNav];

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        className="grid h-10 w-10 place-items-center rounded-full text-cream transition-colors hover:bg-white/10 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-[70] flex flex-col overflow-y-auto bg-ink text-cream animate-fade-in"
        >
          <Dialog.Title className="sr-only">Menu</Dialog.Title>
          <div className="shell flex h-[68px] shrink-0 items-center justify-between">
            <Logo />
            <Dialog.Close
              className="grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-white/10"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <nav aria-label="Mobile" className="shell flex flex-1 flex-col justify-center gap-1 py-8">
            {links.map((item, index) => (
              <motion.div
                key={item.to}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.05 + index * 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'block rounded-lg py-2 font-serif text-[2.5rem] leading-tight tracking-[-0.02em] transition-colors',
                      isActive ? 'text-glow' : 'text-cream hover:text-glow',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </motion.div>
            ))}
          </nav>

          <div className="shell grid shrink-0 grid-cols-2 gap-3 pb-8">
            <ButtonLink to="/login" variant="ghost">
              Login
            </ButtonLink>
            <ButtonLink to="/signup">Get started</ButtonLink>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-300',
        scrolled ? 'border-white/10 bg-ink/90 backdrop-blur-xl' : 'border-transparent bg-transparent',
      )}
    >
      <div className="shell flex h-[68px] items-center justify-between gap-6">
        <Logo className="text-cream" />

        <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
          {primaryNav.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
          <CompanyMenu />
        </nav>

        <div className="flex items-center gap-1 sm:gap-3">
          <Link
            to="/login"
            className="rounded-md px-3 py-2 text-[13px] text-cream/75 transition-colors duration-200 hover:text-cream"
          >
            Login
          </Link>
          <ButtonLink to="/signup" variant="secondary" size="sm" className="hidden lg:inline-flex">
            Get started
          </ButtonLink>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
