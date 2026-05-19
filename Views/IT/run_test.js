
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { url: 'http://localhost/' });
global.window = dom.window;
global.document = dom.window.document;
global.debounce = function(fn) { return fn; };
global.apiFetch = async function() { return {}; };
global.Chart = class Chart { constructor() {} destroy() {} };
require('./temp6.js');
console.log('Script loaded successfully');

