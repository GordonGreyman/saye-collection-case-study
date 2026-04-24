export type SayeScreen = 'landing' | 'discover' | 'archive' | 'build-profile' | 'profile' | 'auth'

export type NavigateFn = (screen: SayeScreen) => void

const SCREEN_PATHS: Record<SayeScreen, string> = {
  landing: '/',
  discover: '/discover',
  archive: '/archive',
  'build-profile': '/build-profile',
  profile: '/profile/demo',
  auth: '/login',
}

export function pathForScreen(screen: SayeScreen): string {
  return SCREEN_PATHS[screen]
}

