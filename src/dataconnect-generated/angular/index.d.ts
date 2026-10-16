import { CreateUserData, UpdateUserData, DeleteUserData, GetCurrentUserData, ListUsersData, CreateGameData, UpdateGameData, DeleteGameData, GetGameData, ListGamesData, CreateLibraryEntryData, UpdateLibraryEntryData, DeleteLibraryEntryData, GetLibraryEntryData, ListMyLibraryData, CreateCollectionData, UpdateCollectionData, DeleteCollectionData, GetCollectionData, ListMyCollectionsData, CreateCollectionGameData, DeleteCollectionGameData, ListCollectionGamesData } from '../';
import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise} from '@angular/fire/data-connect';
import { CreateQueryResult, CreateMutationResult} from '@tanstack/angular-query-experimental';
import { CreateDataConnectQueryResult, CreateDataConnectQueryOptions, CreateDataConnectMutationResult, DataConnectMutationOptionsUndefinedMutationFn } from '@tanstack-query-firebase/angular/data-connect';
import { FirebaseError } from 'firebase/app';
import { Injector } from '@angular/core';

type CreateUserOptions = DataConnectMutationOptionsUndefinedMutationFn<CreateUserData, FirebaseError, undefined>;
export function injectCreateUser(options?: CreateUserOptions, injector?: Injector): CreateDataConnectMutationResult<CreateUserData, undefined, >;

type UpdateUserOptions = DataConnectMutationOptionsUndefinedMutationFn<UpdateUserData, FirebaseError, undefined>;
export function injectUpdateUser(options?: UpdateUserOptions, injector?: Injector): CreateDataConnectMutationResult<UpdateUserData, undefined, >;

type DeleteUserOptions = DataConnectMutationOptionsUndefinedMutationFn<DeleteUserData, FirebaseError, undefined>;
export function injectDeleteUser(options?: DeleteUserOptions, injector?: Injector): CreateDataConnectMutationResult<DeleteUserData, undefined, >;

export type GetCurrentUserOptions = () => Omit<CreateDataConnectQueryOptions<GetCurrentUserData, undefined>, 'queryFn'>;
export function injectGetCurrentUser(options?: GetCurrentUserOptions, injector?: Injector): CreateDataConnectQueryResult<GetCurrentUserData, undefined>;

export type ListUsersOptions = () => Omit<CreateDataConnectQueryOptions<ListUsersData, undefined>, 'queryFn'>;
export function injectListUsers(options?: ListUsersOptions, injector?: Injector): CreateDataConnectQueryResult<ListUsersData, undefined>;

type CreateGameOptions = DataConnectMutationOptionsUndefinedMutationFn<CreateGameData, FirebaseError, undefined>;
export function injectCreateGame(options?: CreateGameOptions, injector?: Injector): CreateDataConnectMutationResult<CreateGameData, undefined, >;

type UpdateGameOptions = DataConnectMutationOptionsUndefinedMutationFn<UpdateGameData, FirebaseError, undefined>;
export function injectUpdateGame(options?: UpdateGameOptions, injector?: Injector): CreateDataConnectMutationResult<UpdateGameData, undefined, >;

type DeleteGameOptions = DataConnectMutationOptionsUndefinedMutationFn<DeleteGameData, FirebaseError, undefined>;
export function injectDeleteGame(options?: DeleteGameOptions, injector?: Injector): CreateDataConnectMutationResult<DeleteGameData, undefined, >;

export type GetGameOptions = () => Omit<CreateDataConnectQueryOptions<GetGameData, undefined>, 'queryFn'>;
export function injectGetGame(options?: GetGameOptions, injector?: Injector): CreateDataConnectQueryResult<GetGameData, undefined>;

export type ListGamesOptions = () => Omit<CreateDataConnectQueryOptions<ListGamesData, undefined>, 'queryFn'>;
export function injectListGames(options?: ListGamesOptions, injector?: Injector): CreateDataConnectQueryResult<ListGamesData, undefined>;

type CreateLibraryEntryOptions = DataConnectMutationOptionsUndefinedMutationFn<CreateLibraryEntryData, FirebaseError, undefined>;
export function injectCreateLibraryEntry(options?: CreateLibraryEntryOptions, injector?: Injector): CreateDataConnectMutationResult<CreateLibraryEntryData, undefined, >;

type UpdateLibraryEntryOptions = DataConnectMutationOptionsUndefinedMutationFn<UpdateLibraryEntryData, FirebaseError, undefined>;
export function injectUpdateLibraryEntry(options?: UpdateLibraryEntryOptions, injector?: Injector): CreateDataConnectMutationResult<UpdateLibraryEntryData, undefined, >;

type DeleteLibraryEntryOptions = DataConnectMutationOptionsUndefinedMutationFn<DeleteLibraryEntryData, FirebaseError, undefined>;
export function injectDeleteLibraryEntry(options?: DeleteLibraryEntryOptions, injector?: Injector): CreateDataConnectMutationResult<DeleteLibraryEntryData, undefined, >;

export type GetLibraryEntryOptions = () => Omit<CreateDataConnectQueryOptions<GetLibraryEntryData, undefined>, 'queryFn'>;
export function injectGetLibraryEntry(options?: GetLibraryEntryOptions, injector?: Injector): CreateDataConnectQueryResult<GetLibraryEntryData, undefined>;

export type ListMyLibraryOptions = () => Omit<CreateDataConnectQueryOptions<ListMyLibraryData, undefined>, 'queryFn'>;
export function injectListMyLibrary(options?: ListMyLibraryOptions, injector?: Injector): CreateDataConnectQueryResult<ListMyLibraryData, undefined>;

type CreateCollectionOptions = DataConnectMutationOptionsUndefinedMutationFn<CreateCollectionData, FirebaseError, undefined>;
export function injectCreateCollection(options?: CreateCollectionOptions, injector?: Injector): CreateDataConnectMutationResult<CreateCollectionData, undefined, >;

type UpdateCollectionOptions = DataConnectMutationOptionsUndefinedMutationFn<UpdateCollectionData, FirebaseError, undefined>;
export function injectUpdateCollection(options?: UpdateCollectionOptions, injector?: Injector): CreateDataConnectMutationResult<UpdateCollectionData, undefined, >;

type DeleteCollectionOptions = DataConnectMutationOptionsUndefinedMutationFn<DeleteCollectionData, FirebaseError, undefined>;
export function injectDeleteCollection(options?: DeleteCollectionOptions, injector?: Injector): CreateDataConnectMutationResult<DeleteCollectionData, undefined, >;

export type GetCollectionOptions = () => Omit<CreateDataConnectQueryOptions<GetCollectionData, undefined>, 'queryFn'>;
export function injectGetCollection(options?: GetCollectionOptions, injector?: Injector): CreateDataConnectQueryResult<GetCollectionData, undefined>;

export type ListMyCollectionsOptions = () => Omit<CreateDataConnectQueryOptions<ListMyCollectionsData, undefined>, 'queryFn'>;
export function injectListMyCollections(options?: ListMyCollectionsOptions, injector?: Injector): CreateDataConnectQueryResult<ListMyCollectionsData, undefined>;

type CreateCollectionGameOptions = DataConnectMutationOptionsUndefinedMutationFn<CreateCollectionGameData, FirebaseError, undefined>;
export function injectCreateCollectionGame(options?: CreateCollectionGameOptions, injector?: Injector): CreateDataConnectMutationResult<CreateCollectionGameData, undefined, >;

type DeleteCollectionGameOptions = DataConnectMutationOptionsUndefinedMutationFn<DeleteCollectionGameData, FirebaseError, undefined>;
export function injectDeleteCollectionGame(options?: DeleteCollectionGameOptions, injector?: Injector): CreateDataConnectMutationResult<DeleteCollectionGameData, undefined, >;

export type ListCollectionGamesOptions = () => Omit<CreateDataConnectQueryOptions<ListCollectionGamesData, undefined>, 'queryFn'>;
export function injectListCollectionGames(options?: ListCollectionGamesOptions, injector?: Injector): CreateDataConnectQueryResult<ListCollectionGamesData, undefined>;
