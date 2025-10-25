/**
 * Action Handlers for Forms Tab
 *
 * In Level 3 SDUI, actions are defined by the server,
 * but the implementations are in the frontend code.
 *
 * This is the ONLY custom code in Level 3 - everything else
 * comes from the server (columns, formatters, action metadata).
 */

export interface ActionContext {
  item?: any;
  items?: any[];
  refetch?: () => void;
}

/**
 * Action handler registry
 * Maps action IDs from server to implementation functions
 */
export const actionHandlers: Record<string, (context: ActionContext) => void | Promise<void>> = {
  /**
   * Forms table actions
   */
  'view': async ({ item }) => {
    console.log('View form submissions:', item);
    // TODO: Navigate to submissions view
    alert(`Viewing submissions for form: ${item.title}`);
  },

  'edit': async ({ item }) => {
    console.log('Edit form:', item);
    // TODO: Open form editor
    alert(`Editing form: ${item.title}`);
  },

  'delete': async ({ item, refetch }) => {
    const confirmed = confirm(`Are you sure you want to delete "${item.title}"?`);
    if (!confirmed) return;

    console.log('Delete form:', item);
    // TODO: Implement delete mutation
    alert(`Deleted form: ${item.title}`);

    if (refetch) {
      refetch();
    }
  },

  'archive': async ({ items, refetch }) => {
    const confirmed = confirm(`Archive ${items?.length} forms?`);
    if (!confirmed) return;

    console.log('Archive forms:', items);
    // TODO: Implement archive mutation
    alert(`Archived ${items?.length} forms`);

    if (refetch) {
      refetch();
    }
  },

  /**
   * Form submissions table actions
   */
  'view-response': async ({ item }) => {
    console.log('View response:', item);

    try {
      const data = JSON.parse(item.responseData);
      const formatted = JSON.stringify(data, null, 2);
      alert(`Response Data:\n\n${formatted}`);
    } catch (error) {
      alert(`Response Data:\n\n${item.responseData}`);
    }
  },

  'download': async ({ item }) => {
    console.log('Download submission:', item);
    // TODO: Implement download
    alert(`Downloading submission from ${item.submittedBy?.name}`);
  },

  'export': async ({ items }) => {
    console.log('Export submissions:', items);
    // TODO: Implement export to CSV
    alert(`Exporting ${items?.length} submissions to CSV`);
  },
};

/**
 * Execute an action by ID
 */
export function executeAction(actionId: string, context: ActionContext): void | Promise<void> {
  const handler = actionHandlers[actionId];

  if (!handler) {
    console.warn(`No handler registered for action: ${actionId}`);
    return;
  }

  return handler(context);
}
