type DbMode = 'readonly' | 'readwrite' | 'versionchange';

interface TransactionOptions {
    storeName: string;
    dbMode: DbMode;
    onError: (e: Event) => any;
    onComplete: (e: Event) => any;
    onAbort?: (e: Event) => any;
}

export class IndexedDB {

    private name: string;
    private version: number;
    private indexedDB: IDBFactory;
    private db: IDBDatabase;

    constructor(dbName: string, version: number = 1) {
        this.indexedDB = window.indexedDB || (<any>window).mozIndexedDB || (<any>window).webkitIndexedDB || (<any>window).msIndexedDB;
        this.name = dbName;
        this.version = version;
    }

    createStore(onUpgradeNeeded: (ev: IDBVersionChangeEvent, db: IDBDatabase) => any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let request = this.indexedDB.open(this.name, this.version);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onerror = (ev) => {
                reject(`IndexedDB open error: ${(<any>ev.target).errorCode}`);
            };

            request.onupgradeneeded = (ev) => {
                onUpgradeNeeded(ev, this.db);
            };
        });
    }

    get(storeName: string, key: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (!this.checkDbReady(storeName, reject)) {
                return;
            }

            let transaction = this.newTransaction({
                storeName: storeName,
                dbMode: 'readonly',
                onError: (e: Event) => {
                    reject(e);
                },
                onComplete: () => {
                }
            });

            let objectStore = transaction.objectStore(storeName);
            let request = objectStore.get(key);
            request.onsuccess = (event: Event) => {
                resolve((<any>event.target).result);
            }
        });
    }

    getAll(storeName: string, keyRange?: IDBKeyRange): Promise<any[]> {
        return new Promise<any>((resolve, reject) => {
            if (!this.checkDbReady(storeName, reject)) {
                return;
            }

            let transaction = this.newTransaction({
                storeName: storeName,
                dbMode: 'readonly',
                onError: (e: Event) => {
                    reject(e);
                },
                onComplete: () => {
                }
            });
            let objectStore = transaction.objectStore(storeName);
            let values: any[] = [];
            let request = objectStore.openCursor(keyRange);

            request.onerror = e => {
                reject(e);
            };

            request.onsuccess = evt => {
                let cursor = (<IDBOpenDBRequest>evt.target).result;
                if (cursor) {
                    values.push(cursor["value"]);
                    cursor['continue']();
                } else {
                    resolve(values);
                }
            };
        });
    }

    add(storeName: string, value: any, key?: IDBArrayKey | IDBValidKey): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (!this.checkDbReady(storeName, reject)) {
                return;
            }

            let transaction = this.newTransaction({
                storeName: storeName,
                dbMode: 'readwrite',
                onError: (e: Event) => {
                    reject(e);
                },
                onComplete: () => {
                    resolve({key: key, value: value});
                }
            });

            let objectStore = transaction.objectStore(storeName);
            objectStore.add(value, key);
        });
    }

    put(storeName: string, value: any, key?: IDBKeyRange | IDBValidKey): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (!this.checkDbReady(storeName, reject)) {
                return;
            }

            let transaction = this.newTransaction({
                storeName: storeName,
                dbMode: 'readwrite',
                onError: (e: Event) => {
                    reject(e);
                },
                onComplete: () => {
                    resolve(value);
                },
                onAbort: (e: Event) => {
                    reject(e);
                }
            });

            let objectStore = transaction.objectStore(storeName);
            objectStore.put(value, key);
        });
    }

    remove(storeName: string, key: IDBKeyRange | IDBValidKey): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (!this.checkDbReady(storeName, reject)) {
                return;
            }

            let transaction = this.newTransaction({
                storeName: storeName,
                dbMode: 'readwrite',
                onError: (e: Event) => {
                    reject(e);
                },
                onComplete: () => {
                    resolve();
                },
                onAbort: (e: Event) => {
                    reject(e);
                }
            });

            let objectStore = transaction.objectStore(storeName);
            objectStore['delete'](key);
        });
    }

    clear(storeName: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (!this.checkDbReady(storeName, reject)) {
                return;
            }

            let transaction = this.newTransaction({
                storeName: storeName,
                dbMode: 'readwrite',
                onError: (e: Event) => {
                    reject(e);
                },
                onComplete: () => {
                    resolve();
                },
                onAbort: (e: Event) => {
                    reject(e);
                }
            });

            let objectStore = transaction.objectStore(storeName);
            objectStore.clear();
            resolve();
        });
    }

    private checkDbReady(storeName: string, reject: Function): boolean {
        if (!this.db) {
            reject('IndexedDB store accessed before being opened');
            return false;
        }
        if (!this.db.objectStoreNames.contains(storeName)) {
            reject(`IndexedDB object store not found: ${storeName}`);
            return false;
        }
        return true;
    }

    private newTransaction(options: TransactionOptions): IDBTransaction {
        let trans: IDBTransaction = this.db.transaction(options.storeName, options.dbMode);
        trans.onerror = options.onError;
        trans.oncomplete = options.onComplete;
        trans.onabort = options.onAbort;
        return trans;
    }
}
