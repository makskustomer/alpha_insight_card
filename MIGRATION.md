# Migration Plan

## Overview

This repository is being migrated from a former employee's GitHub account (`bryce-kustomer`) to the main `kustomer` organization. This document outlines the migration steps and cleanup tasks.

## Current Status

- ✅ Removed all references to `bryce-kustomer.github.io`
- ✅ Replaced external URLs with local/relative paths
- ✅ Code cleanup and security improvements completed
- ⏳ Repository migration to `kustomer` org (pending)
- ⏳ Repository visibility set to private (pending)
- ⏳ Deployment to CDN/hosting infrastructure (pending)

## Migration Steps

### Phase 1: Code Cleanup ✅

- [x] Remove hardcoded tokens and secrets
- [x] Remove references to former employee's GitHub Pages
- [x] Update all external URLs to relative/local paths
- [x] Improve code quality and security
- [x] Add comprehensive documentation

### Phase 2: Repository Migration (Next)

1. **Create repository in kustomer organization**
   - Repository name: `card-kustomer-alpha-insight` (or similar)
   - Set to **private**
   - Transfer code from current repository

2. **Update repository settings**
   - Set appropriate access controls
   - Configure branch protection rules
   - Set up CI/CD if needed

3. **Update references**
   - Update any documentation references
   - Update deployment configurations
   - Update Kustomer Alpha card URL configuration

### Phase 3: Deployment (After Migration)

1. **Deploy to CDN/hosting**
   - Deploy to appropriate infrastructure (e.g., `cdnapps.kustomerapp.com`)
   - Version the deployment appropriately
   - Update card URL in Kustomer Alpha

2. **Update modal URL**
   - Update `card_script.js` line ~1762 with final deployment URL
   - Ensure all assets are accessible

3. **Testing**
   - Verify card loads correctly in Kustomer Alpha
   - Test all functionality
   - Verify no broken references

## Files Modified for Cleanup

- `index.html` - Removed external script reference, updated CSP
- `modal_index.html` - Changed to relative paths for CSS and JS
- `card_script.js` - Updated modal URL to relative path with TODO
- Documentation files - Updated to reflect migration status

## Notes

- All external references to `bryce-kustomer.github.io` have been removed
- Code now uses relative paths that will work once deployed to final location
- Modal URL in `card_script.js` needs to be updated to final deployment URL after migration
- Repository should be made private before or immediately after migration

## Post-Migration Checklist

- [ ] Verify repository is private
- [ ] Update deployment URL in Kustomer Alpha configuration
- [ ] Update modal URL in `card_script.js` to final deployment location
- [ ] Test card functionality end-to-end
- [ ] Archive or delete old repository (if appropriate)
- [ ] Update any internal documentation referencing old repository
