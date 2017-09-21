import {Injectable} from '@angular/core';
import {XPCONFIG} from '../app.config';

@Injectable()
export class PushNotificationService {

    private publicKey: Uint8Array;

    constructor() {
        this.publicKey = this.urlB64ToUint8Array(XPCONFIG.publicKey);
    }

    isPushSupported(): boolean {
        return ('serviceWorker' in navigator && 'PushManager' in window);
    }

    checkUserIsSubscribed(): Promise<boolean> {
        return new Promise((resolve, reject) => {

            navigator.serviceWorker.getRegistration()
                .then((swReg: ServiceWorkerRegistration) => {
                    if (!swReg || !swReg.active) {
                        resolve(false);
                    }
                    swReg.pushManager.getSubscription()
                        .then(function (subscription) {
                            const isSubscribed = !(subscription === null);
                            resolve(isSubscribed);
                        });
                }).catch((ex) => {
                    reject(ex);
                }
            );

        });
    }

    subscribeUser(): Promise<PushSubscription> {
        return new Promise((resolve, reject) => {

            navigator.serviceWorker.getRegistration()
                .then((swReg: ServiceWorkerRegistration) => {
                    if (!swReg || !swReg.active) {
                        resolve(null);
                    }

                    swReg.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: this.publicKey
                    }).then(function (subscription) {
                        console.log('User is subscribed.');
                        resolve(subscription);

                    }).catch(function (err) {
                        console.log('Failed to subscribe the user: ', err);
                        reject(err);
                    });

                }).catch((ex) => {
                    reject(ex);
                }
            );
        });
    }

    unsubscribeUser(): Promise<PushSubscription> {
        return new Promise((resolve, reject) => {

            navigator.serviceWorker.getRegistration()
                .then((swReg: ServiceWorkerRegistration) => {
                    if (!swReg || !swReg.active) {
                        resolve(null);
                    }

                    swReg.pushManager.getSubscription().then(function (subscription) {
                        subscription.unsubscribe().then(result => {
                            resolve(result ? subscription : null);
                        });
                    }).catch(function (err) {
                        console.log('Failed to unsubscribe the user: ', err);
                        reject(err);
                    });

                }).catch((ex) => {
                    reject(ex);
                }
            );
        });

    }

    requestNotificationPermission(): Promise<NotificationPermission> {
        return new Promise((resolve, reject) => {

            Notification.requestPermission().then((result: NotificationPermission) => {
                resolve(result);
            }).catch((ex) => {
                reject(ex);
            });

        });
    }

    private urlB64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
}
