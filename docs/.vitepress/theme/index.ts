import DefaultTheme from 'vitepress/theme-without-fonts'
import Layout from './layout.vue'
import Home from './Home.vue'
import PerformanceChart from './PerformanceChart.vue'
import '@fontsource-variable/inter'
import '../../tailwind.css'

export default {
    extends: DefaultTheme,
    Layout,
    enhanceApp({ app }: { app: any }) {
        app.component('Home', Home)
        app.component('PerformanceChart', PerformanceChart)
    },
}
