import { Service, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { SuggestionsService } from './ai/suggestions-service';
import { AuthFlow, createAuthFlow } from './auth/auth-flow';
import { homeRouteFor, loginErrorMessage, signupErrorMessage } from './auth/auth-helpers';
import { LOGIN_ROUTE, LOGIN_SUCCESS_ROUTE } from './auth/auth.constants';
import { GameVaultCrudService } from './game-vault-crud-service';
import { GameEntryChanges, GameEntryWithId, GameStatus } from './game-vault-interface';
import { ADD_ERROR_MESSAGE, LOGOUT_ERROR_MESSAGE, REMOVE_ERROR_MESSAGE } from './game-vault.constants';
import { RawgService } from './rawg-service';
import { TransferService } from './transfer/transfer-service';
import { Authservice } from './auth/auth-service';

export const findByRawgId = (
  games: GameEntryWithId[] | null,
  rawgId: number,
): GameEntryWithId | undefined => games?.find((game) => game.rawgId === rawgId);

/** Facade: the only service components talk to. */
@Service()
export class GameVaultService {
  private readonly crud = inject(GameVaultCrudService);
  private readonly rawg = inject(RawgService);
  private readonly auth = inject(Authservice);
  private readonly suggestionsService = inject(SuggestionsService);
  private readonly transfer = inject(TransferService);
  private readonly router = inject(Router);
  private readonly error = signal('');
  private readonly loginPromptRequested = signal(false);
  private readonly loginFlow = createAuthFlow('login', loginErrorMessage);
  private readonly signupFlow = createAuthFlow('signup', signupErrorMessage);

  readonly searchTerm = signal('');

  /** RAWG search results. `null` = loading, `[]` = nothing to show. */
  readonly searchResults = this.rawg.search(() => this.searchTerm());

  /** Saved games. `null` = loading, `[]` = empty vault. */
  readonly games = this.crud.games;

  /** Message for the last failed add or remove. `''` = no error. */
  readonly actionError = this.error.asReadonly();

  /** Whether a user is signed in. `null` = not known yet. */
  readonly signedIn = this.auth.signedIn;

  /** Where the app title links: home when signed in, the login page otherwise. */
  readonly homeRoute = computed(() => homeRouteFor(this.auth.signedIn()));

  /** The signed-in user's name. `''` when signed out or when there is no name. */
  readonly userName = this.auth.userName;

  /** `true` while a logged-out visitor should be told to log in (after they try to add a game). */
  readonly loginPromptVisible = computed(() => this.loginPromptRequested() && this.auth.signedIn() !== true);

  /** Message for the last failed login. `''` = no error. */
  readonly loginError = this.loginFlow.error;

  /** `true` while a login is in flight. */
  readonly loginPending = this.loginFlow.pending;

  /** Message for the last failed signup. `''` = no error. */
  readonly signupError = this.signupFlow.error;

  /** `true` while a signup is in flight. */
  readonly signupPending = this.signupFlow.pending;

  /** Whether AI suggestions are switched on. */
  readonly aiEnabled = this.suggestionsService.enabled;

  /** Suggested games. `null` = loading, `[]` = nothing to show. */
  readonly suggestions = this.suggestionsService.suggestions;

  /** `true` when the last AI request failed. */
  readonly suggestionsFailed = this.suggestionsService.failed;

  /** `true` when the vault has no games to base suggestions on. */
  readonly suggestionsVaultEmpty = this.suggestionsService.vaultEmpty;

  /** The user's current request to the AI, cleaned up. `''` = none. */
  readonly suggestionsAsked = this.suggestionsService.asked;

  /** The AI's reason for each suggestion, by RAWG id. */
  readonly suggestionsReasons = this.suggestionsService.reasons;

  /** What importing the chosen file would do. `null` = no file chosen. */
  readonly transferPreview = this.transfer.preview;

  /** `true` while an import is being saved. */
  readonly transferBusy = this.transfer.busy;

  /** The last export or import result or error. `''` = nothing to say. */
  readonly transferMessage = this.transfer.message;

  readonly transferCanExport = this.transfer.canExport;

  readonly transferCanImport = this.transfer.canImport;

  setSearchTerm(term: string): void {
    this.searchTerm.set(term);
  }

  exportVault(): void {
    this.transfer.exportVault();
  }

  chooseImportFile(file: File): Promise<void> {
    return this.transfer.chooseFile(file);
  }

  confirmImport(): Promise<void> {
    return this.transfer.confirmImport();
  }

  cancelImport(): void {
    this.transfer.cancelImport();
  }

  dismissLoginPrompt(): void {
    this.loginPromptRequested.set(false);
  }

  clearActionError(): void {
    this.error.set('');
  }

  /**
   * Saves the game. Resolves with its document id, or `undefined` (and sets `actionError`) on failure.
   * Signed out: shows the login prompt instead and resolves `undefined`. Sign-in unknown or vault still loading: does nothing.
   */
  async addToVault(rawgId: number, status: GameStatus = 'wishlist'): Promise<string | undefined> {
    const signedIn = this.auth.signedIn();
    if (signedIn === null) return undefined;
    if (!signedIn) return this.showLoginPrompt();
    if (this.games() === null) return undefined;
    return this.attempt(() => this.saveFromRawg(rawgId, status), ADD_ERROR_MESSAGE);
  }

  updateGame(id: string, changes: GameEntryChanges): Promise<void> {
    return this.crud.update(id, changes);
  }

  /** Deletes the game. Never rejects: a failure sets `actionError` instead. */
  async removeGame(id: string): Promise<void> {
    await this.attempt(() => this.crud.delete(id), REMOVE_ERROR_MESSAGE);
  }

  setAiEnabled(on: boolean): void {
    this.suggestionsService.setEnabled(on);
  }

  refreshSuggestions(): void {
    this.suggestionsService.refresh();
  }

  askSuggestions(text: string): void {
    this.suggestionsService.ask(text);
  }

  clearSuggestionsAsk(): void {
    this.suggestionsService.clearAsk();
  }

  clearLoginError(): void {
    this.loginFlow.clearError();
  }

  clearSignupError(): void {
    this.signupFlow.clearError();
  }

  /** Signs in, then goes home. Never rejects: a failure resolves `false` and sets `loginError`. */
  login(email: string, password: string): Promise<boolean> {
    return this.enter(this.loginFlow, () => this.auth.login(email, password));
  }

  /** Creates the account, then goes home. Never rejects: a failure resolves `false` and sets `signupError`. */
  signup(userName: string, email: string, password: string): Promise<boolean> {
    return this.enter(this.signupFlow, () => this.auth.signup(userName, email, password));
  }

  /** Signs out, then goes to the login form. Never rejects: a failure sets `actionError` instead. */
  async logout(): Promise<void> {
    const loggedOut = await this.attempt(() => this.auth.logout().then(() => true), LOGOUT_ERROR_MESSAGE);
    if (loggedOut) await this.router.navigateByUrl(LOGIN_ROUTE);
  }

  private showLoginPrompt(): undefined {
    this.loginPromptRequested.set(true);
    return undefined;
  }

  private async enter(flow: AuthFlow, action: () => Promise<unknown>): Promise<boolean> {
    const succeeded = await flow.run(action);
    if (succeeded) await this.router.navigateByUrl(LOGIN_SUCCESS_ROUTE);
    return succeeded;
  }

  // Fetches the game from RAWG and saves it. Resolves with the existing id if already saved.
  private async saveFromRawg(rawgId: number, status: GameStatus): Promise<string> {
    const existing = findByRawgId(this.games(), rawgId);
    if (existing) return existing.id;
    const entry = await this.rawg.getGame(rawgId);
    return this.crud.create({ ...entry, status });
  }

  private async attempt<T>(action: () => Promise<T>, message: string): Promise<T | undefined> {
    try {
      const result = await action();
      this.clearActionError();
      return result;
    } catch (error) {
      console.error('[GameVaultService]', message, error);
      this.error.set(message);
      return undefined;
    }
  }
}
