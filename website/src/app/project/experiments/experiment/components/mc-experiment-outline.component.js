import {ExperimentStep} from '../experiment.model';

/*
 ** This component has to add and remove classes to show visual state. This is an expensive
 ** operation when ng-class is used as angular will call the checks on ng-class many times.
 ** To get around this, the component adds and removes the classes itself by directly
 ** manipulating the DOM.
 */

angular.module('materialscommons').component('mcExperimentOutline', {
    templateUrl: 'app/project/experiments/experiment/components/mc-experiment-outline.html',
    controller: MCExperimentOutlineComponentController,
    bindings: {
        experiment: '=',
        currentNode: '='
    }
});

/*@ngInject*/
function MCExperimentOutlineComponentController(focus, toastr, currentStep) {
    let lastID = 1;
    let ctrl = this;

    ctrl.editorOptions = {
        height: '55vh',
        width: '85vw'
    };

    ctrl.onChange = (step) => {
        console.log('onChange!', step);
    };

    ctrl.toggleOpenDetails = (step, event) => {
        step.displayState.open = !step.displayState.open;
        if (step.displayState.open) {
            $(event.target).removeClass('fa-angle-double-right');
            $(event.target).addClass('fa-angle-double-down');
        } else {
            $(event.target).removeClass('fa-angle-double-down');
            $(event.target).addClass('fa-angle-double-right');
        }
    };

    ctrl.toggleFlag = (flags, whichFlag, event) => {
        // toggle flag and then get its value so we know
        // what classes to add/remove.
        flags[whichFlag] = !flags[whichFlag];
        let flagColorClass = getFlagColorClass(whichFlag);
        let flag = flags[whichFlag];
        if (flag) {
            // Toggled to on, remove dark grey and add in class for specific flag
            $(event.target).removeClass('mc-dark-grey-color');
            $(event.target).addClass(flagColorClass);
        } else {
            $(event.target).removeClass(flagColorClass);
            $(event.target).addClass('mc-dark-grey-color');
        }
    };

    ctrl.currentStep = currentStep.get();
    ctrl.setCurrent = setCurrent;
    ctrl.addBlankStep = addBlankStep;
    ctrl.remove = remove;

    function setCurrent(step, node, event) {
        $('.mc-experiment-outline-step').removeClass('step-selected');
        $(event.currentTarget).addClass('step-selected');
        ctrl.currentStep = step;
        currentStep.set(step);
        ctrl.currentNode = node;
    }

    function addBlankStep(node) {
        $('.mc-experiment-outline-step').removeClass('step-selected');
        let newStep = new ExperimentStep('', '');
        newStep.displayState.selectedClass = 'step-selected';
        newStep.id = "simple" + lastID;
        lastID++;
        node.$parentNodesScope.$modelValue.push(newStep);
        ctrl.currentStep = newStep;
        currentStep.set(newStep);
        focus(newStep.id);
    }

    function remove(node) {
        if (node.depth() === 1 && ctrl.experiment.steps.length === 1) {
            toastr.error('Cannot remove last step', 'Error', {closeButton: true});
            return;
        }
        if (node.$modelValue == ctrl.currentStep) {
            ctrl.currentStep = null;
        }
        node.remove();
    }

    function getFlagColorClass(flag) {
        return 'mc-' + flag + '-color';
    }
}
