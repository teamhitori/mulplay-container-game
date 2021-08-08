"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyObj = void 0;
function copyObj(objIn) {
    var seenObjects = [];
    var convertedObjects = {};
    var tryCopy = (objFrom) => {
        if (objFrom && typeof objFrom === 'object') {
            if (seenObjects.indexOf(objFrom) !== -1) {
                return undefined;
            }
            seenObjects.push(objFrom);
            var objTo = {};
            for (var key in objFrom) {
                if (objFrom.hasOwnProperty(key)) {
                    var result = tryCopy(objFrom[key]);
                    if (result != undefined) {
                        convertedObjects[key] = result;
                        objTo[key] = result;
                    }
                    else if (convertedObjects[key]) {
                        objTo[key] = convertedObjects[key];
                    }
                }
            }
            return objTo;
        }
        else {
            return objFrom;
        }
    };
    var objOut = tryCopy(objIn);
    return objOut;
}
exports.copyObj = copyObj;
//# sourceMappingURL=Utils.js.map