# Generated Angular README
This README will guide you through the process of using the generated Angular SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `JavaScript README`, you can find it at [`dataconnect-generated/README.md`](../README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

You can use this generated SDK by importing from the package `@dataconnect/generated/angular` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#angular).

# Table of Contents
- [**Overview**](#generated-angular-readme)
- [**TanStack Query Firebase & TanStack Angular Query**](#tanstack-query-firebase-tanstack-angular-query)
  - [*Package Installation*](#installing-tanstack-query-firebase-and-tanstack-angular-query-packages)
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

# TanStack Query Firebase & TanStack Angular Query
This SDK provides [Angular](https://angular.dev/) injectors generated specific to your application, for the operations found in the connector `example`. These injectors are generated using [TanStack Query Firebase](https://react-query-firebase.invertase.dev/) by our partners at Invertase, a library built on top of [TanStack Angular Query v5](https://tanstack.com/query/v5/docs/framework/angular/overview) and [AngularFire](https://github.com/angular/angularfire/tree/main).

***You do not need to be familiar with Tanstack Query or Tanstack Query Firebase to use this SDK.*** However, you may find it useful to learn more about them, as they will empower you as a user of this Generated Angular SDK.

## Installing TanStack Query Firebase and TanStack Angular Query Packages
In order to use the Angular generated SDK, you must install `AngularFire` and select `Data Connect` during the setup.

You can install `AngularFire` using the [Angular CLI](https://angular.dev/installation#install-angular-cli). You can also follow the installation instructions from the [TanStack Query Firebase documentation](https://react-query-firebase.invertase.dev/angular#automatic-setup).

```bash
npm install -g @angular/cli
```
```bash
ng add @angular/fire
# select Data Connect during setup!
```

This should handle configuring your project to use TanStack Query. However, if you need to set up manually, please follow the [TanStack Query Firebase documentation](https://invertase.docs.page/tanstack-query-firebase/angular#usage).

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`.

You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, edit your `main.ts` file and your `app/app.config.ts` file and update your `provideDataConnect` provider:
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#emulator-react-angular).

```javascript
... // other imports
// update your imports to include the function that connects to the emulator
import { getDataConnect, provideDataConnect, connectDataConnectEmulator } from '@angular/fire/data-connect';

// update the `provideDataConnect` provider to provide an instance of `DataConnect` which uses the emulator:
export const appConfig: ApplicationConfig = {
  providers: [
    ... // other providers
    // Firebase Data Connect providers
    ...
    provideDataConnect(() => {
      const dataConnect = getDataConnect(connectorConfig);
      connectDataConnectEmulator(dataConnect, 'localhost', 9399);
      return dataConnect;
    }),
  ],
};
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) using the injectors provided from your generated Angular SDK.

# Queries

The Angular generated SDK provides Query injectors that call [`injectDataConnectQuery`](https://react-query-firebase.invertase.dev/angular/data-connect/querying) from TanStack Query Firebase.

Calling these injectors will return a `CreateDataConnectQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and the most recent data returned by the Query, among other things. To learn more about these injectors and how to use them, see the [TanStack Query Firebase documentation](https://react-query-firebase.invertase.dev/angular/data-connect/querying).

TanStack Angular Query caches the results of your Queries, so using the same Query injector in multiple places in your application allows the entire application to automatically see updates to that Query's data.

Query injectors execute their Queries automatically when called, and periodically refresh, unless you change the `queryOptions` for the Query. To learn how to stop a Query from automatically executing, including how to make a query "lazy", see the [TanStack Angular Query documentation](https://tanstack.com/query/latest/docs/framework/angular/guides/disabling-queries).

To learn more about TanStack Angular Query's Queries, see the [TanStack Angular Query documentation](https://tanstack.com/query/v5/docs/framework/angular/guides/queries).

## Using Query Injectors
Here's a general overview of how to use the generated Query injectors in your code:

- If the Query has no variables, the Query injector does not require arguments.
- If the Query has any required variables, the Query injector will require at least one argument: an object that contains all the required variables for the Query.
- If the Query has some required and some optional variables, only required variables are necessary in the variables argument object, and optional variables may be provided as well.
- If all of the Query's variables are optional, the Query injector does not require any arguments.
- The Angular generated SDK's Query injectors do not accept `DataConnect` instances as arguments.
- Query injector functions can be called with or without passing in an `options` argument, whose type is a function which returns an object. The type is generated alongside the operation's injector function in [dataconnect-generated/angular/index.d.ts](./index.d.ts). To learn more about the `options` argument, see the [TanStack Angular Query documentation](https://tanstack.com/query/v5/docs/framework/angular/guides/query-options).
  - ***Special case:***  If the Query has all optional variables and you would like to provide an `options` argument to the Query injector without providing any variables, you must pass `undefined` where you would normally pass the Query's variables, and then may provide the `options` argument.

Below are examples of how to use the `example` connector's generated Query injectors to execute each Query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#operations-react-angular).

## GetCurrentUser
You can execute the `GetCurrentUser` Query using the following Query injector, which is defined in [dataconnect-generated/angular/index.d.ts](./index.d.ts):

```javascript
injectGetCurrentUser(options?: GetCurrentUserOptions, injector?: Injector): CreateDataConnectQueryResult<GetCurrentUserData, undefined>;
```

### Variables
The `GetCurrentUser` Query has no variables.
### Return Type
Recall that calling the `GetCurrentUser` Query injector returns a `CreateDataConnectQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `CreateDataConnectQueryResult.status()` function. You can also check for pending / success / error status using the `CreateDataConnectQueryResult.isPending()`, `CreateDataConnectQueryResult.isSuccess()`, and `CreateDataConnectQueryResult.isError()` functions.

To access the data returned by a Query, use the `CreateDataConnectQueryResult.data()` function. The data for the `GetCurrentUser` Query is of type `GetCurrentUserData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface GetCurrentUserData {
  user?: {
    username: string;
    email: string;
  };
}
```

To learn more about the `CreateDataConnectQueryResult` object, see the [TanStack Query Firebase documentation](https://docs.page/invertase/tanstack-query-firebase/angular/data-connect/functions/injectDataConnectQuery) and the [TanStack Angular Query documentation](https://tanstack.com/query/v5/docs/framework/angular/reference/functions/injectquery).

### Using `GetCurrentUser`'s Query injector

```javascript
... // other imports
import { connectorConfig } from '@dataconnect/generated';
import { injectGetCurrentUser, GetCurrentUserOptions } from '@dataconnect/generated/angular'
import { DataConnect } from '@angular/fire/data-connect';
import { initializeApp } from '@angular/fire/app';

@Component({
  ... // other component fields
  template: `
    <!-- You can render your component dynamically based on the status of the Query. -->
    @if (query.isPending()) {
      Loading...
    }
    @if (query.error()) {
      An error has occurred: {{ query.error() }}
    }
    <!-- If the Query is successful, you can access the data returned using
      the CreateDataConnectQueryResult.data() function. -->
    @if (query.data(); as data) {
      <!-- use your data to display something -->
            <div>Query successful!</div>
    }
  `,
})
export class MyComponent {
  // Since the execution of the query is eager, you don't have to call `execute` to "execute" the Query.
  // Call the Query injector function to get a `CreateDataConnectQueryResult` object which holds the state of your Query.
  query = injectGetCurrentUser();

  // You can also pass in an options function (not object) of type `GetCurrentUserOptions` to the Query injector function.
  options: GetCurrentUserOptions = () => {
    return {
      staleTime: 5 * 1000
    };
  };
  query = injectGetCurrentUser(this.options);
}
```

## ListUsers
You can execute the `ListUsers` Query using the following Query injector, which is defined in [dataconnect-generated/angular/index.d.ts](./index.d.ts):

```javascript
injectListUsers(options?: ListUsersOptions, injector?: Injector): CreateDataConnectQueryResult<ListUsersData, undefined>;
```

### Variables
The `ListUsers` Query has no variables.
### Return Type
Recall that calling the `ListUsers` Query injector returns a `CreateDataConnectQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `CreateDataConnectQueryResult.status()` function. You can also check for pending / success / error status using the `CreateDataConnectQueryResult.isPending()`, `CreateDataConnectQueryResult.isSuccess()`, and `CreateDataConnectQueryResult.isError()` functions.

To access the data returned by a Query, use the `CreateDataConnectQueryResult.data()` function. The data for the `ListUsers` Query is of type `ListUsersData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface ListUsersData {
  users: ({
    username: string;
    avatarUrl?: string | null;
  })[];
}
```

To learn more about the `CreateDataConnectQueryResult` object, see the [TanStack Query Firebase documentation](https://docs.page/invertase/tanstack-query-firebase/angular/data-connect/functions/injectDataConnectQuery) and the [TanStack Angular Query documentation](https://tanstack.com/query/v5/docs/framework/angular/reference/functions/injectquery).

### Using `ListUsers`'s Query injector

```javascript
... // other imports
import { connectorConfig } from '@dataconnect/generated';
import { injectListUsers, ListUsersOptions } from '@dataconnect/generated/angular'
import { DataConnect } from '@angular/fire/data-connect';
import { initializeApp } from '@angular/fire/app';

@Component({
  ... // other component fields
  template: `
    <!-- You can render your component dynamically based on the status of the Query. -->
    @if (query.isPending()) {
      Loading...
    }
    @if (query.error()) {
      An error has occurred: {{ query.error() }}
    }
    <!-- If the Query is successful, you can access the data returned using
      the CreateDataConnectQueryResult.data() function. -->
    @if (query.data(); as data) {
      <!-- use your data to display something -->
            <div>Query successful!</div>
    }
  `,
})
export class MyComponent {
  // Since the execution of the query is eager, you don't have to call `execute` to "execute" the Query.
  // Call the Query injector function to get a `CreateDataConnectQueryResult` object which holds the state of your Query.
  query = injectListUsers();

  // You can also pass in an options function (not object) of type `ListUsersOptions` to the Query injector function.
  options: ListUsersOptions = () => {
    return {
      staleTime: 5 * 1000
    };
  };
  query = injectListUsers(this.options);
}
```

## GetGame
You can execute the `GetGame` Query using the following Query injector, which is defined in [dataconnect-generated/angular/index.d.ts](./index.d.ts):

```javascript
injectGetGame(options?: GetGameOptions, injector?: Injector): CreateDataConnectQueryResult<GetGameData, undefined>;
```

### Variables
The `GetGame` Query has no variables.
### Return Type
Recall that calling the `GetGame` Query injector returns a `CreateDataConnectQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `CreateDataConnectQueryResult.status()` function. You can also check for pending / success / error status using the `CreateDataConnectQueryResult.isPending()`, `CreateDataConnectQueryResult.isSuccess()`, and `CreateDataConnectQueryResult.isError()` functions.

To access the data returned by a Query, use the `CreateDataConnectQueryResult.data()` function. The data for the `GetGame` Query is of type `GetGameData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface GetGameData {
  game?: {
    title: string;
    genre: string;
  };
}
```

To learn more about the `CreateDataConnectQueryResult` object, see the [TanStack Query Firebase documentation](https://docs.page/invertase/tanstack-query-firebase/angular/data-connect/functions/injectDataConnectQuery) and the [TanStack Angular Query documentation](https://tanstack.com/query/v5/docs/framework/angular/reference/functions/injectquery).

### Using `GetGame`'s Query injector

```javascript
... // other imports
import { connectorConfig } from '@dataconnect/generated';
import { injectGetGame, GetGameOptions } from '@dataconnect/generated/angular'
import { DataConnect } from '@angular/fire/data-connect';
import { initializeApp } from '@angular/fire/app';

@Component({
  ... // other component fields
  template: `
    <!-- You can render your component dynamically based on the status of the Query. -->
    @if (query.isPending()) {
      Loading...
    }
    @if (query.error()) {
      An error has occurred: {{ query.error() }}
    }
    <!-- If the Query is successful, you can access the data returned using
      the CreateDataConnectQueryResult.data() function. -->
    @if (query.data(); as data) {
      <!-- use your data to display something -->
            <div>Query successful!</div>
    }
  `,
})
export class MyComponent {
  // Since the execution of the query is eager, you don't have to call `execute` to "execute" the Query.
  // Call the Query injector function to get a `CreateDataConnectQueryResult` object which holds the state of your Query.
  query = injectGetGame();

  // You can also pass in an options function (not object) of type `GetGameOptions` to the Query injector function.
  options: GetGameOptions = () => {
    return {
      staleTime: 5 * 1000
    };
  };
  query = injectGetGame(this.options);
}
```

## ListGames
You can execute the `ListGames` Query using the following Query injector, which is defined in [dataconnect-generated/angular/index.d.ts](./index.d.ts):

```javascript
injectListGames(options?: ListGamesOptions, injector?: Injector): CreateDataConnectQueryResult<ListGamesData, undefined>;
```

### Variables
The `ListGames` Query has no variables.
### Return Type
Recall that calling the `ListGames` Query injector returns a `CreateDataConnectQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `CreateDataConnectQueryResult.status()` function. You can also check for pending / success / error status using the `CreateDataConnectQueryResult.isPending()`, `CreateDataConnectQueryResult.isSuccess()`, and `CreateDataConnectQueryResult.isError()` functions.

To access the data returned by a Query, use the `CreateDataConnectQueryResult.data()` function. The data for the `ListGames` Query is of type `ListGamesData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface ListGamesData {
  games: ({
    title: string;
    developer?: string | null;
  })[];
}
```

To learn more about the `CreateDataConnectQueryResult` object, see the [TanStack Query Firebase documentation](https://docs.page/invertase/tanstack-query-firebase/angular/data-connect/functions/injectDataConnectQuery) and the [TanStack Angular Query documentation](https://tanstack.com/query/v5/docs/framework/angular/reference/functions/injectquery).

### Using `ListGames`'s Query injector

```javascript
... // other imports
import { connectorConfig } from '@dataconnect/generated';
import { injectListGames, ListGamesOptions } from '@dataconnect/generated/angular'
import { DataConnect } from '@angular/fire/data-connect';
import { initializeApp } from '@angular/fire/app';

@Component({
  ... // other component fields
  template: `
    <!-- You can render your component dynamically based on the status of the Query. -->
    @if (query.isPending()) {
      Loading...
    }
    @if (query.error()) {
      An error has occurred: {{ query.error() }}
    }
    <!-- If the Query is successful, you can access the data returned using
      the CreateDataConnectQueryResult.data() function. -->
    @if (query.data(); as data) {
      <!-- use your data to display something -->
            <div>Query successful!</div>
    }
  `,
})
export class MyComponent {
  // Since the execution of the query is eager, you don't have to call `execute` to "execute" the Query.
  // Call the Query injector function to get a `CreateDataConnectQueryResult` object which holds the state of your Query.
  query = injectListGames();

  // You can also pass in an options function (not object) of type `ListGamesOptions` to the Query injector function.
  options: ListGamesOptions = () => {
    return {
      staleTime: 5 * 1000
    };
  };
  query = injectListGames(this.options);
}
```

## GetLibraryEntry
You can execute the `GetLibraryEntry` Query using the following Query injector, which is defined in [dataconnect-generated/angular/index.d.ts](./index.d.ts):

```javascript
injectGetLibraryEntry(options?: GetLibraryEntryOptions, injector?: Injector): CreateDataConnectQueryResult<GetLibraryEntryData, undefined>;
```

### Variables
The `GetLibraryEntry` Query has no variables.
### Return Type
Recall that calling the `GetLibraryEntry` Query injector returns a `CreateDataConnectQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `CreateDataConnectQueryResult.status()` function. You can also check for pending / success / error status using the `CreateDataConnectQueryResult.isPending()`, `CreateDataConnectQueryResult.isSuccess()`, and `CreateDataConnectQueryResult.isError()` functions.

To access the data returned by a Query, use the `CreateDataConnectQueryResult.data()` function. The data for the `GetLibraryEntry` Query is of type `GetLibraryEntryData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface GetLibraryEntryData {
  libraryEntry?: {
    status: string;
    rating?: number | null;
  };
}
```

To learn more about the `CreateDataConnectQueryResult` object, see the [TanStack Query Firebase documentation](https://docs.page/invertase/tanstack-query-firebase/angular/data-connect/functions/injectDataConnectQuery) and the [TanStack Angular Query documentation](https://tanstack.com/query/v5/docs/framework/angular/reference/functions/injectquery).

### Using `GetLibraryEntry`'s Query injector

```javascript
... // other imports
import { connectorConfig } from '@dataconnect/generated';
import { injectGetLibraryEntry, GetLibraryEntryOptions } from '@dataconnect/generated/angular'
import { DataConnect } from '@angular/fire/data-connect';
import { initializeApp } from '@angular/fire/app';

@Component({
  ... // other component fields
  template: `
    <!-- You can render your component dynamically based on the status of the Query. -->
    @if (query.isPending()) {
      Loading...
    }
    @if (query.error()) {
      An error has occurred: {{ query.error() }}
    }
    <!-- If the Query is successful, you can access the data returned using
      the CreateDataConnectQueryResult.data() function. -->
    @if (query.data(); as data) {
      <!-- use your data to display something -->
            <div>Query successful!</div>
    }
  `,
})
export class MyComponent {
  // Since the execution of the query is eager, you don't have to call `execute` to "execute" the Query.
  // Call the Query injector function to get a `CreateDataConnectQueryResult` object which holds the state of your Query.
  query = injectGetLibraryEntry();

  // You can also pass in an options function (not object) of type `GetLibraryEntryOptions` to the Query injector function.
  options: GetLibraryEntryOptions = () => {
    return {
      staleTime: 5 * 1000
    };
  };
  query = injectGetLibraryEntry(this.options);
}
```

## ListMyLibrary
You can execute the `ListMyLibrary` Query using the following Query injector, which is defined in [dataconnect-generated/angular/index.d.ts](./index.d.ts):

```javascript
injectListMyLibrary(options?: ListMyLibraryOptions, injector?: Injector): CreateDataConnectQueryResult<ListMyLibraryData, undefined>;
```

### Variables
The `ListMyLibrary` Query has no variables.
### Return Type
Recall that calling the `ListMyLibrary` Query injector returns a `CreateDataConnectQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `CreateDataConnectQueryResult.status()` function. You can also check for pending / success / error status using the `CreateDataConnectQueryResult.isPending()`, `CreateDataConnectQueryResult.isSuccess()`, and `CreateDataConnectQueryResult.isError()` functions.

To access the data returned by a Query, use the `CreateDataConnectQueryResult.data()` function. The data for the `ListMyLibrary` Query is of type `ListMyLibraryData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface ListMyLibraryData {
  libraryEntries: ({
    game: {
      title: string;
    };
    status: string;
  })[];
}
```

To learn more about the `CreateDataConnectQueryResult` object, see the [TanStack Query Firebase documentation](https://docs.page/invertase/tanstack-query-firebase/angular/data-connect/functions/injectDataConnectQuery) and the [TanStack Angular Query documentation](https://tanstack.com/query/v5/docs/framework/angular/reference/functions/injectquery).

### Using `ListMyLibrary`'s Query injector

```javascript
... // other imports
import { connectorConfig } from '@dataconnect/generated';
import { injectListMyLibrary, ListMyLibraryOptions } from '@dataconnect/generated/angular'
import { DataConnect } from '@angular/fire/data-connect';
import { initializeApp } from '@angular/fire/app';

@Component({
  ... // other component fields
  template: `
    <!-- You can render your component dynamically based on the status of the Query. -->
    @if (query.isPending()) {
      Loading...
    }
    @if (query.error()) {
      An error has occurred: {{ query.error() }}
    }
    <!-- If the Query is successful, you can access the data returned using
      the CreateDataConnectQueryResult.data() function. -->
    @if (query.data(); as data) {
      <!-- use your data to display something -->
            <div>Query successful!</div>
    }
  `,
})
export class MyComponent {
  // Since the execution of the query is eager, you don't have to call `execute` to "execute" the Query.
  // Call the Query injector function to get a `CreateDataConnectQueryResult` object which holds the state of your Query.
  query = injectListMyLibrary();

  // You can also pass in an options function (not object) of type `ListMyLibraryOptions` to the Query injector function.
  options: ListMyLibraryOptions = () => {
    return {
      staleTime: 5 * 1000
    };
  };
  query = injectListMyLibrary(this.options);
}
```

## GetCollection
You can execute the `GetCollection` Query using the following Query injector, which is defined in [dataconnect-generated/angular/index.d.ts](./index.d.ts):

```javascript
injectGetCollection(options?: GetCollectionOptions, injector?: Injector): CreateDataConnectQueryResult<GetCollectionData, undefined>;
```

### Variables
The `GetCollection` Query has no variables.
### Return Type
Recall that calling the `GetCollection` Query injector returns a `CreateDataConnectQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `CreateDataConnectQueryResult.status()` function. You can also check for pending / success / error status using the `CreateDataConnectQueryResult.isPending()`, `CreateDataConnectQueryResult.isSuccess()`, and `CreateDataConnectQueryResult.isError()` functions.

To access the data returned by a Query, use the `CreateDataConnectQueryResult.data()` function. The data for the `GetCollection` Query is of type `GetCollectionData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface GetCollectionData {
  collection?: {
    name: string;
    description?: string | null;
  };
}
```

To learn more about the `CreateDataConnectQueryResult` object, see the [TanStack Query Firebase documentation](https://docs.page/invertase/tanstack-query-firebase/angular/data-connect/functions/injectDataConnectQuery) and the [TanStack Angular Query documentation](https://tanstack.com/query/v5/docs/framework/angular/reference/functions/injectquery).

### Using `GetCollection`'s Query injector

```javascript
... // other imports
import { connectorConfig } from '@dataconnect/generated';
import { injectGetCollection, GetCollectionOptions } from '@dataconnect/generated/angular'
import { DataConnect } from '@angular/fire/data-connect';
import { initializeApp } from '@angular/fire/app';

@Component({
  ... // other component fields
  template: `
    <!-- You can render your component dynamically based on the status of the Query. -->
    @if (query.isPending()) {
      Loading...
    }
    @if (query.error()) {
      An error has occurred: {{ query.error() }}
    }
    <!-- If the Query is successful, you can access the data returned using
      the CreateDataConnectQueryResult.data() function. -->
    @if (query.data(); as data) {
      <!-- use your data to display something -->
            <div>Query successful!</div>
    }
  `,
})
export class MyComponent {
  // Since the execution of the query is eager, you don't have to call `execute` to "execute" the Query.
  // Call the Query injector function to get a `CreateDataConnectQueryResult` object which holds the state of your Query.
  query = injectGetCollection();

  // You can also pass in an options function (not object) of type `GetCollectionOptions` to the Query injector function.
  options: GetCollectionOptions = () => {
    return {
      staleTime: 5 * 1000
    };
  };
  query = injectGetCollection(this.options);
}
```

## ListMyCollections
You can execute the `ListMyCollections` Query using the following Query injector, which is defined in [dataconnect-generated/angular/index.d.ts](./index.d.ts):

```javascript
injectListMyCollections(options?: ListMyCollectionsOptions, injector?: Injector): CreateDataConnectQueryResult<ListMyCollectionsData, undefined>;
```

### Variables
The `ListMyCollections` Query has no variables.
### Return Type
Recall that calling the `ListMyCollections` Query injector returns a `CreateDataConnectQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `CreateDataConnectQueryResult.status()` function. You can also check for pending / success / error status using the `CreateDataConnectQueryResult.isPending()`, `CreateDataConnectQueryResult.isSuccess()`, and `CreateDataConnectQueryResult.isError()` functions.

To access the data returned by a Query, use the `CreateDataConnectQueryResult.data()` function. The data for the `ListMyCollections` Query is of type `ListMyCollectionsData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface ListMyCollectionsData {
  collections: ({
    name: string;
  })[];
}
```

To learn more about the `CreateDataConnectQueryResult` object, see the [TanStack Query Firebase documentation](https://docs.page/invertase/tanstack-query-firebase/angular/data-connect/functions/injectDataConnectQuery) and the [TanStack Angular Query documentation](https://tanstack.com/query/v5/docs/framework/angular/reference/functions/injectquery).

### Using `ListMyCollections`'s Query injector

```javascript
... // other imports
import { connectorConfig } from '@dataconnect/generated';
import { injectListMyCollections, ListMyCollectionsOptions } from '@dataconnect/generated/angular'
import { DataConnect } from '@angular/fire/data-connect';
import { initializeApp } from '@angular/fire/app';

@Component({
  ... // other component fields
  template: `
    <!-- You can render your component dynamically based on the status of the Query. -->
    @if (query.isPending()) {
      Loading...
    }
    @if (query.error()) {
      An error has occurred: {{ query.error() }}
    }
    <!-- If the Query is successful, you can access the data returned using
      the CreateDataConnectQueryResult.data() function. -->
    @if (query.data(); as data) {
      <!-- use your data to display something -->
            <div>Query successful!</div>
    }
  `,
})
export class MyComponent {
  // Since the execution of the query is eager, you don't have to call `execute` to "execute" the Query.
  // Call the Query injector function to get a `CreateDataConnectQueryResult` object which holds the state of your Query.
  query = injectListMyCollections();

  // You can also pass in an options function (not object) of type `ListMyCollectionsOptions` to the Query injector function.
  options: ListMyCollectionsOptions = () => {
    return {
      staleTime: 5 * 1000
    };
  };
  query = injectListMyCollections(this.options);
}
```

## ListCollectionGames
You can execute the `ListCollectionGames` Query using the following Query injector, which is defined in [dataconnect-generated/angular/index.d.ts](./index.d.ts):

```javascript
injectListCollectionGames(options?: ListCollectionGamesOptions, injector?: Injector): CreateDataConnectQueryResult<ListCollectionGamesData, undefined>;
```

### Variables
The `ListCollectionGames` Query has no variables.
### Return Type
Recall that calling the `ListCollectionGames` Query injector returns a `CreateDataConnectQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `CreateDataConnectQueryResult.status()` function. You can also check for pending / success / error status using the `CreateDataConnectQueryResult.isPending()`, `CreateDataConnectQueryResult.isSuccess()`, and `CreateDataConnectQueryResult.isError()` functions.

To access the data returned by a Query, use the `CreateDataConnectQueryResult.data()` function. The data for the `ListCollectionGames` Query is of type `ListCollectionGamesData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface ListCollectionGamesData {
  collectionGames: ({
    game: {
      title: string;
    };
  })[];
}
```

To learn more about the `CreateDataConnectQueryResult` object, see the [TanStack Query Firebase documentation](https://docs.page/invertase/tanstack-query-firebase/angular/data-connect/functions/injectDataConnectQuery) and the [TanStack Angular Query documentation](https://tanstack.com/query/v5/docs/framework/angular/reference/functions/injectquery).

### Using `ListCollectionGames`'s Query injector

```javascript
... // other imports
import { connectorConfig } from '@dataconnect/generated';
import { injectListCollectionGames, ListCollectionGamesOptions } from '@dataconnect/generated/angular'
import { DataConnect } from '@angular/fire/data-connect';
import { initializeApp } from '@angular/fire/app';

@Component({
  ... // other component fields
  template: `
    <!-- You can render your component dynamically based on the status of the Query. -->
    @if (query.isPending()) {
      Loading...
    }
    @if (query.error()) {
      An error has occurred: {{ query.error() }}
    }
    <!-- If the Query is successful, you can access the data returned using
      the CreateDataConnectQueryResult.data() function. -->
    @if (query.data(); as data) {
      <!-- use your data to display something -->
            <div>Query successful!</div>
    }
  `,
})
export class MyComponent {
  // Since the execution of the query is eager, you don't have to call `execute` to "execute" the Query.
  // Call the Query injector function to get a `CreateDataConnectQueryResult` object which holds the state of your Query.
  query = injectListCollectionGames();

  // You can also pass in an options function (not object) of type `ListCollectionGamesOptions` to the Query injector function.
  options: ListCollectionGamesOptions = () => {
    return {
      staleTime: 5 * 1000
    };
  };
  query = injectListCollectionGames(this.options);
}
```

# Mutations

The Angular generated SDK provides Mutations injectors that call [`injectDataConnectMutation`](https://react-query-firebase.invertase.dev/angular/data-connect/mutations) from TanStack Query Firebase.

Calling these injectors will return a `CreateDataConnectMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, and the most recent data returned by the Mutation, among other things. To learn more about these injectors and how to use them, see the [TanStack Query Firebase documentation](https://react-query-firebase.invertase.dev/angular/data-connect/mutations).

Mutation injectors do not execute their Mutations automatically when called. Rather, after calling the Mutation injector and getting a `CreateDataConnectMutationResult` object, you must call the `CreateDataConnectMutationResult.mutate()` function to execute the Mutation.

To learn more about TanStack Angular Query's Mutations, see the [TanStack Angular Query documentation](https://tanstack.com/query/v5/docs/framework/angular/guides/mutations).

## Using Mutation Injectors
Here's a general overview of how to use the generated Mutation injectors in your code:

- Mutation injectors are not called with the arguments to the Mutation. Instead, arguments are passed to `CreateDataConnectMutationResult.mutate()`.
- If the Mutation has no variables, the `mutate()` function does not require arguments.
- If the Mutation has any required variables, the `mutate()` function will require at least one argument: an object that contains all the required variables for the Mutation.
- If the Mutation has some required and some optional variables, only required variables are necessary in the variables argument object, and optional variables may be provided as well.
- If all of the Mutation's variables are optional, the Mutation injector does not require any arguments.
- The Angular generated SDK's Mutation injectors do not accept `DataConnect` instances as arguments.
- Mutation injector functions can be called with or without passing in an `options` argument, whose type is a function which returns an object. The type is generated alongside the operation's injector function in [dataconnect-generated/angular/index.d.ts](./index.d.ts). The type is generated alongside the operation's injector function. To learn more about the `options` argument, see the [TanStack Angular Query documentation](https://tanstack.com/query/v5/docs/framework/angular/guides/mutations#mutation-side-effects).
  - `CreateDataConnectMutationResult.mutate()` also accepts an `options` argument. It's type is not a function which returns an object, but the object itself.
  - ***Special case:*** If the Mutation has no arguments (or all optional arguments and you wish to provide none), and you want to pass `options` to `CreateDataConnectMutationResult.mutate()`, you must pass `undefined` where you would normally pass the Mutation's arguments, and then may provide the options argument.

Below are examples of how to use the `example` connector's generated Mutation injectors to execute each Mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#operations-react-angular).

## CreateUser
You can execute the `CreateUser` Mutation using the `CreateDataConnectMutationResult` object returned by the following Mutation injector (which is defined in [dataconnect-generated/angular/index.d.ts](./index.d.ts)):
```javascript
injectCreateUser(options?: CreateUserOptions, injector?: Injector): CreateDataConnectMutationResult<CreateUserData, undefined, >;
```

### Variables
The `CreateUser` Mutation has no variables.
### Return Type
Recall that calling the `CreateUser` Mutation injector returns a `CreateDataConnectMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `CreateDataConnectMutationResult.status()` function. You can also check for pending / success / error status using the `CreateDataConnectMutationResult.isPending()`, `CreateDataConnectMutationResult.isSuccess()`, and `CreateDataConnectMutationResult.isError()` functions.

To execute the Mutation, call `CreateDataConnectMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation. 

To access the data returned by a Mutation, use the `CreateDataConnectMutationResult.data()` function. The data for the `CreateUser` Mutation is of type `CreateUserData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface CreateUserData {
  user_insert: User_Key;
}
```

You can also call `CreateDataConnectMutationResult.mutateAsync()`, which executes the Mutation and returns a promise with the data returned from the Mutation. To learn more, see the [TanStack Angular Query documentation](https://tanstack.com/query/latest/docs/framework/angular/guides/mutations#promises).

To learn more about the `CreateDataConnectMutationResult` object, see the [TanStack Query Firebase documentation](https://docs.page/invertase/tanstack-query-firebase/angular/data-connect/functions/injectDataConnectMutation) and the [TanStack Angular Query documentation](https://tanstack.com/query/v5/docs/framework/angular/reference/functions/injectmutation).

### Using `CreateUser`'s Mutation injector

```javascript
... // other imports
import { connectorConfig } from '@dataconnect/generated';
import { injectCreateUser, CreateUserOptions } from '@dataconnect/generated/angular'
import { DataConnect } from '@angular/fire/data-connect';
import { initializeApp } from '@angular/fire/app';

@Component({
  ... // other component fields
  template: `
    <!-- You can render your component dynamically based on the status of the Mutation. -->
    @if (mutation.isPending()) {
      Loading...
    }
    @if (mutation.error()) {
      An error has occurred: {{ mutation.error() }}
    }
    <!-- If the Mutation is successful, you can access the data returned using
      the CreateDataConnectMutationResult.data() function. -->
    @if (mutation.data(); as data) {
      <!-- Use your data to display something -->
      <div>Mutation successful!</div>
    }
    <!-- Let's create a button that executes our mutation when clicked. -->
    <button
      (disabled)="mutation.isPending()"
      (click)="executeMutation()"
    >
      {{ mutation.isPending() ? 'Pending...' : 'Mutate!' }}
    </button>
  `,
})
export class MyComponent {
  // Call the Mutation injector function to get a `CreateDataConnectMutationResult` object which holds the state of your Mutation.
  mutation = injectCreateUser();

  // You can also pass in a `CreateUserOptions` function (not object) to the Mutation injector function.
  options: CreateUserOptions = () => {
    return {
      onSuccess: () => { console.log('Mutation succeeded!'); }
    };
  };
  mutation = injectCreateUser(this.options);

  // After calling the Mutation injector function, you must call `CreateDataConnectMutationResult.mutate()` to execute the Mutation.
  executeMutation() {
    this.mutation.mutate();

    // You can call `CreateDataConnectMutationResult.mutateAsync()` to execute the Mutation and return a promise with the data returned from the Mutation.
    this.mutation.mutateAsync();

    // You can also pass in a `CreateUserOptions` object (not function) to `CreateDataConnectMutationResult.mutate()`.
    // Since this Mutation accepts no variables, you must pass `undefined` where you would normally pass the variables.
    this.mutation.mutate(undefined, this.options());
  }
}
```

## UpdateUser
You can execute the `UpdateUser` Mutation using the `CreateDataConnectMutationResult` object returned by the following Mutation injector (which is defined in [dataconnect-generated/angular/index.d.ts](./index.d.ts)):
```javascript
injectUpdateUser(options?: UpdateUserOptions, injector?: Injector): CreateDataConnectMutationResult<UpdateUserData, undefined, >;
```

### Variables
The `UpdateUser` Mutation has no variables.
### Return Type
Recall that calling the `UpdateUser` Mutation injector returns a `CreateDataConnectMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `CreateDataConnectMutationResult.status()` function. You can also check for pending / success / error status using the `CreateDataConnectMutationResult.isPending()`, `CreateDataConnectMutationResult.isSuccess()`, and `CreateDataConnectMutationResult.isError()` functions.

To execute the Mutation, call `CreateDataConnectMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation. 

To access the data returned by a Mutation, use the `CreateDataConnectMutationResult.data()` function. The data for the `UpdateUser` Mutation is of type `UpdateUserData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface UpdateUserData {
  user_update?: User_Key | null;
}
```

You can also call `CreateDataConnectMutationResult.mutateAsync()`, which executes the Mutation and returns a promise with the data returned from the Mutation. To learn more, see the [TanStack Angular Query documentation](https://tanstack.com/query/latest/docs/framework/angular/guides/mutations#promises).

To learn more about the `CreateDataConnectMutationResult` object, see the [TanStack Query Firebase documentation](https://docs.page/invertase/tanstack-query-firebase/angular/data-connect/functions/injectDataConnectMutation) and the [TanStack Angular Query documentation](https://tanstack.com/query/v5/docs/framework/angular/reference/functions/injectmutation).

### Using `UpdateUser`'s Mutation injector

```javascript
... // other imports
import { connectorConfig } from '@dataconnect/generated';
import { injectUpdateUser, UpdateUserOptions } from '@dataconnect/generated/angular'
import { DataConnect } from '@angular/fire/data-connect';
import { initializeApp } from '@angular/fire/app';

@Component({
  ... // other component fields
  template: `
    <!-- You can render your component dynamically based on the status of the Mutation. -->
    @if (mutation.isPending()) {
      Loading...
    }
    @if (mutation.error()) {
      An error has occurred: {{ mutation.error() }}
    }
    <!-- If the Mutation is successful, you can access the data returned using
      the CreateDataConnectMutationResult.data() function. -->
    @if (mutation.data(); as data) {
      <!-- Use your data to display something -->
      <div>Mutation successful!</div>
    }
    <!-- Let's create a button that executes our mutation when clicked. -->
    <button
      (disabled)="mutation.isPending()"
      (click)="executeMutation()"
    >
      {{ mutation.isPending() ? 'Pending...' : 'Mutate!' }}
    </button>
  `,
})
export class MyComponent {
  // Call the Mutation injector function to get a `CreateDataConnectMutationResult` object which holds the state of your Mutation.
  mutation = injectUpdateUser();

  // You can also pass in a `UpdateUserOptions` function (not object) to the Mutation injector function.
  options: UpdateUserOptions = () => {
    return {
      onSuccess: () => { console.log('Mutation succeeded!'); }
    };
  };
  mutation = injectUpdateUser(this.options);

  // After calling the Mutation injector function, you must call `CreateDataConnectMutationResult.mutate()` to execute the Mutation.
  executeMutation() {
    this.mutation.mutate();

    // You can call `CreateDataConnectMutationResult.mutateAsync()` to execute the Mutation and return a promise with the data returned from the Mutation.
    this.mutation.mutateAsync();

    // You can also pass in a `UpdateUserOptions` object (not function) to `CreateDataConnectMutationResult.mutate()`.
    // Since this Mutation accepts no variables, you must pass `undefined` where you would normally pass the variables.
    this.mutation.mutate(undefined, this.options());
  }
}
```

## DeleteUser
You can execute the `DeleteUser` Mutation using the `CreateDataConnectMutationResult` object returned by the following Mutation injector (which is defined in [dataconnect-generated/angular/index.d.ts](./index.d.ts)):
```javascript
injectDeleteUser(options?: DeleteUserOptions, injector?: Injector): CreateDataConnectMutationResult<DeleteUserData, undefined, >;
```

### Variables
The `DeleteUser` Mutation has no variables.
### Return Type
Recall that calling the `DeleteUser` Mutation injector returns a `CreateDataConnectMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `CreateDataConnectMutationResult.status()` function. You can also check for pending / success / error status using the `CreateDataConnectMutationResult.isPending()`, `CreateDataConnectMutationResult.isSuccess()`, and `CreateDataConnectMutationResult.isError()` functions.

To execute the Mutation, call `CreateDataConnectMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation. 

To access the data returned by a Mutation, use the `CreateDataConnectMutationResult.data()` function. The data for the `DeleteUser` Mutation is of type `DeleteUserData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface DeleteUserData {
  user_delete?: User_Key | null;
}
```

You can also call `CreateDataConnectMutationResult.mutateAsync()`, which executes the Mutation and returns a promise with the data returned from the Mutation. To learn more, see the [TanStack Angular Query documentation](https://tanstack.com/query/latest/docs/framework/angular/guides/mutations#promises).

To learn more about the `CreateDataConnectMutationResult` object, see the [TanStack Query Firebase documentation](https://docs.page/invertase/tanstack-query-firebase/angular/data-connect/functions/injectDataConnectMutation) and the [TanStack Angular Query documentation](https://tanstack.com/query/v5/docs/framework/angular/reference/functions/injectmutation).

### Using `DeleteUser`'s Mutation injector

```javascript
... // other imports
import { connectorConfig } from '@dataconnect/generated';
import { injectDeleteUser, DeleteUserOptions } from '@dataconnect/generated/angular'
import { DataConnect } from '@angular/fire/data-connect';
import { initializeApp } from '@angular/fire/app';

@Component({
  ... // other component fields
  template: `
    <!-- You can render your component dynamically based on the status of the Mutation. -->
    @if (mutation.isPending()) {
      Loading...
    }
    @if (mutation.error()) {
      An error has occurred: {{ mutation.error() }}
    }
    <!-- If the Mutation is successful, you can access the data returned using
      the CreateDataConnectMutationResult.data() function. -->
    @if (mutation.data(); as data) {
      <!-- Use your data to display something -->
      <div>Mutation successful!</div>
    }
    <!-- Let's create a button that executes our mutation when clicked. -->
    <button
      (disabled)="mutation.isPending()"
      (click)="executeMutation()"
    >
      {{ mutation.isPending() ? 'Pending...' : 'Mutate!' }}
    </button>
  `,
})
export class MyComponent {
  // Call the Mutation injector function to get a `CreateDataConnectMutationResult` object which holds the state of your Mutation.
  mutation = injectDeleteUser();

  // You can also pass in a `DeleteUserOptions` function (not object) to the Mutation injector function.
  options: DeleteUserOptions = () => {
    return {
      onSuccess: () => { console.log('Mutation succeeded!'); }
    };
  };
  mutation = injectDeleteUser(this.options);

  // After calling the Mutation injector function, you must call `CreateDataConnectMutationResult.mutate()` to execute the Mutation.
  executeMutation() {
    this.mutation.mutate();

    // You can call `CreateDataConnectMutationResult.mutateAsync()` to execute the Mutation and return a promise with the data returned from the Mutation.
    this.mutation.mutateAsync();

    // You can also pass in a `DeleteUserOptions` object (not function) to `CreateDataConnectMutationResult.mutate()`.
    // Since this Mutation accepts no variables, you must pass `undefined` where you would normally pass the variables.
    this.mutation.mutate(undefined, this.options());
  }
}
```

## CreateGame
You can execute the `CreateGame` Mutation using the `CreateDataConnectMutationResult` object returned by the following Mutation injector (which is defined in [dataconnect-generated/angular/index.d.ts](./index.d.ts)):
```javascript
injectCreateGame(options?: CreateGameOptions, injector?: Injector): CreateDataConnectMutationResult<CreateGameData, undefined, >;
```

### Variables
The `CreateGame` Mutation has no variables.
### Return Type
Recall that calling the `CreateGame` Mutation injector returns a `CreateDataConnectMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `CreateDataConnectMutationResult.status()` function. You can also check for pending / success / error status using the `CreateDataConnectMutationResult.isPending()`, `CreateDataConnectMutationResult.isSuccess()`, and `CreateDataConnectMutationResult.isError()` functions.

To execute the Mutation, call `CreateDataConnectMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation. 

To access the data returned by a Mutation, use the `CreateDataConnectMutationResult.data()` function. The data for the `CreateGame` Mutation is of type `CreateGameData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface CreateGameData {
  game_insert: Game_Key;
}
```

You can also call `CreateDataConnectMutationResult.mutateAsync()`, which executes the Mutation and returns a promise with the data returned from the Mutation. To learn more, see the [TanStack Angular Query documentation](https://tanstack.com/query/latest/docs/framework/angular/guides/mutations#promises).

To learn more about the `CreateDataConnectMutationResult` object, see the [TanStack Query Firebase documentation](https://docs.page/invertase/tanstack-query-firebase/angular/data-connect/functions/injectDataConnectMutation) and the [TanStack Angular Query documentation](https://tanstack.com/query/v5/docs/framework/angular/reference/functions/injectmutation).

### Using `CreateGame`'s Mutation injector

```javascript
... // other imports
import { connectorConfig } from '@dataconnect/generated';
import { injectCreateGame, CreateGameOptions } from '@dataconnect/generated/angular'
import { DataConnect } from '@angular/fire/data-connect';
import { initializeApp } from '@angular/fire/app';

@Component({
  ... // other component fields
  template: `
    <!-- You can render your component dynamically based on the status of the Mutation. -->
    @if (mutation.isPending()) {
      Loading...
    }
    @if (mutation.error()) {
      An error has occurred: {{ mutation.error() }}
    }
    <!-- If the Mutation is successful, you can access the data returned using
      the CreateDataConnectMutationResult.data() function. -->
    @if (mutation.data(); as data) {
      <!-- Use your data to display something -->
      <div>Mutation successful!</div>
    }
    <!-- Let's create a button that executes our mutation when clicked. -->
    <button
      (disabled)="mutation.isPending()"
      (click)="executeMutation()"
    >
      {{ mutation.isPending() ? 'Pending...' : 'Mutate!' }}
    </button>
  `,
})
export class MyComponent {
  // Call the Mutation injector function to get a `CreateDataConnectMutationResult` object which holds the state of your Mutation.
  mutation = injectCreateGame();

  // You can also pass in a `CreateGameOptions` function (not object) to the Mutation injector function.
  options: CreateGameOptions = () => {
    return {
      onSuccess: () => { console.log('Mutation succeeded!'); }
    };
  };
  mutation = injectCreateGame(this.options);

  // After calling the Mutation injector function, you must call `CreateDataConnectMutationResult.mutate()` to execute the Mutation.
  executeMutation() {
    this.mutation.mutate();

    // You can call `CreateDataConnectMutationResult.mutateAsync()` to execute the Mutation and return a promise with the data returned from the Mutation.
    this.mutation.mutateAsync();

    // You can also pass in a `CreateGameOptions` object (not function) to `CreateDataConnectMutationResult.mutate()`.
    // Since this Mutation accepts no variables, you must pass `undefined` where you would normally pass the variables.
    this.mutation.mutate(undefined, this.options());
  }
}
```

## UpdateGame
You can execute the `UpdateGame` Mutation using the `CreateDataConnectMutationResult` object returned by the following Mutation injector (which is defined in [dataconnect-generated/angular/index.d.ts](./index.d.ts)):
```javascript
injectUpdateGame(options?: UpdateGameOptions, injector?: Injector): CreateDataConnectMutationResult<UpdateGameData, undefined, >;
```

### Variables
The `UpdateGame` Mutation has no variables.
### Return Type
Recall that calling the `UpdateGame` Mutation injector returns a `CreateDataConnectMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `CreateDataConnectMutationResult.status()` function. You can also check for pending / success / error status using the `CreateDataConnectMutationResult.isPending()`, `CreateDataConnectMutationResult.isSuccess()`, and `CreateDataConnectMutationResult.isError()` functions.

To execute the Mutation, call `CreateDataConnectMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation. 

To access the data returned by a Mutation, use the `CreateDataConnectMutationResult.data()` function. The data for the `UpdateGame` Mutation is of type `UpdateGameData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface UpdateGameData {
  game_update?: Game_Key | null;
}
```

You can also call `CreateDataConnectMutationResult.mutateAsync()`, which executes the Mutation and returns a promise with the data returned from the Mutation. To learn more, see the [TanStack Angular Query documentation](https://tanstack.com/query/latest/docs/framework/angular/guides/mutations#promises).

To learn more about the `CreateDataConnectMutationResult` object, see the [TanStack Query Firebase documentation](https://docs.page/invertase/tanstack-query-firebase/angular/data-connect/functions/injectDataConnectMutation) and the [TanStack Angular Query documentation](https://tanstack.com/query/v5/docs/framework/angular/reference/functions/injectmutation).

### Using `UpdateGame`'s Mutation injector

```javascript
... // other imports
import { connectorConfig } from '@dataconnect/generated';
import { injectUpdateGame, UpdateGameOptions } from '@dataconnect/generated/angular'
import { DataConnect } from '@angular/fire/data-connect';
import { initializeApp } from '@angular/fire/app';

@Component({
  ... // other component fields
  template: `
    <!-- You can render your component dynamically based on the status of the Mutation. -->
    @if (mutation.isPending()) {
      Loading...
    }
    @if (mutation.error()) {
      An error has occurred: {{ mutation.error() }}
    }
    <!-- If the Mutation is successful, you can access the data returned using
      the CreateDataConnectMutationResult.data() function. -->
    @if (mutation.data(); as data) {
      <!-- Use your data to display something -->
      <div>Mutation successful!</div>
    }
    <!-- Let's create a button that executes our mutation when clicked. -->
    <button
      (disabled)="mutation.isPending()"
      (click)="executeMutation()"
    >
      {{ mutation.isPending() ? 'Pending...' : 'Mutate!' }}
    </button>
  `,
})
export class MyComponent {
  // Call the Mutation injector function to get a `CreateDataConnectMutationResult` object which holds the state of your Mutation.
  mutation = injectUpdateGame();

  // You can also pass in a `UpdateGameOptions` function (not object) to the Mutation injector function.
  options: UpdateGameOptions = () => {
    return {
      onSuccess: () => { console.log('Mutation succeeded!'); }
    };
  };
  mutation = injectUpdateGame(this.options);

  // After calling the Mutation injector function, you must call `CreateDataConnectMutationResult.mutate()` to execute the Mutation.
  executeMutation() {
    this.mutation.mutate();

    // You can call `CreateDataConnectMutationResult.mutateAsync()` to execute the Mutation and return a promise with the data returned from the Mutation.
    this.mutation.mutateAsync();

    // You can also pass in a `UpdateGameOptions` object (not function) to `CreateDataConnectMutationResult.mutate()`.
    // Since this Mutation accepts no variables, you must pass `undefined` where you would normally pass the variables.
    this.mutation.mutate(undefined, this.options());
  }
}
```

## DeleteGame
You can execute the `DeleteGame` Mutation using the `CreateDataConnectMutationResult` object returned by the following Mutation injector (which is defined in [dataconnect-generated/angular/index.d.ts](./index.d.ts)):
```javascript
injectDeleteGame(options?: DeleteGameOptions, injector?: Injector): CreateDataConnectMutationResult<DeleteGameData, undefined, >;
```

### Variables
The `DeleteGame` Mutation has no variables.
### Return Type
Recall that calling the `DeleteGame` Mutation injector returns a `CreateDataConnectMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `CreateDataConnectMutationResult.status()` function. You can also check for pending / success / error status using the `CreateDataConnectMutationResult.isPending()`, `CreateDataConnectMutationResult.isSuccess()`, and `CreateDataConnectMutationResult.isError()` functions.

To execute the Mutation, call `CreateDataConnectMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation. 

To access the data returned by a Mutation, use the `CreateDataConnectMutationResult.data()` function. The data for the `DeleteGame` Mutation is of type `DeleteGameData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface DeleteGameData {
  game_delete?: Game_Key | null;
}
```

You can also call `CreateDataConnectMutationResult.mutateAsync()`, which executes the Mutation and returns a promise with the data returned from the Mutation. To learn more, see the [TanStack Angular Query documentation](https://tanstack.com/query/latest/docs/framework/angular/guides/mutations#promises).

To learn more about the `CreateDataConnectMutationResult` object, see the [TanStack Query Firebase documentation](https://docs.page/invertase/tanstack-query-firebase/angular/data-connect/functions/injectDataConnectMutation) and the [TanStack Angular Query documentation](https://tanstack.com/query/v5/docs/framework/angular/reference/functions/injectmutation).

### Using `DeleteGame`'s Mutation injector

```javascript
... // other imports
import { connectorConfig } from '@dataconnect/generated';
import { injectDeleteGame, DeleteGameOptions } from '@dataconnect/generated/angular'
import { DataConnect } from '@angular/fire/data-connect';
import { initializeApp } from '@angular/fire/app';

@Component({
  ... // other component fields
  template: `
    <!-- You can render your component dynamically based on the status of the Mutation. -->
    @if (mutation.isPending()) {
      Loading...
    }
    @if (mutation.error()) {
      An error has occurred: {{ mutation.error() }}
    }
    <!-- If the Mutation is successful, you can access the data returned using
      the CreateDataConnectMutationResult.data() function. -->
    @if (mutation.data(); as data) {
      <!-- Use your data to display something -->
      <div>Mutation successful!</div>
    }
    <!-- Let's create a button that executes our mutation when clicked. -->
    <button
      (disabled)="mutation.isPending()"
      (click)="executeMutation()"
    >
      {{ mutation.isPending() ? 'Pending...' : 'Mutate!' }}
    </button>
  `,
})
export class MyComponent {
  // Call the Mutation injector function to get a `CreateDataConnectMutationResult` object which holds the state of your Mutation.
  mutation = injectDeleteGame();

  // You can also pass in a `DeleteGameOptions` function (not object) to the Mutation injector function.
  options: DeleteGameOptions = () => {
    return {
      onSuccess: () => { console.log('Mutation succeeded!'); }
    };
  };
  mutation = injectDeleteGame(this.options);

  // After calling the Mutation injector function, you must call `CreateDataConnectMutationResult.mutate()` to execute the Mutation.
  executeMutation() {
    this.mutation.mutate();

    // You can call `CreateDataConnectMutationResult.mutateAsync()` to execute the Mutation and return a promise with the data returned from the Mutation.
    this.mutation.mutateAsync();

    // You can also pass in a `DeleteGameOptions` object (not function) to `CreateDataConnectMutationResult.mutate()`.
    // Since this Mutation accepts no variables, you must pass `undefined` where you would normally pass the variables.
    this.mutation.mutate(undefined, this.options());
  }
}
```

## CreateLibraryEntry
You can execute the `CreateLibraryEntry` Mutation using the `CreateDataConnectMutationResult` object returned by the following Mutation injector (which is defined in [dataconnect-generated/angular/index.d.ts](./index.d.ts)):
```javascript
injectCreateLibraryEntry(options?: CreateLibraryEntryOptions, injector?: Injector): CreateDataConnectMutationResult<CreateLibraryEntryData, undefined, >;
```

### Variables
The `CreateLibraryEntry` Mutation has no variables.
### Return Type
Recall that calling the `CreateLibraryEntry` Mutation injector returns a `CreateDataConnectMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `CreateDataConnectMutationResult.status()` function. You can also check for pending / success / error status using the `CreateDataConnectMutationResult.isPending()`, `CreateDataConnectMutationResult.isSuccess()`, and `CreateDataConnectMutationResult.isError()` functions.

To execute the Mutation, call `CreateDataConnectMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation. 

To access the data returned by a Mutation, use the `CreateDataConnectMutationResult.data()` function. The data for the `CreateLibraryEntry` Mutation is of type `CreateLibraryEntryData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface CreateLibraryEntryData {
  libraryEntry_insert: LibraryEntry_Key;
}
```

You can also call `CreateDataConnectMutationResult.mutateAsync()`, which executes the Mutation and returns a promise with the data returned from the Mutation. To learn more, see the [TanStack Angular Query documentation](https://tanstack.com/query/latest/docs/framework/angular/guides/mutations#promises).

To learn more about the `CreateDataConnectMutationResult` object, see the [TanStack Query Firebase documentation](https://docs.page/invertase/tanstack-query-firebase/angular/data-connect/functions/injectDataConnectMutation) and the [TanStack Angular Query documentation](https://tanstack.com/query/v5/docs/framework/angular/reference/functions/injectmutation).

### Using `CreateLibraryEntry`'s Mutation injector

```javascript
... // other imports
import { connectorConfig } from '@dataconnect/generated';
import { injectCreateLibraryEntry, CreateLibraryEntryOptions } from '@dataconnect/generated/angular'
import { DataConnect } from '@angular/fire/data-connect';
import { initializeApp } from '@angular/fire/app';

@Component({
  ... // other component fields
  template: `
    <!-- You can render your component dynamically based on the status of the Mutation. -->
    @if (mutation.isPending()) {
      Loading...
    }
    @if (mutation.error()) {
      An error has occurred: {{ mutation.error() }}
    }
    <!-- If the Mutation is successful, you can access the data returned using
      the CreateDataConnectMutationResult.data() function. -->
    @if (mutation.data(); as data) {
      <!-- Use your data to display something -->
      <div>Mutation successful!</div>
    }
    <!-- Let's create a button that executes our mutation when clicked. -->
    <button
      (disabled)="mutation.isPending()"
      (click)="executeMutation()"
    >
      {{ mutation.isPending() ? 'Pending...' : 'Mutate!' }}
    </button>
  `,
})
export class MyComponent {
  // Call the Mutation injector function to get a `CreateDataConnectMutationResult` object which holds the state of your Mutation.
  mutation = injectCreateLibraryEntry();

  // You can also pass in a `CreateLibraryEntryOptions` function (not object) to the Mutation injector function.
  options: CreateLibraryEntryOptions = () => {
    return {
      onSuccess: () => { console.log('Mutation succeeded!'); }
    };
  };
  mutation = injectCreateLibraryEntry(this.options);

  // After calling the Mutation injector function, you must call `CreateDataConnectMutationResult.mutate()` to execute the Mutation.
  executeMutation() {
    this.mutation.mutate();

    // You can call `CreateDataConnectMutationResult.mutateAsync()` to execute the Mutation and return a promise with the data returned from the Mutation.
    this.mutation.mutateAsync();

    // You can also pass in a `CreateLibraryEntryOptions` object (not function) to `CreateDataConnectMutationResult.mutate()`.
    // Since this Mutation accepts no variables, you must pass `undefined` where you would normally pass the variables.
    this.mutation.mutate(undefined, this.options());
  }
}
```

## UpdateLibraryEntry
You can execute the `UpdateLibraryEntry` Mutation using the `CreateDataConnectMutationResult` object returned by the following Mutation injector (which is defined in [dataconnect-generated/angular/index.d.ts](./index.d.ts)):
```javascript
injectUpdateLibraryEntry(options?: UpdateLibraryEntryOptions, injector?: Injector): CreateDataConnectMutationResult<UpdateLibraryEntryData, undefined, >;
```

### Variables
The `UpdateLibraryEntry` Mutation has no variables.
### Return Type
Recall that calling the `UpdateLibraryEntry` Mutation injector returns a `CreateDataConnectMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `CreateDataConnectMutationResult.status()` function. You can also check for pending / success / error status using the `CreateDataConnectMutationResult.isPending()`, `CreateDataConnectMutationResult.isSuccess()`, and `CreateDataConnectMutationResult.isError()` functions.

To execute the Mutation, call `CreateDataConnectMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation. 

To access the data returned by a Mutation, use the `CreateDataConnectMutationResult.data()` function. The data for the `UpdateLibraryEntry` Mutation is of type `UpdateLibraryEntryData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface UpdateLibraryEntryData {
  libraryEntry_update?: LibraryEntry_Key | null;
}
```

You can also call `CreateDataConnectMutationResult.mutateAsync()`, which executes the Mutation and returns a promise with the data returned from the Mutation. To learn more, see the [TanStack Angular Query documentation](https://tanstack.com/query/latest/docs/framework/angular/guides/mutations#promises).

To learn more about the `CreateDataConnectMutationResult` object, see the [TanStack Query Firebase documentation](https://docs.page/invertase/tanstack-query-firebase/angular/data-connect/functions/injectDataConnectMutation) and the [TanStack Angular Query documentation](https://tanstack.com/query/v5/docs/framework/angular/reference/functions/injectmutation).

### Using `UpdateLibraryEntry`'s Mutation injector

```javascript
... // other imports
import { connectorConfig } from '@dataconnect/generated';
import { injectUpdateLibraryEntry, UpdateLibraryEntryOptions } from '@dataconnect/generated/angular'
import { DataConnect } from '@angular/fire/data-connect';
import { initializeApp } from '@angular/fire/app';

@Component({
  ... // other component fields
  template: `
    <!-- You can render your component dynamically based on the status of the Mutation. -->
    @if (mutation.isPending()) {
      Loading...
    }
    @if (mutation.error()) {
      An error has occurred: {{ mutation.error() }}
    }
    <!-- If the Mutation is successful, you can access the data returned using
      the CreateDataConnectMutationResult.data() function. -->
    @if (mutation.data(); as data) {
      <!-- Use your data to display something -->
      <div>Mutation successful!</div>
    }
    <!-- Let's create a button that executes our mutation when clicked. -->
    <button
      (disabled)="mutation.isPending()"
      (click)="executeMutation()"
    >
      {{ mutation.isPending() ? 'Pending...' : 'Mutate!' }}
    </button>
  `,
})
export class MyComponent {
  // Call the Mutation injector function to get a `CreateDataConnectMutationResult` object which holds the state of your Mutation.
  mutation = injectUpdateLibraryEntry();

  // You can also pass in a `UpdateLibraryEntryOptions` function (not object) to the Mutation injector function.
  options: UpdateLibraryEntryOptions = () => {
    return {
      onSuccess: () => { console.log('Mutation succeeded!'); }
    };
  };
  mutation = injectUpdateLibraryEntry(this.options);

  // After calling the Mutation injector function, you must call `CreateDataConnectMutationResult.mutate()` to execute the Mutation.
  executeMutation() {
    this.mutation.mutate();

    // You can call `CreateDataConnectMutationResult.mutateAsync()` to execute the Mutation and return a promise with the data returned from the Mutation.
    this.mutation.mutateAsync();

    // You can also pass in a `UpdateLibraryEntryOptions` object (not function) to `CreateDataConnectMutationResult.mutate()`.
    // Since this Mutation accepts no variables, you must pass `undefined` where you would normally pass the variables.
    this.mutation.mutate(undefined, this.options());
  }
}
```

## DeleteLibraryEntry
You can execute the `DeleteLibraryEntry` Mutation using the `CreateDataConnectMutationResult` object returned by the following Mutation injector (which is defined in [dataconnect-generated/angular/index.d.ts](./index.d.ts)):
```javascript
injectDeleteLibraryEntry(options?: DeleteLibraryEntryOptions, injector?: Injector): CreateDataConnectMutationResult<DeleteLibraryEntryData, undefined, >;
```

### Variables
The `DeleteLibraryEntry` Mutation has no variables.
### Return Type
Recall that calling the `DeleteLibraryEntry` Mutation injector returns a `CreateDataConnectMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `CreateDataConnectMutationResult.status()` function. You can also check for pending / success / error status using the `CreateDataConnectMutationResult.isPending()`, `CreateDataConnectMutationResult.isSuccess()`, and `CreateDataConnectMutationResult.isError()` functions.

To execute the Mutation, call `CreateDataConnectMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation. 

To access the data returned by a Mutation, use the `CreateDataConnectMutationResult.data()` function. The data for the `DeleteLibraryEntry` Mutation is of type `DeleteLibraryEntryData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface DeleteLibraryEntryData {
  libraryEntry_delete?: LibraryEntry_Key | null;
}
```

You can also call `CreateDataConnectMutationResult.mutateAsync()`, which executes the Mutation and returns a promise with the data returned from the Mutation. To learn more, see the [TanStack Angular Query documentation](https://tanstack.com/query/latest/docs/framework/angular/guides/mutations#promises).

To learn more about the `CreateDataConnectMutationResult` object, see the [TanStack Query Firebase documentation](https://docs.page/invertase/tanstack-query-firebase/angular/data-connect/functions/injectDataConnectMutation) and the [TanStack Angular Query documentation](https://tanstack.com/query/v5/docs/framework/angular/reference/functions/injectmutation).

### Using `DeleteLibraryEntry`'s Mutation injector

```javascript
... // other imports
import { connectorConfig } from '@dataconnect/generated';
import { injectDeleteLibraryEntry, DeleteLibraryEntryOptions } from '@dataconnect/generated/angular'
import { DataConnect } from '@angular/fire/data-connect';
import { initializeApp } from '@angular/fire/app';

@Component({
  ... // other component fields
  template: `
    <!-- You can render your component dynamically based on the status of the Mutation. -->
    @if (mutation.isPending()) {
      Loading...
    }
    @if (mutation.error()) {
      An error has occurred: {{ mutation.error() }}
    }
    <!-- If the Mutation is successful, you can access the data returned using
      the CreateDataConnectMutationResult.data() function. -->
    @if (mutation.data(); as data) {
      <!-- Use your data to display something -->
      <div>Mutation successful!</div>
    }
    <!-- Let's create a button that executes our mutation when clicked. -->
    <button
      (disabled)="mutation.isPending()"
      (click)="executeMutation()"
    >
      {{ mutation.isPending() ? 'Pending...' : 'Mutate!' }}
    </button>
  `,
})
export class MyComponent {
  // Call the Mutation injector function to get a `CreateDataConnectMutationResult` object which holds the state of your Mutation.
  mutation = injectDeleteLibraryEntry();

  // You can also pass in a `DeleteLibraryEntryOptions` function (not object) to the Mutation injector function.
  options: DeleteLibraryEntryOptions = () => {
    return {
      onSuccess: () => { console.log('Mutation succeeded!'); }
    };
  };
  mutation = injectDeleteLibraryEntry(this.options);

  // After calling the Mutation injector function, you must call `CreateDataConnectMutationResult.mutate()` to execute the Mutation.
  executeMutation() {
    this.mutation.mutate();

    // You can call `CreateDataConnectMutationResult.mutateAsync()` to execute the Mutation and return a promise with the data returned from the Mutation.
    this.mutation.mutateAsync();

    // You can also pass in a `DeleteLibraryEntryOptions` object (not function) to `CreateDataConnectMutationResult.mutate()`.
    // Since this Mutation accepts no variables, you must pass `undefined` where you would normally pass the variables.
    this.mutation.mutate(undefined, this.options());
  }
}
```

## CreateCollection
You can execute the `CreateCollection` Mutation using the `CreateDataConnectMutationResult` object returned by the following Mutation injector (which is defined in [dataconnect-generated/angular/index.d.ts](./index.d.ts)):
```javascript
injectCreateCollection(options?: CreateCollectionOptions, injector?: Injector): CreateDataConnectMutationResult<CreateCollectionData, undefined, >;
```

### Variables
The `CreateCollection` Mutation has no variables.
### Return Type
Recall that calling the `CreateCollection` Mutation injector returns a `CreateDataConnectMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `CreateDataConnectMutationResult.status()` function. You can also check for pending / success / error status using the `CreateDataConnectMutationResult.isPending()`, `CreateDataConnectMutationResult.isSuccess()`, and `CreateDataConnectMutationResult.isError()` functions.

To execute the Mutation, call `CreateDataConnectMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation. 

To access the data returned by a Mutation, use the `CreateDataConnectMutationResult.data()` function. The data for the `CreateCollection` Mutation is of type `CreateCollectionData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface CreateCollectionData {
  collection_insert: Collection_Key;
}
```

You can also call `CreateDataConnectMutationResult.mutateAsync()`, which executes the Mutation and returns a promise with the data returned from the Mutation. To learn more, see the [TanStack Angular Query documentation](https://tanstack.com/query/latest/docs/framework/angular/guides/mutations#promises).

To learn more about the `CreateDataConnectMutationResult` object, see the [TanStack Query Firebase documentation](https://docs.page/invertase/tanstack-query-firebase/angular/data-connect/functions/injectDataConnectMutation) and the [TanStack Angular Query documentation](https://tanstack.com/query/v5/docs/framework/angular/reference/functions/injectmutation).

### Using `CreateCollection`'s Mutation injector

```javascript
... // other imports
import { connectorConfig } from '@dataconnect/generated';
import { injectCreateCollection, CreateCollectionOptions } from '@dataconnect/generated/angular'
import { DataConnect } from '@angular/fire/data-connect';
import { initializeApp } from '@angular/fire/app';

@Component({
  ... // other component fields
  template: `
    <!-- You can render your component dynamically based on the status of the Mutation. -->
    @if (mutation.isPending()) {
      Loading...
    }
    @if (mutation.error()) {
      An error has occurred: {{ mutation.error() }}
    }
    <!-- If the Mutation is successful, you can access the data returned using
      the CreateDataConnectMutationResult.data() function. -->
    @if (mutation.data(); as data) {
      <!-- Use your data to display something -->
      <div>Mutation successful!</div>
    }
    <!-- Let's create a button that executes our mutation when clicked. -->
    <button
      (disabled)="mutation.isPending()"
      (click)="executeMutation()"
    >
      {{ mutation.isPending() ? 'Pending...' : 'Mutate!' }}
    </button>
  `,
})
export class MyComponent {
  // Call the Mutation injector function to get a `CreateDataConnectMutationResult` object which holds the state of your Mutation.
  mutation = injectCreateCollection();

  // You can also pass in a `CreateCollectionOptions` function (not object) to the Mutation injector function.
  options: CreateCollectionOptions = () => {
    return {
      onSuccess: () => { console.log('Mutation succeeded!'); }
    };
  };
  mutation = injectCreateCollection(this.options);

  // After calling the Mutation injector function, you must call `CreateDataConnectMutationResult.mutate()` to execute the Mutation.
  executeMutation() {
    this.mutation.mutate();

    // You can call `CreateDataConnectMutationResult.mutateAsync()` to execute the Mutation and return a promise with the data returned from the Mutation.
    this.mutation.mutateAsync();

    // You can also pass in a `CreateCollectionOptions` object (not function) to `CreateDataConnectMutationResult.mutate()`.
    // Since this Mutation accepts no variables, you must pass `undefined` where you would normally pass the variables.
    this.mutation.mutate(undefined, this.options());
  }
}
```

## UpdateCollection
You can execute the `UpdateCollection` Mutation using the `CreateDataConnectMutationResult` object returned by the following Mutation injector (which is defined in [dataconnect-generated/angular/index.d.ts](./index.d.ts)):
```javascript
injectUpdateCollection(options?: UpdateCollectionOptions, injector?: Injector): CreateDataConnectMutationResult<UpdateCollectionData, undefined, >;
```

### Variables
The `UpdateCollection` Mutation has no variables.
### Return Type
Recall that calling the `UpdateCollection` Mutation injector returns a `CreateDataConnectMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `CreateDataConnectMutationResult.status()` function. You can also check for pending / success / error status using the `CreateDataConnectMutationResult.isPending()`, `CreateDataConnectMutationResult.isSuccess()`, and `CreateDataConnectMutationResult.isError()` functions.

To execute the Mutation, call `CreateDataConnectMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation. 

To access the data returned by a Mutation, use the `CreateDataConnectMutationResult.data()` function. The data for the `UpdateCollection` Mutation is of type `UpdateCollectionData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface UpdateCollectionData {
  collection_update?: Collection_Key | null;
}
```

You can also call `CreateDataConnectMutationResult.mutateAsync()`, which executes the Mutation and returns a promise with the data returned from the Mutation. To learn more, see the [TanStack Angular Query documentation](https://tanstack.com/query/latest/docs/framework/angular/guides/mutations#promises).

To learn more about the `CreateDataConnectMutationResult` object, see the [TanStack Query Firebase documentation](https://docs.page/invertase/tanstack-query-firebase/angular/data-connect/functions/injectDataConnectMutation) and the [TanStack Angular Query documentation](https://tanstack.com/query/v5/docs/framework/angular/reference/functions/injectmutation).

### Using `UpdateCollection`'s Mutation injector

```javascript
... // other imports
import { connectorConfig } from '@dataconnect/generated';
import { injectUpdateCollection, UpdateCollectionOptions } from '@dataconnect/generated/angular'
import { DataConnect } from '@angular/fire/data-connect';
import { initializeApp } from '@angular/fire/app';

@Component({
  ... // other component fields
  template: `
    <!-- You can render your component dynamically based on the status of the Mutation. -->
    @if (mutation.isPending()) {
      Loading...
    }
    @if (mutation.error()) {
      An error has occurred: {{ mutation.error() }}
    }
    <!-- If the Mutation is successful, you can access the data returned using
      the CreateDataConnectMutationResult.data() function. -->
    @if (mutation.data(); as data) {
      <!-- Use your data to display something -->
      <div>Mutation successful!</div>
    }
    <!-- Let's create a button that executes our mutation when clicked. -->
    <button
      (disabled)="mutation.isPending()"
      (click)="executeMutation()"
    >
      {{ mutation.isPending() ? 'Pending...' : 'Mutate!' }}
    </button>
  `,
})
export class MyComponent {
  // Call the Mutation injector function to get a `CreateDataConnectMutationResult` object which holds the state of your Mutation.
  mutation = injectUpdateCollection();

  // You can also pass in a `UpdateCollectionOptions` function (not object) to the Mutation injector function.
  options: UpdateCollectionOptions = () => {
    return {
      onSuccess: () => { console.log('Mutation succeeded!'); }
    };
  };
  mutation = injectUpdateCollection(this.options);

  // After calling the Mutation injector function, you must call `CreateDataConnectMutationResult.mutate()` to execute the Mutation.
  executeMutation() {
    this.mutation.mutate();

    // You can call `CreateDataConnectMutationResult.mutateAsync()` to execute the Mutation and return a promise with the data returned from the Mutation.
    this.mutation.mutateAsync();

    // You can also pass in a `UpdateCollectionOptions` object (not function) to `CreateDataConnectMutationResult.mutate()`.
    // Since this Mutation accepts no variables, you must pass `undefined` where you would normally pass the variables.
    this.mutation.mutate(undefined, this.options());
  }
}
```

## DeleteCollection
You can execute the `DeleteCollection` Mutation using the `CreateDataConnectMutationResult` object returned by the following Mutation injector (which is defined in [dataconnect-generated/angular/index.d.ts](./index.d.ts)):
```javascript
injectDeleteCollection(options?: DeleteCollectionOptions, injector?: Injector): CreateDataConnectMutationResult<DeleteCollectionData, undefined, >;
```

### Variables
The `DeleteCollection` Mutation has no variables.
### Return Type
Recall that calling the `DeleteCollection` Mutation injector returns a `CreateDataConnectMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `CreateDataConnectMutationResult.status()` function. You can also check for pending / success / error status using the `CreateDataConnectMutationResult.isPending()`, `CreateDataConnectMutationResult.isSuccess()`, and `CreateDataConnectMutationResult.isError()` functions.

To execute the Mutation, call `CreateDataConnectMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation. 

To access the data returned by a Mutation, use the `CreateDataConnectMutationResult.data()` function. The data for the `DeleteCollection` Mutation is of type `DeleteCollectionData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface DeleteCollectionData {
  collection_delete?: Collection_Key | null;
}
```

You can also call `CreateDataConnectMutationResult.mutateAsync()`, which executes the Mutation and returns a promise with the data returned from the Mutation. To learn more, see the [TanStack Angular Query documentation](https://tanstack.com/query/latest/docs/framework/angular/guides/mutations#promises).

To learn more about the `CreateDataConnectMutationResult` object, see the [TanStack Query Firebase documentation](https://docs.page/invertase/tanstack-query-firebase/angular/data-connect/functions/injectDataConnectMutation) and the [TanStack Angular Query documentation](https://tanstack.com/query/v5/docs/framework/angular/reference/functions/injectmutation).

### Using `DeleteCollection`'s Mutation injector

```javascript
... // other imports
import { connectorConfig } from '@dataconnect/generated';
import { injectDeleteCollection, DeleteCollectionOptions } from '@dataconnect/generated/angular'
import { DataConnect } from '@angular/fire/data-connect';
import { initializeApp } from '@angular/fire/app';

@Component({
  ... // other component fields
  template: `
    <!-- You can render your component dynamically based on the status of the Mutation. -->
    @if (mutation.isPending()) {
      Loading...
    }
    @if (mutation.error()) {
      An error has occurred: {{ mutation.error() }}
    }
    <!-- If the Mutation is successful, you can access the data returned using
      the CreateDataConnectMutationResult.data() function. -->
    @if (mutation.data(); as data) {
      <!-- Use your data to display something -->
      <div>Mutation successful!</div>
    }
    <!-- Let's create a button that executes our mutation when clicked. -->
    <button
      (disabled)="mutation.isPending()"
      (click)="executeMutation()"
    >
      {{ mutation.isPending() ? 'Pending...' : 'Mutate!' }}
    </button>
  `,
})
export class MyComponent {
  // Call the Mutation injector function to get a `CreateDataConnectMutationResult` object which holds the state of your Mutation.
  mutation = injectDeleteCollection();

  // You can also pass in a `DeleteCollectionOptions` function (not object) to the Mutation injector function.
  options: DeleteCollectionOptions = () => {
    return {
      onSuccess: () => { console.log('Mutation succeeded!'); }
    };
  };
  mutation = injectDeleteCollection(this.options);

  // After calling the Mutation injector function, you must call `CreateDataConnectMutationResult.mutate()` to execute the Mutation.
  executeMutation() {
    this.mutation.mutate();

    // You can call `CreateDataConnectMutationResult.mutateAsync()` to execute the Mutation and return a promise with the data returned from the Mutation.
    this.mutation.mutateAsync();

    // You can also pass in a `DeleteCollectionOptions` object (not function) to `CreateDataConnectMutationResult.mutate()`.
    // Since this Mutation accepts no variables, you must pass `undefined` where you would normally pass the variables.
    this.mutation.mutate(undefined, this.options());
  }
}
```

## CreateCollectionGame
You can execute the `CreateCollectionGame` Mutation using the `CreateDataConnectMutationResult` object returned by the following Mutation injector (which is defined in [dataconnect-generated/angular/index.d.ts](./index.d.ts)):
```javascript
injectCreateCollectionGame(options?: CreateCollectionGameOptions, injector?: Injector): CreateDataConnectMutationResult<CreateCollectionGameData, undefined, >;
```

### Variables
The `CreateCollectionGame` Mutation has no variables.
### Return Type
Recall that calling the `CreateCollectionGame` Mutation injector returns a `CreateDataConnectMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `CreateDataConnectMutationResult.status()` function. You can also check for pending / success / error status using the `CreateDataConnectMutationResult.isPending()`, `CreateDataConnectMutationResult.isSuccess()`, and `CreateDataConnectMutationResult.isError()` functions.

To execute the Mutation, call `CreateDataConnectMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation. 

To access the data returned by a Mutation, use the `CreateDataConnectMutationResult.data()` function. The data for the `CreateCollectionGame` Mutation is of type `CreateCollectionGameData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface CreateCollectionGameData {
  collectionGame_insert: CollectionGame_Key;
}
```

You can also call `CreateDataConnectMutationResult.mutateAsync()`, which executes the Mutation and returns a promise with the data returned from the Mutation. To learn more, see the [TanStack Angular Query documentation](https://tanstack.com/query/latest/docs/framework/angular/guides/mutations#promises).

To learn more about the `CreateDataConnectMutationResult` object, see the [TanStack Query Firebase documentation](https://docs.page/invertase/tanstack-query-firebase/angular/data-connect/functions/injectDataConnectMutation) and the [TanStack Angular Query documentation](https://tanstack.com/query/v5/docs/framework/angular/reference/functions/injectmutation).

### Using `CreateCollectionGame`'s Mutation injector

```javascript
... // other imports
import { connectorConfig } from '@dataconnect/generated';
import { injectCreateCollectionGame, CreateCollectionGameOptions } from '@dataconnect/generated/angular'
import { DataConnect } from '@angular/fire/data-connect';
import { initializeApp } from '@angular/fire/app';

@Component({
  ... // other component fields
  template: `
    <!-- You can render your component dynamically based on the status of the Mutation. -->
    @if (mutation.isPending()) {
      Loading...
    }
    @if (mutation.error()) {
      An error has occurred: {{ mutation.error() }}
    }
    <!-- If the Mutation is successful, you can access the data returned using
      the CreateDataConnectMutationResult.data() function. -->
    @if (mutation.data(); as data) {
      <!-- Use your data to display something -->
      <div>Mutation successful!</div>
    }
    <!-- Let's create a button that executes our mutation when clicked. -->
    <button
      (disabled)="mutation.isPending()"
      (click)="executeMutation()"
    >
      {{ mutation.isPending() ? 'Pending...' : 'Mutate!' }}
    </button>
  `,
})
export class MyComponent {
  // Call the Mutation injector function to get a `CreateDataConnectMutationResult` object which holds the state of your Mutation.
  mutation = injectCreateCollectionGame();

  // You can also pass in a `CreateCollectionGameOptions` function (not object) to the Mutation injector function.
  options: CreateCollectionGameOptions = () => {
    return {
      onSuccess: () => { console.log('Mutation succeeded!'); }
    };
  };
  mutation = injectCreateCollectionGame(this.options);

  // After calling the Mutation injector function, you must call `CreateDataConnectMutationResult.mutate()` to execute the Mutation.
  executeMutation() {
    this.mutation.mutate();

    // You can call `CreateDataConnectMutationResult.mutateAsync()` to execute the Mutation and return a promise with the data returned from the Mutation.
    this.mutation.mutateAsync();

    // You can also pass in a `CreateCollectionGameOptions` object (not function) to `CreateDataConnectMutationResult.mutate()`.
    // Since this Mutation accepts no variables, you must pass `undefined` where you would normally pass the variables.
    this.mutation.mutate(undefined, this.options());
  }
}
```

## DeleteCollectionGame
You can execute the `DeleteCollectionGame` Mutation using the `CreateDataConnectMutationResult` object returned by the following Mutation injector (which is defined in [dataconnect-generated/angular/index.d.ts](./index.d.ts)):
```javascript
injectDeleteCollectionGame(options?: DeleteCollectionGameOptions, injector?: Injector): CreateDataConnectMutationResult<DeleteCollectionGameData, undefined, >;
```

### Variables
The `DeleteCollectionGame` Mutation has no variables.
### Return Type
Recall that calling the `DeleteCollectionGame` Mutation injector returns a `CreateDataConnectMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `CreateDataConnectMutationResult.status()` function. You can also check for pending / success / error status using the `CreateDataConnectMutationResult.isPending()`, `CreateDataConnectMutationResult.isSuccess()`, and `CreateDataConnectMutationResult.isError()` functions.

To execute the Mutation, call `CreateDataConnectMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation. 

To access the data returned by a Mutation, use the `CreateDataConnectMutationResult.data()` function. The data for the `DeleteCollectionGame` Mutation is of type `DeleteCollectionGameData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface DeleteCollectionGameData {
  collectionGame_delete?: CollectionGame_Key | null;
}
```

You can also call `CreateDataConnectMutationResult.mutateAsync()`, which executes the Mutation and returns a promise with the data returned from the Mutation. To learn more, see the [TanStack Angular Query documentation](https://tanstack.com/query/latest/docs/framework/angular/guides/mutations#promises).

To learn more about the `CreateDataConnectMutationResult` object, see the [TanStack Query Firebase documentation](https://docs.page/invertase/tanstack-query-firebase/angular/data-connect/functions/injectDataConnectMutation) and the [TanStack Angular Query documentation](https://tanstack.com/query/v5/docs/framework/angular/reference/functions/injectmutation).

### Using `DeleteCollectionGame`'s Mutation injector

```javascript
... // other imports
import { connectorConfig } from '@dataconnect/generated';
import { injectDeleteCollectionGame, DeleteCollectionGameOptions } from '@dataconnect/generated/angular'
import { DataConnect } from '@angular/fire/data-connect';
import { initializeApp } from '@angular/fire/app';

@Component({
  ... // other component fields
  template: `
    <!-- You can render your component dynamically based on the status of the Mutation. -->
    @if (mutation.isPending()) {
      Loading...
    }
    @if (mutation.error()) {
      An error has occurred: {{ mutation.error() }}
    }
    <!-- If the Mutation is successful, you can access the data returned using
      the CreateDataConnectMutationResult.data() function. -->
    @if (mutation.data(); as data) {
      <!-- Use your data to display something -->
      <div>Mutation successful!</div>
    }
    <!-- Let's create a button that executes our mutation when clicked. -->
    <button
      (disabled)="mutation.isPending()"
      (click)="executeMutation()"
    >
      {{ mutation.isPending() ? 'Pending...' : 'Mutate!' }}
    </button>
  `,
})
export class MyComponent {
  // Call the Mutation injector function to get a `CreateDataConnectMutationResult` object which holds the state of your Mutation.
  mutation = injectDeleteCollectionGame();

  // You can also pass in a `DeleteCollectionGameOptions` function (not object) to the Mutation injector function.
  options: DeleteCollectionGameOptions = () => {
    return {
      onSuccess: () => { console.log('Mutation succeeded!'); }
    };
  };
  mutation = injectDeleteCollectionGame(this.options);

  // After calling the Mutation injector function, you must call `CreateDataConnectMutationResult.mutate()` to execute the Mutation.
  executeMutation() {
    this.mutation.mutate();

    // You can call `CreateDataConnectMutationResult.mutateAsync()` to execute the Mutation and return a promise with the data returned from the Mutation.
    this.mutation.mutateAsync();

    // You can also pass in a `DeleteCollectionGameOptions` object (not function) to `CreateDataConnectMutationResult.mutate()`.
    // Since this Mutation accepts no variables, you must pass `undefined` where you would normally pass the variables.
    this.mutation.mutate(undefined, this.options());
  }
}
```

