import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreateUserForm from '../../src/components/CreateUserForm.vue';

global.fetch = vi.fn();

describe('CreateUserForm.vue', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn();
    localStorage.setItem('userEmail', 'admin@example.com');
  });

  it('renders the form', () => {
    const wrapper = mount(CreateUserForm);
    expect(wrapper.find('input#email').exists()).toBe(true);
    expect(wrapper.find('input#password').exists()).toBe(true);
    expect(wrapper.find('input#confirmPasswordUser').exists()).toBe(true);
    expect(wrapper.find('input#adminPassword').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
  });

  it('shows an error if fields are empty', async () => {
    const wrapper = mount(CreateUserForm);
    await wrapper.find('form').trigger('submit.prevent');
    expect(wrapper.vm.error).toBe('All fields are required');
  });

  it('shows an error if passwords do not match', async () => {
    const wrapper = mount(CreateUserForm);
    await wrapper.find('input#email').setValue('test@example.com');
    await wrapper.find('input#password').setValue('password');
    await wrapper.find('input#confirmPasswordUser').setValue('different-password');
    await wrapper.find('input#adminPassword').setValue('admin-password');
    await wrapper.find('form').trigger('submit.prevent');
    expect(wrapper.vm.error).toBe('Passwords do not match');
  });

  it('calls the API to create a user on successful submission', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
    const wrapper = mount(CreateUserForm);
    await wrapper.find('input#email').setValue('test@example.com');
    await wrapper.find('input#password').setValue('password');
    await wrapper.find('input#confirmPasswordUser').setValue('password');
    await wrapper.find('input#adminPassword').setValue('admin-password');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(global.fetch).toHaveBeenCalledWith('/api/admin/users', expect.any(Object));
    expect(wrapper.vm.success).toBe('User created successfully');
    expect(wrapper.emitted('user-created')).toBeTruthy();
  });

  it('shows an error if the API call fails', async () => {
    global.fetch.mockResolvedValue({ ok: false, json: () => Promise.resolve({ error: 'API Error' }) });
    const wrapper = mount(CreateUserForm);
    await wrapper.find('input#email').setValue('test@example.com');
    await wrapper.find('input#password').setValue('password');
    await wrapper.find('input#confirmPasswordUser').setValue('password');
    await wrapper.find('input#adminPassword').setValue('admin-password');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.vm.error).toBe('API Error');
  });
});
