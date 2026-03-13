<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

interface FrameworkResult {
  name: string
  runtime: string
  reqsPerSec: number
  color: string
  gradient: string
}

const props = defineProps<{
  results: FrameworkResult[]
  compareTo?: string
  date?: string
  methodology?: string
}>()

const visible = ref(false)
onMounted(() => {
  setTimeout(() => { visible.value = true }, 200)
})

const sorted = computed(() =>
  [...props.results].sort((a, b) => b.reqsPerSec - a.reqsPerSec)
)

const maxRps = computed(() => sorted.value[0]?.reqsPerSec ?? 1)

const primary = computed(() => sorted.value[0])

const base = computed(() =>
  props.compareTo
    ? sorted.value.find(r => r.name === props.compareTo) ?? sorted.value[0]
    : sorted.value[0]
)

const comparisons = computed(() =>
  sorted.value
    .filter(r => r.name !== base.value.name && r.name !== 'Elysia')
    .filter(r => base.value.reqsPerSec > r.reqsPerSec)
    .map(r => ({
      name: r.name,
      runtime: r.runtime,
      multiplier: (base.value.reqsPerSec / r.reqsPerSec).toFixed(1),
    }))
)

function formatNumber(n: number): string {
  return n.toLocaleString('en-US')
}

function barWidth(rps: number): string {
  return `${(rps / maxRps.value) * 100}%`
}
</script>

<template>
  <div class="perf-wrapper">
    <div class="perf-card">

      <!-- Comparisons -->
      <div v-if="comparisons.length" class="perf-comparisons">
        <div
          v-for="(c, i) in comparisons.slice(0, 3)"
          :key="c.name"
          class="perf-cmp"
          :class="{ 'perf-cmp--visible': visible }"
          :style="{ transitionDelay: `${i * 150 + 400}ms` }"
        >
          <span class="cmp-multiplier">{{ c.multiplier }}x</span>
          <span class="cmp-label">
            faster than {{ c.name }}
          </span>
        </div>
      </div>

      <!-- Bar chart -->
      <div class="perf-chart">
        <div
          v-for="(r, i) in sorted"
          :key="r.name"
          class="perf-row"
          :class="{ 'perf-row--visible': visible }"
          :style="{ transitionDelay: `${i * 100}ms` }"
        >
          <div class="row-label">
            <span class="row-name" :style="{ color: r.color }">{{ r.name }}</span>
            <span class="row-runtime">{{ r.runtime }}</span>
          </div>
          <div class="row-bar-track">
            <div
              class="row-bar"
              :style="{
                width: visible ? barWidth(r.reqsPerSec) : '0%',
                background: r.gradient,
                transitionDelay: `${i * 100 + 200}ms`,
              }"
            />
          </div>
          <div class="row-value">
            {{ formatNumber(r.reqsPerSec) }}
            <span class="row-unit">reqs/s</span>
          </div>
        </div>
      </div>

      <!-- Footnote -->
      <div v-if="methodology || date" class="perf-footnote">
        <span v-if="methodology">{{ methodology }}</span>
        <span v-if="date"> &middot; {{ date }}</span>
      </div>

    </div>
  </div>
</template>

<style scoped>
.perf-wrapper {
  margin: 32px 0;
}

.perf-card {
  border-radius: 16px;
  padding: 40px 36px 32px;
  background: #1a1625;
  border: 1px solid rgba(124, 58, 237, 0.15);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

/* Light mode: keep dark card for contrast */
:root:not(.dark) .perf-card {
  background: #1a1625;
  border-color: rgba(124, 58, 237, 0.2);
}

/* ── Comparisons ─────────────────────────── */
.perf-comparisons {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 36px;
  padding-bottom: 28px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.perf-cmp {
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.perf-cmp--visible {
  opacity: 1;
  transform: translateY(0);
}

.cmp-multiplier {
  font-size: 42px;
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1;
  background: linear-gradient(135deg, #c084fc, #f472b6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: block;
  margin-bottom: 4px;
}

.cmp-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
  letter-spacing: 0.01em;
}

/* ── Chart ────────────────────────────────── */
.perf-chart {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.perf-row {
  display: grid;
  grid-template-columns: 140px 1fr auto;
  align-items: center;
  gap: 16px;
  opacity: 0;
  transform: translateX(-8px);
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.perf-row--visible {
  opacity: 1;
  transform: translateX(0);
}

.row-label {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}

.row-name {
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
}

.row-runtime {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.row-bar-track {
  height: 28px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.03);
  overflow: hidden;
  position: relative;
}

.row-bar {
  height: 100%;
  border-radius: 6px;
  transition: width 1s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}

/* Subtle shine on bars */
.row-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(to bottom, rgba(255,255,255,0.15), transparent);
  border-radius: 6px 6px 0 0;
}

.row-value {
  font-size: 15px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
  min-width: 150px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.row-unit {
  font-size: 12px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.35);
  margin-left: 4px;
}

/* ── Footnote ────────────────────────────── */
.perf-footnote {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  line-height: 1.5;
}

/* ── Responsive ──────────────────────────── */
@media (max-width: 768px) {
  .perf-card {
    padding: 28px 20px 24px;
  }
  .perf-row {
    grid-template-columns: 100px 1fr auto;
    gap: 10px;
  }
  .row-name {
    font-size: 13px;
  }
  .row-value {
    font-size: 13px;
    min-width: 100px;
  }
  .cmp-multiplier {
    font-size: 32px;
  }
  .perf-comparisons {
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .perf-row {
    grid-template-columns: 80px 1fr;
    gap: 8px;
  }
  .row-value {
    grid-column: 1 / -1;
    text-align: left;
    min-width: auto;
    font-size: 12px;
  }
}
</style>
