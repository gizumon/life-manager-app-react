namespace Utils {
    export function formatDate(dt: Date): string {
        var y = dt.getFullYear();
        var m = ('00' + (dt.getMonth()+1)).slice(-2);
        var d = ('00' + dt.getDate()).slice(-2);
        return (y + '-' + m + '-' + d);
    }

    export function convertDate(dateString: string): Date {
        return new Date(dateString);
    }

    /**
     * get query params
     * @param url 
     * @param key 
     * @returns 
     */
    export function getQueryParam(url: string, key: string): string {
        // const matchArr = url.match(new RegExp(`[&?]${key}=(.*)(&|$)`));
        // if (!matchArr) { return ''; }
        // return matchArr && matchArr.length > 1 ? matchArr[1] : '';
        const arr = url.split(`${key}=`);
        if (!arr || arr.length <= 1) { return ''; }
        return arr[1].replace(/&(.*)/, '');
    }

    /**
     * sort object keys
     * @param obj 
     * @param sortFn 
     * @returns sorted object
     */
    export function sortObject(obj: Object, sortFn?: (obj1: any, obj2: any) => number) {
        return Object.fromEntries(Object.entries(obj).sort(sortFn));
    }

    /**
     * make url
     * @param baseUrl 
     * @param id 
     * @param type 
     * @returns 
     */
    export function makeUrl(baseUrl: string = '', type: string = ''): string {
        return type ? `${baseUrl}?type=${type}` : baseUrl;
    }

    /**
     * has search key in specific string
     * @param string 
     * @param searchKey 
     * @returns boolean
     */
    export function hasString(string: string, searchKey: string): boolean {
        return string.indexOf(searchKey) > -1;
    }

    /**
     * Asc number or string
     * @param arg1 
     * @param arg2 
     * @returns 
     */
    export function asc(arg1: number | string, arg2: number | string): number {
        return arg1 > arg2 ? 1
             : arg1 < arg2 ? -1
             : 0;
    }

    /**
     * Desc number or string
     * @param arg1 
     * @param arg2 
     * @returns 
     */
    export function desc(arg1: number | string, arg2: number | string): number {
        return arg1 < arg2 ? 1
             : arg1 > arg2 ? -1
             : 0;
    }

    /**
     * Move array fromIndex to toIndex
     * @param array 
     * @param fromIndex 
     * @param toIndex 
     * @returns 
     */
    export function arrayMove(array: any[], fromIndex: number, toIndex: number) {
        const newArray = [...array];
        const startIndex = fromIndex < 0 ? newArray.length + fromIndex : fromIndex;
        if (startIndex >= 0 && startIndex < newArray.length) {
            const endIndex = toIndex < 0 ? newArray.length + toIndex : toIndex;
            const [item] = newArray.splice(fromIndex, 1);
            newArray.splice(endIndex, 0, item);
        }
        return newArray;
    }

    /**
     * Get ISO timestamp
     * @returns string
     */
    export function getDateTime(): string { return new Date().toISOString(); }
    // export function getTimeStrFromTimeStamp(): string {}

    interface IBaseObjArray {
        id: string;
    }
    export function convertObjectToArray<T>(obj: {[key in string]: T}): T[] {
        return Object.keys(obj).map((key) => {
            obj[key]['id'] = key;
            return obj[key] as T;
        });
    };

    export function searchKeyFromWordList(text: string, arr: {[key in string]: string[]}): string {
        let result = '';
        Object.keys(arr).some((key: string) => {
          const hasKey = arr[key as string].some((word) => Utils.hasString(text, word));
          if (hasKey) {
            result = key;
            return true;
          }
        });
        return result;
      };

    export const isIncludesArr = (text: string, arr: string[]): boolean => {
        return arr.some((word) => text.indexOf(word) > -1);
    };

    export const copyClipboard = (text: string): boolean => {
        const input = document.createElement('input');
        input.hidden = true;
        document.body.appendChild(input);
        input.value = text;
        input.select();
        const result = document.execCommand('copy');
        document.body.removeChild(input);
        return result;
    };
}

export default Utils;