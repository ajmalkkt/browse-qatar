import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getVerticalService } from '../services/verticalServiceFactory';
import OffersGrid from './OffersGrid';
import { verticalConfig } from '../config/verticalConfig';
import { MapPin, Filter } from 'lucide-react';

export default function ModernListing() {
  const { vertical } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<Record<string, any>>(() => {
    const obj: Record<string, any> = {};
    for (const [k, v] of searchParams.entries()) obj[k] = v;
    return obj;
  });

  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const config = vertical ? verticalConfig[vertical] : null;

  useEffect(() => {
    // sync url -> filters
    const obj: Record<string, any> = {};
    for (const [k, v] of searchParams.entries()) obj[k] = v;
    setFilters(obj);
  }, [searchParams]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        if (!vertical) return;
        const service = getVerticalService(vertical);
        const data = await service.getAll(filters);
        setListings(data || []);
      } catch (err) {
        console.error('ModernListing fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [vertical, filters]);

  const onFilterChange = (key: string, value: any) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    const params = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
    });
    setSearchParams(params);
  };

  const leftFilters = useMemo(() => config?.filters || {}, [config]);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1200px] px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
          <aside className="hidden lg:block">
            <div className="sticky top-6 space-y-4">
              <div className="flex items-center gap-2 rounded-md border bg-slate-50 p-3">
                <Filter className="h-5 w-5 text-slate-600" />
                <h3 className="text-sm font-semibold">Filters</h3>
              </div>

              <div className="rounded-lg border p-4">
                {Object.entries(leftFilters).map(([key, def]: any) => {
                  if (def.type === 'select' && def.options) {
                    return (
                      <div key={key} className="mb-3">
                        <label className="block text-sm font-medium text-slate-700">{key}</label>
                        <select value={filters[key] || ''} onChange={(e) => onFilterChange(key, e.target.value)} className="mt-2 w-full rounded-md border px-2 py-2">
                          <option value="">All</option>
                          {def.options.map((o: any) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                    );
                  }

                  if (def.type === 'multiselect' && def.source) {
                    return (
                      <div key={key} className="mb-3">
                        <label className="block text-sm font-medium text-slate-700">{key}</label>
                        <input placeholder={`Filter ${key}`} value={filters[key] || ''} onChange={(e) => onFilterChange(key, e.target.value)} className="mt-2 w-full rounded-md border px-2 py-2" />
                      </div>
                    );
                  }

                  if (def.type === 'number' || def.type === 'range') {
                    return (
                      <div key={key} className="mb-3">
                        <label className="block text-sm font-medium text-slate-700">{key}</label>
                        <div className="mt-2 flex gap-2">
                          <input type="number" placeholder={String(def.min || '')} value={filters[`${key}Min`] || ''} onChange={(e) => onFilterChange(`${key}Min`, e.target.value)} className="w-1/2 rounded-md border px-2 py-2" />
                          <input type="number" placeholder={String(def.max || '')} value={filters[`${key}Max`] || ''} onChange={(e) => onFilterChange(`${key}Max`, e.target.value)} className="w-1/2 rounded-md border px-2 py-2" />
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={key} className="mb-3">
                      <label className="block text-sm font-medium text-slate-700">{key}</label>
                      <input placeholder={`Filter ${key}`} value={filters[key] || ''} onChange={(e) => onFilterChange(key, e.target.value)} className="mt-2 w-full rounded-md border px-2 py-2" />
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">{config?.name || (vertical + ' listings')}</h1>
                <p className="text-sm text-slate-500">Browse recent and promoted listings in {vertical}</p>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <MapPin className="h-4 w-4" /> Doha
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold">Promoted</h2>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {(listings || []).slice(0, 3).map((l) => (
                  <div key={l.id} className="rounded-lg border p-3">
                    <img src={l.imageUrl || '/images/ui/placeholder.png'} alt={l.title} className="h-36 w-full object-cover rounded" />
                    <h3 className="mt-2 font-semibold">{l.title}</h3>
                    <p className="text-sm text-slate-500">{l.location}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Fresh recommendations</h2>
              <div className="mt-3">
                <OffersGrid offers={listings} restaurants={[]} isLoading={loading} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
