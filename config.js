/**
 * Configuration constants
 * Note: Sensitive values should be managed securely
 */

// Application Configuration
export const CONFIG = {
    // API Endpoints
    OPENAI_API_BASE: 'https://api.openai.com/v1',
    KUSTOMER_API_BASE: '/v1',
    
    // Assistant Configuration
    // TODO: Move to environment variable or secure config
    OPENAI_ASSISTANT_ID: 'asst_0q20aQQO7ECwiXMz7D67ZB9E',
    
    // App IDs
    SIDEKICK_APP_ID_PROD: 'sidekick_kustomer_570fad9d9001bc1000163b28.app.sidekick',
    SIDEKICK_APP_ID_SANDBOX: 'sidekick_60529db9b793421ac4e421ff.app',
    
    // Settings URLs
    SETTINGS_URL_PROD: 'sidekick_kustomer_570fad9d9001bc1000163b28',
    SETTINGS_URL_SANDBOX: 'sidekick_60529db9b793421ac4e421ff',
    
    // Polling Configuration
    MAX_POLL_COUNT: 15,
    POLL_INTERVAL_MS: 1000,
    
    // UI Configuration
    INIT_DELAY_MS: 500,
    REORDER_DELAY_MS: 500,
    
    // Validation
    MAX_INPUT_LENGTH: 10000,
    MIN_INPUT_LENGTH: 1,
    
    // Team IDs (should be moved to secure config)
    TSE_TEAM_ID: '656a13e494c4a31935c1d2b0',
    SUPPORT_TEAM_ID: '5c38c68a50b7a60019b3621f',
    BILLING_TEAM_ID: '63f7916d980ae683e4fc3843',
    
    // Queue IDs (should be moved to secure config)
    SUPPORT_QUEUE_ID: '61aa1756573ed1001b15da1c',
    BILLING_QUEUE_ID: '63d29b6c28ab968c97493654',
    DATA_EXPORT_QUEUE_ID: '657c7c15b2af6348c6ebdc9f',
    
    // Date Configuration
    MIN_VALID_DATE: new Date('2015-01-01'),
    
    // ARR Thresholds
    TOP_ACCOUNT_ARR_THRESHOLD: 255000,
};

/**
 * Security Configuration
 * Note: These values should be managed securely
 */
export const SECURITY_CONFIG = {
    AUTH_TOKEN: null,
    CHILI_PIPER_TOKEN: null,
    SLACK_WEBHOOK_URL: null,
};

/**
 * Input validation patterns
 */
export const VALIDATION_PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    URL: /^https?:\/\/.+/,
    ALPHANUMERIC: /^[a-zA-Z0-9\s]+$/,
};

/**
 * Sanitize HTML to prevent XSS
 * @param {string} str - String to sanitize
 * @returns {string} - Sanitized string
 */
export function sanitizeHTML(str) {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Validate input length
 * @param {string} input - Input to validate
 * @param {number} maxLength - Maximum allowed length
 * @param {number} minLength - Minimum required length
 * @returns {boolean} - True if valid
 */
export function validateInputLength(input, maxLength = CONFIG.MAX_INPUT_LENGTH, minLength = CONFIG.MIN_INPUT_LENGTH) {
    if (typeof input !== 'string') return false;
    const length = input.trim().length;
    return length >= minLength && length <= maxLength;
}

/**
 * Sanitize user input
 * @param {string} input - User input to sanitize
 * @returns {string} - Sanitized input
 */
export function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input.trim().replace(/[<>]/g, '');
}
