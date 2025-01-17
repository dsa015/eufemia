import { renderHook } from '@testing-library/react'
import useMountEffect from '../useMountEffect'

describe('useMountEffect', () => {
  it('should run on first mount', () => {
    const effect = jest.fn()
    renderHook(() => useMountEffect(effect))
    expect(effect).toHaveBeenCalledTimes(1)
  })

  it('should not run on re-renders', () => {
    const effect = jest.fn()
    const { rerender } = renderHook(() => useMountEffect(effect))

    rerender()
    rerender()
    rerender()
    expect(effect).toHaveBeenCalledTimes(1)
  })
})
