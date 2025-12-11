import React from 'react';

interface PaiementFraisData {
  id: number;
  reference: string;
  montant: string;
  mode_paiement: string;
  numero_cheque: string | null;
  commentaire: string | null;
  date_paiement: string;
  created_at: string;
  eleve: {
    matricule: string;
    nom_complet: string;
    nom: string;
    prenom: string;
    classe?: {
      nom_classe: string;
      cycle?: string;
    };
    nom_pere: string;
    nom_mere: string;
    telephone: string;
    adresse: string;
  };
  tranche: {
    nom_tranche: string;
    montant: string;
    date_limite: string;
  };
  user: {
    name: string;
  };
  historique_paiements: Array<{
    action: string;
    details: string;
    created_at: string;
    user: {
      name: string;
    };
  }>;
}

interface PrintPaiementFraisProps {
  paiement: PaiementFraisData;
}

const PrintPaiementFrais = React.forwardRef<HTMLDivElement, PrintPaiementFraisProps>(
  ({ paiement }, ref) => {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('fr-FR');
    };

    const formatMontant = (montant: string) => {
      return parseFloat(montant).toLocaleString('fr-FR', { 
        style: 'currency', 
        currency: 'USD',
        minimumFractionDigits: 0
      }).replace('$US', '$');
    };

    // Parse les détails d'historique
    const parseDetails = (details: string) => {
      try {
        return JSON.parse(details);
      } catch {
        return { details };
      }
    };

    return (
      <div ref={ref} style={{ 
        padding: '20px', 
        fontFamily: "'Times New Roman', Times, serif",
        fontSize: '12pt',
        backgroundColor: '#fff',
        color: '#000',
        lineHeight: '1.4'
      }}>
        {/* En-tête de l'école */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '25px',
          borderBottom: '3px double #000',
          paddingBottom: '15px'
        }}>
          {/* Logo et nom de l'école */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              border: '2px solid #000',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '20px',
              fontSize: '32px',
              fontWeight: 'bold'
            }}>
              É
            </div>
            <div style={{ textAlign: 'left' }}>
              <h1 style={{ 
                margin: 0, 
                fontSize: '24pt', 
                fontWeight: 'bold',
                letterSpacing: '1px'
              }}>
                ÉCOLE BOKELEALE/LISANGA
              </h1>
              <h2 style={{ 
                margin: '5px 0', 
                fontSize: '14pt', 
                fontWeight: 'normal',
                fontStyle: 'italic'
              }}>
                Complexe Scolaire Privé
              </h2>
              <p style={{ margin: '3px 0', fontSize: '10pt' }}>
                <strong>Adresse:</strong> Avenue de la Science N°5, Kinshasa - Gombe 
              </p>
              <p style={{ margin: '3px 0', fontSize: '10pt' }}>
                <strong>Tél:</strong> (+228) 22 21 21 21 • <strong>Email:</strong> contact@bokeleale.tg
              </p>
              <p style={{ margin: '3px 0', fontSize: '10pt' }}>
                <strong>Agrément:</strong> N°1234/MEN/CAB/SG du 01/01/2020
              </p>
            </div>
          </div>

          {/* Titre du document */}
          <div style={{ 
            marginTop: '15px',
            padding: '8px',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}>
            <h2 style={{ 
              margin: 0, 
              fontSize: '16pt', 
              color: '#1a237e',
              textTransform: 'uppercase'
            }}>
              QUITTANCE DE PAIEMENT DE FRAIS SCOLAIRES
            </h2>
            <p style={{ margin: '5px 0 0 0', fontSize: '10pt' }}>
              Document officiel - Conserver pour justificatif
            </p>
          </div>
        </div>

        {/* Informations de la quittance */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #ddd',
          borderRadius: '5px'
        }}>
          <div>
            <p style={{ margin: '5px 0' }}>
              <strong>N° Quittance:</strong> {paiement.reference}
            </p>
            <p style={{ margin: '5px 0' }}>
              <strong>Date d'émission:</strong> {formatDate(paiement.created_at)}
            </p>
            <p style={{ margin: '5px 0' }}>
              <strong>Caissier:</strong> {paiement.user.name}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              padding: '10px 20px',
              backgroundColor: '#1a237e',
              color: 'white',
              borderRadius: '5px',
              display: 'inline-block'
            }}>
              <div style={{ fontSize: '10pt', marginBottom: '2px' }}>MONTANT PAYÉ</div>
              <div style={{ fontSize: '18pt', fontWeight: 'bold' }}>
                {formatMontant(paiement.montant)}
              </div>
            </div>
          </div>
        </div>

        {/* Grille d'informations */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
          {/* Informations de l'élève */}
          <div style={{ 
            padding: '15px', 
            border: '1px solid #ccc',
            borderRadius: '5px',
            backgroundColor: '#fff'
          }}>
            <h3 style={{ 
              marginTop: 0, 
              marginBottom: '15px',
              paddingBottom: '5px',
              borderBottom: '1px solid #1a237e',
              color: '#1a237e',
              fontSize: '12pt'
            }}>
              <strong>INFORMATIONS DE L'ÉLÈVE</strong>
            </h3>
            
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '6px 0', fontWeight: 'bold', width: '35%' }}>Matricule:</td>
                  <td style={{ padding: '6px 0' }}>{paiement.eleve.matricule}</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 0', fontWeight: 'bold' }}>Nom complet:</td>
                  <td style={{ padding: '6px 0' }}>{paiement.eleve.nom_complet}</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 0', fontWeight: 'bold' }}>Classe:</td>
                  <td style={{ padding: '6px 0' }}>
                    {paiement.eleve.classe?.nom_classe || 'Non spécifiée'}
                    {paiement.eleve.classe?.cycle && ` (${paiement.eleve.classe.cycle})`}
                  </td>
                </tr>
                
                <tr>
                  <td style={{ padding: '6px 0', fontWeight: 'bold' }}>Téléphone:</td>
                  <td style={{ padding: '6px 0' }}>{paiement.eleve.telephone}</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 0', fontWeight: 'bold' }}>Adresse:</td>
                  <td style={{ padding: '6px 0' }}>{paiement.eleve.adresse}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Détails du paiement */}
          <div style={{ 
            padding: '15px', 
            border: '1px solid #ccc',
            borderRadius: '5px',
            backgroundColor: '#fff'
          }}>
            <h3 style={{ 
              marginTop: 0, 
              marginBottom: '15px',
              paddingBottom: '5px',
              borderBottom: '1px solid #1a237e',
              color: '#1a237e',
              fontSize: '12pt'
            }}>
              <strong>DÉTAILS DU PAIEMENT</strong>
            </h3>
            
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '6px 0', fontWeight: 'bold', width: '35%' }}>Tranche:</td>
                  <td style={{ padding: '6px 0' }}>
                    <strong>{paiement.tranche.nom_tranche}</strong>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 0', fontWeight: 'bold' }}>Montant tranche:</td>
                  <td style={{ padding: '6px 0' }}>{formatMontant(paiement.tranche.montant)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 0', fontWeight: 'bold' }}>Date limite:</td>
                  <td style={{ padding: '6px 0' }}>{formatDate(paiement.tranche.date_limite)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 0', fontWeight: 'bold' }}>Mode paiement:</td>
                  <td style={{ padding: '6px 0' }}>
                    <span style={{
                      padding: '2px 8px',
                      backgroundColor: paiement.mode_paiement === 'espèce' ? '#d4edda' : '#fff3cd',
                      borderRadius: '3px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      {paiement.mode_paiement}
                    </span>
                  </td>
                </tr>
                {paiement.numero_cheque && (
                  <tr>
                    <td style={{ padding: '6px 0', fontWeight: 'bold' }}>N° Chèque:</td>
                    <td style={{ padding: '6px 0', fontFamily: 'monospace' }}>{paiement.numero_cheque}</td>
                  </tr>
                )}
                <tr>
                  <td style={{ padding: '6px 0', fontWeight: 'bold' }}>Date paiement:</td>
                  <td style={{ padding: '6px 0', fontWeight: 'bold' }}>{formatDate(paiement.date_paiement)}</td>
                </tr>
                {paiement.commentaire && (
                  <tr>
                    <td style={{ padding: '6px 0', fontWeight: 'bold' }}>Commentaire:</td>
                    <td style={{ padding: '6px 0', fontStyle: 'italic' }}>{paiement.commentaire}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Montant en lettres */}
        <div style={{ 
          marginBottom: '20px',
          padding: '10px 15px',
          border: '1px dashed #666',
          borderRadius: '5px',
          backgroundColor: '#ffffe0'
        }}>
          <p style={{ margin: 0, textAlign: 'center' }}>
            <strong>Arrêtée la présente quittance à la somme de:</strong><br/>
            <span style={{ fontSize: '11pt', textTransform: 'uppercase' }}>
              {/* Vous pouvez ajouter une fonction de conversion nombre → lettres ici */}
              {formatMontant(paiement.montant).replace('$US', 'USD')} 
              {/* Soit: "Trente mille F" si vous implémentez la conversion */}
            </span>
          </p>
        </div>

        {/* Signatures */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '30px',
          marginTop: '40px',
          marginBottom: '20px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              height: '1px', 
              backgroundColor: '#000', 
              margin: '40px 0 10px 0' 
            }}></div>
            <p style={{ margin: 0, fontWeight: 'bold' }}>Signature du Caissier</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '10pt' }}>{paiement.user.name}</p>
            <p style={{ margin: 0, fontSize: '9pt' }}>Cachet et signature</p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              height: '1px', 
              backgroundColor: '#000', 
              margin: '40px 0 10px 0' 
            }}></div>
            <p style={{ margin: 0, fontWeight: 'bold' }}>Signature du Responsable</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '10pt' }}>École BOKELEALE/LISANGA</p>
            <p style={{ margin: 0, fontSize: '9pt' }}>Cachet de l'établissement</p>
          </div>
        </div>

        {/* Pied de page */}
        <div style={{ 
          marginTop: '30px', 
          paddingTop: '10px', 
          borderTop: '1px solid #ccc',
          fontSize: '9pt', 
          color: '#666',
          textAlign: 'center'
        }}>
          <p style={{ margin: '3px 0' }}>
            <strong>Important:</strong> Cette quittance est un reçu officiel. Conservez-la pour toute réclamation.
          </p>
          <p style={{ margin: '3px 0' }}>
            Document généré le {new Date().toLocaleDateString('fr-FR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          <p style={{ margin: '3px 0', fontStyle: 'italic' }}>
            École BOKELEALE/LISANGA - Système de Gestion Scolaire • Version 1.0
          </p>
        </div>

        {/* Filigrane de sécurité (optionnel) */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-45deg)',
          opacity: 0.1,
          zIndex: -1,
          fontSize: '60pt',
          fontWeight: 'bold',
          color: '#ccc',
          pointerEvents: 'none'
        }}>
          QUITTANCE
        </div>
      </div>
    );
  }
);

PrintPaiementFrais.displayName = 'PrintPaiementFrais';

export default PrintPaiementFrais;