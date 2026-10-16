import { createUserRef, updateUserRef, deleteUserRef, getCurrentUserRef, listUsersRef, createGameRef, updateGameRef, deleteGameRef, getGameRef, listGamesRef, createLibraryEntryRef, updateLibraryEntryRef, deleteLibraryEntryRef, getLibraryEntryRef, listMyLibraryRef, createCollectionRef, updateCollectionRef, deleteCollectionRef, getCollectionRef, listMyCollectionsRef, createCollectionGameRef, deleteCollectionGameRef, listCollectionGamesRef } from '../../';
import { DataConnect, CallerSdkTypeEnum } from '@angular/fire/data-connect';
import { injectDataConnectQuery, injectDataConnectMutation } from '@tanstack-query-firebase/angular/data-connect';
import { inject, EnvironmentInjector } from '@angular/core';
export function injectCreateUser(args, injector) {
  return injectDataConnectMutation(createUserRef, args, injector, CallerSdkTypeEnum.GeneratedAngular);
}

export function injectUpdateUser(args, injector) {
  return injectDataConnectMutation(updateUserRef, args, injector, CallerSdkTypeEnum.GeneratedAngular);
}

export function injectDeleteUser(args, injector) {
  return injectDataConnectMutation(deleteUserRef, args, injector, CallerSdkTypeEnum.GeneratedAngular);
}

export function injectGetCurrentUser(options, injector) {
  const finalInjector = injector || inject(EnvironmentInjector);
  const dc = finalInjector.get(DataConnect);
  return injectDataConnectQuery(() => {
    const addOpn = options && options();
    return {
      queryFn: () =>  getCurrentUserRef(dc),
      ...addOpn
    };
  }, finalInjector, CallerSdkTypeEnum.GeneratedAngular);
}

export function injectListUsers(options, injector) {
  const finalInjector = injector || inject(EnvironmentInjector);
  const dc = finalInjector.get(DataConnect);
  return injectDataConnectQuery(() => {
    const addOpn = options && options();
    return {
      queryFn: () =>  listUsersRef(dc),
      ...addOpn
    };
  }, finalInjector, CallerSdkTypeEnum.GeneratedAngular);
}

export function injectCreateGame(args, injector) {
  return injectDataConnectMutation(createGameRef, args, injector, CallerSdkTypeEnum.GeneratedAngular);
}

export function injectUpdateGame(args, injector) {
  return injectDataConnectMutation(updateGameRef, args, injector, CallerSdkTypeEnum.GeneratedAngular);
}

export function injectDeleteGame(args, injector) {
  return injectDataConnectMutation(deleteGameRef, args, injector, CallerSdkTypeEnum.GeneratedAngular);
}

export function injectGetGame(options, injector) {
  const finalInjector = injector || inject(EnvironmentInjector);
  const dc = finalInjector.get(DataConnect);
  return injectDataConnectQuery(() => {
    const addOpn = options && options();
    return {
      queryFn: () =>  getGameRef(dc),
      ...addOpn
    };
  }, finalInjector, CallerSdkTypeEnum.GeneratedAngular);
}

export function injectListGames(options, injector) {
  const finalInjector = injector || inject(EnvironmentInjector);
  const dc = finalInjector.get(DataConnect);
  return injectDataConnectQuery(() => {
    const addOpn = options && options();
    return {
      queryFn: () =>  listGamesRef(dc),
      ...addOpn
    };
  }, finalInjector, CallerSdkTypeEnum.GeneratedAngular);
}

export function injectCreateLibraryEntry(args, injector) {
  return injectDataConnectMutation(createLibraryEntryRef, args, injector, CallerSdkTypeEnum.GeneratedAngular);
}

export function injectUpdateLibraryEntry(args, injector) {
  return injectDataConnectMutation(updateLibraryEntryRef, args, injector, CallerSdkTypeEnum.GeneratedAngular);
}

export function injectDeleteLibraryEntry(args, injector) {
  return injectDataConnectMutation(deleteLibraryEntryRef, args, injector, CallerSdkTypeEnum.GeneratedAngular);
}

export function injectGetLibraryEntry(options, injector) {
  const finalInjector = injector || inject(EnvironmentInjector);
  const dc = finalInjector.get(DataConnect);
  return injectDataConnectQuery(() => {
    const addOpn = options && options();
    return {
      queryFn: () =>  getLibraryEntryRef(dc),
      ...addOpn
    };
  }, finalInjector, CallerSdkTypeEnum.GeneratedAngular);
}

export function injectListMyLibrary(options, injector) {
  const finalInjector = injector || inject(EnvironmentInjector);
  const dc = finalInjector.get(DataConnect);
  return injectDataConnectQuery(() => {
    const addOpn = options && options();
    return {
      queryFn: () =>  listMyLibraryRef(dc),
      ...addOpn
    };
  }, finalInjector, CallerSdkTypeEnum.GeneratedAngular);
}

export function injectCreateCollection(args, injector) {
  return injectDataConnectMutation(createCollectionRef, args, injector, CallerSdkTypeEnum.GeneratedAngular);
}

export function injectUpdateCollection(args, injector) {
  return injectDataConnectMutation(updateCollectionRef, args, injector, CallerSdkTypeEnum.GeneratedAngular);
}

export function injectDeleteCollection(args, injector) {
  return injectDataConnectMutation(deleteCollectionRef, args, injector, CallerSdkTypeEnum.GeneratedAngular);
}

export function injectGetCollection(options, injector) {
  const finalInjector = injector || inject(EnvironmentInjector);
  const dc = finalInjector.get(DataConnect);
  return injectDataConnectQuery(() => {
    const addOpn = options && options();
    return {
      queryFn: () =>  getCollectionRef(dc),
      ...addOpn
    };
  }, finalInjector, CallerSdkTypeEnum.GeneratedAngular);
}

export function injectListMyCollections(options, injector) {
  const finalInjector = injector || inject(EnvironmentInjector);
  const dc = finalInjector.get(DataConnect);
  return injectDataConnectQuery(() => {
    const addOpn = options && options();
    return {
      queryFn: () =>  listMyCollectionsRef(dc),
      ...addOpn
    };
  }, finalInjector, CallerSdkTypeEnum.GeneratedAngular);
}

export function injectCreateCollectionGame(args, injector) {
  return injectDataConnectMutation(createCollectionGameRef, args, injector, CallerSdkTypeEnum.GeneratedAngular);
}

export function injectDeleteCollectionGame(args, injector) {
  return injectDataConnectMutation(deleteCollectionGameRef, args, injector, CallerSdkTypeEnum.GeneratedAngular);
}

export function injectListCollectionGames(options, injector) {
  const finalInjector = injector || inject(EnvironmentInjector);
  const dc = finalInjector.get(DataConnect);
  return injectDataConnectQuery(() => {
    const addOpn = options && options();
    return {
      queryFn: () =>  listCollectionGamesRef(dc),
      ...addOpn
    };
  }, finalInjector, CallerSdkTypeEnum.GeneratedAngular);
}

