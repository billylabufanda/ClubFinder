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
declare const gapi: any;
declare const $: any;
/**
 * Load Sheets API client library.
 */
/**
 * Holds the types of a given kind of filter, like "location" or "interest"
 */
declare class FilterSet {
    readonly name: string;
    readonly filterClickListener: () => void;
    readonly id: string;
    private readonly filterNameToFilter;
    constructor(name: string, filterClickListener: () => void);
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
    readonly filterSet: FilterSet;
    readonly name: string;
    readonly id: string;
    private checked;
    constructor(filterSet: FilterSet, name: string);
    getChecked(): boolean;
    setChecked(newCheckedState: boolean): void;
    render(): void;
}
declare const blankImages: string[];
declare function getRandomInt(min: any, max: any): any;
declare function randomBlankImage(): string;
declare function splitAndTrim(s: any): any;
declare let internshipCounter: number;
declare class Internship {
    readonly parent: Internships;
    readonly locations: string[];
    readonly interests: string[];
    readonly name: string;
    readonly jobDescription: string;
    readonly contactInfo: string;
    readonly typeOfWork: string;
    readonly numberOfStudents: string;
    readonly logo: string;
    private readonly id;
    private readonly mySelector;
    private saved;
    constructor(parent: Internships, entry: any);
    show(): void;
    hide(): void;
    bgStyle(): string;
    render(): Promise<void>;
    getSaved(): boolean;
    setSaved(newSavedState: boolean): void;
    renderSaveButton(): void;
    saveClicked(): void;
}
/**
 * @return an array holding only elements found in every element in `arrayOfSets`
 */
declare function intersect<T>(arrayOfSets: Set<T>[]): T[];
declare function hasAnyOf<T>(needles: T[], haystack: T[]): boolean;
/**
 * parses the internships and sets up the filtersets
 */
declare class Internships {
    readonly internships: Internship[];
    readonly locations: FilterSet;
    readonly interests: FilterSet;
    readonly filters: Filter[];
    private readonly filtersByFilterId;
    private readonly studentSheet;
    constructor(dataFeedEntry: any);
    findByNameAndLocation(name: string, location: string): Internship | undefined;
    findFilterById(filterId: string): Filter | undefined;
    onFilterChange(): void;
    loadSavedFilters(): Promise<void>;
    loadSavedInternships(): Promise<void>;
    saveFilters(): Promise<void>;
    saveInternships(): Promise<void>;
}
interface SavedInternship {
    name: string;
    location: string;
}
/**
 * Find or Create the Spreadsheet
 */
declare class StudentSheet {
    static readonly maxValues: number;
    readonly savedFilters: Promise<Map<string, boolean>>;
    readonly savedInternships: Promise<SavedInternship[]>;
    private readonly sheetId;
    constructor();
    writeFiltersSheet(filters: Map<string, boolean>): Promise<void>;
    writeInternshipsSheet(savedInternships: Internship[]): Promise<void>;
    private getSpreadsheetId();
    private readFiltersSheet();
    private readInternshipsSheet();
}
declare function stringToBoolean(s: string): boolean;
declare const studentSheet: StudentSheet;
declare function geoLocationFilter(): boolean;
declare const CLIENT_ID = "246642128409-40focd7nja03tje6l4i21rl1lt9rtn5b.apps.googleusercontent.com";
declare const SCOPES = "email profile https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive";
declare function handleClientLoad(): void;
declare function updateSigninStatus(isSignedIn: any): void;
declare function handleSignInClick(event: any): void;
