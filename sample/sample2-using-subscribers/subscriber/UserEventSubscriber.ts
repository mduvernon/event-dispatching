import { EventSubscriberInterface } from "../../../src/EventSubscriberInterface";
import { EventSubscriber } from "../../../src/Decorator/decorators";
import { EventsHandler } from "../../../src/Interface/EventsHandler";
import { User } from "./../User";

@EventSubscriber()
export class UserEventSubscriber implements EventSubscriberInterface {

    subscribedTo(): EventsHandler {
        return {
            onUserCreate: this.onUserCreate,
            onUserUpdate: this.updateData
        };
    }

    private onUserCreate(user: User) {
        console.log("User " + user.name + " created!");
    }

    private updateData(user: User) {
        console.log("User " + user.name + " updated!");
    }

}