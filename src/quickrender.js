import React, {Component, PropTypes} from "react"
import getOwnKeys from "fluxtuate/lib/utils/getOwnKeys"
import {isObject} from "lodash/lang";

function wrapObject(object, canSet, wholeObject, rootKey) {
    let wrappedObject = {};
    let keys = getOwnKeys(object);
    let objectCache = {};

    let self = this;
    keys.forEach((key)=>{
        Object.defineProperty(wrappedObject, key, {
            get() {
                if(isObject(object[key])){
                    objectCache[key] = wrapObject(object[key], canSet, wrappedObject, key);
                }else{
                    objectCache[key] = object[key];
                }
            },
            set(value){
                if(!canSet) throw new Error("You are not allowed to set props!");

                if(wholeObject) {
                    let newObject = Object.assign({}, object);
                    newObject[key] = value;
                    wholeObject[rootKey] = newObject;
                }else{
                    let newState = {};
                    newState[key] = value;
                    self.setState(newState);
                }
            }
        });
    });
}

export default function quickReact(component) {
    return class QuickRenderWrapper extends component {
        render() {
            return super.render(wrapObject.apply(this, [this.props || {}, false]), wrapObject.apply(this, [this.state || {}, true]));
        }
    }
}