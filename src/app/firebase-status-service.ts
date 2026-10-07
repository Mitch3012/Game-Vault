import { Service, inject } from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';
import { Firestore, doc, getDocFromServer } from '@angular/fire/firestore';

import { PING_COLLECTION, PING_DOC_ID, REACHABLE_ERROR_CODES } from './firebase-status.constants';

export const describePingError = (error: unknown, reachable = REACHABLE_ERROR_CODES): string => {
  const code = (error as { code?: string })?.code ?? 'unknown';
  if (reachable.some((known) => code.endsWith(known))) return `✅ [Firebase] Firestore reachable (${code})`;
  return `❌ [Firebase] Firestore NOT reachable (${code})`;
};

@Service()
export class FirebaseStatusService {
  private readonly app = inject(FirebaseApp);
  private readonly firestore = inject(Firestore);

  async logConnection(): Promise<void> {
    console.log(`[Firebase] App initialised for project "${this.app.options.projectId}"`);
    console.log(await this.pingFirestore());
  }

  private async pingFirestore(): Promise<string> {
    try {
      await getDocFromServer(doc(this.firestore, PING_COLLECTION, PING_DOC_ID));
      return '✅ [Firebase] Firestore reachable (connected)';
    } catch (error) {
      return describePingError(error);
    }
  }
}
