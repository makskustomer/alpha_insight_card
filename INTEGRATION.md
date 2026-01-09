# Integration Guide

## How This Card is Called from Kustomer Alpha

### Card Loading Pattern

The Alpha Insight Card is loaded within Kustomer Alpha using the standard Kustomer card loading mechanism. The card is referenced via URL and loaded dynamically into the Kustomer interface.

### Integration Points

1. **Card Registration**
   - Card URL is configured in Kustomer Alpha settings
   - Card is registered to appear in specific contexts (company views, conversation views, etc.)

2. **Context Passing**
   - Kustomer Alpha passes context data to the card via the `context` prop
   - Context includes: company data, conversation data, user data, customer data

3. **Card Initialization**
   - Card initializes using `Kustomer.initialize()` callback
   - Receives data array with company, conversation, customer, and user information

4. **Dynamic Updates**
   - Card listens for context changes via `Kustomer.on('context')`
   - Updates UI when user navigates between different companies/conversations

### Example Integration

```javascript
// In Kustomer Alpha
<DynamicCard 
  fillToWidth
  src="https://[card-url]/index.html"
  context={context} 
/>
```

### Context Structure

The card expects context data in the following format:
```javascript
[
  company,      // Company object with attributes and custom fields
  customer,     // Customer object
  conversation, // Conversation object
  user          // Current user object
]
```

## Card Communication

### Outbound Communication
- Card makes API calls to Kustomer API via `Kustomer.request()`
- Card can trigger toasts via `Kustomer.handleTriggerToast()`
- Card can open modals via `Kustomer.modal.init()` and `Kustomer.modal.show()`

### Inbound Communication
- Card receives context updates via `Kustomer.on('context')`
- Card receives modal events via `Kustomer.on('modal_initialize')`

## Deployment Considerations

### Public vs Private Repository

**Current Status**: This repository is public.

**Considerations**:
- Card code is client-side JavaScript that runs in the browser
- Even if the repository is private, deployed card code is accessible to anyone with the card URL
- Sensitive logic should be kept server-side
- API keys and tokens should not be in client-side code

**Recommendation**: 
- If this card contains proprietary logic or sensitive information, consider:
  1. Moving to a private repository under the `kustomer` organization
  2. Following the `kustomer/card-kustomer-*` naming pattern
  3. Ensuring sensitive operations are handled via backend proxies

### CDN Deployment

Cards are typically deployed to:
- CDN locations (e.g., `cdnapps.kustomerapp.com`)
- Internal hosting infrastructure
- Organization-managed deployment infrastructure

**Note**: This card is being migrated from a former employee's repository. Deployment location will be updated when moved to the `kustomer` organization.

The deployment location should be:
- Accessible to Kustomer Alpha environments
- Versioned appropriately
- Secure and reliable

## Related Card Repositories

Similar cards follow the pattern:
- `kustomer/card-kustomer-[feature-name]`
- Typically private repositories
- Follow similar architecture patterns

## Migration Considerations

If moving this card to align with standard Kustomer card patterns:

1. **Repository Location**
   - Move to `kustomer` organization
   - Use naming pattern: `card-kustomer-alpha-insight` or similar
   - Set repository to private if needed

2. **Deployment**
   - Update CDN/deployment location
   - Update card URL in Kustomer Alpha configuration
   - Ensure backward compatibility during migration

3. **Documentation**
   - Update integration documentation
   - Update deployment procedures
   - Document any breaking changes
