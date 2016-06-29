import {automediates} from "./_internals"

function processAutomediate(mediatorFunctionName, target, key, descriptor) {

    if(key === undefined) throw new Error(`You can only bind properties of a mediator!`);

    if(!target[automediates]) target[automediates] = [];
    target[automediates].push({mediatorFunctionName, key});

    descriptor.configurable = true;

    return descriptor;
}

export default function automediate(mediatorFunctionName, ...args) {
    if (args.length === 0) {
        return processAutomediate.bind(this, mediatorFunctionName);
    } else if (args.length === 2) {
        return processAutomediate.apply(this, [args[0], mediatorFunctionName, ...args]);
    }
}