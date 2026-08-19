export type Article = {
  id: string;
  title: string;
  publication: string;
  date: string;
  displayDate: string;
  author: string;
  excerpt: string;
  url: string;
  image?: string;
  imageAlt?: string;
  featured?: boolean;
};

export type NewsItem = {
  id: string;
  title: string;
  publication: string;
  date: string;
  displayDate: string;
  excerpt: string;
  url: string;
  image?: string;
  imageAlt?: string;
  featured?: boolean;
};

export type Project = {
  num: string;
  cat: string;
  title: string;
  sub: string;
  url: string;
};
