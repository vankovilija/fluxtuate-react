import {stateChangeCallbacks} from "./_internals"
import getProp from "./getProp"

function processMediateKey(stateKey, stateProcessor, target, key, descriptor) {

    if(key === undefined) throw new Error(`You can only bind properties of a mediator!`);

    if(!target[stateChangeCallbacks]) target[stateChangeCallbacks] = [];
    target[stateChangeCallbacks].push({stateKey, key, stateProcessor});

    return descriptor;
}

export default function onStateChange(stateKey, stateProcessor, ...args) {
    if (args.length === 0) {
        return processMediateKey.bind(this, stateKey, stateProcessor);
    } else if (args.length === 1) {
        return processMediateKey.apply(this, [stateProcessor, (state)=>[getProp(state, args[0])], stateKey, stateProcessor, ...args]);
    }
}