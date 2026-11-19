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

  it('signale une donnée ancienne avec son âge, puis se tait quand elle est rafraîchie', async () => {
    const store = useServerStatusStore()
    const wrapper = mount(ServerStatusBanner)

    store.staleResponse('/competitions/FL1/standings?{}', 2 * 3600)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('momentanément indisponible')
    expect(wrapper.text()).toContain("datent d'il y a 2 h")

    store.freshResponse('/competitions/FL1/standings?{}')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toBe('')
  })

  it('donne la priorité au quota atteint sur la donnée ancienne', async () => {
    const store = useServerStatusStore()
    const wrapper = mount(ServerStatusBanner)

    store.staleResponse('/competitions/FL1/standings?{}', 600)
    store.rateLimited(30)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Trop de demandes')
    expect(wrapper.text()).not.toContain('momentanément indisponible')
  })
})
