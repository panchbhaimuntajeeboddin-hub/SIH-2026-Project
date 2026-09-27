import { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Filter,
  RefreshCw,
  Search,
  AlertCircle,
  CheckCircle2,
  Database,
  Layers,
  MapPin,
  TrendingUp,
  Users,
  ShieldCheck,
  Info,
  Server,
  KeyRound,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const INDIAN_STATES = [
  'All States',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagpur',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

interface UdyamResponse {
  success: boolean;
  isMock?: boolean;
  notice?: string;
  resourceId?: string;
  title?: string;
  total?: number;
  count?: number;
  limit?: number;
  offset?: number;
  filters?: {
    state: string | null;
    district: string | null;
  };
  records?: Record<string, any>[];
  error?: string;
  message?: string;
  details?: string;
}

export function UdyamDataPage() {
  const [selectedState, setSelectedState] = useState<string>('All States');
  const [districtInput, setDistrictInput] = useState<string>('');
  const [activeDistrict, setActiveDistrict] = useState<string>('');
  const [limit, setLimit] = useState<number>(20);
  const [offset, setOffset] = useState<number>(0);

  const [data, setData] = useState<UdyamResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (selectedState && selectedState !== 'All States') {
        params.append('state', selectedState);
      }
      if (activeDistrict) {
        params.append('district', activeDistrict);
      }
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());

      const response = await fetch(`/api/udyam?${params.toString()}`);

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(
          errJson.message ||
            errJson.error ||
            `Backend server error (HTTP ${response.status})`
        );
      }

      const resData: UdyamResponse = await response.json();
      if (resData.success === false) {
        throw new Error(resData.error || resData.message || 'Failed to fetch UDYAM data');
      }

      setData(resData);
    } catch (err: any) {
      setError(err.message || 'Network error while reaching backend endpoint.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedState, activeDistrict, limit, offset]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOffset(0);
    setActiveDistrict(districtInput.trim());
  };

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setOffset(0);
  };

  const records = data?.records || [];

  // Calculate summary metrics
  const totalMicro = records.reduce(
    (acc, r) => acc + (parseInt(r.micro_enterprises || r.micro || '0', 10) || 0),
    0
  );
  const totalSmall = records.reduce(
    (acc, r) => acc + (parseInt(r.small_enterprises || r.small || '0', 10) || 0),
    0
  );
  const totalMedium = records.reduce(
    (acc, r) => acc + (parseInt(r.medium_enterprises || r.medium || '0', 10) || 0),
    0
  );
  const totalUnits = records.reduce(
    (acc, r) =>
      acc +
      (parseInt(
        r.total_udyam_registrations || r.total_udyam || r.total_units || '0',
        10
      ) || 0),
    0
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
              <Database className="mr-1 h-3.5 w-3.5" /> Official Data.gov.in Integration
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Secure Backend Proxy
            </Badge>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            UDYAM MSME Registration Directory
          </h1>
          <p className="max-w-2xl text-sm sm:text-base text-slate-300">
            Real-time query engine fetching verified Government of India MSME Udyam registration statistics via our backend proxy. API credentials remain strictly secured on the server.
          </p>
          <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Server className="h-4 w-4 text-emerald-400" /> Backend Endpoint: <code className="rounded bg-slate-800 px-1.5 py-0.5 text-emerald-300 font-mono">GET /api/udyam</code>
            </span>
            <span className="flex items-center gap-1.5">
              <KeyRound className="h-4 w-4 text-amber-400" /> Key Storage: <code className="rounded bg-slate-800 px-1.5 py-0.5 text-amber-300 font-mono">DATA_GOV_API_KEY (.env)</code>
            </span>
          </div>
        </div>
      </div>

      {/* Filter Controls Card */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Filter className="h-5 w-5 text-emerald-600" /> State & District Data Filters
          </CardTitle>
          <CardDescription>
            Filter Ministry of MSME Udyam dataset by Indian State and District.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* State Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Select State / UT
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  data-testid="select-udyam-state"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* District Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  District Name
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="e.g. Pune, Thane, Ahmedabad"
                    value={districtInput}
                    onChange={(e) => setDistrictInput(e.target.value)}
                    className="pr-8 text-sm"
                    data-testid="input-udyam-district"
                  />
                  {districtInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setDistrictInput('');
                        setActiveDistrict('');
                      }}
                      className="absolute right-2 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Limit Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Page Size Limit
                </label>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setOffset(0);
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value={10}>10 records</option>
                  <option value={20}>20 records</option>
                  <option value={50}>50 records</option>
                  <option value={100}>100 records</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-end gap-2">
                <Button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
                  disabled={loading}
                  data-testid="button-fetch-udyam"
                >
                  {loading ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  Apply Filters
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedState('All States');
                    setDistrictInput('');
                    setActiveDistrict('');
                    setOffset(0);
                  }}
                  disabled={loading}
                  title="Reset Filters"
                >
                  Reset
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Backend API Notice or Status Alerts */}
      {data?.notice && (
        <Alert className="border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertTitle className="font-medium">Backend API Notice</AlertTitle>
          <AlertDescription className="text-xs sm:text-sm">
            {data.notice}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="border-red-500/50 bg-red-50 dark:bg-red-950/30">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Backend Endpoint Fetch Error</AlertTitle>
          <AlertDescription className="space-y-2 text-xs sm:text-sm">
            <p>{error}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={fetchData}
              className="mt-2 text-xs border-red-300 hover:bg-red-100 dark:hover:bg-red-900/40"
            >
              <RefreshCw className="mr-1 h-3 w-3" /> Retry Connection
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Metric Cards Summary */}
      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Total Registrations
                </p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {totalUnits > 0 ? totalUnits.toLocaleString('en-IN') : data?.total || 0}
                </p>
                <p className="text-[11px] text-slate-500">In filtered set</p>
              </div>
              <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <Building2 className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Micro Enterprises
                </p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {totalMicro > 0 ? totalMicro.toLocaleString('en-IN') : 'N/A'}
                </p>
                <p className="text-[11px] text-slate-500">Investment &lt; ₹1 Cr</p>
              </div>
              <div className="rounded-xl bg-blue-100 p-3 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                <Layers className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Small Enterprises
                </p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {totalSmall > 0 ? totalSmall.toLocaleString('en-IN') : 'N/A'}
                </p>
                <p className="text-[11px] text-slate-500">Investment &lt; ₹10 Cr</p>
              </div>
              <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <TrendingUp className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Medium Enterprises
                </p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {totalMedium > 0 ? totalMedium.toLocaleString('en-IN') : 'N/A'}
                </p>
                <p className="text-[11px] text-slate-500">Investment &lt; ₹50 Cr</p>
              </div>
              <div className="rounded-xl bg-purple-100 p-3 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                <Users className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Records Table Card */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-base font-semibold">
              Udyam Enterprise Records ({data?.count || 0} returned)
            </CardTitle>
            <CardDescription className="text-xs">
              Resource ID:{' '}
              <code className="font-mono text-emerald-600 font-semibold">
                {data?.resourceId || 'DATA_GOV_RESOURCE_ID'}
              </code>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={loading}
              className="text-xs"
            >
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Fetching UDYAM dataset from backend proxy...
              </p>
            </div>
          ) : records.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Building2 className="mx-auto h-10 w-10 text-slate-400 mb-2" />
              <p className="font-medium text-sm">No matching records found.</p>
              <p className="text-xs text-slate-400 mt-1">
                Try selecting a different State or clearing the District search.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3">State</th>
                    <th className="px-4 py-3">District</th>
                    <th className="px-4 py-3 text-right">Micro</th>
                    <th className="px-4 py-3 text-right">Small</th>
                    <th className="px-4 py-3 text-right">Medium</th>
                    <th className="px-4 py-3 text-right">Total Udyam</th>
                    <th className="px-4 py-3 text-right">Manufacturing / Service</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {records.map((rec, idx) => {
                    const stateName =
                      rec.state_name || rec.state || rec.state_name_ || 'N/A';
                    const districtName =
                      rec.district_name || rec.district || rec.district_name_ || 'N/A';
                    const micro = rec.micro_enterprises || rec.micro || '—';
                    const small = rec.small_enterprises || rec.small || '—';
                    const medium = rec.medium_enterprises || rec.medium || '—';
                    const totalReg =
                      rec.total_udyam_registrations ||
                      rec.total_udyam ||
                      rec.total_units ||
                      '—';
                    const mfg = rec.manufacturing_units || rec.manufacturing || '—';
                    const svc = rec.service_units || rec.service || '—';

                    return (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          {stateName}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                          {districtName}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-400">
                          {typeof micro === 'number'
                            ? micro.toLocaleString('en-IN')
                            : micro}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-400">
                          {typeof small === 'number'
                            ? small.toLocaleString('en-IN')
                            : small}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-400">
                          {typeof medium === 'number'
                            ? medium.toLocaleString('en-IN')
                            : medium}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {typeof totalReg === 'number'
                            ? totalReg.toLocaleString('en-IN')
                            : totalReg}
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-slate-500">
                          {mfg !== '—' && svc !== '—' ? (
                            <span>
                              <span className="text-blue-600 font-medium">{mfg} Mfg</span> /{' '}
                              <span className="text-purple-600 font-medium">{svc} Svc</span>
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Bar */}
          {!loading && records.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-4 py-3">
              <span className="text-xs text-slate-500">
                Showing offset {offset} to {offset + records.length}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={offset === 0 || loading}
                  onClick={() => setOffset((prev) => Math.max(0, prev - limit))}
                  className="text-xs"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={records.length < limit || loading}
                  onClick={() => setOffset((prev) => prev + limit)}
                  className="text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default UdyamDataPage;
