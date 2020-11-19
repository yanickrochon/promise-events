declare type TListener = (...args: any[]) => void;
declare type TFilter<T = any> = {
    <S extends T>(callbackfn: (value: T, index: number, array: T[]) => value is S, thisArg?: any): S[];
    (callbackfn: (value: T, index: number, array: T[]) => unknown, thisArg?: any): T[];
};
declare class EventEmitter {
    private _resultFilter;
    private _events;
    private _eventsCount;
    private _domain;
    get maxListeners(): number;
    set maxListeners(n: number);
    getResultFilter(): TFilter | undefined;
    setResultFilter(filter: TFilter): this;
    get resultFilter(): TFilter | undefined;
    set resultFilter(filter: TFilter);
    emit(type: string | symbol, ...args: any[]): Promise<any>;
    addListener(type: string | symbol, listener: TListener): Promise<any>;
    prependListener(type: string | symbol, listener: TListener): Promise<any>;
    once(type: string | symbol, listener: TListener): Promise<any>;
    prependOnceListener(type: string | symbol, listener: TListener): Promise<any>;
    removeListener(type: string | symbol, listener: TListener): Promise<any>;
    removeAllListeners(type: string | symbol): Promise<any>;
    static defaultMaxListeners: number | undefined;
    static usingDomains: boolean | undefined;
}
export = EventEmitter;