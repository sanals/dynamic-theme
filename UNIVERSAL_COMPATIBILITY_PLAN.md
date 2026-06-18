# Standalone Widget Universal Compatibility Modes

The goal is to expand the widget's capabilities so it can theme *any* arbitrary website. We will introduce three new injection engines ("modes") alongside the existing `default` and `custom` modes, ensuring each mode's logic is isolated in its own dedicated module.

## User Review Required

> [!WARNING]
> Building the CSSOM Auto-Themer (`cssom` mode) and the Global Style Forcer (`forcer` mode) introduces significant complexity. These modes operate heuristically and may have unpredictable visual results on highly complex legacy websites.

> [!IMPORTANT]
> The `mapper` mode will require a new UI panel within the widget where the user can specify their custom CSS variable names (e.g., mapping our `--primary` to their `--brand-color-main`).

## Open Questions

1. **Mapper UI:** Where should the configuration for the `mapper` mode live? Should we add a settings cog ⚙️ in the widget header that opens a variable mapping table?
2. **Persistence:** Should the selected mode and the mapped variables be saved to `localStorage` so they persist across sessions?

## Proposed Architecture

We will separate the injection logic from the React state by creating dedicated "Engine" classes/functions for each mode. The `WidgetStateProvider` will simply call the active engine.

### [State Management & Provider]

#### [MODIFY] [WidgetStateProvider.tsx](file:///c:/dev/projects/dynamic-themeable-website/src/widget/WidgetStateProvider.tsx)
- Update the `mode` state type to: `"default" | "custom" | "mapper" | "cssom" | "forcer"`.
- Remove the inline `useEffect` that manually injects `el.style.setProperty`.
- Delegate all color application logic to an `EngineFactory` that instantiates the correct engine based on the active mode.
- Add state for storing the user's custom variable mappings (for the `mapper` mode).

### [Injection Engines (New Modules)]

We will create a new directory `src/widget/engines/` to isolate the logic.

#### [NEW] [engines/types.ts](file:///c:/dev/projects/dynamic-themeable-website/src/widget/engines/types.ts)
- Define a common interface `InjectionEngine` with methods:
  - `apply(colors: CustomColors, options?: EngineOptions): void`
  - `cleanup(): void` (crucial for removing injected `<style>` tags when switching modes)

#### [NEW] [engines/custom-engine.ts](file:///c:/dev/projects/dynamic-themeable-website/src/widget/engines/custom-engine.ts)
- Moves the existing logic here.
- Applies standard variables (`--primary`, `--background`) to the `targetElement`.

#### [NEW] [engines/mapper-engine.ts](file:///c:/dev/projects/dynamic-themeable-website/src/widget/engines/mapper-engine.ts)
- Takes a user-provided mapping object (e.g., `{ primary: '--theme-color-1' }`).
- Applies the generated colors to the mapped variable names on the `targetElement`.

#### [NEW] [engines/forcer-engine.ts](file:///c:/dev/projects/dynamic-themeable-website/src/widget/engines/forcer-engine.ts)
- Creates a dedicated `<style id="theme-widget-forcer">` tag in the document `<head>`.
- Generates high-specificity CSS rules targeting standard HTML elements (e.g., `body`, `h1-h6`, `button`, `input`).
- Overrides `background-color`, `color`, and `border-color` with `!important`.

#### [NEW] [engines/cssom-engine.ts](file:///c:/dev/projects/dynamic-themeable-website/src/widget/engines/cssom-engine.ts)
- Iterates through `document.styleSheets`.
- Uses regex and CSSOM APIs to find existing color declarations.
- Dynamically generates overriding CSS rules that map the host's hardcoded colors to the closest matching widget variable (background vs foreground).

### [User Interface Updates]

#### [MODIFY] [design-controls.tsx](file:///c:/dev/projects/dynamic-themeable-website/components/design-controls.tsx)
- Update the main mode toggle (currently "Default" / "Custom") to a dropdown or a set of icons representing the 5 modes.
- If `mapper` mode is active, render a "Variable Mapping" configuration panel allowing the user to map our 16 tokens to their own CSS variables.

## Verification Plan

### Automated Build Tests
- Run `npm run build` to ensure the new engines compile correctly via Vite and don't introduce circular dependencies.

### Manual Verification
- **Custom Mode:** Ensure it still applies variables to `:root` exactly as it does now.
- **Forcer Mode:** Test on a basic vanilla HTML site without variables to ensure buttons and backgrounds change colors aggressively.
- **Mapper Mode:** Create a dummy page using a variable like `--my-weird-color: red`, map it in the widget, and verify the page updates.
- **Mode Switching:** Vigorously switch between the 5 modes to ensure the `cleanup()` function of each engine perfectly removes its artifacts (e.g., the Forcer's `<style>` tag disappears).
