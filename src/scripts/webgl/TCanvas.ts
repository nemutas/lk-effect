import gsap from 'gsap'
import * as THREE from 'three'
import { gl } from './core/WebGL'
import fragmentShader from './shaders/fragment.glsl'
import vertexShader from './shaders/vertex.glsl'
import { calcCoveredTextureScale } from './utils/coveredTexture'

export class TCanvas {
  private images = new THREE.Group()
  private raycaster = new THREE.Raycaster()
  private pointer = new THREE.Vector2(99999, 99999)
  private currentScrollPos = 0

  constructor(private container: HTMLElement) {
    this.init()
    this.createObjects().then(() => {
      window.addEventListener('mousemove', this.handleMousemove)
      window.addEventListener('mouseout', this.handleMouseout)
      gl.requestAnimationFrame(this.anime)
    })
  }

  private init() {
    gl.setup(this.container)
    gl.camera.position.z = 5
  }

  private async createObjects() {
    const loader = new THREE.TextureLoader()
    const cardImages = document.querySelectorAll<HTMLElement>('.cards .img')

    const imageDatas = await Promise.all(
      [...cardImages].map(async (card) => ({ texture: await loader.loadAsync(card.dataset.imgSrc), element: card })),
    )

    const material = new THREE.ShaderMaterial({
      uniforms: {
        tImage: { value: null },
        uCoveredScale: { value: new THREE.Vector2() },
        uProgress: { value: 0 },
        uTime: { value: 0 },
        uAspect: { value: 1 },
        uSpeed: { value: 0 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
    })

    imageDatas.forEach((data) => {
      const rect = data.element.getBoundingClientRect()
      const coveredScale = calcCoveredTextureScale(data.texture, rect.width / rect.height)
      const aspect = data.texture.image.width / data.texture.image.height

      const geometry = new THREE.PlaneGeometry(1, 1, 50, 50)
      const mat = material.clone()
      mat.uniforms.tImage.value = data.texture
      mat.uniforms.uCoveredScale.value.set(coveredScale[0], coveredScale[1])
      mat.uniforms.uAspect.value = aspect

      const mesh = new THREE.Mesh(geometry, mat)
      mesh.userData.element = data.element
      this.images.add(mesh)
    })

    gl.scene.add(this.images)

    this.syncImages()
  }

  private updateImagesUniforms(callback: (uniforms: { [uniform: string]: THREE.IUniform<any> }) => void) {
    this.images.children.forEach((child) => {
      callback(((child as THREE.Mesh).material as THREE.ShaderMaterial).uniforms)
    })
  }

  private syncImages() {
    this.images.children.forEach((child) => {
      const mesh = child as THREE.Mesh
      const element = mesh.userData.element as HTMLElement
      const rect = element.getBoundingClientRect()
      const width = (rect.width / gl.size.width) * 2
      const height = (rect.height / gl.size.height) * 2
      const x = ((rect.width / 2 + rect.left - gl.size.width / 2) * 2) / gl.size.width
      const y = ((gl.size.height / 2 - (rect.height / 2 + rect.top)) * 2) / gl.size.height
      mesh.scale.set(width, height, 1)
      mesh.position.set(x, y, 0)
    })
  }

  // ----------------------------------
  // intersection
  private handleMousemove = (e: MouseEvent) => {
    this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
    this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1
  }

  private handleMouseout = () => {
    this.pointer.set(99999, 99999)
  }

  private intersects() {
    this.raycaster.setFromCamera(this.pointer, gl.camera)
    const intersects = this.raycaster.intersectObjects([this.images])

    let intersectImage: THREE.Mesh

    if (0 < intersects.length) {
      intersectImage = intersects[0].object as THREE.Mesh
    }

    this.images.children.forEach((child) => {
      const uniforms = ((child as THREE.Mesh).material as THREE.ShaderMaterial).uniforms
      if (child === intersectImage) {
        gsap.to(uniforms.uProgress, { value: 1, duration: 2, ease: 'power1.out' })
      } else {
        gsap.to(uniforms.uProgress, { value: 0, duration: 0.8, ease: 'power1.out' })
      }
    })
  }

  // ----------------------------------
  // animation
  private anime = () => {
    this.currentScrollPos = THREE.MathUtils.lerp(this.currentScrollPos, window.scrollX, 0.1)
    const scrollSpeed = window.scrollX - this.currentScrollPos

    this.syncImages()
    this.intersects()
    this.updateImagesUniforms((uniforms) => {
      uniforms.uTime.value += gl.time.delta
      uniforms.uSpeed.value = scrollSpeed
    })
    gl.render()
  }

  // ----------------------------------
  // dispose
  dispose() {
    gl.dispose()
    window.removeEventListener('mousemove', this.handleMousemove)
    window.removeEventListener('mouseout', this.handleMouseout)
  }
}
