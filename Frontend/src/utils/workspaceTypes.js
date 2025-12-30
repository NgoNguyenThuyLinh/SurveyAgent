/**
 * Workspace Type Definitions
 * Shared types and utilities for workspace management
 */

/**
 * @typedef {Object} Workspace
 * @property {string} id - Unique workspace identifier
 * @property {string} name - Workspace name
 * @property {string} [description] - Optional workspace description
 * @property {string} ownerId - User ID of the workspace owner
 * @property {string} createdAt - ISO timestamp of creation
 * @property {string} updatedAt - ISO timestamp of last update
 * @property {number} [memberCount] - Optional count of workspace members
 */

/**
 * @typedef {Object} WorkspaceMember
 * @property {string} id - Unique member identifier
 * @property {string} workspaceId - Associated workspace ID
 * @property {string} userId - Associated user ID
 * @property {string} role - Member role (e.g., 'owner', 'editor', 'viewer')
 */

/**
 * Workspace role constants
 */
export const WORKSPACE_ROLES = {
  OWNER: 'owner',
  EDITOR: 'editor',
  VIEWER: 'viewer',
};

/**
 * Default workspace structure for initialization
 * @returns {Workspace}
 */
export const createDefaultWorkspace = () => ({
  id: '',
  name: '',
  description: '',
  ownerId: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  memberCount: 0,
});

/**
 * Default workspace member structure for initialization
 * @returns {WorkspaceMember}
 */
export const createDefaultWorkspaceMember = () => ({
  id: '',
  workspaceId: '',
  userId: '',
  role: WORKSPACE_ROLES.VIEWER,
});

/**
 * Validate workspace object
 * @param {Object} workspace - Workspace object to validate
 * @returns {boolean} True if valid
 */
export const isValidWorkspace = (workspace) => {
  return (
    workspace &&
    typeof workspace === 'object' &&
    workspace.id &&
    workspace.name &&
    workspace.ownerId &&
    workspace.createdAt &&
    workspace.updatedAt
  );
};

/**
 * Validate workspace member object
 * @param {Object} member - Workspace member object to validate
 * @returns {boolean} True if valid
 */
export const isValidWorkspaceMember = (member) => {
  return (
    member &&
    typeof member === 'object' &&
    member.id &&
    member.workspaceId &&
    member.userId &&
    member.role &&
    Object.values(WORKSPACE_ROLES).includes(member.role)
  );
};
