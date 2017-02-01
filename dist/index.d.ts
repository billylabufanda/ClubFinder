declare class Deferred<T> {
    readonly promise: Promise<T>;
    private _resolve;
    private _reject;
    private _fulfilled;
    constructor();
    readonly fulfilled: boolean;
    resolve(value?: T): void;
    reject(reason?: any): void;
}
interface User {
    getName(): string;
    getEmail(): string;
}
declare const deferredUser: Deferred<User>;
declare const user: Promise<User>;
declare const driveClientLoaded: Deferred<void>;
declare const sheetClientLoaded: Deferred<void>;
declare const gapi: any;
declare const $: any;
/**
 * Load Sheets API client library.
 */
declare function loadClients(): void;
/**
 * Find or Create the Spreadsheet
 */
declare class StudentSheet {
    private readonly sheetIdPromise;
    constructor();
    /**
     * @returns the prior saved state of the given filter
     */
    getFilterState(filterId: string): boolean;
    setFilterState(filterId: string, checked: boolean): boolean;
    private getSpreadsheetId();
}
declare const studentSheet: StudentSheet;
/**
 * Holds the types of a given kind of filter, like "location" or "interest"
 */
declare class FilterSet {
    readonly name: string;
    readonly id: string;
    readonly filterClickListener: () => void;
    private readonly filterNameToFilter;
    constructor(name: any, filterClickListener: any);
    filterNames(): string[];
    filters(): Filter[];
    addFilter(filterName: any): void;
    /**
     * filterName is the name of a specific filter, like "San Francisco" or "Engineering".
     * newCheckedValue is the current state of the filter checkbox/switch
     */
    setFilterChecked(filterName: any, isChecked: any): void;
    render(): void;
    selectedFilterNames(): string[];
    unselectedFilterNames(): string[];
}
/**
 * "San Jose" or "Engineering"
 */
declare class Filter {
    readonly name: string;
    private readonly filterSet;
    private readonly id;
    constructor(filterSet: any, name: any);
    getChecked(): any;
    setChecked(newCheckedState: any): void;
    render(): void;
}
declare const blankImages: string[];
declare function getRandomInt(min: any, max: any): any;
declare function randomBlankImage(): string;
declare function splitAndTrim(s: any): any;
declare let internshipCounter: number;
declare class Internship {
    readonly locations: Array<string>;
    readonly interests: Array<string>;
    readonly name: string;
    readonly jobDescription: string;
    readonly contactInfo: string;
    readonly typeOfWork: string;
    readonly numberOfStudents: string;
    readonly logo: string;
    private readonly id;
    private readonly mySelector;
    constructor(entry: any);
    show(): void;
    hide(): void;
    bgStyle(): string;
    render(): void;
    saveClicked(): void;
}
/**
 * Intersect an array of sets
 */
/**
 * @return an array holding only elements found in every element in `arrayOfSets`
 */
declare function intersect(arrayOfSets: any): any[];
declare function hasAnyOf(needles: any, haystack: any): boolean;
/**
 * parses the internships and sets up the filtersets
 */
declare class Internships {
    private readonly internships;
    private readonly locations;
    private readonly interests;
    constructor(dataFeedEntry: any);
    onFilterChange(): void;
}
/**
 * GeoLocation Data
 */
declare function geoFindMe(): void;
declare function geoLocationFilter(): boolean;
declare const CLIENT_ID = "246642128409-40focd7nja03tje6l4i21rl1lt9rtn5b.apps.googleusercontent.com";
declare const SCOPES = "email profile https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive";
/**
 * When Google Sign-in succeeds
 */
declare function onSuccess(googleUser: any): Promise<void>;
declare function onFailure(error: any): void;
declare function goGoGoogle(): void;
