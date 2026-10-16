# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.


### Angular

The generated SDK creates injectable wrapper functions.

Here's an example:
```
import { injectCreateUser, injectUpdateUser, injectDeleteUser, injectGetCurrentUser, injectListUsers, injectCreateGame, injectUpdateGame, injectDeleteGame, injectGetGame, injectListGames } from '@dataconnect/generated/angular';

@Component({
  selector: 'my-component',
  ...
})
class MyComponent {
  // The types of these injectors are available in angular/index.d.ts
  private readonly CreateUserOperation = injectCreateUser();
  private readonly UpdateUserOperation = injectUpdateUser();
  private readonly DeleteUserOperation = injectDeleteUser();
  private readonly GetCurrentUserOperation = injectGetCurrentUser();
  private readonly ListUsersOperation = injectListUsers();
  private readonly CreateGameOperation = injectCreateGame();
  private readonly UpdateGameOperation = injectUpdateGame();
  private readonly DeleteGameOperation = injectDeleteGame();
  private readonly GetGameOperation = injectGetGame();
  private readonly ListGamesOperation = injectListGames();
  }
```

Each operation is a wrapper function around Tanstack Query Angular.

Here's an example:
```ts
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'simple-example',
  template: `
    @if (movies.isPending()) {
      Loading...
    }
    @if (movies.error()) {
      An error has occurred: {{ movies.error().message }}
    }
    @if (movies.data(); as data) {
      @for (movie of data.movies ; track
        movie.id) {
      <h1>{{ movie.title }}</h1>
      <p>{{ movie.synopsis }}</p>
      }
    }
  `
})
export class SimpleExampleComponent {
  http = inject(HttpClient)

  movies = injectListMovies();
}
```




## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createUser, updateUser, deleteUser, getCurrentUser, listUsers, createGame, updateGame, deleteGame, getGame, listGames } from '@dataconnect/generated';


// Operation CreateUser: 
const { data } = await CreateUser(dataConnect);

// Operation UpdateUser: 
const { data } = await UpdateUser(dataConnect);

// Operation DeleteUser: 
const { data } = await DeleteUser(dataConnect);

// Operation GetCurrentUser: 
const { data } = await GetCurrentUser(dataConnect);

// Operation ListUsers: 
const { data } = await ListUsers(dataConnect);

// Operation CreateGame: 
const { data } = await CreateGame(dataConnect);

// Operation UpdateGame: 
const { data } = await UpdateGame(dataConnect);

// Operation DeleteGame: 
const { data } = await DeleteGame(dataConnect);

// Operation GetGame: 
const { data } = await GetGame(dataConnect);

// Operation ListGames: 
const { data } = await ListGames(dataConnect);


```