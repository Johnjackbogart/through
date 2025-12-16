"use client";

import { useEffect } from "react";

type DevtoolsHook = {
  renderers?: Map<unknown, unknown> & {
    forEach?: (callback: (renderer: unknown) => void) => void;
  };
  inject?: (renderer: unknown) => unknown;
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
      hook.inject = function injectWithGuard(renderer: unknown) {
        ensureVersion(renderer);
        return originalInject.apply(this, arguments as any);
      };
    }
  }, []);

  return null;
}
