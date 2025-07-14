const { mount } = require('@vue/test-utils')
const Vue = require('vue')
global.Vue = Vue
const WaterTestForm = require('../../src/components/WaterTestForm.vue').default

global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }))

describe('WaterTestForm', () => {
  it('posts data and emits event', async () => {
    const wrapper = mount(WaterTestForm, { propsData: { patientId: 1 } })
    await wrapper.find('form').trigger('submit.prevent')
    expect(global.fetch).toHaveBeenCalled()
    expect(wrapper.emitted().saved).toBeTruthy()
  })
})
