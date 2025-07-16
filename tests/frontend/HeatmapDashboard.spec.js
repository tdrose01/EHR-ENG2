import { mount } from '@vue/test-utils';
import HeatmapDashboard from '../../src/components/HeatmapDashboard.vue';
import { nextTick } from 'vue';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock ResizeObserver
const ResizeObserverMock = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
vi.stubGlobal('ResizeObserver', ResizeObserverMock);

// Mock the global fetch API
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      data: [
        { value: 50 },
        { value: 55 },
      ],
    }),
  })
);

// Mock the vue-heatmapjs component
vi.mock('vue-heatmapjs', () => ({
  default: {
    template: '<div class="mock-heatmap"></div>',
  },
}));

describe('HeatmapDashboard.vue', () => {
  let wrapper;

  beforeEach(async () => {
    wrapper = mount(HeatmapDashboard);
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
    expect(wrapper.text()).toContain('Loading Heatmap Data...');
  });

  it('displays an error message on API failure', async () => {
    global.fetch.mockImplementationOnce(() => Promise.reject(new Error('API Error')));
    await wrapper.vm.fetchHeatmapData();
    expect(wrapper.vm.error).toBe('Failed to fetch exposure data.');
  });
});
