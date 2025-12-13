
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relevé de paiements - {{ $responsable->nom_complet }}</title>
    <style>
        @page {
            margin: 20px;
        }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 15px;
        }
        .header h1 {
            font-size: 24px;
            color: #1e40af;
            margin: 0;
        }
        .header h2 {
            font-size: 18px;
            color: #4b5563;
            margin: 5px 0 0 0;
        }
        .info-section {
            margin-bottom: 25px;
            padding: 15px;
            background-color: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
        }
        .info-item {
            margin-bottom: 5px;
        }
        .info-label {
            font-weight: 600;
            color: #4b5563;
        }
        .stats-flex {
            display: flex;
            f-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin: 20px 0;
        }
        .stat-box {
            text-align: center;
            padding: 10px;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            background-color: #ffffff;
        }
        .stat-value {
            font-size: 20px;
            font-weight: bold;
            color: #1e40af;
        }
        .stat-label {
            font-size: 10px;
            color: #6b7280;
            text-transform: uppercase;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .table th {
            background-color: #f3f4f6;
            border: 1px solid #d1d5db;
            padding: 8px;
            text-align: left;
            font-weight: 600;
            color: #374151;
        }
        .table td {
            border: 1px solid #e5e7eb;
            padding: 8px;
        }
        .table tr:nth-child(even) {
            background-color: #f9fafb;
        }
        .montant {
            font-weight: 600;
            color: #059669;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 10px;
            color: #6b7280;
        }
        .eleve-stats {
            margin: 15px 0;
            padding: 10px;
            background-color: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 6px;
        }
        .filters {
            background-color: #fef3c7;
            padding: 10px;
            border-radius: 6px;
            margin-bottom: 15px;
            font-size: 10px;
        }
        .filter-item {
            display: inline-block;
            margin-right: 15px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>RELEVÉ DE PAIEMENTS</h1>
        <h2>Responsable: {{ $responsable->nom_complet }}</h2>
        <p>Généré le: {{ $dateGeneration }}</p>
    </div>

    @if(!empty($filters))
    <div class="filters">
        <strong>Filtres appliqués:</strong>
        @foreach($filters as $key => $value)
            @if($key === 'eleve_id')
                <span class="filter-item">Élève: {{ $eleve = \App\Models\Eleve::find($value)->nom_complet ?? 'N/A' }}</span>
            @elseif($key === 'tranche_id')
                <span class="filter-item">Tranche: {{ $tranche = \App\Models\Tranche::find($value)->nom_tranche ?? 'N/A' }}</span>
            @elseif($key === 'annee_scolaire')
                <span class="filter-item">Année: {{ $value }}</span>
            @elseif($key === 'date_debut')
                <span class="filter-item">Début: {{ \Carbon\Carbon::parse($value)->format('d/m/Y') }}</span>
            @elseif($key === 'date_fin')
                <span class="filter-item">Fin: {{ \Carbon\Carbon::parse($value)->format('d/m/Y') }}</span>
            @endif
        @endforeach
    </div>
    @endif

    <div class="info-section">
        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">Nom complet:</span> {{ $responsable->nom_complet }}
            </div>
            <div class="info-item">
                <span class="info-label">Téléphone:</span> {{ $responsable->telephone_1 }}
            </div>
            <div class="info-item">
                <span class="info-label">Email:</span> {{ $responsable->email ?? 'Non renseigné' }}
            </div>
            <div class="info-item">
                <span class="info-label">Adresse:</span> {{ $responsable->adresse ?? 'Non renseignée' }}
            </div>
        </div>
    </div>

    <table class="stats-table" width="100%" cellspacing="0" cellpadding="0">
    <tr>
        <td class="stat-box">
            <div class="stat-value">{{ number_format($totalMontant, 0, ',', ' ') }} $</div>
            <div class="stat-label">Montant total</div>
        </td>
        <td class="stat-box">
            <div class="stat-value">{{ $paiements->count() }}</div>
            <div class="stat-label">Paiements</div>
        </td>
        <td class="stat-box">
            <div class="stat-value">{{ $statsParEleve->count() }}</div>
            <div class="stat-label">Élèves concernés</div>
        </td>
        <td class="stat-box">
            <div class="stat-value">
                {{ $paiements->count() > 0 ? number_format($totalMontant / $paiements->count(), 0, ',', ' ') : 0 }} $
            </div>
            <div class="stat-label">Moyenne par paiement</div>
        </td>
    </tr>
</table>


    <!-- Statistiques par élève -->
    @if($statsParEleve->count() > 0)
    <div class="eleve-stats">
        <h3 style="margin: 0 0 10px 0; font-size: 14px;">Récapitulatif par élève:</h3>
        <table class="table">
            <thead>
                <tr>
                    <th>Élève</th>
                    <th>Matricule</th>
                    <th>Classe</th>
                    <th>Total payé</th>
                </tr>
            </thead>
            <tbody>
                @foreach($statsParEleve as $stat)
                <tr>
                    <td>{{ $stat['nom_complet'] }}</td>
                    <td>{{ $stat['matricule'] }}</td>
                    <td>{{ $stat['classe'] }}</td>
                    <td class="montant">{{ number_format($stat['total_paye'], 0, ',', ' ') }} $</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    <!-- Détail des paiements -->
    <h3 style="margin: 20px 0 10px 0; font-size: 16px;">Détail des paiements:</h3>
    <table class="table">
        <thead>
            <tr>
                <th>Date</th>
                <th>Élève</th>
                <th>Matricule</th>
                <th>Tranche</th>
                <th>Année</th>
                <th>Montant</th>
                <th>Mode</th>
                <th>Référence</th>
            </tr>
        </thead>
        <tbody>
            @foreach($paiements as $paiement)
            <tr>
                <td>{{ \Carbon\Carbon::parse($paiement->date_paiement)->format('d/m/Y') }}</td>
                <td>{{ $paiement->eleve->nom_complet }}</td>
                <td>{{ $paiement->eleve->matricule }}</td>
                <td>{{ $paiement->tranche->nom_tranche }}</td>
                <td>{{ $paiement->tranche->annee_scolaire }}</td>
                <td class="montant">{{ number_format($paiement->montant, 0, ',', ' ') }} $</td>
                <td>
                    @switch($paiement->mode_paiement)
                        @case('especes')
                            Espèces
                            @break
                        @case('cheque')
                            Chèque
                            @break
                        @case('virement')
                            Virement
                            @break
                        @case('mobile_money')
                            Mobile Money
                            @break
                        @default
                            {{ $paiement->mode_paiement }}
                    @endswitch
                </td>
                <td>{{ $paiement->reference }}</td>
            </tr>
            @endforeach
            <!-- Total -->
            <tr style="background-color: #e5e7eb; font-weight: bold;">
                <td colspan="5" style="text-align: right;">TOTAL GÉNÉRAL:</td>
                <td class="montant" style="color: #059669;">{{ number_format($totalMontant, 0, ',', ' ') }} $</td>
                <td colspan="2"></td>
            </tr>
        </tbody>
    </table>

    <div class="footer">
        <p>Document généré automatiquement par le système de gestion scolaire</p>
        <p>Ce relevé constitue une attestation officielle des paiements effectués</p>
        <p>© {{ date('Y') }} - École - Tous droits réservés</p>
    </div>
</body>
</html>