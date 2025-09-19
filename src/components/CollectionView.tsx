// packages/builder/src/components/CollectionView.tsx
"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';

// --- Sous-composant : Vue Détaillée (Améliorée) ---
const DetailView = ({ entryId, schema, collectionName, onBack }: any) => {
  const [entry, setEntry] = useState<Record<string, any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEntry = async () => {
      setIsLoading(true);
      const res = await fetch(`/api/get-collection-entry?id=${entryId}&collection=${collectionName}`);
      if (res.ok) setEntry(await res.json());
      setIsLoading(false);
    };
    fetchEntry();
  }, [entryId, collectionName]);

  if (isLoading) return <div className="p-6">Chargement de l'entrée...</div>;
  if (!entry) return <div className="p-6 text-red-500">Impossible de charger cette entrée.</div>;

  // --- NOUVELLE LOGIQUE ---
  // On identifie les champs qui sont dans les données mais pas dans le schéma
  const schemaFieldNames = new Set(schema.fields.map((f: any) => f.name));
  const extraDataKeys = Object.keys(entry).filter(key => !schemaFieldNames.has(key) && key !== 'id');

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-4 border-b">
        <button onClick={onBack} className="text-sm text-blue-600 hover:underline">&larr; Retour à la liste</button>
      </div>
      
      {/* Champs définis par le schéma */}
      <dl className="p-6">
        {schema.fields.map((field: any) => {
          const value = entry[field.name];
          return (
            <div key={field.name} className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">{field.label}</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {field.type === 'image' && value ? (
                  <Image src={`/api/serve-private-image?file=${value}`} alt="Pièce jointe" width={200} height={200} className="object-cover rounded" />
                ) : (
                  // Affiche "N/A" si la valeur est absente, sinon la valeur elle-même
                  <p className="whitespace-pre-wrap">{value ?? <span className="text-gray-400 italic">N/A</span>}</p>
                )}
              </dd>
            </div>
          );
        })}
      </dl>

      {/* Affiche les champs supplémentaires qui ne sont pas dans le schéma */}
      {extraDataKeys.length > 0 && (
          <div className="p-6 border-t">
              <h3 className="text-base font-semibold text-gray-800 mb-4">Données brutes (non définies dans le schéma)</h3>
              <dl>
                  {extraDataKeys.map(key => (
                       <div key={key} className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
                           <dt className="text-sm font-medium text-gray-500 capitalize">{key}</dt>
                           <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-wrap">{entry[key]}</dd>
                       </div>
                  ))}
              </dl>
          </div>
      )}
    </div>
  );
};

// --- Sous-composant : Vue Liste (Améliorée) ---
const ListView = ({ collectionName, schema, onEntrySelect, sortOrder, onSortChange }: any) => {
  const [data, setData] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const res = await fetch(`/api/list-collection-entries?collection=${collectionName}&page=${page}&limit=10&sortOrder=${sortOrder}`);
      if (res.ok) {
        setData(await res.json());
      } else {
        setData(null);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [page, collectionName, sortOrder]);

  if (isLoading) return <div>Chargement des entrées...</div>;
  if (!data || !data.entries) return <div className="text-red-500">Erreur: Impossible de charger les données de la collection.</div>;

  const { entries, pagination } = data;
  
  return (
    <div>
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              {schema.fields.map((field: any) => (
                <th key={field.name} className="px-6 py-3 border-b-2 text-left text-xs font-semibold text-gray-600 uppercase">
                  {field.name === 'date' ? (
                    <button onClick={onSortChange} className="flex items-center">
                      {field.label} {sortOrder === 'desc' ? '▼' : '▲'}
                    </button>
                  ) : field.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {entries.map((entry: any) => (
              <tr key={entry.id} onClick={() => onEntrySelect(entry.id)} className="cursor-pointer hover:bg-gray-50">
                {schema.fields.map((field: any) => {
                  const value = entry[field.name];
                  return (
                    <td key={field.name} className="px-6 py-4 border-b max-w-xs truncate">
                      {field.type === 'image' && value ? (
                        <Image src={`/api/serve-private-image?file=${value}`} alt="" width={40} height={40} className="object-cover rounded" />
                      ) : (
                        // Affiche "N/A" si la valeur est absente
                        <span className="text-sm text-gray-900">{value ?? <span className="text-gray-400 italic">N/A</span>}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {entries.length === 0 && <p className="text-center p-8 text-gray-500">Aucune entrée trouvée.</p>}
      </div>
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex justify-between items-center text-sm">
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="px-4 py-2 border rounded-md disabled:opacity-50">Précédent</button>
          <span>Page {pagination.currentPage} sur {pagination.totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page === pagination.totalPages} className="px-4 py-2 border rounded-md disabled:opacity-50">Suivant</button>
        </div>
      )}
    </div>
  );
};

// --- Composant Principal (Chef d'Orchestre) ---
export const CollectionView = ({ collectionName, schema }: { collectionName: string, schema: any }) => {
  const [view, setView] = useState({ mode: 'list', selectedId: null });
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  
  return (
    <>
      {view.mode === 'list' ? (
        <ListView
          collectionName={collectionName}
          schema={schema}
          onEntrySelect={(id: any) => setView({ mode: 'detail', selectedId: id })}
          sortOrder={sortOrder}
          onSortChange={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
        />
      ) : (
        <DetailView
          entryId={view.selectedId}
          schema={schema}
          collectionName={collectionName}
          onBack={() => setView({ mode: 'list', selectedId: null })}
        />
      )}
    </>
  );
};