---
description: Comprehensive pre-release validation orchestrating multiple subagents to ensure production readiness.
---

# Release Preparation

Run comprehensive pre-release checks to ensure the platform is production-ready.

## Context
Before deploying to production, we need to validate:
- All Module Federation configs
- Complete test suite
- Code quality
- Documentation currency
- Deployment readiness
- No critical issues

This is a **quality gate workflow** that must pass before production release.

## Validation Workflow

### Phase 1: Architecture Validation
Use **module-federation-architect** to:
- [ ] Validate all webpack configurations
- [ ] Check shared dependencies (React singleton)
- [ ] Verify remote URLs for production
- [ ] Test all remoteEntry.js files are accessible
- [ ] Confirm bootstrap pattern in all hosts
- [ ] Check for Module Federation anti-patterns

### Phase 2: Code Review
Use **code-review-specialist** to:
- [ ] Review recent changes
- [ ] Check for security vulnerabilities
- [ ] Identify performance issues
- [ ] Verify TypeScript types
- [ ] Check for accessibility issues
- [ ] Ensure Box design system compliance

### Phase 3: Testing Validation
Use **e2e-test-maintainer** to:
- [ ] Run complete E2E test suite (40 tests)
- [ ] Verify no flaky tests
- [ ] Check test coverage
- [ ] Validate Module Federation tests pass
- [ ] Ensure state sharing tests pass
- [ ] Confirm tab contract tests pass

### Phase 4: Build Verification
Run build checks:
```bash
# Build all modules
npm run build

# Check bundle sizes
du -sh */dist/

# Verify no build errors
echo $?
```

### Phase 5: Documentation Check
Use **documentation-curator** to:
- [ ] Verify docs are up-to-date
- [ ] Check all links work
- [ ] Validate code examples
- [ ] Ensure deployment docs are current
- [ ] Confirm README reflects current state

### Phase 6: Deployment Readiness
Use **deployment-specialist** to:
- [ ] Verify environment variables configured
- [ ] Check Vercel projects are set up
- [ ] Validate deployment scripts work
- [ ] Confirm deployment order documented
- [ ] Test staging deployment (if available)

### Phase 7: Final Checklist

**Critical Checks:**
- [ ] No console errors in development
- [ ] All services start successfully
- [ ] All tabs load without errors
- [ ] React singleton enforced (check DevTools)
- [ ] No security vulnerabilities (npm audit)
- [ ] No TypeScript errors (npm run typecheck)
- [ ] All tests pass (npm test)
- [ ] Documentation is accurate
- [ ] Deployment plan is clear

**Production Readiness:**
- [ ] Production URLs configured
- [ ] Environment variables set
- [ ] Monitoring set up (if applicable)
- [ ] Rollback plan documented
- [ ] Team is informed of release

## Output Report

Generate a release readiness report:

```markdown
# Release Readiness Report

## Date: [Date]
## Release Version: [Version]

## Validation Results

### Module Federation: ✅ PASS / ❌ FAIL
- Issue 1 (if any)
- Issue 2 (if any)

### Code Quality: ✅ PASS / ❌ FAIL
- Security: ✅ No vulnerabilities
- Performance: ✅ No issues
- TypeScript: ✅ No errors

### Testing: ✅ PASS / ❌ FAIL
- E2E Tests: 40/40 passing
- Coverage: X%

### Documentation: ✅ PASS / ❌ FAIL
- All docs current
- Examples tested

### Deployment: ✅ PASS / ❌ FAIL
- All configs validated
- Environment variables set

## Blocking Issues
[List any blocking issues]

## Recommendations
[List any recommendations]

## Release Decision
✅ READY TO RELEASE
⚠️ CONDITIONAL (fix minor issues first)
❌ NOT READY (critical issues present)

## Sign-off
- Architect: [Name]
- QA: [Name]
- Product: [Name]
```

## Remediation

If issues are found:
1. **Critical issues**: Must fix before release
2. **High priority**: Should fix before release
3. **Medium/Low**: Document and schedule for next release

Use appropriate subagents to fix issues:
- **module-federation-architect** for config issues
- **e2e-test-maintainer** for test failures
- **code-review-specialist** for code quality issues
- **documentation-curator** for doc updates

## Success Criteria

Release is ready when:
- All validation phases pass
- No critical or high-priority issues
- All tests pass consistently
- Documentation is current
- Deployment plan is clear
- Team sign-off obtained

## Time Estimate

Full validation typically takes:
- Quick check: 30 minutes (automated only)
- Standard validation: 1-2 hours (includes manual review)
- Comprehensive audit: 3-4 hours (deep dive on everything)

## Notes

- Run this command **before every production deployment**
- Document any issues found for future reference
- Use **automation-advisor** to suggest how to automate more of this process
- Consider making this a GitHub Actions workflow

This ensures every production release meets quality standards and reduces the risk of issues in production.
