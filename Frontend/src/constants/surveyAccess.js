/**
 * Survey Access Control Constants
 * Labels and defaults for visibility and identity_mode fields
 */

export const VISIBILITY_OPTIONS = {
  public: 'Public - Anyone can access via link',
  workspace_members: 'Workspace Only - Only workspace members can access'
};

export const VISIBILITY_DEFAULTS = {
  public: 'public',
  workspace_members: 'workspace_members'
};

export const IDENTITY_MODE_OPTIONS = {
  anonymous_only: 'Anonymous only',
  mixed: 'Anonymous or identified',
  identified_only: 'Identified only'
};

export const IDENTITY_MODE_DEFAULTS = {
  anonymous_only: 'anonymous_only',
  mixed: 'mixed',
  identified_only: 'identified_only'
};

/**
 * Get friendly label for visibility value
 */
export const getVisibilityLabel = (value) => {
  return VISIBILITY_OPTIONS[value] || 'Unknown';
};

/**
 * Get friendly label for identity_mode value
 */
export const getIdentityModeLabel = (value) => {
  return IDENTITY_MODE_OPTIONS[value] || 'Unknown';
};

/**
 * Default values for new surveys
 */
export const DEFAULT_SURVEY_ACCESS = {
  visibility: 'public',
  identity_mode: 'mixed'
};

/**
 * Validate visibility value
 */
export const isValidVisibility = (value) => {
  return Object.keys(VISIBILITY_OPTIONS).includes(value);
};

/**
 * Validate identity_mode value
 */
export const isValidIdentityMode = (value) => {
  return Object.keys(IDENTITY_MODE_OPTIONS).includes(value);
};
