import './assets/main.css';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import PrimeVue from 'primevue/config';

import Sidebar from 'primevue/sidebar';
import DataTable from 'primevue/datatable';
import ToggleButton from 'primevue/togglebutton';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Listbox from 'primevue/listbox';


import 'primeicons/primeicons.css';
import 'primevue/resources/themes/lara-dark-green/theme.css'

const app = createApp(App);

app.use(router);

app.use(PrimeVue);

app.component('Sidebar', Sidebar);
app.component('ToggleButton', ToggleButton);
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('Button', Button);
app.component('Dropdown', Dropdown);
app.component('InputText', InputText);
app.component('Listbox', Listbox);

app.mount('#app');
