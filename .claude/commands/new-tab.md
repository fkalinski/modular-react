---
description: Create a new federated tab from scratch with TabPlugin interface, Module Federation config, and full integration.
---

# Create New Tab

I need to create a complete new federated tab for this modular platform.

## Context
This platform uses a tab plugin architecture where tabs are independent federated modules that implement the TabPlugin interface. All tabs follow the same patterns:

- Implement TabPlugin contract from `content-platform/tab-contract`
- Use Module Federation to expose the plugin
- Integrate with platform state via Redux context
- Follow Box design system
- Include lifecycle hooks (onActivate, onDeactivate)
- Lazy load shared components

## Task
Please delegate this to the **tab-plugin-developer** subagent to:

1. Create the complete directory structure
2. Set up package.json with correct dependencies
3. Configure webpack with ModuleFederationPlugin
4. Implement the TabPlugin interface in src/plugin.tsx
5. Create tsconfig.json
6. Register the tab in the appropriate shell
7. Test that the tab loads correctly
8. Ensure it follows Box design system

## Integration Points
- Uses shared components from `shared_components` remote
- Consumes platform context (state, dispatch)
- Registers with Content Platform Shell or Top-Level Shell
- Port allocation: Choose next available port (3008+)

## Success Criteria
- Tab loads without console errors
- TabPlugin interface correctly implemented
- Module Federation configuration valid
- Tab appears in shell navigation
- Follows Box design system
- Documentation updated

Use the **add-federated-tab** skill as reference, and coordinate with **module-federation-architect** if webpack config validation is needed.
