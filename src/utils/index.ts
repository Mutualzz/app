import mergeWith from "lodash-es/mergeWith";

export function mergeAppendAnything(
    ...objects: Array<Record<string, any>>
): Record<string, any[]> {
    return mergeWith({}, ...objects, (objValue: any, srcValue: any) => {
        const toArray = (val: any): any[] => (Array.isArray(val) ? val : [val]);

        if (objValue !== undefined && srcValue !== undefined) {
            return toArray(objValue).concat(toArray(srcValue));
        }

        return undefined;
    });
}
