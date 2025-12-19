"use client";

import { useEffect } from "react";

type DevtoolsHook = {
  renderers?: Map<unknown, unknown> & {
    forEach?: (_callback: (_renderer: unknown) => void) => void;
  };
  inject?: (..._args: unknown[]) => unknown;
  __semverGuardPatched?: boolean;
};

export function DevtoolsVersionGuard() {
  useEffect(() => {
    const hook = (globalThis as typeof globalThis & {
      __REACT_DEVTOOLS_GLOBAL_HOOK__?: DevtoolsHook;
    }).__REACT_DEVTOOLS_GLOBAL_HOOK__;

    if (!hook || hook.__semverGuardPatched) return;
    hook.__semverGuardPatched = true;

    const normalize = (value: unknown, fallback: string) =>
      typeof value === "string" && value.trim() ? value : fallback;

    const ensureVersion = (renderer: any) => {
      if (!renderer) return;
      const baseVersion = normalize(
        renderer.rendererPackageVersion ||
          renderer.reconcilerVersion ||
          renderer.version,
        "0.0.0",
      );
      renderer.rendererPackageVersion = normalize(
        renderer.rendererPackageVersion,
        baseVersion,
      );
      renderer.reconcilerVersion = normalize(
        renderer.reconcilerVersion,
        baseVersion,
      );
      renderer.version = normalize(renderer.version, baseVersion);
    };

    hook.renderers?.forEach?.((renderer) => {
      ensureVersion(renderer);
    });

    if (typeof hook.inject === "function") {
      const originalInject = hook.inject;
      hook.inject = function injectWithGuard(...args: unknown[]) {
        ensureVersion(args[0]);
        return originalInject.apply(this, args);
      };
    }
  }, []);

  return null;
}
