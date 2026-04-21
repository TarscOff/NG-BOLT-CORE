export interface HeaderNavLink {
  label: string;
  /** Target section ID for scroll-to behaviour */
  target?: string;
  url?: string;
  isUrlBlank?: boolean;
  icon?: string;
  children?: HeaderNavLink[];
}

export interface HeaderLanguage {
  code: string;
  label: string;
}
