import './polyfills.ts';
// Angular
import '@angular/platform-browser';
import '@angular/core';
import '@angular/common';
import '@angular/common/http';
import '@angular/router';
// RxJS
import 'rxjs';
//import 'materialize-css';
import 'crypto-js';
import 'chart.js';
import 'chartjs-plugin-annotation';

// Other vendors for example jQuery, Lodash or Bootstrap
// You can import js, ts, css, sass, ...

// angular2-materialize is still on materialize-css v0.100.1 and requires global variable called 'Materialize'
// while this app is now on materialize-css v1.0.0 which renamed the variable from 'Materialize' to 'M'.
// The fix below makes angular2-materialize work with materialize-css v1.0.0
//window['Materialize'] = M;
