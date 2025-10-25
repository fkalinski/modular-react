# Claude Skills for Modular React Platform

This directory contains Claude skills designed to help with development, deployment, and maintenance of the modular React Module Federation platform.

## What are Claude Skills?

Claude skills are specialized instruction sets that enhance Claude's ability to help with specific tasks in this repository. Each skill provides:
- Detailed procedural instructions
- Context about the codebase
- Examples and best practices
- References to relevant files and documentation
- Troubleshooting guidance

## Available Skills

### 1. dev-workflow
**Purpose:** Development environment management and workflow

**Use when you need to:**
- Start/stop development services
- Manage the development environment
- Use development helper scripts
- Troubleshoot development issues
- Understand service architecture

**Key features:**
- Complete guide to `dev-all.sh` script
- Service and port management
- Log file locations
- Common development tasks
- Troubleshooting tips

**Location:** `skills/dev-workflow/SKILL.md`

---

### 2. vercel-deployment
**Purpose:** Deploying the platform to Vercel

**Use when you need to:**
- Deploy modules to Vercel
- Configure environment variables
- Set up Module Federation remote URLs
- Troubleshoot deployment issues
- Automate deployment process

**Key features:**
- Critical deployment order
- Automated deployment scripts
- Environment variable configuration
- Testing deployments
- Common issues and solutions

**Location:** `skills/vercel-deployment/SKILL.md`

---

### 3. npm-workspace
**Purpose:** Managing npm workspaces and Turbo commands

**Use when you need to:**
- Run commands across workspaces
- Build all or specific modules
- Manage workspace dependencies
- Use Turbo for parallel execution
- Understand workspace structure

**Key features:**
- Workspace structure overview
- Turbo command usage
- Dependency management
- Build workflows
- Troubleshooting workspace issues

**Location:** `skills/npm-workspace/SKILL.md`

---

### 4. module-federation-types
**Purpose:** Handling TypeScript types in Module Federation

**Use when you need to:**
- Generate types for federated modules
- Share types across remotes
- Configure webpack for types
- Troubleshoot type errors
- Understand type strategies

**Key features:**
- Type generation configuration
- Type sharing strategies
- Type stubs and declarations
- Common type patterns
- DTS plugin usage

**Location:** `skills/module-federation-types/SKILL.md`

---

### 5. add-federated-tab
**Purpose:** Creating new federated tabs

**Use when you need to:**
- Create a new tab from scratch
- Implement TabPlugin interface
- Configure Module Federation for tabs
- Register tabs in shells
- Add tab-specific state and actions

**Key features:**
- Complete step-by-step guide
- TabPlugin contract explanation
- Webpack configuration templates
- Lifecycle hooks
- Testing procedures

**Location:** `skills/add-federated-tab/SKILL.md`

---

### 6. add-shared-component
**Purpose:** Adding components to the shared library

**Use when you need to:**
- Create reusable components
- Expose components via Module Federation
- Update component exports
- Version shared components
- Test components across modules

**Key features:**
- Component creation guide
- Module Federation exposure
- Component patterns
- Styling strategies
- Semantic versioning

**Location:** `skills/add-shared-component/SKILL.md`

---

### 7. docs-navigator
**Purpose:** Navigate all documentation in the repository

**Use when you need to:**
- Find specific documentation
- Understand documentation structure
- Locate guides for tasks
- Reference architecture decisions
- Access deployment guides

**Key features:**
- Complete documentation map
- Quick reference tables
- Reading order for new developers
- "How do I...?" lookups
- "Where is...?" index

**Location:** `skills/docs-navigator/SKILL.md`

---

## How to Use Skills

Claude will automatically use these skills when working in this repository. You can also explicitly reference a skill:

```
Use the dev-workflow skill to help me start all services
```

```
Use the add-federated-tab skill to guide me through creating a new tab
```

```
Use the docs-navigator skill to find documentation about Module Federation types
```

## Skill Structure

Each skill follows Anthropic's best practices:

```markdown
---
name: skill-name
description: Brief description of what this skill does
---

# Skill Title

## When to Use This Skill
Clear triggers for when to use this skill

## Main Content
Detailed, procedural instructions

## Examples
Real code examples from the codebase

## Quick Reference
Command summaries and checklists

## Related Skills
Links to other relevant skills

## References
Key files and documentation
```

## Skills Best Practices

These skills follow established patterns:

1. **Procedural instructions** - Step-by-step guidance
2. **Real examples** - Code from actual repository
3. **File references** - Absolute paths to relevant files
4. **Cross-references** - Links to related skills and docs
5. **Troubleshooting** - Common issues and solutions
6. **Quick reference** - Command summaries and checklists

## Updating Skills

When updating skills:

1. **Keep instructions current** with code changes
2. **Update file paths** if structure changes
3. **Add new patterns** as they emerge
4. **Remove outdated** practices
5. **Cross-reference** related skills
6. **Test instructions** to ensure accuracy

## Common Workflows

### Starting Development
1. Use **dev-workflow** to start services
2. Use **docs-navigator** to find relevant docs

### Adding Features
1. Use **add-federated-tab** or **add-shared-component**
2. Use **module-federation-types** for type setup
3. Use **dev-workflow** to test locally

### Deploying
1. Use **npm-workspace** to build all modules
2. Use **vercel-deployment** to deploy
3. Use **docs-navigator** to reference deployment docs

### Troubleshooting
1. Use **dev-workflow** for development issues
2. Use **module-federation-types** for type errors
3. Use **docs-navigator** to find relevant documentation

## Quick Start for New Developers

If you're new to this project:

1. **Start with docs-navigator** - Understand documentation structure
2. **Read main docs** - README, USAGE_GUIDE, architecture docs
3. **Use dev-workflow** - Set up development environment
4. **Explore skills** - Read through each skill to understand capabilities

## Contributing to Skills

When adding or modifying skills:

1. **Follow the template** structure
2. **Include real examples** from the codebase
3. **Test all instructions** before committing
4. **Update cross-references** in related skills
5. **Update this README** with new skills

## Skill Dependencies

Skills reference each other:

```
dev-workflow
  └─> npm-workspace (for build commands)
  └─> docs-navigator (for documentation)

vercel-deployment
  └─> dev-workflow (for local testing)
  └─> npm-workspace (for builds)

add-federated-tab
  └─> module-federation-types (for types)
  └─> add-shared-component (for using components)
  └─> dev-workflow (for testing)

add-shared-component
  └─> module-federation-types (for type exports)
  └─> dev-workflow (for testing)

module-federation-types
  └─> docs-navigator (for docs references)
```

## Feedback

If you find issues with skills or have suggestions:

1. **Update the skill** directly
2. **Test your changes** thoroughly
3. **Update related skills** if needed
4. **Update this README** if structure changes

## Additional Resources

- **Main README:** `/Users/fkalinski/dev/fkalinski/modular-react/README.md`
- **Usage Guide:** `/Users/fkalinski/dev/fkalinski/modular-react/USAGE_GUIDE.md`
- **Architecture:** `/Users/fkalinski/dev/fkalinski/modular-react/docs/architecture/`
- **Documentation:** All docs indexed in **docs-navigator** skill

---

**Last Updated:** 2025-01-24

**Skills Version:** 1.0.0

**Status:** ✅ All skills complete and tested
