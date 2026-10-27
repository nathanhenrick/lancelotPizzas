import {
  BufferAttribute, CanvasTexture, Color, DoubleSide, Group, LatheGeometry, Mesh, MeshStandardMaterial, Object3D, SRGBColorSpace, Vector2
} from 'three'
import { criarRng } from './rng'

export const MAX_ESFIRRAS_NA_CENA = 12

export function coresDasUnidades(lista: { cor: number, quantidade: number }[]): number[] {
  const restantes = lista.map((e) => ({ cor: e.cor, q: e.quantidade }))
  const saida: number[] = []
  while (saida.length < MAX_ESFIRRAS_NA_CENA && restantes.some((r) => r.q > 0)) {
    for (const r of restantes) {
      if (r.q > 0 && saida.length < MAX_ESFIRRAS_NA_CENA) {
        saida.push(r.cor)
        r.q--
      }
    }
  }
  return saida
}

export interface PosicaoEsfirra { x: number, z: number, r: number }

const anel = (n: number, R: number, r: number, inicio = -Math.PI / 2): PosicaoEsfirra[] =>
  Array.from({ length: n }, (_, i) => {
    const a = inicio + (i / n) * Math.PI * 2
    return { x: Math.cos(a) * R, z: Math.sin(a) * R, r }
  })

export function posicoesEsfirras(n: number): PosicaoEsfirra[] {
  if (n <= 0) return []
  if (n === 1) return [{ x: 0, z: 0, r: 1.05 }]
  if (n === 2) return [{ x: -0.98, z: 0.05, r: 0.9 }, { x: 0.98, z: -0.05, r: 0.9 }]
  if (n === 3) return anel(3, 1.0, 0.8)
  if (n === 4) return anel(4, 1.0, 0.66, Math.PI / 4)
  if (n === 5) return anel(5, 1.15, 0.62)
  if (n === 6) return anel(6, 1.3, 0.62)
  if (n === 7) return [{ x: 0, z: 0, r: 0.58 }, ...anel(6, 1.4, 0.58)]
  const externas = anel(8, 1.55, 0.5)
  const m = n - 8
  if (m === 0) return externas
  if (m === 1) return [...externas, { x: 0, z: 0, r: 0.5 }]
  if (m === 2) return [...externas, { x: -0.55, z: 0, r: 0.46 }, { x: 0.55, z: 0, r: 0.46 }]
  return [...externas, ...anel(m, m === 3 ? 0.6 : 0.65, 0.45)]
}

const clara = (cor: number) => {
  const r = (cor >> 16) & 255
  const g = (cor >> 8) & 255
  const b = cor & 255
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 150
}

const hex = (c: number) => `#${c.toString(16).padStart(6, '0')}`

const tom = (cor: number, fator: number) => {
  const canal = (v: number) => Math.max(0, Math.min(255, Math.round(v * fator)))
  return (canal((cor >> 16) & 255) << 16) | (canal((cor >> 8) & 255) << 8) | canal(cor & 255)
}

function texturaRecheio(cor: number, semente: number): CanvasTexture {
  const T = 256
  const cv = document.createElement('canvas')
  cv.width = T; cv.height = T
  const g = cv.getContext('2d')!
  const rnd = criarRng(semente)
  g.fillStyle = hex(cor)
  g.fillRect(0, 0, T, T)
  const grao = (c: number, qtd: number, raio: number, alfa: number) => {
    g.fillStyle = hex(c)
    g.globalAlpha = alfa
    for (let i = 0; i < qtd; i++) {
      g.beginPath()
      g.ellipse(rnd() * T, rnd() * T, raio * (0.6 + rnd() * 0.8), raio * (0.5 + rnd() * 0.6), rnd() * 3, 0, Math.PI * 2)
      g.fill()
    }
    g.globalAlpha = 1
  }
  grao(tom(cor, 0.72), 140, 6, 0.55)
  grao(tom(cor, 1.25), 90, 5, 0.5)
  if (clara(cor)) {
    grao(0xd99a2b, 18, 15, 0.45)
    grao(0xfff3c4, 20, 9, 0.5)
  } else {
    grao(0xc23a2a, 16, 11, 0.95)
    grao(0xe9604f, 16, 5, 0.8)
    grao(0xf0e2c2, 12, 7, 0.8)
    grao(0x4b9a3f, 38, 4, 0.9)
  }
  const tex = new CanvasTexture(cv)
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

const PERFIL: [number, number][] = [
  [0, 0], [0.97, 0], [1.04, 0.05], [1.08, 0.14], [1.05, 0.25], [0.96, 0.29], [0.86, 0.25], [0.78, 0.19], [0, 0.18]
]
const ALTURA_BORDA = 0.29

function massaIrregular(semente: number): LatheGeometry {
  const geo = new LatheGeometry(PERFIL.map(([r, y]) => new Vector2(r, y)), 64)
  const pos = geo.attributes.position!
  const cores = new Float32Array(pos.count * 3)
  const claro = new Color(0xe3b273)
  const dourado = new Color(0xb9722f)
  const tmp = new Color()
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    const th = Math.atan2(z, x)
    const k = 1 + Math.sin(th * 5 + semente) * 0.025 + Math.sin(th * 9 + 1 + semente) * 0.015
    pos.setXYZ(i, x * k, y * (1 + Math.sin(th * 7 + semente) * 0.12), z * k)
    tmp.copy(claro).lerp(dourado, Math.min(1, (y / ALTURA_BORDA) ** 2))
    cores.set([tmp.r, tmp.g, tmp.b], i * 3)
  }
  geo.setAttribute('color', new BufferAttribute(cores, 3))
  geo.computeVertexNormals()
  return geo
}

function recheioEmCupula(semente: number): LatheGeometry {
  const R = 0.82
  const pontos: Vector2[] = []
  for (let i = 0; i <= 14; i++) {
    const r = R * (1 - i / 14)
    pontos.push(new Vector2(r, 0.18 + 0.15 * Math.sqrt(Math.max(0, 1 - (r / R) ** 2))))
  }
  const geo = new LatheGeometry(pontos, 48)
  const pos = geo.attributes.position!
  const uv = geo.attributes.uv!
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    const monte = Math.sin(x * 9 + semente) * Math.cos(z * 8 + semente * 2) * 0.014
    pos.setY(i, pos.getY(i) + (Math.hypot(x, z) < R - 0.02 ? monte : 0))
    uv.setXY(i, x / (2 * R) + 0.5, z / (2 * R) + 0.5)
  }
  geo.computeVertexNormals()
  return geo
}

export function criarEsfirra3d(cor: number, semente: number): Group {
  const grupo = new Group()
  const massa = new Mesh(
    massaIrregular(semente),
    new MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0, side: DoubleSide })
  )
  massa.castShadow = true
  massa.receiveShadow = true
  const recheio = new Mesh(
    recheioEmCupula(semente),
    new MeshStandardMaterial({ map: texturaRecheio(cor, 90 + semente * 17), roughness: 1, metalness: 0 })
  )
  recheio.rotation.y = semente * 0.9
  recheio.castShadow = true
  recheio.receiveShadow = true
  grupo.add(massa, recheio)
  return grupo
}

export function liberarEsfirras(grupo: Object3D) {
  grupo.traverse((obj) => {
    if (!(obj instanceof Mesh)) return
    obj.geometry.dispose()
    const mat = obj.material as MeshStandardMaterial
    mat.map?.dispose()
    mat.dispose()
  })
  grupo.clear()
}
