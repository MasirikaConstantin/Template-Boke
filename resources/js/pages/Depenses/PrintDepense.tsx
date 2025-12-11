import React from 'react';

interface DepenseData {
  id: number;
  reference: string;
  libelle: string;
  montant: string;
  mode_paiement: string;
  beneficiaire: string;
  description: string | null;
  date_depense: string;
  numero_piece: string;
  statut: string;
  budget: {
    annee: string;
    mois: string;
    nom_complet?: string; // Si disponible via un accesseur
  };
  categorie: {
    nom_categorie: string;
    code: string;
  };
  user: {
    name: string;
  };
  approbations: Array<{
    decision: string;
    commentaire: string;
    created_at: string;
    user: {
      name: string;
    };
  }>;
}

interface PrintDepenseProps {
  depense: DepenseData;
}

const PrintDepense = React.forwardRef<HTMLDivElement, PrintDepenseProps>(
  ({ depense }, ref) => {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('fr-FR');
    };

    return (
      // Styles inline pour garantir qu'ils s'appliquent à l'impression
      <div ref={ref} style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        {/* En-tête */}
        <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
          <h1 style={{ margin: 0 }}>Fiche de Dépense</h1>
          <p style={{ margin: '5px 0' }}>Référence: <strong>{depense.reference}</strong></p>
          <p style={{ margin: '5px 0' }}>Date d'émission: {new Date().toLocaleDateString('fr-FR')}</p>
        </div>

        {/* Informations principales sur 2 colonnes */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ flex: '1', minWidth: '250px', marginRight: '20px' }}>
            <h3>Détails de la transaction</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 0', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>Libellé :</td>
                  <td style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>{depense.libelle}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>Bénéficiaire :</td>
                  <td style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>{depense.beneficiaire}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>Montant :</td>
                  <td style={{ padding: '8px 0', borderBottom: '1px solid #eee', fontWeight: 'bold', fontSize: '1.2em' }}>
                    {parseFloat(depense.montant).toLocaleString('fr-FR', { style: 'currency', currency: 'USD' }).replace('$US', '$')}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>Mode de paiement :</td>
                  <td style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>{depense.mode_paiement}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>Statut :</td>
                  <td style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      backgroundColor: depense.statut === 'paye' ? '#d1fae5' : '#fef3c7',
                      color: depense.statut === 'paye' ? '#065f46' : '#92400e',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      {depense.statut}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ flex: '1', minWidth: '250px' }}>
            <h3>Contexte & Classification</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 0', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>Période budgétaire :</td>
                  <td style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                    {depense.budget.mois} {depense.budget.annee}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>Catégorie :</td>
                  <td style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                    {depense.categorie.nom_categorie} ({depense.categorie.code})
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>Date de la dépense :</td>
                  <td style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>{formatDate(depense.date_depense)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>N° de pièce :</td>
                  <td style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>{depense.numero_piece}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>Saisie par :</td>
                  <td style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>{depense.user.name}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Description */}
        {depense.description && (
          <div style={{ marginBottom: '20px' }}>
            <h3>Description</h3>
            <div style={{
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderLeft: '4px solid #3b82f6',
              borderRadius: '4px'
            }}>
              {depense.description}
            </div>
          </div>
        )}

        {/* Historique des approbations */}
        {depense.approbations && depense.approbations.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3>Historique des approbations</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #000' }}>Approbateur</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #000' }}>Décision</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #000' }}>Commentaire</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #000' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {depense.approbations.map((approbation) => (
                  <tr key={approbation.id}>
                    <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{approbation.user.name}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor: approbation.decision === 'approuve' ? '#d1fae5' : '#fee2e2',
                        color: approbation.decision === 'approuve' ? '#065f46' : '#dc2626',
                        fontWeight: 'bold'
                      }}>
                        {approbation.decision}
                      </span>
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{approbation.commentaire}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{formatDate(approbation.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pied de page */}
        <div style={{
          marginTop: '40px',
          paddingTop: '20px',
          borderTop: '2px solid #000',
          textAlign: 'center',
          fontSize: '0.9em',
          color: '#666'
        }}>
          <p>Document généré le {new Date().toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
          <p>Système de Gestion Budgétaire © {new Date().getFullYear()}</p>
        </div>
      </div>
    );
  }
);

PrintDepense.displayName = 'PrintDepense';

export default PrintDepense;