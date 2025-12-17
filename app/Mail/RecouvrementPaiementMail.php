<?php

namespace App\Mail;

use App\Models\Eleve;
use App\Models\Tranche;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class RecouvrementPaiementMail extends Mailable
{
    use Queueable, SerializesModels;

    public Eleve $eleve;
    public Tranche $tranche;
    public float $totalPaye;
    public float $resteAPayer;

    public function __construct(
        Eleve $eleve,
        Tranche $tranche,
        float $totalPaye,
        float $resteAPayer
    ) {
        $this->eleve = $eleve;
        $this->tranche = $tranche;
        $this->totalPaye = $totalPaye;
        $this->resteAPayer = $resteAPayer;
    }

    public function build()
    {
        return $this->subject('Rappel de paiement – ' . $this->eleve->nom_complet)
            ->view('emails.recouvrement-paiement');
    }
}
