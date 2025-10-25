---
description: Analyze the project and suggest automation opportunities, MCP integrations, and workflow improvements.
---

# Suggest Automation Workflows

Analyze this project and recommend automation opportunities to improve developer productivity.

## Context
This is a modular React platform with Module Federation, multiple repositories, and complex workflows. We have:

**Current Automation:**
- 9 specialized subagents in `.claude/agents/`
- 7 skills in `skills/`
- Development scripts in `scripts/`
- Existing Claude skills and slash commands

**Available MCPs:**
- context7 (documentation)
- playwright (browser automation)
- Task Master (project management)

## Task
Please delegate this to the **automation-advisor** subagent to:

1. **Analyze current workflows:**
   - Review git commit patterns
   - Examine existing scripts
   - Identify repetitive manual tasks
   - Check for error-prone processes

2. **Identify automation opportunities:**
   - High-impact, easy-to-implement improvements
   - Medium effort, high value additions
   - Long-term strategic automation

3. **Recommend MCP integrations:**
   - Which MCPs would provide value?
   - Specific use cases for each
   - Integration effort and ROI
   - Priority ranking

4. **Design custom workflows:**
   - Slash commands for common tasks
   - Hooks for quality enforcement
   - Subagent coordination patterns
   - CI/CD optimizations

5. **Create automation roadmap:**
   - Phase 1: Quick wins (this week)
   - Phase 2: Core automation (this month)
   - Phase 3: Advanced automation (next quarter)
   - Success metrics for each phase

## Areas to Analyze

**Code Generation:**
- Component scaffolding
- Test file generation
- Documentation templates

**Quality Assurance:**
- Pre-commit hooks
- Automated code review
- Test coverage enforcement

**Deployment:**
- Deployment validation
- Rollback automation
- Environment management

**Documentation:**
- Auto-update on code changes
- API documentation generation
- Release notes generation

## Deliverables

1. **Analysis Report:**
   - Current state assessment
   - Opportunities identified
   - Prioritized recommendations

2. **MCP Recommendations:**
   - Specific MCPs to integrate
   - Use cases and value prop
   - Integration guide

3. **Workflow Designs:**
   - New slash commands to create
   - Hooks to implement
   - Subagent coordination patterns

4. **Implementation Roadmap:**
   - Phased approach
   - Effort estimates
   - Expected ROI

## Success Criteria
- Clear, actionable recommendations
- Prioritized by impact and effort
- Specific workflow designs
- Realistic implementation roadmap
- Considers team adoption

This analysis should be comprehensive but pragmatic, focusing on automation that provides real value to the development workflow.
