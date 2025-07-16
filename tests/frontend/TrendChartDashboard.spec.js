import { mount } from '@vue/test-utils';
import TrendChartDashboard from '../../src/components/TrendChartDashboard.vue';
import { nextTick } from 'vue';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock the global fetch API
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      data: [
        { timestamp_utc: new Date().toISOString(), value: 85 },
        { timestamp_utc: new Date(Date.now() + 1000).toISOString(), value: 88 },
      ],
    }),
  })
);

// Mock the vue-chartjs Line component
vi.mock('vue-chartjs', () => ({
  Line: {
    template: '<div></div>', // Render a simple div as a placeholder
  },
}));

describe('TrendChartDashboard.vue', () => {
  let wrapper;

  beforeEach(async () => {
    wrapper = mount(TrendChartDashboard);
    await nextTick();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component and fetches initial data', () => {
    expect(wrapper.exists()).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('fetches new data when filters are changed', async () => {
    await wrapper.find('select#metric').setValue('air_quality');
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('displays a loading state while fetching data', async () => {
    wrapper.vm.loading = true;
    await nextTick();
    expect(wrapper.text()).toContain('Loading Chart Data...');
  });

  it('displays an error message on API failure', async () => {
    global.fetch.mockImplementationOnce(() => Promise.reject(new Error('API Error')));
    await wrapper.vm.fetchChartData();
    expect(wrapper.vm.error).toBe('Failed to fetch exposure data.');
  });

  it('correctly computes chart data with spec limits', () => {
    const chartData = wrapper.vm.chartData;
    expect(chartData.datasets.length).toBe(3); // Value, Upper, Lower
    expect(chartData.datasets[0].label).toBe('Upper Spec Limit');
    expect(chartData.datasets[1].label).toBe('Metric Value');
    expect(chartData.datasets[2].label).toBe('Lower Spec Limit');
  });
});
