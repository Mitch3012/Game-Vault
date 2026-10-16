import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CollectionGame_Key {
  collectionId: UUIDString;
  gameId: UUIDString;
  __typename?: 'CollectionGame_Key';
}

export interface Collection_Key {
  id: UUIDString;
  __typename?: 'Collection_Key';
}

export interface CreateCollectionData {
  collection_insert: Collection_Key;
}

export interface CreateCollectionGameData {
  collectionGame_insert: CollectionGame_Key;
}

export interface CreateGameData {
  game_insert: Game_Key;
}

export interface CreateLibraryEntryData {
  libraryEntry_insert: LibraryEntry_Key;
}

export interface CreateUserData {
  user_insert: User_Key;
}

export interface DeleteCollectionData {
  collection_delete?: Collection_Key | null;
}

export interface DeleteCollectionGameData {
  collectionGame_delete?: CollectionGame_Key | null;
}

export interface DeleteGameData {
  game_delete?: Game_Key | null;
}

export interface DeleteLibraryEntryData {
  libraryEntry_delete?: LibraryEntry_Key | null;
}

export interface DeleteUserData {
  user_delete?: User_Key | null;
}

export interface Game_Key {
  id: UUIDString;
  __typename?: 'Game_Key';
}

export interface GetCollectionData {
  collection?: {
    name: string;
    description?: string | null;
  };
}

export interface GetCurrentUserData {
  user?: {
    username: string;
    email: string;
  };
}

export interface GetGameData {
  game?: {
    title: string;
    genre: string;
  };
}

export interface GetLibraryEntryData {
  libraryEntry?: {
    status: string;
    rating?: number | null;
  };
}

export interface LibraryEntry_Key {
  id: UUIDString;
  __typename?: 'LibraryEntry_Key';
}

export interface ListCollectionGamesData {
  collectionGames: ({
    game: {
      title: string;
    };
  })[];
}

export interface ListGamesData {
  games: ({
    title: string;
    developer?: string | null;
  })[];
}

export interface ListMyCollectionsData {
  collections: ({
    name: string;
  })[];
}

export interface ListMyLibraryData {
  libraryEntries: ({
    game: {
      title: string;
    };
    status: string;
  })[];
}

export interface ListUsersData {
  users: ({
    username: string;
    avatarUrl?: string | null;
  })[];
}

export interface UpdateCollectionData {
  collection_update?: Collection_Key | null;
}

export interface UpdateGameData {
  game_update?: Game_Key | null;
}

export interface UpdateLibraryEntryData {
  libraryEntry_update?: LibraryEntry_Key | null;
}

export interface UpdateUserData {
  user_update?: User_Key | null;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateUserData, undefined>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(): MutationPromise<CreateUserData, undefined>;
export function createUser(dc: DataConnect): MutationPromise<CreateUserData, undefined>;

interface UpdateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<UpdateUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<UpdateUserData, undefined>;
  operationName: string;
}
export const updateUserRef: UpdateUserRef;

export function updateUser(): MutationPromise<UpdateUserData, undefined>;
export function updateUser(dc: DataConnect): MutationPromise<UpdateUserData, undefined>;

interface DeleteUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<DeleteUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<DeleteUserData, undefined>;
  operationName: string;
}
export const deleteUserRef: DeleteUserRef;

export function deleteUser(): MutationPromise<DeleteUserData, undefined>;
export function deleteUser(dc: DataConnect): MutationPromise<DeleteUserData, undefined>;

interface GetCurrentUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetCurrentUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetCurrentUserData, undefined>;
  operationName: string;
}
export const getCurrentUserRef: GetCurrentUserRef;

export function getCurrentUser(options?: ExecuteQueryOptions): QueryPromise<GetCurrentUserData, undefined>;
export function getCurrentUser(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetCurrentUserData, undefined>;

interface ListUsersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUsersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListUsersData, undefined>;
  operationName: string;
}
export const listUsersRef: ListUsersRef;

export function listUsers(options?: ExecuteQueryOptions): QueryPromise<ListUsersData, undefined>;
export function listUsers(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListUsersData, undefined>;

interface CreateGameRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateGameData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateGameData, undefined>;
  operationName: string;
}
export const createGameRef: CreateGameRef;

export function createGame(): MutationPromise<CreateGameData, undefined>;
export function createGame(dc: DataConnect): MutationPromise<CreateGameData, undefined>;

interface UpdateGameRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<UpdateGameData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<UpdateGameData, undefined>;
  operationName: string;
}
export const updateGameRef: UpdateGameRef;

export function updateGame(): MutationPromise<UpdateGameData, undefined>;
export function updateGame(dc: DataConnect): MutationPromise<UpdateGameData, undefined>;

interface DeleteGameRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<DeleteGameData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<DeleteGameData, undefined>;
  operationName: string;
}
export const deleteGameRef: DeleteGameRef;

export function deleteGame(): MutationPromise<DeleteGameData, undefined>;
export function deleteGame(dc: DataConnect): MutationPromise<DeleteGameData, undefined>;

interface GetGameRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetGameData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetGameData, undefined>;
  operationName: string;
}
export const getGameRef: GetGameRef;

export function getGame(options?: ExecuteQueryOptions): QueryPromise<GetGameData, undefined>;
export function getGame(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetGameData, undefined>;

interface ListGamesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListGamesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListGamesData, undefined>;
  operationName: string;
}
export const listGamesRef: ListGamesRef;

export function listGames(options?: ExecuteQueryOptions): QueryPromise<ListGamesData, undefined>;
export function listGames(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListGamesData, undefined>;

interface CreateLibraryEntryRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateLibraryEntryData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateLibraryEntryData, undefined>;
  operationName: string;
}
export const createLibraryEntryRef: CreateLibraryEntryRef;

export function createLibraryEntry(): MutationPromise<CreateLibraryEntryData, undefined>;
export function createLibraryEntry(dc: DataConnect): MutationPromise<CreateLibraryEntryData, undefined>;

interface UpdateLibraryEntryRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<UpdateLibraryEntryData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<UpdateLibraryEntryData, undefined>;
  operationName: string;
}
export const updateLibraryEntryRef: UpdateLibraryEntryRef;

export function updateLibraryEntry(): MutationPromise<UpdateLibraryEntryData, undefined>;
export function updateLibraryEntry(dc: DataConnect): MutationPromise<UpdateLibraryEntryData, undefined>;

interface DeleteLibraryEntryRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<DeleteLibraryEntryData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<DeleteLibraryEntryData, undefined>;
  operationName: string;
}
export const deleteLibraryEntryRef: DeleteLibraryEntryRef;

export function deleteLibraryEntry(): MutationPromise<DeleteLibraryEntryData, undefined>;
export function deleteLibraryEntry(dc: DataConnect): MutationPromise<DeleteLibraryEntryData, undefined>;

interface GetLibraryEntryRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetLibraryEntryData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetLibraryEntryData, undefined>;
  operationName: string;
}
export const getLibraryEntryRef: GetLibraryEntryRef;

export function getLibraryEntry(options?: ExecuteQueryOptions): QueryPromise<GetLibraryEntryData, undefined>;
export function getLibraryEntry(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetLibraryEntryData, undefined>;

interface ListMyLibraryRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMyLibraryData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListMyLibraryData, undefined>;
  operationName: string;
}
export const listMyLibraryRef: ListMyLibraryRef;

export function listMyLibrary(options?: ExecuteQueryOptions): QueryPromise<ListMyLibraryData, undefined>;
export function listMyLibrary(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListMyLibraryData, undefined>;

interface CreateCollectionRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateCollectionData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateCollectionData, undefined>;
  operationName: string;
}
export const createCollectionRef: CreateCollectionRef;

export function createCollection(): MutationPromise<CreateCollectionData, undefined>;
export function createCollection(dc: DataConnect): MutationPromise<CreateCollectionData, undefined>;

interface UpdateCollectionRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<UpdateCollectionData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<UpdateCollectionData, undefined>;
  operationName: string;
}
export const updateCollectionRef: UpdateCollectionRef;

export function updateCollection(): MutationPromise<UpdateCollectionData, undefined>;
export function updateCollection(dc: DataConnect): MutationPromise<UpdateCollectionData, undefined>;

interface DeleteCollectionRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<DeleteCollectionData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<DeleteCollectionData, undefined>;
  operationName: string;
}
export const deleteCollectionRef: DeleteCollectionRef;

export function deleteCollection(): MutationPromise<DeleteCollectionData, undefined>;
export function deleteCollection(dc: DataConnect): MutationPromise<DeleteCollectionData, undefined>;

interface GetCollectionRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetCollectionData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetCollectionData, undefined>;
  operationName: string;
}
export const getCollectionRef: GetCollectionRef;

export function getCollection(options?: ExecuteQueryOptions): QueryPromise<GetCollectionData, undefined>;
export function getCollection(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetCollectionData, undefined>;

interface ListMyCollectionsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMyCollectionsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListMyCollectionsData, undefined>;
  operationName: string;
}
export const listMyCollectionsRef: ListMyCollectionsRef;

export function listMyCollections(options?: ExecuteQueryOptions): QueryPromise<ListMyCollectionsData, undefined>;
export function listMyCollections(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListMyCollectionsData, undefined>;

interface CreateCollectionGameRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateCollectionGameData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateCollectionGameData, undefined>;
  operationName: string;
}
export const createCollectionGameRef: CreateCollectionGameRef;

export function createCollectionGame(): MutationPromise<CreateCollectionGameData, undefined>;
export function createCollectionGame(dc: DataConnect): MutationPromise<CreateCollectionGameData, undefined>;

interface DeleteCollectionGameRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<DeleteCollectionGameData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<DeleteCollectionGameData, undefined>;
  operationName: string;
}
export const deleteCollectionGameRef: DeleteCollectionGameRef;

export function deleteCollectionGame(): MutationPromise<DeleteCollectionGameData, undefined>;
export function deleteCollectionGame(dc: DataConnect): MutationPromise<DeleteCollectionGameData, undefined>;

interface ListCollectionGamesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListCollectionGamesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListCollectionGamesData, undefined>;
  operationName: string;
}
export const listCollectionGamesRef: ListCollectionGamesRef;

export function listCollectionGames(options?: ExecuteQueryOptions): QueryPromise<ListCollectionGamesData, undefined>;
export function listCollectionGames(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListCollectionGamesData, undefined>;

