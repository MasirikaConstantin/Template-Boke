<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Rapport de Recouvrement - {{ $tranche->nom_tranche }}</title>
    <style>
        @page {
            margin: 20px;
        }
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 10px;
            line-height: 1.4;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #3B82F6;
            padding-bottom: 10px;
        }
        .header h1 {
            color: #1E40AF;
            font-size: 16px;
            margin: 0;
        }
        .header .subtitle {
            color: #6B7280;
            font-size: 12px;
            margin-top: 5px;
        }
        .info-box {
            background-color: #F3F4F6;
            border-radius: 4px;
            padding: 10px;
            margin-bottom: 15px;
            border-left: 4px solid #3B82F6;
        }
        .stats {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            flex-wrap: wrap;
            gap: 10px;
        }
        .stat-item {
            flex: 1;
            min-width: 150px;
            background: white;
            border: 1px solid #E5E7EB;
            border-radius: 6px;
            padding: 10px;
            text-align: center;
        }
        .stat-value {
            font-size: 14px;
            font-weight: bold;
            color: #1E40AF;
        }
        .stat-label {
            font-size: 9px;
            color: #6B7280;
            text-transform: uppercase;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th {
            background-color: #3B82F6;
            color: white;
            font-weight: bold;
            padding: 8px;
            text-align: left;
            font-size: 9px;
            border: 1px solid #1E40AF;
        }
        td {
            padding: 6px;
            border: 1px solid #E5E7EB;
            font-size: 9px;
            vertical-align: middle;
        }
        .row-even {
            background-color: #F8FAFC;
        }
        .row-total {
            background-color: #FEF3C7;
            font-weight: bold;
            border-top: 2px solid #D97706;
            border-bottom: 2px solid #D97706;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .text-danger {
            color: #DC2626;
        }
        .text-success {
            color: #059669;
        }
        .text-warning {
            color: #D97706;
        }
        .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 8px;
            font-weight: bold;
        }
        .badge-success {
            background-color: #D1FAE5;
            color: #059669;
        }
        .badge-warning {
            background-color: #FEF3C7;
            color: #D97706;
        }
        .badge-danger {
            background-color: #FEE2E2;
            color: #DC2626;
        }
        .badge-info {
            background-color: #DBEAFE;
            color: #1D4ED8;
        }
        .progress-bar {
            width: 100%;
            height: 6px;
            background-color: #E5E7EB;
            border-radius: 3px;
            overflow: hidden;
            margin-top: 2px;
        }
        .progress-fill {
            height: 100%;
            background-color: #10B981;
        }
        .footer {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #E5E7EB;
            font-size: 8px;
            color: #6B7280;
            text-align: center;
        }
        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>RAPPORT DE RECOUVREMENT</h1>
        <div class="subtitle">{{ $tranche->nom_tranche }}</div>
    </div>

    <div class="info-box">
        <strong>Configuration:</strong> {{ $tranche->configuration_frais->nom_frais ?? 'N/A' }} |
        <strong>Date limite:</strong> {{ $dateLimite }} |
        <strong>Montant par élève:</strong> {{ number_format($tranche->montant, 0, ',', ' ') }} CDF |
        <strong>Généré le:</strong> {{ $dateGeneration }}
    </div>

    <div class="stats">
        <div class="stat-item">
            <div class="stat-value">{{ $stats['total_eleves'] }}</div>
            <div class="stat-label">Élèves concernés</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">{{ number_format($stats['total_dette'], 0, ',', ' ') }} CDF</div>
            <div class="stat-label">Montant total dû</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">{{ number_format($stats['total_paye'], 0, ',', ' ') }} CDF</div>
            <div class="stat-label">Montant payé</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">{{ round($stats['taux_recouvrement'], 1) }}%</div>
            <div class="stat-label">Taux de recouvrement</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">{{ number_format($stats['total_reste'], 0, ',', ' ') }} CDF</div>
            <div class="stat-label">Reste à payer</div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th width="4%">N°</th>
                <th width="10%">Référence</th>
                <th width="20%">Nom de l'élève</th>
                <th width="12%">Classe</th>
                <th width="10%" class="text-right">Montant total</th>
                <th width="10%" class="text-right">Montant payé</th>
                <th width="10%" class="text-right">Reste à payer</th>
                <th width="8%" class="text-center">% Payé</th>
                <th width="8%" class="text-center">Statut</th>
                <th width="8%" class="text-center">Dernier paiement</th>
            </tr>
        </thead>
        <tbody>
            @foreach($dettes as $index => $dette)
            <tr class="{{ $index % 2 == 0 ? 'row-even' : '' }}">
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ $dette['ref'] }}</td>
                <td>{{ $dette['nom_complet'] }}</td>
                <td>{{ $dette['classe'] }}</td>
                <td class="text-right">{{ number_format($dette['montant_total'], 0, ',', ' ') }} CDF</td>
                <td class="text-right">{{ number_format($dette['montant_paye'], 0, ',', ' ') }} CDF</td>
                <td class="text-right {{ $dette['reste_a_payer'] > 0 ? 'text-danger' : 'text-success' }}">
                    {{ number_format($dette['reste_a_payer'], 0, ',', ' ') }} CDF
                </td>
                <td class="text-center">
                    {{ round($dette['pourcentage_paye'], 1) }}%
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: {{ $dette['pourcentage_paye'] }}%"></div>
                    </div>
                </td>
                <td class="text-center">
                    @php
                        $statutClass = 'badge-info';
                        $statutText = 'En cours';
                        
                        if($dette['est_regle']) {
                            $statutClass = 'badge-success';
                            $statutText = 'Réglé';
                        } elseif(isset($dette['jours_restants'])) {
                            if($dette['jours_restants'] < 0) {
                                $statutClass = 'badge-danger';
                                $statutText = 'En retard';
                            } elseif($dette['jours_restants'] <= 7) {
                                $statutClass = 'badge-warning';
                                $statutText = 'Urgent';
                            }
                        }
                    @endphp
                    <span class="badge {{ $statutClass }}">{{ $statutText }}</span>
                </td>
                <td class="text-center">
                    @if($dette['date_dernier_paiement'])
                        {{ \Carbon\Carbon::parse($dette['date_dernier_paiement'])->format('d/m/Y') }}
                    @else
                        Aucun
                    @endif
                </td>
            </tr>
            @endforeach
            
            <!-- Ligne des totaux -->
            <tr class="row-total">
                <td colspan="4" class="text-right"><strong>TOTAL</strong></td>
                <td class="text-right"><strong>{{ number_format($stats['total_dette'], 0, ',', ' ') }} CDF</strong></td>
                <td class="text-right"><strong>{{ number_format($stats['total_paye'], 0, ',', ' ') }} CDF</strong></td>
                <td class="text-right"><strong>{{ number_format($stats['total_reste'], 0, ',', ' ') }} CDF</strong></td>
                <td class="text-center"><strong>{{ round($stats['taux_recouvrement'], 1) }}%</strong></td>
                <td colspan="2"></td>
            </tr>
        </tbody>
    </table>

    <div class="footer">
        Document généré automatiquement le {{ $dateGeneration }} | 
        École XYZ - Système de Gestion Scolaire |
        Page 1/1
    </div>
</body>
</html>