module Misc {
    export class String {
        static format(format: string, ...values: any[]): string {
            return format.replace(/{(\d+)}/g, (match, num) => {
                var i = parseInt(num);
                return typeof values[i] != 'undefined'
                    ? values[i]
                    : '';
            });
        }

        static isJson(str): boolean {
            if (!isNaN(str)) return false;

            try {
                JSON.parse(str);
            } catch (e) {
                return false;
            }
            return true;
        }

        static startsWith(str: string, toCheck: string): boolean {
            return str.slice(0, toCheck.length) == toCheck;
        }

        static endsWith(str: string, toCheck: string): boolean {
            return str.slice(-toCheck.length) == toCheck;
        }

        static capitalize(s: string) {
            return s.charAt(0).toUpperCase() + s.slice(1);
        }        

        static guid(): string {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0, v = c == 'x' ? r : r & 0x3 | 0x8; return v.toString(16); });
        }
    }

    export class Arr {
        static getByValue<T>(objArray: T[], filterIn, filterOut?): T {
            return this.getByValueBase(false, objArray, filterIn, filterOut);
        }

        static getIndexByValue<T>(objArray: T[], filterIn, filterOut?): number {
            return this.getByValueBase(true, objArray, filterIn, filterOut);
        }

        static getByValueBase(returnIndex, objArray, filterIn, filterOut) {
            var filterInProps = this.getObjectPropsAsKeyValue(filterIn);
            var filterOutProps = undefined;
            if (filterOut)
                filterOutProps = this.getObjectPropsAsKeyValue(filterOut);

            for (var i = 0, iLen = objArray.length; i < iLen; i++) {
                var noNeedToFilterOut = false;
                if (filterOutProps) {
                    for (var k = 0, kLen = filterOutProps.length; k < kLen; k++) {
                        if (objArray[i][filterOutProps[k].key] != filterOutProps[k].value) {
                            noNeedToFilterOut = true;
                            break;
                        }
                    }
                } else noNeedToFilterOut = true;

                if (noNeedToFilterOut) {
                    var allFilterInPropsMatched = true;
                    for (var j = 0, jLen = filterInProps.length; j < jLen; j++) {
                        if (objArray[i][filterInProps[j].key] != filterInProps[j].value) {
                            allFilterInPropsMatched = false;
                            break;
                        }
                    }
                    if (allFilterInPropsMatched) return returnIndex ? i : objArray[i];
                }
            }
            return returnIndex ? -1 : undefined;
        }

        static getObjectPropsAsKeyValue(obj) {
            var props = [];
            for (var property in obj) {
                if (obj.hasOwnProperty(property)) {
                    props.push({ key: property, value: obj[property] });
                }
            }
            return props;
        }

        static deleteByValue<T>(objArray: T[], filterIn: T, filterOut?: T): void {
            var indexToDelete = this.getIndexByValue(objArray, filterIn, filterOut);
            if (indexToDelete > -1)
                objArray.splice(indexToDelete, 1);
        }

        static dynamicSort = (property: string) => {
            var sortOrder = 1;
            if (property[0] === "-") {
                sortOrder = -1;
                property = property.substr(1);
            }
            return (a, b) => {
                var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
                return result * sortOrder;
            };
        };

        static toSimpleArray(objArr, prop) {
            var arr = [];
            for (var i = 0, l = objArr.length; i < l; i++) {
                arr.push(objArr[i][prop]);
            }
            return arr;
        };

        static groupedIntoArray(arr: any[]) {
            var result = [];
            for (var prop in arr) {
                if (prop !== 'undefined')
                    result.push({ key: prop, val: arr[prop] });
            }
            if (arr['undefined'])
                result.push({ key: 'undefined', val: arr['undefined'] });
            return result;
        }
    }

    export class Enum {
        static getNames(e: any) {
            return Object.keys(e).filter(v => isNaN(parseInt(v, 10)));
        }

        static getValues(e: any) {
            return Object.keys(e).map(v => parseInt(v, 10)).filter(v => !isNaN(v));
        }

        static getNamesAndValues(e: any) {
            return Enum.getValues(e).map(v => { return { name: e[v] as string, value: v }; });
        }
    }

    export function safe(obj: any, props: string[], defaultValue: any): any {
        if (obj === undefined || obj === null) {
            return defaultValue;
        }

        if (props.length === 0) {
            return obj;
        }
        var foundSoFar = obj[props[0]];
        var remainingProps = props.slice(1);

        return safe(foundSoFar, remainingProps, defaultValue);
    }

    export function applyMixins(derivedCtor: any, baseCtors: any[]) {
        baseCtors.forEach(baseCtor => {
            Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
                if (name !== 'constructor') {
                    derivedCtor.prototype[name] = baseCtor.prototype[name];
                }
            });
        });
    }

    export function isTypeOf<T>(arg: any, expectedClass: T): arg is T {
        var expectedClassProps = [];
        for (var prop in expectedClass) {
            expectedClassProps.push(prop);
        }
        var foundAll = true;
        for (var prop in arg) {
            if (expectedClassProps.indexOf(prop) == -1) {
                foundAll = false;
                break;
            }
        }
        return foundAll;
    };
}

export default Misc;