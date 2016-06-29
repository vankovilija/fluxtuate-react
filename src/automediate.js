import {autoMediates} from "./_internals"
import getProp from "./getProp"

function processMediateKey(stateKey, target, key, descriptor) {

    if(key === undefined) throw new Error(`You can only bind properties of a mediator!`);

    let mediateFunction;
    if(typeof descriptor.value === "function"){
        mediateFunction = descriptor.value;
    }else{
        mediateFunction = (state)=>[getProp(state, stateKey)];
    }

    if(!target[autoMediates]) target[autoMediates] = [];
    target[autoMediates].push({stateKey, key, mediateFunction});

    descriptor.configurable = true;

    return descriptor;
}

export default function automediate(stateKey, ...args) {
    if (args.length === 0) {
        return processMediateKey.bind(this, stateKey);
    } else if (args.length === 2) {
        return processMediateKey.apply(this, [args[0], stateKey, ...args]);
    }
}