import Link from 'next/link';
import Image from 'next/image';

export function NavBrand({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} className="nav-brand">
      <Image
        src="/images/bearded-lizard.png"
        alt=""
        width={51}
        height={32}
        className="nav-brand-icon"
      />
      <span className="accent">Bio</span>Jalisco
    </Link>
  );
}
