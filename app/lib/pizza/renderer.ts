import {
  CanvasTexture, CircleGeometry, CylinderGeometry, DirectionalLight, Group, HemisphereLight,
  Mesh, MeshBasicMaterial, Object3D, MeshStandardMaterial, PerspectiveCamera, Raycaster, RepeatWrapping, Scene,
  Sprite, SpriteMaterial, SRGBColorSpace, TorusGeometry, Vector2, Vector3, WebGLRenderer
} from 'three'
import type { PizzaVisual } from '~/types/pizza'
import { MODELOS_BEBIDA, ORDEM_NA_CENA } from '~/data/bebidas'
import { ALTURA_PORTA_COPO, CM, criarBebida3d, criarEtiqueta, criarPortaCopo } from './bebidas'
import { coresDasUnidades, criarEsfirra3d, liberarEsfirras, posicoesEsfirras } from './esfirra'
import { criarRng } from './rng'
import { TAM_TEXTURA, parteNoPonto, pintarPizza } from './textura'

interface Opcoes {
  reduzirMovimento: boolean
  animarEntrada?: boolean
}

const ACHATAMENTO = 0.62

const DIRECAO_CAMERA = new Vector3(0, 5.3, 4.6).normalize()
const RAIO_TABUA = 2.24
const VAO_BEBIDAS = 0.35
const DISTANCIA_ENTRADA = 7
const DURACAO_BEBIDA = 0.9
const LINHA_BEBIDAS = 0.4

export class PizzaRenderer {
  readonly modo: '3d' | '2.5d'

  private canvas: HTMLCanvasElement
  private textura2d: HTMLCanvasElement
  private visual: PizzaVisual = { qtd: 1, partes: [null], escala: 1, corRecheio: null, destaque: -1 }
  private reduzir: boolean
  private largura = 300
  private altura = 300

  private rot = 0
  private rotAlvo = 0
  private escala = 1
  private pulso = 0
  private baseGrupo?: Group
  private tIntro = 0
  private ultimoQuadro = 0
  private introFeita = false
  private animarEntrada = true
  private assinaturaPizza = ''
  private tPouso = 0
  private giroQueda = 0
  private achatar = 0
  private quicar = 0
  private quedaY = 0
  private mostradas = new Set<string>()
  private posicoes = new Map<string, { x: number, z: number }>()
  private anelAnterior = false
  private entradas: { t: number, dx: number, dz: number, partes: { obj: Object3D, x: number, z: number }[] }[] = []
  private quadro = 0
  private destruido = false
  private arrastando = false

  private renderer?: WebGLRenderer
  private cena?: Scene
  private camera?: PerspectiveCamera
  private pizza?: Group
  private grupoEsfirras?: Group
  private assinaturaEsfirras = ''
  private topo?: Mesh
  private borda?: Mesh
  private recheio?: Mesh<TorusGeometry, MeshStandardMaterial>
  private textura?: CanvasTexture
  private raio = new Raycaster()

  private grupoBebidas?: Group
  private assinaturaBebidas = ''
  private etiquetas: Sprite[] = []
  private giratorias: { grupo: Group, chave: string }[] = []
  private giros = new Map<string, { rot: number, alvo: number }>()
  private fimBebidas = RAIO_TABUA
  private anelBebidas = 0
  private alturaBebidas = 0
  private camDist = 0
  private camDistAlvo = 0
  private olhar = new Vector3(0, 0, 0.3)
  private olharAlvo = new Vector3(0, 0, 0.3)

  private ctx?: CanvasRenderingContext2D

  constructor(canvas: HTMLCanvasElement, opcoes: Opcoes) {
    this.canvas = canvas
    this.reduzir = opcoes.reduzirMovimento
    this.animarEntrada = opcoes.animarEntrada ?? true
    if (!this.animarEntrada) this.introFeita = true
    this.textura2d = document.createElement('canvas')
    this.textura2d.width = TAM_TEXTURA
    this.textura2d.height = TAM_TEXTURA
    this.textura2d.getContext('2d', { willReadFrequently: true })

    let webgl = false
    try {
      this.montarCena()
      this.enquadrar(true)
      webgl = true
    } catch {
      webgl = false
    }
    this.modo = webgl ? '3d' : '2.5d'
    if (!webgl) this.ctx = canvas.getContext('2d') ?? undefined
  }

  atualizar(visual: PizzaVisual, comPulso = false) {
    this.visual = visual
    if (comPulso && !this.reduzir) this.pulso = 1
    const soEsfirras = visual.modo === 'esfirra'
    if (this.pizza && this.introFeita) this.pizza.visible = !soEsfirras
    if (this.grupoEsfirras && this.introFeita) this.grupoEsfirras.visible = soEsfirras
    if (this.recheio) {
      const recheada = visual.corRecheio !== null
      this.recheio.visible = recheada
      if (recheada) this.recheio.material.color.setHex(visual.corRecheio!)
      this.borda?.scale.set(1, 1, recheada ? 1.3 : 1)
    }
    const assinatura = `${visual.qtd}|${visual.destaque}|${visual.partes.map((p) => (p ? `${p.id}:${p.ingredientes.join(',')}` : '')).join('/')}`
    if (assinatura !== this.assinaturaPizza) {
      this.assinaturaPizza = assinatura
      pintarPizza(this.textura2d, visual)
      if (this.textura) this.textura.needsUpdate = true
    }
    this.montarEsfirras()
    this.montarBebidas()
    this.pedirQuadro()
  }

  redimensionar(largura: number, altura: number) {
    this.largura = Math.max(1, Math.round(largura))
    this.altura = Math.max(1, Math.round(altura))
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    if (this.renderer && this.camera) {
      this.renderer.setPixelRatio(dpr)
      this.renderer.setSize(this.largura, this.altura, false)
      this.camera.aspect = this.largura / this.altura
      this.camera.updateProjectionMatrix()
      this.montarBebidas()
      this.enquadrar(true)
    } else if (this.ctx) {
      this.canvas.width = this.largura * dpr
      this.canvas.height = this.altura * dpr
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    this.desenhar()
  }

  parteEm(nx: number, ny: number): number {
    if (this.visual.modo === 'esfirra') return -1
    let px: number
    let py: number
    if (this.modo === '3d' && this.camera && this.topo) {
      this.raio.setFromCamera(new Vector2(nx * 2 - 1, -(ny * 2 - 1)), this.camera)
      const acerto = this.raio.intersectObject(this.topo, false)[0]
      if (!acerto?.uv) return -1
      px = acerto.uv.x - 0.5
      py = 0.5 - acerto.uv.y
    } else {
      const { cx, cy, R } = this.medidas2d()
      const r = R * this.escala * 0.94
      px = (nx * this.largura - cx) / r
      py = (ny * this.altura - cy) / (r * ACHATAMENTO)
      if (px * px + py * py > 1) return -1
    }
    return parteNoPonto(px, py, this.visual.qtd)
  }

  bebidaEm(nx: number, ny: number): string | null {
    if (this.modo !== '3d' || !this.camera || !this.giratorias.length) return null
    this.raio.setFromCamera(new Vector2(nx * 2 - 1, -(ny * 2 - 1)), this.camera)
    const grupos = this.giratorias.map((g) => g.grupo)
    let obj = this.raio.intersectObjects(grupos, true)[0]?.object ?? null
    while (obj && !grupos.includes(obj as Group)) obj = obj.parent
    return this.giratorias.find((g) => g.grupo === obj)?.chave ?? null
  }

  rotacaoDe(alvo: string | null) {
    return alvo ? (this.giros.get(alvo)?.alvo ?? 0) : this.rotAlvo
  }

  girarPara(radianos: number, alvo: string | null = null) {
    if (this.modo !== '3d') return
    const giro = alvo ? this.giros.get(alvo) : undefined
    if (giro) giro.alvo = radianos
    else this.rotAlvo = radianos
    this.pedirQuadro()
  }

  definirArrasto(ativo: boolean) {
    this.arrastando = ativo
    if (ativo) this.pedirQuadro()
  }

  destruir() {
    this.destruido = true
    if (this.quadro) cancelAnimationFrame(this.quadro)
    this.quadro = 0
    try {
      this.limparBebidas()
      if (this.grupoEsfirras) liberarEsfirras(this.grupoEsfirras)
      this.cena?.traverse((obj) => {
        if (!(obj instanceof Mesh)) return
        obj.geometry.dispose()
        const materiais = (Array.isArray(obj.material) ? obj.material : [obj.material]) as (MeshStandardMaterial | MeshBasicMaterial)[]
        for (const mat of new Set(materiais)) {
          mat.map?.dispose()
          mat.dispose()
        }
      })
      this.renderer?.dispose()
    } catch (err) {
      console.warn('Falha ao liberar a cena 3D.', err)
    }
  }

  private montarCena() {
    const renderer = new WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true })
    renderer.shadowMap.enabled = true
    this.renderer = renderer

    const cena = new Scene()
    this.cena = cena
    this.camera = new PerspectiveCamera(30, 1, 0.1, 60)

    cena.add(new HemisphereLight(0xfff1dd, 0x2a1a10, 2.4))
    const sol = new DirectionalLight(0xffe2b8, 3.2)
    sol.position.set(-3, 6, 2.5)
    sol.castShadow = true
    sol.shadow.mapSize.set(1024, 1024)
    sol.shadow.bias = -0.0006
    sol.shadow.radius = 4
    const sc = sol.shadow.camera
    sc.left = -3; sc.right = 3; sc.top = 3; sc.bottom = -3; sc.near = 1; sc.far = 14
    cena.add(sol)

    const lateral = new MeshStandardMaterial({ map: this.texturaLateral(), roughness: 0.85 })
    const tabua = new Mesh(
      new CylinderGeometry(2.24, 2.16, 0.3, 96),
      [lateral, new MeshStandardMaterial({ map: this.texturaMadeira(), roughness: 0.62 }), lateral]
    )
    tabua.position.y = -0.15
    tabua.receiveShadow = true
    const base = new Group()
    this.baseGrupo = base
    cena.add(base)
    base.add(tabua)

    const quina = new Mesh(
      new TorusGeometry(2.215, 0.03, 10, 140),
      new MeshStandardMaterial({ color: 0x8e5d36, roughness: 0.5 })
    )
    quina.rotation.x = Math.PI / 2
    quina.position.y = -0.008
    base.add(quina)

    const sombra = new Mesh(
      new CircleGeometry(2.48, 64),
      new MeshBasicMaterial({ map: this.texturaSombra(), transparent: true, depthWrite: false })
    )
    sombra.rotation.x = -Math.PI / 2
    sombra.position.set(0.1, -0.305, -0.06)
    base.add(sombra)

    this.grupoBebidas = new Group()
    this.grupoBebidas.position.y = -0.3
    cena.add(this.grupoBebidas)

    const pizza = new Group()
    this.pizza = pizza
    cena.add(pizza)

    this.grupoEsfirras = new Group()
    this.grupoEsfirras.visible = false
    cena.add(this.grupoEsfirras)

    const massa = new Mesh(
      new CylinderGeometry(1.84, 1.8, 0.14, 72),
      new MeshStandardMaterial({ color: 0xc98f4e, roughness: 0.9 })
    )
    massa.position.y = 0.07
    massa.castShadow = true
    pizza.add(massa)

    this.textura = new CanvasTexture(this.textura2d)
    this.textura.colorSpace = SRGBColorSpace
    this.textura.anisotropy = 4
    const topo = new Mesh(
      new CircleGeometry(1.72, 72),
      new MeshStandardMaterial({ map: this.textura, roughness: 0.72 })
    )
    topo.rotation.x = -Math.PI / 2
    topo.position.y = 0.152
    topo.receiveShadow = true
    pizza.add(topo)
    this.topo = topo

    const geo = new TorusGeometry(1.8, 0.17, 20, 120)
    const pos = geo.attributes.position!
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const z = pos.getZ(i)
      const th = Math.atan2(y, x)
      const k = 1 + Math.sin(th * 7 + 1) * 0.012 + Math.sin(th * 13) * 0.008
      pos.setXYZ(i, x * k, y * k, z * (0.8 + Math.sin(th * 5 + 2) * 0.07 + Math.sin(th * 11) * 0.04))
    }
    geo.computeVertexNormals()
    const borda = new Mesh(geo, new MeshStandardMaterial({ map: this.texturaBorda(), roughness: 0.85 }))
    borda.rotation.x = Math.PI / 2
    borda.position.y = 0.14
    borda.castShadow = true
    borda.receiveShadow = true
    pizza.add(borda)
    this.borda = borda

    const geoRecheio = new TorusGeometry(1.6, 0.085, 14, 160)
    const pr = geoRecheio.attributes.position!
    for (let i = 0; i < pr.count; i++) {
      const x = pr.getX(i)
      const y = pr.getY(i)
      const z = pr.getZ(i)
      const th = Math.atan2(y, x)
      const k = 1 + Math.sin(th * 9) * 0.014 + Math.sin(th * 23 + 1) * 0.008
      pr.setXYZ(i, x * k, y * k, z * (0.75 + Math.sin(th * 6 + 1) * 0.12 + Math.sin(th * 17) * 0.06))
    }
    geoRecheio.computeVertexNormals()
    const recheio = new Mesh(geoRecheio, new MeshStandardMaterial({ color: 0xfff3d2, roughness: 0.38 }))
    recheio.rotation.x = Math.PI / 2
    recheio.position.y = 0.2
    recheio.castShadow = true
    recheio.visible = false
    pizza.add(recheio)
    this.recheio = recheio
  }

  private montarEsfirras() {
    if (!this.grupoEsfirras) return
    const cores = coresDasUnidades(this.visual.esfirras ?? [])
    const assinatura = cores.join(',')
    if (assinatura === this.assinaturaEsfirras) return
    this.assinaturaEsfirras = assinatura
    liberarEsfirras(this.grupoEsfirras)
    const posicoes = posicoesEsfirras(cores.length)
    cores.forEach((cor, i) => {
      const { x, z, r } = posicoes[i]!
      const esfirra = criarEsfirra3d(cor, i)
      esfirra.position.set(x, 0, z)
      esfirra.scale.setScalar(r)
      esfirra.rotation.y = i * 1.7
      this.grupoEsfirras!.add(esfirra)
    })
  }

  private get bebidasOrdenadas() {
    return [...(this.visual.bebidas ?? [])].sort((a, b) => ORDEM_NA_CENA.indexOf(a.modelo) - ORDEM_NA_CENA.indexOf(b.modelo))
  }

  private get emAnel() {
    return window.matchMedia('(max-width: 899.98px)').matches
  }

  private montarBebidas() {
    if (!this.grupoBebidas) return
    const lista = this.bebidasOrdenadas
    const anel = this.emAnel
    const escuro = document.documentElement.classList.contains('dark')
    const assinatura = `${anel ? 'anel' : 'fila'}|${escuro ? 'e' : 'c'}|` + lista.map((b) => `${b.id ?? ''}:${b.modelo}:${b.cor}:${b.quantidade ?? ''}:${b.nome ?? ''}:${b.logo ? `${b.logo.length}${b.logo.slice(-24)}` : ''}`).join('|')
    if (assinatura === this.assinaturaBebidas) return
    this.assinaturaBebidas = assinatura
    this.limparBebidas()
    this.anelBebidas = 0

    const itens = lista.map((b) => {
      const bebida = criarBebida3d(b.modelo, b.cor, { logo: b.logo, nome: b.nome, aoCarregar: () => this.pedirQuadro() })
      const portaCopo = criarPortaCopo(bebida.raio / CM)
      const alcance = Math.max(bebida.esquerda, bebida.largura - bebida.esquerda, portaCopo.raio)
      return { b, bebida, portaCopo, alcance }
    })

    let raioAnel = 0
    if (anel && itens.length) {
      const maior = Math.max(...itens.map((it) => it.alcance))
      const perimetro = itens.reduce((t, it) => t + 2 * it.alcance + 0.15, 0)
      raioAnel = Math.max(RAIO_TABUA + 0.25 + maior, perimetro / (2 * Math.PI))
      this.anelBebidas = raioAnel + maior
    }

    let x = RAIO_TABUA + VAO_BEBIDAS
    let altura = 0
    const chaves: string[] = []
    const novasPosicoes = new Map<string, { x: number, z: number }>()
    const mesmoLayout = this.anelAnterior === anel
    let novas = 0
    itens.forEach(({ b, bebida, portaCopo, alcance }, i) => {
      let centro = x + alcance
      let z = LINHA_BEBIDAS
      let dirX = 0
      let dirZ = -1
      if (anel) {
        const passo = i === 0 ? 0 : i % 2 ? (i + 1) / 2 : -i / 2
        const ang = itens.length <= 2 ? (i === 0 ? Math.PI / 2 : -Math.PI / 2) : (2 * Math.PI * passo) / itens.length
        centro = raioAnel * Math.sin(ang)
        z = -raioAnel * Math.cos(ang)
        dirX = Math.sin(ang)
        dirZ = -Math.cos(ang)
      }
      portaCopo.grupo.position.set(centro, 0, z)
      bebida.grupo.position.set(centro, ALTURA_PORTA_COPO * CM, z)
      const chave = b.id !== undefined ? `id:${b.id}` : `${b.modelo}:${i}`
      if (!this.giros.has(chave)) this.giros.set(chave, { rot: 0, alvo: 0 })
      bebida.grupo.rotation.y = this.giros.get(chave)!.rot
      this.grupoBebidas!.add(portaCopo.grupo, bebida.grupo)
      this.giratorias.push({ grupo: bebida.grupo, chave })
      if ((b.quantidade ?? 0) > 1) {
        const etiqueta = criarEtiqueta(`${b.quantidade}x`, escuro)
        const atras = anel && z < -raioAnel * 0.5
        etiqueta.position.set(centro, 0, atras ? z + portaCopo.raio + 0.2 : z + 0.6 + 0.4)
        if (atras) {
          (etiqueta.material as SpriteMaterial).depthTest = true
          etiqueta.userData.elevar = 0.45
        }
        this.grupoBebidas!.add(etiqueta)
        this.etiquetas.push(etiqueta)
      }
      chaves.push(chave)
      novasPosicoes.set(chave, { x: centro, z })
      if (!this.reduzir && this.animarEntrada) {
        const anterior = this.posicoes.get(chave)
        let dx = 0
        let dz = 0
        if (!this.mostradas.has(chave)) {
          dx = dirX * DISTANCIA_ENTRADA
          dz = dirZ * DISTANCIA_ENTRADA
        } else if (anterior && mesmoLayout) {
          dx = anterior.x - centro
          dz = anterior.z - z
        }
        if (Math.abs(dx) > 0.01 || Math.abs(dz) > 0.01) {
          const partes = [portaCopo.grupo, bebida.grupo, ...(this.etiquetas.length && (b.quantidade ?? 0) > 1 ? [this.etiquetas[this.etiquetas.length - 1]!] : [])]
            .map((obj) => ({ obj: obj as Object3D, x: obj.position.x, z: obj.position.z }))
          this.entradas.push({ t: -(this.mostradas.has(chave) ? 0 : novas * 0.13), dx, dz, partes })
          if (!this.mostradas.has(chave)) novas++
        }
      }
      x = centro + alcance + 0.22
      altura = Math.max(altura, bebida.altura + ALTURA_PORTA_COPO * CM)
    })
    this.mostradas = new Set(chaves)
    this.posicoes = novasPosicoes
    this.anelAnterior = anel
    this.aplicarEntradas(0)
    this.fimBebidas = lista.length ? x - 0.22 : RAIO_TABUA
    this.alturaBebidas = altura
    this.enquadrar()
  }

  private limparBebidas() {
    if (!this.grupoBebidas) return
    this.grupoBebidas.traverse((obj) => {
      if (obj instanceof Mesh || obj instanceof Sprite) {
        obj.geometry.dispose()
        const materiais = (Array.isArray(obj.material) ? obj.material : [obj.material]) as (MeshStandardMaterial | SpriteMaterial)[]
        for (const mat of materiais) {
          mat.map?.dispose()
          mat.dispose()
        }
      }
    })
    this.grupoBebidas.clear()
    this.etiquetas = []
    this.giratorias = []
    this.entradas = []
  }

  private enquadrar(imediato = false) {
    if (!this.camera) return
    const aspecto = this.largura / this.altura
    const anel = this.anelBebidas > 0
    const xMin = anel ? -this.anelBebidas - 0.1 : -RAIO_TABUA - 0.1
    const xMax = anel ? this.anelBebidas + 0.1 : Math.max(RAIO_TABUA + 0.1, this.fimBebidas + 0.15)
    const larguraCena = xMax - xMin + (this.fimBebidas > RAIO_TABUA ? 1.5 : 0.8)
    const alturaCena = anel
      ? Math.max(4.7, 1.52 * this.anelBebidas + 0.66 * this.alturaBebidas + 0.9)
      : Math.max(4.7, 2 * (0.66 * this.alturaBebidas + 0.32))
    const precisa = Math.max(alturaCena, larguraCena / aspecto)
    this.camDistAlvo = precisa / (2 * Math.tan((this.camera.fov * Math.PI) / 360))
    this.olharAlvo.set((xMin + xMax) / 2, this.alturaBebidas * 0.12, anel ? 0.1 : 0.3)
    const altura = this.camDistAlvo * 0.036
    for (const e of this.etiquetas) {
      e.scale.set(altura * (e.userData.proporcao as number), altura, 1)
      e.position.y = altura * (0.5 + ((e.userData.elevar as number | undefined) ?? 0))
    }
    if (imediato || this.reduzir || !this.camDist) {
      this.camDist = this.camDistAlvo
      this.olhar.copy(this.olharAlvo)
    }
    this.pedirQuadro()
  }

  private texturaMadeira(): CanvasTexture {
    const T = 512
    const cv = document.createElement('canvas')
    cv.width = T; cv.height = T
    const g = cv.getContext('2d')!
    const rnd = criarRng(3)

    const tons = ['#6b4528', '#5f3c22', '#71492b', '#633f24', '#6e472a']
    const largura = T / tons.length
    tons.forEach((tom, i) => {
      g.fillStyle = tom
      g.fillRect(i * largura, 0, largura + 1, T)
    })

    for (let i = 0; i < 220; i++) {
      const x = rnd() * T
      g.strokeStyle = rnd() > 0.55 ? `rgba(38,20,8,${0.12 + rnd() * 0.2})` : `rgba(170,118,72,${0.08 + rnd() * 0.14})`
      g.lineWidth = 0.6 + rnd() * 2.2
      const onda = 3 + rnd() * 7
      g.beginPath(); g.moveTo(x, 0)
      g.bezierCurveTo(x + onda, T * 0.33, x - onda, T * 0.66, x + rnd() * 4 - 2, T)
      g.stroke()
    }

    for (let i = 0; i < 4; i++) {
      const x = rnd() * T
      const y = rnd() * T
      for (let r = 3; r < 16; r += 3) {
        g.strokeStyle = `rgba(40,22,10,${0.35 - r * 0.015})`
        g.lineWidth = 1.2
        g.beginPath(); g.ellipse(x, y, r * 0.7, r * 1.6, 0, 0, Math.PI * 2); g.stroke()
      }
    }

    g.strokeStyle = 'rgba(25,12,4,0.45)'
    g.lineWidth = 2
    for (let i = 1; i < tons.length; i++) {
      g.beginPath(); g.moveTo(i * largura, 0); g.lineTo(i * largura, T); g.stroke()
    }

    const brilho = g.createRadialGradient(T * 0.42, T * 0.4, T * 0.05, T / 2, T / 2, T / 2)
    brilho.addColorStop(0, 'rgba(255,225,180,0.16)')
    brilho.addColorStop(0.7, 'rgba(0,0,0,0)')
    brilho.addColorStop(1, 'rgba(20,10,4,0.45)')
    g.fillStyle = brilho
    g.fillRect(0, 0, T, T)

    const tex = new CanvasTexture(cv)
    tex.colorSpace = SRGBColorSpace
    tex.anisotropy = 4
    return tex
  }

  private texturaLateral(): CanvasTexture {
    const cv = document.createElement('canvas')
    cv.width = 512; cv.height = 32
    const g = cv.getContext('2d')!
    g.fillStyle = '#3f2615'; g.fillRect(0, 0, 512, 32)
    const rnd = criarRng(7)
    for (let i = 0; i < 40; i++) {
      g.strokeStyle = rnd() > 0.5 ? 'rgba(20,10,4,0.35)' : 'rgba(120,80,48,0.25)'
      g.lineWidth = 0.5 + rnd() * 1.5
      const y = rnd() * 32
      g.beginPath(); g.moveTo(0, y); g.lineTo(512, y + rnd() * 2 - 1); g.stroke()
    }
    const tex = new CanvasTexture(cv)
    tex.colorSpace = SRGBColorSpace
    tex.wrapS = RepeatWrapping
    tex.repeat.set(3, 1)
    return tex
  }

  private texturaSombra(): CanvasTexture {
    const cv = document.createElement('canvas')
    cv.width = 256; cv.height = 256
    const g = cv.getContext('2d')!
    const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128)
    grad.addColorStop(0, 'rgba(0,0,0,0.42)')
    grad.addColorStop(0.84, 'rgba(0,0,0,0.36)')
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, 256, 256)
    return new CanvasTexture(cv)
  }

  private texturaBorda(): CanvasTexture {
    const cv = document.createElement('canvas')
    cv.width = 256; cv.height = 64
    const g = cv.getContext('2d')!
    g.fillStyle = '#d7a05c'; g.fillRect(0, 0, 256, 64)
    const rnd = criarRng(11)
    for (let i = 0; i < 70; i++) {
      const k = rnd()
      g.fillStyle = k > 0.8 ? 'rgba(120,62,24,0.55)' : k > 0.45 ? 'rgba(184,116,58,0.5)' : 'rgba(240,204,150,0.5)'
      g.beginPath(); g.ellipse(rnd() * 256, 8 + rnd() * 40, 6 + rnd() * 16, 4 + rnd() * 8, rnd() * 3, 0, Math.PI * 2); g.fill()
    }
    const tex = new CanvasTexture(cv)
    tex.colorSpace = SRGBColorSpace
    tex.wrapS = RepeatWrapping
    tex.repeat.set(5, 1)
    return tex
  }

  private pedirQuadro() {
    if (!this.quadro && !this.destruido) this.quadro = requestAnimationFrame(this.passo)
  }

  private aplicarEntradas(dt: number): boolean {
    for (const e of this.entradas) {
      e.t += dt
      const falta = (1 - Math.min(1, Math.max(0, e.t / DURACAO_BEBIDA))) ** 3
      for (const p of e.partes) p.obj.position.set(p.x + e.dx * falta, p.obj.position.y, p.z + e.dz * falta)
    }
    this.entradas = this.entradas.filter((e) => e.t < DURACAO_BEBIDA)
    return this.entradas.length > 0
  }

  private aplicarIntro(dt: number): boolean {
    if (this.introFeita || !this.baseGrupo || !this.pizza) return false
    if (this.reduzir) { this.introFeita = true; return false }
    this.tIntro += dt
    const t = this.tIntro
    const base = this.baseGrupo
    const tabua = Math.min(1, t / 1.2)
    const z = -DISTANCIA_ENTRADA * (1 - tabua) ** 3
    this.baseGrupo.position.z = z
    const u = Math.min(1, Math.max(0, (t - 1.0) / 0.55))
    this.pizza.visible = t >= 1.0 && this.visual.modo !== 'esfirra'
    if (this.grupoEsfirras) this.grupoEsfirras.visible = t >= 1.0 && this.visual.modo === 'esfirra'
    this.quedaY = 3.2 * (1 - u * u)
    this.giroQueda = 0.9 * (1 - u * u)
    this.pizza.position.z = z
    if (u >= 1) {
      this.tPouso += dt
      const k = Math.exp(-this.tPouso * 11)
      this.achatar = k
      this.quicar = 0.24 * Math.exp(-4.2 * this.tPouso) * Math.abs(Math.sin(this.tPouso * 10.5))
      base.position.y = -0.09 * Math.exp(-6 * this.tPouso) * Math.sin(this.tPouso * 14)
      if (this.tPouso > 1.4) {
        this.introFeita = true
        this.achatar = 0
        this.quicar = 0
        base.position.y = 0
        this.pizza.position.z = 0
        this.pizza.visible = this.visual.modo !== 'esfirra'
        if (this.grupoEsfirras) this.grupoEsfirras.visible = this.visual.modo === 'esfirra'
      }
    }
    return !this.introFeita
  }

  private passo = () => {
    this.quadro = 0
    const alvo = this.visual.escala
    if (this.reduzir) {
      this.rot = this.rotAlvo
      for (const g of this.giros.values()) g.rot = g.alvo
      this.escala = alvo
      this.pulso = 0
    } else {
      this.rot += (this.rotAlvo - this.rot) * 0.2
      for (const g of this.giros.values()) g.rot += (g.alvo - g.rot) * 0.2
      this.escala += (alvo - this.escala) * 0.18
      this.pulso *= 0.86
      this.camDist += (this.camDistAlvo - this.camDist) * 0.12
      this.olhar.lerp(this.olharAlvo, 0.12)
    }
    const agora = performance.now()
    const dt = this.ultimoQuadro ? Math.min(0.033, (agora - this.ultimoQuadro) / 1000) : 0.016
    this.ultimoQuadro = agora
    const entrando = this.aplicarIntro(dt)
    const deslizando = this.aplicarEntradas(dt)
    this.desenhar()
    const bebidasParadas = [...this.giros.values()].every((g) => Math.abs(g.alvo - g.rot) < 0.001)
    const parado = Math.abs(this.rotAlvo - this.rot) < 0.001 && bebidasParadas && Math.abs(alvo - this.escala) < 0.001 && this.pulso < 0.004 &&
      Math.abs(this.camDistAlvo - this.camDist) < 0.002 && this.olhar.distanceTo(this.olharAlvo) < 0.002
    if (this.arrastando || !parado || entrando || deslizando) this.pedirQuadro()
  }

  private desenhar() {
    if (this.renderer && this.cena && this.camera && this.pizza) {
      this.pizza.rotation.y = this.rot + this.giroQueda
      for (const g of this.giratorias) g.grupo.rotation.y = this.giros.get(g.chave)?.rot ?? 0
      this.pizza.scale.set(this.escala * (1 + 0.05 * this.achatar), this.escala * (1 - 0.32 * this.achatar), this.escala * (1 + 0.05 * this.achatar))
      this.pizza.position.y = this.pulso * 0.16 + this.quedaY + this.quicar
      if (this.grupoEsfirras) {
        this.grupoEsfirras.rotation.y = this.pizza.rotation.y
        this.grupoEsfirras.position.set(0, this.pizza.position.y, this.pizza.position.z)
        this.grupoEsfirras.scale.set(1 + 0.05 * this.achatar, 1 - 0.32 * this.achatar, 1 + 0.05 * this.achatar)
      }
      this.camera.position.copy(DIRECAO_CAMERA).multiplyScalar(this.camDist).add(this.olhar)
      this.camera.lookAt(this.olhar)
      this.renderer.render(this.cena, this.camera)
    } else if (this.ctx) {
      this.desenhar2d(this.ctx)
    }
  }

  private larguraBebidas2d() {
    const lista = this.bebidasOrdenadas
    if (!lista.length) return 0
    return lista.reduce((t, b) => t + MODELOS_BEBIDA[b.modelo].diametro * CM + 0.28, VAO_BEBIDAS)
  }

  private medidas2d() {
    const extra = this.larguraBebidas2d()
    const pxu = Math.min((this.largura * 0.97) / (4.6 + extra), (this.altura * 0.42) / ACHATAMENTO / 1.84)
    const R = 1.84 * pxu
    return { cx: this.largura / 2 - (extra * pxu) / 2, cy: this.altura / 2, R, pxu }
  }

  private desenhar2d(g: CanvasRenderingContext2D) {
    const { cx, cy, R: R0 } = this.medidas2d()
    const k = ACHATAMENTO
    const R = R0 * this.escala
    const y = cy - this.pulso * 14
    const TAU = Math.PI * 2
    g.clearRect(0, 0, this.largura, this.altura)
    const tx = R0 * 1.22
    const ty = cy + R0 * 0.09
    const esp = R0 * 0.1
    g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.ellipse(cx + 6, ty + esp + 6, tx * 1.04, tx * k * 1.04, 0, 0, TAU); g.fill()
    g.fillStyle = '#3f2615'; g.beginPath(); g.ellipse(cx, ty + esp, tx, tx * k, 0, 0, TAU); g.fill()
    g.fillRect(cx - tx, ty, tx * 2, esp)
    const tampo = g.createRadialGradient(cx - tx * 0.2, ty - tx * k * 0.3, tx * 0.1, cx, ty, tx)
    tampo.addColorStop(0, '#7a5030'); tampo.addColorStop(1, '#55361f')
    g.fillStyle = tampo; g.beginPath(); g.ellipse(cx, ty, tx, tx * k, 0, 0, TAU); g.fill()
    g.strokeStyle = 'rgba(160,110,70,0.6)'; g.lineWidth = 2
    g.beginPath(); g.ellipse(cx, ty, tx - 1, tx * k - 1, 0, Math.PI * 0.95, Math.PI * 2.05); g.stroke()
    if (this.visual.modo === 'esfirra') {
      const cores = coresDasUnidades(this.visual.esfirras ?? [])
      posicoesEsfirras(cores.length).forEach(({ x, z, r }, i) => {
        const px = cx + x * (R0 / 1.84)
        const py = cy + z * (R0 / 1.84) * k
        const raio = r * (R0 / 1.84)
        g.fillStyle = '#c88a42'; g.beginPath(); g.ellipse(px, py, raio, raio * k, 0, 0, TAU); g.fill()
        g.fillStyle = `#${cores[i]!.toString(16).padStart(6, '0')}`; g.beginPath(); g.ellipse(px, py, raio * 0.8, raio * 0.8 * k, 0, 0, TAU); g.fill()
      })
      this.desenharBebidas2d(g, cx + tx, ty + esp)
      return
    }
    g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.ellipse(cx + 8, cy + R0 * 0.1, R * 1.03, R * 1.03 * k, 0, 0, TAU); g.fill()
    g.fillStyle = '#b57c3f'; g.beginPath(); g.ellipse(cx, y + R0 * 0.07, R, R * k, 0, 0, TAU); g.fill()
    g.save(); g.translate(cx, y); g.scale(1, k)
    g.drawImage(this.textura2d, -R * 0.94, -R * 0.94, R * 1.88, R * 1.88)
    g.restore()
    g.strokeStyle = '#d7a05c'; g.lineWidth = R * 0.13
    g.beginPath(); g.ellipse(cx, y, R * 0.95, R * 0.95 * k, 0, 0, TAU); g.stroke()
    if (this.visual.corRecheio !== null) {
      g.strokeStyle = `#${this.visual.corRecheio.toString(16).padStart(6, '0')}`
      g.lineWidth = R * 0.06
      g.beginPath(); g.ellipse(cx, y - 2, R * 0.86, R * 0.86 * k, 0, 0, TAU); g.stroke()
    }
    g.strokeStyle = 'rgba(255,230,180,0.35)'; g.lineWidth = 3
    g.beginPath(); g.ellipse(cx, y - 3, R * 0.96, R * 0.96 * k, 0, 3.4, 6); g.stroke()
    this.desenharBebidas2d(g, cx + tx, ty + esp)
  }

  private desenharBebidas2d(g: CanvasRenderingContext2D, inicioX: number, chao: number) {
    const { pxu } = this.medidas2d()
    let x = inicioX + VAO_BEBIDAS * pxu
    for (const b of this.bebidasOrdenadas) {
      const info = MODELOS_BEBIDA[b.modelo]
      const w = info.diametro * CM * pxu
      const h = info.altura * CM * pxu * 0.8
      const cor = `#${b.cor.toString(16).padStart(6, '0')}`
      g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.ellipse(x + w / 2 + 3, chao, w * 0.65, w * 0.2, 0, 0, Math.PI * 2); g.fill()
      if (b.modelo === 'lata') {
        g.fillStyle = cor; g.fillRect(x, chao - h, w, h)
        g.fillStyle = 'rgba(220,225,230,0.9)'; g.fillRect(x, chao - h, w, h * 0.08)
      } else {
        g.fillStyle = cor; g.globalAlpha = 0.85
        g.fillRect(x + w * 0.06, chao - h * 0.78, w * 0.88, h * 0.78)
        g.globalAlpha = 1
        g.strokeStyle = 'rgba(235,245,255,0.75)'; g.lineWidth = 1.5
        g.strokeRect(x, chao - h, w, h)
      }
      x += w + 0.28 * pxu
    }
  }
}
