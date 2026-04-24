export interface HeaderNavFeaturedPanel {
  imageSrc: string;
  title: string;
  description?: string;
  url: string;
  isUrlBlank?: boolean;
}

export interface HeaderNavLink {
  label: string;
  /** Target section ID for scroll-to behaviour */
  target?: string;
  url?: string;
  isUrlBlank?: boolean;
  icon?: string;
  children?: HeaderNavLink[];
  /** When present, a featured panel is rendered on the far-right of the mega-menu. */
  featuredPanel?: HeaderNavFeaturedPanel;
}

export interface HeaderLanguage {
  code: string;
  label: string;
}

export interface HeaderLogo {
  logoSrc: string;
  logoAlt: string;
  logoName?: string;
  logoHref: string;
}
