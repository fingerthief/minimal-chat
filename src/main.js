import './assets/main.css';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';

import Drawer from 'primevue/drawer';
import DataTable from 'primevue/datatable';
import ToggleSwitch from 'primevue/toggleswitch';
import Column from 'primevue/column';
import Button from 'primevue/button';

import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

const app = createApp(App);

app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            prefix: 'p'
        }
    }
});

app.component('Drawer', Drawer);
app.component('ToggleSwitch', ToggleSwitch);
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('Button', Button);

app.mount('#app');
