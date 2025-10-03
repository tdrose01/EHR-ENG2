import { mount } from '@vue/test-utils'
import AddPatientForm from '../../src/components/AddPatientForm.vue'

describe('AddPatientForm.vue', () => {
  it('renders a date of birth input', () => {
    const wrapper = mount(AddPatientForm)
    const dobInput = wrapper.find('input[type="date"]')
    expect(dobInput.exists()).toBe(true)
  })

  it('submits the form with the correct date of birth', async () => {
    const wrapper = mount(AddPatientForm)
    await wrapper.find('input[type="date"]').setValue('1990-01-01')
    await wrapper.find('[data-test="occ-code-select"]').setValue('21')

    // Mock the fetch call
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    )

    await wrapper.find('form').trigger('submit.prevent')

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/patients',
      expect.objectContaining({
        body: expect.stringContaining('"date_of_birth":"1990-01-01"'),
        body: expect.stringContaining('"occ_code":21')
      })
    )
  })
})