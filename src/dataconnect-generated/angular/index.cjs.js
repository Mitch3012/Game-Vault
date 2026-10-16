const { createUserRef, updateUserRef, deleteUserRef, getCurrentUserRef, listUsersRef, createGameRef, updateGameRef, deleteGameRef, getGameRef, listGamesRef, createLibraryEntryRef, updateLibraryEntryRef, deleteLibraryEntryRef, getLibraryEntryRef, listMyLibraryRef, createCollectionRef, updateCollectionRef, deleteCollectionRef, getCollectionRef, listMyCollectionsRef, createCollectionGameRef, deleteCollectionGameRef, listCollectionGamesRef } = require('../');
const { DataConnect, CallerSdkTypeEnum } = require('@angular/fire/data-connect');
const { injectDataConnectQuery, injectDataConnectMutation } = require('@tanstack-query-firebase/angular/data-connect');
const { inject, EnvironmentInjector } = require('@angular/core');

exports.injectCreateUser = function injectCreateUser(args, injector) {
  return injectDataConnectMutation(createUserRef, args, injector, CallerSdkTypeEnum.GeneratedAngular);
}

exports.injectUpdateUser = function injectUpdateUser(args, injector) {
  return injectDataConnectMutation(updateUserRef, args, injector, CallerSdkTypeEnum.GeneratedAngular);
}

exports.injectDeleteUser = function injectDeleteUser(args, injector) {
  return injectDataConnectMutation(deleteUserRef, args, injector, CallerSdkTypeEnum.GeneratedAngular);
}

exports.injectGetCurrentUser = function injectGetCurrentUser(options, injector) {
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

exports.injectListUsers = function injectListUsers(options, injector) {
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

exports.injectCreateGame = function injectCreateGame(args, injector) {
  return injectDataConnectMutation(createGameRef, args, injector, CallerSdkTypeEnum.GeneratedAngular);
}

exports.injectUpdateGame = function injectUpdateGame(args, injector) {
  return injectDataConnectMutation(updateGameRef, args, injector, CallerSdkTypeEnum.GeneratedAngular);
}

exports.injectDeleteGame = function injectDeleteGame(args, injector) {
  return injectDataConnectMutation(deleteGameRef, args, injector, CallerSdkTypeEnum.GeneratedAngular);
}

exports.injectGetGame = function injectGetGame(options, injector) {
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

exports.injectListGames = function injectListGames(options, injector) {
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

exports.injectCreateLibraryEntry = function injectCreateLibraryEntry(args, injector) {
  return injectDataConnectMutation(createLibraryEntryRef, args, injector, CallerSdkTypeEnum.GeneratedAngular);
}

exports.injectUpdateLibraryEntry = function injectUpdateLibraryEntry(args, injector) {
  return injectDataConnectMutation(updateLibraryEntryRef, args, injector, CallerSdkTypeEnum.GeneratedAngular);
}

exports.injectDeleteLibraryEntry = function injectDeleteLibraryEntry(args, injector) {
  return injectDataConnectMutation(deleteLibraryEntryRef, args, injector, CallerSdkTypeEnum.GeneratedAngular);
}

exports.injectGetLibraryEntry = function injectGetLibraryEntry(options, injector) {
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

exports.injectListMyLibrary = function injectListMyLibrary(options, injector) {
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

exports.injectCreateCollection = function injectCreateCollection(args, injector) {
  return injectDataConnectMutation(createCollectionRef, args, injector, CallerSdkTypeEnum.GeneratedAngular);
}

exports.injectUpdateCollection = function injectUpdateCollection(args, injector) {
  return injectDataConnectMutation(updateCollectionRef, args, injector, CallerSdkTypeEnum.GeneratedAngular);
}

exports.injectDeleteCollection = function injectDeleteCollection(args, injector) {
  return injectDataConnectMutation(deleteCollectionRef, args, injector, CallerSdkTypeEnum.GeneratedAngular);
}

exports.injectGetCollection = function injectGetCollection(options, injector) {
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

exports.injectListMyCollections = function injectListMyCollections(options, injector) {
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

exports.injectCreateCollectionGame = function injectCreateCollectionGame(args, injector) {
  return injectDataConnectMutation(createCollectionGameRef, args, injector, CallerSdkTypeEnum.GeneratedAngular);
}

exports.injectDeleteCollectionGame = function injectDeleteCollectionGame(args, injector) {
  return injectDataConnectMutation(deleteCollectionGameRef, args, injector, CallerSdkTypeEnum.GeneratedAngular);
}

exports.injectListCollectionGames = function injectListCollectionGames(options, injector) {
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

