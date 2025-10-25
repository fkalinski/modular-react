---
description: Complete end-to-end feature development workflow orchestrating multiple subagents for component, tab, tests, docs, and deployment.
---

# Full Feature Development

Implement a complete feature end-to-end, coordinating multiple subagents for a production-ready result.

## Context
This command orchestrates a complete feature development workflow:
- Create shared components (if needed)
- Build the tab plugin
- Set up tests
- Write documentation
- Deploy to staging

This is a **multi-agent workflow** that requires coordination across several specialists.

## Workflow Steps

### Phase 1: Planning (staff-architect)
First, use the **staff-architect** subagent to:
- Understand feature requirements
- Design architecture and data model
- Identify components needed
- Plan integration points
- Create implementation plan

### Phase 2: Shared Components (if needed)
If new shared components are required, use **component-library-developer** to:
- Create component files
- Implement with Box design system
- Add TypeScript types
- Expose via Module Federation
- Test in isolation

### Phase 3: Tab Development
Use **tab-plugin-developer** to:
- Create tab directory structure
- Implement TabPlugin interface
- Configure Module Federation
- Build tab UI using shared components
- Add Redux reducer (if needed)
- Implement lifecycle hooks

### Phase 4: Configuration Validation
Use **module-federation-architect** to:
- Validate all webpack configs
- Check remote URLs
- Verify shared dependencies
- Test runtime loading

### Phase 5: Testing
Use **e2e-test-maintainer** to:
- Add E2E tests for new feature
- Test tab loading and integration
- Test user workflows
- Verify Module Federation aspects
- Ensure all tests pass

### Phase 6: Documentation
Use **documentation-curator** to:
- Document the new feature
- Update USAGE_GUIDE.md
- Update architecture docs
- Add code examples
- Update README if needed

### Phase 7: Deployment (optional)
Use **deployment-specialist** to:
- Deploy to staging environment
- Verify deployment
- Test in production-like environment

## Usage Examples

**Example 1: New "Archives" Tab**
```
/full-feature

Feature: Archives Tab
Requirements:
- Show archived/deleted items
- Two-column layout (tree + table)
- Restore functionality
- Filter by date range
- Search within archives
```

**Example 2: "Search Results" View**
```
/full-feature

Feature: Dedicated Search Results View
Requirements:
- Full-page search results
- Breadcrumbs under each result
- Back navigation
- Filter/sort options
- Highlight search terms
```

## Success Criteria

After completion, verify:
- [ ] Feature is fully implemented
- [ ] All components follow Box design system
- [ ] Module Federation configs are correct
- [ ] E2E tests pass
- [ ] Documentation is complete
- [ ] Feature works in development
- [ ] Feature deployed to staging (if requested)
- [ ] Code review ready (no obvious issues)

## Quality Gates

Each phase must complete successfully before moving to the next:
- Architecture approved
- Components work in isolation
- Tab loads without errors
- All tests pass
- Documentation is clear and accurate

## Time Estimate

Typical timeline:
- Simple tab (table view): 2-4 hours
- Medium complexity (custom interactions): 4-6 hours
- Complex feature (new patterns): 6-8 hours

## Notes

- This is a **coordinated workflow** - each subagent completes their phase before the next begins
- The **staff-architect** may be consulted if architectural decisions are needed
- The **code-review-specialist** can review the final implementation
- Use **automation-advisor** to suggest how to automate similar features in the future

This command ensures consistent, high-quality feature development following all platform patterns and best practices.
