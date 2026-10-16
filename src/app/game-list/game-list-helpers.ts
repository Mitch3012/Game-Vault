import { VAULT_TITLE_FALLBACK } from '../game-vault.constants';

/** The vault heading, personal when we know the user's name. */
export const vaultTitle = (userName: string): string => (userName ? `${userName}'s vault` : VAULT_TITLE_FALLBACK);
