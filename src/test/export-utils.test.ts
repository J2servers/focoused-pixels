import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock URL and DOM APIs
const mockCreateObjectURL = vi.fn(() => 'blob:mock');
const mockRevokeObjectURL = vi.fn();
global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;

describe('exportToCSV', () => {
  let mockLink: { href: string; download: string; click: () => void };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLink = { href: '', download: '', click: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLElement);
    vi.spyOn(document.body, 'appendChild').mockReturnValue(null as unknown as Node);
    vi.spyOn(document.body, 'removeChild').mockReturnValue(null as unknown as Node);
  });

  it('creates CSV blob with BOM and correct data', async () => {
    const { exportToCSV } = await import('@/lib/export-utils');

    const data = [
      { name: 'Letreiro', price: 100 },
      { name: 'Display, especial', price: 200 },
    ];
    const columns = [
      { key: 'name', header: 'Nome' },
      { key: 'price', header: 'Preço' },
    ];

    exportToCSV(data, 'test', columns);

    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
    const calls = mockCreateObjectURL.mock.calls as unknown as Array<[Blob]>;
    const blobArg = calls[0][0];
    expect(blobArg).toBeInstanceOf(Blob);

    const text = await blobArg.text();
    expect(text).toContain('\uFEFF');
    expect(text).toContain('Nome,Preço');
    expect(text).toContain('"Display, especial"');

    expect(mockLink.click).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();
  });

  it('handles null values', async () => {
    const { exportToCSV } = await import('@/lib/export-utils');

    const data = [{ name: null, price: undefined }];
    const columns = [
      { key: 'name', header: 'Nome' },
      { key: 'price', header: 'Preço' },
    ];

    exportToCSV(data, 'test', columns);
    const calls = mockCreateObjectURL.mock.calls as unknown as Array<[Blob]>;
    const text = await calls[0][0].text();
    expect(text).toContain(',');
  });
});

describe('exportToJSON', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const mockLink = { href: '', download: '', click: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLElement);
    vi.spyOn(document.body, 'appendChild').mockReturnValue(null as unknown as Node);
    vi.spyOn(document.body, 'removeChild').mockReturnValue(null as unknown as Node);
  });

  it('creates valid JSON blob', async () => {
    const { exportToJSON } = await import('@/lib/export-utils');

    const data = [{ id: 1, name: 'Test' }];
    exportToJSON(data, 'test');

    const calls = mockCreateObjectURL.mock.calls as unknown as Array<[Blob]>;
    const text = await calls[0][0].text();
    const parsed = JSON.parse(text);
    expect(parsed).toEqual(data);
  });
});
