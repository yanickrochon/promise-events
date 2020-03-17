declare module "promise-events" {
   class EventEmitter {
      static defaultMaxListeners: number;
      static usingDomains: boolean;
      
      maxListeners: number;
      resultFilter: (result: any) => boolean;

      addListener<T = void>(event: string, listner: function): Promise<T>;
      emit<T = void>(event: string | symbol, ...args: any[]): Promise<T>;
      on<T = void>(event: string | symbol, handler: (...args: any[]) => Promise<T>): Promise<T>;
      once<T = void>(event: string | symbol, handler: (...args: any[]) => Promise<T>): Promise<T>;
      prependListener<T = void>(event: string, handler: (...args: any[]) => Promise<T>): Promise<T>;
      prependOnceListener<T = void>(event: string | symbol, handler: (...args: any[]) => Promise<T>): Promise<T>;
      removeAllListeners<T = void>(event: string): Promise<T>;

      getMaxListeners(): number;
      setMaxListners(max: number): void;

      getResultFilter(): (result: any) => boolean;
      setResultFilter(filter: (result: any) => boolean): EventEmitter;
   }

   export default EventEmitter;
}