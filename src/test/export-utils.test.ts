import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCreateObjectURL = vi.fn(() => 'blob:mock');
const mockRevokeObjectURL = vi.fn();
global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;

describe('exportToCSV', () => {
  let mockClick: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockClick = vi.fn();
    vi.spyOn(document, 'createElement').mockReturnValue({
      href: '', download: '', click: mockClick, style: {},
    } as unknown as HTMLElement);
    vi.spyOn(document.body, 'appendChild').mockReturnValue(null as unknown as Node);
    vi.spyOn(document.body, 'removeChild').mockReturnValue(null as unknown as Node);
  });

  it('triggers download with correct filename pattern', async () => {
    const { exportToCSV } = await import('@/lib/export-utils');
    const data = [{ name: 'Test', price: 100 }];
    const columns = [{ key: 'name', header: 'Nome' }, { key: 'price', header: 'Preço' }];

    exportToCSV(data, 'pedidos', columns);

    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
    expect(mockClick).toHaveBeenCalledTimes(1);
    expect(mockRevokeObjectURL).toHaveBeenCalledTimes(1);
  });

  it('creates a Blob with csv type', async () => {
    const { exportToCSV } = await import('@/lib/export-utils');
    exportToCSV([{ a: 1 }], 'test', [{ key: 'a', header: 'A' }]);

    const blob = mockCreateObjectURL.mock.calls[0][0] as Blob;
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('text/csv;charset=utf-8;');
  });
});

describe('exportToJSON', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(document, 'createElement').mockReturnValue({
      href: '', download: '', click: vi.fn(), style: {},
    } as unknown as HTMLElement);
    vi.spyOn(document.body, 'appendChild').mockReturnValue(null as unknown as Node);
    vi.spyOn(document.body, 'removeChild').mockReturnValue(null as unknown as Node);
  });

  it('creates a Blob with json type', async () => {
    const { exportToJSON } = await import('@/lib/export-utils');
    exportToJSON([{ id: 1 }], 'test');

    const blob = mockCreateObjectURL.mock.calls[0][0] as Blob;
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/json');
  });
});
