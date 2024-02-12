import { Container } from 'inversify';
import "es6-shim";
import eventDispatching from "../../src/index";

const container = new Container();




interface User {
    name: string;
    age: number;
}

let johny: User = { name: "Johny", age: 25 };

let eventDispatcher = new EventDispatcher();
eventDispatcher.on("user_created", (user: User) => {
    console.log("User " + user.name + " has been created!");
});

eventDispatcher.dispatch("user_created", johny);

console.log("removing all 'user_created' events");
eventDispatcher.remove("user_created");

eventDispatcher.dispatch("user_created", johny);