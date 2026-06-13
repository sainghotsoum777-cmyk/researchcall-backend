/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(auth)/forgot-password` | `/(auth)/login` | `/(auth)/register` | `/(tabs)` | `/(tabs)/` | `/(tabs)/explore` | `/(tabs)/favorites` | `/(tabs)/notifications` | `/(tabs)/profile` | `/_sitemap` | `/explore` | `/favorites` | `/forgot-password` | `/login` | `/notifications` | `/onboarding` | `/profile` | `/publish` | `/register` | `/tracker`;
      DynamicRoutes: `/calls/${Router.SingleRoutePart<T>}`;
      DynamicRouteTemplate: `/calls/[id]`;
    }
  }
}
