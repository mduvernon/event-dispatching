import "es6-shim";

import { Container } from 'inversify';

import eventDispatching, { TYPES, EventDispatcher } from "../../src";

const container = new Container();

eventDispatching({ container });

const eventDispatching = container.get<EventDispatcher>(TYPES.EventDispatcher);

interface User {
    name: string;
    age: number;
}

let johny: User = { name: "Johny", age: 25 };

eventDispatching.on("user_created", (user: User) => {
    console.log("User " + user.name + " has been created!");
});

eventDispatching.dispatch("user_created", johny);

console.log("removing all 'user_created' events");
eventDispatching.remove("user_created");

eventDispatching.dispatch("user_created", johny);