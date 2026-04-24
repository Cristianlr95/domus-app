import { generatedEnvironment } from './environment.generated';

export const environment = {
  production: false,
  ...generatedEnvironment,
} as const;
