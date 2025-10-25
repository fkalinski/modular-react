---
description: Polish an existing tab to match Box design system, update tests, and improve code quality.
---

# Polish Existing Tab

Improve an existing tab to match current standards: Box design system, clean code, updated tests, complete documentation.

## Context
Some existing tabs were created before the Box design system was fully implemented or may have accumulated technical debt. This command brings a tab up to current standards.

**Tabs available to polish:**
- hubs-tab (port 3005) - External tab with card grid
- reports-tab (port 3006) - Simple data table
- user-tab (port 3007) - Form-based tab

## Polishing Workflow

### Phase 1: Assessment (code-review-specialist)
Use **code-review-specialist** to analyze the tab:
- [ ] Review current implementation
- [ ] Identify code quality issues
- [ ] Check Box design system compliance
- [ ] Find accessibility issues
- [ ] Assess test coverage
- [ ] Document improvement opportunities

Generate assessment report with:
- Current state analysis
- Issues categorized by severity
- Specific recommendations
- Estimated effort for fixes

### Phase 2: Box Design System Updates
Use **component-library-developer** to:
- [ ] Update colors to Box palette
  - Primary: #0061d5
  - Background: #f7f7f8
  - Surface: #ffffff
  - Border: #e2e2e2
  - Text: #222222

- [ ] Update spacing to Box standards
  - Use consistent padding: 12px, 16px, 20px
  - Apply proper margins between sections

- [ ] Update borders and radius
  - Border: 1px solid #e2e2e2
  - Border radius: 4px

- [ ] Update transitions
  - Use: all 0.15s ease

- [ ] Update hover states
  - Subtle box-shadow
  - Border color change

- [ ] Ensure responsive behavior

### Phase 3: Code Quality Improvements
Use **code-review-specialist** to:
- [ ] Remove code duplication
- [ ] Improve TypeScript types
- [ ] Add proper error handling
- [ ] Optimize performance (memoization)
- [ ] Add data-testid attributes
- [ ] Improve accessibility (ARIA, keyboard nav)
- [ ] Clean up console.logs
- [ ] Add meaningful comments

### Phase 4: Module Federation Validation
Use **module-federation-architect** to:
- [ ] Verify webpack config is optimal
- [ ] Check shared dependencies
- [ ] Ensure lazy loading of federated components
- [ ] Validate remote URLs
- [ ] Confirm bootstrap pattern

### Phase 5: Test Updates
Use **e2e-test-maintainer** to:
- [ ] Update test selectors if UI changed
- [ ] Add tests for new functionality
- [ ] Verify existing tests still pass
- [ ] Improve test coverage
- [ ] Add visual regression tests (optional)

### Phase 6: Documentation
Use **documentation-curator** to:
- [ ] Update tab documentation
- [ ] Add code examples
- [ ] Document new patterns used
- [ ] Update USAGE_GUIDE if needed
- [ ] Add troubleshooting section

### Phase 7: Final Validation

Run comprehensive checks:
```bash
# Build the tab
cd <tab-directory>
npm run build

# Run in development
npm run dev

# Check for TypeScript errors
npm run typecheck

# Run linter
npm run lint

# Run tests
cd ../e2e-tests
npm test
```

## Specific Tab Guidance

### Hubs Tab Polish
Focus on:
- Card component styling (Box design)
- Grid layout spacing
- Hover states on cards
- Loading states
- Empty state design

### Reports Tab Polish
Focus on:
- Table component (ensure using shared Table)
- Row hover states
- Action buttons styling
- Filter/search integration
- Data loading states

### User Tab Polish
Focus on:
- Form field styling (use shared Input)
- Button styling (use shared Button)
- Form validation UX
- Error message display
- Success states

## Success Criteria

Tab is polished when:
- [ ] Matches Box design system exactly
- [ ] All colors from Box palette
- [ ] Consistent spacing throughout
- [ ] Proper hover/focus states
- [ ] TypeScript types are complete
- [ ] No console warnings/errors
- [ ] All tests pass
- [ ] Accessibility verified (keyboard nav, ARIA)
- [ ] Code is clean and maintainable
- [ ] Documentation is current

## Quality Checklist

**Visual:**
- [ ] Colors match Box design exactly
- [ ] Spacing is consistent
- [ ] Borders and corners match Box
- [ ] Typography is consistent
- [ ] Icons are clear and appropriate

**Functional:**
- [ ] All features work correctly
- [ ] No console errors
- [ ] Loading states are clear
- [ ] Error handling is graceful
- [ ] Performance is good (no lag)

**Code Quality:**
- [ ] TypeScript types complete
- [ ] No any types
- [ ] Functions are single-responsibility
- [ ] No code duplication
- [ ] Proper error boundaries

**Testing:**
- [ ] E2E tests pass
- [ ] Tests are meaningful
- [ ] Coverage is adequate
- [ ] Tests use data-testid

**Documentation:**
- [ ] Tab is documented
- [ ] Code has helpful comments
- [ ] Examples are provided
- [ ] Related docs updated

## Before/After Comparison

Document the improvements:

```markdown
## Tab Polish Results: [Tab Name]

### Before
- Issues found: [List]
- Design inconsistencies: [List]
- Test coverage: X%

### After
- All issues resolved
- Matches Box design system
- Test coverage: Y%
- Performance improved: [Metrics]

### Visual Comparison
[Include screenshots if helpful]

### Code Improvements
- Lines refactored: X
- TypeScript errors fixed: Y
- Tests added: Z
```

## Time Estimate

- Simple polish (colors, spacing): 1-2 hours
- Moderate (code quality + tests): 2-4 hours
- Comprehensive (full refactor): 4-6 hours

## Notes

- Focus on high-impact improvements first
- Don't break existing functionality
- Maintain backward compatibility
- Consider this a refactoring sprint
- Use **staff-architect** if architectural changes are needed
- Use **automation-advisor** to suggest automation for polish workflows

This command ensures all tabs maintain consistent quality and follow current platform standards.
