/**
 * fireEvent
 * @param ele 
 * @param eventName 
 * @param customEventName 
 */
export function fireEvent(ele: string, customEventName: string, eventName = 'click'): void {
  document.querySelectorAll(ele).forEach(el => {
    el.addEventListener(eventName, e => {
        e.preventDefault()
        e.stopPropagation()
        const customEvent = new CustomEvent(customEventName, {
            detail: {
                target: e?.target,
                ...(e?.target as HTMLElement)?.dataset
            }
        })  
        window.dispatchEvent(customEvent)
      })
  })
}
