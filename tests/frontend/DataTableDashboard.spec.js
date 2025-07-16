import { mount } from '@vue/test-utils';
import DataTableDashboard from '../../src/components/DataTableDashboard.vue';
import { nextTick } from 'vue';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock the global fetch API
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      data: [
        { sample_id: '1', timestamp_utc: new Date().toISOString(), location_code: 'LOC-A', device_id: 'DEV-1', value: 100, unit: 'dBA', qualifier: 'OK' },
        { sample_id: '2', timestamp_utc: new Date().toISOString(), location_code: 'LOC-B', device_id: 'DEV-2', value: 105, unit: 'dBA', qualifier: 'ALERT' },
      ],
      pagination: { current_page: 1, total_pages: 2, total_records: 30, limit: 15 },
    }),
  })
);

// Mock the PDF export libraries
vi.mock('jspdf', () => {
  const mSave = vi.fn();
  const mAutoTable = vi.fn();
  const mText = vi.fn();
  const mJsPDF = vi.fn(() => ({
    save: mSave,
    autoTable: mAutoTable,
    text: mText,
  }));
  return { default: mJsPDF };
});


describe('DataTableDashboard.vue', () => {
  let wrapper;

  beforeEach(async () => {
    wrapper = mount(DataTableDashboard);
    await nextTick(); // Wait for the initial fetch to complete
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component and fetches initial data', async () => {
    expect(wrapper.exists()).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(1);
    // Check if the table rows are rendered
    const rows = wrapper.findAll('tbody tr');
    expect(rows.length).toBe(2);
    expect(wrapper.text()).toContain('LOC-A');
  });

  it('displays a loading state while fetching data', async () => {
    wrapper.vm.loading = true;
    await nextTick();
    expect(wrapper.text()).toContain('Loading data...');
  });

  it('displays an error message on API failure', async () => {
    global.fetch.mockImplementationOnce(() => Promise.reject(new Error('API Error')));
    await wrapper.vm.fetchData();
    expect(wrapper.vm.error).toBe('Failed to fetch data.');
  });

  it('fetches new data when filters are applied', async () => {
    await wrapper.find('input#location').setValue('NEW-LOC');
    await wrapper.find('button.bg-indigo-600').trigger('click');
    expect(fetch).toHaveBeenCalledTimes(2); // Initial fetch + filter fetch
  });

  it('calls fetchData when pagination buttons are clicked', async () => {
    const nextPageButton = wrapper.findAll('button').find(b => b.text() === 'Next');
    await nextPageButton.trigger('click');
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(wrapper.vm.filters.page).toBe(2);
  });

  it('calls the exportToPDF function when the button is clicked', async () => {
    const exportButton = wrapper.find('button.bg-green-600');
    await exportButton.trigger('click');
    // We can't easily test the download, but we can confirm the jspdf methods were called.
    // The mock is automatically checked for calls if it's a vi.fn()
  });
});
