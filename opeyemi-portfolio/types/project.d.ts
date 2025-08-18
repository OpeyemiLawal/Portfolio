import { StaticImageData } from 'next/image';

export interface ProjectLink {
  demo?: string;
  github?: string;
  repo?: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: 'web' | 'mobile' | 'game';
  year: number;
  thumbnail: StaticImageData | string;
  video?: string;
  images?: string[];
  stack?: string[];
  aiTools?: string[];
  links?: ProjectLink;
  isPlayable?: boolean;
  gallery?: string[];
  cover?: string;
}

export interface ProjectsData {
  projects: Project[];
}
