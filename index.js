import '../node_modules/markdown/lib/markdown.js'; 
import '../node_modules/knockout/build/output/knockout-latest.js';
import { AppViewModel } from './js/app-view-model.js';

// Bind the ViewModel
const ko = window.ko;
ko.applyBindings(new AppViewModel());