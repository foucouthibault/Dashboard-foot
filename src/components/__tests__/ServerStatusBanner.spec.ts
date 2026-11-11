import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mount } from '@vue/test-utils'
import ServerStatusBanner from '@/components/ServerStatusBanner.vue'
import { useServerStatusStore, SLOW_REQUEST_DELAY_MS } from '@/stores/serverStatus'

describe('ServerStatusBanner', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("n'affiche rien quand le backend répond normalement", () => {
    const wrapper = mount(ServerStatusBanner)

    expect(wrapper.find('[role="status"]').text()).toBe('')
  })

  it('prévient que le serveur se réveille, puis se tait à la réponse', async () => {
    const store = useServerStatusStore()
    const wrapper = mount(ServerStatusBanner)

    const done = store.requestStarted()
    await vi.advanceTimersByTimeAsync(SLOW_REQUEST_DELAY_MS)
    expect(wrapper.text()).toContain('Le serveur se réveille')

    done()
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toBe('')
  })

  it('affiche le délai à attendre quand le quota est atteint', async () => {
    const store = useServerStatusStore()
    const wrapper = mount(ServerStatusBanner)

    store.rateLimited(30)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Trop de demandes')
    expect(wrapper.text()).toContain('30 s')
  })
})
