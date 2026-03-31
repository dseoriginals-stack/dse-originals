export function flyToCart(
  img: HTMLImageElement,
  cartEl: HTMLElement
) {

  const imgRect = img.getBoundingClientRect()
  const cartRect = cartEl.getBoundingClientRect()

  const clone = img.cloneNode(true) as HTMLImageElement

  clone.style.position = "fixed"
  clone.style.top = `${imgRect.top}px`
  clone.style.left = `${imgRect.left}px`
  clone.style.width = `${imgRect.width}px`
  clone.style.height = `${imgRect.height}px`
  clone.style.transition = "all 0.7s cubic-bezier(.65,-0.2,.3,1.5)"
  clone.style.zIndex = "9999"
  clone.style.pointerEvents = "none"

  document.body.appendChild(clone)

  requestAnimationFrame(() => {

    clone.style.top = `${cartRect.top}px`
    clone.style.left = `${cartRect.left}px`
    clone.style.width = "30px"
    clone.style.height = "30px"
    clone.style.opacity = "0.4"

  })

  setTimeout(() => {
    clone.remove()
  }, 700)

}