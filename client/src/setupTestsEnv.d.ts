/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import '@testing-library/jest-dom';
import { expect } from 'vitest';

declare global {
  namespace Vi {
    interface Assertion extends jest.Matchers<any, any>, jest.Matchers<void, any> {
      toBeInTheDocument(): void;
      toHaveValue(value: string | string[] | number): void;
    }
  }
}