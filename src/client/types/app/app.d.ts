interface IRootScope extends ng.IScope {
    pageTitle: string;
    session;
    containerId: string;
    tabTitle: string;
    $state: ng.ui.IStateService;
    $stateParams: ng.ui.IStateParamsService;
}