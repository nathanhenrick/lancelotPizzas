import {
  BoxGeometry, CanvasTexture, Color, CatmullRomCurve3, CircleGeometry, CylinderGeometry, DoubleSide, Group,
  LatheGeometry, Mesh, MeshBasicMaterial, MeshStandardMaterial,
  RepeatWrapping, Sprite, SpriteMaterial, SRGBColorSpace, TorusGeometry, TubeGeometry,
  Vector2, Vector3
} from 'three'
import type { ModeloBebida } from '~/types/pizza'
import { MODELOS_BEBIDA } from '~/data/bebidas'
import { criarRng } from './rng'

export const CM = 1 / 9.5

export interface Bebida3D {
  grupo: Group
  largura: number
  esquerda: number
  raio: number
  altura: number
}

type Perfil = [raio: number, altura: number][]

const torneado = (perfil: Perfil) => new LatheGeometry(perfil.map(([r, y]) => new Vector2(r * CM, y * CM)), 56)

const ehClara = (cor: number) => {
  const r = (cor >> 16) & 255
  const g = (cor >> 8) & 255
  const b = cor & 255
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 190
}

function comContorno(mat: MeshStandardMaterial, forca: number) {
  mat.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `#include <dithering_fragment>
      float borda = pow(1.0 - abs(dot(normalize(normal), normalize(vViewPosition))), 2.6);
      gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.42, 0.47, 0.52), borda * ${forca.toFixed(2)});
      gl_FragColor.a = max(gl_FragColor.a, borda * ${(forca * 0.85).toFixed(2)});`
    )
  }
  return mat
}

const vidro = () => comContorno(new MeshStandardMaterial({
  color: 0xeef7ff, transparent: true, opacity: 0.22, roughness: 0.06, metalness: 0.1,
  side: DoubleSide, depthWrite: false
}), 0.8)
const pet = () => comContorno(new MeshStandardMaterial({
  color: 0xf4fbff, transparent: true, opacity: 0.16, roughness: 0.12, metalness: 0,
  side: DoubleSide, depthWrite: false
}), 0.65)

const vidroColorido = (cor: number) => comContorno(new MeshStandardMaterial({
  color: cor, transparent: true, opacity: ehClara(cor) ? 0.3 : 0.55, roughness: 0.08, metalness: 0.1,
  side: DoubleSide, depthWrite: false
}), 0.7)

const liquido = (cor: number) => new MeshStandardMaterial({
  color: cor, transparent: true, opacity: ehClara(cor) ? 0.38 : 0.9, roughness: 0.18, metalness: 0
})

const PERFIL_PET: Perfil = [
  [0, 0], [3.9, 0], [4.8, 0.5], [5.25, 1.8], [5.25, 6], [4.85, 7.4], [5.25, 8.8],
  [5.25, 20], [5.0, 22], [3.6, 26], [1.7, 29.4], [1.45, 30], [1.45, 31.2], [0, 31.2]
]

const reescalar = (perfil: Perfil, altura: number, raio: number): Perfil => {
  const h = perfil.reduce((m, [, y]) => Math.max(m, y), 0)
  const r = perfil.reduce((m, [x]) => Math.max(m, x), 0)
  return perfil.map(([x, y]) => [x * (raio / r), y * (altura / h)])
}

const preencher = (perfil: Perfil, nivel: number, fundo = 0.4): Perfil => {
  const pontos: Perfil = [[0, fundo]]
  for (let i = 0; i < perfil.length - 1; i++) {
    const [r0, y0] = perfil[i]!
    const [r1, y1] = perfil[i + 1]!
    if (y0 >= fundo && y0 <= nivel) pontos.push([r0 * 0.92, y0])
    if ((y0 - nivel) * (y1 - nivel) < 0) pontos.push([(r0 + (r1 - r0) * ((nivel - y0) / (y1 - y0))) * 0.92, nivel])
  }
  pontos.push([0, nivel])
  return pontos.filter(([r]) => r >= 0)
}

function texturaSuor(semente: number): CanvasTexture {
  const T = 256
  const cv = document.createElement('canvas')
  cv.width = T; cv.height = T
  const g = cv.getContext('2d')!
  const rnd = criarRng(semente)

  g.fillStyle = 'rgba(255,255,255,0.07)'
  g.fillRect(0, 0, T, T)

  const filetes: [number, number, number][] = []
  for (let i = 0; i < 3; i++) filetes.push([rnd() * T, rnd() * T * 0.6, 50 + rnd() * 140])
  g.globalCompositeOperation = 'destination-out'
  for (const [x, y, comp] of filetes) {
    g.lineWidth = 4
    g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + 3, y + comp * 0.3, x - 3, y + comp * 0.7, x + 1, y + comp); g.stroke()
  }
  g.globalCompositeOperation = 'source-over'

  const gotinha = (x: number, y: number, r: number) => {
    g.fillStyle = 'rgba(255,255,255,0.2)'
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill()
    g.fillStyle = 'rgba(30,45,60,0.22)'
    g.beginPath(); g.arc(x, y + r * 0.35, r * 0.75, 0.15 * Math.PI, 0.85 * Math.PI); g.fill()
    g.fillStyle = 'rgba(255,255,255,0.85)'
    g.beginPath(); g.arc(x - r * 0.35, y - r * 0.35, Math.max(0.5, r * 0.28), 0, Math.PI * 2); g.fill()
  }
  for (let i = 0; i < 260; i++) {
    const r = rnd() < 0.85 ? 0.8 + rnd() * 1.6 : 2.4 + rnd() * 2.8
    gotinha(rnd() * T, rnd() * T, r)
  }

  for (const [x, y, comp] of filetes) {
    g.strokeStyle = 'rgba(255,255,255,0.4)'
    g.lineWidth = 1.6
    g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + 3, y + comp * 0.3, x - 3, y + comp * 0.7, x + 1, y + comp); g.stroke()
    gotinha(x + 1, y + comp, 4.2)
  }

  const tex = new CanvasTexture(cv)
  tex.colorSpace = SRGBColorSpace
  tex.wrapS = RepeatWrapping
  tex.wrapT = RepeatWrapping
  tex.anisotropy = 4
  return tex
}

function suor(perfil: Perfil, ate: number, semente: number): Mesh {
  const camada = perfil.filter(([, y]) => y <= ate).map(([r, y]) => [r + 0.03, y] as [number, number])
  const seguinte = perfil.find(([, y]) => y > ate)
  const ultimo = perfil.filter(([, y]) => y <= ate).at(-1)
  if (seguinte && ultimo && ultimo[1] < ate) {
    camada.push([ultimo[0] + (seguinte[0] - ultimo[0]) * ((ate - ultimo[1]) / (seguinte[1] - ultimo[1])) + 0.03, ate])
  }
  const maiorRaio = camada.reduce((m, [r]) => Math.max(m, r), 0)
  const tex = texturaSuor(semente)
  tex.repeat.set(Math.max(1, Math.round((2 * Math.PI * maiorRaio) / 12)), Math.max(1, ate / 12))
  const malha = new Mesh(torneado(camada), new MeshStandardMaterial({
    map: tex, transparent: true, roughness: 0.08, metalness: 0.1, depthWrite: false
  }))
  malha.renderOrder = 2
  return malha
}

function gelo(raio: number, nivel: number, quantidade: number, semente: number): Group {
  const grupo = new Group()
  const mat = new MeshStandardMaterial({ color: 0xeaf6ff, transparent: true, opacity: 0.6, roughness: 0.05, metalness: 0.05 })
  const rnd = criarRng(semente)
  for (let i = 0; i < quantidade; i++) {
    const lado = (1.6 + rnd() * 0.5) * CM
    const cubo = new Mesh(new BoxGeometry(lado, lado, lado), mat)
    const a = (i / quantidade) * Math.PI * 2 + rnd()
    const d = raio * 0.45 * rnd() * CM
    cubo.position.set(Math.cos(a) * d, nivel * CM - lado * 0.3, Math.sin(a) * d)
    cubo.rotation.set(rnd() * 0.6, rnd() * Math.PI, rnd() * 0.6)
    cubo.renderOrder = 1
    grupo.add(cubo)
  }
  return grupo
}

function sombraBase(raio: number): Mesh {
  const cv = document.createElement('canvas')
  cv.width = 128; cv.height = 128
  const g = cv.getContext('2d')!
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0, 'rgba(0,0,0,0.42)')
  grad.addColorStop(0.7, 'rgba(0,0,0,0.5)')
  grad.addColorStop(0.8, 'rgba(0,0,0,0.62)')
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 128, 128)
  const malha = new Mesh(new CircleGeometry((raio / 0.8) * CM, 48), new MeshBasicMaterial({ map: new CanvasTexture(cv), transparent: true, depthWrite: false }))
  malha.rotation.x = -Math.PI / 2
  malha.position.y = 0.004
  malha.renderOrder = 0
  return malha
}

function sombraContato(raio: number): Mesh {
  const cv = document.createElement('canvas')
  cv.width = 64; cv.height = 64
  const g = cv.getContext('2d')!
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  grad.addColorStop(0, 'rgba(0,0,0,0.5)')
  grad.addColorStop(0.6, 'rgba(0,0,0,0.25)')
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 64, 64)
  const malha = new Mesh(new CircleGeometry(raio * 1.7 * CM, 32), new MeshBasicMaterial({ map: new CanvasTexture(cv), transparent: true, depthWrite: false }))
  malha.rotation.x = -Math.PI / 2
  malha.position.y = 0.002
  return malha
}

const MARCA_ESCURA = '#160f09'
const MARCA_CREME = '#f1e9dd'
const MARCA_DESTAQUE = '#d1420d'

function escreverMarca(g: CanvasRenderingContext2D, largura: number, meio: number, tamanho: number, cor: string) {
  g.fillStyle = cor
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.font = `800 ${tamanho}px Montserrat, 'Segoe UI', sans-serif`
  const cabe = (largura * 0.44) / g.measureText('LANCELOT').width
  if (cabe < 1) tamanho *= cabe
  g.font = `800 ${tamanho}px Montserrat, 'Segoe UI', sans-serif`
  for (const x of [0, largura * 0.5, largura]) {
    g.fillText('LANCELOT', x, meio - tamanho * 0.28)
    g.font = `600 ${tamanho * 0.42}px Montserrat, 'Segoe UI', sans-serif`
    g.fillText('— P I Z Z A S —', x, meio + tamanho * 0.5)
    g.font = `800 ${tamanho}px Montserrat, 'Segoe UI', sans-serif`
  }
}

export interface MarcaRotulo {
  logo?: string | null
  nome?: string
  aoCarregar?: () => void
}

function escreverNome(g: CanvasRenderingContext2D, largura: number, meio: number, tamanho: number, cor: string, nome?: string) {
  const texto = (nome ?? '').trim().toUpperCase()
  if (!texto) return escreverMarca(g, largura, meio, tamanho, cor)
  g.fillStyle = cor
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  const limite = largura * 0.42
  const fonte = (t: number) => `800 ${t}px Montserrat, 'Segoe UI', sans-serif`
  const palavras = texto.split(/\s+/)
  let linhas = [texto]
  g.font = fonte(tamanho)
  if (palavras.length > 1 && g.measureText(texto).width > limite) {
    let melhor = 1
    let diferenca = Infinity
    for (let k = 1; k < palavras.length; k++) {
      const d = Math.abs(palavras.slice(0, k).join(' ').length - palavras.slice(k).join(' ').length)
      if (d < diferenca) { diferenca = d; melhor = k }
    }
    linhas = [palavras.slice(0, melhor).join(' '), palavras.slice(melhor).join(' ')]
  }
  g.font = fonte(tamanho)
  const maior = Math.max(...linhas.map((l) => g.measureText(l).width))
  const t = Math.min(tamanho, tamanho * (limite / maior))
  g.font = fonte(t)
  for (const x of [0, largura * 0.5, largura]) {
    linhas.forEach((l, n) => g.fillText(l, x, meio + (n - (linhas.length - 1) / 2) * t * 1.05))
  }
}

function pintarMarca(
  g: CanvasRenderingContext2D, tex: CanvasTexture, largura: number, meio: number, caixaAltura: number,
  tamanhoTexto: number, marca: MarcaRotulo, repintarFundo: () => void
) {
  escreverNome(g, largura, meio, tamanhoTexto, MARCA_ESCURA, marca.nome)
  if (!marca.logo) return
  const img = new Image()
  img.onload = () => {
    repintarFundo()
    const k = Math.min((largura * 0.3) / img.width, caixaAltura / img.height)
    const w = img.width * k
    const h = img.height * k
    for (const x of [0, largura * 0.5, largura]) g.drawImage(img, x - w / 2, meio - h / 2, w, h)
    tex.needsUpdate = true
    marca.aoCarregar?.()
  }
  img.src = marca.logo
}

function novaTextura(W: number, H: number) {
  const cv = document.createElement('canvas')
  cv.width = W; cv.height = H
  const tex = new CanvasTexture(cv)
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4
  return { g: cv.getContext('2d')!, tex }
}

function texturaRotulo(marca: MarcaRotulo): CanvasTexture {
  const W = 1024
  const H = 256
  const { g, tex } = novaTextura(W, H)
  const fundo = () => {
    g.fillStyle = MARCA_CREME; g.fillRect(0, 0, W, H)
    g.fillStyle = MARCA_ESCURA
    g.fillRect(0, 0, W, 22); g.fillRect(0, H - 22, W, 22)
    g.fillRect(0, 30, W, 4); g.fillRect(0, H - 34, W, 4)
  }
  fundo()
  pintarMarca(g, tex, W, H / 2, H - 100, 74, marca, fundo)
  return tex
}

function texturaRotuloLogo(marca: MarcaRotulo): CanvasTexture {
  const W = 1024
  const H = 512
  const { g, tex } = novaTextura(W, H)
  const fundo = () => {
    g.fillStyle = MARCA_CREME; g.fillRect(0, 0, W, H)
    g.fillStyle = MARCA_ESCURA
    g.fillRect(0, 0, W, 26); g.fillRect(0, H - 26, W, 26)
  }
  fundo()
  pintarMarca(g, tex, W, H / 2, H - 120, 96, marca, fundo)
  return tex
}

function texturaLata(cor: number, marca: MarcaRotulo): CanvasTexture {
  const W = 1024
  const H = 512
  const { g, tex } = novaTextura(W, H)
  const fundo = () => {
    g.fillStyle = `#${cor.toString(16).padStart(6, '0')}`; g.fillRect(0, 0, W, H)
    g.fillStyle = MARCA_CREME; g.fillRect(0, H * 0.3, W, H * 0.4)
  }
  fundo()
  pintarMarca(g, tex, W, H / 2, H * 0.4 - 36, 82, marca, fundo)
  return tex
}

function garrafa(modelo: 'garrafa_2l' | 'garrafa_1l' | 'garrafa_500', cor: number, grupo: Group, marca: MarcaRotulo) {
  const info = MODELOS_BEBIDA[modelo]
  const perfil = reescalar(PERFIL_PET, info.altura - 1.6, info.diametro / 2)
  const h = info.altura - 1.6
  const corpo = new Mesh(torneado(perfil), pet())
  corpo.renderOrder = 2
  const nivel = h * 0.86
  const conteudo = new Mesh(torneado(preencher(perfil, nivel)), liquido(cor))
  conteudo.renderOrder = 1

  const raioTampa = perfil[perfil.length - 2]![0] + 0.25
  const tampa = new Mesh(
    new CylinderGeometry(raioTampa * CM, raioTampa * CM, 1.6 * CM, 24),
    new MeshStandardMaterial({ color: MARCA_ESCURA, roughness: 0.45 })
  )
  tampa.position.y = (h + 0.8) * CM

  const raioRotulo = info.diametro / 2 + 0.03
  const rotulo = new Mesh(
    new CylinderGeometry(raioRotulo * CM, raioRotulo * CM, h * 0.24 * CM, 48, 1, true),
    new MeshStandardMaterial({ map: texturaRotulo(marca), roughness: 0.5, side: DoubleSide })
  )
  rotulo.position.y = h * 0.5 * CM

  grupo.add(conteudo, corpo, tampa, rotulo, suor(perfil, nivel, 23))
  return { perfil, topo: info.altura, raio: info.diametro / 2 }
}

function lata(cor: number, grupo: Group, marca: MarcaRotulo) {
  const info = MODELOS_BEBIDA.lata
  const R = info.diametro / 2
  const perfil: Perfil = [[0, 0], [2.6, 0], [3.3, 0.7], [3.3, 10.7], [2.78, 11.75], [2.72, 12.05]]
  const pintura = new MeshStandardMaterial({ map: texturaLata(cor, marca), metalness: 0.45, roughness: 0.34 })
  const aluminio = new MeshStandardMaterial({ color: 0xd8dde3, metalness: 0.9, roughness: 0.28, side: DoubleSide })
  const aluminioFundo = new MeshStandardMaterial({ color: 0xa9afb6, metalness: 0.9, roughness: 0.38, side: DoubleSide })

  const corpo = new Mesh(torneado(perfil.filter(([, y]) => y >= 0.7 && y <= 10.7)), pintura)
  const fundo = new Mesh(torneado(perfil.filter(([, y]) => y <= 0.7)), aluminio)
  const ombro = new Mesh(torneado(perfil.filter(([, y]) => y >= 10.7)), aluminio)

  const aro = new Mesh(new TorusGeometry(2.62 * CM, 0.16 * CM, 12, 64), aluminio)
  aro.rotation.x = Math.PI / 2
  aro.position.y = 12.08 * CM
  const parede = new Mesh(torneado([[2.58, 12.1], [2.46, 11.72]]), aluminioFundo)
  const tampa = new Mesh(torneado([[2.46, 11.72], [2.3, 11.66], [0, 11.63]]), aluminioFundo)

  const vinco = new Mesh(new TorusGeometry(0.8 * CM, 0.05 * CM, 6, 32), new MeshStandardMaterial({ color: 0x80868d, metalness: 0.8, roughness: 0.45 }))
  vinco.rotation.x = Math.PI / 2
  vinco.scale.set(1, 0.72, 1)
  vinco.position.set(-1.15 * CM, 11.66 * CM, 0)
  const lacre = new Mesh(new TorusGeometry(0.6 * CM, 0.24 * CM, 8, 28), aluminio)
  lacre.rotation.x = Math.PI / 2
  lacre.scale.set(1.45, 1, 0.3)
  lacre.position.set(0.55 * CM, 11.74 * CM, 0)
  const rebite = new Mesh(new CylinderGeometry(0.26 * CM, 0.26 * CM, 0.14 * CM, 16), aluminio)
  rebite.position.y = 11.7 * CM

  grupo.add(corpo, fundo, ombro, aro, parede, tampa, vinco, lacre, rebite, suor(perfil, 10.7, 34))
  return { perfil, topo: 12.2, raio: R }
}

function tampinha(cor: number, altura = 23): Mesh {
  const perfil: Perfil = [
    [1.52, 21.95], [1.56, 22.1], [1.5, 22.5], [1.46, 22.7], [1.38, 22.84], [1.1, 22.92], [0.6, 22.97], [0, 22.99]
  ]
  const geo = new LatheGeometry(perfil.map(([r, y]) => new Vector2(r * CM, y * CM)), 126)
  const pos = geo.attributes.position!
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    const altura = y / CM
    const forca = Math.max(0, Math.min(1, (22.62 - altura) / 0.55))
    if (forca <= 0) continue
    const k = 1 + 0.04 * forca * Math.cos(Math.atan2(z, x) * 21)
    pos.setXYZ(i, x * k, y, z * k)
  }
  geo.computeVertexNormals()
  const metal = new Color(cor).lerp(new Color(0xc9ced4), 0.6)
  const malha = new Mesh(geo, new MeshStandardMaterial({ color: metal, metalness: 0.85, roughness: 0.32, side: DoubleSide }))
  malha.castShadow = true
  malha.position.y = (altura - 23) * CM
  return malha
}

const VIDROS: Partial<Record<ModeloBebida, { perfil: Perfil, nivel: number, rotuloAltura: number, rotuloY: number }>> = {
  long_neck: {
    perfil: [
      [0, 0], [2.3, 0], [2.85, 0.5], [3, 1.6], [3, 12.2], [2.85, 14.0], [1.75, 16.4], [1.25, 18.6],
      [1.2, 21.6], [1.42, 21.9], [1.42, 22.4], [1.2, 22.5]
    ],
    nivel: 19.2, rotuloAltura: 7.6, rotuloY: 6.6
  },
  cerveja_1l: {
    perfil: [
      [0, 0], [3.3, 0], [3.9, 0.6], [4.2, 1.8], [4.2, 18.5], [4.0, 19.8], [3.2, 21.8], [2.2, 24], [1.5, 25.8],
      [1.3, 26.4], [1.2, 28.6], [1.42, 28.9], [1.42, 29.4], [1.2, 29.5]
    ],
    nivel: 26.2, rotuloAltura: 9, rotuloY: 9.8
  },
  cerveja_471: {
    perfil: [
      [0, 0], [2.7, 0], [3.2, 0.5], [3.4, 1.5], [3.4, 12.5], [3.2, 13.6], [2.4, 15.4], [1.7, 17.2], [1.3, 18.6],
      [1.2, 22.6], [1.42, 22.9], [1.42, 23.4], [1.2, 23.5]
    ],
    nivel: 20.2, rotuloAltura: 6.5, rotuloY: 6.8
  }
}

function garrafaVidro(modelo: 'long_neck' | 'cerveja_1l' | 'cerveja_471', cor: number, grupo: Group, marca: MarcaRotulo) {
  const info = MODELOS_BEBIDA[modelo]
  const { perfil, nivel, rotuloAltura, rotuloY } = VIDROS[modelo]!
  const R = info.diametro / 2
  const corpo = new Mesh(torneado(perfil), vidroColorido(cor))
  corpo.renderOrder = 2
  const conteudo = new Mesh(torneado(preencher(perfil, nivel, 0.5)), liquido(cor))
  conteudo.renderOrder = 1

  const tampa = tampinha(cor, info.altura)

  const rotulo = new Mesh(
    new CylinderGeometry((R + 0.04) * CM, (R + 0.04) * CM, rotuloAltura * CM, 48, 1, true),
    new MeshStandardMaterial({ map: texturaRotuloLogo(marca), roughness: 0.5, side: DoubleSide })
  )
  rotulo.position.y = rotuloY * CM

  grupo.add(conteudo, corpo, tampa, rotulo, suor(perfil, nivel - 0.2, 71))
  return { perfil, topo: info.altura, raio: R }
}

function bico(geo: LatheGeometry, de: number, ate: number, puxar: number) {
  const pos = geo.attributes.position!
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    const altura = y / CM
    const r = Math.hypot(x, z)
    if (altura < de || r < 1e-6) continue
    const lado = Math.max(0, -x / r) ** 6
    const k = lado * ((altura - de) / (ate - de)) ** 1.5 * puxar * CM
    pos.setXYZ(i, x + (x / r) * k, y + lado * ((altura - de) / (ate - de)) * 0.5 * CM, z + (z / r) * k)
  }
  geo.computeVertexNormals()
}

function jarra(cor: number, grupo: Group) {
  const perfil: Perfil = [[0, 0], [4.6, 0], [5.1, 0.5], [5.6, 4], [5.6, 9], [5.2, 15], [4.6, 19], [4.8, 21.4], [5.0, 22]]
  const geoCorpo = torneado(perfil)
  bico(geoCorpo, 18.5, 22, 1.8)
  const corpo = new Mesh(geoCorpo, vidro())
  corpo.renderOrder = 2
  const nivel = 15
  const conteudo = new Mesh(torneado(preencher(perfil, nivel, 0.6)), liquido(cor))
  conteudo.renderOrder = 1
  const curva = new CatmullRomCurve3(
    [[4.7, 19.5], [7.6, 19], [9.0, 15], [8.6, 9], [6.6, 5.2], [5.4, 4.6]].map(([x, y]) => new Vector3(x! * CM, y! * CM, 0))
  )
  const alca = new Mesh(new TubeGeometry(curva, 48, 0.6 * CM, 10), vidro())
  alca.renderOrder = 2
  grupo.add(conteudo, corpo, alca, gelo(5.2, nivel, 5, 41), suor(perfil, nivel, 43))
  return { perfil, topo: 22, raio: 5.6, esquerda: 5.0 + 1.8, direita: 9.6 }
}

function taca(cor: number, grupo: Group) {
  const perfil: Perfil = [[0, 0], [3.6, 0], [3.6, 0.35], [0.55, 0.8], [0.45, 9], [1.5, 10], [3.7, 12.5], [4.0, 15.5], [3.6, 20]]
  const corpo = new Mesh(torneado(perfil), vidro())
  corpo.renderOrder = 2
  const conteudo = new Mesh(torneado([[0, 10.2], [1.4, 10.3], [3.4, 12.6], [3.72, 15.3], [3.7, 16.3], [0, 16.3]]), liquido(cor))
  conteudo.renderOrder = 1
  grupo.add(conteudo, corpo, suor(perfil.filter(([, y]) => y >= 10), 16.3, 52))
  return { perfil, topo: 20, raio: 4 }
}

function copo(cor: number, grupo: Group) {
  const perfil: Perfil = [[0, 0], [3.0, 0], [3.05, 0.8], [3.75, 12]]
  const corpo = new Mesh(torneado(perfil), vidro())
  corpo.renderOrder = 2
  const nivel = 9.6
  const conteudo = new Mesh(torneado(preencher(perfil, nivel, 0.8)), liquido(cor))
  conteudo.renderOrder = 1
  grupo.add(conteudo, corpo, gelo(3.4, nivel, 3, 61), suor(perfil, nivel, 63))
  return { perfil, topo: 12, raio: 3.75 }
}

export function criarBebida3d(modelo: ModeloBebida, cor: number, marca: MarcaRotulo = {}): Bebida3D {
  const grupo = new Group()
  const medidas = modelo === 'lata' ? lata(cor, grupo, marca)
    : modelo === 'jarra' ? jarra(cor, grupo)
      : modelo === 'taca' ? taca(cor, grupo)
        : modelo === 'copo' ? copo(cor, grupo)
          : modelo === 'long_neck' || modelo === 'cerveja_1l' || modelo === 'cerveja_471' ? garrafaVidro(modelo, cor, grupo, marca)
            : garrafa(modelo, cor, grupo, marca)

  grupo.add(sombraBase(modelo === 'taca' ? 3.6 : modelo === 'jarra' ? 5.1 : medidas.raio))

  const extremos = medidas as { esquerda?: number, direita?: number }
  const esquerda = extremos.esquerda ?? medidas.raio
  const direita = extremos.direita ?? medidas.raio
  return {
    grupo,
    largura: (esquerda + direita) * CM,
    esquerda: esquerda * CM,
    raio: medidas.raio * CM,
    altura: medidas.topo * CM
  }
}

export function criarEtiqueta(texto: string, escuro = false): Sprite {
  const W = 240
  const H = 120
  const cv = document.createElement('canvas')
  cv.width = W; cv.height = H
  const g = cv.getContext('2d')!
  const fundo = escuro ? '#2c231b' : '#d1420d'
  const borda = escuro ? '#d1420d' : '#ffffff'
  const cor = escuro ? '#f4ece1' : '#ffffff'
  g.beginPath(); g.roundRect(5, 5, W - 10, H - 10, (H - 10) / 2)
  g.fillStyle = fundo; g.fill()
  g.lineWidth = 7; g.strokeStyle = borda; g.stroke()
  g.fillStyle = cor
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.font = "800 76px Montserrat, 'Segoe UI', sans-serif"
  g.fillText(texto, W / 2, H / 2 + 4)
  const tex = new CanvasTexture(cv)
  tex.colorSpace = SRGBColorSpace
  const etiqueta = new Sprite(new SpriteMaterial({ map: tex, transparent: true, depthTest: false }))
  etiqueta.renderOrder = 10
  etiqueta.userData.proporcao = W / H
  return etiqueta
}

function texturaPortaCopo(): CanvasTexture {
  const T = 512
  const c = T / 2
  const cv = document.createElement('canvas')
  cv.width = T; cv.height = T
  const g = cv.getContext('2d')!
  g.fillStyle = MARCA_CREME
  g.beginPath(); g.arc(c, c, c, 0, Math.PI * 2); g.fill()
  g.strokeStyle = MARCA_ESCURA
  g.lineWidth = 6
  g.beginPath(); g.arc(c, c, c - 14, 0, Math.PI * 2); g.stroke()
  g.lineWidth = 3
  g.beginPath(); g.arc(c, c, c - 74, 0, Math.PI * 2); g.stroke()
  const texto = 'LANCELOT PIZZAS · LANCELOT PIZZAS · '
  g.fillStyle = MARCA_ESCURA
  g.font = "700 30px Montserrat, 'Segoe UI', sans-serif"
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  const passo = (Math.PI * 2) / texto.length
  for (let i = 0; i < texto.length; i++) {
    const a = i * passo - Math.PI / 2
    g.save()
    g.translate(c + Math.cos(a) * (c - 44), c + Math.sin(a) * (c - 44))
    g.rotate(a + Math.PI / 2)
    g.fillText(texto[i]!, 0, 0)
    g.restore()
  }
  const tex = new CanvasTexture(cv)
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

export const ALTURA_PORTA_COPO = 0.45

export function criarPortaCopo(raioBase: number): { grupo: Group, raio: number } {
  const raio = Math.max(4.6, raioBase + 1.4)
  const grupo = new Group()
  const lateral = new MeshStandardMaterial({ color: MARCA_ESCURA, roughness: 0.7 })
  const disco = new Mesh(
    new CylinderGeometry(raio * CM, raio * CM, ALTURA_PORTA_COPO * CM, 64),
    [lateral, new MeshStandardMaterial({ map: texturaPortaCopo(), roughness: 0.85 }), lateral]
  )
  disco.position.y = (ALTURA_PORTA_COPO / 2) * CM
  disco.rotation.y = Math.PI
  grupo.add(sombraContato(raio * 0.62), disco)
  return { grupo, raio: raio * CM }
}
