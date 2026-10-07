export const PING_COLLECTION = '_connection_check';
export const PING_DOC_ID = 'ping';

// Firestore answered, so the connection works even though the rules rejected or lacked the doc.
export const REACHABLE_ERROR_CODES: readonly string[] = ['permission-denied', 'not-found'];
