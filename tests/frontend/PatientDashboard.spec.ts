import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import PatientDashboard from '../../src/components/PatientDashboard.vue'

describe('PatientDashboard.vue', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders patient summary when data loads', async () => {
    const mockPatients = [
      {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        gender: 'Male',
        paygrade: 'E5',
        branch_of_service: 'Army',
        date_of_birth: '1990-01-01',
        phone_number: '1234567890'
      }
    ]
    global.fetch = vi.fn(() =>
      Promise.resolve({ json: () => Promise.resolve(mockPatients) })
    )
    const wrapper = mount(PatientDashboard)
    await flushPromises()
    expect(wrapper.text()).toContain('John Doe')
    expect(wrapper.text()).toContain('Male')
    expect(wrapper.text()).toContain('E5')
    expect(wrapper.text()).toContain('Army')
  })

  it('displays loading indicator while fetching', async () => {
    let resolveFetch: any
    global.fetch = vi.fn(
      () => new Promise(resolve => { resolveFetch = resolve })
    )
    const wrapper = mount(PatientDashboard)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-test="loading"]').exists()).toBe(true)
    resolveFetch({ json: () => Promise.resolve([]) })
    await flushPromises()
  })

  it('shows error message when fetch fails', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('fail')))
    const wrapper = mount(PatientDashboard)
    await flushPromises()
    expect(wrapper.find('[data-test="error"]').exists()).toBe(true)
  })

  it('shows empty state when no patients returned', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ json: () => Promise.resolve([]) }))
    const wrapper = mount(PatientDashboard)
    await flushPromises()
    expect(wrapper.find('[data-test="empty"]').exists()).toBe(true)
  })
})
