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
        return arr[1].replace(/&(.*)/, '') 
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
}

export default Utils;