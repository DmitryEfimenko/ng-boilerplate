/// <reference path="../../types/types.ts" />

export class HomeService implements core.IHomeService {
    private logGreeting(greeting: string) {
        console.log('Received greeting: ' + greeting);
    }

    getGreeting(greeting) {
        this.logGreeting(greeting);
        // do something else
        return { 'greeting': greeting };
    }
}

angular
    .module('app.home')
    .service('HomeService', HomeService);
