import type { PizzaVisual } from '~/types/pizza'
import { ORDEM_CAMADAS } from '~/data/ingredientes'
import { desenharIngrediente } from './ingredientes'
import { criarRng } from './rng'

export const TAM_TEXTURA = 1024

const TAU = Math.PI * 2

export function pintarPizza(canvas: HTMLCanvasElement, v: PizzaVisual) {
  const S = TAM_TEXTURA
  const c = S / 2
  const R = S / 2 - 6
  const g = canvas.getContext('2d')
  if (!g) return
  const n = v.qtd
  const passo = TAU / n

  g.setTransform(1, 0, 0, 1, 0, 0)
  g.clearRect(0, 0, S, S)

  g.fillStyle = '#a3261a'
  g.beginPath(); g.arc(c, c, R, 0, TAU); g.fill()

  g.save()
  g.beginPath(); g.arc(c, c, R * 0.965, 0, TAU); g.clip()
  const grad = g.createRadialGradient(c, c, 40, c, c, R)
  grad.addColorStop(0, '#f6d272'); grad.addColorStop(1, '#ecb548')
  g.fillStyle = grad; g.fillRect(0, 0, S, S)
  const rnd = criarRng(7)
  const manchas = ['rgba(250,224,140,0.4)', 'rgba(232,166,58,0.35)', 'rgba(244,198,90,0.4)', 'rgba(205,128,40,0.28)', 'rgba(176,52,30,0.16)']
  for (let i = 0; i < 170; i++) {
    g.fillStyle = manchas[Math.floor(rnd() * manchas.length)]!
    g.beginPath(); g.ellipse(rnd() * S, rnd() * S, 18 + rnd() * 60, 14 + rnd() * 44, rnd() * 3, 0, TAU); g.fill()
  }
  g.restore()

  const setor = (i: number) => {
    g.beginPath()
    if (n === 1) {
      g.arc(c, c, R, 0, TAU)
    } else {
      const a0 = -Math.PI / 2 + i * passo
      g.moveTo(c, c); g.arc(c, c, R, a0, a0 + passo); g.closePath()
    }
  }

  for (let i = 0; i < n; i++) {
    const a0 = -Math.PI / 2 + i * passo
    const a1 = a0 + passo
    const sabor = v.partes[i] ?? null
    g.save(); setor(i); g.clip()
    if (sabor) {
      sabor.ingredientes
        .slice()
        .sort((x, y) => ORDEM_CAMADAS.indexOf(x) - ORDEM_CAMADAS.indexOf(y))
        .forEach((id, j) => desenharIngrediente(g, id, i * 97 + j * 13 + sabor.id * 7, a0, a1, R * 0.95, n))
    } else {
      g.fillStyle = 'rgba(60,28,10,0.22)'; g.fillRect(0, 0, S, S)
      const meio = a0 + passo / 2
      const rr = n === 1 ? 0 : R * 0.55
      const x = c + Math.cos(meio) * rr
      const y = c + Math.sin(meio) * rr
      g.fillStyle = 'rgba(255,250,240,0.94)'; g.beginPath(); g.arc(x, y, 50, 0, TAU); g.fill()
      g.strokeStyle = '#7a2a18'; g.lineWidth = 10; g.lineCap = 'round'
      g.beginPath(); g.moveTo(x - 22, y); g.lineTo(x + 22, y); g.moveTo(x, y - 22); g.lineTo(x, y + 22); g.stroke()
    }
    if (i === v.destaque) { g.fillStyle = 'rgba(255,255,255,0.17)'; g.fillRect(0, 0, S, S) }
    g.restore()
  }

  if (n > 1) {
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + i * passo
      g.lineCap = 'round'
      g.strokeStyle = 'rgba(90,30,10,0.6)'; g.lineWidth = 7
      g.beginPath(); g.moveTo(c, c); g.lineTo(c + Math.cos(a) * R, c + Math.sin(a) * R); g.stroke()
      g.strokeStyle = 'rgba(255,225,160,0.35)'; g.lineWidth = 2
      g.beginPath(); g.moveTo(c + 3, c + 3); g.lineTo(c + 3 + Math.cos(a) * R, c + 3 + Math.sin(a) * R); g.stroke()
    }
  }

  if (v.destaque >= 0 && v.destaque < n) {
    g.save(); setor(v.destaque); g.clip(); setor(v.destaque)
    g.strokeStyle = '#ffffff'; g.lineWidth = 22; g.setLineDash([26, 18]); g.stroke()
    g.restore()
  }
}

export function parteNoPonto(px: number, py: number, qtd: number): number {
  let a = Math.atan2(py, px) + Math.PI / 2
  if (a < 0) a += TAU
  return Math.min(qtd - 1, Math.floor(a / (TAU / qtd)))
}
