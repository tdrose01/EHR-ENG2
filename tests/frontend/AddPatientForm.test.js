const { mount } = require('@vue/test-utils')
const Vue = require('vue')
global.Vue = Vue
const AddPatientForm = require('../../src/components/AddPatientForm.vue').default

describe('AddPatientForm', () => {
  it('updates model when branch of service selected', async () => {
    const wrapper = mount(AddPatientForm)
    const select = wrapper.find('[data-test="branch-select"]')
    await select.setValue('Navy')
    expect(wrapper.vm.form.branch_of_service).toBe('Navy')
  })
})
