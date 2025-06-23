import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Login from '../../src/components/Login.vue'

const mockPush = vi.fn()

global.fetch = vi.fn()

describe('Login.vue', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    global.fetch = vi.fn()
  })

  it('renders login form', () => {
    const wrapper = mount(Login, {
      global: {
        mocks: { $router: { push: mockPush } }
      }
    })
    expect(wrapper.find('input#email').exists()).toBe(true)
    expect(wrapper.find('input#password').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').text()).toContain('Log In')
  })

  it('updates v-models for email and password', async () => {
    const wrapper = mount(Login, {
      global: {
        mocks: { $router: { push: mockPush } }
      }
    })
    const emailInput = wrapper.find('input#email')
    const passwordInput = wrapper.find('input#password')
    await emailInput.setValue('test@example.com')
    await passwordInput.setValue('secret')
    expect(wrapper.vm.email).toBe('test@example.com')
    expect(wrapper.vm.password).toBe('secret')
  })

  it('toggles password visibility', async () => {
    const wrapper = mount(Login, {
      global: {
        mocks: { $router: { push: mockPush } }
      }
    })
    const toggleBtn = wrapper.find('button[type="button"]')
    expect(wrapper.vm.showPassword).toBe(false)
    await toggleBtn.trigger('click')
    expect(wrapper.vm.showPassword).toBe(true)
    await toggleBtn.trigger('click')
    expect(wrapper.vm.showPassword).toBe(false)
  })

  it('logs in successfully and redirects', async () => {
    global.fetch = vi.fn(() => Promise.resolve({
      json: () => Promise.resolve({ success: true, role: 'user' })
    }))
    const wrapper = mount(Login, {
      global: {
        mocks: { $router: { push: mockPush } }
      }
    })
    await wrapper.find('input#email').setValue('test@example.com')
    await wrapper.find('input#password').setValue('secret')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()
    expect(mockPush).toHaveBeenCalledWith('/select-module')
    expect(wrapper.vm.error).toBe('')
  })

  it('shows error on failed login', async () => {
    global.fetch = vi.fn(() => Promise.resolve({
      json: () => Promise.resolve({ success: false, message: 'Invalid credentials' })
    }))
    const wrapper = mount(Login, {
      global: {
        mocks: { $router: { push: mockPush } }
      }
    })
    await wrapper.find('input#email').setValue('fail@example.com')
    await wrapper.find('input#password').setValue('wrong')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()
    expect(wrapper.text()).toContain('Invalid credentials')
  })

  it('shows error on fetch/network error', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')))
    const wrapper = mount(Login, {
      global: {
        mocks: { $router: { push: mockPush } }
      }
    })
    await wrapper.find('input#email').setValue('fail@example.com')
    await wrapper.find('input#password').setValue('wrong')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()
    expect(wrapper.text()).toContain('An error occurred during login')
  })
}) 