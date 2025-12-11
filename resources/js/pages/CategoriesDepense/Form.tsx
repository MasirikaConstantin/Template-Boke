import React, { useEffect } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, X, Folder, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { PageHeader } from '@/layout/PageHeader';

interface CategorieDepenseFormProps {
  auth: any;
  categorie?: {
    id: number;
    nom_categorie: string;
    code: string;
    description: string | null;
    est_actif: boolean;
    ref: string;
  };
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function CategorieDepenseForm({ auth, categorie, flash }: CategorieDepenseFormProps) {
  const isEdit = !!categorie;
  const title = isEdit ? 'Modifier la catégorie' : 'Nouvelle catégorie';
  const submitUrl = isEdit ? `/categories-depense/${categorie.id}` : '/categories-depense';
  const submitMethod = isEdit ? 'put' : 'post';

  const { data, setData, post, put, processing, errors, reset } = useForm({
    nom_categorie: categorie?.nom_categorie || '',
    code: categorie?.code || '',
    description: categorie?.description || '',
    est_actif: categorie?.est_actif ?? true,
  });

  useEffect(() => {
    if (flash?.success) {
      setTimeout(() => {
        router.visit('/categories-depense');
      }, 2000);
    }
  }, [flash?.success]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEdit) {
      put(submitUrl, {
        preserveScroll: true,
        onSuccess: () => reset(),
      });
    } else {
      post(submitUrl, {
        preserveScroll: true,
        onSuccess: () => reset(),
      });
    }
  };

  const generateCodeFromName = () => {
    if (!data.nom_categorie || data.code) return;
    
    const code = data.nom_categorie
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .slice(0, 20);
    
    setData('code', code);
  };

  return (
    <>
      <Head title={title} />
      
      <DashboardLayout activeRoute="/budgets">
        <PageHeader
          title={title}
          description={isEdit ? 'Modifier les informations de la catégorie' : 'Créer une nouvelle catégorie de dépense'}
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Budgets', href: '/budgets' },
            { label: 'Catégories', href: '/categories-depense' },
            { label: title, href: '#' },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Link href="/categories-depense">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </Link>
            </div>
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

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5 text-primary" />
                Informations de la catégorie
              </CardTitle>
              <CardDescription>
                Remplissez les informations ci-dessous pour {isEdit ? 'modifier' : 'créer'} la catégorie de dépense
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {isEdit && categorie.ref && (
                  <div className="text-sm text-muted-foreground">
                    Référence: {categorie.ref}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nom_categorie">
                        Nom de la catégorie *
                      </Label>
                      <Input
                        id="nom_categorie"
                        value={data.nom_categorie}
                        onChange={(e) => setData('nom_categorie', e.target.value)}
                        onBlur={generateCodeFromName}
                        placeholder="Ex: Marketing, Développement, Administration"
                        className={errors.nom_categorie ? 'border-destructive' : ''}
                        required
                      />
                      {errors.nom_categorie && (
                        <p className="text-sm text-destructive">{errors.nom_categorie}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="code">
                        Code unique *
                      </Label>
                      <Input
                        id="code"
                        value={data.code}
                        onChange={(e) => setData('code', e.target.value)}
                        placeholder="Ex: MARKETING, DEV, ADMIN"
                        className={errors.code ? 'border-destructive' : ''}
                        required
                      />
                      {errors.code && (
                        <p className="text-sm text-destructive">{errors.code}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Code unique en majuscules (utilisé pour les références)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={data.description}
                      onChange={(e) => setData('description', e.target.value)}
                      placeholder="Description détaillée de la catégorie..."
                      rows={3}
                      className={errors.description ? 'border-destructive' : ''}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">{errors.description}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 pt-4">
                    <Checkbox
                      id="est_actif"
                      checked={data.est_actif}
                      onCheckedChange={(checked) => setData('est_actif', checked === true)}
                    />
                    <Label htmlFor="est_actif" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Catégorie active
                    </Label>
                  </div>
                  {errors.est_actif && (
                    <p className="text-sm text-destructive">{errors.est_actif}</p>
                  )}
                </div>
              </CardContent>

              <Separator />

              <CardFooter className="flex justify-between p-6">
                <Link href="/categories-depense">
                  <Button type="button" variant="outline">
                    <X className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                </Link>
                
                <Button type="submit" disabled={processing}>
                  <Save className="h-4 w-4 mr-2" />
                  {processing ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer'}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {isEdit && (
            <Card className="mt-6 border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive">Zone dangereuse</CardTitle>
                <CardDescription>
                  Actions irréversibles sur cette catégorie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border border-destructive/20 rounded-lg">
                    <h4 className="font-medium text-destructive mb-2">Supprimer la catégorie</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Une fois supprimée, cette catégorie ne pourra plus être utilisée pour les nouvelles dépenses.
                      Les dépenses existantes conserveront cette catégorie.
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
                          router.delete(`/categories-depense/${categorie.id}`);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer la catégorie
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}