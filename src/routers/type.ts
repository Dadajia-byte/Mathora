import { ComponentType, LazyExoticComponent } from 'react';
export interface routeItem {
  name?: string;
  path: string;
  component: ComponentType<any> | LazyExoticComponent<ComponentType<any>>;
  children?: routeItem[];
  namespaces?: string[] | string;
}

export type routerConfig = routeItem[];