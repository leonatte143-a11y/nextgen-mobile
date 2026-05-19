import type { NavigationState } from '@react-navigation/native';
import { logNav, logScreen } from '../lib/devLog';

function getActiveRouteName(state: NavigationState | undefined): string | undefined {
  if (!state) return undefined;
  const route = state.routes[state.index];
  if (route.state) {
    return getActiveRouteName(route.state as NavigationState);
  }
  return route.name;
}

let lastRoute: string | undefined;

export function onNavigationStateChange(state: NavigationState | undefined) {
  const name = getActiveRouteName(state);
  if (!name || name === lastRoute) return;
  logNav(lastRoute, name);
  logScreen(name);
  lastRoute = name;
}
