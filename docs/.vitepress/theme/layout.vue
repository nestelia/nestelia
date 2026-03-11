<script setup lang="ts">
import { nextTick, provide, onMounted } from 'vue'
import { useData, useRouter } from 'vitepress'
import DefaultTheme from 'vitepress/theme-without-fonts'
import mediumZoom from 'medium-zoom'
import useDark from './use-dark'

const isDark = useDark()
const { isDark: darkTheme } = useData()

const enableTransitions = () =>
    'startViewTransition' in document &&
    window.matchMedia('(prefers-reduced-motion: no-preference)').matches

provide('toggle-appearance', async ({ clientX: x, clientY: y }: MouseEvent) => {
    if (!enableTransitions()) {
        darkTheme.value = !darkTheme.value
        return
    }

    document.documentElement.style.setProperty('--vt-x', `${x}px`)
    document.documentElement.style.setProperty('--vt-y', `${y}px`)

    await document.startViewTransition(async () => {
        darkTheme.value = !darkTheme.value
        await nextTick()
    }).ready
})

const onNewPage = () => {
    mediumZoom('[data-zoomable]', { background: 'transparent' })

    if (document.querySelector('.vp-doc > div:has(.code-compare)')) {
        document.getElementById('VPContent')?.classList.add('-wide')
        document.querySelector('.VPDoc > .container')?.classList.add('-wide')
        document.querySelector('.vp-doc > div')?.classList.add('-wide')
    } else {
        document.getElementById('VPContent')?.classList.remove('-wide')
        document.querySelector('.VPDoc > .container')?.classList.remove('-wide')
        document.querySelector('.vp-doc > div')?.classList.remove('-wide')
    }
}

const addMainRole = () => {
    document.getElementById('VPContent')?.setAttribute('role', 'main')
}

onMounted(() => {
    onNewPage()
    addMainRole()
})

const router = useRouter()
router.onAfterRouteChange = () => {
    onNewPage()
    addMainRole()
}
</script>

<template>
    <DefaultTheme.Layout />
</template>

<style>
.VPSwitchAppearance {
    width: 22px !important;
}

.VPSwitchAppearance .check {
    transform: none !important;
}

.medium-zoom-overlay {
    will-change: transform;
    backdrop-filter: blur(2.5rem) brightness(1.1);
    z-index: 998;
}

.medium-zoom-image {
    z-index: 999;
    -webkit-transform: translateZ(0);
    -webkit-backface-visibility: hidden;
    -webkit-transform-style: preserve-3d;
}

html.dark .medium-zoom-overlay {
    backdrop-filter: blur(2.5rem) brightness(0.85);
}

.medium-zoom-overlay,
.medium-zoom-image--opened {
    z-index: 999;
}
</style>
