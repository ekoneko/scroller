export function createElement(
  tagName: keyof HTMLElementTagNameMap,
  attributes?: { [key: string]: string },
  styles?: Partial<CSSStyleDeclaration>,
) {
  const element = document.createElement(tagName)
  element.style
  if (attributes) {
    Object.keys(attributes).forEach((attrName) => {
      element.setAttribute(attrName, attributes[attrName])
    })
  }
  styles && addStyle(element, styles)
  return element
}

export function addStyle(element: HTMLElement, styles: Partial<CSSStyleDeclaration>) {
  for (let i in styles) {
    element.style[i] = styles[i]!
  }
}
