export function copyObj(objIn: any): any {
    var seenObjects: any = [];
    var convertedObjects: any = {};

    var tryCopy = (objFrom: any): any => {
        if (objFrom && typeof objFrom === 'object') {
            if (seenObjects.indexOf(objFrom) !== -1) {
                return undefined;
            }

            seenObjects.push(objFrom);

            var objTo:any = {};

            for (var key in objFrom) {
                if (objFrom.hasOwnProperty(key)) {

                    var result = tryCopy(objFrom[key])
                    if(result != undefined) {
                        convertedObjects[key] = result;
                        objTo[key] = result;
                    } else if(convertedObjects[key]) {
                        objTo[key] = convertedObjects[key]
                    }
                }
            }

            return objTo;
        } else {
            return objFrom;
        }
        
    }

    var objOut = tryCopy(objIn);

    return objOut;
}