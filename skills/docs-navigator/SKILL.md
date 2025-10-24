---
name: docs-navigator
description: Comprehensive index and quick reference to all documentation, guides, and key files in the modular React platform repository.
---

# Documentation Navigator

This skill provides a complete map of all documentation, guides, and important files in the modular React platform repository.

## When to Use This Skill

Use this skill when you need to:
- Find specific documentation
- Understand what documentation exists
- Locate guides for specific tasks
- Find example implementations
- Reference architecture decisions
- Access deployment guides
- Navigate the codebase structure

## Quick Reference Map

### Getting Started

| Document | Path | Description |
|----------|------|-------------|
| **README** | `README.md` | Main project overview and quick start |
| **Usage Guide** | `USAGE_GUIDE.md` | Comprehensive usage instructions |
| **Implementation Summary** | `docs/summaries/IMPLEMENTATION_SUMMARY.md` | What's built and current status |
| **Final Summary** | `docs/summaries/FINAL_SUMMARY.md` | Project completion summary |
| **Next Steps** | `docs/summaries/NEXT_STEPS.md` | Future roadmap and improvements |

### Architecture Documentation

| Document | Path | Description |
|----------|------|-------------|
| **Platform Design** | `docs/architecture/MODULAR_PLATFORM_DESIGN.md` | Complete 65-page architecture document |
| **Architecture Roadmap** | `docs/architecture/ARCHITECTURE_ROADMAP.md` | Evolutionary architecture plan |
| **Layout Design** | `docs/architecture/layout.md` | UI layout and structure |

### Implementation Guides

| Document | Path | Description |
|----------|------|-------------|
| **Implementation Guide** | `docs/implementation/IMPLEMENTATION_GUIDE.md` | Step-by-step implementation guide |
| **Box Design** | `docs/implementation/BOX_DESIGN_IMPLEMENTATION.md` | UI box component design |
| **Navigation & Dialogs** | `docs/implementation/NAVIGATION_AND_DIALOGS.md` | Navigation patterns and dialogs |
| **Search Implementation** | `docs/implementation/SEARCH_IMPLEMENTATION.md` | Search functionality guide |
| **Federated Components** | `docs/implementation/FEDERATED_COMPONENTS_VERIFICATION.md` | Component federation verification |

### Deployment Documentation

| Document | Path | Description |
|----------|------|-------------|
| **Vercel Deployment** | `docs/deployment/VERCEL_DEPLOYMENT_GUIDE.md` | Complete Vercel deployment guide |
| **Quick Start Deploy** | `docs/deployment/QUICK_START_DEPLOYMENT.md` | Fast deployment instructions |
| **Artifactory Deploy** | `docs/deployment/ARTIFACTORY_DEPLOYMENT.md` | Enterprise deployment guide |
| **General Deployment** | `docs/deployment/DEPLOYMENT.md` | Deployment overview |

### Module Federation & Types

| Document | Path | Description |
|----------|------|-------------|
| **Types Solution** | `docs/types/MODULE_FEDERATION_TYPES_SOLUTION.md` | TypeScript types strategy |
| **DTS Plugin** | `docs/types/DTS_PLUGIN_INVESTIGATION.md` | Type generation investigation |
| **Cross-Repo Types** | `docs/types/CROSS_REPO_TYPES_IMPLEMENTATION.md` | Type sharing across repos |

### Testing

| Document | Path | Description |
|----------|------|-------------|
| **E2E Test Guide** | `docs/testing/E2E_TEST_EXECUTION_GUIDE.md` | Playwright E2E testing guide |
| **E2E Tests README** | `e2e-tests/README.md` | E2E test suite documentation |
| **Contract Tests** | `contract-tests/README.md` | Contract testing documentation |

### Validation

| Document | Path | Description |
|----------|------|-------------|
| **Requirements Validation** | `docs/validation/REQUIREMENTS_VALIDATION.md` | Requirements traceability |

### Session Summaries

| Document | Path | Description |
|----------|------|-------------|
| **Session Summary** | `docs/summaries/SESSION_SUMMARY.md` | Development session notes |

## Key Configuration Files

### Root Configuration

```
/package.json                 # Root workspace configuration
/turbo.json                   # Turbo monorepo config (if exists)
/.gitignore                   # Git ignore patterns
```

### Module Configurations

```
/shared-components/
  package.json               # Component library config
  webpack.config.js          # Module Federation config
  tsconfig.json             # TypeScript configuration

/shared-data/
  package.json               # Data layer config
  webpack.config.js          # Module Federation config

/top-level-shell/
  package.json               # Main shell config
  webpack.config.js          # Host MF config

/content-platform/shell/
  package.json               # Content shell config
  webpack.config.js          # Host MF config

/content-platform/tab-contract/
  src/index.ts              # Tab plugin interface
  package.json              # Contract package config
```

## Scripts Directory

Located at: `scripts/`

| Script | Path | Purpose |
|--------|------|---------|
| **dev-all.sh** | `scripts/dev-all.sh` | Start/stop all development services |
| **deploy-vercel.sh** | `scripts/deploy-vercel.sh` | Automated Vercel deployment |
| **configure-module-federation.sh** | `scripts/configure-module-federation.sh` | Configure MF environment variables |
| **setup-vercel-projects.sh** | `scripts/setup-vercel-projects.sh` | Initial Vercel project setup |
| **configure-vercel-projects.sh** | `scripts/configure-vercel-projects.sh` | Configure Vercel projects |
| **set-root-directories.sh** | `scripts/set-root-directories.sh` | Set Vercel root directories |
| **get-deployment-urls.sh** | `scripts/get-deployment-urls.sh` | Fetch deployment URLs |
| **check-deployment-status.sh** | `scripts/check-deployment-status.sh` | Check deployment status |
| **vercel-api-helper.sh** | `scripts/vercel-api-helper.sh` | Vercel API utilities |
| **automated-vercel-deploy.sh** | `scripts/automated-vercel-deploy.sh` | Full automated deployment |

## Module Structure

### Shared Modules

```
/shared-components/          # UI component library
  src/
    components/             # React components
      Button.tsx
      Table.tsx
      Tree.tsx
      HighlightText.tsx
      Preview.tsx
    index.ts               # Component exports

/shared-data/               # State + GraphQL
  src/
    store/                 # Redux store
    events/                # Event bus
    graphql/               # GraphQL client
```

### Tab Modules

```
/content-platform/files-folders/  # Files tab
  src/
    plugin.tsx            # Tab plugin export
    FilesTab.tsx          # Tab component

/hubs-tab/                # Hubs tab
  src/plugin.tsx

/reports-tab/             # Reports tab
  src/plugin.tsx

/user-tab/                # User tab
  src/plugin.tsx
```

### Shell Applications

```
/top-level-shell/         # Main application
  src/
    App.tsx               # Main app component
    index.tsx            # Entry point

/content-platform/shell/  # Content platform
  src/
    ContentPlatform.tsx   # Platform component
    SearchPane.tsx        # Search UI
```

## Finding Information By Topic

### Module Federation

**Key docs:**
- Architecture: `docs/architecture/MODULAR_PLATFORM_DESIGN.md`
- Types: `docs/types/MODULE_FEDERATION_TYPES_SOLUTION.md`
- Implementation: `docs/implementation/FEDERATED_COMPONENTS_VERIFICATION.md`

**Key files:**
- All `webpack.config.js` files
- `shared-components/src/index.ts`

### Tab System

**Key docs:**
- Usage: `USAGE_GUIDE.md` (Creating a New Tab section)
- Contract: `content-platform/tab-contract/src/index.ts`

**Example implementations:**
- `content-platform/files-folders/src/plugin.tsx`
- `hubs-tab/src/plugin.tsx`

### State Management

**Key docs:**
- Architecture: `docs/architecture/MODULAR_PLATFORM_DESIGN.md` (State section)

**Key files:**
- `shared-data/src/store/index.ts`
- `shared-data/src/events/index.ts`

### Deployment

**Key docs:**
- Vercel: `docs/deployment/VERCEL_DEPLOYMENT_GUIDE.md`
- Quick Start: `docs/deployment/QUICK_START_DEPLOYMENT.md`
- Scripts: All files in `scripts/`

**Configuration:**
- All `vercel.json` files
- `.env.vercel` (create if needed)

### TypeScript Types

**Key docs:**
- Solution: `docs/types/MODULE_FEDERATION_TYPES_SOLUTION.md`
- DTS Plugin: `docs/types/DTS_PLUGIN_INVESTIGATION.md`
- Cross-Repo: `docs/types/CROSS_REPO_TYPES_IMPLEMENTATION.md`

**Key files:**
- All `tsconfig.json` files
- Type definitions in `src/types/` directories

### Testing

**Key docs:**
- E2E Guide: `docs/testing/E2E_TEST_EXECUTION_GUIDE.md`
- E2E README: `e2e-tests/README.md`

**Test files:**
- `e2e-tests/tests/` (Playwright tests)
- `contract-tests/` (Contract tests)

### GraphQL

**Key files:**
- `graphql-server/` (Mock GraphQL server)
- `shared-data/src/graphql/` (GraphQL client)
- `content-platform-data/` (Data layer)

## Reading Order for New Developers

If you're new to the project, read in this order:

1. **README.md** - Project overview
2. **USAGE_GUIDE.md** - How to run and use
3. **docs/architecture/MODULAR_PLATFORM_DESIGN.md** - Deep architecture understanding
4. **docs/implementation/IMPLEMENTATION_SUMMARY.md** - What's implemented
5. **docs/deployment/VERCEL_DEPLOYMENT_GUIDE.md** - Deployment process
6. **content-platform/tab-contract/src/index.ts** - Tab plugin contract
7. **Example tab implementation** - See how tabs work

## Quick Lookups

### "How do I...?"

| Task | Reference |
|------|-----------|
| Start development | `USAGE_GUIDE.md` or `scripts/dev-all.sh` |
| Add a new tab | `USAGE_GUIDE.md` (Creating a New Tab) |
| Add a shared component | `shared-components/src/components/` examples |
| Deploy to Vercel | `docs/deployment/VERCEL_DEPLOYMENT_GUIDE.md` |
| Fix type errors | `docs/types/MODULE_FEDERATION_TYPES_SOLUTION.md` |
| Run E2E tests | `docs/testing/E2E_TEST_EXECUTION_GUIDE.md` |
| Understand architecture | `docs/architecture/MODULAR_PLATFORM_DESIGN.md` |

### "Where is...?"

| Looking for | Location |
|-------------|----------|
| Tab plugin interface | `content-platform/tab-contract/src/index.ts` |
| Shared components | `shared-components/src/components/` |
| Redux store | `shared-data/src/store/` |
| Event bus | `shared-data/src/events/` |
| Example tab | `content-platform/files-folders/src/plugin.tsx` |
| Main app | `top-level-shell/src/App.tsx` |
| Content shell | `content-platform/shell/src/ContentPlatform.tsx` |
| Webpack configs | `*/webpack.config.js` (in each module) |
| Deployment scripts | `scripts/` |
| E2E tests | `e2e-tests/tests/` |

## Documentation Standards

All documentation in this repo follows these standards:

1. **Markdown format** - All docs are `.md` files
2. **Clear headings** - Hierarchical structure with H1-H4
3. **Code examples** - Inline code and code blocks with syntax highlighting
4. **File paths** - Absolute or relative paths clearly indicated
5. **Cross-references** - Links to related documentation
6. **Table of contents** - Major docs include TOC
7. **Examples** - Real examples from the codebase

## Contributing to Documentation

When adding new documentation:

1. **Choose the right location:**
   - Architecture → `docs/architecture/`
   - Implementation → `docs/implementation/`
   - Deployment → `docs/deployment/`
   - Testing → `docs/testing/`
   - Types → `docs/types/`
   - Summaries → `docs/summaries/`

2. **Use consistent formatting:**
   - H1 for document title
   - H2 for main sections
   - H3 for subsections
   - Code blocks with language tags

3. **Include examples:**
   - Real code from the repo
   - Complete, runnable examples
   - Expected output

4. **Add cross-references:**
   - Link to related docs
   - Reference key files
   - Guide readers to next steps

5. **Update this navigator:**
   - Add new docs to relevant sections
   - Update the quick reference map
   - Keep the index current

## Document Templates

### Architecture Document Template

```markdown
# [Feature Name] Architecture

## Overview
Brief description of the feature and its purpose.

## Design Decisions
Key architectural decisions and rationale.

## Implementation
Technical implementation details.

## Integration
How it integrates with other modules.

## Trade-offs
Advantages and disadvantages of the approach.

## References
- Related docs
- Key files
```

### Implementation Guide Template

```markdown
# [Feature Name] Implementation Guide

## Prerequisites
What you need before starting.

## Step-by-Step Instructions
1. Step one with code
2. Step two with code
...

## Testing
How to verify it works.

## Troubleshooting
Common issues and solutions.

## References
Links to related resources.
```

## Quick Reference Commands

```bash
# Find documentation
find . -name "*.md" -type f

# Search documentation content
grep -r "search term" docs/

# List all guides
ls -la docs/*/*.md

# View README
cat README.md

# View usage guide
cat USAGE_GUIDE.md

# List scripts
ls -la scripts/
```

## Related Skills

All Claude skills for this repository:
- **dev-workflow**: Development environment and scripts
- **vercel-deployment**: Vercel deployment process
- **npm-workspace**: Workspace and npm commands
- **module-federation-types**: TypeScript types in MF
- **add-federated-tab**: Creating new tabs
- **add-shared-component**: Adding shared components

## Documentation Health

**Last Updated:** 2025-01-24

**Completeness:**
- ✅ Architecture fully documented
- ✅ Implementation guides complete
- ✅ Deployment guides complete
- ✅ Testing guides complete
- ✅ Type strategy documented
- ✅ All major features documented

**Quality:**
- ✅ Code examples verified
- ✅ File paths accurate
- ✅ Cross-references checked
- ✅ Consistent formatting

## Feedback

If documentation is missing, unclear, or incorrect:

1. Check if it exists elsewhere in the repo
2. Consult related documentation
3. Review actual code implementation
4. Update documentation as needed
5. Keep this navigator current

---

**Note:** This navigator is a living document. Update it whenever new documentation is added or existing documentation is significantly changed.
