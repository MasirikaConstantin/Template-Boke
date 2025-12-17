<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Confirmation de paiement</title>
</head>
<body style="font-family: Arial, sans-serif; background:#f7f7f7; padding:20px">

<div style="max-width:600px; margin:auto; background:#ffffff; padding:20px; border-radius:6px">

    <h2 style="color:#2c3e50">Confirmation de paiement</h2>

    <p>Bonjour,</p>

    <p>
        Nous vous confirmons la réception d’un paiement pour l’élève :
    </p>

    <ul>
        <li><strong>Nom :</strong> {{ $paiement->eleve->nom_complet }}</li>
        <li><strong>Classe :</strong> {{ $paiement->eleve->classe->nom_classe ?? '-' }}</li>
        <li><strong>Tranche :</strong> {{ $paiement->tranche->nom_tranche }}</li>
        <li><strong>Montant payé :</strong> {{ number_format($paiement->montant, 0, ',', ' ') }} $</li>
        <li><strong>Date :</strong> {{ \Carbon\Carbon::parse($paiement->date_paiement)->format('d/m/Y') }}</li>
    </ul>

    <hr>

    <p>
        <strong>Total déjà payé pour cette tranche :</strong>
        {{ number_format($totalPaye, 0, ',', ' ') }} $
    </p>

    <p>
        <strong>Reste à payer :</strong>
        {{ number_format($resteAPayer, 0, ',', ' ') }} $
    </p>

    @if ($resteAPayer <= 0)
        <p style="color:green"><strong>✅ Tranche totalement soldée.</strong></p>
    @else
        <p style="color:#e67e22"><strong>⚠️ Paiement partiel – solde restant.</strong></p>
    @endif

    <br>

    <p style="font-size:12px; color:#888">
        Ceci est un message automatique. Merci de ne pas y répondre.
    </p>

</div>

</body>
</html>
