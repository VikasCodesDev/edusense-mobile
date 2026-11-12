import type { AnchorHTMLAttributes, PropsWithChildren } from 'react';
import { Link as RouterLink } from 'react-router-dom';

export type NextLinkCompatProps = PropsWithChildren<
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    href: string;
    replace?: boolean;
    scroll?: boolean;
    prefetch?: boolean;
  }
>;

/**
 * Thin compatibility adapter so the existing Next.js page components can be
 * reused without changing their route links. The app's React Router owns
 * navigation; absolute HTTP(S) links remain normal anchors for the native
 * external-link policy to handle.
 */
export default function Link({
  href,
  replace,
  scroll: _scroll,
  prefetch: _prefetch,
  children,
  ...anchorProps
}: NextLinkCompatProps) {
  if (/^https?:\/\//i.test(href)) {
    return (
      <a href={href} target={anchorProps.target ?? '_blank'} rel={anchorProps.rel ?? 'noopener noreferrer'} {...anchorProps}>
        {children}
      </a>
    );
  }

  return (
    <RouterLink to={href} replace={replace} {...anchorProps}>
      {children}
    </RouterLink>
  );
}
