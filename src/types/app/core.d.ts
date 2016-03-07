declare module core {

    interface IRootScope extends angular.IScope {
        pageTitle: string;
    }

    // Only add interfaces for the things shared or used in other modules
    interface IGreeting {
        greeting: string;
    }

    interface IHomeService {
        getGreeting(greeting: string): IGreeting;
    }
}
