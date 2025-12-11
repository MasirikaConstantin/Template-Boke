import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Folder,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { PageHeader } from '@/layout/PageHeader';

interface CategorieDepense {
  id: number;
  nom_categorie: string;
  code: string;
  description: string | null;
  est_actif: boolean;
  ref: string;
  created_at: string;
  updated_at: string;
}

interface CategoriesDepensePageProps {
  auth: any;
  categories: {
    data: CategorieDepense[];
    links: any[];
    current_page: number;
    last_page: number;
    total: number;
  };
  filters: {
    search: string;
    per_page: number;
  };
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function CategoriesDepenseIndex({
  auth,
  categories,
  filters,
  flash,
}: CategoriesDepensePageProps) {
  const [search, setSearch] = useState(filters.search || '');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nom_categorie: '',
    code: '',
    description: '',
    est_actif: true,
  });

  React.useEffect(() => {
    const timer = setTimeout(() => {
      router.get('/categories-depense', { search }, {
        preserveState: true,
        replace: true,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const handleFilterChange = (key: string, value: string) => {
    router.get('/categories-depense', { ...filters, [key]: value }, {
      preserveState: true,
      replace: true,
    });
  };

  const startEdit = (categorie: CategorieDepense) => {
    setEditingId(categorie.id);
    setFormData({
      nom_categorie: categorie.nom_categorie,
      code: categorie.code,
      description: categorie.description || '',
      est_actif: categorie.est_actif,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      nom_categorie: '',
      code: '',
      description: '',
      est_actif: true,
    });
  };

  const handleUpdate = (id: number) => {
    router.put(`/categories-depense/${id}`, formData, {
      onSuccess: () => {
        cancelEdit();
      },
    });
  };

  const handleDelete = (categorie: CategorieDepense) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${categorie.nom_categorie}" ?`)) {
      router.delete(`/categories-depense/${categorie.id}`);
    }
  };

  return (
    <>
      <Head title="Catégories de dépenses" />
      
      <DashboardLayout activeRoute="/budgets">
        <PageHeader
          title="Catégories de dépenses"
          description={`${categories.total} catégories`}
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Budgets', href: '/budgets' },
            { label: 'Catégories', href: '/categories-depense' },
          ]}
          actions={
            <Button onClick={() => {
              // Modal pour créer une catégorie
              const nom = prompt('Nom de la catégorie:');
              const code = prompt('Code:');
              
              if (nom && code) {
                router.post('/categories-depense', {
                  nom_categorie: nom,
                  code: code,
                  description: prompt('Description (optionnelle):') || '',
                });
              }
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle catégorie
            </Button>
          }
        />

        {flash?.success && (
          <Alert className="mb-6">
            <AlertDescription>{flash.success}</AlertDescription>
          </Alert>
        )}

        {flash?.error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{flash.error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-card rounded-lg border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une catégorie..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={filters.per_page?.toString() || '15'}
                onChange={(e) => handleFilterChange('per_page', e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      <Folder className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p className="text-lg">Aucune catégorie trouvée</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.data.map((categorie) => (
                    <TableRow key={categorie.id} className="hover:bg-muted/50">
                      <TableCell>
                        {editingId === categorie.id ? (
                          <Input
                            value={formData.nom_categorie}
                            onChange={(e) => setFormData({...formData, nom_categorie: e.target.value})}
                            className="mb-2"
                          />
                        ) : (
                          <div>
                            <div className="font-medium">{categorie.nom_categorie}</div>
                            {categorie.description && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {categorie.description}
                              </div>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === categorie.id ? (
                          <Input
                            value={formData.code}
                            onChange={(e) => setFormData({...formData, code: e.target.value})}
                          />
                        ) : (
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {categorie.code}
                          </code>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === categorie.id ? (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={formData.est_actif}
                              onCheckedChange={(checked) => setFormData({...formData, est_actif: checked === true})}
                            />
                            <label className="text-sm">
                              {formData.est_actif ? 'Actif' : 'Inactif'}
                            </label>
                          </div>
                        ) : (
                          <Badge variant={categorie.est_actif ? "default" : "secondary"}>
                            {categorie.est_actif ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Actif
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Inactif
                              </>
                            )}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(categorie.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {editingId === categorie.id ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={cancelEdit}
                            >
                              Annuler
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleUpdate(categorie.id)}
                            >
                              Sauvegarder
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEdit(categorie)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(categorie)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {categories.last_page > 1 && (
            <div className="border-t p-4">
              <Pagination
                currentPage={categories.current_page}
                totalPages={categories.last_page}
                onPageChange={(page) => {
                  router.get('/categories-depense', { ...filters, page }, {
                    preserveState: true,
                    replace: true,
                  });
                }}
              />
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}