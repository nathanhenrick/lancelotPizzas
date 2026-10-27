import { INGREDIENTES } from '~/data/ingredientes'
import { criarRng } from './rng'

type Ctx = CanvasRenderingContext2D
interface Ponto { x: number, y: number, rot: number, k: number }

const TAU = Math.PI * 2
const C = 512

function sombra(g: Ctx, ligada: boolean) {
  g.shadowColor = ligada ? 'rgba(60,20,0,0.5)' : 'transparent'
  g.shadowBlur = ligada ? 10 : 0
  g.shadowOffsetY = ligada ? 5 : 0
}

function retArredondado(g: Ctx, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath()
  g.moveTo(x + r, y)
  g.arcTo(x + w, y, x + w, y + h, r)
  g.arcTo(x + w, y + h, x, y + h, r)
  g.arcTo(x, y + h, x, y, r)
  g.arcTo(x, y, x + w, y, r)
  g.closePath()
}

function espalhar(semente: number, a0: number, a1: number, R: number, qtd: number, margem: number): Ponto[] {
  const rnd = criarRng(semente + 1)
  const pts: Ponto[] = []
  const inteira = a1 - a0 > 6.2
  let tentativas = 0
  while (pts.length < qtd && tentativas < qtd * 40) {
    tentativas++
    const r = R * Math.sqrt(rnd())
    const a = a0 + rnd() * (a1 - a0)
    if (r > R - margem) continue
    if (!inteira && (r * Math.sin(Math.min(a - a0, 1.57)) < margem * 0.9 || r * Math.sin(Math.min(a1 - a, 1.57)) < margem * 0.9)) continue
    const x = C + r * Math.cos(a)
    const y = C + r * Math.sin(a)
    if (pts.some((p) => Math.hypot(p.x - x, p.y - y) < margem * 1.75)) continue
    pts.push({ x, y, rot: rnd() * TAU, k: rnd() })
  }
  return pts
}

const PECAS: Record<string, (g: Ctx, m: number, k: number) => void> = {
  calabresa: (g, m, k) => embutido(g, m, k, '#9c2f1e', '#b9452c', 'rgba(236,180,150,0.75)', '#6f1c12'),
  pepperoni: (g, m, k) => embutido(g, m, k, '#b8281c', '#cf3b2a', 'rgba(240,150,120,0.6)', '#8a1a12'),
  cebola(g, m) {
    g.strokeStyle = 'rgba(252,246,232,0.95)'; g.lineWidth = 7; g.lineCap = 'round'
    g.beginPath(); g.arc(0, 0, m * 0.8, 0, 4.6); g.stroke(); sombra(g, false)
    g.strokeStyle = 'rgba(190,140,185,0.55)'; g.lineWidth = 2
    g.beginPath(); g.arc(0, 0, m * 0.8 + 3, 0, 4.6); g.stroke()
  },
  bacon(g, m) {
    g.fillStyle = '#962b22'; retArredondado(g, -m * 1.15, -m * 0.34, m * 2.3, m * 0.68, 7); g.fill(); sombra(g, false)
    g.strokeStyle = '#e9bda6'; g.lineWidth = 4; g.beginPath()
    g.moveTo(-m, -m * 0.1); g.quadraticCurveTo(0, -m * 0.3, m, -m * 0.08)
    g.moveTo(-m, m * 0.16); g.quadraticCurveTo(0, m * 0.02, m, m * 0.18); g.stroke()
  },
  frango(g, m) {
    g.fillStyle = '#f1dfc0'; g.beginPath(); g.ellipse(0, 0, m, m * 0.5, 0, 0, TAU); g.fill(); sombra(g, false)
    g.fillStyle = '#e3c89e'; g.beginPath(); g.ellipse(m * 0.2, m * 0.1, m * 0.55, m * 0.2, 0.4, 0, TAU); g.fill()
    g.fillStyle = '#faf0dc'; g.beginPath(); g.ellipse(-m * 0.25, -m * 0.12, m * 0.4, m * 0.16, -0.3, 0, TAU); g.fill()
  },
  tomate(g, m) {
    g.fillStyle = '#cf3d2a'; g.beginPath(); g.arc(0, 0, m, 0, TAU); g.fill(); sombra(g, false)
    g.fillStyle = '#e8684c'; g.beginPath(); g.arc(0, 0, m * 0.8, 0, TAU); g.fill()
    g.fillStyle = '#f4b860'
    for (let i = 0; i < 5; i++) {
      const a = (i * TAU) / 5
      g.beginPath(); g.ellipse(Math.cos(a) * m * 0.45, Math.sin(a) * m * 0.45, m * 0.2, m * 0.11, a, 0, TAU); g.fill()
    }
  },
  manjericao(g, m) {
    g.fillStyle = '#3c8a3a'; g.beginPath(); g.moveTo(-m, 0)
    g.quadraticCurveTo(0, -m * 0.75, m, 0); g.quadraticCurveTo(0, m * 0.75, -m, 0); g.fill(); sombra(g, false)
    g.strokeStyle = '#27622a'; g.lineWidth = 3; g.beginPath(); g.moveTo(-m * 0.85, 0); g.lineTo(m * 0.85, 0); g.stroke()
  },
  azeitona(g, m) {
    g.strokeStyle = '#1e1a1c'; g.lineWidth = m * 0.6; g.beginPath(); g.arc(0, 0, m * 0.68, 0, TAU); g.stroke(); sombra(g, false)
    g.strokeStyle = 'rgba(255,255,255,0.3)'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, m * 0.8, 3.6, 5); g.stroke()
  },
  presunto(g, m) {
    g.fillStyle = '#e59595'; retArredondado(g, -m * 0.8, -m * 0.8, m * 1.6, m * 1.6, 6); g.fill(); sombra(g, false)
    g.fillStyle = '#f0b3b0'; retArredondado(g, -m * 0.6, -m * 0.6, m, m * 0.9, 5); g.fill()
  },
  ovo(g, m) {
    g.fillStyle = '#fbf8ee'; g.beginPath(); g.arc(0, 0, m, 0, TAU); g.fill(); sombra(g, false)
    g.fillStyle = '#f2b632'; g.beginPath(); g.arc(m * 0.05, 0, m * 0.5, 0, TAU); g.fill()
    g.fillStyle = '#f8cf5e'; g.beginPath(); g.arc(-m * 0.08, -m * 0.12, m * 0.2, 0, TAU); g.fill()
  },
  milho(g, m) {
    g.fillStyle = '#f7d038'; g.beginPath(); g.ellipse(0, 0, m, m * 0.78, 0, 0, TAU); g.fill(); sombra(g, false)
    g.fillStyle = '#fdeb8a'; g.beginPath(); g.arc(-m * 0.25, -m * 0.2, m * 0.3, 0, TAU); g.fill()
  },
  champignon(g, m) {
    g.fillStyle = '#eadcc4'; g.beginPath(); g.arc(0, -m * 0.1, m * 0.9, Math.PI, 0)
    g.quadraticCurveTo(m * 0.5, m * 0.15, m * 0.28, m * 0.2); g.lineTo(m * 0.3, m * 0.85)
    g.quadraticCurveTo(0, m, -m * 0.3, m * 0.85); g.lineTo(-m * 0.28, m * 0.2)
    g.quadraticCurveTo(-m * 0.5, m * 0.15, -m * 0.9, -m * 0.1); g.fill(); sombra(g, false)
    g.strokeStyle = '#a58a68'; g.lineWidth = 3; g.beginPath(); g.arc(0, -m * 0.1, m * 0.62, Math.PI * 1.1, Math.PI * 1.9); g.stroke()
  },
  mussarela(g, m) {
    sombra(g, false)
    const gd = g.createRadialGradient(0, 0, 4, 0, 0, m)
    gd.addColorStop(0, 'rgba(255,246,216,0.95)'); gd.addColorStop(0.7, 'rgba(255,240,200,0.7)'); gd.addColorStop(1, 'rgba(255,236,190,0)')
    g.fillStyle = gd; g.beginPath(); g.ellipse(0, 0, m, m * 0.8, 0, 0, TAU); g.fill()
  },
  chocolate(g, m) {
    sombra(g, false)
    const gd = g.createRadialGradient(0, 0, 4, 0, 0, m)
    gd.addColorStop(0, 'rgba(92,48,26,0.96)'); gd.addColorStop(0.75, 'rgba(78,38,20,0.85)'); gd.addColorStop(1, 'rgba(70,34,18,0)')
    g.fillStyle = gd; g.beginPath(); g.ellipse(0, 0, m, m * 0.85, 0, 0, TAU); g.fill()
  },
  banana(g, m) {
    g.fillStyle = '#f0d98a'; g.beginPath(); g.arc(0, 0, m, 0, TAU); g.fill(); sombra(g, false)
    g.fillStyle = '#fbeebc'; g.beginPath(); g.arc(0, 0, m * 0.78, 0, TAU); g.fill()
    g.fillStyle = '#d9b865'; g.beginPath(); g.arc(0, 0, m * 0.12, 0, TAU); g.fill()
  },
  morango(g, m) {
    g.fillStyle = '#c91d38'; g.beginPath(); g.moveTo(0, m * 0.95)
    g.bezierCurveTo(-m * 1.1, m * 0.2, -m * 0.85, -m * 0.8, 0, -m * 0.6)
    g.bezierCurveTo(m * 0.85, -m * 0.8, m * 1.1, m * 0.2, 0, m * 0.95); g.fill(); sombra(g, false)
    g.fillStyle = '#ee6a7c'; g.beginPath(); g.ellipse(0, m * 0.05, m * 0.38, m * 0.5, 0, 0, TAU); g.fill()
    g.fillStyle = '#4c8a3a'; g.beginPath(); g.ellipse(0, -m * 0.55, m * 0.4, m * 0.14, 0, 0, TAU); g.fill()
  },
  canela(g, m) {
    sombra(g, false); g.fillStyle = 'rgba(138,86,40,0.85)'; g.fillRect(-m, -m * 0.6, m * 2, m * 1.2)
  },
  granulado(g, m) {
    sombra(g, false); g.fillStyle = '#4a2a18'; retArredondado(g, -m, -m * 0.28, m * 2, m * 0.56, 2); g.fill()
  },
  gorgonzola(g, m) {
    g.fillStyle = '#e6ead9'; g.beginPath(); g.ellipse(0, 0, m, m * 0.8, 0, 0, TAU); g.fill(); sombra(g, false)
    g.fillStyle = '#5f8a86'; g.beginPath(); g.arc(m * 0.2, 0, m * 0.25, 0, TAU); g.fill()
    g.beginPath(); g.arc(-m * 0.35, m * 0.15, m * 0.18, 0, TAU); g.fill()
  },
  parmesao(g, m) {
    sombra(g, false); g.fillStyle = 'rgba(255,244,204,0.9)'; g.fillRect(-m, -m * 0.5, m * 2.4, m)
  },
  oregano(g, m) {
    sombra(g, false); g.fillStyle = '#4a652c'; g.fillRect(-m, -m * 0.6, m * 2, m * 1.2)
  }
}

function embutido(g: Ctx, m: number, k: number, base: string, miolo: string, gordura: string, casca: string) {
  g.fillStyle = base; g.beginPath(); g.arc(0, 0, m, 0, TAU); g.fill(); sombra(g, false)
  g.fillStyle = miolo; g.beginPath(); g.arc(-m * 0.1, -m * 0.12, m * 0.78, 0, TAU); g.fill()
  g.fillStyle = gordura
  for (let i = 0; i < 7; i++) {
    const a = i * 0.9 + k * 6
    const r = m * (0.2 + ((i * 37) % 10) / 20)
    g.beginPath(); g.arc(Math.cos(a) * r, Math.sin(a) * r, m * 0.08, 0, TAU); g.fill()
  }
  g.strokeStyle = casca; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, m - 1.5, 0, TAU); g.stroke()
}

function fiosDeCatupiry(g: Ctx, a0: number, a1: number, R: number, partes: number) {
  sombra(g, true)
  g.strokeStyle = '#fff6dc'; g.lineWidth = 20; g.lineCap = 'round'; g.lineJoin = 'round'
  ;[0.24, 0.44, 0.63, 0.82].forEach((fr, j) => {
    const rr = R * fr
    const folga = partes === 1 ? 0 : Math.min(0.12 / fr, (a1 - a0) / 2.4)
    g.beginPath()
    for (let t = 0; t <= 60; t++) {
      const a = a0 + folga + (a1 - a0 - 2 * folga) * (t / 60)
      const r2 = rr + Math.sin(a * 9 + j * 2) * 14
      const x = C + r2 * Math.cos(a)
      const y = C + r2 * Math.sin(a)
      if (t === 0) g.moveTo(x, y)
      else g.lineTo(x, y)
    }
    g.stroke()
  })
  sombra(g, false)
}

export function desenharIngrediente(g: Ctx, id: string, semente: number, a0: number, a1: number, R: number, partes: number) {
  const def = INGREDIENTES[id]
  if (!def) return
  if (id === 'catupiry') {
    fiosDeCatupiry(g, a0, a1, R, partes)
    return
  }
  const peca = PECAS[id]
  if (!peca) return
  const pontos = espalhar(semente, a0, a1, R, Math.max(1, Math.round(def.qtd / partes)), def.raio)
  for (const p of pontos) {
    g.save()
    g.translate(p.x, p.y)
    g.rotate(p.rot)
    sombra(g, true)
    peca(g, def.raio * (0.88 + p.k * 0.22), p.k)
    g.restore()
  }
}
