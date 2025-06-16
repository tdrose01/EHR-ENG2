const { mount } = require('@vue/test-utils')
const Vue = require('vue')
global.Vue = Vue
const PatientDashboard = require('../../src/components/PatientDashboard.vue').default

describe('PatientDashboard', () => {
  it('renders DoD Id column', async () => {
    global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve([]) }))
    const wrapper = mount(PatientDashboard)
    expect(wrapper.text()).toContain('DoD Id')
  })
})
