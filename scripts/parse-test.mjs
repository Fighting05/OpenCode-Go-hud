import { parseUsage } from '../dist/api.js';

// 1. Inline hydration with $R[n]= prefix (the real page format)
const html1 = `<html><body><script>
const A = { rollingUsage: $R[31] = { status: 'ok', resetInSec: 18000, usagePercent: 12 }, weeklyUsage: $R[32] = { status: 'ok', resetInSec: 604800, usagePercent: 7 }, monthlyUsage: $R[33] = { status: 'ok', resetInSec: 2592000, usagePercent: 3 } };
</script></body></html>`;
console.log('case1 inline+prefix :', JSON.stringify(parseUsage(html1)));

// 2. Inline without prefix
const html2 = `<script>rollingUsage:{ status:'ok', resetInSec:18000, usagePercent:12 }</script>`;
console.log('case2 inline bare   :', JSON.stringify(parseUsage(html2)));

// 3. DOM fallback (3 usage-item slots in order)
const html3 = `<div data-slot="usage-item"><span data-slot="usage-value">12</span><span data-slot="reset-time">重置于 5 小时</span></div><div data-slot="usage-item"><span data-slot="usage-value">7</span><span data-slot="reset-time">重置于 3 天 16 小时</span></div><div data-slot="usage-item"><span data-slot="usage-value">3</span><span data-slot="reset-time">重置于 29 天 22 小时</span></div>`;
console.log('case3 dom           :', JSON.stringify(parseUsage(html3)));

// 4. Mixed: DOM for weekly/monthly, inline for rolling (inline wins)
const html4 = html3 + `<script>rollingUsage:{ status:'ok', resetInSec:999, usagePercent:12 }</script>`;
console.log('case4 mixed         :', JSON.stringify(parseUsage(html4)));
