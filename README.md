# event-dispatching

## Overview

`event-dispatching` is a lightweight event management system built on top of [InversifyJS](https://github.com/inversify/InversifyJS). It allows you to register subscribers and dispatch events across your application using dependency injection.

> ✨ This package is a modernized and extended version of [`pleerock/event-dispatch`](https://github.com/pleerock/event-dispatch), refactored for personal use and better extensibility.

---

## Installation

```bash
npm install event-dispatching --save
```

If you're targeting older environments, you may want to add [es6-shim](https://github.com/paulmillr/es6-shim):

```bash
npm install es6-shim --save
```

In Node.js:
```ts
require("es6-shim");
```

In a browser:
```html
<script src="path-to-shim/es6-shim.js"></script>
```

---

## Usage

### 1. Initialize with InversifyJS

```ts
import "es6-shim"; // optional
import { Container } from "inversify";
import eventDispatching, { TYPES, EventDispatcher } from "event-dispatching";

const container = new Container();

// Bootstrap the event-dispatching system
eventDispatching({ container });

// Retrieve the dispatcher
const dispatcher = container.get<EventDispatcher>(TYPES.EventDispatcher);
```

---

### 2. Create a Subscriber with Decorators

```ts
import { injectable, inject } from "inversify";
import { EventSubscriber, On } from "event-dispatching";
import { User } from "./models/User";
import { TYPES as MY_TYPES } from "./resources/types";

@EventSubscriber()
@injectable()
export class UserEventSubscriber {
  constructor(
    @inject(MY_TYPES.AwesomeStatusProvider)
    private readonly statusProvider: AwesomeStatusProvider
  ) {}

  @On("onUserCreate")
  onUserCreate(user: User) {
    console.log("User created:", user.name);
  }

  @On("onStatusUpdate")
  updateUserStatus(status: string) {
    console.log("Status updated to:", status);
  }

  @On("onAsyncStatusUpdate")
  async onAsyncStatusUpdate(): Promise<{ status: any }> {
    const status = await this.statusProvider.loadMyAwesomeStatus();
    return { status };
  }
}
```

---

### 3. Dispatch Events

```ts
import { TYPES, EventDispatcher } from "event-dispatching";
import { User } from "./models/User";

// Make sure all subscribers are imported so decorators are registered

container.bind(UserEventSubscriber).to(UserEventSubscriber);
const dispatcher = container.get<EventDispatcher>(TYPES.EventDispatcher);

// Dispatch a user creation event
dispatcher.dispatch("onUserCreate", new User("Johny"));

// Dispatch a status update
dispatcher.dispatch("onStatusUpdate", "hello world");

// Dispatch an async event
dispatcher.asyncDispatch("onAsyncStatusUpdate")
  .then(results => {
    for (const result of results) {
      if (result?.status) {
        console.log("Loaded status:", result.status);
      }
    }
  })
  .catch(() => {
    console.error("Error occurred while loading status.");
  });
```

---

## 📁 Samples

Browse the [sample folder](https://github.com/mduvernon/event-dispatching/tree/master/sample) for practical examples.

---

## 🧩 Roadmap

- [ ] Add more usage samples
- [ ] Abstract DI to support other IoC containers (not just Inversify)
- [ ] Add test coverage
- [ ] Expand documentation with advanced use cases

---

## License

MIT © [mduvernon](https://github.com/mduvernon)
