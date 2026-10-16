# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `Angular README`, you can find it at [`dataconnect-generated/angular/README.md`](./angular/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetCurrentUser*](#getcurrentuser)
  - [*ListUsers*](#listusers)
  - [*GetGame*](#getgame)
  - [*ListGames*](#listgames)
  - [*GetLibraryEntry*](#getlibraryentry)
  - [*ListMyLibrary*](#listmylibrary)
  - [*GetCollection*](#getcollection)
  - [*ListMyCollections*](#listmycollections)
  - [*ListCollectionGames*](#listcollectiongames)
- [**Mutations**](#mutations)
  - [*CreateUser*](#createuser)
  - [*UpdateUser*](#updateuser)
  - [*DeleteUser*](#deleteuser)
  - [*CreateGame*](#creategame)
  - [*UpdateGame*](#updategame)
  - [*DeleteGame*](#deletegame)
  - [*CreateLibraryEntry*](#createlibraryentry)
  - [*UpdateLibraryEntry*](#updatelibraryentry)
  - [*DeleteLibraryEntry*](#deletelibraryentry)
  - [*CreateCollection*](#createcollection)
  - [*UpdateCollection*](#updatecollection)
  - [*DeleteCollection*](#deletecollection)
  - [*CreateCollectionGame*](#createcollectiongame)
  - [*DeleteCollectionGame*](#deletecollectiongame)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetCurrentUser
You can execute the `GetCurrentUser` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getCurrentUser(options?: ExecuteQueryOptions): QueryPromise<GetCurrentUserData, undefined>;

interface GetCurrentUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetCurrentUserData, undefined>;
}
export const getCurrentUserRef: GetCurrentUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getCurrentUser(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetCurrentUserData, undefined>;

interface GetCurrentUserRef {
  ...
  (dc: DataConnect): QueryRef<GetCurrentUserData, undefined>;
}
export const getCurrentUserRef: GetCurrentUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getCurrentUserRef:
```typescript
const name = getCurrentUserRef.operationName;
console.log(name);
```

### Variables
The `GetCurrentUser` query has no variables.
### Return Type
Recall that executing the `GetCurrentUser` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetCurrentUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetCurrentUserData {
  user?: {
    username: string;
    email: string;
  };
}
```
### Using `GetCurrentUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getCurrentUser } from '@dataconnect/generated';


// Call the `getCurrentUser()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getCurrentUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getCurrentUser(dataConnect);

console.log(data.user);

// Or, you can use the `Promise` API.
getCurrentUser().then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

### Using `GetCurrentUser`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getCurrentUserRef } from '@dataconnect/generated';


// Call the `getCurrentUserRef()` function to get a reference to the query.
const ref = getCurrentUserRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getCurrentUserRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.user);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

## ListUsers
You can execute the `ListUsers` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listUsers(options?: ExecuteQueryOptions): QueryPromise<ListUsersData, undefined>;

interface ListUsersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUsersData, undefined>;
}
export const listUsersRef: ListUsersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listUsers(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListUsersData, undefined>;

interface ListUsersRef {
  ...
  (dc: DataConnect): QueryRef<ListUsersData, undefined>;
}
export const listUsersRef: ListUsersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listUsersRef:
```typescript
const name = listUsersRef.operationName;
console.log(name);
```

### Variables
The `ListUsers` query has no variables.
### Return Type
Recall that executing the `ListUsers` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListUsersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListUsersData {
  users: ({
    username: string;
    avatarUrl?: string | null;
  })[];
}
```
### Using `ListUsers`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listUsers } from '@dataconnect/generated';


// Call the `listUsers()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listUsers();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listUsers(dataConnect);

console.log(data.users);

// Or, you can use the `Promise` API.
listUsers().then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

### Using `ListUsers`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listUsersRef } from '@dataconnect/generated';


// Call the `listUsersRef()` function to get a reference to the query.
const ref = listUsersRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listUsersRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.users);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

## GetGame
You can execute the `GetGame` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getGame(options?: ExecuteQueryOptions): QueryPromise<GetGameData, undefined>;

interface GetGameRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetGameData, undefined>;
}
export const getGameRef: GetGameRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getGame(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetGameData, undefined>;

interface GetGameRef {
  ...
  (dc: DataConnect): QueryRef<GetGameData, undefined>;
}
export const getGameRef: GetGameRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getGameRef:
```typescript
const name = getGameRef.operationName;
console.log(name);
```

### Variables
The `GetGame` query has no variables.
### Return Type
Recall that executing the `GetGame` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetGameData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetGameData {
  game?: {
    title: string;
    genre: string;
  };
}
```
### Using `GetGame`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getGame } from '@dataconnect/generated';


// Call the `getGame()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getGame();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getGame(dataConnect);

console.log(data.game);

// Or, you can use the `Promise` API.
getGame().then((response) => {
  const data = response.data;
  console.log(data.game);
});
```

### Using `GetGame`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getGameRef } from '@dataconnect/generated';


// Call the `getGameRef()` function to get a reference to the query.
const ref = getGameRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getGameRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.game);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.game);
});
```

## ListGames
You can execute the `ListGames` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listGames(options?: ExecuteQueryOptions): QueryPromise<ListGamesData, undefined>;

interface ListGamesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListGamesData, undefined>;
}
export const listGamesRef: ListGamesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listGames(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListGamesData, undefined>;

interface ListGamesRef {
  ...
  (dc: DataConnect): QueryRef<ListGamesData, undefined>;
}
export const listGamesRef: ListGamesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listGamesRef:
```typescript
const name = listGamesRef.operationName;
console.log(name);
```

### Variables
The `ListGames` query has no variables.
### Return Type
Recall that executing the `ListGames` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListGamesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListGamesData {
  games: ({
    title: string;
    developer?: string | null;
  })[];
}
```
### Using `ListGames`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listGames } from '@dataconnect/generated';


// Call the `listGames()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listGames();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listGames(dataConnect);

console.log(data.games);

// Or, you can use the `Promise` API.
listGames().then((response) => {
  const data = response.data;
  console.log(data.games);
});
```

### Using `ListGames`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listGamesRef } from '@dataconnect/generated';


// Call the `listGamesRef()` function to get a reference to the query.
const ref = listGamesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listGamesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.games);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.games);
});
```

## GetLibraryEntry
You can execute the `GetLibraryEntry` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getLibraryEntry(options?: ExecuteQueryOptions): QueryPromise<GetLibraryEntryData, undefined>;

interface GetLibraryEntryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetLibraryEntryData, undefined>;
}
export const getLibraryEntryRef: GetLibraryEntryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getLibraryEntry(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetLibraryEntryData, undefined>;

interface GetLibraryEntryRef {
  ...
  (dc: DataConnect): QueryRef<GetLibraryEntryData, undefined>;
}
export const getLibraryEntryRef: GetLibraryEntryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getLibraryEntryRef:
```typescript
const name = getLibraryEntryRef.operationName;
console.log(name);
```

### Variables
The `GetLibraryEntry` query has no variables.
### Return Type
Recall that executing the `GetLibraryEntry` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetLibraryEntryData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetLibraryEntryData {
  libraryEntry?: {
    status: string;
    rating?: number | null;
  };
}
```
### Using `GetLibraryEntry`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getLibraryEntry } from '@dataconnect/generated';


// Call the `getLibraryEntry()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getLibraryEntry();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getLibraryEntry(dataConnect);

console.log(data.libraryEntry);

// Or, you can use the `Promise` API.
getLibraryEntry().then((response) => {
  const data = response.data;
  console.log(data.libraryEntry);
});
```

### Using `GetLibraryEntry`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getLibraryEntryRef } from '@dataconnect/generated';


// Call the `getLibraryEntryRef()` function to get a reference to the query.
const ref = getLibraryEntryRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getLibraryEntryRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.libraryEntry);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.libraryEntry);
});
```

## ListMyLibrary
You can execute the `ListMyLibrary` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listMyLibrary(options?: ExecuteQueryOptions): QueryPromise<ListMyLibraryData, undefined>;

interface ListMyLibraryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMyLibraryData, undefined>;
}
export const listMyLibraryRef: ListMyLibraryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listMyLibrary(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListMyLibraryData, undefined>;

interface ListMyLibraryRef {
  ...
  (dc: DataConnect): QueryRef<ListMyLibraryData, undefined>;
}
export const listMyLibraryRef: ListMyLibraryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listMyLibraryRef:
```typescript
const name = listMyLibraryRef.operationName;
console.log(name);
```

### Variables
The `ListMyLibrary` query has no variables.
### Return Type
Recall that executing the `ListMyLibrary` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListMyLibraryData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListMyLibraryData {
  libraryEntries: ({
    game: {
      title: string;
    };
    status: string;
  })[];
}
```
### Using `ListMyLibrary`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listMyLibrary } from '@dataconnect/generated';


// Call the `listMyLibrary()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listMyLibrary();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listMyLibrary(dataConnect);

console.log(data.libraryEntries);

// Or, you can use the `Promise` API.
listMyLibrary().then((response) => {
  const data = response.data;
  console.log(data.libraryEntries);
});
```

### Using `ListMyLibrary`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listMyLibraryRef } from '@dataconnect/generated';


// Call the `listMyLibraryRef()` function to get a reference to the query.
const ref = listMyLibraryRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listMyLibraryRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.libraryEntries);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.libraryEntries);
});
```

## GetCollection
You can execute the `GetCollection` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getCollection(options?: ExecuteQueryOptions): QueryPromise<GetCollectionData, undefined>;

interface GetCollectionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetCollectionData, undefined>;
}
export const getCollectionRef: GetCollectionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getCollection(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetCollectionData, undefined>;

interface GetCollectionRef {
  ...
  (dc: DataConnect): QueryRef<GetCollectionData, undefined>;
}
export const getCollectionRef: GetCollectionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getCollectionRef:
```typescript
const name = getCollectionRef.operationName;
console.log(name);
```

### Variables
The `GetCollection` query has no variables.
### Return Type
Recall that executing the `GetCollection` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetCollectionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetCollectionData {
  collection?: {
    name: string;
    description?: string | null;
  };
}
```
### Using `GetCollection`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getCollection } from '@dataconnect/generated';


// Call the `getCollection()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getCollection();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getCollection(dataConnect);

console.log(data.collection);

// Or, you can use the `Promise` API.
getCollection().then((response) => {
  const data = response.data;
  console.log(data.collection);
});
```

### Using `GetCollection`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getCollectionRef } from '@dataconnect/generated';


// Call the `getCollectionRef()` function to get a reference to the query.
const ref = getCollectionRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getCollectionRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.collection);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.collection);
});
```

## ListMyCollections
You can execute the `ListMyCollections` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listMyCollections(options?: ExecuteQueryOptions): QueryPromise<ListMyCollectionsData, undefined>;

interface ListMyCollectionsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMyCollectionsData, undefined>;
}
export const listMyCollectionsRef: ListMyCollectionsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listMyCollections(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListMyCollectionsData, undefined>;

interface ListMyCollectionsRef {
  ...
  (dc: DataConnect): QueryRef<ListMyCollectionsData, undefined>;
}
export const listMyCollectionsRef: ListMyCollectionsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listMyCollectionsRef:
```typescript
const name = listMyCollectionsRef.operationName;
console.log(name);
```

### Variables
The `ListMyCollections` query has no variables.
### Return Type
Recall that executing the `ListMyCollections` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListMyCollectionsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListMyCollectionsData {
  collections: ({
    name: string;
  })[];
}
```
### Using `ListMyCollections`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listMyCollections } from '@dataconnect/generated';


// Call the `listMyCollections()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listMyCollections();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listMyCollections(dataConnect);

console.log(data.collections);

// Or, you can use the `Promise` API.
listMyCollections().then((response) => {
  const data = response.data;
  console.log(data.collections);
});
```

### Using `ListMyCollections`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listMyCollectionsRef } from '@dataconnect/generated';


// Call the `listMyCollectionsRef()` function to get a reference to the query.
const ref = listMyCollectionsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listMyCollectionsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.collections);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.collections);
});
```

## ListCollectionGames
You can execute the `ListCollectionGames` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listCollectionGames(options?: ExecuteQueryOptions): QueryPromise<ListCollectionGamesData, undefined>;

interface ListCollectionGamesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListCollectionGamesData, undefined>;
}
export const listCollectionGamesRef: ListCollectionGamesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listCollectionGames(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListCollectionGamesData, undefined>;

interface ListCollectionGamesRef {
  ...
  (dc: DataConnect): QueryRef<ListCollectionGamesData, undefined>;
}
export const listCollectionGamesRef: ListCollectionGamesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listCollectionGamesRef:
```typescript
const name = listCollectionGamesRef.operationName;
console.log(name);
```

### Variables
The `ListCollectionGames` query has no variables.
### Return Type
Recall that executing the `ListCollectionGames` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListCollectionGamesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListCollectionGamesData {
  collectionGames: ({
    game: {
      title: string;
    };
  })[];
}
```
### Using `ListCollectionGames`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listCollectionGames } from '@dataconnect/generated';


// Call the `listCollectionGames()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listCollectionGames();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listCollectionGames(dataConnect);

console.log(data.collectionGames);

// Or, you can use the `Promise` API.
listCollectionGames().then((response) => {
  const data = response.data;
  console.log(data.collectionGames);
});
```

### Using `ListCollectionGames`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listCollectionGamesRef } from '@dataconnect/generated';


// Call the `listCollectionGamesRef()` function to get a reference to the query.
const ref = listCollectionGamesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listCollectionGamesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.collectionGames);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.collectionGames);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateUser
You can execute the `CreateUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createUser(): MutationPromise<CreateUserData, undefined>;

interface CreateUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateUserData, undefined>;
}
export const createUserRef: CreateUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createUser(dc: DataConnect): MutationPromise<CreateUserData, undefined>;

interface CreateUserRef {
  ...
  (dc: DataConnect): MutationRef<CreateUserData, undefined>;
}
export const createUserRef: CreateUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createUserRef:
```typescript
const name = createUserRef.operationName;
console.log(name);
```

### Variables
The `CreateUser` mutation has no variables.
### Return Type
Recall that executing the `CreateUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateUserData {
  user_insert: User_Key;
}
```
### Using `CreateUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createUser } from '@dataconnect/generated';


// Call the `createUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createUser(dataConnect);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
createUser().then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

### Using `CreateUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createUserRef } from '@dataconnect/generated';


// Call the `createUserRef()` function to get a reference to the mutation.
const ref = createUserRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createUserRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

## UpdateUser
You can execute the `UpdateUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateUser(): MutationPromise<UpdateUserData, undefined>;

interface UpdateUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<UpdateUserData, undefined>;
}
export const updateUserRef: UpdateUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateUser(dc: DataConnect): MutationPromise<UpdateUserData, undefined>;

interface UpdateUserRef {
  ...
  (dc: DataConnect): MutationRef<UpdateUserData, undefined>;
}
export const updateUserRef: UpdateUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateUserRef:
```typescript
const name = updateUserRef.operationName;
console.log(name);
```

### Variables
The `UpdateUser` mutation has no variables.
### Return Type
Recall that executing the `UpdateUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateUserData {
  user_update?: User_Key | null;
}
```
### Using `UpdateUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateUser } from '@dataconnect/generated';


// Call the `updateUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateUser(dataConnect);

console.log(data.user_update);

// Or, you can use the `Promise` API.
updateUser().then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

### Using `UpdateUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateUserRef } from '@dataconnect/generated';


// Call the `updateUserRef()` function to get a reference to the mutation.
const ref = updateUserRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateUserRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

## DeleteUser
You can execute the `DeleteUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteUser(): MutationPromise<DeleteUserData, undefined>;

interface DeleteUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<DeleteUserData, undefined>;
}
export const deleteUserRef: DeleteUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteUser(dc: DataConnect): MutationPromise<DeleteUserData, undefined>;

interface DeleteUserRef {
  ...
  (dc: DataConnect): MutationRef<DeleteUserData, undefined>;
}
export const deleteUserRef: DeleteUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteUserRef:
```typescript
const name = deleteUserRef.operationName;
console.log(name);
```

### Variables
The `DeleteUser` mutation has no variables.
### Return Type
Recall that executing the `DeleteUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteUserData {
  user_delete?: User_Key | null;
}
```
### Using `DeleteUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteUser } from '@dataconnect/generated';


// Call the `deleteUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteUser(dataConnect);

console.log(data.user_delete);

// Or, you can use the `Promise` API.
deleteUser().then((response) => {
  const data = response.data;
  console.log(data.user_delete);
});
```

### Using `DeleteUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteUserRef } from '@dataconnect/generated';


// Call the `deleteUserRef()` function to get a reference to the mutation.
const ref = deleteUserRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteUserRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_delete);
});
```

## CreateGame
You can execute the `CreateGame` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createGame(): MutationPromise<CreateGameData, undefined>;

interface CreateGameRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateGameData, undefined>;
}
export const createGameRef: CreateGameRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createGame(dc: DataConnect): MutationPromise<CreateGameData, undefined>;

interface CreateGameRef {
  ...
  (dc: DataConnect): MutationRef<CreateGameData, undefined>;
}
export const createGameRef: CreateGameRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createGameRef:
```typescript
const name = createGameRef.operationName;
console.log(name);
```

### Variables
The `CreateGame` mutation has no variables.
### Return Type
Recall that executing the `CreateGame` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateGameData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateGameData {
  game_insert: Game_Key;
}
```
### Using `CreateGame`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createGame } from '@dataconnect/generated';


// Call the `createGame()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createGame();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createGame(dataConnect);

console.log(data.game_insert);

// Or, you can use the `Promise` API.
createGame().then((response) => {
  const data = response.data;
  console.log(data.game_insert);
});
```

### Using `CreateGame`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createGameRef } from '@dataconnect/generated';


// Call the `createGameRef()` function to get a reference to the mutation.
const ref = createGameRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createGameRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.game_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.game_insert);
});
```

## UpdateGame
You can execute the `UpdateGame` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateGame(): MutationPromise<UpdateGameData, undefined>;

interface UpdateGameRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<UpdateGameData, undefined>;
}
export const updateGameRef: UpdateGameRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateGame(dc: DataConnect): MutationPromise<UpdateGameData, undefined>;

interface UpdateGameRef {
  ...
  (dc: DataConnect): MutationRef<UpdateGameData, undefined>;
}
export const updateGameRef: UpdateGameRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateGameRef:
```typescript
const name = updateGameRef.operationName;
console.log(name);
```

### Variables
The `UpdateGame` mutation has no variables.
### Return Type
Recall that executing the `UpdateGame` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateGameData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateGameData {
  game_update?: Game_Key | null;
}
```
### Using `UpdateGame`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateGame } from '@dataconnect/generated';


// Call the `updateGame()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateGame();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateGame(dataConnect);

console.log(data.game_update);

// Or, you can use the `Promise` API.
updateGame().then((response) => {
  const data = response.data;
  console.log(data.game_update);
});
```

### Using `UpdateGame`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateGameRef } from '@dataconnect/generated';


// Call the `updateGameRef()` function to get a reference to the mutation.
const ref = updateGameRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateGameRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.game_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.game_update);
});
```

## DeleteGame
You can execute the `DeleteGame` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteGame(): MutationPromise<DeleteGameData, undefined>;

interface DeleteGameRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<DeleteGameData, undefined>;
}
export const deleteGameRef: DeleteGameRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteGame(dc: DataConnect): MutationPromise<DeleteGameData, undefined>;

interface DeleteGameRef {
  ...
  (dc: DataConnect): MutationRef<DeleteGameData, undefined>;
}
export const deleteGameRef: DeleteGameRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteGameRef:
```typescript
const name = deleteGameRef.operationName;
console.log(name);
```

### Variables
The `DeleteGame` mutation has no variables.
### Return Type
Recall that executing the `DeleteGame` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteGameData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteGameData {
  game_delete?: Game_Key | null;
}
```
### Using `DeleteGame`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteGame } from '@dataconnect/generated';


// Call the `deleteGame()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteGame();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteGame(dataConnect);

console.log(data.game_delete);

// Or, you can use the `Promise` API.
deleteGame().then((response) => {
  const data = response.data;
  console.log(data.game_delete);
});
```

### Using `DeleteGame`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteGameRef } from '@dataconnect/generated';


// Call the `deleteGameRef()` function to get a reference to the mutation.
const ref = deleteGameRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteGameRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.game_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.game_delete);
});
```

## CreateLibraryEntry
You can execute the `CreateLibraryEntry` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createLibraryEntry(): MutationPromise<CreateLibraryEntryData, undefined>;

interface CreateLibraryEntryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateLibraryEntryData, undefined>;
}
export const createLibraryEntryRef: CreateLibraryEntryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createLibraryEntry(dc: DataConnect): MutationPromise<CreateLibraryEntryData, undefined>;

interface CreateLibraryEntryRef {
  ...
  (dc: DataConnect): MutationRef<CreateLibraryEntryData, undefined>;
}
export const createLibraryEntryRef: CreateLibraryEntryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createLibraryEntryRef:
```typescript
const name = createLibraryEntryRef.operationName;
console.log(name);
```

### Variables
The `CreateLibraryEntry` mutation has no variables.
### Return Type
Recall that executing the `CreateLibraryEntry` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateLibraryEntryData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateLibraryEntryData {
  libraryEntry_insert: LibraryEntry_Key;
}
```
### Using `CreateLibraryEntry`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createLibraryEntry } from '@dataconnect/generated';


// Call the `createLibraryEntry()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createLibraryEntry();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createLibraryEntry(dataConnect);

console.log(data.libraryEntry_insert);

// Or, you can use the `Promise` API.
createLibraryEntry().then((response) => {
  const data = response.data;
  console.log(data.libraryEntry_insert);
});
```

### Using `CreateLibraryEntry`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createLibraryEntryRef } from '@dataconnect/generated';


// Call the `createLibraryEntryRef()` function to get a reference to the mutation.
const ref = createLibraryEntryRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createLibraryEntryRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.libraryEntry_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.libraryEntry_insert);
});
```

## UpdateLibraryEntry
You can execute the `UpdateLibraryEntry` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateLibraryEntry(): MutationPromise<UpdateLibraryEntryData, undefined>;

interface UpdateLibraryEntryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<UpdateLibraryEntryData, undefined>;
}
export const updateLibraryEntryRef: UpdateLibraryEntryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateLibraryEntry(dc: DataConnect): MutationPromise<UpdateLibraryEntryData, undefined>;

interface UpdateLibraryEntryRef {
  ...
  (dc: DataConnect): MutationRef<UpdateLibraryEntryData, undefined>;
}
export const updateLibraryEntryRef: UpdateLibraryEntryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateLibraryEntryRef:
```typescript
const name = updateLibraryEntryRef.operationName;
console.log(name);
```

### Variables
The `UpdateLibraryEntry` mutation has no variables.
### Return Type
Recall that executing the `UpdateLibraryEntry` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateLibraryEntryData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateLibraryEntryData {
  libraryEntry_update?: LibraryEntry_Key | null;
}
```
### Using `UpdateLibraryEntry`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateLibraryEntry } from '@dataconnect/generated';


// Call the `updateLibraryEntry()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateLibraryEntry();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateLibraryEntry(dataConnect);

console.log(data.libraryEntry_update);

// Or, you can use the `Promise` API.
updateLibraryEntry().then((response) => {
  const data = response.data;
  console.log(data.libraryEntry_update);
});
```

### Using `UpdateLibraryEntry`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateLibraryEntryRef } from '@dataconnect/generated';


// Call the `updateLibraryEntryRef()` function to get a reference to the mutation.
const ref = updateLibraryEntryRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateLibraryEntryRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.libraryEntry_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.libraryEntry_update);
});
```

## DeleteLibraryEntry
You can execute the `DeleteLibraryEntry` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteLibraryEntry(): MutationPromise<DeleteLibraryEntryData, undefined>;

interface DeleteLibraryEntryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<DeleteLibraryEntryData, undefined>;
}
export const deleteLibraryEntryRef: DeleteLibraryEntryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteLibraryEntry(dc: DataConnect): MutationPromise<DeleteLibraryEntryData, undefined>;

interface DeleteLibraryEntryRef {
  ...
  (dc: DataConnect): MutationRef<DeleteLibraryEntryData, undefined>;
}
export const deleteLibraryEntryRef: DeleteLibraryEntryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteLibraryEntryRef:
```typescript
const name = deleteLibraryEntryRef.operationName;
console.log(name);
```

### Variables
The `DeleteLibraryEntry` mutation has no variables.
### Return Type
Recall that executing the `DeleteLibraryEntry` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteLibraryEntryData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteLibraryEntryData {
  libraryEntry_delete?: LibraryEntry_Key | null;
}
```
### Using `DeleteLibraryEntry`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteLibraryEntry } from '@dataconnect/generated';


// Call the `deleteLibraryEntry()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteLibraryEntry();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteLibraryEntry(dataConnect);

console.log(data.libraryEntry_delete);

// Or, you can use the `Promise` API.
deleteLibraryEntry().then((response) => {
  const data = response.data;
  console.log(data.libraryEntry_delete);
});
```

### Using `DeleteLibraryEntry`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteLibraryEntryRef } from '@dataconnect/generated';


// Call the `deleteLibraryEntryRef()` function to get a reference to the mutation.
const ref = deleteLibraryEntryRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteLibraryEntryRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.libraryEntry_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.libraryEntry_delete);
});
```

## CreateCollection
You can execute the `CreateCollection` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createCollection(): MutationPromise<CreateCollectionData, undefined>;

interface CreateCollectionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateCollectionData, undefined>;
}
export const createCollectionRef: CreateCollectionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createCollection(dc: DataConnect): MutationPromise<CreateCollectionData, undefined>;

interface CreateCollectionRef {
  ...
  (dc: DataConnect): MutationRef<CreateCollectionData, undefined>;
}
export const createCollectionRef: CreateCollectionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createCollectionRef:
```typescript
const name = createCollectionRef.operationName;
console.log(name);
```

### Variables
The `CreateCollection` mutation has no variables.
### Return Type
Recall that executing the `CreateCollection` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateCollectionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateCollectionData {
  collection_insert: Collection_Key;
}
```
### Using `CreateCollection`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createCollection } from '@dataconnect/generated';


// Call the `createCollection()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createCollection();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createCollection(dataConnect);

console.log(data.collection_insert);

// Or, you can use the `Promise` API.
createCollection().then((response) => {
  const data = response.data;
  console.log(data.collection_insert);
});
```

### Using `CreateCollection`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createCollectionRef } from '@dataconnect/generated';


// Call the `createCollectionRef()` function to get a reference to the mutation.
const ref = createCollectionRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createCollectionRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.collection_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.collection_insert);
});
```

## UpdateCollection
You can execute the `UpdateCollection` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateCollection(): MutationPromise<UpdateCollectionData, undefined>;

interface UpdateCollectionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<UpdateCollectionData, undefined>;
}
export const updateCollectionRef: UpdateCollectionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateCollection(dc: DataConnect): MutationPromise<UpdateCollectionData, undefined>;

interface UpdateCollectionRef {
  ...
  (dc: DataConnect): MutationRef<UpdateCollectionData, undefined>;
}
export const updateCollectionRef: UpdateCollectionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateCollectionRef:
```typescript
const name = updateCollectionRef.operationName;
console.log(name);
```

### Variables
The `UpdateCollection` mutation has no variables.
### Return Type
Recall that executing the `UpdateCollection` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateCollectionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateCollectionData {
  collection_update?: Collection_Key | null;
}
```
### Using `UpdateCollection`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateCollection } from '@dataconnect/generated';


// Call the `updateCollection()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateCollection();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateCollection(dataConnect);

console.log(data.collection_update);

// Or, you can use the `Promise` API.
updateCollection().then((response) => {
  const data = response.data;
  console.log(data.collection_update);
});
```

### Using `UpdateCollection`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateCollectionRef } from '@dataconnect/generated';


// Call the `updateCollectionRef()` function to get a reference to the mutation.
const ref = updateCollectionRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateCollectionRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.collection_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.collection_update);
});
```

## DeleteCollection
You can execute the `DeleteCollection` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteCollection(): MutationPromise<DeleteCollectionData, undefined>;

interface DeleteCollectionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<DeleteCollectionData, undefined>;
}
export const deleteCollectionRef: DeleteCollectionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteCollection(dc: DataConnect): MutationPromise<DeleteCollectionData, undefined>;

interface DeleteCollectionRef {
  ...
  (dc: DataConnect): MutationRef<DeleteCollectionData, undefined>;
}
export const deleteCollectionRef: DeleteCollectionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteCollectionRef:
```typescript
const name = deleteCollectionRef.operationName;
console.log(name);
```

### Variables
The `DeleteCollection` mutation has no variables.
### Return Type
Recall that executing the `DeleteCollection` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteCollectionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteCollectionData {
  collection_delete?: Collection_Key | null;
}
```
### Using `DeleteCollection`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteCollection } from '@dataconnect/generated';


// Call the `deleteCollection()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteCollection();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteCollection(dataConnect);

console.log(data.collection_delete);

// Or, you can use the `Promise` API.
deleteCollection().then((response) => {
  const data = response.data;
  console.log(data.collection_delete);
});
```

### Using `DeleteCollection`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteCollectionRef } from '@dataconnect/generated';


// Call the `deleteCollectionRef()` function to get a reference to the mutation.
const ref = deleteCollectionRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteCollectionRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.collection_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.collection_delete);
});
```

## CreateCollectionGame
You can execute the `CreateCollectionGame` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createCollectionGame(): MutationPromise<CreateCollectionGameData, undefined>;

interface CreateCollectionGameRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateCollectionGameData, undefined>;
}
export const createCollectionGameRef: CreateCollectionGameRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createCollectionGame(dc: DataConnect): MutationPromise<CreateCollectionGameData, undefined>;

interface CreateCollectionGameRef {
  ...
  (dc: DataConnect): MutationRef<CreateCollectionGameData, undefined>;
}
export const createCollectionGameRef: CreateCollectionGameRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createCollectionGameRef:
```typescript
const name = createCollectionGameRef.operationName;
console.log(name);
```

### Variables
The `CreateCollectionGame` mutation has no variables.
### Return Type
Recall that executing the `CreateCollectionGame` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateCollectionGameData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateCollectionGameData {
  collectionGame_insert: CollectionGame_Key;
}
```
### Using `CreateCollectionGame`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createCollectionGame } from '@dataconnect/generated';


// Call the `createCollectionGame()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createCollectionGame();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createCollectionGame(dataConnect);

console.log(data.collectionGame_insert);

// Or, you can use the `Promise` API.
createCollectionGame().then((response) => {
  const data = response.data;
  console.log(data.collectionGame_insert);
});
```

### Using `CreateCollectionGame`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createCollectionGameRef } from '@dataconnect/generated';


// Call the `createCollectionGameRef()` function to get a reference to the mutation.
const ref = createCollectionGameRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createCollectionGameRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.collectionGame_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.collectionGame_insert);
});
```

## DeleteCollectionGame
You can execute the `DeleteCollectionGame` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteCollectionGame(): MutationPromise<DeleteCollectionGameData, undefined>;

interface DeleteCollectionGameRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<DeleteCollectionGameData, undefined>;
}
export const deleteCollectionGameRef: DeleteCollectionGameRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteCollectionGame(dc: DataConnect): MutationPromise<DeleteCollectionGameData, undefined>;

interface DeleteCollectionGameRef {
  ...
  (dc: DataConnect): MutationRef<DeleteCollectionGameData, undefined>;
}
export const deleteCollectionGameRef: DeleteCollectionGameRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteCollectionGameRef:
```typescript
const name = deleteCollectionGameRef.operationName;
console.log(name);
```

### Variables
The `DeleteCollectionGame` mutation has no variables.
### Return Type
Recall that executing the `DeleteCollectionGame` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteCollectionGameData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteCollectionGameData {
  collectionGame_delete?: CollectionGame_Key | null;
}
```
### Using `DeleteCollectionGame`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteCollectionGame } from '@dataconnect/generated';


// Call the `deleteCollectionGame()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteCollectionGame();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteCollectionGame(dataConnect);

console.log(data.collectionGame_delete);

// Or, you can use the `Promise` API.
deleteCollectionGame().then((response) => {
  const data = response.data;
  console.log(data.collectionGame_delete);
});
```

### Using `DeleteCollectionGame`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteCollectionGameRef } from '@dataconnect/generated';


// Call the `deleteCollectionGameRef()` function to get a reference to the mutation.
const ref = deleteCollectionGameRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteCollectionGameRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.collectionGame_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.collectionGame_delete);
});
```

