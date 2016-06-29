export default function getProp(object, prop) {
    let propArr = prop.split(".");
    let propValue = object;
    while (propArr.length > 0){
        propValue = propValue[propArr.shift()];
        if(propValue === undefined || propValue === null) break;
    }

    return propValue;
}
