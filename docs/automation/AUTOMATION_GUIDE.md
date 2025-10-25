---
title: Claude Code Automation Guide
description: Complete guide to using subagents, skills, and slash commands for the Modular React Platform
last_updated: 2025-01-24
version: 1.0.0
---

# Claude Code Automation Guide

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Subagents Reference](#subagents-reference)
4. [Slash Commands Reference](#slash-commands-reference)
5. [Skills Reference](#skills-reference)
6. [MCP Integrations](#mcp-integrations)
7. [Workflow Patterns](#workflow-patterns)
8. [Best Practices](#best-practices)
9. [Quick Reference](#quick-reference)
10. [Troubleshooting](#troubleshooting)

---

## Overview

This modular React platform uses a comprehensive automation architecture with **Claude Code** to streamline development workflows. The automation consists of three layers:

### Automation Layers

```
┌─────────────────────────────────────────────┐
│         Slash Commands (/command)           │  ← User Interface
│  Quick, memorable commands for workflows    │
└──────────────────┬──────────────────────────┘
                   │ delegates to
┌──────────────────▼──────────────────────────┐
│         Skills (skills/*.md)                │  ← Existing Workflows
│  Detailed procedural instructions           │
└──────────────────┬──────────────────────────┘
                   │ references
┌──────────────────▼──────────────────────────┐
│      Subagents (.claude/agents/*.md)        │  ← Specialists
│  AI agents with isolated context & tools    │
└──────────────────┬──────────────────────────┘
                   │ uses
┌──────────────────▼──────────────────────────┐
│         MCP Servers (MCPs)                  │  ← Capabilities
│  context7, playwright, Task Master          │
└─────────────────────────────────────────────┘
```

### Key Capabilities

**🤖 9 Specialized Subagents** - AI agents with focused expertise
**⚡ 8 Slash Commands** - Quick workflow triggers
**📚 7 Skills** - Detailed procedural guides
**🔌 3 MCP Servers** - Extended capabilities

---

## Architecture

### Design Principles

1. **Separation of Concerns** - Each subagent has a single, clear responsibility
2. **Composability** - Subagents can be orchestrated for complex workflows
3. **Progressive Disclosure** - Simple commands hide complexity
4. **Tool Scoping** - Each subagent has minimal necessary permissions
5. **Integration** - Slash commands delegate to subagents, reference skills

### How They Work Together

**Example: Creating a New Tab**

```
User types: /new-tab

    ↓

Slash command provides context
and delegates to subagent

    ↓

tab-plugin-developer subagent:
- Reads tab-contract skill
- Creates files
- Configures webpack
- Coordinates with module-federation-architect

    ↓

Result: Complete, working tab
```

---

## Subagents Reference

All subagents are located in `.claude/agents/` and can be invoked explicitly or automatically based on context.

### 1. module-federation-architect

**Purpose:** Module Federation 2.0 expert

**When to Use:**
- Validating webpack configurations
- Troubleshooting "Module not found" errors
- Adding new remotes or hosts
- Checking shared dependencies
- Optimizing Module Federation setup

**Key Capabilities:**
- Validates all webpack.config.js files
- Ensures React singleton configuration
- Checks bootstrap pattern
- Verifies remote URLs
- Tests runtime loading

**Tools:** Read, Grep, Glob, Edit, WebFetch, Bash

**MCP Usage:**
- context7 for Module Federation docs
- playwright for runtime validation

**Example Usage:**
```
Use module-federation-architect to validate all webpack configs
```

---

### 2. e2e-test-maintainer

**Purpose:** Playwright E2E test specialist

**When to Use:**
- Tests are failing after changes
- UI components changed (selectors need updating)
- Adding new test scenarios
- Debugging flaky tests
- Maintaining the 40-test suite

**Key Capabilities:**
- Runs and debugs Playwright tests
- Updates test selectors
- Adds new test scenarios
- Fixes timing issues
- Validates Module Federation in tests

**Tools:** Read, Edit, Glob, Grep, Bash, Playwright MCP

**MCP Usage:**
- playwright for interactive debugging
- Chrome DevTools for inspection

**Example Usage:**
```
Use e2e-test-maintainer to fix failing tests after UI changes
```

---

### 3. component-library-developer

**Purpose:** Shared component library expert

**When to Use:**
- Creating new shared components
- Updating Box design system
- Refactoring components
- Managing semantic versioning
- Fixing component bugs

**Key Capabilities:**
- Creates Box design system components
- Configures Module Federation exposure
- Implements TypeScript types
- Ensures accessibility
- Manages component versioning

**Tools:** Read, Edit, Write, Glob, Grep, Bash

**MCP Usage:**
- context7 for React patterns
- Chrome DevTools for component inspection

**Example Usage:**
```
Use component-library-developer to create a new DatePicker component
```

---

### 4. deployment-specialist

**Purpose:** Vercel deployment and CI/CD expert

**When to Use:**
- Deploying to Vercel
- Configuring environment variables
- Troubleshooting build failures
- Setting up CI/CD
- Managing deployment order

**Key Capabilities:**
- Deploys in correct order (shared → tabs → shells)
- Configures environment variables
- Troubleshoots build issues
- Optimizes production builds
- Monitors deployments

**Tools:** Read, Bash, WebFetch, Glob, Grep

**MCP Usage:**
- context7 for Vercel/webpack docs
- playwright for deployment validation

**Example Usage:**
```
Use deployment-specialist to deploy all modules to production
```

---

### 5. documentation-curator

**Purpose:** Documentation maintenance specialist

**When to Use:**
- Documentation needs updating
- New features require docs
- Architecture changes
- Creating guides or tutorials
- Organizing documentation

**Key Capabilities:**
- Updates documentation after code changes
- Creates new documentation
- Maintains documentation architecture
- Writes effective code examples
- Ensures documentation accuracy

**Tools:** Read, Edit, Write, Glob, Grep

**MCP Usage:**
- context7 for documentation best practices

**Example Usage:**
```
Use documentation-curator to update docs after adding new tab
```

---

### 6. tab-plugin-developer

**Purpose:** Tab plugin creation specialist

**When to Use:**
- Creating new tabs from scratch
- Implementing TabPlugin interface
- Adding Redux state to tabs
- Integrating GraphQL in tabs
- Fixing tab registration issues

**Key Capabilities:**
- Creates complete tab structure
- Implements TabPlugin contract
- Configures Module Federation for tabs
- Integrates with platform state
- Implements lifecycle hooks

**Tools:** Read, Edit, Write, Glob, Grep, Bash

**MCP Usage:**
- context7 for React/Redux patterns
- Task Master for tab development tracking

**Example Usage:**
```
Use tab-plugin-developer to create an Archives tab
```

---

### 7. automation-advisor

**Purpose:** Claude Code automation expert

**When to Use:**
- Analyzing project for automation opportunities
- Recommending MCP servers
- Designing custom workflows
- Identifying repetitive tasks
- Creating automation roadmap

**Key Capabilities:**
- Analyzes workflows for automation
- Recommends MCPs and integrations
- Designs custom workflows
- Creates automation roadmap
- Identifies technical debt

**Tools:** Read, Grep, Glob, WebFetch

**MCP Usage:**
- context7 for automation patterns
- WebFetch for latest automation tools

**Example Usage:**
```
Use automation-advisor to analyze this project and suggest improvements
```

---

### 8. code-review-specialist

**Purpose:** Expert code reviewer

**When to Use:**
- Reviewing pull requests
- Conducting code audits
- Evaluating refactoring proposals
- Identifying security issues
- Checking performance problems

**Key Capabilities:**
- Comprehensive code review (8 dimensions)
- Security vulnerability detection
- Performance issue identification
- Module Federation pattern validation
- Accessibility checking

**Tools:** Read, Grep, Glob, Bash, WebFetch

**MCP Usage:**
- context7 for best practices
- playwright for visual review
- Chrome DevTools for performance analysis

**Example Usage:**
```
Use code-review-specialist to review PR #123
```

---

### 9. staff-architect

**Purpose:** Senior technical architect

**When to Use:**
- Designing system components
- Evaluating architectural trade-offs
- Complex domain modeling
- Backend integration strategy
- Technology selection decisions
- Orchestrating complex initiatives

**Key Capabilities:**
- System architecture design
- Domain-driven design
- Backend integration patterns
- Technology evaluation
- Technical debt management
- Multi-agent orchestration

**Tools:** Read, Grep, Glob, WebFetch, Bash

**MCP Usage:**
- context7 for architecture patterns
- WebFetch for technology research

**Example Usage:**
```
Use staff-architect to design real-time collaboration architecture
```

---

## Slash Commands Reference

All slash commands are located in `.claude/commands/` and provide quick access to common workflows.

### /new-tab

**Purpose:** Create a new federated tab from scratch

**What It Does:**
- Delegates to **tab-plugin-developer**
- Creates complete tab structure
- Implements TabPlugin interface
- Configures Module Federation
- Registers tab in shell
- References **add-federated-tab** skill

**Usage:**
```
/new-tab

Feature: Archives Tab
- Two-column layout
- Show archived items
- Restore functionality
```

**Time Estimate:** 30-60 minutes

---

### /fix-tests

**Purpose:** Debug and fix failing E2E tests

**What It Does:**
- Delegates to **e2e-test-maintainer**
- Runs test suite
- Diagnoses failures
- Updates selectors
- Fixes timing issues
- Ensures all 40 tests pass

**Usage:**
```
/fix-tests
```

**Prerequisites:** Services must be running (`./scripts/dev-all.sh`)

**Time Estimate:** 15-45 minutes

---

### /validate-mf

**Purpose:** Validate all Module Federation configurations

**What It Does:**
- Delegates to **module-federation-architect**
- Checks all webpack configs
- Validates shared dependencies
- Tests remote loading
- Generates validation report

**Usage:**
```
/validate-mf
```

**Time Estimate:** 10-20 minutes

---

### /deploy

**Purpose:** Deploy modules to Vercel

**What It Does:**
- Delegates to **deployment-specialist**
- Runs pre-deployment checks
- Deploys in correct order
- Sets environment variables
- Validates deployment

**Usage:**
```
/deploy production
```

or

```
/deploy staging
```

**Time Estimate:** 30-60 minutes (all modules)

---

### /suggest-workflows

**Purpose:** Analyze project and suggest automation opportunities

**What It Does:**
- Delegates to **automation-advisor**
- Analyzes current workflows
- Identifies automation opportunities
- Recommends MCP integrations
- Creates automation roadmap

**Usage:**
```
/suggest-workflows
```

**Time Estimate:** 20-30 minutes (analysis)

---

### /full-feature

**Purpose:** Complete end-to-end feature development

**What It Does:**
- **Multi-agent orchestration**
- Phase 1: staff-architect (planning)
- Phase 2: component-library-developer (components)
- Phase 3: tab-plugin-developer (tab)
- Phase 4: module-federation-architect (validation)
- Phase 5: e2e-test-maintainer (tests)
- Phase 6: documentation-curator (docs)
- Phase 7: deployment-specialist (deploy)

**Usage:**
```
/full-feature

Feature: Search Results View
Requirements:
- Full-page search results
- Breadcrumbs
- Highlight search terms
- Filter/sort options
```

**Time Estimate:** 2-6 hours (depending on complexity)

---

### /release-prep

**Purpose:** Comprehensive pre-release validation

**What It Does:**
- **Multi-agent quality gate**
- Architecture validation (module-federation-architect)
- Code review (code-review-specialist)
- Test validation (e2e-test-maintainer)
- Build verification
- Documentation check (documentation-curator)
- Deployment readiness (deployment-specialist)
- Generates release report

**Usage:**
```
/release-prep
```

**Time Estimate:** 1-4 hours (depending on depth)

---

### /polish-tab

**Purpose:** Polish existing tab to current standards

**What It Does:**
- **Multi-agent improvement workflow**
- Assessment (code-review-specialist)
- Box design updates (component-library-developer)
- Code quality improvements (code-review-specialist)
- Module Federation validation (module-federation-architect)
- Test updates (e2e-test-maintainer)
- Documentation (documentation-curator)

**Usage:**
```
/polish-tab hubs-tab
```

**Time Estimate:** 1-6 hours (depending on scope)

---

## Skills Reference

Existing skills in `skills/` provide detailed procedural guides. Subagents reference these skills.

### Existing Skills

| Skill | Purpose | Key Usage |
|-------|---------|-----------|
| **dev-workflow** | Development environment management | Starting services, troubleshooting |
| **vercel-deployment** | Vercel deployment process | Deploying to production |
| **npm-workspace** | npm workspaces and Turbo | Managing monorepo |
| **module-federation-types** | TypeScript types in MF | Type sharing strategies |
| **add-federated-tab** | Creating new tabs | Complete tab creation guide |
| **add-shared-component** | Adding shared components | Component creation process |
| **docs-navigator** | Documentation index | Finding relevant docs |

### How Subagents Use Skills

Subagents reference skills for detailed procedures:

```
tab-plugin-developer
    ↓ references
add-federated-tab skill
    ↓ provides
Step-by-step tab creation guide
```

---

## MCP Integrations

Model Context Protocol servers extend Claude's capabilities.

### Currently Integrated MCPs

#### 1. context7

**Purpose:** Fetch up-to-date library documentation

**When to Use:**
- Looking up React/webpack/Module Federation docs
- Checking current best practices
- Researching new technologies
- Finding API documentation

**Example Queries:**
```
Use context7 to look up "React compound components"
Use context7 for "webpack Module Federation 2.0"
Use context7 to find "styled-components theming"
```

**Used By:** All subagents for research

---

#### 2. playwright

**Purpose:** Browser automation and testing

**When to Use:**
- Visual validation of deployments
- Interactive test debugging
- Checking Module Federation loading
- Browser DevTools inspection

**Example Usage:**
```
Use playwright to navigate to http://localhost:3000
Check console for Module Federation errors
Take screenshot of production app
```

**Used By:**
- e2e-test-maintainer (primary user)
- deployment-specialist (validation)
- code-review-specialist (visual review)

---

#### 3. Task Master

**Purpose:** Project task management

**When to Use:**
- Managing feature development tasks
- Tracking complex initiatives
- Breaking down large projects
- Monitoring progress

**Example Usage:**
```
Use Task Master to create tasks for new feature
Track progress on tab development
Generate project status report
```

**Used By:**
- tab-plugin-developer (task tracking)
- staff-architect (initiative planning)

---

### Recommended Additional MCPs

Based on this project's needs, consider integrating:

**GitHub MCP** - For PR creation, issue management
**Brave Search MCP** - For latest web research
**Filesystem MCP** - For advanced file operations

See **automation-advisor** for detailed MCP recommendations.

---

## Workflow Patterns

### Pattern 1: Quick Single-Agent Tasks

For focused, single-purpose tasks:

```
User: /validate-mf

    ↓

module-federation-architect
validates all configs

    ↓

Report generated
```

**Use When:**
- Task is well-defined
- Single specialist can handle it
- Quick turnaround needed

---

### Pattern 2: Multi-Agent Orchestration

For complex features requiring multiple specialists:

```
User: /full-feature

    ↓

staff-architect → plans
component-library-developer → creates components
tab-plugin-developer → builds tab
module-federation-architect → validates configs
e2e-test-maintainer → adds tests
documentation-curator → documents
deployment-specialist → deploys

    ↓

Complete, production-ready feature
```

**Use When:**
- Feature spans multiple concerns
- Coordination needed
- Quality gates required

---

### Pattern 3: Iterative Improvement

For refining existing code:

```
User: /polish-tab hubs-tab

    ↓

code-review-specialist → assesses
component-library-developer → updates design
code-review-specialist → improves code
e2e-test-maintainer → updates tests
documentation-curator → documents changes

    ↓

Polished, standards-compliant tab
```

**Use When:**
- Improving existing code
- Bringing to current standards
- Reducing technical debt

---

### Pattern 4: Quality Gates

For ensuring production readiness:

```
User: /release-prep

    ↓

Multiple subagents validate:
- Architecture
- Code quality
- Tests
- Documentation
- Deployment readiness

    ↓

Release decision: ✅ READY / ⚠️ CONDITIONAL / ❌ NOT READY
```

**Use When:**
- Before production deployments
- Major releases
- Risk mitigation needed

---

## Best Practices

### 1. Choose the Right Tool

**Use Slash Commands when:**
- Quick, common workflows
- Don't need customization
- Want consistent execution

**Use Subagents Directly when:**
- Need customization
- Complex, unique scenarios
- Want detailed control

**Use Skills when:**
- Learning procedures
- Manual execution preferred
- Need reference material

---

### 2. Coordinate Subagents Effectively

**Sequential Coordination:**
```
Phase 1 completes → Phase 2 starts → Phase 3 starts
```

**Parallel Coordination:**
```
Independent tasks → Run simultaneously
```

**Use staff-architect** for complex coordination

---

### 3. Leverage MCP Servers

**Context7:**
- Always check latest docs before implementation
- Use for researching new patterns
- Verify current best practices

**Playwright:**
- Use for visual validation
- Debug tests interactively
- Verify production deployments

**Task Master:**
- Track complex initiatives
- Break down large features
- Monitor progress

---

### 4. Maintain Quality Standards

**Always:**
- Run /validate-mf before deploying
- Use /fix-tests after code changes
- Run /release-prep before production
- Use /polish-tab for existing code

---

### 5. Document Decisions

**When to Document:**
- After complex features (/full-feature)
- After architectural changes
- After release preparations
- When technical debt is identified

**Use documentation-curator** for consistency

---

## Quick Reference

### Common Tasks Cheat Sheet

| Task | Command/Subagent | Time |
|------|------------------|------|
| Create new tab | `/new-tab` | 30-60m |
| Fix failing tests | `/fix-tests` | 15-45m |
| Validate MF configs | `/validate-mf` | 10-20m |
| Deploy to production | `/deploy production` | 30-60m |
| Complete feature | `/full-feature` | 2-6h |
| Pre-release check | `/release-prep` | 1-4h |
| Polish existing tab | `/polish-tab <name>` | 1-6h |
| Get automation ideas | `/suggest-workflows` | 20-30m |
| Create component | `component-library-developer` | 20-40m |
| Review code | `code-review-specialist` | 15-30m |
| Architecture design | `staff-architect` | 30m-2h |

---

### Subagent Selection Guide

**For Module Federation issues:**
→ module-federation-architect

**For test issues:**
→ e2e-test-maintainer

**For component work:**
→ component-library-developer

**For deployment:**
→ deployment-specialist

**For documentation:**
→ documentation-curator

**For new tabs:**
→ tab-plugin-developer

**For automation:**
→ automation-advisor

**For code review:**
→ code-review-specialist

**For architecture:**
→ staff-architect

---

## Troubleshooting

### Issue: Subagent not responding

**Solution:**
- Ensure you've explicitly invoked: `Use [subagent-name] to...`
- Check subagent name is correct
- Try slash command instead

---

### Issue: Slash command not found

**Solution:**
- Check file exists in `.claude/commands/`
- Verify filename matches (e.g., `new-tab.md`)
- Restart Claude Code if recently added

---

### Issue: MCP not working

**Solution:**
- Check MCP is enabled in `.claude/settings.local.json`
- Verify API keys are set (if required)
- Check MCP server is running

---

### Issue: Workflow too slow

**Solution:**
- Use specific subagent instead of multi-agent workflow
- Break down into smaller tasks
- Run independent tasks in parallel

---

### Issue: Quality issues after automation

**Solution:**
- Always run `/release-prep` before production
- Use `code-review-specialist` to audit
- Enable appropriate hooks for prevention

---

## Examples

### Example 1: Creating a New Feature

```
1. User: /full-feature

2. Feature: Real-time Notifications
   Requirements:
   - WebSocket connection
   - Notification center component
   - Toast notifications
   - Unread count badge

3. Orchestration:
   - staff-architect: Designs WebSocket architecture
   - component-library-developer: Creates notification components
   - tab-plugin-developer: Adds notification center tab
   - module-federation-architect: Validates configs
   - e2e-test-maintainer: Adds notification tests
   - documentation-curator: Documents notification system
   - deployment-specialist: Deploys to staging

4. Result: Complete, tested, documented feature
```

---

### Example 2: Fixing Production Issue

```
1. Issue: Tests failing after UI refactor

2. User: /fix-tests

3. e2e-test-maintainer:
   - Runs test suite
   - Identifies selector changes
   - Updates 15 tests with new selectors
   - Fixes 3 timing issues
   - Verifies all 40 tests pass

4. Result: All tests passing, selectors updated
```

---

### Example 3: Pre-Release Validation

```
1. User: /release-prep

2. Multi-agent validation:
   - module-federation-architect: ✅ All configs valid
   - code-review-specialist: ✅ No security issues
   - e2e-test-maintainer: ✅ All 40 tests passing
   - documentation-curator: ✅ Docs current
   - deployment-specialist: ✅ Ready to deploy

3. Release Decision: ✅ READY TO RELEASE

4. User: /deploy production
```

---

## Extending the System

### Adding New Subagents

1. Create `.claude/agents/new-agent.md`
2. Define expertise and tools
3. Add to this guide
4. Create slash command (optional)
5. Test with real tasks

### Adding New Slash Commands

1. Create `.claude/commands/new-command.md`
2. Define workflow and delegation
3. Add to this guide
4. Test command execution
5. Document examples

### Adding New MCPs

1. Research MCP capabilities
2. Add to `.claude/settings.local.json`
3. Configure API keys (if needed)
4. Update subagents to use MCP
5. Document usage patterns

---

## Conclusion

This automation architecture provides a comprehensive, scalable approach to development workflows. By combining specialized subagents, quick slash commands, detailed skills, and powerful MCPs, you can streamline development while maintaining high quality standards.

### Key Takeaways

✅ Use slash commands for common workflows
✅ Invoke subagents for specialized tasks
✅ Reference skills for detailed procedures
✅ Leverage MCPs for extended capabilities
✅ Orchestrate multiple subagents for complex features
✅ Always validate before deploying to production

### Next Steps

1. Try `/suggest-workflows` to get personalized recommendations
2. Use `/validate-mf` to ensure configs are correct
3. Run `/release-prep` before your next deployment
4. Experiment with single-agent tasks first
5. Graduate to multi-agent workflows for complex features

---

**Version:** 1.0.0
**Last Updated:** 2025-01-24
**Maintained By:** documentation-curator subagent
**Questions?** Ask automation-advisor for help!
