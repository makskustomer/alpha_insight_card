# Alpha Insight Card

## Overview

This repository contains the Alpha Insight Card, a custom Kustomer card component designed for internal use within Kustomer Alpha. The card provides enhanced customer insights, metrics, and quick actions for support teams.

## Purpose

The Alpha Insight Card extends the standard Kustomer interface by providing:
- Company metrics and health indicators
- Quick action buttons for common workflows
- SideKick AI assistant integration
- Stakeholder information display
- Integration with various Kustomer and third-party services

## Architecture

This card follows the Kustomer Card architecture pattern and integrates with:
- Kustomer Card JS SDK
- OpenAI Assistants API (via SideKick)
- Various Kustomer API endpoints
- Third-party services (Chili Piper, Slack, etc.)

## Usage

### Integration in Kustomer Alpha

This card is designed to be loaded within the Kustomer Alpha environment. It follows the standard Kustomer card loading pattern:

```html
<DynamicCard 
  fillToWidth
  src="https://cdnapps.kustomerapp.com/kustomer_impersonation/cards/kustomer_impersonation/latest/index.html"
  context={context} 
/>
```

### Card Structure

- `index.html` - Main card HTML structure
- `card_script.js` - Core card functionality and logic
- `card_style.css` - Card styling
- `modal_index.html` - Stakeholder modal HTML
- `modal_script.js` - Modal functionality
- `modal_style.css` - Modal styling

## Development

### Local Development

1. Clone the repository
2. Serve files via a local web server
3. Load the card in Kustomer Alpha development environment

### Deployment

Cards are typically deployed to CDN or hosted locations accessible by Kustomer Alpha. The card URL is configured in the Kustomer Alpha environment.

## Configuration

The card uses configuration values that should be managed securely:
- App IDs for production and sandbox environments
- API endpoints
- Feature flags and settings

See `config.js` for configuration constants.

## Security Considerations

- This card runs in the browser and executes client-side JavaScript
- Sensitive operations should be proxied through backend services
- Tokens and API keys should not be hardcoded in client-side code
- Input validation and sanitization are implemented to prevent XSS

## Related Repositories

Similar cards are maintained in the `kustomer/card-kustomer-*` repository pattern. This card follows similar architectural patterns but is specifically designed for Alpha use cases.

## Repository Status

**⚠️ Important**: This repository is currently public. 

### Privacy Considerations

- This card is designed for internal Kustomer Alpha use
- The code runs client-side and is accessible to anyone with the card URL
- Consider moving to:
  - Private repository under `kustomer` organization
  - Follow naming pattern: `kustomer/card-kustomer-alpha-insight`
  - Align with other card repositories in `kustomer/card-kustomer-*` pattern

### Current Deployment

The card is currently deployed at:
- GitHub Pages: `https://bryce-kustomer.github.io/alpha_insight_card/`
- Referenced in `index.html` line 11

### Recommended Actions

1. **Review Repository Visibility**
   - Assess if this code should be public or private
   - Consider proprietary logic and business value

2. **Standardize Repository Location**
   - Move to `kustomer` organization if appropriate
   - Follow `kustomer/card-kustomer-*` naming convention
   - Set appropriate access controls

3. **Update Deployment**
   - If moved, update card URL in Kustomer Alpha configuration
   - Ensure CDN/hosting aligns with security requirements

## Notes

- This card is intended for internal Kustomer Alpha use
- Public access to this repository should be reviewed based on security and business requirements
- Consider moving to private repository or `kustomer` organization if proprietary logic is present
